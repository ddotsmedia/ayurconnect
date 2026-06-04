'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X, Search } from 'lucide-react'
import { SPECIALTIES, EMPLOYMENT_TYPES, ALL_LOCATIONS } from '../../lib/data/jobs'

const SORTS = [
  { key: 'featured',     label: 'Featured first' },
  { key: 'latest',       label: 'Latest' },
  { key: 'deadline',     label: 'Deadline soon' },
  { key: 'salary-desc',  label: 'Salary ↓' },
  { key: 'salary-asc',   label: 'Salary ↑' },
]

export function JobFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const initial = {
    search:     params.get('search') ?? '',
    specialty:  params.get('specialty') ?? '',
    location:   params.get('location') ?? '',
    type:       params.get('type') ?? '',
    remote:     params.get('remote') === '1',
    sort:       params.get('sort') ?? 'featured',
  }
  const [state, setState] = useState(initial)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Debounce keyword input.
  useEffect(() => {
    const t = setTimeout(() => push(state), 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search])

  function push(next: typeof state) {
    const sp = new URLSearchParams()
    if (next.search)    sp.set('search', next.search)
    if (next.specialty) sp.set('specialty', next.specialty)
    if (next.location)  sp.set('location', next.location)
    if (next.type)      sp.set('type', next.type)
    if (next.remote)    sp.set('remote', '1')
    if (next.sort && next.sort !== 'featured') sp.set('sort', next.sort)
    router.replace(`${pathname}${sp.toString() ? '?' + sp.toString() : ''}`)
  }

  function set<K extends keyof typeof state>(k: K, v: typeof state[K]) {
    const next = { ...state, [k]: v }
    setState(next)
    if (k !== 'search') push(next)
  }

  const hasFilters = useMemo(() => Boolean(state.specialty || state.location || state.type || state.remote || state.search), [state])

  function clearAll() {
    const reset = { search: '', specialty: '', location: '', type: '', remote: false, sort: 'featured' }
    setState(reset); push(reset)
  }

  const Inner = (
    <div className="space-y-3 text-sm">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search title, clinic, tags…"
          value={state.search}
          onChange={(e) => setState({ ...state, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-700"
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Specialty</label>
        <select value={state.specialty} onChange={(e) => set('specialty', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
          <option value="">All specialties</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Location</label>
        <select value={state.location} onChange={(e) => set('location', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
          <option value="">Any location</option>
          {ALL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Employment type</label>
        <div className="flex flex-wrap gap-1.5">
          {EMPLOYMENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('type', state.type === t ? '' : t)}
              className={'text-xs px-3 py-1.5 rounded-full border ' + (state.type === t ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={state.remote} onChange={(e) => set('remote', e.target.checked)} className="rounded" />
        <span className="text-sm">Remote only</span>
      </label>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Sort</label>
        <select value={state.sort} onChange={(e) => set('sort', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {hasFilters && (
        <button type="button" onClick={clearAll} className="text-xs text-kerala-700 hover:underline">Clear filters</button>
      )}
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded text-sm"
      >
        <Filter className="w-4 h-4" /> Filters{hasFilters ? ' · active' : ''}
      </button>

      <aside className="hidden md:block bg-white border border-gray-100 rounded-card p-4 shadow-card sticky top-4">
        {Inner}
      </aside>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 flex" onClick={() => setDrawerOpen(false)}>
          <aside className="bg-white w-80 max-w-[85vw] h-full p-4 overflow-y-auto ml-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Filter jobs</h3>
              <button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            {Inner}
          </aside>
        </div>
      )}
    </>
  )
}

export default JobFilters
