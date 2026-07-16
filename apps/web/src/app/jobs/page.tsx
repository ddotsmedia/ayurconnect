import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Briefcase, MapPin, Calendar, Sparkles, FileText, ShieldCheck, MessageCircle, Bot, GraduationCap, Globe2, Plane, ArrowRight } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { WhatsAppAlertsForm } from './_whatsapp-alerts-form'
import { jobPostingLd, breadcrumbLd, ldGraph } from '../../lib/seo'

type Job = {
  id: string
  title: string
  description: string
  type: string
  district: string | null
  salary: string | null
  createdAt: string
  user?: { name: string | null; email: string } | null
}

const TYPE_TONE: Record<string, { label: string; bg: string; text: string }> = {
  doctor:     { label: 'Doctor',     bg: 'bg-kerala-50',  text: 'text-kerala-700'  },
  therapist:  { label: 'Therapist',  bg: 'bg-amber-50',   text: 'text-amber-700'   },
  pharmacist: { label: 'Pharmacist', bg: 'bg-blue-50',    text: 'text-blue-700'    },
  government: { label: 'Government', bg: 'bg-rose-50',    text: 'text-rose-700'    },
  clinic:     { label: 'Clinic',     bg: 'bg-purple-50',  text: 'text-purple-700'  },
  teaching:   { label: 'Teaching',   bg: 'bg-teal-50',    text: 'text-teal-700'    },
}

async function fetchJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API}/jobs?limit=50`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { jobs: Job[] }
    return data.jobs ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Jobs in Kerala — Doctors, Therapists, Pharmacists',
  alternates: { canonical: '/jobs' },
  description: "Kerala's largest Ayurveda jobs board. BAMS doctors, Panchakarma therapists, AYUSH pharmacists, government posts, Gulf openings. Updated daily.",
}

export default async function JobsPage() {
  const jobs = await fetchJobs()

  // One JobPosting node per job — Google Jobs reads these and may surface
  // them in the Google Jobs box at the top of SERPs. Each job links back to
  // /jobs#<id> via the @id field; the visible <article> below uses the same
  // anchor so the schema-rendered-content match passes validation.
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Ayurveda Jobs', url: '/jobs' },
    ]),
    ...jobs.map((j) => jobPostingLd({
      id:          j.id,
      title:       j.title,
      description: j.description,
      type:        j.type,
      district:    j.district,
      salary:      j.salary,
      createdAt:   j.createdAt,
      employerName: j.user?.name ?? null,
    })),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GradientHero variant="jobs" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Briefcase className="w-3 h-3" /> Kerala-first Ayurveda careers
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Ayurveda Jobs Board</h1>
          <p className="text-white/70 mt-3">
            Doctors, therapists, pharmacists, researchers, teachers — Kerala&apos;s
            exclusive Ayurveda jobs board. Government posts, private clinics,
            international (Gulf / UK / US) openings.
          </p>
          <form action="/jobs/search" className="mt-5 flex flex-wrap gap-2 bg-white/10 backdrop-blur p-2 rounded-lg border border-white/15">
            <input name="q" placeholder="Job title, skill, hospital..." className="flex-1 min-w-[180px] px-3 py-2 rounded text-sm text-ink bg-white" />
            <select name="location" className="px-3 py-2 rounded text-sm text-ink bg-white">
              <option value="">Any location</option>
              <option value="kerala">Kerala</option>
              <option value="uae">UAE</option>
              <option value="qatar">Qatar</option>
              <option value="saudi-arabia">Saudi Arabia</option>
              <option value="uk">UK</option>
              <option value="remote">Remote</option>
            </select>
            <select name="specialty" className="px-3 py-2 rounded text-sm text-ink bg-white">
              <option value="">Any specialty</option>
              <option value="panchakarma">Panchakarma</option>
              <option value="kayachikitsa">Kayachikitsa</option>
              <option value="shalya">Shalya</option>
              <option value="prasuti-tantra">Prasuti Tantra</option>
              <option value="wellness">Wellness</option>
            </select>
            <button className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-white/85">
            <span className="opacity-80">Quick filters:</span>
            <Link href="/jobs/walk-in"          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">📍 Walk-in</Link>
            <Link href="/jobs/immediate-hiring" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">🔴 Urgent</Link>
            <Link href="/jobs/freshers"         className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">🎓 Freshers</Link>
            <Link href="/jobs/remote"           className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">🏠 Remote</Link>
            <Link href="/jobs/locum"            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">⏱️ Locum</Link>
            <Link href="/jobs/salary-calculator" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15">💰 Salary</Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-white/70">
            <span className="opacity-80">Trending:</span>
            {['Panchakarma Dubai', 'BAMS Fresher Kerala', 'Telemedicine', 'Locum', 'DHA Licensed'].map((t) => (
              <Link key={t} href={`/jobs/search?q=${encodeURIComponent(t)}`} className="px-2.5 py-1 bg-white/5 hover:bg-white/15 rounded-full border border-white/10">{t}</Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/jobs/post" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-kerala-800 hover:bg-cream rounded-md text-sm font-semibold">
              Post a job
            </Link>
            <Link href="/jobs/post" className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/40 text-white hover:bg-white/10 rounded-md text-sm font-semibold">
              I&apos;m a doctor — post availability
            </Link>
          </div>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        {/* 3-way posting banner — Full Form · Upload Poster · Quick Post (2026-07-16) */}
        <section className="max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: '/jobs/employers/post', emoji: '📝', title: 'Full Form',    sub: 'All fields · employer login' },
            { href: '/jobs/upload-poster',  emoji: '📋', title: 'Upload Poster', sub: 'AI reads image · auto-fills' },
            { href: '/jobs/quick-post',     emoji: '⚡', title: 'Quick Post',    sub: '30 seconds · no login' },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group bg-white border border-gray-100 rounded-card p-4 shadow-card hover:border-kerala-300 flex items-center gap-3">
              <span className="text-3xl" aria-hidden>{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base text-kerala-800 leading-tight">{c.title}</p>
                <p className="text-xs text-gray-600">{c.sub}</p>
              </div>
              <span className="text-kerala-700 group-hover:translate-x-0.5 transition-transform text-sm font-semibold">→</span>
            </Link>
          ))}
        </section>

        {jobs.length > 0 && (() => {
          const extra = jobs as unknown as Array<{ currency?: string | null; clinic?: string | null; salaryMin?: number | null; salaryMax?: number | null; user?: { name?: string | null } | null }>
          const countries = new Set(extra.map((j) => j.currency === 'AED' ? 'UAE' : j.currency === 'USD' ? 'USA/UK' : 'India').filter(Boolean))
          const employers = new Set(extra.map((j) => j.clinic ?? j.user?.name).filter(Boolean))
          const salaries  = extra.filter((j) => j.salaryMin && j.salaryMax).map((j) => (j.salaryMin! + j.salaryMax!) / 2)
          const avgSalary = salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : null
          return (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-gray-100 rounded-card p-3 text-center"><p className="text-2xl">🩺</p><p className="text-xl font-bold text-kerala-700">{jobs.length}</p><p className="text-[10px] uppercase tracking-wider text-gray-500">Active jobs</p></div>
              <div className="bg-white border border-gray-100 rounded-card p-3 text-center"><p className="text-2xl">🏥</p><p className="text-xl font-bold text-kerala-700">{employers.size}</p><p className="text-[10px] uppercase tracking-wider text-gray-500">Employers</p></div>
              <div className="bg-white border border-gray-100 rounded-card p-3 text-center"><p className="text-2xl">🌍</p><p className="text-xl font-bold text-kerala-700">{countries.size}</p><p className="text-[10px] uppercase tracking-wider text-gray-500">Regions</p></div>
              <div className="bg-white border border-gray-100 rounded-card p-3 text-center"><p className="text-2xl">💰</p><p className="text-xl font-bold text-kerala-700">{avgSalary ? `₹${(avgSalary / 1000).toFixed(0)}K` : 'Varies'}</p><p className="text-[10px] uppercase tracking-wider text-gray-500">Avg salary</p></div>
            </section>
          )
        })()}
        {jobs.length > 0 && <p className="text-sm text-muted mb-6"><strong className="text-ink">{jobs.length}</strong> open positions</p>}

        {jobs.length === 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
            {/* For employers */}
            <article className="bg-gradient-to-br from-kerala-700 to-kerala-800 text-white rounded-card p-6 md:p-8 shadow-cardLg">
              <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold">For Employers</span>
              <h2 className="font-serif text-2xl md:text-3xl mt-1">Hire Kerala&apos;s Best Ayurveda Talent</h2>
              <p className="text-sm text-white/85 mt-2">Post your first job free. Reach BAMS graduates, MD specialists, Panchakarma therapists, and wellness professionals across India, UAE, and worldwide.</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" /> AI-powered candidate matching</li>
                <li className="flex items-start gap-2"><Briefcase className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" /> Applicant tracking pipeline</li>
                <li className="flex items-start gap-2"><MessageCircle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" /> WhatsApp job alerts to 120K+ members</li>
                <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" /> Verified doctor profiles with credentials</li>
              </ul>
              <Link href="/jobs/employers/register" className="mt-5 inline-flex items-center gap-1 px-5 py-2.5 bg-white text-kerala-800 hover:bg-white/90 rounded font-bold text-sm">
                Post a Job — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-white/70 mt-3">Trusted by hospitals across Kerala and UAE</p>
            </article>

            {/* For candidates */}
            <article className="bg-gradient-to-br from-amber-100 to-amber-50 text-ink rounded-card p-6 md:p-8 shadow-cardLg border border-amber-200">
              <span className="text-[10px] uppercase tracking-wider text-amber-900 font-bold">For Doctors</span>
              <h2 className="font-serif text-2xl md:text-3xl mt-1 text-kerala-800">Your Next Ayurveda Career Starts Here</h2>
              <p className="text-sm text-gray-700 mt-2">Create your free profile. Get matched with hospitals, clinics, wellness resorts, and telemedicine companies worldwide.</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><FileText className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" /> AI resume builder with Ayurveda-specific sections</li>
                <li className="flex items-start gap-2"><Globe2 className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" /> DHA, DOH, MOH licensing guides</li>
                <li className="flex items-start gap-2"><Plane className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" /> Locum and telemedicine opportunities</li>
                <li className="flex items-start gap-2"><Bot className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" /> Career advisor powered by AI</li>
              </ul>
              <Link href="/jobs/profile" className="mt-5 inline-flex items-center gap-1 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-bold text-sm">
                Create Profile — Free <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-gray-600 mt-3">100% free for all doctors</p>
            </article>
          </section>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((j) => {
              const tone = TYPE_TONE[j.type] ?? { label: j.type, bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <article key={j.id} id={j.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-[11px] mb-2">
                    <span className={`${tone.bg} ${tone.text} px-2 py-0.5 rounded-full font-medium`}>{tone.label}</span>
                    <span className="text-subtle ml-auto"><Calendar className="w-3 h-3 inline mr-0.5" /> {new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink leading-snug">{j.title}</h3>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3 leading-relaxed">{j.description}</p>
                  <div className="mt-auto pt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {j.district && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {j.district}</div>}
                    {j.salary   && <div className="text-kerala-700 font-medium">{j.salary}</div>}
                  </div>
                  <Link
                    href="/sign-in"
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-kerala-600 text-white text-sm font-semibold rounded-md hover:bg-kerala-700"
                  >
                    Apply now
                  </Link>
                </article>
              )
            })}
          </div>
        )}

        <WhatsAppAlertsForm />

        {/* Featured tools — surface portal capabilities even when jobs board is empty */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
          <Link href="/jobs/career-advisor" className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <Bot className="w-7 h-7 text-kerala-700" />
            <h3 className="font-serif text-lg text-ink mt-2">AI Career Advisor</h3>
            <p className="text-xs text-gray-700 mt-1">Get personalized career guidance.</p>
          </Link>
          <Link href="/jobs/resume-builder" className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <FileText className="w-7 h-7 text-kerala-700" />
            <h3 className="font-serif text-lg text-ink mt-2">Resume Builder</h3>
            <p className="text-xs text-gray-700 mt-1">Create an ATS-friendly Ayurveda CV.</p>
          </Link>
          <Link href="/jobs/licensing" className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg block">
            <GraduationCap className="w-7 h-7 text-kerala-700" />
            <h3 className="font-serif text-lg text-ink mt-2">Licensing Guides</h3>
            <p className="text-xs text-gray-700 mt-1">DHA, DOH, MOH step-by-step.</p>
          </Link>
        </section>

        {/* FAQ section + schema (Task 11) */}
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl text-ink mb-3">Frequently asked</h2>
          <div className="space-y-2">
            {[
              { q: 'How do I find Ayurveda jobs on AyurConnect?', a: 'Use the search bar + sidebar filters (job type, specialization, location, experience, salary). For ongoing alerts, create a job alert at /jobs/alerts so we email or WhatsApp matching jobs as they\'re posted.' },
              { q: 'Is AyurConnect free for doctors?', a: 'Yes — 100% free, forever. Candidates never pay. Job posting + employer subscriptions support the platform.' },
              { q: 'How do I apply for jobs abroad (Dubai, UAE, GCC)?', a: 'Each jurisdiction has its own licensing process. See /jobs/licensing for jurisdiction-by-jurisdiction guides on DHA, DOH, MOHAP, QCHP, SCFHS, etc.' },
              { q: 'What qualifications do I need?', a: 'BAMS is the minimum for most roles. MD/MS is required for specialist positions. International roles often need active license + Dataflow verification + clinical experience.' },
              { q: 'How does AI matching work?', a: 'When you complete your candidate profile and a job is posted, our matching engine scores jobs against your profile (specialization 25%, experience 15%, location 15%, salary 15%, qualification 10%, license 10%, language 5%, skills 5%) and surfaces top matches.' },
            ].map((f) => (
              <details key={f.q} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <summary className="font-semibold text-ink cursor-pointer">{f.q}</summary>
                <p className="text-sm text-gray-700 mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FAQPage JSON-LD schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: [
            { q: 'How do I find Ayurveda jobs on AyurConnect?', a: 'Use the search bar + sidebar filters (job type, specialization, location, experience, salary). For ongoing alerts, create a job alert.' },
            { q: 'Is AyurConnect free for doctors?', a: '100% free, forever. Candidates never pay.' },
            { q: 'How do I apply for jobs abroad?', a: 'See /jobs/licensing for jurisdiction-by-jurisdiction guides on DHA, DOH, MOHAP, QCHP, SCFHS.' },
            { q: 'What qualifications do I need?', a: 'BAMS minimum. MD/MS for specialist roles. International roles often need active license + Dataflow verification + clinical experience.' },
            { q: 'How does AI matching work?', a: 'Matching engine scores jobs against your profile across specialization, experience, location, salary, qualification, license, language, skills.' },
          ].map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }) }} />

        {/* Related pages strip */}
        <nav className="mt-8 max-w-4xl mx-auto bg-cream border border-kerala-100 rounded-card p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">More from AyurConnect Jobs</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <Link href="/jobs/career-advisor"   className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Career Advisor</Link>
            <Link href="/jobs/resume-builder"   className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Resume Builder</Link>
            <Link href="/jobs/resume-score"     className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">AI Resume Score</Link>
            <Link href="/jobs/assessments"      className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Skill Assessments</Link>
            <Link href="/jobs/interview-prep"   className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Interview Prep</Link>
            <Link href="/jobs/career-paths"     className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Career Paths</Link>
            <Link href="/jobs/insights"         className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Market Insights</Link>
            <Link href="/jobs/licensing"        className="px-3 py-1.5 bg-white border border-kerala-200 rounded-full hover:bg-kerala-50">Licensing Guides</Link>
          </div>
        </nav>

        <div className="mt-6 p-5 rounded-card bg-rose-50 border border-rose-100 max-w-2xl mx-auto text-center">
          <p className="font-serif text-xl text-rose-900">🌍 Gulf & International Roles</p>
          <p className="text-sm text-rose-800 mt-2">
            UAE, Qatar, Oman, Saudi, UK, US openings posted as we get them.
            <Link href="/sign-in" className="ml-1 text-rose-700 underline">Subscribe</Link> to get notified.
          </p>
        </div>
      </div>
    </>
  )
}
