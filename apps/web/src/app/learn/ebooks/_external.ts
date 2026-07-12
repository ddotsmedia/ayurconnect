// External Google Drive links to public-domain Ayurveda classical texts.
// AyurConnect only curates + organises the URLs — no PDFs hosted here.
// Every card opens in a new tab with rel='noopener noreferrer'.

export type ExternalBook = {
  title: string
  category: string     // Samhitas | Bhavaprakash | Nighantus | Rasashastra | Surgery | Modern Ayurveda | Other Languages | Yoga
  language: string     // Sanskrit | Hindi | English | Bengali | Telugu | Tamil | Kannada | Malayalam
  url: string
}

export const EXTERNAL_BOOKS: ExternalBook[] = [
  // ── SAMHITAS ────────────────────────────────────────────────
  { title: 'Charaka Samhita — Chikitsa & Siddhi Sthana (P.V. Sharma)',                category: 'Samhitas',        language: 'Hindi',    url: 'https://drive.google.com/open?id=1VJmdcFShpFqDOtCLxvzFl4HaxA2Kxjbp' },
  { title: 'Charaka Samhita — Sutra to Vimana Sthana (Hindi Commentary)',             category: 'Samhitas',        language: 'Hindi',    url: 'https://drive.google.com/open?id=1_tjjYuG92ayXVmK247yj-PxiDMs4nBne' },
  { title: 'Charaka Samhita Tika — Adya Khanda',                                       category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1xWv2ArOgv5fCBZ8gBhXvibpZ_GyKnetL' },
  { title: 'Charaka Samhita Tika — Dvitiya Khanda',                                    category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1jlz2pU1TkAyROobexuJz7tomujHmFbjt' },
  { title: 'Charaka Samhita Tika — Tritiya Khanda',                                    category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1hoWkBemJGQRU2DehQNj6zC3SXwGbQGYT' },
  { title: 'Sushruta Samhita — English Translation',                                   category: 'Samhitas',        language: 'English',  url: 'https://drive.google.com/open?id=1efHdFkSaLZhzWfHfMbBkdaLynZXE8xp7' },
  { title: 'Sushruta Samhita — Sutra Sthana with Bhanumati Commentary (Chakrapani)',   category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1J1Dlg59byEhtunjNDltHJgkQSVSM8nKe' },
  { title: 'Sushruta Samhita — Uttara Tantra',                                         category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1qsXq_vlzq1gYOnZ_qu5IIMLHiET5rqCq' },
  { title: 'Ashtanga Sangraha',                                                        category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1CE0TfqrCN5vACwNeqo7guY9tJl2_PczT' },
  { title: 'Ashtanga Hridaya',                                                         category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1sttLMApER8ZikmsjzSll9Myq3rMMKL-n' },
  { title: 'Ashtanga Hridaya — Sutra Sthana Handbook',                                 category: 'Samhitas',        language: 'English',  url: 'https://drive.google.com/open?id=1E6dyHnv_z9N_ocBlajH7b1xxfF3hZ22z' },
  { title: 'Kashyapa Samhita (Full)',                                                  category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1lI9yI9m23hNaEdN0zCvgfxHEYC9ck0fQ' },
  { title: 'Harita Samhita (Part 1)',                                                  category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=10uOhHJnV97JAksVLZY-cWVvI18USB5YB' },
  { title: 'Harita Samhita (Part 2)',                                                  category: 'Samhitas',        language: 'Sanskrit', url: 'https://drive.google.com/open?id=1mOT-BuLLXWjCji8pmczSdfyGYDS9xCtB' },

  // ── BHAVAPRAKASH ────────────────────────────────────────────
  { title: 'Bhavaprakash Nighantu',                                                    category: 'Bhavaprakash',    language: 'Sanskrit', url: 'https://drive.google.com/open?id=1OVvP41tAgIt00xu_evBoYq0VHpZSkUSe' },
  { title: 'Bhavaprakash Samhita — Uttara Khanda',                                     category: 'Bhavaprakash',    language: 'Sanskrit', url: 'https://drive.google.com/open?id=1smjBJAzxUBq1ohPPSpTafeSNkG8ZT97h' },
  { title: 'Bhavaprakash Purva Khanda',                                                category: 'Bhavaprakash',    language: 'Sanskrit', url: 'https://drive.google.com/open?id=1a2PSizISykHgNMJ0MAYx7dnq_kCGwb0o' },
  { title: 'Bhavaprakash Madhya Khanda',                                               category: 'Bhavaprakash',    language: 'Sanskrit', url: 'https://drive.google.com/open?id=1MQifPsKnVmeCmY04tLD9nIvlu-rsNl1A' },
  { title: 'Bhavaprakash Jvara Adhikara',                                              category: 'Bhavaprakash',    language: 'Hindi',    url: 'https://drive.google.com/open?id=1IYuyNTy7CHn-YosXdMbfdmCR9FJDFsi7' },

  // ── NIDANA & NIGHANTUS ──────────────────────────────────────
  { title: 'Madhava Nidana (Part 1)',                                                  category: 'Nighantus',       language: 'Sanskrit', url: 'https://drive.google.com/open?id=0B_QACYIahXj1OVRXa093REs2TVU' },
  { title: 'Madhava Nidana (Part 2)',                                                  category: 'Nighantus',       language: 'Sanskrit', url: 'https://drive.google.com/open?id=1Cr5HR7BESooHgmxOCUgOMHHNw7OWuqEb' },
  { title: 'Madanapala Nighantu',                                                      category: 'Nighantus',       language: 'Sanskrit', url: 'https://drive.google.com/open?id=1iLEkXU1bMPjV0aErL56lma7SHYmfIBv7' },
  { title: 'Niruktam Nighantu',                                                        category: 'Nighantus',       language: 'Sanskrit', url: 'https://drive.google.com/open?id=12iAryJ2c_ZmOACVYEgHkF4o3AL4lbDau' },

  // ── RASASHASTRA & FORMULATIONS ──────────────────────────────
  { title: 'Bhaishajya Ratnavali (Part 1)',                                            category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1Q6uJpQslWzS7I7q_q3pe9DWpoiAjxXSS' },
  { title: 'Bhaishajya Ratnavali (Bengali)',                                           category: 'Rasashastra',     language: 'Bengali',  url: 'https://drive.google.com/open?id=1Znmec2gVkdnLcnPanvMEryIx2d5-kfvA' },
  { title: 'Bhaishajya Ratnavali',                                                     category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1_rEii6EJXyH7u2bGB7BOs8Nfph99ZzsC' },
  { title: 'Rasaratna Samucchaya',                                                     category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1bz8C2JLq5cGcokAXc3r8BDMnR5KsG9RI' },
  { title: 'Rasa Sara',                                                                category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1zXVT89qq5JqY6jAO9p1pXl28VPoz6qZw' },
  { title: 'Rasamanjari',                                                              category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1bpC6yh3TgdOxRYqWA1AvdRpcjiZ5RRoy' },
  { title: 'Sahasrayogam (Kannada Commentary)',                                        category: 'Rasashastra',     language: 'Kannada',  url: 'https://drive.google.com/open?id=18kTe-tfG62cdIHLMyFn2-sSWpMA4etQO' },
  { title: 'Sarngadhara Samhita (Sanskrit)',                                           category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1vZ6XsRRieueoItv_CLlmu-he7zzC05Bj' },
  { title: 'Sharangdhara Samhita (Part 2)',                                            category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1NppO4LNiDPL31vZAxpquMHnbabW0WHDw' },
  { title: 'Chakradatta (Part 1)',                                                     category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=12SR86B3R-kKhrDFdgS8MhDsoLziVkE0U' },
  { title: 'Chakradatta (Part 2)',                                                     category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1O1WuDYcn419Ef4gE1KGkNSWvwcLnRRXa' },
  { title: 'Chakradatta (Part 3)',                                                     category: 'Rasashastra',     language: 'Sanskrit', url: 'https://drive.google.com/open?id=1rrx0M8BCg3efccEsk3LJk8xONcPvQqMn' },
  { title: 'Chakradatta (Telugu)',                                                     category: 'Rasashastra',     language: 'Telugu',   url: 'https://drive.google.com/open?id=14f7Fn0xzW3r8B26NwvZofSpk9X92WLWi' },
  { title: 'Akshara Kashayam',                                                         category: 'Rasashastra',     language: 'English',  url: 'https://drive.google.com/open?id=1kiGZFzndHLKz4OW-ATjsWJgpgzIG3bCQ' },

  // ── SURGERY / SPECIALTY ─────────────────────────────────────
  { title: 'Abhinavam Prasutitantram (Obstetrics)',                                    category: 'Surgery',         language: 'Sanskrit', url: 'https://drive.google.com/open?id=1ybGNDERLb-2nUTvZBZZ0oCRs0MJlnfOl' },

  // ── MODERN AYURVEDA ─────────────────────────────────────────
  { title: 'Ayurveda Prakash',                                                         category: 'Modern Ayurveda', language: 'Hindi',    url: 'https://drive.google.com/open?id=1phixnx-VSfbroZwFXh6PF9XfahNMnXV9' },
  { title: 'Arogya Chintamani',                                                        category: 'Modern Ayurveda', language: 'Sanskrit', url: 'https://drive.google.com/open?id=1UG-PLPF1UNXKq1myP-lEqg9MJpRSubVY' },
  { title: 'Ayurveda in Veda',                                                         category: 'Modern Ayurveda', language: 'English',  url: 'https://drive.google.com/open?id=1ba0YnBlNUwHRw2ZYfpchlKEo26AWVWH0' },

  // ── OTHER LANGUAGES ─────────────────────────────────────────
  { title: 'Agasthya Ayurveda (Tamil)',                                                category: 'Other Languages', language: 'Tamil',    url: 'https://drive.google.com/open?id=1CnVSemfDSC0-ssqMd1C6jvo_Tewi8B5P' },

  // ── OTHER (Veterinary + adjunct) ────────────────────────────
  { title: 'Hastyayurveda (Veterinary Ayurveda)',                                      category: 'Other',           language: 'Sanskrit', url: 'https://drive.google.com/open?id=1XsoHy8qDgg21_OAXXl9TqH2VXhkDD5I-' },
]

export const EXTERNAL_CATEGORIES = ['All', 'Samhitas', 'Bhavaprakash', 'Nighantus', 'Rasashastra', 'Surgery', 'Modern Ayurveda', 'Other Languages', 'Other'] as const
export const EXTERNAL_LANGUAGES  = ['All', 'Sanskrit', 'Hindi', 'English', 'Bengali', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'] as const
