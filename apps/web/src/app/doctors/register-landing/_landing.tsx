import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, ArrowRight, CheckCircle2, Star, Sparkles, MessageCircle, Globe2, Users } from 'lucide-react'

export type LandingProps = {
  audience: string
  title: string
  subtitle: string
  benefits: string[]
  testimonials: { q: string; by: string }[]
  faqs: { q: string; a: string }[]
}

export function RegisterLanding(p: LandingProps) {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <ShieldCheck className="w-3 h-3" /> Free verified profile · KSMC/DHA badge
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">{p.title}</h1>
          <p className="text-white/85 mt-4 text-lg max-w-2xl mx-auto">{p.subtitle}</p>
          <Link href="/doctors/register" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-kerala-800 font-bold rounded-md hover:bg-white/90">
            Register Free — 3 minutes <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/70 text-xs mt-3">No setup fee · No contract · {p.audience}</p>
        </div>
      </GradientHero>

      <section className="bg-gradient-to-r from-kerala-50 via-cream to-amber-50 border-y border-kerala-100">
        <div className="container mx-auto px-4 py-6 grid grid-cols-4 gap-4 text-center">
          <Stat n="500+" l="verified doctors" />
          <Stat n="15+"  l="markets" />
          <Stat n="120K+" l="WhatsApp community" />
          <Stat n="3 min" l="registration" />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="font-serif text-3xl text-ink text-center">Why list on AyurConnect?</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {p.benefits.map((b) => (
            <article key={b} className="flex items-start gap-2 bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800">{b}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-kerala-50 border-y border-kerala-100">
        <div className="container mx-auto px-4 py-12">
          <h2 className="font-serif text-3xl text-ink text-center">What doctors are saying</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {p.testimonials.map((t) => (
              <article key={t.by} className="bg-white border border-kerala-200 rounded-card p-5 shadow-card">
                <Star className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-gray-800 italic mt-2">&ldquo;{t.q}&rdquo;</p>
                <p className="text-xs text-gray-500 mt-3">— {t.by}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="font-serif text-3xl text-ink text-center">FAQ</h2>
        <div className="mt-8 space-y-3">
          {p.faqs.map((f) => (
            <details key={f.q} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <summary className="font-semibold text-ink cursor-pointer">{f.q}</summary>
              <p className="text-sm text-gray-700 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 text-center">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="font-serif text-3xl text-ink mt-3">Ready to claim your free verified profile?</h2>
        <Link href="/doctors/register" className="mt-5 inline-flex items-center gap-2 px-8 py-3 bg-kerala-700 hover:bg-kerala-800 text-white font-bold rounded-md">
          Register Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer trust strip */}
      <section className="bg-cream border-t border-gray-100 py-6">
        <div className="container mx-auto px-4 grid grid-cols-3 gap-4 text-center text-xs text-gray-700 max-w-3xl">
          <div><MessageCircle className="w-5 h-5 text-kerala-700 mx-auto" /> WhatsApp integrated</div>
          <div><Globe2        className="w-5 h-5 text-kerala-700 mx-auto" /> Patient leads from 15+ countries</div>
          <div><Users         className="w-5 h-5 text-kerala-700 mx-auto" /> Built for Ayurveda doctors</div>
        </div>
      </section>
    </>
  )
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div><p className="font-serif text-2xl md:text-3xl text-kerala-700">{n}</p><p className="text-[11px] text-gray-700">{l}</p></div>
}
