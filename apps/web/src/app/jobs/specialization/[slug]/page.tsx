import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase, ArrowRight } from 'lucide-react'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { pageMetadata } from '../../../../lib/seo'
import { SPECIALIZATIONS, LOCATIONS } from '../../seo/_data'

export const dynamic = 'force-dynamic'

export function generateStaticParams() { return SPECIALIZATIONS.map((s) => ({ slug: s.slug })) }

function findSpec(slug: string) { return SPECIALIZATIONS.find((s) => s.slug === slug) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: specialization } = await params
  const s = findSpec(specialization)
  if (!s) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/specialization/${specialization}`,
    title: `${s.label} Jobs — Ayurveda Career Opportunities`,
    description: `Latest ${s.label} jobs for Ayurveda doctors. Active openings, salary ranges, employer profiles.`,
    keywords: [`${s.label} jobs`, `${s.label} ayurveda jobs`, `BAMS ${s.label}`, `ayurveda ${s.label}`],
  })
}

async function fetchJobs(specialty: string): Promise<Array<{ id: string; title: string; clinic: string | null; location: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null }>> {
  try {
    const r = await fetch(`${API_INTERNAL}/jobs?status=active&specialty=${encodeURIComponent(specialty)}&limit=100`, { cache: 'no-store' })
    if (!r.ok) return []
    const data = await r.json() as { jobs?: unknown[] } | unknown[]
    const list = Array.isArray(data) ? data : (data.jobs ?? [])
    return list as Array<{ id: string; title: string; clinic: string | null; location: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null }>
  } catch { return [] }
}

export default async function SpecJobsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: specialization } = await params
  const s = findSpec(specialization)
  if (!s) notFound()
  const jobs = await fetchJobs(s.label)
  const lowData = jobs.length < 2
  return (
    <>
      {lowData && <meta name="robots" content="noindex,follow" />}
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{s.label} Jobs</h1>
          <p className="text-white/85 mt-3">{jobs.length} active opening{jobs.length === 1 ? '' : 's'} for {s.label} specialists.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.length === 0 && <li className="text-sm text-gray-500 col-span-2 bg-white border border-gray-100 rounded-card p-8 text-center">No current openings — set a <Link href="/jobs/alerts" className="text-kerala-700 hover:underline">job alert</Link> to be notified.</li>}
          {jobs.map((j) => (
            <li key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <Link href={`/jobs/${j.id}`} className="font-semibold text-ink hover:text-kerala-700 inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> {j.title}</Link>
              <p className="text-[11px] text-gray-600 mt-0.5">{j.clinic ?? '—'} · {j.location ?? '—'}</p>
              {j.salaryMin && <p className="text-xs text-gray-700 mt-1">{j.currency} {j.salaryMin.toLocaleString()}{j.salaryMax ? `–${j.salaryMax.toLocaleString()}` : ''}</p>}
            </li>
          ))}
        </ul>
        <section className="mt-10">
          <h2 className="font-serif text-xl text-ink">{s.label} jobs by location</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <Link key={l.slug} href={`/jobs/specialization/${s.slug}/${l.slug}`} className="inline-flex items-center gap-1 px-3 py-1 bg-cream border border-kerala-100 text-kerala-800 rounded-full text-xs hover:bg-kerala-50">{s.label} in {l.label} <ArrowRight className="w-3 h-3" /></Link>
            ))}
          </div>
        </section>
      </section>
    </>
  )
}
