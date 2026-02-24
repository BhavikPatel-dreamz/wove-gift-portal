# Wove Gift Portal
Wove Gift Portal is a Next.js application for:
- Customer gift-card purchase and checkout flows
- Admin operations (brands, occasions, orders, vouchers, settlements, reports, support)
- Embedded Shopify app workflows
- Voucher/notification queue processing and scheduled reporting

## Full Documentation
Project documentation generated from the current codebase is available in:
- `DOCUMENTATION.md`

## Quick Start
1. Install dependencies:
```bash
pnpm install
```
2. Generate Prisma client and apply DB migrations:
```bash
pnpm db:generate
pnpm db:migrate
```
3. (Optional) Seed users:
```bash
pnpm db:seed
```
4. Run development server:
```bash
pnpm dev
```

Default app URL: `http://localhost:3000`
