import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { WithdrawButton } from './_client'

export const metadata = { title: 'My Applications | AyurConnect Jobs', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type A = { id: string; jobId: string; status: string; appliedAt: string; matchScore: number | null; rejectionReason: string | null }

async function fetchApps(): Promise<A[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/applications`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<A[]>
  } catch { return [] }
}

const COLOR: Record<string, string> = {
  applied: 'bg-amber-50 text-amber-800', viewed: 'bg-blue-50 text-blue-800',
  shortlisted: 'bg-emerald-50 text-emerald-800', interview_scheduled: 'bg-purple-50 text-purple-800',
  offered: 'bg-cyan-50 text-cyan-800', hired: 'bg-kerala-50 text-kerala-700',
  rejected: 'bg-red-50 text-red-800', withdrawn: 'bg-gray-50 text-gray-600',
}

export default async function ApplicationsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/applications')
  const items = await fetchApps()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-serif text-2xl text-ink">My applications</h1>
      <p className="text-xs text-gray-600 mt-1">{items.length} total</p>
      <ul className="mt-5 space-y-2">
        {items.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No applications yet. <Link href="/jobs" className="text-kerala-700 hover:underline">Browse jobs →</Link></li>}
        {items.map((a) => (
          <li key={a.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between gap-3">
            <div>
              <Link href={`/jobs/${a.jobId}`} className="text-sm font-semibold text-ink hover:text-kerala-700">View job</Link>
              <p className="text-[11px] text-gray-600">Applied {new Date(a.appliedAt).toLocaleDateString('en-GB')}{a.rejectionReason ? ` · ${a.rejectionReason}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (COLOR[a.status] ?? 'bg-gray-50 text-gray-600')}>{a.status}</span>
              {!['hired','withdrawn','rejected'].includes(a.status) && <WithdrawButton id={a.id} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
