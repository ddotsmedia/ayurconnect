-- Phase 11 — Doctor profile additions (2026-05-13)
-- workplace + workplaceUrl: current clinic / hospital affiliation
-- featuredArticles: showcase up to 10 authored / curated health articles
-- featuredPosts:    showcase up to 10 social posts (different from platform homepage URLs)

ALTER TABLE "Doctor"
  ADD COLUMN IF NOT EXISTS "workplace"        TEXT,
  ADD COLUMN IF NOT EXISTS "workplaceUrl"     TEXT,
  ADD COLUMN IF NOT EXISTS "featuredArticles" JSONB,
  ADD COLUMN IF NOT EXISTS "featuredPosts"    JSONB;
