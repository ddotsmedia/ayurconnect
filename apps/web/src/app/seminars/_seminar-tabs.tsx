'use client'

import Link from 'next/link'

export function SeminarTabs({ active }: { active: 'upcoming' | 'past' }) {
  return (
    <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm mb-6">
      <Link href="/seminars" scroll={false} className={'px-4 py-1.5 rounded ' + (active === 'upcoming' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
        Upcoming
      </Link>
      <Link href="/seminars?tab=past" scroll={false} className={'px-4 py-1.5 rounded ' + (active === 'past' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
        Past
      </Link>
    </nav>
  )
}
