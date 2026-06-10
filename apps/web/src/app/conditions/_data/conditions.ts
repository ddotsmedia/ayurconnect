// Editorial content for /conditions/* SEO landing pages.
//
// These are HIGH-INTENT, LOW-COMPETITION long-tail queries (e.g. "ayurvedic
// treatment for PCOS in Kerala"). Each page is a structured Ayurvedic
// overview → classical formulations → lifestyle → recommended specialty
// → CTA to /doctor-match.
//
// Adding a new condition: append an entry below + re-deploy. The dynamic
// route and the sitemap pick it up automatically.

export type ConditionSection = { heading: string; body: string }
export type ClassicalFormulation = { name: string; sanskrit?: string; primaryUse: string; classicalText?: string }

export type Condition = {
  slug: string
  title: string                 // patient-facing display name
  sanskrit?: string             // Ayurvedic terminology
  metaDescription: string       // SEO meta description (max ~155 chars)
  ogSummary: string             // 2-3 sentence summary for OG card
  category: 'metabolic' | 'gyn' | 'musculoskeletal' | 'gi' | 'mental' | 'skin' | 'respiratory'
  doshasInvolved: Array<'vata' | 'pitta' | 'kapha'>
  prevalenceNote?: string       // 1-line stat
  sections: ConditionSection[]  // structured body content
  formulations: ClassicalFormulation[]
  lifestyle: string[]           // bullet recommendations
  recommendedSpecialty: string  // matches Doctor.specialty values
  relatedConditions?: string[]  // slugs
}

export const CONDITIONS: Condition[] = [
  {
    slug: 'pcos',
    title: 'PCOS / PCOD',
    sanskrit: 'Aartava-kshaya · Granthi',
    metaDescription: 'Ayurvedic treatment for PCOS / PCOD in Kerala — classical formulations, Panchakarma protocols, and verified doctors. Evidence-grounded, no quack promises.',
    ogSummary: 'PCOS is rooted in Kapha-Medas dushti with Vata aggravation. Classical Ayurveda treats it through Shodhana (purification) + Shamana (palliation) + Aahar-Vihar correction.',
    category: 'gyn',
    doshasInvolved: ['kapha', 'vata'],
    prevalenceNote: '1 in 5 Indian women of reproductive age (Indian Fertility Society, 2023).',
    sections: [
      {
        heading: 'Ayurvedic understanding',
        body: 'PCOS is described in classical Ayurveda under Aartava-kshaya (diminished menstrual flow) and Granthi (cystic formation). The root cause is dushti of Kapha and Medas (fat metabolism) in the Aartavavaha-srotas (reproductive channels), compounded by Vata aggravation that disrupts the regular Rtu-chakra. Modern symptoms — irregular cycles, hirsutism, weight gain, insulin resistance — map cleanly to this dosha picture.',
      },
      {
        heading: 'Treatment approach',
        body: 'Treatment is typically 3–6 months and proceeds in three phases. First, Shodhana — Virechana (therapeutic purgation) clears Kapha-Pitta from the system. Second, Shamana — herbal formulations (see below) restore Aartava flow and balance insulin signalling. Third, Rasayana — long-term rejuvenation for ovarian health. Diet and lifestyle correction is non-negotiable.',
      },
      {
        heading: 'What modern research says',
        body: 'Multiple RCTs (Choudhary et al. 2019; AYUSH-CCRAS 2022) have shown that Ayurvedic combinations like Shatavari + Ashoka + Triphala reduce LH:FSH ratio and improve menstrual regularity comparable to metformin-based protocols, with significantly fewer side effects.',
      },
    ],
    formulations: [
      { name: 'Kanchanara Guggulu',  sanskrit: 'कांचनार गुग्गुलु', primaryUse: 'Reduces cysts and Kapha-Medas accumulation', classicalText: 'Sharangadhara Samhita' },
      { name: 'Phala Ghrita',        sanskrit: 'फल घृत',           primaryUse: 'Improves ovarian function + fertility',     classicalText: 'Charaka Samhita, Chikitsa 30' },
      { name: 'Shatavari Churna',    sanskrit: 'शतावरी चूर्ण',     primaryUse: 'Rasayana for reproductive system'  },
      { name: 'Ashoka Arishta',      sanskrit: 'अशोकारिष्ट',       primaryUse: 'Regulates menstrual cycle' },
    ],
    lifestyle: [
      'Wake before 6 AM. Vata-aggravating late nights are a major trigger.',
      'Daily 30-min brisk walking or yoga (Surya Namaskara, Bhujangasana, Setubandhasana).',
      'Eat lunch as the main meal (12-2 PM) when Pitta digestion is strongest.',
      'Avoid sour curds, frozen foods, refined sugars — all Kapha-aggravating.',
      'Reduce dairy except buttermilk (taakra) which is Medohara.',
    ],
    recommendedSpecialty: 'prasuti-tantra',
    relatedConditions: ['infertility', 'thyroid'],
  },
  {
    slug: 'arthritis',
    title: 'Arthritis (Osteoarthritis & Rheumatoid)',
    sanskrit: 'Sandhivata · Amavata',
    metaDescription: 'Ayurvedic treatment for arthritis in Kerala — Panchakarma protocols for Sandhivata (OA) and Amavata (RA). Classical formulations, lifestyle, verified specialists.',
    ogSummary: 'Ayurveda distinguishes osteoarthritis (Sandhivata — Vata-driven joint degeneration) from rheumatoid arthritis (Amavata — Ama + Vata in the joints). Treatment differs significantly.',
    category: 'musculoskeletal',
    doshasInvolved: ['vata'],
    prevalenceNote: 'Affects 15% of Indians over 40; Kerala has the highest reported RA prevalence in South India.',
    sections: [
      {
        heading: 'Sandhivata vs Amavata',
        body: 'Sandhivata (osteoarthritis) is Vata-driven cartilage degeneration — pain on movement, stiffness after rest, crepitus. Amavata (rheumatoid arthritis) is fundamentally different: Ama (undigested metabolic toxin) circulates and lodges in joints with Vata, causing the bilateral, symmetric, inflammatory pattern of RA. Mistreating one as the other is common and counterproductive.',
      },
      {
        heading: 'Sandhivata (OA) protocol',
        body: 'Internal Vata-pacifying medications + external Janu Basti, Kati Basti (medicated oil pooled over the joint for 30 minutes). Abhyanga with Mahanarayan or Dhanwantaram Taila daily. Patra Pinda Sweda (medicated leaf bolus fomentation) gives strong relief in flare-ups. Avoid local steroid injection if at all possible — it accelerates underlying Vata vitiation.',
      },
      {
        heading: 'Amavata (RA) protocol',
        body: 'Treatment begins with Ama-pachana (digestion of Ama) using Chitrakadi Vati, Trikatu, dry ginger. Only after Ama is digested do we apply external therapies — sudation, oils. Premature oleation in Amavata worsens the condition; this is the single most common clinical mistake.',
      },
    ],
    formulations: [
      { name: 'Yogaraj Guggulu',     sanskrit: 'योगराज गुग्गुलु',  primaryUse: 'Vata-Kapha hara, joint pain & stiffness',     classicalText: 'Sharangadhara Samhita' },
      { name: 'Simhanada Guggulu',   sanskrit: 'सिंहनाद गुग्गुलु', primaryUse: 'Specifically for Amavata; Ama-pachana + Vata-hara' },
      { name: 'Mahanarayan Taila',   sanskrit: 'महानारायण तैल',    primaryUse: 'External application for Sandhivata' },
      { name: 'Dashamoola Kwatha',   sanskrit: 'दशमूल क्वाथ',     primaryUse: 'Vata-shamana; reduces inflammation systemically' },
    ],
    lifestyle: [
      'Avoid cold, raw, and stale foods — all Vata + Ama generating.',
      'Warm sesame oil self-massage 15 min before bath.',
      'Gentle range-of-motion morning routine; avoid high-impact activity during flares.',
      'Sip warm water with dry ginger throughout the day (Amavata).',
      'Sleep by 10 PM. Late-night vigil aggravates Vata directly.',
    ],
    recommendedSpecialty: 'panchakarma',
    relatedConditions: ['back-pain', 'osteoporosis'],
  },
  {
    slug: 'diabetes',
    title: 'Type 2 Diabetes',
    sanskrit: 'Madhumeha (Vataja Prameha)',
    metaDescription: 'Ayurvedic management of Type 2 diabetes (Madhumeha) in Kerala — classical herbs, dietary correction, Panchakarma. Adjunct to modern care, not a replacement.',
    ogSummary: 'Ayurveda classifies diabetes as one of 20 Prameha conditions, with Madhumeha being the most chronic. Treatment focuses on Medas-correction and Vata-Kapha balance, NOT a substitute for insulin in Type 1 or severe Type 2.',
    category: 'metabolic',
    doshasInvolved: ['kapha', 'vata'],
    prevalenceNote: '11% of Indian adults have diabetes (ICMR-INDIAB 2023); Kerala 19% — highest in India.',
    sections: [
      {
        heading: 'Ayurvedic understanding',
        body: 'Charaka described 20 types of Prameha. Madhumeha (sweet urine) is Vataja Prameha — the most chronic. It begins as Kaphaja Prameha in obese patients (Sthula Pramehi) and over decades becomes Vataja as Dhatu-kshaya (tissue depletion) sets in. This explains why early intervention with weight loss can reverse the disease, but late-stage diabetes is much harder.',
      },
      {
        heading: 'Sthula vs Krisha Pramehi',
        body: 'Treatment differs by build. The Sthula (obese) patient needs Apatarpana (depletion therapy) — herbs that reduce Kapha and Medas. The Krisha (thin) patient — already in late-stage Vataja Prameha — needs Brimhana (nourishing) Rasayana therapy. Giving Apatarpana to a thin diabetic accelerates deterioration.',
      },
      {
        heading: 'Critical safety caveat',
        body: 'Ayurvedic management is ADJUNCT, not replacement, for insulin or oral hypoglycemics in moderate-to-severe diabetes. Sudden stopping of allopathic medication is dangerous. Work with both your physician and Ayurveda doctor to gradually titrate as glycemic control improves.',
      },
    ],
    formulations: [
      { name: 'Vasant Kusumakar Ras', sanskrit: 'वसंत कुसुमाकर रस', primaryUse: 'Reverses Madhumeha; classical Rasaushadhi', classicalText: 'Bhaishajya Ratnavali' },
      { name: 'Chandraprabha Vati',   sanskrit: 'चंद्रप्रभा वटी',  primaryUse: 'Urinary disorders + Prameha' },
      { name: 'Nishamalaki Churna',   sanskrit: 'निशामलकी चूर्ण',   primaryUse: 'Turmeric + Amla; insulin sensitivity' },
      { name: 'Gudmar Powder',        sanskrit: 'गुडमार',           primaryUse: 'Gymnema sylvestre; literally "sugar destroyer" in Sanskrit' },
    ],
    lifestyle: [
      'Walk 4 km daily — minimum. Charaka prescribed daily exertion for Pramehi.',
      'Stop afternoon naps. Daytime sleep is a primary Kaphaja trigger.',
      'Replace rice with millets (kodo, foxtail, ragi) — lower glycemic load.',
      'Fenugreek-soaked water on empty stomach daily.',
      'No sugar in any form. Including fruit juices and dried fruit.',
    ],
    recommendedSpecialty: 'kayachikitsa',
    relatedConditions: ['obesity', 'hypertension'],
  },
  {
    slug: 'back-pain',
    title: 'Chronic Back Pain & Sciatica',
    sanskrit: 'Katigraha · Gridhrasi',
    metaDescription: 'Ayurvedic treatment for chronic back pain and sciatica in Kerala — Kati Basti, Sarvanga Dhara, classical Vata-pacifying formulations. verified Panchakarma specialists.',
    ogSummary: 'Lower back pain (Katigraha) and sciatica (Gridhrasi) are classical Vata disorders. Kerala\'s signature Kati Basti and Pizhichil therapies are widely studied for both.',
    category: 'musculoskeletal',
    doshasInvolved: ['vata'],
    sections: [
      {
        heading: 'Gridhrasi — sciatica',
        body: 'Sushruta described Gridhrasi as pain that starts in the buttock and travels down the back of the leg — a clinical description that maps exactly to L5/S1 sciatic radiculopathy. Two subtypes: Vataja (pure Vata, dry pain) and Vatakaphaja (with stiffness and heaviness). Treatment differs slightly.',
      },
      {
        heading: 'Kerala-specific therapies',
        body: 'Kati Basti — a doughnut-shaped ridge of black gram flour built on the lower back and filled with warm medicated oil for 30 minutes — is the signature local protocol. Pizhichil (continuous warm oil pouring + simultaneous massage) is more intensive, traditionally a 7- or 14-day Royal-Treatment course. Both are well-documented in modern outcome studies.',
      },
    ],
    formulations: [
      { name: 'Yogaraj Guggulu',    sanskrit: 'योगराज गुग्गुलु', primaryUse: 'Internal Vata-pacification + joint health' },
      { name: 'Mahanarayan Taila',  sanskrit: 'महानारायण तैल',  primaryUse: 'External application; daily Abhyanga' },
      { name: 'Dhanwantaram Taila', sanskrit: 'धन्वंतरम तैल',   primaryUse: 'Specifically Vata-disorders below the waist' },
    ],
    lifestyle: [
      'Sleep on a firm mattress with knees slightly elevated.',
      'Daily warm sesame oil self-Abhyanga on the lower back.',
      'No prolonged sitting beyond 45 minutes without standing.',
      'Avoid lifting weight with a twisted spine — Charaka explicitly warned about this.',
      'Bhujangasana, Shalabhasana, Setubandhasana — gentle backstrengthening yoga.',
    ],
    recommendedSpecialty: 'panchakarma',
    relatedConditions: ['arthritis'],
  },
  {
    slug: 'ibs',
    title: 'IBS / Chronic Indigestion',
    sanskrit: 'Grahani · Agnimandya',
    metaDescription: 'Ayurvedic treatment for IBS and chronic indigestion (Grahani) in Kerala. Restore Agni, balance Vata-Pitta, classical formulations + dietary correction.',
    ogSummary: 'IBS in Ayurvedic terms is Grahani-roga — disturbance of the duodenal-jejunal Agni (digestive fire). It is the most common chronic GI presentation in clinical Ayurveda.',
    category: 'gi',
    doshasInvolved: ['vata', 'pitta'],
    sections: [
      {
        heading: 'Grahani — the small intestine',
        body: 'Grahani is the duodenum-jejunum, the seat of digestive Agni in Ayurveda. When Agni is weak (Mandagni) or irregular (Vishamagni), food does not get properly transformed and Ama is generated. The symptoms — alternating diarrhea and constipation, bloating, post-meal urgency, fatigue — match IBS-M almost exactly.',
      },
      {
        heading: 'Subtype-specific treatment',
        body: 'IBS-D (Pittaja Grahani): cooling formulations, kutaja-based herbs. IBS-C (Vataja Grahani): warming, oleating, gentle laxatives — never harsh Virechana. IBS-M (mixed): Agni-restoration first, then symptom management. Generic "IBS herbs" miss this distinction.',
      },
    ],
    formulations: [
      { name: 'Kutaja Ghana Vati',  sanskrit: 'कुटज घनवटी',     primaryUse: 'Pittaja Grahani; IBS-D' },
      { name: 'Hingvashtaka Churna', sanskrit: 'हिंग्वाष्टक चूर्ण', primaryUse: 'Vataja Grahani; gas, bloating, IBS-C' },
      { name: 'Bilva Avaleha',      sanskrit: 'बिल्व अवलेह',     primaryUse: 'Bael-fruit lehyam; chronic loose stool' },
      { name: 'Trikatu Churna',     sanskrit: 'त्रिकटु',         primaryUse: 'Agni-deepana — restores digestive fire' },
    ],
    lifestyle: [
      'Eat at fixed times. Vishamagni feeds on irregular meal timing.',
      'Sip warm water through the day, never iced.',
      'Chew thoroughly — Charaka prescribed 32 chews per mouthful.',
      'No fruit + meal combinations — viruddha-aahara aggravates Ama.',
      'Stress management is non-negotiable; the Vata gut-brain axis is real.',
    ],
    recommendedSpecialty: 'kayachikitsa',
  },
  {
    slug: 'anxiety',
    title: 'Anxiety & Insomnia',
    sanskrit: 'Chittodvega · Anidra',
    metaDescription: 'Ayurvedic treatment for anxiety and chronic insomnia in Kerala. Vata-pacifying Rasayanas — Brahmi, Ashwagandha, Jatamansi. Classical formulations + lifestyle medicine.',
    ogSummary: 'Anxiety (Chittodvega) and insomnia (Anidra) are Vataja Manasika disorders. Ayurveda has a richly developed mental-health pharmacopoeia centered on Medhya Rasayanas — cognitive nourishers.',
    category: 'mental',
    doshasInvolved: ['vata'],
    prevalenceNote: 'WHO estimates 50M Indians have anxiety disorders; less than 10% receive treatment.',
    sections: [
      {
        heading: 'Mental health in classical Ayurveda',
        body: 'Charaka described Chittodvega — restless mind — as a Vata vitiation of Manas (mind). The treatment uses Medhya Rasayanas, a class of herbs that specifically nourish cognition and emotional regulation. Modern pharmacology has validated this category: Brahmi (Bacopa) is a GABA-A modulator; Ashwagandha (Withania) lowers cortisol; Jatamansi (Nardostachys) has serotonin-affinity studies.',
      },
      {
        heading: 'Shirodhara — Kerala\'s signature anti-anxiety therapy',
        body: 'A continuous stream of warm medicated oil dripped onto the forehead for 30-45 minutes. Multiple Indian and international studies have shown reduction in serum cortisol and improvement in Hamilton Anxiety Scale scores after a 7-14 day course. It is the single most evidence-grounded mental-health intervention in classical Ayurveda.',
      },
    ],
    formulations: [
      { name: 'Brahmi Ghrita',         sanskrit: 'ब्राह्मी घृत',          primaryUse: 'Medhya Rasayana; cognitive + mood' },
      { name: 'Ashwagandha Churna',    sanskrit: 'अश्वगंधा चूर्ण',        primaryUse: 'Adaptogen; cortisol regulation' },
      { name: 'Jatamansi Churna',      sanskrit: 'जटामांसी',             primaryUse: 'Sedative + anxiolytic' },
      { name: 'Saraswatarishta',       sanskrit: 'सारस्वतारिष्ट',         primaryUse: 'Memory + mood; classical liquid formulation' },
    ],
    lifestyle: [
      'Fixed sleep / wake times — even on weekends. Vata thrives on routine.',
      'Daily 10-min Anuloma-Viloma (alternate-nostril pranayama).',
      'Warm milk with a pinch of nutmeg + saffron before bed.',
      'No screens for 1 hour before sleep — blue light is Vata-aggravating.',
      'Sesame-oil scalp massage 2× per week before bath.',
    ],
    recommendedSpecialty: 'manasika',
  },
  {
    slug: 'psoriasis',
    title: 'Psoriasis & Eczema',
    sanskrit: 'Kushta (Ekakushta · Sidhma · Kitibha)',
    metaDescription: 'Ayurvedic treatment for psoriasis and chronic eczema in Kerala. Panchakarma + classical Kushta-hara formulations. Long but durable management.',
    ogSummary: 'Chronic skin disorders are categorized under Kushta in Ayurveda. Treatment is long (3-6 months minimum) but often achieves durable remission where conventional treatment manages flares.',
    category: 'skin',
    doshasInvolved: ['kapha', 'pitta', 'vata'],
    sections: [
      {
        heading: '18 types of Kushta',
        body: 'Sushruta enumerated 18 varieties of Kushta. The relevant ones for modern psoriasis are Ekakushta (single large patch type, plaque psoriasis), Sidhma (scaly thin patches, guttate psoriasis), and Kitibha (thick rough patches, chronic plaque). Eczema maps to Vicharchika. Each subtype has slightly different protocols.',
      },
      {
        heading: 'Treatment approach',
        body: 'Treatment always begins with deep Shodhana — Vamana (therapeutic emesis) for Kapha-dominant types, Virechana for Pitta-dominant. Then external — Takra Dhara (medicated buttermilk pouring on the scalp for scalp psoriasis), Lepa (medicated paste), Snana with Triphala-decoction water. Internal Rasayanas for 3-6 months.',
      },
    ],
    formulations: [
      { name: 'Manjishtadi Kwatha',   sanskrit: 'मञ्जिष्ठादि क्वाथ', primaryUse: 'Blood purifier; Kushta-hara' },
      { name: 'Mahatiktaka Ghrita',   sanskrit: 'महातिक्तक घृत',     primaryUse: 'Internal; rakta-shodhaka',  classicalText: 'Ashtanga Hridayam' },
      { name: 'Khadirarishta',        sanskrit: 'खदिरारिष्ट',         primaryUse: 'Tannin-rich; chronic skin' },
      { name: 'Triphala Churna',      sanskrit: 'त्रिफला चूर्ण',      primaryUse: 'Daily detoxification' },
    ],
    lifestyle: [
      'No incompatible food combinations (viruddha-aahara) — fish + milk, sour + milk.',
      'Avoid heating + sour foods during active flares.',
      'Daily 2L+ warm water intake.',
      'Sun exposure 15-20 min in morning sunlight; avoid midday Pitta-aggravating sun.',
      'Stress management — Kushta has a strong psychosomatic component classically recognized.',
    ],
    recommendedSpecialty: 'kayachikitsa',
  },
  {
    slug: 'migraine',
    title: 'Migraine & Chronic Headache',
    sanskrit: 'Ardhavabhedaka · Suryavarta',
    metaDescription: 'Ayurvedic treatment for migraine in Kerala. Nasya, Shirodhara, classical Vata-Pitta formulations. Sustained prophylaxis, not just symptom relief.',
    ogSummary: 'Ayurveda distinguishes Ardhavabhedaka (one-sided headache, classic migraine) from Suryavarta (worsens with sun, peaks midday, cluster-headache pattern). Nasya is the signature procedure for both.',
    category: 'mental',
    doshasInvolved: ['vata', 'pitta'],
    prevalenceNote: '~15% of Indian adults have recurrent migraine; women 3× more affected.',
    sections: [
      {
        heading: 'Ardhavabhedaka — Ayurveda\'s migraine',
        body: 'Half-skull splitting pain, episodic, often with nausea and aura — Vagbhata\'s description in Ashtanga Hridayam matches modern migraine criteria precisely. It is a Vata-Pitta disorder; pure Vata migraines are dry and movement-triggered, Vata-Pitta migraines are throbbing and light-sensitive.',
      },
      {
        heading: 'Nasya Karma',
        body: 'Medicated oil dropped into the nostrils — the signature Ayurvedic treatment for head-area disorders. Shadbindu Taila or Anu Taila are most commonly used. A 7-day course typically reduces frequency for 6-12 months in cooperative patients. Modern trials at JIPMER and CCRAS-AIIA have shown 50-70% reduction in monthly migraine days.',
      },
    ],
    formulations: [
      { name: 'Shadbindu Taila',     sanskrit: 'षड्बिन्दु तैल',     primaryUse: 'Nasya for chronic Shirashula',   classicalText: 'Bhaishajya Ratnavali' },
      { name: 'Pathyadi Kwatha',     sanskrit: 'पथ्यादि क्वाथ',     primaryUse: 'Internal; Vata-Pitta headache' },
      { name: 'Saraswatarishta',     sanskrit: 'सारस्वतारिष्ट',     primaryUse: 'Mental stress component' },
      { name: 'Godanti Bhasma',      sanskrit: 'गोदंती भस्म',       primaryUse: 'Acute pain relief' },
    ],
    lifestyle: [
      'Sleep + wake at fixed times. Migraines feed on circadian disruption.',
      'Identify and rigorously avoid your trigger foods (commonly: aged cheese, red wine, chocolate, MSG).',
      'No skipping meals — Vataja migraines respond directly to hunger.',
      'Daily 10-min Brahmari pranayama (humming-bee breath).',
      'Avoid harsh sunlight + loud noise during prodrome.',
    ],
    recommendedSpecialty: 'manasika',
  },
  // ─── 2026-06-09 expansion — 8 high-traffic conditions ─────────────────
  {
    slug: 'weight-loss',
    title: 'Weight Loss & Obesity',
    sanskrit: 'Sthaulya · Medo-roga · സ്ഥൗല്യം',
    metaDescription: 'Ayurvedic treatment for weight loss in Kerala — Udvartana, Panchakarma, dosha-specific diet, classical Medo-hara formulations. Sustainable, no crash protocols.',
    ogSummary: 'Sthaulya (obesity) is Kapha-Medas dushti. Ayurveda corrects it via Lekhana (scraping) Panchakarma, Udvartana powder massage, dosha-specific Kapha-pacifying diet, and graded movement.',
    category: 'metabolic',
    doshasInvolved: ['kapha'],
    prevalenceNote: 'Kerala adult overweight + obesity prevalence ~30% (NFHS-5, 2021).',
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Classical texts describe Sthaulya as accumulation of meda-dhatu (fat tissue) due to Kapha aggravation, weak Agni (digestive fire), and sedentary lifestyle. Charaka Samhita lists 8 Nindita Purusha (the obese being one of the 8 unhealthy types) and outlines specific risks: shortened lifespan, diabetes, joint disease, fatigue. The Kerala approach combines internal Lekhana herbs with external Udvartana (medicated powder massage) and graded Vyayama (exercise).' },
      { heading: 'Kerala treatments', body: 'Udvartana (Kolakulathadi Choornam massage) is the signature Kerala Lekhana therapy — daily for 14–21 days, mobilises subcutaneous fat. Combined with Virechana Panchakarma to clear Kapha-Medas, dosha-typed diet, and progressive Yoga. Weight loss is gradual (2–4 kg/month) but sustained, with measurable improvement in lipid profile + insulin sensitivity.' },
    ],
    formulations: [
      { name: 'Triphala Guggulu',       sanskrit: 'त्रिफला गुग्गुलु',  primaryUse: 'Medo-hara, lipid-lowering', classicalText: 'Bhaishajya Ratnavali' },
      { name: 'Medohar Vati',           sanskrit: 'मेदोहर वटी',          primaryUse: 'Kapha-Medas reduction' },
      { name: 'Varanadi Kashayam',      sanskrit: 'वारणादि क्वाथ',       primaryUse: 'Internal Lekhana', classicalText: 'Sahasrayogam' },
      { name: 'Kolakulathadi Choornam', sanskrit: 'कोलकुलत्थादि चूर्ण',  primaryUse: 'External Udvartana powder' },
    ],
    lifestyle: ['Wake before sunrise; 30-min brisk walk + 20-min sun salutations daily.', 'Largest meal at noon (Agni peak); light early dinner.', 'Eliminate refined sugar, white rice, deep-fried foods, dairy after dusk.', 'Favor Kapha-pacifying: hot, dry, light, spiced (turmeric, ginger, black pepper, fenugreek).', 'Triphala 1 tsp with warm water at bedtime.'],
    recommendedSpecialty: 'kayachikitsa',
    relatedConditions: ['diabetes', 'thyroid'],
  },
  {
    slug: 'thyroid',
    title: 'Thyroid Disorders (Hypo/Hyper)',
    sanskrit: 'Galaganda · ഗളഗണ്ഡം · തൈറോയ്ഡ്',
    metaDescription: 'Ayurvedic treatment for thyroid disorders — Kanchanara Guggulu, Varunadi, Kerala Nasya + classical protocols for hypothyroidism + hyperthyroidism. Verified Kerala doctors.',
    ogSummary: 'Galaganda (thyroid disorder) maps to Kapha-Medas dushti for hypothyroidism, Pitta excess for hyperthyroidism. Ayurveda complements modern thyroxine therapy without replacing it.',
    category: 'metabolic',
    doshasInvolved: ['kapha', 'pitta'],
    prevalenceNote: 'Hypothyroidism prevalence ~10% in Indian adults; higher in women (Ministry of Health, 2022).',
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Galaganda (literally "neck swelling") is classified as Kaphaja, Pittaja or Vataja depending on dosha predominance. Hypothyroidism (low metabolism, weight gain, cold intolerance) is Kapha-Medas dushti; hyperthyroidism (heat intolerance, weight loss, palpitations, anxiety) is Pitta aggravation. Modern thyroxine + Kanchanara Guggulu work synergistically — DO NOT stop prescribed thyroxine.' },
      { heading: 'Kerala treatments', body: 'Kanchanara Guggulu is the signature herbal formulation (kanchanara bark + triphala + trikatu + guggulu — synergistic action on thyroid + glandular tissue). Combined with Nasya (medicated nasal drops — Anu Taila), Shirodhara for stress component, dosha-typed diet. Monthly TSH monitoring is essential; tablet dose may need physician adjustment as Ayurveda support kicks in.' },
    ],
    formulations: [
      { name: 'Kanchanara Guggulu',     sanskrit: 'कंचनार गुग्गुलु',     primaryUse: 'Thyroid + lymphatic support',  classicalText: 'Sharangadhara Samhita' },
      { name: 'Varunadi Kashayam',      sanskrit: 'वारणादि क्वाथ',       primaryUse: 'Kapha + Medas dushti' },
      { name: 'Brahmi Ghrita',          sanskrit: 'ब्राह्मी घृत',          primaryUse: 'Mental fog component' },
      { name: 'Triphala',               sanskrit: 'त्रिफला',              primaryUse: 'Daily detox + Agni support' },
    ],
    lifestyle: ['Triphala-Triphala combination: avoid soy, raw cruciferous (cabbage, broccoli) in excess — they can interfere with thyroid hormone absorption.', 'Iodine-rich diet from sea-vegetables, rock salt (sendha namak).', 'Walking 30 min daily, gentle yoga (Sarvangasana with physician approval, Matsyasana, Halasana).', 'Stress management — Shirodhara monthly if accessible.', 'Continue your prescribed thyroxine; check with your doctor before any Ayurvedic combination — Ashwagandha can stimulate thyroid output.'],
    recommendedSpecialty: 'kayachikitsa',
    relatedConditions: ['weight-loss', 'anxiety'],
  },
  {
    slug: 'hair-fall',
    title: 'Hair Fall & Premature Greying',
    sanskrit: 'Khalitya · Palitya · ഖാലിത്യം · മുടികൊഴിച്ചിൽ',
    metaDescription: 'Ayurvedic treatment for hair fall in Kerala — Neelibhringadi, Brahmi-Amla oils, Shiroabhyanga, Nasya. Verified Kerala doctors. Sustainable scalp + hair-root recovery.',
    ogSummary: 'Khalitya (hair fall) is Pitta-Vata-Kapha imbalance affecting Bhrajaka Pitta. Kerala\'s Neelibhringadi Tailam + Shiroabhyanga + Nasya is the classical 3-pillar protocol.',
    category: 'skin',
    doshasInvolved: ['pitta', 'vata'],
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Khalitya is described as scalp Bhrajaka Pitta vitiation combined with Rakta dushti. Hair (Kesha) is an upadhatu (sub-tissue) of Asthi (bones); poor Asthi-poshana shows up as weak hair roots. The Kerala tradition treats hair fall topically (medicated oils) + systemically (Rasayana herbs like Bhringaraja, Amalaki).' },
      { heading: 'Kerala treatments', body: 'Neelibhringadi Tailam is the signature hair oil — daily Shiroabhyanga (scalp massage) for 21+ days. Nasya (medicated nasal drops, Anu Taila) targets the head region through the nasal channels — clinically effective for chronic Khalitya. Combined with Amalaki Rasayana (1 tsp daily), warm-oil head bath weekly.' },
    ],
    formulations: [
      { name: 'Neelibhringadi Tailam',  sanskrit: 'नीलीभृंगादि तैल',     primaryUse: 'Scalp + root strengthening',   classicalText: 'Sahasrayogam' },
      { name: 'Brahmi Amla Tailam',     sanskrit: 'ब्राह्मी आमला तैल',   primaryUse: 'Cooling Pitta-Vata hair oil' },
      { name: 'Triphala Choornam',      sanskrit: 'त्रिफला चूर्ण',        primaryUse: 'Internal Pitta-Rakta cleanse' },
      { name: 'Chyavanaprasha',         sanskrit: 'च्यवनप्राश',           primaryUse: 'Rasayana — bone + hair tonic' },
    ],
    lifestyle: ['Shiroabhyanga with Neelibhringadi Tailam 30 min before bath, 3× weekly minimum.', 'Avoid hot water on scalp — lukewarm only.', 'Eliminate excessive Pitta foods (sour pickles, vinegar, excess coffee, alcohol).', 'Sleep 7–8h; hair grows during deep sleep.', 'Reduce smartphone scrolling in bed — circadian disruption depresses hair-root metabolism.'],
    recommendedSpecialty: 'shalakya',
  },
  {
    slug: 'insomnia',
    title: 'Insomnia & Sleep Disorders',
    sanskrit: 'Anidra · Nidra-nasha · ഉറക്കമില്ലായ്മ',
    metaDescription: 'Ayurvedic treatment for insomnia in Kerala — Shirodhara, Brahmi Ghrita, Tagara, Jatamansi. Drug-free sustainable sleep restoration.',
    ogSummary: 'Anidra is primarily a Vata-disturbance of Manas. Kerala\'s Shirodhara + Medhya Rasayana herbs (Brahmi, Jatamansi, Tagara) restore Nidra without sleeping-pill dependence.',
    category: 'mental',
    doshasInvolved: ['vata', 'pitta'],
    prevalenceNote: 'Adult insomnia prevalence ~30% in Indian metros; under-reported (AIIMS Sleep Lab, 2022).',
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Sleep (Nidra) is one of the three Upastambha (sub-pillars) of life alongside Aahar (food) and Brahmacharya (vital energy). Anidra (insomnia) arises from Vata aggravation in Manas (mind), Pitta excess (irritability + early waking), or Kapha deficiency (low Tama-guna for sleep induction). Modern stress, screen exposure, irregular meals, and caffeine after noon are the most common contributors.' },
      { heading: 'Kerala treatments', body: 'Shirodhara — continuous warm-oil stream on forehead — is the signature Kerala therapy for insomnia. 7–14 daily sessions produce measurable EEG changes (increased alpha waves, reduced cortisol). Combined with Brahmi Ghrita (1 tsp at bedtime), Jatamansi + Tagara herb tea, and rigorous sleep hygiene. Avoid benzodiazepine dependence — Shirodhara works long-term.' },
    ],
    formulations: [
      { name: 'Brahmi Ghrita',          sanskrit: 'ब्राह्मी घृत',           primaryUse: 'Bedtime Medhya Rasayana',    classicalText: 'Charaka Samhita' },
      { name: 'Jatamansi Choornam',     sanskrit: 'जटामांसी चूर्ण',         primaryUse: 'Anxiolytic sleep induction' },
      { name: 'Tagara',                 sanskrit: 'तगर',                     primaryUse: 'Indian Valerian for deep sleep' },
      { name: 'Saraswatarishta',        sanskrit: 'सारस्वतारिष्ट',          primaryUse: 'Anxiety + insomnia combination' },
    ],
    lifestyle: ['No screens (phone, TV, laptop) 60 min before sleep.', 'No caffeine after 2pm; switch evening tea to chamomile or tulsi.', 'Pada Abhyanga (foot massage with Brahmi or sesame oil) for 10 min before bed.', 'Sleep + wake at fixed times — Vata thrives on routine.', 'Cool, dark, screen-free bedroom. Bedroom for sleep + intimacy only.'],
    recommendedSpecialty: 'manasika',
    relatedConditions: ['anxiety'],
  },
  {
    slug: 'skin-diseases',
    title: 'Chronic Skin Diseases (Twak Roga)',
    sanskrit: 'Twak Roga · Kushta · ത്വക് രോഗം',
    metaDescription: 'Ayurvedic treatment for chronic skin disease — eczema, dermatitis, allergic skin — Kerala Panchakarma, Rakta-Mokshana, Aragvadhadi Kashayam. Sustainable Pitta-Rakta correction.',
    ogSummary: 'Most chronic skin disease is Pitta-Rakta dushti. Kerala\'s classical 3-tier protocol — Rakta-Mokshana (blood-letting) where appropriate + internal Aragvadhadi + topical medicated oils — resolves what topical steroids only mask.',
    category: 'skin',
    doshasInvolved: ['pitta', 'kapha'],
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Classical Ayurveda groups chronic skin disease under Kushta (18 types described in Charaka). Twak (skin) is an extension of Rakta-dhatu — what appears on skin reflects blood-tissue impurity. Pitta excess + Rakta dushti drive most modern eczema, allergic dermatitis, fungal infections. Topical steroids suppress but never resolve — that\'s why recurrence is the norm. Ayurvedic Shodhana addresses root cause.' },
      { heading: 'Kerala treatments', body: 'Virechana (medicated purgation) is the primary Kerala protocol for chronic skin — clears Pitta + Rakta dushti from the gut + blood. Combined with Raktamokshana (controlled venesection) where appropriate, internal Aragvadhadi or Patolakaturohinyadi Kashayam, and topical Karpooradi or Eladi Tailam.' },
    ],
    formulations: [
      { name: 'Aragvadhadi Kashayam',   sanskrit: 'आरग्वधादि क्वाथ',      primaryUse: 'Pitta-Rakta cleanse',     classicalText: 'Sahasrayogam' },
      { name: 'Mahatiktaka Ghrita',     sanskrit: 'महातिक्तक घृत',         primaryUse: 'Internal Pitta-Rakta correction' },
      { name: 'Khadirarishta',          sanskrit: 'खदिरारिष्ट',            primaryUse: 'Skin Rasayana — Kushta-hara' },
      { name: 'Eladi Tailam',           sanskrit: 'एलादि तैल',             primaryUse: 'Topical for chronic eczema' },
    ],
    lifestyle: ['Eliminate ALL Viruddha Aahara (incompatible foods): fish + milk, hot + cold combinations, fermented + raw.', 'No excessive sour (curd, vinegar, pickles), salty (papad, namkeen) for 60 days.', 'Cotton clothes only; avoid synthetic in summer.', 'Triphala 1 tsp warm water nightly for bowel regularity (constipation worsens skin disease).', 'Ghrita Pana (medicated ghee) under physician supervision before Virechana.'],
    recommendedSpecialty: 'kayachikitsa',
    relatedConditions: ['psoriasis'],
  },
  {
    slug: 'fatty-liver',
    title: 'Fatty Liver Disease (NAFLD)',
    sanskrit: 'Yakrit-vikara · Medo-roga · ഫാറ്റി ലിവർ',
    metaDescription: 'Ayurvedic treatment for fatty liver — Arogyavardhini Vati, Punarnava, Bhumi Amalaki. Reverses NAFLD with diet + Kapha-Medas-hara classical formulations.',
    ogSummary: 'NAFLD is Kapha-Medas dushti localised to Yakrit (liver). Ayurveda reverses it through Lekhana herbs, dosha-typed diet, and gentle Virechana — long before allopathic medicine has any disease-modifying therapy.',
    category: 'metabolic',
    doshasInvolved: ['kapha', 'pitta'],
    prevalenceNote: 'NAFLD prevalence ~30% in urban Indian adults (Indian Society of Gastroenterology, 2023).',
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Fatty liver is Yakrit-vikara — disordered fat metabolism centred on the liver. Allopathic medicine has no approved disease-modifying drug for NAFLD as of 2026 — diet + exercise are the only recommendations. Ayurveda has a 2000-year track record on Yakrit-vikara: classical Lekhana (scraping) herbs reduce hepatic fat measurably (USG reversal commonly seen in 90–180 days).' },
      { heading: 'Kerala treatments', body: 'Arogyavardhini Vati is the cornerstone — daily for 90 days with serial LFT + USG monitoring. Punarnavadi Kashayam adds diuretic + hepatoprotective action. Bhumi Amalaki (chanca piedra) is potent for elevated transaminases. Lifestyle is mandatory — no medicine works without diet correction.' },
    ],
    formulations: [
      { name: 'Arogyavardhini Vati',    sanskrit: 'आरोग्यवर्धिनी वटी',     primaryUse: 'Yakrit Lekhana + Pitta correction', classicalText: 'Rasaratna Samuccaya' },
      { name: 'Punarnavadi Kashayam',   sanskrit: 'पुनर्नवादि क्वाथ',      primaryUse: 'Hepatoprotection + diuretic' },
      { name: 'Bhumi Amalaki',          sanskrit: 'भूम्यामलकी',             primaryUse: 'Elevated SGOT/SGPT' },
      { name: 'Triphala',               sanskrit: 'त्रिफला',                primaryUse: 'Bowel regularity + Agni' },
    ],
    lifestyle: ['Eliminate fructose: no fruit juice, packaged drinks, processed sugar. Whole fruit (2–3 servings) is fine.', 'No alcohol — even social. Alcohol-induced fatty liver and NAFLD compound rapidly.', '30-min brisk walk daily + 2× weekly strength training.', 'Largest meal at noon; light dinner before sunset.', 'Annual LFT + abdominal USG to track reversal — Ayurveda works measurably here.'],
    recommendedSpecialty: 'kayachikitsa',
    relatedConditions: ['diabetes', 'weight-loss'],
  },
  {
    slug: 'infertility',
    title: 'Infertility (Vandhyatva)',
    sanskrit: 'Vandhyatva · Beeja-dushti · വന്ധ്യത',
    metaDescription: 'Ayurvedic treatment for infertility — Kerala Uttara Basti, Phala Ghrita, Shatavari Kalpa. Beeja-Kshetra correction for both partners. Sustainable conception support.',
    ogSummary: 'Vandhyatva (infertility) is treated through Beeja (gametes) + Kshetra (uterine bed) correction in both partners. Kerala\'s Uttara Basti + Phala Ghrita + Shatavari is the classical 3-pillar fertility protocol.',
    category: 'gyn',
    doshasInvolved: ['vata', 'pitta'],
    prevalenceNote: 'India infertility prevalence ~15% (Indian Society of Assisted Reproduction, 2023).',
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Classical Ayurveda recognises 4 factors for conception: Rtu (right time in cycle), Kshetra (healthy uterine bed), Ambu (nutrition), Beeja (healthy gametes). Vandhyatva can arise from any of the 4 — male factor (Shukra-kshaya), female factor (Aartava + Kshetra issues), combined, or unexplained. Ayurveda always treats both partners.' },
      { heading: 'Kerala treatments', body: 'Uttara Basti (medicated uterine douche) is the Kerala signature for tubal-factor infertility — performed cycle-day 5–9 by a trained Vaidya. Phala Ghrita (medicated ghee) for 3 cycles taken in Anupana with warm milk supports both Shukra + Aartava. Shatavari Kalpa daily for ovarian reserve. For male factor — Ashwagandha + Vidari + Shudha Shilajit.' },
    ],
    formulations: [
      { name: 'Phala Ghrita',           sanskrit: 'फल घृत',                primaryUse: 'Fertility ghee for both partners', classicalText: 'Charaka Samhita' },
      { name: 'Shatavari Kalpa',        sanskrit: 'शतावरी कल्प',           primaryUse: 'Female reproductive Rasayana' },
      { name: 'Ashwagandha Choornam',   sanskrit: 'अश्वगंधा चूर्ण',         primaryUse: 'Male Shukra Rasayana' },
      { name: 'Shudha Shilajit',        sanskrit: 'शुद्ध शिलाजित',         primaryUse: 'Male fertility + libido' },
    ],
    lifestyle: ['Both partners — eliminate smoking + alcohol for minimum 90 days before trying.', 'Daily Abhyanga with sesame oil for the trying-to-conceive female partner.', 'No excessive heat (saunas, tight clothing) for male partner — affects Shukra.', 'Ovulation tracking + intercourse timing.', 'See a verified Vaidya AND a reproductive medicine specialist together — Ayurveda complements IVF beautifully.'],
    recommendedSpecialty: 'prasuti-tantra',
    relatedConditions: ['pcos', 'thyroid'],
  },
  {
    slug: 'asthma',
    title: 'Asthma (Tamaka Shwasa)',
    sanskrit: 'Tamaka Shwasa · Hikka-Shwasa · ആസ്ത്മ',
    metaDescription: 'Ayurvedic treatment for asthma — Vasarishta, Kanakasava, Sitopaladi Choornam. Kapha-Vata correction reducing inhaler dependence (with physician supervision).',
    ogSummary: 'Tamaka Shwasa (bronchial asthma) is Kapha excess + Vata aggravation in Pranavaha Srotas. Ayurveda reduces frequency + severity of attacks; never replace your prescribed inhaler without your pulmonologist\'s approval.',
    category: 'respiratory',
    doshasInvolved: ['kapha', 'vata'],
    sections: [
      { heading: 'Ayurvedic understanding', body: 'Charaka describes 5 types of Shwasa (dyspnoea) — Tamaka Shwasa corresponds to modern bronchial asthma. Etiology: Kapha-Medas dushti combined with Vata Pranavaha-srotas vitiation. Triggers: cold + damp climate, Kapha-heavy diet, allergens, stress. Ayurveda treats the predisposition (Prakriti correction) rather than only the acute attack.' },
      { heading: 'Kerala treatments', body: 'Vasarishta is the classical Tamaka Shwasa formulation — taken twice daily, reduces attack frequency over 3–6 months. Sitopaladi Choornam with honey for productive cough. Vamana Panchakarma (controlled emesis under physician supervision) clears excess Kapha and is the most disease-modifying intervention available. Inhalers must continue.' },
    ],
    formulations: [
      { name: 'Vasarishta',             sanskrit: 'वासारिष्ट',              primaryUse: 'Daily Shwasa-hara',          classicalText: 'Bhaishajya Ratnavali' },
      { name: 'Kanakasava',             sanskrit: 'कनकासव',                primaryUse: 'Severe bronchospasm' },
      { name: 'Sitopaladi Choornam',    sanskrit: 'सितोपलादि चूर्ण',        primaryUse: 'Cough + bronchial congestion' },
      { name: 'Pippali Rasayana',       sanskrit: 'पिप्पली रसायन',          primaryUse: 'Long-term Vata-Kapha Rasayana' },
    ],
    lifestyle: ['Continue your prescribed inhaler — Ayurveda complements, never replaces.', 'Eliminate Kapha aggravators: dairy after evening, cold/iced drinks, deep-fried food.', 'Steam inhalation with Tulsi + Pudina at first sign of congestion.', 'Daily Pranayama: Anuloma-Viloma + Bhastrika (only outside attack), starting from 5 min.', 'Avoid dust, smoke, AC drafts. Use HEPA filter if possible.'],
    recommendedSpecialty: 'kayachikitsa',
  },
]

export function getCondition(slug: string): Condition | null {
  return CONDITIONS.find((c) => c.slug === slug) ?? null
}
