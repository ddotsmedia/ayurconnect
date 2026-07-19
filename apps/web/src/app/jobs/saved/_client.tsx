'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, GitCompare, MapPin, Briefcase } from 'lucide-react'

export type SavedJob = {
  id:         string
  title:      string
  description: string
  type:       string
  district?:  string | null
  specialty?: string | null
  clinic?:    string | null
  salary?:    string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?:  string | null
  createdAt:  string
  savedAt:    string
}

export function SavedJobsClient({
  initial,
  active,
  options,
}: {
  initial: SavedJob[]
  active:  { type: string; district: string; specialty: string }
  options: { types: string[]; districts: string[]; specialties: string[] }
}) {
  const router  = useRouter()
  const sp      = useSearchParams()
  const [items, setItems]       = useState<SavedJob[]>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy,  setBusy]        = useState<string | null>(null)

  // Reflect filter changes back into the URL so refresh preserves them.
  function updateFilter(key: 'type' | 'district' | 'specialty', value: string) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value); else params.delete(key)
    router.push(`/jobs/saved?${params.toString()}`)
  }

  async function remove(id: string) {
    setBusy(id)
    try {
      const r = await fetch(`/api/jobs-portal/wishlist/${id}`, { method: 'DELETE', credentials: 'include' })
      if (r.ok) {
        setItems((cur) => cur.filter((i) => i.id !== id))
        setSelected((cur) => { const next = new Set(cur); next.delete(id); return next })
      }
    } finally {
      setBusy(null)
    }
  }

  function toggleSelect(id: string) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) { next.delete(id); return next }
      if (next.size >= 3) return cur // cap at 3
      next.add(id); return next
    })
  }

  const canCompare = selected.size >= 2

  const compareHref = useMemo(() => {
    if (!canCompare) return '#'
    return `/jobs/saved/compare?ids=${[...selected].join(',')}`
  }, [selected, canCompare])

  return (
    <>
      {/* Filter row + sticky compare-action bar. */}
      <div className="bg-white border border-gray-100 rounded-card p-3 mb-4 flex flex-wrap gap-2 items-center">
        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mr-1">Filter:</label>
        <select value={active.type} onChange={(e) => updateFilter('type', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Type: any</option>
          {options.types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={active.district} onChange={(e) => updateFilter('district', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">District: any</option>
          {options.districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={active.specialty} onChange={(e) => updateFilter('specialty', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Specialty: any</option>
          {options.specialties.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-gray-500">{selected.size}/3 selected</span>
          {canCompare ? (
            <Link href={compareHref} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white text-xs font-semibold rounded">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </Link>
          ) : (
            <button disabled className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-semibold rounded cursor-not-allowed" title="Select 2 or 3 jobs">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((j) => {
          const sal = j.salary ?? (j.salaryMin && j.salaryMax ? `${j.currency ?? '₹'} ${j.salaryMin.toLocaleString()} - ${j.salaryMax.toLocaleString()}` : null)
          const isSel = selected.has(j.id)
          return (
            <li key={j.id} className={`bg-white border rounded-card p-4 transition-colors ${isSel ? 'border-kerala-500 ring-1 ring-kerala-200' : 'border-gray-100 hover:border-kerala-200'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleSelect(j.id)}
                  aria-label={`Select ${j.title} for compare`}
                  className="mt-1 w-4 h-4 text-kerala-700 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link href={`/jobs/${j.id}`} className="font-serif text-base text-ink hover:text-kerala-700">{j.title}</Link>
                    <span className="text-[10px] text-gray-400 ml-auto">Saved {new Date(j.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {j.clinic && <p className="text-xs text-gray-600 mt-0.5">{j.clinic}</p>}
                  <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-600">
                    {j.district  && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.district}</span>}
                    {j.type      && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {j.type}</span>}
                    {sal         && <span className="text-kerala-700 font-semibold">{sal}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link href={`/jobs/${j.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white text-xs font-semibold rounded">
                    Apply
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(j.id)}
                    disabled={busy === j.id}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 disabled:opacity-50"
                    aria-label={`Remove ${j.title} from saved`}
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
