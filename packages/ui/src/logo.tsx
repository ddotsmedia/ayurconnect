import * as React from 'react'

// AyurConnect logo recreated as inline SVG so it scales crisply at any size
// and never produces a broken-image flash. Three variants:
//
//   <LogoMark   />  — just the tree + soil mark (square viewBox 200×200)
//   <LogoLockup />  — mark on left + "Ayur Connect" wordmark on right (horizontal)
//   <LogoCircular/> — mark with the wordmark curved around the bottom (matches
//                     the official badge layout — for footer / hero / OG image)
//
// Colors come from the brand palette (kerala-900 deep green for the tree, leaf-500
// vivid lime for the soil bands). Both are defined in tailwind.config.js.

const DARK = '#155228'   // logo dark forest green (also kerala-800)
const LIGHT = '#3da041'  // logo bright leaf green (also leaf-500)

// ─── tree mark ────────────────────────────────────────────────────────────
function TreeMark({ dark = DARK, light = LIGHT }: { dark?: string; light?: string }) {
  return (
    <g>
      {/* central trunk + 3 tiers of branching limbs */}
      <path
        d="M100 30
           L100 145
           M100 50  L82  35  M100 50 L118 35
           M100 70  L70  55  M100 70 L130 55
           M100 95  L60  78  M100 95 L140 78
           M100 120 L70 108  M100 120 L130 108"
        stroke={dark}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* leaves — small almond shapes scattered across the canopy */}
      {[
        // y, x offsets for clusters
        { x: 78,  y: 42, r: -28 }, { x: 122, y: 42, r: 28 },
        { x: 90,  y: 50, r: -10 }, { x: 110, y: 50, r: 10 },
        { x: 66,  y: 60, r: -32 }, { x: 134, y: 60, r: 32 },
        { x: 80,  y: 65, r: -18 }, { x: 120, y: 65, r: 18 },
        { x: 100, y: 65, r: 0  },
        { x: 56,  y: 80, r: -34 }, { x: 144, y: 80, r: 34 },
        { x: 72,  y: 86, r: -20 }, { x: 128, y: 86, r: 20 },
        { x: 90,  y: 88, r: -8  }, { x: 110, y: 88, r: 8  },
        { x: 66,  y: 102, r: -22 }, { x: 134, y: 102, r: 22 },
        { x: 82,  y: 108, r: -10 }, { x: 118, y: 108, r: 10 },
        { x: 100, y: 100, r: 0   },
        { x: 92,  y: 122, r: -8  }, { x: 108, y: 122, r: 8  },
        { x: 78,  y: 128, r: -16 }, { x: 122, y: 128, r: 16 },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx="3"
          ry="6"
          fill={light}
          transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
        />
      ))}
      {/* soil — three nested concave bands */}
      <path d="M40 158 Q100 130 160 158" stroke={dark}  strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M55 168 Q100 148 145 168" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M70 178 Q100 165 130 178" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  )
}

// ─── compact mark — for navbar, favicons, small spots ────────────────────
export function LogoMark({ className = '', title = 'AyurConnect' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <TreeMark />
    </svg>
  )
}

// ─── lockup — mark + horizontal wordmark, for navbar & headers ───────────
export function LogoLockup({ className = '', tagline }: { className?: string; tagline?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-9 flex-shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-2xl tracking-tight">
          <span style={{ color: DARK }} className="font-semibold">Ayur</span>
          <span style={{ color: LIGHT }} className="font-semibold">Connect</span>
        </span>
        {tagline && <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">{tagline}</span>}
      </span>
    </span>
  )
}

// ─── circular badge — mark with wordmark curved around the bottom ────────
//      For footer / about page / OG image. Matches the official badge.
export function LogoCircular({ className = '', size = 200 }: { className?: string; size?: number }) {
  const cx = 100
  const cy = 100
  const id = React.useId()
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      role="img"
      aria-label="AyurConnect"
      className={className}
    >
      <title>AyurConnect</title>
      <TreeMark />
      {/* invisible arc that the wordmark text follows */}
      <defs>
        <path id={id} d={`M ${cx - 78} ${cy + 50} A 78 78 0 0 0 ${cx + 78} ${cy + 50}`} />
      </defs>
      <text fill={DARK} fontSize="18" fontWeight="700" letterSpacing="0.5" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          Ayur Connect
        </textPath>
      </text>
    </svg>
  )
}

export default LogoMark
