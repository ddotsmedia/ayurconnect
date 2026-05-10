// Daily.co video-room helper. Free plan: 10,000 minutes/month, P2P + SFU.
// Get an API key at https://dashboard.daily.co/developers
//
// We create rooms on-demand when an appointment with type=consultation-video
// is booked. The room URL is stored on the appointment so both parties can
// open it from their dashboards. No-op (logs only) until DAILY_API_KEY is set.

const KEY    = process.env.DAILY_API_KEY ?? ''
const DOMAIN = process.env.DAILY_DOMAIN ?? '' // e.g. 'ayurconnect' → ayurconnect.daily.co

export const videoEnabled = (): boolean => Boolean(KEY)

type DailyRoom = {
  id?: string
  name: string
  url: string
  privacy?: 'public' | 'private'
  config?: { exp?: number; nbf?: number; max_participants?: number; enable_chat?: boolean }
}

export type CreateRoomOpts = {
  /** Required: human-readable room name. Will be slugified. */
  name: string
  /** Time the room becomes valid (UNIX seconds). Default: now. */
  validFrom?: number
  /** Time the room expires (UNIX seconds). Default: 24h after validFrom. */
  validUntil?: number
  /** Max simultaneous participants. Default 4 (patient + doctor + 2 guests). */
  maxParticipants?: number
}

export async function createVideoRoom(opts: CreateRoomOpts): Promise<{ ok: true; url: string; name: string } | { ok: false; reason: string }> {
  if (!videoEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[video] would have created Daily room:', opts.name, '(DAILY_API_KEY not set)')
    return { ok: false, reason: 'video not configured' }
  }
  const slug = opts.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '-' + Math.random().toString(36).slice(2, 8)
  const validFrom  = opts.validFrom  ?? Math.floor(Date.now() / 1000)
  const validUntil = opts.validUntil ?? validFrom + 24 * 60 * 60

  try {
    const res = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        name: slug,
        privacy: 'public',
        properties: {
          nbf: validFrom,
          exp: validUntil,
          max_participants: opts.maxParticipants ?? 4,
          enable_chat: true,
          enable_screenshare: true,
        },
      }),
    })
    const json = await res.json() as DailyRoom & { error?: string; info?: string }
    if (!res.ok) return { ok: false, reason: json.error ?? json.info ?? `HTTP ${res.status}` }
    const url = json.url ?? (DOMAIN ? `https://${DOMAIN}.daily.co/${slug}` : '')
    if (!url) return { ok: false, reason: 'Daily returned no URL' }
    return { ok: true, url, name: slug }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) }
  }
}
