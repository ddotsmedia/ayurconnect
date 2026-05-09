'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Stethoscope, Leaf, MessagesSquare, User } from 'lucide-react'
import { cn } from './lib/utils'

const TABS = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/doctors',  label: 'Doctors',  icon: Stethoscope },
  { href: '/ayurbot',  label: 'AyurBot',  icon: Leaf },
  { href: '/forum',    label: 'Forum',    icon: MessagesSquare },
  { href: '/sign-in',  label: 'Profile',  icon: User },
] as const

const HIDDEN_PREFIXES = ['/admin', '/sign-in']

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/'
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  return (
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
      </ul>
    </nav>
  )
}
