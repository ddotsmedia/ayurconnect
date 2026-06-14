import type { Metadata } from 'next'
import { pageMetadata } from '../../../../lib/seo'
import { RegisterLanding } from '../../register-landing/_landing'

export const metadata: Metadata = pageMetadata({
  path: '/doctors/register/uae',
  title: 'Ayurveda Doctors in UAE — Register Free | AyurConnect',
  description: 'Free verified profile for Ayurveda doctors practising in the UAE. DHA/DOH/MOH verification badge, Malayali diaspora patient leads, WhatsApp integration.',
  keywords: ['ayurveda doctor UAE registration', 'ayurveda doctor dubai abu dhabi', 'DHA ayurveda doctor', 'malayali ayurveda doctor UAE', 'register ayurveda UAE'],
})

export default function UaeLanding() {
  return <RegisterLanding
    audience="For Ayurveda doctors in the UAE"
    title="Ayurveda Doctors in the UAE — Get Verified, Get Patients"
    subtitle="The UAE has 3M+ Malayalis and a fast-growing wellness market. Free verified profile, direct WhatsApp inquiries, DHA/DOH/MOH badge."
    benefits={[
      'DHA / DOH / MOH verification badge',
      'Malayali diaspora patient leads (3M+ in UAE)',
      'Arabic + English profile fields',
      'WhatsApp integration (default UAE channel)',
      'Listed across Dubai, Abu Dhabi, Sharjah, Ajman',
      'Featured in /heal-in-kerala UAE landing',
      'AED + INR pricing for international packages',
      'Cross-promotion with Kerala source clinics',
    ]}
    testimonials={[
      { q: 'Most of my inquiries now come from WhatsApp via AyurConnect. The UAE Malayalis trust the verification badge.',     by: 'Dr. Shyam — DHA-licensed, Karama clinic' },
      { q: 'AyurConnect made it easy to be discovered by patients searching for Ayurveda doctors near them in Dubai.',         by: 'Dr. Hridya — Ayur Clinic, JLT' },
      { q: 'The cross-promotion with Kerala source clinics helps me refer complex cases home and follow up locally.',           by: 'Dr. Anand — Abu Dhabi senior Ayurveda physician' },
    ]}
    faqs={[
      { q: 'Do I need DHA/DOH/MOH to be listed?',         a: 'Strongly recommended — patients filter by license. You can still list as "BAMS qualified" pending local licensing.' },
      { q: 'How does Malayalam patient discovery work?',  a: 'Most of our 120K+ WhatsApp community is Malayali. Patient inquiries default to Malayalam; you can choose to reply in English.' },
      { q: 'Can I list a clinic + my personal profile?',  a: 'Yes — register your hospital/clinic at /hospitals/register too. Cross-links happen automatically.' },
      { q: 'Are there UAE-specific search filters?',      a: 'Emirate, area, language spoken, accepting walk-ins, home-visit available, insurance accepted.' },
    ]}
  />
}
