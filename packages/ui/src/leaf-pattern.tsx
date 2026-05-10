import * as React from 'react'

// Decorative repeating leaf pattern that matches the logo's leaf shape.
// Use as an absolutely-positioned overlay inside dark heroes, section
// backgrounds, etc. Renders as a tiled SVG via background-image so it stays
// crisp at any size and costs ~0 KB beyond the inline data URL.
//
// Tip: keep it subtle. Default opacity is 0.06 — bump to 0.10 for stronger
// presence on solid backgrounds.

export function LeafPattern({
  className = '',
  color = '#5fc063',
  opacity = 0.08,
  tile = 60,
}: {
  className?: string
  color?: string
  opacity?: number
  tile?: number
}) {
  const id = React.useId().replace(/:/g, '_')
  const svg =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tile} ${tile}" width="${tile}" height="${tile}">` +
    `<g fill="${color}" opacity="${opacity}">` +
    // four leaves rotated so the tile reads as a soft scatter, not a grid
    `<ellipse cx="15" cy="15" rx="3" ry="6" transform="rotate(-25 15 15)"/>` +
    `<ellipse cx="45" cy="20" rx="3" ry="6" transform="rotate(15 45 20)"/>` +
    `<ellipse cx="20" cy="42" rx="3" ry="6" transform="rotate(40 20 42)"/>` +
    `<ellipse cx="48" cy="48" rx="3" ry="6" transform="rotate(-15 48 48)"/>` +
    `</g></svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  return (
    <div
      aria-hidden
      data-pattern-id={id}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: url, backgroundSize: `${tile}px ${tile}px` }}
    />
  )
}
