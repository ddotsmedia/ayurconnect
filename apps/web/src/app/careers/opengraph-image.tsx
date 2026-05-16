import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Careers at AyurConnect — Build Kerala\'s Ayurveda future'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 50%, #1d7c2f 100%)',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 80 }}>
          <div style={{ width: 8, height: 32, background: '#fbbf24', borderRadius: 4 }} />
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, textTransform: 'uppercase' }}>
            AyurConnect · Careers
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, lineHeight: 1.05, maxWidth: 1040, marginBottom: 30 }}>
          Build Kerala&apos;s Ayurveda future with us
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.85)', maxWidth: 980 }}>
          Engineering · Clinical · Content · Growth. Remote-friendly. Real clinical impact.
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
          <span>careers@ayurconnect.com</span>
          <span style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: 'white' }}>
            <span>Ayur</span>
            <span style={{ color: '#5fc063' }}>Connect</span>
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
