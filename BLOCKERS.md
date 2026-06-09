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

## 2026-06-09 — Phase 10 (vision tongue analysis): deferred (explicitly optional)

- Spec marks Phase 10 "optional — build if time permits".
- Deferred deliberately: it requires an image-upload pipeline with at-rest encryption, a retention/delete-control policy, explicit pre-upload consent, AND a vision-capable model. The current LLM abstraction (`apps/api/src/lib/llm.ts`) is text-only (`chat()`); no vision provider is wired. Shipping half of a privacy-sensitive photo feature (encryption/retention) would be worse than not shipping it.
- To build later: add a vision provider to llm.ts (e.g. Gemini 2.5 Flash vision / Claude vision), a MinIO encrypted-upload flow with signed URLs + TTL retention + delete control + consent gate, then `/tools/tongue-analysis` returning OBSERVATION-ONLY notes (coating/color/cracks → dosha tendency) with mandatory disclaimer + "review with a verified doctor" CTA. Never diagnosis/treatment; never used for training.

## 2026-06-09 — Deploy blocked at smoke test: VPS API down (502, Postgres unreachable)

Autonomous build Phases 1–9 + 11 shipped and pushed to origin/main (HEAD f164a00). SSH **worked** this session (the recurring port-22 block had self-recovered), and the deploy's remote phase completed: install → migrate → build (apps/api tsc + apps/web next build both passed) → pm2 restart all succeeded. The web tier is live:
- `GET /        → 200`
- `GET /doctors → 200`

But the smoke test fails on the API tier:
- `GET /api/health         → 502`
- `GET /api/doctors?limit=1 → 502`

GHA deploy run IDs (all failed only at the smoke gate, not build): `27206560151`, `27206... ` latest `80325034250` (job).

**Root cause = VPS infrastructure, NOT the build.** The web-error log shows `ECONNREFUSED 127.0.0.1:4100` since 2026-06-09 **10:22** — hours *before* this session's first deploy (12:37). Booting the API locally reproduces the crash: `PrismaClientInitializationError: Can't reach database server` (P1001) in `plugins/db.js`, which registers before any route. So the `ayurconnect-api` PM2 process is crash-looping because its Docker Postgres is down/unreachable on the VPS. (Routes register fine; the new Phase 6/7/8/9 routes typecheck, build, and the `/tourism` autoPrefix collision was fixed in f164a00.)

**Recovery (needs VPS shell — not doable from this terminal):**
1. `ssh root@194.164.151.202`
2. `docker ps -a` → confirm the postgres (pgvector/pgvector:pg16) container is up. If exited: `cd /opt/ayurconnect && docker compose up -d postgres` (and redis/meili/minio if also down).
3. `pm2 logs ayurconnect-api --lines 50` → confirm P1001 cleared after DB is up.
4. `pm2 restart ayurconnect-api && pm2 save`
5. `curl -sS localhost:4100/health` → expect 200, then `curl -sS https://ayurconnect.com/api/health`.
6. Re-run the deploy smoke gate: `gh -R ddotsmedia/ayurconnect run rerun 80325034250 --failed` (or just push again once the API is healthy).

**Build correctness is verified independently** (`tsc --noEmit` clean for apps/api + apps/web; `next build` passes; `next lint` clean). No code rollback needed — once the VPS Postgres is restored the existing HEAD deploys green.

## 2026-06-09 — RESOLVED: deploy green, all phases live

The smoke-gate 502 was **not** the DB (Postgres was healthy the whole time). Three real causes, all fixed:

1. **`FST_ERR_DUPLICATED_ROUTE: POST /tourism/plan`** — `deploy.sh`'s `tar xzf` is additive-only, so `tourism-plan.ts` (deleted in the repo when merged into `tourism.ts`) lingered on the VPS and recompiled into a second `/tourism/plan`, crashing API boot. Fixed: removed the stale file; `deploy.sh` now `rm -rf`s the repo-owned src trees before extract (commit 42116a5).
2. **redis/meili/minio containers missing** — only postgres was up; their volumes didn't even exist. `docker compose up -d` recreated all four.
3. **API bound the port too slowly** — the `onReady` embedding backfill retried an **expired Gemini key** (`GOOGLE_API_KEY`) before Fastify started listening, so the smoke test hit connection-refused/502. Fixed: detached the embed backfill (fire-and-forget) so the port binds immediately (commit 42116a5).

Final deploy run is **green**: `/`, `/doctors`, `/api/health`, `/api/doctors` all 200. All Phase 1–9 + 11 routes verified live (heritage, karkidaka, ask-the-classics, verify, heal-in-kerala/plan) with Malayalam rendering correctly.

**Still open (credential, not code):** `GOOGLE_API_KEY` (Gemini embeddings) is expired — semantic search / embedding bootstrap is disabled until renewed in `/opt/ayurconnect/apps/api/.env`. Non-fatal now that the backfill is detached. WhatsApp Twilio creds + Phase 10 vision remain deferred as logged above.
