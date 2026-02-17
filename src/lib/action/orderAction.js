
"use server";

import { prisma } from "../db.js";
import {
  getPayFastConfig,
  buildPayFastData,
  buildPayFastUrl,
  generateSignature,
  buildPayFastUrlDirect,
} from "../payfast/payfastUtils.js";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage.js";
import * as brevo from "@getbrevo/brevo";
import { v2 as cloudinary } from "cloudinary";

const apiKey = process.env.NEXT_BREVO_API_KEY;
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

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

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug
      ? `https://${selectedBrand.slug}.myshopify.com`
      : null);

  if (!claimUrl) {
    throw new ValidationError("Brand website or domain not configured");
  }

  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

// ==================== VALIDATION FUNCTIONS ====================
function validateOrderData(orderData) {
  if (!orderData.selectedBrand?.id) {
    throw new ValidationError("Brand selection is required");
  }

  if (!orderData.selectedAmount?.value) {
    throw new ValidationError("Gift card amount is required");
  }

  const quantity = orderData.quantity || 1;
  if (quantity < 1) {
    throw new ValidationError("Quantity must be at least 1");
  }

  const isBulkOrder = orderData.isBulkOrder === true;

  if (isBulkOrder) {
    if (!orderData.companyInfo) {
      throw new ValidationError(
        "Company information is required for bulk orders",
      );
    }

    if (!orderData.companyInfo.companyName) {
      throw new ValidationError("Company name is required for bulk orders");
    }

    if (!orderData.companyInfo.contactEmail) {
      throw new ValidationError("Contact email is required for bulk orders");
    }

    if (!orderData.companyInfo.contactNumber) {
      throw new ValidationError("Contact number is required for bulk orders");
    }

    if (!orderData.deliveryOption) {
      throw new ValidationError("Delivery option is required for bulk orders");
    }

    if (!["csv", "email", "multiple"].includes(orderData.deliveryOption)) {
      throw new ValidationError("Invalid delivery option for bulk orders");
    }

    if (orderData.deliveryOption === "multiple") {
      if (!orderData.csvRecipients || orderData.csvRecipients.length === 0) {
        throw new ValidationError(
          "CSV recipients are required for individual delivery",
        );
      }

      orderData.csvRecipients.forEach((recipient, index) => {
        if (!recipient.name || !recipient.email) {
          throw new ValidationError(
            `Row ${index + 1}: Name and email are required`,
          );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient.email)) {
          throw new ValidationError(`Row ${index + 1}: Invalid email format`);
        }
      });
    }
  } else {
    if (
      !orderData.deliveryMethod ||
      !["whatsapp", "email", "print"].includes(orderData.deliveryMethod)
    ) {
      throw new ValidationError(
        "Valid delivery method is required (whatsapp, email, or print)",
      );
    }

    const { deliveryDetails } = orderData;
    const recipientName =
      deliveryDetails?.recipientFullName || deliveryDetails?.recipientName;

    if (!recipientName && orderData.deliveryMethod !== "print") {
      throw new ValidationError("Recipient full name is required");
    }

    if (
      orderData.deliveryMethod === "email" &&
      !deliveryDetails?.recipientEmailAddress
    ) {
      throw new ValidationError(
        "Recipient email is required for email delivery",
      );
    }

    if (
      orderData.deliveryMethod === "whatsapp" &&
      !deliveryDetails?.recipientWhatsAppNumber
    ) {
      throw new ValidationError(
        "Recipient WhatsApp number is required for WhatsApp delivery",
      );
    }
  }

  return true;
}

// ==================== CREATE RECEIVER DETAIL ====================
async function createReceiverDetail(orderData) {
  const isBulkOrder = orderData.isBulkOrder === true;

  if (isBulkOrder) {
    return await prisma.receiverDetail.create({
      data: {
        name: orderData.companyInfo.companyName,
        email: orderData.companyInfo.contactEmail,
        phone: orderData.companyInfo.contactNumber,
      },
    });
  } else {
    const { deliveryDetails, deliveryMethod } = orderData;
    return await prisma.receiverDetail.create({
      data: {
        name: deliveryDetails.recipientFullName || deliveryDetails?.recipientName,
        email: deliveryMethod === "email" ? deliveryDetails.recipientEmailAddress : null,
        phone: deliveryMethod === "whatsapp" ? deliveryDetails.recipientWhatsAppNumber : null,
      },
    });
  }
}

// ==================== CALCULATE SCHEDULED TIME ====================
function calculateScheduledTime(selectedTiming) {
  if (!selectedTiming || selectedTiming.type === "immediate") {
    return null;
  }

  return new Date(
    selectedTiming.year,
    selectedTiming.month,
    selectedTiming.date,
    Number(selectedTiming.time.split(":")[0]),
    Number(selectedTiming.time.split(":")[1])
  );
}


function generateExportDescription(orderData, orderNumber) {
  const isBulkOrder = orderData.isBulkOrder === true;
  const brandName = orderData.selectedBrand?.brandName || "Gift Card";
  const quantity = orderData.quantity || 1;
  const amount = orderData.selectedAmount?.value || 0;

  if (isBulkOrder) {
    return `Gift card purchase - ${brandName} - Bulk order of ${quantity} vouchers - Order #${orderNumber}`;
  } else {
    return `Gift card purchase - ${brandName} - ${quantity}x ${
      orderData.selectedAmount?.currency || "INR"
    }${amount} - Order #${orderNumber}`;
  }
}

// ==================== STEP 1: CREATE PENDING ORDER + PAYMENT INTENT ====================
export const createPendingOrder = async (orderData) => {
  try {
    const userId = orderData?.userId;
    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    // Check if multi-cart order
    const isMultiCart = orderData.isMultiCart === true;
    const cartOrders = orderData.cartOrders || [orderData];
    
    const createdOrders = [];
    let totalPaymentAmount = 0;

    // ✅ CREATE ALL ORDERS FIRST (NO VOUCHER GENERATION)
    for (const singleOrderData of cartOrders) {
      validateOrderData(singleOrderData);
      const isBulkOrder = singleOrderData.isBulkOrder === true;
      const receiver = await createReceiverDetail(singleOrderData);

      // Calculate quantity
      const quantity = isBulkOrder && singleOrderData.csvRecipients?.length > 0
        ? singleOrderData.csvRecipients.length
        : singleOrderData.quantity || 1;

      const amount = Number(singleOrderData.selectedAmount.value);
      const subtotal = amount * quantity;
      const discount = singleOrderData.discountAmount || 0;
      const totalAmount = subtotal - discount;

      totalPaymentAmount += totalAmount;

      // Determine if custom occasion
      const isCustom = singleOrderData.selectedSubCategory.category === "custom" || 
                       singleOrderData.selectedSubCategory.category === "CUSTOM";

      const scheduledFor = calculateScheduledTime(singleOrderData.selectedTiming);

      // Base order data
      const orderBase = {
        orderNumber: generateOrderNumber(),
        brandId: singleOrderData.selectedBrand.id,
        occasionId: singleOrderData.selectedOccasion,
        isCustom,
        subCategoryId: isCustom ? null : singleOrderData.selectedSubCategory?.id,
        customCardId: isCustom ? singleOrderData.selectedSubCategory?.id : null,
        userId: String(userId),
        receiverDetailId: receiver.id,
        amount,
        quantity,
        subtotal,
        discount,
        totalAmount,
        currency: singleOrderData.selectedAmount.currency || "ZAR",
        paymentMethod: "payfast",
        customImageUrl: singleOrderData.customImageUrl || null,
        customVideoUrl: singleOrderData.customVideoUrl || null,
        paymentStatus: "PENDING",
        redemptionStatus: "Issued",
        isActive: true,
        
        // ✅ NEW: Queue processing fields
        isPaid: false,
        voucherEntries: quantity, // Total vouchers needed
        vouchersCreated: 0,
        allVouchersGenerated: false,
        notificationsSent: false,
        processingStatus: "PENDING",
        retryCount: 0,
        maxRetries: 3,
      };

      let order;
      
      if (isBulkOrder) {
        order = await prisma.order.create({
          data: {
            ...orderBase,
            bulkOrderNumber: `BULK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            deliveryMethod: singleOrderData.deliveryOption || "email",
            message: singleOrderData.personalMessage || "",
            senderName: singleOrderData.companyInfo.companyName,
            sendType: scheduledFor ? "scheduleLater" : "sendImmediately",
            scheduledFor,
            senderEmail: singleOrderData.companyInfo.contactEmail,
          },
        });

        // ✅ CREATE BULK RECIPIENTS (NO VOUCHERS YET)
        if (singleOrderData.csvRecipients && singleOrderData.csvRecipients.length > 0) {
          const bulkRecipientsData = singleOrderData.csvRecipients.map((recipient, index) => ({
            orderId: order.id,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            recipientPhone: recipient.phone || null,
            personalMessage: recipient.message || singleOrderData.personalMessage || null,
            rowNumber: recipient.rowNumber || index + 1,
            voucherCodeId: null, // Will be set by cron processor
          }));

          await prisma.bulkRecipient.createMany({
            data: bulkRecipientsData,
            skipDuplicates: true,
          });
        }
      } else {
        order = await prisma.order.create({
          data: {
            ...orderBase,
            deliveryMethod: singleOrderData.deliveryMethod || "whatsapp",
            message: singleOrderData.personalMessage || "",
            senderName: singleOrderData.deliveryDetails?.yourFullName || null,
            sendType: scheduledFor ? "scheduleLater" : "sendImmediately",
            scheduledFor,
            senderEmail: singleOrderData.deliveryDetails?.yourEmailAddress || null,
          },
        });
      }

      createdOrders.push(order);
    }

    // ✅ GENERATE PAYFAST PAYMENT URL
    const paymentSource = isMultiCart ? "cart" : "direct";
    const payfastConfig = getPayFastConfig(createdOrders[0].id, paymentSource);
    
    const customerName = isMultiCart 
      ? (cartOrders[0].deliveryDetails?.yourFullName || cartOrders[0].companyInfo?.companyName || "Customer")
      : (orderData.deliveryDetails?.yourFullName || orderData.companyInfo?.companyName || "Customer");

    const [firstName, ...lastNameParts] = customerName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const customerEmail = isMultiCart
      ? (cartOrders[0].deliveryDetails?.yourEmailAddress || cartOrders[0].companyInfo?.contactEmail)
      : (orderData.deliveryDetails?.yourEmailAddress || orderData.companyInfo?.contactEmail);

    const itemNames = createdOrders.map(o => {
      const orderDataForBrand = cartOrders.find(co => co.selectedBrand.id === o.brandId);
      return orderDataForBrand?.selectedBrand?.brandName || "Gift Card";
    }).join(", ");

    const payfastOrderData = {
      orderId: createdOrders[0].id,
      orderNumber: createdOrders.map(o => o.orderNumber).join(","),
      totalAmount: totalPaymentAmount,
      itemName: isMultiCart ? `${createdOrders.length} Gift Cards` : itemNames,
      description: isMultiCart 
        ? `Multi-cart purchase - ${createdOrders.length} items`
        : `Gift card order - ${createdOrders[0].orderNumber}`,
      isBulkOrder: false,
      quantity: createdOrders.length,
      firstName,
      lastName,
      email: customerEmail,
    };

    const payfastData = buildPayFastData(payfastOrderData, payfastConfig);
    const payfastUrl = buildPayFastUrlDirect(
      payfastData,
      payfastConfig.passphrase,
      payfastConfig.isSandbox
    );

    // ✅ STORE PAYMENT INTENT IN ALL ORDERS
    const sharedPaymentIntent = `PF_MULTI_${Date.now()}`;
    for (const order of createdOrders) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: sharedPaymentIntent },
      });
    }

    console.log(`✅ Created ${createdOrders.length} orders with payment intent`);
    console.log(`💰 Total PayFast amount: ${totalPaymentAmount}`);

    return {
      success: true,
      data: {
        orderId: createdOrders[0].id,
        orderIds: createdOrders.map(o => o.id),
        orderNumber: createdOrders[0].orderNumber,
        payfastUrl,
        payfastData,
      },
    };
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      statusCode: error.statusCode || 500,
      errorType: error.name || "InternalServerError",
    };
  }
};

// ==================== STEP 2: MARK ORDER AS PAID (Called by webhook) ====================
export const markOrderAsPaid = async (orderId, paymentDetails) => {
  try {
    console.log(`💰 Marking order ${orderId} as PAID`);

    // Check if order is scheduled for future
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { scheduledFor: true, sendType: true },
    });

    const isScheduled = order?.sendType === "scheduleLater" && order?.scheduledFor;
    const processingStatus = isScheduled ? "PAYMENT_CONFIRMED" : "PAYMENT_CONFIRMED";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        paymentIntentId: paymentDetails.paymentIntentId,
        paidAt: new Date(),
        isPaid: true,
        processingStatus,
        lastProcessedAt: new Date(),
      },
    });

    console.log(`✅ Order marked as PAID - ${isScheduled ? 'Scheduled for later' : 'Cron will process it'}`);

    return {
      success: true,
      message: "Order marked as paid, processing will begin shortly",
      data: {
        orderId,
        paymentStatus: "COMPLETED",
        processingStatus,
        isScheduled,
      },
    };
  } catch (error) {
    console.error(`❌ Failed to mark order ${orderId} as paid:`, error.message);

    return {
      success: false,
      error: `Failed to mark order as paid: ${error.message}`,
      statusCode: error.statusCode || 500,
      errorType: error.name || "InternalServerError",
    };
  }
};


// ==================== STEP 2: COMPLETE ORDER AFTER PAYMENT (WEBHOOK) ====================
export const completeOrderAfterPayment = async (orderId, paymentDetails) => {
  try {
    console.log(`🔄 Starting order completion for: ${orderId}`);

    // Update order with payment details
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        paymentIntentId: paymentDetails.paymentIntentId,
        paidAt: new Date(),
      },
      include: {
        brand: {
          include: {
            vouchers: {
              include: {
                denominations: true,
              },
            },
          },
        },
        receiverDetail: true,
        occasion: {
          include: {
            occasionCategories: true,
          },
        },
        bulkRecipients: {
          orderBy: {
            rowNumber: "asc",
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const isBulkOrder = !!order.bulkOrderNumber;
    const quantity =
      isBulkOrder && order.bulkRecipients.length > 0
        ? order.bulkRecipients.length
        : order.quantity;

    console.log(`✅ Payment completed for order: ${order.orderNumber}`);
    console.log(
      `📦 Order type: ${isBulkOrder ? "BULK" : "SINGLE"}, Quantity: ${quantity}`,
    );

    await initializeDeliveryQueue(order, quantity, isBulkOrder);

    // ✅ Fire and forget background processing
    processOrderInBackground(orderId).catch((error) => {
      console.error(
        `❌ Background processing error for order ${orderId}:`,
        error,
      );
    });

    console.log(`✅ Order ${order.orderNumber} queued for processing`);

    return {
      success: true,
      message: "Order is being processed",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: "COMPLETED",
        processingStatus: "IN_PROGRESS",
      },
    };
  } catch (error) {
    console.error(`❌ Failed to complete order ${orderId}:`, error.message);

    if (orderId) {
      await prisma.order
        .update({
          where: { id: orderId },
          data: {
            paymentStatus: "FAILED",
            redemptionStatus: "Cancelled",
          },
        })
        .catch((e) =>
          console.error(
            `Failed to mark order ${orderId} as FAILED: ${e.message}`,
          ),
        );
    }

    return {
      success: false,
      error: `Failed to complete order ${orderId}: ${error.message}`,
      statusCode: error.statusCode || 500,
      errorType: error.name || "InternalServerError",
    };
  }
};

// ==================== DELIVERY QUEUE INITIALIZATION ====================
async function initializeDeliveryQueue(order, quantity, isBulkOrder) {
  try {
    const deliveryLogs = [];

    if (isBulkOrder && order.bulkRecipients.length > 0) {
      for (const recipient of order.bulkRecipients) {
        deliveryLogs.push({
          orderId: order.id,
          voucherCodeId: null,
          method: order.deliveryMethod,
          recipient: recipient.recipientEmail,
          status: "PENDING",
          giftCardCreated: false,
          paymentStatus: "COMPLETED",
          paymentUpdatedAt: new Date(),
          voucherGenerated: false,
          shopifySyncStatus: "pending",
          emailServiceStatus: "queued",
          attemptCount: 0,
          maxRetries: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      const recipient =
        order.deliveryMethod === "email"
          ? order.receiverDetail.email
          : order.deliveryMethod === "whatsapp"
            ? order.receiverDetail.phone
            : "Print delivery";

      deliveryLogs.push({
        orderId: order.id,
        voucherCodeId: null,
        method: order.deliveryMethod,
        recipient,
        status: "PENDING",
        giftCardCreated: false,
        paymentStatus: "COMPLETED",
        paymentUpdatedAt: new Date(),
        voucherGenerated: false,
        shopifySyncStatus: "pending",
        emailServiceStatus: order.deliveryMethod === "email" ? "queued" : null,
        smsServiceStatus: order.deliveryMethod === "sms" ? "queued" : null,
        whatsappServiceStatus:
          order.deliveryMethod === "whatsapp" ? "queued" : null,
        attemptCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // ✅ OPTIMIZED: Single batch insert
    await prisma.deliveryLog.createMany({
      data: deliveryLogs,
    });

    console.log(`✅ Created ${deliveryLogs.length} delivery queue entries`);
  } catch (error) {
    console.error(`❌ Failed to initialize delivery queue:`, error);
    throw error;
  }
}

// ==================== BACKGROUND PROCESSING ====================
async function processOrderInBackground(orderId) {
  const startTime = Date.now();
  console.log(`🚀 Background processing started for order: ${orderId}`);

  try {
    // ✅ OPTIMIZED: Fetch order with only required relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        brand: {
          include: {
            vouchers: {
              include: {
                denominations: true,
              },
            },
          },
        },
        receiverDetail: true,
        occasion: {
          include: {
            occasionCategories: true,
          },
        },
        bulkRecipients: {
          orderBy: {
            rowNumber: "asc",
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const isBulkOrder = !!order.bulkOrderNumber;
    const selectedBrand = order.brand;

    if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
      throw new ValidationError("Brand does not have voucher configuration");
    }

    const voucherConfig = selectedBrand.vouchers[0];

    // ✅ OPTIMIZED: Fetch occasion/custom card details
    let occasionCategoryDetails = null;
    if (!order?.isCustom) {
      occasionCategoryDetails = await prisma.occasionCategory.findUnique({
        where: { id: order.subCategoryId },
      });
    } else {
      occasionCategoryDetails = await prisma.customCard.findUnique({
        where: { id: order.customCardId },
      });
    }

    const orderData = {
      selectedBrand,
      selectedSubCategory: occasionCategoryDetails,
      selectedAmount: {
        value: order.amount,
        currency: order.currency,
      },
      quantity: order.quantity,
      isBulkOrder,
      companyInfo: isBulkOrder
        ? {
            companyName: order.senderName,
            contactEmail: order.senderEmail,
            contactNumber: order.receiverDetail.phone,
          }
        : null,
      deliveryOption: order.deliveryMethod,
      deliveryMethod: order.deliveryMethod,
      deliveryDetails: !isBulkOrder
        ? {
            recipientFullName: order.receiverDetail.name,
            recipientEmailAddress: order.receiverDetail.email,
            recipientWhatsAppNumber: order.receiverDetail.phone,
          }
        : null,
      personalMessage: order.message,
    };

    // ✅ PROCESS ORDER BASED ON TYPE
    if (isBulkOrder && order.bulkRecipients.length > 0) {
      await processBulkOrderQueue(order, orderData, voucherConfig);
    } else if (isBulkOrder && order.bulkRecipients.length === 0) {
      await processRegularBulkOrder(order, orderData, voucherConfig);
    } else {
      await processSingleOrderQueue(order, orderData, voucherConfig);
    }

    // ✅ CRITICAL FIX: Settlement is now called INSIDE each processing function
    // AFTER voucher generation but BEFORE email sending
    // This ensures settlement is recorded when gift cards are created,
    // not dependent on email delivery success

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Background processing completed in ${processingTime}ms for order: ${order.orderNumber}`,
    );
  } catch (error) {
    console.error(
      `❌ Background processing failed for order ${orderId}:`,
      error,
    );

    await prisma.deliveryLog.updateMany({
      where: {
        orderId,
        status: "PENDING",
      },
      data: {
        status: "FAILED",
        errorMessage: `Background processing failed: ${error.message}`,
      },
    });
  }
}

// ==================== QUEUE-BASED PROCESSING ====================
async function processSingleOrderQueue(order, orderData, voucherConfig) {
  const deliveryLog = await prisma.deliveryLog.findFirst({
    where: {
      orderId: order.id,
      status: "PENDING",
    },
  });

  if (!deliveryLog) {
    console.log(`No pending delivery log found for order ${order.id}`);
    return;
  }

  const stepStartTime = Date.now();

  try {
    // ==================== STEP 1: CREATE SHOPIFY GIFT CARD ====================
    console.log(`📝 Creating gift card for order ${order.orderNumber}`);
    const giftCardStartTime = Date.now();

    const shopifyGiftCard = await createShopifyGiftCard(
      orderData.selectedBrand,
      orderData,
      voucherConfig,
      null,
    );

    const giftCardCreationTime = Date.now() - giftCardStartTime;

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        giftCardCreated: true,
        giftCardCreatedAt: new Date(),
        giftCardShopifyId: shopifyGiftCard.id,
      },
    });

    console.log(`✅ Gift card created in ${giftCardCreationTime}ms`);

    // ==================== STEP 2: SAVE GIFT CARD TO DATABASE ====================
    const giftCardInDb = await prisma.giftCard.upsert({
      where: { shopifyId: shopifyGiftCard.id },
      update: {
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: order.receiverDetail.email,
        updatedAt: new Date(),
      },
      create: {
        shop: orderData.selectedBrand.domain,
        shopifyId: shopifyGiftCard.id,
        code: shopifyGiftCard.code,
        initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: order.receiverDetail.email,
        note: `Order ${order.orderNumber}`,
        isActive: true,
        isVirtual: true,
      },
    });

    // ==================== STEP 3: CREATE VOUCHER CODE ====================
    let expireDate = calculateExpiryDate(voucherConfig, order.amount);

    const voucherCode = await prisma.voucherCode.create({
      data: {
        code: shopifyGiftCard.maskedCode,
        orderId: order.id,
        voucherId: voucherConfig.id,
        originalValue: order.amount,
        remainingValue: order.amount,
        expiresAt: expireDate,
        isRedeemed: false,
        shopifyGiftCardId: giftCardInDb.id,
        shopifyShop: orderData.selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    const tokenizedLink = getClaimUrl(orderData.selectedBrand);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        voucherCodeId: voucherCode.id,
        voucherGenerated: true,
        voucherGeneratedAt: new Date(),
        shopifySyncStatus: "success",
        shopifySyncedAt: new Date(),
      },
    });

    console.log(`✅ Voucher code created: ${voucherCode.code}`);

    // ==================== ✅ CRITICAL FIX: UPDATE SETTLEMENT HERE ====================
    // Settlement is updated AFTER successful voucher generation
    // This ensures the gift card is actually created before recording the sale
    await updateOrCreateSettlement(orderData.selectedBrand, order);
    console.log(`✅ Settlement updated for order ${order.orderNumber}`);

    // ==================== STEP 4: SEND DELIVERY MESSAGE ====================
    // Email sending happens AFTER settlement, so settlement is not dependent on email success
    if (
      order.sendType === "sendImmediately" &&
      order.deliveryMethod !== "print"
    ) {
      const deliveryStartTime = Date.now();

      const deliveryResult = await sendDeliveryMessage(
        orderData,
        shopifyGiftCard,
        order.deliveryMethod,
      );

      const deliveryTime = Date.now() - deliveryStartTime;

      await prisma.deliveryLog.update({
        where: { id: deliveryLog.id },
        data: {
          status: deliveryResult.success ? "DELIVERED" : "FAILED",
          sentAt: new Date(),
          deliveredAt: deliveryResult.success ? new Date() : null,
          errorMessage: deliveryResult.success ? null : deliveryResult.message,

          emailServiceStatus:
            order.deliveryMethod === "email"
              ? deliveryResult.success
                ? "delivered"
                : "failed"
              : null,
          whatsappServiceStatus:
            order.deliveryMethod === "whatsapp"
              ? deliveryResult.success
                ? "delivered"
                : "failed"
              : null,

          attemptCount: 1,
          processingTimeMs: Date.now() - stepStartTime,
          deliveryLatencyMs: deliveryTime,
        },
      });

      console.log(
        `✅ Message ${deliveryResult.success ? "sent" : "failed"} in ${deliveryTime}ms`,
      );
    } else if (order.deliveryMethod === "print") {
      await prisma.deliveryLog.update({
        where: { id: deliveryLog.id },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          processingTimeMs: Date.now() - stepStartTime,
        },
      });
    } else {
      await prisma.deliveryLog.update({
        where: { id: deliveryLog.id },
        data: {
          processingTimeMs: Date.now() - stepStartTime,
        },
      });
    }
  } catch (error) {
    console.error(`❌ Failed to process single order:`, error);

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        status: "FAILED",
        errorMessage: error.message,
        voucherGenerationError: error.message,
        attemptCount: deliveryLog.attemptCount + 1,
      },
    });

    throw error;
  }
}

// ==================== REGULAR BULK ORDER (No CSV) ====================
async function processRegularBulkOrder(order, orderData, voucherConfig) {
  console.log(
    `📦 Processing regular bulk order (no CSV): ${order.orderNumber}`,
  );

  const quantity = order.quantity;
  const voucherCodes = [];

  // ✅ Generate all vouchers first
  for (let i = 0; i < quantity; i++) {
    console.log(`📝 Creating voucher ${i + 1}/${quantity}`);

    const shopifyGiftCard = await createShopifyGiftCard(
      orderData.selectedBrand,
      orderData,
      voucherConfig,
      null,
    );

    const giftCardInDb = await prisma.giftCard.upsert({
      where: { shopifyId: shopifyGiftCard.id },
      update: {
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: orderData.companyInfo.contactEmail,
        updatedAt: new Date(),
      },
      create: {
        shop: orderData.selectedBrand.domain,
        shopifyId: shopifyGiftCard.id,
        code: shopifyGiftCard.code,
        initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: orderData.companyInfo.contactEmail,
        note: `Bulk Order ${order.orderNumber} - Voucher ${i + 1}/${quantity}`,
        isActive: true,
        isVirtual: true,
      },
    });

    let expireDate = calculateExpiryDate(voucherConfig, order.amount);

    const voucherCode = await prisma.voucherCode.create({
      data: {
        code: shopifyGiftCard.maskedCode,
        orderId: order.id,
        voucherId: voucherConfig.id,
        originalValue: order.amount,
        remainingValue: order.amount,
        expiresAt: expireDate,
        isRedeemed: false,
        shopifyGiftCardId: giftCardInDb.id,
        shopifyShop: orderData.selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    const tokenizedLink = getClaimUrl(orderData.selectedBrand);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    voucherCodes.push({
      ...voucherCode,
      code: shopifyGiftCard.code,
      tokenizedLink: tokenizedLink,
    });

    console.log(
      `✅ Voucher ${i + 1}/${quantity} created: ${shopifyGiftCard.code}`,
    );
  }

  // ==================== ✅ CRITICAL FIX: UPDATE SETTLEMENT HERE ====================
  // All vouchers generated successfully, update settlement BEFORE sending emails
  await updateOrCreateSettlement(orderData.selectedBrand, order);
  console.log(`✅ Settlement updated for bulk order ${order.orderNumber}`);

  // ✅ Send bulk summary email based on deliveryOption (AFTER settlement)
  if (
    orderData.deliveryOption === "email" ||
    orderData.deliveryOption === "csv"
  ) {
    await sendRegularBulkSummaryEmail(order, orderData, voucherCodes);
  }

  console.log(`✅ Completed regular bulk order: ${order.orderNumber}`);
}

// ==================== BULK ORDER QUEUE PROCESSING (CSV Recipients) ====================
async function processBulkOrderQueue(order, orderData, voucherConfig) {
  const BATCH_SIZE = 10;

  const pendingLogs = await prisma.deliveryLog.findMany({
    where: {
      orderId: order.id,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(
    `📦 Processing ${pendingLogs.length} bulk items in batches of ${BATCH_SIZE}`,
  );

  const bulkRecipients = await prisma.bulkRecipient.findMany({
    where: { orderId: order.id },
    orderBy: { rowNumber: "asc" },
  });

  // ✅ Track successful voucher generations for settlement
  let successfulVouchers = 0;

  for (let i = 0; i < pendingLogs.length; i += BATCH_SIZE) {
    const batch = pendingLogs.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingLogs.length / BATCH_SIZE);

    console.log(
      `🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`,
    );

    // ✅ OPTIMIZED: Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(async (deliveryLog, batchIndex) => {
        const globalIndex = i + batchIndex;
        const recipient = bulkRecipients[globalIndex];

        if (!recipient) {
          console.error(
            `No recipient found for delivery log at index ${globalIndex}`,
          );
          return { success: false };
        }

        return await processBulkItemQueue(
          order,
          orderData,
          voucherConfig,
          deliveryLog,
          recipient,
          globalIndex + 1,
          pendingLogs.length,
        );
      }),
    );

    // Count successful voucher generations
    batchResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value?.success) {
        successfulVouchers++;
      }
    });

    console.log(`✅ Batch ${batchNumber}/${totalBatches} completed`);
  }

  // ==================== ✅ CRITICAL FIX: UPDATE SETTLEMENT HERE ====================
  // All vouchers generated, update settlement BEFORE sending summary emails
  // Settlement reflects actual vouchers created, not emails sent
  if (successfulVouchers > 0) {
    await updateOrCreateSettlement(orderData.selectedBrand, order);
    console.log(
      `✅ Settlement updated for ${successfulVouchers} vouchers in bulk order ${order.orderNumber}`,
    );
  }

  // ✅ Send appropriate email based on deliveryOption (AFTER settlement)
  if (orderData.deliveryOption === "email") {
    await sendBulkSummaryEmail(order, orderData, bulkRecipients);
  } else if (orderData.deliveryOption === "multiple") {
    // Individual emails already sent, still send summary
    await sendBulkSummaryEmail(order, orderData, bulkRecipients);
  }

  console.log(
    `✅ All ${pendingLogs.length} bulk items processed (${successfulVouchers} successful)`,
  );
}

// ==================== Process individual bulk item (CSV recipient) ====================
async function processBulkItemQueue(
  order,
  orderData,
  voucherConfig,
  deliveryLog,
  recipient,
  itemNumber,
  totalItems,
) {
  const stepStartTime = Date.now();

  try {
    console.log(
      `📝 Processing item ${itemNumber}/${totalItems}: ${recipient.recipientEmail}`,
    );

    const recipientData = {
      name: recipient.recipientName,
      email: recipient.recipientEmail,
      phone: recipient.recipientPhone,
      message: recipient.personalMessage,
    };

    // ==================== CREATE GIFT CARD ====================
    const shopifyGiftCard = await createShopifyGiftCard(
      orderData.selectedBrand,
      orderData,
      voucherConfig,
      recipientData,
    );

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        giftCardCreated: true,
        giftCardCreatedAt: new Date(),
        giftCardShopifyId: shopifyGiftCard.id,
      },
    });

    const giftCardInDb = await prisma.giftCard.upsert({
      where: { shopifyId: shopifyGiftCard.id },
      update: {
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: recipient.recipientEmail,
        updatedAt: new Date(),
      },
      create: {
        shop: orderData.selectedBrand.domain,
        shopifyId: shopifyGiftCard.id,
        code: shopifyGiftCard.code,
        initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
        balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
        customerEmail: recipient.recipientEmail,
        note: `Gift for ${recipient.recipientName} - Order ${order.orderNumber}`,
        isActive: true,
        isVirtual: true,
      },
    });

    let expireDate = calculateExpiryDate(voucherConfig, order.amount);

    const voucherCode = await prisma.voucherCode.create({
      data: {
        code: shopifyGiftCard.maskedCode,
        orderId: order.id,
        voucherId: voucherConfig.id,
        originalValue: order.amount,
        remainingValue: order.amount,
        expiresAt: expireDate,
        isRedeemed: false,
        shopifyGiftCardId: giftCardInDb.id,
        shopifyShop: orderData.selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    const tokenizedLink = getClaimUrl(orderData.selectedBrand);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    await prisma.bulkRecipient.update({
      where: { id: recipient.id },
      data: {
        voucherCodeId: voucherCode.id,
      },
    });

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        voucherCodeId: voucherCode.id,
        voucherGenerated: true,
        voucherGeneratedAt: new Date(),
        shopifySyncStatus: "success",
        shopifySyncedAt: new Date(),
      },
    });

    // ==================== SEND EMAIL (if deliveryOption is "multiple") ====================
    // Email sending happens AFTER voucher creation
    // If email fails, voucher was still created and settlement will be recorded
    if (orderData.deliveryOption === "multiple") {
      const deliveryStartTime = Date.now();

      const emailResult = await sendIndividualBulkEmail(
        recipient,
        { ...voucherCode, code: shopifyGiftCard.code, tokenizedLink },
        orderData,
      );

      const deliveryTime = Date.now() - deliveryStartTime;

      await prisma.deliveryLog.update({
        where: { id: deliveryLog.id },
        data: {
          status: emailResult.success ? "DELIVERED" : "FAILED",
          sentAt: new Date(),
          deliveredAt: emailResult.success ? new Date() : null,
          errorMessage: emailResult.success ? null : emailResult.error,
          emailServiceStatus: emailResult.success ? "delivered" : "failed",
          emailServiceId: emailResult.messageId || null,
          attemptCount: 1,
          processingTimeMs: Date.now() - stepStartTime,
          deliveryLatencyMs: deliveryTime,
        },
      });

      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
          emailDelivered: emailResult.success,
          emailDeliveredAt: emailResult.success ? new Date() : null,
          emailError: emailResult.success ? null : emailResult.error,
        },
      });
    } else {
      // For "email" delivery option, just mark as SENT (will get summary email later)
      await prisma.deliveryLog.update({
        where: { id: deliveryLog.id },
        data: {
          status: "SENT",
          processingTimeMs: Date.now() - stepStartTime,
        },
      });
    }

    console.log(
      `✅ Item ${itemNumber}/${totalItems} processed in ${Date.now() - stepStartTime}ms`,
    );

    return { success: true };
  } catch (error) {
    console.error(
      `❌ Failed to process item ${itemNumber}/${totalItems}:`,
      error,
    );

    await prisma.deliveryLog.update({
      where: { id: deliveryLog.id },
      data: {
        status: "FAILED",
        errorMessage: error.message,
        voucherGenerationError: error.message,
        attemptCount: deliveryLog.attemptCount + 1,
      },
    });

    await prisma.bulkRecipient.update({
      where: { id: recipient.id },
      data: {
        emailError: error.message,
      },
    });

    return { success: false };
  }
}

// ==================== HELPER FUNCTIONS ====================
function calculateExpiryDate(voucherConfig, amount) {
  let expireDate = null;

  if (voucherConfig?.denominationType === "fixed") {
    const matchedDenomination = voucherConfig?.denominations?.find(
      (d) => d?.value == amount,
    );
    expireDate =
      matchedDenomination?.isExpiry === true
        ? matchedDenomination?.expiresAt || null
        : null;
  } else if (voucherConfig?.denominationType === "amount") {
    expireDate =
      voucherConfig?.isExpiry === true
        ? voucherConfig?.expiresAt || null
        : null;
  } else if (voucherConfig?.denominationType === "both") {
    const matchedDenomination = voucherConfig?.denominations?.find(
      (d) => d?.value == amount,
    );
    expireDate =
      matchedDenomination?.isExpiry === true
        ? matchedDenomination?.expiresAt
        : voucherConfig?.isExpiry === true
          ? voucherConfig?.expiresAt || null
          : null;
  }

  return expireDate;
}

// ==================== SHOPIFY GIFT CARD OPERATIONS ====================
async function createShopifyGiftCard(
  selectedBrand,
  orderData,
  voucherConfig,
  recipientData = null,
) {
  if (!selectedBrand.domain) {
    throw new ValidationError(
      "Brand domain is required for gift card creation",
    );
  }

  const isBulkOrder = orderData.isBulkOrder === true;

  const giftCardData = {
    customerEmail:
      recipientData?.email ||
      (isBulkOrder
        ? orderData.companyInfo.contactEmail
        : orderData.deliveryDetails?.recipientEmailAddress || ""),
    firstName:
      recipientData?.name?.split(" ")[0] ||
      (isBulkOrder
        ? orderData.companyInfo.companyName.split(" ")[0]
        : orderData.deliveryDetails?.recipientFullName?.split(" ")[0] ||
          "Recipient"),
    lastName:
      recipientData?.name?.split(" ").slice(1).join(" ") ||
      (isBulkOrder
        ? orderData.companyInfo.companyName.split(" ").slice(1).join(" ")
        : orderData.deliveryDetails?.recipientFullName
            ?.split(" ")
            .slice(1)
            .join(" ") || ""),
    note: recipientData
      ? `Gift for ${recipientData.name} - ${recipientData.message || ""}`
      : isBulkOrder
        ? `Bulk Order - ${orderData.quantity} vouchers - Delivery: ${orderData.deliveryOption}`
        : `Order to be generated - Delivery Method: ${orderData.deliveryMethod}`,
    denominationValue:
      voucherConfig.denominationType === "fixed"
        ? orderData.selectedAmount.value
        : orderData.selectedAmount.value,
  };

  const apiUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
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
        errorData,
      );
    }

    const result = await response.json();

    if (!result.gift_card?.id || !result.gift_card?.maskedCode) {
      throw new ExternalServiceError(
        "Invalid Shopify gift card response - missing id or maskedCode",
        result,
      );
    }

    return result.gift_card;
  } catch (error) {
    if (error instanceof ExternalServiceError) throw error;
    throw new ExternalServiceError(
      `Failed to create Shopify gift card: ${error.message}`,
      error,
    );
  }
}

// ==================== EMAIL SENDING FUNCTIONS ====================
async function sendDeliveryMessage(orderData, giftCard, deliveryMethod) {
  try {
    if (deliveryMethod === "whatsapp") {
      return await SendWhatsappMessages(orderData, giftCard);
    } else if (deliveryMethod === "email") {
      return await SendGiftCardEmail(orderData, giftCard);
    } else if (deliveryMethod === "print") {
      return { success: true, message: "No delivery required" };
    } else {
      throw new ValidationError("Invalid delivery method specified");
    }
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof ExternalServiceError ||
      error instanceof AuthenticationError
    ) {
      throw error;
    }
    throw new ExternalServiceError(
      `Failed to send ${deliveryMethod} message: ${error.error || error.message}`,
      error,
    );
  }
}

async function sendIndividualBulkEmail(recipient, voucherCode, orderData) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    if (!senderEmail) {
      throw new Error("Missing Brevo sender email configuration");
    }

    const companyName =
      orderData.companyInfo?.companyName || "A special sender";
    const expiryDate = voucherCode.expiresAt
      ? new Date(voucherCode.expiresAt).toLocaleDateString()
      : "No Expiry";

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipient.recipientEmail, name: recipient.recipientName }],
      subject: `🎁 ${companyName} sent you a ${orderData.selectedBrand?.brandName || "Gift Card"}!`,
      htmlContent: generateIndividualGiftEmailHTML(
        recipient,
        voucherCode,
        orderData,
        orderData.selectedBrand,
        expiryDate,
        companyName,
        recipient.personalMessage,
      ),
      textContent: generateIndividualGiftEmailText(
        recipient,
        voucherCode,
        orderData,
        orderData.selectedBrand,
        expiryDate,
        companyName,
        recipient.personalMessage,
      ),
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ✅ NEW: Send summary email for regular bulk orders (no CSV)
async function sendRegularBulkSummaryEmail(order, orderData, voucherCodes) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    // Initialize Cloudinary once
    cloudinary.config({
      cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_CLOUDINARY_API_KEY,
      api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Validate Cloudinary configuration
    if (
      !process.env.NEXT_CLOUDINARY_CLOUD_NAME ||
      !process.env.NEXT_CLOUDINARY_API_KEY ||
      !process.env.NEXT_CLOUDINARY_API_SECRET
    ) {
      console.error(
        "❌ Cloudinary configuration missing. Required env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
      );
    }

    console.log("order, orderData", order, orderData);

    // Generate random password (8 characters alphanumeric)
    const csvPassword = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // Generate CSV content
    const csvHeader = "S.No,Voucher Code,Amount,Currency,Expiry Date\n";
    const csvRows = voucherCodes
      .map((vc, index) => {
        const expiryDate = vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString()
          : "No Expiry";

        return `${index + 1},${vc.code},${vc.originalValue},${orderData.selectedAmount?.currency || "₹"},${expiryDate}`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    // Convert CSV to buffer for upload
    const csvBuffer = Buffer.from(csvContent, "utf-8");

    // Upload CSV to Cloudinary with raw resource type
    const timestamp = Date.now();
    const fileName = `vouchers_${orderData.companyInfo.companyName.replace(/\s+/g, "_")}_${timestamp}`;

    // We need to upload directly since uploadFile doesn't support resource_type
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "bulk-vouchers",
            resource_type: "raw", // Important: for non-image files like CSV
            public_id: fileName,
            format: "csv",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(csvBuffer);
    });

    const csvUrl = uploadResult.secure_url;

    console.log(`✅ CSV uploaded to Cloudinary: ${csvUrl}`);

    // Get brand logo and gift card image URLs
    const brandLogoUrl = orderData.selectedBrand?.logo || "";
    const giftCardImageUrl =
      orderData.selectedSubCategory?.image || order?.occasion?.image || "";
    const brandName = orderData.selectedBrand?.brandName || "Gift Card";

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [
        {
          email: orderData.companyInfo.contactEmail,
          name: orderData.companyInfo.companyName,
        },
      ],
      subject: `🎁 Bulk Gift Card Order - ${voucherCodes.length} Vouchers Ready`,
      htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">
                🎁 Your Bulk Gift Card Order is Ready!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">
                Hi ${orderData.companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">
                Congratulations! Your bulk gift card order has been processed successfully.
              </p>
              
              <!-- Gift Card Display Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${
                      giftCardImageUrl
                        ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px; display: block;">`
                        : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2>
                      </div>`
                    }
                  </td>
                  
                  <td style="width: 40%; vertical-align: top;">
                    ${
                      brandLogoUrl
                        ? `<div style="margin-bottom: 20px;">
                        <img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 120px; height: auto; display: block;">
                      </div>`
                        : `<div style="margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ED457D;">${brandName}</h3>
                      </div>`
                    }
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Vouchers:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${voucherCodes.length}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount per Voucher:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                        ${orderData.selectedAmount?.currency || "₹"}${orderData.selectedAmount?.value || 0}
                      </p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Value:</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ED457D;">
                        ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * voucherCodes.length}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
                            
              <!-- Download Button -->
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${csvUrl}" style="display: inline-block; padding: 14px 0; width: 100%; max-width: 400px; background: linear-gradient(90deg, #ED457D 0%, #FA8F42 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(237, 69, 125, 0.3);">
                      📥 Download Voucher Codes (CSV)
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
                  Click the button above to download all ${voucherCodes.length} voucher codes<br>
                  The CSV file contains: Code, Amount, Currency, and Expiry Date
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for using our gift card platform.<br>
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Regular bulk summary email sent to ${orderData.companyInfo.contactEmail}`,
    );
    console.log(`🔐 CSV Password: ${csvPassword}`);
  } catch (error) {
    console.error(`❌ Failed to send regular bulk summary email:`, error);
  }
}

async function sendBulkSummaryEmail(order, orderData, bulkRecipients) {
  try {
    const voucherCodes = await prisma.voucherCode.findMany({
      where: { orderId: order.id },
      include: {
        giftCard: {
          select: {
            code: true,
          },
        },
      },
    });

    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [
        {
          email: orderData.companyInfo.contactEmail,
          name: orderData.companyInfo.companyName,
        },
      ],
      subject: `📊 Bulk Gift Card Order Summary - ${voucherCodes.length} Recipients`,
      htmlContent: generateBulkSummaryEmailHTML(
        order,
        orderData,
        voucherCodes,
        bulkRecipients,
      ),
      textContent: generateBulkSummaryEmailText(
        order,
        orderData,
        voucherCodes,
        bulkRecipients,
      ),
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Bulk summary email sent to ${orderData.companyInfo.contactEmail}`,
    );
  } catch (error) {
    console.error(`❌ Failed to send bulk summary email:`, error);
  }
}

// ==================== EMAIL TEMPLATES ====================
function generateIndividualGiftEmailHTML(
  recipient,
  voucherCode,
  orderData,
  selectedBrand,
  expiryDate,
  companyName,
  personalMessage,
) {
  const recipientName = recipient?.recipientName || "You";
  const currency = orderData?.selectedAmount?.currency || "₹";
  const amount =
    voucherCode?.originalValue || orderData?.selectedAmount?.value || "100";
  const giftCode = voucherCode?.code || "XXXX-XXX-XXX";
  const brandName = selectedBrand?.brandName || "Brand";
  const claimUrl = voucherCode?.tokenizedLink || "#";

  // Direct URLs without getAbsoluteUrl() function
  const brandLogoUrl = selectedBrand?.logo || null;
  const giftCardImageUrl = orderData?.selectedSubCategory?.image || null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">You have received a Gift card!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">hi ${recipientName.toLowerCase()},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">Congratulations, you've received gift card from ${companyName}.</p>
              
              ${personalMessage ? `<div style="margin-bottom: 32px;"><p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.6;">"${personalMessage}"</p></div>` : ""}
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${giftCardImageUrl ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px; display: block;">` : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #00d4ff 0%, #00a8ff 100%); border-radius: 12px;"><table role="presentation" style="width: 100%; height: 100%;"><tr><td align="center" style="vertical-align: middle;"><h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2></td></tr></table></div>`}
                  </td>
                  
                  <td style="width: 40%; vertical-align: top;">
                    ${brandLogoUrl ? `<div style="margin-bottom: 20px;"><img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 80px; height: auto; display: block;"></div>` : `<div style="margin-bottom: 20px;"><h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #e50914;">${brandName}</h3></div>`}
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Gift Code</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a; letter-spacing: 0.5px;">${giftCode}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${currency}${amount}</p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Expires:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${expiryDate}</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display: inline-block; padding: 14px 0; width: 100%; max-width: 400px; background: linear-gradient(90deg, #ff6b9d 0%, #ff8f6b 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);">Redeem Now →</a>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">Click the button above to redeem your gift card<br>Or visit: <a href="${claimUrl}" style="color: #ff6b9d; text-decoration: none;">${claimUrl}</a></p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">This gift card was sent to you by ${companyName}.<br>If you have any questions, please contact our support team.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateIndividualGiftEmailText(
  recipient,
  voucherCode,
  orderData,
  selectedBrand,
  expiryDate,
  companyName,
  personalMessage,
) {
  return `
You've Received a Gift!

Hi ${recipient.recipientName}!

${companyName} has sent you a gift card for ${selectedBrand?.brandName || "our store"}!

${personalMessage ? `Personal Message:\n"${personalMessage}"\n\n` : ""}

Your Gift Code: ${voucherCode.code}
Amount: ${orderData.selectedAmount?.currency || "₹"}${voucherCode.originalValue}
Expires: ${expiryDate}

Redeem Link: ${voucherCode.tokenizedLink}

This gift was sent by ${companyName}
  `;
}

async function sendBulkDistributionSummaryEmail(
  order,
  orderData,
  voucherCodes,
  bulkRecipients,
) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    // Generate random password (8 characters alphanumeric)
    const csvPassword = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // Generate CSV content with recipient details
    const csvHeader =
      "S.No,Recipient Name,Recipient Email,Voucher Code,Amount,Currency,Expiry Date\n";
    const csvRows = bulkRecipients
      .map((recipient, index) => {
        const voucherCode = voucherCodes[index];
        const code = voucherCode?.giftCard?.code || voucherCode?.code || "N/A";
        const expiryDate = voucherCode?.expiresAt
          ? new Date(voucherCode.expiresAt).toLocaleDateString()
          : "No Expiry";

        return `${index + 1},${recipient.recipientName},${recipient.recipientEmail},${code},${orderData.selectedAmount?.value || 0},${orderData.selectedAmount?.currency || "₹"},${expiryDate}`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    // Convert CSV to buffer for upload
    const csvBuffer = Buffer.from(csvContent, "utf-8");

    // Upload CSV to Cloudinary with raw resource type
    const timestamp = Date.now();
    const fileName = `distribution_${orderData.companyInfo.companyName.replace(/\s+/g, "_")}_${timestamp}`;

    // Upload directly since uploadFile doesn't support resource_type
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "bulk-vouchers",
            resource_type: "raw",
            public_id: fileName,
            format: "csv",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(csvBuffer);
    });

    const csvUrl = uploadResult.secure_url;

    console.log(`✅ CSV uploaded to Cloudinary: ${csvUrl}`);

    // Get brand logo and gift card image URLs
    const brandLogoUrl = orderData.selectedBrand?.logo || "";
    const giftCardImageUrl = orderData.selectedSubCategory?.image || "";
    const brandName = orderData.selectedBrand?.brandName || "Gift Card";

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [
        {
          email: orderData.companyInfo.contactEmail,
          name: orderData.companyInfo.companyName,
        },
      ],
      subject: `🎁 Gift Cards Distributed - ${bulkRecipients.length} Recipients`,
      htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">
                🎁 Gift Cards Distributed Successfully!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">
                Hi ${orderData.companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">
                Great news! Your bulk gift cards have been sent to all ${bulkRecipients.length} recipients.
              </p>
              
              <!-- Gift Card Display Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${
                      giftCardImageUrl
                        ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px; display: block;">`
                        : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2>
                      </div>`
                    }
                  </td>
                  
                  <td style="width: 40%; vertical-align: top;">
                    ${
                      brandLogoUrl
                        ? `<div style="margin-bottom: 20px;">
                        <img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 120px; height: auto; display: block;">
                      </div>`
                        : `<div style="margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ED457D;">${brandName}</h3>
                      </div>`
                    }
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Recipients:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${bulkRecipients.length}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount per Gift:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                        ${orderData.selectedAmount?.currency || "₹"}${orderData.selectedAmount?.value || 0}
                      </p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Value:</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ED457D;">
                        ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * bulkRecipients.length}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Status Message -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.6;">
                  ✅ All ${bulkRecipients.length} recipients have received their gift cards via email with individual redemption links.
                </p>
              </div>
              
              <!-- Password Display -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #1a1a1a;">
                  🔐 Distribution Report Password
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                  ${csvPassword}
                </p>
                <p style="margin: 12px 0 0; font-size: 12px; color: #6c757d;">
                  Keep this password secure. You'll need it to access the complete distribution report.
                </p>
              </div>
              
              <!-- Download Button -->
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${csvUrl}" style="display: inline-block; padding: 14px 0; width: 100%; max-width: 400px; background: linear-gradient(90deg, #ED457D 0%, #FA8F42 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(237, 69, 125, 0.3);">
                      📥 Download Distribution Report (CSV)
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
                  Download the complete report with all ${bulkRecipients.length} recipients<br>
                  Includes: Name, Email, Voucher Code, Amount, and Expiry Date
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Important Notes -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background-color: #fff4f6; border-radius: 8px; border: 1px solid #fecdd3; padding: 20px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                  📌 Important Information:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4a5568; line-height: 1.8;">
                  <li style="margin-bottom: 6px;">This summary is for your records only</li>
                  <li style="margin-bottom: 6px;">All recipients have already received individual emails</li>
                  <li style="margin-bottom: 6px;">Each voucher code can only be used once</li>
                  <li style="margin-bottom: 0;">Download the CSV for complete tracking details</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for using our gift card platform.<br>
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Bulk distribution summary email sent to ${orderData.companyInfo.contactEmail}`,
    );
    console.log(`🔐 CSV Password: ${csvPassword}`);
  } catch (error) {
    console.error(`❌ Failed to send bulk distribution summary email:`, error);
  }
}

// Alternative: If you want to keep it as a function that just generates HTML
function generateBulkSummaryEmailHTML(
  order,
  orderData,
  voucherCodes,
  bulkRecipients,
  csvUrl,
  csvPassword,
) {
  // Get brand logo and gift card image URLs
  const brandLogoUrl = orderData.selectedBrand?.logo || "";
  const giftCardImageUrl = orderData.selectedSubCategory?.image || "";
  const brandName = orderData.selectedBrand?.brandName || "Gift Card";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">
                🎁 Gift Cards Distributed Successfully!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">
                Hi ${orderData.companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">
                Great news! Your bulk gift cards have been sent to all ${bulkRecipients.length} recipients.
              </p>
              
              <!-- Gift Card Display Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${
                      giftCardImageUrl
                        ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px; display: block;">`
                        : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2>
                      </div>`
                    }
                  </td>
                  
                  <td style="width: 40%; vertical-align: top;">
                    ${
                      brandLogoUrl
                        ? `<div style="margin-bottom: 20px;">
                        <img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 120px; height: auto; display: block;">
                      </div>`
                        : `<div style="margin-bottom: 20px;">
                        <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ED457D;">${brandName}</h3>
                      </div>`
                    }
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Recipients:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${bulkRecipients.length}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount per Gift:</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                        ${orderData.selectedAmount?.currency || "₹"}${orderData.selectedAmount?.value || 0}
                      </p>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Total Value:</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ED457D;">
                        ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * bulkRecipients.length}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Status Message -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.6;">
                  ✅ All ${bulkRecipients.length} recipients have received their gift cards via email with individual redemption links.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Important Notes -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background-color: #fff4f6; border-radius: 8px; border: 1px solid #fecdd3; padding: 20px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                  📌 Important Information:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4a5568; line-height: 1.8;">
                  <li style="margin-bottom: 6px;">This summary is for your records only</li>
                  <li style="margin-bottom: 6px;">All recipients have already received individual emails</li>
                  <li style="margin-bottom: 6px;">Each voucher code can only be used once</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for using our gift card platform.<br>
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}

function generateBulkSummaryEmailText(
  order,
  orderData,
  voucherCodes,
  bulkRecipients,
) {
  return `
Gift Card Distribution Summary

Dear ${orderData.companyInfo.companyName},

Your bulk gift card order has been processed successfully.

Order Summary:
- Brand: ${orderData.selectedBrand?.brandName || "N/A"}
- Total Recipients: ${bulkRecipients.length}
- Total Value: ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * bulkRecipients.length}

Distribution Details:

${bulkRecipients
  .map((recipient, index) => {
    const voucherCode = voucherCodes[index];
    return `${index + 1}. ${recipient.recipientName} (${recipient.recipientEmail})
   Code: ${voucherCode?.giftCard?.code || voucherCode?.code || "N/A"}`;
  })
  .join("\n\n")}

Thank you for using our gift card platform.
  `;
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
      order.createdAt.getMonth() + 1,
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

// ==================== GET ORDER STATUS ====================
export async function getOrderStatus(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      brand: true,
      receiverDetail: true,
      occasion: true,
      voucherCodes: {
        include: {
          voucher: true,
          giftCard: {
            select: {
              code: true,
              balance: true,
              initialValue: true,
              expiresAt: true,
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
      error: "Order not found",
    };
  }

  const allDeliveryLogs = order.deliveryLogs;
  const pendingCount = allDeliveryLogs.filter(
    (log) => log.status === "PENDING",
  ).length;
  const completedCount = allDeliveryLogs.filter(
    (log) => log.status === "DELIVERED" || log.status === "SENT",
  ).length;
  const failedCount = allDeliveryLogs.filter(
    (log) => log.status === "FAILED",
  ).length;

  let processingStatus = "PENDING";
  if (completedCount === allDeliveryLogs.length) {
    processingStatus = "COMPLETED";
  } else if (completedCount > 0 || pendingCount > 0) {
    processingStatus = "IN_PROGRESS";
  } else if (failedCount === allDeliveryLogs.length) {
    processingStatus = "FAILED";
  }

  return {
    success: true,
    paymentStatus: order.paymentStatus,
    processingStatus,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      quantity: order.quantity,
      paymentStatus: order.paymentStatus,
      paymentIntentId: order.paymentIntentId,
      deliveryMethod: order.deliveryMethod,
      createdAt: order.createdAt,
      brand: order.brand,
      occasion: order.occasion,
      receiverDetail: order.receiverDetail,
      message: order.message,
      senderName: order.senderName,
      voucherCodes: order.voucherCodes.map((vc) => ({
        id: vc.id,
        code: vc.giftCard?.code || vc.code,
        originalValue: vc.originalValue,
        remainingValue: vc.remainingValue,
        expiresAt: vc.expiresAt,
        pin: vc.pin,
        qrCode: vc.qrCode,
        voucher: vc.voucher,
      })),
      deliveryStatus: {
        total: allDeliveryLogs.length,
        pending: pendingCount,
        completed: completedCount,
        failed: failedCount,
      },
    },
  };
}

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
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderId },
          { id: orderId },
        ],
      },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
            website: true,
            currency: true,
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
        voucherCodes: {
          include: {
            voucher: {
              select: {
                id: true,
                denominationType: true,
                partialRedemption: true,
                expiresAt: true,
                graceDays: true,
              },
            },
            redemptions: {
              orderBy: { redeemedAt: "desc" },
            },
          },
        },
        deliveryLogs: {
          orderBy: { createdAt: "desc" },
        },
        bulkRecipients: {
          include: {
            voucherCode: {
              include: {
                voucher: {
                  select: {
                    id: true,
                    denominationType: true,
                    partialRedemption: true,
                    expiresAt: true,
                    graceDays: true,
                  },
                },
                redemptions: {
                  orderBy: { redeemedAt: "desc" },
                },
              },
            },
          },
          orderBy: { rowNumber: "asc" },
        },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found", status: 404 };
    }

    // -----------------------------
    // REST OF YOUR LOGIC IS PERFECT
    // -----------------------------

    const redeemedDates = order.voucherCodes
      .map((vc) => vc.redeemedAt)
      .filter(Boolean);

    const orderRedeemedAt =
      redeemedDates.length > 0
        ? new Date(Math.max(...redeemedDates.map((d) => d.getTime())))
        : null;

    const transformedVoucherCodes = order.voucherCodes.map((vc) => {
      const totalRedeemed = vc.redemptions.reduce(
        (sum, r) => sum + (r.amountRedeemed || 0),
        0
      );

      let status = "Active";

      if (order.redemptionStatus === "Cancelled") status = "Cancelled";
      else if (vc.isRedeemed || vc.remainingValue === 0) status = "Redeemed";
      else if (vc.expiresAt && new Date(vc.expiresAt) < new Date())
        status = "Expired";
      else if (!order.isActive) status = "Inactive";

      return {
        id: vc.id,
        code: vc.code,
        orderNumber: order.orderNumber,
        user: order.user,
        voucherType: vc.voucher?.denominationType || "fixed",
        totalAmount: vc.originalValue,
        remainingAmount: vc.remainingValue,
        partialRedemption: vc.voucher?.partialRedemption || false,
        totalRedeemed,
        pendingAmount: vc.remainingValue,
        redemptionCount: vc.redemptions.length,
        lastRedemptionDate: vc.redemptions[0]?.redeemedAt || null,
        expiresAt: vc.expiresAt,
        status,
        currency: order.currency,
        redemptionHistory: vc.redemptions.map((r) => ({
          redeemedAt: r.redeemedAt,
          amountRedeemed: r.amountRedeemed,
          balanceAfter: r.balanceAfter,
          transactionId: r.transactionId,
          storeUrl: r.storeUrl,
        })),
        pin: vc.pin,
        qrCode: vc.qrCode,
        tokenizedLink: vc.tokenizedLink,
        linkExpiresAt: vc.linkExpiresAt,
        createdAt: vc.createdAt,
        redeemedAt: vc.redeemedAt,
      };
    });

    return {
      success: true,
      data: {
        ...order,
        redeemedAt: orderRedeemedAt,
        voucherCodes: transformedVoucherCodes,
        isBulkOrder: order.bulkRecipients.length > 0,
      },
    };
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return {
      success: false,
      message: "Failed to fetch order",
      error: error.message,
      status: 500,
    };
  }
}


export async function getOrdersByUserId(userId) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      select: {
        orderNumber: true,
        id: true,
      },
    });
    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error(`Error fetching orders for user ID ${userId}:`, error);
    return {
      success: false,
      message: "Failed to fetch orders for the user",
      error: error.message,
      status: 500,
    };
  }
}

export async function modifyRecipientAndResend(data) {
  try {
    const {
      orderNumber,
      receiverDetailId,
      recipientData,
      deliveryMethod,
      isBulk,
    } = data;

    if (!orderNumber || !recipientData) {
      return {
        success: false,
        message: "Missing required parameters",
        status: 400,
      };
    }

    // Normalize recipientData to always be an array
    const recipients = Array.isArray(recipientData)
      ? recipientData
      : [recipientData];

    // Validate all recipients
    for (const recipient of recipients) {
      if (!recipient.name) {
        return {
          success: false,
          message: "Name is required for all recipients",
          status: 400,
        };
      }

      if (
        (deliveryMethod === "email" || deliveryMethod === "multiple") &&
        !recipient.email
      ) {
        return {
          success: false,
          message: "Email is required for email delivery",
          status: 400,
        };
      }

      if (
        (deliveryMethod === "whatsapp" || deliveryMethod === "multiple") &&
        !recipient.phone
      ) {
        return {
          success: false,
          message: "Phone number is required for WhatsApp delivery",
          status: 400,
        };
      }
    }

    // Get order with all details FIRST to reduce transaction time
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        voucherCodes: {
          include: {
            giftCard: true,
          },
        },
        brand: true,
        occasion: true,
        receiverDetail: true,
        user: true,
        bulkRecipients: {
          include: {
            voucherCode: {
              include: {
                giftCard: true,
              },
            },
          },
          orderBy: { rowNumber: "asc" },
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

    // Determine order type based on bulkOrderNumber and deliveryMethod
    const isBulkOrderWithMultipleRecipients =
      order.bulkOrderNumber &&
      order.bulkRecipients &&
      order.bulkRecipients.length > 0 &&
      order.deliveryMethod === "multiple";

    const isBulkOrderWithSingleEmail =
      order.bulkOrderNumber &&
      order.deliveryMethod === "email" &&
      (!order.bulkRecipients || order.bulkRecipients.length === 0);

    let deliveryResults = [];
    let auditChanges = [];

    if (isBulkOrderWithMultipleRecipients) {
      // ============= BULK ORDER WITH CSV RECIPIENTS (MULTIPLE EMAILS) =============

      // Start transaction for bulk updates
      const txResult = await prisma.$transaction(async (tx) => {
        const deliveryLogs = [];
        const updatedRecipients = [];

        for (const recipientUpdate of recipients) {
          // Find the bulk recipient by ID
          const bulkRecipient = order.bulkRecipients.find(
            (br) => br.id === recipientUpdate.id,
          );

          if (!bulkRecipient) {
            console.error(`Bulk recipient not found: ${recipientUpdate.id}`);
            continue;
          }

          // Store old details for audit
          const oldDetails = {
            name: bulkRecipient.recipientName,
            email: bulkRecipient.recipientEmail,
            phone: bulkRecipient.recipientPhone,
          };

          // Update bulk recipient
          const updatedBulkRecipient = await tx.bulkRecipient.update({
            where: { id: recipientUpdate.id },
            data: {
              recipientName: recipientUpdate.name,
              recipientEmail: recipientUpdate.email || null,
              recipientPhone: recipientUpdate.phone || null,
              emailSent: false,
              emailDelivered: false,
              emailError: null,
              updatedAt: new Date(),
            },
          });

          updatedRecipients.push(updatedBulkRecipient);

          // Create delivery log for resend
          const deliveryLog = await tx.deliveryLog.create({
            data: {
              orderId: order.id,
              voucherCodeId: bulkRecipient.voucherCodeId,
              method: deliveryMethod,
              recipient:
                deliveryMethod === "whatsapp"
                  ? recipientUpdate.phone
                  : recipientUpdate.email,
              status: "PENDING",
              attemptCount: 0,
            },
          });

          deliveryLogs.push(deliveryLog);

          // Track changes for audit
          auditChanges.push({
            recipientId: recipientUpdate.id,
            oldDetails,
            newDetails: recipientUpdate,
          });
        }

        // Create audit log for bulk update
        await tx.auditLog.create({
          data: {
            action: "MODIFY_BULK_RECIPIENTS",
            entity: "BulkRecipient",
            entityId: orderNumber,
            changes: {
              orderNumber,
              recipientCount: recipients.length,
              recipients: auditChanges,
              deliveryMethod,
            },
          },
        });

        return { deliveryLogs, updatedRecipients };
      });

      // Send deliveries outside transaction
      for (let i = 0; i < txResult.updatedRecipients.length; i++) {
        const recipient = txResult.updatedRecipients[i];
        const deliveryLog = txResult.deliveryLogs[i];
        const bulkRecipient = order.bulkRecipients.find(
          (br) => br.id === recipient.id,
        );

        if (!bulkRecipient?.voucherCode?.giftCard) {
          console.error(
            `Gift card not found for bulk recipient ${recipient.id}`,
          );

          // Update delivery log as failed
          await prisma.deliveryLog.update({
            where: { id: deliveryLog.id },
            data: {
              status: "FAILED",
              errorMessage: "Gift card details not found",
              attemptCount: 1,
            },
          });

          deliveryResults.push({
            success: false,
            recipientId: recipient.id,
            recipientName: recipient.recipientName,
            error: "Gift card not found",
          });
          continue;
        }

        // Reconstruct orderData for delivery
        const deliveryOrderData = {
          selectedBrand: order.brand,
          selectedSubCategory: order.isCustom
            ? order.customCard
            : order.subCategory,
          selectedAmount: {
            value: bulkRecipient.voucherCode.originalValue || order.amount,
            currency: order.currency,
          },
          deliveryDetails: {
            recipientFullName: recipient.recipientName,
            recipientEmailAddress: recipient.recipientEmail,
            recipientWhatsAppNumber: recipient.recipientPhone,
            yourFullName: order.senderName,
          },
          personalMessage: recipient.personalMessage || order.message,
          customImageUrl: order.customImageUrl,
          customVideoUrl: order.customVideoUrl,
        };

        const giftCard = bulkRecipient.voucherCode.giftCard;

        try {
          // Resend the gift
          const deliveryResult = await sendDeliveryMessage(
            deliveryOrderData,
            giftCard,
            "email",
          );

          // Update delivery log and bulk recipient status
          await prisma.$transaction(async (tx) => {
            await tx.deliveryLog.update({
              where: { id: deliveryLog.id },
              data: {
                status: deliveryResult.success ? "SENT" : "FAILED",
                sentAt: deliveryResult.success ? new Date() : null,
                deliveredAt: deliveryResult.success ? new Date() : null,
                errorMessage: deliveryResult.success
                  ? null
                  : deliveryResult.message,
                attemptCount: 1,
              },
            });

            // Update bulk recipient email status
            if (deliveryMethod === "email" || deliveryMethod === "multiple") {
              await tx.bulkRecipient.update({
                where: { id: recipient.id },
                data: {
                  emailSent: deliveryResult.success,
                  emailSentAt: deliveryResult.success ? new Date() : null,
                  emailDelivered: deliveryResult.success,
                  emailDeliveredAt: deliveryResult.success ? new Date() : null,
                  emailError: deliveryResult.success
                    ? null
                    : deliveryResult.message,
                },
              });
            }
          });

          deliveryResults.push({
            success: deliveryResult.success,
            recipientId: recipient.id,
            recipientName: recipient.recipientName,
            message: deliveryResult.message,
          });
        } catch (error) {
          console.error(`Delivery error for recipient ${recipient.id}:`, error);

          // Update as failed
          await prisma.$transaction(async (tx) => {
            await tx.deliveryLog.update({
              where: { id: deliveryLog.id },
              data: {
                status: "FAILED",
                errorMessage: error.message,
                attemptCount: 1,
              },
            });

            await tx.bulkRecipient.update({
              where: { id: recipient.id },
              data: {
                emailError: error.message,
              },
            });
          });

          deliveryResults.push({
            success: false,
            recipientId: recipient.id,
            recipientName: recipient.recipientName,
            error: error.message,
          });
        }
      }

      // Calculate statistics
      const successCount = deliveryResults.filter((r) => r.success).length;
      const failCount = deliveryResults.filter((r) => !r.success).length;

      return {
        success: successCount > 0,
        message: `Updated ${recipients.length} recipient(s). ${successCount} voucher(s) sent successfully${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        data: {
          orderId: order.id,
          total: recipients.length,
          sent: successCount,
          failed: failCount,
          results: deliveryResults,
        },
      };
    } else if (isBulkOrderWithSingleEmail) {
      // ============= BULK ORDER WITH SINGLE EMAIL (MULTIPLE VOUCHERS TO ONE RECIPIENT) =============

      const recipientUpdate = recipients[0];

      if (!receiverDetailId || order.receiverDetailId !== receiverDetailId) {
        return {
          success: false,
          message: "Receiver detail ID does not match the order.",
          status: 400,
        };
      }

      const oldReceiverDetails = {
        name: order.receiverDetail.name,
        email: order.receiverDetail.email,
        phone: order.receiverDetail.phone,
      };

      // Get all voucher codes for this bulk order
      const voucherCodes = order.voucherCodes;

      if (!voucherCodes || voucherCodes.length === 0) {
        return {
          success: false,
          message: "No voucher codes found for this bulk order",
          status: 404,
        };
      }

      // Start transaction for write operations only
      const txResult = await prisma.$transaction(async (tx) => {
        // 1. Update ReceiverDetail
        const updatedReceiver = await tx.receiverDetail.update({
          where: { id: receiverDetailId },
          data: {
            name: recipientUpdate.name,
            email:
              deliveryMethod === "email" || deliveryMethod === "multiple"
                ? recipientUpdate.email
                : null,
            phone:
              deliveryMethod === "whatsapp" || deliveryMethod === "multiple"
                ? recipientUpdate.phone
                : null,
            updatedAt: new Date(),
          },
        });

        // 2. Create delivery log for resend (one log for the bulk email)
        const deliveryLog = await tx.deliveryLog.create({
          data: {
            orderId: order.id,
            voucherCodeId: null, // No specific voucher for bulk email
            method: deliveryMethod,
            recipient:
              deliveryMethod === "whatsapp"
                ? recipientUpdate.phone
                : recipientUpdate.email,
            status: "PENDING",
            attemptCount: 0,
          },
        });

        // 3. Create audit log
        await tx.auditLog.create({
          data: {
            action: "MODIFY_BULK_EMAIL_RECIPIENT",
            entity: "ReceiverDetail",
            entityId: receiverDetailId,
            changes: {
              orderNumber,
              oldDetails: oldReceiverDetails,
              newDetails: recipientUpdate,
              deliveryMethod,
              voucherCount: voucherCodes.length,
            },
          },
        });

        return { deliveryLog, updatedReceiver };
      });

      // Prepare all voucher codes for the bulk email
      const voucherCodesData = voucherCodes.map((vc) => ({
        ...vc,
        code: vc.giftCard?.code || vc.code,
        tokenizedLink: vc.tokenizedLink,
      }));

      // Reconstruct orderData for bulk email delivery
      const orderData = {
        selectedBrand: order.brand,
        selectedSubCategory: order.isCustom
          ? order.customCard
          : order.subCategory,
        selectedAmount: {
          value: order.amount,
          currency: order.currency,
        },
        quantity: order.quantity,
        isBulkOrder: true,
        companyInfo: {
          companyName: order.senderName || "Gift Sender",
          contactEmail: recipientUpdate.email,
          contactNumber: recipientUpdate.phone,
        },
        deliveryOption: "email",
        deliveryMethod: "email",
        personalMessage: order.message,
        customImageUrl: order.customImageUrl,
        customVideoUrl: order.customVideoUrl,
      };

      try {
        // Send bulk summary email with all vouchers
        await sendRegularBulkSummaryEmail(order, orderData, voucherCodesData);

        // Update delivery log as successful
        await prisma.deliveryLog.update({
          where: { id: txResult.deliveryLog.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            deliveredAt: new Date(),
            attemptCount: 1,
          },
        });

        return {
          success: true,
          message: `Recipient updated and bulk gift email with ${voucherCodes.length} voucher(s) sent successfully.`,
          data: {
            orderId: order.id,
            deliveryLogId: txResult.deliveryLog.id,
            voucherCount: voucherCodes.length,
          },
        };
      } catch (error) {
        console.error("Error sending bulk email:", error);

        // Update delivery log as failed
        await prisma.deliveryLog.update({
          where: { id: txResult.deliveryLog.id },
          data: {
            status: "FAILED",
            errorMessage: error.message,
            attemptCount: 1,
          },
        });

        return {
          success: false,
          message: `Failed to send bulk email: ${error.message}`,
          status: 500,
        };
      }
    } else {
      // ============= SINGLE ORDER PROCESSING =============

      const recipientUpdate = recipients[0];

      if (!receiverDetailId || order.receiverDetailId !== receiverDetailId) {
        return {
          success: false,
          message: "Receiver detail ID does not match the order.",
          status: 400,
        };
      }

      const oldReceiverDetails = {
        name: order.receiverDetail.name,
        email: order.receiverDetail.email,
        phone: order.receiverDetail.phone,
      };

      // Start transaction for write operations only
      const txResult = await prisma.$transaction(async (tx) => {
        // 1. Update ReceiverDetail
        const updatedReceiver = await tx.receiverDetail.update({
          where: { id: receiverDetailId },
          data: {
            name: recipientUpdate.name,
            email:
              deliveryMethod === "email" || deliveryMethod === "multiple"
                ? recipientUpdate.email
                : null,
            phone:
              deliveryMethod === "whatsapp" || deliveryMethod === "multiple"
                ? recipientUpdate.phone
                : null,
            updatedAt: new Date(),
          },
        });

        // 2. Create delivery log for resend
        const deliveryLog = await tx.deliveryLog.create({
          data: {
            orderId: order.id,
            voucherCodeId: order.voucherCodes[0]?.id,
            method: deliveryMethod,
            recipient:
              deliveryMethod === "whatsapp"
                ? recipientUpdate.phone
                : recipientUpdate.email,
            status: "PENDING",
            attemptCount: 0,
          },
        });

        // 3. Create audit log
        await tx.auditLog.create({
          data: {
            action: "MODIFY_RECIPIENT",
            entity: "ReceiverDetail",
            entityId: receiverDetailId,
            changes: {
              orderNumber,
              oldDetails: oldReceiverDetails,
              newDetails: recipientUpdate,
              deliveryMethod,
            },
          },
        });

        return { deliveryLog, updatedReceiver };
      });

      // Reconstruct orderData for delivery
      const deliveryOrderData = {
        selectedBrand: order.brand,
        selectedSubCategory: order.isCustom
          ? order.customCard
          : order.subCategory,
        selectedAmount: {
          value: order.amount,
          currency: order.currency,
        },
        deliveryDetails: {
          recipientFullName: recipientUpdate.name,
          recipientEmailAddress: recipientUpdate.email,
          recipientWhatsAppNumber: recipientUpdate.phone,
          yourFullName: order.senderName,
        },
        personalMessage: order.message,
        customImageUrl: order.customImageUrl,
        customVideoUrl: order.customVideoUrl,
      };

      const giftCard = order.voucherCodes[0]?.giftCard;

      if (!giftCard) {
        throw new Error("Gift card details not found for this order.");
      }

      // Resend the gift
      const deliveryResult = await sendDeliveryMessage(
        deliveryOrderData,
        giftCard,
        deliveryMethod,
      );

      // Update delivery log with the result
      await prisma.deliveryLog.update({
        where: { id: txResult.deliveryLog.id },
        data: {
          status: deliveryResult.success ? "SENT" : "FAILED",
          sentAt: deliveryResult.success ? new Date() : null,
          deliveredAt: deliveryResult.success ? new Date() : null,
          errorMessage: deliveryResult.success ? null : deliveryResult.message,
          attemptCount: 1,
        },
      });

      if (!deliveryResult.success) {
        throw new ExternalServiceError(
          `Message delivery failed: ${deliveryResult.message}`,
          deliveryResult,
        );
      }

      return {
        success: true,
        message: "Recipient updated and gift resent successfully.",
        data: {
          orderId: order.id,
          deliveryLogId: txResult.deliveryLog.id,
        },
      };
    }
  } catch (error) {
    console.error("Error modifying recipient:", error);
    if (error.code === "P2028") {
      return {
        success: false,
        message: "Database is busy, please try again later.",
        status: 503,
      };
    }
    return {
      success: false,
      message: error.message || "An internal error occurred",
      status: 500,
    };
  }
}

export const getOrderDetails = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
            website: true,
            currency: true,
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
        voucherCodes: {
          include: {
            voucher: {
              select: {
                id: true,
                denominationType: true,
                partialRedemption: true,
                expiresAt: true,
                graceDays: true,
              },
            },
            redemptions: {
              orderBy: { redeemedAt: "desc" },
            },
          },
        },
        deliveryLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found", status: 404 };
    }

    // Compute redeemedAt for the order based on its voucher codes
    const redeemedDates = order.voucherCodes
      .map((vc) => vc.redeemedAt)
      .filter(Boolean);

    const orderRedeemedAt =
      redeemedDates.length > 0
        ? new Date(Math.max(...redeemedDates.map((d) => d.getTime())))
        : null;

    // Transform voucher codes to match VoucherDetails component structure
    const transformedVoucherCodes = order.voucherCodes.map((vc) => {
      // Calculate totals from redemptions
      const totalRedeemed = vc.redemptions.reduce(
        (sum, r) => sum + (r.amountRedeemed || 0),
        0,
      );

      const redemptionCount = vc.redemptions.length;

      const lastRedemptionDate =
        vc.redemptions.length > 0 ? vc.redemptions[0].redeemedAt : null;

      // Determine voucher status - CHECK ORDER REDEMPTION STATUS FIRST
      let status = "Active";

      // Priority 1: Check if order is cancelled
      if (order.redemptionStatus === "Cancelled") {
        status = "Cancelled";
      }
      // Priority 2: Check if voucher is fully redeemed
      else if (vc.isRedeemed || vc.remainingValue === 0) {
        status = "Redeemed";
      }
      // Priority 3: Check if voucher is expired
      else if (vc.expiresAt && new Date(vc.expiresAt) < new Date()) {
        status = "Expired";
      }
      // Priority 4: Check if order is inactive
      else if (!order.isActive) {
        status = "Inactive";
      }

      // Transform redemption history to match VoucherDetails format
      const redemptionHistory = vc.redemptions.map((r) => ({
        redeemedAt: r.redeemedAt,
        amountRedeemed: r.amountRedeemed,
        balanceAfter: r.balanceAfter,
        transactionId: r.transactionId,
        storeUrl: r.storeUrl,
      }));

      return {
        id: vc.id,
        code: vc.code,
        orderNumber: order.orderNumber,
        user: {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
        },
        voucherType: vc.voucher?.denominationType || "fixed",
        totalAmount: vc.originalValue,
        remainingAmount: vc.remainingValue,
        partialRedemption: vc.voucher?.partialRedemption || false,
        totalRedeemed: totalRedeemed,
        pendingAmount: vc.remainingValue,
        redemptionCount: redemptionCount,
        lastRedemptionDate: lastRedemptionDate,
        expiresAt: vc.expiresAt,
        status: status,
        currency: order.currency,
        redemptionHistory: redemptionHistory,
        // Additional fields that might be useful
        pin: vc.pin,
        qrCode: vc.qrCode,
        tokenizedLink: vc.tokenizedLink,
        linkExpiresAt: vc.linkExpiresAt,
        createdAt: vc.createdAt,
        redeemedAt: vc.redeemedAt,
      };
    });
    // Attach computed fields to the order object
    const enrichedOrder = {
      ...order,
      redeemedAt: orderRedeemedAt,
      voucherCodes: transformedVoucherCodes,
    };

    return { success: true, data: enrichedOrder };
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    return {
      success: false,
      message: "Failed to fetch order",
      error: error.message,
      status: 500,
    };
  }
};
