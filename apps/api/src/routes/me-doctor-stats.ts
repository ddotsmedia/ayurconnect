import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/me/doctor/stats'

// Aggregated stats for the signed-in doctor's own profile.
// Returns counts + averages over rolling windows (last 7 / 30 / all-time).
const stats: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  fastify.get('/', async (request, reply) => {
    const userId = request.session!.user.id
    const me = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!me?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })
    const docId = me.doctorId

    const now = new Date()
    const d7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      reviews,
      apptStatusCounts,
      appt7, appt30,
      slotsTotal, slotsBooked, slotsOpen,
      savedCount,
    ] = await Promise.all([
      fastify.prisma.review.findMany({ where: { doctorId: docId }, select: { rating: true, createdAt: true } }),
      fastify.prisma.appointment.groupBy({ by: ['status'], where: { doctorId: docId }, _count: { _all: true } }),
      fastify.prisma.appointment.count({ where: { doctorId: docId, createdAt: { gte: d7  } } }),
      fastify.prisma.appointment.count({ where: { doctorId: docId, createdAt: { gte: d30 } } }),
      fastify.prisma.doctorSlot.count({ where: { doctorId: docId } }),
      fastify.prisma.doctorSlot.count({ where: { doctorId: docId, status: 'booked' } }),
      fastify.prisma.doctorSlot.count({ where: { doctorId: docId, status: 'open', startsAt: { gte: now } } }),
      fastify.prisma.savedDoctor.count({ where: { doctorId: docId } }),
    ])

    const ratings = reviews.map((r) => r.rating)
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
    const reviews7 = reviews.filter((r) => r.createdAt >= d7).length
    const reviews30 = reviews.filter((r) => r.createdAt >= d30).length

    const apptCounts = apptStatusCounts.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = r._count._all
      return acc
    }, {})

    return {
      reviews: {
        total: ratings.length,
        last7: reviews7,
        last30: reviews30,
        averageRating: avg ? Math.round(avg * 10) / 10 : null,
        breakdown: [5, 4, 3, 2, 1].map((star) => ({ star, count: ratings.filter((r) => r === star).length })),
      },
      appointments: {
        total: Object.values(apptCounts).reduce((a, b) => a + b, 0),
        last7: appt7,
        last30: appt30,
        byStatus: apptCounts,
      },
      slots: {
        total:           slotsTotal,
        booked:          slotsBooked,
        openFuture:      slotsOpen,
        utilizationPct:  slotsTotal > 0 ? Math.round((slotsBooked / slotsTotal) * 100) : 0,
      },
      saved: { total: savedCount },
    }
  })
}

export default stats
