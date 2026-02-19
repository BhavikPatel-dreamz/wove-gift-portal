# Wove Gift Portal Documentation
Last updated: 2026-02-19

## 1) Overview
Wove Gift Portal is a multi-surface gift-card platform built on Next.js App Router.

The same codebase serves three products:
- Public/customer gifting flows
- Admin operations dashboard
- Embedded Shopify app

Main business capabilities in current code:
- Brand and voucher catalog management
- Checkout and order creation (single and bulk)
- PayFast and Stripe payment handling
- Voucher generation and redemption tracking
- Delivery notifications (email, WhatsApp, printable PDF)
- Settlement computation and reporting
- Scheduled report delivery
- Support workflows for recipient changes and cancellation

## 2) Tech Stack
- Node.js `>=18.18 <25`
- Next.js `16.1.1` (App Router)
- React `19.1.0`
- Prisma `7.3.0`
- PostgreSQL (Prisma datasource)
- Tailwind CSS `4`
- Auth: custom iron-session + NextAuth Google OAuth
- Payments: PayFast + Stripe
- Email: Brevo (`@getbrevo/brevo`)
- WhatsApp/SMS provider: Twilio (current), WATI (optional)
- Media upload: Cloudinary
- Shopify integration: `@shopify/shopify-api`, App Bridge
- Scheduling: Vercel cron + local node-cron/PM2

## 3) High-Level Architecture
Request handling is split into layers:
- Route layer: `src/app/**` and `src/app/api/**`
- Business layer: `src/lib/action/**`
- Infra layer: `src/lib/**` (DB, auth, email, payment utils, Shopify helpers)
- Persistence: Prisma models in `prisma/schema.prisma`

Layout/auth boundaries:
- `src/app/(client)/layout.jsx`: loads session context + Redux store for client pages
- `src/app/(admin)/layout.jsx`: validates session and redirects unauthenticated users to `/login`
- `src/app/shopify/layout.jsx`: wraps Shopify pages with App Bridge provider
- `src/proxy.js`: global route matcher and API/shopify gatekeeping

## 4) Directory Guide
- `src/app/`: app routes, API routes, and layouts
- `src/components/`: UI grouped by feature (dashboard, vouchers, settlements, shopify, etc.)
- `src/lib/action/`: main business logic modules
- `src/lib/`: DB client, auth/session, email, payment, Shopify, utility modules
- `src/redux/`: client state store and slices
- `src/contexts/`: session/provider contexts
- `prisma/`: schema + seed script
- `scripts/`: cron scheduler and scheduled reports runner
- `src/scripts/`: helper scripts (gift card utility, Shopify sync)
- `vercel.json`: production cron schedule
- `ecosystem.config.cjs`: PM2 app + cron process definitions

## 5) Page Route Inventory

### Client pages
- `/`
- `/about`
- `/BrandsSelection`
- `/cart`
- `/checkout`
- `/contact`
- `/faq`
- `/gift`
- `/my-gift`
- `/payment/cancel`
- `/payment/success`
- `/privacy`
- `/reviews`
- `/support`
- `/termsandcondition`
- `/track-request`
- `/work`
- `/login`
- `/signup`

### Admin pages
- `/dashboard`
- `/brands`
- `/brandsPartner`
- `/brandsPartner/new`
- `/brandsPartner/edit/[id]`
- `/brandsPartner/[id]/settlements`
- `/brandsPartner/[id]/settlements/[settlementId]/overview`
- `/brandsPartner/[id]/settlements/[settlementId]/vouchers`
- `/brandsPartner/[id]/settlements/[settlementId]/contacts`
- `/brandsPartner/[id]/settlements/[settlementId]/banking`
- `/brandsPartner/[id]/settlements/[settlementId]/terms`
- `/occasions`
- `/occasions/[id]/cards`
- `/orders`
- `/vouchers`
- `/vouchers/analytics`
- `/vouchers/settlements`
- `/settlements`
- `/settlements/[id]/overview`
- `/settlements/[id]/vouchers`
- `/settlements/[id]/contacts`
- `/settlements/[id]/banking`
- `/settlements/[id]/terms`
- `/reports`
- `/supportRequests`
- `/controls`

### Shopify pages
- `/shopify`
- `/shopify/install`
- `/shopify/auth-required`
- `/shopify/dashboard`
- `/shopify/vouchers`
- `/shopify/reports`
- `/shopify/settlements`
- `/shopify/settlements/[settlementId]/overview`
- `/shopify/settlements/[settlementId]/vouchers`
- `/shopify/settlements/[settlementId]/contacts`
- `/shopify/settlements/[settlementId]/banking`
- `/shopify/settlements/[settlementId]/terms`
- `/shopify/success`

## 6) API Inventory

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | `GET,POST` | NextAuth endpoints (Google OAuth flow) |
| `/api/auth/login` | `POST` | Local login + session creation |
| `/api/auth/logout` | `POST` | Session destruction |
| `/api/auth/signup` | `POST` | Local signup + session creation |
| `/api/contact` | `POST` | Contact form email relay |
| `/api/cron/notification-processor` | `GET` | Notification queue processor trigger |
| `/api/cron/scheduled-reports` | `GET` | Scheduled report dispatch trigger |
| `/api/cron/voucher-processor` | `GET` | Voucher generation queue trigger |
| `/api/giftcard` | `GET,POST` | Gift card fetch/create via Shopify integration |
| `/api/giftcard/stats` | `GET` | Gift card aggregate stats for a shop/brand |
| `/api/newsletter` | `POST` | Newsletter subscription upsert |
| `/api/orders/by-payment-intent` | `POST` | Fetch all orders by Stripe paymentIntentId |
| `/api/payment/create-intent` | `POST` | Stripe PaymentIntent creation |
| `/api/payment/process-card` | `POST` | Legacy Stripe charge flow |
| `/api/reports/custom` | `POST` | Custom report generation (JSON/CSV) |
| `/api/reports/quick` | `GET` | Predefined report generation |
| `/api/reports/schedule` | `DELETE,GET,POST,PUT` | Scheduled report CRUD |
| `/api/save-card` | `POST` | Upload custom card image to Cloudinary |
| `/api/shopify/auth/callback` | `GET` | Shopify OAuth callback + token persistence |
| `/api/shopify/auth` | `GET` | Shopify OAuth entry |
| `/api/shopify/gift-cards/create` | `POST` | Create Shopify gift card + persist local record |
| `/api/shopify/gift-cards` | `GET` | Read gift cards from Shopify + local DB |
| `/api/shopify/products` | `GET,POST` | Product creation helper endpoint |
| `/api/support/modify-recipient` | `POST` | Modify recipient and resend notification |
| `/api/sync-shopify` | `POST` | Trigger Shopify sync script |
| `/api/virtual-gift-cards/create` | `POST` | Create virtual (non-Shopify) gift card |
| `/api/virtual-gift-cards/validate` | `POST,PUT` | Validate/redeem virtual gift card |
| `/api/voucher/generate-pdf` | `POST` | Generate printable gift card PDF |
| `/api/webhooks/giftcard-redeem` | `POST` | Shopify order webhook redemption sync |
| `/api/webhooks/payfast` | `GET,POST,PUT` | PayFast webhook + health/test handlers |
| `/api/webhooks/stripe` | `POST` | Stripe webhook event handling |

## 7) Data Model (Prisma)

### Models
- `Session`
- `User`
- `Account`
- `Brand`
- `BrandContacts`
- `BrandTerms`
- `BrandBanking`
- `Integration`
- `IntegrationSyncLog`
- `Denomination`
- `Vouchers`
- `VoucherCode`
- `VoucherRedemption`
- `Occasion`
- `OccasionCategory`
- `CustomCard`
- `ReceiverDetail`
- `Order`
- `NotificationDetail`
- `DeliveryLog`
- `Settlements`
- `Wishlist`
- `AuditLog`
- `ScheduledReport`
- `NewsletterSubscription`
- `ShopifySession`
- `AppInstallation`
- `GiftCard`
- `SupportRequest`
- `SupportMessage`
- `BulkRecipient`

### Enums
- `UserRole`
- `SettlementStatus`
- `CommissionStatus`
- `PolicyStatus`
- `DenominationStatus`
- `IntegrationType`
- `SyncStatus`
- `PayoutMethodStatus`
- `SettlementFrequencyStatus`
- `DeliveryMethodStatus`
- `DeliveryStatus`
- `RedemptionStatus`
- `PaymentStatus`
- `SendStatus`
- `SettlementPaymentStatus`
- `ScheduledReportStatus`
- `SupportStatus`
- `SenderType`
- `EmailServiceStatus`
- `SMSServiceStatus`
- `WhatsAppServiceStatus`
- `OrderProcessingStatus`
- `NotificationType`
- `NotificationStatus`

## 8) Core Processing Flows

### PayFast order flow (queue-first)
1. Checkout creates `Order` rows with pending payment state.
2. `POST /api/webhooks/payfast` marks matching orders paid (`paymentStatus=COMPLETED`, `isPaid=true`, `processingStatus=PAYMENT_CONFIRMED`).
3. `GET /api/cron/voucher-processor` runs `processVouchersQueue()` and creates voucher/gift-card artifacts.
4. Orders move to `VOUCHERS_CREATED` when voucher generation completes.
5. `GET /api/cron/notification-processor` runs `processNotificationsQueue()` and sends email/WhatsApp/print delivery.
6. Orders move to `COMPLETED` after notification success.

### Stripe order flow
1. `POST /api/payment/create-intent` creates PaymentIntent and updates order to `PROCESSING`.
2. `POST /api/webhooks/stripe` handles payment events.
3. On success, `completeOrderAfterPayment()` queues downstream processing.

### Redemption flow
1. Shopify webhook (`/api/webhooks/giftcard-redeem`) reads gift-card transactions.
2. Creates `VoucherRedemption` rows with idempotency checks.
3. Updates `VoucherCode` balances/status and settlement counters.

## 9) Background Jobs and Scheduling

### Vercel cron (`vercel.json`)
- `* * * * *` -> `/api/cron/voucher-processor`
- `* * * * *` -> `/api/cron/notification-processor`
- `30 3 * * *` -> `/api/cron/scheduled-reports`

### Cron auth
- Cron endpoints call `validateCronRequest()` in `src/lib/cronAuth.js`.
- Expected header: `Authorization: Bearer <CRON_SECRET>`.
- In non-production, missing `CRON_SECRET` is allowed by current code.

### Local scheduler and PM2
- `scripts/scheduler.js` starts internal node-cron jobs.
- `scripts/send-scheduled-reports.js` is used by scheduled reports flow.
- `ecosystem.config.cjs` defines PM2 apps `wove-gift-portal-app` (web) and `wove-gift-portal-cron` (cron runner).

## 10) Business Logic Module Map (`src/lib/action`)
- `orderAction.js`: order lifecycle, payment completion, lookup, resend helpers.
- `cronProcessor.js`: voucher queue processor.
- `Notificationprocessorcron.js`: notification queue processor.
- `TwilloMessage.js`: gift-card email and WhatsApp message senders (Twilio implementation).
- `bulkOrderAction.js`: bulk order creation helpers.
- `brandAction.js`: base brand CRUD/search/stats.
- `brandPartner.js`: partner detail and settlement-heavy logic.
- `brandFetch.js`: client-facing brand retrieval utilities.
- `voucherAction.js`: voucher list/filter/detail logic.
- `dashbordAction.js`: dashboard aggregates.
- `customerDashbordAction.js`: customer gift-card dashboard/stats.
- `analytics.js`: analytics and settlement processing helpers.
- `occasionAction.js`: occasion/category CRUD.
- `supportAction.js`: support request lifecycle + cancellation.
- `shopify.js`: Shopify data pull utilities.
- `customCardAction.js`: custom card persistence.
- `cronScheduler.js`: cron start/stop orchestration.
- `userAction/auth.js`: local auth helpers.
- `userAction/password.js`: password hash/verify.
- `userAction/session.js`: session create/validate/destroy.

## 11) Environment Variables Used in Code

### Core
- `DATABASE_URL`
- `NODE_ENV`
- `NEXT_PUBLIC_BASE_URL`

### Auth
- `SESSION_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_GOOGLE_CLIENT_ID`
- `NEXT_GOOGLE_CLIENT_SECRET`

### Shopify
- `SHOPIFY_API_KEY`
- `SHOPIFY_SECRET_KEY`
- `SHOPIFY_APP_URL`
- `SCOPES`
- `NEXT_PUBLIC_SHOPIFY_API_KEY`

### Payments
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `NEXT_PAYFAST_SANDBOX`
- `NEXT_PAYFAST_SANDBOX_MERCHANT_ID`
- `NEXT_PAYFAST_SANDBOX_MERCHANT_KEY`
- `NEXT_PAYFAST_SANDBOX_PASSPHRASE`
- `NEXT_PAYFAST_MERCHANT_ID`
- `NEXT_PAYFAST_MERCHANT_KEY`
- `NEXT_PAYFAST_PASSPHRASE`

### Communication and media
- `NEXT_BREVO_API_KEY`
- `NEXT_BREVO_SENDER_EMAIL`
- `NEXT_BREVO_SENDER_NAME`
- `NEXT_BREVO_TEMPLATE_ID`
- `NEXT_TWILIO_ACCOUNT_SID`
- `NEXT_TWILIO_AUTH_TOKEN`
- `NEXT_TWILIO_WHATSAPP_NUMBER`
- `NEXT_TWILIO_CONTENT_SID`
- `CONTACT_FORM_RECEIVER_EMAIL`
- `NEXT_SUPPORT_EMAIL`
- `NEXT_CLOUDINARY_CLOUD_NAME`
- `NEXT_CLOUDINARY_API_KEY`
- `NEXT_CLOUDINARY_API_SECRET`
- Optional WATI variables (not used by current code):
- `WATI_API_URL`
- `WATI_API_KEY`
- `WATI_TEMPLATE_NAME`

### Cron
- `CRON_SECRET`

## 12) WhatsApp Provider Notes (Twilio and WATI)
- Current implementation uses Twilio via `src/lib/action/TwilloMessage.js`.
- Required current Twilio env vars:
- `NEXT_TWILIO_ACCOUNT_SID`
- `NEXT_TWILIO_AUTH_TOKEN`
- `NEXT_TWILIO_WHATSAPP_NUMBER`
- `NEXT_TWILIO_CONTENT_SID`
- WATI can be added by introducing a provider switch (for example `WHATSAPP_PROVIDER=twilio|wati`) and a WATI sender module, then routing `SendWhatsappMessages()` through that abstraction.

## 13) Local Development
1. Install dependencies:
```bash
pnpm install
```
2. Generate Prisma client and apply migrations:
```bash
pnpm db:generate
pnpm db:migrate
```
3. Optional seed:
```bash
pnpm db:seed
```
4. Start app:
```bash
pnpm dev
```

Seed users from `prisma/seed.js`:
- Admin: `admin@yopmail.com` / `test@123`
- Customer: `customer@yopmail.com` / `test@123`

## 14) Testing
- Test command: `pnpm test`
- Current coverage is minimal.

## 15) Current Risks and Gaps (from code)
- Repository currently includes a committed `.env` file with real secrets. Rotate and remove from VCS.
- `src/app/shopify/page.js` calls `/api/shopify/shop`, but no matching route exists.
- `src/lib/shopify.server.js` registers `APP_UNINSTALLED` webhook to `/api/webhooks/app-uninstalled`, but this route is not present.
- `package.json` contains scripts `gift-cards:create` and `gift-cards:list` pointing to `scripts/gift-card-manager.js`, but the file is not present.
- Shopify API versions are mixed across code (`2023-10`, `2024-10`, `2025-07`, `2025-10`, and SDK `ApiVersion.April24`).
- `src/lib/action/occasionAction.js` contains a corrupted/duplicated commented block around `getOccasionById` section.
- `src/proxy.js` allows broad API access for several routes; review route protection for production hardening.
- WATI is documented as optional but is not currently wired into runtime delivery code.

## 16) Documentation Maintenance Checklist
When adding or changing functionality, update this file for:
- New page routes and API endpoints
- New Prisma models/enums or relationship changes
- Payment/webhook/cron behavior changes
- New required environment variables
- Security/auth changes and any public-route exceptions
