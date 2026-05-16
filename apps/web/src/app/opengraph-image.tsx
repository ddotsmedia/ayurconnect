import { ImageResponse } from 'next/og'

// Node runtime (PM2-friendly). 'edge' would also work on Vercel.
export const runtime = 'nodejs'
export const alt = "AyurConnect — Kerala's #1 Ayurveda Platform"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const DARK = '#155228'
const LIGHT = '#3da041'

// Tree mark recreated as inline SVG for the OG image. ImageResponse uses
// Satori under the hood — no external assets required.
function TreeSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 30 L100 145
           M100 50 L82 35  M100 50 L118 35
           M100 70 L70 55  M100 70 L130 55
           M100 95 L60 78  M100 95 L140 78
           M100 120 L70 108  M100 120 L130 108"
        stroke={DARK}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {[
        { x: 78, y: 42, r: -28 }, { x: 122, y: 42, r: 28 },
        { x: 90, y: 50, r: -10 }, { x: 110, y: 50, r: 10 },
        { x: 66, y: 60, r: -32 }, { x: 134, y: 60, r: 32 },
        { x: 80, y: 65, r: -18 }, { x: 120, y: 65, r: 18 },
        { x: 100, y: 65, r: 0 },
        { x: 56, y: 80, r: -34 }, { x: 144, y: 80, r: 34 },
        { x: 72, y: 86, r: -20 }, { x: 128, y: 86, r: 20 },
        { x: 90, y: 88, r: -8 }, { x: 110, y: 88, r: 8 },
        { x: 66, y: 102, r: -22 }, { x: 134, y: 102, r: 22 },
        { x: 82, y: 108, r: -10 }, { x: 118, y: 108, r: 10 },
        { x: 100, y: 100, r: 0 },
        { x: 92, y: 122, r: -8 }, { x: 108, y: 122, r: 8 },
        { x: 78, y: 128, r: -16 }, { x: 122, y: 128, r: 16 },
      ].map((leaf, i) => (
        <ellipse key={i} cx={leaf.x} cy={leaf.y} rx="3" ry="6" fill={LIGHT}
          transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`} />
      ))}
      <path d="M40 158 Q100 130 160 158" stroke={DARK}  strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M55 168 Q100 148 145 168" stroke={LIGHT} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M70 178 Q100 165 130 178" stroke={LIGHT} strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 50%, #1d7c2f 100%)',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 36, padding: 18, display: 'flex' }}>
            <TreeSvg size={180} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
              <span style={{ color: 'white' }}>Ayur</span>
              <span style={{ color: '#5fc063' }}>Connect</span>
            </div>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>
              Kerala&apos;s #1 Ayurveda Platform
            </div>
          </div>
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 36, fontSize: 22, color: 'rgba(255,255,255,0.85)' }}>
          <span>500+ Verified doctors</span>
          <span>•</span>
          <span>150+ herbs</span>
          <span>•</span>
          <span>Classical Panchakarma</span>
          <span>•</span>
          <span>AyurBot AI</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
