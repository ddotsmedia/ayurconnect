import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import {
  Calendar, Heart, Briefcase, Bell, Stethoscope, Activity, BookHeart,
  ArrowRight, ShieldCheck, Sparkles,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { getServerSession } from '../../../lib/auth'

export const metadata = { title: 'Patient dashboard', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Full patient dashboard (2026-07-21). Distinct from /dashboard which is the
// legacy multi-role edit surface — this page is patient-only, focused on
// consultations + saves + notifications.

type Appt = {
  id: string; dateTime: string; type: string; status: string
  doctor?: { id: string; name: string; specialization: string } | null
}
type SavedDoctor = {
  id: string; savedAt: string
  doctor: { id: string; name: string; specialization: string; district: string; photoUrl: string | null; ccimVerified: boolean; averageRating: number | null; reviewsCount: number }
}
type SavedJob   = { id: string; savedAt: string; job: { id: string; title: string; clinic: string | null; location: string | null } | null }
type Notif      = { id: string; title: string; body: string | null; read: boolean; createdAt: string; url: string | null }
type MeResponse = {
  user: { id: string; name: string | null; role: string; prakriti: string | null; doctorId: string | null; hospitalId: string | null } | null
  stats?: { savedCount?: number; apptCount?: number }
  upcomingAppts?: Appt[]
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const r = await fetch(`${API}${path}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch { return null }
}

export default async function PatientDashboardPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/patient/dashboard')
  // Redirect role-mismatched users to their own dashboard so they don't see
  // an empty patient view. Admin can preview freely.
  const role = sess.user.role
  if (role === 'DOCTOR' || role === 'DOCTOR_PENDING') redirect('/doctor/dashboard')
  if (role === 'HOSPITAL' || role === 'HOSPITAL_PENDING') redirect('/hospital/dashboard')

  const [me, allAppts, savedDoctors, savedJobs, notifs] = await Promise.all([
    fetchJson<MeResponse>('/me'),
    fetchJson<{ appointments?: Appt[] } | Appt[]>('/appointments?limit=15'),
    fetchJson<SavedDoctor[]>('/saved-doctors'),
    fetchJson<{ items?: SavedJob[] } | SavedJob[]>('/jobs-portal/wishlist'),
    fetchJson<{ items?: Notif[]; unread?: number }>('/me/notifications'),
  ])

  const firstName    = sess.user.name?.split(/\s+/)[0] ?? 'there'
  const upcoming     = me?.upcomingAppts ?? []
  const apptList     = Array.isArray(allAppts) ? allAppts : (allAppts?.appointments ?? [])
  const now          = new Date()
  const history      = apptList
    .filter((a) => new Date(a.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5)
  const savedDoctorList = savedDoctors ?? []
  const savedJobList    = Array.isArray(savedJobs) ? savedJobs : (savedJobs?.items ?? [])
  const notifList       = notifs?.items ?? []
  const unread          = notifs?.unread ?? 0

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-5xl space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Patient</p>
        <h1 className="font-serif text-2xl md:text-3xl text-ink">Welcome back, {firstName}</h1>
        {me?.user?.prakriti && (
          <p className="text-xs text-kerala-800 mt-2 inline-flex items-center gap-1 bg-kerala-50 border border-kerala-200 rounded-full px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5" /> Prakriti: <strong className="ml-0.5">{me.user.prakriti}</strong>
          </p>
        )}
        {!me?.user?.prakriti && (
          <p className="text-xs text-gray-700 mt-2">
            <Link href="/prakriti-quiz" className="text-kerala-700 hover:underline">Take the 2-minute Prakriti quiz →</Link> for personalised recommendations.
          </p>
        )}
      </header>

      {/* 4 stat cards. */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <StatCard label="Upcoming"    value={upcoming.length}       sub="consultations" tone="kerala" Icon={Calendar} />
          <StatCard label="Saved"       value={savedDoctorList.length} sub="doctors"      tone="kerala" Icon={Heart} />
          <StatCard label="Wishlist"    value={savedJobList.length}    sub="jobs saved"   tone="ink"    Icon={Briefcase} />
          <StatCard label="Alerts"      value={unread}                 sub="unread"       tone={unread > 0 ? 'amber' : 'ink'} Icon={Bell} />
        </div>
      </section>

      {/* Upcoming consultations. */}
      <section>
        <SectionHeader Icon={Calendar} title="Upcoming consultations" href="/dashboard/appointments" hrefLabel="All" />
        <article className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
          {upcoming.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 text-center italic">
              No upcoming consultations. <Link href="/doctors" className="text-kerala-700 hover:underline font-semibold">Browse doctors →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.slice(0, 5).map((a) => <ApptRow key={a.id} a={a} />)}
            </ul>
          )}
        </article>
      </section>

      {/* Consultation history — past 5. */}
      <section>
        <SectionHeader Icon={Activity} title="Recent consultations" href="/dashboard/appointments" hrefLabel="All history" />
        <article className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
          {history.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 text-center italic">Your past consultations will appear here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.map((a) => <ApptRow key={a.id} a={a} past />)}
            </ul>
          )}
        </article>
      </section>

      {/* Saved doctors (up to 4). */}
      <section>
        <SectionHeader Icon={Heart} title="Saved doctors" href="/doctors" hrefLabel="Browse all" />
        {savedDoctorList.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-white border border-gray-100 rounded-card px-4 py-6 text-center">
            No saved doctors yet. <Link href="/doctors" className="text-kerala-700 hover:underline font-semibold">Find a doctor →</Link>
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {savedDoctorList.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link href={`/doctors/${s.doctor.id}`} className="flex items-center gap-3 bg-white border border-gray-100 rounded-card p-3 hover:border-kerala-300 hover:shadow-cardLg transition-colors">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-kerala-50 flex-shrink-0 flex items-center justify-center text-kerala-700 font-semibold text-sm">
                    {s.doctor.photoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={s.doctor.photoUrl} alt="" className="w-full h-full object-cover" />
                      : s.doctor.name.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0,2).map((p) => p[0]?.toUpperCase() ?? '').join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{s.doctor.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.doctor.specialization} · {s.doctor.district}</p>
                  </div>
                  {s.doctor.ccimVerified && <ShieldCheck className="w-4 h-4 text-kerala-700 flex-shrink-0" />}
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved jobs (up to 4). */}
      {savedJobList.length > 0 && (
        <section>
          <SectionHeader Icon={Briefcase} title="Saved jobs" href="/jobs/saved" hrefLabel="My wishlist" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            {savedJobList.slice(0, 4).map((s) => s.job && (
              <li key={s.id}>
                <Link href={`/jobs/${s.job.id}`} className="flex items-center justify-between bg-white border border-gray-100 rounded-card p-3 hover:border-kerala-300 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{s.job.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.job.clinic ?? '—'}{s.job.location ? ` · ${s.job.location}` : ''}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Notifications — top 5, latest. Unread cards are amber-tinted. */}
      <section>
        <SectionHeader Icon={Bell} title="Notifications" href="/dashboard" hrefLabel="Manage" />
        <article className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
          {notifList.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500 text-center italic">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifList.slice(0, 5).map((n) => (
                <li key={n.id} className={`px-3 md:px-4 py-2.5 md:py-3 ${!n.read ? 'bg-amber-50/40' : ''}`}>
                  {n.url ? (
                    <Link href={n.url} className="block">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-ink' : 'text-gray-700'}`}>{n.title}</p>
                      {n.body && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>}
                    </Link>
                  ) : (
                    <>
                      <p className={`text-sm ${!n.read ? 'font-semibold text-ink' : 'text-gray-700'}`}>{n.title}</p>
                      {n.body && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* Quick actions row — patient shortcuts. */}
      <section>
        <SectionHeader Icon={Sparkles} title="Quick actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          <QuickAction href="/doctors"           Icon={Stethoscope} title="Find a doctor"      desc="Browse verified BAMS specialists." />
          <QuickAction href="/triage"            Icon={Activity}    title="Symptom check"      desc="2-min triage + doctor suggestion." />
          <QuickAction href="/dashboard/journal" Icon={BookHeart}   title="Today's journal"    desc="Log sleep, digestion, energy." />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, sub, tone, Icon }: { label: string; value: number; sub: string; tone: 'kerala' | 'ink' | 'amber'; Icon: React.ComponentType<{ className?: string }> }) {
  const t = tone === 'kerala' ? 'text-kerala-700' : tone === 'amber' ? 'text-amber-700' : 'text-ink'
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

function SectionHeader({ Icon, title, href, hrefLabel }: { Icon: React.ComponentType<{ className?: string }>; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h2 className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold inline-flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-kerala-700" /> {title}
      </h2>
      {href && hrefLabel && (
        <Link href={href} className="text-[11px] font-semibold text-kerala-700 hover:text-kerala-800 inline-flex items-center gap-0.5">{hrefLabel} <ArrowRight className="w-3 h-3" /></Link>
      )}
    </div>
  )
}

function ApptRow({ a, past = false }: { a: Appt; past?: boolean }) {
  const d = new Date(a.dateTime)
  const isToday = !past && d.toDateString() === new Date().toDateString()
  return (
    <li className="px-3 md:px-4 py-2.5 md:py-3 hover:bg-cream/40">
      <Link href={`/consult/${a.id}`} className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 md:w-14 text-center">
          <p className={`text-[10px] uppercase tracking-wider font-semibold ${isToday ? 'text-amber-700' : 'text-gray-500'}`}>{isToday ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' })}</p>
          <p className={`font-serif text-lg md:text-xl tabular-nums ${isToday ? 'text-amber-800' : past ? 'text-gray-500' : 'text-ink'}`}>{d.getDate()}</p>
          <p className="text-[10px] text-gray-500">{d.toLocaleDateString('en-GB', { month: 'short' })}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate">{a.doctor?.name ?? 'Doctor'}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{a.doctor?.specialization ?? ''} · {a.type} · <span className="capitalize">{a.status}</span></p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </Link>
    </li>
  )
}

function QuickAction({ href, Icon, title, desc }: { href: string; Icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
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
