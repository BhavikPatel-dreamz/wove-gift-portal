// Runner script — execute from the command line:
//   node run-sync.js

import { syncShopifyDataMonthly } from "./giftcard.js";

console.log("🚀 Starting Shopify gift card sync...");

syncShopifyDataMonthly()
  .then((result) => {
    if (result?.success) {
      const s = result.summary;
      console.log("✅ Sync complete");
      console.log(`   Duration              : ${s.duration}s`);
      console.log(`   Gift cards checked    : ${s.totalGiftCards}`);
      console.log(`   Transactions processed: ${s.totalTransactionsProcessed}`);
      console.log(`   New redemptions       : ${s.totalNewRedemptions}`);
      console.log(`   Total value synced    : ${s.totalFixedValue}`);
    } else {
      console.error("❌ Sync failed:", result?.error);
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });