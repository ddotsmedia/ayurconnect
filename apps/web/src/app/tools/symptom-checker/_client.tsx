'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, AlertCircle, Stethoscope } from 'lucide-react'

// Curated symptom→condition mapping. Keyword-overlap scoring; data sourced
// from the existing conditions.ts entries. Output is a ranked list with
// strong "consult a doctor" CTAs.

type Cond = { slug: string; name: string; keywords: string[]; dosha: string }

const CONDS: Cond[] = [
  { slug: 'pcos',          name: 'PCOS / PCOD',                       dosha: 'Kapha-Vata', keywords: ['irregular periods','acne','weight gain','hair growth face','infertility','thick neck'] },
  { slug: 'diabetes',      name: 'Diabetes / Prameha',                dosha: 'Kapha-Pitta',keywords: ['frequent urination','thirst','weight loss','fatigue','blurred vision','slow wound healing','tingling feet'] },
  { slug: 'arthritis',     name: 'Arthritis / Sandhi Vata',           dosha: 'Vata',       keywords: ['joint pain','stiffness','swelling','knee pain','morning stiffness','reduced movement'] },
  { slug: 'weight-loss',   name: 'Weight Loss / Obesity (Sthaulya)',  dosha: 'Kapha',      keywords: ['weight gain','snoring','heavy body','lethargy','low energy','breathlessness'] },
  { slug: 'thyroid',       name: 'Thyroid (Galaganda)',               dosha: 'Kapha-Pitta',keywords: ['weight gain','weight loss','heat intolerance','cold intolerance','neck swelling','hair fall','palpitations','fatigue'] },
  { slug: 'hair-fall',     name: 'Hair Fall (Khalitya)',              dosha: 'Pitta-Vata', keywords: ['hair fall','thinning hair','bald patches','itchy scalp','dandruff','premature greying'] },
  { slug: 'back-pain',     name: 'Back Pain (Kati Shoola)',           dosha: 'Vata',       keywords: ['back pain','low back pain','stiffness','sciatica','leg pain','disc'] },
  { slug: 'anxiety',       name: 'Anxiety / Stress',                  dosha: 'Vata-Pitta', keywords: ['anxiety','worry','panic','restlessness','racing heart','overthinking','stress'] },
  { slug: 'insomnia',      name: 'Insomnia (Anidra)',                 dosha: 'Vata',       keywords: ['insomnia','difficulty sleeping','waking at night','early waking','poor sleep','daytime fatigue'] },
  { slug: 'skin-diseases', name: 'Skin Disease (Twak Roga)',          dosha: 'Pitta-Rakta',keywords: ['rash','eczema','dermatitis','itching','allergic skin','flaking','redness'] },
  { slug: 'fatty-liver',   name: 'Fatty Liver (NAFLD)',               dosha: 'Kapha',      keywords: ['fatty liver','high SGPT','elevated liver enzymes','abdomen heaviness','indigestion','metabolic syndrome'] },
  { slug: 'migraine',      name: 'Migraine (Ardhavabhedaka)',         dosha: 'Pitta-Vata', keywords: ['migraine','one-sided headache','throbbing','aura','nausea with headache','light sensitivity'] },
  { slug: 'infertility',   name: 'Infertility (Vandhyatva)',          dosha: 'Vata-Pitta', keywords: ['infertility','difficulty conceiving','low sperm count','irregular ovulation','tubal block'] },
  { slug: 'asthma',        name: 'Asthma (Tamaka Shwasa)',            dosha: 'Kapha-Vata', keywords: ['wheezing','shortness of breath','chest tightness','cough at night','recurring bronchitis'] },
  { slug: 'psoriasis',     name: 'Psoriasis (Eka Kushta)',            dosha: 'Pitta-Vata', keywords: ['silver scales','plaques','elbow rash','knee rash','scalp psoriasis','recurring rash'] },
  { slug: 'ibs',           name: 'IBS / Grahani',                     dosha: 'Vata-Pitta', keywords: ['bloating','alternating diarrhoea constipation','abdominal pain','gas','indigestion'] },
]

const ALL_SYMPTOMS = Array.from(new Set(CONDS.flatMap((c) => c.keywords))).sort()

export function SymptomClient() {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [q,      setQ]      = useState('')

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase()
    if (!qx) return ALL_SYMPTOMS
    return ALL_SYMPTOMS.filter((s) => s.toLowerCase().includes(qx))
  }, [q])

  const ranked = useMemo(() => {
    if (picked.size === 0) return []
    return CONDS
      .map((c) => ({ c, score: c.keywords.filter((k) => picked.has(k)).length }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [picked])

  function toggle(s: string) {
    const next = new Set(picked)
    next.has(s) ? next.delete(s) : next.add(s)
    setPicked(next)
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-lg text-ink mb-3">Pick your symptoms</h2>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search symptoms (joint pain, hair fall, anxiety…)"
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
        />
        <ul className="flex flex-wrap gap-1.5">
          {filtered.map((s) => (
            <li key={s}>
              <button
                onClick={() => toggle(s)}
                className={'inline-flex items-center px-2.5 py-1 rounded-full text-xs border ' + (picked.has(s) ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
        {picked.size > 0 && (
          <p className="mt-4 text-xs text-gray-500">{picked.size} symptom{picked.size === 1 ? '' : 's'} selected · <button onClick={() => setPicked(new Set())} className="text-kerala-700 hover:underline">clear</button></p>
        )}
      </section>

      {ranked.length > 0 && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="font-serif text-xl text-ink">Possible matches</h2>
          {ranked.map(({ c, score }) => (
            <article key={c.slug} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-serif text-base text-ink">{c.name}</h3>
                  <p className="text-[11px] text-gray-500">Dosha: {c.dosha} · {score} symptom{score === 1 ? '' : 's'} matched</p>
                </div>
                <Link href={`/conditions/${c.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-kerala-700 hover:underline">
                  Learn more <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
          <article className="bg-cream border border-gray-100 rounded-card p-5 text-center">
            <Stethoscope className="w-8 h-8 text-kerala-700 mx-auto mb-2" />
            <p className="text-sm text-gray-800 font-semibold">These are suggestions, not a diagnosis.</p>
            <p className="text-xs text-gray-700 mt-1">Book a consultation with a verified Kerala-trained BAMS / MD-Ayurveda doctor for accurate diagnosis.</p>
            <Link href="/online-consultation" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
              Book consultation <ChevronRight className="w-4 h-4" />
            </Link>
          </article>
        </section>
      )}

      {picked.size === 0 && (
        <p className="text-sm text-muted text-center inline-flex items-center justify-center gap-1.5 w-full">
          <AlertCircle className="w-4 h-4" /> Pick at least one symptom to see possible matches.
        </p>
      )}
    </div>
  )
}
