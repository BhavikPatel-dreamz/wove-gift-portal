"use server";

import { PrismaClient } from "@prisma/client";
import { getSession } from "./userAction/session";

const prisma = new PrismaClient();

// Helper functions
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function generateTokenizedLink(voucherCodeId) {
  // Generate secure tokenized link for WhatsApp delivery
  const token = Buffer.from(
    `${voucherCodeId}-${Date.now()}-${Math.random()}`
  ).toString("base64url");
  return `${
    process.env.NEXT_PUBLIC_APP_URL || "https://app.wove.com"
  }/redeem/${token}`;
}

function calculateExpiryDate(expiryPolicy, expiryValue) {
  const now = new Date();

  switch (expiryPolicy) {
    case "noExpiry":
      return null;
    case "fixedDate":
      return expiryValue ? new Date(expiryValue) : null;
    case "fromPurchase":
    case "fromActivation":
      if (expiryValue) {
        const days = parseInt(expiryValue, 10);
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + days);
        return expiryDate;
      }
      return null;
    default:
      return null;
  }
}

export const createOrder = async (orderData) => {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) return { error: "User not authenticated." };

  const {
    selectedBrand,
    selectedAmount,
    selectedOccasion,
    selectedSubCategory,
    personalMessage,
    deliveryMethod,
    deliveryDetails,
    selectedPaymentMethod,
    selectedTiming,
    quantity = 1,
    customImageUrl,
    customVideoUrl,
  } = orderData;

  try {
    if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
      return { error: "Brand does not have voucher configuration." };
    }

    const voucherConfig = selectedBrand.vouchers[0];

    // Create receiver detail
    const receiver = await prisma.receiverDetail.create({
      data: {
        name: deliveryDetails.recipientFullName,
        email: deliveryDetails.recipientEmailAddress || null,
        phone: deliveryDetails.recipientWhatsAppNumber || null,
      },
    });

    const scheduledFor =
      selectedTiming?.type === "scheduled" && selectedTiming?.dateTime
        ? new Date(selectedTiming.dateTime)
        : null;

    // Order amounts
    const amount = selectedAmount.value;
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        brandId: selectedBrand.id,
        occasionId: selectedOccasion,
        subCategoryId: selectedSubCategory?.isCustom
          ? null
          : selectedSubCategory?.id,
        customCardId: selectedSubCategory?.isCustom
          ? selectedSubCategory?.id
          : null,
        userId: String(userId),
        receiverDetailId: receiver.id,
        amount,
        quantity,
        subtotal,
        discount,
        totalAmount,
        currency: selectedAmount.currency || "USD",
        message: personalMessage || "",
        customImageUrl: customImageUrl || null,
        customVideoUrl: customVideoUrl || null,
        senderName: deliveryDetails.yourFullName || null,
        deliveryMethod: deliveryMethod || "whatsapp",
        sendType:
          selectedTiming?.type === "immediate"
            ? "sendImmediately"
            : "scheduleLater",
        scheduledFor,
        paymentMethod: selectedPaymentMethod || "stripe",
        paymentStatus: "PENDING",
        redemptionStatus: "Issued",
        isActive: true,
        senderEmail: deliveryDetails.yourEmailAddress || null,
      },
    });

    // Prepare gift card payload
    const [firstName, ...lastName] = receiver.name.split(" ");
    const giftCardData = {
      customerEmail: receiver.email,
      firstName: firstName,
      lastName: lastName.join(" "),
      note: `Order ${order.orderNumber}`,
      denominationValue:
        voucherConfig.denominationType === "fixed"
          ? selectedAmount.value
          : order.amount,
    };

    if (!selectedBrand.domain || !receiver.email) {
      await prisma.order.delete({ where: { id: order.id } });
      return {
        error: "Missing shop domain or receiver email for gift card creation.",
      };
    }

    // Call giftcard API
    const giftCardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/giftcard?shop=${selectedBrand.domain}&denominationType=${voucherConfig.denominationType}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftCardData),
      }
    );

    if (!giftCardResponse.ok) {
      const errorData = await giftCardResponse.json();
      await prisma.order.delete({ where: { id: order.id } });
      throw new Error(
        `Gift card creation failed: ${errorData.error || "Unknown error"}`
      );
    }

    const giftCardResult = await giftCardResponse.json();
    const shopifyGiftCard = giftCardResult.gift_card;

    if (!shopifyGiftCard?.maskedCode) {
      await prisma.order.delete({ where: { id: order.id } });
      throw new Error("Shopify gift card was created but no code returned.");
    }

    // Upsert local gift card
    const giftCardInDb = await prisma.giftCard.upsert({
      where: { shopifyId: shopifyGiftCard.id },
      update: {
        balance: parseFloat(shopifyGiftCard.balance.amount),
        customerEmail: receiver.email,
        updatedAt: new Date(),
      },
      create: {
        shop: selectedBrand.domain,
        shopifyId: shopifyGiftCard.id,
        code: shopifyGiftCard.maskedCode,
        initialValue: parseFloat(shopifyGiftCard.balance.amount),
        balance: parseFloat(shopifyGiftCard.balance.amount),
        customerEmail: receiver.email,
        note: `Order ${order.orderNumber}`,
        isActive: true,
        isVirtual: true,
      },
    });

    // Create voucher code linked to gift card
    const expiresAt = calculateExpiryDate(
      voucherConfig.expiryPolicy,
      voucherConfig.expiryValue
    );

    const voucherCode = await prisma.voucherCode.create({
      data: {
        code: shopifyGiftCard.maskedCode,
        orderId: order.id,
        voucherId: voucherConfig.id,
        originalValue: amount,
        remainingValue: amount,
        expiresAt,
        isRedeemed: false,
        shopifyGiftCardId: giftCardInDb.id,
        shopifyShop: selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    // Generate tokenized link
    const tokenizedLink = generateTokenizedLink(voucherCode.id);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    try {
      const periodStart = new Date(order.createdAt);
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(order.createdAt);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);
      periodEnd.setHours(23, 59, 59, 999);

      const settlementPeriod = `${order.createdAt.getFullYear()}-${String(
        order.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;

      // Check for existing settlement for this brand + period
      const existingSettlement = await prisma.settlements.findFirst({
        where: {
          brandId: selectedBrand.id,
          settlementPeriod,
        },
      });

      if (existingSettlement) {
        // Update the existing settlement totals
        await prisma.settlements.update({
          where: { id: existingSettlement.id },
          data: {
            totalSold: existingSettlement.totalSold + quantity,
            totalSoldAmount: existingSettlement.totalSoldAmount + totalAmount,
            outstanding: existingSettlement.outstanding + quantity,
            outstandingAmount:
              existingSettlement.outstandingAmount + totalAmount,
            updatedAt: new Date(),
          },
        });

        console.log(
          `🔄 Updated existing settlement for brand ${selectedBrand.name} (${settlementPeriod})`
        );
      } else {
        // Create a new settlement entry
        await prisma.settlements.create({
          data: {
            brandId: selectedBrand.id,
            settlementPeriod,
            periodStart,
            periodEnd,
            totalSold: quantity,
            totalSoldAmount: totalAmount,
            totalRedeemed: 0,
            redeemedAmount: 0,
            outstanding: quantity,
            outstandingAmount: totalAmount,
            commissionAmount: 0,
            breakageAmount: 0,
            vatAmount: 0,
            netPayable: 0,
            status: "Pending",
          },
        });
        console.log(
          `✅ Created new settlement for brand ${selectedBrand.name} (${settlementPeriod})`
        );
      }
    } catch (settlementError) {
      console.error(
        "⚠️ Failed to create or update settlement entry:",
        settlementError
      );
    }
    
    // Create delivery log
    await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId: voucherCode.id,
        method: deliveryMethod || "whatsapp",
        recipient:
          deliveryMethod === "email"
            ? deliveryDetails.recipientEmailAddress
            : deliveryDetails.recipientWhatsAppNumber,
        status: scheduledFor ? "PENDING" : "PENDING",
        attemptCount: 0,
      },
    });

    return {
      success: true,
      order,
      voucherCode,
      giftCard: giftCardInDb,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: error.message };
  }
};


export async function getOrders(params = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      paymentStatus = "",
      brand = "",
      dateFrom = "",
      dateTo = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {};

    // Search functionality
    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { senderName: { contains: search, mode: "insensitive" } },
        {
          voucherCodes: {
            some: {
              code: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          receiverDetail: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Redemption status filter
    if (status) {
      whereClause.redemptionStatus = status;
    }

    // Payment status filter
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    // Brand filter
    if (brand) {
      whereClause.brand = {
        brandName: brand,
      };
    }

    // Date range filters
    if (dateFrom) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(dateFrom),
      };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: endDate,
      };
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [orders, totalCount, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limitNum,
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
              logo: true,
            },
          },
          receiverDetail: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          voucherCodes: {
            select: {
              id: true,
              code: true,
              isRedeemed: true,
              remainingValue: true,
              originalValue: true,
              expiresAt: true,
            },
          },
          occasion: {
            select: {
              name: true,
              emoji: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: whereClause,
      }),
      prisma.order.groupBy({
        by: ["redemptionStatus"],
        _count: true,
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Calculate statistics
    const stats = statusCounts.reduce((acc, curr) => {
      acc[curr.redemptionStatus] = curr._count;
      return acc;
    }, {});

    return {
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
        startIndex: skip + 1,
        endIndex: Math.min(skip + limitNum, totalCount),
      },
      statistics: {
        total: totalCount,
        ...stats,
      },
      filters: {
        search,
        status,
        paymentStatus,
        brand,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
      status: 500,
    };
  }
}

export async function getOrderById(orderId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        brand: {
          select: { id: true, brandName: true, logo: true, website: true },
        },
        receiverDetail: true,
        occasion: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        occasionCategory: true,
        customCard: true,
        voucherCodes: {
          include: {
            redemptions: { orderBy: { redeemedAt: "desc" } },
          },
        },
        deliveryLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found", status: 404 };
    }

    // Compute redeemedAt for the order based on its voucher codes
    const redeemedDates = order.voucherCodes
      .map((vc) => vc.redeemedAt) // voucher-level redeemedAt
      .filter(Boolean); // remove nulls

    const orderRedeemedAt =
      redeemedDates.length > 0
        ? new Date(Math.max(...redeemedDates.map((d) => d.getTime()))) // latest redeemedAt
        : null;

    // Attach redeemedAt directly to the order object
    const orderWithRedeemedAt = { ...order, redeemedAt: orderRedeemedAt };

    return { success: true, data: orderWithRedeemedAt };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    return {
      success: false,
      message: "Failed to fetch order",
      error: error.message,
      status: 500,
    };
  }
}

export async function updateOrderPaymentStatus(orderId, paymentData) {
  try {
    const { status, paymentIntentId, paidAt } = paymentData;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: status,
          paymentIntentId,
          paidAt: status === "COMPLETED" ? paidAt || new Date() : null,
        },
      });

      // If payment completed and delivery is immediate, trigger delivery
      if (status === "COMPLETED" && order.sendType === "sendImmediately") {
        await tx.deliveryLog.updateMany({
          where: {
            orderId,
            status: "PENDING",
          },
          data: {
            status: "PENDING", // Ready to be picked up by delivery service
          },
        });
      }

      return order;
    });

    return {
      success: true,
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Error updating order payment status:", error);
    return {
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    };
  }
}

export async function resendVoucher(orderId, voucherCodeId) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        receiverDetail: true,
        voucherCodes: {
          where: { id: voucherCodeId },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    if (order.voucherCodes.length === 0) {
      return {
        success: false,
        message: "Voucher code not found",
      };
    }

    // Create new delivery log entry
    await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId,
        method: order.deliveryMethod,
        recipient:
          order.deliveryMethod === "email"
            ? order.receiverDetail.email
            : order.receiverDetail.phone,
        status: "PENDING",
        attemptCount: 0,
      },
    });

    return {
      success: true,
      message: "Voucher will be resent shortly",
    };
  } catch (error) {
    console.error("Error resending voucher:", error);
    return {
      success: false,
      message: "Failed to resend voucher",
      error: error.message,
    };
  }
}
