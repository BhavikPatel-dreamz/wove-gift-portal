/*
  Warnings:

  - You are about to drop the `Vouchers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VoucherCode" DROP CONSTRAINT "VoucherCode_voucherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vouchers" DROP CONSTRAINT "Vouchers_brandId_fkey";

-- DropTable
DROP TABLE "public"."Vouchers";

-- CreateTable
CREATE TABLE "public"."denominations" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "displayName" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denominations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vouchers" (
    "id" TEXT NOT NULL,
    "denominationType" "public"."DenominationStatus" NOT NULL DEFAULT 'fixed',
    "denominationCurrency" TEXT NOT NULL DEFAULT 'USD',
    "denominationValue" INTEGER,
    "maxAmount" INTEGER,
    "minAmount" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "expiryValue" TEXT,
    "graceDays" INTEGER DEFAULT 0,
    "redemptionChannels" JSONB,
    "partialRedemption" BOOLEAN NOT NULL DEFAULT false,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "maxUserPerDay" INTEGER,
    "termsConditionsURL" TEXT,
    "productSku" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isExpiry" BOOLEAN NOT NULL DEFAULT false,
    "expiryPolicy" TEXT,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "denominations_voucherId_idx" ON "public"."denominations"("voucherId");

-- CreateIndex
CREATE INDEX "denominations_voucherId_isActive_idx" ON "public"."denominations"("voucherId", "isActive");

-- AddForeignKey
ALTER TABLE "public"."denominations" ADD CONSTRAINT "denominations_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vouchers" ADD CONSTRAINT "vouchers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherCode" ADD CONSTRAINT "VoucherCode_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
