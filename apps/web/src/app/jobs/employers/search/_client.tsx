'use client'

import { useState } from 'react'
import { Search as SearchIcon, MapPin, Briefcase, Globe2 } from 'lucide-react'

type C = { id: string; fullName: string; headline: string | null; currentLocation: string | null; totalExperience: number; specializations: string[]; languages: string[]; availability: string; openToTelemedicine: boolean; openToLocum: boolean }

const SPECS = ['','Panchakarma','Kayachikitsa','Shalya','Shalakya','Prasuti Tantra','Kaumarbhritya','Manasika','Rasashastra','Dravyaguna','Roganidana']

export function SearchClient() {
  const [filters, setFilters] = useState({ q: '', specialization: '', location: '', minExp: '', availability: '' })
  const [items, setItems] = useState<C[]>([])
  const [busy, setBusy] = useState(false)

  async function search() {
    setBusy(true)
    try {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v)
      const r = await fetch(`/api/jobs-portal/candidates/search?${params}`, { credentials: 'include' })
      if (r.ok) setItems(await r.json())
    } finally { setBusy(false) }
  }

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); search() }} className="bg-white border border-gray-100 rounded-card p-3 shadow-card grid grid-cols-2 md:grid-cols-6 gap-2">
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Keyword" className="border border-gray-200 rounded px-2 py-1.5 text-xs col-span-2" />
        <select value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })} className="border border-gray-200 rounded px-2 py-1.5 text-xs">
          {SPECS.map((s) => <option key={s} value={s}>{s || 'All specs'}</option>)}
        </select>
        <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Location" className="border border-gray-200 rounded px-2 py-1.5 text-xs" />
        <input type="number" value={filters.minExp} onChange={(e) => setFilters({ ...filters, minExp: e.target.value })} placeholder="Min exp" className="border border-gray-200 rounded px-2 py-1.5 text-xs" />
        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-1 bg-kerala-700 text-white rounded text-xs font-semibold px-3 disabled:opacity-50"><SearchIcon className="w-3 h-3" /> Search</button>
      </form>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((c) => (
          <li key={c.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <p className="font-semibold text-ink">{c.fullName}</p>
            <p className="text-xs text-gray-600">{c.headline ?? '—'}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-700">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.currentLocation ?? '—'}</span>
              <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {c.totalExperience}y</span>
              <span className="inline-flex items-center gap-1"><Globe2 className="w-3 h-3" /> {c.languages.slice(0,3).join(', ') || '—'}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.specializations.map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">{s}</span>)}
              {c.openToTelemedicine && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded">Telemed</span>}
              {c.openToLocum && <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded">Locum</span>}
            </div>
            <p className="text-[10px] text-amber-700 mt-2">{c.availability}</p>
          </li>
        ))}
        {items.length === 0 && <li className="col-span-2 text-sm text-gray-500 text-center bg-white border border-gray-100 rounded-card p-8">Use filters to search candidates.</li>}
      </ul>
    </div>
  )
}
