-- Curated YouTube health-education videos (/videos, /admin/health-videos).
CREATE TABLE IF NOT EXISTS "HealthVideo" (
  "id"              TEXT PRIMARY KEY,
  "title"           TEXT NOT NULL,
  "description"     TEXT,
  "youtubeUrl"      TEXT NOT NULL,
  "youtubeId"       TEXT NOT NULL,
  "thumbnailUrl"    TEXT,
  "category"        TEXT,
  "speaker"         TEXT,
  "speakerDoctorId" TEXT,
  "duration"        TEXT,
  "language"        TEXT NOT NULL DEFAULT 'en',
  "tags"            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "published"       BOOLEAN NOT NULL DEFAULT true,
  "featured"        BOOLEAN NOT NULL DEFAULT false,
  "sortOrder"       INTEGER NOT NULL DEFAULT 0,
  "viewCount"       INTEGER NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for the typical access patterns: list-published-by-sort,
-- filter-by-category, doctor-profile reverse lookup.
CREATE INDEX IF NOT EXISTS "HealthVideo_published_featured_sortOrder_idx"
  ON "HealthVideo"("published", "featured", "sortOrder");
CREATE INDEX IF NOT EXISTS "HealthVideo_category_published_idx"
  ON "HealthVideo"("category", "published");
CREATE INDEX IF NOT EXISTS "HealthVideo_speakerDoctorId_idx"
  ON "HealthVideo"("speakerDoctorId");

-- Soft FK to Doctor: SetNull on delete so videos survive a doctor's removal
-- (they're admin-curated content, not user-generated).
ALTER TABLE "HealthVideo"
  ADD CONSTRAINT "HealthVideo_speakerDoctorId_fkey"
  FOREIGN KEY ("speakerDoctorId") REFERENCES "Doctor"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
