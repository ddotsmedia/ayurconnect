import type { Metadata } from 'next'
import { pageMetadata } from '../../../../lib/seo'
import { RegisterLanding } from '../../register-landing/_landing'

export const metadata: Metadata = pageMetadata({
  path: '/doctors/register/dubai',
  title: 'Ayurveda Doctors in Dubai — Get Verified Free | AyurConnect',
  description: 'Free verified profile for Ayurveda doctors in Dubai. DHA verification, direct patient inquiries from Karama, JLT, Bur Dubai, DSO, Marina, Deira.',
  keywords: ['ayurveda doctor dubai registration', 'DHA ayurveda doctor', 'ayurveda clinic dubai', 'BAMS dubai', 'register ayurveda doctor dubai'],
})

export default function DubaiLanding() {
  return <RegisterLanding
    audience="For Ayurveda doctors practising in Dubai"
    title="Ayurveda Doctors in Dubai — Get Discovered, Get Patients"
    subtitle="Dubai has 30+ verified Ayurveda clinics and growing. Free DHA-friendly verified profile. Patients searching for Ayurveda doctors near Karama, JLT, Bur Dubai, Marina, DSO, Deira."
    benefits={[
      'DHA verification badge for licensed practitioners',
      'Listed in Dubai-specific search (/dubai/ayurveda-doctors)',
      'WhatsApp integration — UAE\'s default patient channel',
      'Area-level visibility (Karama, JLT, Marina, etc.)',
      'Arabic + English profile fields',
      'Featured in /heal-in-kerala/uae for medical tourism',
      'Cross-referrals with Sharjah + Abu Dhabi clinics',
      'AED + INR consultation packaging',
    ]}
    testimonials={[
      { q: 'Patients walking past my Karama clinic Google-searched and found me on AyurConnect first. Multiple bookings every week.', by: 'Dr. Shyam — Dr. Shyam\'s Ayurveda, Karama' },
      { q: 'AyurConnect\'s WhatsApp share template is what gets shared in Malayalam women\'s groups in Dubai. Free, organic patient flow.',  by: 'Dr. Hridya — Bur Dubai senior physician' },
      { q: 'The Dubai-area search filter brings in patients who specifically want a clinic nearby — better conversion than generic listings.', by: 'Dr. Suresh — JLT Ayurveda clinic' },
    ]}
    faqs={[
      { q: 'Is DHA verification mandatory?',        a: 'Recommended but not required to list. The DHA badge boosts patient trust dramatically.' },
      { q: 'Can I show my clinic too?',             a: 'Yes — register your clinic at /hospitals/register and link your profile to it. Both pages cross-link automatically.' },
      { q: 'Are Sharjah and Abu Dhabi patients routed to me?', a: 'Only if your profile says you accept teleconsult or are open to commute. Otherwise we route by emirate.' },
      { q: 'How do payments work?',                 a: 'For teleconsult / packages: AyurConnect facilitates. For walk-ins: you handle directly. We do not take a cut on free-tier doctors.' },
    ]}
  />
}
