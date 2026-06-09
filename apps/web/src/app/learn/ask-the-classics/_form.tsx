'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookOpen, Sparkles, AlertCircle } from 'lucide-react'

type Citation = {
  id: string
  source: string
  chapter: string
  verse: string
  textSa: string | null
  iast: string | null
  translation: string
}
type AskRes = {
  answer: string
  weakRetrieval: boolean
  citations: Citation[]
  provider?: string | null
}

export function AskTheClassicsForm() {
  const [q, setQ] = useState('')
  const [examples, setExamples] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<AskRes | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/classics/examples')
      .then((r) => r.json())
      .then((d: { examples?: string[] }) => setExamples(d.examples ?? []))
      .catch(() => {})
  }, [])

  async function ask(question: string) {
    const text = question.trim()
    if (text.length < 4) { setErr('Please enter a fuller question.'); return }
    setBusy(true); setErr(null); setRes(null)
    try {
      const r = await fetch('/api/classics/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      if (!r.ok) {
        if (r.status === 429) throw new Error('Too many questions — try again in a few minutes.')
        throw new Error(`HTTP ${r.status}`)
      }
      setRes(await r.json())
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); void ask(q) }}
        className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card"
      >
        <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 block">
          Ask the classical texts
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. What is the Ayurvedic definition of health?"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kerala-300"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 bg-kerala-700 text-white font-semibold px-5 py-3 rounded-xl hover:bg-kerala-800 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Ask
          </button>
        </div>
        {examples.length > 0 && !res && (
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setQ(ex); void ask(ex) }}
                className="text-xs rounded-full border border-kerala-200 text-kerala-700 px-3 py-1 hover:bg-kerala-50"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </form>

      {err && (
        <p className="mt-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {err}
        </p>
      )}

      {res && (
        <div className="mt-6 space-y-5">
          {res.weakRetrieval && (
            <p className="rounded-xl bg-gold-50 border border-gold-200 text-gold-900 text-sm px-4 py-3">
              The classical corpus available here only partly covers this question — treat the answer
              as indicative and consult a verified doctor.
            </p>
          )}
          <div className="rounded-2xl bg-kerala-50 p-5">
            <p className="text-xs uppercase tracking-wide text-kerala-600 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Answer (grounded in the cited verses)
            </p>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">{res.answer}</div>
          </div>

          {res.citations.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Cited verses
              </p>
              <div className="space-y-3">
                {res.citations.map((c) => (
                  <div key={c.id} className="rounded-xl border border-kerala-100 bg-white p-4">
                    <p className="font-semibold text-kerala-800">
                      {c.source} — {c.chapter} {c.verse}
                    </p>
                    {c.textSa && <p className="font-serif text-lg text-gold-700 mt-1">{c.textSa}</p>}
                    {c.iast && <p className="text-sm italic text-gray-500">{c.iast}</p>}
                    <p className="text-gray-700 mt-1">{c.translation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Based on classical texts; consult a doctor for personal advice.
          </p>
        </div>
      )}
    </div>
  )
}
