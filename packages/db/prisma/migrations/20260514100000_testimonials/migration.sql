-- Homepage Stories of Healing testimonials (admin-curated, not user-submitted).
CREATE TABLE IF NOT EXISTS "Testimonial" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "condition" TEXT,
  "initials"  TEXT,
  "stars"     INTEGER NOT NULL DEFAULT 5,
  "quote"     TEXT NOT NULL,
  "imageUrl"  TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Testimonial_published_sortOrder_idx"
  ON "Testimonial"("published", "sortOrder");

-- Seed with the three hard-coded testimonials previously rendered in
-- apps/web/src/app/page.tsx so the homepage stays populated on first deploy.
INSERT INTO "Testimonial" ("id", "name", "condition", "initials", "stars", "quote", "sortOrder")
VALUES
  ('seed-testimonial-1', 'Anita M.', 'Chronic migraine',  'AM', 5,
   '15 years of weekly migraines, gone after 21 days of Karkidaka Chikitsa under Dr. Kumar. AyurConnect made finding the right doctor effortless.', 10),
  ('seed-testimonial-2', 'James W.', 'Visited from UK',   'JW', 5,
   'Booked a 14-day Panchakarma at a Kochi centre. Authentic, classical, no spa-tourism nonsense. Came back transformed.', 20),
  ('seed-testimonial-3', 'Priya S.', 'PCOS, infertility', 'PS', 5,
   'Conceived after 4 months under Dr. Krishnan''s care. Years of failed modern treatments behind me. Forever grateful.', 30)
ON CONFLICT ("id") DO NOTHING;
