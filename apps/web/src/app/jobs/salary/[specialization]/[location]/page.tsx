import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { IndianRupee, Briefcase, ArrowRight } from 'lucide-react'
import { pageMetadata } from '../../../../../lib/seo'
import { SPECIALIZATIONS, LOCATIONS, SALARY_BENCHMARKS } from '../../../seo/_data'

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return SPECIALIZATIONS.flatMap((s) => LOCATIONS.map((l) => ({ specialization: s.slug, location: l.slug })))
}

export async function generateMetadata({ params }: { params: Promise<{ specialization: string; location: string }> }): Promise<Metadata> {
  const { specialization, location } = await params
  const s = SPECIALIZATIONS.find((x) => x.slug === specialization)
  const l = LOCATIONS.find((x) => x.slug === location)
  if (!s || !l) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/salary/${specialization}/${location}`,
    title: `${s.label} Salary in ${l.label} — 2026 Guide`,
    description: `Average ${s.label} salary in ${l.label}: monthly range, top employers, demand trends. 2026 data.`,
    keywords: [`${s.label} salary ${l.label}`, `${s.label} pay ${l.label}`, `ayurveda salary ${l.label}`],
  })
}

export default async function SalaryPage({ params }: { params: Promise<{ specialization: string; location: string }> }) {
  const { specialization, location } = await params
  const s = SPECIALIZATIONS.find((x) => x.slug === specialization)
  const l = LOCATIONS.find((x) => x.slug === location)
  if (!s || !l) notFound()
  const bench = SALARY_BENCHMARKS[specialization]?.[location]
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{s.label} Salary in {l.label}</h1>
          <p className="text-white/85 mt-3">2026 monthly salary ranges, top employers, demand outlook.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl space-y-5">
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2"><IndianRupee className="w-5 h-5 text-kerala-700" /> Salary range</h2>
          {bench ? (
            <p className="mt-2 text-3xl font-serif text-kerala-700">{bench.currency} {bench.min.toLocaleString()} – {bench.max.toLocaleString()} <span className="text-base text-gray-500">/ month</span></p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">Benchmarks for {s.label} in {l.label} are being aggregated. Current listings are the best signal.</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Reference rates only. Actual offers vary by experience, clinic prestige, and visa support.</p>
        </article>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">Demand outlook</h2>
          <p className="text-sm text-gray-700 mt-1">{s.label} demand in {l.label} is driven by {l.label === 'Kerala' ? 'classical centres + medical-tourism inflow' : l.label === 'Dubai' || l.label === 'Abu Dhabi' ? 'expat Malayali population + wellness resorts + DHA-licensed clinics' : 'private wellness centres + diaspora-focused clinics'}. Roles with verified credentials + 3+ years experience command the upper end.</p>
        </article>

        <article className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 shadow-card text-center">
          <Briefcase className="w-7 h-7 text-kerala-700 mx-auto" />
          <h2 className="font-serif text-xl text-ink mt-2">See live {s.label} openings in {l.label}</h2>
          <Link href={`/jobs/${s.slug}-jobs/${l.slug}`} className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold">View jobs <ArrowRight className="w-3.5 h-3.5" /></Link>
        </article>
      </section>
    </>
  )
}
