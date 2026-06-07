import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead } from '../lib/dr-access.js'
import { logPhiRead } from '../lib/audit.js'

export const autoPrefix = '/dr/episodes'

// Doctor portal — read-only view of assigned patients' treatment episodes.
// Strict care-relationship gate: doctor can only read episodes where they
// are the assigned doctorUserId. Admin override exists but is audited.

const route: FastifyPluginAsync = async (fastify) => {
  // List episodes this doctor is assigned to.
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const userId = request.session!.user.id

    const items = await fastify.prisma.treatmentEpisode.findMany({
      where: { doctorUserId: userId },
      orderBy: { startDate: 'desc' },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        _count:  { select: { logs: true } },
      },
    })
    return { episodes: items }
  })

  // Trend data for one episode — only the assigned doctor (or admin).
  fastify.get('/:id', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const userId = request.session!.user.id
    const role   = request.session!.user.role
    const { id } = request.params as { id: string }

    const ep = await fastify.prisma.treatmentEpisode.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        logs:    { orderBy: { date: 'asc' }, select: { id: true, date: true, severity: true, energy: true, sleepQuality: true, mood: true, note: true } },
      },
    })
    if (!ep) return reply.code(404).send({ error: 'not found' })
    const isAssignedDoctor = ep.doctorUserId === userId
    const isAdmin          = role === 'ADMIN'
    if (!isAssignedDoctor && !isAdmin) return reply.code(403).send({ error: 'forbidden' })

    logPhiRead(fastify, request, {
      targetType: 'TreatmentEpisode',
      targetId:   ep.id,
      reason:     isAdmin && !isAssignedDoctor ? 'admin override read' : 'doctor trend view',
    })
    return { episode: ep }
  })
}

export default route
