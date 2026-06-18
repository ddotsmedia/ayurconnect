'use client'

import { useState } from 'react'
import { ChevronRight, Bot, Send, Loader2, MessageCircle, Lightbulb } from 'lucide-react'
import type { InterviewQA } from './_data'

type Tip = { title: string; body: string }
type Msg = { role: 'user' | 'assistant'; text: string }

export function InterviewPrepClient({ questions, tips }: { questions: InterviewQA[]; tips: Tip[] }) {
  const [tab, setTab] = useState<'qa' | 'mock' | 'tips'>('qa')
  const [cat, setCat] = useState<string>('all')
  const cats = Array.from(new Set(questions.map((q) => q.category)))
  const filtered = cat === 'all' ? questions : questions.filter((q) => q.category === cat)

  // Mock interview state
  const [role, setRole] = useState<string>('GCC Clinical')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  async function startMock() {
    setMsgs([{ role: 'assistant', text: `I'm your mock interview AI for a ${role} role. I'll ask you 5 questions. Take your time, answer thoughtfully. Question 1: Walk me through your background and why you chose Ayurveda.` }])
  }
  async function send() {
    if (!input.trim() || busy) return
    const userText = input.trim()
    setInput('')
    setBusy(true)
    setMsgs((m) => [...m, { role: 'user', text: userText }])
    try {
      const r = await fetch('/api/ai/mock-interview', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role, history: [...msgs, { role: 'user', text: userText }] }),
      })
      if (r.ok) {
        const j = await r.json() as { reply?: string }
        setMsgs((m) => [...m, { role: 'assistant', text: j.reply ?? '—' }])
      } else {
        setMsgs((m) => [...m, { role: 'assistant', text: 'Sorry, the mock interviewer is offline right now. Try refreshing — and remember to use the Q&A tab for prepared answers.' }])
      }
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        <button onClick={() => setTab('qa')}   className={'px-3 py-1.5 rounded ' + (tab === 'qa'   ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Q&amp;A ({questions.length})</button>
        <button onClick={() => setTab('mock')} className={'px-3 py-1.5 rounded ' + (tab === 'mock' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>AI Mock Interview</button>
        <button onClick={() => setTab('tips')} className={'px-3 py-1.5 rounded ' + (tab === 'tips' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Tips</button>
      </nav>

      {tab === 'qa' && (
        <>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button onClick={() => setCat('all')} className={'px-2.5 py-1 rounded-full border ' + (cat === 'all' ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white border-gray-200')}>All</button>
            {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={'px-2.5 py-1 rounded-full border ' + (cat === c ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white border-gray-200')}>{c}</button>)}
          </div>
          <ul className="space-y-2">
            {filtered.map((q, i) => (
              <li key={i} className="bg-white border border-gray-100 rounded-card shadow-card">
                <details>
                  <summary className="px-4 py-3 cursor-pointer flex items-start gap-2 hover:bg-cream">
                    <span className="text-[10px] uppercase tracking-wider text-kerala-700 font-bold w-16 flex-shrink-0 mt-0.5">{q.category}</span>
                    <span className="font-semibold text-ink text-sm flex-1">{q.q}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  </summary>
                  <div className="px-4 py-3 border-t border-gray-100 bg-cream/30">
                    <p className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-1">Model answer</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{q.a}</p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'mock' && (
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          {msgs.length === 0 ? (
            <div className="space-y-3 text-center">
              <Bot className="w-12 h-12 text-kerala-700 mx-auto" />
              <h2 className="font-serif text-xl text-ink">AI Mock Interview</h2>
              <p className="text-sm text-gray-700">5 questions · ~10 minutes · evaluation at the end</p>
              <div className="text-left max-w-md mx-auto">
                <label className="block text-xs font-medium text-gray-700 mb-1">Role type</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm">
                  <option>GCC Clinical</option>
                  <option>Kerala Hospital</option>
                  <option>Academic / Teaching</option>
                  <option>Telemedicine</option>
                  <option>Wellness Resort</option>
                </select>
              </div>
              <button onClick={startMock} className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold inline-flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Start mock interview</button>
            </div>
          ) : (
            <>
              <ul className="space-y-3 mb-3 max-h-[60vh] overflow-y-auto">
                {msgs.map((m, i) => (
                  <li key={i} className={'flex gap-2 ' + (m.role === 'user' ? 'justify-end' : '')}>
                    {m.role === 'assistant' && <span className="w-7 h-7 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center flex-shrink-0"><Bot className="w-4 h-4" /></span>}
                    <p className={'text-sm whitespace-pre-line max-w-[80%] rounded-card px-3 py-2 ' + (m.role === 'user' ? 'bg-kerala-700 text-white' : 'bg-cream border border-gray-100 text-gray-800')}>{m.text}</p>
                  </li>
                ))}
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2} placeholder="Type your answer…" className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" />
                <button disabled={busy || !input.trim()} className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </article>
      )}

      {tab === 'tips' && (
        <ul className="space-y-3">
          {tips.map((t) => (
            <li key={t.title} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <h3 className="font-serif text-lg text-ink inline-flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> {t.title}</h3>
              <p className="text-sm text-gray-800 mt-2">{t.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
