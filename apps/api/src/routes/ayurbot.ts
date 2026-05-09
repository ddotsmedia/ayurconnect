import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ayurbot'

const SYSTEM_PROMPTS = {
  default: 'You are AyurBot, an AI assistant specializing in Ayurveda. Provide helpful, accurate information about Ayurvedic medicine, herbs, treatments, and wellness practices. Always include a disclaimer that this is not medical advice and to consult a qualified Ayurvedic practitioner.',
  prakriti: "You are helping determine a user's Prakriti (Ayurvedic body type). Ask questions about physical characteristics, preferences, and habits to identify Vata, Pitta, or Kapha dominance.",
  herb: 'You are providing information about Ayurvedic herbs. Include Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect), and traditional uses.',
  symptom: 'You are helping with Ayurvedic approaches to common symptoms. Suggest natural remedies, lifestyle changes, and when to consult a practitioner.',
} as const

type PromptType = keyof typeof SYSTEM_PROMPTS

const ayurbot: FastifyPluginAsync = async (fastify) => {
  fastify.post('/chat', async (request, reply) => {
    const { message, type } = request.body as { message: string; type?: PromptType }
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
      fastify.log.error({ err }, 'anthropic chat failed')
      return reply.code(502).send({ error: 'AI service unavailable' })
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
