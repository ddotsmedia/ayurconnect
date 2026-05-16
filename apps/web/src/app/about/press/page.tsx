import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Mail, Download, Newspaper, FileText, Image as ImageIcon, Quote } from 'lucide-react'

export const metadata = {
  title: 'Press & Media — AyurConnect Press Kit',
  description: 'Brand assets, fact sheet, recent press coverage, leadership availability for interviews. Media inquiries: press@ayurconnect.com.',
  alternates: { canonical: '/about/press' },
}

const FACTS = [
  { label: 'Founded',                  value: '2024' },
  { label: 'Headquarters',             value: 'Kerala, India' },
  { label: 'verified doctors',    value: '500+' },
  { label: 'Hospitals & wellness centres', value: '200+' },
  { label: 'Herb database',            value: '150+ medicinal herbs with classical citations' },
  { label: 'Languages',                value: 'English + Malayalam (Arabic + Hindi planned)' },
  { label: 'Markets served',           value: 'India primarily; international patients via medical tourism vertical' },
  { label: 'Backbone',                 value: 'Open-source — Next.js, Fastify, PostgreSQL, pgvector, Better Auth' },
]

const QUOTES = [
  {
    quote: 'AyurConnect is the most rigorous Ayurveda directory in India because we refuse to be lazy about verification. Every doctor\'s CCIM number is checked against the public register before they go live — and re-checked annually.',
    attribution: 'AyurConnect Editorial Lead',
  },
  {
    quote: 'We treat Ayurveda the way good journalism treats sources: cite the classical text, cross-check the modern evidence, name the doctor, link to their registration. If we don\'t do this, we end up sounding like the wellness industry we exist to push back against.',
    attribution: 'AyurConnect Clinical Advisory',
  },
]

export default function PressPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Newspaper className="w-3 h-3" /> Press &amp; Media
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Press <span className="text-gold-400">Kit</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            For journalists, podcasters, and broadcasters covering Indian healthcare,
            Kerala medical tourism, or the evidence-based renaissance of classical Ayurveda.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6" /> Fact sheet
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {FACTS.map((f) => (
            <div key={f.label} className="p-4 bg-white rounded-card border border-gray-100">
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{f.label}</div>
              <div className="text-sm text-gray-800 mt-1">{f.value}</div>
            </div>
          ))}
        </div>

        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-3 flex items-center gap-2">
          <Quote className="w-6 h-6" /> On-the-record quotes
        </h2>
        <p className="text-sm text-gray-600 mb-5">Attribute as shown. Lengthier interviews available on request.</p>
        <div className="space-y-4 mb-10">
          {QUOTES.map((q, i) => (
            <blockquote key={i} className="p-5 bg-white rounded-card border-l-4 border-l-kerala-600 border border-gray-100">
              <p className="text-gray-800 italic leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
              <footer className="text-xs text-gold-600 font-semibold mt-3">— {q.attribution}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" /> Brand assets
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Primary logo (SVG)', desc: 'Full-colour, suitable for white backgrounds' },
              { name: 'Logo monochrome (SVG)', desc: 'Single-colour, for limited-palette layouts' },
              { name: 'Logo on dark (PNG)', desc: 'For dark or photographic backgrounds' },
              { name: 'Brand colours', desc: 'Hex codes + Pantone equivalents' },
              { name: 'Typography', desc: 'Cormorant Garamond + Inter — both Google Fonts' },
              { name: 'Logo usage guide', desc: 'Clear-space, minimum size, do\'s and don\'ts' },
            ].map((b) => (
              <div key={b.name} className="p-5 bg-white rounded-card border border-gray-100 shadow-sm">
                <h3 className="font-serif text-base text-kerala-700">{b.name}</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{b.desc}</p>
                <a href="mailto:press@ayurconnect.com?subject=Brand%20Asset%20Request" className="inline-flex items-center gap-1 text-xs text-kerala-700 font-semibold mt-2 hover:underline">
                  <Download className="w-3 h-3" /> Request from press@
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic mt-6">Brand asset downloads ship via email upon request. We track use loosely to learn where AyurConnect is covered.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Story angles we&apos;re happy to support</h2>
        <ul className="space-y-2 text-gray-700">
          {[
            'Kerala medical tourism — how it actually works, who comes, what it costs, what to look out for',
            'verification — what makes a "qualified" Ayurvedic doctor in 2026',
            'Where modern evidence supports classical Ayurveda (and where it doesn\'t)',
            'The wellness-industry problem: how to tell genuine Ayurveda from luxury spa marketing',
            'Postpartum care (Sutika Paricharya) — Kerala\'s 45-day protocol and why diaspora families return for it',
            'AI in Ayurveda — meaningful use cases vs hype',
            'Diaspora Ayurveda — Gulf, UK, US Indian-origin patients returning for treatment',
          ].map((s, i) => (
            <li key={i} className="flex gap-2 text-sm"><ChevronRight className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />{s}</li>
          ))}
        </ul>
      </section>

      <section className="bg-kerala-700 py-14 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Mail className="w-12 h-12 text-gold-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl">Media contact</h2>
          <p className="mt-3 text-white/85">
            Email <a href="mailto:press@ayurconnect.com" className="text-gold-300 hover:text-white">press@ayurconnect.com</a> with your outlet, deadline, and what you&apos;re after.
            We aim to reply within one business day. Clinical advisors are available for expert quotes on 24–48h notice.
          </p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
            Contact form (for non-press) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
