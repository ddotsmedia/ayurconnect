// Public hospital interaction endpoints — inquiry submission + view tracking.
// No auth required; rate-limited by IP.

import type { FastifyPluginAsync } from 'fastify'
import { rateLimitOk } from '../lib/rate-limit.js'

export const autoPrefix = '/hospitals-public'

const hospitalPublic: FastifyPluginAsync = async (fastify) => {
  // Submit an inquiry — 5/hour per IP.
  fastify.post('/:id/inquiry', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, {
      bucket: 'hospital.inquiry', windowSec: 3600, max: 5,
      message: 'Too many inquiries — please try again in an hour.',
    }))) return

    const { id } = request.params as { id: string }
    const h = await fastify.prisma.hospital.findUnique({ where: { id }, select: { id: true } })
    if (!h) return reply.code(404).send({ error: 'hospital not found' })

    const b = request.body as Record<string, unknown>
    const patientName = String(b.patientName ?? '').trim()
    const email       = String(b.email ?? '').trim().toLowerCase()
    const message     = String(b.message ?? '').trim()
    if (!patientName || !email || !message) {
      return reply.code(400).send({ error: 'patientName, email, message required' })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply.code(400).send({ error: 'invalid email' })
    }
    const country = typeof b.country === 'string' && /^[A-Z]{2}$/.test(b.country) ? b.country : null

    const created = await fastify.prisma.hospitalInquiry.create({
      data: {
        hospitalId:        id,
        patientName:       patientName.slice(0, 200),
        email:             email.slice(0, 200),
        phone:    typeof b.phone    === 'string' ? b.phone.slice(0, 32) : null,
        whatsapp: typeof b.whatsapp === 'string' ? b.whatsapp.slice(0, 32) : null,
        country,
        treatmentInterest: typeof b.treatmentInterest === 'string' ? b.treatmentInterest.slice(0, 200) : null,
        preferredDates:    typeof b.preferredDates    === 'string' ? b.preferredDates.slice(0, 200) : null,
        message:           message.slice(0, 4000),
        source: typeof b.source === 'string' && ['website','whatsapp','heal_in_kerala','direct'].includes(b.source) ? b.source : 'website',
      },
    })
    return { ok: true, inquiryId: created.id }
  })

  // Record a profile view — fire-and-forget; no rate-limit, debounced by client.
  fastify.post('/:id/view', async (request, reply) => {
    const { id } = request.params as { id: string }
    void fastify.prisma.analyticsEvent.create({
      data: { name: 'hospital_view', props: { hospitalId: id }, path: typeof (request.body as Record<string, unknown>)?.path === 'string' ? (request.body as Record<string, string>).path : null },
    }).catch(() => {})
    return reply.code(204).send()
  })

  // Public list of treatment packages for a hospital.
  fastify.get('/:id/packages', async (request, reply) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.treatmentPackage.findMany({
      where: { hospitalId: id, isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { priceFrom: 'asc' }],
    })
  })

  // Public list of active promotions.
  fastify.get('/:id/promotions', async (request, reply) => {
    const { id } = request.params as { id: string }
    const now = new Date()
    return fastify.prisma.hospitalPromotion.findMany({
      where: { hospitalId: id, isActive: true, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      orderBy: { createdAt: 'desc' },
    })
  })

  // Doctor team for a hospital — used by the public profile.
  fastify.get('/:id/team', async (request, reply) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.hospitalDoctorLink.findMany({
      where:   { hospitalId: id },
      orderBy: { position: 'asc' },
      include: { doctor: { select: { id: true, name: true, specialization: true, district: true, ccimVerified: true, qualification: true, photoUrl: true, languages: true, experienceYears: true } } },
    })
  })

  // Aggregated review responses keyed by reviewId.
  fastify.get('/:id/review-responses', async (request, reply) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.hospitalReviewResponse.findMany({ where: { hospitalId: id } })
  })
}

export default hospitalPublic
