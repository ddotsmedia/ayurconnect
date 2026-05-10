-- CreateTable
CREATE TABLE "WhatsAppAlertSubscription" (
    "id"             TEXT NOT NULL,
    "phone"          TEXT NOT NULL,
    "specialization" TEXT,
    "district"       TEXT,
    "source"         TEXT,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt"     TIMESTAMP(3),
    "consentAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAlertSubscription_phone_key"               ON "WhatsAppAlertSubscription"("phone");
CREATE INDEX        "WhatsAppAlertSubscription_isActive_lastSentAt_idx" ON "WhatsAppAlertSubscription"("isActive", "lastSentAt");
