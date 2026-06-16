import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { Briefcase, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { getServerSession } from '../../../../../lib/auth'
import { API_INTERNAL } from '../../../../../lib/server-fetch'

export const metadata = { title: 'Employer Analytics | AyurConnect', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Dash = {
  stats: { activeJobs: number; totalJobs: number; applicationsByStatus: { status: string; _count: { _all: number } }[] }
}

async function fetchDash(): Promise<Dash | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/employers/dashboard`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return r.json() as Promise<Dash>
  } catch { return null }
}

const FUNNEL_ORDER = ['applied','viewed','shortlisted','interview_scheduled','offered','hired'] as const

export default async function EmployerAnalyticsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/employers/dashboard/analytics')
  const data = await fetchDash()
  if (!data) return <p className="container mx-auto px-4 py-10 text-sm text-gray-600">No data yet.</p>

  const byStatus = new Map(data.stats.applicationsByStatus.map((s) => [s.status, s._count._all]))
  const funnel = FUNNEL_ORDER.map((s) => ({ status: s, count: byStatus.get(s) ?? 0 }))
  const total = funnel.reduce((a, b) => a + b.count, 0) || 1
  const hires = byStatus.get('hired') ?? 0
  const conversion = total ? Math.round((hires / total) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-5">
      <h1 className="font-serif text-2xl text-ink">Analytics</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Briefcase} label="Active jobs" value={data.stats.activeJobs} />
        <Stat icon={Users} label="Applications" value={total} />
        <Stat icon={CheckCircle2} label="Hires" value={hires} />
        <Stat icon={TrendingUp} label="Conversion" value={`${conversion}%`} />
      </section>

      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-3">Pipeline funnel</h2>
        <ul className="space-y-2">
          {funnel.map((row) => (
            <li key={row.status} className="flex items-center gap-2 text-sm">
              <span className="w-40 capitalize">{row.status.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-kerala-700" style={{ width: `${Math.min(100, (row.count / total) * 100)}%` }} />
              </div>
              <span className="text-xs text-gray-700 w-10 text-right">{row.count}</span>
            </li>
          ))}
        </ul>
      </article>

      <p className="text-xs text-gray-500">For deeper insights (job views by day, source breakdown, time-to-hire) we&apos;ll add charts in a follow-up.</p>
    </div>
  )
}

function Stat({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <I className="w-5 h-5 mb-1 text-kerala-700" />
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </article>
  )
}
