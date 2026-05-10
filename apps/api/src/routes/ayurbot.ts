import type { FastifyPluginAsync } from 'fastify'
import { chat, pickProvider } from '../lib/llm.js'

export const autoPrefix = '/ayurbot'

const SYSTEM_PROMPTS = {
  default: 'You are AyurBot, an AI assistant specializing in Ayurveda. Provide helpful, accurate information about Ayurvedic medicine, herbs, treatments, and wellness practices. Always include a disclaimer that this is not medical advice and to consult a qualified Ayurvedic practitioner.',
  prakriti: "You are helping determine a user's Prakriti (Ayurvedic body type). Ask questions about physical characteristics, preferences, and habits to identify Vata, Pitta, or Kapha dominance.",
  herb: 'You are providing information about Ayurvedic herbs. Include Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect), and traditional uses.',
  symptom: 'You are helping with Ayurvedic approaches to common symptoms. Suggest natural remedies, lifestyle changes, and when to consult a practitioner.',
} as const

type PromptType = keyof typeof SYSTEM_PROMPTS

const ayurbot: FastifyPluginAsync = async (fastify) => {
  // Public health check — which provider is active and is it usable?
  fastify.get('/status', async () => {
    const s = pickProvider()
    return {
      enabled: s.ok,
      provider: s.provider,
      model: s.model ?? null,
      reason: s.reason ?? null,
    }
  })

  fastify.post('/chat', async (request, reply) => {
    const { message, type } = request.body as { message?: string; type?: PromptType }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return reply.code(400).send({ error: 'message required', code: 'bad-input' })
    }
    const system = SYSTEM_PROMPTS[type ?? 'default'] ?? SYSTEM_PROMPTS.default

    const result = await chat({ system, message })
    if (result.ok === true) {
      return { response: result.text, provider: result.provider }
    }
    // result is now { ok: false, ... }
    const failure = result as Extract<typeof result, { ok: false }>
    fastify.log.error({ result: failure }, 'ayurbot chat failed')

    const code = failure.code
    const provider = failure.provider ?? 'AyurBot'
    const friendly =
      code === 'not-configured' ? 'AyurBot is not configured on this server.' :
      code === 'auth-failed'    ? `${provider} rejected the API key.` :
      code === 'no-credits'     ? `${provider} reports no usable credits/quota.` :
      code === 'rate-limited'   ? `${provider} is rate-limiting us right now. Please try again in a minute.` :
                                  `${provider} upstream error.`

    // Use 503 (not 502) for upstream issues so Cloudflare doesn't replace
    // our JSON body with its own plain "error code: 502" page.
    const httpStatus = code === 'rate-limited' ? 429 : 503
    return reply.code(httpStatus).send({
      error: friendly,
      reason: failure.reason,
      code,
      provider: failure.provider,
    })
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
