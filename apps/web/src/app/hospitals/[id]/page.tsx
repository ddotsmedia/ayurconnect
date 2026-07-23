import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ShieldCheck, MapPin, Phone, Calendar, Building2, Star, ArrowRight, MessageCircle, Stethoscope, Package, Clock, Sparkles, Wifi } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { hospitalLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'
import { mapsDirectionsUrl, mapsLatLngUrl } from '../../../lib/maps'
import { getServerSession } from '../../../lib/auth'
import { ReviewForm } from '../../../components/review-form'
import { VerificationBadges } from '../../../components/seo/VerificationBadges'
import { SocialLinksDisplay } from '../../../components/social-links'
import { HospitalGallery } from '../../../components/hospital/HospitalGallery'
import { HospitalInquiryForm } from '../../../components/hospital/HospitalInquiryForm'
import { HospitalViewBeacon } from '../../../components/hospital/HospitalViewBeacon'

type Hospital = {
  id: string
  name: string
  nameMl: string | null
  type: string
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  classification: string | null
  tourismClass: string | null
  establishedYear: number | null
  services: string[]
  treatments: string[]
  facilities: string[]
  photos: string[]
  languages: string[]
  paymentMethods: string[]
  operatingHours: Record<string, { open: string; close: string; closed: boolean }> | null
  profile: string | null
  profileMl: string | null
  contact: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  pincode: string | null
  latitude: number | null
  longitude: number | null
  websiteUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  reviews: Array<{ id: string; rating: number; comment: string | null; createdAt: string; user?: { name?: string | null } | null }>
}

type Package = { id: string; name: string; description: string; duration: string; priceFrom: number; priceTo: number | null; currency: string; includes: string[]; idealFor: string[]; treatments: string[] }
type TeamMember = { id: string; doctorId: string; role: string | null; position: number; doctor: { id: string; name: string; specialization: string; district: string; ccimVerified: boolean; qualification: string | null; photoUrl: string | null; languages?: string[]; experienceYears?: number | null } }
type Promotion = { id: string; title: string; subtitle: string | null; ctaLabel: string | null; ctaUrl: string | null; endsAt: string | null }
type ResponseRow = { id: string; reviewId: string; body: string; updatedAt: string }

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

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
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
  const [h, sess, packages, team, promotions, responses] = await Promise.all([
    fetchHospital(id),
    getServerSession(),
    fetchJson<Package[]>(`/hospitals-public/${id}/packages`),
    fetchJson<TeamMember[]>(`/hospitals-public/${id}/team`),
    fetchJson<Promotion[]>(`/hospitals-public/${id}/promotions`),
    fetchJson<ResponseRow[]>(`/hospitals-public/${id}/review-responses`),
  ])
  if (!h) notFound()

  const related = await fetchRelated(h.district, h.id)
  const ratings = (h.reviews ?? []).map((r) => r.rating)
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
  const responseByReviewId = new Map((responses ?? []).map((r) => [r.reviewId, r]))

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
                  <ShieldCheck className="w-3 h-3" /> Verified
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

      <HospitalViewBeacon hospitalId={h.id} />

      {/* Promotions banner */}
      {promotions && promotions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-y border-amber-200">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <strong className="text-amber-900">{promotions[0].title}</strong>
            {promotions[0].subtitle && <span className="text-amber-800">{promotions[0].subtitle}</span>}
            {promotions[0].ctaUrl && promotions[0].ctaLabel && (
              <a href={promotions[0].ctaUrl} className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-kerala-700 text-white rounded text-xs font-semibold">{promotions[0].ctaLabel} <ArrowRight className="w-3 h-3" /></a>
            )}
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-10">
          {/* Photo gallery */}
          {h.photos && h.photos.length > 0 && (
            <section>
              <HospitalGallery photos={h.photos} alt={h.name} />
            </section>
          )}

          <VerificationBadges entityType="centre" entityId={h.id} />
          {h.profile && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-3">About</h2>
              {h.nameMl && <p className="font-serif text-xl text-ink mb-2" dir="auto">{h.nameMl}</p>}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{h.profile}</p>
              {h.profileMl && <p className="text-gray-700 leading-relaxed whitespace-pre-line mt-3 italic" dir="auto">{h.profileMl}</p>}
            </section>
          )}

          {/* Treatment packages */}
          {packages && packages.length > 0 && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4 inline-flex items-center gap-2"><Package className="w-5 h-5" /> Treatment packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {packages.map((p) => (
                  <article key={p.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                    <h3 className="font-semibold text-ink">{p.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{p.duration} · {p.currency} {p.priceFrom.toLocaleString()}{p.priceTo ? ` – ${p.priceTo.toLocaleString()}` : ''}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">{p.description}</p>
                    {p.includes.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1 text-[10px]">
                        {p.includes.slice(0, 4).map((inc) => <li key={inc} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">{inc}</li>)}
                      </ul>
                    )}
                    <a href="#inquiry" className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline">Inquire about this package →</a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Doctor team */}
          {team && team.length > 0 && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4 inline-flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Our doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {team.map((m) => (
                  <Link key={m.id} href={`/doctors/${m.doctor.id}`} className="bg-white border border-gray-100 rounded-card p-3 shadow-card flex items-center gap-3 hover:shadow-cardLg">
                    <div className="w-14 h-14 rounded-full bg-kerala-50 flex items-center justify-center text-kerala-700 font-bold flex-shrink-0 overflow-hidden">
                      {m.doctor.photoUrl ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={m.doctor.photoUrl} alt="" className="w-full h-full object-cover" />
                        : m.doctor.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{m.doctor.name}{m.doctor.ccimVerified && <ShieldCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />}</p>
                      <p className="text-xs text-gray-600">{m.doctor.specialization}{m.role ? ` · ${m.role}` : ''}</p>
                      {m.doctor.qualification && <p className="text-[10px] text-gray-500">{m.doctor.qualification}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Treatments offered */}
          {h.treatments && h.treatments.length > 0 && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4">Treatments offered</h2>
              <div className="flex flex-wrap gap-2">
                {h.treatments.map((t) => (
                  <Link key={t} href={`/treatments/${t.toLowerCase().replace(/\s+/g, '-')}`} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm hover:bg-emerald-100">{t}</Link>
                ))}
              </div>
            </section>
          )}

          {/* Facilities */}
          {h.facilities && h.facilities.length > 0 && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4">Facilities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {h.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded">
                    <Wifi className="w-3.5 h-3.5 text-kerala-700" />{f}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Operating hours */}
          {h.operatingHours && (
            <section>
              <h2 className="text-2xl text-kerala-700 mb-4 inline-flex items-center gap-2"><Clock className="w-5 h-5" /> Operating hours</h2>
              <dl className="bg-white border border-gray-100 rounded-card p-4 shadow-card text-sm grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-md">
                {(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const).map((d) => {
                  const oh = h.operatingHours?.[d]
                  return (
                    <div key={d} className="flex justify-between gap-3">
                      <dt className="font-semibold text-gray-700">{d}</dt>
                      <dd className="text-gray-600">{oh?.closed ? 'Closed' : oh ? `${oh.open} – ${oh.close}` : '—'}</dd>
                    </div>
                  )
                })}
              </dl>
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
              <p className="text-gray-700">{h.address}{h.pincode ? ` · ${h.pincode}` : ''}</p>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${h.name}, ${h.address}, ${h.district}`)}&output=embed`}
                title={`Map of ${h.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-64 mt-3 rounded border border-gray-100"
              />
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
                {h.reviews.slice(0, 5).map((r) => {
                  const resp = responseByReviewId.get(r.id)
                  return (
                    <article key={r.id} className="bg-white rounded-card border border-gray-100 p-5 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">{r.user?.name ?? 'Anonymous'}</div>
                        <div className="flex items-center gap-0.5 text-gold-400">
                          {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
                      <div className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                      {resp && (
                        <div className="mt-3 pl-3 border-l-2 border-kerala-300 bg-kerala-50/40 p-2.5 rounded">
                          <p className="text-xs font-semibold text-kerala-700">Hospital response · {new Date(resp.updatedAt).toLocaleDateString('en-GB')}</p>
                          <p className="text-sm text-gray-800 mt-0.5">{resp.body}</p>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR — matches /doctors/[id] sticky pattern */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Inquiry form */}
          <div id="inquiry">
            <HospitalInquiryForm hospitalId={h.id} hospitalName={h.name} />
          </div>

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
            {(h.whatsapp ?? h.contact) && (
              <a href={`https://wa.me/${(h.whatsapp ?? h.contact ?? '').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25d366] hover:opacity-90 text-white font-semibold rounded-md text-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 font-semibold rounded-md text-sm">
              <MapPin className="w-4 h-4" /> Directions
            </a>
            {h.email && (
              <a href={`mailto:${h.email}`} className="mt-2 block text-center text-xs text-kerala-700 hover:underline">{h.email}</a>
            )}
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

          {/* Social links — only shown if hospital filled any; WhatsApp auto-derived from contact phone */}
          {(h.websiteUrl || h.linkedinUrl || h.facebookUrl || h.instagramUrl || h.twitterUrl || h.youtubeUrl || h.contact) && (
            <div className="bg-white rounded-card border border-gray-100 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Follow / connect</h3>
              <SocialLinksDisplay
                links={{
                  websiteUrl:   h.websiteUrl,
                  linkedinUrl:  h.linkedinUrl,
                  facebookUrl:  h.facebookUrl,
                  instagramUrl: h.instagramUrl,
                  twitterUrl:   h.twitterUrl,
                  youtubeUrl:   h.youtubeUrl,
                }}
                whatsappPhone={h.contact}
              />
            </div>
          )}

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
export const revalidate = 3600
