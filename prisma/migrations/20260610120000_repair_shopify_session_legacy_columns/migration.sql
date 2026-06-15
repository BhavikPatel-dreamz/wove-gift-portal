-- Repair databases that still have Shopify's legacy session table shape.
-- The app's Prisma model reads/writes "expiresAt", while older installs used "expires".
ALTER TABLE "ShopifySession"
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ShopifySession'
      AND column_name = 'expires'
  ) THEN
    EXECUTE 'UPDATE "ShopifySession" SET "expiresAt" = "expires" WHERE "expiresAt" IS NULL AND "expires" IS NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ShopifySession'
      AND column_name = 'state'
  ) THEN
    ALTER TABLE "ShopifySession" ALTER COLUMN "state" SET DEFAULT '';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ShopifySession_shop_key"
ON "ShopifySession"("shop");
