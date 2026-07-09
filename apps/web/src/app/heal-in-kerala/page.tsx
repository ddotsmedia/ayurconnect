import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MapPin, ChevronRight, Calendar, Stethoscope, Plane, ShieldCheck, BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import { breadcrumbLd, faqLd, ldGraph, pageMetadata } from '../../lib/seo'
import { EnquiryForm } from './_enquiry-form'
import { HEAL_COUNTRIES } from './_countries'
import { Breadcrumbs } from '../../components/Breadcrumbs'

export const metadata: Metadata = pageMetadata({
  path: '/heal-in-kerala',
  title:       'Ayurvedic Treatment in Kerala — International Patient Guide',
  description: 'Plan authentic Ayurvedic treatment in Kerala from 15+ countries. Verified centres, classical Panchakarma + Pizhichil + Sirodhara, e-Ayush visa guidance, cost ranges, logistics. Built for the diaspora.',
  keywords: ['ayurveda treatment kerala', 'panchakarma retreat kerala', 'medical tourism kerala', 'e-ayush visa', 'monsoon ayurveda kerala', 'heal in kerala', 'authentic kerala ayurveda'],
})

const TREATMENTS = [
  { slug: 'panchakarma',      name: 'Panchakarma',                       sanskrit: 'पञ्चकर्म',    duration: '14–28 days', priceFrom: 'AED 4,200', note: 'Full 5-action classical purification — Vamana, Virechana, Basti, Nasya, Raktamokshana.' },
  { slug: 'pizhichil',        name: 'Pizhichil',                         sanskrit: 'पिषिच्छिल',  duration: '7–21 days',  priceFrom: 'AED 2,800', note: 'Warm medicated oil bath therapy — Kerala specialty for Vata + Pitta disorders, arthritis, neurology.' },
  { slug: 'njavarakizhi',     name: 'Njavarakizhi',                      sanskrit: 'षष्टिक पिण्ड स्वेद', duration: '7–14 days', priceFrom: 'AED 2,200', note: 'Medicated rice-bolus fomentation — muscle/joint strengthening, rejuvenation.' },
  { slug: 'sirodhara',        name: 'Sirodhara',                         sanskrit: 'शिरोधारा',   duration: '7–14 days',  priceFrom: 'AED 1,500', note: 'Continuous warm-oil stream over the forehead — stress, insomnia, anxiety, migraines.' },
  { slug: 'karkidaka-chikitsa', name: 'Karkidaka Chikitsa',              sanskrit: 'कर्किटक चिकित्सा', duration: '14–28 days', priceFrom: 'AED 3,800', note: 'Classical monsoon rejuvenation (mid-July–August) — body absorbs medicated oils best in monsoon humidity.' },
  { slug: 'rasayana',         name: 'Rasayana (Rejuvenation)',          sanskrit: 'रसायन',       duration: '14–28 days', priceFrom: 'AED 3,500', note: 'Anti-aging + immune-building Rasayana protocols, classical Brimhana season (Nov–Feb).' },
]

const HOW = [
  { n: 1, title: 'Choose treatment + centre',   body: 'Tell us your condition or goal. We match you with verified, classified Kerala centres + the right classical protocol.' },
  { n: 2, title: 'Book a teleconsult',          body: 'A BAMS or MD-Ayurveda physician reviews your case online, confirms the protocol, and writes your pre-travel preparation plan.' },
  { n: 3, title: 'Travel + heal in Kerala',     body: 'Visa guidance + airport-to-centre logistics + on-arrival physician examination. Full residential 14–28 day course.' },
  { n: 4, title: 'Post-treatment follow-up',    body: 'Tele-follow-up at 4, 12, and 24 weeks from home. Authentic-medicine shipping to your country for ongoing Rasayana.' },
]

const WHY = [
  { icon: MapPin,    title: 'Birthplace of Ayurveda',  body: 'Kerala is the unbroken 3,000-year-old home of classical Ayurveda — Ashtavaidya lineages, Sahasrayogam, Chikitsamanjari traditions still practised.' },
  { icon: ShieldCheck, title: 'Verified + classified', body: 'Every centre on AyurConnect is cross-checked: Kerala Tourism Diamond/Gold/Silver classification + state register + CCIM-verified physicians.' },
  { icon: Calendar,  title: 'Karkidaka monsoon window', body: 'Mid-July to mid-August — the classical rejuvenation season unique to Kerala. Body absorbs oils deepest in monsoon humidity.' },
  { icon: BookOpen,  title: 'Classical lineages',     body: 'Treatment under physicians trained in the Ashtavaidya tradition + at Government Ayurveda Colleges (KUHS / NCISM accredited).' },
]

const FAQ = [
  { q: 'Is Ayurveda safe to combine with my existing prescription medications?',
    a: 'Most Ayurvedic herbs are safe alongside allopathic drugs, but several have clinically documented interactions (Ashwagandha + thyroxine, Curcumin + warfarin, Yashtimadhu + antihypertensives, Triphala + thyroxine). Our pre-travel teleconsultation always includes an interaction review, and you can check pairs yourself at /interaction-checker.' },
  { q: 'How long should I stay in Kerala for an effective course?',
    a: '14 days is the working minimum for any classical Panchakarma — enough time for Snehana (oleation) + Swedana (sudation) + the main purification + Samsarjana Krama (post-treatment dietary reintroduction). 21 days is the classical full course. 7-day stays are wellness retreats, not Panchakarma.' },
  { q: 'What visa do I need?',
    a: 'The e-Ayush Visa (launched July 2023) is the dedicated visa for AYUSH treatments — 60 or 120-day duration, multi-entry. e-Tourist Visa works for shorter wellness visits. e-Medical Visa covers surgical or complex medical care. Your country-specific page lists exact fees + processing times.' },
  { q: 'Can I combine treatment with tourism?',
    a: 'Yes — but only after the residential course concludes. Most centres recommend not travelling mid-course (cumulative oleation + sudation needs an undisturbed environment). Many GCC visitors do 14 days of treatment + 5 days of backwater/hill-station tourism after.' },
  { q: 'Will my health insurance cover this?',
    a: 'Most international health insurance does NOT cover Ayurveda treatment abroad. UAE: Niva Bupa + Star Health offer Ayurveda riders. UK: most insurers don\'t cover; some specialist wellness travel insurers do. US: HSA/FSA usually cannot be used. We\'re honest about this so you can budget accordingly.' },
  { q: 'What should I bring?',
    a: 'Original passport + visa printout + medical records + current prescription list + 30 days\' supply of any prescription medications in original packaging. Light cottons (Kerala is tropical 25–32°C), modest cover-ups for temple visits, light raincoat if travelling Jun–Aug.' },
  { q: 'What is the best season for treatment?',
    a: 'October–March is the dry-comfort window. Mid-July to mid-August is Karkidaka — the classical monsoon rejuvenation window, the most therapeutically potent season. Mar–May is the hottest pre-monsoon period — generally avoided.' },
]

export default function HealHubPage() {
  const ld = ldGraph(
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Heal in Kerala — International Patient Guide',
      url: 'https://ayurconnect.com/heal-in-kerala',
      audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      about: { '@type': 'MedicalSpecialty', name: 'Ayurveda' },
    },
    faqLd(FAQ),
    breadcrumbLd([
      { name: 'Home',                       url: '/' },
      { name: 'Heal in Kerala',             url: '/heal-in-kerala' },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Plane className="w-3 h-3" /> International patient guide
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">Authentic Ayurveda in Kerala</h1>
          <p className="mt-5 text-lg text-white/85">
            Your complete guide to Ayurvedic treatment abroad — verified centres, classical Panchakarma,
            e-Ayush visa, logistics, costs. Built for the diaspora and international wellness traveller.
          </p>
        </div>
      </GradientHero>

      <Breadcrumbs items={[{ label: 'Heal in Kerala' }]} />

      {/* (a) Why Kerala */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">Why Kerala</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WHY.map((w) => (
            <article key={w.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <w.icon className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-serif text-lg text-ink">{w.title}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{w.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* (b) How it works */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-8 text-center">How it works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {HOW.map((s) => (
              <li key={s.n} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="w-9 h-9 bg-kerala-700 text-white rounded-full flex items-center justify-center font-bold mb-3">{s.n}</div>
                <h3 className="font-serif text-base text-ink leading-tight">{s.title}</h3>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* (c) Popular treatments */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2 text-center inline-flex items-center justify-center gap-2 w-full">
          <Sparkles className="w-6 h-6 text-kerala-700" /> Popular treatments
        </h2>
        <p className="text-sm text-muted text-center mb-8">Approximate price ranges per treatment course — confirm at booking; varies by centre + classification tier.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TREATMENTS.map((t) => (
            <article key={t.slug} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <h3 className="font-serif text-lg text-ink">{t.name}</h3>
              <p className="text-[11px] text-gray-400 font-serif">{t.sanskrit}</p>
              <p className="text-xs text-gray-600 mt-1">{t.duration} · from {t.priceFrom}</p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{t.note}</p>
              <Link href={`/treatments/${t.slug.replace('karkidaka-chikitsa', 'panchakarma')}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-kerala-700 hover:underline">
                Learn more <ArrowRight className="w-3 h-3" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/cost-estimator" className="inline-flex items-center gap-1 px-5 py-2 border border-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-50">
            Detailed cost estimator <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* (d) Verified centres */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2 text-center inline-flex items-center justify-center gap-2 w-full">
            <ShieldCheck className="w-6 h-6 text-kerala-700" /> Verified centres
          </h2>
          <p className="text-sm text-muted text-center mb-8">Kerala Tourism classified · State-registered physicians · CCIM-verified credentials.</p>
          <div className="text-center">
            <Link href="/hospitals?verified=true" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
              Browse verified centres <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* (e) Country selector */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2 text-center inline-flex items-center justify-center gap-2 w-full">
          <Plane className="w-6 h-6 text-kerala-700" /> Visiting from
        </h2>
        <p className="text-sm text-muted text-center mb-8">Country-specific visa, flights, cost-in-local-currency, language, insurance.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {HEAL_COUNTRIES.filter((c) => c.complete).map((c) => (
            <Link key={c.slug} href={`/heal-in-kerala/${c.slug}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg text-center">
              <div className="text-3xl">{c.flag}</div>
              <p className="text-xs font-semibold text-ink mt-1">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* (f) FAQ */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">Frequently asked</h2>
          <ul className="space-y-2">
            {FAQ.map((f) => (
              <li key={f.q}>
                <details className="group bg-white border border-gray-100 rounded-card shadow-card open:shadow-cardLg">
                  <summary className="cursor-pointer list-none px-5 py-3 flex items-start justify-between gap-3 font-semibold text-ink">
                    <span>{f.q}</span>
                    <span className="text-kerala-700 group-open:rotate-45 transition-transform text-xl leading-none mt-0.5">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed">{f.a}</div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* (g) Enquiry CTA */}
      <section id="enquiry" className="container mx-auto px-4 py-14 max-w-2xl">
        <EnquiryForm />
        <p className="mt-6 text-center text-xs text-gray-500">
          You can also <Link href="/doctors" className="text-kerala-700 hover:underline">browse verified doctors</Link>, see <Link href="/tourism" className="text-kerala-700 hover:underline">resort-style retreats</Link>, or check the <Link href="/cost-estimator" className="text-kerala-700 hover:underline">detailed cost estimator</Link>.
        </p>
      </section>

      {/* Compliance footnote */}
      <section className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex items-start gap-3">
          <Stethoscope className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Important.</strong> AyurConnect is an educational platform + verified directory; we do not directly prescribe or perform treatment. All clinical care is provided by the listed centre + its registered physicians.
            Visa requirements + fees may change — verify on the official Indian visa portal before applying.
            Health insurance coverage information is general guidance — confirm with your insurer.
          </div>
        </div>
      </section>
    </>
  )
}
