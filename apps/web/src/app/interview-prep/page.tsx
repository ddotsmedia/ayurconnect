'use client'

import { useState } from 'react'
import { GraduationCap, Loader2, Sparkles, Eye, EyeOff, ChevronDown } from 'lucide-react'

type PrepQ = { id: number; category: 'clinical' | 'policy' | 'behavioral'; question: string; modelAnswer: string }
type PrepResponse = { questions: PrepQ[]; tips: string[]; provider?: string }

const CATEGORY_TONE: Record<PrepQ['category'], { label: string; bg: string; text: string }> = {
  clinical:    { label: 'Clinical',           bg: 'bg-emerald-50', text: 'text-emerald-800' },
  policy:      { label: 'Kerala policy',      bg: 'bg-amber-50',   text: 'text-amber-800'   },
  behavioral:  { label: 'Situational',        bg: 'bg-purple-50',  text: 'text-purple-800'  },
}

export default function InterviewPrepPage() {
  const [jobTitle,       setJobTitle]       = useState('')
  const [organization,   setOrganization]   = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [busy,           setBusy]           = useState(false)
  const [err,            setErr]            = useState<string | null>(null)
  const [data,           setData]           = useState<PrepResponse | null>(null)
  const [practiceMode,   setPracticeMode]   = useState(false)
  const [revealed,       setRevealed]       = useState<Set<number>>(new Set())

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null); setData(null); setRevealed(new Set())
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobTitle, organization, jobDescription }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setData(json as PrepResponse)
      // Practice mode: hide all answers initially
      if (practiceMode) setRevealed(new Set())
      else setRevealed(new Set((json as PrepResponse).questions.map((q) => q.id)))
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  function toggleAnswer(id: number) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleAllAnswers() {
    if (!data) return
    if (revealed.size === data.questions.length) setRevealed(new Set())
    else setRevealed(new Set(data.questions.map((q) => q.id)))
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-700">
            <GraduationCap className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-kerala-700 mt-3">Interview prep — Kerala AYUSH jobs</h1>
          <p className="text-sm text-muted mt-1 max-w-xl mx-auto">
            AI-generated interview questions + model answers tailored to Kerala PSC, NHM, AYUSH Mission, and govt-college recruitment.
          </p>
        </header>

        <form onSubmit={generate} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Role / job title *</span>
            <input
              required
              minLength={4}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Medical Officer (Ayurveda) — Kerala PSC"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-700"
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Organisation (optional)</span>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. NHM Kerala"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-end">
              <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={practiceMode}
                  onChange={(e) => setPracticeMode(e.target.checked)}
                />
                Practice mode (hide answers initially)
              </span>
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Paste job description (optional, improves quality)</span>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={3}
              placeholder="Paste the official notification text…"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </label>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={busy || jobTitle.length < 4}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-md font-semibold hover:bg-purple-800 disabled:opacity-50 text-sm"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate interview prep
          </button>
        </form>

        {data && (
          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-serif text-2xl text-kerala-700">{data.questions.length} questions</h2>
              <button
                onClick={toggleAllAnswers}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md bg-white hover:bg-gray-50"
              >
                {revealed.size === data.questions.length
                  ? <><EyeOff className="w-3.5 h-3.5" /> Hide all answers</>
                  : <><Eye className="w-3.5 h-3.5" /> Reveal all answers</>}
              </button>
            </div>

            {data.questions.map((q) => {
              const tone = CATEGORY_TONE[q.category] ?? CATEGORY_TONE.clinical
              const isOpen = revealed.has(q.id)
              return (
                <article key={q.id} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${tone.bg} ${tone.text} flex-shrink-0`}>
                      {tone.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 leading-snug">{q.question}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAnswer(q.id)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-kerala-700 hover:underline"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    {isOpen ? 'Hide model answer' : 'Show model answer'}
                  </button>
                  {isOpen && (
                    <div className="mt-3 p-3 rounded-md bg-kerala-50 border border-kerala-100">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{q.modelAnswer}</p>
                    </div>
                  )}
                </article>
              )
            })}

            {data.tips.length > 0 && (
              <article className="bg-amber-50 border border-amber-200 rounded-card p-5">
                <h3 className="font-semibold text-amber-900 mb-2">Kerala PSC interview tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                  {data.tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </article>
            )}

            {data.provider && (
              <p className="text-[11px] text-muted text-center">Generated by {data.provider} · review with a senior practitioner before relying on it</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
