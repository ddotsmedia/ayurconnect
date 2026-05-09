import type { ReactNode } from 'react'
import { cn } from './lib/utils'

const VARIANTS = {
  green:    'bg-hero-green',
  tourism:  'bg-hero-tourism',
  forum:    'bg-hero-forum',
  jobs:     'bg-hero-jobs',
  bot:      'bg-hero-bot',
  hospital: 'bg-hero-hospital',
} as const

export type HeroVariant = keyof typeof VARIANTS

export function GradientHero({
  variant = 'green',
  children,
  className,
  size = 'lg',
}: {
  variant?: HeroVariant
  size?: 'lg' | 'md'
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        VARIANTS[variant],
        'relative overflow-hidden text-white',
        size === 'lg' ? 'py-20 md:py-28' : 'py-12 md:py-16',
        className,
      )}
    >
      {/* leaf-pattern overlay (very subtle) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='1.5' fill='white'/></svg>\")",
        }}
      />
      <div className="relative container mx-auto px-4">{children}</div>
    </section>
  )
}
