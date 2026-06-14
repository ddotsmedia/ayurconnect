'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Stethoscope, ShieldCheck } from 'lucide-react'
import { signUpUser, postJson, SPECIALIZATIONS } from '../_lib'
import { BatchmatesFinder } from '../../../components/doctor/BatchmatesFinder'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { PhoneInput } from '../../../components/phone-input'
import { detectCountry, rememberCountry } from '../../../lib/detect-country'
import { FaqAccordion } from '../../../components/seo/FaqAccordion'

export default function DoctorRegisterPage() {
  const router = useRouter()
  const search = useSearchParams()
  const refCode = search?.get('ref') ?? null
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    qualification: '', specialization: '',
    country: 'IN', state: '', district: '',
    experienceYears: '', contact: '', languages: 'Malayalam, English',
    // Kerala roots (additive, all optional)
    homeDistrict: '', college: '', batchYear: '', ksmcRegNumber: '',
    lineageOrTradition: '',
    // Abroad regulatory
    localRegBody: '', localRegNumber: '',
    // Treatments + practice
    practiceMode: 'both',
    specialTreatments: '',  // comma-separated → array on submit
    aboutMl: '', bio: '',
    // Credential URLs (v1 doctor-supplied URL)
    degreeCertUrl: '', regCertUrl: '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, country: detectCountry() }))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await signUpUser({ name: form.name, email: form.email, password: form.password })
      const promoted = await postJson<{ doctorId?: string }>('/me/promote-to-doctor', {
        name: form.name,
        specialization: form.specialization || null,
        country: form.country,
        state: form.state || null,
        district: form.district,
        qualification: form.qualification || null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
        contact: form.contact || null,
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        // Kerala roots
        homeDistrict:       form.homeDistrict || null,
        college:            form.college || null,
        collegeSlug:        form.college ? form.college.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null,
        batchYear:          form.batchYear ? Number(form.batchYear) : null,
        ksmcRegNumber:      form.ksmcRegNumber || null,
        lineageOrTradition: form.lineageOrTradition || null,
        // Abroad regulatory
        localRegBody:       form.localRegBody || null,
        localRegNumber:     form.localRegNumber || null,
        localRegCountry:    form.country !== 'IN' ? form.country : null,
        // Practice + treatments
        practiceMode:       form.practiceMode,
        specialTreatmentsOffered: form.specialTreatments.split(',').map((s) => s.trim()).filter(Boolean),
        aboutMl:            form.aboutMl || null,
        bio:                form.bio || null,
        // Credential URL refs
        degreeCertUrl:      form.degreeCertUrl || null,
        regCertUrl:         form.regCertUrl || null,
      })
      rememberCountry(form.country)
      // Track referral if a ?ref= code was on the URL.
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
          <p className="text-sm text-muted mt-1 px-2">Get a public profile after verification.</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 sm:mb-5 text-xs sm:text-sm text-amber-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Your profile starts in <strong>pending</strong> state. An admin cross-checks the details against the CCIM register before it goes live in the public directory. You can edit fields any time from your dashboard.
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Full name (Dr. ...)"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" placeholder="Dr. Anjali Menon" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" /></Field>
            <Field label="Password (min 8)"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" /></Field>
            <Field label="Phone / WhatsApp">
              <PhoneInput value={form.contact} onChange={(e164) => setForm({ ...form, contact: e164 })} defaultCountry={form.country} />
            </Field>
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Qualification">
              <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required className="input" placeholder="BAMS, MD (Panchakarma)" />
            </Field>
            <Field label="Specialization (optional)">
              <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input">
                <option value="">Not sure yet / General Ayurveda</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="block text-[11px] text-gray-500 mt-1">You can change this any time from your dashboard.</span>
            </Field>
            <Field label="Country">
              <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c, state: '' })} />
            </Field>
            <Field label="State / region">
              <StateSelect country={form.country} value={form.state} onChange={(s) => setForm({ ...form, state: s })} />
            </Field>
            <Field label="City / district *">
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required placeholder="e.g. Ernakulam, Mumbai, Dubai" className="input" />
            </Field>
            <Field label="Experience (years)">
              <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="input" />
            </Field>
            <Field label="Languages (comma-separated)">
              <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="input" />
            </Field>
            <Field label="Practice mode">
              <select value={form.practiceMode} onChange={(e) => setForm({ ...form, practiceMode: e.target.value })} className="input">
                <option value="both">In-person + teleconsult</option>
                <option value="in_person">In-person only</option>
                <option value="teleconsult">Teleconsult only</option>
              </select>
            </Field>
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Kerala roots <span className="text-[10px] text-gray-400 normal-case font-normal">(optional but encouraged)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Home district (Kerala)">
              <select value={form.homeDistrict} onChange={(e) => setForm({ ...form, homeDistrict: e.target.value })} className="input">
                <option value="">— not from Kerala / skip —</option>
                {['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Ayurveda college (BAMS)">
              <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="input" placeholder="e.g. Government Ayurveda College, Thiruvananthapuram" />
            </Field>
            <Field label="Batch year">
              <input type="number" min={1950} max={new Date().getFullYear()} value={form.batchYear} onChange={(e) => setForm({ ...form, batchYear: e.target.value })} className="input" placeholder="e.g. 2008" />
            </Field>
            {form.college.trim().length > 3 && (
              <div className="md:col-span-2">
                <BatchmatesFinder
                  collegeSlug={form.college.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
                  batchYear={form.batchYear ? Number(form.batchYear) : null}
                />
              </div>
            )}
            <Field label="KSMC reg number (optional)">
              <input value={form.ksmcRegNumber} onChange={(e) => setForm({ ...form, ksmcRegNumber: e.target.value })} className="input" placeholder="Kerala State Medical Council" />
            </Field>
            <Field label="Lineage or tradition (optional)">
              <input value={form.lineageOrTradition} onChange={(e) => setForm({ ...form, lineageOrTradition: e.target.value })} className="input" placeholder="e.g. Ashtavaidya — Pulamanthole Mooss" />
            </Field>
          </div>

          {form.country !== 'IN' && (
            <>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Local regulatory registration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field label="Local reg body">
                  <input value={form.localRegBody} onChange={(e) => setForm({ ...form, localRegBody: e.target.value })} className="input" placeholder="e.g. DHA, SCFHS, GMC, MOHAP" />
                </Field>
                <Field label="Local reg number">
                  <input value={form.localRegNumber} onChange={(e) => setForm({ ...form, localRegNumber: e.target.value })} className="input" />
                </Field>
              </div>
            </>
          )}

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Treatments + bio</h2>
          <div className="space-y-3 sm:space-y-4">
            <Field label="Special treatments offered (comma-separated)">
              <input value={form.specialTreatments} onChange={(e) => setForm({ ...form, specialTreatments: e.target.value })} className="input" placeholder="Pizhichil, Njavarakizhi, Sirodhara, Panchakarma" />
            </Field>
            <Field label="About yourself — English (bio)">
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="input" placeholder="2–3 sentences on your practice + philosophy. Public on your profile." />
            </Field>
            <Field label="About yourself — മലയാളം (Malayalam bio, optional but recommended)">
              <textarea value={form.aboutMl} onChange={(e) => setForm({ ...form, aboutMl: e.target.value })} rows={4} className="input" placeholder="നിങ്ങളെക്കുറിച്ച് ഹ്രസ്വവിവരണം — മലയാളിയായ രോഗികൾക്ക് വിശ്വാസമേറും." />
            </Field>
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Credentials <span className="text-[10px] text-gray-400 normal-case font-normal">(URL refs; LinkedIn / drive link OK for now)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="BAMS degree certificate URL">
              <input type="url" value={form.degreeCertUrl} onChange={(e) => setForm({ ...form, degreeCertUrl: e.target.value })} className="input" placeholder="https://…" />
            </Field>
            <Field label="Registration certificate URL">
              <input type="url" value={form.regCertUrl} onChange={(e) => setForm({ ...form, regCertUrl: e.target.value })} className="input" placeholder="https://…" />
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
            a: 'Yes. AyurConnect only verifies practitioners with active CCIM (Central Council of Indian Medicine) or equivalent State Medical Council registration. Upload your registration certificate during onboarding — verification typically completes within 48 hours.' },
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
