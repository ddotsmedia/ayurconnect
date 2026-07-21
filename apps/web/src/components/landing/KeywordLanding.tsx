import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { breadcrumbLd, faqLd, ldGraph } from '../../lib/seo'

// Shared template for the SEO keyword landing pages. Each of the 15 pages
// (conditions/*, services/*, jobs/*) passes its content here so structure,
// FAQ schema wiring, and CTA styling stay consistent. Server component —
// no interactivity beyond the FAQ <details> accordion.

export type LandingContent = {
  slug:          string                                          // full slug used to build breadcrumb
  breadcrumbs:   Array<{ name: string; url: string }>            // e.g. Home > Conditions > PCOS
  eyebrow:       string                                          // small label above the H1
  h1:            string                                          // primary keyword-rich H1
  heroSubtitle:  string                                          // 1-2 sentence hero blurb
  heroVariant?:  'green' | 'tourism' | 'forum' | 'jobs' | 'bot' | 'hospital' // GradientHero variant
  cta:           { label: string; href: string }                 // primary CTA
  sections:      Array<{ title: string; paragraphs: string[]; bullets?: string[] }>
  faqs:          Array<{ q: string; a: string }>                 // 5-8 items → FAQPage JSON-LD
  related:       Array<{ label: string; href: string }>          // internal-link cluster
  mlHref?:       string                                          // optional Malayalam counterpart URL
}

export function KeywordLanding({ content }: { content: LandingContent }) {
  const ld = ldGraph(
    breadcrumbLd(content.breadcrumbs),
    faqLd(content.faqs),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant={content.heroVariant ?? 'green'} size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> {content.eyebrow}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight tracking-tight">{content.h1}</h1>
          <p className="text-white/85 mt-4 max-w-2xl mx-auto text-sm md:text-base">{content.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href={content.cta.href} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold text-sm shadow-lg">
              {content.cta.label} <ArrowRight className="w-4 h-4" />
            </Link>
            {content.mlHref && (
              <Link href={content.mlHref} lang="ml" hrefLang="ml-IN" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-md text-sm">
                മലയാളത്തിൽ വായിക്കുക
              </Link>
            )}
          </div>
        </div>
      </GradientHero>

      {/* Breadcrumb strip — visible + JSON-LD. */}
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 md:px-6 max-w-4xl py-3 text-xs text-gray-500">
        {content.breadcrumbs.map((b, i) => (
          <span key={b.url}>
            {i > 0 && <span className="mx-1.5 text-gray-300">/</span>}
            {i === content.breadcrumbs.length - 1
              ? <span className="text-gray-700">{b.name}</span>
              : <Link href={b.url} className="hover:text-kerala-700 hover:underline">{b.name}</Link>}
          </span>
        ))}
      </nav>

      {/* Content sections. */}
      <article className="container mx-auto px-4 md:px-6 max-w-3xl py-6 md:py-10 space-y-8">
        {content.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 leading-tight">{s.title}</h2>
            <div className="mt-3 space-y-3 text-gray-800 leading-relaxed">
              {s.paragraphs.map((p, i) => <p key={i} className="text-sm md:text-base">{p}</p>)}
            </div>
            {s.bullets && s.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm md:text-base text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* FAQ — visible accordion + FAQPage JSON-LD emitted above. Google
            requires the visible copy match the schema. */}
        <section>
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 leading-tight">Frequently asked</h2>
          <div className="mt-4 space-y-2">
            {content.faqs.map((f) => (
              <details key={f.q} className="group bg-white p-4 md:p-5 rounded-card border border-gray-100 shadow-card">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-ink text-sm md:text-[15px]">{f.q}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 mt-0.5" />
                </summary>
                <p className="text-gray-700 leading-relaxed mt-3 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related — internal-link cluster. */}
        {content.related.length > 0 && (
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-kerala-700 leading-tight">Related</h2>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex items-center justify-between bg-white border border-gray-100 rounded-card px-4 py-3 text-sm hover:border-kerala-300 hover:bg-cream/40 transition-colors">
                    <span className="text-ink">{r.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Bottom CTA — repeats the hero CTA so long-scroll users don't have to scroll back up. */}
        <section className="bg-gradient-to-br from-kerala-50 via-cream to-gold-50 border border-kerala-100 rounded-card p-6 text-center">
          <p className="text-sm text-gray-700">Ready to start?</p>
          <Link href={content.cta.href} className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md font-semibold text-sm">
            {content.cta.label} <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </>
  )
}
