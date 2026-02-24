/*
  Warnings:

  - You are about to drop the `DeliveryLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "SMSServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "WhatsAppServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderProcessingStatus" AS ENUM ('PENDING', 'PAYMENT_CONFIRMED', 'VOUCHERS_CREATING', 'VOUCHERS_CREATED', 'NOTIFICATIONS_SENDING', 'COMPLETED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'BULK_EMAIL', 'SUMMARY_EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "DeliveryLog" DROP CONSTRAINT "DeliveryLog_orderId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryLog" DROP CONSTRAINT "DeliveryLog_voucherCodeId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "allVouchersGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastProcessedAt" TIMESTAMP(3),
ADD COLUMN     "maxRetries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "notificationsSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "processingErrors" JSONB,
ADD COLUMN     "processingStartedAt" TIMESTAMP(3),
ADD COLUMN     "processingStatus" "OrderProcessingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voucherEntries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vouchersCreated" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "DeliveryLog";

-- CreateTable
CREATE TABLE "notification_details" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "recipientName" TEXT,
    "notificationType" "NotificationType" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "messageId" TEXT,
    "voucherCodeId" TEXT,
    "bulkRecipientId" TEXT,
    "emailServiceStatus" TEXT,
    "emailServiceId" TEXT,
    "emailServiceError" TEXT,
    "whatsappServiceStatus" TEXT,
    "whatsappServiceId" TEXT,
    "whatsappServiceError" TEXT,
    "smsServiceStatus" TEXT,
    "smsServiceId" TEXT,
    "smsServiceError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_logs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "voucherCodeId" TEXT,
    "method" "DeliveryMethodStatus" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "messageId" TEXT,
    "giftCardCreated" BOOLEAN NOT NULL DEFAULT false,
    "giftCardCreatedAt" TIMESTAMP(3),
    "giftCardShopifyId" TEXT,
    "giftCardError" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentUpdatedAt" TIMESTAMP(3),
    "voucherGenerated" BOOLEAN NOT NULL DEFAULT false,
    "voucherGeneratedAt" TIMESTAMP(3),
    "voucherGenerationError" TEXT,
    "shopifySyncStatus" "SyncStatus",
    "shopifySyncedAt" TIMESTAMP(3),
    "shopifySyncError" TEXT,
    "emailServiceStatus" TEXT,
    "emailServiceId" TEXT,
    "emailServiceError" TEXT,
    "smsServiceStatus" TEXT,
    "smsServiceId" TEXT,
    "smsServiceError" TEXT,
    "whatsappServiceStatus" TEXT,
    "whatsappServiceId" TEXT,
    "whatsappServiceError" TEXT,
    "lastRetryAt" TIMESTAMP(3),
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "processingTimeMs" INTEGER,
    "deliveryLatencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gift_card_created" BOOLEAN NOT NULL DEFAULT false,
    "gift_card_created_at" TIMESTAMP(6),
    "gift_card_shopify_id" TEXT,
    "gift_card_error" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_updated_at" TIMESTAMP(6),
    "voucher_generated" BOOLEAN NOT NULL DEFAULT false,
    "voucher_generated_at" TIMESTAMP(6),
    "voucher_generation_error" TEXT,
    "shopify_sync_status" TEXT,
    "shopify_synced_at" TIMESTAMP(6),
    "shopify_sync_error" TEXT,
    "email_service_status" TEXT,
    "email_service_id" TEXT,
    "email_service_error" TEXT,
    "sms_service_status" TEXT,
    "sms_service_id" TEXT,
    "sms_service_error" TEXT,
    "whatsapp_service_status" TEXT,
    "whatsapp_service_id" TEXT,
    "whatsapp_service_error" TEXT,
    "last_retry_at" TIMESTAMP(6),
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "processing_time_ms" INTEGER,
    "delivery_latency_ms" INTEGER,

    CONSTRAINT "delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_details_orderId_idx" ON "notification_details"("orderId");

-- CreateIndex
CREATE INDEX "notification_details_status_idx" ON "notification_details"("status");

-- CreateIndex
CREATE INDEX "notification_details_notificationType_idx" ON "notification_details"("notificationType");

-- CreateIndex
CREATE INDEX "notification_details_sentAt_idx" ON "notification_details"("sentAt");

-- CreateIndex
CREATE INDEX "notification_details_voucherCodeId_idx" ON "notification_details"("voucherCodeId");

-- CreateIndex
CREATE INDEX "notification_details_bulkRecipientId_idx" ON "notification_details"("bulkRecipientId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_logs_giftCardShopifyId_key" ON "delivery_logs"("giftCardShopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_logs_gift_card_shopify_id_key" ON "delivery_logs"("gift_card_shopify_id");

-- CreateIndex
CREATE INDEX "delivery_logs_orderId_idx" ON "delivery_logs"("orderId");

-- CreateIndex
CREATE INDEX "delivery_logs_voucherCodeId_idx" ON "delivery_logs"("voucherCodeId");

-- CreateIndex
CREATE INDEX "delivery_logs_status_idx" ON "delivery_logs"("status");

-- CreateIndex
CREATE INDEX "delivery_logs_giftCardCreated_idx" ON "delivery_logs"("giftCardCreated");

-- CreateIndex
CREATE INDEX "delivery_logs_paymentStatus_idx" ON "delivery_logs"("paymentStatus");

-- CreateIndex
CREATE INDEX "delivery_logs_shopifySyncStatus_idx" ON "delivery_logs"("shopifySyncStatus");

-- CreateIndex
CREATE INDEX "delivery_logs_emailServiceStatus_idx" ON "delivery_logs"("emailServiceStatus");

-- CreateIndex
CREATE INDEX "delivery_logs_sentAt_idx" ON "delivery_logs"("sentAt");

-- CreateIndex
CREATE INDEX "delivery_logs_deliveredAt_idx" ON "delivery_logs"("deliveredAt");

-- CreateIndex
CREATE INDEX "idx_delivery_logs_email_service_status" ON "delivery_logs"("email_service_status");

-- CreateIndex
CREATE INDEX "idx_delivery_logs_gift_card_created" ON "delivery_logs"("gift_card_created");

-- CreateIndex
CREATE INDEX "idx_delivery_logs_payment_status" ON "delivery_logs"("payment_status");

-- CreateIndex
CREATE INDEX "idx_delivery_logs_shopify_sync_status" ON "delivery_logs"("shopify_sync_status");

-- CreateIndex
CREATE INDEX "Order_isPaid_idx" ON "Order"("isPaid");

-- CreateIndex
CREATE INDEX "Order_processingStatus_idx" ON "Order"("processingStatus");

-- CreateIndex
CREATE INDEX "Order_allVouchersGenerated_idx" ON "Order"("allVouchersGenerated");

-- CreateIndex
CREATE INDEX "Order_notificationsSent_idx" ON "Order"("notificationsSent");

-- CreateIndex
CREATE INDEX "Order_lastProcessedAt_idx" ON "Order"("lastProcessedAt");

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_bulkRecipientId_fkey" FOREIGN KEY ("bulkRecipientId") REFERENCES "BulkRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
