// Default ArticleCategory taxonomy — 16 categories, upserted by deterministic
// id. Lucide icon names + brand-aligned hex colors. Existing KnowledgeArticle
// rows continue using the legacy `category` string column; their `categoryId`
// FK is backfilled by matching legacy slug to ArticleCategory.slug.

import type { PrismaClient } from '@prisma/client'

type Cat = { id: string; slug: string; name: string; nameMl: string | null; description: string; icon: string; color: string; sortOrder: number }

const CATS: Cat[] = [
  { id: 'cat-lifestyle',    slug: 'lifestyle',         name: 'Lifestyle',          nameMl: 'ജീവിതശൈലി',       description: 'Daily routine, dinacharya, sleep, exercise — the operating system of Ayurvedic health.', icon: 'Sun',         color: '#f59e0b', sortOrder: 10 },
  { id: 'cat-herbs',        slug: 'herbs',             name: 'Herbs',              nameMl: 'ഔഷധികൾ',          description: 'Single-herb monographs — properties, uses, dose, contraindications.',                       icon: 'Leaf',        color: '#15803d', sortOrder: 20 },
  { id: 'cat-diet',         slug: 'diet-nutrition',    name: 'Diet & Nutrition',   nameMl: 'ആഹാരം',           description: 'Pathya-Apathya, dosha-typed diet, classical Ayurvedic food principles.',                  icon: 'Salad',       color: '#16a34a', sortOrder: 30 },
  { id: 'cat-treatments',   slug: 'treatments',        name: 'Treatments',         nameMl: 'ചികിത്സകൾ',        description: 'Pizhichil, Sirodhara, Njavarakizhi — Kerala\'s signature procedures explained.',          icon: 'Sparkles',    color: '#0ea5e9', sortOrder: 40 },
  { id: 'cat-conditions',   slug: 'conditions',        name: 'Conditions',         nameMl: 'രോഗങ്ങൾ',         description: 'PCOS, arthritis, diabetes, fatty liver — Ayurvedic approach to specific conditions.',       icon: 'Stethoscope', color: '#dc2626', sortOrder: 50 },
  { id: 'cat-karkidaka',    slug: 'karkidaka',         name: 'Karkidaka Chikitsa', nameMl: 'കർക്കിടക ചികിത്സ', description: 'Kerala\'s monsoon rejuvenation tradition — recipes, regimen, retreat planning.',           icon: 'CloudRain',   color: '#0369a1', sortOrder: 60 },
  { id: 'cat-tridosha',     slug: 'tridosha',          name: 'Tridosha',           nameMl: 'ത്രിദോഷം',        description: 'Vata, Pitta, Kapha — the foundational framework of Ayurveda.',                            icon: 'Wind',        color: '#7c3aed', sortOrder: 70 },
  { id: 'cat-panchakarma',  slug: 'panchakarma',       name: 'Panchakarma',        nameMl: 'പഞ്ചകർമ്മം',      description: 'The 5 purification procedures — Vamana, Virechana, Basti, Nasya, Raktamokshana.',           icon: 'Droplets',    color: '#06b6d4', sortOrder: 80 },
  { id: 'cat-womens',       slug: 'womens-health',     name: 'Women\'s Health',    nameMl: 'സ്ത്രീ ആരോഗ്യം',   description: 'PCOS, fertility, pregnancy care, menopause — Prasuti Tantra in modern context.',           icon: 'Heart',       color: '#ec4899', sortOrder: 90 },
  { id: 'cat-childrens',    slug: 'childrens-health',  name: 'Children\'s Health', nameMl: 'കുട്ടികളുടെ ആരോഗ്യം', description: 'Kaumarbhritya — paediatric Ayurveda. Suvarna Prashana, growth, immunity, behaviour.',  icon: 'Baby',        color: '#fb923c', sortOrder: 100 },
  { id: 'cat-mental',       slug: 'mental-health',     name: 'Mental Health',      nameMl: 'മാനസിക ആരോഗ്യം',   description: 'Anxiety, depression, insomnia, stress — Manasika chikitsa + Medhya Rasayanas.',             icon: 'Brain',       color: '#a855f7', sortOrder: 110 },
  { id: 'cat-skin',         slug: 'skin-care',         name: 'Skin Care',          nameMl: 'ത്വക് പരിചരണം',   description: 'Eczema, psoriasis, acne — classical Pitta-Rakta correction + topical preparations.',       icon: 'Flower2',     color: '#f43f5e', sortOrder: 120 },
  { id: 'cat-pain',         slug: 'pain-management',   name: 'Pain Management',    nameMl: 'വേദന നിയന്ത്രണം',  description: 'Back pain, sciatica, joint pain, migraine — Vata-pacification + Kerala therapies.',         icon: 'Activity',    color: '#ef4444', sortOrder: 130 },
  { id: 'cat-yoga',         slug: 'yoga-exercise',     name: 'Yoga & Exercise',    nameMl: 'യോഗ + വ്യായാമം',  description: 'Asana, pranayama, vyayama — movement medicine tailored to your dosha.',                   icon: 'PersonStanding', color: '#14b8a6', sortOrder: 140 },
  { id: 'cat-classical',    slug: 'classical-text',    name: 'Classical Texts',    nameMl: 'ക്ലാസിക്കൽ ഗ്രന്ഥങ്ങൾ', description: 'Charaka, Sushruta, Vagbhata, Sahasrayogam — translations + commentary.',           icon: 'BookOpen',    color: '#a16207', sortOrder: 150 },
  { id: 'cat-general',      slug: 'general',           name: 'General',            nameMl: 'പൊതുവായത്',       description: 'Everything else — Ayurveda news, history, lineages, policy.',                              icon: 'Compass',     color: '#6b7280', sortOrder: 200 },
]

export async function seedArticleCategories(prisma: PrismaClient): Promise<{ count: number; backfilled: number }> {
  for (const c of CATS) {
    const { id, ...data } = c
    await prisma.articleCategory.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  // Backfill categoryId on existing KnowledgeArticle rows by matching legacy
  // string category. Maps known legacy strings to the new slugs.
  const map: Record<string, string> = {
    'classical-text':   'cat-classical',
    'research':         'cat-classical',
    'seasonal-health':  'cat-karkidaka',
    'guide':            'cat-general',
    'condition':        'cat-conditions',
    'treatment':        'cat-treatments',
    'location':         'cat-general',
    'heritage':         'cat-classical',
  }
  let backfilled = 0
  for (const [legacy, catId] of Object.entries(map)) {
    const res = await prisma.knowledgeArticle.updateMany({
      where: { category: legacy, categoryId: null },
      data:  { categoryId: catId },
    })
    backfilled += res.count
  }
  // Refresh articleCount denormalised counter
  for (const c of CATS) {
    const count = await prisma.knowledgeArticle.count({ where: { categoryId: c.id } })
    await prisma.articleCategory.update({ where: { id: c.id }, data: { articleCount: count } })
  }
  return { count: CATS.length, backfilled }
}
