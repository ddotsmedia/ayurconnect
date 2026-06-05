import { faqLd, ldGraph } from '../../lib/seo'

type FaqItem = { q: string; a: string }

export function FaqAccordion({ heading = 'Frequently asked questions', items }: { heading?: string; items: FaqItem[] }) {
  const ld = ldGraph(faqLd(items))
  return (
    <section className="container mx-auto px-4 py-10 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h2 className="font-serif text-2xl text-ink mb-4">{heading}</h2>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.q}>
            <details className="group bg-white border border-gray-100 rounded-card shadow-card open:shadow-cardLg">
              <summary className="cursor-pointer list-none px-5 py-3 flex items-start justify-between gap-3 font-semibold text-ink">
                <span>{it.q}</span>
                <span className="text-kerala-700 group-open:rotate-45 transition-transform text-xl leading-none mt-0.5">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed">{it.a}</div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
