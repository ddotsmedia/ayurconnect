// Pre-answered, grounded Q&A — rendered as indexable QAPage routes for SEO.
// Answers are written conservatively from the same classical corpus the live
// RAG endpoint draws on, with inline citations. These are curated reference
// pages, not personal medical advice.

export type AnsweredQA = {
  slug: string
  question: string
  answer: string
  citations: Array<{ source: string; ref: string }>
}

export const ANSWERED_QA: AnsweredQA[] = [
  {
    slug: 'ayurvedic-definition-of-health',
    question: 'What is the Ayurvedic definition of health?',
    answer:
      'Ayurveda defines health (svastha) as a state of balance across body, digestion and mind. According to Charaka, one whose doshas, digestive fire (agni), and the actions of the tissues (dhatu) and wastes (mala) are in equilibrium, and whose self, senses and mind are full of contentment, is called healthy [Charaka Samhita, Sutrasthana 1.41]. Sushruta gives an almost identical definition, adding that the atma, indriya and manas must be in a state of pleasure [Sushruta Samhita, Sutrasthana 15.41]. Health is therefore not merely the absence of disease but a positive equilibrium of physiology and consciousness. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Charaka Samhita', ref: 'Sutrasthana 1.41' },
      { source: 'Sushruta Samhita', ref: 'Sutrasthana 15.41' },
    ],
  },
  {
    slug: 'what-are-the-three-doshas',
    question: 'What are the three doshas in Ayurveda?',
    answer:
      'The three doshas are Vata, Pitta and Kapha [Ashtanga Hridayam, Sutrasthana 1.6-7]. In their balanced state they sustain the body; when aggravated or diminished they cause disease [Charaka Samhita, Vimanasthana 8]. Vata (governed by air and space) controls all movement; Pitta (fire and water) governs transformation, digestion and metabolism; Kapha (water and earth) governs structure, lubrication and cohesion. Vagbhata notes the doshas reside especially in the lower, middle and upper parts of the body respectively. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Ashtanga Hridayam', ref: 'Sutrasthana 1.6-7' },
      { source: 'Charaka Samhita', ref: 'Vimanasthana 8' },
    ],
  },
  {
    slug: 'why-monsoon-karkidaka-good-for-treatment',
    question: 'Why is the monsoon (Karkidaka) considered ideal for Ayurvedic treatment?',
    answer:
      'The classical seasonal regimen (ritucharya) teaches that diet and conduct should suit each of the six seasons [Ashtanga Hridayam, Sutrasthana 3]. During Varsha (the monsoon) Vata is naturally aggravated and the digestive fire (agni) is weak, so light, warm, easily digestible food and Vata-pacifying therapies are advised. Because the cool, moist atmosphere opens the body\'s channels and the skin becomes receptive to medicated oils, this is the classical window for Panchakarma cleansing and Rasayana rejuvenation — the basis of Kerala\'s Karkidaka Chikitsa. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Ashtanga Hridayam', ref: 'Sutrasthana 3 (Ritucharya)' },
      { source: 'Charaka Samhita', ref: 'Chikitsasthana 1 (Rasayana)' },
    ],
  },
  {
    slug: 'what-is-rasayana',
    question: 'What is Rasayana and what does it do?',
    answer:
      'Rasayana is the rejuvenation branch of Ayurveda. Charaka states that Rasayana yields longevity, memory, intelligence, freedom from disease, youthfulness, excellent complexion and voice, and optimum strength of body and senses; it nourishes the rasa (nutrient essence) and all subsequent tissues [Charaka Samhita, Chikitsasthana 1, Rasayana Pada]. It works partly by preserving ojas, the essence of all seven dhatus and the seat of immunity and strength [Ashtanga Hridayam, Sutrasthana 11]. Rasayana is central to Karkidaka monsoon therapy. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Charaka Samhita', ref: 'Chikitsasthana 1 (Rasayana Pada)' },
      { source: 'Ashtanga Hridayam', ref: 'Sutrasthana 11 (Ojas)' },
    ],
  },
  {
    slug: 'what-are-the-five-panchakarma-therapies',
    question: 'What are the five Panchakarma therapies?',
    answer:
      'Panchakarma — literally "five actions" — are the classical purificatory (shodhana) therapies: Vamana (therapeutic emesis), Virechana (purgation), Basti (medicated enema), Nasya (nasal medication) and Raktamokshana (bloodletting) [Charaka Samhita, Sutrasthana/Kalpasthana]. Among these, Basti is regarded as the foremost treatment for Vata disorders. In Kerala practice these are supported by signature oil therapies such as Pizhichil and Navarakizhi using medicated oils like Dhanwantharam and Ksheerabala taila [Sahasrayogam, Taila Prakarana]. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Charaka Samhita', ref: 'Sutrasthana / Kalpasthana' },
      { source: 'Sahasrayogam', ref: 'Taila Prakarana' },
    ],
  },
  {
    slug: 'what-does-ayurveda-say-about-daily-routine',
    question: 'What does Ayurveda say about daily routine (dinacharya)?',
    answer:
      'The daily regimen (dinacharya) is a cornerstone of preventive Ayurveda. Vagbhata advises a healthy person to wake during Brahma muhurta (pre-dawn), attend to elimination, clean the teeth, apply collyrium, perform nasya and gandusha (oil pulling), do abhyanga (oil massage), exercise to half one\'s strength, and bathe [Ashtanga Hridayam, Sutrasthana 2]. Charaka adds that food should be taken in proper quantity according to one\'s digestive fire [Charaka Samhita, Sutrasthana 5]. Together with proper sleep and conduct, these uphold the three pillars of life [Charaka Samhita, Sutrasthana 1.15]. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Ashtanga Hridayam', ref: 'Sutrasthana 2 (Dinacharya)' },
      { source: 'Charaka Samhita', ref: 'Sutrasthana 1.15 & 5' },
    ],
  },
  {
    slug: 'what-is-ojas',
    question: 'What is Ojas in Ayurveda?',
    answer:
      'Ojas is described as the essence of all seven dhatus (tissues) and the seat of strength (bala) and immunity. Its depletion causes fear, weakness, anxiety and susceptibility to disease, while its preservation through proper diet, conduct and Rasayana confers vitality and resistance to illness [Ashtanga Hridayam, Sutrasthana 11]. This concept underlies the Ayurvedic understanding of immunity (vyadhikshamatva) and is a primary target of rejuvenation therapy. Based on classical texts; consult a doctor for personal advice.',
    citations: [{ source: 'Ashtanga Hridayam', ref: 'Sutrasthana 11' }],
  },
  {
    slug: 'what-is-kshara-sutra-used-for',
    question: 'What is Kshara Sutra used for?',
    answer:
      'Kshara Sutra is a classical para-surgical technique from the Sushruta tradition: a medicated thread coated in caustic alkali (kshara) is used to treat fistula-in-ano (bhagandara) and piles (arsha). The thread gradually cuts through and simultaneously heals the tract [Sushruta Samhita, Chikitsasthana, Kshara Sutra]. Sushruta, regarded as the father of surgery, also details surgical instruments and procedures throughout the Sutrasthana [Sushruta Samhita, Sutrasthana 1]. Kshara Sutra remains in clinical use today for anorectal conditions. Based on classical texts; consult a doctor for personal advice.',
    citations: [
      { source: 'Sushruta Samhita', ref: 'Chikitsasthana (Kshara Sutra)' },
      { source: 'Sushruta Samhita', ref: 'Sutrasthana 1' },
    ],
  },
]
