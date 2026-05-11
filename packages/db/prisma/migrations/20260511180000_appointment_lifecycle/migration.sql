-- Tier A booking-loop lifecycle fix.
-- New columns capture doctor decisions (accept/decline/propose) + reminder
-- timestamps so the cron can dedupe + a flag for the post-appointment
-- review prompt.

ALTER TABLE "Appointment"
  ADD COLUMN "declineReason"   TEXT,
  ADD COLUMN "proposedAt"      TIMESTAMP(3),
  ADD COLUMN "reminded24hAt"   TIMESTAMP(3),
  ADD COLUMN "reminded1hAt"    TIMESTAMP(3),
  ADD COLUMN "reviewPrompted"  BOOLEAN NOT NULL DEFAULT false;

-- Index supports the reminder cron's "find appointments due in the next
-- 24h-window" query.
CREATE INDEX "Appointment_dateTime_status_idx" ON "Appointment" ("dateTime", "status");
