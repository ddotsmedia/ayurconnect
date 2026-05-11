// Sample marketplace catalog. This is intentionally curated, not a full e-commerce
// product database — full marketplace (cart, checkout, inventory, vendor portal,
// reviews, shipping) is a multi-week build deferred to a future phase.
//
// Products link out to verified GMP-certified pharmacies (Kottakkal, Vaidyaratnam,
// AVP, AVT). We do not yet take payments through AyurConnect.

export type ProductCategory = {
  slug: string
  name: string
  desc: string
  icon: string  // lucide icon name
}

export type Product = {
  id: string
  name: string
  category: string
  vendor: string
  vendorCertified: boolean   // GMP / AYUSH / NABH
  description: string
  uses: string[]
  priceRange: string
  size: string
}

export const CATEGORIES: ProductCategory[] = [
  { slug: 'classical-formulations', name: 'Classical Formulations', desc: 'Kashayam, Asavam, Arishtam, Lehyam — GMP-certified pharmacies only', icon: 'FlaskConical' },
  { slug: 'oils-ghrita',            name: 'Medicated Oils & Ghee',  desc: 'Mahanarayana, Murivenna, Brahmi Ghrita, Triphala Ghrita and more', icon: 'Droplets' },
  { slug: 'herbs-powders',          name: 'Raw Herbs & Churnas',    desc: 'Single herbs, classical churna combinations — Triphala, Trikatu, Sitopaladi', icon: 'Leaf' },
  { slug: 'panchakarma-kits',       name: 'Panchakarma Home Kits',  desc: 'Snehapana kits, Nasya kits, Abhyanga kits — for monitored home protocols', icon: 'Package' },
  { slug: 'wellness-tools',         name: 'Wellness Tools',         desc: 'Tongue scrapers, Neti pots, kansa wand, Garshana gloves, herb storage', icon: 'Wrench' },
  { slug: 'books',                  name: 'Classical Texts & Books', desc: 'Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam — English / Malayalam / Sanskrit', icon: 'BookOpen' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'kottakkal-mahanarayana',
    name: 'Mahanarayana Tailam',
    category: 'oils-ghrita',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Classical formulation with Bala, Ashwagandha, and dozens of herbs in sesame oil base. The gold standard for Abhyanga and joint applications.',
    uses: ['Arthritis', 'Sciatica', 'Lower-back pain', 'Daily Abhyanga'],
    priceRange: '₹220 – ₹950',
    size: '200 ml / 500 ml / 1 L',
  },
  {
    id: 'kottakkal-murivenna',
    name: 'Murivenna',
    category: 'oils-ghrita',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Kerala-specific medicated oil for fractures, sprains, and soft-tissue injuries. Coconut oil base with Tulsi, Onion, Garlic, and ten classical herbs.',
    uses: ['Sprains', 'Fractures (adjunct)', 'Frozen shoulder', 'Tennis elbow'],
    priceRange: '₹180 – ₹420',
    size: '200 ml / 500 ml',
  },
  {
    id: 'vaidyaratnam-dhanwantharam',
    name: 'Dhanwantharam Tailam',
    category: 'oils-ghrita',
    vendor: 'Vaidyaratnam Oushadhasala',
    vendorCertified: true,
    description: 'Classical Vata-pacifying oil used for prenatal and post-partum Abhyanga, neurological disorders, and rejuvenation.',
    uses: ['Post-partum care', 'Neurological disorders', 'Pediatric Abhyanga'],
    priceRange: '₹240 – ₹880',
    size: '200 ml / 1 L',
  },
  {
    id: 'avp-triphala-churna',
    name: 'Triphala Churna',
    category: 'herbs-powders',
    vendor: 'Arya Vaidya Pharmacy (AVP)',
    vendorCertified: true,
    description: 'Combined powder of Amalaki, Bibhitaki, Haritaki — the universal Rasayana. Daily 1-tsp with warm water before bed.',
    uses: ['Digestion', 'Constipation', 'Rasayana', 'Eye health', 'Skin'],
    priceRange: '₹90 – ₹260',
    size: '50 g / 200 g / 500 g',
  },
  {
    id: 'kottakkal-ashwagandha-churna',
    name: 'Ashwagandha Churna',
    category: 'herbs-powders',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Pure Withania somnifera root powder. The most-studied adaptogen in Ayurveda — RCT evidence for stress, anxiety, and athletic recovery.',
    uses: ['Stress & anxiety', 'Sleep', 'Strength & stamina', 'Vata pacification'],
    priceRange: '₹140 – ₹380',
    size: '100 g / 250 g',
  },
  {
    id: 'kottakkal-trikatu',
    name: 'Trikatu Churna',
    category: 'herbs-powders',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Black pepper + Long pepper + Ginger — the three pungent herbs. Stimulates Agni, particularly useful in Kapha-dominant conditions.',
    uses: ['Sluggish digestion', 'Kapha disorders', 'Cold & cough', 'Weight management'],
    priceRange: '₹110 – ₹290',
    size: '50 g / 200 g',
  },
  {
    id: 'kottakkal-saraswatarishtam',
    name: 'Saraswatarishtam',
    category: 'classical-formulations',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Classical Asava-Arishta with Brahmi, Shankhpushpi, and 50+ herbs. Premier Medhya Rasayana for memory, concentration, and mental clarity.',
    uses: ['Memory enhancement', 'Anxiety', 'Mental fatigue', 'Post-stroke recovery'],
    priceRange: '₹290 – ₹450',
    size: '450 ml',
  },
  {
    id: 'kottakkal-dashamoolarishtam',
    name: 'Dashamoolarishtam',
    category: 'classical-formulations',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'Vata-pacifying Arishta with ten roots. Excellent post-partum tonic, also used in Vata-vyadhi and respiratory weakness.',
    uses: ['Post-partum care', 'Vata disorders', 'Asthma', 'Convalescence'],
    priceRange: '₹250 – ₹420',
    size: '450 ml',
  },
  {
    id: 'kottakkal-chyavanprash',
    name: 'Chyavanprash',
    category: 'classical-formulations',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: 'The classical Rasayana lehyam — Amalaki-based with 40+ herbs. Daily teaspoon for immunity, vitality, and longevity. Suitable for all ages.',
    uses: ['Immunity', 'Daily Rasayana', 'Respiratory health', 'Geriatric tonic'],
    priceRange: '₹320 – ₹950',
    size: '500 g / 1 kg',
  },
  {
    id: 'tongue-scraper-copper',
    name: 'Copper Tongue Scraper (Jivha Nirlekhana)',
    category: 'wellness-tools',
    vendor: 'Multiple verified vendors',
    vendorCertified: false,
    description: 'Classical Ayurvedic Dinacharya tool — copper U-shape scraper used on rising. Anti-bacterial, gently removes coated debris and toxins.',
    uses: ['Morning Dinacharya', 'Oral hygiene', 'Ama removal'],
    priceRange: '₹150 – ₹600',
    size: 'Standard adult / large',
  },
  {
    id: 'neti-pot',
    name: 'Ceramic Neti Pot',
    category: 'wellness-tools',
    vendor: 'Multiple verified vendors',
    vendorCertified: false,
    description: 'Classical Jalaneti tool. Daily nasal lavage with warm saline — proven sinus, allergy, and snoring benefits.',
    uses: ['Sinusitis', 'Allergies', 'Daily Shatkarma'],
    priceRange: '₹250 – ₹850',
    size: 'Standard 250 ml',
  },
  {
    id: 'panchakarma-home-snehapana',
    name: 'Snehapana Home Kit (Vata)',
    category: 'panchakarma-kits',
    vendor: 'Kottakkal Arya Vaidya Sala',
    vendorCertified: true,
    description: '7-day at-home Snehapana kit — graded ghee dosing schedule + supportive lifestyle guide. Use ONLY under doctor supervision.',
    uses: ['Pre-Panchakarma preparation', 'Vata-Vyadhi adjunct', 'Skin disorder protocols'],
    priceRange: '₹2,400 – ₹4,800',
    size: '7-day course',
  },
  {
    id: 'charaka-samhita-en',
    name: 'Charaka Samhita (English)',
    category: 'books',
    vendor: 'Chaukhamba Sanskrit Series',
    vendorCertified: false,
    description: 'Sharma & Dash translation, 7-volume set. The foundational text of Ayurvedic medicine — Charaka\'s clinical treatise on Kayachikitsa.',
    uses: ['Study reference', 'Practitioner library', 'Patient reading'],
    priceRange: '₹4,800 – ₹6,500',
    size: '7-vol set',
  },
]
