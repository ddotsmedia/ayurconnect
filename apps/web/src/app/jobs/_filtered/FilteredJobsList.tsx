import Link from 'next/link'
import { ChevronRight, MapPin, Briefcase, Clock, Calendar } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export type FilteredJob = {
  id: string; title: string; description: string; type: string
  district?: string | null; location?: string | null; specialty?: string | null
  clinic?: string | null; salary?: string | null; salaryMin?: number | null; salaryMax?: number | null
  currency?: string | null; remote?: boolean; urgent?: boolean; featured?: boolean
  tags?: string[]; createdAt: string; deadline?: string | null
}

function relTime(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d < 1) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d} days ago`
  if (d < 365) return `${Math.floor(d / 30)} mo ago`
  return `${Math.floor(d / 365)}y ago`
}

export async function fetchFilteredJobs(qs: string): Promise<FilteredJob[]> {
  try {
    const r = await fetch(`${API}/jobs?${qs}&limit=60`, { cache: 'no-store' })
    if (!r.ok) { logServerFetchError('filtered-jobs', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { jobs?: FilteredJob[] }
    return d.jobs ?? []
  } catch (err) { logServerFetchError('filtered-jobs', err); return [] }
}

export function FilteredJobsList({
  jobs,
  emptyHeadline,
  emptyBody,
  breadcrumb,
  schemaBoardName,
}: {
  jobs: FilteredJob[]
  emptyHeadline: string
  emptyBody: string
  breadcrumb: Array<{ name: string; url: string }>
  schemaBoardName: string
}) {
  const ld = ldGraph(
    breadcrumbLd(breadcrumb),
    { '@type': 'CollectionPage', name: schemaBoardName, url: breadcrumb[breadcrumb.length - 1].url },
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {jobs.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center max-w-2xl mx-auto">
          <p className="font-serif text-xl text-amber-900">{emptyHeadline}</p>
          <p className="text-sm text-amber-800 mt-2">{emptyBody}</p>
          <Link href="/jobs" className="inline-block mt-4 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Browse all jobs</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-4"><strong className="text-ink">{jobs.length}</strong> matching {jobs.length === 1 ? 'job' : 'jobs'}</p>
          <ul className="space-y-2">
            {jobs.map((j) => {
              const loc = j.location ?? j.district ?? (j.remote ? 'Remote' : '')
              const sal = j.salary ?? (j.salaryMin && j.salaryMax ? `${j.currency ?? '₹'} ${j.salaryMin.toLocaleString()} - ${j.salaryMax.toLocaleString()}` : null)
              return (
                <li key={j.id}>
                  <Link href={`/jobs/${j.id}`} className="block bg-white border border-gray-100 hover:border-kerala-300 rounded-card p-4 transition-colors">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      {j.urgent   && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">🔴 Urgent</span>}
                      {j.featured && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Featured</span>}
                      {j.remote   && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">Remote</span>}
                      <span className="text-[10px] text-gray-500 ml-auto inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {relTime(j.createdAt)}</span>
                    </div>
                    <p className="font-serif text-lg text-ink leading-snug">{j.title}</p>
                    {j.clinic && <p className="text-sm text-gray-600">{j.clinic}</p>}
                    <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-600">
                      {loc      && <span className="inline-flex items-center gap-1"><MapPin   className="w-3 h-3" /> {loc}</span>}
                      {j.type   && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {j.type}</span>}
                      {j.deadline && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Apply by {new Date(j.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                      {sal && <span className="text-kerala-700 font-semibold">{sal}</span>}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
      <section className="mt-10 bg-cream border border-kerala-100 rounded-card p-4 text-center">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Browse jobs by category</p>
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <Link href="/jobs/walk-in"            className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">📍 Walk-in</Link>
          <Link href="/jobs/immediate-hiring"   className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🔴 Urgent</Link>
          <Link href="/jobs/freshers"           className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🎓 Freshers</Link>
          <Link href="/jobs/remote"             className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🏠 Remote</Link>
          <Link href="/jobs/locum"              className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">⏱️ Locum</Link>
          <Link href="/jobs/salary-calculator"  className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">💰 Salary Calculator</Link>
        </div>
      </section>
    </>
  )
}

export function FilterPageHeader({ eyebrow, title, subtitle, icon }: { eyebrow: string; title: string; subtitle: string; icon: string }) {
  return (
    <section className="bg-hero-jobs text-white py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav className="text-xs text-white/70 mb-2">
          <Link href="/jobs" className="hover:text-white">Jobs</Link>
          <ChevronRight className="inline w-3 h-3 mx-1" />
          <span>{eyebrow}</span>
        </nav>
        <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{icon} {title}</h1>
        <p className="text-white/85 mt-3 text-sm md:text-base">{subtitle}</p>
      </div>
    </section>
  )
}
