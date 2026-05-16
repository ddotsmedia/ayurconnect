// Doctor Knowledge Hub — gated layout.
//
// Access:
//   - Anonymous → redirect /sign-in
//   - role IN ['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'] → render hub
//   - other roles → upsell page ("you need to be a verified doctor")

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '../../lib/auth'
import { Home, FileText, BookOpen, Video, Library, FlaskConical, Calendar, Pill, Bot, ShieldCheck, ArrowLeft, Share2 } from 'lucide-react'

const NAV = [
  { href: '/dr',              label: 'Hub home',         icon: Home },
  { href: '/dr/cases',        label: 'Clinical cases',   icon: FileText },
  { href: '/dr/research',     label: 'Research papers',  icon: BookOpen },
  { href: '/dr/ai-research',  label: 'AI research',      icon: Bot },
  { href: '/dr/cme',          label: 'CME webinars',     icon: Video },
  { href: '/dr/journals',     label: 'Journals',         icon: Library },
  { href: '/dr/protocols',    label: 'Protocols',        icon: FlaskConical },
  { href: '/dr/conferences',  label: 'Conferences',      icon: Calendar },
  { href: '/dr/interactions', label: 'Drug interactions', icon: Pill },
  { href: '/dr/referrals',    label: 'Referrals',        icon: Share2 },
]

const ALLOWED_ROLES = ['DOCTOR', 'DOCTOR_PENDING', 'ADMIN']

export default async function DoctorHubLayout({ children }: { children: React.ReactNode }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/dr')

  // Non-doctor → upsell instead of denial.
  if (!ALLOWED_ROLES.includes(sess.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="max-w-lg w-full bg-white rounded-card border border-gray-100 shadow-card p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-kerala-700 mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-ink mb-2">The Doctor Hub is for verified practitioners</h1>
          <p className="text-sm text-muted mb-5 leading-relaxed">
            You&apos;re signed in as <strong>{sess.user.email}</strong> with role <code className="px-2 py-0.5 bg-gray-100 rounded text-xs">{sess.user.role}</code>.
            The Hub is gated to verified Ayurveda doctors and admins. If you&apos;re a BAMS doctor, register your profile and submit for verification.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link href="/register/doctor" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
              Register as a doctor
            </Link>
            <Link href="/" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50 inline-flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const initials = (sess.user.name ?? sess.user.email).slice(0, 2).toUpperCase()
  const isPending = sess.user.role === 'DOCTOR_PENDING'

  return (
    <div className="min-h-screen md:flex bg-cream">
      {/* Mobile top nav — horizontal scroll chips. Hidden on md+ where the
          sidebar takes over. Sticky so doctors can switch sections while
          scrolling long pages. */}
      <nav className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin">
        {NAV.map((it) => {
          const Icon = it.icon
          return (
            <Link key={it.href} href={it.href} className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-gray-700 bg-gray-50 hover:bg-kerala-50 hover:text-kerala-700 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5" /> {it.label}
            </Link>
          )
        })}
      </nav>

      <aside className="w-64 border-r bg-white py-6 px-4 sticky top-0 self-start h-screen overflow-y-auto hidden md:block">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-kerala-700 text-white text-sm font-semibold flex items-center justify-center">{initials}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{sess.user.name ?? sess.user.email}</div>
            <div className="text-[11px] text-muted">
              {sess.user.role === 'ADMIN' ? 'Admin' : sess.user.role === 'DOCTOR' ? 'Doctor' : 'Doctor (pending verification)'}
            </div>
          </div>
        </div>

        {isPending && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-900 leading-relaxed">
            Your verification is in queue. You have <strong>read access</strong> to the Hub — writes unlock after approval.
          </div>
        )}

        <nav className="space-y-0.5 text-sm">
          {NAV.map((it) => {
            const Icon = it.icon
            return (
              <Link key={it.href} href={it.href} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-kerala-50 text-gray-800">
                <Icon className="w-4 h-4 text-kerala-700" /> {it.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-kerala-50">← Patient dashboard</Link>
          <Link href="/" className="block px-3 py-2 rounded hover:bg-kerala-50">← Public site</Link>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-8 py-8 max-w-6xl">{children}</main>
    </div>
  )
}
