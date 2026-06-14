import type { Metadata } from 'next'
import { pageMetadata } from '../../../../lib/seo'
import { RegisterLanding } from '../../register-landing/_landing'

export const metadata: Metadata = pageMetadata({
  path: '/doctors/register/bams',
  title: 'BAMS Doctors — Register Free on AyurConnect (Kerala-trained directory)',
  description: 'Free verified BAMS doctor profile on Kerala\'s largest Ayurveda directory. KSMC verification badge, patient inquiries, teleconsult bookings.',
  keywords: ['BAMS doctor registration', 'BAMS doctor directory', 'BAMS verified profile', 'BAMS practitioner kerala', 'register as BAMS doctor'],
})

export default function BamsLanding() {
  return <RegisterLanding
    audience="For BAMS practitioners"
    title="BAMS Doctors — Get Your Free Verified Profile"
    subtitle="Join 500+ BAMS doctors on Kerala's most comprehensive Ayurveda directory. KSMC verification, patient leads, teleconsultation bookings."
    benefits={[
      'Free verified BAMS profile with KSMC/CCIM badge',
      'Direct patient inquiries delivered to your inbox',
      'Listed by your BAMS college (alumni networking)',
      'Teleconsultation bookings via secure video',
      'Shareable WhatsApp profile link',
      'Featured in AyurConnect AI doctor-match',
      'Track CME credits + answer Q&A',
      'Refer colleagues and earn the Referrer badge',
    ]}
    testimonials={[
      { q: 'Patient inquiries started within 2 weeks of registering. The KSMC badge alone gave me 3× more profile visits.', by: 'Dr. Anil — BAMS, MD (Kayachikitsa), Ernakulam' },
      { q: 'Three of my batchmates joined after I shared my profile. Now my whole 2014 batch from VPSV is listed.',         by: 'Dr. Priya — BAMS, Vaidyaratnam P.S. Varier college' },
      { q: 'Best decision was completing 100% of my profile. I now rank in the top 10 for Panchakarma in Thrissur.',         by: 'Dr. Ramesh — BAMS, Senior Panchakarma physician' },
    ]}
    faqs={[
      { q: 'Do I need to be CCIM/KSMC registered?', a: 'You can register without it but verification requires your CCIM or KSMC registration number. We cross-check against the public Kerala State Medical Council register.' },
      { q: 'How long does verification take?', a: '5–7 business days after submitting your registration number, degree certificate, and a recent photo ID.' },
      { q: 'What does the free tier include?', a: 'Verified profile, patient inquiries, teleconsultation, Q&A answers, CME tracking, profile analytics, referral system. No paywall on core features.' },
      { q: 'Can I delete my profile later?', a: 'Yes, anytime from dashboard settings. All your data is deletable on request.' },
    ]}
  />
}
