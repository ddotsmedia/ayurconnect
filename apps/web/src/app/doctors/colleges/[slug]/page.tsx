import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GraduationCap, MapPin, ChevronRight } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { DoctorCard, type DoctorCardData } from '@ayurconnect/ui'
import { breadcrumbLd, ldGraph } from '@/lib/seo'
import { COLLEGES, getCollege } from '../_data'

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return COLLEGES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCollege(slug)
  if (!c) return { title: 'College not found' }
  return {
    title: `${c.name} Alumni — Verified Ayurveda Doctors`,
    description: `Doctors who graduated from ${c.name}, ${c.location}. Verified BAMS / MD Ayurveda alumni on AyurConnect.`,
    alternates: { canonical: `/doctors/colleges/${c.slug}` },
    keywords: [`${c.name} alumni`, `${c.shortName} alumni`, `${c.name} ayurveda graduates`, `BAMS from ${c.shortName}`],
  }
}

async function fetchAlumni(slug: string): Promise<DoctorCardData[]> {
  try {
    const r = await fetch(`${API}/doctors?collegeSlug=${encodeURIComponent(slug)}&limit=60`, { next: { revalidate: 1800 } })
    if (!r.ok) { logServerFetchError('college-alumni', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { doctors?: DoctorCardData[] }
    return d.doctors ?? []
  } catch (err) { logServerFetchError('college-alumni', err); return [] }
}

export default async function CollegeAlumniPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCollege(slug)
  if (!c) notFound()
  const doctors = await fetchAlumni(slug)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',    url: 'https://ayurconnect.com' },
      { name: 'Doctors', url: 'https://ayurconnect.com/doctors' },
      { name: 'Colleges', url: 'https://ayurconnect.com/doctors/colleges' },
      { name: c.shortName, url: `https://ayurconnect.com/doctors/colleges/${c.slug}` },
    ]),
    {
      '@type': 'CollegeOrUniversity',
      name: c.name,
      address: { '@type': 'PostalAddress', addressLocality: c.location.split(',')[0]?.trim(), addressRegion: c.location.split(',')[1]?.trim() ?? 'Kerala', addressCountry: 'IN' },
      foundingDate: String(c.established),
      url: `https://ayurconnect.com/doctors/colleges/${c.slug}`,
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-hero-green text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="text-xs text-white/70 mb-2">
            <Link href="/doctors" className="hover:text-white">Doctors</Link>
            <ChevronRight className="inline w-3 h-3 mx-1" />
            <Link href="/doctors/colleges" className="hover:text-white">Colleges</Link>
            <ChevronRight className="inline w-3 h-3 mx-1" />
            <span>{c.shortName}</span>
          </nav>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <GraduationCap className="w-3 h-3" /> Alumni network
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{c.name} Alumni</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {c.location} · Est. {c.established}</p>
          <p className="text-white/80 mt-3 max-w-2xl">{c.summary}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <ul className="flex flex-wrap gap-2 mb-6">
          {c.highlights.map((h) => (
            <li key={h} className="text-xs px-3 py-1 bg-kerala-50 border border-kerala-200 rounded-full text-kerala-800">{h}</li>
          ))}
        </ul>

        {doctors.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center max-w-2xl mx-auto">
            <p className="font-serif text-xl text-amber-900">We&rsquo;re adding more doctors from {c.shortName}.</p>
            <p className="text-sm text-amber-800 mt-2">Are you an alumnus? Register your profile to be listed here.</p>
            <Link href="/doctors/register" className="inline-block mt-4 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Register as doctor</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-5"><strong className="text-ink">{doctors.length}</strong> verified alumni from {c.shortName} on AyurConnect</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </>
        )}

        <section className="mt-12 bg-cream border border-kerala-100 rounded-card p-5 text-center">
          <p className="font-serif text-lg text-kerala-800">More college alumni pages</p>
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center text-xs">
            {COLLEGES.filter((x) => x.slug !== c.slug).slice(0, 8).map((x) => (
              <Link key={x.slug} href={`/doctors/colleges/${x.slug}`} className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">{x.shortName}</Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
