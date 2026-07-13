import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, Stethoscope } from 'lucide-react'
import { CATEGORIES, MEDICINES } from '../_data'
import { CategoryMedicineList } from '../_client'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = findCategory(slug)
  if (!cat) return { title: 'Category not found — AyurConnect' }
  const count = MEDICINES.filter((m) => m.category === slug).length
  const title = `${cat.name} — ${count} Classical Ayurvedic Medicines`
  const description = `${count} classical ${cat.name} formulations with Malayalam names, ingredients, dosage, anupana, and contraindications. ${cat.description}`
  return {
    title,
    description,
    alternates: { canonical: `/learn/medicines/${slug}` },
    keywords: [cat.name, `${cat.name} list`, `ayurvedic ${cat.name.toLowerCase()}`, 'kerala ayurveda', 'malayalam medicine names'],
    openGraph: { title, description, url: `/learn/medicines/${slug}`, type: 'article' },
    other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = findCategory(slug)
  if (!cat) notFound()
  const medicines = MEDICINES.filter((m) => m.category === slug)
  const related = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 4)

  const faqs = [
    {
      q: `What is ${cat.name} in Ayurveda?`,
      a: cat.description,
    },
    {
      q: `How many ${cat.name} medicines are described here?`,
      a: `${medicines.length} classical ${cat.name} formulations drawn from Sahasrayogam, Ashtanga Hridaya, Bhaishajya Ratnavali, and the Ayurvedic Formulary of India.`,
    },
    {
      q: `Can I take ${cat.name} without consulting a doctor?`,
      a: 'This library is educational only. Ayurvedic medicines should be prescribed by a qualified BAMS or MD Ayurveda practitioner who has assessed your prakriti, current condition, and any co-existing illnesses.',
    },
    {
      q: `Where can I buy authentic ${cat.name} formulations?`,
      a: 'Purchase only from AYUSH-licensed manufacturers with valid batch certification. Reputable brands include Kottakkal Arya Vaidya Sala, Nagarjuna, AVN, Vaidyaratnam, Sitaram Ayurveda, and Kerala government-registered pharmacies.',
    },
  ]

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',      url: 'https://ayurconnect.com' },
      { name: 'Learn',     url: 'https://ayurconnect.com/learn' },
      { name: 'Medicines', url: 'https://ayurconnect.com/learn/medicines' },
      { name: cat.name,    url: `https://ayurconnect.com/learn/medicines/${cat.slug}` },
    ]),
    {
      '@type': 'MedicalWebPage',
      name: `${cat.name} — Classical Ayurvedic Medicines`,
      description: cat.description,
      inLanguage: ['en', 'ml'],
      url: `https://ayurconnect.com/learn/medicines/${cat.slug}`,
      about: { '@type': 'MedicalTherapy', name: cat.name },
      audience: { '@type': 'MedicalAudience', audienceType: 'HealthProfessional' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@type': 'ItemList',
      name: `${cat.name} medicines`,
      numberOfItems: medicines.length,
      itemListElement: medicines.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.name,
        url: `https://ayurconnect.com/learn/medicines/${cat.slug}#${m.id}`,
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-hero-green text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="text-xs text-white/70 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1">›</span>
            <Link href="/learn" className="hover:text-white">Learn</Link>
            <span className="mx-1">›</span>
            <Link href="/learn/medicines" className="hover:text-white">Medicines</Link>
            <span className="mx-1">›</span>
            <span>{cat.name}</span>
          </nav>
          <p className="text-5xl mb-2" aria-hidden>{cat.icon}</p>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{cat.name} — {medicines.length} Classical Formulations</h1>
          <p className="mt-2 font-serif text-lg text-gold-200" lang="ml">{cat.nameMl}</p>
          <p className="mt-3 text-white/85 max-w-2xl" data-speakable>{cat.description}</p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <CategoryMedicineList medicines={medicines} categorySlug={cat.slug} />

        {/* FAQ */}
        <section className="mt-12 border-t pt-8">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">Frequently asked</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-cream/50 border border-gray-100 rounded-card p-4 open:bg-white">
                <summary className="font-semibold text-kerala-800 cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-gray-800 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related categories */}
        <section className="mt-12">
          <h2 className="font-serif text-xl text-kerala-700 mb-3">Explore related categories</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/learn/medicines/${r.slug}`} className="flex items-center gap-3 bg-white border border-gray-100 rounded-card p-3 hover:border-kerala-300">
                  <span className="text-2xl" aria-hidden>{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-kerala-700 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 truncate">{r.nameMl}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-10 flex flex-wrap gap-3 items-center justify-center">
          <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">
            <Stethoscope className="w-4 h-4" /> Find an Ayurveda doctor
          </Link>
          <Link href="/learn/medicines" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> All medicines
          </Link>
        </section>
      </article>
    </>
  )
}
