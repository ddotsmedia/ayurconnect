export type PathNode = { role: string; duration: string; salary: string; qualifications: string; link?: { label: string; href: string } }
export type CareerPath = { slug: string; name: string; tagline: string; icon: string; color: string; nodes: PathNode[] }

export const PATHS: CareerPath[] = [
  {
    slug: 'clinical-practice',
    name: 'Clinical Practice',
    tagline: 'BAMS → hospital → specialty → senior consultant',
    icon: '🩺',
    color: 'kerala-700',
    nodes: [
      { role: 'BAMS Graduate',                  duration: '5.5 years',   salary: 'Stipend during internship',     qualifications: 'BAMS (CCIM/NCISM)',                              link: { label: 'Browse fresher jobs',    href: '/jobs?expMax=1' } },
      { role: 'House Surgeon / Intern',         duration: '1 year',      salary: '₹10,000 – 20,000 / mo',        qualifications: 'Active internship',                              link: { label: 'Internship roles',       href: '/jobs?jobType=internship' } },
      { role: 'Junior Doctor at Hospital',      duration: '2-3 years',   salary: '₹25,000 – 45,000 / mo',        qualifications: 'BAMS + CCIM/KSMC registration',                  link: { label: 'Junior doctor jobs',     href: '/jobs?expMin=0&expMax=3' } },
      { role: 'Pursue MD/MS Specialisation',    duration: '3 years',     salary: 'Stipend ₹40,000-60,000 / mo',  qualifications: 'MD/MS (Panchakarma, Kayachikitsa, etc.)',         link: { label: 'AIAPGET prep',            href: '/learn/mcq' } },
      { role: 'Specialist Consultant',          duration: '3-5 years',   salary: '₹60,000 – 1,20,000 / mo',      qualifications: 'MD/MS + clinical experience',                    link: { label: 'Specialist jobs',         href: '/jobs?expMin=3' } },
      { role: 'Senior Consultant / Chief Physician', duration: '10+ years', salary: '₹1.5–3 L+ / mo',           qualifications: 'MD/MS + 10y experience + reputation',            link: { label: 'Senior roles',            href: '/jobs?expMin=10' } },
    ],
  },
  {
    slug: 'academic',
    name: 'Academic',
    tagline: 'Teaching + research + institutional leadership',
    icon: '🎓',
    color: 'amber-600',
    nodes: [
      { role: 'BAMS + MD/MS',              duration: '8.5 years',   salary: 'Stipend during PG',          qualifications: 'BAMS + MD/MS' },
      { role: 'Assistant Professor',       duration: '4-7 years',   salary: '₹60,000 – 90,000 + DA',      qualifications: 'MD/MS + UGC/NCISM eligibility',                     link: { label: 'Academic jobs',     href: '/jobs?q=lecturer' } },
      { role: 'Associate Professor',       duration: '4-7 years',   salary: '₹90,000 – 1,40,000 + DA',    qualifications: 'PhD + publications + experience' },
      { role: 'Professor',                 duration: '5-10 years',  salary: '₹1.5 – 2.2 L + DA',         qualifications: 'PhD + extensive publications + service' },
      { role: 'HOD / Principal',           duration: '5+ years',    salary: '₹2 – 3 L + admin allowance',  qualifications: 'Senior professor + administrative aptitude' },
    ],
  },
  {
    slug: 'international-gcc',
    name: 'International (GCC)',
    tagline: 'BAMS → DHA/MOH licensing → UAE practice → own clinic',
    icon: '🌍',
    color: 'rose-600',
    nodes: [
      { role: 'BAMS + 2 years clinical experience', duration: '7.5 years',  salary: '₹25,000 – 45,000 (India)',  qualifications: 'BAMS + CCIM/KSMC + clinical exposure' },
      { role: 'DHA / MOH Exam Preparation',         duration: '4-8 weeks',   salary: 'Self-funded',               qualifications: 'Dataflow PSV + study',                              link: { label: 'Licensing guide',  href: '/jobs/licensing/dha-dubai' } },
      { role: 'License Application + Activation',   duration: '6-12 weeks',  salary: 'AED 6,000 – 8,500 fees',    qualifications: 'Exam pass + job offer + Dataflow' },
      { role: 'Junior Practitioner at UAE Clinic',  duration: '2-3 years',   salary: 'AED 8,000 – 14,000 / mo',   qualifications: 'Active DHA/MOH license',                            link: { label: 'UAE jobs',          href: '/jobs/ayurveda-jobs/uae' } },
      { role: 'Senior Practitioner',                duration: '3-5 years',   salary: 'AED 14,000 – 22,000 / mo',  qualifications: 'Reputation + patient volume' },
      { role: 'Own Practice / Partner',             duration: 'long-term',   salary: 'AED 20,000+ + profit share', qualifications: 'License + business setup + capital' },
    ],
  },
  {
    slug: 'wellness-entrepreneurship',
    name: 'Wellness & Entrepreneurship',
    tagline: 'BAMS → hospital → Panchakarma specialty → own centre',
    icon: '🌱',
    color: 'emerald-700',
    nodes: [
      { role: 'BAMS + Hospital Experience',         duration: '7.5 years',  salary: '₹30,000 – 50,000 / mo',     qualifications: 'BAMS + 2-3y clinical' },
      { role: 'Panchakarma Specialisation',         duration: '3 years',    salary: 'During MD',                  qualifications: 'MD/MS Panchakarma',                                  link: { label: 'Panchakarma jobs', href: '/jobs/specialization/panchakarma' } },
      { role: 'Wellness Centre / Resort Consultant', duration: '3-5 years',  salary: '₹50,000 – 1,20,000 / mo + accommodation', qualifications: 'Specialty + therapeutic skills' },
      { role: 'Own Clinic / Centre',                 duration: '5+ years',   salary: 'Variable (₹1.5 – 5 L / mo at maturity)', qualifications: 'License + capital + management' },
      { role: 'Franchise / Brand Building',         duration: '10+ years',  salary: 'Variable + equity',          qualifications: 'Track record + business acumen' },
    ],
  },
  {
    slug: 'telemedicine',
    name: 'Telemedicine',
    tagline: 'BAMS → clinical foundation → online practice → content creator',
    icon: '📱',
    color: 'blue-600',
    nodes: [
      { role: 'BAMS Graduate',                       duration: '5.5 years',  salary: 'Stipend',                     qualifications: 'BAMS' },
      { role: 'Clinical Experience (in-person)',     duration: '2 years',    salary: '₹25,000 – 45,000 / mo',       qualifications: 'BAMS + active registration' },
      { role: 'Telemedicine Training + Setup',       duration: '3-6 months', salary: 'Self-funded',                qualifications: 'Telemedicine practice guidelines familiarity' },
      { role: 'Telemedicine Practice',               duration: '2-3 years',  salary: '₹250-1,200 per consult (10-30/day)', qualifications: 'Platform onboarding + reputation',              link: { label: 'Telemedicine jobs', href: '/jobs?jobType=telemedicine' } },
      { role: 'Multi-platform Consultant',           duration: '3-5 years',  salary: '₹2 – 4 L / mo',               qualifications: 'Strong digital presence + niche' },
      { role: 'Health Content Creator / Educator',   duration: 'long-term', salary: 'Variable (₹1 – 10 L+ / mo)',  qualifications: 'Audience + monetisation strategy' },
    ],
  },
]

export const PATH_SLUGS = PATHS.map((p) => p.slug)
