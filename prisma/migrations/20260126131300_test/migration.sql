/*
  Warnings:

  - You are about to drop the column `voucherCodeId` on the `BulkRecipient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BulkRecipient" DROP CONSTRAINT "BulkRecipient_voucherCodeId_fkey";

-- DropIndex
DROP INDEX "BulkRecipient_voucherCodeId_key";

-- AlterTable
ALTER TABLE "BulkRecipient" DROP COLUMN "voucherCodeId";
