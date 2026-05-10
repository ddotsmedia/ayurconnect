import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect doctor profile'

const DARK = '#155228'
const LIGHT = '#3da041'

async function fetchDoctor(id: string) {
  try {
    const res = await fetch(`${API}/doctors/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as { id: string; name: string; specialization: string; district: string; qualification: string | null; experienceYears: number | null; ccimVerified: boolean }
  } catch { return null }
}

function initials(name: string): string {
  return name.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')
}

export default async function Image({ params }: { params: { id: string } }) {
  const d = await fetchDoctor(params.id)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 50%, #1d7c2f 100%)',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white', display: 'flex' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: 'white' }}>Ayur</span>
            <span style={{ color: '#5fc063' }}>Connect</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 40, marginTop: 32 }}>
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
            border: '6px solid rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72, fontWeight: 700, color: 'white',
          }}>
            {d ? initials(d.name) : '?'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05 }}>
              {d?.name ?? 'AyurConnect Doctor'}
            </div>
            {d?.qualification && (
              <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>{d.qualification}</div>
            )}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, fontSize: 22, color: 'rgba(255,255,255,0.85)' }}>
              {d?.specialization && <span>{d.specialization}</span>}
              {d?.specialization && d?.district && <span>·</span>}
              {d?.district && <span>{d.district}, Kerala</span>}
            </div>
            {d?.ccimVerified && (
              <div style={{ display: 'flex', marginTop: 24 }}>
                <span style={{ background: '#d97706', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>
                  ✓ CCIM Verified
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com</span>
          <span>{d?.experienceYears ? `${d.experienceYears}+ years` : "Kerala's #1 Ayurveda Platform"}</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
