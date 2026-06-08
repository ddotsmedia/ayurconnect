export const metadata = {
  robots: { index: false, follow: false },  // private booking flows — never indexable
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
