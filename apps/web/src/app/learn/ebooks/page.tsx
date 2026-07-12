import type { Metadata } from 'next'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { EBOOKS } from './_data'
import { EXTERNAL_BOOKS } from './_external'
import { EbooksLibraryClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path: '/learn/ebooks',
  title: 'Free Ayurveda E-Books — Classical Texts PDF Library',
  description: 'Download free Ayurveda e-books — Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakash, Sahasrayogam, and 80+ classical texts in PDF.',
  keywords: ['ayurveda ebooks', 'charaka samhita pdf', 'ashtanga hridayam pdf', 'sushruta samhita pdf', 'bhavaprakash pdf', 'sahasrayogam', 'free ayurveda books', 'classical ayurveda texts pdf'],
})

const CAT_LABEL: Record<string, string> = { textbook: 'Textbook', reference: 'Reference', clinical_guide: 'Clinical Guide', research: 'Research', classical_text: 'Classical Text', modern: 'Modern' }
const LANG_LABEL: Record<string, string> = { en: 'English', ml: 'Malayalam', sa: 'Sanskrit', hi: 'Hindi', 'en-ml': 'English+Malayalam', 'sa-en': 'Sanskrit+English' }

export default function EbooksLibraryPage() {
  // CollectionPage + ItemList schema — one ListItem per external book.
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Ayurveda E-Books Library',
    description: 'Free classical Ayurveda texts — Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakash, Sahasrayogam, and more.',
    url: 'https://ayurconnect.com/learn/ebooks',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: EXTERNAL_BOOKS.length + EBOOKS.length,
      itemListElement: EXTERNAL_BOOKS.map((b, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'Book', name: b.title, inLanguage: b.language, url: b.url },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda E-Books Library — Free Classical Texts</h1>
          <p className="text-white/85 mt-3">{EXTERNAL_BOOKS.length}+ classical Ayurveda texts in PDF format. All texts are in the public domain.</p>
        </div>
      </GradientHero>

      {/* AyurConnect curated internal ebooks (existing — study guides + annotated classical texts) */}
      <section className="container mx-auto px-4 pt-10 max-w-5xl">
        <h2 className="font-serif text-2xl text-kerala-700 mb-4">AyurConnect curated study guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EBOOKS.map((e) => (
            <Link key={e.slug} href={`/learn/ebooks/${e.slug}`} className="bg-white border border-gray-100 rounded-card p-4 hover:border-kerala-300 block transition-colors">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{CAT_LABEL[e.category]}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{LANG_LABEL[e.language]}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-300 text-amber-900 rounded font-bold">FREE</span>
              </div>
              <h3 className="font-serif text-base text-ink inline-flex items-start gap-2"><BookOpen className="w-4 h-4 text-kerala-700 mt-1 flex-shrink-0" /> {e.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{e.author}</p>
              <p className="text-xs text-gray-700 mt-2 line-clamp-3">{e.description}</p>
              <p className="text-[10px] text-gray-500 mt-2">{e.pages} pages · {e.fileSize} · PDF</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Public-domain classical texts (external Google Drive links) */}
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <h2 className="font-serif text-2xl text-kerala-700 mb-1">Classical texts — public-domain PDFs</h2>
        <p className="text-xs text-gray-600 mb-4">{EXTERNAL_BOOKS.length} texts. Search by title and filter by category or language. Every download opens Google Drive in a new tab.</p>
        <EbooksLibraryClient books={EXTERNAL_BOOKS} />
      </section>

      <section className="container mx-auto px-4 pb-10 max-w-3xl">
        <div className="p-4 rounded-card bg-amber-50 border border-amber-100 text-xs text-amber-900 leading-relaxed">
          <strong>Editorial note.</strong> These are classical Ayurveda texts in the public domain, hosted on Google Drive.
          AyurConnect curates and organises these resources for easy access — no PDFs are hosted on our servers. If you are
          the copyright holder and want a link removed, please <Link href="/feedback" className="underline font-semibold">contact us via feedback</Link>.
        </div>
      </section>
    </>
  )
}
