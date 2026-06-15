import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { Plus } from 'lucide-react'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export const metadata = { title: 'My Jobs | AyurConnect Employer', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Job = { id: string; title: string; status: string; location: string | null; specialty: string | null; createdAt: string; _count: { applications: number } }

async function fetchMyJobs(): Promise<Job[]> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/jobs/mine`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    return r.json() as Promise<Job[]>
  } catch { return [] }
}

export default async function MyJobsPage() {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/employers/jobs')
  const jobs = await fetchMyJobs()

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl text-ink">My jobs</h1>
          <p className="text-xs text-gray-600">{jobs.length} total</p>
        </div>
        <Link href="/jobs/employers/post" className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-sm font-semibold"><Plus className="w-4 h-4" /> Post new</Link>
      </header>
      <ul className="space-y-2">
        {jobs.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No jobs yet.</li>}
        {jobs.map((j) => (
          <li key={j.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Link href={`/jobs/employers/jobs/${j.id}/applications`} className="font-semibold text-ink hover:text-kerala-700">{j.title}</Link>
                <p className="text-[11px] text-gray-600">{j.specialty ?? '—'} · {j.location ?? '—'} · {j.status}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">{j._count.applications} app{j._count.applications === 1 ? '' : 's'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
