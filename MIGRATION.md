# AyurConnect → New VPS (Coolify + Docker) Migration Plan

Target end state: `ayurconnect.com` served from a new VPS running Coolify,
with `apps/api` + `apps/web` as Docker containers, Postgres + Redis +
MinIO + Meilisearch as Coolify-managed services, and auto-deploy on
`git push origin main`.

**Non-negotiables**:
- Zero Postgres data loss.
- ≤ 5 min production downtime at the DNS flip.
- Full rollback at every phase — the OLD VPS stays untouched for a
  7-day recovery window.
- No changes to `ddots-*`, `wa-crm-*`, `trade-route` on the OLD VPS
  (they keep running there).

---

## Phase 0 · Prep + Inventory (do this first, on OLD VPS)

Never migrate anything you haven't inventoried. On the OLD VPS
(`194.164.151.202`):

```bash
# 0.1 — Env var names (NOT values — screenshot the file to a password manager)
grep -v '^#' /opt/ayurconnect/.env | grep -v '^$' | cut -d= -f1 | sort > /tmp/env-keys.txt

# 0.2 — Docker services in use
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'

# 0.3 — Docker volumes (find the persistent ones)
docker volume ls
for v in $(docker volume ls -q); do
  echo "=== $v ==="; docker inspect $v --format '{{.Mountpoint}}  |  driver={{.Driver}}'
done

# 0.4 — PM2 processes (the two we care about)
pm2 jlist | jq '.[] | select(.name | test("ayurconnect")) | {name, script, cwd, env: .pm2_env.env}'

# 0.5 — Cron jobs
crontab -l
ls /etc/cron.d/ 2>/dev/null

# 0.6 — Nginx config for ayurconnect specifically
cat /etc/nginx/sites-enabled/ayurconnect* 2>/dev/null || \
  cat /etc/nginx/conf.d/ayurconnect* 2>/dev/null

# 0.7 — SSL certs (Let's Encrypt paths for reference)
ls /etc/letsencrypt/live/ | grep -i ayurconnect

# 0.8 — External integrations to note webhook URLs on:
#   - Twilio WhatsApp inbound webhook (points to api.ayurconnect.com/twilio/...)
#   - Resend / SMTP outbound (no inbound webhook)
#   - IndexNow key files (apps/web/public/*.txt — travel with repo)
#   - Google Search Console (no webhook, just verify meta present)
```

Save the output as a Google Doc / password manager entry. You will
reference this dozens of times.

---

## Phase 1 · Provision NEW VPS

**Spec floor**: 4 GB RAM, 2 vCPU, 80 GB SSD, Ubuntu 24.04 LTS.
**Recommended**: 8 GB / 4 vCPU / 160 GB SSD — headroom for the Next
build (which spikes to ~4 GB), Postgres data, MinIO buckets.

Providers by price/perf:
- **Hetzner CX32** — 8 GB / 4 vCPU / 80 GB — €10/mo (best value if EU-OK)
- **Contabo VPS-M** — 8 GB / 6 vCPU / 200 GB — €8/mo (slower disks)
- **DigitalOcean Premium** — 8 GB / 4 vCPU / 160 GB — $56/mo
- **AWS Lightsail** — 8 GB / 2 vCPU / 160 GB — $40/mo

After provisioning:

```bash
# On NEW VPS
apt update && apt upgrade -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp   # Coolify UI — remove after setup
ufw enable

# hostname (optional but useful)
hostnamectl set-hostname ayurconnect-prod
```

---

## Phase 2 · Install Coolify

Single command:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

- Wait ~5 min for the install
- Open `http://NEW_VPS_IP:8000` in a browser
- Create the admin user + set a strong password
- Register `localhost` as a "server" — Coolify deploys to itself
- Traefik ships bundled — this replaces every hand-written nginx.conf

---

## Phase 3 · Repo connection

Coolify Dashboard → **Sources** → **GitHub** → **Create GitHub App**
- Grant access to `ddotsmedia/ayurconnect` only
- Coolify creates a webhook — that's how git push triggers deploys

---

## Phase 4 · Stateful services (create BEFORE the apps)

Order matters — the app containers need these first.

### 4.1 PostgreSQL 16

Coolify → **New Resource** → **Database** → **PostgreSQL 16**
- Name: `postgres-ayurconnect`
- Volume: auto-created `postgres-data-ayurconnect`
- **Do NOT** enable public port — Coolify's internal Docker network
  handles it
- Set credentials — Coolify generates a strong password by default;
  save it to the password manager
- Enable daily backup → local `/var/backups/coolify/postgres/`

**Internal connection string** the apps will use:
```
postgresql://ayur:<GENERATED_PASSWORD>@postgres-ayurconnect:5432/ayurconnect
```

### 4.2 Redis 7

Coolify → **New Resource** → **Database** → **Redis 7**
- Name: `redis-ayurconnect`
- Volume: `redis-data-ayurconnect`
- No public port
- Persistence: enable AOF (writes each op to disk — no data loss on restart)

**Internal URL**: `redis://:PASSWORD@redis-ayurconnect:6379`

### 4.3 MinIO (only if you're using it for uploads)

Coolify → **New Resource** → **Service** → **MinIO**
- Name: `minio-ayurconnect`
- Volume: `minio-data-ayurconnect`
- Public port for console: 9001 (behind Coolify auth)
- Public port for API: `s3.ayurconnect.com` (SSL by Traefik)

### 4.4 Meilisearch (only if you're using search)

Coolify → **New Resource** → **Service** → **Meilisearch**
- Name: `meili-ayurconnect`
- Volume: `meili-data-ayurconnect`
- No public port — apps reach it via internal DNS

---

## Phase 5 · Dockerfiles (write these locally + commit)

The repo currently deploys via `scripts/deploy.sh` (tar-pipe + PM2).
Coolify needs Dockerfiles. Two new files:

### `apps/api/Dockerfile`

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/config/package.json packages/config/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @ayurconnect/db exec prisma generate
RUN pnpm --filter @ayurconnect/db build
RUN pnpm --filter api build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
ENV NODE_ENV=production
ENV PORT=4100
EXPOSE 4100
CMD ["node", "apps/api/dist/index.js"]
```

### `apps/web/Dockerfile`

Requires `output: 'standalone'` in `apps/web/next.config.mjs` — add it
before building:
```js
export default { output: 'standalone', /* ...existing... */ }
```

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @ayurconnect/db exec prisma generate
RUN pnpm --filter @ayurconnect/db build
RUN pnpm --filter @ayurconnect/ui build
RUN pnpm --filter @ayurconnect/web build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### `.dockerignore` (repo root)

```
node_modules
.next
.turbo
dist
.env
.env.*
*.log
.git
.claude
.vscode
```

Commit these to a **feature branch** (`feat/coolify-migration`) — do
NOT push to main until you've verified the API+web build in Coolify.

---

## Phase 6 · Register the apps in Coolify

### 6.1 API

Coolify → **New Resource** → **Application** → **Dockerfile**
- Source: your GitHub app → `ddotsmedia/ayurconnect`
- Branch: `feat/coolify-migration` (switch to `main` after cutover)
- Dockerfile path: `apps/api/Dockerfile`
- Build context: repo root (`/`)
- Port: `4100`
- Domain: `api-staging.ayurconnect.com` for now (real domain after cutover)
- Health check: `GET /health` (already exists in your Fastify app)
- Auto-deploy: enable

**Env vars** (copy from OLD VPS `/opt/ayurconnect/.env` — full list of
current keys; fill values from the password manager):
```
NODE_ENV=production
DATABASE_URL=postgresql://ayur:PASSWORD@postgres-ayurconnect:5432/ayurconnect
REDIS_URL=redis://:PASSWORD@redis-ayurconnect:6379
BETTER_AUTH_SECRET=...
JWT_SECRET=...
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...
FEEDBACK_WHATSAPP=+971509379212
S3_ENDPOINT=http://minio-ayurconnect:9000   # if MinIO
S3_BUCKET=ayurconnect
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
MEILI_URL=http://meili-ayurconnect:7700     # if Meili
MEILI_MASTER_KEY=...
SITE_URL=https://ayurconnect.com
NEXT_PUBLIC_APP_URL=https://ayurconnect.com
GOOGLE_SITE_VERIFICATION=...                # env-driven per layout.tsx
BING_SITE_VERIFICATION=...
```

### 6.2 Web

- Same source + branch
- Dockerfile: `apps/web/Dockerfile`
- Port: `3000`
- Domain: `staging.ayurconnect.com` for now
- **Env vars** (subset — web only needs public vars + API internal URL):
```
NODE_ENV=production
API_INTERNAL=http://api-ayurconnect:4100
NEXT_PUBLIC_APP_URL=https://ayurconnect.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_BING_SITE_VERIFICATION=...
NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=...
NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION=...
NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=...
```

Click **Deploy**. Iterate on Dockerfile until builds green — this
takes 2–5 tries the first time.

---

## Phase 7 · Data migration

### 7.1 Postgres dump from OLD

```bash
# On OLD VPS
docker ps | grep postgres    # find container name — e.g. ayurconnect_postgres_1

docker exec -t <PG_CONTAINER> pg_dump -U ayur -d ayurconnect \
  --clean --if-exists --no-owner --no-acl --format=custom \
  > /tmp/ayurconnect-$(date -u +%Y%m%dT%H%M%SZ).dump

# Size sanity-check
ls -lh /tmp/ayurconnect-*.dump

# Copy to your laptop
scp root@194.164.151.202:/tmp/ayurconnect-*.dump ~/backups/

# Copy to NEW VPS
scp ~/backups/ayurconnect-*.dump root@NEW_VPS:/tmp/
```

### 7.2 Restore to NEW Postgres

```bash
# On NEW VPS — get the Coolify container name
docker ps | grep postgres    # e.g. postgres-ayurconnect-xxxx

docker exec -i <PG_CONTAINER_NEW> pg_restore -U ayur -d ayurconnect \
  --clean --if-exists --no-owner --no-acl \
  < /tmp/ayurconnect-*.dump

# Verify
docker exec -it <PG_CONTAINER_NEW> psql -U ayur -d ayurconnect -c '\dt'
docker exec -it <PG_CONTAINER_NEW> psql -U ayur -d ayurconnect \
  -c 'SELECT COUNT(*) FROM "Doctor"; SELECT COUNT(*) FROM "KnowledgeArticle"; SELECT COUNT(*) FROM "Post";'
```

Counts should match the OLD VPS.

### 7.3 Prisma migrate deploy (safety net)

Even after restore, run `prisma migrate deploy` to make sure the
_prisma_migrations table matches the code:
```bash
docker exec -it <API_CONTAINER> \
  pnpm --filter @ayurconnect/db exec prisma migrate deploy
```

### 7.4 Redis

Skip — treat as pure cache. It rebuilds naturally.

### 7.5 MinIO buckets (if used)

```bash
# On OLD VPS
mc alias set old http://localhost:9002 OLD_ACCESS OLD_SECRET
mc alias set new https://s3.ayurconnect.com NEW_ACCESS NEW_SECRET
mc mirror --preserve --overwrite old/ayurconnect new/ayurconnect
```

### 7.6 Meilisearch

Reindex from Postgres after cutover — no dump needed. There's
already reindex code in the API.

---

## Phase 8 · Staging smoke test (no DNS change yet)

Point `staging.ayurconnect.com` A record → NEW VPS IP (add it to
your DNS provider; TTL 300s).

Run the site through its paces:
- [ ] Homepage 200, real numbers stats render (not 0)
- [ ] `/doctors` shows the 30 seed doctors + pagination works
- [ ] `/doctors/[id]` for a known cuid renders
- [ ] Malayalam page `/ml/prameham-ayurveda-chikitsa` renders
- [ ] `/api/health` returns 200
- [ ] Sign in (Better Auth) works
- [ ] Feedback submit → WhatsApp fires (or logs `[email]` if
      RESEND_API_KEY not yet set)
- [ ] Sitemap `/sitemap.xml` returns 800+ URLs
- [ ] `robots.txt` returns the correct rules
- [ ] SSL cert issued by Let's Encrypt (Traefik does this automatically)

Fix anything red before Phase 9.

---

## Phase 9 · Cutover (the actual production flip)

### T-24h — reduce TTL

In your DNS provider, drop the `ayurconnect.com` A record TTL from
3600 → 300 seconds. This lets you flip fast and roll back fast.

### T-1h — final delta dump

Users who signed up in the last 24h aren't on the NEW VPS yet. Do a
final delta dump:
```bash
# On OLD VPS
docker exec -t <PG_CONTAINER_OLD> pg_dump -U ayur -d ayurconnect \
  --clean --if-exists --no-owner --no-acl --format=custom \
  > /tmp/ayurconnect-final.dump
scp /tmp/ayurconnect-final.dump root@NEW_VPS:/tmp/

# On NEW VPS
docker exec -i <PG_CONTAINER_NEW> pg_restore -U ayur -d ayurconnect \
  --clean --if-exists --no-owner --no-acl \
  < /tmp/ayurconnect-final.dump
```

### T-30min — switch Coolify domains

Coolify → API application → change domain to `api.ayurconnect.com`
Coolify → Web application → change domain to `ayurconnect.com` +
`www.ayurconnect.com`. Traefik reissues SSL certs (~1 min each).

### T-0 — DNS flip

Change the A record for `ayurconnect.com` (and `www`, `api`) to the
NEW VPS IP. Save. TTL is 300s so propagation is ~5 min worldwide.

### T+0 to T+15min — watch both

Watch nginx logs on OLD + Coolify logs on NEW:
```bash
# OLD (should trickle to zero)
tail -f /var/log/nginx/ayurconnect.access.log | grep -v bot

# NEW — Coolify UI shows live container logs
```

Curl-check the LIVE site from your own machine:
```bash
for path in / /doctors /ml /jobs /amai /offers /sitemap.xml /robots.txt; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://ayurconnect.com$path)
  printf "%-20s %s\n" "$path" "$code"
done
```

### T+1h — decommission ayurconnect processes on OLD

```bash
# On OLD VPS — DO NOT delete anything, just stop
pm2 stop ayurconnect-api ayurconnect-web
pm2 save
# Leave the /opt/ayurconnect directory intact for 7 days
```

---

## Phase 10 · Post-cutover

### 10.1 Update webhook URLs

- Twilio Console → Programmable Messaging → your WhatsApp number →
  Inbound webhook: change to `https://api.ayurconnect.com/<path>`
- Any Razorpay / Stripe webhooks similarly

### 10.2 Update env vars if any changed

- `SITE_URL` should already be `https://ayurconnect.com`
- Double-check the Coolify env panel matches the OLD `.env`

### 10.3 Delete old deploy script

```bash
git rm scripts/deploy.sh
git commit -m "chore: remove tar-pipe deploy — Coolify now handles it"
```

Coolify auto-deploys on `git push origin main`. IndexNow ping + sitemap
notification can be moved into a Coolify post-deploy hook or a
lightweight GitHub Action.

### 10.4 Restore DNS TTL

Once the migration has held for 48 h, put the `ayurconnect.com` TTL
back to 3600s.

### 10.5 Backup verification

Coolify → PostgreSQL service → Backup tab → confirm a backup ran in
the last 24 h. If not, click **Run backup now** and download it to
your laptop as a smoke test.

---

## Phase 11 · Rollback (if anything goes wrong)

### Fast rollback (during Phase 9 within the first hour)

1. DNS flip `ayurconnect.com` A record back to OLD VPS IP.
2. On OLD VPS: `pm2 start ayurconnect-api ayurconnect-web`.
3. Wait 5 min for TTL propagation.
4. You're back where you started. No data loss for any signups that
   happened BEFORE the T-1h delta dump; anything AFTER on the NEW VPS
   is lost (users may need to resubmit).

### Slow rollback (after Phase 10 cleanup, days later)

- Fetch latest backup from NEW Postgres, restore to OLD Postgres,
  DNS flip.
- This is why the OLD VPS files stay for 7 days.

---

## Phase 12 · Gotchas + observed friction

- **Coolify Traefik conflicts with existing web server** on port
  80/443. On a fresh VPS this is fine; on a repurposed VPS, stop
  any existing nginx/apache first.
- **Next.js standalone mode changes require `output: 'standalone'`
  in next.config.mjs** — commit this BEFORE the first Docker build
  or the web container will fail to start.
- **Prisma binary targets**: node:22-alpine uses musl; ensure
  `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` in the
  Prisma schema `generator` block, else Prisma queries throw at
  runtime.
- **pnpm workspace symlinks in Docker**: use pnpm 9+ (`corepack
  enable pnpm` handles this).
- **Env var visibility in Next.js** — `NEXT_PUBLIC_*` values are
  inlined at BUILD TIME. If you change a `NEXT_PUBLIC_*` var, you
  MUST rebuild (Coolify: click Redeploy).
- **CORS**: if `api.ayurconnect.com` and `ayurconnect.com` are on
  different domains at any point, the API `origin` CORS list needs
  both. Currently it's rooted through Next.js so this doesn't matter,
  but if you ever call the API directly from the browser it will.
- **Health check `/api/health` on Coolify**: Coolify's health check
  hits `/health` on the port you exposed. Fastify's built-in health
  is at `/health` (mapped to `/api/health` by Next.js rewrite). Point
  Coolify to `/health` on port 4100 for the API container.
- **Better Auth session cookies**: cookies scoped to
  `.ayurconnect.com`. If you test on `staging.ayurconnect.com` you'll
  share cookies with production — sign out before flipping DNS.
- **Google Search Console**: no re-verification needed — DNS-based
  verification is IP-agnostic. But the `googled41d42e6bde6d7a0.html`
  file must still be present in `apps/web/public/`.

---

## Phase 13 · Timeline

Realistic wall-clock, first time doing this:
- **Prep + inventory**: 2 h
- **VPS provision + Coolify install**: 45 min
- **Dockerfiles + first green build**: 3 h (iterate on lockfile /
  binary target / standalone-mode issues)
- **Data migration + smoke test on staging**: 2 h
- **Cutover window**: 30 min (with 24 h TTL prep before)
- **Post-cutover + webhook updates**: 1 h
- **Total focused work**: ~10 h. Spread over 3 evenings comfortably.

---

## Phase 14 · Decision points

Before starting, decide:

1. **Same VPS or different provider?** Same provider means DNS-only
   flip. Different provider means SSH keys, firewall setup from
   scratch, but no risk of shared-neighbor contention.
2. **Combine api + web into one Coolify project or two?** Two is
   safer — each redeploys independently. One is slightly less
   config. Recommendation: **two**.
3. **Keep MinIO or migrate to a managed S3?** Managed S3
   (Cloudflare R2, DigitalOcean Spaces) removes one moving part and
   gives you free egress. Recommendation: **R2** if not already on
   MinIO with data.
4. **Postgres backups: local or S3?** Coolify supports both.
   Recommendation: **both** — local for fast restore, S3 for
   off-VPS disaster recovery.

---

## Appendix A · What stays on the OLD VPS

Not touched by this migration:
- `ddots-erp`, `ddots-admin`, `wa-crm-web`, `wa-crm-worker`,
  `trade-route`, `ddots-web`, `ddots-worker` — the PM2 list from
  Phase 0.2.
- `/etc/nginx/sites-enabled/*` for those apps.
- Their databases + volumes.

Only the two AyurConnect PM2 processes stop; the AyurConnect Docker
containers (pg 5435, redis 6381, meili 7701, minio 9002) stay
running as read-only sources for the 7-day rollback window.

---

## Appendix B · Command reference card (print this)

```bash
# Coolify UI
http://NEW_VPS:8000

# Force redeploy an app (Coolify UI or CLI)
# — click Redeploy in the app's Deployments tab

# View container logs
docker logs -f <container-name>

# Enter a container
docker exec -it <container-name> sh

# Postgres shell
docker exec -it postgres-ayurconnect-xxx psql -U ayur -d ayurconnect

# Trigger sitemap ping manually (post-deploy)
curl -X POST 'https://ayurconnect.com/api/sitemap-ping'   # if you add this route

# Coolify backup on demand
# Coolify UI → PostgreSQL → Backup → Run now
```

---

Migration owner: whoever runs Phase 9. Every prior phase can be
practised on staging without risk.
