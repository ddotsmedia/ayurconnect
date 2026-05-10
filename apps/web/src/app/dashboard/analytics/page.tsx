'use client'

import { useEffect, useState } from 'react'
import { Star, Calendar, Clock, Heart, TrendingUp } from 'lucide-react'

type Stats = {
  reviews: { total: number; last7: number; last30: number; averageRating: number | null; breakdown: Array<{ star: number; count: number }> }
  appointments: { total: number; last7: number; last30: number; byStatus: Record<string, number> }
  slots: { total: number; booked: number; openFuture: number; utilizationPct: number }
  saved: { total: number }
}

export default function DoctorAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/me/doctor/stats', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          if (r.status === 403) setErr('Available only to verified doctor accounts.')
          else setErr(j.error ?? `HTTP ${r.status}`)
          return null
        }
        return r.json() as Promise<Stats>
      })
      .then((s) => { if (s) setStats(s) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted">Loading…</p>
  if (err) return <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">{err}</p>
  if (!stats) return <p className="text-muted">No data yet.</p>

  const maxReviewBreakdown = Math.max(...stats.reviews.breakdown.map((b) => b.count), 1)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Practice analytics</h1>
        <p className="text-sm text-muted mt-1">Snapshot of your AyurConnect activity. Click any tile for details.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tile icon={Star}    label="Avg rating"  value={stats.reviews.averageRating ? `${stats.reviews.averageRating} / 5` : '—'} sub={`${stats.reviews.total} reviews`} tone="amber" />
        <Tile icon={Calendar} label="Appointments" value={String(stats.appointments.total)} sub={`+${stats.appointments.last7} this week`} tone="kerala" />
        <Tile icon={Clock}   label="Slot use"    value={`${stats.slots.utilizationPct}%`} sub={`${stats.slots.booked} of ${stats.slots.total}`} tone="emerald" />
        <Tile icon={Heart}   label="Saved by"    value={String(stats.saved.total)} sub="patients" tone="rose" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rating distribution */}
        <article className="bg-white rounded-card border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-gold-500" /> Rating distribution
          </h3>
          {stats.reviews.total === 0 ? (
            <p className="text-sm text-muted italic">No reviews yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.reviews.breakdown.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-gray-700">{star} ★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gold-400 h-full rounded-full" style={{ width: `${(count / maxReviewBreakdown) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-gray-500 text-xs tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-xs text-gray-500">Last 7 days: {stats.reviews.last7} · Last 30: {stats.reviews.last30}</div>
        </article>

        {/* Appointment status breakdown */}
        <article className="bg-white rounded-card border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-kerala-700" /> Appointment status
          </h3>
          {stats.appointments.total === 0 ? (
            <p className="text-sm text-muted italic">No appointments yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {Object.entries(stats.appointments.byStatus).map(([status, count]) => (
                <li key={status} className="flex justify-between border-b last:border-b-0 border-gray-100 pb-1.5 last:pb-0">
                  <span className="capitalize text-gray-700">{status}</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-xs text-gray-500">Last 7 days: {stats.appointments.last7} · Last 30: {stats.appointments.last30}</div>
        </article>

        {/* Slot utilization */}
        <article className="bg-white rounded-card border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-emerald-700" /> Slot utilization
          </h3>
          <div className="text-3xl font-serif text-kerala-700">
            {stats.slots.utilizationPct}%
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.slots.booked} booked of {stats.slots.total} total</p>
          <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.slots.utilizationPct}%` }} />
          </div>
          <p className="mt-3 text-xs text-gray-600">{stats.slots.openFuture} open slots scheduled in the future.</p>
        </article>

        {/* Tip */}
        <article className="bg-kerala-50 border border-kerala-200 rounded-card p-5">
          <h3 className="font-semibold text-kerala-900 inline-flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" /> Grow your practice
          </h3>
          <ul className="text-sm text-kerala-900 space-y-1.5 list-disc list-inside">
            <li>Photo-completed profiles get <strong>3× more bookings</strong> — upload one in <a href="/dashboard/profile" className="underline">profile</a>.</li>
            <li>Add <strong>weekly slots</strong> in <a href="/dashboard/slots" className="underline">availability</a> so patients can book without contacting you.</li>
            <li>Reply to <strong>recent reviews</strong> — engaged doctors rank higher in search.</li>
          </ul>
        </article>
      </section>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, tone }: { icon: typeof Star; label: string; value: string; sub: string; tone: 'amber' | 'kerala' | 'emerald' | 'rose' }) {
  const TONE: Record<typeof tone, string> = {
    amber:   'bg-amber-50 text-amber-800',
    kerala:  'bg-kerala-50 text-kerala-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose:    'bg-rose-50 text-rose-700',
  }
  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-card p-4">
      <div className={`w-9 h-9 rounded-lg ${TONE[tone]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-serif text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
    </div>
  )
}
