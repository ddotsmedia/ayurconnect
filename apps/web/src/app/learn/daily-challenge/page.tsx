import type { Metadata } from 'next'
import { MCQS } from '../mcq/_data'
import { DailyChallengeClient } from './_client'
import { faqLd, ldGraph, breadcrumbLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: "Today's AIAPGET Challenge — 5 MCQs Free | AyurConnect",
  description: '5 fresh AIAPGET MCQs every day. Build a daily study streak. Free, no login required. Built for BAMS students and Ayurveda PG aspirants.',
  alternates: { canonical: '/learn/daily-challenge' },
  keywords: ['AIAPGET daily MCQ', 'daily ayurveda quiz', 'BAMS daily challenge', 'AIAPGET MCQ free'],
}

// Deterministic per-day shuffle so every visitor on the same date sees the
// same 5 questions — enables shared scores / leaderboard semantics later.
function todaysSet(): typeof MCQS {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
  const out: number[] = []
  const N = MCQS.length
  // Linear congruential walk; never repeats within the 5-pick window.
  let x = seed % N
  const step = 1 + (seed % (N - 1))
  while (out.length < 5 && out.length < N) {
    if (!out.includes(x)) out.push(x)
    x = (x + step) % N
  }
  return out.map((i) => MCQS[i])
}

export default function DailyChallengePage() {
  const set = todaysSet()
  const dateStr = new Date().toISOString().slice(0, 10)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',  url: 'https://ayurconnect.com' },
      { name: 'Learn', url: 'https://ayurconnect.com/learn' },
      { name: "Today's Challenge", url: 'https://ayurconnect.com/learn/daily-challenge' },
    ]),
    faqLd([
      { q: 'How does the daily challenge work?', a: 'Five MCQs picked deterministically for today\'s date. Everyone sees the same set, so scores are comparable. A new set unlocks every midnight UTC.' },
      { q: 'Is it free?', a: 'Yes — no subscription, no login required. Your streak is tracked in your browser via localStorage.' },
      { q: 'Where are the questions from?', a: 'Curated from the AyurConnect AIAPGET MCQ bank covering Padartha Vigyana, Dravyaguna, Rasashastra, Kayachikitsa, and other classical subjects.' },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-kerala-700">Today&rsquo;s AIAPGET Challenge</p>
        <h1 className="font-serif text-3xl text-kerala-800 mt-1">5 Questions · 10 Minutes</h1>
        <p className="text-sm text-gray-600 mt-1">Date: {dateStr} · A new set unlocks every midnight UTC.</p>
        <DailyChallengeClient set={set} dateStr={dateStr} />
      </div>
    </>
  )
}
