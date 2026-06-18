import { GradientHero } from '@ayurconnect/ui'
import { MCQS } from '../_data'
import { MockTestClient } from './_client'

export const metadata = { title: 'AIAPGET Mock Test | AyurConnect', robots: { index: false } }

export default function MockTestPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">AIAPGET Mock Test</h1>
          <p className="text-white/85 mt-2">{MCQS.length} questions · 120-minute timer · score at end</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <MockTestClient questions={MCQS} />
      </section>
    </>
  )
}
