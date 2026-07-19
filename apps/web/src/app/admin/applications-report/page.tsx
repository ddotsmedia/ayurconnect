import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getServerSession } from '../../../lib/auth'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { ApplicationsReportClient, type Row } from './_client'

export const metadata = { title: 'Applications Report · Admin', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

async function fetchData(sp: Record<string, string | undefined>): Promise<{ items: Row[]; total: number }> {
  const qs = new URLSearchParams()
  for (const k of ['from', 'to', 'status', 'type', 'district', 'search'] as const) {
    if (sp[k]) qs.set(k, sp[k]!)
  }
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/jobs-portal/admin/applications-report${qs.toString() ? `?${qs}` : ''}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return { items: [], total: 0 }
    const j = await r.json() as { items: Row[]; total: number }
    return { items: j.items ?? [], total: j.total ?? 0 }
  } catch { return { items: [], total: 0 } }
}

export default async function ApplicationsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sess = await getServerSession()
  if (!sess) redirect('/sign-in?next=/admin/applications-report')
  if (sess.user.role !== 'ADMIN') redirect('/dashboard')
  const sp = await searchParams
  const { items, total } = await fetchData(sp)
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="font-serif text-2xl text-ink">Applications report</h1>
      <p className="text-xs text-gray-600 mt-1">{total} total (showing up to 500 most recent).</p>
      <ApplicationsReportClient
        initial={items}
        active={{
          from:     sp.from     ?? '',
          to:       sp.to       ?? '',
          status:   sp.status   ?? '',
          type:     sp.type     ?? '',
          district: sp.district ?? '',
          search:   sp.search   ?? '',
        }}
      />
    </div>
  )
}
