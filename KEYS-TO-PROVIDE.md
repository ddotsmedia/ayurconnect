# Integration keys to paste

The site works with these set to empty (features degrade gracefully). To turn each one on, SSH to the VPS, edit `/opt/ayurconnect/apps/api/.env`, paste the value, then `pm2 restart ayurconnect-api`.

## 1. Anthropic Claude (AyurBot chat)

**Without it:** AyurBot widget says "I'm offline right now."
**With it:** Real Claude responses with the Kerala-Ayurveda system prompt.

Where to get: https://console.anthropic.com/settings/keys (you said you have one).

```bash
ssh root@194.164.151.202
nano /opt/ayurconnect/apps/api/.env
# replace ANTHROPIC_API_KEY=REPLACE_ME_BEFORE_USING_AYURBOT with the real sk-ant-... value
pm2 restart ayurconnect-api
```

Verify: `curl -X POST https://ayurconnect.com/api/ayurbot/chat -H 'content-type: application/json' -d '{"message":"What is Panchakarma?"}'` should return a real answer, not 502.

## 2. Resend (email verification + appointment confirmations)

**Without it:** Signups don't require email verification (current behaviour). No appointment confirmation emails.
**With it:** Better Auth requires email verification on every new signup; users get a styled "verify your email" message via Resend; appointment booking sends confirmation emails to patient + doctor.

Where to get: https://resend.com (sign up, free tier = 3000/mo, 100/day) → API Keys → "Create API Key" → copy the `re_...` value.

If you don't yet have a verified sender domain in Resend, leave `RESEND_FROM` as `AyurConnect <onboarding@resend.dev>` — Resend's shared dev domain works without setup. To send from your own domain, verify `ayurconnect.com` in Resend (DNS records) and change `RESEND_FROM` to `AyurConnect <hello@ayurconnect.com>`.

```bash
ssh root@194.164.151.202
nano /opt/ayurconnect/apps/api/.env
# RESEND_API_KEY=re_...
# (optionally) RESEND_FROM=AyurConnect <onboarding@resend.dev>
pm2 restart ayurconnect-api
```

Verify: sign up a new test user at https://ayurconnect.com/sign-in — you should receive a verification email within a few seconds.

## 3. Razorpay TEST keys (booking payments)

**Without them:** Booking flow works through step 4; payment button is disabled and the appointment is saved as "payment pending" — fine for offline / pay-at-clinic flows.
**With them:** "Pay ₹X with Razorpay" button opens Razorpay Checkout (test mode), you can pay with card `4111 1111 1111 1111` / any future expiry / any 3-digit CVV. On success the appointment flips to `confirmed` + `paid`.

Where to get: https://dashboard.razorpay.com → Settings → API Keys → "Generate Test Key". Copy both `key_id` (starts with `rzp_test_`) and `key_secret`.

```bash
ssh root@194.164.151.202
nano /opt/ayurconnect/apps/api/.env
# RAZORPAY_KEY_ID=rzp_test_...
# RAZORPAY_KEY_SECRET=...
pm2 restart ayurconnect-api
```

Verify: `curl https://ayurconnect.com/api/payments/config` should return `{"enabled":true,...}`.

When you're ready for live payments, generate live keys in Razorpay (after KYC) and replace these. The webhook URL to register in Razorpay (for production) is `https://ayurconnect.com/api/payments/webhook` — that endpoint isn't built yet; ask me to add it when you go live.

## 4. Twilio SMS (optional — appointment reminders)

**Without it:** `sendSms()` logs and returns `{ ok: true }` so flows keep working.
**With it:** Real SMS via Twilio.

Where to get: https://console.twilio.com → "Account info" → SID + Auth Token. Buy a sender number under "Phone Numbers".

```bash
ssh root@194.164.151.202
nano /opt/ayurconnect/apps/api/.env
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_FROM=+1XXXXXXXXXX
pm2 restart ayurconnect-api
```

You also need to install the SDK once: `cd /opt/ayurconnect && pnpm --filter api add twilio`. The helper dynamic-imports it so the app starts cleanly even if absent.

## 5. PostHog (optional — product analytics)

**Without it:** `capture()` is a no-op.
**With it:** Events (doctor_search, ayurbot_message, booking_started, etc.) flow into PostHog.

Where to get: https://app.posthog.com → Project Settings → Project API Key. Public key, safe to expose.

```bash
ssh root@194.164.151.202
nano /opt/ayurconnect/apps/web/.env.local
# NEXT_PUBLIC_POSTHOG_KEY=phc_...
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
pm2 restart ayurconnect-web
```

You also need to install the SDK once: `pnpm --filter @ayurconnect/web add posthog-js`.

## 6. Google Maps (optional — only for embed iframes)

Link-out to Google Maps (Search / Directions) works without a key. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` only if you want `<iframe>` embeds inside the site.

---

## After you paste any key

The VPS has the updated env file but PM2 doesn't see the change until you restart:

```bash
pm2 restart ayurconnect-api
```

To check what env values are currently active without leaking them:

```bash
pm2 info ayurconnect-api | grep -E 'pid|uptime|restarts'
ssh root@194.164.151.202 'cd /opt/ayurconnect/apps/api && grep -c "^[A-Z_]*=" .env'   # how many env vars set
```

To see which integration features are currently live:

```bash
curl https://ayurconnect.com/api/payments/config              # razorpay
# (no public endpoint for resend/anthropic; you'll know they work when emails arrive / AyurBot replies)
```
