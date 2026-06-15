import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { Briefcase, Users, Calendar, CheckCircle2, Plus, Search, MessageSquare, BarChart3 } from 'lucide-react'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export const metadata = { title: 'Employer Dashboard | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Dash = {
  employer: { id: string; companyName: string; slug: string; isVerified: boolean } | null
  stats: { activeJobs: number; totalJobs: number; applicationsByStatus: { status: string; _count: { _all: number } }[]; interviewsThisMonth: number; hiresThisMonth: number }
  recent: Array<{ id: string; status: string; appliedAt: string; candidate: { fullName: string; headline: string | null; currentLocation: string | null; totalExperience: number } }>
}

async function fetchDash(): Promise<Dash | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/employers/dashboard`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return r.json() as Promise<Dash>
  } catch { return null }
}

export default async function EmployerDashboardPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/employers/dashboard')
  const data = await fetchDash()
  if (!data?.employer) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl text-center">
        <h1 className="font-serif text-2xl text-ink">No employer profile yet</h1>
        <Link href="/jobs/employers/register" className="mt-3 inline-block px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold">Register your company →</Link>
      </div>
    )
  }
  const e = data.employer
  const newApps = data.stats.applicationsByStatus.find((s) => s.status === 'applied')?._count._all ?? 0
  const totalApps = data.stats.applicationsByStatus.reduce((a, b) => a + b._count._all, 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-5">
      <header className="bg-gradient-to-br from-kerala-700 to-kerala-800 text-white rounded-card p-5 shadow-cardLg">
        <p className="text-[10px] uppercase tracking-wider opacity-80">Employer portal</p>
        <h1 className="font-serif text-2xl md:text-3xl mt-1">{e.companyName}</h1>
        <p className="text-sm text-white/85 mt-1">{e.isVerified ? '✓ Verified' : 'Verification pending'}</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Briefcase} label="Active jobs"   value={data.stats.activeJobs} />
        <Stat icon={Users}     label="Applications"  value={totalApps} />
        <Stat icon={Calendar}  label="Interviews 30d" value={data.stats.interviewsThisMonth} />
        <Stat icon={CheckCircle2} label="Hires 30d"  value={data.stats.hiresThisMonth} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/jobs/employers/post" className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Plus className="w-4 h-4 text-kerala-700 mb-1" /> Post Job</Link>
        <Link href="/jobs/employers/search" className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Search className="w-4 h-4 text-kerala-700 mb-1" /> Search candidates</Link>
        <Link href="/jobs/employers/jobs" className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Briefcase className="w-4 h-4 text-kerala-700 mb-1" /> My jobs</Link>
        <Link href="/jobs/employers/dashboard/analytics" className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><BarChart3 className="w-4 h-4 text-kerala-700 mb-1" /> Analytics</Link>
      </section>

      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2"><MessageSquare className="w-5 h-5 text-kerala-700" /> Recent applications</h2>
        <p className="text-xs text-gray-600 mt-0.5">{newApps} new to review.</p>
        <ul className="mt-3 divide-y divide-gray-100">
          {data.recent.length === 0 && <li className="text-sm text-gray-500 py-3">No applications yet.</li>}
          {data.recent.map((a) => (
            <li key={a.id} className="py-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink text-sm">{a.candidate.fullName}</p>
                <p className="text-[11px] text-gray-600">{a.candidate.headline ?? '—'} · {a.candidate.currentLocation ?? '—'} · {a.candidate.totalExperience}y</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">{a.status}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

function Stat({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <I className="w-5 h-5 mb-1 text-kerala-700" />
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </article>
  )
}
