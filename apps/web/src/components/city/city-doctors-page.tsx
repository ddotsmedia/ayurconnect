// Shared renderer for UAE city landing pages (Dubai / Abu Dhabi / Sharjah).
// Each emirate has its own /<city>/ayurveda-doctors page that imports this
// and supplies its own data. Doing it this way keeps the per-emirate page
// thin (~30 lines) while sharing the SEO + structured-data + layout work.

import Link from 'next/link'
import type { Metadata } from 'next'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import { ShieldCheck, Video, Languages, MapPin, ChevronRight, Stethoscope } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { breadcrumbLd, ldGraph, organizationLd, SITE_URL, faqLd } from '../../lib/seo'

export type CityConfig = {
  slug: string                 // 'dubai' | 'abu-dhabi' | 'sharjah'
  cityName: string             // 'Dubai' | 'Abu Dhabi' | 'Sharjah'
  countryCode: string          // 'AE'
  countryName: string          // 'United Arab Emirates'
  licenseAuthority: string     // 'DHA' | 'DOH' | 'MOH'
  intro: string                // 1-2 sentence pitch for hero
  whyHere: Array<{ title: string; body: string }>  // 4-6 reasons
  faq: Array<{ q: string; a: string }>             // 4-6 city-specific FAQs
  treatments?: Array<{ slug: string; name: string; brief: string }>  // featured local treatments
}

type DoctorListResponse = {
  doctors: DoctorCardData[]
  pagination: { total: number }
}

async function fetchCityDoctors(country: string): Promise<{ doctors: DoctorCardData[]; total: number }> {
  try {
    const res = await fetch(`${API}/doctors?country=${country}&online=true&limit=9&sort=rating`, { next: { revalidate: 600 } })
    if (!res.ok) return { doctors: [], total: 0 }
    const data = (await res.json()) as DoctorListResponse
    return { doctors: data.doctors ?? [], total: data.pagination.total }
  } catch { return { doctors: [], total: 0 } }
}

export function buildCityMetadata(cfg: CityConfig): Metadata {
  const title = `Ayurveda Doctors in ${cfg.cityName} (${cfg.licenseAuthority} Licensed) | AyurConnect`
  const description = `Find ${cfg.licenseAuthority}-licensed Kerala Ayurveda doctors in ${cfg.cityName} for online video consultation. CCIM-verified practitioners speaking Malayalam, English, Hindi, and Arabic. Same-week slots, transparent fees.`
  return {
    title,
    description,
    alternates: { canonical: `/${cfg.slug}/ayurveda-doctors` },
    openGraph: {
      title, description,
      url: `${SITE_URL}/${cfg.slug}/ayurveda-doctors`,
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CityDoctorsPage({ cfg }: { cfg: CityConfig }) {
  const { doctors, total } = await fetchCityDoctors(cfg.countryCode)

  const jsonLd = ldGraph(
    organizationLd(),
    breadcrumbLd([
      { name: 'Home',                 url: '/' },
      { name: cfg.cityName,           url: `/${cfg.slug}` },
      { name: 'Ayurveda Doctors',     url: `/${cfg.slug}/ayurveda-doctors` },
    ]),
    faqLd(cfg.faq),
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/${cfg.slug}/ayurveda-doctors#service`,
      name: `AyurConnect Ayurveda Consultations — ${cfg.cityName}`,
      description: `Online Ayurveda consultations available to patients in ${cfg.cityName}, ${cfg.countryName}. CCIM-verified Kerala Ayurveda doctors fluent in Malayalam, English, Hindi, and Arabic.`,
      url: `${SITE_URL}/${cfg.slug}/ayurveda-doctors`,
      areaServed: { '@type': 'City', name: cfg.cityName, addressCountry: cfg.countryCode },
      medicalSpecialty: ['Ayurveda', 'Panchakarma', 'Traditional Indian Medicine'],
      parentOrganization: { '@id': `${SITE_URL}#org` },
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> {cfg.cityName}, {cfg.countryName}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Ayurveda Doctors in <span className="text-gold-400">{cfg.cityName}</span>
          </h1>
          <p className="mt-5 text-lg text-white/85">{cfg.intro}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={`/doctors?country=${cfg.countryCode}&online=true`} className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find a doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/online-consultation" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              How online consultations work
            </Link>
          </div>
        </div>
      </GradientHero>

      {/* QUICK INTRO PARAGRAPH — direct-answer format for AI / featured snippets */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-base text-gray-800 leading-relaxed">
          <strong>How to find an Ayurveda doctor in {cfg.cityName}?</strong> Most patients in {cfg.cityName} consult
          Kerala-trained Ayurveda practitioners through video calls — every doctor listed on AyurConnect is
          cross-checked against the Central Council of Indian Medicine (CCIM) register and speaks Malayalam,
          English, and Hindi. Local in-person clinics in {cfg.cityName} require a {cfg.licenseAuthority} licence;
          our directory complements them with international-grade video care for diaspora and locals alike.
        </p>
      </section>

      {/* DOCTORS GRID */}
      <section className="bg-cream py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">
                {total > 0 ? `${total} Ayurveda doctor${total === 1 ? '' : 's'} available to ${cfg.cityName}` : `Ayurveda doctors serving ${cfg.cityName}`}
              </h2>
              <p className="text-muted text-sm mt-1">All CCIM-verified · same-week video slots · prescription delivered to your dashboard.</p>
            </div>
            <Link href={`/doctors?country=${cfg.countryCode}&online=true`} className="text-sm text-kerala-700 font-semibold hover:underline inline-flex items-center gap-1">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </header>
          {doctors.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-card">
              <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted">No doctors filtered to {cfg.countryName} yet — every CCIM-verified Kerala doctor offers video consultations to {cfg.cityName} patients.</p>
              <Link href={`/doctors?online=true`} className="inline-flex items-center gap-1 mt-3 text-sm text-kerala-700 font-semibold hover:underline">
                Browse all online doctors →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}
        </div>
      </section>

      {/* WHY HERE — Schema-org friendly bullets */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 text-center mb-8">Why {cfg.cityName} patients choose AyurConnect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cfg.whyHere.map((w) => (
            <article key={w.title} className="p-5 bg-white border border-gray-100 rounded-card shadow-card">
              <h3 className="font-serif text-lg text-ink mb-2">{w.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{w.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TREATMENTS — optional cluster links */}
      {cfg.treatments && cfg.treatments.length > 0 && (
        <section className="bg-cream py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 text-center mb-8">Popular Ayurveda treatments for {cfg.cityName} patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cfg.treatments.map((t) => (
                <Link key={t.slug} href={`/treatments/${t.slug}`} className="p-5 bg-white border border-gray-100 rounded-card shadow-card hover:shadow-cardLg transition-shadow">
                  <h3 className="font-serif text-lg text-kerala-700">{t.name}</h3>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-3">{t.brief}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 font-semibold">Learn more <ChevronRight className="w-3 h-3" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-white border border-gray-100 rounded-card">
            <ShieldCheck className="w-6 h-6 text-kerala-700 mx-auto" />
            <p className="text-xs text-muted mt-2">CCIM-verified only</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-card">
            <Video className="w-6 h-6 text-kerala-700 mx-auto" />
            <p className="text-xs text-muted mt-2">End-to-end encrypted</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-card">
            <Languages className="w-6 h-6 text-kerala-700 mx-auto" />
            <p className="text-xs text-muted mt-2">EN · ML · HI · AR</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-card">
            <MapPin className="w-6 h-6 text-kerala-700 mx-auto" />
            <p className="text-xs text-muted mt-2">Serving {cfg.cityName}</p>
          </div>
        </div>
      </section>

      {/* FAQ — schema emitted in jsonLd above */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 text-center mb-8">Frequently asked questions — {cfg.cityName}</h2>
        <div className="space-y-3">
          {cfg.faq.map((f) => (
            <details key={f.q} className="group p-5 bg-white rounded-card border border-gray-100 shadow-card">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{f.q}</h3>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 mt-1" />
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-kerala-700 py-12 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl">Ready to consult an Ayurveda doctor in {cfg.cityName}?</h2>
          <p className="mt-3 text-white/85">CCIM-verified, video-first, prescription emailed within minutes of the consult ending.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/doctors?country=${cfg.countryCode}&online=true`} className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find a doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/971554485169?text=Hi%2C%20please%20connect%20me%20with%20an%20Ayurveda%20doctor%20for%20online%20consultation." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              Request a doctor on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
