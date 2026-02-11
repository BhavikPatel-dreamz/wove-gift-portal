import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const shopDomain = req.headers.get("x-shopify-shop-domain");

    if (!shopDomain) {
      return NextResponse.json(
        { success: false, error: "Missing shop domain" },
        { status: 400 }
      );
    }

    const session = await prisma.shopifySession.findUnique({
      where: { shop: shopDomain },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No session for this store" },
        { status: 400 }
      );
    }

    const accessToken = session.accessToken;
    const orderId = body.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    const transactionsRes = await fetch(
      `https://${shopDomain}/admin/api/2025-10/orders/${orderId}/transactions.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    const transactionsData = await transactionsRes.json();
    const transactions = transactionsData.transactions || [];

    const giftCardTxns = transactions.filter(
      (txn) => txn.gateway === "gift_card" && txn.status === "success"
    );

    if (giftCardTxns.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No gift card usage found.",
      });
    }

    const redemptions = [];
    let skippedCount = 0;

    for (const txn of giftCardTxns) {
      const numericGiftCardId = txn.receipt?.gift_card_id;
      const amountRedeemed = Number(parseFloat(txn.amount));
      const transactionId = txn.id.toString();

      if (!numericGiftCardId) continue;

      try {
        // ✅ CHECK IF THIS TRANSACTION WAS ALREADY PROCESSED (COMPOSITE UNIQUE KEY)
        const existingRedemption = await prisma.voucherRedemption.findFirst({
          where: {
            transactionId: transactionId,
            storeUrl: shopDomain,
          },
        });

        if (existingRedemption) {
          console.log(`⏭️ Transaction ${transactionId} already processed, skipping...`);
          skippedCount++;
          continue; // Skip this transaction - PREVENTS DUPLICATES
        }

        const giftCardGid = `gid://shopify/GiftCard/${numericGiftCardId}`;

        const giftCard = await prisma.giftCard.findUnique({
          where: { shopifyId: giftCardGid },
        });
        
        if (!giftCard) {
          console.log(`⚠️ Gift card ${giftCardGid} not found in database`);
          continue;
        }

        const voucherCode = await prisma.voucherCode.findUnique({
          where: { shopifyGiftCardId: giftCard.id },
        });
        
        if (!voucherCode) {
          console.log(`⚠️ Voucher code not found for gift card ${giftCard.id}`);
          continue;
        }

        const currentBalance = voucherCode.remainingValue;
        const actualAmountRedeemed = Math.min(amountRedeemed, currentBalance);
        const balanceAfter = Math.max(0, currentBalance - actualAmountRedeemed);
        const isFullyRedeemed = balanceAfter === 0;

        // ✅ USE TRANSACTION TO ENSURE ATOMICITY
        const result = await prisma.$transaction(async (tx) => {
          // Double-check inside transaction to prevent race conditions
          const doubleCheck = await tx.voucherRedemption.findFirst({
            where: {
              transactionId: transactionId,
              storeUrl: shopDomain,
            },
          });

          if (doubleCheck) {
            console.log(`⏭️ Transaction ${transactionId} caught in race condition check`);
            return null;
          }

          if (actualAmountRedeemed <= 0) {
            console.log(
              `⏭️ Transaction ${transactionId} has zero amount, skipping...`
            );
            return null;
          }

          // CREATE REDEMPTION RECORD
          const redemption = await tx.voucherRedemption.create({
            data: {
              voucherCodeId: voucherCode.id,
              amountRedeemed: actualAmountRedeemed,
              balanceAfter,
              redeemedAt: new Date(txn.processed_at),
              transactionId: transactionId,
              storeUrl: shopDomain,
            },
          });

          // UPDATE VOUCHER CODE
          await tx.voucherCode.update({
            where: { id: voucherCode.id },
            data: {
              remainingValue: balanceAfter,
              isRedeemed: isFullyRedeemed,
              redeemedAt: isFullyRedeemed
                ? new Date(txn.processed_at)
                : voucherCode.redeemedAt,
              shopifySyncedAt: new Date(),
            },
          });

          // UPDATE ORDER STATUS
          await tx.order.update({
            where: { id: voucherCode.orderId },
            data: {
              redemptionStatus: isFullyRedeemed
                ? "Redeemed"
                : "PartiallyRedeemed",
              redeemedAt: isFullyRedeemed
                ? new Date(txn.processed_at)
                : voucherCode.redeemedAt,
            },
          });

          // UPDATE SETTLEMENT
          const orderForSettlement = await tx.order.findUnique({
            where: { id: voucherCode.orderId },
            select: {
              brandId: true,
              createdAt: true,
            },
          });

          if (orderForSettlement) {
            const settlementPeriod = `${orderForSettlement.createdAt.getFullYear()}-${String(
              orderForSettlement.createdAt.getMonth() + 1
            ).padStart(2, "0")}`;

            const settlement = await tx.settlements.findFirst({
              where: {
                brandId: orderForSettlement.brandId,
                settlementPeriod,
              },
            });

            if (settlement) {
              await tx.settlements.update({
                where: { id: settlement.id },
                data: {
                  redeemedAmount: { increment: actualAmountRedeemed },
                  outstandingAmount: { decrement: actualAmountRedeemed },
                  ...(isFullyRedeemed && { totalRedeemed: { increment: 1 } }),
                  ...(isFullyRedeemed && { outstanding: { decrement: 1 } }),
                  updatedAt: new Date(),
                },
              });
            }
          }

          return redemption;
        });

        if (result) {
          redemptions.push(result);
          console.log(`✅ Successfully processed transaction ${transactionId}`);
        } else {
          skippedCount++;
        }

      } catch (dbError) {
        console.error(`❌ Error processing gift card ${numericGiftCardId}:`, dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: redemptions.length > 0 
        ? `Processed ${redemptions.length} new redemption(s), skipped ${skippedCount} duplicate(s)`
        : `All ${skippedCount} transaction(s) already processed (duplicates prevented)`,
      redemptionsCount: redemptions.length,
      skippedCount: skippedCount,
      data: redemptions.map((r) => ({
        id: r.id,
        amountRedeemed: r.amountRedeemed,
        balanceAfter: r.balanceAfter,
        transactionId: r.transactionId,
      })),
    });
  } catch (error) {
    console.error("❌ Error handling gift card webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}