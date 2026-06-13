export type NewsCategory = 'Industry' | 'Research' | 'Government' | 'Community' | 'International'
export type NewsArticle = {
  id: string; slug: string; title: string; excerpt: string; content: string
  category: NewsCategory; author: string; authorRole: string
  publishedAt: string; updatedAt: string
  tags: string[]; readTime: number; featured: boolean; breaking: boolean
  imageAlt: string; source: string; sourceUrl: string; views: number
}
export type EventCategory = 'Conference' | 'Workshop' | 'Seminar' | 'Retreat' | 'CME' | 'Exhibition' | 'Webinar'
export type EventSpeaker = { name: string; title: string; org: string }
export type EventAgendaItem = { time: string; title: string; speaker?: string }
export type AyurEvent = {
  id: string; slug: string; title: string; description: string
  category: EventCategory; organizer: string; venue: string; address: string
  city: string; country: string
  startDate: string; endDate: string; startTime: string; endTime: string
  price: number; currency: string; isFree: boolean; registrationUrl: string
  capacity: number; registered: number; featured: boolean; online: boolean
  tags: string[]; speakers: EventSpeaker[]; agenda: EventAgendaItem[]
  imageAlt: string
}
