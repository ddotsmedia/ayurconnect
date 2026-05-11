// 25 Prakriti-determination questions across 7 categories.
// Each question offers three responses tagged V (Vata), P (Pitta), K (Kapha).
//
// This is a Prakriti screener, not a diagnostic instrument. Final analysis
// should always come from an in-person Nadi-Pariksha by a CCIM-registered
// Vaidya. Quiz outputs include this caveat prominently.

export type Dosha = 'V' | 'P' | 'K'

export type Question = {
  id: string
  category: string
  prompt: string
  options: Array<{ dosha: Dosha; label: string }>
}

export const CATEGORIES = [
  { key: 'body',      label: 'Body frame & physique' },
  { key: 'skin',      label: 'Skin & complexion' },
  { key: 'hair',      label: 'Hair' },
  { key: 'digestion', label: 'Digestion & appetite' },
  { key: 'sleep',     label: 'Sleep' },
  { key: 'mind',      label: 'Mind & temperament' },
  { key: 'activity',  label: 'Activity & energy' },
] as const

export const QUESTIONS: Question[] = [
  // ─── Body frame (4) ───────────────────────────────────────────────
  {
    id: 'body.frame',
    category: 'body',
    prompt: 'Your overall body frame is best described as:',
    options: [
      { dosha: 'V', label: 'Thin, slender, light — find it hard to gain weight' },
      { dosha: 'P', label: 'Medium build — proportionate, athletic, well-muscled' },
      { dosha: 'K', label: 'Solid, broad-shouldered, sturdy — gain weight easily' },
    ],
  },
  {
    id: 'body.weight',
    category: 'body',
    prompt: 'When you gain or lose weight, your pattern is:',
    options: [
      { dosha: 'V', label: 'Gain slowly, lose easily — tend toward underweight' },
      { dosha: 'P', label: 'Gain & lose moderately — weight stays consistent' },
      { dosha: 'K', label: 'Gain easily, lose with great effort — tend toward overweight' },
    ],
  },
  {
    id: 'body.joints',
    category: 'body',
    prompt: 'Your joints typically:',
    options: [
      { dosha: 'V', label: 'Crack or pop often, feel dry or stiff' },
      { dosha: 'P', label: 'Feel warm, sometimes inflamed or tender' },
      { dosha: 'K', label: 'Are well-padded, large, stable, rarely problematic' },
    ],
  },
  {
    id: 'body.temperature',
    category: 'body',
    prompt: 'Your body temperature & comfort:',
    options: [
      { dosha: 'V', label: 'Feel cold easily — hands & feet often cold' },
      { dosha: 'P', label: 'Feel hot easily — prefer cooler climates' },
      { dosha: 'K', label: 'Tolerate cold well — feel cool, sometimes clammy' },
    ],
  },

  // ─── Skin (3) ─────────────────────────────────────────────────────
  {
    id: 'skin.texture',
    category: 'skin',
    prompt: 'Your skin texture is mostly:',
    options: [
      { dosha: 'V', label: 'Dry, thin, rough — prone to chapping' },
      { dosha: 'P', label: 'Warm, soft, sensitive — prone to rashes or acne' },
      { dosha: 'K', label: 'Thick, smooth, oily — rarely chapped or irritated' },
    ],
  },
  {
    id: 'skin.color',
    category: 'skin',
    prompt: 'Your complexion / skin tone is:',
    options: [
      { dosha: 'V', label: 'Dusky, brownish, or pale — may look tired' },
      { dosha: 'P', label: 'Fair, ruddy, freckled — flushes easily' },
      { dosha: 'K', label: 'Pale, glowing, even — rarely blemished' },
    ],
  },
  {
    id: 'skin.sweat',
    category: 'skin',
    prompt: 'You sweat:',
    options: [
      { dosha: 'V', label: 'Very little — even after exertion' },
      { dosha: 'P', label: 'Profusely — and it can smell strong' },
      { dosha: 'K', label: 'Moderately — pleasant, mild odour' },
    ],
  },

  // ─── Hair (3) ─────────────────────────────────────────────────────
  {
    id: 'hair.texture',
    category: 'hair',
    prompt: 'Your hair is naturally:',
    options: [
      { dosha: 'V', label: 'Dry, frizzy, brittle — prone to split ends' },
      { dosha: 'P', label: 'Fine, soft — straight or slightly wavy' },
      { dosha: 'K', label: 'Thick, lustrous, oily — abundant volume' },
    ],
  },
  {
    id: 'hair.color',
    category: 'hair',
    prompt: 'Greying happens for you:',
    options: [
      { dosha: 'V', label: 'Average pace — but hair often falls out early' },
      { dosha: 'P', label: 'Early — first greys before age 35' },
      { dosha: 'K', label: 'Late — hair retains colour well past 40' },
    ],
  },
  {
    id: 'hair.scalp',
    category: 'hair',
    prompt: 'Your scalp is:',
    options: [
      { dosha: 'V', label: 'Dry — flakes, dandruff, itchy' },
      { dosha: 'P', label: 'Sensitive — sometimes red, hot, or premature thinning' },
      { dosha: 'K', label: 'Oily — needs frequent washing' },
    ],
  },

  // ─── Digestion (4) ────────────────────────────────────────────────
  {
    id: 'digest.appetite',
    category: 'digestion',
    prompt: 'Your appetite is:',
    options: [
      { dosha: 'V', label: 'Variable — sometimes ravenous, sometimes none' },
      { dosha: 'P', label: 'Strong & sharp — irritable if meals are delayed' },
      { dosha: 'K', label: 'Steady — can comfortably skip a meal' },
    ],
  },
  {
    id: 'digest.thirst',
    category: 'digestion',
    prompt: 'You feel thirst:',
    options: [
      { dosha: 'V', label: 'Variably — sometimes forget to drink' },
      { dosha: 'P', label: 'Often & strongly — large quantities' },
      { dosha: 'K', label: 'Rarely — small quantities are enough' },
    ],
  },
  {
    id: 'digest.bowel',
    category: 'digestion',
    prompt: 'Your bowel movements are typically:',
    options: [
      { dosha: 'V', label: 'Irregular — dry, hard, sometimes constipated' },
      { dosha: 'P', label: 'Frequent — loose, well-formed, sometimes urgent' },
      { dosha: 'K', label: 'Regular & well-formed — once daily, heavy' },
    ],
  },
  {
    id: 'digest.gas',
    category: 'digestion',
    prompt: 'After eating, you most often feel:',
    options: [
      { dosha: 'V', label: 'Bloated, gassy, or distended' },
      { dosha: 'P', label: 'Heated, sometimes hyperacidic or with reflux' },
      { dosha: 'K', label: 'Heavy, drowsy — want to nap' },
    ],
  },

  // ─── Sleep (3) ────────────────────────────────────────────────────
  {
    id: 'sleep.pattern',
    category: 'sleep',
    prompt: 'Your sleep is usually:',
    options: [
      { dosha: 'V', label: 'Light & interrupted — wake easily' },
      { dosha: 'P', label: 'Moderate — wake refreshed if 6–7 hours' },
      { dosha: 'K', label: 'Deep & long — can sleep 9+ hours and still feel groggy' },
    ],
  },
  {
    id: 'sleep.dreams',
    category: 'sleep',
    prompt: 'Your dreams are most often:',
    options: [
      { dosha: 'V', label: 'Fast-paced, anxious, flying or falling' },
      { dosha: 'P', label: 'Intense, vivid, fiery or competitive' },
      { dosha: 'K', label: 'Calm, watery, romantic, slow-moving' },
    ],
  },
  {
    id: 'sleep.morning',
    category: 'sleep',
    prompt: 'Mornings, you feel:',
    options: [
      { dosha: 'V', label: 'Alert but anxious — body slow to warm up' },
      { dosha: 'P', label: 'Sharp & focused — ready to start' },
      { dosha: 'K', label: 'Groggy & slow — need significant time to get going' },
    ],
  },

  // ─── Mind (4) ─────────────────────────────────────────────────────
  {
    id: 'mind.thinking',
    category: 'mind',
    prompt: 'Your thinking pattern is:',
    options: [
      { dosha: 'V', label: 'Quick, creative, scattered — many ideas at once' },
      { dosha: 'P', label: 'Sharp, focused, analytical — clear logic' },
      { dosha: 'K', label: 'Slow, steady, methodical — deep retention' },
    ],
  },
  {
    id: 'mind.memory',
    category: 'mind',
    prompt: 'Your memory pattern:',
    options: [
      { dosha: 'V', label: 'Learn fast, forget fast' },
      { dosha: 'P', label: 'Sharp short-term recall, clear medium-term' },
      { dosha: 'K', label: 'Slow to learn but never forget once learned' },
    ],
  },
  {
    id: 'mind.stress',
    category: 'mind',
    prompt: 'Under stress, you tend to become:',
    options: [
      { dosha: 'V', label: 'Anxious, worried, scattered — racing thoughts' },
      { dosha: 'P', label: 'Irritable, frustrated, hot-tempered' },
      { dosha: 'K', label: 'Withdrawn, lethargic, melancholic' },
    ],
  },
  {
    id: 'mind.decision',
    category: 'mind',
    prompt: 'When making decisions, you:',
    options: [
      { dosha: 'V', label: 'Change your mind often — many options open' },
      { dosha: 'P', label: 'Decide quickly and stick to it firmly' },
      { dosha: 'K', label: 'Take time — but rarely revise once decided' },
    ],
  },

  // ─── Activity (4) ─────────────────────────────────────────────────
  {
    id: 'activity.pace',
    category: 'activity',
    prompt: 'Your natural pace is:',
    options: [
      { dosha: 'V', label: 'Fast, restless — talk and move quickly' },
      { dosha: 'P', label: 'Purposeful, driven — efficient movements' },
      { dosha: 'K', label: 'Slow, measured — graceful, deliberate' },
    ],
  },
  {
    id: 'activity.endurance',
    category: 'activity',
    prompt: 'Your physical endurance is:',
    options: [
      { dosha: 'V', label: 'Low — tire quickly, need frequent rest' },
      { dosha: 'P', label: 'Moderate — strong but heat-intolerant' },
      { dosha: 'K', label: 'High — long-lasting strength once started' },
    ],
  },
  {
    id: 'activity.exercise',
    category: 'activity',
    prompt: 'The exercise you most enjoy:',
    options: [
      { dosha: 'V', label: 'Yoga, dance, walking — gentle but varied' },
      { dosha: 'P', label: 'Running, cycling, competitive sport — moderate-intense' },
      { dosha: 'K', label: 'Weight training, swimming, hiking — strong, sustained' },
    ],
  },
  {
    id: 'activity.money',
    category: 'activity',
    prompt: 'With money, you tend to:',
    options: [
      { dosha: 'V', label: 'Spend impulsively on small things — save inconsistently' },
      { dosha: 'P', label: 'Spend deliberately on quality — invest strategically' },
      { dosha: 'K', label: 'Save methodically — slow to part with money' },
    ],
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length
