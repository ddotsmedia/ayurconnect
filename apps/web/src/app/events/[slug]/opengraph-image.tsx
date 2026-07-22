import { ImageResponse } from 'next/og'
import { getEvent } from '../../../lib/data/events-seed'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime     = 'nodejs'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt         = 'AyurConnect event'
// force-dynamic (2026-07-22) so build doesn't fetch API per event slug.
export const dynamic     = 'force-dynamic'

// Per-event branded OG card. Two data sources: seed events (via getEvent
// lookup) and DB events (via /event-listings/:id). DB events have their
// own uploaded imageUrl — we use it as background when present, mirroring
// the article layout-A behaviour.

type DbEvent = {
  id: string; title: string; imageUrl: string; imageAlt: string | null
  eventDate: string; location: string | null; category: string
}

async function fetchDbEvent(id: string): Promise<DbEvent | null> {
  try {
    const r = await fetch(`${API}/event-listings/${id}`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as DbEvent
  } catch { return null }
}

function absoluteUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://ayurconnect.com'
  return `${origin}${url}`
}

export default async function Image({ params }: { params: { slug: string } }) {
  const seed = getEvent(params.slug)
  const db   = seed ? null : await fetchDbEvent(params.slug)
  const title    = seed?.title ?? db?.title ?? 'AyurConnect Event'
  const category = seed?.category ?? db?.category ?? null
  const location = seed ? (seed.online ? 'Online' : `${seed.city}, ${seed.country}`) : (db?.location ?? null)
  const dateISO  = seed?.startDate ?? db?.eventDate ?? null
  const dateStr  = dateISO ? new Date(dateISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const imgHref  = db?.imageUrl ? absoluteUrl(db.imageUrl) : null

  return new ImageResponse(
    imgHref ? (
      // ─── Layout A · DB events with uploaded imageUrl ────────────────
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgHref} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(13,61,26,0.92) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 60, color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white' }} />
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>
              <span>Ayur</span><span style={{ color: '#5fc063' }}>Connect</span>
            </div>
            {category && <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>{category}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1080 }}>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{title}</div>
            <div style={{ display: 'flex', gap: 22, marginTop: 20, fontSize: 22, color: 'rgba(255,255,255,0.9)' }}>
              {dateStr && <span>📅 {dateStr}</span>}
              {location && <span>· 📍 {location}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>
            <span>ayurconnect.com/events</span><span>Ayurveda Events</span>
          </div>
        </div>
      </div>
    ) : (
      // ─── Layout B · gradient fallback for seed events ────────────────
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 72,
        background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 55%, #d97706 100%)',
        color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <span>Ayur</span><span style={{ color: '#5fc063' }}>Connect</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>Events</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 32 }}>
          {category && (
            <div style={{ display: 'flex', marginBottom: 18 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>{category}</span>
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>{title}</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 22, fontSize: 22, color: 'rgba(255,255,255,0.85)' }}>
            {dateStr && <span>📅 {dateStr}</span>}
            {location && <span>· 📍 {location}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>
          <span>ayurconnect.com/events</span><span>Ayurveda Events</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
