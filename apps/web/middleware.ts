import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/admin', '/dashboard']

// Better Auth session cookie names (with and without the Secure prefix
// browsers add when served over HTTPS).
const SESSION_COOKIE_NAMES = ['better-auth.session_token', '__Secure-better-auth.session_token']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const hasSession = SESSION_COOKIE_NAMES.some((n) => req.cookies.get(n))
  if (!hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  // Role enforcement happens in the admin layout (server component) where we
  // can call into the API; middleware only does the cheap cookie-presence gate.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
