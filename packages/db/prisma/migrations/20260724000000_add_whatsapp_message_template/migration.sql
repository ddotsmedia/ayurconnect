-- WhatsApp message templates for the shared <WhatsAppMessagePicker>.
-- Additive-only: single new table, no changes to existing schema.

CREATE TABLE IF NOT EXISTS "WhatsAppMessageTemplate" (
  "id"        TEXT NOT NULL,
  "context"   TEXT NOT NULL,
  "text"      TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WhatsAppMessageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WhatsAppMessageTemplate_context_sortOrder_idx"
  ON "WhatsAppMessageTemplate" ("context", "sortOrder");
