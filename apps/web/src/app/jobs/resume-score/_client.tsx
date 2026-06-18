'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

type Section = { name: string; score: number; feedback: string }
type ScoreResult = {
  overallScore: number
  sections: Section[]
  strengths: string[]
  improvements: string[]
  missingKeywords: string[]
  atsCompatibility: number
}

export function ScoreClient() {
  const [resume, setResume] = useState('')
  const [jobContext, setJobContext] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function score() {
    if (resume.trim().length < 200) { setErr('Paste at least 200 characters of resume text.'); return }
    setBusy(true); setErr(null); setResult(null)
    try {
      const r = await fetch('/api/ai/resume-score', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resume, jobContext }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const j = await r.json() as ScoreResult
      setResult(j)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }

  if (result) {
    const color = result.overallScore >= 70 ? 'text-emerald-700' : result.overallScore >= 50 ? 'text-amber-600' : 'text-rose-600'
    const ring  = result.overallScore >= 70 ? 'stroke-emerald-600' : result.overallScore >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'
    return (
      <div className="space-y-5">
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Overall score</p>
          <div className="relative inline-block mt-2">
            <svg width="140" height="140" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-gray-200" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="42" className={ring} strokeWidth="6" fill="none" strokeDasharray={`${(result.overallScore / 100) * 264} 264`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className={'absolute inset-0 flex flex-col items-center justify-center ' + color}>
              <p className="text-4xl font-bold">{result.overallScore}</p>
              <p className="text-[10px]">/100</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">ATS Compatibility: <strong>{result.atsCompatibility}/100</strong></p>
        </article>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink mb-3">Section breakdown</h2>
          <ul className="space-y-3">
            {result.sections.map((s) => (
              <li key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-ink">{s.name}</span>
                  <span className={'text-sm font-bold ' + (s.score >= 70 ? 'text-emerald-700' : s.score >= 50 ? 'text-amber-600' : 'text-rose-600')}>{s.score}/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={'h-full ' + (s.score >= 70 ? 'bg-emerald-500' : s.score >= 50 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${s.score}%` }} /></div>
                <p className="text-xs text-gray-700 mt-1">{s.feedback}</p>
              </li>
            ))}
          </ul>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <article className="bg-emerald-50 border border-emerald-200 rounded-card p-4">
            <h3 className="font-serif text-base text-emerald-900 mb-2">Strengths</h3>
            <ul className="space-y-1.5 text-sm text-gray-800">{result.strengths.map((s, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" /> <span>{s}</span></li>)}</ul>
          </article>
          <article className="bg-amber-50 border border-amber-200 rounded-card p-4">
            <h3 className="font-serif text-base text-amber-900 mb-2">Improvements</h3>
            <ul className="space-y-1.5 text-sm text-gray-800">{result.improvements.map((s, i) => <li key={i} className="flex items-start gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" /> <span>{s}</span></li>)}</ul>
          </article>
        </div>

        {result.missingKeywords.length > 0 && jobContext && (
          <article className="bg-rose-50 border border-rose-200 rounded-card p-4">
            <h3 className="font-serif text-base text-rose-900 mb-2">Missing keywords (from job)</h3>
            <div className="flex flex-wrap gap-1.5">{result.missingKeywords.map((k) => <span key={k} className="text-xs px-2 py-0.5 bg-white border border-rose-200 text-rose-800 rounded-full">{k}</span>)}</div>
          </article>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/jobs/resume-builder" className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">Improve with AI Resume Builder <ArrowRight className="w-3.5 h-3.5" /></Link>
          <button onClick={() => setResult(null)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded text-sm">Score another resume</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Paste your resume text *</span>
          <textarea rows={10} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Copy + paste your resume content here. Include your name, education, experience, skills, certifications…" className="w-full border border-gray-200 rounded p-3 text-sm font-mono" />
          <span className="block text-[10px] text-gray-500 mt-1">{resume.length} characters · 200+ required</span>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Optional — paste a job description to compare against</span>
          <textarea rows={4} value={jobContext} onChange={(e) => setJobContext(e.target.value)} placeholder="Optional: paste job description to get keyword gap analysis" className="w-full border border-gray-200 rounded p-3 text-sm" />
        </label>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <button onClick={score} disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {busy ? 'Analyzing…' : 'Score my resume'}
        </button>
      </article>
      <p className="text-xs text-gray-500 text-center">Powered by AI · 100% free · No data stored after scoring</p>
    </div>
  )
}
