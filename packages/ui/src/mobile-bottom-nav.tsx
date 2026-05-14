'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Stethoscope, Leaf, MessagesSquare, MoreHorizontal, X, BookOpen, ScrollText, GraduationCap, MapPin, Briefcase, User, Sparkles } from 'lucide-react'
import { cn } from './lib/utils'

const TABS = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/doctors',  label: 'Doctors',  icon: Stethoscope },
  { href: '/ayurbot',  label: 'AyurBot',  icon: Leaf },
  { href: '/forum',    label: 'Forum',    icon: MessagesSquare },
] as const

// "More" sheet — the long tail that doesn't fit on the bottom bar. Grouped
// so users don't see a flat 12-item list.
const MORE_GROUPS: Array<{ title: string; items: Array<{ href: string; label: string; icon: typeof Home }> }> = [
  {
    title: 'Learn',
    items: [
      { href: '/qa',           label: 'Q&A library',  icon: MessagesSquare },
      { href: '/programs',     label: 'Programs',     icon: Sparkles },
      { href: '/formulary',    label: 'Medicines',    icon: Leaf },
      { href: '/doctor-match', label: 'Doctor Match', icon: Sparkles },
      { href: '/triage',       label: 'Symptom Check', icon: Stethoscope },
      { href: '/articles',     label: 'Articles',     icon: BookOpen },
      { href: '/herbs',        label: 'Herbs',        icon: Leaf },
      { href: '/health-tips',  label: 'Health Tips',  icon: Sparkles },
      { href: '/knowledge',    label: 'Knowledge Hub', icon: ScrollText },
      { href: '/colleges',     label: 'Colleges',     icon: GraduationCap },
    ],
  },
  {
    title: 'Services',
    items: [
      { href: '/hospitals',           label: 'Hospitals',          icon: MapPin },
      { href: '/online-consultation', label: 'Online Consultation', icon: Stethoscope },
      { href: '/jobs',                label: 'Jobs',                icon: Briefcase },
      { href: '/tourism',             label: 'Tourism',             icon: MapPin },
    ],
  },
  {
    title: 'You',
    items: [
      { href: '/sign-in',  label: 'Sign in / Profile', icon: User },
    ],
  },
]

const HIDDEN_PREFIXES = ['/admin', '/sign-in']

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/'
  const [moreOpen, setMoreOpen] = useState(false)
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-cardLg">
        <ul className="grid grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href)
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium',
                    active ? 'text-kerala-700' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'fill-kerala-50')} />
                  {t.label}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="w-full flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-gray-500 hover:text-gray-700"
              aria-label="Open more menu"
            >
              <MoreHorizontal className="w-5 h-5" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close more menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white rounded-t-2xl shadow-cardXl"
            role="dialog"
            aria-label="More navigation"
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-ink">Browse</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {MORE_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[11px] tracking-wider text-gray-400 font-semibold mb-2">{group.title.toUpperCase()}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((it) => {
                      const Icon = it.icon
                      const active = pathname.startsWith(it.href)
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-3 rounded-card border text-[11px] font-medium text-center',
                            active
                              ? 'bg-kerala-50 border-kerala-200 text-kerala-700'
                              : 'bg-white border-gray-100 text-gray-700 hover:border-kerala-200 hover:bg-kerala-50',
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {it.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
