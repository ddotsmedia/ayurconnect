import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect article'

type Article = { id: string; title: string; category: string; source: string | null }

async function fetchArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API}/articles/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Article
  } catch { return null }
}

const CATEGORY_LABEL: Record<string, string> = {
  'classical-text':  'Classical Text',
  research:          'Research',
  'seasonal-health': 'Seasonal Health',
  lifestyle:         'Lifestyle',
}

export default async function Image({ params }: { params: { id: string } }) {
  const a = await fetchArticle(params.id)
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
          <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>Articles</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 32 }}>
          {a?.category && (
            <div style={{ display: 'flex', marginBottom: 18 }}>
              <span style={{ background: 'rgba(217,119,6,0.9)', color: 'white', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>
                {CATEGORY_LABEL[a.category] ?? a.category}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>
            {a?.title ?? 'AyurConnect Articles'}
          </div>
          {a?.source && (
            <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: 22, fontStyle: 'italic' }}>— {a.source}</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
          <span>ayurconnect.com/articles</span>
          <span>Curated Ayurveda Knowledge</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
