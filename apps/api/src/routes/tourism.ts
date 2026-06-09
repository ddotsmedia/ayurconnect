import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'
import { rateLimitOk } from '../lib/rate-limit.js'

export const autoPrefix = '/tourism'

// AI medical-tourism trip planner (Phase 9b). Inputs (condition, dates, budget,
// origin city) → a structured treatment package. Output is a REVIEWABLE plan
// (booking request only in v1) — no live payment, no live booking.
const PLAN_RATE = {
  bucket:    'tourism.plan',
  windowSec: 600,
  max:       6,
  by:        'ip' as const,
  message:   'Too many planning requests — please try again in a few minutes.',
}

const PLAN_SYSTEM = `You are an Ayurveda medical-tourism trip planner for Kerala, India. Given a patient's condition, travel window, budget and origin city, produce a STRUCTURED treatment package as JSON ONLY (no prose outside the JSON).

Return exactly this shape:
{
  "summary": string,
  "recommendedTreatment": string,
  "durationDays": number,
  "phases": [ { "title": string, "days": string, "detail": string } ],
  "centreGuidance": string,
  "stayGuidance": string,
  "visaGuidance": string,
  "estimatedCost": { "currency": string, "low": number, "high": number, "note": string },
  "itinerary": [ { "day": string, "activity": string } ],
  "disclaimer": string
}

Rules:
- Do NOT invent specific clinic, hotel or doctor names — give guidance on what to look for instead.
- Keep medical claims conservative and non-diagnostic.
- Costs are rough estimates; say so in the note.
- Always include a disclaimer that this is an indicative plan, not medical advice or a confirmed booking.`

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const tourism: FastifyPluginAsync = async (fastify) => {
  fastify.get('/packages', async (request) => {
    const { page = '1', limit = '20', location, minPrice, maxPrice } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const where: Record<string, unknown> = {}
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (minPrice || maxPrice) {
      const price: Record<string, number> = {}
      if (minPrice) price.gte = Number(minPrice)
      if (maxPrice) price.lte = Number(maxPrice)
      where.price = price
    }

    const [packages, total] = await Promise.all([
      fastify.prisma.medicalTourismPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.medicalTourismPackage.count({ where }),
    ])

    return {
      packages,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/packages/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const pkg = await fastify.prisma.medicalTourismPackage.findUnique({ where: { id } })
    if (!pkg) return reply.code(404).send({ error: 'Package not found' })
    return pkg
  })

  fastify.post('/packages', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.title || !body.description || !body.duration || !body.location) {
      return reply.code(400).send({ error: 'title, description, duration, location required' })
    }
    const pkg = await fastify.prisma.medicalTourismPackage.create({
      data: {
        title: body.title,
        description: body.description,
        duration: Number(body.duration),
        price: body.price ? Number(body.price) : null,
        location: body.location,
        includes: body.includes || null,
      },
    })
    return reply.code(201).send(pkg)
  })

  fastify.patch('/packages/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.duration !== undefined) data.duration = Number(body.duration)
    if (body.price !== undefined) data.price = body.price === '' ? null : Number(body.price)
    if (body.location !== undefined) data.location = body.location
    if (body.includes !== undefined) data.includes = body.includes || null
    return fastify.prisma.medicalTourismPackage.update({ where: { id }, data })
  })

  fastify.delete('/packages/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.medicalTourismPackage.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/locations', async () => KERALA_DISTRICTS)

  fastify.get('/package-types', async () => [
    { id: 'panchakarma', name: 'Panchakarma Treatment', duration: '7-21 days' },
    { id: 'rejuvenation', name: 'Rejuvenation Therapy', duration: '14-28 days' },
    { id: 'chronic-care', name: 'Chronic Disease Management', duration: '21-45 days' },
    { id: 'weight-management', name: 'Weight Management', duration: '14-30 days' },
    { id: 'stress-relief', name: 'Stress Relief & Mental Health', duration: '7-14 days' },
    { id: 'beauty-wellness', name: 'Beauty & Wellness', duration: '7-14 days' },
  ])

  // AI trip planner → structured, reviewable package (no live booking/payment).
  fastify.post('/plan', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, PLAN_RATE))) return
    const b = (request.body ?? {}) as {
      condition?: string; originCity?: string; country?: string
      startDate?: string; durationDays?: number; budget?: string
    }
    const condition = (b.condition ?? '').trim().slice(0, 300)
    if (condition.length < 3) return reply.code(400).send({ error: 'condition required' })

    const message = [
      `Condition / goal: ${condition}`,
      b.originCity ? `Origin city: ${b.originCity}` : null,
      b.country ? `Origin country: ${b.country}` : null,
      b.startDate ? `Preferred start: ${b.startDate}` : null,
      b.durationDays ? `Available days: ${b.durationDays}` : null,
      b.budget ? `Budget: ${b.budget}` : null,
      'Return the JSON package now.',
    ].filter(Boolean).join('\n')

    const res = await chat({ system: PLAN_SYSTEM, message, maxTokens: 1600 })
    if (res.ok !== true) {
      return reply.code(503).send({ error: 'Planner temporarily unavailable. Please try again or submit an enquiry.' })
    }
    const match = res.text.match(/\{[\s\S]*\}/)
    if (!match) return reply.code(502).send({ error: 'Could not parse the generated plan. Please try again.' })
    try {
      return { ok: true, plan: JSON.parse(match[0]), provider: res.provider }
    } catch {
      return reply.code(502).send({ error: 'Could not parse the generated plan. Please try again.' })
    }
  })
}

export default tourism
