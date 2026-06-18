import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { PATHS } from './_data'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/career-paths',
  title: 'Ayurveda Career Paths — Plan Your Journey | AyurConnect',
  description: '5 Ayurveda career paths visualised: clinical, academic, GCC, wellness, telemedicine. Salary + qualifications per stage.',
  keywords: ['ayurveda career path', 'BAMS career planning', 'GCC career', 'ayurveda specialisation'],
})

export default function CareerPathsPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Career Paths</h1>
          <p className="text-white/85 mt-3">5 paths · interactive · realistic salary + duration per stage</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
        <nav className="flex flex-wrap gap-2 justify-center">
          {PATHS.map((p) => <a key={p.slug} href={`#${p.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream border border-kerala-200 hover:bg-kerala-50 rounded-full text-xs font-semibold text-kerala-800"><span>{p.icon}</span> {p.name}</a>)}
        </nav>

        {PATHS.map((p) => (
          <section key={p.slug} id={p.slug} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <header className="mb-4 pb-3 border-b border-gray-100">
              <p className="text-3xl">{p.icon}</p>
              <h2 className="font-serif text-2xl text-ink mt-1">{p.name}</h2>
              <p className="text-sm text-gray-700">{p.tagline}</p>
            </header>
            <ol className="space-y-3">
              {p.nodes.map((n, i) => (
                <li key={i}>
                  <article className="bg-cream border border-kerala-100 rounded p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-bold">Stage {i + 1}</p>
                        <h3 className="font-serif text-lg text-ink">{n.role}</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full">{n.duration}</span>
                    </div>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                      <div><dt className="text-[10px] uppercase tracking-wider text-gray-500">Salary</dt><dd className="text-gray-800 font-semibold">{n.salary}</dd></div>
                      <div><dt className="text-[10px] uppercase tracking-wider text-gray-500">Qualifications</dt><dd className="text-gray-800">{n.qualifications}</dd></div>
                    </dl>
                    {n.link && <Link href={n.link.href} className="mt-2 inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline">{n.link.label} <ArrowRight className="w-3 h-3" /></Link>}
                  </article>
                  {i < p.nodes.length - 1 && <div className="flex justify-center my-1"><ArrowDown className="w-4 h-4 text-gray-400" /></div>}
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 text-center shadow-card">
          <h2 className="font-serif text-xl text-ink">Not sure which path is for you?</h2>
          <p className="text-sm text-gray-700 mt-2">Get personalised guidance from the AI Career Advisor.</p>
          <Link href="/jobs/career-advisor" className="mt-3 inline-block px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">Talk to Career Advisor →</Link>
        </section>
      </section>
    </>
  )
}
