import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AyurConnect article'

type Article = {
  id: string
  title: string
  category: string
  source: string | null
  language: string
  featuredImage?:    string | null
  featuredImageAlt?: string | null
  readTimeMinutes?:  number | null
}

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

function absoluteUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://ayurconnect.com'
  return `${origin}${url}`
}

export default async function Image({ params }: { params: { id: string } }) {
  const a = await fetchArticle(params.id)
  const featuredHref = a?.featuredImage ? absoluteUrl(a.featuredImage) : null

  // Two layouts:
  //  A) HAS featured image → image as background with a dark gradient
  //     overlay so the white title stays readable regardless of the
  //     underlying photo. Category chip top-right, title mid, brand +
  //     reading time footer.
  //  B) NO featured image → gradient-only card (previous default).
  //     Kept as the fallback since Satori can't render a broken image URL.

  return new ImageResponse(
    featuredHref ? (
      // ─── Layout A · featured image background ────────────────────
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={featuredHref}
          alt=""
          width={1200}
          height={630}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(13,61,26,0.92) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 60, color: 'white',
          }}
        >
          {/* top row: brand + category chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white' }} />
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>
              <span>Ayur</span>
              <span style={{ color: '#5fc063' }}>Connect</span>
            </div>
            {a?.category && (
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)' }}>
                {CATEGORY_LABEL[a.category] ?? a.category}
              </span>
            )}
          </div>

          {/* title */}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1080 }}>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {a?.title ?? 'AyurConnect Article'}
            </div>
            <div style={{ display: 'flex', gap: 22, marginTop: 20, fontSize: 20, color: 'rgba(255,255,255,0.9)' }}>
              {a?.source ? <span>— {a.source}</span> : null}
              {a?.readTimeMinutes ? <span>· {a.readTimeMinutes} min read</span> : null}
            </div>
          </div>

          {/* footer strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>
            <span>ayurconnect.com</span>
            <span>Curated Ayurveda Knowledge</span>
          </div>
        </div>
      </div>
    ) : (
      // ─── Layout B · gradient fallback (no featured image) ─────────
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
