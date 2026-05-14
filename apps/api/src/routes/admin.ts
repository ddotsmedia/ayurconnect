import type { FastifyPluginAsync } from 'fastify'
import { logAudit, clientIp } from '../lib/audit.js'

export const autoPrefix = '/admin'

// Must match the role values written elsewhere (me.ts, schema docs, doctors
// verify flow). Missing entries here silently 400 on legitimate role changes.
const VALID_ROLES = [
  'USER',
  'DOCTOR_PENDING',
  'DOCTOR',
  'HOSPITAL_PENDING',
  'HOSPITAL',
  'THERAPIST',
  'ADMIN',
] as const
type Role = typeof VALID_ROLES[number]

const admin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  fastify.get('/stats', async () => {
    const [
      users, doctors, hospitals, herbs, jobs, colleges,
      tourism, articles, posts, comments, reviews, appointments, sessions,
    ] = await Promise.all([
      fastify.prisma.user.count(),
      fastify.prisma.doctor.count(),
      fastify.prisma.hospital.count(),
      fastify.prisma.herb.count(),
      fastify.prisma.job.count(),
      fastify.prisma.medicalCollege.count(),
      fastify.prisma.medicalTourismPackage.count(),
      fastify.prisma.knowledgeArticle.count(),
      fastify.prisma.post.count(),
      fastify.prisma.comment.count(),
      fastify.prisma.review.count(),
      fastify.prisma.appointment.count(),
      fastify.prisma.session.count(),
    ])
    return {
      counts: { users, doctors, hospitals, herbs, jobs, colleges, tourism, articles, posts, comments, reviews, appointments, sessions },
    }
  })

  fastify.get('/users', async (request) => {
    const { q, role, page = '1', limit = '50' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 50, 200)
    const where: Record<string, unknown> = {}
    if (q) where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ]
    if (role && (VALID_ROLES as readonly string[]).includes(role)) where.role = role

    const [users, total] = await Promise.all([
      fastify.prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, emailVerified: true, image: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.user.count({ where }),
    ])
    return { users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.patch('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { role, name } = request.body as { role?: string; name?: string }
    const data: Record<string, unknown> = {}
    if (role !== undefined) {
      if (!(VALID_ROLES as readonly string[]).includes(role)) {
        return reply.code(400).send({ error: `role must be one of ${VALID_ROLES.join(', ')}` })
      }
      data.role = role
    }
    if (name !== undefined) data.name = name
    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'no updatable fields supplied' })
    }
    // Snapshot before for audit log if role is changing.
    const before = role !== undefined
      ? await fastify.prisma.user.findUnique({ where: { id }, select: { role: true, name: true, email: true } })
      : null
    const user = await fastify.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    })
    if (before && role !== undefined && before.role !== role) {
      void logAudit(fastify, {
        actorId:    request.session!.user.id,
        action:     'role-change',
        targetType: 'User',
        targetId:   id,
        before:     { role: before.role, email: before.email },
        after:      { role: user.role },
        ip:         clientIp(request),
      })
    }
    return user
  })

  fastify.delete('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    if (id === request.session!.user.id) {
      return reply.code(400).send({ error: 'cannot delete yourself' })
    }
    const before = await fastify.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    })
    await fastify.prisma.user.delete({ where: { id } })
    if (before) {
      void logAudit(fastify, {
        actorId:    request.session!.user.id,
        action:     'delete',
        targetType: 'User',
        targetId:   id,
        before:     before as unknown as Record<string, unknown>,
        ip:         clientIp(request),
      })
    }
    return reply.code(204).send()
  })
}

export default admin
