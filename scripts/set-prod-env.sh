#!/usr/bin/env bash
# Set one or more env vars on the prod VPS, restart the API, and verify.
#
# Usage:
#   bash scripts/set-prod-env.sh KEY=VALUE [KEY=VALUE ...]
#
# Examples:
#   bash scripts/set-prod-env.sh ANTHROPIC_API_KEY=sk-ant-api03-...
#   bash scripts/set-prod-env.sh RESEND_API_KEY=re_... RESEND_FROM='AyurConnect <hello@ayurconnect.com>'
#   bash scripts/set-prod-env.sh RAZORPAY_KEY_ID=rzp_test_... RAZORPAY_KEY_SECRET=...
#
# What it does:
#   1. SSH to ${DEPLOY_VPS:-root@194.164.151.202}
#   2. For each KEY=VALUE: rewrite that line in /opt/ayurconnect/apps/api/.env
#      (or append it if absent). Existing lines are replaced atomically.
#   3. pm2 restart ayurconnect-api
#   4. Run integration-specific verify curls (only for keys we know about)
#
# The .env file on the VPS is NOT under git (deploy.sh excludes .env), so
# values you set here persist across deploys.

set -euo pipefail

VPS=${DEPLOY_VPS:-root@194.164.151.202}
ENV_FILE=${ENV_FILE:-/opt/ayurconnect/apps/api/.env}
SERVICE=${PM2_SERVICE:-ayurconnect-api}
DOMAIN=${DEPLOY_DOMAIN:-ayurconnect.com}

if [ "$#" -lt 1 ]; then
  echo "usage: $0 KEY=VALUE [KEY=VALUE ...]" >&2
  exit 1
fi

# ─── Build the remote sed/append script ──────────────────────────────────
# We do everything in a single SSH session to avoid round-trips.
KNOWN_KEYS=()
REMOTE_CMDS="set -e; touch '$ENV_FILE';"

for kv in "$@"; do
  case "$kv" in
    *=*) ;;
    *) echo "✗ argument '$kv' is not in KEY=VALUE form" >&2; exit 1;;
  esac
  KEY=${kv%%=*}
  VALUE=${kv#*=}
  KNOWN_KEYS+=("$KEY")

  # ── Refuse obvious placeholders so AyurBot/Resend/Razorpay can't be
  #    silently broken by pasting an example value verbatim.
  case "$VALUE" in
    *...*|*your-real-key*|*your-key-here*|*REPLACE_ME*|*xxxxxxxx*|*placeholder*)
      echo "✗ refusing to set $KEY — value '$VALUE' looks like a placeholder/example."
      echo "  Paste the real value (no '...', no 'your-real-key', etc.) and try again."
      exit 2;;
  esac

  # ── Length floor for known-keyed credentials, to catch "I copied a snippet"
  case "$KEY" in
    ANTHROPIC_API_KEY)
      if [ "${#VALUE}" -lt 50 ]; then
        echo "✗ refusing to set $KEY — only ${#VALUE} chars; real Anthropic keys are ~108."
        echo "  Get one at https://console.anthropic.com/settings/keys"
        exit 2
      fi
      case "$VALUE" in
        sk-ant-*) ;;
        *) echo "✗ refusing to set $KEY — must start with 'sk-ant-' (yours starts with: ${VALUE:0:8}…)"; exit 2;;
      esac
      ;;
    GOOGLE_API_KEY)
      case "$VALUE" in
        AIza*) ;;
        *) echo "✗ refusing to set $KEY — must start with 'AIza' (yours starts with: ${VALUE:0:8}…)"; exit 2;;
      esac
      if [ "${#VALUE}" -lt 30 ]; then echo "✗ $KEY only ${#VALUE} chars; real Google API keys are ~39"; exit 2; fi
      ;;
    GROQ_API_KEY)
      case "$VALUE" in
        gsk_*) ;;
        *) echo "✗ refusing to set $KEY — must start with 'gsk_' (yours starts with: ${VALUE:0:8}…)"; exit 2;;
      esac
      if [ "${#VALUE}" -lt 40 ]; then echo "✗ $KEY only ${#VALUE} chars; real Groq keys are ~56"; exit 2; fi
      ;;
    RAZORPAY_KEY_ID)
      case "$VALUE" in rzp_*) ;; *) echo "✗ $KEY must start with rzp_test_ or rzp_live_"; exit 2;; esac
      ;;
    RESEND_API_KEY)
      case "$VALUE" in re_*) ;; *) echo "✗ $KEY must start with re_"; exit 2;; esac
      ;;
  esac

  # Encode KEY and VALUE for safe transport: base64 the value to dodge any
  # shell / sed metacharacters (sk-ant-... keys are alphanumeric, but Resend
  # FROM strings contain spaces and angle brackets).
  V_B64=$(printf '%s' "$VALUE" | base64 | tr -d '\n')
  REMOTE_CMDS+=" V=\$(echo '$V_B64' | base64 -d);"
  # Use awk to replace or append the line. Quotes around the assignment so
  # values with spaces survive.
  REMOTE_CMDS+=" awk -v k='$KEY' -v v=\"\$V\" '
    BEGIN { found=0 }
    \$0 ~ \"^\" k \"=\" { print k \"=\" v; found=1; next }
    { print }
    END { if (!found) print k \"=\" v }' '$ENV_FILE' > '$ENV_FILE.tmp' && mv '$ENV_FILE.tmp' '$ENV_FILE';"
done

REMOTE_CMDS+=" echo '▶ updated keys:'; for k in ${KNOWN_KEYS[*]}; do
  v=\$(grep -E \"^\$k=\" '$ENV_FILE' | head -1 | cut -d= -f2-)
  if [ -z \"\$v\" ]; then echo \"  \$k = (empty)\"; else echo \"  \$k = ***set, \$(printf %s \"\$v\" | wc -c) chars***\"; fi
done;"
REMOTE_CMDS+=" echo '▶ restart $SERVICE'; pm2 restart $SERVICE >/dev/null && echo 'restarted'; pm2 jlist | grep -o '\"name\":\"$SERVICE\"' >/dev/null && echo '$SERVICE is running';"

echo "▶ ssh $VPS — updating $ENV_FILE"
ssh -o StrictHostKeyChecking=accept-new "$VPS" "$REMOTE_CMDS"

# ─── Per-integration verify curls ────────────────────────────────────────
echo
echo "▶ verifying"
for KEY in "${KNOWN_KEYS[@]}"; do
  case "$KEY" in
    ANTHROPIC_API_KEY|GOOGLE_API_KEY|GROQ_API_KEY|AYURBOT_PROVIDER)
      sleep 2 # pm2 restart settle
      RES=$(curl -fsS "https://$DOMAIN/api/ayurbot/status" || echo '{}')
      echo "  $KEY → /api/ayurbot/status = $RES"
      ;;
    RAZORPAY_KEY_ID|RAZORPAY_KEY_SECRET)
      RES=$(curl -fsS "https://$DOMAIN/api/payments/config" || echo '{}')
      echo "  RAZORPAY_*       → /api/payments/config = $RES"
      ;;
    RESEND_API_KEY|RESEND_FROM)
      echo "  RESEND_*         → no public verify endpoint (sign up a test user to confirm)"
      ;;
    TWILIO_ACCOUNT_SID|TWILIO_AUTH_TOKEN|TWILIO_FROM)
      echo "  TWILIO_*         → no public verify endpoint (will go live once next SMS is sent)"
      ;;
  esac
done

echo
echo "✓ done"
