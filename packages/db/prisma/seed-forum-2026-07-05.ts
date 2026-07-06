// AUTO-GENERATED 2026-07-05. Additive forum seed — 10 Q&A posts + replies.
// Run manually: pnpm --filter @ayurconnect/db exec tsx prisma/seed-forum-2026-07-05.ts
// Does NOT run as part of `pnpm db:seed` (per project rules).
// Idempotent: skips a post if one with the same title already exists.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// System bot author. Created (or reused) once at the start of the run.
const AUTHOR_EMAIL = 'community@ayurconnect.com'
const AUTHOR_NAME  = 'AyurConnect Community'

const POSTS = [
  { daysAgo: 13, category: 'doctor-discussion', title: 'Is Panchakarma safe during pregnancy?',
    content: 'I have a first-trimester patient asking about oil-massage therapies for morning-sickness relief. Classical texts (Charaka, Sushruta) mention Garbhini Paricharya — but which specific Panchakarma procedures are contraindicated in pregnancy vs. which mild therapies (Abhyanga, Padabhyanga) are considered safe? Would appreciate peer perspectives on trimester-wise protocols.',
    replies: [
      'General rule: full Panchakarma (Vamana, Virechana, Basti) is contraindicated in pregnancy — Sushruta Sharira 3 is explicit. What IS safe: mild Abhyanga with Bala or Kshirabala taila (2nd + 3rd trimester), Padabhyanga for edema, warm oil Nasya only in 4th-6th months. Hard-avoid: strong Virechana, Kshara Basti, Raktamokshana.',
      'Would add: any therapy with strong Ushna (heating) virya is avoided in 1st trimester. Anu Taila Nasya is OK from 4th month for maternal congestion. Always screen for placenta previa before considering any external procedure. Get a written consent + coordinate with the OB.',
    ] },
  { daysAgo: 12, category: 'doctor-discussion', title: 'Best Ayurveda colleges in Kerala for PG (MD)?',
    content: 'BAMS-final year here, deciding between KUHS-affiliated colleges for MD Panchakarma vs Kayachikitsa. Looking for input on: clinical exposure quality, research culture, faculty ratio, hostel + city liveability. Rankings vary by source — would love current-student or recent-alumni takes.',
    replies: [
      'Ranked by clinical exposure IMO: GAC Thiruvananthapuram > VPSV Kottakkal > GAC Thrissur > Amrita Ernakulam. Kottakkal edges on Panchakarma volume (they run Kottakkal Arya Vaidya Sala cases). GAC Trivandrum is stronger for Kayachikitsa + academic research. Cross-check by asking recent pass-outs — email me and I can share contacts.',
      'Amrita Ernakulam has better English-medium PG culture + international patient exposure. Trade-off is fewer classical cases vs GAC hospitals. If you plan to go abroad (DHA/CNHC), Amrita\'s exposure helps. If Kerala govt or hospital chief-physician track — GAC Trivandrum is unmatched.',
    ] },
  { daysAgo: 11, category: 'doctor-discussion', title: 'DHA exam — how difficult is it for Ayurveda doctors?',
    content: 'Planning to move to Dubai. Heard the DHA General Practitioner (Ayurveda) exam is 100 MCQs, 3 hours, 60% cutoff. What does the syllabus actually cover — classical Ayurveda or modern medical basics? Any Ayurveda-specific prep resources you\'d recommend beyond the DHA official handbook?',
    replies: [
      'It\'s Ayurveda-heavy but expect ~30% modern medical basics (patient-history taking, common pharmacology interactions, radiology basics, ethics). Passing is very doable if you\'re disciplined — cleared it in 3 months of prep. Key resources: the official DHA prep handbook + our /jobs/assessments/dha-exam-readiness mock. Nadi Pariksha and Dashavidha Pariksha come up multiple times.',
      'Second all of the above. Add: the Prometric interface has a strict clock — practice timed mocks so you don\'t hit the buzzer with 20 unanswered. Common trip-up: modern-medicine ethics MCQs (informed consent, medical records) are worded very differently than the AYUSH-Act framing we learn in BAMS. Read UAE MOH ethical guidelines once.',
    ] },
  { daysAgo: 10, category: 'patient-forum', title: 'Karkidaka Kanji recipe — traditional method?',
    content: 'My grandmother used to make Karkidaka Kanji every year in July but I have never learned the exact recipe. What is the classical formula — which herbs, what quantities, how many days should it be taken? I am in Dubai and want to make it for my family this Karkidaka.' },
  { daysAgo: 9,  category: 'patient-forum',     title: 'Can Ayurveda cure thyroid permanently?',
    content: 'Diagnosed with hypothyroid (TSH 8.5) last year, on 50mcg thyroxine. My cousin says Ayurveda can cure it permanently and I can stop the tablet. Is this true, or is it managed rather than cured? Looking for an honest medical view not marketing claims.' },
  { daysAgo: 8,  category: 'doctor-discussion', title: 'Salary expectations for BAMS fresher in Kerala 2026?',
    content: 'Final year BAMS graduating in April. Advisor says private hospitals in Kerala pay ₹15-20K for freshers, but LinkedIn posts show ₹25-35K at bigger chains. What is realistic in 2026 — govt PSC (Kerala AMO) route vs private junior consultant vs wellness resort? Would appreciate current-market perspectives.' },
  { daysAgo: 7,  category: 'patient-forum',     title: 'Difference between Pizhichil and Sarvangadhara?',
    content: 'Reading about Kerala Panchakarma therapies before booking a package. Both Pizhichil and Sarvangadhara sound like full-body oil pouring — what is the actual difference, indications, and which one is right for chronic arthritis (osteoarthritis knee, 55 y/o female)?' },
  { daysAgo: 6,  category: 'doctor-discussion', title: 'How to start online Ayurveda practice from India for UAE patients?',
    content: 'Kerala-based, BAMS + MD Panchakarma, 8 years experience. Getting inquiries from UAE-based Indian expats who want teleconsults. Legal question: can I consult UAE-residents from India without a DHA/MOH license, given the consultation happens on Indian jurisdiction? Or does telemedicine cross-jurisdiction rules apply? Anyone actually doing this?' },
  { daysAgo: 5,  category: 'patient-forum',     title: 'Best herbs for hair growth — scientific evidence?',
    content: 'Losing hair rapidly at 32 (male, family history of male-pattern baldness). Ayurvedic YouTube keeps pushing Bhringraj oil, Neelibhringadi, and Amla. Which of these have actual clinical study support, not just tradition? Not looking for miracles — just want an honest evidence-based recommendation.' },
  { daysAgo: 4,  category: 'doctor-discussion', title: 'KSMC registration renewal — documents needed?',
    content: 'KSMC registration renewal comes up in October. This is my first renewal cycle since initial registration in 2021. What documents do I need — is CME evidence mandatory now? Is the process fully online through the KSMC portal, or do I still need to physically visit? Any recent-renewal doctors — how long did it take?' },
]

async function main() {
  // Author user — upsert once
  const author = await prisma.user.upsert({
    where: { email: AUTHOR_EMAIL },
    update: { name: AUTHOR_NAME },
    create: { email: AUTHOR_EMAIL, name: AUTHOR_NAME, role: 'USER' },
  })

  for (const p of POSTS) {
    // Idempotent: skip if a post with the same title exists
    const existing = await prisma.post.findFirst({ where: { title: p.title } })
    if (existing) { console.log('skip (exists)', p.title); continue }

    const createdAt = new Date(Date.now() - p.daysAgo * 86_400_000)
    const post = await prisma.post.create({
      data: {
        title: p.title,
        content: p.content,
        category: p.category,
        userId: author.id,
        language: 'en',
        createdAt,
        updatedAt: createdAt,
      },
    })

    if (p.replies?.length) {
      for (let i = 0; i < p.replies.length; i++) {
        const replyAt = new Date(createdAt.getTime() + (i + 1) * 6 * 3_600_000)  // 6h apart
        await prisma.comment.create({
          data: {
            postId: post.id,
            userId: author.id,
            content: p.replies[i],
            createdAt: replyAt,
            updatedAt: replyAt,
          },
        })
      }
    }
    console.log('created', p.title, p.replies ? `(+ ${p.replies.length} replies)` : '')
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
