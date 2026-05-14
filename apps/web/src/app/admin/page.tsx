import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type StatsResponse = {
  counts: Record<string, number>
}

type QueueCounts = {
  doctors:   { pending: number; needsInfo: number; flagged: number; total: number }
  hospitals: { pending: number; needsInfo: number; flagged: number; total: number }
}

const TILES: Array<{ key: string; label: string; href?: string }> = [
  { key: 'users',        label: 'Users',                href: '/admin/users' },
  { key: 'doctors',      label: 'Doctors',              href: '/admin/doctors' },
  { key: 'hospitals',    label: 'Hospitals',            href: '/admin/hospitals' },
  { key: 'herbs',        label: 'Herbs',                href: '/admin/herbs' },
  { key: 'colleges',     label: 'Colleges',             href: '/admin/colleges' },
  { key: 'tourism',      label: 'Tourism packages',     href: '/admin/tourism' },
  { key: 'jobs',         label: 'Jobs',                 href: '/admin/jobs' },
  { key: 'articles',     label: 'Knowledge articles',   href: '/admin/articles' },
  { key: 'posts',        label: 'Forum posts',          href: '/admin/forum' },
  { key: 'comments',     label: 'Forum comments' },
  { key: 'reviews',      label: 'Reviews',              href: '/admin/reviews' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'sessions',     label: 'Active sessions' },
]

export default async function AdminDashboard() {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  let counts: Record<string, number> = {}
  let queueCounts: QueueCounts | null = null
  let error: string | null = null
  try {
    const [statsRes, queueRes] = await Promise.all([
      fetch(`${API}/admin/stats`,                 { headers: { cookie }, cache: 'no-store' }),
      fetch(`${API}/hospitals/_admin/queue-counts`, { headers: { cookie }, cache: 'no-store' }),
    ])
    if (statsRes.ok) counts = ((await statsRes.json()) as StatsResponse).counts
    else error = `${statsRes.status} ${statsRes.statusText}`
    if (queueRes.ok) queueCounts = (await queueRes.json()) as QueueCounts
  } catch (e) {
    error = String(e)
  }

  const totalNeedsAction = queueCounts
    ? queueCounts.doctors.total + queueCounts.hospitals.total
    : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Live counts across the platform.</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">stats fetch failed: {error}</div>}

      {/* Approval queue spotlight — shows only when there's something to action. */}
      {queueCounts && totalNeedsAction > 0 && (
        <Link href="/admin/verify" className="block">
          <section className="p-5 rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-amber-900">
                  {totalNeedsAction} record{totalNeedsAction === 1 ? '' : 's'} need your review →
                </h2>
                <p className="text-sm text-amber-800 mt-1">
                  Approve, request more info, flag, or decline. Owner users get notified automatically.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {queueCounts.doctors.pending > 0 && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-semibold">
                      {queueCounts.doctors.pending} doctor{queueCounts.doctors.pending === 1 ? '' : 's'} pending
                    </span>
                  )}
                  {queueCounts.doctors.needsInfo > 0 && (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-semibold">
                      {queueCounts.doctors.needsInfo} doctor{queueCounts.doctors.needsInfo === 1 ? '' : 's'} needs info
                    </span>
                  )}
                  {queueCounts.doctors.flagged > 0 && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-900 rounded-full font-semibold">
                      {queueCounts.doctors.flagged} doctor{queueCounts.doctors.flagged === 1 ? '' : 's'} flagged
                    </span>
                  )}
                  {queueCounts.hospitals.pending > 0 && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-semibold">
                      {queueCounts.hospitals.pending} hospital{queueCounts.hospitals.pending === 1 ? '' : 's'} pending
                    </span>
                  )}
                  {queueCounts.hospitals.needsInfo > 0 && (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-full font-semibold">
                      {queueCounts.hospitals.needsInfo} hospital{queueCounts.hospitals.needsInfo === 1 ? '' : 's'} needs info
                    </span>
                  )}
                </div>
              </div>
              <span className="text-2xl text-amber-700 self-center" aria-hidden="true">→</span>
            </div>
          </section>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TILES.map((tile) => {
          const value = counts[tile.key] ?? 0
          const Card = (
            <div className="p-5 bg-white rounded-lg border hover:shadow-md transition-shadow h-full">
              <div className="text-3xl font-bold text-green-800">{value.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">{tile.label}</div>
            </div>
          )
          return tile.href ? (
            <a key={tile.key} href={tile.href} className="block">{Card}</a>
          ) : (
            <div key={tile.key}>{Card}</div>
          )
        })}
      </div>
    </div>
  )
}
