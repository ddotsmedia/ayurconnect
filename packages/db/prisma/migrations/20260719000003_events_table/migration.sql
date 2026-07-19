-- Admin-managed event listings (Ayurveda seminars, workshops, job fairs).
-- Distinct from existing AnalyticsEvent (page-view tracker) and from the
-- static EVENTS seed in apps/web/src/lib/data/events-seed.ts. Public /events
-- page merges DB rows + seed content until seed is fully migrated.
CREATE TABLE IF NOT EXISTS "EventListing" (
  "id"                TEXT         PRIMARY KEY,
  "title"             TEXT         NOT NULL,
  "description"       TEXT         NOT NULL,
  "imageUrl"          TEXT         NOT NULL,
  "imageAlt"          TEXT,
  "eventDate"         TIMESTAMP(3) NOT NULL,
  "eventEndDate"      TIMESTAMP(3),
  "location"          TEXT,
  "category"          TEXT         NOT NULL DEFAULT 'seminar',
  "organizer"         TEXT,
  "registrationLink"  TEXT,
  "isPublished"       BOOLEAN      NOT NULL DEFAULT FALSE,
  "createdBy"         TEXT         REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EventListing_isPublished_eventDate_idx" ON "EventListing" ("isPublished", "eventDate");
CREATE INDEX IF NOT EXISTS "EventListing_category_idx"              ON "EventListing" ("category");
