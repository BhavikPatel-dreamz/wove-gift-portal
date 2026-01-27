/*
  Warnings:

  - The values [bulkEmail] on the enum `DeliveryMethodStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryMethodStatus_new" AS ENUM ('whatsapp', 'email', 'sms', 'print', 'multiple');
ALTER TABLE "public"."Order" ALTER COLUMN "deliveryMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" TYPE "DeliveryMethodStatus_new" USING ("deliveryMethod"::text::"DeliveryMethodStatus_new");
ALTER TABLE "DeliveryLog" ALTER COLUMN "method" TYPE "DeliveryMethodStatus_new" USING ("method"::text::"DeliveryMethodStatus_new");
ALTER TYPE "DeliveryMethodStatus" RENAME TO "DeliveryMethodStatus_old";
ALTER TYPE "DeliveryMethodStatus_new" RENAME TO "DeliveryMethodStatus";
DROP TYPE "public"."DeliveryMethodStatus_old";
ALTER TABLE "Order" ALTER COLUMN "deliveryMethod" SET DEFAULT 'whatsapp';
COMMIT;
