import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { SavedJobsReportClient, type ReportRow } from './_client'

export const metadata = { title: 'Saved-jobs Report · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchReport(sp: Record<string, string | undefined>): Promise<ReportRow[]> {
  const qs = new URLSearchParams()
  if (sp.from)     qs.set('from',     sp.from)
  if (sp.to)       qs.set('to',       sp.to)
  if (sp.type)     qs.set('type',     sp.type)
  if (sp.district) qs.set('district', sp.district)
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/admin/saved-jobs-report${qs.toString() ? `?${qs}` : ''}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json() as { items: ReportRow[] }
    return j.items ?? []
  } catch { return [] }
}

export default async function SavedJobsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/saved-jobs-report')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const sp = await searchParams
  const rows = await fetchReport(sp)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-ink">Saved-jobs report</h1>
      <p className="text-xs text-gray-600 mt-1">Jobs ranked by how many users have bookmarked them. High-interest = many saves relative to applies.</p>
      <SavedJobsReportClient
        initial={rows}
        active={{
          from:     sp.from     ?? '',
          to:       sp.to       ?? '',
          type:     sp.type     ?? '',
          district: sp.district ?? '',
        }}
      />
    </div>
  )
}
