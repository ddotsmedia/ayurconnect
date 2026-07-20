import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import {
  Briefcase, Calendar, Stethoscope, Building2,
  AlertCircle, ArrowRight, BarChart3, FileText,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { getServerSession } from '../../../lib/auth'

export const metadata = { title: 'Admin dashboard', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Thin overview page for admins — aggregates counts across the moderation
// queues + platform stats and links to the existing deep admin tools
// (/admin/jobs, /admin/events, /admin/analytics, etc.). Deliberately does
// NOT rebuild the deep surfaces — this is the landing page.

type Counts = {
  pendingJobs:       number
  pendingEvents:     number
  pendingDoctors:    number
  pendingHospitals:  number
  totalDoctors:      number
  totalHospitals:    number
  totalUsers:        number
  activeJobs:        number
  approvedEvents:    number
}

async function fetchCounts(): Promise<Counts> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  const opt    = { headers: { cookie }, cache: 'no-store' as const }
  async function count(path: string, key = 'total'): Promise<number> {
    try {
      const r = await fetch(`${API}${path}`, opt)
      if (!r.ok) return 0
      const d = await r.json() as Record<string, unknown>
      const pag = d.pagination as { total?: unknown } | undefined
      if (typeof pag?.total === 'number') return pag.total
      if (typeof d[key]      === 'number') return d[key] as number
      if (Array.isArray(d))                return d.length
      const items = d.items as unknown
      if (Array.isArray(items))            return items.length
      // Fallback: array under any key
      for (const v of Object.values(d)) if (Array.isArray(v)) return v.length
      return 0
    } catch { return 0 }
  }

  const [
    pendingJobsD, activeJobsD,
    pendingEventsD, approvedEventsD,
    pendingDoctorsD, totalDoctorsD,
    pendingHospitalsD, totalHospitalsD,
    totalUsersD,
  ] = await Promise.all([
    count('/jobs?status=pending&includeAll=1&limit=1'),
    count('/jobs?status=active&includeAll=1&limit=1'),
    count('/admin/events?status=pending&limit=1'),
    count('/admin/events?status=approved&limit=1'),
    count('/admin/doctors?status=pending&limit=1', 'count'),
    count('/doctors?limit=1'),
    count('/admin/hospitals?status=pending&limit=1', 'count'),
    count('/hospitals?limit=1'),
    count('/admin/users?limit=1', 'count'),
  ])

  return {
    pendingJobs:      pendingJobsD,
    pendingEvents:    pendingEventsD,
    pendingDoctors:   pendingDoctorsD,
    pendingHospitals: pendingHospitalsD,
    totalDoctors:     totalDoctorsD,
    totalHospitals:   totalHospitalsD,
    totalUsers:       totalUsersD,
    activeJobs:       activeJobsD,
    approvedEvents:   approvedEventsD,
  }
}

export default async function AdminDashboardPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/dashboard')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const c = await fetchCounts()
  const firstName = sess.user.name?.split(/\s+/)[0] ?? 'admin'

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Admin</p>
        <h1 className="font-serif text-2xl md:text-3xl text-ink">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted mt-1">Moderation queues, platform stats, deep tools.</p>
      </header>

      {/* Moderation queue — the "needs attention" row. */}
      <section>
        <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2 inline-flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Awaiting your review</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <QueueCard href="/admin/jobs?tab=pending"       label="Pending jobs"      count={c.pendingJobs}      Icon={Briefcase} />
          <QueueCard href="/admin/events?tab=pending"     label="Pending events"    count={c.pendingEvents}    Icon={Calendar} />
          <QueueCard href="/admin/doctors?status=pending" label="Pending doctors"   count={c.pendingDoctors}   Icon={Stethoscope} />
          <QueueCard href="/admin/hospitals"              label="Pending hospitals" count={c.pendingHospitals} Icon={Building2} />
        </div>
      </section>

      {/* Platform totals. */}
      <section>
        <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2 inline-flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-kerala-700" /> Platform totals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <StatCard label="Doctors"     value={c.totalDoctors}   tone="kerala" />
          <StatCard label="Hospitals"   value={c.totalHospitals} tone="kerala" />
          <StatCard label="Users"       value={c.totalUsers}     tone="ink" />
          <StatCard label="Active jobs" value={c.activeJobs}     tone="ink" />
        </div>
      </section>

      {/* Deep-tool links. */}
      <section>
        <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2 inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-kerala-700" /> Deep tools</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          <ToolLink href="/admin/analytics"           label="Analytics & funnels" />
          <ToolLink href="/admin/jobs"                label="Job moderation queue" />
          <ToolLink href="/admin/events"              label="Event moderation queue" />
          <ToolLink href="/admin/applications-report" label="Job applications report" />
          <ToolLink href="/admin/saved-jobs-report"   label="Saved jobs report" />
          <ToolLink href="/admin/verify"              label="Doctor verification queue" />
          <ToolLink href="/admin/consultation-requests" label="Consultation requests" />
          <ToolLink href="/admin/feedback"            label="User feedback" />
        </ul>
      </section>
    </div>
  )
}

function QueueCard({ href, label, count, Icon }: { href: string; label: string; count: number; Icon: React.ComponentType<{ className?: string }> }) {
  const hot = count > 0
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between h-full min-h-[76px] md:min-h-[104px] p-3 md:p-4 rounded-card shadow-card transition-colors border ${hot ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-gray-100 hover:border-kerala-300'}`}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`w-4 h-4 ${hot ? 'text-amber-700' : 'text-gray-500'} flex-shrink-0`} />
        <span className={`text-[11px] md:text-xs font-semibold uppercase tracking-wider ${hot ? 'text-amber-800' : 'text-gray-600'}`}>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`font-serif text-2xl md:text-3xl tabular-nums ${hot ? 'text-amber-800' : 'text-gray-400'}`}>{count}</span>
        <ArrowRight className={`w-4 h-4 ${hot ? 'text-amber-700' : 'text-gray-400 group-hover:text-kerala-700'}`} />
      </div>
    </Link>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'kerala' | 'ink' }) {
  const t = tone === 'kerala' ? 'text-kerala-700' : 'text-ink'
  return (
    <div className="bg-white border border-gray-100 rounded-card p-3 md:p-4 shadow-card">
      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className={`font-serif text-2xl md:text-3xl tabular-nums mt-1 ${t}`}>{value.toLocaleString()}</p>
    </div>
  )
}

function ToolLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between bg-white border border-gray-100 rounded-card px-3 py-2.5 md:px-4 md:py-3 text-sm hover:border-kerala-300 hover:bg-cream/40 transition-colors">
        <span className="text-ink">{label}</span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </Link>
    </li>
  )
}

