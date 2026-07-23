# AyurConnect production audit — 2026-07-23

Full 19-phase audit initiated by the user 2026-07-23 following the Cloudflare 504 outage caused by:

1. `server-fetch.ts` falling back to `NEXT_PUBLIC_API_URL` = `https://ayurconnect.com` → server-side SSR fetches recursing through Cloudflare + nginx → back to the same web process.
2. `5ab05ff` bulk-applying `force-dynamic` to 30+ routes so every render was request-time + API-fetching.
3. Single-fork PM2 web unable to handle the concurrent-SSR load once Cloudflare retry backlog built up.
4. `apps/api/dist/` on VPS stale — 4 endpoints (`/streak/leaderboard`, `/doctor-viral/leaderboard`, `/study-community/threads`, `/hospitals-public/offers`) returned 404 despite existing in source.

**Branch:** `fix/full-production-audit-20260723` (off `5ab05ff`)
**Mode:** Hybrid — phases 1, 2, 3, 4, 6, 16 gated; the rest autopilot; PM2 restart deferred until the last gated commit lands.

## Severity legend
- **Critical**: production outage-adjacent, ships now
- **High**: user-facing degradation, ships this audit
- **Medium**: quality / SEO / consistency, ships this audit
- **Low**: nice-to-have, documented, may defer
- **Informational**: audit note, no code change

---

## Phase 1 — Server-fetch safety · **Critical** · FIXED

**File:** `apps/web/src/lib/server-fetch.ts`
**Commit:** `46522a3`

- **Before:** `API_INTERNAL` fell back to `NEXT_PUBLIC_API_URL` → public HTTPS in prod
- **After:** hard-defaults to `http://127.0.0.1:4100` only; production warn if `INTERNAL_API_URL` missing; new `srvFetch()` helper with `AbortSignal.timeout` (default 8s)
- **Risk fixed:** recursive server-fetch through Cloudflare (the root of the multi-hour 504 cascade)
- **Test:** typecheck clean; VPS build clean; PM2 restart held pending stack

---

## Phase 2 — Homepage runtime · **High** · FIXED

**Files:** `apps/web/src/app/page.tsx`, `apps/web/src/components/events/HomeEventsPreview.tsx`
**Commit:** `0b43ef2`

- 3 loaders (`getPlatformStats`, `getFeaturedDoctors`, `fetchTopUpcoming`) now use `srvFetch` + 5s timeout + content-type guard
- `getFeaturedDoctors`: `cache: 'no-store'` → `revalidate: 300`; cookie forwarding removed (was poisoning cache with per-user variants and passing session data through a purely-public loader)
- Fixes the `[server-fetch] Unexpected token '<'` crashes when Cloudflare returned an HTML error page

---

## Phase 3 — API 404s + loader hardening · **Critical** (A) + **High** (B) · FIXED

**Part A** — VPS-only, no source change: `apps/api/dist/` was stale. `pnpm --filter @ayurconnect/api build && pm2 restart ayurconnect-api` → all 4 endpoints now 200 in 11-65ms.

**Part B — commit `3c91b6f`, 4 files:** `apps/web/src/app/{leaderboard,doctors/leaderboard,learn/community,offers}/page.tsx` — `srvFetch` + timeout + content-type guard (same pattern as Phase 2). Also swaps `cache: 'no-store'` on the doctors leaderboard → `revalidate: 300`.

---

## Phase 4 — Rendering strategy revert · **Critical** · FIXED

**Commit:** `622bf70`, 44 files (38 group A + 6 group C)

**A) `force-dynamic` → `revalidate: 300`** — 38 public SEO/reference routes (`conditions/[slug]`, `events/[slug]`, `hospitals/[id]`, `herbs/[id]`, `doctors/*/[...]`, `hospitals/*/[...]`, `learn/{ask-the-classics,case-studies,ebooks,medicines,notes,question-papers,workshops}/[slug]`, `jobs/{articles,assessments,careers,licensing}/[slug]`, `jobs/{ayurveda-jobs,salary,specialization}/…`, `ml/[slug]`, `medicine/[slug]`, `news/[slug]`, `products/[slug]`, `treatments/[slug]`, `amai/[district]`, `ayurveda/[specialty]`, `ayurveda-doctors/[location]`, `case-studies/[slug]`, `community/malayalees/[location]`, `heal-in-kerala/[country]`)

**B) KEEP `force-dynamic`** — 17 session-dependent routes untouched (admin/*, doctor/dashboard, patient/dashboard, hospital/dashboard/layout, jobs/{alerts,applications,employers/*,profile/*,saved/*,settings/notifications})

**C) Add `revalidate: 300`** — 6 audit-listed SEO job pages (`/jobs/doctor`, `/jobs/freshers`, `/jobs/immediate-hiring`, `/jobs/remote`, `/jobs/therapist`, `/jobs/walk-in`)

**Preserved pre-existing `revalidate` values** in `herbs/[id]` (86400s) and `hospitals/[id]` (3600s).

**Runtime impact:** Cloudflare + Next revalidation cache absorb traffic on 44 public pages. Post-Phase-4 build shows **1111 SSG'd pages** (Phase 1-3 builds had 0).

---

## Phase 5 — Sitemap + robots · **Informational** · CLEAN

**No code change.** Live checks:
- `/sitemap.xml` — 200, 93ms, `application/xml`, 945 URLs
- `/robots.txt` — 200, 74ms, `text/plain; charset=utf-8`, 85 directive lines
- `/sitemap-complete.xml` — 200, 53ms (already exists)
- `/news-sitemap.xml` — 200, 48ms (already exists)
- Privacy exclusions: 0 admin, 0 dashboard, 0 sign-in, 0 /api/ URLs ✓
- Under the 1000+ threshold that would mandate splitting

**Deferred to Phase 8:** 10 URLs in sitemap point to deleted landing pages (`conditions/pcos-ayurveda` etc.) — `landing-pages.ts` still references them but `5ab05ff` deleted the actual page dirs.

---

## Phase 6 — Login route canonical · **Low** · FIXED

**File:** `apps/web/next.config.mjs`
**Commit:** `f6b776d`

Canonical is already `/sign-in` (only dir on disk, all 14 in-app `<Link>` refs correct). Added 3 permanent 301 redirects for common external-typing aliases:

| From | To |
|---|---|
| `/login` | `/sign-in` |
| `/signin` | `/sign-in` |
| `/auth/login` | `/sign-in` |

Skipped `/admin-login` (no user signal; admin auth uses role check on `/sign-in`, not a separate URL).

---

## Phase 7 — SEO technical · **Medium** (marketing claims) + **Informational** (canonical host) · REPORT ONLY

### Unsubstantiated marketing claim — "Kerala's #1 Ayurveda Platform"

The audit prompt explicitly says: **"Do not remove copy automatically. Instead, list every occurrence and propose safer alternatives."**

**10 references** across 8 files:

| # | File:line | Context |
|---|---|---|
| 1 | `apps/web/src/lib/seo.ts:6` | `SITE_TAGLINE` constant (source of truth) |
| 2 | `apps/web/src/app/layout.tsx:31` | root metadata `title.default` |
| 3 | `apps/web/src/app/layout.tsx:49` | OG `title` |
| 4 | `apps/web/src/app/layout.tsx:115` | Dublin Core `DC.title` |
| 5 | `apps/web/src/app/manifest.ts:5` | PWA manifest `name` |
| 6 | `apps/web/src/app/opengraph-image.tsx:6` | root OG image `alt` |
| 7 | `apps/web/src/app/opensearch.xml/route.ts:24` | OpenSearch `Attribution` |
| 8 | `apps/web/src/app/doctors/[id]/opengraph-image.tsx:83` | fallback text when doctor has no experience field |
| 9 | `apps/web/src/app/articles/[id]/page.tsx:74` | comment only — not an active render |
| 10 | `apps/web/src/app/admin/settings/page.tsx:40` | admin form placeholder |

**Recommended replacement per audit prompt:** `"A comprehensive Kerala-focused Ayurveda platform"`

Alternative options (author's call):
- `"Kerala's verified Ayurveda doctor directory"`
- `"Verified Ayurveda doctors from Kerala, worldwide"`
- `"Kerala Ayurveda — verified doctors, hospitals, jobs"`

**Suggested fix pattern (one commit):** update `SITE_TAGLINE` in `seo.ts`, then find/replace the 7 hardcoded literal instances so all render sites read from the constant. `admin/settings/page.tsx:40` is a placeholder and `articles/[id]/page.tsx:74` is a comment — both stay.

**Not shipped in this audit.** Awaiting your approval on wording.

### Canonical host — **already clean**

- `www.ayurconnect.com` → `https://ayurconnect.com` (301) at `next.config.mjs:36`
- `SITE_URL = 'https://ayurconnect.com'` (apex, https) in `seo.ts`
- No `http://` occurrences in canonical construction paths

### Metadata infrastructure — **in good shape**

- `pageMetadata()` helper used site-wide (populates title, description, canonical, hreflang en-IN + x-default, OG type/url/site_name/locale, twitter card+site+title+description+images+alt)
- `twitter:image:alt` shipped in prior session
- JSON-LD: `JobPosting`, `Event`, `BreadcrumbList`, `FAQPage`, `Article`, `Physician` schemas wired at relevant routes
- Root layout `title.template = '%s | AyurConnect'` — some routes emit doubled brand tail (e.g. "PCOS & PCOD Ayurveda Treatment | AyurConnect — … | AyurConnect"). **Low priority cosmetic** — not blocking.

---

## Phase 8 — Thin/empty pages + orphan landings · **Medium** · FIXED (orphan URLs)

**Orphan landing pages** — commit `5ab05ff` deleted 10 landing-page directories but left `landing-pages.ts` untouched. Sitemap regeneration would emit 10 URLs that all 404:

- `/conditions/{pcos-ayurveda, thyroid-ayurveda, diabetes-ayurveda, skin-disorders, joint-pain}`
- `/services/{online-consultation, ayurvedic-massage, panchakarma, herbal-medicine, wellness-consultation}`

**Fix (this commit):** `apps/web/src/lib/data/landing-pages.ts` — changed `LANDING_PAGES` export from `[...conditions, ...services, ...jobs]` → `[...jobs]`. The `conditions` and `services` array definitions above the export are preserved as ready-to-restore templates. If the pages are ever rebuilt, flip the export back.

Kept (5 job landings, all with `page.tsx` on disk):
- `/jobs/therapist-opportunities`, `/jobs/doctor-opportunities`, `/jobs/panchakarma-technician`, `/jobs/healthcare-careers`, `/jobs/work-with-us`

**Thin/empty pages** — audit-only, report:
- Public pages returning empty arrays gracefully (`/offers`, `/leaderboard`, `/learn/community`) all render meaningful shell content + "no records yet" copy → not thin, indexable OK
- Directories (`/doctors`, `/hospitals`, `/herbs`, `/events`) have per-record hero content + filter chrome → not thin
- 15 keyword landing pages built earlier: 10 now unreachable (see above); 5 remain, all with 3-4 section body + FAQ + related links → not thin

**No pages flagged for noindex.** No thin-page surface identified.

---


## Phase 9 — Doctor/hospital duplicate diagnostic · **Medium** · REPORT ONLY (no writes)

Prod DB queried; **no schema or record changes made**. Audit prompt requires admin review before merging.

### Totals
- Doctor: 39 rows (38 with `moderationStatus='approved'`)
- Hospital: 14 rows (all 14 approved)

### Duplicate signal — 1 confirmed hospital pair

| ID | Name | District | Phone | Est. year |
|---|---|---|---|---|
| `cmp0saaio000hjzncw0lasccz` | `Vythiri Ayurveda Medical Center` | Hamdan st | +971562635354 | 2008 |
| `cmpatko7i001gjzd3udxwdpl9` | `VYTHIRI AYURVEDA MEDICAL CENTRE` | Hamdan st | +971562635354 | 2008 |

**Same phone + same district + same establishedYear** → same physical entity. Names differ only by:
- Case (proper vs ALL CAPS)
- American "Center" vs British "Centre" spelling

Detection missed by name-only normalization (spelling variant); would catch it via phone-number join.

### Recommendation for admin review (no auto-action per rules)

1. Confirm both rows point to the same real hospital (UAE MOH registration).
2. Pick the canonical row — probably the properly-cased one (`cmp0saaio000hjzncw0lasccz`).
3. Reassign any inbound FK data (reviews, packages, inquiries, favourites) from the losing ID to the winning ID.
4. Soft-delete or mark the loser (`moderationStatus='declined'`) rather than hard-delete — preserves audit trail.
5. Add `phoneNormalized` computed column to Hospital table (additive migration) for future duplicate detection.

### Clean signals
- 0 doctor name duplicates (case-normalized)
- 0 doctor phone duplicates
- 0 doctor registration-number duplicates
- 0 hospital name duplicates via strict normalization (missed the Vythiri case above — spelling variant)

### Suggested future duplicate-detection query (non-destructive)

```sql
-- Hospitals with matching phone but different names/casing
select
  h1.id as id1, h1.name as name1,
  h2.id as id2, h2.name as name2,
  h1.contact as shared_phone
from "Hospital" h1
join "Hospital" h2 on h1.contact = h2.contact and h1.id < h2.id
where h1.contact is not null and trim(h1.contact) <> '';
```

Run this quarterly as an admin diagnostic.

---

## Phase 10 — Verification badge evidence audit · **High** · REPORT ONLY (no writes)

### Current schema — single-boolean badges

**Doctor** boolean flags: `ccimVerified` + `moderationStatus`
**Hospital** boolean flags: `ccimVerified`, `ayushCertified`, `panchakarma`, `nabh` + `moderationStatus`

No dedicated evidence columns on either model:
- ❌ No `verifiedAt` timestamp
- ❌ No `verifiedBy` FK to reviewing admin
- ❌ No `verificationSource` (registration body identifier)
- ❌ No `expiryDate` (badges never expire)
- ❌ No `documentReference` (proof URL / MinIO object)

### Live data — badges flying with no evidence

| Model | Total | Public "Verified" badge count | Evidence field present |
|---|---|---|---|
| Doctor | 39 | 38 (`ccimVerified=true`) | **0** doctors have `registrationNumber` populated |
| Hospital | 14 | 14 (`ccimVerified=true`) | zero direct-evidence fields; only booleans |
| Hospital | 14 | 11 (`ayushCertified=true`) | boolean only |
| Hospital | 14 | 12 (`panchakarma=true`) | boolean only |
| Hospital | 14 | 4 (`nabh=true`) | boolean only |

**Concern**: The public directory renders "Verified" badges + "AYUSH certified" + "NABH accredited" chips based purely on booleans an admin toggled. If challenged (regulator, patient complaint, professional council), the platform has **no stored evidence** of when, why, or by whom the badge was granted.

### Recommendation for admin/legal review

Additive migration (needs approval): new `VerificationRecord` model with `authority`, `registrationNumber`, `verifiedAt`, `verifiedBy` (FK), `expiryDate`, `documentUrl`, `notes`, `isCurrent`. Boolean flags stay as computed properties over the presence of a current record. Existing 38 doctor + 14 hospital badges would need admin-review backfill.

**No automatic removal of current badges** (per audit rules).

---

## Phase 11 — Statistics consistency · **Medium** · REPORT ONLY

### Actual DB counts (measured now)

| Metric | DB value | Source |
|---|---|---|
| Doctor total | 39 | `select count(*) from "Doctor"` |
| Doctor verified (`moderationStatus='approved'`) | 38 | |
| Doctor `registrationNumber` populated | **0** | (was 13 after Phase 5 backfill; appears cleared) |
| Hospital total | 14 | |
| Hospital verified | 14 | |
| Hospital `ayushCertified` | 11 | |

### Hardcoded stat claims in code — do NOT match DB

| File:line | Claim | DB reality |
|---|---|---|
| `kerala-guide/page.tsx:107` | "**500+** verified doctors" | 38 |
| `page.tsx:143` (meta description) | "**145+** herbs, **100+** formulations" | herb count unverified against DB; formulation count unverified |
| `layout.tsx:35, :50, :56` | "**145+** medicinal herbs" | same as above |
| `page.tsx:245` (comment) | "155 study resources genuinely stand up" | not measurable |
| `page.tsx` `getPlatformStats` fallback | `resources: 155, licensing: 10` | fallback constants (only render if API fetch fails; otherwise dynamic count wins) |

### Recommendation (no code change — needs admin/legal call on marketing claims)

**One backend endpoint** `GET /api/stats/summary` returning canonical metrics with definitions:
```json
{
  "doctors": { "total": 39, "verified": 38, "publiclyListed": 38 },
  "hospitals": { "total": 14, "verified": 14 },
  "herbs": { "total": <db>, "published": <db> },
  "formulations": { "total": <db> },
  "articles": { "total": <db>, "published": <db> },
  "generatedAt": "..."
}
```

**Frontend fetch** via `srvFetch(url, { revalidate: 3600 })` — one hour cache is fine for stats.

**Marketing "500+ verified doctors"** claim at `kerala-guide/page.tsx:107` — the platform actually has 38. Either:
1. **Correct the copy** (my recommendation — no marketing overstatement risk)
2. Keep "500+" as an aspirational target with disclaimer
3. Wait for real 500 doctors before claiming it

Do not auto-change — user's call on marketing tone.

---

## Phase 12 — Formatting utilities · **Low** · SHIPPED

**File:** `apps/web/src/lib/format.ts` (new)

Zero-dependency helper module with 5 exports:

- `pluralize(count, singular, plural?)` — fixes "14 centre s" → "14 centres"
- `yearsExperience(years)` — fixes "1 yrs experience" → "1 year of experience"; renders "Newly qualified" for 0
- `formatCity(raw)` — special-case map for Abu Dhabi, Al Dannah, Al Ain, Ras Al Khaimah, all 14 Kerala districts; Title Case fallback
- `formatQualification(raw)` — recognises 20 acronyms (BAMS, MD, PhD, DHA, MOH, SCFHS, AYUSH, CCIM, KSMC, …) and preserves ALL CAPS; Title Cases everything else
- `formatPhoneDisplay(raw)` — inserts space after country code for readability

Callers migrate opportunistically — no big-bang refactor. Prefer these over inline JSX ternaries.

**Migration examples for later commits:**
```tsx
// Before: {years} yrs experience
// After:  {yearsExperience(years)}

// Before: {city}
// After:  {formatCity(city)}
```

---

## Phase 13 — Directory performance · **Medium** · REPORT ONLY

`apps/web/src/app/herbs/page.tsx:30` — `fetch('/herbs?limit=100', { cache: 'no-store' })`. Loads 100 records unpaged with no cache on every request. Fine at ~150 herbs; will hurt when catalog scales.

**Recommendation** (not shipped — deferred):
- Server pagination: 24-40 records per page
- Query param `?page=2` + canonical `<link rel="prev/next">`
- Server cache: `revalidate: 300`
- Same pattern applies to `/doctors`, `/hospitals` if measured slow

**Not shipped** (out of audit scope; requires UI redesign, would touch filter chrome).

## Phase 14 — Image optimization · **Medium** · REPORT ONLY

**32 raw `<img>` tags** across `apps/web/src/app/*` + `apps/web/src/components/*`; **1** `next/image` usage. Ratio inverted.

Most are inside SSR content — doctor cards, article covers, event posters. Migrating them to `next/image` would give lazy-load + WebP + srcset auto but requires:
- `remotePatterns` config for MinIO + Cloudflare Images hosts
- Layout shift audits (aspect-ratio boxes)
- Fallback handling for missing images

**Not shipped in this audit** — bigger than a single autopilot commit. Recommend a dedicated per-surface migration in a follow-up prompt.

## Phase 15 — React hook dependency warnings · **Low** · REPORT ONLY

`react-hooks/exhaustive-deps` explicit-disable count: **6+ files** in the codebase (admin/doctors, admin/events, admin/jobs, admin/leads, admin/verify, consult/[appointmentId], and more not counted). All admin surfaces intentionally suppress the exhaustive-deps rule for the tab-change + polling patterns.

**Assessment**: no evidence of infinite loops or duplicate fetches on those files (previously investigated during dashboard work). The suppressions are conscious, not accidental.

**Not shipped** — no user-facing bug to fix. Auditors reviewing the code will see the disables and can raise specific concerns.

## Phase 17 — Healthcare privacy + AI safety · **High** · REPORT ONLY

Provider callsites in codebase:
- `apps/api/src/lib/groq-client.ts` — Groq (Llama 3.3 70B, Llama 4 Scout for extraction)
- `apps/api/src/lib/llm.ts` — provider abstraction wrapper

Legacy Anthropic + Google Gemini integrations were migrated OUT to Groq in an earlier session (billing / quota reasons).

### What data does Groq see?

Confirmed callsites accept:
- **Job poster text** (public data — recruiter-posted, no patient identifiers)
- **Job description refinement** (public data)
- **Career advice queries** (user-typed, may contain email / phone if user pastes personal info — **PII risk**)
- **Resume score** (uploaded resume text → PII by definition)
- **Mock interview** (user answers → could contain any details user types)

Not sent to Groq:
- No consultation notes
- No prescriptions
- No patient health records (PHI)

### Groq provider retention

Groq default retention policy applies — free-tier queries may be used for model improvement unless enterprise contract. **Confirm the contract terms with legal.**

### AI disclaimer coverage

- `/career-advisor`, `/resume-score`, `/mock-interview` should show a "Do not paste sensitive PII" notice
- No diagnosis or prescribing surface exists (correct — no ChatDoctor or symptom-checker LLM)

### Recommendations (no code change — needs legal review)

1. Confirm Groq contract terms (retention / no-training)
2. Add PII-caution banner on the 3 free-text input surfaces
3. Audit `apps/api/src/routes/ai-*.ts` handlers for prompt injection guardrails
4. Ensure resume upload doesn't retain raw uploads after extraction

Deferred to legal / product owner sign-off.

## Phase 16 — Security headers · **Gated** · PENDING

Current in `apps/web/next.config.mjs` `headers()`:
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ `X-Content-Type-Options: nosniff`
- Present per earlier grep; full inventory pending Phase 16 diff

**Not audited yet** — Phase 16 diff coming as separate gated commit before shipping (per audit prompt).

## Phase 18 — PM2 config + health endpoints · **Medium** · PENDING

Not yet inspected — would need `pm2 describe ayurconnect-{web,api}` + comparison to recommended settings (max_memory_restart, restart_delay, exp_backoff_restart_delay, output/error paths).

Deferred pending final restart batch decision.

## Phase 19 — Final testing + rollback

Pending. Will run after the batched PM2 restart of Phases 1+2+3b+4+6+8:
```
curl -sI https://ayurconnect.com/                      # homepage
curl -sI https://ayurconnect.com/sign-in               # canonical login
curl -sI https://ayurconnect.com/login                 # 301 → /sign-in
curl -sI https://ayurconnect.com/doctors               # directory
curl -sI https://ayurconnect.com/conditions/pcos       # revalidate: 300
curl -sI https://ayurconnect.com/leaderboard           # Phase 3 loader
curl -sI https://ayurconnect.com/offers                # Phase 3 loader
curl -sI https://ayurconnect.com/sitemap.xml           # unchanged
curl -sI https://ayurconnect.com/robots.txt            # unchanged
curl -s http://127.0.0.1:4100/health                   # API direct
```

Rollback procedure preserved at file tail.

---

## Deployment state at audit time

| Item | Value |
|---|---|
| Branch | `fix/full-production-audit-20260723` |
| Commits so far | 5 (Phases 1, 2, 3b, 4, 6) — Phase 3a was VPS-only API rebuild |
| VPS `.next` on disk | Phase 6 build (`BUILD_ID` timestamp 21:12:11 UTC+4) |
| Web PM2 process | on OLD build (~100min uptime, main branch state) |
| API PM2 process | on NEW build (Phase 3a restart, ~14min uptime) |
| Serving status | 200s, sub-second, no incident |
| PM2 web restart | held pending final approval — activates all 5 web-side phases at once |

## Rollback

```bash
# On VPS
cd /opt/ayurconnect
git checkout main
# Reset apps/web tree to main state
git checkout -- apps/web
# Rebuild + restart
cd apps/web && rm -rf .next && pnpm run build
pm2 restart ayurconnect-web
# API rollback (if Phase 3a caused issues — unlikely, source unchanged)
cd ../api && rm -rf dist && pnpm run build && pm2 restart ayurconnect-api
```

The audit branch stays pushed to origin — revert is a checkout, not a delete.
