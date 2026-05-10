import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect hospital'

async function fetchHospital(id: string) {
  try {
    const res = await fetch(`${API}/hospitals/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as { id: string; name: string; type: string; district: string; classification: string | null; ayushCertified: boolean; nabh: boolean; establishedYear: number | null }
  } catch { return null }
}

export default async function Image({ params }: { params: { id: string } }) {
  const h = await fetchHospital(params.id)
  const certBadge = h?.classification === 'olive-leaf' ? '🌿 Olive Leaf'
                  : h?.classification === 'green-leaf' ? '🌿 Green Leaf'
                  : null
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {certBadge && <span style={{ background: '#d97706', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>{certBadge}</span>}
            {h?.ayushCertified && <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px', borderRadius: 999, fontSize: 18 }}>AYUSH</span>}
            {h?.nabh && <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px', borderRadius: 999, fontSize: 18 }}>NABH</span>}
          </div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
            {h?.name ?? 'AyurConnect Hospital'}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 24, fontSize: 26, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
            {h?.type && <span>{h.type}</span>}
            {h?.type && h?.district && <span>·</span>}
            {h?.district && <span>{h.district}, Kerala</span>}
            {h?.establishedYear && <span>·</span>}
            {h?.establishedYear && <span>est. {h.establishedYear}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com</span>
          <span>Verified Ayurveda hospitals & wellness centres</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
