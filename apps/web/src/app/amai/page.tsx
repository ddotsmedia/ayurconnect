import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { GradientHero } from '@ayurconnect/ui'
import {
  Users, CalendarDays, Network, MapPin, Mail, Phone, Globe, Facebook, Twitter, Youtube,
  ChevronRight, ShieldCheck, Award, Building2, BookOpen, Scale, GraduationCap, FlaskConical,
  Sprout, Newspaper, HeartHandshake, AlertTriangle, ExternalLink, Sparkles, Briefcase,
} from 'lucide-react'
import { breadcrumbLd, faqLd, ldGraph, pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  path:  '/amai',
  title: 'AMAI — Ayurveda Medical Association of India | AyurConnect',
  description: 'Official AMAI page on AyurConnect. Learn about the Ayurveda Medical Association of India — Kerala\'s largest organization of 10,000+ qualified Ayurveda doctors since 1978. Membership, events, leadership, initiatives.',
  keywords: ['AMAI', 'Ayurveda Medical Association of India', 'Kerala ayurveda doctors', 'BAMS association', 'AMAI membership', 'Angamaly ayurveda', 'AMARF', 'AMAI Vanitha', 'AMAI Yuvatha'],
})

const STATS = [
  { label: '10,000+', sub: 'Members' },
  { label: '14',      sub: 'District Committees' },
  { label: '1978',    sub: 'Founded' },
  { label: '47+',     sub: 'Annual Conferences' },
]

const LEADERSHIP = [
  { role: 'President',         name: 'Dr. Leena C D',       phone: '+91 9847320018', email: 'drleena63@gmail.com',  icon: Award },
  { role: 'General Secretary', name: 'Dr. Ajith Kumar K C', phone: '+91 9446564345', email: 'office.amai@gmail.com', icon: Briefcase },
]

const STRUCTURE = [
  { name: 'Kerala State Committee',        d: 'Apex governing body of AMAI at the state level.' },
  { name: 'State Executive Committee',     d: 'Day-to-day operations, policy, and rapid response.' },
  { name: 'Zone Committees',               d: 'Regional coordination across multi-district zones.' },
  { name: 'District Committees',           d: 'Active in all 14 Kerala districts — local membership, CME, advocacy.' },
  { name: 'Area Committees',               d: 'Taluk and panchayat-level grass-roots presence.' },
  { name: 'AMAI Vanitha',                  d: 'Women doctors\' sub-committee — clinics, advocacy, support.' },
  { name: 'AMAI Yuvatha',                  d: 'Youth + student wing for college members and young practitioners.' },
  { name: 'APTA Editorial Board',          d: 'Editorial governance of the official AMAI journal/magazine.' },
]

const WINGS = [
  { name: 'AMAI Foundation',           icon: HeartHandshake, d: 'Welfare and community programmes for members and the public.' },
  { name: 'AMAI Research Foundation (AMARF)', icon: FlaskConical, d: 'Clinical research arm — diabetes survey programmes, treatment outcome studies.' },
  { name: 'AMAI Academy',              icon: GraduationCap, d: 'PSC Medical Officer (Ayurveda) coaching, CME programmes, examination guidance.' },
  { name: 'AMAI Vanitha',              icon: Users,         d: 'Women doctors\' wing; runs Vanitha Clinic and women\'s health programmes.' },
  { name: 'AMAI Yuvatha',              icon: Sparkles,      d: 'Youth and student wing — mentorship, leadership, college chapters.' },
  { name: 'AMAI Against Quacks',       icon: ShieldCheck,   d: 'Public-protection campaign against unqualified practitioners.' },
  { name: 'Aswas Relief Fund',         icon: HeartHandshake, d: 'Welfare support fund for members and families in distress.' },
  { name: 'APTA Journal',              icon: Newspaper,     d: 'Official journal / magazine — peer-reviewed clinical + organisational content.' },
  { name: 'Ayush Gramam',              icon: Sprout,        d: 'Medicinal plant cultivation + tribal empowerment programmes.' },
  { name: 'Know Your Herbs',           icon: BookOpen,      d: 'Educational herb-awareness series — Panikoorka, Thumba, Shankupushpam, etc.' },
]

const FAQ = [
  { q: 'When and where was AMAI founded?',
    a: 'AMAI was formed on 14 February 1978 at Guruvayoor by uniting two earlier organisations — the Ayurveda Medical Association (AMA) in northern Kerala and the National Ayurveda Medical Association (NAMA) in southern Kerala. The first combined state conference was held on 13 August 1978 at Thrissur.' },
  { q: 'Who can become a member of AMAI?',
    a: 'Membership is open to all qualified Ayurveda professionals — government medical officers, private practitioners, manufacturing physicians, hospital-employed doctors, Ayurveda college teachers, PG scholars, and students.' },
  { q: 'How do I apply for AMAI membership?',
    a: 'Apply at amaiapp.ayurveda-amai.org or contact your district or area committee office bearers. Forms are also downloadable on the official AMAI website.' },
  { q: 'What is the AMAI headquarters address?',
    a: 'Ayurveda Bhavan, P.B. No 93, Angamaly 683572, Kerala, India.' },
  { q: 'What does AMAI do to fight quackery?',
    a: 'The "AMAI Against Quacks" campaign coordinates with regulators and the public to identify and act against unqualified practitioners misrepresenting themselves as Ayurveda doctors. AMAI also won the Kerala Medical Practitioners Bill battle, securing practice rights exclusively for registered medical practitioners.' },
]

const RESOURCES = [
  { label: 'Medical Ethics',                href: 'https://ayurveda-amai.org/category/medical-ethics/' },
  { label: 'Legal Issues',                  href: 'https://ayurveda-amai.org/category/legal-issues/' },
  { label: 'E-Submission of Form C',        href: 'https://ayurveda-amai.org/' },
  { label: "President's Blog",              href: 'https://ayurveda-amai.org/category/presidents-blog/' },
  { label: "General Secretary's Blog",      href: 'https://ayurveda-amai.org/category/general-secretarys-blog/' },
  { label: 'Ayurveda for Social Health',    href: 'https://ayurveda-amai.org/category/ayurveda-for-social-health/' },
  { label: 'Ayurveda Medical Colleges in Kerala', href: 'https://ayurveda-amai.org/category/ayurveda-medical-colleges-in-kerala/' },
  { label: 'Downloads — forms, books, bylaws', href: 'https://ayurveda-amai.org/category/downloads/' },
]

const SOCIAL = [
  { label: 'Facebook',     icon: Facebook, href: 'https://www.facebook.com/ayurvedaamai/',                   sub: '15,000+ followers' },
  { label: 'Twitter / X',  icon: Twitter,  href: 'https://twitter.com/_AyurvedaIndia',                       sub: '@_AyurvedaIndia' },
  { label: 'YouTube',      icon: Youtube,  href: 'https://www.youtube.com/channel/UCOXTnXJT-xkBIEnNMNsjdFw', sub: 'Official channel' },
  { label: 'Website',      icon: Globe,    href: 'https://ayurveda-amai.org',                                sub: 'ayurveda-amai.org' },
  { label: 'Membership',   icon: ShieldCheck, href: 'https://amaiapp.ayurveda-amai.org/',                    sub: 'Apply / login' },
]

export default function AmaiPage() {
  const ld = ldGraph(
    {
      '@context': 'https://schema.org',
      '@type':    ['MedicalOrganization', 'Organization'],
      name:       'Ayurveda Medical Association of India',
      alternateName: 'AMAI',
      url:        'https://ayurveda-amai.org',
      logo:       'https://ayurconnect.com/amai-logo.svg',
      foundingDate: '1978-02-14',
      foundingLocation: { '@type': 'Place', name: 'Guruvayoor, Kerala, India' },
      address: {
        '@type':         'PostalAddress',
        streetAddress:   'Ayurveda Bhavan, P.B. No 93',
        addressLocality: 'Angamaly',
        postalCode:      '683572',
        addressRegion:   'Kerala',
        addressCountry:  'IN',
      },
      sameAs: SOCIAL.map((s) => s.href),
      employee: LEADERSHIP.map((l) => ({
        '@type':   'Person',
        name:      l.name,
        jobTitle:  l.role,
        email:     l.email,
        telephone: l.phone,
      })),
    },
    faqLd(FAQ),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'AMAI', url: '/amai' },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto bg-white/95 rounded-2xl p-4 inline-flex items-center justify-center shadow-cardLg mb-5">
            <Image src="/amai-logo.svg" alt="AMAI — Ayurveda Medical Association of India logo" width={72} height={100} priority className="h-24 w-auto" />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <ShieldCheck className="w-3 h-3" /> Kerala&apos;s largest Ayurveda medical association
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">Ayurveda Medical Association of India</h1>
          <p className="mt-3 text-lg md:text-xl text-white/90 font-semibold">AMAI</p>
          <p className="mt-5 text-base md:text-lg text-white/85 max-w-3xl mx-auto">
            Kerala&apos;s largest organisation of qualified Ayurveda doctors since 1978. The universal voice and umbrella platform of private practitioners, academicians, government doctors, researchers, manufacturing physicians, PG scholars and students.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.sub} className="bg-white/10 backdrop-blur border border-white/20 rounded-card px-4 py-3">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.label}</p>
                <p className="text-xs uppercase tracking-wider text-white/75 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </GradientHero>

      {/* About / History */}
      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-4 inline-flex items-center gap-2">
          <Building2 className="w-7 h-7 text-kerala-700" /> About AMAI
        </h2>
        <p className="text-gray-700 leading-relaxed">
          AMAI was formed on <strong>14 February 1978 at Guruvayoor</strong> by uniting two earlier organisations — the
          <strong> Ayurveda Medical Association (AMA)</strong> in northern Kerala and the
          <strong> National Ayurveda Medical Association (NAMA)</strong> in southern Kerala.
          The first combined state conference was held on <strong>13 August 1978 at Thrissur</strong>.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          First elected leaders: <strong>Dr. NS Narayanan Nair</strong> (President), <strong>Dr. CK Divakaran</strong> (General Secretary),
          <strong> Dr. M. Gopalakrishnan</strong> (Treasurer).
        </p>

        <h3 className="font-serif text-xl text-ink mt-8 mb-2 inline-flex items-center gap-2">
          <Scale className="w-5 h-5 text-kerala-700" /> Key milestone
        </h3>
        <p className="text-gray-700 leading-relaxed">
          AMAI won the landmark <strong>Kerala Medical Practitioners Bill</strong> battle — securing practice rights
          <strong> exclusively for registered medical practitioners</strong>, a legal victory that continues to define the rights of qualified Ayurveda doctors today.
        </p>

        <h3 className="font-serif text-xl text-ink mt-8 mb-2">Mission</h3>
        <ul className="text-gray-700 leading-relaxed space-y-1.5 list-disc pl-5">
          <li>Promote quality Ayurveda for public health.</li>
          <li>Protect the rights and interests of qualified Ayurveda professionals.</li>
          <li>Fight quackery and unqualified practice.</li>
          <li>Advance research, education, and the scientific footing of classical Ayurveda.</li>
        </ul>
      </section>

      {/* Leadership */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">Current leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEADERSHIP.map((l) => (
              <article key={l.role} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 inline-flex items-center justify-center">
                    <l.icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">{l.role}</p>
                    <h3 className="font-serif text-lg text-ink">{l.name}</h3>
                    <p className="text-xs text-gray-700 mt-2 inline-flex items-center gap-1"><Phone className="w-3 h-3" /> <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="hover:underline">{l.phone}</a></p>
                    <p className="text-xs text-gray-700 mt-1 inline-flex items-center gap-1"><Mail className="w-3 h-3" /> <a href={`mailto:${l.email}`} className="hover:underline break-all">{l.email}</a></p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <article className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> Headquarters</p>
            <p className="font-serif text-lg text-ink mt-1">Ayurveda Bhavan</p>
            <p className="text-sm text-gray-700">P.B. No 93, Angamaly 683572, Kerala, India</p>
          </article>
        </div>
      </section>

      {/* Organisation structure */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center inline-flex items-center justify-center gap-2 w-full">
          <Network className="w-7 h-7 text-kerala-700" /> Organisation structure
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STRUCTURE.map((s) => (
            <li key={s.name} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
              <h3 className="font-serif text-base text-ink">{s.name}</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Wings + initiatives */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">Wings &amp; initiatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WINGS.map((w) => (
              <article key={w.name} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <w.icon className="w-6 h-6 text-kerala-700 mb-2" />
                <h3 className="font-serif text-lg text-ink">{w.name}</h3>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{w.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-4 text-center">Why join AMAI</h2>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed text-center mb-6">
          The largest Ayurvedic medical organisation in Kerala — <strong>10,000+ qualified members</strong>, decades of advocacy, legislative victories, legal support, CME, journal access and a real professional network.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h3 className="font-serif text-lg text-ink">Who can join</h3>
            <ul className="mt-2 text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
              <li>Government medical officers (Ayurveda)</li>
              <li>Private practitioners</li>
              <li>Manufacturing physicians</li>
              <li>Hospital-employed doctors</li>
              <li>Ayurveda college teachers</li>
              <li>PG scholars + students</li>
            </ul>
          </article>
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h3 className="font-serif text-lg text-ink">Member benefits</h3>
            <ul className="mt-2 text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
              <li>APTA journal access</li>
              <li>CME credits + Academy programmes</li>
              <li>Legal support + ethics committee</li>
              <li>Aswas Relief Fund — welfare safety net</li>
              <li>Advocacy + regulatory representation</li>
              <li>Career support + networking</li>
            </ul>
          </article>
        </div>

        <div className="text-center">
          <a
            href="https://amaiapp.ayurveda-amai.org/"
            target="_blank" rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold"
          >
            Apply for membership <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-gray-500 mt-3">Application forms available on the AMAI website. Contact your District or Area Committee Office Bearers.</p>
        </div>
      </section>

      {/* Events */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center inline-flex items-center justify-center gap-2 w-full">
            <CalendarDays className="w-7 h-7 text-kerala-700" /> Events &amp; conferences
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <h3 className="font-serif text-lg text-ink">Annual State Conference</h3>
              <p className="text-sm text-gray-700 mt-1">Latest: <strong>47th State Conference</strong>, Wayanad.</p>
            </li>
            <li className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <h3 className="font-serif text-lg text-ink">District CME programmes</h3>
              <p className="text-sm text-gray-700 mt-1">Regular continuing medical education across all 14 Kerala districts.</p>
            </li>
            <li className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <h3 className="font-serif text-lg text-ink">National + International conferences</h3>
              <p className="text-sm text-gray-700 mt-1">AMAI organises and represents Kerala Ayurveda at national and international forums.</p>
            </li>
            <li className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <h3 className="font-serif text-lg text-ink">Academic seminars</h3>
              <p className="text-sm text-gray-700 mt-1">PSC coaching, postgraduate seminars, classical-text study circles.</p>
            </li>
          </ul>
          <div className="text-center mt-6">
            <a href="https://ayurveda-amai.org/category/events/" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
              See all events on ayurveda-amai.org <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center inline-flex items-center justify-center gap-2 w-full">
          <BookOpen className="w-7 h-7 text-kerala-700" /> Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {RESOURCES.map((r) => (
            <a
              key={r.label} href={r.href} target="_blank" rel="noreferrer noopener"
              className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg transition-shadow flex items-start gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-kerala-700 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-ink">{r.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Social + contact */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">Connect with AMAI</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {SOCIAL.map((s) => (
              <a
                key={s.label} href={s.href} target="_blank" rel="noreferrer noopener"
                className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg transition-shadow text-center"
              >
                <s.icon className="w-6 h-6 text-kerala-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">{s.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.sub}</p>
              </a>
            ))}
          </div>
          <article className="mt-6 bg-white border border-gray-100 rounded-card p-5 shadow-card max-w-2xl mx-auto">
            <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> Headquarters</p>
            <p className="text-sm text-gray-700 mt-1">Ayurveda Bhavan, P.B. No 93, Angamaly 683572, Kerala, India</p>
          </article>
        </div>
      </section>

      {/* Compliance footnote */}
      <section className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Editorial note.</strong> AyurConnect is an independent platform. The information on this page is collected from AMAI&apos;s public website (<a className="underline" href="https://ayurveda-amai.org" target="_blank" rel="noreferrer noopener">ayurveda-amai.org</a>), official social channels, and public records, and is presented in support of the association&apos;s mission. For the most current details, refer directly to the AMAI website or contact the headquarters.
          </div>
        </div>
      </section>
    </>
  )
}
