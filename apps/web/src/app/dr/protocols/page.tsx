'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FlaskConical, MessageCircle, Plus, Search } from 'lucide-react'

type Protocol = {
  id: string; slug: string; title: string; condition: string; doshas: string[]
  summary: string; expectedDuration: string | null
  viewCount: number; publishedAt: string | null
  author: { id: string; name: string | null } | null
  _count: { comments: number }
}

export default function ProtocolsPage() {
  const [items, setItems] = useState<Protocol[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const res = await fetch(`/api/dr/protocols?${params}`, { credentials: 'include' })
    if (res.ok) {
      const d = await res.json() as { protocols: Protocol[] }
      setItems(d.protocols)
    }
    setLoading(false)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><FlaskConical className="w-7 h-7" /> Clinical protocols</h1>
          <p className="text-sm text-muted mt-1">Community-contributed, peer-reviewed treatment protocols with full citations.</p>
        </div>
        <Link href="/dr/protocols/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold"><Plus className="w-4 h-4" /> Propose protocol</Link>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); void load() }} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by condition, title…" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-md text-sm" />
      </form>

      {loading ? <p className="text-muted">Loading…</p>
        : items.length === 0 ? <p className="text-muted">No protocols yet.</p>
        : (
          <div className="space-y-3">
            {items.map((p) => (
              <Link key={p.id} href={`/dr/protocols/${p.slug}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <h2 className="font-serif text-lg text-ink hover:text-kerala-700">{p.title}</h2>
                <p className="text-xs text-muted mt-1">{p.condition} · by Dr {p.author?.name ?? 'AyurConnect'}{p.expectedDuration ? ` · ${p.expectedDuration}` : ''}</p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{p.summary}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  {p.doshas.map((d) => <span key={d} className="px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded">{d}</span>)}
                  <span className="inline-flex items-center gap-1 ml-auto"><MessageCircle className="w-3 h-3" /> {p._count.comments}</span>
                  <span>· {p.viewCount} views</span>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
