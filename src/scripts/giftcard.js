"use server";

import fetch from "node-fetch";
import { prisma } from "../lib/db.js";

const SHOPIFY_API_VERSION = "2025-10";

// ─── Concurrency helpers ────────────────────────────────────────────────────

async function pMap(items, fn, limit = 5) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) await Promise.race(executing);
  }
  return Promise.allSettled(results);
}

// ───────────────────────────────────────────────────────────────────────────

export async function syncShopifyDataMonthly() {
  const startTime = Date.now();
  let totalGiftCards = 0;
  let totalTransactionsProcessed = 0;
  let totalNewRedemptions = 0;
  let totalSkipped = 0;
  let totalFixedValue = 0;

  try {
    const allShops = await prisma.appInstallation.findMany();
    if (!allShops.length) return;

    await pMap(
      allShops,
      async (shop) => {
        const shopStats = await processShop(shop);
        totalGiftCards        += shopStats.totalGiftCards;
        totalTransactionsProcessed += shopStats.totalTransactionsProcessed;
        totalNewRedemptions   += shopStats.totalNewRedemptions;
        totalSkipped          += shopStats.totalSkipped;
        totalFixedValue       += shopStats.totalFixedValue;
      },
      3
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    return {
      success: true,
      summary: {
        duration,
        totalGiftCards,
        totalTransactionsProcessed,
        totalNewRedemptions,
        totalSkipped,
        totalFixedValue,
      },
    };
  } catch (error) {
    console.error("❌ Reconciliation failed:", error);
    return { success: false, error: error.message };
  }
}

// ─── Per-shop processing ────────────────────────────────────────────────────

async function processShop(shop) {
  const { shop: shopName, accessToken: token } = shop;

  const stats = {
    totalGiftCards: 0,
    totalTransactionsProcessed: 0,
    totalNewRedemptions: 0,
    totalSkipped: 0,
    totalFixedValue: 0,
  };

  const cards = await fetchGiftCards(shopName, token);
  if (!cards.length) return stats;

  // Batch lookup 1 — all local gift cards in one query
  const shopifyIds = cards.map((c) => c.id);
  const localGiftCards = await prisma.giftCard.findMany({
    where: { shopifyId: { in: shopifyIds } },
  });
  const localGiftCardMap = new Map(localGiftCards.map((gc) => [gc.shopifyId, gc]));

  // Batch lookup 2 — all voucher codes + ALL existing redemption fields
  const localGiftCardIds = localGiftCards.map((gc) => gc.id);
  const voucherCodes = await prisma.voucherCode.findMany({
    where: { shopifyGiftCardId: { in: localGiftCardIds } },
    include: {
      redemptions: {
        select: {
          transactionId: true,
          amountRedeemed: true,
          redeemedAt: true,
          balanceAfter: true,
        },
      },
    },
  });
  const voucherCodeMap = new Map(voucherCodes.map((vc) => [vc.shopifyGiftCardId, vc]));

  const settlementUpdates = new Map();

  await pMap(
    cards,
    async (card) => {
      const cardStats = await processCard(
        card,
        shopName,
        token,
        localGiftCardMap,
        voucherCodeMap,
        settlementUpdates
      );
      stats.totalGiftCards          += cardStats.counted ? 1 : 0;
      stats.totalTransactionsProcessed += cardStats.transactionsProcessed;
      stats.totalNewRedemptions     += cardStats.newRedemptions;
      stats.totalSkipped            += cardStats.skipped;
      stats.totalFixedValue         += cardStats.newValue;
    },
    5
  );

  await flushSettlementUpdates(settlementUpdates);
  return stats;
}

// ─── Per-card processing ────────────────────────────────────────────────────

async function processCard(
  card,
  shopName,
  token,
  localGiftCardMap,
  voucherCodeMap,
  settlementUpdates
) {
  const result = {
    counted: false,
    transactionsProcessed: 0,
    newRedemptions: 0,
    skipped: 0,
    newValue: 0,
  };

  const localGiftCard = localGiftCardMap.get(card.id);
  if (!localGiftCard) return result;

  const voucherCode = voucherCodeMap.get(localGiftCard.id);
  if (!voucherCode) return result;

  result.counted = true;

  // ─── BUILD DEDUP FINGERPRINTS FROM EXISTING DB RECORDS ─────────────────
  //
  // Two independent checks so EITHER match means "already exists":
  //
  //   CHECK A — transactionId match (Shopify GID, most reliable)
  //   CHECK B — composite match: voucherCodeId + amount + balanceAfter + date
  //             (catches records saved with old/different transactionId formats)

  const knownByTransactionId = new Set();
  const knownByComposite     = new Set();  // "amount|balanceAfter|dateISO"

  for (const r of voucherCode.redemptions) {
    if (r.transactionId) {
      knownByTransactionId.add(r.transactionId);
      // Also add numeric suffix so "gid://shopify/.../123" matches "123"
      knownByTransactionId.add(r.transactionId.split("/").pop());
    }

    // Composite key regardless of whether transactionId exists
    const dateKey = r.redeemedAt instanceof Date
      ? r.redeemedAt.toISOString().split("T")[0]
      : new Date(r.redeemedAt).toISOString().split("T")[0];

    knownByComposite.add(`${r.amountRedeemed}|${r.balanceAfter}|${dateKey}`);
  }

  // ─── FETCH SHOPIFY TRANSACTIONS ─────────────────────────────────────────
  const transactions = await fetchGiftCardTransactions(shopName, token, card.id);
  result.transactionsProcessed = transactions.length;

  // ─── FILTER: KEEP ONLY GENUINELY NEW REDEMPTIONS ───────────────────────
  const newRedemptionTxns = [];

  for (const tx of transactions) {
    const amount = parseFloat(tx.amount?.amount || 0);

    // Skip credits / top-ups (only process debits = negative amounts)
    if (amount >= 0) continue;

    // Skip if transactionId is missing (can't safely dedup without it)
    if (!tx.id) {
      console.warn(`⚠️ Skipping transaction with no ID on card ${card.id}`);
      result.skipped++;
      continue;
    }

    const redemptionAmount = Math.abs(Math.round(amount));
    const balanceAfter     = Math.round(parseFloat(tx.balanceAfter?.amount || 0));
    const txDate           = new Date(tx.processedAt).toISOString().split("T")[0];
    const numericId        = tx.id.split("/").pop();
    const compositeKey     = `${redemptionAmount}|${balanceAfter}|${txDate}`;

    // ── CHECK A: transactionId already in DB? ──
    if (knownByTransactionId.has(tx.id) || knownByTransactionId.has(numericId)) {
      console.log(`⏭ Skip (transactionId match): ${numericId}`);
      result.skipped++;
      continue;
    }

    // ── CHECK B: same amount + balance + date already in DB? ──
    if (knownByComposite.has(compositeKey)) {
      console.log(`⏭ Skip (composite match): amount=${redemptionAmount} balance=${balanceAfter} date=${txDate}`);
      result.skipped++;
      continue;
    }

    // Passed both checks — this is a new redemption
    newRedemptionTxns.push(tx);

    // Add to in-memory sets immediately so parallel processing
    // within the same batch doesn't insert the same record twice
    knownByTransactionId.add(tx.id);
    knownByTransactionId.add(numericId);
    knownByComposite.add(compositeKey);
  }

  // ─── INSERT ─────────────────────────────────────────────────────────────
  if (newRedemptionTxns.length > 0) {
    const created = await bulkInsertRedemptions(
      voucherCode.id,
      newRedemptionTxns,
      shopName
    );
    result.newRedemptions = created.count;
    result.newValue       = created.totalValue;
  }

  // ─── UPDATE VOUCHER BALANCE ─────────────────────────────────────────────
  const currentBalance = Math.round(parseFloat(card.balance?.amount || 0));
  await prisma.voucherCode.update({
    where: { id: voucherCode.id },
    data: {
      remainingValue: currentBalance,
      isRedeemed:     currentBalance === 0,
      redeemedAt:     currentBalance === 0 ? new Date() : voucherCode.redeemedAt,
      shopifySyncedAt: new Date(),
    },
  });

  // ─── QUEUE SETTLEMENT UPDATE ────────────────────────────────────────────
  if (result.newRedemptions > 0) {
    await queueSettlementUpdate(
      voucherCode,
      currentBalance,
      result.newValue,
      settlementUpdates
    );
  }

  return result;
}

// ─── Bulk insert with DB-level safety net ──────────────────────────────────

async function bulkInsertRedemptions(voucherCodeId, transactions, shopName) {
  const data = [];

  for (const tx of transactions) {
    const amount           = parseFloat(tx.amount?.amount || 0);
    const redemptionAmount = Math.abs(Math.round(amount));
    if (redemptionAmount === 0 || !tx.id) continue;

    data.push({
      voucherCodeId,
      amountRedeemed: redemptionAmount,
      balanceAfter:   Math.round(parseFloat(tx.balanceAfter?.amount || 0)),
      redeemedAt:     new Date(tx.processedAt),
      transactionId:  tx.id,   // Full Shopify GID
      storeUrl:       shopName,
    });
  }

  if (!data.length) return { count: 0, totalValue: 0 };

  // DB-level safety net — even if in-memory checks somehow miss a duplicate,
  // skipDuplicates prevents a DB error (relies on @@unique([transactionId]))
  const result = await prisma.voucherRedemption.createMany({
    data,
    skipDuplicates: true,
  });

  const totalValue = data.reduce((sum, r) => sum + r.amountRedeemed, 0);
  return { count: result.count, totalValue };
}

// ─── Settlement batching ────────────────────────────────────────────────────

async function queueSettlementUpdate(voucherCode, currentBalance, newValue, settlementUpdates) {
  const order = await prisma.order.findUnique({
    where: { id: voucherCode.orderId },
    select: { brandId: true, createdAt: true },
  });
  if (!order) return;

  const settlementPeriod = `${order.createdAt.getFullYear()}-${String(
    order.createdAt.getMonth() + 1
  ).padStart(2, "0")}`;

  const settlement = await prisma.settlements.findFirst({
    where: { brandId: order.brandId, settlementPeriod },
    select: { id: true },
  });
  if (!settlement) return;

  const isFullyRedeemed    = currentBalance === 0;
  const wasNotFullyRedeemed = voucherCode.remainingValue > 0;

  const existing = settlementUpdates.get(settlement.id) ?? {
    redeemedAmount:   0,
    outstandingAmount: 0,
    totalRedeemed:    0,
    outstanding:      0,
  };

  existing.redeemedAmount    += newValue;
  existing.outstandingAmount += newValue;
  if (isFullyRedeemed && wasNotFullyRedeemed) {
    existing.totalRedeemed += 1;
    existing.outstanding   += 1;
  }

  settlementUpdates.set(settlement.id, existing);
}

async function flushSettlementUpdates(settlementUpdates) {
  if (!settlementUpdates.size) return;

  await Promise.all(
    Array.from(settlementUpdates.entries()).map(([id, delta]) =>
      prisma.settlements.update({
        where: { id },
        data: {
          redeemedAmount:    { increment: delta.redeemedAmount },
          outstandingAmount: { decrement: delta.outstandingAmount },
          ...(delta.totalRedeemed > 0 && {
            totalRedeemed: { increment: delta.totalRedeemed },
            outstanding:   { decrement: delta.outstanding },
          }),
          updatedAt: new Date(),
        },
      })
    )
  );
}

// ─── Shopify API helpers ────────────────────────────────────────────────────

async function shopifyGraphQL(shop, token, query, variables = {}) {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function fetchGiftCards(shop, token) {
  const allCards = [];
  let after = null;
  let hasNextPage = true;

  const today     = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);
  const startDate = lastMonth.toISOString().split("T")[0];
  const endDate   = today.toISOString().split("T")[0];

  const query = `
    query getGiftCards($after: String) {
      giftCards(first: 250, after: $after, query: "updated_at:>=${startDate} updated_at:<=${endDate}") {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            maskedCode
            enabled
            createdAt
            updatedAt
            expiresOn
            note
            initialValue { amount }
            balance { amount }
          }
        }
      }
    }`;

  while (hasNextPage) {
    const data = await shopifyGraphQL(shop, token, query, { after });
    const edges = data?.giftCards?.edges || [];
    allCards.push(...edges.map((e) => e.node));
    hasNextPage = data?.giftCards?.pageInfo?.hasNextPage;
    after       = data?.giftCards?.pageInfo?.endCursor;
  }

  return allCards;
}

async function fetchGiftCardTransactions(shop, token, giftCardId) {
  const allTransactions = [];
  let after        = null;
  let hasNextPage  = true;
  let finalBalance = 0;
  let isFirstPage  = true;

  const query = `
    query GiftCardTransactionList($id: ID!, $firstTransactions: Int, $after: String) {
      giftCard(id: $id) {
        balance { amount }
        transactions(first: $firstTransactions, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            amount { amount currencyCode }
            processedAt
            note
          }
        }
      }
    }`;

  while (hasNextPage) {
    const data = await shopifyGraphQL(shop, token, query, {
      id: giftCardId,
      firstTransactions: 250,
      after,
    });

    if (isFirstPage) {
      finalBalance = parseFloat(data?.giftCard?.balance?.amount || 0);
      isFirstPage  = false;
    }

    const nodes = data?.giftCard?.transactions?.nodes || [];
    allTransactions.push(...nodes);

    hasNextPage = data?.giftCard?.transactions?.pageInfo?.hasNextPage;
    after       = data?.giftCard?.transactions?.pageInfo?.endCursor;
  }

  // ── Correct balanceAfter across ALL pages at once ──────────────────────
  // Shopify returns newest-first; reverse to get chronological order,
  // replay from finalBalance backwards to assign balanceAfter per step.
  const chronological  = [...allTransactions].reverse();
  let runningBalance   = finalBalance;

  for (let i = chronological.length - 1; i >= 0; i--) {
    chronological[i].balanceAfter = { amount: String(runningBalance) };
    runningBalance -= parseFloat(chronological[i].amount?.amount || 0);
  }

  return chronological.reverse(); // back to newest-first
}