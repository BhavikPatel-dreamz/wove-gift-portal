/*
  Warnings:

  - A unique constraint covering the columns `[voucherCodeId]` on the table `BulkRecipient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BulkRecipient" ADD COLUMN     "voucherCodeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BulkRecipient_voucherCodeId_key" ON "BulkRecipient"("voucherCodeId");

-- CreateIndex
CREATE INDEX "BulkRecipient_voucherCodeId_idx" ON "BulkRecipient"("voucherCodeId");

-- AddForeignKey
ALTER TABLE "BulkRecipient" ADD CONSTRAINT "BulkRecipient_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
