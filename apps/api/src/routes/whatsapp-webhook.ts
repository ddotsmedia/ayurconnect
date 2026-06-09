import type { FastifyPluginAsync } from 'fastify'
import { whatsappEnabled, sendWhatsApp } from '../lib/whatsapp.js'

export const autoPrefix = '/whatsapp'

// Inbound WhatsApp webhook — Twilio posts an application/x-www-form-urlencoded
// payload here for every inbound message. This is a lightweight FAQ bot with a
// booking handoff (deep-link into the consultation flow).
//
// SETUP (when Twilio credentials are provisioned):
//   1. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in env.
//   2. In the Twilio console → WhatsApp sender → "When a message comes in",
//      set the webhook URL to: https://ayurconnect.com/api/whatsapp/inbound (POST).
//   3. Approve message templates for the outbound reminders (see crons).
//
// Until credentials are set, sendWhatsApp() is a logging no-op, so this route is
// safe to deploy: it parses the message and "would-send" the reply to the log.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'

// Minimal intent → reply mapping. Real NLU can be layered in later; this keeps
// the bot useful and predictable for the most common inbound asks.
function botReply(text: string): string {
  const t = text.trim().toLowerCase()

  if (/^(stop|unsubscribe|cancel)$/.test(t)) {
    return 'You have been unsubscribed from AyurConnect WhatsApp messages. Reply START to opt back in.'
  }
  if (/^(start|subscribe|yes)$/.test(t)) {
    return 'You are subscribed to AyurConnect updates. How can we help? Reply BOOK to book a consultation, DOCTORS to find a doctor, or HELP for options.'
  }
  if (/\b(book|appointment|consult)/.test(t)) {
    return `To book a consultation with a verified Kerala Ayurveda doctor, tap here: ${APP_URL}/consult`
  }
  if (/\b(doctor|vaidya|specialist)/.test(t)) {
    return `Browse and filter verified doctors here: ${APP_URL}/doctors`
  }
  if (/\b(karkidaka|monsoon)/.test(t)) {
    return `Karkidaka Chikitsa is Kerala's monsoon rejuvenation season. Learn more and enquire: ${APP_URL}/karkidaka`
  }
  if (/\b(treatment|panchakarma|pizhichil|therapy)/.test(t)) {
    return `Explore specialised treatments: ${APP_URL}/treatments`
  }
  if (/\b(price|cost|fee|charge)/.test(t)) {
    return `Estimate treatment costs here: ${APP_URL}/cost-estimator`
  }
  if (/\b(help|menu|options|hi|hello|hey)/.test(t) || t.length === 0) {
    return [
      'Welcome to AyurConnect 🌿',
      'Reply with a keyword:',
      '• BOOK — book a consultation',
      '• DOCTORS — find a verified doctor',
      '• TREATMENT — explore treatments',
      '• KARKIDAKA — monsoon healing season',
      '• COST — estimate treatment cost',
      'Reply STOP to unsubscribe.',
    ].join('\n')
  }
  return `Thanks for your message. Reply HELP to see options, or book a consultation: ${APP_URL}/consult`
}

const route: FastifyPluginAsync = async (fastify) => {
  // Health/status — confirms whether outbound messaging is configured.
  fastify.get('/status', async () => ({
    inbound: 'ready',
    outboundConfigured: whatsappEnabled(),
    note: whatsappEnabled()
      ? 'Twilio WhatsApp is configured.'
      : 'Twilio credentials not set — replies are logged but not delivered. See route header for setup.',
  }))

  // Twilio inbound webhook. Twilio sends form-encoded fields: From, Body, etc.
  fastify.post('/inbound', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>
    const from = typeof body.From === 'string' ? body.From.replace(/^whatsapp:/, '') : ''
    const text = typeof body.Body === 'string' ? body.Body : ''

    if (!from) {
      // Twilio expects a 200 with (optionally) TwiML; bail gracefully.
      return reply.type('text/xml').send('<Response/>')
    }

    const answer = botReply(text)
    fastify.log.info({ from, inbound: text.slice(0, 120) }, 'whatsapp.inbound')

    // Send the reply out-of-band via the REST API (no-op log if unconfigured).
    // We respond to Twilio with empty TwiML so it doesn't double-send.
    void sendWhatsApp({ to: from, body: answer }).catch((e) => {
      fastify.log.warn({ err: String(e) }, 'whatsapp.reply.failed')
    })

    return reply.type('text/xml').send('<Response/>')
  })
}

export default route
