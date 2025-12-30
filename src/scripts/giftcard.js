"use server";

import fetch from "node-fetch";
import { prisma } from "../lib/db.js";

const SHOPIFY_API_VERSION = "2025-10";

/**
 * 🧭 Monthly cron job:
 * Reconciles Shopify gift cards with local DB.
 * Fetches individual transactions and stores each redemption separately.
 */
export async function syncShopifyDataMonthly() {

  const startTime = Date.now();
  let totalGiftCards = 0;
  let totalTransactionsProcessed = 0;
  let totalNewRedemptions = 0;
  let totalFixedValue = 0;

  try {
    const allShops = await prisma.appInstallation.findMany();
    if (!allShops.length) {
      return;
    }

    for (const shop of allShops) {
      const shopName = shop.shop;
      const token = shop.accessToken;
     

      const cards = await fetchGiftCards(shopName, token);
    

      for (const card of cards) {
        const shopifyGiftCardId = card.id;
        const balance = parseFloat(card.balance?.amount || 0);

        // Step 1️⃣ — Match local GiftCard
        const localGiftCard = await prisma.giftCard.findUnique({
          where: { shopifyId: shopifyGiftCardId },
        });
        if (!localGiftCard) {
      
          continue;
        }

        // Step 2️⃣ — Match linked VoucherCode
        const voucherCode = await prisma.voucherCode.findUnique({
          where: { shopifyGiftCardId: localGiftCard.id },
          include: { redemptions: true },
        });
        if (!voucherCode) {
      
          continue;
        }

        totalGiftCards++;

        // Step 3️⃣ — Fetch individual transactions from Shopify
   
        const transactions = await fetchGiftCardTransactions(shopName, token, shopifyGiftCardId);
        

        totalTransactionsProcessed += transactions.length;

        // Track new redemptions for this specific voucher code
        let newRedemptionsForThisVoucher = 0;
        let newRedemptionsValueForThisVoucher = 0;

        // Step 4️⃣ — Process each transaction (only redemptions/debits)
        for (const transaction of transactions) {
          const amount = parseFloat(transaction.amount?.amount || 0);
          
          // Skip if it's not a redemption (only process negative amounts = debits)
          if (amount >= 0) continue;

          const redemptionAmount = Math.abs(Math.round(amount));
          
          // Skip zero-amount transactions
          if (redemptionAmount === 0) {
            
            continue;
          }

          const transactionDate = new Date(transaction.processedAt);
          const transactionDay = transactionDate.toISOString().split("T")[0];

          // Step 5️⃣ — Calculate balance after this transaction
          const balanceAfter = Math.round(parseFloat(transaction.balanceAfter?.amount || 0));

          // Extract transaction number from GID (e.g., "210171756707" from "gid://shopify/GiftCardDebitTransaction/210171756707")
          const transactionNumber = transaction.id.split('/').pop();

          // Step 6️⃣ — Check if this exact transaction already exists
          // Check by: 1) Transaction ID match, OR 2) Same amount + date + balance (to catch webhook duplicates)
          const startOfDay = new Date(transactionDay + 'T00:00:00Z');
          const endOfDay = new Date(transactionDay + 'T23:59:59Z');
          
          const exists = await prisma.voucherRedemption.findFirst({
            where: {
              voucherCodeId: voucherCode.id,
              OR: [
                // Check by transaction ID (handle both formats)
                { transactionId: transaction.id },
                { transactionId: transactionNumber },
                { 
                  transactionId: {
                    endsWith: transactionNumber
                  }
                },
                // Check by amount + date + balance (catches webhook duplicates with different IDs)
                {
                  AND: [
                    { amountRedeemed: redemptionAmount },
                    { balanceAfter: balanceAfter },
                    { 
                      redeemedAt: {
                        gte: startOfDay,
                        lte: endOfDay
                      }
                    }
                  ]
                }
              ]
            },
          });

          if (exists) {
            
            continue;
          }


          // Step 7️⃣ — Store the individual redemption (use full GID for consistency)
          await prisma.$transaction(async (tx) => {
            await tx.voucherRedemption.create({
              data: {
                voucherCodeId: voucherCode.id,
                amountRedeemed: redemptionAmount,
                balanceAfter: balanceAfter,
                redeemedAt: transactionDate,
                transactionId: transaction.id, // Store full GID format
                storeUrl: shopName,
              },
            });
          });

          newRedemptionsForThisVoucher++;
          newRedemptionsValueForThisVoucher += redemptionAmount;
          totalNewRedemptions++;
          totalFixedValue += redemptionAmount;
    
        }

        // Step 8️⃣ — Update VoucherCode with latest balance
        const currentBalance = Math.round(balance);

        await prisma.voucherCode.update({
          where: { id: voucherCode.id },
          data: {
            remainingValue: currentBalance,
            isRedeemed: currentBalance === 0,
            redeemedAt: currentBalance === 0 ? new Date() : voucherCode.redeemedAt,
            shopifySyncedAt: new Date(),
          },
        });

        // Step 9️⃣ — Update settlement ONLY if new redemptions were found
        if (newRedemptionsForThisVoucher > 0) {
          const order = await prisma.order.findUnique({
            where: { id: voucherCode.orderId },
            select: { brandId: true, createdAt: true },
          });

          if (order) {
            const settlementPeriod = `${order.createdAt.getFullYear()}-${String(
              order.createdAt.getMonth() + 1
            ).padStart(2, "0")}`;

            const settlement = await prisma.settlements.findFirst({
              where: {
                brandId: order.brandId,
                settlementPeriod,
              },
            });

            if (settlement) {
              // Check if voucher is now fully redeemed
              const isFullyRedeemed = currentBalance === 0;
              const wasNotFullyRedeemed = voucherCode.remainingValue > 0;
              
              await prisma.settlements.update({
                where: { id: settlement.id },
                data: {
                  redeemedAmount: { increment: newRedemptionsValueForThisVoucher },
                  outstandingAmount: { decrement: newRedemptionsValueForThisVoucher },
                  // Only increment totalRedeemed and decrement outstanding if voucher became fully redeemed in this sync
                  ...(isFullyRedeemed && wasNotFullyRedeemed && { 
                    totalRedeemed: { increment: 1 },
                    outstanding: { decrement: 1 }
                  }),
                  updatedAt: new Date(),
                },
              });
              
       
            }
          }
        }


      }


    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);


    return {
      success: true,
      summary: {
        duration,
        totalGiftCards,
        totalTransactionsProcessed,
        totalNewRedemptions,
        totalFixedValue,
      },
    };
  } catch (error) {
    console.error("❌ Reconciliation failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🔎 Fetches all Shopify gift cards updated within last 30 days
 */
async function fetchGiftCards(shop, token) {
  const allCards = [];
  let after = null;
  let hasNextPage = true;

  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);

  const startDate = lastMonth.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];



  while (hasNextPage) {
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

    const res = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { after } }),
      }
    );

    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));

    const edges = json?.data?.giftCards?.edges || [];
    allCards.push(...edges.map((e) => e.node));

    hasNextPage = json?.data?.giftCards?.pageInfo?.hasNextPage;
    after = json?.data?.giftCards?.pageInfo?.endCursor;
  }

  return allCards;
}

/**
 * 💳 Fetches all transactions for a specific gift card
 * Uses the GraphQL query from your curl example
 */
async function fetchGiftCardTransactions(shop, token, giftCardId) {
  const allTransactions = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query GiftCardTransactionList($id: ID!, $firstTransactions: Int, $after: String) {
        giftCard(id: $id) {
          id
          balance { 
            amount 
            currencyCode 
          }
          transactions(first: $firstTransactions, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              amount { 
                amount 
                currencyCode 
              }
              processedAt
              note
            }
          }
        }
      }`;

    const res = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            id: giftCardId,
            firstTransactions: 250,
            after: after,
          },
        }),
      }
    );

    const json = await res.json();
    if (json.errors) {
      console.error(`❌ Error fetching transactions for ${giftCardId}:`, json.errors);
      throw new Error(JSON.stringify(json.errors));
    }

    const transactions = json?.data?.giftCard?.transactions?.nodes || [];
    
    // Calculate balance after each transaction
    // Note: Shopify doesn't provide balanceAfter in transaction, so we calculate it
    let currentBalance = parseFloat(json?.data?.giftCard?.balance?.amount || 0);
    
    // Process transactions in reverse to calculate historical balances
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transaction = transactions[i];
      transaction.balanceAfter = { amount: currentBalance };
      currentBalance -= parseFloat(transaction.amount?.amount || 0);
    }

    allTransactions.push(...transactions);

    hasNextPage = json?.data?.giftCard?.transactions?.pageInfo?.hasNextPage;
    after = json?.data?.giftCard?.transactions?.pageInfo?.endCursor;
  }

  return allTransactions;
}