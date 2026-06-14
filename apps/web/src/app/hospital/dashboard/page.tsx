import Link from 'next/link'
import { Eye, MessageSquare, Phone, Star, ShieldCheck, AlertCircle, Edit, Stethoscope, Package, Share2 } from 'lucide-react'
import { portalFetch } from './_fetch'

type DashSummary = {
  hospital: {
    id: string; slug: string | null; name: string; nameMl: string | null; type: string; district: string; country: string; state: string | null
    ccimVerified: boolean; ayushCertified: boolean; nabh: boolean; panchakarma: boolean; tourismClass: string | null
    moderationStatus: string
  } | null
  completeness: number
  stats: {
    inquiries: Record<string, number>
    packagesActive: number
    photoCount: number
    avgRating: number | null
    reviewCount: number
    doctorTeam: number
  }
}

export default async function HospitalDashboardHome() {
  const data = await portalFetch<DashSummary>('/api/hospital/me')
  if (!data?.hospital) return (
    <div className="bg-white border border-gray-100 rounded-card shadow-card p-8 text-center">
      <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
      <h2 className="font-serif text-xl text-ink mt-3">No hospital linked to your account</h2>
      <p className="text-sm text-gray-600 mt-2">Register your hospital to start receiving inquiries.</p>
      <Link href="/hospitals/register" className="mt-4 inline-block px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold">Register hospital</Link>
    </div>
  )

  const h = data.hospital
  const inq = data.stats.inquiries
  const newCount = inq.new ?? 0
  const verified = h.ccimVerified || h.ayushCertified || h.nabh
  const publicUrl = `/hospitals/${h.id}`

  return (
    <div className="space-y-6">
      {/* Welcome / status */}
      <header className="bg-gradient-to-br from-kerala-700 to-kerala-800 text-white rounded-card p-5 shadow-cardLg">
        <p className="text-[10px] uppercase tracking-wider opacity-80">Hospital portal</p>
        <h1 className="font-serif text-2xl md:text-3xl mt-1">{h.name}</h1>
        {h.nameMl && <p className="font-serif text-white/85 mt-0.5" dir="auto">{h.nameMl}</p>}
        <p className="text-sm text-white/85 mt-2">
          {h.type} · {h.district}{h.country !== 'IN' && `, ${h.country}`} ·
          {h.moderationStatus === 'approved' ? ' verified' : ` ${h.moderationStatus}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={publicUrl} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-kerala-800 rounded text-xs font-semibold"><Eye className="w-3.5 h-3.5" /> View public profile</Link>
          <Link href="/hospital/dashboard/profile" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs"><Edit className="w-3.5 h-3.5" /> Edit profile</Link>
          <Link href="/hospital/dashboard/marketing" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs"><Share2 className="w-3.5 h-3.5" /> Share profile</Link>
        </div>
      </header>

      {/* Completeness */}
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Profile completeness</h2>
          <span className="text-2xl font-bold text-kerala-700">{data.completeness}%</span>
        </div>
        <div className="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${data.completeness}%` }} />
        </div>
        <ul className="mt-3 space-y-1 text-xs text-gray-700">
          {data.stats.photoCount < 3 && <li>· Add at least 3 photos to reach 80%</li>}
          {data.stats.packagesActive === 0 && <li>· Add treatment packages to attract international patients</li>}
          {data.stats.doctorTeam === 0 && <li>· Link your doctor team to boost credibility</li>}
          {data.completeness >= 90 && <li className="text-emerald-700">· Excellent — your profile is fully ready!</li>}
        </ul>
      </article>

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Eye}           label="New inquiries (90d)" value={Object.values(inq).reduce((a, b) => a + b, 0)} />
        <StatCard icon={MessageSquare} label="To follow up"          value={newCount} accent={newCount > 0} />
        <StatCard icon={Star}          label="Average rating"        value={data.stats.avgRating ? data.stats.avgRating.toFixed(1) : '—'} sub={`${data.stats.reviewCount} reviews`} />
        <StatCard icon={Package}       label="Active packages"       value={data.stats.packagesActive} />
      </section>

      {/* Verification badges */}
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-kerala-700" /> Verification</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge on={h.ccimVerified}    label="CCIM Verified" />
          <Badge on={h.ayushCertified}  label="AYUSH Certified" />
          <Badge on={h.nabh}            label="NABH Accredited" />
          <Badge on={h.panchakarma}     label="Panchakarma Facility" />
          {h.tourismClass && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">Tourism: {h.tourismClass}</span>}
          {!verified && <span className="text-gray-500">No badges yet — pending admin verification.</span>}
        </div>
      </article>

      {/* Inquiry pipeline preview */}
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-serif text-lg text-ink">Inquiry pipeline</h2>
          <Link href="/hospital/dashboard/inquiries" className="text-xs text-kerala-700 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          <Pipe label="New"        n={inq.new       ?? 0} color="bg-amber-50 text-amber-800 border-amber-200" />
          <Pipe label="Contacted"  n={inq.contacted ?? 0} color="bg-blue-50 text-blue-800 border-blue-200" />
          <Pipe label="Converted"  n={inq.converted ?? 0} color="bg-emerald-50 text-emerald-800 border-emerald-200" />
          <Pipe label="Closed"     n={inq.closed    ?? 0} color="bg-gray-50 text-gray-700 border-gray-200" />
        </div>
      </article>

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/hospital/dashboard/profile"   className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Edit className="w-4 h-4 text-kerala-700 mb-1" /> Edit profile</Link>
        <Link href="/hospital/dashboard/doctors"   className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Stethoscope className="w-4 h-4 text-kerala-700 mb-1" /> Manage doctors</Link>
        <Link href="/hospital/dashboard/packages"  className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Package className="w-4 h-4 text-kerala-700 mb-1" /> Add package</Link>
        <Link href="/hospital/dashboard/reviews"   className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-sm font-semibold text-ink"><Star className="w-4 h-4 text-kerala-700 mb-1" /> View reviews</Link>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent = false }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <article className={'rounded-card p-4 shadow-card border ' + (accent ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100')}>
      <Icon className={'w-5 h-5 mb-1 ' + (accent ? 'text-amber-700' : 'text-kerala-700')} />
      <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </article>
  )
}

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ' + (on ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200')}>
      {on && '✓ '}{label}
    </span>
  )
}

function Pipe({ label, n, color }: { label: string; n: number; color: string }) {
  return (
    <div className={'rounded-card border py-3 ' + color}>
      <p className="text-2xl font-bold">{n}</p>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  )
}
