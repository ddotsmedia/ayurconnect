# Blockers / Notes

## Task 16 — Nginx security headers (deployed, note)
Headers added on the VPS via inline sed insertion in
`/etc/nginx/sites-available/ayurconnect` and reloaded with `nginx -s reload`.

Backup: `/etc/nginx/sites-available/ayurconnect.bak.20260615-152226`

Verified via `curl -sI https://ayurconnect.com/`:
- `x-frame-options: SAMEORIGIN`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `strict-transport-security: max-age=31536000; includeSubDomains; preload`
  (Cloudflare adds `preload`; we set only includeSubDomains)
- `permissions-policy: geolocation=(), microphone=(self), camera=(self), payment=(self), ...`
  (Cloudflare overrides our origin policy entirely; ours is harmless on the
  underlying server but the wire-level value is Cloudflare's. Acceptable —
  Cloudflare's policy is also restrictive.)

No repo change required; live on production node.

## Daily-return / SEO sprint (2026-06-30)

### Deferred to follow-up sprints (need DB migration + worker infra)
- **Streak + gamification** — needs UserStreak model + 8+ existing route hooks
- **Weekly email digest** (doctors/students/hospitals) — needs worker + email transport; outbound SMTP not configured
- **CME credit tracker** — needs CmeCredit model + cert-upload bucket policy
- **Doctor daily digest /doctors/today** — depends on DoctorProfileView aggregation + matching-engine on-demand reads
- **Hospital patient demand signals** — needs AnonymousSearchEvent table + recording in /doctors search handler
- **Forum category enhancements** — small UI tweak; left to a focused PR to avoid touching the Forum render path mid-sprint
- **Student study-buddy finder** — match logic + privacy/contact handoff design needed
- **PWA install prompt** — sw.js + manifest already exist; only prompt JS missing (low ROI vs. SEO build this round)

### Shipped this round (concrete, no-migration)
/quick-reference, /learn/daily-challenge, /learn/exam-countdown,
/hospitals/compare, /for-doctors + 4 sub, /for-students + 3 sub,
/for-hospitals + 2 sub, 6 Malayalam audience pages, nav + sitemap updates,
hospital marketing toolkit extensions.

## Deferred-items sprint (2026-06-30, second pass)

### Shipped this round (with new Prisma migration)
- **Streak + gamification**: `UserStreak`, `PointLog`, `Referral` models + Fastify
  `/api/streak/{me,checkin,award,leaderboard}` + `<StreakCheckIn>` client +
  `/leaderboard` page + nav entry.
- **CME tracker UI**: `/doctors/cme` + `/api/cme` reusing the existing
  `CmeCredit` model (description ≈ event name, source ≈ category, sourceRefId
  ≈ certificate URL). No new migration needed.
- **/doctors/today**: drug-of-the-day (date-seeded formulation), MCQ-of-the-day
  (awards `daily_mcq` +10 once per UTC day), stats (streak / points / level /
  rank), recent jobs, latest article, referral link with WhatsApp share,
  quick links.
- **Hospital demand signals**: `AnonymousSearchEvent` model + `/api/search-events`
  + `/api/search-events/demand-signals?district=...`. Ready for dashboard wiring
  on the hospital side.
- **Study community**: `StudyThread` + `StudyReply` models +
  `/api/study-community/*` (threads, replies, upvote toggle, accepted answer) +
  `/learn/community` page.
- **Forum category enhancements**: added Clinical / Ask a Senior / Case
  Discussion / General to the existing CATEGORY map; sidebar counts now show
  them too. No schema change (existing `Post.category` is a free-form string).
- **PWA install prompt**: new `<InstallPrompt>` client in root layout.
  Reuses the existing `app/manifest.ts`; shows on mobile after 2nd visit;
  handles `beforeinstallprompt` (Android/Chrome) and iOS Share→Add-to-Home.
- **`User.weeklyDigestOptIn`**: new column (default `true`) ready for the
  weekly-digest worker.

### Still deferred (genuine infra gap)
- **Weekly email digest worker**: needs `apps/worker` app (does not exist) +
  BullMQ scheduler + `RESEND_API_KEY` on the VPS. Foundations in place:
  `apps/api/src/lib/email.ts` Resend wrapper exists; `User.weeklyDigestOptIn`
  now stored. Build a `apps/worker` package, register a BullMQ repeat job
  (cron `0 9 * * 1 Asia/Kolkata`), assemble 3 digest variants (doctor /
  student / hospital), and call `sendEmail()`.
- **Search-event recording from the doctor-search handler**: the new
  `POST /api/search-events` endpoint is live, but the existing /doctors
  search UI does not yet fire it. Wire in the next pass.
- **Hospital-dashboard demand-signals widget**: API ready, dashboard page
  needs the card.
- **Auto-redirect doctors to /today after login**: requires changes to the
  auth callback handler; deferred to avoid touching the sign-in flow mid-sprint.
