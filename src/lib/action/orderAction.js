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

    // Validate CSV recipients for 'multiple' option
    if (orderData.deliveryOption === "multiple") {
      if (!orderData.csvRecipients || orderData.csvRecipients.length === 0) {
        throw new ValidationError(
          "CSV recipients are required for individual delivery",
        );
      }

      // Validate each recipient
      orderData.csvRecipients.forEach((recipient, index) => {
        if (!recipient.name || !recipient.email) {
          throw new ValidationError(
            `Row ${index + 1}: Name and email are required`,
          );
        }

        // Validate email format
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

    // For CSV recipients, quantity should match the number of recipients
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
          deliveryMethod: orderData.deliveryMethod || "email",
          message: orderData.personalMessage || "",
          senderName: orderData.companyInfo.companyName,
          sendType:"sendImmediately",
          scheduledFor: scheduledFor,
          senderEmail: orderData.companyInfo.contactEmail,
        },
      });

      // ✅ NEW: Store CSV recipients in BulkRecipient table (without voucherCodeId for now)
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
            // voucherCodeId will be updated after payment when vouchers are created
            voucherCodeId: null, // Temporary placeholder
          }),
        );

        // Create all bulk recipients in one transaction
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

    // Stripe payment setup
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
        orderId: order.id,
        orderNumber: order.orderNumber,
        deliveryOption: orderData.deliveryOption || "single",
        hasCSVRecipients:
          orderData.csvRecipients?.length > 0 ? "true" : "false",
      },
    });

    const exportDescription = generateExportDescription(
      orderData,
      order.orderNumber,
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: (orderData.selectedAmount.currency || "USD").toLowerCase(),
      customer: customer.id,
      description: exportDescription,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        brandName: orderData.selectedBrand?.brandName || "Gift Card",
        quantity: String(quantity),
        exportDescription: exportDescription,
        userId: String(userId),
        deliveryOption: orderData.deliveryOption || "single",
        hasCSVRecipients:
          orderData.csvRecipients?.length > 0 ? "true" : "false",
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

    console.log("✅ PaymentIntent created with compliance data");

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
      },
    };
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

  // Use recipient data if provided (for CSV recipients), otherwise use company/order data
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

// ==================== REGULAR BULK ORDER (NO CSV) ====================
async function processBulkOrder(
  selectedBrand,
  orderData,
  order,
  voucherConfig,
) {
  try {
    const quantity = orderData.quantity || 1;
    const voucherCodes = [];
    const giftCards = [];

    for (let i = 0; i < quantity; i++) {
      const shopifyGiftCard = await createShopifyGiftCard(
        selectedBrand,
        orderData,
        voucherConfig,
      );

      const giftCardInDb = await prisma.giftCard.upsert({
        where: { shopifyId: shopifyGiftCard.id },
        update: {
          balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
          customerEmail: orderData.companyInfo.contactEmail,
          updatedAt: new Date(),
        },
        create: {
          shop: selectedBrand.domain,
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

      let expireDate = null;
      if (voucherConfig?.denominationType === "fixed") {
        const matchedDenomination = voucherConfig?.denominations?.find(
          (d) => d?.value == order?.amount,
        );
        expireDate =
          matchedDenomination?.isExpiry === true
            ? matchedDenomination?.expiresAt || null
            : null;
      } else {
        expireDate =
          voucherConfig?.isExpiry === true
            ? voucherConfig?.expiresAt || null
            : null;
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
          shopifyGiftCardId: giftCardInDb.id,
          shopifyShop: selectedBrand.domain,
          shopifySyncedAt: new Date(),
        },
      });

      const tokenizedLink = getClaimUrl(selectedBrand);
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
      giftCards.push(shopifyGiftCard);
    }

    return { voucherCodes, giftCards };
  } catch (error) {
    throw new Error(`Failed to process bulk order: ${error.message}`);
  }
}

// ==================== ENHANCED BULK DELIVERY WITH DUAL EMAIL SYSTEM ====================
export async function sendBulkDelivery(
  orderData,
  voucherCodes,
  giftCards,
  bulkRecipients = [],
) {
  try {
    const { deliveryMethod, companyInfo } = orderData;

    console.log("***********main****", orderData);

    // ==================== OPTION 1: CSV ATTACHMENT TO MAIN PERSON ONLY ====================
    if (deliveryMethod === "csv") {
      console.log("📎 Generating CSV file for bulk delivery");

      const csvHeader =
        "Voucher Code,Amount,Currency,Expires At,Redemption Link\n";
      const csvRows = voucherCodes
        .map((vc) => {
          const expiryDate = vc.expiresAt
            ? new Date(vc.expiresAt).toLocaleDateString()
            : "No Expiry";
          return `${vc.code},${vc.originalValue},${orderData.selectedAmount.currency},${expiryDate},${vc.tokenizedLink}`;
        })
        .join("\n");

      const csvContent = csvHeader + csvRows;
      const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

      if (!senderEmail) {
        throw new Error("Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL");
      }

      const csvBuffer = Buffer.from(csvContent, "utf-8");
      const csvBase64 = csvBuffer.toString("base64");
      const fileName = `gift-cards-${Date.now()}.csv`;

      const sendSmtpEmail = {
        sender: { email: senderEmail, name: senderName },
        to: [
          { email: companyInfo.contactEmail, name: companyInfo.companyName },
        ],
        subject: `Bulk Gift Card Order - ${voucherCodes.length} Vouchers (CSV Attached)`,
        htmlContent: generateCSVEmailTemplate(orderData, voucherCodes),
        textContent: generateCSVEmailTextTemplate(orderData, voucherCodes),
        attachment: [{ content: csvBase64, name: fileName }],
      };

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log("✅ CSV email sent successfully");

      return {
        success: true,
        message: "CSV file sent to email successfully",
        messageId: response.messageId,
        recipient: companyInfo.contactEmail,
        vouchersCount: voucherCodes.length,
        deliveryMethod: "csv",
      };
    }

    // ==================== OPTION 2: ALL CODES IN ONE EMAIL TO MAIN PERSON ONLY ====================
    else if (deliveryMethod === "email") {
      console.log("📧 Sending all voucher codes in one email");

      const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

      if (!senderEmail) {
        throw new Error("Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL");
      }

      const sendSmtpEmail = {
        sender: { email: senderEmail, name: senderName },
        to: [
          { email: companyInfo.contactEmail, name: companyInfo.companyName },
        ],
        subject: `Bulk Gift Card Order - ${voucherCodes.length} Vouchers`,
        htmlContent: generateBulkEmailTemplate(orderData, voucherCodes),
        textContent: generateBulkEmailTextTemplate(orderData, voucherCodes),
      };

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log("✅ Bulk email sent successfully");

      return {
        success: true,
        message: "All voucher codes sent in single email successfully",
        messageId: response.messageId,
        recipient: companyInfo.contactEmail,
        vouchersCount: voucherCodes.length,
        deliveryMethod: "email",
      };
    }

    // ==================== OPTION 3: INDIVIDUAL EMAILS + SUMMARY TO MAIN PERSON ====================
    else if (deliveryMethod === "multiple" && bulkRecipients.length > 0) {
      console.log(
        `📧 Dual delivery: Individual emails + Summary to main person`,
      );

      // ✅ STEP 1: Send individual emails to each recipient
      const individualResults = await sendIndividualEmailsToRecipients(
        orderData,
        bulkRecipients,
        orderData.selectedBrand,
      );

      // ✅ STEP 2: Send summary email to main person (company contact)
      const summaryResult = await sendSummaryEmailToMainPerson(
        orderData,
        voucherCodes,
        bulkRecipients,
        individualResults,
      );

      // Combine results
      return {
        success: true,
        message: `Sent ${individualResults.totalSent} individual emails and 1 summary email`,
        individualResults: individualResults.results,
        summaryResult: summaryResult,
        totalSent: individualResults.totalSent,
        totalFailed: individualResults.totalFailed,
        deliveryMethod: "multiple",
      };
    }

    return { success: true, message: "Bulk delivery processed" };
  } catch (error) {
    console.error("❌ Bulk delivery failed:", error);
    throw new ExternalServiceError(
      `Failed to send bulk delivery: ${error.message}`,
      error,
    );
  }
}

// ==================== EMAIL TEMPLATE 1: CSV ATTACHMENT ====================
function generateCSVEmailTemplate(orderData, voucherCodes) {
  const { companyInfo, selectedBrand, selectedAmount } = orderData;

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
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                🎉 Bulk Gift Card Order Confirmed
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                Dear ${companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                Your bulk gift card order has been successfully processed. All voucher codes are attached as a CSV file for easy distribution.
              </p>
              
              <!-- Order Summary Box -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; padding: 24px; margin-bottom: 24px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Brand:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${selectedBrand?.brandName || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Total Vouchers:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${voucherCodes.length}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Amount per Voucher:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${selectedAmount?.currency || "₹"}${selectedAmount?.value || "0"}
                    </td>
                  </tr>
                  <tr style="border-top: 2px solid #e2e8f0;">
                    <td style="padding: 12px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">
                      <strong>Total Value:</strong>
                    </td>
                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ED457D; text-align: right;">
                      ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * voucherCodes.length}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CSV File Info -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 24px; margin-right: 12px;">📎</span>
                  <p style="margin: 0; font-size: 16px; color: #856404; font-weight: 600;">CSV File Attached</p>
                </div>
                <p style="margin: 8px 0 0; font-size: 14px; color: #856404; line-height: 1.6;">
                  The attached CSV file contains all ${voucherCodes.length} voucher codes with their details including code, amount, expiry date, and redemption link.
                </p>
              </div>
              
              <!-- How to Use -->
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📋 How to Use the CSV File</h3>
                <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 2;">
                  <li>Download and open the attached CSV file in Excel or Google Sheets</li>
                  <li>Each row contains a unique voucher code and redemption link</li>
                  <li>Copy the codes to distribute to your recipients</li>
                  <li>Recipients can redeem their codes at ${selectedBrand?.brandName || "the brand"}</li>
                </ol>
              </div>
              
              <!-- Sample Preview -->
              <div style="margin-top: 24px; padding: 16px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 600;">Sample Voucher Code:</p>
                <div style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px dashed #ED457D;">
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${voucherCodes[0]?.code || "XXXX-XXXX-XXXX"}</p>
                </div>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                  <strong>Need help?</strong> Contact our support team at any time.<br>
                  For questions about redemption, visit ${selectedBrand?.website || selectedBrand?.domain || "the brand website"}.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for choosing our gift card platform.<br>
                This order was placed by ${companyInfo.companyName}
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

function generateCSVEmailTextTemplate(orderData, voucherCodes) {
  const { companyInfo, selectedBrand, selectedAmount } = orderData;

  return `
Bulk Gift Card Order Confirmation

Dear ${companyInfo.companyName},

Your bulk gift card order has been successfully processed.

Order Summary:
- Brand: ${selectedBrand?.brandName || "N/A"}
- Total Vouchers: ${voucherCodes.length}
- Amount per Voucher: ${selectedAmount?.currency || "₹"}${selectedAmount?.value || "0"}
- Total Value: ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * voucherCodes.length}

CSV File Attached:
The attached CSV file contains all ${voucherCodes.length} voucher codes with their details.

How to Use:
1. Download and open the attached CSV file
2. Each row contains a unique voucher code and redemption link
3. Distribute the codes to your recipients
4. Recipients can redeem at ${selectedBrand?.brandName || "the brand"}

Sample Code: ${voucherCodes[0]?.code || "XXXX-XXXX-XXXX"}

Thank you for choosing our gift card platform.
  `;
}

// ==================== EMAIL TEMPLATE 2: ALL CODES IN ONE EMAIL ====================
function generateBulkEmailTemplate(orderData, voucherCodes) {
  const { companyInfo, selectedBrand, selectedAmount } = orderData;

  // Generate voucher rows for HTML table
  const voucherRows = voucherCodes
    .map((vc, index) => {
      const expiryDate = vc.expiresAt
        ? new Date(vc.expiresAt).toLocaleDateString()
        : "No Expiry";

      return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 13px; color: #4a5568; text-align: center;">
          ${index + 1}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; font-family: 'Courier New', monospace; font-weight: 600;">
          ${vc.code}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; text-align: center;">
          ${selectedAmount?.currency || "₹"}${vc.originalValue}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #4a5568; text-align: center;">
          ${expiryDate}
        </td>
        <td style="padding: 12px 8px; text-align: center;">
          <a href="${vc.tokenizedLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); color: #ffffff; text-decoration: none; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            Redeem
          </a>
        </td>
      </tr>
      `;
    })
    .join("");

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
        <table role="presentation" style="width: 800px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                🎉 Your Bulk Gift Cards Are Ready!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                Dear ${companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                Your bulk gift card order has been successfully processed. Below are all your voucher codes ready to distribute.
              </p>
              
              <!-- Order Summary -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Brand:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${selectedBrand?.brandName || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Total Vouchers:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${voucherCodes.length}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Amount per Voucher:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${selectedAmount?.currency || "₹"}${selectedAmount?.value || "0"}
                    </td>
                  </tr>
                  <tr style="border-top: 2px solid #e2e8f0;">
                    <td style="padding: 12px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">
                      <strong>Total Value:</strong>
                    </td>
                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ED457D; text-align: right;">
                      ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * voucherCodes.length}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Voucher Codes Table -->
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">🎁 Your Voucher Codes</h3>
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    <thead>
                      <tr style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
                        <th style="padding: 14px 8px; text-align: center; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">#</th>
                        <th style="padding: 14px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Voucher Code</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Amount</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Expires</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${voucherRows}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- How to Use -->
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📋 How to Use These Codes</h3>
                <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 2;">
                  <li>Copy the voucher code you want to use or share</li>
                  <li>Click the "Redeem" button or visit ${selectedBrand?.brandName || "the brand"}</li>
                  <li>Enter the voucher code at checkout</li>
                  <li>Enjoy your purchase or gift!</li>
                </ol>
              </div>
              
              <!-- Tip Box -->
              <div style="margin-top: 24px; padding: 16px; background-color: #e7f5ff; border-left: 4px solid #0d6efd; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #084298; line-height: 1.6;">
                  <strong>💡 Tip:</strong> You can forward this email to your team or copy individual codes to share with recipients.
                </p>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                  <strong>Need help?</strong> Contact our support team at any time.<br>
                  For questions about redemption, visit ${selectedBrand?.website || selectedBrand?.domain || "the brand website"}.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for choosing our gift card platform.<br>
                This order was placed by ${companyInfo.companyName}
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

function generateBulkEmailTextTemplate(orderData, voucherCodes) {
  const { companyInfo, selectedBrand, selectedAmount } = orderData;

  return `
Bulk Gift Card Order - All Codes

Dear ${companyInfo.companyName},

Your bulk gift card order has been successfully processed.

Order Summary:
- Brand: ${selectedBrand?.brandName || "N/A"}
- Total Vouchers: ${voucherCodes.length}
- Amount per Voucher: ${selectedAmount?.currency || "₹"}${selectedAmount?.value || "0"}
- Total Value: ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * voucherCodes.length}

Your Voucher Codes:

${voucherCodes
  .map((vc, index) => {
    const expiryDate = vc.expiresAt
      ? new Date(vc.expiresAt).toLocaleDateString()
      : "No Expiry";
    return `${index + 1}. ${vc.code}
   Amount: ${selectedAmount?.currency || "₹"}${vc.originalValue}
   Expires: ${expiryDate}
   Redeem: ${vc.tokenizedLink}`;
  })
  .join("\n\n")}

How to Use:
1. Copy the voucher code you want to use
2. Visit ${selectedBrand?.brandName || "the brand"}
3. Enter the voucher code at checkout
4. Enjoy your gift!

Thank you for choosing our gift card platform.
  `;
}

// ==================== SEND INDIVIDUAL EMAILS TO EACH RECIPIENT ====================
async function sendIndividualEmailsToRecipients(
  orderData,
  bulkRecipients,
  selectedBrand,
) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    if (!senderEmail) {
      throw new Error("Missing Brevo sender email configuration");
    }

    const results = [];
    const companyName =
      orderData.companyInfo?.companyName || "A special sender";

    console.log(
      `📧 Sending individual emails to ${bulkRecipients.length} recipients`,
    );

    for (const recipient of bulkRecipients) {
      try {
        const voucherCode = await prisma.voucherCode.findUnique({
          where: { id: recipient.voucherCodeId },
          include: {
            voucher: true,
            giftCard: true, // ✅ Include the GiftCard relation
          },
        });

        if (!voucherCode) {
          throw new Error(
            `Voucher code not found for recipient ${recipient.recipientEmail}`,
          );
        }

        // ✅ Get the full code from GiftCard table
        const fullCode = voucherCode.giftCard?.code || voucherCode.code;

        if (!fullCode) {
          throw new Error(
            `Gift card code not found for recipient ${recipient.recipientEmail}`,
          );
        }

        const expiryDate = voucherCode.expiresAt
          ? new Date(voucherCode.expiresAt).toLocaleDateString()
          : "No Expiry";

        const personalMessage =
          recipient.personalMessage || orderData.personalMessage || "";

        const sendSmtpEmail = {
          sender: { email: senderEmail, name: senderName },
          to: [
            { email: recipient.recipientEmail, name: recipient.recipientName },
          ],
          subject: `🎁 ${companyName} sent you a ${selectedBrand?.brandName || "Gift Card"}!`,
          htmlContent: generateIndividualGiftEmailHTML(
            recipient,
            { ...voucherCode, code: fullCode }, // ✅ Pass the full code
            orderData,
            selectedBrand,
            expiryDate,
            companyName,
            personalMessage,
          ),
          textContent: generateIndividualGiftEmailText(
            recipient,
            { ...voucherCode, code: fullCode }, // ✅ Pass the full code
            orderData,
            selectedBrand,
            expiryDate,
            companyName,
            personalMessage,
          ),
        };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        await prisma.bulkRecipient.update({
          where: { id: recipient.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
            emailDelivered: true,
            emailDeliveredAt: new Date(),
          },
        });

        results.push({
          recipientEmail: recipient.recipientEmail,
          recipientName: recipient.recipientName,
          voucherCode: fullCode, // ✅ Use the full code in results
          success: true,
          messageId: response.messageId,
        });

        console.log(`✅ Individual email sent to ${recipient.recipientEmail}`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        await prisma.bulkRecipient.update({
          where: { id: recipient.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
            emailError: error.message,
          },
        });

        results.push({
          recipientEmail: recipient.recipientEmail,
          recipientName: recipient.recipientName,
          success: false,
          error: error.message,
        });

        console.error(
          `❌ Failed to send email to ${recipient.recipientEmail}:`,
          error.message,
        );
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(
      `✅ Individual email sending complete: ${successCount} succeeded, ${failCount} failed`,
    );

    return {
      success: true,
      message: `Sent ${successCount} emails successfully, ${failCount} failed`,
      results,
      totalSent: successCount,
      totalFailed: failCount,
    };
  } catch (error) {
    throw new Error(`Failed to send individual emails: ${error.message}`);
  }
}

// ==================== NEW: SEND SUMMARY EMAIL TO MAIN PERSON ====================
async function sendSummaryEmailToMainPerson(
  orderData,
  voucherCodes,
  bulkRecipients,
  individualResults,
) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    if (!senderEmail) {
      throw new Error("Missing Brevo sender email configuration");
    }

    const { companyInfo, selectedBrand, selectedAmount } = orderData;

    console.log(
      `📧 Sending summary email to main person: ${companyInfo.contactEmail}`,
    );

    // Generate summary table with recipient info
    const summaryRows = bulkRecipients
      .map((recipient, index) => {
        const result = individualResults.results.find(
          (r) => r.recipientEmail === recipient.recipientEmail,
        );
        const voucherCode = voucherCodes[index];
        const expiryDate = voucherCode?.expiresAt
          ? new Date(voucherCode.expiresAt).toLocaleDateString()
          : "No Expiry";

        const statusBadge = result?.success
          ? '<span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">✓ SENT</span>'
          : '<span style="background-color: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">✗ FAILED</span>';

        return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; font-size: 13px; color: #4a5568; text-align: center;">
            ${index + 1}
          </td>
          <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a;">
            ${recipient.recipientName}
          </td>
          <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a;">
            ${recipient.recipientEmail}
          </td>
          <td style="padding: 12px 8px; font-size: 12px; color: #1a1a1a; font-family: 'Courier New', monospace;">
            ${voucherCode?.code || "N/A"}
          </td>
          <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; text-align: center;">
            ${selectedAmount?.currency || "₹"}${voucherCode?.originalValue || 0}
          </td>
          <td style="padding: 12px 8px; font-size: 12px; color: #4a5568; text-align: center;">
            ${expiryDate}
          </td>
          <td style="padding: 12px 8px; text-align: center;">
            ${statusBadge}
          </td>
        </tr>
        `;
      })
      .join("");

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: companyInfo.contactEmail, name: companyInfo.companyName }],
      subject: `📊 Bulk Gift Card Order Summary - ${bulkRecipients.length} Recipients`,
      htmlContent: `
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
        <table role="presentation" style="width: 900px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                📊 Gift Card Distribution Summary
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                Dear ${companyInfo.companyName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                Your bulk gift card order has been processed and distributed. Here's a complete summary of all recipients and their gift cards.
              </p>
              
              <!-- Order Summary Box -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #ED457D; padding: 24px; margin-bottom: 32px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Brand:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${selectedBrand?.brandName || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Total Recipients:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${bulkRecipients.length}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Successfully Sent:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #28a745; text-align: right; font-weight: 600;">
                      ${individualResults.totalSent}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Failed:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #dc3545; text-align: right; font-weight: 600;">
                      ${individualResults.totalFailed}
                    </td>
                  </tr>
                  <tr style="border-top: 2px solid #e2e8f0;">
                    <td style="padding: 12px 0 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">
                      <strong>Total Value:</strong>
                    </td>
                    <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #ED457D; text-align: right;">
                      ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * bulkRecipients.length}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Distribution Details Table -->
              <div style="margin-top: 32px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1a1a1a;">📋 Distribution Details</h3>
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    <thead>
                      <tr style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
                        <th style="padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">#</th>
                        <th style="padding: 14px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Recipient Name</th>
                        <th style="padding: 14px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Email</th>
                        <th style="padding: 14px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Voucher Code</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Amount</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Expires</th>
                        <th style="padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${summaryRows}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Info Box -->
              <div style="margin-top: 32px; padding: 20px; background-color: #e7f5ff; border-left: 4px solid #0d6efd; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #084298; font-weight: 600;">
                  ℹ️ What Happened
                </p>
                <p style="margin: 0; font-size: 14px; color: #084298; line-height: 1.6;">
                  Each recipient has received an individual email with their personal gift card code. This summary email contains all voucher codes for your records.
                </p>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                  <strong>Need help?</strong> If any emails failed to deliver, please contact our support team.<br>
                  We can resend failed emails or provide alternative delivery methods.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center; line-height: 1.6;">
                Thank you for using our gift card platform.<br>
                This summary was sent to ${companyInfo.companyEmail || companyInfo.contactEmail}
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
      textContent: `
Gift Card Distribution Summary

Dear ${companyInfo.companyName},

Your bulk gift card order has been processed and distributed.

Order Summary:
- Brand: ${selectedBrand?.brandName || "N/A"}
- Total Recipients: ${bulkRecipients.length}
- Successfully Sent: ${individualResults.totalSent}
- Failed: ${individualResults.totalFailed}
- Total Value: ${selectedAmount?.currency || "₹"}${(selectedAmount?.value || 0) * bulkRecipients.length}

Distribution Details:

${bulkRecipients
  .map((recipient, index) => {
    const result = individualResults.results.find(
      (r) => r.recipientEmail === recipient.recipientEmail,
    );
    const voucherCode = voucherCodes[index];
    const status = result?.success ? "✓ SENT" : "✗ FAILED";
    return `${index + 1}. ${recipient.recipientName} (${recipient.recipientEmail})
   Code: ${voucherCode?.code || "N/A"}
   Status: ${status}`;
  })
  .join("\n\n")}

What Happened:
Each recipient has received an individual email with their personal gift card code. This summary email contains all voucher codes for your records.

Thank you for using our gift card platform.
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Summary email sent to ${companyInfo.contactEmail}`);

    return {
      success: true,
      messageId: response.messageId,
      recipient: companyInfo.contactEmail,
      recipientCount: bulkRecipients.length,
    };
  } catch (error) {
    console.error("❌ Failed to send summary email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

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
              <!-- Greeting -->
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 20px; color: #1a1a1a; font-weight: 600;">
                  Hi ${recipient.recipientName}! 👋
                </p>
                <p style="margin: 0; font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                  ${companyName} has sent you a gift card for <strong style="color: #ED457D;">${selectedBrand?.brandName || "our store"}</strong>
                </p>
              </div>
              
              <!-- Personal Message (if exists) -->
              ${
                personalMessage
                  ? `
              <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe4b5 100%); border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 32px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 24px; margin-right: 12px;">💌</span>
                  <div>
                    <p style="margin: 0 0 8px; font-size: 12px; color: #856404; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Personal Message</p>
                    <p style="margin: 0; font-size: 15px; color: #856404; font-style: italic; line-height: 1.6;">
                      "${personalMessage}"
                    </p>
                  </div>
                </div>
              </div>
              `
                  : ""
              }
              
              <!-- Gift Card Details -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 24px; font-size: 20px; color: #1a1a1a; font-weight: 600; text-align: center;">
                  Your Gift Card Details
                </h3>
                
                <!-- Voucher Code Box -->
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; text-align: center;">
                    Your Gift Code
                  </p>
                  <div style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 3px dashed #ED457D; border-radius: 12px; padding: 20px; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 3px; word-break: break-all;">
                      ${voucherCode.code}
                    </p>
                  </div>
                </div>
                
                <!-- Amount and Expiry Grid -->
                <div style="display: table; width: 100%; border-collapse: collapse;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; padding: 16px; text-align: center; background-color: #ffffff; border-radius: 8px 0 0 8px; border-right: 1px solid #e9ecef;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 600;">Amount</p>
<p style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                        ${orderData.selectedAmount?.currency || "₹"}${voucherCode.originalValue}
                      </p>
                    </div>
                    <div style="display: table-cell; width: 50%; padding: 16px; text-align: center; background-color: #ffffff; border-radius: 0 8px 8px 0;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #6c757d; text-transform: uppercase; font-weight: 600;">Expires</p>
                      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                        ${expiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${voucherCode.tokenizedLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ED457D 0%, #FA8F42 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(237, 69, 125, 0.3); transition: transform 0.2s;">
                  Redeem Your Gift →
                </a>
              </div>
              
              <!-- How to Use -->
              <div style="background-color: #e7f5ff; border-left: 4px solid #0d6efd; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="font-size: 24px; margin-right: 12px;">ℹ️</span>
                  <div style="flex: 1;">
                    <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #084298;">
                      How to Use Your Gift Card
                    </p>
                    <ol style="margin: 0; padding-left: 20px; color: #084298; font-size: 14px; line-height: 1.8;">
                      <li>Click the <strong>"Redeem Your Gift"</strong> button above</li>
                      <li>Or visit <strong>${selectedBrand?.website || selectedBrand?.domain || "the brand website"}</strong></li>
                      <li>Enter code <strong>${voucherCode.code}</strong> at checkout</li>
                      <li>Enjoy your purchase! 🎉</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <!-- Quick Copy Section -->
              <div style="text-align: center; padding: 16px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <p style="margin: 0; font-size: 12px; color: #6c757d;">
                  Quick copy code: <strong style="color: #1a1a1a;">${voucherCode.code}</strong>
                </p>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                  Questions? We're here to help!<br>
                  Visit ${selectedBrand?.website || selectedBrand?.domain || "our website"} for support
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-top: 1px solid #dee2e6;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6c757d; text-align: center; line-height: 1.6;">
                This gift was sent with love by<br>
                <strong style="color: #1a1a1a; font-size: 14px;">${companyName}</strong>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #adb5bd; text-align: center;">
                Powered by Gift Card Platform
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

Your Gift Card Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code: ${voucherCode.code}
Amount: ${orderData.selectedAmount?.currency || "₹"}${voucherCode.originalValue}
Expires: ${expiryDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How to Use:
1. Visit ${selectedBrand?.website || selectedBrand?.domain || "the brand website"}
2. Enter code ${voucherCode.code} at checkout
3. Enjoy your purchase!

Redeem Link: ${voucherCode.tokenizedLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This gift was sent by ${companyName}
  `;
}

// ==================== COMPLETE ORDER AFTER PAYMENT ====================
export const completeOrderAfterPayment = async (orderId, paymentDetails) => {
  let voucherCodeIds = [];
  let order;

  try {
    order = await prisma.order.findUnique({
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
        // ✅ NEW: Include bulk recipients stored during pending order creation
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

    if (order.paymentStatus === "COMPLETED") {
      console.log("Order already completed:", orderId);
      return { success: true, message: "Order already completed" };
    }

    const isBulkOrder = !!order.bulkOrderNumber;
    const selectedBrand = order.brand;

    if (!selectedBrand.vouchers || selectedBrand.vouchers.length === 0) {
      throw new ValidationError("Brand does not have voucher configuration");
    }
    const voucherConfig = selectedBrand.vouchers[0];

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        paymentIntentId: paymentDetails.paymentIntentId,
        paidAt: new Date(),
      },
    });

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

    // ✅ NEW: Get CSV recipients from BulkRecipient table instead of metadata
    const bulkRecipientsFromDB = order.bulkRecipients || [];
    const hasCsvRecipients = bulkRecipientsFromDB.length > 0;

    console.log(
      `📋 Found ${bulkRecipientsFromDB.length} recipients in database for order ${order.orderNumber}`,
    );

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
      deliveryOption:
        paymentDetails.deliveryOption || (isBulkOrder ? "email" : null),
      deliveryMethod: order.deliveryMethod,
      deliveryDetails: !isBulkOrder
        ? {
            recipientFullName: order.receiverDetail.name,
            recipientEmailAddress: order.receiverDetail.email,
            recipientWhatsAppNumber: order.receiverDetail.phone,
            recipientCountryCode: order.receiverDetail.countryCode,
          }
        : null,
      personalMessage: order.message,
    };

    if (isBulkOrder) {
      let result;

      if (hasCsvRecipients) {
        console.log(
          `📝 Processing bulk order with ${bulkRecipientsFromDB.length} CSV recipients from database`,
        );

        // ✅ Pass the BulkRecipient records to processing function
        result = await processBulkOrderWithRecipientsFromDB(
          selectedBrand,
          orderData,
          order,
          voucherConfig,
          bulkRecipientsFromDB, // Pass existing BulkRecipient records
        );
      } else {
        console.log("📝 Processing regular bulk order");
        result = await processBulkOrder(
          selectedBrand,
          orderData,
          order,
          voucherConfig,
        );
      }

      const { voucherCodes, giftCards, bulkRecipients = [] } = result;
      voucherCodeIds = voucherCodes.map((vc) => vc.id);

      await updateOrCreateSettlement(selectedBrand, order);

      let deliveryResult = null;
      if (order.sendType === "sendImmediately") {
        deliveryResult = await sendBulkDelivery(
          orderData,
          voucherCodes,
          giftCards,
          bulkRecipients,
        );

        for (const voucherCode of voucherCodes) {
          await createDeliveryLog(
            order,
            voucherCode.id,
            orderData,
            deliveryResult,
          );
        }
      }

      console.log("✅ Bulk order completed:", order.orderNumber);

      return {
        success: true,
        data: {
          order,
          voucherCodes,
          giftCards,
          bulkRecipients,
          deliveryResult,
        },
      };
    } else {
      // Process single order
      const { voucherCode, giftCard, shopifyGiftCard } =
        await processSingleOrder(
          selectedBrand,
          orderData,
          order,
          voucherConfig,
        );

      voucherCodeIds = [voucherCode.id];

      await updateOrCreateSettlement(selectedBrand, order);

      let deliveryResult = null;
      if (order.sendType === "sendImmediately") {
        deliveryResult = await sendDeliveryMessage(
          orderData,
          shopifyGiftCard,
          orderData.deliveryMethod,
        );

        if (!deliveryResult.success && orderData.deliveryMethod !== "print") {
          throw new ExternalServiceError(
            `Message delivery failed: ${deliveryResult.message}`,
            deliveryResult,
          );
        }

        await createDeliveryLog(
          order,
          voucherCode.id,
          orderData,
          deliveryResult,
        );
      }

      console.log("✅ Order completed:", order.orderNumber);

      return {
        success: true,
        data: {
          order,
          voucherCode,
          giftCard,
        },
      };
    }
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

    if (voucherCodeIds.length > 0) {
      await prisma.voucherCode
        .deleteMany({
          where: { id: { in: voucherCodeIds } },
        })
        .catch((e) =>
          console.error(
            `Failed to delete voucher codes for order ${orderId}: ${e.message}`,
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

// ==================== NEW: PROCESS BULK ORDER WITH RECIPIENTS FROM DATABASE ====================
async function processBulkOrderWithRecipientsFromDB(
  selectedBrand,
  orderData,
  order,
  voucherConfig,
  bulkRecipientsFromDB, // Existing BulkRecipient records from database
) {
  try {
    const quantity = bulkRecipientsFromDB.length;
    const voucherCodes = [];
    const giftCards = [];
    const updatedBulkRecipients = [];

    console.log(`📝 Processing ${quantity} recipients from database`);

    for (let i = 0; i < quantity; i++) {
      const recipientRecord = bulkRecipientsFromDB[i];

      // Create recipient data object for Shopify
      const recipientData = {
        name: recipientRecord.recipientName,
        email: recipientRecord.recipientEmail,
        phone: recipientRecord.recipientPhone,
        message: recipientRecord.personalMessage,
      };

      console.log(
        `Processing recipient ${i + 1}/${quantity}: ${recipientData.email}`,
      );

      // Create Shopify gift card for this specific recipient
      const shopifyGiftCard = await createShopifyGiftCard(
        selectedBrand,
        orderData,
        voucherConfig,
        recipientData,
      );

      // Save gift card to database
      const giftCardInDb = await prisma.giftCard.upsert({
        where: { shopifyId: shopifyGiftCard.id },
        update: {
          balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
          customerEmail: recipientData.email,
          updatedAt: new Date(),
        },
        create: {
          shop: selectedBrand.domain,
          shopifyId: shopifyGiftCard.id,
          code: shopifyGiftCard.code,
          initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
          balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
          customerEmail: recipientData.email,
          note: `Gift for ${recipientData.name} - Order ${order.orderNumber}`,
          isActive: true,
          isVirtual: true,
        },
      });

      // Calculate expiry date
      let expireDate = null;
      if (voucherConfig?.denominationType === "fixed") {
        const matchedDenomination = voucherConfig?.denominations?.find(
          (d) => d?.value == order?.amount,
        );
        expireDate =
          matchedDenomination?.isExpiry === true
            ? matchedDenomination?.expiresAt || null
            : null;
      } else {
        expireDate =
          voucherConfig?.isExpiry === true
            ? voucherConfig?.expiresAt || null
            : null;
      }

      // Create voucher code
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
          shopifyShop: selectedBrand.domain,
          shopifySyncedAt: new Date(),
        },
      });

      // Generate tokenized link
      const tokenizedLink = getClaimUrl(selectedBrand);
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
      giftCards.push(shopifyGiftCard);

      // ✅ UPDATE existing BulkRecipient record with voucherCodeId
      const updatedBulkRecipient = await prisma.bulkRecipient.update({
        where: { id: recipientRecord.id },
        data: {
          voucherCodeId: voucherCode.id,
        },
      });

      updatedBulkRecipients.push(updatedBulkRecipient);

      console.log(
        `✅ Created and linked voucher ${voucherCode.code} to recipient ${recipientData.name}`,
      );
    }

    console.log(
      `✅ Successfully processed all ${quantity} recipients from database`,
    );

    return { voucherCodes, giftCards, bulkRecipients: updatedBulkRecipients };
  } catch (error) {
    throw new Error(
      `Failed to process bulk order with recipients from DB: ${error.message}`,
    );
  }
}

// ==================== HELPER FUNCTIONS FOR SINGLE ORDER ====================
async function processSingleOrder(
  selectedBrand,
  orderData,
  order,
  voucherConfig,
) {
  try {
    const shopifyGiftCard = await createShopifyGiftCard(
      selectedBrand,
      orderData,
      voucherConfig,
    );

    const giftCardInDb = await prisma.giftCard.upsert({
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

    let expireDate = null;
    if (voucherConfig?.denominationType === "fixed") {
      const matchedDenomination = voucherConfig?.denominations?.find(
        (d) => d?.value == order?.amount,
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
        (d) => d?.value == order?.amount,
      );
      expireDate =
        matchedDenomination?.isExpiry === true
          ? matchedDenomination?.expiresAt
          : voucherConfig?.isExpiry === true
            ? voucherConfig?.expiresAt || null
            : null;
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
        shopifyGiftCardId: giftCardInDb.id,
        shopifyShop: selectedBrand.domain,
        shopifySyncedAt: new Date(),
      },
    });

    const tokenizedLink = getClaimUrl(selectedBrand);
    const linkExpiresAt = new Date();
    linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

    await prisma.voucherCode.update({
      where: { id: voucherCode.id },
      data: { tokenizedLink, linkExpiresAt },
    });

    return { voucherCode, giftCard: giftCardInDb, shopifyGiftCard };
  } catch (error) {
    throw new Error(`Failed to process single order: ${error.message}`);
  }
}

export async function sendDeliveryMessage(orderData, giftCard, deliveryMethod) {
  try {
    console.log("---------------------------------------",orderData)
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

export async function createDeliveryLog(
  order,
  voucherCodeId,
  orderData,
  deliveryResult,
) {
  try {
    const isBulkOrder = orderData.isBulkOrder === true;
    let recipient = "Print delivery";

    if (isBulkOrder) {
      recipient = orderData.companyInfo.contactEmail;
    } else if (orderData.deliveryMethod === "email") {
      recipient = orderData.deliveryDetails.recipientEmailAddress;
    } else if (orderData.deliveryMethod === "whatsapp") {
      recipient = orderData.deliveryDetails.recipientWhatsAppNumber;
    }

    let status = "PENDING";
    if (orderData.deliveryMethod === "print" || isBulkOrder) {
      status = "DELIVERED";
    } else if (order.scheduledFor) {
      status = "PENDING";
    } else if (deliveryResult) {
      status = deliveryResult.success ? "DELIVERED" : "FAILED";
    }

    return await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId,
        method: isBulkOrder ? "email" : orderData.deliveryMethod || "whatsapp",
        recipient,
        status,
        attemptCount:
          orderData.deliveryMethod === "print" ||
          isBulkOrder ||
          (deliveryResult && deliveryResult.success)
            ? 1
            : 0,
        deliveredAt:
          orderData.deliveryMethod === "print" ||
          isBulkOrder ||
          (deliveryResult && deliveryResult.success)
            ? new Date()
            : null,
      },
    });
  } catch (error) {
    throw new Error(`Failed to create delivery log: ${error.message}`);
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

// ==================== CLEANUP FUNCTIONS ====================
async function cleanupOnError(orderId, voucherCodeIds = []) {
  try {
    if (voucherCodeIds.length > 0) {
      await prisma.voucherCode
        .deleteMany({
          where: { id: { in: voucherCodeIds } },
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

export async function getOrderStatus(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      brand: true,
      receiverDetail: true,
      voucherCodes: {
        include: {
          voucher: true,
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

  return {
    success: true,
    paymentStatus: order.paymentStatus,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      brand: order.brand,
      voucherCodes: order.voucherCodes,
    },
  };
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