import type { FastifyPluginAsync } from 'fastify'
import { Prisma } from '@prisma/client'

export const autoPrefix = '/events'

// Whitelist of known event names. Unknown names get logged but rejected so
// the table can't be filled with garbage.
const ALLOWED = new Set([
  'page_view',
  'search',
  'doctor_view',
  'hospital_view',
  'herb_view',
  'ayurbot_chat',
  'booking_started',
  'booking_completed',
  'review_submitted',
  'register_clicked',
  'signup_completed',
  'triage_query',
])

const route: FastifyPluginAsync = async (fastify) => {
  // POST /events  — fire-and-forget tracker. Body: { name, props?, path?, sessionId? }
  // Anonymous OK (no auth required); signed-in events get userId attached.
  fastify.post('/', async (request, reply) => {
    const body = request.body as { name?: string; props?: unknown; path?: string; sessionId?: string }
    if (!body.name || !ALLOWED.has(body.name)) return reply.code(204).send()

    // Try to read session (don't block on it)
    let userId: string | null = null
    try {
      const headers = new Headers()
      for (const [k, v] of Object.entries(request.headers)) {
        if (Array.isArray(v)) headers.set(k, v.join(','))
        else if (typeof v === 'string') headers.set(k, v)
      }
      const sess = (await fastify.auth.api.getSession({ headers })) as { user?: { id: string } } | null
      userId = sess?.user?.id ?? null
    } catch { /* anonymous */ }

    // Don't await — fire and forget so we don't slow down the page.
    void fastify.prisma.analyticsEvent.create({
      data: {
        userId,
        sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 60) : null,
        name:      body.name,
        // Prisma 6 needs the JsonNull sentinel for nullable Json columns; plain
        // null no longer satisfies the InputJsonValue union.
        props:     (body.props && typeof body.props === 'object')
          ? (body.props as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        path:      typeof body.path === 'string' ? body.path.slice(0, 200) : null,
      },
    }).catch(() => null) // ignore — analytics shouldn't ever 5xx the user

    return reply.code(204).send()
  })
}

export default route
