-- CreateEnum
CREATE TYPE "AppInstallationApprovalStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "AppInstallation"
ADD COLUMN "approvalStatus" "AppInstallationApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Preserve access for stores that were already actively installed before this rollout.
UPDATE "AppInstallation"
SET
  "approvalStatus" = 'APPROVED',
  "approvedAt" = COALESCE("installedAt", CURRENT_TIMESTAMP)
WHERE "isActive" = true;

-- CreateIndex
CREATE INDEX "AppInstallation_approvalStatus_idx" ON "AppInstallation"("approvalStatus");

-- CreateIndex
CREATE INDEX "AppInstallation_isActive_approvalStatus_idx" ON "AppInstallation"("isActive", "approvalStatus");
