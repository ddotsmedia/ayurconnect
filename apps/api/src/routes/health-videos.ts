import type { FastifyPluginAsync } from 'fastify'

// CRUD for /videos page. Admin pastes a YouTube URL; this route normalises
// the URL into a watch-style canonical URL + extracts the 11-char video id
// so we can build embeds and thumbnails without re-parsing on every render.
//
// Accepted YouTube URL formats:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
//   https://m.youtube.com/watch?v=ID

export const autoPrefix = '/videos'

const CATEGORIES = ['panchakarma', 'yoga', 'herbs', 'lifestyle', 'qa', 'research', 'recipes', 'kids', 'womens-health', 'mens-health']
const LANGUAGES  = ['en', 'ml', 'hi', 'ta', 'ar']

// Strict 11-char id matcher — what every YouTube id has been for years.
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/

function extractYoutubeId(raw: string): string | null {
  if (!raw) return null
  const url = raw.trim()
  // Bare id passed in (admins may paste just the id).
  if (YT_ID_RE.test(url)) return url
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return YT_ID_RE.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      // /watch?v=
      const v = u.searchParams.get('v')
      if (v && YT_ID_RE.test(v)) return v
      // /embed/ID, /shorts/ID, /v/ID, /live/ID
      const parts = u.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'v', 'live'].includes(p))
      if (idx >= 0 && parts[idx + 1] && YT_ID_RE.test(parts[idx + 1])) return parts[idx + 1]
    }
  } catch {
    return null
  }
  return null
}

function canonicalUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

function defaultThumbnail(id: string): string {
  // hqdefault is reliably present for every public video; maxresdefault often 404s.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

const healthVideos: FastifyPluginAsync = async (fastify) => {
  // Public list — published only, sorted: featured first, then sortOrder asc.
  fastify.get('/', async (request) => {
    const { category, language, search, featured, page = '1', limit = '24' } = request.query as Record<string, string>
    const pageNum  = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(48, Math.max(1, Number(limit) || 24))
    const where: Record<string, unknown> = { published: true }
    if (category) where.category = category
    if (language) where.language = language
    if (featured === 'true') where.featured = true
    if (search) where.OR = [
      { title:       { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { speaker:     { contains: search, mode: 'insensitive' } },
      { tags:        { has: search } },
    ]
    const [items, total] = await Promise.all([
      fastify.prisma.healthVideo.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { speakerDoctor: { select: { id: true, name: true, specialization: true, photoUrl: true } } },
      }),
      fastify.prisma.healthVideo.count({ where }),
    ])
    return { videos: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/admin', { preHandler: fastify.requireAdmin }, async () => {
    const items = await fastify.prisma.healthVideo.findMany({
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { speakerDoctor: { select: { id: true, name: true } } },
    })
    return { videos: items }
  })

  fastify.get('/categories', async () => ({ categories: CATEGORIES }))

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const row = await fastify.prisma.healthVideo.findUnique({
      where: { id },
      include: { speakerDoctor: { select: { id: true, name: true, specialization: true, photoUrl: true, district: true } } },
    })
    if (!row) return reply.code(404).send({ error: 'Video not found' })
    return row
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const rawUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : ''
    if (!title || !rawUrl) return reply.code(400).send({ error: 'title and youtubeUrl are required' })

    const youtubeId = extractYoutubeId(rawUrl)
    if (!youtubeId) return reply.code(400).send({ error: 'could not parse a YouTube video id from youtubeUrl' })

    if (body.category && !CATEGORIES.includes(String(body.category))) {
      return reply.code(400).send({ error: `category must be one of ${CATEGORIES.join(', ')}` })
    }
    if (body.language && !LANGUAGES.includes(String(body.language))) {
      return reply.code(400).send({ error: `language must be one of ${LANGUAGES.join(', ')}` })
    }

    const data = {
      title,
      youtubeUrl:     canonicalUrl(youtubeId),
      youtubeId,
      description:    typeof body.description === 'string' ? body.description.trim() || null : null,
      thumbnailUrl:   typeof body.thumbnailUrl === 'string' && body.thumbnailUrl.trim() ? body.thumbnailUrl.trim() : null,
      category:       typeof body.category === 'string' ? body.category : null,
      speaker:        typeof body.speaker === 'string' ? body.speaker.trim() || null : null,
      speakerDoctorId: typeof body.speakerDoctorId === 'string' && body.speakerDoctorId ? body.speakerDoctorId : null,
      duration:       typeof body.duration === 'string' ? body.duration.trim() || null : null,
      language:       typeof body.language === 'string' ? body.language : 'en',
      tags:           Array.isArray(body.tags) ? (body.tags as unknown[]).filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean) : [],
      published:      body.published !== false,
      featured:       body.featured === true,
      sortOrder:      Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    }
    return reply.code(201).send(await fastify.prisma.healthVideo.create({ data }))
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string') {
      const t = body.title.trim()
      if (!t) return reply.code(400).send({ error: 'title cannot be blank' })
      data.title = t
    }
    if (typeof body.youtubeUrl === 'string') {
      const youtubeId = extractYoutubeId(body.youtubeUrl)
      if (!youtubeId) return reply.code(400).send({ error: 'could not parse a YouTube video id from youtubeUrl' })
      data.youtubeId  = youtubeId
      data.youtubeUrl = canonicalUrl(youtubeId)
    }
    if (typeof body.description === 'string') data.description = body.description.trim() || null
    if (typeof body.thumbnailUrl === 'string') data.thumbnailUrl = body.thumbnailUrl.trim() || null
    if (typeof body.category === 'string') {
      if (body.category && !CATEGORIES.includes(body.category)) return reply.code(400).send({ error: 'invalid category' })
      data.category = body.category || null
    }
    if (typeof body.speaker === 'string') data.speaker = body.speaker.trim() || null
    if (body.speakerDoctorId === null || typeof body.speakerDoctorId === 'string') {
      data.speakerDoctorId = body.speakerDoctorId || null
    }
    if (typeof body.duration === 'string') data.duration = body.duration.trim() || null
    if (typeof body.language === 'string') {
      if (!LANGUAGES.includes(body.language)) return reply.code(400).send({ error: 'invalid language' })
      data.language = body.language
    }
    if (Array.isArray(body.tags)) {
      data.tags = (body.tags as unknown[]).filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
    }
    if (typeof body.published === 'boolean') data.published = body.published
    if (typeof body.featured === 'boolean')  data.featured  = body.featured
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) data.sortOrder = Number(body.sortOrder)

    return fastify.prisma.healthVideo.update({ where: { id }, data })
  })

  // Count plays — public, idempotent in spirit but we don't dedupe here
  // (admin can prune if needed). Rate-limited by the gateway.
  fastify.post('/:id/view', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const row = await fastify.prisma.healthVideo.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      })
      return reply.send(row)
    } catch {
      return reply.code(404).send({ error: 'Video not found' })
    }
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.healthVideo.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export { extractYoutubeId, defaultThumbnail, canonicalUrl }
export default healthVideos
