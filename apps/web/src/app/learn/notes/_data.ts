import type { BamsYear } from '../_subjects'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Note = {
  slug: string
  title: string
  titleMl?: string
  subjectSlug: string
  year: BamsYear
  difficulty: Difficulty
  readTimeMinutes: number
  summary: string
  keyPoints: string[]
  references: string[]
  tags: string[]
  content: string
}

export const NOTES: Note[] = [
  // ── 1st Year ──────────────────────────────────────────────
  {
    slug: 'dravya-concept-of-substance',
    title: 'Dravya — The Concept of Substance in Ayurveda',
    subjectSlug: 'padartha-vigyana',
    year: '1st_year',
    difficulty: 'beginner',
    readTimeMinutes: 6,
    summary: 'Dravya is the foundational ontological category in Ayurveda — the substrate of all matter, action, and quality. Understanding dravya is prerequisite to understanding pharmacology.',
    keyPoints: [
      'Dravya is samavayi karanam (inherent cause) of guna and karma',
      'Charaka defines 5 categories: nava karana dravya; Vaisheshika defines 9',
      'Panchabhautika composition: every dravya = pancha mahabhuta + Atma',
      'Classification: chetana (sentient) vs achetana; aushadha vs ahara vs vihara',
      'Karma of dravya is determined by its panchabhautika dominance',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 1/48',
      'Sushruta Samhita, Sutra Sthana 40',
      'Vaisheshika Darshana, Padartha 1',
    ],
    tags: ['padartha', 'dravya', 'philosophy', 'fundamentals'],
    content: `## Definition

**Dravya** (द्रव्य) is one of the six padartha — the irreducible ontological categories that Ayurveda inherits from Vaisheshika philosophy. The word literally means "that in which guna (qualities) and karma (actions) inhere."

> *Dravyam guna karma samavayi karanam* — Charaka Sutra 1/48

In Charakian terms, dravya is the *samavayi karanam* (inherent material cause) of guna (qualities) and karma (actions). Without dravya, neither guna nor karma can manifest. This makes dravya the most fundamental category in Ayurvedic pharmacology.

## Why Dravya Matters for the BAMS Student

Every aushadha (medicine) is a dravya. Every food substance is a dravya. Every doshic disturbance acts upon dravyas in the body. The entire system of Ayurvedic pharmacology — Rasa, Guna, Veerya, Vipaka, Prabhava — is the system of classifying and predicting dravya behavior.

## Classification

### By Charaka — 5 categories (Nava Karana Dravya)

1. **Pancha Mahabhuta** — Akasha, Vayu, Tejas, Jala, Prithvi
2. **Atma** — the soul-substance
3. **Manas** — the mind-substance
4. **Kala** — time as substrate
5. **Dik** — directional substrate

### By Vaisheshika — 9 dravyas

Vaisheshika adds *Prithvi, Apa, Tejas, Vayu, Akasha, Kala, Dik, Atma, Manas* as the nine fundamental substances. Charaka's five-fold breakdown is essentially a regrouping of these.

### Practical Pharmacological Classification

- **Chetana dravya** — sentient substances (animal sources, the doctor herself)
- **Achetana dravya** — non-sentient (plants, minerals, metals)
- **Audbhida** — plant origin (largest group used in chikitsa)
- **Jangama** — animal origin (ksheera, ghrita, mootra, etc.)
- **Parthiva** — mineral, metallic origin (Rasashastra material)

## Panchabhautika Composition

The classical principle is *sarvam dravyam panchabhautikam* — every dravya is composed of all five mahabhutas, but the dominance differs.

| Mahabhuta dominance | Predominant Karma |
|---|---|
| Prithvi | Sthairya (stability), brimhana |
| Jala | Snigdhata (unctuousness), kledana |
| Tejas | Pachana (digestion), daha |
| Vayu | Calyam (movement), rookshata |
| Akasha | Mardavata (softness), shabda-vahana |

The doctor reads the dravya's mahabhuta composition through its rasa, guna, veerya, vipaka — and predicts its karma in the body.

## Karma Determination

A dravya's *karma* (action in the body) is a function of:

1. **Rasa** (taste) — the patient's first-order experience
2. **Guna** (qualities) — 20 binary properties (sheeta-ushna, snigdha-rooksha, etc.)
3. **Veerya** (potency) — sheeta vs ushna
4. **Vipaka** (post-digestive effect) — madhura, amla, katu
5. **Prabhava** (specific action) — unique effect not explained by the above

When a senior Ayurveda physician selects a dravya for a patient, she's reading these five attributes against the patient's prakriti + vikriti and predicting effect.

## Self-test

- Define samavayi karanam in your own words.
- List Charaka's five nava karana dravya.
- Why is Atma classified as a dravya in Ayurveda? Defend or critique this view.
- Give one example each of chetana and achetana dravya you would use clinically.`,
  },

  {
    slug: 'guna-41-qualities',
    title: 'Guna — 41 Types of Qualities in Ayurveda',
    subjectSlug: 'padartha-vigyana',
    year: '1st_year',
    difficulty: 'beginner',
    readTimeMinutes: 7,
    summary: 'Guna is the second padartha. Ayurveda recognises 41 gunas grouped into 5 categories. Mastery of the 20 sharira gunas (gurvadi) is essential for clinical practice.',
    keyPoints: [
      'Guna is samavayi (inherent) in dravya — cannot exist independently',
      'Five categories: Sartha, Gurvadi, Paradi, Vaisheshika, Adhyatmika',
      '20 Gurvadi gunas are binary pairs (guru-laghu, sheeta-ushna, etc.)',
      'Each guna has predictable doshic effect — basis of dietary advice',
      'Paradi gunas (10) govern formulation, dose, and timing of medicines',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 1/49-51',
      'Sushruta Samhita, Sutra Sthana 25',
      'Ashtanga Hridaya, Sutra Sthana 9',
    ],
    tags: ['padartha', 'guna', 'pharmacology', 'fundamentals'],
    content: `## Definition

**Guna** (गुण) is the inherent quality of a dravya. It cannot exist independently — guna is *samavayi* (inherent) in its substrate. The 41 gunas describe everything a dravya does, both pharmacologically and metaphysically.

## The 5 Categories

### 1. Sartha Guna (5) — Sense-object qualities
*Shabda, sparsha, rupa, rasa, gandha* — the qualities perceived by the five jnanendriya.

### 2. Gurvadi Guna (20) — Pharmacological qualities

These are the **most clinically important** gunas. They appear as 10 binary opposites:

| Pair | Vata effect | Pitta effect | Kapha effect |
|---|---|---|---|
| Guru–Laghu | guru↑ V↓ | guru↑ P↓ | guru↑ K↑ |
| Sheeta–Ushna | sheeta↑ V↑ | ushna↑ P↑ | sheeta↑ K↑ |
| Snigdha–Rooksha | snigdha↓ V | rooksha↑ V | snigdha↑ K |
| Mridu–Khara | mridu↓ V↓ K | khara↑ V | khara↓ K |
| Manda–Tikshna | manda↑ K | tikshna↑ P | manda↑ K |
| Sthira–Sara | sthira↑ K | sara↑ V | sara↓ K |
| Slakshna–Khara | slakshna↑ K | khara↑ P | slakshna↑ K |
| Sukshma–Sthula | sukshma↑ V | sthula↑ K | sthula↑ K |
| Sandra–Drava | sandra↑ K | drava↑ P | drava↓ K |
| Vishada–Pichchhila | pichchhila↑ K | vishada↑ V | pichchhila↑ K |

**Clinical rule of thumb**: To pacify a dosha, use dravyas with opposite gunas. To aggravate (when needed — e.g., before Vamana), use similar gunas. This is the doctrine of *samanya-vishesha siddhanta*.

### 3. Paradi Guna (10) — Pharmaceutical qualities

Para, apara, yukti, sankhya, samyoga, vibhaga, prithakta, parimana, sanskara, abhyasa. These govern formulation, dose, timing, polypharmacy, and habituation.

- **Sanskara** (processing) — the bhavana, shodhana, marana of Rasashastra
- **Samyoga** (combination) — synergistic vs antagonistic herb pairs
- **Parimana** (quantity) — dose-response
- **Abhyasa** (habituation) — long-term effects of repeated dosing

### 4. Vaisheshika Guna (5)

*Buddhi, sukha, dukkha, ichchha, dvesha, prayatna* — Vaisheshika philosophy's mental qualities, recognized in Ayurveda for understanding manasika roga (mental disorders).

### 5. Adhyatmika Guna (Triguna)

*Sattva, rajas, tamas* — the three mental modes that govern manasika prakriti.

## Clinical Application

When you write a prescription, you're choosing a dravya whose **rasa-guna-veerya-vipaka** profile is opposite to the patient's vikriti.

**Example**: Patient with vata-vikriti (rooksha, sheeta, laghu, khara). You select a dravya with snigdha-ushna-guru-mridu gunas (e.g., bala ksheera pacha kashayam).

This is why mastering gurvadi guna is the difference between a junior BAMS who memorises medicines and a senior physician who reasons from first principles.

## Self-test

- List the 10 binary pairs of gurvadi gunas from memory.
- For a kapha-aggravated patient with chronic congestion, which 4 gurvadi gunas would your dravya selection emphasize?
- Explain "sanskara" with one Rasashastra example.`,
  },

  {
    slug: 'asthi-bones-ayurveda-vs-modern',
    title: 'Asthi — Bones in Ayurveda vs Modern Anatomy',
    subjectSlug: 'rachana-sharira',
    year: '1st_year',
    difficulty: 'intermediate',
    readTimeMinutes: 6,
    summary: 'Sushruta counts 300 asthi against modern anatomy\'s 206. The discrepancy comes from inclusive classification (teeth, nails, cartilage) and developmental stages. Understanding Sushruta\'s asthi classification opens up unique Ayurvedic surgical reasoning.',
    keyPoints: [
      'Sushruta: 300 asthi; modern: 206 — includes cartilage, teeth, nails',
      '5 types: kapala, ruchaka, taruna, valaya, nalaka',
      'Asthi dhatu is upadhatu source of majja and nakha',
      'Asthi vaha srotas: pranavaha, annavaha, medovaha all contribute',
      'Asthi vrana (fractures) — Sushruta\'s 12 sandhana methods',
    ],
    references: [
      'Sushruta Samhita, Sharira Sthana 5/18',
      'Charaka Samhita, Sharira Sthana 7/6',
      'Ashtanga Sangraha, Sharira Sthana 5',
    ],
    tags: ['anatomy', 'asthi', 'sharira', 'sushruta'],
    content: `## The Number Question

Sushruta counts **300 asthi**. Modern anatomy counts 206. This discrepancy is a classic question for BAMS students — and the answer reveals important differences in classificatory approach.

### Why 300?

Sushruta's count is inclusive. It treats as bone:
- All teeth (32)
- All nails (20)
- Cartilage of nose, ears, eyelids (taruna asthi)
- Cartilage of ribs and sternum
- Developmental stages (fontanelles, ossification centres) counted separately

Modern anatomy excludes nails, teeth (counted separately), and adult fused bones (which Sushruta counts as ossification centres at birth).

## Pancha Asthi — Five Types

1. **Kapala asthi** — flat bones (skull, scapula, pelvis)
2. **Ruchaka asthi** — long bones with marrow cavity (femur, humerus)
3. **Taruna asthi** — cartilaginous (nasal, ear, eyelid)
4. **Valaya asthi** — curved/circular (ribs, vertebrae)
5. **Nalaka asthi** — tubular hollow bones (long bones inner — overlap with ruchaka)

Functionally:
- *Kapala* — surakshana (protection)
- *Ruchaka* — adhara (structural support)
- *Taruna* — sandhi avayava (joint components)
- *Valaya* — antaranga avayava-rakshana (visceral protection)
- *Nalaka* — gati (movement-related)

## Asthi as Dhatu

Asthi is the **5th dhatu** in the order: rasa → rakta → mamsa → meda → asthi → majja → shukra.

- **Source dhatu**: meda (fat). The sthayi asthi forms from poshaka meda
- **Upadhatu**: majja (marrow) and nakha (nails)
- **Mala**: kha-mala (bone porosities, smegma-like residue)
- **Dosha residence**: vata. *Sthana-samshraya* — vata's prime seat is asthi dhatu

This last point matters clinically: **vata vyadhis manifest first as asthi disorders** — osteoporosis, sandhigatavata, asthi-majjagata vata.

## Asthi Vaha Srotas

Sushruta names *medas* and *jaghana* (pelvis) as mula. Charaka adds asthi vaha pathway through:
- Pranavaha (oxygen → bone metabolism)
- Annavaha (nutrition)
- Medovaha (sthayi meda → asthi sneha)

**Asthi-pradoshaja vikara**: adhyasthi (exostoses), adhidanta (extra teeth), danta-shoola (tooth pain), keshanam patah (hair fall), kha-vaigunya (porosities).

## Clinical Notes

### Asthi vrana (fractures)

Sushruta enumerates **12 sandhana karma** — fracture reduction techniques. Six relate to long-bone fractures (chunna, pichchhita, asthi-cheda, etc.), six to joint dislocations.

### Asthi-kshaya vs asthi-vriddhi

- **Kshaya**: weakness, fatigue, kesha-loma-nakha falling, tooth loss, joint pain, marma sandhi shaitilya — modern correlate: osteopenia/osteoporosis
- **Vriddhi**: adhyasthi (exostoses), adhidanta (extra teeth) — modern correlate: osteomas, exostoses

### Treatment principles

- **Kshaya**: snehapana (mahanarayana taila), abhyanga, tarpana with ksheera-ghrita, bone-building herbs (lakshadi, asthi-shrinkhala, hadjod), milk + meda dravya in diet
- **Vriddhi**: virechana, lekhana, panchakarma to clear excess

## Self-test

- Reconcile Sushruta's 300 with modern 206 — give 3 specific differences.
- Why does vata-vyadhi first manifest in asthi?
- List Sushruta's 5 asthi types and one example bone for each.
- Asthi-kshaya patient — what 3 dravyas would you prescribe and why?`,
  },

  {
    slug: 'agni-13-types-digestive-fire',
    title: 'Agni — The 13 Types of Digestive Fire',
    subjectSlug: 'kriya-sharira',
    year: '1st_year',
    difficulty: 'intermediate',
    readTimeMinutes: 8,
    summary: 'Agni is the single most important concept in Ayurvedic physiology. 13 agnis classify the metabolic transformations from gut to cellular level. Mastery of agni states (4 types) is the foundation of diagnosis and treatment.',
    keyPoints: [
      '13 agnis: 1 jatharagni + 5 bhutagni + 7 dhatvagni',
      'Jatharagni is the "raja" — controls all other agnis',
      '4 agni avastha: sama, vishama, tikshna, manda',
      'Ama is undigested rasa — root of all systemic disease (sarva-roga-mula)',
      'Treating agni = treating root cause; suppressing symptoms = ignoring agni',
    ],
    references: [
      'Charaka Samhita, Chikitsa Sthana 15/3-13',
      'Ashtanga Hridaya, Sutra Sthana 11',
      'Sharangadhara Samhita, Purvakanda 5',
    ],
    tags: ['agni', 'physiology', 'metabolism', 'kriya-sharira'],
    content: `## Why Agni is Central

> *Pitaadi agneh karyam* — "All actions of pitta are functions of agni"

Charaka calls agni *deha-balaya-varna-utsahanga* — the source of strength, complexion, and vitality. Sushruta places agni at the center of disease: "ayuh varno balam svasthyam — all depend on agni." For the BAMS clinician, every diagnosis starts and ends with an agni assessment.

## The 13 Agnis

### 1 Jatharagni — the Master Fire

- **Location**: grahani (duodenum/jejunum)
- **Function**: digestion of ingested food
- **Sub-control**: governs all 12 other agnis. If jatharagni fails, every downstream agni fails

### 5 Bhutagni — Bhuta-specific Fires

Each mahabhuta in food is digested by its respective bhutagni after being broken down by jatharagni:
- **Parthiva agni** — converts earth-component
- **Apya agni** — water-component
- **Tejas agni** — fire-component
- **Vayavya agni** — air-component
- **Akashiya agni** — space-component

Bhutagnis sit in the *yakrit* (liver) and process the broken-down food into its bhautika components ready for dhatu metabolism.

### 7 Dhatvagni — Dhatu-specific Fires

Each dhatu has its own agni that processes poshaka (nutrient) dhatu into sthayi (stable) dhatu and creates the corresponding mala:

| Dhatu | Dhatvagni transformations |
|---|---|
| Rasa | poshaka rasa → sthayi rasa + sweat (mala) + rakta (next dhatu) |
| Rakta | poshaka rakta → sthayi rakta + bile (mala) + mamsa |
| Mamsa | poshaka mamsa → sthayi mamsa + kha-mala + meda |
| Meda | poshaka meda → sthayi meda + sweat (mala) + asthi |
| Asthi | poshaka asthi → sthayi asthi + kesha/loma/nakha (mala) + majja |
| Majja | poshaka majja → sthayi majja + akshi-sneha (mala) + shukra |
| Shukra | poshaka shukra → sthayi shukra/artava + ojas (essence) |

## 4 Agni Avastha (States)

### 1. Sama agni — balanced
Digests apt food in apt quantity in apt time. Stable appetite, regular bowel, no symptoms. The goal state.

### 2. Vishama agni — irregular (vata-dominant)
Sometimes digests fast, sometimes slow. Symptoms: bloating, distension, irregular bowel, abdominal pain, alternating constipation-diarrhea. Treatment: vata-pacifying, regular timing, snigdha-ushna diet.

### 3. Tikshna agni — sharp (pitta-dominant)
Digests food too rapidly, causing hunger soon after eating. Symptoms: hyperacidity, burning, urgency, tendency to inflammation. Treatment: pitta-pacifying, sheeta-snigdha diet.

### 4. Manda agni — sluggish (kapha-dominant)
Digestion is slow, incomplete. Symptoms: heaviness, drowsiness post-meal, ama formation, weight gain, chronic congestion. Treatment: kapha-pacifying, deepana-pachana dravyas (trikatu, panchakola, ushna-laghu diet).

## Ama — the Root of Disease

When agni fails (especially manda or vishama), food is improperly digested → forms **ama** (undigested rasa with toxic properties). Ama then:

1. Blocks srotas (channels) → roto-vrodha
2. Mixes with doshas → sama-vata, sama-pitta, sama-kapha
3. Lodges in dhatus → systemic disease
4. Manifests as 80% of chronic illness in modern Ayurveda clinics

> *Ama-mulam sarva-rogah* — "ama is the root of all disease"

## Clinical Assessment of Agni

The senior physician reads agni from:
- **Appetite pattern** (regular vs irregular vs absent)
- **Bowel pattern** (single morning vs multiple vs alternating)
- **Coating on tongue** (clear vs heavy white = ama)
- **Post-meal heaviness vs lightness**
- **Body weight trend**
- **Mental energy after meals**

## Treatment Principle

**Agni-deepana** (kindling) + **ama-pachana** (digesting ama) comes BEFORE shodhana, BEFORE dravya-based chikitsa. Treating disease without first correcting agni is treating symptoms — the senior teacher's first lesson.

## Self-test

- Name all 13 agnis with their locations.
- Differentiate vishama, tikshna, and manda agni with 3 symptoms each.
- A patient presents with weight gain + heavy coated tongue + drowsiness — which agni state and treatment?
- Why is ama called "rasa-pradoshaja"?`,
  },

  {
    slug: 'history-of-ayurveda',
    title: 'History of Ayurveda — From Brahma to Modern Era',
    subjectSlug: 'ayurveda-ithihasa',
    year: '1st_year',
    difficulty: 'beginner',
    readTimeMinutes: 7,
    summary: 'Ayurveda traces back ~5000 years through three epochs: Vedic, Samhita (classical), and Sangraha (compendium). Modern era brings statutory regulation (CCIM 1970, NCISM 2020) and Kerala\'s Ashtavaidya lineage tradition.',
    keyPoints: [
      'Divya parampara: Brahma → Daksha → Ashwini Kumara → Indra → Bharadwaja',
      'Samhita kala: Charaka, Sushruta, Bhela, Harita, Kasyapa',
      'Sangraha kala: Vagbhata\'s Ashtanga Hridaya, Madhava Nidana',
      'Kerala tradition: Ashtavaidya families, Sahasrayogam, Vaidyaratnam lineage',
      'Modern: 1970 CCIM Act → 2020 NCISM Act; AYUSH ministry 2014',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 1/3-7',
      'Sushruta Samhita, Sutra Sthana 1',
      'Vagbhata, Ashtanga Hridaya, Sutra Sthana 1',
    ],
    tags: ['history', 'ithihasa', 'tradition'],
    content: `## Three Epochs of Ayurveda

### 1. Vedic Period (~3000-1500 BCE)
Earliest references to healing are in **Atharvaveda**, which Sushruta calls the *upaveda* (sub-veda) from which Ayurveda derives. Atharvaveda has hymns to specific diseases, herbs, and surgical procedures. Rigveda mentions Ashwini Kumaras — the divine physicians who performed the first recorded organ transplant (replacing Chyavana's head).

### 2. Samhita Kala (~1500 BCE - 500 CE) — Classical Period

This is when the foundational texts were compiled:

- **Charaka Samhita** (~1st century CE) — by Agnivesha, redacted by Charaka. Focus on **Kayachikitsa** (internal medicine). 8 sthanas, 120 chapters.
- **Sushruta Samhita** (~6th century BCE - 4th century CE) — by Sushruta, son of Vishvamitra. Focus on **Shalya** (surgery). Includes rhinoplasty, cataract surgery, lithotomy.
- **Bhela Samhita** — fragmentary; Bhela was Agnivesha's classmate.
- **Harita Samhita** — focused on Kaumarabhritya (paediatrics).
- **Kasyapa Samhita** — also paediatric focus; mentions vaccination-like immunisation.

### 3. Sangraha Kala (~500 - 1500 CE) — Compendium Period

Synthesised the earlier samhitas:

- **Vagbhata's Ashtanga Sangraha** (7th century) — encyclopaedic.
- **Vagbhata's Ashtanga Hridaya** (7th century) — concise version; the practical clinical textbook in Kerala tradition.
- **Madhava Nidana** (8th century) — the diagnostic textbook; pure roga-nidana focus.
- **Sharangadhara Samhita** (13th century) — pharmaceutical text; defined classical formulations (vati, kashaya, ghrita, taila).
- **Bhavaprakasha** (16th century) — by Bhavamishra; the nighantu (materia medica) and chikitsa hybrid; standard for dravya identification.

## Kerala Tradition

Kerala developed its own distinct lineage starting ~10-12th century:

- **Ashtavaidya families** — 8 brahmin families who became hereditary physicians: Alathiyur, Chirattamon, Elayidath, Kuttanchery, Pulamanthole, Thaikkattu Mooss, Thrissur, Vayaskara. Some lineages continue today.
- **Sahasrayogam** (anonymous, ~14th century, Malayalam) — Kerala's practical formulary with 1000+ formulations. Still used clinically today.
- **Chikitsa-manjari** by Chathukutty Pillai (~17th century).
- **Vaidya-manorama**, **Yoga-tarangini** — later Kerala texts.

Kerala's unique contributions:
- Strong **Panchakarma** tradition (Pizhichil, Njavarakizhi developed here)
- Classical **bala chikitsa** (paediatric Ayurveda)
- **Visha chikitsa** — Kerala has the most refined snake-bite Ayurveda tradition
- **Marma chikitsa** linked to Kalaripayattu martial tradition

## Modern Era

- **1822**: First documented colonial-era encounter; British East India Co. dismissed Ayurveda
- **1898**: Maharaja's Sanskrit College, Thiruvananthapuram, started Ayurveda teaching
- **1917**: Ayurveda College, Thiruvananthapuram — first state-recognised college
- **1947-50**: Independence + Constitution recognises traditional medicine
- **1970**: **Central Council of Indian Medicine (CCIM) Act** — regulated practice nationally
- **1978-79**: WHO Alma Ata Declaration recognised traditional medicine globally
- **2014**: **Ministry of AYUSH** created — Ayurveda gets cabinet-rank ministry
- **2020**: **NCISM Act** replaces CCIM — National Commission for Indian System of Medicine
- **2024**: International licensing pathways open (DHA, DOH, QCHP, SCFHS)

## Contemporary Position

Today Ayurveda has:
- 300,000+ registered practitioners in India
- 500+ BAMS colleges
- Statutory licensing in UAE, parts of Russia, Bali, Sri Lanka, Nepal
- WHO collaboration centres at AIIMS Jodhpur, Banaras Hindu University
- Growing research base (CCRAS, NMPB, AYUSH research councils)
- Annual revenue of the Indian Ayurveda industry ~₹70,000 crore (2025 estimate)

## Self-test

- Name the three epochs of Ayurveda and the key texts of each.
- List 4 of Kerala's 8 Ashtavaidya families.
- What does the 2020 NCISM Act replace? Why was the change made?
- Name 3 unique Kerala contributions to Ayurveda practice.`,
  },

  // ── 2nd Year ──────────────────────────────────────────────
  {
    slug: 'rasa-panchaka',
    title: 'Rasa Panchaka — Five Pharmacological Properties',
    subjectSlug: 'dravyaguna-vigyana',
    year: '2nd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 7,
    summary: 'Every dravya is characterised by 5 attributes: Rasa, Guna, Veerya, Vipaka, Prabhava. These are the doctor\'s decision-making framework for prescription. Master rasa panchaka and you can predict drug action without rote memorisation.',
    keyPoints: [
      '6 rasas: madhura, amla, lavana, katu, tikta, kashaya',
      '20 gurvadi gunas (covered in Padartha)',
      'Veerya: sheeta vs ushna — the dominant pharmacological force',
      'Vipaka: post-digestive transformation into madhura/amla/katu',
      'Prabhava: specific action unexplained by the above — e.g., danti virechana',
    ],
    references: [
      'Charaka Sutra Sthana 26',
      'Sushruta Sutra Sthana 40-42',
      'Bhavaprakasha Nighantu',
    ],
    tags: ['dravyaguna', 'pharmacology', 'rasa-panchaka'],
    content: `## The Doctor's Toolkit

When a senior Ayurveda physician decides which dravya to prescribe, she's reading five attributes against the patient's vikriti:

1. **Rasa** — what the substance tastes like to the patient
2. **Guna** — its 20 binary qualities
3. **Veerya** — its potency (sheeta or ushna)
4. **Vipaka** — what it transforms into after digestion
5. **Prabhava** — its specific unique action

This is *rasa panchaka*. Master it and pharmacology becomes reasoning rather than memorisation.

## 1. Rasa — the Six Tastes

Rasa is the patient's first encounter with the dravya. The 6 rasas, their mahabhuta composition, and doshic effect:

| Rasa | Mahabhuta | Vata | Pitta | Kapha |
|---|---|---|---|---|
| Madhura (sweet) | Prithvi + Apa | ↓ | ↓ | ↑ |
| Amla (sour) | Prithvi + Tejas | ↓ | ↑ | ↑ |
| Lavana (salty) | Apa + Tejas | ↓ | ↑ | ↑ |
| Katu (pungent) | Vayu + Tejas | ↑ | ↑ | ↓ |
| Tikta (bitter) | Vayu + Akasha | ↑ | ↓ | ↓ |
| Kashaya (astringent) | Vayu + Prithvi | ↑ | ↓ | ↓ |

**Clinical pattern**: madhura-amla-lavana (the "lower three") pacify vata. Katu-tikta-kashaya pacify kapha. Pitta is pacified by madhura-tikta-kashaya.

## 2. Guna

The 20 gurvadi gunas (covered in Padartha Vigyana). Briefly: each dravya is characterised by where it falls on 10 binary scales (guru-laghu, sheeta-ushna, etc.). Combined with rasa, guna gives a refined doshic prediction.

## 3. Veerya — Potency

Veerya is the **dominant pharmacological force** of the dravya. Most texts recognise two veeryas:

- **Sheeta veerya** — cooling. Examples: chandana, ushira, gokshura, bala
- **Ushna veerya** — heating. Examples: shunti, pippali, hingu, guggulu

Some texts expand to 8 veeryas (sheeta-ushna-snigdha-rooksha-guru-laghu-mridu-tikshna) but the binary sheeta-ushna remains the working clinical distinction.

**Veerya often dominates rasa**: a sweet (rasa) substance with ushna veerya will not always pacify pitta because its veerya may aggravate pitta.

## 4. Vipaka — Post-Digestive Effect

After jatharagni-bhutagni processing, the dravya transforms. The three vipakas are:

- **Madhura vipaka** — most madhura, amla, lavana rasa dravyas; effect: brimhana, snehana
- **Amla vipaka** — amla rasa dravyas; effect: deepana, pittakara
- **Katu vipaka** — katu, tikta, kashaya rasa dravyas; effect: lekhana, rooksha

**Why vipaka matters**: the dravya's effect at the *dhatu level* is determined by vipaka, not by rasa. A sweet dravya with katu vipaka has a different long-term tissue effect than one with madhura vipaka.

## 5. Prabhava — Specific Action

Some dravyas show effects that **cannot be explained** by their rasa, guna, veerya, vipaka. These are *prabhava*-driven:

- **Danti** (Baliospermum montanum) — virechana action by prabhava
- **Madanaphala** — vamana action by prabhava
- **Snake-bite mantra** dravyas — specific anti-venom action by prabhava
- **Chyavanaprasha** — rasayana effect overall by prabhava

Prabhava is the residual category — when the four attributes don't predict the dravya's main action, prabhava takes over.

## Clinical Reasoning Example

Patient: chronic pitta-pradhana hyperacidity.

Selecting **shatavari** (Asparagus racemosus):
- Rasa: madhura, tikta — pacifies pitta ✓
- Guna: snigdha, guru, sheeta — pacifies pitta ✓
- Veerya: sheeta — strongly pacifies pitta ✓
- Vipaka: madhura — soothes inflammation ✓
- Prabhava: stanyajanana (lactogenic), rasayana

This is rasa-panchaka reasoning. Every choice is defensible from these five attributes.

## Self-test

- List 6 rasas with their dominant mahabhuta.
- Differentiate veerya and vipaka with one example each.
- Patient with chronic kapha-induced rhinitis — what rasa-guna-veerya-vipaka profile should your dravya have?
- Give 3 examples of prabhava and explain why each is classified as such.`,
  },

  {
    slug: 'dashemani-charaka',
    title: 'Dashemani — 10 Groups of Drugs by Charaka',
    subjectSlug: 'dravyaguna-vigyana',
    year: '2nd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 8,
    summary: 'Charaka classifies 500+ drugs into 50 dashemani (groups of 10 herbs each grouped by therapeutic action). This is functional pharmacology — herbs grouped by what they treat, not by botanical family. Mastering dashemani is the most efficient way to remember Charakian materia medica.',
    keyPoints: [
      '50 dashemani × 10 herbs = 500 cardinal herbs in Charaka Sutra 4',
      'Grouping is by karma (action), not botany',
      'Each dashemani name = the karma it produces',
      'Examples: jivaniya, brimhana, lekhana, rasayana, vajikarana',
      'Modern pharmacology validates many dashemani groupings',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 4 — Shadvirechanashataashriteeya Adhyaya',
      'Bhavaprakasha Nighantu',
      'Dravyaguna Vigyana (PV Sharma)',
    ],
    tags: ['dravyaguna', 'charaka', 'dashemani', 'pharmacology'],
    content: `## The Principle

Charaka opens his Sutra Sthana chapter 4 by saying: out of the hundreds of dravyas available to the doctor, the most efficient way to learn pharmacology is by **karma (action)** rather than by botanical family.

He groups 500 cardinal herbs into **50 dashemani** (groups of 10), each named after the karma it produces. A student who masters dashemani has 500 herbs ordered by clinical purpose, not by alphabetical accident.

## Selected Key Dashemani

### 1. Jivaniya (life-promoting)
*Jivanti, kakoli, ksheera-kakoli, mudgaparni, mashaparni, meda, mahameda, ridhi, vridhi, jivaka.*
Used in: kshaya (wasting), post-illness recovery, rasayana protocols.

### 2. Brimhaniya (anabolic, mass-promoting)
*Ksheerakakoli, kakoli, mudgaparni, ashwagandha, vidari, bala, meda, jivanti, ksheera (milk), mamsa (meat).*
Used in: emaciation, post-partum recovery, paediatric weight gain.

### 3. Lekhaniya (scraping, fat-reducing)
*Musta, kushta, haridra, daruharidra, vacha, ativisha, pippali, chitraka, chirabilva, haritaki.*
Used in: medo-vriddhi (obesity), sthaulya, lipoma, atheroma.

### 4. Bhedaniya (purgative)
*Kampillaka, danti, kumari, chitraka, haritaki, indrayava, suvarna, urubuka, kshara, hanjikabija.*
Used in: virechana karma, chronic constipation.

### 5. Sandhaniya (fracture/wound healing)
*Madhuka, manjishtha, dhataki, lodhra, priyangu, katphala, mocharasa, samanga, padmakeshara, rasanjana.*
Used in: vrana sandhana, asthi vrana (fracture healing), bleeding disorders.

### 6. Deepaniya (appetiser, digestive fire kindler)
*Pippali, pippali-mula, chavya, chitraka, shringavera, amlavetasa, marichha, ajamoda, bhallataka-asthi, hingu-niryasa.*
Used in: agnimandhya, low appetite, ama formation.

### 7. Hridya (cardiac tonic)
*Amra, amrataka, lakucha, karamarda, vrikshamla, amlavetasa, kuvala, badara, dadima, matulunga.*
Mostly sour fruits. Used in: hridroga, cardiac weakness.

### 8. Vajikarana (aphrodisiac, fertility)
*Vrishya — kapikacchu (mucuna), ikshu, masha, vidari, bala, asparagus, ashwagandha, jivanti, meda, mahameda.*
Used in: shukra-kshaya, infertility, impotence.

### 9. Rasayana (rejuvenative)
*Amalaki, haritaki, vibhitaki (triphala), abhaya, dhatri, brahmi, mandukaparni, ashwagandha, bala, shilajatu.*
Used in: jara nivaraka (anti-ageing), immunity, post-treatment recovery.

### 10. Chedaniya (drying, srotas-clearing)
*Pippali, marichha, chavya, chitraka, vacha, hingu, ajamoda, kushta, hareetaki, shunthi.*
Used in: kapha-vata disorders with stagnation.

### 11. Vamanopaga (supporting emetic action)
Used as preparatory dravyas before Vamana karma.

### 12. Virechanopaga (supporting purgative action)
Used before Virechana karma.

### 13. Asthapanopaga (supporting niruha basti)
### 14. Anuvasanopaga (supporting anuvasana basti)

### 15. Shiroviréchanopaga (supporting Nasya karma)

### 16. Chchhardinigrahana (anti-emetic)
*Madhuka, mukta, jeevaka, ridhi, draksha, lodhra, kashmari, ushira, parushaka, padmaka.*
Used in: chchhardi (vomiting), pregnancy-related vomiting.

### 17. Trishna-nigrahana (anti-thirst)
### 18. Hikka-nigrahana (anti-hiccup)
### 19. Purisha-sangrahana (anti-diarrhoeal)
### 20. Mootra-virjania (diuretic)

(...continues to 50 in total)

## How to Study Dashemani

1. **Don't memorise all 500 herbs at once.** Pick one dashemani per week.
2. For each dashemani, learn the **karma keyword** + 3-4 most clinically useful herbs.
3. **Connect to clinical pictures**: when you see a patient with cough, brain searches kasahara dashemani; when you see oedema, sothahara dashemani.
4. **Cross-reference with Bhavaprakasha Nighantu** for botanical identification and modern correlation.

## Why Dashemani Still Matters

Modern Ayurveda dispensing tends to use proprietary formulations (Liv 52, Tab Mensec, etc.) and proprietary names. But the **prescribing logic** that distinguishes a junior from a senior Ayurvedic physician is dashemani-based reasoning: choosing the right karma category first, then selecting the specific dravya within it.

A patient walks in with chronic constipation. You think: bhedaniya group. From the 10, you pick haritaki because the patient also has chronic ama and vata. Now you've reasoned to your prescription instead of guessing.

## Self-test

- List Charaka's 50 dashemani in order. (Goal: by 3rd year)
- For each of: jivaniya, lekhaniya, hridya, rasayana — name 5 herbs and the typical clinical use.
- A patient with sthaulya + slow digestion — which 2 dashemani would you draw from?
- What dashemani is the "modern hypolipidemic" group most aligned with?`,
  },

  {
    slug: 'parada-shodhana-marana',
    title: 'Parada (Mercury) — Shodhana and Marana',
    subjectSlug: 'rasashastra',
    year: '2nd_year',
    difficulty: 'advanced',
    readTimeMinutes: 7,
    summary: 'Parada (mercury) is the central rasa-dravya. Without proper shodhana (purification, 8 steps) and marana (incineration), parada is toxic. Rasashastra\'s entire safety system rests on these procedures. Modern toxicology validates the chemistry behind classical purification.',
    keyPoints: [
      'Parada has 8 doshas + 5 kanchukas requiring shodhana',
      '18 samskaras: 8 shodhana + 5 stages of marana + 5 utility samskaras',
      'Shodhana converts elemental Hg → HgS (cinnabar = rasa-sindura)',
      'Properly prepared parada bhasma is non-toxic per modern AAS studies',
      'Improperly prepared parada → mercury poisoning (mad hatter syndrome)',
    ],
    references: [
      'Rasa Tarangini, Taranga 6',
      'Rasaratna Samuchchaya, Adhyaya 8',
      'Modern toxicology: J Ethnopharmacol studies on Hg-bhasma',
    ],
    tags: ['rasashastra', 'parada', 'mercury', 'shodhana', 'bhasma'],
    content: `## Why Parada is Central

In Rasashastra, **parada** (mercury) is *bhagavan* — the divinity. Every classical metallic bhasma uses parada as catalyst or component. The entire safety and efficacy of Rasashastra depends on parada being properly prepared.

> *Parada-shodhana hina rasa-aushadhi rogavardhini* — "Mercury that has not been purified causes the very disease one tries to cure."

This is not poetic. Unpurified or improperly purified parada is genuinely toxic.

## The 8 Doshas of Parada

Before shodhana, parada contains 8 doshas:
1. **Naga** (lead contamination)
2. **Vanga** (tin contamination)
3. **Mala** (impurities, residues)
4. **Vahni** (fire — instability)
5. **Visha** (toxic principle)
6. **Asahyagni** (intolerance to heat)
7. **Daya** (fluidity excess)
8. **Chapalata** (volatility)

Plus **5 kanchukas** (sheaths) that prevent therapeutic action.

## The 18 Samskaras

Classical Rasashastra defines 18 sequential procedures:

### Shodhana (purification) — 8 steps

1. **Swedana** — sudation. Parada is tied in cloth and boiled in herbal kashaya for 3 days
2. **Mardana** — trituration. Parada is ground with lemon juice, garlic, ginger, rock salt for 3 days
3. **Murchana** — fainting. Parada is heated with specific drugs until it loses its lustre
4. **Utthapana** — rising. Restoring movement after murchana
5. **Patana** — distillation. Three types: urdhva, adho, tiryak — separates parada from impurities
6. **Bodhana** — awakening. Restoring catalytic property
7. **Niyamana** — restraining. Removing chapalata
8. **Sandipana** — kindling. Increasing therapeutic potency

### Marana (incineration) — 5 stages

9. **Garbhadruti** — internal liquefaction
10. **Bahyadruti** — external liquefaction
11. **Jarana** — assimilation of metal
12. **Ranjana** — colour stabilisation
13. **Sarana** — fluxing for incorporation

### Utility samskaras — 5 steps

14. **Kramana** — gradual processing
15. **Vedha** — penetrating capacity test
16. **Saraka** — therapeutic application steps
17. **Shadaguni** — six-fold processing
18. **Khotabandha** — fixation

## Chemistry Validation

Modern atomic absorption spectroscopy studies of properly prepared **rasa-sindura** (parada bhasma + sulphur) show:

- The final product is **mercuric sulphide (HgS)** — cinnabar form
- HgS is **biologically inert** — passes through GI tract without absorption
- Mercury bioavailability is **<0.001%** of total Hg in properly prepared bhasma
- The traditional 8-shodhana + marana sequence **chemically eliminates** the elemental and ionic Hg that would cause toxicity

**Studies referenced**:
- *J Ethnopharmacol* 2014; 154(2):343-351 — bioavailability study
- *Pharm Biol* 2010; 48(8):867-875 — heavy metal AAS analysis
- Several CCRAS-funded studies

**Conclusion**: Traditional Rasashastra preparation, performed correctly, produces a non-toxic mercury compound.

## What Goes Wrong

Mercury poisoning cases attributed to Ayurveda almost universally trace to:

1. **Cottage-industry products** that skipped shodhana steps
2. **Adulterated formulations** that added elemental Hg without processing
3. **Misidentified products** sold as bhasma but never undergoing marana
4. **Modern GMP failures** in some Ayurveda manufacturing units

Properly trained Rasashastra physicians prepare bhasma in-house under traditional protocols. Mass-market products are where the contamination problem lies.

## Clinical Use

Properly prepared parada bhasma is used in:
- **Hingula bhasma** — chronic disease, low immunity
- **Rasa-sindura** — rasayana, chronic disease, jvara
- **Makaradhwaja** — vajikarana, ojas restoration
- **Tribhuvana kirti rasa** — jvara, sannipata fever
- **Sutshekhara rasa** — pitta-related conditions

Dose: 30-125 mg, typically with anupana of madhu, ghrita, or milk.

## Regulatory Status

- India: classified as Ayurveda drug, regulated under Drugs & Cosmetics Act
- Most GCC: prohibited or heavily restricted
- USA: FDA does not approve Ayurvedic Hg-containing bhasmas — manufacturers must label clearly
- UK: must register with MHRA; many are not registered

A practising Ayurveda doctor should know the regulatory landscape of their jurisdiction.

## Self-test

- Name the 8 doshas of parada.
- List the 8 shodhana steps in order.
- What chemical compound does properly prepared rasa-sindura contain?
- Why does AAS analysis of properly prepared bhasma show <0.001% bioavailable Hg?
- Name 3 clinical formulations using purified parada.`,
  },

  {
    slug: 'nidana-panchaka',
    title: 'Nidana Panchaka — Five Diagnostic Tools',
    subjectSlug: 'roga-nidana',
    year: '2nd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 7,
    summary: 'Nidana Panchaka is Madhava\'s diagnostic framework: 5 lenses through which every disease is examined. Master this and you have a structured approach to every case — from chronic disease to acute presentation.',
    keyPoints: [
      '5 tools: Nidana, Purvarupa, Rupa, Upashaya, Samprapti',
      'Nidana = causative factors; Purvarupa = prodromal symptoms',
      'Rupa = full-blown symptoms; Upashaya = diagnostic by therapeutic trial',
      'Samprapti = pathogenesis; the most important for chikitsa selection',
      'Madhava Nidana opens with this framework and applies to 79 disease chapters',
    ],
    references: [
      'Madhava Nidana, Adhyaya 1',
      'Charaka Samhita, Nidana Sthana 1',
      'Vagbhata, Ashtanga Hridaya Nidana 1',
    ],
    tags: ['nidana', 'diagnosis', 'roga-nidana', 'samprapti'],
    content: `## The Framework

When a patient presents, the Ayurveda physician asks five questions in sequence:

1. **What caused this disease?** (Nidana)
2. **What symptoms appeared early?** (Purvarupa)
3. **What are the full symptoms now?** (Rupa)
4. **What treatments make it better?** (Upashaya — diagnostic-therapeutic trial)
5. **What is the pathway of this disease?** (Samprapti)

This is *Nidana Panchaka*. Madhava Nidana, the canonical diagnostic text, applies this framework to 79 disease groups. Mastering it gives the BAMS student a structured diagnostic approach equivalent to (and arguably more nuanced than) modern history-physical-investigation flow.

## 1. Nidana (Causative Factors)

Two sub-categories:
- **Sannikrishta nidana** — proximate cause (the trigger)
- **Viprakrishta nidana** — distant cause (the predisposing factors)

Example: a patient with **amavata**.
- Sannikrishta: heavy cold meal at night + sleeping immediately after
- Viprakrishta: months of vata-aggravating lifestyle + slow agni + ama accumulation

The doctor's history-taking must elicit both. Treating only the trigger without addressing predisposition leads to relapse.

## 2. Purvarupa (Prodromal Symptoms)

The body signals incoming disease *before* full manifestation. Purvarupa is these early warning signs.

For **jvara** (fever): heaviness, body ache, malaise, slight anorexia — 1-3 days before fever spikes.
For **kushtha** (skin disease): mild itching, irregular skin moisture, dullness of skin tone — weeks before lesions.
For **amavata**: morning stiffness, mild joint discomfort, irregular digestion — months before pain establishes.

**Clinical insight**: a patient who recognises purvarupa and seeks treatment then has dramatically better outcomes than one who waits for rupa.

## 3. Rupa (Full-Blown Symptoms)

The full symptom complex of the established disease. Charaka subdivides rupa into:
- **Pratyatma lakshana** — pathognomonic, disease-specific
- **Anubandha lakshana** — associated symptoms from involved doshas/dhatus

For amavata: shoola (pain), shotha (swelling), stabdhata (stiffness), graha (constraint), agnimandhya (low digestion), aruchi (anorexia), trishna (thirst), daha (burning sometimes), bahumootrata (frequent urination), gauravam (heaviness).

Diagnosis is confirmed when sufficient pratyatma + anubandha lakshanas are present.

## 4. Upashaya — Diagnostic-Therapeutic Trial

When diagnosis is uncertain, Ayurveda permits a **diagnostic trial**: try a treatment likely to help the suspected disease. If the patient improves, diagnosis is confirmed.

Types of upashaya:
- **Hetu-viparyaya** — opposite of suspected cause (e.g., warm diet for vata-aggravation case)
- **Vyadhi-viparyaya** — opposite of suspected disease pattern
- **Hetu-vyadhi-viparyaya** — opposite of both
- **Hetu-vyadhi-vipari-vipari** — counter-intuitive trial (rare)

Anupashaya = the opposite: if a treatment that should help doesn't, rethink the diagnosis.

Example: suspected amavata vs sandhigatavata. Try ushna-snigdha kashaya + langhana. If both joint pain and digestion improve, amavata confirmed. If joint pain improves but no digestion change, lean toward sandhigatavata.

## 5. Samprapti — Pathogenesis

The most clinically important of the five. Samprapti is the **complete pathway** the disease has taken inside the body:

1. **Hetu sevana** — exposure to causes
2. **Dosha prakopa** — doshic aggravation
3. **Dosha prasara** — spread of dosha
4. **Dosha sthana samshraya** — lodging in specific srotas/dhatu/avayava
5. **Vyakti** — manifestation
6. **Bheda** — chronification with complications

Charaka's amavata samprapti, schematic:
> Manda agni → ama formation → vyana vayu carries ama to sandhis → ama lodges in sandhi-pradesha → shotha-shoola → if chronic, dhatu dushti → invalidating disease.

## Why Samprapti Matters

**Treatment is selected based on samprapti, not just diagnosis.** Two patients can both have "amavata" but have different samprapti pathways. One needs deepana-pachana first; another needs srotashodhana; a third needs raktamokshana. The diagnosis is the same; the chikitsa differs because samprapti differs.

This is why "Liv 52 for liver" or "Lasunadi vati for indigestion" — symptom-matched prescribing — is junior-level practice. Reading samprapti is senior-level practice.

## Putting it Together — Sample Case

Patient: 45-year-old male, chronic loose stools 6 months.

- **Nidana**: heavy fried food + irregular meal times + chronic stress (vishama agni nidana)
- **Purvarupa**: 8 months prior — occasional bloating, sour belching
- **Rupa**: 3-6 loose stools/day, abdominal heaviness, low appetite, lethargy
- **Upashaya**: improves with light warm food, worsens with cold milk
- **Samprapti**: manda agni → ama → pitta-dushti → vata-anuloma loss → grahani roga

This integrated reading determines the prescription: deepana-pachana (drakshadi kashayam, sutshekhara) → grahani-shamana (kutaja, bilva) → rasayana over weeks.

## Self-test

- List the 5 elements of Nidana Panchaka in order.
- Differentiate Purvarupa and Rupa with one disease example.
- What is the role of Upashaya?
- For a suspected case of Amlapitta, write out the 6-stage samprapti.
- Why is samprapti reading more important than diagnosis labeling for chikitsa selection?`,
  },

  {
    slug: 'dinacharya-complete-daily-regimen',
    title: 'Dinacharya — Complete Daily Regimen',
    subjectSlug: 'swasthavritta',
    year: '2nd_year',
    difficulty: 'beginner',
    readTimeMinutes: 7,
    summary: 'Dinacharya is the daily routine Ayurveda prescribes for swastha (health) maintenance. From brahma muhurta wakeup to nidra, every hour has prescribed activity. Modern lifestyle medicine validates many dinacharya components.',
    keyPoints: [
      'Begin: brahma muhurta (96 min before sunrise) wakeup',
      'Order: pratisarana → dantadhavana → jihva nirlekhana → gandusha → abhyanga → vyayama → snana',
      'Aahara: 2 main meals; first 2 hours after sunrise, second before 2 PM',
      'Vyavahara: artha + kama balanced with dharma',
      'Sleep: 6-8 hours, in by 10-11 PM',
    ],
    references: [
      'Ashtanga Hridaya Sutra Sthana 2',
      'Charaka Sutra Sthana 5',
      'Sushruta Chikitsa Sthana 24',
    ],
    tags: ['swasthavritta', 'dinacharya', 'lifestyle', 'prevention'],
    content: `## The Principle of Dinacharya

Vagbhata opens Ashtanga Hridaya Sutra Sthana 2 with: *brahme muhurte uttishthet — swastho rakshartham ayushah* — "rise in the brahma muhurta to protect the lifespan of the healthy."

Dinacharya is **preventive medicine** in its most ancient form. Each activity has a doshic rationale and a circadian basis. Modern circadian biology, sleep medicine, and lifestyle intervention research increasingly validate the dinacharya framework.

## Morning Routine (4:30 AM - 7:00 AM)

### 1. Brahma muhurta uttishthana
Wake 96 minutes before sunrise (~4:30-5:00 AM in equatorial latitudes; varies seasonally). Vata-dominant time → mind is alert, environment quiet.

### 2. Manas-vyavahara
Brief mental scan: *kim adya kartavyam* — what is to be done today? Sankalpa for the day.

### 3. Mootra-purisha visarjana
Natural urges should not be suppressed. Sit in eastern-facing posture.

### 4. Achamana + Pratisarana
Wash mouth + face. Eye rinsing with cold water.

### 5. Dantadhavana
Cleaning teeth. Classical brushing sticks: nimba, khadira, arka, karanja. Modern equivalent: chemical-free toothpaste. The texture (rooksha, tikta, kashaya rasa) cleans gums and stimulates salivary flow.

### 6. Jihva nirlekhana (tongue scraping)
Removes overnight ama deposit from tongue. **Single most undervalued daily practice**: shows agni status visually + has measurable oral biofilm benefit (modern dental research validates).

### 7. Gandusha + Kavala (oil pulling)
Hold sesame oil in mouth for 3-5 minutes. Strengthens gums, prevents dental caries, removes oral bacteria. Modern oil-pulling research confirms biofilm reduction.

### 8. Anjana (eye care)
Daily application of mild collyrium — savira anjana (mild) daily, rasanjana weekly. Strengthens vision; prevents accumulation of kapha in netra.

### 9. Nasya
Daily anu-taila or pratimarsha nasya (2 drops each nostril). Strengthens sinuses, prevents URTI, calms mind via olfactory pathway.

### 10. Dhuma pana
Inhalation of medicated smoke. Brimhana, shamana, or virechana type depending on need.

### 11. Abhyanga
Whole-body warm oil massage. Sesame oil (vata), coconut oil (pitta), mustard oil (kapha). 10-15 minutes daily strengthens dhatus, prevents premature ageing.

### 12. Vyayama (exercise)
*Ardha-shakti* — to half capacity (visible sweat on forehead + axilla + thigh; gentle breathlessness). Yoga, surya namaskara, brisk walk. Time: best in kapha-time (6-10 AM).

### 13. Udvartana
Powder massage (dry) post-abhyanga. Removes excess oil, scrapes kapha.

### 14. Snana
Bath. Warm water for vata, cold/lukewarm for pitta, warm for kapha. Head should generally be washed with cool water (hot head water → eye damage long term).

### 15. Sandhya-vandana / dhyana
Brief meditation or prayer. Calms the manas before entry into vyavahara.

### 16. Aahara
First meal 2-3 hours after sunrise. Should be the lightest of the day in classical text; modern Kerala practice — breakfast can be substantial if light foods.

## Midday (8:00 AM - 2:00 PM)

### 17. Vyavahara
Daily work, study, treatment of patients. Pitta-dominant time → digestion and intellect peak.

### 18. Madhyahna bhojana
Main meal between 12-2 PM. Eat only when previous meal is digested (signal: clear hunger, light feeling). Eat at home, with attention, in seated posture, not while distracted.

### 19. Brief postural rest after meal
Vama-shayana (lying on left side) for 5-10 min → aids digestion. **No sleeping** post-lunch (causes manda agni, weight gain).

## Afternoon (2:00 PM - 6:00 PM)

### 20. Vyavahara continued
Vata-dominant time → social interaction, lighter cognitive work, evening walk.

### 21. Sayam bhojana
Light evening meal ideally between 6-7 PM. Soup, kichadi, light dal. Avoid heavy, cold, fermented foods at night.

## Evening (6:00 PM - 10:00 PM)

### 22. Sandhya
Brief meditation or prayer at sunset.

### 23. Abhyanga (light)
Foot massage with sesame oil before sleep — pacifies vata, induces sleep.

### 24. Family time / reading
Calming activities. Avoid screen exposure 1 hour before sleep.

### 25. Nidra
Sleep by 10-11 PM. Vata-time of night (1-4 AM) is for deep sleep. Waking at 3 AM = vata aggravation pattern.

## Modern Lifestyle Adaptation

Strict classical dinacharya doesn't fit most modern urban professionals. The realistic priority order:

1. **Wake at consistent time** (even if not brahma muhurta)
2. **Tongue scraping + oil pulling** (5 min)
3. **Brief abhyanga** (foot + neck at minimum, 5 min)
4. **Main meal at midday** (when agni peak)
5. **Light evening meal** before 7 PM
6. **Screen-free 1 hour before sleep**
7. **Sleep before 11 PM**

These seven, sustained, give 70% of dinacharya's protective effect.

## Self-test

- List the order of morning routine from wake to first meal.
- Why is tongue scraping important physiologically?
- For a vata-prakriti patient with insomnia, which 3 dinacharya elements would you most emphasize?
- Why is sleeping after lunch contraindicated in dinacharya?`,
  },

  // ── 3rd Year ──────────────────────────────────────────────
  {
    slug: 'garbhini-paricharya',
    title: 'Garbhini Paricharya — Antenatal Care in Ayurveda',
    subjectSlug: 'prasuti-tantra',
    year: '3rd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 7,
    summary: 'Garbhini paricharya is Ayurveda\'s antenatal care protocol — month-by-month for 9 months of pregnancy. Each masa has specific diet, lifestyle, and herbal recommendations. Modern obstetrics increasingly recognises overlap with maternal nutrition science.',
    keyPoints: [
      '9-month protocol from conception to delivery',
      'Each masa has specific aahara, vihara, aushadha',
      'Garbhopaghata (deformities) prevented by masanu-masa paricharya',
      'Sthapana, vatashamana, ojas-vardhana — three key principles',
      'Kerala\'s extended paricharya continues 90 days post-partum (sutika paricharya)',
    ],
    references: [
      'Charaka Sharira Sthana 8',
      'Sushruta Sharira Sthana 10',
      'Ashtanga Hridaya Sharira Sthana 1',
    ],
    tags: ['prasuti', 'antenatal', 'garbhini', 'paricharya'],
    content: `## The Goal of Garbhini Paricharya

Charaka defines four goals (Sharira 8):
1. **Garbha-sthapana** — securing the pregnancy (preventing miscarriage)
2. **Garbha-poshana** — nourishing the foetus
3. **Garbha-rakshana** — protecting from harm (infections, exposures, malformations)
4. **Garbhini-rakshana** — protecting the mother

The framework runs from confirmation of pregnancy through delivery, with month-specific protocols.

## Month-by-Month Protocol

### Pratima Masa (1st month)
- **Aahara**: cold, sweet, liquid foods. Milk frequently. Avoid: spicy, sour, salty, fermented.
- **Vihara**: rest, avoid sudden movements, no excessive exertion.
- **Aushadha**: shadangapaniya, ksheera with shatavari kalka.
- **Goal**: stabilise the garbha (vulnerable to spontaneous abortion).

### Dvitiya Masa (2nd month)
- **Aahara**: continued sweet, cold liquid foods + small amount of meat-juice (mamsa rasa) in non-vegetarian context, otherwise enriched milk.
- **Vihara**: continued rest, no marital relations.
- **Aushadha**: ksheerapaaka with ashwagandha or jeevanti.

### Tritiya Masa (3rd month)
- **Aahara**: madhura ksheera + ghrita + cooked rice with milk (payasam-style).
- **Vihara**: gentle walk introduced.
- **Aushadha**: brimhana focus.
- **Significance**: foetal sense organs (jnanendriya) begin to form.

### Chaturtha Masa (4th month)
- **Aahara**: navaneeta (butter), ksheera, mamsa rasa, vegetarians take cooked sashtika rice + ghee + sweet preparations.
- **Vihara**: more movement allowed.
- **Aushadha**: bala-ksheera-pachana.
- **Significance**: foetal dhatus differentiate; hridaya formation.

### Panchama Masa (5th month)
- **Aahara**: ghrita + ksheera with sweet preparations.
- **Vihara**: cradle environment, calm thoughts.
- **Aushadha**: rasayana ghrita preparations.
- **Significance**: mamsa dhatu formation; foetus starts movement felt by mother.

### Shashta Masa (6th month)
- **Aahara**: gokshura ksheera, ghrita with rasayana herbs.
- **Vihara**: peaceful music, positive thoughts (foetal manas formation).
- **Aushadha**: gokshura, draksha, madhura herbs.
- **Significance**: bala (strength) + varna (complexion) develop.

### Saptama Masa (7th month)
- **Aahara**: ksheera + ghrita with shatavari, ashwagandha.
- **Vihara**: avoid heavy bathing, alcohol, excessive sexual stimulation in environment.
- **Aushadha**: special focus on rasayana for foetal majja (brain) formation.
- **Significance**: foetus is fully formed; viable.

### Ashtama Masa (8th month)
- **Aahara**: ksheera with shali rice payasam, salted barley water in small amounts.
- **Vihara**: rest, no straining, preparation for delivery.
- **Aushadha**: anuvasana basti with bala-taila — softens birth canal.
- **Significance**: foetus draws ojas from mother → mother feels weakness.

### Navama Masa (9th month)
- **Aahara**: light, easy-to-digest meals.
- **Vihara**: prepare delivery space (sutika-griha); have midwife/doctor available.
- **Aushadha**: yoni-pichu with bala-taila daily. Anuvasana basti for softening.
- **Goal**: smooth labour and delivery.

## Three Master Principles

### 1. Sthapana (stabilisation)
First trimester focus. Use madhura, sheeta, mridu dravyas. Avoid panchakarma. Treat any complications with conservative, drug-light methods.

### 2. Vatashamana (vata pacification)
Throughout pregnancy. Vata aggravation = miscarriage, premature labour, hypertensive disorders. Maintain regular meals, sleep, snigdha-ushna diet, avoid travel last trimester.

### 3. Ojas-vardhana (ojas augmentation)
Mother + foetus draw ojas from the mother's dhatu reserves. Use ojas-promoting dravyas: ksheera, ghrita, ashwagandha, shatavari, draksha, madhu. Especially critical 6th-9th months.

## Contraindications During Pregnancy

- **Strict shodhana** (vamana, virechana, basti) — generally contraindicated except teekshna anuvasana basti in 8-9th month.
- **Raktamokshana** — contraindicated.
- **Strong heating herbs** — pippali high doses, guggulu, bhallataka, asparagus alone in some cases.
- **Excessive travel** especially in 1st and 3rd trimester.
- **Strenuous exercise**, marital relations after first trimester.

## Modern Correlation

Many garbhini paricharya principles align with modern obstetric guidance:

- Frequent small meals = recommended for nausea, hypoglycaemia prevention
- Milk + ghee = calcium + DHA-equivalent for foetal brain
- Shatavari (Asparagus racemosus) = traditional galactogue; some modern evidence
- Avoid heating spices = mirror of modern caution with herbal supplements
- Rest in 3rd trimester = aligns with WHO recommendation

## Kerala's Extended Tradition

After delivery, **Sutika paricharya** continues for 45-90 days:
- Daily abhyanga with kshira-bala taila
- Specific food preparations (kanji with jeera/methi, harishina/jaggery)
- Pippali ksheerapaaka for lactation
- 41-day mother-baby seclusion period — protects newborn from infection

This is one of Kerala's distinctive contributions and is regaining popularity globally.

## Self-test

- List the 4 goals of Garbhini Paricharya.
- For the 5th month, what is the aahara recommendation?
- Why is shodhana contraindicated during pregnancy?
- Name 3 herbs commonly used in garbhini paricharya and their roles.`,
  },

  {
    slug: 'lehana-vidhi-infant-feeding',
    title: 'Lehana Vidhi — Infant Feeding and Nutrition',
    subjectSlug: 'kaumarabhritya',
    year: '3rd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 6,
    summary: 'Lehana is Ayurveda\'s protocol for stage-by-stage introduction of solids to infants. From exclusive breast milk through suvarnaprashana to mixed feeding, the protocol balances doshic effect with developmental capacity.',
    keyPoints: [
      'Stanya (breast milk) is the primary food; 0-6 months exclusive recommended',
      'Suvarnaprashana from birth — once on pushya nakshatra',
      'Solid foods introduced 5-6 months; ghee-honey lehyas first',
      'Avoid: cold, sour, salty foods first year',
      'Annaprashana ceremony marks formal rice introduction (~6 months)',
    ],
    references: [
      'Kasyapa Samhita, Khila Sthana 7',
      'Charaka Sharira 8',
      'Ashtanga Hridaya Uttara Sthana 1',
    ],
    tags: ['kaumarabhritya', 'lehana', 'paediatrics', 'infant-nutrition'],
    content: `## The Principle

Kasyapa Samhita's Khila Sthana 7 is the foundational text on infant feeding. The principle: infant aahara should match the developing infant's agni (digestive capacity), dhatu (tissue strength), and developmental stage.

## Stage 1: Stanya (Breast Milk) Only — 0-6 months

Stanya is described as the perfect food:
- Aged appropriately to the dhatu strength of the infant
- Contains all sapta dhatu nutrients
- Builds ojas
- Provides immunity (rasayana property)

**Frequency**: on demand. Cluster feeding accepted.
**Continued breastfeeding**: classical recommendation extends to 1-2 years; modern Ayurveda aligns with WHO 6-month exclusive + 2-year continued.

## Suvarnaprashana — From Birth, on Pushya Nakshatra

A signature paediatric Ayurveda practice:

- **Composition**: gold bhasma (suvarna) + ghrita + madhu + medhya rasayana herbs (brahmi, vacha, shankhapushpi)
- **Frequency**: on each pushya nakshatra day (every ~27 days)
- **Duration**: from birth to 12-16 years
- **Effects** (classical claims): improved immunity, intelligence, voice quality, complexion, longevity

**Modern research**: limited but suggestive — some studies show reduced URTI frequency in suvarnaprashana children vs controls. CCRAS has ongoing trials.

**Safety**: properly prepared suvarna bhasma (24-karat gold processed traditionally) has been studied for bioavailability; appears safe at classical paediatric doses.

## Stage 2: Lehyas Introduced — 4-6 months

The transition to solid food is gradual. The first "solids" are **lehyas** — semi-solid medicated preparations licked from a clean finger:

- **Madhu + ghrita** (equal parts only — never equal weights, as that is poison per classical texts)
- **Saraswata ghrita** in tiny amounts
- **Pinda taila / pippali-ksheera lehana** for specific indications

Frequency: small amount once a day. Tests infant's tolerance.

## Stage 3: Sashtika + Anna — 6-8 months

The **annaprashana** ceremony around 6 months formally marks rice introduction. Classical Kerala practice:

- **Sashtika shali** (60-day rice) cooked very soft, mashed
- Small amount with ksheera and small amount of saindhava lavana
- **Avoid**: spicy, fried, refrigerated, sour foods

Gradually:
- Mashed vegetables (lauki, pumpkin)
- Fruit pulp (small amounts of soft fruits)
- Dal water (moong primarily)
- Increase consistency week by week

## Stage 4: Mixed Diet — 1-2 years

By 18 months, infant is on a near-adult diet but:
- All foods must be **freshly cooked**, warm
- No reheated leftovers, no refrigerated food
- Minimal salt, no chilli powder, no fermented foods
- Continued breastfeeding alongside

## Foods to Avoid in First Year

Ayurveda is specific about contraindications in the first year:

1. **Cold foods + drinks** (vata aggravation in delicate prakriti)
2. **Honey alone in first year** (modern: botulism risk validates this)
3. **Excessive salt or sugar**
4. **Fermented foods** (idli, dosa batter, yogurt in large amounts)
5. **Sour foods** (citrus, tamarind, raw mango)
6. **Heavy meats**
7. **Raw vegetables**

## Doshic Considerations

### Vata-prakriti infants
Easily distressed, irregular feeding, light weight. Need: snigdha-ushna foods, frequent small meals, ksheera-ghrita generous.

### Pitta-prakriti infants
Easily warm, hungry frequently, prone to rashes. Need: sheeta-snigdha foods, avoid spicy, more cooling fruits.

### Kapha-prakriti infants
Plump, slow eaters, prone to colds. Need: light, deepana foods, avoid excess milk, more vegetable-based introduction.

## Galactogogue Considerations for Mother

Mother's stanya quality depends on her aahara. Stanya-vardhana (lactogenic) foods for the nursing mother:

- Shatavari ksheerapaaka
- Pippali ksheerapaaka (small amounts)
- Methi (fenugreek) seed laddoo
- Coconut-jeera kashayam
- Drumstick (moringa) leaf curry
- Garlic in small amounts

## Stage-Specific Common Issues

- **Stanya-kshaya** (low milk supply): increase mother's frequency of feeding + galactogues + rest + ksheera-pradhana diet
- **Vamana in infant**: assess feeding position, burping technique, mother's diet
- **Stana-pana virodha** (refusing breast): often relates to mother's milk quality (spicy food, anxiety) — modify mother's diet first
- **Atisara in infant**: usually from too-rich introduction; reduce ghee/milk; restore lighter foods

## Self-test

- Define lehana vidhi.
- When does annaprashana traditionally occur?
- Name 3 foods specifically avoided in the first year and the reason for each.
- For a kapha-prakriti 8-month infant prone to congestion, what dietary modifications would you make?
- What is suvarnaprashana and when is it administered?`,
  },

  {
    slug: 'visha-chikitsa-poison-management',
    title: 'Visha Chikitsa — Poison Management Principles',
    subjectSlug: 'agada-tantra',
    year: '3rd_year',
    difficulty: 'advanced',
    readTimeMinutes: 7,
    summary: 'Agada Tantra is Ayurveda\'s toxicology. Sushruta\'s 24-step visha chikitsa is the most refined snake-bite treatment in classical medicine. Kerala maintains the world\'s strongest living visha-chikitsa tradition.',
    keyPoints: [
      '2 visha categories: sthavara (plant/mineral) + jangama (animal)',
      'Sushruta\'s 24 vegas of visha — symptom-progression stages',
      '24 chikitsa steps (mantra, aushadha, mechanical, surgical)',
      'Mahagada formulations (Mritasanjeevani gutika, Bilwadi, Dushivishari)',
      'Modern: Kerala visha vaidyas still practise alongside hospital ASV protocols',
    ],
    references: [
      'Sushruta Kalpa Sthana 5-7',
      'Ashtanga Hridaya Uttara Sthana 35-38',
      'Yogaratnakara, Visha Chikitsa',
    ],
    tags: ['agada-tantra', 'visha', 'toxicology', 'snake-bite'],
    content: `## Categories of Visha

### Sthavara visha (immovable)
Plant and mineral toxins. Examples: vatsanabha (aconite), bhallataka (marking nut), shankha-puspi excess, certain mushrooms, copper sulphate.

### Jangama visha (movable)
Animal toxins. Subcategories:
- **Sarpa** (snakes) — Sushruta classifies into 80 species
- **Vrishchika** (scorpions)
- **Lutaka** (spiders)
- **Mooshaka** (rats)
- **Shvana** (rabid dogs)
- **Kanaka** (insects)

## Sushruta's 24 Vegas

Sushruta enumerates 24 progressive stages of visha vega (poison effect) after a snake bite. The first 7 are observable within minutes; later vegas progress over hours. Modern toxicology recognises similar pharmacokinetic-pharmacodynamic stages.

Vegas (selected):
1. Sharira-tashana (local burning)
2. Rakta dhatu involvement (discolouration spread)
3. Mamsa dhatu involvement
4. Meda dhatu involvement
5. Asthi-majja involvement
6. Manas vibhrama (mental disturbance)
7. Hridaya stambhana (cardiac arrest stage)

A patient at vega 1-3 has high survival; vega 6-7 is often fatal even with modern ASV.

## Treatment Principles

### Local management
1. **Arishta bandhana** — proximal tourniquet (loose, just venous flow blocked, not arterial)
2. **Pracchana** — incision over bite site (1-2 cm cross-cut)
3. **Rakta-mokshana** — bleeding to remove venom-laden blood
4. **Vamana** if recent oral ingestion
5. **Kashaya parisheka** — washing with specific kashaya (haridra, kushta)
6. **Lepa** — topical paste of agada drugs

### Systemic management
1. **Specific antidote agadas** — Bilwadi gutika, Mritasanjeevani, Dushivishari, etc.
2. **Mantra chikitsa** — Kerala visha vaidyas use specific mantras alongside aushadha
3. **Snehapana** — small amount of ghrita as anti-toxin
4. **Anjana** — eye drops to reverse some neurotoxin effects
5. **Sirovirechana** with specific nasya for neurological involvement

### Specific to species
- **Cobra (Naga) bites**: neurotoxic; focus on respiratory support + sarpagandha + ksheerakakoli decoctions
- **Russell's viper (Mandali)**: haemotoxic; focus on rakta-stambhana + manjishtha + lodhra
- **Krait (Karkotaka)**: neurotoxic + cardiotoxic; aggressive systemic agada protocol

## Classical Agada Formulations

### Mritasanjeevani Gutika
~30 ingredients including hingu, jatamansi, brahmi, vacha, gomutra-shodhita ghrita. Used for severe toxic encephalopathy.

### Bilwadi Gutika
Bilva + lashuna + black salt + others. Used for snake-bite, scorpion sting, food poisoning, viral fevers (broad antidote).

### Dushivishari Agada
26 ingredients. Specifically for chronic, low-grade, accumulated toxicity. Used in chronic skin disease, autoimmune conditions, drug overdose.

### Maha-tikta Ghrita
Bitter ghrita. Used in shighra (acute) and cumulative toxin elimination.

## Modern Integration

In Kerala today, visha vaidyas often work alongside modern emergency medicine:

- **Anti-snake venom (ASV)** is the first-line for venomous snake bites (recommended by IMA, WHO)
- **Ayurveda agada** is used **adjunctively** for residual paresis, chronic effects, recovery
- **Pre-hospital triage** by visha vaidyas in remote Kerala villages — they decide if hospital transport is needed, give first-line agada en route

Outcomes data: a 2018 retrospective study from Kerala showed that snake bite victims given **combined Ayurveda + ASV** had:
- Lower morbidity at 30 days vs ASV-only
- Faster wound healing
- Less neuropathic sequelae

(Study: Asian J Pharm Sci, vol 14(3) 2019).

This is one of the few areas where Ayurveda-allopathic integration is robust and evidence-supported.

## Other Visha Applications

### Industrial toxin exposure
Heavy metal exposure (Pb, As, Hg occupational): Dushivishari gutika + rasayana protocol over 3-6 months. Has anecdotal good outcomes.

### Modern food poisoning
Bilwadi gutika + light fasting + lemon-jeera water + electrolyte replacement.

### Spider bite
Lutaka chikitsa = local lepa + systemic mridu virechana.

### Rabies
Sushruta describes a specific protocol; modern practice is to **always defer to anti-rabies vaccination** as primary, with Ayurveda agada adjunctive.

## Self-test

- Differentiate sthavara and jangama visha with 2 examples each.
- List Sushruta's first 5 vegas of visha.
- Name 3 classical agada formulations and one indication for each.
- Why is ASV the first-line in modern snake bite treatment, and where does Ayurveda agada fit?`,
  },

  {
    slug: 'deergha-jeeviteeya-adhyaya',
    title: 'Deergha Jeeviteeya Adhyaya — Longevity Chapter Summary',
    subjectSlug: 'charaka-samhita',
    year: '3rd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 8,
    summary: 'Charaka opens his Samhita with this chapter on longevity (Sutra 1). The entire system of Ayurveda is set out here: definitions of swastha and roga, the doctrine of ayus and its 4 types, doshic theory, treatment principles. This is the most important single chapter in Ayurveda literature.',
    keyPoints: [
      'Opens with: ayushkamaiya — "those desiring life" — defines audience',
      '4 types of ayus: hita, ahita, sukha, dukha',
      'Definitions of dosha, dushya, agni, srotas — entire Ayurveda taxonomy',
      'Trayopastambha (3 supports): aahara, nidra, brahmacharya',
      'Triavarjaneeya bhava (3 things to avoid): kala, buddhi, arthapariksha errors',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 1 — Deergha Jeeviteeya Adhyaya',
      'Chakrapani commentary',
      'Modern translations: Sharma & Dash; Bhagwan Dash',
    ],
    tags: ['charaka', 'samhita', 'longevity', 'philosophy'],
    content: `## Opening

> *Aayuhuasti chetana yat na rogah na cha chetanam* — "Ayus is that which exists as long as there is consciousness without disease and dissolution."

The chapter opens with a description of how the rishis convened at Himalaya, addressing the problem of human suffering. They identify Ayurveda — *ayuh-jnanam* — the knowledge of life.

This is the single most important opening in Ayurveda literature. Every subsequent chapter and treatise builds on the definitions established here.

## Definition of Ayus

Charaka defines ayus as the *sanyoga* (union) of:
1. **Sharira** — body
2. **Indriya** — senses
3. **Atma** — soul
4. **Manas** — mind

When all four are in concordant union, ayus exists. Disease is the disturbance of any of these or their relations.

## Four Types of Ayus

### 1. Hita ayus — beneficial life
Life lived according to dharma + artha + kama in balance with the rules of swastha. Long, content, useful to society.

### 2. Ahita ayus — harmful life
Life filled with adharma, harmful actions to self + others. Long perhaps, but suffering and creating suffering.

### 3. Sukha ayus — pleasant life
Life with health, family, prosperity, mental peace. The desirable life.

### 4. Dukha ayus — suffering life
Life of disease, poverty, anxiety, dependency. The undesirable life.

The four combine in nine permutations (hita-sukha, hita-dukha, ahita-sukha, ahita-dukha, and lengths varying). The doctor's role is to enable hita + sukha ayus.

## Definitions Laid Out

The chapter establishes the entire vocabulary:

- **Dosha**: vata, pitta, kapha — the 3 humoral substances
- **Dhatu**: 7 stable tissues (rasa, rakta, mamsa, meda, asthi, majja, shukra)
- **Mala**: 3 main waste products (mootra, purisha, sweda)
- **Agni**: 13 types of digestive/metabolic fire
- **Srotas**: channels through which substances flow
- **Indriya**: 5 jnanendriya + 5 karmendriya + manas

## Trayopastambha (Three Pillars)

The 3 pillars supporting health:

### 1. Aahara (food)
Properly digested, properly chosen, properly timed food is the first pillar. *Annam vai aushadham* — food itself is medicine.

### 2. Nidra (sleep)
> *Nidra ayuhsthithi-hetu* — "Sleep is the cause of sustenance of life"

Quality + quantity + timing of sleep is the second pillar.

### 3. Brahmacharya (regulated reproductive energy)
Not strict celibacy as commonly mistranslated — but **regulated** use of reproductive function according to dharma + season + health. The third pillar of long-term ojas preservation.

## Triavarjaneeya Bhava (Three Things to Avoid)

The three causes of all disease, per Charaka:

### 1. Kala — wrong action with respect to time
Eating winter foods in summer; sleeping when one should be awake; exercising at wrong times; ignoring seasonal cycles.

### 2. Buddhi — wrong action with respect to intelligence
Acting against knowledge — e.g., a doctor knowing food X aggravates a patient's condition and prescribing it anyway. Includes pragnaparadha (the most important — failure of intellect).

### 3. Arthendriyartha — wrong sensory engagement
Excess, deficient, or perverse use of senses. Examples: chronic loud noise exposure, excessive screen time, sensory deprivation. The senses must be used in their proper measure.

These three are the **root causes** of all disease in Charaka's framework. Every specific disease etiology can be traced to one or more.

## Definition of Swastha

The Charakian definition of health (later elaborated in Sushruta but introduced here):

> *Sama-doshah sama-agnish-cha sama-dhatu-mala-kriyaha,*
> *prasanna-atma-indriya-manah, swastha iti abhidheeyate.*

"He whose doshas are in balance, whose agni is balanced, whose dhatus and malas function in balance, AND whose atma, indriyas, and manas are pleasant — that person is called swastha."

**Critical observation**: swastha is defined biologically AND psychologically AND spiritually. A physically healthy but mentally disturbed person is NOT swastha. This is Ayurveda's distinctive holistic definition.

## Definition of Roga

> *Nidana-yukta-mithya-akrira shareera-manasa-vikarah rogah*

"Disease is the deviation/abnormality of body or mind caused by misappropriate causes."

## The Doctor's Qualifications

Charaka enumerates the qualifications of a good Ayurveda physician (vaidya) in this chapter:

1. **Shastra-bodha** — knowledge of texts
2. **Drishta-karma** — observed clinical practice
3. **Dhairya** — patience, composure
4. **Sadhana sampatti** — adequate tools (medicines, instruments)
5. **Atma jnana** — self-knowledge, ethical reasoning

The chapter emphasises **chikitsa-chatushpada** — four pillars of treatment:
1. Bhishak (qualified doctor)
2. Aushadha (appropriate medicine)
3. Upastha (good attendant)
4. Rogi (cooperative patient)

When all four pillars are intact, healing happens. Even the best medicine fails if the doctor is incompetent, the attendant negligent, or the patient non-compliant.

## Why This Chapter Matters

Every subsequent BAMS subject — Dravyaguna, Roga Nidana, Kayachikitsa, Panchakarma — assumes the framework Charaka establishes here. The student who internalises this chapter has the conceptual scaffolding for all of Ayurveda.

It is also the chapter examiners most frequently draw essay questions from. KUHS, RGUHS, MUHS all weight this chapter heavily.

## Self-test

- Define ayus per Charaka.
- List the four types of ayus.
- What is the Charakian definition of swastha (recall the sloka if possible)?
- Name the trayopastambha and their role.
- What is pragnaparadha and why is it considered the most important cause of disease?
- List the chikitsa-chatushpada.`,
  },

  {
    slug: 'kiyanta-shiraseeya-classification',
    title: 'Kiyanta Shiraseeya — Classification of Diseases',
    subjectSlug: 'charaka-samhita',
    year: '3rd_year',
    difficulty: 'intermediate',
    readTimeMinutes: 6,
    summary: 'Sutra Sthana 17 of Charaka — Kiyanta Shiraseeya Adhyaya — gives the systematic classification of diseases. Five major categorisations: by dosha, by location, by aetiology, by chronicity, by curability. This is the conceptual map of all roga in Ayurveda.',
    keyPoints: [
      'Disease classification framework — basis for entire chikitsa system',
      '5 classification axes: dosha, sthana, hetu, kala, sadhya-asadhya',
      'Doshic classification: vataja, pittaja, kaphaja, samsargaja, sannipataja',
      'Sadhya (curable) → kricchsadhya → yapya → asadhya',
      'Determining sadhyata before chikitsa = first ethical duty of vaidya',
    ],
    references: [
      'Charaka Samhita, Sutra Sthana 17 — Kiyanta Shiraseeya',
      'Madhava Nidana — disease-by-disease application',
      'Chakrapani commentary',
    ],
    tags: ['charaka', 'classification', 'roga-nidana'],
    content: `## The Question

Charaka opens this chapter with the question: *kiyanta shiraseeyaha rogaah* — "how many head-located diseases are there?" This becomes the framing for a much larger discussion on how all diseases should be enumerated and classified.

The chapter answers by giving 5 systematic classifications of disease — the conceptual map every BAMS student must internalise.

## Classification 1: By Dosha

### Eka-doshaja (single dosha)
- **Vataja roga** — 80 examples enumerated (vata-vyadhi)
- **Pittaja roga** — 40 enumerated
- **Kaphaja roga** — 20 enumerated

### Dvi-doshaja (samsargaja — combined two)
- **Vata-pittaja** — most common combination clinically
- **Vata-kaphaja** — common in winter, ageing
- **Pitta-kaphaja** — common in obese with hypertension

### Tri-doshaja (sannipataja)
All three doshas vitiated. Often severe disease (sannipata jvara is the model). 13 sub-classifications based on dosha proportions.

This is the most clinically used classification — every patient's vikriti is first read at this level.

## Classification 2: By Sthana (Location)

### Sharirika roga
Body-located diseases. Sub-classified by:
- **Avayava** (organ): hridroga (heart), netra roga (eyes)
- **Dhatu**: rasa-pradoshaja, rakta-pradoshaja, etc.
- **Srotas**: pranavaha sroto-vyadhi (respiratory), annavaha sroto-vyadhi (digestive), etc.
- **Marma**: marmagata roga (vital point disorders — often serious)

### Manasika roga
Mind-located diseases. Sub-classified by:
- **Triguna**: rajasika (anxiety, anger, lust spectrum), tamasika (depression, lethargy spectrum)
- **Manas-pradoshaja**: kama, krodha, lobha, moha, irshya, mada, shoka, chinta, udwega, bhaya

### Agantuja roga
Externally caused. Trauma, snake bite, infections, accidents.

## Classification 3: By Hetu (Aetiology)

### Nija (intrinsic) roga
Caused by doshic disturbance from within. Most chronic disease.

### Agantuja (extrinsic) roga
External cause that then triggers doshic disturbance:
- Bhautika (physical injury, accidents)
- Aupasargika (infectious — contagion theory in classical Ayurveda)
- Visha (poisoning)
- Bhuta (psychiatric — broadly interpreted)

This nija-agantuja distinction matters: in agantuja, treating the external cause is primary; nija requires deep doshic reasoning.

## Classification 4: By Kala (Chronicity)

### Navotpadya / Adyatana roga
Acute, recently arisen. Vata-pitta dominant typically. Aggressive shamana + langhana approach.

### Madhyama
Sub-chronic, weeks to months. Mixed approach.

### Chirakaala / Jeerna roga
Chronic, established. Often kapha-vata dominant; ama involvement common. Slow systematic shodhana + rasayana approach.

### Kaalantarothpadya
Disease arising with seasonal/circadian cycle — vata vyadhi in winter, pitta vyadhi in summer-autumn.

## Classification 5: By Sadhya-Asadhya (Curability)

This is the most clinically important classification. Charaka divides all diseases by curability:

### Sadhya (curable)
- **Sukha-sadhya** — easily curable. Single dosha, recent onset, healthy patient, no complications. Most acute fevers in young patients.
- **Kricchsadhya** — curable with difficulty. Multi-dosha, sub-chronic, partially healthy patient, some complications. Many chronic conditions early-stage.

### Asadhya (incurable)
- **Yapya** — controllable but not curable. Manageable with lifelong treatment. Chronic diabetes, controlled HTN, well-managed RA.
- **Pratiyatya** / **Anupakrama** — incurable, not even amenable to control. Terminal disease, severe sannipata jvara, severe marma-injury.

## The Doctor's First Duty

Charaka explicitly says: *prathama eva sadhyatva-nirupanam karyam* — "first determine curability."

The reasoning:
- Treating asadhya as sadhya = wastes patient resources, gives false hope, often hastens death
- Treating yapya as sadhya = same problem
- **Refusing treatment of asadhya** is sometimes the ethical action

A senior physician's mark is honest sadhyata assessment.

## Modern Correlations

The Ayurveda classification framework corresponds approximately to:

| Ayurveda | Modern equivalent |
|---|---|
| Sukha-sadhya | Acute self-limiting / fully treatable |
| Kricchsadhya | Curable with multi-modal therapy |
| Yapya | Chronic, controllable (diabetes, HTN) |
| Asadhya | Terminal, palliative-care candidates |

Many diseases shift category over time. A type 2 diabetes detected very early may be sukha-sadhya through lifestyle. The same diabetes with complications becomes yapya. Untreated for decades with severe sequelae — asadhya.

## Clinical Application

When a new patient presents:

1. **Identify dosha** (eka, samsarga, sannipata)
2. **Identify sthana** (sharirika/manasika/agantuja)
3. **Identify hetu** (nija/agantuja)
4. **Identify chronicity**
5. **Determine sadhyata**

Only then proceed to treatment selection. This is the senior physician's mental flowchart for every case.

## Self-test

- List the 5 classification axes from Kiyanta Shiraseeya.
- Differentiate samsargaja and sannipataja roga.
- Define yapya disease with one modern example.
- Why does Charaka emphasise sadhyata determination as the first duty?
- A 35-year-old with newly diagnosed type 2 diabetes + mild symptoms — what classification category and treatment approach?`,
  },

  // ── Final Year ─────────────────────────────────────────────
  {
    slug: 'prameha-chikitsa-diabetes-protocol',
    title: 'Prameha Chikitsa — Diabetes Management Protocol',
    subjectSlug: 'kayachikitsa',
    year: 'final_year',
    difficulty: 'advanced',
    readTimeMinutes: 9,
    summary: 'Prameha is Charaka\'s 20-subtype classification of urinary disorders that maps closely to modern diabetes spectrum. Treatment is staged: nidana parivarjana → langhana → deepana-pachana → specific shamana → rasayana → lifelong pathya. The Ayurvedic approach addresses metabolic syndrome holistically.',
    keyPoints: [
      'Prameha 20 types: 10 kaphaja, 6 pittaja, 4 vataja',
      'Pre-diabetes = sthaulya/medo-roga; diabetes = madhumeha (vata stage)',
      '6-step treatment: nidana parivarjana → langhana → deepana → shamana → shodhana → rasayana',
      'Lifestyle is 70% — diet + exercise > medication',
      'Yoga + pranayama + meditation evidence-based adjuncts',
    ],
    references: [
      'Charaka Chikitsa 6 — Prameha Chikitsa',
      'Sushruta Chikitsa 12-13',
      'Modern: CCRAS multi-centric prameha trials 2021-23',
    ],
    tags: ['kayachikitsa', 'prameha', 'diabetes', 'chronic-disease'],
    content: `## The Classification

Prameha (literally "excessive urination") includes 20 subtypes that span what modern medicine calls:
- Pre-diabetes
- Type 2 diabetes mellitus
- Type 1 diabetes mellitus (less commonly — though Charaka recognises a similar wasting picture)
- Diabetic complications
- Some genitourinary disorders

### Doshic classification
- **Kaphaja prameha** (10 types) — early stage, modern obesity + insulin resistance + pre-diabetes
- **Pittaja prameha** (6 types) — established type 2 + complications stage
- **Vataja prameha** (4 types) — late-stage with wasting, peripheral neuropathy, end-organ damage. **Madhumeha** (sweet urine) belongs here.

The dosha-stage progression maps remarkably well onto modern T2DM progression: insulin resistance → established disease → complications.

## Etiology

Classical nidana:
1. **Aahara**: madhura, snigdha, guru, dadhi, mamsa, fish, paayasam, navaanna (new grains), gud
2. **Vihara**: asyaasukha (sedentary luxury), prasvapna (excess sleep), ratri-jagrana
3. **Manas**: chinta (worry), shoka (grief)
4. **Hereditary**: kuleeya prameha — runs in families
5. **Sahaja**: from birth — corresponds to type 1 + monogenic types

Recognise: this is basically the modern metabolic syndrome description.

## The 6-Step Treatment Protocol

### Step 1: Nidana Parivarjana (cause removal)
- Stop the offending diet immediately. No negotiation on this.
- Address lifestyle. Sedentary luxury must end.

### Step 2: Langhana (lightening)
- For kaphaja (overweight) prameha. Reduce caloric intake substantially.
- Modern equivalent: very-low-calorie diet (VLCD) under supervision, 800-1200 kcal for 8-12 weeks.
- Increase activity 2x baseline if tolerated.

### Step 3: Deepana-Pachana (kindle agni + digest ama)
- Trikatu (shunthi + pippali + maricha) churnam — small dose before meals
- Chitrakadi vati
- Hingvashtaka churnam in food
- Goal: restore agni so subsequent dravyas can work

### Step 4: Vyadhi-Vipareeta Shamana (specific dosha-pacification)

**For kaphaja prameha**:
- Triphala + guggulu + trikatu combinations
- Vasanta kusumakar rasa (with caution — contains parada bhasma)
- Madhuka asava
- Gokshuradi guggulu

**For pittaja prameha**:
- Vasaguduchyadi kashayam
- Pravala panchamrut
- Avoid heating prameha herbs

**For vataja prameha (madhumeha)**:
- Brimhana + vata-pacifying
- Ashwagandha + bala ksheerapaaka
- Snigdha rasayana approach
- This stage requires **insulin support typically** — Ayurveda is adjunctive

### Key single herbs (evidence-supported)

- **Vijayasara** (Pterocarpus marsupium) — bark kashaya; multiple modern trials show 0.5-1% HbA1c reduction
- **Methika** (Trigonella foenum-graecum) — seed powder 5g twice daily; insulin sensitivity improvement
- **Karela** (Momordica charantia) — fruit juice; mild glucose-lowering
- **Jamun** (Syzygium cumini) — seed powder; classical first-line
- **Gudmar** (Gymnema sylvestre) — leaves; reduces sweet taste perception + glucose absorption
- **Haridra** (Curcuma longa) — anti-inflammatory; useful for diabetic complications

### Step 5: Shodhana (cleansing) — when appropriate
- **Vamana** for kapha-dominant prameha with significant ama
- **Virechana** for pitta-dominant
- **Niruha basti** for vata-dominant + neurological complications
- **Raktamokshana** for severe diabetic dermatological complications
- **Contraindicated** in: severe wasting, end-stage organ failure, severe nephropathy

### Step 6: Rasayana (lifelong tonic)
After acute management, the patient transitions to long-term rasayana:
- Chyavanaprasha (small daily dose, glucose-monitored)
- Brahma rasayana
- Triphala (mild laxative + antioxidant)
- Plus continued dravya for specific glucose control
- Yoga + pranayama + meditation are explicit rasayana components

## Modern Integration

**The modern reality**: most BAMS practitioners now manage diabetes with Ayurveda **adjunctive** to modern medications (metformin, etc.) rather than as monotherapy.

Best-evidence integrated approach:
1. **Metformin** as first-line standard care
2. **Vijayasara + methika + gymnema** as Ayurveda adjunct → typically allows lower metformin dose
3. **Strict lifestyle + dietary intervention** Ayurveda-guided
4. **Yoga 5-6 days/week** — strong evidence base
5. **Monthly monitoring** — fasting + post-prandial glucose, HbA1c quarterly
6. **Refer to endocrinologist** for: poorly controlled HbA1c > 9%, ketoacidosis risk, severe complications

This integrated approach often achieves better outcomes than either alone.

## Dietary Protocol

**Allowed (encouraged)**:
- Yava (barley), kodrava (kodo millet), shyamaka, raktashali — all low GI grains
- Mudga (green gram), masoora — pulses
- Karavellaka (bitter gourd), patola, vegetable curries
- Triphala, jambhula — fruits
- Saindhava lavana, panchakola sneha for cooking

**Restricted**:
- New grains, polished rice
- All milk products in excess
- Aamla rasa fruits (mango, grape) in season
- Sweet preparations
- All deep-fried foods

## Yoga Recommendations

Evidence-supported asanas: ardha matsyendrasana, mayurasana, paschimottanasana, sarvangasana (caution if HTN), surya namaskar.

Pranayama: anulom-vilom, bhramari, kapalabhati (caution — not for late-stage uncontrolled DM).

Meditation: 20 minutes daily — measurable HbA1c reduction in multiple studies.

## Self-test

- List the 3 doshic categories of prameha and their stage correspondence to modern T2DM.
- What is madhumeha and which dosha does it represent?
- Give the 6-step treatment protocol for prameha.
- Name 3 evidence-supported Ayurveda herbs for diabetes and the mechanism for each.
- When is shodhana contraindicated in prameha?`,
  },

  {
    slug: 'yantra-shastra-surgical-instruments',
    title: 'Yantra and Shastra — Surgical Instruments of Sushruta',
    subjectSlug: 'shalya-tantra',
    year: 'final_year',
    difficulty: 'intermediate',
    readTimeMinutes: 7,
    summary: 'Sushruta describes 101 yantras (blunt instruments) + 20 shastras (sharp instruments) for surgical practice. The classification by purpose + design is remarkably systematic. Modern surgical instruments often mirror Sushruta\'s descriptions.',
    keyPoints: [
      '101 Yantras (blunt) + 20 Shastras (sharp) — total 121 instruments',
      '6 yantra classifications: swastika, sandansha, tala, nadi, shalaka, upayantra',
      'Shastra qualities: 6 specifications for ideal cutting instrument',
      'Sushruta\'s surgical curriculum: 8 cadaver dissection + clay model practice',
      'Modern equivalence: cusco speculum ≈ Sushruta\'s nadi yantra',
    ],
    references: [
      'Sushruta Sutra 7-8 — Yantra and Shastra Vidhi',
      'Sushruta Sharira 5 — surgical anatomy training',
      'Modern: Toledo D. History of Plastic Surgery',
    ],
    tags: ['shalya', 'sushruta', 'surgery', 'instruments'],
    content: `## Sushruta's Surgical Legacy

Sushruta (~6th century BCE) is the world's first systematic surgical text. He describes:
- 8 categories of surgical procedure (chedya, bhedya, lekhya, vedhya, eshya, ahrya, visravya, seevya)
- 101 yantras (blunt instruments)
- 20 shastras (sharp instruments)
- Surgical training methodology — cadaver dissection + clay model practice
- Pre-operative + post-operative care
- Sterilisation by heating

Italian plastic surgeon Aglio (1816) credited Sushruta as the founder of plastic surgery after observing Indian rhinoplasty techniques.

## Yantras — 6 Categories

### 1. Swastika Yantra (24 types)
Cross-shaped instruments. Used for grasping/extracting bones, foreign bodies. Modern equivalent: bone-holding forceps, Allis forceps.

Designs include: simha mukha (lion-mouth), vyaghra mukha (tiger-mouth), kakshapa (turtle-shaped).

### 2. Sandansha Yantra (2 types)
Tweezers/forceps. Used for grasping foreign bodies, hair removal. Modern equivalent: dissection forceps, splinter forceps.

Two subtypes: salakshana (with finer points) and nirlakshana (without).

### 3. Tala Yantra (2 types)
Spoon-like instruments. Used for examining ear/nose passages, removing wax, foreign bodies. Modern equivalent: ear curette, nasal speculum.

### 4. Nadi Yantra (20 types)
Tubular/hollow instruments. Used for examining body cavities — rectum, vagina, urethra. Modern equivalent: speculum (Cusco, Sims), proctoscope, catheter.

Sushruta's vaginal speculum descriptions match the structure of modern Cusco speculum remarkably.

### 5. Shalaka Yantra (28 types)
Rod-like probes. Used for probing fistulae, applying medications, exploring deep wounds. Modern equivalent: probe, fistula probe, applicator.

Subtypes by tip:
- Sikta — pointed
- Mridu — blunt
- Pratata — curved
- Etc.

### 6. Upayantra (25 types)
Auxiliary instruments. Includes: cotton swabs, ropes, ladders, supports for patient positioning. Modern equivalent: gauze, retractors, head clamps.

## Shastras — 20 Sharp Instruments

Classical 20 sharp instruments:

1. **Mandalagra** — ring-shaped cutting blade (for circular incisions, circumcision)
2. **Karapatra** — saw (for bone cutting)
3. **Vriddhipatra** — cutting blade (general use)
4. **Nakhashastra** — nail-shaped (for fine cuts)
5. **Mudrika** — ring blade (small incisions)
6. **Utpalapatra** — lotus-petal shaped (for excisions)
7. **Ardhadhara** — half-edged (one-sided cutter)
8. **Suchi** — needle (for suturing)
9. **Kushapatra** — kusha grass leaf shape (fine fistula exploration)
10. **Atimukha** — kite-beak shape
11. **Sarari mukha** — kingfisher-beak shape
12. **Antarmukha** — internally-curved (for deep cavity work)
13. **Trikurchaka** — three-pronged (for hookworm removal)
14. **Kuthari** — axe-shape (for large excisions)
15. **Vrihimukha** — paddy-grain shape (for incision drainage)
16. **Aravamukha** — saw-tooth (rough cutting)
17. **Vetasapatra** — willow-leaf shape (fine surgery)
18. **Badisha** — fish-hook (for foreign body extraction)
19. **Dantashanku** — tooth-pick (for dental work)
20. **Eshani** — exploration probe with cutting edge

## The 6 Qualities of an Ideal Shastra

Sushruta specifies:
1. **Tikshnata** — sharpness
2. **Sukshmata** — fineness of edge
3. **Nirmalata** — cleanliness, polish
4. **Saumya darshana** — pleasant appearance (the patient sees the instrument)
5. **Suvarna** — good handle grip
6. **Apratidanditva** — non-discordant; well-balanced

A senior surgeon checks every instrument against these 6 qualities before procedure.

## Sterilisation Methods

Sushruta describes pre-sterilisation methods that modern microbiology would recognise:

- **Heating in flame** before use (thermal sterilisation)
- **Washing with kashaya** of haridra, lodhra, neem (antimicrobial)
- **Storage in clean cloth wrapping** with dried herbal powders (preservation)
- **Drying in sun before storage** (UV sterilisation)

This pre-dates Joseph Lister's antiseptic surgery (1867) by 2500 years.

## Surgical Training

Sushruta requires students to practice before operating on humans:

- **Cucumber / gourd** — for chedya (incision) practice
- **Leather bag with water** — for bhedya (cleaving) practice
- **Stretched skin on frame** — for vedhya (puncture) practice
- **Wax-coated cloth** — for seevya (suturing) practice
- **Clay models** — for shalaka (probing) practice
- **Cadaver dissection** — 1 standard cadaver per surgical student

The Sushruta-mandated training is remarkably similar to modern surgical wet labs.

## Modern Lessons

Several Sushruta surgical techniques are still in use or being rediscovered:

1. **Rhinoplasty** — Sushruta's flap technique is the historical basis for modern Indian rhinoplasty methods
2. **Cataract surgery** — couching technique was Sushruta's; modern phaco surgery is conceptually distinct but uses similar pre-op assessment
3. **Cleft lip repair** — Sushruta's vurudhha karma is among the earliest descriptions
4. **Bone setting** — sandhana karma (12 fracture reduction techniques) still influences traditional bone setters in rural India

## Self-test

- Name the 6 categories of yantra.
- List the 20 shastras (target: by exam time).
- Give the 6 qualities of an ideal shastra.
- Name one yantra and its modern equivalent.
- Describe Sushruta's pre-sterilisation method.`,
  },

  {
    slug: 'netra-roga-ayurvedic-ophthalmology',
    title: 'Netra Roga — Ayurvedic Ophthalmology Overview',
    subjectSlug: 'shalakya-tantra',
    year: 'final_year',
    difficulty: 'intermediate',
    readTimeMinutes: 7,
    summary: 'Shalakya Tantra covers ENT + ophthalmology + dental. Netra Roga (eye disease) is its most developed subdiscipline. Sushruta enumerates 76 eye diseases by anatomical part. Treatment includes anjana (collyria), netra tarpana, vidalaka, and surgical procedures.',
    keyPoints: [
      'Sushruta lists 76 netra rogas by anatomical part',
      '5 anatomical zones: sandhi (joints), vartma (lids), shukla (sclera), krishna (cornea+iris), drishti (lens+vitreous)',
      'Treatment categories: bidalaka, ashchyotana, anjana, putapaka, tarpana, seka',
      'Cataract treatment: Sushruta\'s couching procedure historical milestone',
      'Modern: tarpana with triphala ghrita evidence for dry eye + computer vision syndrome',
    ],
    references: [
      'Sushruta Uttara Tantra 1-19 — Netra Roga Chikitsa',
      'Ashtanga Hridaya Uttara Sthana 8-16',
      'Modern: tarpana RCTs in dry eye J Ayurveda Integr Med',
    ],
    tags: ['shalakya', 'netra-roga', 'ophthalmology'],
    content: `## Anatomical Framework

Sushruta divides the eye into **5 mandala** (zones):

1. **Pakshma mandala** — eyelashes + lid margins
2. **Vartma mandala** — eyelids
3. **Shweta mandala** — sclera + conjunctiva
4. **Krishna mandala** — cornea + iris
5. **Drishti mandala** — lens + vitreous + retina

And **6 sandhi** (joint regions where 2 zones meet) at the corners.

This makes a systematic disease enumeration possible: each disease is named by which mandala/sandhi it involves.

## The 76 Netra Roga (selected)

### Sandhigata (junctional) — 9 diseases
- Puyalasa (purulent discharge from canthi)
- Upanahaha (chronic inflammation)
- Parvanika (chronic granulomas)

### Vartmagata (eyelid) — 21 diseases
- Stibdha-vartma (rigid lid)
- Sirajala (extensive vascularity)
- Anjana namika (stye / hordeolum)
- Vartmavabandha (entropion/ectropion equivalent)
- Lagana (chalazion)

### Shuklagata (sclera/conjunctiva) — 11 diseases
- Snayu arma (pterygium)
- Sira pidaka (conjunctival haemorrhage)
- Avalambika (subconjunctival mass)

### Krishnagata (cornea/iris) — 5 diseases
- Sirotapata (vascular invasion of cornea)
- Akshipakatyaya (uveitis)

### Sarvagata (all-zone) — 17 diseases
- Adhimantha (acute angle closure glaucoma — though specific subtype debated)
- Adhi-nimesha (frequent blinking)
- Hatadhimantha (long-standing glaucoma)
- Vata-paryaya (random pain)

### Drishtigata (lens/vitreous/retina) — 12 diseases
- **Timira** — early cataract (graded 1-3 by severity)
- **Linganasha** — full cataract requiring surgery
- Some retinal disorders

### Bahya roga (external) — 1 disease

## Diagnostic Approach

1. **Lakshana parikshana** — symptom assessment
2. **Mandalik parikshana** — which zone is involved
3. **Doshic assessment** — vataja (sharp pain, dry, irregular), pittaja (burning, redness, photophobia), kaphaja (mucus, swelling, blurry vision), raktaja (haemorrhage, pain)
4. **Sadhya-asadhya determination** — early timira sadhya, linganasha kricchsadhya, retinal detachment generally asadhya in classical text

## Treatment Modalities

### 1. Ashchyotana (eye drops)
Liquid kashaya dripped into eye. Indications: dryness, allergic conjunctivitis, infective conjunctivitis early stage.

Common formulations:
- **Triphala kashaya ashchyotana** — daily for digital eye strain
- **Yashtimadhu kashaya** — pittaja netra roga
- **Madhuyashti ksheera** — chronic mild conjunctivitis

### 2. Bidalaka (paste application on closed lid)
External application. Indications: lid swelling, stye, mild conjunctivitis.

Common formulations:
- **Triphala churnam + ghrita lepa** — eye lid swelling
- **Lodhra churnam + madhu** — chronic blepharitis

### 3. Anjana (collyrium)
Direct application into conjunctival sac. Types:
- **Lekhana anjana** (scraping) — for kapha-pradhana with discharge
- **Ropana anjana** (healing) — chronic ulceration
- **Prasadana anjana** (clarifying) — vision strengthening

**Souviranjana** (mild collyrium) — daily use protective
**Rasanjana** (medicated) — weekly therapeutic

### 4. Tarpana (eye nourishment)
The hallmark Ayurveda eye procedure. Method:
1. Ring of dough placed around eye
2. Medicated ghrita warmed and poured into ring
3. Patient lies supine, eye open, ghrita covers eye 5-30 min
4. Drain, gentle cleansing

Indications:
- **Dry eye syndrome**
- **Computer vision syndrome / digital eye strain**
- **Early cataract** (timira)
- **Post-LASIK dryness** (modern use)
- **Glaucoma management** (controlled studies)

Common formulations:
- **Triphala ghrita** — first-line
- **Jeevantyadi ghrita** — chronic dry eye
- **Patoladi ghrita** — pittaja conditions

**Modern evidence**: Several RCTs published 2015-2024 show statistically significant improvement in dry eye Schirmer test + symptom scores after 7-21 day tarpana protocols. Effects last 3-6 months.

### 5. Putapaka (eye fumigation with hot poultice)
Indications: chronic external eye disease, post-operative recovery.

### 6. Seka (continuous pouring of cold/warm liquid)
Indications: acute inflammation, foreign body sensation.

## Sushruta's Cataract Surgery

The most famous Shalakya procedure. The classical **couching** technique:

1. Patient seated facing east, morning light
2. Anaesthesia: pranayama + light alcohol (classical — modern: topical anaesthetic)
3. Patient lid stretched + eye fixed
4. **Yava-vrana shastra** — small curved needle
5. Needle inserted from sclera (1 yava distance from limbus), advanced gently
6. Lens displaced inferiorly into vitreous (couching)
7. Eye lavaged with breast milk kashaya
8. Bandaging for 7 days
9. Recovery + visual rehabilitation

**Outcome**: vision improvement was real but the technique had long-term complications (glaucoma, lens-induced uveitis). Modern phacoemulsification has replaced it. But Sushruta's technique was practised in India for ~2000 years and was an established cure when European medicine had no answer for cataract.

## Daily Eye Care (preventive)

Ayurveda recommends daily:
- **Cold water splashing** to face + eyes (morning)
- **Triphala-water eye wash** weekly
- **Daily anjana** (mild — souviranjana)
- **Avoid prolonged screen exposure** without 20-20-20 rule
- **Padabhyanga** (foot massage) at night — classical claim of indirect eye health

## Self-test

- Name the 5 mandala of the eye.
- Differentiate timira and linganasha.
- List the 6 main treatment modalities.
- Describe the tarpana procedure.
- Name 3 modern conditions where tarpana has evidence-supported use.`,
  },

  {
    slug: 'vamana-karma-procedure',
    title: 'Vamana Karma — Complete Procedure and Indications',
    subjectSlug: 'panchakarma',
    year: 'final_year',
    difficulty: 'advanced',
    readTimeMinutes: 9,
    summary: 'Vamana is therapeutic emesis — controlled vomiting to expel aggravated kapha + ama. The complete procedure spans 7-10 days: poorva karma (preparation), pradhana karma (procedure), paschat karma (recovery). Mastery requires understanding patient selection, dose escalation, and complication management.',
    keyPoints: [
      'Indication: kapha-pradhana diseases — chronic asthma, eczema, obesity, sinusitis',
      '3 phases: poorva karma (3-7 days) → pradhana karma (1 day) → paschat karma (3-7 days)',
      'Snehapana ascending dose 5 days — agni and dhatu agni assessment',
      'Vega counting: 6-8 vegas = samyak vamana; <6 = ayoga; >8 = atiyoga',
      'Strict contraindications: pregnancy, bleeding disorders, severe debility',
    ],
    references: [
      'Charaka Kalpa Sthana 1',
      'Sushruta Chikitsa 33',
      'Ashtanga Hridaya Sutra 18',
    ],
    tags: ['panchakarma', 'vamana', 'shodhana', 'therapy'],
    content: `## Indications and Contraindications

### Indications (rogi pariksha)
- **Chronic asthma + bronchitis** (tamak shwasa, kasa) with kapha dominance
- **Skin disorders** with kapha-dominance: eczema (vicharchika), urticaria (kotha), psoriasis (mandala kushtha)
- **Sinusitis + chronic rhinitis** (kapha-vata)
- **Diabetes + obesity** (sthaulya, kaphaja prameha)
- **Hyperacidity with kapha symptoms** (uncommon)
- **Chronic depression + lethargy** (tamasika manas dushti)

### Contraindications (rogi-asyaata)
**Absolute**:
- Pregnancy
- Bleeding disorders (hemophilia, thrombocytopenia)
- Recent myocardial infarction
- Severe debility, malnutrition
- Active peptic ulcer
- Pulmonary hemorrhage
- Children under 12 (some texts) and elderly over 75
- Vata-pradhana constitution

**Relative**:
- Recent surgery (<3 months)
- Active TB
- Hypertension uncontrolled
- Severe anxiety/depression — need psychiatric assessment first

## Patient Preparation — Poorva Karma (3-7 days)

### Day 1-3: Deepana-Pachana
- Trikatu churnam 1g before meals
- Light diet — kichadi, vegetable soup
- Goal: improve agni, digest existing ama

### Day 4-8: Snehapana (oleation)
- **Day 1**: 30 ml ghrita (cow ghee or medicated like Mahatikta ghrita) on empty stomach early morning
- **Day 2**: 50 ml
- **Day 3**: 75 ml
- **Day 4**: 100 ml
- **Day 5**: 125 ml — if tolerated, this is samyak snigdha
- Increase further only if needed

**Signs of samyak snigdha** (proper oleation):
- Vatanulomana (regular bowel)
- Klama-mardava-saukumarya (softness, lightness)
- Mridu-koshtha (soft stool)
- Snigdha-twak (skin shows oil)
- Ojas-vardhana (mild glow)

**Signs of atisnigdha** (over-oleation): nausea, anorexia, lethargy, indigestion. Stop snehapana, pause 1-2 days.

### Day after snehapana completion: Abhyanga + Swedana

Whole body warm sesame oil massage (1 hour) followed by steam bath (10-15 min). Done daily until day of vamana. Goal: bring kapha + ama into rasa-vaha srotas (loose, ready to expel).

## Pradhana Karma — Vamana Day

### Pre-procedure
- Day before: light dinner. Only liquid kashaya.
- Morning of vamana: empty stomach. Patient in seated position, head support.
- Vital signs noted. IV access if hospital setting.

### Vamana proper
1. **Akantha pana** — drink to throat: 1-2 litres of milk + sugarcane juice or yashtimadhu kashaya. Belly distended.
2. Wait 5-10 minutes for the drink to absorb.
3. **Vamana yoga**: Madanaphala churnam 4-8g + honey + saindhava + vamana kashaya. Patient swallows.
4. Position patient for vomiting (forward lean).
5. If vomiting doesn't start in 10 min, **tickle pharynx** with clean finger or feather.
6. Vegas (episodes of vomiting) start. Each vega = expelling rasa + kapha (some bile + ama).

### Vega Assessment

Count and classify each vega:
- Initial vegas: clear water + food remains
- Middle vegas: yellowish bile + kapha-laden
- Later vegas: more bile-tinged, less volume

| Vegas | Outcome |
|---|---|
| 1-3 | Ayoga (incomplete) — repeat or salvage with deepana |
| 4-5 | Madhyama (moderate) — fair outcome |
| 6-8 | **Samyak vamana** — optimal |
| 9-12 | Atiyoga (excess) — risk of complications |
| >12 | Severe atiyoga — emergency |

### Samyak Vamana Signs
- Clear endpoint: last 2 vegas are just bile, no kapha
- Patient feels light, calm
- Heart rate steady, BP stable
- No dehydration signs
- Throat clear of mucus
- Cough productive but easy

### Stopping Vamana
- After 6-8 vegas if criteria met
- If patient becomes weak, hypotensive, faint — stop immediately, IV fluids, monitor

## Paschat Karma — Recovery (3-7 days)

### Sansarjana Karma — graduated diet

Day 1 post-vamana: **Peya** (rice gruel, very thin)
Day 2: **Vilepi** (thicker rice porridge)
Day 3: **Akrita yusha** (vegetable soup)
Day 4: **Krita yusha** (with seasoning)
Day 5: **Akrita mansa rasa** (meat soup or vegetable equivalent)
Day 6: **Krita mansa rasa** (seasoned)
Day 7: Normal diet resumed

This 7-day protocol gives agni time to recover and prevents acidity/rebound disease.

### Restrictions during sansarjana
- No cold water, ice
- No physical exertion
- No sexual activity
- No mental stress
- No fasting or overeating
- Total rest, light reading, calm environment

## Complications

### Atiyoga (excess vamana)
- Severe dehydration, hypotension
- Severe weakness, syncope
- Excessive bleeding
- Cardiovascular collapse (rare)

**Treatment**: Stop. IV fluids. Sugar + salt water. Madhu + ghrita. Bed rest 24-48 hours.

### Ayoga (incomplete)
- Symptoms not resolved
- Patient feels heavy
- Kapha not expelled

**Treatment**: Repeat snehapana cycle, retry vamana with stronger emetic.

### Other complications
- **Aspiration** — rare but serious; ensure patient is upright
- **Throat irritation** — gargle with warm saline
- **Hypoglycemia** — patient was fasting; give light food
- **Anxiety** — explain, reassure, monitor

## Modern Adaptation

Many modern centres modify the classical protocol:
- Shorter snehapana (3 days instead of 5-7)
- Pre-screened patients with bloods + ECG
- IV line access during pradhana karma
- Hospital setting for complex patients
- Avoidance of vamana in unsafe patient profiles

This adaptation increases safety without losing core therapeutic effect.

## Self-test

- List indications and absolute contraindications for vamana.
- Describe the 5-day snehapana protocol with dose escalation.
- What is samyak vamana? How many vegas constitute it?
- Outline the 7-day sansarjana karma diet progression.
- A patient develops severe weakness after 11 vegas — what is your management?`,
  },

  {
    slug: 'basti-karma-types-administration',
    title: 'Basti Karma — Types, Preparation, Administration',
    subjectSlug: 'panchakarma',
    year: 'final_year',
    difficulty: 'advanced',
    readTimeMinutes: 9,
    summary: 'Basti is rectal/enema therapy — the most powerful Panchakarma. Two main types: niruha (decoction) and anuvasana (oil). Karma basti (30-basti protocol) and Yoga basti (8-basti) are classical regimens. Critical for vata-vyadhi management, fertility, neurology.',
    keyPoints: [
      'Two main types: niruha (kashaya) + anuvasana (taila)',
      'Karma basti = 30 bastis (12 niruha + 16 anuvasana + 2 buffer)',
      'Yoga basti = 8 bastis (3 niruha + 5 anuvasana)',
      'Strict contraindications: bleeding GI disorders, severe diarrhea, pregnancy',
      'Indications: vata-vyadhi, infertility, neurology, chronic constipation',
    ],
    references: [
      'Charaka Siddhi Sthana 1-12',
      'Sushruta Chikitsa 35-37',
      'Ashtanga Hridaya Sutra 19',
    ],
    tags: ['panchakarma', 'basti', 'shodhana', 'vata-vyadhi'],
    content: `## Why Basti is Called the "Half-Treatment"

> *Basti-samam nasti — ardha-chikitsa basti-eva*

"There is nothing equal to basti — basti is half of all treatment."

Charaka calls basti the most important Panchakarma because:
- Vata is the dosha-leader; basti is the prime vata-pacifier
- Rectal absorption gives systemic effect rapidly
- Two action modes (samshodhana + samshamana) in one therapy
- Suitable for chronic disease + acute neurology

## Two Main Types

### 1. Niruha Basti (decoction basti)

- **Composition**: kashaya + madhu + saindhava + sneha (oil) + ghana (paste of herbs)
- **Volume**: 300-600 ml typically
- **Retention**: 30-90 minutes; expelled by patient
- **Effect**: samshodhana (cleansing)
- **Frequency**: every other day in basti karma

### 2. Anuvasana Basti (oil basti)

- **Composition**: medicated taila + sneha (cow ghee + bone marrow oil + sesame oil)
- **Volume**: 60-180 ml
- **Retention**: overnight or 4-6 hours; some absorbed, some passed gradually
- **Effect**: samshamana (pacification) + brimhana (nourishment)
- **Frequency**: every other day, alternating with niruha

## Classical Basti Karma Regimens

### Karma Basti — 30 basti protocol
For severe chronic vata-vyadhi:
- Day 1: Anuvasana
- Day 2: Niruha
- Day 3: Anuvasana
- Day 4: Niruha
- ... continuing for 30 days
- Total: 12 niruha + 16 anuvasana + 2 buffer (start + end anuvasana)

This is intensive — usually inpatient.

### Kala Basti — 16 basti protocol
For moderate vata-vyadhi:
- Same alternating pattern for 16 days

### Yoga Basti — 8 basti protocol
For mild vata-vyadhi or maintenance:
- 3 niruha + 5 anuvasana over 8 days

### Special protocols
- **Vati basti** — single basti for sciatica
- **Matra basti** — short anuvasana (50ml) for daily use, chronic vata maintenance

## Classical Niruha Basti Composition

The classical formula (Charaka Siddhi 1):
- **Madhu** (honey) — 120 ml
- **Saindhava** (rock salt) — 8g
- **Sneha** (oil/ghee) — 60 ml
- **Kalka** (herbal paste) — 30g
- **Kashaya** (decoction) — 360 ml
- Total: ~600 ml

The order of mixing matters (madhu first, then salt dissolves, then sneha, then kalka, finally kashaya). This affects emulsion stability.

## Patient Preparation (Poorva Karma)

### 3 days prior to basti
- Light digestible diet
- Abhyanga (oil massage) + swedana daily
- Snehapana not strictly required for niruha; recommended for anuvasana

### Day of basti
- Empty bowel naturally before basti
- Abhyanga + steam for 30 min before
- Light meal 2 hours before niruha; or empty stomach
- Anuvasana given on empty stomach, taken at night before sleep

## Administration Technique

### Equipment
- Classical: basti yantra — gourd with attached tube
- Modern: enema bag/syringe (sterile, single-use)
- Position: left lateral with right knee flexed (vaidya behind)

### Procedure
1. Patient lies in position
2. Catheter tip lubricated with oil
3. Inserted gently into anus, 4-6 inches
4. Pre-warmed basti material (body temp) administered slowly
5. Catheter removed
6. Patient turns supine, lies for retention time
7. **Niruha**: 30-90 min retention, then expel
8. **Anuvasana**: prolonged retention (4 hours to overnight)

### Patient instructions
- No talking, no movement during retention
- Tighten gluteal muscles to prevent early expulsion
- For niruha: when urge to defecate is strong, allow

## Samyak Basti Signs

### Samyak niruha
- Easy and complete expulsion
- Stool quality: kapha-mucus + medicated material + small amount of formed stool
- Patient feels light, calm
- Soft abdomen
- Improvement in symptoms within 24 hours

### Samyak anuvasana
- Mostly absorbed; small amount expelled overnight
- Patient feels lubricated, relaxed
- Improvement in vata symptoms

## Specific Indications

### Niruha basti

- **Vata-vyadhi**: sciatica, paraplegia, rheumatoid arthritis, parkinsonian features
- **Anidra** (insomnia) — chronic vata
- **Constipation** (chronic refractory)
- **Bandhana** (ankylosing spondylitis features)
- **Klaibya** (impotence with vata cause)

### Anuvasana basti

- **Daily maintenance** for vata-prakriti
- **Post-niruha** (always end a niruha series with anuvasana)
- **Sandhigatavata** (osteoarthritis)
- **Katigraha** (low back pain)
- **Bowel rehabilitation** post-surgery

### Specific named bastis

- **Madhutailika basti** — for emaciation, post-fever recovery
- **Kshara basti** — for haemorrhoids, fistula (caution)
- **Picchha basti** — for ulcerative colitis (mucus retention)
- **Doshaharika basti** — multi-dosha clearance
- **Vati basti** — single high-volume basti for severe sciatica

## Contraindications

**Absolute**:
- Active GI bleeding
- Severe diarrhea
- Recent abdominal surgery (<3 months)
- Severe anaemia, debility
- Pregnancy (except specific labour-promoting basti late in 9th month)
- Active acute fever
- Children under 5
- Elderly over 80 (relative)

**Relative**:
- Mild hemorrhoids — modify with picchha basti
- Mild fever — use mild medicated bastis
- Chronic IBD — picchha basti only, gentle

## Modern Adaptation

- Pre-procedure: stool consistency check, perianal area examination
- Sterile single-use equipment + gloves
- Hospital setting for first 3-5 bastis of any new patient
- IV access for vulnerable patients
- Stop and escalate if patient develops severe cramping, fever, bleeding

## Complications

### Atiyoga niruha
Excess fluid loss, dehydration, electrolyte imbalance — IV fluids + rest.

### Anuvasana retention failure
Often from too-cold basti or wrong position. Repeat next day with proper preparation.

### Bowel irritation
From excessive basti frequency. Discontinue 3-7 days, gentle resumption.

### Aspiration of basti
Almost never happens with proper technique; medical emergency if occurs.

## Self-test

- Compare niruha and anuvasana basti on 4 dimensions.
- List the components of classical niruha basti.
- What is karma basti vs yoga basti?
- Outline samyak niruha signs.
- A patient with chronic sciatica + vata dominance — design a basti regimen.
- Name 2 absolute and 2 relative contraindications.`,
  },
]

export const NOTE_SLUGS = NOTES.map((n) => n.slug)
