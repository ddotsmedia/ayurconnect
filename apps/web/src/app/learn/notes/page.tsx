import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, Clock, GraduationCap, Eye } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { SUBJECTS, YEAR_LABEL, type BamsYear } from '../_subjects'
import { NOTES } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn/notes',
  title: 'BAMS Study Notes — Free for All Years | AyurConnect',
  description: 'Complete BAMS study notes for 1st year through final year + PG. Padartha, Dravyaguna, Rasashastra, Kayachikitsa, Panchakarma. Free, no signup.',
  keywords: ['BAMS notes', 'ayurveda study notes', 'BAMS 1st year notes', 'BAMS final year notes', 'AIAPGET preparation'],
})

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-800 border-emerald-200',
  intermediate: 'bg-amber-50 text-amber-800 border-amber-200',
  advanced:     'bg-rose-50 text-rose-800 border-rose-200',
}

export default async function NotesListPage({ searchParams }: { searchParams: Promise<{ year?: BamsYear; subject?: string }> }) {
  const { year, subject } = await searchParams
  let items = NOTES
  if (year) items = items.filter((n) => n.year === year)
  if (subject) items = items.filter((n) => n.subjectSlug === subject)

  const years: (BamsYear | 'all')[] = ['all', '1st_year', '2nd_year', '3rd_year', 'final_year', 'pg']
  const subjectsForYear = year ? SUBJECTS.filter((s) => s.year === year) : SUBJECTS

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> {NOTES.length} notes · 100% free
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">BAMS Study Notes — Free for All Students</h1>
          <p className="text-white/85 mt-3">Complete notes for all 4 years + PG. Padartha to Panchakarma — every subject, no paywall.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Year filter tabs */}
        <nav className="flex flex-wrap gap-1.5 mb-4">
          {years.map((y) => {
            const active = y === 'all' ? !year : year === y
            const href = y === 'all' ? '/learn/notes' : `/learn/notes?year=${y}`
            return (
              <Link key={y} href={href} className={'px-3 py-1.5 rounded-full text-xs font-semibold border ' + (active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>
                {y === 'all' ? 'All' : YEAR_LABEL[y]}
              </Link>
            )
          })}
        </nav>

        {/* Subject chips */}
        <div className="flex flex-wrap gap-1.5 mb-6 text-xs">
          {subjectsForYear.map((s) => {
            const active = subject === s.slug
            const href = `/learn/notes?${new URLSearchParams({ ...(year ? { year } : {}), ...(active ? {} : { subject: s.slug }) }).toString()}`
            return (
              <Link key={s.slug} href={href} className={'px-2.5 py-1 rounded border ' + (active ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300')}>
                {s.name}
              </Link>
            )
          })}
        </div>

        <p className="text-xs text-gray-600 mb-3"><strong>{items.length}</strong> note{items.length === 1 ? '' : 's'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((n) => {
            const subj = SUBJECTS.find((s) => s.slug === n.subjectSlug)
            return (
              <Link key={n.slug} href={`/learn/notes/${n.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg block">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-800 border border-kerala-200 rounded">{YEAR_LABEL[n.year]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{subj?.name ?? n.subjectSlug}</span>
                  <span className={'text-[10px] px-1.5 py-0.5 border rounded ' + (DIFFICULTY_COLOR[n.difficulty] ?? '')}>{n.difficulty}</span>
                </div>
                <h2 className="font-serif text-base text-ink leading-snug">{n.title}</h2>
                <p className="text-xs text-gray-700 mt-2 line-clamp-3">{n.summary}</p>
                <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {n.readTimeMinutes} min</span>
                  <span className="inline-flex items-center gap-0.5"><GraduationCap className="w-3 h-3" /> {n.keyPoints.length} key points</span>
                </div>
              </Link>
            )
          })}
          {items.length === 0 && <p className="text-sm text-gray-500 col-span-3 bg-white border border-gray-100 rounded-card p-8 text-center">No notes match these filters yet.</p>}
        </div>
      </section>
    </>
  )
}
