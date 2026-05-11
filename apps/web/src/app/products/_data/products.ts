// Enterprise product waitlists — HMS, SaaS, mobile. Each has a landing page
// with pitch + feature list + waitlist signup (kind='product_waitlist').
// These products are NOT yet built; this page captures early interest.

export type EnterpriseProduct = {
  slug: string
  name: string
  tagline: string
  metaTitle: string
  metaDescription: string
  audience: string[]
  pitch: string
  modules: Array<{ title: string; detail: string }>
  pricing: string
  status: 'concept' | 'design' | 'in-development' | 'pilot'
  rolloutETA: string
}

export const PRODUCTS: Record<string, EnterpriseProduct> = {
  hms: {
    slug: 'hms',
    name: 'AyurConnect HMS',
    tagline: 'The Hospital Management System built for Ayurvedic hospitals',
    metaTitle: 'AyurConnect HMS — Ayurveda-Native Hospital Management',
    metaDescription: 'Ayurveda-native HMS: Panchakarma workflow, classical-pharmacy inventory, IPD/OPD, billing, NABH-AYUSH compliance. Multi-branch ready. Join the early-access waitlist.',
    audience: ['Multi-branch Ayurveda hospital chains', 'NABH-AYUSH accredited centres', 'Government Ayurveda hospitals', 'Panchakarma resorts with > 30 beds'],
    pitch: `Mainstream HMS products (Practo, Lybrate, Plus91) are designed for allopathic clinics — they treat Ayurveda as an afterthought. AyurConnect HMS is purpose-built for the Ayurvedic clinical workflow: Prakriti-Vikriti charting, Panchakarma procedure scheduling, classical pharmacy inventory with batch tracking, IPD/OPD distinction, multi-branch consolidation, and NABH-AYUSH audit readiness from day one.`,
    modules: [
      { title: 'Ayurvedic clinical records', detail: 'Charaka-style intake (Ashtavidha Pariksha, Dashvidha Pariksha), Prakriti + Vikriti tracking over time, dosha-aware prescription templates, Sanskrit-aware OCR for handwritten case sheets.' },
      { title: 'Panchakarma workflow', detail: 'Purvakarma → Pradhanakarma → Paschatkarma sequencing per patient, therapy-room scheduling, Samsarjana-Krama diet auto-generation, multi-therapist synchronisation for Pizhichil / Navarakizhi.' },
      { title: 'Classical pharmacy', detail: 'Inventory with batch + expiry + GMP-source tracking, automatic re-order on low stock, internal kashaya / asava / arishtam preparation logs, Hospital Pharmacy GSTR-compliant invoicing.' },
      { title: 'IPD / OPD / Day-care', detail: 'Bed management, IPD nursing notes, OPD queue, day-care Panchakarma cycle tracking, room-class billing, companion-bed inventory.' },
      { title: 'Billing & insurance', detail: 'Razorpay + standard PG integration, ABDM-compliant claims, multi-currency for medical-tourism patients, GST 18%/12%/5% slabs handled correctly per service.' },
      { title: 'Multi-branch & analytics', detail: 'Consolidated multi-location view, branch-level P&L, doctor-utilisation reports, procedure-mix analytics, NABH-AYUSH audit pack auto-export.' },
      { title: 'Patient portal & telemedicine', detail: 'Patient app with appointment booking, video consults via Daily.co, e-prescription, follow-up reminders, post-procedure care plans.' },
      { title: 'Integrations', detail: 'AyurConnect public directory listing, lab + radiology HL7/FHIR adapters, ABDM (Ayushman Bharat) integration for unified health records.' },
    ],
    pricing: 'Per-bed monthly subscription — exact pricing announced at launch. Pilot partners receive 12-month early-bird rates.',
    status: 'concept',
    rolloutETA: 'Pilot Q4 2026 · GA early 2027',
  },

  saas: {
    slug: 'saas',
    name: 'AyurConnect for Hospitals',
    tagline: 'White-label Ayurveda directory & telemedicine platform — under your brand',
    metaTitle: 'White-Label SaaS — Run Your Own AyurConnect | Enterprise',
    metaDescription: 'White-label the AyurConnect platform: your domain, your branding, your doctor directory, your AyurBot. Multi-tenant SaaS for hospital chains and Ayurveda networks.',
    audience: ['Hospital chains running 5+ centres', 'Regional Ayurveda networks', 'Insurance + corporate wellness platforms', 'International franchise operations'],
    pitch: `Run your own AyurConnect — same proven platform (CCIM directory, AyurBot, semantic search, treatment library, doctor profiles, booking, telemedicine, content management), but under your domain, with your branding, and with full data isolation. Suitable for hospital chains seeking digital presence without 18-month build cycles.`,
    modules: [
      { title: 'Your domain, your brand', detail: 'Run on your domain (e.g. portal.yourhospital.com), with your logo, palette, typography, and copy. Single-tenant data isolation — your patients\' records never share infrastructure with another tenant.' },
      { title: 'Curated directory', detail: 'Pre-populated with verified Kerala doctor + hospital data, or import your own network. Optional federation with the master AyurConnect directory for patients to discover you.' },
      { title: 'AyurBot with your knowledge', detail: 'The AI assistant trained on your hospital\'s protocols and case studies. RAG-grounded in your content library. Patients get answers consistent with your clinical philosophy.' },
      { title: 'Telemedicine + booking', detail: 'Video consults via your branded Daily.co rooms, calendar integration, slot management, dual-language (EN/ML) SMS + WhatsApp confirmations.' },
      { title: 'Patient portal', detail: 'Health journal, appointment history, prescription archive, payment history. PWA — installs on phone home-screen without app-store friction.' },
      { title: 'CMS + content engine', detail: 'Publish health articles, herb guides, case studies in your voice. SEO-optimised. Editor + reviewer workflow. Bilingual EN + ML support out of the box.' },
      { title: 'Admin + analytics', detail: 'Your admin panel for verification, content moderation, lead pipeline, payments, and patient analytics. SSO-ready (Okta, Google Workspace).' },
      { title: 'Tier-1 support + SLA', detail: '99.5% uptime SLA, dedicated technical account manager, quarterly business reviews. Hosted on Indian + global infrastructure for residency compliance.' },
    ],
    pricing: 'Annual licence based on patient volume + concurrent users. Starter tier from ₹4 lakh / year. Enterprise tier with usage-based pricing.',
    status: 'design',
    rolloutETA: 'Design phase complete · pilot Q3 2026 · GA Q1 2027',
  },

  mobile: {
    slug: 'mobile',
    name: 'AyurConnect Mobile',
    tagline: 'iOS and Android apps for patients and doctors — coming 2026',
    metaTitle: 'AyurConnect Mobile Apps — iOS & Android Waitlist',
    metaDescription: 'Native mobile apps for patients (find doctors, book consultations, AyurBot chat, health journal) and doctors (manage slots, video calls, patient records). Join the waitlist.',
    audience: ['Patients wanting a dedicated app', 'Doctors managing practice on the go', 'Wellness travellers visiting Kerala'],
    pitch: `Native iOS and Android apps for AyurConnect — built in React Native for fast iteration, optimised for offline use on patchy connectivity. Until they launch, our PWA on the web gives 90% of the experience including offline support, push notifications, and home-screen install.`,
    modules: [
      { title: 'Patient app', detail: 'Find doctors with biometric auth, book + reschedule appointments, AyurBot chat with voice input, health journal with reminders, video consultations, e-prescriptions, push notifications for follow-ups.' },
      { title: 'Doctor app', detail: 'Manage availability slots, accept / decline bookings, video consultations via integrated camera, e-prescribe from approved templates, patient records, daily revenue dashboard.' },
      { title: 'Offline-first', detail: 'Browse the herb database, treatment guides, and your own consultation notes without internet. Sync automatically when you reconnect — designed for travelling to interior Kerala or visiting rural patients.' },
      { title: 'Multilingual', detail: 'Full UI in English and Malayalam. Hindi and Arabic targeted for the international roll-out. Right-to-left support for Arabic.' },
      { title: 'PWA today', detail: 'Until native apps land, the AyurConnect web PWA already installs on iOS + Android home-screens, supports push notifications, and works offline. Visit ayurconnect.com from your phone and tap "Add to home screen".' },
    ],
    pricing: 'Free for patients. Doctors continue with current platform pricing — no app-specific upcharge planned.',
    status: 'concept',
    rolloutETA: 'Concept · expected build start Q3 2026 · App Store submissions Q1 2027',
  },
}

export const PRODUCT_SLUGS = Object.keys(PRODUCTS)
