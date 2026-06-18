export type Workshop = {
  slug: string
  title: string
  instructor: string
  instructorBio: string
  description: string
  duration: number  // minutes
  type: 'live_webinar' | 'recorded'
  status: 'upcoming' | 'completed'
  recordingUrl: string
  thumbnailUrl?: string
  tags: string[]
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: 'introduction-to-panchakarma',
    title: 'Introduction to Panchakarma — Theory & Practice',
    instructor: 'AyurConnect Academic Faculty',
    instructorBio: 'Senior Panchakarma consultants from Kerala Ayurveda colleges with combined 100+ years of clinical experience.',
    description: 'A comprehensive overview of the 5 classical Panchakarma procedures — vamana, virechana, basti, nasya, raktamokshana. This 90-minute workshop covers indications, contraindications, complete procedural details, samyak signs, sansarjana karma, and integration with modern clinical practice. Ideal for BAMS interns and recent graduates planning to specialise in or practise Panchakarma. We discuss real outcomes data from Kerala hospitals and how to set realistic patient expectations. Q&A session included.',
    duration: 90,
    type: 'recorded',
    status: 'completed',
    recordingUrl: '#',
    tags: ['panchakarma', 'shodhana', 'vamana', 'virechana', 'basti'],
  },
  {
    slug: 'nadi-pariksha-masterclass',
    title: 'Nadi Pariksha — Pulse Diagnosis Masterclass',
    instructor: 'Vaidyamadham Lineage Faculty',
    instructorBio: 'Traditional Ashtavaidya physicians sharing classical Nadi Pariksha methodology preserved across generations.',
    description: 'Nadi Pariksha (pulse diagnosis) is the most refined clinical assessment tool in Ayurveda. This 60-minute masterclass demonstrates the classical 3-finger technique, identifies vata-pitta-kapha pulse patterns, shows how to read dhatu-specific pulses, and covers seasonal + diurnal variations. Includes live demonstrations on real patients with various dosha imbalances. Suitable for clinical practitioners and senior BAMS students. Pre-requisite: basic doshic theory.',
    duration: 60,
    type: 'recorded',
    status: 'completed',
    recordingUrl: '#',
    tags: ['nadi-pariksha', 'diagnosis', 'pulse-reading', 'clinical-skills'],
  },
  {
    slug: 'dha-exam-preparation',
    title: 'DHA Exam Preparation for Ayurveda Doctors',
    instructor: 'AyurConnect Career Faculty',
    instructorBio: 'DHA-licensed Ayurveda physicians actively practising in Dubai with 10+ years of GCC experience.',
    description: 'A 120-minute structured workshop covering: DHA application process, Sheryan portal navigation, Prometric exam structure (MCQs, time management, scoring), exam-specific topics with highest weightage, common student pitfalls, document attestation timeline, Dataflow PSV process, post-exam license activation, and salary negotiation in Dubai. Practice questions discussed live. Includes downloadable preparation checklist + 100-question practice bank.',
    duration: 120,
    type: 'recorded',
    status: 'completed',
    recordingUrl: '#',
    tags: ['dha', 'dubai', 'licensing', 'career', 'gcc'],
  },
  {
    slug: 'classical-formulation-identification',
    title: 'Classical Formulation Identification — Practical Workshop',
    instructor: 'AyurConnect Pharmacology Faculty',
    instructorBio: 'Senior Dravyaguna + Rasashastra faculty with classical pharmacology expertise.',
    description: '75-minute practical workshop on identifying and authenticating classical Ayurveda formulations. Covers: visual + organoleptic identification of common formulations (Triphala churnam, Trikatu, Chyavanaprasha, Mahanarayana taila, Saraswatarishta, Dashamoolarishta). Distinguishing genuine from adulterated samples. Quality parameters per Sharangadhara. Microscopic identification basics. Includes real samples shown via close-up video. Essential for clinical practitioners who prescribe + dispense.',
    duration: 75,
    type: 'recorded',
    status: 'completed',
    recordingUrl: '#',
    tags: ['formulation', 'dravyaguna', 'rasashastra', 'practical', 'quality'],
  },
  {
    slug: 'ayurveda-career-uae-gcc',
    title: 'Ayurveda Career Opportunities in UAE & GCC',
    instructor: 'AyurConnect Recruitment Faculty',
    instructorBio: 'Recruiters + senior practitioners actively placing doctors in UAE clinics and Gulf hospitals.',
    description: '45-minute career-focused webinar covering: GCC Ayurveda market overview (UAE, Qatar, Oman, Saudi, Kuwait, Bahrain), realistic salary ranges by specialisation and experience, top hiring clinics in each emirate, interview preparation tips, contract negotiation essentials (housing, transport, end-of-service, indemnity), licensing timeline for DHA/DOH/MOHAP/QCHP/SCFHS, family relocation considerations (schooling, healthcare), and red flags in employment offers. Q&A from practising doctors.',
    duration: 45,
    type: 'recorded',
    status: 'completed',
    recordingUrl: '#',
    tags: ['career', 'gcc', 'uae', 'job-portal', 'recruitment'],
  },
]

export const WORKSHOP_SLUGS = WORKSHOPS.map((w) => w.slug)
