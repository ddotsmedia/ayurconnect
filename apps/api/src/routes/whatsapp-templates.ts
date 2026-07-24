// Public read endpoint for WhatsApp message templates. Consumed by the
// shared <WhatsAppMessagePicker> component on doctor + hospital pages.
// No auth — templates are non-sensitive UX copy.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/whatsapp-templates'

const ALLOWED_CONTEXTS = new Set(['doctor', 'hospital'])

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const { context } = request.query as { context?: string }
    if (!context || !ALLOWED_CONTEXTS.has(context)) {
      return reply.code(400).send({ error: 'context must be "doctor" or "hospital"' })
    }
    const items = await fastify.prisma.whatsAppMessageTemplate.findMany({
      where: { context },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, text: true, sortOrder: true },
    })
    return { items }
  })
}

export default route
