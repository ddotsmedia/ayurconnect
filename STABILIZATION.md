# Stabilization Checklist

Cold-take of the WIP on `main` (60+ modified files, 9 unapplied migrations including the new `20260514120000_research_paper_embedding`). Work through this top-to-bottom before merging anything else.

## Run it as a script (recommended)

Everything in sections 1–3 + typecheck is automated by [scripts/stabilize.ps1](scripts/stabilize.ps1). It's idempotent — safe to re-run.

```powershell
pnpm stabilize
# or with Playwright e2e browsers (~200MB download, one-time):
pnpm stabilize -- -WithPlaywright
# or skip seeds when re-running after the first pass:
pnpm stabilize -- -SkipSeeds
```

The script stops at the first failure so you never land in a half-stabilized state. The manual steps below are kept as documentation / fallback if the script fails on your machine.

---

## 1. Apply pending migrations *(automated)*

```powershell
pnpm --filter @ayurconnect/db exec prisma migrate deploy
```

Migrations queued (newest last):

1. `20260512100000_directory_indexes`
2. `20260513000000_doctor_workplace_media`
3. `20260513000000_phase7_health_platform` — vitals, RPM, prescriptions, family
4. `20260513100000_phase8_qa_programs_formulary` — Q&A, programs, formulary
5. `20260513200000_phase9_moderation` — moderation flow + audit
6. `20260514000000_phase10_doctor_hub` — doctor portal (16 tables)
7. `20260514100000_testimonials`
8. `20260514110000_health_videos`
9. `20260514120000_research_paper_embedding` — pgvector column for RAG

Then regenerate the client:

```powershell
pnpm --filter @ayurconnect/db exec prisma generate
```

## 2. Run seeds *(automated)*

```powershell
pnpm --filter @ayurconnect/db exec tsx prisma/seed.ts            # base
pnpm --filter @ayurconnect/db exec tsx prisma/seed-phase8.ts     # programs/formulary/Q&A
pnpm --filter @ayurconnect/db exec tsx prisma/seed-phase10.ts    # doctor hub
pnpm --filter @ayurconnect/db exec tsx prisma/seed-articles.ts   # 20 articles
```

All seeds are upsert-based and idempotent. The `Testimonial` migration auto-seeds 3 stories; nothing to do there.

## 3. Smoke-test every new surface manually

Start the stack: `pnpm dev`. Open each, looking for 500s, blank states, broken images, and console errors:

- **Public:** `/`, `/online-consultation`, `/abu-dhabi`, `/dubai`, `/sharjah`, `/articles`, `/qa`, `/programs`, `/formulary`, `/second-opinion`, `/wellness-plans`, `/doctor-match`, `/videos`
- **Patient dashboard:** `/dashboard`, `/dashboard/vitals`, `/dashboard/rpm`, `/dashboard/prescriptions`, `/dashboard/family`
- **Doctor hub** (sign in as a `DOCTOR` user first):
  - `/dr` (portal home), `/dr/cases`, `/dr/cases/new`, `/dr/research`, `/dr/research/bookmarks`
  - `/dr/ai-research` — ask "ashwagandha for anxiety"; response should cite papers from the curated library
  - `/dr/cme`, `/dr/protocols`, `/dr/journals/[any-slug]`, `/dr/conferences/[any-slug]`
  - `/dr/interactions`
- **Admin:** `/admin/testimonials`, `/admin/health-videos` (create/edit/delete cycle to verify the testimonials-fallback fix is durable)

## 4. Promote yourself to a DOCTOR for the hub smoke

The hub requires `role IN ('DOCTOR', 'DOCTOR_PENDING', 'ADMIN')`. Sign up via `/auth/sign-up/email` first, then drop into psql and run the UPDATE:

```powershell
docker exec -it ayurconnect-postgres psql -U ayurconnect -d ayurconnect
```

At the `ayurconnect=#` prompt:

```sql
UPDATE "User" SET role = 'DOCTOR' WHERE email = '<your-email>';
\q
```

## 5. Watch the API log

The new `error-logger` plugin (`apps/api/src/plugins/error-logger.ts`) pino-logs every 4xx/5xx response with route + status + userId. As you click through, every 401/403/500 will surface — that's a triage list, not a clean state.

## 6. Commit in logical chunks

Don't `git add -A` one massive commit. Suggested split:

1. `db(phase7-10): new migrations + schema + seed scripts`
2. `feat(doctor-hub): /dr/* portal + 9 sub-routes + API`
3. `feat(health-platform): vitals + RPM + prescriptions + family + formulary + programs`
4. `feat(uae-cities): abu-dhabi/dubai/sharjah landing pages + doctor-match`
5. `feat(content): testimonials + health-videos + articles admin`
6. `feat(moderation): audit + moderation-flow + admin queues`
7. `chore(infra): error-logger plugin + auth centralization + CI workflow + smoke tests + RAG`

## 7. Install optional deps when you're ready

- **Playwright** (for smoke tests): `pnpm add -D -w @playwright/test && pnpm exec playwright install --with-deps chromium`
- **Sentry** (error tracking is wired but inert without): `pnpm --filter api add @sentry/node`, then set `SENTRY_DSN=...` in the API env.

## 8. Verify the recent fixes ship clean

- **Homepage testimonials:** delete all rows in `/admin/testimonials`; reload `/`; the "Stories of Healing" section should disappear entirely (no phantom rows).
- **AI Research auth:** sign in as a `DOCTOR`, go to `/dr/ai-research`, ask a question. Should return a cited response, not "sign in required".
- **RAG retrieval:** check the API log for `dr-ai-research retrieval` — `mode` should be `semantic` once papers have embeddings, falling back to `keyword` until the boot loop finishes.

## 9. Decide what to defer

Audit half-shipped routes and either finish or unlink from navigation:

- `/formulary` — admin CRUD exists? Linked from Doctor Hub but check the public path
- `/programs`, `/qa`, `/wellness-plans` — same audit
- `/abu-dhabi` / `/dubai` / `/sharjah` — content quality is critical for SEO; either polish or unship
- `/second-opinion` — fully wired or stub?

If unfinished, redirect to `/coming-soon` or remove from sitemap/footer/navbar to avoid SEO ghost pages.
