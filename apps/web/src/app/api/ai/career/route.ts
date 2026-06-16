import { NextResponse } from 'next/server'
import { API_INTERNAL } from '../../../../lib/server-fetch'
import { headers as nextHeaders } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
  try {
    const r = await fetch(`${API_INTERNAL}/ai/career`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    })
    if (!r.ok) return NextResponse.json({ reply: 'Sorry, advisor offline right now.' })
    return NextResponse.json(await r.json())
  } catch { return NextResponse.json({ reply: 'Sorry, advisor offline right now.' }) }
}
