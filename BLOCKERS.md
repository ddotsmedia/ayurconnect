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
