import type { Metadata } from 'next'
import { pageMetadata } from '../../../../lib/seo'
import { RegisterLanding } from '../../register-landing/_landing'

export const metadata: Metadata = pageMetadata({
  path: '/doctors/register/kerala',
  title: 'Kerala Ayurveda Doctors — Join Free',
  description: 'Free verified profile for Kerala Ayurveda doctors. KSMC verification, patient leads, college alumni networking, teleconsult bookings.',
  keywords: ['kerala ayurveda doctor registration', 'kerala BAMS directory', 'ayurveda doctor kerala', 'register ayurveda doctor kerala', 'KSMC verified doctor'],
})

export default function KeralaLanding() {
  return <RegisterLanding
    audience="For Kerala-trained Ayurveda physicians"
    title="Kerala Ayurveda Doctors — Join Kerala's Largest Directory"
    subtitle="Built specifically for Kerala-tradition Ayurveda physicians. KSMC verification, district-level patient leads, alumni networking across all 18 colleges."
    benefits={[
      'Free verified profile with KSMC badge',
      'Listed by Kerala district + specialization',
      'College alumni networking (all 18 BAMS colleges)',
      'Patient inquiries from Kerala + diaspora',
      'Featured in Karkidaka + Panchakarma seasons',
      'Heritage lineage display (Ashtavaidya etc.)',
      'Malayalam bio + Malayalam patient communication',
      'Domestic + international teleconsultation',
    ]}
    testimonials={[
      { q: 'Patients from Dubai found me through AyurConnect — most of them were Malayalis who wanted a Kerala-trained doctor.',  by: 'Dr. Suresh — BAMS, MD, Thiruvananthapuram' },
      { q: 'College alumni section connected me with batchmates I had lost touch with. We now run a referral network.',              by: 'Dr. Lakshmi — BAMS, Government Ayurveda College Kannur' },
      { q: 'Karkidaka season inquiries tripled after I completed my profile. The seasonal featured listing is gold.',                by: 'Dr. Hari — Panchakarma specialist, Ernakulam' },
    ]}
    faqs={[
      { q: 'Is my college listed?',  a: 'All 18 Kerala government + self-financing BAMS colleges are listed on /colleges. Your alumni page goes live as soon as you register.' },
      { q: 'How are leads filtered by district?', a: 'Patient search defaults to their detected district. You appear in your home district + practice district results, with extra weight for Ashtavaidya / lineage matches.' },
      { q: 'Can I be on AyurConnect AND another directory?', a: 'Yes. No exclusivity clause. We pull tcmc.kerala.gov.in registry data so you don\'t have to re-enter credentials.' },
      { q: 'Are international patients real?', a: 'Yes — we route /heal-in-kerala traffic from 15 countries to verified Kerala-trained doctors.' },
    ]}
  />
}
