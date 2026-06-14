import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Trophy, Star, MessageSquare, UserPlus, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { pageMetadata } from '../../../lib/seo'

type DocRef = { id: string; name: string; specialization: string; district: string; photoUrl: string | null; ccimVerified?: boolean; profileBadges?: string[] }

type Leaderboard = {
  topReferrers: { doctor: DocRef; count: number }[]
  mostHelpful:  { doctor: DocRef; count: number }[]
  mostReviewed: { doctor: DocRef; count: number; avg: number | null }[]
  newest:       DocRef[]
}

export const metadata: Metadata = pageMetadata({
  path: '/doctors/leaderboard',
  title: 'Top Ayurveda Doctors on AyurConnect — Leaderboard',
  description: 'Most helpful, most reviewed, top referring, and newest verified Ayurveda doctors on Kerala\'s largest directory.',
  keywords: ['top ayurveda doctors', 'best ayurveda doctors kerala', 'verified ayurveda physicians', 'ayurveda doctor leaderboard'],
})

async function fetchLeaderboard(): Promise<Leaderboard | null> {
  try {
    const r = await fetch(`${API}/doctor-viral/leaderboard`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as Leaderboard
  } catch { return null }
}

export default async function LeaderboardPage() {
  const data = await fetchLeaderboard()
  if (!data) return <p className="container mx-auto px-4 py-10 text-sm text-gray-600">Leaderboard temporarily unavailable.</p>

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Trophy className="w-3 h-3" /> Updated weekly
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Top Ayurveda Doctors on AyurConnect</h1>
          <p className="text-white/85 mt-3">Most helpful · most reviewed · top referrers · newest verified.</p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Board title="Top Referrers"   icon={UserPlus}     items={data.topReferrers.map((r, i) => ({ rank: i + 1, doctor: r.doctor, badge: `Referred ${r.count} doctor${r.count === 1 ? '' : 's'}` }))} />
        <Board title="Most Helpful"    icon={Sparkles}     items={data.mostHelpful.map((r, i)  => ({ rank: i + 1, doctor: r.doctor, badge: `${r.count} answer${r.count === 1 ? '' : 's'}` }))} />
        <Board title="Most Reviewed"   icon={Star}         items={data.mostReviewed.map((r, i) => ({ rank: i + 1, doctor: r.doctor, badge: `${r.count} review${r.count === 1 ? '' : 's'}${r.avg ? ` · ${r.avg.toFixed(1)}★` : ''}` }))} />
        <Board title="Newest Members"  icon={MessageSquare} items={data.newest.map((d, i)      => ({ rank: i + 1, doctor: d, badge: 'Recently verified' }))} />
      </div>

      <section className="bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 text-white py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Trophy className="w-12 h-12 text-amber-300 mx-auto" />
          <h2 className="font-serif text-3xl mt-3">Not on the list yet?</h2>
          <p className="text-white/85 mt-2">Register your verified profile. Answer patient questions. Refer colleagues. Climb the rankings.</p>
          <Link href="/doctors/register" className="mt-5 inline-flex items-center gap-1 px-6 py-3 bg-white text-kerala-800 font-bold rounded text-sm">Register free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
    </>
  )
}

function Board({ title, icon: Icon, items }: { title: string; icon: React.ComponentType<{ className?: string }>; items: { rank: number; doctor: DocRef; badge: string }[] }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2"><Icon className="w-5 h-5 text-kerala-700" /> {title}</h2>
      <ol className="mt-3 space-y-2">
        {items.length === 0 && <li className="text-xs text-gray-500">Nothing here yet.</li>}
        {items.slice(0, 10).map(({ rank, doctor, badge }) => (
          <li key={doctor.id} className="flex items-center gap-3 bg-cream/50 hover:bg-cream rounded p-2 transition-colors">
            <span className={'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ' + (rank === 1 ? 'bg-amber-300 text-amber-900' : rank === 2 ? 'bg-gray-200 text-gray-700' : rank === 3 ? 'bg-orange-200 text-orange-900' : 'bg-gray-100 text-gray-500')}>
              {rank}
            </span>
            <div className="w-9 h-9 rounded-full bg-kerala-50 flex items-center justify-center text-kerala-700 font-bold text-xs overflow-hidden flex-shrink-0">
              {doctor.photoUrl ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={doctor.photoUrl} alt="" className="w-full h-full object-cover" />
                : doctor.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/doctors/${doctor.id}`} className="font-semibold text-ink truncate hover:text-kerala-700 inline-flex items-center gap-1">
                {doctor.name}
                {doctor.ccimVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
              </Link>
              <p className="text-[11px] text-gray-600 truncate">{doctor.specialization} · {doctor.district}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold flex-shrink-0">{badge}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}
