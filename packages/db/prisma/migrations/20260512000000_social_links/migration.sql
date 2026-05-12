-- Per-entity social links. Six optional URL columns on both Doctor and
-- Hospital — kept as separate columns (not JSON) so each can be:
--   • indexed if we ever want to search by domain
--   • validated independently at the API
--   • accessed type-safely from Prisma client
-- WhatsApp is intentionally NOT a column — it derives from existing `contact`
-- (E.164 → wa.me/<digits>) so we don't duplicate the phone number.

ALTER TABLE "Doctor"
  ADD COLUMN "websiteUrl"   TEXT,
  ADD COLUMN "linkedinUrl"  TEXT,
  ADD COLUMN "facebookUrl"  TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "twitterUrl"   TEXT,
  ADD COLUMN "youtubeUrl"   TEXT;

ALTER TABLE "Hospital"
  ADD COLUMN "websiteUrl"   TEXT,
  ADD COLUMN "linkedinUrl"  TEXT,
  ADD COLUMN "facebookUrl"  TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "twitterUrl"   TEXT,
  ADD COLUMN "youtubeUrl"   TEXT;
