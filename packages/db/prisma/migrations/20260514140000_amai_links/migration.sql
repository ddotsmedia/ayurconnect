-- AMAI social-media handles + related links. category="social" rows store the
-- platform key in `label`; category="other" rows store free-text display text.

CREATE TABLE IF NOT EXISTS "AmaiLink" (
  "id"        TEXT PRIMARY KEY,
  "pageId"    TEXT NOT NULL,
  "category"  TEXT NOT NULL DEFAULT 'other',
  "label"     TEXT NOT NULL,
  "url"       TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AmaiLink_pageId_fkey" FOREIGN KEY ("pageId")
    REFERENCES "AmaiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AmaiLink_pageId_category_sortOrder_idx"
  ON "AmaiLink"("pageId", "category", "sortOrder");
