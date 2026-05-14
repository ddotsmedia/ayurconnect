import type { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { chat, chatStream, pickProvider } from '../lib/llm.js'

export const autoPrefix = '/ayurbot'

// Build a personalization snippet to append to the system prompt when a user
// is signed in. Pulls dosha + recent journal symptoms + last assessment date.
// Kept short on purpose — long context = slow response + higher token cost.
// Falls open: if anything fails we just use the anonymous prompt.
async function personalContext(fastify: FastifyInstance, userId: string | null | undefined): Promise<string> {
  if (!userId) return ''
  try {
    const [user, journal, assessment] = await Promise.all([
      fastify.prisma.user.findUnique({ where: { id: userId }, select: { name: true, prakriti: true, country: true } }),
      fastify.prisma.journalEntry.findMany({
        where: { userId, date: { gte: new Date(Date.now() - 14 * 86400 * 1000) } },
        select: { date: true, symptoms: true, mood: true, doshaFeel: true },
        orderBy: { date: 'desc' },
        take: 14,
      }),
      fastify.prisma.prakritiAssessment.findFirst({
        where: { userId },
        select: { dominant: true, vata: true, pitta: true, kapha: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    if (!user) return ''
    const lines: string[] = []
    const dosha = user.prakriti ?? assessment?.dominant ?? null
    if (dosha) lines.push(`The user's known Prakriti (Ayurvedic constitution) is: ${dosha}. Tailor recommendations to balance this dosha.`)
    if (journal.length > 0) {
      const symptoms = Array.from(new Set(journal.flatMap((j) => j.symptoms))).slice(0, 8)
      if (symptoms.length > 0) lines.push(`Recent reported symptoms (last 14 days): ${symptoms.join(', ')}.`)
      const recentDosha = journal.find((j) => j.doshaFeel)?.doshaFeel
      if (recentDosha) lines.push(`Recently the user has been feeling ${recentDosha}-imbalanced.`)
    }
    if (lines.length === 0) return ''
    return '\n\n--- PERSONALIZATION (signed-in user) ---\n' + lines.join(' ') + '\n--- END PERSONALIZATION ---'
  } catch {
    return ''
  }
}

const SYSTEM_PROMPTS = {
  default: 'You are AyurBot, an AI assistant specializing in Ayurveda. Provide helpful, accurate information about Ayurvedic medicine, herbs, treatments, and wellness practices. Always include a disclaimer that this is not medical advice and to consult a qualified Ayurvedic practitioner.',
  prakriti: "You are helping determine a user's Prakriti (Ayurvedic body type). Ask questions about physical characteristics, preferences, and habits to identify Vata, Pitta, or Kapha dominance.",
  herb: 'You are providing information about Ayurvedic herbs. Include Rasa (taste), Guna (quality), Virya (potency), Vipaka (post-digestive effect), and traditional uses.',
  symptom: 'You are helping with Ayurvedic approaches to common symptoms. Suggest natural remedies, lifestyle changes, and when to consult a practitioner.',
} as const

type PromptType = keyof typeof SYSTEM_PROMPTS

// Public AyurBot endpoints hit paid LLM providers (Claude/Gemini/Groq).
// Without throttling, anyone can drain credits with a curl loop. Cap per-IP
// to RL_MAX requests per RL_WINDOW_SECONDS using a Redis counter (auto-expires).
// Falls open on Redis errors so a Redis hiccup doesn't take chat offline.
const RL_WINDOW_SECONDS = 60
const RL_MAX = 10  // 10 chats / minute / IP — generous for humans, tight for scripts

async function rateLimitOk(
  fastify: { redis: { incr: (k: string) => Promise<number>; expire: (k: string, s: number) => Promise<number> }; log: { warn: (m: object, s: string) => void } },
  req: FastifyRequest,
  reply: FastifyReply,
  bucket: string,
): Promise<boolean> {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown'
  const key = `rl:ayurbot:${bucket}:${ip}`
  try {
    const count = await fastify.redis.incr(key)
    if (count === 1) await fastify.redis.expire(key, RL_WINDOW_SECONDS)
    if (count > RL_MAX) {
      reply.code(429).send({
        error: `Too many AyurBot requests. Limit is ${RL_MAX}/min — please wait a minute.`,
        code: 'rate-limited',
      })
      return false
    }
    return true
  } catch (err) {
    // Redis down — log and fall open (don't break chat for the whole site).
    fastify.log.warn({ err, ip }, 'ayurbot rate-limit check failed (allowing through)')
    return true
  }
}

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
    if (!(await rateLimitOk(fastify, request, reply, 'chat'))) return
    const { message, type } = request.body as { message?: string; type?: PromptType }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return reply.code(400).send({ error: 'message required', code: 'bad-input' })
    }
    // Cap incoming message — Claude's token budget is real money.
    if (message.length > 4000) {
      return reply.code(400).send({ error: 'message too long (max 4000 chars)', code: 'bad-input' })
    }
    const basePrompt = SYSTEM_PROMPTS[type ?? 'default'] ?? SYSTEM_PROMPTS.default
    const ctx = await personalContext(fastify, request.session?.user.id)
    const system = basePrompt + ctx

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

  // ─── Streaming chat (SSE) ─────────────────────────────────────────────
  // GET so EventSource works (POST works too via fetch+ReadableStream readers).
  // Query: ?message=...&type=default|prakriti|herb|symptom
  fastify.get('/chat-stream', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, 'stream'))) return
    const { message, type } = request.query as { message?: string; type?: PromptType }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return reply.code(400).send({ error: 'message required' })
    }
    if (message.length > 4000) {
      return reply.code(400).send({ error: 'message too long (max 4000 chars)' })
    }
    const basePrompt = SYSTEM_PROMPTS[type ?? 'default'] ?? SYSTEM_PROMPTS.default
    const ctx = await personalContext(fastify, request.session?.user.id)
    const system = basePrompt + ctx

    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
      // Prevent buffered nginx from delaying chunks:
      'x-accel-buffering': 'no',
    })

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\n`)
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    try {
      for await (const chunk of chatStream({ system, message })) {
        if (chunk.type === 'text')   send('delta', { text: chunk.delta })
        if (chunk.type === 'done')   send('done',  { provider: chunk.provider })
        if (chunk.type === 'error')  send('error', { reason: chunk.reason, code: chunk.code, provider: chunk.provider })
      }
    } catch (err) {
      send('error', { reason: err instanceof Error ? err.message : String(err), code: 'upstream-error', provider: null })
    } finally {
      reply.raw.end()
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
