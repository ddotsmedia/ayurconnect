import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, FileText, Target, Heart, GraduationCap, Library, ArrowRight, Sparkles } from 'lucide-react'
import { pageMetadata } from '../../lib/seo'
import { NOTES } from './notes/_data'
import { PAPERS } from './question-papers/_data'
import { MCQS } from './mcq/_data'
import { CASES } from './case-studies/_data'
import { WORKSHOPS } from './workshops/_data'
import { EBOOKS } from './ebooks/_data'

export const metadata: Metadata = pageMetadata({
  path: '/learn',
  title: 'Free Ayurveda Learning Hub — BAMS പഠന സാമഗ്രികൾ',
  description: 'BAMS പഠന സാമഗ്രികൾ — BAMS study notes, AIAPGET MCQs, solved question papers, clinical case studies, workshops, e-books. All free, no subscription needed.',
  keywords: ['BAMS notes free', 'AIAPGET MCQ free', 'ayurveda learning hub', 'BAMS study material free', 'ayurveda education'],
})

export default function LearnHubPage() {
  const sections = [
    { icon: BookOpen,      label: 'BAMS Notes',      href: '/learn/notes',           count: NOTES.length,    sub: 'study notes across all years', emoji: '📚' },
    { icon: FileText,      label: 'Question Papers', href: '/learn/question-papers', count: PAPERS.length,   sub: 'previous year + model papers', emoji: '📝' },
    { icon: Target,        label: 'AIAPGET MCQ',     href: '/learn/mcq',             count: MCQS.length,     sub: 'practice + mock test', emoji: '🎯' },
    { icon: Heart,         label: 'Case Studies',    href: '/learn/case-studies',    count: CASES.length,    sub: 'clinical cases', emoji: '🏥' },
    { icon: GraduationCap, label: 'Workshops',       href: '/learn/workshops',       count: WORKSHOPS.length,sub: 'free workshops', emoji: '🎓' },
    { icon: Library,       label: 'E-Books',         href: '/learn/ebooks',          count: EBOOKS.length,   sub: 'downloadable resources', emoji: '📖' },
  ]
  const recent = [
    ...NOTES.slice(0, 2).map((n) => ({ kind: 'Note',  title: n.title, href: `/learn/notes/${n.slug}` })),
    ...CASES.slice(0, 2).map((c) => ({ kind: 'Case',  title: c.title, href: `/learn/case-studies/${c.slug}` })),
    ...PAPERS.slice(0, 1).map((p) => ({ kind: 'Paper', title: p.title, href: `/learn/question-papers/${p.slug}` })),
    ...WORKSHOPS.slice(0, 1).map((w) => ({ kind: 'Workshop', title: w.title, href: `/learn/workshops/${w.slug}` })),
  ]

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> 100% free · No subscription · No sign-up required
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">AyurConnect Learning Hub</h1>
          <p className="text-white/85 mt-4 text-lg max-w-2xl mx-auto">BAMS notes · AIAPGET MCQs · solved papers · case studies · workshops · e-books — all free, no subscription needed.</p>
          <Link href="/learn/notes" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-kerala-800 font-bold rounded hover:bg-white/90">
            Start Learning Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </GradientHero>

      {/* Why-free strip */}
      <section className="bg-gradient-to-r from-kerala-50 via-cream to-amber-50 border-y border-kerala-100">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="font-serif text-lg text-ink">Other platforms charge ₹249/month. AyurConnect is <strong className="text-kerala-700">free</strong>. Forever.</p>
          <p className="text-xs text-gray-700 mt-1">High-quality BAMS education should not be paywalled. Login only needed for bookmarks + workshop registration.</p>
        </div>
      </section>

      {/* Daily challenge widget — top placement to drive return visits */}
      <section className="container mx-auto px-4 pt-8 max-w-6xl">
        <Link href="/learn/daily-challenge" className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-card hover:border-amber-400 transition-colors">
          <span className="text-3xl">🔥</span>
          <div className="flex-1">
            <p className="font-serif text-xl text-kerala-800">Today&rsquo;s AIAPGET Challenge</p>
            <p className="text-sm text-gray-700">5 questions · 10 minutes · Build a daily streak →</p>
          </div>
          <span className="hidden md:inline text-sm text-kerala-700 font-semibold">Start →</span>
        </Link>
        <Link href="/learn/exam-countdown" className="mt-3 flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-card hover:border-kerala-300 transition-colors">
          <span className="text-2xl">📅</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Exam Countdown</p>
            <p className="text-xs text-gray-500">AIAPGET, Kerala PSC, UPSC AYUSH, KUHS PG → days remaining + study links</p>
          </div>
        </Link>
      </section>

      {/* 6-card grid */}
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <Link key={s.href} href={s.href} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
                <p className="text-4xl">{s.emoji}</p>
                <h2 className="font-serif text-xl text-ink mt-2 inline-flex items-center gap-2"><Icon className="w-5 h-5 text-kerala-700" /> {s.label}</h2>
                <p className="text-3xl font-bold text-kerala-700 mt-2">{s.count}</p>
                <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700">Browse all <ArrowRight className="w-3 h-3" /></span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recently added */}
      <section className="bg-cream border-y border-gray-100">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h2 className="font-serif text-2xl text-ink mb-4">Recently added</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recent.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="bg-white border border-gray-100 rounded-card p-3 shadow-card hover:shadow-cardLg block flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-kerala-700 font-bold">{r.kind}</span>
                    <p className="text-sm text-ink mt-0.5">{r.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="font-serif text-3xl text-ink mt-3">Start with what you need today</h2>
        <p className="text-sm text-gray-700 mt-2">Pick a section above. No sign-up required.</p>
        <div className="mt-5 inline-flex gap-2 flex-wrap justify-center">
          <Link href="/learn/notes" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Browse notes</Link>
          <Link href="/learn/mcq" className="px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 rounded font-semibold text-sm hover:bg-kerala-50">Practice MCQs</Link>
        </div>
      </section>
    </>
  )
}
