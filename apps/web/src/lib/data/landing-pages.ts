// SEO keyword landing pages — Phase 1 (2026-07-21).
// 15 pages: 5 conditions + 5 services + 5 jobs. Each entry is a
// LandingContent value consumed by <KeywordLanding>. Metadata title +
// description are held here too so the page.tsx stays a 4-line shell.
//
// Copy is deliberately conservative — no unsubstantiated medical claims,
// no "cure" language. All routes surface the "verified BAMS doctors +
// admin-approved" trust model.

import type { LandingContent } from '../../components/landing/KeywordLanding'

export type LandingSpec = {
  path:        string           // route slug used to key + build canonical URL
  metaTitle:   string           // <title>
  metaDesc:    string           // meta description
  content:     LandingContent
}

const DOCTORS_CTA = { label: 'Book a verified BAMS doctor', href: '/doctors' }
const JOBS_CTA    = { label: 'Browse open jobs',            href: '/jobs' }

// ─── Conditions (5) ────────────────────────────────────────────────────
const conditions: LandingSpec[] = [
  {
    path: '/conditions/pcos-ayurveda',
    metaTitle: 'PCOS & PCOD Ayurveda Treatment | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Expert PCOS / PCOD Ayurveda treatment via verified BAMS doctors. Online consultation, personalised herbal protocols, lifestyle guidance. Free initial assessment.',
    content: {
      slug: '/conditions/pcos-ayurveda',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Conditions', url: '/conditions' }, { name: 'PCOS & PCOD Ayurveda', url: '/conditions/pcos-ayurveda' }],
      eyebrow: 'Women\'s health',
      h1: 'PCOS & PCOD Ayurveda Treatment',
      heroSubtitle: 'Root-cause protocols for polycystic ovary syndrome — hormonal balance, cycle regulation, and metabolism support from Kerala-tradition Ayurveda doctors.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'How Ayurveda approaches PCOS',
          paragraphs: [
            'Ayurveda classifies PCOS under aggravated Kapha and Vata affecting the artava dhatu (reproductive tissue). Treatment is not a single herb — it\'s a coordinated protocol of internal medicines (kashayam, choornam), external therapies (udwarthanam, virechana when indicated), diet, and cycle-aware lifestyle changes.',
            'Personalisation matters: two women with the same lab findings may need different treatment lines depending on prakriti, insulin sensitivity, weight pattern, and cycle history.',
          ],
        },
        {
          title: 'What treatment typically includes',
          paragraphs: [
            'A verified BAMS doctor on AyurConnect will assess your reports, symptom diary, and prakriti before proposing a plan. Common elements:',
          ],
          bullets: [
            'Classical formulations targeting kapha reduction + srotoshuddhi (channel clearing)',
            'Personalised diet emphasising millets, bitter greens, warm cooked food; limits on cold + heavy foods',
            'Cycle-timed lifestyle: sleep window, morning movement, seed cycling where appropriate',
            'Panchakarma referrals (virechana or basti) when the case warrants — done at a Kerala centre',
            'Coordination with your gynaecologist if you\'re on hormonal or metformin therapy',
          ],
        },
        {
          title: 'Why AyurConnect',
          paragraphs: [
            'Every doctor on AyurConnect holds a BAMS or MD (Ayurveda) qualification and passes an admin verification against the CCIM register before their profile goes live. Consultations are online (video), so you can start from anywhere in the world.',
          ],
        },
      ],
      faqs: [
        { q: 'Can Ayurveda regulate irregular periods from PCOS?', a: 'Cycle regulation is realistic over 3-6 months of consistent treatment for most cases, especially when combined with lifestyle changes. Severe hyperandrogenism or long-standing amenorrhea may take longer or need co-management with a gynaecologist.' },
        { q: 'Do I need to stop metformin or hormonal pills before starting Ayurveda?', a: 'No — do not stop any prescribed medication without your gynaecologist\'s approval. Ayurveda works alongside modern medicine; your BAMS doctor will taper you off only when your labs and cycle indicate readiness.' },
        { q: 'Is online consultation effective for PCOS?', a: 'Yes for the majority of consultations. The BAMS doctor reviews your USG, hormone panel, and cycle diary on the video call. In-person Panchakarma is only recommended when the classical protocol requires it.' },
        { q: 'What does a first PCOS consultation cost?', a: 'Fees are set by each doctor — visible on their profile. Free 15-minute initial assessments are offered by many doctors; the first paid consultation typically runs ₹500-₹1500 depending on seniority.' },
        { q: 'Will I need Panchakarma?', a: 'Not always. Milder cases respond to oral medicine + diet + lifestyle. Panchakarma (typically virechana or basti) is added when the doctor sees pronounced kapha-medovaha involvement or long-standing symptoms.' },
        { q: 'How long before I see results?', a: 'Digestion, energy, and sleep often shift within 2-4 weeks. Cycle changes usually take 2-3 cycles. Weight, acne, and hair changes are slower — 4-6 months of consistent treatment is realistic.' },
      ],
      related: [
        { label: 'Thyroid Imbalance Ayurveda',       href: '/conditions/thyroid-ayurveda' },
        { label: 'Online Ayurveda Consultation',     href: '/services/online-consultation' },
        { label: 'Panchakarma Treatment',            href: '/services/panchakarma' },
        { label: 'Find a Prasuti Tantra specialist', href: '/doctors?specialization=Prasuti+Tantra' },
      ],
    },
  },
  {
    path: '/conditions/thyroid-ayurveda',
    metaTitle: 'Thyroid Imbalance Ayurvedic Treatment | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Expert thyroid ayurveda treatment via verified BAMS doctors. Online consultation, personalised herbal protocols, coordinated with your endocrinologist. Free initial assessment.',
    content: {
      slug: '/conditions/thyroid-ayurveda',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Conditions', url: '/conditions' }, { name: 'Thyroid Imbalance Ayurveda', url: '/conditions/thyroid-ayurveda' }],
      eyebrow: 'Endocrine',
      h1: 'Thyroid Imbalance Ayurvedic Treatment',
      heroSubtitle: 'Hypothyroid, hyperthyroid, and Hashimoto\'s — supportive Ayurveda protocols alongside your endocrinologist\'s care, from verified BAMS doctors.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'Ayurveda\'s view of thyroid dysfunction',
          paragraphs: [
            'Thyroid symptoms map to disruptions of agni (metabolic fire) and dhatvagni (tissue metabolism). Hypothyroid presentations tend toward kapha-vata; hyperthyroid presentations toward pitta-vata. Treatment restores agni without disturbing whatever thyroid medication you\'re already on.',
          ],
        },
        {
          title: 'Typical protocol',
          paragraphs: ['Your BAMS doctor coordinates with your endocrinologist and may recommend:'],
          bullets: [
            'Classical formulations for kapha-vata balance (for hypothyroid) or pitta pacification (for hyperthyroid)',
            'Kanchanara guggulu — a traditional formulation frequently used, dosed to your case',
            'Diet + lifestyle changes: warm cooked food, iodine-appropriate salt use, morning routine, stress management',
            'Yoga sequences targeting the throat chakra region — Simhasana, Ujjayi pranayama, Sarvangasana (unless contraindicated)',
            'Panchakarma (virechana, basti) referral if the classical protocol requires it',
          ],
        },
        {
          title: 'Working with your endocrinologist',
          paragraphs: [
            'AyurConnect doctors do not ask you to stop levothyroxine or antithyroid medication. TSH, T3, and T4 monitoring continues per your endocrinologist\'s schedule; Ayurveda works to reduce dose over time only when labs and symptoms both improve.',
          ],
        },
      ],
      faqs: [
        { q: 'Can Ayurveda reverse hypothyroidism?', a: 'For subclinical or early-stage cases with clear kapha-vata pattern, meaningful dose reduction of levothyroxine over 6-12 months is realistic. Long-standing hypothyroidism or autoimmune Hashimoto\'s typically needs continued modern medicine + supportive Ayurveda.' },
        { q: 'Will I need to stop my thyroid medication?', a: 'No. Never stop levothyroxine or antithyroid medication without your endocrinologist. Your BAMS doctor will only taper you if labs and symptoms both improve consistently — and even then, only with the endocrinologist\'s sign-off.' },
        { q: 'Is Kanchanara guggulu safe long-term?', a: 'Yes when prescribed and monitored by a qualified BAMS doctor at the correct dose. It is not a self-medication herb — dosing depends on your TSH, weight, and other symptoms.' },
        { q: 'Can Ayurveda help Hashimoto\'s?', a: 'Ayurveda can reduce the inflammatory burden (autoimmune protocols include specific rasayanas + gut-restoration + stress-management), but does not substitute for endocrinological monitoring. Coordinated care works best.' },
        { q: 'How often do I need to repeat labs?', a: 'Your endocrinologist\'s recommended schedule — typically every 6-8 weeks initially, then every 3-6 months. Bring the latest reports to each Ayurveda consultation.' },
        { q: 'Are online consultations effective for thyroid?', a: 'Yes. The doctor reviews your labs and history over video, prescribes, and monitors follow-up labs remotely. In-person Panchakarma is only added when the protocol requires it.' },
      ],
      related: [
        { label: 'PCOS & PCOD Ayurveda',            href: '/conditions/pcos-ayurveda' },
        { label: 'Online Ayurveda Consultation',    href: '/services/online-consultation' },
        { label: 'Herbal Medicine Reference',       href: '/services/herbal-medicine' },
        { label: 'Find a Kayachikitsa specialist',  href: '/doctors?specialization=Kayachikitsa' },
      ],
    },
  },
  {
    path: '/conditions/diabetes-ayurveda',
    metaTitle: 'Type 2 Diabetes Ayurveda Treatment | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Type 2 diabetes Ayurveda treatment via verified BAMS doctors. Personalised herbal + lifestyle protocols, coordinated with your endocrinologist. Free initial assessment.',
    content: {
      slug: '/conditions/diabetes-ayurveda',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Conditions', url: '/conditions' }, { name: 'Type 2 Diabetes Ayurveda', url: '/conditions/diabetes-ayurveda' }],
      eyebrow: 'Metabolic',
      h1: 'Type 2 Diabetes Ayurveda Treatment',
      heroSubtitle: 'Ayurveda classifies type-2 diabetes under prameha / madhumeha. Verified BAMS doctors help manage blood sugar, insulin resistance, and metabolic complications alongside your endocrinologist.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'The Ayurvedic classification',
          paragraphs: [
            'Prameha is the classical umbrella term for excessive urination + metabolic imbalance. Madhumeha (sweet urination) corresponds to type-2 diabetes. Ayurveda maps the disease to disrupted agni + kapha-medas dushti + srotorodha (channel blockage).',
            'Treatment is protocol-based (not single-herb) and case-specific. Blood-sugar improvement is the visible outcome; the underlying goal is restoring metabolic fire.',
          ],
        },
        {
          title: 'What treatment includes',
          paragraphs: ['A verified BAMS doctor will assess your labs (HbA1c, fasting/post-prandial glucose, lipid panel) and typically prescribe:'],
          bullets: [
            'Classical formulations (Nishakathakadi kashayam, Vijayasar, Guduchi, others chosen per case)',
            'Diet re-architecture: millets over polished rice, sattvic protein sources, warm cooked meals, meal-timing',
            'Daily 30-min walk after main meals, oil-massage twice a week, mindful eating practices',
            'Panchakarma (virechana or udwarthanam) when medovaha srotas involvement is pronounced',
            'Regular HbA1c monitoring with your endocrinologist',
          ],
        },
        {
          title: 'Working alongside modern medicine',
          paragraphs: [
            'AyurConnect doctors do not ask you to stop metformin, gliptins, or insulin. Dose reduction is negotiated with your endocrinologist only when labs demonstrably improve. The two systems work together.',
          ],
        },
      ],
      faqs: [
        { q: 'Can Ayurveda reverse type-2 diabetes?', a: 'For early-stage type-2 (recent onset, moderate HbA1c) with committed lifestyle + protocol adherence, significant reduction — sometimes to prediabetic range — is realistic. Long-standing cases with complications improve but typically don\'t fully reverse.' },
        { q: 'Do I stop metformin?', a: 'No — not without your endocrinologist\'s approval. Your BAMS doctor negotiates dose reduction with them only when your labs improve consistently over 3-6 months.' },
        { q: 'Are Ayurvedic herbs for diabetes safe with modern medicines?', a: 'When prescribed by a qualified BAMS doctor who knows your full medication list, yes. Self-medication with combined systems is where problems arise. Always disclose all medicines at each consultation.' },
        { q: 'How long before HbA1c improves?', a: 'Fasting/post-prandial changes are often seen in 4-6 weeks. HbA1c (3-month average) moves visibly by month 3, and continues improving through months 6-12 with sustained protocol.' },
        { q: 'Is Panchakarma needed?', a: 'Not always. Panchakarma is added when the doctor sees pronounced medovaha srotas involvement or when oral treatment alone is insufficient. Many cases respond well to oral medicine + lifestyle alone.' },
        { q: 'Can I do the whole thing online?', a: 'Yes for the consultation, prescription, and follow-up. In-person Panchakarma at a Kerala centre is added only if the protocol calls for it.' },
      ],
      related: [
        { label: 'Thyroid Imbalance Ayurveda',       href: '/conditions/thyroid-ayurveda' },
        { label: 'Panchakarma Treatment',            href: '/services/panchakarma' },
        { label: 'Wellness Consultation',            href: '/services/wellness-consultation' },
        { label: 'Find a Kayachikitsa specialist',   href: '/doctors?specialization=Kayachikitsa' },
      ],
    },
  },
  {
    path: '/conditions/skin-disorders',
    metaTitle: 'Skin Disorders Ayurveda Treatment | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Ayurveda treatment for psoriasis, eczema, acne, and chronic skin disorders via verified BAMS doctors. Online consultation, personalised protocols. Free initial assessment.',
    content: {
      slug: '/conditions/skin-disorders',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Conditions', url: '/conditions' }, { name: 'Skin Disorders Ayurveda', url: '/conditions/skin-disorders' }],
      eyebrow: 'Dermatology',
      h1: 'Skin Disorders Ayurveda Treatment',
      heroSubtitle: 'Chronic skin conditions — psoriasis, eczema, acne, vitiligo — approached at the root through classical Ayurveda. Verified BAMS doctors, online consultation.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'Ayurveda\'s view of skin disease',
          paragraphs: [
            'Skin conditions in Ayurveda fall under kushta and its variants — the majority are traced to accumulated rakta-dushti (blood-tissue vitiation) driven by digestion + long-term dietary + lifestyle patterns. Topical relief alone rarely holds; sustained improvement needs systemic treatment.',
          ],
        },
        {
          title: 'What a full protocol looks like',
          paragraphs: ['Your BAMS doctor tailors treatment to the specific condition (psoriasis vs eczema vs acne vs vitiligo). Common elements:'],
          bullets: [
            'Deepan-pachan (digestive fire correction) as the foundation',
            'Rakta-shodhaka (blood-purifying) formulations: Manjishtadi, Panchatikta ghrita guggulu, Guduchi',
            'External applications: medicated oils, lepas — chosen per case',
            'Panchakarma (virechana + raktamokshana in some cases) when the classical protocol calls for it',
            'Diet + lifestyle: identifying and removing triggers (nightshade family, excess spice, late nights, stress patterns)',
          ],
        },
        {
          title: 'Realistic expectations',
          paragraphs: [
            'Ayurveda for chronic skin conditions is a 3-6 month commitment for visible steady improvement. Acute flare-ups often calm within 4-6 weeks. Long-standing psoriasis or vitiligo may take 9-12 months. Consistency + follow-through matter more than intensity.',
          ],
        },
      ],
      faqs: [
        { q: 'Can Ayurveda cure psoriasis?', a: 'Ayurveda does not promise a "cure" for autoimmune skin conditions like psoriasis. What it consistently offers is significant reduction of flare frequency + severity, and a long-term maintenance protocol. Some cases go into extended remission.' },
        { q: 'Is Panchakarma needed for skin issues?', a: 'For chronic conditions like psoriasis, chronic eczema, or vitiligo — often yes, done at a Kerala centre. For acute acne or mild eczema, oral medicine + external application + lifestyle often suffices.' },
        { q: 'Do I need to stop steroid creams?', a: 'Discuss any taper with your BAMS doctor + dermatologist first. Abrupt stopping of long-term steroid use can trigger rebound flares. Ayurveda plans the taper alongside treatment.' },
        { q: 'How quickly will I see results?', a: 'Digestion + itching often improves within 2-3 weeks. Visible skin changes typically start 4-6 weeks in, with steady month-over-month improvement over the treatment period.' },
        { q: 'Can children and elderly patients be treated?', a: 'Yes — with age-appropriate dosing and gentler protocols. Confirm at booking that the doctor is comfortable with paediatric or geriatric skin cases.' },
        { q: 'Are online consultations effective for skin conditions?', a: 'Yes for consultation, prescription, and follow-up. The doctor asks for well-lit close-up photos of affected areas. In-person Panchakarma is added only when the protocol requires.' },
      ],
      related: [
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Ayurvedic Massage & Abhyanga',    href: '/services/ayurvedic-massage' },
        { label: 'Online Ayurveda Consultation',    href: '/services/online-consultation' },
        { label: 'Herbal Medicine Reference',       href: '/services/herbal-medicine' },
      ],
    },
  },
  {
    path: '/conditions/joint-pain',
    metaTitle: 'Joint Pain & Arthritis Ayurveda | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Ayurveda treatment for joint pain, rheumatoid arthritis, osteoarthritis via verified BAMS doctors. Online consultation, Panchakarma referrals when needed. Free initial assessment.',
    content: {
      slug: '/conditions/joint-pain',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Conditions', url: '/conditions' }, { name: 'Joint Pain & Arthritis Ayurveda', url: '/conditions/joint-pain' }],
      eyebrow: 'Musculoskeletal',
      h1: 'Joint Pain & Arthritis Ayurveda',
      heroSubtitle: 'Rheumatoid arthritis, osteoarthritis, gout, and chronic joint stiffness — root-cause Ayurveda protocols from verified BAMS doctors. Online consultation, Kerala Panchakarma referrals.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'Ayurvedic classification',
          paragraphs: [
            'Joint conditions map to distinct classical categories: Amavata (rheumatoid arthritis — ama + vata affecting joints), Sandhivata (osteoarthritis — degenerative vata), Vatarakta (gout — vata + rakta). Treatment differs sharply between them, so accurate diagnosis is step one.',
          ],
        },
        {
          title: 'Typical treatment',
          paragraphs: ['Your BAMS doctor prescribes per condition. Common elements:'],
          bullets: [
            'Deepan-pachan to clear ama (metabolic toxins) — critical for Amavata',
            'Classical formulations: Amrita guggulu, Simhanada guggulu, Rasnaerandadi kashayam per case',
            'Snehana + swedana externally — medicated-oil massage + steam',
            'Panchakarma (basti — kashaya-basti / anuvasana-basti) at a Kerala centre for chronic vata',
            'Diet: warm cooked food, ginger tea, avoiding cold + fermented foods',
            'Gentle yoga + walking — sustained daily movement over intense workouts',
          ],
        },
        {
          title: 'Coordination with rheumatology',
          paragraphs: [
            'For rheumatoid arthritis specifically, most patients on DMARDs (methotrexate, sulfasalazine, biologics) continue them unchanged. Ayurveda works to reduce stiffness, morning pain, and flare frequency in parallel. Dose reduction is your rheumatologist\'s call.',
          ],
        },
      ],
      faqs: [
        { q: 'Can Ayurveda cure arthritis?', a: 'For osteoarthritis, complete "cure" is unrealistic — but pain, stiffness, and progression can be significantly slowed. For rheumatoid arthritis, sustained remission is the goal. For gout (Vatarakta), long attack-free periods are achievable with diet + protocol adherence.' },
        { q: 'Is Panchakarma essential?', a: 'For chronic Amavata or Sandhivata — often yes, particularly kashaya-basti. For milder or early cases, oral medicine + external oil + lifestyle often suffices.' },
        { q: 'How quickly will pain reduce?', a: 'Morning stiffness often improves within 2-3 weeks. Baseline pain typically reduces meaningfully at 4-6 weeks. Structural / functional improvements build over 3-6 months.' },
        { q: 'Can I continue my rheumatology medication?', a: 'Yes — never stop DMARDs, biologics, or steroid tapers without your rheumatologist. Your BAMS doctor coordinates with them; dose reduction happens only when labs + symptoms both improve.' },
        { q: 'What about knee replacement — can Ayurveda avoid it?', a: 'For early-stage osteoarthritis with reversible cartilage changes, yes — often. For end-stage arthritis with bone-on-bone contact, surgery may still be the right call. Your doctor will be honest about the case at hand.' },
        { q: 'Are online consultations effective?', a: 'Yes for consultation and prescription. The doctor may ask for X-rays and MRIs. In-person Panchakarma at a Kerala centre is added when the protocol requires.' },
      ],
      related: [
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Ayurvedic Massage & Abhyanga',    href: '/services/ayurvedic-massage' },
        { label: 'Herbal Medicine Reference',       href: '/services/herbal-medicine' },
        { label: 'Find a Panchakarma specialist',   href: '/doctors?specialization=Panchakarma' },
      ],
    },
  },
]

// ─── Services (5) ──────────────────────────────────────────────────────
const services: LandingSpec[] = [
  {
    path: '/services/online-consultation',
    metaTitle: 'Online Ayurveda Doctor Consultation | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Book online Ayurveda consultation with verified BAMS doctors. Secure video call, prescription, follow-ups. Serving patients across India, UAE, GCC, US, UK. Free initial assessment.',
    content: {
      slug: '/services/online-consultation',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Online Consultation', url: '/services/online-consultation' }],
      eyebrow: 'Consultation',
      h1: 'Online Ayurveda Doctor Consultation',
      heroSubtitle: 'Face-to-face video consultation with a verified Kerala-trained BAMS doctor. Personalised protocol, digital prescription, follow-up support. From anywhere.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'How online consultation works',
          paragraphs: [
            'Every doctor on AyurConnect holds BAMS or MD (Ayurveda) qualifications and passes admin verification against the CCIM register. Book a slot on any doctor\'s profile — the video room opens in the browser (no app install).',
          ],
          bullets: [
            'Pre-consultation: upload existing reports + a short symptom questionnaire',
            'Consultation: 30-45 minutes of history, prakriti assessment, discussion',
            'Prescription: digital, delivered within 24 hours; classical formulations from trusted brands',
            'Follow-up: scheduled at 3-4 weeks; adjustments included in the follow-up fee',
          ],
        },
        {
          title: 'What conditions we consult on',
          paragraphs: [
            'The AyurConnect directory covers Kayachikitsa (internal medicine), Prasuti Tantra (women\'s health), Kaumarbhritya (paediatrics), Shalya Tantra (surgery consultation), Manasika (mental health), Panchakarma, Rasashastra, and Dravyaguna specialists. Pick a specialist matched to your case, or take our AI Doctor Match quiz for a ranked list.',
          ],
        },
        {
          title: 'International patients',
          paragraphs: [
            'AyurConnect serves patients across India, the UAE, GCC, US, UK, Europe, and Southeast Asia. Doctors consult in English, Malayalam, Hindi, Tamil, and Arabic. Payments via Razorpay (INR, AED, USD); prescriptions shipped where possible, or sourced locally.',
          ],
        },
      ],
      faqs: [
        { q: 'How is an online consultation different from in-person?', a: 'For diagnosis, discussion, and follow-up — no meaningful difference. Nadi pariksha (pulse) and abhyanga (touch-based therapies) require in-person. Most conditions can be fully managed online, with Panchakarma referral to a Kerala centre when the protocol requires it.' },
        { q: 'Are online prescriptions valid?', a: 'Yes. All prescriptions are digital PDFs signed by the BAMS doctor with their CCIM registration number. Pharmacies in India, UAE, and most GCC countries dispense against them.' },
        { q: 'Can I get a follow-up consultation?', a: 'Yes. Book a follow-up slot on the same doctor\'s profile — the doctor sees your full history + prior prescription in-app. Most conditions need 2-3 follow-ups over 3-6 months.' },
        { q: 'What if I don\'t know which specialist to book?', a: 'Use the AI Doctor Match quiz (2 minutes) which returns a ranked list of doctors matched to your primary concern, language, and budget.' },
        { q: 'Do doctors handle chronic conditions?', a: 'Yes — most bookings on the platform are for chronic conditions (PCOS, thyroid, diabetes, skin, joints, digestive). Acute conditions are also welcome; the doctor will refer to modern medicine if that\'s the safer path.' },
        { q: 'What are the fees?', a: 'Set by each doctor and visible on their profile — typically ₹500-₹1500 for the first consultation, ₹300-₹800 for follow-ups. Many doctors offer a free 15-minute initial assessment.' },
      ],
      related: [
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Wellness Consultation',           href: '/services/wellness-consultation' },
        { label: 'Herbal Medicine Reference',       href: '/services/herbal-medicine' },
        { label: 'Browse all specialists',          href: '/doctors' },
      ],
    },
  },
  {
    path: '/services/ayurvedic-massage',
    metaTitle: 'Ayurvedic Massage & Abhyanga Therapy | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Book classical Ayurvedic massage — Abhyanga, Pizhichil, Shirodhara — at verified Kerala centres. Consult a BAMS doctor to pick the right therapy for your prakriti.',
    content: {
      slug: '/services/ayurvedic-massage',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Ayurvedic Massage & Abhyanga', url: '/services/ayurvedic-massage' }],
      eyebrow: 'Therapy',
      h1: 'Ayurvedic Massage & Abhyanga Therapy',
      heroSubtitle: 'Classical Kerala therapies — Abhyanga, Pizhichil, Njavarakizhi, Shirodhara — done properly by trained therapists at verified centres, per your BAMS doctor\'s protocol.',
      cta: { label: 'Find a Kerala Panchakarma centre', href: '/hospitals?type=panchakarma' },
      sections: [
        {
          title: 'What Ayurvedic massage actually is',
          paragraphs: [
            'Ayurvedic massage is not spa-style relaxation work — it\'s a therapeutic protocol. Medicated oils are selected per the patient\'s dosha and condition; the technique (Abhyanga full-body, Pizhichil oil-pouring, Njavarakizhi rice-bolus, Shirodhara oil-stream on the forehead) is chosen by the treating BAMS doctor as part of a broader plan.',
          ],
        },
        {
          title: 'Common therapies',
          paragraphs: [],
          bullets: [
            'Abhyanga — full-body oil massage; foundational, done before most Panchakarma protocols',
            'Pizhichil — warm medicated oil poured over the body while massaged; deeply nourishing, vata-pacifying',
            'Njavarakizhi — bolus of cooked Njavara rice + medicated milk; for muscle wasting, weakness, arthritis',
            'Shirodhara — steady stream of oil on the forehead; for anxiety, insomnia, chronic headache',
            'Udwarthanam — powder massage in the opposite direction; for weight, kapha reduction, PCOS',
            'Kizhi — herbal / powder / rice-bolus pounding; for joint conditions, muscle spasm',
          ],
        },
        {
          title: 'Book through a BAMS doctor',
          paragraphs: [
            'Direct-to-therapist bookings often mismatch therapy to condition. AyurConnect asks you to consult a BAMS doctor first (video, 30 min) — they identify the right therapy, oil, duration, and centre. The doctor writes a referral you take to the Kerala Panchakarma centre.',
          ],
        },
      ],
      faqs: [
        { q: 'Can I book Ayurvedic massage without a doctor consult?', a: 'You can, but we don\'t recommend it. The wrong oil or technique for your prakriti / condition can worsen symptoms or cause new imbalances. A 30-minute BAMS consultation saves months of misdirected therapy.' },
        { q: 'What does a typical session cost?', a: 'Abhyanga: ₹1500-₹3500 per session at a Kerala centre. Pizhichil, Shirodhara, Njavarakizhi: ₹2500-₹6000. Multi-day residential Panchakarma packages range ₹35,000-₹1,50,000 depending on centre + duration.' },
        { q: 'How many sessions do I need?', a: 'For therapeutic effect, typically 7-14 consecutive days. Single sessions have limited effect for chronic conditions.' },
        { q: 'Is Shirodhara safe for pregnancy?', a: 'Generally avoided during pregnancy unless specifically prescribed by a BAMS gynaecologist for a specific case. Discuss with your obstetrician + Ayurveda doctor.' },
        { q: 'Can I do these therapies at home?', a: 'Self-abhyanga (daily oil-massage before shower) is fine and beneficial. Therapeutic Pizhichil / Shirodhara / Kizhi require trained therapists — not for home DIY.' },
        { q: 'How do I know a centre is authentic?', a: 'AyurConnect\'s hospital / centre directory lists only Kerala centres with admin-verified credentials + AYUSH certification. Check the "AYUSH certified" and "Panchakarma" badges on the centre\'s profile.' },
      ],
      related: [
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Online Ayurveda Consultation',    href: '/services/online-consultation' },
        { label: 'Joint Pain & Arthritis Ayurveda', href: '/conditions/joint-pain' },
        { label: 'Browse Kerala Panchakarma centres', href: '/hospitals?type=panchakarma' },
      ],
    },
  },
  {
    path: '/services/panchakarma',
    metaTitle: 'Panchakarma Treatment Online | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Book classical Panchakarma at Kerala\'s verified centres. Vamana, Virechana, Basti, Nasya, Raktamokshana — prescribed by a BAMS doctor. Free initial consultation.',
    content: {
      slug: '/services/panchakarma',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Panchakarma Treatment', url: '/services/panchakarma' }],
      eyebrow: 'Detoxification',
      h1: 'Panchakarma Treatment Online',
      heroSubtitle: 'Classical Panchakarma — the five purification therapies — prescribed by a verified BAMS doctor, delivered at AYUSH-certified Kerala centres. Not a spa, not a fad.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'What Panchakarma is (and isn\'t)',
          paragraphs: [
            'Panchakarma is not "detox tourism" or a wellness getaway. It is a classical five-therapy protocol — Vamana (therapeutic emesis), Virechana (therapeutic purgation), Basti (medicated enema), Nasya (nasal administration), Raktamokshana (blood-letting) — each prescribed selectively based on the case, prakriti, dosha imbalance, and physical readiness.',
            'Done properly, it is a serious medical intervention preceded by 5-7 days of preparation (Purvakarma: snehana + swedana) and followed by structured post-treatment recovery (Paschat Karma).',
          ],
        },
        {
          title: 'When Panchakarma is indicated',
          paragraphs: ['Your BAMS doctor may recommend Panchakarma for:'],
          bullets: [
            'Chronic autoimmune conditions (RA, psoriasis, IBD) — often Virechana / Basti',
            'PCOS with prominent kapha-medas involvement — Virechana / Udwarthanam',
            'Chronic joint pain / Amavata — Basti (kashaya + anuvasana)',
            'Long-standing skin conditions — Virechana + Raktamokshana in select cases',
            'Migraine, chronic sinusitis — Nasya',
            'Post-illness rejuvenation (Rasayana chikitsa) after a Panchakarma cycle',
          ],
        },
        {
          title: 'The AyurConnect Panchakarma flow',
          paragraphs: [
            'Book an online consultation with a Panchakarma-specialist BAMS doctor. They assess whether Panchakarma is appropriate for your case; if yes, they refer you to a specific centre in Kerala (Kottakkal, Trivandrum, Palakkad, others) with the right expertise for your condition. Duration typically 14-28 days residential.',
          ],
        },
      ],
      faqs: [
        { q: 'Is Panchakarma safe?', a: 'When done at an AYUSH-certified centre under a qualified Panchakarma specialist — yes, and it has a 3000-year track record. When done at unqualified spa venues without medical supervision — unsafe. AyurConnect only refers to admin-verified centres.' },
        { q: 'How long does Panchakarma take?', a: 'A meaningful residential Panchakarma is 14-28 days: 5-7 days Purvakarma (preparation), 3-7 days main Karma, 5-14 days Paschat Karma (recovery + Rasayana). Weekend "Panchakarma" is not classical Panchakarma.' },
        { q: 'What does it cost?', a: 'Residential Panchakarma at a good Kerala centre: ₹35,000-₹1,50,000 depending on centre, duration, room class, and included therapies. Excludes travel + post-treatment medicines.' },
        { q: 'Can I do Panchakarma without residence?', a: 'Non-residential Panchakarma at a centre near you is possible for some protocols (Virechana day, Basti series). Fully residential is stronger for chronic autoimmune / neurological cases where diet + routine control matter.' },
        { q: 'Will I need to stop my regular medication?', a: 'Discuss with the referring doctor. Some medications continue; others are paused during specific Karma days. Your BAMS doctor coordinates the schedule.' },
        { q: 'Is Panchakarma right for me?', a: 'A 30-minute online consultation with a Panchakarma-specialist BAMS doctor answers this properly. Self-referring to a centre without prior assessment often leads to a mismatched protocol.' },
      ],
      related: [
        { label: 'Ayurvedic Massage & Abhyanga',    href: '/services/ayurvedic-massage' },
        { label: 'PCOS & PCOD Ayurveda',            href: '/conditions/pcos-ayurveda' },
        { label: 'Joint Pain & Arthritis Ayurveda', href: '/conditions/joint-pain' },
        { label: 'Browse Kerala Panchakarma centres', href: '/hospitals?type=panchakarma' },
      ],
    },
  },
  {
    path: '/services/herbal-medicine',
    metaTitle: 'Ayurvedic Herbal Medicines & Formulations | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Classical Ayurvedic formulations reference — Triphala, Ashwagandha, Yogaraj Guggulu, Chyawanprash and more. Prescribed only by verified BAMS doctors on AyurConnect.',
    content: {
      slug: '/services/herbal-medicine',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Herbal Medicines', url: '/services/herbal-medicine' }],
      eyebrow: 'Formulary',
      h1: 'Ayurvedic Herbal Medicines & Formulations',
      heroSubtitle: 'Classical compound formulations — kashayam, choornam, guggulu, ghrita — from trusted brands (AVS Kottakkal, Vaidyaratnam, Baidyanath, others), prescribed by verified BAMS doctors.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'How Ayurvedic medicines differ',
          paragraphs: [
            'Ayurvedic medicine is largely compound-formulation-based, not single-herb. A classical formula like Yogaraj Guggulu combines 20+ ingredients balanced across rasa (taste), virya (potency), and prabhava (specific action). Substituting one ingredient changes the formula\'s indication.',
            'Dosage depends on your dosha, condition severity, digestive strength, and existing medication. Self-medication with these formulas can worsen imbalances — always consult a BAMS doctor first.',
          ],
        },
        {
          title: 'Common formulation categories',
          paragraphs: [],
          bullets: [
            'Kashayam — water decoctions (Nishakathakadi, Balaguluchyadi, Rasnadi)',
            'Choornam — powdered formulas (Triphala, Sitopaladi, Talisadi)',
            'Guggulu — resin-based tablets (Yogaraj, Kaishore, Simhanada, Amrita)',
            'Ghrita — medicated ghee (Panchatikta ghrita, Brahmi ghrita)',
            'Taila — medicated oils, external (Mahanarayana, Ksheerabala)',
            'Rasayana — rejuvenatives (Chyawanprash, Brahma Rasayana)',
          ],
        },
        {
          title: 'Where to source authentic medicines',
          paragraphs: [
            'AyurConnect doctors prescribe from trusted GMP-certified manufacturers — Arya Vaidya Sala Kottakkal, Vaidyaratnam Oushadhasala, Baidyanath, Kerala Ayurveda, and other established Kerala names. Sourcing links + reputable online pharmacies are shared with your prescription. Roadside "authentic" herbs from tourist markets are not recommended.',
          ],
        },
      ],
      faqs: [
        { q: 'Can I buy Ayurvedic medicine without a prescription?', a: 'Yes for over-the-counter formulations (Triphala, Chyawanprash, most oils). No for classical prescriptions — Guggulu compounds, Rasashastra preparations, medicated ghrita all need a doctor\'s dosing.' },
        { q: 'Are Ayurvedic medicines FDA / regulated?', a: 'In India — regulated under AYUSH ministry + Drugs & Cosmetics Act. In UAE/UK/US — regulated as dietary supplements. Always source from GMP-certified brands.' },
        { q: 'Do Ayurvedic medicines interact with modern medicines?', a: 'They can — for example, Guggulu may affect thyroid medication levels; Triphala can affect drug absorption timing. Always disclose your full medication list to your BAMS doctor.' },
        { q: 'Are there heavy metals in Ayurvedic medicines?', a: 'Some classical Rasashastra preparations contain purified minerals (bhasmas). AyurConnect doctors prescribe from GMP-certified manufacturers who test for heavy-metal contamination. Cheap uncertified sources have historically shown adulteration.' },
        { q: 'How long do Ayurvedic medicines take to work?', a: 'Acute conditions (cold, indigestion): 1-3 days. Chronic conditions (joint pain, skin, PCOS): 4-12 weeks of consistent use. Rasayanas (rejuvenatives): 3-6 months.' },
        { q: 'Can I stop taking them once I feel better?', a: 'Depends on the formula and condition. Some are meant for short courses (7-14 days), others for maintenance months. Your BAMS doctor will specify.' },
      ],
      related: [
        { label: 'Online Ayurveda Consultation',    href: '/services/online-consultation' },
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Full formulary reference',        href: '/formulary' },
        { label: 'PCOS & PCOD Ayurveda',            href: '/conditions/pcos-ayurveda' },
      ],
    },
  },
  {
    path: '/services/wellness-consultation',
    metaTitle: 'Wellness & Prevention Consultation | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Prakriti assessment + preventive Ayurveda consultation with verified BAMS doctors. Personalised diet, dinacharya, ritucharya, rasayana. For long-term health.',
    content: {
      slug: '/services/wellness-consultation',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Wellness Consultation', url: '/services/wellness-consultation' }],
      eyebrow: 'Prevention',
      h1: 'Wellness & Prevention Consultation',
      heroSubtitle: 'Not sick — but want to feel better, sleep better, prevent chronic disease. A verified BAMS doctor builds a diet + dinacharya + rasayana plan tailored to your prakriti.',
      cta: DOCTORS_CTA,
      sections: [
        {
          title: 'Preventive Ayurveda — the classical mandate',
          paragraphs: [
            'Ayurveda\'s first mandate is "swasthasya swasthya rakshanam" — protect the health of the healthy. Preventive consultation focuses on prakriti (constitutional type), current agni (digestive fire), lifestyle (dinacharya), seasonal adaptation (ritucharya), and rejuvenation (rasayana). No prescription required; the "medicine" is a structured way of living.',
          ],
        },
        {
          title: 'What a wellness consultation includes',
          paragraphs: [],
          bullets: [
            'Prakriti assessment (dosha typing — Vata / Pitta / Kapha or combinations)',
            'Current-state Vikriti reading (how you\'re out of balance right now)',
            'Personalised diet — foods to favour, foods to reduce, meal timing',
            'Dinacharya — a workable daily routine matched to your work + family life',
            'Ritucharya — seasonal adjustments (especially Karkidakam / monsoon)',
            'Optional Rasayana — a 3-6 month rejuvenation protocol',
          ],
        },
        {
          title: 'Who should book',
          paragraphs: [
            'Anyone with subtle symptoms (poor sleep, sluggish digestion, low energy, brain fog) that don\'t rise to a formal diagnosis. Anyone with a family history of chronic disease who wants to build a prevention protocol early. Anyone wanting to align life with classical Ayurveda\'s daily + seasonal rhythms.',
          ],
        },
      ],
      faqs: [
        { q: 'Do I need a diagnosis to book?', a: 'No. Preventive consultation is meant for the "not sick but not thriving" state. The doctor assesses prakriti + current imbalances and builds a plan.' },
        { q: 'What does it cost?', a: 'Typically ₹800-₹2000 for the first 45-60 minute session. Follow-ups (usually 3-4 weeks apart, then quarterly) run ₹500-₹1000.' },
        { q: 'How is this different from a health-check package?', a: 'Health-check packages screen for existing disease. Preventive Ayurveda maps your constitution + lifestyle + digestion and prescribes daily rhythms that reduce disease risk over years.' },
        { q: 'Will I be told to change everything at once?', a: 'No. A good BAMS doctor stages changes over months so you can actually stick to them. Ambitious plans people don\'t follow beat useless plans people do follow every time.' },
        { q: 'Should I take Rasayana / Chyawanprash daily?', a: 'For adults over 30 with average agni, seasonal rasayana courses (2-3 months in winter) are traditional. Daily year-round is not always right — your BAMS doctor will guide.' },
        { q: 'Is prakriti fixed for life?', a: 'Prakriti (your born-with constitution) doesn\'t change. Vikriti (current imbalance state) is fluid and shifts with diet, stress, season, age.' },
      ],
      related: [
        { label: 'Online Ayurveda Consultation',    href: '/services/online-consultation' },
        { label: 'Herbal Medicine Reference',       href: '/services/herbal-medicine' },
        { label: 'Panchakarma Treatment',           href: '/services/panchakarma' },
        { label: 'Take the Prakriti quiz',          href: '/prakriti-quiz' },
      ],
    },
  },
]

// ─── Jobs (5) ──────────────────────────────────────────────────────────
const jobs: LandingSpec[] = [
  {
    path: '/jobs/therapist-opportunities',
    metaTitle: 'Ayurveda Therapist Jobs & Careers | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Ayurveda therapist jobs across Kerala, UAE, GCC, Europe. Panchakarma technicians, massage therapists, spa therapists — verified employer postings on AyurConnect.',
    content: {
      slug: '/jobs/therapist-opportunities',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }, { name: 'Therapist opportunities', url: '/jobs/therapist-opportunities' }],
      eyebrow: 'Therapists',
      h1: 'Ayurveda Therapist Jobs & Careers',
      heroSubtitle: 'Panchakarma, Abhyanga, and specialty Ayurveda therapist openings — Kerala, UAE, Gulf, Europe. All employer posts admin-verified.',
      cta: JOBS_CTA,
      sections: [
        {
          title: 'Roles we list',
          paragraphs: [],
          bullets: [
            'Panchakarma technicians — full-time at Kerala centres + international residencies',
            'Abhyanga / massage therapists — spa, wellness, and clinical roles',
            'Njavarakizhi + specialty-technique therapists — trained roles at Kerala centres',
            'Shirodhara + Nasya therapists — clinical + rehabilitation roles',
            'Senior therapists / floor supervisors — 5+ years experience',
          ],
        },
        {
          title: 'Where the jobs are',
          paragraphs: [
            'Kerala (Kottakkal, Trivandrum, Palakkad, Kochi) — steady demand from established Panchakarma centres. UAE + Bahrain + Oman + Qatar + Saudi Arabia — growing Ayurveda market, higher pay, visa sponsorship common. Europe (Germany, Switzerland, Austria, Portugal) — smaller but growing, usually with employer-sponsored language training.',
          ],
        },
        {
          title: 'How to apply',
          paragraphs: [
            'Create a free candidate profile on AyurConnect (upload CV + certifications + video introduction). Employers see your profile in their applicant pool. You can also apply directly to specific job posts — one-click apply if your profile is complete.',
          ],
        },
      ],
      faqs: [
        { q: 'What qualifications do therapist roles need?', a: 'Panchakarma technician certification (from an AYUSH-recognised institution) is the baseline. Additional 6-12 month training in specific therapies (Njavarakizhi, Shirodhara) opens senior roles.' },
        { q: 'Do I need English for Gulf / European roles?', a: 'Basic conversational English for Gulf roles (patient-facing). B1-B2 English + often German / French for European roles — employers frequently sponsor language training as part of the offer.' },
        { q: 'What\'s the typical salary?', a: 'Kerala: ₹15,000-₹40,000/month base. UAE: AED 2,500-6,000/month + accommodation + food. Europe: EUR 1,800-3,500/month + accommodation typically included at wellness resorts.' },
        { q: 'Is visa sponsorship common?', a: 'Yes for UAE / GCC — most established Ayurveda centres sponsor. Europe more variable — established wellness resorts sponsor; smaller clinics often need you to hold work rights already.' },
        { q: 'How quickly do jobs fill?', a: 'Junior positions: 2-4 weeks. Senior + specialty positions: 4-8 weeks. Direct employer contact often accelerates.' },
        { q: 'Can I apply without a certification yet?', a: 'You can — some employers offer paid trainee positions with in-house Panchakarma certification. Look for "Trainee" or "Junior therapist — training provided" job titles.' },
      ],
      related: [
        { label: 'Doctor Job Openings',              href: '/jobs/doctor-opportunities' },
        { label: 'Panchakarma Technician Training',  href: '/jobs/panchakarma-technician' },
        { label: 'Healthcare Careers in Ayurveda',   href: '/jobs/healthcare-careers' },
        { label: 'Browse all open jobs',             href: '/jobs' },
      ],
    },
  },
  {
    path: '/jobs/doctor-opportunities',
    metaTitle: 'Ayurveda Doctor Job Openings | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'BAMS / MD (Ayurveda) doctor jobs — Kerala, India, UAE, GCC, UK, Europe. Full-time, part-time, consultant roles. Verified employer postings on AyurConnect.',
    content: {
      slug: '/jobs/doctor-opportunities',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }, { name: 'Doctor opportunities', url: '/jobs/doctor-opportunities' }],
      eyebrow: 'Doctors',
      h1: 'Ayurveda Doctor Job Openings',
      heroSubtitle: 'BAMS + MD (Ayurveda) doctor roles across India, UAE, GCC, UK, and Europe. Consultants, residents, chief physicians — all posts admin-verified.',
      cta: JOBS_CTA,
      sections: [
        {
          title: 'Role types we list',
          paragraphs: [],
          bullets: [
            'Consulting BAMS doctors — hospital / clinic outpatient work',
            'Chief physicians — senior clinical leadership at Kerala Panchakarma centres',
            'MD-specialised roles — Panchakarma, Kayachikitsa, Prasuti Tantra, Kaumarbhritya specialists',
            'Locum + part-time — flexible schedules for doctors in academic or research roles',
            'International consultants — UAE, GCC, UK, Germany, Switzerland Ayurveda centres',
            'Academic + research posts — CCIM colleges, KUHS, private universities',
          ],
        },
        {
          title: 'Regulatory context by region',
          paragraphs: [
            'India: BAMS + State Medical Council registration required. UAE: additional DHA (Dubai) / MOH (federal) / DoH (Abu Dhabi) Ayurveda licensing. UK: no formal Ayurveda council; practice under CNHC / GRCCT self-regulation. Germany: Heilpraktiker license typically required. AyurConnect provides guides for each.',
          ],
        },
        {
          title: 'What we ask of doctor applicants',
          paragraphs: [
            'Complete your public doctor profile before applying so employers can assess fit. CCIM registration verification is part of AyurConnect\'s admin process — approved profiles rank higher in employer searches.',
          ],
        },
      ],
      faqs: [
        { q: 'What\'s the typical salary?', a: 'India (Kerala hospital / clinic): ₹25,000-₹1,20,000/month depending on seniority + specialty. UAE: AED 8,000-25,000/month. UK: GBP 2,500-5,500/month. Chief physician + partner roles negotiable.' },
        { q: 'Are Ayurveda MD specialisations more valued?', a: 'For senior clinical + academic roles — yes. For general consultation practice — a strong BAMS with 5+ years experience often competes effectively with MD candidates.' },
        { q: 'Is visa sponsorship offered?', a: 'UAE + GCC: standard for full-time positions. UK / Germany / Switzerland: variable, depends on employer size + role seniority. Ask during interviews.' },
        { q: 'Can I do remote / online consulting?', a: 'Yes — AyurConnect itself hires online-consulting BAMS doctors, and many listed employers offer hybrid roles. Post-Covid, remote-first Ayurveda consulting has grown steadily.' },
        { q: 'Do I need international qualifications?', a: 'Not for India or UAE (where BAMS is directly recognised). For UK / Germany / Switzerland — additional local licensing (CNHC, Heilpraktiker) typically required. We link guides on the AyurConnect licensing page.' },
        { q: 'How can I stand out to employers?', a: 'Complete profile with high-quality photo, detailed bio (English + Malayalam), CCIM registration number, MD specialisation if any, patient reviews, and articles / posts you\'ve authored. Featured profiles get 3-5x more employer views.' },
      ],
      related: [
        { label: 'Therapist Jobs & Careers',         href: '/jobs/therapist-opportunities' },
        { label: 'Healthcare Careers in Ayurveda',   href: '/jobs/healthcare-careers' },
        { label: 'Panchakarma Technician Training',  href: '/jobs/panchakarma-technician' },
        { label: 'Join AyurConnect — careers page',  href: '/jobs/work-with-us' },
      ],
    },
  },
  {
    path: '/jobs/panchakarma-technician',
    metaTitle: 'Panchakarma Technician Training & Jobs | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Panchakarma technician certification pathways + open jobs. AYUSH-recognised training programs, salary expectations, Gulf / Europe opportunities.',
    content: {
      slug: '/jobs/panchakarma-technician',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }, { name: 'Panchakarma Technician', url: '/jobs/panchakarma-technician' }],
      eyebrow: 'Training + jobs',
      h1: 'Panchakarma Technician Training & Jobs',
      heroSubtitle: 'How to become a certified Panchakarma technician + where the jobs are — Kerala, UAE, Europe. Structured training pathways, salary bands, career progression.',
      cta: JOBS_CTA,
      sections: [
        {
          title: 'Training pathways',
          paragraphs: [
            'Certified Panchakarma technician programs run 6-12 months at AYUSH-recognised institutions. Kerala hosts several established options — AVS Kottakkal, Vaidyaratnam, Government Ayurveda Colleges, private schools. Programs include theory (dosha, dhatus, protocols), practical technique training, supervised clinical placement, and a certification exam.',
          ],
          bullets: [
            'AVS Kottakkal — 12-month program, ₹40,000-60,000 fees, well-recognised globally',
            'Vaidyaratnam Ayurveda Foundation — 12-month program, similar fee band',
            'Government Ayurveda College short courses — 6-month, subsidised, competitive entry',
            'Private schools in Kochi / Trivandrum / Kozhikode — 6-9 months, ₹35,000-80,000',
          ],
        },
        {
          title: 'Career progression',
          paragraphs: [
            'Junior technician (0-2 yrs) → floor technician (2-5 yrs) → senior therapist / trainer (5-10 yrs) → therapy supervisor / head therapist (10+ yrs). International postings usually open at 3-5 years experience. Some technicians transition into training + academic roles.',
          ],
        },
        {
          title: 'Where the jobs are',
          paragraphs: [
            'Kerala: 300+ established Panchakarma centres — steady demand. UAE + GCC: 100+ wellness centres, growing 15-20% annually — visa sponsorship standard. Europe: 40-50 established Ayurveda spas + resorts in Germany, Switzerland, Austria, Portugal. Australia + Southeast Asia: emerging market, 20-30 centres.',
          ],
        },
      ],
      faqs: [
        { q: 'Do I need a BAMS degree?', a: 'No — technician training is separate from BAMS. Panchakarma technicians work under a BAMS doctor\'s supervision; the doctor prescribes, the technician executes.' },
        { q: 'What\'s the entry qualification?', a: 'Typically 12th standard pass with biology / basic science background. Some programs accept SSLC. Malayalam or English + Sanskrit for classical text reading.' },
        { q: 'How much do certified technicians earn?', a: 'Junior (0-2 yrs): ₹15,000-25,000/month in Kerala. Mid-level (3-5 yrs): ₹25,000-45,000. Senior (5+): ₹40,000-80,000 + international placement premiums.' },
        { q: 'Are online certifications valid?', a: 'For therapist roles at reputable centres — no. Panchakarma technique training requires supervised practical work. Online-only certifications are not recognised by established Kerala centres or Gulf employers.' },
        { q: 'Can women be Panchakarma technicians?', a: 'Yes — many established Kerala centres run separate male + female technician teams. Female technicians are actively recruited for gender-matched patient care.' },
        { q: 'What next after certification?', a: 'Apply directly to Kerala centres for supervised practice, or take up international placements after 2-3 years of local experience. Specialty add-on training (Kizhi, Shirodhara, Nasya) opens senior roles.' },
      ],
      related: [
        { label: 'Therapist Jobs & Careers',         href: '/jobs/therapist-opportunities' },
        { label: 'Doctor Job Openings',              href: '/jobs/doctor-opportunities' },
        { label: 'Ayurvedic Massage & Abhyanga',    href: '/services/ayurvedic-massage' },
        { label: 'Panchakarma Treatment',            href: '/services/panchakarma' },
      ],
    },
  },
  {
    path: '/jobs/healthcare-careers',
    metaTitle: 'Healthcare Careers in Ayurveda | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Full spectrum of Ayurveda healthcare careers — doctors, therapists, technicians, administrators, researchers, educators. Kerala + international opportunities.',
    content: {
      slug: '/jobs/healthcare-careers',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }, { name: 'Healthcare Careers', url: '/jobs/healthcare-careers' }],
      eyebrow: 'All roles',
      h1: 'Healthcare Careers in Ayurveda',
      heroSubtitle: 'Beyond doctor + therapist — Ayurveda pharmacists, administrators, researchers, educators, and hospital management roles. Overview + open positions.',
      cta: JOBS_CTA,
      sections: [
        {
          title: 'Roles across the Ayurveda ecosystem',
          paragraphs: [],
          bullets: [
            'BAMS Doctors (consulting, hospital, research)',
            'MD (Ayurveda) specialists (Panchakarma, Kayachikitsa, Rasashastra, etc.)',
            'Panchakarma technicians + certified therapists',
            'Ayurveda pharmacists (compounding + dispensing, clinical support)',
            'Ayurveda dieticians + wellness counsellors',
            'Hospital administrators (Panchakarma centre management, outpatient clinics)',
            'Academic + research posts — CCIM colleges, KUHS, universities',
            'Content + editorial (medical writing, patient education)',
            'Digital health — Ayurveda-focused product + engineering roles at platforms like AyurConnect',
          ],
        },
        {
          title: 'By region',
          paragraphs: [
            'India: strongest demand across all roles, salaries lowest globally but cost-of-living-matched. UAE + GCC: high demand for doctors + therapists, growing for pharmacists. UK + Europe: doctors + therapists, growing dietician + wellness counsellor market. USA + Canada: smaller but growing, mostly wellness / integrative-medicine adjacent.',
          ],
        },
        {
          title: 'Career mobility',
          paragraphs: [
            'The Ayurveda healthcare career track is unusually mobile — clinical practitioners transition into training + academic roles; hospital administrators come from clinical + business backgrounds; research + editorial paths open with a strong publication record. AyurConnect\'s job platform lists across all these tracks.',
          ],
        },
      ],
      faqs: [
        { q: 'What non-clinical Ayurveda roles exist?', a: 'Hospital administration, marketing, medical writing, product / engineering at Ayurveda tech platforms, dietician + wellness counselling, academic roles at CCIM colleges, and pharmaceutical compounding + QA.' },
        { q: 'Are there Ayurveda jobs outside India?', a: 'Yes — UAE, GCC, UK, Germany, Switzerland, Austria, Portugal, Australia, Singapore all have established Ayurveda centres hiring internationally.' },
        { q: 'What\'s the fastest-growing Ayurveda role right now?', a: 'Online-consulting BAMS doctors (post-2022 boom continues), Panchakarma technicians for Gulf placements, and Ayurveda-focused product / engineering roles at digital health platforms.' },
        { q: 'Do I need clinical background to work in Ayurveda administration?', a: 'Not always. Panchakarma centre operations, marketing, and technology roles are often filled by people with hospitality, marketing, or engineering backgrounds who develop Ayurveda-specific knowledge on the job.' },
        { q: 'What entry-level roles exist?', a: 'Panchakarma technician trainee roles (paid training positions), junior therapist roles, receptionist / patient-coordinator at Ayurveda hospitals, junior content writer / editor at Ayurveda platforms.' },
        { q: 'Where do I look for open roles?', a: 'Start with the AyurConnect jobs board. Established Kerala centres also post directly on their own sites. LinkedIn is growing for Gulf + European Ayurveda roles.' },
      ],
      related: [
        { label: 'Doctor Job Openings',              href: '/jobs/doctor-opportunities' },
        { label: 'Therapist Jobs & Careers',         href: '/jobs/therapist-opportunities' },
        { label: 'Panchakarma Technician Training',  href: '/jobs/panchakarma-technician' },
        { label: 'Join AyurConnect',                 href: '/jobs/work-with-us' },
      ],
    },
  },
  {
    path: '/jobs/work-with-us',
    metaTitle: 'Join AyurConnect — Careers Page | AyurConnect — Verified Ayurveda Treatment Online',
    metaDesc:  'Work with AyurConnect. Doctor, therapist, product, engineering, and content roles at India\'s largest verified Ayurveda platform. Remote-friendly, Kerala-rooted.',
    content: {
      slug: '/jobs/work-with-us',
      breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Jobs', url: '/jobs' }, { name: 'Work with us', url: '/jobs/work-with-us' }],
      eyebrow: 'Careers at AyurConnect',
      h1: 'Join AyurConnect — Careers Page',
      heroSubtitle: 'We\'re building the trust layer for Kerala Ayurveda — for patients across the world, for doctors, for the practice itself. Doctor, therapist, product, engineering, editorial roles.',
      cta: JOBS_CTA,
      sections: [
        {
          title: 'What we\'re building',
          paragraphs: [
            'AyurConnect is a verified directory + consultation platform for Kerala Ayurveda doctors, hospitals, and Panchakarma centres. Patients worldwide book online consultations with BAMS doctors who\'ve been admin-verified against the CCIM register. Doctors post availability, publish articles, run their own visibility. The platform is free for patients; doctors pay a small revenue share on online consultations only.',
          ],
        },
        {
          title: 'Who we hire',
          paragraphs: [],
          bullets: [
            'Consulting BAMS + MD (Ayurveda) doctors — online + hybrid, part-time to full-time',
            'Panchakarma technicians for our partner Kerala centres',
            'Product designers + engineers — TypeScript / Next.js / Postgres stack',
            'Content editors + medical writers — English + Malayalam',
            'Community managers — doctor onboarding, event coordination',
            'Sales + partnerships — hospitals, Panchakarma centres, employers',
          ],
        },
        {
          title: 'How we work',
          paragraphs: [
            'Remote-first with a physical hub in Kochi, Kerala. Async by default, meetings only where they add value. Doctor + editorial reviewers are outcome-paid; product + engineering are salaried with stock. Bring your own Ayurveda knowledge or grow it here — the founding team includes practicing BAMS doctors + software engineers.',
          ],
        },
      ],
      faqs: [
        { q: 'Is AyurConnect hiring right now?', a: 'Yes — check the /jobs board for current open positions. If you don\'t see your exact role but think you\'d be a strong fit, send a message via the WhatsApp concierge on the site.' },
        { q: 'What\'s the tech stack?', a: 'TypeScript, Next.js (App Router), Fastify, Postgres, Prisma, MinIO, Redis, Better Auth. Deployed on a self-managed VPS with PM2. If you\'re comfortable in that stack you\'ll feel at home.' },
        { q: 'Do you sponsor visas?', a: 'Not currently. India-based hires are prioritised. Remote contractor arrangements exist for international engineers + writers on a case-by-case basis.' },
        { q: 'Are doctors on the platform employees?', a: 'No — doctors on AyurConnect are independent practitioners. They set their own consultation fees, availability, and specialisation. AyurConnect handles platform + payments + patient acquisition; the doctor-patient relationship is theirs.' },
        { q: 'What\'s the revenue model?', a: '12% platform fee on completed online consultations (patient side pays doctor\'s listed fee; AyurConnect retains 12%). In-person consultation revenue stays 100% with the doctor. Free for patients to browse + book. No subscription fees.' },
        { q: 'Can I contribute without being hired?', a: 'Yes. Content writers with published bylines can pitch articles at hello@ayurconnect.com. Practicing BAMS doctors can list their profiles free after admin verification. Open-source engineers can suggest platform improvements via GitHub issues.' },
      ],
      related: [
        { label: 'Doctor Job Openings',              href: '/jobs/doctor-opportunities' },
        { label: 'Therapist Jobs & Careers',         href: '/jobs/therapist-opportunities' },
        { label: 'Healthcare Careers in Ayurveda',   href: '/jobs/healthcare-careers' },
        { label: 'Panchakarma Technician Training',  href: '/jobs/panchakarma-technician' },
      ],
    },
  },
]

// Phase 8 (2026-07-23): commit 5ab05ff deleted the 5 conditions/* + 5 services/*
// landing-page directories but left this config file untouched. Excluding
// those 10 entries from LANDING_PAGES so sitemap.ts doesn't emit URLs
// that would 404. The `conditions` and `services` array definitions above
// are preserved as ready-to-restore templates — if the pages are ever
// rebuilt, flip this export back to [...conditions, ...services, ...jobs].
export const LANDING_PAGES: LandingSpec[] = [...jobs]

export function getLandingByPath(path: string): LandingSpec | null {
  return LANDING_PAGES.find((p) => p.path === path) ?? null
}
