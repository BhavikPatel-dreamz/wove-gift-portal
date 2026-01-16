-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'BRAND_MANAGER', 'SUPPORT', 'FINANCE');

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
CREATE TYPE "PayoutMethodStatus" AS ENUM ('EFT', 'wire_transfer', 'paypal', 'stripe', 'manual');

-- CreateEnum
CREATE TYPE "SettlementFrequencyStatus" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');

-- CreateEnum
CREATE TYPE "DeliveryMethodStatus" AS ENUM ('whatsapp', 'email', 'sms', 'print');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('Issued', 'PartiallyRedeemed', 'Redeemed', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SendStatus" AS ENUM ('sendImmediately', 'scheduleLater');

-- CreateEnum
CREATE TYPE "SettlementPaymentStatus" AS ENUM ('Pending', 'Paid', 'InReview', 'Disputed');

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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "currency" TEXT NOT NULL DEFAULT 'USD',
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
    "denominationCurrency" TEXT NOT NULL DEFAULT 'USD',
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
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "customImageUrl" TEXT,
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLog" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

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
CREATE INDEX "DeliveryLog_orderId_idx" ON "DeliveryLog"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryLog_status_idx" ON "DeliveryLog"("status");

-- CreateIndex
CREATE INDEX "Settlements_brandId_idx" ON "Settlements"("brandId");

-- CreateIndex
CREATE INDEX "Settlements_status_idx" ON "Settlements"("status");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_voucherId_key" ON "Wishlist"("userId", "voucherId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifySession_shop_key" ON "ShopifySession"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "AppInstallation_shop_key" ON "AppInstallation"("shop");

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

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_voucherCodeId_fkey" FOREIGN KEY ("voucherCodeId") REFERENCES "VoucherCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlements" ADD CONSTRAINT "Settlements_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
