
// This script is designed to be run from the command line.
// It imports and executes the syncShopifyDataMonthly function.

import { syncShopifyDataMonthly } from "./giftcard.js";


console.log('Starting Shopify data sync...');

syncShopifyDataMonthly()
  .then(() => {
    console.log('Shopify data sync completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to sync Shopify data:', error);
    process.exit(1);
  });
