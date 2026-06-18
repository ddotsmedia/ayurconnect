import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { FileText, CheckCircle2 } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { SUBJECTS, YEAR_LABEL, type BamsYear } from '../_subjects'
import { PAPERS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/question-papers',
  title: 'BAMS Previous Year Question Papers — Solved | AyurConnect',
  description: 'Previous year + model BAMS question papers across all subjects and universities (KUHS, RGUHS, MUHS). Solved + unsolved. Free download.',
  keywords: ['BAMS question paper', 'KUHS BAMS paper', 'BAMS previous year', 'BAMS model paper', 'BAMS solved paper'],
})

export default async function PapersListPage({ searchParams }: { searchParams: Promise<{ year?: BamsYear; subject?: string; solved?: string }> }) {
  const { year, subject, solved } = await searchParams
  let items = PAPERS
  if (year) items = items.filter((p) => p.year === year)
  if (subject) items = items.filter((p) => p.subjectSlug === subject)
  if (solved === 'true') items = items.filter((p) => p.isSolved)

  const years: (BamsYear | 'all')[] = ['all', '1st_year', '2nd_year', '3rd_year', 'final_year']

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">BAMS Question Papers</h1>
          <p className="text-white/85 mt-3">Previous year + model papers. {PAPERS.filter((p) => p.isSolved).length} solved, {PAPERS.filter((p) => !p.isSolved).length} unsolved.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <nav className="flex flex-wrap gap-1.5 mb-4">
          {years.map((y) => {
            const active = y === 'all' ? !year : year === y
            const href = y === 'all' ? '/learn/question-papers' : `/learn/question-papers?year=${y}`
            return <Link key={y} href={href} className={'px-3 py-1.5 rounded-full text-xs font-semibold border ' + (active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>{y === 'all' ? 'All' : YEAR_LABEL[y as BamsYear]}</Link>
          })}
          <Link href="/learn/question-papers?solved=true" className={'px-3 py-1.5 rounded-full text-xs font-semibold border ' + (solved === 'true' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-emerald-800 border-emerald-300')}>Solved only</Link>
        </nav>
        <ul className="space-y-2">
          {items.map((p) => {
            const subj = SUBJECTS.find((s) => s.slug === p.subjectSlug)
            return (
              <li key={p.slug} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <Link href={`/learn/question-papers/${p.slug}`} className="font-semibold text-ink hover:text-kerala-700 inline-flex items-center gap-2"><FileText className="w-4 h-4 text-kerala-700" /> {p.title}</Link>
                    <p className="text-[11px] text-gray-600 mt-0.5">{subj?.name ?? p.subjectSlug} · {YEAR_LABEL[p.year]} · {p.university} · {p.examMonth ?? ''} {p.examYear}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{p.paperType}</span>
                    {p.isSolved && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Solved</span>}
                  </div>
                </div>
              </li>
            )
          })}
          {items.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No papers match these filters.</li>}
        </ul>
      </section>
    </>
  )
}
