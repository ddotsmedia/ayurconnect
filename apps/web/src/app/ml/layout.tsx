import type { Metadata } from 'next'

// Segment layout for /ml/*. Only responsibility: emit the ml-first hreflang
// pairing so every Malayalam page (and the /ml hub) advertises its English
// counterpart consistently. Wraps children unchanged.
//
// Root layout emits en-IN-first defaults (en → /, ml → /ml, x-default → /);
// this layout flips x-default to the /ml hub for Malayalam-segment pages.
export const metadata: Metadata = {
  alternates: {
    languages: {
      'ml-IN':     'https://ayurconnect.com/ml',
      'en-IN':     'https://ayurconnect.com',
      'x-default': 'https://ayurconnect.com/ml',
    },
  },
}

export default function MlLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
