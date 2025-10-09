/*
  Warnings:

  - Added the required column `isExpiry` to the `denominations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."denominations" ADD COLUMN     "isExpiry" BOOLEAN NOT NULL;
