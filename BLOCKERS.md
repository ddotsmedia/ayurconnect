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

## Doctor viral growth sprint (2026-06-30, third pass)

### Shipped this round (small, atomic, high-leverage)
- **Digital visiting card** at `/doctors/[id]/card`: server-rendered printable card with deterministic SVG QR (Kerala-green), profile-photo or initials avatar, qualification + specialty + district + workplace + verified badge. WhatsApp share + print-friendly @page CSS (3.5"x2"). robots: noindex.
- **/write-for-us SEO landing**: full audience-landing page (FAQPage + WebPage schema, speakable, max-snippet) authored by Sonnet — direct hook for BAMS/MD doctors who want bylined articles, ~600-word body + 5 FAQs.
- **/doctors/colleges hub + 10 college alumni pages** at `/doctors/colleges/[slug]`: GAC Thiruvananthapuram, GAC Thrissur, VPSV Kottakkal, Amrita Ernakulam, AVS Kottakkal, Ashtamgam Vaikom, PK Das Palakkad, Mar Baselios Pathanamthitta, SDM Udupi, BHU Varanasi. Each emits `CollegeOrUniversity` + BreadcrumbList schema, fetches alumni via existing `/api/doctors?collegeSlug=...` (already supported), gracefully degrades to "register as alumnus" CTA when no doctors match.
- **Profile share + visiting-card hooks** on `/doctors/[id]`: `Share profile` is now a real WhatsApp link (pre-filled with name + specialty + district + URL), new `Digital visiting card` link to `/doctors/[id]/card`.
- **Sitemap** updated: `/write-for-us` (0.8 monthly), `/doctors/colleges` (0.75 monthly), and all 10 college slugs (0.65-0.7 weekly).
- **Footer** AyurConnect column: + "Write for AyurConnect" link.

### Still deferred (heavy surface — needs dedicated PR)
- **Profile-edit dashboard** `/doctors/dashboard/profile`: 15+ Doctor fields editable (bio, qualification, photo upload, registration #, specializations, conditions, treatments, languages, location, consultation options, social links). Needs new Fastify route to mutate Doctor + storage policy for photo upload (S3 / MinIO / `/uploads/doctors`).
- **Doctor article publishing**: KnowledgeArticle has no `authorId` (only free-text `reviewedBy`). Adding bylined publishing needs a migration to add `authorUserId` + author resolution on render + editor UI + admin review queue extension. Existing `/admin/articles` route exists but flow is different.
- **Profile completeness score + soft-hide**: small Doctor-level computation, but the "soft-hide below 50%" gate needs server-side filtering in `/api/doctors` (touches the search handler), so deferred to avoid mid-flow side effects on the search UX.
- **Multi-step `/doctors/register` flow + Day-0/1/3/7 in-app tips**: existing register page is functional; redesigning the flow is a larger UX swap.
- **Condition-specific listing pages** (`/doctors/specialization/[s]`, `/doctors/location/[l]`, `/doctors/[s]/[l]`): some routes exist (`/ayurveda-doctors/[loc]`, `/doctors/in/[country]`); the brief's slug pattern is new and would create overlap — left for a single SEO-consolidation pass.
