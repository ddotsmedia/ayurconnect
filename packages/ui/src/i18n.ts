export type Lang = 'en'

export const STRINGS = {
  en: {
    nav: { doctors: 'Doctors', hospitals: 'Hospitals', herbs: 'Herbs', ayurbot: 'AyurBot', forum: 'Forum', jobs: 'Jobs', tourism: 'Tourism', treatments: 'Treatments', consult: 'Online Consult', learn: 'Learn', community: 'Community', healthTips: 'Health Tips', articles: 'Articles', colleges: 'Colleges', login: 'Login', joinFree: 'Join Free', menu: 'Menu', viewAll: 'View all 500+ doctors', bySpec: 'By Specialization', byDistrict: 'By District' },
    hero: {
      tag: "Kerala's Ayurveda Heritage, Reimagined",
      title: 'Find verified Ayurveda doctors',
      subtitle: 'Classical Panchakarma centres, 150+ medicinal herbs, and AI-assisted health insights — rooted in Kerala.',
      ctaFindDoctor: 'Find a Doctor',
      ctaAskAyurBot: 'Ask AyurBot',
      ctaExploreHerbs: 'Explore Herbs',
    },
    common: { search: 'Search', district: 'District', specialization: 'Specialization', readMore: 'Read more', viewProfile: 'View Profile', book: 'Book' },
  },
} as const

export function t(_lang?: Lang) {
  return STRINGS.en
}

export const LANG_COOKIE = 'lang'

export function readLangFromCookieHeader(_cookieHeader?: string | null): Lang {
  return 'en'
}
