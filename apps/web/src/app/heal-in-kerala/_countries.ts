// Static country config for /heal-in-kerala/[country] pages.
//
// Inline assumption: exchange rates are static snapshot values (Jun 2026,
// rounded for legibility). Real-time FX would need a separate API + cache
// layer; that's deferred until conversion rates start mattering for binding
// quotes. The "rates vary" disclaimer is rendered on every page.
//
// "complete: true" gates index-eligibility (per spec STEP 4 data-gate).
// A country with complete:false renders the page but emits noindex until
// the editorial team fills in the visa + logistics blocks.

export type HealCountry = {
  slug: string
  name: string
  flag: string           // emoji
  code: string           // ISO 3166-1 alpha-2
  currency: string       // ISO 4217
  currencySymbol: string
  approxInrRate: number  // 1 unit of currency = X INR (static snapshot)
  region: 'gcc' | 'europe' | 'americas' | 'apac'
  majorAirports: Array<{ name: string; code: string; directToKerala: boolean; routesNote?: string }>
  visaTypes: Array<{ name: string; durationDays: number | string; eligibility: string; feeUsd?: number; processingDays?: number; notes?: string }>
  bestMonths: string     // human-readable
  insuranceNote: string
  languageNote: string
  paymentNote: string
  climatePackingNote: string
  complete: boolean      // data-gate flag
}

// 15 priority markets per spec STEP 2.
export const HEAL_COUNTRIES: HealCountry[] = [
  {
    slug: 'uae', name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE',
    currency: 'AED', currencySymbol: 'AED ', approxInrRate: 22.6, region: 'gcc',
    majorAirports: [
      { name: 'Dubai International',     code: 'DXB', directToKerala: true,  routesNote: 'Emirates, Air India Express, IndiGo, Etihad — daily direct flights to Kochi (COK), Trivandrum (TRV), Calicut (CCJ); ~4h' },
      { name: 'Abu Dhabi International', code: 'AUH', directToKerala: true,  routesNote: 'Etihad, Air India Express direct to COK + TRV daily; ~4h' },
      { name: 'Sharjah International',   code: 'SHJ', directToKerala: true,  routesNote: 'Air Arabia, IndiGo to COK, TRV, CCJ; ~4h' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa (30/60 days)',  durationDays: '30 / 60', eligibility: 'UAE residents (all nationalities)',     feeUsd: 25,  processingDays: 3, notes: 'Most common for short stays; multiple entries allowed.' },
      { name: 'e-Ayush Visa (60 / 120 days)', durationDays: '60 / 120', eligibility: 'For Ayurveda / Yoga / Unani / Siddha treatment',          feeUsd: 80,  processingDays: 5, notes: 'Launched July 2023. Specifically for non-surgical AYUSH treatment; longer stay than regular tourist.' },
      { name: 'e-Medical Visa (60 days, triple entry)', durationDays: 60, eligibility: 'For medical treatment incl. surgical', feeUsd: 80, processingDays: 5, notes: 'Treatment letter from registered Indian hospital required at application.' },
    ],
    bestMonths: 'October–March (cool, dry). Karkidaka (mid-July to mid-August) for classical monsoon rejuvenation.',
    insuranceNote: 'Most UAE health insurance does NOT cover Ayurveda treatment abroad. Niva Bupa and Star Health offer Ayurveda riders for UAE residents — verify with your insurer before travel.',
    languageNote: 'English widely spoken at classified centres. Malayalam is local. Arabic-speaking staff at major centres serving GCC patients (Somatheeram, CGH Earth Kalari Kovilakom, Vaidyaratnam).',
    paymentNote: 'AED cards via Razorpay UAE rails (Apple Pay supported). Cash AED accepted by many centres for incidentals. Avoid carrying > USD 10,000 cash equivalent.',
    climatePackingNote: 'Light cotton clothes year-round. Light woollens for hill stations (Wayanad, Munnar) in winter. Modest cover-ups for temple visits. Sunscreen, mosquito repellent.',
    complete: true,
  },
  {
    slug: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA',
    currency: 'SAR', currencySymbol: 'SAR ', approxInrRate: 22.1, region: 'gcc',
    majorAirports: [
      { name: 'King Khalid Intl (Riyadh)',  code: 'RUH', directToKerala: true, routesNote: 'Air India Express, Saudia, IndiGo to COK + TRV; ~5h' },
      { name: 'King Abdulaziz (Jeddah)',    code: 'JED', directToKerala: true, routesNote: 'Saudia, Air India direct to COK + TRV; ~5h' },
      { name: 'King Fahd (Dammam)',         code: 'DMM', directToKerala: true, routesNote: 'IndiGo, Air India Express to COK; ~5h' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa (30/60 days)',  durationDays: '30 / 60', eligibility: 'Saudi residents',                    feeUsd: 25,  processingDays: 3 },
      { name: 'e-Ayush Visa (60 / 120 days)', durationDays: '60 / 120', eligibility: 'AYUSH treatment specifically',         feeUsd: 80,  processingDays: 5 },
      { name: 'e-Medical Visa (60 days)',     durationDays: 60, eligibility: 'Medical treatment — treatment letter required', feeUsd: 80,  processingDays: 5 },
    ],
    bestMonths: 'October–March. Karkidaka (mid-July–August) for monsoon Panchakarma.',
    insuranceNote: 'Saudi health insurance typically does not cover Ayurveda abroad. Bupa Arabia and Tawuniya offer some international medical riders — confirm scope with your provider before travel.',
    languageNote: 'Arabic-speaking reception at major Kerala medical-tourism centres. English is universal at classified centres.',
    paymentNote: 'SAR cards work at most centres via international Razorpay. Currency exchange easily available at Kochi, Trivandrum airports.',
    climatePackingNote: 'Lightweight cottons; modest dress recommended in temple regions. Bring prescription medication for first 30 days in original packaging.',
    complete: true,
  },
  {
    slug: 'qatar', name: 'Qatar', flag: '🇶🇦', code: 'QA',
    currency: 'QAR', currencySymbol: 'QAR ', approxInrRate: 22.8, region: 'gcc',
    majorAirports: [{ name: 'Hamad International (Doha)', code: 'DOH', directToKerala: true, routesNote: 'Qatar Airways, IndiGo direct to COK + TRV daily; ~4h 30m' }],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Qatar residents', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'AYUSH treatment', feeUsd: 80, processingDays: 5 },
      { name: 'e-Medical Visa', durationDays: 60, eligibility: 'Surgical or other medical', feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August) for monsoon classical therapy.',
    insuranceNote: 'Qatar health insurance generally does not cover overseas Ayurveda. Some private plans (Cigna, AXA) extend to wellness — confirm before travel.',
    languageNote: 'Arabic + English at major centres serving Gulf patients.',
    paymentNote: 'QAR cards via Razorpay. Cash conversion at airport or at hotel.',
    climatePackingNote: 'Light cottons; cover-ups for temples. Pack a small umbrella if travelling Jun–Aug.',
    complete: true,
  },
  {
    slug: 'oman', name: 'Oman', flag: '🇴🇲', code: 'OM',
    currency: 'OMR', currencySymbol: 'OMR ', approxInrRate: 216, region: 'gcc',
    majorAirports: [
      { name: 'Muscat International',  code: 'MCT', directToKerala: true, routesNote: 'Oman Air, Salam Air to COK + TRV; ~3h 30m' },
      { name: 'Salalah International', code: 'SLL', directToKerala: false, routesNote: 'Via Muscat or Dubai; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Oman residents', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'AYUSH treatment', feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July to mid-August).',
    insuranceNote: 'Most Oman health insurance does not cover Ayurveda treatment abroad. Confirm coverage with your provider before travel.',
    languageNote: 'Arabic + English supported at major Kerala centres.',
    paymentNote: 'OMR cards via Razorpay; cash conversion at airport.',
    climatePackingNote: 'Light cottons + modest cover-ups. Umbrella useful Jun–Aug.',
    complete: true,
  },
  {
    slug: 'kuwait', name: 'Kuwait', flag: '🇰🇼', code: 'KW',
    currency: 'KWD', currencySymbol: 'KWD ', approxInrRate: 270, region: 'gcc',
    majorAirports: [{ name: 'Kuwait International', code: 'KWI', directToKerala: true, routesNote: 'Jazeera Airways, Kuwait Airways, IndiGo direct to COK + TRV; ~4h 30m' }],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Kuwait residents', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'AYUSH treatment', feeUsd: 80, processingDays: 5 },
      { name: 'e-Medical Visa', durationDays: 60, eligibility: 'Medical treatment', feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August).',
    insuranceNote: 'Kuwait public health insurance does not cover Ayurveda abroad. Private plans rarely do — verify with your provider.',
    languageNote: 'Arabic + English at major centres.',
    paymentNote: 'KWD cards work via Razorpay. Exchange at airport.',
    climatePackingNote: 'Light cottons + modest cover-ups for temple visits.',
    complete: true,
  },
  {
    slug: 'bahrain', name: 'Bahrain', flag: '🇧🇭', code: 'BH',
    currency: 'BHD', currencySymbol: 'BHD ', approxInrRate: 220, region: 'gcc',
    majorAirports: [{ name: 'Bahrain International (Manama)', code: 'BAH', directToKerala: true, routesNote: 'Gulf Air, Air India Express to COK + TRV; ~4h 30m' }],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Bahrain residents', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'AYUSH treatment', feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August).',
    insuranceNote: 'Bahrain health insurance typically does not cover Ayurveda abroad. Verify scope before travel.',
    languageNote: 'Arabic + English at major centres.',
    paymentNote: 'BHD cards via Razorpay; cash conversion at airport.',
    climatePackingNote: 'Light cottons + cover-ups.',
    complete: true,
  },
  {
    slug: 'uk', name: 'United Kingdom', flag: '🇬🇧', code: 'GB',
    currency: 'GBP', currencySymbol: '£', approxInrRate: 106, region: 'europe',
    majorAirports: [
      { name: 'London Heathrow',     code: 'LHR', directToKerala: false, routesNote: 'Air India + British Airways via Delhi or Mumbai; 1 stop, ~13–14h total' },
      { name: 'London Gatwick',      code: 'LGW', directToKerala: false, routesNote: 'Via Dubai (Emirates) or Doha (Qatar); 1 stop' },
      { name: 'Manchester',          code: 'MAN', directToKerala: false, routesNote: 'Via Dubai or Doha; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90 / 365', eligibility: 'UK passport holders',     feeUsd: 25,  processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',         feeUsd: 80,  processingDays: 5, notes: 'Multi-entry. Specifically designed for Ayurveda / Yoga / Unani / Siddha.' },
      { name: 'e-Medical Visa', durationDays: 60, eligibility: 'For medical treatment',                feeUsd: 80,  processingDays: 5 },
    ],
    bestMonths: 'October–March (winter escape window). Karkidaka (mid-July–August) for monsoon Panchakarma.',
    insuranceNote: 'NHS does not cover treatment abroad. Most UK private insurance (Bupa, AXA, Aviva) does NOT cover Ayurveda. Some specialist travel insurers (e.g. Holiday Extras Wellness) offer cover — verify before booking.',
    languageNote: 'English universal at classified centres. Malayalam is the local language.',
    paymentNote: 'GBP cards work at all major centres. Razorpay handles GBP via international rails. Consider Wise or Revolut for better FX than UK bank cards.',
    climatePackingNote: 'Light cottons for tropical climate. Light raincoat or umbrella if travelling Jun–Aug. Modest cover-ups for temple visits. Bring your usual prescription meds in original packaging.',
    complete: true,
  },
  {
    slug: 'germany', name: 'Germany', flag: '🇩🇪', code: 'DE',
    currency: 'EUR', currencySymbol: '€', approxInrRate: 92, region: 'europe',
    majorAirports: [
      { name: 'Frankfurt',  code: 'FRA', directToKerala: false, routesNote: 'Via Dubai (Emirates) or Doha (Qatar); 1 stop, ~12–13h' },
      { name: 'Munich',     code: 'MUC', directToKerala: false, routesNote: 'Via Dubai or Doha; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90 / 365', eligibility: 'German passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',         feeUsd: 80, processingDays: 5 },
      { name: 'e-Medical Visa', durationDays: 60, eligibility: 'For medical treatment',                feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August) for classical monsoon therapy.',
    insuranceNote: 'GKV (statutory insurance) does not cover Ayurveda. Some PKV (private) plans cover Heilpraktiker-prescribed Ayurveda but rarely abroad — confirm scope.',
    languageNote: 'English at all classified centres. Some specialist centres (Vaidyagrama, Punarnava) have German-speaking liaison staff for European patients.',
    paymentNote: 'EUR cards work via Razorpay. Wise or Revolut for better FX.',
    climatePackingNote: 'Light cottons; light raincoat for monsoon; modest cover-ups for temples.',
    complete: true,
  },
  {
    slug: 'russia', name: 'Russia', flag: '🇷🇺', code: 'RU',
    currency: 'RUB', currencySymbol: '₽', approxInrRate: 1.05, region: 'europe',
    majorAirports: [
      { name: 'Sheremetyevo (Moscow)',      code: 'SVO', directToKerala: false, routesNote: 'Via Dubai or Doha; 1 stop, ~10–11h' },
      { name: 'Domodedovo (Moscow)',        code: 'DME', directToKerala: false, routesNote: 'Via Dubai or Doha; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Russian passport holders', feeUsd: 25, processingDays: 5 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',     feeUsd: 80, processingDays: 7, notes: 'Verify processing times — may be longer than baseline.' },
    ],
    bestMonths: 'October–March (warm escape from Russian winter). Karkidaka (mid-July–August).',
    insuranceNote: 'Russian OMS does not cover Ayurveda abroad. VHI (DMS) plans rarely cover overseas wellness — confirm with your provider.',
    languageNote: 'English at most classified centres; Russian-speaking liaison staff at some specialist medical-tourism centres (especially Goa-overflow + Kovalam area).',
    paymentNote: 'RUB cards may have international payment restrictions; consider bringing USD/EUR cash for exchange at airport. SBI bank transfer available pre-arrival via centre.',
    climatePackingNote: 'Light cottons; pack heavier clothing as you re-enter Russian climate. Raincoat for monsoon season.',
    complete: true,
  },
  {
    slug: 'usa', name: 'United States', flag: '🇺🇸', code: 'US',
    currency: 'USD', currencySymbol: '$', approxInrRate: 83, region: 'americas',
    majorAirports: [
      { name: 'New York (JFK)',       code: 'JFK', directToKerala: false, routesNote: 'Air India direct to Delhi/Mumbai, connect to COK; ~22–24h' },
      { name: 'Washington (IAD)',     code: 'IAD', directToKerala: false, routesNote: 'Via Doha or Dubai; 1 stop' },
      { name: 'Chicago (ORD)',        code: 'ORD', directToKerala: false, routesNote: 'Via Frankfurt or Doha; 1 stop' },
      { name: 'San Francisco (SFO)',  code: 'SFO', directToKerala: false, routesNote: 'Via Dubai (Emirates) or Doha (Qatar); 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90 / 365', eligibility: 'US passport holders',     feeUsd: 25,  processingDays: 3, notes: 'Many US citizens qualify for the 5- or 10-year multi-entry tourist visa as well.' },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',         feeUsd: 80,  processingDays: 5 },
      { name: 'e-Medical Visa', durationDays: 60, eligibility: 'For medical treatment',                feeUsd: 80,  processingDays: 5 },
    ],
    bestMonths: 'October–March. Karkidaka (mid-July–August) for monsoon Panchakarma — but North American summer plans usually conflict.',
    insuranceNote: 'US health insurance (Medicare, Medicaid, most commercial plans) does NOT cover Ayurveda abroad. HSA / FSA accounts cannot typically be used for Ayurveda. Consider Patriot Travel Medical Insurance for trip-level emergency cover.',
    languageNote: 'English universal at classified centres. Malayalam is local.',
    paymentNote: 'USD cards work everywhere via Razorpay. Wise or Capital One cards for best FX. ATMs widely available in Kerala for USD-to-INR withdrawal.',
    climatePackingNote: 'Light cottons; light raincoat for monsoon; modest cover-ups for temple visits. Bring 30+ days of prescription medication in original packaging with the prescription itself.',
    complete: true,
  },
  {
    slug: 'canada', name: 'Canada', flag: '🇨🇦', code: 'CA',
    currency: 'CAD', currencySymbol: 'C$ ', approxInrRate: 61, region: 'americas',
    majorAirports: [
      { name: 'Toronto Pearson',  code: 'YYZ', directToKerala: false, routesNote: 'Air India direct to Delhi or via Dubai (Emirates); 1 stop, ~22h' },
      { name: 'Montreal (YUL)',   code: 'YUL', directToKerala: false, routesNote: 'Via Doha or Dubai; 1 stop' },
      { name: 'Vancouver (YVR)',  code: 'YVR', directToKerala: false, routesNote: 'Via Doha or Frankfurt; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90 / 365', eligibility: 'Canadian passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',           feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March (Canadian winter escape). Karkidaka (mid-July–August).',
    insuranceNote: 'Provincial health insurance does not cover Ayurveda abroad. Most private plans don\'t either. Some HSAs through employer plans cover wellness — check with HR.',
    languageNote: 'English at all classified centres. French-speaking liaison rare; bring a phrasebook if needed.',
    paymentNote: 'CAD cards via Razorpay; Wise or Revolut for better FX.',
    climatePackingNote: 'Light cottons; light raincoat for monsoon; modest cover-ups.',
    complete: true,
  },
  {
    slug: 'australia', name: 'Australia', flag: '🇦🇺', code: 'AU',
    currency: 'AUD', currencySymbol: 'A$ ', approxInrRate: 55, region: 'apac',
    majorAirports: [
      { name: 'Sydney',     code: 'SYD', directToKerala: false, routesNote: 'Via Singapore or KL; 1 stop, ~14–15h' },
      { name: 'Melbourne',  code: 'MEL', directToKerala: false, routesNote: 'Via Singapore, KL or Dubai; 1 stop' },
      { name: 'Perth',      code: 'PER', directToKerala: false, routesNote: 'Via KL or Singapore; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90 / 365', eligibility: 'Australian passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',              feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March (Australian summer = Indian winter window). Karkidaka (mid-July–August) is Australian winter — natural pairing.',
    insuranceNote: 'Medicare does not cover Ayurveda abroad. Some private extras packages (HCF, NIB Wellness) cover Ayurveda partially — confirm with your fund.',
    languageNote: 'English universal at classified centres.',
    paymentNote: 'AUD cards via Razorpay; Wise or Revolut for FX.',
    climatePackingNote: 'Light cottons; raincoat for monsoon; modest cover-ups.',
    complete: true,
  },
  {
    slug: 'japan', name: 'Japan', flag: '🇯🇵', code: 'JP',
    currency: 'JPY', currencySymbol: '¥', approxInrRate: 0.55, region: 'apac',
    majorAirports: [
      { name: 'Narita (NRT)',     code: 'NRT', directToKerala: false, routesNote: 'Via Singapore, Bangkok or Delhi; 1 stop, ~12h' },
      { name: 'Haneda (HND)',     code: 'HND', directToKerala: false, routesNote: 'Via Singapore or KL; 1 stop' },
      { name: 'Kansai (KIX)',     code: 'KIX', directToKerala: false, routesNote: 'Via Singapore, Bangkok or HKG; 1 stop' },
    ],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 90', eligibility: 'Japanese passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',     feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August) aligns with Japanese summer.',
    insuranceNote: 'Japanese public health insurance does not cover overseas Ayurveda. Some private supplementary plans do — verify with your insurer.',
    languageNote: 'English at all classified centres. Japanese-speaking liaison rare; bring a translation app for off-resort situations.',
    paymentNote: 'JPY cards via Razorpay; some centres prefer USD conversion. Bring some USD cash for exchange.',
    climatePackingNote: 'Light cottons; raincoat for monsoon; modest cover-ups.',
    complete: true,
  },
  {
    slug: 'malaysia', name: 'Malaysia', flag: '🇲🇾', code: 'MY',
    currency: 'MYR', currencySymbol: 'RM ', approxInrRate: 18, region: 'apac',
    majorAirports: [{ name: 'Kuala Lumpur International', code: 'KUL', directToKerala: true, routesNote: 'AirAsia, Malindo, IndiGo direct to COK + TRV daily; ~4h' }],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Malaysian passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',       feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August). Year-round acceptable for visitors from similar tropical climate.',
    insuranceNote: 'Malaysian health insurance generally does not cover Ayurveda abroad. Some Allianz wellness riders do — confirm with provider.',
    languageNote: 'English + Tamil + Malay widely understood at Kerala medical-tourism centres serving Malaysian patients.',
    paymentNote: 'MYR cards via Razorpay; cash conversion easily available.',
    climatePackingNote: 'Similar to home climate — light cottons + cover-ups for temple visits.',
    complete: true,
  },
  {
    slug: 'singapore', name: 'Singapore', flag: '🇸🇬', code: 'SG',
    currency: 'SGD', currencySymbol: 'S$ ', approxInrRate: 62, region: 'apac',
    majorAirports: [{ name: 'Singapore Changi', code: 'SIN', directToKerala: true, routesNote: 'Singapore Airlines, Scoot, IndiGo direct to COK + TRV daily; ~4h 30m' }],
    visaTypes: [
      { name: 'e-Tourist Visa', durationDays: '30 / 60', eligibility: 'Singaporean passport holders', feeUsd: 25, processingDays: 3 },
      { name: 'e-Ayush Visa',   durationDays: '60 / 120', eligibility: 'For AYUSH treatment',         feeUsd: 80, processingDays: 5 },
    ],
    bestMonths: 'October–March; Karkidaka (mid-July–August). Year-round acceptable.',
    insuranceNote: 'Singapore MediShield Life and most IPs (Integrated Shield Plans) do NOT cover Ayurveda abroad. Some employer wellness budgets allow it — check HR.',
    languageNote: 'English + Tamil at major Kerala centres serving Singaporean patients.',
    paymentNote: 'SGD cards via Razorpay; very smooth FX with DBS / OCBC cards.',
    climatePackingNote: 'Similar to home — light cottons + cover-ups.',
    complete: true,
  },
]

export const HEAL_COUNTRY_SLUGS = HEAL_COUNTRIES.map((c) => c.slug)
export const HEAL_COUNTRY_BY_SLUG = new Map(HEAL_COUNTRIES.map((c) => [c.slug, c]))
