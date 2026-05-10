import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ayurbot'

const SYSTEM_PROMPTS = {
  default: 'You are AyurBot, an AI assistant specializing in Ayurveda. Provide helpful, accurate information about Ayurvedic medicine, herbs, treatments, and wellness practices. Always include a disclaimer that this is not medical advice and to consult a qualified Ayurvedic practitioner.',
  prakriti: "You are helping determine a user's Prakriti (Ayurvedic body type). Ask questions about physical characteristics, preferences, and habits to identify Vata, Pitta, or Kapha dominance.",
  herb: 'You are providing information about Ayurvedic herbs. Include Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect), and traditional uses.',
  symptom: 'You are helping with Ayurvedic approaches to common symptoms. Suggest natural remedies, lifestyle changes, and when to consult a practitioner.',
} as const

type PromptType = keyof typeof SYSTEM_PROMPTS

// A key counts as "real" if it has the sk-ant- prefix AND is long enough AND
// doesn't contain placeholder ellipses. Real Anthropic keys are ~108 chars.
function keyState(): { ok: boolean; reason?: string } {
  const k = (process.env.ANTHROPIC_API_KEY ?? '').trim()
  if (!k)                              return { ok: false, reason: 'ANTHROPIC_API_KEY not set' }
  if (/^replace_me/i.test(k))          return { ok: false, reason: 'ANTHROPIC_API_KEY is the placeholder REPLACE_ME_…' }
  if (!k.startsWith('sk-ant-'))        return { ok: false, reason: 'ANTHROPIC_API_KEY does not look like a Claude key (should start with sk-ant-)' }
  if (/\.{3}/.test(k))                 return { ok: false, reason: 'ANTHROPIC_API_KEY contains "..." — looks like an example, not a real key' }
  if (/your[-_]?real[-_]?key|your[-_]?key|xxxx|placeholder/i.test(k))
                                       return { ok: false, reason: 'ANTHROPIC_API_KEY contains placeholder text' }
  if (k.length < 50)                   return { ok: false, reason: `ANTHROPIC_API_KEY is too short (${k.length} chars; real keys are ~108)` }
  return { ok: true }
}

const ayurbot: FastifyPluginAsync = async (fastify) => {
  // Public lightweight health: is AyurBot configured? Used by the widget to
  // show "offline · not configured" without firing an API call first.
  fastify.get('/status', async () => {
    const k = keyState()
    return { enabled: k.ok, reason: k.reason ?? null, model: 'claude-haiku-4-5-20251001' }
  })

  fastify.post('/chat', async (request, reply) => {
    const k = keyState()
    if (!k.ok) {
      return reply.code(503).send({
        error: 'AyurBot is not configured on this server.',
        reason: k.reason,
        code: 'not-configured',
      })
    }

    const { message, type } = request.body as { message?: string; type?: PromptType }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return reply.code(400).send({ error: 'message required', code: 'bad-input' })
    }

    const system = SYSTEM_PROMPTS[type ?? 'default'] ?? SYSTEM_PROMPTS.default

    try {
      const response = await fastify.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: message }],
      })
      const first = response.content[0]
      const text = first?.type === 'text' ? first.text : ''
      return { response: text }
    } catch (err) {
      const e = err as { status?: number; message?: string; error?: { error?: { message?: string } } }
      const status  = e?.status ?? 0
      const upstream = e?.error?.error?.message ?? e?.message ?? 'unknown error'
      fastify.log.error({ err }, 'anthropic chat failed')

      if (status === 401) {
        return reply.code(503).send({
          error: 'Anthropic rejected the API key.',
          reason: 'The configured ANTHROPIC_API_KEY is invalid or revoked.',
          code: 'auth-failed',
        })
      }
      if (status === 429) {
        return reply.code(429).send({
          error: 'AyurBot is rate-limited right now. Please try again in a minute.',
          reason: upstream,
          code: 'rate-limited',
        })
      }
      // Anthropic returns 400 invalid_request_error for "credit balance is too
      // low" — common during free-tier exhaustion. Surface it specifically so
      // we (and the widget) can prompt a top-up rather than show a generic 502.
      if (status === 400 && /credit balance|insufficient.*credit|billing/i.test(upstream)) {
        return reply.code(503).send({
          error: 'AyurBot is out of credits.',
          reason: 'The Anthropic account has zero/insufficient credits. Top up at https://console.anthropic.com/settings/billing',
          code: 'no-credits',
        })
      }
      // Use 503 instead of 502 so Cloudflare doesn't replace our JSON body
      // with its own plain-text "error code: 502" page.
      return reply.code(503).send({
        error: 'AyurBot upstream error.',
        reason: upstream,
        code: 'upstream-error',
        status,
      })
    }
  })

  fastify.post('/quiz', async (request) => {
    const { answers } = request.body as { answers: Record<string, string> }
    let vata = 0, pitta = 0, kapha = 0
    for (const ans of Object.values(answers ?? {})) {
      const a = ans.toLowerCase()
      if (a.includes('dry') || a.includes('cold') || a.includes('light')) vata++
      if (a.includes('hot') || a.includes('sharp') || a.includes('intense')) pitta++
      if (a.includes('heavy') || a.includes('slow') || a.includes('steady')) kapha++
    }
    const prakriti = vata >= pitta && vata >= kapha ? 'Vata' : pitta >= kapha ? 'Pitta' : 'Kapha'
    return { prakriti, scores: { vata, pitta, kapha } }
  })
}

export default ayurbot
