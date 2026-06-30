import type { Metadata } from 'next'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'

export const metadata: Metadata = {
  title: 'Leaderboard — AyurConnect Top Contributors',
  description: 'Top AyurConnect contributors this month and all-time, ranked by points earned through daily check-ins, MCQ challenges, forum answers, and referrals.',
  alternates: { canonical: '/leaderboard' },
}

type LBRow = { userId: string; user?: { name: string | null } | null; totalPoints?: number; monthlyPoints?: number; currentStreak?: number; level?: string; name?: string | null }

async function fetchLB(): Promise<{ allTime: LBRow[]; monthly: LBRow[] }> {
  try {
    const res = await fetch(`${API}/streak/leaderboard`, { next: { revalidate: 300 } })
    if (!res.ok) { logServerFetchError('leaderboard', `HTTP ${res.status}`); return { allTime: [], monthly: [] } }
    return await res.json()
  } catch (err) { logServerFetchError('leaderboard', err); return { allTime: [], monthly: [] } }
}

function firstNameAndInitial(name: string | null | undefined): string {
  if (!name) return 'Anonymous'
  const parts = name.replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Anonymous'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
}

const LEVEL_COLOR: Record<string, string> = {
  beginner:    'bg-gray-100 text-gray-700',
  learner:     'bg-blue-100 text-blue-800',
  practitioner:'bg-emerald-100 text-emerald-800',
  expert:      'bg-amber-100 text-amber-800',
  master:      'bg-rose-100 text-rose-800',
}

export default async function LeaderboardPage() {
  const { allTime, monthly } = await fetchLB()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-serif text-3xl text-kerala-800">Leaderboard</h1>
      <p className="text-sm text-gray-600 mt-1">Top AyurConnect contributors — points earned via daily check-ins, MCQ challenges, forum answers, and referrals.</p>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-kerala-700 mb-3">This month</h2>
        <Table rows={monthly} pointsKey="monthlyPoints" />
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-kerala-700 mb-3">All-time</h2>
        <Table rows={allTime} pointsKey="totalPoints" />
      </section>

      <p className="text-xs text-gray-500 mt-8">Names are shown as first name + last initial. Sign in to appear on the leaderboard.</p>
    </div>
  )
}

function Table({ rows, pointsKey }: { rows: LBRow[]; pointsKey: 'monthlyPoints' | 'totalPoints' }) {
  if (rows.length === 0) return <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-6 text-center">No data yet — be the first.</p>
  return (
    <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
      <table className="w-full text-sm">
        <thead className="bg-cream/60">
          <tr><th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600">#</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600">Name</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600">Level</th>
              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-gray-600">Points</th>
              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider text-gray-600 hidden md:table-cell">Streak</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => {
            const name = firstNameAndInitial(r.user?.name ?? r.name)
            const lvl = r.level ?? 'beginner'
            return (
              <tr key={r.userId}>
                <td className="px-3 py-2 font-mono text-gray-500">{i + 1}</td>
                <td className="px-3 py-2 font-semibold text-ink">{name}</td>
                <td className="px-3 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full ${LEVEL_COLOR[lvl] ?? LEVEL_COLOR.beginner}`}>{lvl}</span></td>
                <td className="px-3 py-2 text-right font-semibold">{r[pointsKey] ?? 0}</td>
                <td className="px-3 py-2 text-right text-gray-500 hidden md:table-cell">{r.currentStreak ? `🔥 ${r.currentStreak}` : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
