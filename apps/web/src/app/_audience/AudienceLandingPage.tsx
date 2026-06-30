import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { breadcrumbLd, ldGraph } from '@/lib/seo'
import type { AudiencePage } from './_types'

export function AudienceLandingPage({
  page,
  path,
  breadcrumb,
  variant = 'green',
}: {
  page: AudiencePage
  path: string
  breadcrumb: Array<{ name: string; url: string }>
  variant?: 'green' | 'tourism' | 'jobs' | 'hospital' | 'bot' | 'forum'
}) {
  const ld = ldGraph(
    breadcrumbLd(breadcrumb),
    {
      '@type': 'WebPage',
      name: page.title,
      description: page.metaDescription,
      url: `https://ayurconnect.com${path}`,
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    },
    {
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant={variant} size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{page.h1}</h1>
          <p className="mt-4 text-lg text-white/85" data-speakable>{page.ogSummary}</p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {page.ctas.map((c, i) => (
              <Link
                key={c.href}
                href={c.href}
                className={i === 0
                  ? 'inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-md'
                  : 'inline-flex items-center gap-1.5 px-5 py-2.5 border-2 border-white/40 text-white hover:bg-white/10 text-sm font-semibold rounded-md backdrop-blur'}
              >
                {c.label} <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </GradientHero>

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <nav className="text-xs text-gray-500 mb-4">
          {breadcrumb.map((b, i) => (
            <span key={b.url}>
              {i > 0 && <ChevronRight className="inline w-3 h-3 mx-1 text-gray-300" />}
              {i === breadcrumb.length - 1
                ? <span className="text-gray-700">{b.name}</span>
                : <Link href={b.url.replace('https://ayurconnect.com', '') || '/'} className="hover:text-kerala-700">{b.name}</Link>}
            </span>
          ))}
        </nav>

        <p className="text-gray-800 leading-relaxed text-lg" data-speakable>{page.leadParagraph}</p>

        <div className="mt-8 space-y-8">
          {page.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-serif text-2xl text-kerala-700 leading-snug mb-3">{s.heading}</h2>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">{s.body}</div>
            </section>
          ))}
        </div>

        <section className="mt-12 border-t pt-8">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">FAQ</h2>
          <div className="space-y-3">
            {page.faqs.map((f, i) => (
              <details key={i} className="bg-cream/50 border border-gray-100 rounded-card p-4 open:bg-white">
                <summary className="font-semibold text-kerala-800 cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-gray-800 leading-relaxed" data-speakable>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {page.ctas.map((c, i) => (
            <Link
              key={c.href + i}
              href={c.href}
              className={i === 0
                ? 'inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-md'
                : 'inline-flex items-center gap-1.5 px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-50 text-sm font-semibold rounded-md'}
            >
              {c.label} <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </article>
    </>
  )
}
