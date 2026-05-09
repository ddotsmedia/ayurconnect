// Browser-side fetcher for admin endpoints. Always sends credentials so the
// Better Auth session cookie is included.

export class AdminApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`Admin API ${status}`)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new AdminApiError(res.status, body)
  return body as T
}

export const adminApi = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:    <T>(path: string) =>                 request<T>(path, { method: 'DELETE' }),
}
