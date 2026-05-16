import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase, MapPin, Clock, Heart, Code, Users, Stethoscope, Megaphone, Mail, ArrowRight } from 'lucide-react'
import { breadcrumbLd } from '@/lib/seo'

export const metadata = {
  title: 'Careers — Build Kerala\'s Ayurveda Future with AyurConnect',
  description: 'Engineering, clinical, content, and growth roles. Remote-friendly. We\'re building the largest verified Ayurveda platform — for patients, doctors, and authentic Kerala medical tourism.',
  alternates: { canonical: '/careers' },
}

const VALUES = [
  { icon: Heart,       title: 'Authentic Ayurveda first',  body: 'Classical citations, verification, no quack content. We refuse to chase trends that compromise patient outcomes.' },
  { icon: Stethoscope, title: 'Doctors as partners',       body: 'Every product decision involves practising BAMS doctors. Engineering doesn\'t ship clinical features in a vacuum.' },
  { icon: Users,       title: 'Remote + Kerala-rooted',    body: 'Hybrid team: remote anywhere in India for engineering/content; clinical advisory and partnerships out of Kochi & Trivandrum.' },
  { icon: Code,        title: 'Modern stack, slow ramp',   body: 'Next.js 15, Fastify 5, PostgreSQL+pgvector, Better Auth, Prisma. We pair-program on Fridays. No 996.' },
]

const ROLES = [
  {
    id: 'eng-fullstack',
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    icon: Code,
    location: 'Remote (IN/UAE timezone)',
    type: 'Full-time',
    summary: 'Own end-to-end features across the doctor hub, telehealth, and AI assistants. Comfortable with TypeScript, React Server Components, and shaping Postgres schemas.',
    requirements: [
      '5+ years TS/Node. Strong on async + correctness.',
      'Shipped product with Next.js App Router or similar SSR framework.',
      'Comfortable reading SQL EXPLAIN and tuning indexes.',
      'Bonus: pgvector / RAG experience, Better Auth, Prisma.',
    ],
  },
  {
    id: 'eng-mobile',
    title: 'Mobile / PWA Engineer',
    team: 'Engineering',
    icon: Code,
    location: 'Remote (IN preferred)',
    type: 'Full-time',
    summary: 'Build the AyurConnect mobile experience — PWA first, then native if patient demand warrants. Push notifications, offline appointment cards, prescription camera capture.',
    requirements: [
      'Web platform deep-knowledge: service workers, manifest, push API.',
      '3+ years React. Optional: React Native.',
      'Care about p95 LCP on a 4G connection in Kerala.',
    ],
  },
  {
    id: 'doctor-advisor',
    title: 'Clinical Advisor (Ayurveda)',
    team: 'Clinical',
    icon: Stethoscope,
    location: 'Hybrid · Kochi / Trivandrum',
    type: 'Part-time / Consulting',
    summary: 'BAMS / MD (Ayurveda) practitioner who reviews clinical content, validates protocols submitted to the doctor hub, and shapes our verification standards.',
    requirements: [
      'BAMS minimum; MD (Ayurveda) preferred.',
      '5+ years of active clinical practice.',
      'CCIM / NCISM registration in good standing (if applicable).',
      'Comfortable reviewing peer-submitted protocols + research summaries.',
    ],
  },
  {
    id: 'content-malayalam',
    title: 'Content Editor — Malayalam',
    team: 'Content',
    icon: Megaphone,
    location: 'Remote · Kerala',
    type: 'Full-time',
    summary: 'Translate and adapt our patient-facing content into Malayalam. Not literal translation — voice and idiom matter. Work with the design team on type, hyphenation, and reading order.',
    requirements: [
      'Native Malayalam fluency, professional English.',
      'Health / wellness writing background preferred.',
      'Familiarity with Manjari / Anjali Old Lipi typography is a bonus.',
    ],
  },
  {
    id: 'partnerships',
    title: 'Hospital & Centre Partnerships Lead',
    team: 'Growth',
    icon: Users,
    location: 'Kerala · field + remote',
    type: 'Full-time',
    summary: 'Onboard Kerala\'s authentic Panchakarma centres and Ayurveda hospitals onto AyurConnect. Verify accreditation, set pricing transparency standards, manage long-term relationships.',
    requirements: [
      'Direct experience selling B2B services in Kerala healthcare or hospitality.',
      'Fluent Malayalam + English; basic Hindi/Tamil helpful.',
      'Willing to drive across districts 2-3 days/week.',
    ],
  },
]

export default function CareersPage() {
  const ld = breadcrumbLd([
    { name: 'Home',    url: '/' },
    { name: 'Careers', url: '/careers' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Briefcase className="w-3 h-3" /> Join AyurConnect
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Build Kerala&apos;s Ayurveda <span className="text-gold-400">future</span> with us
          </h1>
          <p className="mt-5 text-lg text-white/80">
            We&apos;re the verified directory + telehealth + knowledge platform that authentic Ayurveda has needed for two decades. Remote-friendly. Real clinical impact.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="font-serif text-2xl text-ink mb-6">What we value</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VALUES.map((v) => (
            <article key={v.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <v.icon className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-serif text-lg text-ink">{v.title}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl text-ink mb-2">Open roles</h2>
          <p className="text-sm text-muted mb-6">All roles include health insurance + a verified-doctor consultation budget for you and your family.</p>
          <div className="space-y-3">
            {ROLES.map((r) => (
              <article id={r.id} key={r.id} className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
                <header className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-kerala-700 mb-1">
                      <r.icon className="w-3 h-3" /> {r.team}
                    </div>
                    <h3 className="font-serif text-xl text-ink">{r.title}</h3>
                    <p className="text-xs text-muted mt-1 inline-flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {r.type}</span>
                    </p>
                  </div>
                  <a
                    href={`mailto:careers@ayurconnect.com?subject=${encodeURIComponent(`Application: ${r.title}`)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold"
                  >
                    Apply <ArrowRight className="w-3 h-3" />
                  </a>
                </header>
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{r.summary}</p>
                <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-4 mb-1.5">What we&apos;re looking for</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                  {r.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl text-center">
        <Briefcase className="w-10 h-10 text-kerala-700 mx-auto mb-3" />
        <h2 className="font-serif text-2xl text-ink mb-2">Don&apos;t see your role?</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-5">
          We&apos;re a small team and we add roles when we know the work is worth a hire. If you&apos;ve read this page and feel you&apos;d be a great fit somewhere on the team — write to us anyway. Best candidates often beat best timing.
        </p>
        <a
          href="mailto:careers@ayurconnect.com?subject=Speculative%20application"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-700 text-kerala-700 hover:bg-kerala-700 hover:text-white rounded text-sm font-semibold transition-colors"
        >
          <Mail className="w-4 h-4" /> careers@ayurconnect.com
        </a>
        <p className="text-xs text-gray-500 mt-4">
          Read more about who we are at <Link href="/about" className="text-kerala-700 hover:underline">/about</Link> ·
          press kit at <Link href="/about/press" className="text-kerala-700 hover:underline">/about/press</Link>.
        </p>
      </section>
    </>
  )
}
