'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import { Sparkles, Video, MapPin, Loader2, ChevronRight, Stethoscope, Languages } from 'lucide-react'

type Match = { doctor: DoctorCardData; score: number; reasons: string[] }
type Result = { matches: Match[] }

const CONCERN_OPTIONS = [
  { id: 'stress',       label: 'Stress / anxiety' },
  { id: 'sleep',        label: 'Sleep disorders' },
  { id: 'diabetes',     label: 'Diabetes / metabolic' },
  { id: 'hypertension', label: 'BP / hypertension' },
  { id: 'pcos',         label: 'PCOS / fertility' },
  { id: 'menopause',    label: 'Menopause' },
  { id: 'pediatric',    label: 'Child health' },
  { id: 'skin',         label: 'Skin / hair' },
  { id: 'joint',        label: 'Joint pain / arthritis' },
  { id: 'back',         label: 'Back pain / sciatica' },
  { id: 'digestion',    label: 'Digestion / gut' },
  { id: 'migraine',     label: 'Migraine / headache' },
  { id: 'weight',       label: 'Weight management' },
  { id: 'panchakarma',  label: 'Panchakarma planning' },
  { id: 'respiratory',  label: 'Respiratory / asthma' },
]

const LANGUAGES = ['Malayalam', 'English', 'Hindi', 'Tamil', 'Kannada', 'Arabic']

export default function DoctorMatchPage() {
  const [step, setStep] = useState<'quiz' | 'loading' | 'results'>('quiz')
  const [concerns, setConcerns] = useState<string[]>([])
  const [language, setLanguage] = useState<string>('')
  const [country, setCountry] = useState<string>('IN')
  const [mode, setMode] = useState<'video' | 'audio' | 'in-person'>('video')
  const [dosha, setDosha] = useState<string>('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  function toggleConcern(id: string) {
    setConcerns((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id])
  }

  async function submit() {
    if (concerns.length === 0) { setError('Pick at least one concern'); return }
    setStep('loading'); setError(null)
    try {
      const res = await fetch('/api/doctor-match', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ concerns, language: language || undefined, country: country || undefined, mode, dosha: dosha || undefined }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as Result
      setResult(data)
      setStep('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStep('quiz')
    }
  }

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> AI Doctor Match
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Find your perfect Ayurveda doctor</h1>
          <p className="mt-4 text-white/80">
            Tell us what you&apos;re facing — we&apos;ll rank the right CCIM-verified specialists by specialty, language, and availability.
            Takes 30 seconds, free, no signup.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {step === 'quiz' && (
          <div className="bg-white border border-gray-100 rounded-card shadow-card p-6 space-y-6">
            <section>
              <h2 className="font-serif text-xl text-ink mb-3">1. What are you facing? <span className="text-xs text-gray-400 font-sans font-normal">(pick all that apply)</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CONCERN_OPTIONS.map((c) => {
                  const on = concerns.includes(c.id)
                  return (
                    <button
                      key={c.id} type="button" onClick={() => toggleConcern(c.id)}
                      className={
                        'px-3 py-2 rounded-md text-sm border text-left transition-colors ' +
                        (on ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
                      }
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl text-ink mb-3">2. Preferred consultation mode</h2>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'audio', 'in-person'] as const).map((m) => (
                  <button
                    key={m} type="button" onClick={() => setMode(m)}
                    className={
                      'px-3 py-2 rounded-md text-sm border capitalize ' +
                      (mode === m ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
                    }
                  >
                    {m === 'video' && <Video className="w-3.5 h-3.5 inline mr-1" />}
                    {m === 'in-person' && <MapPin className="w-3.5 h-3.5 inline mr-1" />}
                    {m}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">3. Preferred language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">— any language</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">4. Your country</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="IN">India</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="QA">Qatar</option>
                  <option value="KW">Kuwait</option>
                  <option value="OM">Oman</option>
                  <option value="BH">Bahrain</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">5. Your dosha <span className="text-xs text-gray-400">(if you know it)</span></span>
                <select value={dosha} onChange={(e) => setDosha(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">— I don&apos;t know</option>
                  <option value="vata">Vata</option>
                  <option value="pitta">Pitta</option>
                  <option value="kapha">Kapha</option>
                </select>
              </label>
            </section>

            <p className="text-[11px] text-gray-400">
              Not sure of your dosha? <Link href="/prakriti-quiz" className="text-kerala-700 hover:underline">Take the 2-minute Prakriti quiz first</Link>.
            </p>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm" role="alert">{error}</div>
            )}

            <button
              type="button" onClick={submit}
              disabled={concerns.length === 0}
              className="w-full px-5 py-3 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Find my doctors
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-kerala-700 mx-auto animate-spin" />
            <p className="text-muted mt-4">Matching against {/* count populated server-side */} CCIM-verified doctors…</p>
          </div>
        )}

        {step === 'results' && result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-serif text-2xl text-kerala-700">
                  {result.matches.length} doctor{result.matches.length === 1 ? '' : 's'} matched
                </h2>
                <p className="text-sm text-muted mt-1">Ranked by specialty fit, language match, and CCIM verification.</p>
              </div>
              <button onClick={() => setStep('quiz')} className="text-sm text-kerala-700 hover:underline">← Refine search</button>
            </div>

            <div className="space-y-4">
              {result.matches.map((m, idx) => (
                <div key={m.doctor.id} className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold-100 text-gold-900 rounded-full font-bold">
                      #{idx + 1} match · score {m.score}
                    </span>
                    {m.doctor.ccimVerified && <span className="text-[10px] text-kerala-700">✓ CCIM</span>}
                  </div>
                  <DoctorCard doctor={m.doctor} />
                  {m.reasons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Why this match</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.reasons.map((r) => (
                          <span key={r} className="text-[11px] px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.matches.length === 0 && (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted">No doctors matched. Try widening your criteria or browse the full directory.</p>
                <Link href="/doctors" className="mt-4 inline-flex items-center gap-1 text-sm text-kerala-700 font-semibold hover:underline">
                  Browse all doctors <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
