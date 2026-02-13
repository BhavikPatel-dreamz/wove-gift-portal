/**
 * NOTIFICATION PROCESSOR - BULLETPROOF EMAIL DELIVERY WITH SCHEDULED SEND
 * 
 * CRITICAL FIXES:
 * 1. Process ONE order at a time
 * 2. Ensure ALL emails are sent before marking complete
 * 3. Proper retry logic for failed emails
 * 4. Complete logging in NotificationDetail table
 * 5. ✅ NEW: Respect scheduledFor time with UTC comparison
 */

import cron from "node-cron";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage.js";
import * as brevo from "@getbrevo/brevo";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../db.js";

const MAX_RETRIES = 3;

const apiKey = process.env.NEXT_BREVO_API_KEY;
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
  secure: true,
});

export const notificationProcessorCron = () => {
  cron.schedule("*/15 * * * * *", async () => {
    console.log("\n📧 [NOTIFICATION CRON] Starting notification processor...");

    try {
      const result = await processNotificationsQueue();
      console.log("✅ [NOTIFICATION CRON] Completed:", result);
    } catch (error) {
      console.error("❌ [NOTIFICATION CRON] Error:", error.message);
    }
  });

  console.log("📧 [NOTIFICATION CRON] Notification processor scheduled (every 15 seconds)");
};

async function processNotificationsQueue() {
  try {
    // ✅ CRITICAL: Process ONE order at a time
    const ordersToNotify = await findOrdersReadyForNotification();

    if (ordersToNotify.length === 0) {
      return { success: true, processed: 0, message: "No orders ready for notification" };
    }

    // ✅ CRITICAL: Only process FIRST order
    const order = ordersToNotify[0];
    
    console.log(`📋 Processing notifications for: ${order.orderNumber}`);
    
    // ✅ Check if this is a scheduled order with UTC comparison
    if (order.sendType === 'scheduleLater' && order.scheduledFor) {
      const scheduledTimeUTC = new Date(order.scheduledFor);
      const nowUTC = new Date();
      
      // Double-check that the scheduled time has actually passed
      if (scheduledTimeUTC > nowUTC) {
        console.log(
          `⏰ Skipping order ${order.orderNumber}:`,
          `\n  Scheduled UTC: ${scheduledTimeUTC.toISOString()}`,
          `\n  Current UTC:   ${nowUTC.toISOString()}`,
          `\n  Time until scheduled: ${Math.round((scheduledTimeUTC - nowUTC) / 60000)} minutes`
        );
        return { success: true, processed: 0, message: "Order not yet ready to send" };
      }
      
      console.log(
        `\n✓ Processing scheduled order: ${order.orderNumber}`,
        `\n  Scheduled UTC: ${scheduledTimeUTC.toISOString()} (${scheduledTimeUTC.toUTCString()})`,
        `\n  Current UTC:   ${nowUTC.toISOString()} (${nowUTC.toUTCString()})`,
        `\n  Delay: ${Math.round((nowUTC - scheduledTimeUTC) / 60000)} minutes past scheduled time`
      );
    } else {
      console.log(`🚀 [${order.orderNumber}] Immediate send order`);
    }

    try {
      // Mark as processing
      await prisma.order.update({
        where: { id: order.id },
        data: {
          processingStatus: "NOTIFICATIONS_SENDING",
          lastProcessedAt: new Date(),
        },
      });

      // Send notifications
      const result = await sendOrderNotifications(order);

      console.log(`📊 [${order.orderNumber}] Notification result:`, result);

      if (result.success) {
        // Mark as complete
        await prisma.order.update({
          where: { id: order.id },
          data: {
            notificationsSent: true,
            processingStatus: "COMPLETED",
            processingCompletedAt: new Date(),
            lastProcessedAt: new Date(),
          },
        });

        console.log(`✅ Order ${order.orderNumber} notifications complete`);
        return { success: true, processed: 1, failed: 0 };
      } else {
        await handleNotificationFailure(order, result.error);
        return { success: false, processed: 0, failed: 1, error: result.error };
      }
    } catch (error) {
      console.error(`❌ Error processing ${order.orderNumber}:`, error.message);
      await handleNotificationFailure(order, error);
      return { success: false, processed: 0, failed: 1, error: error.message };
    }
  } catch (error) {
    console.error("❌ [NOTIFICATION CRON] Queue error:", error);
    return { success: false, error: error.message };
  }
}

async function findOrdersReadyForNotification() {
  // ✅ Get current time in UTC
  const nowUTC = new Date();
  
  console.log(`🕐 Current UTC time: ${nowUTC.toISOString()}`);
  console.log(`🕐 Current UTC time (readable): ${nowUTC.toUTCString()}`);
  
  const orders = await prisma.$queryRaw`
    SELECT 
      o.id,
      o."orderNumber",
      o."brandId",
      o.quantity,
      o.amount,
      o.currency,
      o."deliveryMethod",
      o."bulkOrderNumber",
      o."senderName",
      o."senderEmail",
      o."message",
      o."processingStatus",
      o."retryCount",
      o."subCategoryId",
      o."customCardId",
      o."isCustom",
      o."sendType",
      o."scheduledFor"
    FROM "Order" o
    WHERE 
      o."isPaid" = true
      AND o."allVouchersGenerated" = true
      AND o."notificationsSent" = false
      AND o."processingStatus" = 'VOUCHERS_CREATED'
      AND o."retryCount" < ${MAX_RETRIES}
      AND (
        o."sendType" = 'sendImmediately'
        OR (
          o."sendType" = 'scheduleLater' 
          AND o."scheduledFor" IS NOT NULL 
          AND o."scheduledFor" <= ${nowUTC}
        )
      )
    ORDER BY 
      CASE 
        WHEN o."sendType" = 'sendImmediately' THEN 0
        ELSE 1
      END,
      o."scheduledFor" ASC NULLS LAST,
      o."paidAt" ASC, 
      o."createdAt" ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `;

  if (orders.length === 0) return [];

  const order = orders[0];

  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      brand: true,
      receiverDetail: true,
      bulkRecipients: {
        include: {
          voucherCode: {
            include: {
              giftCard: { select: { code: true } },
            },
          },
        },
        orderBy: { rowNumber: "asc" },
      },
      voucherCodes: {
        include: {
          giftCard: { select: { code: true } },
        },
        orderBy: { createdAt: "asc" },
        take: order.quantity,
      },
    },
  });

  return fullOrder ? [fullOrder] : [];
}

async function sendOrderNotifications(order) {
  const isBulkOrder = !!order.bulkOrderNumber;

  try {
    if (isBulkOrder) {
      return await sendBulkOrderNotifications(order);
    } else {
      return await sendSingleOrderNotification(order);
    }
  } catch (error) {
    console.error(`❌ [${order.orderNumber}] Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sendSingleOrderNotification(order) {
  console.log(`📧 Sending single order notification for ${order.orderNumber}`);

  try {
    const voucherCode = order.voucherCodes[0];
    if (!voucherCode) {
      throw new Error(`No voucher codes found`);
    }

    const shopifyGiftCard = {
      code: voucherCode.giftCard?.code || voucherCode.code,
      maskedCode: voucherCode.code,
      balance: { amount: voucherCode.originalValue },
    };

    let selectedSubCategory = null;
    if (order.isCustom && order.customCardId) {
      selectedSubCategory = await prisma.customCard.findUnique({
        where: { id: order.customCardId },
      });
    } else if (!order.isCustom && order.subCategoryId) {
      selectedSubCategory = await prisma.occasionCategory.findUnique({
        where: { id: order.subCategoryId },
      });
    }

    const orderData = {
      selectedBrand: order.brand,
      selectedAmount: { value: order.amount, currency: order.currency },
      selectedSubCategory,
      deliveryDetails: {
        recipientFullName: order.receiverDetail.name,
        recipientEmailAddress: order.receiverDetail.email,
        recipientWhatsAppNumber: order.receiverDetail.phone,
      },
      personalMessage: order.message,
      deliveryMethod: order.deliveryMethod,
    };

    // Create notification log
    const notification = await prisma.notificationDetail.create({
      data: {
        orderId: order.id,
        recipientEmail: order.receiverDetail.email,
        recipientPhone: order.receiverDetail.phone,
        recipientName: order.receiverDetail.name,
        notificationType:
          order.deliveryMethod === "email" ? "EMAIL" :
          order.deliveryMethod === "whatsapp" ? "WHATSAPP" : "SMS",
        status: "PENDING",
        voucherCodeId: voucherCode.id,
        attemptCount: 0,
      },
    });

    console.log(`📝 Notification log created: ${notification.id}`);

    try {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: { status: "SENDING", attemptCount: { increment: 1 } },
      });

      let result;
      if (order.deliveryMethod === "email") {
        result = await SendGiftCardEmail(orderData, shopifyGiftCard);
        await prisma.notificationDetail.update({
          where: { id: notification.id },
          data: {
            emailServiceStatus: result.success ? "DELIVERED" : "FAILED",
            emailServiceId: result.messageId,
            emailServiceError: result.error || null,
          },
        });
      } else if (order.deliveryMethod === "whatsapp") {
        result = await SendWhatsappMessages(orderData, shopifyGiftCard);
        await prisma.notificationDetail.update({
          where: { id: notification.id },
          data: {
            whatsappServiceStatus: result.success ? "DELIVERED" : "FAILED",
            whatsappServiceId: result.messageId,
            whatsappServiceError: result.error || null,
          },
        });
      } else if (order.deliveryMethod === "print") {
        result = { success: true };
      }

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status: result.success ? "DELIVERED" : "FAILED",
          sentAt: new Date(),
          deliveredAt: result.success ? new Date() : null,
          errorMessage: result.error || null,
          messageId: result.messageId || null,
        },
      });

      console.log(`✅ Notification: ${result.success ? "DELIVERED" : "FAILED"}`);
      return { success: result.success, error: result.error };
    } catch (error) {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage: error.message,
        },
      });
      throw error;
    }
  } catch (error) {
    console.error(`❌ Single order notification failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sendBulkOrderNotifications(order) {
  console.log(`📧 Sending bulk notifications for ${order.orderNumber}`);

  try {
    let selectedSubCategory = null;
    if (order.isCustom && order.customCardId) {
      selectedSubCategory = await prisma.customCard.findUnique({
        where: { id: order.customCardId },
      });
    } else if (!order.isCustom && order.subCategoryId) {
      selectedSubCategory = await prisma.occasionCategory.findUnique({
        where: { id: order.subCategoryId },
      });
    }

    if (order.deliveryMethod === "multiple") {
      // CSV bulk - individual emails
      return await sendIndividualBulkEmails(order, selectedSubCategory);
    } else {
      // Bulk email - summary CSV
      return await sendBulkSummaryEmail(order, selectedSubCategory);
    }
  } catch (error) {
    console.error(`❌ Bulk notifications failed:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * ✅ CRITICAL: Send individual emails and ensure ALL are sent
 */
async function sendIndividualBulkEmails(order, selectedSubCategory) {
  const bulkRecipients = order.bulkRecipients || [];
  
  if (bulkRecipients.length === 0) {
    throw new Error("No bulk recipients found");
  }

  console.log(`📧 Sending to ${bulkRecipients.length} recipients`);

  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of bulkRecipients) {
    // ✅ Check if already sent (idempotency)
    if (recipient.emailSent && recipient.emailDelivered) {
      console.log(`⏭️ Already sent to ${recipient.recipientEmail}`);
      sentCount++;
      continue;
    }

    if (!recipient.voucherCode) {
      console.warn(`⚠️ No voucher for ${recipient.recipientEmail}`);
      failedCount++;
      continue;
    }

    const notification = await prisma.notificationDetail.create({
      data: {
        orderId: order.id,
        recipientEmail: recipient.recipientEmail,
        recipientName: recipient.recipientName,
        bulkRecipientId: recipient.id,
        voucherCodeId: recipient.voucherCode.id,
        notificationType: "EMAIL",
        status: "PENDING",
        attemptCount: 0,
      },
    });

    try {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: { status: "SENDING", attemptCount: { increment: 1 } },
      });

      const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";
      const companyName = order.senderName || "A special sender";

      const voucherCode = recipient.voucherCode;
      const giftCode = voucherCode.giftCard?.code || voucherCode.code;
      const expiryDate = voucherCode.expiresAt
        ? new Date(voucherCode.expiresAt).toLocaleDateString()
        : "No Expiry";

      const sendSmtpEmail = {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: recipient.recipientEmail, name: recipient.recipientName }],
        subject: `🎁 ${companyName} sent you a ${order.brand?.brandName || "Gift Card"}!`,
        htmlContent: generateIndividualGiftEmailHTML(
          recipient,
          giftCode,
          voucherCode,
          order,
          order.brand,
          expiryDate,
          companyName,
          recipient.personalMessage,
          selectedSubCategory
        ),
      };

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status: "DELIVERED",
          sentAt: new Date(),
          deliveredAt: new Date(),
          messageId: response.messageId,
          emailServiceStatus: "DELIVERED",
          emailServiceId: response.messageId,
        },
      });

      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
          emailDelivered: true,
          emailDeliveredAt: new Date(),
        },
      });

      sentCount++;
      console.log(`✅ Sent ${sentCount}/${bulkRecipients.length}: ${recipient.recipientEmail}`);
    } catch (error) {
      failedCount++;
      console.error(`❌ Failed to send to ${recipient.recipientEmail}:`, error.message);

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage: error.message,
          emailServiceStatus: "FAILED",
          emailServiceError: error.message,
        },
      });

      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: { emailError: error.message },
      });
    }
  }

  console.log(`📊 Bulk emails: ${sentCount} sent, ${failedCount} failed`);

  // ✅ CRITICAL: Only mark as success if ALL emails sent
  if (failedCount > 0) {
    throw new Error(`${failedCount} emails failed to send`);
  }

  return { success: true };
}

async function sendBulkSummaryEmail(order, selectedSubCategory) {
  console.log(`📧 Sending summary email to ${order.senderEmail}`);

  const voucherCodes = order.voucherCodes;
  if (voucherCodes.length === 0) {
    throw new Error("No voucher codes found");
  }

  const notification = await prisma.notificationDetail.create({
    data: {
      orderId: order.id,
      recipientEmail: order.senderEmail,
      recipientName: order.senderName,
      notificationType: "BULK_EMAIL",
      status: "PENDING",
      attemptCount: 0,
    },
  });

  try {
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: { status: "SENDING", attemptCount: { increment: 1 } },
    });

    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    const orderData = {
      selectedBrand: order.brand,
      selectedSubCategory,
      selectedAmount: { value: order.amount, currency: order.currency },
      companyInfo: {
        companyName: order.senderName || "Company",
        contactEmail: order.senderEmail,
      },
    };

    const brandUrl = getClaimUrl(orderData.selectedBrand);

    // Generate CSV
    const csvHeader = "S.No,Gift Card Code,Amount,Currency,Expiry Date,Redeem URL\n";
    const csvRows = voucherCodes
      .map((vc, index) => {
        const expiryDate = vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString()
          : "No Expiry";
        const giftCardCode = vc.giftCard?.code || vc.code;
        const redeemUrl = vc.tokenizedLink || brandUrl;
        return `${index + 1},${giftCardCode},${vc.originalValue},${order.currency},${expiryDate},${redeemUrl}`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const csvBuffer = Buffer.from(csvContent, "utf-8");

    const timestamp = Date.now();
    const fileName = `vouchers_${order.orderNumber}_${timestamp}`;

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
          }
        )
        .end(csvBuffer);
    });

    const csvUrl = uploadResult.secure_url;

    const sendSmtpEmail = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: order.senderEmail, name: order.senderName }],
      subject: `🎁 Bulk Gift Card Order - ${voucherCodes.length} Vouchers`,
      htmlContent: generateBulkEmailHTML(
        order,
        orderData,
        voucherCodes,
        csvUrl,
        orderData.selectedBrand?.logo,
        selectedSubCategory?.image,
        orderData.selectedBrand?.brandName
      ),
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: "DELIVERED",
        sentAt: new Date(),
        deliveredAt: new Date(),
        messageId: response.messageId,
        emailServiceStatus: "DELIVERED",
        emailServiceId: response.messageId,
      },
    });

    console.log(`✅ Summary email sent`);
    return { success: true };
  } catch (error) {
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        errorMessage: error.message,
        emailServiceStatus: "FAILED",
        emailServiceError: error.message,
      },
    });
    throw error;
  }
}

async function handleNotificationFailure(order, error) {
  try {
    const newRetryCount = (order.retryCount || 0) + 1;
    const shouldFail = newRetryCount >= MAX_RETRIES;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        processingStatus: shouldFail ? "FAILED" : "RETRYING",
        retryCount: newRetryCount,
        lastProcessedAt: new Date(),
        processingErrors: error?.message || "Unknown error",
      },
    });

    console.log(`⚠️ [${order.orderNumber}] ${shouldFail ? "FAILED" : "RETRYING"} (${newRetryCount}/${MAX_RETRIES})`);
  } catch (err) {
    console.error("❌ Failed to handle notification failure:", err.message);
  }
}

// ==================== HELPER FUNCTIONS ====================

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug ? `https://${selectedBrand.slug}.myshopify.com` : null);
  if (!claimUrl) throw new Error("Brand website or domain not configured");
  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

function generateIndividualGiftEmailHTML(
  recipient,
  giftCode,
  voucherCode,
  order,
  brand,
  expiryDate,
  companyName,
  personalMessage,
  selectedSubCategory
) {
  const brandLogoUrl = brand?.logo || null;
  const giftCardImageUrl = selectedSubCategory?.image || null;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">🎁 You received a Gift Card!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">Hi ${recipient.recipientName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">Great news! ${companyName} sent you a ${brand?.brandName || "Gift Card"}!</p>
              ${personalMessage ? `<p style="margin: 0 0 24px; font-size: 14px; color: #666; font-style: italic;">"${personalMessage}"</p>` : ""}
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%; vertical-align: top; padding-right: 20px;">
                    ${giftCardImageUrl ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px;">` : `<div style="width: 100%; max-width: 280px; height: 200px; background: linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;"><h2 style="color: white; font-size: 32px; font-weight: 700; margin: 0;">GIFT CARD</h2></div>`}
                  </td>
                  <td style="width: 40%; vertical-align: top;">
                    ${brandLogoUrl ? `<div style="margin-bottom: 20px;"><img src="${brandLogoUrl}" alt="${brand?.brandName}" style="max-width: 80px; height: auto;"></div>` : `<div style="margin-bottom: 20px;"><h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ff6b9d;">${brand?.brandName}</h3></div>`}
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Gift Code</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${giftCode}</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Amount</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${order.currency}${order.amount}</p>
                    </div>
                    <div>
                      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #1a1a1a;">Expires</p>
                      <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">${expiryDate}</p>
                    </div>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${voucherCode.tokenizedLink || "#"}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #ff6b9d 0%, #ff8f6b 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600;">Redeem Now →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">If you have questions, please contact support.</p>
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

function generateBulkEmailHTML(order, orderData, voucherCodes, csvUrl, brandLogoUrl, giftCardImageUrl, brandName) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #ffe4e6; padding: 24px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 500; color: #1a1a1a;">🎁 Bulk Gift Card Order Complete!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a1a;">Hi ${orderData.companyInfo.companyName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #1a1a1a;">Your bulk gift card order of ${voucherCodes.length} vouchers has been processed successfully!</p>
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="width: 60%;">
                    ${giftCardImageUrl ? `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; max-width: 280px; height: auto; border-radius: 12px;">` : ""}
                  </td>
                  <td style="width: 40%; vertical-align: top;">
                    ${brandLogoUrl ? `<div style="margin-bottom: 20px;"><img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 80px; height: auto;"></div>` : `<div style="margin-bottom: 20px;"><h3 style="margin: 0; font-size: 24px; font-weight: 700; color: #ff6b9d;">${brandName}</h3></div>`}
                    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600;">Total Vouchers: ${voucherCodes.length}</p>
                    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600;">Total Value: ${order.currency}${order.amount * voucherCodes.length}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${csvUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #ff6b9d 0%, #ff8f6b 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600;">📥 Download Voucher Codes (CSV)</a>
                  </td>
                </tr>
              </table>
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

export default notificationProcessorCron;