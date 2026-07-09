import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, Download } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { EBOOKS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/ebooks',
  title: 'Ayurveda E-Books — Free Download',
  description: 'Classical Ayurveda texts (Charaka, Ashtanga Hridayam, Sahasrayogam) + modern study guides + practical manuals. Free downloads.',
  keywords: ['ayurveda ebooks', 'charaka samhita pdf', 'ashtanga hridayam pdf', 'sahasrayogam', 'free ayurveda books'],
})

const CAT_LABEL: Record<string, string> = { textbook: 'Textbook', reference: 'Reference', clinical_guide: 'Clinical Guide', research: 'Research', classical_text: 'Classical Text', modern: 'Modern' }
const LANG_LABEL: Record<string, string> = { en: 'English', ml: 'Malayalam', sa: 'Sanskrit', hi: 'Hindi', 'en-ml': 'English+Malayalam', 'sa-en': 'Sanskrit+English' }

export default function EbooksListPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda E-Books Library</h1>
          <p className="text-white/85 mt-3">{EBOOKS.length} free downloadable resources · classical texts + study guides + clinical manuals</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EBOOKS.map((e) => (
            <Link key={e.slug} href={`/learn/ebooks/${e.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{CAT_LABEL[e.category]}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{LANG_LABEL[e.language]}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-300 text-amber-900 rounded font-bold">FREE</span>
              </div>
              <h2 className="font-serif text-base text-ink inline-flex items-start gap-2"><BookOpen className="w-4 h-4 text-kerala-700 mt-1 flex-shrink-0" /> {e.title}</h2>
              <p className="text-xs text-gray-600 mt-1">{e.author}</p>
              <p className="text-xs text-gray-700 mt-2 line-clamp-3">{e.description}</p>
              <p className="text-[10px] text-gray-500 mt-2">{e.pages} pages · {e.fileSize} · PDF</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
