'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Menu, X, ChevronDown, LayoutDashboard, Shield, LogOut, User, Stethoscope,
  ListFilter, Sparkles, MessagesSquare, UserPlus, BookOpen, ScrollText, Leaf,
  Sprout, FlaskConical, AlertTriangle, HelpCircle, Microscope, CalendarDays,
  CloudRain, Building2, Building, School, Sun, ShieldCheck, Plane, Video, HeartPulse,
  Newspaper, Ticket,
} from 'lucide-react'
import { cn } from './lib/utils'
import { t } from './i18n'
import { LogoLockup, LogoMark } from './logo'
import { NavSearch } from './nav-search'
import { NotificationBell } from './notification-bell'

const TOP_SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Manasika']
const TOP_DISTRICTS = ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur', 'Kottayam', 'Malappuram']

export type NavbarSession = { user: { id: string; email: string; name: string | null; role: string; image?: string | null } } | null

function initialsOf(s: NonNullable<NavbarSession>): string {
  const src = (s.user.name ?? s.user.email).trim()
  const parts = src.replace(/^Dr\.?\s*/i, '').split(/[\s@]+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

type RichItem = { href: string; label: string; desc?: string; icon: LucideIcon; highlight?: boolean }
type Section = { heading?: string; items: RichItem[] }
type NavChildLink = { href: string; label: string }
type NavItem =
  | { kind: 'doctors'; key: string; href: string; label: string }
  | { kind: 'link'; href: string; label: string }
  | { kind: 'cta'; href: string; label: string }
  | { kind: 'amai'; href: string; label: string }
  | { kind: 'group'; key: string; label: string; href?: string; cols: 1 | 2; sections: Section[]; more?: NavChildLink[] }

export function Navbar({ session = null }: { session?: NavbarSession } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [userOpen, setUserOpen] = useState(false)
  const tr = t()
  const pathname = usePathname() ?? ''
  const userRef = useRef<HTMLDivElement | null>(null)

  // Doctors dropdown — "Find care" + "For doctors" (provider items moved here).
  const DOCTOR_FIND_CARE: RichItem[] = [
    { href: '/doctors', label: 'Browse all doctors', desc: '500+ verified Kerala specialists', icon: ListFilter },
    { href: '/doctor-match', label: 'AI doctor match', desc: '30-sec quiz → ranked results', icon: Sparkles },
    { href: '/online-consultation', label: 'Online consultation', desc: 'Secure video from anywhere', icon: Video },
    { href: '/second-opinion', label: 'Second opinion', desc: 'Senior specialist review', icon: MessagesSquare },
  ]
  const DOCTOR_FOR_DOCTORS: RichItem[] = [
    { href: '/dr', label: 'Doctor dashboard', desc: 'Manage profile, view stats', icon: LayoutDashboard },
    { href: '/doctors/today', label: 'Today', desc: 'Drug, MCQ, jobs, stats, referrals', icon: Sparkles },
    { href: '/doctors/cme', label: 'CME tracker', desc: 'Log credits, KSMC progress, CSV export', icon: ScrollText },
    { href: '/colleges', label: 'College alumni', desc: 'Find your batchmates', icon: School },
  ]
  const DOCTOR_REGISTER: RichItem = { href: '/register/doctor', label: 'Register as doctor', desc: 'Free verified profile + patient leads', icon: UserPlus, highlight: true }

  // All top-level tabs (For Providers removed; its items redistributed).
  const NAV_LINKS: NavItem[] = [
    { kind: 'doctors', key: 'doctors', href: '/doctors', label: tr.nav.doctors },
    { kind: 'link', href: '/online-consultation', label: tr.nav.consult },
    {
      kind: 'group', key: 'hospitals', label: tr.nav.hospitals, href: '/hospitals', cols: 1,
      sections: [{
        items: [
          { href: '/hospitals', label: 'Browse hospitals', desc: 'Govt + private + AYUSH certified', icon: Building2 },
          { href: '/hospitals/compare', label: 'Compare hospitals', desc: 'Side-by-side: accreditations, doctors, treatments', icon: Building2 },
          { href: '/offers',            label: 'Offers & Packages', desc: 'Live offers + Panchakarma packages from hospitals', icon: Building2 },
          { href: '/panchakarma', label: 'Panchakarma centres', desc: 'Tourism-classified, verified', icon: HeartPulse },
          { href: '/clinic-portal', label: 'Clinic portal', desc: 'Manage your clinic listing', icon: Building },
        ],
      }],
    },
    {
      kind: 'group', key: 'learn', label: tr.nav.learn, cols: 2,
      sections: [
        {
          heading: 'Study (free)',
          items: [
            { href: '/learn',                 label: 'Learning hub',     desc: 'BAMS notes, MCQ, papers — all free', icon: BookOpen },
            { href: '/learn/notes',           label: 'BAMS Notes',       desc: '20+ notes across all years',         icon: BookOpen },
            { href: '/learn/mcq',             label: 'AIAPGET MCQ',      desc: '100+ practice questions',            icon: ScrollText },
            { href: '/learn/case-studies',    label: 'Case studies',     desc: '10 clinical cases',                   icon: Leaf },
            { href: '/learn/daily-challenge', label: 'Daily Challenge',  desc: '5 fresh MCQs every day · streak',     icon: ScrollText },
            { href: '/learn/exam-countdown',  label: 'Exam Countdown',   desc: 'AIAPGET, PSC, PG — days remaining',   icon: BookOpen },
            { href: '/learn/community',       label: 'Community',        desc: 'Ask doubts, discuss subjects, free',  icon: MessagesSquare },
            { href: '/leaderboard',           label: 'Leaderboard',      desc: 'Top contributors by points & streak', icon: ScrollText },
          ],
        },
        {
          heading: 'Reference & tools',
          items: [
            { href: '/quick-reference', label: 'Quick Reference', desc: 'Instant herb / formulation / condition lookup', icon: FlaskConical },
            { href: '/herbs', label: 'Herbs encyclopedia', desc: '145+ medicinal herbs', icon: Sprout },
            { href: '/formulary', label: 'Formulary', desc: 'Classical compounds', icon: FlaskConical },
            { href: '/interaction-checker', label: 'Interaction checker', desc: 'Herb-drug safety', icon: AlertTriangle },
            { href: '/ritucharya', label: 'Ritucharya planner', desc: 'Personalized seasonal regimen', icon: Sun },
          ],
        },
      ],
      more: [
        { href: '/learn/question-papers', label: 'Question Papers' },
        { href: '/learn/workshops',       label: 'Workshops' },
        { href: '/learn/ebooks',          label: 'E-Books' },
        { href: '/learn/ask-the-classics', label: 'Ask the Classics' },
        { href: '/heritage',              label: 'Heritage' },
        { href: '/treatments',            label: 'Treatments' },
        { href: '/prakriti-quiz', label: 'Prakriti Quiz' },
        { href: '/kerala-guide', label: 'Kerala Guide' },
        { href: '/conditions', label: 'Conditions Library' },
        { href: '/programs', label: 'Wellness Programs' },
        { href: '/triage', label: 'Symptom Checker' },
        { href: '/ayurbot', label: tr.nav.ayurbot },
        { href: '/health-tips', label: tr.nav.healthTips },
        { href: '/articles', label: tr.nav.articles },
        { href: '/videos', label: 'Health Videos' },
      ],
    },
    {
      kind: 'group', key: 'community', label: tr.nav.community, cols: 1,
      sections: [{
        items: [
          { href: '/news', label: 'News', desc: 'Industry, research, govt updates', icon: Newspaper },
          { href: '/events', label: 'Events', desc: 'Conferences, CME, retreats, webinars', icon: Ticket },
          { href: '/qa', label: 'Q&A forum', desc: 'Ask health questions', icon: HelpCircle },
          { href: '/research', label: 'Research', desc: 'Clinical papers', icon: Microscope },
          { href: '/seminars', label: 'Seminars & CME', desc: 'Events and webinars', icon: CalendarDays },
          { href: '/karkidaka', label: 'Karkidaka hub', desc: 'Monsoon healing season', icon: CloudRain },
        ],
      }],
      more: [
        { href: '/forum', label: tr.nav.forum },
        { href: '/case-studies', label: 'Case Studies' },
        { href: '/tourism', label: tr.nav.tourism },
      ],
    },
    { kind: 'cta', href: '/heal-in-kerala', label: 'Heal in Kerala' },
    { kind: 'link', href: '/jobs', label: tr.nav.jobs },
    { kind: 'amai', href: '/amai', label: 'AMAI' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!userOpen) return
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [userOpen])

  async function signOut() {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' })
    } catch { /* fall-through */ }
    if (typeof window !== 'undefined') window.location.href = '/'
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))
  const groupActive = (it: Extract<NavItem, { kind: 'group' }>) =>
    [...it.sections.flatMap((s) => s.items), ...(it.more ?? [])].some((c) => isActive(c.href))

  const tabBase = 'relative flex items-center gap-1 rounded-md px-[13px] py-[6px] text-[13.5px] tracking-[0.01em] transition-colors'
  const tabIdle = 'font-normal text-[#4a4a42] hover:text-[#155228] hover:bg-[#f0fdf4]'
  const tabActive = 'font-medium text-[#155228]'
  const activeBar = <span aria-hidden className="absolute left-[13px] right-[13px] -bottom-[11px] h-[2px] rounded-full bg-[#155228]" />

  const RichRow = ({ item, onClick }: { item: RichItem; onClick?: () => void }) => {
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          'group/row flex items-center gap-[10px] rounded-lg px-2.5 py-2 transition-colors duration-200',
          item.highlight ? 'bg-[#f0fdf4] border border-[#dcfce7] hover:bg-[#e7fbef]' : 'hover:bg-[#f0fdf4]',
        )}
      >
        <span
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
            item.highlight ? 'bg-[#155228] text-white' : 'bg-[#f5f5eb] text-[#4a4a42] group-hover/row:bg-[#dcfce7] group-hover/row:text-[#22863f]',
          )}
        >
          <Icon className="h-[17px] w-[17px]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-gray-900">{item.label}</span>
          {item.desc && <span className="block text-[11px] text-gray-500 leading-tight">{item.desc}</span>}
        </span>
      </Link>
    )
  }

  const MoreLinks = ({ items, onClick }: { items: NavChildLink[]; onClick?: () => void }) => (
    <div className="mt-1 border-t border-black/[0.06] pt-2">
      <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">More</p>
      <div className="grid grid-cols-2 gap-x-1">
        {items.map((c) => (
          <Link key={c.href} href={c.href} onClick={onClick} className="rounded-md px-2.5 py-1.5 text-[12.5px] text-[#4a4a42] hover:bg-[#f0fdf4] hover:text-[#155228]">
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  )

  const SectionHeading = ({ children }: { children: React.ReactNode }) =>
    <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{children}</p>

  const panelCls = 'rounded-xl border border-black/[0.07] bg-white p-2 shadow-[0_8px_40px_rgba(0,0,0,0.1)] animate-slide-up'

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-40 w-full transition-all',
          scrolled ? 'bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100',
        )}
      >
        {/* STEP 1 — signature gradient accent line */}
        <div aria-hidden className="h-[3px] w-full bg-[linear-gradient(to_right,#155228_0%,#2a9a4a_55%,#c9a84c_100%)]" />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="group" aria-label="AyurConnect home">
              <LogoLockup className="group-hover:opacity-90 transition-opacity" />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                // ── Doctors: Find care + For doctors + register + spec/district ──
                if (link.kind === 'doctors') {
                  const open = openGroup === 'doctors'
                  return (
                    <div key={link.key} className="relative" onMouseEnter={() => setOpenGroup('doctors')} onMouseLeave={() => setOpenGroup(null)}>
                      <Link href={link.href} className={cn(tabBase, isActive(link.href) ? tabActive : tabIdle)}>
                        {link.label}
                        <ChevronDown className={cn('h-3 w-3 opacity-35 transition-transform duration-200', open && 'rotate-180')} />
                        {isActive(link.href) && activeBar}
                      </Link>
                      {open && (
                        <div className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3">
                          <div className={panelCls}>
                            <SectionHeading>Find care</SectionHeading>
                            <div className="grid grid-cols-2 gap-1">
                              {DOCTOR_FIND_CARE.map((it) => <RichRow key={it.href} item={it} onClick={() => setOpenGroup(null)} />)}
                            </div>
                            <div className="mt-1 border-t border-black/[0.06] pt-1.5">
                              <SectionHeading>For doctors</SectionHeading>
                              <div className="grid grid-cols-2 gap-1">
                                {DOCTOR_FOR_DOCTORS.map((it) => <RichRow key={it.href} item={it} onClick={() => setOpenGroup(null)} />)}
                              </div>
                            </div>
                            <div className="mt-1.5 border-t border-black/[0.06] pt-1.5">
                              <RichRow item={DOCTOR_REGISTER} onClick={() => setOpenGroup(null)} />
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 border-t border-black/[0.06] px-2.5 pt-2">
                              <div>
                                <p className="pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{tr.nav.bySpec}</p>
                                <ul className="space-y-0.5">
                                  {TOP_SPECS.map((s) => (
                                    <li key={s}><Link href={`/doctors?specialization=${encodeURIComponent(s)}`} className="block rounded px-1 py-0.5 text-[12.5px] text-[#4a4a42] hover:text-[#155228]">{s}</Link></li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{tr.nav.byDistrict}</p>
                                <ul className="space-y-0.5">
                                  {TOP_DISTRICTS.map((d) => (
                                    <li key={d}><Link href={`/doctors?district=${encodeURIComponent(d)}`} className="block rounded px-1 py-0.5 text-[12.5px] text-[#4a4a42] hover:text-[#155228]">{d}</Link></li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                // ── Group dropdowns (Hospitals / Learn / Community) ──
                if (link.kind === 'group') {
                  const open = openGroup === link.key
                  const active = groupActive(link) || (link.href ? isActive(link.href) : false)
                  const width = link.cols === 2 ? 'w-[480px]' : 'w-[320px]'
                  const triggerInner = (
                    <>
                      {link.label}
                      <ChevronDown className={cn('h-3 w-3 opacity-35 transition-transform duration-200', open && 'rotate-180')} />
                      {active && activeBar}
                    </>
                  )
                  return (
                    <div key={link.key} className="relative" onMouseEnter={() => setOpenGroup(link.key)} onMouseLeave={() => setOpenGroup(null)}>
                      {link.href
                        ? <Link href={link.href} className={cn(tabBase, active ? tabActive : tabIdle)}>{triggerInner}</Link>
                        : <button type="button" className={cn(tabBase, active ? tabActive : tabIdle)}>{triggerInner}</button>}
                      {open && (
                        <div className={cn('absolute left-1/2 top-full -translate-x-1/2 pt-3', width)}>
                          <div className={panelCls}>
                            {link.cols === 2 ? (
                              <div className="grid grid-cols-2 gap-1">
                                {link.sections.map((sec, i) => (
                                  <div key={i}>
                                    {sec.heading && <SectionHeading>{sec.heading}</SectionHeading>}
                                    <div className="grid gap-1">{sec.items.map((it) => <RichRow key={it.href} item={it} onClick={() => setOpenGroup(null)} />)}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              link.sections.map((sec, i) => (
                                <div key={i}>
                                  {sec.heading && <SectionHeading>{sec.heading}</SectionHeading>}
                                  <div className="grid gap-1">{sec.items.map((it) => <RichRow key={it.href} item={it} onClick={() => setOpenGroup(null)} />)}</div>
                                </div>
                              ))
                            )}
                            {link.more && link.more.length > 0 && <MoreLinks items={link.more} onClick={() => setOpenGroup(null)} />}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                // ── "Heal in Kerala" CTA pill with dot separators ──
                if (link.kind === 'cta') {
                  return (
                    <div key={link.href} className="flex items-center">
                      <span aria-hidden className="mx-1.5 h-[3px] w-[3px] rounded-full bg-black/[0.07]" />
                      <Link
                        href={link.href}
                        className="group/cta inline-flex items-center gap-1.5 rounded-full bg-[#155228] px-4 py-[7px] text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#1a6b33] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(21,82,40,0.25)]"
                      >
                        <Plane className="h-3.5 w-3.5" />
                        {link.label}
                      </Link>
                      <span aria-hidden className="mx-1.5 h-[3px] w-[3px] rounded-full bg-black/[0.07]" />
                    </div>
                  )
                }

                // ── AMAI with gold institutional badge ──
                if (link.kind === 'amai') {
                  return (
                    <Link key={link.href} href={link.href} className={cn(tabBase, isActive(link.href) ? tabActive : tabIdle)}>
                      <span aria-hidden className="flex h-[20px] w-[20px] items-center justify-center rounded bg-[#faf5e4]">
                        <img src="/amai-logo.svg" alt="" width={14} height={20} style={{ objectFit: 'contain' }} />
                      </span>
                      {link.label}
                      {isActive(link.href) && activeBar}
                    </Link>
                  )
                }

                // ── Plain link ──
                return (
                  <Link key={link.href} href={link.href} className={cn(tabBase, isActive(link.href) ? tabActive : tabIdle)}>
                    {link.label}
                    {isActive(link.href) && activeBar}
                  </Link>
                )
              })}
            </div>

            {/* Universal search (desktop) */}
            <div className="hidden lg:block flex-shrink min-w-0 mx-4">
              <NavSearch />
            </div>

            {/* Auth buttons (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <>
                  <NotificationBell />
                  <div ref={userRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setUserOpen((v) => !v)}
                    className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-gray-200 hover:border-kerala-400 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={userOpen}
                  >
                    <span className="w-7 h-7 rounded-full bg-kerala-700 text-white text-[11px] font-semibold flex items-center justify-center">
                      {initialsOf(session)}
                    </span>
                    <span className="text-sm text-gray-700 max-w-[120px] truncate">{session.user.name ?? session.user.email.split('@')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {userOpen && (
                    <div role="menu" className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-card shadow-cardLg overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900 truncate">{session.user.name ?? '—'}</div>
                        <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-kerala-50 text-kerala-700">
                          {session.user.role}
                        </div>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-kerala-50 hover:text-kerala-700">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-kerala-50 hover:text-kerala-700">
                        <User className="w-4 h-4" /> Edit profile
                      </Link>
                      {['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(session.user.role) && (
                        <Link href="/dr" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-kerala-50 hover:text-kerala-700">
                          <Stethoscope className="w-4 h-4" /> Doctor Hub
                        </Link>
                      )}
                      {session.user.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-kerala-50 hover:text-kerala-700">
                          <Shield className="w-4 h-4" /> Admin panel
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-kerala-700 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="px-4 py-1.5 text-sm font-semibold bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-gray-700 hover:text-kerala-700"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-cardXl flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div aria-hidden className="h-[3px] w-full bg-[linear-gradient(to_right,#155228_0%,#2a9a4a_55%,#c9a84c_100%)]" />
            <div className="flex items-center justify-between p-4 border-b">
              <span className="inline-flex items-center gap-2">
                <LogoMark className="h-7 w-7" />
                <span className="font-serif text-xl text-kerala-700">{tr.nav.menu}</span>
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 pt-4"><NavSearch compact /></div>
            <nav className="flex-1 p-4 overflow-y-auto">
              {/* Doctors mobile section */}
              <div className="pt-3 first:pt-0">
                <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{tr.nav.doctors}</div>
                {[...DOCTOR_FIND_CARE, ...DOCTOR_FOR_DOCTORS, DOCTOR_REGISTER].map((it) => {
                  const Icon = it.icon
                  return (
                    <Link key={it.href} href={it.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-gray-800 hover:bg-[#f0fdf4]">
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', it.highlight ? 'bg-[#155228] text-white' : 'bg-[#f5f5eb] text-[#4a4a42]')}><Icon className="h-4 w-4" /></span>
                      <span className="text-sm">{it.label}</span>
                    </Link>
                  )
                })}
              </div>

              {NAV_LINKS.map((link) => {
                if (link.kind === 'doctors') return null // rendered above
                if (link.kind === 'link' || link.kind === 'cta' || link.kind === 'amai') {
                  const isCta = link.kind === 'cta'
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded', isCta ? 'mt-1 bg-[#155228] text-white font-medium hover:bg-[#1a6b33]' : 'text-gray-800 hover:bg-[#f0fdf4]')}
                    >
                      {isCta && <Plane className="h-4 w-4" />}
                      {link.kind === 'amai' && (
                        <span aria-hidden className="flex h-[20px] w-[20px] items-center justify-center rounded bg-[#faf5e4]"><img src="/amai-logo.svg" alt="" width={14} height={20} style={{ objectFit: 'contain' }} /></span>
                      )}
                      {link.label}
                    </Link>
                  )
                }
                // group → header + section items + more
                return (
                  <div key={link.key} className="pt-3">
                    <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{link.label}</div>
                    {link.sections.flatMap((s) => s.items).map((it) => {
                      const Icon = it.icon
                      return (
                        <Link key={it.href} href={it.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded text-gray-800 hover:bg-[#f0fdf4]">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f5eb] text-[#4a4a42]"><Icon className="h-4 w-4" /></span>
                          <span className="text-sm">{it.label}</span>
                        </Link>
                      )
                    })}
                    {(link.more ?? []).map((c) => (
                      <Link key={c.href} href={c.href} className="block px-3 py-1.5 rounded text-gray-700 hover:bg-[#f0fdf4] text-[13px]" onClick={() => setMobileOpen(false)}>{c.label}</Link>
                    ))}
                  </div>
                )
              })}
            </nav>
            <div className="p-4 border-t space-y-2">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-1 py-2">
                    <span className="w-9 h-9 rounded-full bg-kerala-700 text-white text-[12px] font-semibold flex items-center justify-center">{initialsOf(session)}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{session.user.name ?? session.user.email}</div>
                      <div className="text-[10px] uppercase tracking-wider text-kerala-700">{session.user.role}</div>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded text-gray-800 hover:bg-kerala-50"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                  {['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'].includes(session.user.role) && (
                    <Link href="/dr" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded text-gray-800 hover:bg-kerala-50"><Stethoscope className="w-4 h-4" /> Doctor Hub</Link>
                  )}
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded text-gray-800 hover:bg-kerala-50"><Shield className="w-4 h-4" /> Admin panel</Link>
                  )}
                  <button onClick={() => { setMobileOpen(false); void signOut() }} className="w-full flex items-center gap-2 px-3 py-2 rounded text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full px-4 py-2 text-center bg-gold-500 text-white rounded-md hover:bg-gold-600 font-semibold">
                    Register
                  </Link>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="block w-full px-4 py-2 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-sm">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
