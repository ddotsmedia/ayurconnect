import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Building2, MapPin, Globe, Briefcase, ShieldCheck } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { pageMetadata } from '../../../../lib/seo'

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

type Data = {
  employer: { id: string; companyName: string; companyNameMl: string | null; slug: string; companyType: string; description: string; website: string | null; city: string | null; country: string; isVerified: boolean; logo: string | null; banner: string | null; accreditations: string[]; employeeCount: string | null; foundedYear: number | null }
  activeJobs: Array<{ id: string; title: string; location: string | null; type: string; specialty: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null; featured: boolean; urgent: boolean; createdAt: string }>
}

async function fetchEmployer(slug: string): Promise<Data | null> {
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/employers/${slug}`, { cache: 'no-store' })
    if (!r.ok) return null
    return r.json() as Promise<Data>
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const d = await fetchEmployer(slug)
  if (!d) return { title: 'Not found' }
  return pageMetadata({
    path: `/jobs/careers/${slug}`,
    title: `Careers at ${d.employer.companyName} | AyurConnect Jobs`,
    description: d.employer.description.slice(0, 160) || `Open positions at ${d.employer.companyName}.`,
    keywords: [`careers at ${d.employer.companyName}`, 'ayurveda jobs', 'ayurveda hospital hiring'],
  })
}

export default async function EmployerCareersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = await fetchEmployer(slug)
  if (!d) notFound()
  const e = d.employer
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Building2 className="w-3 h-3" /> {e.companyType.replace(/_/g, ' ')}</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{e.companyName}</h1>
          {e.companyNameMl && <p className="text-white/80 mt-1 font-serif text-xl" dir="auto">{e.companyNameMl}</p>}
          <p className="text-white/85 mt-3 inline-flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {e.city ?? ''} {e.country} · {e.isVerified ? '✓ Verified' : 'Listed'}</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        {e.description && <p className="text-gray-800 whitespace-pre-line">{e.description}</p>}
        {e.website && <p className="text-sm"><a href={e.website} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {e.website}</a></p>}
        {e.accreditations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {e.accreditations.map((a) => <span key={a} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full"><ShieldCheck className="w-3 h-3" /> {a}</span>)}
          </div>
        )}

        <h2 className="font-serif text-xl text-ink mt-8">Open positions ({d.activeJobs.length})</h2>
        <ul className="space-y-2">
          {d.activeJobs.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-6 text-center">No open positions right now.</li>}
          {d.activeJobs.map((j) => (
            <li key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Link href={`/jobs/${j.id}`} className="font-semibold text-ink hover:text-kerala-700 inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> {j.title}</Link>
                  <p className="text-[11px] text-gray-600">{j.specialty ?? '—'} · {j.location ?? '—'} · {j.type}</p>
                </div>
                <div className="text-right">
                  {j.urgent && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded mr-1">URGENT</span>}
                  {j.featured && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">FEATURED</span>}
                  {j.salaryMin && <p className="text-xs text-gray-700 mt-1">{j.currency} {j.salaryMin.toLocaleString()}{j.salaryMax ? `–${j.salaryMax.toLocaleString()}` : ''}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
