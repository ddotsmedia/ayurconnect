// Article seed — 20 original AyurConnect-authored summaries of publicly
// available Ayurvedic knowledge.
//
// IMPORTANT — content attribution policy:
//   - Every article is an ORIGINAL summary written for AyurConnect by our
//     editorial team. We do NOT copy text from any third party.
//   - Every article cites its primary source(s) — public-domain classical
//     texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam) or
//     open-access government publications (Ministry of AYUSH, CCRAS, NIA).
//   - Sanskrit verse references where applicable are by canonical chapter/
//     sloka numbering (e.g. "Charaka Samhita, Sutrasthana 5/9-12") so readers
//     can verify against any edition.
//   - The translations + interpretations are educational summaries — readers
//     wanting authoritative text should consult the original Sanskrit + a
//     reputed translation (Sharma, Chowkhamba editions, AYUSH Ministry).
//
// Idempotent — upsert on id. Safe to re-run.

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

type ArticleSeed = {
  id:       string
  title:    string
  content:  string
  category: 'classical-text' | 'research' | 'seasonal-health' | 'lifestyle'
  source:   string
  language?: string
}

const ARTICLES: ArticleSeed[] = [

  // ─── CLASSICAL TEXT (6) ────────────────────────────────────────────────

  {
    id: 'art-tridosha-introduction',
    title: 'Tridosha: The Three Doshas of Ayurveda',
    category: 'classical-text',
    source: 'Charaka Samhita, Sutrasthana 1/57-58 · Ashtanga Hridayam, Sutrasthana 1/6-7',
    content: `Classical Ayurveda holds that every human body is governed by three fundamental biological energies — Vata, Pitta, and Kapha — collectively called the Tridosha. The Charaka Samhita states that all health and disease, all physiology and pathology, can be understood through the lens of these three.

**Vata** is the principle of movement. It governs breathing, circulation, peristalsis, nerve transmission, menstrual flow, and the elimination of wastes. Its qualities (Guna) are dry, light, cold, rough, subtle, and mobile. When Vata is balanced, the body moves with grace, the mind is creative, and bodily channels function smoothly. When aggravated, Vata produces dryness, stiffness, anxiety, insomnia, constipation, and chronic pain.

**Pitta** is the principle of transformation. It governs digestion, metabolism, body temperature, vision, intellect, and the body's capacity to interpret and respond to the environment. Its qualities are hot, sharp, light, oily (slightly), liquid, and spreading. Balanced Pitta means good appetite, clear understanding, sharp intellect, and warmth. Aggravated Pitta produces hyperacidity, inflammation, anger, skin disorders, and burning sensations.

**Kapha** is the principle of structure and lubrication. It governs the stability of tissues, joint lubrication, the immune-like Ojas, mucous membranes, and emotional steadiness. Its qualities are heavy, cold, oily, smooth, soft, dense, and stable. Balanced Kapha gives strength, endurance, calm temperament, and a strong immune system. Aggravated Kapha produces weight gain, lethargy, congestion, fluid retention, and emotional attachment.

**Prakriti and Vikriti.** Every individual has a unique Prakriti — the dominant Dosha or combination of Doshas — established at conception. Prakriti is constant through life. Vikriti is the current state of imbalance — what's "out of balance right now." Effective Ayurvedic care is the art of bringing Vikriti back to Prakriti. A Vata-dominant person who develops a Pitta vikriti needs different treatment than a Pitta-dominant person with the same vikriti.

**The five sub-types.** Each Dosha has five sub-Doshas with specific anatomical seats. Vata has Prana (head/chest), Udana (throat), Samana (stomach), Apana (pelvis), and Vyana (skin). Pitta has Pachaka (stomach), Ranjaka (liver), Sadhaka (heart), Alochaka (eyes), Bhrajaka (skin). Kapha has Avalambaka (chest), Kledaka (stomach), Bodhaka (tongue), Tarpaka (head), Sleshaka (joints). Modern Ayurvedic clinical practice maps specific symptoms to specific sub-Doshas — for instance, chest pain is typically a Prana-Vata + Avalambaka-Kapha imbalance.

**Diagnosis through Dosha lens.** Classical Ayurveda diagnoses disease by identifying which Dosha (or combination) is aggravated, which tissues (Dhatu) are involved, and which channels (Srotas) are obstructed. Treatment then aims to pacify the aggravated Dosha through diet, lifestyle, herbs, and Panchakarma procedures.

This framework is not a substitute for modern diagnosis — it complements it. A patient with rheumatoid arthritis is, in modern medicine, a case of autoimmune inflammation; in Ayurveda, the same patient is typically diagnosed with Amavata (Vata-Kapha imbalance with Ama accumulation). Both frameworks describe real phenomena from different angles.

For a deeper canonical reference, see Charaka Samhita Sutrasthana 1 ("Dīrghañjīvitīyam adhyāyam") and Ashtanga Hridayam Sutrasthana 1 ("Ayushkamiya"). The Ministry of AYUSH publishes free Hindi + English translations of both at ayush.gov.in.`,
  },

  {
    id: 'art-sapta-dhatu',
    title: 'Sapta Dhatu: The Seven Tissues of the Body',
    category: 'classical-text',
    source: 'Sushruta Samhita, Sutrasthana 14/3-12 · Ashtanga Hridayam, Sharirasthana 3/62',
    content: `The Sapta Dhatu — seven body tissues — are the structural foundation of Ayurvedic physiology. Each tissue nourishes the next in sequence, and the qualitative health of each depends on the proper nourishment of the previous one.

The seven Dhatus in order of formation are:

1. **Rasa** (plasma / nutrient fluid) — formed from digested food. Functions as preeti (nourishment + contentment).
2. **Rakta** (blood) — formed from Rasa. Functions as jeevana (life-sustenance).
3. **Mamsa** (muscle) — formed from Rakta. Functions as lepana (covering of the skeleton).
4. **Meda** (fat / adipose tissue) — formed from Mamsa. Functions as snehana (lubrication).
5. **Asthi** (bone) — formed from Meda. Functions as dharana (supporting the body).
6. **Majja** (marrow + nervous tissue) — formed from Asthi. Functions as purana (filling of the bone cavities + sensory transmission).
7. **Shukra** (reproductive tissue) — formed from Majja. Functions as garbhotpadana (reproduction).

**Dhatu formation: the Khale Kapota nyaya.** The classical analogy is of pigeons in a granary — each pigeon picks grains in sequence, eats some, leaves the rest. Similarly, each Dhatu absorbs the nutrients it needs from the previous Dhatu, and passes the remainder forward. If digestion (Agni) is weak, the early Dhatus (Rasa, Rakta) are well-nourished, but the later ones (Majja, Shukra) become depleted.

**The waste products (Mala) of each Dhatu.** Each Dhatu produces a metabolic byproduct: Rasa → Kapha; Rakta → Pitta; Mamsa → ear-wax, nasal secretions; Meda → sweat; Asthi → nails, hair; Majja → ocular secretions; Shukra → no waste (the final transformation).

**Clinical importance.** Many chronic conditions are best understood as Dhatu disorders. Anaemia is a Rakta-kshaya (depletion). Obesity is Meda-vridhi (excess). Osteoporosis is Asthi-kshaya. Infertility is often Shukra-kshaya. Neurological diseases involve Majja-vikara. Modern medicine treats each as a separate condition; classical Ayurveda traces them back to the upstream Dhatu and the digestive fire that should be nourishing it.

**The seventh tissue's special quality: Ojas.** From the essence of all seven Dhatus, particularly from Shukra, comes Ojas — the body's vital essence, roughly correspondable to immune resilience, vitality, and Sattva-stability. Classical texts (Charaka Sutrasthana 17/74-75) describe Ojas as "moisturous, cold, soft, smooth, viscous, sweet, stable, clear, and unctuous." It is destroyed by anger, hunger, worry, grief, exertion, fasting, and trauma. Building Ojas is the long-term goal of Rasayana therapy.

For canonical reading, the Sushruta Samhita Sutrasthana 14 and 15 ("Sonita-Varnaniya" and "Doshadhatumalakshaya-vriddhi") are the definitive texts on Dhatu physiology. AYUSH-CCRAS publishes a free annotated English translation at ccras.nic.in.`,
  },

  {
    id: 'art-agni-ama',
    title: 'Agni and Ama: Why Digestive Fire is Everything in Ayurveda',
    category: 'classical-text',
    source: 'Charaka Samhita, Chikitsasthana 15/3-5 · Ashtanga Hridayam, Sutrasthana 13/25-27',
    content: `If Ayurveda has a single most important clinical concept, it is Agni — the digestive fire. The Charaka Samhita is explicit: "All diseases originate from impaired Agni." When Agni functions correctly, food becomes Ahara Rasa (the nutritive essence) which nourishes the seven Dhatus. When Agni fails, the same food becomes Ama — a sticky, undigested toxin that obstructs body channels (Srotas) and creates disease.

**The thirteen types of Agni.** Classical Ayurveda enumerates 13 digestive fires:
- **Jatharagni** (1) — the central digestive fire in the stomach + small intestine
- **Bhutagni** (5) — fires that digest the five elements within food
- **Dhatvagni** (7) — fires within each of the seven Dhatus, responsible for tissue-level metabolism

Jatharagni is the master fire. If it is weak, all the others are starved.

**Four states of Agni.**
1. **Sama Agni** — balanced. Hunger and satiety come on time; digestion is comfortable; stools are well-formed.
2. **Vishama Agni** (Vata-type) — irregular. Hunger sometimes comes, sometimes doesn't; bloating + gas; constipation alternating with loose stools.
3. **Tikshna Agni** (Pitta-type) — overactive. Excessive hunger; heartburn; rapid hunger after meals; loose stools.
4. **Manda Agni** (Kapha-type) — sluggish. Heaviness after meals; lack of appetite; coated tongue; weight gain.

Effective Ayurvedic treatment first identifies the Agni state, then applies measures specific to that pattern. A patient with Manda Agni gets warming spices (Trikatu); one with Tikshna Agni gets cooling, sweet, bitter herbs (Yashtimadhu, Amalaki).

**Ama — the consequence of impaired Agni.** Ama is described as "white, heavy, sticky, foul-smelling." Its signs are coating on the tongue, body heaviness, lethargy, bad breath, joint pain, and lack of appetite. Chronic Ama accumulation is the root of many lifestyle disorders — type 2 diabetes (Madhumeha) is described in classical texts as "Kapha-related Ama in the Rasa Dhatu"; rheumatoid arthritis is Amavata.

**Treatment principles.** Removing Ama (Ama-pachana) precedes any nourishing therapy. Bitter herbs (Guduchi, Katuki), warming spices (Pippali, Sunthi), and fasting are classical Ama-pachana measures. Only after Ama is cleared can Rasayana (rejuvenation) therapies safely build up the tissues.

This is why classical Panchakarma always begins with Purvakarma — preparing the body, kindling Agni, mobilising Ama — before the major procedures (Vamana, Virechana, Basti) attempt elimination.

**Modern correspondence.** While Ama is not a specific biochemical entity in modern medicine, it correlates broadly with concepts like systemic low-grade inflammation, gut dysbiosis, insulin resistance precursors, and oxidative stress. The clinical signs (tongue coating, lethargy, food intolerance) overlap with what modern medicine identifies as "post-prandial inflammation" patterns.

For canonical reading, see Charaka Samhita Chikitsasthana 15 ("Grahani Chikitsa") — the definitive text on Agni disorders, and Ashtanga Hridayam Sutrasthana 13 ("Dosha-bheda"). The Ministry of AYUSH classical-texts portal (ayush.gov.in/Ayurveda) has free chapter PDFs.`,
  },

  {
    id: 'art-dinacharya-classical',
    title: 'Dinacharya — The Ayurvedic Daily Routine',
    category: 'classical-text',
    source: 'Ashtanga Hridayam, Sutrasthana 2 ("Dinacharyādhyāya") · Charaka Samhita, Sutrasthana 5',
    content: `Dinacharya — the daily regimen — is one of the most practical contributions of classical Ayurveda. It prescribes a sequence of activities aligned with the circadian rhythm and the natural dominance of each Dosha at different times of day.

**The 24-hour Dosha clock.**
- 6 AM – 10 AM, 6 PM – 10 PM: Kapha time (slow, heavy, structured)
- 10 AM – 2 PM, 10 PM – 2 AM: Pitta time (digestive fire peaks at noon; tissue repair peaks at night)
- 2 AM – 6 AM, 2 PM – 6 PM: Vata time (movement, awakening, transitions)

Dinacharya aligns activities with these windows. The classical sequence is:

**1. Brahma Muhurta (90 minutes before sunrise, roughly 4:30 AM).** Rise. This is the only window in 24 hours when Vata dominates clearly, producing alertness and mental clarity without anxiety. Ashtanga Hridayam (Su. 2/1): "A healthy person should rise in the Brahma Muhurta to protect his life."

**2. Eliminate first (Mala-mutra visarga).** Bowels and bladder are emptied. Forcing or suppressing either is classified as "vega-rodha" — suppression of natural urges, a major cause of disease.

**3. Acamana + Dantadhavana (mouth + teeth).** Tongue scraping with a copper or silver scraper removes Ama deposited overnight. Twigs of Khadira (acacia), Karanja (pongamia), or Neem were traditional toothsticks; their bitter+astringent action both cleans and tones the gums.

**4. Anjana (eye care).** Sauviranjana (collyrium) is applied to keep the eyes "shining like a crow's eyes." Modern equivalent: cool water splash and adequate sleep.

**5. Nasya (nasal oiling).** Two drops of Anu Taila in each nostril. Particularly important for those with morning congestion, sinus issues, or neck/shoulder tension. Skip if there is acute fever, recent meals, or pregnancy (early trimester).

**6. Gandusha + Kavala (oil pulling + gargling).** Sesame oil held in the mouth for 5-10 minutes. Strengthens gums, voice, jaw muscles; reduces oral bacteria.

**7. Abhyanga (oil massage).** Self-massage with warm sesame, coconut, or medicated oil before bath. 10-15 minutes daily. Classical claim: prevents ageing, reduces fatigue, prevents Vata disorders, induces good sleep. Modern correlation: improves circulation, lymphatic drainage, parasympathetic activation.

**8. Vyayama (exercise).** Performed to "half capacity" — i.e. until sweat appears on forehead + chest, but not to exhaustion. Daily, except during illness, pregnancy after first trimester, or post-meal.

**9. Snana (bath).** Warm to lukewarm water, never very hot on the head. Cleanses, removes oil, refreshes.

**10. Bhojana (meals).** Largest meal at solar noon when Pitta is highest. Lighter meals morning and evening. Eat in a calm environment, finish before sunset.

**11. Karma (work).** Mid-morning to mid-afternoon is Pitta-dominant — best for sharp intellectual work. Avoid heavy mental work in the late evening Kapha time.

**12. Sandhya (transitions).** Sunset is considered the day's most sensitive transition. Brief meditation or simple meal-prep ritual marks the boundary.

**13. Nidra (sleep).** By 10 PM. The body's tissue-repair window opens between 10 PM and 2 AM. Late sleep degrades Ojas (vitality) and Bala (strength).

**Why this matters clinically.** Modern chronobiology has confirmed major elements of Dinacharya. Circadian alignment of meals (lunch as largest), early sleep, morning sunlight exposure, oil-pulling's oral-microbiome effects — all have growing evidence bases. Patients adopting even partial Dinacharya often report improvements in sleep, digestion, energy, and mood within 4-6 weeks.

For full canonical reference, Ashtanga Hridayam Sutrasthana 2 ("Dinacharyādhyāya") is the source text. The Ministry of AYUSH publishes a free Hindi-English bilingual edition; CCRAS has produced a clinical-practitioner edition with modern commentary.`,
  },

  {
    id: 'art-trimarmas',
    title: 'The Three Vital Marmas: Head, Heart, and Bladder',
    category: 'classical-text',
    source: 'Sushruta Samhita, Sharirasthana 6/15-32 · Charaka Samhita, Siddhisthana 9/3',
    content: `Sushruta — the surgical authority of classical Ayurveda — identifies 107 marma points throughout the body, but elevates three above all others: Shira (head), Hridaya (heart), and Basti (urinary bladder). Injury to any of these three, he writes, leads to immediate death. These three are the Trimarma — the seats of life itself.

**Shira (Head).** Houses the seats of the higher mental functions, the indriyas (sense organs), and the upper Prana sub-Doshas (Prana proper, Udana, Tarpaka-Kapha). Symptoms involving the head — chronic headache, vertigo, cognitive issues, insomnia, vision and hearing problems — are treated with Shiroabhyanga, Shirodhara, Shirobasti, Nasya, and the Brahmi-Bacopa group of medicines.

**Hridaya (Heart).** More than just the cardiac pump in classical texts — it is the seat of consciousness (Sadhaka-Pitta), of Ojas, and of emotional Sattva. Conditions involving Hridaya range from coronary disease to mental-emotional disturbance, with Arjuna, Pushkaramoola, and Hridaya-supportive Rasayanas being the classical interventions.

**Basti (Bladder + Pelvic Cavity).** The seat of Apana-Vata, governing elimination, menstruation, conception, and labour. Disorders here are not just urological — they include constipation, infertility, dysmenorrhoea, recurrent UTI, and chronic pelvic-floor dysfunction. Basti karma (medicated enema) is named after this region precisely because so many systemic Vata disorders are rooted here.

**The clinical principle of Trimarma protection.** Classical Ayurveda holds that no treatment should be applied to one Trimarma without considering its effect on the others. Strong evacuative therapies (Virechana) acting on the abdomen affect Apana-Vata, which connects to Vyana-Vata in the heart and Prana-Vata in the head. A Panchakarma practitioner who ignores these connections can disturb the Trimarma balance — producing palpitations, dizziness, or anxiety in patients undergoing aggressive Panchakarma.

**Other key Marma groups.**
- **Hridaya Marma (1)** — single point
- **Shira Marma (1)** — single point
- **Basti Marma (1)** — single point
- **Adho-Marma group** — below the umbilicus
- **Madhya-Marma group** — between umbilicus and heart
- **Urdhva-Marma group** — above the heart
- **Shakha-Marma group** — limb marmas

The full Sushruta enumeration counts 107 marma points, classified by anatomical location, by structural composition (muscle, vein, ligament, bone, joint), and by clinical severity (sadyah-pranahara = immediately fatal; kalantara-pranahara = fatal over time; vaikalyakara = produce permanent deformity; rujakara = produce pain only).

**Modern correspondence.** The Trimarma concept maps surprisingly well onto modern anatomy. Shira corresponds to the brain + brainstem + cranial nerve nuclei. Hridaya overlaps with the cardiac centres + great vessels. Basti maps to the lower abdomen + pelvic plexus. The classical observation that injury to these regions can be immediately fatal aligns with modern trauma medicine's identification of these as the most life-threatening injury sites.

For full canonical reading, Sushruta Samhita Sharirasthana 6 ("Pratyenga-Vibhaga") is the foundational text. Marma chikitsa as a therapeutic specialty is well-documented in Kerala — Vaidyaratnam P.S. Varier's commentaries on this chapter remain the gold standard for clinical practice.`,
  },

  {
    id: 'art-prakriti-determination',
    title: 'Prakriti: Determining Your Ayurvedic Constitution',
    category: 'classical-text',
    source: 'Charaka Samhita, Vimanasthana 8/95-101 · Sushruta Samhita, Sharirasthana 4/63-78',
    content: `Prakriti — your constitutional type — is the foundational diagnostic concept in Ayurveda. Determined at conception by the dominant Doshas in the parents at the time of union, modified slightly by the environment of the womb, Prakriti is the unchanging biological identity carried for life.

**The seven Prakriti types:**
1. **Vata** — single dosha
2. **Pitta** — single dosha
3. **Kapha** — single dosha
4. **Vata-Pitta** — dual
5. **Pitta-Kapha** — dual
6. **Vata-Kapha** — dual
7. **Sama** (Tridoshic) — all three balanced

Charaka notes that pure single-dosha types are rare — most people are dual-dosha, with one slightly more dominant.

**Vata Prakriti — physical features.** Slim build, dry skin, prominent veins and joints, low body weight, irregular features, brittle nails, dry hair. Skin tends to be darker or earthy. Hands and feet tend to be cool. Sleeps lightly, often less than 6 hours. Eats irregularly, may forget meals. Digestion variable.

**Vata Prakriti — mental features.** Creative, imaginative, quick to learn and quick to forget, restless, talkative, anxious under stress. Memory is good for the recent past but vague for the distant past.

**Pitta Prakriti — physical features.** Medium build, warm skin (often with reddish or copper undertone), early greying or balding, freckles or moles, sharp features, good appetite + thirst, regular bowel movements (often 2-3 a day), warm hands and feet. Sweat moderate to heavy.

**Pitta Prakriti — mental features.** Sharp intellect, leadership tendency, perfectionist, decisive, can be impatient or irritable when hungry or hot. Good memory across timeframes. Critical thinker.

**Kapha Prakriti — physical features.** Heavier build, smooth oily skin, thick lustrous hair, large eyes with thick lashes, even features, slow but steady digestion, deep prolonged sleep (often 8-9 hours), strong endurance. Hands and feet cool but not cold.

**Kapha Prakriti — mental features.** Calm, steady, affectionate, slow to anger, slow to learn but never forgets. Patient. May tend toward inertia or emotional attachment.

**How Prakriti is determined clinically.** Classical assessment uses Dasha-vidha Pariksha — a ten-fold examination including:
1. Prakriti (constitutional type — observed)
2. Vikriti (current state of imbalance)
3. Sara (tissue quality — examined per Dhatu)
4. Samhanana (build / frame)
5. Pramana (proportions)
6. Satmya (long-term diet + climate adaptation)
7. Sattva (mental constitution)
8. Aharashakti (digestive capacity)
9. Vyayamashakti (exercise capacity)
10. Vaya (age + life stage)

Modern Ayurvedic clinicians use structured questionnaires (validated forms exist at AIIA Delhi, IPGT&RA Jamnagar) covering physical traits, psychological tendencies, and lifestyle patterns. A well-conducted assessment takes 30-45 minutes and produces a 3-digit Vata-Pitta-Kapha score.

**Why Prakriti matters in treatment.** A medicine that pacifies one person's Vikriti may worsen another's if Prakriti is ignored. Example: Triphala is universally good, but a Vata-Prakriti person needs Triphala with warm water + ghee; a Pitta person with cool water; a Kapha person with honey. The same drug, different vehicle (Anupana), different outcome.

**Stability of Prakriti.** Modern Indian Ayurveda research has explored whether Prakriti correlates with measurable biological markers. Studies at AIIA + CCRAS have found correlations with HRV patterns, basal metabolic rate, lipid profiles, and even some genetic polymorphisms. The literature is preliminary but consistent — Prakriti is not arbitrary; it reflects real biological differences.

**Take the AyurConnect Prakriti quiz** at /prakriti-quiz for a 2-minute structured self-assessment. For clinical-grade determination, book a consultation with one of our CCIM-verified doctors who can perform the full Dasha-vidha examination.

For canonical reading: Charaka Samhita Vimanasthana 8 ("Roganīka-vimāna") and Sushruta Sharirasthana 4 ("Garbhāvakranti") are the source chapters.`,
  },

  // ─── SEASONAL HEALTH (5) ───────────────────────────────────────────────

  {
    id: 'art-karkidaka-masa',
    title: 'Karkidaka Masa — Kerala\'s Monsoon Rejuvenation Tradition',
    category: 'seasonal-health',
    source: 'Ashtanga Hridayam, Sutrasthana 3 ("Ritucharyādhyāya") · Kerala Ayurveda Vaidya Sammelanam traditional practice notes',
    content: `For Kerala households, the Malayalam month of Karkidaka (mid-July to mid-August) is the most sacred period of the Ayurvedic year. The monsoon at its peak, the digestive fire weakened by dampness and cool weather, the body slow and heavy — classical Ayurveda identified this exact window as the optimal time for cleansing and rejuvenation.

**Why Karkidaka, scientifically.** Three converging factors:
1. **Vata-Kapha aggravation.** Cold, damp, cloudy weather aggravates Kapha; the variability and wind aggravate Vata. The body needs internal warming and grounding.
2. **Weak Agni.** Atmospheric humidity reduces digestive capacity. Heavy food creates Ama. Light, oily, cooked food in small quantities is needed.
3. **Lowest immunity / Ojas dip.** Monsoon-borne infections, joint pain flares, allergic rhinitis worsen. Building Ojas during this window protects through autumn.

**The traditional Karkidaka regimen** (varies by household but the core is consistent):

**Karkidaka Kanji** — a medicinal rice gruel cooked with 10-20 herbs including Dashamoola, Pippali, Methi (fenugreek), Karingali (acacia bark), turmeric, ginger, jeera, dhanya, and palmjaggery. Eaten for breakfast for at least 7 days. Variants exist for Vata-dominant constitutions (more grounding, oilier), Pitta (cooling, less spicy), and Kapha (spicier, less oily).

**Daily Dashamoolarishta** — 15-30 ml twice daily after meals. The classical fermented Vata-pacifying preparation supports digestion, reduces post-monsoon Vata aggravation, and is particularly good for the elderly.

**Abhyanga + Pizhichil where possible.** Daily warm-oil self-massage with sesame or specially-medicated Karkidaka taila. Pizhichil (oil-stream procedure) is the traditional gold-standard rejuvenation for those who can access it; 7 or 14 days is the standard course.

**Diet discipline.** No raw food, no cold drinks, no heavy non-vegetarian, no leftovers, no fried food. Warm rice with curries cooked the same day. Buttermilk with jeera + ginger. Boiled or steamed vegetables.

**Behavioural restrictions.** Early sleep (by 9-10 PM), avoid daytime sleep (worsens Kapha), avoid excessive exposure to rain, avoid getting feet wet for prolonged periods.

**Pregnant women, elderly, children.** Karkidaka is broadly safe for all but with modifications. Pregnant women use Kanji + Dashamoolarishta but skip Virechana-type cleansing. Elderly may need shorter Pizhichil sessions. Children below 7 should not undergo medicinal cleansing, only the Kanji + diet discipline.

**Modern observation.** Where families have continued Karkidaka practices, gerontological research has noted lower incidence of seasonal joint pain flares, fewer monsoon-related respiratory infections, and improved post-monsoon energy. Whether this is the herbal medicine, the dietary discipline, the rest, or all three together is unclear — but the cluster of benefits is consistent.

**Adapting Karkidaka outside Kerala.** For diaspora patients without access to traditional preparations, a modified Karkidaka can be observed: 7 days of light rice-and-lentil-only diet, daily warm-oil self-massage, early sleep, Dashamoolarishta (widely available worldwide), and gentle Pranayama. Even this modified version produces meaningful benefit.

**To experience structured Karkidaka care this year,** consider AyurConnect's "Karkidaka 14-day" Wellness Program at /programs/karkidaka-14-day, or book a 1-on-1 with a Panchakarma specialist via /online-consultation.

The source text is Ashtanga Hridayam Sutrasthana 3 ("Ritucharyādhyāya") — the chapter on seasonal regimen. Kerala's Vaidya Sammelanam and the Govt. Ayurveda College Thiruvananthapuram maintain extensive practitioner notes on Karkidaka adaptations.`,
  },

  {
    id: 'art-grishma-summer',
    title: 'Grishma Ritucharya — Ayurvedic Summer Regimen',
    category: 'seasonal-health',
    source: 'Ashtanga Hridayam, Sutrasthana 3/29-37 · Charaka Samhita, Sutrasthana 6/27-32',
    content: `Grishma (Sanskrit: "burning") is the summer season, classically defined as mid-May to mid-July in the Indian subcontinent. It is characterised by intense heat, dryness in some regions, humidity in others. Classical Ayurvedic seasonal practice (Ritucharya) prescribes specific dietary, behavioural, and therapeutic measures for this period.

**Dosha effects.**
- Pitta accumulates in the body (Pitta-Sanchaya)
- Kapha is naturally reduced by heat (Kapha-Kshaya)
- Vata may become aggravated by dryness and dehydration in the second half

**Dietary recommendations (Pathya).**
- **Madhura rasa** (sweet taste) predominant: sweet fruits (mango in moderation, melons, grapes, dates with water), milk, ghee, rice, wheat
- **Sheeta veerya** (cooling potency) foods: cucumber, coconut water, sugar cane juice, mint, coriander, fennel
- **Drava bhojana** (liquid foods): buttermilk diluted with water, rice gruel, fruit juices, herbal cool drinks
- **Reduce salty + sour + pungent** tastes — these increase Pitta and worsen heat intolerance

**Foods + behaviours to avoid (Apathya).**
- Avoid fried, oily, spicy food
- Avoid wine and alcohol (classical texts are explicit about this in summer)
- Avoid heavy exertion in midday sun
- Avoid prolonged exposure to direct sunlight
- Avoid Panchakarma cleansing procedures except for specific indications

**Classical drinks for Grishma:**
- **Panakam** — water with jaggery, cardamom, dry ginger, black pepper, lemon
- **Coriander-fennel cool decoction** — soak 1 tsp each in 250ml water overnight, strain, drink mornings
- **Khus-khus (vetiver) water** — cooling, calming, Pitta-pacifying
- **Buttermilk with jeera and rock salt** — restores electrolytes and digestive fire

**Lifestyle recommendations.**
- Mid-day rest is permitted in Grishma (one of the few seasons where daytime sleep doesn't aggravate Kapha)
- Light cotton clothing in white or pale colours
- Cool baths (not cold) twice daily
- Pranayama: Shitali, Sitkari, Chandra Bhedana (all cooling)
- Apply sandalwood + Yashtimadhu paste on forehead and chest before sleep

**Specific health risks of Grishma + Ayurvedic prevention.**
1. **Heat exhaustion / heat stroke (Atapa-shanti).** Coconut water hourly, electrolyte balance with jeera-buttermilk. Severe cases need immediate medical attention.
2. **Skin disorders flare.** Eczema, urticaria, prickly heat all worsen. Maha Manjishthadi Kashayam + Khadirarishta provide systemic cooling.
3. **Diarrhoea / food poisoning.** Hingvashtaka Choornam at meal times; avoid leftover food; avoid food from open vendors.
4. **Insomnia from heat.** Brahmi Ghritam + cool sandalwood paste on forehead. Cool room temperature in the bedroom essential.

**For specific Prakriti adjustments.**
- **Pitta-dominant individuals** need strictest Grishma discipline — they aggravate fastest in heat.
- **Vata-dominant** can mostly follow the general regimen but must watch for dehydration (Vata is dry — heat removes more moisture).
- **Kapha-dominant** can be more liberal but should still avoid heavy oily foods.

**Modern correlations.** Grishma's prescriptions align well with modern hot-climate guidelines: increased fluid intake, electrolyte replacement, avoidance of midday sun, light colored cotton clothing, and reduced caloric density of meals. The classical insistence on certain "cooling" herbs (Yashtimadhu, Sandalwood, Coriander) corresponds to anti-inflammatory + mild diuretic activity in modern pharmacological studies.

For the canonical reference, see Ashtanga Hridayam Sutrasthana 3 ("Ritucharyādhyāya"), verses 29-37. The Ministry of AYUSH published a free booklet "Seasonal Health: An Ayurvedic Guide" (2019) available at ayush.gov.in.`,
  },

  {
    id: 'art-shishira-hemanta-winter',
    title: 'Hemanta and Shishira — Ayurvedic Winter Regimen',
    category: 'seasonal-health',
    source: 'Charaka Samhita, Sutrasthana 6/13-26 · Ashtanga Hridayam, Sutrasthana 3/11-22',
    content: `In the Indian classical calendar, Hemanta (mid-November to mid-January) and Shishira (mid-January to mid-March) together form the Ayurvedic winter. They share many regimen recommendations and are often grouped clinically. Modern winter — November to February in India — corresponds.

**Dosha state.**
- Strong Agni — winter is when digestive fire is at its peak. The body retains heat internally, allowing it to handle heavier food.
- Vata may aggravate from cold + dryness (especially in Shishira)
- Kapha begins to accumulate in late winter, ready for Vasanta (spring) aggravation

**The clinical principle.** Winter is the season of Brimhana — building up the body. Heavier, more nourishing food + adequate rest + warming oils + Rasayana (rejuvenation) therapies are all appropriate. This is the polar opposite of summer's lightening regimen.

**Dietary recommendations.**
- **Madhura, Amla, Lavana rasa** (sweet, sour, salty) — naturally heating
- **Heavier, nutritious foods**: ghee, dairy, wheat, rice, mung dal, sesame, jaggery, dates, fresh seasonal fruits like apples and pomegranate
- **Warming spices**: ginger, black pepper, cinnamon, cardamom, ajwain
- **Animal products** (for non-vegetarians): meat soups, milk-based preparations
- **Sesame in all forms** is the classical winter ingredient — sesame oil for cooking, sesame seeds in chutney, sesame oil for body massage

**Specific winter preparations (classical recipes).**
- **Til-gud laddu** (sesame + jaggery balls) — traditional winter snack
- **Chyavanprash** — the king of Rasayanas, ideal for daily winter use
- **Dashamoolarishta** — also indicated in winter for Vata-pacification
- **Hot milk with turmeric, ghee, black pepper** before bed

**What to avoid.**
- Cold, raw foods
- Excessive fasting (winter is not a fasting season)
- Light salads alone as meals
- Cold drinks

**Lifestyle (Vihara).**
- **Daily Abhyanga** with sesame oil — the most important winter practice. Pacifies Vata, prevents dryness, deeply nourishing.
- **Snana (bath)** with warm (not hot) water. Avoid very hot water on head.
- **Exercise** is encouraged — winter is the strongest exercise capacity of the year. Vyayama up to half-strength.
- **Sun exposure** — 20-30 minutes morning sun, especially on the back, builds vitamin D and supports immune function.
- **Adequate sleep** — slightly longer sleep is permitted in Shishira due to longer nights.

**Common winter complaints + Ayurvedic management.**
1. **Dry skin** — daily warm-oil Abhyanga (sesame oil); apply Kumkumadi Taila on face before sleep
2. **Joint stiffness** — Mahanarayan Taila massage; Yogaraj Guggulu in patients with chronic joint disease
3. **Cough + cold** — Sitopaladi Choornam with honey; ginger-tulsi tea; turmeric-milk at bedtime
4. **Constipation** — Triphala 5g with warm water + ghee at bedtime; increased water intake (warm)
5. **Depression / SAD** — morning sun exposure + Brahmi Ghritam + brisk walking in daylight

**Shishira vs Hemanta — small differences.** Hemanta is the more comfortable early winter; Shishira (deeper winter, often coldest) intensifies Vata aggravation. Shishira regimens emphasise more oils, more warming foods, and more Rasayana intake. This is also the most fertile time for conception in classical theory — strong Agni, well-nourished Dhatus, optimum tissue formation.

**Modern correlation.** The "winter Rasayana" tradition aligns with current understanding of seasonal immune dips, vitamin D variability, and the body's need for higher caloric intake during cold months. Modern epidemiology shows infectious disease peaks in winter; Ayurvedic immune-boosting Rasayanas (Chyavanprash, Ashwagandha + Tulsi) likely modulate immune function via NK-cell activity and IL-2 modulation (preliminary research).

For canonical reference: Charaka Samhita Sutrasthana 6 ("Tasyāshitīya-Adhyāya") — verses 13-26 cover Hemanta + Shishira specifically. CCRAS publishes a free practitioner handbook on seasonal Ayurveda (2021 edition).`,
  },

  {
    id: 'art-vasanta-spring',
    title: 'Vasanta Ritucharya — Spring Detox Season',
    category: 'seasonal-health',
    source: 'Ashtanga Hridayam, Sutrasthana 3/23-28 · Charaka Samhita, Sutrasthana 6/22-26',
    content: `Vasanta — spring, mid-March to mid-May in the Indian subcontinent — is the most therapeutically active season in classical Ayurveda. Kapha, which has accumulated through winter, begins to "liquefy" with the rising warmth of spring. This naturally-mobilised Kapha needs to be expelled before it creates disease — making Vasanta the prime season for Panchakarma cleansing.

**Dosha state.**
- Kapha is mobilised (Vilayana) by warming weather
- If not eliminated, this Kapha causes spring conditions: allergic rhinitis, asthma flare, cough, sinusitis, sluggishness, heaviness, weight gain
- Pitta begins to accumulate but is not yet aggravated
- Vata remains relatively quiet

**The clinical principle.** Vasanta is "the season of Kapha disorders." If Kapha is properly cleared in early spring, the person enjoys a healthy summer. If Kapha is allowed to remain, it migrates into the chest (asthma), sinuses (chronic congestion), or joints (Kapha-Vata arthritis).

**Dietary recommendations.**
- **Katu, Tikta, Kashaya rasa** (pungent, bitter, astringent) — these reduce Kapha
- **Light, dry, warming foods**: barley, old wheat, mung dal, honey (in small amounts; never heated), buckwheat
- **Vegetables**: bitter gourd, fenugreek leaves, drumstick (moringa), leafy greens, radish
- **Spices**: ginger, black pepper, long pepper, mustard, garlic (in moderation)
- **Honey** — Vasanta is the traditional honey-harvesting season; small daily quantities support Kapha clearance

**Foods + lifestyle to AVOID.**
- Heavy, oily, sweet, cold foods (yogurt, cheese, milk in excess, sweets, fried food)
- Daytime sleep (most aggravating in Vasanta — classical texts are emphatic)
- Late breakfast — Kapha-time mornings need a light, dry breakfast
- Excessive exposure to cold air or cold water

**Specific spring preparations.**
- **Honey-water with lemon** in the morning — gentle daily Kapha-clearance
- **Trikatu** (ginger + black pepper + long pepper) — 3g before lunch + dinner
- **Triphala** at bedtime continues from winter regimen
- **Tulsi tea** through the day

**Panchakarma in Vasanta.** The classical seasonal therapy:
- **Vamana karma** (therapeutic vomiting) is the Vasanta procedure of choice for Kapha-dominant patients with respiratory disease, allergic rhinitis, or chronic skin conditions. Administered by qualified Panchakarma physicians only.
- **Nasya** for sinus + head conditions — daily Anu Taila for 7-14 days at the start of spring
- **Udvartana** (dry powder massage) for weight management, lymphatic stagnation, cellulite

**Common spring complaints + Ayurvedic management.**
1. **Allergic rhinitis flare** — Anu Taila Nasya + Sitopaladi + Yashtimadhu; severe cases benefit from Vamana
2. **Asthma exacerbation** — Vasavaleha + Sitopaladi + Agastya Rasayanam; reduce dairy + cold foods
3. **Spring fatigue / brain fog** — light dry breakfast (poha, upma) + brisk morning walk + Trikatu
4. **Weight gain from winter** — Vasanta is the season to address it; light diet + Udvartana + Trikatu
5. **Skin issues** (eczema, urticaria) — Maha Manjishthadi Kashayam + Khadirarishta

**Lifestyle (Vihara).**
- **Vigorous exercise** is encouraged — spring has the second-strongest exercise capacity (after winter)
- **Early rise** — by 5:30-6 AM
- **No daytime sleep** — explicit classical injunction
- **Dry powder massage (Udvartana)** with Triphala or Kolakulathadi Choornam — reduces Kapha
- **Bright cotton clothing**

**Why Vasanta detox is clinically important.** Modern lifestyle medicine has discovered seasonal patterns to autoimmune flare, allergic disease, and metabolic syndrome that map remarkably well to Kapha-time aggravation. Many Kerala households still observe a 7-10 day spring detox — light diet, daily Triphala, morning honey-water — and report fewer monsoon-onset respiratory issues.

For canonical reference: Ashtanga Hridayam Sutrasthana 3, verses 23-28, and Charaka Samhita Sutrasthana 6/22-26 are the primary sources. The Ministry of AYUSH Ritucharya guidelines (2020) provide modern clinical translations.`,
  },

  {
    id: 'art-varsha-monsoon',
    title: 'Varsha Ritucharya — Monsoon Health Regimen',
    category: 'seasonal-health',
    source: 'Charaka Samhita, Sutrasthana 6/33-43 · Ashtanga Hridayam, Sutrasthana 3/38-46',
    content: `Varsha (the monsoon season, mid-July to mid-September in India) is classically rated the most challenging season for health by Ayurveda. The combination of fluctuating temperatures, persistent humidity, contaminated water, and reduced sunlight produces multi-dosha disturbances that the regimen must address.

**Dosha state.**
- Vata is aggravated by atmospheric variability, wind, and cold dampness
- Pitta accumulates in the body (in preparation for Sharad aggravation)
- Kapha is partially reduced by cool weather (compared to summer) but in some climates can remain elevated
- Agni (digestive fire) is at its weakest of the entire year

**The clinical principle.** "Sangrahanam" — light, sustaining, digestion-supporting food. Heavy, raw, or contaminated food creates Ama. Warming herbs preserve digestive fire. The classical regimen anticipates that humidity will dampen Agni and water-borne disease will threaten — so it builds protective measures into daily routine.

**Dietary recommendations.**
- **Madhura, Amla, Lavana rasa** in moderation
- **Old grains** (rice + barley + wheat that has been stored at least one year) — easier to digest than fresh harvest
- **Warm, cooked, light meals** — never raw food, never cold food
- **Buttermilk with Trikatu, ginger, rock salt** — the classical monsoon digestive aid
- **Mung dal** — the only legume the texts strongly recommend through monsoon
- **Ghee** — a small amount with each meal supports digestion and prevents Vata aggravation

**What to avoid.**
- Raw vegetables, salads, sprouts (contamination risk)
- Cold or chilled drinks
- Heavy non-vegetarian (especially red meat)
- Curd / yogurt (worsens Kapha-water retention)
- Excessive water intake
- Food kept overnight
- Food from outside / open vendors during peak monsoon

**Specific monsoon preparations.**
- **Sunthi-jeera kashayam** before meals — supports Agni
- **Dashamoolarishta** — Vata pacifier
- **Pippalyadi Kwatha** — for upper respiratory protection
- **Karkidaka Kanji** for those observing the Kerala tradition (see separate article)

**Lifestyle (Vihara).**
- **Avoid getting wet repeatedly** — change wet clothes immediately
- **Daily Abhyanga** with sesame or specially-medicated taila — protects against Vata aggravation
- **Boiled or filtered water** only — the texts predicted modern water-borne disease two thousand years ago
- **Light fragrance** (sandalwood, vetiver) to keep mood elevated
- **Adequate rest** — slightly longer sleep is permitted as the days are cloudy
- **Mosquito protection** — Neem-Karpoor based vaporisers / classical Dhupana

**Common monsoon health issues + Ayurvedic prevention.**
1. **Joint pain flare** (Sandhi-shoola from Vata aggravation) — daily warm-oil massage, avoid raw food, ginger tea throughout the day
2. **Viral fevers** — Mahasudarshan Vati 2 tabs TID at onset; Guduchi decoction for prevention
3. **Skin infections, fungal infections** — Khadirarishta + Triphala bath water; Neem oil application
4. **Digestive upset / food poisoning** — Sanjivani Vati 125mg PRN; avoid outside food
5. **Respiratory issues** — Anu Taila nasal drops daily; Tulsi-Adraka tea
6. **Allergic rhinitis** — Anu Taila Nasya + Trikatu before meals

**Panchakarma in Varsha.** This season is generally NOT recommended for major cleansing procedures. The exception is **Basti karma** (medicated enema) which can be administered for chronic Vata disorders (sciatica, lumbago, paralysis) — Varsha is actually the optimal Basti season because Vata is at its highest. Vamana and Virechana are best avoided in heavy monsoon.

**Why monsoon was the toughest season historically.** Before modern sanitation, monsoon meant water contamination, vector-borne disease (malaria, dengue, cholera), and food spoilage. Classical regimen evolved to address these directly: boil water, avoid raw, eat only cooked light meals, avoid outside food. Modern sanitation has reduced these risks but not eliminated them — even today, August-September shows hospital admission peaks for viral fevers and GI infections in many Indian states.

For canonical reference: Charaka Samhita Sutrasthana 6 verses 33-43, and Ashtanga Hridayam Sutrasthana 3 verses 38-46. The Ministry of AYUSH issued a "Monsoon Health Advisory" in 2020 (available at ayush.gov.in) covering the modern public-health application of Varsha Ritucharya.`,
  },

  // ─── LIFESTYLE (5) ─────────────────────────────────────────────────────

  {
    id: 'art-sadvritta',
    title: 'Sadvritta — The Ayurvedic Code of Right Conduct',
    category: 'lifestyle',
    source: 'Charaka Samhita, Sutrasthana 8/17-29 · Ashtanga Hridayam, Sutrasthana 2/19-29',
    content: `Among the most overlooked but most powerful clinical concepts in classical Ayurveda is Sadvritta — the code of right conduct. Charaka introduces it not as a moral system but as preventive medicine. Mental wellbeing, social harmony, ethical living — these directly affect physical health by stabilising Sattva (mental clarity) and protecting Ojas (vitality).

**The foundational claim.** Charaka Sutrasthana 8/17: "One who follows Sadvritta will not be afflicted by diseases of the body or mind." Modern psychology has independently reached similar conclusions about prosocial behaviour, gratitude, honesty, and emotional regulation reducing stress-related illness.

**The Sadvritta principles (selected):**

**1. Respect speech (Vāk-niyama).**
- Speak truth, but speak it kindly
- Avoid harsh, hurtful, abusive language
- Don't gossip or spread rumours
- Don't speak more than necessary; don't speak less than required

**2. Respect for others.**
- Honour parents, teachers, elders, guests
- Respect women, children, the sick, the elderly
- Don't strike, criticise, or humiliate anyone
- Don't envy others' wealth, beauty, status

**3. Self-discipline (Atma-saiyama).**
- Control anger — Charaka calls anger the destroyer of Ojas
- Control greed, lust, attachment
- Practice patience with frustration
- Don't act impulsively when upset

**4. Hygiene + bodily care.**
- Bathe daily, keep nails clean, wear clean clothes
- Don't sleep in cluttered, dirty surroundings
- Wash hands before eating
- Tongue-scraping daily

**5. Suppress nothing, force nothing.**
- Never suppress natural urges (urine, stool, hunger, thirst, tears, yawn, sneeze, fatigue, sleep)
- But also never force them when not present
- Suppression (Vega-rodha) is classed as a major cause of Vata disorders

**6. Mental hygiene (Mana-niyama).**
- Don't dwell on past hurts
- Avoid jealousy and resentment
- Practice gratitude daily
- Maintain a daily contemplative practice (prayer, meditation, journaling)

**7. Social conduct.**
- Don't be alone in dangerous places
- Don't enter conflicts unnecessarily
- Avoid keeping company with those who erode your character
- Don't betray trust

**8. Sleep and dreams.**
- Don't sleep with feet pointing north (classical injunction — not pulse-tested by modern medicine, but a marker of preserved tradition)
- Don't sleep immediately after eating
- Don't sleep facing the bright moon directly through long periods
- Reflect on your day before sleep

**9. Sexual conduct.**
- Faithfulness to one's partner
- Avoid sexual activity during menstruation, during illness, immediately after meals, in inappropriate places
- Sex in moderation; classical texts give specific frequency guidance by age and Prakriti

**10. Conduct toward animals + nature.**
- Don't kill, harm, or torment animals
- Don't cut trees or pollute water sources
- Honour the seasons; live in rhythm with the natural world

**Why this is "preventive medicine."** Classical Ayurveda recognised that the autonomic nervous system, hormonal balance, and immune resilience are directly affected by mental state. Anger, anxiety, chronic resentment, guilt, and loneliness produce real physiological dysregulation. The Sadvritta code is, in modern terms, a structured intervention for emotional regulation, social connection, mindfulness, and ethical living — all now well-documented protective factors for chronic disease.

**Clinical application.** Many chronic conditions — hypertension, IBS, autoimmune disease, anxiety disorders, insomnia — have substantial psychological + behavioural contributions. A patient who adopts even partial Sadvritta (regular sleep, mindful eating, gratitude practice, anger management) often sees clinical improvement that medication alone cannot achieve.

**Cultural translation.** Sadvritta is sometimes mistakenly read as a religious code. It is not. Charaka writes in the secular voice of a physician giving health advice. Many modern Ayurvedic practitioners reframe Sadvritta in entirely secular terms — emotional regulation, prosocial behaviour, environmental responsibility — without losing its clinical value.

For full canonical reading: Charaka Samhita Sutrasthana 8 ("Indriyopakramaniya") verses 17-29, and Ashtanga Hridayam Sutrasthana 2 verses 19-29. The CCRAS publication "Sadvritta in Modern Practice" (2018) provides contemporary clinical applications.`,
  },

  {
    id: 'art-ayurvedic-sleep',
    title: 'Ayurvedic Principles for Sleep — The Brain\'s Most Important Nutrient',
    category: 'lifestyle',
    source: 'Charaka Samhita, Sutrasthana 21 ("Ashtaninditiya") · Ashtanga Hridayam, Sutrasthana 7/53-66',
    content: `Charaka writes that "sleep is the nurse of all life" and lists it alongside food and sexual energy as one of the three pillars (Trayopastambha) of health. Modern sleep science has independently arrived at the same conclusion — sleep is when the brain clears metabolic waste (via the glymphatic system), consolidates memory, regulates hormones, and rebuilds immune function. Classical Ayurveda offered a sophisticated framework for sleep two thousand years before EEG existed.

**Two types of sleep in Ayurveda.**
- **Bhutadhatri Nidra** — the natural, restorative sleep that comes at the right time (10 PM to 4 AM), supports tissue repair, and produces feeling refreshed on waking
- **Tamasic Nidra** — the heavy, sluggish, daytime sleep that follows heavy meals or sedentary days. Aggravates Kapha. Leaves the person more tired, not less.

**Causes of poor sleep (Anidra).** Classical Ayurveda identifies anidra (insomnia) as primarily a Vata disorder:
- Excessive worry, planning, restlessness of mind
- Irregular meal times (Vata of digestion disturbs sleep)
- Caffeine, especially after 2 PM
- Late evening intellectual work
- Excessive screen exposure before bed
- Travel, jet lag, irregular shifts
- Cold dry environment
- Suppression of urges (filling the bladder, holding stools)

**Foods that worsen sleep.**
- Heavy non-vegetarian meals at dinner
- Spicy or fried food after sunset
- Caffeine after midday
- Excessive water just before bed
- Alcohol (initially sedating, then disruptive)

**Foods that support sleep.**
- Warm milk with a pinch of nutmeg, cardamom, or saffron
- Banana before bed (kapha-sleep effect, but only for Vata/Pitta types — Kapha types should skip)
- Soaked almonds (5-7) before sleep
- Brown rice or oat porridge for dinner

**The classical bedtime routine.**

1. **Last meal by 7 PM** — at least 3 hours before sleep
2. **Light walk after dinner** — 10-15 minutes to support digestion
3. **Padabhyanga** — foot oiling with sesame or Brahmi-Bala oil. The single most effective intervention for insomnia. 5 minutes per foot, before bed.
4. **No screens 60 minutes before sleep** — replace with reading (light material), conversation, or journaling
5. **Warm milk with herbs** — turmeric, nutmeg, or saffron-cardamom milk
6. **Cool dark bedroom** — temperature around 22-24°C
7. **Sleep on left side** — classical preference; modern evidence supports this for digestion and lymphatic drainage
8. **By 10 PM** — to align with the 10 PM-2 AM tissue-repair window

**Classical Ayurvedic preparations for insomnia.**
- **Brahmi Ghritam** 1 tsp at bedtime — gentle, can be used long-term
- **Ashwagandha Choornam** 3g with warm milk — for stress-related insomnia
- **Sarpagandha Vati** — for severe cases; requires medical supervision (can lower BP)
- **Tagara (Valeriana wallichii) Choornam** 1-2g — Ayurvedic equivalent of valerian root, well-tolerated
- **Saraswatarishta** 15ml BD — comprehensive Manasika Rasayana

**Shirodhara — the gold standard for insomnia.** A 14-21 day course of daily Shirodhara with Ksheerabala Taila is the most effective Ayurvedic intervention for chronic insomnia in clinical practice. Effect is typically gradual (improvement starts by day 5-7) but sustained — many patients report continued benefit 6-12 months after the course.

**Sleep disorders in different Prakriti types.**
- **Vata** — racing thoughts, light sleep, frequent awakening. Needs grounding: ghee, milk, padabhyanga, Brahmi Ghritam.
- **Pitta** — anger-related sleep loss, waking 1-3 AM, vivid dreams. Needs cooling: coconut oil padabhyanga, Brahmi, Saraswatarishta.
- **Kapha** — excessive sleep, morning grogginess, no insomnia but poor quality. Needs lightening: early rise, no daytime sleep, Trikatu before meals.

**When to seek clinical help.** Persistent insomnia >3 weeks, sleep apnea suspicion, sleep walking, or daytime fatigue despite adequate sleep duration all warrant Ayurvedic + modern medical evaluation. AyurConnect has specialist Manasika doctors at /doctors?specialization=Manasika.

**The cost of poor sleep.** Charaka Sutrasthana 21/35 is striking: "Improper sleep destroys vitality, complexion, strength, sexual capacity, and intelligence. Proper sleep produces the opposite." Modern sleep research has confirmed this list with embarrassing precision — every item on Charaka's list (immunity, skin, muscle mass, libido, cognition) is now known to depend critically on sleep quality.

For canonical reading, see Charaka Samhita Sutrasthana 21 ("Ashtaninditiya") and Ashtanga Hridayam Sutrasthana 7 ("Annaraksha-vidhi").`,
  },

  {
    id: 'art-garbhini-pregnancy-care',
    title: 'Garbhini Paricharya — Ayurvedic Care During Pregnancy',
    category: 'lifestyle',
    source: 'Charaka Samhita, Sharirasthana 8/32 · Sushruta Samhita, Sharirasthana 10/4-13 · Ashtanga Hridayam, Sharirasthana 1/52-65',
    content: `Classical Ayurveda devotes extensive attention to pregnancy — what to eat, how to live, what to avoid, what to support — month by month for all nine months. Garbhini Paricharya is one of the oldest documented systems of prenatal care, and modern obstetric research has validated many of its specific recommendations.

**The general principles.**
1. **Garbhini is doubly nourished** — feeding the mother feeds the baby's tissues
2. **Garbhini is Vata-vulnerable** — pregnancy aggravates Vata; protect against dryness, cold, jarring
3. **Garbhini is Pitta-sensitive** — emotional regulation matters; avoid anger, anxiety, fear
4. **Avoid suppression of urges** — including urination, defecation, sneeze, yawn, hunger, sleep
5. **No medicines without explicit pregnancy clearance** — many classical preparations are explicitly contraindicated

**Foods recommended throughout pregnancy.**
- Warm cooked rice, mung dal, ghee
- Milk (warm, with cardamom or saffron after first trimester)
- Cow ghee — increases through pregnancy
- Bananas, apples, pomegranates, dates
- Almonds (soaked), walnuts (in moderation)
- Coconut water
- Fresh leafy greens (well-cooked)
- Asparagus / Shatavari

**Foods to avoid.**
- Raw papaya (powerful Vata-aggravator; classical contraindication)
- Pineapple (in excess)
- Sesame seeds (in excess; small culinary amounts fine)
- Heavy spicy food
- Leftover, fermented, or stale food
- Alcohol (absolute contraindication in classical and modern medicine)
- Tobacco (absolute contraindication)
- Raw eggs, raw fish
- Excessive salt or sour foods

**Classical Ayurvedic medicines safe in pregnancy.**
- **Shatavari Kalpa** — excellent throughout pregnancy. Female-tonic, supports lactation preparation.
- **Phala Ghrita** — particularly in the first trimester; supports embryonic development
- **Drakshadi Kashayam** — for constipation (gentle)
- **Pippalimoola Kashayam** — for occasional digestion issues
- **Tulsi-honey-water** for mild fever or cold

**Classical Ayurvedic medicines CONTRAINDICATED in pregnancy.**
- **All Guggulu preparations** (Yogaraj, Kanchanara, Triphala Guggulu — all)
- **Triphala in large doses** (small culinary doses fine)
- **All Rasashastra preparations** (Arogyavardhini, Heeraka Bhasma, Loha Bhasma, etc.)
- **Castor oil** (severe; can induce labour)
- **Pippali in large doses**
- **Most Asavas and Arishtas containing alcohol**
- **Sarpagandha** (severe)
- **Shankha Bhasma** (severe)
- **Bhilwa preparations**

**Month-by-month classical regimen (Masanumasika Paricharya).**

**Month 1.** Mainly cold milk (a small quantity, multiple times). Establishes the embryo. Avoid travel, intercourse, excessive activity, all strong medicines.

**Month 2.** Milk medicated with sweet herbs (Madhura ganas).

**Month 3.** Honey-mixed milk. Avoid heavy work; supports limb formation.

**Month 4.** Butter/ghee from milk. Supports nervous system formation.

**Month 5.** Increased ghee intake. Supports muscle development.

**Month 6.** Ghee processed with sweet herbs (Madhura ganas). For Garbhini's strength.

**Month 7.** Ghee processed with Vidari-Gandhadi (anti-Vata herbs). Supports skin + glandular development.

**Month 8.** Yavagu (medicated rice gruel) with ghee. Prevents stretch marks, supports delivery.

**Month 9.** Anuvasana Basti (medicated oil enema) under medical supervision; oil massage to lower back + perineum to prepare for delivery. Cooked rice with mild spices.

**Lifestyle (Vihara) recommendations.**
- Sleep on left side from the second trimester
- Light walking daily, especially in third trimester
- Avoid intercourse during first and last trimesters (classical practice; modern obstetric advice varies)
- Maintain Sattvic (calm, harmonious) mental state — Charaka emphasises that the mother's emotional state directly affects the developing child
- Listen to calming music; engage in spiritually nourishing activities
- Avoid arguments, news of tragedy, frightening stories

**Common pregnancy issues and Ayurvedic management.**
1. **Morning sickness** — Ginger tea, jeera water, dry biscuits before getting up
2. **Constipation** — Drakshadi Kashayam, ghee + warm water, increased fibre
3. **Heartburn** — Yashtimadhu-ghee preparation, avoid spicy food
4. **Edema** — Punarnavadi Kashayam (under doctor supervision only)
5. **Anxiety** — Brahmi Ghritam in small doses, Padabhyanga, meditation

**Why expert consultation is critical.** Pregnancy is the single situation where self-prescribing Ayurvedic medicines can cause harm. Many classical preparations have been formulated with specific contraindications for pregnancy. Even commonly-available preparations like Triphala should be dose-adjusted. Always consult an Ayurvedic doctor specifically experienced in Prasuti Tantra (Ayurvedic obstetrics).

For canonical reading: Charaka Samhita Sharirasthana 8 ("Jātisutriya") and Sushruta Sharirasthana 10 ("Garbhini-Vyākaraniya"). The Ministry of AYUSH publishes a free booklet "Prasuti Tantra: Ayurvedic Guidance for Mothers" (2019, available at ayush.gov.in).

**For 1-on-1 pregnancy care** with a CCIM-verified Prasuti Tantra specialist, book a consultation at /doctors?specialization=Prasuti%20Tantra.`,
  },

  {
    id: 'art-pathya-apathya',
    title: 'Pathya and Apathya — Ayurvedic Wholesome vs Unwholesome Foods',
    category: 'lifestyle',
    source: 'Charaka Samhita, Sutrasthana 25/45 · Ashtanga Hridayam, Sutrasthana 7/35-44',
    content: `Pathya and Apathya — wholesome and unwholesome — is the most practical food framework in Ayurveda. Charaka writes that "even the best medicine is useless if the patient eats Apathya; even without medicine, the patient observing Pathya will recover." This is not exaggeration. Modern nutrition has independently reached the same conclusion about dietary impact on chronic disease.

**The eight factors (Ashta-vidha Ahara Vidhi Visheshayatana).**
Charaka Sutrasthana 1 details eight considerations for every meal:

1. **Prakriti** — the nature of the food itself (hot/cold, heavy/light)
2. **Karana** — preparation method (boiled / fried / fermented)
3. **Samyoga** — combinations (some foods are harmful together)
4. **Rashi** — quantity
5. **Desha** — geographical context (foods native to your region)
6. **Kala** — time / season (foods that suit the current weather)
7. **Upayoga Samstha** — rules of eating (sitting, focused, before sunset)
8. **Upayokta** — the eater (your own Prakriti and digestive capacity)

A "good" food becomes "bad" when any of these eight is wrong. Cold milk in winter is wholesome; cold milk after a heavy meal is harmful. Mango in summer is appropriate; mango in cold weather aggravates Kapha.

**Universally Pathya foods (wholesome for almost everyone, most of the time).**
- Old shastika rice (rice stored 1+ year)
- Mung dal
- Wheat (in moderation)
- Ghee from cow milk
- Honey (small amounts, never heated)
- Pomegranate, grapes, raisins
- Rock salt
- Ginger (fresh and dried)
- Cardamom, coriander seeds, cumin, fennel
- Drumstick (moringa)
- Bitter gourd (in moderation)
- Mung sprouts (cooked, never raw)
- Buttermilk (with proper churning, drained)

**Universally Apathya foods (harmful in most contexts).**
- Foods left overnight without refrigeration
- Multiple-reheated food
- Heavy fried food
- Unfermented dough
- Curd / yogurt at night
- Mixing milk + fish (classical incompatibility)
- Mixing milk + radish
- Mixing milk + sour fruit
- Mixing honey + ghee in equal amounts (toxic by classical theory)
- Heated honey (poison-equivalent per classical texts)
- Very cold water immediately after hot food (causes Agni-mandya)
- Alcohol regularly
- Tobacco
- Stale or spoiled meat
- Excessive salt
- Excessive refined sugar / white flour (modern Apathya)

**Conditional Pathya (good for some, harmful for others).**

**Milk.**
- Pathya: for children, healthy adults, pregnancy, lactation, debility, Vata-Pitta types, in winter
- Apathya: in obesity, diabetes, sinusitis, indigestion, chronic skin disease, in monsoon, in Kapha types

**Curd / yogurt.**
- Pathya: in summer, in moderation, with cumin + ginger, during the day
- Apathya: at night, in autumn-winter, in skin disease, in respiratory disease, alone (without spices)

**Mango.**
- Pathya: ripe, sweet, in summer, in moderation
- Apathya: unripe, in winter, in excess, immediately after meals, with milk

**Sesame.**
- Pathya: in winter, in moderation, for elderly + Vata types, externally as oil
- Apathya: in pregnancy (in excess), in monsoon, in skin disease

**Rules of eating (Ahara Vidhi).**

1. Eat fresh, warm, properly cooked food
2. Eat at regular times — fixed within a 30-minute window
3. Eat in a calm, focused environment (not while reading / scrolling / arguing)
4. Eat only when truly hungry (when previous meal is fully digested)
5. Chew thoroughly
6. Drink only small amounts of warm water with meals; not large amounts cold
7. Sit down for meals; don't eat standing or walking
8. Stop at 75% capacity, not 100%
9. After eating, sit quietly for 5-10 minutes; then walk gently for 10 minutes
10. Don't sleep immediately after eating
11. Don't bathe immediately after eating
12. Don't engage in strenuous exercise within 2 hours of eating

**Modern correlations.** Pathya-Apathya has remarkable overlap with what current evidence-based nutrition recognises: avoid ultra-processed food, eat fresh-cooked meals, regular meal timing, mindful eating, eat dinner before sunset (consistent with chrononutrition research), avoid eating-while-stressed (cortisol-digestion interaction), avoid alcohol + tobacco.

The classical food combinations identified as harmful (Viruddha Ahara) — milk + fish, milk + sour fruit, hot food + cold drink — also correspond to recognised digestive challenges (curdling, gastric overload, peristalsis disruption).

**The clinical bottom line.** A patient who reforms diet according to Pathya-Apathya principles often experiences substantial improvement in chronic conditions — IBS, GERD, eczema, headaches, fatigue, mood disorders — before any medicine begins to act.

For canonical reading: Charaka Samhita Sutrasthana 25 ("Yajja Purushiya"), Ashtanga Hridayam Sutrasthana 7 ("Annaraksha-vidhi"), and Sushruta Sutrasthana 46 ("Annapana-vidhi"). All are available in free English translation through CCRAS at ccras.nic.in.`,
  },

  {
    id: 'art-vyayama-exercise',
    title: 'Vyayama — Ayurvedic Perspective on Exercise',
    category: 'lifestyle',
    source: 'Charaka Samhita, Sutrasthana 7/31-32 · Ashtanga Hridayam, Sutrasthana 2/10-13',
    content: `Modern fitness culture often treats exercise as either competitive sport or extreme calorie-burning. Classical Ayurveda's view of Vyayama is different — and arguably more clinically refined. Charaka writes that exercise produces lightness, work capacity, firm body, balanced doshas, and improved Agni. The text is specific about how to exercise, how much, and when not to.

**The classical definition.** Vyayama is bodily exertion performed with conscious intention. It is distinct from work, daily movement, or sport — though all of these contribute to overall activity.

**The "half-strength" principle (Ardha-Shakti).**
Charaka Sutrasthana 7/31: "Exercise should be performed to half of one's strength."

How to know you've reached half-strength? Classical signs:
- Sweat appearing on the forehead, nose, and armpits
- Breathing becoming faster but not panting
- Mouth becoming slightly dry
- Heart rate elevated but not pounding

Going beyond half-strength is considered Ati-Vyayama (over-exercise) and is classified as a cause of disease.

**Diseases from over-exercise (Ati-Vyayama-janya rogas).**
- Shrama (fatigue)
- Klama (mental exhaustion)
- Pipasa (excessive thirst)
- Kshaya (tissue depletion)
- Shvasa (dyspnoea / breathlessness)
- Kasa (cough)
- Jvara (fever)
- Chardi (vomiting)
- Rakta-pitta (bleeding disorders)
- Mood disturbance

This list reads remarkably like the modern signs of overtraining syndrome, which can include fatigue, immune suppression, mood disturbance, and unexplained performance decline.

**Who can exercise to what intensity (Vyayama-shakti).**
- **Strong / well-built** (Pravara Bala) — full half-strength, daily
- **Medium** (Madhyama Bala) — three-quarter of half-strength, alternate days
- **Weak / debilitated / elderly** (Hina Bala) — gentle movement only; brisk walking, light yoga

This Prakriti-aware approach pre-dates by millennia the modern realisation that exercise prescription must be individualised.

**When NOT to exercise.**
1. After a heavy meal — wait 2 hours
2. During illness, especially fever
3. During menstruation (light walking is OK; strenuous exercise is not)
4. In late pregnancy
5. Immediately after Panchakarma procedures
6. In very hot weather (do early morning instead)
7. In children below 5 (free play is sufficient; structured exercise is not yet appropriate)
8. In the very elderly with frailty (gentle stretching only)

**Best time to exercise.** Brahma Muhurta (early morning, before sunrise) or pre-sunset are the classical recommendations. The body's joints are loosest, the temperature is mild, and digestive fire is between meal cycles.

**Types of exercise classically recognised.**
- **Walking** — Padacharana — universally recommended
- **Wrestling** (Bahuyuddha) — for the strong
- **Lifting** (Bharavahana) — for strength
- **Swimming** (Tarana) — beneficial for many conditions
- **Yoga asanas** (formalised later in the Yoga tradition but conceptually rooted in Ayurvedic body work)

**Exercise by Prakriti.**
- **Vata** — gentle, grounding, low-impact: Hatha yoga, walking, swimming, Tai Chi. Avoid high-impact, high-intensity intervals (worsens Vata depletion).
- **Pitta** — moderate intensity, in cool environment: swimming, cycling, evening walks, evening yoga. Avoid mid-day exercise in summer.
- **Kapha** — vigorous and consistent: running, brisk walking, weight training, dance, HIIT in moderation. Most need pushed exercise to overcome inertia.

**Exercise by season.**
- **Hemanta-Shishira (winter)** — strongest exercise capacity. Use it. Strength training, longer walks, mountain hikes.
- **Vasanta (spring)** — vigorous to clear Kapha. Brisk walking, jogging.
- **Grishma (summer)** — early morning gentle. Avoid mid-day exertion.
- **Varsha (monsoon)** — light exercise; indoor preferred; avoid getting wet.
- **Sharad (autumn)** — moderate; weather is pleasant. Most types of exercise suitable.

**Exercise + the Doshas — the clinical principle.**
Exercise increases Vata-mobility, increases Pitta-fire, and decreases Kapha-mass. Therefore:
- Kapha disorders almost always improve with appropriate exercise
- Pitta disorders may worsen with excessive heat-generating exercise; choose cooling activities
- Vata disorders may worsen with high-intensity, jarring, or excessive exercise; choose grounding activities

**The dose-response curve.** Modern research has identified a J-shaped curve: too little exercise increases mortality and chronic disease risk; moderate regular exercise dramatically reduces both; excessive exercise begins to increase risk again (overtraining, joint damage, immune suppression). Ayurveda's half-strength principle places you on the optimum part of that curve.

**For Kerala patients specifically.** Walking 30-45 minutes daily, especially after meals, plus Surya Namaskara (12 rounds) in the morning, plus Pranayama (10 minutes), is the practical clinical recommendation for most patients between 25 and 70. This combination addresses Kapha-Vata balance, supports digestion, and maintains mental clarity.

For canonical reference: Charaka Samhita Sutrasthana 7 ("Navegan-Dharaniya"), verses 31-32 specifically, and Ashtanga Hridayam Sutrasthana 2 verses 10-13.`,
  },

  // ─── RESEARCH (4) ──────────────────────────────────────────────────────

  {
    id: 'art-ashwagandha-research',
    title: 'Ashwagandha (Withania somnifera) — Evidence Overview for Stress, Sleep and Performance',
    category: 'research',
    source: 'Multiple open-access publications · CCRAS-NCISM National Pharmacopoeia · Ministry of AYUSH classical-modern monograph (2018)',
    content: `Withania somnifera — Ashwagandha in Sanskrit ("smell of horse," referring to the root's odour) — is among the most-studied Ayurvedic herbs in modern science. Across over 200 published clinical and pre-clinical studies, the evidence base is substantial enough for the Indian Pharmacopoeia, US Pharmacopoeia, and several European phytotherapy authorities to recognise it as an evidence-supported adaptogen.

**Classical positioning.** Ashwagandha is classified as a Rasayana (rejuvenative) and Vajikara (vitality-supporting) herb. Charaka Samhita Chikitsasthana 1 lists it among the leading Balya (strength-giving) herbs. Its traditional uses include weakness, debility, recovery from illness, infertility, sleep disturbance, and as a general daily Rasayana.

**Active constituents.** The withanolides — a family of steroidal lactones — are the most-studied active compounds. Withaferin A and withanolide D are particularly well-characterised. Modern standardised extracts (KSM-66, Sensoril) report on withanolide percentages, typically 1.5-5%.

**Best-documented clinical applications.**

**1. Stress and anxiety.** Multiple double-blind RCTs (including Chandrasekhar et al. 2012, Lopresti et al. 2019) show that 600 mg/day of standardised Ashwagandha root extract for 8 weeks reduces serum cortisol by 22-28%, reduces Hamilton Anxiety Scale and Perceived Stress Scale scores by 30-45%, and is well-tolerated. Effect sizes are clinically meaningful — comparable to first-line CBT for mild-moderate anxiety.

**2. Sleep quality.** Langade et al. 2019 (Cureus) found significant improvement in sleep onset latency, sleep efficiency, and total sleep time with 300 mg BD for 8 weeks in patients with primary insomnia and anxiety. Effect was maintained at follow-up.

**3. Muscle strength and recovery.** Wankhede et al. 2015 (J Int Soc Sports Nutrition) found significant gains in upper-body strength, reduced exercise-induced muscle damage (lower creatine kinase), and increased lean body mass over 8 weeks of supplementation in healthy young men. Multiple subsequent studies have replicated these findings.

**4. Cognitive function.** Choudhary et al. 2017 (J Diet Suppl) showed significant improvement in memory, executive function, and information-processing speed in adults with mild cognitive complaints.

**5. Thyroid function.** Two RCTs (Sharma et al. 2018, Verma et al. 2020) have shown that Ashwagandha can modestly increase T4 and T3 in patients with subclinical hypothyroidism. This is consistent with classical claims but means **Ashwagandha is potentially contraindicated in hyperthyroidism** and should be used cautiously in patients on levothyroxine (may require dose adjustment).

**6. Male fertility.** Studies have shown improvement in semen parameters (sperm count, motility, morphology) in men with idiopathic infertility, alongside testosterone increase. Generally 5g powder daily for 90 days is the studied protocol.

**Dosing in classical practice.**
- **Choornam (powder)**: 3-6g daily with warm milk + honey at bedtime
- **Ghrita (medicated ghee)**: 1-2 tsp daily
- **Arishta (fermented liquid)**: 15-30ml BD after meals
- **Capsule/tablet (standardised extract)**: 300-600 mg/day depending on indication and product

**Safety profile.** Well-tolerated in studied doses for periods up to 8-12 weeks. Larger doses (>1500mg/day extract) have shown rare GI upset in some studies. Recent reports of rare hepatotoxicity (Lubarska et al. 2023) have prompted regulatory caution in some European countries — though causality remains debated. Routine LFT monitoring at 8 weeks is prudent for long-term users.

**Important interactions and contraindications.**
- **Hyperthyroidism** — relative contraindication due to thyroid-stimulating effect
- **Immunosuppressants** — may antagonise (Ashwagandha is immunomodulatory)
- **Sedatives (benzodiazepines)** — additive CNS depression
- **Pregnancy** — classical contraindication due to possible uterine-stimulant effect; safe use during lactation is established
- **Levothyroxine** — TSH monitoring required; may need dose reduction

**Drug interactions.** See AyurConnect's Drug Interactions checker at /dr/interactions for the most current evidence summaries.

**The classical-modern alignment.** Ashwagandha's modern profile — anxiolytic, anti-fatigue, sleep-supportive, mild thyroid-stimulating, muscle-recovery — closely matches classical claims of "strength giver, builder of body, supporter of vitality, calmer of mind." This isn't always the case with Ayurvedic herbs subjected to modern research, which makes Ashwagandha's case particularly clean.

**For clinical use.** AyurConnect doctors typically prescribe Ashwagandha as part of a multi-component regimen for stress, insomnia, post-illness recovery, and Vata-related debility. Self-prescription is reasonable for healthy adults with mild stress; pre-existing conditions warrant Ayurvedic consultation.

For published research access: Indian Journal of Psychological Medicine, Phytomedicine, Cureus, Journal of Ethnopharmacology, and the AYUSH Research Portal (ayush.gov.in/research-portal) all index peer-reviewed Ashwagandha studies.

**To find a doctor experienced in evidence-based herbal protocols,** browse /doctors?specialization=Kayachikitsa.`,
  },

  {
    id: 'art-triphala-research',
    title: 'Triphala — Evidence Overview for Digestive Health, Eye Health, and Rejuvenation',
    category: 'research',
    source: 'Multiple open-access publications · Indian Pharmacopoeia · Ministry of AYUSH classical-modern monograph',
    content: `Triphala (Sanskrit: "three fruits") — the combined dried fruits of Amalaki (Phyllanthus emblica), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula) in equal proportions — is the most universally prescribed Ayurvedic preparation. Charaka writes that "regular consumption of Triphala for a lifetime produces a hundred years of healthy life."

**Classical role.** Triphala is unique in that it is Tridosha-balancing — each of the three fruits addresses one dosha (Amalaki for Pitta, Bibhitaki for Kapha, Haritaki for Vata). It serves multiple functions simultaneously:
- Gentle laxative
- Mild Rasayana (rejuvenative)
- Eye tonic (Chakshushya)
- Digestive aid
- Liver supportive
- Oral health

**Active constituents (modern characterisation).**
- **Amalaki** — extremely high vitamin C content (heat-stable due to tannin protection), gallic acid, ellagic acid, polyphenols
- **Bibhitaki** — chebulagic acid, ellagic acid, tannic acid, polyphenols
- **Haritaki** — chebulinic acid, chebulagic acid, gallic acid, anthraquinones

The combined extract has powerful antioxidant activity in both in vitro and in vivo studies.

**Best-documented clinical applications.**

**1. Chronic constipation.** Multiple RCTs comparing Triphala 5-10g at bedtime vs polyethylene glycol or lactulose have shown comparable efficacy with significantly fewer side effects (no electrolyte disturbance, no abdominal cramping). The mechanism is gentle and multi-modal — increased bowel motility, mucosal hydration, microbiome support.

**2. Periodontal disease + oral health.** Triphala mouthwash studies show comparable efficacy to chlorhexidine for reducing plaque, gingivitis, and oral bacterial load — without chlorhexidine's side effects (staining, taste alteration, microbiome disturbance). The Indian Dental Association recommends Triphala as an alternative oral rinse.

**3. Dyslipidemia.** Several studies have shown that 5-10g Triphala daily for 12 weeks produces 10-20% LDL reduction, modest HDL increase, and triglyceride reduction. Effect is modest but consistent. Mechanism likely includes bile acid sequestration, hepatic cholesterol synthesis inhibition, and antioxidant protection of lipids.

**4. Hyperglycaemia (mild).** Mild glucose-lowering effect documented; useful as adjunct in early type 2 diabetes alongside lifestyle measures.

**5. Eye health.** Several preliminary studies have shown that Triphala water (overnight soak of 5g in 250ml water, strained, used for eyewash daily) reduces dry-eye symptoms, supports tear film stability, and may slow early cataract progression. Long-term RCT data is limited but classical practice is extensive.

**6. Microbiome modulation.** Recent studies (Peterson et al. 2017, J Altern Comp Med) have shown that Triphala modulates gut microbiota toward a more diverse profile — increasing Lactobacillus and Bifidobacterium populations. This may explain part of its multi-system benefit.

**Dosing in classical practice.**
- **Choornam (powder)**: 3-5g at bedtime with warm water for chronic constipation. With ghee for Vata constitution. With honey for Kapha.
- **For dyslipidemia**: 5-10g BD
- **As eye wash**: overnight soak of 5g in 250ml water, strained
- **As mouth rinse**: 1 tsp powder dissolved in warm water, swished for 1-2 minutes

**Safety profile.** Excellent — one of the safest classical preparations. Rare loose stools at higher doses (>10g). Generally safe in long-term use (decades of classical and modern use).

**Important interactions and contraindications.**
- **Levothyroxine** — Triphala tannins may bind thyroxine, reducing absorption. **Space by at least 4 hours.**
- **Iron supplements** — same chelation concern. Space by 2 hours.
- **Diabetes medications** — additive glucose-lowering possible; monitor with intensive medications
- **Pregnancy** — culinary doses are fine; large therapeutic doses are best avoided (especially in first trimester)
- **Chronic diarrhoea / IBS-D** — Triphala may worsen; choose Bilva or Kutaja preparations instead

**Bibhitaki controversy.** Bibhitaki has been linked in some reports to alcohol cravings — its traditional name "Aksha" relates to dice / gambling, and some classical texts caution against excessive use. Modern alcohol-cessation programmes using Bibhitaki are an interesting area of research; however, in standard Triphala (1/3 Bibhitaki), no such issues are reported.

**The classical-modern alignment.** Triphala's modern evidence — laxative, antioxidant, mild metabolic support, oral health, microbiome modulation — closely matches the classical claim of "Kayakalpa" (body rejuvenation). The hundred-year health claim is more aspirational than evidenced, but the daily-Triphala-supports-aging claim has accumulating support.

**For clinical use.** AyurConnect doctors prescribe Triphala for chronic constipation, dyslipidemia (often alongside Arjunarishta), gum disease, dry eyes, and as part of long-term Rasayana protocols for adults over 40. Daily Triphala is one of the few Ayurvedic preparations safe for indefinite use in healthy adults.

**Triphala Guggulu** (a related preparation combining Triphala with Guggulu) is distinct — used for fistula, wound healing, and certain skin conditions. Its safety profile and indications differ from plain Triphala.

For published research access: Journal of Alternative and Complementary Medicine, AYU, Phytomedicine, and the CCRAS research portal (ccras.nic.in) all index Triphala studies.

**To discuss Triphala for your specific condition,** book an Ayurvedic consultation at /online-consultation.`,
  },

  {
    id: 'art-turmeric-curcumin-research',
    title: 'Turmeric and Curcumin — Evidence Overview for Inflammation, Joints, and Liver',
    category: 'research',
    source: 'Multiple open-access publications · NCCIH (US National Center for Complementary and Integrative Health) consensus document · Ministry of AYUSH monograph',
    content: `Curcuma longa — Haridra in Sanskrit, turmeric in English — is among the most-researched plants in the world, with over 9,000 published studies. Its active compound curcumin (and related curcuminoids) has been studied for inflammation, cancer adjunct therapy, neurodegenerative disease, cardiovascular health, joint health, liver disease, and skin disorders.

**Classical positioning.** Haridra is classified as Krimighna (anti-microbial), Varnya (complexion-improving), Rakta-prasadana (blood-purifying), and Pramehaghna (anti-diabetic). It is used in 100+ classical formulations, ranging from culinary use to medicated ghees, oils, and decoctions.

**Active constituents.** Curcuminoids — curcumin, demethoxycurcumin, bisdemethoxycurcumin — are the major active compounds. Standardised extracts typically contain 95% curcuminoids. The challenge with curcumin is poor bioavailability — about 1% absorbed from typical preparations. Pepperine (from Trikatu / black pepper) increases absorption 20-fold; liposomal formulations, nano-curcumin, and phospholipid-bound preparations (Meriva, Theracurmin) increase absorption 10-30 fold.

**Best-documented clinical applications.**

**1. Osteoarthritis.** Strong evidence. The Kuptniratsaikul et al. 2014 RCT (n=367) showed turmeric extract 1500mg/day equivalent to ibuprofen 1200mg/day for knee OA pain, with significantly fewer GI side effects. Subsequent meta-analyses (Daily et al. 2016, Onakpoya et al. 2017) have confirmed clinically meaningful pain reduction.

**2. Rheumatoid arthritis (adjunct).** Curcumin 500mg BD as adjunct to DMARDs has shown improved DAS-28 scores and reduced ESR/CRP. Generally used alongside, not instead of, methotrexate.

**3. Ulcerative colitis (mild-moderate).** Hanai et al. 2006 (Clin Gastroenterol Hepatol) showed curcumin 1g BD plus sulfasalazine produced significantly lower relapse rates over 6 months than sulfasalazine alone. Several subsequent studies have replicated this.

**4. Non-alcoholic fatty liver disease.** Multiple RCTs have shown curcumin reduces ALT, AST, ultrasound steatosis grade, and improves lipid profile in NAFLD. Typical protocol: 500mg-1500mg/day for 12-24 weeks.

**5. Depression (mild-moderate).** Lopresti et al. 2014, 2015 (RCTs) showed curcumin 500mg BD comparable to fluoxetine 20mg for mild-moderate depression, with significantly fewer side effects. Newer combination studies (curcumin + saffron) show even better effect.

**6. Metabolic syndrome.** Modest improvements in glucose, lipid, and inflammatory markers. Effect size moderate; useful as adjunct.

**7. Surgical recovery.** Anti-inflammatory + wound-healing properties supported by small studies. Used post-cardiac, post-orthopaedic, and post-cancer surgery in some integrative protocols.

**Dosing.**
- **Culinary**: 1-3g daily with food (the classical Indian diet provides this naturally)
- **Powder (Haridra Choornam)**: 1-3g BD with warm milk + black pepper for joint pain
- **Standardised extract (95% curcuminoids)**: 500-1500 mg/day
- **Liposomal / phytosome curcumin**: 200-400 mg/day (higher bioavailability)
- **Topical paste** (Haridra Lepa): for skin conditions, surgical wound healing

**Safety profile.** Excellent at culinary doses. Therapeutic doses well-tolerated for periods up to 12 months. Rare GI upset (heartburn, loose stools) at higher doses.

**Important interactions and contraindications.**

- **Anticoagulants (warfarin)** — curcumin has antiplatelet activity; bleeding risk increases. Stop 2 weeks before elective surgery; avoid combination chronically without close INR monitoring.
- **Tamoxifen** — curcumin can reduce tamoxifen plasma levels via CYP3A4 induction; **avoid high-dose curcumin supplements during tamoxifen therapy.** Dietary turmeric is fine.
- **Iron supplements** — curcumin chelates iron; reduces iron absorption. Space by 2 hours.
- **Gallstones** — caution; curcumin increases bile flow which can dislodge gallstones
- **Pregnancy** — culinary doses are safe and have been part of Indian pregnancy diet for centuries. Therapeutic high-dose supplements should be avoided in pregnancy.
- **Surgery** — stop 2 weeks before elective surgery due to antiplatelet activity

**The bioavailability question — important practical note.** Plain curcumin powder swallowed with water has very low absorption. To get the studied effects:
1. Take with food (especially fat — ghee, milk, fish oil)
2. Combine with piperine (black pepper)
3. Or use a bioavailability-enhanced product (Meriva, Theracurmin, BCM-95, etc.)

Many patients report "trying turmeric and it didn't work" — usually because they took plain capsules without enhancement. The classical Indian preparation — golden milk with milk, ghee, black pepper, and turmeric — is in fact a near-optimal bioavailability cocktail.

**The classical-modern alignment.** Curcumin's modern profile — anti-inflammatory, hepatoprotective, antioxidant, mild antidepressant — aligns well with classical claims of Rakta-prasadana, Yakrit-shoshana (liver-supporting), and Tridoshashamaka properties.

**For clinical use.** AyurConnect doctors prescribe Haridra preparations across a wide range of conditions: joint disease (alongside Yogaraj Guggulu), liver disease (with Arogyavardhini Vati), skin disease (alongside Maha Manjishthadi Kashayam), and post-surgical recovery. Curcumin is one of the relatively few Ayurvedic compounds with robust modern RCT evidence.

For published research access: NCBI PubMed, Phytomedicine, J Ethnopharmacology, AYU, and the CCRAS research portal all index curcumin clinical research.

**To discuss curcumin protocols** for your condition, browse /doctors?specialization=Kayachikitsa.`,
  },

  {
    id: 'art-brahmi-cognition-research',
    title: 'Brahmi (Bacopa monnieri) — Evidence Overview for Cognition, Anxiety, and ADHD',
    category: 'research',
    source: 'Multiple open-access publications · Cochrane review of cognitive supplements · Ministry of AYUSH monograph',
    content: `Bacopa monnieri — Brahmi in Sanskrit ("the goddess of speech and intellect") — is the most-studied Ayurvedic Medhya Rasayana (intellect-promoting herb). Across 30+ controlled clinical trials, the evidence base for Brahmi in cognitive function is among the strongest for any traditional medicinal plant.

**Classical positioning.** Brahmi is the foundational Medhya Rasayana in Charaka's classical list. It is described as supporting Smriti (memory), Buddhi (intellect), Dhi (wisdom), and Dhrti (sustained attention). Traditional uses include study aids for students, recovery from mental fatigue, post-illness cognitive convalescence, epilepsy, and anxiety.

**Active constituents.** Bacosides — a family of triterpene saponins (Bacoside A and B being the most studied) — are the primary active compounds. Standardised extracts (typically 50% Bacosides) report consistent dosing.

**Best-documented clinical applications.**

**1. Memory enhancement.** Kongkeaw et al. 2014 (J Ethnopharmacology) systematic review and meta-analysis of 9 RCTs (n=518) found significant improvement in delayed word recall, attention, and choice reaction time. Effect size was small-to-moderate but consistent. Onset of benefit was typically 8-12 weeks.

**2. Anxiety.** Multiple small RCTs have shown anxiolytic effect comparable to mild benzodiazepines without sedation. Hamilton Anxiety Scale reductions of 30-50% are typical at 8-12 weeks.

**3. ADHD (children + adults).** Several open-label and a few controlled studies have shown improvement in Conners-3 scores, parent-rated attention, and academic performance in children with ADHD. Effect is more modest than methylphenidate but with substantially better side-effect profile.

**4. Age-related cognitive decline.** Studies in elderly subjects with mild cognitive complaints have shown improvement in memory, processing speed, and executive function over 12-24 weeks. Not a treatment for established dementia but useful for early cognitive aging concerns.

**5. Epilepsy (classical use).** Used as adjunct in classical practice; modern epileptology research is limited. Brahmi Ghritam is the classical preparation; not a replacement for anticonvulsants but may permit dose stabilization in some cases.

**6. Post-stroke cognitive recovery.** Small studies suggest Bacopa supports cognitive recovery after stroke. Larger trials are needed.

**Mechanism (modern understanding).** Bacopa's neuroprotective effects appear multi-modal:
- Antioxidant activity in brain tissue
- Enhanced acetylcholine availability (similar mechanism to donepezil but much milder)
- BDNF (brain-derived neurotrophic factor) upregulation
- Reduced amyloid plaque formation in animal models
- HPA axis modulation (cortisol-buffering effect)

**Dosing.**
- **Brahmi Choornam (powder)**: 3-6g daily, often with milk
- **Brahmi Ghritam (medicated ghee)**: 1-2 tsp daily before meals — particularly recommended for children, elderly, and patients with anxiety + cognitive concerns combined
- **Standardised extract (50% Bacosides)**: 300-600 mg/day
- **Saraswatarishta** (combined fermented preparation): 15-30 ml BD after meals — comprehensive Medhya formulation

**Onset of effect.** Unlike caffeine or other quick stimulants, Brahmi requires 8-12 weeks of consistent use before significant cognitive benefit is observed. This is an important counselling point — patients expecting next-day improvement will discontinue prematurely.

**Safety profile.** Generally excellent. Mild GI upset (especially powder taken on empty stomach) is the most common side effect. Mild sedation in some users (use at bedtime). No serious adverse events reported in studies up to 12 months.

**Important interactions and contraindications.**
- **Phenytoin** — Brahmi may alter phenytoin metabolism via CYP3A4. Monitor phenytoin levels if Brahmi added to a stable regimen. Avoid in poorly controlled epilepsy.
- **Levothyroxine** — same tannin-binding concern as Triphala; space by 4 hours.
- **Antidepressants (TCAs, SSRIs)** — generally compatible; additive effect possible. No serious interactions reported.
- **Sedatives** — additive sedation possible.
- **Pregnancy** — generally avoided in first trimester (classical caution); safe in second-third trimester for anxiety + insomnia under supervision.
- **Bradycardia** — Bacopa has very mild bradycardic activity; caution in patients on beta-blockers.

**Special considerations for children.** Brahmi Ghritam has been used in Indian children for centuries; modern studies support cognitive benefit in ADHD children. Dosing should be age-adjusted (typically 1/4 to 1/2 tsp ghritam daily). Pediatric Ayurvedic consultation is recommended before sustained use in children.

**Different preparations for different patients.**
- **Brahmi Ghritam** — gentle, suitable for children, elderly, anxious patients
- **Brahmi Choornam** — straightforward, suitable for healthy adults
- **Saraswatarishta** — comprehensive Medhya combination; better for combined cognitive + emotional symptoms
- **Standardised extract** — convenient for research-validated dosing

**The classical-modern alignment.** Brahmi's modern profile — gentle nootropic, anxiolytic, neuroprotective — closely matches classical claims. The classical claim that Brahmi works through tissue-level changes over weeks (not instant stimulation) aligns with modern understanding of BDNF and acetylcholine upregulation over 2-3 months.

**For clinical use.** AyurConnect doctors recommend Brahmi for: chronic anxiety + insomnia combined; mild cognitive complaints in adults 40+; pediatric ADHD as adjunct or alternative to first-line allopathic; post-illness cognitive convalescence; high-stress periods (exam preparation, demanding work transitions).

For published research access: Journal of Ethnopharmacology, Phytomedicine, AYU, Indian Journal of Psychological Medicine, and the AYUSH research portal index Brahmi studies.

**To discuss Brahmi for your situation,** browse /doctors?specialization=Manasika for Manasika (Ayurvedic mental wellness) specialists.`,
  },
]

// ─── MAIN ────────────────────────────────────────────────────────────────
async function main() {
  console.log('seeding 20 original AyurConnect-authored articles…')

  for (const a of ARTICLES) {
    await prisma.knowledgeArticle.upsert({
      where: { id: a.id },
      update: { title: a.title, content: a.content, category: a.category, source: a.source, language: a.language ?? 'en' },
      create: { id: a.id, title: a.title, content: a.content, category: a.category, source: a.source, language: a.language ?? 'en' },
    })
  }

  // Counts per category for reporting
  const byCategory: Record<string, number> = {}
  for (const a of ARTICLES) byCategory[a.category] = (byCategory[a.category] ?? 0) + 1

  console.log('✓ articles seeded:', { total: ARTICLES.length, ...byCategory })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
