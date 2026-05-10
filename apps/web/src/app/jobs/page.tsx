import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase, MapPin, Calendar } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Job = {
  id: string
  title: string
  description: string
  type: string
  district: string | null
  salary: string | null
  createdAt: string
  user?: { name: string | null; email: string } | null
}

const TYPE_TONE: Record<string, { label: string; bg: string; text: string }> = {
  doctor:     { label: 'Doctor',     bg: 'bg-kerala-50',  text: 'text-kerala-700'  },
  therapist:  { label: 'Therapist',  bg: 'bg-amber-50',   text: 'text-amber-700'   },
  pharmacist: { label: 'Pharmacist', bg: 'bg-blue-50',    text: 'text-blue-700'    },
  government: { label: 'Government', bg: 'bg-rose-50',    text: 'text-rose-700'    },
  clinic:     { label: 'Clinic',     bg: 'bg-purple-50',  text: 'text-purple-700'  },
  teaching:   { label: 'Teaching',   bg: 'bg-teal-50',    text: 'text-teal-700'    },
}

async function fetchJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/jobs?limit=50`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { jobs: Job[] }
    return data.jobs ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Jobs in Kerala — Doctors, Therapists, Pharmacists | AyurConnect',
  description: "Kerala's largest Ayurveda jobs board. BAMS doctors, Panchakarma therapists, AYUSH pharmacists, government posts, Gulf openings. Updated daily.",
}

export default async function JobsPage() {
  const jobs = await fetchJobs()

  return (
    <>
      <GradientHero variant="jobs" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Briefcase className="w-3 h-3" /> Kerala-first Ayurveda careers
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Ayurveda Jobs Board</h1>
          <p className="text-white/70 mt-3">
            Doctors, therapists, pharmacists, researchers, teachers — Kerala&apos;s
            exclusive Ayurveda jobs board. Government posts, private clinics,
            international (Gulf / UK / US) openings.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <p className="text-sm text-muted mb-6"><strong className="text-ink">{jobs.length}</strong> open positions</p>

        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-muted">No openings posted right now.</p>
            <p className="text-xs text-subtle mt-2">Hiring? <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link> and post a job.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((j) => {
              const tone = TYPE_TONE[j.type] ?? { label: j.type, bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <article key={j.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-[11px] mb-2">
                    <span className={`${tone.bg} ${tone.text} px-2 py-0.5 rounded-full font-medium`}>{tone.label}</span>
                    <span className="text-subtle ml-auto"><Calendar className="w-3 h-3 inline mr-0.5" /> {new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink leading-snug">{j.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3 leading-relaxed">{j.description}</p>
                  <div className="mt-auto pt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {j.district && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {j.district}</div>}
                    {j.salary   && <div className="text-kerala-700 font-medium">{j.salary}</div>}
                  </div>
                  <Link
                    href="/sign-in"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-kerala-600 text-white text-sm font-semibold rounded-md hover:bg-kerala-700"
                  >
                    Apply now
                  </Link>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-10 p-5 rounded-card bg-rose-50 border border-rose-100 max-w-2xl mx-auto text-center">
          <p className="font-serif text-xl text-rose-900">🌍 Gulf & International Roles</p>
          <p className="text-sm text-rose-800 mt-2">
            UAE, Qatar, Oman, Saudi, UK, US openings posted as we get them.
            <Link href="/sign-in" className="ml-1 text-rose-700 underline">Subscribe</Link> to get notified.
          </p>
        </div>
      </div>
    </>
  )
}
