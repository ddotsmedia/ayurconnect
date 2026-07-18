import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, MapPin, Clock, Tag } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'
import { InquiryForm } from '../../_inquiry-form'

type Hospital = { id: string; name: string; slug: string | null; district: string; type: string }
type Promotion = { kind: 'promotion'; id: string; title: string; subtitle: string | null; ctaLabel: string | null; ctaUrl: string | null; startsAt: string; endsAt: string | null; hospital: Hospital }

async function fetchPromotion(id: string): Promise<Promotion | null> {
  try {
    const r = await fetch(`${API}/hospitals-public/offers?limit=200`, { next: { revalidate: 300 } })
    if (!r.ok) { logServerFetchError('offer-detail', `HTTP ${r.status}`); return null }
    const d = await r.json() as { items?: Array<Promotion | { kind: string; id: string }> }
    const found = (d.items ?? []).find((x) => x.kind === 'promotion' && x.id === id) as Promotion | undefined
    return found ?? null
  } catch (err) { logServerFetchError('offer-detail', err); return null }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await fetchPromotion(id)
  if (!p) return { title: 'Offer not found' }
  return {
    title: `${p.title} at ${p.hospital.name} | AyurConnect Offers`,
    description: (p.subtitle ?? `Active offer from ${p.hospital.name}, ${p.hospital.district}.`).slice(0, 160),
    alternates: { canonical: `/offers/promotion/${p.id}` },
  }
}

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await fetchPromotion(id)
  if (!p) notFound()

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',   url: 'https://ayurconnect.com' },
      { name: 'Offers', url: 'https://ayurconnect.com/offers' },
      { name: p.title,  url: `https://ayurconnect.com/offers/promotion/${p.id}` },
    ]),
    {
      '@type': 'Offer',
      name: p.title,
      description: p.subtitle ?? '',
      url: `https://ayurconnect.com/offers/promotion/${p.id}`,
      availabilityStarts: p.startsAt,
      availabilityEnds: p.endsAt ?? undefined,
      seller: { '@type': 'MedicalOrganization', name: p.hospital.name, address: { '@type': 'PostalAddress', addressLocality: p.hospital.district, addressCountry: 'IN' } },
    },
  )

  const hospitalHref = p.hospital.slug ? `/hospitals/${p.hospital.slug}` : `/hospitals/${p.hospital.id}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <nav className="text-xs text-gray-500 mb-3">
          <Link href="/offers" className="hover:text-kerala-700">Offers</Link>
          <ChevronRight className="inline w-3 h-3 mx-1" />
          <span>{p.title}</span>
        </nav>

        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold mb-2"><Tag className="w-3 h-3" /> Offer</span>
        <h1 className="font-serif text-3xl text-kerala-800 leading-tight">{p.title}</h1>
        {p.subtitle && <p className="text-gray-700 mt-3 leading-relaxed">{p.subtitle}</p>}

        <p className="mt-4 text-sm text-gray-600">
          <Link href={hospitalHref} className="font-semibold text-kerala-700 hover:underline">{p.hospital.name}</Link>
          <span className="ml-2"><MapPin className="w-3.5 h-3.5 inline" /> {p.hospital.district}</span>
        </p>

        <div className="mt-3 inline-flex items-center gap-1 text-xs text-gray-600"><Clock className="w-3.5 h-3.5" /> Valid {p.endsAt ? `until ${new Date(p.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'while listed'}</div>

        {p.ctaUrl && p.ctaLabel && (
          <div className="mt-5">
            <a href={p.ctaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">{p.ctaLabel}</a>
          </div>
        )}

        <section className="mt-8 bg-white border border-gray-100 rounded-card p-4">
          <h2 className="font-serif text-lg text-kerala-700 mb-2">Inquire about this offer</h2>
          <InquiryForm hospitalId={p.hospital.id} postTitle={p.title} hospitalName={p.hospital.name} />
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this Ayurveda offer: ${p.title} at ${p.hospital.name}. https://ayurconnect.com/offers/promotion/${p.id}`)}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 bg-[#25D366] text-white rounded font-semibold">Share on WhatsApp</a>
          <Link href="/offers" className="text-xs px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded">All offers</Link>
        </div>
      </article>
    </>
  )
}
