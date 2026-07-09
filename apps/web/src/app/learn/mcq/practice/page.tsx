import { GradientHero } from '@ayurconnect/ui'
import { MCQS } from '../_data'
import { PracticeClient } from './_client'

export const metadata = { title: 'MCQ Practice', robots: { index: false } }

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ subject?: string; mode?: string }> }) {
  const { subject } = await searchParams
  let pool = MCQS
  if (subject) pool = pool.filter((m) => m.subjectSlug === subject)
  // Shuffle deterministically by reversing index-based sort (no Math.random use needed for client-side practice).
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">MCQ Practice</h1>
          <p className="text-white/85 mt-2">{pool.length} question{pool.length === 1 ? '' : 's'} · immediate feedback</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-2xl">
        <PracticeClient questions={pool} />
      </section>
    </>
  )
}
