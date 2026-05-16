import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, Leaf, Stethoscope, Sparkles, Activity, ChevronRight, Search, FlaskConical, ScrollText, Heart } from 'lucide-react'
import { CONDITIONS, CONDITION_SLUGS } from '../treatments/_data/conditions'
import { API_INTERNAL } from '@/lib/server-fetch'

export const metadata = {
  title: 'Ayurveda Knowledge Hub — Treatments, Herbs, Research | AyurConnect',
  description: 'A single index of everything we know — specialised treatments, the 150+ herb database, classical research citations, health tips, dosha guides, and AI tools. Curated by verified practitioners.',
  alternates: { canonical: '/knowledge' },
}

type ListResp<T> = T[] | { items?: T[]; doctors?: T[]; herbs?: T[]; tips?: T[]; articles?: T[] }
type Article  = { id: string; title: string; slug?: string; category?: string; createdAt?: string }
type Herb     = { id: string; name: string; sanskrit?: string; english?: string }
type Tip      = { id: string; title: string; dosha: string }

async function fetchList<T>(path: string, key?: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data: ListResp<T> = await res.json()
    if (Array.isArray(data)) return data
    const k = key as keyof typeof data | undefined
    if (k && Array.isArray((data as Record<string, unknown>)[k])) return (data as Record<string, unknown>)[k] as T[]
    const firstArray = Object.values(data as Record<string, unknown>).find((v) => Array.isArray(v))
    return Array.isArray(firstArray) ? (firstArray as T[]) : []
  } catch {
    return []
  }
}

export default async function KnowledgePage() {
  const [herbs, tips, articles] = await Promise.all([
    fetchList<Herb>('/herbs?limit=24',      'herbs'),
    fetchList<Tip>('/health-tips?limit=12', 'tips'),
    fetchList<Article>('/articles?limit=12','articles'),
  ])

  const treatmentCount = CONDITION_SLUGS.length
  const treatments = CONDITION_SLUGS.map((slug) => CONDITIONS[slug]).filter(Boolean)

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <BookOpen className="w-3 h-3" /> Knowledge Hub
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Everything we <span className="text-gold-400">know</span>, in one place
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Specialised treatments, 150+ herbs with classical citations, research evidence, AI tools,
            health tips — curated by verified practitioners, structured for actually finding things.
          </p>
          <Link href="/search" className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white rounded-md font-semibold">
            <Search className="w-4 h-4" /> Search everything
          </Link>
        </div>
      </GradientHero>

      {/* AI tools row — these are the highest-conversion onboarding pages */}
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Interactive tools
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mt-1">Find out where you stand</h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/prakriti-quiz',  icon: Sparkles, title: 'Prakriti Quiz',    desc: 'Discover your dominant dosha — 25 questions, 4 minutes' },
            { href: '/wellness-check', icon: Activity, title: 'Wellness Check',   desc: 'Stress, burnout, metabolic, sleep risk scoring' },
            { href: '/diet-planner',   icon: Heart,    title: 'AI Diet Planner',  desc: 'Personalised 7-day Ayurvedic meal plan' },
            { href: '/triage',         icon: Stethoscope, title: 'AI Triage',     desc: 'Symptom check with dosha-aware suggestions' },
          ].map((t) => (
            <Link key={t.href} href={t.href} className="group p-5 bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all">
              <t.icon className="w-7 h-7 text-kerala-700 mb-3" />
              <h3 className="font-serif text-lg text-kerala-700 group-hover:text-kerala-600">{t.title}</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Treatments grid */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
                <Stethoscope className="w-3 h-3" /> Specialised treatments ({treatmentCount})
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mt-1">Condition-led care guides</h2>
            </div>
            <Link href="/treatments" className="text-sm text-kerala-700 font-semibold hover:underline inline-flex items-center gap-1">
              All treatments <ChevronRight className="w-3 h-3" />
            </Link>
          </header>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {treatments.map((c) => (
              <Link key={c.slug} href={`/treatments/${c.slug}`} className="p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors">
                <h3 className="font-serif text-base text-kerala-700">{c.name}</h3>
                <p className="text-xs text-gold-600 italic">{c.sanskrit}</p>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Herbs */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
              <Leaf className="w-3 h-3" /> Herb database
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mt-1">Medicinal herbs</h2>
            <p className="text-sm text-gray-600 mt-1">Sanskrit, Malayalam, English names; Rasa-Guna-Virya-Vipaka, uses, contraindications.</p>
          </div>
          <Link href="/herbs" className="text-sm text-kerala-700 font-semibold hover:underline inline-flex items-center gap-1">
            All 150+ herbs <ChevronRight className="w-3 h-3" />
          </Link>
        </header>
        {herbs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Herb directory loading. Browse directly at <Link href="/herbs" className="text-kerala-700 hover:underline">/herbs</Link>.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {herbs.slice(0, 12).map((h) => (
              <Link key={h.id} href={`/herbs/${h.id}`} className="p-3 bg-white rounded-md border border-gray-100 hover:border-kerala-300 transition-colors flex items-start gap-2">
                <Leaf className="w-4 h-4 text-kerala-700 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{h.name}</div>
                  {h.sanskrit && <div className="text-xs text-gold-600 italic truncate">{h.sanskrit}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Health tips */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
                <ScrollText className="w-3 h-3" /> Health tips
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mt-1">Daily Ayurvedic guidance</h2>
            </div>
            <Link href="/health-tips" className="text-sm text-kerala-700 font-semibold hover:underline inline-flex items-center gap-1">
              All tips <ChevronRight className="w-3 h-3" />
            </Link>
          </header>
          {tips.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Tips loading. Browse at <Link href="/health-tips" className="text-kerala-700 hover:underline">/health-tips</Link>.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tips.slice(0, 6).map((t) => (
                <Link key={t.id} href={`/health-tips/${t.id}`} className="p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors">
                  <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
                    t.dosha === 'vata'  ? 'bg-blue-50 text-blue-700' :
                    t.dosha === 'pitta' ? 'bg-orange-50 text-orange-700' :
                    t.dosha === 'kapha' ? 'bg-emerald-50 text-emerald-700' :
                                          'bg-gray-100 text-gray-700'
                  }`}>{t.dosha}</span>
                  <h3 className="font-serif text-base text-kerala-700 leading-snug">{t.title}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles + Research */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <header className="mb-4">
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
                <FlaskConical className="w-3 h-3" /> Clinical research
              </div>
              <h2 className="font-serif text-2xl text-kerala-700 mt-1">Peer-reviewed evidence</h2>
            </header>
            <p className="text-sm text-gray-700 mb-4">Curated citations on Ayurvedic interventions — OA, anxiety, psoriasis, diabetes, IBS.</p>
            <Link href="/research" className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md text-sm font-semibold">
              Browse research <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <header className="mb-4">
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold flex items-center gap-2">
                <ScrollText className="w-3 h-3" /> Articles
              </div>
              <h2 className="font-serif text-2xl text-kerala-700 mt-1">Long-form essays</h2>
            </header>
            {articles.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Articles loading. Browse at <Link href="/articles" className="text-kerala-700 hover:underline">/articles</Link>.</p>
            ) : (
              <ul className="space-y-2">
                {articles.slice(0, 4).map((a) => (
                  <li key={a.id}>
                    <Link href={`/articles/${a.id}`} className="text-sm text-kerala-700 hover:underline">{a.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* About / Trust */}
      <section className="bg-kerala-50 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Understand how we work</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: '/about/methodology',        label: 'Our methodology — how we verify' },
              { href: '/about/why-ayurveda-works', label: 'Why Ayurveda works (and where it doesn\'t)' },
              { href: '/about/certifications',     label: 'CCIM, AYUSH, NABH — what they mean' },
              { href: '/about/leadership',         label: 'Leadership + advisory board' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors flex items-center justify-between">
                <span className="text-sm text-gray-800">{l.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
