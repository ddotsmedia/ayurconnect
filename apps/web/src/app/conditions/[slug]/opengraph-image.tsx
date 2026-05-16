import { ImageResponse } from 'next/og'
import { getCondition, CONDITIONS } from '../_data/conditions'

export const runtime = 'nodejs'
export const alt = 'AyurConnect — Condition'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return CONDITIONS.map((c) => ({ slug: c.slug }))
}

export default async function Image({ params }: { params: { slug: string } }) {
  const c = getCondition(params.slug)
  const title    = c?.title ?? 'Ayurvedic Treatment'
  const sanskrit = c?.sanskrit ?? ''
  const dosha    = c?.doshasInvolved.join(' · ') ?? ''

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
        {/* Brand strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60 }}>
          <div style={{ width: 8, height: 32, background: '#fbbf24', borderRadius: 4 }} />
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, textTransform: 'uppercase' }}>
            AyurConnect · Conditions
          </div>
        </div>

        {/* Sanskrit eyebrow */}
        {sanskrit && (
          <div style={{ display: 'flex', fontSize: 32, color: '#fbbf24', marginBottom: 14, fontStyle: 'italic' }}>
            {sanskrit}
          </div>
        )}

        {/* Title */}
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, lineHeight: 1.05, marginBottom: 30, maxWidth: 1040 }}>
          Ayurvedic treatment for {title}
        </div>

        {/* Doshas */}
        {dosha && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: 'rgba(255,255,255,0.85)', textTransform: 'capitalize' }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fbbf24' }} />
            <span>Dosha: {dosha}</span>
          </div>
        )}

        {/* Bottom strip */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
          <span>Classical formulations · Verified doctors · No quack promises</span>
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
