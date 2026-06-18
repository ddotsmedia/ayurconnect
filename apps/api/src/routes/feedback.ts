// Public feedback / suggestions endpoint + admin management.

import type { FastifyPluginAsync } from 'fastify'
import { rateLimitOk } from '../lib/rate-limit.js'
import { sendWhatsApp, whatsappEnabled } from '../lib/whatsapp.js'

export const autoPrefix = '/feedback'

const CATEGORIES = ['feedback', 'suggestion', 'bug_report', 'feature_request', 'complaint']
const STATUSES   = ['new', 'reviewed', 'in_progress', 'resolved', 'dismissed']
const ADMIN_WHATSAPP = process.env.FEEDBACK_WHATSAPP ?? '+971509379212'

const feedback: FastifyPluginAsync = async (fastify) => {
  // Public submit — rate-limited 3/hour per IP.
  fastify.post('/', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, {
      bucket: 'feedback.submit', windowSec: 3600, max: 3,
      message: 'Too many submissions — try again in an hour.',
    }))) return

    const b = request.body as Record<string, unknown>
    const name    = String(b.name ?? '').trim()
    const subject = String(b.subject ?? '').trim()
    const message = String(b.message ?? '').trim()
    if (!name || !subject || !message) return reply.code(400).send({ error: 'name + subject + message required' })
    if (message.length < 20)            return reply.code(400).send({ error: 'message must be 20+ chars' })

    const category = typeof b.category === 'string' && CATEGORIES.includes(b.category) ? b.category : 'feedback'
    const email = typeof b.email === 'string' ? b.email.slice(0, 200).trim() : null
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ error: 'invalid email' })

    const userId = request.session?.user?.id ?? null

    const row = await fastify.prisma.feedback.create({
      data: {
        name: name.slice(0, 200),
        email,
        phone: typeof b.phone === 'string' ? b.phone.slice(0, 32) : null,
        category,
        subject: subject.slice(0, 200),
        message: message.slice(0, 8000),
        page: typeof b.page === 'string' ? b.page.slice(0, 500) : null,
        userId,
      },
    })

    // Fire-and-forget WhatsApp notification to admin.
    if (whatsappEnabled()) {
      const body = `🩺 AyurConnect feedback\n\nFrom: ${row.name}${row.email ? ' · ' + row.email : ''}${row.phone ? ' · ' + row.phone : ''}\nCategory: ${row.category.replace(/_/g, ' ')}\nSubject: ${row.subject}\n\n${row.message.slice(0, 1000)}${row.message.length > 1000 ? '…' : ''}\n\nManage: https://ayurconnect.com/admin/feedback`
      void sendWhatsApp({ to: ADMIN_WHATSAPP, body }).catch(() => {})
    }

    return { ok: true, id: row.id }
  })

  // ─── Admin endpoints ─────────────────────────────────────
  fastify.register(async (sub) => {
    sub.addHook('preHandler', fastify.requireAdmin)

    sub.get('/', async (request) => {
      const { status, category, q, isRead } = request.query as Record<string, string | undefined>
      const where: Record<string, unknown> = {}
      if (status && status !== 'all') where.status = status
      if (category && category !== 'all') where.category = category
      if (isRead === 'true')  where.isRead = true
      if (isRead === 'false') where.isRead = false
      if (q) where.OR = [
        { name:    { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { email:   { contains: q, mode: 'insensitive' } },
      ]
      const [items, counts] = await Promise.all([
        fastify.prisma.feedback.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }),
        fastify.prisma.feedback.groupBy({ by: ['status'], _count: { _all: true } }),
      ])
      const newCount = await fastify.prisma.feedback.count({ where: { isRead: false } })
      return {
        items,
        stats: {
          total:       counts.reduce((a, c) => a + c._count._all, 0),
          unread:      newCount,
          new:         counts.find((c) => c.status === 'new')?._count._all ?? 0,
          reviewed:    counts.find((c) => c.status === 'reviewed')?._count._all ?? 0,
          in_progress: counts.find((c) => c.status === 'in_progress')?._count._all ?? 0,
          resolved:    counts.find((c) => c.status === 'resolved')?._count._all ?? 0,
          dismissed:   counts.find((c) => c.status === 'dismissed')?._count._all ?? 0,
        },
      }
    })

    sub.patch('/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      const b = request.body as Record<string, unknown>
      const data: Record<string, unknown> = {}
      if (typeof b.status === 'string' && STATUSES.includes(b.status)) data.status = b.status
      if (typeof b.adminNotes === 'string') data.adminNotes = b.adminNotes.slice(0, 4000)
      if (b.isRead !== undefined) data.isRead = Boolean(b.isRead)
      try {
        return await fastify.prisma.feedback.update({ where: { id }, data })
      } catch { return reply.code(404).send({ error: 'not found' }) }
    })

    sub.delete('/:id', async (request, reply) => {
      const { id } = request.params as { id: string }
      await fastify.prisma.feedback.delete({ where: { id } }).catch(() => {})
      return reply.code(204).send()
    })

    // Bulk ops
    sub.post('/bulk', async (request, reply) => {
      const b = request.body as { ids?: string[]; action?: string; status?: string }
      if (!Array.isArray(b.ids) || b.ids.length === 0) return reply.code(400).send({ error: 'ids required' })
      if (b.action === 'mark-read') {
        await fastify.prisma.feedback.updateMany({ where: { id: { in: b.ids } }, data: { isRead: true } })
      } else if (b.action === 'change-status' && b.status && STATUSES.includes(b.status)) {
        await fastify.prisma.feedback.updateMany({ where: { id: { in: b.ids } }, data: { status: b.status } })
      } else if (b.action === 'delete') {
        await fastify.prisma.feedback.deleteMany({ where: { id: { in: b.ids } } })
      } else {
        return reply.code(400).send({ error: 'invalid action' })
      }
      return { ok: true, count: b.ids.length }
    })
  })
}

export default feedback
