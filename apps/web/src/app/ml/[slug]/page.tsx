import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, MessageCircle, Stethoscope, ArrowLeft } from 'lucide-react'
import { ML_PAGES, ML_PAGES as ALL, getMlPage } from '../_data'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return ML_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getMlPage(slug)
  if (!p) return { title: 'Page not found' }
  const alternates: Metadata['alternates'] = {
    canonical: `/ml/${p.slug}`,
    languages: { 'ml-IN': `/ml/${p.slug}` },
  }
  if (p.relatedEnSlug) alternates.languages = { ...alternates.languages, 'en-IN': `/conditions/${p.relatedEnSlug}` }
  return {
    title: `${p.titleMl}`,
    description: p.metaDescMl,
    alternates,
    keywords: [p.conditionMl, p.conditionEn, 'ആയുർവേദം മലയാളം', `${p.conditionEn} ayurveda malayalam`, 'AyurConnect'],
    openGraph: {
      title: p.titleMl,
      description: p.metaDescMl,
      locale: 'ml_IN',
      url: `/ml/${p.slug}`,
      type: 'article',
    },
    other: {
      'robots': 'max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
  }
}

export default async function MlSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getMlPage(slug)
  if (!p) notFound()

  const today = new Date().toISOString().slice(0, 10)

  const medicalWebPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: p.titleMl,
    description: p.metaDescMl,
    inLanguage: 'ml',
    url: `https://ayurconnect.com/ml/${p.slug}`,
    about: {
      '@type': 'MedicalCondition',
      name: p.conditionEn,
      alternateName: p.conditionMl,
    },
    audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    lastReviewed: today,
    medicalAudience: 'Patients seeking Ayurvedic treatment information in Malayalam',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
  }
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'ml',
    mainEntity: p.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a, inLanguage: 'ml' },
    })),
  }
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: 'https://ayurconnect.com' },
    { name: 'മലയാളം', url: 'https://ayurconnect.com/ml' },
    { name: p.titleMl, url: `https://ayurconnect.com/ml/${p.slug}` },
  ])
  const jsonLd = ldGraph(medicalWebPage, faqPage, breadcrumb)

  const related = ALL.filter((x) => x.slug !== p.slug).slice(0, 4)

  return (
    <div lang="ml">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-kerala-700" lang="en">Home</Link>
          <span className="mx-1">›</span>
          <Link href="/ml" className="hover:text-kerala-700">മലയാളം</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-700">{p.titleMl}</span>
        </nav>

        <header className="mb-6">
          <h1 className="font-serif text-3xl md:text-4xl text-kerala-800 leading-tight">{p.titleMl}</h1>
          <p className="mt-2 text-sm text-gray-600" lang="en">{p.titleEn}</p>
        </header>

        <p className="text-gray-800 leading-relaxed text-lg" data-speakable>{p.leadParagraph}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/doctors" className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-md">
            <Stethoscope className="w-4 h-4" /> ഡോക്ടറെ കണ്ടെത്തുക
          </Link>
          <Link href="/online-consultation" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-50 text-sm font-semibold rounded-md">
            ഓൺലൈൻ കൺസൾട്ടേഷൻ
          </Link>
          <a href={`https://wa.me/971509379212?text=${encodeURIComponent('Hi AyurConnect, I have a question about: ' + p.titleEn)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-md">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        <div className="mt-10 space-y-8">
          {p.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-serif text-2xl text-kerala-700 leading-snug mb-3">{s.heading}</h2>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">{s.body}</div>
            </section>
          ))}
        </div>

        <section className="mt-12 border-t pt-8">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">പതിവ് ചോദ്യങ്ങൾ (FAQ)</h2>
          <div className="space-y-4">
            {p.faqs.map((f, i) => (
              <details key={i} className="bg-cream/50 border border-gray-100 rounded-card p-4 open:bg-white">
                <summary className="font-semibold text-kerala-800 cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-gray-800 leading-relaxed" data-speakable>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {p.relatedEnSlug && (
          <section className="mt-10 p-4 bg-kerala-50 border border-kerala-100 rounded-card">
            <p className="text-sm text-kerala-800" lang="en">
              English version: <Link href={`/conditions/${p.relatedEnSlug}`} className="font-semibold underline">Read about {p.conditionEn} in English →</Link>
            </p>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-serif text-xl text-kerala-700 mb-3">മറ്റ് ലേഖനങ്ങൾ</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/ml/${r.slug}`} className="block bg-white border border-gray-100 rounded-card p-3 hover:border-kerala-300">
                  <p className="font-semibold text-kerala-700 text-sm">{r.titleMl}</p>
                  <p className="text-xs text-gray-500 mt-0.5" lang="en">{r.titleEn}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 text-sm">
          <Link href="/ml" className="inline-flex items-center gap-1 text-kerala-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> എല്ലാ മലയാളം ലേഖനങ്ങളും
          </Link>
        </div>
      </article>
    </div>
  )
}
