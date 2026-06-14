import { headers as nextHeaders } from 'next/headers'
import { API_INTERNAL } from '../../../lib/server-fetch'

export async function portalFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const h = await nextHeaders()
  const cookie = h.get('cookie') ?? ''
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { ...init, headers: { ...(init?.headers ?? {}), cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
}
