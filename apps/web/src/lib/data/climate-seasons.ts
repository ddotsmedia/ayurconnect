// Static maps for Ritucharya — city → climate profile + date+climate → Ritu.
// The Indian Ayurvedic seasonal calendar has 6 Ritus mapped to Gregorian months;
// Gulf-arid climates use overridden ritus because their year is bimodal (long
// hot summer + short mild winter) rather than the 6-step Indian model.

export type Climate =
  | 'kerala-coastal'    // humid tropical (Thiruvananthapuram, Kochi, Alappuzha)
  | 'kerala-highland'   // cooler, monsoon-soaked (Idukki, Wayanad)
  | 'south-india'       // tropical wet-dry (Bangalore, Chennai, Hyderabad)
  | 'north-india'       // temperate with cold winters (Delhi, Lucknow, Jaipur)
  | 'gulf-arid'         // hot-arid, bimodal (Dubai, Abu Dhabi, Doha, Riyadh, Kuwait, Manama, Muscat)
  | 'uk-temperate'      // cool-temperate (London, Birmingham, Manchester)
  | 'us-east'           // continental humid (NYC, DC, Boston, Toronto)
  | 'us-west'           // mediterranean (LA, SF, Seattle)
  | 'aus-temperate'     // mediterranean–temperate (Sydney, Melbourne, Perth)
  | 'singapore-malaysia' // tropical equatorial

export type Ritu =
  | 'shishira' | 'vasanta' | 'grishma' | 'varsha' | 'sharad' | 'hemanta'  // classical 6 Indian seasons
  | 'gulf-summer' | 'gulf-winter'                                          // Gulf overrides
  | 'temperate-summer' | 'temperate-winter' | 'temperate-spring' | 'temperate-autumn'  // temperate overrides

export type ClimateInfo = { climate: Climate; label: string; description: string }
export type RituInfo    = { ritu: Ritu; label: string; sanskrit: string; description: string; dominantDosha: 'vata' | 'pitta' | 'kapha' | 'mixed' }

// City → Climate map. Lowercase keys. Add as needed.
const CITY_TO_CLIMATE: Record<string, Climate> = {
  // Kerala (coastal/lowland default; highland districts override)
  'thiruvananthapuram': 'kerala-coastal', 'trivandrum': 'kerala-coastal',
  'kollam': 'kerala-coastal', 'alappuzha': 'kerala-coastal', 'alleppey': 'kerala-coastal',
  'kochi': 'kerala-coastal', 'ernakulam': 'kerala-coastal', 'kannur': 'kerala-coastal',
  'kozhikode': 'kerala-coastal', 'calicut': 'kerala-coastal', 'thrissur': 'kerala-coastal',
  'kottayam': 'kerala-coastal', 'malappuram': 'kerala-coastal', 'kasaragod': 'kerala-coastal',
  'pathanamthitta': 'kerala-coastal', 'palakkad': 'kerala-coastal',
  // Kerala highland
  'idukki': 'kerala-highland', 'wayanad': 'kerala-highland', 'munnar': 'kerala-highland',
  // South India
  'bangalore': 'south-india', 'bengaluru': 'south-india', 'chennai': 'south-india',
  'hyderabad': 'south-india', 'pune': 'south-india', 'mysore': 'south-india', 'coimbatore': 'south-india',
  // North India
  'delhi': 'north-india', 'new delhi': 'north-india', 'mumbai': 'south-india', 'kolkata': 'south-india',
  'lucknow': 'north-india', 'jaipur': 'north-india', 'chandigarh': 'north-india', 'amritsar': 'north-india',
  // Gulf
  'dubai': 'gulf-arid', 'abu dhabi': 'gulf-arid', 'sharjah': 'gulf-arid', 'ajman': 'gulf-arid',
  'fujairah': 'gulf-arid', 'ras al khaimah': 'gulf-arid', 'al ain': 'gulf-arid',
  'doha': 'gulf-arid', 'riyadh': 'gulf-arid', 'jeddah': 'gulf-arid', 'dammam': 'gulf-arid',
  'kuwait city': 'gulf-arid', 'manama': 'gulf-arid', 'muscat': 'gulf-arid', 'salalah': 'gulf-arid',
  // UK
  'london': 'uk-temperate', 'birmingham': 'uk-temperate', 'manchester': 'uk-temperate',
  'glasgow': 'uk-temperate', 'edinburgh': 'uk-temperate', 'leicester': 'uk-temperate',
  // US East / Canada East
  'new york': 'us-east', 'nyc': 'us-east', 'boston': 'us-east', 'washington': 'us-east',
  'toronto': 'us-east', 'montreal': 'us-east', 'chicago': 'us-east', 'atlanta': 'us-east',
  // US West
  'los angeles': 'us-west', 'la': 'us-west', 'san francisco': 'us-west', 'sf': 'us-west',
  'seattle': 'us-west', 'vancouver': 'us-west', 'san diego': 'us-west', 'san jose': 'us-west',
  // Australia
  'sydney': 'aus-temperate', 'melbourne': 'aus-temperate', 'perth': 'aus-temperate',
  'brisbane': 'aus-temperate', 'adelaide': 'aus-temperate',
  // SE Asia
  'singapore': 'singapore-malaysia', 'kuala lumpur': 'singapore-malaysia',
}

export const CLIMATES: ClimateInfo[] = [
  { climate: 'kerala-coastal',     label: 'Kerala coastal',     description: 'Humid tropical. Year-round Kapha + Pitta concerns, monsoon Vata aggravation.' },
  { climate: 'kerala-highland',    label: 'Kerala highland',    description: 'Cooler hill stations with heavy monsoon. Vata-dominant rhythm.' },
  { climate: 'south-india',        label: 'South India',        description: 'Tropical wet–dry. Pitta-dominant most of year.' },
  { climate: 'north-india',        label: 'North India',        description: 'Temperate with cold winters + harsh summers. Vata + Pitta alternating.' },
  { climate: 'gulf-arid',          label: 'Gulf (UAE / GCC)',   description: 'Hot-arid. Long extreme summer + short mild winter. Pitta-dominant nearly year-round; Vata in winter.' },
  { climate: 'uk-temperate',       label: 'UK / Northern Europe', description: 'Cool-temperate. Cold + damp = strong Vata + Kapha.' },
  { climate: 'us-east',            label: 'US East / Canada East', description: 'Continental humid. Extreme seasonal swings — all three doshas across the year.' },
  { climate: 'us-west',            label: 'US West',            description: 'Mediterranean. Mild + dry — Vata-dominant, Pitta in summer.' },
  { climate: 'aus-temperate',      label: 'Australia (temperate)', description: 'Mediterranean–temperate. Inverted seasons relative to India.' },
  { climate: 'singapore-malaysia', label: 'Singapore / Malaysia', description: 'Tropical equatorial. Kapha + Pitta dominant all year.' },
]

export function detectClimate(cityRaw: string | undefined): Climate | null {
  if (!cityRaw) return null
  const c = cityRaw.trim().toLowerCase().replace(/[.,;]/g, '')
  return CITY_TO_CLIMATE[c] ?? null
}

// Determine Ritu from date (UTC month) + climate. The classical Indian
// calendar maps months to Ritus; Gulf + temperate climates use overrides
// because the 6-Ritu model assumes Indian monsoon timing.
export function currentRitu(date: Date, climate: Climate): RituInfo {
  const m = date.getUTCMonth() // 0-11
  if (climate === 'gulf-arid') {
    return m >= 3 && m <= 9 ? RITU_INFO['gulf-summer'] : RITU_INFO['gulf-winter']
  }
  if (climate === 'uk-temperate' || climate === 'us-east' || climate === 'us-west') {
    if (m >= 2 && m <= 4)  return RITU_INFO['temperate-spring']
    if (m >= 5 && m <= 7)  return RITU_INFO['temperate-summer']
    if (m >= 8 && m <= 10) return RITU_INFO['temperate-autumn']
    return RITU_INFO['temperate-winter']
  }
  if (climate === 'aus-temperate') {
    // Inverted southern hemisphere
    if (m >= 2 && m <= 4)  return RITU_INFO['temperate-autumn']
    if (m >= 5 && m <= 7)  return RITU_INFO['temperate-winter']
    if (m >= 8 && m <= 10) return RITU_INFO['temperate-spring']
    return RITU_INFO['temperate-summer']
  }
  if (climate === 'singapore-malaysia') {
    // Equatorial — split into wet & dry phases as approximations
    return m >= 4 && m <= 9 ? RITU_INFO['varsha'] : RITU_INFO['grishma']
  }
  // Indian classical calendar (works for Kerala / south / north India)
  // Mid-Jan to mid-Mar = Shishira, mid-Mar to mid-May = Vasanta, etc.
  // Using whole-month bucketing for simplicity.
  if (m === 0  || m === 1)            return RITU_INFO['shishira']  // Jan–Feb
  if (m === 2  || m === 3)            return RITU_INFO['vasanta']   // Mar–Apr
  if (m === 4  || m === 5)            return RITU_INFO['grishma']   // May–Jun
  if (m === 6  || m === 7)            return RITU_INFO['varsha']    // Jul–Aug
  if (m === 8  || m === 9)            return RITU_INFO['sharad']    // Sep–Oct
  return RITU_INFO['hemanta']                                        // Nov–Dec
}

export const RITU_INFO: Record<Ritu, RituInfo> = {
  shishira:           { ritu: 'shishira',           label: 'Shishira (late winter)',       sanskrit: 'शिशिर',  description: 'Cold + dry. Kapha-accumulation phase; protect digestion.',            dominantDosha: 'kapha' },
  vasanta:            { ritu: 'vasanta',            label: 'Vasanta (spring)',             sanskrit: 'वसंत',   description: 'Kapha melts, digestion weakens. Lighten the diet, increase movement.', dominantDosha: 'kapha' },
  grishma:            { ritu: 'grishma',            label: 'Grishma (summer)',             sanskrit: 'ग्रीष्म', description: 'Hot, depleting. Pitta-aggravating; cool + hydrate.',                  dominantDosha: 'pitta' },
  varsha:             { ritu: 'varsha',             label: 'Varsha (monsoon)',             sanskrit: 'वर्षा',  description: 'Damp + cool. Vata aggravation + weak digestion. Karkidaka Chikitsa season — classical rejuvenation window.', dominantDosha: 'vata' },
  sharad:             { ritu: 'sharad',             label: 'Sharad (autumn)',              sanskrit: 'शरद',   description: 'Pitta-peak. Heat accumulates from monsoon — cooling + cleansing protocols.', dominantDosha: 'pitta' },
  hemanta:            { ritu: 'hemanta',            label: 'Hemanta (early winter)',       sanskrit: 'हेमंत',  description: 'Cool, digestion strongest. The classical Brimhana (building) season.',  dominantDosha: 'vata' },
  'gulf-summer':      { ritu: 'gulf-summer',        label: 'Gulf summer',                  sanskrit: '—',     description: 'Extreme hot-arid (Apr–Oct). Pitta peak with strong dehydration risk.',  dominantDosha: 'pitta' },
  'gulf-winter':      { ritu: 'gulf-winter',        label: 'Gulf winter',                  sanskrit: '—',     description: 'Mild + dry (Nov–Mar). Vata aggravation from dryness + AC.',           dominantDosha: 'vata' },
  'temperate-summer': { ritu: 'temperate-summer',   label: 'Summer (temperate)',           sanskrit: '—',     description: 'Pitta-aggravating warmth; lighter foods + hydration.',                 dominantDosha: 'pitta' },
  'temperate-winter': { ritu: 'temperate-winter',   label: 'Winter (temperate)',           sanskrit: '—',     description: 'Cold + dry indoor air. Strong Vata + Kapha load.',                     dominantDosha: 'mixed' },
  'temperate-spring': { ritu: 'temperate-spring',   label: 'Spring (temperate)',           sanskrit: '—',     description: 'Kapha melts, allergies common. Light + warming foods.',                dominantDosha: 'kapha' },
  'temperate-autumn': { ritu: 'temperate-autumn',   label: 'Autumn (temperate)',           sanskrit: '—',     description: 'Cool + dry. Vata-aggravating; oily + warm regimen.',                   dominantDosha: 'vata' },
}
