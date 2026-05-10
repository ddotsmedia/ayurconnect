// Tiny Resend-backed email helper. No-op (logs only) if RESEND_API_KEY isn't set.
//
// Used by:
//   - Better Auth (email verification, on signup)
//   - apps/api/src/routes/appointments.ts (booking confirmations — Phase 13)

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM ?? 'AyurConnect <hello@ayurconnect.com>'
const KEY  = process.env.RESEND_API_KEY

let client: Resend | null = null
function getClient(): Resend | null {
  if (!KEY) return null
  if (!client) client = new Resend(KEY)
  return client
}

export type SendOpts = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

export async function sendEmail(opts: SendOpts): Promise<{ ok: boolean; id?: string; error?: string }> {
  const c = getClient()
  if (!c) {
    // Dev / pre-keys: log and pretend success so flows don't break.
    // eslint-disable-next-line no-console
    console.log('[email]', opts.to, '·', opts.subject, '(RESEND_API_KEY not set; would have sent)')
    return { ok: true }
  }
  try {
    const res = await c.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html ?? `<pre>${opts.text ?? ''}</pre>`,
      text: opts.text,
      replyTo: opts.replyTo,
    })
    if (res.error) return { ok: false, error: String(res.error) }
    return { ok: true, id: res.data?.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export const emailEnabled = () => !!KEY
