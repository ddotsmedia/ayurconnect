import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const autoPrefix = '/admin/events'

// Admin CRUD for EventListing. Distinct file from the analytics /events
// tracker at routes/events.ts.
//
//   POST   /admin/events                → create
//   PATCH  /admin/events/:id            → update
//   DELETE /admin/events/:id            → delete
//   POST   /admin/events/upload-image   → multipart image → 1200x630 WebP → MinIO
//   PATCH  /admin/events/bulk           → { ids[], isPublished }

const ALLOWED_MIME    = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_CATEGORY = new Set(['seminar', 'workshop', 'job-fair', 'consultation', 'other'])
const IMG_BUCKET      = 'ayurconnect-tourism' // reused public bucket, served by /uploads/:bucket/*

function sniffImageMime(buf: Buffer): string | null {
  if (buf.length < 4) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'
  return null
}

function normalize(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  const strFields: Array<[string, number]> = [
    ['title',            300],
    ['description',    10000],
    ['imageUrl',         500],
    ['imageAlt',         300],
    ['location',         300],
    ['organizer',        300],
    ['registrationLink', 500],
  ]
  for (const [k, cap] of strFields) {
    if (typeof body[k] === 'string') data[k] = (body[k] as string).trim().slice(0, cap) || null
    else if (body[k] === null) data[k] = null
  }
  if (typeof body.category === 'string' && ALLOWED_CATEGORY.has(body.category)) data.category = body.category
  if (typeof body.eventDate    === 'string') data.eventDate    = new Date(body.eventDate)
  if (typeof body.eventEndDate === 'string') data.eventEndDate = body.eventEndDate ? new Date(body.eventEndDate) : null
  else if (body.eventEndDate === null) data.eventEndDate = null
  if (typeof body.isPublished  === 'boolean') data.isPublished = body.isPublished
  return data
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // ─── Multipart image upload → 1200x630 WebP → MinIO ────────────────────
  fastify.post('/upload-image', async (request, reply) => {
    const part = await request.file()
    if (!part) return reply.code(400).send({ error: 'image file required (multipart field "file")' })
    if (!ALLOWED_MIME.has(part.mimetype)) return reply.code(400).send({ error: `unsupported mime: ${part.mimetype}` })
    const buf = await part.toBuffer()
    if (buf.byteLength === 0) return reply.code(400).send({ error: 'empty file' })
    const sniffed = sniffImageMime(buf)
    if (!sniffed) return reply.code(400).send({ error: 'file bytes do not match an image' })

    const id = randomUUID()
    let hero: Buffer, thumb: Buffer
    try {
      const pipeline = sharp(buf, { failOn: 'truncated' }).rotate()
      hero  = await pipeline.clone().resize({ width: 1200, height: 630, fit: 'cover', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
      thumb = await pipeline.clone().resize({ width:  400, height: 210, fit: 'cover', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    } catch (err) {
      fastify.log.warn({ err }, 'events upload sharp failed')
      return reply.code(400).send({ error: 'image could not be processed' })
    }
    const base = `events/${id}`
    try {
      await fastify.s3.putObject(IMG_BUCKET, `${base}-1200.webp`, hero,  hero.byteLength,  { 'Content-Type': 'image/webp' })
      await fastify.s3.putObject(IMG_BUCKET, `${base}-400.webp`,  thumb, thumb.byteLength, { 'Content-Type': 'image/webp' })
    } catch (err) {
      fastify.log.error({ err }, 'minio upload failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }
    return {
      url:   `/api/uploads/${IMG_BUCKET}/${base}-1200.webp`,
      thumb: `/api/uploads/${IMG_BUCKET}/${base}-400.webp`,
    }
  })

  // ─── CRUD ──────────────────────────────────────────────────────────────
  fastify.get('/', async (request) => {
    const q = request.query as { status?: string; category?: string; limit?: string }
    const where: Record<string, unknown> = {}
    if (q.status === 'draft')     where.isPublished = false
    if (q.status === 'published') where.isPublished = true
    if (q.category && ALLOWED_CATEGORY.has(q.category)) where.category = q.category
    return fastify.prisma.eventListing.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      take:    Math.min(Number(q.limit) || 200, 500),
    })
  })

  fastify.post('/', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>
    const data = normalize(body)
    if (!data.title || !data.description || !data.imageUrl || !data.eventDate) {
      return reply.code(400).send({ error: 'title, description, imageUrl, eventDate required' })
    }
    return reply.code(201).send(await fastify.prisma.eventListing.create({
      data: { ...data, createdBy: request.session!.user.id } as never,
    }))
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = normalize((request.body ?? {}) as Record<string, unknown>)
    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no edits' })
    return fastify.prisma.eventListing.update({ where: { id }, data })
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.eventListing.delete({ where: { id } })
    return { ok: true }
  })

  // Bulk publish/unpublish.
  fastify.patch('/bulk', async (request, reply) => {
    const b = (request.body ?? {}) as { ids?: unknown; isPublished?: unknown }
    const ids = Array.isArray(b.ids) ? b.ids.filter((v): v is string => typeof v === 'string').slice(0, 200) : []
    if (!ids.length)                          return reply.code(400).send({ error: 'ids[] required' })
    if (typeof b.isPublished !== 'boolean')   return reply.code(400).send({ error: 'isPublished:boolean required' })
    const r = await fastify.prisma.eventListing.updateMany({ where: { id: { in: ids } }, data: { isPublished: b.isPublished } })
    return { updated: r.count }
  })
}

export default route
