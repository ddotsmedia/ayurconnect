import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Sparkles } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'

type Tip = {
  id: string
  title: string
  content: string
  dosha: string   // vata | pitta | kapha | tridosha
  season: string | null
  language: string
  createdAt: string
}

const DOSHA_TONE: Record<string, { bg: string; chip: string; emoji: string; ring: string }> = {
  vata:     { bg: 'bg-blue-50',    chip: 'bg-blue-600 text-white',    emoji: '🌬️', ring: 'ring-blue-200'    },
  pitta:    { bg: 'bg-orange-50',  chip: 'bg-orange-600 text-white',  emoji: '🔥', ring: 'ring-orange-200'  },
  kapha:    { bg: 'bg-emerald-50', chip: 'bg-emerald-600 text-white', emoji: '🌊', ring: 'ring-emerald-200' },
  tridosha: { bg: 'bg-purple-50',  chip: 'bg-purple-600 text-white',  emoji: '☯️', ring: 'ring-purple-200'  },
}

const SEASONS = [
  { id: '',         label: 'All seasons' },
  { id: 'varsha',   label: 'Varsha — Monsoon (Jul-Aug)' },
  { id: 'sharad',   label: 'Sharad — Autumn (Sep-Oct)' },
  { id: 'hemanta',  label: 'Hemanta — Late autumn (Nov-Dec)' },
  { id: 'shishira', label: 'Shishira — Winter (Jan-Feb)' },
  { id: 'vasantha', label: 'Vasantha — Spring (Mar-Apr)' },
  { id: 'grishma',  label: 'Grishma — Summer (May-Jun)' },
]

const DOSHAS = [
  { id: '',         label: 'All doshas' },
  { id: 'vata',     label: 'Vata' },
  { id: 'pitta',    label: 'Pitta' },
  { id: 'kapha',    label: 'Kapha' },
  { id: 'tridosha', label: 'Tridosha (all body types)' },
]

type SP = { dosha?: string; season?: string }

async function fetchTips(params: SP): Promise<Tip[]> {
  try {
    const qs = new URLSearchParams()
    if (params.dosha)  qs.set('dosha',  params.dosha)
    if (params.season) qs.set('season', params.season)
    qs.set('limit', '50')
    const res = await fetch(`${API}/health-tips?${qs.toString()}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { tips: Tip[] }
    return data.tips ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Daily Ayurveda Health Tips — Dosha + Seasonal Guidance | AyurConnect',
  description: 'Bite-sized classical Ayurveda guidance: Dinacharya, Ritucharya, Vata/Pitta/Kapha balance, herb suggestions. Sourced from Charaka Samhita and Ashtanga Hridayam.',
  keywords: [
    ...AYURVEDA_KEYWORDS.concepts,
    ...AYURVEDA_KEYWORDS.conditions,
    ...AYURVEDA_KEYWORDS.brand,
  ],
}

export default async function HealthTipsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const tips = await fetchTips(sp)

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> Classical guidance, daily
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Daily Health Tips</h1>
          <p className="text-white/70 mt-3">
            Dinacharya (daily routine) and Ritucharya (seasonal protocols) from
            Charaka Samhita and Ashtanga Hridayam, distilled into bite-sized cards
            you can act on today.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        {/* filters */}
        <form action="/health-tips" className="bg-white rounded-card border border-gray-100 shadow-card p-4 mb-8 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Dosha</span>
            <select name="dosha" defaultValue={sp.dosha ?? ''} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              {DOSHAS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Season</span>
            <select name="season" defaultValue={sp.season ?? ''} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              {SEASONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <button type="submit" className="px-4 py-2 bg-kerala-600 text-white rounded-md text-sm font-semibold hover:bg-kerala-700">Filter</button>
        </form>

        <p className="text-sm text-muted mb-5">
          <strong className="text-ink">{tips.length}</strong> tips
          {sp.dosha  && <> · {sp.dosha}</>}
          {sp.season && <> · {sp.season}</>}
        </p>

        {tips.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <p className="text-muted">No tips match those filters.</p>
            <Link href="/health-tips" className="inline-block mt-3 text-kerala-700 underline text-sm">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map((t) => {
              const tone = DOSHA_TONE[t.dosha] ?? DOSHA_TONE.tridosha
              return (
                <article key={t.id} className={`${tone.bg} rounded-card p-6 border border-gray-100 hover:shadow-cardLg transition-shadow flex flex-col`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{tone.emoji}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>{t.dosha}</span>
                    {t.season && <span className="text-[10px] uppercase text-gray-500 tracking-wider ml-auto">{t.season}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-snug">{t.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed flex-1">{t.content}</p>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-12 p-6 rounded-card bg-cream border border-gray-100 max-w-2xl mx-auto text-center">
          <p className="text-lg font-serif text-kerala-700">Not sure of your Prakriti?</p>
          <p className="text-sm text-gray-700 mt-2">Take the AyurBot Dosha quiz to find out — then come back with the dosha filter.</p>
          <Link href="/ayurbot" className="inline-block mt-3 px-4 py-2 bg-gold-500 text-white rounded-md text-sm font-semibold hover:bg-gold-600">
            Try the AyurBot
          </Link>
        </div>
      </div>
    </>
  )
}
