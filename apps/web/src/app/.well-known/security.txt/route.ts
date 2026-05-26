// security.txt — RFC 9116. Tells security researchers how to report vulns.
// Discoverable at /.well-known/security.txt (standard) and /security.txt
// (legacy). Expires field MUST be in the future per spec; we regenerate it
// on every request so it never goes stale.
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export function GET() {
  // Expires must be < 1 year from now per RFC 9116. We set 6 months out.
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString()
  const body = `# AyurConnect — security disclosure policy
# https://www.rfc-editor.org/rfc/rfc9116

Contact: mailto:security@ayurconnect.com
Contact: ${SITE_URL}/contact
Expires: ${expires}
Preferred-Languages: en, ml, hi, ar
Canonical: ${SITE_URL}/.well-known/security.txt
Policy: ${SITE_URL}/about/security-policy
Acknowledgments: ${SITE_URL}/about/security-acknowledgements
Hiring: ${SITE_URL}/careers
`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
