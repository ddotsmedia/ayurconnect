import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, MapPin, Phone, Award } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { HospitalFilterBar } from './_filter-bar'
import { CountryPills, type CountryCount } from '../../components/country-pills'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'

type Hospital = {
  id: string
  name: string
  type: string
  country: string | null
  state: string | null
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  profile: string | null
  contact: string | null
  address: string | null
  establishedYear: number | null
  services: string[]
  reviews?: Array<{ rating: number }>
}

const TYPE_LABEL: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  panchakarma: 'Panchakarma centre',
  pharmacy: 'Pharmacy',
  wellness: 'Wellness resort',
}

async function fetchHospitals(params: URLSearchParams): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Hospital[]
  } catch { return [] }
}

async function fetchHospitalCountries(): Promise<CountryCount[]> {
  try {
    const res = await fetch(`${API}/hospitals/countries`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as CountryCount[]
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Hospitals Near Me — Verified Kerala + UAE Centres | AyurConnect',
  description: 'Find Ayurveda hospitals near you — AYUSH-certified, NABH-accredited hospitals and Panchakarma centres across Kerala, India, and UAE. Filter by country, state, and district.',
  keywords: [
    ...AYURVEDA_KEYWORDS.primary,
    ...AYURVEDA_KEYWORDS.treatments,
    ...AYURVEDA_KEYWORDS.geographic,
    ...AYURVEDA_KEYWORDS.signals,
  ],
}

type SearchParams = {
  country?:  string
  state?:    string
  district?: string
  type?:     string
  verified?: string
  q?:        string
}

export default async function HospitalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  // Build the API query string from the filters in the URL
  const apiParams = new URLSearchParams()
  if (sp.country)  apiParams.set('country',  sp.country)
  if (sp.state)    apiParams.set('state',    sp.state)
  if (sp.district) apiParams.set('district', sp.district)
  if (sp.type)     apiParams.set('type',     sp.type)
  if (sp.verified) apiParams.set('verified', sp.verified)
  if (sp.q)        apiParams.set('q',        sp.q)

  const [hospitals, countries] = await Promise.all([fetchHospitals(apiParams), fetchHospitalCountries()])
  const totalFilters = Array.from(apiParams.keys()).filter((k) => k !== 'country' || apiParams.get('country') !== 'IN').length

  return (
    <>
      <GradientHero variant="hospital" size="md">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl text-white">Hospitals & Wellness Centres</h1>
          <p className="text-white/70 mt-3">
            Government Ayurveda hospitals, classical Panchakarma centres, AYUSH-certified
            wellness resorts. Cross-checked against CCIM and AYUSH registries.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        {/* Country pills — always-visible distribution so users don't have to
            open the country dropdown to see which countries we cover. */}
        <CountryPills
          countries={countries}
          currentCountry={sp.country}
          basePath="/hospitals"
          preserveParams={sp as Record<string, string | undefined>}
        />

        <HospitalFilterBar
          initialCountry={sp.country ?? 'IN'}
          initialState={sp.state ?? ''}
          initialDistrict={sp.district ?? ''}
          initialType={sp.type ?? ''}
          initialVerified={sp.verified ?? ''}
          initialQ={sp.q ?? ''}
        />

        <p className="text-sm text-muted mb-6">
          <strong className="text-ink">{hospitals.length}</strong> centre{hospitals.length === 1 ? '' : 's'}
          {totalFilters > 0 && ' matching your filters'}
        </p>

        {hospitals.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <p className="text-muted">{totalFilters > 0 ? 'No hospitals match these filters. Try widening your search.' : 'No hospitals listed yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hospitals.map((h) => {
              const ratings = h.reviews?.map((r) => r.rating) ?? []
              const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null
              return (
                <article key={h.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-ink leading-snug">{h.name}</h3>
                      <p className="text-sm text-muted mt-0.5">
                        {TYPE_LABEL[h.type] ?? h.type}
                        {h.establishedYear && <> · est. {h.establishedYear}</>}
                      </p>
                    </div>
                    {h.ccimVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" /> CCIM
                      </span>
                    )}
                  </div>

                  {h.profile && <p className="text-sm text-gray-700 line-clamp-3">{h.profile}</p>}

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {h.ayushCertified && <span className="px-2 py-0.5 text-[11px] bg-amber-50 text-amber-800 rounded-full border border-amber-200">AYUSH certified</span>}
                    {h.panchakarma   && <span className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">Panchakarma</span>}
                    {h.nabh          && <span className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-800 rounded-full border border-blue-200">NABH accredited</span>}
                  </div>

                  {h.services?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {h.services.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[11px] bg-gray-100 text-gray-600 rounded">{s}</span>
                      ))}
                      {h.services.length > 4 && <span className="text-[11px] text-gray-400">+{h.services.length - 4} more</span>}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {h.district}
                        {h.state && h.state !== h.district ? `, ${h.state}` : ''}
                        {h.country && h.country !== 'IN' ? ` · ${h.country}` : ''}
                      </span>
                    </div>
                    {avgRating != null && (
                      <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-gold-500" /> {avgRating} ({ratings.length})</div>
                    )}
                    {h.contact && (
                      <div className="flex items-center gap-1.5 col-span-2 text-gray-500"><Phone className="w-3.5 h-3.5" /> {h.contact}</div>
                    )}
                    {h.address && (
                      <div className="col-span-2 text-gray-500 text-xs truncate">{h.address}</div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center text-sm text-muted">
          <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link> to leave a review or save a hospital.
        </div>

        <section className="mt-10 bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 text-white rounded-card p-6 md:p-8 shadow-cardLg">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-80">For hospital owners</p>
              <h2 className="font-serif text-2xl md:text-3xl mt-1">List your Ayurveda hospital on AyurConnect — free</h2>
              <p className="text-sm text-white/85 mt-2 max-w-2xl">Professional profile, patient inquiries, WhatsApp integration, verification badges, analytics. No setup fee, no contract.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/hospitals/register" className="px-5 py-3 bg-white text-kerala-800 hover:bg-white/90 rounded font-bold text-sm text-center">Register free →</Link>
              <Link href="/hospitals/why-join"  className="px-5 py-2 border border-white/40 text-white hover:bg-white/10 rounded text-sm text-center">Why join?</Link>
            </div>
          </div>
        </section>

        {/* Intro + FAQ — adds body-copy context Google's ranking algorithm rewards.
            'ayurveda hospital near me' is a heavy long-tail query these help capture. */}
        <section className="mt-12 container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl text-kerala-700 mb-3">Find Ayurveda Hospitals Near You</h2>
          <p className="text-gray-700 leading-relaxed">
            Search verified Ayurveda hospitals across all 14 Kerala districts, the UAE, and international locations.
            Every listed hospital carries valid AYUSH licensing (or the local equivalent), and NABH-accredited centres
            are flagged where applicable. Filter by country, state, district, hospital type (government / private /
            Panchakarma resort / wellness centre), or search by name to compare treatments, doctors, and facilities.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Regional specialty pages:{' '}
            <Link href="/ayurveda-hospitals-kerala" className="text-kerala-700 font-semibold hover:underline">Kerala hospitals</Link>{' '}·{' '}
            <Link href="/ayurveda-hospitals-dubai" className="text-kerala-700 font-semibold hover:underline">Dubai hospitals</Link>{' '}·{' '}
            <Link href="/hospitals/compare" className="text-kerala-700 font-semibold hover:underline">Compare 2-3 side-by-side</Link>.
          </p>

          <h2 className="font-serif text-2xl text-kerala-700 mt-8 mb-3">Frequently asked</h2>
          <div className="space-y-2">
            {[
              { q: 'How do I find Ayurveda hospitals near me?', a: 'Use the country + district filters above. Set your country first (India / UAE / other), then narrow by district. Every hospital card shows location, type (government / private / Panchakarma / wellness), and a link to view treatments + doctors on staff.' },
              { q: 'What certifications should an Ayurveda hospital have?', a: 'India: valid AYUSH state licence + preferably NABH-Ayurveda accreditation (voluntary but signals clinical quality). UAE: DHA or DOH or MOH licensing depending on the emirate, with individual practitioners holding valid DHA/MOH permits.' },
              { q: 'Are government Ayurveda hospitals good in Kerala?', a: 'Yes — all 14 Kerala districts have Government Ayurveda Hospitals under the Directorate of Ayurveda. Treatment fees are heavily subsidised and physicians are BAMS/MD-qualified. Waiting times can be longer than private hospitals, especially for Panchakarma.' },
              { q: 'Can international patients visit Kerala for Ayurveda treatment?', a: 'Yes — several Kerala hospitals hold medical-tourism accreditation. See our Heal in Kerala guide at /heal-in-kerala for hospital packages, visa help, and 15-country diaspora resources.' },
            ].map((f) => (
              <details key={f.q} className="bg-white border border-gray-100 rounded-card p-4">
                <summary className="font-semibold text-ink cursor-pointer">{f.q}</summary>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: [
              { q: 'How do I find Ayurveda hospitals near me?', a: 'Use the country + district filters. Set your country (India / UAE / other), then narrow by district.' },
              { q: 'What certifications should an Ayurveda hospital have?', a: 'India: AYUSH state licence + NABH-Ayurveda accreditation (voluntary). UAE: DHA, DOH, or MOH licensing.' },
              { q: 'Are government Ayurveda hospitals good in Kerala?', a: 'Yes — all 14 districts have Government Ayurveda Hospitals with heavily subsidised fees.' },
              { q: 'Can international patients visit Kerala for Ayurveda treatment?', a: 'Yes — several Kerala hospitals hold medical-tourism accreditation via the Heal in Kerala programme.' },
            ].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }) }} />
        </section>
      </div>
    </>
  )
}
