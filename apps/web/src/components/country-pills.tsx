// Country pills strip — shown above /doctors and /hospitals listings so the
// country breakdown is visible at-a-glance instead of buried inside the
// dropdown filter. Each pill is a server-rendered <Link> that toggles the
// `country` URL parameter. The currently active country is highlighted in
// the brand green; unset = "All countries" pill is active.

import Link from 'next/link'
import { COUNTRY_BY_CODE } from '../lib/countries'

export type CountryCount = { code: string; count: number }

type Props = {
  countries: CountryCount[]
  currentCountry?: string
  /** Base path for the link, e.g. '/doctors' or '/hospitals'. */
  basePath: '/doctors' | '/hospitals'
  /** Other URL params to preserve when switching countries. */
  preserveParams?: Record<string, string | undefined>
  /** Label for the leftmost "All" pill (defaults to "All countries"). */
  allLabel?: string
}

function buildHref(basePath: string, country: string | null, preserve: Record<string, string | undefined>): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(preserve)) {
    // Drop pagination + country when switching scope.
    if (k === 'country' || k === 'page') continue
    if (v) qs.set(k, v)
  }
  if (country) qs.set('country', country)
  const q = qs.toString()
  return q ? `${basePath}?${q}` : basePath
}

export function CountryPills({ countries, currentCountry, basePath, preserveParams = {}, allLabel = 'All countries' }: Props) {
  if (!countries || countries.length === 0) return null

  const total = countries.reduce((sum, c) => sum + c.count, 0)
  const allActive = !currentCountry

  // Sort by count desc; the API already does this, but defensively re-sort.
  const sorted = [...countries].sort((a, b) => b.count - a.count)

  return (
    <nav aria-label="Filter by country" className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
        <Link
          href={buildHref(basePath, null, preserveParams)}
          className={
            'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ' +
            (allActive
              ? 'bg-kerala-700 text-white border-kerala-700 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
          }
        >
          <span aria-hidden="true">🌍</span>
          <span>{allLabel}</span>
          <span className={'text-xs ' + (allActive ? 'text-white/80' : 'text-gray-400')}>{total}</span>
        </Link>

        {sorted.map((c) => {
          const meta = COUNTRY_BY_CODE[c.code]
          if (!meta) return null
          const active = currentCountry === c.code
          return (
            <Link
              key={c.code}
              href={buildHref(basePath, c.code, preserveParams)}
              className={
                'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ' +
                (active
                  ? 'bg-kerala-700 text-white border-kerala-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
              }
              title={meta.name}
            >
              <span aria-hidden="true" className="text-base leading-none">{meta.flag}</span>
              <span>{meta.name}</span>
              <span className={'text-xs ' + (active ? 'text-white/80' : 'text-gray-400')}>{c.count}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
