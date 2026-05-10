import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../lib/auth'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type MeResponse = {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    image: string | null
    prakriti: string | null
    phone: string | null
    emailVerified: boolean
    doctorId: string | null
    hospitalId: string | null
    ownedDoctor: { id: string; name: string; specialization: string } | null
    ownedHospital: { id: string; name: string; type: string } | null
  } | null
  stats: { savedCount: number; apptCount: number; postCount: number }
}

async function fetchMe(): Promise<MeResponse> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/me`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return { user: null, stats: { savedCount: 0, apptCount: 0, postCount: 0 } }
    return (await res.json()) as MeResponse
  } catch {
    return { user: null, stats: { savedCount: 0, apptCount: 0, postCount: 0 } }
  }
}

const PATIENT_NAV = [
  { href: '/dashboard',              label: 'Overview' },
  { href: '/dashboard/saved',        label: 'Saved doctors' },
  { href: '/dashboard/appointments', label: 'Appointments' },
  { href: '/dashboard/profile',      label: 'Health profile' },
]

const DOCTOR_NAV = [
  { href: '/dashboard',              label: 'Overview' },
  { href: '/dashboard/appointments', label: 'My appointments' },
  { href: '/dashboard/slots',        label: 'My availability' },
  { href: '/dashboard/profile',      label: 'My profile' },
]
const HOSPITAL_NAV = [
  { href: '/dashboard',         label: 'Overview' },
  { href: '/dashboard/profile', label: 'Hospital profile' },
]

function roleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':            return 'Admin'
    case 'DOCTOR':           return 'Doctor'
    case 'DOCTOR_PENDING':   return 'Doctor (pending)'
    case 'HOSPITAL':         return 'Hospital'
    case 'HOSPITAL_PENDING': return 'Hospital (pending)'
    case 'THERAPIST':        return 'Therapist'
    default:                 return 'Patient'
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/dashboard')

  const me = await fetchMe()
  const role = me.user?.role ?? 'USER'
  const isDoctor   = role === 'DOCTOR'   || role === 'DOCTOR_PENDING'   || me.user?.doctorId != null
  const isHospital = role === 'HOSPITAL' || role === 'HOSPITAL_PENDING' || me.user?.hospitalId != null
  const nav = isHospital ? HOSPITAL_NAV : isDoctor ? DOCTOR_NAV : PATIENT_NAV
  const initials = (me.user?.name ?? me.user?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-60 border-r bg-white py-6 px-4 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-kerala-600 text-white text-sm font-semibold flex items-center justify-center">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{me.user?.name ?? me.user?.email}</div>
            <div className="text-[11px] text-muted">
              {roleLabel(role)}
            </div>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {nav.map((it) => (
            <Link key={it.href} href={it.href} className="block px-3 py-2 rounded hover:bg-kerala-50 text-gray-800">
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-1 text-xs text-gray-500">
          {sess.user.role === 'ADMIN' && (
            <Link href="/admin" className="block px-3 py-2 rounded hover:bg-kerala-50 text-kerala-700">→ Admin panel</Link>
          )}
          <Link href="/" className="block px-3 py-2 rounded hover:bg-kerala-50">← Public site</Link>
        </div>
      </aside>
      <main className="flex-1 px-4 md:px-8 py-8 max-w-5xl">{children}</main>
    </div>
  )
}
