-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('Pending', 'Paid', 'InReview');

-- CreateEnum
CREATE TYPE "public"."deliveryMethodStatus" AS ENUM ('whatsup', 'email', 'print');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('Issued', 'Redeemed', 'Exparied', 'NotRedeemed');

-- CreateEnum
CREATE TYPE "public"."paymentStatus" AS ENUM ('COD', 'Stripe');

-- CreateEnum
CREATE TYPE "public"."SendStatus" AS ENUM ('sendImmediately', 'scheduleLater');

-- CreateEnum
CREATE TYPE "public"."SettelmentStatus" AS ENUM ('onRedemption', 'onPurchase');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('Fixed', 'Percentage');

-- CreateEnum
CREATE TYPE "public"."PolicyStatus" AS ENUM ('Retain', 'Share');

-- CreateEnum
CREATE TYPE "public"."DenominationStatus" AS ENUM ('staticDenominations', 'amountRange');

-- CreateEnum
CREATE TYPE "public"."expiryPolicyStatus" AS ENUM ('fixedDay', 'endOfMonth', 'absoluteDate');

-- CreateEnum
CREATE TYPE "public"."SettlementFrequencyStatus" AS ENUM ('monthly', 'weekly');

-- CreateEnum
CREATE TYPE "public"."payoutMethodStatus" AS ENUM ('EFT', 'ManualProcessing');

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
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isVerify" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "categorieName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isFeature" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL,
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
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandContacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrandTerms" (
    "id" TEXT NOT NULL,
    "settelementTrigger" "public"."SettelmentStatus" NOT NULL DEFAULT 'onRedemption',
    "commissionType" "public"."CommissionStatus" NOT NULL DEFAULT 'Percentage',
    "commissionValue" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL,
    "discount" INTEGER DEFAULT 0,
    "orderValue" INTEGER DEFAULT 0,
    "contractStart" TIMESTAMP(3) NOT NULL,
    "contractEnd" TIMESTAMP(3) NOT NULL,
    "goLiveDate" TIMESTAMP(3) NOT NULL,
    "renewContract" BOOLEAN NOT NULL DEFAULT false,
    "brackingPolicy" "public"."PolicyStatus" NOT NULL DEFAULT 'Retain',
    "brackingShare" INTEGER DEFAULT 0,
    "vatRate" INTEGER DEFAULT 0,
    "internalNotes" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vouchers" (
    "id" TEXT NOT NULL,
    "denominationype" "public"."DenominationStatus" NOT NULL DEFAULT 'staticDenominations',
    "addDenomination" JSONB,
    "maxAmount" INTEGER DEFAULT 0,
    "minAmount" INTEGER DEFAULT 0,
    "expiryPolicy" "public"."expiryPolicyStatus" NOT NULL DEFAULT 'fixedDay',
    "expiryValue" TEXT NOT NULL,
    "graceDays" INTEGER DEFAULT 0,
    "redemptionChannels" TEXT,
    "partialRedemption" BOOLEAN NOT NULL DEFAULT false,
    "Stackable" BOOLEAN NOT NULL DEFAULT false,
    "userPerDay" INTEGER,
    "termsConditionsURL" TEXT,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BrandBanking" (
    "id" TEXT NOT NULL,
    "settlementFrequency" "public"."SettlementFrequencyStatus" NOT NULL DEFAULT 'monthly',
    "dayOfMonth" INTEGER DEFAULT 0,
    "payoutMethod" "public"."payoutMethodStatus" NOT NULL DEFAULT 'EFT',
    "invoiceRequired" BOOLEAN NOT NULL DEFAULT false,
    "remittanceEmail" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "SWIFTCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandBanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Occasion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occasion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OccasionCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "occasionId" TEXT NOT NULL,

    CONSTRAINT "OccasionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReceiverDetail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ReceiverDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "occasionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sendType" "public"."SendStatus" NOT NULL DEFAULT 'sendImmediately',
    "deliveryMethod" "public"."deliveryMethodStatus" NOT NULL DEFAULT 'whatsup',
    "receiverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "giftCode" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "paymentMethod" "public"."paymentStatus" NOT NULL DEFAULT 'COD',
    "totalAmount" INTEGER DEFAULT 0,
    "redemptionStatus" "public"."RedemptionStatus" NOT NULL DEFAULT 'Issued',
    "timeStemp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settlements" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "totalSold" INTEGER NOT NULL,
    "Redeemed" TEXT NOT NULL,
    "Outstanding" INTEGER,
    "settlementTerms" TEXT NOT NULL,
    "Amount" INTEGER,
    "lastPayment" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "Settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "public"."Brand"("brandName");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandContacts" ADD CONSTRAINT "BrandContacts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandTerms" ADD CONSTRAINT "BrandTerms_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vouchers" ADD CONSTRAINT "Vouchers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrandBanking" ADD CONSTRAINT "BrandBanking_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OccasionCategory" ADD CONSTRAINT "OccasionCategory_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "public"."Occasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."ReceiverDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "public"."Occasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Settlements" ADD CONSTRAINT "Settlements_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
