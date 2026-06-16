'use client'

import { useState } from 'react'
import { Sparkles, Printer, Loader2, Copy } from 'lucide-react'

const TEMPLATES = ['Classic', 'Modern', 'Medical Professional'] as const

export function ResumeBuilderClient() {
  const [tpl, setTpl] = useState<typeof TEMPLATES[number]>('Medical Professional')
  const [data, setData] = useState({
    fullName: '', headline: 'BAMS, MD (Panchakarma) · 8 years',
    summary: 'Senior Ayurveda physician with 8+ years of classical Panchakarma practice. Specializes in chronic disease management with integrative diagnostics.',
    classicalTraining: 'Ashtavaidya lineage training under …', panchakarma: 'Pizhichil, Sirodhara, Vasti, Virechana, Nasya — daily clinical use.',
    research: '', cme: '', licensing: 'KSMC #12345', email: '', phone: '',
  })
  const [busy, setBusy] = useState<string | null>(null)

  async function improve(field: keyof typeof data) {
    setBusy(field)
    try {
      // Server-side AI call lives at /api/ai/refine — falls back to a noop tag.
      const r = await fetch('/api/ai/refine', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ field, text: data[field], context: 'Ayurveda doctor resume' }),
      })
      if (r.ok) {
        const j = await r.json() as { text?: string }
        if (j.text) setData((d) => ({ ...d, [field]: j.text as string }))
      }
    } catch { /* noop */ }
    finally { setBusy(null) }
  }

  function copy() { navigator.clipboard?.writeText(JSON.stringify(data, null, 2)) }

  return (
    <div className="mt-5 space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Template</p>
          <select value={tpl} onChange={(e) => setTpl(e.target.value as typeof TEMPLATES[number])} className="text-sm border border-gray-200 rounded px-2 py-1">
            {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50"><Copy className="w-3.5 h-3.5" /> Copy JSON</button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 text-white rounded text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print / PDF</button>
        </div>
      </header>

      {/* Printable resume */}
      <article className="bg-white border border-gray-200 rounded-card p-8 shadow-card print:shadow-none print:border-0">
        <header className="border-b border-gray-300 pb-3">
          <input value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} placeholder="Your full name" className="w-full font-serif text-3xl text-kerala-700 border-none focus:outline-none" />
          <input value={data.headline} onChange={(e) => setData({ ...data, headline: e.target.value })} className="w-full text-sm text-gray-600 border-none focus:outline-none mt-1" />
          <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 mt-2">
            <input placeholder="Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="border-none focus:outline-none" />
            <input placeholder="Phone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="border-none focus:outline-none" />
            <input placeholder="License #" value={data.licensing} onChange={(e) => setData({ ...data, licensing: e.target.value })} className="border-none focus:outline-none" />
          </div>
        </header>

        {(['summary','classicalTraining','panchakarma','research','cme'] as const).map((field) => (
          <Section key={field} title={LABELS[field]} field={field} value={data[field]} setValue={(v) => setData({ ...data, [field]: v })} onImprove={() => improve(field)} busy={busy === field} />
        ))}
      </article>

      <style jsx global>{`@media print { body { background: white !important } .print\\:hidden { display: none !important } }`}</style>
    </div>
  )
}

const LABELS: Record<string, string> = {
  summary: 'Professional Summary', classicalTraining: 'Classical Training', panchakarma: 'Panchakarma Competencies',
  research: 'Research & Publications', cme: 'CME & Certifications',
}

function Section({ title, field, value, setValue, onImprove, busy }: { title: string; field: string; value: string; setValue: (v: string) => void; onImprove: () => void; busy: boolean }) {
  return (
    <section className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-kerala-700">{title}</h2>
        <button onClick={onImprove} disabled={busy} className="print:hidden inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold disabled:opacity-50">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI improve
        </button>
      </div>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className="w-full mt-1 text-sm text-gray-800 border border-gray-100 rounded px-2 py-1.5 focus:outline-none focus:border-kerala-700 print:border-0" data-field={field} />
    </section>
  )
}
