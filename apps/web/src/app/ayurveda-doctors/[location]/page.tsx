import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MapPin, ChevronRight, Stethoscope } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
]
const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah']

const ALL_LOCATIONS = [...KERALA_DISTRICTS, ...UAE_CITIES]

type DoctorBrief = { id: string; slug?: string | null; name: string; specialization?: string | null; district?: string | null; city?: string | null; experienceYears?: number | null }

const slugToLocation = (slug: string): string | null => {
  const lower = slug.toLowerCase()
  return ALL_LOCATIONS.find((loc) => loc.toLowerCase().replace(/\s+/g, '-') === lower) ?? null
}
const locationToSlug = (loc: string) => loc.toLowerCase().replace(/\s+/g, '-')

export async function generateStaticParams() {
  return ALL_LOCATIONS.map((loc) => ({ location: locationToSlug(loc) }))
}

async function fetchDoctorsAt(location: string): Promise<DoctorBrief[]> {
  const isUAE = UAE_CITIES.includes(location)
  const qp = new URLSearchParams()
  if (isUAE) { qp.set('country', 'AE'); qp.set('city', location) }
  else { qp.set('district', location) }
  qp.set('limit', '24')
  try {
    const r = await fetch(`${API}/doctors?${qp.toString()}`, { cache: 'no-store' })
    if (!r.ok) return []
    const data = (await r.json()) as { doctors?: DoctorBrief[]; items?: DoctorBrief[] }
    return data.doctors ?? data.items ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location: slug } = await params
  const loc = slugToLocation(slug)
  if (!loc) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMetadata({
    path: `/ayurveda-doctors/${slug}`,
    title:       `Ayurveda Doctors in ${loc} | Verified BAMS Doctors | AyurConnect`,
    description: `Find verified Ayurveda doctors in ${loc}. 500+ BAMS and MD practitioners across Kerala available for online and in-person consultation. CCIM cross-checked.`,
    keywords:    ['ayurveda doctors', loc, 'BAMS', 'Kerala', 'online consultation'],
  })
}

export default async function LocationDoctorsPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params
  const loc = slugToLocation(slug)
  if (!loc) notFound()
  const isUAE = UAE_CITIES.includes(loc)
  const doctors = await fetchDoctorsAt(loc)
  const count = doctors.length

  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',             url: '/' },
    { name: 'Ayurveda Doctors', url: '/doctors' },
    { name: loc,                url: `/ayurveda-doctors/${slug}` },
  ]))

  const queryFilter = isUAE ? `country=AE&city=${encodeURIComponent(loc)}` : `district=${encodeURIComponent(loc)}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> {isUAE ? 'UAE Ayurveda directory' : 'Kerala Ayurveda directory'}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Ayurveda Doctors in {loc}
          </h1>
          <p className="mt-5 text-lg text-white/80">
            {count > 0 ? `${count} verified BAMS practitioner${count === 1 ? '' : 's'} ` : 'Verified BAMS practitioners '}
            available for {isUAE ? 'online consultation from Kerala' : 'online and in-person consultation'} in {loc}.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        {doctors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
            <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700">No doctors are currently listed in {loc}.</p>
            <p className="text-xs text-gray-500 mt-1">New BAMS practitioners are onboarded weekly. Browse the full directory or use AI Doctor Match.</p>
            <div className="mt-5 flex justify-center gap-2 flex-wrap">
              <Link href="/doctors" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">Browse all doctors</Link>
              <Link href="/doctor-match" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded text-sm hover:bg-gray-50">Try AI Doctor Match</Link>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((d) => (
              <li key={d.id}>
                <Link href={`/doctors/${d.slug ?? d.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                  <h3 className="font-serif text-lg text-ink">{d.name}</h3>
                  <p className="text-xs text-muted mt-1">
                    {d.specialization ?? 'General Practice'}{d.experienceYears ? ` · ${d.experienceYears} yrs` : ''}
                  </p>
                  <span className="mt-2 inline-flex items-center text-xs text-kerala-700">View profile <ChevronRight className="w-3 h-3" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-10 bg-cream border border-gray-100 rounded-card p-6 text-center">
          <h2 className="font-serif text-2xl text-ink mb-2">More from {loc}</h2>
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-4">
            Filter the full directory by sub-specialty, language, and availability.
          </p>
          <Link href={`/doctors?${queryFilter}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Open full directory for {loc} <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        <nav className="mt-10 text-center text-xs text-gray-500">
          <p className="mb-2">Other locations</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALL_LOCATIONS.filter((l) => l !== loc).slice(0, 12).map((l) => (
              <Link key={l} href={`/ayurveda-doctors/${locationToSlug(l)}`} className="px-2 py-0.5 bg-white border border-gray-200 rounded hover:border-kerala-300 hover:text-kerala-700">
                {l}
              </Link>
            ))}
          </div>
        </nav>
      </section>
    </>
  )
}
