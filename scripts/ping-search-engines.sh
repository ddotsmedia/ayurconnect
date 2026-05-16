#!/usr/bin/env bash
# Notify search engines of new/changed URLs after each deploy.
#
# Submits to IndexNow (https://www.indexnow.org/) — a single POST goes to
# api.indexnow.org and is then fanned out to Bing, Yandex, Naver, Seznam,
# and DuckDuckGo. Google deprecated their sitemap-ping endpoint in 2023;
# robots.txt already exposes the sitemap location, so Googlebot picks it
# up on its own crawl cycle (faster after manual Search Console submit).
#
# Run manually:        bash scripts/ping-search-engines.sh
# Run with specific URLs: bash scripts/ping-search-engines.sh /conditions/pcos /careers
# Default (no args):   submits the top-level changed URLs.
#
# Requires curl. No auth needed beyond the public key file at the host root.

set -euo pipefail

HOST="${PING_HOST:-ayurconnect.com}"
KEY="${INDEXNOW_KEY:-bf1210149738f6b615deb69b81007f78}"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# Default URL list — the surfaces that are most likely to have changed.
# Override by passing paths as args.
if [ $# -eq 0 ]; then
  paths=(
    /
    /sitemap.xml
    /conditions
    /careers
    /online-consultation
    /panchakarma
    /tourism
    /doctors
    /dubai/ayurveda-doctors
    /abu-dhabi/ayurveda-doctors
    /sharjah/ayurveda-doctors
  )
else
  paths=("$@")
fi

# Build the JSON URL array.
url_list=""
for p in "${paths[@]}"; do
  # Ensure leading slash, no trailing slash duplication.
  p="${p#/}"
  [ -n "$url_list" ] && url_list="$url_list,"
  url_list="$url_list\"https://${HOST}/${p}\""
done

payload=$(printf '{"host":"%s","key":"%s","keyLocation":"%s","urlList":[%s]}' \
  "$HOST" "$KEY" "$KEY_LOCATION" "$url_list")

echo "▶ IndexNow: pinging ${#paths[@]} URLs"
status=$(curl -sS -o /tmp/indexnow.out -w "%{http_code}" \
  -X POST \
  -H 'content-type: application/json; charset=utf-8' \
  --data "$payload" \
  https://api.indexnow.org/indexnow || echo "000")

case "$status" in
  200|202)
    echo "  ✓ accepted ($status) — Bing, Yandex, Naver, Seznam, DuckDuckGo notified"
    ;;
  422)
    echo "  ✗ 422 unprocessable — likely key/host mismatch or stale key file"
    echo "    Verify https://${HOST}/${KEY}.txt returns the key '${KEY}'"
    cat /tmp/indexnow.out 2>/dev/null | head -5
    exit 1
    ;;
  000)
    echo "  ✗ network error reaching api.indexnow.org (non-fatal, not retrying)"
    ;;
  *)
    echo "  ✗ HTTP $status — see response below (non-fatal)"
    cat /tmp/indexnow.out 2>/dev/null | head -5
    ;;
esac

rm -f /tmp/indexnow.out
