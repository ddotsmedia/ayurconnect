import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MapPin, ChevronRight, Stethoscope } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

// Country-level Kerala-trained doctor directory. Data-gated: noindex when
// <3 doctors. generateStaticParams covers the 15 priority diaspora markets;
// any other country still renders if someone deep-links, but stays noindex.

const COUNTRY_MAP: Record<string, { code: string; name: string; flag: string }> = {
  uae:           { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  'saudi-arabia':{ code: 'SA', name: 'Saudi Arabia',         flag: '🇸🇦' },
  qatar:         { code: 'QA', name: 'Qatar',                flag: '🇶🇦' },
  oman:          { code: 'OM', name: 'Oman',                 flag: '🇴🇲' },
  kuwait:        { code: 'KW', name: 'Kuwait',               flag: '🇰🇼' },
  bahrain:       { code: 'BH', name: 'Bahrain',              flag: '🇧🇭' },
  uk:            { code: 'GB', name: 'United Kingdom',       flag: '🇬🇧' },
  germany:       { code: 'DE', name: 'Germany',              flag: '🇩🇪' },
  usa:           { code: 'US', name: 'United States',        flag: '🇺🇸' },
  canada:        { code: 'CA', name: 'Canada',               flag: '🇨🇦' },
  australia:     { code: 'AU', name: 'Australia',            flag: '🇦🇺' },
  malaysia:      { code: 'MY', name: 'Malaysia',             flag: '🇲🇾' },
  singapore:     { code: 'SG', name: 'Singapore',            flag: '🇸🇬' },
  russia:        { code: 'RU', name: 'Russia',               flag: '🇷🇺' },
  japan:         { code: 'JP', name: 'Japan',                flag: '🇯🇵' },
}

type DoctorBrief = { id: string; slug?: string | null; name: string; specialization?: string | null; district?: string | null; experienceYears?: number | null; homeDistrict?: string | null; college?: string | null }

export function generateStaticParams() {
  return Object.keys(COUNTRY_MAP).map((country) => ({ country }))
}

async function fetchDoctorsInCountry(code: string): Promise<DoctorBrief[]> {
  try {
    const r = await fetch(`${API}/doctors?country=${code}&limit=48`, { cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json() as { doctors?: DoctorBrief[]; items?: DoctorBrief[] }
    return j.doctors ?? j.items ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params
  const c = COUNTRY_MAP[country]
  if (!c) return { title: 'Not found', robots: { index: false, follow: false } }
  const doctors = await fetchDoctorsInCountry(c.code)
  const meta = pageMetadata({
    path:        `/doctors/${country}`,
    title:       `Kerala-Trained Ayurveda Doctors in ${c.name} — Teleconsult & In-Person | AyurConnect`,
    description: `Kerala-trained Ayurveda doctors practicing in ${c.name}. Verified credentials (KSMC + local body), teleconsult availability, Malayalam-speaking practitioners. Free directory.`,
    keywords:    [`ayurveda doctor ${c.name.toLowerCase()}`, `kerala ayurveda ${c.name.toLowerCase()}`, `BAMS ${c.name.toLowerCase()}`, 'malayali ayurveda doctor', 'kerala-trained ayurveda diaspora'],
  })
  // Data-gate: noindex if < 3 listed doctors (per spec).
  if (doctors.length < 3) meta.robots = { index: false, follow: true, googleBot: { index: false, follow: true } }
  return meta
}

export default async function CountryDoctorsPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const c = COUNTRY_MAP[country]
  if (!c) notFound()
  const doctors = await fetchDoctorsInCountry(c.code)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',                 url: '/' },
      { name: 'Ayurveda Doctors',     url: '/doctors' },
      { name: c.name,                 url: `/doctors/${country}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type':    'ItemList',
      itemListElement: doctors.slice(0, 20).map((d, i) => ({
        '@type':    'ListItem',
        position:   i + 1,
        url:        `https://ayurconnect.com/doctors/${d.slug ?? d.id}`,
        name:       d.name,
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> Kerala-trained · {c.name}
          </span>
          <div className="text-5xl mb-3">{c.flag}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Kerala-Trained Ayurveda Doctors in {c.name}</h1>
          <p className="mt-5 text-lg text-white/85">
            {doctors.length > 0 ? `${doctors.length} verified BAMS / MD-Ayurveda practitioner${doctors.length === 1 ? '' : 's'} ` : 'Verified BAMS / MD-Ayurveda practitioners '}
            offering teleconsult + in-person care for the {c.name} diaspora.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        {doctors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
            <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700">No Kerala-trained doctors are listed in {c.name} yet.</p>
            <p className="text-xs text-gray-500 mt-1">Are you a Kerala-trained Ayurveda doctor practicing in {c.name}? <Link href="/doctors/register" className="text-kerala-700 hover:underline">Register free.</Link></p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((d) => (
              <li key={d.id}>
                <Link href={`/doctors/${d.slug ?? d.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                  <h3 className="font-serif text-lg text-ink">{d.name}</h3>
                  <p className="text-xs text-muted mt-0.5">
                    {d.specialization ?? 'General'}{d.experienceYears ? ` · ${d.experienceYears} yrs` : ''}
                    {d.district && ` · ${d.district}`}
                  </p>
                  {d.homeDistrict && <p className="text-[11px] text-kerala-700 mt-1">Kerala roots: {d.homeDistrict}{d.college ? ` · ${d.college}` : ''}</p>}
                  <span className="mt-2 inline-flex items-center text-xs text-kerala-700">View profile <ChevronRight className="w-3 h-3" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-10 bg-cream border border-gray-100 rounded-card p-6 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">Are you a Kerala-trained Ayurveda doctor in {c.name}?</h2>
          <p className="text-sm text-gray-700 mb-4">Join Kerala&apos;s most comprehensive Ayurveda directory — verified, free, profile in 5 minutes.</p>
          <Link href={`/doctors/register?country=${c.code}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Register free <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </section>
    </>
  )
}
