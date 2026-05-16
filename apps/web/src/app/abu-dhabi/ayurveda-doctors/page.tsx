import CityDoctorsPage, { buildCityMetadata, type CityConfig } from '../../../components/city/city-doctors-page'

const CFG: CityConfig = {
  slug: 'abu-dhabi',
  cityName: 'Abu Dhabi',
  countryCode: 'AE',
  countryName: 'United Arab Emirates',
  licenseAuthority: 'DOH',
  intro: 'verified Kerala Ayurveda doctors offering video consultation to patients across Abu Dhabi and Al Ain. Classical Ayurvedic care, English / Malayalam / Hindi / Arabic, DOH-aware practitioners.',
  whyHere: [
    {
      title: 'Classical lineage from Kerala',
      body: 'Doctors trained in the original Ashtanga (8 branches) framework — Kayachikitsa, Panchakarma, Prasuti Tantra, Manasika and the rest. Not wellness-spa Ayurveda — full clinical scope.',
    },
    {
      title: 'For the Abu Dhabi expat',
      body: 'Tens of thousands of Kerala-origin professionals work across Abu Dhabi\'s government, oil & gas, and Mohamed bin Zayed University ecosystem. Continuous Ayurvedic care between visits home.',
    },
    {
      title: 'DOH-aware practice',
      body: 'Our doctors understand the DOH framework — many also hold Indian state-council registrations recognised under DOH\'s alternative-medicine pathway. Where in-person care is required, we refer to DOH-licensed clinics in Abu Dhabi.',
    },
    {
      title: 'Government employee flexibility',
      body: 'Many ADNOC, ADHB, and government employees use AyurConnect for off-hours video consultations that don\'t interfere with the work day. Weekend Gulf-time slots are easy to book.',
    },
    {
      title: 'Transparent fees in AED + INR',
      body: 'Each doctor sets their own rate; we list both currencies on the profile. Typical Abu Dhabi-relevant range: AED 22–66 (₹500–₹1,500). No hidden platform charges.',
    },
    {
      title: 'WhatsApp concierge',
      body: 'Message +971 55 448 5169 with your concern and language preference; our concierge matches you to a verified doctor and sets up the consultation within an hour during IST business hours. The number is staffed by AyurConnect (not a single doctor\'s line).',
    },
  ],
  treatments: [
    { slug: 'stress-anxiety', name: 'Stress, sleep & burnout', brief: 'Manasika protocols for high-pressure Abu Dhabi professionals. Shirodhara planning + medication.' },
    { slug: 'diabetes',       name: 'Diabetes & metabolic',    brief: 'Long-term Kayachikitsa care with dietary protocols adapted to Gulf cuisine + lifestyle.' },
    { slug: 'arthritis',      name: 'Joint & spine pain',      brief: 'Video first-line; in-person Kati-Basti when needed — refer to DOH-licensed Abu Dhabi centres.' },
  ],
  faq: [
    {
      q: 'Is AyurConnect a DOH-licensed clinic in Abu Dhabi?',
      a: 'No — AyurConnect is a platform connecting Abu Dhabi patients with verified Kerala Ayurveda doctors via video consultation. For in-person treatment within Abu Dhabi (procedures like Pizhichil or Shirodhara), you\'d visit a DOH-licensed clinic such as Herbal Park or Kottakkal Abu Dhabi. We complement these with online clinical care.',
    },
    {
      q: 'Will the doctor understand my Abu Dhabi context?',
      a: 'Most listed doctors have UAE diaspora patients regularly. They\'re familiar with Gulf-cuisine adaptations (rice + fish vs more refined-carb-heavy meals), Abu Dhabi\'s climate, and the working culture of ADNOC, Etihad, and government employers.',
    },
    {
      q: 'What classical medicines can I get in Abu Dhabi?',
      a: 'Kottakkal Arya Vaidya Sala has Abu Dhabi branches stocking the full classical-formulation catalogue. AVN, Vaidyaratnam, and Pankajakasthuri formulations are also widely available at Indian pharmacy chains in Khalidiya and Mussafah.',
    },
    {
      q: 'Does my Daman / ADNIC insurance cover this?',
      a: 'Standard schemes don\'t. Premium employer schemes sometimes include alternative-medicine reimbursement — check your policy under "AYUSH" or "Alternative Therapy". We provide GST-compliant receipts for claim submission.',
    },
    {
      q: 'Can I add my family to the consultation?',
      a: 'Yes. Multi-party consultations are common for Abu Dhabi-based patients with elderly parents or children in Kerala. The doctor can speak with both parties in the same call.',
    },
    {
      q: 'How fast can I book?',
      a: 'Same-day video consultations are routine; same-week confirmed. WhatsApp our concierge on +971 55 448 5169 for urgent matching — we\'ll connect you to an available doctor.',
    },
  ],
}

export const metadata = buildCityMetadata(CFG)

export default function Page() {
  return <CityDoctorsPage cfg={CFG} />
}
