import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Building2, ShieldCheck, MapPin, Award, Phone } from 'lucide-react'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { pageMetadata } from '../../../../lib/seo'

const KERALA_DISTRICTS = [
  'thiruvananthapuram','kollam','pathanamthitta','alappuzha','kottayam',
  'idukki','ernakulam','thrissur','palakkad','malappuram',
  'kozhikode','wayanad','kannur','kasaragod',
]
export const DISTRICT_SLUGS = KERALA_DISTRICTS

function deslug(slug: string): string {
  return slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ')
}

type Hospital = {
  id: string; name: string; type: string; district: string; ccimVerified: boolean; ayushCertified: boolean
  panchakarma: boolean; nabh: boolean; profile: string | null; contact: string | null; reviews?: { rating: number }[]
}

async function fetchHospitals(district: string): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals?district=${encodeURIComponent(district)}&limit=200`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Hospital[]
  } catch { return [] }
}

export function generateStaticParams() { return KERALA_DISTRICTS.map((district) => ({ district })) }

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const { district } = await params
  const dName = deslug(district)
  return pageMetadata({
    path:        `/hospitals/in/${district}`,
    title:       `Ayurveda Hospitals in ${dName}, Kerala | AyurConnect`,
    description: `Verified Ayurveda hospitals, Panchakarma centres, and wellness clinics in ${dName} district, Kerala. NABH, AYUSH-certified, Tourism-classified options with patient reviews.`,
    keywords:    [`ayurveda hospital ${dName}`, `panchakarma ${dName}`, `ayurveda clinic ${dName} kerala`, `best ayurveda treatment ${dName}`],
  })
}

export default async function HospitalsInDistrictPage({ params }: { params: Promise<{ district: string }> }) {
  const { district } = await params
  if (!KERALA_DISTRICTS.includes(district)) notFound()
  const dName = deslug(district)
  const items = await fetchHospitals(dName)
  // Data-gate: noindex if <3
  const lowData = items.length < 3

  return (
    <>
      {lowData && <meta name="robots" content="noindex,follow" />}
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> {dName} · Kerala
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Hospitals in {dName}</h1>
          <p className="text-white/85 mt-3">Verified centres — AYUSH, NABH, Tourism Classified. {items.length} listed.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600 bg-white border border-gray-100 rounded-card p-8 text-center">No verified hospitals listed in {dName} yet. <Link href="/hospitals/register" className="text-kerala-700 hover:underline">List yours →</Link></p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((h) => {
              const ratings = h.reviews?.map((r) => r.rating) ?? []
              const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null
              return (
                <Link key={h.id} href={`/hospitals/${h.id}`} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-7 h-7 text-kerala-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-ink">{h.name}{h.ccimVerified && <ShieldCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />}</h2>
                      <p className="text-xs text-gray-600 capitalize">{h.type} · {h.district}</p>
                      {h.profile && <p className="text-xs text-gray-700 mt-1 line-clamp-2">{h.profile}</p>}
                      <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                        {h.ayushCertified && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">AYUSH</span>}
                        {h.nabh           && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded">NABH</span>}
                        {h.panchakarma    && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">Panchakarma</span>}
                      </div>
                      <div className="mt-2 flex gap-3 text-xs text-gray-600">
                        {avg && <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" />{avg} ({ratings.length})</span>}
                        {h.contact && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{h.contact}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <section className="mt-10 bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-6 text-center">
          <h2 className="font-serif text-xl text-ink">List your hospital in {dName}</h2>
          <p className="text-sm text-gray-700 mt-2">Free verified profile, patient inquiries, WhatsApp integration.</p>
          <Link href="/hospitals/register" className="mt-3 inline-block px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold">Register your hospital →</Link>
        </section>
      </section>
    </>
  )
}
