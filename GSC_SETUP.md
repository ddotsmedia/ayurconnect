# Search Console Setup — 30-Minute Runbook

The site is set up to receive verification codes via env vars. Once you complete the steps below, search engines will start indexing **ayurconnect.com** properly.

## TL;DR

| Engine | Setup | Auto-ping after deploy |
|---|---|---|
| **Google Search Console** | manual verify (5 min) | ❌ Google retired ping in 2023 — picks up sitemap on its own crawl |
| **Bing Webmaster Tools** | manual verify (5 min) | ✅ via IndexNow |
| **Yandex Webmaster** | manual verify (5 min) | ✅ via IndexNow |
| **Pinterest** | optional (3 min) | n/a |
| **Facebook Domain** | optional (3 min) | n/a |

The IndexNow ping fires automatically at the end of every `pnpm deploy` — Bing, Yandex, Naver, Seznam, and DuckDuckGo are notified in one POST.

---

## 1. Google Search Console (highest priority)

1. Open https://search.google.com/search-console
2. **Add property** → choose **URL prefix** (not Domain — DNS-level verify is harder)
3. Enter: `https://ayurconnect.com`
4. Choose **HTML tag** verification method
5. Copy the `content="..."` value (looks like `XYZ123abc...`)
6. On the VPS (or wherever your prod env lives), set:

   ```bash
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=XYZ123abc...
   ```

7. Re-deploy: `pnpm deploy`. The meta tag appears in the rendered HTML automatically.
8. Back in Search Console, click **Verify**.
9. After verification, in the left sidebar → **Sitemaps** → submit `https://ayurconnect.com/sitemap.xml`

**Also add the www variant** (`https://www.ayurconnect.com`) as a separate property — the 301 redirect we shipped tells Google to consolidate signals to the apex, but having both verified gives you visibility into what redirects are catching.

**Note on "preferred domain":** Google retired the preferred-domain setting in 2019. The www→apex 301 redirect (live since commit `0fd709d`) is now the way to signal preference — Google handles it automatically.

## 2. Bing Webmaster Tools

1. Open https://www.bing.com/webmasters
2. Sign in (Microsoft account)
3. **Add a site** → `https://ayurconnect.com`
4. Choose **Add a meta tag**
5. Copy the `content="..."` value
6. Set env var on VPS:

   ```bash
   NEXT_PUBLIC_BING_SITE_VERIFICATION=ABC456def...
   ```

7. Re-deploy. Click **Verify** in Bing.
8. **Sitemaps** → submit `https://ayurconnect.com/sitemap.xml`

**Shortcut:** Bing has a "Import from Google Search Console" button on the Add Site flow. If you verified GSC first, this is one click and you skip the meta tag step entirely.

## 3. Yandex Webmaster

1. https://webmaster.yandex.com
2. Add site → `https://ayurconnect.com`
3. **Meta tag** verification
4. Set env var:

   ```bash
   NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=...
   ```

5. Re-deploy → verify in Yandex.
6. Submit `https://ayurconnect.com/sitemap.xml`

Yandex still matters for traffic from CIS countries and is part of the IndexNow consortium.

## 4. Pinterest (optional but worth it for wellness)

1. https://business.pinterest.com/settings/claim
2. **Claim a website** → `ayurconnect.com`
3. **Add HTML tag** → copy the `content="..."` value
4. Set:

   ```bash
   NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION=...
   ```

5. Re-deploy + verify.

## 5. Facebook Domain Verification (optional)

Needed only if you plan to run Facebook ads or use Facebook Business Manager to track AyurConnect.

1. https://business.facebook.com/settings/owned-domains
2. Add domain `ayurconnect.com`
3. Choose **Meta-tag verification**
4. Set:

   ```bash
   NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION=...
   ```

5. Re-deploy + verify.

---

## Setting env vars on the VPS

The `NEXT_PUBLIC_*` vars are inlined at build time. After updating them, you must re-build, which `pnpm deploy` does automatically.

Locations on the VPS (`/opt/ayurconnect/`):
- `apps/web/.env.production` — preferred location for Next.js public env vars
- Or set them in PM2's ecosystem config

Quick edit:

```bash
ssh root@194.164.151.202
cd /opt/ayurconnect/apps/web
nano .env.production
# add:
#   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=XYZ
#   NEXT_PUBLIC_BING_SITE_VERIFICATION=ABC
#   NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=DEF
# save + exit
```

Then from your local machine: `pnpm deploy` — picks up the new build.

---

## What ships automatically (no setup needed)

| Surface | Status |
|---|---|
| Sitemap | `https://ayurconnect.com/sitemap.xml` — 96 condition URLs + all others |
| Robots | `https://ayurconnect.com/robots.txt` — references sitemap, disallows /admin, /dashboard, /api, /sign-in, /dr |
| Canonical tags | Per-page `<link rel="canonical">` from `metadata.alternates.canonical` |
| Schema.org JSON-LD | MedicalClinic + MedicalBusiness + HealthAndBeautyBusiness on homepage; MedicalCondition on every /conditions/* page; BreadcrumbList everywhere |
| OG images | Per-condition + per-city + careers + homepage |
| IndexNow key | `https://ayurconnect.com/bf1210149738f6b615deb69b81007f78.txt` |
| Post-deploy ping | scripts/deploy.sh hits IndexNow at the end of every deploy |

---

## Verifying it's all working

```powershell
# Check verification meta tags are rendered (after setting env + deploy):
curl -s https://ayurconnect.com/ | Select-String -Pattern 'google-site-verification|msvalidate.01|yandex-verification'

# Check IndexNow key file is reachable:
curl -s https://ayurconnect.com/bf1210149738f6b615deb69b81007f78.txt

# Test a manual IndexNow ping (no auth needed):
bash scripts/ping-search-engines.sh /conditions/pcos /careers
```

Expected output of the third command:

```
▶ IndexNow: pinging 2 URLs
  ✓ accepted (200) — Bing, Yandex, Naver, Seznam, DuckDuckGo notified
```

## Order to do this in

1. **Today (15 min):** GSC + Bing + Yandex verification + sitemap submission. This is the bulk of the wins.
2. **This week:** Watch the GSC "Index → Pages" report. Expect 96+ condition URLs to start appearing in 1–7 days.
3. **Next week:** Add Pinterest + Facebook domain verification if you're running paid campaigns.
4. **Ongoing:** Every `pnpm deploy` automatically pings IndexNow with the top routes; no manual work needed.

## Rotating the IndexNow key

If the key ever leaks (it's not secret, but...) or you want to rotate:

1. Pick a new 32-hex-char key: `openssl rand -hex 16`
2. Rename `apps/web/public/{old}.txt` to `apps/web/public/{new}.txt` and update its contents
3. Update `INDEXNOW_KEY` default in `scripts/ping-search-engines.sh`
4. Deploy

Old key file should stay accessible for ~7 days so cached crawler state doesn't get rejected.
