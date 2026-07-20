import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import {
  UserRound, Briefcase, Eye, FileText, GraduationCap,
  ArrowRight, Calendar, ShieldCheck, Star,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { getServerSession } from '../../../lib/auth'

export const metadata = { title: 'Doctor dashboard', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Root doctor dashboard — previously missing (only /doctor/dashboard/{cme,
// prescribe, visibility} sub-pages existed). Aggregates profile + inbox
// stats and links to the sub-pages + the shared /dashboard/profile edit.

type Me = {
  user: {
    id: string; role: string; name: string | null
    doctorId: string | null
    ownedDoctor: {
      id: string; ccimVerified: boolean; photoUrl: string | null
      profileCompleteness?: number | null
      averageRating?: number | null; reviewCount?: number | null
      moderationStatus?: string | null
    } | null
  } | null
  stats?: { apptCount?: number }
  upcomingAppts?: Array<{ id: string; dateTime: string; status: string }>
}

async function fetchMe(): Promise<Me | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const r = await fetch(`${API}/me`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as Me
  } catch { return null }
}

export default async function DoctorDashboardPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/doctor/dashboard')
  const role = sess.user.role
  if (role !== 'DOCTOR' && role !== 'DOCTOR_PENDING' && role !== 'ADMIN') redirect('/dashboard')

  const me = await fetchMe()
  const doctor = me?.user?.ownedDoctor ?? null
  const firstName = sess.user.name?.replace(/^Dr\.?\s*/i, '').split(/\s+/)[0] ?? 'doctor'
  const completeness = doctor?.profileCompleteness ?? 0
  const rating = doctor?.averageRating
  const reviewCount = doctor?.reviewCount ?? 0
  const upcomingCount = me?.upcomingAppts?.length ?? 0
  const upcomingToday = (me?.upcomingAppts ?? []).filter((a) => {
    const d = new Date(a.dateTime); const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-5xl space-y-6">
      {/* Header — pending-verification banner if applicable. */}
      <header>
        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Doctor</p>
        <h1 className="font-serif text-2xl md:text-3xl text-ink">Welcome, Dr. {firstName}</h1>
        {!doctor ? (
          <p className="text-sm text-amber-800 mt-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 inline-block">
            Your account isn't linked to a doctor profile yet. <Link href="/register/doctor" className="text-kerala-700 hover:underline font-semibold">Register as doctor →</Link>
          </p>
        ) : doctor.ccimVerified ? (
          <p className="text-xs text-kerala-800 mt-2 inline-flex items-center gap-1 bg-kerala-50 border border-kerala-200 rounded-full px-2.5 py-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified · profile live</p>
        ) : (
          <p className="text-xs text-amber-800 mt-2 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">Awaiting CCIM verification — usually 48h</p>
        )}
      </header>

      {/* Summary stats. */}
      <section>
        <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">At a glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <StatCard label="Today"       value={upcomingToday} sub="consultations" tone="kerala" Icon={Calendar} />
          <StatCard label="This week"   value={upcomingCount} sub="upcoming"      tone="kerala" Icon={Calendar} />
          <StatCard label="Rating"      value={rating != null ? rating.toFixed(1) : '—'} sub={`${reviewCount} reviews`} tone="ink" Icon={Star} />
          <StatCard label="Profile"     value={`${completeness}%`} sub="complete"  tone="ink" Icon={FileText} />
        </div>
      </section>

      {/* Actions — link to sub-surfaces that already exist. */}
      <section>
        <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold mb-2">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          <ActionCard href="/dashboard/profile"                Icon={UserRound}      title="My profile"      desc="Photo, bio, availability, socials." />
          <ActionCard href="/jobs/post"                        Icon={Briefcase}      title="Post availability" desc="Locum · part-time · collaboration." />
          <ActionCard href="/doctor/dashboard/visibility"      Icon={Eye}            title="Visibility"       desc="Search rank, referrals, share links." />
          <ActionCard href="/doctor/dashboard/prescribe"       Icon={FileText}       title="Prescribe"        desc="Write and send Rx to patients." />
          <ActionCard href="/doctor/dashboard/cme"             Icon={GraduationCap}  title="CME"              desc="Continuing education & credits." />
          <ActionCard href="/doctor/share"                     Icon={ArrowRight}     title="Share & refer"    desc="Referral code · social links." />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, sub, tone, Icon }: { label: string; value: string | number; sub: string; tone: 'kerala' | 'ink'; Icon: React.ComponentType<{ className?: string }> }) {
  const t = tone === 'kerala' ? 'text-kerala-700' : 'text-ink'
  return (
    <div className="bg-white border border-gray-100 rounded-card p-3 md:p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      </div>
      <p className={`font-serif text-2xl md:text-3xl tabular-nums mt-1 ${t}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
    </div>
  )
}

function ActionCard({ href, Icon, title, desc }: { href: string; Icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Link href={href} className="group flex flex-col justify-between h-full min-h-[80px] md:min-h-[104px] p-3 md:p-4 bg-white border border-gray-100 rounded-card shadow-card hover:border-kerala-300 hover:shadow-cardLg transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-kerala-700 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-ink truncate">{title}</h3>
      </div>
      <p className="hidden md:block text-xs text-gray-600 mt-2">{desc}</p>
      <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
    </Link>
  )
}
