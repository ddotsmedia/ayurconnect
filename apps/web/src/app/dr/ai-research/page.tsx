'use client'

// AI Research Assistant — the most differentiated feature in the hub.
// Posts to /api/dr/ai-research with a clinical question, gets back a
// cited summary + the candidate papers used as RAG context.

import { useState } from 'react'
import Link from 'next/link'
import { Bot, Send, Loader2, BookOpen, AlertCircle, Sparkles } from 'lucide-react'

type Candidate = { index: number; id: string; title: string; authors: string[]; journal: string; year: number; doi: string | null; url: string | null }
type Response = { response: string; candidates: Candidate[]; provider: string }

const EXAMPLES = [
  'RCTs on Ashwagandha for generalized anxiety, 2018 onwards',
  'Systematic reviews on Triphala for constipation',
  'What does the evidence say about Mahanarayan Taila for knee osteoarthritis vs diclofenac gel?',
  'Studies on Shatavari for PCOS — efficacy and safety',
  'Curcumin drug interactions with tamoxifen',
]

export default function AiResearchPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<Response | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function ask(q?: string) {
    const text = (q ?? question).trim()
    if (text.length < 10) { setError('Please ask a more specific question.'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/dr/ai-research', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: text }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as Response
      setResult(data)
      if (q) setQuestion(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Bot className="w-7 h-7" /> AI Research Assistant</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Ask any Ayurveda research question — get a cited summary from our curated paper library.
          Strictly grounded in real papers; refuses to fabricate citations. Rate limit: 30/day.
        </p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); void ask() }} className="bg-white border border-gray-100 rounded-card p-4 space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="e.g. RCTs on Yogaraj Guggulu for rheumatoid arthritis when used as adjunct to methotrexate"
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
        />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[10px] text-gray-400">Powered by curated paper RAG. Only cites from our verified library; flags gaps.</p>
          <button
            type="submit" disabled={loading || question.trim().length < 10}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded-md text-sm font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Ask
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm inline-flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {!result && !loading && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Try one
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex} type="button" onClick={() => void ask(ex)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-kerala-300 hover:bg-kerala-50"
              >{ex}</button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3 inline-flex items-center gap-1.5">
              <Bot className="w-3 h-3" /> Response · grounded in {result.candidates.length} paper{result.candidates.length === 1 ? '' : 's'} · {result.provider}
            </p>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{result.response}</div>
          </article>

          {result.candidates.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 inline-flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Cited papers ({result.candidates.length})
              </h2>
              <ol className="space-y-2">
                {result.candidates.map((c) => (
                  <li key={c.id} className="bg-white border border-gray-100 rounded-card p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-gray-400 mt-0.5">[{c.index}]</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/dr/research/${c.id}`} className="font-semibold text-ink hover:text-kerala-700">{c.title}</Link>
                        <p className="text-xs text-muted mt-1">
                          {c.authors.slice(0, 3).join(', ')}{c.authors.length > 3 ? ' et al.' : ''} · {c.journal} · {c.year}
                          {c.doi && <> · DOI: <a href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer" className="text-kerala-700 hover:underline">{c.doi}</a></>}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="text-center">
            <button onClick={() => { setResult(null); setQuestion('') }} className="text-xs text-kerala-700 hover:underline">
              ← Ask another question
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 max-w-2xl">
        This assistant is for research discovery, not patient-specific advice. Always cross-check primary sources before clinical decisions. The curated library is currently ~50 papers; PubMed sync is planned.
      </p>
    </div>
  )
}
