import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ArrowLeft, Plane, ShieldCheck, Languages, CreditCard, Calendar, Briefcase, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react'
import { breadcrumbLd, faqLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { EnquiryForm } from '../_enquiry-form'
import { HEAL_COUNTRIES, HEAL_COUNTRY_BY_SLUG } from '../_countries'

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return HEAL_COUNTRIES.map((c) => ({ country: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params
  const c = HEAL_COUNTRY_BY_SLUG.get(country)
  if (!c) return { title: 'Not found', robots: { index: false, follow: false } }
  const meta = pageMetadata({
    path:        `/heal-in-kerala/${c.slug}`,
    title:       `Ayurvedic Treatment in Kerala from ${c.name} — Visa, Cost & Guide`,
    description: `Plan Ayurvedic treatment in Kerala from ${c.name}. e-Ayush + e-Tourist visa guidance, direct flights, treatment cost in ${c.currency}, insurance + language notes, best season. Verified Kerala centres.`,
    keywords:    [`ayurveda treatment kerala from ${c.name.toLowerCase()}`, `kerala ayurveda ${c.name.toLowerCase()}`, `e-ayush visa ${c.name.toLowerCase()}`, `panchakarma kerala ${c.code.toLowerCase()}`, c.region === 'gcc' ? 'gcc medical tourism kerala' : 'international medical tourism kerala'],
  })
  // Data-gate: incomplete country entries are noindex'd until the editorial team fills them in.
  if (!c.complete) meta.robots = { index: false, follow: true, googleBot: { index: false, follow: true } }
  return meta
}

export default async function CountryHealPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const c = HEAL_COUNTRY_BY_SLUG.get(country)
  if (!c) notFound()

  const otherCountries = HEAL_COUNTRIES.filter((x) => x.slug !== c.slug && x.complete).slice(0, 8)

  const ld = ldGraph(
    {
      '@context': 'https://schema.org',
      '@type':    'MedicalWebPage',
      name:       `Ayurvedic Treatment in Kerala from ${c.name}`,
      url:        `https://ayurconnect.com/heal-in-kerala/${c.slug}`,
      audience:   { '@type': 'MedicalAudience', audienceType: 'Patient', geographicArea: { '@type': 'Country', name: c.name } },
      about:      { '@type': 'MedicalSpecialty', name: 'Ayurveda' },
    },
    faqLd([
      { q: `What visa do I need from ${c.name}?`,                a: c.visaTypes.map((v) => `${v.name} — ${v.eligibility} — ${v.durationDays} days${v.feeUsd ? ` (USD ${v.feeUsd})` : ''}.`).join(' ') },
      { q: `When is the best time to fly from ${c.name} to Kerala for treatment?`, a: c.bestMonths },
      { q: `Will my ${c.name} health insurance cover Ayurvedic treatment in Kerala?`, a: c.insuranceNote },
      { q: `What language is spoken at Kerala centres for ${c.name} patients?`,     a: c.languageNote },
    ]),
    breadcrumbLd([
      { name: 'Home',             url: '/' },
      { name: 'Heal in Kerala',   url: '/heal-in-kerala' },
      { name: c.name,             url: `/heal-in-kerala/${c.slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/heal-in-kerala" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> All countries
          </Link>
          <div className="text-5xl mb-3">{c.flag}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurvedic Treatment in Kerala for Visitors from {c.name}</h1>
          <p className="mt-5 text-lg text-white/85">
            Visa guidance · direct flights · cost in {c.currency} · insurance + language notes · best season. Built for {c.region === 'gcc' ? 'GCC' : c.region === 'europe' ? 'European' : c.region === 'americas' ? 'North American' : 'Asia-Pacific'} patients planning a residential Panchakarma course.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        {/* Visa */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-2 inline-flex items-center gap-2"><Briefcase className="w-6 h-6 text-kerala-700" /> Visa guidance</h2>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded p-2 mb-4 inline-flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5" /> Verify current requirements on the <a href="https://indianvisaonline.gov.in/evisa/tvoa.html" target="_blank" rel="noreferrer noopener" className="underline">official Indian visa portal</a> before applying — visa rules can change.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-cream text-left text-gray-700 text-xs uppercase tracking-wider">
                <tr><th className="px-3 py-2">Visa</th><th className="px-3 py-2">Duration</th><th className="px-3 py-2">Eligibility</th><th className="px-3 py-2">Fee (USD)</th><th className="px-3 py-2">Processing</th></tr>
              </thead>
              <tbody className="divide-y">
                {c.visaTypes.map((v) => (
                  <tr key={v.name}>
                    <td className="px-3 py-2 font-medium">{v.name}</td>
                    <td className="px-3 py-2 text-gray-700">{v.durationDays}</td>
                    <td className="px-3 py-2 text-gray-700">{v.eligibility}</td>
                    <td className="px-3 py-2 text-gray-700">{v.feeUsd ? `$${v.feeUsd}` : '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{v.processingDays ? `${v.processingDays} days` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.visaTypes.some((v) => v.notes) && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {c.visaTypes.filter((v) => v.notes).map((v) => <li key={v.name}><strong>{v.name}:</strong> {v.notes}</li>)}
            </ul>
          )}
        </article>

        {/* Travel logistics */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-3 inline-flex items-center gap-2"><Plane className="w-6 h-6 text-kerala-700" /> Travel logistics</h2>
          <p className="text-sm text-gray-700 mb-4">Kerala has 4 international airports — Kochi (COK), Trivandrum (TRV), Calicut (CCJ), and Kannur (CNN). Direct flights from {c.name} land mainly at COK + TRV.</p>
          <ul className="space-y-3">
            {c.majorAirports.map((a) => (
              <li key={a.code} className="bg-cream rounded p-3 border border-gray-100">
                <p className="font-semibold text-ink text-sm">{a.name} <span className="text-xs text-gray-400">({a.code})</span> {a.directToKerala ? <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 ml-1 bg-emerald-100 text-emerald-800 rounded">Direct</span> : <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 ml-1 bg-amber-100 text-amber-800 rounded">1 stop</span>}</p>
                {a.routesNote && <p className="text-xs text-gray-700 mt-1">{a.routesNote}</p>}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 mt-4 leading-relaxed">
            <strong>Airport → centre.</strong> Most classified Panchakarma centres arrange complimentary or paid pickup from the nearest airport. Typical drive times: COK→Kottayam 1h, COK→Thrissur 1h 30m, TRV→Kollam 1h 30m, CCJ→Wayanad 2h, CCJ→Kottakkal 1h. Confirm at booking.
          </p>
        </article>

        {/* Cost in local currency */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-3 inline-flex items-center gap-2"><CreditCard className="w-6 h-6 text-kerala-700" /> Cost in {c.currency} <span className="text-xs text-gray-400 font-normal">(approximate)</span></h2>
          <p className="text-xs text-gray-500 mb-4">Static conversion at 1 {c.currency} ≈ ₹{c.approxInrRate}. Exchange rates vary — confirm before quoting your booking.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <CostRow label="14-day Pizhichil course" inr={68_000}  rate={c.approxInrRate} symbol={c.currencySymbol} />
            <CostRow label="21-day full Panchakarma" inr={140_000} rate={c.approxInrRate} symbol={c.currencySymbol} />
            <CostRow label="28-day Karkidaka Chikitsa" inr={195_000} rate={c.approxInrRate} symbol={c.currencySymbol} />
            <CostRow label="Pre-travel teleconsult"  inr={2_500}  rate={c.approxInrRate} symbol={c.currencySymbol} />
          </div>
          <p className="text-xs text-gray-600 mt-4 leading-relaxed">{c.paymentNote}</p>
        </article>

        {/* Language */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-3 inline-flex items-center gap-2"><Languages className="w-6 h-6 text-kerala-700" /> Language & communication</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{c.languageNote}</p>
        </article>

        {/* Insurance + payment */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-3 inline-flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-kerala-700" /> Insurance + payment</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{c.insuranceNote}</p>
        </article>

        {/* Climate + season */}
        <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
          <h2 className="font-serif text-2xl text-ink mb-3 inline-flex items-center gap-2"><Calendar className="w-6 h-6 text-kerala-700" /> Climate + best season</h2>
          <p className="text-sm text-gray-700"><strong>Best months:</strong> {c.bestMonths}</p>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed"><strong>What to pack:</strong> {c.climatePackingNote}</p>
        </article>

        {/* Testimonials placeholder */}
        <article className="bg-cream border border-gray-100 rounded-card p-6 text-center">
          <MessageSquare className="w-8 h-8 text-kerala-700 mx-auto mb-2" />
          <h2 className="font-serif text-xl text-ink mb-2">Stories from {c.name} patients</h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mb-4">Real patient stories from {c.name} will appear here as they come in. If you&apos;ve done a course in Kerala, share your experience — anonymously if preferred.</p>
          <Link href="/contact?subject=patient-story" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">Share your experience <ChevronRight className="w-4 h-4" /></Link>
        </article>

        {/* Enquiry */}
        <section id="enquiry">
          <EnquiryForm defaultCountry={c.name} />
        </section>

        {/* Other countries */}
        <nav className="mt-6">
          <p className="text-xs text-gray-500 mb-2 text-center">Visiting from elsewhere?</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {otherCountries.map((o) => (
              <Link key={o.slug} href={`/heal-in-kerala/${o.slug}`} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:border-kerala-300 hover:text-kerala-700">
                {o.flag} {o.name}
              </Link>
            ))}
          </div>
        </nav>
      </section>
    </>
  )
}

function CostRow({ label, inr, rate, symbol }: { label: string; inr: number; rate: number; symbol: string }) {
  const local = Math.round(inr / rate)
  return (
    <div className="bg-cream rounded p-3 border border-gray-100 flex items-baseline justify-between gap-2">
      <span className="text-xs text-gray-700">{label}</span>
      <span className="text-sm font-semibold text-ink whitespace-nowrap">{symbol}{local.toLocaleString('en-GB')}<span className="text-[10px] text-gray-400 ml-1">≈ ₹{inr.toLocaleString('en-IN')}</span></span>
    </div>
  )
}
