'use client'

import { useState } from 'react'

const STAGES = ['documents_collected','submitted','exam_scheduled','exam_passed','license_issued'] as const
const STAGE_LABEL: Record<string, string> = {
  documents_collected: 'Documents collected',
  submitted: 'Submitted',
  exam_scheduled: 'Exam scheduled',
  exam_passed: 'Exam passed',
  license_issued: 'License issued',
}

export function TrackClient({ initial, guides }: { initial: Array<{ jurisdictionSlug: string; stage: string }>; guides: Array<{ slug: string; jurisdiction: string }> }) {
  const [tracks, setTracks] = useState(initial)
  const map = new Map(tracks.map((t) => [t.jurisdictionSlug, t.stage]))

  async function set(slug: string, stage: string) {
    const r = await fetch(`/api/jobs-portal/licensing/me/${slug}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    if (r.ok) setTracks((x) => {
      const without = x.filter((t) => t.jurisdictionSlug !== slug)
      return [...without, { jurisdictionSlug: slug, stage }]
    })
  }

  return (
    <ul className="mt-5 space-y-3">
      {guides.map((g) => {
        const cur = map.get(g.slug) ?? null
        const idx = cur ? STAGES.indexOf(cur as typeof STAGES[number]) : -1
        return (
          <li key={g.slug} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <p className="font-semibold text-ink">{g.jurisdiction}</p>
            <div className="mt-2 flex gap-1 flex-wrap">
              {STAGES.map((s, i) => {
                const reached = idx >= i
                return (
                  <button key={s} onClick={() => set(g.slug, s)} className={'text-[10px] px-2 py-1 rounded ' + (reached ? 'bg-kerala-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {STAGE_LABEL[s]}
                  </button>
                )
              })}
              {cur && <button onClick={() => set(g.slug, 'documents_collected')} className="text-[10px] px-2 py-1 text-gray-500 hover:underline">reset</button>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
