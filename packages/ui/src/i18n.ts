export type Lang = 'en' | 'ml'

export const STRINGS = {
  en: {
    nav: { doctors: 'Doctors', hospitals: 'Hospitals', herbs: 'Herbs', ayurbot: 'AyurBot', forum: 'Forum', jobs: 'Jobs', tourism: 'Tourism', treatments: 'Treatments', login: 'Login', joinFree: 'Join Free', menu: 'Menu', viewAll: 'View all 500+ doctors', bySpec: 'By Specialization', byDistrict: 'By District' },
    hero: {
      tag: "Kerala's Ayurveda Heritage, Reimagined",
      title: 'Find CCIM-verified Ayurveda doctors',
      subtitle: 'Classical Panchakarma centres, 150+ medicinal herbs, and AI-assisted health insights — rooted in Kerala.',
      ctaFindDoctor: 'Find a Doctor',
      ctaAskAyurBot: 'Ask AyurBot',
      ctaExploreHerbs: 'Explore Herbs',
    },
    common: { search: 'Search', district: 'District', specialization: 'Specialization', readMore: 'Read more', viewProfile: 'View Profile', book: 'Book' },
  },
  ml: {
    nav: { doctors: 'ഡോക്ടർമാർ', hospitals: 'ആശുപത്രികൾ', herbs: 'ഔഷധസസ്യങ്ങൾ', ayurbot: 'ആയുർബോട്ട്', forum: 'ചർച്ച', jobs: 'ജോലികൾ', tourism: 'ടൂറിസം', treatments: 'ചികിത്സ', login: 'പ്രവേശിക്കുക', joinFree: 'സൗജന്യ അംഗത്വം', menu: 'മെനു', viewAll: 'എല്ലാ 500+ ഡോക്ടർമാരെയും കാണുക', bySpec: 'വിദഗ്ധത പ്രകാരം', byDistrict: 'ജില്ല പ്രകാരം' },
    hero: {
      tag: 'കേരളത്തിന്റെ ആയുർവേദ പാരമ്പര്യം, പുതിയ രൂപത്തിൽ',
      title: 'CCIM വെരിഫൈഡ് ആയുർവേദ ഡോക്ടർമാരെ കണ്ടെത്തുക',
      subtitle: 'ക്ലാസിക്കൽ പഞ്ചകർമ്മ കേന്ദ്രങ്ങൾ, 150+ ഔഷധസസ്യങ്ങൾ, AI സഹായത്തോടെയുള്ള ആരോഗ്യ വിവരങ്ങൾ — കേരളത്തിന്റെ വേരുകളിൽ.',
      ctaFindDoctor: 'ഡോക്ടറെ കണ്ടെത്തുക',
      ctaAskAyurBot: 'ആയുർബോട്ടിനോട് ചോദിക്കുക',
      ctaExploreHerbs: 'ഔഷധസസ്യങ്ങൾ അന്വേഷിക്കുക',
    },
    common: { search: 'തിരയുക', district: 'ജില്ല', specialization: 'വിദഗ്ധത', readMore: 'കൂടുതൽ വായിക്കുക', viewProfile: 'പ്രൊഫൈൽ കാണുക', book: 'ബുക്ക് ചെയ്യുക' },
  },
} as const

export function t(lang: Lang) {
  return STRINGS[lang] ?? STRINGS.en
}

export const LANG_COOKIE = 'lang'

export function readLangFromCookieHeader(cookieHeader: string | null | undefined): Lang {
  if (!cookieHeader) return 'en'
  const match = cookieHeader.match(/(?:^|;\s*)lang=(en|ml)/)
  return (match?.[1] as Lang) ?? 'en'
}
