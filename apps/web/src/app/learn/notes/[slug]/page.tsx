import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft, BookOpen, Clock, GraduationCap, Sparkles, ChevronRight as ChevR } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../../lib/seo'
import { SUBJECTS, YEAR_LABEL } from '../../_subjects'
import { NOTES, NOTE_SLUGS } from '../_data'

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return NOTE_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const n = NOTES.find((x) => x.slug === slug)
  if (!n) return { title: 'Not found' }
  return pageMetadata({
    path: `/learn/notes/${slug}`,
    title: `${n.title} | BAMS Notes`,
    description: n.summary,
    keywords: [...n.tags, 'BAMS', 'ayurveda notes', n.subjectSlug],
  })
}

function renderBody(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/)
  const out: React.ReactNode[] = []
  blocks.forEach((b, i) => {
    if (b.startsWith('### ')) out.push(<h3 key={i} className="font-serif text-lg text-kerala-700 mt-5">{b.replace(/^###\s*/, '')}</h3>)
    else if (b.startsWith('## ')) out.push(<h2 key={i} className="font-serif text-2xl text-ink mt-6">{b.replace(/^##\s*/, '')}</h2>)
    else if (b.startsWith('> ')) out.push(<blockquote key={i} className="mt-3 border-l-4 border-amber-300 pl-3 italic text-gray-700">{b.replace(/^>\s*/gm, '')}</blockquote>)
    else if (b.startsWith('|')) {
      const rows = b.split('\n').filter(Boolean)
      const cells = rows.map((r) => r.split('|').map((c) => c.trim()).filter(Boolean))
      out.push(
        <div key={i} className="overflow-x-auto mt-3"><table className="w-full text-sm border border-gray-200 rounded">
          <tbody>{cells.filter((r, j) => !(j === 1 && r.every((c) => /^[-:]+$/.test(c)))).map((r, j) => (
            <tr key={j} className={j === 0 ? 'bg-kerala-50 font-semibold' : ''}>
              {r.map((c, k) => <td key={k} className="border border-gray-200 px-2 py-1">{c}</td>)}
            </tr>
          ))}</tbody>
        </table></div>,
      )
    }
    else if (b.match(/^\d+\.\s/)) {
      const items = b.split('\n').filter((l) => l.match(/^\d+\.\s/))
      out.push(<ol key={i} className="list-decimal list-outside ml-5 mt-3 space-y-1 text-gray-800">{items.map((l, j) => <li key={j}>{l.replace(/^\d+\.\s*/, '')}</li>)}</ol>)
    }
    else if (b.startsWith('- ')) {
      const items = b.split('\n').filter((l) => l.startsWith('- '))
      out.push(<ul key={i} className="list-disc list-outside ml-5 mt-3 space-y-1 text-gray-800">{items.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>)
    }
    else out.push(<p key={i} className="text-gray-800 mt-3 leading-relaxed">{b}</p>)
  })
  return out
}

export default async function NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = NOTES.find((x) => x.slug === slug)
  if (!n) notFound()
  const subj = SUBJECTS.find((s) => s.slug === n.subjectSlug)
  const related = NOTES.filter((x) => x.subjectSlug === n.subjectSlug && x.slug !== n.slug).slice(0, 4)
  const idxInYear = NOTES.filter((x) => x.year === n.year).findIndex((x) => x.slug === n.slug)
  const yearNotes = NOTES.filter((x) => x.year === n.year)
  const prev = idxInYear > 0 ? yearNotes[idxInYear - 1] : null
  const next = idxInYear < yearNotes.length - 1 ? yearNotes[idxInYear + 1] : null

  const ld = ldGraph(
    {
      '@context': 'https://schema.org', '@type': 'LearningResource',
      name: n.title, description: n.summary,
      educationalLevel: YEAR_LABEL[n.year],
      learningResourceType: 'StudyGuide',
      timeRequired: `PT${n.readTimeMinutes}M`,
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: 'AyurConnect Academic' },
    },
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Learn', url: '/learn' },
      { name: 'BAMS Notes', url: '/learn/notes' },
      { name: subj?.name ?? n.subjectSlug, url: `/learn/notes?subject=${n.subjectSlug}` },
      { name: n.title, url: `/learn/notes/${slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/learn/notes" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"><ChevronLeft className="w-3.5 h-3.5" /> All notes</Link>
          <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-white">{YEAR_LABEL[n.year]}</span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-white">{subj?.name ?? n.subjectSlug}</span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-300 text-amber-900 rounded-full font-bold">{n.difficulty}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight">{n.title}</h1>
          <p className="text-white/85 mt-3 max-w-2xl mx-auto">{n.summary}</p>
          <p className="text-xs text-white/70 mt-3 inline-flex items-center gap-3"><span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> {n.readTimeMinutes} min read</span></p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 max-w-6xl">
        <article className="prose-bams">
          {renderBody(n.content)}

          {n.references.length > 0 && (
            <section className="mt-10 bg-cream border border-kerala-100 rounded-card p-4">
              <h2 className="font-serif text-lg text-ink inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> References</h2>
              <ul className="mt-2 space-y-1 text-sm text-gray-800">{n.references.map((r) => <li key={r}>• {r}</li>)}</ul>
            </section>
          )}

          <nav className="mt-10 flex flex-wrap gap-2 justify-between border-t border-gray-100 pt-5 text-sm">
            {prev ? <Link href={`/learn/notes/${prev.slug}`} className="text-kerala-700 hover:underline inline-flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> {prev.title}</Link> : <span />}
            {next ? <Link href={`/learn/notes/${next.slug}`} className="text-kerala-700 hover:underline inline-flex items-center gap-1 text-right">{next.title} <ChevR className="w-3.5 h-3.5" /></Link> : <span />}
          </nav>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 self-start">
          <article className="bg-white border border-kerala-100 rounded-card p-4 shadow-card">
            <h2 className="font-serif text-base text-kerala-800 inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Key points</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
              {n.keyPoints.map((k, i) => <li key={i} className="flex items-start gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-kerala-700 flex-shrink-0 mt-1" /> <span>{k}</span></li>)}
            </ul>
          </article>

          {related.length > 0 && (
            <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <h3 className="font-serif text-base text-ink">Related notes</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {related.map((r) => <li key={r.slug}><Link href={`/learn/notes/${r.slug}`} className="text-kerala-700 hover:underline">→ {r.title}</Link></li>)}
              </ul>
            </article>
          )}

          <p className="text-[11px] text-gray-500 text-center">100% free · No paywall</p>
        </aside>
      </section>
    </>
  )
}
