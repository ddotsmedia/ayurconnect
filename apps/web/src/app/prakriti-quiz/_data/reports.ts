// Detailed dosha reports — surfaced on the /prakriti-quiz/result page after
// scoring. One entry per dominant dosha (single + dual + tridoshic).
//
// Content is educational, not prescriptive — a screener result is not a
// replacement for in-person Nadi-Pariksha by a verified Vaidya.

export type DoshaReport = {
  key: string
  title: string
  sanskrit: string
  tagline: string
  // Personality / body summary
  description: string
  // Bullet-point characteristics
  traits: string[]
  // What to favour in diet & lifestyle
  favor: { diet: string[]; lifestyle: string[]; herbs: string[] }
  // What to avoid / minimise
  avoid: string[]
  // Tendencies for imbalance / disease
  watchOut: string
  // Best treatments for this dosha
  bestProcedures: string[]
}

export const REPORTS: Record<string, DoshaReport> = {
  vata: {
    key: 'vata',
    title: 'Vata Prakriti',
    sanskrit: 'वात',
    tagline: 'Air & ether — quick, creative, mobile',
    description: 'You are governed primarily by Vata dosha — the principle of movement, communication, and transformation in the body. Vata types are typically slender, quick-thinking, creative, and adaptable. When in balance, you are vibrant, articulate, and enthusiastic. When out of balance, you tend toward anxiety, insomnia, dryness, and digestive irregularity.',
    traits: [
      'Light, slender frame; thin bones; prominent joints',
      'Dry skin, cold hands and feet, irregular sweating',
      'Quick-talking, quick-walking, quick-thinking',
      'Creative, artistic, adaptable, enthusiastic',
      'Irregular appetite; sometimes ravenous, sometimes none',
      'Light, easily-disturbed sleep; vivid dreams',
      'Variable energy — bursts of activity followed by exhaustion',
    ],
    favor: {
      diet: [
        'Warm, moist, well-cooked foods (kichari, soups, stews)',
        'Sweet, sour, salty tastes — pacify Vata',
        'Healthy oils & fats — ghee, sesame, olive',
        'Cooked grains: rice, oats, wheat',
        'Warm spices: ginger, cinnamon, cardamom, cumin',
        'Warm milk with cardamom before bed',
      ],
      lifestyle: [
        'Regular daily routine — set sleep & meal times',
        'Daily abhyanga (warm sesame oil self-massage)',
        'Gentle, grounding exercise — yoga, tai chi, swimming',
        'Early sleep (before 10 pm); wake at sunrise',
        'Warm clothing, especially in cold/windy weather',
        'Meditation, pranayama (especially Nadi Shodhana)',
      ],
      herbs: ['Ashwagandha', 'Bala', 'Shatavari', 'Dashamoola', 'Triphala (small doses)', 'Brahmi', 'Yashtimadhu', 'Jatamansi'],
    },
    avoid: [
      'Cold, dry, raw foods (salads, ice water)',
      'Bitter, astringent, pungent tastes in excess',
      'Skipping meals; irregular eating schedule',
      'Caffeine excess and stimulants',
      'Cold, windy weather without protection',
      'Vigorous high-impact exercise',
      'Travel without rest; late nights; screens before bed',
    ],
    watchOut: 'Vata types are predisposed to anxiety, insomnia, constipation, dry-skin disorders, joint pain (Sandhivata), tinnitus, and neurological complaints. Maintain warmth, regularity, and grounding routines proactively — Vata in imbalance escalates quickly.',
    bestProcedures: ['Abhyanga + Swedana', 'Shirodhara', 'Basti (Niruha + Anuvasana)', 'Nasya', 'Kati / Janu Basti'],
  },

  pitta: {
    key: 'pitta',
    title: 'Pitta Prakriti',
    sanskrit: 'पित्त',
    tagline: 'Fire & water — sharp, driven, intense',
    description: 'You are governed primarily by Pitta dosha — the principle of transformation, metabolism, and intelligence. Pitta types are typically medium-built, sharp-minded, ambitious, and goal-oriented. When in balance, you are confident, perceptive, and a natural leader. When out of balance, you tend toward irritability, inflammation, acidity, and overheating.',
    traits: [
      'Medium build, well-proportioned, athletic',
      'Warm skin, ruddy or freckled complexion, sensitive',
      'Strong appetite — irritable if meals are delayed',
      'Sharp intellect, focused, articulate, ambitious',
      'Natural leadership; precise, organised',
      'Sound sleep, moderate length, intense vivid dreams',
      'Heat intolerance — uncomfortable in hot, humid weather',
    ],
    favor: {
      diet: [
        'Cooling, slightly sweet, mildly bitter & astringent foods',
        'Plenty of fresh vegetables, leafy greens, cucumber, coconut',
        'Sweet juicy fruits — pears, melons, apples, grapes',
        'Coconut water, milk, ghee, sweetened dairy in moderation',
        'Cooling spices: coriander, fennel, mint, cardamom',
        'Eat at regular times — never skip meals',
      ],
      lifestyle: [
        'Stay cool — avoid sun at midday, cool showers',
        'Moderate exercise — swimming, evening walks, moonlight yoga',
        'Cooling pranayama (Sheetali, Sheetkari, Chandra Bhedana)',
        'Channel ambition into purposeful activity — avoid overwork',
        'Spend time in nature — forests, water bodies, gardens',
        'Cultivate compassion & patience deliberately',
      ],
      herbs: ['Shatavari', 'Amalaki (Amla)', 'Yashtimadhu', 'Brahmi', 'Guduchi', 'Aloe vera', 'Manjishtha', 'Neem (in moderation)'],
    },
    avoid: [
      'Hot, spicy, sour, salty, fried, fermented foods',
      'Excessive alcohol, caffeine, vinegar, garlic, mustard',
      'Skipping meals — leads to immediate irritability',
      'Midday sun, hot saunas, overheating',
      'Competitive overwork without rest',
      'Anger, criticism, perfectionism (key Pitta-trigger behaviours)',
      'Late-night work — Pitta governs 10pm-2am',
    ],
    watchOut: 'Pitta types are predisposed to hyperacidity, peptic ulcers, dermatitis, psoriasis, urticaria, hypertension, migraine, and inflammatory disorders. Burnout is a real risk — proactively manage workload, cool the system, and cultivate non-attachment.',
    bestProcedures: ['Virechana', 'Takradhara', 'Shirodhara (cooling oils)', 'Raktamokshana', 'Pizhichil (with cooling oils)'],
  },

  kapha: {
    key: 'kapha',
    title: 'Kapha Prakriti',
    sanskrit: 'कफ',
    tagline: 'Earth & water — solid, calm, enduring',
    description: 'You are governed primarily by Kapha dosha — the principle of structure, lubrication, and stability. Kapha types are typically well-built, calm, loyal, and steady. When in balance, you are grounded, compassionate, and physically robust. When out of balance, you tend toward weight gain, congestion, lethargy, and attachment.',
    traits: [
      'Solid, broad-shouldered frame; strong bones; well-padded joints',
      'Smooth, oily, cool skin; thick lustrous hair',
      'Steady, moderate appetite — can comfortably skip meals',
      'Calm, patient, methodical, loyal, compassionate',
      'Deep, long, sound sleep; calm dreams',
      'Slow to anger, slow to start — but enduring once committed',
      'Tolerates cold well; dislikes damp, cool weather',
    ],
    favor: {
      diet: [
        'Light, warm, dry foods — millet, barley, buckwheat, quinoa',
        'Pungent, bitter, astringent tastes (ginger, pepper, leafy greens)',
        'Plenty of vegetables — leafy greens, cruciferous, lightly cooked',
        'Lentils & legumes — mung dal especially',
        'Warm spices: ginger, black pepper, turmeric, cumin, mustard',
        'Hot water with honey & lemon in the morning',
      ],
      lifestyle: [
        'Vigorous daily exercise — running, cycling, weight training, brisk walking',
        'Wake early (before 6 am) — Kapha time is 6-10 am',
        'No daytime sleep — most aggravating habit for Kapha',
        'Dry brushing (garshana) before bath',
        'Pranayama: Bhastrika, Kapalabhati (stimulating)',
        'Seek novelty, challenge, change — antidote to Kapha stagnation',
      ],
      herbs: ['Triphala', 'Guggulu', 'Trikatu', 'Pippali', 'Punarnava', 'Tulsi', 'Chitraka', 'Vidanga'],
    },
    avoid: [
      'Heavy, oily, cold, sweet foods (dairy excess, fried foods, ice cream)',
      'Daytime sleep — disrupts metabolism profoundly',
      'Sedentary lifestyle, prolonged sitting, screen-time excess',
      'Excessive salt — promotes water retention',
      'Cold drinks with meals',
      'Wheat & refined flour in excess',
      'Cold, damp weather without warm clothing',
    ],
    watchOut: 'Kapha types are predisposed to obesity, diabetes (Prameha), sluggish digestion, fatty liver, sinusitis, asthma, chronic bronchitis, depression with lethargy, and atherosclerosis. Stagnation is the enemy — challenge yourself daily.',
    bestProcedures: ['Vamana', 'Udwarthanam', 'Swedana', 'Lekhana Basti', 'Nasya (stimulant)'],
  },

  // Dual doshas: V-P, P-K, V-K. Tridoshic is rare and indicates balance.
  'vata-pitta': {
    key: 'vata-pitta',
    title: 'Vata-Pitta Prakriti',
    sanskrit: 'वात-पित्त',
    tagline: 'Air & fire — quick, sharp, restless',
    description: 'You combine Vata\'s mobility with Pitta\'s intensity — typically lean, sharp-minded, creative AND ambitious. You think quickly and act decisively, but can struggle with both anxiety (Vata) and irritability (Pitta). Cooling, grounding, regular routines suit you best.',
    traits: [
      'Slender to medium build; warm but variable temperature',
      'Quick-thinking and sharp-focused simultaneously',
      'High energy but burns out faster than pure Pitta',
      'Creative + driven — natural innovators',
      'Sleep can be light AND interrupted by intensity',
      'Both anxiety (V) and frustration (P) under stress',
    ],
    favor: {
      diet: [
        'Warm, slightly oily, well-cooked food — but not too spicy',
        'Sweet + slightly bitter tastes',
        'Coconut, ghee, sweet fruits, cooked vegetables, rice',
        'Cooling spices — coriander, fennel, mint — with grounding warmth (ginger, cumin)',
      ],
      lifestyle: [
        'Strict regular routine — both Vata & Pitta need timing',
        'Moderate, non-competitive exercise (walking, swimming, yoga)',
        'Daily abhyanga with coconut + sesame oil mix',
        'Pranayama: Nadi Shodhana + Sheetali',
        'Cooling, grounding, calming activities — nature, water, music',
      ],
      herbs: ['Shatavari', 'Brahmi', 'Yashtimadhu', 'Ashwagandha', 'Amalaki', 'Guduchi'],
    },
    avoid: [
      'Hot spicy food, dry crackers, raw salads in excess',
      'Skipping meals, irregular sleep',
      'High-intensity workouts in hot weather',
      'Caffeine + alcohol excess',
      'Late-night work',
    ],
    watchOut: 'Vata-Pitta types burn the candle at both ends — anxiety, hyperacidity, insomnia, and migraine are common when out of balance. Sustainability is your single biggest discipline.',
    bestProcedures: ['Shirodhara (coconut oil)', 'Abhyanga + Pizhichil', 'Virechana (gentle)', 'Takradhara'],
  },

  'pitta-kapha': {
    key: 'pitta-kapha',
    title: 'Pitta-Kapha Prakriti',
    sanskrit: 'पित्त-कफ',
    tagline: 'Fire & earth — strong, focused, enduring',
    description: 'You combine Pitta\'s drive with Kapha\'s stamina — typically well-built, athletic, focused, and steady. This is arguably the most physically robust combination. You can work intensely AND sustain it. The risk: inflammation + weight gain when out of balance.',
    traits: [
      'Strong, well-built frame; high stamina',
      'Sharp intellect with grounded patience',
      'Strong digestion — can eat large meals',
      'Natural athletes — power AND endurance',
      'Steady sleep; intense dreams',
      'Both anger (P) and lethargy (K) when imbalanced',
    ],
    favor: {
      diet: [
        'Cooling AND light foods — bitter greens, fruits, mung dal',
        'Bitter, astringent, sweet tastes',
        'Avoid heavy + hot combinations',
        'Plenty of vegetables, less grain, moderate protein',
      ],
      lifestyle: [
        'Vigorous daily exercise — drains both excess P and K',
        'Wake early; no daytime sleep',
        'Cool environment; moderate sun',
        'Channel ambition into purpose; release perfectionism',
        'Pranayama: Sheetali (cooling) + Bhastrika (stimulating)',
      ],
      herbs: ['Triphala', 'Guduchi', 'Manjishtha', 'Aloe vera', 'Neem', 'Turmeric'],
    },
    avoid: [
      'Heavy, oily, fried foods',
      'Daytime sleep, sedentary lifestyle',
      'Excessive salt, sugar, dairy',
      'Anger + overwork without rest',
    ],
    watchOut: 'Pitta-Kapha imbalance shows up as metabolic disorders — fatty liver, diabetes, hypertension, gout, gallstones. The body is robust until it isn\'t — preventive lifestyle care matters more than for any other type.',
    bestProcedures: ['Virechana', 'Udwarthanam', 'Takradhara', 'Lekhana Basti', 'Swedana'],
  },

  'vata-kapha': {
    key: 'vata-kapha',
    title: 'Vata-Kapha Prakriti',
    sanskrit: 'वात-कफ',
    tagline: 'Air & earth — variable, gentle, complex',
    description: 'You combine Vata\'s lightness with Kapha\'s heaviness — an unusual and somewhat contradictory combination. You can be both anxious AND lethargic, both creative AND attached, both cold-intolerant AND damp-intolerant. Warm, light, dry diet and routine help most.',
    traits: [
      'Variable frame — often appears thin but gains in waist/hips',
      'Cold hands AND congested chest',
      'Variable appetite — but cravings for heavy sweet food',
      'Creative + nurturing — natural caregivers',
      'Sleep deeply but feel groggy on waking',
      'Stress shows as withdrawal + low energy',
    ],
    favor: {
      diet: [
        'Warm, light, dry foods — soups, kichari, light grains',
        'Pungent + bitter + slightly sweet tastes',
        'Warm spices in abundance — ginger, pepper, cinnamon',
        'Smaller portions; avoid late dinners',
      ],
      lifestyle: [
        'Wake early; avoid daytime sleep',
        'Daily exercise — moderate intensity, building gradually',
        'Warm dry abhyanga (sesame oil, less than Vata; herb powder rub for Kapha)',
        'Pranayama: Bhastrika (stimulating) + Nadi Shodhana (balancing)',
        'Routine + novelty in balance — your two contradictions',
      ],
      herbs: ['Trikatu', 'Triphala', 'Ashwagandha', 'Pippali', 'Punarnava', 'Tulsi'],
    },
    avoid: [
      'Cold, raw, heavy, oily, sweet foods',
      'Sedentary lifestyle; daytime sleep',
      'Cold damp weather — particularly aggravating',
      'Skipping meals + overeating cycles',
    ],
    watchOut: 'Vata-Kapha imbalance presents as the worst of both — chronic fatigue, sluggish metabolism + anxiety, asthma, sinusitis, hypothyroidism, and depression with insomnia. Daily warmth + light food + activity is non-negotiable.',
    bestProcedures: ['Vamana (gentle)', 'Nasya', 'Udwarthanam', 'Abhyanga + Swedana', 'Basti (light)'],
  },

  tridoshic: {
    key: 'tridoshic',
    title: 'Tridoshic / Sama Prakriti',
    sanskrit: 'त्रिदोषीय / सम',
    tagline: 'All three in balance — the rarest constitution',
    description: 'Your three doshas appear nearly equal — a rare and fortunate constitution called Sama Prakriti. Classically described as ideal health, but also requiring careful balance — any single dosha rising disturbs the equilibrium. Seasonal eating, regular routine, and Ayurvedic preventive care matter even more for you than for single-dosha types.',
    traits: [
      'Balanced physical frame, balanced temperament',
      'Steady energy, steady mood, steady sleep',
      'Good digestion and absorption',
      'Resilient to weather and stress',
      'Not strongly drawn to any particular taste',
    ],
    favor: {
      diet: [
        'Eat seasonally — let the season set the dosha-pacifying tastes',
        'All six tastes in every meal (sweet, sour, salty, bitter, pungent, astringent)',
        'Fresh, whole foods cooked at home',
        'Spices to support the season',
      ],
      lifestyle: [
        'Follow Ritucharya (seasonal regimen) closely',
        'Daily yoga + pranayama + meditation',
        'Regular wake / sleep / meal times',
        'Annual Panchakarma — preventive cleansing each season change',
      ],
      herbs: ['Triphala', 'Chyavanprash', 'Amalaki', 'Brahmi', 'Ashwagandha'],
    },
    avoid: [
      'Whatever the current season most disturbs (cold-dry in autumn, hot-spicy in summer, heavy-sweet in winter)',
      'Sustained imbalance in any one direction',
    ],
    watchOut: 'A Sama Prakriti losing balance can swing in any direction. Pay attention to early signs — and treat them dosha-specifically.',
    bestProcedures: ['Seasonal Panchakarma', 'Rasayana protocols', 'Abhyanga + Shirodhara'],
  },
}

export function classify(v: number, p: number, k: number): string {
  const total = v + p + k
  if (total === 0) return 'tridoshic'

  // Within 15% of each other → tridoshic
  const max = Math.max(v, p, k)
  const min = Math.min(v, p, k)
  if ((max - min) / total < 0.15) return 'tridoshic'

  // Sort doshas by score desc
  const ranked = [
    { d: 'V', score: v },
    { d: 'P', score: p },
    { d: 'K', score: k },
  ].sort((a, b) => b.score - a.score)

  // If top score is > 1.4× the second → single-dosha dominant
  if (ranked[0].score > ranked[1].score * 1.4) {
    return ranked[0].d === 'V' ? 'vata' : ranked[0].d === 'P' ? 'pitta' : 'kapha'
  }

  // Otherwise dual — combine top two in canonical order V-P-K
  const top2 = [ranked[0].d, ranked[1].d].sort((a, b) => 'VPK'.indexOf(a) - 'VPK'.indexOf(b))
  if (top2.join('') === 'VP') return 'vata-pitta'
  if (top2.join('') === 'PK') return 'pitta-kapha'
  if (top2.join('') === 'VK') return 'vata-kapha'
  return 'tridoshic'
}
