import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const autoPrefix = '/articles'

const ALLOWED_IMG_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const IMG_BUCKET = 'ayurconnect-tourism' // reused: PUBLIC bucket already served by /uploads/:bucket/*

// ─── Metadata field extraction ────────────────────────────────────────────
// featuredImage/seoTitle/seoDescription/readTimeMinutes exist on the model
// from the 2026-06-10 enhanced-article migration. featuredImageAlt +
// seoKeywords added 2026-07-18.
function pickMetaFields(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const strFields: Array<[string, number]> = [
    ['featuredImage',    500],
    ['featuredImageAlt', 200],
    ['seoTitle',         200],
    ['seoDescription',   160],
    ['seoKeywords',     2000],
  ]
  for (const [k, cap] of strFields) {
    if (typeof body[k] === 'string') {
      const v = (body[k] as string).trim()
      out[k] = v ? v.slice(0, cap) : null
    } else if (body[k] === null) {
      out[k] = null
    }
  }
  if (typeof body.readTimeMinutes === 'number' && Number.isFinite(body.readTimeMinutes)) {
    out.readTimeMinutes = Math.max(0, Math.min(120, Math.round(body.readTimeMinutes as number)))
  }
  return out
}

// Tokenize a text for keyword-overlap scoring. Drops stopwords + tokens <4 chars.
const STOPWORDS = new Set(['the','and','for','with','from','this','that','have','been','they','their','which','about','into','your','more','also','than','ayurveda','ayurvedic'])
function keywords(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 4 || STOPWORDS.has(raw) || seen.has(raw)) continue
    seen.add(raw); out.push(raw)
    if (out.length >= 25) break
  }
  return out
}

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

const articles: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20', category, language, search } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (language) where.language = language
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      fastify.prisma.knowledgeArticle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.knowledgeArticle.count({ where }),
    ])
    return { articles: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const article = await fastify.prisma.knowledgeArticle.findUnique({ where: { id } })
    if (!article) return reply.code(404).send({ error: 'Article not found' })
    return article
  })

  // 200 KB content cap. The /articles/[id] page renders this as Markdown +
  // HTML; combined with the site-wide CSP this caps the blast radius of an
  // admin-XSS (which would still need to bypass CSP to be exploitable).
  const MAX_CONTENT_LEN = 200_000
  const MAX_TITLE_LEN   =     200
  const MAX_SOURCE_LEN  =     500
  const MAX_CATEGORY_LEN =     80

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.title || !body.content || !body.category) {
      return reply.code(400).send({ error: 'title, content, category required' })
    }
    if (body.content.length > MAX_CONTENT_LEN) {
      return reply.code(400).send({ error: `content too long (max ${MAX_CONTENT_LEN} chars)` })
    }
    const metaFields = pickMetaFields(body)
    const article = await fastify.prisma.knowledgeArticle.create({
      data: {
        title:    body.title.slice(0,    MAX_TITLE_LEN),
        content:  body.content,
        category: body.category.slice(0, MAX_CATEGORY_LEN),
        source:   typeof body.source === 'string' ? body.source.slice(0, MAX_SOURCE_LEN) : undefined,
        language: (body.language || 'en').slice(0, 4),
        ...metaFields,
      },
    })
    return reply.code(201).send(article)
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    if (typeof body.content === 'string' && body.content.length > MAX_CONTENT_LEN) {
      return reply.code(400).send({ error: `content too long (max ${MAX_CONTENT_LEN} chars)` })
    }
    const data: Record<string, unknown> = {}
    const caps: Record<string, number> = { title: MAX_TITLE_LEN, category: MAX_CATEGORY_LEN, source: MAX_SOURCE_LEN, language: 4 }
    for (const k of ['title', 'content', 'category', 'source', 'language'] as const) {
      if (typeof body[k] === 'string') data[k] = k === 'content' ? body[k] : body[k].slice(0, caps[k])
    }
    Object.assign(data, pickMetaFields(body))
    return fastify.prisma.knowledgeArticle.update({ where: { id }, data })
  })

  // ─── Image upload for article editor ──────────────────────────────────
  // Multipart POST; sharp resizes to 3 sizes (1200/800/400) + WebP; stores in
  // MinIO public bucket; returns { url, srcset, altPlaceholder } for the
  // markdown editor to insert as ![alt](url).
  fastify.post('/upload-image', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const part = await request.file()
    if (!part) return reply.code(400).send({ error: 'no file uploaded' })
    if (!ALLOWED_IMG_MIME.has(part.mimetype)) {
      return reply.code(400).send({ error: `unsupported mime: ${part.mimetype}` })
    }
    const buf = await part.toBuffer()
    if (buf.byteLength === 0) return reply.code(400).send({ error: 'empty file' })

    const sniffed = sniffImageMime(buf)
    if (!sniffed) return reply.code(400).send({ error: 'file bytes do not match an image' })

    const id = randomUUID()
    let large: Buffer, medium: Buffer, thumb: Buffer
    try {
      const pipeline = sharp(buf, { failOn: 'truncated' }).rotate()
      large  = await pipeline.clone().resize({ width: 1200, height: 600, fit: 'cover', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
      medium = await pipeline.clone().resize({ width:  800, height: 400, fit: 'cover', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
      thumb  = await pipeline.clone().resize({ width:  400, height: 300, fit: 'cover', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    } catch (err) {
      fastify.log.warn({ err }, 'sharp resize failed')
      return reply.code(400).send({ error: 'image could not be processed' })
    }

    const base = `articles/${id}`
    try {
      await fastify.s3.putObject(IMG_BUCKET, `${base}-1200.webp`, large,  large.byteLength,  { 'Content-Type': 'image/webp' })
      await fastify.s3.putObject(IMG_BUCKET, `${base}-800.webp`,  medium, medium.byteLength, { 'Content-Type': 'image/webp' })
      await fastify.s3.putObject(IMG_BUCKET, `${base}-400.webp`,  thumb,  thumb.byteLength,  { 'Content-Type': 'image/webp' })
    } catch (err) {
      fastify.log.error({ err }, 'minio upload failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }

    const url    = `/api/uploads/${IMG_BUCKET}/${base}-1200.webp`
    const srcset = [`${url} 1200w`, `/api/uploads/${IMG_BUCKET}/${base}-800.webp 800w`, `/api/uploads/${IMG_BUCKET}/${base}-400.webp 400w`].join(', ')
    const filenameHint = (part.filename ?? '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 120)
    return { url, srcset, thumb: `/api/uploads/${IMG_BUCKET}/${base}-400.webp`, altPlaceholder: filenameHint || 'Ayurveda article image' }
  })

  // ─── Related-articles scoring ─────────────────────────────────────────
  // Score = (category match * 3) + (title-keyword overlap * 1) + (same source * 0.5)
  // Note: KnowledgeArticle has no `tags` or `authorId` columns yet, so we use
  // category (proxy for tags) + shared meaningful words in title + shared source.
  fastify.get('/:id/related', async (request, reply) => {
    const { id } = request.params as { id: string }
    const current = await fastify.prisma.knowledgeArticle.findUnique({ where: { id } })
    if (!current) return reply.code(404).send({ error: 'article not found' })

    const pool = await fastify.prisma.knowledgeArticle.findMany({
      where: { id: { not: id }, language: current.language },
      orderBy: { createdAt: 'desc' },
      take: 60,
    })
    const currentWords = keywords(`${current.title} ${current.seoKeywords ?? ''}`)
    const scored = pool.map((a) => {
      const other = keywords(`${a.title} ${a.seoKeywords ?? ''}`)
      const overlap = currentWords.filter((w) => other.includes(w)).length
      const score = (a.category === current.category ? 3 : 0) + overlap + (a.source && a.source === current.source ? 0.5 : 0)
      return { a, score }
    })
    const top = scored.filter((s) => s.score > 0).sort((x, y) => y.score - x.score).slice(0, 4).map((s) => s.a)
    return { articles: top }
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.knowledgeArticle.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/categories', async () => [
    { id: 'classical-text', name: 'Classical Texts', description: 'Charaka Samhita, Ashtanga Hridayam, Sushruta Samhita' },
    { id: 'research', name: 'Research', description: 'PubMed papers and modern Ayurveda studies' },
    { id: 'seasonal-health', name: 'Seasonal Health', description: 'Ritucharya — seasonal regimens' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Dinacharya, diet, yoga' },
  ])
}

export default articles
