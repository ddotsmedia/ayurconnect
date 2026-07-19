import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { ArrowLeft, Heart, Users, Send, Flame } from 'lucide-react'
import { getServerSession } from '../../../../../lib/auth'
import { API_INTERNAL } from '../../../../../lib/server-fetch'

export const metadata = { title: 'Job analytics · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Analytics = {
  job: { id: string; title: string; type: string; district: string | null; createdAt: string }
  totalSaves:   number
  uniqueUsers:  number
  applyCount:   number
  highInterest: boolean
  saves: Array<{ userId: string; userName: string | null; userEmail: string; savedAt: string }>
}

async function fetchAnalytics(id: string): Promise<Analytics | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/admin/jobs/${id}/analytics`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as Analytics
  } catch { return null }
}

export default async function JobAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/jobs')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const { id } = await params
  const data = await fetchAnalytics(id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-kerala-700 mb-3">
        <ArrowLeft className="w-3 h-3" /> All jobs
      </Link>
      {!data ? (
        <>
          <h1 className="font-serif text-2xl text-ink">Job not found</h1>
          <p className="text-sm text-gray-600 mt-1">This job id has no analytics data or was deleted.</p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-2xl text-ink">{data.job.title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {data.job.type} · {data.job.district ?? 'no district'} · posted {new Date(data.job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Metric icon={Heart} label="Total saves"  value={data.totalSaves} tint="text-rose-600" />
            <Metric icon={Users} label="Unique users" value={data.uniqueUsers} tint="text-kerala-700" />
            <Metric icon={Send}  label="Applications" value={data.applyCount} tint="text-amber-700" />
            <div className="bg-white border border-gray-100 rounded-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Signal</p>
              {data.highInterest ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded">
                  <Flame className="w-3.5 h-3.5" /> High interest
                </span>
              ) : (
                <span className="text-xs text-gray-500">Normal</span>
              )}
              <p className="text-[10px] text-gray-500 mt-2">Triggered when saves ≥ 10, or saves ≥ 5 with applies &lt; saves/2.</p>
            </div>
          </div>

          <h2 className="font-serif text-lg text-ink mt-8 mb-2">Saved by ({data.saves.length})</h2>
          {data.saves.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No user has saved this job yet.</p>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
              <table className="w-full text-xs">
                <thead className="bg-cream/60 text-left text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.saves.map((s) => (
                    <tr key={s.userId + s.savedAt} className="hover:bg-cream/40">
                      <td className="p-3 font-medium">{s.userName ?? '—'}</td>
                      <td className="p-3 text-gray-700 font-mono">{s.userEmail}</td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(s.savedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Metric({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tint: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-serif tabular-nums ${tint}`}><Icon className="w-4 h-4 inline mr-1 -mt-0.5" />{value}</p>
    </div>
  )
}
