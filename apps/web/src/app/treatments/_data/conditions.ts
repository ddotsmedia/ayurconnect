// Specialized treatment landing pages. Each condition follows the same
// content shape — see TreatmentTemplate in ../[slug]/page.tsx.
//
// Content is intentionally educational, not prescriptive. Every page lands on
// a CTA toward a CCIM-verified consultation; we never recommend self-medication.

export type Condition = {
  slug: string
  name: string
  sanskrit: string
  tagline: string
  metaTitle: string
  metaDescription: string
  overview: string
  symptoms: string[]
  ayurvedicView: string
  treatmentPillars: Array<{ title: string; detail: string }>
  herbs: string[]
  procedures: string[]
  durationWeeks: { typical: number; intensive: number }
  estimatedCost: { residential: string; opd: string }
  faq: Array<{ q: string; a: string }>
  specializations: string[]      // for "find a doctor" deep link
  hospitalServices?: string[]    // for "find a centre" deep link
}

export const CONDITIONS: Record<string, Condition> = {
  pcos: {
    slug: 'pcos',
    name: 'PCOS / PCOD',
    sanskrit: 'अर्तव दुष्टि',
    tagline: 'Polycystic Ovary Syndrome — managed at the root, not just the symptoms',
    metaTitle: 'PCOS Ayurvedic Treatment in Kerala | AyurConnect',
    metaDescription: 'Evidence-informed Ayurvedic management of PCOS / PCOD — Shodhana protocols, herbal formulations, diet & lifestyle. Find CCIM-verified Kerala specialists.',
    overview: 'PCOS affects roughly 1 in 10 women of reproductive age. Conventional management is largely symptomatic (oral contraceptives, metformin, ovulation induction). Ayurveda views PCOS as a multi-system Kapha-Vata disorder with Pitta involvement, and offers a Shodhana (cleansing) → Shamana (palliation) → Rasayana (rejuvenation) sequence aimed at restoring cycle regularity, ovulation, insulin sensitivity, and androgen balance — typically over 3–6 months.',
    symptoms: [
      'Irregular or absent menstrual cycles (Artava Kshaya)',
      'Hirsutism — facial / body hair (Lomashata)',
      'Acne and oily skin',
      'Weight gain, especially abdominal (Medo Vriddhi)',
      'Insulin resistance / prediabetes',
      'Anovulatory infertility',
      'Mood changes, anxiety, sleep disturbance',
    ],
    ayurvedicView: 'Charaka classifies the underlying dysfunction as Granthi Artava Dushti — vitiation of artava-vaha-srotas (reproductive channels) by aggravated Kapha and Vata, with Ama (metabolic toxin) accumulation in the medo-dhatu (adipose tissue). The treatment principle is Srotoshodhana (channel-clearing), Medo-har (lipid-pacifying), and Artava-janana (ovulation-stimulating).',
    treatmentPillars: [
      { title: 'Shodhana (cleansing)', detail: 'Vamana for Kapha-dominant presentations, Virechana for Pitta involvement, and Uttara-Basti (medicated intra-uterine instillation) for resistant cases. 21–28 day residential protocol.' },
      { title: 'Shamana (palliation)', detail: 'Internal herbal formulations — Kanchanara Guggulu, Shatavari, Ashoka, Dashamoola, Triphala, Varanadi Kashayam. Continued 3–6 months under doctor review.' },
      { title: 'Rasayana (rejuvenation)', detail: 'Phala Ghrita, Shatavari Rasayana, lifestyle (yoga: Surya Namaskara, Baddha Konasana; pranayama: Bhramari, Anuloma Viloma). Diet: low-glycemic, kapha-pacifying, warm cooked foods.' },
      { title: 'Lifestyle & diet', detail: '40-min daily aerobic activity. Avoid daytime sleep, cold drinks, refined sugar, dairy excess. Whole grains (barley, millet), bitter vegetables, ginger, cinnamon, fenugreek.' },
    ],
    herbs: ['Shatavari', 'Ashoka', 'Lodhra', 'Kanchanara', 'Guggulu', 'Triphala', 'Methi (Fenugreek)', 'Dalchini (Cinnamon)'],
    procedures: ['Vamana', 'Virechana', 'Uttara-Basti', 'Udwarthanam', 'Abhyanga + Swedana'],
    durationWeeks: { typical: 12, intensive: 4 },
    estimatedCost: { residential: '₹70,000 – ₹2,40,000 (3-week residential)', opd: '₹15,000 – ₹40,000 (3-month OPD)' },
    faq: [
      { q: 'Can Ayurveda regulate periods without hormonal pills?', a: 'In most non-severe cases, yes — typically over 3–6 cycles. Severe cases with markedly elevated AMH or insulin resistance may need integrated care.' },
      { q: 'Is Uttara-Basti safe?', a: 'When performed by a trained MD (Prasuti Tantra) practitioner under sterile conditions, yes. It is reserved for resistant cases after 2–3 cycles of internal medication.' },
      { q: 'Do I need to stop my prescribed metformin / OCPs?', a: 'No — Ayurvedic treatment integrates safely with conventional drugs. Your Ayurveda doctor will coordinate with your gynaecologist.' },
    ],
    specializations: ['Prasuti Tantra', 'Kayachikitsa'],
    hospitalServices: ['Panchakarma', 'Stree Roga'],
  },

  arthritis: {
    slug: 'arthritis',
    name: 'Arthritis & Joint Pain',
    sanskrit: 'सन्धिवात / आमवात',
    tagline: 'Sandhivata, Amavata, Vatarakta — Ayurveda excels at chronic joint disease',
    metaTitle: 'Arthritis Ayurvedic Treatment Kerala — Sandhivata, Amavata, RA | AyurConnect',
    metaDescription: 'Classical Ayurveda for osteoarthritis, rheumatoid arthritis, ankylosing spondylitis. Kati-Basti, Janu-Basti, Pizhichil, internal medicines. Kerala CCIM specialists.',
    overview: 'Kerala Panchakarma is widely regarded as the gold standard for chronic joint disease. The classical texts identify three patterns: Sandhivata (osteoarthritis — Vata-dominant), Amavata (rheumatoid arthritis — Ama + Vata), and Vatarakta (gout — Pitta + Vata in the rakta-dhatu). Each demands a different protocol — using the wrong one for the wrong pattern is the most common reason "Ayurveda did not work" elsewhere.',
    symptoms: [
      'Joint pain, stiffness, swelling',
      'Reduced range of motion, especially morning',
      'Crepitus (joint cracking)',
      'Warmth, redness (rheumatoid / gouty pattern)',
      'Lower-back stiffness (lumbar Sandhivata)',
      'Migrating joint pain (Amavata hallmark)',
      'Loss of grip strength, fine-motor decline',
    ],
    ayurvedicView: 'Sandhivata = pure Vata in the joint cartilage (Asthi-Sandhi). Amavata = Ama (undigested metabolic residue) circulating with Vata, lodging in joints. Vatarakta = Vata + Rakta (blood vitiation) — gouty / inflammatory pattern. Each has distinct dietary triggers and distinct protocols. Mixing them up makes pain worse.',
    treatmentPillars: [
      { title: 'External oleation + sweating', detail: 'Abhyanga with Mahanarayana / Pinda / Murivenna oil + Swedana. Daily for 14–28 days. Reduces stiffness, restores synovial lubrication.' },
      { title: 'Localised pichu / basti', detail: 'Kati-Basti (lumbar), Janu-Basti (knee), Greeva-Basti (neck) — warm medicated oil retained on the joint via a dough dam. Profound symptomatic relief in 7–14 days.' },
      { title: 'Pizhichil / Navarakizhi', detail: 'Pizhichil = continuous warm-oil pouring with synchronised massage by 4 therapists, 60–90 min/day, 7–21 days. The hallmark Kerala treatment for chronic joint disease.' },
      { title: 'Internal medication', detail: 'Maharasnadi Kashayam, Yogaraja Guggulu, Simhanada Guggulu (Amavata), Kaishora Guggulu (Vatarakta), Ashwagandha, Guggulu Tikta Ghrita. 3–6 months under review.' },
    ],
    herbs: ['Guggulu', 'Ashwagandha', 'Rasna', 'Erandamoola', 'Shallaki (Boswellia)', 'Nirgundi', 'Eranda Taila', 'Bala'],
    procedures: ['Abhyanga + Swedana', 'Kati / Janu / Greeva-Basti', 'Pizhichil', 'Navarakizhi', 'Sarvanga Dhara', 'Virechana'],
    durationWeeks: { typical: 6, intensive: 3 },
    estimatedCost: { residential: '₹85,000 – ₹2,80,000 (3-week residential)', opd: '₹12,000 – ₹35,000 (1-month OPD)' },
    faq: [
      { q: 'Will I be able to stop my pain medication?', a: 'Many patients reduce or eliminate NSAID dependence after a full Panchakarma protocol. Severe RA cases on biologics need integrated management with rheumatology — never stop those abruptly.' },
      { q: 'Is it safe with knee replacement implants?', a: 'External therapies (Abhyanga, Kati-Basti) are safe post-surgery after 3 months. Pizhichil is avoided directly over a prosthesis. Internal medication is unaffected.' },
      { q: 'How long until I feel relief?', a: 'Localised Basti / Pizhichil — most feel marked relief within 5–7 sessions. Deep tissue healing requires the full 3–6 months internal protocol.' },
    ],
    specializations: ['Kayachikitsa', 'Panchakarma'],
    hospitalServices: ['Panchakarma'],
  },

  'stress-anxiety': {
    slug: 'stress-anxiety',
    name: 'Stress, Anxiety & Insomnia',
    sanskrit: 'चिन्ता / अनिद्रा',
    tagline: 'Chitta-vrtti — calming the mind through Shirodhara and Medhya Rasayana',
    metaTitle: 'Stress, Anxiety & Insomnia — Ayurvedic Treatment Kerala | AyurConnect',
    metaDescription: 'Shirodhara, Takradhara, Medhya Rasayana herbs (Brahmi, Shankhpushpi, Jatamansi), and Manasika Chikitsa for chronic stress, GAD, depression and insomnia.',
    overview: 'Stress is the single biggest reason urban Indians and international visitors seek Kerala Panchakarma. Ayurvedic psychiatry (Manasika Chikitsa) treats Chitta-Vrtti (mental fluctuations) as a Vata-dominant condition with Sattva-rajas-tamas balance disturbance. The signature protocol — Shirodhara — has been clinically studied; multiple Indian trials show reduction in serum cortisol, improved sleep latency, and reduced GAD scores.',
    symptoms: [
      'Difficulty falling or staying asleep',
      'Racing thoughts, mental fatigue',
      'Irritability, restlessness',
      'Tension headaches, jaw clenching',
      'Palpitations, chest tightness',
      'Loss of appetite or stress-eating',
      'Burnout, depersonalisation',
    ],
    ayurvedicView: 'Chronic stress depletes Ojas (vital essence) and inflames Vata in the Manovaha-srotas (mental channels). Sleep is regulated by Tarpaka Kapha (cerebral lubricating Kapha); insomnia = Kapha depletion + Vata excess in the head region. The treatment principle is Vata-shamana, Ojas-vardhana, and Medhya-Rasayana (cognitive rejuvenation).',
    treatmentPillars: [
      { title: 'Shirodhara', detail: 'Continuous stream of warm medicated oil onto the forehead (ajna-marma) for 45–60 min. Daily for 7–21 sessions. Profound effect on sleep architecture and HPA-axis cortisol.' },
      { title: 'Takradhara', detail: 'Medicated buttermilk dhara — cooler, more Pitta-pacifying than oil. Preferred for hyper-arousal, irritability, hot flushes.' },
      { title: 'Medhya Rasayana', detail: 'Brahmi Ghrita, Saraswatarishtam, Shankhpushpi syrup, Jatamansi, Ashwagandha. 3–6 months. Build cognitive resilience over time.' },
      { title: 'Lifestyle & yoga', detail: 'Dinacharya regularisation. Bhramari + Nadi-Shodhana pranayama 20 min/day. Yoga Nidra. Early dinner (before 7 pm). Phone off 1h before sleep.' },
    ],
    herbs: ['Brahmi', 'Shankhpushpi', 'Jatamansi', 'Ashwagandha', 'Tagara', 'Yashtimadhu', 'Vacha', 'Saraswata Churna'],
    procedures: ['Shirodhara', 'Takradhara', 'Shirobasti', 'Padabhyanga', 'Nasya'],
    durationWeeks: { typical: 3, intensive: 2 },
    estimatedCost: { residential: '₹55,000 – ₹1,80,000 (2-week residential)', opd: '₹8,000 – ₹20,000 (1-month OPD)' },
    faq: [
      { q: 'Can Shirodhara replace antidepressants?', a: 'Mild-to-moderate cases often respond well to Shirodhara + Medhya Rasayana alone. Established clinical depression on SSRIs should integrate — never stop psychiatric medication without your prescriber.' },
      { q: 'How fast does it work?', a: 'Most patients report deep, refreshing sleep after session 2 or 3. Sustained anxiety reduction typically takes 14–21 days of combined protocol.' },
      { q: 'Is it safe in pregnancy?', a: 'Modified Shirodhara with specific oils (Bala Taila, Ksheerabala) is safe and often used for ante-partum anxiety. Pregnancy-specific oils only.' },
    ],
    specializations: ['Manasika', 'Kayachikitsa'],
    hospitalServices: ['Panchakarma'],
  },

  diabetes: {
    slug: 'diabetes',
    name: 'Diabetes (Madhumeha / Prameha)',
    sanskrit: 'मधुमेह / प्रमेह',
    tagline: 'Prameha — managed via lifestyle, herbs, and Shodhana before complications set in',
    metaTitle: 'Diabetes Ayurvedic Treatment Kerala — Madhumeha, Prameha | AyurConnect',
    metaDescription: 'Type-2 diabetes Ayurveda management: Vasant Kusumakar, Nishakathakadi, Gudmar, Vijayasar, Triphala. Kerala CCIM diabetologist directory.',
    overview: 'Charaka classifies 20 types of Prameha (urinary disorders). Type 2 diabetes maps most closely to Kapha-dominant Prameha with Vata involvement in advanced stages. Ayurveda does not "cure" established type 2 diabetes — but it consistently improves insulin sensitivity, reduces medication dose, prevents micro-vascular complications (retinopathy, nephropathy, neuropathy), and arrests progression. Integration with conventional endocrinology is the norm, not the exception.',
    symptoms: [
      'Polyuria (frequent urination)',
      'Polydipsia (excessive thirst)',
      'Polyphagia (excessive hunger)',
      'Unexplained weight loss or weight gain',
      'Slow wound healing',
      'Tingling / numbness in extremities (neuropathy)',
      'Recurrent infections',
      'Visual blurring',
    ],
    ayurvedicView: 'Sushruta describes Sahaja Prameha (genetic / type 1) and Apathyanimittaja Prameha (lifestyle-driven / type 2). The pathogenesis involves Kapha vitiation, Medo-dhatu hypertrophy, and Ama in srotas. Untreated, it progresses through 20 stages culminating in Vata-dominant complications (diabetic foot, neuropathy). Early intervention with Shodhana + lifestyle reverses many stages.',
    treatmentPillars: [
      { title: 'Lifestyle reset (foundational)', detail: 'The single highest-yield intervention. 60 min daily activity. Whole grains (barley, millet, ragi). Bitter vegetables (karela, methi). No daytime sleep. No refined sugar, white rice, white flour.' },
      { title: 'Internal medication', detail: 'Vasant Kusumakar Ras, Nishakathakadi Kashayam, Vijayasar Churna, Gudmar (Gymnema), Madhunashini, Triphala Guggulu. Coordinated with allopathic OHA / insulin dose.' },
      { title: 'Shodhana (selective)', detail: 'Virechana for Kapha-Pitta Prameha. Done after metabolic stabilisation, never during acute hyperglycaemia or ketosis.' },
      { title: 'Yoga & pranayama', detail: 'Mandukasana, Ardha Matsyendrasana, Dhanurasana — proven to improve fasting glucose. Kapalbhati 20 min/day under supervision.' },
    ],
    herbs: ['Vijayasar', 'Gudmar (Gymnema)', 'Madhunashini', 'Karela (Bitter Gourd)', 'Methi (Fenugreek)', 'Jamun (Indian Blackberry)', 'Triphala', 'Turmeric'],
    procedures: ['Virechana (after stabilisation)', 'Udwarthanam', 'Takradhara (if BP elevated)'],
    durationWeeks: { typical: 24, intensive: 3 },
    estimatedCost: { residential: '₹65,000 – ₹2,00,000 (3-week residential)', opd: '₹6,000 – ₹15,000/month ongoing' },
    faq: [
      { q: 'Can I stop my metformin?', a: 'In well-controlled patients (HbA1c < 6.5) who adopt full Ayurvedic lifestyle + herbs, dose reduction is realistic over 3–6 months under coordinated supervision. Never stop abruptly. Type 1 diabetes always needs insulin.' },
      { q: 'Is Vasant Kusumakar Ras safe?', a: 'Yes when sourced from GMP-certified pharmacies (Kottakkal, Vaidyaratnam, AVP). Avoid roadside / unbranded preparations — heavy metals risk.' },
      { q: 'Will it reverse diabetic neuropathy?', a: 'Early-stage (paresthesia) often improves significantly with internal medication + Snehapana + Padabhyanga. Late-stage axonal damage is partially reversible at best.' },
    ],
    specializations: ['Kayachikitsa', 'Rasashastra'],
    hospitalServices: ['Panchakarma'],
  },

  'weight-management': {
    slug: 'weight-management',
    name: 'Weight Management (Sthaulya)',
    sanskrit: 'स्थौल्य',
    tagline: 'Sustainable Medo-Vriddhi reversal — without crash diets or surgery',
    metaTitle: 'Weight Loss Ayurvedic Treatment Kerala — Sthaulya, Medoroga | AyurConnect',
    metaDescription: 'Udwarthanam, Lekhana-Basti, Triphala-Guggulu, lifestyle-led weight management — Kerala CCIM doctors. Sustainable, no surgery, no crash diets.',
    overview: 'Charaka dedicated an entire chapter (Ashtau-ninditiya) to "the eight conditions of dispraise" — five forms of obesity head the list, calling Sthaulya the most difficult to treat among them. Ayurveda treats obesity as Medo-dhatu (adipose) hypertrophy combined with depleted Mamsa (muscle) and Asthi (bone) nutrition — which is why crash-dieting fails. The classical approach: rebuild Agni, deplete excess Medas, preserve Bala (strength).',
    symptoms: [
      'BMI > 27 (Indian threshold for action)',
      'Central obesity (waist > 90 cm men / 80 cm women)',
      'Excessive sweating, body odour',
      'Daytime drowsiness, low energy',
      'Snoring, sleep apnoea',
      'Joint pain from load (especially knees)',
      'Skin folds, intertrigo',
      'Disturbed lipid panel, fatty liver',
    ],
    ayurvedicView: 'Charaka: "Of the two — emaciation and obesity — obesity is far harder to treat, for in the obese Vata is enclosed and Agni is overactive, perpetually digesting nutrients into more fat." The treatment principle is Apatarpana (depleting therapy) without weakening — using Lekhana (scraping) procedures and bitter-astringent herbs that mobilise stored fat without depleting muscle.',
    treatmentPillars: [
      { title: 'Udwarthanam', detail: 'Vigorous dry powder massage (Triphala / Kolakulathadi Churna) — daily, 30–45 min. Mobilises subcutaneous adipose, improves circulation. Hallmark Kerala anti-Sthaulya procedure.' },
      { title: 'Lekhana-Basti', detail: 'Scraping medicated enema — typically Lekhaniya-Kashaya-Basti. 8–15 day course. Acts on visceral / pelvic fat. Done residential, supervised.' },
      { title: 'Internal Medication', detail: 'Triphala-Guggulu, Navaka-Guggulu, Medohar Vati, Vrikshamla (Garcinia), Punarnava. Hot water + lemon + honey first thing AM.' },
      { title: 'Diet & activity', detail: 'Barley, millet, mung dal, bitter greens. No daytime sleep. No cold drinks. 40-min brisk walk OR equivalent yoga (Surya Namaskara ×12) daily. Mid-day meal heaviest, light dinner before 7pm.' },
    ],
    herbs: ['Triphala', 'Guggulu', 'Vrikshamla (Garcinia)', 'Punarnava', 'Kushta', 'Musta', 'Chitraka', 'Methi'],
    procedures: ['Udwarthanam', 'Lekhana-Basti', 'Pizhichil', 'Swedana', 'Virechana'],
    durationWeeks: { typical: 16, intensive: 3 },
    estimatedCost: { residential: '₹60,000 – ₹2,20,000 (3-week residential)', opd: '₹7,000 – ₹18,000/month ongoing' },
    faq: [
      { q: 'How much weight will I lose in a 3-week residential?', a: 'Realistic: 5–10 kg in a well-supervised residential, of which 60–75% is sustained with discipline. Beware centres promising 15+ kg — that\'s dehydration, not fat loss, and rebounds.' },
      { q: 'Is bariatric surgery still an option later?', a: 'Yes. Ayurveda can be an evidence-supported first-line alternative for BMI 27–35. For BMI > 40 with co-morbidities, bariatric remains gold standard; Ayurveda is excellent post-surgical rehab.' },
      { q: 'What about Ayurvedic "fat burner" pills?', a: 'Avoid mass-market churnas with stimulants. Stick to classically prepared formulations from GMP-certified pharmacies — under doctor supervision, not OTC.' },
    ],
    specializations: ['Panchakarma', 'Kayachikitsa'],
    hospitalServices: ['Panchakarma'],
  },

  'skin-care': {
    slug: 'skin-care',
    name: 'Skin Disorders (Twak Vikara)',
    sanskrit: 'त्वक् विकार',
    tagline: 'Psoriasis, eczema, acne, vitiligo — root-cause Ayurvedic dermatology',
    metaTitle: 'Skin Disease Ayurvedic Treatment Kerala — Psoriasis, Eczema, Vitiligo | AyurConnect',
    metaDescription: 'Kerala Ayurveda for psoriasis (Kushta), eczema, acne, vitiligo (Shvitra). Virechana, Raktamokshana, Mahatikta Ghrita. CCIM specialists.',
    overview: 'Charaka classified seven varieties of Kushta (skin disease), each with distinct Rasa-Rakta-Mamsa-Medas involvement and seasonal patterns. Kerala has a 200+ year tradition of treating psoriasis and chronic eczema with Panchakarma — and modern dermatology literature increasingly cites Indian RCT data on Mahatikta Ghrita and turmeric-curcumin in plaque psoriasis. Vitiligo (Shvitra) is harder; partial repigmentation is realistic with combined internal + sun-exposure therapy.',
    symptoms: [
      'Recurrent plaques, scaling, itching',
      'Dry, cracked, oozing patches',
      'Acne, recurrent boils, folliculitis',
      'Hyper- or hypopigmentation patches',
      'Nail changes (pitting, onycholysis)',
      'Joint involvement (psoriatic arthritis)',
      'Worsening with stress / dietary triggers',
      'Family history of skin disease',
    ],
    ayurvedicView: 'All Kushta involves vitiation of seven structures: 3 doshas + Rasa (plasma), Rakta (blood), Mamsa (muscle), Ambu (lymph). Treatment principle: Shodhana to clear systemic vitiation, then targeted Rakta-prasadana (blood-clearing) with Tikta (bitter) and Kashaya (astringent) herbs, then long-term Rasayana to prevent relapse. External therapies (Lepa, Avachoornana) are adjunctive, never primary.',
    treatmentPillars: [
      { title: 'Virechana', detail: 'The single most effective single therapy in psoriasis. After 7-day Snehapana with Mahatikta Ghrita, full Virechana clears Pitta + Rakta vitiation. Typically 14-day residential. Patients often report 60–80% lesion reduction within 4 weeks.' },
      { title: 'Raktamokshana', detail: 'Therapeutic bloodletting (leech / Siravyadha) — for stubborn psoriasis plaques, varicose ulcers, chronic eczema. Done under doctor supervision in licensed centres only.' },
      { title: 'Internal medication', detail: 'Mahatikta Ghrita, Patolakaturohinyadi Kashayam, Manjishtadi Kashayam, Aragwadhadi Kashayam, Khadirarishta, Neem-Guduchi. 3–6 months.' },
      { title: 'External + lifestyle', detail: 'Coconut oil + neem applications. Avoid: curd, urad dal, fish, salt excess, sour fermented foods. Stress management — flares are strongly stress-triggered. Sun exposure 15–20 min for vitiligo (with Bakuchi externally).' },
    ],
    herbs: ['Manjishta', 'Neem', 'Khadira', 'Bakuchi', 'Guduchi', 'Aragwadha', 'Haridra (Turmeric)', 'Vidanga'],
    procedures: ['Virechana', 'Raktamokshana', 'Takradhara', 'Lepa application', 'Snehapana'],
    durationWeeks: { typical: 16, intensive: 2 },
    estimatedCost: { residential: '₹50,000 – ₹1,80,000 (2-week residential)', opd: '₹8,000 – ₹22,000/month ongoing' },
    faq: [
      { q: 'Will my psoriasis "come back" after treatment?', a: 'Psoriasis is chronic-relapsing by nature; complete cure is uncommon. Realistic expectation: 60–90% lesion clearance + 12–24 month remission with proper protocol + Rasayana phase. Triggers (alcohol, smoking, stress) shorten remission.' },
      { q: 'Can I do this alongside biologics?', a: 'Yes — coordinate with your dermatologist. Many patients gradually taper biologics over 6–12 months under joint care.' },
      { q: 'Is leech therapy hygienic?', a: 'When performed in a CCIM-licensed centre with single-use medical-grade Hirudo medicinalis leeches, yes. Avoid roadside / "traditional" practitioners.' },
    ],
    specializations: ['Kayachikitsa', 'Shalya'],
    hospitalServices: ['Panchakarma'],
  },
}

export const CONDITION_SLUGS = Object.keys(CONDITIONS)
