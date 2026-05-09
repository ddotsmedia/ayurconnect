import { headers as nextHeaders } from 'next/headers'
import { API_INTERNAL as API } from './server-fetch'

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified?: boolean
  image?: string | null
}

export type ServerSession = {
  user: SessionUser
  session: { id: string; userId: string; expiresAt: string }
} | null

export async function getServerSession(): Promise<ServerSession> {
  const h = await nextHeaders()
  const cookie = h.get('cookie') ?? ''
  if (!cookie) return null

  try {
    const res = await fetch(`${API}/auth/get-session`, {
      headers: { cookie },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as ServerSession
    return data?.user ? data : null
  } catch {
    return null
  }
}

export async function requireAdminSession(): Promise<NonNullable<ServerSession>> {
  const sess = await getServerSession()
  if (!sess) throw new Response('redirect:/sign-in', { status: 401 })
  if (sess.user.role !== 'ADMIN') throw new Response('forbidden', { status: 403 })
  return sess
}
