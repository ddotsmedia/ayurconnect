import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import { Search, X } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Shalakya', 'Manasika', 'Rasashastra', 'Dravyaguna', 'Roganidana']
const LANGUAGES = ['Malayalam', 'English', 'Tamil', 'Hindi', 'Arabic', 'Kannada']

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

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          <form action="/doctors" method="get" className="space-y-5">
            {/* keep current page=1 reset on filter change */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="q"
                  defaultValue={sp.q ?? ''}
                  placeholder="Name, condition, herb…"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">District</label>
              <select name="district" defaultValue={sp.district ?? ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
                <option value="">All</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialization</label>
              <select name="specialization" defaultValue={sp.specialization ?? ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
                <option value="">All</option>
                {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</label>
              <select name="language" defaultValue={sp.language ?? ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
                <option value="">Any</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="verified" value="true" defaultChecked={sp.verified === 'true'} className="w-4 h-4 rounded border-gray-300 accent-kerala-600" />
                CCIM verified only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="online" value="true" defaultChecked={sp.online === 'true'} className="w-4 h-4 rounded border-gray-300 accent-kerala-600" />
                Online consultations
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort by</label>
              <select name="sort" defaultValue={sp.sort ?? 'rating'} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
                <option value="rating">Best rated</option>
                <option value="experience">Most experienced</option>
                <option value="newest">Recently added</option>
              </select>
            </div>

            <button type="submit" className="w-full px-4 py-2 bg-kerala-600 text-white font-semibold rounded-md hover:bg-kerala-700 text-sm">
              Apply filters
            </button>
            <Link href="/doctors" className="block text-center text-sm text-muted hover:text-gray-700">
              Clear all
            </Link>
          </form>
        </aside>

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
