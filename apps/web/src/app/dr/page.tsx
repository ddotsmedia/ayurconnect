// Doctor Hub portal home — server-rendered with /dr stats endpoint.

import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { FileText, BookOpen, Video, MessageSquare, Award, ArrowRight, Calendar, Library } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Stats = {
  myCases: number; myProtocols: number; myComments: number
  bookmarks: number; subscriptions: number; totalCreditsThisYear: number
}
type UpcomingWebinar = { id: string; webinar: { id: string; slug: string; title: string; scheduledFor: string; durationMin: number; cmeCredits: number } }
type LatestCase = { id: string; title: string; specialty: string; condition: string; publishedAt: string | null; author: { id: string; name: string | null } | null }

type PortalResp = {
  role: string
  stats: Stats
  upcomingWebinars: UpcomingWebinar[]
  latestCases: LatestCase[]
}

async function fetchPortal(): Promise<PortalResp | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/dr`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as PortalResp
  } catch { return null }
}

export const metadata = { title: 'Doctor Hub | AyurConnect', robots: { index: false, follow: false } }

export default async function DrPortalHome() {
  const data = await fetchPortal()
  if (!data) {
    return <p className="text-muted">Could not load portal. Please refresh.</p>
  }

  // Annual CME target — purely a UX nudge; the platform itself isn't
  // CCIM-accredited so this is a suggested target, not a regulatory minimum.
  const CME_TARGET = 20
  const cmeProgress = Math.min(100, (data.stats.totalCreditsThisYear / CME_TARGET) * 100)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Doctor Knowledge Hub</h1>
        <p className="text-sm text-muted mt-1">Clinical cases, peer-reviewed research, CME webinars, classical protocols. All in one place.</p>
      </header>

      {/* CME progress band */}
      <Link href="/dr/cme" className="block bg-gradient-to-r from-kerala-700 to-kerala-800 text-white rounded-card p-5 md:p-6 shadow-card hover:shadow-cardLg transition-shadow">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-200">
              <Award className="w-3.5 h-3.5" /> CME progress · this year
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-4xl">{data.stats.totalCreditsThisYear.toFixed(1)}</span>
              <span className="text-white/60 text-sm">/ {CME_TARGET} credits</span>
            </div>
          </div>
          <p className="text-xs text-white/75 max-w-sm">
            {data.stats.totalCreditsThisYear >= CME_TARGET
              ? '🎉 Target reached — keep learning to stay sharp.'
              : `${(CME_TARGET - data.stats.totalCreditsThisYear).toFixed(1)} credits to your annual target. Browse upcoming webinars below.`}
          </p>
        </div>
        <div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${cmeProgress}%` }} />
        </div>
      </Link>

      {/* Stat tiles (CME removed — promoted to progress band above) */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="My cases"        value={data.stats.myCases}        icon={FileText} href="/dr/cases?status=mine" />
        <Stat label="My protocols"    value={data.stats.myProtocols}    icon={Library}  href="/dr/protocols?status=mine" />
        <Stat label="Paper bookmarks" value={data.stats.bookmarks}      icon={BookOpen} href="/dr/research/bookmarks" />
      </div>

      {/* Quick-access surfaces */}
      <section>
        <h2 className="font-serif text-xl text-ink mb-3">Where do you want to start?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SurfaceCard href="/dr/cases"         icon={FileText}   title="Clinical cases"   body="Structured anonymized case discussions with peer commentary." />
          <SurfaceCard href="/dr/research"      icon={BookOpen}   title="Research papers"  body="Curated Ayurveda research with bookmarks + private notes." />
          <SurfaceCard href="/dr/ai-research"   icon={MessageSquare} title="AI research assistant" body="Ask a clinical research question — cited summary from curated papers." badge="New" />
          <SurfaceCard href="/dr/cme"           icon={Video}      title="CME webinars"     body="Earn platform-issued CME credit certificates." />
          <SurfaceCard href="/dr/protocols"     icon={Library}    title="Clinical protocols" body="Community-contributed peer-reviewed protocols." />
          <SurfaceCard href="/dr/interactions"  icon={Award}      title="Drug interactions" body="Ayurveda-allopathic interaction checker." />
        </div>
      </section>

      {/* Upcoming webinars */}
      {data.upcomingWebinars.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-ink">Your upcoming webinars</h2>
            <Link href="/dr/cme" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">All webinars <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {data.upcomingWebinars.map((r) => (
              <Link key={r.id} href={`/dr/cme/${r.webinar.slug}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-ink">{r.webinar.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full">{r.webinar.cmeCredits} credits</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(r.webinar.scheduledFor).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {r.webinar.durationMin}min
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest cases from peers */}
      {data.latestCases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-ink">Latest cases from peers</h2>
            <Link href="/dr/cases" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">All cases <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {data.latestCases.map((c) => (
              <Link key={c.id} href={`/dr/cases/${c.id}`} className="block bg-white border border-gray-100 rounded-card p-4 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-base text-ink leading-snug">{c.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full whitespace-nowrap">{c.specialty}</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {c.condition} · by Dr {c.author?.name ?? 'AyurConnect'} · {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : '—'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value, icon: Icon, href }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; href?: string }) {
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

function SurfaceCard({ href, icon: Icon, title, body, badge }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; body: string; badge?: string }) {
  return (
    <Link href={href} className="block bg-white p-5 rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-6 h-6 text-kerala-700" />
        {badge && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">{badge}</span>}
      </div>
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      <p className="text-xs text-muted mt-1 leading-relaxed">{body}</p>
    </Link>
  )
}
