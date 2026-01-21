"use server";
import { currencyList } from "../../components/brandsPartner/currency";
import { prisma } from "../db";
import { getSession } from "./userAction/session";

// Helper function to get currency symbol
function getCurrencySymbol(currency) {
  const symbols = currencyList.find((c) => c.code === currency)?.symbol || "$";
  return symbols;
}

// Calculate gift card status
function calculateStatus(voucherCode) {
  if (voucherCode.remainingValue === 0) {
    return "CLAIMED";
  }

  if (voucherCode.expiresAt && new Date(voucherCode.expiresAt) < new Date()) {
    return "EXPIRED";
  }
  if (
    !voucherCode.isRedeemed &&
    voucherCode.remainingValue === voucherCode.originalValue
  ) {
    return "UNCLAIMED";
  }
  if (
    voucherCode.remainingValue > 0 &&
    voucherCode.remainingValue < voucherCode.originalValue
  ) {
    return "ACTIVE";
  }
  if (voucherCode.remainingValue === 0) {
    return "CLAIMED";
  }
  return "ACTIVE";
}

// Main function to fetch gift cards
export async function getGiftCards(filters) {
  try {
    const session = await getSession();
    const {
      status,
      searchQuery,
      page = 1,
      pageSize = 6,
      startDate,
      endDate,
      userEmail,
    } = filters;

    // Build where clause based on user role and tab selection
    const whereClause = {};

    // If user is not admin, filter based on sent/received
    if (session.user.role !== "ADMIN") {
      if (status === "sent") {
        whereClause.order = {
          userId: session.user.id,
        };
      } else if (status === "received") {
        whereClause.order = {
          receiverDetail: {
            email: session.user.email,
          },
        };
      } else if (status === "all") {
        whereClause.OR = [
          {
            order: {
              userId: session.user.id,
            },
          },
          {
            order: {
              receiverDetail: {
                email: session.user.email,
              },
            },
          },
        ];
      } else if (status === "expired") {
        whereClause.expiresAt = {
          lt: new Date(),
        };
        whereClause.OR = [
          {
            order: {
              userId: session.user.id,
            },
          },
          {
            order: {
              receiverDetail: {
                email: session.user.email,
              },
            },
          },
        ];
      }
    }

    // Search filter
    if (searchQuery) {
      const searchConditions = [
        { code: { contains: searchQuery, mode: "insensitive" } },
        {
          order: {
            user: {
              email: { contains: searchQuery, mode: "insensitive" },
            },
          },
        },
        {
          order: {
            receiverDetail: {
              email: { contains: searchQuery, mode: "insensitive" },
            },
          },
        },
        {
          order: {
            brand: {
              brandName: { contains: searchQuery, mode: "insensitive" },
            },
          },
        },
        {
          order: {
            orderNumber: { contains: searchQuery, mode: "insensitive" },
          },
        },
      ];

      if (whereClause.OR) {
        whereClause.AND = [{ OR: whereClause.OR }, { OR: searchConditions }];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    // Fetch voucher codes with related data INCLUDING ALL REDEMPTIONS
    const voucherCodes = await prisma.voucherCode.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            receiverDetail: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            brand: {
              select: {
                brandName: true,
                domain: true,
              },
            },
          },
        },
        // Include GiftCard relation to get the code if needed
        giftCard: {
          select: {
            code: true,
          },
        },
        redemptions: {
          orderBy: {
            redeemedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Get total count for pagination
    const totalCount = await prisma.voucherCode.count({
      where: whereClause,
    });

    // Transform data to match component structure
    const giftCards = voucherCodes.map((vc) => {
      const calculatedStatus = calculateStatus(vc);
      const spentPercentage =
        vc.originalValue > 0
          ? Math.round(
              ((vc.originalValue - vc.remainingValue) / vc.originalValue) * 100,
            )
          : 0;

      // Determine if gift was sent or received by current user
      const isSent = vc.order.userId === session.user.id;
      const isReceived = vc.order.receiverDetail?.email === session.user.email;

      // Get currency and symbol from order
      const currency = vc.order.currency || "USD";
      const currencySymbol = getCurrencySymbol(currency);

      // IMPORTANT: Show full code only if user is the receiver
      // The code from VoucherCode table is the full unmasked code
      const fullCode = vc?.giftCard?.code; // This is the full code from VoucherCode table
      const displayCode = isReceived
        ? fullCode // Show full code to receiver
        : `**** **** **** ${fullCode.slice(-4)}`; // Mask code for sender

      return {
        id: vc.id,
        orderNumber: vc.order.orderNumber,
        code: displayCode, // Show full or masked based on receiver status
        fullCode: fullCode, // Always keep full code for copying (frontend should handle visibility)
        status: calculatedStatus,
        user: {
          name: `${vc.order.user.firstName} ${vc.order.user.lastName}`,
          email: vc.order.user.email,
        },
        receiverName: vc.order.receiverDetail?.name || "N/A",
        receiverEmail: vc.order.receiverDetail?.email || "N/A",
        receiverPhone: vc.order.receiverDetail?.phone || "N/A",
        totalAmount: vc.originalValue,
        remaining: vc.remainingValue,
        spent: spentPercentage,
        currency: currency,
        currencySymbol: currencySymbol,
        denominationType: "fixed",
        lastRedemption: vc.redemptions[0]?.redeemedAt
          ? new Date(vc.redemptions[0].redeemedAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : null,
        purchaseDate: new Date(vc.createdAt).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        expires: vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : null,
        expiresAtRaw: vc.expiresAt,
        brandName: vc.order.brand.brandName,
        brandDomain: vc.order.brand.domain || null,
        isSent: isSent,
        isReceived: isReceived,
        redemptions: vc.redemptions.map((redemption) => ({
          id: redemption.id,
          amountRedeemed: redemption.amountRedeemed,
          balanceAfter: redemption.balanceAfter,
          redeemedAt: redemption.redeemedAt,
          transactionId: redemption.transactionId,
          storeUrl: redemption.storeUrl,
        })),
      };
    });

    return JSON.parse(
      JSON.stringify({
        success: true,
        data: giftCards,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
        userRole: session.user.role,
        userId: session.user.id,
      }),
    );
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch gift cards",
      data: [],
      pagination: {
        page: 1,
        pageSize: 6,
        totalCount: 0,
        totalPages: 0,
      },
    };
  }
}

// Export statistics for dashboard
export async function getGiftCardStats() {
  try {
    const session = await getSession();

    // Base conditions for sent and received
    const sentCondition = {
      order: {
        userId: session.user.id,
      },
    };

    const receivedCondition = {
      order: {
        receiverDetail: {
          email: session.user.email,
        },
      },
    };

    const allCondition = {
      OR: [sentCondition, receivedCondition],
    };

    if (session.user.role === "ADMIN") {
      // Admin sees all
      const [total, active, claimed, unclaimed, expired] = await Promise.all([
        prisma.voucherCode.count(),
        prisma.voucherCode.count({
          where: {
            remainingValue: { gt: 0 },
            expiresAt: { gt: new Date() },
          },
        }),
        prisma.voucherCode.count({
          where: {
            remainingValue: 0,
          },
        }),
        prisma.voucherCode.count({
          where: {
            isRedeemed: false,
            expiresAt: { gt: new Date() },
          },
        }),
        prisma.voucherCode.count({
          where: {
            expiresAt: { lt: new Date() },
          },
        }),
      ]);

      return JSON.parse(
        JSON.stringify({
          success: true,
          stats: {
            total,
            active,
            claimed,
            unclaimed,
            expired,
          },
        }),
      );
    } else {
      // Regular user sees sent + received
      const [total, active, claimed, unclaimed, expired, sent, received] =
        await Promise.all([
          prisma.voucherCode.count({ where: allCondition }),
          prisma.voucherCode.count({
            where: {
              ...allCondition,
              remainingValue: { gt: 0 },
              expiresAt: { gt: new Date() },
            },
          }),
          prisma.voucherCode.count({
            where: {
              ...allCondition,
              remainingValue: 0,
            },
          }),
          prisma.voucherCode.count({
            where: {
              ...allCondition,
              isRedeemed: false,
              expiresAt: { gt: new Date() },
            },
          }),
          prisma.voucherCode.count({
            where: {
              ...allCondition,
              expiresAt: { lt: new Date() },
            },
          }),
          prisma.voucherCode.count({ where: sentCondition }),
          prisma.voucherCode.count({ where: receivedCondition }),
        ]);

      return JSON.parse(
        JSON.stringify({
          success: true,
          stats: {
            total,
            active,
            claimed,
            unclaimed,
            expired,
            sent,
            received,
          },
        }),
      );
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}
