import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, MapPin, Briefcase, IndianRupee } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'

type Job = {
  id: string; title: string; description: string; type: string; district?: string | null
  location?: string | null; specialty?: string | null; salary?: string | null
  salaryMin?: number | null; salaryMax?: number | null; currency?: string | null
  clinic?: string | null; remote?: boolean; urgent?: boolean; featured?: boolean
  tags?: string[]; createdAt: string; deadline?: string | null
}

async function fetchJobs(q: string, location: string, specialty: string): Promise<Job[]> {
  try {
    const url = new URL(`${API}/jobs`)
    url.searchParams.set('limit', '50')
    if (q) url.searchParams.set('q', q)
    if (location)  url.searchParams.set('location', location)
    if (specialty) url.searchParams.set('specialty', specialty)
    const r = await fetch(url.toString(), { cache: 'no-store' })
    if (!r.ok) { logServerFetchError('job-search', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { jobs?: Job[] }
    let list = d.jobs ?? []
    // Belt-and-braces filter in case the API ignores unknown params.
    if (q) {
      const needle = q.toLowerCase()
      list = list.filter((j) => j.title.toLowerCase().includes(needle) || (j.description ?? '').toLowerCase().includes(needle) || (j.tags ?? []).some((t) => t.toLowerCase().includes(needle)))
    }
    if (location) list = list.filter((j) => (j.location ?? j.district ?? '').toLowerCase().includes(location.toLowerCase()))
    if (specialty) list = list.filter((j) => (j.specialty ?? '').toLowerCase().includes(specialty.toLowerCase()))
    return list
  } catch (err) { logServerFetchError('job-search', err); return [] }
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const d = Math.floor(ms / 86_400_000)
  if (d < 1) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d} days ago`
  if (d < 365) return `${Math.floor(d / 30)} mo ago`
  return `${Math.floor(d / 365)}y ago`
}

export const metadata: Metadata = {
  title: 'Search Ayurveda Jobs | AyurConnect',
  description: 'Search Ayurveda jobs by keyword, location, and specialization. BAMS, MD, Panchakarma, telemedicine, and international roles.',
  alternates: { canonical: '/jobs/search' },
}

export default async function JobSearchPage({ searchParams }: { searchParams: Promise<{ q?: string; location?: string; specialty?: string }> }) {
  const sp = await searchParams
  const q = (sp.q ?? '').trim()
  const location = (sp.location ?? '').trim()
  const specialty = (sp.specialty ?? '').trim()
  const jobs = (q || location || specialty) ? await fetchJobs(q, location, specialty) : []
  const hasFilter = Boolean(q || location || specialty)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-3">
        <Link href="/jobs" className="hover:text-kerala-700">Jobs</Link>
        <ChevronRight className="inline w-3 h-3 mx-1" />
        <span className="text-gray-700">Search</span>
      </nav>

      <h1 className="font-serif text-3xl text-kerala-800">Job search</h1>
      <p className="text-sm text-gray-600 mt-1">{hasFilter ? `${jobs.length} result${jobs.length === 1 ? '' : 's'} for ${[q, location, specialty].filter(Boolean).map((x) => `“${x}”`).join(' · ')}` : 'Enter a keyword, pick a location or specialty.'}</p>

      <form action="/jobs/search" className="mt-4 flex flex-wrap gap-2 bg-white border border-gray-100 p-2 rounded-card">
        <input name="q" defaultValue={q} placeholder="Job title, skill, hospital..." className="flex-1 min-w-[180px] px-3 py-2 rounded text-sm border border-gray-200" />
        <select name="location" defaultValue={location} className="px-3 py-2 rounded text-sm border border-gray-200">
          <option value="">Any location</option>
          <option value="kerala">Kerala</option>
          <option value="uae">UAE</option>
          <option value="qatar">Qatar</option>
          <option value="saudi-arabia">Saudi Arabia</option>
          <option value="uk">UK</option>
          <option value="remote">Remote</option>
        </select>
        <select name="specialty" defaultValue={specialty} className="px-3 py-2 rounded text-sm border border-gray-200">
          <option value="">Any specialty</option>
          <option value="panchakarma">Panchakarma</option>
          <option value="kayachikitsa">Kayachikitsa</option>
          <option value="shalya">Shalya</option>
          <option value="prasuti-tantra">Prasuti Tantra</option>
          <option value="wellness">Wellness</option>
        </select>
        <button className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded">Search</button>
      </form>

      {hasFilter && jobs.length === 0 && <p className="mt-8 text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-6 text-center">No jobs match — try fewer filters.</p>}

      <ul className="mt-5 space-y-2">
        {jobs.map((j) => {
          const loc = j.location ?? j.district ?? (j.remote ? 'Remote' : '')
          const sal = j.salary ?? (j.salaryMin && j.salaryMax ? `${j.currency ?? '₹'} ${j.salaryMin.toLocaleString()} - ${j.salaryMax.toLocaleString()}` : null)
          return (
            <li key={j.id}>
              <Link href={`/jobs/${j.id}`} className="block bg-white border border-gray-100 hover:border-kerala-300 rounded-card p-4 transition-colors">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  {j.featured && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Featured</span>}
                  {j.urgent   && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">Urgent</span>}
                  <span className="text-[10px] text-gray-500 ml-auto">{relTime(j.createdAt)}</span>
                </div>
                <p className="font-serif text-lg text-ink leading-snug">{j.title}</p>
                {j.clinic && <p className="text-sm text-gray-600">{j.clinic}</p>}
                <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-600">
                  {loc && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {loc}</span>}
                  {j.type && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {j.type}</span>}
                  {sal && <span className="inline-flex items-center gap-1 text-kerala-700 font-semibold"><IndianRupee className="w-3 h-3" /> {sal}</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
