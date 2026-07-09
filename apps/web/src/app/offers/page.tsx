import Link from 'next/link'
import type { Metadata } from 'next'
import { Tag, Package, ChevronRight, MapPin, Clock, MessageCircle } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Ayurveda Offers & Treatment Packages — Kerala Hospitals',
  description: 'Live Ayurveda offers + treatment packages from verified Kerala hospitals. Panchakarma packages, seasonal offers, free consultations, health camps. Inquire free.',
  alternates: { canonical: '/offers' },
  keywords: ['ayurveda offers kerala', 'panchakarma packages', 'ayurveda treatment offers', 'kerala wellness packages', 'panchakarma price'],
}

type Hospital = { id: string; name: string; slug: string | null; district: string; type: string; country?: string | null }
type Promotion = { kind: 'promotion'; id: string; title: string; subtitle: string | null; ctaLabel: string | null; ctaUrl: string | null; startsAt: string; endsAt: string | null; hospital: Hospital }
type Pkg       = { kind: 'package'; id: string; slug: string; title: string; description: string; duration: string; priceFrom: number; priceTo: number | null; currency: string; includes: string[]; treatments: string[]; isFeatured: boolean; hospital: Hospital }
type Offer = Promotion | Pkg

async function fetchOffers(): Promise<Offer[]> {
  try {
    const r = await fetch(`${API}/hospitals-public/offers?limit=80`, { next: { revalidate: 300 } })
    if (!r.ok) { logServerFetchError('offers', `HTTP ${r.status}`); return [] }
    const d = await r.json() as { items?: Offer[] }
    return d.items ?? []
  } catch (err) { logServerFetchError('offers', err); return [] }
}

function fmtPrice(min: number, max: number | null, currency: string): string {
  const sym = currency === 'INR' ? '₹' : currency === 'AED' ? 'AED ' : currency === 'USD' ? '$' : currency + ' '
  return max && max > min ? `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}` : `${sym}${min.toLocaleString()}`
}

function daysUntil(iso: string | null | undefined): { label: string; tone: string } | null {
  if (!iso) return null
  const d = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (d < 0) return null
  if (d === 0) return { label: 'Ends today',      tone: 'bg-rose-100 text-rose-800' }
  if (d === 1) return { label: 'Ends tomorrow',   tone: 'bg-rose-100 text-rose-800' }
  if (d <= 7)  return { label: `Ends in ${d} days`, tone: 'bg-amber-100 text-amber-800' }
  return null
}

export default async function OffersPage() {
  const offers = await fetchOffers()
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: 'https://ayurconnect.com' },
      { name: 'Offers & Packages', url: 'https://ayurconnect.com/offers' },
    ]),
    { '@type': 'CollectionPage', name: 'Ayurveda Offers & Packages — Kerala', url: 'https://ayurconnect.com/offers' },
    // Emit individual Offer schema for promotions and packages
    ...offers.filter((o): o is Pkg => o.kind === 'package').map((p) => ({
      '@type': 'Offer', name: p.title, description: p.description,
      price: p.priceFrom, priceCurrency: p.currency,
      url: `https://ayurconnect.com/offers/package/${p.slug ?? p.id}`,
      seller: { '@type': 'MedicalOrganization', name: p.hospital.name },
    })),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="bg-hero-tourism text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-white/70">Offers & Packages</p>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Ayurveda Offers & Treatment Packages</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Live offers, Panchakarma packages, and seasonal promotions from verified Kerala hospitals.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {offers.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center max-w-2xl mx-auto">
            <p className="font-serif text-xl text-amber-900">No active offers right now.</p>
            <p className="text-sm text-amber-800 mt-2">Hospitals post seasonal offers regularly. Check back soon or browse hospitals directly.</p>
            <Link href="/hospitals" className="inline-block mt-4 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">Browse hospitals</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-4"><strong className="text-ink">{offers.length}</strong> active {offers.length === 1 ? 'offer' : 'offers'}</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((o) => {
                const isPkg = o.kind === 'package'
                const Icon  = isPkg ? Package : Tag
                const tone  = isPkg ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                const endsBadge = !isPkg ? daysUntil(o.endsAt) : null
                const detailHref = isPkg ? `/offers/package/${o.slug ?? o.id}` : `/offers/promotion/${o.id}`
                const hospitalHref = o.hospital.slug ? `/hospitals/${o.hospital.slug}` : `/hospitals/${o.hospital.id}`
                return (
                  <li key={`${o.kind}-${o.id}`}>
                    <article className="bg-white border border-gray-100 rounded-card p-5 hover:border-kerala-300 transition-colors h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 border rounded font-bold ${tone}`}><Icon className="w-3 h-3 inline mr-1" />{isPkg ? 'Package' : 'Offer'}</span>
                        {isPkg && o.isFeatured && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Featured</span>}
                        {endsBadge && <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${endsBadge.tone}`}><Clock className="w-3 h-3 inline" /> {endsBadge.label}</span>}
                      </div>
                      <Link href={detailHref} className="font-serif text-lg text-kerala-800 leading-snug hover:underline">{o.title}</Link>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{isPkg ? o.description : (o.subtitle ?? '')}</p>
                      <p className="text-xs mt-3"><Link href={hospitalHref} className="text-kerala-700 hover:underline font-semibold">{o.hospital.name}</Link> <span className="text-gray-500"><MapPin className="w-3 h-3 inline" /> {o.hospital.district}</span></p>
                      <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
                        {isPkg && (
                          <>
                            <span className="text-sm font-semibold text-kerala-700">{fmtPrice(o.priceFrom, o.priceTo, o.currency)}</span>
                            <span className="text-xs text-gray-500">· {o.duration}</span>
                          </>
                        )}
                        <Link href={detailHref} className="ml-auto inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-kerala-700 text-white rounded font-semibold">
                          {isPkg ? 'View package' : (o.ctaLabel ?? 'Inquire')} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        <section className="mt-12 max-w-2xl mx-auto p-5 bg-kerala-50 border border-kerala-100 rounded-card text-center">
          <p className="font-serif text-lg text-kerala-800">Hospital? Post your offers + packages — free</p>
          <p className="text-sm text-gray-700 mt-1">List on AyurConnect to reach patients searching for treatments daily.</p>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <Link href="/hospitals/register" className="text-xs px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold">Register hospital</Link>
            <Link href="/hospital/dashboard/marketing" className="text-xs px-3 py-1.5 border-2 border-kerala-700 text-kerala-700 rounded font-semibold inline-flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> Post an offer
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
