CREATE TABLE "brand_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "brand_categories_name_key" ON "brand_categories"("name");

INSERT INTO "brand_categories" ("id", "name", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'Fashion', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Food & Beverage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Travel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Health & Beauty', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Home & Garden', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Sports & Outdoors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Entertainment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Services', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Other', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "brand_categories" ("id", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, existing_categories."categoryName", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (lower(btrim("categoryName"))) btrim("categoryName") AS "categoryName"
    FROM "Brand"
    WHERE "categoryName" IS NOT NULL AND btrim("categoryName") <> ''
    ORDER BY lower(btrim("categoryName")), btrim("categoryName")
) AS existing_categories
WHERE NOT EXISTS (
    SELECT 1
    FROM "brand_categories"
    WHERE lower("brand_categories"."name") = lower(existing_categories."categoryName")
)
ON CONFLICT ("name") DO NOTHING;
