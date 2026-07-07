import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { DoctorCard, LeafPattern, LogoMark, t, type DoctorCardData } from '@ayurconnect/ui'
import {
  Search, Stethoscope, Building2, Bot, MessageSquare, Leaf,
  ShieldCheck, Sparkles, ArrowRight, ChevronRight, BookOpen, Heart,
} from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '../lib/server-fetch'
import { PersonalizedWelcome } from '../components/personalized-welcome'
import { EarlyAccessBanner } from '../components/early-access-banner'
import { medicalBusinessLd, faqLd, ldGraph } from '../lib/seo'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Shalakya', 'Manasika', 'Rasashastra']

const SERVICES = [
  { href: '/doctors',       icon: Stethoscope,    title: 'Doctor Directory',     color: 'bg-kerala-50 text-kerala-700',   desc: 'Verified Ayurveda doctors across all 14 Kerala districts.' },
  { href: '/doctor-match',  icon: Sparkles,       title: 'AI Doctor Match',      color: 'bg-amber-50 text-amber-700',     desc: '30-second quiz → ranked specialists matched to your concern, language, budget.' },
  { href: '/conditions',    icon: BookOpen,       title: 'Conditions Library',   color: 'bg-teal-50 text-teal-700',       desc: 'Ayurvedic treatment guides for PCOS, arthritis, diabetes, migraine, IBS, and more.' },
  { href: '/qa',            icon: MessageSquare,  title: 'Ayurveda Q&A',         color: 'bg-blue-50 text-blue-700',       desc: 'Free anonymous patient Q&A answered by verified doctors within 48 hours.' },
  { href: '/formulary',     icon: Leaf,           title: 'Ayurveda Formulary',   color: 'bg-emerald-50 text-emerald-700', desc: 'Classical compound medicines reference — Yogaraj Guggulu, Triphala, and more.' },
  { href: '/hospitals',     icon: Building2,      title: 'Hospitals',            color: 'bg-blue-50 text-blue-700',       desc: 'Govt + private + Panchakarma centres + AYUSH-certified.' },
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

type DoctorWithMeta = DoctorCardData

async function getPlatformStats(): Promise<{ doctors: number; herbs: number; resources: number; licensing: number }> {
  // Best-effort counts. Each request degrades independently — the section
  // hides itself if all fail.
  async function count(path: string, key: string): Promise<number> {
    try {
      const r = await fetch(`${API}${path}`, { next: { revalidate: 3600 } })
      if (!r.ok) return 0
      const d = await r.json() as Record<string, unknown>
      // Our API returns { doctors: [...], pagination: { total: N } } —
      // read pagination.total first, then top-level total/count, then
      // fall back to the returned-array length (only correct when limit
      // is unbounded).
      const pag = d.pagination as { total?: unknown } | undefined
      return typeof pag?.total === 'number' ? pag.total
           : typeof d.total === 'number' ? d.total
           : typeof d.count === 'number' ? d.count
           : Array.isArray(d[key]) ? (d[key] as unknown[]).length : 0
    } catch { return 0 }
  }
  const [doctors, herbs] = await Promise.all([
    count('/doctors?limit=1', 'doctors'),
    count('/herbs?limit=1', 'herbs'),
  ])
  // Study resources + licensing are static content — hard-coded because
  // they're admin-authored surfaces without a runtime count endpoint.
  return { doctors, herbs, resources: 155, licensing: 10 }
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

// Homepage-specific metadata — tighter than the site-wide layout 'all' keyword
// dump. These are the priority-1 phrases we want this URL to rank for.
// meta keywords removed (Task 11) — Google + Bing have ignored them since 2009;
// the ~1500-char dump bloats HTML for zero ranking value. Title + description +
// canonical are what matters here.
export const metadata = {
  title: "AyurConnect — Verified Ayurveda Doctors Online | Kerala + UAE",
  description: "Kerala's free Ayurveda platform — verified doctors, 145+ herbs, 100+ formulations, BAMS study resources, Ayurveda jobs, and DHA/MOH licensing guides. Free for all.",
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [featuredDoctors, stats] = await Promise.all([getFeaturedDoctors(), getPlatformStats()])
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
      <EarlyAccessBanner />

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

      {/* Real-number social proof — 145+ herbs + 155 study resources genuinely stand up. */}
      {(stats.doctors > 0 || stats.herbs > 0) && (
        <section className="border-y border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-xs uppercase tracking-wider text-gray-500 mb-4">AyurConnect in Numbers</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {[
                { n: stats.doctors,   label: 'Verified Doctors',  sub: 'and growing weekly' },
                { n: stats.herbs,     label: 'Medicinal Herbs',   sub: 'from classical texts' },
                { n: stats.resources, label: 'Study Resources',   sub: 'BAMS notes + MCQs + papers' },
                { n: stats.licensing, label: 'Licensing Guides',  sub: 'DHA, MOH, CNHC + more' },
              ].map((s) => (
                <div key={s.label} className="text-center px-2 py-3 border-l border-gray-100 first:border-l-0">
                  <p className="font-serif text-3xl text-kerala-700 leading-none">{s.n}{s.n > 50 && <span className="text-xl">+</span>}</p>
                  <p className="text-sm text-ink font-semibold mt-1">{s.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Searches — internal-linking boost to GSC-targeting landing pages. */}
      <section className="bg-cream border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs uppercase tracking-wider text-gray-500 mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <Link href="/ayurveda-hospitals-dubai"    className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🏥 Ayurveda Hospitals in Dubai</Link>
            <Link href="/best-ayurveda-doctors-kerala" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">👨‍⚕️ Best Doctors in Kerala</Link>
            <Link href="/ayurveda-hospitals-kerala"   className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🏥 Kerala Hospitals</Link>
            <Link href="/interaction-checker"          className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">⚗️ Herb Interaction Checker</Link>
            <Link href="/formulary"                    className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">📖 Classical Formulary</Link>
            <Link href="/amai"                         className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🤝 AMAI</Link>
            <Link href="/bams"                         className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">🎓 BAMS Guide</Link>
            <Link href="/ayurveda-back-pain-treatment" className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">💆 Back Pain</Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Practitioners" title="Featured Doctors" subtitle="Real doctors, verified credentials." />
        {featuredDoctors.length === 0 ? (
          <p className="text-center text-muted">No doctors available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.slice(0, 4).map((d) => <DoctorCard key={d.id} doctor={d} />)}
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
          <SectionHeader eyebrow="Platform" title="What You Can Do on AyurConnect" subtitle="Doctors, herbs, treatments, and more — all verified." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((svc, idx) => {
              const Icon = svc.icon
              const featured = idx < 2
              return (
                <Link
                  key={svc.href}
                  href={svc.href}
                  className={`group p-6 rounded-card border border-gray-100 bg-white hover:border-kerala-200 transition-colors duration-200 ${featured ? 'md:col-span-2' : ''}`}
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

      {/* Treatments + Health Tips sections removed from homepage — content lives at /panchakarma, /treatments, /health-tips. */}

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
            Talk to an Ayurveda Doctor
          </h2>
          <p className="text-white/75 mt-4 text-lg max-w-xl mx-auto">
            Free to join. Verified doctors. No middlemen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/doctors" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md shadow-[0_8px_30px_-6px_rgba(217,119,6,0.5)] transition-all">
              Find a Doctor <ArrowRight className="w-4 h-4" />
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
