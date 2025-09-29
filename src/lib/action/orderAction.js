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

function generateVoucherCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    // Add hyphen every 4 characters for readability
    if ((i + 1) % 4 === 0 && i !== 15) {
      code += "-";
    }
  }
  return code;
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

  if (!userId) {
    return {
      error: "User not authenticated.",
    };
  }

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
    customImageUrl,
    customVideoUrl,
  } = orderData;

  try {
    // Validate brand has voucher configuration
    if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
      return {
        error: "Brand does not have voucher configuration.",
      };
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

    // Determine scheduled delivery time
    const scheduledFor =
      selectedTiming?.type === "scheduled" && selectedTiming?.dateTime
        ? new Date(selectedTiming.dateTime)
        : null;

    // Calculate order amounts
    const amount = selectedAmount.value;
    const quantity = orderData.quantity || 1;
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;

    // Create order with transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
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

          // Amounts
          amount,
          quantity,
          subtotal,
          discount,
          totalAmount,
          currency: selectedAmount.currency || "USD",

          // Customization
          message: personalMessage || "",
          customImageUrl: customImageUrl || null,
          customVideoUrl: customVideoUrl || null,
          senderName: deliveryDetails.yourFullName || null,

          // Delivery
          deliveryMethod: deliveryMethod || "whatsapp",
          sendType:
            selectedTiming?.type === "immediate"
              ? "sendImmediately"
              : "scheduleLater",
          scheduledFor,

          // Payment
          paymentMethod: selectedPaymentMethod || "stripe",
          paymentStatus: "PENDING",

          // Status
          redemptionStatus: "Issued",
          isActive: true,

          // Store sender details as JSON for backward compatibility
          senderName: deliveryDetails.yourFullName || null,
          senderEmail: deliveryDetails.yourEmailAddress || null,
        },
      });

      // Generate voucher codes based on quantity
      const voucherCodes = [];
      const expiresAt = calculateExpiryDate(
        voucherConfig.expiryPolicy,
        voucherConfig.expiryValue
      );

      for (let i = 0; i < quantity; i++) {
        const code = generateVoucherCode();

        const voucherCode = await tx.voucherCode.create({
          data: {
            code,
            orderId: order.id,
            voucherId: voucherConfig.id,
            originalValue: amount,
            remainingValue: amount,
            expiresAt,
            isRedeemed: false,
          },
        });

        // Generate tokenized link for secure delivery
        const tokenizedLink = generateTokenizedLink(voucherCode.id);
        const linkExpiresAt = new Date();
        linkExpiresAt.setDate(linkExpiresAt.getDate() + 7); // Link expires in 7 days

        await tx.voucherCode.update({
          where: { id: voucherCode.id },
          data: {
            tokenizedLink,
            linkExpiresAt,
          },
        });

        voucherCodes.push({ ...voucherCode, tokenizedLink, linkExpiresAt });
      }

      // Create delivery log entry
      await tx.deliveryLog.create({
        data: {
          orderId: order.id,
          voucherCodeId: voucherCodes[0]?.id || null,
          method: deliveryMethod || "whatsapp",
          recipient:
            deliveryMethod === "email"
              ? deliveryDetails.recipientEmailAddress
              : deliveryDetails.recipientWhatsAppNumber,
          status: scheduledFor ? "PENDING" : "PENDING", // Will be processed by delivery service
          attemptCount: 0,
        },
      });

      return { order, voucherCodes };
    });

    return {
      success: true,
      order: result.order,
      voucherCodes: result.voucherCodes,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      error: "Failed to create order.",
      details: error.message,
    };
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
          select: {
            id: true,
            brandName: true,
            logo: true,
            website: true,
          },
        },
        receiverDetail: true,
        occasion: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        occasionCategory: true,
        customCard: true,
        voucherCodes: {
          include: {
            redemptions: {
              orderBy: {
                redeemedAt: "desc",
              },
            },
          },
        },
        deliveryLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
        status: 404,
      };
    }

    return {
      success: true,
      data: order,
    };
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
