import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { getServerSession } from '../../../../lib/auth'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'

export const metadata: Metadata = {
  title: 'Compare Saved Jobs',
  description: 'Side-by-side comparison of jobs from your AyurConnect wishlist.',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

type Job = {
  id: string; title: string; description: string; type: string
  district?: string | null; specialty?: string | null
  clinic?: string | null; salary?: string | null; salaryMin?: number | null; salaryMax?: number | null
  currency?: string | null
  qualifications?: string[]; requirements?: string[]; benefits?: string[]
  expMin?: number | null; expMax?: number | null
  contactEmail?: string | null
  createdAt: string
}

async function fetchOne(id: string, cookie: string): Promise<Job | null> {
  try {
    const r = await fetch(`${API}/jobs/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as Job
  } catch { return null }
}

export default async function CompareSavedJobsPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/jobs/saved')
  const sp = await searchParams
  const ids = (sp.ids ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
  if (ids.length < 2) redirect('/jobs/saved')

  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  const jobs = (await Promise.all(ids.map((id) => fetchOne(id, cookie)))).filter((j): j is Job => !!j)
  if (jobs.length < 2) redirect('/jobs/saved')

  const rows: Array<{ label: string; render: (j: Job) => React.ReactNode }> = [
    { label: 'Title',          render: (j) => <Link href={`/jobs/${j.id}`} className="font-serif text-base text-kerala-800 hover:underline">{j.title}</Link> },
    { label: 'Clinic',         render: (j) => j.clinic ?? '—' },
    { label: 'Type',           render: (j) => j.type ?? '—' },
    { label: 'Specialty',      render: (j) => j.specialty ?? '—' },
    { label: 'District',       render: (j) => j.district ?? '—' },
    { label: 'Salary',         render: (j) => j.salary ?? (j.salaryMin && j.salaryMax ? `${j.currency ?? '₹'} ${j.salaryMin.toLocaleString()} – ${j.salaryMax.toLocaleString()}` : '—') },
    { label: 'Experience',     render: (j) => j.expMin != null || j.expMax != null ? `${j.expMin ?? 0}–${j.expMax ?? '?'} yrs` : '—' },
    { label: 'Qualifications', render: (j) => (j.qualifications?.length ? j.qualifications.join(', ') : '—') },
    { label: 'Requirements',   render: (j) => (j.requirements?.length ? <ul className="list-disc pl-4 space-y-0.5 text-left">{j.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul> : '—') },
    { label: 'Benefits',       render: (j) => (j.benefits?.length ? j.benefits.join(', ') : '—') },
    { label: 'Description',    render: (j) => <p className="text-left leading-relaxed line-clamp-6">{j.description}</p> },
    { label: 'Posted',         render: (j) => new Date(j.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ]

  return (
    <div className="min-h-screen bg-cream/40">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/jobs/saved" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-kerala-700 mb-3">
          <ArrowLeft className="w-3 h-3" /> Back to saved
        </Link>
        <h1 className="font-serif text-3xl text-ink mb-1">Compare {jobs.length} jobs</h1>
        <p className="text-sm text-gray-600 mb-6">Side-by-side view of every field. Apply from the row below to land on the job&apos;s full page.</p>

        <div className="bg-white border border-gray-100 rounded-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-cream/60 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider text-[10px] w-32">Field</th>
                {jobs.map((j) => (
                  <th key={j.id} className="text-left px-3 py-2 font-semibold text-gray-800">
                    {j.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="px-3 py-2.5 text-[11px] font-semibold text-kerala-700 uppercase tracking-wider align-top w-32">{row.label}</td>
                  {jobs.map((j) => (
                    <td key={j.id} className="px-3 py-2.5 text-gray-800 align-top">{row.render(j)}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-cream/40">
                <td className="px-3 py-3 text-[11px] font-semibold text-kerala-700 uppercase tracking-wider">Apply</td>
                {jobs.map((j) => (
                  <td key={j.id} className="px-3 py-3">
                    <Link href={`/jobs/${j.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white text-xs font-semibold rounded">
                      Apply →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
