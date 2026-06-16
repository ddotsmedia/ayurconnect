import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase, MapPin } from 'lucide-react'
import { API_INTERNAL } from '../../../../../lib/server-fetch'
import { pageMetadata } from '../../../../../lib/seo'
import { SPECIALIZATIONS, LOCATIONS } from '../../../seo/_data'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return SPECIALIZATIONS.flatMap((s) => LOCATIONS.map((l) => ({ slug: s.slug, location: l.slug })))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; location: string }> }): Promise<Metadata> {
  const { slug: specialization, location } = await params
  const s = SPECIALIZATIONS.find((x) => x.slug === specialization)
  const l = LOCATIONS.find((x) => x.slug === location)
  if (!s || !l) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/specialization/${specialization}/${location}`,
    title: `${s.label} Jobs in ${l.label} | AyurConnect`,
    description: `Active ${s.label} jobs in ${l.label}. Salary ranges, employers hiring, application links.`,
    keywords: [`${s.label} jobs ${l.label}`, `ayurveda ${l.label}`, `BAMS ${l.label}`],
  })
}

async function fetchJobs(specialty: string, locationQuery: string): Promise<Array<{ id: string; title: string; clinic: string | null; location: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null }>> {
  try {
    const r = await fetch(`${API_INTERNAL}/jobs?status=active&specialty=${encodeURIComponent(specialty)}&q=${encodeURIComponent(locationQuery)}&limit=100`, { cache: 'no-store' })
    if (!r.ok) return []
    const data = await r.json() as { jobs?: unknown[] } | unknown[]
    const list = Array.isArray(data) ? data : (data.jobs ?? [])
    return list as Array<{ id: string; title: string; clinic: string | null; location: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null }>
  } catch { return [] }
}

export default async function SpecLocPage({ params }: { params: Promise<{ slug: string; location: string }> }) {
  const { slug: specialization, location } = await params
  const s = SPECIALIZATIONS.find((x) => x.slug === specialization)
  const l = LOCATIONS.find((x) => x.slug === location)
  if (!s || !l) notFound()
  const jobs = await fetchJobs(s.label, l.label)
  const lowData = jobs.length < 2
  return (
    <>
      {lowData && <meta name="robots" content="noindex,follow" />}
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><MapPin className="w-3 h-3" /> {l.label}</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{s.label} Jobs in {l.label}</h1>
          <p className="text-white/85 mt-3">{jobs.length} active opening{jobs.length === 1 ? '' : 's'}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.length === 0 && <li className="text-sm text-gray-500 col-span-2 bg-white border border-gray-100 rounded-card p-8 text-center">No current openings — try <Link href={`/jobs/specialization/${s.slug}`} className="text-kerala-700 hover:underline">all {s.label} jobs</Link> or set an alert.</li>}
          {jobs.map((j) => (
            <li key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <Link href={`/jobs/${j.id}`} className="font-semibold text-ink hover:text-kerala-700 inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> {j.title}</Link>
              <p className="text-[11px] text-gray-600 mt-0.5">{j.clinic ?? '—'} · {j.location ?? '—'}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-gray-500"><Link href={`/jobs/salary/${s.slug}/${l.slug}`} className="text-kerala-700 hover:underline">See {s.label} salary in {l.label} →</Link></p>
      </section>
    </>
  )
}
