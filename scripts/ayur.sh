#!/usr/bin/env bash
# ayur — one CLI for all common AyurConnect ops.
#
#   ayur status                       site health (api/ayurbot/payments/db)
#   ayur env KEY=VAL [KEY=VAL ...]    set prod env vars + restart + verify
#   ayur env --show                   show which integration features are on
#   ayur logs [api|web] [N]           tail PM2 logs (default api, 50 lines)
#   ayur restart [api|web|all]        pm2 restart on prod
#   ayur seed                         re-run prisma db:seed on prod
#   ayur deploy "commit message"      git add/commit/push + watch CI
#   ayur ship [--seed] [--migrate]    direct deploy (skip GitHub Actions)
#   ayur admin <email>                promote user to ADMIN role
#   ayur import <source> [opts]       bulk-import doctors/clinics (see below)
#   ayur ssh                          interactive SSH to the VPS
#   ayur help                         this message
#
# Import sources:
#   ayur import kerala-tourism                   builtin curated Olive/Green Leaf list
#   ayur import csv --type doctors --file f.csv  CSV → /admin/import/doctors
#   ayur import csv --type hospitals --file f.csv
#   add --dry-run to preview without writing
#   needs ADMIN_COOKIE env var (see scripts/import/run.mjs header)

set -euo pipefail

REPO=${REPO:-/c/Users/home/.claude/ayurvedakerala}
VPS=${DEPLOY_VPS:-root@194.164.151.202}
DOMAIN=${DEPLOY_DOMAIN:-ayurconnect.com}
ENV_FILE=${ENV_FILE:-/opt/ayurconnect/apps/api/.env}

# Resolve repo dir on Windows when called via the .cmd shim.
if [ ! -d "$REPO" ]; then
  REPO="C:/Users/home/.claude/ayurvedakerala"
fi
cd "$REPO"

# ─── small helpers ────────────────────────────────────────────────────────
have() { command -v "$1" >/dev/null 2>&1; }
ssh_v() { ssh -o StrictHostKeyChecking=accept-new "$VPS" "$@"; }

usage() { sed -n '2,23p' "$0" | sed 's/^# \{0,1\}//'; }

# Curl + take first <max> chars of body, on a single line, for compact prints.
peek() {
  local url="$1" max="${2:-160}"
  local out; out=$(curl -fsS "$url" 2>/dev/null | tr -d '\n' | head -c "$max" || echo '')
  if [ -z "$out" ]; then echo "(no response)"; else echo "$out"; fi
}

# ─── subcommands ──────────────────────────────────────────────────────────
cmd_status() {
  echo "▶ AyurConnect — production health"
  echo

  echo "  https://$DOMAIN/         $(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")"
  echo "  /api/health              $(peek "https://$DOMAIN/api/health" 80)"
  echo "  /api/ayurbot/status      $(peek "https://$DOMAIN/api/ayurbot/status" 200)"
  echo "  /api/payments/config     $(peek "https://$DOMAIN/api/payments/config" 200)"

  local doctors herbs hospitals
  doctors=$(curl -fsS "https://$DOMAIN/api/doctors?limit=1"   2>/dev/null | grep -oE '"total":[0-9]+' | head -1 | cut -d: -f2 || echo '?')
  herbs=$(curl -fsS  "https://$DOMAIN/api/herbs?limit=1"     2>/dev/null | grep -oE '"total":[0-9]+' | head -1 | cut -d: -f2 || echo '?')
  hospitals=$(curl -fsS "https://$DOMAIN/api/hospitals?limit=500" 2>/dev/null | grep -oE '"id"' | wc -l | tr -d ' ' || echo '?')
  echo "  doctors / herbs / hosp   $doctors / $herbs / $hospitals"

  echo
  echo "▶ pm2 (on $VPS)"
  ssh_v "pm2 jlist 2>/dev/null | python3 -c \"import sys,json; ps=json.load(sys.stdin); [print(f'  {p[\\\"name\\\"]:<25} {p[\\\"pm2_env\\\"][\\\"status\\\"]:<10} restarts={p[\\\"pm2_env\\\"][\\\"restart_time\\\"]} uptime_s={int((__import__('time').time()*1000-p['pm2_env']['pm_uptime'])/1000)}') for p in ps]\" 2>/dev/null || pm2 list --no-color | head -25"
}

cmd_env() {
  if [ "${1:-}" = "--show" ]; then
    echo "▶ which integration features are configured (on $VPS)"
    ssh_v "
      f='$ENV_FILE'
      check() {
        local key=\$1 name=\$2 prefix=\$3
        local val=\$(grep -E \"^\$key=\" \"\$f\" 2>/dev/null | head -1 | cut -d= -f2-)
        if [ -z \"\$val\" ]; then printf '  %-22s ✗ unset\n' \"\$name\"; return; fi
        case \"\$val\" in *...*|*REPLACE_ME*|*your-real-key*) printf '  %-22s ⚠ placeholder\n' \"\$name\"; return;; esac
        if [ -n \"\$prefix\" ] && ! [[ \"\$val\" == \"\$prefix\"* ]]; then printf '  %-22s ⚠ wrong prefix\n' \"\$name\"; return; fi
        printf '  %-22s ✓ set (%d chars)\n' \"\$name\" \"\${#val}\"
      }
      check GOOGLE_API_KEY     'AyurBot (Gemini, free)' 'AIza'
      check GROQ_API_KEY       'AyurBot (Groq, free)'   'gsk_'
      check ANTHROPIC_API_KEY  'AyurBot (Claude, paid)' 'sk-ant-'
      check RAZORPAY_KEY_ID    'Razorpay (id)'          'rzp_'
      check RAZORPAY_KEY_SECRET 'Razorpay (secret)'     ''
      check RESEND_API_KEY     'Resend email'           're_'
      check TWILIO_ACCOUNT_SID 'Twilio SMS (sid)'       'AC'
      check TWILIO_AUTH_TOKEN  'Twilio SMS (token)'     ''
      check TWILIO_FROM        'Twilio SMS (from)'      ''
      check TWILIO_WHATSAPP_FROM 'Twilio WhatsApp (from)' ''
      check VOYAGE_API_KEY     'Voyage AI'              ''
    "
    return
  fi
  if [ "$#" -lt 1 ]; then echo "usage: ayur env KEY=VAL [KEY=VAL ...]   |   ayur env --show" >&2; exit 1; fi
  bash "$REPO/scripts/set-prod-env.sh" "$@"
}

cmd_logs() {
  local svc="${1:-api}" lines="${2:-50}"
  case "$svc" in
    api) svc=ayurconnect-api ;;
    web) svc=ayurconnect-web ;;
    ayurconnect-*) ;;
    *) echo "✗ unknown service '$svc' (api|web)" >&2; exit 1;;
  esac
  ssh_v "pm2 logs $svc --lines $lines --nostream"
}

cmd_restart() {
  local target="${1:-api}"
  case "$target" in
    api) ssh_v "pm2 restart ayurconnect-api && pm2 status --no-color | head -10" ;;
    web) ssh_v "pm2 restart ayurconnect-web && pm2 status --no-color | head -10" ;;
    all) ssh_v "pm2 restart all && pm2 status --no-color | head -10" ;;
    *) echo "✗ unknown target '$target' (api|web|all)" >&2; exit 1 ;;
  esac
}

cmd_seed() {
  echo "▶ re-running prisma db:seed on $VPS (idempotent upserts)"
  ssh_v "cd /opt/ayurconnect && pnpm --filter @ayurconnect/db db:seed 2>&1 | tail -20"
}

cmd_deploy() {
  if [ "$#" -lt 1 ]; then echo "usage: ayur deploy \"commit message\"" >&2; exit 1; fi
  bash "$REPO/scripts/push.sh" "$1"
}

cmd_ship() {
  bash "$REPO/scripts/deploy.sh" "$@"
}

cmd_admin() {
  local email="${1:-}"
  if [ -z "$email" ]; then echo "usage: ayur admin <email>" >&2; exit 1; fi
  echo "▶ promoting $email to ADMIN on prod"
  ssh_v "docker exec ayurconnect-postgres psql -U ayurconnect -d ayurconnect -c \"UPDATE \\\"User\\\" SET role='ADMIN' WHERE email='$email' RETURNING email, role;\""
}

cmd_ssh() {
  exec ssh -o StrictHostKeyChecking=accept-new "$VPS"
}

cmd_import() {
  local source="${1:-}"
  if [ -z "$source" ]; then
    echo "usage: ayur import <source> [--type doctors|hospitals] [--file path.csv] [--dry-run]" >&2
    echo "       sources: kerala-tourism, csv" >&2
    exit 1
  fi
  shift
  if ! command -v node >/dev/null 2>&1; then
    echo "✗ node not in PATH" >&2; exit 1
  fi
  node "$REPO/scripts/import/run.mjs" --source "$source" "$@"
}

# ─── dispatch ─────────────────────────────────────────────────────────────
SUB="${1:-help}"
shift || true
case "$SUB" in
  status)         cmd_status "$@" ;;
  env)            cmd_env "$@" ;;
  logs)           cmd_logs "$@" ;;
  restart)        cmd_restart "$@" ;;
  seed)           cmd_seed "$@" ;;
  deploy|push)    cmd_deploy "$@" ;;
  ship)           cmd_ship "$@" ;;
  admin)          cmd_admin "$@" ;;
  ssh)            cmd_ssh "$@" ;;
  import)         cmd_import "$@" ;;
  help|-h|--help) usage ;;
  *) echo "✗ unknown subcommand: $SUB"; echo; usage; exit 1 ;;
esac
