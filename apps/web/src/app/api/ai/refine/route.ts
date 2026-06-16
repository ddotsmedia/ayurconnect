import { NextResponse } from 'next/server'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { headers as nextHeaders } from 'next/headers'

// Proxies to API /ai/refine which uses Haiku (cheap, fast).
// On API failure, returns the original text unchanged.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/ai/refine`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    })
    if (!r.ok) return NextResponse.json({ text: body.text ?? '' })
    return NextResponse.json(await r.json())
  } catch {
    return NextResponse.json({ text: body.text ?? '' })
  }
}
