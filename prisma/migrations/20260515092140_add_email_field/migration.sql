-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'BRAND_MANAGER', 'SUPPORT', 'FINANCE', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PromoCodeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_GIFT');

-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('REGULAR', 'BULK');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('onRedemption', 'onPurchase');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('Fixed', 'Percentage');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('Retain', 'Share');

-- CreateEnum
CREATE TYPE "DenominationStatus" AS ENUM ('fixed', 'both', 'amount');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('shopify', 'woocommerce', 'magento', 'custom_api', 'other');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('success', 'failed', 'partial', 'syncing', 'pending');

-- CreateEnum
CREATE TYPE "AppInstallationApprovalStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "PayoutMethodStatus" AS ENUM ('EFT', 'wire_transfer', 'paypal', 'stripe', 'manual');

-- CreateEnum
CREATE TYPE "SettlementFrequencyStatus" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');

-- CreateEnum
CREATE TYPE "DeliveryMethodStatus" AS ENUM ('whatsapp', 'email', 'sms', 'print', 'multiple');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('Issued', 'PartiallyRedeemed', 'Redeemed', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SendStatus" AS ENUM ('sendImmediately', 'scheduleLater');

-- CreateEnum
CREATE TYPE "SettlementPaymentStatus" AS ENUM ('Pending', 'Paid', 'Partial', 'InReview', 'Disputed');

-- CreateEnum
CREATE TYPE "ScheduledReportStatus" AS ENUM ('Active', 'Paused', 'Cancelled');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('PENDING', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EmailServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "SMSServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "WhatsAppServiceStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderProcessingStatus" AS ENUM ('PENDING', 'PAYMENT_CONFIRMED', 'VOUCHERS_CREATING', 'VOUCHERS_CREATED', 'NOTIFICATIONS_SENDING', 'COMPLETED', 'FAILED', 'RETRYING', 'PROCESSING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'BULK_EMAIL', 'SUMMARY_EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'CANCELLED');

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CartItemType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "currency" TEXT,
    "domain" TEXT,
    "slug" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "tagline" TEXT,
    "color" TEXT,
    "categoryName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isFeature" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandContacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandContacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandTerms" (
    "id" TEXT NOT NULL,
    "settlementTrigger" "SettlementStatus" NOT NULL DEFAULT 'onRedemption',
    "commissionType" "CommissionStatus" NOT NULL DEFAULT 'Percentage',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER DEFAULT 0,
    "minOrderValue" INTEGER DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "breakagePolicy" TEXT,
    "breakageShare" INTEGER DEFAULT 0,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "goLiveDate" TIMESTAMP(3),
    "renewContract" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" DOUBLE PRECISION DEFAULT 0,
    "internalNotes" TEXT,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandBanking" (
    "id" TEXT NOT NULL,
    "settlementFrequency" "SettlementFrequencyStatus" NOT NULL DEFAULT 'monthly',
    "dayOfMonth" INTEGER,
    "payoutMethod" "PayoutMethodStatus" NOT NULL DEFAULT 'EFT',
    "invoiceRequired" BOOLEAN NOT NULL DEFAULT false,
    "remittanceEmail" TEXT,
    "accountHolder" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "swiftCode" TEXT,
    "country" TEXT NOT NULL,
    "accountVerification" BOOLEAN NOT NULL DEFAULT false,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandBanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "platform" TEXT,
    "storeUrl" TEXT,
    "storeName" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "accessToken" TEXT,
    "consumerKey" TEXT,
    "consumerSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus",
    "syncMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncLog" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denominations" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "displayName" TEXT,
    "isExpiry" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denominations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "denominationType" "DenominationStatus" NOT NULL DEFAULT 'fixed',
    "denominationCurrency" TEXT NOT NULL DEFAULT 'ZAR',
    "denominationValue" INTEGER,
    "maxAmount" INTEGER,
    "minAmount" INTEGER,
    "expiresAt" TIMESTAMP(3),
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

-- CreateTable
CREATE TABLE "VoucherCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "shopifyGiftCardId" TEXT,
    "shopifyShop" TEXT,
    "shopifySyncError" TEXT,
    "shopifySyncedAt" TIMESTAMP(3),
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "originalValue" INTEGER NOT NULL,
    "remainingValue" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "pin" TEXT,
    "qrCode" TEXT,
    "tokenizedLink" TEXT,
    "linkExpiresAt" TIMESTAMP(3),
    "lastSyncedRedeemedValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherRedemption" (
    "id" TEXT NOT NULL,
    "voucherCodeId" TEXT NOT NULL,
    "amountRedeemed" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "storeUrl" TEXT,

    CONSTRAINT "VoucherRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occasion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occasion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccasionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "occasionId" TEXT NOT NULL,

    CONSTRAINT "OccasionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomCard" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiverDetail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiverDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "occasionId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "customCardId" TEXT,
    "isCustom" BOOLEAN,
    "userId" TEXT NOT NULL,
    "bulkOrderNumber" TEXT,
    "receiverDetailId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "message" TEXT,
    "customImageUrl" TEXT,
    "promoCodeId" TEXT,
    "customVideoUrl" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "deliveryMethod" "DeliveryMethodStatus" NOT NULL DEFAULT 'whatsapp',
    "sendType" "SendStatus" NOT NULL DEFAULT 'sendImmediately',
    "scheduledFor" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "redemptionStatus" "RedemptionStatus" NOT NULL DEFAULT 'Issued',
    "redeemedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "allVouchersGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "lastProcessedAt" TIMESTAMP(3),
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "notificationsSent" BOOLEAN NOT NULL DEFAULT false,
    "processingCompletedAt" TIMESTAMP(3),
    "processingErrors" JSONB,
    "processingStartedAt" TIMESTAMP(3),
    "processingStatus" "OrderProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "voucherEntries" INTEGER NOT NULL DEFAULT 0,
    "vouchersCreated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Settlements" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "settlementPeriod" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalSold" INTEGER NOT NULL,
    "totalSoldAmount" INTEGER NOT NULL,
    "totalRedeemed" INTEGER NOT NULL,
    "redeemedAmount" INTEGER NOT NULL,
    "outstanding" INTEGER NOT NULL,
    "outstandingAmount" INTEGER NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "breakageAmount" INTEGER,
    "vatAmount" INTEGER,
    "netPayable" INTEGER NOT NULL,
    "totalPaid" INTEGER DEFAULT 0,
    "remainingAmount" INTEGER DEFAULT 0,
    "status" "SettlementPaymentStatus" NOT NULL DEFAULT 'Pending',
    "paidAt" TIMESTAMP(3),
    "lastPaymentDate" TIMESTAMP(3),
    "paymentCount" INTEGER DEFAULT 0,
    "paymentHistory" JSONB,
    "paymentReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT,
    "voucherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceType" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReport" (
    "id" TEXT NOT NULL,
    "shop" TEXT,
    "brandId" TEXT,
    "frequency" TEXT NOT NULL,
    "deliveryDay" TEXT NOT NULL,
    "deliveryMonth" TEXT,
    "deliveryYear" TEXT,
    "emailRecipients" TEXT NOT NULL,
    "reportTypes" JSONB NOT NULL,
    "nextDeliveryDate" TIMESTAMP(3) NOT NULL,
    "lastDeliveryDate" TIMESTAMP(3),
    "status" "ScheduledReportStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "wantsAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'footer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifySession" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppInstallation" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" "AppInstallationApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "shopifyId" TEXT,
    "code" TEXT NOT NULL,
    "initialValue" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "customerEmail" TEXT,
    "note" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "denominationId" TEXT,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "supportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "orderNumber" TEXT,
    "reason" TEXT NOT NULL,
    "message" TEXT,
    "status" "SupportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "supportRequestId" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkRecipient" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientPhone" TEXT,
    "personalMessage" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailDelivered" BOOLEAN NOT NULL DEFAULT false,
    "emailDeliveredAt" TIMESTAMP(3),
    "emailError" TEXT,
    "rowNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "voucherCodeId" TEXT,

    CONSTRAINT "BulkRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromoCodeType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "minOrderAmount" INTEGER,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cart_items_userId_type_idx" ON "cart_items"("userId", "type");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "Brand"("brandName");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_domain_key" ON "Brand"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BrandTerms_brandId_key" ON "BrandTerms"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBanking_brandId_key" ON "BrandBanking"("brandId");

-- CreateIndex
CREATE INDEX "denominations_voucherId_idx" ON "denominations"("voucherId");

-- CreateIndex
CREATE INDEX "denominations_voucherId_isActive_idx" ON "denominations"("voucherId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherCode_code_key" ON "VoucherCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherCode_shopifyGiftCardId_key" ON "VoucherCode"("shopifyGiftCardId");

-- CreateIndex
CREATE INDEX "VoucherCode_orderId_idx" ON "VoucherCode"("orderId");

-- CreateIndex
CREATE INDEX "VoucherCode_voucherId_idx" ON "VoucherCode"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherCodeId_idx" ON "VoucherRedemption"("voucherCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherRedemption_transactionId_voucherCodeId_storeUrl_key" ON "VoucherRedemption"("transactionId", "voucherCodeId", "storeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Occasion_name_key" ON "Occasion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OccasionCategory_name_key" ON "OccasionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomCard_name_key" ON "CustomCard"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_brandId_idx" ON "Order"("brandId");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

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
CREATE INDEX "Settlements_brandId_idx" ON "Settlements"("brandId");

-- CreateIndex
CREATE INDEX "Settlements_status_idx" ON "Settlements"("status");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key_key" ON "Wishlist"("userId", "key");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ScheduledReport_shop_idx" ON "ScheduledReport"("shop");

-- CreateIndex
CREATE INDEX "ScheduledReport_brandId_idx" ON "ScheduledReport"("brandId");

-- CreateIndex
CREATE INDEX "ScheduledReport_status_idx" ON "ScheduledReport"("status");

-- CreateIndex
CREATE INDEX "ScheduledReport_nextDeliveryDate_idx" ON "ScheduledReport"("nextDeliveryDate");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_wantsAnnouncements_idx" ON "newsletter_subscriptions"("wantsAnnouncements");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifySession_shop_key" ON "ShopifySession"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "AppInstallation_shop_key" ON "AppInstallation"("shop");

-- CreateIndex
CREATE INDEX "AppInstallation_approvalStatus_idx" ON "AppInstallation"("approvalStatus");

-- CreateIndex
CREATE INDEX "AppInstallation_isActive_approvalStatus_idx" ON "AppInstallation"("isActive", "approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_shopifyId_key" ON "GiftCard"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_shop_idx" ON "GiftCard"("shop");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_customerEmail_idx" ON "GiftCard"("customerEmail");

-- CreateIndex
CREATE INDEX "GiftCard_denominationId_idx" ON "GiftCard"("denominationId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportRequest_supportId_key" ON "SupportRequest"("supportId");

-- CreateIndex
CREATE INDEX "SupportRequest_status_idx" ON "SupportRequest"("status");

-- CreateIndex
CREATE INDEX "SupportRequest_email_idx" ON "SupportRequest"("email");

-- CreateIndex
CREATE INDEX "SupportMessage_supportRequestId_idx" ON "SupportMessage"("supportRequestId");

-- CreateIndex
CREATE INDEX "SupportMessage_createdAt_idx" ON "SupportMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BulkRecipient_voucherCodeId_key" ON "BulkRecipient"("voucherCodeId");

-- CreateIndex
CREATE INDEX "BulkRecipient_orderId_idx" ON "BulkRecipient"("orderId");

-- CreateIndex
CREATE INDEX "BulkRecipient_recipientEmail_idx" ON "BulkRecipient"("recipientEmail");

-- CreateIndex
CREATE INDEX "BulkRecipient_emailSent_idx" ON "BulkRecipient"("emailSent");

-- CreateIndex
CREATE INDEX "BulkRecipient_voucherCodeId_idx" ON "BulkRecipient"("voucherCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_isActive_idx" ON "promo_codes"("isActive");

-- CreateIndex
CREATE INDEX "promo_codes_type_idx" ON "promo_codes"("type");

-- CreateIndex
CREATE INDEX "promo_codes_createdById_idx" ON "promo_codes"("createdById");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandContacts" ADD CONSTRAINT "BrandContacts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTerms" ADD CONSTRAINT "BrandTerms_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBanking" ADD CONSTRAINT "BrandBanking_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denominations" ADD CONSTRAINT "denominations_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCode" ADD CONSTRAINT "VoucherCode_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCode" ADD CONSTRAINT "VoucherCode_shopifyGiftCardId_fkey" FOREIGN KEY ("shopifyGiftCardId") REFERENCES "GiftCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherCode" ADD CONSTRAINT "VoucherCode_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OccasionCategory" ADD CONSTRAINT "OccasionCategory_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "Occasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "Occasion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_receiverDetailId_fkey" FOREIGN KEY ("receiverDetailId") REFERENCES "ReceiverDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_bulkRecipientId_fkey" FOREIGN KEY ("bulkRecipientId") REFERENCES "BulkRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_details" ADD CONSTRAINT "notification_details_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlements" ADD CONSTRAINT "Settlements_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "SupportRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkRecipient" ADD CONSTRAINT "BulkRecipient_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkRecipient" ADD CONSTRAINT "BulkRecipient_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
