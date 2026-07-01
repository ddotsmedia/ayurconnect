import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Stethoscope, ChevronRight } from 'lucide-react'
import { DoctorCard, type DoctorCardData } from '@ayurconnect/ui'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph, physicianLd } from '@/lib/seo'

// Kerala-classical specialties + a few common English aliases.
const SPECS: Record<string, { name: string; searchTerm: string; blurb: string }> = {
  panchakarma:     { name: 'Panchakarma',        searchTerm: 'Panchakarma',        blurb: 'Five classical purification therapies — Vamana, Virechana, Basti, Nasya, Raktamokshana.' },
  kayachikitsa:    { name: 'Kayachikitsa',       searchTerm: 'Kayachikitsa',       blurb: 'General internal medicine — the largest branch of Ayurveda.' },
  'prasuti-tantra':{ name: 'Prasuti Tantra',     searchTerm: 'Prasuti Tantra',     blurb: 'Obstetrics + gynaecology — women\'s health, pregnancy care.' },
  kaumarbhritya:   { name: 'Kaumarbhritya',      searchTerm: 'Kaumarbhritya',      blurb: 'Paediatrics — child health, growth, immunity.' },
  shalya:          { name: 'Shalya Tantra',      searchTerm: 'Shalya',             blurb: 'Surgery — kshara-sutra, agni-karma, wound care.' },
  shalakya:        { name: 'Shalakya Tantra',    searchTerm: 'Shalakya',           blurb: 'ENT + ophthalmology.' },
  manasika:        { name: 'Manasika Roga',      searchTerm: 'Manasika',           blurb: 'Mental health, stress, insomnia — Ayurveda\'s take on the mind.' },
  rasashastra:     { name: 'Rasashastra',        searchTerm: 'Rasashastra',        blurb: 'Ayurvedic pharmacy — mineral + metallic preparations.' },
  wellness:        { name: 'Wellness',           searchTerm: 'Wellness',           blurb: 'Preventive Ayurveda + lifestyle medicine.' },
  'pcos-treatment':{ name: 'PCOS Treatment',     searchTerm: 'PCOS',               blurb: 'Ayurvedic PCOS/PCOD management — Shatavari, Ashoka, Panchakarma protocols.' },
  'diabetes':      { name: 'Diabetes Management',searchTerm: 'diabetes',           blurb: 'Prameha protocols — herbal + Panchakarma approach for Type 2.' },
  'back-pain':     { name: 'Back Pain / Sciatica',searchTerm: 'back pain',         blurb: 'Kati Basti, Pizhichil, Kizhi for Kati Shoola + Gridhrasi.' },
}

export function generateStaticParams() {
  return Object.keys(SPECS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = SPECS[slug]
  if (!s) return { title: 'Specialty not found — AyurConnect' }
  return {
    title: `${s.name} Doctors — Verified Ayurveda Specialists | AyurConnect`,
    description: `Verified ${s.name} Ayurveda doctors on AyurConnect. ${s.blurb} BAMS + MD specialists across Kerala, UAE, and abroad.`,
    alternates: { canonical: `/doctors/specialization/${slug}` },
    keywords: [`${s.name} doctor`, `${s.name} ayurveda`, `${s.name} specialist`, `${s.name} kerala`, `${s.name} panchakarma`],
  }
}

async function fetchBySpec(term: string): Promise<DoctorCardData[]> {
  try {
    const r = await fetch(`${API}/doctors?specialization=${encodeURIComponent(term)}&limit=60`, { next: { revalidate: 1800 } })
    if (!r.ok) { logServerFetchError('spec-list', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { doctors?: DoctorCardData[] }
    return d.doctors ?? []
  } catch (err) { logServerFetchError('spec-list', err); return [] }
}

export default async function SpecPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = SPECS[slug]
  if (!s) notFound()
  const doctors = await fetchBySpec(s.searchTerm)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',           url: 'https://ayurconnect.com' },
      { name: 'Doctors',        url: 'https://ayurconnect.com/doctors' },
      { name: 'Specialization', url: 'https://ayurconnect.com/doctors/specialization' },
      { name: s.name,           url: `https://ayurconnect.com/doctors/specialization/${slug}` },
    ]),
    ...doctors.slice(0, 10).map((d) => physicianLd({
      id: d.id, name: d.name, specialization: d.specialization, district: d.district,
      photoUrl: d.photoUrl ?? null, profile: d.profile ?? null, qualification: d.qualification ?? null,
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
            <span>{s.name}</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight inline-flex items-center gap-2"><Stethoscope className="w-7 h-7 md:w-9 md:h-9" /> {s.name} Doctors</h1>
          <p className="text-white/85 mt-3 max-w-2xl">{s.blurb}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {doctors.length < 2 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center max-w-2xl mx-auto">
            <p className="font-serif text-xl text-amber-900">We&rsquo;re adding more {s.name} specialists.</p>
            <p className="text-sm text-amber-800 mt-2">Are you a verified {s.name} doctor? Register free to be listed here.</p>
            <Link href="/doctors/register" className="inline-block mt-4 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Register as doctor</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-5"><strong className="text-ink">{doctors.length}</strong> verified {s.name} specialists on AyurConnect</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </>
        )}

        <section className="mt-10 bg-cream border border-kerala-100 rounded-card p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Other specializations</p>
          <div className="flex flex-wrap gap-1.5 justify-center text-xs">
            {Object.entries(SPECS).filter(([k]) => k !== slug).slice(0, 10).map(([k, v]) => (
              <Link key={k} href={`/doctors/specialization/${k}`} className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">{v.name}</Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
