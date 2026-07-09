import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Sparkles, Wind, Flame, Droplets, BookOpen, ChevronRight, ArrowRight, Compass } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

export const metadata: Metadata = pageMetadata({
  path:        '/learn/tridosha',
  title:       'Tridosha in Ayurveda — ത്രിദോഷം',
  description: 'Complete Tridosha resource — Vata, Pitta, Kapha. 7 in-depth articles in Malayalam + English, with classical shlokas from Ashtanga Hridayam + Charaka Samhita. Kerala-tradition therapies for each dosha.',
  keywords:    ['tridosha', 'vata pitta kapha', 'ayurveda doshas', 'ത്രിദോഷം', 'വാത പിത്ത കഫ', 'kerala ayurveda doshas', 'ashtanga hridayam', 'charaka samhita'],
})

const ARTICLES = [
  { n: 1, mlId: 'td-ml-01', enId: 'td-en-01', ml: 'ത്രിദോഷ സിദ്ധാന്തം — ആയുർവേദത്തിന്റെ അടിസ്ഥാനം', en: 'Tridosha Theory — The Foundation of Ayurveda', icon: BookOpen },
  { n: 2, mlId: 'td-ml-02', enId: 'td-en-02', ml: 'വാത ദോഷം — ചലനത്തിന്റെയും ഊർജ്ജത്തിന്റെയും ശക്തി', en: 'Vata Dosha — The Force of Movement and Energy', icon: Wind },
  { n: 3, mlId: 'td-ml-03', enId: 'td-en-03', ml: 'പിത്ത ദോഷം — ദഹനത്തിന്റെയും രൂപാന്തരത്തിന്റെയും ശക്തി', en: 'Pitta Dosha — The Force of Digestion and Transformation', icon: Flame },
  { n: 4, mlId: 'td-ml-04', enId: 'td-en-04', ml: 'കഫ ദോഷം — സ്ഥിരതയുടെയും ബലത്തിന്റെയും ശക്തി', en: 'Kapha Dosha — The Force of Stability and Strength', icon: Droplets },
  { n: 5, mlId: 'td-ml-05', enId: 'td-en-05', ml: 'പ്രകൃതി — നിങ്ങളുടെ ജന്മസിദ്ധമായ ശരീര ഘടന', en: 'Prakriti — Your Inborn Constitution', icon: Compass },
  { n: 6, mlId: 'td-ml-06', enId: 'td-en-06', ml: 'ഋതുചര്യ — ദോഷങ്ങളും കാലാവസ്ഥയും', en: 'Ritucharya — Doshas and Seasons', icon: Sparkles },
  { n: 7, mlId: 'td-ml-07', enId: 'td-en-07', ml: 'ദോഷ സന്തുലനത്തിനുള്ള കേരള ചികിത്സകൾ', en: 'Kerala Treatments for Dosha Balance', icon: Sparkles },
]

const DOSHAS = [
  { name: 'Vata',  ml: 'വാത',  sanskrit: 'वात',  icon: Wind,     tone: 'sky',     elements: 'Akasha + Vayu (Space + Air)',   qualities: 'Dry · Light · Cold · Rough · Subtle · Mobile', sites: 'Colon, joints, ears, bones, nervous system', govern: 'Movement, nerve impulse, breath, elimination', diseases: '80 types' },
  { name: 'Pitta', ml: 'പിത്ത', sanskrit: 'पित्त', icon: Flame,    tone: 'orange',  elements: 'Agni + Apas (Fire + Water)',     qualities: 'Hot · Sharp · Light · Liquid · Pungent smell', sites: 'Small intestine, liver, blood, eyes, skin',       govern: 'Digestion, transformation, vision, intellect',    diseases: '40 types' },
  { name: 'Kapha', ml: 'കഫ',   sanskrit: 'कफ',   icon: Droplets, tone: 'emerald', elements: 'Apas + Prithvi (Water + Earth)', qualities: 'Heavy · Slow · Cool · Oily · Smooth · Stable', sites: 'Chest, lungs, stomach, joints, brain (cerebrospinal)', govern: 'Structure, lubrication, immunity, stability', diseases: '28 types' },
]

const TONE: Record<string, { ring: string; bg: string; text: string; chip: string }> = {
  sky:     { ring: 'border-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-900',     chip: 'bg-sky-100 text-sky-800' },
  orange:  { ring: 'border-orange-200',  bg: 'bg-orange-50',  text: 'text-orange-900',  chip: 'bg-orange-100 text-orange-800' },
  emerald: { ring: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-900', chip: 'bg-emerald-100 text-emerald-800' },
}

export default function TridoshaHub() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',     url: '/' },
    { name: 'Learn',    url: '/learn/ask-the-classics' },
    { name: 'Tridosha', url: '/learn/tridosha' },
  ]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> Tridosha · ത്രിദോഷം
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">ത്രിദോഷം — Tridosha</h1>
          <p className="font-serif text-white/85 text-xl mt-2">The Foundation of Ayurveda</p>
          <p className="text-white/85 mt-5 max-w-2xl mx-auto">
            Seven in-depth articles tracing the Tridosha framework — Vata, Pitta, Kapha — from the classical shlokas of <em>Ashtanga Hridayam</em> + <em>Charaka Samhita</em> to its modern Kerala therapeutic applications. Bilingual: <strong>മലയാളം primary</strong>, English companion.
          </p>
        </div>
      </GradientHero>

      {/* Visual diagram */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">The three doshas at a glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOSHAS.map((d) => {
            const t = TONE[d.tone]!
            return (
              <article key={d.name} className={`border ${t.ring} ${t.bg} rounded-card p-5 shadow-card`}>
                <header className="flex items-center justify-between mb-3">
                  <d.icon className={`w-7 h-7 ${t.text}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${t.chip}`}>{d.diseases}</span>
                </header>
                <h3 className={`font-serif text-2xl ${t.text}`}>{d.name}</h3>
                <p className={`font-serif text-base ${t.text} opacity-80`}>{d.ml} <span className="text-xs opacity-60 ml-1">({d.sanskrit})</span></p>
                <dl className="mt-4 space-y-1.5 text-xs">
                  <div><dt className={`inline font-semibold ${t.text}`}>Elements:</dt> <dd className={`inline ${t.text} opacity-80`}>{d.elements}</dd></div>
                  <div><dt className={`inline font-semibold ${t.text}`}>Qualities:</dt> <dd className={`inline ${t.text} opacity-80`}>{d.qualities}</dd></div>
                  <div><dt className={`inline font-semibold ${t.text}`}>Body sites:</dt> <dd className={`inline ${t.text} opacity-80`}>{d.sites}</dd></div>
                  <div><dt className={`inline font-semibold ${t.text}`}>Governs:</dt> <dd className={`inline ${t.text} opacity-80`}>{d.govern}</dd></div>
                </dl>
              </article>
            )
          })}
        </div>

        <blockquote className="mt-8 border-l-4 border-kerala-700 pl-4 bg-cream rounded-r-card p-5 text-sm leading-relaxed">
          <p className="font-serif text-base text-ink">वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः।</p>
          <p className="font-serif text-base text-ink">विकृताविकृता देहं घ्नन्ति ते वर्तयन्ति च॥</p>
          <p className="text-xs text-gray-600 mt-2 italic">— Ashtanga Hridayam, Sutrasthana 1.6</p>
          <p className="text-xs text-gray-700 mt-2">&quot;Vata, Pitta, Kapha — these are the three doshas, in brief. When vitiated they destroy the body; when balanced they sustain it.&quot;</p>
        </blockquote>
      </section>

      {/* Article cards */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2 text-center">The 7-article series</h2>
          <p className="text-sm text-muted text-center mb-8">Each article available in Malayalam (primary) and English. Classical shlokas embedded; Kerala-tradition therapies cross-linked.</p>
          <ul className="space-y-3">
            {ARTICLES.map((a) => (
              <li key={a.n} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-kerala-700 text-white flex items-center justify-center font-bold flex-shrink-0">{a.n}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-ink leading-tight">{a.ml}</h3>
                    <p className="text-sm text-gray-600 mt-1">{a.en}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/articles/${a.mlId}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
                        Read in മലയാളം <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link href={`/articles/${a.enId}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-700 rounded text-xs hover:bg-gray-50">
                        Read in English <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                  <a.icon className="w-6 h-6 text-kerala-700 mt-1 hidden sm:block" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Prakriti Quiz CTA */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-6 md:p-8 shadow-card text-center">
          <Compass className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-ink">Discover your dosha</h2>
          <p className="font-serif text-lg text-ink mt-1">നിങ്ങളുടെ പ്രകൃതി കണ്ടെത്തുക</p>
          <p className="text-sm text-gray-700 mt-3 max-w-xl mx-auto">25 questions, 4 minutes. The Tridosha framework only becomes useful when you know your own constitution. Free.</p>
          <Link href="/prakriti-quiz" className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Take the Prakriti Quiz <ChevronRight className="w-5 h-5" />
          </Link>
          <div className="mt-4 flex justify-center gap-3 text-xs">
            <Link href="/ritucharya"        className="text-kerala-700 hover:underline">→ Seasonal Regimen (Ritucharya)</Link>
            <Link href="/hospitals"         className="text-kerala-700 hover:underline">→ Verified centres</Link>
            <Link href="/heal-in-kerala"    className="text-kerala-700 hover:underline">→ Heal in Kerala</Link>
          </div>
        </div>
      </section>
    </>
  )
}
