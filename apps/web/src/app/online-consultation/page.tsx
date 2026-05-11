import Link from 'next/link'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import {
  Video, ShieldCheck, Clock, MessageSquare, Stethoscope, Globe2, FileText,
  Smartphone, Pill, CheckCircle2, ChevronRight, AlertCircle, Languages, Lock,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

export const metadata = {
  title: 'Online Ayurveda Consultation — Video Visits with CCIM-Verified Doctors | AyurConnect',
  description: 'Book a video consultation with a CCIM-verified Kerala Ayurveda doctor. End-to-end encrypted Daily.co room, in-call chat + screen share, digital prescription + treatment plan delivered after the call.',
  alternates: { canonical: '/online-consultation' },
}

type DoctorListResponse = {
  doctors: DoctorCardData[]
  pagination: { total: number }
}

async function fetchOnlineDoctors(): Promise<DoctorCardData[]> {
  try {
    const res = await fetch(`${API}/doctors?online=true&verified=true&limit=6&sort=rating`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = (await res.json()) as DoctorListResponse
    return data.doctors ?? []
  } catch { return [] }
}

const HOW_IT_WORKS = [
  {
    icon: Stethoscope,
    title: 'Choose a doctor',
    body: 'Filter by specialization, language, and country/state. Every listed practitioner is CCIM-registered and re-verified annually.',
  },
  {
    icon: Clock,
    title: 'Pick a time',
    body: 'Open slots from the doctor\'s public schedule. Same-day video appointments are routine for online-available doctors.',
  },
  {
    icon: FileText,
    title: 'Share your intake',
    body: 'Brief chief complaint + symptom duration captured during booking. The doctor reviews it before the call.',
  },
  {
    icon: Video,
    title: 'Join the call',
    body: 'Pre-call lobby tests your camera + mic. The encrypted Daily.co room opens 15 minutes before your slot. In-call chat + screen share included.',
  },
  {
    icon: Pill,
    title: 'Get your plan',
    body: 'Post-call you receive a written prescription, observations, treatment plan, and follow-up suggestion — all visible in your dashboard + emailed.',
  },
]

const BENEFITS = [
  { icon: ShieldCheck, title: 'CCIM-verified only', body: 'Cross-checked against the public CCIM register. Disciplinary actions trigger de-listing within 48 hours.' },
  { icon: Lock,        title: 'End-to-end encrypted', body: 'Daily.co video infrastructure with HIPAA-grade compliance. Time-bounded room access — only the assigned patient and doctor can join.' },
  { icon: Languages,   title: 'Multi-language doctors', body: 'Find practitioners who speak Malayalam, English, Hindi, Tamil, Arabic, and more. Filter by language on the directory.' },
  { icon: Globe2,      title: 'Open to global patients', body: 'Patients in the Gulf, US, UK, Australia, EU consult Kerala specialists from home. International phone codes + country dropdowns built in.' },
  { icon: MessageSquare, title: 'Chat + screen share',  body: 'Bring lab reports or photos into the call. Use chat for follow-up questions during the consultation itself.' },
  { icon: Smartphone,  title: 'Works on any device', body: 'No app to install. Camera + mic preview runs in the browser. Mobile, tablet, laptop — all work.' },
]

const WHEN_VIDEO_FITS = [
  'Stress, sleep, anxiety, mood — Manasika consultations',
  'Lifestyle disorders — diabetes, hypertension, weight management',
  'Skin disorders — psoriasis, eczema, acne, vitiligo',
  'Chronic pain & arthritis follow-ups',
  'Diet & dosha-specific Ayurvedic guidance',
  'PCOS / hormonal balance reviews',
  'Pediatric Ayurvedic consultations (with parent present)',
  'Second opinions on existing treatment plans',
]

const WHEN_IN_PERSON = [
  'First Panchakarma assessment (requires Nadi-Pariksha + physical examination)',
  'Initial pulse + tongue diagnosis for complex chronic disease',
  'Procedures — Abhyanga, Shirodhara, Kati-Basti, etc. (treatment, not consultation)',
  'Acute conditions requiring hands-on assessment',
]

const FAQS = [
  {
    q: 'How long is an online consultation?',
    a: 'Typical first visit: 30–45 minutes. Follow-ups: 15–25 minutes. Time isn\'t metered — the doctor stays on the call as long as your case needs.',
  },
  {
    q: 'What if my video / audio fails mid-call?',
    a: 'The Daily.co room auto-reconnects. If issues persist, the doctor can fall back to a phone call. Reschedule is also offered free of charge for verified technical failures.',
  },
  {
    q: 'Will I get a prescription?',
    a: 'Yes — post-call, the doctor enters a structured prescription + treatment plan + follow-up note that appears in your dashboard immediately. An email summary is also sent.',
  },
  {
    q: 'Can I share lab reports?',
    a: 'Yes. During the call, use the screen-share icon in the Daily.co interface to show reports, imaging, or photos. You can also email them to your doctor after the call via the platform.',
  },
  {
    q: 'Is online Ayurveda as effective as in-person?',
    a: 'For most lifestyle disorders, mental wellness, dietary guidance, and chronic disease follow-ups — yes. First-time Panchakarma assessment and acute conditions need in-person Nadi-Pariksha. See the "When video fits" / "When in-person is better" list above.',
  },
  {
    q: 'Is my consultation private?',
    a: 'The video room is encrypted end-to-end (Daily.co). The doctor\'s private clinical notes are never shared with anyone, including AyurConnect staff. Patient-facing notes (prescription + plan) are only visible to you in your dashboard.',
  },
  {
    q: 'What about consultation fees?',
    a: 'AyurConnect doesn\'t charge platform fees on consultations — you pay the doctor directly per their displayed rate or via the clinic\'s billing channel. Some doctors offer free first consultations; check the doctor\'s profile.',
  },
  {
    q: 'Can I book for someone else (parent, child)?',
    a: 'Yes. The booking flow accepts the patient\'s name + chief complaint independently of your account. For minors, the parent should be present on the call.',
  },
]

export default async function OnlineConsultationPage() {
  const doctors = await fetchOnlineDoctors()

  return (
    <>
      {/* HERO */}
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Video className="w-3 h-3" /> Online Consultation
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Video consultation with <span className="text-gold-400">CCIM-verified</span> Kerala doctors
          </h1>
          <p className="mt-5 text-lg text-white/85">
            Book a same-week video visit with a classical Ayurveda practitioner.
            End-to-end encrypted, prescription delivered to your dashboard, available globally.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/doctors?online=true" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find an online doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard/appointments" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              My consultations
            </Link>
          </div>
          <p className="text-xs text-white/60 mt-6">
            <ShieldCheck className="w-3 h-3 inline mr-1" />
            500+ verified doctors · 14 Kerala districts · diaspora-friendly
          </p>
        </div>
      </GradientHero>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">How an online consultation works</h2>
          <p className="text-muted mt-2">Five steps — typical first visit start-to-finish is about 45 minutes.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {HOW_IT_WORKS.map((s, i) => (
            <article key={s.title} className="p-5 bg-white rounded-card border border-gray-100 shadow-card relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-kerala-600 text-white font-serif text-base flex items-center justify-center">{i + 1}</div>
              <s.icon className="w-6 h-6 text-kerala-700 mb-3 mt-1" />
              <h3 className="font-serif text-lg text-kerala-700">{s.title}</h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Doctors available for online consultation</h2>
              <p className="text-muted mt-1 text-sm">Top-rated CCIM-verified practitioners offering video visits this week.</p>
            </div>
            <Link href="/doctors?online=true" className="inline-flex items-center gap-1 text-sm text-kerala-700 font-semibold hover:underline">
              See all online doctors <ChevronRight className="w-3 h-3" />
            </Link>
          </header>

          {doctors.length === 0 ? (
            <div className="text-center py-14 bg-white border border-gray-100 rounded-card">
              <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted">Loading available doctors…</p>
              <Link href="/doctors?online=true" className="inline-flex items-center gap-1 mt-3 text-sm text-kerala-700 font-semibold hover:underline">
                Browse the full directory →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Why patients choose AyurConnect video visits</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <article key={b.title} className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
              <b.icon className="w-6 h-6 text-kerala-700 mb-3" />
              <h3 className="font-serif text-lg text-kerala-700">{b.title}</h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* WHEN VIDEO FITS / WHEN IN-PERSON IS BETTER */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Honest guidance: video vs in-person</h2>
            <p className="text-muted mt-2 max-w-2xl mx-auto">
              Not every condition is right for video. Here&apos;s where each format works best — pulled from senior practitioner feedback.
            </p>
          </header>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-card border border-kerala-100 shadow-card">
              <div className="flex items-center gap-2 text-kerala-700 mb-3">
                <Video className="w-5 h-5" />
                <h3 className="font-serif text-lg">Video consultation fits</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-800">
                {WHEN_VIDEO_FITS.map((c) => (
                  <li key={c} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-kerala-600 flex-shrink-0 mt-0.5" /><span>{c}</span></li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-white rounded-card border border-amber-100 shadow-card">
              <div className="flex items-center gap-2 text-amber-700 mb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-serif text-lg">In-person is better for</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-800">
                {WHEN_IN_PERSON.map((c) => (
                  <li key={c} className="flex gap-2"><AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><span>{c}</span></li>
                ))}
              </ul>
              <p className="text-xs text-amber-800 mt-4 italic">
                Many doctors offer a hybrid: initial video screen → in-person Nadi-Pariksha if needed → video follow-ups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <header className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Frequently asked questions</h2>
        </header>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5 bg-white rounded-card border border-gray-100 shadow-card">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{f.q}</h3>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 mt-1" />
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-kerala-700 py-14 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl">Ready to consult?</h2>
          <p className="mt-3 text-white/85">
            Browse online-available doctors filtered by your country, state, and specialization.
            Book a slot — the consultation room opens 15 minutes before your appointment.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/doctors?online=true" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find a doctor for video consult <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/ayurbot" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              <MessageSquare className="w-4 h-4" /> Quick question? Ask AyurBot
            </Link>
          </div>
          <p className="text-xs text-white/60 mt-6">
            Not sure where to start? <Link href="/prakriti-quiz" className="text-gold-300 hover:text-white underline">Take the Prakriti quiz</Link> to know your dosha,
            then book a doctor matched to your constitution.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Important:</strong> Online consultations are not a substitute for emergency care.
            For acute symptoms — severe pain, breathing difficulty, chest pain, bleeding, sudden weakness —
            call your local emergency line (India: 108) immediately. Ayurvedic care integrates with, not
            replaces, modern medicine; coordinate with your existing care team.
          </p>
        </div>
      </section>
    </>
  )
}
