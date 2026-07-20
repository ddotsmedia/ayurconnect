import { redirect } from 'next/navigation'

export const metadata = { title: 'Patient dashboard', robots: { index: false, follow: false } }

// The existing /dashboard is already the patient dashboard (upcoming
// appointments, saved doctors, prescriptions, journal, prakriti). Rather
// than duplicating that 500-line surface here, alias /patient/dashboard
// to it so the route the task spec asks for exists and lands the user in
// the right place.
export default function PatientDashboardAlias() {
  redirect('/dashboard')
}
