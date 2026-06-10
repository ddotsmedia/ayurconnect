// 30 SEO articles — 20 English + 10 Malayalam. Tagged "AI-generated content
// — pending medical review" at footer per editorial policy. Upsert by
// deterministic id so re-runs are safe.

import type { PrismaClient } from '@prisma/client'

type Article = { id: string; title: string; content: string; category: string; language: string; source?: string }

const FOOTER_EN = '\n\n---\n_AI-generated educational content — pending medical review. For diagnosis and personalised treatment, consult a verified BAMS / MD-Ayurveda doctor. Find one at https://ayurconnect.com/doctors._\n_Author: AyurConnect Editorial._'
const FOOTER_ML = '\n\n---\n_AI സൃഷ്ടിച്ച വിദ്യാഭ്യാസ ഉള്ളടക്കം — മെഡിക്കൽ റിവ്യൂ പെൻഡിംഗ്. വ്യക്തിഗത ചികിത്സയ്ക്കായി, https://ayurconnect.com/doctors എന്ന വിലാസത്തിൽ verified ആയുർവേദ ഡോക്ടറെ കാണുക._\n_Author: AyurConnect Editorial._'

const ARTICLES: Article[] = [
  // ─── English (20) ────────────────────────────────────────────────────
  { id: 'a2-en-01', language: 'en', category: 'guide', source: 'AyurConnect Editorial',
    title: 'Ayurveda Doctor Online — How to Choose the Right Practitioner',
    content: `An online Ayurveda consultation is only as good as the doctor on the other side of the camera. Here is how to evaluate practitioners credibly.

**1. Verify credentials.** BAMS (5.5 years) is the minimum qualification — many add MD-Ayurveda (3 more years, specialisation). Cross-check Kerala State Medical Council (KSMC) registration. AyurConnect surfaces this verification on every profile.

**2. Lineage matters.** Kerala has a 2000-year tradition. Doctors trained at the Government Ayurveda Colleges (Thiruvananthapuram, Ernakulam, Tripunithura, Kannur) bring institutional rigor. Those from Ashtavaidya lineages bring family transmission. Both are legitimate.

**3. Specialisation.** A general BAMS handles most conditions, but complex cases need MD specialists — Kayachikitsa (internal medicine), Panchakarma, Prasuti Tantra (gynaecology), Manasika (mental health), Shalakya (ENT/eye).

**4. Language.** For diaspora patients, a Malayalam-speaking practitioner often unlocks better history-taking. Filter by language on the directory.

**5. Practice mode.** Some doctors are teleconsult-only; others combine in-person Kerala practice with online follow-ups. Both work — pick what matches your access.

**6. Red flags.** Avoid anyone promising "cure" in days, prescribing combinations without examining your prescription list, or selling unverified products alongside consultation.

For the diaspora, the verified Kerala-trained doctor on AyurConnect is more credible than a local clinic with unverified credentials.${FOOTER_EN}`,
  },
  { id: 'a2-en-02', language: 'en', category: 'guide', source: 'AyurConnect Editorial',
    title: 'Kerala Ayurveda Consultation — What to Expect',
    content: `Your first Kerala Ayurveda consultation differs from a modern medical appointment in important ways. Here is the structure.

**Ashtavidha Pariksha (8-fold examination).** Pulse (Nadi), urine, stool, tongue, voice, touch, eyes, overall appearance. The doctor reads doshas, dhatus, and dosha imbalance through these.

**Prakriti analysis.** Your dosha constitution — Vata, Pitta, Kapha, or combinations. This determines diet, lifestyle, and treatment for life.

**Vikriti.** The current imbalance — what brought you here. Often different from your Prakriti.

**Detailed diet + lifestyle history.** What you eat, how, when, your sleep, exercise, mental state, stress. This takes 20-30 minutes.

**Past medical history + current medications.** Critical. Many herbs interact with prescription drugs (Ashwagandha + thyroxine, Curcumin + warfarin). Bring your full prescription list.

**Treatment plan.** Combines internal medicines (Kashayam, Choornam, Vati, Bhasma), external therapies (Abhyanga, Sirodhara, Panchakarma if indicated), dietary correction (Pathya-Apathya), and lifestyle (Dinacharya, Ritucharya).

**Follow-up cadence.** Typically 2 weeks for the first review, then monthly. Symptoms often start improving within 3 weeks for digestive issues, 6-8 weeks for skin / musculoskeletal, 3-6 months for chronic systemic conditions.

A good consultation is unhurried — 45-60 minutes for a first visit is normal.${FOOTER_EN}`,
  },
  { id: 'a2-en-03', language: 'en', category: 'treatment', source: 'AyurConnect Editorial',
    title: 'Panchakarma Treatment in Kerala — Complete Guide',
    content: `Panchakarma is the centrepiece of classical Ayurveda — five purification procedures designed to clear accumulated doshas. Here is the structure of a typical course.

**Purvakarma (preparation, 3-7 days).** Snehana (internal + external oleation) softens accumulated doshas. Swedana (sudation) mobilises them.

**The 5 main procedures.** (1) Vamana — controlled emesis for Kapha disorders, asthma, skin disease. (2) Virechana — purgation for Pitta — psoriasis, migraine, fatty liver. (3) Basti — medicated enema, considered the most powerful, especially for Vata — arthritis, back pain, infertility. (4) Nasya — nasal medication for head + neck conditions — sinusitis, hair fall, migraine. (5) Raktamokshana — bloodletting (rarely done now; specific indications).

**Paschat Karma (post-procedure, 7-14 days).** Samsarjana Krama — graduated dietary reintroduction. This phase is non-negotiable; skipping it disrupts results.

**Best season.** Karkidaka (mid-July to mid-August, Kerala monsoon) is the classical window — body absorbs oils deepest in humid monsoon. October-March is the alternative dry-comfort window.

**Where.** Verified NABH or AYUSH-classified centres. Avoid resort spas calling themselves Panchakarma — most lack proper physician supervision.

**Duration.** 14 days minimum for benefit, 21 days classical full course, 28 days deep rejuvenation. Less is wellness, not Panchakarma.

**Cost.** ₹68,000-2,00,000 depending on duration, centre tier, and procedures.${FOOTER_EN}`,
  },
  { id: 'a2-en-04', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurvedic Treatment for PCOS — A Natural Approach',
    content: `PCOS affects 1 in 5 Indian women of reproductive age. Modern hormonal therapy (OCPs, metformin) manages symptoms but rarely addresses root causes. Ayurveda offers a complementary root-cause approach.

**Ayurvedic understanding.** PCOS maps to Aartava-kshaya (diminished menstrual flow) and Granthi (cystic formation). The root cause is Kapha-Medas dushti in the reproductive channels (Aartavavaha-srotas) with secondary Vata aggravation.

**Treatment pillars.** (1) Shodhana — Virechana Panchakarma to clear Kapha-Medas. (2) Shamana — classical formulations: Shatavari, Ashoka, Kanchanara Guggulu, Phala Ghrita. (3) Aahar-Vihar — Kapha-pacifying diet, structured exercise, weight management.

**Lifestyle.** Wake before sunrise. 30-min walk daily. Largest meal at noon. Eliminate refined sugar, dairy after evening, processed food. Sleep by 10pm.

**Realistic timeline.** Cycle regulation in 3-6 months. Insulin sensitivity improvement in 6-9 months. Fertility outcomes in 9-18 months for women trying to conceive.

**Combination with modern medicine.** Continue prescribed metformin if needed. Ayurveda works alongside, not instead of, modern endocrinology — especially if you are trying to conceive.

**When to see a Vaidya.** Irregular cycles for more than 90 days, acne with hirsutism, central weight gain, family history of PCOS. Earlier intervention = better outcomes.${FOOTER_EN}`,
  },
  { id: 'a2-en-05', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurveda for Diabetes Management — Diet, Herbs, and Lifestyle',
    content: `Type-2 diabetes is "Prameha" in classical Ayurveda — described as 20 distinct types. Modern Ayurveda complements (never replaces) prescribed metformin / insulin.

**Mechanism.** Kapha-Medas dushti weakens insulin sensitivity; concurrent Pitta aggravation drives glycation + complications.

**First-line herbs.** Vijaysar (Pterocarpus marsupium) — classical anti-diabetic. Salacia oblonga (Saptarangi) — clinically validated insulin-sensitiser. Methi seed soaked overnight — single best dietary intervention.

**Classical formulations.** Nishakathakadi Kashayam (twice daily), Asanadi Choornam (bedtime), Madhumeha Kushmanda Rasayana.

**Diet.** Eliminate refined sugar, white rice, refined wheat. Favour millets (ragi, jowar, bajra), barley, whole pulses, bitter vegetables (bitter gourd, methi greens, drumstick).

**Lifestyle.** 30-min walk after every meal — single most disease-modifying intervention. Weight loss of 5-10 kg often reverses early Type-2 diabetes.

**Critical.** Continue your prescribed diabetes medication. Self-stopping is dangerous. Ayurveda + modern medicine, in partnership, is the right model.

**Monitoring.** HbA1c every 3 months. FBS + PPBS weekly while titrating. Annual eye + kidney + foot exam.

**When to see a Vaidya AND endocrinologist together.** That joint care model is becoming common at NABH-accredited Kerala Ayurveda hospitals.${FOOTER_EN}`,
  },
  { id: 'a2-en-06', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Best Ayurvedic Treatment for Arthritis — Kerala Therapies',
    content: `Arthritis — both osteoarthritis (Sandhi Vata) and rheumatoid (Aamavata) — responds well to Kerala's classical Vata-pacification protocols.

**Signature Kerala therapies.** Pizhichil — warm medicated oil bath; arguably the most effective Ayurvedic therapy for chronic joint pain. 14-21 daily sessions. Njavarakizhi — rice bolus fomentation; strengthens periarticular tissue. Janu Basti / Kati Basti — local oil retention for knee / back. Sarvanga Dhara — full-body oil pour.

**Internal formulations.** Maharasnadi Kashayam (twice daily) for Vata predominance. Rasnaerandadi Kashayam for Aamavata. Yogaraj Guggulu (warning: anticoagulant interaction) for Vata-Kapha pattern.

**Panchakarma.** Basti is the cornerstone for arthritis — 8, 16, or 30-day courses depending on severity.

**Realistic timeline.** Mild pain relief in 2 weeks. Functional improvement in 6-8 weeks. Structural changes (cartilage support) over 6-12 months.

**Lifestyle.** Daily Abhyanga with Mahanarayana Tailam. Pre-dawn walk in dry conditions (avoid damp / cold). Anti-Vata diet — warm, oily, mildly salty, no raw / cold / dry foods.

**Don't combine.** Avoid stacking Yogaraj Guggulu with warfarin or other anticoagulants — there is a clinically documented interaction.

**Centres.** Arya Vaidya Sala Kottakkal, Vaidyaratnam Ollur, Sanjeevanam Ernakulam are gold-standard for chronic joint disease.${FOOTER_EN}`,
  },
  { id: 'a2-en-07', language: 'en', category: 'guide', source: 'AyurConnect Editorial',
    title: 'Ayurveda for Weight Loss — Sustainable Approach',
    content: `Crash diets fail because they don't address Agni (digestive fire) or constitutional patterns. Ayurveda's approach is slower (2-4 kg/month) but sustained.

**Identify your dosha pattern.** Kapha excess = central obesity, slow metabolism, low energy. Vata-related obesity is rarer — anxiety-driven irregular eating. Pitta-Kapha = mid-life weight gain with insulin resistance.

**Kerala signature: Udvartana.** Daily massage with medicated powder (Kolakulathadi Choornam) — mobilises subcutaneous fat. 14-21 sessions.

**Internal Lekhana.** Triphala Guggulu (anti-lipid), Medohar Vati, Varanadi Kashayam.

**Diet rules.** Warm, light, dry, spiced foods. No refined sugar, no white rice, no dairy after evening. Largest meal at noon. Skip late dinners.

**Movement.** Pre-dawn brisk walk + 20-min surya namaskar daily. Add strength training 2x/week to preserve muscle.

**Sleep.** 7-8h non-negotiable. Late sleep disrupts cortisol + leptin, drives weight gain.

**Karkidaka period.** Mid-July to mid-August Kerala monsoon — the natural Ayurvedic season for metabolic reset.

**Long-term.** Aim for 0.5 kg/week sustained loss. Faster = muscle loss + rebound.${FOOTER_EN}`,
  },
  { id: 'a2-en-08', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurvedic Treatment for Thyroid Disorders',
    content: `Modern thyroxine is non-negotiable for hypothyroidism. Ayurveda complements — it can reduce required dose over time (with physician supervision) and address symptoms thyroxine doesn't (weight, fatigue, hair fall, mental fog).

**Hypothyroidism is Kapha-Medas dushti.** Hyperthyroidism is Pitta excess. The treatment differs accordingly.

**Cornerstone formulation.** Kanchanara Guggulu — synergistic action on thyroid + glandular tissue. Take twice daily with warm water.

**Supporting herbs.** Varunadi Kashayam (Kapha-Medas reduction). Brahmi Ghrita (mental fog). Triphala (daily detox).

**Avoid.** Excessive soy, raw cruciferous vegetables (raw cabbage, broccoli) — these interfere with thyroid hormone absorption. Cooked is fine.

**Favor.** Iodine-rich diet — sea vegetables, rock salt. Walking 30 min daily. Gentle yoga (Sarvangasana with physician approval).

**Critical interaction.** Ashwagandha can stimulate thyroid output — never combine with thyroxine without medical supervision; risks iatrogenic hyperthyroidism.

**Monitoring.** TSH every 6-8 weeks during Ayurvedic treatment. Dose may need to come down as Ayurveda support kicks in.

**Realistic.** TSH improvement in 8-12 weeks. Sustained reduction requires 6-12 months of disciplined practice.${FOOTER_EN}`,
  },
  { id: 'a2-en-09', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurveda for Hair Fall — Causes and Kerala Remedies',
    content: `Hair fall (Khalitya) involves Bhrajaka Pitta vitiation + Rakta dushti + weak Asthi-poshana (bone tissue nourishment, of which hair is a sub-tissue).

**Topical pillar.** Neelibhringadi Tailam — classical Kerala hair oil; daily Shiroabhyanga (scalp massage) for 21+ days reverses early hair fall.

**Internal pillar.** Amalaki Rasayana (1 tsp daily) for Rakta-Asthi support. Bhringaraja for hair regrowth.

**Procedural pillar.** Nasya (medicated nasal drops, Anu Taila) targets the head region — clinically effective for chronic Khalitya.

**Diet correction.** Eliminate excessive Pitta foods (sour pickles, vinegar, excess coffee, alcohol). Add Amla, sesame seeds, black sesame, pumpkin seeds, soaked almonds.

**Lifestyle.** Avoid hot water on scalp — lukewarm only. Reduce smartphone use in bed (circadian disruption depresses hair-root metabolism). 7-8h sleep — hair grows during deep sleep.

**Premature greying (Palitya).** Same protocols + Bhringaraja oil specifically. Greying that started before 30 has stronger Pitta-Rakta cause.

**Realistic timeline.** Reduction in hair fall in 6-8 weeks. New growth visible at 12-16 weeks. Sustained results require 6-12 months of practice.

**When to escalate.** If patchy baldness (alopecia areata) — see a Vaidya AND a dermatologist; this is autoimmune and needs systemic management.${FOOTER_EN}`,
  },
  { id: 'a2-en-10', language: 'en', category: 'treatment', source: 'AyurConnect Editorial',
    title: 'Sirodhara Treatment — Benefits, Procedure, and Cost',
    content: `Sirodhara — continuous warm medicated oil stream on the forehead — is among the most evocative Kerala therapies. It is also one of the most clinically supported.

**Procedure.** Patient lies supine. Warm medicated oil (typically Ksheerabala or Brahmi Tailam) is poured in a continuous stream onto the Ajna point (mid-forehead) from a hanging vessel, for 45-60 minutes per session.

**Indications.** Insomnia, anxiety, migraine, hypertension, chronic stress, PTSD, premature greying, hair fall.

**Evidence.** Multiple peer-reviewed studies (Uebaba K, J Altern Complement Med 2008) document Sirodhara's effects on EEG (increased alpha waves), cortisol reduction, and reduced anxiety scores. Among the best-documented Ayurvedic procedures.

**Course.** 7-14 daily sessions for therapeutic benefit. 21 sessions for chronic insomnia.

**Cost.** ₹1,000-2,500 per session at verified Kerala centres. Total course ₹15,000-50,000.

**Best centres.** Arya Vaidya Sala Kottakkal, Vaidyaratnam Ollur, Somatheeram (resort-format), Kalari Kovilakom (luxury), Sanjeevanam (clinical-format).

**Variations.** Takra Dhara (medicated buttermilk) for Pitta-Vata pattern. Ksheera Dhara (medicated milk) for severe Vata.

**Contraindications.** Acute cold/cough, very low BP, recent head injury, alcohol intoxication on the day.

**Pairs well with.** Abhyanga (full body massage) + Shirobhyanga (head massage) as a 75-90 minute combined daily session.${FOOTER_EN}`,
  },
  { id: 'a2-en-11', language: 'en', category: 'treatment', source: 'AyurConnect Editorial',
    title: "Pizhichil Treatment — Kerala's Signature Therapy",
    content: `Pizhichil — warm medicated oil bath — is uniquely Kerala. It combines Snehana (oleation) + Swedana (sudation) in one procedure, making it deeply Vata-pacifying.

**Procedure.** Patient lies on a Droni (wooden treatment table). Warm medicated oil is squeezed from cotton cloths dipped in the oil, continuously bathing the body. Two therapists synchronise pouring + gentle massage for 45-60 minutes.

**Indications.** Rheumatoid arthritis, osteoarthritis, chronic neuropathy, post-stroke rehabilitation, multiple sclerosis support, frozen shoulder, sciatica, fibromyalgia.

**Evidence.** Effective in reducing pain scores + improving range of motion in degenerative joint disease. Less studied than Sirodhara but clinically powerful.

**Course.** 14-21 daily sessions for therapeutic effect.

**Cost.** ₹2,000-4,000 per session. Total ₹30,000-80,000.

**Best season.** Karkidaka (mid-July to mid-August) — body absorbs oils deepest in monsoon. October-March alternative.

**Best centres.** Arya Vaidya Sala Kottakkal, Vaidyaratnam, Sanjeevanam — these have the trained 2-therapist teams Pizhichil requires.

**Pre-requisites.** Internal Snehana (Pana / Anuvasana Basti) typically precedes Pizhichil. The Vaidya determines the sequencing.

**Pairs with.** Njavarakizhi (rice bolus fomentation) on alternating days for maximum Vata pacification.${FOOTER_EN}`,
  },
  { id: 'a2-en-12', language: 'en', category: 'treatment', source: 'AyurConnect Editorial',
    title: 'Njavarakizhi — The Rice Bolus Therapy of Kerala',
    content: `Njavarakizhi (Shashtika Shali Pinda Sweda) uses cloth boluses of cooked Njavara (a special 60-day rice) and herbal milk to provide deep, nourishing fomentation.

**Procedure.** Special Njavara rice is cooked with herbal decoctions + milk. The hot mass is tied into cloth boluses. Therapists rhythmically massage + tap the body with the warm boluses for 45 minutes.

**Indications.** Muscle wasting, post-paralytic recovery, polio sequelae, muscular dystrophy support, sports rehabilitation, chronic fatigue with muscle weakness.

**Mechanism.** Deeply nourishing — the rice provides Brimhana (anabolic) effect, herbal milk adds Snehana, sustained warmth softens fascia + improves circulation.

**Course.** 7-14 daily sessions. Often paired with Pizhichil on alternating days.

**Cost.** ₹1,800-3,500 per session. Total ₹15,000-50,000.

**Karkidaka classical timing.** August (Karkidaka month) is the classical Kerala season — body absorbs nutrition deepest.

**Centres.** Arya Vaidya Sala Kottakkal is the gold standard. Vaidyaratnam, Sitaram Beach Retreat for resort format.

**Contraindications.** Acute Pitta conditions, severe Kapha-Medas excess, skin disease.

**Why Kerala-specific.** The Njavara rice is grown only in Kerala — short 60-day cycle, specific medicinal properties. Authentic Njavarakizhi requires this rice.${FOOTER_EN}`,
  },
  { id: 'a2-en-13', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurveda for Stress and Anxiety — Natural Solutions',
    content: `Anxiety is a Vata-Pitta-Manas disturbance. Modern SSRIs work but have side effects + dependence concerns. Ayurveda offers complementary herbal + procedural support.

**Cornerstone herbs.** Brahmi (Bacopa monnieri) — clinically proven anxiolytic + cognitive enhancer. Ashwagandha — adaptogen, 27.9% cortisol reduction in RCT (Chandrasekhar 2012). Jatamansi — calming for severe anxiety. Tagara — Indian Valerian for sleep-onset anxiety.

**Classical formulations.** Saraswatarishta (twice daily). Manasamithra Vatakam (severe Manasika disorders). Brahmi Ghrita (1 tsp bedtime).

**Procedural.** Shirodhara — most documented procedure for anxiety + insomnia. 7-14 sessions can replace benzodiazepine dependence.

**Lifestyle.** Daily 10-min Anuloma-Viloma + Bhramari pranayama. 30-min walking outdoors. No caffeine after 2pm. Screen-free 60 min before sleep.

**Diet.** Eliminate Vata aggravators: cold/raw food, irregular meal timing, excess coffee + alcohol. Add Brahmi tea, Tulsi tea, almond milk with cardamom.

**Realistic timeline.** Symptom reduction in 2-4 weeks. Sustained improvement requires 3-6 months of disciplined practice.

**Critical.** If on SSRIs, do not stop suddenly. Ayurveda + modern psychiatric care together is the right model.${FOOTER_EN}`,
  },
  { id: 'a2-en-14', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurvedic Treatment for Insomnia — Sleep Better Naturally',
    content: `Insomnia (Anidra) is primarily Vata-Manas disturbance. Modern sleeping pills work short-term but create dependence. Ayurveda restores sleep architecture.

**The 3 pillars.** Sleep hygiene + herbal support + Sirodhara (where accessible).

**Herbs.** Brahmi Ghrita (1 tsp at bedtime). Jatamansi Choornam. Tagara (Indian Valerian) — works as well as melatonin for sleep onset. Saraswatarishta for anxiety-driven insomnia.

**Sirodhara course.** 7-14 daily sessions can re-set chronic insomnia. Most clinically supported Ayurvedic intervention.

**Sleep hygiene.** No screens 60 min before bed. No caffeine after 2pm. Cool, dark, screen-free bedroom. Fixed sleep + wake times. Pada Abhyanga (foot massage with Brahmi or sesame oil) for 10 min before bed.

**Diet.** Warm milk with cardamom + nutmeg before bed (classical recipe). Avoid late heavy meals — last meal 3h before sleep. No alcohol — disrupts REM sleep.

**Realistic timeline.** Sleep onset improves in 2-3 weeks. Sleep maintenance (waking at 3am pattern) takes 6-8 weeks to address.

**Critical.** If on prescription sleep medication, taper under physician supervision while building Ayurvedic support. Sudden discontinuation can rebound.${FOOTER_EN}`,
  },
  { id: 'a2-en-15', language: 'en', category: 'condition', source: 'AyurConnect Editorial',
    title: 'Ayurveda for Skin Diseases — Psoriasis, Eczema, and More',
    content: `Chronic skin disease is Pitta-Rakta dushti — the root cause is in the blood + gut. Topical steroids suppress; Ayurveda addresses root.

**Conditions covered.** Psoriasis (Eka Kushta), chronic eczema, atopic dermatitis, allergic skin, fungal recurrence.

**Cornerstone Panchakarma.** Virechana (medicated purgation) — clears Pitta + Rakta dushti from gut + blood. 7-day prep + 1-day Virechana + 7-day Samsarjana. Single most disease-modifying intervention.

**Internal formulations.** Aragvadhadi Kashayam, Mahatiktaka Ghrita, Khadirarishta, Patolakaturohinyadi Kashayam.

**Topical.** Eladi Tailam for chronic eczema. Karpooradi Tailam for inflammatory plaques. Avoid steroid creams as primary — they cause rebound.

**Diet.** Eliminate Viruddha Aahara (incompatible foods): fish + milk, hot + cold combinations. No excessive sour (curd, vinegar, pickles) or salty (papad, namkeen) for 60 days.

**Lifestyle.** Cotton clothes only. Triphala 1 tsp warm water nightly for bowel regularity (constipation worsens skin disease). Sun exposure 15 min daily.

**Centres specialising in chronic skin.** Arya Vaidya Sala, Vaidyaratnam, Sanjeevanam. Patient-led centres with experienced Panchakarma teams.

**Realistic.** Visible improvement in 6-8 weeks. Sustained remission requires 6-12 months + lifelong dietary discipline.${FOOTER_EN}`,
  },
  { id: 'a2-en-16', language: 'en', category: 'seasonal', source: 'AyurConnect Editorial',
    title: 'Karkidaka Chikitsa — Why Monsoon is the Best Time for Ayurveda',
    content: `Karkidaka is the Malayalam month corresponding to mid-July to mid-August — the classical Kerala monsoon season. It is THE traditional Ayurvedic rejuvenation window.

**Why monsoon.** During monsoon, humidity opens skin pores + softens body channels (srotas). Medicated oils penetrate deepest. Body's natural Vata aggravation makes it the right time for Vata-pacifying therapies.

**Karkidaka Kanji.** The classical rejuvenation gruel — 25+ herbs cooked with red rice, coconut milk, jaggery. Taken daily for 7-14 days. Restores Agni, builds Ojas (immunity), prepares body for the year ahead.

**Panchakarma timing.** The most therapeutically potent Panchakarma is in Karkidaka. 21-28 day residential courses.

**Daily routine adjustments.** Wake later (sunrise rises later in monsoon). Avoid cold/raw food. Favor warm, light, easily-digestible meals. Steam inhalation daily.

**Foods to favor.** Old red rice (njavara), moong dal, ghee, cooked vegetables, warm spices (ginger, turmeric, black pepper), gooseberry.

**Foods to avoid.** Curd, raw salads, cold drinks, deep-fried foods, alcohol.

**Diaspora visitors.** Karkidaka Chikitsa packages at Kerala centres cost ₹140,000-2,00,000 for 21 days residential. Book 3 months ahead — popular slots fill fast.

**Modern evidence.** Studies show 8-12% reduction in inflammatory markers + improvement in lipid profile after a Karkidaka Panchakarma course.${FOOTER_EN}`,
  },
  { id: 'a2-en-17', language: 'en', category: 'location', source: 'AyurConnect Editorial',
    title: 'Ayurvedic Doctor in Dubai — Finding Authentic Kerala Practitioners',
    content: `Dubai has the world's largest concentration of DHA-licensed Kerala-trained Ayurveda doctors outside India.

**DHA licensing standards.** Doctors must hold valid BAMS + KSMC registration + DHA examination + minimum 3 years post-graduate practice. This standard is strict — most globally fail.

**Where to find them.** Karama (multiple clinics), Al Nahda, Jumeirah, Al Barsha, Dubai Silicon Oasis, Al Qusais. AyurConnect's verified directory shows DHA registration on each profile.

**What good clinics offer.** Dosha assessment + Ashtavidha Pariksha (8-fold examination) on first visit. Classical formulations imported from Kerala (Arya Vaidya Sala, Vaidyaratnam, Oushadhi). Properly equipped Panchakarma treatment room. Malayalam-speaking reception.

**Costs.** First consult AED 250-500. Standard Panchakarma session AED 250-500. 14-day course AED 5,000-10,000.

**Red flags.** Promised cures in days. Combination + medicine selling without examination. No DHA license publicly displayed. No proper sterilisation protocols.

**Top tip.** For complex conditions, do an initial assessment in Dubai + the residential course in Kerala (cheaper, more therapeutic). The Dubai doctor can do follow-up.

**Insurance.** Most UAE insurers don't cover Ayurveda. Niva Bupa + Star Health offer Ayurveda riders for UAE residents.

**Heal-in-Kerala combination.** Many Dubai doctors are part of networks with Kerala centres — they refer for residential Panchakarma + handle follow-ups.${FOOTER_EN}`,
  },
  { id: 'a2-en-18', language: 'en', category: 'location', source: 'AyurConnect Editorial',
    title: 'Ayurvedic Doctor in Abu Dhabi — Your Complete Guide',
    content: `Abu Dhabi's Ayurveda landscape mirrors Dubai's at smaller scale — DOH-licensed doctors at handful of well-established clinics.

**DOH licensing.** Abu Dhabi Department of Health licenses Ayurveda doctors with similar rigor to DHA — BAMS + KSMC + DOH examination.

**Where.** Khalidiya, Al Bateen, Al Reem Island, Tourist Club area. Smaller clinic count than Dubai (5-8 vs Dubai's 30+).

**Direct flights.** Abu Dhabi-Trivandrum, Abu Dhabi-Kochi direct daily on Etihad + Air India Express. 4h flight time. Many patients combine Abu Dhabi assessment + Kerala residential course.

**Costs similar to Dubai.** First consult AED 300-500. Panchakarma session AED 300-500.

**Practical tips.** Most Abu Dhabi doctors network with the Karama Dubai cluster — referrals across emirates are routine. The Malayali community in Abu Dhabi (~50,000) supports a thriving Ayurveda ecosystem.

**Insurance.** Same as Dubai — confirm before booking. Some employer health plans (especially for medical-tourism categories) cover wellness Ayurveda.

**Best season.** October-March for outpatient consults. Heal-in-Kerala for residential Panchakarma — mid-July to mid-August (Karkidaka) or November-February.

**For Abu Dhabi Malayalees.** Combination care — DOH-licensed local clinic + verified Kerala doctor via teleconsult — is increasingly the model.${FOOTER_EN}`,
  },
  { id: 'a2-en-19', language: 'en', category: 'guide', source: 'AyurConnect Editorial',
    title: 'Online Ayurveda Consultation — Benefits and How It Works',
    content: `Teleconsultation has democratised access to senior Kerala-trained Ayurveda doctors. Here's how it works.

**What you need.** Smartphone or laptop with camera + good internet. AyurConnect's Daily.co-backed video room works in all standard browsers.

**Pre-consultation.** Fill the intake form — chief complaint, medical history, current medications, dosha self-assessment. Upload recent blood reports.

**The consultation itself.** 30-60 minutes. Doctor reviews intake, asks history, does visual examination via camera (tongue, eyes, complexion). Cannot do Nadi Pariksha (pulse) remotely — that's the main limitation.

**Output.** Detailed prescription (classical formulations + dosage + duration). Lifestyle + diet recommendations. Follow-up timeline. Often Malayalam + English version.

**When teleconsult works well.** Chronic conditions (skin, digestive, hormonal). Follow-up care. Mental health support. Diet + lifestyle guidance. Second opinions.

**When in-person matters.** Acute conditions requiring pulse examination. First-time Panchakarma planning. Complex cases requiring physical assessment (joints, abdominal palpation).

**Cost.** ₹500-2,500 per session depending on doctor seniority. International patients pay in INR or local currency via Razorpay.

**Medicine sourcing.** Classical Kerala formulations can be shipped internationally from Arya Vaidya Sala, Vaidyaratnam, Oushadhi — most ship to UAE, UK, USA, AU.

**Verify.** Always check the doctor's KSMC registration + AyurConnect verification badge before booking.${FOOTER_EN}`,
  },
  { id: 'a2-en-20', language: 'en', category: 'guide', source: 'AyurConnect Editorial',
    title: 'Kerala Ayurveda vs Generic Ayurveda — What Makes It Different',
    content: `"Ayurveda" is a global label, but the Kerala tradition has distinct features that justify its premium reputation.

**Lineage rigor.** Kerala has the unbroken Ashtavaidya tradition — 8 hereditary Namboodiri physician families (Pulamanthole Mooss, Vaidyamadham, Thaikkattu Mooss, etc.). 30+ generations of continuous transmission.

**Texts.** Kerala has produced classical compendiums other regions don't have — Sahasrayogam, Chikitsamanjari, Vaidyamanorama, Alattur Manipravalam. These are still actively used.

**Procedural depth.** Pizhichil, Njavarakizhi, Sirodhara, Karkidaka Chikitsa — these are uniquely developed in Kerala over centuries. Other regions have borrowed but rarely match the Kerala execution.

**Government infrastructure.** Kerala has 3 government Ayurveda colleges (Thiruvananthapuram, Tripunithura, Kannur) under KUHS / NCISM. Plus state-classified centres (Diamond/Gold/Silver) regulated by Kerala Tourism.

**Pharmaceutical industry.** Arya Vaidya Sala Kottakkal, Vaidyaratnam, Oushadhi (Kerala govt PSU), AVP Coimbatore, Pankajakasthuri — these GMP-certified manufacturers produce 80%+ of authentic classical formulations sold worldwide.

**Climate.** Kerala's tropical-humid climate is uniquely suited to Panchakarma. The Karkidaka monsoon timing is impossible to replicate elsewhere.

**Language.** Malayalam is intricately tied to classical Kerala Ayurveda. Many texts haven't been fully translated. Malayalam-fluent practitioners access nuances others miss.

**Result.** When you book "authentic Kerala Ayurveda", you are buying into 2000+ years of accumulated expertise + infrastructure no other region can replicate.${FOOTER_EN}`,
  },

  // ─── Malayalam (10) ──────────────────────────────────────────────────
  { id: 'a2-ml-01', language: 'ml', category: 'treatment', source: 'AyurConnect Editorial',
    title: 'പഞ്ചകർമ്മ ചികിത്സ — സമ്പൂർണ്ണ വിവരണം',
    content: `പഞ്ചകർമ്മ കേരള ആയുർവേദത്തിന്റെ ഹൃദയമാണ്. ശരീരത്തിലെ വർദ്ധിച്ച ദോഷങ്ങളെ ശുദ്ധീകരിച്ച് രോഗത്തിന്റെ വേരോടെ പറിച്ചുകളയുന്ന 5 വിശുദ്ധി പ്രക്രിയകൾ.

**5 പ്രധാന കർമ്മങ്ങൾ.** വമനം (കഫ രോഗങ്ങൾക്ക്), വിരേചനം (പിത്ത-രക്ത രോഗങ്ങൾക്ക്), ബസ്തി (വാത രോഗങ്ങൾക്ക് — ഏറ്റവും ശക്തമായത്), നസ്യം (ശിരോ-ഗ്രീവ പ്രദേശം), രക്തമോക്ഷണം (ചില പ്രത്യേക സന്ദർഭങ്ങളിൽ).

**തയ്യാറെടുപ്പ് (പൂർവകർമ്മം).** സ്നേഹനം (ആന്തരിക + ബാഹ്യ സ്നേഹനം) ദോഷങ്ങളെ ലയിപ്പിക്കുന്നു. സ്വേദനം ദോഷങ്ങളെ കോശങ്ങളിൽ നിന്ന് രക്തയിലേക്ക് കൊണ്ടുവരുന്നു.

**ശേഷ പരിചരണം.** സംസർജന ക്രമം — ക്രമേണയുള്ള ആഹാര പുനഃസ്ഥാപനം. ഈ ഘട്ടം ഒഴിവാക്കരുത് — ഫലങ്ങൾ പിറകോട്ടു പോകും.

**മികച്ച സീസൺ.** കർക്കിടകം (മധ്യ ജൂലൈ — മധ്യ ഓഗസ്റ്റ്) — കേരള മൺസൂൺ കാലത്ത് ശരീരം ഏറ്റവും കൂടുതൽ ഔഷധം സ്വീകരിക്കുന്നു.

**വ്യാപ്തി.** കുറഞ്ഞത് 14 ദിവസം. 21 ദിവസം പൂർണ്ണ കോഴ്സ്. 28 ദിവസം ആഴത്തിലുള്ള പുനരുജ്ജീവനത്തിന്.

**ചെലവ്.** ₹68,000-₹2,00,000 — സ്ഥാപനത്തിന്റെ നിലവാരം, ദൈർഘ്യം, വർഗ്ഗീകരണം എന്നിവ അനുസരിച്ച്.

**മികച്ച സ്ഥാപനങ്ങൾ.** ആര്യ വൈദ്യ ശാല കോട്ടക്കൽ, വൈദ്യരത്നം ഓളൂർ, സഞ്ജീവനം എറണാകുളം — NABH അംഗീകൃതം.${FOOTER_ML}`,
  },
  { id: 'a2-ml-02', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'PCOS-ന് ആയുർവേദ ചികിത്സ',
    content: `പിസിഒഎസ് ഇന്ത്യയിലെ പ്രജനന പ്രായത്തിലുള്ള 5-ൽ 1 സ്ത്രീകളെ ബാധിക്കുന്നു. ആധുനിക ഹോർമോൺ ചികിത്സ ലക്ഷണങ്ങൾ കൈകാര്യം ചെയ്യുന്നു; ആയുർവേദം മൂല കാരണത്തെ അഭിസംബോധന ചെയ്യുന്നു.

**ആയുർവേദ ധാരണ.** പിസിഒഎസ് ആർത്തവ-ക്ഷയം (ആർത്തവ കുറവ്) + ഗ്രന്ഥി (സിസ്റ്റ് രൂപീകരണം) ആയി കാണുന്നു. ആർത്തവവഹ സ്രോതസ്സിലെ കഫ-മേദ ദുഷ്ടി + വാത വർദ്ധനവ് ആണ് വേര്.

**ചികിത്സാ തൂണുകൾ.** (1) ശോധനം — കഫ-മേദ പുറത്തേക്ക് കളയാൻ വിരേചന പഞ്ചകർമ്മം. (2) ശമനം — ശതാവരി, അശോക, കാഞ്ചനാര ഗുഗ്ഗുലു, ഫല ഘൃതം. (3) ആഹാര-വിഹാര — കഫ-ശമന ഭക്ഷണം, വ്യായാമം, ഭാരം നിയന്ത്രണം.

**ജീവിതശൈലി.** സൂര്യോദയത്തിന് മുമ്പ് എഴുന്നേൽക്കുക. ദിവസവും 30 മിനിറ്റ് നടത്തം. ഉച്ചയ്ക്കാണ് ഏറ്റവും കൂടിയ ഭക്ഷണം. ശുദ്ധീകരിച്ച പഞ്ചസാര, വൈകുന്നേരത്തിന് ശേഷം പാൽ, പാക്കേജുചെയ്ത ഭക്ഷണം ഒഴിവാക്കുക. രാത്രി 10 മണിക്ക് ഉറങ്ങുക.

**ഫല കാലയളവ്.** 3-6 മാസത്തിൽ ആർത്തവം ക്രമപ്പെടും. 6-9 മാസത്തിൽ ഇൻസുലിൻ സെൻസിറ്റിവിറ്റി മെച്ചപ്പെടും. ഗർഭധാരണത്തിന് 9-18 മാസം ശ്രമിക്കുന്നവർക്ക്.

**മെറ്റ്ഫോർമിൻ ഒഴിവാക്കരുത്.** ആയുർവേദം ആധുനിക എൻഡോക്രൈൻ ചികിത്സയോടൊപ്പമാണ് — പ്രത്യേകിച്ച് ഗർഭധാരണത്തിന് ശ്രമിക്കുമ്പോൾ.${FOOTER_ML}`,
  },
  { id: 'a2-ml-03', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'പ്രമേഹ നിയന്ത്രണം ആയുർവേദത്തിലൂടെ',
    content: `പ്രമേഹം (മധുമേഹം) ക്ലാസിക്കൽ ആയുർവേദത്തിൽ "പ്രമേഹം" എന്നറിയപ്പെടുന്നു — 20 വ്യത്യസ്ത തരങ്ങൾ വിവരിച്ചിട്ടുണ്ട്. ആധുനിക മെറ്റ്ഫോർമിൻ / ഇൻസുലിൻ ചികിത്സയ്ക്കൊപ്പമാണ് ആയുർവേദം പ്രവർത്തിക്കുന്നത്.

**മൂല കാരണം.** കഫ-മേദ ദുഷ്ടി ഇൻസുലിൻ സെൻസിറ്റിവിറ്റി കുറയ്ക്കുന്നു; സഹായക പിത്ത വർദ്ധനവ് സങ്കീർണതകൾ വർദ്ധിപ്പിക്കുന്നു.

**പ്രാഥമിക ഔഷധികൾ.** വിജയസാർ (പ്രമേഹ-വിരുദ്ധ ക്ലാസിക്കൽ). സലാസിയ — ക്ലിനിക്കലി തെളിയിക്കപ്പെട്ട ഇൻസുലിൻ-സെൻസിറ്റൈസർ. വെന്തയം (ഉലുവ വിത്ത്) രാത്രി കുതിർത്ത് രാവിലെ കഴിക്കുക.

**ക്ലാസിക്കൽ ഔഷധങ്ങൾ.** നിശാകഥകാദി കഷായം (ദിവസവും 2 തവണ). ആസനാദി ചൂർണ്ണം (രാത്രി). മധുമേഹ കൂശ്മാണ്ഡ രസായനം.

**ആഹാരം.** ശുദ്ധീകരിച്ച പഞ്ചസാര, വെള്ള അരി, ശുദ്ധീകരിച്ച ഗോതമ്പ് ഒഴിവാക്കുക. ചാമ, റാഗി, ജോവർ, ബാർലി, പയറുകൾ, കയ്പുള്ള പച്ചക്കറികൾ ധാരാളം.

**ജീവിതശൈലി.** ഓരോ ഭക്ഷണത്തിനു ശേഷവും 30 മിനിറ്റ് വേഗത്തിലുള്ള നടത്തം — ഏറ്റവും രോഗ-പരിവർത്തന ഇടപെടൽ.

**നിർണ്ണായക.** നിങ്ങളുടെ പ്രമേഹ മരുന്ന് സ്വയം നിർത്തരുത്. ആയുർവേദ + ആധുനിക വൈദ്യശാസ്ത്രം ഒരുമിച്ച് — ശരിയായ മാതൃക.

**നിരീക്ഷണം.** HbA1c ഓരോ 3 മാസത്തിലും. വാർഷിക നേത്ര + വൃക്ക + പാദ പരിശോധന.${FOOTER_ML}`,
  },
  { id: 'a2-ml-04', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'മുടികൊഴിച്ചിലിന് ആയുർവേദ പരിഹാരം',
    content: `മുടി കൊഴിച്ചിൽ (ഖാലിത്യം) ഭ്രാജക പിത്തത്തിന്റെ വൈകൃതം + രക്ത ദുഷ്ടി + ദുർബലമായ അസ്ഥി-പോഷണത്തിന്റെ ഫലമാണ്.

**ബാഹ്യ ചികിത്സ.** നീലിഭൃംഗാദി തൈലം — ക്ലാസിക്കൽ കേരള എണ്ണ; 21+ ദിവസം ദിവസേന ശിരോഭ്യംഗം (തലയിൽ മസാജ്) ആദ്യഘട്ട മുടികൊഴിച്ചിലിനെ പിന്നോട്ടാക്കും.

**ആന്തരിക ചികിത്സ.** ആമലകി രസായനം (ദിവസവും 1 ടീസ്പൂൺ). ഭൃംഗരാജ — മുടി പുനർവളർച്ചയ്ക്ക്.

**നടപടിക്രമം.** നസ്യം (മൂക്കിലൂടെ ഔഷധ തുള്ളികൾ, അണു തൈലം) — തലയിലെ പ്രദേശത്തെ നേരിട്ട് സ്വാധീനിക്കുന്നു. ദീർഘകാല ഖാലിത്യത്തിന് ക്ലിനിക്കലി ഫലപ്രദം.

**ആഹാര തിരുത്തലുകൾ.** അമിതമായ പിത്ത ഭക്ഷണം (പുളിച്ച അച്ചാർ, വിനാഗിരി, അമിത കാപ്പി, മദ്യം) ഒഴിവാക്കുക. നെല്ലിക്ക, എള്ള്, കരുവേലം, മത്തങ്ങാ വിത്ത് ചേർക്കുക.

**ജീവിതശൈലി.** തലയിൽ ചൂട് വെള്ളം ഒഴിവാക്കുക — ഇളം ചൂട് മാത്രം. കിടക്കയിൽ സ്മാർട്ട്ഫോൺ ഉപയോഗം കുറയ്ക്കുക. 7-8 മണിക്കൂർ ഉറക്കം — മുടി ആഴത്തിലുള്ള ഉറക്കത്തിലാണ് വളരുന്നത്.

**യാഥാർത്ഥ്യ കാലയളവ്.** 6-8 ആഴ്ചയിൽ മുടികൊഴിച്ചിൽ കുറയും. 12-16 ആഴ്ചയിൽ പുതിയ വളർച്ച ദൃശ്യമാകും.${FOOTER_ML}`,
  },
  { id: 'a2-ml-05', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'നടുവേദനയ്ക്ക് ആയുർവേദ ചികിത്സ',
    content: `നടു വേദന (കടി ശൂല) വാത ദോഷത്തിന്റെ വൈകൃതമാണ് — കേരളത്തിന്റെ ക്ലാസിക്കൽ വാത-ശമന പ്രോട്ടോക്കോളുകൾ ഏറ്റവും ഫലപ്രദമാണ്.

**കേരള പ്രത്യേക ചികിത്സകൾ.** കടി ബസ്തി — നടു പ്രദേശത്ത് ചൂട് ഔഷധ എണ്ണ നിലനിർത്തുന്ന തെറാപ്പി; 7-14 സെഷനുകളിൽ ഭൂരിഭാഗം പേർക്കും ദീർഘകാല വേദന ശമനം. പിജിച്ചിൽ — ഞറയിൽ പ്രദേശത്തെ വാത പ്രശ്നങ്ങൾക്ക്. നവരക്കിഴി — പേശി ദുർബലത ഉള്ളപ്പോൾ. സർവാംഗ ധാര — സമഗ്ര വാത ശമനത്തിന്.

**ആന്തരിക ഔഷധങ്ങൾ.** മഹാരാസ്നാദി കഷായം (ദിവസവും 2 തവണ). ഗന്ധർവഹസ്ത തൈലം (1 ടീസ്പൂൺ രാത്രി — മൃദുവായ വിരേചകം). യോഗരാജ ഗുഗ്ഗുലു.

**ഡിസ്ക് പ്രശ്നങ്ങൾ.** ഡിസ്ക് പ്രോലാപ്സ് ഉണ്ടെങ്കിൽ ഇംഗ്ലിഷ് വൈദ്യൻ + ആയുർവേദ വൈദ്യൻ രണ്ടും കൂടി കാണുക. ആയുർവേദം പേശി പിന്തുണ + ദീർഘകാല വാത ശമനത്തിന് സഹായിക്കും.

**ജീവിതശൈലി.** ദിവസവും അഭ്യംഗം മഹാനാരായണ തൈലത്തിൽ. കടുപ്പമേറിയ പുറം ഉറപ്പുള്ള കിടക്ക. ഇരുവശങ്ങളിലുമുള്ള തലയണ പ്രയോഗം. വാത ശമന ആഹാരം — ചൂട്, എണ്ണയുള്ളത്, മൃദുവായി ഉപ്പുരസമുള്ളത്.

**യാഥാർത്ഥ്യ കാലയളവ്.** മൃദുവായ വേദന ശമനം 2 ആഴ്ചയിൽ. ഫങ്ഷണൽ മെച്ചപ്പെടുത്തൽ 6-8 ആഴ്ചയിൽ.${FOOTER_ML}`,
  },
  { id: 'a2-ml-06', language: 'ml', category: 'seasonal', source: 'AyurConnect Editorial',
    title: 'കർക്കിടക കഞ്ഞി — ഔഷധ ഗുണങ്ങളും തയ്യാറാക്കുന്ന വിധവും',
    content: `കർക്കിടക കഞ്ഞി കേരളത്തിന്റെ ക്ലാസിക്കൽ പുനരുജ്ജീവന ആഹാരമാണ് — 25+ ഔഷധികൾ ചേർന്ന ഒരു സമൂല രസായനം. കർക്കിടകം മാസത്തിൽ 7-14 ദിവസം ദിവസേന കഴിക്കുന്നു.

**ഉള്ളടക്കം.** ചുവന്ന അരി (നവര ശാലി), തേങ്ങാപ്പാൽ, ശർക്കര, പുളിയിലവർഗങ്ങൾ (പുളിയില, ചുക്ക്, കരുവേലം, പെരുംജീരകം, അഷ്ടചൂർണ്ണം, ദശമൂലം), പശുവിൻ നെയ്യ്.

**ഔഷധ ഗുണങ്ങൾ.** അഗ്നി ദീപനം (ദഹനശക്തി പുനഃസ്ഥാപനം). ഓജസ് നിർമ്മാണം (പ്രതിരോധശേഷി). ദോഷ സന്തുലനം. കർക്കിടകത്തിലെ ദുർബല ദഹനത്തെ ശക്തിപ്പെടുത്തുന്നു.

**തയ്യാറാക്കുന്ന വിധം.** 100g ചുവന്ന അരി + 500ml വെള്ളം. അരി മൃദുവാകുന്നതുവരെ വേവിക്കുക. ഔഷധി പൊടികൾ (10g) ചേർക്കുക. തേങ്ങാപ്പാൽ + ശർക്കര ചേർത്ത് 5 മിനിറ്റ് വേവിക്കുക. അവസാനം 1 ടീസ്പൂൺ നെയ്യ് ചേർക്കുക.

**കഴിക്കേണ്ട വിധം.** രാവിലെ ഒഴിഞ്ഞ വയറ്റിൽ. 7-14 ദിവസം. ദിവസത്തെ മറ്റ് ഭക്ഷണം ലഘുവായി — കിച്ചഡി, പച്ചക്കറി സൂപ്പ്. തൈര്, അസിഡിക് പഴങ്ങൾ, അസിഡിക് ഭക്ഷണം ഒഴിവാക്കുക.

**ആർക്ക് യോജിക്കും.** മിക്കവർക്കും. പ്രമേഹ രോഗികൾ ശർക്കരയ്ക്ക് പകരം സ്റ്റിവിയ ഉപയോഗിക്കാം. ഗർഭിണികൾ വൈദ്യന്റെ നിർദ്ദേശം തേടണം.

**മൂല്യം.** വാർഷിക പ്രതിരോധശേഷി മെച്ചപ്പെടുത്തൽ, ദഹന അഗ്നി പുനഃസ്ഥാപനം, വർഷം മുഴുവനും ഊർജ്ജം നൽകൽ.${FOOTER_ML}`,
  },
  { id: 'a2-ml-07', language: 'ml', category: 'guide', source: 'AyurConnect Editorial',
    title: 'ആയുർവേദ ഡോക്ടറെ ഓൺലൈനിൽ കാണാം',
    content: `ടെലികൺസൾട്ടേഷൻ കേരളത്തിലെ മുതിർന്ന ആയുർവേദ ഡോക്ടർമാരെ ലോകത്തെവിടെയും കാണാൻ സഹായിക്കുന്നു. ഇതാ എങ്ങനെ.

**എന്ത് വേണം.** സ്മാർട്ട്ഫോൺ അല്ലെങ്കിൽ ലാപ്ടോപ് + ക്യാമറ + നല്ല ഇന്റർനെറ്റ്. AyurConnect-ന്റെ വീഡിയോ റൂം എല്ലാ സാധാരണ ബ്രൗസറുകളിലും പ്രവർത്തിക്കും.

**മുമ്പ് തയ്യാറാകൽ.** ഇൻടേക്ക് ഫോം പൂരിപ്പിക്കുക — പ്രധാന പരാതി, വൈദ്യചരിത്രം, നിലവിലെ മരുന്നുകൾ, പ്രകൃതി സ്വയം-വിലയിരുത്തൽ. അടുത്തിടെയുള്ള രക്ത പരിശോധന അപ്ലോഡ് ചെയ്യുക.

**കൺസൾട്ടേഷൻ.** 30-60 മിനിറ്റ്. ഡോക്ടർ ഇൻടേക്ക് അവലോകനം ചെയ്യുന്നു, ചരിത്രം ചോദിക്കുന്നു, ക്യാമറയിലൂടെ വിഷ്വൽ പരിശോധന (നാവ്, കണ്ണുകൾ, ചർമ്മം). നാഡി പരീക്ഷ ദൂരത്തുനിന്ന് സാധ്യമല്ല — അതാണ് പ്രധാന പരിമിതി.

**ഔട്ട്പുട്ട്.** വിശദമായ കുറിപ്പടി (ക്ലാസിക്കൽ ഔഷധങ്ങൾ + ഡോസ് + കാലയളവ്). ജീവിതശൈലി + ഭക്ഷണ ശുപാർശകൾ. ഫോളോ-അപ് ടൈംലൈൻ. പലപ്പോഴും മലയാളം + ഇംഗ്ലീഷ് പതിപ്പ്.

**ടെലികൺസൾട്ട് നല്ലത് എപ്പോൾ.** ദീർഘകാല രോഗങ്ങൾ (ചർമ്മ, ദഹന, ഹോർമോൺ). ഫോളോ-അപ്. മാനസിക ആരോഗ്യ പിന്തുണ. ജീവിതശൈലി മാർഗ്ഗനിർദ്ദേശം.

**നേരിട്ടുള്ളത് വേണ്ടത് എപ്പോൾ.** അക്യൂട്ട് അവസ്ഥകൾ, പഞ്ചകർമ്മ ആസൂത്രണം.

**ചെലവ്.** ₹500-₹2,500 ഓരോ സെഷനും. അന്താരാഷ്ട്ര രോഗികൾ Razorpay വഴി പ്രാദേശിക കറൻസിയിൽ.

**ഔഷധ വിതരണം.** ക്ലാസിക്കൽ കേരള ഔഷധങ്ങൾ ആര്യ വൈദ്യ ശാല, വൈദ്യരത്നം എന്നിവയിൽ നിന്ന് UAE, UK, USA, AU വരെ ഷിപ്പ് ചെയ്യും.${FOOTER_ML}`,
  },
  { id: 'a2-ml-08', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'ത്വക് രോഗങ്ങൾക്ക് കേരള ആയുർവേദ ചികിത്സ',
    content: `ദീർഘകാല ത്വക് രോഗങ്ങൾ (സോറിയാസിസ്, എക്സിമ, വിട്ടുമാറാത്ത ഡെർമറ്റൈറ്റിസ്) പിത്ത-രക്ത ദുഷ്ടിയാണ് — മൂല കാരണം രക്തത്തിലും കുടലിലുമാണ്. സ്റ്റീറോയിഡ് ക്രീമുകൾ അമർത്തുന്നു; ആയുർവേദം മൂലത്തെ അഭിസംബോധന ചെയ്യുന്നു.

**മൂല കാരണ പഞ്ചകർമ്മം.** വിരേചനം (ഔഷധ വിരേചനം) — കുടലിൽ നിന്നും രക്തത്തിൽ നിന്നും പിത്ത + രക്ത ദുഷ്ടി ശുദ്ധീകരിക്കുന്നു. 7 ദിവസം തയ്യാറെടുപ്പ് + 1 ദിവസം വിരേചനം + 7 ദിവസം സംസർജനം.

**ആന്തരിക ഔഷധങ്ങൾ.** ആരഗ്വധാദി കഷായം. മഹാതിക്തക ഘൃതം. ഖദിരാരിഷ്ടം. പടോലകടുരോഹിണ്യാദി കഷായം.

**ബാഹ്യ പ്രയോഗം.** വിട്ടുമാറാത്ത എക്സിമയ്ക്ക് ഏലാദി തൈലം. കല്ലംസീ പ്ലാക്കുകൾക്ക് കർപ്പൂരാദി തൈലം. സ്റ്റീറോയിഡ് ക്രീമുകൾ പ്രാഥമികമായി ഒഴിവാക്കുക — അവ റീബൗണ്ട് ഉണ്ടാക്കുന്നു.

**ആഹാരം.** വിരുദ്ധ ആഹാരം (പൊരുത്തമില്ലാത്തവ) ഒഴിവാക്കുക: മത്സ്യം + പാൽ, ചൂട് + തണുപ്പ് കോമ്പിനേഷനുകൾ. അമിത പുളിച്ച (തൈര്, വിനാഗിരി, അച്ചാർ) അല്ലെങ്കിൽ ഉപ്പുള്ള (പപ്പട്, നംകീൻ) 60 ദിവസത്തേക്ക് ഒഴിവാക്കുക.

**ജീവിതശൈലി.** കോട്ടൺ വസ്ത്രങ്ങൾ മാത്രം. ത്രിഫല 1 ടീസ്പൂൺ ചൂട് വെള്ളത്തിൽ രാത്രി കുടൽ ക്രമത്തിന്. ദിവസവും 15 മിനിറ്റ് സൂര്യപ്രകാശം.

**യാഥാർത്ഥ്യം.** 6-8 ആഴ്ചയിൽ ദൃശ്യമായ മെച്ചപ്പെടുത്തൽ. നിലനിൽക്കുന്ന ഇളവിന് 6-12 മാസം + ജീവിതാന്ത്യ ഭക്ഷണ ശിക്ഷണം.${FOOTER_ML}`,
  },
  { id: 'a2-ml-09', language: 'ml', category: 'condition', source: 'AyurConnect Editorial',
    title: 'ഗർഭകാല ആയുർവേദ പരിചരണം',
    content: `ഗർഭകാല ആയുർവേദ പരിചരണം (ഗർഭിണി പരിചര്യ) ക്ലാസിക്കൽ ആയുർവേദത്തിലെ വളരെ വികസിതമായ ഒരു മേഖലയാണ്. കേരള പാരമ്പര്യം പ്രസവ-മുൻ കാലത്തെ മാസാദി പരിചര്യയിൽ പ്രത്യേക ശ്രദ്ധ നൽകുന്നു.

**ആദ്യത്രയം (മാസം 1-3).** ഷട്ധര തിലത് കഷായം. പാൽ + നെയ്യ് + പഞ്ചസാര അടങ്ങിയ ലഘു ആഹാരം. ദുർബല ഏക്കാദശ ദുർബല ഘട്ടം.

**രണ്ടാം ത്രയം (മാസം 4-6).** ശതാവരി ഘൃതം (ജനനേന്ദ്രിയ പോഷണം). മാധുര വർഗ്ഗീയ ഭക്ഷണങ്ങൾ വർദ്ധിപ്പിക്കുക — കരുവേലം, ദ്രാക്ഷ, ശർക്കര.

**മൂന്നാം ത്രയം (മാസം 7-9).** അനുവാസന ബസ്തി — സൂക്ഷ്മമായ വാത ശമനത്തിന് (വൈദ്യൻ മാത്രമേ നൽകൂ). പ്രസവത്തെ സുഗമമാക്കാൻ ദശമൂല കഷായം.

**ഒഴിവാക്കേണ്ടത്.** കടുപ്പമേറിയ വ്യായാമം. അമിത പിത്ത ഭക്ഷണം (പുളിച്ച, അമിത സുഗന്ധവ്യഞ്ജനങ്ങൾ). ഭക്ഷണ ഉപവാസം. ദേശാന്തര യാത്രകൾ. അമിത ജോലിസമ്മർദ്ദം.

**ദിനചര്യ.** രാവിലെ 6-7 മണിക്ക് എഴുന്നേൽക്കുക. ദിവസവും അഭ്യംഗം (എള്ളെണ്ണ കൊണ്ട് മൃദുവായി). 5 ചെറിയ ഭക്ഷണങ്ങൾ. പ്രാണായാമം (നാട്ടി ശുദ്ധി മാത്രം — കടുപ്പമേറിയത് ഒഴിവാക്കുക). രാത്രി 10 മണിക്ക് ഉറങ്ങുക.

**മാനസിക ആരോഗ്യം.** സരസ്വതാരിഷ്ടം (മാനസിക സന്തുലനത്തിന്). ദിവസവും 10 മിനിറ്റ് ധ്യാനം. പോസിറ്റീവ് സാഹിത്യം വായിക്കുക.

**നിർണ്ണായക.** നിങ്ങളുടെ ഒബ്സ്റ്റട്രീഷ്യൻ + ആയുർവേദ വൈദ്യൻ രണ്ടും കൂടി കാണുക. ആധുനിക + പരമ്പരാഗത പരിചരണം ഒരുമിച്ച് — അമ്മയ്ക്കും കുഞ്ഞിനും മികച്ച ഫലങ്ങൾ.${FOOTER_ML}`,
  },
  { id: 'a2-ml-10', language: 'ml', category: 'heritage', source: 'AyurConnect Editorial',
    title: 'അഷ്ടവൈദ്യ പാരമ്പര്യവും കേരള ആയുർവേദവും',
    content: `അഷ്ടവൈദ്യ പാരമ്പര്യം കേരള ആയുർവേദത്തിന്റെ ജീവനാഡിയാണ് — 8 പാരമ്പര്യ നമ്പൂതിരി വൈദ്യ കുടുംബങ്ങൾ, 30+ തലമുറകളിലൂടെ കൈമാറിയ ജ്ഞാനം.

**8 പ്രധാന അഷ്ടവൈദ്യ കുടുംബങ്ങൾ.** പുലമന്തോളെ മൂസ്സ് (പാലക്കാട്, ശാല്യ + കായചികിത്സ). വൈദ്യമഠം (പെരുമ്പാവൂർ, പ്രസൂതി + കായചികിത്സ). തൈക്കാട്ട് മൂസ്സ് (തിരുവനന്തപുരം, ശാലാക്യ + കായചികിത്സ). ആലത്തൂർ (തൃശൂർ, ദന്ത ചികിത്സ + കായചികിത്സ). എലയിടത്ത് (തിരുവനന്തപുരം, കാർമിക + കായചികിത്സ). കുട്ടഞ്ചേരി (തൃശൂർ, ശാല്യ + കായചികിത്സ). ചിറത്തണാൽ (പത്തനംതിട്ട, വിഷ ചികിത്സ). ത്രക്കണാടി (തൃശൂർ, കായചികിത്സ).

**അവർ കാത്തുരക്ഷിച്ച ഗ്രന്ഥങ്ങൾ.** സഹസ്രയോഗം — കേരളത്തിന്റെ ഏറ്റവും വ്യാപകമായി ഉപയോഗിക്കുന്ന ഫാർമക്കോപ്പിയ. ചികിത്സാമഞ്ജരി. ആലത്തൂർ മണിപ്രവാളം. വൈദ്യമനോരമ. ഇവ ഇപ്പോഴും കേരള ആയുർവേദ കോളേജുകളിൽ പഠിപ്പിക്കുന്നു.

**ചികിത്സാ പ്രത്യേകത.** ഓരോ കുടുംബത്തിനും അവരുടെ പ്രത്യേക സിദ്ധികൾ — കൈമാറിയ ഔഷധ പാചകം, പ്രത്യേക നാടി പരീക്ഷ ടെക്നിക്കുകൾ, ദുർലഭ ഔഷധികളുടെ ഉപയോഗം.

**ആധുനിക സന്ദർഭം.** പല അഷ്ടവൈദ്യ കുടുംബങ്ങളും ഇപ്പോൾ ആധുനിക BAMS + MD ബിരുദങ്ങൾ നേടി, പരമ്പരാഗത ജ്ഞാനത്തെ ആധുനിക സ്ഥാപനവൽകൃത വൈദ്യശാസ്ത്രവുമായി ലയിപ്പിക്കുന്നു.

**വൈദ്യമഠം പുണരാഗമം.** ചില അഷ്ടവൈദ്യ കുടുംബങ്ങൾ ഇപ്പോഴും അവരുടെ ക്ലിനിക്കുകൾ പ്രവർത്തിപ്പിക്കുന്നു — ദുർലഭമായ ജ്ഞാന-ശേഖരത്തിന്റെ വ്യക്തിഗത സംപർക്കം.

**മൂല്യം.** അഷ്ടവൈദ്യ പാരമ്പര്യം കേരള ആയുർവേദത്തിന്റെ "ആധികാരികത" ലേബലിന്റെ ഇടം — അന്യഥാ വാണിജ്യവൽകൃതമായ ഈ വ്യവസായത്തിലെ വൈശിഷ്ട്യം.${FOOTER_ML}`,
  },
]

export async function seedArticlesV2(prisma: PrismaClient): Promise<{ count: number }> {
  for (const a of ARTICLES) {
    const { id, ...data } = a
    await prisma.knowledgeArticle.upsert({
      where:  { id },
      update: data,
      create: { id, ...data },
    })
  }
  return { count: ARTICLES.length }
}
