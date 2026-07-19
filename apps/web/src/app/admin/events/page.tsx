'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '../../../lib/admin-api'

export type EventRow = {
  id: string; title: string; imageUrl: string; eventDate: string; eventEndDate: string | null
  location: string | null; category: string; organizer: string | null
  registrationLink: string | null; isPublished: boolean; createdAt: string; updatedAt: string
}

export default function AdminEventsPage() {
  const [rows,   setRows]   = useState<EventRow[]>([])
  const [tab,    setTab]    = useState<'all' | 'draft' | 'published'>('all')
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState<string | null>(null)

  async function load() {
    setErr(null)
    try {
      const qs = tab === 'all' ? '' : `?status=${tab}`
      const data = await adminApi.get<EventRow[]>(`/admin/events${qs}`)
      setRows(Array.isArray(data) ? data : [])
    } catch (e) { setErr(String(e)) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, [tab])

  async function togglePublish(r: EventRow) {
    setBusy(true)
    try {
      await adminApi.patch(`/admin/events/${r.id}`, { isPublished: !r.isPublished })
      await load()
    } finally { setBusy(false) }
  }
  async function remove(r: EventRow) {
    if (!confirm(`Delete "${r.title}"?`)) return
    setBusy(true)
    try {
      await adminApi.del(`/admin/events/${r.id}`)
      await load()
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600 mt-1 text-sm">Admin-managed event listings shown on /events.</p>
        </div>
        <Link href="/admin/events/create" className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
          + New event
        </Link>
      </header>

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        {(['all', 'draft', 'published'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-3 py-1.5 rounded capitalize ' + (tab === t ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
            {t}
          </button>
        ))}
      </nav>

      {err && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{err}</div>}

      <div className="bg-white border border-gray-100 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-left text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Location</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500 text-xs italic">No events in this view.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-cream/40">
                <td className="p-3 font-medium">
                  {r.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={r.imageUrl} alt="" className="w-10 h-6 object-cover rounded inline-block mr-2 align-middle" />
                  )}
                  {r.title}
                </td>
                <td className="p-3 text-xs text-gray-700 whitespace-nowrap">{new Date(r.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="p-3 text-xs text-gray-700">{r.location ?? '—'}</td>
                <td className="p-3 text-xs text-gray-700">{r.category}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                    {r.isPublished ? 'published' : 'draft'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2 text-xs">
                  <Link href={`/admin/events/${r.id}/edit`} className="text-kerala-700 hover:underline">Edit</Link>
                  <button disabled={busy} onClick={() => togglePublish(r)} className="text-amber-700 hover:underline disabled:opacity-50">
                    {r.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button disabled={busy} onClick={() => remove(r)} className="text-red-600 hover:underline disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
