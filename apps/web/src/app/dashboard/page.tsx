import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { Heart, Calendar, MessageSquare, Stethoscope, ShieldCheck } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type MeResponse = {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    prakriti: string | null
    phone: string | null
    doctorId: string | null
    ownedDoctor: {
      id: string; name: string; specialization: string; district: string;
      ccimVerified: boolean; consultationFee: number | null
    } | null
  } | null
  stats: { savedCount: number; apptCount: number; postCount: number }
  upcomingAppts: Array<{
    id: string; dateTime: string; type: string; status: string
    doctor: { id: string; name: string; specialization: string } | null
  }>
}

async function fetchMe(): Promise<MeResponse | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/me`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as MeResponse
  } catch { return null }
}

export default async function DashboardOverview() {
  const me = await fetchMe()
  if (!me?.user) return <p>Could not load dashboard.</p>

  const isDoctor = me.user.role === 'DOCTOR' || me.user.doctorId != null
  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  })()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">{greeting}, {me.user.name?.split(/\s+/)[0] ?? 'there'}.</h1>
        <p className="text-muted mt-1">Here&apos;s what&apos;s happening on your AyurConnect.</p>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isDoctor ? (
          <>
            <StatCard label="Upcoming appointments" value={me.upcomingAppts.length} icon={Calendar} href="/dashboard/appointments" />
            <StatCard label="Total appointments" value={me.stats.apptCount} icon={Stethoscope} href="/dashboard/appointments" />
            <StatCard label="Forum posts" value={me.stats.postCount} icon={MessageSquare} href="/forum" />
            <StatCard label="CCIM status" value={me.user.ownedDoctor?.ccimVerified ? '✓' : '—'} icon={ShieldCheck} />
          </>
        ) : (
          <>
            <StatCard label="Saved doctors" value={me.stats.savedCount} icon={Heart} href="/dashboard/saved" />
            <StatCard label="Appointments" value={me.stats.apptCount} icon={Calendar} href="/dashboard/appointments" />
            <StatCard label="Forum posts" value={me.stats.postCount} icon={MessageSquare} href="/forum" />
            <StatCard label="Prakriti" value={me.user.prakriti ?? '—'} icon={ShieldCheck} href="/dashboard/profile" />
          </>
        )}
      </div>

      {/* Doctor: own profile snapshot */}
      {isDoctor && me.user.ownedDoctor && (
        <section className="bg-white rounded-card border border-gray-100 shadow-card p-6">
          <h2 className="text-xl text-kerala-700 mb-3">Your practice</h2>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="font-semibold text-ink">{me.user.ownedDoctor.name}</div>
              <div className="text-sm text-muted">{me.user.ownedDoctor.specialization} · {me.user.ownedDoctor.district}</div>
              {me.user.ownedDoctor.consultationFee != null && (
                <div className="text-sm text-gray-700 mt-1">Consultation fee: <strong>₹{me.user.ownedDoctor.consultationFee}</strong></div>
              )}
            </div>
            <Link href={`/doctors/${me.user.ownedDoctor.id}`} className="text-sm text-kerala-700 hover:underline">View public profile →</Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-muted">
            To edit your profile, go to <Link href="/dashboard/profile" className="text-kerala-700 hover:underline">My profile</Link>.
          </div>
        </section>
      )}

      {/* Upcoming appointments */}
      {me.upcomingAppts.length > 0 && (
        <section>
          <h2 className="text-xl text-kerala-700 mb-3">Upcoming appointments</h2>
          <div className="space-y-2">
            {me.upcomingAppts.map((a) => (
              <Link key={a.id} href={`/dashboard/appointments`} className="block bg-white rounded-card border border-gray-100 shadow-card p-4 hover:shadow-cardLg transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-semibold text-ink">{a.doctor?.name ?? 'Doctor'}</div>
                    <div className="text-xs text-muted">{a.doctor?.specialization}</div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {new Date(a.dateTime).toLocaleString()} · <span className="text-xs px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full">{a.type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="bg-white rounded-card border border-gray-100 shadow-card p-6">
        <h2 className="text-xl text-kerala-700 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {!isDoctor && (
            <Link href="/doctors" className="px-4 py-3 bg-kerala-50 hover:bg-kerala-100 border border-kerala-100 rounded text-sm text-kerala-800 font-medium">
              Find a doctor
            </Link>
          )}
          <Link href="/forum" className="px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded text-sm text-blue-800 font-medium">
            Browse forum
          </Link>
          <Link href="/health-tips" className="px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded text-sm text-amber-800 font-medium">
            Today&apos;s health tips
          </Link>
          <Link href="/ayurbot" className="px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded text-sm text-purple-800 font-medium">
            Try AyurBot
          </Link>
          <Link href="/dashboard/profile" className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-sm text-gray-800 font-medium">
            Edit profile
          </Link>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, href,
}: {
  label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; href?: string
}) {
  const card = (
    <div className="bg-white p-5 rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow h-full">
      <div className="flex items-start justify-between">
        <div className="text-3xl font-serif text-kerala-700">{value}</div>
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  )
  return href ? <Link href={href} className="block">{card}</Link> : card
}
