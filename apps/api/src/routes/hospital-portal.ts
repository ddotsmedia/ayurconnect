// Hospital Management Portal — authenticated owner endpoints.
// All routes here require the caller to be a logged-in user with a
// User.hospitalId linking them to a Hospital row (role HOSPITAL or HOSPITAL_PENDING).

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const autoPrefix = '/hospital'

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80)
}

async function getOwnerHospitalId(request: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const u = request.session!.user
  const row = await (request.server as { prisma: { user: { findUnique: (a: unknown) => Promise<{ hospitalId: string | null } | null> } } })
    .prisma.user.findUnique({ where: { id: u.id }, select: { hospitalId: true } })
  if (!row?.hospitalId) {
    reply.code(403).send({ error: 'You do not own a hospital profile' })
    return null
  }
  return row.hospitalId
}

const STR_FIELDS = ['nameMl','pincode','profile','profileMl','contact','whatsapp','email','address','tourismClass','iso'] as const
const ARR_FIELDS = ['services','treatments','facilities','photos','languages','paymentMethods'] as const

function completeness(h: Record<string, unknown>): number {
  let score = 0
  if (h.name)        score += 5
  if (h.type)        score += 5
  if (h.district)    score += 5
  if (h.country)     score += 5
  if (h.profile)     score += 10
  if (h.contact)     score += 5
  if (h.whatsapp)    score += 5
  if (h.email)       score += 5
  if (h.address)     score += 5
  if (h.latitude && h.longitude) score += 5
  if (Array.isArray(h.photos)     && (h.photos as unknown[]).length >= 3) score += 15
  if (Array.isArray(h.treatments) && (h.treatments as unknown[]).length >= 3) score += 10
  if (Array.isArray(h.facilities) && (h.facilities as unknown[]).length >= 3) score += 10
  if (Array.isArray(h.languages)  && (h.languages as unknown[]).length >= 1) score += 5
  if (h.operatingHours) score += 5
  return Math.min(100, score)
}

const hospitalPortal: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // ─── Dashboard summary ──────────────────────────────────────────────
  fastify.get('/me', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const [h, inq30, packs, photos, reviewAgg, doctorLinks] = await Promise.all([
      fastify.prisma.hospital.findUnique({ where: { id: hid } }),
      fastify.prisma.hospitalInquiry.groupBy({
        by: ['status'], _count: { _all: true }, where: { hospitalId: hid },
      }),
      fastify.prisma.treatmentPackage.count({ where: { hospitalId: hid, isActive: true } }),
      fastify.prisma.hospital.findUnique({ where: { id: hid }, select: { photos: true } }),
      fastify.prisma.review.aggregate({ where: { hospitalId: hid }, _avg: { rating: true }, _count: { _all: true } }),
      fastify.prisma.hospitalDoctorLink.count({ where: { hospitalId: hid } }),
    ])
    return {
      hospital: h,
      completeness: completeness(h as unknown as Record<string, unknown>),
      stats: {
        inquiries: Object.fromEntries(inq30.map((r) => [r.status, r._count._all])),
        packagesActive: packs,
        photoCount: photos?.photos.length ?? 0,
        avgRating: reviewAgg._avg.rating ?? null,
        reviewCount: reviewAgg._count._all,
        doctorTeam: doctorLinks,
      },
    }
  })

  // ─── Profile update ─────────────────────────────────────────────────
  fastify.patch('/profile', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof body.name === 'string' && body.name.trim()) {
      data.name = body.name.trim().slice(0, 200)
      // Maintain slug when name changes & slug missing.
      const current = await fastify.prisma.hospital.findUnique({ where: { id: hid }, select: { slug: true } })
      if (!current?.slug) data.slug = `${slugify(data.name as string)}-${hid.slice(-6)}`
    }
    if (typeof body.type === 'string' && body.type.trim()) data.type = body.type.trim().toLowerCase().slice(0, 50)
    if (typeof body.district === 'string' && body.district.trim()) data.district = body.district.trim().slice(0, 100)
    if (typeof body.state === 'string') data.state = body.state.trim().slice(0, 100) || null
    if (typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country)) data.country = body.country
    if (body.establishedYear != null) data.establishedYear = Number(body.establishedYear) || null
    for (const k of STR_FIELDS) {
      if (body[k] === undefined) continue
      data[k] = typeof body[k] === 'string' && (body[k] as string).trim() ? (body[k] as string).trim().slice(0, 2000) : null
    }
    for (const k of ARR_FIELDS) {
      if (!Array.isArray(body[k])) continue
      data[k] = (body[k] as unknown[]).filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean).slice(0, 100)
    }
    if (typeof body.latitude === 'number' || body.latitude === null) data.latitude = body.latitude
    if (typeof body.longitude === 'number' || body.longitude === null) data.longitude = body.longitude
    if (body.operatingHours && typeof body.operatingHours === 'object') data.operatingHours = body.operatingHours
    for (const b of ['ayushCertified', 'panchakarma', 'nabh'] as const) {
      if (body[b] !== undefined) data[b] = Boolean(body[b])
    }
    const updated = await fastify.prisma.hospital.update({ where: { id: hid }, data })
    return { hospital: updated, completeness: completeness(updated as unknown as Record<string, unknown>) }
  })

  // ─── Packages CRUD ──────────────────────────────────────────────────
  fastify.get('/packages', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    return fastify.prisma.treatmentPackage.findMany({ where: { hospitalId: hid }, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] })
  })
  fastify.post('/packages', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const b = request.body as Record<string, unknown>
    const name = String(b.name ?? '').trim().slice(0, 200)
    if (!name) return reply.code(400).send({ error: 'name required' })
    const slug = slugify(name) || 'package'
    return fastify.prisma.treatmentPackage.create({
      data: {
        hospitalId: hid,
        name,
        nameMl: typeof b.nameMl === 'string' ? b.nameMl.slice(0, 200) : null,
        slug: `${slug}-${Date.now().toString(36)}`,
        description:   String(b.description ?? '').slice(0, 4000),
        descriptionMl: typeof b.descriptionMl === 'string' ? b.descriptionMl.slice(0, 4000) : null,
        treatments: Array.isArray(b.treatments) ? (b.treatments as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 30) : [],
        duration:   String(b.duration ?? '').slice(0, 50) || '7 days',
        priceFrom:  Number(b.priceFrom) || 0,
        priceTo:    b.priceTo != null && !Number.isNaN(Number(b.priceTo)) ? Number(b.priceTo) : null,
        currency:   typeof b.currency === 'string' ? b.currency.slice(0, 4) : 'INR',
        includes:   Array.isArray(b.includes) ? (b.includes as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 30) : [],
        idealFor:   Array.isArray(b.idealFor) ? (b.idealFor as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20) : [],
        season:     Array.isArray(b.season)   ? (b.season   as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 5)  : [],
        maxPatients: b.maxPatients != null ? Number(b.maxPatients) || null : null,
        isFeatured:  Boolean(b.isFeatured),
      },
    })
  })
  fastify.patch('/packages/:id', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.treatmentPackage.findUnique({ where: { id }, select: { hospitalId: true } })
    if (!existing || existing.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    const b = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const f of ['name','nameMl','description','descriptionMl','duration','currency'] as const) {
      if (typeof b[f] === 'string') data[f] = (b[f] as string).slice(0, 4000)
    }
    for (const f of ['treatments','includes','idealFor','season'] as const) {
      if (Array.isArray(b[f])) data[f] = (b[f] as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 30)
    }
    if (b.priceFrom != null) data.priceFrom = Number(b.priceFrom) || 0
    if (b.priceTo !== undefined) data.priceTo = b.priceTo == null || b.priceTo === '' ? null : Number(b.priceTo)
    if (b.maxPatients !== undefined) data.maxPatients = b.maxPatients == null || b.maxPatients === '' ? null : Number(b.maxPatients)
    if (b.isActive   !== undefined) data.isActive   = Boolean(b.isActive)
    if (b.isFeatured !== undefined) data.isFeatured = Boolean(b.isFeatured)
    return fastify.prisma.treatmentPackage.update({ where: { id }, data })
  })
  fastify.delete('/packages/:id', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.treatmentPackage.findUnique({ where: { id }, select: { hospitalId: true } })
    if (!existing || existing.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.treatmentPackage.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Inquiries ──────────────────────────────────────────────────────
  fastify.get('/inquiries', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { status, source, q } = request.query as Record<string, string | undefined>
    const where: Record<string, unknown> = { hospitalId: hid }
    if (status) where.status = status
    if (source) where.source = source
    if (q) where.OR = [
      { patientName: { contains: q, mode: 'insensitive' } },
      { email:       { contains: q, mode: 'insensitive' } },
      { treatmentInterest: { contains: q, mode: 'insensitive' } },
    ]
    return fastify.prisma.hospitalInquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
  })
  fastify.patch('/inquiries/:id', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { id } = request.params as { id: string }
    const inq = await fastify.prisma.hospitalInquiry.findUnique({ where: { id }, select: { hospitalId: true } })
    if (!inq || inq.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    const b = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof b.status === 'string' && ['new','contacted','converted','closed'].includes(b.status)) data.status = b.status
    if (typeof b.notes  === 'string') data.notes = b.notes.slice(0, 4000)
    if (typeof b.assignedTo === 'string' || b.assignedTo === null) data.assignedTo = b.assignedTo
    return fastify.prisma.hospitalInquiry.update({ where: { id }, data })
  })
  fastify.get('/inquiries.csv', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const items = await fastify.prisma.hospitalInquiry.findMany({ where: { hospitalId: hid }, orderBy: { createdAt: 'desc' }, take: 5000 })
    const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    const header = ['date','patientName','email','phone','whatsapp','country','treatmentInterest','status','source','message','notes'].join(',')
    const rows = items.map((r) => [
      r.createdAt.toISOString(), r.patientName, r.email, r.phone ?? '', r.whatsapp ?? '', r.country ?? '',
      r.treatmentInterest ?? '', r.status, r.source, r.message, r.notes ?? '',
    ].map(esc).join(','))
    reply.header('content-type', 'text/csv; charset=utf-8')
    reply.header('content-disposition', `attachment; filename="inquiries-${hid.slice(-6)}.csv"`)
    return [header, ...rows].join('\n')
  })

  // ─── Reviews + responses ───────────────────────────────────────────
  fastify.get('/reviews', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    return fastify.prisma.review.findMany({
      where: { hospitalId: hid },
      include: { user: { select: { name: true, email: true } }, hospitalResponse: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  })
  fastify.put('/reviews/:reviewId/response', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { reviewId } = request.params as { reviewId: string }
    const rev = await fastify.prisma.review.findUnique({ where: { id: reviewId }, select: { hospitalId: true } })
    if (!rev || rev.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    const body = String((request.body as Record<string, unknown>).body ?? '').trim().slice(0, 2000)
    if (!body) return reply.code(400).send({ error: 'body required' })
    return fastify.prisma.hospitalReviewResponse.upsert({
      where:  { reviewId },
      update: { body },
      create: { reviewId, hospitalId: hid, body },
    })
  })

  // ─── Doctor team links ──────────────────────────────────────────────
  fastify.get('/doctors', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const links = await fastify.prisma.hospitalDoctorLink.findMany({
      where: { hospitalId: hid },
      orderBy: { position: 'asc' },
      include: { doctor: { select: { id: true, name: true, specialization: true, district: true, ccimVerified: true, qualification: true, photoUrl: true } } },
    })
    return links
  })
  fastify.post('/doctors/link', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { doctorId, role, position } = request.body as { doctorId?: string; role?: string; position?: number }
    if (!doctorId) return reply.code(400).send({ error: 'doctorId required' })
    return fastify.prisma.hospitalDoctorLink.upsert({
      where:  { hospitalId_doctorId: { hospitalId: hid, doctorId } },
      update: { role: role ?? null, position: Number(position) || 0 },
      create: { hospitalId: hid, doctorId, role: role ?? null, position: Number(position) || 0 },
    })
  })
  fastify.delete('/doctors/link/:doctorId', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { doctorId } = request.params as { doctorId: string }
    await fastify.prisma.hospitalDoctorLink.delete({ where: { hospitalId_doctorId: { hospitalId: hid, doctorId } } }).catch(() => {})
    return reply.code(204).send()
  })
  fastify.get('/doctors/search', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { q = '' } = request.query as Record<string, string>
    if (!q.trim()) return []
    return fastify.prisma.doctor.findMany({
      where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { tcmcNumber: { equals: q } }] },
      select: { id: true, name: true, specialization: true, district: true, ccimVerified: true },
      take: 20,
    })
  })

  // ─── Promotions / marketing banners ────────────────────────────────
  fastify.get('/promotions', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    return fastify.prisma.hospitalPromotion.findMany({ where: { hospitalId: hid }, orderBy: { createdAt: 'desc' } })
  })
  fastify.post('/promotions', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const b = request.body as Record<string, unknown>
    const title = String(b.title ?? '').trim()
    if (!title) return reply.code(400).send({ error: 'title required' })
    return fastify.prisma.hospitalPromotion.create({
      data: {
        hospitalId: hid,
        title:    title.slice(0, 200),
        subtitle: typeof b.subtitle === 'string' ? b.subtitle.slice(0, 500) : null,
        ctaLabel: typeof b.ctaLabel === 'string' ? b.ctaLabel.slice(0, 50)  : null,
        ctaUrl:   typeof b.ctaUrl   === 'string' ? b.ctaUrl.slice(0, 500)   : null,
        endsAt:   typeof b.endsAt   === 'string' && b.endsAt ? new Date(b.endsAt) : null,
      },
    })
  })
  fastify.patch('/promotions/:id', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.hospitalPromotion.findUnique({ where: { id }, select: { hospitalId: true } })
    if (!existing || existing.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    const b = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof b.title    === 'string') data.title    = b.title.slice(0, 200)
    if (typeof b.subtitle === 'string') data.subtitle = b.subtitle.slice(0, 500)
    if (typeof b.ctaLabel === 'string') data.ctaLabel = b.ctaLabel.slice(0, 50)
    if (typeof b.ctaUrl   === 'string') data.ctaUrl   = b.ctaUrl.slice(0, 500)
    if (b.endsAt !== undefined) data.endsAt = b.endsAt ? new Date(b.endsAt as string) : null
    if (b.isActive !== undefined) data.isActive = Boolean(b.isActive)
    return fastify.prisma.hospitalPromotion.update({ where: { id }, data })
  })
  fastify.delete('/promotions/:id', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.hospitalPromotion.findUnique({ where: { id }, select: { hospitalId: true } })
    if (!existing || existing.hospitalId !== hid) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.hospitalPromotion.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Analytics (last 90 days, simple aggregations) ─────────────────
  fastify.get('/analytics', async (request, reply) => {
    const hid = await getOwnerHospitalId(request, reply); if (!hid) return
    const since = new Date(Date.now() - 90 * 86_400_000)
    const [inquiriesAll, inqBySource, inqByCountry, inqByStatus, topTreatments, viewsByDay] = await Promise.all([
      fastify.prisma.hospitalInquiry.count({ where: { hospitalId: hid, createdAt: { gte: since } } }),
      fastify.prisma.hospitalInquiry.groupBy({ by: ['source'],  where: { hospitalId: hid, createdAt: { gte: since } }, _count: { _all: true } }),
      fastify.prisma.hospitalInquiry.groupBy({ by: ['country'], where: { hospitalId: hid, createdAt: { gte: since }, country: { not: null } }, _count: { _all: true } }),
      fastify.prisma.hospitalInquiry.groupBy({ by: ['status'],  where: { hospitalId: hid, createdAt: { gte: since } }, _count: { _all: true } }),
      fastify.prisma.hospitalInquiry.groupBy({ by: ['treatmentInterest'], where: { hospitalId: hid, createdAt: { gte: since }, treatmentInterest: { not: null } }, _count: { _all: true } }),
      fastify.prisma.analyticsEvent.findMany({
        where: { name: 'hospital_view', props: { path: ['hospitalId'], equals: hid }, createdAt: { gte: since } },
        select: { createdAt: true },
        take: 5000,
      }),
    ])
    // Aggregate views by day client-side
    const viewsMap = new Map<string, number>()
    for (const v of viewsByDay) {
      const k = v.createdAt.toISOString().slice(0, 10)
      viewsMap.set(k, (viewsMap.get(k) ?? 0) + 1)
    }
    return {
      windowDays: 90,
      inquiriesTotal: inquiriesAll,
      inquiriesBySource:  inqBySource.map((r) => ({ key: r.source,            count: r._count._all })),
      inquiriesByCountry: inqByCountry.map((r) => ({ key: r.country ?? '—',   count: r._count._all })),
      inquiriesByStatus:  inqByStatus.map((r) => ({ key: r.status,            count: r._count._all })),
      topTreatments:      topTreatments.map((r) => ({ key: r.treatmentInterest ?? '—', count: r._count._all })).sort((a, b) => b.count - a.count).slice(0, 10),
      profileViewsByDay:  Array.from(viewsMap.entries()).sort(([a],[b]) => a < b ? -1 : 1).map(([k, v]) => ({ day: k, views: v })),
      profileViewsTotal:  viewsByDay.length,
    }
  })
}

export default hospitalPortal
