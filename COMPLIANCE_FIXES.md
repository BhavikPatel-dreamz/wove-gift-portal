# Shopify App Store Compliance Guidelines - Wove Gift

## 1. Off-Platform Billing Disclosure ⚠️ CRITICAL

Your app uses **Stripe and PayPal for billing**, NOT the Shopify Billing API. According to requirement 1.2.1, this requires explicit disclosure in your App Store listing.

### What to add to your App Store Listing:

**In the Pricing section**, you MUST clearly state:

```
💳 Billing Information

Wove Gift charges merchants through Stripe and PayPal, NOT through Shopify Billing. 
Charges do NOT appear on the Shopify invoice.

- All charges are processed by Stripe and/or PayPal
- Merchants are billed directly according to their subscription plan
- Billing is managed outside the Shopify admin
```

### In the app description or FAQ, add:

```
❓ Where will I be billed?

Wove Gift processes billing through Stripe and PayPal, not Shopify Billing. 
You will see charges from:
- Stripe (stripe.com) 
- PayPal (paypal.com)

Charges will NOT appear on your Shopify invoice.
```

---

## 2. API Migration Completion Status ✅

The following changes have been made to ensure GraphQL compliance:

### 2.1 Gift Card Disable Operation
- **Previous:** REST API (`POST /admin/api/2024-10/gift_cards/{id}/disable.json`)
- **Current:** GraphQL mutation `giftCardDisable`
- **File:** `src/lib/action/supportAction.js` (line ~670)

### 2.2 Gift Cards List Operation  
- **Previous:** REST API (`GET /admin/api/2023-10/gift_cards.json`)
- **Current:** GraphQL query `giftCards`
- **File:** `src/app/api/shopify/gift-cards/route.js` (line ~62)

### 2.3 Order Transactions Fetch
- **Previous:** REST API (`GET /admin/api/2025-10/orders/{orderId}/transactions.json`)
- **Current:** GraphQL query with transactions field
- **File:** `src/app/api/webhooks/giftcard-redeem/route.js` (line ~31)

---

## 3. Embedded App Change ✅

- **Previous:** `embedded = true` (but no App Bridge implementation)
- **Current:** `embedded = false` (non-embedded app)
- **File:** `shopify.app.toml` (line 5)
- **Reason:** Your app uses custom OAuth and session management. Non-embedded apps don't require App Bridge.

---

## 4. Remaining Compliance Notes

### 4.1 Session Management ✅
Your custom OAuth implementation with database-backed sessions is compliant. The app properly:
- Stores access tokens securely in the database
- Uses HMAC-SHA256 for webhook verification
- Handles session initialization on install

### 4.2 Billing API Disclaimer
If in the future you want to charge merchants through Shopify Billing (recommended for better UX), you would need to:
1. Add Shopify Billing API calls to `src/app/api/billing/` directory
2. Update `shopify.app.toml` with pricing plans
3. Remove Stripe/PayPal from the app (or keep as separate service)

### 4.3 API Version Consistency
Your GraphQL calls now use API v2024-10. For best practices:
- Update other GraphQL calls to use v2024-10 or latest stable
- Reference: `src/lib/action/shopify.js` currently uses v2023-10

---

## 5. Pre-Submission Checklist

Before submitting to Shopify App Store:

- [ ] Verify off-platform billing disclosure is in your App Store listing
- [ ] Test gift card disable functionality with GraphQL changes
- [ ] Test gift card fetch with new GraphQL query
- [ ] Test webhook with new transaction GraphQL query
- [ ] Confirm non-embedded app works in dashboard
- [ ] Review "Session Management" section of SETUP.md
- [ ] Run `npm run build` to ensure no TypeScript errors
- [ ] Test OAuth flow end-to-end

---

## 6. Resources

- [Shopify Billing API Docs](https://shopify.dev/docs/apps/billing)
- [GraphQL Admin API Migration Guide](https://shopify.dev/docs/apps/build/graphql/migrate)
- [App Store Requirements](https://shopify.dev/docs/apps/launch/app-store-review/app-store-requirements)
- [Non-Embedded Apps Guide](https://shopify.dev/docs/apps/design-guidelines/app-structure#non-embedded-apps)

---

## 7. Quick Test Commands

```bash
# Test the app builds without errors
npm run build

# Test database connection
npm run db:test

# Generate Prisma client
npm run db:generate

# Run app in development
npm run dev
```

---

**Last Updated:** May 20, 2026  
**Status:** Ready for submission after listing updates
