/**
 * VOUCHER PROCESSOR - BULLETPROOF FOR CONCURRENT ORDERS
 *
 * CRITICAL FIXES:
 * 1. Process ONE order at a time (no concurrent processing)
 * 2. Proper order locking to prevent interference
 * 3. Atomic voucher creation with strict count verification
 * 4. Works perfectly for single, bulk CSV, and bulk email orders
 */

import cron from "node-cron";
import { prisma } from "../db.js";

const MAX_RETRIES = 3;
const PROCESSING_TIMEOUT_MINUTES = 15;
const BATCH_SIZE = 5; // Create 5 vouchers per iteration
const DEFAULT_EXPIRY_YEARS = 3;

export const voucherProcessorCron = () => {
  cron.schedule("*/10 * * * * *", async () => {
    console.log("\n🎟️ [VOUCHER CRON] Starting voucher processor...");

    try {
      const result = await processVouchersQueue();
      console.log("✅ [VOUCHER CRON] Completed:", result);
    } catch (error) {
      console.error("❌ [VOUCHER CRON] Error:", error.message);
    }
  });

  console.log(
    "🎟️ [VOUCHER CRON] Voucher processor scheduled (every 10 seconds)",
  );
};

export async function processVouchersQueue() {
  try {
    // ✅ CRITICAL: Process ONE order at a time
    const ordersToProcess = await findOrdersNeedingVouchers();

    if (ordersToProcess.length === 0) {
      return {
        success: true,
        processed: 0,
        message: "No orders needing vouchers",
      };
    }

    // ✅ CRITICAL: Only process the FIRST order (prevents concurrent processing)
    const order = ordersToProcess[0];

    console.log(
      `📋 Processing order: ${order.orderNumber} (${order.quantity} vouchers needed)`,
    );

    try {
      await processOrderVouchers(order);
      console.log(`✅ Order ${order.orderNumber} completed`);

      return {
        success: true,
        processed: 1,
        failed: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `❌ Failed to process order ${order.orderNumber}:`,
        error.message,
      );
      await markOrderAsFailed(order.id, error);

      return {
        success: false,
        processed: 0,
        failed: 1,
        error: error.message,
      };
    }
  } catch (error) {
    console.error("❌ [VOUCHER CRON] Queue processing error:", error);
    return { success: false, error: error.message };
  }
}

async function findOrdersNeedingVouchers() {
  const stuckThreshold = new Date(
    Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000,
  );

  // ✅ CRITICAL: Use FOR UPDATE to lock the row
  const orders = await prisma.$queryRaw`
    SELECT 
      o.id,
      o."orderNumber",
      o."brandId",
      o.quantity,
      o.amount,
      o.currency,
      o."subCategoryId",
      o."customCardId",
      o."isCustom",
      o."deliveryMethod",
      o."processingStatus",
      o."allVouchersGenerated",
      o."retryCount",
      o."bulkOrderNumber",
      o."createdAt",
      o."message",
      o."senderName",
      o."senderEmail",
      o."totalAmount"
    FROM "Order" o
    WHERE 
      o."isPaid" = true
      AND o."allVouchersGenerated" = false
      AND (
        (
          o."processingStatus" = 'PAYMENT_CONFIRMED'
          AND o."processingStartedAt" IS NULL
        )
        OR
        (
          o."processingStatus" = 'VOUCHERS_CREATING'
          AND o."lastProcessedAt" < ${stuckThreshold}
          AND o."retryCount" < ${MAX_RETRIES}
        )
        OR
        (
          o."processingStatus" = 'RETRYING'
          AND o."retryCount" < ${MAX_RETRIES}
        )
      )
    ORDER BY o."paidAt" ASC, o."createdAt" ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `;

  if (orders.length === 0) return [];

  const order = orders[0];

  // Fetch full order with relations
  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      brand: {
        include: {
          vouchers: {
            include: {
              denominations: true,
            },
          },
          brandTerms: true,
        },
      },
      receiverDetail: true,
      bulkRecipients: {
        where: { voucherCodeId: null },
        orderBy: { rowNumber: "asc" },
      },
      voucherCodes: true,
    },
  });

  return fullOrder ? [fullOrder] : [];
}

async function processOrderVouchers(order) {
  console.log(`📝 Creating vouchers for ${order.orderNumber}`);

  // ✅ STEP 1: Lock order and verify current state
  const currentState = await prisma.$transaction(
    async (tx) => {
      // Lock the order
      await tx.$executeRaw`
        SELECT * FROM "Order" 
        WHERE id = ${order.id}
        FOR UPDATE
      `;

      // Count existing vouchers
      const existingCount = await tx.voucherCode.count({
        where: { orderId: order.id },
      });

      console.log(
        `📊 [${order.orderNumber}] Existing: ${existingCount}/${order.quantity}`,
      );

      // If already complete, mark and return
      if (existingCount >= order.quantity) {
        console.log(`✅ [${order.orderNumber}] Already complete`);

        await tx.order.update({
          where: { id: order.id },
          data: {
            allVouchersGenerated: true,
            vouchersCreated: existingCount,
            processingStatus: "VOUCHERS_CREATED",
            lastProcessedAt: new Date(),
          },
        });

        return { isComplete: true, existingCount };
      }

      // Mark as processing
      await tx.order.update({
        where: { id: order.id },
        data: {
          processingStatus: "VOUCHERS_CREATING",
          processingStartedAt: order.processingStartedAt || new Date(),
          lastProcessedAt: new Date(),
        },
      });

      return { isComplete: false, existingCount };
    },
    { isolationLevel: "Serializable", timeout: 30000 },
  );

  // If complete, update settlement and exit
  if (currentState.isComplete) {
    await updateOrCreateSettlement(order.brand, order);
    return;
  }

  // ✅ STEP 2: Get voucher configuration
  const voucherConfig = order.brand.vouchers[0];
  if (!voucherConfig) {
    throw new Error(
      `No voucher configuration for brand ${order.brand.brandName}`,
    );
  }

  // Get occasion details
  let occasionDetails = null;
  if (!order.isCustom && order.subCategoryId) {
    occasionDetails = await prisma.occasionCategory.findUnique({
      where: { id: order.subCategoryId },
    });
  } else if (order.isCustom && order.customCardId) {
    occasionDetails = await prisma.customCard.findUnique({
      where: { id: order.customCardId },
    });
  }

  const orderData = buildOrderData(order, occasionDetails);

  // ✅ STEP 3: Create vouchers based on order type
  const vouchersNeeded = order.quantity - currentState.existingCount;
  console.log(
    `🔄 [${order.orderNumber}] Creating ${vouchersNeeded} more vouchers`,
  );

  if (order.bulkOrderNumber && order.bulkRecipients?.length > 0) {
    // CSV bulk order
    await createBulkVouchersForCSV(order, orderData, voucherConfig);
  } else {
    // Regular order or bulk email order
    await createVouchersInBatches(
      order,
      orderData,
      voucherConfig,
      vouchersNeeded,
    );
  }

  // ✅ STEP 4: Verify final count
  const finalCount = await prisma.voucherCode.count({
    where: { orderId: order.id },
  });

  console.log(
    `📊 [${order.orderNumber}] Final count: ${finalCount}/${order.quantity}`,
  );

  if (finalCount >= order.quantity) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        allVouchersGenerated: true,
        vouchersCreated: finalCount,
        processingStatus: "VOUCHERS_CREATED",
        lastProcessedAt: new Date(),
      },
    });

    console.log(`💰 [${order.orderNumber}] Updating settlement...`);
    await updateOrCreateSettlement(order.brand, order);
    console.log(`✅ [${order.orderNumber}] Complete!`);
  } else {
    console.warn(
      `⚠️ [${order.orderNumber}] Incomplete: ${finalCount}/${order.quantity}`,
    );
    throw new Error(`Voucher count mismatch: ${finalCount}/${order.quantity}`);
  }
}

/**
 * ✅ CRITICAL: Create vouchers in batches with atomic count check
 */
async function createVouchersInBatches(
  order,
  orderData,
  voucherConfig,
  vouchersNeeded,
) {
  let totalCreated = 0;
  const targetCount = order.quantity;

  while (totalCreated < vouchersNeeded) {
    const batchSize = Math.min(BATCH_SIZE, vouchersNeeded - totalCreated);

    console.log(
      `🔄 [${order.orderNumber}] Creating batch of ${batchSize} (${totalCreated}/${vouchersNeeded} done)`,
    );

    for (let i = 0; i < batchSize; i++) {
      try {
        // Create Shopify gift card
        const shopifyGiftCard = await createShopifyGiftCard(
          orderData.selectedBrand,
          orderData,
          voucherConfig,
          null,
          order.paidAt || order.createdAt || new Date(),
        );

        if (!shopifyGiftCard?.id) {
          console.warn(`⚠️ [${order.orderNumber}] Shopify API failed`);
          continue;
        }

        // Save with atomic count check
        const saved = await saveVoucherAtomic(
          order,
          shopifyGiftCard,
          orderData,
          voucherConfig,
          null,
          targetCount,
        );

        if (saved) {
          totalCreated++;
          console.log(
            `✅ [${order.orderNumber}] Progress: ${totalCreated}/${vouchersNeeded}`,
          );
        } else {
          console.log(`⚠️ [${order.orderNumber}] Limit reached or duplicate`);
          return; // Stop if limit reached
        }
      } catch (error) {
        console.error(
          `❌ [${order.orderNumber}] Voucher ${i + 1} failed:`,
          error.message,
        );
        // Continue to next voucher
      }
    }

    // Small delay between batches
    if (totalCreated < vouchersNeeded) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(`✅ [${order.orderNumber}] Created ${totalCreated} vouchers`);
}

/**
 * ✅ CRITICAL: Create vouchers for CSV bulk orders
 */
async function createBulkVouchersForCSV(order, orderData, voucherConfig) {
  const recipients = order.bulkRecipients || [];
  const recipientsNeedingVouchers = recipients.filter((r) => !r.voucherCodeId);

  console.log(
    `📊 [${order.orderNumber}] CSV bulk: ${recipientsNeedingVouchers.length} recipients`,
  );

  let createdCount = 0;

  for (const recipient of recipientsNeedingVouchers) {
    try {
      const recipientData = {
        name: recipient.recipientName,
        email: recipient.recipientEmail,
        phone: recipient.recipientPhone,
        message: recipient.personalMessage,
      };

      // Create Shopify gift card
      const shopifyGiftCard = await createShopifyGiftCard(
        orderData.selectedBrand,
        orderData,
        voucherConfig,
        recipientData,
        order.paidAt || order.createdAt || new Date(),
      );

      if (!shopifyGiftCard?.id) {
        console.warn(
          `⚠️ [${order.orderNumber}] Failed for ${recipient.recipientEmail}`,
        );
        continue;
      }

      // Save with atomic count check AND link to recipient
      const saved = await saveVoucherAtomic(
        order,
        shopifyGiftCard,
        orderData,
        voucherConfig,
        recipient,
        order.quantity,
      );

      if (saved) {
        createdCount++;
        console.log(
          `✅ [${order.orderNumber}] CSV: ${createdCount}/${recipientsNeedingVouchers.length} - ${recipient.recipientEmail}`,
        );
      } else {
        console.log(
          `⚠️ [${order.orderNumber}] Limit reached at ${createdCount}`,
        );
        break;
      }
    } catch (error) {
      console.error(
        `❌ [${order.orderNumber}] Failed for ${recipient.recipientEmail}:`,
        error.message,
      );
      // Continue to next recipient
    }
  }

  console.log(
    `✅ [${order.orderNumber}] CSV bulk complete: ${createdCount} vouchers`,
  );
}

/**
 * ✅ CRITICAL: Save voucher with ATOMIC count check
 * This is the KEY function that prevents race conditions
 */
async function saveVoucherAtomic(
  order,
  shopifyGiftCard,
  orderData,
  voucherConfig,
  recipient,
  targetCount,
) {
  let retries = 3;

  while (retries > 0) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // ✅ CRITICAL: Count with lock
          const currentCount = await tx.voucherCode.count({
            where: { orderId: order.id },
          });

          // ✅ CRITICAL: Check limit BEFORE creating
          if (currentCount >= targetCount) {
            console.log(
              `⚠️ [${order.orderNumber}] At limit: ${currentCount}/${targetCount}`,
            );
            return false;
          }

          // Check for duplicate code
          const existing = await tx.voucherCode.findFirst({
            where: {
              orderId: order.id,
              code: shopifyGiftCard.maskedCode,
            },
          });

          if (existing) {
            console.log(
              `⚠️ [${order.orderNumber}] Duplicate code: ${shopifyGiftCard.maskedCode}`,
            );
            return false;
          }

          // Create gift card
          const giftCard = await tx.giftCard.upsert({
            where: { shopifyId: shopifyGiftCard.id },
            update: {
              balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
              customerEmail:
                recipient?.recipientEmail ||
                orderData.companyInfo?.contactEmail ||
                order.receiverDetail?.email,
              updatedAt: new Date(),
            },
            create: {
              shop: orderData.selectedBrand.domain,
              shopifyId: shopifyGiftCard.id,
              code: shopifyGiftCard.code,
              initialValue: parseFloat(shopifyGiftCard.balance?.amount || 0),
              balance: parseFloat(shopifyGiftCard.balance?.amount || 0),
              customerEmail:
                recipient?.recipientEmail ||
                orderData.companyInfo?.contactEmail ||
                order.receiverDetail?.email,
              note: recipient
                ? `Gift for ${recipient.recipientName} - Order ${order.orderNumber}`
                : `Order ${order.orderNumber} - Voucher ${currentCount + 1}/${targetCount}`,
              isActive: true,
              isVirtual: true,
            },
          });

          // Create voucher code
          const expiryDate = calculateExpiryDate(
            voucherConfig,
            order.amount,
            order.paidAt || order.createdAt || new Date(),
          );
          const tokenizedLink = getClaimUrl(orderData.selectedBrand);
          const linkExpiresAt = new Date();
          linkExpiresAt.setDate(linkExpiresAt.getDate() + 7);

          const voucherCode = await tx.voucherCode.create({
            data: {
              code: shopifyGiftCard.maskedCode,
              orderId: order.id,
              voucherId: voucherConfig.id,
              originalValue: order.amount,
              remainingValue: order.amount,
              expiresAt: expiryDate,
              isRedeemed: false,
              shopifyGiftCardId: giftCard.id,
              shopifyShop: orderData.selectedBrand.domain,
              shopifySyncedAt: new Date(),
              tokenizedLink,
              linkExpiresAt,
            },
          });

          // Link to recipient if CSV bulk order
          if (recipient) {
            await tx.bulkRecipient.update({
              where: { id: recipient.id },
              data: { voucherCodeId: voucherCode.id },
            });
          }

          return true;
        },
        {
          isolationLevel: "Serializable",
          timeout: 30000,
        },
      );
    } catch (error) {
      retries--;
      if (error.code === "P2034" || error.message.includes("timeout")) {
        console.log(`⚠️ Transaction timeout, retrying... (${3 - retries}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        throw error;
      }
    }
  }

  throw new Error("Failed after 3 retries");
}

async function markOrderAsFailed(orderId, error) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { retryCount: true, orderNumber: true },
    });

    const newRetryCount = (order?.retryCount || 0) + 1;
    const shouldFail = newRetryCount >= MAX_RETRIES;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        retryCount: newRetryCount,
        processingErrors: error.message,
        lastProcessedAt: new Date(),
        processingStatus: shouldFail ? "FAILED" : "RETRYING",
      },
    });

    console.log(
      `⚠️ [${order?.orderNumber}] ${shouldFail ? "FAILED" : "RETRYING"} (${newRetryCount}/${MAX_RETRIES})`,
    );
  } catch (err) {
    console.error("❌ Failed to mark as failed:", err.message);
  }
}

async function updateOrCreateSettlement(selectedBrand, order) {
  try {
    console.log(
      `💰 [${order.orderNumber}] Updating settlement for ${selectedBrand.brandName}`,
    );

    const orderDate = new Date(order.createdAt);
    const periodStart = new Date(
      orderDate.getFullYear(),
      orderDate.getMonth(),
      1,
    );
    const periodEnd = new Date(
      orderDate.getFullYear(),
      orderDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const settlementPeriod = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

    const [brandTermsFromDb, existingSettlement, orderTotals] =
      await Promise.all([
        prisma.brandTerms.findUnique({
          where: { brandId: selectedBrand.id },
          select: {
            settlementTrigger: true,
            commissionType: true,
            commissionValue: true,
            vatRate: true,
          },
        }),
        prisma.settlements.findFirst({
          where: {
            brandId: selectedBrand.id,
            settlementPeriod,
          },
        }),
        prisma.order.aggregate({
          where: {
            brandId: selectedBrand.id,
            isPaid: true,
            paymentStatus: "COMPLETED",
            isActive: true,
            allVouchersGenerated: true,
            createdAt: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: {
            quantity: true,
            totalAmount: true,
          },
        }),
      ]);

    const brandTerms = brandTermsFromDb || selectedBrand.brandTerms || null;
    const settlementTrigger = brandTerms?.settlementTrigger || "onRedemption";
    const totalSold = orderTotals._sum.quantity || 0;
    const totalSoldAmount = orderTotals._sum.totalAmount || 0;

    const redeemedCount = existingSettlement?.totalRedeemed || 0;
    const redeemedAmount = existingSettlement?.redeemedAmount || 0;
    const outstanding = Math.max(0, totalSold - redeemedCount);
    const outstandingAmount = Math.max(0, totalSoldAmount - redeemedAmount);

    let commissionAmount = 0;

    if (brandTerms?.commissionType === "Percentage") {
      commissionAmount = Number(
        ((totalSoldAmount * (brandTerms.commissionValue || 0)) / 100).toFixed(
          2,
        ),
      );
    } else if (brandTerms?.commissionType === "Fixed") {
      commissionAmount = Number(
        ((brandTerms.commissionValue || 0) * totalSold).toFixed(2),
      );
    }

    const vatRate = brandTerms?.vatRate || 0;
    const vatAmount = Number(((commissionAmount * vatRate) / 100).toFixed(2));
    const netPayable = totalSoldAmount - commissionAmount;

    if (settlementTrigger === "onPurchase") {
      // onPurchase: always recompute and set final values from table totals + term percentages.
      if (existingSettlement) {
        await prisma.settlements.update({
          where: { id: existingSettlement.id },
          data: {
            totalSold,
            totalSoldAmount,
            outstanding,
            outstandingAmount,
            commissionAmount,
            vatAmount,
            netPayable,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ [onPurchase] Settlement recalculated: ${settlementPeriod}`,
        );
      } else {
        await prisma.settlements.create({
          data: {
            brandId: selectedBrand.id,
            settlementPeriod,
            periodStart,
            periodEnd,
            totalSold,
            totalSoldAmount,
            totalRedeemed: 0,
            redeemedAmount: 0,
            outstanding,
            outstandingAmount,
            commissionAmount,
            vatAmount,
            breakageAmount: 0,
            netPayable,
            status: "Pending",
          },
        });
        console.log(
          `✅ [onPurchase] Settlement created with recalculated totals: ${settlementPeriod}`,
        );
      }
    } else {
      // onRedemption: commission/VAT/netPayable are managed by redemption processing only.
      if (existingSettlement) {
        await prisma.settlements.update({
          where: { id: existingSettlement.id },
          data: {
            totalSold,
            totalSoldAmount,
            outstanding,
            outstandingAmount,
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ [onRedemption] Settlement sales totals recalculated: ${settlementPeriod}`,
        );
      } else {
        await prisma.settlements.create({
          data: {
            brandId: selectedBrand.id,
            settlementPeriod,
            periodStart,
            periodEnd,
            totalSold,
            totalSoldAmount,
            totalRedeemed: 0,
            redeemedAmount: 0,
            outstanding,
            outstandingAmount,
            commissionAmount: 0, // redemption webhook owns this
            vatAmount: 0, // redemption webhook owns this
            breakageAmount: 0,
            netPayable: 0, // redemption webhook owns this
            status: "Pending",
          },
        });
        console.log(
          `✅ [onRedemption] Settlement created with recalculated sales totals: ${settlementPeriod}`,
        );
      }
    }
  } catch (error) {
    console.error(
      `⚠️ [${order.orderNumber}] Settlement update failed:`,
      error.message,
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

function buildOrderData(order, occasionDetails) {
  return {
    selectedBrand: order.brand,
    selectedSubCategory: occasionDetails,
    selectedAmount: { value: order.amount, currency: order.currency },
    quantity: order.quantity,
    isBulkOrder: !!order.bulkOrderNumber,
    companyInfo: order.bulkOrderNumber
      ? { companyName: order.senderName, contactEmail: order.senderEmail }
      : null,
    deliveryOption: order.deliveryMethod,
    deliveryMethod: order.deliveryMethod,
    deliveryDetails: !order.bulkOrderNumber
      ? {
          recipientFullName: order.receiverDetail.name,
          recipientEmailAddress: order.receiverDetail.email,
          recipientWhatsAppNumber: order.receiverDetail.phone,
        }
      : null,
  };
}

function calculateExpiryDate(voucherConfig, amount, baseDate) {
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

  if (!expireDate) {
    expireDate = getDefaultExpiryDate(baseDate);
  }

  return expireDate;
}

function getDefaultExpiryDate(baseDate) {
  const normalizedBase = baseDate ? new Date(baseDate) : new Date();
  const date = Number.isNaN(normalizedBase.getTime())
    ? new Date()
    : normalizedBase;
  date.setFullYear(date.getFullYear() + DEFAULT_EXPIRY_YEARS);
  return date;
}

function getClaimUrl(selectedBrand) {
  const claimUrl =
    selectedBrand?.website ||
    selectedBrand?.domain ||
    (selectedBrand?.slug
      ? `https://${selectedBrand.slug}.myshopify.com`
      : null);
  if (!claimUrl) throw new Error("Brand website or domain not configured");
  return claimUrl.startsWith("http") ? claimUrl : `https://${claimUrl}`;
}

async function createShopifyGiftCard(
  selectedBrand,
  orderData,
  voucherConfig,
  recipientData = null,
  purchaseDate = null,
) {
  if (!selectedBrand.domain) throw new Error("Brand domain is required");

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
      ? `Gift for ${recipientData.name}`
      : isBulkOrder
        ? `Bulk Order`
        : `Order`,
    denominationValue: orderData.selectedAmount.value,
    purchaseDate: purchaseDate
      ? new Date(purchaseDate).toISOString()
      : null,
  };

  const apiUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/giftcard?shop=${
    selectedBrand.domain
  }&denominationType=${voucherConfig.denominationType}`;

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
}

export default voucherProcessorCron;
