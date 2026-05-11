import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ShieldCheck, MapPin, Phone, Calendar, Building2, Star, ArrowRight } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { hospitalLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'
import { mapsDirectionsUrl, mapsLatLngUrl } from '../../../lib/maps'
import { getServerSession } from '../../../lib/auth'
import { ReviewForm } from '../../../components/review-form'

type Hospital = {
  id: string
  name: string
  type: string
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  classification: string | null
  establishedYear: number | null
  services: string[]
  profile: string | null
  contact: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  reviews: Array<{ id: string; rating: number; comment: string | null; createdAt: string; user?: { name?: string | null } | null }>
}

async function fetchHospital(id: string): Promise<Hospital | null> {
  try {
    const res = await fetch(`${API}/hospitals/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Hospital
  } catch { return null }
}

async function fetchRelated(district: string, currentId: string): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals?district=${encodeURIComponent(district)}&limit=4`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as Hospital[]
    return (Array.isArray(data) ? data : []).filter((h) => h.id !== currentId).slice(0, 3)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const h = await fetchHospital(id)
  if (!h) return { title: 'Hospital not found' }

  const titleSuffix = h.classification ? ` (${h.classification === 'olive-leaf' ? 'Olive Leaf' : 'Green Leaf'} certified)` : ''
  const title = `${h.name} — ${h.type} in ${h.district}${titleSuffix}`
  const description = clip(h.profile ?? `${h.name} is an Ayurveda ${h.type} in ${h.district}, Kerala. Specializes in ${(h.services ?? []).slice(0, 3).join(', ')}.`)

  return {
    title,
    description,
    alternates: { canonical: `/hospitals/${h.id}` },
    openGraph: {
      title, description,
      url: `${SITE_URL}/hospitals/${h.id}`,
      type: 'website',
      images: [{ url: `/hospitals/${h.id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [h, sess] = await Promise.all([fetchHospital(id), getServerSession()])
  if (!h) notFound()

  const related = await fetchRelated(h.district, h.id)
  const ratings = (h.reviews ?? []).map((r) => r.rating)
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null

  const jsonLd = ldGraph(
    hospitalLd(h),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Hospitals', url: '/hospitals' },
      { name: h.district, url: `/hospitals?district=${encodeURIComponent(h.district)}` },
      { name: h.name, url: `/hospitals/${h.id}` },
    ]),
  )

  const directionsUrl = h.latitude != null && h.longitude != null
    ? mapsLatLngUrl(h.latitude, h.longitude, h.name)
    : mapsDirectionsUrl(`${h.name}, ${h.district}, Kerala, India`)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO — green gradient + leaf overlay (matches doctor profile pattern) */}
      <GradientHero variant="green" size="md">
        <nav aria-label="Breadcrumb" className="text-xs text-white/70 mb-4">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/hospitals" className="hover:text-white">Hospitals</Link>
          <span className="mx-1.5">/</span>
          <span className="text-white">{h.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/15 ring-4 ring-white/15 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {h.ccimVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500 text-white rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3 h-3" /> CCIM Verified
                </span>
              )}
              {h.classification === 'olive-leaf' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                  🌿 Olive Leaf certified
                </span>
              )}
              {h.classification === 'green-leaf' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                  🌿 Green Leaf certified
                </span>
              )}
              {h.ayushCertified && <span className="px-3 py-1 bg-white/15 border border-white/25 rounded-full text-xs">AYUSH</span>}
              {h.nabh && <span className="px-3 py-1 bg-white/15 border border-white/25 rounded-full text-xs">NABH</span>}
              {h.panchakarma && <span className="px-3 py-1 bg-white/15 border border-white/25 rounded-full text-xs">Panchakarma</span>}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">{h.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {h.district}</span>
              <span className="capitalize">{h.type}</span>
              {h.establishedYear && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {h.establishedYear}</span>}
              {avg != null && <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-gold-400 text-gold-400" /> {avg.toFixed(1)} ({ratings.length})</span>}
            </div>
          </div>
        </div>
      </GradientHero>

      {/* BODY */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-10">
          {h.profile && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{h.profile}</p>
            </section>
          )}

          {h.services?.length > 0 && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4">Services</h2>
              <div className="flex flex-wrap gap-2">
                {h.services.map((s) => (
                  <span key={s} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700">{s}</span>
                ))}
              </div>
            </section>
          )}

          {h.address && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-3">Location</h2>
              <p className="text-gray-700">{h.address}</p>
              <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md hover:bg-kerala-800 text-sm">
                Get directions on Google Maps <ArrowRight className="w-4 h-4" />
              </a>
            </section>
          )}

          <section>
            <h2 className="text-2xl text-kerala-700 mb-4">Reviews</h2>
            <div className="mb-5">
              <ReviewForm hospitalId={h.id} signedIn={!!sess} />
            </div>
            {h.reviews && h.reviews.length > 0 && (
              <div className="space-y-4">
                {h.reviews.slice(0, 5).map((r) => (
                  <article key={r.id} className="bg-white rounded-card border border-gray-100 p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">{r.user?.name ?? 'Anonymous'}</div>
                      <div className="flex items-center gap-0.5 text-gold-400">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
                    <div className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR — matches /doctors/[id] sticky pattern */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Primary CTA card */}
          <div className="bg-white rounded-card border border-gray-100 shadow-cardLg p-6">
            <h3 className="font-serif text-xl text-kerala-700">Visit this centre</h3>
            <p className="text-sm text-muted mt-1">
              {h.panchakarma
                ? 'Panchakarma + classical Ayurvedic consultation. Book a slot or call to discuss your case.'
                : 'Book an in-person consultation or call for residency packages and treatment plans.'}
            </p>
            {h.contact && (
              <a href={`tel:${h.contact.replace(/\s+/g, '')}`} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md text-sm">
                <Phone className="w-4 h-4" /> Call {h.contact}
              </a>
            )}
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 font-semibold rounded-md text-sm">
              <MapPin className="w-4 h-4" /> Directions
            </a>
            <p className="text-[11px] text-subtle mt-3 leading-relaxed">
              Booking flow opens for hospitals in a later phase. For now, calling or visiting in person is the most reliable route.
            </p>
          </div>

          {/* Quick info */}
          <div className="bg-white rounded-card border border-gray-100 shadow-card p-5">
            <h3 className="text-sm font-semibold text-gray-900">Quick info</h3>
            <dl className="mt-3 text-sm space-y-2">
              {h.contact && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-kerala-700 mt-0.5" />
                  <a href={`tel:${h.contact.replace(/\s+/g, '')}`} className="text-gray-700 hover:text-kerala-700">{h.contact}</a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-kerala-700 mt-0.5" />
                <span className="text-gray-700">{h.district}, Kerala</span>
              </div>
              {h.establishedYear && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-kerala-700 mt-0.5" />
                  <span className="text-gray-700">Established {h.establishedYear}</span>
                </div>
              )}
              <div className="flex items-start gap-2 capitalize">
                <Building2 className="w-4 h-4 text-kerala-700 mt-0.5" />
                <span className="text-gray-700">{h.type}</span>
              </div>
            </dl>
          </div>

          {/* Verification panel */}
          <div className="bg-kerala-50 border border-kerala-100 rounded-card p-4 text-xs text-kerala-900">
            <ShieldCheck className="w-4 h-4 inline mr-1" />
            <strong>Verified credentials:</strong> AYUSH / NABH / Olive-Leaf / Green-Leaf shown on this page are cross-checked against published Kerala-government registers. <Link href="/about/certifications" className="underline hover:text-kerala-700">Learn what these mean →</Link>
          </div>

          <Link href="/hospitals" className="block text-center px-4 py-2 text-sm border border-kerala-600 text-kerala-700 rounded-md hover:bg-kerala-50">
            ← All hospitals
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-xl text-kerala-700 mb-4">More in {h.district}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/hospitals/${r.id}`} className="bg-white border border-gray-100 rounded-card p-5 hover:shadow-card hover:-translate-y-0.5 transition-all">
                <div className="font-semibold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">{r.type} · {r.district}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

// Static path hints for the most-visited hospitals (helps prerender common cases).
export const dynamic = 'force-dynamic'
export const revalidate = 3600
