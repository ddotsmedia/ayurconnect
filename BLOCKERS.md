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
