import type { FastifyPluginAsync } from 'fastify'

// Slot endpoints split into two prefixes:
//   /doctors/:id/slots          public list (open future slots)
//   /me/doctor/slots            doctor self-edit (auth-gated)

const slots: FastifyPluginAsync = async (fastify) => {
  // ─── Public: open slots for a given doctor (next 14 days) ────────────
  fastify.get('/doctors/:id/slots', async (request) => {
    const { id } = request.params as { id: string }
    const { from, to } = request.query as { from?: string; to?: string }
    const start = from ? new Date(from) : new Date()
    const end   = to   ? new Date(to)   : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const list = await fastify.prisma.doctorSlot.findMany({
      where: {
        doctorId: id,
        status:   'open',
        startsAt: { gte: start, lte: end },
      },
      orderBy: { startsAt: 'asc' },
      take: 200,
    })
    return { slots: list }
  })

  // ─── Doctor self: list my slots ──────────────────────────────────────
  fastify.get('/me/doctor/slots', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const me = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!me?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })
    return fastify.prisma.doctorSlot.findMany({ where: { doctorId: me.doctorId }, orderBy: { startsAt: 'asc' }, take: 500 })
  })

  // ─── Doctor self: bulk create slots ──────────────────────────────────
  // Body: { slots: [{ startsAt: ISO, durationMinutes: 30, type: 'either', notes? }, ...] }
  fastify.post('/me/doctor/slots', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const me = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!me?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })

    const { slots } = request.body as { slots?: Array<{ startsAt?: string; durationMinutes?: number; type?: string; notes?: string }> }
    if (!Array.isArray(slots) || slots.length === 0) return reply.code(400).send({ error: 'slots array required' })

    const rows: Array<{ startsAt: Date; endsAt: Date; type: string; notes: string | null }> = []
    for (const s of slots) {
      const startsAt = s.startsAt ? new Date(s.startsAt) : null
      const minutes  = s.durationMinutes ?? 30
      if (!startsAt || isNaN(startsAt.getTime())) continue
      if (minutes < 5 || minutes > 240) continue
      rows.push({
        startsAt,
        endsAt: new Date(startsAt.getTime() + minutes * 60 * 1000),
        type: ['video', 'in-person', 'either'].includes(s.type ?? '') ? s.type! : 'either',
        notes: typeof s.notes === 'string' ? s.notes.slice(0, 500) : null,
      })
    }
    if (rows.length === 0) return reply.code(400).send({ error: 'no valid slots' })

    const created = await fastify.prisma.doctorSlot.createMany({
      data: rows.map((r) => ({ ...r, doctorId: me.doctorId! })),
    })
    return { created: created.count }
  })

  // ─── Doctor self: update slot status (cancel) ─────────────────────────
  fastify.patch('/me/doctor/slots/:id', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const me = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!me?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })

    const { id } = request.params as { id: string }
    const slot = await fastify.prisma.doctorSlot.findUnique({ where: { id } })
    if (!slot || slot.doctorId !== me.doctorId) return reply.code(404).send({ error: 'not found' })

    const { status } = request.body as { status?: string }
    if (!['open', 'cancelled'].includes(status ?? '')) return reply.code(400).send({ error: 'status must be open|cancelled' })
    return fastify.prisma.doctorSlot.update({ where: { id }, data: { status: status! } })
  })

  // ─── Doctor self: delete an unbooked slot ─────────────────────────────
  fastify.delete('/me/doctor/slots/:id', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const me = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!me?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })

    const { id } = request.params as { id: string }
    const slot = await fastify.prisma.doctorSlot.findUnique({ where: { id } })
    if (!slot || slot.doctorId !== me.doctorId) return reply.code(404).send({ error: 'not found' })
    if (slot.status === 'booked') return reply.code(409).send({ error: 'cannot delete a booked slot — cancel it instead' })
    await fastify.prisma.doctorSlot.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default slots
