import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Video, Calendar, Globe, ChevronRight, Award } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { SeminarTabs } from './_seminar-tabs'

type Seminar = {
  id: string; slug: string; title: string; description: string; speakerName: string
  scheduledFor: string; durationMin: number; cmeCredits: number; status: string
  recordingUrl: string | null; thumbnailUrl: string | null; specialty: string | null; topics: string[]
}

async function fetchSeminars(tab: 'upcoming' | 'past'): Promise<Seminar[]> {
  try {
    const res = await fetch(`${API}/seminars?tab=${tab}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { seminars: Seminar[] }
    return data.seminars ?? []
  } catch { return [] }
}

export const metadata: Metadata = {
  title: 'Ayurveda Seminars & Webinars — Live + On-Demand | AyurConnect',
  description: 'Live + recorded Ayurveda seminars: classical Panchakarma technique, modern clinical correlations, AYUSH research updates. CME-credit-eligible for verified doctors. Open to the public.',
  alternates: { canonical: '/seminars' },
}

export default async function SeminarsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams
  const tab: 'upcoming' | 'past' = sp.tab === 'past' ? 'past' : 'upcoming'
  const seminars = await fetchSeminars(tab)

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Video className="w-3 h-3" /> Live + recorded
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Seminars</h1>
          <p className="mt-5 text-lg text-white/80">
            Practising vaidyas teaching classical technique. AYUSH research updates. Clinical case discussions. Free for patients, CME-credit-eligible for verified doctors.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <SeminarTabs active={tab} />
        {seminars.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700">No {tab} seminars listed right now.</p>
            <p className="text-xs text-gray-500 mt-1">Check back soon — new sessions are added monthly.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {seminars.map((s) => <SeminarCard key={s.id} seminar={s} tab={tab} />)}
          </ul>
        )}

        <section className="mt-10 bg-cream border border-gray-100 rounded-card p-6 text-center">
          <Award className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-ink mb-2">Are you a verified BAMS doctor?</h2>
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-4">
            Every seminar grants CME credits towards your annual target. Track them in the Doctor Hub.
          </p>
          <Link href="/dr/cme" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Doctor CME centre <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </section>
    </>
  )
}

function SeminarCard({ seminar: s, tab }: { seminar: Seminar; tab: 'upcoming' | 'past' }) {
  const when = new Date(s.scheduledFor)
  const type: 'Online' | 'Offline' = 'Online'
  const fmtDate = when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const fmtTime = when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <div className="flex items-start gap-3 flex-wrap mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
          <Globe className="w-3 h-3" /> {type}
        </span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold">{s.cmeCredits} credit{s.cmeCredits === 1 ? '' : 's'}</span>
        {s.specialty && <span className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded">{s.specialty}</span>}
      </div>
      <h3 className="font-serif text-lg text-ink">{s.title}</h3>
      <p className="text-xs text-muted mt-0.5">{s.speakerName} · {s.durationMin} min</p>
      <p className="text-xs text-gray-600 mt-2 inline-flex items-center gap-1">
        <Calendar className="w-3 h-3" /> {fmtDate} · {fmtTime}
      </p>
      {s.description && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{s.description}</p>}
      {(s.topics?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {s.topics.slice(0, 6).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{t}</span>)}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {tab === 'past' && s.recordingUrl ? (
          <a href={s.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
            Watch recording <Video className="w-3.5 h-3.5" />
          </a>
        ) : tab === 'upcoming' ? (
          <Link href={`/seminars/${s.slug}`} className="inline-flex items-center gap-1 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
            Details &amp; register <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
