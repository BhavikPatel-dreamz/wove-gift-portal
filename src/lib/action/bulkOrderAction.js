"use server";

import { prisma } from "../db";
import { getSession } from "./userAction/session";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage";



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

function generateBulkOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `BULK-${timestamp}-${random}`;
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
    !["whatsapp", "email", "print"].includes(orderData.deliveryMethod)
  ) {
    throw new ValidationError(
      "Valid delivery method is required (whatsapp, email, or print)"
    );
  }

  const { deliveryDetails } = orderData;
  const recipientName = deliveryDetails?.recipientFullName || deliveryDetails?.recipientName;
  
  if (!recipientName && orderData.deliveryMethod !== "print") {
    throw new ValidationError("Recipient full name is required");
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

function validateBulkOrderData(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new ValidationError("Cart items are required");
  }

  if (cartItems.length > 50) {
    throw new ValidationError("Maximum 50 items allowed per bulk order");
  }

  cartItems.forEach((item, index) => {
    try {
      validateOrderData(item);
    } catch (error) {
      throw new ValidationError(`Item ${index + 1}: ${error.message}`);
    }
  });

  return true;
}

// ==================== DATABASE OPERATIONS ====================
async function createReceiverDetail(deliveryDetails, deliveryMethod) {
  try {
    return await prisma.receiverDetail.create({
      data: {
        name: deliveryDetails.recipientFullName || deliveryDetails?.recipientName || "Recipient",
        email: deliveryMethod === "email" ? deliveryDetails.recipientEmailAddress : null,
        phone: deliveryMethod === "whatsapp" ? deliveryDetails.recipientWhatsAppNumber : null,
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
  scheduledFor,
  bulkOrderNumber
) {
  try {
    const amount = orderData.selectedAmount.value;
    const { quantity = 1 } = orderData;
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;

    // Extract occasionId from multiple possible sources
    let occasionId = null;
    
    if (orderData.selectedOccasion) {
      occasionId = typeof orderData.selectedOccasion === 'string' 
        ? orderData.selectedOccasion 
        : orderData.selectedOccasion?.id;
    } else if (orderData.selectedSubCategory?.occasionId) {
      occasionId = orderData.selectedSubCategory.occasionId;
    } else if (orderData.occasionId) {
      occasionId = orderData.occasionId;
    }

    if (!occasionId) {
      console.error("Missing occasion data:", {
        selectedOccasion: orderData.selectedOccasion,
        selectedSubCategory: orderData.selectedSubCategory,
        occasionId: orderData.occasionId
      });
      throw new Error("Occasion ID is required. Please ensure the occasion is selected.");
    }

    return await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        bulkOrderNumber: bulkOrderNumber || null,
        brandId: selectedBrand.id,
        occasionId: occasionId,
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
    throw new ValidationError("Brand domain is required for gift card creation");
  }

  if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
    throw new ValidationError("Brand does not have voucher configuration");
  }

  const voucherConfig = selectedBrand.vouchers[0];

  const giftCardData = {
    customerEmail: orderData.deliveryDetails?.recipientEmailAddress || orderData.deliveryDetails?.yourEmailAddress || "",
    firstName:
      orderData.deliveryDetails?.recipientFullName?.split(" ")[0] ||
      orderData.deliveryDetails?.recipientName?.split(" ")[0] ||
      "Recipient",
    lastName:
      orderData.deliveryDetails?.recipientFullName?.split(" ").slice(1).join(" ") || 
      orderData.deliveryDetails?.recipientName?.split(" ").slice(1).join(" ") || 
      "",
    note: `Order to be generated - Delivery Method: ${orderData.deliveryMethod}`,
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
          totalSoldAmount: existingSettlement.totalSoldAmount + order.totalAmount,
          outstanding: existingSettlement.outstanding + order.quantity,
          outstandingAmount: existingSettlement.outstandingAmount + order.totalAmount,
          updatedAt: new Date(),
        },
      });
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
    }
  } catch (error) {
    console.error("⚠️ Settlement update failed (non-critical):", error.message);
  }
}

// ==================== DELIVERY OPERATIONS ====================
async function sendDeliveryMessage(orderData, giftCard, deliveryMethod) {
  try {
    if (deliveryMethod === "print") {
      return { success: true, message: "Print delivery - no message sent" };
    }

    if (deliveryMethod === "whatsapp") {
      return await SendWhatsappMessages(orderData, giftCard);
    } else if (deliveryMethod === "email") {
      return await SendGiftCardEmail(orderData, giftCard);
    }

    return { success: true, message: "No delivery required" };
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to send ${deliveryMethod} message: ${error.message}`,
      error
    );
  }
}

async function createDeliveryLog(order, voucherCode, orderData) {
  try {
    let recipient = "Print delivery";
    
    if (orderData.deliveryMethod === "email") {
      recipient = orderData.deliveryDetails.recipientEmailAddress;
    } else if (orderData.deliveryMethod === "whatsapp") {
      recipient = orderData.deliveryDetails.recipientWhatsAppNumber;
    }

    const status = orderData.deliveryMethod === "print" ? "DELIVERED" : (order.scheduledFor ? "PENDING" : "PENDING");

    return await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId: voucherCode.id,
        method: orderData.deliveryMethod || "whatsapp",
        recipient,
        status,
        attemptCount: orderData.deliveryMethod === "print" ? 1 : 0,
        deliveredAt: orderData.deliveryMethod === "print" ? new Date() : null,
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
      await prisma.voucherCode.delete({ where: { id: voucherCodeId } }).catch(() => null);
    }
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } }).catch(() => null);
    }
  } catch (error) {
    console.error("Cleanup error:", error.message);
  }
}

// ==================== SINGLE ORDER CREATION ====================
export const createOrder = async (orderData) => {
  let order = null;
  let voucherCode = null;

  try {
  
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    orderData.userId = userId;

 
    validateOrderData(orderData);


    const receiver = await createReceiverDetail(orderData.deliveryDetails, orderData.deliveryMethod);

    const scheduledFor =
      orderData.selectedTiming?.type === "scheduled" &&
      orderData.selectedTiming?.dateTime
        ? new Date(orderData.selectedTiming.dateTime)
        : null;

    order = await createOrderRecord(
      orderData.selectedBrand,
      orderData,
      receiver,
      scheduledFor,
      null
    );


    const { giftCard: shopifyGiftCard, voucherConfig } =
      await createShopifyGiftCard(orderData.selectedBrand, orderData);

  
    const giftCardInDb = await saveGiftCardToDb(
      shopifyGiftCard,
      orderData.selectedBrand,
      order
    );

    voucherCode = await createVoucherCode(
      order,
      voucherConfig,
      giftCardInDb,
      orderData.selectedBrand,
      shopifyGiftCard
    ); 
    await updateOrCreateSettlement(orderData.selectedBrand, order);

    const deliveryResult = await sendDeliveryMessage(
      orderData,
      shopifyGiftCard,
      orderData.deliveryMethod
    );

    if (!deliveryResult.success && orderData.deliveryMethod !== "print") {
      throw new ExternalServiceError(
        `Message delivery failed: ${deliveryResult.message}`,
        deliveryResult
      );
    }
    await createDeliveryLog(order, voucherCode, orderData);



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

    if (order?.id || voucherCode?.id) {
      await cleanupOnError(order?.id, voucherCode?.id);
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else if (error instanceof ExternalServiceError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
        originalError: error.originalError?.message,
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        statusCode: 500,
        errorType: "InternalServerError",
      };
    }
  }
};

// ==================== BULK ORDER CREATION ====================
export const createBulkOrder = async (cartItems, paymentData) => {
  const bulkOrderNumber = generateBulkOrderNumber();
  const successfulOrders = [];
  const failedOrders = [];
  let totalAmount = 0;

  try {
  

    // Step 1: Authentication
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    // Step 2: Validate all cart items
    validateBulkOrderData(cartItems);

    // Step 3: Process each cart item
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      let order = null;
      let voucherCode = null;

      try {
        
        item.userId = userId;
        item.selectedPaymentMethod = paymentData?.method || 'card';

        // Enrich with occasionId if missing
        if (!item.selectedOccasion && !item.occasionId && item.selectedSubCategory?.occasionId) {
          item.occasionId = item.selectedSubCategory.occasionId;
        }

        // Create receiver detail
        const receiver = await createReceiverDetail(
          item.deliveryDetails,
          item.deliveryMethod
        );

        // Create order with bulk order number
        const scheduledFor =
          item.selectedTiming?.type === "scheduled" &&
          item.selectedTiming?.dateTime
            ? new Date(item.selectedTiming.dateTime)
            : null;

        order = await createOrderRecord(
          item.selectedBrand,
          item,
          receiver,
          scheduledFor,
          bulkOrderNumber
        );

        // Create Shopify gift card
        const { giftCard: shopifyGiftCard, voucherConfig } =
          await createShopifyGiftCard(item.selectedBrand, item);

        // Save gift card to database
        const giftCardInDb = await saveGiftCardToDb(
          shopifyGiftCard,
          item.selectedBrand,
          order
        );

        // Create voucher code
        voucherCode = await createVoucherCode(
          order,
          voucherConfig,
          giftCardInDb,
          item.selectedBrand,
          shopifyGiftCard
        );

        // Update settlement
        await updateOrCreateSettlement(item.selectedBrand, order);

        // Send delivery message
        const deliveryResult = await sendDeliveryMessage(
          item,
          shopifyGiftCard,
          item.deliveryMethod
        );

        if (!deliveryResult.success && item.deliveryMethod !== "print") {
          console.warn(`⚠️ Delivery failed for order ${order.orderNumber}`);
        }

        // Create delivery log
        await createDeliveryLog(order, voucherCode, item);

        // Add to successful orders
        successfulOrders.push({
          order,
          voucherCode,
          giftCard: giftCardInDb,
          itemIndex: i,
        });

        totalAmount += order.totalAmount;

      } catch (error) {
        console.error(`❌ Failed to process item ${i + 1}:`, error.message);
        
        // Cleanup failed order
        if (order?.id || voucherCode?.id) {
          await cleanupOnError(order?.id, voucherCode?.id);
        }

        failedOrders.push({
          itemIndex: i,
          item: item.selectedBrand?.brandName || `Item ${i + 1}`,
          error: error.message,
        });
      }
    }

    // Step 4: Update payment status for successful orders
    if (successfulOrders.length > 0 && paymentData?.chargeId) {
      
      const orderIds = successfulOrders.map(o => o.order.id);
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          paymentStatus: "COMPLETED",
        },
      });
    }

    if (failedOrders.length > 0) {
  
    }

    return {
      success: true,
      data: {
        bulkOrderNumber,
        totalItems: cartItems.length,
        successfulItems: successfulOrders.length,
        failedItems: failedOrders.length,
        totalAmount,
        orders: successfulOrders,
        failedOrders,
      },
    };
  } catch (error) {
    console.error("❌ Bulk order creation failed:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    } else {
      return {
        success: false,
        error: error.message || "An unexpected error occurred during bulk order creation",
        statusCode: 500,
        errorType: "InternalServerError",
      };
    }
  }
};