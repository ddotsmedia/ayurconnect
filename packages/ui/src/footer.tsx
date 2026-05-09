import Link from 'next/link'
import { Leaf, Facebook, Instagram, Youtube, Linkedin, ShieldCheck } from 'lucide-react'

const COLS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: 'Directory',
    links: [
      { href: '/doctors',   label: 'Doctors' },
      { href: '/hospitals', label: 'Hospitals & Wellness' },
      { href: '/colleges',  label: 'Medical Colleges' },
      { href: '/herbs',     label: 'Herb Database' },
    ],
  },
  {
    heading: 'Health',
    links: [
      { href: '/ayurbot',  label: 'AyurBot AI' },
      { href: '/tourism',  label: 'Medical Tourism' },
      { href: '/forum',    label: 'Community Forum' },
      { href: '/jobs',     label: 'Ayurveda Jobs' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { href: '/sign-in',  label: 'Sign in' },
      { href: '/sign-in',  label: 'Join free' },
      { href: '/admin',    label: 'Admin' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-kerala-800 text-white mt-20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand col */}
          <div>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-full bg-white text-kerala-700 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </span>
              <span className="font-serif text-2xl">
                <span className="text-white">Ayur</span>
                <span className="text-gold-400">Connect</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Kerala&apos;s #1 Ayurveda platform. Verified CCIM doctors, classical
              Panchakarma centres, 1000+ medicinal herbs, AI-assisted health insights —
              rooted in God&apos;s Own Country.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="Facebook"  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="YouTube"   className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn"  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
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
          © {new Date().getFullYear()} AyurConnect.com — Kerala&apos;s Premier Ayurveda Platform.
        </div>
      </div>
    </footer>
  )
}
