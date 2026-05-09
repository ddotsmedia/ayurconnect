import { headers as nextHeaders } from 'next/headers'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type StatsResponse = {
  counts: Record<string, number>
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
  let error: string | null = null
  try {
    const res = await fetch(`${API}/admin/stats`, { headers: { cookie }, cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as StatsResponse
      counts = data.counts
    } else {
      error = `${res.status} ${res.statusText}`
    }
  } catch (e) {
    error = String(e)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Live counts across the platform.</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">stats fetch failed: {error}</div>}

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
