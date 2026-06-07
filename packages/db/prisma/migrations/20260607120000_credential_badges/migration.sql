-- ─── Verification badge ledger (renamed CredentialBadge to avoid colliding with
--     Better Auth's email Verification table). One row per (entity × badge type).

CREATE TABLE "CredentialBadge" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tier" TEXT,
    "referenceNumber" TEXT,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "entityNameCached" TEXT,
    "entityDistrictCached" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialBadge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CredentialBadge_entityType_entityId_badgeType_idx" ON "CredentialBadge"("entityType", "entityId", "badgeType");
CREATE INDEX "CredentialBadge_status_validUntil_idx"            ON "CredentialBadge"("status", "validUntil");
CREATE INDEX "CredentialBadge_entityType_status_idx"            ON "CredentialBadge"("entityType", "status");
CREATE INDEX "CredentialBadge_badgeType_tier_idx"               ON "CredentialBadge"("badgeType", "tier");
