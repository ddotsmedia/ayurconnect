import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from '../../../../../lib/auth'
import { API_INTERNAL } from '../../../../../lib/server-fetch'
import { ApplicationsAdminClient, type ApplicationRow } from './_client'

export const metadata = { title: 'Applications · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type QuickApp = {
  id: string; name: string; email: string; phone: string
  qualification: string | null; experience: string | null
  coverNote: string | null; status: string; createdAt: string
  applicantUserId: string | null
}

type Payload = {
  job: { id: string; title: string; type: string; district: string | null; clinic: string | null; status: string; createdAt: string }
  applications: ApplicationRow[]
  count: number
  quickApplications?: QuickApp[]
  quickCount?: number
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
            {data.job.type} · {data.job.district ?? 'no district'} · {data.count} candidate-profile applications · {data.quickCount ?? 0} quick applies
          </p>
          <ApplicationsAdminClient jobId={id} initial={data.applications} />

          {(data.quickApplications?.length ?? 0) > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-lg text-ink">Quick apply submissions</h2>
              <p className="text-xs text-gray-600 mt-0.5 mb-3">Applications from the one-click apply modal (no candidate profile needed). Message shown when applicant provided one.</p>
              <div className="overflow-x-auto bg-white border border-gray-100 rounded-card">
                <table className="w-full text-xs">
                  <thead className="bg-cream/60 text-left text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Applied</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.quickApplications!.map((q) => {
                      const waDigits = (q.phone ?? '').replace(/\D/g, '')
                      return (
                        <tr key={q.id} className="hover:bg-cream/40 align-top">
                          <td className="p-3 font-medium">{q.name}</td>
                          <td className="p-3">
                            {waDigits ? (
                              <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline font-mono text-[11px]">{q.phone}</a>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="p-3 text-[11px] font-mono">
                            <a href={`mailto:${q.email}`} className="text-kerala-700 hover:underline">{q.email}</a>
                          </td>
                          <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="p-3"><span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100">{q.status}</span></td>
                          <td className="p-3 max-w-sm">
                            {q.coverNote ? (
                              <p className="text-[11px] text-gray-700 whitespace-pre-line line-clamp-4" title={q.coverNote}>{q.coverNote}</p>
                            ) : <span className="text-gray-400 text-[11px] italic">no message</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
