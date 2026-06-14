'use client'

import { useState } from 'react'
import { Save, Plus, X, Copy, MessageCircle, Eye } from 'lucide-react'
import {
  HOSPITAL_TYPES, TREATMENTS, FACILITIES, SPECIALIZATIONS,
  PAYMENT_METHODS, LANGUAGES, TOURISM_CLASS,
} from '../../../hospitals/register/_data'

type H = {
  id: string; name: string; nameMl: string | null; type: string; district: string; state: string | null; country: string; pincode: string | null
  profile: string | null; profileMl: string | null; establishedYear: number | null
  contact: string | null; whatsapp: string | null; email: string | null; address: string | null
  latitude: number | null; longitude: number | null
  services: string[]; treatments: string[]; facilities: string[]; photos: string[]; languages: string[]; paymentMethods: string[]
  ayushCertified: boolean; nabh: boolean; panchakarma: boolean; tourismClass: string | null; iso: string | null
  operatingHours: Record<string, { open: string; close: string; closed: boolean }> | null
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const

export function ProfileEditor({ initial, completeness }: { initial: H; completeness: number }) {
  const [f, setF] = useState<H>({
    ...initial,
    operatingHours: initial.operatingHours ?? Object.fromEntries(DAYS.map((d) => [d, { open: '09:00', close: '18:00', closed: d === 'Sun' }])),
  })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPhoto, setNewPhoto] = useState('')
  const [copied, setCopied] = useState(false)

  function set<K extends keyof H>(k: K, v: H[K]) { setF((x) => ({ ...x, [k]: v })) }
  function toggle(field: 'services'|'treatments'|'facilities'|'languages'|'paymentMethods', v: string) {
    setF((x) => ({ ...x, [field]: x[field].includes(v) ? x[field].filter((y) => y !== v) : [...x[field], v] }))
  }
  function setDay(day: string, k: 'open'|'close'|'closed', v: string | boolean) {
    setF((x) => ({ ...x, operatingHours: { ...(x.operatingHours ?? {}), [day]: { ...(x.operatingHours?.[day] ?? { open: '09:00', close: '18:00', closed: false }), [k]: v } } }))
  }

  async function save() {
    setBusy(true); setSaved(false)
    try {
      await fetch('/api/hospital/profile', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: f.name, nameMl: f.nameMl, type: f.type, district: f.district, state: f.state, country: f.country, pincode: f.pincode,
          profile: f.profile, profileMl: f.profileMl, establishedYear: f.establishedYear,
          contact: f.contact, whatsapp: f.whatsapp, email: f.email, address: f.address,
          latitude: f.latitude, longitude: f.longitude,
          services: f.services, treatments: f.treatments, facilities: f.facilities, photos: f.photos,
          languages: f.languages, paymentMethods: f.paymentMethods,
          ayushCertified: f.ayushCertified, nabh: f.nabh, panchakarma: f.panchakarma,
          tourismClass: f.tourismClass, iso: f.iso,
          operatingHours: f.operatingHours,
        }),
      })
      setSaved(true); window.setTimeout(() => setSaved(false), 2000)
    } finally { setBusy(false) }
  }

  const publicUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/hospitals/${f.id}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${f.name} on AyurConnect — ${publicUrl}`)}`

  return (
    <div className="space-y-5">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Profile editor</p>
          <h1 className="font-serif text-xl text-ink">{f.name}</h1>
          <p className="text-xs text-gray-600">Completeness <strong>{completeness}%</strong></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/hospitals/${f.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs"><Eye className="w-3.5 h-3.5" /> Preview</a>
          <button onClick={() => { navigator.clipboard?.writeText(publicUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs"><Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy link'}</button>
          <a href={waShare} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white rounded text-xs"><MessageCircle className="w-3.5 h-3.5" /> Share</a>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold disabled:opacity-50"><Save className="w-3.5 h-3.5" /> {busy ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}</button>
        </div>
      </header>

      <Section title="Basic">
        <Two><L l="Name"><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} /></L>
             <L l="Name (Malayalam)"><input className="input" dir="auto" value={f.nameMl ?? ''} onChange={(e) => set('nameMl', e.target.value || null)} /></L></Two>
        <Two><L l="Type"><select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>{HOSPITAL_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select></L>
             <L l="Established year"><input type="number" className="input" value={f.establishedYear ?? ''} onChange={(e) => set('establishedYear', e.target.value ? Number(e.target.value) : null)} /></L></Two>
      </Section>

      <Section title="Location">
        <L l="Address"><input className="input" value={f.address ?? ''} onChange={(e) => set('address', e.target.value || null)} /></L>
        <Two><L l="District"><input className="input" value={f.district} onChange={(e) => set('district', e.target.value)} /></L>
             <L l="State"><input className="input" value={f.state ?? ''} onChange={(e) => set('state', e.target.value || null)} /></L></Two>
        <Two><L l="Country (ISO-2)"><input className="input" maxLength={2} value={f.country} onChange={(e) => set('country', e.target.value.toUpperCase())} /></L>
             <L l="Pincode"><input className="input" value={f.pincode ?? ''} onChange={(e) => set('pincode', e.target.value || null)} /></L></Two>
        <Two><L l="Latitude"><input type="number" step="0.000001" className="input" value={f.latitude ?? ''} onChange={(e) => set('latitude', e.target.value ? Number(e.target.value) : null)} /></L>
             <L l="Longitude"><input type="number" step="0.000001" className="input" value={f.longitude ?? ''} onChange={(e) => set('longitude', e.target.value ? Number(e.target.value) : null)} /></L></Two>
      </Section>

      <Section title="Contact">
        <Two><L l="Phone"><input className="input" value={f.contact ?? ''} onChange={(e) => set('contact', e.target.value || null)} /></L>
             <L l="WhatsApp"><input className="input" value={f.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value || null)} /></L></Two>
        <L l="Email"><input className="input" type="email" value={f.email ?? ''} onChange={(e) => set('email', e.target.value || null)} /></L>
      </Section>

      <Section title="Operating hours">
        <div className="space-y-1.5">
          {DAYS.map((d) => {
            const oh = f.operatingHours?.[d] ?? { open: '09:00', close: '18:00', closed: false }
            return (
              <div key={d} className="flex items-center gap-2 text-sm">
                <span className="w-12 font-semibold text-gray-700">{d}</span>
                <label className="inline-flex items-center gap-1 text-xs"><input type="checkbox" checked={oh.closed} onChange={(e) => setDay(d, 'closed', e.target.checked)} /> Closed</label>
                {!oh.closed && (
                  <>
                    <input type="time" value={oh.open}  onChange={(e) => setDay(d, 'open',  e.target.value)} className="input w-28" />
                    <span className="text-xs text-gray-500">to</span>
                    <input type="time" value={oh.close} onChange={(e) => setDay(d, 'close', e.target.value)} className="input w-28" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Photo gallery">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="https://…/photo.jpg" value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} />
          <button type="button" disabled={!newPhoto.trim() || f.photos.length >= 10} onClick={() => { set('photos', [...f.photos, newPhoto.trim()]); setNewPhoto('') }} className="inline-flex items-center gap-1 px-3 py-2 bg-kerala-700 text-white rounded text-sm disabled:opacity-50"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          {f.photos.map((p, i) => (
            <div key={i} className="relative border border-gray-100 rounded overflow-hidden bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="w-full h-32 object-cover" />
              <div className="absolute top-1 right-1 flex gap-1">
                <button onClick={() => { if (i > 0) { const c = [...f.photos]; [c[i-1], c[i]] = [c[i], c[i-1]]; set('photos', c) } }} className="bg-white/90 px-1.5 py-0.5 rounded text-[10px]">↑</button>
                <button onClick={() => set('photos', f.photos.filter((_, j) => j !== i))} className="bg-red-600 text-white px-1.5 py-0.5 rounded"><X className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="About">
        <L l="Description (English)"><textarea rows={5} className="input" value={f.profile ?? ''} onChange={(e) => set('profile', e.target.value || null)} /></L>
        <L l="Description (Malayalam)"><textarea rows={5} className="input" dir="auto" value={f.profileMl ?? ''} onChange={(e) => set('profileMl', e.target.value || null)} /></L>
      </Section>

      <Chips title="Specializations" options={SPECIALIZATIONS}  selected={f.services}        onToggle={(v) => toggle('services', v)} />
      <Chips title="Treatments"      options={TREATMENTS}       selected={f.treatments}      onToggle={(v) => toggle('treatments', v)} />
      <Chips title="Facilities"      options={FACILITIES}       selected={f.facilities}      onToggle={(v) => toggle('facilities', v)} />
      <Chips title="Languages"       options={LANGUAGES}        selected={f.languages}       onToggle={(v) => toggle('languages', v)} />
      <Chips title="Payment methods" options={PAYMENT_METHODS}  selected={f.paymentMethods}  onToggle={(v) => toggle('paymentMethods', v)} />

      <Section title="Accreditation">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <Tog l="AYUSH Certified" v={f.ayushCertified} on={(b) => set('ayushCertified', b)} />
          <Tog l="NABH Accredited" v={f.nabh}           on={(b) => set('nabh', b)} />
          <Tog l="Panchakarma facility" v={f.panchakarma} on={(b) => set('panchakarma', b)} />
        </div>
        <Two><L l="Tourism Class"><select className="input" value={f.tourismClass ?? ''} onChange={(e) => set('tourismClass', e.target.value || null)}>{TOURISM_CLASS.map((c) => <option key={c} value={c}>{c || '— none —'}</option>)}</select></L>
             <L l="ISO certifications"><input className="input" value={f.iso ?? ''} onChange={(e) => set('iso', e.target.value || null)} /></L></Two>
      </Section>

      <button onClick={save} disabled={busy} className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
        <Save className="w-4 h-4" /> {busy ? 'Saving…' : saved ? 'Saved!' : 'Save all changes'}
      </button>

      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-4 shadow-card space-y-2.5">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      {children}
    </article>
  )
}
function Two({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div> }
function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
function Tog({ l, v, on }: { l: string; v: boolean; on: (b: boolean) => void }) {
  return <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded text-sm cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />{l}</label>
}
function Chips({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <Section title={title}>
      <p className="text-xs text-gray-500">{selected.length} selected.</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return <button key={o} type="button" onClick={() => onToggle(o)} className={'px-2.5 py-1 rounded-full text-xs border ' + (on ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>{on && '✓ '}{o}</button>
        })}
      </div>
    </Section>
  )
}
