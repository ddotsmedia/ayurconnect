'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { CountrySelect } from '../../components/country-select'
import { StateSelect } from '../../components/state-select'

const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Shalakya', 'Manasika', 'Rasashastra', 'Dravyaguna', 'Roganidana']
const LANGUAGES = ['Malayalam', 'English', 'Tamil', 'Hindi', 'Arabic', 'Kannada']

type Props = {
  country:        string
  state:          string
  district:       string
  specialization: string
  language:       string
  verified:       string
  online:         string
  sort:           string
  q:              string
}

export function DoctorFilterSidebar(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read live from URL so the back button works.
  const country = params.get('country') ?? props.country ?? 'IN'
  const state = params.get('state') ?? props.state ?? ''
  const district = params.get('district') ?? props.district ?? ''
  const specialization = params.get('specialization') ?? props.specialization ?? ''
  const language = params.get('language') ?? props.language ?? ''
  const verified = params.get('verified') ?? props.verified ?? ''
  const online = params.get('online') ?? props.online ?? ''
  const sort = params.get('sort') ?? props.sort ?? 'rating'
  const q = params.get('q') ?? props.q ?? ''

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    // Reset pagination on every filter change.
    next.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`)
    })
  }

  const hasAny = Boolean(
    (country && country !== 'IN') || state || district || specialization ||
    language || verified === 'true' || online === 'true' || q,
  )

  return (
    <aside className="space-y-5 lg:sticky lg:top-20 self-start">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            defaultValue={q}
            onKeyDown={(e) => { if (e.key === 'Enter') update({ q: (e.target as HTMLInputElement).value || null }) }}
            onBlur={(e) => update({ q: e.target.value || null })}
            placeholder="Name, condition, herb…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Country</label>
        <CountrySelect value={country} onChange={(c) => update({ country: c, state: null, district: null })} />
      </div>

      {/* State / region */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State / region</label>
        <StateSelect country={country} value={state} onChange={(s) => update({ state: s, district: null })} />
      </div>

      {/* District / city */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">District / city</label>
        <input
          defaultValue={district}
          onBlur={(e) => update({ district: e.target.value || null })}
          placeholder="e.g. Ernakulam, Dubai"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-600"
        />
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialization</label>
        <select
          value={specialization}
          onChange={(e) => update({ specialization: e.target.value || null })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
        >
          <option value="">All</option>
          {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</label>
        <select
          value={language}
          onChange={(e) => update({ language: e.target.value || null })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
        >
          <option value="">Any</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={verified === 'true'} onChange={(e) => update({ verified: e.target.checked ? 'true' : null })} className="w-4 h-4 rounded border-gray-300 accent-kerala-600" />
          CCIM verified only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={online === 'true'} onChange={(e) => update({ online: e.target.checked ? 'true' : null })} className="w-4 h-4 rounded border-gray-300 accent-kerala-600" />
          Online consultations
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort by</label>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value === 'rating' ? null : e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
        >
          <option value="rating">Best rated</option>
          <option value="experience">Most experienced</option>
          <option value="newest">Recently added</option>
        </select>
      </div>

      <div className="flex items-center justify-between text-xs">
        {isPending ? <span className="text-muted italic">Updating…</span> : <span />}
        {hasAny && (
          <Link href="/doctors" className="inline-flex items-center gap-1 text-gray-600 hover:text-kerala-700">
            <X className="w-3 h-3" /> Clear all
          </Link>
        )}
      </div>
    </aside>
  )
}
