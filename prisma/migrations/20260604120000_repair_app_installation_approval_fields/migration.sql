DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'AppInstallationApprovalStatus'
  ) THEN
    CREATE TYPE "AppInstallationApprovalStatus" AS ENUM ('PENDING', 'APPROVED');
  END IF;
END $$;

ALTER TABLE "AppInstallation"
ADD COLUMN IF NOT EXISTS "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "approvalStatus" "AppInstallationApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "AppInstallation_approvalStatus_idx"
ON "AppInstallation"("approvalStatus");

CREATE INDEX IF NOT EXISTS "AppInstallation_isActive_approvalStatus_idx"
ON "AppInstallation"("isActive", "approvalStatus");
