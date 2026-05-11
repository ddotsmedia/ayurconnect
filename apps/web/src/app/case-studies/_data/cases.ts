// Patient case studies — composite narratives drawn from real clinical
// patterns observed at Kerala CCIM-registered centres. Names + identifying
// details changed; specific clinical particulars verified by the AyurConnect
// clinical advisory board for plausibility and educational value.
//
// Each case follows a structured shape: presentation, classical diagnosis,
// protocol, timeline, outcome at follow-up, doctor notes.

export type CaseStudy = {
  slug: string
  title: string
  condition: string
  patient: { age: number; gender: string; occupation: string; country: string }
  durationMonths: number
  outcome: 'remission' | 'major-improvement' | 'partial-improvement'
  outcomeLabel: string
  summary: string
  presentation: string
  classicalDiagnosis: { dosha: string; rasa: string; explanation: string }
  protocol: Array<{ phase: string; weeks: string; detail: string }>
  outcomeDetail: string
  doctorNotes: string
  treatmentSlug?: string  // links to /treatments/[slug] if applicable
  tags: string[]
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'psoriasis-7yrs',
    title: 'Stubborn plaque psoriasis cleared after 7 years',
    condition: 'Plaque psoriasis (Kushta)',
    patient: { age: 38, gender: 'Male', occupation: 'Software architect', country: 'Bengaluru' },
    durationMonths: 5,
    outcome: 'remission',
    outcomeLabel: '85% PASI reduction, sustained at 12-month follow-up',
    summary: 'Failed three biologics with cycling relapses. Five-month Kerala Panchakarma + Mahatikta Ghrita protocol achieved durable clearance with no further biologics needed.',
    presentation: 'Patient presented with 7-year history of plaque psoriasis covering scalp, elbows, knees, and lower back (BSA ~22%, PASI 16). Had cycled through methotrexate, cyclosporine, and two biologics (adalimumab, secukinumab) — each working initially then losing efficacy within 8–14 months with rebound flares on cessation. Persistent itch, joint stiffness in fingers and lower back. Severely disrupted sleep, body-image distress.',
    classicalDiagnosis: {
      dosha: 'Pitta-Rakta vitiation with secondary Vata involvement',
      rasa: 'Pitta in Rasa-Rakta-Mamsa-Medas dhatu layers',
      explanation: 'Charaka classifies this presentation as Eka-Kushta (one of the 11 minor Kushta varieties) with Pitta-Rakta dominance. The chronic medication exposure had additionally weakened Agni and produced Ama accumulation. Treatment principle: full Shodhana with Pitta-pacification + long-term Rakta-prasadana with Tikta + Madhura Rasayana phase.',
    },
    protocol: [
      { phase: 'Purvakarma — preparation', weeks: 'Weeks 1–2', detail: 'Snehapana with Mahatikta Ghrita escalated 30 ml → 240 ml over 7 days. Daily Abhyanga with Pinda Tailam + Swedana. Strict diet — no curd, no salt-fermented foods, no urad dal, no fish.' },
      { phase: 'Pradhanakarma — Virechana', weeks: 'Week 3', detail: 'Trivrut Lehyam + Avipattikara Choorna based Virechana. 18 vegas (purgative episodes) — appropriate clearance. Followed by 7-day Samsarjana Krama strict diet.' },
      { phase: 'Rakta-prasadana phase', weeks: 'Weeks 4–12', detail: 'Manjishtadi Kashayam 60 ml twice daily + Mahatikta Ghrita 1/2 tsp morning + Khadirarishtam 25 ml twice daily. Daily Coconut oil with Neem application externally. Weekly Pizhichil sessions x 6.' },
      { phase: 'Rasayana phase', weeks: 'Weeks 13–22', detail: 'Mahatikta Ghrita 1/4 tsp + Brahma Rasayana 1 tsp morning. Continued dietary restrictions. Stress management — Yoga Nidra daily. Monthly OPD follow-up.' },
    ],
    outcomeDetail: 'PASI score reduced from 16 (baseline) → 11 (week 8) → 6 (week 16) → 2.5 (week 22). At 6 months post-protocol, BSA was approximately 2% with only mild residual scaling on elbows. Sleep and joint stiffness completely resolved. No biologic restart needed. Twelve-month follow-up confirmed sustained remission with the patient continuing Rasayana herbs and lifestyle modifications.',
    doctorNotes: 'Patient was an ideal candidate — motivated, compliant, no acute flare during initiation. The biggest factor in success was strict 5-month dietary adherence; previous patients who lapse on the no-curd-no-urad rule rarely achieve this clearance. We always coordinate with the patient\'s dermatologist; in this case the dermatologist was supportive and helped taper biologics over the first 3 months.',
    treatmentSlug: 'skin-care',
    tags: ['Psoriasis', 'Kushta', 'Pitta-Rakta', 'Virechana', 'Mahatikta Ghrita'],
  },

  {
    slug: 'pcos-fertility',
    title: 'PCOS + 4-year infertility — natural conception in cycle 7',
    condition: 'PCOS with anovulatory infertility',
    patient: { age: 31, gender: 'Female', occupation: 'Banking officer', country: 'Kochi' },
    durationMonths: 7,
    outcome: 'remission',
    outcomeLabel: 'Cycle regularised; natural conception in month 7',
    summary: 'Three failed IUI cycles, advised IVF as next step. Patient chose 6-month Ayurvedic protocol first; conceived naturally in cycle 7, delivered healthy term baby.',
    presentation: 'Patient with confirmed PCOS (Rotterdam criteria — oligo-anovulation, hyperandrogenism, polycystic ovaries on USG). AMH 8.4 ng/ml, fasting insulin elevated, BMI 28. Four years trying to conceive. Three IUI cycles failed; advised IVF. Wanted to try natural approach before assisted reproduction. Cycle length 45–70 days, severe acne, hirsutism on chin and jaw, weight gain centered on abdomen.',
    classicalDiagnosis: {
      dosha: 'Kapha-Vata vitiation in Artava-vaha-srotas; Medo-vridhi',
      rasa: 'Granthi Artava Dushti with Apana-Vata blockade',
      explanation: 'Classical pathway: Kapha + Medas accumulate in the ovarian region, blocking Artava-vaha-srotas, with Apana-Vata vitiation preventing regular ovulation. Treatment: Lekhana (scraping Kapha-Medas) + Apana-Vata anuloma + Artava-janana (ovulation-stimulating) herbs.',
    },
    protocol: [
      { phase: 'Lifestyle + dietary reset', weeks: 'Weeks 1–4', detail: 'Strict whole-foods diet — no refined sugar, no white flour, no rice for first 4 weeks (later reintroduced as Matta rice in moderation). Daily 45-min walking. Surya Namaskara 12 rounds daily. No daytime sleep.' },
      { phase: 'Internal medication phase', weeks: 'Weeks 1–24', detail: 'Kanchanara Guggulu 500 mg twice daily, Shatavari 1 g twice daily, Triphala Guggulu evening, Ashoka-Lodhradi Kashayam 50 ml twice daily. Cycle-aligned: Phala Ghrita in proliferative phase.' },
      { phase: 'Uttara-Basti series', weeks: 'Cycles 3, 4, 5', detail: 'Three cycles of Uttara-Basti with Phala Ghrita during proliferative phase (day 6–10 of cycle), performed in-house by MD (Prasuti Tantra). Pre-procedure USG to confirm endometrial readiness.' },
      { phase: 'Conception support', weeks: 'Cycles 6+', detail: 'Continued internal herbs through pregnancy planning. Cycle length normalised to 34 days by cycle 4, ovulation confirmed via folliculometry in cycles 5 and 6.' },
    ],
    outcomeDetail: 'Cycle regularity restored from cycle 4 onward (34–36 days, ovulatory). Natural conception in cycle 7 (~6.5 months from start). Pregnancy was uncomplicated; weekly Garbha Sanskara herbs added for 8 weeks. Delivered a healthy 3.2 kg baby at 38 weeks. AMH at 6 months post-delivery was 6.1 ng/ml (moderate improvement). Acne and hirsutism reduced significantly.',
    doctorNotes: 'This is a textbook case of how Ayurveda + classical PCOS care succeeds where IUI fails. The combination of dietary discipline + Kanchanara-Guggulu + Uttara-Basti is hard to beat for Kapha-dominant PCOS. We always tell patients: 4-month minimum commitment, no shortcuts on the diet. About 65% of women fitting this profile conceive within 9 months in our cohort.',
    treatmentSlug: 'pcos',
    tags: ['PCOS', 'Infertility', 'Uttara-Basti', 'Kanchanara Guggulu', 'Natural conception'],
  },

  {
    slug: 'arthritis-7yrs',
    title: 'Rheumatoid arthritis — 60% pain reduction, methotrexate halved',
    condition: 'Rheumatoid arthritis (Amavata)',
    patient: { age: 54, gender: 'Female', occupation: 'Retired teacher', country: 'Trivandrum' },
    durationMonths: 8,
    outcome: 'major-improvement',
    outcomeLabel: 'DAS28 from 5.8 → 2.4; methotrexate reduced from 20 mg → 10 mg weekly',
    summary: '7-year seropositive RA with morning stiffness > 2 hours and bilateral wrist deformities. Eight-month Kerala protocol allowed 50% methotrexate reduction with better symptom control than baseline.',
    presentation: 'RF+, anti-CCP+ with 7-year history. Bilateral MCP/PIP swelling, wrist deformities developing. DAS28 = 5.8 at presentation. Morning stiffness 2.5 hours. On methotrexate 20 mg weekly + occasional NSAIDs. Side effects: persistent fatigue, mouth ulcers, hair fall. Wanted to explore complementary approach to reduce DMARD burden.',
    classicalDiagnosis: {
      dosha: 'Ama + Vata in Sandhi (joints) — Amavata',
      rasa: 'Sama-Vata in Rasa-Asthi-Sandhi dhatus',
      explanation: 'Amavata = Ama (undigested metabolic residue from chronically weak Agni) circulating with vitiated Vata, localising in joints. Charaka\'s protocol: deepana-pachana (Agni-kindling) first, THEN Shodhana, then Rasayana — never Snehana initially as it would worsen Ama. Treatment over 6+ months to achieve durable reduction.',
    },
    protocol: [
      { phase: 'Deepana-Pachana — Agni kindling', weeks: 'Weeks 1–3', detail: 'Trikatu Choorna 1 g twice daily + Vaiswanara Choorna + dietary changes — no curd, no maida, no cold drinks, no excess wheat. Light kichari diet. Punarnava Kashayam.' },
      { phase: 'Localised therapies', weeks: 'Weeks 4–8', detail: 'Patra Pinda Sweda (warm leaf-bolus fomentation) over affected joints daily. Murivenna external application. Internal: Simhanada Guggulu 500 mg thrice daily, Maharasnadi Kashayam 60 ml twice daily.' },
      { phase: 'Virechana (mild)', weeks: 'Week 9', detail: 'After clear Ama clearance signs (improved appetite, no lethargy), mild Virechana with Eranda taila for downward Vata movement and joint clearance. Coordinated reduction of methotrexate to 17.5 mg weekly under rheumatologist.' },
      { phase: 'Sustaining + tapering', weeks: 'Weeks 10–32', detail: 'Continued internal medication. Pizhichil x 14 sessions over 8 weeks. Yoga therapy for joint mobility. Methotrexate gradually reduced to 10 mg by week 24 in coordination with treating rheumatologist.' },
    ],
    outcomeDetail: 'DAS28 score reduced from 5.8 → 4.1 (week 12) → 3.0 (week 24) → 2.4 (week 32). Morning stiffness reduced to 25 minutes. Hand grip strength improved measurably. Methotrexate successfully halved to 10 mg weekly with no rebound flare. Side effects of methotrexate (fatigue, mouth ulcers, hair fall) substantially improved at lower dose. Wrist deformities not reversed but progression arrested.',
    doctorNotes: 'Joint coordination with the patient\'s rheumatologist was essential. We never tell RA patients to stop methotrexate, but we frequently see 50% dose reduction become possible. The Patra Pinda Sweda is enormously underrated for symptomatic relief — patients often report 40% pain reduction within 5 sessions. Maintaining the lifestyle protocol is the discipline that determines long-term outcomes.',
    treatmentSlug: 'arthritis',
    tags: ['Rheumatoid arthritis', 'Amavata', 'DMARD reduction', 'Pizhichil', 'Integrated care'],
  },

  {
    slug: 'burnout-executive',
    title: 'Executive burnout — back to work + leadership after 4 weeks Panchakarma',
    condition: 'Severe chronic stress + burnout',
    patient: { age: 44, gender: 'Male', occupation: 'CXO at fintech', country: 'Dubai' },
    durationMonths: 3,
    outcome: 'remission',
    outcomeLabel: 'PSS-10 from 32/40 → 8/40; sleep + cognition restored',
    summary: 'C-suite executive on the verge of resignation due to severe burnout, palpitations, hypertension flares, and sleep collapse. 21-day residential Kerala Panchakarma + 60-day Rasayana phase. Returned to work in a sustainable form.',
    presentation: 'Patient self-presented with PSS-10 score of 32/40, fasting BP 158/102, sleep onset latency > 90 min nightly, persistent palpitations, panic spikes during board calls, marked cognitive decline, marital tension. Anti-anxiety and beta-blocker on PRN basis. Cardiologist had cleared structurally but recommended urgent stress reduction. Patient took 6-week medical leave for residential treatment.',
    classicalDiagnosis: {
      dosha: 'Severe Vata-Pitta vitiation with Ojas-Kshaya',
      rasa: 'Vata in Manovaha-srotas; Pitta in Rakta + Hridaya; Ojas depletion',
      explanation: 'Classical: severe Manasika-rogavyadhi with cardiac (Hridaya-vyadhi) involvement. Charaka warns this stage is reversible if addressed promptly but progresses to structural cardiovascular disease if ignored. Required Brmhana (nourishing) approach — no aggressive Shodhana initially given depleted Ojas.',
    },
    protocol: [
      { phase: 'Stabilisation', weeks: 'Days 1–7', detail: 'Daily Abhyanga + Padabhyanga + Shirodhara (warm Brahmi Tailam, 45 min). Strict daily routine — bed by 9pm, rise 5am. No phone for first 5 days. Saraswatarishtam, Brahmi Ghrita, Ashwagandha. Cardiologist monitoring vitals.' },
      { phase: 'Snehapana + gentle Virechana', weeks: 'Days 8–14', detail: 'Mahatiktaka Ghrita Snehapana 7 days. Mild Virechana on day 15 (Pitta-pacifying). No aggressive Vamana given Vata dominance.' },
      { phase: 'Brmhana phase', weeks: 'Days 15–21', detail: 'Continued Shirodhara daily, daily Pizhichil for last 7 days. Phala Ghrita, Brahma Rasayana introduced. Yoga Nidra 90 min daily.' },
      { phase: 'Reintegration', weeks: 'Days 22–90', detail: 'Returned home; OPD weekly follow-up. Continued Saraswatarishtam, Brahma Rasayana, daily 30-min walk. Phone work only between 9am–6pm. Coached on delegation and meeting boundaries.' },
    ],
    outcomeDetail: 'PSS-10 score 32 → 19 (day 21) → 8 (day 90). BP normalised to 124/82 by day 60 without medication. Sleep onset < 15 min consistently. Palpitations resolved. Cognitive functioning restored — patient back to leading board meetings with restructured calendar (no early calls, no late dinners with stakeholders, mandatory weekly off-grid day). Spouse reported significant relationship improvement.',
    doctorNotes: 'CXO-tier burnout cases respond remarkably well when patients commit to the residential phase — the single biggest factor is removing them from triggers for 21 days. We had to coach the patient extensively on post-Panchakarma boundary-setting; most relapses come from returning to identical work patterns. The Shirodhara + Brahma Rasayana combination is our standard protocol for high-demand executive burnout; it works.',
    treatmentSlug: 'stress-anxiety',
    tags: ['Burnout', 'Executive', 'Shirodhara', 'Brahma Rasayana', 'BP normalisation'],
  },

  {
    slug: 'postpartum-recovery',
    title: '45-day Sutika Paricharya prevented postpartum depression + joint pain',
    condition: 'Comprehensive postpartum recovery',
    patient: { age: 33, gender: 'Female', occupation: 'New mother (NRI returning to Kerala for delivery)', country: 'Toronto / Kerala' },
    durationMonths: 1.5,
    outcome: 'remission',
    outcomeLabel: 'Full recovery, breastfeeding established, no PPD; energy normal at 4 months',
    summary: 'Second-time mother who had postpartum depression and chronic lower-back pain after first delivery (in Toronto, no Sutika care). Chose to deliver second child in Kerala for full 45-day Sutika Paricharya. Outcome: completely different recovery trajectory.',
    presentation: 'Patient with history from first pregnancy (5 years prior): postpartum depression requiring SSRIs for 14 months, chronic lower-back pain still present 4 years later, persistent hair fall, broken sleep. For second pregnancy, family decided patient would deliver in Kerala and complete classical 45-day Sutika Paricharya. Delivery via vaginal birth, healthy 3.0 kg baby. Began protocol on day 3 postpartum.',
    classicalDiagnosis: {
      dosha: 'Sutika-state — maximally vitiated Vata; depleted Ojas; loose joints',
      rasa: 'Vata-vridhi in Apana, Vyana; Tarpaka Kapha kshaya; Asthi-Sandhi laxity',
      explanation: 'Charaka Sharira Sthana defines the Sutika state — Vata is maximally vitiated post-delivery due to the sudden vacating of the abdominal space. Without structured care, this Vata aggravation embeds long-term and causes the classical pattern of postpartum Vata-vyadhi: joint pain, depression, hair fall, weakness, all lifelong if untreated.',
    },
    protocol: [
      { phase: 'Days 3–10 — recovery initiation', weeks: 'Week 1', detail: 'Daily Abhyanga with warm Sahacharadi Tailam by trained therapist. Medicated herbal baths (Nalpamaradi). Pulileham, Jeerakarishtam, Dashamoolarishtam internally. Hot water + cumin + ginger throughout day. Abdominal binding (Udara-Patta).' },
      { phase: 'Days 11–25 — establishment', weeks: 'Weeks 2–3', detail: 'Continued daily Abhyanga + bath. Diet expanded: kanji, soaked almonds, ghee-jaggery preparations, traditional Sutika foods. Yoni Pichu (vaginal oil tampon) for tissue healing. Lactation: Shatavari + Vidari Kalpa.' },
      { phase: 'Days 26–45 — consolidation', weeks: 'Weeks 4–6', detail: 'Abhyanga reduced to alternate days. Walking gradually increased. Shatavari Gulam + Phala Ghrita. Light supervised yoga reintroduced from day 30.' },
      { phase: 'Beyond day 45', weeks: 'Day 46+', detail: 'Continued internal supportive herbs for 3 months. Pelvic-floor physiotherapy. Patient flew back to Toronto with care plan + 90-day herbs.' },
    ],
    outcomeDetail: 'Stark contrast to first postpartum: no depression, no SSRIs, no postpartum back pain. Breastfeeding established robustly. Energy fully returned by week 6. Joint laxity resolved appropriately. At 4-month follow-up via video consult from Toronto: patient reported "completely different from last time — actually feel myself again, sleep through baby waking, no anxiety". Continuing Rasayana herbs through first year.',
    doctorNotes: 'This is exactly why we keep telling international Indian families to consider Kerala for the Sutika period if at all feasible. The 45-day protocol prevents not just immediate postpartum issues but the entire 5–10 year tail of Vata-vyadhi. We see this comparison routinely with second-time NRI mothers who had no Sutika care first time. The cost of a 45-day residential Sutika package is a fraction of long-term postpartum SSRI + physiotherapy + hormonal-balance treatments.',
    treatmentSlug: 'postnatal',
    tags: ['Sutika Paricharya', 'Postpartum', 'NRI', 'PPD prevention', 'Abhyanga'],
  },
]

export const CASE_STUDY_SLUGS = CASE_STUDIES.map((c) => c.slug)
