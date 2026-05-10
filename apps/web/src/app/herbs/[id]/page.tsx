import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Leaf, ArrowRight } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { herbLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'

type Herb = {
  id: string
  name: string
  sanskrit: string | null
  english: string | null
  malayalam: string | null
  rasa: string | null
  guna: string | null
  virya: string | null
  vipaka: string | null
  description: string | null
  uses: string | null
}

async function fetchHerb(id: string): Promise<Herb | null> {
  try {
    const res = await fetch(`${API}/herbs/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Herb
  } catch { return null }
}

async function fetchRelated(currentId: string): Promise<Herb[]> {
  try {
    const res = await fetch(`${API}/herbs?limit=12`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data) ? data : (data.herbs ?? [])
    return items.filter((h: Herb) => h.id !== currentId).slice(0, 6)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const h = await fetchHerb(id)
  if (!h) return { title: 'Herb not found' }

  const otherNames = [h.sanskrit, h.english, h.malayalam].filter(Boolean).join(' / ')
  const title = `${h.name}${otherNames ? ` (${otherNames})` : ''} — Properties & Uses`
  const description = clip(h.description ?? `${h.name} — Rasa: ${h.rasa ?? '—'}, Virya: ${h.virya ?? '—'}. Traditional uses: ${h.uses ?? '—'}`)

  return {
    title,
    description,
    alternates: { canonical: `/herbs/${h.id}` },
    openGraph: {
      title, description,
      url: `${SITE_URL}/herbs/${h.id}`,
      type: 'article',
      images: [{ url: `/herbs/${h.id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function HerbDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const h = await fetchHerb(id)
  if (!h) notFound()

  const related = await fetchRelated(h.id)

  const jsonLd = ldGraph(
    herbLd(h),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Herbs', url: '/herbs' },
      { name: h.name, url: `/herbs/${h.id}` },
    ]),
  )

  const props: Array<{ label: string; value: string | null }> = [
    { label: 'Sanskrit',  value: h.sanskrit },
    { label: 'English',   value: h.english  },
    { label: 'Malayalam', value: h.malayalam },
    { label: 'Rasa (taste)',     value: h.rasa   },
    { label: 'Guna (quality)',   value: h.guna   },
    { label: 'Virya (potency)',  value: h.virya  },
    { label: 'Vipaka (post-digestive effect)', value: h.vipaka },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-hero-green text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/herbs" className="hover:text-white">Herbs</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white">{h.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/15 ring-4 ring-white/15 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{h.name}</h1>
              {h.sanskrit && <p className="mt-2 font-serif text-xl text-white/80">{h.sanskrit}</p>}
              {(h.english || h.malayalam) && (
                <p className="mt-1 text-sm text-white/70">
                  {[h.english, h.malayalam].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-10">
          {h.description && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{h.description}</p>
            </section>
          )}

          <section>
            <h2 className="text-2xl text-kerala-700 mb-4">Classical properties</h2>
            <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {props.filter((p) => p.value).map((p) => (
                    <tr key={p.label} className="border-b last:border-b-0 border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-gray-600 bg-gray-50 w-[40%]">{p.label}</th>
                      <td className="px-4 py-3 text-gray-900">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {h.uses && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-3">Traditional uses</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{h.uses}</p>
            </section>
          )}

          <section className="rounded-card bg-amber-50 border border-amber-200 p-5">
            <h3 className="font-semibold text-amber-900 text-sm">Disclaimer</h3>
            <p className="mt-1 text-sm text-amber-900 leading-relaxed">
              This information is educational and based on classical Ayurvedic texts. It is not medical advice.
              Always consult a qualified BAMS / MD-Ayurveda practitioner before using any herb therapeutically —
              dosage, anupana (vehicle), and combinations are person-specific.
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <Link href="/ayurbot" className="block bg-hero-bot text-white rounded-card p-5 hover:opacity-95 transition-opacity">
            <div className="text-xs uppercase tracking-wider text-white/70">Ask AyurBot</div>
            <div className="mt-1 font-serif text-lg leading-tight">Get personalised guidance on {h.name}</div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs">Open AyurBot <ArrowRight className="w-3 h-3" /></span>
          </Link>

          <Link href="/herbs" className="block text-center px-4 py-2 text-sm border border-kerala-600 text-kerala-700 rounded-md hover:bg-kerala-50">
            ← All herbs
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-xl text-kerala-700 mb-4">Related herbs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={`/herbs/${r.id}`} className="bg-white border border-gray-100 rounded-card p-4 hover:shadow-card hover:-translate-y-0.5 transition-all">
                <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                {r.sanskrit && <div className="text-xs text-gray-500 mt-1">{r.sanskrit}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400
