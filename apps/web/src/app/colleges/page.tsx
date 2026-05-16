import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { GraduationCap, MapPin, Phone, BookOpen } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type College = {
  id: string
  name: string
  district: string
  type: string
  profile: string | null
  contact: string | null
  address: string | null
}

const TYPE_TONE: Record<string, { label: string; bg: string; text: string }> = {
  ayurveda: { label: 'Ayurveda (BAMS / MD)', bg: 'bg-kerala-50',  text: 'text-kerala-700'  },
  modern:   { label: 'Modern medicine',       bg: 'bg-blue-50',    text: 'text-blue-700'    },
  nursing:  { label: 'Nursing',               bg: 'bg-amber-50',   text: 'text-amber-700'   },
  pharmacy: { label: 'Pharmacy',              bg: 'bg-purple-50',  text: 'text-purple-700'  },
  research: { label: 'Research institute',    bg: 'bg-teal-50',    text: 'text-teal-700'    },
}

async function fetchColleges(): Promise<College[]> {
  try {
    const res = await fetch(`${API}/colleges?limit=100`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { colleges: College[] }
    return data.colleges ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Medical Colleges in Kerala — BAMS & MD | AyurConnect',
  description: 'CCIM-affiliated BAMS and MD Ayurveda colleges across Kerala. Government and private. Established 1889 onwards.',
}

export default async function CollegesPage() {
  const colleges = await fetchColleges()

  const ayurveda = colleges.filter((c) => c.type === 'ayurveda').length

  return (
    <>
      <GradientHero variant="hospital" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <GraduationCap className="w-3 h-3" /> CCIM-affiliated
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Medical Colleges in Kerala</h1>
          <p className="text-white/70 mt-3">
            BAMS, MD Ayurveda, modern medicine, nursing and pharmacy colleges across all 14 districts.
            From Govt Ayurveda College Trivandrum (est. 1889) to today&apos;s top private institutions.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-6">
          <strong className="text-ink">{colleges.length}</strong> colleges
          {ayurveda > 0 && <> · {ayurveda} Ayurveda specifically</>}
        </p>

        {colleges.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <GraduationCap className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-muted">No colleges listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {colleges.map((c) => {
              const tone = TYPE_TONE[c.type] ?? { label: c.type, bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <article key={c.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-xl text-kerala-700 leading-snug flex-1">{c.name}</h3>
                    <span className={`${tone.bg} ${tone.text} px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap`}>{tone.label}</span>
                  </div>
                  {c.profile && (
                    <p className="text-sm text-gray-700 leading-relaxed">{c.profile}</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 gap-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {c.district}{c.address ? ` · ${c.address}` : ''}</div>
                    {c.contact && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {c.contact}</div>}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* BAMS quick-info */}
        <section className="mt-14 p-6 rounded-card bg-cream border border-gray-100">
          <h2 className="font-serif text-2xl text-kerala-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> BAMS at a glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div><strong className="text-ink">Course:</strong> Bachelor of Ayurvedic Medicine and Surgery</div>
            <div><strong className="text-ink">Duration:</strong> 5.5 years (incl. 1-yr rotating internship)</div>
            <div><strong className="text-ink">Eligibility:</strong> 10+2 with Physics / Chemistry / Biology, ≥50% marks</div>
            <div><strong className="text-ink">Entrance:</strong> NEET (UG)</div>
            <div><strong className="text-ink">Govt fees:</strong> ₹50,000 - ₹2 lakh / year</div>
            <div><strong className="text-ink">Private fees:</strong> ₹2-5 lakh / year</div>
          </div>
        </section>

        <div className="mt-10 text-center text-sm text-muted">
          Looking for a verified practising doctor? <Link href="/doctors" className="text-kerala-700 hover:underline">Browse the directory →</Link>
        </div>
      </div>
    </>
  )
}
