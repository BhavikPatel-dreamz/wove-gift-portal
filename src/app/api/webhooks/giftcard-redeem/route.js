import { NextResponse } from "next/server";
import prisma from "../../../../lib/db";

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

    for (const txn of giftCardTxns) {
      const numericGiftCardId = txn.receipt?.gift_card_id;
      //const last4 = txn.receipt?.gift_card_last_characters;
      const amountRedeemed = Number(parseFloat(txn.amount));


      if (!numericGiftCardId) continue;

      try {
        const giftCardGid = `gid://shopify/GiftCard/${numericGiftCardId}`;

        const giftCard = await prisma.giftCard.findUnique({
          where: { shopifyId: giftCardGid },
        });
        if (!giftCard) continue;

        const voucherCode = await prisma.voucherCode.findUnique({
          where: { shopifyGiftCardId: giftCard.id },
        });
        if (!voucherCode) continue;

        const currentBalance = voucherCode.remainingValue;
        const actualAmountRedeemed = Math.min(amountRedeemed, currentBalance);
        const balanceAfter = Math.max(0, currentBalance - actualAmountRedeemed);
        const isFullyRedeemed = balanceAfter === 0;

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

        try {
          const orderForSettlement = await prisma.order.findUnique({
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
                  outstandingAmount: { decrement: actualAmountRedeemed },
                  ...(isFullyRedeemed && { totalRedeemed: { increment: 1 } }),
                  ...(isFullyRedeemed && { outstanding: { decrement: 1 } }),
                  updatedAt: new Date(),
                },
              });
            }
          }
        } catch (settlementError) {
          console.error("⚠️ Settlement update failed:", settlementError);
        }

        redemptions.push(redemption);
      } catch (dbError) {
        console.error(`❌ Error processing gift card ${numericGiftCardId}:`, dbError);
      }
    }

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
