import type { FastifyPluginAsync } from 'fastify'
import { rateLimitOk } from '../lib/rate-limit.js'

export const autoPrefix = '/consultation'

// Public "Request a callback" form on /online-consultation.
// Anonymous — no auth required. IP rate-limited.
//
// Admin CRM endpoints under /admin/consultation-requests live in
// routes/admin-consultation-requests.ts.

const VALID_LANGS = new Set(['Malayalam', 'English', 'Hindi', 'Arabic', 'Tamil', 'Other'])
const VALID_TIMES = new Set(['Morning', 'Afternoon', 'Evening', 'Any'])

const RATE = {
  bucket:    'consultation.request',
  windowSec: 3600,
  max:       3,
  by:        'ip' as const,
  message:   'Too many requests — please try again later.',
}

function trim(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/request', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, RATE))) return

    const body = (request.body ?? {}) as Record<string, unknown>
    const name    = trim(body.name, 120)
    const phone   = trim(body.phone, 40)
    const concern = trim(body.concern, 4000)
    const preferredLanguage = trim(body.preferredLanguage, 40)

    if (!name)                                           return reply.code(400).send({ error: 'name required' })
    if (!phone || phone.replace(/\D/g, '').length < 6)   return reply.code(400).send({ error: 'valid phone required' })
    if (!concern)                                        return reply.code(400).send({ error: 'concern required' })
    if (!VALID_LANGS.has(preferredLanguage))             return reply.code(400).send({ error: 'valid preferredLanguage required' })

    const rawTime = trim(body.preferredTime, 40) || 'Any'
    const preferredTime = VALID_TIMES.has(rawTime) ? rawTime : 'Any'

    const email = body.email ? trim(body.email, 200) || null : null
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ error: 'invalid email' })

    const country = trim(body.country, 2)
    const validCountry = /^[A-Z]{2}$/.test(country) ? country : null

    const created = await fastify.prisma.consultationRequest.create({
      data: { name, phone, email, concern, preferredLanguage, preferredTime, country: validCountry },
    })
    return reply.code(201).send({ ok: true, id: created.id })
  })
}

export default route
