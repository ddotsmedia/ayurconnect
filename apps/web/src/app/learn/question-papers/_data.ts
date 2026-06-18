import type { BamsYear } from '../_subjects'

export type Paper = {
  slug: string
  title: string
  subjectSlug: string
  year: BamsYear
  university: string
  examYear: number
  examMonth?: string
  paperType: 'regular' | 'supplementary' | 'model'
  isSolved: boolean
  questions: Array<{ q: string; marks: number; solution?: string }>
}

export const PAPERS: Paper[] = [
  {
    slug: 'padartha-vigyana-kuhs-2024',
    title: 'Padartha Vigyana — KUHS 2024 (1st Year)',
    subjectSlug: 'padartha-vigyana',
    year: '1st_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2024,
    examMonth: 'April',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Define dravya. Enumerate the nava karana dravyas and explain any one in detail.', marks: 10, solution: 'Dravya is the samavayi karana (inherent cause) of guna and karma. Charaka enumerates 9 nava karana dravyas: 5 pancha mahabhuta (akasha, vayu, tejas, jala, prithvi), atma, manas, kala, dik. \n\nDetailed example — Prithvi mahabhuta: Predominant in gandha (smell). Heavy, stable, dense qualities. Functions: structural support, weight, stability of dhatus. Aggravation causes heaviness, obesity, lethargy.' },
      { q: 'Describe the 20 Gurvadi gunas with their doshic effects.', marks: 10, solution: 'The 20 gurvadi gunas are 10 binary pairs: guru-laghu, sheeta-ushna, snigdha-rooksha, mridu-khara, manda-tikshna, sthira-sara, slakshna-pichchhila, sukshma-sthula, sandra-drava, vishada-pichchhila. \n\nKey applications: snigdha pacifies vata; sheeta pacifies pitta; rooksha-laghu pacify kapha. The doctor selects dravya based on opposite gunas to patient vikriti.' },
      { q: 'Write short notes on (any 4): a) Samanya-Vishesha siddhanta b) Paradi guna c) Karana karya bhava d) Pratyaksha pramana e) Triavarjaneeya bhava', marks: 20, solution: 'a) Samanya-Vishesha: similar dravyas increase samana dhatu/dosha; opposite decrease them. Treatment principle.\nb) Paradi (10 pharmaceutical qualities): para, apara, yukti, sankhya, samyoga, vibhaga, prithakta, parimana, sanskara, abhyasa.\nc) Karana = cause, karya = effect. Five types of karana: samavayi, asamavayi, nimitta, samanya, vishesha.\nd) Pratyaksha = direct perception via 5 jnanendriya. First of the 4 pramanas (proofs).\ne) Triavarjaneeya bhava: kala-buddhi-arthendriyartha — the 3 root causes of disease.' },
      { q: 'Long essay: Define guna. Classify and describe the 41 gunas with classical examples.', marks: 20, solution: 'Guna is the inherent quality of dravya — samavayi in its substrate. 41 gunas grouped into 5 categories: \n1. Sartha guna (5): shabda, sparsha, rupa, rasa, gandha. \n2. Gurvadi guna (20): see Q2. \n3. Paradi guna (10): pharmaceutical qualities. \n4. Vaisheshika guna (5): mental qualities. \n5. Adhyatmika guna (sattva-rajas-tamas).' },
    ],
  },
  {
    slug: 'rachana-sharira-kuhs-2024',
    title: 'Rachana Sharira — KUHS 2024 (1st Year)',
    subjectSlug: 'rachana-sharira',
    year: '1st_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2024,
    examMonth: 'April',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Define asthi. Enumerate the 5 types of asthi with examples and Sushruta\'s total count.', marks: 10, solution: 'Asthi is the supporting/structural tissue. 5 types: 1. Kapala (flat — skull, scapula) 2. Ruchaka (long with marrow — femur) 3. Taruna (cartilaginous — nasal, ear) 4. Valaya (curved — ribs, vertebrae) 5. Nalaka (tubular hollow). Sushruta: 300 asthi; modern: 206. Difference due to inclusion of teeth, nails, cartilage, developmental stages.' },
      { q: 'Describe the marma. Classify by structure and clinical significance.', marks: 10, solution: 'Marma = vital points where mamsa, sira, snayu, asthi, sandhi meet. 107 marmas. Classified by structural composition (mamsa-sira-snayu-asthi-sandhi) and by effect of injury (sadya pranahara, kalantara pranahara, vishalyaghna, vaikalyakara, rujakara).' },
      { q: 'Short notes on (any 4): a) Sandhi types b) Kosthanga c) Kala (7 types) d) Pratyanga e) Garbhini sharira', marks: 20, solution: 'a) 210 sandhis, classified into chala/sthira; sub-classified into 8 types: kora, udukhala, samudga etc.\nb) 15 kosthanga (visceral organs).\nc) Kala: 7 layers separating dhatus.\nd) Pratyanga: 56 subsidiary parts.\ne) Garbhini sharira: anatomical changes during pregnancy.' },
      { q: 'Long essay: Hridaya — anatomy, location, dimensions per Sushruta + modern correlation.', marks: 20, solution: 'Sushruta describes hridaya as 8-petalled lotus form. Located between two breasts, root of all srotas. Acts as adhara of consciousness, ojas, manas. Modern correlation: heart with 4 chambers + great vessels. Sushruta\'s description includes coronary vasculature concept (10 dhamani originating from hridaya).' },
    ],
  },
  {
    slug: 'dravyaguna-kuhs-2024',
    title: 'Dravyaguna Vigyana — KUHS 2024 (2nd Year)',
    subjectSlug: 'dravyaguna-vigyana',
    year: '2nd_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2024,
    examMonth: 'October',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Define rasa panchaka. Explain each component with clinical examples.', marks: 10, solution: 'Rasa Panchaka = 5 attributes of every dravya: Rasa (taste), Guna (quality), Veerya (potency), Vipaka (post-digestive effect), Prabhava (specific action). \n\nExample: shatavari — rasa: madhura-tikta, guna: snigdha-guru-sheeta, veerya: sheeta, vipaka: madhura, prabhava: stanyajanana. This 5-fold reading determines clinical use.' },
      { q: 'Enumerate Charaka\'s 50 dashemani. Describe jivaniya and rasayana dashemani in detail with herbs.', marks: 10, solution: 'See Charaka Sutra Sthana 4 for full 50. \n\nJivaniya: jivanti, kakoli, ksheera-kakoli, mudgaparni, mashaparni, meda, mahameda, ridhi, vridhi, jivaka. Used in: kshaya (wasting), recovery from chronic illness.\n\nRasayana: amalaki, haritaki, vibhitaki, abhaya, dhatri, brahmi, mandukaparni, ashwagandha, bala, shilajatu. Used in: jara nivaraka (anti-ageing), immunity, post-treatment recovery.' },
      { q: 'Short notes (any 4): a) Asthavidha veerya b) Prabhava with examples c) Vipaka d) Karmuka rasa e) Anupana siddhanta', marks: 20 },
      { q: 'Discuss the pharmacognosy + classical identification of haridra (Curcuma longa).', marks: 20 },
    ],
  },
  {
    slug: 'roga-nidana-kuhs-2023',
    title: 'Roga Nidana — KUHS 2023 (2nd Year)',
    subjectSlug: 'roga-nidana',
    year: '2nd_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2023,
    examMonth: 'October',
    paperType: 'regular',
    isSolved: false,
    questions: [
      { q: 'Define nidana panchaka. Explain each element with examples.', marks: 10 },
      { q: 'Write the samprapti of amavata in detail. Include modern correlation.', marks: 10 },
      { q: 'Short notes (any 4): a) Pratyatma lakshana b) Upashaya c) Sannipataja jvara d) Pragnaparadha e) Visruta samprapti', marks: 20 },
      { q: 'Long essay: Discuss prameha purvarupa, rupa, and samprapti.', marks: 20 },
    ],
  },
  {
    slug: 'charaka-samhita-kuhs-2024',
    title: 'Charaka Samhita — KUHS 2024 (3rd Year)',
    subjectSlug: 'charaka-samhita',
    year: '3rd_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2024,
    examMonth: 'April',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Write the swastha lakshana sloka from Sutra Sthana 1 with detailed commentary.', marks: 10, solution: 'Sloka: Sama-doshah sama-agnish-cha sama-dhatu-mala-kriyaha, prasanna-atma-indriya-manah, swastha iti abhidheeyate. \n\nMeaning: One whose doshas, agni, dhatu, mala are balanced AND whose atma, indriya, manas are pleasant — that person is called swastha. \n\nCommentary: Definition is biological + psychological + spiritual. A person with all biological parameters normal but mental disturbance is NOT swastha.' },
      { q: 'Explain the trayopastambha with classical references.', marks: 10, solution: 'Trayopastambha = 3 pillars of health: aahara (food), nidra (sleep), brahmacharya (regulated reproductive function). Annam vai aushadham — food is medicine. Nidra ayuh-sthithi-hetu — sleep sustains life. Brahmacharya preserves ojas.' },
      { q: 'Short notes (any 4): a) Chikitsa chatushpada b) Triavarjaneeya bhava c) 4 types of ayus d) Pragnaparadha e) Bhishak-chatushpada', marks: 20, solution: 'a) Chikitsa Chatushpada: bhishak (doctor), aushadha (medicine), upastha (attendant), rogi (patient). All four needed for healing.\nb) Triavarjaneeya: kala (time misalignment), buddhi (intellectual error), arthendriyartha (sensory misuse) — 3 root causes of disease.\nc) 4 types of ayus: hita, ahita, sukha, dukha.\nd) Pragnaparadha: failure of buddhi — knowingly doing wrong. Most important cause of disease per Charaka.\ne) See chikitsa chatushpada above.' },
      { q: 'Discuss Deergha Jeeviteeya Adhyaya as a foundational chapter for clinical practice.', marks: 20 },
    ],
  },
  {
    slug: 'kayachikitsa-kuhs-2024',
    title: 'Kayachikitsa — KUHS 2024 (Final Year)',
    subjectSlug: 'kayachikitsa',
    year: 'final_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2024,
    examMonth: 'October',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Describe the management of madhumeha (type 2 diabetes) in detail with classical + modern approach.', marks: 15, solution: 'Madhumeha is vataja prameha — late-stage with wasting. Treatment 6-step: 1) Nidana parivarjana, 2) Langhana (if obese), 3) Deepana-pachana, 4) Vyadhi-vipareeta shamana with herbs like vijayasara, methika, gymnema, 5) Shodhana when appropriate, 6) Rasayana. Modern integration: metformin as standard care + Ayurveda adjunct.' },
      { q: 'Write the samprapti and chikitsa of amavata.', marks: 15, solution: 'Samprapti: manda agni → ama → vyana vayu carries to sandhi → ama-vata combination → shoola-shotha-stabdhata. Chikitsa: 1) Langhana, 2) Deepana-pachana, 3) Vata-pacifying snehapana with rasna saptaka kashaya + erandapaka, 4) Targeted basti, 5) Joint-specific external therapies.' },
      { q: 'Short notes (any 4): a) Sthaulya chikitsa b) Pandu types c) Jwara chikitsa principles d) Hridroga vargeekarana e) Vatavyadhi 80 types', marks: 20 },
      { q: 'Long essay: Discuss the role of Panchakarma in chronic disease management.', marks: 10 },
    ],
  },
  {
    slug: 'panchakarma-kuhs-2023',
    title: 'Panchakarma — KUHS 2023 (Final Year)',
    subjectSlug: 'panchakarma',
    year: 'final_year',
    university: 'Kerala University of Health Sciences',
    examYear: 2023,
    examMonth: 'October',
    paperType: 'regular',
    isSolved: false,
    questions: [
      { q: 'Describe the complete procedure of vamana karma with indications, contraindications, samyak vamana signs.', marks: 15 },
      { q: 'Explain niruha basti. Compare with anuvasana basti. Outline karma basti protocol.', marks: 15 },
      { q: 'Short notes (any 4): a) Snehapana ascending dose b) Sansarjana karma c) Atiyoga management d) Pizhichil indications e) Shirodhara', marks: 20 },
      { q: 'Long essay: Discuss raktamokshana with classical methods + modern integration.', marks: 10 },
    ],
  },
  {
    slug: 'shalya-tantra-rguhs-2024',
    title: 'Shalya Tantra — RGUHS 2024 (Final Year)',
    subjectSlug: 'shalya-tantra',
    year: 'final_year',
    university: 'Rajiv Gandhi University of Health Sciences',
    examYear: 2024,
    examMonth: 'April',
    paperType: 'regular',
    isSolved: true,
    questions: [
      { q: 'Enumerate Sushruta\'s 101 yantras + 20 shastras with categories. Detail any one yantra category.', marks: 15, solution: '101 yantras in 6 categories: swastika (24), sandansha (2), tala (2), nadi (20), shalaka (28), upayantra (25). 20 shastras: mandalagra, karapatra, vriddhipatra, nakhashastra, etc. \n\nDetail — Nadi yantra: tubular/hollow instruments for examining body cavities. Modern equivalent: speculum, proctoscope, catheter.' },
      { q: 'Describe the modern relevance of Sushruta\'s sandhana karma (12 fracture reduction techniques).', marks: 15, solution: 'Sushruta\'s 12 sandhana karmas: chunna, pichchhita, asthi-cheda, sandhicheda etc. Modern relevance: traditional bone setters still use these techniques. Some Kerala\'s vaidyas continue this; modern orthopaedics has overtaken in most areas but rural India still uses sandhana traditionally.' },
      { q: 'Short notes (any 4): a) Vrana shotha b) Bhagandara c) Arsha (haemorrhoid) classification d) Ksharasutra preparation e) Pre-op asepsis Sushruta methods', marks: 20 },
      { q: 'Long essay: Sushruta\'s rhinoplasty technique + impact on modern plastic surgery.', marks: 10 },
    ],
  },
  {
    slug: 'prasuti-tantra-muhs-2024',
    title: 'Prasuti Tantra — MUHS 2024 (3rd Year)',
    subjectSlug: 'prasuti-tantra',
    year: '3rd_year',
    university: 'Maharashtra University of Health Sciences',
    examYear: 2024,
    examMonth: 'May',
    paperType: 'regular',
    isSolved: false,
    questions: [
      { q: 'Detail garbhini paricharya month-by-month from 1st to 9th masa.', marks: 15 },
      { q: 'Describe sutika paricharya (post-partum care) — 45-day protocol.', marks: 15 },
      { q: 'Short notes (any 4): a) Yoni vyapad 20 types b) Asrigdara c) Prasava vihari d) Stanya-vardhana e) Garbha-srava management', marks: 20 },
      { q: 'Long essay: Discuss artava vyapad and modern correlation to menstrual disorders.', marks: 10 },
    ],
  },
  {
    slug: 'kriya-sharira-model-paper',
    title: 'Kriya Sharira — Model Paper (1st Year)',
    subjectSlug: 'kriya-sharira',
    year: '1st_year',
    university: 'Model / Practice Paper',
    examYear: 2026,
    paperType: 'model',
    isSolved: true,
    questions: [
      { q: 'Enumerate the 13 agnis with location and function.', marks: 10, solution: '13 agnis: 1 jatharagni (grahani — digestion of food), 5 bhutagnis (yakrit — process each mahabhuta), 7 dhatvagnis (each dhatu — sthayi conversion). Jatharagni controls all others.' },
      { q: 'Differentiate sama, vishama, tikshna, manda agni with 3 symptoms each.', marks: 10, solution: 'Sama: balanced, stable appetite, regular bowel. Vishama (vata): irregular appetite, bloating, alternating bowel. Tikshna (pitta): early hunger, hyperacidity, urgency. Manda (kapha): slow digestion, heaviness, ama formation.' },
      { q: 'Short notes (any 4): a) Ojas — para + apara b) Manas guna c) Sapta dhatu kram d) Rasa dhatu function e) Pranavaha srotas', marks: 20, solution: 'a) Para ojas: 8 drops in hridaya, supports prana. Apara ojas: 1/2 anjali, throughout body. \nb) Sattva-rajas-tamas + rajas-tamas as mala. \nc) Rasa → rakta → mamsa → meda → asthi → majja → shukra (5 days each cycle). \nd) Rasa dhatu: nourishment, body fluid, mental balance. \ne) Pranavaha srotas: mula at hridaya + mahasrotas. Function: respiration.' },
      { q: 'Long essay: Discuss the formation and function of dhatus per Charaka.', marks: 20 },
    ],
  },
]

export const PAPER_SLUGS = PAPERS.map((p) => p.slug)
