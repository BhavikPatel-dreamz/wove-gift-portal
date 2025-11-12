-- AlterTable
ALTER TABLE "public"."GiftCard" ADD COLUMN     "denominationId" TEXT;

-- CreateIndex
CREATE INDEX "GiftCard_denominationId_idx" ON "public"."GiftCard"("denominationId");
