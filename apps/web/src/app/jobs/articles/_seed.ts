// 10 career articles for the job portal. Stored as in-code data (no DB seed
// required) so they ship with the build. Each article is referenced from
// /jobs/articles + listed in the sitemap.

export type CareerArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  body: string  // markdown-lite (## headings + paragraphs + - bullets)
  related: Array<{ label: string; href: string }>
}

export const ARTICLES: CareerArticle[] = [
  {
    slug: 'bams-career-options-2026-complete-guide',
    title: 'BAMS Career Options 2026 — Complete Guide',
    excerpt: 'Eight viable career paths after BAMS in 2026 — from clinical practice to research, wellness, telemedicine, and abroad placements. Salary ranges, licensing requirements, growth outlook.',
    category: 'Career',
    readTime: '8 min',
    body: `## The 2026 landscape for BAMS graduates

Five years ago, "BAMS career" mostly meant private practice in your home district or a junior position at a government Ayurveda hospital. In 2026, the field has expanded dramatically. Telemedicine platforms now hire Ayurveda doctors as full-time consultants. The GCC has opened DHA, DOH, MOHAP, QCHP, and SCFHS pathways. Pharma companies need clinical researchers fluent in classical formulations. Even insurance companies want medical reviewers who understand AYUSH protocols.

This guide walks through eight realistic career paths after BAMS, with current salary ranges, licensing implications, and what the next 3-5 years likely hold.

## 1. Private clinical practice — the classical path

Still the largest single bucket. Most BAMS graduates start with one of two routes: join an established Ayurveda hospital as a junior physician (₹25,000–45,000 / month in tier-2 Kerala cities) or open a small clinic in your home district. The latter is capital-intensive (₹8–15 lakh setup) but caps higher — a busy clinic in Kochi or Trivandrum can reach ₹1.5–3 lakh / month within 3 years if you build a reputation in a specific specialization.

## 2. Panchakarma + wellness centres

Specialized therapy roles at Panchakarma centres remain in strong demand. Kerala-tradition centres prefer Ashtavaidya lineage doctors or those with MD Panchakarma. International wellness resorts (Maldives, Bali, Mauritius, GCC) actively recruit — packages of ₹80,000–₹2.5 lakh / month with accommodation are common.

## 3. International placement — GCC

The UAE, Qatar, Oman, Bahrain, and Saudi Arabia all license Ayurveda doctors under Traditional / Complementary Medicine. Average packages: AED 8,000–18,000 / month in UAE, QAR 9,000–18,000 in Qatar. Licensing process takes 8–14 weeks (see /jobs/licensing for jurisdiction-by-jurisdiction guides).

## 4. Telemedicine consulting

The fastest-growing segment. Telemedicine platforms (Practo, Tata 1mg, Apollo 24/7) hire Ayurveda doctors for per-consultation pay (₹150–400 per consult, 15–40 consults/day typical) or fixed retainers. No location lock-in — work from anywhere.

## 5. Pharma + clinical research

Companies like Himalaya, Dabur, Patanjali, Kerala Ayurveda Limited, and CCRAS-funded labs need clinical research associates, regulatory affairs specialists, and formulation development scientists. Entry roles ₹4–8 LPA, senior roles ₹15–30 LPA.

## 6. Teaching + academia

State Ayurveda colleges hire lecturers (entry ₹50,000 + DA, full prof ₹1.2–2 lakh / month). Requires PhD or MD/MS Ayurveda. Stable, pension-eligible.

## 7. Government — AYUSH ministry, public health

AYUSH ministry posts, NHM Kerala recruitment, primary health centre positions. Pay scales follow government grids (Group A entry ~₹56,100). Job security, predictable transfers, good for work-life balance.

## 8. Specialty + sub-specialty paths

MD/MS post-graduation unlocks: Panchakarma (high demand), Shalya Tantra (surgical), Prasuti Tantra (women's health, fastest-growing), Manas Roga (mental health niche). PG fellowship + foreign placement can multiply earnings 3-5x.

## What to do in your first year out

- Get CCIM + KSMC numbers active immediately
- Pick one specialization to lean into — don't stay generalist past year 2
- Build a verified profile on AyurConnect (it's free) — patients increasingly Google before they call
- Decide early: clinic owner vs employee vs international track. Each path has different upfront investments.

The Ayurveda career market in 2026 is the most diverse it has ever been. The bottleneck isn't opportunity — it's clarity. Pick a path, double down, and let your reputation compound.`,
    related: [
      { label: 'DHA Licensing Step-by-Step', href: '/jobs/licensing/dha-dubai' },
      { label: 'Panchakarma Salary in Dubai', href: '/jobs/salary/panchakarma/dubai' },
      { label: 'All licensing guides', href: '/jobs/licensing' },
    ],
  },
  {
    slug: 'ayurveda-doctor-salary-dubai-uae',
    title: 'Ayurveda Doctor Salary in Dubai UAE — What to Expect',
    excerpt: 'Realistic monthly salary ranges for Ayurveda doctors in Dubai by specialization, experience, and clinic type. 2026 data.',
    category: 'Salary',
    readTime: '6 min',
    body: `## The honest numbers

Dubai is the single most lucrative destination for Ayurveda doctors outside India. Demand is driven by a 3M+ Malayali expat community plus a growing local interest in wellness. The catch: salaries vary 3x between licensed-and-experienced versus newly-arrived practitioners.

## Base ranges by specialization (monthly, AED)

- **General BAMS**: 7,000 – 14,000 (clinic) / 5,000 – 9,000 (junior at multi-doctor centre)
- **Panchakarma specialist**: 9,000 – 18,000
- **MD Kayachikitsa**: 8,500 – 17,000
- **Prasuti Tantra / women's health**: 9,500 – 19,000
- **Senior Ashtavaidya / MD with 10+ years**: 18,000 – 32,000+ (rare, but real)

These are base salaries excluding accommodation/transport allowances and end-of-service benefits. Most clinics provide either accommodation or a housing allowance (AED 2,000–4,000 / month).

## What separates the bottom and top ranges

- **DHA licensing**: A DHA-licensed doctor earns 40-60% more than a BAMS doctor working on a "pending license" arrangement. Get DHA done as a priority.
- **Experience verified by Dataflow**: Doctors with verified 5+ years experience get the top of the range.
- **Specialization match**: Clinics targeting infertility patients (Prasuti Tantra) or chronic pain (Panchakarma) pay more for matching specialists.
- **Patient acquisition**: Some clinics pay performance bonuses (5-10% of consultation revenue) for doctors who bring repeat patients.

## Clinic types and what they pay

- **Solo-doctor clinics in Karama / Bur Dubai**: Owner-operator model. Lower base (AED 7,000–10,000) but partnership / profit-share possible after 2 years.
- **Multi-doctor chains (Dr Shyam's, AyurTreat)**: Better stability, structured pay grids, predictable raises.
- **Spa + wellness centres**: Lower medical work, higher therapy/cosmetic focus. AED 7,000–12,000.
- **Telemedicine startups**: Per-consultation pay (AED 80–200 per consult). High volume = high earnings but unpredictable.

## Hidden costs to budget for

- Annual DHA renewal: AED 2,500–3,500
- Annual indemnity insurance: AED 1,500–2,500
- Visa renewal every 2 years
- Children's schooling (if family relocates): AED 18,000–60,000 / year per child

## What's growing

Telemedicine consults, postnatal Sutika packages for Indian expat mothers, classical Panchakarma + integrative oncology. Senior doctors with research publications increasingly get speaker / consultancy roles paying AED 3,000–8,000 per engagement.`,
    related: [
      { label: 'DHA Licensing Process', href: '/jobs/licensing/dha-dubai' },
      { label: 'All Dubai Ayurveda Jobs', href: '/jobs/ayurveda-jobs/uae' },
      { label: 'Panchakarma jobs in Dubai', href: '/jobs/panchakarma-jobs/dubai' },
    ],
  },
  {
    slug: 'dha-licensing-ayurveda-step-by-step',
    title: 'DHA Licensing for Ayurveda Doctors — Step by Step',
    excerpt: 'Complete walkthrough of the DHA Sheryan licensing process for Ayurveda doctors in Dubai. Timelines, fees, document checklist, exam tips.',
    category: 'Licensing',
    readTime: '7 min',
    body: `See the full guide at /jobs/licensing/dha-dubai — this article is the practical companion.

## Before you start

DHA licensing takes 6–12 weeks from start to finish. Most candidates underestimate the document preparation phase. The exam is rarely the bottleneck — the paperwork is. Start your Dataflow Primary Source Verification in parallel with everything else.

## The four phases

### Phase 1 — Document preparation (2–4 weeks)

Gather these in original + clear PDF copies:

- Passport (valid 6+ months)
- BAMS degree certificate + final mark sheet
- CCIM / KSMC registration certificate
- Good Standing Certificate (request from KSMC; takes 1–2 weeks)
- Experience letters from each previous employer (must mention dates + role)
- Recent passport-size photo (white background)
- BLS / CPR certificate (must be current — many candidates forget this)

Apply for Dataflow PSV at this stage too. It takes 4–8 weeks independently — running in parallel saves a month.

### Phase 2 — Sheryan application (1 week)

Create an account at dha.gov.ae / Sheryan. Upload all documents. Pay the application + assessment fees (AED 3,800–5,200 total).

### Phase 3 — Prometric exam (2–4 weeks)

Book at prometric.com / dha. The exam is 100 MCQs over 150 minutes. Pass mark: 60%.

What's actually on the exam:

- 40% Ayurveda fundamentals (tridosha, sapta dhatu, classical diagnosis)
- 30% Clinical scenarios (diagnosis + treatment)
- 15% Pharmacology (classical formulations + interactions)
- 15% Ethics, communication, Dubai healthcare regulations

Study resources: Ashtanga Hridaya for fundamentals, Bhavaprakasha Nighantu for materia medica, plus DHA's published candidate guide. Most candidates clear on first attempt with 4-6 weeks prep.

### Phase 4 — License activation (1–2 weeks)

Once you have your eligibility letter and a job offer, your employer sponsors the activation. The license is tied to the facility — you cannot freelance.

## Exemption from the exam

Hold MD or MS Ayurveda + 5+ years of clinical experience? Apply for the assessment exemption with proof. Approval takes 2–3 weeks. This shortcut saves 6 weeks for senior candidates.

## Common mistakes that delay licensing

1. **Letting Dataflow lapse**: PSV is valid 6 months from completion. Don't start it too early.
2. **Wrong BLS provider**: DHA only accepts BLS from AHA / ARC / certain UAE providers. Indian BLS often gets rejected.
3. **Stale Good Standing**: Issued more than 90 days before submission = reject.
4. **Self-employment plan**: DHA licenses are facility-bound. You need an employer-sponsor before activation.

## What you'll spend overall

AED 3,800–5,200 in DHA fees + AED 1,200–1,800 for Dataflow + AED 200–400 for BLS + AED 500–1,000 in apostille / attestation. Budget AED 6,000–8,500 total.

## After you're licensed

Renew annually. Complete required CME credits (50 per year). Maintain indemnity insurance. Keep your KSMC registration active back home — DHA can revoke your license if your home registration lapses.`,
    related: [
      { label: 'Detailed jurisdiction page', href: '/jobs/licensing/dha-dubai' },
      { label: 'DOH Abu Dhabi pathway', href: '/jobs/licensing/doh-abu-dhabi' },
      { label: 'Dubai Ayurveda jobs', href: '/jobs/ayurveda-jobs/uae' },
    ],
  },
  {
    slug: 'top-10-ayurveda-hospitals-kerala-hiring',
    title: 'Top 10 Ayurveda Hospitals Hiring in Kerala',
    excerpt: 'Where Kerala\'s largest and most reputable Ayurveda hospitals post jobs, what they pay, and what they look for in candidates.',
    category: 'Hiring',
    readTime: '6 min',
    body: `## What "top" means here

This isn't a popularity ranking. It's a list of hospitals that hire consistently, have transparent compensation, treat staff well, and offer paths to specialization or international placement. Some are huge government institutions; others are 30-bed Ashtavaidya legacy centres.

## 1. Government Ayurveda College + Hospital, Thiruvananthapuram

Entry as MO / lecturer requires PSC exam. Pay grid: ₹56,100 entry + DA + HRA. Job security + pension. Vacancies posted via Kerala PSC.

## 2. Government Ayurveda College Hospital, Tripunithura (Ernakulam)

Similar PSC route. Strong Panchakarma + Shalya tradition. Patient volume rivals private hospitals.

## 3. AVS (Arya Vaidya Sala) Kottakkal

100+ branches. New branch openings every year. Hires through Vaidyaratnam P.S. Varier Foundation. Junior MO: ₹35,000–45,000 base. Senior MD/MS: ₹85,000–1.4 lakh.

## 4. Vaidyaratnam Oushadhasala, Thaikkattussery (Thrissur)

Family-run, classical Ashtavaidya lineage. Highly selective. Internship cohort each year often becomes permanent staff. Pay ₹30,000–55,000 entry.

## 5. Kottakkal Arya Vaidya Sala — international centres

Internal transfers to Singapore, Malaysia, Mauritius branches. Speak to HR at the Kottakkal HQ about international placement after 2 years of domestic service.

## 6. SNA Oushadhasala, Thrissur

Specialty in Vatic disorders. Smaller staff (~40 doctors total) but strong publications + research output. Good for academic career.

## 7. Sitaram Ayurveda Pharmacy, Thrissur

Strong Panchakarma centre + pharmacy. Hires MDs in Panchakarma + Dravyaguna. Pay ₹35,000–60,000 entry.

## 8. Ananda Ayurveda Hospital, Calicut

Modern facility. Integrative diagnostics (USG, blood work + Ayurveda) attracts urban patients. ₹40,000–70,000 entry for MD holders.

## 9. NSS Ayurveda Medical College Hospital, Pandalam (Pathanamthitta)

Self-financing college hospital. Lecturer + clinical positions. Entry ₹45,000–65,000.

## 10. Athulya Ayurvedic Centre (multi-branch)

Wellness-focused chain across Bengaluru, Chennai, Trivandrum. Hires for Panchakarma + cosmetic Ayurveda roles. ₹30,000–55,000 + accommodation in some branches.

## How to apply

Most of the above use a combination of:

- Direct walk-in interviews (call the HR / administrator)
- Referrals from college placement cells
- AyurConnect job board (more of these hospitals are now posting here)
- Newspaper classifieds (Mathrubhumi, Manorama, especially for AVS + Vaidyaratnam)

## What they look for

In order of importance: CCIM + KSMC active registration, fluency in Malayalam (essential for patient communication), classical specialization training (not just MBBS-style), reference from a senior practitioner in the lineage. Government jobs additionally require PSC exam.

## What's the difference between hospitals 1–5 and 6–10?

The top 5 have decades of brand equity; salaries are slightly lower but reputation compounds. Hospitals 6–10 pay slightly more upfront but require you to build your own patient base. Choose based on whether you want institutional brand or faster individual reputation.`,
    related: [
      { label: 'Search Kerala Ayurveda jobs', href: '/jobs/ayurveda-jobs/india' },
      { label: 'Panchakarma jobs Kerala', href: '/jobs/panchakarma-jobs/kerala' },
      { label: 'Register on AyurConnect', href: '/jobs/profile' },
    ],
  },
  {
    slug: 'ayurveda-doctor-resume-guide',
    title: 'How to Write an Ayurveda Doctor Resume',
    excerpt: 'A practical, DHA/MOH-ready resume template for Ayurveda doctors, with examples of what to include for classical training, Panchakarma competencies, research, and licensing.',
    category: 'Resume',
    readTime: '5 min',
    body: `## Why most Ayurveda resumes underperform

Most resumes I read for Ayurveda positions are organized like college CVs: long-form education, vague clinical statements, no quantification. Recruiters reading 200 resumes per week want signal, not biography.

## The template that works

### Header

Your full name, post-nominal qualifications, email, phone, WhatsApp, current city. One line for headline: "BAMS, MD (Panchakarma) · 8 years · Senior consultant".

### Professional summary (3 sentences)

What you're known for + your strongest specialty + what you want next. Example: "Senior Panchakarma physician with 8 years of classical practice at Vaidyaratnam Oushadhasala. Specialize in chronic disease management via integrative diagnostics. Seeking a DHA-licensed consultant role in Dubai."

### Classical training section (this is unique to Ayurveda resumes)

Where did you learn? Which lineage? Which classical texts can you teach from? Recruiters at lineage centres look here first. Example:

- Trained under Vaidyamadham Cheria Narayanan Namboothiri (Ashtavaidya tradition) — 2017–2019
- Daily Nadi Pariksha + Ashtavidha Pariksha for 7+ years
- Fluent in Ashtanga Hridaya, Bhavaprakasha, Sahasrayogam

### Panchakarma competencies (if Panchakarma is your specialty)

List specific therapies you've performed solo + supervised counts. Example:

- Pizhichil: 500+ patients across rheumatic + neurological cases
- Sirodhara: 300+ for insomnia, anxiety, migraine
- Vasti (anuvasana + niruha): 200+ pre-Panchakarma + sodhana
- Nasya: 400+ for sinusitis, migraines, paralysis

### Clinical experience

Reverse chronological. For each role: clinic name, dates, role, 3 bullet points. Bullet structure: action + scale + outcome. Bad: "Treated patients". Good: "Built and ran a Prasuti Tantra OPD with 30 patients/day average, reducing follow-up cycles by 40% via personalized Rasayana protocols."

### Research + publications

If you have any, list them with year + journal. Even a single AYU Journal paper is a strong differentiator.

### Licensing + credentials

CCIM #, KSMC #, any international licenses, BLS expiry. Recruiters check this before progressing.

### CME + certifications

Last 24 months only. List CME credits earned + relevant certifications (DHA prep, Panchakarma supervisor cert, etc.).

### Languages

Important for GCC + international roles. Quantify — "Malayalam (native), English (fluent), Arabic (intermediate, conversational), Hindi (conversational)".

## What NOT to include

- Hobbies (unless directly relevant — yoga instructor cert is relevant)
- High school details
- Generic statements like "passionate about Ayurveda"
- Long classical text quotes — keep it operational
- Photo (unless explicitly requested by DHA / DOH template)

## Length

2 pages maximum. Senior doctors with 15+ years can use 3 pages. Anything longer is a red flag.

## Format

DHA / DOH / QCHP have specific resume templates. Download from their official portals + match formatting. For other employers, use clean reverse-chronological. PDF only, named "LastName-FirstName-Ayurveda-MMYYYY.pdf".

## The AI-assisted approach

The AyurConnect resume builder (/jobs/resume-builder) auto-fills your profile data into 3 templates and offers AI "improve" buttons per section. The AI is trained on what GCC recruiters look for — use it for the professional summary + classical training paragraphs first.`,
    related: [
      { label: 'AI Resume Builder', href: '/jobs/resume-builder' },
      { label: 'BAMS career options', href: '/jobs/articles/bams-career-options-2026-complete-guide' },
      { label: 'DHA licensing', href: '/jobs/licensing/dha-dubai' },
    ],
  },
  {
    slug: 'panchakarma-therapist-jobs',
    title: 'Panchakarma Therapist Jobs — Skills, Salary, Opportunities',
    excerpt: 'What hospitals look for in Panchakarma therapists, training requirements, salary by region, and how to move from junior therapist to supervisor.',
    category: 'Career',
    readTime: '6 min',
    body: `## The distinction that matters

"Panchakarma therapist" is not the same as "Panchakarma doctor". Therapists are trained in the manual procedures — Abhyanga, Pizhichil, Sirodhara, Vasti administration. Doctors prescribe and supervise. Both are essential to a Panchakarma centre, with very different skill ladders.

This article is about the therapist track. For doctors with MD Panchakarma, the salary ranges are 2–4x higher and the role is supervisory.

## Required training

Most reputable centres require:

- Government-recognised Panchakarma Therapist diploma (12-18 months)
- 6+ months hands-on apprenticeship at a recognised centre
- Specialized add-ons: marma therapy, Kerala-style Pizhichil, Njavarakizhi, classical therapeutic massage

Kerala State Therapist Certification (KSTC) is increasingly required at international centres.

## Salary ranges (monthly)

- **Kerala — junior**: ₹12,000–22,000
- **Kerala — experienced (5+ years, supervisor)**: ₹25,000–45,000
- **GCC — Dubai / Doha**: AED 3,000–6,500 (UAE) / QAR 3,500–7,000 (Qatar)
- **Maldives / Bali resorts**: USD 700–1,400 + accommodation + meals
- **Switzerland / Germany (Heilpraktiker-affiliated centres)**: CHF 3,500–5,500 / EUR 2,800–4,200

International roles almost always include accommodation, meals, and visa support. Take-home in GCC is often more than face value when expenses are zero.

## What hospitals look for in candidates

- Demonstrated knowledge of contraindications (this is the biggest differentiator)
- Physical stamina — 6 to 8 therapy sessions per day is the norm
- Bilingual ability (Malayalam + English for Kerala, English + Hindi for GCC, English + Arabic at top centres)
- Gender — most centres prefer same-sex therapists for the patient; female therapists are in shorter supply and command higher pay
- Stable work history — not job-hopping every 6 months

## Career progression

Year 0–2: Junior therapist. Hands-on procedure execution. Learn from supervisors.

Year 2–4: Senior therapist. Solo execution of full Panchakarma protocols. May train new therapists.

Year 4–7: Supervisor. Manage 3–6 therapists. Schedule patients. Interact with doctors on protocol decisions.

Year 7+: Therapy manager / chief therapist. Department-level responsibility. Some move into training roles, opening their own training centres, or curriculum design for therapist diploma programs.

## How to find good jobs

- AyurConnect job board now has dedicated Panchakarma therapist roles
- Kerala Tourism-classified centres (Diamond / Gold / Green Leaf) are the most reliable employers
- Word of mouth at Pizhichil / marma training courses
- WhatsApp groups: "Kerala Panchakarma Therapists", "Ayurveda Therapists UAE"

## Red flags to avoid

- Centres that ask you to deposit money for "training" before joining
- "Wellness spas" without licensed doctors on staff — these are massage parlours, not Ayurveda centres
- Verbal-only employment offers — always get written offer letter before relocating
- Centres that bundle Panchakarma with non-Ayurveda treatments inconsistently — patient safety risk

## What's changing

International demand is growing, especially in Switzerland, Germany, and the UAE. Resort centres are increasingly hiring trained Kerala therapists at AED 4,000+ packages with 3-year contracts. Therapist supply hasn't kept up — this is a genuinely under-supplied market right now.`,
    related: [
      { label: 'Panchakarma jobs in Kerala', href: '/jobs/panchakarma-jobs/kerala' },
      { label: 'Panchakarma jobs in Dubai', href: '/jobs/panchakarma-jobs/dubai' },
      { label: 'Panchakarma salary in Dubai', href: '/jobs/salary/panchakarma/dubai' },
    ],
  },
  {
    slug: 'ayurveda-jobs-uk-licensing-salary-demand',
    title: 'Ayurveda Jobs in UK — Licensing, Salary, Demand',
    excerpt: 'The UK Ayurveda market in 2026: licensing realities, salary expectations, where the actual demand is, and how to find clients/employers.',
    category: 'International',
    readTime: '6 min',
    body: `## The UK situation is different from the GCC

There is no statutory Ayurveda doctor register in the UK. You cannot work as a "Doctor of Medicine" using your BAMS. What you can do: register as a Complementary Practitioner with CNHC (Complementary & Natural Healthcare Council) or BAMC (British Ayurvedic Medical Council).

This shapes everything else — pay, demand, career path, and patient expectations.

## What you can do legally

- Run private consultations as an Ayurveda practitioner
- Prescribe Ayurvedic herbal preparations within MHRA limits (no regulated drugs)
- Perform Ayurveda therapies (Panchakarma, Abhyanga, Shirodhara) at registered clinics
- Teach + train (this is increasingly common; some make their main income teaching)

## What you cannot do

- Prescribe regulated medications
- Diagnose conditions in the medical-legal sense
- Use the title "Doctor" without clarification
- Bill NHS — UK Ayurveda is private-pay only

## Salary realistically

- **Self-employed practitioner, year 1**: £18,000–28,000 net (low patient volume while building)
- **Self-employed, year 3+**: £35,000–60,000 (busy clinic with returning patients)
- **Employed at a multi-practitioner clinic**: £24,000–38,000 (rare; most UK Ayurveda is self-employed)
- **Teaching at an Ayurveda college (Cambridge, Middlesex)**: £30,000–48,000
- **Combined practice + teaching + book / training income** (the realistic top): £60,000–90,000

The top earners almost always combine private practice + teaching + media presence + classical product sales.

## Where the demand is

- **London**: Wimbledon, Hampstead, Chiswick — high-net-worth wellness market
- **Birmingham**: large South Asian community, mainstream Ayurveda demand
- **Leicester + Manchester**: established Indian diaspora seeking traditional care
- **Brighton + Bristol**: wellness-curious affluent crowd
- **Yoga + retreat centres throughout the country**: occasional Ayurveda consultant engagements

The London + Birmingham + Leicester triangle accounts for ~70% of patient volume.

## What you need to start

1. Register with CNHC or BAMC (£200–400 / year)
2. Get professional indemnity insurance (Balens, Towergate — £200–500 / year)
3. DBS (Disclosure & Barring Service) check for clinical work
4. Decide self-employed or join an existing clinic
5. Marketing — UK patients Google heavily before booking. Build a clean, fast website + Google Business Profile + ask for reviews from day 1.

## The MD/MS + UK CPD shortcut

Most established UK Ayurveda clinics expect MD/MS qualification + UK-specific CPD (Middlesex University, College of Ayurveda London, Ayurveda Pura). Doing a 1-year UK-based clinical course (£8,000–15,000) materially improves clinic-employment prospects.

## What's growing

Postnatal care for Indian-origin mothers, fertility consultations, chronic pain management, stress + sleep clinics. Telemedicine for UK patients in geographic gaps where there's no Ayurveda doctor locally is also growing.

## Honest advice

If you want to maximise earning quickly, UK is not your first market. If you want intellectual depth, classical practice in a wellness-curious market, and long-term reputation building, UK is excellent. Most successful UK Ayurveda doctors I've met treat the first 3 years as setup + reputation building, with the financial payoff coming in years 4–7.`,
    related: [
      { label: 'UK practice pathway', href: '/jobs/licensing/cnhc-uk' },
      { label: 'Telemedicine for Ayurveda doctors', href: '/jobs/articles/telemedicine-ayurveda-doctors' },
      { label: 'UK Ayurveda jobs', href: '/jobs/ayurveda-jobs/uk' },
    ],
  },
  {
    slug: 'telemedicine-ayurveda-doctors',
    title: 'Telemedicine Opportunities for Ayurveda Doctors',
    excerpt: 'How telemedicine works for Ayurveda — platforms, regulatory landscape, salary models, and how to build a sustainable virtual practice.',
    category: 'Telemedicine',
    readTime: '5 min',
    body: `## What changed after 2020

Telemedicine for Ayurveda was niche before 2020. Now it's mainstream. The Indian Telemedicine Practice Guidelines (2020) explicitly cover AYUSH practitioners. The MoH circulars from Kerala, Tamil Nadu, Maharashtra recognise AYUSH telemedicine. Most importantly, patients now expect it.

This article covers what's actually working — platforms, salary models, regulatory rules, and patient acquisition.

## The 4 main telemedicine paths

### 1. Aggregator platforms (Practo, Tata 1mg, Apollo 24/7)

You're an empanelled doctor. Patients book through the platform. Pay: ₹150–400 per consult, 10-40 consults/day possible. Platform takes 20-30% commission. Pros: no marketing needed. Cons: lower per-consult pay, platform control of relationships.

### 2. AyurConnect + similar Ayurveda-specific platforms

Lower commission (typically 15-20%). Better patient-fit because users came for Ayurveda specifically. Pay: ₹250–600 per consult. Cons: smaller patient pool than mainstream aggregators.

### 3. Direct-to-patient via your own website

You acquire patients via Google + WhatsApp + social. Charge what you want (₹400–2,500 per consult depending on specialization). You keep everything. Cons: heavy marketing investment in first 12 months.

### 4. Cross-border telemedicine

Indian doctor consulting GCC / UK / US patients. Legally complex — the patient's jurisdiction usually requires you to be licensed there. Many doctors work around this by positioning as "wellness coach" / "Ayurveda consultant" rather than medical practitioner. Salary potential: USD 50–200 per consult.

## What patient mix works

- Chronic, slow-progressing conditions: Vatic disorders, IBS, hormonal imbalance, skin conditions, insomnia, stress, weight management. These benefit from longitudinal video consultations.
- Postpartum + women's wellness: high repeat rate, high lifetime value
- Karkidaka / Rasayana protocols: seasonal demand, one-time but high engagement

What does NOT work well: acute conditions, conditions requiring physical examination (pulse + tongue diagnosis remote is much weaker), surgical referrals.

## Setup essentials

- HD camera + ring light + clean background
- Stable internet (don't compromise on this)
- Patient intake form (digital) — collect history before the call
- Prescription writer with QR code linking back to your verified profile
- Follow-up cadence — most telemedicine docs lose 60% of patients after first consult. The fix is structured follow-up at 14 days.

## Money models that work

### Per-consult only

Standard. ₹400–1,200 per consult depending on platform + your reputation.

### Subscription / treatment-plan packages

"3-month Rasayana protocol" = ₹15,000–35,000 with 4 video consults + medications + WhatsApp support. Higher revenue per patient + sticky relationships.

### Hybrid clinic + telemedicine

Most successful Ayurveda doctors I know in Kerala run a physical clinic Mon-Wed-Fri + telemedicine Tue-Thu-Sat. Revenue mix balances out cyclical demand.

## What to avoid

- "Free first consult" promotions — they attract patients who don't return
- Overselling on social media — Ayurveda doesn't need hype, it needs reputation
- Treating conditions you cannot remotely diagnose — refer when in doubt
- Mixing roles with non-AYUSH "lifestyle coaches" — regulator can clamp down

The honest reality of telemedicine for Ayurveda: it works best as a complement to a physical practice + as a specialty channel (chronic conditions, repeat patients, postpartum), not as a replacement for hands-on care.`,
    related: [
      { label: 'BAMS career paths', href: '/jobs/articles/bams-career-options-2026-complete-guide' },
      { label: 'Build your candidate profile', href: '/jobs/profile' },
      { label: 'Telemedicine + wellness jobs', href: '/jobs' },
    ],
  },
  {
    slug: 'interview-tips-gcc-ayurveda',
    title: 'Interview Tips for Ayurveda Doctors — GCC Hospitals',
    excerpt: 'What GCC hospital interviewers actually ask Ayurveda candidates, how to prepare clinical scenarios, salary negotiation, and red flags to watch for.',
    category: 'Interview',
    readTime: '6 min',
    body: `## Who interviews you

For GCC Ayurveda roles, you typically face:

- **HR screening (15–20 min)**: Visa status, availability, salary expectations, English assessment
- **Clinical interview (30–45 min)**: Senior physician at the clinic — case discussions, classical knowledge
- **Owner / Medical Director (20–30 min)**: Fit assessment, vision alignment, long-term commitment

Pass HR, get a fair clinical, ace the owner conversation. The owner round is where 80% of decisions actually get made.

## What HR asks

- "Walk me through your experience" — practice a tight 3-minute summary
- "Why this clinic / why this country" — research the clinic ahead, mention specifics
- "What's your salary expectation" — see the salary negotiation section below
- "When can you start" — be honest. If you need 60 days, say 60. They usually accommodate
- "Are you DHA licensed / under processing" — be honest about timeline

## What clinical interviewers ask (with examples)

**Scenario 1**: "A 45-year-old female presents with chronic urticaria, history of multiple antihistamines. Walk me through your Ayurveda approach."

Strong answer pattern: dosha analysis (likely Kapha-Pitta with Rakta dushti) → Nidana investigation → sodhana plan (Virechana if appropriate) → Rasayana protocol → expected timeline (8-12 weeks for chronic urticaria with this approach).

Weak answer: "I will give some Ayurveda medicine." (This sinks 30% of candidates.)

**Scenario 2**: "Patient on Warfarin asks about Ashwagandha. What do you do?"

Strong answer: explain the herb-drug interaction (Ashwagandha may interact with anticoagulants), recommend coordination with cardiologist, avoid Ashwagandha or use under monitoring with INR adjustment, document the discussion.

Weak answer: "Ashwagandha is safe." (Inaccurate + raises safety concerns about your practice.)

**Scenario 3**: "A Muslim Emirati patient wants Panchakarma but needs adjustments for prayer times + Ramadan. How do you accommodate?"

Strong answer: pre-Ramadan or post-Ramadan scheduling, prayer-time-aware therapy slots, Halal-certified medications, female therapist for female patient, modesty considerations during therapy. The fact that you've thought about this matters more than perfect specifics.

## What the owner asks

- "Where do you see yourself in 3 years?" — they want commitment, not ambition that takes you elsewhere
- "How do you handle a patient who's unhappy with results?" — they want maturity + de-escalation skills
- "What kind of patient cases excite you?" — they want match with their patient base

## Salary negotiation

The number you state first becomes the anchor. Strategies:

- Ask their range first: "What's the band for this role?"
- If you must state first, give a range, not a number: "Based on my experience, AED 11,000–14,000 is the range I'm working with."
- Don't accept the first offer — there's almost always 8-15% room to move
- Negotiate non-cash benefits: housing allowance, education allowance for kids, annual ticket home, indemnity coverage, conference budget

## Red flags during the interview

- Cannot or will not show you the clinic's DHA license
- Vague on hire date / asks you to wait 3+ months without paid retainer
- Tries to negotiate down your CCIM / KSMC fee or asks you to work pre-DHA
- "We'll figure out the contract details later" — get everything in writing
- Promises commission-based pay only with no base salary

## After the interview

Send a thank-you email within 24 hours. Restate your interest. Mention one specific thing from the conversation that resonated. Most candidates skip this — it's a cheap differentiator.

Follow up at 7 days and again at 14 days if no response. After 21 days of silence, move on. They've decided.

## What to take into the contract negotiation

- Salary, housing, transport, end-of-service benefits
- Annual return ticket
- Visa + DHA renewal coverage by employer
- Notice period (both ways)
- Non-compete clause — push back if it's longer than 6 months / wider than the same emirate
- CME budget`,
    related: [
      { label: 'DHA licensing detail', href: '/jobs/licensing/dha-dubai' },
      { label: 'Salary in Dubai', href: '/jobs/articles/ayurveda-doctor-salary-dubai-uae' },
      { label: 'All GCC Ayurveda jobs', href: '/jobs/ayurveda-jobs/uae' },
    ],
  },
  {
    slug: 'locum-ayurveda-doctor-how-to-start',
    title: 'Locum Ayurveda Doctor — How to Start',
    excerpt: 'Step-by-step guide to becoming a locum (short-term cover) Ayurveda doctor in Kerala and UAE. Daily rates, sourcing assignments, and what to avoid.',
    category: 'Locum',
    readTime: '5 min',
    body: `## Why locum

Locum work — short-term cover for a clinic when a regular doctor takes leave — is the most flexible way to earn as an Ayurveda doctor. You set your dates. You pick your locations. You earn per-day rates that are often higher than salaried equivalents. The trade-off: no benefits, no stability, you find your own work.

For semi-retired physicians, MD students between programs, doctors transitioning between full-time roles, or anyone who wants 4-6 months on / 6 months off — locum is genuinely good.

## What clinics need locums for

- Senior doctor's planned leave (vacation, hajj, family wedding, surgery recovery)
- Karkidaka peak season — clinics need extra hands
- New branch openings — temporary cover while permanent doctor is hired
- Maternity leave cover (longer assignments, 3-6 months)
- Sudden vacancies — emergency cover at short notice (highest rates)

## Daily rates (current 2026 market)

**Kerala**:
- General BAMS: ₹2,500–4,500 / day
- MD specialty (Kayachikitsa, Panchakarma): ₹3,500–6,000 / day
- Emergency cover with <48hr notice: ₹4,500–7,500 / day
- Karkidaka season Panchakarma specialist: ₹5,000–8,500 / day

**UAE**:
- DHA-licensed Ayurveda: AED 800–1,500 / day
- Specialty / Senior: AED 1,200–2,000 / day

These are net to you. Clinics usually cover transport + meals when assignment is more than 30 km from your home.

## Setup steps

### 1. Get registration current

CCIM + KSMC must be active. UAE DHA (if applicable) must be valid. Indemnity insurance current. Without these, you cannot accept assignments.

### 2. Create your availability listing

On AyurConnect (/jobs/locum or /jobs/profile → toggle "Open to locum"), list:

- Date ranges you're available (e.g., "Aug 1–15, Oct 5–25")
- Locations you'll travel to
- Daily rate
- Specializations
- Languages

Update this every month. Stale availability = no inquiries.

### 3. Network with practice managers

Ayurveda doctors usually know each other within a district. Tell 5 senior doctors and 3 practice managers that you're available. Word spreads. Most of my early locum assignments came from one Vaidyaratnam alumni contact.

### 4. WhatsApp groups

Active Kerala groups: "Ayurveda Locum Kerala", "BAMS Locum + Cover", college alumni groups. UAE: "Ayurveda Doctors UAE", "Malayalee Doctors GCC". Don't spam — post when you have specific availability, respond fast when others post needs.

### 5. Build a 1-page locum brochure

PDF with: photo, name, qualifications, registration #, specializations, languages, daily rate, contact. Send when inquired. This professional pre-frame closes more assignments.

## Pricing tactics

- Quote per day, not per hour
- Same-day cancellation fee (50% of daily rate)
- Travel-included rates for long distances
- Multi-day discounts (5+ days = 10% off, 15+ days = 15% off)
- Premium for nights, weekends, emergency same-day cover

## What to avoid

- Working without a signed daily agreement (even simple WhatsApp message confirming dates + rate works)
- Accepting verbal-only contracts at unfamiliar clinics
- Lowballing yourself in year 1 — once your rate sets, it's hard to raise it
- Saying yes to everything — preserve your reputation, decline assignments at clinics with weak hygiene / unethical practices
- Accepting "we'll pay you next week" without a clear payment date

## After 12 months

Most successful locum doctors I know rotate between 5-12 clinics within a 100 km radius. Some hit 200+ days of locum work / year and earn ₹6-12 lakh / year on it, which beats most junior salaried positions. The key is reliability — show up on time, be unproblematic, treat patients well, and clinics rebook you over and over.`,
    related: [
      { label: 'Locum marketplace', href: '/jobs/locum' },
      { label: 'Toggle open-to-locum', href: '/jobs/profile' },
      { label: 'BAMS career options', href: '/jobs/articles/bams-career-options-2026-complete-guide' },
    ],
  },
]

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug)
