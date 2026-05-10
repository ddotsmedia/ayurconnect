import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, MapPin, Phone, Award } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Hospital = {
  id: string
  name: string
  type: string
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  profile: string | null
  contact: string | null
  address: string | null
  establishedYear: number | null
  services: string[]
  reviews?: Array<{ rating: number }>
}

const TYPE_LABEL: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  panchakarma: 'Panchakarma centre',
  pharmacy: 'Pharmacy',
  wellness: 'Wellness resort',
}

async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Hospital[]
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Hospitals & Wellness Centres in Kerala | AyurConnect',
  description: 'CCIM-verified, AYUSH-certified Ayurveda hospitals, Panchakarma centres, and wellness resorts across Kerala — government and private.',
}

export default async function HospitalsPage() {
  const hospitals = await fetchHospitals()

  return (
    <>
      <GradientHero variant="hospital" size="md">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl text-white">Hospitals & Wellness Centres</h1>
          <p className="text-white/70 mt-3">
            Government Ayurveda hospitals, classical Panchakarma centres, AYUSH-certified
            wellness resorts. Cross-checked against CCIM and AYUSH registries.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-6"><strong className="text-ink">{hospitals.length}</strong> centres listed</p>

        {hospitals.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <p className="text-muted">No hospitals listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hospitals.map((h) => {
              const ratings = h.reviews?.map((r) => r.rating) ?? []
              const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null
              return (
                <article key={h.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-ink leading-snug">{h.name}</h3>
                      <p className="text-sm text-muted mt-0.5">
                        {TYPE_LABEL[h.type] ?? h.type}
                        {h.establishedYear && <> · est. {h.establishedYear}</>}
                      </p>
                    </div>
                    {h.ccimVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3" /> CCIM
                      </span>
                    )}
                  </div>

                  {h.profile && <p className="text-sm text-gray-700 line-clamp-3">{h.profile}</p>}

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {h.ayushCertified && <span className="px-2 py-0.5 text-[11px] bg-amber-50 text-amber-800 rounded-full border border-amber-200">AYUSH certified</span>}
                    {h.panchakarma   && <span className="px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">Panchakarma</span>}
                    {h.nabh          && <span className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-800 rounded-full border border-blue-200">NABH accredited</span>}
                  </div>

                  {h.services?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {h.services.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-[11px] bg-gray-100 text-gray-600 rounded">{s}</span>
                      ))}
                      {h.services.length > 4 && <span className="text-[11px] text-gray-400">+{h.services.length - 4} more</span>}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {h.district}</div>
                    {avgRating != null && (
                      <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-gold-500" /> {avgRating} ({ratings.length})</div>
                    )}
                    {h.contact && (
                      <div className="flex items-center gap-1.5 col-span-2 text-gray-500"><Phone className="w-3.5 h-3.5" /> {h.contact}</div>
                    )}
                    {h.address && (
                      <div className="col-span-2 text-gray-500 text-xs truncate">{h.address}</div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center text-sm text-muted">
          <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link> to leave a review or save a hospital.
        </div>
      </div>
    </>
  )
}
