// Doctor Hub — Research paper library + bookmarks + private annotations.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, canModerate } from '../lib/dr-access.js'

export const autoPrefix = '/dr/research'

const STUDY_TYPES = ['RCT', 'case-series', 'systematic-review', 'observational', 'in-vitro', 'animal', 'case-report', 'review']

const drResearch: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { condition, dosha, studyType, year, journal, q, page = '1', limit = '20' } = request.query as Record<string, string>
    const pageNum  = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 50)
    const where: Record<string, unknown> = {}
    if (condition) where.conditions = { has: condition }
    if (dosha)     where.doshas     = { has: dosha }
    if (studyType && STUDY_TYPES.includes(studyType)) where.studyType = studyType
    if (year)      where.year       = Number(year)
    if (journal)   where.journal    = { contains: journal, mode: 'insensitive' }
    if (q) where.OR = [
      { title:    { contains: q, mode: 'insensitive' } },
      { abstract: { contains: q, mode: 'insensitive' } },
      { authors:  { has: q } },
    ]
    const [items, total] = await Promise.all([
      fastify.prisma.researchPaper.findMany({
        where, orderBy: { year: 'desc' },
        skip: (pageNum - 1) * limitNum, take: limitNum,
      }),
      fastify.prisma.researchPaper.count({ where }),
    ])
    // Mark which papers the user has bookmarked.
    const userId = request.session!.user.id
    const bookmarks = await fastify.prisma.researchPaperBookmark.findMany({
      where:  { userId, paperId: { in: items.map((p) => p.id) } },
      select: { paperId: true },
    })
    const bSet = new Set(bookmarks.map((b) => b.paperId))
    return {
      papers:      items.map((p) => ({ ...p, bookmarked: bSet.has(p.id) })),
      pagination:  { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  // Facets — top journals + conditions for filter UI.
  fastify.get('/facets', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const [journals, papers] = await Promise.all([
      fastify.prisma.researchPaper.groupBy({ by: ['journal'],   _count: { _all: true }, orderBy: { _count: { journal: 'desc' } }, take: 20 }),
      fastify.prisma.researchPaper.findMany({ select: { conditions: true }, take: 500 }),
    ])
    const conditionTally: Record<string, number> = {}
    for (const p of papers) for (const c of p.conditions) conditionTally[c] = (conditionTally[c] ?? 0) + 1
    return {
      journals:   journals.map((j) => ({ name: j.journal, count: j._count._all })),
      conditions: Object.entries(conditionTally).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([id, count]) => ({ id, count })),
      studyTypes: STUDY_TYPES,
    }
  })

  fastify.get('/bookmarks', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const items = await fastify.prisma.researchPaperBookmark.findMany({
      where:   { userId: request.session!.user.id },
      include: { paper: true },
      orderBy: { createdAt: 'desc' },
      take:    100,
    })
    return { bookmarks: items }
  })

  fastify.get('/:id', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const p = await fastify.prisma.researchPaper.findUnique({ where: { id } })
    if (!p) return reply.code(404).send({ error: 'not found' })
    const userId = request.session!.user.id
    const [bookmark, annotation] = await Promise.all([
      fastify.prisma.researchPaperBookmark.findUnique({ where: { userId_paperId: { userId, paperId: id } } }),
      fastify.prisma.researchPaperAnnotation.findFirst({ where: { userId, paperId: id }, orderBy: { updatedAt: 'desc' } }),
    ])
    return { ...p, bookmarked: !!bookmark, annotation: annotation?.body ?? null }
  })

  // Toggle bookmark
  fastify.post('/:id/bookmark', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const userId = request.session!.user.id
    const existing = await fastify.prisma.researchPaperBookmark.findUnique({ where: { userId_paperId: { userId, paperId: id } } })
    if (existing) {
      await fastify.prisma.researchPaperBookmark.delete({ where: { id: existing.id } })
      return { bookmarked: false }
    }
    await fastify.prisma.researchPaperBookmark.create({ data: { userId, paperId: id } })
    return { bookmarked: true }
  })

  // Save / replace per-user annotation
  fastify.put('/:id/annotation', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const { body } = request.body as { body?: string }
    if (!body?.trim()) return reply.code(400).send({ error: 'body required' })
    const userId = request.session!.user.id
    const existing = await fastify.prisma.researchPaperAnnotation.findFirst({ where: { userId, paperId: id } })
    if (existing) {
      return fastify.prisma.researchPaperAnnotation.update({ where: { id: existing.id }, data: { body: body.trim().slice(0, 6000) } })
    }
    return fastify.prisma.researchPaperAnnotation.create({ data: { userId, paperId: id, body: body.trim().slice(0, 6000) } })
  })

  // Admin can add new papers (manual curation; v2 = PubMed sync)
  fastify.post('/', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const body = request.body as Record<string, unknown>
    if (typeof body.title !== 'string' || typeof body.journal !== 'string' || typeof body.year !== 'number' || typeof body.abstract !== 'string') {
      return reply.code(400).send({ error: 'title, journal, year, abstract required' })
    }
    return fastify.prisma.researchPaper.create({
      data: {
        title:      body.title.slice(0, 500),
        authors:    Array.isArray(body.authors) ? (body.authors as unknown[]).map(String) : [],
        journal:    body.journal,
        year:       body.year,
        doi:        typeof body.doi === 'string' ? body.doi : null,
        pubmedId:   typeof body.pubmedId === 'string' ? body.pubmedId : null,
        abstract:   body.abstract.slice(0, 10000),
        conditions: Array.isArray(body.conditions) ? (body.conditions as unknown[]).map(String) : [],
        doshas:     Array.isArray(body.doshas)     ? (body.doshas as unknown[]).map(String)     : [],
        studyType:  typeof body.studyType === 'string' ? body.studyType : null,
        sampleSize: typeof body.sampleSize === 'number' ? body.sampleSize : null,
        url:        typeof body.url    === 'string' ? body.url    : null,
        pdfUrl:     typeof body.pdfUrl === 'string' ? body.pdfUrl : null,
      },
    })
  })
}

export default drResearch
