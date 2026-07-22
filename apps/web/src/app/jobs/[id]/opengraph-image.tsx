import { ImageResponse } from 'next/og'
import { API_INTERNAL as API } from '../../../lib/server-fetch'

export const runtime     = 'nodejs'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt         = 'AyurConnect job'
// force-dynamic (2026-07-22) — render OG cards on request, not at build.
export const dynamic     = 'force-dynamic'

// Per-job branded OG card. Mirrors the /articles/[id]/opengraph-image
// pattern — Next 14 auto-caches these by URL (immutable hash suffix) so
// no explicit cache header is needed. Uses gradient-only layout since Job
// records don't carry a hero image.

type Job = {
  id:       string
  title:    string
  clinic?:  string | null
  location?: string | null
  district?: string | null
  type?:    string | null
  specialty?: string | null
  salary?:   string | null
  currency?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  remote?:   boolean
}

async function fetchJob(id: string): Promise<Job | null> {
  try {
    const r = await fetch(`${API}/jobs/${id}`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as Job
  } catch { return null }
}

export default async function Image({ params }: { params: { id: string } }) {
  const j = await fetchJob(params.id)
  const location = j?.location ?? j?.district ?? (j?.remote ? 'Remote' : 'Kerala, India')
  const salary   = j?.salary ?? (j?.salaryMin && j?.salaryMax ? `${j.currency ?? 'INR'} ${j.salaryMin}-${j.salaryMax}/mo` : null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 72,
          background: 'linear-gradient(135deg, #0d3d1a 0%, #155228 55%, #1d7c2f 100%)',
          color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'white' }} />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: 'white' }}>Ayur</span>
            <span style={{ color: '#5fc063' }}>Connect</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>Jobs</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 32 }}>
          {j?.specialty && (
            <div style={{ display: 'flex', marginBottom: 18 }}>
              <span style={{ background: 'rgba(217,119,6,0.9)', color: 'white', padding: '6px 14px', borderRadius: 999, fontSize: 18, fontWeight: 600 }}>
                {j.specialty}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 }}>
            {j?.title ?? 'AyurConnect Job'}
          </div>
          {j?.clinic && (
            <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 18, fontWeight: 500 }}>
              {j.clinic}
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, fontSize: 22, color: 'rgba(255,255,255,0.8)' }}>
            <span>📍 {location}</span>
            {salary && <span>· {salary}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>
          <span>ayurconnect.com/jobs</span>
          <span>Verified Ayurveda Careers</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
