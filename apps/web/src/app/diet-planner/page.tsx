'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Sparkles, ChevronRight, Sun, Snowflake, Cloud, Leaf, Loader2, AlertCircle } from 'lucide-react'

type Meal = { slot: string; name: string; description: string; principle?: string }
type Day  = { day: string; meals: Meal[] }
type Plan = {
  days: Day[]
  favor: string[]
  avoid: string[]
  principles: string[]
  drinks: string[]
  notes: string
}

const DOSHAS = [
  { value: 'vata',        label: 'Vata',         desc: 'Air & ether — light, dry, cold, quick' },
  { value: 'pitta',       label: 'Pitta',        desc: 'Fire & water — sharp, hot, intense' },
  { value: 'kapha',       label: 'Kapha',        desc: 'Earth & water — heavy, smooth, slow' },
  { value: 'vata-pitta',  label: 'Vata-Pitta',   desc: 'Quick AND sharp — restless intensity' },
  { value: 'pitta-kapha', label: 'Pitta-Kapha',  desc: 'Sharp AND steady — driven endurance' },
  { value: 'vata-kapha',  label: 'Vata-Kapha',   desc: 'Quick AND heavy — complex balance' },
  { value: 'tridoshic',   label: 'Tridoshic',    desc: 'All three balanced — rare equilibrium' },
] as const

const SEASONS = [
  { value: '',          label: 'Not specified', icon: Leaf },
  { value: 'vasanta',   label: 'Vasanta (Spring)', icon: Leaf },
  { value: 'grishma',   label: 'Grishma (Summer)', icon: Sun },
  { value: 'varsha',    label: 'Varsha (Monsoon)', icon: Cloud },
  { value: 'sharad',    label: 'Sharad (Autumn)',  icon: Leaf },
  { value: 'hemanta',   label: 'Hemanta (Winter)', icon: Snowflake },
  { value: 'shishira',  label: 'Shishira (Late winter)', icon: Snowflake },
] as const

const COMMON_CONDITIONS = ['stress', 'insomnia', 'acidity', 'constipation', 'weight gain', 'weight loss', 'low energy', 'joint pain', 'diabetes', 'PCOS', 'skin issues', 'thyroid'] as const

export default function DietPlannerPage() {
  const params = useSearchParams()
  const initialDosha = (DOSHAS.find((d) => d.value === params.get('dosha'))?.value ?? 'vata') as typeof DOSHAS[number]['value']

  const [form, setForm] = useState({
    dosha:      initialDosha as string,
    season:     '' as string,
    conditions: [] as string[],
    vegetarian: true,
    eggs:       false,
    dairy:      true,
    bodyType:   'normal' as 'underweight' | 'normal' | 'overweight',
    region:     '',
    allergies:  '',
  })

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    setForm((f) => ({ ...f, dosha: initialDosha }))
  }, [initialDosha])

  function toggleCondition(c: string) {
    setForm((f) => ({
      ...f,
      conditions: f.conditions.includes(c) ? f.conditions.filter((x) => x !== c) : [...f.conditions, c],
    }))
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null); setPlan(null)
    try {
      const res = await fetch('/api/diet-planner/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dosha: form.dosha,
          season: form.season || undefined,
          conditions: form.conditions,
          preferences: {
            vegetarian: form.vegetarian,
            eggs:       form.eggs,
            dairy:      form.dairy,
            bodyType:   form.bodyType,
            region:     form.region || undefined,
            allergies:  form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          },
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || j.reason || `request failed (${res.status})`)
      setPlan(j.plan)
      setCached(Boolean(j.cached))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <>
      <GradientHero variant="green" size={plan ? 'md' : 'lg'}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Sparkles className="w-3 h-3" /> AI Diet Engine
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Your <span className="text-gold-400">Ayurvedic</span> 7-day plan
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/80">
            Personalised meal plan tuned to your dosha, current season, and health goals. Generated
            by an Ayurveda-trained AI, grounded in classical dietary principles.
          </p>
        </div>
      </GradientHero>

      {!plan && (
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          <form onSubmit={generate} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-kerala-700 mb-2">Your dominant dosha</label>
              <p className="text-xs text-gray-500 mb-3">Don&apos;t know? <Link href="/prakriti-quiz" className="text-kerala-700 hover:underline font-semibold">Take the Prakriti quiz first</Link>.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {DOSHAS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm({ ...form, dosha: d.value })}
                    className={`text-left p-3 rounded-md border-2 transition-all ${form.dosha === d.value ? 'border-kerala-600 bg-kerala-50' : 'border-gray-200 hover:border-kerala-300'}`}
                  >
                    <div className="font-semibold text-gray-800">{d.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-kerala-700 mb-2">Current season (Ritu)</label>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                {SEASONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-kerala-700 mb-2">Conditions / focus areas <span className="text-xs text-gray-500 font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${form.conditions.includes(c) ? 'border-kerala-600 bg-kerala-50 text-kerala-700 font-semibold' : 'border-gray-200 text-gray-700 hover:border-kerala-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-kerala-700 mb-2">Dietary preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.vegetarian} onChange={(e) => setForm({ ...form, vegetarian: e.target.checked })} /> Vegetarian</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.eggs} onChange={(e) => setForm({ ...form, eggs: e.target.checked })} disabled={form.vegetarian} /> Eggs allowed</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.dairy} onChange={(e) => setForm({ ...form, dairy: e.target.checked })} /> Dairy allowed</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-kerala-700 mb-2">Body type</label>
                <div className="space-y-2">
                  {(['underweight', 'normal', 'overweight'] as const).map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm capitalize">
                      <input type="radio" name="bodyType" value={b} checked={form.bodyType === b} onChange={() => setForm({ ...form, bodyType: b })} />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Regional preference (optional)</label>
                <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Kerala, North Indian, Tamil…" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Allergies / foods to avoid</label>
                <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="comma-separated, e.g. peanut, mushroom" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-800 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="w-full py-3 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold flex items-center justify-center gap-2">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating your plan…</> : <>Generate my 7-day plan <ChevronRight className="w-4 h-4" /></>}
            </button>
            <p className="text-xs text-center text-gray-500">Free. Powered by an Ayurveda-trained AI. Always consult a CCIM-verified Vaidya before changing your diet for clinical conditions.</p>
          </form>
        </section>
      )}

      {plan && (
        <>
          {cached && (
            <section className="container mx-auto px-4 pt-4 max-w-5xl">
              <p className="text-xs text-center text-gray-500 italic">Served from cache — generated within the last 30 days for the same profile.</p>
            </section>
          )}

          <section className="container mx-auto px-4 py-12 max-w-5xl">
            {plan.notes && (
              <div className="p-5 rounded-card bg-kerala-50 border border-kerala-100 mb-8">
                <p className="text-sm text-gray-800 leading-relaxed italic">{plan.notes}</p>
              </div>
            )}

            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6">Your 7-day meal plan</h2>
            <div className="space-y-4">
              {plan.days.map((d) => (
                <details key={d.day} className="group bg-white rounded-card border border-gray-100 shadow-card overflow-hidden" open={d === plan.days[0]}>
                  <summary className="cursor-pointer list-none p-5 bg-gradient-to-r from-kerala-50 to-white flex items-center justify-between">
                    <h3 className="font-serif text-xl text-kerala-700">{d.day}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 grid md:grid-cols-2 gap-3">
                    {d.meals.map((m, i) => (
                      <div key={i} className="p-4 rounded-md border border-gray-100">
                        <div className="text-[11px] uppercase tracking-wider text-gold-600 font-semibold">{m.slot}</div>
                        <h4 className="font-semibold text-gray-800 mt-1">{m.name}</h4>
                        <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{m.description}</p>
                        {m.principle && <p className="text-xs text-kerala-700 italic mt-2 border-t border-gray-100 pt-2">{m.principle}</p>}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-10">
              <div className="p-5 bg-white rounded-card border border-kerala-100 shadow-card">
                <h3 className="font-serif text-lg text-kerala-700 mb-3">Favour</h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {plan.favor.map((f, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-kerala-600 mt-0.5 flex-shrink-0" />{f}</li>)}
                </ul>
              </div>
              <div className="p-5 bg-white rounded-card border border-rose-100 shadow-card">
                <h3 className="font-serif text-lg text-rose-800 mb-3">Avoid / Minimise</h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {plan.avoid.map((f, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-rose-600 mt-0.5 flex-shrink-0" />{f}</li>)}
                </ul>
              </div>
              {plan.principles.length > 0 && (
                <div className="p-5 bg-white rounded-card border border-gray-100 shadow-card md:col-span-2">
                  <h3 className="font-serif text-lg text-kerala-700 mb-3">Core principles</h3>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {plan.principles.map((p, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-gold-600 mt-0.5 flex-shrink-0" />{p}</li>)}
                  </ul>
                </div>
              )}
              {plan.drinks.length > 0 && (
                <div className="p-5 bg-white rounded-card border border-amber-100 shadow-card md:col-span-2">
                  <h3 className="font-serif text-lg text-amber-700 mb-3">Recommended drinks</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.drinks.map((d, i) => <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-sm text-gray-700">{d}</span>)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button onClick={() => setPlan(null)} className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
                Generate another
              </button>
              <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
                Consult a Vaidya <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          <section className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Note:</strong> AI-generated guidance for healthy adults. If you have diabetes,
                chronic kidney disease, food allergies, are pregnant or breastfeeding, or take regular
                medication, consult a CCIM-verified Vaidya or registered dietitian before following this
                plan. This tool is educational, not clinical.
              </p>
            </div>
          </section>
        </>
      )}
    </>
  )
}
