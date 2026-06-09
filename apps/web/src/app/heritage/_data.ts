// Heritage & Culture content — Kerala Ayurveda living tradition.
// Sourced from public-domain scholarship. Malayalam names are canonical and
// stored as Unicode; English/Sanskrit transliterations are secondary aids.

export type AshtavaidyaFamily = {
  slug: string
  nameMl: string
  nameEn: string
  specialty: string
  institutions: string[]
  significance: string
}

// The eight (ashta) traditional Namboodiri physician families of Kerala —
// the Ashtavaidyas, hereditary custodians of Ashtanga Ayurveda, especially
// the Ashtanga Hridayam tradition of Vagbhata.
export const ASHTAVAIDYAS: AshtavaidyaFamily[] = [
  {
    slug: 'pulamanthole-mooss',
    nameMl: 'പുലാമന്തോൾ മൂസ്',
    nameEn: 'Pulamanthole Mooss',
    specialty: 'Kayachikitsa (general / internal medicine) and toxicology (Visha Chikitsa)',
    institutions: ['Pulamanthole Mana, Palakkad', 'Traditional gurukula training in Ashtanga Hridayam'],
    significance:
      'Among the most renowned surviving Ashtavaidya lineages, celebrated for mastery of pulse diagnosis (Nadi Pariksha) and classical decoction medicine. The family preserved palm-leaf manuscripts of Vagbhata and trained generations of vaidyas.',
  },
  {
    slug: 'vaidyamadham',
    nameMl: 'വൈദ്യമഠം',
    nameEn: 'Vaidyamadham',
    specialty: 'Balachikitsa (paediatrics), Kayachikitsa and Visha Chikitsa (toxicology)',
    institutions: ['Vaidyamadham Mana, Mezhathur, Thrissur', 'Vaidyamadham Vaidyasala & Nursing Home'],
    significance:
      'One of the most active Ashtavaidya families today, continuing classical practice and authentic Panchakarma. The Vaidyamadham Namboothiri lineage is widely consulted for treatment-resistant chronic disease.',
  },
  {
    slug: 'thaikkattu-mooss',
    nameMl: 'തൈക്കാട്ട് മൂസ്',
    nameEn: 'Thaikkattu Mooss',
    specialty: 'Kayachikitsa (internal medicine) and Rasayana (rejuvenation)',
    institutions: ['Thaikkattu Mana, Thrissur district', 'Thaikkat Moos Vaidyasala'],
    significance:
      'A senior Ashtavaidya household known for classical formulation pharmacy and adherence to the Ashtanga Hridayam canon. Historically physicians to local royal houses.',
  },
  {
    slug: 'elayidath-thaikkattu-mooss',
    nameMl: 'ഇളയിടത്ത് തൈക്കാട്ട് മൂസ്',
    nameEn: 'Elayidath Thaikkattu Mooss',
    specialty: 'Kayachikitsa and Shalya (traditional surgery) traditions',
    institutions: ['Elayidath Thaikkattu Mana, Thrissur', 'Vaidyaratnam lineage institutions'],
    significance:
      'A branch lineage of the Thaikkattu family. The famed Vaidyaratnam P. S. Varier tradition and Vaidyaratnam Oushadhasala draw on this household; instrumental in modernising classical pharmacy while preserving Ashtavaidya method.',
  },
  {
    slug: 'chirattamon-mooss',
    nameMl: 'ചിറട്ടമൺ മൂസ്',
    nameEn: 'Chirattamon Mooss',
    specialty: 'Kayachikitsa and Netra Chikitsa (ophthalmology / Shalakya)',
    institutions: ['Chirattamon Mana, central Kerala'],
    significance:
      'An Ashtavaidya family preserving the eye-disease (Shalakya Tantra) traditions of Kerala Ayurveda alongside general internal medicine.',
  },
  {
    slug: 'kuttanchery-mooss',
    nameMl: 'കുട്ടഞ്ചേരി മൂസ്',
    nameEn: 'Kuttanchery Mooss',
    specialty: 'Kayachikitsa and Visha Chikitsa (toxicology / snake-bite treatment)',
    institutions: ['Kuttanchery Mana, Ottapalam region, Palakkad'],
    significance:
      'Historically prominent in Visha Chikitsa — the Kerala toxicology tradition for snake-bite and poison management — as well as classical internal medicine.',
  },
  {
    slug: 'ollur-mooss',
    nameMl: 'ഒള്ളൂർ മൂസ്',
    nameEn: 'Ollur Mooss',
    specialty: 'Kayachikitsa and classical formulation practice',
    institutions: ['Ollur Mana, Thrissur district'],
    significance:
      'An Ashtavaidya household of the Thrissur region, custodians of the Ashtanga Hridayam tradition and classical Kerala formulations.',
  },
  {
    slug: 'pazhangadu-mooss',
    nameMl: 'പഴങ്ങാടു മൂസ്',
    nameEn: 'Pazhangadu Mooss',
    specialty: 'Kayachikitsa and Rasayana (rejuvenation therapeutics)',
    institutions: ['Pazhangadu Mana, central Kerala'],
    significance:
      'Among the eight classical Ashtavaidya families, preserving hereditary knowledge of internal medicine and rejuvenation therapy within the Namboodiri vaidya tradition.',
  },
]

export type ClassicalText = {
  slug: string
  titleMl: string
  titleSa: string
  titleEn: string
  author: string
  era: string
  significance: string
  contributions: string[]
}

export const CLASSICAL_TEXTS: ClassicalText[] = [
  {
    slug: 'ashtanga-hridayam',
    titleMl: 'അഷ്ടാംഗഹൃദയം',
    titleSa: 'अष्टाङ्गहृदयम्',
    titleEn: 'Ashtanga Hridayam',
    author: 'Vagbhata (വാഗ്ഭടൻ)',
    era: 'c. 7th century CE',
    significance:
      'The single most important text for Kerala Ayurveda. The Ashtavaidya tradition is built around the Ashtanga Hridayam, and it remains the primary teaching text in Kerala. Its verses are recited and memorised in gurukula training to this day.',
    contributions: [
      'Synthesises the eight branches (Ashtanga) of Ayurveda into concise, memorisable verse',
      'The foundational reference for Kerala Panchakarma protocols',
      'Distilled from Charaka and Sushruta into a practical clinical manual',
    ],
  },
  {
    slug: 'charaka-samhita',
    titleMl: 'ചരകസംഹിത',
    titleSa: 'चरकसंहिता',
    titleEn: 'Charaka Samhita',
    author: 'Agnivesha, redacted by Charaka (ചരകൻ)',
    era: 'c. 2nd century BCE – 2nd century CE',
    significance:
      'The foundational treatise of Kayachikitsa (internal medicine) and the philosophical bedrock of Ayurveda. Defines health, disease, the tridosha theory, and the ethics of the physician.',
    contributions: [
      'Systematic exposition of internal medicine and the tridosha (Vata–Pitta–Kapha) framework',
      'The earliest detailed code of medical ethics and clinical reasoning',
      'Pharmacology of hundreds of medicinal substances',
    ],
  },
  {
    slug: 'sushruta-samhita',
    titleMl: 'സുശ്രുതസംഹിത',
    titleSa: 'सुश्रुतसंहिता',
    titleEn: 'Sushruta Samhita',
    author: 'Sushruta (സുശ്രുതൻ)',
    era: 'c. 6th century BCE (compiled later)',
    significance:
      'The foundational treatise of Shalya Tantra (surgery). Describes surgical instruments, procedures including rhinoplasty, and the training of surgeons — earning Sushruta the title "father of surgery".',
    contributions: [
      'Earliest systematic surgical text — instruments, sutures, cautery, plastic surgery',
      'Detailed anatomy via cadaveric study',
      'Classification of injuries, fractures, and surgical management',
    ],
  },
  {
    slug: 'sahasrayogam',
    titleMl: 'സഹസ്രയോഗം',
    titleSa: 'सहस्रयोगम्',
    titleEn: 'Sahasrayogam',
    author: 'Compiled by Kerala vaidyas (traditional)',
    era: 'Medieval Kerala compilation',
    significance:
      'The everyday formulary of Kerala Ayurveda — a "thousand formulations" handbook organised by dosage form (kashaya, gulika, ghrita, taila, etc.). Indispensable in Kerala practice and pharmacy.',
    contributions: [
      'Practical, Kerala-specific compendium of classical formulations',
      'Organised by preparation type for bedside reference',
      'Still the working formulary of most Kerala Ayurveda pharmacies',
    ],
  },
  {
    slug: 'chikitsamanjari',
    titleMl: 'ചികിത്സാമഞ്ജരി',
    titleSa: 'चिकित्सामञ्जरी',
    titleEn: 'Chikitsamanjari',
    author: 'Traditional Kerala authorship',
    era: 'Medieval Kerala (Malayalam vernacular tradition)',
    significance:
      'A Kerala treatment manual written to make classical therapeutics accessible to practitioners, disease by disease. A staple of Kerala clinical training alongside the Ashtanga Hridayam.',
    contributions: [
      'Disease-wise treatment protocols in an accessible format',
      'Bridges classical Sanskrit canon with Kerala bedside practice',
      'Widely used for clinical reference in Kerala gurukulas',
    ],
  },
]

export type TimelineEvent = { era: string; titleMl?: string; title: string; body: string }

export const HISTORY_TIMELINE: TimelineEvent[] = [
  {
    era: 'Mythic / Ancient',
    titleMl: 'ധന്വന്തരി',
    title: 'Dhanvantari — the divine origin',
    body: 'Ayurveda is traced in tradition to Dhanvantari, the physician of the gods who emerged from the churning of the cosmic ocean (Samudra Manthan). Dhanvantari is venerated as the patron deity of Ayurveda across Kerala temples.',
  },
  {
    era: 'Classical antiquity',
    title: 'The great Samhitas',
    body: 'The foundational treatises — Charaka Samhita (internal medicine) and Sushruta Samhita (surgery) — are compiled, codifying the tridosha theory and the eight branches (Ashtanga) of Ayurveda.',
  },
  {
    era: 'c. 7th century CE',
    titleMl: 'അഷ്ടാംഗഹൃദയം',
    title: 'Vagbhata and the Ashtanga Hridayam',
    body: 'Vagbhata distils the canon into the Ashtanga Hridayam, which becomes the defining text of Kerala Ayurveda — the basis of all later Kerala practice and pedagogy.',
  },
  {
    era: 'Medieval Kerala',
    title: 'The Ashtavaidya establishment',
    body: 'Eight Namboodiri Brahmin families — the Ashtavaidyas — emerge as hereditary custodians of Ayurveda, anchoring practice in the Ashtanga Hridayam and developing Kerala-specific Panchakarma and Kerala pharmacy (Sahasrayogam, Chikitsamanjari).',
  },
  {
    era: 'Colonial period',
    title: 'Revival under pressure',
    body: 'Despite colonial promotion of Western medicine, vaidyas like P. S. Varier founded the Arya Vaidya Sala, Kottakkal (1902) — modernising classical pharmacy, standardising formulations, and institutionalising Ayurveda education without abandoning tradition.',
  },
  {
    era: 'Modern era',
    title: 'Government classification & global recognition',
    body: 'Post-independence India established the AYUSH system, BAMS degree programmes, and the CCIM/NCISM regulatory framework. Kerala became the global reference point for authentic Ayurveda and Ayurvedic medical tourism.',
  },
]

export type Temple = {
  nameMl: string
  name: string
  location: string
  note: string
}

// Dhanvantari (deity of Ayurveda) temples of Kerala.
export const DHANVANTARI_TEMPLES: Temple[] = [
  {
    nameMl: 'തോട്ടുവ ധന്വന്തരി ക്ഷേത്രം',
    name: 'Thottuva Dhanwanthari Temple',
    location: 'Thottuva, Ernakulam district',
    note: 'One of the most famous Dhanvantari temples in Kerala, with a tall idol of the four-armed deity holding amrita, conch, leech and Sudarshana. A pilgrimage site for those seeking recovery from illness.',
  },
  {
    nameMl: 'നെല്ലുവായ് ധന്വന്തരി ക്ഷേത്രം',
    name: 'Nelluvai Dhanwanthari Temple',
    location: 'Nelluvai, Thrissur district',
    note: 'An ancient Dhanvantari shrine renowned for its Ekadasi festival and association with healing. A focal point for vaidya families of the Thrissur region.',
  },
  {
    nameMl: 'പ്രയിക്കര ധന്വന്തരി ക്ഷേത്രം',
    name: 'Prayikkara Dhanwanthari Temple',
    location: 'Prayikkara, Alappuzha district',
    note: 'A revered Dhanvantari temple where devotees offer prayers for health and freedom from chronic disease.',
  },
  {
    nameMl: 'മാരാരിക്കുളം ധന്വന്തരി ക്ഷേത്രം',
    name: 'Mararikulam Dhanwanthari Temple',
    location: 'Mararikulam, Alappuzha district',
    note: 'A coastal Dhanvantari shrine historically linked to local Ayurveda practitioners and healing traditions.',
  },
]
