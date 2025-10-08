import { NextResponse } from "next/server";
import prisma from "../../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    // Step 1: Get store domain from headers
    const shopDomain = req.headers.get("x-shopify-shop-domain");
    if (!shopDomain) {
      console.error("❌ Missing shop domain in headers");
      return NextResponse.json(
        { success: false, error: "Missing shop domain" },
        { status: 400 }
      );
    }

    console.log("📦 Order webhook received from store:", shopDomain);

    // Step 2: Find Shopify session
    const session = await prisma.shopifySession.findUnique({
      where: { shop: shopDomain },
    });

    if (!session) {
      console.error(`❌ No session found for store: ${shopDomain}`);
      return NextResponse.json(
        { success: false, error: "No session for this store" },
        { status: 400 }
      );
    }

    console.log("✅ Session found for store:", shopDomain);

    const accessToken = session.accessToken;
    const orderId = body.id;

    if (!orderId) {
      console.error("❌ Missing order ID in webhook body");
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    // Step 3: Fetch order transactions from Shopify
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

    // Step 4: Filter for successful gift card redemptions
    const giftCardTxns = transactions.filter(
      (txn) => txn.gateway === "gift_card" && txn.status === "success"
    );

    if (giftCardTxns.length === 0) {
      console.log("💳 No successful gift card transactions for this order.");
      return NextResponse.json({
        success: true,
        message: "No gift card usage found.",
      });
    }

    const redemptions = [];

    // Step 5: Process each gift card redemption
    for (const txn of giftCardTxns) {
      const numericGiftCardId = txn.receipt?.gift_card_id;
      const last4 = txn.receipt?.gift_card_last_characters;
      const amountRedeemed = Math.abs(parseFloat(txn.amount)) * 100; // convert to cents

      if (!numericGiftCardId) {
        console.warn("⚠️ No gift card ID found in transaction receipt");
        continue;
      }

      try {
        const giftCardGid = `gid://shopify/GiftCard/${numericGiftCardId}`;

        // Find gift card in DB
        const giftCard = await prisma.giftCard.findUnique({
          where: { shopifyId: giftCardGid },
        });
        if (!giftCard) {
          console.warn(`⚠️ GiftCard not found for ID: ${giftCardGid}`);
          continue;
        }

        // Find matching voucher
        const voucherCode = await prisma.voucherCode.findUnique({
          where: { shopifyGiftCardId: giftCard.id },
        });
        if (!voucherCode) {
          console.warn(`⚠️ VoucherCode not found for GiftCard ID: ${giftCard.id}`);
          continue;
        }

        const currentBalance = voucherCode.remainingValue;
        const actualAmountRedeemed = Math.min(amountRedeemed, currentBalance);
        const balanceAfter = Math.max(0, currentBalance - actualAmountRedeemed);
        const isFullyRedeemed = balanceAfter === 0;

        // Step 5a: Record redemption
        const redemption = await prisma.voucherRedemption.create({
          data: {
            voucherCodeId: voucherCode.id,
            amountRedeemed: actualAmountRedeemed,
            balanceAfter,
            redeemedAt: new Date(txn.processed_at),
            transactionId: txn.id.toString(),
            storeUrl: shopDomain,
          },
        });

        // Step 5b: Update voucher code balance
        await prisma.voucherCode.update({
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

        // Step 5c: Update order redemption status
        await prisma.order.update({
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

        // Step 5d: Update settlement (moved inside the loop)
        try {
          const orderForSettlement = await prisma.order.findUnique({
            where: { id: voucherCode.orderId },
            select: {
              brandId: true,
              createdAt: true,
              totalAmount: true,
              quantity: true,
            },
          });

          if (orderForSettlement) {
            const settlementPeriod = `${orderForSettlement.createdAt.getFullYear()}-${String(
              orderForSettlement.createdAt.getMonth() + 1
            ).padStart(2, "0")}`;

            const settlement = await prisma.settlements.findFirst({
              where: {
                brandId: orderForSettlement.brandId,
                settlementPeriod,
              },
            });

            if (settlement) {
              await prisma.settlements.update({
                where: { id: settlement.id },
                data: {
                  redeemedAmount: { increment: actualAmountRedeemed },
                  ...(isFullyRedeemed && {
                    totalRedeemed: { increment: 1 },
                  }),
                  outstandingAmount: { decrement: actualAmountRedeemed },
                  ...(isFullyRedeemed && {
                    outstanding: { decrement: 1 },
                  }),
                  updatedAt: new Date(),
                },
              });

              console.log(
                `✅ Settlement updated for brand ${orderForSettlement.brandId} | Redeemed: ${actualAmountRedeemed} | Fully Redeemed: ${isFullyRedeemed}`
              );
            } else {
              console.warn(
                `⚠️ No settlement found for brand ${orderForSettlement.brandId} in period ${settlementPeriod}`
              );
            }
          }
        } catch (settlementError) {
          console.error("⚠️ Failed to update settlement:", settlementError);
        }

        redemptions.push(redemption);
        console.log(`✅ Redemption recorded for voucher: ${voucherCode.code}`);
      } catch (dbError) {
        console.error(`❌ Error processing gift card ${numericGiftCardId}:`, dbError);
      }
    }

    // Final webhook response
    return NextResponse.json({
      success: true,
      message: "Gift card redemptions processed successfully",
      redemptionsCount: redemptions.length,
      data: redemptions.map((r) => ({
        id: r.id,
        amountRedeemed: r.amountRedeemed,
        balanceAfter: r.balanceAfter,
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
