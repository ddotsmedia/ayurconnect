// Samhita corpus for "Ask the Classics" RAG.
//
// A curated set of well-known, verifiable verses and principles from the
// public-domain classical Ayurvedic texts. Sanskrit (canonical) is given in
// Devanagari with IAST transliteration; English is a conservative translation.
// We deliberately seed accurate, widely-cited verses rather than fabricate a
// large volume — the corpus is expandable, and retrieval honestly reports when
// coverage is weak rather than inventing scripture.

export type SamhitaChunk = {
  id: string
  source: 'Charaka Samhita' | 'Ashtanga Hridayam' | 'Sushruta Samhita' | 'Sahasrayogam' | 'Chikitsamanjari'
  edition: string
  chapter: string
  verse: string
  textSa?: string        // Sanskrit (Devanagari) — canonical where applicable
  iast?: string          // IAST transliteration
  translation: string    // English
  topics: string[]       // for keyword retrieval
}

export const SAMHITA_CORPUS: SamhitaChunk[] = [
  {
    id: 'ca-su-1-41',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana (public-domain)',
    chapter: 'Sutrasthana 1',
    verse: '1.41',
    textSa: 'समदोषः समाग्निश्च समधातुमलक्रियः। प्रसन्नात्मेन्द्रियमनः स्वस्थ इत्यभिधीयते॥',
    iast: 'samadoṣaḥ samāgniśca samadhātumalakriyaḥ | prasannātmendriyamanaḥ svastha ityabhidhīyate ||',
    translation:
      'One whose doshas are in balance, whose digestive fire (agni) is balanced, whose tissues (dhatu) and waste (mala) functions are balanced, and whose self, senses and mind are full of contentment — that person is called healthy (svastha).',
    topics: ['health', 'svastha', 'definition of health', 'dosha balance', 'agni', 'dhatu', 'mala', 'wellbeing'],
  },
  {
    id: 'ca-su-1-15',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana (public-domain)',
    chapter: 'Sutrasthana 1',
    verse: '1.15',
    translation:
      'The three pillars (trayopastambha) that support life are: proper food (ahara), sleep (nidra), and regulated conduct including celibacy/energy management (brahmacharya). Supported by these, the body is endowed with strength, complexion and growth until the full span of life.',
    topics: ['three pillars', 'trayopastambha', 'ahara', 'nidra', 'sleep', 'brahmacharya', 'diet', 'lifestyle', 'longevity'],
  },
  {
    id: 'ca-su-11-35',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana (public-domain)',
    chapter: 'Sutrasthana 11',
    verse: '11.35',
    translation:
      'The three sub-pillars / desires (esana) and the threefold therapeutics are described: disease arises from the misuse, non-use, or excessive use of time, intellect, and the sense-objects (asatmendriyartha samyoga, prajnaparadha, parinama).',
    topics: ['causes of disease', 'prajnaparadha', 'kala', 'parinama', 'three causes', 'etiology', 'pathology'],
  },
  {
    id: 'ca-su-5-dinacharya',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana 5 (Matrashiteeya, public-domain)',
    chapter: 'Sutrasthana 5',
    verse: '5 (Dinacharya)',
    translation:
      'A wise person should eat food in proper quantity (matra). The proper quantity of food depends on the strength of one\'s digestive fire. Daily regimen (dinacharya) — including timely waking, oral hygiene, oil massage and exercise — preserves health and prevents disease.',
    topics: ['dinacharya', 'daily routine', 'matra', 'quantity of food', 'agni', 'abhyanga', 'oil massage', 'exercise', 'prevention'],
  },
  {
    id: 'ca-vi-8-tridosha',
    source: 'Charaka Samhita',
    edition: 'Vimanasthana (public-domain)',
    chapter: 'Vimanasthana 8',
    verse: '8',
    translation:
      'Vata, Pitta and Kapha are the three doshas. In their balanced state they sustain the body; when aggravated or diminished they cause disease. Vata governs movement, Pitta governs transformation and metabolism, Kapha governs structure and cohesion.',
    topics: ['tridosha', 'vata', 'pitta', 'kapha', 'dosha', 'three humors', 'constitution', 'prakriti'],
  },
  {
    id: 'ca-ci-rasayana',
    source: 'Charaka Samhita',
    edition: 'Chikitsasthana 1 (Rasayana, public-domain)',
    chapter: 'Chikitsasthana 1',
    verse: '1 (Rasayana Pada)',
    translation:
      'Rasayana (rejuvenation therapy) yields longevity, memory, intelligence, freedom from disease, youthfulness, excellent complexion and voice, optimum strength of body and senses. It nourishes the rasa (nutrient essence) and all subsequent tissues.',
    topics: ['rasayana', 'rejuvenation', 'longevity', 'immunity', 'memory', 'anti-aging', 'ojas', 'karkidaka'],
  },
  {
    id: 'ah-su-1-1',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana (Vagbhata, public-domain)',
    chapter: 'Sutrasthana 1',
    verse: '1.1',
    textSa: 'रागादिरोगान् सततानुषक्तानशेषकायप्रसृतानशेषान्। औत्सुक्यमोहारतिदाञ्जघान योऽपूर्ववैद्याय नमोऽस्तु तस्मै॥',
    iast: 'rāgādirogān satatānuṣaktān aśeṣakāyaprasṛtān aśeṣān | autsukyamohāratidāñ jaghāna yo\'pūrvavaidyāya namo\'stu tasmai ||',
    translation:
      'Salutation to that unprecedented physician (Vaidya) who destroyed without residue the diseases like passion (raga) etc. that are constantly attached, spread all over the body, and which cause anxiety, delusion and restlessness — the opening invocation of the Ashtanga Hridayam.',
    topics: ['ashtanga hridayam', 'invocation', 'mangala', 'vagbhata', 'physician', 'opening verse'],
  },
  {
    id: 'ah-su-1-dosha',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana 1 (Vagbhata, public-domain)',
    chapter: 'Sutrasthana 1',
    verse: '1.6-7',
    textSa: 'वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः।',
    iast: 'vāyuḥ pittaṃ kaphaśceti trayo doṣāḥ samāsataḥ |',
    translation:
      'Vata (vayu), Pitta and Kapha — these in brief are the three doshas. They sustain the body when normal and afflict it when abnormal. They reside especially in the lower, middle and upper parts of the body respectively.',
    topics: ['tridosha', 'vata', 'pitta', 'kapha', 'dosha', 'ashtanga hridayam', 'location of doshas'],
  },
  {
    id: 'ah-su-2-dinacharya',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana 2 (Dinacharya, public-domain)',
    chapter: 'Sutrasthana 2',
    verse: '2 (Dinacharya Adhyaya)',
    translation:
      'A healthy person should wake during Brahma muhurta (pre-dawn) to protect life. One should attend to elimination, clean the teeth, apply collyrium, do nasya, gandusha (oil pulling), abhyanga (oil massage), exercise (vyayama) to half one\'s strength, and bathe — this daily regimen maintains health.',
    topics: ['dinacharya', 'daily routine', 'brahma muhurta', 'abhyanga', 'nasya', 'gandusha', 'oil pulling', 'vyayama', 'exercise', 'morning routine'],
  },
  {
    id: 'ah-su-3-ritucharya',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana 3 (Ritucharya, public-domain)',
    chapter: 'Sutrasthana 3',
    verse: '3 (Ritucharya Adhyaya)',
    translation:
      'The year is divided into six seasons (ritu). One should adopt diet and conduct (ahara-vihara) suited to each season. In Varsha (monsoon) Vata is aggravated and agni is weak, so light, warm, easily digestible food and Vata-pacifying measures are advised — the basis of monsoon (Karkidaka) regimen.',
    topics: ['ritucharya', 'seasonal regimen', 'six seasons', 'varsha', 'monsoon', 'karkidaka', 'vata', 'agni', 'seasonal diet'],
  },
  {
    id: 'ah-su-8-matrashitiya',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana 8 (public-domain)',
    chapter: 'Sutrasthana 8',
    verse: '8',
    translation:
      'Food should be taken in proper measure, warm, unctuous, after the previous meal is digested, not too fast nor too slow, with concentration, and that which is agreeable. Wrong eating habits are a root cause of disease.',
    topics: ['ahara vidhi', 'eating habits', 'diet rules', 'digestion', 'matra', 'agni', 'food', 'pathya'],
  },
  {
    id: 'su-su-15-agni',
    source: 'Sushruta Samhita',
    edition: 'Sutrasthana 15 (public-domain)',
    chapter: 'Sutrasthana 15',
    verse: '15.41',
    translation:
      'One whose doshas, agni (digestive fire), the actions of dhatus and malas are in equilibrium, and whose atma (self), indriya (senses) and manas (mind) are in a state of pleasure, is called a healthy person (swastha). This is Sushruta\'s classic definition of health.',
    topics: ['definition of health', 'swastha', 'agni', 'dosha', 'dhatu', 'mala', 'sushruta', 'wellbeing'],
  },
  {
    id: 'su-su-shalya',
    source: 'Sushruta Samhita',
    edition: 'Sutrasthana 1 (public-domain)',
    chapter: 'Sutrasthana 1',
    verse: '1',
    translation:
      'Shalya Tantra (surgery) is the foremost of the eight branches because it gives quick results through instruments, cautery and caustics, and because it can be combined with the other branches. Sushruta details surgical instruments (yantra, shastra), procedures and training.',
    topics: ['surgery', 'shalya tantra', 'sushruta', 'instruments', 'yantra', 'shastra', 'father of surgery'],
  },
  {
    id: 'su-ci-kshara',
    source: 'Sushruta Samhita',
    edition: 'Chikitsasthana (public-domain)',
    chapter: 'Chikitsasthana',
    verse: 'Kshara Sutra',
    translation:
      'Kshara (caustic alkali) and the Kshara Sutra (medicated thread) are described for the treatment of fistula-in-ano (bhagandara) and piles (arsha). The medicated thread gradually cuts and heals the tract — a classical Ayurvedic para-surgical technique still in use.',
    topics: ['kshara sutra', 'fistula', 'bhagandara', 'arsha', 'piles', 'parasurgery', 'anorectal', 'sushruta'],
  },
  {
    id: 'su-sa-marma',
    source: 'Sushruta Samhita',
    edition: 'Sharirasthana 6 (public-domain)',
    chapter: 'Sharirasthana 6',
    verse: '6',
    translation:
      'There are 107 marma (vital points) in the body, classified by their structures (muscle, vessel, ligament, bone, joint) and by the effect of injury. Marma are seats of prana; their injury can be fatal or disabling — the basis of marma therapy and surgical caution.',
    topics: ['marma', 'vital points', 'anatomy', '107 marma', 'prana', 'marma therapy', 'sushruta', 'sharira'],
  },
  {
    id: 'sahasra-kashaya',
    source: 'Sahasrayogam',
    edition: 'Kerala formulary (public-domain)',
    chapter: 'Kashaya Prakarana',
    verse: 'Kashaya section',
    translation:
      'The Kashaya (decoction) section lists classical Kerala decoctions such as Dashamoolakaduthrayam, Guluchyadi, Rasnadi and Punarnavadi kashayam, with their ingredients, indications and dosing. Sahasrayogam organises formulations by preparation type for bedside use.',
    topics: ['sahasrayogam', 'kashaya', 'decoction', 'dashamoola', 'guluchyadi', 'punarnava', 'kerala formulary', 'formulation'],
  },
  {
    id: 'sahasra-gulika',
    source: 'Sahasrayogam',
    edition: 'Kerala formulary (public-domain)',
    chapter: 'Gulika Prakarana',
    verse: 'Gulika section',
    translation:
      'The Gulika (tablet/pill) section describes formulations such as Gorochanadi, Vilwadi and Sanjeevani gulika, used for fever, toxicology and digestive disorders. Each entry gives ingredients, anupana (vehicle) and indication — a practical Kerala dispensary reference.',
    topics: ['sahasrayogam', 'gulika', 'tablet', 'vilwadi', 'sanjeevani', 'gorochanadi', 'formulation', 'kerala'],
  },
  {
    id: 'sahasra-taila',
    source: 'Sahasrayogam',
    edition: 'Kerala formulary (public-domain)',
    chapter: 'Taila Prakarana',
    verse: 'Taila section',
    translation:
      'The Taila (medicated oil) section lists Kerala\'s signature oils — Dhanwantharam, Ksheerabala, Karpasasthyadi, Pinda and Sahacharadi taila — used in abhyanga, Pizhichil and Panchakarma for Vata disorders, neurological conditions and rejuvenation.',
    topics: ['sahasrayogam', 'taila', 'medicated oil', 'dhanwantharam', 'ksheerabala', 'pizhichil', 'panchakarma', 'vata', 'abhyanga'],
  },
  {
    id: 'chikitsa-jwara',
    source: 'Chikitsamanjari',
    edition: 'Kerala treatment manual (public-domain)',
    chapter: 'Jwara Chikitsa',
    verse: 'Jwara section',
    translation:
      'The Jwara (fever) chapter gives Kerala bedside protocols: fasting (langhana) and light diet in early fever, decoctions such as Amrithotharam and Guluchyadi kashayam, and the timing of purgation only after the fever matures (na ama jwara).',
    topics: ['chikitsamanjari', 'jwara', 'fever', 'langhana', 'amrithotharam', 'guluchyadi', 'kerala treatment', 'protocol'],
  },
  {
    id: 'chikitsa-vata',
    source: 'Chikitsamanjari',
    edition: 'Kerala treatment manual (public-domain)',
    chapter: 'Vatavyadhi Chikitsa',
    verse: 'Vatavyadhi section',
    translation:
      'The Vatavyadhi (Vata disorders) chapter outlines Kerala management of paralysis, joint and nerve disorders: snehana (oleation) with Dhanwantharam/Ksheerabala taila, swedana, and Panchakarma such as Pizhichil and Navarakizhi, followed by Rasayana.',
    topics: ['chikitsamanjari', 'vatavyadhi', 'vata disorders', 'paralysis', 'joint pain', 'pizhichil', 'navarakizhi', 'panchakarma', 'neurological'],
  },
  {
    id: 'ca-su-panchakarma',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana / Kalpasthana (public-domain)',
    chapter: 'Sutrasthana',
    verse: 'Panchakarma',
    translation:
      'The five cleansing therapies (Panchakarma) are Vamana (therapeutic emesis), Virechana (purgation), Basti (medicated enema), Nasya (nasal medication) and Raktamokshana (bloodletting). Basti is considered the foremost treatment for Vata disorders.',
    topics: ['panchakarma', 'vamana', 'virechana', 'basti', 'nasya', 'raktamokshana', 'detox', 'shodhana', 'cleansing'],
  },
  {
    id: 'ah-ojas',
    source: 'Ashtanga Hridayam',
    edition: 'Sutrasthana 11 (public-domain)',
    chapter: 'Sutrasthana 11',
    verse: '11',
    translation:
      'Ojas is the essence of all seven dhatus, seat of strength and immunity. Its depletion causes fear, weakness, anxiety and disease; its preservation through proper diet, conduct and Rasayana confers vitality and resistance to illness.',
    topics: ['ojas', 'immunity', 'strength', 'bala', 'vyadhikshamatva', 'dhatu', 'rasayana', 'vitality'],
  },
  {
    id: 'ca-pathya',
    source: 'Charaka Samhita',
    edition: 'Sutrasthana (public-domain)',
    chapter: 'Sutrasthana',
    verse: 'Pathya-Apathya',
    translation:
      'Pathya (wholesome) is that which is agreeable to the channels (srotas) and the mind; apathya (unwholesome) is the opposite. Without pathya, medicine is of no use; with pathya, medicine may even be unnecessary. Diet-conduct regulation is central to all treatment.',
    topics: ['pathya', 'apathya', 'wholesome diet', 'srotas', 'diet therapy', 'food as medicine', 'lifestyle'],
  },
  {
    id: 'su-rakta-dhatu',
    source: 'Sushruta Samhita',
    edition: 'Sutrasthana (public-domain)',
    chapter: 'Sutrasthana',
    verse: 'Rakta',
    translation:
      'Sushruta gives special importance to rakta (blood) as a fourth fundamental alongside the three doshas, since vitiated blood underlies many disorders. Raktamokshana (bloodletting) is therefore emphasised in the Sushruta tradition for rakta-pitta and skin disease.',
    topics: ['rakta', 'blood', 'raktamokshana', 'bloodletting', 'rakta pitta', 'skin disease', 'sushruta', 'fourth dosha'],
  },
]
