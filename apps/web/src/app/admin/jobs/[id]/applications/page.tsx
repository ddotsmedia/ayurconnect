import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from '../../../../../lib/auth'
import { API_INTERNAL } from '../../../../../lib/server-fetch'
import { ApplicationsAdminClient, type ApplicationRow } from './_client'

export const metadata = { title: 'Applications · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Payload = {
  job: { id: string; title: string; type: string; district: string | null; clinic: string | null; status: string; createdAt: string }
  applications: ApplicationRow[]
  count: number
}

async function fetchData(id: string): Promise<Payload | null> {
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/admin/jobs/${id}/applications`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as Payload
  } catch { return null }
}

export default async function AdminJobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/jobs')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const { id } = await params
  const data = await fetchData(id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href={`/admin/jobs/${id}/analytics`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-kerala-700 mb-3">
        <ArrowLeft className="w-3 h-3" /> Back to analytics
      </Link>
      {!data ? (
        <>
          <h1 className="font-serif text-2xl text-ink">Job not found</h1>
          <p className="text-sm text-gray-600 mt-1">This job id has no application data or was deleted.</p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-2xl text-ink">{data.job.title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {data.job.type} · {data.job.district ?? 'no district'} · {data.count} applications
          </p>
          <ApplicationsAdminClient jobId={id} initial={data.applications} />
        </>
      )}
    </div>
  )
}
