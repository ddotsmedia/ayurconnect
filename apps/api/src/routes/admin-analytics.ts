import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/analytics'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // GET /admin/analytics — site-wide aggregates for the admin dashboard.
  // Returns counts, role distribution, time-series, top events.
  fastify.get('/', async () => {
    const now = new Date()
    const d7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      counts,
      usersByRole,
      doctorsByDistrict,
      hospitalsByType,
      signupsLast30,
      eventsLast30,
      topSearches,
      verificationQueue,
      apptsByStatus,
      funnelRows,
    ] = await Promise.all([
      // Headline counts
      Promise.all([
        fastify.prisma.user.count(),
        fastify.prisma.doctor.count(),
        fastify.prisma.hospital.count(),
        fastify.prisma.herb.count(),
        fastify.prisma.appointment.count(),
        fastify.prisma.review.count(),
        fastify.prisma.post.count(),
        fastify.prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      ]).then(([users, doctors, hospitals, herbs, appts, reviews, posts, signups7]) => ({
        users, doctors, hospitals, herbs, appts, reviews, posts, signups7,
      })),

      fastify.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      fastify.prisma.doctor.groupBy({ by: ['district'], _count: { _all: true } }),
      fastify.prisma.hospital.groupBy({ by: ['type'], _count: { _all: true } }),

      // 30-day signup time series (per day)
      fastify.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM "User"
        WHERE "createdAt" >= ${d30}
        GROUP BY day
        ORDER BY day ASC`,

      // 30-day events by name
      fastify.prisma.analyticsEvent.groupBy({
        by: ['name'],
        where: { createdAt: { gte: d30 } },
        _count: { _all: true },
      }),

      // Top 10 search terms in the last 30 days
      fastify.prisma.$queryRaw<Array<{ term: string; count: bigint }>>`
        SELECT LOWER(props->>'q') AS term, COUNT(*)::bigint AS count
        FROM "AnalyticsEvent"
        WHERE name = 'search' AND "createdAt" >= ${d30} AND props->>'q' IS NOT NULL AND props->>'q' <> ''
        GROUP BY term
        ORDER BY count DESC
        LIMIT 10`,

      // Verification queue depth (unverified doctors + hospitals)
      Promise.all([
        fastify.prisma.doctor.count({   where: { ccimVerified: false } }),
        fastify.prisma.hospital.count({ where: { ccimVerified: false } }),
      ]).then(([d, h]) => ({ doctors: d, hospitals: h })),

      // Appointments by status (lifetime)
      fastify.prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),

      // Conversion funnel — distinct sessions per step over last 30 days.
      // Steps: page_view → search → doctor_view → booking_started → booking_completed.
      // We count distinct sessionId (falls back to userId when session is missing,
      // and 'anon' for fully-anonymous events with no session/user). This isn't a
      // perfectly cohort-strict funnel — same session firing step 4 without step 1
      // is rare in practice — but it gives a useful drop-off picture.
      fastify.prisma.$queryRaw<Array<{ step: string; sessions: bigint }>>`
        SELECT name AS step,
               COUNT(DISTINCT COALESCE("sessionId", "userId", 'anon'))::bigint AS sessions
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${d30}
          AND name IN ('page_view', 'search', 'doctor_view', 'booking_started', 'booking_completed')
        GROUP BY name`,
    ])

    // Build the ordered funnel with counts + step-over-step conversion rates.
    const funnelMap = new Map(funnelRows.map((r) => [r.step, Number(r.sessions)]))
    const FUNNEL_STEPS: Array<{ key: string; label: string }> = [
      { key: 'page_view',         label: 'Visited site'           },
      { key: 'search',            label: 'Searched'                },
      { key: 'doctor_view',       label: 'Viewed a doctor profile' },
      { key: 'booking_started',   label: 'Started booking'         },
      { key: 'booking_completed', label: 'Completed booking'       },
    ]
    const funnel = FUNNEL_STEPS.map((s, i, arr) => {
      const sessions = funnelMap.get(s.key) ?? 0
      const prev = i === 0 ? sessions : (funnelMap.get(arr[i - 1].key) ?? 0)
      const conversionFromPrev = i === 0 || prev === 0 ? null : sessions / prev
      const conversionFromTop  = i === 0 || (funnelMap.get(arr[0].key) ?? 0) === 0
        ? null
        : sessions / (funnelMap.get(arr[0].key) ?? 1)
      return { step: s.key, label: s.label, sessions, conversionFromPrev, conversionFromTop }
    })

    return {
      headline: counts,
      verificationQueue,
      usersByRole:        usersByRole.map((r) => ({ role: r.role, count: r._count._all })),
      doctorsByDistrict:  doctorsByDistrict.map((r) => ({ district: r.district, count: r._count._all })).sort((a, b) => b.count - a.count),
      hospitalsByType:    hospitalsByType.map((r) => ({ type: r.type, count: r._count._all })),
      apptsByStatus:      apptsByStatus.map((r) => ({ status: r.status, count: r._count._all })),
      signupsByDay:       signupsLast30.map((r) => ({ day: r.day.toISOString().slice(0, 10), count: Number(r.count) })),
      eventsByName:       eventsLast30.map((r) => ({ name: r.name, count: r._count._all })).sort((a, b) => b.count - a.count),
      topSearches:        topSearches.map((r) => ({ term: r.term, count: Number(r.count) })),
      funnel,
    }
  })
}

export default route
