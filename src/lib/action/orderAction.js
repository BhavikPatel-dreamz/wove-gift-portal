"use server";

import { prisma } from "../db.js";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage.js";
import * as brevo from "@getbrevo/brevo";

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

// ==================== DATABASE OPERATIONS ====================
async function createReceiverDetail(orderData) {
  try {
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
          name:
            deliveryDetails.recipientFullName || deliveryDetails?.recipientName,
          email:
            deliveryMethod === "email"
              ? deliveryDetails.recipientEmailAddress
              : null,
          phone:
            deliveryMethod === "whatsapp"
              ? deliveryDetails.recipientWhatsAppNumber
              : null,
        },
      });
    }
  } catch (error) {
    throw new Error(`Failed to create receiver detail: ${error.message}`);
  }
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

    console.log("=======pending order data========", orderData);

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    orderData.userId = userId;
    validateOrderData(orderData);

    const isBulkOrder = orderData.isBulkOrder === true;
    const receiver = await createReceiverDetail(orderData);

    const quantity =
      isBulkOrder && orderData.csvRecipients?.length > 0
        ? orderData.csvRecipients.length
        : orderData.quantity || 1;

    const amount = Number(orderData.selectedAmount.value);
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;

    const orderBase = {
      orderNumber: generateOrderNumber(),
      brandId: orderData.selectedBrand.id,
      occasionId: orderData.selectedOccasion,
      isCustom:
        orderData.selectedSubCategory.category === "custom" ||
        orderData.selectedSubCategory.category === "CUSTOM",
      subCategoryId:
        orderData.selectedSubCategory.category === "custom" ||
        orderData.selectedSubCategory.category === "CUSTOM"
          ? null
          : orderData.selectedSubCategory?.id,
      customCardId:
        orderData.selectedSubCategory.category === "custom" ||
        orderData.selectedSubCategory.category === "CUSTOM"
          ? orderData.selectedSubCategory?.id
          : null,
      userId: String(userId),
      receiverDetailId: receiver.id,
      amount,
      quantity,
      subtotal,
      discount,
      totalAmount,
      currency: orderData.selectedAmount.currency || "USD",
      paymentMethod: "stripe",
      customImageUrl: orderData.customImageUrl || null,
      customVideoUrl: orderData.customVideoUrl || null,
      paymentStatus: "PENDING",
      redemptionStatus: "Issued",
      isActive: true,
    };

    let order;
    if (isBulkOrder) {
      const scheduledFor =
        orderData.selectedTiming?.type === "schedule"
          ? new Date(
              orderData.selectedTiming.year,
              orderData.selectedTiming.month,
              orderData.selectedTiming.date,
              Number(orderData.selectedTiming.time.split(":")[0]),
              Number(orderData.selectedTiming.time.split(":")[1]),
            )
          : null;

      order = await prisma.order.create({
        data: {
          ...orderBase,
          bulkOrderNumber: `BULK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          deliveryMethod: orderData.deliveryOption || "email",
          message: orderData.personalMessage || "",
          senderName: orderData.companyInfo.companyName,
          sendType: "sendImmediately",
          scheduledFor: scheduledFor,
          senderEmail: orderData.companyInfo.contactEmail,
        },
      });

      if (orderData.csvRecipients && orderData.csvRecipients.length > 0) {
        console.log(
          `📝 Storing ${orderData.csvRecipients.length} CSV recipients in database`,
        );

        const bulkRecipientsData = orderData.csvRecipients.map(
          (recipient, index) => ({
            orderId: order.id,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            recipientPhone: recipient.phone || null,
            personalMessage:
              recipient.message || orderData.personalMessage || null,
            rowNumber: recipient.rowNumber || index + 1,
            voucherCodeId: null,
          }),
        );

        await prisma.bulkRecipient.createMany({
          data: bulkRecipientsData,
          skipDuplicates: true,
        });

        console.log(
          `✅ Successfully stored ${bulkRecipientsData.length} recipients for order ${order.orderNumber}`,
        );
      }
    } else {
      const scheduledFor =
        orderData.selectedTiming?.type === "schedule"
          ? new Date(
              orderData.selectedTiming.year,
              orderData.selectedTiming.month,
              orderData.selectedTiming.date,
              Number(orderData.selectedTiming.time.split(":")[0]),
              Number(orderData.selectedTiming.time.split(":")[1]),
            )
          : null;

      order = await prisma.order.create({
        data: {
          ...orderBase,
          deliveryMethod: orderData.deliveryMethod || "whatsapp",
          message: orderData.personalMessage || "",
          senderName: orderData.deliveryDetails?.yourFullName || null,
          sendType:
            orderData.selectedTiming?.type === "immediate"
              ? "sendImmediately"
              : "scheduleLater",
          scheduledFor,
          senderEmail: orderData.deliveryDetails?.yourEmailAddress || null,
        },
      });
    }

    console.log("✅ Pending order created:", order.orderNumber);

    // ==================== CRITICAL FIX STARTS HERE ====================
    
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ CHECK: Is this part of a multi-cart checkout?
    const isMultiCart = orderData.sharedPaymentIntentId;
    
    let paymentIntent;
    let customerId = orderData.customerId; // May be passed from first order

    if (isMultiCart) {
      // ✅ REUSE existing payment intent from first order
      console.log(`🔗 Linking order ${order.orderNumber} to shared payment intent: ${orderData.sharedPaymentIntentId}`);
      
      paymentIntent = await stripe.paymentIntents.retrieve(
        orderData.sharedPaymentIntentId
      );
      
      // Update the payment intent amount to include this order
      const currentAmount = paymentIntent.amount;
      const newAmount = currentAmount + Math.round(totalAmount * 100);
      
      paymentIntent = await stripe.paymentIntents.update(
        orderData.sharedPaymentIntentId,
        {
          amount: newAmount,
          description: `${paymentIntent.description} + ${order.orderNumber}`,
        }
      );
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentIntentId: paymentIntent.id,
        },
      });
      
      console.log(`✅ Order ${order.orderNumber} linked to shared payment intent (Total: $${newAmount / 100})`);
      
      return {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientSecret: paymentIntent.client_secret,
          customerId: paymentIntent.customer,
          paymentIntentId: paymentIntent.id,
          isShared: true,
        },
      };
      
    } else {
      // ✅ CREATE NEW payment intent (first order in cart)
      console.log(`🆕 Creating new payment intent for order ${order.orderNumber}`);
      
      const customerName = isBulkOrder
        ? orderData.companyInfo.companyName
        : orderData.deliveryDetails?.yourFullName || "Customer";

      const customerEmail = isBulkOrder
        ? orderData.companyInfo.contactEmail
        : orderData.deliveryDetails?.yourEmailAddress || null;

      if (!orderData.billingAddress) {
        throw new ValidationError(
          "Billing address is required for payment processing",
        );
      }

      const customerAddress = {
        line1: orderData.billingAddress.line1,
        line2: orderData.billingAddress.line2 || null,
        city: orderData.billingAddress.city,
        state: orderData.billingAddress.state,
        postal_code: orderData.billingAddress.postalCode,
        country: orderData.billingAddress.country,
      };

      const customer = await stripe.customers.create({
        name: customerName,
        email: customerEmail,
        address: customerAddress,
        metadata: {
          userId: String(userId),
          firstOrderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      const exportDescription = generateExportDescription(
        orderData,
        order.orderNumber,
      );

      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: (orderData.selectedAmount.currency || "USD").toLowerCase(),
        customer: customer.id,
        description: exportDescription,
        metadata: {
          firstOrderId: order.id,
          orderNumber: order.orderNumber,
          brandName: orderData.selectedBrand?.brandName || "Gift Card",
          userId: String(userId),
        },
        statement_descriptor: "GIFT CARD",
        statement_descriptor_suffix: `GC${order.orderNumber.slice(-8)}`,
        automatic_payment_methods: {
          enabled: true,
        },
        shipping:
          customerAddress.line1 !== "N/A"
            ? {
                name: customerName,
                address: customerAddress,
              }
            : null,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentIntentId: paymentIntent.id,
        },
      });

      console.log("✅ PaymentIntent created for first order:", paymentIntent.id);

      return {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientSecret: paymentIntent.client_secret,
          customerId: customer.id,
          paymentIntentId: paymentIntent.id, // ✅ Return this for subsequent orders
          isShared: false,
        },
      };
    }
    
    // ==================== CRITICAL FIX ENDS HERE ====================
    
  } catch (error) {
    console.error("❌ Pending order creation failed:", error);

    if (
      error instanceof ValidationError ||
      error instanceof AuthenticationError
    ) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        errorType: error.name,
      };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      statusCode: 500,
      errorType: "InternalServerError",
    };
  }
};

// ==================== STEP 2: COMPLETE ORDER AFTER PAYMENT (WEBHOOK) ====================
export const completeOrderAfterPayment = async (orderId, paymentDetails) => {
  try {
    console.log(`🔄 Starting order completion for: ${orderId}`);

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

    if (isBulkOrder && order.bulkRecipients.length > 0) {
      await processBulkOrderQueue(order, orderData, voucherConfig);
    } else if (isBulkOrder && order.bulkRecipients.length === 0) {
      await processRegularBulkOrder(order, orderData, voucherConfig);
    } else {
      await processSingleOrderQueue(order, orderData, voucherConfig);
    }

    await updateOrCreateSettlement(selectedBrand, order);

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

    // ✅ STEP 5: Send delivery message (ONLY for single orders, NOT bulk)
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
  console.log(`📦 Processing regular bulk order (no CSV): ${order.orderNumber}`);
  
  const quantity = order.quantity;
  const voucherCodes = [];

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

    console.log(`✅ Voucher ${i + 1}/${quantity} created: ${shopifyGiftCard.code}`);
  }

  // ✅ Send bulk summary email based on deliveryOption
  if (orderData.deliveryOption === "email" || orderData.deliveryOption === "csv") {
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

  for (let i = 0; i < pendingLogs.length; i += BATCH_SIZE) {
    const batch = pendingLogs.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingLogs.length / BATCH_SIZE);

    console.log(
      `🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`,
    );

    await Promise.all(
      batch.map(async (deliveryLog, batchIndex) => {
        const globalIndex = i + batchIndex;
        const recipient = bulkRecipients[globalIndex];

        if (!recipient) {
          console.error(
            `No recipient found for delivery log at index ${globalIndex}`,
          );
          return;
        }

        await processBulkItemQueue(
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

    console.log(`✅ Batch ${batchNumber}/${totalBatches} completed`);
  }

  // ✅ After all items processed, send appropriate email based on deliveryOption
  if (orderData.deliveryOption === "email") {
    // Send summary email to company contact only
    await sendBulkSummaryEmail(order, orderData, bulkRecipients);
  } else if (orderData.deliveryOption === "multiple") {
    // Individual emails already sent in processBulkItemQueue
    // Still send summary to company contact
    await sendBulkSummaryEmail(order, orderData, bulkRecipients);
  }

  console.log(`✅ All ${pendingLogs.length} bulk items processed`);
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

    // ✅ ONLY send individual emails if deliveryOption is "multiple"
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
      // ✅ For "email" delivery option, just mark as SENT (will get summary email later)
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

    const summaryRows = voucherCodes
      .map((vc, index) => {
        const expiryDate = vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString()
          : "No Expiry";

        return `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-size: 13px; color: #4a5568; text-align: center;">${index + 1}</td>
      <td style="padding: 12px 8px; font-size: 12px; color: #1a1a1a; font-family: 'Courier New', monospace;">${vc.code}</td>
      <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; text-align: center;">${orderData.selectedAmount?.currency || "₹"}${vc.originalValue}</td>
      <td style="padding: 12px 8px; font-size: 12px; color: #4a5568; text-align: center;">${expiryDate}</td>
    </tr>
    `;
      })
      .join("");

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [
        {
          email: orderData.companyInfo.contactEmail,
          name: orderData.companyInfo.companyName,
        },
      ],
      subject: `📊 Bulk Gift Card Order - ${voucherCodes.length} Vouchers`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 800px; max-width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">📊 Bulk Gift Card Order</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 600;">Dear ${orderData.companyInfo.companyName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a;">Your bulk gift card order has been processed successfully.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;"><strong>Brand:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${orderData.selectedBrand?.brandName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;"><strong>Total Vouchers:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${voucherCodes.length}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;"><strong>Total Value:</strong></td>
                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ED457D; text-align: right;">
                      ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * voucherCodes.length}
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">🎁 Your Voucher Codes</h3>
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background: #f8f9fa;">
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">#</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Voucher Code</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Amount</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${summaryRows}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">Thank you for using our gift card platform.</p>
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
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 50px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎁</div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                You've Received<br>a Gift!
              </h1>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 20px; color: #1a1a1a; font-weight: 600;">
                  Hi ${recipient.recipientName}! 👋
                </p>
                <p style="margin: 0; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                  ${companyName} has sent you a gift card for <strong style="color: #ED457D;">${selectedBrand?.brandName || "our store"}</strong>
                </p>
              </div>
              
              ${
                personalMessage
                  ? `
              <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe4b5 100%); border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 32px; border-radius: 12px;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #856404; text-transform: uppercase; font-weight: 600;">Personal Message</p>
                <p style="margin: 0; font-size: 15px; color: #856404; font-style: italic;">"${personalMessage}"</p>
              </div>
              `
                  : ""
              }
              
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 24px; font-size: 20px; color: #1a1a1a; font-weight: 600; text-align: center;">Your Gift Card Details</h3>
                
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d; text-transform: uppercase; text-align: center;">Your Gift Code</p>
                  <div style="background: #ffffff; border: 3px dashed #ED457D; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 3px;">
                      ${voucherCode.code}
                    </p>
                  </div>
                </div>
                
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; padding: 16px; text-align: center; background-color: #ffffff; border-radius: 8px;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d;">Amount</p>
                      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #ED457D;">
                        ${orderData.selectedAmount?.currency || "₹"}${voucherCode.originalValue}
                      </p>
                    </div>
                    <div style="display: table-cell; width: 50%; padding: 16px; text-align: center; background-color: #ffffff; border-radius: 8px;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d;">Expires</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${expiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${voucherCode.tokenizedLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 18px; font-weight: 600;">
                  Redeem Your Gift →
                </a>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 40px; background: #f8f9fa;">
              <p style="margin: 0; font-size: 13px; color: #6c757d; text-align: center;">
                This gift was sent by ${companyName}
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

function generateBulkSummaryEmailHTML(
  order,
  orderData,
  voucherCodes,
  bulkRecipients,
) {
  const summaryRows = bulkRecipients
    .map((recipient, index) => {
      const voucherCode = voucherCodes[index];
      const expiryDate = voucherCode?.expiresAt
        ? new Date(voucherCode.expiresAt).toLocaleDateString()
        : "No Expiry";

      return `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-size: 13px; color: #4a5568; text-align: center;">${index + 1}</td>
      <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a;">${recipient.recipientName}</td>
      <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a;">${recipient.recipientEmail}</td>
      <td style="padding: 12px 8px; font-size: 12px; color: #1a1a1a; font-family: 'Courier New', monospace;">${voucherCode?.giftCard?.code || voucherCode?.code || "N/A"}</td>
      <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; text-align: center;">${orderData.selectedAmount?.currency || "₹"}${voucherCode?.originalValue || 0}</td>
      <td style="padding: 12px 8px; font-size: 12px; color: #4a5568; text-align: center;">${expiryDate}</td>
    </tr>
    `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 900px; max-width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">📊 Gift Card Distribution Summary</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 600;">Dear ${orderData.companyInfo.companyName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a;">Your bulk gift card order has been processed successfully.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;"><strong>Brand:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${orderData.selectedBrand?.brandName || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;"><strong>Total Recipients:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">${bulkRecipients.length}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;"><strong>Total Value:</strong></td>
                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ED457D; text-align: right;">
                      ${orderData.selectedAmount?.currency || "₹"}${(orderData.selectedAmount?.value || 0) * bulkRecipients.length}
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📋 Distribution Details</h3>
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background: #f8f9fa;">
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">#</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Name</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Email</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Code</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Amount</th>
                        <th style="padding: 14px 8px; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${summaryRows}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">Thank you for using our gift card platform.</p>
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

    // Transform bulk recipients if they exist
    const transformedBulkRecipients = order.bulkRecipients.map((br) => {
      const voucherCode = br.voucherCode;

      // Calculate voucher status if voucher code exists
      let voucherStatus = "Pending";
      if (voucherCode) {
        const totalRedeemed =
          voucherCode.redemptions?.reduce(
            (sum, r) => sum + (r.amountRedeemed || 0),
            0,
          ) || 0;

        if (order.redemptionStatus === "Cancelled") {
          voucherStatus = "Cancelled";
        } else if (voucherCode.isRedeemed || voucherCode.remainingValue === 0) {
          voucherStatus = "Redeemed";
        } else if (
          voucherCode.expiresAt &&
          new Date(voucherCode.expiresAt) < new Date()
        ) {
          voucherStatus = "Expired";
        } else if (!order.isActive) {
          voucherStatus = "Inactive";
        } else {
          voucherStatus = "Active";
        }
      }

      return {
        id: br.id,
        recipientName: br.recipientName,
        recipientEmail: br.recipientEmail,
        recipientPhone: br.recipientPhone,
        personalMessage: br.personalMessage,
        emailSent: br.emailSent,
        emailSentAt: br.emailSentAt,
        emailDelivered: br.emailDelivered,
        emailDeliveredAt: br.emailDeliveredAt,
        emailError: br.emailError,
        rowNumber: br.rowNumber,
        voucherCodeId: br.voucherCodeId,
        voucherCode: voucherCode
          ? {
              id: voucherCode.id,
              code: voucherCode.code,
              originalValue: voucherCode.originalValue,
              remainingValue: voucherCode.remainingValue,
              isRedeemed: voucherCode.isRedeemed,
              redeemedAt: voucherCode.redeemedAt,
              expiresAt: voucherCode.expiresAt,
              status: voucherStatus,
              redemptionCount: voucherCode.redemptions?.length || 0,
            }
          : null,
      };
    });

    // Attach computed fields to the order object
    const enrichedOrder = {
      ...order,
      redeemedAt: orderRedeemedAt,
      voucherCodes: transformedVoucherCodes,
      bulkRecipients: transformedBulkRecipients,
      isBulkOrder: order.bulkRecipients.length > 0,
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

    // Determine if this is a bulk order
    const isBulkOrder =
      isBulk || (order.bulkRecipients && order.bulkRecipients.length > 0);

    let deliveryResults = [];
    let auditChanges = [];

    if (isBulkOrder) {
      // ============= BULK ORDER PROCESSING =============

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

        console.log("deliveryMethod", deliveryMethod);

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
