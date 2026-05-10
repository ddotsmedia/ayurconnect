// Twilio WhatsApp helper. Mirrors lib/sms.ts but routes via the WhatsApp
// channel by prefixing both `from` and `to` with `whatsapp:`.
//
// No-op (logs only) if TWILIO_* envs aren't set OR TWILIO_WHATSAPP_FROM is missing.
//
// Setup:
//   1. Get a Twilio account + WhatsApp sandbox/sender at
//      https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
//   2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)
//   3. Recipients must opt-in via the sandbox keyword or be on an approved sender list.
//
// We use Twilio's REST API directly via fetch — no SDK install required.

const SID    = process.env.TWILIO_ACCOUNT_SID
const TOKEN  = process.env.TWILIO_AUTH_TOKEN
const FROM   = process.env.TWILIO_WHATSAPP_FROM ?? process.env.TWILIO_FROM // fall back to SMS sender if same
const REGION = process.env.TWILIO_REGION ?? 'us1'

export type WhatsAppOpts = {
  to: string         // E.164 number, e.g. "+919447000001"
  body: string       // plain text or template message
  /** Optional template SID for outbound-initiated messages. */
  contentSid?: string
  /** Variables for content template. */
  contentVariables?: Record<string, string>
}

export const whatsappEnabled = (): boolean => Boolean(SID && TOKEN && FROM)

export async function sendWhatsApp(opts: WhatsAppOpts): Promise<{ ok: boolean; sid?: string; error?: string }> {
  if (!whatsappEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[whatsapp]', opts.to, '·', opts.body.slice(0, 80), '(TWILIO_WHATSAPP_FROM not configured; would have sent)')
    return { ok: true }
  }

  const url = `https://api.${REGION}.twilio.com/2010-04-01/Accounts/${SID!}/Messages.json`
  const auth = Buffer.from(`${SID}:${TOKEN}`).toString('base64')

  const params = new URLSearchParams()
  params.set('From', FROM!.startsWith('whatsapp:') ? FROM! : `whatsapp:${FROM}`)
  params.set('To',   opts.to.startsWith('whatsapp:') ? opts.to : `whatsapp:${opts.to}`)
  if (opts.contentSid) {
    params.set('ContentSid', opts.contentSid)
    if (opts.contentVariables) params.set('ContentVariables', JSON.stringify(opts.contentVariables))
  } else {
    params.set('Body', opts.body)
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'authorization': `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const json = await res.json().catch(() => ({})) as { sid?: string; message?: string }
    if (!res.ok) return { ok: false, error: json.message ?? `HTTP ${res.status}` }
    return { ok: true, sid: json.sid }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
