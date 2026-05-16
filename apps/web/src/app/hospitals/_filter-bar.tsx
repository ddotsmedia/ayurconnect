'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { StateSelect } from '../../components/state-select'

const TYPES = [
  { value: '',            label: 'All types' },
  { value: 'hospital',    label: 'Hospital' },
  { value: 'clinic',      label: 'Clinic' },
  { value: 'panchakarma', label: 'Panchakarma centre' },
  { value: 'wellness',    label: 'Wellness resort' },
  { value: 'pharmacy',    label: 'Pharmacy' },
]

type Props = {
  initialCountry:  string
  initialState:    string
  initialDistrict: string
  initialType:     string
  initialVerified: string
  initialQ:        string
}

export function HospitalFilterBar(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read current values directly from URL params so this widget is always in
  // sync with the address bar (e.g. when user hits back).
  const country  = params.get('country')  ?? props.initialCountry  ?? 'IN'
  const state    = params.get('state')    ?? props.initialState    ?? ''
  const district = params.get('district') ?? props.initialDistrict ?? ''
  const type     = params.get('type')     ?? props.initialType     ?? ''
  const verified = params.get('verified') ?? props.initialVerified ?? ''
  const q        = params.get('q')        ?? props.initialQ        ?? ''

  const update = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`)
    })
  }, [params, pathname, router])

  const hasAny = Boolean(country !== 'IN' || state || district || type || verified || q)

  return (
    <div className="bg-white border border-gray-100 rounded-card p-4 mb-6 shadow-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Country</label>
          <CountrySelect value={country} onChange={(c) => update({ country: c, state: null, district: null })} />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">State / region</label>
          <StateSelect country={country} value={state} onChange={(s) => update({ state: s, district: null })} />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">District / city</label>
          <input
            value={district}
            onChange={(e) => update({ district: e.target.value || null })}
            placeholder="e.g. Ernakulam, Mumbai, Dubai"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => update({ type: e.target.value || null })}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-kerala-700"
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Search name</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={q}
              onChange={(e) => update({ q: e.target.value || null })}
              placeholder="Hospital name"
              className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={verified === 'true'}
              onChange={(e) => update({ verified: e.target.checked ? 'true' : null })}
            />
            verified only
          </label>
          {isPending && <span className="text-xs text-muted italic">Updating…</span>}
        </div>
        {hasAny && (
          <button
            onClick={() => update({ country: 'IN', state: null, district: null, type: null, verified: null, q: null })}
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-kerala-700"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
