// Shared renderer for /amai/[district] pages.
// Content-heavy MedicalWebPage + FAQPage + BreadcrumbList schema.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight, Building2, ArrowRight, MapPin } from 'lucide-react'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export type AmaiDistrictContent = {
  slug: string
  district: string
  displayName: string
  aliasNote: string | null
  title: string
  metaDescription: string
  keywords: string[]
  leadHtml: string
  sections: Array<{ heading: string; body: string }>
  faqs: Array<{ q: string; a: string }>
}

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

export function DistrictAmaiPage({ content }: { content: AmaiDistrictContent }) {
  const url = `https://ayurconnect.com/amai/${content.slug}`
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: 'https://ayurconnect.com' },
      { name: 'AMAI', url: 'https://ayurconnect.com/amai' },
      { name: content.district, url },
    ]),
    {
      '@type': 'MedicalWebPage',
      name: content.title,
      description: content.metaDescription,
      inLanguage: 'en',
      url,
      about: { '@type': 'MedicalOrganization', name: `AMAI ${content.district}` },
      audience: { '@type': 'MedicalAudience', audienceType: 'Physician' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    },
    {
      '@type': 'FAQPage',
      mainEntity: content.faqs.map((f) => ({
        '@type': 'Question', name: f.q,
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
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="inline w-3 h-3 mx-1" />
            <Link href="/amai" className="hover:text-white">AMAI</Link>
            <ChevronRight className="inline w-3 h-3 mx-1" />
            <span>{content.district}</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight inline-flex flex-wrap items-center gap-2">
            <Building2 className="w-7 h-7 md:w-9 md:h-9" /> {content.displayName}{content.aliasNote && <span className="text-white/80 text-2xl md:text-3xl font-normal">{content.aliasNote}</span>}
          </h1>
          <p className="text-white/85 mt-3 inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> Kerala · Ayurveda Medical Association of India</p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <div data-speakable>{md(content.leadHtml)}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/doctors/location/${content.slug}`} className="inline-flex items-center gap-1 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">Find doctors in {content.district} <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/doctors/register" className="inline-flex items-center gap-1 px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-50 text-sm font-semibold rounded">Register as doctor <ArrowRight className="w-4 h-4" /></Link>
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

        <section className="mt-10 p-4 bg-cream border border-kerala-100 rounded-card text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Explore more</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <Link href="/amai" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">All AMAI districts</Link>
            <Link href="/ayurveda-doctor" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Ayurveda doctor guide</Link>
            <Link href="/bams" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">BAMS career</Link>
            <Link href="/best-ayurveda-doctors-kerala" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Best doctors Kerala</Link>
          </div>
        </section>
      </article>
    </>
  )
}
