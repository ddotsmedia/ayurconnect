# BLOCKERS — autonomous build log

## 2026-06-09 — VPS SSH port 22 timeout, deploy blocked

- Commits `f792c45` + `c1b9835` (doctor-directory expansion + route-collision fix) on `origin/main`, build is correct (typecheck pass; route-collision regression fixed: `/doctors/[country]` → `/doctors/in/[country]`).
- Last deploy attempt: GHA run `27186059417` — 3 reruns, all failed at the SSH preflight (`debug1: connect to address *** port 22: Connection timed out`).
- Pattern: recurring intermittent VPS-side SSH block (see [[prod-deploy]] memory note "2026-06-05 04:05 UTC: broke again; commit 16b8315 failed to ship. ... Cause is VPS-side firewall / fail2ban / provider-network — recurs and self-recovers.")
- Recovery (needs VPS console access — not doable from this terminal):
  1. Log into VPS provider dashboard (Contabo) for `194.164.151.202`
  2. Use web console / serial → `ufw status` / `iptables -L` / `fail2ban-client status sshd`
  3. Restore SSH allow rule or `fail2ban-client unban <gh-ip>`
  4. Then: `gh -R ddotsmedia/ayurconnect run rerun 27186059417 --failed`

## Deferred work (autonomous-build scope-down decisions)

### Credential PDF upload (MinIO presigned)
- Step 2 of the doctor-directory build called for "credentials upload: degree certificate, registration certificate, photo ID — stored securely using existing file storage".
- Shipped v1 = doctor-supplied URL refs (LinkedIn certificate post / Google Drive link). 3 new schema fields: `degreeCertUrl`, `regCertUrl`, `photoIdUrl`.
- v2 needs: MinIO presigned-upload UI, file-type + virus-scan + size cap, PHI-grade signed-URL retrieval for admin verifiers.

### "Are you an Ayurveda doctor?" subtle banner on public pages (step 8b)
- Would touch the homepage + other public pages outside the scope-cone.
- Deferred to keep minimal-diff. Same call-to-action exists in the new `/doctors/in/[country]` page bottom CTA + `/colleges/[slug]/alumni` bottom CTA + `/doctors/register` OG meta. WhatsApp/social-share funnels cover it.

### /doctors/[country]/[city] city-level sub-pages (step 7)
- Existing `/ayurveda-doctors/[location]` already covers UAE city pages (Dubai, Abu Dhabi, Sharjah).
- New `/doctors/in/[country]/[city]` would duplicate that surface. Deferred until editorial team wants distinct content per surface.

## 2026-06-09 — WhatsApp funnel (Phase 8): Twilio credentials not provisioned

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` are all empty in `apps/api/.env`.
- Shipped (functional once creds exist, safe no-op meanwhile):
  - Inbound webhook bot at `POST /api/whatsapp/inbound` (`apps/api/src/routes/whatsapp-webhook.ts`) — FAQ keyword bot + booking deep-link handoff (`/consult`), STOP/START opt-out handling.
  - Status endpoint `GET /api/whatsapp/status` reports whether outbound is configured.
  - Outbound `sendWhatsApp()` lib + appointment-reminder cron already existed (`apps/api/src/lib/whatsapp.ts`, `cron/appointmentReminders.ts`).
- To activate:
  1. Provision a Twilio WhatsApp sender; set the three env vars on the VPS.
  2. Twilio console → WhatsApp sender → "When a message comes in" → `https://ayurconnect.com/api/whatsapp/inbound` (POST).
  3. Submit + get approval for outbound template messages (booking confirmation, 24h/1h reminders, post-consult follow-up, Ritucharya seasonal nudge).
- Deferred until creds land: approved outbound template SIDs for the four template types in 8b (reminder cron is wired; templates need Twilio approval before they can send).
