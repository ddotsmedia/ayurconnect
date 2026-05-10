// Best-effort browser-side country detection. No external services.
//
// Strategy (first hit wins):
//   1. Saved cookie/localStorage from a previous session
//   2. navigator.language regional suffix — 'en-IN' → 'IN', 'ar-AE' → 'AE'
//   3. Intl.DateTimeFormat timezone heuristic — 'Asia/Kolkata' → 'IN'
//   4. Fallback: 'IN' (we're a Kerala-rooted platform; safe default)
//
// All of these are fallible — the user can override in the picker.

const STORAGE_KEY = 'ayur_country'

// Common timezone → ISO country mappings (extend as needed). Only includes
// timezones for our priority countries. Browsers also support Intl methods
// to resolve a TZ to a country, but support varies — keep this lookup as a
// reliable fallback.
const TZ_TO_COUNTRY: Record<string, string> = {
  'Asia/Kolkata':       'IN',
  'Asia/Calcutta':      'IN',
  'Asia/Dubai':         'AE',
  'Asia/Riyadh':        'SA',
  'Asia/Qatar':         'QA',
  'Asia/Kuwait':        'KW',
  'Asia/Muscat':        'OM',
  'Asia/Bahrain':       'BH',
  'America/New_York':   'US',
  'America/Chicago':    'US',
  'America/Denver':     'US',
  'America/Los_Angeles':'US',
  'Europe/London':      'GB',
  'America/Toronto':    'CA',
  'America/Vancouver':  'CA',
  'Australia/Sydney':   'AU',
  'Australia/Melbourne':'AU',
  'Australia/Perth':    'AU',
  'Asia/Singapore':     'SG',
  'Asia/Kuala_Lumpur':  'MY',
  'Pacific/Auckland':   'NZ',
  'Europe/Dublin':      'IE',
}

export function detectCountry(): string {
  if (typeof window === 'undefined') return 'IN'

  // 1. Previous session
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && /^[A-Z]{2}$/.test(saved)) return saved
  } catch { /* private mode */ }

  // 2. navigator.language
  try {
    const langs: string[] = []
    if (Array.isArray(navigator.languages)) langs.push(...navigator.languages)
    if (typeof navigator.language === 'string') langs.push(navigator.language)
    for (const l of langs) {
      const m = l.match(/-([A-Z]{2})$/i)
      if (m) {
        const code = m[1].toUpperCase()
        // Don't accept obviously-not-our-target language regions like en-US for a Kerala user
        // — we simply trust the explicit -XX suffix the OS reports.
        return code
      }
    }
  } catch { /* ignore */ }

  // 3. Timezone heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz]
  } catch { /* old browser */ }

  // 4. Fallback
  return 'IN'
}

export function rememberCountry(code: string): void {
  if (typeof window === 'undefined') return
  if (!/^[A-Z]{2}$/.test(code)) return
  try { window.localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
}
