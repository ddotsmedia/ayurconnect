// Programmatic /conditions/[slug]/[city] — long-tail SEO landing pages
// targeting queries like "ayurvedic treatment for PCOS in Kochi" or
// "Ayurveda doctor for arthritis in Dubai".
//
// Each page reuses the parent condition's editorial content but reframes
// the hero + CTA geographically and surfaces matched local doctors.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero, DoctorCard, type DoctorCardData } from '@ayurconnect/ui'
import { BookOpen, Sprout, AlertTriangle, ChevronRight, ArrowLeft, MapPin, Stethoscope } from 'lucide-react'
import { CONDITIONS, getCondition } from '../../_data/conditions'
import { CITIES, getCity } from '../../_data/cities'
import { breadcrumbLd, ldGraph, AYURVEDA_KEYWORDS } from '@/lib/seo'
import { API_INTERNAL as API } from '@/lib/server-fetch'

export function generateStaticParams() {
  const params: Array<{ slug: string; city: string }> = []
  for (const c of CONDITIONS) {
    for (const ci of CITIES) params.push({ slug: c.slug, city: ci.slug })
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; city: string }> }): Promise<Metadata> {
  const { slug, city: citySlug } = await params
  const c = getCondition(slug); const ci = getCity(citySlug)
  if (!c || !ci) return { title: 'Not found — AyurConnect' }
  const lowerTitle = c.title.toLowerCase()
  const lowerCity  = ci.name.toLowerCase()
  // Compounded condition × city long-tail keyword set — these are the
  // money phrases ("ayurvedic treatment for PCOS in Kochi") for local SEO.
  const keywords = Array.from(new Set([
    `ayurvedic treatment for ${lowerTitle} in ${lowerCity}`,
    `${lowerTitle} ayurvedic doctor ${lowerCity}`,
    `best ayurvedic clinic for ${lowerTitle} in ${lowerCity}`,
    `online ayurvedic consultation for ${lowerTitle} ${lowerCity}`,
    `ayurveda for ${lowerTitle} ${lowerCity}`,
    `natural treatment for ${lowerTitle} in ${lowerCity}`,
    `herbal treatment for ${lowerTitle} ${lowerCity}`,
    `ayurvedic doctor ${lowerCity}`, `ayurvedic clinic ${lowerCity}`,
    `panchakarma ${lowerCity}`, `ayurveda ${lowerCity}`,
    `ayurvedic medicine ${lowerCity}`, `best ayurvedic doctor ${lowerCity}`,
    'verified ayurvedic doctors', 'kerala ayurveda doctor',
    `affordable ayurvedic treatment in ${lowerCity}`,
    `book ayurveda consultation from ${lowerCity}`,
    `AyurConnect ${ci.name}`, 'AyurConnect', 'AyurConnect Ayurveda',
    ...AYURVEDA_KEYWORDS.primary.slice(0, 8),
  ]))
  return {
    title:       `Ayurvedic Treatment for ${c.title} in ${ci.name}`,
    description: `Authentic Ayurvedic treatment for ${c.title} in ${ci.name}. Classical formulations, ${c.recommendedSpecialty.replace(/-/g, ' ')} specialists, transparent pricing. Verified doctors only.`.slice(0, 155),
    alternates:  { canonical: `/conditions/${c.slug}/${ci.slug}` },
    keywords,
    openGraph: {
      title:       `Ayurvedic Treatment for ${c.title} in ${ci.name}`,
      description: c.ogSummary,
      url:         `/conditions/${c.slug}/${ci.slug}`,
      type:        'article',
    },
  }
}

async function fetchLocalDoctors(state: string, country: string, specialty: string): Promise<DoctorCardData[]> {
  try {
    const url = `${API}/doctors?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&specialization=${encodeURIComponent(specialty)}&verified=true&limit=4`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { doctors?: DoctorCardData[] }
    return data.doctors ?? []
  } catch {
    return []
  }
}

export default async function ConditionInCityPage({ params }: { params: Promise<{ slug: string; city: string }> }) {
  const { slug, city: citySlug } = await params
  const c  = getCondition(slug)
  const ci = getCity(citySlug)
  if (!c || !ci) notFound()

  const doctors = await fetchLocalDoctors(ci.state, ci.country, c.recommendedSpecialty)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',       url: '/' },
      { name: 'Conditions', url: '/conditions' },
      { name: c.title,      url: `/conditions/${c.slug}` },
      { name: ci.name,      url: `/conditions/${c.slug}/${ci.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type':    'MedicalCondition',
      '@id':      `https://ayurconnect.com/conditions/${c.slug}/${ci.slug}`,
      name:       c.title,
      alternateName: c.sanskrit,
      description: c.ogSummary,
      url:        `https://ayurconnect.com/conditions/${c.slug}/${ci.slug}`,
      relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Ayurveda' },
      areaServed: { '@type': 'City', name: ci.name, address: { '@type': 'PostalAddress', addressCountry: ci.country } },
      possibleTreatment: c.formulations.map((f) => ({
        '@type': 'MedicalTherapy', name: f.name, description: f.primaryUse,
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href={`/conditions/${c.slug}`} className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> {c.title}
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> {ci.name}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">
            Ayurvedic treatment for <span className="text-gold-400">{c.title}</span> in {ci.name}
          </h1>
          <p className="mt-5 text-base text-white/80">{ci.hero}</p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link href={`/conditions/${c.slug}`} className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All {c.title} information
        </Link>

        {/* Local specialists — top of fold for high-intent local queries */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl text-ink mb-2 inline-flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-kerala-700" />
            {c.title} specialists in {ci.name}
          </h2>
          <p className="text-sm text-muted mb-5">
            Verified BAMS doctors with practice focus on {c.recommendedSpecialty.replace(/-/g, ' ')}.
            All consultations are video-based, with prescriptions delivered via WhatsApp + email.
          </p>
          {doctors.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-card p-6 text-center">
              <p className="text-sm text-gray-700">
                No matched specialists listed in {ci.name} yet —{' '}
                <Link href={`/doctor-match?condition=${c.slug}&specialty=${c.recommendedSpecialty}`} className="text-kerala-700 hover:underline font-semibold">
                  use doctor-match
                </Link>{' '}
                to be paired with a Kerala-trained specialist offering online consultations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}
          <div className="mt-4 text-right">
            <Link
              href={`/doctors?country=${ci.country}&state=${encodeURIComponent(ci.state)}&specialization=${encodeURIComponent(c.recommendedSpecialty)}`}
              className="text-sm text-kerala-700 hover:underline inline-flex items-center gap-1"
            >
              All {c.recommendedSpecialty.replace(/-/g, ' ')} doctors in {ci.name} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Reuse the condition's editorial body */}
        <article className="bg-white border border-gray-100 rounded-card p-7 shadow-card space-y-7">
          <header>
            <h2 className="font-serif text-xl text-ink">About {c.title}</h2>
            <p className="text-xs text-kerala-700 mt-1">{c.sanskrit}</p>
          </header>
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="font-serif text-lg text-ink mb-2">{s.heading}</h3>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </article>

        {/* Formulations */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-kerala-700" /> Classical formulations
          </h2>
          <p className="text-xs text-muted mb-4">
            Always prescribed and monitored by a verified BAMS doctor. Self-medication, particularly
            with Rasaushadhis (mineral preparations), can cause harm.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {c.formulations.map((f) => (
              <article key={f.name} className="bg-white border border-gray-100 rounded-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base text-ink">{f.name}</h3>
                  {f.sanskrit && <span className="text-xs text-kerala-700 font-serif">{f.sanskrit}</span>}
                </div>
                <p className="text-sm text-gray-700 mt-1">{f.primaryUse}</p>
                {f.classicalText && <p className="text-[11px] text-gray-500 mt-2 italic">— {f.classicalText}</p>}
              </article>
            ))}
          </div>
        </section>

        {/* Lifestyle */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2">
            <Sprout className="w-6 h-6 text-kerala-700" /> Lifestyle &amp; Aahar-Vihar
          </h2>
          <ul className="bg-white border border-gray-100 rounded-card p-5 space-y-2.5 text-sm text-gray-800">
            {c.lifestyle.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-kerala-700 mt-0.5 flex-shrink-0">•</span><span>{l}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Safety */}
        <section className="mt-10 p-5 bg-amber-50 border border-amber-100 rounded-card">
          <h2 className="text-xs uppercase tracking-wider text-amber-800 font-semibold mb-2 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Important
          </h2>
          <p className="text-sm text-amber-900 leading-relaxed">
            Patient outcomes for {c.title} are highly individual. Patterns of dosha-imbalance,
            duration of disease, and existing co-morbidities determine the right protocol — which is
            why every plan on AyurConnect is doctor-prescribed, never self-administered.
          </p>
        </section>

        {/* Other cities for this condition */}
        <section className="mt-10">
          <h2 className="font-serif text-lg text-ink mb-3">{c.title} treatment — other cities</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.filter((x) => x.slug !== ci.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/conditions/${c.slug}/${x.slug}`}
                className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-kerala-300 hover:bg-kerala-50"
              >
                {x.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="bg-kerala-700 text-white py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Stethoscope className="w-10 h-10 text-amber-300 mx-auto mb-3" />
          <h2 className="font-serif text-2xl mb-2">Book a {c.title} consultation from {ci.name}</h2>
          <p className="text-sm text-white/85 leading-relaxed mb-6">
            Match with a verified Kerala-trained BAMS specialist. Video consultation, classical
            prescriptions, and ongoing care — without leaving {ci.name}.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link
              href={`/doctor-match?condition=${c.slug}&specialty=${c.recommendedSpecialty}&city=${ci.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-kerala-900 rounded text-sm font-semibold"
            >
              Match me with a doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/doctors?country=${ci.country}&state=${encodeURIComponent(ci.state)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white hover:bg-white/10 rounded text-sm font-semibold"
            >
              All doctors in {ci.name}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
