'use client'

import { useState, useMemo } from 'react'
import { Copy, MessageCircle, Code2, QrCode as QrIcon, Plus, X, Save, Sparkles } from 'lucide-react'

export type HospitalRef = { id: string; name: string; slug: string | null; district: string }
export type Promotion = {
  id: string; title: string; subtitle: string | null; ctaLabel: string | null; ctaUrl: string | null
  startsAt: string; endsAt: string | null; isActive: boolean
}

// Tiny QR generator — pure SVG, no deps. Uses a 33×33 grid filled from a
// deterministic hash of the input. Not a real QR (not scannable by readers)
// but visually distinctive. For production, swap with a real QR lib.
function fakeQrGrid(seed: string): boolean[][] {
  const size = 33
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const grid: boolean[][] = []
  for (let y = 0; y < size; y++) {
    grid[y] = []
    for (let x = 0; x < size; x++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff
      grid[y][x] = (h & 1) === 1
    }
  }
  // Add finder patterns (corners) to look QR-like.
  const finder = (cx: number, cy: number) => {
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const ax = cx + x, ay = cy + y
      if (ax < 0 || ay < 0 || ax >= size || ay >= size) continue
      const on = Math.abs(x) === 3 || Math.abs(y) === 3 || (Math.abs(x) <= 1 && Math.abs(y) <= 1)
      grid[ay][ax] = on
    }
  }
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4)
  return grid
}

export function MarketingClient({ hospital, initial }: { hospital: HospitalRef; initial: Promotion[] }) {
  const [promos, setPromos] = useState<Promotion[]>(initial)
  const [editing, setEditing] = useState<Promotion | (Omit<Promotion,'id'|'startsAt'> & { id?: string; startsAt?: string }) | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const publicUrl = `https://ayurconnect.com/hospitals/${hospital.id}`
  const wa = `https://wa.me/?text=${encodeURIComponent(`${hospital.name} on AyurConnect — ${publicUrl}`)}`
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`
  const embed = `<iframe src="${publicUrl}/widget" width="320" height="380" style="border:0;border-radius:12px" loading="lazy"></iframe>`

  const qr = useMemo(() => fakeQrGrid(publicUrl), [publicUrl])

  function copy(s: string, k: string) {
    navigator.clipboard?.writeText(s); setCopied(k); window.setTimeout(() => setCopied(null), 1500)
  }

  async function savePromo() {
    if (!editing) return
    const isNew = !('id' in editing) || !editing.id
    const res = await fetch(`/api/hospital/promotions${isNew ? '' : '/' + (editing as Promotion).id}`, {
      method: isNew ? 'POST' : 'PATCH', credentials: 'include',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify(editing),
    })
    if (res.ok) {
      const u = (await res.json()) as Promotion
      setPromos((x) => isNew ? [u, ...x] : x.map((p) => p.id === u.id ? u : p))
      setEditing(null)
    }
  }
  async function deletePromo(id: string) {
    if (!confirm('Delete this promotion?')) return
    await fetch(`/api/hospital/promotions/${id}`, { method: 'DELETE', credentials: 'include' })
    setPromos((x) => x.filter((p) => p.id !== id))
  }
  async function togglePromo(p: Promotion) {
    const res = await fetch(`/api/hospital/promotions/${p.id}`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) })
    if (res.ok) { const u = (await res.json()) as Promotion; setPromos((x) => x.map((q) => q.id === u.id ? u : q)) }
  }

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h1 className="font-serif text-xl text-ink">Marketing</h1>
        <p className="text-xs text-gray-600">Share your profile · embed widget · seasonal promotions.</p>
      </header>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-base text-ink mb-2">Share your profile</h2>
        <div className="flex gap-2 items-center mb-3">
          <code className="flex-1 px-2 py-1.5 bg-gray-50 text-xs text-gray-700 rounded overflow-x-auto">{publicUrl}</code>
          <button onClick={() => copy(publicUrl, 'url')} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs"><Copy className="w-3.5 h-3.5" /> {copied === 'url' ? 'Copied!' : 'Copy'}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white rounded text-xs"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
          <a href={fb} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1877f2] text-white rounded text-xs">Facebook</a>
        </div>
      </article>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-base text-ink mb-2 inline-flex items-center gap-1"><QrIcon className="w-4 h-4" /> QR code</h2>
        <p className="text-xs text-gray-600 mb-3">Print this on brochures or display at reception — patients scan to find you on AyurConnect.</p>
        <div className="inline-block bg-white border-2 border-gray-200 p-3 rounded">
          <svg viewBox="0 0 33 33" className="w-48 h-48 block" aria-label="QR code">
            <rect width="33" height="33" fill="white" />
            {qr.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill="#155228" /> : null))}
          </svg>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Decorative QR — for a scannable production QR, swap with a real generator.</p>
      </article>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <h2 className="font-serif text-base text-ink mb-2 inline-flex items-center gap-1"><Code2 className="w-4 h-4" /> Embed on your website</h2>
        <p className="text-xs text-gray-600 mb-2">Show your AyurConnect verified badge + rating + booking CTA on your hospital&apos;s own website.</p>
        <pre className="bg-gray-900 text-emerald-300 text-[11px] p-3 rounded overflow-x-auto">{embed}</pre>
        <button onClick={() => copy(embed, 'embed')} className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs"><Copy className="w-3.5 h-3.5" /> {copied === 'embed' ? 'Copied!' : 'Copy snippet'}</button>
      </article>

      <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-base text-ink">Seasonal promotions</h2>
          <button onClick={() => setEditing({ title: '', subtitle: null, ctaLabel: null, ctaUrl: null, endsAt: null, isActive: true })} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-xs font-semibold"><Plus className="w-3.5 h-3.5" /> New promotion</button>
        </div>
        <p className="text-xs text-gray-600 mt-1">e.g. &quot;Karkidaka Panchakarma 20% off&quot;. Shows as a banner on your profile.</p>
        <ul className="mt-3 space-y-2">
          {promos.map((p) => (
            <li key={p.id} className={'border rounded-card p-3 text-sm ' + (p.isActive ? 'border-amber-200 bg-amber-50/40' : 'border-gray-200 opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{p.title}</p>
                  {p.subtitle && <p className="text-xs text-gray-700">{p.subtitle}</p>}
                  {p.ctaLabel && <p className="text-xs text-kerala-700 mt-0.5">CTA: {p.ctaLabel}</p>}
                  {p.endsAt && <p className="text-[10px] text-gray-500 mt-1">Ends {new Date(p.endsAt).toLocaleDateString('en-GB')}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePromo(p)} className="text-xs px-2 py-0.5 border border-gray-200 rounded">{p.isActive ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => setEditing(p)} className="text-xs px-2 py-0.5 border border-gray-200 rounded">Edit</button>
                  <button onClick={() => deletePromo(p.id)} className="text-xs px-2 py-0.5 border border-red-200 text-red-600 rounded">Del</button>
                </div>
              </div>
            </li>
          ))}
          {promos.length === 0 && <li className="text-xs text-gray-500 text-center py-4">No promotions yet.</li>}
        </ul>
      </article>

      <article className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 text-center shadow-card">
        <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="font-serif text-lg text-ink mt-2">Request featured listing</h2>
        <p className="text-xs text-gray-700 mt-1">Get premium placement on /hospitals, /heal-in-kerala, and the AyurConnect WhatsApp community.</p>
        <a href="mailto:partnerships@ayurconnect.com?subject=Request%20featured%20listing" className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-xs font-semibold">Contact AyurConnect</a>
      </article>

      {editing && <PromoEditor editing={editing} onChange={setEditing} onSave={savePromo} onClose={() => setEditing(null)} />}
    </div>
  )
}

function PromoEditor({ editing, onChange, onSave, onClose }: {
  editing: Promotion | (Omit<Promotion,'id'|'startsAt'> & { id?: string; startsAt?: string })
  onChange: (p: typeof editing) => void; onSave: () => void; onClose: () => void
}) {
  function set<K extends keyof typeof editing>(k: K, v: (typeof editing)[K]) { onChange({ ...editing, [k]: v }) }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="font-serif text-lg text-ink">{('id' in editing && editing.id) ? 'Edit promotion' : 'New promotion'}</h2><button onClick={onClose}><X className="w-4 h-4" /></button></div>
        <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">Title *</span><input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={editing.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">Subtitle</span><input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={editing.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value || null)} /></label>
        <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">CTA label</span><input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={editing.ctaLabel ?? ''} onChange={(e) => set('ctaLabel', e.target.value || null)} placeholder="Book now" /></label>
        <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">CTA URL</span><input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={editing.ctaUrl ?? ''} onChange={(e) => set('ctaUrl', e.target.value || null)} placeholder="/contact" /></label>
        <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">Ends at</span><input type="date" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={editing.endsAt ? editing.endsAt.slice(0, 10) : ''} onChange={(e) => set('endsAt', e.target.value || null)} /></label>
        <button onClick={onSave} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-kerala-700 text-white rounded font-semibold"><Save className="w-4 h-4" /> Save</button>
      </div>
    </div>
  )
}
