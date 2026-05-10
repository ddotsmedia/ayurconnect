// Google Maps link-out helpers. No API key required for plain links.
// We don't embed Maps (avoids extra script load + cookie banner). Instead,
// any "view on map" / "directions" button calls one of these helpers.
//
// If the user later wants embeds, set NEXT_PUBLIC_GOOGLE_MAPS_KEY and add an
// <iframe> using mapsEmbedUrl().

export function mapsSearchUrl(query: string): string {
  const q = encodeURIComponent(query)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function mapsDirectionsUrl(destination: string, origin?: string): string {
  const d = encodeURIComponent(destination)
  const o = origin ? `&origin=${encodeURIComponent(origin)}` : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${d}${o}`
}

export function mapsLatLngUrl(lat: number, lng: number, label?: string): string {
  const q = label ? `${encodeURIComponent(label)}@${lat},${lng}` : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function mapsEmbedUrl(query: string, key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY): string | null {
  if (!key) return null
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`
}
