import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, LeafPattern, LogoMark, t, readLangFromCookieHeader, type DoctorCardData } from '@ayurconnect/ui'
import {
  Search, Stethoscope, Building2, Bot, MessageSquare, Briefcase, Leaf, Plane,
  GraduationCap, ShieldCheck, Video, Sparkles, Users, MapPin, Lock, Star, ArrowRight,
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
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link href="/doctors" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md shadow-[0_8px_30px_-6px_rgba(217,119,6,0.5)] hover:shadow-[0_12px_36px_-6px_rgba(217,119,6,0.6)] transition-all">
              {tr.hero.ctaFindDoctor} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/ayurbot" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-md backdrop-blur transition-colors">
              <Bot className="w-4 h-4" /> {tr.hero.ctaAskAyurBot}
            </Link>
            <Link href="/herbs" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-md backdrop-blur transition-colors">
              <Leaf className="w-4 h-4" /> {tr.hero.ctaExploreHerbs}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH BAR */}
      <div className="container mx-auto px-4 -mt-14 relative z-10">
        <form
          action="/doctors"
          className="bg-white rounded-card shadow-cardLg border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-stretch"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              placeholder="Search doctors, conditions, herbs…"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
          <select name="district" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-700">
            <option value="">All districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="specialization" className="px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-700">
            <option value="">All specializations</option>
            {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-6 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white font-semibold rounded-md text-sm transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* 3. TRUST STATS — gradient cards, gold rule */}
      <section className="bg-kerala-700 text-white mt-16 relative overflow-hidden">
        <LeafPattern color="#ffffff" opacity={0.04} tile={70} />
        <div className="relative container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '500+',  label: 'Verified Doctors',  sub: 'CCIM cross-checked' },
              { num: '200+',  label: 'Wellness Centres',  sub: 'AYUSH certified' },
              { num: '150+',  label: 'Medicinal Herbs',   sub: 'Western Ghats' },
              { num: '50K+',  label: 'Consultations',     sub: 'and counting' },
            ].map((s) => (
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
        <SectionHeader eyebrow="Practitioners" title="Featured Doctors" subtitle="CCIM-verified practitioners with deep classical training." />
        {featuredDoctors.length === 0 ? (
          <p className="text-center text-muted">No doctors available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-700 hover:text-white font-semibold rounded-md transition-colors">
            View all 500+ doctors <ArrowRight className="w-4 h-4" />
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
              <div key={t.name} className="group bg-white/[0.06] border border-white/15 rounded-card p-6 backdrop-blur hover:bg-white/[0.10] hover:border-white/25 hover:-translate-y-1 transition-all duration-200">
                <div className="text-4xl mb-3">{t.emoji}</div>
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
                <article key={tip.id} className={`${tone.bg} rounded-card p-7 border border-gray-100 hover:shadow-cardLg hover:-translate-y-1 transition-all duration-200`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{tone.emoji}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>{tip.dosha}</span>
                    {tip.season && <span className="text-[10px] uppercase text-gray-400 tracking-wider">{tip.season}</span>}
                  </div>
                  <h3 className="font-serif text-xl text-gray-900 leading-snug">{tip.title}</h3>
                  <p className="text-sm text-gray-700 mt-3 line-clamp-5 leading-relaxed">{tip.content}</p>
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
          <SectionHeader eyebrow="Why us" title="Built on Trust + Tradition" subtitle="Six pillars that make AyurConnect different." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map((w) => {
              const Icon = w.icon
              return (
                <div key={w.title} className="bg-white p-7 rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow">
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

      {/* 9. TESTIMONIALS */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Outcomes" title="Stories of Healing" subtitle="Real patients. Real outcomes." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="relative bg-white p-7 rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow">
              <span aria-hidden className="absolute top-4 right-5 text-7xl font-serif text-kerala-100 leading-none select-none">&ldquo;</span>
              <div className="relative">
                <div className="flex items-center gap-0.5 text-gold-400 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <blockquote className="text-gray-700 leading-relaxed text-[15px]">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                  <span className="w-10 h-10 rounded-full bg-kerala-700 text-white text-sm font-semibold flex items-center justify-center">{t.initials}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-muted">{t.condition}</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
            Free to join. CCIM-verified doctors. No middlemen, no commission cuts. Trusted by 50,000+ patients.
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
