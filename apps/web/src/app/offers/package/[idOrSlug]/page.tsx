import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, MapPin, Package as PackageIcon, Check } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'
import { InquiryForm } from '../../_inquiry-form'

type Hospital = { id: string; name: string; slug: string | null; district: string; type: string }
type Pkg = {
  kind: 'package'; id: string; slug: string; title: string; description: string; duration: string
  priceFrom: number; priceTo: number | null; currency: string
  includes: string[]; treatments: string[]; isFeatured: boolean; hospital: Hospital
}

async function fetchPackage(idOrSlug: string): Promise<Pkg | null> {
  try {
    const r = await fetch(`${API}/hospitals-public/offers?limit=200&type=package`, { next: { revalidate: 300 } })
    if (!r.ok) { logServerFetchError('package-detail', `HTTP ${r.status}`); return null }
    const d = await r.json() as { items?: Array<Pkg | { kind: string }> }
    const found = (d.items ?? []).find((x) => x.kind === 'package' && ((x as Pkg).slug === idOrSlug || (x as Pkg).id === idOrSlug)) as Pkg | undefined
    return found ?? null
  } catch (err) { logServerFetchError('package-detail', err); return null }
}

function fmtPrice(min: number, max: number | null, currency: string): string {
  const sym = currency === 'INR' ? '₹' : currency === 'AED' ? 'AED ' : currency === 'USD' ? '$' : currency + ' '
  return max && max > min ? `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}` : `${sym}${min.toLocaleString()}`
}

export async function generateMetadata({ params }: { params: Promise<{ idOrSlug: string }> }): Promise<Metadata> {
  const { idOrSlug } = await params
  const p = await fetchPackage(idOrSlug)
  if (!p) return { title: 'Package not found' }
  return {
    title: `${p.title} — ${p.hospital.name} | AyurConnect Packages`,
    description: p.description.slice(0, 160),
    alternates: { canonical: `/offers/package/${p.slug ?? p.id}` },
  }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = await params
  const p = await fetchPackage(idOrSlug)
  if (!p) notFound()

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home',     url: 'https://ayurconnect.com' },
      { name: 'Offers',   url: 'https://ayurconnect.com/offers' },
      { name: 'Packages', url: 'https://ayurconnect.com/offers?type=package' },
      { name: p.title,    url: `https://ayurconnect.com/offers/package/${p.slug ?? p.id}` },
    ]),
    {
      '@type': 'Offer',
      name: p.title,
      description: p.description,
      price: p.priceFrom,
      priceCurrency: p.currency,
      url: `https://ayurconnect.com/offers/package/${p.slug ?? p.id}`,
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

        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-bold mb-2"><PackageIcon className="w-3 h-3" /> Treatment Package</span>
        <h1 className="font-serif text-3xl text-kerala-800 leading-tight">{p.title}</h1>
        <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-line">{p.description}</p>

        <p className="mt-4 text-sm text-gray-600">
          <Link href={hospitalHref} className="font-semibold text-kerala-700 hover:underline">{p.hospital.name}</Link>
          <span className="ml-2"><MapPin className="w-3.5 h-3.5 inline" /> {p.hospital.district}</span>
        </p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-kerala-50 border border-kerala-100 rounded-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-kerala-700">From</p>
            <p className="font-serif text-2xl text-kerala-800">{fmtPrice(p.priceFrom, p.priceTo, p.currency)}</p>
            <p className="text-xs text-gray-600 mt-1">Duration: {p.duration}</p>
          </div>
          {p.includes.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Inclusions</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {p.includes.map((i) => <li key={i} className="inline-flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-emerald-700 flex-shrink-0" /> {i}</li>)}
              </ul>
            </div>
          )}
        </div>

        {p.treatments.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Treatments</p>
            <div className="flex flex-wrap gap-1.5">
              {p.treatments.map((t) => <span key={t} className="text-xs px-2 py-0.5 bg-cream border border-kerala-200 rounded-full text-kerala-800">{t}</span>)}
            </div>
          </div>
        )}

        <section className="mt-8 bg-white border border-gray-100 rounded-card p-4">
          <h2 className="font-serif text-lg text-kerala-700 mb-2">Inquire about this package</h2>
          <InquiryForm hospitalId={p.hospital.id} postTitle={p.title} hospitalName={p.hospital.name} />
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this Ayurveda package: ${p.title} at ${p.hospital.name}. ${fmtPrice(p.priceFrom, p.priceTo, p.currency)} · ${p.duration}. https://ayurconnect.com/offers/package/${p.slug ?? p.id}`)}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 bg-[#25D366] text-white rounded font-semibold">Share on WhatsApp</a>
          <Link href="/offers" className="text-xs px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded">All offers</Link>
        </div>
      </article>
    </>
  )
}
