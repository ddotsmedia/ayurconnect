'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Stethoscope, ShieldCheck, Upload, Loader2, Trash2, UserRound } from 'lucide-react'
import { signUpUser, postJson, SPECIALIZATIONS } from '../_lib'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { PhoneInput } from '../../../components/phone-input'
import { rememberCountry } from '../../../lib/detect-country'
import { FaqAccordion } from '../../../components/seo/FaqAccordion'

// Lean signup form (2026-07-20): stripped to reduce drop-off. Removed
// bio/aboutMl textareas, certificate URL fields, Kerala-roots block
// (homeDistrict/college/batchYear/ksmcRegNumber/lineage), local regulatory
// fields, treatments + practiceMode + languages. Doctors enrich these later
// from the dashboard. Only name + district are API-required.

export default function DoctorRegisterPage() {
  const router = useRouter()
  const search = useSearchParams()
  const refCode = search?.get('ref') ?? null

  const [form, setForm] = useState({
    firstName:       '',
    lastName:        '',
    email:           '',
    password:        '',
    contact:         '',       // phone
    qualification:   '',
    specialization:  '',
    experienceYears: '',
    district:        '',       // combined city / district input
    state:           '',
    country:         'IN',     // hard-default India — no geo auto-detect
    regNumber:       '',       // REQUIRED license/reg number (task 2026-07-20)
    photoUrl:        '',       // optional profile picture URL (from /uploads/avatar)
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)
  // Avatar uploader state — separate from form so we can show upload progress
  // and per-upload errors without blocking form submission.
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarErr,  setAvatarErr]  = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const AVATAR_MAX_BYTES = 500 * 1024   // matches server cap

  async function pickAvatar(file: File) {
    setAvatarErr(null)
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setAvatarErr(`Not a supported image (${file.type}). Use JPG, PNG, or WebP.`); return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarErr(`File too large (${Math.round(file.size / 1024)} KB) — max 500 KB.`); return
    }
    setAvatarBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/uploads/avatar', { method: 'POST', credentials: 'include', body: fd })
      const j = await res.json().catch(() => ({} as { url?: string; error?: string }))
      if (res.status === 413) throw new Error(j.error ?? 'File too large — max 500 KB')
      if (!res.ok || !j.url) throw new Error(j.error ?? `HTTP ${res.status}`)
      setForm((f) => ({ ...f, photoUrl: j.url as string }))
    } catch (e) {
      setAvatarErr(e instanceof Error ? e.message : String(e))
    } finally {
      setAvatarBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    // Client-side gates. API enforces the same rules — this just spares
    // a network round-trip.
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErr('First name and last name are required.'); setBusy(false); return
    }
    if (!form.regNumber.trim()) {
      setErr('Registration number is required.'); setBusy(false); return
    }
    const composedName = `${form.firstName.trim()} ${form.lastName.trim()}`
    try {
      // Email verification disabled 2026-07-21 → signUp auto-signs-in.
      // The promote call inherits that session and completes the doctor
      // profile in one atomic UX step. Profile lands in moderationStatus
      // 'pending' → admin approves at /admin/doctors before public listing.
      await signUpUser({ name: composedName, email: form.email, password: form.password })
      const promoted = await postJson<{ doctorId?: string }>('/me/promote-to-doctor', {
        firstName:          form.firstName.trim(),
        lastName:           form.lastName.trim(),
        name:               composedName,
        specialization:     form.specialization || null,
        country:            form.country,
        state:              form.state || null,
        district:           form.district,
        qualification:      form.qualification || null,
        experienceYears:    form.experienceYears ? Number(form.experienceYears) : null,
        contact:            form.contact || null,
        registrationNumber: form.regNumber.trim(),
        photoUrl:           form.photoUrl || null,
      })
      rememberCountry(form.country)
      if (refCode && promoted?.doctorId) {
        void fetch('/api/doctor-viral/track-registration', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code: refCode, doctorId: promoted.doctorId }),
        }).catch(() => {})
      }
      router.push('/doctor/welcome')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/register" className="inline-block py-1 text-sm text-gray-500 hover:underline">← all roles</Link>
        <header className="mt-2 sm:mt-3 text-center mb-5 sm:mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-700 ring-4 ring-amber-100">
            <Stethoscope className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-kerala-700 mt-3">Sign up — Doctor</h1>
          <p className="text-sm text-muted mt-1 px-2">Get a public profile after verification. Takes under a minute.</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 sm:mb-5 text-xs sm:text-sm text-amber-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Your profile starts in <strong>pending</strong> state. An admin verifies your details against the CCIM register before it goes live. You can add photo, bio, treatments, and credentials any time from your dashboard.
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-4 sm:p-6 space-y-4">
          {/* Optional profile picture — 500 KB max, jpg/png/webp only. Server
              downscales to 400×400 WebP. Renders a generic avatar fallback
              until uploaded. */}
          <div>
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Profile picture (optional)</span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {form.photoUrl
                  ? // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  : <UserRound className="w-8 h-8 text-gray-400" />
                }
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {avatarBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {form.photoUrl ? 'Change' : 'Upload'}
                  </button>
                  {form.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photoUrl: '' })}
                      disabled={avatarBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">JPG / PNG / WebP · max 500 KB.</p>
                {avatarErr && <p className="text-xs text-red-600">{avatarErr}</p>}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickAvatar(f) }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label={<>First name <span className="text-rose-600">*</span></>}>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="input" placeholder="Anjali" autoComplete="given-name" />
            </Field>
            <Field label={<>Last name <span className="text-rose-600">*</span></>}>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="input" placeholder="Menon" autoComplete="family-name" />
            </Field>
            <Field label={<>Phone / WhatsApp <span className="text-rose-600">*</span></>}>
              <PhoneInput value={form.contact} onChange={(e164) => setForm({ ...form, contact: e164 })} defaultCountry={form.country} />
            </Field>
            <Field label={<>Email <span className="text-rose-600">*</span></>}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" />
            </Field>
            <Field label={<>Password (min 8) <span className="text-rose-600">*</span></>}>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" />
            </Field>
            <Field label={<>Qualification <span className="text-rose-600">*</span></>}>
              <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required className="input" placeholder="BAMS, MD (Panchakarma)" />
            </Field>
            <Field label="Specialization">
              <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input">
                <option value="">Not sure / General Ayurveda</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={<>Registration number <span className="text-rose-600">*</span></>}>
              <input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} required className="input" placeholder="CCIM / KSMC / DHA / SCFHS reg no." maxLength={50} />
            </Field>
            <Field label="Experience (years)">
              <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="input" placeholder="e.g. 8" />
            </Field>
            <Field label={<>City / district <span className="text-rose-600">*</span></>}>
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required placeholder="e.g. Ernakulam, Mumbai, Dubai" className="input" />
            </Field>
            <Field label="State / region">
              <StateSelect country={form.country} value={form.state} onChange={(s) => setForm({ ...form, state: s })} />
            </Field>
            <Field label="Country">
              <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c, state: '' })} />
            </Field>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy} className="w-full py-3 sm:py-2.5 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50 text-base">
            {busy ? 'Creating account + profile…' : 'Create doctor account'}
          </button>
          <p className="text-xs text-center text-gray-500">
            Already registered? <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link>
          </p>
        </form>

        <Style />
      </div>

      <FaqAccordion
        heading="Doctor onboarding — frequently asked"
        items={[
          { q: 'Do I need to be CCIM-registered to list my profile?',
            a: 'Yes. AyurConnect only verifies practitioners with active CCIM (Central Council of Indian Medicine) or equivalent State Medical Council registration. Upload your registration certificate from the dashboard after signup — verification typically completes within 48 hours.' },
          { q: 'What does it cost to maintain a profile?',
            a: 'Listing your profile is free for verified BAMS / MD-Ayurveda doctors. AyurConnect retains a 12% platform fee on completed online consultations only. In-person consultation revenue stays 100% with you — we don\'t see or touch it.' },
          { q: 'Can I practise on AyurConnect while still in service at a government hospital?',
            a: 'Yes, provided your government employer\'s policies permit private online practice (most allow it post-duty hours). AyurConnect doesn\'t share your private-practice data with employers; appointments are scheduled around availability you control.' },
          { q: 'How do I get paid for online consultations from UAE / GCC patients?',
            a: 'Razorpay handles international card payments. We disburse weekly to your registered Indian bank account in INR — the FX conversion is handled automatically. UAE patients can also pay via Razorpay UAE rails (AED card / Apple Pay) starting Q3 2026.' },
          { q: 'What happens if I get a poor review or a patient files a complaint?',
            a: 'Patient reviews are moderated for genuineness (we verify the patient had an actual appointment with you). Complaints are handled by our medical-affairs team within 72 hours — you\'re given the opportunity to respond before any visible action is taken. Profile suspension is reserved for verified ethics breaches, not single negative reviews.' },
        ]}
      />
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function Style() {
  return (
    <style jsx global>{`
      /* Mobile uses 16px to suppress iOS Safari auto-zoom on focus; desktop reverts to 14px. */
      .input { width:100%; border:1px solid #e5e7eb; border-radius:0.375rem; padding:0.625rem 0.75rem; font-size:16px; background:white; }
      .input:focus { outline:none; box-shadow:0 0 0 1px #1b5e20; border-color:#1b5e20; }
      @media (min-width: 640px) {
        .input { padding:0.5rem 0.75rem; font-size:0.875rem; }
      }
    `}</style>
  )
}
