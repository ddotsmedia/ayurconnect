import { portalFetch } from '../_fetch'
import { Eye, MessageSquare, Globe, TrendingUp } from 'lucide-react'

type Analytics = {
  windowDays: number
  inquiriesTotal: number
  inquiriesBySource:  { key: string; count: number }[]
  inquiriesByCountry: { key: string; count: number }[]
  inquiriesByStatus:  { key: string; count: number }[]
  topTreatments:      { key: string; count: number }[]
  profileViewsByDay:  { day: string; views: number }[]
  profileViewsTotal:  number
}

export default async function AnalyticsPage() {
  const a = await portalFetch<Analytics>('/api/hospital/analytics')
  if (!a) return <p className="text-sm text-gray-600">No analytics yet.</p>

  const newCt        = a.inquiriesByStatus.find((s) => s.key === 'new')?.count       ?? 0
  const contactedCt  = a.inquiriesByStatus.find((s) => s.key === 'contacted')?.count ?? 0
  const convertedCt  = a.inquiriesByStatus.find((s) => s.key === 'converted')?.count ?? 0
  const conversionRate = a.inquiriesTotal ? Math.round((convertedCt / a.inquiriesTotal) * 100) : 0
  const maxViews = Math.max(1, ...a.profileViewsByDay.map((d) => d.views))

  return (
    <div className="space-y-5">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h1 className="font-serif text-xl text-ink">Analytics</h1>
        <p className="text-xs text-gray-600">Last {a.windowDays} days</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Eye} label="Profile views" value={a.profileViewsTotal} />
        <Stat icon={MessageSquare} label="Total inquiries" value={a.inquiriesTotal} />
        <Stat icon={TrendingUp} label="Conversion rate" value={`${conversionRate}%`} sub={`${convertedCt} converted`} />
        <Stat icon={Globe} label="Countries reached" value={a.inquiriesByCountry.length} />
      </section>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-3">Profile views by day</h2>
        <div className="flex items-end gap-0.5 h-32 overflow-x-auto">
          {a.profileViewsByDay.map((d) => (
            <div key={d.day} className="flex-1 min-w-[6px] bg-kerala-700 hover:bg-kerala-800 transition-colors" title={`${d.day}: ${d.views}`} style={{ height: `${(d.views / maxViews) * 100}%` }} />
          ))}
        </div>
        {a.profileViewsByDay.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No views recorded yet.</p>}
      </article>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Chart title="Inquiry sources" rows={a.inquiriesBySource} />
        <Chart title="Patient countries" rows={a.inquiriesByCountry} />
      </section>
      <Chart title="Top treatment interests" rows={a.topTreatments} />

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-3">Inquiry funnel</h2>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <Funnel label="New"        n={newCt}        max={a.inquiriesTotal} color="bg-amber-500" />
          <Funnel label="Contacted"  n={contactedCt}  max={a.inquiriesTotal} color="bg-blue-500" />
          <Funnel label="Converted"  n={convertedCt}  max={a.inquiriesTotal} color="bg-emerald-500" />
          <Funnel label="Conversion" n={conversionRate} max={100}            color="bg-kerala-700" suffix="%" />
        </div>
      </article>
    </div>
  )
}

function Stat({ icon: I, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; sub?: string }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <I className="w-5 h-5 mb-1 text-kerala-700" />
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </article>
  )
}

function Chart({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <h2 className="font-serif text-base text-ink mb-2">{title}</h2>
      {rows.length === 0 ? <p className="text-xs text-gray-500">No data yet.</p> :
        <ul className="space-y-1.5 text-sm">
          {rows.slice(0, 10).map((r) => (
            <li key={r.key} className="flex items-center gap-2">
              <span className="w-24 truncate text-xs text-gray-700">{r.key}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-kerala-700" style={{ width: `${(r.count / max) * 100}%` }} /></div>
              <span className="text-xs text-gray-500 w-8 text-right">{r.count}</span>
            </li>
          ))}
        </ul>}
    </article>
  )
}

function Funnel({ label, n, max, color, suffix = '' }: { label: string; n: number; max: number; color: string; suffix?: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-ink">{n}{suffix}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={'h-full ' + color} style={{ width: max ? `${(n / max) * 100}%` : '0%' }} /></div>
    </div>
  )
}
