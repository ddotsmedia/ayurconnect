import { ImageResponse } from 'next/og'
import { PRODUCTS } from '../_data/products'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect enterprise product'

export default async function Image({ params }: { params: { slug: string } }) {
  const p = PRODUCTS[params.slug]
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
          <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>Enterprise</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 32 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05 }}>
            {p?.name ?? 'AyurConnect Enterprise'}
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 22, lineHeight: 1.3 }}>
            {p?.tagline ?? 'Built for Ayurvedic hospitals + chains'}
          </div>
          {p?.status && (
            <div style={{ display: 'flex', marginTop: 28 }}>
              <span style={{ background: 'rgba(217,119,6,0.9)', color: 'white', padding: '8px 16px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>
                {p.status === 'concept' ? 'Coming soon — Waitlist open' : p.status.replace(/-/g, ' ')}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com/products</span>
          <span>Ayurveda-Native Enterprise Software</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
