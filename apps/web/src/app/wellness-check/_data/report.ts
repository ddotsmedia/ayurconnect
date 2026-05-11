// Wellness check report generator. Takes per-axis raw + max scores and
// produces a tier-classification + tailored Ayurvedic recommendations.
//
// Tiers:
//   green  (0-25%)  — healthy, maintain
//   amber  (26-50%) — early-warning, lifestyle
//   orange (51-75%) — clear imbalance, structured intervention
//   red    (76+%)   — high risk, professional support strongly advised

import type { Axis } from './questions'

export type Tier = 'green' | 'amber' | 'orange' | 'red'

export type AxisScore = {
  axis: Axis
  raw: number
  max: number
  pct: number      // 0-100
  tier: Tier
}

export type AxisReport = {
  axis: Axis
  label: string
  tagline: string
  summary: string
  ayurvedicLens: string
  recommendations: { lifestyle: string[]; ayurvedic: string[]; herbs: string[]; whenToSeekHelp: string }
}

export const TIER_META: Record<Tier, { label: string; color: string; description: string }> = {
  green:  { label: 'Healthy',           color: 'emerald', description: 'You\'re in a good place on this axis — maintain the habits that work.' },
  amber:  { label: 'Early warning',     color: 'amber',   description: 'Some imbalance is emerging. Small course-corrections now prevent bigger issues.' },
  orange: { label: 'Clear imbalance',   color: 'orange',  description: 'Active intervention is warranted. A structured 4–12 week protocol helps most.' },
  red:    { label: 'High risk',         color: 'rose',    description: 'Strongly recommend speaking to a healthcare practitioner. Don\'t self-manage from here.' },
}

export function classifyTier(pct: number): Tier {
  if (pct <= 25) return 'green'
  if (pct <= 50) return 'amber'
  if (pct <= 75) return 'orange'
  return 'red'
}

// Axis-specific tier reports — these adapt to the score level.
// Keyed as `${axis}.${tier}`.
const TIER_REPORTS: Record<string, AxisReport> = {
  // ─── STRESS ──────────────────────────────────────────────────────
  'stress.green': {
    axis: 'stress', label: 'Chronic stress',
    tagline: 'Your nervous system is in good shape.',
    summary: 'Your responses suggest you\'re managing modern life\'s demands without persistent overwhelm. Stress is showing up at healthy, manageable levels.',
    ayurvedicLens: 'Prana (life force) and Sattva (mental clarity) are flowing well. Your Manovaha-srotas (mental channels) are unobstructed.',
    recommendations: {
      lifestyle: ['Maintain your existing stress-management practices', 'Aim for daily 10-min mindfulness or breath work', 'Keep work/personal boundaries firm'],
      ayurvedic: ['Continue any Dinacharya routine you have', 'Optional: weekly Abhyanga (self-oil-massage) to prevent future Vata accumulation'],
      herbs: ['Brahmi ghee — 1/2 tsp daily as Rasayana', 'Tulsi tea — daily'],
      whenToSeekHelp: 'No immediate need. Re-take this check in 6 months to track.',
    },
  },
  'stress.amber': {
    axis: 'stress', label: 'Chronic stress',
    tagline: 'Some persistent tension is building.',
    summary: 'You\'re managing, but stress is showing up regularly enough to warrant a 4–8 week recalibration. Without action, this often progresses to burnout.',
    ayurvedicLens: 'Early Vata aggravation in the Manovaha-srotas. Sattva is being clouded by Rajas (over-activation). Manageable with daily practices.',
    recommendations: {
      lifestyle: ['Establish strict sleep + wake times', 'Daily 20-min walk in nature', 'Breath work twice daily — Nadi Shodhana 10 minutes', 'Reduce caffeine after 12pm', 'Phone off 1 hour before bed'],
      ayurvedic: ['Daily Abhyanga with warm sesame oil — 10 min before shower', 'Padabhyanga (foot massage) at bedtime', 'Weekly Shirodhara at a CCIM-verified centre if possible'],
      herbs: ['Ashwagandha — 500 mg twice daily', 'Brahmi — 250 mg twice daily', 'Saraswatarishtam — 15 ml twice daily after meals'],
      whenToSeekHelp: 'If you don\'t see improvement in 6 weeks of consistent practice, book a consultation with a BAMS doctor or counsellor.',
    },
  },
  'stress.orange': {
    axis: 'stress', label: 'Chronic stress',
    tagline: 'Your nervous system is in dysregulation.',
    summary: 'You\'re carrying significant chronic stress. This level typically affects sleep, digestion, immunity, and relationships if unaddressed for more than a few months.',
    ayurvedicLens: 'Vata is markedly aggravated in Manovaha-srotas; Ojas (vital essence) is being depleted. A structured Panchakarma protocol — particularly Shirodhara — is classically indicated.',
    recommendations: {
      lifestyle: ['Take a real break — even 3 days off-grid helps', 'Daily 30+ min movement', 'Stop news consumption for 14 days', 'Set non-negotiable sleep hours', 'Speak to a trusted person weekly about how you\'re feeling'],
      ayurvedic: ['Book Shirodhara series — 7–14 sessions at a CCIM centre', 'Daily Abhyanga + Padabhyanga', 'Consider 14-day residential Panchakarma', 'Yoga Nidra daily'],
      herbs: ['Brahmi Ghrita — 1/4 tsp morning', 'Ashwagandha — 1 g twice daily', 'Saraswatarishtam — 20 ml twice daily', 'Jatamansi — 250 mg evening'],
      whenToSeekHelp: 'Book a consultation now — both with a BAMS doctor for Ayurvedic protocols AND a mental-health professional if you have persistent low mood or anxiety symptoms.',
    },
  },
  'stress.red': {
    axis: 'stress', label: 'Chronic stress',
    tagline: 'You\'re past the point of self-management.',
    summary: 'Your score indicates severe chronic stress with likely systemic effects. This level is associated with elevated cardiovascular risk, sleep disorder, and burnout — please seek professional support.',
    ayurvedicLens: 'Vata is heavily vitiated across multiple srotas. Ojas is significantly depleted. Internal Snehapana followed by Shirodhara and Basti is the classical protocol — but only under MD supervision.',
    recommendations: {
      lifestyle: ['Reduce work commitments — at least 2 weeks off if possible', 'Daily contact with a trusted person', 'No alcohol, no late nights, no caffeine excess'],
      ayurvedic: ['CCIM consultation within 1 week', 'Likely candidate for 21-day residential Panchakarma', 'Daily supervised practices once enrolled'],
      herbs: ['Do NOT self-prescribe at this level — work with a BAMS doctor on Brahmi, Ashwagandha, Jatamansi, Tagara dosing'],
      whenToSeekHelp: 'Immediately. Both a CCIM-registered Vaidya AND a licensed mental-health professional. If you have thoughts of self-harm, call iCall (+91 9152987821) or your local emergency line right now.',
    },
  },

  // ─── BURNOUT ─────────────────────────────────────────────────────
  'burnout.green': {
    axis: 'burnout', label: 'Burnout',
    tagline: 'Your energy and engagement are intact.',
    summary: 'You\'re showing healthy levels of energy, professional confidence, and weekend recovery. The work-rest cycle is functioning.',
    ayurvedicLens: 'Ojas (vital essence) is well-maintained. Tejas (metabolic fire) is balanced.',
    recommendations: {
      lifestyle: ['Continue current boundaries and rest practices', 'Plan one full day per week with no work', 'Annual extended break'],
      ayurvedic: ['Seasonal Rasayana practices — Amalaki + Chyavanprash through winter', 'Annual Panchakarma as a preventive ritu-Shodhana'],
      herbs: ['Chyavanprash — 1 tsp daily through autumn-winter', 'Amalaki — daily'],
      whenToSeekHelp: 'Re-take this in 6 months.',
    },
  },
  'burnout.amber': {
    axis: 'burnout', label: 'Burnout',
    tagline: 'Energy is dipping below sustainable.',
    summary: 'Early signs of burnout are present — fatigue not fully reversed by weekends, some disengagement. This is a turn-around-able stage.',
    ayurvedicLens: 'Ojas is mildly depleted. Tejas may be over-burning. Classical Rasayana (rejuvenation) practices help.',
    recommendations: {
      lifestyle: ['Audit your week — identify and cut at least one "should but doesn\'t matter" activity', 'Phone off 1h before bed and 30 min after waking', 'Walking lunches — fresh air daily', 'Weekend completely off-work'],
      ayurvedic: ['Daily Abhyanga + Pinda Sweda', 'Weekly Padabhyanga (foot oil massage)', 'Consider 1-week Rasayana retreat'],
      herbs: ['Ashwagandha — 500 mg morning + evening', 'Shatavari — 500 mg twice daily', 'Chyavanprash — 1 tsp morning'],
      whenToSeekHelp: 'BAMS consultation within 4 weeks if no improvement.',
    },
  },
  'burnout.orange': {
    axis: 'burnout', label: 'Burnout',
    tagline: 'Established burnout — needs structured recovery.',
    summary: 'You\'re in active burnout. Weekend rest no longer restores you. Cynicism and self-doubt are appearing. The body is showing physical signs.',
    ayurvedicLens: 'Significant Ojas depletion (Ojas-Kshaya) with Vata aggravation. Classical treatment: Snehapana (internal ghee) → Brmhana (nourishing) Panchakarma → 6-month Rasayana phase.',
    recommendations: {
      lifestyle: ['Request a leave of absence if possible — even 2 weeks helps significantly', 'Daily 20 min nature walking', 'No news / social media for 21 days', 'One activity that brings joy daily'],
      ayurvedic: ['BAMS / MD consultation within 2 weeks', '14-day residential Panchakarma recommended', 'Shirodhara course if not residential', 'Daily Padabhyanga + Abhyanga'],
      herbs: ['Ashwagandha — 1 g twice daily', 'Shatavari — 1 g twice daily', 'Brahmi Ghrita — 1/4 tsp morning', 'Phala Ghrita if reproductive symptoms'],
      whenToSeekHelp: 'Within 2 weeks. Burnout this advanced rarely self-corrects.',
    },
  },
  'burnout.red': {
    axis: 'burnout', label: 'Burnout',
    tagline: 'Severe burnout — requires immediate care.',
    summary: 'You\'re showing severe burnout with multiple physical manifestations. This level needs medical, Ayurvedic, and psychological intervention together.',
    ayurvedicLens: 'Severe Ojas-Kshaya with full systemic Vata vitiation. Body has begun to break down (Dhatu-Kshaya). Classical: emergency-grade Snehapana + Brmhana protocol under continuous supervision.',
    recommendations: {
      lifestyle: ['Stop work immediately if at all possible', 'Daily contact with a healthcare professional', 'No exercise beyond walking until energy returns'],
      ayurvedic: ['Urgent BAMS / MD consultation', '21-day residential Panchakarma strongly recommended', 'Full Brmhana protocol with Snehapana + Pizhichil + Shirodhara'],
      herbs: ['Strictly doctor-prescribed only at this level'],
      whenToSeekHelp: 'Today. See both a CCIM-registered Vaidya and a GP. Rule out thyroid, anaemia, vitamin D + B12 deficiency, depression.',
    },
  },

  // ─── METABOLIC ───────────────────────────────────────────────────
  'metabolic.green': {
    axis: 'metabolic', label: 'Metabolic risk',
    tagline: 'Your lifestyle is protecting your long-term health.',
    summary: 'Your activity, diet, and family-history profile place you at low risk for type 2 diabetes, hypertension, and metabolic syndrome.',
    ayurvedicLens: 'Agni (metabolic fire) is balanced. Medo-dhatu (adipose tissue) is in healthy proportion. Kapha is well-regulated.',
    recommendations: {
      lifestyle: ['Maintain 150+ min/week of activity', 'Continue whole-food eating', 'Annual basic lab panel: HbA1c, lipids, fasting glucose'],
      ayurvedic: ['Seasonal cleansing (Ritu-Shodhana) — gentle Virechana once a year', 'Triphala 1 tsp + warm water at bedtime as Rasayana'],
      herbs: ['Triphala daily', 'Turmeric in food', 'Fenugreek soaked overnight, water on rising'],
      whenToSeekHelp: 'Annual GP + BAMS check.',
    },
  },
  'metabolic.amber': {
    axis: 'metabolic', label: 'Metabolic risk',
    tagline: 'Risk factors are accumulating.',
    summary: 'A combination of low activity, processed food, or family history is creating meaningful long-term risk. Now is the right time to course-correct.',
    ayurvedicLens: 'Early Medo-vridhi (adipose accumulation) with mild Kapha excess. Agni is slightly Manda (slow). Reversible with daily lifestyle changes.',
    recommendations: {
      lifestyle: ['Build to 150 min/week brisk walking or equivalent', 'Replace ultra-processed snacks with fruit, nuts, roasted chana', 'Eat largest meal at midday, light dinner before 7pm', 'Stand or walk for 5 min every hour at work'],
      ayurvedic: ['Daily Udwarthanam (dry-powder massage) before shower', 'Hot water with lemon + honey on rising', 'No daytime sleep'],
      herbs: ['Triphala — 1 tsp at bedtime', 'Trikatu — 250 mg with meals', 'Methi (fenugreek) — soaked overnight, water in morning', 'Punarnava — 500 mg twice daily'],
      whenToSeekHelp: 'Annual basic labs (HbA1c, lipids). Re-test this assessment in 12 weeks of practice.',
    },
  },
  'metabolic.orange': {
    axis: 'metabolic', label: 'Metabolic risk',
    tagline: 'Pre-diabetic / pre-metabolic syndrome territory.',
    summary: 'Your profile suggests significant metabolic risk. Without intervention, progression to type 2 diabetes, fatty liver, or hypertension within 5–10 years is likely.',
    ayurvedicLens: 'Established Medo-vridhi with Kapha + Pitta vitiation in Rasa-Rakta-Mamsa-Medas. Classical: Lekhana (scraping) Panchakarma + sustained lifestyle reset.',
    recommendations: {
      lifestyle: ['Daily 45-min activity — non-negotiable', 'No refined sugar / white flour for 90 days', 'Plate model: 1/2 vegetables, 1/4 protein, 1/4 whole grain', 'Annual labs every 6 months'],
      ayurvedic: ['BAMS consultation within 4 weeks', 'Daily Udwarthanam', 'Consider 14-day Lekhana-Basti residential', 'Hot water + spice infusions throughout day'],
      herbs: ['Triphala-Guggulu — 500 mg twice daily', 'Gymnema (Madhunashini) — 500 mg twice daily before meals', 'Punarnava — 500 mg twice daily', 'Methi — soaked + powder forms'],
      whenToSeekHelp: 'Within 4 weeks. Get labs done first: HbA1c, fasting glucose, lipid panel, LFT, USG abdomen.',
    },
  },
  'metabolic.red': {
    axis: 'metabolic', label: 'Metabolic risk',
    tagline: 'High metabolic risk — coordinated care needed.',
    summary: 'You likely already have or are very close to type 2 diabetes, metabolic syndrome, or significant cardiovascular risk. Integrate medical + Ayurvedic care.',
    ayurvedicLens: 'Late-stage Prameha / Sthaulya. Classical Apatarpana (depleting) therapy under physician supervision. Never self-Shodhana at this risk level.',
    recommendations: {
      lifestyle: ['GP consultation this week — full lab work-up', 'Build to daily 45-min activity once cleared', 'Strict whole-food diet — work with a dietitian'],
      ayurvedic: ['Integrated care with both a GP and a CCIM-registered BAMS specialising in Madhumeha', 'Residential Lekhana / Sthaulya protocol after baseline labs', 'Long-term Rasayana phase'],
      herbs: ['Doctor-only at this level — Vasant Kusumakar Ras and others require monitoring'],
      whenToSeekHelp: 'This week. Both GP and BAMS. Don\'t skip either.',
    },
  },

  // ─── SLEEP ───────────────────────────────────────────────────────
  'sleep.green': {
    axis: 'sleep', label: 'Sleep quality',
    tagline: 'Your sleep architecture is healthy.',
    summary: 'You\'re falling asleep promptly, staying asleep, and waking refreshed. Your circadian rhythm is well-regulated.',
    ayurvedicLens: 'Tarpaka Kapha (cerebral nourishing Kapha) is well-maintained. Sleep is restoring Ojas as it should.',
    recommendations: {
      lifestyle: ['Maintain consistent sleep + wake times', 'Avoid screens 30 min before bed', 'Keep bedroom cool, dark, quiet'],
      ayurvedic: ['Padabhyanga (foot oil massage) before bed — even 2 min helps', 'Warm milk with cardamom + nutmeg if needed'],
      herbs: ['No need at this level. Optional: Brahmi-Yashtimadhu warm milk as Medhya Rasayana.'],
      whenToSeekHelp: 'Not needed currently.',
    },
  },
  'sleep.amber': {
    axis: 'sleep', label: 'Sleep quality',
    tagline: 'Sleep is mildly disturbed.',
    summary: 'Some difficulty falling asleep, occasional mid-night waking, or screen-driven late nights. Easily corrected with discipline.',
    ayurvedicLens: 'Mild Vata aggravation in the head + nervous system. Tarpaka Kapha is depleting. Vata pacification at bedtime is the key.',
    recommendations: {
      lifestyle: ['Screen off 1 hour before bed — non-negotiable', 'Hot shower + warm milk at bedtime', 'No work in bed', 'Same wake-up time daily — even weekends', 'No napping after 3pm'],
      ayurvedic: ['Daily Padabhyanga at bedtime — warm sesame oil', 'Murdha-taila (oil to crown) before bed', 'Shirodhara series of 7 if access permits'],
      herbs: ['Brahmi tea before bed', 'Ashwagandha — 500 mg evening', 'Warm milk + nutmeg + cardamom + 1 tsp ghee'],
      whenToSeekHelp: 'If not improving in 4 weeks of consistent practice.',
    },
  },
  'sleep.orange': {
    axis: 'sleep', label: 'Sleep quality',
    tagline: 'Insomnia is established.',
    summary: 'Your sleep is significantly disturbed — long onset, frequent waking, or daytime exhaustion. This affects mood, cognition, immunity, and metabolism.',
    ayurvedicLens: 'Vata strongly aggravated in Manovaha + Tarpaka Kapha significantly depleted. Anidra (insomnia) needs structured Snehana + Shirodhara + Medhya Rasayana.',
    recommendations: {
      lifestyle: ['Strict sleep hygiene — same time daily, no screens, cool room', 'No caffeine after 11am', 'No alcohol (it disrupts deep sleep)', 'Daily 30-min outdoor exposure to morning sunlight'],
      ayurvedic: ['BAMS consultation within 2 weeks', 'Shirodhara series of 14 ideal', 'Daily Abhyanga + Padabhyanga'],
      herbs: ['Saraswatarishtam — 15 ml twice daily', 'Tagara — 250 mg evening', 'Jatamansi — 500 mg evening', 'Ashwagandha Ghrita — 1/2 tsp evening'],
      whenToSeekHelp: 'Within 2 weeks. Persistent insomnia also warrants screening for thyroid issues, sleep apnoea, depression.',
    },
  },
  'sleep.red': {
    axis: 'sleep', label: 'Sleep quality',
    tagline: 'Severe sleep disorder — needs professional assessment.',
    summary: 'You\'re experiencing severe sleep dysfunction. This level is associated with serious physical and psychological consequences. Self-medicating with alcohol or OTC drugs is making it worse.',
    ayurvedicLens: 'Severe Anidra with full Vata vitiation. Classical: Snehapana + Shirodhara + Murdha-taila under doctor supervision. Never self-Shodhana at this level.',
    recommendations: {
      lifestyle: ['Stop alcohol use immediately if using as sleep aid', 'Daily 30-min outdoor sunlight exposure'],
      ayurvedic: ['Urgent BAMS / MD consultation', 'Likely candidate for residential Panchakarma'],
      herbs: ['Doctor-prescribed only'],
      whenToSeekHelp: 'This week. Get screened by both a sleep physician AND a BAMS / MD. Rule out sleep apnoea (especially if you snore), thyroid, depression, restless leg syndrome.',
    },
  },
}

export function generateReport(axisScores: AxisScore[]): AxisReport[] {
  return axisScores.map((s) => {
    const key = `${s.axis}.${s.tier}`
    return TIER_REPORTS[key]
  }).filter((r): r is AxisReport => Boolean(r))
}
