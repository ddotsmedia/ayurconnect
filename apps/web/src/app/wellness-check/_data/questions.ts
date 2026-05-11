// Wellness risk assessment — a validated-style screener tapping into four
// modifiable risk axes: STRESS / BURNOUT / METABOLIC / SLEEP.
//
// Item responses are scored 0–3 (0 = healthy, 3 = elevated risk). The final
// page presents a per-axis score 0–100 and a combined "wellness debt"
// summary with dosha-aware Ayurvedic recommendations.
//
// This is NOT a diagnostic test. Validated screeners (PSS-10, MBI, FINDRISC,
// PSQI) inspired the item composition, but item wording is original and the
// scoring is heuristic. Page text makes this explicit.

export type Axis = 'stress' | 'burnout' | 'metabolic' | 'sleep'

export type WellnessQ = {
  id: string
  axis: Axis
  prompt: string
  // 4 options, each scored 0–3 (asc = worse)
  options: Array<{ label: string; score: 0 | 1 | 2 | 3 }>
  // Optional: which dosha imbalance pattern this question taps
  // (used by the report engine to suggest Ayurvedic interventions)
  doshaPattern?: 'vata' | 'pitta' | 'kapha'
}

export const AXES: Array<{ key: Axis; label: string; description: string }> = [
  { key: 'stress',    label: 'Chronic stress',    description: 'How your nervous system has felt over the past 4 weeks' },
  { key: 'burnout',   label: 'Burnout',           description: 'Emotional + physical depletion from work / caregiving' },
  { key: 'metabolic', label: 'Metabolic risk',    description: 'Lifestyle factors driving long-term disease risk' },
  { key: 'sleep',     label: 'Sleep quality',     description: 'Restorative sleep and circadian rhythm' },
]

export const QUESTIONS: WellnessQ[] = [
  // ─── STRESS (7 items) ─────────────────────────────────────────────
  {
    id: 'stress.overwhelm',
    axis: 'stress',
    prompt: 'In the past month, how often have you felt unable to control important things in your life?',
    options: [
      { label: 'Never',         score: 0 },
      { label: 'Sometimes',     score: 1 },
      { label: 'Often',         score: 2 },
      { label: 'Almost always', score: 3 },
    ],
  },
  {
    id: 'stress.nervous',
    axis: 'stress',
    prompt: 'How often do you feel nervous, "wound-up", or unable to relax?',
    options: [
      { label: 'Never',         score: 0 },
      { label: 'A few times a week', score: 1 },
      { label: 'Daily',         score: 2 },
      { label: 'Constantly',    score: 3 },
    ],
    doshaPattern: 'vata',
  },
  {
    id: 'stress.irritability',
    axis: 'stress',
    prompt: 'How easily do you become irritable, frustrated, or angry?',
    options: [
      { label: 'Rarely',                   score: 0 },
      { label: 'Sometimes',                score: 1 },
      { label: 'Often — with small things',score: 2 },
      { label: 'Constantly on a short fuse', score: 3 },
    ],
    doshaPattern: 'pitta',
  },
  {
    id: 'stress.physical',
    axis: 'stress',
    prompt: 'How often do you experience physical signs of stress (tension headache, jaw clenching, neck/shoulder tension)?',
    options: [
      { label: 'Never',          score: 0 },
      { label: 'Occasionally',   score: 1 },
      { label: 'Weekly',         score: 2 },
      { label: 'Daily',          score: 3 },
    ],
  },
  {
    id: 'stress.thoughts',
    axis: 'stress',
    prompt: 'Do you struggle to "switch off" — racing thoughts, replaying conversations, worrying?',
    options: [
      { label: 'No',                       score: 0 },
      { label: 'Sometimes at night',       score: 1 },
      { label: 'Most days',                score: 2 },
      { label: 'Constantly',               score: 3 },
    ],
    doshaPattern: 'vata',
  },
  {
    id: 'stress.coping',
    axis: 'stress',
    prompt: 'When stress hits, which most matches your response?',
    options: [
      { label: 'I have tools that work (walks, breath, talk)', score: 0 },
      { label: 'I push through, mostly fine',                  score: 1 },
      { label: 'I overeat, scroll, or drink',                  score: 2 },
      { label: 'I withdraw or shut down',                      score: 3 },
    ],
  },
  {
    id: 'stress.purpose',
    axis: 'stress',
    prompt: 'I feel my daily life has meaning and direction:',
    options: [
      { label: 'Strongly agree',  score: 0 },
      { label: 'Agree',           score: 1 },
      { label: 'Sometimes',       score: 2 },
      { label: 'Disagree',        score: 3 },
    ],
  },

  // ─── BURNOUT (6 items) ────────────────────────────────────────────
  {
    id: 'burnout.exhaustion',
    axis: 'burnout',
    prompt: 'At the end of a typical day, you feel:',
    options: [
      { label: 'Pleasantly tired but content',  score: 0 },
      { label: 'Tired but able to relax',       score: 1 },
      { label: 'Drained — collapsing into bed', score: 2 },
      { label: 'Exhausted yet unable to rest',  score: 3 },
    ],
  },
  {
    id: 'burnout.weekends',
    axis: 'burnout',
    prompt: 'Do weekends and holidays restore your energy?',
    options: [
      { label: 'Yes, completely',              score: 0 },
      { label: 'Mostly yes',                   score: 1 },
      { label: 'Partially — never fully',      score: 2 },
      { label: 'No — exhaustion follows me',   score: 3 },
    ],
  },
  {
    id: 'burnout.cynicism',
    axis: 'burnout',
    prompt: 'How do you feel about your work / primary responsibilities lately?',
    options: [
      { label: 'Engaged, energised',           score: 0 },
      { label: 'Steady but unexciting',        score: 1 },
      { label: 'Going through the motions',    score: 2 },
      { label: 'Cynical, resentful, or numb',  score: 3 },
    ],
  },
  {
    id: 'burnout.competence',
    axis: 'burnout',
    prompt: 'How confident are you in your ability to handle what your role demands?',
    options: [
      { label: 'Very confident',                       score: 0 },
      { label: 'Mostly confident',                     score: 1 },
      { label: 'Starting to doubt myself',             score: 2 },
      { label: 'I feel I am failing or barely coping', score: 3 },
    ],
  },
  {
    id: 'burnout.body',
    axis: 'burnout',
    prompt: 'Have you noticed unusual physical signs in the past 3 months — hair fall, weight change, frequent infections, irregular menses?',
    options: [
      { label: 'No',                       score: 0 },
      { label: 'One mild change',          score: 1 },
      { label: 'Two or more changes',      score: 2 },
      { label: 'Multiple persistent issues', score: 3 },
    ],
  },
  {
    id: 'burnout.boundaries',
    axis: 'burnout',
    prompt: 'How often do you check work email / messages outside your working hours?',
    options: [
      { label: 'Rarely — clear boundaries',           score: 0 },
      { label: 'Sometimes, then I disconnect',        score: 1 },
      { label: 'Most evenings and weekends',          score: 2 },
      { label: 'Always — boundaries non-existent',    score: 3 },
    ],
  },

  // ─── METABOLIC (7 items) ──────────────────────────────────────────
  {
    id: 'metabolic.movement',
    axis: 'metabolic',
    prompt: 'How much intentional physical activity do you do each week (walking briskly, yoga, gym, swimming)?',
    options: [
      { label: '150+ minutes', score: 0 },
      { label: '60–150 minutes', score: 1 },
      { label: 'Under 60 minutes', score: 2 },
      { label: 'None / almost none', score: 3 },
    ],
    doshaPattern: 'kapha',
  },
  {
    id: 'metabolic.sitting',
    axis: 'metabolic',
    prompt: 'On a typical workday, how many hours do you sit (work + commute + screens at home)?',
    options: [
      { label: 'Under 4 hours', score: 0 },
      { label: '4–6 hours',     score: 1 },
      { label: '6–10 hours',    score: 2 },
      { label: 'Over 10 hours', score: 3 },
    ],
    doshaPattern: 'kapha',
  },
  {
    id: 'metabolic.diet',
    axis: 'metabolic',
    prompt: 'How often do you eat ultra-processed food (chips, sweets, sugary drinks, instant noodles, packaged snacks)?',
    options: [
      { label: 'Rarely',                    score: 0 },
      { label: 'A few times a week',        score: 1 },
      { label: 'Daily',                     score: 2 },
      { label: 'Multiple times daily',      score: 3 },
    ],
  },
  {
    id: 'metabolic.veg',
    axis: 'metabolic',
    prompt: 'How many servings of fresh vegetables and fruits do you eat daily?',
    options: [
      { label: '5+ servings',     score: 0 },
      { label: '3–4 servings',    score: 1 },
      { label: '1–2 servings',    score: 2 },
      { label: 'Almost none',     score: 3 },
    ],
  },
  {
    id: 'metabolic.alcohol',
    axis: 'metabolic',
    prompt: 'How often do you drink alcohol?',
    options: [
      { label: 'Never / very rarely',          score: 0 },
      { label: 'A few times a month',          score: 1 },
      { label: 'Several times a week',         score: 2 },
      { label: 'Daily or near-daily',          score: 3 },
    ],
  },
  {
    id: 'metabolic.family',
    axis: 'metabolic',
    prompt: 'Family history — any first-degree relatives with type 2 diabetes, hypertension, or heart disease before age 55?',
    options: [
      { label: 'None',                              score: 0 },
      { label: 'One relative',                      score: 1 },
      { label: 'Two relatives',                     score: 2 },
      { label: 'Three or more / both parents',      score: 3 },
    ],
  },
  {
    id: 'metabolic.waist',
    axis: 'metabolic',
    prompt: 'Your waist measurement is (Indian thresholds: men > 90 cm, women > 80 cm = central obesity):',
    options: [
      { label: 'Below threshold',                   score: 0 },
      { label: 'At threshold',                      score: 1 },
      { label: 'Slightly above',                    score: 2 },
      { label: 'Well above (men > 102, women > 88)', score: 3 },
    ],
    doshaPattern: 'kapha',
  },

  // ─── SLEEP (6 items) ──────────────────────────────────────────────
  {
    id: 'sleep.duration',
    axis: 'sleep',
    prompt: 'On most nights, you sleep:',
    options: [
      { label: '7–8.5 hours',  score: 0 },
      { label: '6–7 hours',    score: 1 },
      { label: '5–6 hours',    score: 2 },
      { label: 'Under 5 hours OR over 10', score: 3 },
    ],
  },
  {
    id: 'sleep.onset',
    axis: 'sleep',
    prompt: 'How long does it usually take to fall asleep after lying down?',
    options: [
      { label: 'Under 15 minutes',          score: 0 },
      { label: '15–30 minutes',             score: 1 },
      { label: '30–60 minutes',             score: 2 },
      { label: 'Over 60 minutes or never properly',  score: 3 },
    ],
    doshaPattern: 'vata',
  },
  {
    id: 'sleep.continuity',
    axis: 'sleep',
    prompt: 'How often do you wake up during the night and struggle to fall back asleep?',
    options: [
      { label: 'Rarely',           score: 0 },
      { label: 'Once or twice a week', score: 1 },
      { label: 'Most nights',      score: 2 },
      { label: 'Every night',      score: 3 },
    ],
    doshaPattern: 'pitta',
  },
  {
    id: 'sleep.morning',
    axis: 'sleep',
    prompt: 'How do you feel on waking?',
    options: [
      { label: 'Refreshed',                  score: 0 },
      { label: 'Okay after a few minutes',   score: 1 },
      { label: 'Tired and slow',             score: 2 },
      { label: 'Exhausted — sleep didn\'t help', score: 3 },
    ],
  },
  {
    id: 'sleep.screens',
    axis: 'sleep',
    prompt: 'In the last hour before bed, you typically:',
    options: [
      { label: 'Read / pray / journal — no screens',  score: 0 },
      { label: 'Some screen time, mostly relaxing',   score: 1 },
      { label: 'On phone / scrolling',                score: 2 },
      { label: 'Working or watching emotionally intense content', score: 3 },
    ],
  },
  {
    id: 'sleep.aids',
    axis: 'sleep',
    prompt: 'Do you use sleep aids (alcohol, prescription drugs, OTC sleep supplements) to fall asleep?',
    options: [
      { label: 'Never',                                   score: 0 },
      { label: 'Occasionally (under medical advice)',     score: 1 },
      { label: 'Weekly',                                  score: 2 },
      { label: 'Daily',                                   score: 3 },
    ],
  },
]

export const TOTAL = QUESTIONS.length
