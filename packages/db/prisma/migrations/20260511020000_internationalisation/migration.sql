-- ─── Internationalisation: country + state columns ─────────────────────
-- Existing rows are 100% Kerala India data; backfill country='IN' state='Kerala'
-- for Doctor + Hospital. User rows stay null (we don't know).

-- AlterTable User: add nullable country + state (we don't assume defaults for users)
ALTER TABLE "User" ADD COLUMN "country" TEXT,
                   ADD COLUMN "state"   TEXT;

-- AlterTable Doctor: country defaults 'IN'; backfill state='Kerala' for all existing rows
ALTER TABLE "Doctor" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'IN',
                     ADD COLUMN "state"   TEXT;
UPDATE "Doctor" SET "state" = 'Kerala' WHERE "state" IS NULL;

-- AlterTable Hospital: same backfill
ALTER TABLE "Hospital" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'IN',
                       ADD COLUMN "state"   TEXT;
UPDATE "Hospital" SET "state" = 'Kerala' WHERE "state" IS NULL;
