/*
  Warnings:

  - A unique constraint covering the columns `[userId,key]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Wishlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `Wishlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Wishlist_userId_voucherId_key";

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "payload" JSONB NOT NULL,
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key_key" ON "Wishlist"("userId", "key");
