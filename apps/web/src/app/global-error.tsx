'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 0, margin: 0, background: '#faf8f3' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#155228', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 32, fontWeight: 'bold' }}>A</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#155228', margin: '8px 0' }}>Something went wrong</h1>
            <p style={{ color: '#4a4a42', margin: '8px 0 24px', fontSize: 14 }}>Please refresh the page or try again in a moment.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={reset} style={{ padding: '8px 16px', background: '#155228', color: 'white', border: 0, borderRadius: 6, cursor: 'pointer' }}>Try again</button>
              <a href="/"                                                       style={{ padding: '8px 16px', background: 'white', color: '#155228', border: '1px solid #e5e7eb', borderRadius: 6, textDecoration: 'none' }}>Go home</a>
              <a href="https://wa.me/971509379212" target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#25d366', color: 'white', border: 0, borderRadius: 6, textDecoration: 'none' }}>WhatsApp us</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
