// Doctor Hub — CME webinars + registrations + certificates.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, requireDrWrite, canModerate } from '../lib/dr-access.js'
import { awardCmeCredit, totalCreditsThisYear } from '../lib/cme-credit.js'

export const autoPrefix = '/dr/cme'

const drCme: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { status, specialty } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (specialty) where.specialty = specialty
    const items = await fastify.prisma.webinar.findMany({
      where,
      orderBy: [{ status: 'asc' }, { scheduledFor: 'asc' }],
      take:    60,
      include: { _count: { select: { registrations: true } } },
    })
    // Mark which the user is registered for
    const userId = request.session!.user.id
    const regs = await fastify.prisma.webinarRegistration.findMany({
      where:  { userId, webinarId: { in: items.map((w) => w.id) } },
      select: { webinarId: true, attended: true },
    })
    const regMap = new Map(regs.map((r) => [r.webinarId, r]))
    return { webinars: items.map((w) => ({ ...w, registered: regMap.has(w.id), attended: regMap.get(w.id)?.attended ?? false })) }
  })

  // My credits + certs
  fastify.get('/me', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const userId = request.session!.user.id
    const [registrations, credits, total] = await Promise.all([
      fastify.prisma.webinarRegistration.findMany({
        where:   { userId },
        include: { webinar: { select: { id: true, slug: true, title: true, scheduledFor: true, status: true, cmeCredits: true, recordingUrl: true } } },
        orderBy: { registeredAt: 'desc' },
        take:    50,
      }),
      fastify.prisma.cmeCredit.findMany({
        where:   { userId },
        orderBy: { earnedAt: 'desc' },
        take:    50,
      }),
      totalCreditsThisYear(fastify, userId),
    ])
    return { registrations, credits, totalThisYear: total }
  })

  fastify.get('/cert/:certificateId', async (request, reply) => {
    // Public verification endpoint — anyone can verify a certificate by id.
    const { certificateId } = request.params as { certificateId: string }
    const [credit, reg] = await Promise.all([
      fastify.prisma.cmeCredit.findUnique({
        where:   { certificateId },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      fastify.prisma.webinarRegistration.findUnique({
        where:   { certificateId },
        include: { user: { select: { id: true, name: true } }, webinar: true },
      }),
    ])
    if (credit)  return { kind: 'cme-credit',           credit }
    if (reg)     return { kind: 'webinar-attendance',   registration: reg }
    return reply.code(404).send({ error: 'certificate not found' })
  })

  fastify.get('/:slug', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const w = await fastify.prisma.webinar.findUnique({
      where:   { slug },
      include: { speaker: { select: { id: true, name: true } }, _count: { select: { registrations: true } } },
    })
    if (!w) return reply.code(404).send({ error: 'not found' })
    const reg = await fastify.prisma.webinarRegistration.findUnique({
      where:  { userId_webinarId: { userId: request.session!.user.id, webinarId: w.id } },
    })
    return { ...w, registered: !!reg, attended: reg?.attended ?? false, certificateId: reg?.certificateId ?? null }
  })

  // Register
  fastify.post('/:slug/register', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const w = await fastify.prisma.webinar.findUnique({ where: { slug }, select: { id: true, status: true } })
    if (!w) return reply.code(404).send({ error: 'not found' })
    if (w.status === 'cancelled') return reply.code(400).send({ error: 'webinar cancelled' })
    const userId = request.session!.user.id
    const reg = await fastify.prisma.webinarRegistration.upsert({
      where:  { userId_webinarId: { userId, webinarId: w.id } },
      create: { userId, webinarId: w.id },
      update: {},
    })
    return reg
  })

  // Mark attended + award credit. Self-served for now (recorded webinars =
  // user clicks "I watched" after watching). Admin can also flip via /attend.
  fastify.post('/:slug/attended', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const w = await fastify.prisma.webinar.findUnique({ where: { slug }, select: { id: true, title: true, cmeCredits: true, status: true } })
    if (!w) return reply.code(404).send({ error: 'not found' })
    if (w.status === 'upcoming') return reply.code(400).send({ error: 'webinar has not started yet' })
    const userId = request.session!.user.id
    const reg = await fastify.prisma.webinarRegistration.upsert({
      where:  { userId_webinarId: { userId, webinarId: w.id } },
      create: { userId, webinarId: w.id, attended: true, attendedAt: new Date() },
      update: { attended: true, attendedAt: new Date() },
    })
    // Award credit (idempotent — awardCmeCredit dedupes by source+refId)
    const credit = await awardCmeCredit(fastify, {
      userId,
      source:      'webinar',
      sourceRefId: w.id,
      credits:     w.cmeCredits,
      description: `Attended: ${w.title.slice(0, 100)}`,
    })
    // Stash the certificateId on the registration row so the verification
    // page can use either lookup.
    if (credit && !reg.certificateIssuedAt) {
      await fastify.prisma.webinarRegistration.update({
        where: { id: reg.id },
        data:  { certificateIssuedAt: new Date(), certificateId: credit.certificateId },
      })
    }
    return { ok: true, certificateId: credit?.certificateId ?? null }
  })

  // Admin: create webinar
  fastify.post('/', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const body = request.body as Record<string, unknown>
    if (typeof body.slug !== 'string' || typeof body.title !== 'string' || typeof body.description !== 'string' || typeof body.speakerName !== 'string' || typeof body.scheduledFor !== 'string') {
      return reply.code(400).send({ error: 'slug, title, description, speakerName, scheduledFor required' })
    }
    return fastify.prisma.webinar.create({
      data: {
        slug:         body.slug,
        title:        body.title.slice(0, 250),
        description:  body.description.slice(0, 8000),
        speakerName:  body.speakerName.slice(0, 200),
        speakerUserId: typeof body.speakerUserId === 'string' ? body.speakerUserId : null,
        scheduledFor: new Date(body.scheduledFor),
        durationMin:  typeof body.durationMin === 'number' ? body.durationMin : 60,
        cmeCredits:   typeof body.cmeCredits  === 'number' ? body.cmeCredits  : 1,
        status:       'upcoming',
        videoRoomUrl: typeof body.videoRoomUrl === 'string' ? body.videoRoomUrl : null,
        recordingUrl: typeof body.recordingUrl === 'string' ? body.recordingUrl : null,
        thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : null,
        slidesUrl:    typeof body.slidesUrl    === 'string' ? body.slidesUrl    : null,
        resources:    (body.resources ?? null) as never,
        specialty:    typeof body.specialty === 'string' ? body.specialty : null,
        topics:       Array.isArray(body.topics) ? (body.topics as unknown[]).map(String) : [],
      },
    })
  })

  fastify.patch('/:slug/status', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const { slug } = request.params as { slug: string }
    const { status, recordingUrl } = request.body as { status?: string; recordingUrl?: string }
    if (!status || !['upcoming', 'live', 'completed', 'cancelled'].includes(status)) {
      return reply.code(400).send({ error: 'invalid status' })
    }
    return fastify.prisma.webinar.update({
      where: { slug },
      data:  { status, ...(recordingUrl ? { recordingUrl } : {}) },
    })
  })
}

export default drCme
