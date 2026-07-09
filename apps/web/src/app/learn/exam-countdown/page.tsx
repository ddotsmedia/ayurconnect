import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, BookOpen, ClipboardList, FileText } from 'lucide-react'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

// Conservative placeholder dates — admin should override via env or DB later.
// Format: YYYY-MM-DD. Tentative dates based on prior cycles; not official.
const EXAMS = [
  { id: 'aiapget',     name: 'AIAPGET (PG Entrance, AYUSH)', dateIso: '2026-08-15', tag: 'PG entrance',  notes: 'Common entrance for MD/MS Ayurveda admissions.', resources: [
    { label: 'AIAPGET MCQ practice',         href: '/learn/mcq' },
    { label: 'Mock test',                    href: '/learn/mcq/mock-test' },
    { label: "Today's challenge",            href: '/learn/daily-challenge' },
    { label: 'Solved question papers',       href: '/learn/question-papers' },
  ] },
  { id: 'kerala-psc',  name: 'Kerala PSC — Ayurveda Medical Officer', dateIso: '2026-11-10', tag: 'State PSC',
    notes: 'Govt. Ayurveda Medical Officer post. BAMS + KSMC registration required.', resources: [
      { label: 'PSC-focused MCQs',           href: '/learn/mcq' },
      { label: 'BAMS notes',                 href: '/learn/notes' },
      { label: 'Question papers',            href: '/learn/question-papers' },
    ] },
  { id: 'upsc-ayush',  name: 'UPSC AYUSH Medical Officer',   dateIso: '2027-02-20', tag: 'Central govt', notes: 'Posts in CCRAS, AIIA, NIA, and AYUSH ministry.', resources: [
      { label: 'AYUSH-track MCQs',           href: '/learn/mcq' },
      { label: 'Notes',                      href: '/learn/notes' },
    ] },
  { id: 'kuhs-pg',     name: 'KUHS PG Entrance (Kerala)',    dateIso: '2026-09-05', tag: 'State PG',     notes: 'Kerala University of Health Sciences — Ayurveda PG.', resources: [
      { label: 'PG entrance MCQs',           href: '/learn/mcq' },
      { label: 'KUHS prep notes',            href: '/learn/notes' },
    ] },
  { id: 'rguhs-pg',    name: 'RGUHS PG Entrance (Karnataka)', dateIso: '2026-10-12', tag: 'State PG',    notes: 'Rajiv Gandhi University of Health Sciences PG entrance.', resources: [
      { label: 'MCQs',                       href: '/learn/mcq' },
      { label: 'Notes',                      href: '/learn/notes' },
    ] },
]

export const metadata: Metadata = {
  title: 'AIAPGET 2026 Countdown + Study Planner',
  description: 'Days remaining until AIAPGET, Kerala PSC AMO, UPSC AYUSH, KUHS PG, RGUHS PG. Auto-calculated countdown with subject-wise study resources.',
  alternates: { canonical: '/learn/exam-countdown' },
  keywords: ['AIAPGET 2026 date', 'AIAPGET countdown', 'kerala psc ayurveda exam date', 'ayurveda PG entrance schedule'],
}

function daysFromToday(iso: string): { days: number; hours: number } {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exam  = new Date(iso); exam.setHours(0, 0, 0, 0)
  const diffMs = exam.getTime() - today.getTime()
  if (diffMs < 0) return { days: 0, hours: 0 }
  const days = Math.floor(diffMs / 86_400_000)
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000)
  return { days, hours }
}

export default function ExamCountdownPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',  url: 'https://ayurconnect.com' },
      { name: 'Learn', url: 'https://ayurconnect.com/learn' },
      { name: 'Exam Countdown', url: 'https://ayurconnect.com/learn/exam-countdown' },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-hero-tourism text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs uppercase tracking-wider text-white/70">Exam Countdown</p>
          <h1 className="font-serif text-3xl md:text-5xl mt-1 leading-tight">AIAPGET + State Exams — Days Remaining</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Auto-calculated countdown with subject-wise study resources.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-5">
        {EXAMS.map((e) => {
          const { days, hours } = daysFromToday(e.dateIso)
          const tone = days <= 30 ? 'border-rose-300 bg-rose-50' : days <= 90 ? 'border-amber-300 bg-amber-50' : 'border-kerala-200 bg-white'
          return (
            <article key={e.id} className={`border rounded-card p-5 ${tone}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{e.tag}</p>
                  <h2 className="font-serif text-xl text-kerala-800">{e.name}</h2>
                  <p className="text-xs text-gray-600 mt-1">Tentative date: {e.dateIso}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-kerala-700 leading-none">{days}<span className="text-base font-normal text-gray-600"> days</span></p>
                  <p className="text-xs text-gray-500">{hours}h remaining</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">{e.notes}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {e.resources.map((r) => (
                  <Link key={r.href + r.label} href={r.href} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-white border border-gray-200 hover:border-kerala-300 rounded">
                    {r.label === 'BAMS notes' || r.label.includes('Notes') ? <BookOpen className="w-3 h-3" /> : r.label.includes('MCQ') ? <ClipboardList className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {r.label} <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </article>
          )
        })}
        <p className="text-xs text-gray-500 text-center">Dates are tentative based on prior cycles. Always confirm on the official exam-conducting body&rsquo;s website.</p>
      </div>
    </>
  )
}
