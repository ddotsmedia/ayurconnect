// Family member sub-profiles. Every endpoint is scoped to the signed-in
// user — they can only CRUD their own family members.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/me/family'

const RELATIONS = ['self', 'spouse', 'parent', 'child', 'sibling', 'other'] as const
const GENDERS   = ['female', 'male', 'other'] as const
const DOSHAS    = ['vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha', 'vata-kapha', 'tridosha'] as const

function clean(v: unknown, max = 200): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

const family: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const members = await fastify.prisma.familyMember.findMany({
      where: { userId },
      orderBy: [{ relation: 'asc' }, { createdAt: 'asc' }],
    })
    return { members }
  })

  fastify.post('/', async (request, reply) => {
    const userId = request.session!.user.id
    const body = request.body as Record<string, unknown>
    const name = clean(body.name, 120)
    if (!name) return reply.code(400).send({ error: 'name required' })
    const relation = typeof body.relation === 'string' && (RELATIONS as readonly string[]).includes(body.relation) ? body.relation : 'other'
    const gender   = typeof body.gender   === 'string' && (GENDERS   as readonly string[]).includes(body.gender)   ? body.gender   : null
    const prakriti = typeof body.prakriti === 'string' && (DOSHAS    as readonly string[]).includes(body.prakriti) ? body.prakriti : null
    const dob      = body.dob ? new Date(String(body.dob)) : null
    const conditions = Array.isArray(body.conditions)
      ? (body.conditions as unknown[]).map((c) => clean(c, 80)).filter((c): c is string => !!c).slice(0, 20)
      : []

    const member = await fastify.prisma.familyMember.create({
      data: {
        userId,
        name,
        relation,
        gender,
        prakriti,
        dob: dob && !isNaN(dob.getTime()) ? dob : null,
        conditions,
        notes: clean(body.notes, 1000),
        avatarColor: clean(body.avatarColor, 16),
      },
    })
    return reply.code(201).send(member)
  })

  fastify.patch('/:id', async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.familyMember.findUnique({ where: { id }, select: { userId: true } })
    if (!existing || existing.userId !== userId) return reply.code(404).send({ error: 'not found' })

    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (body.name !== undefined)     data.name     = clean(body.name, 120) ?? undefined
    if (body.relation !== undefined) data.relation = (RELATIONS as readonly string[]).includes(String(body.relation)) ? body.relation : 'other'
    if (body.gender !== undefined)   data.gender   = (GENDERS as readonly string[]).includes(String(body.gender ?? '')) ? body.gender : null
    if (body.prakriti !== undefined) data.prakriti = (DOSHAS as readonly string[]).includes(String(body.prakriti ?? '')) ? body.prakriti : null
    if (body.dob !== undefined) {
      const dob = body.dob ? new Date(String(body.dob)) : null
      data.dob = dob && !isNaN(dob.getTime()) ? dob : null
    }
    if (body.conditions !== undefined) {
      data.conditions = Array.isArray(body.conditions)
        ? (body.conditions as unknown[]).map((c) => clean(c, 80)).filter((c): c is string => !!c).slice(0, 20)
        : []
    }
    if (body.notes !== undefined)       data.notes       = clean(body.notes, 1000)
    if (body.avatarColor !== undefined) data.avatarColor = clean(body.avatarColor, 16)

    return fastify.prisma.familyMember.update({ where: { id }, data })
  })

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.familyMember.findUnique({ where: { id }, select: { userId: true } })
    if (!existing || existing.userId !== userId) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.familyMember.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default family
