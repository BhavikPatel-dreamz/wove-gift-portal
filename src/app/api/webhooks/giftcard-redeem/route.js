import { NextResponse } from "next/server";
import prisma from "../../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    // Step 1: Get the store domain from webhook headers
    const shopDomain = req.headers.get("x-shopify-shop-domain");
    if (!shopDomain) {
      console.error("❌ Missing shop domain in headers");
      return NextResponse.json(
        { success: false, error: "Missing shop domain" },
        { status: 400 }
      );
    }

    console.log("📦 Order webhook received from store:", shopDomain);

    // Step 2: Query Prisma to find the session for this store
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

    // Step 3: Fetch transactions for this order
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

    // Step 4: Filter gift card transactions
    const giftCardTxns = transactions.filter(
      (txn) => txn.gateway === "gift_card" && txn.status === "success"
    );

    if (giftCardTxns.length === 0) {
      console.log("💳 No successful gift card transactions found for this order.");
      return NextResponse.json({ success: true, message: "No gift card usage" });
    }

    console.log("🎁 Gift card redemption details:");

    const redemptions = [];

    for (const txn of giftCardTxns) {
      const numericGiftCardId = txn.receipt?.gift_card_id;
      const last4 = txn.receipt?.gift_card_last_characters;
      const amountRedeemed = Math.abs(parseFloat(txn.amount)) * 100; // Convert to cents

      console.log({
        orderId,
        amount: txn.amount,
        redeemedAt: txn.processed_at,
        giftCardId: numericGiftCardId,
        last4,
      });

      if (!numericGiftCardId) {
        console.warn("⚠️ No gift card ID found in transaction receipt");
        continue;
      }

      try {
        // Convert numeric ID to full Shopify GID string
        const giftCardGid = `gid://shopify/GiftCard/${numericGiftCardId}`;

        // Find the GiftCard record by Shopify GID
        const giftCard = await prisma.giftCard.findUnique({
          where: { shopifyId: giftCardGid },
        });

        if (!giftCard) {
          console.warn(`⚠️ GiftCard not found for Shopify ID: ${giftCardGid}`);
          continue;
        }

        // Find the VoucherCode by our database GiftCard ID
        const voucherCode = await prisma.voucherCode.findUnique({
          where: { shopifyGiftCardId: giftCard.id },
        });

        if (!voucherCode) {
          console.warn(`⚠️ VoucherCode not found for GiftCard ID: ${giftCard.id}`);
          continue;
        }

        // Calculate balance after redemption (ensure it never goes negative)
        const currentBalance = voucherCode.remainingValue;
        const actualAmountRedeemed = Math.min(amountRedeemed, currentBalance);
        const balanceAfter = Math.max(0, currentBalance - actualAmountRedeemed);

        // Create redemption record
        const redemption = await prisma.voucherRedemption.create({
          data: {
            voucherCodeId: voucherCode.id,
            amountRedeemed: actualAmountRedeemed,
            balanceAfter: balanceAfter,
            redeemedAt: new Date(txn.processed_at),
            transactionId: txn.id.toString(),
            storeUrl: shopDomain,
          },
        });

        // Update VoucherCode remaining value and redemption status
        await prisma.voucherCode.update({
          where: { id: voucherCode.id },
          data: {
            remainingValue: balanceAfter,
            isRedeemed: balanceAfter === 0,
            redeemedAt: balanceAfter === 0 ? new Date(txn.processed_at) : voucherCode.redeemedAt,
            shopifySyncedAt: new Date(),
          },
        });

        // Update Order redemption status
        await prisma.order.update({
          where: { id: voucherCode.orderId },
          data: {
            redemptionStatus: balanceAfter === 0 ? "Redeemed" : "PartiallyRedeemed",
          },
        });

        redemptions.push(redemption);
        console.log(`✅ Redemption recorded for voucher: ${voucherCode.code}`);
      } catch (dbError) {
        console.error(`❌ Error processing gift card ${numericGiftCardId}:`, dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Gift card redemptions processed",
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
