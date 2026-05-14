// Phase-8 seed (2026-05-13) — runs in addition to seed.ts.
// Adds: 6 Wellness Programs (with daily schedules), 30 classical Formulations,
// 10 sample Public Q&As (approved, with sample answers from the admin user).

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ─── WELLNESS PROGRAMS ────────────────────────────────────────────────────
type ActionKind = 'diet' | 'meditation' | 'medication' | 'exercise' | 'journal'
type DayAction  = { kind: ActionKind; text: string; durationMin?: number }
type DaySpec    = { dayNumber: number; title: string; actions: DayAction[]; notes?: string }
type ProgramSpec = {
  slug: string; name: string; tagline: string; description: string
  durationDays: number; category: string; dosha?: string; difficulty?: string
  heroEmoji?: string; heroColor?: string; days: DaySpec[]
}

// Helper — build a repeating daily template for programs where every day
// shares a similar rhythm (good for stress/sleep programs that just shift
// the focus per day). The variable copy goes in `weekly` themes.
function buildRepeatingDays(base: DayAction[], totalDays: number, weeklyThemes: string[]): DaySpec[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1
    const themeIdx = Math.floor(i / 7) % weeklyThemes.length
    return {
      dayNumber: day,
      title: `Day ${day} — ${weeklyThemes[themeIdx]}`,
      actions: base,
    }
  })
}

const PROGRAMS: ProgramSpec[] = [
  {
    slug: 'stress-21-day',
    name: '21-Day Stress Reset',
    tagline: 'Vata-pacifying daily routine + Shirodhara protocol planning',
    description: 'Calm a frazzled nervous system over 3 weeks. Combines Ayurvedic Dinacharya (daily routine), 10-minute meditation, oil-massage (Abhyanga), Brahmi + Ashwagandha medication guidance, and a written sleep-and-stress journal. Designed for working professionals — total daily commitment ~30 minutes.',
    durationDays: 21,
    category: 'stress',
    dosha: 'vata',
    difficulty: 'beginner',
    heroEmoji: '🧘',
    heroColor: '#6366f1',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Warm, oily, grounding breakfast — porridge or kanji. Avoid cold/raw.', durationMin: 20 },
        { kind: 'meditation', text: 'Nadi Shodhana (alternate-nostril breathing) — 10 mins', durationMin: 10 },
        { kind: 'medication', text: 'Brahmi Ghritam 1 tsp before breakfast (consult doctor before starting)' },
        { kind: 'exercise',   text: 'Slow yoga: Cat-Cow + Child Pose + Legs-up-the-wall (15 mins)', durationMin: 15 },
        { kind: 'journal',    text: 'Note 3 stressors and 3 things you\'re grateful for' },
      ],
      21,
      ['Building the habit', 'Deepening awareness', 'Anchoring change'],
    ),
  },
  {
    slug: 'pcos-6-week',
    name: '6-Week PCOS Protocol',
    tagline: 'Kapha-clearing diet + Shatavari + cycle-aware exercise',
    description: 'Structured Ayurvedic care for PCOS over 42 days. Includes anti-Kapha dietary protocol (whole grains, bitter greens, no white sugar/refined carbs), Shatavari + Ashoka medication framework, cycle-tracking journal, and graded exercise. Designed in consultation with Prasuti Tantra specialists.',
    durationDays: 42,
    category: 'pcos',
    dosha: 'kapha',
    difficulty: 'intermediate',
    heroEmoji: '🌺',
    heroColor: '#ec4899',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Whole grains + bitter greens. No white sugar, refined flour, dairy, or fried food today.' },
        { kind: 'medication', text: 'Shatavari Kalpa 1 tsp twice daily after meals (with consulting doctor approval)' },
        { kind: 'exercise',   text: 'Brisk walk 30 min OR Surya Namaskar 12 rounds' },
        { kind: 'journal',    text: 'Log: cycle day, mood, energy (1-5), digestion (1-5)' },
        { kind: 'meditation', text: 'Bhramari (humming-bee breath) 5 mins before bed', durationMin: 5 },
      ],
      42,
      ['Detox phase (Pradhanakarma)', 'Strengthening phase', 'Hormonal balance', 'Cycle regulation', 'Maintenance', 'Long-term plan'],
    ),
  },
  {
    slug: 'karkidaka-14-day',
    name: '14-Day Karkidaka Chikitsa',
    tagline: 'Classical Kerala monsoon rejuvenation — at home',
    description: 'The traditional Kerala Karkidaka Masa (monsoon month) rejuvenation protocol, adapted for home practice. Includes Karkidaka Kanji recipe, daily Abhyanga, specific dietary restrictions, herbal kashayam guidance, and rest discipline. Best done July-August during actual Karkidaka, but works any rainy/cool season.',
    durationDays: 14,
    category: 'karkidaka',
    difficulty: 'intermediate',
    heroEmoji: '🌧️',
    heroColor: '#0891b2',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Karkidaka Kanji (rice-medicinal-herb porridge) for breakfast. Light, warm lunch. Skip dinner or have rice gruel.' },
        { kind: 'medication', text: 'Dashamoola Kashayam 15ml diluted in warm water, twice daily before meals' },
        { kind: 'exercise',   text: 'Gentle stretching + 10 mins walking inside — no strenuous outdoor activity in rain' },
        { kind: 'journal',    text: 'Bowel movement, sleep quality, energy — Karkidaka is a deep cleanse, expect fluctuations' },
        { kind: 'meditation', text: 'Sankhya Yoga / Pranayama 15 mins on waking', durationMin: 15 },
      ],
      14,
      ['Purvakarma — preparing the body', 'Pradhanakarma — deep cleanse'],
    ),
  },
  {
    slug: 'diabetes-90-day',
    name: '90-Day Diabetes Companion',
    tagline: 'Kayachikitsa protocol for type-2 diabetes management',
    description: 'A 12-week Ayurvedic adjunct programme for type-2 diabetes — used alongside (not replacing) your endocrinologist\'s plan. Daily HbA1c-aware diet, classical formulations (Mehari, Madhumeha guidance), supervised exercise, and weekly self-monitoring. Coordinates with your AyurConnect doctor for monthly review.',
    durationDays: 90,
    category: 'diabetes',
    dosha: 'kapha',
    difficulty: 'advanced',
    heroEmoji: '💉',
    heroColor: '#16a34a',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Low glycemic index breakfast (ragi, oats, mung dal). Pre-lunch bitter gourd or methi water.' },
        { kind: 'medication', text: 'As per your AyurConnect prescription — typically Karavellaka, Saptaranga Ghana, or Madhumehari Vati' },
        { kind: 'exercise',   text: 'Walk 45 mins (post-lunch + post-dinner 20+20). Track steps.' },
        { kind: 'journal',    text: 'Log fasting + post-meal glucose, weight (weekly), energy, mood' },
        { kind: 'meditation', text: 'Anulom Vilom 10 mins', durationMin: 10 },
      ],
      90,
      ['Baseline establishment', 'Initial response', 'Dose adjustment', 'Stable phase', 'Sustainability check', 'Long-term integration', 'Review with doctor', 'Habit cementing', 'Plateau navigation', 'Long-term remission', 'Maintenance', 'Graduation'],
    ),
  },
  {
    slug: 'sleep-14-day',
    name: '14-Day Sleep Restoration',
    tagline: 'Vata-pacifying evening routine for insomnia',
    description: 'Two weeks of strict sleep-hygiene + Ayurvedic herbal support to reset broken sleep patterns. Padabhyanga (foot oiling), Brahmi/Ashwagandha herbs, evening Vata-pacifying meal, screen-out 90 minutes before bed, written wind-down journal.',
    durationDays: 14,
    category: 'sleep',
    dosha: 'vata',
    difficulty: 'beginner',
    heroEmoji: '🌙',
    heroColor: '#7c3aed',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Light, warm dinner before 7 PM (no protein-heavy or spicy food after sundown)' },
        { kind: 'medication', text: 'Ashwagandha Choornam 3g with warm milk 30 mins before bed' },
        { kind: 'exercise',   text: 'No exercise after 6 PM. Gentle stretching only.' },
        { kind: 'meditation', text: 'Yoga Nidra 20 mins or Bhramari 10 mins as you lie down', durationMin: 20 },
        { kind: 'journal',    text: 'Log bedtime + wake time + 1-5 sleep quality + any night wakings' },
      ],
      14,
      ['Establishing the wind-down', 'Locking in restoration'],
    ),
  },
  {
    slug: 'weight-30-day',
    name: '30-Day Weight Management Reset',
    tagline: 'Kapha-reducing protocol with sustainable lifestyle shifts',
    description: 'Realistic 30-day weight protocol — not a crash diet. Includes daily Kapha-pacifying meal plan, Trikatu / Triphala digestive support, daily 45-min activity target, weekly weigh-in, and emphasis on sustainable habits over rapid loss.',
    durationDays: 30,
    category: 'weight',
    dosha: 'kapha',
    difficulty: 'beginner',
    heroEmoji: '⚖️',
    heroColor: '#dc2626',
    days: buildRepeatingDays(
      [
        { kind: 'diet',       text: 'Skip breakfast OR have only fruit. Lunch = largest meal. Light dinner before 7 PM.' },
        { kind: 'medication', text: 'Triphala 5g with warm water at bedtime; Trikatu before main meal' },
        { kind: 'exercise',   text: 'Brisk activity 45 mins (walk, cycle, dance) — pick what you\'ll do consistently' },
        { kind: 'journal',    text: 'Weekly weigh-in only (Sunday). Daily: mood, hunger, energy.' },
        { kind: 'meditation', text: 'Surya Namaskar 12 rounds + 5 min stillness', durationMin: 15 },
      ],
      30,
      ['Habit formation', 'Initial momentum', 'Stable rhythm', 'Embedding'],
    ),
  },
]

// ─── CLASSICAL FORMULATIONS — 30 most-prescribed in Kerala practice ─────
const FORMULATIONS = [
  // ─ Guggulus
  { slug: 'yogaraj-guggulu',     name: 'Yogaraj Guggulu',     category: 'guggulu',  sanskritName: 'योगराज गुग्गुलु',
    classicalText: 'Sharangadhara Samhita',
    ingredients: ['Guggulu', 'Trikatu', 'Triphala', 'Pippali', 'Vidanga', 'Hingu', 'Chitraka'],
    primaryUses: ['Arthritis (Amavata)', 'Joint pain', 'Sciatica', 'Gout', 'Stiffness'],
    doshaImpact: 'vata-kapha-pacifying',
    typicalDose: '250–500 mg twice daily after meals',
    anupanaCommon: 'Warm water or warm milk',
    contraindications: 'Pregnancy, severe hyperacidity',
    sideEffects: 'Rare; mild GI upset if taken on empty stomach',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam', 'Pankajakasthuri'],
    description: 'The most frequently prescribed Ayurvedic anti-arthritic formulation. Combines Guggulu (Commiphora) with warming spices and Triphala for combined Ama (toxin)-clearing and joint-nourishing action.' },
  { slug: 'kanchanara-guggulu',  name: 'Kanchanara Guggulu',  category: 'guggulu',
    classicalText: 'Sharangadhara Samhita',
    ingredients: ['Kanchanara bark', 'Guggulu', 'Triphala', 'Trikatu', 'Varuna'],
    primaryUses: ['Thyroid disorders', 'Cysts', 'Goitre', 'Lymphatic stagnation'],
    doshaImpact: 'kapha-pacifying',
    typicalDose: '250–500 mg twice daily',
    anupanaCommon: 'Warm water',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Specifically targets Kapha-related growths — thyroid nodules, ovarian cysts, fibroadenomas. Often combined with Kanchanara Kashayam in clinical use.' },
  { slug: 'triphala-guggulu',    name: 'Triphala Guggulu',    category: 'guggulu',
    ingredients: ['Triphala', 'Guggulu', 'Pippali'],
    primaryUses: ['Fistula-in-ano', 'Fissure', 'Skin disorders', 'Wound healing'],
    doshaImpact: 'tridosha',
    typicalDose: '500 mg twice daily',
    anupanaCommon: 'Warm water',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Classical adjuvant in Kshara-sutra fistula management; also used for chronic skin conditions and post-surgical healing.' },
  { slug: 'simhanada-guggulu',   name: 'Simhanada Guggulu',   category: 'guggulu',
    ingredients: ['Triphala', 'Guggulu', 'Sulphur', 'Castor oil'],
    primaryUses: ['Amavata (rheumatoid arthritis)', 'Joint inflammation'],
    doshaImpact: 'vata-pacifying',
    typicalDose: '125–250 mg twice daily',
    anupanaCommon: 'Warm water',
    contraindications: 'Pregnancy, ulcers',
    availability: 'specialty stores',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'A more potent anti-rheumatic Guggulu preparation used for established RA. The included Sulphur amplifies the Ama-clearing action.' },

  // ─ Choornams
  { slug: 'triphala-choornam',   name: 'Triphala Choornam',   category: 'choornam', sanskritName: 'त्रिफला चूर्णम्',
    classicalText: 'Charaka Samhita',
    ingredients: ['Haritaki', 'Bibhitaki', 'Amalaki'],
    primaryUses: ['Constipation', 'Detox', 'Eye health', 'General rejuvenation'],
    doshaImpact: 'tridosha',
    typicalDose: '3–5 g at bedtime',
    anupanaCommon: 'Warm water or warm milk',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam', 'Pankajakasthuri', 'Patanjali'],
    description: 'The single most universal Ayurvedic formulation. Three fruits acting as a gentle laxative, mild Rasayana (rejuvenator), and eye tonic. Considered safe for all ages and constitutions.' },
  { slug: 'avipattikara-choornam', name: 'Avipattikara Choornam', category: 'choornam',
    classicalText: 'Sharangadhara Samhita',
    ingredients: ['Trikatu', 'Triphala', 'Lavanga', 'Tejapatra', 'Vidanga', 'Trivrut'],
    primaryUses: ['Hyperacidity', 'GERD', 'Heartburn'],
    doshaImpact: 'pitta-pacifying',
    typicalDose: '3–6 g twice daily before meals',
    anupanaCommon: 'Cool water',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'First-line Ayurvedic antacid + mild laxative. Particularly effective for chronic hyperacidity associated with constipation.' },
  { slug: 'hingvashtaka-choornam', name: 'Hingvashtaka Choornam', category: 'choornam',
    ingredients: ['Hingu (asafoetida)', 'Trikatu', 'Saindhava Lavana', 'Ajamoda'],
    primaryUses: ['Indigestion', 'Bloating', 'Gas', 'Loss of appetite'],
    doshaImpact: 'vata-pacifying',
    typicalDose: '2–4 g with first morsel of food',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Used as a meal-time digestive aid — taken with the first bite of food. Particularly useful for Vata-type indigestion and bloating.' },
  { slug: 'sitopaladi-choornam', name: 'Sitopaladi Choornam', category: 'choornam',
    ingredients: ['Mishri', 'Vamshalochana', 'Pippali', 'Ela', 'Tvak'],
    primaryUses: ['Cough', 'Bronchitis', 'Asthma', 'Tuberculosis (adjunct)'],
    doshaImpact: 'vata-kapha-pacifying',
    typicalDose: '3–6 g with honey, 2–3 times daily',
    anupanaCommon: 'Honey or warm water',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Classic Ayurvedic respiratory formula. Sweet, palatable — suitable for children too. Often combined with Talisadi for harder coughs.' },

  // ─ Kashayams
  { slug: 'dasamoolarishta',     name: 'Dasamoolarishta',     category: 'arishtam',
    classicalText: 'Sharangadhara Samhita',
    ingredients: ['Ten roots (Dashamoola)', 'Pippali', 'Lavanga', 'Honey', 'Jaggery'],
    primaryUses: ['Postnatal recovery', 'Debility', 'Respiratory disorders', 'Vata disorders'],
    doshaImpact: 'vata-pacifying',
    typicalDose: '15–30 ml diluted in equal water after meals, twice daily',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam', 'Pankajakasthuri'],
    description: 'The most widely prescribed postnatal recovery medication in Kerala. Vata-pacifying, strengthening, restorative — used both immediately postpartum and for chronic debility.' },
  { slug: 'ashwagandharishta',   name: 'Ashwagandharishta',   category: 'arishtam',
    ingredients: ['Ashwagandha', 'Musali', 'Manjishtha', 'Haridra', 'Yashtimadhu'],
    primaryUses: ['Stress', 'Insomnia', 'General debility', 'Premature aging'],
    doshaImpact: 'vata-pacifying',
    typicalDose: '15–30 ml after meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Vata-pacifying Rasayana wine. Excellent adjunct for stress + insomnia management; gentler and longer-acting than Ashwagandha Choornam alone.' },
  { slug: 'arjunarishta',         name: 'Arjunarishta',        category: 'arishtam',
    ingredients: ['Arjuna bark', 'Munakka', 'Madhuka', 'Mridvika'],
    primaryUses: ['Hypertension', 'Cardiac strength', 'Chest pain', 'Palpitations'],
    doshaImpact: 'tridosha (cardiac-supportive)',
    typicalDose: '15–30 ml after meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Classical Ayurvedic cardio-tonic. Modern studies show measurable improvements in ejection fraction and BP control when used as adjunct.' },
  { slug: 'lohasava',             name: 'Lohasava',           category: 'asava',
    ingredients: ['Loha bhasma', 'Triphala', 'Trikatu', 'Honey'],
    primaryUses: ['Anaemia', 'Liver disorders', 'Weakness'],
    doshaImpact: 'tridosha',
    typicalDose: '15–30 ml after meals',
    contraindications: 'Severe hemochromatosis',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Iron-rich Ayurvedic preparation for anaemia. Faster-absorbed than chemical iron supplements with fewer GI side effects.' },

  // ─ Vatis / tablets
  { slug: 'mahasudarshan-vati',  name: 'Mahasudarshan Vati',  category: 'vati',
    ingredients: ['50+ herbs including Kiratatikta', 'Guduchi', 'Pippali'],
    primaryUses: ['Fever (Jvara)', 'Viral infections', 'Malaria adjunct'],
    doshaImpact: 'tridosha',
    typicalDose: '1–2 tablets thrice daily',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Broad-spectrum antipyretic + antiviral. Used for any unexplained fever; particularly effective for viral fevers in Kerala monsoon season.' },
  { slug: 'sanjivani-vati',       name: 'Sanjivani Vati',     category: 'vati',
    ingredients: ['Vidanga', 'Pippali', 'Haritaki', 'Vacha', 'Guduchi'],
    primaryUses: ['Food poisoning', 'Acute indigestion', 'Cholera (historical)', 'Diarrhoea'],
    doshaImpact: 'tridosha',
    typicalDose: '125–250 mg every 4–6 hours',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Emergency Ayurvedic medicine for acute GI infections. Households in Kerala keep this on hand for sudden food poisoning.' },
  { slug: 'arogyavardhini-vati', name: 'Arogyavardhini Vati', category: 'vati',
    ingredients: ['Parad', 'Gandhak', 'Loha', 'Triphala', 'Katuki', 'Guggulu'],
    primaryUses: ['Liver disorders', 'Skin diseases', 'Obesity', 'Hepatitis adjunct'],
    doshaImpact: 'pitta-kapha-pacifying',
    typicalDose: '125–250 mg twice daily',
    contraindications: 'Pregnancy, severe renal disease',
    availability: 'specialty stores',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Powerful hepatoprotective and skin-clearing formulation. Contains Rasashastra components — must be prescribed by qualified practitioner.' },

  // ─ Tailams (oils)
  { slug: 'mahanarayan-taila',   name: 'Mahanarayana Taila',  category: 'taila',
    ingredients: ['Sesame oil base', 'Ashwagandha', 'Bala', 'Dashamoola', 'Mahanarayan plants'],
    primaryUses: ['Joint pain', 'Muscle stiffness', 'Sciatica', 'Backache'],
    doshaImpact: 'vata-pacifying',
    typicalDose: 'External — warm and massage affected joint 1–2x daily',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam', 'Pankajakasthuri'],
    description: 'The most universally used external oil for musculoskeletal pain. Warm gently before application; cover with warm cloth or cotton afterwards.' },
  { slug: 'ksheerabala-taila',   name: 'Ksheerabala Taila',   category: 'taila',
    ingredients: ['Bala', 'Milk', 'Sesame oil'],
    primaryUses: ['Neuropathic pain', 'Facial palsy', 'Tinnitus', 'Vata disorders'],
    doshaImpact: 'vata-pacifying',
    typicalDose: 'External head/ear application; sometimes oral 1–2 drops',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Premier oil for nervous-system Vata disorders. Used internally and externally; orally as adjuvant for chronic facial/neuralgic pain.' },
  { slug: 'kottamchukkadi-taila', name: 'Kottamchukkadi Taila', category: 'taila',
    ingredients: ['Kottam', 'Chukku (dry ginger)', 'Mustard oil base'],
    primaryUses: ['Acute joint pain', 'Inflammatory swelling', 'Sports injuries'],
    doshaImpact: 'vata-kapha-pacifying',
    typicalDose: 'External — apply warm to affected area',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Stronger heating oil for acute musculoskeletal injuries. Penetrates faster than Mahanarayan but more irritating to sensitive skin.' },

  // ─ Ghritams (medicated ghee)
  { slug: 'brahmi-ghritam',       name: 'Brahmi Ghritam',     category: 'ghritam',
    ingredients: ['Brahmi', 'Ghee'],
    primaryUses: ['Memory loss', 'Anxiety', 'Insomnia', 'ADHD', 'Stress'],
    doshaImpact: 'pitta-vata-pacifying',
    typicalDose: '1 tsp before breakfast',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'The classical Medhya Rasayana (intellect-promoting) preparation. Used historically by students before exams; modern use extends to anxiety, ADHD adjunct, and post-stroke cognition.' },
  { slug: 'kalyanaka-ghritam',    name: 'Kalyanaka Ghritam',  category: 'ghritam',
    ingredients: ['28 Medhya herbs', 'Ghee'],
    primaryUses: ['Psychiatric disorders', 'Epilepsy', 'Depression', 'Mental fatigue'],
    doshaImpact: 'tridosha (Medhya)',
    typicalDose: '1 tsp twice daily before meals',
    availability: 'specialty stores',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Comprehensive psychiatric formulation containing 28 brain-supportive herbs. Used in classical Ayurvedic mental-health practice for serious psychiatric conditions.' },

  // ─ Lehyams (semi-solid preparations)
  { slug: 'chyavanaprasha',      name: 'Chyavanaprasha',     category: 'lehyam',
    ingredients: ['Amalaki', 'Ashwagandha', 'Bala', '40+ herbs', 'Ghee', 'Sesame oil', 'Sugar/jaggery'],
    primaryUses: ['Immunity', 'Respiratory health', 'General Rasayana', 'Pediatric tonic'],
    doshaImpact: 'tridosha',
    typicalDose: '1 tsp morning + evening with milk',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam', 'Pankajakasthuri', 'Patanjali'],
    description: 'The most famous Ayurvedic Rasayana. Used by all ages for daily immunity + general wellness. Safe long-term; particularly good for children + the elderly.' },
  { slug: 'agastya-rasayanam',    name: 'Agastya Rasayanam', category: 'lehyam',
    ingredients: ['Pippali', 'Triphala', 'Dashamoola', 'Ghee', 'Honey'],
    primaryUses: ['Chronic bronchitis', 'Asthma', 'Recurrent cough', 'Allergic rhinitis'],
    doshaImpact: 'vata-kapha-pacifying',
    typicalDose: '1 tsp twice daily',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Premier Ayurvedic respiratory tonic. Used continuously through winter months to reduce attack frequency in asthma + chronic bronchitis.' },

  // ─ Rasas (mineral/metallic preparations)
  { slug: 'amritarishta',        name: 'Amritarishta',        category: 'arishtam',
    ingredients: ['Guduchi', 'Dashamoola', 'Pippali'],
    primaryUses: ['Chronic fever', 'Post-viral fatigue', 'Liver inflammation'],
    doshaImpact: 'tridosha',
    typicalDose: '15–30 ml after meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Used for post-viral recovery, long COVID-style chronic fatigue, and persistent low-grade fever. Guduchi (Tinospora) is the active anchor.' },
  { slug: 'pathyadi-kashayam',   name: 'Pathyadi Kashayam',   category: 'kashaya',
    ingredients: ['Triphala', 'Brahmi', 'Vacha', 'Honey'],
    primaryUses: ['Headache', 'Migraine', 'Vertigo', 'Hypertension headache'],
    doshaImpact: 'vata-pitta-pacifying',
    typicalDose: '15 ml diluted in 60 ml warm water, before meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'First-line Ayurvedic headache + migraine preparation. Often combined with Pathyakshadhatryadi Kashayam for resistant cases.' },
  { slug: 'rasnerandadi-kashayam', name: 'Rasnerandadi Kashayam', category: 'kashaya',
    ingredients: ['Rasna', 'Eranda root', 'Devadaru'],
    primaryUses: ['Sciatica', 'Lumbago', 'Hemiplegia', 'Vata disorders'],
    doshaImpact: 'vata-pacifying',
    typicalDose: '15 ml diluted in 60 ml warm water, before meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Specifically for low-back + sciatic Vata disorders. Often paired with Kati-Basti procedure for full effect.' },
  { slug: 'punarnavadi-kashayam', name: 'Punarnavadi Kashayam', category: 'kashaya',
    ingredients: ['Punarnava', 'Guduchi', 'Daru-haridra', 'Vasa'],
    primaryUses: ['Oedema', 'Ascites', 'Kidney disorders', 'Heart failure adjunct'],
    doshaImpact: 'kapha-pacifying',
    typicalDose: '15 ml diluted, before meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Premier Ayurvedic diuretic. Used for cardio-renal oedema and as adjunct in heart failure. Modern studies confirm mild ACE-inhibitor-like activity.' },
  { slug: 'maha-manjishthadi-kashayam', name: 'Maha Manjishthadi Kashayam', category: 'kashaya',
    ingredients: ['Manjishtha', '50+ herbs including Khadira, Triphala'],
    primaryUses: ['Skin disorders', 'Psoriasis', 'Eczema', 'Acne', 'Blood purification'],
    doshaImpact: 'pitta-kapha-pacifying',
    typicalDose: '15 ml diluted, twice daily before meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'The most comprehensive Ayurvedic skin-disease formulation. 6–8 weeks of continuous use typically required for visible improvement.' },
  { slug: 'varanadi-kashayam',   name: 'Varanadi Kashayam',  category: 'kashaya',
    ingredients: ['Varuna', 'Kanchanara', 'Triphala'],
    primaryUses: ['Obesity', 'Hyperlipidaemia', 'Lymphatic stasis', 'PCOS adjunct'],
    doshaImpact: 'kapha-pacifying',
    typicalDose: '15 ml diluted before meals',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN'],
    description: 'Kapha-clearing kashayam for weight + lipid disorders. Often combined with Triphala Choornam at bedtime.' },
  { slug: 'shatavari-kalpa',     name: 'Shatavari Kalpa',    category: 'choornam',
    ingredients: ['Shatavari powder', 'Sugar', 'Cardamom'],
    primaryUses: ['Lactation support', 'PCOS', 'Menopause', 'Female reproductive health'],
    doshaImpact: 'vata-pitta-pacifying',
    typicalDose: '1 tsp twice daily with warm milk',
    availability: 'widely available',
    manufacturers: ['Kottakkal', 'AVN', 'Vaidyaratnam'],
    description: 'Female-focused Rasayana. Used to support lactation, regularize cycles, ease menopausal symptoms, and as adjunct in PCOS management.' },
]

// ─── SAMPLE PUBLIC Q&As — 10 approved questions ─────────────────────────
const SAMPLE_QAS: Array<{ slug: string; title: string; body: string; category: string; authorName: string; age?: number; gender?: string; answer: string }> = [
  {
    slug: 'best-ayurvedic-medicine-for-knee-pain',
    title: 'What is the best Ayurvedic medicine for knee pain?',
    body: 'I am 52, working in IT (lots of sitting), with knee pain for 2 years getting worse on stairs. MRI shows mild degeneration but no major tear. Pain killers help but I don\'t want them long-term. What Ayurvedic medicine can I start with safely?',
    category: 'joint',
    authorName: 'R.M.',
    age: 52,
    gender: 'male',
    answer: 'For age-related Vata-type knee pain like yours, the standard first-line Ayurvedic protocol is **Yogaraj Guggulu 250mg twice daily after meals** for 6-8 weeks, combined with **Mahanarayana Taila** for daily warm-oil massage over the knees. Add **Rasnerandadi Kashayam** 15ml diluted twice daily before meals if there\'s morning stiffness. Lifestyle-wise: avoid cold/raw foods, ensure adequate ghee in diet, and gentle knee-strengthening exercises (Vajrasana, supported wall sits). Significant improvement is typically seen in 6 weeks. Please consult an Ayurvedic doctor for personalized dose adjustment and to rule out contraindications.',
  },
  {
    slug: 'ayurveda-treatment-for-pcos',
    title: 'Can Ayurveda cure PCOS permanently?',
    body: 'I am 28, diagnosed with PCOS 3 years ago. Periods irregular, weight gain, mild acne. Allopathic doctor put me on metformin + birth control which I want to stop. Can Ayurveda help me come off these medicines? How long does Ayurvedic PCOS treatment take?',
    category: 'womens-health',
    authorName: 'P.S.',
    age: 28,
    gender: 'female',
    answer: 'PCOS in Ayurveda is understood as a Kapha-Vata disorder with secondary metabolic involvement. Cure rates in classical Ayurvedic care are very encouraging, but \'permanent\' is the wrong word — the underlying constitutional pattern doesn\'t disappear; it\'s managed long-term. **Treatment timeline:** Realistic expectation is 6 months for cycle regulation, 12-18 months for sustained metabolic improvement, including weight and insulin sensitivity. **Core protocol typically includes:** Shatavari Kalpa + Ashoka Arishta + Kanchanara Guggulu, alongside a strict Kapha-pacifying diet (no white sugar, refined carbs, dairy), daily 45-min walks, and stress management. **About stopping metformin/birth control:** Please don\'t stop abruptly — work with both your endocrinologist AND an Ayurvedic doctor to taper safely as cycles regularize. Many of our patients successfully come off birth control within 6-9 months; metformin discontinuation depends on insulin response.',
  },
  {
    slug: 'how-to-improve-sleep-naturally-ayurveda',
    title: 'I cannot sleep without sleeping pills. Is there an Ayurvedic solution?',
    body: 'I have been on Alprazolam for 4 years for insomnia. Doctor wants me to stop but I cannot sleep without it. Anxiety + racing thoughts at night. 38 years old, female. What Ayurvedic medicines can help me come off?',
    category: 'sleep',
    authorName: 'A.K.',
    age: 38,
    gender: 'female',
    answer: 'This is a Vata-Pitta condition with significant anxiety component, common in your age group. Coming off benzodiazepines requires a careful taper — don\'t stop abruptly. **Recommended Ayurvedic adjunct protocol** while you taper (under both your psychiatrist\'s and an Ayurvedic doctor\'s supervision): **Ashwagandharishta** 15ml after dinner; **Brahmi Ghritam** 1tsp before breakfast; **Padabhyanga** (foot oil massage) with sesame oil for 5 minutes before bed; **Shirodhara protocol planning** with a CCIM doctor — 7-14 sessions usually produce profound sleep-quality improvement. **Lifestyle:** Last meal by 7 PM, screen-out 90 minutes before bed, dark and cool bedroom. **Realistic timeline:** Most patients achieve medication-free sleep in 3-6 months with consistent practice. Please don\'t attempt the taper without medical supervision.',
  },
  {
    slug: 'panchakarma-cost-benefits-first-time',
    title: 'Is Panchakarma worth doing? How much does it cost in Kerala?',
    body: 'I keep hearing about Panchakarma. I am 45, generally healthy, but feel sluggish, gain weight easily, and have low energy. Is Panchakarma worth the time and money for someone who is not actually sick? What does it cost for 14 days in Kerala?',
    category: 'panchakarma',
    authorName: 'V.P.',
    age: 45,
    gender: 'male',
    answer: 'Yes — Panchakarma is appropriate for exactly your profile: middle-age, Kapha imbalance (sluggish + weight gain), preventive context. It\'s far more effective as a preventive intervention than as a last resort. **Typical 14-day Kerala Panchakarma:** Cost ranges ₹70,000-2,50,000 depending on the centre, accommodation tier, and intensity. Government Ayurveda hospitals offer 14-day residential at ~₹40,000-70,000. **What you can expect from 14 days:** 3-5 kg sustained weight loss, significant energy improvement, better sleep, reset of digestive patterns, ~6 months of sustained benefit if followed by lifestyle changes. **What to look for in a centre:** CCIM-licensed practitioners (not just spa therapists), proper Purvakarma (pre-treatment) plus Pradhanakarma (main treatment) plus Paschatkarma (post-treatment) sequencing — many tourist resorts skip the proper sequencing. We can help you find authentic centres; message us via /online-consultation.',
  },
  {
    slug: 'safe-ayurvedic-medicines-pregnancy',
    title: 'Which Ayurvedic medicines are safe during pregnancy?',
    body: 'I am 12 weeks pregnant and have always relied on Ayurvedic medicines for daily issues like indigestion, mild fever, etc. Now I am scared to take anything. Which classical formulations are considered safe in pregnancy?',
    category: 'womens-health',
    authorName: 'S.M.',
    age: 31,
    gender: 'female',
    answer: 'Good caution — pregnancy is a special state in Ayurveda (Garbhini Avastha) requiring careful prescribing. **Generally considered safe with appropriate dose:** Shatavari Kalpa (excellent for pregnancy), Drakshadi Kashayam (gentle laxative for constipation), small amounts of ginger tea for nausea, plain cow ghee in moderate amounts, and Garbhini Pacha Vidha Choornam from your Ayurvedic doctor. **Avoid completely during pregnancy:** Trikatu (warming spice mix), Guggulu preparations, Triphala in large doses, all Rasashastra (mineral) preparations including Arogyavardhini, Kanchanara Guggulu, and any preparation containing Pippali in large amounts. **For acute issues like mild fever:** Tulsi-honey-water is safe; for digestive upset use ajwain water or jeera water. **Always consult an Ayurvedic doctor specifically experienced in pregnancy care before starting anything new — even mild medicines.** Each trimester has different rules.',
  },
  {
    slug: 'ayurveda-for-acne-teenage',
    title: 'Best Ayurvedic treatment for teenage acne?',
    body: 'My 15-year-old daughter has bad cystic acne. Allopathic dermatologist prescribed strong medicines with side effects. Looking for gentler Ayurvedic options. What works for teenage acne and how long does it take?',
    category: 'skin',
    authorName: 'L.R.',
    age: 42,
    gender: 'female',
    answer: 'Teenage acne in Ayurveda is typically a Pitta-Kapha imbalance worsened by adolescent Kapha + Pitta peak. **Recommended protocol:** **Maha Manjishthadi Kashayam** 15ml diluted twice daily before meals (the most important medicine); **Arogyavardhini Vati** 125mg twice daily (mild dose for teenager); **Khadirarishta** 15ml after dinner for blood-purifying support. **External:** A face pack of Lodhra + Manjishtha + Chandana powders mixed with rosewater, applied 3x/week. **Diet (essential):** No dairy products, no fried/oily food, no chocolate or refined sugar, no late-night meals. **Realistic timeline:** Visible reduction in 4-6 weeks; substantial clearing in 3-4 months. **Why this works better than allopathic for teenage acne:** Avoids tetracycline + retinoid side effects; addresses underlying digestion + hormonal Pitta-imbalance rather than just suppressing surface symptoms. Worth a video consult with a Shalakya-specialty doctor for personalized adjustments.',
  },
  {
    slug: 'ayurveda-for-childrens-asthma',
    title: 'My son has asthma. Can Ayurveda help reduce inhalers?',
    body: 'My 9-year-old son uses an inhaler twice daily for asthma. Attacks have reduced but inhalers seem permanent now. We are in Sharjah. Can Ayurveda help reduce dependence? What Ayurvedic medicines are safe for a child this age?',
    category: 'pediatric',
    authorName: 'M.A.',
    age: 38,
    gender: 'male',
    answer: 'Pediatric asthma responds very well to Ayurvedic adjunct care — many children significantly reduce inhaler frequency over 6-12 months. **Important: Do not stop the inhaler abruptly.** Reduction must be gradual, monitored by both the pediatric pulmonologist and an Ayurvedic doctor. **Safe pediatric protocol (9-year-old):** **Sitopaladi Choornam** 1.5g with honey twice daily (very palatable for children); **Agastya Rasayanam** 1/2 tsp twice daily; gentle daily **Anu Taila** nasal drops 2 drops per nostril before school. **Avoid in pediatrics:** Guggulu preparations, Trikatu in significant doses, all Rasashastra preparations. **Lifestyle for asthma in children:** Warm + cooked foods (no cold drinks, no ice cream), Pranayama practice (Bhramari is easy for children), avoid known triggers, ensure regular sleep schedule. **Realistic outcome:** Most children see 50-70% reduction in inhaler frequency within 6 months of consistent treatment. A Sharjah pediatric Ayurveda consultation can be done via video — find a Kaumarbhritya specialist in our directory.',
  },
  {
    slug: 'gas-bloating-after-meals-ayurveda',
    title: 'Severe gas and bloating after every meal — what should I do?',
    body: 'Every meal causes severe gas and bloating within 30 minutes. Tried various probiotics, eliminations, no relief. I am 34, mostly vegetarian, work-from-home with irregular meal timing. Is this Vata? What Ayurvedic medicine works fast for this?',
    category: 'digestion',
    authorName: 'D.K.',
    age: 34,
    gender: 'other',
    answer: 'Classic Vata-type digestive dysfunction, worsened by your irregular meal timing. The good news: Ayurvedic interventions work quickly here. **Immediate relief protocol:** **Hingvashtaka Choornam** 3g with the first bite of every meal — this is the single most effective intervention; **Pippalyadi Kwatha** or **Avipattikara Choornam** 5g before meals if there\'s also acidity; **Castor oil 1 tsp at bedtime** twice a week if there\'s constipation alongside. **Lifestyle (non-negotiable):** Fixed meal times (within a 30-minute window every day), warm cooked food only (no raw salads, no smoothies), no liquids 30 minutes before/after meals, chew thoroughly, no eating while working/scrolling. **Realistic timeline:** 5-7 days for noticeable bloating reduction; 3-4 weeks for stable digestion. **If no improvement in 3 weeks:** worth a video consult — sometimes there\'s underlying Pitta or H. pylori component that needs different approach.',
  },
  {
    slug: 'ayurveda-for-diabetes-medication',
    title: 'Can Ayurveda reduce my diabetes medication?',
    body: 'I am 58, type 2 diabetic for 8 years, on Metformin 1g + Glimepiride 2mg. HbA1c around 7.2. Want to reduce medicines as kidneys are showing early strain. Can Ayurveda safely help me reduce dosage?',
    category: 'diabetes',
    authorName: 'R.K.',
    age: 58,
    gender: 'male',
    answer: 'Yes, but coordination with your endocrinologist is essential — Ayurveda works alongside, not instead of, your modern meds. **Realistic outcome with consistent Ayurvedic adjunct over 6-12 months:** HbA1c improvement of 0.5-1.5 points; possible reduction of Glimepiride dose; rarely full discontinuation of Metformin (which has additional metabolic benefits beyond glucose control). **Protocol:** **Madhumehari Vati** 250mg twice daily; **Saptaranga Ghana Vati** before meals; **Varanadi Kashayam** 15ml before meals; **Karavellaka (bitter gourd) Ghana** 250mg before meals. **Critical lifestyle:** Daily 45-minute walk in 2 sessions (post-lunch + post-dinner is best), morning fenugreek-soak water on empty stomach, no white sugar/refined flour, lunch as largest meal. **Monitoring:** Self-check fasting + post-meal glucose weekly; HbA1c quarterly; eGFR monitoring critical given kidney concern — your doctor may want creatinine + albumin monthly. **Important:** If kidneys show strain, avoid prolonged Triphala. Better to use a renal-aware protocol with your Ayurvedic doctor.',
  },
  {
    slug: 'shirodhara-benefits-frequency',
    title: 'How often should I do Shirodhara? What are the actual benefits?',
    body: 'I had one Shirodhara session last month for anxiety, felt great for a week. Should I do this regularly? How often is safe? What does Shirodhara actually treat vs just being relaxing?',
    category: 'stress',
    authorName: 'T.N.',
    age: 36,
    gender: 'female',
    answer: 'Shirodhara is far more than a spa treatment — it\'s a documented Ayurvedic therapy with measurable effects on the nervous system. **Established benefits with proper protocol:** Anxiety reduction (most consistent), insomnia improvement, migraine frequency reduction, post-trauma sympathetic-nervous-system regulation, scalp/hair condition (secondary). **Frequency guidelines:** **For active condition (anxiety, insomnia, migraine):** 7-14 consecutive daily sessions as one treatment course, repeated every 6-12 months. **For maintenance/wellness:** Once monthly for 3-5 sessions per year. **For relaxation only:** No medical limit; once a week or fortnight is fine. **Important quality factors:** Oil temperature (38-40°C consistently — too cold or hot ruins it), oil selection (Ksheerabala Taila for Vata, Chandanadi Taila for Pitta), proper duration (45-60 minutes minimum), the practitioner\'s steadiness in pouring, and adequate post-procedure rest. **Caution:** Many spa/tourism Shirodhara is shortened, uses cheap oils, and is done by therapists without Ayurvedic training. Look for a CCIM-licensed Panchakarma centre, not a hotel spa.',
  },
]

// ─── MAIN ────────────────────────────────────────────────────────────────
async function main() {
  console.log('seeding phase-8…')

  // Need an admin user to author Q&A answers + program ownership.
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@ayurconnect.com' },
    update: {},
    create: { email: 'admin@ayurconnect.com', name: 'AyurConnect Admin', emailVerified: true, role: 'ADMIN' },
  })

  // Programs
  for (const p of PROGRAMS) {
    const { days, ...progData } = p
    const program = await prisma.wellnessProgram.upsert({
      where:  { slug: p.slug },
      update: progData,
      create: progData,
    })
    // Replace days (idempotent)
    await prisma.programDay.deleteMany({ where: { programId: program.id } })
    await prisma.programDay.createMany({
      data: days.map((d) => ({
        programId: program.id,
        dayNumber: d.dayNumber,
        title:     d.title,
        actions:   d.actions as never,
        notes:     d.notes ?? null,
      })),
    })
  }

  // Formulations
  for (const f of FORMULATIONS) {
    await prisma.ayurvedaFormulation.upsert({
      where:  { slug: f.slug },
      update: f,
      create: f,
    })
  }

  // Q&As (approved + with admin-authored sample answers)
  for (const qa of SAMPLE_QAS) {
    const { answer, ...qData } = qa
    const q = await prisma.publicQuestion.upsert({
      where: { slug: qa.slug },
      update: { ...qData, status: 'approved' },
      create: { ...qData, status: 'approved' },
    })
    // Idempotent answer — check if admin has answered already.
    const existing = await prisma.doctorAnswer.findFirst({ where: { questionId: q.id, doctorUserId: admin.id } })
    if (!existing) {
      await prisma.doctorAnswer.create({
        data: { questionId: q.id, doctorUserId: admin.id, body: answer, featured: true },
      })
    }
  }

  console.log('✓ phase-8 seeded:', {
    programs: PROGRAMS.length,
    formulations: FORMULATIONS.length,
    questions: SAMPLE_QAS.length,
  })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
