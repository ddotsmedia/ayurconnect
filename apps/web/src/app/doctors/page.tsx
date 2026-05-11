import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import { X } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { DoctorFilterSidebar } from './_filter-sidebar'

type SearchParams = { [key: string]: string | undefined }

type DoctorListResponse = {
  doctors: DoctorCardData[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

async function fetchDoctors(params: SearchParams): Promise<DoctorListResponse> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v && typeof v === 'string') qs.set(k, v)
  }
  if (!qs.has('limit')) qs.set('limit', '12')
  try {
    const res = await fetch(`${API}/doctors?${qs.toString()}`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return { doctors: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } }
    return (await res.json()) as DoctorListResponse
  } catch {
    return { doctors: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } }
  }
}

export const metadata = {
  title: 'Find Ayurveda Doctors in Kerala — CCIM Verified | AyurConnect',
  description: '500+ CCIM-verified Ayurveda doctors across all 14 Kerala districts. Filter by district, specialization, language, and availability.',
}

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const data = await fetchDoctors(sp)
  const { doctors, pagination } = data

  const activeFilters: Array<{ key: keyof SearchParams; label: string; value: string }> = []
  if (sp.country && sp.country !== 'IN') activeFilters.push({ key: 'country',       label: 'Country',          value: sp.country })
  if (sp.state)           activeFilters.push({ key: 'state',           label: 'State',            value: sp.state })
  if (sp.district)        activeFilters.push({ key: 'district',        label: 'District',         value: sp.district })
  if (sp.specialization)  activeFilters.push({ key: 'specialization',  label: 'Specialization',   value: sp.specialization })
  if (sp.language)        activeFilters.push({ key: 'language',        label: 'Language',         value: sp.language })
  if (sp.q)               activeFilters.push({ key: 'q',               label: 'Search',           value: sp.q })
  if (sp.verified === 'true') activeFilters.push({ key: 'verified',    label: 'CCIM verified',    value: 'yes' })
  if (sp.online === 'true')   activeFilters.push({ key: 'online',      label: 'Online available', value: 'yes' })

  const buildHref = (overrides: Partial<SearchParams>) => {
    const next = { ...sp, ...overrides }
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) {
      if (v && typeof v === 'string') qs.set(k, v)
    }
    return `/doctors?${qs.toString()}`
  }

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl text-white">Find an Ayurveda Doctor</h1>
          <p className="text-white/70 mt-3">CCIM-verified practitioners across Kerala. Filter by district, specialization, language and availability.</p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* SIDEBAR — country + state + district + specialization + language + sort filters.
            Now a client component so it can use CountrySelect / StateSelect dropdowns
            with country-dependent state options. URL stays in sync — sharing /doctors?country=AE
            survives full page reloads + back button. */}
        <DoctorFilterSidebar
          country={sp.country ?? 'IN'}
          state={sp.state ?? ''}
          district={sp.district ?? ''}
          specialization={sp.specialization ?? ''}
          language={sp.language ?? ''}
          verified={sp.verified ?? ''}
          online={sp.online ?? ''}
          sort={sp.sort ?? 'rating'}
          q={sp.q ?? ''}
        />

        {/* RESULTS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted">
              <strong className="text-ink">{pagination.total}</strong> doctors found
              {sp.district ? ` in ${sp.district}` : ''}
              {sp.specialization ? ` for ${sp.specialization}` : ''}
            </p>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {activeFilters.map((f) => (
                <Link
                  key={f.key + f.value}
                  href={buildHref({ [f.key]: undefined } as Partial<SearchParams>)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-kerala-50 text-kerala-700 border border-kerala-100 rounded-full text-xs hover:bg-kerala-100"
                >
                  {f.label}: <strong>{f.value}</strong>
                  <X className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}

          {doctors.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
              <div className="text-5xl mb-3">🌿</div>
              <h3 className="text-lg font-semibold text-gray-900">No doctors match those filters.</h3>
              <p className="text-muted mt-1">Try widening your search or <Link href="/doctors" className="text-kerala-700 underline">clear all filters</Link>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }).map((_, i) => {
                const p = i + 1
                const active = p === pagination.page
                return (
                  <Link
                    key={p}
                    href={buildHref({ page: String(p) })}
                    className={
                      active
                        ? 'w-10 h-10 rounded-md bg-kerala-600 text-white flex items-center justify-center text-sm font-medium'
                        : 'w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-kerala-200 flex items-center justify-center text-sm'
                    }
                  >
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
