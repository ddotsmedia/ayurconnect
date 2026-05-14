import CityDoctorsPage, { buildCityMetadata, type CityConfig } from '../../../components/city/city-doctors-page'

const CFG: CityConfig = {
  slug: 'sharjah',
  cityName: 'Sharjah',
  countryCode: 'AE',
  countryName: 'United Arab Emirates',
  licenseAuthority: 'MOH',
  intro: 'CCIM-verified Kerala Ayurveda doctors offering video consultations to patients across Sharjah and Ajman. English / Malayalam / Hindi / Arabic. Same-week slots, end-to-end encrypted.',
  whyHere: [
    {
      title: 'Authentic Kerala Ayurveda',
      body: 'Doctors trained in the original classical framework. CCIM-verified, with cross-checked state-council registrations. Not wellness-tourism — clinical Ayurveda.',
    },
    {
      title: 'Kerala expat community',
      body: 'Sharjah has the largest Kerala-origin population per capita in the UAE outside of Dubai. Our doctors speak Malayalam natively and understand family-style consultations.',
    },
    {
      title: 'Complements local MOH clinics',
      body: 'Kottakkal has a Sharjah branch under MOH-UAE licensing for in-person procedures. We complement that with online consultations between in-person visits, or for patients who can\'t travel to a clinic.',
    },
    {
      title: 'Affordable + transparent',
      body: 'Doctors set their own fees, displayed on the profile. Typical range ₹500–₹1,500 (AED 22–66). No platform charges; free reschedule + refund on technical failure.',
    },
    {
      title: 'Family + group bookings',
      body: 'Common Sharjah pattern: book a 60-minute consultation that covers 2-3 family members at the same time. Discuss with the doctor when booking.',
    },
    {
      title: 'WhatsApp concierge',
      body: 'Don\'t want to browse profiles? WhatsApp +971 55 448 5169 — share your concern, and our concierge matches you to a CCIM-verified doctor within an hour. This is the AyurConnect concierge number; the matched doctor handles the consultation itself.',
    },
  ],
  treatments: [
    { slug: 'pcos',           name: 'PCOS & women\'s health', brief: 'Prasuti Tantra specialists with deep classical training. Online assessment + medication + diet plan.' },
    { slug: 'stress-anxiety', name: 'Stress & anxiety',       brief: 'Manasika consultations; ideal for shift-workers and high-stress Sharjah-based professionals.' },
    { slug: 'arthritis',      name: 'Arthritis & joint pain', brief: 'Long-term Ayurvedic care — online consult, in-person Kati-Basti at Kottakkal Sharjah when needed.' },
  ],
  faq: [
    {
      q: 'Is the doctor licensed in the UAE?',
      a: 'Doctors on AyurConnect are CCIM-registered in India and licensed by their respective state councils. For online consultations originating from a doctor based in India, this is the relevant qualification. For in-person Ayurvedic care within Sharjah, look for an MOH-UAE licensed clinic such as Kottakkal Sharjah.',
    },
    {
      q: 'What languages do the doctors speak?',
      a: 'Most speak Malayalam (native), English (fluent), Hindi (fluent), and sometimes Arabic. Filter by language on the directory to find your match.',
    },
    {
      q: 'Can I get classical Ayurvedic medicines in Sharjah?',
      a: 'Yes — Kottakkal Sharjah, several Indian pharmacy chains in Rolla, and certain Sharjah supermarkets stock the major classical formulations. Your doctor will adapt the prescription to what\'s realistically available locally.',
    },
    {
      q: 'How much does an online consultation cost?',
      a: 'Doctors set their own fees: typically ₹500–₹1,500 per consultation (about AED 22–66). Some offer a free 10-minute orientation call. AyurConnect charges no platform fee on top.',
    },
    {
      q: 'How is this different from local Ayurveda clinics in Sharjah?',
      a: 'Local clinics are great for in-person treatments (Pizhichil, Shirodhara, Abhyanga) and physical examination. AyurConnect is best for: continuous follow-up care, second opinions, niche-specialty access (you can find a doctor with a specific Charaka-style focus that no Sharjah clinic offers), and family-coordination calls with relatives in Kerala.',
    },
    {
      q: 'Can my kids consult an Ayurveda paediatrician?',
      a: 'Yes — Kaumarbhritya specialists (Ayurvedic paediatrics) on the platform consult children for asthma, allergies, recurrent infections, and digestion issues. Parent must be present on the call for minors.',
    },
  ],
}

export const metadata = buildCityMetadata(CFG)

export default function Page() {
  return <CityDoctorsPage cfg={CFG} />
}
