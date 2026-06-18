import { NextResponse } from 'next/server'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  try {
    const r = await fetch(`${API_INTERNAL}/ai/mock-interview`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error('upstream')
    return NextResponse.json(await r.json())
  } catch { return NextResponse.json({ reply: 'Mock interviewer offline. Use the Q&A tab for prepared answers.' }) }
}
