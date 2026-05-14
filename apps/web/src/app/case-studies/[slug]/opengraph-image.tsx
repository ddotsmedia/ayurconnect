import { ImageResponse } from 'next/og'
import { CASE_STUDIES } from '../_data/cases'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect case study'

export default async function Image({ params }: { params: { slug: string } }) {
  const c = CASE_STUDIES.find((x) => x.slug === params.slug)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 72,
          background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 60%, #1d7c2f 100%)',
          color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: 'white' }}>Ayur</span>
            <span style={{ color: '#5fc063' }}>Connect</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>Case Study</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 32 }}>
          {c?.condition && (
            <div style={{ display: 'flex', marginBottom: 18 }}>
              <span style={{ background: 'rgba(217,119,6,0.9)', color: 'white', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>
                {c.condition}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>
            {c?.title ?? 'Clinical Case Study'}
          </div>
          {c && (
            <div style={{ display: 'flex', gap: 14, fontSize: 22, color: 'rgba(255,255,255,0.75)', marginTop: 22 }}>
              <span>{c.patient.age} yr · {c.patient.gender} · {c.patient.country}</span>
              <span>·</span>
              <span>{c.durationMonths} month {c.outcomeLabel}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com/case-studies</span>
          <span>Documented Ayurveda Outcomes</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
