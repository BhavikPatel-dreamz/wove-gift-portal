"use server";

import { PrismaClient } from "@prisma/client";
import { getSession } from "./userAction/session";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage";

const prisma = new PrismaClient();

// ==================== CUSTOM ERROR CLASSES ====================
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ExternalServiceError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = "ExternalServiceError";
    this.statusCode = 502;
    this.originalError = originalError;
  }
}

// ==================== HELPER FUNCTIONS ====================
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

function generateTokenizedLink(voucherCodeId) {
  const token = Buffer.from(
    `${voucherCodeId}-${Date.now()}-${Math.random()}`
  ).toString("base64url");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.wove.com";
  return `${baseUrl}/redeem/${token}`;
}


// ==================== VALIDATION FUNCTIONS ====================
function validateOrderData(orderData) {
  if (!orderData.selectedBrand?.id) {
    throw new ValidationError("Brand selection is required");
  }

  if (!orderData.selectedAmount?.value) {
    throw new ValidationError("Gift card amount is required");
  }

  if (orderData.quantity < 1) {
    throw new ValidationError("Quantity must be at least 1");
  }

  if (
    !orderData.deliveryMethod ||
    !["whatsapp", "email"].includes(orderData.deliveryMethod)
  ) {
    throw new ValidationError(
      "Valid delivery method is required (whatsapp or email)"
    );
  }

  const { deliveryDetails } = orderData;

  if (orderData.deliveryMethod === "whatsapp") {
    if (!deliveryDetails?.recipientName) {
      throw new ValidationError("Recipient full name is required");
    }
  } else {
    if (!deliveryDetails?.recipientFullName) {
      throw new ValidationError("Recipient full name is required");
    }
  }

  if (
    orderData.deliveryMethod === "email" &&
    !deliveryDetails?.recipientEmailAddress
  ) {
    throw new ValidationError("Recipient email is required for email delivery");
  }

  if (
    orderData.deliveryMethod === "whatsapp" &&
    !deliveryDetails?.recipientWhatsAppNumber
  ) {
    throw new ValidationError(
      "Recipient WhatsApp number is required for WhatsApp delivery"
    );
  }

  return true;
}

// ==================== DATABASE OPERATIONS ====================
async function createReceiverDetail(deliveryDetails) {
  try {
    return await prisma.receiverDetail.create({
      data: {
        name:
          deliveryDetails.recipientFullName || deliveryDetails?.recipientName,
        email: deliveryDetails.recipientEmailAddress || null,
        phone: deliveryDetails.recipientWhatsAppNumber || null,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create receiver detail: ${error.message}`);
  }
}

async function createOrderRecord(
  selectedBrand,
  orderData,
  receiver,
  scheduledFor
) {
  try {
    const amount = orderData.selectedAmount.value;
    const { quantity = 1 } = orderData;
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;

    return await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        brandId: selectedBrand.id,
        occasionId: orderData.selectedOccasion,
        subCategoryId: orderData.selectedSubCategory?.isCustom
          ? null
          : orderData.selectedSubCategory?.id,
        customCardId: orderData.selectedSubCategory?.isCustom
          ? orderData.selectedSubCategory?.id
          : null,
        userId: String(orderData.userId),
        receiverDetailId: receiver.id,
        amount,
        quantity,
        subtotal,
        discount,
        totalAmount,
        currency: orderData.selectedAmount.currency || "USD",
        message: orderData.personalMessage || "",
        customImageUrl: orderData.customImageUrl || null,
        customVideoUrl: orderData.customVideoUrl || null,
        senderName: orderData.deliveryDetails?.yourFullName || null,
        deliveryMethod: orderData.deliveryMethod || "whatsapp",
        sendType:
          orderData.selectedTiming?.type === "immediate"
            ? "sendImmediately"
            : "scheduleLater",
        scheduledFor,
        paymentMethod: orderData.selectedPaymentMethod || "stripe",
        paymentStatus: "PENDING",
        redemptionStatus: "Issued",
        isActive: true,
        senderEmail: orderData.deliveryDetails?.yourEmailAddress || null,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create order record: ${error.message}`);
  }
}

// ==================== SHOPIFY GIFT CARD OPERATIONS ====================
async function createShopifyGiftCard(selectedBrand, orderData) {
  if (!selectedBrand.domain) {
    throw new ValidationError(
      "Brand domain is required for gift card creation"
    );
  }

  if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
    throw new ValidationError("Brand does not have voucher configuration");
  }

  const voucherConfig = selectedBrand.vouchers[0];

  const giftCardData = {
    customerEmail: orderData.deliveryDetails?.recipientEmailAddress || "",
    firstName:
      orderData.deliveryDetails?.recipientFullName?.split(" ")[0] ||
      "Recipient",
    lastName:
      orderData.deliveryDetails?.recipientFullName
        ?.split(" ")
        .slice(1)
        .join(" ") || "",
    note: `Order to be generated`,
    denominationValue:
      voucherConfig.denominationType === "fixed"
        ? orderData.selectedAmount.value
        : orderData.selectedAmount.value,
  };

  const apiUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/giftcard?shop=${selectedBrand.domain}&denominationType=${
    voucherConfig.denominationType
  }`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(giftCardData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ExternalServiceError(
        `Shopify API error: ${errorData.error || response.statusText}`,
        errorData
      );
    }

    const result = await response.json();

    if (!result.gift_card?.id || !result.gift_card?.maskedCode) {
      throw new ExternalServiceError(
        "Invalid Shopify gift card response - missing id or maskedCode",
        result
      );
    }

    return { giftCard: result.gift_card, voucherConfig };
  } catch (error) {
    if (error instanceof ExternalServiceError) throw error;
    throw new ExternalServiceError(
      `Failed to create Shopify gift card: ${error.message}`,
      error
    );
  }
}

// ==================== DATABASE GIFT CARD OPERATIONS ====================
async function saveGiftCardToDb(shopifyGiftCard, selectedBrand, order) {
  try {
    return await prisma.giftCard.upsert({
      where: { shopifyId: shopifyGiftCard.id },
      update: {
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: order.receiverEmail,
        updatedAt: new Date(),
      },
      create: {
        shop: selectedBrand.domain,
        shopifyId: shopifyGiftCard.id,
        code: shopifyGiftCard.maskedCode,
        initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: order.receiverEmail,
        note: `Order ${order.orderNumber}`,
        isActive: true,
        isVirtual: true,
      },
    });
  } catch (error) {
    throw new Error(`Failed to save gift card to database: ${error.message}`);
  }
}

async function createVoucherCode(
  order,
  voucherConfig,
  giftCard,
  selectedBrand,
  shopifyGiftCard
) {
  try {
    let expireDate = null;
    if (voucherConfig?.denominationType === "fixed") {
      const matchedDenomination = voucherConfig?.denominations?.find(
        (d) => d?.value == order?.amount
      );
      expireDate = matchedDenomination?.expiresAt || null;
    } else {
      expireDate = voucherConfig?.expiresAt || null;
    }
    console.log("voucherConfig", expireDate);

    const voucherCode = await prisma.voucherCode.create({
      data: {
        code: shopifyGiftCard.maskedCode,
        orderId: order.id,
        voucherId: voucherConfig.id,
        originalValue: order.amount,
        remainingValue: order.amount,
        expiresAt: expireDate,
        isRedeemed: false,
        shopifyGiftCardId: giftCard.id,
        shopifyShop: selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    // Generate and save tokenized link
    const tokenizedLink = generateTokenizedLink(voucherCode.id);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    return voucherCode;
  } catch (error) {
    throw new Error(`Failed to create voucher code: ${error.message}`);
  }
}

// ==================== SETTLEMENT OPERATIONS ====================
async function updateOrCreateSettlement(selectedBrand, order) {
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

    const existingSettlement = await prisma.settlements.findFirst({
      where: {
        brandId: selectedBrand.id,
        settlementPeriod,
      },
    });

    if (existingSettlement) {
      await prisma.settlements.update({
        where: { id: existingSettlement.id },
        data: {
          totalSold: existingSettlement.totalSold + order.quantity,
          totalSoldAmount:
            existingSettlement.totalSoldAmount + order.totalAmount,
          outstanding: existingSettlement.outstanding + order.quantity,
          outstandingAmount:
            existingSettlement.outstandingAmount + order.totalAmount,
          updatedAt: new Date(),
        },
      });

      console.log(
        `✅ Updated settlement for brand ${selectedBrand.name} (${settlementPeriod})`
      );
    } else {
      await prisma.settlements.create({
        data: {
          brandId: selectedBrand.id,
          settlementPeriod,
          periodStart,
          periodEnd,
          totalSold: order.quantity,
          totalSoldAmount: order.totalAmount,
          totalRedeemed: 0,
          redeemedAmount: 0,
          outstanding: order.quantity,
          outstandingAmount: order.totalAmount,
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
  } catch (error) {
    console.error("⚠️ Settlement update failed (non-critical):", error.message);
    // Don't throw - settlement failure should not block order creation
  }
}

// ==================== DELIVERY OPERATIONS ====================
async function sendDeliveryMessage(orderData, giftCard, deliveryMethod) {
  try {
    if (deliveryMethod === "whatsapp") {
      return await SendWhatsappMessages(orderData, giftCard);
    } else {
      return await SendGiftCardEmail(orderData, giftCard);
    }
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to send ${deliveryMethod} message: ${error.message}`,
      error
    );
  }
}

async function createDeliveryLog(order, voucherCode, orderData) {
  try {
    const recipient =
      orderData.deliveryMethod === "email"
        ? orderData.deliveryDetails.recipientEmailAddress
        : orderData.deliveryDetails.recipientWhatsAppNumber;

    return await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId: voucherCode.id,
        method: orderData.deliveryMethod || "whatsapp",
        recipient,
        status: order.scheduledFor ? "PENDING" : "PENDING",
        attemptCount: 0,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create delivery log: ${error.message}`);
  }
}

// ==================== CLEANUP FUNCTIONS ====================
async function cleanupOnError(orderId, voucherCodeId) {
  try {
    if (voucherCodeId) {
      await prisma.voucherCode
        .delete({
          where: { id: voucherCodeId },
        })
        .catch(() => null);
    }

    if (orderId) {
      await prisma.order
        .delete({
          where: { id: orderId },
        })
        .catch(() => null);
    }
  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
}

// ==================== MAIN ORDER CREATION ====================
export const createOrder = async (orderData) => {
  let order = null;
  let voucherCode = null;

  try {
    // Step 1: Authentication
    console.log("Step 1: Authenticating user...");
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    orderData.userId = userId;

    // Step 2: Validation
    console.log("Step 2: Validating order data...");
    validateOrderData(orderData);

    // Step 3: Create receiver detail
    console.log("Step 3: Creating receiver detail...");
    const receiver = await createReceiverDetail(orderData.deliveryDetails);

    // Step 4: Create order record
    console.log("Step 4: Creating order record...");
    const scheduledFor =
      orderData.selectedTiming?.type === "scheduled" &&
      orderData.selectedTiming?.dateTime
        ? new Date(orderData.selectedTiming.dateTime)
        : null;

    order = await createOrderRecord(
      orderData.selectedBrand,
      orderData,
      receiver,
      scheduledFor
    );

    // Step 5: Create Shopify gift card
    console.log("Step 5: Creating Shopify gift card...");
    const { giftCard: shopifyGiftCard, voucherConfig } =
      await createShopifyGiftCard(orderData.selectedBrand, orderData);

    // Step 6: Save gift card to database
    console.log("Step 6: Saving gift card to database...");
    const giftCardInDb = await saveGiftCardToDb(
      shopifyGiftCard,
      orderData.selectedBrand,
      order
    );

    // Step 7: Create voucher code
    console.log("Step 7: Creating voucher code...");
    voucherCode = await createVoucherCode(
      order,
      voucherConfig,
      giftCardInDb,
      orderData.selectedBrand,
      shopifyGiftCard
    );

    // Step 8: Update settlement
    console.log("Step 8: Updating settlement records...");
    await updateOrCreateSettlement(orderData.selectedBrand, order);

    // Step 9: Send delivery message
    console.log("Step 9: Sending delivery message...");
    const deliveryResult = await sendDeliveryMessage(
      orderData,
      shopifyGiftCard,
      orderData.deliveryMethod
    );

    if (!deliveryResult.success) {
      throw new ExternalServiceError(
        `Message delivery failed: ${deliveryResult.message}`,
        deliveryResult
      );
    }

    // Step 10: Create delivery log
    console.log("Step 10: Creating delivery log...");
    await createDeliveryLog(order, voucherCode, orderData);

    console.log("✅ Order created successfully:", order.orderNumber);

    return {
      success: true,
      data: {
        order,
        voucherCode,
        giftCard: giftCardInDb,
      },
    };
  } catch (error) {
    console.error("❌ Order creation failed:", error);

    // Cleanup on error
    if (order?.id || voucherCode?.id) {
      await cleanupOnError(order?.id, voucherCode?.id);
    }

    // Throw error with proper status code
    if (error instanceof ValidationError) {
      throw {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else if (error instanceof AuthenticationError) {
      throw {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else if (error instanceof ExternalServiceError) {
      throw {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
        originalError: error.originalError?.message,
      };
    } else {
      throw {
        success: false,
        error: error.message || "An unexpected error occurred",
        statusCode: 500,
        errorType: "InternalServerError",
      };
    }
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
