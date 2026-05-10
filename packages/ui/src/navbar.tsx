'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from './lib/utils'
import { LangToggle } from './lang-toggle'
import { t, type Lang } from './i18n'
import { LogoLockup, LogoMark } from './logo'

function readLangCookie(): Lang {
  if (typeof document === 'undefined') return 'en'
  const m = document.cookie.match(/(?:^|;\s*)lang=(en|ml)/)
  return (m?.[1] as Lang) ?? 'en'
}

const TOP_SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Manasika']
const TOP_DISTRICTS = ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kottayam', 'Malappuram']

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const tr = t(lang)

  const NAV_LINKS = [
    { href: '/doctors',   label: tr.nav.doctors,   hasMega: true  },
    { href: '/hospitals', label: tr.nav.hospitals, hasMega: false },
    { href: '/herbs',     label: tr.nav.herbs,     hasMega: false },
    { href: '/ayurbot',   label: tr.nav.ayurbot,   hasMega: false },
    { href: '/forum',     label: tr.nav.forum,     hasMega: false },
    { href: '/jobs',      label: tr.nav.jobs,      hasMega: false },
    { href: '/tourism',   label: tr.nav.tourism,   hasMega: false },
  ]

  useEffect(() => {
    setLang(readLangCookie())
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-40 w-full transition-all',
          scrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm'
            : 'bg-white border-b border-gray-100',
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo lockup */}
            <Link href="/" className="group" aria-label="AyurConnect home">
              <LogoLockup className="group-hover:opacity-90 transition-opacity" />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.hasMega ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-kerala-700 transition-colors"
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Link>
                    {megaOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[640px] animate-slide-up">
                        <div className="bg-white shadow-cardLg rounded-card border border-gray-100 grid grid-cols-2 gap-6 p-6">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{tr.nav.bySpec}</h4>
                            <ul className="space-y-1.5">
                              {TOP_SPECS.map((s) => (
                                <li key={s}>
                                  <Link href={`/doctors?specialization=${encodeURIComponent(s)}`} className="text-sm text-gray-700 hover:text-kerala-700">
                                    {s}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{tr.nav.byDistrict}</h4>
                            <ul className="space-y-1.5">
                              {TOP_DISTRICTS.map((d) => (
                                <li key={d}>
                                  <Link href={`/doctors?district=${encodeURIComponent(d)}`} className="text-sm text-gray-700 hover:text-kerala-700">
                                    {d}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="col-span-2 pt-3 border-t border-gray-100">
                            <Link href="/doctors" className="text-sm font-medium text-kerala-700 hover:underline">
                              {tr.nav.viewAll} →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm text-gray-700 hover:text-kerala-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            {/* Auth buttons + lang (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <LangToggle className="mr-1" />
              <Link href="/sign-in" className="px-3 py-1.5 text-sm text-gray-700 hover:text-kerala-700 transition-colors">
                {tr.nav.login}
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-semibold bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
              >
                {tr.nav.joinFree}
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-gray-700 hover:text-kerala-700"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-cardXl flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="inline-flex items-center gap-2">
                <LogoMark className="h-7 w-7" />
                <span className="font-serif text-xl text-kerala-700">{tr.nav.menu}</span>
              </span>
              <div className="flex items-center gap-2">
                <LangToggle />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded text-gray-800 hover:bg-kerala-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/colleges"
                className="block px-3 py-2.5 rounded text-gray-800 hover:bg-kerala-50"
                onClick={() => setMobileOpen(false)}
              >
                Colleges
              </Link>
            </nav>
            <div className="p-4 border-t space-y-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="block w-full px-4 py-2 text-center text-kerala-700 border border-kerala-600 rounded-md hover:bg-kerala-50"
              >
                {tr.nav.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full px-4 py-2 text-center bg-gold-500 text-white rounded-md hover:bg-gold-600"
              >
                {tr.nav.joinFree}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
