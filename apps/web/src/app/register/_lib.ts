import { signUp } from '../../lib/auth-client'

export type SignupCore = { name: string; email: string; password: string; callbackURL?: string }

// LocalStorage keys for "pending profile" data set before signup and read after
// email verification. See PENDING_DOCTOR_KEY / _HOSPITAL / _PATIENT below.
export const PENDING_DOCTOR_KEY   = 'ayurconnect:pending:doctor'
export const PENDING_HOSPITAL_KEY = 'ayurconnect:pending:hospital'
export const PENDING_PATIENT_KEY  = 'ayurconnect:pending:patient'

export async function signUpUser({ name, email, password, callbackURL }: SignupCore) {
  // callbackURL: Better Auth appends this to the verification-email link so
  // the user lands on /verify-callback after clicking, where we finish the
  // role-specific profile setup with a now-active session.
  const res = await signUp.email({
    name: name || email.split('@')[0],
    email,
    password,
    ...(callbackURL ? { callbackURL } : {}),
  })
  const err = (res as { error?: { message?: string } }).error
  if (err) throw new Error(err.message ?? 'Could not create account')
  return res
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error ?? '' } catch { /* ignore */ }
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  return (await res.json()) as T
}

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

export const SPECIALIZATIONS = [
  'Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya',
  'Shalya Tantra', 'Shalakya', 'Manasika', 'Rasashastra', 'Dravyaguna', 'Roganidana',
]

export const HOSPITAL_TYPES = ['hospital', 'panchakarma', 'wellness', 'clinic']
