import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect herb'

async function fetchHerb(id: string) {
  try {
    const res = await fetch(`${API}/herbs/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as { id: string; name: string; sanskrit: string | null; english: string | null; malayalam: string | null; rasa: string | null; virya: string | null }
  } catch { return null }
}

export default async function Image({ params }: { params: { id: string } }) {
  const h = await fetchHerb(params.id)
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 64,
        background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 50%, #1d7c2f 100%)',
        color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white', display: 'flex' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: 'white' }}>Ayur</span>
            <span style={{ color: '#5fc063' }}>Connect</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: 22, color: '#5fc063', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>
            Ayurvedic Herb
          </div>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
            {h?.name ?? 'Herb'}
          </div>
          {h?.sanskrit && (
            <div style={{ display: 'flex', fontSize: 36, color: 'rgba(255,255,255,0.75)', marginTop: 16, fontStyle: 'italic' }}>
              {h.sanskrit}
            </div>
          )}
          <div style={{ display: 'flex', gap: 24, marginTop: 32, fontSize: 22, color: 'rgba(255,255,255,0.85)' }}>
            {h?.rasa && <span><strong>Rasa:</strong> {h.rasa}</span>}
            {h?.virya && <span>·</span>}
            {h?.virya && <span><strong>Virya:</strong> {h.virya}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com/herbs</span>
          <span>Classical Rasa · Guna · Virya · Vipaka</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
