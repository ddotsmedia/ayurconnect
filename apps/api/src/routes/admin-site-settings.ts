import type { FastifyPluginAsync } from 'fastify'
import { bust } from '../lib/cache.js'
import { validateSetting } from './site-settings.js'

export const autoPrefix = '/admin/site-settings'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // PATCH /admin/site-settings — bulk upsert. Body: { values: { 'social.facebook': '...', ... } }
  fastify.patch('/', async (request, reply) => {
    const body = request.body as { values?: Record<string, string> }
    if (!body || typeof body.values !== 'object') {
      return reply.code(400).send({ error: 'values object required' })
    }

    const errors: Array<{ key: string; reason: string }> = []
    const writes: Array<{ key: string; value: string }> = []
    for (const [key, value] of Object.entries(body.values)) {
      const err = validateSetting(key, value)
      if (err) { errors.push({ key, reason: err }); continue }
      writes.push({ key, value })
    }

    if (writes.length === 0) return reply.code(400).send({ error: 'no valid keys to write', errors })

    await fastify.prisma.$transaction(writes.map((w) =>
      fastify.prisma.siteSetting.upsert({
        where:  { key: w.key },
        create: { key: w.key, value: w.value },
        update: { value: w.value },
      }),
    ))
    void bust(fastify, 'site-settings:*')
    return { written: writes.length, errors }
  })
}

export default route
