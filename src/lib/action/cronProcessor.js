"use server";

import { prisma } from "../db.js";
import { SendGiftCardEmail, SendWhatsappMessages } from "./TwilloMessage.js";
import * as brevo from "@getbrevo/brevo";
import { v2 as cloudinary } from "cloudinary";

const apiKey = process.env.NEXT_BREVO_API_KEY;
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
  secure: true,
});

const BATCH_SIZE = 10; // Process 10 vouchers at a time
const MAX_RETRIES = 3;

// ==================== MAIN CRON PROCESSOR ====================
export const processOrderQueue = async () => {
  console.log("🔄 Starting order queue processor...");

  try {
    // ✅ STEP 1: Find orders that need processing
    const ordersToProcess = await findOrdersNeedingProcessing();

    if (ordersToProcess.length === 0) {
      console.log("✅ No orders to process");
      return { success: true, processed: 0 };
    }

    console.log(`📋 Found ${ordersToProcess.length} orders to process`);

    let processedCount = 0;
    let failedCount = 0;

    // ✅ STEP 2: Process each order
    for (const order of ordersToProcess) {
      try {
        await processOrder(order);
        processedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to process order ${order.orderNumber}:`,
          error,
        );
        failedCount++;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            retryCount: { increment: 1 },
            processingErrors: error.message,
            lastProcessedAt: new Date(),
            processingStatus:
              order.retryCount >= MAX_RETRIES ? "FAILED" : "RETRYING",
          },
        });
      }
    }

    console.log(
      `✅ Queue processor completed: ${processedCount} processed, ${failedCount} failed`,
    );

    return {
      success: true,
      processed: processedCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error("❌ Queue processor error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==================== FIND ORDERS - REMOVE STUCK STATE CONDITION ====================
async function findOrdersNeedingProcessing() {
  const now = new Date();

  return await prisma.order.findMany({
    where: {
      AND: [
        { isPaid: true },
        {
          OR: [
            // ✅ ONLY: Orders ready for initial processing
            {
              sendType: "sendImmediately",
              processingStatus: "PAYMENT_CONFIRMED",
              allVouchersGenerated: false,
            },
            // ✅ ONLY: Scheduled orders whose time has come
            {
              sendType: "scheduleLater",
              scheduledFor: { lte: now },
              processingStatus: "PAYMENT_CONFIRMED",
              allVouchersGenerated: false,
            },
            // ✅ ONLY: Orders with vouchers ready for notification
            {
              processingStatus: "VOUCHERS_CREATED",
              allVouchersGenerated: true,
              notificationsSent: false,
            },
            // ✅ Failed orders to retry
            {
              processingStatus: "RETRYING",
              retryCount: { lt: MAX_RETRIES },
            },
          ],
        },
      ],
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
      occasion: true,
      bulkRecipients: {
        where: {
          voucherCodeId: null,
        },
        orderBy: {
          rowNumber: "asc",
        },
        take: BATCH_SIZE,
      },
      voucherCodes: {
        select: {
          id: true,
          code: true,
        },
      },
    },
    orderBy: {
      paidAt: "asc",
    },
    take: 5,
  });
}

// ==================== PROCESS ORDER - STRICT QUANTITY VALIDATION ====================
async function processOrder(order) {
  console.log(
    `🔄 Processing order: ${order.orderNumber} (Status: ${order.processingStatus})`,
  );

  const isBulkOrder = !!order.bulkOrderNumber;
  const requiredQuantity = order.quantity;

  // ✅ STEP 1: Create vouchers if not all generated
  if (!order.allVouchersGenerated) {
    await createVouchersForOrder(order, isBulkOrder);
  }

  // ✅ STEP 2: Count actual vouchers in database (SOURCE OF TRUTH)
  const actualVoucherCount = await prisma.voucherCode.count({
    where: { orderId: order.id },
  });

  console.log(
    `📊 [${order.orderNumber}] Actual vouchers in DB: ${actualVoucherCount}/${requiredQuantity}`,
  );

  // ✅ STEP 3: Mark as complete when we have exactly what we need
  if (actualVoucherCount === requiredQuantity && !order.allVouchersGenerated) {
    console.log(
      `✅ [${order.orderNumber}] All ${actualVoucherCount} vouchers found, marking COMPLETE`,
    );

    await prisma.order.update({
      where: { id: order.id },
      data: {
        allVouchersGenerated: true,
        vouchersCreated: actualVoucherCount,
        processingStatus: "VOUCHERS_CREATED",
        lastProcessedAt: new Date(),
      },
    });

    await updateOrCreateSettlement(order.brand, order);
  }
  // ✅ ERROR CASE: More vouchers than needed - still mark complete to stop reprocessing
  else if (
    actualVoucherCount > requiredQuantity &&
    !order.allVouchersGenerated
  ) {
    console.error(
      `⚠️ [${order.orderNumber}] DATABASE ERROR: ${actualVoucherCount} vouchers, expected ${requiredQuantity}`,
    );

    // Still mark as complete to STOP the stuck loop
    await prisma.order.update({
      where: { id: order.id },
      data: {
        allVouchersGenerated: true,
        vouchersCreated: actualVoucherCount,
        processingStatus: "VOUCHERS_CREATED",
        lastProcessedAt: new Date(),
      },
    });

    await updateOrCreateSettlement(order.brand, order);
  } else if (order.allVouchersGenerated) {
    console.log(`✅ [${order.orderNumber}] Vouchers already generated`);
  } else if (actualVoucherCount < requiredQuantity) {
    console.log(
      `⏳ [${order.orderNumber}] Still creating... (${actualVoucherCount}/${requiredQuantity})`,
    );
  }

  // ✅ STEP 4: Send notifications if complete and not already sent
  if (order.allVouchersGenerated && !order.notificationsSent) {
    console.log(`📧 [${order.orderNumber}] Sending notifications (only ONCE)`);
    try {
      await sendNotificationsForOrder(order, isBulkOrder);
    } catch (error) {
      console.error(
        `❌ [${order.orderNumber}] Failed to send notifications:`,
        error.message,
      );
    }
  } else if (order.notificationsSent) {
    console.log(
      `✅ [${order.orderNumber}] Notifications already sent - skipping`,
    );
  }

  console.log(`✅ Order ${order.orderNumber} processing complete\n`);
}

// ==================== CREATE VOUCHERS FOR ORDER ====================
async function createVouchersForOrder(order, isBulkOrder) {
  console.log(`📝 Creating vouchers for order ${order.orderNumber}`);

  // ✅ CRITICAL: Check order quantity from order table
  const requiredQuantity = order.quantity;
  console.log(`📋 [${order.orderNumber}] Order.quantity = ${requiredQuantity}`);

  // ✅ Count existing vouchers in DATABASE
  const existingVoucherCount = await prisma.voucherCode.count({
    where: { orderId: order.id },
  });

  console.log(
    `📊 [${order.orderNumber}] Vouchers in DB: ${existingVoucherCount}`,
  );

  // ✅ CRITICAL: If we already have all needed vouchers, mark complete IMMEDIATELY
  if (existingVoucherCount >= requiredQuantity) {
    console.log(
      `✅ [${order.orderNumber}] Already have ${existingVoucherCount}/${requiredQuantity} vouchers, marking COMPLETE and exiting`,
    );

    // Update to VOUCHERS_CREATED immediately to prevent re-processing
    await prisma.order.update({
      where: { id: order.id },
      data: {
        allVouchersGenerated: true,
        vouchersCreated: existingVoucherCount,
        processingStatus: "VOUCHERS_CREATED", // ← Jump to VOUCHERS_CREATED, NOT VOUCHERS_CREATING
        lastProcessedAt: new Date(),
      },
    });
    return; // ← Exit early - no need to create more
  }

  // ✅ Calculate exactly how many more we need
  const vouchersNeeded = requiredQuantity - existingVoucherCount;

  console.log(
    `📝 [${order.orderNumber}] Need to create ${vouchersNeeded} more (${existingVoucherCount}/${requiredQuantity} exist)`,
  );

  // Update status to VOUCHERS_CREATING
  await prisma.order.update({
    where: { id: order.id },
    data: {
      processingStatus: "VOUCHERS_CREATING",
      processingStartedAt: order.processingStartedAt || new Date(),
      lastProcessedAt: new Date(),
    },
  });

  const voucherConfig = order.brand.vouchers[0];

  if (!voucherConfig) {
    throw new Error(
      `No voucher configuration found for brand ${order.brand.brandName}`,
    );
  }

  // Get occasion/custom card details
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
    selectedBrand: order.brand,
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

  // ✅ SCENARIO 3: Bulk order with CSV (multiple recipients)
  if (isBulkOrder && order.bulkRecipients.length > 0) {
    console.log(
      `📝 Processing bulk order with CSV - ${order.bulkRecipients.length} recipients`,
    );
    await createBulkVoucherBatch(
      order,
      orderData,
      voucherConfig,
      vouchersNeeded,
    );
  }
  // ✅ SCENARIO 2: Regular bulk order
  else if (isBulkOrder) {
    console.log(
      `📝 Processing regular bulk order - need ${vouchersNeeded} more vouchers`,
    );

    if (vouchersNeeded > 0) {
      await createRegularBulkVouchersStrict(
        order,
        orderData,
        voucherConfig,
        vouchersNeeded,
        existingVoucherCount,
      );
    }
  }
  // ✅ SCENARIO 1: Single order
  else if (!isBulkOrder && existingVoucherCount === 0) {
    console.log(`📝 Processing single order`);
    await createSingleVoucher(order, orderData, voucherConfig);
  } else {
    console.log(`⚠️ No voucher creation needed - already complete`);
  }
}

// ==================== SCENARIO 2: CREATE REGULAR BULK VOUCHERS - STRICT QUANTITY ====================
// ==================== CREATE REGULAR BULK VOUCHERS ====================
async function createRegularBulkVouchersStrict(
  order,
  orderData,
  voucherConfig,
  vouchersNeeded,
  existingCount,
) {
  // ✅ HARD LIMIT: Never exceed order.quantity
  const quantity = Math.min(BATCH_SIZE, vouchersNeeded);

  console.log(
    `📝 [${order.orderNumber}] Creating ${quantity} vouchers (${existingCount} exist, need ${order.quantity} total)`,
  );

  let createdInBatch = 0;

  for (let i = 0; i < quantity; i++) {
    try {
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
          note: `Bulk Order ${order.orderNumber} - Voucher ${existingCount + i + 1}/${order.quantity}`,
          isActive: true,
          isVirtual: true,
        },
      });

      const expireDate = calculateExpiryDate(voucherConfig, order.amount);
      const tokenizedLink = getClaimUrl(orderData.selectedBrand);
      const linkExpiresAt = new Date();
      linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

      await prisma.voucherCode.create({
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
          tokenizedLink,
          linkExpiresAt,
        },
      });

      createdInBatch++;
      console.log(
        `✅ [${order.orderNumber}] Voucher ${existingCount + i + 1}/${order.quantity} created`,
      );
    } catch (error) {
      console.error(
        `❌ [${order.orderNumber}] Failed to create voucher:`,
        error.message,
      );
      continue;
    }
  }

  // ✅ Update order with actual created count
  if (createdInBatch > 0) {
    const newTotal = existingCount + createdInBatch;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        vouchersCreated: newTotal,
        lastProcessedAt: new Date(),
      },
    });

    console.log(
      `✅ [${order.orderNumber}] Batch: Created ${createdInBatch}, Total in DB now: ${newTotal}/${order.quantity}`,
    );
  }
}

// ==================== CREATE SINGLE VOUCHER ====================
async function createSingleVoucher(order, orderData, voucherConfig) {
  console.log(`📝 Creating single voucher for order ${order.orderNumber}`);

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

  const expireDate = calculateExpiryDate(voucherConfig, order.amount);
  const tokenizedLink = getClaimUrl(orderData.selectedBrand);
  const linkExpiresAt = new Date();
  linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

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
      tokenizedLink,
      linkExpiresAt,
    },
  });

  // Update order voucher count
  await prisma.order.update({
    where: { id: order.id },
    data: {
      vouchersCreated: 1,
      lastProcessedAt: new Date(),
    },
  });

  console.log(`✅ Single voucher created: ${voucherCode.code}`);
}

// ==================== CREATE REGULAR BULK VOUCHERS - QUANTITY SAFEGUARD ====================
async function createRegularBulkVouchers(order, orderData, voucherConfig) {
  // ✅ CRITICAL: Calculate remaining vouchers needed
  const remainingNeeded = order.quantity - order.vouchersCreated;

  // ✅ SAFEGUARD: Never exceed order quantity
  if (remainingNeeded <= 0) {
    console.log(
      `⚠️ [${order.orderNumber}] Already created ${order.vouchersCreated}/${order.quantity} vouchers, skipping creation`,
    );
    return;
  }

  // ✅ BATCH: Only create up to BATCH_SIZE OR remaining needed, whichever is smaller
  const quantity = Math.min(BATCH_SIZE, remainingNeeded);

  console.log(
    `📝 [${order.orderNumber}] Creating ${quantity}/${order.quantity} vouchers (${order.vouchersCreated} already created)`,
  );

  // ✅ Track vouchers created in this batch for validation
  let batchCreatedCount = 0;

  for (let i = 0; i < quantity; i++) {
    try {
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
          note: `Bulk Order ${order.orderNumber} - Voucher ${order.vouchersCreated + i + 1}/${order.quantity}`,
          isActive: true,
          isVirtual: true,
        },
      });

      const expireDate = calculateExpiryDate(voucherConfig, order.amount);
      const tokenizedLink = getClaimUrl(orderData.selectedBrand);
      const linkExpiresAt = new Date();
      linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

      await prisma.voucherCode.create({
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
          tokenizedLink,
          linkExpiresAt,
        },
      });

      batchCreatedCount++;
      console.log(
        `✅ [${order.orderNumber}] Voucher ${order.vouchersCreated + i + 1}/${order.quantity} created`,
      );
    } catch (error) {
      console.error(
        `❌ [${order.orderNumber}] Failed to create voucher ${order.vouchersCreated + i + 1}:`,
        error.message,
      );
      // Continue processing even if one fails
      continue;
    }
  }

  // ✅ Update order count AFTER batch completes
  if (batchCreatedCount > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        vouchersCreated: { increment: batchCreatedCount },
        lastProcessedAt: new Date(),
      },
    });

    console.log(
      `✅ [${order.orderNumber}] Batch complete: ${batchCreatedCount} vouchers created (Total: ${order.vouchersCreated + batchCreatedCount}/${order.quantity})`,
    );
  } else {
    console.error(
      `⚠️ [${order.orderNumber}] No vouchers created in this batch`,
    );
  }
}

// ==================== CREATE BULK VOUCHER BATCH ====================
async function createBulkVoucherBatch(
  order,
  orderData,
  voucherConfig,
  vouchersNeeded,
) {
  const recipients = order.bulkRecipients;

  // ✅ Only create for recipients that don't have vouchers
  const recipientsNeedingVouchers = recipients.filter((r) => !r.voucherCodeId);
  const toCreate = recipientsNeedingVouchers.slice(
    0,
    Math.min(BATCH_SIZE, vouchersNeeded),
  );

  console.log(
    `📝 [${order.orderNumber}] Creating ${toCreate.length} vouchers for bulk recipients`,
  );

  let createdCount = 0;

  for (const recipient of toCreate) {
    try {
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

      const expireDate = calculateExpiryDate(voucherConfig, order.amount);
      const tokenizedLink = getClaimUrl(orderData.selectedBrand);
      const linkExpiresAt = new Date();
      linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

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
          tokenizedLink,
          linkExpiresAt,
        },
      });

      // Link voucher to recipient
      await prisma.bulkRecipient.update({
        where: { id: recipient.id },
        data: {
          voucherCodeId: voucherCode.id,
        },
      });

      createdCount++;
      console.log(
        `✅ [${order.orderNumber}] Voucher created for ${recipient.recipientEmail}`,
      );
    } catch (error) {
      console.error(
        `❌ [${order.orderNumber}] Failed to create voucher for ${recipient.recipientEmail}:`,
        error.message,
      );
      continue;
    }
  }

  // ✅ Update order voucher count
  if (createdCount > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        vouchersCreated: { increment: createdCount },
        lastProcessedAt: new Date(),
      },
    });

    console.log(
      `✅ [${order.orderNumber}] Created ${createdCount} vouchers for bulk recipients`,
    );
  }
}

// ==================== SEND NOTIFICATIONS ====================
async function sendNotificationsForOrder(order, isBulkOrder) {
  console.log(`📧 Sending notifications for order ${order.orderNumber}`);

  // ✅ Update status BEFORE sending notifications
  await prisma.order.update({
    where: { id: order.id },
    data: {
      processingStatus: "NOTIFICATIONS_SENDING",
      lastProcessedAt: new Date(),
    },
  });

  // ✅ CRITICAL: Refetch to get latest voucher codes for THIS order only
  const voucherCodes = await prisma.voucherCode.findMany({
    where: { orderId: order.id }, // ← Filter by order ID
    include: {
      giftCard: {
        select: {
          code: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(
    `📊 [${order.orderNumber}] Fetched ${voucherCodes.length} voucher codes`,
  );

  if (voucherCodes.length === 0) {
    console.warn(`⚠️ No voucher codes found for order ${order.orderNumber}`);
  }

  if (isBulkOrder) {
    const bulkRecipients = await prisma.bulkRecipient.findMany({
      where: { orderId: order.id },
      include: {
        voucherCode: {
          include: {
            giftCard: {
              select: {
                code: true,
              },
            },
          },
        },
      },
      orderBy: { rowNumber: "asc" },
    });

    if (order.deliveryMethod === "multiple") {
      // ✅ SCENARIO 3: Send individual emails (batch of 10)
      const batch = bulkRecipients
        .filter((r) => !r.emailSent)
        .slice(0, BATCH_SIZE);

      for (const recipient of batch) {
        await sendIndividualBulkEmail(order, recipient);
      }

      // Check if all sent
      const remainingCount = await prisma.bulkRecipient.count({
        where: {
          orderId: order.id,
          emailSent: false,
        },
      });

      if (remainingCount === 0) {
        // All individual emails sent, send summary
        await sendBulkSummaryEmail(order, bulkRecipients);

        await prisma.order.update({
          where: { id: order.id },
          data: {
            notificationsSent: true,
            processingStatus: "COMPLETED",
            processingCompletedAt: new Date(),
            lastProcessedAt: new Date(),
          },
        });
      }
    } else {
      // ✅ SCENARIO 2: Send summary email with CSV
      const orderDataForEmail = {
        selectedBrand: order.brand,
        selectedAmount: {
          value: order.amount,
          currency: order.currency,
        },
        companyInfo: {
          companyName: order.senderName || "Company",
          contactEmail: order.senderEmail,
          contactNumber: order.receiverDetail?.phone,
        },
      };

      // Fetch occasion/custom card for email
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
      orderDataForEmail.selectedSubCategory = selectedSubCategory;

      // ✅ FIXED: Don't pass voucherCodes, let function fetch them
      await sendRegularBulkSummaryEmail(order, orderDataForEmail);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          notificationsSent: true,
          processingStatus: "COMPLETED",
          processingCompletedAt: new Date(),
          lastProcessedAt: new Date(),
        },
      });
    }
  } else {
    // ✅ SCENARIO 1: Single order
    const voucherCode = voucherCodes[0];
    const shopifyGiftCard = {
      code: voucherCode.giftCard?.code || voucherCode.code,
      maskedCode: voucherCode.code,
      balance: {
        amount: voucherCode.originalValue,
      },
    };

    // Send notification based on delivery method
    await sendSingleOrderNotification(order, shopifyGiftCard);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        notificationsSent: true,
        processingStatus: "COMPLETED",
        processingCompletedAt: new Date(),
        lastProcessedAt: new Date(),
      },
    });
  }

  console.log(`✅ Notifications sent for order ${order.orderNumber}`);
}

// ==================== SEND SINGLE ORDER NOTIFICATION ====================
async function sendSingleOrderNotification(order, giftCard) {
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
    selectedAmount: {
      value: order.amount,
      currency: order.currency,
    },
    selectedSubCategory,
    deliveryDetails: {
      recipientFullName: order.receiverDetail.name,
      recipientEmailAddress: order.receiverDetail.email,
      recipientWhatsAppNumber: order.receiverDetail.phone,
    },
    personalMessage: order.message,
    deliveryMethod: order.deliveryMethod,
  };

  // Create notification record
  const notification = await prisma.notificationDetail.create({
    data: {
      orderId: order.id,
      recipientEmail: order.receiverDetail.email,
      recipientPhone: order.receiverDetail.phone,
      recipientName: order.receiverDetail.name,
      notificationType:
        order.deliveryMethod === "email"
          ? "EMAIL"
          : order.deliveryMethod === "whatsapp"
            ? "WHATSAPP"
            : "SMS",
      status: "PENDING",
    },
  });

  try {
    let result;
    if (order.deliveryMethod === "email") {
      result = await SendGiftCardEmail(orderData, giftCard);
    } else if (order.deliveryMethod === "whatsapp") {
      result = await SendWhatsappMessages(orderData, giftCard);
    } else if (order.deliveryMethod === "print") {
      result = { success: true };
    }

    // Update notification status
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: result.success ? "DELIVERED" : "FAILED",
        sentAt: new Date(),
        deliveredAt: result.success ? new Date() : null,
        errorMessage: result.success ? null : result.error,
        messageId: result.messageId || null,
      },
    });
  } catch (error) {
    // Update notification as failed
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: "FAILED",
        errorMessage: error.message,
        attemptCount: { increment: 1 },
      },
    });

    throw error;
  }
}

// ==================== SEND INDIVIDUAL BULK EMAIL ====================
async function sendIndividualBulkEmail(order, recipient) {
  // Create notification record
  const notification = await prisma.notificationDetail.create({
    data: {
      orderId: order.id,
      recipientEmail: recipient.recipientEmail,
      recipientName: recipient.recipientName,
      bulkRecipientId: recipient.id,
      notificationType: "EMAIL",
      status: "PENDING",
    },
  });

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
    order.selectedSubCategory = selectedSubCategory;

    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";
    const companyName = order.senderName || "A special sender";

    const voucherCode = recipient.voucherCode;

    // ✅ FIX: Use gift card code instead of masked voucher code
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
        giftCode, // ✅ Pass gift card code
        voucherCode,
        order,
        order.brand,
        expiryDate,
        companyName,
        recipient.personalMessage,
      ),
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Update notification
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: "DELIVERED",
        sentAt: new Date(),
        deliveredAt: new Date(),
        messageId: response.messageId,
      },
    });

    // Update bulk recipient
    await prisma.bulkRecipient.update({
      where: { id: recipient.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
        emailDelivered: true,
        emailDeliveredAt: new Date(),
      },
    });

    console.log(`✅ Email sent to ${recipient.recipientEmail}`);
  } catch (error) {
    // Update notification as failed
    await prisma.notificationDetail.update({
      where: { id: notification.id },
      data: {
        status: "FAILED",
        errorMessage: error.message,
        attemptCount: { increment: 1 },
      },
    });

    // Update bulk recipient
    await prisma.bulkRecipient.update({
      where: { id: recipient.id },
      data: {
        emailError: error.message,
      },
    });

    console.error(
      `❌ Failed to send email to ${recipient.recipientEmail}:`,
      error,
    );
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

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug
      ? `https://${selectedBrand.slug}.myshopify.com`
      : null);

  if (!claimUrl) {
    throw new Error("Brand website or domain not configured");
  }

  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

async function createShopifyGiftCard(
  selectedBrand,
  orderData,
  voucherConfig,
  recipientData = null,
) {
  if (!selectedBrand.domain) {
    throw new Error("Brand domain is required for gift card creation");
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
        ? `Bulk Order - ${orderData.quantity} vouchers`
        : `Order - Delivery Method: ${orderData.deliveryMethod}`,
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
      throw new Error(
        `Shopify API error: ${errorData.error || response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.gift_card?.id || !result.gift_card?.maskedCode) {
      throw new Error("Invalid Shopify gift card response");
    }

    return result.gift_card;
  } catch (error) {
    throw new Error(`Failed to create Shopify gift card: ${error.message}`);
  }
}

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

    console.log(`✅ Settlement updated for order ${order.orderNumber}`);
  } catch (error) {
    console.error("⚠️ Settlement update failed (non-critical):", error.message);
  }
}

// ==================== EMAIL TEMPLATES ====================
// ✅ FIX: Updated to accept giftCode as separate parameter
function generateIndividualGiftEmailHTML(
  recipient,
  giftCode, // ✅ Now accepts the actual gift card code
  voucherCode,
  orderData,
  selectedBrand,
  expiryDate,
  companyName,
  personalMessage,
) {
  const recipientName = recipient?.recipientName || "You";
  const currency = orderData?.currency || "₹";
  const amount = voucherCode?.originalValue || orderData?.amount || "100";
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

async function sendBulkSummaryEmail(order, bulkRecipients) {
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

    // ✅ FIX: Properly construct orderData with amount values
    const orderData = {
      companyInfo: {
        contactEmail: order.senderEmail,
        companyName: order.senderName || "Company",
      },
      selectedBrand: order.brand,
      selectedAmount: {
        value: order.amount, // ✅ Include amount
        currency: order.currency, // ✅ Include currency
      },
    };

    // ✅ Fetch occasion/custom card for email
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
    orderData.selectedSubCategory = selectedSubCategory;

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
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Bulk summary email sent to ${orderData.companyInfo.contactEmail}`,
    );
  } catch (error) {
    console.error(`❌ Failed to send bulk summary email:`, error);
    throw error;
  }
}

function generateBulkSummaryEmailHTML(
  order,
  orderData,
  voucherCodes,
  bulkRecipients,
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

// ==================== SEND REGULAR BULK SUMMARY EMAIL - QUANTITY CAPPED ====================
async function sendRegularBulkSummaryEmail(order, orderData) {
  try {
    const senderEmail = process.env.NEXT_BREVO_SENDER_EMAIL;
    const senderName = process.env.NEXT_BREVO_SENDER_NAME || "Gift Cards";

    if (!orderData?.companyInfo?.companyName) {
      throw new Error("Company name is required for bulk email");
    }

    if (!orderData?.companyInfo?.contactEmail) {
      throw new Error("Contact email is required for bulk email");
    }

    // ✅ FETCH ONLY THIS ORDER'S VOUCHERS
    const allVouchers = await prisma.voucherCode.findMany({
      where: { orderId: order.id },
      include: {
        giftCard: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ✅ CAP AT ORDER QUANTITY - never send more than ordered
    const voucherCodes = allVouchers.slice(0, order.quantity);
    const voucherCount = voucherCodes.length;

    console.log(
      `📊 [${order.orderNumber}] Email preparation: Total vouchers in DB: ${allVouchers.length}, Using for email: ${voucherCount}/${order.quantity}`,
    );

    // ✅ Alert if mismatch exists
    if (allVouchers.length > order.quantity) {
      console.error(
        `⚠️ [${order.orderNumber}] DATABASE ERROR: ${allVouchers.length} vouchers found, expected ${order.quantity}`,
      );
      console.log(`📋 Extra vouchers that won't be sent:`);
      allVouchers.slice(order.quantity).forEach((vc, idx) => {
        console.log(`   ${idx + 1}. ${vc.code} (EXTRA - will not be sent)`);
      });
    }

    if (voucherCount === 0) {
      throw new Error(`No voucher codes found for order ${order.orderNumber}`);
    }

    // Validate Cloudinary
    if (
      !process.env.NEXT_CLOUDINARY_CLOUD_NAME ||
      !process.env.NEXT_CLOUDINARY_API_KEY ||
      !process.env.NEXT_CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary configuration is missing");
    }

    const brandUrl = getClaimUrl(orderData.selectedBrand);

    // ✅ Generate CSV with EXACTLY voucherCount rows
    const csvHeader =
      "S.No,Gift Card Code,Amount,Currency,Expiry Date,Redeem URL\n";
    const csvRows = voucherCodes
      .map((vc, index) => {
        const expiryDate = vc.expiresAt
          ? new Date(vc.expiresAt).toLocaleDateString()
          : "No Expiry";

        const giftCardCode = vc.giftCard?.code || vc.code;
        const redeemUrl = vc.tokenizedLink || brandUrl;

        console.log(`   Row ${index + 1}/${voucherCount}: ${giftCardCode}`);

        return `${index + 1},${giftCardCode},${vc.originalValue},${orderData.selectedAmount?.currency || "₹"},${expiryDate},${redeemUrl}`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const csvBuffer = Buffer.from(csvContent, "utf-8");

    const timestamp = Date.now();
    const fileName = `vouchers_${order.orderNumber}_${orderData.companyInfo.companyName.replace(/\s+/g, "_")}_${timestamp}`;

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
    console.log(
      `✅ [${order.orderNumber}] CSV uploaded with ${voucherCount} codes`,
    );

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
      subject: `🎁 Bulk Gift Card Order - ${voucherCodes.length} Vouchers`,
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
                🎁 Your Bulk Gift Card Order!
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
      `✅ [${order.orderNumber}] Email sent with ${voucherCount} voucher codes`,
    );
  } catch (error) {
    console.error(`❌ [${order.orderNumber}] Email error:`, error.message);
    // Don't throw - continue
  }
}
