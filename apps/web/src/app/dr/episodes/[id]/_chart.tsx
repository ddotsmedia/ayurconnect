'use client'

type Log = { id: string; date: string; severity: number; energy: number | null; sleepQuality: number | null; mood: number | null; note: string | null }

export function DrTrendChart({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <section className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
        <p className="text-gray-700">No trend data yet — patient hasn&apos;t logged a check-in.</p>
      </section>
    )
  }
  const recent = logs.slice(-60)
  const W = 880, H = 240, padX = 32, padY = 18
  const step = recent.length > 1 ? (W - 2 * padX) / (recent.length - 1) : 0
  const yOf = (v: number | null) => v == null ? null : padY + (H - 2 * padY) * (1 - v / 10)
  const seriesDef: Array<{ key: keyof Log; label: string; colour: string }> = [
    { key: 'severity',     label: 'Severity',      colour: '#dc2626' },
    { key: 'energy',       label: 'Energy',        colour: '#0891b2' },
    { key: 'sleepQuality', label: 'Sleep quality', colour: '#7c3aed' },
    { key: 'mood',         label: 'Mood',          colour: '#15803d' },
  ]
  const pathFor = (key: keyof Log): string => {
    const pts: string[] = []
    recent.forEach((l, i) => {
      const v = l[key] as number | null
      const y = yOf(v)
      if (y === null) return
      const x = padX + step * i
      pts.push((pts.length === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1))
    })
    return pts.join(' ')
  }
  return (
    <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <header className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="font-serif text-lg text-ink">Severity trend ({recent.length} log{recent.length === 1 ? '' : 's'})</h2>
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-700">
          {seriesDef.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5" style={{ backgroundColor: s.colour }} /> {s.label}
            </span>
          ))}
        </div>
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0, 5, 10].map((y) => {
          const yy = yOf(y)!
          return <line key={y} x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 3" />
        })}
        <text x={4} y={yOf(0)! + 4}  fontSize={9} fill="#9ca3af">0</text>
        <text x={4} y={yOf(5)! + 4}  fontSize={9} fill="#9ca3af">5</text>
        <text x={4} y={yOf(10)! + 4} fontSize={9} fill="#9ca3af">10</text>
        {seriesDef.map((s) => (
          <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.colour} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <p className="text-[11px] text-gray-500 mt-2">
        First → last: {new Date(recent[0]!.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        {' → '}
        {new Date(recent[recent.length - 1]!.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </section>
  )
}
