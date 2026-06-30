'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X, MessageCircle } from 'lucide-react'

type Hospital = {
  id: string
  name: string
  district?: string | null
  type?: string | null
  establishedYear?: number | null
  accreditations?: string[] | null
  treatments?: string[] | null
  doctorCount?: number | null
  averageRating?: number | null
  reviewsCount?: number | null
  contact?: string | null
}

export function CompareClient({ hospitals }: { hospitals: Hospital[] }) {
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Hospital[]>([])

  const choices = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return hospitals.slice(0, 10)
    return hospitals.filter((h) => h.name.toLowerCase().includes(t) || (h.district ?? '').toLowerCase().includes(t)).slice(0, 12)
  }, [q, hospitals])

  function pick(h: Hospital) {
    if (picked.find((x) => x.id === h.id)) return
    if (picked.length >= 3) return
    setPicked((p) => [...p, h])
  }
  function unpick(id: string) { setPicked((p) => p.filter((x) => x.id !== id)) }

  return (
    <div className="mt-6">
      <div className="bg-white border border-gray-100 rounded-card p-3">
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by hospital name or district…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded" />
        </div>
        <p className="text-xs text-gray-500 mb-2">{picked.length}/3 picked · click to add</p>
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-auto">
          {choices.map((h) => {
            const isPicked = picked.find((x) => x.id === h.id)
            return (
              <button key={h.id} onClick={() => pick(h)} disabled={!!isPicked || picked.length >= 3}
                      className={`text-xs px-2.5 py-1 rounded border ${isPicked ? 'bg-kerala-50 border-kerala-300 text-kerala-800' : 'bg-white border-gray-200 hover:border-kerala-300'} disabled:opacity-50`}>
                {h.name}{h.district ? <span className="text-gray-400"> · {h.district}</span> : null}
              </button>
            )
          })}
          {choices.length === 0 && <p className="text-xs text-gray-500">No hospitals match.</p>}
        </div>
      </div>

      {picked.length === 0 && <p className="text-sm text-gray-500 mt-6 text-center">Pick 2 or 3 hospitals above to start comparing.</p>}

      {picked.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm border border-gray-100 rounded-card overflow-hidden bg-white">
            <thead className="bg-cream/60">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600 w-44">Field</th>
                {picked.map((h) => (
                  <th key={h.id} className="px-3 py-2 text-left">
                    <div className="flex items-start gap-2">
                      <Link href={`/hospitals/${h.id}`} className="font-semibold text-kerala-800 hover:underline">{h.name}</Link>
                      <button onClick={() => unpick(h.id)} aria-label="Remove" className="text-gray-400 hover:text-rose-600"><X className="w-3 h-3" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { label: 'District',         val: (h: Hospital) => h.district ?? '—' },
                { label: 'Type',             val: (h: Hospital) => h.type ?? '—' },
                { label: 'Established',      val: (h: Hospital) => h.establishedYear ?? '—' },
                { label: 'Accreditations',   val: (h: Hospital) => (h.accreditations ?? []).join(', ') || '—' },
                { label: 'Treatments',       val: (h: Hospital) => (h.treatments ?? []).slice(0, 8).join(', ') || '—' },
                { label: 'Doctor count',     val: (h: Hospital) => h.doctorCount ?? '—' },
                { label: 'Avg rating',       val: (h: Hospital) => h.averageRating != null ? `${h.averageRating.toFixed(1)} · ${h.reviewsCount ?? 0} reviews` : '—' },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">{row.label}</td>
                  {picked.map((h) => <td key={h.id} className="px-3 py-2 align-top">{String(row.val(h) ?? '—')}</td>)}
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">Inquire</td>
                {picked.map((h) => (
                  <td key={h.id} className="px-3 py-2">
                    <a href={`https://wa.me/971509379212?text=${encodeURIComponent(`Hi AyurConnect, I want to inquire about ${h.name}.`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] text-white text-xs font-semibold rounded">
                      <MessageCircle className="w-3 h-3" /> Inquire
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
