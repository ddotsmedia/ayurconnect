-- Additive metadata fields for KnowledgeArticle. The other 5 fields the
-- feature-set needs (featuredImage, seoTitle, seoDescription, readTimeMinutes,
-- shareCount) already exist on this table from the 2026-06-10 migration.
ALTER TABLE "KnowledgeArticle" ADD COLUMN IF NOT EXISTS "featuredImageAlt" VARCHAR(200);
ALTER TABLE "KnowledgeArticle" ADD COLUMN IF NOT EXISTS "seoKeywords"      TEXT;
