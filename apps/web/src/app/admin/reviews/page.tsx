'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
  doctor: { id: string; name: string } | null
  hospital: { id: string; name: string } | null
}

export default function ReviewsAdminPage() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const data = await adminApi.get<{ reviews: Review[]; pagination: unknown }>('/reviews?limit=100')
      setItems(data.reviews)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Delete this review?')) return
    try { await adminApi.del(`/reviews/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Reviews moderation</h1>
        <p className="text-gray-600 mt-1">{items.length} loaded</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Rating</th>
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5">Author</th>
              <th className="px-4 py-2.5">Comment</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No reviews yet.</td></tr>
            )}
            {items.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">{'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span></td>
                <td className="px-4 py-2.5 text-xs">
                  {r.doctor && <span>Dr. {r.doctor.name}</span>}
                  {r.hospital && <span>{r.hospital.name}</span>}
                  {!r.doctor && !r.hospital && <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{r.user?.email ?? '—'}</td>
                <td className="px-4 py-2.5 max-w-xs truncate" title={r.comment ?? ''}>{r.comment ?? <span className="text-gray-400">no comment</span>}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => remove(r.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
