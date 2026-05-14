// Browser-side fetcher for admin endpoints. Always sends credentials so the
// Better Auth session cookie is included.

export class AdminApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    const reason = (() => {
      if (payload && typeof payload === 'object') {
        const p = payload as { error?: string; message?: string; reason?: string }
        return p.error ?? p.message ?? p.reason ?? null
      }
      return null
    })()
    super(reason ? `Admin API ${status} — ${reason}` : `Admin API ${status}`)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Only attach content-type when we're actually sending a body. Fastify
  // rejects requests with content-type=application/json + empty body
  // (FST_ERR_CTP_EMPTY_JSON_BODY → 400), so DELETE/GET shouldn't claim JSON.
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> ?? {}) }
  if (init.body !== undefined && init.body !== null && headers['content-type'] === undefined) {
    headers['content-type'] = 'application/json'
  }

  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init,
    headers,
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
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:    <T>(path: string) =>                 request<T>(path, { method: 'DELETE' }),
}
