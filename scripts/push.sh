#!/usr/bin/env bash
# One-command "edit -> live": stage, commit, push, watch CI deploy, smoke prod.
# Usage:   push "commit message"
# Invoked via:  C:\Users\home\bin\push.cmd (which forwards from CMD/PowerShell)

set -euo pipefail

REPO_DIR='/c/Users/home/.claude/ayurvedakerala'
GH_REPO='ddotsmedia/ayurconnect'
DOMAIN='ayurconnect.com'
SMOKE_PATHS=("/" "/doctors" "/hospitals" "/herbs" "/forum" "/jobs" "/tourism" "/colleges" "/api/health")

# colors (no-op if not tty)
if [ -t 1 ]; then
  C_BLUE='\033[1;34m'; C_GREEN='\033[1;32m'; C_RED='\033[1;31m'; C_DIM='\033[2m'; C_RESET='\033[0m'
else
  C_BLUE=''; C_GREEN=''; C_RED=''; C_DIM=''; C_RESET=''
fi
step() { printf "${C_BLUE}▶${C_RESET} %s\n" "$*"; }
ok()   { printf "  ${C_GREEN}✓${C_RESET} %s\n" "$*"; }
err()  { printf "  ${C_RED}✗${C_RESET} %s\n" "$*"; }
note() { printf "  ${C_DIM}%s${C_RESET}\n" "$*"; }

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "Usage: push \"commit message\"" >&2
  echo "  Stages all changes, commits, pushes to origin, watches the CI run," >&2
  echo "  then smoke-tests https://$DOMAIN/ when CI is green." >&2
  exit 1
fi

cd "$REPO_DIR"

# ── 1. stage + commit ─────────────────────────────────────────────────────
step "stage + commit"
git add -A

if git diff --cached --quiet; then
  note "(nothing to commit)"
else
  git commit -m "$MSG" 2>&1 | tail -3
  ok "committed"
fi

# ── 2. push ────────────────────────────────────────────────────────────────
step "push to origin"
git push 2>&1 | tail -3
ok "pushed"

# ── 3. watch CI run ──────────────────────────────────────────────────────
if ! command -v gh >/dev/null 2>&1; then
  note "gh CLI not installed — skipping CI watch. Open https://github.com/$GH_REPO/actions to see status."
  exit 0
fi

step "wait for GitHub Actions to start a run"
HEAD_SHA="$(git rev-parse HEAD)"
RUN_ID=""
for i in $(seq 1 12); do
  RUN_ID="$(gh run list --repo "$GH_REPO" --limit 5 --json databaseId,headSha --jq ".[] | select(.headSha == \"$HEAD_SHA\") | .databaseId" | head -1 || true)"
  if [ -n "$RUN_ID" ]; then break; fi
  sleep 2
done

if [ -z "$RUN_ID" ]; then
  err "no CI run picked up the new commit yet"
  note "check https://github.com/$GH_REPO/actions manually"
  exit 1
fi
ok "run id: $RUN_ID  (https://github.com/$GH_REPO/actions/runs/$RUN_ID)"

step "follow CI run"
gh run watch "$RUN_ID" --repo "$GH_REPO" --exit-status --interval 4 2>&1 | grep -vE "^Refreshing|deprecated|nodejs.org|tee.*node" || true

if ! gh run view "$RUN_ID" --repo "$GH_REPO" --json conclusion --jq '.conclusion' | grep -q success; then
  err "CI run did not succeed"
  echo
  echo "Last 30 log lines from the failed step:"
  gh run view "$RUN_ID" --repo "$GH_REPO" --log-failed 2>&1 | tail -30
  exit 1
fi
ok "CI green"

# ── 4. smoke test prod ───────────────────────────────────────────────────
step "smoke test https://$DOMAIN"
sleep 2
fail=0
for p in "${SMOKE_PATHS[@]}"; do
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 30 "https://$DOMAIN$p" || echo 000)
  case "$status" in
    200|307) ok "$(printf '%-32s → %s' "$p" "$status")" ;;
    *)       err "$(printf '%-32s → %s' "$p" "$status")"; fail=1 ;;
  esac
done

if [ $fail -ne 0 ]; then
  err "some pages are broken on production despite CI passing — investigate"
  exit 1
fi

step "✓ live: https://$DOMAIN/"
