import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, GradientHero, t, readLangFromCookieHeader, type DoctorCardData } from '@ayurconnect/ui'
import {
  Search, Stethoscope, Building2, Bot, MessageSquare, Briefcase, Leaf, Plane,
  GraduationCap, ShieldCheck, Video, Sparkles, Users, MapPin, Lock, Star,
} from 'lucide-react'
import { API_INTERNAL as API } from '../lib/server-fetch'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Shalakya', 'Manasika', 'Rasashastra']

const SERVICES = [
  { href: '/doctors',   icon: Stethoscope,    title: 'Doctor Directory',   color: 'bg-kerala-50 text-kerala-700',  desc: 'CCIM-verified Ayurveda doctors across all 14 Kerala districts.' },
  { href: '/ayurbot',   icon: Bot,            title: 'AyurBot AI',         color: 'bg-purple-50 text-purple-700', desc: 'Claude-powered Ayurveda assistant — 24/7, free.' },
  { href: '/hospitals', icon: Building2,      title: 'Hospitals',          color: 'bg-blue-50 text-blue-700',     desc: 'Govt + private + Panchakarma centres + AYUSH-certified.' },
  { href: '/herbs',     icon: Leaf,           title: 'Herb Database',      color: 'bg-emerald-50 text-emerald-700', desc: '1000+ Kerala medicinal herbs — Sanskrit, Malayalam, uses.' },
  { href: '/forum',     icon: MessageSquare,  title: 'Community Forum',    color: 'bg-orange-50 text-orange-700', desc: 'Doctor + patient discussions on cases, herbs, treatments.' },
  { href: '/jobs',      icon: Briefcase,      title: 'Ayurveda Jobs',      color: 'bg-rose-50 text-rose-700',     desc: 'Kerala\'s largest Ayurveda jobs board (incl. govt + Gulf).' },
  { href: '/tourism',   icon: Plane,          title: 'Medical Tourism',    color: 'bg-teal-50 text-teal-700',     desc: 'International patients — Kerala Panchakarma packages.' },
  { href: '/colleges',  icon: GraduationCap,  title: 'Medical Colleges',   color: 'bg-indigo-50 text-indigo-700', desc: 'CCIM-affiliated BAMS / MD / PhD colleges in Kerala.' },
]

const TREATMENTS = [
  { name: 'Panchakarma',    duration: '7–28 days',  emoji: '🌿', desc: 'Five classical purification therapies — Vamana, Virechana, Basti, Nasya, Raktamokshana. The pinnacle of Ayurvedic detox.' },
  { name: 'Shirodhara',     duration: '30–45 min',  emoji: '💧', desc: 'Continuous warm-oil stream over the forehead. Profound relief from anxiety, insomnia, migraine, mental fatigue.' },
  { name: 'Njavara Kizhi',  duration: '45–60 min',  emoji: '🌾', desc: 'Medicated rice-bolus poultice massage — strengthens muscles, nourishes tissues, classical anti-aging.' },
  { name: 'Pizhichil',      duration: '60–90 min',  emoji: '🛁', desc: 'Synchronized warm-oil pour and massage — known as "the king\'s treatment". For arthritis, paralysis, chronic stiffness.' },
]

const WHY = [
  { icon: ShieldCheck, title: 'CCIM Verified', desc: 'Every doctor cross-checked against the Central Council of Indian Medicine register.' },
  { icon: Video,       title: 'Video Consultations', desc: 'Connect with Kerala doctors from anywhere in the world.' },
  { icon: Sparkles,    title: 'AI-Powered',  desc: 'AyurBot drafts personalised health insights in seconds, free.' },
  { icon: Users,       title: 'Transparency', desc: 'Public reviews, qualifications, and CCIM numbers — nothing hidden.' },
  { icon: MapPin,      title: 'Kerala Expertise', desc: 'Heritage practitioners trained in classical Kerala traditions.' },
  { icon: Lock,        title: 'Safe & Private', desc: 'End-to-end encrypted consultations and health data.' },
]

const TESTIMONIALS = [
  { name: 'Anita M.', condition: 'Chronic migraine',  initials: 'AM', stars: 5, quote: '15 years of weekly migraines, gone after 21 days of Karkidaka Chikitsa under Dr. Kumar. AyurConnect made finding the right doctor effortless.' },
  { name: 'James W.', condition: 'Visited from UK',  initials: 'JW', stars: 5, quote: 'Booked a 14-day Panchakarma at a Kochi centre. Authentic, classical, no spa-tourism nonsense. Came back transformed.' },
  { name: 'Priya S.', condition: 'PCOS, infertility', initials: 'PS', stars: 5, quote: 'Conceived after 4 months under Dr. Krishnan\'s care. Years of failed modern treatments behind me. Forever grateful.' },
]

type Tip = { id: string; title: string; content: string; dosha: string; season?: string | null }
type DoctorWithMeta = DoctorCardData

const DOSHA_TONE: Record<string, { bg: string; chip: string; emoji: string }> = {
  vata:     { bg: 'bg-blue-50',    chip: 'bg-blue-600 text-white',    emoji: '🌬️' },
  pitta:    { bg: 'bg-orange-50',  chip: 'bg-orange-600 text-white',  emoji: '🔥' },
  kapha:    { bg: 'bg-emerald-50', chip: 'bg-emerald-600 text-white', emoji: '🌊' },
  tridosha: { bg: 'bg-purple-50',  chip: 'bg-purple-600 text-white',  emoji: '☯️' },
}

async function getFeaturedDoctors(): Promise<DoctorWithMeta[]> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/doctors?limit=6&verified=true&sort=experience`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { doctors: DoctorWithMeta[] }
    return data.doctors ?? []
  } catch {
    return []
  }
}

async function getHealthTips(): Promise<Tip[]> {
  try {
    const res = await fetch(`${API}/health-tips?limit=3`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { tips: Tip[] }
    return data.tips ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featuredDoctors, healthTips, hdrs] = await Promise.all([
    getFeaturedDoctors(),
    getHealthTips(),
    nextHeaders(),
  ])
  const lang = readLangFromCookieHeader(hdrs.get('cookie'))
  const tr = t(lang)

  return (
    <>
      {/* 1. HERO */}
      <GradientHero variant="green" size="lg">
        <div className="text-center max-w-3xl mx-auto pb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            🌿 {tr.hero.tag}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
            {tr.hero.title}
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-2xl mx-auto">
            {tr.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/doctors" className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md transition-colors">
              {tr.hero.ctaFindDoctor}
            </Link>
            <Link href="/ayurbot" className="px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 font-semibold rounded-md transition-colors">
              {tr.hero.ctaAskAyurBot}
            </Link>
            <Link href="/herbs" className="px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 font-semibold rounded-md transition-colors">
              {tr.hero.ctaExploreHerbs}
            </Link>
          </div>
        </div>
      </GradientHero>

      {/* 2. FLOATING SEARCH BAR */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <form
          action="/doctors"
          className="bg-white rounded-card shadow-cardLg border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-stretch"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              placeholder="Search doctors, conditions, herbs…"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-600"
            />
          </div>
          <select name="district" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
            <option value="">All districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="specialization" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600">
            <option value="">All specializations</option>
            {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md text-sm">
            Search
          </button>
        </form>
      </div>

      {/* 3. TRUST STATS */}
      <section className="bg-kerala-700 text-white mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '500+',  label: 'Verified Doctors',  sub: 'CCIM cross-checked' },
              { num: '200+',  label: 'Wellness Centres',  sub: 'AYUSH certified' },
              { num: '1000+', label: 'Medicinal Herbs',   sub: 'Western Ghats' },
              { num: '50K+',  label: 'Consultations',     sub: 'and counting' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-4xl md:text-5xl text-gold-400">{s.num}</div>
                <div className="font-medium mt-1">{s.label}</div>
                <div className="text-xs text-white/60">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-kerala-700">Featured Doctors</h2>
          <p className="text-muted mt-2 max-w-xl mx-auto">CCIM-verified practitioners with deep classical training.</p>
        </div>
        {featuredDoctors.length === 0 ? (
          <p className="text-center text-muted">No doctors available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
        <div className="text-center mt-10">
          <Link href="/doctors" className="inline-flex items-center gap-1 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-600 hover:text-white font-semibold rounded-md transition-colors">
            View all 500+ doctors →
          </Link>
        </div>
      </section>

      {/* 5. SERVICE GRID */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-kerala-700">Everything Ayurveda in One Place</h2>
            <p className="text-muted mt-2">Eight modules. One platform. Rooted in Kerala.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((svc) => {
              const Icon = svc.icon
              return (
                <Link
                  key={svc.href}
                  href={svc.href}
                  className="group p-5 rounded-card border border-gray-100 bg-white hover:shadow-card hover:border-kerala-200 transition-all"
                >
                  <span className={`w-10 h-10 rounded-lg ${svc.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-3">{svc.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{svc.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. KERALA TREATMENTS SHOWCASE */}
      <GradientHero variant="tourism" size="md" className="text-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-white">Signature Kerala Treatments</h2>
          <p className="text-white/70 mt-2">Classical therapies preserved unbroken for 5000 years.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          {TREATMENTS.map((t) => (
            <div key={t.name} className="bg-white/8 border border-white/15 rounded-card p-5 backdrop-blur hover:bg-white/12 transition-colors">
              <div className="text-3xl">{t.emoji}</div>
              <div className="mt-3 flex items-center gap-2">
                <h3 className="font-serif text-xl text-white">{t.name}</h3>
                <span className="px-2 py-0.5 bg-gold-500/20 text-gold-200 rounded-full text-[10px] border border-gold-400/30">{t.duration}</span>
              </div>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/tourism" className="inline-block px-5 py-2.5 bg-white text-kerala-800 font-semibold rounded-md hover:bg-cream transition-colors">
            Explore Panchakarma Centres →
          </Link>
        </div>
      </GradientHero>

      {/* 7. HEALTH TIPS PREVIEW */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-kerala-700">Daily Health Tips</h2>
          <p className="text-muted mt-2">Bite-sized classical guidance — Charaka, Ashtanga Hridayam.</p>
        </div>
        {healthTips.length === 0 ? (
          <p className="text-center text-muted">Health tips coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {healthTips.map((tip) => {
              const tone = DOSHA_TONE[tip.dosha] ?? DOSHA_TONE.tridosha
              return (
                <article key={tip.id} className={`${tone.bg} rounded-card p-6 border border-gray-100 hover:shadow-card transition-shadow`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{tone.emoji}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>{tip.dosha}</span>
                    {tip.season && <span className="text-[10px] uppercase text-gray-400 tracking-wider">{tip.season}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-snug">{tip.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-5 leading-relaxed">{tip.content}</p>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* 8. WHY AYURCONNECT */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-kerala-700">Why AyurConnect</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map((w) => {
              const Icon = w.icon
              return (
                <div key={w.title} className="bg-white p-6 rounded-card border border-gray-100 shadow-card">
                  <span className="w-10 h-10 rounded-lg bg-kerala-50 text-kerala-700 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold text-gray-900">{w.title}</h3>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{w.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl text-kerala-700">Stories of Healing</h2>
          <p className="text-muted mt-2">Real patients. Real outcomes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="bg-white p-6 rounded-card border border-gray-100 shadow-card">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-kerala-600 text-white text-sm font-semibold flex items-center justify-center">{t.initials}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-muted">{t.condition}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mt-3 text-gold-400">
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 text-sm text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
