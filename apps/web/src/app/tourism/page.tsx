import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Plane, MapPin, Clock, IndianRupee, ShieldCheck } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'
import { FaqAccordion } from '../../components/seo/FaqAccordion'

type Pkg = {
  id: string
  title: string
  description: string
  duration: number
  price: number | null
  location: string
  includes: string | null
}

async function fetchPackages(): Promise<Pkg[]> {
  try {
    const res = await fetch(`${API}/tourism/packages?limit=50`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { packages: Pkg[] }
    return data.packages ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Kerala Medical Tourism — Authentic Panchakarma Packages',
  description: "Heal in God's Own Country. Classical Panchakarma rejuvenation, joint healing, stress relief, and Karkidaka Chikitsa packages with verified Kerala practitioners.",
  alternates: { canonical: '/tourism' },
  keywords: Array.from(new Set([
    ...AYURVEDA_KEYWORDS.treatments,
    ...AYURVEDA_KEYWORDS.wellness,
    'kerala ayurveda tourism', 'kerala panchakarma packages', 'ayurveda retreat kerala',
    'authentic kerala panchakarma', 'medical tourism kerala', 'ayurveda wellness retreat',
    'ayurvedic spa kerala', 'panchakarma resort kerala', 'ayurvedic detox kerala',
    'karkidaka chikitsa', 'monsoon ayurveda kerala', 'ayurveda for foreigners',
    'panchakarma packages in kerala for foreigners', 'classical ayurveda treatment kerala for UAE patients',
    'ayurveda holiday kerala', 'wellness retreat india', 'detox retreat kerala',
    'AyurConnect', 'AyurConnect Kerala', 'verified ayurvedic doctors',
  ])),
}

export default async function TourismPage() {
  const packages = await fetchPackages()

  return (
    <>
      <GradientHero variant="tourism" size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            🌿 Heal in God&apos;s Own Country
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Kerala Panchakarma <span className="text-gold-400">Packages</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Authentic classical Ayurveda for international and domestic patients.
            verified doctors, AYUSH-certified centres, full board.
          </p>
        </div>
      </GradientHero>

      {/* Heal-in-Kerala international hub cross-link */}
      <section className="container mx-auto px-4 pt-8 max-w-4xl">
        <Link href="/heal-in-kerala" className="block bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
          <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">For international visitors</p>
          <p className="font-serif text-lg text-ink mt-1">Planning from UAE, UK, USA or 12 other countries? <span className="text-kerala-700">→ Country-specific visa + cost guide</span></p>
        </Link>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl text-kerala-700 text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { n: '1', t: 'Free pre-consultation', d: 'Video call with a CCIM doctor — pick the right protocol for your condition.' },
            { n: '2', t: 'Customised package',     d: 'Centre + doctor + duration + diet plan — all tailored to your prakriti and budget.' },
            { n: '3', t: 'Travel & arrival',        d: 'We help with visa letter, airport pickup, accommodation arrangements.' },
            { n: '4', t: 'Heal & transform',        d: 'Daily treatments, sattvic meals, yoga. Most patients see meaningful change in 7-21 days.' },
          ].map((s) => (
            <div key={s.n} className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
              <div className="w-10 h-10 rounded-full bg-kerala-600 text-white font-serif text-xl flex items-center justify-center mb-3">{s.n}</div>
              <h3 className="font-semibold text-ink">{s.t}</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="container mx-auto px-4 pb-14">
        <h2 className="text-2xl md:text-3xl text-kerala-700 text-center mb-2">Featured packages</h2>
        <p className="text-center text-muted mb-8">{packages.length} packages from verified centres across Kerala</p>

        {packages.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <Plane className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-muted">No packages listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {packages.map((p) => (
              <article key={p.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow overflow-hidden flex flex-col">
                <div className="bg-hero-tourism text-white p-5">
                  <h3 className="font-serif text-2xl">{p.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-sm text-white/80">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.duration} days</span>
                    {p.price && <span className="flex items-center gap-1 text-gold-300 font-semibold"><IndianRupee className="w-3.5 h-3.5" /> {p.price.toLocaleString()}</span>}
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.location}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-gray-700 leading-relaxed">{p.description}</p>
                  {p.includes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Includes</div>
                      <p className="text-xs text-gray-700">{p.includes}</p>
                    </div>
                  )}
                  <Link
                    href="/sign-in"
                    className="mt-auto pt-4 inline-flex items-center justify-center px-4 py-2 bg-gold-500 text-white text-sm font-semibold rounded-md hover:bg-gold-600"
                  >
                    Enquire / Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '200+', label: 'International patients / year' },
            { num: '15+',  label: 'Countries' },
            { num: '100%', label: 'AYUSH certified' },
            { num: '4.9★', label: 'Average rating' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl text-kerala-700">{s.num}</div>
              <div className="text-sm text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Kerala */}
      <section className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: ShieldCheck, t: 'verified doctors', d: 'Every consulting practitioner cross-checked against the Central Council of Indian Medicine register.' },
          { icon: Plane,        t: 'Visa letter assistance', d: 'We provide medical-tourism invitation letters needed for AYUSH-visa applications.' },
          { icon: MapPin,       t: 'UNESCO biodiversity',    d: "Western Ghats — one of the world's 8 hottest biodiversity hotspots, source of every classical herb." },
        ].map((w) => {
          const Icon = w.icon
          return (
            <div key={w.t} className="p-6 bg-white rounded-card border border-gray-100 shadow-card">
              <span className="w-10 h-10 rounded-lg bg-kerala-50 text-kerala-700 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="font-semibold text-ink">{w.t}</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{w.d}</p>
            </div>
          )
        })}
      </section>

      <FaqAccordion
        heading="Kerala Ayurveda retreats — frequently asked"
        items={[
          { q: 'When is the best season for Panchakarma in Kerala?',
            a: 'The classical window is Karkidaka (mid-July to mid-August). The monsoon climate keeps body pores open so medicated oils absorb deeper and Vata disorders respond faster. If monsoon is uncomfortable, mid-October to February is a valid alternative window — slightly slower outcomes but the treatment is fully effective.' },
          { q: 'How many days do I need to fly from UAE for a meaningful course?',
            a: 'A 14-day Panchakarma is the minimum for therapeutic benefit. 21 days is the classical full-course recommendation — enough for proper Snehana (oleation) + Swedana (sudation) + the main purification action + Samsarjana Krama (post-treatment dietary reintroduction). 7-day packages are wellness retreats, not Panchakarma.' },
          { q: 'Is the treatment Halal-friendly for GCC visitors?',
            a: 'Major medical-tourism hospitals (Somatheeram, CGH Earth Kalari Kovilakom, Kairali, Vaidyaratnam) offer Halal-certified vegetarian Ayurvedic kitchens. Confirm with the specific hospital in advance — and request a vegetarian-only kitchen if needed, since some classical formulations use animal-derived ghee.' },
          { q: 'Will UAE travel insurance cover Ayurveda treatment in Kerala?',
            a: 'Most international travel insurance does NOT cover Ayurveda. Niva Bupa and Star Health offer Ayurveda riders for UAE residents — verify your policy includes the specific hospital and procedure before travel.' },
          { q: 'What kind of doctor will I see — BAMS, MD-Ayurveda, or a chief physician?',
            a: 'AyurConnect-listed medical-tourism packages always include initial + mid-course + discharge consultations with the senior MD-Ayurveda physician. Daily therapy is delivered by trained Panchakarma technicians under physician supervision. Verify the senior physician\'s CCIM registration on their profile before booking.' },
        ]}
      />
    </>
  )
}
