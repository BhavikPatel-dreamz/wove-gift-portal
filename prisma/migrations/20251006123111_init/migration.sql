-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'BRAND_MANAGER', 'SUPPORT', 'FINANCE');

-- CreateEnum
CREATE TYPE "public"."SettlementStatus" AS ENUM ('onRedemption', 'onPurchase');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('Fixed', 'Percentage');

-- CreateEnum
CREATE TYPE "public"."PolicyStatus" AS ENUM ('Retain', 'Share');

-- CreateEnum
CREATE TYPE "public"."DenominationStatus" AS ENUM ('fixed', 'amount');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('shopify', 'woocommerce', 'magento', 'custom_api', 'other');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('success', 'failed', 'partial', 'syncing', 'pending');

-- CreateEnum
CREATE TYPE "public"."PayoutMethodStatus" AS ENUM ('EFT', 'wire_transfer', 'paypal', 'stripe', 'manual');

-- CreateEnum
CREATE TYPE "public"."SettlementFrequencyStatus" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');

-- CreateEnum
CREATE TYPE "public"."DeliveryMethodStatus" AS ENUM ('whatsapp', 'email', 'sms', 'print');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('Issued', 'PartiallyRedeemed', 'Redeemed', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SendStatus" AS ENUM ('sendImmediately', 'scheduleLater');

-- CreateEnum
CREATE TYPE "public"."SettlementPaymentStatus" AS ENUM ('Pending', 'Paid', 'InReview', 'Disputed');

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
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
CREATE TABLE "public"."BrandContacts" (
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
CREATE TABLE "public"."BrandTerms" (
    "id" TEXT NOT NULL,
    "settlementTrigger" "public"."SettlementStatus" NOT NULL DEFAULT 'onRedemption',
    "commissionType" "public"."CommissionStatus" NOT NULL DEFAULT 'Percentage',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER DEFAULT 0,
    "minOrderValue" INTEGER DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
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
CREATE TABLE "public"."BrandBanking" (
    "id" TEXT NOT NULL,
    "settlementFrequency" "public"."SettlementFrequencyStatus" NOT NULL DEFAULT 'monthly',
    "dayOfMonth" INTEGER,
    "payoutMethod" "public"."PayoutMethodStatus" NOT NULL DEFAULT 'EFT',
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
CREATE TABLE "public"."Integration" (
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
    "syncStatus" "public"."SyncStatus",
    "syncMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IntegrationSyncLog" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" "public"."SyncStatus" NOT NULL,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vouchers" (
    "id" TEXT NOT NULL,
    "denominationType" "public"."DenominationStatus" NOT NULL DEFAULT 'fixed',
    "denominations" JSONB,
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

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoucherCode" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoucherRedemption" (
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
CREATE TABLE "public"."Occasion" (
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
CREATE TABLE "public"."OccasionCategory" (
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
CREATE TABLE "public"."CustomCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bgColor" TEXT,
    "bgImage" TEXT,
    "emoji" TEXT,
    "templateType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReceiverDetail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiverDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "occasionId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "customCardId" TEXT,
    "userId" TEXT NOT NULL,
    "receiverDetailId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "customImageUrl" TEXT,
    "customVideoUrl" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "deliveryMethod" "public"."DeliveryMethodStatus" NOT NULL DEFAULT 'whatsapp',
    "sendType" "public"."SendStatus" NOT NULL DEFAULT 'sendImmediately',
    "scheduledFor" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "redemptionStatus" "public"."RedemptionStatus" NOT NULL DEFAULT 'Issued',
    "redeemedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeliveryLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "voucherCodeId" TEXT,
    "method" "public"."DeliveryMethodStatus" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settlements" (
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
    "status" "public"."SettlementPaymentStatus" NOT NULL DEFAULT 'Pending',
    "paidAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT,
    "voucherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
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
CREATE TABLE "public"."ShopifySession" (
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
CREATE TABLE "public"."AppInstallation" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GiftCard" (
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

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "public"."Brand"("brandName");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_domain_key" ON "public"."Brand"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "public"."Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BrandTerms_brandId_key" ON "public"."BrandTerms"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBanking_brandId_key" ON "public"."BrandBanking"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherCode_code_key" ON "public"."VoucherCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherCode_shopifyGiftCardId_key" ON "public"."VoucherCode"("shopifyGiftCardId");

-- CreateIndex
CREATE INDEX "VoucherCode_orderId_idx" ON "public"."VoucherCode"("orderId");

-- CreateIndex
CREATE INDEX "VoucherCode_voucherId_idx" ON "public"."VoucherCode"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherCodeId_idx" ON "public"."VoucherRedemption"("voucherCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Occasion_name_key" ON "public"."Occasion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OccasionCategory_name_key" ON "public"."OccasionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "public"."Order"("userId");

-- CreateIndex
CREATE INDEX "Order_brandId_idx" ON "public"."Order"("brandId");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "public"."Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "DeliveryLog_orderId_idx" ON "public"."DeliveryLog"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryLog_status_idx" ON "public"."DeliveryLog"("status");

-- CreateIndex
CREATE INDEX "Settlements_brandId_idx" ON "public"."Settlements"("brandId");

-- CreateIndex
CREATE INDEX "Settlements_status_idx" ON "public"."Settlements"("status");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "public"."Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_voucherId_key" ON "public"."Wishlist"("userId", "voucherId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "public"."AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifySession_shop_key" ON "public"."ShopifySession"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "AppInstallation_shop_key" ON "public"."AppInstallation"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_shopifyId_key" ON "public"."GiftCard"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "public"."GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_shop_idx" ON "public"."GiftCard"("shop");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "public"."GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_customerEmail_idx" ON "public"."GiftCard"("customerEmail");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandContacts" ADD CONSTRAINT "BrandContacts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandTerms" ADD CONSTRAINT "BrandTerms_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandBanking" ADD CONSTRAINT "BrandBanking_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vouchers" ADD CONSTRAINT "Vouchers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherCode" ADD CONSTRAINT "VoucherCode_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherCode" ADD CONSTRAINT "VoucherCode_shopifyGiftCardId_fkey" FOREIGN KEY ("shopifyGiftCardId") REFERENCES "public"."GiftCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherCode" ADD CONSTRAINT "VoucherCode_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "public"."VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OccasionCategory" ADD CONSTRAINT "OccasionCategory_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "public"."Occasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customCardId_fkey" FOREIGN KEY ("customCardId") REFERENCES "public"."CustomCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "public"."Occasion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_receiverDetailId_fkey" FOREIGN KEY ("receiverDetailId") REFERENCES "public"."ReceiverDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."OccasionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryLog" ADD CONSTRAINT "DeliveryLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryLog" ADD CONSTRAINT "DeliveryLog_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "public"."VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Settlements" ADD CONSTRAINT "Settlements_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
