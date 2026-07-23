import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase } from 'lucide-react'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { pageMetadata } from '../../../../lib/seo'
import { COUNTRIES } from '../../seo/_data'

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

export function generateStaticParams() { return COUNTRIES.map((c) => ({ country: c.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params
  const c = COUNTRIES.find((x) => x.slug === country)
  if (!c) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/ayurveda-jobs/${country}`,
    title: `Ayurveda Jobs in ${c.label}`,
    description: `Latest Ayurveda doctor + therapist + wellness jobs in ${c.label}. BAMS, MD/MS, Panchakarma roles.`,
    keywords: [`ayurveda jobs ${c.label}`, `BAMS ${c.label}`, `panchakarma jobs ${c.label}`],
  })
}

async function fetchJobs(countryLabel: string): Promise<Array<{ id: string; title: string; clinic: string | null; location: string | null; specialty: string | null }>> {
  try {
    const r = await fetch(`${API_INTERNAL}/jobs?status=active&q=${encodeURIComponent(countryLabel)}&limit=100`, { cache: 'no-store' })
    if (!r.ok) return []
    const data = await r.json() as { jobs?: unknown[] } | unknown[]
    const list = Array.isArray(data) ? data : (data.jobs ?? [])
    return list as Array<{ id: string; title: string; clinic: string | null; location: string | null; specialty: string | null }>
  } catch { return [] }
}

export default async function CountryJobsPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const c = COUNTRIES.find((x) => x.slug === country)
  if (!c) notFound()
  const jobs = await fetchJobs(c.label)
  const lowData = jobs.length < 2
  return (
    <>
      {lowData && <meta name="robots" content="noindex,follow" />}
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Jobs in {c.label}</h1>
          <p className="text-white/85 mt-3">{jobs.length} active opening{jobs.length === 1 ? '' : 's'}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jobs.length === 0 && <li className="text-sm text-gray-500 col-span-2 bg-white border border-gray-100 rounded-card p-8 text-center">No openings right now — <Link href="/jobs/alerts" className="text-kerala-700 hover:underline">set a job alert</Link>.</li>}
          {jobs.map((j) => (
            <li key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <Link href={`/jobs/${j.id}`} className="font-semibold text-ink hover:text-kerala-700 inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> {j.title}</Link>
              <p className="text-[11px] text-gray-600 mt-0.5">{j.specialty ?? '—'} · {j.clinic ?? '—'} · {j.location ?? '—'}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
