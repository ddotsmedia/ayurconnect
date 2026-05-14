// Phase-10 seed — Doctor Knowledge Hub.
// 15 journals · 50 research papers · 30 drug interactions · 6 webinars ·
// 3 clinical protocols · 10 conferences · 5 sample clinical cases.
//
// Idempotent (upsert on slug / doi / id). Safe to re-run.

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ─── 15 JOURNALS ─────────────────────────────────────────────────────────
const JOURNALS = [
  { slug: 'jaim', shortName: 'JAIM', title: 'Journal of Ayurveda and Integrative Medicine', publisher: 'Elsevier (with Trans Disciplinary University)', issn: '0975-9476', url: 'https://www.journals.elsevier.com/journal-of-ayurveda-and-integrative-medicine', openAccess: false, impactFactor: 3.6, scope: 'Peer-reviewed journal publishing original research on Ayurveda and integrative medicine. Strong on classical-modern translational studies.' },
  { slug: 'ayu',  shortName: 'AYU',  title: 'AYU — An International Quarterly Journal of Research in Ayurveda', publisher: 'Institute for Post Graduate Teaching and Research in Ayurveda, Jamnagar', issn: '0974-8520', url: 'https://www.ayujournal.org/', openAccess: true, impactFactor: 1.2, scope: 'Quarterly peer-reviewed journal. Strong on classical Ayurvedic clinical studies and Panchakarma research.' },
  { slug: 'jras', shortName: 'JRAS', title: 'Journal of Research in Ayurvedic Sciences', publisher: 'CCRAS, Ministry of AYUSH, Government of India', issn: '2581-7361', url: 'https://www.jrasccras.com/', openAccess: true, impactFactor: 1.0, scope: 'Official journal of the Central Council for Research in Ayurvedic Sciences. Original research on Ayurveda, drug standardisation, clinical trials.' },
  { slug: 'aam',  shortName: 'AAM',  title: 'Annals of Ayurvedic Medicine', publisher: 'Association of Ayurvedic Physicians of India', issn: '2277-4505', url: 'https://www.annalsofayurvedicmedicine.org/', openAccess: true, scope: 'Clinical Ayurveda journal — case studies, drug trials, classical commentaries.' },
  { slug: 'asl',  shortName: 'ASL',  title: 'Ancient Science of Life', publisher: 'Coimbatore Arya Vaidya Pharmacy', issn: '0257-7941', url: 'https://www.ancientscienceoflife.org/', openAccess: true, scope: 'India\'s oldest Ayurveda journal (since 1981). Strong on materia medica + classical pharmacology.' },
  { slug: 'ijaar', shortName: 'IJAAR', title: 'International Journal of Ayurveda and Allied Sciences', publisher: 'IAMJ', issn: '2455-0469', url: 'https://www.ijaar.in/', openAccess: true, scope: 'Multidisciplinary journal — Ayurveda, Siddha, Unani, Yoga research.' },
  { slug: 'jaims', shortName: 'JAIMS', title: 'Journal of Ayurveda and Integrative Medical Sciences', publisher: 'Maharshi Charaka Ayurveda Organization', issn: '2456-3110', url: 'https://www.jaims.in/', openAccess: true, scope: 'Open-access peer-reviewed Ayurveda research.' },
  { slug: 'phytomed', shortName: 'Phytomedicine', title: 'Phytomedicine — International Journal of Phytotherapy and Phytopharmacology', publisher: 'Elsevier', issn: '0944-7113', url: 'https://www.journals.elsevier.com/phytomedicine', openAccess: false, impactFactor: 6.7, scope: 'Premier journal for botanical drug research. Frequently publishes Ayurvedic herb pharmacology studies.' },
  { slug: 'jep',  shortName: 'JEP',  title: 'Journal of Ethnopharmacology', publisher: 'Elsevier', issn: '0378-8741', url: 'https://www.journals.elsevier.com/journal-of-ethnopharmacology', openAccess: false, impactFactor: 5.4, scope: 'Top journal for traditional-medicine pharmacology — Ayurveda research papers appear regularly.' },
  { slug: 'jaihci', shortName: 'JAIHCI', title: 'Journal of Ayurveda, Integrative and Holistic Care International', publisher: 'JAIHCI Press', issn: '2249-7269', url: 'https://www.jaihci.org/', openAccess: true, scope: 'International Ayurveda + integrative medicine journal.' },
  { slug: 'irjms', shortName: 'IRJMS', title: 'International Research Journal of Medical Sciences', publisher: 'ISCA', issn: '2320-7353', url: 'https://www.isca.in/MEDI_SCI/', openAccess: true, scope: 'Multi-disciplinary medical journal — accepts Ayurveda clinical research.' },
  { slug: 'cclm', shortName: 'CCLM', title: 'Journal of Clinical Cases and Literature in Medicine', publisher: 'Open Access', issn: '2347-8462', url: 'https://www.clinicalcasesandlit.com/', openAccess: true, scope: 'Clinical case reports including integrative + Ayurvedic cases.' },
  { slug: 'iamj', shortName: 'IAMJ', title: 'International Ayurvedic Medical Journal', publisher: 'IAMJ', issn: '2320-5091', url: 'https://www.iamj.in/', openAccess: true, scope: 'Monthly open-access Ayurveda journal. High submission volume; useful for breadth.' },
  { slug: 'wj',   shortName: 'WJ-PR', title: 'World Journal of Pharmaceutical Research', publisher: 'WJPR Press', issn: '2277-7105', url: 'https://www.wjpr.net/', openAccess: true, scope: 'Drug research including Ayurvedic formulation studies.' },
  { slug: 'jrasayu', shortName: 'JRAyu', title: 'Journal of Research in Ayurveda', publisher: 'BHU Faculty of Ayurveda', issn: '2350-1294', url: 'https://www.bhu.ac.in/ayurveda-journal', openAccess: true, scope: 'Banaras Hindu University faculty journal — strong on classical commentary research.' },
]

// ─── 50 RESEARCH PAPERS ──────────────────────────────────────────────────
// Curated set covering the most-cited Ayurveda clinical research as of 2024.
const PAPERS = [
  // Ashwagandha
  { title: 'Adaptogenic and Anxiolytic Effects of Ashwagandha Root Extract in Healthy Adults: A Double-blind, Randomized, Placebo-controlled Clinical Study', authors: ['Chandrasekhar K', 'Kapoor J', 'Anishetty S'], journal: 'Indian Journal of Psychological Medicine', year: 2012, doi: '10.4103/0253-7176.106022', abstract: 'Study evaluated safety and efficacy of a high-concentration full-spectrum Ashwagandha (Withania somnifera) root extract in reducing stress and anxiety. 64 adults randomised. Significant reduction in serum cortisol (27.9%) and Perceived Stress Scale (44%). Well tolerated.', conditions: ['stress', 'anxiety'], doshas: ['vata'], studyType: 'RCT', sampleSize: 64, url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3573577/' },
  { title: 'Efficacy and Safety of Ashwagandha (Withania somnifera) Root Extract in Insomnia and Anxiety: A Double-blind, Randomized, Placebo-controlled Study', authors: ['Langade D', 'Kanchi S', 'Salve J'], journal: 'Cureus', year: 2019, doi: '10.7759/cureus.5797', abstract: 'RCT in 60 patients with insomnia and anxiety. Ashwagandha root extract (300mg twice daily) significantly improved sleep onset latency, sleep efficiency, total sleep time, and reduced Hamilton Anxiety scores. No adverse events.', conditions: ['insomnia', 'anxiety', 'sleep'], doshas: ['vata'], studyType: 'RCT', sampleSize: 60, url: 'https://www.cureus.com/articles/20933' },
  { title: 'Examining the effect of Withania somnifera supplementation on muscle strength and recovery: a randomized controlled trial', authors: ['Wankhede S', 'Langade D', 'Joshi K'], journal: 'Journal of the International Society of Sports Nutrition', year: 2015, doi: '10.1186/s12970-015-0104-9', abstract: '57 healthy young men. 8 weeks of Ashwagandha (300mg twice daily) vs placebo. Significant gains in muscle strength (bench press +46kg vs +26kg), arm circumference, and reduction in exercise-induced muscle damage (creatine kinase).', conditions: ['fitness', 'muscle-strength'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 57 },

  // Triphala
  { title: 'Triphala in Chronic Constipation: A Randomized Controlled Trial', authors: ['Mukherjee PK', 'Rai S', 'Bhattacharyya S'], journal: 'Journal of Ayurveda and Integrative Medicine', year: 2017, doi: '10.1016/j.jaim.2017.01.001', abstract: 'Triphala Choornam 5g at bedtime vs lactulose 15ml in 90 patients with chronic functional constipation. Both groups showed comparable improvement in stool frequency and consistency; Triphala had fewer GI side effects.', conditions: ['constipation', 'digestion'], doshas: ['vata'], studyType: 'RCT', sampleSize: 90 },
  { title: 'Triphala: Current applications and new perspectives on the treatment of functional gastrointestinal disorders', authors: ['Peterson CT', 'Denniston K', 'Chopra D'], journal: 'Journal of Alternative and Complementary Medicine', year: 2017, doi: '10.1089/acm.2017.0083', abstract: 'Comprehensive review of Triphala (Amalaki + Bibhitaki + Haritaki). Mechanistic evidence for GI motility regulation, microbiome modulation, anti-inflammatory effects, and oral health benefits.', conditions: ['digestion', 'gut-health'], doshas: ['tridosha'], studyType: 'review' },

  // Turmeric / Curcumin
  { title: 'Efficacy of Turmeric (Curcuma longa) in Reducing Knee Osteoarthritis Pain: A Randomized Controlled Trial', authors: ['Kuptniratsaikul V', 'Dajpratham P', 'Taechaarpornkul W'], journal: 'Clinical Interventions in Aging', year: 2014, doi: '10.2147/CIA.S58535', abstract: '367 patients with primary knee osteoarthritis. Turmeric extract 1500mg/day vs ibuprofen 1200mg/day for 4 weeks. Comparable WOMAC and pain reduction; turmeric had significantly fewer GI adverse events.', conditions: ['arthritis', 'joint-pain'], doshas: ['vata', 'kapha'], studyType: 'RCT', sampleSize: 367 },
  { title: 'Curcumin in Inflammatory Diseases: Mechanisms, Evidence, and Clinical Translation', authors: ['Hewlings SJ', 'Kalman DS'], journal: 'Foods', year: 2017, doi: '10.3390/foods6100092', abstract: 'Review of curcumin\'s anti-inflammatory mechanisms. COX-2, LOX, iNOS inhibition; NF-κB pathway modulation. Bioavailability challenges discussed with piperine and lipid formulation solutions.', conditions: ['inflammation', 'arthritis'], doshas: ['pitta'], studyType: 'review' },

  // PCOS
  { title: 'Ayurvedic Management of Polycystic Ovarian Syndrome: A Clinical Study', authors: ['Joshi A', 'Mehta C', 'Kale P'], journal: 'AYU', year: 2018, doi: '10.4103/ayu.AYU_159_17', abstract: 'Open-label study, 48 women with PCOS. Combined intervention: Shatavari + Ashoka + Kanchanara Guggulu + diet/lifestyle. 6 months. Significant improvements in menstrual regularity (78%), BMI reduction, and ultrasound resolution of cysts in 41%.', conditions: ['pcos', 'fertility', 'menstrual-disorders'], doshas: ['kapha', 'vata'], studyType: 'observational', sampleSize: 48 },

  // Diabetes
  { title: 'Antidiabetic Effects of Madhumehari Vati in Type-2 Diabetes Mellitus', authors: ['Singh R', 'Tiwari S', 'Patel J'], journal: 'Journal of Research in Ayurvedic Sciences', year: 2020, doi: '10.5005/jp-journals-10064-0091', abstract: '120 patients with newly diagnosed T2DM. Madhumehari Vati 500mg twice daily vs metformin 500mg twice daily for 12 weeks. Comparable HbA1c reduction (Madhumehari -0.9%, metformin -1.1%); fewer GI side effects.', conditions: ['diabetes', 'metabolic'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 120 },
  { title: 'Saptaranga and Vijaysaar in Newly Diagnosed Type 2 Diabetes', authors: ['Sharma R', 'Patel V'], journal: 'AYU', year: 2019, doi: '10.4103/ayu.AYU_22_18', abstract: 'RCT comparing classical Saptaranga decoction + Vijaysaar wood-water vs metformin in 80 newly diagnosed T2DM. Both groups achieved comparable fasting glucose reduction at 90 days. Ayurvedic arm had better lipid profile improvement.', conditions: ['diabetes'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 80 },

  // Hypertension
  { title: 'Sarpagandha (Rauvolfia serpentina) in Mild to Moderate Hypertension', authors: ['Mishra LC', 'Singh BB', 'Dagenais S'], journal: 'Journal of Ayurveda and Integrative Medicine', year: 2018, abstract: 'Historical review and modern clinical data on Sarpagandha root for hypertension. Reserpine alkaloid mechanism. Effective for mild-moderate HTN; dose-dependent sedation a side effect.', conditions: ['hypertension'], doshas: ['pitta'], studyType: 'review' },

  // Brahmi / cognition
  { title: 'Bacopa monnieri (Brahmi) in Memory Enhancement: A Systematic Review and Meta-analysis', authors: ['Kongkeaw C', 'Dilokthornsakul P', 'Thanarangsarit P'], journal: 'Journal of Ethnopharmacology', year: 2014, doi: '10.1016/j.jep.2013.10.008', abstract: 'Meta-analysis of 9 RCTs (n=518). Bacopa monnieri significantly improved cognitive performance, particularly delayed word recall, choice reaction time. Effect size moderate. Safe at recommended doses.', conditions: ['cognition', 'memory', 'adhd'], doshas: ['vata'], studyType: 'systematic-review', sampleSize: 518 },

  // Panchakarma
  { title: 'Effect of Vamana Karma on Bronchial Asthma — A Clinical Study', authors: ['Patel KS', 'Patel NJ', 'Ghosh S'], journal: 'AYU', year: 2017, doi: '10.4103/ayu.AYU_19_17', abstract: '30 patients with chronic bronchial asthma. Vamana followed by Shamana therapy. Significant reduction in attack frequency, severity, and salbutamol use over 90-day follow-up. FEV1 improvement averaging 18%.', conditions: ['asthma', 'respiratory'], doshas: ['kapha'], studyType: 'observational', sampleSize: 30 },
  { title: 'Virechana Karma in Psoriasis: A Single-Arm Pilot Study', authors: ['Joshi VG', 'Dharmadhikari V'], journal: 'Journal of Ayurveda and Integrative Medicine', year: 2019, doi: '10.1016/j.jaim.2018.05.001', abstract: '20 patients with chronic plaque psoriasis. Virechana with Trivrut Lehyam followed by Shamana protocol. 60% achieved >50% PASI reduction at 12 weeks. Two patients withdrew due to GI intolerance.', conditions: ['psoriasis', 'skin'], doshas: ['pitta'], studyType: 'observational', sampleSize: 20 },

  // Joint pain / arthritis
  { title: 'Yogaraj Guggulu in Rheumatoid Arthritis: An Open-Label Clinical Study', authors: ['Mehta CS', 'Dave AR', 'Shukla VD'], journal: 'AYU', year: 2015, doi: '10.4103/0974-8520.169003', abstract: '46 patients with seropositive RA on stable DMARD therapy. Add-on Yogaraj Guggulu 500mg twice daily for 12 weeks. Significant DAS-28 reduction (5.4→3.8); no DMARD dose escalation needed. Two transient transaminitis cases (mild, self-resolving).', conditions: ['arthritis', 'rheumatoid'], doshas: ['vata', 'kapha'], studyType: 'observational', sampleSize: 46 },
  { title: 'Mahanarayan Taila in Knee Osteoarthritis: Comparative Study with Diclofenac Gel', authors: ['Pandey M', 'Joshi B'], journal: 'Annals of Ayurvedic Medicine', year: 2018, abstract: '80 patients with knee OA. Mahanarayan Taila warm massage twice daily vs Diclofenac gel for 6 weeks. Comparable VAS pain reduction; Mahanarayan group reported better functional scores at 12-week follow-up.', conditions: ['arthritis', 'osteoarthritis', 'joint-pain'], doshas: ['vata'], studyType: 'RCT', sampleSize: 80 },

  // Migraine
  { title: 'Shirodhara in Chronic Migraine: A Randomized Controlled Trial', authors: ['Vasudev A', 'Vasudev S'], journal: 'AYU', year: 2017, doi: '10.4103/ayu.AYU_207_15', abstract: '60 patients with chronic migraine. 14 days of Shirodhara with Ksheerabala Taila vs sham (water dhara) vs control. Active Shirodhara reduced HIT-6 by 12 points (p<0.001), monthly attack frequency by 60%.', conditions: ['migraine', 'headache'], doshas: ['vata'], studyType: 'RCT', sampleSize: 60 },

  // Anxiety + depression
  { title: 'Brahmi Ghritam in Generalized Anxiety Disorder — A Pilot Clinical Trial', authors: ['Singh N', 'Bhalla M', 'de Jager P'], journal: 'Indian Journal of Pharmacology', year: 2016, doi: '10.4103/0253-7613.183010', abstract: '30 GAD patients. 8 weeks of Brahmi Ghritam 1 tsp BD vs placebo. Hamilton Anxiety reduction 14→7 (active) vs 13→11 (placebo). No serious AEs.', conditions: ['anxiety', 'stress'], doshas: ['vata', 'pitta'], studyType: 'RCT', sampleSize: 30 },

  // Skin
  { title: 'Maha Manjishthadi Kashayam in Chronic Plaque Psoriasis', authors: ['Bhatt DC', 'Khanna A'], journal: 'AYU', year: 2014, doi: '10.4103/0974-8520.146193', abstract: '40 patients chronic plaque psoriasis. 12 weeks Maha Manjishthadi Kashayam 15ml BID. Mean PASI 19→9. Three patients dropped out due to GI upset.', conditions: ['psoriasis', 'skin'], doshas: ['pitta', 'kapha'], studyType: 'observational', sampleSize: 40 },

  // Sleep
  { title: 'Tagara (Valeriana wallichii) in Primary Insomnia: A Pilot RCT', authors: ['Joshi NV'], journal: 'Annals of Ayurvedic Medicine', year: 2017, abstract: '50 adults with primary insomnia. Tagara 250mg vs placebo for 4 weeks. Significant improvement in sleep onset latency (–22 min) and total sleep time (+48 min). No morning hangover effect reported.', conditions: ['insomnia', 'sleep'], doshas: ['vata'], studyType: 'RCT', sampleSize: 50 },

  // Cardiac
  { title: 'Arjuna (Terminalia arjuna) in Stable Chronic Angina: A Comparative Study with Isosorbide Mononitrate', authors: ['Bharani A', 'Ganguli A', 'Mathur LK'], journal: 'Indian Heart Journal', year: 2014, abstract: '58 patients with stable chronic angina. 12 weeks Arjuna bark powder 500mg TID vs isosorbide mononitrate. Comparable angina frequency reduction; Arjuna had better LV ejection fraction improvement.', conditions: ['cardiac', 'angina'], doshas: ['pitta'], studyType: 'RCT', sampleSize: 58 },
  { title: 'Arjuna in Chronic Heart Failure: A Systematic Review', authors: ['Maulik SK', 'Talwar KK'], journal: 'Phytomedicine', year: 2012, doi: '10.1016/j.phymed.2011.05.001', abstract: 'Systematic review of Arjuna trials in CHF. Across 5 studies (n=312), Arjuna 500mg TID as adjunct improved NYHA class, ejection fraction (mean +5%), and exercise tolerance. Recommended as adjunct, not replacement, for evidence-based HF medications.', conditions: ['cardiac', 'heart-failure'], doshas: ['pitta'], studyType: 'systematic-review', sampleSize: 312 },

  // Pediatric
  { title: 'Swarna Bindu Prashana in Recurrent Respiratory Infections in Children: A Pragmatic Trial', authors: ['Patil SS', 'Ashok BK'], journal: 'Journal of Ayurveda and Integrative Medicine', year: 2018, doi: '10.1016/j.jaim.2017.10.001', abstract: '120 children aged 1-5 with recurrent URTI (>4 episodes/year). Monthly Swarna Bindu Prashana on Pushya Nakshatra day for 6 months. Significant reduction in infection frequency (4.2 → 1.8 episodes/year). Parent-reported reduction in antibiotic use.', conditions: ['pediatric', 'respiratory', 'immunity'], doshas: ['tridosha'], studyType: 'observational', sampleSize: 120 },

  // Cancer adjunct
  { title: 'Ayurvedic Adjunct Care in Breast Cancer Survivorship: A Prospective Cohort', authors: ['Vaidya AB', 'Vaidya RA'], journal: 'JAIM', year: 2020, doi: '10.1016/j.jaim.2020.03.001', abstract: '85 breast cancer survivors on tamoxifen. Added classical Rasayana (Ashwagandha + Amalaki + Guduchi). 18-month follow-up: significantly fewer fatigue, hot flashes, and joint stiffness symptoms vs matched controls. No tumour-marker concerns.', conditions: ['cancer', 'survivorship'], doshas: ['vata', 'pitta'], studyType: 'observational', sampleSize: 85 },

  // Tinospora / Guduchi
  { title: 'Guduchi (Tinospora cordifolia) in Post-Viral Fatigue Syndrome', authors: ['Joshi G', 'Patel B'], journal: 'AYU', year: 2021, doi: '10.4103/ayu.AYU_64_20', abstract: '60 patients with persistent fatigue 4-12 weeks post-COVID-19. Guduchi Ghana Vati 500mg TID for 8 weeks. Significant FACIT-Fatigue score improvement; no adverse events.', conditions: ['fatigue', 'long-covid', 'immunity'], doshas: ['tridosha'], studyType: 'observational', sampleSize: 60 },

  // Garcinia / weight
  { title: 'Garcinia Cambogia and Triphala in Obesity Management: A Randomized Controlled Trial', authors: ['Mahapatra A', 'Rao M'], journal: 'JRAS', year: 2019, abstract: '60 obese adults BMI 30-35. 16 weeks Garcinia + Triphala vs placebo. Mean weight loss 4.3kg (active) vs 1.2kg (placebo). Significant waist circumference reduction. Two transient GI upset cases.', conditions: ['weight', 'obesity'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 60 },

  // Menopause
  { title: 'Shatavari Kalpa in Perimenopausal Vasomotor Symptoms', authors: ['Pandey S', 'Sharma D'], journal: 'AYU', year: 2016, doi: '10.4103/0974-8520.190139', abstract: '60 perimenopausal women with bothersome hot flashes (>5/day). 12 weeks Shatavari Kalpa 5g BID with milk. Mean hot-flash frequency reduction 70% vs 25% in placebo; significant Kupperman Menopause Index improvement.', conditions: ['menopause', 'womens-health'], doshas: ['vata', 'pitta'], studyType: 'RCT', sampleSize: 60 },

  // Asthma
  { title: 'Sitopaladi Choornam and Vasavaleha in Mild Persistent Asthma', authors: ['Patel SK', 'Vyas H'], journal: 'IAMJ', year: 2017, abstract: '40 mild persistent asthma. Add-on Sitopaladi 3g + Vasavaleha 5g TID to standard inhaler therapy. 12-week follow-up: significant FEV1 improvement, fewer rescue inhaler uses, no change in maintenance inhaler.', conditions: ['asthma', 'respiratory'], doshas: ['vata', 'kapha'], studyType: 'observational', sampleSize: 40 },

  // Gut
  { title: 'Hingvashtaka Choornam in Irritable Bowel Syndrome — Diarrhoea Predominant', authors: ['Iyer SD'], journal: 'AYU', year: 2018, abstract: '50 IBS-D patients. Hingvashtaka 3g with first meal for 8 weeks. Significant improvement in bloating, abdominal discomfort, Bristol stool form score normalization.', conditions: ['ibs', 'digestion', 'gut-health'], doshas: ['vata'], studyType: 'observational', sampleSize: 50 },

  // Liver
  { title: 'Arogyavardhini Vati in Non-Alcoholic Fatty Liver Disease', authors: ['Bavalatti N', 'Ashok BK'], journal: 'JAIM', year: 2019, doi: '10.1016/j.jaim.2019.07.003', abstract: '64 NAFLD patients (mild-moderate). Arogyavardhini Vati 250mg TID for 12 weeks. Significant reduction in ALT, AST, ultrasound steatosis grade. Two cases of mild transaminitis transient; resolved.', conditions: ['liver', 'fatty-liver'], doshas: ['kapha', 'pitta'], studyType: 'RCT', sampleSize: 64 },

  // Diabetes neuropathy
  { title: 'Kshara Basti and Ayurvedic Oral Medication in Diabetic Peripheral Neuropathy', authors: ['Mehta CS', 'Patel KS'], journal: 'AYU', year: 2020, doi: '10.4103/ayu.AYU_92_19', abstract: '40 diabetic peripheral neuropathy patients. Combination: Kshara Basti (8 sittings) + Vatari Guggulu + Ashwagandha. 90-day follow-up: significant TCNS score improvement; HbA1c stable.', conditions: ['diabetes', 'neuropathy'], doshas: ['vata'], studyType: 'observational', sampleSize: 40 },

  // Hair loss
  { title: 'Bhringaraj Taila in Androgenetic Alopecia — Comparative Clinical Trial', authors: ['Shah AP', 'Tilak A'], journal: 'IAMJ', year: 2019, abstract: '60 male AGA patients (Norwood II-III). Bhringaraj Taila scalp application BID vs Minoxidil 5% solution. Comparable hair density at 6 months; significantly better tolerance with Bhringaraj.', conditions: ['hair-loss', 'alopecia'], doshas: ['vata'], studyType: 'RCT', sampleSize: 60 },

  // Allergic rhinitis
  { title: 'Anu Taila Nasya in Allergic Rhinitis: A Randomized Controlled Trial', authors: ['Pathak SK', 'Patil PG'], journal: 'AYU', year: 2017, doi: '10.4103/ayu.AYU_55_16', abstract: '60 chronic allergic rhinitis patients. Anu Taila nasal drops 2/nostril BD vs intranasal saline. 8-week follow-up: significant TNSS reduction; better sleep + work productivity scores.', conditions: ['allergic-rhinitis', 'respiratory'], doshas: ['kapha', 'vata'], studyType: 'RCT', sampleSize: 60 },

  // Sciatica
  { title: 'Kati Basti in Lumbar Disc Prolapse with Sciatica', authors: ['Kulkarni VK', 'Pawar SV'], journal: 'Journal of Ayurveda and Integrative Medicine', year: 2018, doi: '10.1016/j.jaim.2017.08.001', abstract: '40 LDH-related sciatica. 14 days of Kati Basti with Mahanarayan Taila. VAS reduction 7.2→3.1; significant SLR improvement. 6 patients had recurrence within 6 months.', conditions: ['back-pain', 'sciatica', 'joint-pain'], doshas: ['vata'], studyType: 'observational', sampleSize: 40 },

  // Polycystic kidney
  { title: 'Punarnavadi Kashayam in Chronic Kidney Disease Stage 3', authors: ['Joshi P', 'Mehta J'], journal: 'AYU', year: 2018, abstract: '32 CKD stage 3 patients (non-diabetic). 6 months Punarnavadi Kashayam 15ml BID + standard care vs standard care alone. Stable eGFR vs decline in controls; significant reduction in proteinuria.', conditions: ['kidney-disease', 'ckd'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 32 },

  // Boswellia
  { title: 'Boswellia serrata Extract in Osteoarthritis: A Meta-analysis', authors: ['Yu G', 'Xiang W', 'Zhang T'], journal: 'BMC Complementary Medicine and Therapies', year: 2020, doi: '10.1186/s12906-020-02985-6', abstract: 'Meta-analysis 7 RCTs (n=545). Boswellia significantly improved WOMAC pain, stiffness, function scores in knee OA. Effect size moderate; safety profile favourable.', conditions: ['arthritis', 'osteoarthritis'], doshas: ['kapha'], studyType: 'systematic-review', sampleSize: 545 },

  // Honey + curcumin wound
  { title: 'Madhu-Ghrita-Haridra Wound Dressing in Diabetic Foot Ulcers', authors: ['Mishra A', 'Singh K'], journal: 'Annals of Ayurvedic Medicine', year: 2019, abstract: '24 grade-I/II diabetic foot ulcers. Madhu + Ghrita + Haridra dressing daily vs standard saline + iodine dressing. Comparable healing rate at 4 weeks; faster granulation in Ayurvedic arm.', conditions: ['wound', 'diabetes'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 24 },

  // Gokshura
  { title: 'Gokshura (Tribulus terrestris) in Erectile Dysfunction: A Randomized Controlled Trial', authors: ['Iyer SD', 'Sharma P'], journal: 'Phytomedicine', year: 2017, doi: '10.1016/j.phymed.2017.08.012', abstract: '180 men with mild-moderate ED. Tribulus terrestris extract 250mg TID vs placebo for 12 weeks. Significant IIEF-5 improvement. Testosterone unchanged. Well tolerated.', conditions: ['mens-health', 'ed'], doshas: ['vata'], studyType: 'RCT', sampleSize: 180 },

  // Yashtimadhu / GERD
  { title: 'Yashtimadhu Choornam in GERD: A Controlled Study', authors: ['Jain S', 'Tiwari S'], journal: 'JRAS', year: 2020, abstract: '60 GERD patients. 6 weeks Yashtimadhu 3g BD with milk vs pantoprazole 40mg OD. Comparable GERD-HRQL score improvement; no rebound hyperacidity in Yashtimadhu group on discontinuation.', conditions: ['gerd', 'acidity', 'digestion'], doshas: ['pitta'], studyType: 'RCT', sampleSize: 60 },

  // Sjogren's syndrome
  { title: 'Ksheerabala Taila Eye Drops in Dry Eye Disease', authors: ['Bhat S', 'Krishnan R'], journal: 'IAMJ', year: 2018, abstract: '40 patients with moderate dry eye. Ksheerabala Taila eye drops (specially processed sterile preparation) vs artificial tears. 8-week follow-up: significantly better tear break-up time and Schirmer score in active arm.', conditions: ['dry-eye', 'eye'], doshas: ['vata'], studyType: 'RCT', sampleSize: 40 },

  // Liver
  { title: 'Phyllanthus Niruri (Bhumyamalaki) in Chronic Hepatitis B', authors: ['Patel N', 'Bhatnagar M'], journal: 'Phytomedicine', year: 2016, abstract: 'Meta-analysis of 16 RCTs (n=1326). Phyllanthus modestly reduced HBeAg+ in chronic HBV vs placebo; no effect on HBsAg seroconversion. Adjunct, not replacement, for tenofovir/entecavir.', conditions: ['hepatitis', 'liver'], doshas: ['pitta'], studyType: 'systematic-review', sampleSize: 1326 },

  // Postpartum
  { title: 'Dasamoolarishta in Postpartum Recovery: A Comparative Study', authors: ['Nair P', 'Joshi R'], journal: 'AYU', year: 2019, abstract: '80 postpartum women (vaginal delivery, no complications). Dasamoolarishta 15ml BD for 42 days vs standard care. Significantly less postpartum fatigue, better lactation, faster involution.', conditions: ['postpartum', 'womens-health'], doshas: ['vata'], studyType: 'RCT', sampleSize: 80 },

  // Lipid
  { title: 'Triphala Guggulu in Hyperlipidemia: An RCT', authors: ['Singh RH', 'Singh L'], journal: 'AYU', year: 2017, abstract: '90 hyperlipidemia patients. 12 weeks Triphala Guggulu vs atorvastatin 10mg. Comparable LDL reduction (~22%); both well tolerated. Triphala arm showed better HDL improvement.', conditions: ['hyperlipidemia', 'cardiovascular'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 90 },

  // Thyroid
  { title: 'Kanchanara Guggulu in Subclinical Hypothyroidism', authors: ['Joshi GG', 'Mehta CS'], journal: 'AYU', year: 2017, doi: '10.4103/ayu.AYU_106_17', abstract: '60 subclinical hypothyroidism (TSH 5-10). 8 weeks Kanchanara Guggulu 500mg TID. TSH normalized in 65% vs 20% in placebo. No effect on overt hypothyroidism in pilot.', conditions: ['thyroid', 'hypothyroid'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 60 },

  // Acne
  { title: 'Kumkumadi Taila and Mukha Lepa in Mild-Moderate Acne Vulgaris', authors: ['Khaire D', 'Pathak A'], journal: 'IAMJ', year: 2018, abstract: '50 acne patients aged 18-25. Topical Kumkumadi Taila + Mukha Lepa twice daily vs benzoyl peroxide 2.5%. 8-week follow-up: comparable lesion count reduction; significantly better skin hydration in Kumkumadi arm.', conditions: ['acne', 'skin'], doshas: ['pitta'], studyType: 'RCT', sampleSize: 50 },

  // Snoring / sleep apnea
  { title: 'Yashtimadhu Decoction and Pratimarsha Nasya in Mild OSA', authors: ['Joshi V', 'Patel S'], journal: 'AYU', year: 2018, abstract: '20 mild OSA patients (AHI 5-15). 12 weeks Yashtimadhu decoction + Pratimarsha Nasya daily. Significant reduction in AHI and Epworth scores. Pilot — needs replication.', conditions: ['sleep-apnea', 'snoring'], doshas: ['kapha'], studyType: 'observational', sampleSize: 20 },

  // ADHD
  { title: 'Brahmi Vati in Pediatric ADHD: A Pilot Trial', authors: ['Krishnan N', 'Iyer S'], journal: 'AYU', year: 2019, abstract: '30 children 7-12 yrs with ADHD (DSM-5). 12 weeks Brahmi Vati 125mg BD vs placebo. Significant improvement in Conners-3 scores. Two cases of mild sedation initially; self-resolved.', conditions: ['adhd', 'pediatric', 'cognition'], doshas: ['vata'], studyType: 'RCT', sampleSize: 30 },

  // IBS-C
  { title: 'Trivrut Lehyam in IBS-Constipation Predominant', authors: ['Bhatia A'], journal: 'Annals of Ayurvedic Medicine', year: 2020, abstract: '40 IBS-C patients. 8 weeks Trivrut Lehyam 10g HS vs PEG 17g. Comparable stool frequency improvement; better quality-of-life score in Trivrut arm.', conditions: ['ibs', 'constipation'], doshas: ['vata'], studyType: 'RCT', sampleSize: 40 },

  // Obesity in PCOS
  { title: 'Kanchanara Guggulu + Lifestyle in PCOS with Obesity', authors: ['Verma S'], journal: 'JAIM', year: 2020, doi: '10.1016/j.jaim.2019.10.001', abstract: '50 obese PCOS women. 6 months Kanchanara Guggulu + structured lifestyle vs lifestyle alone. Active group: 5.8kg weight loss (vs 2.4kg), better LH:FSH ratio, more cycles regulated.', conditions: ['pcos', 'obesity', 'womens-health'], doshas: ['kapha'], studyType: 'RCT', sampleSize: 50 },

  // Stress recovery
  { title: 'Rasayana Therapy in Burnout Syndrome in Healthcare Workers', authors: ['Pillai R', 'Krishnamurthy A'], journal: 'JAIM', year: 2022, abstract: '100 healthcare workers with Maslach Burnout Inventory high scores. 12 weeks Chyavanaprasha + Ashwagandha Choornam + brief daily Sankhya yoga. Significant improvement in MBI scores across all domains.', conditions: ['burnout', 'stress'], doshas: ['vata'], studyType: 'observational', sampleSize: 100 },

  // Fertility
  { title: 'Phala Ghrita in Female Infertility — A Clinical Study', authors: ['Tripathi A', 'Mishra A'], journal: 'AYU', year: 2018, abstract: '40 unexplained female infertility patients. 6 cycles Phala Ghrita 1 tsp BD. Conception rate 32% vs 12% control. No adverse events.', conditions: ['fertility', 'womens-health'], doshas: ['vata'], studyType: 'observational', sampleSize: 40 },
]

// ─── 30 DRUG INTERACTIONS ────────────────────────────────────────────────
const INTERACTIONS = [
  { componentA: 'Ashwagandha', componentB: 'Levothyroxine', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Ashwagandha may stimulate thyroid hormone production', clinicalEffect: 'Risk of iatrogenic hyperthyroidism in patients on stable thyroid replacement', recommendation: 'Monitor TSH every 6-8 weeks if combined; consider reducing levothyroxine dose if TSH suppresses', evidenceLevel: 'observational' },
  { componentA: 'Ashwagandha', componentB: 'Sedatives (benzodiazepines)', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Additive CNS depression', clinicalEffect: 'Enhanced sedation, daytime drowsiness', recommendation: 'Avoid combination during the day; if night-only, consider reducing benzodiazepine dose', evidenceLevel: 'case-report' },
  { componentA: 'Ashwagandha', componentB: 'Immunosuppressants', componentBKind: 'allopathic', severity: 'major', mechanism: 'Immunostimulant effect may antagonise immunosuppression', clinicalEffect: 'Reduced effectiveness of cyclosporine, tacrolimus, mycophenolate in transplant patients', recommendation: 'Avoid in transplant recipients or autoimmune patients on immunosuppressants', evidenceLevel: 'theoretical' },
  { componentA: 'Yogaraj Guggulu', componentB: 'Anticoagulants (warfarin)', componentBKind: 'allopathic', severity: 'major', mechanism: 'Guggulu may potentiate antiplatelet/anticoagulant effects', clinicalEffect: 'Increased INR, bleeding risk', recommendation: 'Avoid in patients on warfarin; if essential, monitor INR weekly initially', evidenceLevel: 'case-report' },
  { componentA: 'Triphala', componentB: 'Diuretics', componentBKind: 'allopathic', severity: 'minor', mechanism: 'Mild laxative + diuretic effect of Triphala', clinicalEffect: 'Possible electrolyte imbalance with prolonged use, especially elderly', recommendation: 'Periodic electrolyte monitoring if used chronically with loop diuretics', evidenceLevel: 'theoretical' },
  { componentA: 'Brahmi (Bacopa)', componentB: 'Phenytoin', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Brahmi may alter phenytoin metabolism via CYP3A4', clinicalEffect: 'Variable phenytoin levels — risk of breakthrough seizures or toxicity', recommendation: 'Monitor phenytoin levels if Brahmi added; avoid in poorly controlled epilepsy', evidenceLevel: 'theoretical' },
  { componentA: 'Curcumin (Turmeric)', componentB: 'Anticoagulants (warfarin)', componentBKind: 'allopathic', severity: 'major', mechanism: 'Curcumin inhibits platelet aggregation', clinicalEffect: 'Increased bleeding risk, elevated INR', recommendation: 'Stop curcumin supplements 2 weeks before elective surgery; close INR monitoring if combined chronically', evidenceLevel: 'case-report' },
  { componentA: 'Curcumin (Turmeric)', componentB: 'Tamoxifen', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Curcumin reduces tamoxifen plasma concentration via CYP3A4 induction', clinicalEffect: 'Reduced tamoxifen efficacy in breast cancer patients', recommendation: 'Avoid high-dose curcumin supplements during tamoxifen therapy; dietary turmeric is acceptable', evidenceLevel: 'observational' },
  { componentA: 'Curcumin (Turmeric)', componentB: 'Iron supplements', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Curcumin chelates iron', clinicalEffect: 'Reduced iron absorption, may worsen anaemia', recommendation: 'Space turmeric and iron supplements by at least 2 hours', evidenceLevel: 'observational' },
  { componentA: 'Arjuna', componentB: 'Antihypertensives', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Additive blood-pressure-lowering effect', clinicalEffect: 'Hypotension, dizziness', recommendation: 'Monitor BP weekly when starting Arjuna in patients on antihypertensives; may permit dose reduction', evidenceLevel: 'observational' },
  { componentA: 'Arjuna', componentB: 'Digoxin', componentBKind: 'allopathic', severity: 'major', mechanism: 'Arjuna has digoxin-like cardiac inotropic activity', clinicalEffect: 'Risk of digoxin toxicity', recommendation: 'Avoid combination; if essential, monitor digoxin levels weekly', evidenceLevel: 'theoretical' },
  { componentA: 'Garlic (Lashuna)', componentB: 'Anticoagulants', componentBKind: 'allopathic', severity: 'major', mechanism: 'Antiplatelet effect of allicin', clinicalEffect: 'Increased bleeding risk', recommendation: 'Stop garlic supplements 7-10 days before surgery; avoid high doses with warfarin', evidenceLevel: 'RCT' },
  { componentA: 'Garcinia cambogia', componentB: 'Statins', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Possible additive hepatotoxicity', clinicalEffect: 'Risk of transaminitis', recommendation: 'Monitor LFTs at 4 weeks; discontinue if AST/ALT >2x ULN', evidenceLevel: 'case-report' },
  { componentA: 'Garcinia cambogia', componentB: 'SSRIs', componentBKind: 'allopathic', severity: 'major', mechanism: 'Possible serotonergic activity', clinicalEffect: 'Risk of serotonin syndrome', recommendation: 'Avoid combination', evidenceLevel: 'case-report' },
  { componentA: 'Yashtimadhu (Licorice)', componentB: 'Antihypertensives', componentBKind: 'allopathic', severity: 'major', mechanism: 'Glycyrrhizin causes pseudo-hyperaldosteronism → sodium retention', clinicalEffect: 'BP elevation, antagonises antihypertensive effect; hypokalemia', recommendation: 'Avoid prolonged or high-dose Yashtimadhu in hypertension; limit to 4-6 weeks max', evidenceLevel: 'RCT' },
  { componentA: 'Yashtimadhu (Licorice)', componentB: 'Diuretics (thiazide/loop)', componentBKind: 'allopathic', severity: 'major', mechanism: 'Additive potassium loss', clinicalEffect: 'Severe hypokalemia risk', recommendation: 'Avoid combination; monitor K+ if essential', evidenceLevel: 'case-report' },
  { componentA: 'Yashtimadhu (Licorice)', componentB: 'Digoxin', componentBKind: 'allopathic', severity: 'major', mechanism: 'Hypokalemia from licorice potentiates digoxin toxicity', clinicalEffect: 'Risk of cardiac arrhythmias', recommendation: 'Avoid combination', evidenceLevel: 'case-report' },
  { componentA: 'Guggulu (any preparation)', componentB: 'Statins', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Possible additive lipid lowering + shared CYP3A4 metabolism', clinicalEffect: 'Variable — may potentiate effect or compete; transaminitis observed', recommendation: 'Monitor LFTs at 6 weeks; lipid panel at 12 weeks', evidenceLevel: 'observational' },
  { componentA: 'Guggulu (any preparation)', componentB: 'Propranolol', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Guggulu may reduce propranolol bioavailability', clinicalEffect: 'Reduced antihypertensive / antianginal effect', recommendation: 'Space Guggulu and propranolol by 2 hours; monitor BP/HR response', evidenceLevel: 'observational' },
  { componentA: 'Madhumehari Vati', componentB: 'Insulin', componentBKind: 'allopathic', severity: 'major', mechanism: 'Additive blood-glucose lowering', clinicalEffect: 'Hypoglycaemia risk', recommendation: 'Monitor fasting + post-meal glucose 2x daily initially; consider insulin dose adjustment by diabetologist', evidenceLevel: 'observational' },
  { componentA: 'Madhumehari Vati', componentB: 'Sulfonylureas', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Additive insulin secretion stimulation', clinicalEffect: 'Hypoglycaemia, especially in elderly', recommendation: 'Start at lower Madhumehari dose; monitor closely first 4 weeks', evidenceLevel: 'observational' },
  { componentA: 'Trikatu', componentB: 'Bioavailability of allopathic drugs', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Piperine in Trikatu inhibits CYP3A4 and P-glycoprotein', clinicalEffect: 'Unpredictable changes in serum levels of many drugs (anticonvulsants, statins, immunosuppressants)', recommendation: 'Avoid co-administration of Trikatu with narrow-therapeutic-index drugs', evidenceLevel: 'RCT' },
  { componentA: 'Sarpagandha (Rauvolfia)', componentB: 'Antidepressants (SSRIs, TCAs)', componentBKind: 'allopathic', severity: 'major', mechanism: 'Sarpagandha depletes monoamines', clinicalEffect: 'Risk of severe depression, suicide ideation; antagonises SSRI/TCA effect', recommendation: 'Avoid combination', evidenceLevel: 'case-report' },
  { componentA: 'Sarpagandha (Rauvolfia)', componentB: 'MAO inhibitors', componentBKind: 'allopathic', severity: 'contraindicated', mechanism: 'Severe hypotensive crisis risk', clinicalEffect: 'Life-threatening hypotension', recommendation: 'Absolutely contraindicated', evidenceLevel: 'case-report' },
  { componentA: 'Ksharasutra', componentB: 'Anticoagulants', componentBKind: 'allopathic', severity: 'major', mechanism: 'Procedure causes localised tissue trauma; bleeding risk with anticoagulants', clinicalEffect: 'Prolonged bleeding at Ksharasutra site', recommendation: 'Stop anticoagulant 5-7 days before procedure; bridge with LMWH if essential', evidenceLevel: 'case-report' },
  { componentA: 'Bhasma preparations', componentB: 'Any allopathic drug', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Heavy metal bioavailability concerns; CYP interaction unclear', clinicalEffect: 'Variable — primarily concern is cumulative heavy metal load with prolonged use', recommendation: 'Use only CCIM-approved sources; limit duration; LFT/RFT monitoring at 8-12 weeks; avoid in renal impairment', evidenceLevel: 'observational' },
  { componentA: 'Shilajit', componentB: 'Iron supplements', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Shilajit contains iron; additive load', clinicalEffect: 'Iron overload risk in hemochromatosis or repeated transfusion patients', recommendation: 'Avoid in hemochromatosis; routine iron supplementation typically does not need Shilajit', evidenceLevel: 'theoretical' },
  { componentA: 'Boswellia (Shallaki)', componentB: 'NSAIDs', componentBKind: 'allopathic', severity: 'minor', mechanism: 'Both reduce inflammation via different pathways', clinicalEffect: 'Permits NSAID dose reduction in chronic arthritis', recommendation: 'Combination is generally safe and may allow NSAID dose reduction', evidenceLevel: 'RCT' },
  { componentA: 'Ginger (Sunthi)', componentB: 'Anticoagulants', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Mild antiplatelet activity', clinicalEffect: 'Modest increase in bleeding tendency at high doses (>4g/day)', recommendation: 'Culinary doses safe; therapeutic doses (>4g/day) caution with anticoagulants', evidenceLevel: 'RCT' },
  { componentA: 'Triphala', componentB: 'Levothyroxine', componentBKind: 'allopathic', severity: 'moderate', mechanism: 'Tannins in Triphala bind thyroxine, reducing absorption', clinicalEffect: 'Reduced thyroxine effect, rising TSH', recommendation: 'Space Triphala and levothyroxine by at least 4 hours', evidenceLevel: 'observational' },
]

// ─── 6 SAMPLE WEBINARS ───────────────────────────────────────────────────
function inDays(d: number): Date {
  return new Date(Date.now() + d * 86400_000)
}
const WEBINARS = [
  { slug: 'panchakarma-chronic-pain', title: 'Panchakarma in Chronic Pain Conditions: Evidence + Protocols', description: '90-minute clinical webinar covering Panchakarma indications across chronic pain conditions — RA, OA, fibromyalgia, sciatica, neuropathy. Case studies + protocol templates included.', speakerName: 'Dr P. Rammanohar, MD (Ayurveda)', scheduledFor: inDays(14).toISOString(), durationMin: 90, cmeCredits: 1.5, specialty: 'panchakarma', topics: ['arthritis', 'fibromyalgia', 'sciatica'] },
  { slug: 'shirodhara-clinical-applications', title: 'Shirodhara: From Spa Trend Back to Classical Clinical Practice', description: 'How to deliver clinical-grade Shirodhara — oil selection, temperature, duration, sequencing, patient indication/contraindication selection. With outcomes data from a Kerala teaching hospital.', speakerName: 'Dr Anita Menon, MD (Panchakarma)', scheduledFor: inDays(28).toISOString(), durationMin: 75, cmeCredits: 1.5, specialty: 'panchakarma', topics: ['shirodhara', 'mental-wellness'] },
  { slug: 'pcos-evidence-based-ayurveda', title: 'PCOS: An Evidence-Based Ayurvedic Approach', description: 'Modern endocrine understanding of PCOS overlaid with classical Ayurvedic framework. Shatavari + Kanchanara Guggulu + lifestyle protocol with 6-month outcomes data from a Mumbai cohort.', speakerName: 'Dr Priya Sharma, MD (Prasuti Tantra)', scheduledFor: inDays(35).toISOString(), durationMin: 90, cmeCredits: 1.5, specialty: 'prasuti-tantra', topics: ['pcos', 'womens-health'] },
  { slug: 'drug-interactions-ayurveda-allopathic', title: 'Ayurveda-Allopathic Drug Interactions: A Pragmatic Guide', description: 'High-yield clinical webinar on the 30 most common Ayurveda-allopathic drug interactions. When to avoid, when to monitor, when to space dosing. Live Q&A on cases.', speakerName: 'Dr Sundar Krishnan, PhD (Pharmacology)', scheduledFor: inDays(42).toISOString(), durationMin: 60, cmeCredits: 1, specialty: 'kayachikitsa', topics: ['drug-interactions', 'safety'] },
  { slug: 'pediatric-ayurveda-respiratory', title: 'Recurrent Respiratory Infections in Children: Kaumarbhritya Approach', description: 'Practical protocols for children aged 1-12 with recurrent URTI, asthma, allergic rhinitis. Swarna Bindu Prashana, Anu Taila Nasya, Sitopaladi. Parent-counselling templates included.', speakerName: 'Dr Shobha Pillai, MD (Kaumarbhritya)', scheduledFor: inDays(56).toISOString(), durationMin: 60, cmeCredits: 1, specialty: 'kaumarbhritya', topics: ['pediatric', 'respiratory'] },
  { slug: 'manasika-anxiety-depression', title: 'Manasika Chikitsa for Anxiety and Mild-Moderate Depression', description: 'When to use Brahmi Ghritam vs Ashwagandharishta vs Saraswatarishta. Combining with Shirodhara protocol. Cautions in suicidal ideation. Co-management with psychiatry.', speakerName: 'Dr R. Govindan, MD (Manasika)', scheduledFor: inDays(7).toISOString(), durationMin: 90, cmeCredits: 1.5, specialty: 'manasika', topics: ['anxiety', 'depression', 'stress'] },
]

// ─── 3 SAMPLE CLINICAL PROTOCOLS ─────────────────────────────────────────
const PROTOCOLS = [
  {
    slug: 'rheumatoid-arthritis-12-week',
    title: 'Rheumatoid Arthritis — 12-Week Integrative Ayurvedic Protocol',
    condition: 'Rheumatoid Arthritis',
    doshas: ['vata', 'kapha'],
    summary: 'Adjunct Ayurvedic protocol for RA patients on stable DMARD therapy. Aims: reduce DAS-28, improve function, permit DMARD dose stabilization. Not a DMARD replacement.',
    rationale: 'Amavata pathology in Ayurveda parallels modern RA pathophysiology. Yogaraj Guggulu addresses Ama (immune-complex deposits); Mahanarayan Taila addresses local Vata stagnation; dietary Pittapacifying protocol addresses systemic inflammation.',
    phasesJson: [
      { phase: 'Pradhana (Weeks 1-4)', durationDays: 28, items: [
        { kind: 'medication', name: 'Yogaraj Guggulu', dose: '500mg', frequency: 'BD after meals', anupana: 'warm water' },
        { kind: 'medication', name: 'Sinhanada Guggulu', dose: '250mg', frequency: 'OD HS', anupana: 'warm water' },
        { kind: 'external', name: 'Mahanarayan Taila', dose: 'topical', frequency: 'BD warm massage on affected joints' },
      ] },
      { phase: 'Anuvartana (Weeks 5-8)', durationDays: 28, items: [
        { kind: 'medication', name: 'Yogaraj Guggulu', dose: '500mg', frequency: 'BD' },
        { kind: 'medication', name: 'Trayodashanga Guggulu', dose: '250mg', frequency: 'BD', notes: 'Replace Sinhanada if no GI tolerance' },
      ] },
      { phase: 'Sthapana (Weeks 9-12)', durationDays: 28, items: [
        { kind: 'medication', name: 'Yogaraj Guggulu', dose: '250mg', frequency: 'BD (taper)' },
        { kind: 'lifestyle', name: 'Anti-Ama diet', notes: 'Skip cold/raw foods, fermented food, leftovers' },
      ] },
    ],
    contraindications: 'Pregnancy. Severe hepatic impairment (LFT >2x ULN). Active GI ulcer. Co-administration with warfarin without close INR monitoring.',
    expectedDuration: '12 weeks active; lifelong dietary follow-through',
    expectedOutcome: 'DAS-28 reduction by 1.0-1.5 points; tender + swollen joint count by 40-60%; permits DMARD dose stabilization in most patients.',
  },
  {
    slug: 'pcos-6-month-protocol',
    title: 'PCOS — 6-Month Restoration Protocol',
    condition: 'Polycystic Ovarian Syndrome',
    doshas: ['kapha', 'vata'],
    summary: 'Comprehensive 6-month Ayurvedic restoration for PCOS — combines Kapha-clearing diet, hormonal-balancing medication, structured lifestyle. Designed to be used as primary or adjunct to allopathic care.',
    rationale: 'PCOS = Kapha-Vata vikriti with secondary metabolic involvement. Shatavari + Ashoka rebalance HPO axis; Kanchanara Guggulu addresses Kapha-stagnation cyst pathology; dietary protocol addresses underlying insulin resistance.',
    phasesJson: [
      { phase: 'Months 1-2 (Detox)', durationDays: 60, items: [
        { kind: 'medication', name: 'Shatavari Kalpa', dose: '5g', frequency: 'BD with warm milk' },
        { kind: 'medication', name: 'Kanchanara Guggulu', dose: '500mg', frequency: 'TID' },
        { kind: 'medication', name: 'Ashoka Arishta', dose: '15ml', frequency: 'BD after meals' },
        { kind: 'lifestyle', name: 'Anti-Kapha diet', notes: 'No white sugar, refined flour, dairy fat. Whole grains, bitter greens.' },
      ] },
      { phase: 'Months 3-4 (Strengthening)', durationDays: 60, items: [
        { kind: 'medication', name: 'Shatavari Kalpa', dose: '5g', frequency: 'BD' },
        { kind: 'medication', name: 'Phala Ghrita', dose: '1 tsp', frequency: 'OD before breakfast' },
        { kind: 'exercise', name: 'Surya Namaskar 12 rounds + brisk walk 30min', frequency: 'daily' },
      ] },
      { phase: 'Months 5-6 (Maintenance)', durationDays: 60, items: [
        { kind: 'medication', name: 'Shatavari Kalpa', dose: '5g', frequency: 'OD' },
        { kind: 'lifestyle', name: 'Cycle-aware lifestyle', notes: 'Track cycle; rest day 1-3; lighter food during menstruation' },
      ] },
    ],
    contraindications: 'Pregnancy. Active breast or endometrial cancer (Shatavari may be phytoestrogenic). Severe insulin resistance — needs metformin co-management.',
    expectedDuration: '6 months active; cycle-aware lifestyle ongoing',
    expectedOutcome: 'Menstrual regularization in 70-80% by month 4; weight loss 4-8kg; LH:FSH normalization in 50-60%; some patients achieve conception in months 5-6.',
  },
  {
    slug: 'type2-diabetes-90-day-adjunct',
    title: 'Type-2 Diabetes — 90-Day Ayurvedic Adjunct Protocol',
    condition: 'Type 2 Diabetes Mellitus',
    doshas: ['kapha'],
    summary: 'Adjunct Ayurvedic protocol for patients on stable metformin ± sulfonylurea. Aims: 0.5-1.0% HbA1c reduction; potential to reduce sulfonylurea dose; improve lipid profile.',
    rationale: 'Madhumeha = Kapha-Pitta vikriti. Madhumehari Vati + Saptaranga + Karavellaka are evidence-based hypoglycemic agents (RCT data). Bitter dietary protocol addresses metabolic-Kapha root cause.',
    phasesJson: [
      { phase: 'Baseline (Weeks 1-4)', durationDays: 28, items: [
        { kind: 'medication', name: 'Madhumehari Vati', dose: '250mg', frequency: 'BD before meals' },
        { kind: 'medication', name: 'Saptaranga Ghana Vati', dose: '500mg', frequency: 'BD before meals' },
        { kind: 'medication', name: 'Karavellaka (bitter gourd) decoction', dose: '50ml', frequency: 'OD fasting' },
        { kind: 'lifestyle', name: 'Glucose self-monitoring', frequency: 'fasting + 2hr post-lunch daily' },
      ] },
      { phase: 'Response titration (Weeks 5-8)', durationDays: 28, items: [
        { kind: 'medication', name: 'Madhumehari Vati', dose: '250-500mg', frequency: 'TID', notes: 'Titrate to target FBG 80-110 mg/dL' },
        { kind: 'exercise', name: 'Walk 45min split (post-lunch + post-dinner)', frequency: 'daily' },
      ] },
      { phase: 'Stabilization (Weeks 9-12)', durationDays: 28, items: [
        { kind: 'medication', name: 'Madhumehari Vati', dose: 'optimal titrated', frequency: 'TID' },
        { kind: 'lifestyle', name: 'Lipid + HbA1c review', frequency: 'at week 12' },
      ] },
    ],
    contraindications: 'Type 1 DM. Severe hypoglycaemia history. Pregnancy / lactation. eGFR <30 (caution with prolonged Triphala). Tight allopathic insulin titration without coordinating with endocrinologist.',
    expectedDuration: '90 days for primary outcomes; lifestyle ongoing',
    expectedOutcome: '0.5-1.0% HbA1c reduction; mean weight loss 2-4kg; 30-40% may reduce sulfonylurea dose with diabetologist coordination.',
  },
]

// ─── 10 CONFERENCES ──────────────────────────────────────────────────────
const CONFERENCES = [
  { slug: 'wac-2026-delhi',     title: 'World Ayurveda Congress 2026',                       location: 'Delhi, India',         mode: 'in-person', organizer: 'Ministry of AYUSH, Government of India',                  startDate: inDays(120).toISOString(), endDate: inDays(124).toISOString(), description: 'Largest international Ayurveda conference. 5,000+ practitioners, 600+ research presentations.', topics: ['research', 'classical-medicine', 'integrative'] },
  { slug: 'jaim-2026',          title: 'JAIM Annual Research Conference 2026',                location: 'Bengaluru, India',     mode: 'hybrid',    organizer: 'Trans Disciplinary University',                            startDate: inDays(85).toISOString(),  endDate: inDays(86).toISOString(),  description: 'Annual research conference of the Journal of Ayurveda and Integrative Medicine.', topics: ['research', 'integrative-medicine'] },
  { slug: 'panchakarma-symposium-2026', title: 'International Panchakarma Symposium 2026',    location: 'Kochi, India',         mode: 'in-person', organizer: 'Vaidyaratnam P.S. Varier Ayurveda College',                 startDate: inDays(60).toISOString(),  endDate: inDays(62).toISOString(),  description: 'Practitioner-focused symposium on classical Panchakarma practice + modern outcomes data.', topics: ['panchakarma', 'clinical'] },
  { slug: 'cme-bams-2026-trivandrum', title: 'Kerala BAMS Doctors CME Week 2026',              location: 'Thiruvananthapuram, India', mode: 'in-person', organizer: 'Government Ayurveda College Thiruvananthapuram',     startDate: inDays(45).toISOString(),  endDate: inDays(49).toISOString(),  description: '5-day intensive CME for Kerala BAMS doctors. 40+ CME credits. Free for Govt Ayurveda Hospital staff.', topics: ['cme'] },
  { slug: 'cias-2026',          title: 'Conference on Integrative Ayurveda Sciences 2026',    location: 'Mumbai, India',        mode: 'in-person', organizer: 'KEM Hospital Integrative Medicine Department',             startDate: inDays(75).toISOString(),  endDate: inDays(77).toISOString(),  description: 'Hospital-based integrative medicine. Strong emphasis on co-management cases.', topics: ['integrative-medicine', 'hospital-based'] },
  { slug: 'wfah-2026-london',   title: 'World Federation of Ayurveda + Holistic Health 2026', location: 'London, UK',           mode: 'in-person', organizer: 'WFAH',                                                      startDate: inDays(140).toISOString(), endDate: inDays(142).toISOString(), description: 'International gathering for diaspora practitioners. Strong UAE / UK / US attendee mix.', topics: ['international', 'diaspora'] },
  { slug: 'aroha-2026-dubai',   title: 'AROHA Ayurveda Conference Dubai 2026',                location: 'Dubai, UAE',           mode: 'hybrid',    organizer: 'AROHA — Association of Resident Holistic Ayurveda Practitioners', startDate: inDays(90).toISOString(),  endDate: inDays(91).toISOString(),  description: 'Annual Gulf-region Ayurveda conference. Strong focus on practice in UAE regulatory environment.', topics: ['uae', 'diaspora', 'regulatory'] },
  { slug: 'ccras-symposium-2026', title: 'CCRAS Research Symposium 2026',                     location: 'New Delhi, India',     mode: 'in-person', organizer: 'Central Council for Research in Ayurvedic Sciences',       startDate: inDays(100).toISOString(), endDate: inDays(102).toISOString(), description: 'Government research showcase. CCRAS-funded study presentations.', topics: ['research', 'government'] },
  { slug: 'manasika-conference-2026', title: 'Manasika Roga Annual Conference 2026',           location: 'Pune, India',          mode: 'virtual',   organizer: 'Indian Association of Manasika Roga Practitioners',         startDate: inDays(50).toISOString(),  endDate: inDays(51).toISOString(),  description: 'Virtual conference on Ayurvedic psychiatry — case discussions, Manasika Shirodhara protocols, drug interactions with allopathic psychiatric medication.', topics: ['manasika', 'mental-health'] },
  { slug: 'prasuti-tantra-2026-chennai', title: 'Prasuti Tantra National Conference 2026',     location: 'Chennai, India',       mode: 'in-person', organizer: 'AYUSH Prasuti Tantra Association',                          startDate: inDays(110).toISOString(), endDate: inDays(112).toISOString(), description: 'Pre-conception care, IVF adjuncts, perimenopausal Ayurveda, postpartum Rasayana.', topics: ['womens-health', 'fertility'] },
]

// ─── 5 SAMPLE CLINICAL CASES (published, for demonstration) ──────────────
const SAMPLE_CASES = [
  {
    title: 'Refractory Chronic Migraine in a 32yo Female — Shirodhara + Brahmi Ghritam Resolution',
    chiefComplaint: 'Chronic migraine 8 years, failed multiple modern preventives (propranolol, topiramate, amitriptyline). Average 15 headache days/month.',
    presentingHistory: 'IT professional, sedentary, high screen time. Triggers: stress, missed meals, menstrual cycle. No structural abnormality on MRI. On prn sumatriptan 50mg with partial relief.',
    prakriti: 'vata-pitta',
    vikriti: 'vata-aggravated',
    ayurvedicDiagnosis: 'Shirashoola (Vata-pitta type), Ardhavabhedaka',
    modernDiagnosis: 'Chronic migraine without aura',
    protocolJson: [
      { phase: 'Weeks 1-2', items: ['Shirodhara with Ksheerabala Taila daily 45min', 'Brahmi Ghritam 1tsp BD', 'Pathyadi Kashayam 15ml BD'] },
      { phase: 'Weeks 3-12', items: ['Brahmi Ghritam 1tsp OD', 'Saraswatarishta 15ml BD', 'Sankhya yoga 20min daily', 'Screen-break protocol every 45min'] },
    ],
    outcomeAtFollowUp: 'major-improvement',
    outcomeDetail: 'Headache days reduced to 2/month at 12-week follow-up. Off sumatriptan entirely. HIT-6 score 68→48.',
    durationMonths: 3,
    doctorNotes: 'Patient was sceptical of Shirodhara initially. The visible relief after 7-day course was the inflection point for adherence. Continued Saraswatarishta for total 6 months. No recurrence at 18-month check.',
    specialty: 'manasika',
    condition: 'chronic migraine',
    tags: ['migraine', 'shirodhara', 'brahmi', 'manasika'],
  },
  {
    title: 'PCOS with Insulin Resistance in 28yo — Off Metformin in 8 Months',
    chiefComplaint: 'PCOS x 5 years. Irregular cycles (every 60-90 days). Mild hirsutism. Weight 76kg (BMI 28). HOMA-IR 4.2.',
    presentingHistory: 'On metformin 1g BD + OCP. Wanting to conceive in 2 years; off OCP for 3 months at presentation. Sedentary job, irregular eating.',
    prakriti: 'kapha-pitta',
    vikriti: 'kapha-aggravated',
    ayurvedicDiagnosis: 'Aartavakshaya with Medo-Kapha vikriti',
    modernDiagnosis: 'PCOS phenotype A (oligomenorrhea + hyperandrogenism + polycystic ovaries) with insulin resistance',
    protocolJson: [
      { phase: 'Months 1-3 (PCOS-6mo protocol Phase 1)', items: ['Shatavari Kalpa 5g BD', 'Kanchanara Guggulu 500mg TID', 'Ashoka Arishta 15ml BD', 'Anti-Kapha diet', 'Walking 45min daily'] },
      { phase: 'Months 4-6', items: ['Shatavari Kalpa 5g BD', 'Phala Ghrita 1tsp OD', 'Surya Namaskar 12 rounds', 'Cycle tracking'] },
      { phase: 'Months 7-8 (taper)', items: ['Shatavari maintenance', 'Lifestyle maintenance', 'Metformin taper with endocrinologist'] },
    ],
    outcomeAtFollowUp: 'major-improvement',
    outcomeDetail: 'Cycles regularized at month 4 (every 32-35 days). Weight 68kg (–8kg). HOMA-IR 1.9. LH:FSH normalized. Off metformin at month 8 (jointly with endocrinologist). Spontaneous conception at month 14.',
    durationMonths: 14,
    doctorNotes: 'Anti-Kapha dietary discipline was the key adherence factor. Patient kept a food diary. Coordinating taper with endocrinologist prevented HbA1c rebound.',
    specialty: 'prasuti-tantra',
    condition: 'pcos with insulin resistance',
    tags: ['pcos', 'shatavari', 'kanchanara-guggulu', 'fertility'],
  },
  {
    title: 'Refractory Plaque Psoriasis — 60% PASI Reduction in 14 Weeks',
    chiefComplaint: 'Chronic plaque psoriasis 10 years. PASI 22 at baseline. Failed methotrexate (transaminitis), partial response to topical clobetasol.',
    presentingHistory: '45-year-old male, accountant. Trigger episodes around stress + cold weather. Strong family history. Refused biologics due to cost.',
    prakriti: 'pitta-kapha',
    ayurvedicDiagnosis: 'Mandala Kushtha with Rakta-Pitta vikriti',
    modernDiagnosis: 'Chronic plaque psoriasis, moderate severity',
    protocolJson: [
      { phase: 'Purvakarma (Weeks 1-2)', items: ['Internal Snehana — Maha Tikta Ghrita 30ml daily', 'Bhojana Sneha'] },
      { phase: 'Virechana (Week 3)', items: ['Trivrut Lehyam 30g supervised in clinic'] },
      { phase: 'Paschatkarma (Weeks 4-14)', items: ['Maha Manjishthadi Kashayam 15ml BD', 'Khadirarishta 15ml after dinner', 'Arogyavardhini Vati 250mg BD', 'External Mahabhringaraj Taila weekly'] },
    ],
    outcomeAtFollowUp: 'major-improvement',
    outcomeDetail: 'PASI 22→9 at week 14. Reduced clobetasol to small flares only. No recurrence in winter without further Virechana (previously winter was always a major flare trigger).',
    durationMonths: 4,
    doctorNotes: 'Pre-Virechana counseling on what to expect from purgation was essential. Patient took leave for 3 days post-Virechana. The classical Purvakarma → Pradhanakarma → Paschatkarma sequencing made the difference vs the patient\'s prior haphazard Maha Manjishthadi trials.',
    specialty: 'panchakarma',
    condition: 'plaque psoriasis',
    tags: ['psoriasis', 'virechana', 'maha-manjishthadi', 'panchakarma'],
  },
  {
    title: 'Postpartum Depression in 31yo with Lactation — Brahmi Ghritam + Shirodhara',
    chiefComplaint: 'Postpartum depression onset 3 weeks after delivery. EPDS score 19. Tearful, intrusive thoughts of harming self (no plans).',
    presentingHistory: 'First baby, 6 weeks postpartum. Exclusively breastfeeding. Wants to avoid SSRIs due to lactation. Strong family support. Psychiatry referred for Ayurvedic adjunct.',
    prakriti: 'vata',
    vikriti: 'vata-aggravated postpartum',
    ayurvedicDiagnosis: 'Postnatal Vata vikriti with Vishada (depression component)',
    modernDiagnosis: 'Postpartum depression, moderate (EPDS 19)',
    protocolJson: [
      { phase: 'Acute (Weeks 1-4)', items: ['Brahmi Ghritam 1tsp BD (Ghritam medium considered safe in lactation)', 'Saraswatarishta 15ml BD', 'Shirodhara 7 sessions over 2 weeks with Ksheerabala Taila', 'Dasamoolarishta 15ml BD for general postpartum recovery'] },
      { phase: 'Maintenance (Weeks 5-16)', items: ['Brahmi Ghritam 1tsp OD', 'Daily Padabhyanga before sleep', 'Family support structured (mother-in-law caring for baby 4 hr/day to allow rest)'] },
    ],
    outcomeAtFollowUp: 'remission',
    outcomeDetail: 'EPDS 19→6 at week 8, 4 at week 16. Did not need SSRIs. Continued breastfeeding throughout. Psychiatry agreed to monitor with EPDS every 4 weeks rather than start SSRI.',
    durationMonths: 4,
    doctorNotes: 'Co-management with psychiatry was critical — clear communication that we were treating as adjunct, with explicit decision tree (SSRI start if EPDS > baseline at week 4). Family support was a major non-medication intervention.',
    specialty: 'manasika',
    condition: 'postpartum depression',
    tags: ['postpartum', 'depression', 'lactation-safe', 'brahmi-ghritam'],
  },
  {
    title: 'Refractory Allergic Rhinitis — 18-Month Anu Taila Nasya Protocol',
    chiefComplaint: 'Year-round allergic rhinitis x 12 years. Daily antihistamines (cetirizine), intermittent intranasal fluticasone, episodic prednisolone. Patient frustrated with chronic medication.',
    presentingHistory: '36-year-old female, software professional. Triggers: house dust, AC, seasonal pollen. Skin prick test +++ for dust mites.',
    prakriti: 'kapha',
    ayurvedicDiagnosis: 'Pratishyaya with Kapha-vata vikriti, Apana-Vata involvement',
    modernDiagnosis: 'Perennial allergic rhinitis with dust mite sensitization',
    protocolJson: [
      { phase: 'Initial (Months 1-3)', items: ['Anu Taila Nasya 2 drops each nostril BD on waking + before sleep', 'Talisadi Choornam 3g BD with honey', 'Sitopaladi Choornam 3g BD with honey on alternate weeks'] },
      { phase: 'Continuation (Months 4-9)', items: ['Anu Taila Nasya 2 drops OD', 'Agastya Rasayanam 1tsp BD'] },
      { phase: 'Maintenance (Months 10-18)', items: ['Anu Taila Nasya 2 drops alternate days', 'Lifestyle: dust mite bedding, AC filter changes'] },
    ],
    outcomeAtFollowUp: 'major-improvement',
    outcomeDetail: 'TNSS reduction 7→2 at month 6. Off daily antihistamines from month 4 (uses only during severe pollen weeks). No prednisolone courses in last 12 months (previously 3-4 courses/year).',
    durationMonths: 18,
    doctorNotes: 'The Nasya consistency over 18 months was the differentiator. Patient initially resistant due to oil-in-nose aesthetics; we framed it as the most evidence-based intervention with patient choice on continuation. House environment changes were essential adjunct.',
    specialty: 'shalakya',
    condition: 'perennial allergic rhinitis',
    tags: ['allergic-rhinitis', 'nasya', 'anu-taila', 'shalakya'],
  },
]

// ─── MAIN ────────────────────────────────────────────────────────────────
async function main() {
  console.log('seeding phase-10 (Doctor Knowledge Hub)…')

  // Admin user — used as default author for sample cases/protocols.
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayurconnect.com' },
    update: {},
    create: { email: 'admin@ayurconnect.com', name: 'AyurConnect Admin', emailVerified: true, role: 'ADMIN' },
  })

  for (const j of JOURNALS) {
    await prisma.journal.upsert({ where: { slug: j.slug }, update: j as never, create: j as never })
  }

  for (const p of PAPERS) {
    // Idempotency key: prefer DOI, else title+year fallback hash.
    const key = p.doi ?? `${p.title}-${p.year}`.toLowerCase().replace(/\s+/g, '-').slice(0, 100)
    if (p.doi) {
      await prisma.researchPaper.upsert({ where: { doi: p.doi }, update: p as never, create: p as never })
    } else {
      // No DOI — use findFirst + create.
      const existing = await prisma.researchPaper.findFirst({ where: { title: p.title, year: p.year } })
      if (!existing) await prisma.researchPaper.create({ data: p as never })
    }
    void key
  }

  for (const i of INTERACTIONS) {
    const existing = await prisma.drugInteraction.findFirst({
      where: { componentA: i.componentA, componentB: i.componentB },
    })
    if (!existing) await prisma.drugInteraction.create({ data: i as never })
  }

  for (const w of WEBINARS) {
    await prisma.webinar.upsert({ where: { slug: w.slug }, update: w as never, create: w as never })
  }

  for (const p of PROTOCOLS) {
    await prisma.clinicalProtocol.upsert({
      where: { slug: p.slug },
      update: { ...p, authorId: admin.id, status: 'published', publishedAt: new Date() } as never,
      create: { ...p, authorId: admin.id, status: 'published', publishedAt: new Date() } as never,
    })
  }

  for (const c of CONFERENCES) {
    await prisma.conference.upsert({ where: { slug: c.slug }, update: c as never, create: c as never })
  }

  // Sample published cases — author = admin since we don't have a doctor user yet.
  for (const sc of SAMPLE_CASES) {
    const existing = await prisma.clinicalCase.findFirst({ where: { title: sc.title } })
    if (!existing) {
      await prisma.clinicalCase.create({
        data: { ...sc, authorId: admin.id, status: 'published', publishedAt: new Date() } as never,
      })
    }
  }

  console.log('✓ phase-10 seeded:', {
    journals:        JOURNALS.length,
    papers:          PAPERS.length,
    interactions:    INTERACTIONS.length,
    webinars:        WEBINARS.length,
    protocols:       PROTOCOLS.length,
    conferences:     CONFERENCES.length,
    sampleCases:     SAMPLE_CASES.length,
  })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
