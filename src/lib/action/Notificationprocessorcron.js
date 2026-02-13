/**
 * NOTIFICATION PROCESSOR - BULLETPROOF EMAIL DELIVERY WITH SCHEDULED SEND
 * 
 * CRITICAL FIXES:
 * 1. Process ONE order at a time
 * 2. Ensure ALL emails are sent before marking complete
 * 3. Proper retry logic for failed emails
 * 4. Complete logging in NotificationDetail table
 * 5. ✅ NEW: Respect scheduledFor time with UTC comparison
 * 6. ✅ UPDATED: Use enhanced email templates with all dynamic data
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
      o."scheduledFor",
      o."occasionId"
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
      occasion: true,
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

    // ✅ Fetch occasion and category data
    let selectedSubCategory = null;
    let occasionTitle = null;

    if (order.isCustom && order.customCardId) {
      selectedSubCategory = await prisma.customCard.findUnique({
        where: { id: order.customCardId },
      });
      occasionTitle = selectedSubCategory?.name || null;
    } else if (!order.isCustom && order.subCategoryId) {
      selectedSubCategory = await prisma.occasionCategory.findUnique({
        where: { id: order.subCategoryId },
      });
      occasionTitle = selectedSubCategory?.name || order.occasion?.name || null;
    } else if (order.occasion) {
      occasionTitle = order.occasion.name;
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
        // ✅ Use new email template with all dynamic data
        const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
        const senderName = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";
        const companyName = order.senderName || "A special sender";
        const giftCode = voucherCode.giftCard?.code || voucherCode.code;
        const expiryDate = voucherCode.expiresAt
          ? new Date(voucherCode.expiresAt).toLocaleDateString()
          : "No Expiry";

        const emailSubject = occasionTitle 
          ? `🎁 ${occasionTitle} – You've received a gift from ${companyName}`
          : `🎁 You've received a ${order.brand?.brandName || "Gift Card"} from ${companyName}`;

        const sendSmtpEmail = {
          sender: { email: senderEmail, name: senderName },
          to: [{ 
            email: order.receiverDetail.email, 
            name: order.receiverDetail.name 
          }],
          subject: emailSubject,
          htmlContent: generateIndividualGiftEmailHTML(
            { recipientName: order.receiverDetail.name },
            giftCode,
            voucherCode,
            order,
            order.brand,
            expiryDate,
            companyName,
            order.message,
            selectedSubCategory,
            companyName, // senderName
            occasionTitle // occasionTitle
          ),
        };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        result = { 
          success: true, 
          messageId: response.messageId 
        };

        await prisma.notificationDetail.update({
          where: { id: notification.id },
          data: {
            emailServiceStatus: "DELIVERED",
            emailServiceId: response.messageId,
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
 * ✅ UPDATED: Use new email template with all dynamic data
 */
async function sendIndividualBulkEmails(order, selectedSubCategory) {
  const bulkRecipients = order.bulkRecipients || [];
  
  if (bulkRecipients.length === 0) {
    throw new Error("No bulk recipients found");
  }

  console.log(`📧 Sending to ${bulkRecipients.length} recipients`);

  let sentCount = 0;
  let failedCount = 0;

  // ✅ Get occasion title
  let occasionTitle = null;
  if (selectedSubCategory) {
    occasionTitle = selectedSubCategory.name;
  } else if (order.occasion) {
    occasionTitle = order.occasion.name;
  }

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
      const senderName = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";
      const companyName = order.senderName || "A special sender";

      const voucherCode = recipient.voucherCode;
      const giftCode = voucherCode.giftCard?.code || voucherCode.code;
      const expiryDate = voucherCode.expiresAt
        ? new Date(voucherCode.expiresAt).toLocaleDateString()
        : "No Expiry";

      const emailSubject = occasionTitle
        ? `🎁 ${occasionTitle} – You've received a gift from ${companyName}`
        : `🎁 ${companyName} sent you a ${order.brand?.brandName || "Gift Card"}!`;

      const sendSmtpEmail = {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: recipient.recipientEmail, name: recipient.recipientName }],
        subject: emailSubject,
        htmlContent: generateIndividualGiftEmailHTML(
          { recipientName: recipient.recipientName },
          giftCode,
          voucherCode,
          order,
          order.brand,
          expiryDate,
          companyName,
          recipient.personalMessage || order.message,
          selectedSubCategory,
          companyName, // senderName
          occasionTitle // occasionTitle
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

/**
 * ✅ UPDATED: Use new bulk email template with all dynamic data
 */
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
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";

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

    // ✅ Get expiry date for summary
    const firstVoucher = voucherCodes[0];
    const expiryDate = firstVoucher.expiresAt
      ? new Date(firstVoucher.expiresAt).toLocaleDateString()
      : "No Expiry";

    // Generate CSV
    const csvHeader = "S.No,Gift Card Code,Amount,Currency,Expiry Date,Redeem URL\n";
    const csvRows = voucherCodes
      .map((vc, index) => {
        const vcExpiryDate = vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString()
          : "No Expiry";
        const giftCardCode = vc.giftCard?.code || vc.code;
        const redeemUrl = vc.tokenizedLink || brandUrl;
        return `${index + 1},${giftCardCode},${vc.originalValue},${order.currency},${vcExpiryDate},${redeemUrl}`;
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
        orderData.selectedBrand?.brandName,
        expiryDate, // ✅ New parameter
        order.orderNumber // ✅ New parameter (orderReference)
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
  selectedSubCategory,
  senderName,
  occasionTitle
) {
  const brandLogoUrl = brand?.logo || null;
  const giftCardImageUrl = selectedSubCategory?.image || null;
  const brandName = brand?.brandName || "Gift Card";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%); padding: 28px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">🎁 You've received a Gift Card!</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 400; color: #000000; line-height: 1.6;">Hi ${recipient.recipientName},</p>
              
              <!-- Main Message -->
              <p style="margin: 0 0 24px; font-size: 15px; color: #000000; line-height: 1.6;">
                ${senderName || companyName} ${occasionTitle ? `sent you a ${brandName} gift card to celebrate ${occasionTitle}` : `has sent you a digital gift card to celebrate this special occasion`}.
              </p>

              <!-- Personal Message Section -->
              ${personalMessage ? `
              <div style="background-color: #f8f9fa; border-left: 3px solid #dee2e6; padding: 18px 20px; border-radius: 6px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Personal message from ${senderName || companyName}</p>
                <p style="margin: 0; font-size: 15px; color: #000000; line-height: 1.6;">"${personalMessage}"</p>
              </div>
              ` : ''}

              <!-- Gift Card Display Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <!-- Left Side - Gift Card Image -->
                  <td style="width: 50%; vertical-align: top; padding-right: 16px;">
                    ${giftCardImageUrl ? 
                      `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; height: auto; border-radius: 8px; display: block; border: 1px solid #e9ecef;">` 
                      : 
                      `<div style="width: 100%; height: 240px; background: linear-gradient(135deg, #ff6b9d 0%, #ff8f6b 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <div style="font-size: 56px; margin-bottom: 12px;">🎁</div>
                        <h2 style="color: white; font-size: 24px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">GIFT CARD</h2>
                      </div>`
                    }
                  </td>

                  <!-- Right Side - Brand Logo & Details -->
                  <td style="width: 50%; vertical-align: top; padding-left: 16px;">
                    <!-- Brand Logo -->
                    <div style="margin-bottom: 20px; text-align: left;">
                      ${brandLogoUrl ? 
                        `<img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 120px; max-height: 60px; height: auto;">` 
                        : 
                        `<h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #000000;">${brandName}</h3>`
                      }
                    </div>

                    <!-- Gift Details -->
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
                      <!-- Gift Code -->
                      <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Gift Code</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000; font-family: 'Courier New', monospace; word-break: break-all;">${giftCode}</p>
                      </div>

                      <!-- Amount -->
                      <div style="margin-bottom: 16px;">
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Amount</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">${order.currency}${order.amount}</p>
                      </div>

                      <!-- Valid Until -->
                      <div>
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Valid Until</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">${expiryDate}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${voucherCode.tokenizedLink || "#"}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(90deg, #ff6b9d 0%, #ff8f6b 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600;">Redeem Now</a>
                  </td>
                </tr>
              </table>

              <!-- How to Use Section -->
              <div style="background-color: #fffbf0; border-radius: 8px; padding: 20px; border: 1px solid #ffe8a1;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #000000;">💡 How to use your gift card:</p>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #000000; line-height: 1.8;">
                  <li>Click "Redeem Now" above</li>
                  <li>Follow the instructions to activate your gift</li>
                  <li>Enjoy your ${brandName} experience!</li>
                </ol>
              </div>

            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 28px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #6c757d; text-align: center; line-height: 1.6;">This gift card was sent to you via WoveGifts, powered by MyPerks.</p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #6c757d; text-align: center;">Need help? Contact us at <a href="mailto:hello@wovegifts.com" style="color: #000000; text-decoration: none; font-weight: 600;">hello@wovegifts.com</a></p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #adb5bd; text-align: center;">
                <a href="http://www.wovegifts.com/termsandcondition" style="color: #6c757d; text-decoration: none; margin: 0 8px;">Terms & Conditions</a> | 
                <a href="http://www.wovegifts.com/privacy" style="color: #6c757d; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #adb5bd; text-align: center;">© 2026 WoveGifts (a MyPerks company)</p>
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


function generateBulkEmailHTML(
  order, 
  orderData, 
  voucherCodes, 
  csvUrl, 
  brandLogoUrl, 
  giftCardImageUrl, 
  brandName,
  expiryDate,
  orderReference
) {
  const totalVouchers = voucherCodes.length;
  const totalValue = order.amount * totalVouchers;
  const previewVouchers = voucherCodes.slice(0, 5);
  const remainingCount = totalVouchers - previewVouchers.length;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 28px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">✅ Bulk Gift Card Order Complete!</h1>
            </td>
          </tr>

          <!-- Greeting Section -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 400; color: #000000;">Hi ${orderData.companyInfo.companyName},</p>
              <p style="margin: 0 0 28px; font-size: 15px; color: #000000; line-height: 1.6;">Your bulk gift card order has been processed successfully! All ${totalVouchers} vouchers are ready for distribution.</p>

              <!-- Order Summary Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <!-- Left Side - Gift Card Image -->
                  <td style="width: 45%; vertical-align: top; padding-right: 16px;">
                    ${giftCardImageUrl ? 
                      `<img src="${giftCardImageUrl}" alt="Gift Card" style="width: 100%; height: auto; border-radius: 8px; display: block; border: 1px solid #e9ecef;">` 
                      : 
                      `<div style="width: 100%; height: 200px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🎁</div>
                        <h2 style="color: white; font-size: 22px; font-weight: 600; margin: 0;">BULK ORDER</h2>
                      </div>`
                    }
                  </td>

                  <!-- Right Side - Order Details -->
                  <td style="width: 55%; vertical-align: top; padding-left: 16px;">
                    <!-- Brand Logo/Name -->
                    <div style="margin-bottom: 20px;">
                      ${brandLogoUrl ? 
                        `<img src="${brandLogoUrl}" alt="${brandName}" style="max-width: 120px; max-height: 60px; height: auto;">` 
                        : 
                        `<h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #000000;">${brandName}</h3>`
                      }
                    </div>

                    <!-- Order Summary -->
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
                      <div style="margin-bottom: 14px;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Total Vouchers</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">${totalVouchers}</p>
                      </div>

                      <div style="margin-bottom: 14px;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Voucher Value</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">${order.currency}${order.amount}</p>
                      </div>

                      <div style="margin-bottom: 14px;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Total Order Value</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">${order.currency}${totalValue}</p>
                      </div>
                     
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Download CTA -->
              <table role="presentation" style="width: 100%; margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${csvUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: 600;">📥 Download Complete Voucher List (CSV)</a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps Section -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; border: 1px solid #bfdbfe;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #000000;">📌 What's Next?</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #000000; line-height: 1.8;">
                  <li>Download the CSV file containing all voucher codes</li>
                  <li>Distribute codes to your recipients via your preferred method</li>
                  <li>Recipients can redeem using the codes provided</li>
                  <li>Track redemption status in your dashboard</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 28px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 12px; font-size: 13px; color: #6c757d; text-align: center; line-height: 1.6;">This gift card was sent to you via WoveGifts, powered by MyPerks.</p>
              <p style="margin: 0 0 16px; font-size: 13px; color: #6c757d; text-align: center;">Need help? Contact us at <a href="mailto:hello@wovegifts.com" style="color: #000000; text-decoration: none; font-weight: 600;">hello@wovegifts.com</a></p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #adb5bd; text-align: center;">
                <a href="http://www.wovegifts.com/termsandcondition" style="color: #6c757d; text-decoration: none; margin: 0 8px;">Terms & Conditions</a> | 
                <a href="http://www.wovegifts.com/privacy" style="color: #6c757d; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #adb5bd; text-align: center;">© 2026 WoveGifts (a MyPerks company)</p>
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