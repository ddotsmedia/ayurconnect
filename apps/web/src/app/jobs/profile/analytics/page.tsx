import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { Eye, FileText, Award, TrendingUp } from 'lucide-react'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export const metadata = { title: 'Profile Analytics | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Me = { id: string; viewCount: number; specializations: string[] }
type Apps = Array<{ status: string }>

async function fetchAll(): Promise<{ me: Me | null; apps: Apps }> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const [m, a] = await Promise.all([
      fetch(`${API_INTERNAL}/jobs-portal/candidates/me`, { headers: { cookie }, cache: 'no-store' }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_INTERNAL}/jobs-portal/applications`,   { headers: { cookie }, cache: 'no-store' }).then((r) => r.ok ? r.json() : []).catch(() => []),
    ])
    return { me: m as Me | null, apps: a as Apps }
  } catch { return { me: null, apps: [] } }
}

export default async function CandidateAnalyticsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/profile/analytics')
  const { me, apps } = await fetchAll()
  if (!me) return <p className="container mx-auto px-4 py-10 text-sm text-gray-600">Create a profile first.</p>

  const total = apps.length
  const shortlisted = apps.filter((a) => ['shortlisted','interview_scheduled','offered','hired'].includes(a.status)).length
  const hired = apps.filter((a) => a.status === 'hired').length
  const successRate = total ? Math.round((shortlisted / total) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-5">
      <h1 className="font-serif text-2xl text-ink">Profile analytics</h1>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Eye}        label="Profile views"     value={me.viewCount} />
        <Stat icon={FileText}   label="Applications"      value={total} />
        <Stat icon={Award}      label="Shortlisted+"      value={shortlisted} />
        <Stat icon={TrendingUp} label="Success rate"      value={`${successRate}%`} sub={`${hired} hire(s)`} />
      </section>
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-2">Application breakdown</h2>
        <ul className="text-sm space-y-1">
          {['applied','viewed','shortlisted','interview_scheduled','offered','hired','rejected','withdrawn'].map((s) => {
            const n = apps.filter((a) => a.status === s).length
            return (
              <li key={s} className="flex items-center gap-2 text-xs">
                <span className="w-40 capitalize">{s.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-kerala-700" style={{ width: total ? `${(n / total) * 100}%` : '0%' }} /></div>
                <span className="w-8 text-right text-gray-600">{n}</span>
              </li>
            )
          })}
        </ul>
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
