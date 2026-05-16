import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Stethoscope, BookOpen, Sprout, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react'
import { CONDITIONS, getCondition } from '../_data/conditions'
import { breadcrumbLd, ldGraph, AYURVEDA_KEYWORDS } from '@/lib/seo'

export function generateStaticParams() {
  return CONDITIONS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCondition(slug)
  if (!c) return { title: 'Condition not found — AyurConnect' }
  // Per-condition keyword set: targeted core keywords + a slice of the
  // relevant category vocabulary. Tighter than the layout 'all' = better
  // weighting in Bing/Yandex/Baidu.
  const lowerTitle = c.title.toLowerCase()
  const keywords = Array.from(new Set([
    `ayurvedic treatment for ${lowerTitle}`,
    `ayurveda for ${lowerTitle}`,
    `${lowerTitle} ayurvedic medicine`,
    `${lowerTitle} herbal treatment`,
    `natural treatment for ${lowerTitle}`,
    `${lowerTitle} kerala ayurveda`,
    `online ayurvedic consultation for ${lowerTitle}`,
    `best ayurvedic doctor for ${lowerTitle}`,
    `${lowerTitle} ayurvedic doctor uae`,
    ...c.formulations.map((f) => f.name.toLowerCase()),
    ...(c.sanskrit ? [c.sanskrit.toLowerCase()] : []),
    ...AYURVEDA_KEYWORDS.primary.slice(0, 12),
    ...AYURVEDA_KEYWORDS.signals.slice(0, 8),
    'AyurConnect', 'AyurConnect Ayurveda', 'classical ayurveda',
  ]))
  return {
    title:       `${c.title} — Ayurvedic Treatment, Kerala + UAE | AyurConnect`,
    description: c.metaDescription,
    alternates:  { canonical: `/conditions/${c.slug}` },
    keywords,
    openGraph: {
      title:       `${c.title} — Ayurvedic Treatment`,
      description: c.ogSummary,
      url:         `/conditions/${c.slug}`,
      type:        'article',
    },
  }
}

// MedicalCondition schema.org structured data — helps Google understand
// the page as a clinical reference, not generic content marketing.
function conditionMedLd(c: NonNullable<ReturnType<typeof getCondition>>) {
  return {
    '@context': 'https://schema.org',
    '@type':    'MedicalCondition',
    '@id':      `https://ayurconnect.com/conditions/${c.slug}`,
    name:       c.title,
    alternateName: c.sanskrit,
    description: c.ogSummary,
    url:        `https://ayurconnect.com/conditions/${c.slug}`,
    relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Ayurveda' },
    possibleTreatment: c.formulations.map((f) => ({
      '@type': 'MedicalTherapy',
      name:    f.name,
      description: f.primaryUse,
    })),
  }
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCondition(slug)
  if (!c) notFound()

  // Combined JSON-LD: BreadcrumbList + MedicalCondition. One <script> tag.
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',       url: '/' },
      { name: 'Conditions', url: '/conditions' },
      { name: c.title,      url: `/conditions/${c.slug}` },
    ]),
    conditionMedLd(c),
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/conditions" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> Conditions
          </Link>
          {c.sanskrit && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
              {c.sanskrit}
            </span>
          )}
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{c.title}</h1>
          <p className="mt-5 text-lg text-white/80">{c.ogSummary}</p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link href="/conditions" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> All conditions
        </Link>

        {/* Dosha + prevalence header */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 mr-1">Dosha involved</span>
          {c.doshasInvolved.map((d) => (
            <span key={d} className="text-xs px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full capitalize">{d}</span>
          ))}
          {c.prevalenceNote && (
            <p className="text-xs text-gray-500 ml-auto">{c.prevalenceNote}</p>
          )}
        </div>

        {/* Body sections */}
        <article className="bg-white border border-gray-100 rounded-card p-7 shadow-card space-y-7">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-serif text-xl text-ink mb-2">{s.heading}</h2>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </article>

        {/* Formulations */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-kerala-700" /> Classical formulations
          </h2>
          <p className="text-xs text-muted mb-4">Selected by Ayurvedic Snehana / Shamana criteria. Always under a verified doctor&apos;s supervision — these are not over-the-counter recommendations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {c.formulations.map((f) => (
              <article key={f.name} className="bg-white border border-gray-100 rounded-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base text-ink">{f.name}</h3>
                  {f.sanskrit && <span className="text-xs text-kerala-700 font-serif">{f.sanskrit}</span>}
                </div>
                <p className="text-sm text-gray-700 mt-1">{f.primaryUse}</p>
                {f.classicalText && (
                  <p className="text-[11px] text-gray-500 mt-2 italic">— {f.classicalText}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Lifestyle */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2">
            <Sprout className="w-6 h-6 text-kerala-700" /> Lifestyle & Aahar-Vihar
          </h2>
          <ul className="bg-white border border-gray-100 rounded-card p-5 space-y-2.5 text-sm text-gray-800">
            {c.lifestyle.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-kerala-700 mt-0.5 flex-shrink-0">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Safety / disclaimer */}
        <section className="mt-10 p-5 bg-amber-50 border border-amber-100 rounded-card">
          <h2 className="text-xs uppercase tracking-wider text-amber-800 font-semibold mb-2 inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Important
          </h2>
          <p className="text-sm text-amber-900 leading-relaxed">
            This page is a structured Ayurvedic reference for patient education. It is <strong>not</strong> a substitute for individual clinical evaluation. Self-medication with Ayurvedic herbs and formulations — particularly Rasaushadhis (mineral preparations) — can cause harm without proper supervision. Always consult a verified BAMS doctor before starting treatment.
          </p>
        </section>

        {/* Related conditions */}
        {c.relatedConditions && c.relatedConditions.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-lg text-ink mb-3">Related conditions</h2>
            <div className="flex flex-wrap gap-2">
              {c.relatedConditions.map((slug) => {
                const r = getCondition(slug)
                if (!r) return null
                return (
                  <Link key={slug} href={`/conditions/${slug}`} className="text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-kerala-300 hover:bg-kerala-50">
                    {r.title}
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Doctor-match CTA */}
      <section className="bg-kerala-700 text-white py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Stethoscope className="w-10 h-10 text-amber-300 mx-auto mb-3" />
          <h2 className="font-serif text-2xl mb-2">Find a {c.title} specialist</h2>
          <p className="text-sm text-white/85 leading-relaxed mb-6">
            We&apos;ll match you with a verified BAMS doctor whose practice focuses on {c.recommendedSpecialty.replace(/-/g, ' ')}. Book an online consultation or visit in person across Kerala and UAE.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link
              href={`/doctor-match?condition=${c.slug}&specialty=${c.recommendedSpecialty}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-kerala-900 rounded text-sm font-semibold"
            >
              Match me with a doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/doctors?specialty=${c.recommendedSpecialty}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/40 text-white hover:bg-white/10 rounded text-sm font-semibold"
            >
              Browse specialists
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
