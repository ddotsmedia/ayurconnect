// AMAI microsite seed — content sourced from ayurveda-amai.org (2026-05).
// Idempotent: upserts the singleton AmaiPage by slug, then replaces its child
// rows. Safe to re-run. Run directly:  tsx packages/db/prisma/seed-amai.ts
//
// Everything here is editable afterwards in the admin panel at /admin/amai —
// this seed just gives the page real content on first deploy.

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const SLUG = 'amai'

const PAGE = {
  orgName:  'Ayurveda Medical Association of India',
  shortName: 'AMAI',
  tagline:  'To promote Quality Ayurveda for Public health',
  mission:  'To promote Quality Ayurveda for Public health.',
  aboutText: [
    'The Ayurveda Medical Association of India (AMAI) is the professional body of Ayurvedic physicians, formed through the merger of two regional associations.',
    'An earlier association was formed in March 1968 by pioneers including Dr. PK Jayaprakash, Dr. N Ramakrishna and Dr. PK Ramachandran, who protested against quackery in the 1967 Medical Bill. By the 1970s a separate adhoc committee had formed in Thiruvananthapuram, led by Dr. B Chakrapani Varrier.',
    'After initial tensions, the two groups unified — discussions facilitated by Dr. TV Ramankutty Varrier and Dr. T. Gopinath. On 10 February 1978, leaders meeting at Guruvayoor adopted the name "Ayurveda Medical Association of India".',
    'The inaugural conference elected Dr. NS Narayanan Nair as President and Dr. M Gopalakrishnan as General Secretary.',
  ].join('\n'),
  foundedInfo: [
    'Founded 13 August 1978 at Bini Tourist Home, Thrissur.',
    'Inaugurated by the then Health Minister, Mr. J. Chittaranjan.',
  ].join('\n'),
  strategicNote: 'AMAI has consistently advocated for the rights of Ayurvedic practitioners and students, with major campaigns spanning 1979–1995.',
  membershipInfo: [
    'AMAI offers membership to Ayurvedic physicians, with access to the monthly APTA journal.',
    'Members can participate in CME programmes and professional development activities. Online application is available through the AMAI portal.',
  ].join('\n'),
  contactAddress: 'AMAI State Office, Angamaly, Kerala, India',
  contactPhone:  '',
  contactEmail:  '',
  websiteUrl:    'https://ayurveda-amai.org',
  registrationInfo: '',
  copyrightText: '© 2026 Ayurveda Medical Association of India. All rights reserved.',
  published: true,
}

const OFFICE_BEARERS: Array<{ name: string; position: string; category: string }> = [
  { name: 'Dr. Leena C D',          position: 'President',         category: 'executive' },
  { name: 'Dr. Vishnu Nampoothiri', position: 'Vice President',    category: 'executive' },
  { name: 'Dr. Ajith Kumar K C',    position: 'General Secretary', category: 'executive' },
  { name: 'Dr. Muhammad Razi',      position: 'Treasurer',         category: 'executive' },
  { name: 'Dr. Shabeel Ibrahim',    position: 'Secretary',         category: 'secretary' },
  { name: 'Dr. Rajesh B',           position: 'Secretary',         category: 'secretary' },
  { name: 'Dr. Sirisooraj P C',     position: 'Secretary',         category: 'secretary' },
  { name: 'Dr. KK Savitri',         position: 'Chairperson',       category: 'women' },
  { name: 'Dr. Jayashree Danesh',   position: 'Convener',          category: 'women' },
  { name: 'Dr. Usha K. Puthumana',  position: 'Chief Editor',      category: 'apta' },
  { name: 'Dr. Rajasekharan Nair G', position: 'Managing Editor',  category: 'apta' },
]

const MILESTONES: Array<{ year: string; description: string }> = [
  { year: '1968', description: 'Earlier association formed by pioneers protesting against quackery in the 1967 Medical Bill.' },
  { year: '1978', description: 'AMAI founded on 13 August at Thrissur through the merger of two regional associations.' },
  { year: '1985', description: 'Seminar on Integrated Medical Practice held at Ernakulam.' },
  { year: '1989', description: 'APTA publication launched at Guruvayoor.' },
  { year: '2000', description: 'Members directory created.' },
  { year: '2006', description: 'ASWAS family benefit scheme established.' },
  { year: '2007', description: 'State office building completed at Angamaly.' },
  { year: '2010', description: 'National Expo held at Thrissur.' },
  { year: '2014', description: 'Research Foundation and Trivandrum liaison office established.' },
]

const LIST_ITEMS: Array<{ section: string; text: string }> = [
  // Vision
  { section: 'vision', text: 'Unity of Ayurvedic Physicians' },
  { section: 'vision', text: 'To be an essential part of the professional life of every Ayurvedic physician' },
  { section: 'vision', text: 'Propagation of Ayurveda Science' },
  { section: 'vision', text: 'Promotion of Quality Ayurvedic Solutions for Public Health' },
  { section: 'vision', text: 'Meeting the issues of Ayurvedic physicians and students' },
  // Core values
  { section: 'core_value', text: 'Propagation' },
  { section: 'core_value', text: 'Promotion' },
  { section: 'core_value', text: 'Excellence' },
  { section: 'core_value', text: 'Integrity and Ethical Behaviour' },
  // Strategic issues
  { section: 'strategic_issue', text: 'Implementation of BAMS credentials (1979)' },
  { section: 'strategic_issue', text: 'Access to diagnostic equipment (1983)' },
  { section: 'strategic_issue', text: 'Opposition to regulatory overreach (1984)' },
  { section: 'strategic_issue', text: 'Support for student institutional needs (1985–1995)' },
  { section: 'strategic_issue', text: 'Educational rights including surgical training (1987–1988)' },
  { section: 'strategic_issue', text: 'Counter to unregulated traditional medicine practices (1989)' },
  // Activities & events
  { section: 'activity', text: 'CME programmes and series for practitioners' },
  { section: 'activity', text: 'State conferences' },
  { section: 'activity', text: 'Monthly APTA journal publication' },
  { section: 'activity', text: 'Awards programmes' },
  { section: 'activity', text: 'Sports events including badminton tournaments' },
  // Committees
  { section: 'committee', text: 'Kerala State Committee' },
  { section: 'committee', text: 'State Executive Committee' },
  { section: 'committee', text: 'Zone Committee' },
  { section: 'committee', text: 'District Committee' },
  { section: 'committee', text: 'Area Committee' },
  { section: 'committee', text: 'Women Sub Committee' },
  { section: 'committee', text: 'District Office Bearers' },
  { section: 'committee', text: 'APTA Editorial Board' },
]

async function main() {
  console.log('seeding AMAI microsite…')

  const page = await prisma.amaiPage.upsert({
    where:  { slug: SLUG },
    update: PAGE,
    create: { slug: SLUG, ...PAGE },
  })

  // Full replace of child rows — keeps the seed idempotent.
  await prisma.amaiOfficeBearer.deleteMany({ where: { pageId: page.id } })
  await prisma.amaiMilestone.deleteMany({ where: { pageId: page.id } })
  await prisma.amaiListItem.deleteMany({ where: { pageId: page.id } })

  await prisma.amaiOfficeBearer.createMany({
    data: OFFICE_BEARERS.map((b, i) => ({ ...b, pageId: page.id, sortOrder: i })),
  })
  await prisma.amaiMilestone.createMany({
    data: MILESTONES.map((m, i) => ({ ...m, pageId: page.id, sortOrder: i })),
  })
  const sectionCounters: Record<string, number> = {}
  await prisma.amaiListItem.createMany({
    data: LIST_ITEMS.map((l) => {
      const sortOrder = sectionCounters[l.section] ?? 0
      sectionCounters[l.section] = sortOrder + 1
      return { ...l, pageId: page.id, sortOrder }
    }),
  })

  console.log('✓ seeded AMAI:', {
    officeBearers: OFFICE_BEARERS.length,
    milestones: MILESTONES.length,
    listItems: LIST_ITEMS.length,
  })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
