import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, ChevronRight } from 'lucide-react'
import { DoctorCard, type DoctorCardData } from '@ayurconnect/ui'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph, physicianLd } from '@/lib/seo'

const DISTRICTS: Record<string, { name: string; state: string }> = {
  thiruvananthapuram: { name: 'Thiruvananthapuram', state: 'Kerala' },
  kollam:             { name: 'Kollam',             state: 'Kerala' },
  pathanamthitta:     { name: 'Pathanamthitta',     state: 'Kerala' },
  alappuzha:          { name: 'Alappuzha',          state: 'Kerala' },
  kottayam:           { name: 'Kottayam',           state: 'Kerala' },
  idukki:             { name: 'Idukki',             state: 'Kerala' },
  ernakulam:          { name: 'Ernakulam',          state: 'Kerala' },
  thrissur:           { name: 'Thrissur',           state: 'Kerala' },
  palakkad:           { name: 'Palakkad',           state: 'Kerala' },
  malappuram:         { name: 'Malappuram',         state: 'Kerala' },
  kozhikode:          { name: 'Kozhikode',          state: 'Kerala' },
  wayanad:            { name: 'Wayanad',            state: 'Kerala' },
  kannur:             { name: 'Kannur',             state: 'Kerala' },
  kasaragod:          { name: 'Kasaragod',          state: 'Kerala' },
  dubai:              { name: 'Dubai',              state: 'UAE' },
  'abu-dhabi':        { name: 'Abu Dhabi',          state: 'UAE' },
  sharjah:            { name: 'Sharjah',            state: 'UAE' },
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return Object.keys(DISTRICTS).map((district) => ({ district }))
}

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const { district } = await params
  const d = DISTRICTS[district]
  if (!d) return { title: 'Location not found' }
  return {
    title: `Ayurveda Doctors in ${d.name} — Verified BAMS/MD Specialists`,
    description: `Verified Ayurveda doctors in ${d.name}, ${d.state}. BAMS + MD Ayurveda specialists — Panchakarma, Kayachikitsa, and more. Book via WhatsApp.`,
    alternates: { canonical: `/doctors/location/${district}` },
    keywords: [`ayurveda doctor ${d.name}`, `ayurveda ${d.name.toLowerCase()}`, `BAMS ${d.name.toLowerCase()}`, `panchakarma ${d.name.toLowerCase()}`],
  }
}

async function fetchByDistrict(district: string): Promise<DoctorCardData[]> {
  try {
    const r = await fetch(`${API}/doctors?district=${encodeURIComponent(district)}&limit=60`, { next: { revalidate: 1800 } })
    if (!r.ok) { logServerFetchError('district-list', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { doctors?: DoctorCardData[] }
    return d.doctors ?? []
  } catch (err) { logServerFetchError('district-list', err); return [] }
}

export default async function LocationPage({ params }: { params: Promise<{ district: string }> }) {
  const { district } = await params
  const d = DISTRICTS[district]
  if (!d) notFound()
  const doctors = await fetchByDistrict(d.name)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',     url: 'https://ayurconnect.com' },
      { name: 'Doctors',  url: 'https://ayurconnect.com/doctors' },
      { name: 'Location', url: 'https://ayurconnect.com/doctors/location' },
      { name: d.name,     url: `https://ayurconnect.com/doctors/location/${district}` },
    ]),
    ...doctors.slice(0, 10).map((doc) => physicianLd({
      id: doc.id, name: doc.name, specialization: doc.specialization, district: doc.district,
      photoUrl: doc.photoUrl ?? null, profile: doc.profile ?? null, qualification: doc.qualification ?? null,
    })),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-hero-green text-white py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="text-xs text-white/70 mb-2">
            <Link href="/doctors" className="hover:text-white">Doctors</Link>
            <ChevronRight className="inline w-3 h-3 mx-1" />
            <span>{d.name}</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight inline-flex items-center gap-2"><MapPin className="w-7 h-7 md:w-9 md:h-9" /> Ayurveda Doctors in {d.name}</h1>
          <p className="text-white/85 mt-3 max-w-2xl">Verified BAMS + MD Ayurveda specialists in {d.name}, {d.state}. Panchakarma, Kayachikitsa, Shalya, and more.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {doctors.length < 2 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center max-w-2xl mx-auto">
            <p className="font-serif text-xl text-amber-900">We&rsquo;re adding more doctors in {d.name}.</p>
            <p className="text-sm text-amber-800 mt-2">Are you a verified Ayurveda doctor practising in {d.name}? Register free to be listed here.</p>
            <Link href="/doctors/register" className="inline-block mt-4 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Register as doctor</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-5"><strong className="text-ink">{doctors.length}</strong> verified Ayurveda doctors in {d.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
            </div>
          </>
        )}

        <section className="mt-10 bg-cream border border-kerala-100 rounded-card p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Other locations</p>
          <div className="flex flex-wrap gap-1.5 justify-center text-xs">
            {Object.entries(DISTRICTS).filter(([k]) => k !== district).slice(0, 12).map(([k, v]) => (
              <Link key={k} href={`/doctors/location/${k}`} className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">{v.name}</Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
