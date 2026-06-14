'use client'

import { useState, useMemo } from 'react'
import { MessageCircle, Mail, Download, Filter, Save, X } from 'lucide-react'

export type Inquiry = {
  id: string; hospitalId: string; patientName: string; email: string; phone: string | null; whatsapp: string | null
  country: string | null; treatmentInterest: string | null; preferredDates: string | null; message: string
  source: string; status: string; notes: string | null; assignedTo: string | null; createdAt: string; updatedAt: string
}

const STATUSES = ['all','new','contacted','converted','closed'] as const
const STATUS_COLOR: Record<string, string> = {
  new:       'bg-amber-50 text-amber-800 border-amber-200',
  contacted: 'bg-blue-50 text-blue-800 border-blue-200',
  converted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  closed:    'bg-gray-50 text-gray-600 border-gray-200',
}

export function InquiriesClient({ initial }: { initial: Inquiry[] }) {
  const [items, setItems] = useState(initial)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Inquiry | null>(null)

  const visible = useMemo(() => items.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (sourceFilter !== 'all' && i.source !== sourceFilter) return false
    if (q) {
      const s = q.toLowerCase()
      return i.patientName.toLowerCase().includes(s) || i.email.toLowerCase().includes(s) || (i.treatmentInterest ?? '').toLowerCase().includes(s)
    }
    return true
  }), [items, statusFilter, sourceFilter, q])

  async function update(id: string, patch: Partial<Inquiry>) {
    const res = await fetch(`/api/hospital/inquiries/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) {
      const u = (await res.json()) as Inquiry
      setItems((x) => x.map((i) => i.id === u.id ? u : i))
      if (open?.id === u.id) setOpen(u)
    }
  }

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-xl text-ink">Inquiries</h1>
          <a href="/api/hospital/inquiries.csv" className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50"><Download className="w-3.5 h-3.5" /> Export CSV</a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center text-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs">
            <option value="all">all sources</option><option value="website">website</option><option value="whatsapp">whatsapp</option><option value="heal_in_kerala">heal in kerala</option><option value="direct">direct</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email…" className="flex-1 min-w-[200px] border border-gray-200 rounded px-2 py-1 text-xs" />
        </div>
      </header>

      <section className="bg-white border border-gray-100 rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
            <tr><th className="px-3 py-2">Patient</th><th className="px-3 py-2">Interest</th><th className="px-3 py-2">Country</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody>
            {visible.map((i) => (
              <tr key={i.id} className="border-t border-gray-100 hover:bg-cream cursor-pointer" onClick={() => setOpen(i)}>
                <td className="px-3 py-2"><p className="font-semibold text-ink">{i.patientName}</p><p className="text-xs text-gray-500">{i.email}</p></td>
                <td className="px-3 py-2 text-gray-700">{i.treatmentInterest ?? '—'}</td>
                <td className="px-3 py-2 text-gray-700">{i.country ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{new Date(i.createdAt).toLocaleDateString('en-GB')}</td>
                <td className="px-3 py-2"><span className={'inline-block px-2 py-0.5 rounded-full text-[10px] border ' + STATUS_COLOR[i.status]}>{i.status}</span></td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No inquiries match your filters.</td></tr>}
          </tbody>
        </table>
      </section>

      {open && <Detail inquiry={open} onClose={() => setOpen(null)} onUpdate={(p) => update(open.id, p)} />}
    </div>
  )
}

function Detail({ inquiry, onClose, onUpdate }: { inquiry: Inquiry; onClose: () => void; onUpdate: (p: Partial<Inquiry>) => Promise<void> }) {
  const [notes, setNotes] = useState(inquiry.notes ?? '')
  const wa = inquiry.whatsapp ?? inquiry.phone
  const waUrl = wa ? `https://wa.me/${wa.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${inquiry.patientName}, this is from AyurConnect regarding your inquiry…`)}` : null
  const mailUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent('Your inquiry on AyurConnect')}&body=${encodeURIComponent(`Hi ${inquiry.patientName},\n\nThank you for your interest.\n\n`)}`

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-card max-w-xl w-full p-5 my-8 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg text-ink">{inquiry.patientName}</h2>
            <p className="text-xs text-gray-500">Inquired {new Date(inquiry.createdAt).toLocaleString('en-GB')}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <D l="Email" v={inquiry.email} /><D l="Phone" v={inquiry.phone ?? '—'} />
          <D l="WhatsApp" v={inquiry.whatsapp ?? '—'} /><D l="Country" v={inquiry.country ?? '—'} />
          <D l="Treatment" v={inquiry.treatmentInterest ?? '—'} /><D l="Preferred dates" v={inquiry.preferredDates ?? '—'} />
        </dl>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Message</p>
          <p className="text-sm text-gray-800 bg-cream border border-kerala-100 rounded p-2.5 whitespace-pre-wrap">{inquiry.message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {waUrl && <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white rounded text-xs font-semibold"><MessageCircle className="w-3.5 h-3.5" /> Reply via WhatsApp</a>}
          <a href={mailUrl} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-xs font-semibold"><Mail className="w-3.5 h-3.5" /> Reply via Email</a>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Internal notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => onUpdate({ notes })} className="w-full border border-gray-200 rounded p-2 text-sm" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Status</p>
          <div className="flex gap-1">
            {(['new','contacted','converted','closed'] as const).map((s) => (
              <button key={s} onClick={() => onUpdate({ status: s })} className={'px-2.5 py-1 rounded text-xs ' + (inquiry.status === s ? 'bg-kerala-700 text-white' : 'border border-gray-200 hover:bg-gray-50')}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function D({ l, v }: { l: string; v: string }) {
  return <div><dt className="text-gray-500">{l}</dt><dd className="text-gray-900">{v}</dd></div>
}
