// In-process notification bus for SSE delivery.
//
// One Map<userId, Set<reply>> tracks open SSE streams per user. When a
// notification is created, we write it to the DB and fan it out to every
// open stream for that user (usually 1 — but multi-tab is fine).
//
// This is single-process. If we ever scale to multiple API instances we'll
// need a Redis pub/sub bridge — for now PM2 runs a single Fastify process.

import type { FastifyInstance, FastifyReply } from 'fastify'

const subscribers = new Map<string, Set<FastifyReply>>()

export function subscribe(userId: string, reply: FastifyReply): () => void {
  let set = subscribers.get(userId)
  if (!set) { set = new Set(); subscribers.set(userId, set) }
  set.add(reply)
  return () => {
    const s = subscribers.get(userId)
    if (!s) return
    s.delete(reply)
    if (s.size === 0) subscribers.delete(userId)
  }
}

function emitToUser(userId: string, event: string, data: unknown): void {
  const set = subscribers.get(userId)
  if (!set || set.size === 0) return
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const reply of set) {
    try { reply.raw.write(payload) }
    catch { /* socket closed; cleanup happens on its own via the close handler */ }
  }
}

// Send a heartbeat to all open streams every 25s so proxies don't kill them.
let heartbeatTimer: NodeJS.Timeout | null = null
export function startHeartbeat(): void {
  if (heartbeatTimer) return
  heartbeatTimer = setInterval(() => {
    for (const [, set] of subscribers) {
      for (const reply of set) {
        try { reply.raw.write(`: heartbeat ${Date.now()}\n\n`) } catch { /* noop */ }
      }
    }
  }, 25_000)
  if (typeof heartbeatTimer.unref === 'function') heartbeatTimer.unref()
}

// ─── Public API ─────────────────────────────────────────────────────────
export type NotificationType =
  | 'appointment-booked'
  | 'appointment-confirmed'
  | 'appointment-cancelled'
  | 'appointment-declined'
  | 'appointment-rescheduled'
  | 'appointment-reminder-24h'
  | 'appointment-reminder-1h'
  | 'appointment-review-prompt'
  | 'review-received'
  | 'doctor-verified'
  | 'doctor-declined'
  | 'doctor-needs-info'
  | 'hospital-verified'
  | 'hospital-declined'
  | 'hospital-needs-info'
  | 'forum-reply'
  | 'journal-weekly-summary'
  | 'prescription-issued'
  | 'doctor-referral'
  | 'doctor-referral-response'
  | 'system'

export type CreateNotifyInput = {
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  link?: string | null
}

// Persist + fan out. Always returns a result; logs but does not throw on errors.
export async function createNotification(fastify: FastifyInstance, input: CreateNotifyInput): Promise<void> {
  try {
    const row = await fastify.prisma.notification.create({
      data: {
        userId: input.userId,
        type:   input.type,
        title:  input.title,
        body:   input.body ?? null,
        link:   input.link ?? null,
      },
    })
    emitToUser(input.userId, 'notification', row)
  } catch (err) {
    fastify.log.warn({ err, input }, 'createNotification failed')
  }
}
