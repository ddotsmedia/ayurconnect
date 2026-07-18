import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const autoPrefix = '/jobs-portal'

// Anonymous quick-post ingest — writes to QuickJobSubmission, no auth.
// Kept separate from jobs-portal.ts so the diff stays additive.
const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/quick', async (request: FastifyRequest, reply: FastifyReply) => {
    const b = (request.body ?? {}) as Record<string, unknown>
    const title           = typeof b.title           === 'string' ? b.title.trim().slice(0, 200)           : ''
    const location        = typeof b.location        === 'string' ? b.location.trim().slice(0, 100)        : ''
    const contactWhatsapp = typeof b.contactWhatsapp === 'string' ? b.contactWhatsapp.trim().slice(0, 40)  : ''
    if (!title || !location || !contactWhatsapp) {
      return reply.code(400).send({ error: 'title, location, contactWhatsapp required' })
    }

    const row = await fastify.prisma.quickJobSubmission.create({
      data: {
        title,
        location,
        contactWhatsapp,
        salary:      typeof b.salary      === 'string' ? b.salary.trim().slice(0, 100)      : null,
        specialty:   typeof b.specialty   === 'string' ? b.specialty.trim().slice(0, 100)   : null,
        description: typeof b.description === 'string' ? b.description.trim().slice(0, 2000): null,
        isWalkIn:    Boolean(b.isWalkIn),
        walkInDate:  typeof b.walkInDate  === 'string' ? b.walkInDate.trim().slice(0, 40)   : null,
        walkInTime:  typeof b.walkInTime  === 'string' ? b.walkInTime.trim().slice(0, 40)   : null,
        walkInVenue: typeof b.walkInVenue === 'string' ? b.walkInVenue.trim().slice(0, 200) : null,
        source:      typeof b.source      === 'string' ? b.source.trim().slice(0, 40)       : 'quick-post',
        // 2026-07-19: role_type (doctor | therapist | consultant). Anything
        // else is coerced to null so bad clients can't inject arbitrary values.
        roleType:    (typeof b.roleType === 'string' && ['doctor', 'therapist', 'consultant'].includes(b.roleType)) ? b.roleType : null,
      },
      select: { id: true, status: true, createdAt: true },
    })
    return { ok: true, id: row.id, status: row.status, createdAt: row.createdAt }
  })

  // ─── Public talent directory feed (opt-in candidates only) ──────────────
  fastify.get('/talent', async (request) => {
    const q = request.query as Record<string, string>
    const page  = Math.max(1, Number(q.page)  || 1)
    const limit = Math.min(50, Number(q.limit) || 20)

    const where: Record<string, unknown> = { profileVisibility: 'public' }
    if (q.q)              where.OR              = [ { fullName: { contains: q.q, mode: 'insensitive' } }, { headline: { contains: q.q, mode: 'insensitive' } } ]
    if (q.specialization) where.specializations = { has: q.specialization }
    if (q.license)        where.currentLicenses = { has: q.license }
    if (q.location)       where.currentLocation = { contains: q.location, mode: 'insensitive' }
    if (q.availability === 'immediate') where.availability = 'immediate'

    const [candidates, total] = await Promise.all([
      fastify.prisma.candidateProfile.findMany({
        where,
        select: {
          id: true, fullName: true, headline: true, highestQualification: true, specializations: true,
          totalExperience: true, currentLocation: true, preferredLocations: true, availability: true,
          currentLicenses: true, openToLocum: true, openToTelemedicine: true, willingToRelocate: true,
        },
        orderBy: [{ availability: 'asc' }, { totalExperience: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      fastify.prisma.candidateProfile.count({ where }),
    ])
    return { candidates, total }
  })
}

export default route
