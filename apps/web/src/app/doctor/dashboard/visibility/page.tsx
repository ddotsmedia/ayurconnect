import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Search, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export const metadata = { title: 'Your monthly visibility report', robots: { index: false, follow: false } }

type Vis = { profileViews30d: number; searchAppearances30d: number; inquiries30d: number }

async function fetchVisibility(): Promise<Vis | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/doctor-viral/visibility`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as Vis
  } catch { return null }
}

export default async function VisibilityPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/doctor/dashboard/visibility')
  if (!['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(sess.user.role)) redirect('/dashboard')
  const v = await fetchVisibility()
  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <header className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Last 30 days</p>
          <h1 className="font-serif text-2xl text-ink">Your AyurConnect visibility</h1>
          <p className="text-xs text-gray-600 mt-1">A monthly snapshot of how patients discover you.</p>
        </header>

        <section className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat icon={Eye}           label="Profile views"       value={v?.profileViews30d ?? 0} />
          <Stat icon={Search}        label="Search appearances"  value={v?.searchAppearances30d ?? 0} />
          <Stat icon={MessageSquare} label="Patient inquiries"   value={v?.inquiries30d ?? 0} />
        </section>

        <article className="mt-5 bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 shadow-card">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <h2 className="font-serif text-lg text-ink mt-2">Doctors who complete their profile get 3× more views</h2>
          <p className="text-xs text-gray-700 mt-1">Top tip: add a photo, fill the Malayalam bio, and link your hospital.</p>
          <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold">Improve profile <ArrowRight className="w-3.5 h-3.5" /></Link>
        </article>

        <article className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">Invite a colleague</h2>
          <p className="text-xs text-gray-600 mt-1">Doctors who refer 1+ colleague get the <strong>Referrer badge</strong> on their public profile.</p>
          <Link href="/doctor/share" className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded text-sm font-semibold">Share + invite <ArrowRight className="w-3.5 h-3.5" /></Link>
        </article>
      </div>
    </div>
  )
}

function Stat({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <I className="w-5 h-5 mb-1 text-kerala-700" />
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-ink">{value}</p>
    </article>
  )
}
