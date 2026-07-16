import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, Briefcase, Sparkles } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Ayurveda Talent Directory — Find BAMS/MD Candidates',
  description: 'Searchable directory of verified Ayurveda job seekers — BAMS/MD doctors, Panchakarma therapists, licensed practitioners across Kerala + UAE. Contact directly.',
  alternates: { canonical: '/jobs/talent' },
  keywords: ['ayurveda talent', 'hire BAMS doctor', 'ayurveda job seeker', 'panchakarma therapist hiring', 'ayurveda recruitment'],
  openGraph: { title: 'Ayurveda Talent Directory', description: 'Find verified BAMS / MD Ayurveda candidates.', url: '/jobs/talent', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

type CandidatePublic = {
  id:                    string
  fullName:              string
  headline:              string | null
  highestQualification:  string | null
  specializations:       string[]
  totalExperience:       number
  currentLocation:       string | null
  preferredLocations:    string[]
  availability:          string
  currentLicenses:       string[]
  openToLocum:           boolean
  openToTelemedicine:    boolean
  willingToRelocate:     boolean
}

async function fetchTalent(qs: Record<string, string>): Promise<{ candidates: CandidatePublic[]; total: number }> {
  const q = new URLSearchParams(qs).toString()
  try {
    const rsp = await fetch(`${API}/jobs-portal/talent${q ? '?' + q : ''}`, { next: { revalidate: 60 } })
    if (!rsp.ok) return { candidates: [], total: 0 }
    return (await rsp.json()) as { candidates: CandidatePublic[]; total: number }
  } catch { return { candidates: [], total: 0 } }
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const initials = parts.map((p) => p[0] || '').join('').toUpperCase()
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kerala-600 to-kerala-800 text-white font-bold flex items-center justify-center flex-shrink-0">
      {initials || '?'}
    </div>
  )
}

export default async function TalentPage({ searchParams }: { searchParams: Promise<{ q?: string; specialization?: string; location?: string; license?: string; availability?: string; page?: string }> }) {
  const params = await searchParams
  const qs: Record<string, string> = {}
  for (const k of ['q','specialization','location','license','availability','page'] as const) {
    if (params[k]) qs[k] = String(params[k])
  }
  const { candidates, total } = await fetchTalent(qs)

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',              url: 'https://ayurconnect.com' },
      { name: 'Jobs',              url: 'https://ayurconnect.com/jobs' },
      { name: 'Talent Directory',  url: 'https://ayurconnect.com/jobs/talent' },
    ]),
    { '@type': 'CollectionPage', name: 'Ayurveda Talent Directory', numberOfItems: total, url: 'https://ayurconnect.com/jobs/talent' },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Users className="w-3 h-3" /> Opt-in only · privacy-first
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Ayurveda Talent Directory</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Verified BAMS &amp; MD Ayurveda candidates who chose to be listed publicly.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search + filters (GET form so URL is bookmarkable + crawlable) */}
        <form className="bg-white border border-gray-100 rounded-card p-4 shadow-card mb-5 grid grid-cols-1 md:grid-cols-5 gap-3" action="/jobs/talent" method="get">
          <input name="q" defaultValue={params.q ?? ''} placeholder="Search name or headline…" className="md:col-span-2 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" />
          <select name="specialization" defaultValue={params.specialization ?? ''} className="px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            <option value="">Any specialization</option>
            {['Kayachikitsa','Panchakarma','Prasuti Tantra & Stree Roga','Kaumarabhritya','Shalya Tantra','Shalakya Tantra','Rasashastra'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="license" defaultValue={params.license ?? ''} className="px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            <option value="">Any license</option>
            <option value="KSMC">KSMC</option><option value="DHA">DHA (Dubai)</option><option value="DOH">DOH (Abu Dhabi)</option><option value="MOH">MOH (Sharjah)</option><option value="QCHP">QCHP (Qatar)</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded">Search</button>
        </form>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {[
            { k: 'availability', v: 'immediate', label: 'Available immediately' },
            { k: 'license',      v: 'DHA',       label: 'DHA licensed' },
            { k: 'license',      v: 'KSMC',      label: 'KSMC registered' },
            { k: 'specialization', v: 'Panchakarma', label: 'Panchakarma' },
          ].map((c) => {
            const nq = new URLSearchParams(qs); nq.set(c.k, c.v)
            const active = qs[c.k] === c.v
            return (
              <Link key={`${c.k}-${c.v}`} href={`/jobs/talent?${nq.toString()}`} className={`text-xs px-2.5 py-1 rounded-full border ${active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}>
                {c.label}
              </Link>
            )
          })}
        </div>

        <p className="text-sm text-gray-600 mb-3">Showing <strong>{candidates.length}</strong> of <strong>{total}</strong> public candidates</p>

        {candidates.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center">
            <p className="text-sm text-amber-900">No public candidates match your filters. Talent directory is opt-in — most candidates keep their profiles private and apply directly to jobs.</p>
            <Link href="/jobs" className="mt-3 inline-block text-sm text-kerala-700 underline">Browse job listings instead →</Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidates.map((c) => (
              <li key={c.id}>
                <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:border-kerala-300">
                  <div className="flex items-start gap-3">
                    <Initials name={c.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg text-kerala-800 leading-tight">{c.fullName}</p>
                      {c.headline && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{c.headline}</p>}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.highestQualification && <span className="text-[10px] px-2 py-0.5 rounded border bg-kerala-50 text-kerala-800 border-kerala-200 font-semibold">{c.highestQualification}</span>}
                        {c.availability === 'immediate' && <span className="text-[10px] px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">Available now</span>}
                        {c.openToLocum && <span className="text-[10px] px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">Locum</span>}
                        {c.openToTelemedicine && <span className="text-[10px] px-2 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200">Teleconsult</span>}
                        {c.currentLicenses.slice(0, 3).map((l) => <span key={l} className="text-[10px] px-2 py-0.5 rounded border bg-purple-50 text-purple-800 border-purple-200">{l}</span>)}
                      </div>

                      {c.specializations.length > 0 && (
                        <p className="text-xs text-gray-700 mt-2 inline-flex items-baseline gap-1"><Briefcase className="w-3 h-3 mt-0.5" /> {c.specializations.slice(0, 3).join(' · ')}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-1 inline-flex items-baseline gap-1">
                        <MapPin className="w-3 h-3 mt-0.5" /> {c.currentLocation || 'Location not shared'} · {c.totalExperience} yr exp
                      </p>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 bg-cream border border-gray-100 rounded-card p-5 text-center">
          <Sparkles className="w-6 h-6 text-kerala-700 mx-auto" />
          <p className="font-serif text-lg text-ink mt-2">Are you a job seeker?</p>
          <p className="text-sm text-gray-700 mt-1">Turn on public profile in your candidate settings to be discoverable here.</p>
          <Link href="/jobs/profile" className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">List yourself →</Link>
        </div>
      </section>
    </>
  )
}
