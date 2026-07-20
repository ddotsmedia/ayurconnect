-- Doctor registration split: firstName + lastName + registrationNumber
-- Additive-only: all three columns are nullable, existing rows backfilled
-- from the current `name` column and `ksmcRegNumber` column. No NOT NULL
-- constraint added — the required-ness is enforced at the API/form layer
-- for NEW signups so the 39 existing rows aren't invalidated.

ALTER TABLE "Doctor"
  ADD COLUMN IF NOT EXISTS "firstName"          TEXT,
  ADD COLUMN IF NOT EXISTS "lastName"           TEXT,
  ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;

-- Backfill firstName + lastName from existing name column. Strategy:
--   1) Strip leading "Dr." / "Dr " (with or without period, case-insensitive)
--   2) Split on the FIRST whitespace run — everything before = firstName,
--      everything after = lastName
--   3) If the trimmed name has no space (single-word name), put whole thing
--      in firstName and NULL for lastName
UPDATE "Doctor"
SET
  "firstName" = COALESCE(
    "firstName",
    CASE
      WHEN split_part(regexp_replace(trim("name"), '^[Dd][Rr]\.?\s+', ''), ' ', 1) = ''
        THEN NULL
      ELSE split_part(regexp_replace(trim("name"), '^[Dd][Rr]\.?\s+', ''), ' ', 1)
    END
  ),
  "lastName"  = COALESCE(
    "lastName",
    NULLIF(
      trim(substring(
        regexp_replace(trim("name"), '^[Dd][Rr]\.?\s+', '')
        FROM position(' ' IN regexp_replace(trim("name"), '^[Dd][Rr]\.?\s+', '') || ' ')
      )),
      ''
    )
  )
WHERE "name" IS NOT NULL AND "name" <> '';

-- Backfill registrationNumber from ksmcRegNumber (the old single-column home
-- for state medical council numbers). Existing localRegNumber ignored — it's
-- a separate abroad-regulatory number.
UPDATE "Doctor"
SET "registrationNumber" = COALESCE("registrationNumber", "ksmcRegNumber")
WHERE "ksmcRegNumber" IS NOT NULL AND trim("ksmcRegNumber") <> '';

-- Query index on registrationNumber for admin verification lookups.
CREATE INDEX IF NOT EXISTS "Doctor_registrationNumber_idx"
  ON "Doctor" ("registrationNumber");
