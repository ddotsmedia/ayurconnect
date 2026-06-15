// Legacy seed-doctor-N → name-based slug map.
// Whenever a request hits /doctors/seed-doctor-N we look up the real doctor
// by this map and 301-redirect to /doctors/<slug>. Kept as a static map (no
// DB hit) because the seed IDs are immutable.
//
// To populate the actual lookup, the API has to find a doctor by either:
//   - Doctor.id = 'seed-doctor-N' (still works), or
//   - A name-derived slug stored as the new canonical URL.
// Until a true slug column lands, the redirect target is the canonical
// /doctors/<slug> URL and the [id] route resolves it back to the seed row.

export const LEGACY_DOCTOR_SLUGS: Record<string, string> = {
  'seed-doctor-1':  'dr-anjali-menon-ernakulam',
  'seed-doctor-2':  'dr-rajesh-pillai-thiruvananthapuram',
  'seed-doctor-3':  'dr-priya-krishnan-kottayam',
  'seed-doctor-4':  'dr-vinod-nair-kozhikode',
  'seed-doctor-5':  'dr-lekshmi-devi-thrissur',
  'seed-doctor-6':  'dr-suresh-kumar-palakkad',
  'seed-doctor-7':  'dr-meera-sasidharan-alappuzha',
  'seed-doctor-8':  'dr-arun-varghese-idukki',
  'seed-doctor-9':  'dr-reshma-kunjan-kollam',
  'seed-doctor-10': 'dr-manoj-pillai-kannur',
  'seed-doctor-11': 'dr-bindu-mathew-pathanamthitta',
  'seed-doctor-12': 'dr-jayasree-pillai-wayanad',
  'seed-doctor-13': 'dr-hari-nambiar-kasaragod',
  'seed-doctor-14': 'dr-sreelatha-namboothiri-malappuram',
  'seed-doctor-15': 'dr-ramesh-kartha-ernakulam',
  'seed-doctor-16': 'dr-asha-pillai-thiruvananthapuram',
  'seed-doctor-17': 'dr-sunil-george-kottayam',
  'seed-doctor-18': 'dr-divya-rajan-thrissur',
  'seed-doctor-19': 'dr-krishnakumar-v-ernakulam',
  'seed-doctor-20': 'dr-geetha-nair-alappuzha',
}

// Reverse: slug → seed id (so the [id] route can serve them when reached).
export const LEGACY_SLUG_TO_SEED_ID: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY_DOCTOR_SLUGS).map(([id, slug]) => [slug, id]),
)
