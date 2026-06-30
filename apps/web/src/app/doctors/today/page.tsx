import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { MCQS } from '../../learn/mcq/_data'
import { TodayClient } from './_client'
import { Calendar, BookOpen, Briefcase, MessageCircle, Stethoscope, Award } from 'lucide-react'

export const metadata = {
  title: 'Your AyurConnect Today | AyurConnect',
  description: 'Personalized daily dashboard — drug of the day, MCQ challenge, stats, jobs, events, referrals.',
  alternates: { canonical: '/doctors/today' },
  robots: { index: false, follow: false },
}

type Streak = { currentStreak: number; longestStreak: number; totalPoints: number; level: string; rank: number }

async function fetchStreak(cookie: string): Promise<Streak | null> {
  try {
    const res = await fetch(`${API}/streak/me`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function fetchFormulationOfDay(): Promise<{ name: string; id: string; href: string } | null> {
  try {
    const r = await fetch(`${API}/formulations?limit=200`, { next: { revalidate: 3600 } })
    if (!r.ok) return null
    const d = await r.json() as { formulations?: Array<{ id: string; name: string; slug?: string | null }> }
    const list = d.formulations ?? []
    if (list.length === 0) return null
    const today = new Date()
    const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
    const pick = list[seed % list.length]
    return { id: pick.id, name: pick.name, href: `/formulary/${pick.slug ?? pick.id}` }
  } catch (err) { logServerFetchError('today:formulation', err); return null }
}

async function fetchRecentArticle(): Promise<{ title: string; href: string } | null> {
  try {
    const r = await fetch(`${API}/articles?limit=1`, { next: { revalidate: 1800 } })
    if (!r.ok) return null
    const d = await r.json() as { articles?: Array<{ id: string; title: string; slug?: string | null }> }
    const a = (d.articles ?? [])[0]
    return a ? { title: a.title, href: `/articles/${a.slug ?? a.id}` } : null
  } catch { return null }
}

async function fetchRecentJobs(): Promise<Array<{ id: string; title: string; href: string; hospitalName?: string | null; location?: string | null }>> {
  try {
    const r = await fetch(`${API}/jobs?limit=3`, { next: { revalidate: 600 } })
    if (!r.ok) return []
    const d = await r.json() as { jobs?: Array<{ id: string; title: string; hospitalName?: string | null; location?: string | null; slug?: string | null }> }
    return (d.jobs ?? []).map((j) => ({ id: j.id, title: j.title, hospitalName: j.hospitalName ?? null, location: j.location ?? null, href: `/jobs/${j.slug ?? j.id}` }))
  } catch { return [] }
}

function todaysMcq(): typeof MCQS[number] {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0)
  const seed = today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
  return MCQS[seed % MCQS.length]
}

export default async function TodayPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/doctors/today')
  const cookie = ''  // browser will send credentials when client fetches
  const [streak, drug, article, jobs] = await Promise.all([
    fetchStreak(cookie),
    fetchFormulationOfDay(),
    fetchRecentArticle(),
    fetchRecentJobs(),
  ])
  const mcq = todaysMcq()
  const referralLink = `https://ayurconnect.com/doctors/register?ref=${encodeURIComponent(sess.user.id)}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-kerala-700">Your AyurConnect Today</p>
        <h1 className="font-serif text-3xl text-kerala-800">Namaste, {sess.user.name?.split(' ')[0] ?? 'Doctor'}</h1>
        <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </header>

      {/* Drug of the day */}
      {drug && (
        <section className="bg-gradient-to-r from-emerald-50 to-cream border border-emerald-200 rounded-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-emerald-700">ഇന്നത്തെ ഔഷധം — Drug of the Day</p>
          <h2 className="font-serif text-xl text-kerala-800 mt-1">{drug.name}</h2>
          <Link href={drug.href} className="mt-2 inline-flex items-center gap-1 text-xs text-kerala-700 font-semibold hover:underline">View composition + dosage →</Link>
        </section>
      )}

      {/* MCQ of the day */}
      <TodayClient mcq={mcq} initialStreak={streak} />

      {/* Stats */}
      {streak && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Streak" value={`🔥 ${streak.currentStreak}`} sub="days" />
          <Stat label="Points" value={String(streak.totalPoints)} />
          <Stat label="Level"  value={streak.level} />
          <Stat label="Rank"   value={`#${streak.rank}`} />
        </section>
      )}

      {/* Jobs */}
      {jobs.length > 0 && (
        <section className="bg-white border border-gray-100 rounded-card p-4">
          <h2 className="font-serif text-lg text-kerala-700 mb-2 inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> Recent jobs</h2>
          <ul className="space-y-1.5">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link href={j.href} className="block p-2 hover:bg-cream rounded text-sm">
                  <p className="font-semibold text-ink">{j.title}</p>
                  <p className="text-xs text-gray-500">{j.hospitalName ?? ''}{j.location ? ` · ${j.location}` : ''}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/jobs" className="text-xs text-kerala-700 hover:underline">All jobs →</Link>
        </section>
      )}

      {/* Article */}
      {article && (
        <section className="bg-white border border-gray-100 rounded-card p-4">
          <h2 className="font-serif text-lg text-kerala-700 mb-1 inline-flex items-center gap-2"><BookOpen className="w-4 h-4" /> Latest from AyurConnect</h2>
          <Link href={article.href} className="block text-sm font-semibold text-ink hover:text-kerala-700">{article.title}</Link>
        </section>
      )}

      {/* Events */}
      <section className="bg-white border border-gray-100 rounded-card p-4">
        <h2 className="font-serif text-lg text-kerala-700 mb-1 inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Upcoming events</h2>
        <Link href="/events" className="block text-xs text-kerala-700 hover:underline">Browse all events →</Link>
      </section>

      {/* Referral */}
      <section className="bg-amber-50 border border-amber-200 rounded-card p-4">
        <h2 className="font-serif text-lg text-kerala-800 inline-flex items-center gap-2"><Award className="w-4 h-4" /> Invite a colleague</h2>
        <p className="text-sm text-gray-700 mt-1">Earn 100 points when a colleague registers via your link.</p>
        <a href={`https://wa.me/?text=${encodeURIComponent(`Join AyurConnect — Kerala's free Ayurveda platform for doctors. Register: ${referralLink}`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded">
          <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
        </a>
        <p className="text-[10px] text-gray-500 mt-2 break-all">{referralLink}</p>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-2">
        <Link href="/quick-reference" className="block p-3 bg-white border border-gray-100 rounded hover:border-kerala-300 text-sm"><Stethoscope className="w-4 h-4 inline mr-1 text-kerala-700" /> Quick reference</Link>
        <Link href="/doctors/cme" className="block p-3 bg-white border border-gray-100 rounded hover:border-kerala-300 text-sm"><Award className="w-4 h-4 inline mr-1 text-kerala-700" /> CME tracker</Link>
      </section>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-ink leading-tight capitalize">{value}{sub && <span className="text-xs text-gray-500 font-normal ml-1">{sub}</span>}</p>
    </div>
  )
}
