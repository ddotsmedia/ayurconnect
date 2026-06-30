// Streak / points / leaderboard — gamification + daily-return rewards.
//
// POST /api/streak/checkin  — once per session per day, awards +5
// GET  /api/streak/me       — current user's streak/points/level
// POST /api/streak/award    — award points for a named action (server-only)
// GET  /api/streak/leaderboard — top 10 this month + all-time

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/streak'

const POINTS_FOR_ACTION: Record<string, number> = {
  login:            5,
  daily_mcq:        10,
  forum_answer:     15,
  article_write:    50,
  referral:         100,
  profile_complete: 25,
}

function levelFor(points: number): string {
  if (points >= 5000) return 'master'
  if (points >= 1500) return 'expert'
  if (points >= 500)  return 'practitioner'
  if (points >= 100)  return 'learner'
  return 'beginner'
}

function sameUTCDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear()
      && a.getUTCMonth()    === b.getUTCMonth()
      && a.getUTCDate()     === b.getUTCDate()
}
function daysApartUTC(a: Date, b: Date): number {
  const A = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const B = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round((B - A) / 86_400_000)
}

const streak: FastifyPluginAsync = async (fastify) => {
  // GET /me — current user's streak record (lazy-create on first read)
  fastify.get('/me', { preHandler: fastify.requireSession }, async (request) => {
    const userId = request.session!.user.id
    let row = await fastify.prisma.userStreak.findUnique({ where: { userId } })
    if (!row) row = await fastify.prisma.userStreak.create({ data: { userId } })
    const rank = await fastify.prisma.userStreak.count({ where: { totalPoints: { gt: row.totalPoints } } })
    return { ...row, rank: rank + 1, level: levelFor(row.totalPoints) }
  })

  // POST /checkin — daily check-in (idempotent for the day)
  fastify.post('/checkin', { preHandler: fastify.requireSession }, async (request) => {
    const userId = request.session!.user.id
    const now    = new Date()

    const existing = await fastify.prisma.userStreak.findUnique({ where: { userId } })
    if (!existing) {
      const created = await fastify.prisma.userStreak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: now, totalPoints: POINTS_FOR_ACTION.login, level: levelFor(POINTS_FOR_ACTION.login) },
      })
      await fastify.prisma.pointLog.create({ data: { userId, points: POINTS_FOR_ACTION.login, action: 'login', description: 'First check-in' } })
      return { ...created, awarded: POINTS_FOR_ACTION.login, alreadyToday: false }
    }

    if (existing.lastActiveDate && sameUTCDay(existing.lastActiveDate, now)) {
      return { ...existing, awarded: 0, alreadyToday: true }
    }

    const diff = existing.lastActiveDate ? daysApartUTC(existing.lastActiveDate, now) : 99
    const nextStreak = diff === 1 ? existing.currentStreak + 1 : 1
    const newPoints  = existing.totalPoints + POINTS_FOR_ACTION.login
    const updated = await fastify.prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak:  nextStreak,
        longestStreak:  Math.max(existing.longestStreak, nextStreak),
        lastActiveDate: now,
        totalPoints:    newPoints,
        level:          levelFor(newPoints),
      },
    })
    await fastify.prisma.pointLog.create({ data: { userId, points: POINTS_FOR_ACTION.login, action: 'login', description: `Day ${nextStreak} streak` } })
    return { ...updated, awarded: POINTS_FOR_ACTION.login, alreadyToday: false }
  })

  // POST /award — internal: award points for a named action (server-side calls)
  fastify.post('/award', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const body = request.body as { action?: string; description?: string }
    const action = String(body.action ?? '')
    if (!POINTS_FOR_ACTION[action]) return reply.code(400).send({ error: 'unknown action' })
    const points = POINTS_FOR_ACTION[action]

    // Idempotency for daily_mcq: only award once per UTC day per user.
    if (action === 'daily_mcq') {
      const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0)
      const already = await fastify.prisma.pointLog.findFirst({ where: { userId, action, earnedAt: { gte: dayStart } } })
      if (already) return { awarded: 0, alreadyToday: true }
    }

    const existing = await fastify.prisma.userStreak.upsert({
      where: { userId },
      update: {},
      create: { userId, lastActiveDate: new Date() },
    })
    const newPoints = existing.totalPoints + points
    const updated = await fastify.prisma.userStreak.update({
      where: { userId },
      data:  { totalPoints: newPoints, level: levelFor(newPoints) },
    })
    await fastify.prisma.pointLog.create({ data: { userId, points, action, description: body.description ?? null } })
    return { ...updated, awarded: points }
  })

  // GET /leaderboard — top 10 this month + all-time top 10
  fastify.get('/leaderboard', async () => {
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)
    const [allTime, monthly] = await Promise.all([
      fastify.prisma.userStreak.findMany({
        orderBy: { totalPoints: 'desc' },
        take: 10,
        select: { totalPoints: true, currentStreak: true, level: true, userId: true,
                  user: { select: { name: true, createdAt: true } } },
      }),
      fastify.prisma.pointLog.groupBy({
        by: ['userId'],
        where: { earnedAt: { gte: monthStart } },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: 10,
      }).then(async (rows) => {
        const ids = rows.map((r) => r.userId)
        const users = await fastify.prisma.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, createdAt: true },
        })
        const byId = new Map(users.map((u) => [u.id, u]))
        return rows.map((r) => ({ userId: r.userId, monthlyPoints: r._sum.points ?? 0, name: byId.get(r.userId)?.name ?? null, joined: byId.get(r.userId)?.createdAt ?? null }))
      }),
    ])
    return { allTime, monthly }
  })
}

export default streak
