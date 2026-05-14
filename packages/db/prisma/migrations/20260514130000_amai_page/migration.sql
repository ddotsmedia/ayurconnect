-- AMAI one-page microsite (/amai). Singleton AmaiPage row keyed by slug="amai"
-- plus three child tables for the editable repeating lists. Content sourced
-- from ayurveda-amai.org; populated by packages/db/prisma/seed-amai.ts.

CREATE TABLE IF NOT EXISTS "AmaiPage" (
  "id"               TEXT PRIMARY KEY,
  "slug"             TEXT NOT NULL DEFAULT 'amai',
  "orgName"          TEXT NOT NULL DEFAULT 'Ayurveda Medical Association of India',
  "shortName"        TEXT NOT NULL DEFAULT 'AMAI',
  "tagline"          TEXT NOT NULL DEFAULT '',
  "heroImageUrl"     TEXT,
  "logoUrl"          TEXT,
  "mission"          TEXT NOT NULL DEFAULT '',
  "aboutText"        TEXT NOT NULL DEFAULT '',
  "foundedInfo"      TEXT NOT NULL DEFAULT '',
  "strategicNote"    TEXT NOT NULL DEFAULT '',
  "membershipInfo"   TEXT NOT NULL DEFAULT '',
  "contactAddress"   TEXT NOT NULL DEFAULT '',
  "contactPhone"     TEXT NOT NULL DEFAULT '',
  "contactEmail"     TEXT NOT NULL DEFAULT '',
  "websiteUrl"       TEXT NOT NULL DEFAULT '',
  "registrationInfo" TEXT NOT NULL DEFAULT '',
  "copyrightText"    TEXT NOT NULL DEFAULT '',
  "published"        BOOLEAN NOT NULL DEFAULT true,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "AmaiPage_slug_key" ON "AmaiPage"("slug");

CREATE TABLE IF NOT EXISTS "AmaiOfficeBearer" (
  "id"        TEXT PRIMARY KEY,
  "pageId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "position"  TEXT NOT NULL,
  "category"  TEXT NOT NULL DEFAULT 'executive',
  "photoUrl"  TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AmaiOfficeBearer_pageId_fkey" FOREIGN KEY ("pageId")
    REFERENCES "AmaiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AmaiOfficeBearer_pageId_sortOrder_idx"
  ON "AmaiOfficeBearer"("pageId", "sortOrder");

CREATE TABLE IF NOT EXISTS "AmaiMilestone" (
  "id"          TEXT PRIMARY KEY,
  "pageId"      TEXT NOT NULL,
  "year"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AmaiMilestone_pageId_fkey" FOREIGN KEY ("pageId")
    REFERENCES "AmaiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AmaiMilestone_pageId_sortOrder_idx"
  ON "AmaiMilestone"("pageId", "sortOrder");

CREATE TABLE IF NOT EXISTS "AmaiListItem" (
  "id"        TEXT PRIMARY KEY,
  "pageId"    TEXT NOT NULL,
  "section"   TEXT NOT NULL,
  "text"      TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AmaiListItem_pageId_fkey" FOREIGN KEY ("pageId")
    REFERENCES "AmaiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AmaiListItem_pageId_section_sortOrder_idx"
  ON "AmaiListItem"("pageId", "section", "sortOrder");
