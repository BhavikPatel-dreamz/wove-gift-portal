"use server";

import { PrismaClient } from "@prisma/client";
import { getSession } from "./userAction/session";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage";
import * as brevo from "@getbrevo/brevo";

const apiKey = process.env.NEXT_BREVO_API_KEY;
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
const prisma = new PrismaClient({ log: ["warn", "error"] });

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

// class NotFoundError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "NotFoundError";
//     this.statusCode = 404;
//   }
// }

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

  // Check if it's a bulk order
  const isBulkOrder = orderData.isBulkOrder === true;

  if (isBulkOrder) {
    // Bulk order validation
    if (!orderData.companyInfo) {
      throw new ValidationError(
        "Company information is required for bulk orders"
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
  } else {
    // Single gift order validation
    if (
      !orderData.deliveryMethod ||
      !["whatsapp", "email", "print"].includes(orderData.deliveryMethod)
    ) {
      throw new ValidationError(
        "Valid delivery method is required (whatsapp, email, or print)"
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
        "Recipient email is required for email delivery"
      );
    }

    if (
      orderData.deliveryMethod === "whatsapp" &&
      !deliveryDetails?.recipientWhatsAppNumber
    ) {
      throw new ValidationError(
        "Recipient WhatsApp number is required for WhatsApp delivery"
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
      // For bulk orders, use company info
      return await prisma.receiverDetail.create({
        data: {
          name: orderData.companyInfo.companyName,
          email: orderData.companyInfo.contactEmail,
          phone: orderData.companyInfo.contactNumber,
        },
      });
    } else {
      // For single gift orders, use delivery details
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

async function createOrderRecord(
  selectedBrand,
  orderData,
  receiver,
  scheduledFor
) {
  try {
    const amount = orderData.selectedAmount.value;
    const quantity = orderData.quantity || 1;
    const subtotal = amount * quantity;
    const discount = orderData.discountAmount || 0;
    const totalAmount = subtotal - discount;
    const isBulkOrder = orderData.isBulkOrder === true;

    const orderBase = {
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
      paymentMethod: orderData.selectedPaymentMethod || "stripe",
      customImageUrl: orderData.customImageUrl || null,
      customVideoUrl: orderData.customVideoUrl || null,
      paymentStatus: "COMPLETED",
      redemptionStatus: "Issued",
      isActive: true,
    };

    function generateBulkOrderNumber() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `BULK-${timestamp}-${random}`;
    }

    const bulkOrderNumber = generateBulkOrderNumber();

    if (isBulkOrder) {
      // Bulk order specific fields
      return await prisma.order.create({
        data: {
          ...orderBase,
          bulkOrderNumber: bulkOrderNumber || null,
          deliveryMethod: "email", // Bulk orders are delivered via email/CSV
          // message: `Bulk order for ${orderData.companyInfo.companyName}`,
          message: orderData.personalMessage || "",
          senderName: orderData.companyInfo.companyName,
          sendType: "sendImmediately",
          scheduledFor: null,
          senderEmail: orderData.companyInfo.contactEmail,
        },
      });
    } else {
      // Single gift order fields
      return await prisma.order.create({
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
  } catch (error) {
    throw new Error(`Failed to create order record: ${error.message}`);
  }
}

// ==================== SHOPIFY GIFT CARD OPERATIONS ====================
async function createShopifyGiftCard(selectedBrand, orderData, voucherConfig) {
  if (!selectedBrand.domain) {
    throw new ValidationError(
      "Brand domain is required for gift card creation"
    );
  }

  const isBulkOrder = orderData.isBulkOrder === true;

  const giftCardData = {
    customerEmail: isBulkOrder
      ? orderData.companyInfo.contactEmail
      : orderData.deliveryDetails?.recipientEmailAddress ||
        orderData.deliveryDetails?.yourEmailAddress ||
        "",
    firstName: isBulkOrder
      ? orderData.companyInfo.companyName.split(" ")[0]
      : orderData.deliveryDetails?.recipientFullName?.split(" ")[0] ||
        orderData.deliveryDetails?.recipientName?.split(" ")[0] ||
        "Recipient",
    lastName: isBulkOrder
      ? orderData.companyInfo.companyName.split(" ").slice(1).join(" ")
      : orderData.deliveryDetails?.recipientFullName
          ?.split(" ")
          .slice(1)
          .join(" ") ||
        orderData.deliveryDetails?.recipientName
          ?.split(" ")
          .slice(1)
          .join(" ") ||
        "",
    note: isBulkOrder
      ? `Bulk Order - ${orderData.quantity} vouchers - Delivery: ${orderData.deliveryOption}`
      : `Order to be generated - Delivery Method: ${orderData.deliveryMethod}`,
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

    return result.gift_card;
  } catch (error) {
    if (error instanceof ExternalServiceError) throw error;
    throw new ExternalServiceError(
      `Failed to create Shopify gift card: ${error.message}`,
      error
    );
  }
}

// ==================== BULK ORDER PROCESSING ====================
async function processBulkOrder(
  selectedBrand,
  orderData,
  order,
  voucherConfig
) {
  try {
    const quantity = orderData.quantity || 1;
    const voucherCodes = [];
    const giftCards = [];

    // Create multiple gift cards
    for (let i = 0; i < quantity; i++) {

      // Create Shopify gift card
      const shopifyGiftCard = await createShopifyGiftCard(
        selectedBrand,
        orderData,
        voucherConfig
      );

      // Save to database
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
          note: `Bulk Order ${order.orderNumber} - Voucher ${
            i + 1
          }/${quantity}`,
          isActive: true,
          isVirtual: true,
        },
      });

      // Create voucher code
      let expireDate = null;
      if (voucherConfig?.denominationType === "fixed") {
        const matchedDenomination = voucherConfig?.denominations?.find(
          (d) => d?.value == order?.amount
        );
        expireDate = matchedDenomination?.isExpiry === true ? matchedDenomination?.expiresAt || null : null;
      } else {
        expireDate = voucherConfig?.isExpiry === true ? voucherConfig?.expiresAt || null : null;
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

      // Generate and save tokenized link
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

// ==================== BULK DELIVERY ====================
async function sendBulkDelivery(orderData, voucherCodes) {
  try {
    const { deliveryOption, companyInfo } = orderData;

    if (deliveryOption === "csv") {
      // Generate CSV content
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

      // Initialize Brevo
      const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

      if (!senderEmail) {
        throw new ConfigurationError(
          "Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL"
        );
      }

      // Convert CSV to base64 for attachment
      const csvBuffer = Buffer.from(csvContent, "utf-8");
      const csvBase64 = csvBuffer.toString("base64");
      const fileName = `gift-cards-${Date.now()}.csv`;

      const sendSmtpEmail = {
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [
          {
            email: companyInfo.contactEmail,
            name: companyInfo.companyName,
          },
        ],
        subject: `Bulk Gift Card Order - ${voucherCodes.length} Vouchers (CSV Attached)`,
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
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">🎉 Bulk Gift Card Order Confirmed</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #1a1a1a;">Dear ${
                companyInfo.companyName
              },</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a; line-height: 1.6;">Your bulk gift card order has been successfully processed. All voucher codes are attached as a CSV file.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #ff6b9d; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Brand:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${orderData.selectedBrand?.brandName || "N/A"}
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
                      ${orderData.selectedAmount?.currency || "₹"}${
          orderData.selectedAmount?.value || "0"
        }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                      <strong>Total Value:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                      ${orderData.selectedAmount?.currency || "₹"}${
          (orderData.selectedAmount?.value || 0) * voucherCodes.length
        }
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin-bottom: 24px; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #856404; font-weight: 600;">📎 CSV File Attached</p>
                <p style="margin: 0; font-size: 13px; color: #856404; line-height: 1.6;">
                  The attached CSV file contains all ${
                    voucherCodes.length
                  } voucher codes with their details (code, amount, expiry date, and redemption link).
                </p>
              </div>
              
              <div style="margin-top: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">📋 How to Use</h3>
                <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Download and open the attached CSV file</li>
                  <li>Each row contains a unique voucher code and redemption link</li>
                  <li>Distribute the codes to your recipients</li>
                  <li>Recipients can redeem at ${
                    orderData.selectedBrand?.brandName || "the brand"
                  }</li>
                </ol>
              </div>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #6c757d; line-height: 1.6;">
                  Need help? Contact our support team at any time.
                </p>
              </div>
            </td>
          </tr>
          
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
</html>`,
        textContent: `Bulk Gift Card Order Confirmation

Dear ${companyInfo.companyName},

Your bulk gift card order has been successfully processed.

Order Summary:
- Brand: ${orderData.selectedBrand?.brandName || "N/A"}
- Total Vouchers: ${voucherCodes.length}
- Amount per Voucher: ${orderData.selectedAmount?.currency || "₹"}${
          orderData.selectedAmount?.value || "0"
        }
- Total Value: ${orderData.selectedAmount?.currency || "₹"}${
          (orderData.selectedAmount?.value || 0) * voucherCodes.length
        }

CSV File Attached:
The attached CSV file contains all ${
          voucherCodes.length
        } voucher codes with their details.

How to Use:
1. Download and open the attached CSV file
2. Each row contains a unique voucher code and redemption link
3. Distribute the codes to your recipients
4. Recipients can redeem at ${orderData.selectedBrand?.brandName || "the brand"}

Thank you for choosing our gift card platform.`,
        attachment: [
          {
            content: csvBase64,
            name: fileName,
          },
        ],
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
    } else if (deliveryOption === "email") {
      // Send all voucher codes in a single email (not CSV, just HTML table)
      const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

      if (!senderEmail) {
        throw new ConfigurationError(
          "Missing Brevo sender email: NEXT_BREVO_SENDER_EMAIL"
        );
      }

      // Generate voucher rows for HTML table
      const voucherRows = voucherCodes
        .map((vc, index) => {
          const expiryDate = vc.expiresAt
            ? new Date(vc.expiresAt).toLocaleDateString()
            : "No Expiry";

          return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 8px; font-size: 13px; color: #4a5568;">
              ${index + 1}
            </td>
            <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a; font-family: 'Courier New', monospace;">
              ${vc.code}
            </td>
            <td style="padding: 12px 8px; font-size: 13px; color: #1a1a1a;">
              ${orderData.selectedAmount?.currency || "₹"}${vc.originalValue}
            </td>
            <td style="padding: 12px 8px; font-size: 13px; color: #4a5568;">
              ${expiryDate}
            </td>
            <td style="padding: 12px 8px;">
              <a href="${
                vc.tokenizedLink
              }" style="color: #ff6b9d; text-decoration: none; font-size: 12px;">Redeem →</a>
            </td>
          </tr>
        `;
        })
        .join("");

      const sendSmtpEmail = {
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [
          {
            email: companyInfo.contactEmail,
            name: companyInfo.companyName,
          },
        ],
        subject: `Bulk Gift Card Order - ${voucherCodes.length} Vouchers`,
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
        <table role="presentation" style="width: 700px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">🎉 Bulk Gift Card Order Confirmed</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #1a1a1a;">Dear ${
                companyInfo.companyName
              },</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a; line-height: 1.6;">Your bulk gift card order has been successfully processed. Below are all your voucher codes.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #ff6b9d; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">📊 Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568;">
                      <strong>Brand:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; text-align: right;">
                      ${orderData.selectedBrand?.brandName || "N/A"}
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
                      ${orderData.selectedAmount?.currency || "₹"}${
          orderData.selectedAmount?.value || "0"
        }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #4a5568; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                      <strong>Total Value:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                      ${orderData.selectedAmount?.currency || "₹"}${
          (orderData.selectedAmount?.value || 0) * voucherCodes.length
        }
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">🎁 Your Voucher Codes</h3>
                <div style="overflow-x: auto;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <thead>
                      <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">#</th>
                        <th style="padding: 12px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Voucher Code</th>
                        <th style="padding: 12px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Amount</th>
                        <th style="padding: 12px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Expires</th>
                        <th style="padding: 12px 8px; text-align: left; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 2px solid #e2e8f0;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${voucherRows}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div style="margin-top: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1a1a1a;">📋 How to Use</h3>
                <ol style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Copy the voucher code you want to use</li>
                  <li>Click the "Redeem" link or visit ${
                    orderData.selectedBrand?.brandName || "the brand"
                  }</li>
                  <li>Enter the voucher code at checkout</li>
                  <li>Enjoy your gift!</li>
                </ol>
              </div>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #6c757d; line-height: 1.6;">
                  Need help? Contact our support team at any time.
                </p>
              </div>
            </td>
          </tr>
          
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
</html>`,
        textContent: `Bulk Gift Card Order Confirmation

Dear ${companyInfo.companyName},

Your bulk gift card order has been successfully processed.

Order Summary:
- Brand: ${orderData.selectedBrand?.brandName || "N/A"}
- Total Vouchers: ${voucherCodes.length}
- Amount per Voucher: ${orderData.selectedAmount?.currency || "₹"}${
          orderData.selectedAmount?.value || "0"
        }
- Total Value: ${orderData.selectedAmount?.currency || "₹"}${
          (orderData.selectedAmount?.value || 0) * voucherCodes.length
        }

Your Voucher Codes:
${voucherCodes
  .map((vc, index) => {
    const expiryDate = vc.expiresAt
      ? new Date(vc.expiresAt).toLocaleDateString()
      : "No Expiry";
    return `${index + 1}. ${vc.code} - ${
      orderData.selectedAmount?.currency || "₹"
    }${vc.originalValue} - Expires: ${expiryDate}\n   Redeem: ${
      vc.tokenizedLink
    }`;
  })
  .join("\n\n")}

How to Use:
1. Copy the voucher code you want to use
2. Visit ${orderData.selectedBrand?.brandName || "the brand"}
3. Enter the voucher code at checkout
4. Enjoy your gift!

Thank you for choosing our gift card platform.`,
      };

      console.log(
        "📧 Sending bulk email with all codes to:",
        companyInfo.contactEmail
      );
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

    return { success: true, message: "Bulk delivery processed" };
  } catch (error) {
    console.error("❌ Bulk delivery failed:", error);

    throw new ExternalServiceError(
      `Failed to send bulk delivery: ${error.message}`,
      error
    );
  }
}

// ==================== SINGLE ORDER PROCESSING ====================
async function processSingleOrder(
  selectedBrand,
  orderData,
  order,
  voucherConfig
) {
  try {
    // Create Shopify gift card
    const shopifyGiftCard = await createShopifyGiftCard(
      selectedBrand,
      orderData,
      voucherConfig
    );

    // Save gift card to database
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

    // Create voucher code
    let expireDate = null;
    if (voucherConfig?.denominationType === "fixed") {
      const matchedDenomination = voucherConfig?.denominations?.find(
        (d) => d?.value == order?.amount
      );
      expireDate = matchedDenomination?.isExpiry === true ? matchedDenomination?.expiresAt || null : null;
    } else {
      expireDate = voucherConfig?.isExpiry === true ? voucherConfig?.expiresAt || null : null;
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

    // Generate and save tokenized link
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

async function createDeliveryLog(order, voucherCodeId, orderData) {
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

    const status =
      orderData.deliveryMethod === "print" || isBulkOrder
        ? "DELIVERED"
        : order.scheduledFor
        ? "PENDING"
        : "PENDING";

    return await prisma.deliveryLog.create({
      data: {
        orderId: order.id,
        voucherCodeId,
        method: isBulkOrder ? "email" : orderData.deliveryMethod || "whatsapp",
        recipient,
        status,
        attemptCount:
          orderData.deliveryMethod === "print" || isBulkOrder ? 1 : 0,
        deliveredAt:
          orderData.deliveryMethod === "print" || isBulkOrder
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

// ==================== MAIN ORDER CREATION ====================
export const createOrder = async (orderData) => {
  let order = null;
  let voucherCodeIds = [];

  try {
    // Step 1: Authentication
    const session = await getSession();
    const userId = session?.userId;

    if (!userId) {
      throw new AuthenticationError("User not authenticated");
    }

    orderData.userId = userId;

    // Step 2: Validation
    validateOrderData(orderData);

    const isBulkOrder = orderData.isBulkOrder === true;

    // Step 3: Create receiver detail
    const receiver = await createReceiverDetail(orderData);

    // Step 4: Create order record
    const scheduledFor =
      !isBulkOrder &&
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

    // Get voucher configuration
    if (
      !orderData.selectedBrand.vouchers ||
      orderData.selectedBrand.vouchers.length === 0
    ) {
      throw new ValidationError("Brand does not have voucher configuration");
    }
    const voucherConfig = orderData.selectedBrand.vouchers[0];

    if (isBulkOrder) {
      // ========== BULK ORDER PROCESSING ==========
      const { voucherCodes, giftCards } = await processBulkOrder(
        orderData.selectedBrand,
        orderData,
        order,
        voucherConfig
      );

      voucherCodeIds = voucherCodes.map((vc) => vc.id);

      // Step 6: Update settlement
      await updateOrCreateSettlement(orderData.selectedBrand, order);

      // Step 7: Send bulk delivery
      const deliveryResult = await sendBulkDelivery(
        orderData,
        voucherCodes,
        giftCards
      );

      // Step 8: Create delivery logs for all vouchers
      for (const voucherCode of voucherCodes) {
        await createDeliveryLog(order, voucherCode.id, orderData);
      }

      console.log("✅ Bulk order created successfully:", order.orderNumber);

      return {
        success: true,
        data: {
          order,
          voucherCodes,
          giftCards,
          deliveryResult,
        },
      };
    } else {
      // ========== SINGLE ORDER PROCESSING ==========
      const { voucherCode, giftCard, shopifyGiftCard } =
        await processSingleOrder(
          orderData.selectedBrand,
          orderData,
          order,
          voucherConfig
        );

      voucherCodeIds = [voucherCode.id];

      // Step 6: Update settlement
      await updateOrCreateSettlement(orderData.selectedBrand, order);

      // Step 7: Send delivery message
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

      // Step 8: Create delivery log
      console.log("Step 8: Creating delivery log...");
      await createDeliveryLog(order, voucherCode.id, orderData);

      console.log("✅ Order created successfully:", order.orderNumber);

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
    console.error("❌ Order creation failed:", error);

    // Cleanup on error
    if (order?.id || voucherCodeIds.length > 0) {
      await cleanupOnError(order?.id, voucherCodeIds);
    }

    // Return structured error
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
