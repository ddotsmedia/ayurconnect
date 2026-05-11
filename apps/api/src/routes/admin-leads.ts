import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/leads'

// Admin-only CRM endpoint for the public lead-capture submissions.
// Sister public POST endpoint: routes/leads.ts.
//
// Pipeline stages (canonical):
//   new        — fresh, untouched
//   contacted  — first outreach sent
//   qualified  — confirmed real intent, budget, fit
//   quoted     — formal quote / proposal sent
//   won        — closed-won (booked / converted)
//   lost       — closed-lost
//   spam       — discarded as spam / bot
//
// The legacy `status` column is kept in sync with `stage` for back-compat
// with anything still reading the old shape (admin Settings exports, etc).

const VALID_STAGES = new Set(['new', 'contacted', 'qualified', 'quoted', 'won', 'lost', 'spam'])
const STATUS_FOR_STAGE: Record<string, string> = {
  new: 'new', contacted: 'contacted', qualified: 'contacted', quoted: 'contacted',
  won: 'closed', lost: 'closed', spam: 'spam',
}

type NoteEntry = { at: string; by: { id: string; name: string | null; email: string }; text: string; kind: 'note' | 'stage' | 'assignment' | 'follow_up' }

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // List with filters + pipeline summary
  fastify.get('/', async (request) => {
    const { kind, stage, status, q, assignedToId, dueBefore, page = '1', limit = '200' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 200, 500)

    const where: Record<string, unknown> = {}
    if (kind)         where.kind = kind
    if (stage)        where.stage = stage
    if (status)       where.status = status
    if (assignedToId) where.assignedToId = assignedToId
    if (dueBefore)    where.followUpAt = { lte: new Date(dueBefore) }
    if (q) where.OR = [
      { name:    { contains: q, mode: 'insensitive' } },
      { email:   { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
    ]

    const [items, total, byKind, byStage] = await Promise.all([
      fastify.prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, email: true, name: true } },
        },
        orderBy: [{ followUpAt: 'asc' }, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.lead.count({ where }),
      fastify.prisma.lead.groupBy({ by: ['kind'],  _count: { _all: true } }),
      fastify.prisma.lead.groupBy({ by: ['stage'], _count: { _all: true } }),
    ])

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      summary: {
        byKind:  Object.fromEntries(byKind.map((g)  => [g.kind,  g._count._all])),
        byStage: Object.fromEntries(byStage.map((g) => [g.stage, g._count._all])),
      },
    }
  })

  // List of admin users — for the assignment dropdown
  fastify.get('/_admins', async () => {
    const admins = await fastify.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true },
      orderBy: { name: 'asc' },
    })
    return { admins }
  })

  // Stage / assignment / follow-up edits — all via PATCH /:id
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { stage?: string; assignedToId?: string | null; followUpAt?: string | null; status?: string }
    const data: Record<string, unknown> = {}
    const events: Array<Omit<NoteEntry, 'at' | 'by'>> = []

    if (body.stage !== undefined) {
      if (!VALID_STAGES.has(body.stage)) return reply.code(400).send({ error: 'invalid stage' })
      data.stage = body.stage
      data.status = STATUS_FOR_STAGE[body.stage] ?? body.stage
      events.push({ text: `Stage changed to "${body.stage}"`, kind: 'stage' })
    }
    if (body.assignedToId !== undefined) {
      if (body.assignedToId === null || body.assignedToId === '') {
        data.assignedToId = null
        events.push({ text: 'Unassigned', kind: 'assignment' })
      } else {
        const u = await fastify.prisma.user.findUnique({ where: { id: body.assignedToId }, select: { id: true, name: true, email: true, role: true } })
        if (!u || u.role !== 'ADMIN') return reply.code(400).send({ error: 'assigned user must be ADMIN' })
        data.assignedToId = body.assignedToId
        events.push({ text: `Assigned to ${u.name ?? u.email}`, kind: 'assignment' })
      }
    }
    if (body.followUpAt !== undefined) {
      if (body.followUpAt === null || body.followUpAt === '') {
        data.followUpAt = null
        events.push({ text: 'Follow-up date cleared', kind: 'follow_up' })
      } else {
        const dt = new Date(body.followUpAt)
        if (Number.isNaN(dt.getTime())) return reply.code(400).send({ error: 'invalid followUpAt date' })
        data.followUpAt = dt
        events.push({ text: `Follow-up set to ${dt.toISOString().slice(0, 10)}`, kind: 'follow_up' })
      }
    }
    // legacy status writes (don't add events)
    if (body.status !== undefined && body.stage === undefined) {
      data.status = body.status
    }

    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no edits' })

    // Append events to notesJson
    const me = request.session!.user
    const lead = await fastify.prisma.lead.findUnique({ where: { id }, select: { notesJson: true } })
    const existingNotes = Array.isArray(lead?.notesJson) ? (lead!.notesJson as unknown as NoteEntry[]) : []
    const newNotes = [
      ...existingNotes,
      ...events.map((e) => ({ ...e, at: new Date().toISOString(), by: { id: me.id, name: me.name ?? null, email: me.email } })),
    ]
    if (events.length > 0) data.notesJson = newNotes as never

    const updated = await fastify.prisma.lead.update({
      where: { id },
      data,
      include: { assignedTo: { select: { id: true, email: true, name: true } } },
    })
    return { lead: updated }
  })

  // Add a manual note (separate endpoint — easier to audit)
  fastify.post('/:id/notes', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { text?: string }
    const text = String(body.text ?? '').trim().slice(0, 2000)
    if (!text) return reply.code(400).send({ error: 'note text required' })

    const me = request.session!.user
    const lead = await fastify.prisma.lead.findUnique({ where: { id }, select: { notesJson: true } })
    if (!lead) return reply.code(404).send({ error: 'lead not found' })
    const existing = Array.isArray(lead.notesJson) ? (lead.notesJson as unknown as NoteEntry[]) : []
    const entry: NoteEntry = { at: new Date().toISOString(), by: { id: me.id, name: me.name ?? null, email: me.email }, text, kind: 'note' }
    const updated = await fastify.prisma.lead.update({
      where: { id },
      data: { notesJson: [...existing, entry] as never },
      include: { assignedTo: { select: { id: true, email: true, name: true } } },
    })
    return { lead: updated }
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.lead.delete({ where: { id } })
    return { ok: true }
  })
}

export default route
