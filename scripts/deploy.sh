#!/usr/bin/env bash
# scripts/deploy.sh — one-command deploy of AyurConnect to ayurconnect.com
#
# Usage from repo root:
#   pnpm deploy                    # standard deploy
#   pnpm deploy -- --seed          # also run db:seed (idempotent upserts)
#   pnpm deploy -- --no-build      # skip build (env / config-only changes)
#   pnpm deploy -- --dry-run       # print what would happen, run nothing
#   pnpm deploy -- --logs          # tail PM2 logs at the end
#   pnpm deploy -- --check         # only verify VPS is reachable, no changes
#
# Equivalent direct invocation: bash scripts/deploy.sh [flags]
#
# Requires: ssh key set up for root@194.164.151.202, tar, curl.

set -euo pipefail

# ─── config (env-overridable so CI can point elsewhere) ───────────────────
VPS="${DEPLOY_VPS:-root@194.164.151.202}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/ayurconnect}"
DOMAIN="${DEPLOY_DOMAIN:-ayurconnect.com}"
SMOKE_PATHS=("/" "/doctors" "/api/health" "/api/doctors?limit=1")

# ─── flags ─────────────────────────────────────────────────────────────────
SEED=false
SKIP_BUILD=false
DRY_RUN=false
TAIL_LOGS=false
CHECK_ONLY=false

for arg in "$@"; do
  case $arg in
    --seed)     SEED=true ;;
    --no-build) SKIP_BUILD=true ;;
    --dry-run)  DRY_RUN=true ;;
    --logs)     TAIL_LOGS=true ;;
    --check)    CHECK_ONLY=true ;;
    -h|--help)
      sed -n '3,15p' "$0" | sed 's/^# *//'
      exit 0 ;;
    *) echo "✗ unknown flag: $arg (try --help)"; exit 1 ;;
  esac
done

# ─── colors (no-op if non-tty) ─────────────────────────────────────────────
if [ -t 1 ]; then
  C_BLUE='\033[1;34m'; C_GREEN='\033[1;32m'; C_RED='\033[1;31m'; C_DIM='\033[2m'; C_RESET='\033[0m'
else
  C_BLUE=''; C_GREEN=''; C_RED=''; C_DIM=''; C_RESET=''
fi

step() { printf "${C_BLUE}▶${C_RESET} %s\n" "$*"; }
ok()   { printf "  ${C_GREEN}✓${C_RESET} %s\n" "$*"; }
err()  { printf "  ${C_RED}✗${C_RESET} %s\n" "$*"; }
note() { printf "  ${C_DIM}%s${C_RESET}\n" "$*"; }

# ─── repo root sanity ──────────────────────────────────────────────────────
cd "$(dirname "$0")/.."
if [ ! -f pnpm-workspace.yaml ]; then
  err "must run from the repo root (no pnpm-workspace.yaml)"; exit 1
fi

# ─── ssh preflight ─────────────────────────────────────────────────────────
step "preflight"
if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$VPS" "true" 2>/dev/null; then
  err "cannot ssh to $VPS — is your key authorized?"
  exit 1
fi
ok "ssh ok ($VPS)"

if $CHECK_ONLY; then
  ssh "$VPS" "test -d $DEPLOY_DIR && echo '$DEPLOY_DIR present' || echo '$DEPLOY_DIR missing'"
  ssh "$VPS" "pm2 list 2>&1 | grep -E 'ayurconnect-(api|web)' || echo 'no PM2 ayurconnect processes'"
  exit 0
fi

# ─── git status hint (don't block) ─────────────────────────────────────────
if command -v git >/dev/null 2>&1 && [ -d .git ]; then
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    note "(git working tree has uncommitted changes — deploying anyway)"
  fi
fi

BUILD_ID="$(date -u +%Y%m%d-%H%M%S)"
step "deploy $BUILD_ID  →  https://$DOMAIN/"

# ─── 1. sync source ────────────────────────────────────────────────────────
step "sync source (tar | ssh)"
TAR_EXCLUDES=(
  --exclude=node_modules
  --exclude=.next
  --exclude=.turbo
  --exclude=dist
  --exclude=.git
  --exclude='dev.db*'
  --exclude=.env
  --exclude='.env.local'
  --exclude='.env.production'
  --exclude='.env.production.local'
  --exclude=cookies.txt
  --exclude='*.log'
  --exclude=.claude
  --exclude='*.tsbuildinfo'
)

if $DRY_RUN; then
  size_kb=$(tar czf - "${TAR_EXCLUDES[@]}" . 2>/dev/null | wc -c)
  printf "  ${C_DIM}would tar-pipe %s bytes (%s kb) to %s:%s${C_RESET}\n" \
    "$size_kb" "$((size_kb/1024))" "$VPS" "$DEPLOY_DIR"
else
  tar czf - "${TAR_EXCLUDES[@]}" . | ssh "$VPS" "cd $DEPLOY_DIR && tar xzf -"
  ok "source synced"
fi

# ─── 2. remote install / migrate / build / restart ─────────────────────────
SEED_BLOCK=""
$SEED && SEED_BLOCK='echo "▶ seed"; pnpm --filter @ayurconnect/db db:seed 2>&1 | tail -10'

BUILD_BLOCK=""
if ! $SKIP_BUILD; then
  BUILD_BLOCK='
echo "▶ build packages/db"
pnpm --filter @ayurconnect/db build 2>&1 | tail -2
echo "▶ build apps/api"
pnpm --filter api build 2>&1 | tail -2
echo "▶ build apps/web"
pnpm --filter @ayurconnect/web build 2>&1 | tail -3'
fi

REMOTE_SCRIPT=$(cat <<EOF
set -e
cd $DEPLOY_DIR

echo "▶ install (skipped if lockfile unchanged)"
pnpm install --prod=false 2>&1 | tail -3

echo "▶ prisma generate"
pnpm --filter @ayurconnect/db exec prisma generate 2>&1 | tail -2

echo "▶ prisma migrate deploy"
pnpm --filter @ayurconnect/db exec prisma migrate deploy 2>&1 | tail -5

$SEED_BLOCK
$BUILD_BLOCK

echo "▶ pm2 restart"
pm2 restart ayurconnect-api ayurconnect-web 2>&1 | tail -2

echo "$BUILD_ID" > $DEPLOY_DIR/.last-deploy
EOF
)

if $DRY_RUN; then
  step "would run on VPS:"
  printf "${C_DIM}%s${C_RESET}\n" "$REMOTE_SCRIPT" | sed 's/^/    /'
  exit 0
else
  step "remote install / migrate / build / restart"
  ssh "$VPS" "$REMOTE_SCRIPT"
  ok "remote phase complete"
fi

# ─── 3. smoke test ─────────────────────────────────────────────────────────
step "smoke test"
sleep 2
fail=0
for path in "${SMOKE_PATHS[@]}"; do
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 30 "https://$DOMAIN$path" || echo 000)
  case "$status" in
    200|307) ok "$(printf '%-32s → %s' "$path" "$status")" ;;
    *)       err "$(printf '%-32s → %s' "$path" "$status")"; fail=1 ;;
  esac
done

if [ $fail -ne 0 ]; then
  step "recent web errors"
  ssh "$VPS" "pm2 logs ayurconnect-web --lines 20 --nostream --err 2>&1 | tail -25"
  err "smoke test failed — site may be broken; investigate before retrying"
  exit 1
fi

if $TAIL_LOGS; then
  step "pm2 logs (last 30, ctrl+c to exit)"
  ssh "$VPS" "pm2 logs ayurconnect-api ayurconnect-web --lines 30"
fi

step "✓ deploy $BUILD_ID complete  →  https://$DOMAIN/"
