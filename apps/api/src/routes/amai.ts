// Ayurveda Medical Association of India — single editable microsite at /amai.
//
// GET  /amai  — public; returns the page + its child lists (always returns a
//               shape, even before the row is seeded, so the admin form can
//               render a blank state).
// PUT  /amai  — admin; full transactional replace. The body carries the whole
//               page (scalars + every child list); we upsert the AmaiPage row
//               then delete-and-recreate the children. sortOrder is derived
//               from array index, so the admin UI just reorders arrays.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/amai'

const SLUG = 'amai'

const SCALAR_FIELDS = [
  'orgName', 'shortName', 'tagline', 'mission', 'aboutText', 'foundedInfo',
  'strategicNote', 'membershipInfo', 'contactAddress', 'contactPhone',
  'contactEmail', 'websiteUrl', 'registrationInfo', 'copyrightText',
] as const
const NULLABLE_URL_FIELDS = ['heroImageUrl', 'logoUrl'] as const
const LIST_SECTIONS = ['vision', 'core_value', 'strategic_issue', 'activity', 'committee']
const BEARER_CATEGORIES = ['executive', 'secretary', 'women', 'apta', 'other']
const LINK_CATEGORIES = ['social', 'other']
const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'telegram']

function str(v: unknown, max = 5000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

const amai: FastifyPluginAsync = async (fastify) => {
  // ── Public read ────────────────────────────────────────────────────────
  fastify.get('/', async () => {
    const page = await fastify.prisma.amaiPage.findUnique({
      where: { slug: SLUG },
      include: {
        officeBearers: { orderBy: { sortOrder: 'asc' } },
        milestones:    { orderBy: { sortOrder: 'asc' } },
        listItems:     { orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }] },
        links:         { orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] },
      },
    })
    if (!page) {
      // Not seeded yet — return an empty shell so the admin form still works.
      return {
        page: null,
        officeBearers: [],
        milestones: [],
        listItems: [],
        links: [],
      }
    }
    const { officeBearers, milestones, listItems, links, ...scalars } = page
    return { page: scalars, officeBearers, milestones, listItems, links }
  })

  // ── Admin full-replace ─────────────────────────────────────────────────
  fastify.put('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const pageInput = (body.page ?? {}) as Record<string, unknown>

    const scalarData: Record<string, unknown> = {}
    for (const f of SCALAR_FIELDS) {
      if (pageInput[f] !== undefined) scalarData[f] = str(pageInput[f])
    }
    for (const f of NULLABLE_URL_FIELDS) {
      if (pageInput[f] !== undefined) {
        const v = str(pageInput[f], 1000)
        scalarData[f] = v || null
      }
    }
    if (typeof pageInput.published === 'boolean') scalarData.published = pageInput.published

    const bearersIn   = Array.isArray(body.officeBearers) ? body.officeBearers : []
    const milestonesIn = Array.isArray(body.milestones)    ? body.milestones    : []
    const listItemsIn  = Array.isArray(body.listItems)     ? body.listItems     : []

    const bearers = bearersIn
      .map((b, i) => {
        const row = b as Record<string, unknown>
        const name = str(row.name, 200)
        const position = str(row.position, 200)
        if (!name || !position) return null
        const category = BEARER_CATEGORIES.includes(String(row.category)) ? String(row.category) : 'other'
        const photoUrl = str(row.photoUrl, 1000) || null
        return { name, position, category, photoUrl, sortOrder: i }
      })
      .filter((b): b is NonNullable<typeof b> => b !== null)

    const milestones = milestonesIn
      .map((m, i) => {
        const row = m as Record<string, unknown>
        const year = str(row.year, 50)
        const description = str(row.description, 1000)
        if (!year || !description) return null
        return { year, description, sortOrder: i }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)

    // listItems keep their incoming order, but sortOrder is scoped per-section.
    const sectionCounters: Record<string, number> = {}
    const listItems = listItemsIn
      .map((l) => {
        const row = l as Record<string, unknown>
        const section = String(row.section)
        const text = str(row.text, 2000)
        if (!LIST_SECTIONS.includes(section) || !text) return null
        const sortOrder = sectionCounters[section] ?? 0
        sectionCounters[section] = sortOrder + 1
        return { section, text, sortOrder }
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)

    // links — social handles + other links; sortOrder scoped per-category.
    const linksIn = Array.isArray(body.links) ? body.links : []
    const linkCounters: Record<string, number> = {}
    const links = linksIn
      .map((l) => {
        const row = l as Record<string, unknown>
        const category = LINK_CATEGORIES.includes(String(row.category)) ? String(row.category) : 'other'
        const url = str(row.url, 1000)
        if (!url) return null
        // social: label is the platform key (validated); other: free-text label.
        let label = str(row.label, 200)
        if (category === 'social') {
          label = label.toLowerCase()
          if (!SOCIAL_PLATFORMS.includes(label)) return null
        } else if (!label) {
          return null
        }
        const sortOrder = linkCounters[category] ?? 0
        linkCounters[category] = sortOrder + 1
        return { category, label, url, sortOrder }
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)

    const saved = await fastify.prisma.$transaction(async (tx) => {
      const page = await tx.amaiPage.upsert({
        where:  { slug: SLUG },
        update: scalarData,
        create: { slug: SLUG, ...scalarData },
      })
      await tx.amaiOfficeBearer.deleteMany({ where: { pageId: page.id } })
      await tx.amaiMilestone.deleteMany({ where: { pageId: page.id } })
      await tx.amaiListItem.deleteMany({ where: { pageId: page.id } })
      await tx.amaiLink.deleteMany({ where: { pageId: page.id } })
      if (bearers.length)
        await tx.amaiOfficeBearer.createMany({ data: bearers.map((b) => ({ ...b, pageId: page.id })) })
      if (milestones.length)
        await tx.amaiMilestone.createMany({ data: milestones.map((m) => ({ ...m, pageId: page.id })) })
      if (listItems.length)
        await tx.amaiListItem.createMany({ data: listItems.map((l) => ({ ...l, pageId: page.id })) })
      if (links.length)
        await tx.amaiLink.createMany({ data: links.map((l) => ({ ...l, pageId: page.id })) })
      return page
    })

    return reply.send({ ok: true, id: saved.id })
  })
}

export default amai
