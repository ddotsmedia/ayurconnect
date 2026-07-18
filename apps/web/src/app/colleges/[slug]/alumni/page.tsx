import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, ChevronRight, Users, ArrowLeft } from 'lucide-react'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../../lib/seo'

type Doc = { id: string; slug?: string | null; name: string; specialization?: string | null; district?: string | null; country?: string | null; college?: string | null; batchYear?: number | null; collegeSlug?: string | null; experienceYears?: number | null }

async function fetchAlumni(slug: string): Promise<Doc[]> {
  try {
    const r = await fetch(`${API}/doctors?collegeSlug=${encodeURIComponent(slug)}&limit=200`, { cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json() as { doctors?: Doc[]; items?: Doc[] }
    return j.doctors ?? j.items ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const alumni = await fetchAlumni(slug)
  const collegeName = alumni[0]?.college ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const meta = pageMetadata({
    path:        `/colleges/${slug}/alumni`,
    title:       `${collegeName} Alumni — Ayurveda Doctors Directory`,
    description: `Ayurveda doctors who graduated from ${collegeName}, grouped by batch year. Find classmates, refer patients, reconnect.`,
    keywords:    [`${collegeName.toLowerCase()} alumni`, `${collegeName.toLowerCase()} BAMS graduates`, 'kerala ayurveda alumni'],
  })
  if (alumni.length < 3) meta.robots = { index: false, follow: true, googleBot: { index: false, follow: true } }
  return meta
}

export default async function CollegeAlumniPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const alumni = await fetchAlumni(slug)
  if (alumni.length === 0) notFound()

  const collegeName = alumni[0]?.college ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  // Group by batchYear (null → "Year unknown")
  const byYear = new Map<string, Doc[]>()
  for (const d of alumni) {
    const k = d.batchYear ? String(d.batchYear) : '—'
    if (!byYear.has(k)) byYear.set(k, [])
    byYear.get(k)!.push(d)
  }
  const sortedYears = [...byYear.keys()].sort((a, b) => {
    if (a === '—') return 1; if (b === '—') return -1
    return parseInt(b, 10) - parseInt(a, 10)
  })

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',            url: '/' },
      { name: 'Colleges',        url: '/colleges' },
      { name: collegeName,       url: `/colleges/${slug}/alumni` },
      { name: 'Alumni',          url: `/colleges/${slug}/alumni` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type':    'ItemList',
      itemListElement: alumni.slice(0, 50).map((d, i) => ({
        '@type':    'ListItem',
        position:   i + 1,
        url:        `https://ayurconnect.com/doctors/${d.slug ?? d.id}`,
        name:       d.name,
      })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/colleges" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> All colleges
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> Alumni directory
          </span>
          <h1 className="font-serif text-4xl text-white">{collegeName} Alumni</h1>
          <p className="text-white/85 mt-3">{alumni.length} doctor{alumni.length === 1 ? '' : 's'} from this college on AyurConnect, grouped by batch year.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
        {sortedYears.map((year) => (
          <article key={year} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-xl text-ink mb-3 inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-kerala-700" /> Batch of {year === '—' ? 'Year unknown' : year}
              <span className="text-xs text-gray-500 font-normal">({byYear.get(year)!.length})</span>
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {byYear.get(year)!.map((d) => (
                <li key={d.id}>
                  <Link href={`/doctors/${d.slug ?? d.id}`} className="block bg-cream border border-gray-100 rounded p-3 hover:border-kerala-300">
                    <p className="font-semibold text-sm text-ink">{d.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {d.specialization ?? 'General'}{d.experienceYears ? ` · ${d.experienceYears} yrs` : ''}
                      {d.district && ` · ${d.district}`}{d.country && d.country !== 'IN' && ` (${d.country})`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}

        <section className="bg-cream border border-gray-100 rounded-card p-6 text-center">
          <h2 className="font-serif text-xl text-ink mb-2">{collegeName} alumnus?</h2>
          <p className="text-sm text-gray-700 mb-4">Join the directory — find classmates, get referrals, build your visibility.</p>
          <Link href={`/doctors/register?college=${encodeURIComponent(collegeName)}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Register free <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </section>
    </>
  )
}
