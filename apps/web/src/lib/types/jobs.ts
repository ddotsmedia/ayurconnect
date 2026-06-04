export type UserRole = 'doctor' | 'hospital' | 'admin' | 'public'

export type JobStatus = 'pending' | 'active' | 'closed' | 'rejected'

export type Currency = 'INR' | 'AED' | 'USD'

export type Specialty =
  | 'Kayachikitsa'
  | 'Panchakarma'
  | 'Prasuti Tantra'
  | 'Kaumarbhritya'
  | 'Shalya'
  | 'Shalakya'
  | 'Manasika'
  | 'Rasashastra'
  | 'General Practice'
  | 'Research'
  | 'Online Consultation'

export type JobKind = 'hiring' | 'availability'
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Locum'

export interface JobListing {
  id: string
  kind?: JobKind
  title: string
  clinic?: string | null
  location?: string | null
  type: EmploymentType | string
  specialty?: Specialty | string | null
  qualification?: string[]
  qualifications?: string[]
  expMin?: number | null
  expMax?: number | null
  salary?: string | null
  salaryDisplay?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: Currency | null
  postedAt?: string
  createdAt?: string
  deadline?: string | null
  urgent?: boolean
  featured?: boolean
  remote?: boolean
  tags?: string[]
  description: string
  requirements?: string[]
  benefits?: string[]
  contactEmail?: string | null
  logoInitials?: string | null
  logoColor?: string | null
  status?: JobStatus
  postedByRole?: UserRole | string | null
  applicationCount?: number
  district?: string | null
}

export interface JobApplication {
  id: string
  jobId: string
  name: string
  email: string
  phone: string
  qualification: string
  experience: string
  coverNote: string
  appliedAt: string
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected'
}

export interface DoctorAvailabilityPost {
  lookingFor: 'Locum Cover' | 'Part-time' | 'Collaboration' | 'Research Partner'
  specialty: Specialty
  location: string
  availFrom: string
  availDurationDays: number
  description: string
  contactKind: 'email' | 'whatsapp' | 'phone'
  contactValue: string
}
