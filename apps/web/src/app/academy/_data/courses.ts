// Academy course catalogue. Full LMS (video lessons, quizzes, certificates,
// instructor dashboard, progress tracking) is a multi-week build deferred to
// a later phase. This page captures expressions of interest so we can prioritise
// which courses to build first.

export type CourseLevel = 'introduction' | 'intermediate' | 'professional' | 'specialised'
export type CourseFormat = 'self-paced' | 'cohort' | 'live'

export type Course = {
  slug: string
  title: string
  tagline: string
  level: CourseLevel
  format: CourseFormat
  durationWeeks: number
  audience: string[]
  outcomes: string[]
  modules: string[]
  prerequisite: string
  priceRange: string
  status: 'planned' | 'in-development' | 'pilot'
}

export const COURSES: Course[] = [
  {
    slug: 'ayurveda-foundations',
    title: 'Ayurveda Foundations',
    tagline: 'From dosha to dinacharya — what every learner should know first',
    level: 'introduction',
    format: 'self-paced',
    durationWeeks: 6,
    audience: ['Beginners', 'Health enthusiasts', 'Patients of Ayurvedic care', 'Non-clinical professionals'],
    outcomes: [
      'Understand Tridosha theory and how to identify your Prakriti',
      'Build a personalised Dinacharya (daily routine)',
      'Recognise common dosha-imbalance signs early',
      'Use 20 foundational kitchen herbs confidently',
    ],
    modules: [
      'Origins of Ayurveda + the Six Darshanas',
      'Pancha Mahabhuta + Tridosha doctrine',
      'Prakriti & Vikriti — constitution vs current state',
      'Dinacharya & Ritucharya — daily + seasonal routines',
      '20 essential kitchen herbs in depth',
      'Practical: building your own daily protocol',
    ],
    prerequisite: 'None — open to all',
    priceRange: '₹2,499 – ₹4,999',
    status: 'planned',
  },
  {
    slug: 'panchakarma-fundamentals',
    title: 'Panchakarma Fundamentals',
    tagline: 'The 5 actions explained for patients and beginning practitioners',
    level: 'intermediate',
    format: 'cohort',
    durationWeeks: 8,
    audience: ['Patients planning Panchakarma', 'Wellness centre staff', 'BAMS first-years', 'Yoga teachers'],
    outcomes: [
      'Understand when each of the 5 procedures is indicated',
      'Recognise contraindications + warning signs',
      'Coach patients through Purvakarma, Pradhanakarma, Paschatkarma phases',
      'Identify a competent vs unsafe Panchakarma centre',
    ],
    modules: [
      'Classical texts on Panchakarma (Charaka, Sushruta)',
      'Vamana — emesis protocol, indications, contraindications',
      'Virechana — purgation protocol + practical case studies',
      'Basti — Niruha + Anuvasana basti distinctions',
      'Nasya + Raktamokshana',
      'Samsarjana Krama (post-procedure diet)',
      'Centre selection criteria + case studies',
      'Live Q&A with senior Panchakarma physicians',
    ],
    prerequisite: 'Ayurveda Foundations OR equivalent introductory knowledge',
    priceRange: '₹6,999 – ₹14,999',
    status: 'in-development',
  },
  {
    slug: 'ayurveda-for-nurses',
    title: 'Ayurveda for Nurses',
    tagline: 'Integrate Ayurvedic principles into modern nursing care',
    level: 'professional',
    format: 'live',
    durationWeeks: 12,
    audience: ['RNs', 'BSc Nursing students', 'Hospital wellness coordinators', 'Home-health nurses'],
    outcomes: [
      'Apply Ayurvedic lifestyle counselling alongside allopathic protocols',
      'Identify when patients would benefit from Ayurvedic referral',
      'Safely administer therapeutic massage adjuncts',
      'Educate patients on dosha-appropriate diet + sleep',
    ],
    modules: [
      'Ayurveda meets modern medicine — integration without conflict',
      'Patient assessment: Nadi + Jihva + Mala + Mutra pariksha basics',
      'Common drug-herb interactions to watch for',
      'Practical: Abhyanga, Swedana, Shirodhara assistance',
      'Ayurvedic dietary counselling in clinical settings',
      'Geriatric, paediatric, and oncology nursing perspectives',
      'Field placement at a NABH-AYUSH hospital',
      'Final assessment + certification exam',
    ],
    prerequisite: 'Active nursing registration (any country)',
    priceRange: '₹18,000 – ₹35,000',
    status: 'planned',
  },
  {
    slug: 'ccim-foundation-prep',
    title: 'CCIM Foundation / BAMS Prep',
    tagline: 'Structured preparation for BAMS entrance + Foundation Year syllabus',
    level: 'intermediate',
    format: 'cohort',
    durationWeeks: 16,
    audience: ['BAMS aspirants', 'NEET-AYUSH candidates', 'BAMS 1st-year students'],
    outcomes: [
      'Master Sanskrit terminology used across the BAMS syllabus',
      'Build foundation in Padartha Vigyan, Sharira Rachana, Sharira Kriya',
      'Solve Foundation Year exam problems with classical reasoning',
      'Connect classical theory to clinical observation',
    ],
    modules: [
      'Ayurveda Sanskrit — terminology & grammar essentials',
      'Padartha Vigyan (philosophy of substance)',
      'Sharira Rachana (Ayurvedic anatomy)',
      'Sharira Kriya (Ayurvedic physiology)',
      'Dravyaguna basics — 50 essential herbs',
      'Mock NEET-AYUSH papers + clinical reasoning sets',
    ],
    prerequisite: '12th-grade science completion',
    priceRange: '₹12,000 – ₹28,000',
    status: 'planned',
  },
  {
    slug: 'ayurveda-business',
    title: 'Running an Ayurvedic Clinic',
    tagline: 'Practice management for new BAMS / MD graduates',
    level: 'professional',
    format: 'self-paced',
    durationWeeks: 8,
    audience: ['Newly-qualified BAMS / MD doctors', 'Clinic owners', 'Investors entering Ayurveda'],
    outcomes: [
      'Set up a CCIM-compliant clinic — licensing, pharmacy, records',
      'Pricing strategy for OPD + Panchakarma packages',
      'Patient acquisition, retention, and referral systems',
      'Avoid common compliance + legal pitfalls',
    ],
    modules: [
      'CCIM / NCISM compliance for solo + group practice',
      'Clinic location, layout, and equipment essentials',
      'Pharmacy + inventory management',
      'Pricing models — OPD, Panchakarma, telemedicine',
      'Digital presence + AyurConnect listing optimisation',
      'Insurance, GST, accountancy basics',
      'Patient records + DPDP Act 2023 compliance',
    ],
    prerequisite: 'BAMS / MD (Ayurveda) graduate or current student',
    priceRange: '₹8,999 – ₹19,999',
    status: 'planned',
  },
  {
    slug: 'kerala-panchakarma-masterclass',
    title: 'Kerala Panchakarma Masterclass',
    tagline: 'Pizhichil, Navarakizhi, Shirodhara — the Kerala-specific procedures',
    level: 'specialised',
    format: 'live',
    durationWeeks: 4,
    audience: ['MD Panchakarma candidates', 'Senior BAMS practitioners', 'International integrative-medicine MDs'],
    outcomes: [
      'Perform Pizhichil with classical synchronisation',
      'Calibrate Shirodhara stream timing for different conditions',
      'Prepare specialised Kerala oils correctly',
      'Avoid the 5 most common technique errors',
    ],
    modules: [
      'Kerala vs North Indian Panchakarma tradition',
      'Pizhichil — multi-therapist synchronisation',
      'Navarakizhi & Shashtika Shali pinda sweda',
      'Shirodhara, Shirobasti, Shiroabhyanga distinctions',
      'Special Kerala oils — Karpasasthyadi, Dhanwantharam, Murivenna',
      'In-person practical at a Kerala flagship centre',
    ],
    prerequisite: 'BAMS + 2 years clinical experience',
    priceRange: '₹35,000 – ₹85,000',
    status: 'pilot',
  },
]
