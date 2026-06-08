export const metadata = {
  robots: { index: false, follow: false },  // active consultation rooms — never indexable
}

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return children
}
