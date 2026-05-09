import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, type DoctorCardData } from '@ayurconnect/ui'
import {
  ShieldCheck, MapPin, Star, Languages, Calendar, Award, Stethoscope,
  Users, Mail, Phone, Share2, Flag, ArrowRight,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
const ALL_DAYS: ReadonlyArray<string> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Review = { id: string; rating: number; comment: string | null; createdAt: string; user: { name: string | null } | null }
type DoctorDetail = DoctorCardData & {
  bio?: string | null
  contact?: string | null
  address?: string | null
  reviews: Review[]
  averageRating: number | null
  reviewsCount: number
}

async function fetchDoctor(id: string): Promise<DoctorDetail | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/doctors/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as DoctorDetail
  } catch {
    return null
  }
}

async function fetchRelated(district: string, currentId: string): Promise<DoctorCardData[]> {
  try {
    const res = await fetch(`${API}/doctors?district=${encodeURIComponent(district)}&limit=4`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { doctors: DoctorCardData[] }
    return (data.doctors ?? []).filter((d) => d.id !== currentId).slice(0, 3)
  } catch { return [] }
}

function initials(name: string) {
  return name.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doctor = await fetchDoctor(id)
  if (!doctor) return { title: 'Doctor not found | AyurConnect' }
  return {
    title: `${doctor.name} — ${doctor.specialization} in ${doctor.district} | AyurConnect`,
    description: doctor.profile ?? doctor.bio ?? `${doctor.name} — ${doctor.qualification ?? 'BAMS'}, ${doctor.specialization} specialist in ${doctor.district}, Kerala.`,
  }
}

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doctor = await fetchDoctor(id)
  if (!doctor) notFound()

  const related = await fetchRelated(doctor.district, doctor.id)
  const specs = doctor.specialization.split(/[,/|]/).map((s) => s.trim()).filter(Boolean)
  const availDays = new Set((doctor.availableDays ?? []).map((d) => d.slice(0, 3)))

  return (
    <>
      {/* HERO */}
      <section className="bg-hero-green text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {doctor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doctor.photoUrl} alt={doctor.name} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white/20" />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/15 text-white text-3xl font-semibold flex items-center justify-center ring-4 ring-white/20">
                {initials(doctor.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="font-serif text-3xl md:text-5xl">{doctor.name}</h1>
                {doctor.ccimVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500 text-white rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> CCIM Verified
                  </span>
                )}
              </div>
              {doctor.qualification && <p className="text-white/80 mt-1">{doctor.qualification}</p>}
              {doctor.experienceYears != null && <p className="text-white/60 text-sm">{doctor.experienceYears} years of experience</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {specs.map((s) => (
                  <span key={s} className="px-3 py-1 bg-white/12 border border-white/20 rounded-full text-xs text-white">{s}</span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                {doctor.averageRating != null && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                    <strong className="text-white">{doctor.averageRating.toFixed(1)}</strong>
                    <span className="text-white/50">({doctor.reviewsCount} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {doctor.district}</span>
                {(doctor.languages?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5"><Languages className="w-4 h-4" /> {doctor.languages!.join(', ')}</span>
                )}
                {(doctor.availableDays?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {doctor.availableDays!.join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        {/* LEFT */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl text-kerala-700 mb-3">About {doctor.name}</h2>
            {doctor.bio ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{doctor.bio}</p>
            ) : doctor.profile ? (
              <p className="text-gray-700 leading-relaxed">{doctor.profile}</p>
            ) : (
              <p className="text-muted italic">No bio added yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl text-kerala-700 mb-4">Practice details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {doctor.qualification && (
                <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-card p-4 shadow-card">
                  <Award className="w-5 h-5 text-kerala-700 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted">Qualification</div>
                    <div className="font-medium text-gray-900">{doctor.qualification}</div>
                  </div>
                </div>
              )}
              {doctor.experienceYears != null && (
                <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-card p-4 shadow-card">
                  <Stethoscope className="w-5 h-5 text-kerala-700 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted">Experience</div>
                    <div className="font-medium text-gray-900">{doctor.experienceYears} years</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <MapPin className="w-5 h-5 text-kerala-700 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">District</div>
                  <div className="font-medium text-gray-900">{doctor.district}</div>
                  {doctor.address && <div className="text-xs text-muted">{doctor.address}</div>}
                </div>
              </div>
              {(doctor.languages?.length ?? 0) > 0 && (
                <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-card p-4 shadow-card">
                  <Languages className="w-5 h-5 text-kerala-700 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted">Languages</div>
                    <div className="font-medium text-gray-900">{doctor.languages!.join(', ')}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <Users className="w-5 h-5 text-kerala-700 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Online consult</div>
                  <div className="font-medium text-gray-900">{doctor.availableForOnline ? 'Yes' : 'In-person only'}</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-kerala-700 mb-4">Available days</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const on = availDays.has(d)
                return (
                  <span
                    key={d}
                    className={
                      on
                        ? 'px-3.5 py-1.5 rounded-md bg-kerala-600 text-white text-xs font-medium'
                        : 'px-3.5 py-1.5 rounded-md bg-white border border-gray-200 text-gray-400 text-xs'
                    }
                  >
                    {d}
                  </span>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-kerala-700 mb-4">Patient reviews</h2>
            {doctor.reviews.length === 0 ? (
              <p className="text-muted italic">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {doctor.reviews.map((r) => (
                  <article key={r.id} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={i < r.rating ? 'w-4 h-4 fill-gold-400 text-gold-400' : 'w-4 h-4 text-gray-200'} />
                        ))}
                        <span className="ml-2 text-xs text-muted">{r.user?.name ?? 'Verified patient'}</span>
                      </div>
                      <span className="text-xs text-subtle">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.comment}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — sticky sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 self-start">
          <div className="bg-white rounded-card border border-gray-100 shadow-cardLg p-6">
            <h3 className="font-serif text-xl text-kerala-700">Book a consultation</h3>
            {doctor.consultationFee ? (
              <p className="text-sm text-muted mt-1">Fee from <strong className="text-ink">₹{doctor.consultationFee}</strong></p>
            ) : (
              <p className="text-sm text-muted mt-1">Schedule a video or in-person visit.</p>
            )}
            <Link
              href={`/sign-in?next=/doctors/${doctor.id}`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md text-sm"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-subtle mt-2 leading-relaxed">
              Booking flow opens in Phase 3 (Telehealth). Sign up now to be notified.
            </p>
          </div>

          {doctor.ccimVerified && (
            <div className="bg-kerala-50 border border-kerala-100 rounded-card p-5">
              <div className="flex items-center gap-2 text-kerala-700 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" /> CCIM Verified
              </div>
              <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                Cross-checked against the Central Council of Indian Medicine register. Practice license, qualification, and registration are all valid as of last verification.
              </p>
            </div>
          )}

          <div className="bg-white rounded-card border border-gray-100 p-5 space-y-2 text-sm">
            {doctor.contact && (
              <a href={`tel:${doctor.contact}`} className="flex items-center gap-2 text-gray-700 hover:text-kerala-700">
                <Phone className="w-4 h-4" /> {doctor.contact}
              </a>
            )}
            <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-kerala-700">
              <Share2 className="w-4 h-4" /> Share profile
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-red-600">
              <Flag className="w-4 h-4" /> Report this doctor
            </a>
            <a href={`mailto:hello@ayurconnect.com?subject=Question about ${encodeURIComponent(doctor.name)}`} className="flex items-center gap-2 text-gray-700 hover:text-kerala-700">
              <Mail className="w-4 h-4" /> Contact us
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-cream py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl text-kerala-700 mb-6">More {doctor.specialization} doctors in {doctor.district}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => <DoctorCard key={r.id} doctor={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
