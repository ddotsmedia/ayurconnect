// Doctor viral-growth endpoints — referral codes, recruit tracking,
// leaderboards, badges, batchmates, nudges. All scoped to authenticated
// doctor (User.doctorId) unless explicitly public.

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const autoPrefix = '/doctor-viral'

function genCode(): string {
  // 6-char base32 — alphanumeric, unambiguous (no O/0/I/1).
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += A[Math.floor(Math.random() * A.length)]
  return out
}

async function getOwnerDoctorId(request: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const u = request.session!.user
  const row = await request.server.prisma.user.findUnique({ where: { id: u.id }, select: { doctorId: true } })
  if (!row?.doctorId) {
    reply.code(403).send({ error: 'You do not own a doctor profile' })
    return null
  }
  return row.doctorId
}

const BADGE_THRESHOLDS = [
  { score: 50,  badge: 'rising'   },
  { score: 75,  badge: 'active'   },
  { score: 90,  badge: 'star'     },
  { score: 100, badge: 'complete' },
] as const

const doctorViral: FastifyPluginAsync = async (fastify) => {
  // ─── PUBLIC: Leaderboard (read-only) ──────────────────────────────
  fastify.get('/leaderboard', async () => {
    const [topReferrers, mostHelpful, mostReviewed, newest] = await Promise.all([
      fastify.prisma.doctorRecruitInvite.groupBy({
        by:    ['referrerDoctorId'],
        where: { status: 'verified' },
        _count: { _all: true },
        orderBy: { _count: { referrerDoctorId: 'desc' } },
        take: 20,
      }),
      fastify.prisma.doctorAnswer.groupBy({
        by:    ['doctorUserId'],
        _count: { _all: true },
        orderBy: { _count: { doctorUserId: 'desc' } },
        take: 20,
      }).catch(() => [] as Array<{ doctorUserId: string; _count: { _all: number } }>),
      fastify.prisma.review.groupBy({
        by:    ['doctorId'],
        where: { doctorId: { not: null } },
        _count: { _all: true }, _avg: { rating: true },
        orderBy: { _count: { doctorId: 'desc' } },
        take: 20,
      }),
      fastify.prisma.doctor.findMany({
        where: { ccimVerified: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, specialization: true, district: true, photoUrl: true, profileBadges: true },
        take: 12,
      }),
    ])
    // Map helpful-by-user back to their owned Doctor row.
    const helpfulUserIds = (mostHelpful as Array<{ doctorUserId: string; _count: { _all: number } }>).map((r) => r.doctorUserId)
    const usersForHelpful = helpfulUserIds.length > 0 ? await fastify.prisma.user.findMany({
      where: { id: { in: helpfulUserIds } }, select: { id: true, doctorId: true },
    }) : []
    const userToDoctor = new Map(usersForHelpful.map((u) => [u.id, u.doctorId]))

    const ids = new Set<string>([
      ...topReferrers.map((r) => r.referrerDoctorId),
      ...Array.from(userToDoctor.values()).filter((x): x is string => !!x),
      ...mostReviewed.map((r) => r.doctorId).filter((x): x is string => !!x),
    ])
    const docs = ids.size > 0 ? await fastify.prisma.doctor.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true, specialization: true, district: true, photoUrl: true, ccimVerified: true, profileBadges: true },
    }) : []
    const byId = new Map(docs.map((d) => [d.id, d]))
    return {
      topReferrers:  topReferrers.map((r) => ({ doctor: byId.get(r.referrerDoctorId) ?? null, count: r._count._all })).filter((r) => r.doctor),
      mostHelpful:   (mostHelpful as Array<{ doctorUserId: string; _count: { _all: number } }>).map((r) => {
        const did = userToDoctor.get(r.doctorUserId)
        return { doctor: did ? byId.get(did) ?? null : null, count: r._count._all }
      }).filter((r) => r.doctor),
      mostReviewed:  mostReviewed.map((r) => ({ doctor: r.doctorId ? byId.get(r.doctorId) ?? null : null, count: r._count._all, avg: r._avg.rating })).filter((r) => r.doctor),
      newest,
    }
  })

  // ─── PUBLIC: Batchmate finder (used by /doctors/register batch step) ──
  fastify.get('/batchmates', async (request) => {
    const { collegeSlug, batchYear } = request.query as { collegeSlug?: string; batchYear?: string }
    if (!collegeSlug) return []
    const year = Number(batchYear) || null
    const where: Record<string, unknown> = { collegeSlug }
    if (year) where.batchYear = { gte: year - 2, lte: year + 2 }
    return fastify.prisma.doctor.findMany({
      where,
      orderBy: { batchYear: 'asc' },
      select: { id: true, name: true, specialization: true, district: true, batchYear: true, ccimVerified: true, photoUrl: true },
      take: 30,
    })
  })

  // ─── Auth gate for the rest ────────────────────────────────────────
  fastify.register(async (sub) => {
    sub.addHook('preHandler', fastify.requireSession)

    // GET /me — referral code, badges, stats, nudges
    sub.get('/me', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      let doc = await fastify.prisma.doctor.findUnique({
        where: { id: did },
        select: {
          id: true, name: true, referralCode: true, profileBadges: true, profileCompleteness: true,
          ccimVerified: true, collegeSlug: true, college: true, batchYear: true,
          photoUrl: true, aboutMl: true, bio: true,
        },
      })
      // Lazy-init referral code on first read.
      if (doc && !doc.referralCode) {
        let code = genCode()
        for (let i = 0; i < 5; i++) {
          const taken = await fastify.prisma.doctor.findUnique({ where: { referralCode: code }, select: { id: true } })
          if (!taken) break
          code = genCode()
        }
        doc = await fastify.prisma.doctor.update({
          where: { id: did },
          data:  { referralCode: code },
          select: { id: true, name: true, referralCode: true, profileBadges: true, profileCompleteness: true, ccimVerified: true, collegeSlug: true, college: true, batchYear: true, photoUrl: true, aboutMl: true, bio: true },
        })
      }
      const [inviteCounts, leaderboardRank, prescriptionCt, cmeTotal] = await Promise.all([
        fastify.prisma.doctorRecruitInvite.groupBy({ by: ['status'], where: { referrerDoctorId: did }, _count: { _all: true } }),
        // Cheap rank: count how many doctors have more verified referrals than me.
        (async () => {
          if (!doc) return null
          const verifiedCount = await fastify.prisma.doctorRecruitInvite.count({ where: { referrerDoctorId: did, status: 'verified' } })
          if (verifiedCount === 0) return null
          const higher = await fastify.prisma.doctorRecruitInvite.groupBy({
            by: ['referrerDoctorId'], where: { status: 'verified' }, _count: { _all: true },
            having: { referrerDoctorId: { _count: { gt: verifiedCount } } },
          }).catch(() => [])
          return higher.length + 1
        })(),
        fastify.prisma.doctorPrescription.count({ where: { doctorId: did } }),
        fastify.prisma.doctorCmeLog.aggregate({ where: { doctorId: did }, _sum: { credits: true } }),
      ])
      return {
        doctor: doc,
        invites: {
          invited:    inviteCounts.find((r) => r.status === 'invited')?._count._all   ?? 0,
          registered: inviteCounts.find((r) => r.status === 'registered')?._count._all ?? 0,
          verified:   inviteCounts.find((r) => r.status === 'verified')?._count._all  ?? 0,
        },
        leaderboardRank,
        prescriptionCount: prescriptionCt,
        cmeTotal:          cmeTotal._sum.credits ?? 0,
      }
    })

    // POST /invites — log a recruit invite (also fires when WhatsApp share happens, optional)
    sub.post('/invites', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const b = request.body as Record<string, unknown>
      const ref = await fastify.prisma.doctor.findUnique({ where: { id: did }, select: { referralCode: true } })
      if (!ref?.referralCode) return reply.code(400).send({ error: 'Referral code missing — refresh /doctor-viral/me first' })
      return fastify.prisma.doctorRecruitInvite.create({
        data: {
          referrerDoctorId: did,
          referralCode: ref.referralCode,
          invitedName:     typeof b.name     === 'string' ? b.name.slice(0, 200)   : null,
          invitedEmail:    typeof b.email    === 'string' ? b.email.slice(0, 200)  : null,
          invitedPhone:    typeof b.phone    === 'string' ? b.phone.slice(0, 32)   : null,
          invitedWhatsApp: typeof b.whatsapp === 'string' ? b.whatsapp.slice(0, 32) : null,
          source:          typeof b.source   === 'string' ? b.source.slice(0, 20)  : 'manual',
        },
      })
    })

    // GET /invites — recruiter's own invite history
    sub.get('/invites', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      return fastify.prisma.doctorRecruitInvite.findMany({
        where: { referrerDoctorId: did },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { registered: { select: { id: true, name: true, specialization: true, district: true, ccimVerified: true } } },
      })
    })

    // POST /badges/sync — recompute badges based on current completeness + referrals
    sub.post('/badges/sync', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const doc = await fastify.prisma.doctor.findUnique({
        where: { id: did },
        select: { profileCompleteness: true, profileBadges: true, ccimVerified: true },
      })
      if (!doc) return reply.code(404).send({ error: 'not found' })
      const refCount = await fastify.prisma.doctorRecruitInvite.count({ where: { referrerDoctorId: did, status: 'verified' } })
      const reviewCount = await fastify.prisma.review.count({ where: { doctorId: did } })
      // Doctor.id → User.id (1:1 via User.doctorId) for the DoctorAnswer count.
      const docUser = await fastify.prisma.user.findFirst({ where: { doctorId: did }, select: { id: true } })
      const answerCount = docUser ? await fastify.prisma.doctorAnswer.count({ where: { doctorUserId: docUser.id } }).catch(() => 0) : 0
      const score = doc.profileCompleteness ?? 0
      const next = new Set<string>(doc.profileBadges)
      for (const t of BADGE_THRESHOLDS) if (score >= t.score) next.add(t.badge)
      if (refCount    >= 1) next.add('referrer')
      if (reviewCount >= 5) next.add('reviewed')
      if (answerCount >= 5) next.add('helpful')
      const updated = await fastify.prisma.doctor.update({
        where: { id: did },
        data:  { profileBadges: Array.from(next) },
        select: { profileBadges: true },
      })
      return { badges: updated.profileBadges, score, refCount, reviewCount, answerCount }
    })

    // ─── Nudges ──────────────────────────────────────────────────────
    sub.get('/nudges', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const doc = await fastify.prisma.doctor.findUnique({
        where: { id: did },
        select: {
          id: true, createdAt: true, profileCompleteness: true, specialization: true, photoUrl: true, district: true,
          ccimVerified: true,
        },
      })
      if (!doc) return []
      const sent = await fastify.prisma.doctorNudge.findMany({ where: { doctorId: did } })
      const sentByType = new Map(sent.map((s) => [s.nudgeType, s]))
      const ageDays = Math.floor((Date.now() - doc.createdAt.getTime()) / 86_400_000)
      const refCount = await fastify.prisma.doctorRecruitInvite.count({ where: { referrerDoctorId: did } })

      const candidates: Array<{ type: string; title: string; cta: string; href: string; minDays: number; show: boolean }> = [
        { type: 'welcome',          title: 'Welcome — complete your profile to get verified',           cta: 'Edit profile',     href: '/dashboard/profile',  minDays: 0,  show: (doc.profileCompleteness ?? 0) < 50 },
        { type: 'add-specs',        title: 'Add your specializations to appear in patient search',      cta: 'Add specs',        href: '/dashboard/profile',  minDays: 3,  show: !doc.specialization },
        { type: 'add-photo',        title: 'Doctors with a photo get 3× more profile views',             cta: 'Upload photo',     href: '/dashboard/profile',  minDays: 14, show: !doc.photoUrl },
        { type: 'invite-colleague', title: 'Invite a colleague and unlock the Referrer badge',          cta: 'Invite now',       href: '/doctor/share',       minDays: 7,  show: refCount === 0 },
        { type: 'district-leads',   title: `Patients searched for doctors in ${doc.district ?? 'your district'} this month`, cta: 'Strengthen profile', href: '/dashboard/profile', minDays: 30, show: true },
        { type: 'monthly-report',   title: 'View your monthly visibility report',                        cta: 'See report',       href: '/doctor/dashboard/visibility', minDays: 30, show: true },
      ]
      return candidates.filter((c) => c.show && ageDays >= c.minDays && !sentByType.has(c.type)).slice(0, 4)
    })
    sub.post('/nudges/:type/dismiss', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const { type } = request.params as { type: string }
      await fastify.prisma.doctorNudge.upsert({
        where:  { doctorId_nudgeType: { doctorId: did, nudgeType: type } },
        update: { clickedAt: new Date() },
        create: { doctorId: did, nudgeType: type, channel: 'dashboard' },
      })
      return { ok: true }
    })

    // ─── Prescription pad ────────────────────────────────────────────
    sub.get('/prescriptions', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      return fastify.prisma.doctorPrescription.findMany({ where: { doctorId: did }, orderBy: { createdAt: 'desc' }, take: 100 })
    })
    sub.post('/prescriptions', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const b = request.body as Record<string, unknown>
      if (!b.patientName || typeof b.patientName !== 'string') return reply.code(400).send({ error: 'patientName required' })
      return fastify.prisma.doctorPrescription.create({
        data: {
          doctorId: did,
          patientName:   b.patientName.slice(0, 200),
          patientAge:    b.patientAge != null ? Number(b.patientAge) || null : null,
          patientGender: typeof b.patientGender === 'string' ? b.patientGender.slice(0, 20) : null,
          diagnosis:     typeof b.diagnosis   === 'string' ? b.diagnosis.slice(0, 1000)  : null,
          diagnosisMl:   typeof b.diagnosisMl === 'string' ? b.diagnosisMl.slice(0, 1000) : null,
          items:         Array.isArray(b.items) ? b.items.slice(0, 30) : [],
          pathya:        typeof b.pathya  === 'string' ? b.pathya.slice(0, 2000) : null,
          apathya:       typeof b.apathya === 'string' ? b.apathya.slice(0, 2000) : null,
          notes:         typeof b.notes   === 'string' ? b.notes.slice(0, 4000)  : null,
        },
      })
    })
    sub.get('/prescriptions/:id', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const { id } = request.params as { id: string }
      const rx = await fastify.prisma.doctorPrescription.findUnique({ where: { id } })
      if (!rx || rx.doctorId !== did) return reply.code(404).send({ error: 'not found' })
      return rx
    })

    // ─── CME log ─────────────────────────────────────────────────────
    sub.get('/cme', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const items = await fastify.prisma.doctorCmeLog.findMany({ where: { doctorId: did }, orderBy: { date: 'desc' }, take: 200 })
      const yearTotal = items.filter((i) => i.date.getFullYear() === new Date().getFullYear()).reduce((a, b) => a + b.credits, 0)
      return { items, yearTotal }
    })
    sub.post('/cme', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const b = request.body as Record<string, unknown>
      if (!b.eventName || typeof b.eventName !== 'string' || !b.date) return reply.code(400).send({ error: 'eventName + date required' })
      return fastify.prisma.doctorCmeLog.create({
        data: {
          doctorId: did,
          eventName: b.eventName.slice(0, 200),
          organizer: typeof b.organizer === 'string' ? b.organizer.slice(0, 200) : null,
          date:      new Date(b.date as string),
          credits:   Number(b.credits) || 1,
          certificateUrl: typeof b.certificateUrl === 'string' ? b.certificateUrl.slice(0, 500) : null,
          notes:     typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null,
        },
      })
    })
    sub.delete('/cme/:id', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const { id } = request.params as { id: string }
      const log = await fastify.prisma.doctorCmeLog.findUnique({ where: { id }, select: { doctorId: true } })
      if (!log || log.doctorId !== did) return reply.code(404).send({ error: 'not found' })
      await fastify.prisma.doctorCmeLog.delete({ where: { id } })
      return reply.code(204).send()
    })

    // ─── Visibility / monthly report ─────────────────────────────────
    sub.get('/visibility', async (request, reply) => {
      const did = await getOwnerDoctorId(request, reply); if (!did) return
      const since = new Date(Date.now() - 30 * 86_400_000)
      const [views, appearances, inquiries] = await Promise.all([
        fastify.prisma.analyticsEvent.count({ where: { name: 'doctor_view',           props: { path: ['doctorId'], equals: did }, createdAt: { gte: since } } }).catch(() => 0),
        fastify.prisma.analyticsEvent.count({ where: { name: 'doctor_search_result',  props: { path: ['doctorId'], equals: did }, createdAt: { gte: since } } }).catch(() => 0),
        fastify.prisma.appointment.count({ where: { doctorId: did, createdAt: { gte: since } } }).catch(() => 0),
      ])
      return { profileViews30d: views, searchAppearances30d: appearances, inquiries30d: inquiries }
    })
  })

  // ─── PUBLIC: Register-with-referral hook (call when a doctor registers)
  // Mounted unauthed so /me/promote-to-doctor can call internally too;
  // also called from /doctors/register?ref=CODE client-side after signup.
  fastify.post('/track-registration', async (request, reply) => {
    const b = request.body as { code?: string; doctorId?: string }
    if (!b.code || !b.doctorId) return reply.code(400).send({ error: 'code + doctorId required' })
    const referrer = await fastify.prisma.doctor.findUnique({ where: { referralCode: b.code }, select: { id: true } })
    if (!referrer || referrer.id === b.doctorId) return { ok: false, reason: 'invalid_or_self' }
    const existing = await fastify.prisma.doctorRecruitInvite.findUnique({ where: { registeredDoctorId: b.doctorId } })
    if (existing) return { ok: false, reason: 'already_tracked' }
    await fastify.prisma.doctorRecruitInvite.create({
      data: {
        referrerDoctorId:   referrer.id,
        referralCode:       b.code,
        status:             'registered',
        registeredDoctorId: b.doctorId,
        registeredAt:       new Date(),
        source:             'link',
      },
    })
    return { ok: true }
  })

  // Public verification-hook (admin endpoint flips registration → verified).
  // Called from doctors moderation flow on approve. We keep it unauthed but
  // require both ids — admin moderation flow will call internally.
  fastify.post('/track-verification', async (request, reply) => {
    const b = request.body as { doctorId?: string }
    if (!b.doctorId) return reply.code(400).send({ error: 'doctorId required' })
    const inv = await fastify.prisma.doctorRecruitInvite.findUnique({ where: { registeredDoctorId: b.doctorId } })
    if (!inv) return { ok: false }
    await fastify.prisma.doctorRecruitInvite.update({ where: { id: inv.id }, data: { status: 'verified', verifiedAt: new Date() } })
    return { ok: true }
  })
}

export default doctorViral
