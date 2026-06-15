import Link from 'next/link'
import { Facebook, Instagram, Youtube, Linkedin, ShieldCheck, MessageCircle, Send, Mail, Phone, MapPin } from 'lucide-react'
import { LogoCircular } from './logo'

export type FooterSettings = {
  'social.facebook'?: string
  'social.instagram'?: string
  'social.youtube'?: string
  'social.linkedin'?: string
  'social.twitter'?: string
  'social.whatsapp'?: string
  'social.telegram'?: string
  'contact.email'?: string
  'contact.phone'?: string
  'contact.address'?: string
  'brand.tagline'?: string
  'brand.copyright'?: string
}

const SOCIAL_DEFS: Array<{ key: keyof FooterSettings; icon: typeof Facebook; label: string }> = [
  { key: 'social.facebook',  icon: Facebook,       label: 'Facebook' },
  { key: 'social.instagram', icon: Instagram,      label: 'Instagram' },
  { key: 'social.youtube',   icon: Youtube,        label: 'YouTube' },
  { key: 'social.linkedin',  icon: Linkedin,       label: 'LinkedIn' },
  { key: 'social.whatsapp',  icon: MessageCircle,  label: 'WhatsApp' },
  { key: 'social.telegram',  icon: Send,           label: 'Telegram' },
]

// Footer reduced to 4 cohesive columns (Task 8). Stubs/no-content routes
// removed: /academy, /products/saas, /products/mobile, /roi-calculator,
// /products/hms, /about/press, /about/investors, /about/certifications,
// /about/methodology, /about/why-ayurveda-works, /partnership, /careers.
const COLS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: 'Find Care',
    links: [
      { href: '/doctors',             label: 'Doctors' },
      { href: '/hospitals',           label: 'Hospitals & Wellness' },
      { href: '/online-consultation', label: 'Online Consultation' },
      { href: '/heal-in-kerala',      label: 'Heal in Kerala' },
      { href: '/doctor-match',        label: 'Doctor Match' },
      { href: '/conditions',          label: 'Conditions' },
      { href: '/treatments',          label: 'Treatments' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { href: '/articles',               label: 'Articles' },
      { href: '/herbs',                  label: 'Herbs' },
      { href: '/formulary',              label: 'Formulary' },
      { href: '/health-tips',            label: 'Health Tips' },
      { href: '/heritage',               label: 'Heritage' },
      { href: '/karkidaka',              label: 'Karkidaka' },
      { href: '/learn/tridosha',         label: 'Tridosha' },
      { href: '/tools',                  label: 'Free Tools' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: '/qa',                     label: 'Q&A' },
      { href: '/forum',                  label: 'Forum' },
      { href: '/community/malayalees',   label: 'Malayalees Abroad' },
      { href: '/doctors/ambassador',     label: 'Doctor Ambassador' },
      { href: '/jobs',                   label: 'Jobs' },
      { href: '/amai',                   label: 'AMAI' },
    ],
  },
  {
    heading: 'AyurConnect',
    links: [
      { href: '/about',           label: 'About' },
      { href: '/contact',         label: 'Contact' },
      { href: '/privacy',         label: 'Privacy' },
      { href: '/terms',           label: 'Terms' },
      { href: '/sign-in',         label: 'Sign In' },
      { href: '/register',        label: 'Register' },
      { href: '/doctors/register',label: 'For Doctors' },
    ],
  },
]

export function Footer({ settings = {} }: { settings?: FooterSettings } = {}) {
  const tagline   = settings['brand.tagline']   || "Kerala's #1 Ayurveda Platform"
  const copyright = settings['brand.copyright'] || `© ${new Date().getFullYear()} AyurConnect.com — Kerala's Premier Ayurveda Platform.`
  const socials = SOCIAL_DEFS.filter((d) => (settings[d.key] ?? '').trim().length > 0)
  // Twitter/X is special-cased: lucide doesn't ship a Twitter icon in v0.x, use a styled X glyph instead
  const showTwitter = (settings['social.twitter'] ?? '').trim().length > 0

  return (
    <footer className="bg-kerala-800 text-white mt-20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand col */}
          <div>
            <Link href="/" aria-label="AyurConnect home" className="inline-block bg-white rounded-full p-3 shadow-cardLg group">
              <LogoCircular size={120} className="block group-hover:opacity-95 transition-opacity" />
            </Link>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              {tagline}. Verified Ayurveda doctors, classical Panchakarma centres, 150+ medicinal herbs,
              AI-assisted health insights — rooted in God&apos;s Own Country.
            </p>
            {/* Contact bits — only render keys that admin has filled */}
            {(settings['contact.email'] || settings['contact.phone'] || settings['contact.address']) && (
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                {settings['contact.email'] && (
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-400" /><a href={`mailto:${settings['contact.email']}`} className="hover:text-white">{settings['contact.email']}</a></li>
                )}
                {settings['contact.phone'] && (
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-400" /><a href={`tel:${settings['contact.phone'].replace(/\s+/g, '')}`} className="hover:text-white">{settings['contact.phone']}</a></li>
                )}
                {settings['contact.address'] && (
                  <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" /><span>{settings['contact.address']}</span></li>
                )}
              </ul>
            )}
            {(socials.length > 0 || showTwitter) && (
              <div className="flex items-center gap-3 mt-5">
                {socials.map(({ key, icon: Icon, label }) => (
                  <a
                    key={key}
                    href={settings[key]!}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
                {showTwitter && (
                  <a href={settings['social.twitter']!} aria-label="Twitter / X" target="_blank" rel="noreferrer noopener" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-sm font-bold">𝕏</a>
                )}
              </div>
            )}
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-4">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-white/80 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer + trust badges */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-3 text-xs text-white/70 max-w-2xl">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-gold-400 mt-0.5" />
            <p>
              <strong className="text-white">Medical disclaimer:</strong> AyurConnect connects
              you with verified Ayurvedic professionals. Information on this site is for
              educational purposes only and is not a substitute for diagnosis or treatment by a
              qualified BAMS / MD Ayurveda practitioner.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">Verified</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">AYUSH Aligned</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/60 text-center space-y-1">
          <p className="inline-flex items-center justify-center gap-1.5"><MapPin className="w-3 h-3 text-gold-400" /> Ddotsmedia IT Solutions, SHAMS Free Zone, Sharjah, UAE</p>
          <p className="inline-flex items-center justify-center gap-1.5"><Mail   className="w-3 h-3 text-gold-400" /> <a href="mailto:info@ayurconnect.com" className="hover:text-white">info@ayurconnect.com</a></p>
          <p className="text-white/40 pt-2">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
