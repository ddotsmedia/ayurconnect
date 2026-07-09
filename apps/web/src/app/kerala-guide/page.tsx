import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MapPin, Calendar, Stethoscope, Plane, Hospital, Sun, Droplets, ChevronRight, AlertCircle } from 'lucide-react'
import { breadcrumbLd, ldGraph } from '../../lib/seo'

export const metadata: Metadata = {
  title: 'Kerala Ayurveda Guide — Districts, Hospitals, Best Season',
  description: 'Complete Kerala Ayurveda guide: famous institutions in all 14 districts, when to visit (Karkidaka — July/August), top 10 classical hospitals, and travel tips for UAE + GCC visitors.',
  alternates: { canonical: '/kerala-guide' },
}

type DistrictEntry = { name: string; famousFor: string; notableInstitutions: string[]; bestFor: string[] }
const DISTRICTS: DistrictEntry[] = [
  { name: 'Thiruvananthapuram', famousFor: 'Government Ayurveda College (est. 1889) — Kerala\'s oldest BAMS institution',
    notableInstitutions: ['Government Ayurveda College, Pulayanarkotta', 'Sreedhareeyam Eye Hospital (branch)', 'Soukhyam Ayurveda'],
    bestFor: ['Academic medicine', 'Shalakya (eye / ENT)', 'Manasika (mental health)'] },
  { name: 'Kollam', famousFor: 'Coastal Ayurveda heritage; backwater Panchakarma resorts',
    notableInstitutions: ['Santhigiri Ayurveda', 'Amritapuri Ayurveda', 'AVN Arogya Ayurvedic Hospital'],
    bestFor: ['Panchakarma rejuvenation', 'Karkidaka Chikitsa', 'Stress-related conditions'] },
  { name: 'Pathanamthitta', famousFor: 'Sabarimala-pilgrim Ayurveda traditions; clean, low-pollution geography',
    notableInstitutions: ['Sreesankara Ayurveda Hospital', 'Vaidyaratnam Oushadhasala (branch)'],
    bestFor: ['Detoxification', 'Joint disorders'] },
  { name: 'Alappuzha', famousFor: 'Premier medical-tourism Panchakarma resorts along the backwaters',
    notableInstitutions: ['Somatheeram Ayurveda Resort (est. 1985 — first such resort in India)', 'Kairali Ayurvedic Health Resort', 'Manaltheeram'],
    bestFor: ['Medical tourism', 'Panchakarma retreats', 'Weight management'] },
  { name: 'Kottayam', famousFor: 'Strong classical lineages; rubber-belt geography', notableInstitutions: ['Vaidyaratnam Ayurveda Hospital', 'AyurVAID Hospitals (branch)'],
    bestFor: ['Internal medicine', 'Lifestyle disorders'] },
  { name: 'Idukki', famousFor: 'Hill-station altitude; cardamom + medicinal-plant biodiversity', notableInstitutions: ['Kerala Forest Research Institute Ayurveda Garden (Munnar)', 'AyurMana Idukki'],
    bestFor: ['Respiratory conditions', 'Convalescence retreats'] },
  { name: 'Ernakulam', famousFor: 'Commercial capital with the densest cluster of Ayurveda clinics in Kerala',
    notableInstitutions: ['Punarnava Ayurveda Hospital', 'CGH Earth Ayurveda', 'AyurVAID Hospitals (head office)'],
    bestFor: ['Urban consultation access', 'Online consultation hubs', 'Diabetes / hypertension'] },
  { name: 'Thrissur', famousFor: 'Cultural capital + Vaidyaratnam Ayurveda Foundation (India\'s largest pulse-diagnosis training programme)',
    notableInstitutions: ['Vaidyaratnam P. S. Varier\'s Arya Vaidya Sala (Kottakkal headquarters is nearby Malappuram)', 'Vaidyaratnam Oushadhasala Pvt Ltd', 'Sreedhareeyam Eye Hospital (HQ — adjacent Koothattukulam)'],
    bestFor: ['Classical Panchakarma', 'Eye disorders', 'Pulse diagnosis training'] },
  { name: 'Palakkad', famousFor: 'Birthplace of Karkidaka Chikitsa monsoon-rejuvenation protocols',
    notableInstitutions: ['Kalari Ayurvedic Hospital, Kanjirapuzha', 'Sreedhareeyam Kalari (branch)'],
    bestFor: ['Karkidaka treatment', 'Sandhivata (joint disorders)', 'Vata rejuvenation'] },
  { name: 'Malappuram', famousFor: 'Home to Arya Vaidya Sala, Kottakkal — India\'s most famous Ayurveda institution (est. 1902)',
    notableInstitutions: ['Arya Vaidya Sala, Kottakkal', 'AVS Charitable Hospital, Kottakkal', 'Pankajakasthuri Ayurveda Medical College'],
    bestFor: ['Reference-grade classical Ayurveda', 'Treatment-resistant chronic conditions', 'Vaidyaratnam-lineage Panchakarma'] },
  { name: 'Kozhikode', famousFor: 'Heritage Vaidyaratnam Oushadhasala lineage + traditional Kalari-marma schools',
    notableInstitutions: ['Vaidyaratnam Mooss\'s Ayurveda Hospital', 'PNNM Ayurveda Medical College'],
    bestFor: ['Marma therapy', 'Neurological conditions', 'Post-stroke recovery'] },
  { name: 'Wayanad', famousFor: 'Hill-station forest geography ideal for retreat-style detox',
    notableInstitutions: ['Vythiri Resort Ayurveda Centre', 'Tranquil Resort'],
    bestFor: ['Detox retreats', 'Stress and burnout recovery', 'Respiratory conditions'] },
  { name: 'Kannur', famousFor: 'Northern Kerala — strong Vata-disorder traditions; Vaidyamadham Vasudevan Namboothiri lineage',
    notableInstitutions: ['Vaidyamadham Vasudevan Namboothiri Trust', 'Kannur Government Ayurveda Dispensary network'],
    bestFor: ['Vata disorders', 'Paralysis (post-stroke)', 'Geriatric care'] },
  { name: 'Kasaragod', famousFor: 'Northernmost district — traditional Tulu-Kannada Ayurveda blend',
    notableInstitutions: ['Indus Valley Ayurveda Centre', 'Kerala Government Ayurveda Hospital, Kasaragod'],
    bestFor: ['Affordable classical treatment', 'Rural Ayurveda traditions'] },
]

const TOP_HOSPITALS = [
  { name: 'Arya Vaidya Sala, Kottakkal', city: 'Malappuram', established: 1902, note: 'Reference-grade classical Ayurveda. Treatment-resistant cases from across India.' },
  { name: 'Government Ayurveda College, Thiruvananthapuram', city: 'Thiruvananthapuram', established: 1889, note: 'Kerala\'s oldest BAMS institution. Strong academic medicine.' },
  { name: 'Vaidyaratnam Oushadhasala Pvt Ltd', city: 'Thrissur', established: 1924, note: 'Pulse-diagnosis training. Classical Panchakarma.' },
  { name: 'Sreedhareeyam Ayurvedic Eye Hospital', city: 'Ernakulam (Koothattukulam)', established: 1996, note: 'India\'s premier Ayurvedic eye hospital. Shalakya specialty.' },
  { name: 'Punarnava Ayurveda Hospital', city: 'Ernakulam', established: 2007, note: 'Modern hospital infrastructure + classical care. Strong on lifestyle disorders.' },
  { name: 'AyurVAID Hospitals', city: 'Ernakulam (HQ)', established: 2007, note: 'NABH-accredited Ayurveda hospitals. Multi-city chain.' },
  { name: 'Somatheeram Ayurveda Resort', city: 'Alappuzha', established: 1985, note: 'India\'s first Ayurveda resort. Medical-tourism flagship.' },
  { name: 'CGH Earth Ayurveda (Kalari Kovilakom)', city: 'Palakkad', established: 2004, note: 'Heritage-property residential treatment — Royal-Treatment Panchakarma.' },
  { name: 'Vaidyamadham Vasudevan Namboothiri Trust', city: 'Kannur', established: 1900, note: 'Vaidyamadham classical lineage. Pulse + clinical examination.' },
  { name: 'Pankajakasthuri Ayurveda Medical College', city: 'Malappuram', established: 2009, note: 'BAMS + MD programmes with attached hospital. Research output.' },
]

const TRAVEL_TIPS = [
  { title: 'Visa', body: 'UAE citizens get e-Visa on arrival. Most GCC nationals are visa-exempt for short stays. Indian medical-visa route is faster if treatment > 30 days — apply with a hospital letter.' },
  { title: 'When to fly', body: 'Best window: late June through August (Karkidaka — monsoon rejuvenation season). Body absorbs medicated oils best in monsoon humidity. Mid-Oct → Feb is the dry-comfort window if you can\'t do monsoon.' },
  { title: 'Airports', body: 'Kochi (COK), Trivandrum (TRV), Kannur (CNN), Kozhikode (CCJ). Daily direct flights from Dubai/Abu Dhabi/Sharjah/Doha/Riyadh. UAE → Kerala is typically 3.5–4h.' },
  { title: 'Language', body: 'Most senior doctors at AyurConnect-listed hospitals speak English. Malayalam is the primary language; Hindi is widely understood. Doctors from Kottakkal/Sreedhareeyam often speak Arabic at GCC-tourist hospitals.' },
  { title: 'Currency', body: 'INR (₹). 1 AED ≈ ₹22.50 (varies). Most major hospitals accept Indian-issued cards + UPI; classical hospitals may prefer cash for incidentals.' },
  { title: 'Diet', body: 'Halal-certified vegetarian Ayurvedic kitchens are available at most medical-tourism hospitals (Somatheeram, CGH, Kairali). Always confirm with the hospital in advance.' },
  { title: 'Pharmacies', body: 'Carry a 30-day supply of any allopathic prescription medications. Ayurveda hospitals dispense their own classical formulations.' },
  { title: 'Insurance', body: 'Most international travel insurance does NOT cover Ayurveda treatment. Niva Bupa + Star Health offer Ayurveda riders for UAE residents — check your policy before travel.' },
]

export default function KeralaGuidePage() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',          url: '/' },
    { name: 'Kerala Guide',  url: '/kerala-guide' },
  ]))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MapPin className="w-3 h-3" /> Travel guide for UAE + GCC visitors
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            The complete Kerala Ayurveda guide
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Where to go, when to visit, and which hospitals are worth the trip. Written for diaspora patients planning a 14- or 21-day Panchakarma course.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <SummaryCard icon={Sun} title="Best season" body="July–August (Karkidaka — monsoon rejuvenation). Body absorbs medicated oils best in monsoon humidity." />
          <SummaryCard icon={Stethoscope} title="500+ verified doctors" body="Across all 14 districts. BAMS + MD-Ayurveda. CCIM cross-checked. Filter by district + specialty." href="/doctors" />
          <SummaryCard icon={Plane} title="Direct flights from UAE" body="Kochi (COK) and Trivandrum (TRV) take Emirates / Etihad / Air Arabia direct. 3.5–4h." />
        </div>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-ink mb-2 inline-flex items-center gap-2"><MapPin className="w-6 h-6 text-kerala-700" /> All 14 districts</h2>
          <p className="text-sm text-muted mb-5">Each Kerala district has a distinctive Ayurveda tradition. Pick by what you&apos;re treating, not just by airport convenience.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DISTRICTS.map((d) => (
              <article key={d.name} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <header className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg text-ink">{d.name}</h3>
                  <Link href={`/doctors?district=${encodeURIComponent(d.name)}`} className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-0.5 flex-shrink-0">
                    Doctors <ChevronRight className="w-3 h-3" />
                  </Link>
                </header>
                <p className="text-sm text-gray-700 mb-3">{d.famousFor}</p>
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Notable institutions</p>
                  <ul className="text-xs text-gray-700 space-y-0.5">
                    {d.notableInstitutions.map((i) => <li key={i}>· {i}</li>)}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-1">
                  {d.bestFor.map((b) => <span key={b} className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded">{b}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-ink mb-2 inline-flex items-center gap-2"><Calendar className="w-6 h-6 text-kerala-700" /> When to visit — the Karkidaka window</h2>
          <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4 text-sm text-gray-800 leading-relaxed">
            <p>The Malayalam month <strong>Karkidaka</strong> (roughly mid-July to mid-August) is the classical rejuvenation window. Charaka and Vagbhata both prescribe Panchakarma during this phase because the cool, humid monsoon climate keeps body pores open — medicated oils absorb deeper, Vata disorders respond faster, and skin / joint conditions clear quicker than in dry seasons.</p>
            <p>Practical UAE-visitor implication: <strong>book a 14-day or 21-day course between July 1 and August 31</strong>. Premier medical-tourism hospitals (Somatheeram, CGH Earth Kalari Kovilakom, Kairali, Vaidyaratnam) sell out their Karkidaka slots by April. Book 90+ days in advance.</p>
            <p className="text-sm text-gray-700">Dry-comfort alternative: mid-October to February. Useful for tourists who can&apos;t handle monsoon weather but still want classical Panchakarma. Outcomes slightly slower but the treatment is fully valid.</p>
            <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded">
              <h3 className="text-xs uppercase tracking-wider text-amber-800 font-semibold mb-1 inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Avoid March–May
              </h3>
              <p className="text-sm text-amber-900">Pre-monsoon heat (35°C+ with high humidity) makes Panchakarma uncomfortable and reduces oil-absorption efficacy. Many traditional hospitals close for staff training in May.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2"><Hospital className="w-6 h-6 text-kerala-700" /> Top 10 classical hospitals</h2>
          <p className="text-sm text-muted mb-5">Ranked by classical lineage strength and treatment-resistant case track record. Not by Instagram presence.</p>
          <div className="space-y-3">
            {TOP_HOSPITALS.map((h, i) => (
              <article key={h.name} className="bg-white border border-gray-100 rounded-card p-5 shadow-card flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-kerala-700 text-white rounded-md flex items-center justify-center font-semibold text-lg">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-ink">{h.name}</h3>
                  <p className="text-xs text-muted">{h.city} · est. {h.established}</p>
                  <p className="text-sm text-gray-700 mt-1">{h.note}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link href="/hospitals" className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-700 text-kerala-700 hover:bg-kerala-50 rounded text-sm font-semibold">
              Browse all Kerala hospitals <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-ink mb-4 inline-flex items-center gap-2"><Plane className="w-6 h-6 text-kerala-700" /> Travel tips for UAE + GCC visitors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRAVEL_TIPS.map((t) => (
              <article key={t.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <h3 className="font-serif text-base text-ink mb-1">{t.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{t.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-cream border border-gray-100 rounded-card p-7 text-center">
          <Droplets className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-ink mb-2">Plan your trip</h2>
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-5">
            Match with a Kerala specialist for your condition first — they&apos;ll recommend which hospital + season fits your case before you book flights.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/doctor-match" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
              Match me with a doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/tourism" className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm font-semibold">
              Browse Panchakarma packages
            </Link>
          </div>
        </section>
      </section>
    </>
  )
}

function SummaryCard({ icon: Icon, title, body, href }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; href?: string }) {
  const card = (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card h-full">
      <Icon className="w-6 h-6 text-kerala-700 mb-2" />
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{body}</p>
    </article>
  )
  return href ? <Link href={href} className="block hover:shadow-cardLg transition-shadow rounded-card">{card}</Link> : card
}
