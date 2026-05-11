-- Lead capture: cost estimator, contact form, partnership/franchise enquiries.
-- Created 2026-05-11 alongside the corporate-trust + treatments page batch.

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_kind_status_createdAt_idx" ON "Lead"("kind", "status", "createdAt");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
