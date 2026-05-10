'use client'

import { useEffect, useState } from 'react'
import { Users, Stethoscope, Building2, Leaf, Calendar, Star, MessageSquare, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react'
import { adminApi } from '../../../lib/admin-api'

type Analytics = {
  headline: { users: number; doctors: number; hospitals: number; herbs: number; appts: number; reviews: number; posts: number; signups7: number }
  verificationQueue: { doctors: number; hospitals: number }
  usersByRole:       Array<{ role: string; count: number }>
  doctorsByDistrict: Array<{ district: string; count: number }>
  hospitalsByType:   Array<{ type: string; count: number }>
  apptsByStatus:     Array<{ status: string; count: number }>
  signupsByDay:      Array<{ day: string; count: number }>
  eventsByName:      Array<{ name: string; count: number }>
  topSearches:       Array<{ term: string; count: number }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const d = await adminApi.get<Analytics>('/admin/analytics')
      setData(d)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading && !data) return <p className="text-gray-500"><Loader2 className="w-4 h-4 inline animate-spin mr-2" /> Loading…</p>
  if (err) return <p className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-800">{err}</p>
  if (!data) return null

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Live aggregates across the platform.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {/* Verification queue alert */}
      {(data.verificationQueue.doctors > 0 || data.verificationQueue.hospitals > 0) && (
        <a href="/admin/verify" className="block p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-900 hover:bg-amber-100">
          <ShieldAlert className="w-4 h-4 inline mr-1" />
          {data.verificationQueue.doctors} doctor{data.verificationQueue.doctors === 1 ? '' : 's'}
          {' + '}
          {data.verificationQueue.hospitals} hospital{data.verificationQueue.hospitals === 1 ? '' : 's'}
          {' awaiting verification → click to review'}
        </a>
      )}

      {/* Headline counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Counter icon={Users}      label="Users"        value={data.headline.users}     sub={`+${data.headline.signups7} this week`} tone="indigo" />
        <Counter icon={Stethoscope} label="Doctors"     value={data.headline.doctors}   sub={`${data.verificationQueue.doctors} pending`} tone="kerala" />
        <Counter icon={Building2}  label="Hospitals"    value={data.headline.hospitals} sub={`${data.verificationQueue.hospitals} pending`} tone="blue" />
        <Counter icon={Leaf}       label="Herbs"        value={data.headline.herbs}     sub="indexed" tone="emerald" />
        <Counter icon={Calendar}   label="Appointments" value={data.headline.appts}     sub="lifetime" tone="amber" />
        <Counter icon={Star}       label="Reviews"      value={data.headline.reviews}   sub="lifetime" tone="rose" />
        <Counter icon={MessageSquare} label="Forum posts" value={data.headline.posts}   sub="lifetime" tone="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Signups time series */}
        <Card title="Signups · last 30 days">
          {data.signupsByDay.length === 0
            ? <p className="text-sm text-gray-500">No signups yet.</p>
            : <SparkLine points={data.signupsByDay.map((p) => ({ x: p.day, y: p.count }))} stroke="#155228" fill="rgba(61,160,65,0.18)" />}
        </Card>

        {/* Users by role */}
        <Card title="Users by role">
          <PieChart slices={data.usersByRole.map((r, i) => ({ label: r.role, value: r.count, color: PIE_PALETTE[i % PIE_PALETTE.length] }))} />
        </Card>

        {/* Doctors by district */}
        <Card title="Doctors by district">
          <BarList items={data.doctorsByDistrict.map((d) => ({ label: d.district, value: d.count }))} max={10} />
        </Card>

        {/* Top searches */}
        <Card title="Top searches · last 30 days">
          {data.topSearches.length === 0
            ? <p className="text-sm text-gray-500">No searches yet — let it run for a few days.</p>
            : <BarList items={data.topSearches.map((s) => ({ label: s.term, value: s.count }))} max={10} />}
        </Card>

        {/* Events by name */}
        <Card title="Events · last 30 days">
          {data.eventsByName.length === 0
            ? <p className="text-sm text-gray-500">No events yet.</p>
            : <BarList items={data.eventsByName.slice(0, 12).map((e) => ({ label: e.name, value: e.count }))} max={12} />}
        </Card>

        {/* Appointments by status */}
        <Card title="Appointments by status">
          {data.apptsByStatus.length === 0
            ? <p className="text-sm text-gray-500">No appointments yet.</p>
            : <BarList items={data.apptsByStatus.map((a) => ({ label: a.status, value: a.count }))} max={10} />}
        </Card>
      </div>
    </div>
  )
}

// ─── Tiny inline chart components ────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="bg-white rounded-md border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{title}</h3>
      {children}
    </article>
  )
}

function Counter({ icon: Icon, label, value, sub, tone }: { icon: typeof Users; label: string; value: number; sub: string; tone: 'indigo' | 'kerala' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' }) {
  const TONE: Record<typeof tone, string> = {
    indigo:  'bg-indigo-50 text-indigo-700',
    kerala:  'bg-kerala-50 text-kerala-700',
    blue:    'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-800',
    rose:    'bg-rose-50 text-rose-700',
    purple:  'bg-purple-50 text-purple-700',
  }
  return (
    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-3">
      <div className={`w-8 h-8 rounded-md ${TONE[tone]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-serif text-gray-900 tabular-nums">{value.toLocaleString()}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
      <div className="text-[10px] text-gray-400">{sub}</div>
    </div>
  )
}

function BarList({ items, max }: { items: Array<{ label: string; value: number }>; max: number }) {
  const top = items.slice(0, max)
  const peak = Math.max(...top.map((i) => i.value), 1)
  return (
    <div className="space-y-1.5">
      {top.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-xs">
          <span className="w-32 text-gray-700 truncate" title={it.label}>{it.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-kerala-500 h-full rounded-full" style={{ width: `${(it.value / peak) * 100}%` }} />
          </div>
          <span className="w-10 text-right text-gray-600 tabular-nums">{it.value}</span>
        </div>
      ))}
    </div>
  )
}

const PIE_PALETTE = ['#155228', '#3da041', '#5fc063', '#d97706', '#7c3aed', '#1d4ed8', '#dc2626', '#0891b2']

function PieChart({ slices }: { slices: Array<{ label: string; value: number; color: string }> }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  let acc = 0
  const r = 60, cx = 80, cy = 80
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" width="120" height="120" className="flex-shrink-0">
        {slices.map((s) => {
          const startAngle = (acc / total) * 2 * Math.PI - Math.PI / 2
          acc += s.value
          const endAngle   = (acc / total) * 2 * Math.PI - Math.PI / 2
          const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
          const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle)
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
          const path = `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
          return <path key={s.label} d={path} fill={s.color} />
        })}
      </svg>
      <ul className="text-xs space-y-1">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
            <span className="text-gray-700">{s.label}</span>
            <span className="text-gray-500 tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SparkLine({ points, stroke, fill }: { points: Array<{ x: string; y: number }>; stroke: string; fill: string }) {
  if (points.length < 2) return <p className="text-sm text-gray-500">Need at least 2 days of data.</p>
  const w = 320, h = 80, pad = 6
  const ys = points.map((p) => p.y)
  const ymax = Math.max(...ys, 1)
  const xStep = (w - pad * 2) / (points.length - 1)
  const coords = points.map((p, i) => ({ x: pad + i * xStep, y: h - pad - (p.y / ymax) * (h - pad * 2) }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)} ${h - pad} L${coords[0].x.toFixed(1)} ${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <path d={areaPath} fill={fill} />
      <path d={linePath} stroke={stroke} strokeWidth={2} fill="none" />
      {coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={2} fill={stroke} />)}
    </svg>
  )
}
