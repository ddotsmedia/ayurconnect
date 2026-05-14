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

const COLS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: 'Directory',
    links: [
      { href: '/doctors',     label: 'Doctors' },
      { href: '/hospitals',   label: 'Hospitals & Wellness' },
      { href: '/colleges',    label: 'Medical Colleges' },
      { href: '/herbs',       label: 'Herb Database' },
      { href: '/treatments',  label: 'Specialised Treatments' },
    ],
  },
  {
    heading: 'Health',
    links: [
      { href: '/online-consultation', label: 'Online Consultation' },
      { href: '/ayurbot',             label: 'AyurBot AI' },
      { href: '/prakriti-quiz',       label: 'Prakriti Quiz' },
      { href: '/wellness-check',      label: 'Wellness Check' },
      { href: '/diet-planner',        label: 'AI Diet Planner' },
      { href: '/tourism',             label: 'Medical Tourism' },
      { href: '/cost-estimator',      label: 'Cost Estimator' },
      { href: '/case-studies',        label: 'Case Studies' },
    ],
  },
  {
    heading: 'About',
    links: [
      { href: '/about',                    label: 'About AyurConnect' },
      { href: '/about/methodology',        label: 'Our Methodology' },
      { href: '/about/why-ayurveda-works', label: 'Why Ayurveda Works' },
      { href: '/about/certifications',     label: 'Certifications' },
      { href: '/about/press',              label: 'Press & Media' },
      { href: '/about/investors',          label: 'Investor Relations' },
      { href: '/research',                 label: 'Clinical Research' },
      { href: '/knowledge',                label: 'Knowledge Hub' },
      { href: '/amai',                     label: 'Ayurveda Medical Association of India' },
    ],
  },
  {
    heading: 'For Business',
    links: [
      { href: '/marketplace',     label: 'Marketplace' },
      { href: '/academy',         label: 'Academy' },
      { href: '/products/hms',    label: 'AyurConnect HMS' },
      { href: '/products/saas',   label: 'White-label SaaS' },
      { href: '/products/mobile', label: 'Mobile Apps' },
      { href: '/roi-calculator',  label: 'ROI Calculator' },
      { href: '/partnership',     label: 'Partnership' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { href: '/contact',     label: 'Contact us' },
      { href: '/sign-in',     label: 'Sign in' },
      { href: '/register',    label: 'Join free' },
      { href: '/privacy',     label: 'Privacy' },
      { href: '/terms',       label: 'Terms' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand col */}
          <div>
            <Link href="/" aria-label="AyurConnect home" className="inline-block bg-white rounded-full p-3 shadow-cardLg group">
              <LogoCircular size={120} className="block group-hover:opacity-95 transition-opacity" />
            </Link>
            <p className="mt-5 text-sm text-white/70 leading-relaxed">
              {tagline}. Verified CCIM doctors, classical Panchakarma centres, 150+ medicinal herbs,
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
              you with CCIM-verified Ayurvedic professionals. Information on this site is for
              educational purposes only and is not a substitute for diagnosis or treatment by a
              qualified BAMS / MD Ayurveda practitioner.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">CCIM Verified</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">AYUSH Aligned</span>
          </div>
        </div>

        <div className="mt-8 text-xs text-white/50 text-center">
          {copyright}
        </div>
      </div>
    </footer>
  )
}
