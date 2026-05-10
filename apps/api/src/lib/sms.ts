// Tiny Twilio-backed SMS helper. No-op (logs only) if TWILIO_* env vars aren't set.
// Used (or to be used) by appointment confirmations / reminders.
//
// We intentionally don't import the twilio SDK at module-load time — the package
// may not be installed in dev. We dynamic-import it inside getClient(), so the
// app starts cleanly even without it. Once the user installs `twilio` and pastes
// keys, smsEnabled() flips to true and sendSms() goes live.

const SID   = process.env.TWILIO_ACCOUNT_SID
const TOKEN = process.env.TWILIO_AUTH_TOKEN
const FROM  = process.env.TWILIO_FROM // e.g. "+1XXXXXXXXXX" or alphanumeric sender

type TwilioClient = { messages: { create: (opts: { to: string; from: string; body: string }) => Promise<{ sid: string }> } }
let client: TwilioClient | null = null

async function getClient(): Promise<TwilioClient | null> {
  if (!SID || !TOKEN || !FROM) return null
  if (client) return client
  try {
    // Dynamic import via the Function constructor so TS doesn't try to resolve types
    // for an optional dependency that might not be installed.
    const dynImport = new Function('m', 'return import(m)') as (m: string) => Promise<{ default: (sid: string, token: string) => TwilioClient }>
    const mod = await dynImport('twilio').catch(() => null)
    if (!mod) return null
    client = mod.default(SID, TOKEN)
    return client
  } catch {
    return null
  }
}

export type SmsOpts = { to: string; body: string }

export async function sendSms(opts: SmsOpts): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const c = await getClient()
  if (!c) {
    // eslint-disable-next-line no-console
    console.log('[sms]', opts.to, '·', opts.body.slice(0, 60), '(TWILIO_* not configured; would have sent)')
    return { ok: true }
  }
  try {
    const res = await c.messages.create({ to: opts.to, from: FROM!, body: opts.body })
    return { ok: true, sid: res.sid }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export const smsEnabled = () => !!(SID && TOKEN && FROM)
