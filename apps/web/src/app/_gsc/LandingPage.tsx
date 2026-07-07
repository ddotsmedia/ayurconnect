// Shared renderer for GSC-targeting landing pages
// (/ayurveda-hospitals-dubai, /best-ayurveda-doctors-kerala,
// /ayurveda-hospitals-kerala). Content-heavy MedicalWebPage +
// FAQPage + BreadcrumbList schema, speakable, max-snippet.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export type LandingContent = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  leadHtml: string
  sections: Array<{ heading: string; body: string }>
  faqs: Array<{ q: string; a: string }>
}

// Very small markdown → JSX: paragraph breaks, `**bold**`, `- bullets`,
// and `[text](/route)` internal links. Deliberately no external deps.
function md(source: string): ReactNode[] {
  const blocks = source.split(/\n{2,}/)
  return blocks.map((raw, i) => {
    const block = raw.trim()
    if (!block) return null
    if (block.startsWith('- ')) {
      const items = block.split(/\n(?=- )/).map((l) => l.replace(/^-\s+/, ''))
      return <ul key={i} className="list-disc pl-6 my-3 space-y-1 text-gray-800">{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>
    }
    return <p key={i} className="text-gray-800 leading-relaxed my-3">{inline(block)}</p>
  })
}

// Inline transform: **bold**, [text](/route)
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let rest = text
  let key = 0
  const rx = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/
  while (rest) {
    const m = rest.match(rx)
    if (!m) { parts.push(rest); break }
    const before = rest.slice(0, m.index)
    if (before) parts.push(before)
    if (m[0].startsWith('**')) parts.push(<strong key={key++}>{m[2]}</strong>)
    else parts.push(<Link key={key++} href={m[4]} className="text-kerala-700 hover:underline">{m[3]}</Link>)
    rest = rest.slice((m.index ?? 0) + m[0].length)
  }
  return parts
}

export function LandingPage({
  content,
  breadcrumb,
  aboutName,
  ctaHref,
  ctaLabel,
}: {
  content: LandingContent
  breadcrumb: Array<{ name: string; url: string }>
  aboutName: string
  ctaHref: string
  ctaLabel: string
}) {
  const ld = ldGraph(
    breadcrumbLd(breadcrumb),
    {
      '@type': 'MedicalWebPage',
      name: content.title,
      description: content.metaDescription,
      inLanguage: 'en',
      url: breadcrumb[breadcrumb.length - 1].url,
      about: { '@type': 'MedicalOrganization', name: aboutName },
      audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    },
    {
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-hero-green text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="text-xs text-white/70 mb-2">
            {breadcrumb.map((b, i) => (
              <span key={b.url}>
                {i > 0 && <ChevronRight className="inline w-3 h-3 mx-1" />}
                {i < breadcrumb.length - 1
                  ? <Link href={b.url.replace('https://ayurconnect.com', '') || '/'} className="hover:text-white">{b.name}</Link>
                  : <span>{b.name}</span>}
              </span>
            ))}
          </nav>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{content.title}</h1>
        </div>
      </section>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <div data-speakable>{md(content.leadHtml)}</div>

        <div className="mt-4">
          <Link href={ctaHref} className="inline-flex items-center gap-1 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">{ctaLabel}</Link>
        </div>

        {content.sections.map((s, i) => (
          <section key={i} className="mt-8">
            <h2 className="font-serif text-2xl text-kerala-700 leading-snug mb-2">{s.heading}</h2>
            <div>{md(s.body)}</div>
          </section>
        ))}

        <section className="mt-12 border-t pt-8">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">Frequently asked</h2>
          <div className="space-y-3">
            {content.faqs.map((f, i) => (
              <details key={i} className="bg-cream/50 border border-gray-100 rounded-card p-4 open:bg-white">
                <summary className="font-semibold text-kerala-800 cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-gray-800 leading-relaxed" data-speakable>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          <Link href={ctaHref} className="inline-flex items-center gap-1 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">{ctaLabel}</Link>
        </div>
      </article>
    </>
  )
}
