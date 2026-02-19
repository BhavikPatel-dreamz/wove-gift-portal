/**
 * NOTIFICATION PROCESSOR - BULLETPROOF EMAIL DELIVERY WITH SCHEDULED SEND
 *
 * CRITICAL FIXES:
 * 1. Process ONE order at a time
 * 2. Ensure ALL emails are sent before marking complete
 * 3. Proper retry logic for failed emails
 * 4. Complete logging in NotificationDetail table
 * 5. ✅ Respect scheduledFor time with UTC comparison
 * 6. ✅ Use Brevo transactional templates (templateId) with dynamic params
 *    instead of inline HTML generation
 */

import cron from "node-cron";
import { SendWhatsappMessages } from "./TwilloMessage.js";
import * as brevo from "@getbrevo/brevo";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../db.js";

const MAX_RETRIES = 3;

// ─── Brevo Template IDs ────────────────────────────────────────────────────
// Set these in your .env or replace with actual numeric IDs from Brevo dashboard
const TEMPLATE_ID_INDIVIDUAL = parseInt(process.env.BREVO_TEMPLATE_ID_INDIVIDUAL); // Gift card to recipient
const TEMPLATE_ID_BULK       = parseInt(process.env.BREVO_TEMPLATE_ID_BULK);        // Bulk summary to company

const apiKey = process.env.NEXT_BREVO_API_KEY;
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
  secure: true,
});

// ══════════════════════════════════════════════════════════════════════════════
// CRON ENTRY POINT
// ══════════════════════════════════════════════════════════════════════════════

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

  console.log("📧 [NOTIFICATION CRON] Scheduled (every 15 seconds)");
};

// ══════════════════════════════════════════════════════════════════════════════
// QUEUE PROCESSOR
// ══════════════════════════════════════════════════════════════════════════════

export async function processNotificationsQueue() {
  try {
    const ordersToNotify = await findOrdersReadyForNotification();

    if (ordersToNotify.length === 0) {
      return { success: true, processed: 0, message: "No orders ready for notification" };
    }

    const order = ordersToNotify[0]; // ✅ ONE at a time

    console.log(`📋 Processing notifications for: ${order.orderNumber}`);

    // ✅ Scheduled send UTC check
    if (order.sendType === "scheduleLater" && order.scheduledFor) {
      const scheduledTimeUTC = new Date(order.scheduledFor);
      const nowUTC = new Date();

      if (scheduledTimeUTC > nowUTC) {
        console.log(
          `⏰ Skipping ${order.orderNumber}: scheduled in ${Math.round(
            (scheduledTimeUTC - nowUTC) / 60000
          )} minutes`
        );
        return { success: true, processed: 0, message: "Order not yet ready to send" };
      }

      console.log(`✓ Scheduled order ready: ${order.orderNumber}`);
    } else {
      console.log(`🚀 [${order.orderNumber}] Immediate send`);
    }

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { processingStatus: "NOTIFICATIONS_SENDING", lastProcessedAt: new Date() },
      });

      const result = await sendOrderNotifications(order);

      console.log(`📊 [${order.orderNumber}] Result:`, result);

      if (result.success) {
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

// ══════════════════════════════════════════════════════════════════════════════
// ORDER FINDER
// ══════════════════════════════════════════════════════════════════════════════

async function findOrdersReadyForNotification() {
  const nowUTC = new Date();

  const orders = await prisma.$queryRaw`
    SELECT 
      o.id, o."orderNumber", o."brandId", o.quantity, o.amount, o.currency,
      o."deliveryMethod", o."bulkOrderNumber", o."senderName", o."senderEmail",
      o."message", o."processingStatus", o."retryCount", o."subCategoryId",
      o."customCardId", o."isCustom", o."sendType", o."scheduledFor", o."occasionId"
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
      CASE WHEN o."sendType" = 'sendImmediately' THEN 0 ELSE 1 END,
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
          voucherCode: { include: { giftCard: { select: { code: true } } } },
        },
        orderBy: { rowNumber: "asc" },
      },
      voucherCodes: {
        include: { giftCard: { select: { code: true } } },
        orderBy: { createdAt: "asc" },
        take: order.quantity,
      },
    },
  });

  return fullOrder ? [fullOrder] : [];
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPATCHER
// ══════════════════════════════════════════════════════════════════════════════

async function sendOrderNotifications(order) {
  const isBulkOrder = !!order.bulkOrderNumber;
  try {
    return isBulkOrder
      ? await sendBulkOrderNotifications(order)
      : await sendSingleOrderNotification(order);
  } catch (error) {
    console.error(`❌ [${order.orderNumber}] Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SINGLE ORDER  →  Template 2 (Individual Gift Card Email)
// ══════════════════════════════════════════════════════════════════════════════

async function sendSingleOrderNotification(order) {
  console.log(`📧 Single order notification: ${order.orderNumber}`);

  try {
    const voucherCode = order.voucherCodes[0];
    if (!voucherCode) throw new Error("No voucher codes found");

    // ── Resolve occasion / subcategory ──
    let selectedSubCategory = null;
    let occasionTitle        = null;

    if (order.isCustom && order.customCardId) {
      selectedSubCategory = await prisma.customCard.findUnique({ where: { id: order.customCardId } });
      occasionTitle = selectedSubCategory?.name || null;
    } else if (!order.isCustom && order.subCategoryId) {
      selectedSubCategory = await prisma.occasionCategory.findUnique({ where: { id: order.subCategoryId } });
      occasionTitle = selectedSubCategory?.name || order.occasion?.name || null;
    } else if (order.occasion) {
      occasionTitle = order.occasion.name;
    }

    const giftCode   = voucherCode.giftCard?.code || voucherCode.code;
    const redeemLink = voucherCode.tokenizedLink || getClaimUrl(order.brand);
    const expiryDate = voucherCode.expiresAt
      ? new Date(voucherCode.expiresAt).toLocaleDateString("en-IN")
      : "No Expiry";

    const senderName   = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";
    const senderEmail  = process.env.NEXT_BREVO_SENDER_EMAIL;
    const companyName  = order.senderName || "A special sender";
    const brandName    = order.brand?.brandName || "Gift Card";

    // ── Notification log ──
    const notification = await prisma.notificationDetail.create({
      data: {
        orderId:          order.id,
        recipientEmail:   order.receiverDetail.email,
        recipientPhone:   order.receiverDetail.phone,
        recipientName:    order.receiverDetail.name,
        notificationType: order.deliveryMethod === "email" ? "EMAIL"
                        : order.deliveryMethod === "whatsapp" ? "WHATSAPP" : "SMS",
        status:           "PENDING",
        voucherCodeId:    voucherCode.id,
        attemptCount:     0,
      },
    });

    try {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: { status: "SENDING", attemptCount: { increment: 1 } },
      });

      let result;

      if (order.deliveryMethod === "email") {
        // ✅ Use Brevo Template (Template 2 - Individual Gift Card)
        const emailSubject = occasionTitle
          ? `🎁 ${occasionTitle} – You've received a gift from ${companyName}`
          : `🎁 You've received a ${brandName} from ${companyName}`;

        const sendSmtpEmail = {
          sender:     { email: senderEmail, name: senderName },
          to:         [{ email: order.receiverDetail.email, name: order.receiverDetail.name }],
          subject:    emailSubject,
          templateId: TEMPLATE_ID_INDIVIDUAL,
          params: {
            // Recipient info
            recipientName:    order.receiverDetail.name,
            senderName:       companyName,
            occasionTitle:    occasionTitle || "this special occasion",

            // Brand
            brandName:        brandName,
            brandLogoUrl:     order.brand?.logo || "",

            // Gift card image (from subcategory or custom card)
            giftCardImageUrl: selectedSubCategory?.image || "",

            // Voucher details
            giftCode:         giftCode,
            currency:         order.currency,
            amount:           order.amount,
            expiryDate:       expiryDate,
            redeemLink:       redeemLink,

            // Optional personal message
            personalMessage:  order.message || "",
          },
        };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        result = { success: true, messageId: response.messageId };

        await prisma.notificationDetail.update({
          where: { id: notification.id },
          data: { emailServiceStatus: "DELIVERED", emailServiceId: response.messageId },
        });

      } else if (order.deliveryMethod === "whatsapp") {
        const shopifyGiftCard = {
          code:       voucherCode.giftCard?.code || voucherCode.code,
          maskedCode: voucherCode.code,
          balance:    { amount: voucherCode.originalValue },
        };
        const orderData = {
          selectedBrand:    order.brand,
          selectedAmount:   { value: order.amount, currency: order.currency },
          selectedSubCategory,
          deliveryDetails: {
            recipientFullName:      order.receiverDetail.name,
            recipientEmailAddress:  order.receiverDetail.email,
            recipientWhatsAppNumber: order.receiverDetail.phone,
          },
          personalMessage:  order.message,
          deliveryMethod:   order.deliveryMethod,
        };
        result = await SendWhatsappMessages(orderData, shopifyGiftCard);
        await prisma.notificationDetail.update({
          where: { id: notification.id },
          data: {
            whatsappServiceStatus: result.success ? "DELIVERED" : "FAILED",
            whatsappServiceId:     result.messageId,
            whatsappServiceError:  result.error || null,
          },
        });

      } else if (order.deliveryMethod === "print") {
        result = { success: true };
      }

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status:       result.success ? "DELIVERED" : "FAILED",
          sentAt:       new Date(),
          deliveredAt:  result.success ? new Date() : null,
          errorMessage: result.error || null,
          messageId:    result.messageId || null,
        },
      });

      console.log(`✅ Notification: ${result.success ? "DELIVERED" : "FAILED"}`);
      return { success: result.success, error: result.error };

    } catch (error) {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: { status: "FAILED", failedAt: new Date(), errorMessage: error.message },
      });
      throw error;
    }
  } catch (error) {
    console.error("❌ Single order notification failed:", error.message);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BULK ORDER DISPATCHER
// ══════════════════════════════════════════════════════════════════════════════

async function sendBulkOrderNotifications(order) {
  console.log(`📧 Bulk notifications: ${order.orderNumber}`);

  try {
    let selectedSubCategory = null;
    if (order.isCustom && order.customCardId) {
      selectedSubCategory = await prisma.customCard.findUnique({ where: { id: order.customCardId } });
    } else if (!order.isCustom && order.subCategoryId) {
      selectedSubCategory = await prisma.occasionCategory.findUnique({ where: { id: order.subCategoryId } });
    }

    // "multiple" = individual emails per recipient
    // everything else = summary CSV email to company
    return order.deliveryMethod === "multiple"
      ? await sendIndividualBulkEmails(order, selectedSubCategory)
      : await sendBulkSummaryEmail(order, selectedSubCategory);

  } catch (error) {
    console.error("❌ Bulk notifications failed:", error.message);
    return { success: false, error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL BULK EMAILS  →  Template 2 (same as single, per recipient)
// ══════════════════════════════════════════════════════════════════════════════

async function sendIndividualBulkEmails(order, selectedSubCategory) {
  const bulkRecipients = order.bulkRecipients || [];
  if (bulkRecipients.length === 0) throw new Error("No bulk recipients found");

  console.log(`📧 Sending to ${bulkRecipients.length} recipients`);

  const senderEmail  = process.env.NEXT_BREVO_SENDER_EMAIL;
  const senderName   = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";
  const companyName  = order.senderName || "A special sender";
  const brandName    = order.brand?.brandName || "Gift Card";

  let occasionTitle = selectedSubCategory?.name || order.occasion?.name || null;

  let sentCount   = 0;
  let failedCount = 0;

  for (const recipient of bulkRecipients) {
    // Idempotency check
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
        orderId:          order.id,
        recipientEmail:   recipient.recipientEmail,
        recipientName:    recipient.recipientName,
        bulkRecipientId:  recipient.id,
        voucherCodeId:    recipient.voucherCode.id,
        notificationType: "EMAIL",
        status:           "PENDING",
        attemptCount:     0,
      },
    });

    try {
      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: { status: "SENDING", attemptCount: { increment: 1 } },
      });

      const voucherCode = recipient.voucherCode;
      const giftCode    = voucherCode.giftCard?.code || voucherCode.code;
      const redeemLink  = voucherCode.tokenizedLink || getClaimUrl(order.brand);
      const expiryDate  = voucherCode.expiresAt
        ? new Date(voucherCode.expiresAt).toLocaleDateString("en-IN")
        : "No Expiry";

      const emailSubject = occasionTitle
        ? `🎁 ${occasionTitle} – You've received a gift from ${companyName}`
        : `🎁 ${companyName} sent you a ${brandName}!`;

      // ✅ Use Brevo Template (Template 2 - Individual Gift Card)
      const sendSmtpEmail = {
        sender:     { email: senderEmail, name: senderName },
        to:         [{ email: recipient.recipientEmail, name: recipient.recipientName }],
        subject:    emailSubject,
        templateId: TEMPLATE_ID_INDIVIDUAL,
        params: {
          recipientName:    recipient.recipientName,
          senderName:       companyName,
          occasionTitle:    occasionTitle || "this special occasion",

          brandName:        brandName,
          brandLogoUrl:     order.brand?.logo || "",
          giftCardImageUrl: selectedSubCategory?.image || "",

          giftCode:         giftCode,
          currency:         order.currency,
          amount:           order.amount,
          expiryDate:       expiryDate,
          redeemLink:       redeemLink,

          personalMessage:  recipient.personalMessage || order.message || "",
        },
      };

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status:             "DELIVERED",
          sentAt:             new Date(),
          deliveredAt:        new Date(),
          messageId:          response.messageId,
          emailServiceStatus: "DELIVERED",
          emailServiceId:     response.messageId,
        },
      });

      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: {
          emailSent:          true,
          emailSentAt:        new Date(),
          emailDelivered:     true,
          emailDeliveredAt:   new Date(),
        },
      });

      sentCount++;
      console.log(`✅ Sent ${sentCount}/${bulkRecipients.length}: ${recipient.recipientEmail}`);

    } catch (error) {
      failedCount++;
      console.error(`❌ Failed: ${recipient.recipientEmail}:`, error.message);

      await prisma.notificationDetail.update({
        where: { id: notification.id },
        data: {
          status:             "FAILED",
          failedAt:           new Date(),
          errorMessage:       error.message,
          emailServiceStatus: "FAILED",
          emailServiceError:  error.message,
        },
      });

      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: { emailError: error.message },
      });
    }
  }

  console.log(`📊 Bulk: ${sentCount} sent, ${failedCount} failed`);

  // ✅ Only succeed if ALL emails sent
  if (failedCount > 0) throw new Error(`${failedCount} emails failed to send`);

  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// BULK SUMMARY EMAIL  →  Template 3 (Bulk Order Complete)
// ══════════════════════════════════════════════════════════════════════════════

async function sendBulkSummaryEmail(order, selectedSubCategory) {
  console.log(`📧 Summary email to: ${order.senderEmail}`);

  const voucherCodes = order.voucherCodes;
  if (voucherCodes.length === 0) throw new Error("No voucher codes found");

  const notification = await prisma.notificationDetail.create({
    data: {
      orderId:          order.id,
      recipientEmail:   order.senderEmail,
      recipientName:    order.senderName,
      notificationType: "BULK_EMAIL",
      status:           "PENDING",
      attemptCount:     0,
    },
  });

  try {
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: { status: "SENDING", attemptCount: { increment: 1 } },
    });

    const senderEmail  = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName   = process.env.NEXT_BREVO_SENDER_NAME || "WoveGifts";
    const brandName    = order.brand?.brandName || "Gift Card";
    const totalVouchers = voucherCodes.length;
    const totalValue    = order.amount * totalVouchers;

    const brandUrl = getClaimUrl(order.brand);

    // ── Generate & upload CSV ──
    const csvHeader = "S.No,Gift Card Code,Amount,Currency,Expiry Date,Redeem URL\n";
    const csvRows = voucherCodes
      .map((vc, i) => {
        const vcExpiry   = vc.expiresAt ? new Date(vc.expiresAt).toLocaleDateString("en-IN") : "No Expiry";
        const code       = vc.giftCard?.code || vc.code;
        const redeemUrl  = vc.tokenizedLink || brandUrl;
        return `${i + 1},${code},${vc.originalValue},${order.currency},${vcExpiry},${redeemUrl}`;
      })
      .join("\n");

    const csvBuffer = Buffer.from(csvHeader + csvRows, "utf-8");
    const fileName  = `vouchers_${order.orderNumber}_${Date.now()}`;

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "bulk-vouchers", resource_type: "raw", public_id: fileName, format: "csv" },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(csvBuffer);
    });

    const csvUrl = uploadResult.secure_url;

    // ✅ Use Brevo Template (Template 3 - Bulk Order Complete)
    const sendSmtpEmail = {
      sender:     { email: senderEmail, name: senderName },
      to:         [{ email: order.senderEmail, name: order.senderName }],
      subject:    `🎁 Bulk Gift Card Order – ${totalVouchers} Vouchers Ready`,
      templateId: TEMPLATE_ID_BULK,
      params: {
        // Company
        companyName:      order.senderName || "Company",

        // Brand
        brandName:        brandName,
        brandLogoUrl:     order.brand?.logo || "",
        giftCardImageUrl: selectedSubCategory?.image || "",

        // Voucher stats
        totalVouchers:    totalVouchers,
        currency:         order.currency,
        amount:           order.amount,
        totalValue:       totalValue.toLocaleString("en-IN"),

        // CSV download
        csvUrl:           csvUrl,

        // Order reference
        orderNumber:      order.orderNumber,
      },
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status:             "DELIVERED",
        sentAt:             new Date(),
        deliveredAt:        new Date(),
        messageId:          response.messageId,
        emailServiceStatus: "DELIVERED",
        emailServiceId:     response.messageId,
      },
    });

    console.log("✅ Summary email sent:", response.messageId);
    return { success: true };

  } catch (error) {
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status:             "FAILED",
        failedAt:           new Date(),
        errorMessage:       error.message,
        emailServiceStatus: "FAILED",
        emailServiceError:  error.message,
      },
    });
    throw error;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FAILURE HANDLER
// ══════════════════════════════════════════════════════════════════════════════

async function handleNotificationFailure(order, error) {
  try {
    const newRetryCount = (order.retryCount || 0) + 1;
    const shouldFail    = newRetryCount >= MAX_RETRIES;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        processingStatus: shouldFail ? "FAILED" : "RETRYING",
        retryCount:       newRetryCount,
        lastProcessedAt:  new Date(),
        processingErrors: error?.message || "Unknown error",
      },
    });

    console.log(`⚠️ [${order.orderNumber}] ${shouldFail ? "FAILED" : "RETRYING"} (${newRetryCount}/${MAX_RETRIES})`);
  } catch (err) {
    console.error("❌ Failed to handle notification failure:", err.message);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════════════════════

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug ? `https://${selectedBrand.slug}.myshopify.com` : null);
  if (!claimUrl) throw new Error("Brand website or domain not configured");
  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

export default notificationProcessorCron;