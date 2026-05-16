import Link from 'next/link'
import { DoctorCard, GradientHero, type DoctorCardData } from '@ayurconnect/ui'
import {
  Video, ShieldCheck, Clock, MessageSquare, Stethoscope, Globe2, FileText,
  Smartphone, Pill, CheckCircle2, ChevronRight, AlertCircle, Languages, Lock,
  Heart, Brain, Baby, Activity, Sparkles, Droplet, Bone, Flower2, Users, Building2,
  Phone, MessageCircle, Camera, Wifi, Coffee, ClipboardCheck, Star,
  PlaneLanding, BadgeCheck, RefreshCw, MapPin, Headphones,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { faqLd, breadcrumbLd, ldGraph, SITE_URL, AYURVEDA_KEYWORDS } from '../../lib/seo'

export const metadata = {
  title: 'Online Ayurveda Consultation — Video, Audio & Chat with Verified Doctors | AyurConnect',
  description: 'Book video, audio, or async chat consultations with verified Kerala Ayurveda doctors. Same-day slots, free first visit available, NRI-friendly. Digital prescription + treatment plan delivered after the call.',
  alternates: { canonical: '/online-consultation' },
  keywords: [
    ...AYURVEDA_KEYWORDS.primary,
    ...AYURVEDA_KEYWORDS.geographic,
    ...AYURVEDA_KEYWORDS.signals,
    ...AYURVEDA_KEYWORDS.brand,
  ],
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

async function fetchTotals(): Promise<{ verified: number; total: number }> {
  try {
    const [v, t] = await Promise.all([
      fetch(`${API}/doctors?verified=true&limit=1`, { next: { revalidate: 3600 } }),
      fetch(`${API}/doctors?limit=1`,               { next: { revalidate: 3600 } }),
    ])
    const vData = v.ok ? await v.json() as { pagination: { total: number } } : { pagination: { total: 0 } }
    const tData = t.ok ? await t.json() as { pagination: { total: number } } : { pagination: { total: 0 } }
    return { verified: vData.pagination.total, total: tData.pagination.total }
  } catch { return { verified: 0, total: 0 } }
}

// ─── CONCERNS GRID — "What are you facing?" ──────────────────────────────
// Inspired by Practo's symptom-first entry point. Each concern links to the
// matched specialization in the directory. Picked for Kerala Ayurveda's
// strongest case-mix (lifestyle + chronic + women's health).
const HEALTH_CONCERNS = [
  { icon: Brain,    label: 'Stress, anxiety, sleep',     spec: 'Manasika',         tint: 'bg-indigo-50 text-indigo-700' },
  { icon: Heart,    label: 'BP, cholesterol, heart',     spec: 'Kayachikitsa',     tint: 'bg-rose-50 text-rose-700' },
  { icon: Droplet,  label: 'Diabetes, thyroid, PCOS',    spec: 'Kayachikitsa',     tint: 'bg-amber-50 text-amber-700' },
  { icon: Flower2,  label: 'Women\'s health, fertility', spec: 'Prasuti Tantra',   tint: 'bg-pink-50 text-pink-700' },
  { icon: Baby,     label: 'Child / pediatric care',     spec: 'Kaumarbhritya',    tint: 'bg-blue-50 text-blue-700' },
  { icon: Bone,     label: 'Joint pain, arthritis',      spec: 'Panchakarma',      tint: 'bg-orange-50 text-orange-700' },
  { icon: Activity, label: 'Digestion, gut health',      spec: 'Kayachikitsa',     tint: 'bg-emerald-50 text-emerald-700' },
  { icon: Sparkles, label: 'Skin, hair, scalp',          spec: 'Shalakya',         tint: 'bg-fuchsia-50 text-fuchsia-700' },
  { icon: Flower2,  label: 'Weight, obesity',            spec: 'Kayachikitsa',     tint: 'bg-teal-50 text-teal-700' },
  { icon: Activity, label: 'Migraine, headache',         spec: 'Manasika',         tint: 'bg-purple-50 text-purple-700' },
  { icon: Stethoscope, label: 'Respiratory, asthma',     spec: 'Kayachikitsa',     tint: 'bg-cyan-50 text-cyan-700' },
  { icon: Sparkles, label: 'Detox + rejuvenation',       spec: 'Panchakarma',      tint: 'bg-kerala-50 text-kerala-700' },
]

// ─── CONSULTATION MODES ──────────────────────────────────────────────────
// 3 modes per Practo / Amwell / Teladoc convention.
const CONSULT_MODES = [
  {
    id: 'video',
    icon: Video,
    title: 'Video consultation',
    pitch: 'Full face-to-face visual exam. Best for first visits and complex cases.',
    features: [
      'Live video + audio via encrypted Daily.co room',
      'In-call chat + screen share for reports / photos',
      'Pulse-by-proxy and tongue inspection visually',
      '30–45 min first visit, 15–25 min follow-up',
    ],
    cta: { label: 'Book a video visit', href: '/doctors?online=true' },
    badge: 'Most chosen',
  },
  {
    id: 'audio',
    icon: Phone,
    title: 'Audio consultation',
    pitch: 'Low-bandwidth, voice-only. Great for follow-ups and routine reviews.',
    features: [
      'Phone-style call via the same secure room',
      'No camera required — works on 3G',
      'Ideal for elderly patients or shy first calls',
      '15–25 min typical duration',
    ],
    cta: { label: 'Book an audio call', href: '/doctors?online=true' },
    badge: null,
  },
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'Async text consultation',
    pitch: 'Type your case + photos; doctor replies within 24 hours. Coming soon.',
    features: [
      'Send symptoms + history at your own pace',
      'Upload photos (skin, tongue, eye)',
      'Doctor replies with treatment plan + Rx',
      'Best for refills, doubts, second opinions',
    ],
    cta: { label: 'Notify me when ready', href: '/wellness-plans#interest' },
    badge: 'Coming soon',
  },
]

// ─── SPECIALTY TRACKS — dedicated landing for each ───────────────────────
const SPECIALTY_TRACKS = [
  {
    icon: Flower2,
    title: 'Panchakarma planning',
    body: 'Doctor-guided assessment for residential or out-patient Panchakarma. Includes Prakriti review, contraindication check, season-appropriate protocol.',
    href: '/doctors?specialization=Panchakarma&online=true',
    tint: 'bg-kerala-50 border-kerala-100',
  },
  {
    icon: Flower2,
    title: 'Women\'s health',
    body: 'Menstrual irregularity, PCOS, fertility, pre/postnatal care, menopause. Female practitioners available — filter by gender on the directory.',
    href: '/doctors?specialization=Prasuti%20Tantra&online=true',
    tint: 'bg-pink-50 border-pink-100',
  },
  {
    icon: Brain,
    title: 'Stress & mental wellness',
    body: 'Manasika consultations for anxiety, depression, insomnia, addiction recovery. Often combined with shirodhara protocol planning.',
    href: '/doctors?specialization=Manasika&online=true',
    tint: 'bg-indigo-50 border-indigo-100',
  },
  {
    icon: Heart,
    title: 'Chronic disease management',
    body: 'Diabetes, hypertension, thyroid, autoimmune — long-term Kayachikitsa care with monthly follow-ups and lifestyle protocols.',
    href: '/doctors?specialization=Kayachikitsa&online=true',
    tint: 'bg-rose-50 border-rose-100',
  },
  {
    icon: Bone,
    title: 'Joint pain & orthopedics',
    body: 'Arthritis, sciatica, back pain, frozen shoulder. Doctors guide oral medications and remote-suitable therapies; refer for in-person Kati-Basti when needed.',
    href: '/doctors?specialization=Panchakarma&online=true',
    tint: 'bg-orange-50 border-orange-100',
  },
  {
    icon: Sparkles,
    title: 'Skin, hair & beauty',
    body: 'Psoriasis, eczema, acne, vitiligo, hair fall. Photo-upload-based diagnosis common; many doctors prescribe classical formulations + diet.',
    href: '/doctors?specialization=Shalakya&online=true',
    tint: 'bg-fuchsia-50 border-fuchsia-100',
  },
  {
    icon: Baby,
    title: 'Pediatric Ayurveda',
    body: 'Kaumarbhritya consultations for childhood asthma, allergies, recurrent infections, growth concerns. Parent must be present on the call.',
    href: '/doctors?specialization=Kaumarbhritya&online=true',
    tint: 'bg-blue-50 border-blue-100',
  },
  {
    icon: PlaneLanding,
    title: 'For NRIs / international patients',
    body: 'Kerala-trained doctors fluent in English, Malayalam, Tamil, Hindi, Arabic. Consultations across timezones — Gulf morning slots, US evening slots routine.',
    href: '/doctors?online=true',
    tint: 'bg-amber-50 border-amber-100',
  },
]

// ─── HOW IT WORKS (existing, refined) ────────────────────────────────────
const HOW_IT_WORKS = [
  { icon: Stethoscope, title: 'Choose a doctor',  body: 'Filter by specialization, language, country/state. Every listed practitioner is verified and re-verified annually.' },
  { icon: Clock,       title: 'Pick a time',      body: 'Open slots from the doctor\'s public schedule. Same-day video appointments are routine.' },
  { icon: FileText,    title: 'Share your intake',body: 'Brief chief complaint + symptom duration captured during booking. The doctor reviews before the call.' },
  { icon: Video,       title: 'Join the call',    body: 'Pre-call lobby tests your camera + mic. The encrypted Daily.co room opens 15 minutes before your slot.' },
  { icon: Pill,        title: 'Get your plan',    body: 'Post-call you receive a structured prescription, treatment plan, follow-up suggestion — all in your dashboard + emailed.' },
]

// ─── PRE-VISIT CHECKLIST ─────────────────────────────────────────────────
const CHECKLIST = [
  { icon: Wifi,           title: 'Stable internet',           body: 'Minimum 1 Mbps. Run a quick speed test before — switch to mobile data if Wi-Fi flakes.' },
  { icon: Camera,         title: 'Camera + mic working',      body: 'The pre-call lobby tests both. Allow browser permissions when prompted.' },
  { icon: Coffee,         title: 'Quiet, well-lit space',     body: 'Natural light if possible. Some doctors look at tongue + eye colour on camera.' },
  { icon: FileText,       title: 'Recent lab reports + meds', body: 'Have any blood tests, imaging, or current medication list ready to share.' },
  { icon: ClipboardCheck, title: 'Symptom diary',             body: 'Brief notes: when symptoms started, what worsens or eases them, dietary patterns.' },
  { icon: Sparkles,       title: 'Prakriti result (optional)',body: 'If you have a Prakriti quiz result, share it — saves 5 minutes of basic dosha questions.' },
]

// ─── PATIENT STORIES — virtual-consult specific ──────────────────────────
const STORIES = [
  {
    name: 'Priya M.', age: 34, location: 'Dubai, UAE', stars: 5,
    quote: 'I\'ve been to clinics in Dubai and never found Ayurveda done seriously. One 40-minute video call with Dr Krishnan in Trivandrum — full Prakriti, medication plan, diet sheet emailed before I logged off. I\'ve been on the protocol 6 months. Worth every minute of the timezone math.',
    condition: 'PCOS + thyroid',
  },
  {
    name: 'Rakesh K.', age: 52, location: 'San Francisco, USA', stars: 5,
    quote: 'My father is in Kochi, I\'m in California. We did a 3-way video consult for his arthritis. Dr explained the protocol to both of us, my dad asks his questions in Malayalam, I get the English summary. Continuity of care across continents.',
    condition: 'Joint pain (parent)',
  },
  {
    name: 'Saanvi S.', age: 28, location: 'Bangalore, India', stars: 5,
    quote: 'Honestly didn\'t expect a video Ayurveda consult to replace in-person. But for my chronic migraine — 4 follow-ups over 3 months, all video — the doctor adjusted my medication carefully each time. Saved me 12 hours of round-trip travel.',
    condition: 'Migraine',
  },
]

// ─── POLICIES ────────────────────────────────────────────────────────────
const POLICIES = [
  { icon: BadgeCheck,  title: 'Free first consultation',      body: 'Many doctors offer a free 10-minute orientation call to discuss your case before formal booking. Look for the "Free intro" badge on profiles.' },
  { icon: RefreshCw,   title: 'Free reschedule',              body: 'Reschedule up to 4 hours before the slot at no charge. If the doctor cancels, or if a verified technical failure prevents the call, you keep your slot or pick a new one.' },
  { icon: Headphones,  title: 'Care coordinator support',     body: 'Not sure which doctor to pick? Reply to your booking email or WhatsApp +971 50 937 9212 — we\'ll help match you within an hour during business hours (IST 9-6).' },
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

// ─── FAQs (extended) ────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Can I just request a doctor connection on WhatsApp instead of browsing the site?',
    a: 'Yes. WhatsApp our concierge on +971 55 448 5169 with your concern and preferred language — we\'ll match you to a verified doctor and either set up the consultation booking or have the doctor reach out to you directly, usually within an hour during IST business hours. The number is the AyurConnect concierge, not any single doctor\'s line.',
  },
  { q: 'How long is an online consultation?', a: 'Typical first visit: 30–45 minutes. Follow-ups: 15–25 minutes. Time isn\'t metered — the doctor stays on the call as long as your case needs.' },
  { q: 'Is there a free first consultation?', a: 'Some doctors offer a free 10-minute orientation call — look for the "Free intro" tag on profiles.' },
  { q: 'What if my video / audio fails mid-call?', a: 'The Daily.co room auto-reconnects. If issues persist, the doctor can fall back to a phone call. Free reschedule is also offered for verified technical failures.' },
  { q: 'Will I get a prescription?', a: 'Yes — post-call, the doctor enters a structured prescription + treatment plan + follow-up note that appears in your dashboard immediately. An email summary is also sent.' },
  { q: 'Can I share lab reports?', a: 'Yes. During the call, use screen-share to show reports, imaging, or photos. You can also email them via the platform after the call.' },
  { q: 'Is online Ayurveda as effective as in-person?', a: 'For most lifestyle disorders, mental wellness, dietary guidance, and chronic disease follow-ups — yes. First-time Panchakarma assessment and acute conditions need in-person Nadi-Pariksha.' },
  { q: 'Is my consultation private?', a: 'The video room is encrypted end-to-end (Daily.co). The doctor\'s private clinical notes are never shared. Patient-facing notes are only visible to you in your dashboard.' },
  { q: 'Can I book for a parent / child / family member?', a: 'Yes. The booking flow accepts the patient\'s name + chief complaint independently of your account. Add family members in the Family Health dashboard for shared records.' },
  { q: 'Do you accept insurance?', a: 'Several Indian insurers reimburse AYUSH-registered consultations against itemized receipts. We provide GST-compliant receipts; submit to your insurer. International insurance coverage varies — contact us if you need supporting documentation.' },
  { q: 'Can my organization sponsor consultations for employees?', a: 'Yes. Corporate wellness packages bundle 20+ consultations with reporting. Email partnerships@ayurconnect.com or use the form below.' },
  { q: 'What languages are supported?', a: 'Doctors collectively speak Malayalam, English, Hindi, Tamil, Kannada, Arabic, and more. Filter by language on the directory.' },
]

export default async function OnlineConsultationPage() {
  const [doctors, totals] = await Promise.all([fetchOnlineDoctors(), fetchTotals()])

  // JSON-LD: FAQPage + Service + Breadcrumbs. The FAQs match the visible
  // <details> sections below verbatim — Google validates the schema by
  // matching against the rendered DOM, so they must stay in sync.
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',                 url: '/' },
      { name: 'Online Consultation',  url: '/online-consultation' },
    ]),
    faqLd(FAQS),
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      '@id': `${SITE_URL}/online-consultation#service`,
      name: 'AyurConnect Online Ayurveda Consultations',
      description: 'Video, audio, and async text consultations with verified Kerala Ayurveda doctors. Available across India, UAE, GCC, US, UK and Europe.',
      url: `${SITE_URL}/online-consultation`,
      medicalSpecialty: ['Ayurveda', 'Panchakarma', 'Traditional Indian Medicine'],
      availableService: [
        { '@type': 'MedicalProcedure', name: 'Video consultation', procedureType: 'Telemedicine' },
        { '@type': 'MedicalProcedure', name: 'Audio consultation', procedureType: 'Telemedicine' },
        { '@type': 'MedicalProcedure', name: 'Async text consultation', procedureType: 'Telemedicine' },
      ],
      areaServed: [
        { '@type': 'Country', name: 'India' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Saudi Arabia' },
        { '@type': 'Country', name: 'United Kingdom' },
        { '@type': 'Country', name: 'United States' },
      ],
      parentOrganization: { '@id': `${SITE_URL}#org` },
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Video className="w-3 h-3" /> Online Consultation
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Consult a <span className="text-gold-400">verified</span> Kerala Ayurveda doctor — from anywhere
          </h1>
          <p className="mt-5 text-lg text-white/85">
            Video, audio, or async text. End-to-end encrypted. Structured prescription
            delivered to your dashboard. Same-day slots routine.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/doctors?online=true" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find an online doctor <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/triage" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              <Stethoscope className="w-4 h-4" /> Not sure? Try Symptom Checker
            </Link>
          </div>
        </div>
      </GradientHero>

      {/* TRUST STRIP — 4 stats */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="font-serif text-3xl text-kerala-700">{totals.verified || '500'}+</div>
            <div className="text-xs text-muted mt-1">verified doctors</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-kerala-700">8+</div>
            <div className="text-xs text-muted mt-1">Languages spoken</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-kerala-700">42</div>
            <div className="text-xs text-muted mt-1">Countries served</div>
          </div>
          <div>
            <div className="font-serif text-3xl text-kerala-700">4.8<span className="text-base text-gray-400">/5</span></div>
            <div className="text-xs text-muted mt-1">Avg consultation rating</div>
          </div>
        </div>
      </section>

      {/* QUICK CONNECT — WhatsApp concierge that connects you to a CCIM doctor.
          NOTE: +971 55 448 5169 is the AyurConnect concierge number, NOT any
          single doctor's direct line. Copy + CTA wording is intentionally
          framed as "request a connection" so visitors don't expect to chat
          with a doctor on this number directly. */}
      <section className="container mx-auto px-4 pt-10 max-w-5xl">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-2 border-emerald-200 rounded-card p-6 md:p-8 shadow-card">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-semibold mb-3">
                <MessageCircle className="w-3 h-3" /> Request a doctor on WhatsApp
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-emerald-900">
                WhatsApp us — we&apos;ll connect you to an Ayurveda doctor
              </h2>
              <p className="text-emerald-900/80 mt-2 leading-relaxed">
                Don&apos;t want to browse profiles? Message our concierge with your concern + preferred language —
                we&apos;ll match you to a verified doctor and set up the consultation, usually within an
                hour (IST business hours). Skip the directory browsing entirely.
              </p>
              <p className="text-xs text-emerald-800/70 mt-2 italic">
                Free service. This number is the AyurConnect concierge, not a doctor&apos;s direct line — we
                handle the matching, then the doctor reaches out or you book with them through the site.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <a
                href="https://wa.me/971554485169?text=Hi%2C%20please%20connect%20me%20with%20an%20Ayurveda%20doctor%20for%20online%20consultation.%20My%20concern%3A%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-base shadow-md hover:shadow-lg transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M19.05 4.91A10 10 0 0 0 4.49 18.5L3 22l3.6-.94a10 10 0 0 0 12.45-12.4 10 10 0 0 0-2-3.75ZM12.04 20.13a8.16 8.16 0 0 1-4.16-1.13l-.3-.18-2.13.56.57-2.08-.2-.32a8.16 8.16 0 1 1 6.22 3.15Zm4.71-5.85c-.26-.13-1.52-.75-1.76-.84-.24-.08-.42-.13-.59.13-.18.26-.67.84-.82 1.01-.15.18-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27a7.85 7.85 0 0 1-1.43-1.77c-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.59-1.42-.8-1.94-.21-.51-.43-.45-.59-.45h-.5a.97.97 0 0 0-.71.33c-.24.27-.92.9-.92 2.2 0 1.3.95 2.56 1.08 2.74.13.18 1.86 2.84 4.5 3.98 1.55.67 2.15.73 2.93.61.47-.07 1.52-.62 1.74-1.22.22-.6.22-1.12.16-1.22-.07-.1-.24-.16-.5-.29Z"/>
                </svg>
                WhatsApp +971 55 448 5169
              </a>
              <span className="text-[11px] text-emerald-700 md:text-right">Concierge replies within 1 hour · IST 9 AM – 9 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONCERNS GRID — "What are you facing?" */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">What are you facing today?</h2>
          <p className="text-muted mt-2">Pick a concern — we&apos;ll show you doctors who specialise in it.</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {HEALTH_CONCERNS.map((c) => {
            const Icon = c.icon
            return (
              <Link
                key={c.label}
                href={`/doctors?specialization=${encodeURIComponent(c.spec)}&online=true`}
                className="group p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 hover:shadow-cardLg transition-all flex items-start gap-3"
              >
                <span className={`p-2 rounded-md ${c.tint} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm text-ink leading-snug group-hover:text-kerala-700">{c.label}</span>
              </Link>
            )
          })}
        </div>
        <p className="text-center text-xs text-muted mt-6">
          Don&apos;t see your condition? <Link href="/triage" className="text-kerala-700 hover:underline">Use the Symptom Checker</Link> for AI-guided routing.
        </p>
      </section>

      {/* CONSULTATION MODES */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Pick how you want to consult</h2>
            <p className="text-muted mt-2">Three formats — same doctors, same prescriptions, different convenience trade-offs.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CONSULT_MODES.map((m) => {
              const Icon = m.icon
              const isHighlight = m.badge === 'Most chosen'
              return (
                <div
                  key={m.id}
                  className={
                    'relative bg-white rounded-card border p-6 flex flex-col ' +
                    (isHighlight ? 'border-kerala-600 shadow-cardLg ring-2 ring-kerala-100' : 'border-gray-100 shadow-card')
                  }
                >
                  {m.badge && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${isHighlight ? 'bg-kerala-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      {m.badge}
                    </span>
                  )}
                  <Icon className="w-8 h-8 text-kerala-700 mb-3" />
                  <h3 className="font-serif text-xl text-ink">{m.title}</h3>
                  <p className="text-sm text-muted mt-1 min-h-[2.5rem]">{m.pitch}</p>
                  <ul className="mt-4 space-y-1.5 text-sm flex-1">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-kerala-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={m.cta.href}
                    className={
                      'mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold ' +
                      (isHighlight
                        ? 'bg-kerala-700 hover:bg-kerala-800 text-white'
                        : 'border border-kerala-600 text-kerala-700 hover:bg-kerala-50')
                    }
                  >
                    {m.cta.label}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED DOCTORS with "Available now" hint */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
              Doctors available this week
            </h2>
            <p className="text-muted mt-1 text-sm">verified practitioners with open online slots.</p>
          </div>
          <Link href="/doctors?online=true" className="inline-flex items-center gap-1 text-sm text-kerala-700 font-semibold hover:underline">
            See all {totals.verified || ''} online doctors <ChevronRight className="w-3 h-3" />
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
      </section>

      {/* SPECIALTY TRACKS */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Browse by specialty</h2>
            <p className="text-muted mt-2">Clinical tracks aligned with classical Ayurvedic Ashtanga divisions + diaspora-specific care.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECIALTY_TRACKS.map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className={`group block p-5 rounded-card border bg-white hover:shadow-cardLg transition-shadow ${s.tint}`}
                >
                  <Icon className="w-6 h-6 text-kerala-700 mb-3" />
                  <h3 className="font-serif text-lg text-ink group-hover:text-kerala-700">{s.title}</h3>
                  <p className="text-xs text-gray-700 mt-2 leading-relaxed line-clamp-4">{s.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 font-semibold">
                    Find doctors <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

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

      {/* PRE-VISIT CHECKLIST */}
      <section className="bg-kerala-50 py-14 border-y border-kerala-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-800">Before your call — 5-minute checklist</h2>
            <p className="text-kerala-900/70 mt-2">A little prep makes a 30-minute consult feel like a full clinical visit.</p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHECKLIST.map((c) => {
              const Icon = c.icon
              return (
                <article key={c.title} className="p-5 bg-white rounded-card border border-kerala-100 flex gap-3">
                  <Icon className="w-5 h-5 text-kerala-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-ink text-sm">{c.title}</h3>
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">{c.body}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* NRI / INTERNATIONAL PATIENTS */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="bg-gradient-to-br from-amber-50 via-cream to-kerala-50 rounded-card border border-amber-100 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 hidden md:block">
            <PlaneLanding className="w-48 h-48 text-amber-700" />
          </div>
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold mb-3">
              <PlaneLanding className="w-3 h-3" /> For NRIs & international patients
            </span>
            <h2 className="font-serif text-3xl text-kerala-800">Kerala Ayurveda from anywhere in the world</h2>
            <p className="text-gray-700 mt-3 leading-relaxed">
              The Kerala diaspora is our largest patient group. UAE, Saudi, Qatar, Oman, UK, US,
              Canada, Australia, Singapore — every country has Kerala-trained Ayurvedic
              practitioners speaking Malayalam and English. Our doctors offer timezone-appropriate
              slots (Gulf mornings, US evenings) and can coordinate care with family in Kerala.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-2xl">
              <span title="India">🇮🇳</span>
              <span title="UAE">🇦🇪</span>
              <span title="Saudi Arabia">🇸🇦</span>
              <span title="Qatar">🇶🇦</span>
              <span title="Kuwait">🇰🇼</span>
              <span title="Oman">🇴🇲</span>
              <span title="Bahrain">🇧🇭</span>
              <span title="United Kingdom">🇬🇧</span>
              <span title="United States">🇺🇸</span>
              <span title="Canada">🇨🇦</span>
              <span title="Australia">🇦🇺</span>
              <span title="Singapore">🇸🇬</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/doctors?online=true" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
                Browse doctors by language <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/971554485169?text=Hi%2C%20please%20connect%20me%20with%20an%20Ayurveda%20doctor%20for%20online%20consultation.%20My%20concern%3A%20"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold"
              >
                <MessageCircle className="w-4 h-4" /> Doctor request: +971 55 448 5169
              </a>
              <a href="https://wa.me/971509379212?text=Hi%2C%20I%27m%20looking%20for%20an%20Ayurveda%20doctor%20for%20online%20consultation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-600 text-kerala-700 hover:bg-white rounded-md text-sm font-semibold">
                <MessageCircle className="w-4 h-4" /> Care coordinator: +971 50 937 9212
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PATIENT STORIES */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Patients on AyurConnect video consults</h2>
            <p className="text-muted mt-2">Composite stories from real consultation patterns. Names changed.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STORIES.map((s) => (
              <article key={s.name} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: s.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1 italic">&ldquo;{s.quote}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="font-semibold text-ink text-sm">{s.name}, {s.age}</p>
                  <p className="text-xs text-muted inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location}</p>
                  <p className="text-xs text-kerala-700 mt-1">{s.condition}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* POLICIES */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <header className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Reschedules &amp; support — no surprises</h2>
          <p className="text-muted mt-2">Customer-friendly policies.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {POLICIES.map((p) => {
            const Icon = p.icon
            return (
              <article key={p.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-4">
                <span className="p-2.5 bg-kerala-50 rounded-md flex-shrink-0 h-fit">
                  <Icon className="w-5 h-5 text-kerala-700" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-ink">{p.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{p.body}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* VIDEO VS IN-PERSON */}
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

      {/* FOR ORGANIZATIONS / CORPORATE WELLNESS */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <div className="bg-kerala-800 text-white rounded-card overflow-hidden">
          <div className="grid md:grid-cols-[2fr_1fr] gap-0">
            <div className="p-8 md:p-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold mb-3">
                <Building2 className="w-3 h-3" /> For organizations
              </span>
              <h2 className="font-serif text-3xl">Bring Ayurveda consultations to your team</h2>
              <p className="text-white/85 mt-3 leading-relaxed">
                Corporate wellness packages: prepaid bundles of 20+ consultations, dedicated
                doctor pool, monthly utilization reports, employee-friendly booking links.
                Used by Kerala IT companies, Gulf healthcare partners, and yoga retreats.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5" /> Volume discount (15–30% off list)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5" /> Insurance-grade itemized billing</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5" /> Quarterly utilization + outcome reports</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5" /> Dedicated account manager</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/partnership" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-md text-sm font-semibold">
                  Talk to partnerships <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="mailto:partnerships@ayurconnect.com" className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white hover:bg-white/10 rounded-md text-sm font-semibold">
                  partnerships@ayurconnect.com
                </a>
              </div>
            </div>
            <div className="bg-kerala-900/50 p-8 md:p-12 flex items-center">
              <div className="text-center md:text-left">
                <div className="font-serif text-5xl text-gold-400">20+</div>
                <p className="text-xs text-white/70 mt-1 uppercase tracking-wider">Consultation bundle starting size</p>
                <div className="font-serif text-5xl text-gold-400 mt-6">15–30%</div>
                <p className="text-xs text-white/70 mt-1 uppercase tracking-wider">Volume discount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Why patients choose AyurConnect video visits</h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck,  title: 'Verified only',     body: 'Every doctor\'s credentials are checked against the public register. Disciplinary actions trigger de-listing within 48 hours.' },
              { icon: Lock,         title: 'End-to-end encrypted',   body: 'Daily.co video infrastructure with HIPAA-grade compliance. Time-bounded room access — only the assigned patient and doctor can join.' },
              { icon: Languages,    title: 'Multi-language doctors', body: 'Malayalam, English, Hindi, Tamil, Kannada, Arabic. Filter by language on the directory.' },
              { icon: Globe2,       title: 'Open to global patients',body: 'Patients in the Gulf, US, UK, Australia, EU consult Kerala specialists from home. International phone codes + country dropdowns built in.' },
              { icon: MessageSquare,title: 'Chat + screen share',    body: 'Bring lab reports or photos into the call. Use chat for follow-up questions during the consultation itself.' },
              { icon: Smartphone,   title: 'Works on any device',    body: 'No app to install. Camera + mic preview runs in the browser. Mobile, tablet, laptop — all work.' },
            ].map((b) => (
              <article key={b.title} className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
                <b.icon className="w-6 h-6 text-kerala-700 mb-3" />
                <h3 className="font-serif text-lg text-kerala-700">{b.title}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{b.body}</p>
              </article>
            ))}
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

      {/* FINAL CTA */}
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

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-4 pointer-events-none">
        <Link
          href="/doctors?online=true"
          className="block w-full text-center px-4 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold shadow-cardLg pointer-events-auto"
        >
          Book a consultation now →
        </Link>
      </div>
    </>
  )
}
