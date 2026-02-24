# Wove Gift Portal Setup and Run Guide

This document is only for environment setup and running the project.

## 1. Prerequisites

- Node.js `>=18.18 <25`
- `pnpm` `10.x`
- PostgreSQL database
- Git
- Optional for process management: `pm2`

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Configure Environment Variables

1. Create or update `.env` in the project root.
2. Add required values for your environment.

Minimum required for basic startup:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_BASE_URL`

Common service variables (enable features as needed):

- Auth/Google: `NEXT_GOOGLE_CLIENT_ID`, `NEXT_GOOGLE_CLIENT_SECRET`
- PayFast: `NEXT_PAYFAST_*`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- Brevo: `NEXT_BREVO_*`, `BREVO_TEMPLATE_ID_*`
- Twilio: `NEXT_TWILIO_*`
- Cloudinary: `NEXT_CLOUDINARY_*`
- Shopify: `SHOPIFY_*`, `NEXT_PUBLIC_SHOPIFY_API_KEY`, `SCOPES`
- Scheduling security: `CRON_SECRET`

## 4. Database Setup

Run these in order:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Optional DB UI:

```bash
pnpm db:studio
```

## 5. Run Locally (Development)

```bash
pnpm dev
```

Default URL: `http://localhost:3000`

If you need local background schedulers, run this in a second terminal:

```bash
pnpm cron:start
```

## 6. Run in Production Mode (Local/Server)

```bash
pnpm build
pnpm start
```

## 7. Run with PM2 (Server)

Start processes:

```bash
pm2 start ecosystem.config.cjs --env production
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs
pm2 restart all
pm2 save
```

## 8. Useful Commands

- `pnpm lint` - run lint checks
- `pnpm test` - run tests
- `pnpm sync:shopify` - run Shopify sync script
- `pnpm gift-cards:create` - create gift cards via script
- `pnpm gift-cards:list` - list gift cards via script
- `pnpm gift-cards:stats` - gift card stats via script

## 9. Setup Troubleshooting

- If `pnpm db:seed` says seed is not configured, verify `prisma.config.js` has `migrations.seed`.
- If Prisma commands fail, verify `DATABASE_URL` points to a reachable PostgreSQL instance.
- If auth login fails in local, verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- If build fails after dependency changes, run `pnpm install` again and retry `pnpm build`.
