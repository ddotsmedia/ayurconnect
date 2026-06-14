'use client'

import { useState, useMemo } from 'react'
import { Star, MessageSquare, Save, X, Flag, Copy } from 'lucide-react'

export type ReviewRow = {
  id: string; rating: number; comment: string | null; createdAt: string
  user: { name: string | null; email: string }
  hospitalResponse: { id: string; body: string; updatedAt: string } | null
}

export function ReviewsClient({ initial }: { initial: ReviewRow[] }) {
  const [items, setItems] = useState<ReviewRow[]>(initial)
  const [respond, setRespond] = useState<{ id: string; body: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const avg = items.length ? items.reduce((a, r) => a + r.rating, 0) / items.length : 0
  const dist = useMemo(() => [5,4,3,2,1].map((s) => ({ s, n: items.filter((r) => r.rating === s).length })), [items])

  async function saveResponse() {
    if (!respond) return
    const res = await fetch(`/api/hospital/reviews/${respond.id}/response`, { method: 'PUT', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body: respond.body }) })
    if (res.ok) {
      const u = await res.json() as { id: string; body: string; updatedAt: string }
      setItems((x) => x.map((r) => r.id === respond.id ? { ...r, hospitalResponse: u } : r))
      setRespond(null)
    }
  }

  const reviewLink = typeof window === 'undefined' ? '' : `${window.location.origin}/hospitals/${items[0] ? '' : ''}?review=1`

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h1 className="font-serif text-xl text-ink">Reviews</h1>
        <div className="mt-3 flex gap-6 flex-wrap">
          <div>
            <p className="text-3xl font-bold text-kerala-700">{avg.toFixed(1)} <span className="text-base text-gray-500">/5</span></p>
            <p className="text-xs text-gray-500">{items.length} review{items.length === 1 ? '' : 's'}</p>
            <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={'w-4 h-4 ' + (i < Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />)}</div>
          </div>
          <div className="flex-1 min-w-[200px] space-y-0.5">
            {dist.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3">{s}</span><Star className="w-3 h-3 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: items.length ? `${(n / items.length) * 100}%` : '0%' }} /></div>
                <span className="text-gray-500 w-6 text-right">{n}</span>
              </div>
            ))}
          </div>
          <div className="self-end">
            <button onClick={() => { navigator.clipboard?.writeText(reviewLink); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs">
              <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy review request link'}
            </button>
            <p className="text-[10px] text-gray-500 mt-1">Share with patients after treatment.</p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        {items.map((r) => (
          <article key={r.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">{r.user.name ?? 'Anonymous patient'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={'w-3.5 h-3.5 ' + (i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />)}
                  <span className="text-[10px] text-gray-500 ml-1">· {new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <button title="Flag for moderation" className="text-gray-400 hover:text-red-600"><Flag className="w-4 h-4" /></button>
            </div>
            {r.comment && <p className="text-sm text-gray-800 mt-2">{r.comment}</p>}
            {r.hospitalResponse ? (
              <div className="mt-3 pl-3 border-l-2 border-kerala-300 bg-kerala-50/40 p-2.5 rounded">
                <p className="text-xs font-semibold text-kerala-700">Your response · {new Date(r.hospitalResponse.updatedAt).toLocaleDateString('en-GB')}</p>
                <p className="text-sm text-gray-800 mt-0.5">{r.hospitalResponse.body}</p>
                <button onClick={() => setRespond({ id: r.id, body: r.hospitalResponse?.body ?? '' })} className="text-xs text-kerala-700 hover:underline mt-1">Edit response</button>
              </div>
            ) : (
              <button onClick={() => setRespond({ id: r.id, body: '' })} className="mt-2 inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline"><MessageSquare className="w-3.5 h-3.5" /> Reply to this review</button>
            )}
          </article>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">No reviews yet.</p>}
      </section>

      {respond && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setRespond(null)}>
          <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="font-serif text-lg text-ink">Hospital response</h2><button onClick={() => setRespond(null)}><X className="w-4 h-4" /></button></div>
            <textarea rows={5} value={respond.body} onChange={(e) => setRespond({ ...respond, body: e.target.value })} placeholder="Thank you for your feedback…" className="w-full border border-gray-200 rounded p-2 text-sm" />
            <button onClick={saveResponse} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white rounded font-semibold"><Save className="w-4 h-4" /> Save response</button>
          </div>
        </div>
      )}
    </div>
  )
}
