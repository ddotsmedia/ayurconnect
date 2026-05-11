import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/leads'

// Public lead-capture endpoint for cost-estimator, contact, and partnership
// forms on the marketing pages. Deliberately unauthenticated — non-registered
// visitors must be able to submit. Light rate-limit + spam guards keep it sane.
//
// Sister admin endpoints live in admin.ts under /admin/leads.

const ALLOWED_KINDS = new Set([
  'cost_estimator',
  'contact',
  'partnership',
  'franchise',
  'marketplace_vendor',  // /marketplace vendor inquiry form
  'academy',             // /academy course interest form
  'product_waitlist',    // /products/{hms,saas,mobile} waitlist form
])

// Naive in-process rate-limit: 5 submissions / 10 min / IP. Process-local, so
// won't survive PM2 reload and won't sync across instances — acceptable for
// the volume we expect (marketing page submissions). Upgrade to Redis if we
// ever cross ~100 submissions/hour.
const IP_BUCKETS = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS  = 10 * 60_000
const MAX_HITS   = 5

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = IP_BUCKETS.get(ip)
  if (!bucket || bucket.resetAt < now) {
    IP_BUCKETS.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (bucket.count >= MAX_HITS) return false
  bucket.count += 1
  return true
}

function trim(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const ip = (request.headers['cf-connecting-ip'] as string)
      ?? (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? request.ip
    if (!rateLimit(ip)) return reply.code(429).send({ error: 'too many submissions — try again in a few minutes' })

    const body = request.body as Record<string, unknown>
    const kind = trim(body.kind, 40)
    if (!ALLOWED_KINDS.has(kind)) return reply.code(400).send({ error: 'invalid kind' })

    const name    = trim(body.name, 120)
    const email   = trim(body.email, 200)
    const message = trim(body.message, 4000)
    if (!name)    return reply.code(400).send({ error: 'name required' })
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ error: 'valid email required' })
    if (!message) return reply.code(400).send({ error: 'message required' })

    const phone   = body.phone ? trim(body.phone, 30) || null : null
    const country = trim(body.country, 2)
    const validCountry = /^[A-Z]{2}$/.test(country) ? country : null
    const subject = body.subject ? trim(body.subject, 200) || null : null
    const meta    = body.meta && typeof body.meta === 'object' ? body.meta : null

    const lead = await fastify.prisma.lead.create({
      data: {
        kind,
        name,
        email,
        phone,
        country: validCountry,
        subject,
        message,
        meta: meta as never, // Prisma JSON
      },
      select: { id: true, createdAt: true },
    })

    fastify.log.info({ leadId: lead.id, kind, country: validCountry }, 'lead.captured')
    return { ok: true, id: lead.id }
  })
}

export default route
