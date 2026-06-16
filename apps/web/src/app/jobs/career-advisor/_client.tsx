'use client'

import { useState } from 'react'
import { Send, Loader2, Bot } from 'lucide-react'

const PROMPTS = [
  'What is the typical salary for a BAMS doctor in Dubai?',
  'How long does DHA licensing take and how much does it cost?',
  'Should I pursue MD Panchakarma or MD Kayachikitsa for better job prospects?',
  'Tips for an Ayurveda hospital interview in the GCC',
  'What is the demand for Ayurveda doctors in the UK right now?',
  'How do I start as a locum Ayurveda doctor?',
]

type Msg = { role: 'user' | 'assistant'; text: string }

export function AdvisorClient() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  async function ask(text: string) {
    if (!text.trim()) return
    setBusy(true)
    setMsgs((m) => [...m, { role: 'user', text }])
    try {
      const r = await fetch('/api/ai/career', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history: msgs.slice(-6) }),
      })
      if (r.ok) {
        const j = await r.json() as { reply?: string }
        setMsgs((m) => [...m, { role: 'assistant', text: j.reply ?? '—' }])
      } else {
        setMsgs((m) => [...m, { role: 'assistant', text: 'Sorry, I could not reach the advisor right now. Please try again.' }])
      }
    } finally { setBusy(false); setQ('') }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-card shadow-card p-4">
      {msgs.length === 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider font-semibold">Try asking</p>
          <ul className="space-y-1">
            {PROMPTS.map((p) => (
              <li key={p}><button onClick={() => ask(p)} className="text-left text-sm text-gray-800 hover:bg-cream w-full px-2 py-1.5 rounded">→ {p}</button></li>
            ))}
          </ul>
        </div>
      )}
      <ul className="space-y-3 mb-3 max-h-[60vh] overflow-y-auto">
        {msgs.map((m, i) => (
          <li key={i} className={'flex gap-2 ' + (m.role === 'user' ? 'justify-end' : '')}>
            {m.role === 'assistant' && <span className="w-7 h-7 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4" /></span>}
            <p className={'text-sm whitespace-pre-line max-w-[80%] rounded-card px-3 py-2 ' + (m.role === 'user' ? 'bg-kerala-700 text-white' : 'bg-cream border border-gray-100 text-gray-800')}>{m.text}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); ask(q) }} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the advisor…" className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" />
        <button disabled={busy || !q.trim()} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Ask
        </button>
      </form>
    </div>
  )
}
