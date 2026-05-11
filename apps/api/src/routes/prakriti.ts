import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/prakriti'

// Public Prakriti quiz result submission. Anonymous attempts get stored
// against the request's session-cookie value; signed-in users link to the
// User row. The dominant dosha is also written back to user.prakriti as a
// convenience so the dashboard can show it without a separate query.

const VALID_DOMINANTS = new Set([
  'vata', 'pitta', 'kapha',
  'vata-pitta', 'pitta-kapha', 'vata-kapha',
  'tridoshic',
])

function pickSessionId(request: { headers: Record<string, string | string[] | undefined> }): string | null {
  // Use the Better Auth session token if present, otherwise fall back to null.
  // Purely for analytics correlation — we don't issue our own cookie.
  const ck = (request.headers.cookie as string) || ''
  const m = ck.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/)
  if (m) return m[1].slice(0, 60)
  return null
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const body = request.body as { vata?: number; pitta?: number; kapha?: number; dominant?: string; responses?: Record<string, string> }
    const v = Number(body.vata)
    const p = Number(body.pitta)
    const k = Number(body.kapha)
    const dominant = String(body.dominant ?? '').toLowerCase()
    const responses = body.responses && typeof body.responses === 'object' ? body.responses : {}

    if (!Number.isFinite(v) || v < 0 || v > 100) return reply.code(400).send({ error: 'invalid vata score' })
    if (!Number.isFinite(p) || p < 0 || p > 100) return reply.code(400).send({ error: 'invalid pitta score' })
    if (!Number.isFinite(k) || k < 0 || k > 100) return reply.code(400).send({ error: 'invalid kapha score' })
    if (!VALID_DOMINANTS.has(dominant))         return reply.code(400).send({ error: 'invalid dominant dosha' })

    // userId from session if signed in (Better Auth hook decorates request.session optionally)
    const userId: string | null = request.session?.user?.id ?? null
    const sessionId = userId ? null : pickSessionId(request)

    const assessment = await fastify.prisma.prakritiAssessment.create({
      data: {
        userId,
        sessionId,
        vata: v,
        pitta: p,
        kapha: k,
        dominant,
        responses: responses as never,
      },
      select: { id: true, createdAt: true, dominant: true },
    })

    // Convenience write-back to User.prakriti for signed-in users.
    if (userId) {
      await fastify.prisma.user.update({
        where: { id: userId },
        data: { prakriti: dominant },
      }).catch(() => undefined)
    }

    return { ok: true, assessment }
  })

  // GET /prakriti/me — latest result for signed-in user
  fastify.get('/me', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })
    const latest = await fastify.prisma.prakritiAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return { assessment: latest }
  })
}

export default route
