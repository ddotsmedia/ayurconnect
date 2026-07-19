'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '../../../lib/admin-api'

export type EventRow = {
  id:              string
  title:           string
  imageUrl:        string
  eventDate:       string
  eventEndDate:    string | null
  location:        string | null
  category:        string
  organizer:       string | null
  registrationLink: string | null
  isPublished:     boolean
  status:          'pending' | 'approved' | 'rejected'
  verifiedBy:      string | null
  verifiedAt:      string | null
  rejectionReason: string | null
  createdAt:       string
  updatedAt:       string
}

type Tab = 'pending' | 'approved' | 'rejected' | 'all'

const TAB_LABEL: Record<Tab, string> = {
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected', all: 'All',
}
const STATUS_TONE: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-800',
  approved: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-rose-50 text-rose-800',
}

export default function AdminEventsPage() {
  const [rows,   setRows]   = useState<EventRow[]>([])
  const [tab,    setTab]    = useState<Tab>('pending')
  const [busy,   setBusy]   = useState(false)
  const [err,    setErr]    = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load() {
    setErr(null); setSelected(new Set())
    try {
      const qs = tab === 'all' ? '' : `?status=${tab}`
      const data = await adminApi.get<EventRow[]>(`/admin/events${qs}`)
      setRows(Array.isArray(data) ? data : [])
    } catch (e) { setErr(String(e)) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, [tab])

  async function approve(id: string) {
    setBusy(true)
    try { await adminApi.patch(`/admin/events/${id}/approve`, {}); await load() }
    catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  async function submitReject() {
    if (!rejecting) return
    const reason = rejectReason.trim()
    if (!reason) { alert('Reason required'); return }
    setBusy(true)
    try {
      await adminApi.patch(`/admin/events/${rejecting.id}/reject`, { reason })
      setRejecting(null); setRejectReason(''); await load()
    } catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  async function bulkApprove() {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Approve ${ids.length} event${ids.length === 1 ? '' : 's'}?`)) return
    setBusy(true)
    try {
      await adminApi.patch(`/admin/events/bulk-approve`, { ids })
      await load()
    } catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  async function togglePublish(r: EventRow) {
    setBusy(true)
    try { await adminApi.patch(`/admin/events/${r.id}`, { isPublished: !r.isPublished }); await load() }
    catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  async function remove(r: EventRow) {
    if (!confirm(`Delete "${r.title}"?`)) return
    setBusy(true)
    try { await adminApi.del(`/admin/events/${r.id}`); await load() }
    catch (e) { alert(String(e)) } finally { setBusy(false) }
  }
  function toggleOne(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAllVisible() {
    setSelected((s) => {
      const visible = rows.map((r) => r.id)
      const allOn = visible.every((id) => s.has(id)) && visible.length > 0
      return allOn ? new Set() : new Set(visible)
    })
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600 mt-1 text-sm">Admin-managed listings. Approval required before public display.</p>
        </div>
        <Link href="/admin/events/create" className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
          + New event
        </Link>
      </header>

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        {(['pending', 'approved', 'rejected', 'all'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-3 py-1.5 rounded ' + (tab === t ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </nav>

      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 bg-kerala-50 border border-kerala-200 rounded-md px-4 py-2.5 text-sm">
          <span className="text-kerala-800 font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={bulkApprove} disabled={busy} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded text-xs font-semibold">
              {busy ? 'Approving…' : `Approve selected (${selected.size})`}
            </button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 border border-gray-300 hover:bg-white rounded text-xs">Clear</button>
          </div>
        </div>
      )}

      {err && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{err}</div>}

      <div className="bg-white border border-gray-100 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-left text-[10px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                  onChange={toggleAllVisible}
                />
              </th>
              <th className="p-3">Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Location</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Live</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-gray-500 text-xs italic">No events in this view.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? 'bg-kerala-50/60' : 'hover:bg-cream/40'}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.title}`}
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                  />
                </td>
                <td className="p-3 font-medium">
                  {r.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={r.imageUrl} alt="" className="w-10 h-6 object-cover rounded inline-block mr-2 align-middle" />
                  )}
                  {r.title}
                  {r.status === 'rejected' && r.rejectionReason && (
                    <div className="text-[10px] text-rose-700 mt-1 italic">✕ {r.rejectionReason}</div>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-700 whitespace-nowrap">{new Date(r.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="p-3 text-xs text-gray-700">{r.location ?? '—'}</td>
                <td className="p-3 text-xs text-gray-700">{r.category}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${STATUS_TONE[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {r.isPublished ? 'published' : 'draft'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2 text-xs whitespace-nowrap">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => approve(r.id)} disabled={busy} className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold disabled:opacity-50">Approve</button>
                      <button onClick={() => setRejecting({ id: r.id, title: r.title })} disabled={busy} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50">Reject</button>
                    </>
                  )}
                  {r.status === 'rejected' && (
                    <button onClick={() => approve(r.id)} disabled={busy} className="text-emerald-700 hover:underline disabled:opacity-50">Re-approve</button>
                  )}
                  <Link href={`/admin/events/${r.id}/edit`} className="text-kerala-700 hover:underline">Edit</Link>
                  {r.status === 'approved' && (
                    <button disabled={busy} onClick={() => togglePublish(r)} className="text-amber-700 hover:underline disabled:opacity-50">
                      {r.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  )}
                  <button disabled={busy} onClick={() => remove(r)} className="text-red-600 hover:underline disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setRejecting(null); setRejectReason('') }}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Reject event</h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">&ldquo;{rejecting.title}&rdquo;</p>
            <label className="block text-[11px] uppercase tracking-wider text-kerala-700 font-semibold mt-4 mb-1">Reason *</label>
            <textarea
              autoFocus
              rows={4}
              maxLength={500}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Duplicate submission / not Ayurveda-related / poster image unusable…"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
            <p className="text-[11px] text-gray-500 mt-1">{rejectReason.length}/500 — stored on the event row.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejecting(null); setRejectReason('') }} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={submitReject} disabled={!rejectReason.trim() || busy} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-sm font-semibold">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
