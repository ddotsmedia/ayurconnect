import CityDoctorsPage, { buildCityMetadata, type CityConfig } from '../../../components/city/city-doctors-page'

const CFG: CityConfig = {
  slug: 'dubai',
  cityName: 'Dubai',
  countryCode: 'AE',
  countryName: 'United Arab Emirates',
  licenseAuthority: 'DHA',
  intro: 'CCIM-verified Kerala Ayurveda doctors offering video consultation to patients across Dubai. End-to-end encrypted, prescription emailed within minutes, fluent in English, Malayalam, Hindi and Arabic.',
  whyHere: [
    {
      title: 'Authentic Kerala lineage',
      body: 'Every doctor trained in classical Kerala Ayurveda (BAMS, MD-Ayurveda) and CCIM-registered. We cross-check the public register; disciplinary actions trigger de-listing within 48 hours.',
    },
    {
      title: 'Built for the Kerala diaspora',
      body: 'Dubai\'s ~150,000 Kerala-origin residents get same-language care — doctors speak Malayalam fluently, understand family-style consultations, and coordinate care with relatives in Kerala when needed.',
    },
    {
      title: 'Timezone-aware slots',
      body: 'Doctors offer Gulf-morning slots (IST 11 AM – 3 PM is comfortable for Dubai office workers). Same-week appointments routine; same-day available with online-now doctors.',
    },
    {
      title: 'Complements local DHA clinics',
      body: 'Many patients use AyurConnect for continuous Ayurvedic care between visits to their local DHA-licensed clinic. For first Panchakarma assessment we recommend in-person Nadi-Pariksha; for follow-ups, lifestyle disorders, and chronic care, video is clinically appropriate.',
    },
    {
      title: 'Transparent fees',
      body: 'No hidden platform charges. Each doctor displays their consultation rate (typically ₹500–₹1,500 / AED 22–66) on their profile. Free reschedule up to 4 hours before; full refund on verified technical failure.',
    },
    {
      title: 'Dedicated concierge',
      body: 'WhatsApp +971 55 448 5169 — message your concern and preferred language, and our concierge matches you to a CCIM-verified doctor and sets up the consultation within an hour. This number is the AyurConnect concierge, not any doctor\'s direct line. Care coordinator on +971 50 937 9212 (IST 9 AM–6 PM).',
    },
  ],
  treatments: [
    { slug: 'stress-anxiety',    name: 'Stress, anxiety & sleep',           brief: 'Manasika consultations + Shirodhara protocol guidance for working professionals in Dubai\'s high-pressure environment.' },
    { slug: 'pcos',              name: 'PCOS & fertility',                  brief: 'Prasuti Tantra specialists. Kerala Ayurveda has 3,000+ years of menstrual + fertility expertise — Charaka-style assessment over video.' },
    { slug: 'arthritis',         name: 'Joint pain & arthritis',            brief: 'Long-term Kayachikitsa + Panchakarma planning. Initial assessment online; refer to Dubai DHA clinics for in-person Kati-Basti when needed.' },
  ],
  faq: [
    {
      q: 'Do these Ayurveda doctors have a DHA licence?',
      a: 'Our listed doctors are CCIM-registered in India, not DHA-licensed in the UAE. DHA licensing is for in-person clinical practice within UAE jurisdiction. For online consultations originating from a doctor based in India, the relevant qualification is their CCIM registration plus state-council registration (which we verify). If you need in-person care in Dubai, look for a DHA-licensed clinic; if you need authentic Kerala-lineage Ayurveda from anywhere, our video consultations work fine.',
    },
    {
      q: 'Will the doctor speak Malayalam?',
      a: 'Most doctors on AyurConnect speak Malayalam fluently as their first language plus English and Hindi. Filter by language on the directory to find a perfect match.',
    },
    {
      q: 'How does payment work in AED?',
      a: 'Doctors set their own fees in INR. AyurConnect doesn\'t process payment — you pay the doctor directly via their preferred channel (Razorpay, UPI, or bank transfer). Most accept AED via international wire or services like Wise; ask your doctor before the call.',
    },
    {
      q: 'Can the doctor prescribe medicines I can buy in Dubai?',
      a: 'Yes. Classical Ayurvedic formulations (Yogaraj Guggulu, Ashwagandharishta, etc.) are widely available at Kottakkal, AVN, and Vaidyaratnam outlets in Dubai (Karama, Bur Dubai, Al Quoz). The doctor adapts the prescription to what\'s realistically obtainable locally.',
    },
    {
      q: 'Are Ayurveda consultations covered by UAE health insurance?',
      a: 'Most UAE insurance schemes don\'t cover Ayurveda (TPM is not on the essential benefits package). However, some employer schemes — especially with Daman, ADNIC, and OrientUNB — include AYUSH or "alternative medicine" benefits. We provide GST-compliant receipts you can submit for reimbursement claims.',
    },
    {
      q: 'Can I bring my parent in Kerala into the call?',
      a: 'Yes — 3-way video consultations are common for Dubai-based patients with elderly parents in Kerala. The doctor explains the protocol to both of you; you handle logistics and translation if needed.',
    },
  ],
}

export const metadata = buildCityMetadata(CFG)

export default function Page() {
  return <CityDoctorsPage cfg={CFG} />
}
