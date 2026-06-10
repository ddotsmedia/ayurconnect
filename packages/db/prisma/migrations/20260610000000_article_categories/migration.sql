-- ─── ArticleCategory taxonomy + KnowledgeArticle feature fields ──────────

CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameMl" TEXT,
    "description" TEXT,
    "descriptionMl" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "articleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArticleCategory_slug_key"        ON "ArticleCategory"("slug");
CREATE INDEX        "ArticleCategory_isActive_sortOrder_idx" ON "ArticleCategory"("isActive", "sortOrder");

ALTER TABLE "KnowledgeArticle"
  ADD COLUMN "slug"              TEXT,
  ADD COLUMN "titleMl"           TEXT,
  ADD COLUMN "categoryId"        TEXT,
  ADD COLUMN "featuredImage"     TEXT,
  ADD COLUMN "readTimeMinutes"   INTEGER,
  ADD COLUMN "isFeatured"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isPinned"          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "viewCount"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "likeCount"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shareCount"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "seoTitle"          TEXT,
  ADD COLUMN "seoDescription"    TEXT,
  ADD COLUMN "relatedArticleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "reviewedBy"        TEXT,
  ADD COLUMN "reviewedAt"        TIMESTAMP(3),
  ADD COLUMN "publishedAt"       TIMESTAMP(3),
  ADD COLUMN "status"            TEXT NOT NULL DEFAULT 'published';

CREATE UNIQUE INDEX "KnowledgeArticle_slug_key"                       ON "KnowledgeArticle"("slug");
CREATE INDEX        "KnowledgeArticle_categoryId_language_idx"        ON "KnowledgeArticle"("categoryId", "language");
CREATE INDEX        "KnowledgeArticle_isFeatured_isPinned_publishedAt_idx" ON "KnowledgeArticle"("isFeatured", "isPinned", "publishedAt");
CREATE INDEX        "KnowledgeArticle_status_language_createdAt_idx"  ON "KnowledgeArticle"("status", "language", "createdAt");

ALTER TABLE "KnowledgeArticle" ADD CONSTRAINT "KnowledgeArticle_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
