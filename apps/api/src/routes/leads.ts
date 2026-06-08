import type { FastifyPluginAsync } from 'fastify'
import { rateLimitOk } from '../lib/rate-limit.js'

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
  'wellness_plan',       // /wellness-plans founding-member interest
  'second_opinion',      // /second-opinion intake form
  'seminar_registration',// /seminars anonymous register modal
  'clinic_portal_demo',  // /clinic-portal "Request Demo" form
  'heal_in_kerala_enquiry',  // /heal-in-kerala + /heal-in-kerala/[country] enquiry form
])

// Rate-limit: 5 submissions / 10 min / IP. Backed by Redis via lib/rate-limit
// so it survives PM2 reload and works across instances (in-process Map version
// was a memory leak + per-instance bypass — flagged in 2026-05-18 audit).
const LEADS_RATE = {
  bucket:    'leads.submit',
  windowSec: 600,
  max:       5,
  by:        'ip' as const,
  message:   'Too many submissions — try again in a few minutes.',
}

function trim(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, LEADS_RATE))) return

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
