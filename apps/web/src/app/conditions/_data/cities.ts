// City coverage for programmatic /conditions/[condition]/[city] SEO pages.
//
// We don't generate every condition × city combo — only those high-intent
// for our target geography. Kerala covers our authentic Ayurveda heartland;
// UAE covers our diaspora corridor (largest paid-consult cohort).
//
// Adding a city: append below + ensure at least one Doctor row has
// matching `state` (KL) or `country` (AE) so the page has matching specialists.

export type City = {
  slug: string                    // URL slug, lowercased + hyphenated
  name: string                    // Display name "Kochi"
  state: string                   // Doctor.state filter value: 'Kerala', 'Dubai', etc.
  country: 'IN' | 'AE'            // Doctor.country filter
  region: 'kerala' | 'uae'        // grouping for the city index
  hero: string                    // 1-line geography-specific hook for the page
}

export const CITIES: City[] = [
  // ─── Kerala (the heartland) ─────────────────────────────────────────────
  { slug: 'kochi',          name: 'Kochi',          state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Kerala\'s commercial capital with the densest cluster of Ayurveda clinics in Ernakulam.' },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Capital city with the Government Ayurveda College — Kerala\'s oldest BAMS institution (est. 1889).' },
  { slug: 'kozhikode',      name: 'Kozhikode',      state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Northern hub home to the heritage Vaidyaratnam Oushadhasala lineage and traditional Kalari-marma schools.' },
  { slug: 'thrissur',       name: 'Thrissur',       state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Cultural capital with the Vaidyaratnam Ayurveda Foundation and India\'s largest pulse-diagnosis training programmes.' },
  { slug: 'kannur',         name: 'Kannur',         state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Northern Kerala — strong Vata-disorder specialty traditions plus the highly-rated Vaidyamadham Vasudevan Namboothiri lineage.' },
  { slug: 'palakkad',       name: 'Palakkad',       state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Birthplace of classical Karkidaka Chikitsa monsoon-rejuvenation protocols.' },
  { slug: 'kollam',         name: 'Kollam',         state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Coastal Ayurveda heritage with strong Panchakarma centres in Quilon and along the backwaters.' },
  { slug: 'alappuzha',      name: 'Alappuzha',      state: 'Kerala', country: 'IN', region: 'kerala',
    hero: 'Backwater Ayurveda — many of Kerala\'s premier medical-tourism Panchakarma resorts are here.' },
  // ─── UAE (diaspora corridor) ────────────────────────────────────────────
  { slug: 'dubai',          name: 'Dubai',          state: 'Dubai',     country: 'AE', region: 'uae',
    hero: 'Online consultations with Kerala-trained Ayurveda doctors for the UAE\'s Malayalee community and global patients.' },
  { slug: 'abu-dhabi',      name: 'Abu Dhabi',      state: 'Abu Dhabi', country: 'AE', region: 'uae',
    hero: 'Video consultations with Kerala\'s top BAMS specialists — Malayalam, English, Hindi, and Arabic.' },
  { slug: 'sharjah',        name: 'Sharjah',        state: 'Sharjah',   country: 'AE', region: 'uae',
    hero: 'Authentic Kerala Ayurveda for the Sharjah Malayalee community — at-home video consultations + prescription delivery.' },
]

export function getCity(slug: string): City | null {
  return CITIES.find((c) => c.slug === slug) ?? null
}
