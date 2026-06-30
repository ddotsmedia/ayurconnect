'use client'

// Inline QR — pure SVG, no deps. Renders an actual scannable QR via a
// public, lazy-loaded API as a fallback if no real lib is present; here we
// use a deterministic visual matrix (NOT scannable) for offline safety,
// matching the existing "fakeQrGrid" pattern used elsewhere in the app.
// Swap with a real QR lib later if we need scannability from a print copy.

import { useMemo } from 'react'

const SIZE = 33

function gridFor(seed: string): boolean[][] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const grid: boolean[][] = []
  for (let y = 0; y < SIZE; y++) {
    grid[y] = []
    for (let x = 0; x < SIZE; x++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff
      grid[y][x] = (h & 1) === 1
    }
  }
  const finder = (cx: number, cy: number) => {
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const ax = cx + x, ay = cy + y
      if (ax < 0 || ay < 0 || ax >= SIZE || ay >= SIZE) continue
      const on = Math.abs(x) === 3 || Math.abs(y) === 3 || (Math.abs(x) <= 1 && Math.abs(y) <= 1)
      grid[ay][ax] = on
    }
  }
  finder(3, 3); finder(SIZE - 4, 3); finder(3, SIZE - 4)
  return grid
}

export function CardClient({ profileUrl }: { profileUrl: string }) {
  const grid = useMemo(() => gridFor(profileUrl), [profileUrl])
  const px = 3
  return (
    <svg width={SIZE * px} height={SIZE * px} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label="QR to profile" className="block">
      <rect width={SIZE} height={SIZE} fill="#fff" />
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#155228" /> : null))}
    </svg>
  )
}
