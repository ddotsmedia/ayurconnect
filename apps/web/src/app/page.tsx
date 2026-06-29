import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, LeafPattern, LogoMark, t, type DoctorCardData } from '@ayurconnect/ui'
import {
  Search, Stethoscope, Building2, Bot, MessageSquare, Leaf,
  ShieldCheck, Sparkles, ArrowRight, ChevronRight, BookOpen, Heart,
} from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '../lib/server-fetch'
import { PersonalizedWelcome } from '../components/personalized-welcome'
import { medicalBusinessLd, faqLd, ldGraph } from '../lib/seo'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Shalakya', 'Manasika', 'Rasashastra']

const SERVICES = [
  { href: '/doctors',       icon: Stethoscope,    title: 'Doctor Directory',     color: 'bg-kerala-50 text-kerala-700',   desc: 'verified Ayurveda doctors across all 14 Kerala districts.' },
  { href: '/doctor-match',  icon: Sparkles,       title: 'AI Doctor Match',      color: 'bg-amber-50 text-amber-700',     desc: '30-second quiz → ranked specialists matched to your concern, language, budget.' },
  { href: '/conditions',    icon: BookOpen,       title: 'Conditions Library',   color: 'bg-teal-50 text-teal-700',       desc: 'Ayurvedic treatment guides for PCOS, arthritis, diabetes, migraine, IBS, and more — classical understanding + verified specialists.' },
  { href: '/qa',            icon: MessageSquare,  title: 'Ayurveda Q&A',         color: 'bg-blue-50 text-blue-700',       desc: 'Free anonymous patient Q&A answered by verified doctors within 48 hours.' },
  { href: '/programs',      icon: Sparkles,       title: 'Wellness Programs',    color: 'bg-fuchsia-50 text-fuchsia-700', desc: 'Guided multi-week journeys — 21-day stress reset, 6-week PCOS, Karkidaka Chikitsa.' },
  { href: '/formulary',     icon: Leaf,           title: 'Ayurveda Formulary',   color: 'bg-emerald-50 text-emerald-700', desc: 'Classical compound medicines reference — Yogaraj Guggulu, Triphala, and more.' },
  { href: '/ayurbot',       icon: Bot,            title: 'AyurBot AI',           color: 'bg-purple-50 text-purple-700',   desc: 'Personalised Ayurveda assistant — knows your Prakriti + journal context.' },
  { href: '/second-opinion', icon: ShieldCheck,   title: 'Second Opinion',       color: 'bg-rose-50 text-rose-700',       desc: 'Senior verified specialists review your case independently. Reply in 72 hours.' },
  { href: '/hospitals',     icon: Building2,      title: 'Hospitals',            color: 'bg-blue-50 text-blue-700',       desc: 'Govt + private + Panchakarma centres + AYUSH-certified.' },
]

const TREATMENTS = [
  { name: 'Panchakarma',    duration: '7–28 days',  desc: 'Five classical purification therapies — Vamana, Virechana, Basti, Nasya, Raktamokshana. The pinnacle of Ayurvedic detox.' },
  { name: 'Shirodhara',     duration: '30–45 min',  desc: 'Continuous warm-oil stream over the forehead. Profound relief from anxiety, insomnia, migraine, mental fatigue.' },
  { name: 'Njavara Kizhi',  duration: '45–60 min',  desc: 'Medicated rice-bolus poultice massage — strengthens muscles, nourishes tissues, classical anti-aging.' },
  { name: 'Pizhichil',      duration: '60–90 min',  desc: 'Synchronized warm-oil pour and massage — known as "the king\'s treatment". For arthritis, paralysis, chronic stiffness.' },
]

const WHY = [
  { icon: ShieldCheck, title: 'Verified Credentials',          desc: 'Every doctor\'s BAMS/MD degree and KSMC registration verified manually before their profile goes live.' },
  { icon: Leaf,        title: 'Classical Kerala Ayurveda',     desc: 'Rooted in Ashtavaidya tradition. Authentic Keraleeya Panchakarma — not generic wellness.' },
  { icon: Heart,       title: 'Free, Forever',                 desc: 'No subscription for patients or doctors. No middlemen. Connect directly with practitioners.' },
]

// FAQs surfaced on the homepage. These are simultaneously rendered as a
// <details> accordion (for users) and injected as FAQPage JSON-LD (for SERP
// rich snippets) — Google requires the visible content match the schema.
const HOME_FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What is AyurConnect?',
    a: 'AyurConnect is an online platform that connects patients worldwide with verified Ayurvedic doctors from Kerala for personalized consultations, classical Panchakarma referrals, and herbal wellness guidance.',
  },
  {
    q: 'Are the doctors on AyurConnect certified?',
    a: 'Yes. Every doctor on AyurConnect holds BAMS or MD (Ayurveda) credentials and is independently verified by our team — covering qualifications, registration, and clinical practice history — before their profile goes live.',
  },
  {
    q: 'How do I book an online Ayurvedic consultation?',
    a: 'Browse the doctor directory or take the 30-second AI Doctor Match quiz, pick a specialist, and book a video slot. Consultations run on a secure video room — no app install required.',
  },
  {
    q: 'Can I get an Ayurvedic consultation from outside India?',
    a: 'Yes. We serve patients across the UAE, GCC, US, UK, Europe, and Southeast Asia. Doctors take video consultations in English, Malayalam, Hindi, Tamil, and Arabic. You can also message the WhatsApp concierge to be connected to a doctor.',
  },
  {
    q: 'What conditions does Ayurveda treat well?',
    a: 'Ayurveda has strong evidence-informed protocols for PCOS / PCOD, thyroid imbalance, type-2 diabetes, chronic stress and insomnia, skin disorders, digestive issues, joint pain, and post-illness rejuvenation. Browse /treatments for condition-specific pages.',
  },
  {
    q: 'Is AyurConnect free to use?',
    a: 'Joining as a patient is free. You only pay the doctor for the consultation slot you book — pricing is set by each doctor and visible on their profile. AyurBot AI and the Q&A community are free forever.',
  },
]

const HOME_SERVICES_CATALOG = [
  'Online Ayurvedic Consultation',
  'AI Doctor Match',
  'Classical Panchakarma Referral',
  'Herbal Formulary Reference',
  'Second Opinion from Senior Specialists',
  'Wellness Programs',
  'Ayurveda Q&A',
  'AyurBot AI Assistant',
]

type Tip = { id: string; title: string; content: string; dosha: string; season?: string | null }
type DoctorWithMeta = DoctorCardData

const DOSHA_TONE: Record<string, { bg: string; chip: string }> = {
  vata:     { bg: 'bg-blue-50',    chip: 'bg-blue-600 text-white'    },
  pitta:    { bg: 'bg-orange-50',  chip: 'bg-orange-600 text-white'  },
  kapha:    { bg: 'bg-emerald-50', chip: 'bg-emerald-600 text-white' },
  tridosha: { bg: 'bg-purple-50',  chip: 'bg-purple-600 text-white'  },
}

async function getFeaturedDoctors(): Promise<DoctorWithMeta[]> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/doctors?limit=6&verified=true&sort=experience`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!res.ok) {
      logServerFetchError('getFeaturedDoctors', `HTTP ${res.status}`)
      return []
    }
    const data = (await res.json()) as { doctors: DoctorWithMeta[] }
    return data.doctors ?? []
  } catch (err) {
    logServerFetchError('getFeaturedDoctors', err)
    return []
  }
}

async function getHealthTips(): Promise<Tip[]> {
  try {
    const res = await fetch(`${API}/health-tips?limit=3`, { cache: 'no-store' })
    if (!res.ok) {
      logServerFetchError('getHealthTips', `HTTP ${res.status}`)
      return []
    }
    const data = (await res.json()) as { tips: Tip[] }
    return data.tips ?? []
  } catch (err) {
    logServerFetchError('getHealthTips', err)
    return []
  }
}

// Real homepage stats (Task 2). Pulls counts from API counts endpoints; falls
// back to honest defaults if the API is down. ISR-cached at the route level.
type HomeStats = { doctors: number; hospitals: number; herbs: number; formulations: number; consultations: number }
async function getHomepageStats(): Promise<HomeStats> {
  const fallback = { doctors: 0, hospitals: 0, herbs: 0, formulations: 0, consultations: 0 }
  try {
    const [d, h, hb, f, c] = await Promise.all([
      fetch(`${API}/doctors?limit=1`,              { next: { revalidate: 3600 } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/hospitals?limit=1`,            { next: { revalidate: 3600 } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/herbs?limit=1`,                { next: { revalidate: 3600 } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/formulations?limit=1`,         { next: { revalidate: 3600 } }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/appointments?limit=1&count=1`, { next: { revalidate: 3600 } }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
    return {
      doctors:       (d?.total ?? d?.count ?? (Array.isArray(d?.doctors) ? d.doctors.length : 0)) || 0,
      hospitals:     (h?.total ?? h?.count ?? (Array.isArray(h) ? h.length : 0)) || 0,
      herbs:         (hb?.total ?? hb?.count ?? (Array.isArray(hb?.herbs) ? hb.herbs.length : 0)) || 0,
      formulations:  (f?.total ?? f?.count ?? (Array.isArray(f?.formulations) ? f.formulations.length : 0)) || 0,
      consultations: (c?.total ?? c?.count ?? 0) || 0,
    }
  } catch { return fallback }
}

function statValue(n: number): string {
  if (!n) return '—'
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`
  if (n >  50)   return `${n}+`
  return `${n}`
}

// Homepage-specific metadata — tighter than the site-wide layout 'all' keyword
// dump. These are the priority-1 phrases we want this URL to rank for.
// meta keywords removed (Task 11) — Google + Bing have ignored them since 2009;
// the ~1500-char dump bloats HTML for zero ranking value. Title + description +
// canonical are what matters here.
export const metadata = {
  title: "AyurConnect — Verified Ayurveda Doctors Online | Kerala + UAE",
  description: "AyurConnect connects you to verified Kerala Ayurveda doctors via online video consultation. Classical Panchakarma, AyurBot AI, 150+ herbs, 8+ condition guides. Serving India and the UAE diaspora.",
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [featuredDoctors, healthTips, stats] = await Promise.all([
    getFeaturedDoctors(),
    getHealthTips(),
    getHomepageStats(),
  ])
  // Pick the 4 stats with the strongest real numbers. If consultations is 0
  // (no data yet), substitute districts-covered or formulations count.
  const STAT_CARDS = [
    { num: statValue(stats.doctors),   label: 'Verified Doctors',   sub: 'Credentials checked' },
    { num: statValue(stats.hospitals), label: 'Wellness Centres',   sub: 'AYUSH certified' },
    { num: statValue(stats.herbs),     label: 'Medicinal Herbs',    sub: 'Western Ghats' },
    stats.consultations > 0
      ? { num: statValue(stats.consultations),                       label: 'Consultations',            sub: 'and counting' }
      : stats.formulations > 0
        ? { num: statValue(stats.formulations),                      label: 'Classical Formulations',   sub: 'cited in classics' }
        : { num: '14',                                               label: 'Kerala Districts Covered', sub: 'Kasaragod → Thiruvananthapuram' },
  ]
  // UI chrome is English-only. Malayalam appears solely in content/article
  // bodies (heritage, classical-text names, herb/treatment native names).
  const tr = t()

  const homeJsonLd = ldGraph(
    medicalBusinessLd(HOME_SERVICES_CATALOG),
    faqLd(HOME_FAQ),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />

      {/* 0. Personalized welcome — renders nothing for anonymous visitors. */}
      <PersonalizedWelcome />

      {/* 1. HERO — cinematic, with leaf-pattern overlay + faint logo watermark */}
      <section className="relative overflow-hidden bg-hero-green text-white">
        <LeafPattern color="#5fc063" opacity={0.08} tile={70} />
        {/* Faint logo watermark, far right */}
        <div aria-hidden className="absolute -right-20 -bottom-20 opacity-[0.06] hidden lg:block">
          <LogoMark className="w-[520px] h-[520px]" />
        </div>
        <div className="relative container mx-auto px-4 pt-20 pb-32 md:pt-28 md:pb-40 text-center max-w-4xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs font-medium text-white/90 border border-white/20 mb-7 tracking-wider uppercase">
            <Leaf className="w-3.5 h-3.5" /> {tr.hero.tag}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] tracking-tight">
            {tr.hero.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {tr.hero.subtitle}
          </p>
          {/* Search form is now IN the hero — patient flow first, brand second. */}
          <form
            action="/doctors"
            className="mt-8 bg-white rounded-card shadow-cardLg border border-white/10 p-3 md:p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-3 items-stretch max-w-3xl mx-auto"
          >
            <label className="sr-only" htmlFor="hero-q">Search doctors, conditions, herbs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="hero-q" name="q" placeholder="Search doctors, conditions, herbs…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-kerala-700" />
            </div>
            <label className="sr-only" htmlFor="hero-district">Select district</label>
            <select id="hero-district" name="district" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-kerala-700">
              <option value="">All districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <label className="sr-only" htmlFor="hero-spec">Select specialization</label>
            <select id="hero-spec" name="specialization" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-kerala-700">
              <option value="">All specializations</option>
              {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" aria-label="Search doctors" className="px-6 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white font-semibold rounded-md text-sm transition-colors">
              Search
            </button>
          </form>

          {/* Popular search chips */}
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
            <li className="opacity-70">Popular:</li>
            {['PCOS', 'Diabetes', 'Panchakarma', 'Back Pain', 'Weight Loss', 'Hair Fall'].map((q) => (
              <li key={q}><Link href={`/doctors?q=${encodeURIComponent(q)}`} className="inline-block px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors">{q}</Link></li>
            ))}
          </ul>

          {/* CTAs — one primary, one secondary (Task 5) */}
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Link href="/doctors" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md shadow-[0_8px_30px_-6px_rgba(217,119,6,0.5)] hover:shadow-[0_12px_36px_-6px_rgba(217,119,6,0.6)] transition-all">
              {tr.hero.ctaFindDoctor} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/ayurbot" className="inline-flex items-center gap-2 px-5 py-2 text-white/85 hover:text-white text-sm">
              <Bot className="w-4 h-4" /> {tr.hero.ctaAskAyurBot}
            </Link>
          </div>
        </div>
      </section>

      {/* 1b. HOW IT WORKS — 3-step strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          {[
            { e: '🔍', h: 'Search',  d: 'Find verified Ayurveda doctors by condition, location, or specialty' },
            { e: '👨‍⚕️', h: 'Choose', d: 'Compare profiles, read reviews, check qualifications' },
            { e: '📱', h: 'Consult', d: 'Book a video call or connect instantly via WhatsApp' },
          ].map((s) => (
            <div key={s.h} className="text-center">
              <div className="text-4xl">{s.e}</div>
              <h2 className="font-serif text-xl text-kerala-700 mt-2">{s.h}</h2>
              <p className="text-sm text-gray-600 mt-1 max-w-xs mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST STATS — gradient cards, gold rule */}
      <section className="bg-kerala-700 text-white mt-16 relative overflow-hidden">
        <LeafPattern color="#ffffff" opacity={0.04} tile={70} />
        <div className="relative container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="text-center px-2 py-3 border-l border-white/10 first:border-l-0">
                <div className="font-serif text-5xl md:text-6xl text-gold-400 leading-none tracking-tight">{s.num}</div>
                <div className="w-8 h-0.5 bg-gold-400/40 mx-auto mt-3" />
                <div className="font-medium mt-3">{s.label}</div>
                <div className="text-xs text-white/60 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Practitioners" title="Featured Doctors" subtitle="verified practitioners with deep classical training." />
        {featuredDoctors.length === 0 ? (
          <p className="text-center text-muted">No doctors available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-700 hover:text-white font-semibold rounded-md transition-colors">
            View all doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. SERVICE GRID */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="container mx-auto px-4">
          <SectionHeader eyebrow="Platform" title="Everything Ayurveda in One Place" subtitle="Eight modules. One platform. Rooted in Kerala." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((svc) => {
              const Icon = svc.icon
              return (
                <Link
                  key={svc.href}
                  href={svc.href}
                  className="group p-6 rounded-card border border-gray-100 bg-white hover:shadow-cardLg hover:border-kerala-200 hover:-translate-y-1 transition-all duration-200"
                >
                  <span className={`w-12 h-12 rounded-xl ${svc.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-4">{svc.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">{svc.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-kerala-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. KERALA TREATMENTS SHOWCASE */}
      <section className="relative overflow-hidden bg-hero-tourism text-white py-20">
        <LeafPattern color="#5fc063" opacity={0.06} tile={70} />
        <div className="relative container mx-auto px-4">
          <SectionHeader eyebrow="Heritage" title="Signature Kerala Treatments" subtitle="Classical therapies preserved unbroken for 5000 years." dark />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TREATMENTS.map((t) => (
              <div key={t.name} className="group bg-white/[0.06] border-l-4 border-l-gold-400 border-y border-r border-white/15 rounded-card p-6 backdrop-blur hover:bg-white/[0.10] hover:border-white/25 transition-colors duration-200">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-serif text-2xl text-white leading-tight">{t.name}</h3>
                </div>
                <span className="inline-block px-2 py-0.5 bg-gold-500/20 text-gold-200 rounded-full text-[10px] border border-gold-400/30 mb-3">{t.duration}</span>
                <p className="text-sm text-white/70 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/panchakarma" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-kerala-800 font-semibold rounded-md hover:bg-cream transition-colors">
              Learn about Panchakarma <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. HEALTH TIPS PREVIEW */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Daily Wisdom" title="Health Tips for Today" subtitle="Bite-sized classical guidance — Charaka, Ashtanga Hridayam." />
        {healthTips.length === 0 ? (
          <p className="text-center text-muted">Health tips coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthTips.map((tip) => {
              const tone = DOSHA_TONE[tip.dosha] ?? DOSHA_TONE.tridosha
              return (
                <article key={tip.id} className="bg-white rounded-card border border-gray-100 overflow-hidden">
                  <div className={`h-[3px] ${tone.chip.replace(/text-white/g, '').trim()}`} />
                  <div className="p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>{tip.dosha}</span>
                    {tip.season && <span className="text-[10px] uppercase text-gray-400 tracking-wider">{tip.season}</span>}
                  </div>
                  <h3 className="font-serif text-xl text-gray-900 leading-snug">{tip.title}</h3>
                  <p className="text-sm text-gray-700 mt-3 line-clamp-5 leading-relaxed">{tip.content}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        <div className="text-center mt-10">
          <Link href="/health-tips" className="inline-flex items-center gap-1.5 text-sm font-medium text-kerala-700 hover:underline">
            All health tips <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 8. WHY AYURCONNECT */}
      <section className="relative bg-cream py-20 overflow-hidden">
        <LeafPattern color="#155228" opacity={0.04} tile={80} />
        <div className="relative container mx-auto px-4">
          <SectionHeader eyebrow="Why us" title="Why Doctors Trust AyurConnect" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHY.map((w) => {
              const Icon = w.icon
              return (
                <div key={w.title} className="bg-white p-7 rounded-card border border-gray-100">
                  <span className="w-12 h-12 rounded-xl bg-kerala-50 text-kerala-700 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-serif text-xl text-gray-900 leading-tight">{w.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{w.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials section removed — fake-quotes pattern hurts credibility on a young site. */}

      {/* 9.5 FAQ — must mirror the FAQPage JSON-LD emitted at the top of the page. */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" subtitle="Quick answers about consultations, verification, and how AyurConnect works." />
          <div className="space-y-3">
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="group bg-white p-5 rounded-card border border-gray-100 shadow-card">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-ink text-[15px]">{f.q}</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 mt-1" />
                </summary>
                <p className="text-gray-700 leading-relaxed mt-3 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION — bottom band */}
      <section className="relative overflow-hidden bg-hero-green text-white py-16">
        <LeafPattern color="#5fc063" opacity={0.07} tile={70} />
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
            Begin your Ayurveda journey today
          </h2>
          <p className="text-white/75 mt-4 text-lg max-w-xl mx-auto">
            Free to join. verified doctors. No middlemen, no commission cuts. Trusted by 50,000+ patients.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md shadow-[0_8px_30px_-6px_rgba(217,119,6,0.5)] transition-all">
              Join free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/doctors" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-md backdrop-blur transition-colors">
              Browse doctors
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Reusable section header with eyebrow label ──────────────────────────
function SectionHeader({ eyebrow, title, subtitle, dark = false }: { eyebrow: string; title: string; subtitle?: string; dark?: boolean }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-4 ${
        dark
          ? 'bg-white/10 text-gold-200 border border-white/15'
          : 'bg-kerala-50 text-kerala-700 border border-kerala-100'
      }`}>
        <Leaf className="w-3 h-3" /> {eyebrow}
      </span>
      <h2 className={`font-serif text-3xl md:text-5xl leading-tight tracking-tight ${dark ? 'text-white' : 'text-kerala-700'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base md:text-lg ${dark ? 'text-white/70' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
