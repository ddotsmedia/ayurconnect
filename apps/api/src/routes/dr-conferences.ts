// Doctor Hub — Conferences calendar + RSVPs.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, canModerate } from '../lib/dr-access.js'

export const autoPrefix = '/dr/conferences'

const drConferences: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { status = 'upcoming' } = request.query as Record<string, string>
    const where: Record<string, unknown> = status === 'all' ? {} : { status }
    const items = await fastify.prisma.conference.findMany({
      where, orderBy: { startDate: 'asc' }, take: 60,
      include: { _count: { select: { rsvps: true } } },
    })
    const userId = request.session!.user.id
    const rsvps = await fastify.prisma.conferenceRSVP.findMany({
      where:  { userId, conferenceId: { in: items.map((c) => c.id) } },
      select: { conferenceId: true, status: true },
    })
    const rsvpMap = new Map(rsvps.map((r) => [r.conferenceId, r.status]))
    return { conferences: items.map((c) => ({ ...c, myRsvp: rsvpMap.get(c.id) ?? null })) }
  })

  fastify.get('/:slug', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const c = await fastify.prisma.conference.findUnique({
      where: { slug },
      include: { _count: { select: { rsvps: true } } },
    })
    if (!c) return reply.code(404).send({ error: 'not found' })
    const userId = request.session!.user.id
    const myRsvpRow = await fastify.prisma.conferenceRSVP.findUnique({
      where: { userId_conferenceId: { userId, conferenceId: c.id } },
      select: { status: true },
    })
    // Peer signal: up to 12 most-recent attendees, plus counts per status.
    const peers = await fastify.prisma.conferenceRSVP.findMany({
      where:   { conferenceId: c.id },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select:  { status: true, user: { select: { id: true, name: true } } },
    })
    const counts = await fastify.prisma.conferenceRSVP.groupBy({
      by: ['status'], where: { conferenceId: c.id }, _count: { _all: true },
    })
    const rsvpCounts = { attending: 0, interested: 0 }
    for (const c of counts) {
      if (c.status === 'attending')  rsvpCounts.attending  = c._count._all
      if (c.status === 'interested') rsvpCounts.interested = c._count._all
    }
    return { ...c, myRsvp: myRsvpRow?.status ?? null, rsvpCounts, peers }
  })

  fastify.post('/:slug/rsvp', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const { status = 'attending' } = request.body as { status?: string }
    if (!['attending', 'interested'].includes(status)) return reply.code(400).send({ error: 'invalid status' })
    const c = await fastify.prisma.conference.findUnique({ where: { slug }, select: { id: true } })
    if (!c) return reply.code(404).send({ error: 'not found' })
    const userId = request.session!.user.id
    const existing = await fastify.prisma.conferenceRSVP.findUnique({ where: { userId_conferenceId: { userId, conferenceId: c.id } } })
    if (existing && existing.status === status) {
      await fastify.prisma.conferenceRSVP.delete({ where: { id: existing.id } })
      return { rsvp: null }
    }
    const r = await fastify.prisma.conferenceRSVP.upsert({
      where:  { userId_conferenceId: { userId, conferenceId: c.id } },
      create: { userId, conferenceId: c.id, status },
      update: { status },
    })
    return { rsvp: r.status }
  })

  fastify.post('/', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const body = request.body as Record<string, unknown>
    if (typeof body.slug !== 'string' || typeof body.title !== 'string' || typeof body.startDate !== 'string' || typeof body.location !== 'string' || typeof body.organizer !== 'string') {
      return reply.code(400).send({ error: 'slug, title, startDate, location, organizer required' })
    }
    return fastify.prisma.conference.create({
      data: {
        slug:             body.slug,
        title:            body.title.slice(0, 250),
        startDate:        new Date(body.startDate),
        endDate:          typeof body.endDate === 'string' ? new Date(body.endDate) : null,
        location:         body.location,
        mode:             typeof body.mode === 'string' && ['in-person', 'virtual', 'hybrid'].includes(body.mode) ? body.mode : 'in-person',
        organizer:        body.organizer,
        description:      typeof body.description === 'string' ? body.description.slice(0, 4000) : null,
        registrationUrl:  typeof body.registrationUrl === 'string' ? body.registrationUrl : null,
        abstractDeadline: typeof body.abstractDeadline === 'string' ? new Date(body.abstractDeadline) : null,
        topics:           Array.isArray(body.topics) ? (body.topics as unknown[]).map(String) : [],
      },
    })
  })
}

export default drConferences
