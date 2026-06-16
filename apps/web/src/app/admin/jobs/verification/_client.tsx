'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

export type Employer = { id: string; slug: string; companyName: string; companyType: string; country: string; city: string | null; isVerified: boolean; verifiedAt: string | null; createdAt: string }

export function VerificationClient({ pending, verified }: { pending: Employer[]; verified: Employer[] }) {
  const [tab, setTab] = useState<'pending' | 'verified'>('pending')
  const [items, setItems] = useState({ pending, verified })
  async function approve(id: string) {
    const r = await fetch(`/api/jobs-portal/admin/employers/${id}/verify`, { method: 'POST', credentials: 'include' })
    if (r.ok) {
      const moved = items.pending.find((e) => e.id === id)
      if (moved) setItems({ pending: items.pending.filter((e) => e.id !== id), verified: [{ ...moved, isVerified: true }, ...items.verified] })
    }
  }
  async function unverify(id: string) {
    if (!confirm('Remove verified status?')) return
    const r = await fetch(`/api/jobs-portal/admin/employers/${id}/unverify`, { method: 'POST', credentials: 'include' })
    if (r.ok) {
      const moved = items.verified.find((e) => e.id === id)
      if (moved) setItems({ verified: items.verified.filter((e) => e.id !== id), pending: [{ ...moved, isVerified: false }, ...items.pending] })
    }
  }
  const list = tab === 'pending' ? items.pending : items.verified
  return (
    <div className="mt-4">
      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm mb-4">
        <button onClick={() => setTab('pending')} className={'px-3 py-1.5 rounded ' + (tab === 'pending' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Pending ({items.pending.length})</button>
        <button onClick={() => setTab('verified')} className={'px-3 py-1.5 rounded ' + (tab === 'verified' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Verified ({items.verified.length})</button>
      </nav>
      <ul className="space-y-2">
        {list.length === 0 && <li className="text-sm text-gray-500 bg-white border border-gray-100 rounded-card p-8 text-center">Nothing here.</li>}
        {list.map((e) => (
          <li key={e.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between gap-3">
            <div>
              <Link href={`/jobs/careers/${e.slug}`} target="_blank" className="font-semibold text-ink hover:text-kerala-700">{e.companyName}</Link>
              <p className="text-[11px] text-gray-600">{e.companyType.replace(/_/g, ' ')} · {e.city ?? ''} {e.country} · joined {new Date(e.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
            <div className="flex gap-2">
              {tab === 'pending'
                ? <button onClick={() => approve(e.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold"><Check className="w-3.5 h-3.5" /> Approve</button>
                : <button onClick={() => unverify(e.id)} className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded text-xs"><X className="w-3.5 h-3.5" /> Unverify</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
