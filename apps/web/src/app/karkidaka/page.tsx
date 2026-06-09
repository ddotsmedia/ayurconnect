import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Droplets, Leaf, Soup, CalendarDays, ChevronRight, ShieldCheck } from 'lucide-react'
import { breadcrumbLd, ldGraph, articleLd, faqLd, pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Karkidaka Chikitsa — Kerala\'s Sacred Monsoon Healing Season | AyurConnect',
  description:
    'Karkidaka Chikitsa (കർക്കിടക ചികിത്സ) — Kerala\'s monsoon rejuvenation season. Why the monsoon is ideal for Ayurveda, traditional Panchakarma & Rasayana protocols, the Karkidaka Kanji recipe (കർക്കിടക കഞ്ഞി), and verified centres for treatment.',
  path: '/karkidaka',
})

const FAQS = [
  {
    q: 'What is Karkidaka Chikitsa?',
    a: 'Karkidaka Chikitsa is the traditional Ayurvedic rejuvenation therapy practised in Kerala during the Malayalam month of Karkidakam (mid-July to mid-August), which coincides with the monsoon. It combines Panchakarma cleansing, Rasayana rejuvenation, special diet (Karkidaka Kanji) and rest to restore strength before the year ahead.',
  },
  {
    q: 'Why is the monsoon ideal for Ayurveda treatment?',
    a: 'During the monsoon the atmosphere is cool and moist, the body\'s pores and channels (srotas) open, and the skin becomes receptive to medicated oils. Dust and heat are low, so the body absorbs therapies more deeply and Panchakarma detoxification is most effective. Vata is naturally aggravated in this season, making it the right time to pacify it.',
  },
  {
    q: 'When exactly is Karkidakam?',
    a: 'Karkidakam is the last month of the Malayalam (Kollam) calendar, falling roughly between mid-July and mid-August each year. The exact dates shift slightly year to year with the lunar-solar calendar.',
  },
  {
    q: 'What is Karkidaka Kanji?',
    a: 'Karkidaka Kanji (കർക്കിടക കഞ്ഞി) is a medicated rice gruel cooked with Njavara rice, coconut milk and a blend of Ayurvedic herbs and spices (such as fenugreek, cumin, jeeraka, dashapushpam — the ten sacred herbs). Taken daily through Karkidakam, it boosts immunity, aids digestion and rejuvenates the body.',
  },
  {
    q: 'Who should consider Karkidaka treatment?',
    a: 'It is traditionally a preventive, strength-building therapy suitable for generally healthy adults seeking rejuvenation, as well as people with chronic Vata disorders such as joint pain. Anyone with a medical condition or who is pregnant should consult a verified Ayurveda doctor before beginning any protocol.',
  },
]

export default function KarkidakaPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Karkidaka Chikitsa', url: '/karkidaka' },
    ]),
    articleLd({
      id: 'karkidaka',
      title: 'Karkidaka Chikitsa — Kerala\'s Sacred Monsoon Healing Season',
      content:
        'Karkidaka Chikitsa is Kerala\'s monsoon rejuvenation season combining Panchakarma, Rasayana and the Karkidaka Kanji diet.',
      type: 'Article',
      urlPath: '/karkidaka',
      language: 'ml',
    }),
    faqLd(FAQS),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="tourism">
        <p className="text-gold-200 font-medium mb-2">കർക്കിടക ചികിത്സ</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 max-w-3xl">
          Karkidaka Chikitsa — Kerala's Sacred Monsoon Healing Season
        </h1>
        <p className="text-white/90 max-w-2xl text-lg">
          മഴക്കാലം ആയുർവേദ ചികിത്സയ്ക്ക് ഏറ്റവും അനുയോജ്യമായ കാലമാണ്. When the monsoon opens the
          body's channels, Kerala turns to Karkidaka Chikitsa — a month of Panchakarma, Rasayana and
          the medicated Karkidaka Kanji to rebuild strength for the year ahead.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="#enquire" className="bg-white text-kerala-800 font-semibold px-5 py-3 rounded-xl hover:bg-gold-50">
            Book a Karkidaka consultation
          </Link>
          <Link href="/heal-in-kerala" className="bg-white/15 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/25">
            International patients →
          </Link>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 space-y-12">
        {/* What is it */}
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-kerala-800 mb-3 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-kerala-600" /> എന്താണ് കർക്കിടക ചികിത്സ?
            </h2>
            <p className="text-gray-700 mb-3">
              കൊല്ലവർഷത്തിലെ അവസാന മാസമായ കർക്കിടകത്തിൽ (ജൂലൈ–ഓഗസ്റ്റ്) നടത്തുന്ന ആയുർവേദ പുനരുജ്ജീവന
              ചികിത്സയാണ് കർക്കിടക ചികിത്സ. Karkidaka Chikitsa is the rejuvenation therapy practised in
              the Malayalam month of Karkidakam (mid-July to mid-August) — the peak of the monsoon.
            </p>
            <p className="text-gray-700">
              It is the most auspicious window in the Kerala Ayurvedic calendar for detoxification
              and Rasayana, traditionally undertaken to restore the strength depleted over the year.
            </p>
          </div>
          <div className="rounded-2xl bg-kerala-50 p-6">
            <h2 className="font-serif text-2xl text-kerala-800 mb-3 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-kerala-600" /> Why the monsoon?
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Cool, moist air opens the body's channels (srotas) and pores.</li>
              <li>• Skin becomes receptive, so medicated oils penetrate deeply.</li>
              <li>• Low heat and dust make Panchakarma detoxification most effective.</li>
              <li>• Vata, naturally aggravated in the rains, is best pacified now.</li>
            </ul>
          </div>
        </div>

        {/* Protocols */}
        <div>
          <h2 className="font-serif text-2xl text-kerala-800 mb-4 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-kerala-600" /> Traditional protocols
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
              <h3 className="font-semibold text-lg text-gray-900">പഞ്ചകർമ്മം · Panchakarma</h3>
              <p className="text-gray-700 mt-1 text-sm">
                Cleansing therapies — Snehana (oleation), Swedana (sudation), and shodhana procedures
                tailored to the individual to expel accumulated doshas.
              </p>
            </div>
            <div className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
              <h3 className="font-semibold text-lg text-gray-900">രസായനം · Rasayana</h3>
              <p className="text-gray-700 mt-1 text-sm">
                Rejuvenation with Rasayana formulations and Njavarakizhi (medicated rice-bolus
                massage) to rebuild tissue (dhatu) strength and immunity.
              </p>
            </div>
            <div className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
              <h3 className="font-semibold text-lg text-gray-900">ദിനചര്യ · Regimen</h3>
              <p className="text-gray-700 mt-1 text-sm">
                Rest, light diet, the daily Karkidaka Kanji, reading of the Ramayana (Ramayana
                Masam), and avoidance of heavy exertion through the month.
              </p>
            </div>
          </div>
        </div>

        {/* Kanji recipe */}
        <div className="rounded-2xl bg-gold-50 p-6">
          <h2 className="font-serif text-2xl text-kerala-800 mb-3 flex items-center gap-2">
            <Soup className="w-6 h-6 text-kerala-600" /> കർക്കിടക കഞ്ഞി · Karkidaka Kanji
          </h2>
          <p className="text-gray-700 mb-4">
            ഔഷധഗുണമുള്ള ഈ കഞ്ഞി കർക്കിടക മാസത്തിൽ ദിവസേന കഴിക്കുന്നത് രോഗപ്രതിരോധശേഷി വർദ്ധിപ്പിക്കുന്നു.
            A medicated rice gruel taken daily through Karkidakam to boost immunity and digestion.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">ചേരുവകൾ · Ingredients</p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-0.5">
                <li>നവര അരി (Njavara / red rice) — 1 cup</li>
                <li>തേങ്ങാപ്പാൽ (coconut milk) — 1 cup</li>
                <li>ഉലുവ (fenugreek), ജീരകം (cumin), ചുക്ക് (dry ginger)</li>
                <li>ദശപുഷ്പം (the ten sacred herbs) — a handful</li>
                <li>കറുപ്പട്ടി / ശർക്കര (jaggery) and a pinch of salt to taste</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">തയ്യാറാക്കുന്ന വിധം · Method</p>
              <ol className="list-decimal list-inside text-gray-700 text-sm space-y-0.5">
                <li>Roast and coarsely grind the herb-spice mix; tie in a cloth or boil as a decoction.</li>
                <li>Cook the Njavara rice with the decoction until soft and porridge-like.</li>
                <li>Add coconut milk and jaggery; simmer gently — do not boil hard.</li>
                <li>Serve warm, once daily (traditionally at night), through Karkidakam.</li>
              </ol>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Recipe varies by family and vaidya; a verified Ayurveda doctor can tailor the herb blend to your prakriti.
          </p>
        </div>

        {/* Centres + cross-links */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
            <h2 className="font-serif text-2xl text-kerala-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-kerala-600" /> Best centres for Karkidaka
            </h2>
            <p className="text-gray-700 mb-3">
              Choose a classified centre with verification badges for authentic, supervised
              Karkidaka treatment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/hospitals" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
                Verified centres <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/doctors" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
                Find a doctor <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-kerala-100 bg-white p-6 shadow-card">
            <h2 className="font-serif text-2xl text-kerala-800 mb-3">Related</h2>
            <ul className="space-y-2 text-kerala-700">
              <li><Link href="/treatments" className="hover:underline inline-flex items-center gap-1">Specialised treatments <ChevronRight className="w-4 h-4" /></Link></li>
              <li><Link href="/conditions" className="hover:underline inline-flex items-center gap-1">Conditions treated <ChevronRight className="w-4 h-4" /></Link></li>
              <li><Link href="/heal-in-kerala" className="hover:underline inline-flex items-center gap-1">Heal in Kerala (international) <ChevronRight className="w-4 h-4" /></Link></li>
              <li><Link href="/heritage" className="hover:underline inline-flex items-center gap-1">Heritage & culture <ChevronRight className="w-4 h-4" /></Link></li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div id="enquire">
          <h2 className="font-serif text-2xl text-kerala-800 mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="rounded-xl border border-kerala-100 bg-white p-4 group">
                <summary className="font-semibold text-gray-900 cursor-pointer faq-question">{f.q}</summary>
                <p className="text-gray-700 mt-2 faq-answer">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-kerala-700 text-white p-6 text-center">
            <p className="font-serif text-xl mb-2">Plan your Karkidaka treatment</p>
            <p className="text-white/85 mb-4">Book a consultation with a verified Kerala Ayurveda doctor.</p>
            <Link href="/consult" className="inline-block bg-white text-kerala-800 font-semibold px-6 py-3 rounded-xl hover:bg-gold-50">
              Start a consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
