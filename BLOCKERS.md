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

## Advanced job-portal sprint (2026-06-30, fourth pass)

### Shipped this round (atomic, no schema migration)
- **4 SEO listing pages** at `/jobs/walk-in`, `/jobs/immediate-hiring`,
  `/jobs/freshers`, `/jobs/remote` — each is a thin wrapper around a shared
  `FilteredJobsList` component, server-fetches with the right filter query:
  - walk-in: `tag=walk-in` (uses existing `Job.tags[]`; no migration needed)
  - immediate-hiring: `urgent=1` (now supported by the jobs route handler)
  - freshers: `expMaxLte=2` (now supported — `expMin <= 2`)
  - remote: `remote=1` (already supported)
- **`/jobs/salary-calculator`** — client-side calculator with seeded
  benchmarks for 10 locations × 9 specializations × experience curve +
  qualification + license multipliers. Honest about being estimates.
- **Quick-filter strip** in /jobs hero (Walk-in / Urgent / Freshers /
  Remote / Locum / Salary calculator) + a secondary Trending row.
- **API extension**: `apps/api/src/routes/jobs.ts` now accepts `urgent`,
  `tag`, and `expMaxLte` query params (additive, no breaking change).
- **Sitemap**: +5 entries with appropriate priorities (0.85 daily for the
  listing pages, 0.8 monthly for the calculator).

### Still deferred (genuine schema/CRUD scope — need dedicated PRs)
- **Phase 1 — Doctor availability system extension**: CandidateProfile
  already has most of these fields (`availability`, `preferredLocations`,
  `expectedSalary`, `willingToRelocate`, `openToTelemedicine`,
  `openToLocum`). The brief asks for new ones (`availabilityType` enum,
  `noticePeriodDays`, `availableFrom`, `preferredCountries`,
  `preferredDistricts`, `minExpectedSalary`/`maxExpectedSalary`,
  `isOpenToNightShift`, `isOpenToWeekendOnly`, `profileVideoUrl`,
  `coverNote`). Additive migration is straightforward, but the UI
  rewrite of `/jobs/profile` to surface them all is the bigger item.
- **Phase 2 — Walk-in fields proper**: `isWalkIn`, `walkInDate`,
  `walkInTime`, `walkInVenue`, `walkInDocuments`, `contactPerson`,
  `contactPhone` on `Job`. The new `/jobs/walk-in` page works on the
  `walk-in` tag today; switch to the dedicated columns after the
  migration so we can render the date/venue/documents block per card.
- **Phase 3 — Bulk apply + saved searches**: bulk apply needs an
  endpoint mutating many `JobApplication` rows at once + per-job
  profile-completeness gate. Saved searches need a `SavedSearch` model +
  match-on-new-post cron + WhatsApp/email delivery.
- **Phase 4 — Video introduction upload**: requires storage policy +
  `profileVideoUrl` on `CandidateProfile` (additive) + upload UI.
- **Phase 5 — Application follow-up reminders + timeline**: needs
  BullMQ scheduled job for 7d / 14d follow-ups, plus a status-history
  table to render the timeline.
- **Phase 6 — Salary insight on /jobs/[id]**: cheap to add later (a
  small server query against active jobs with same specialty + country
  + experience band), but the brief asks for it on every job detail —
  defer for a dedicated round of detail-page work.
- **Phase 7 — Urgent-job WhatsApp burst + replacement finder**: needs
  WhatsApp messaging job + employer-side `/jobs/employers/find-replacement`
  page with real-time match query (high-touch UX, separate PR).
- **Phase 8 — Candidate pool**: new `CandidatePool` model + employer-side
  pool management UI.
- **Phase 9 — Job templates + bulk CSV + multi-location**: new
  `JobTemplate` model + CSV upload + per-location job-create loop.
- **Phase 10 — In-platform messaging**: new `Message` model + WhatsApp-style
  conversation UI on both sides.
- **Phase 11 — Advanced hiring analytics**: funnel chart needs a
  status-event log on `JobApplication`; competitor comparison needs
  industry aggregations.
- **Phase 12 — Two-way interest system**: new `InterestSignal` model +
  employer-views-candidate hook + notification flow.
- **Phase 13 — Smart recommendations with explanation**: the existing
  match engine returns scores; surfacing the per-factor breakdown on
  /jobs/[id] is small UI work, deferred until the messaging/notification
  surface lands so all candidate-facing surfaces ship together.

### Decision rationale
The 15-phase brief is ~50 hours of focused work end-to-end with at least
6 new Prisma models, 20+ new Fastify routes, and the same number of new
Next.js pages. Shipping atomic SEO + API filter extensions first because:
1. The 4 listing pages drive long-tail traffic immediately with zero
   schema cost.
2. The salary calculator is a high-conversion SEO + lead-gen page that
   stands alone.
3. The 3 new query params on `/api/jobs` (urgent / tag / expMaxLte) are
   reusable building blocks for the deferred features.

## Hospital offers/packages sprint (2026-06-30, fifth pass)

### Decision: reuse existing schema, ship public-discovery surface
The brief asked for a unified `HospitalPost` model with a `type`
discriminator. We already have:
- `HospitalPromotion` (title, subtitle, ctaLabel, ctaUrl, startsAt, endsAt, isActive)
- `TreatmentPackage` (name, description, duration, priceFrom/To, currency, includes, treatments, isFeatured)
- `HospitalInquiry` (full inquiry capture)
- `/hospital/dashboard/{marketing,packages,inquiries}` (already built)

Adding a new HospitalPost would duplicate those tables. Instead the
public-discovery layer aggregates both into `/offers`.

### Shipped this round
- **`GET /api/hospitals-public/offers`** — cross-hospital feed merging
  active HospitalPromotion (within validity window) + active
  TreatmentPackage. Supports `?type=promotion|package`, `?district=`,
  `?limit=`. No auth.
- **`/offers`** — public listing page; cards show promotion or package
  with hospital, price (packages), validity countdown (promotions
  ending in ≤7 days), inquire CTA. CollectionPage + per-package Offer
  schema, sitemap 0.9 daily.
- **`/offers/promotion/[id]`** — promotion detail with Offer schema
  (availabilityStarts/Ends, MedicalOrganization seller), WhatsApp
  share, embedded inquiry form posting to existing
  `/api/hospitals-public/:id/inquiry`.
- **`/offers/package/[idOrSlug]`** — package detail with price, duration,
  inclusions list (checkmarks), treatments chips, same inquiry form,
  Offer schema with price + currency + seller.
- **`InquiryForm` client** — name + phone + email + message → posts to
  existing inquiry endpoint; WhatsApp fallback link.
- **Nav**: + "Offers & Packages" under Hospitals group.
- **Footer** Find Care col: + "Offers & Packages".
- **Sitemap**: + /offers (0.9 daily).

### Deferred — needs dedicated PR
- **`HospitalFollow` model + notification flow**: new model + UI on
  hospital profile + push notification path. Substantial UI and
  notification-engine work.
- **`/hospital/dashboard/posts` unified composer**: existing
  `/hospital/dashboard/marketing` (HospitalPromotion CRUD with QR +
  embed badge) + `/hospital/dashboard/packages` already cover the
  posting paths. Unifying under one `/posts` UI is a redesign, not
  additive.
- **`/admin/hospital-posts` moderation page**: existing HospitalPromotion
  has `isActive` flag admins can toggle via the existing admin surface.
  Build a dedicated moderation queue only when content volume warrants.
- **WhatsApp-on-inquiry to hospital + notify-on-new-offer to followers**:
  needs Twilio job + opt-in flow. Foundations exist (`whatsapp.ts`
  wrapper).
- **Embedding "Latest offers" strips on /heal-in-kerala, /panchakarma,
  /hospitals**: trivial repeat work once we want to surface offers
  cross-site; not done this pass to avoid touching those pages.

The public surface is the high-leverage piece (drives the SEO discovery
that justifies hospitals posting in the first place). The hospital-side
posting tools already exist in `/hospital/dashboard/marketing` and
`/hospital/dashboard/packages`.
