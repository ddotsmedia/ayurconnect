'use client'

import { useState } from 'react'

export type App = {
  id: string; status: string; appliedAt: string; matchScore: number | null
  candidate: { id: string; fullName: string; headline: string | null; currentLocation: string | null; totalExperience: number; specializations: string[]; languages: string[] }
}

const COLS: Array<{ key: string; label: string; color: string }> = [
  { key: 'applied',             label: 'Applied',     color: 'bg-amber-50 border-amber-200' },
  { key: 'viewed',              label: 'Viewed',      color: 'bg-blue-50 border-blue-200' },
  { key: 'shortlisted',         label: 'Shortlisted', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'interview_scheduled', label: 'Interview',   color: 'bg-purple-50 border-purple-200' },
  { key: 'offered',             label: 'Offered',     color: 'bg-cyan-50 border-cyan-200' },
  { key: 'hired',               label: 'Hired',       color: 'bg-kerala-50 border-kerala-200' },
]

export function AtsClient({ initial }: { initial: App[] }) {
  const [apps, setApps] = useState(initial)
  async function move(id: string, status: string) {
    const r = await fetch(`/api/jobs-portal/applications/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) })
    if (r.ok) setApps((x) => x.map((a) => a.id === id ? { ...a, status } : a))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {COLS.map((col) => {
        const items = apps.filter((a) => a.status === col.key)
        return (
          <div key={col.key} className={'border rounded-card p-2 ' + col.color}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-700 px-1">{col.label} <span className="text-gray-500">({items.length})</span></p>
            <ul className="mt-2 space-y-2">
              {items.map((a) => (
                <li key={a.id} className="bg-white border border-gray-100 rounded p-2 text-xs">
                  <p className="font-semibold text-ink truncate">{a.candidate.fullName}</p>
                  <p className="text-gray-600 truncate">{a.candidate.headline ?? '—'}</p>
                  <p className="text-[10px] text-gray-500">{a.candidate.currentLocation ?? '—'} · {a.candidate.totalExperience}y</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {COLS.filter((c) => c.key !== col.key).map((c) => (
                      <button key={c.key} onClick={() => move(a.id, c.key)} className="text-[9px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded">→ {c.label}</button>
                    ))}
                  </div>
                </li>
              ))}
              {items.length === 0 && <li className="text-[10px] text-gray-400 text-center py-2">—</li>}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
