// Articles 26-30 — digital resources + modern practice. Part C.

import type { PrismaClient } from '@prisma/client'

const DISC_EN = '\n\n---\n**Disclaimer.** This article is for educational purposes only. Consult a qualified Ayurveda practitioner for personalised advice. _AI-generated content — pending medical review._\n\n_Author: AyurConnect Editorial._'

type A = { id: string; slug: string; title: string; content: string; categoryId: string; legacyCategory: string; seoTitle: string; seoDescription: string }

const BATCH: A[] = [
  {
    id: 'a3-26', slug: 'apta-digital-library-ayurvedagranthasamuccaya', categoryId: 'cat-general', legacyCategory: 'guide',
    title: 'APTA Digital Library — Exploring Kerala\'s Ayurveda Heritage Online',
    seoTitle: 'APTA Digital Library — Kerala Ayurveda Texts Online',
    seoDescription: 'Ayurvedagranthasamuccaya — APTA\'s digital library of classical Kerala Ayurveda texts. What\'s available + how to access.',
    content: `One of the lesser-known but most important resources in Kerala Ayurveda is the **Ayurvedagranthasamuccaya** — a curated digital library of classical Kerala Ayurveda texts.

## What It Is

The Ayurvedagranthasamuccaya (loosely: "collection of Ayurveda texts") is maintained by APTA (the editorial board behind the official AMAI publication). Narayanan V.R. (2022, _Journal of Research in Ayurvedic Sciences_) documented this initiative.

The library digitises:
- Sahasrayogam (multiple manuscript variants)
- Chikitsamanjari
- Yogamrutam
- Vaidyamanorama
- Alattur Manipravalam
- Arogyakalpadrumam
- Prayoga Samuccayam
- Lesser-known regional Kerala Ayurveda texts

## Why It Matters

Most classical Ayurveda texts in print are imperfect transcriptions of one manuscript variant. The classical text manuscripts themselves often exist in multiple variants across Kerala vaidya families. Without digitisation:
- Manuscripts decay (palm leaves degrade)
- Family lineages disperse
- Regional variant knowledge is lost
- Researchers can't compare versions

The Ayurvedagranthasamuccaya solves this by:
- Digitising original manuscripts
- Cross-referencing variants
- Providing searchable text
- Preserving for future research

## What You Can Find

The library typically includes:
- **Full-text searchable** Sanskrit + Malayalam transliterations
- **Original palm-leaf scans** for verification
- **Sloka-by-sloka navigation**
- **Commentary** linking
- **Cross-references** between texts

## How to Access

- Affiliated through the **APTA** (Aryavaidyan Publication + Trust Association)
- Some content openly accessible via the AMAI website (ayurveda-amai.org)
- Full research access typically requires Vaidya credentials or institutional affiliation
- Some texts available through Kerala Government library systems

## What It Means for Modern Practice

For working Vaidyas, the digital library enables:
- **Quick reference** during clinical practice
- **Comparison of formulation variants** before prescribing
- **Citation precision** for clinical research
- **Patient education** with primary sources
- **Continuing professional development**

For researchers, it provides:
- Reproducible cross-references
- Etymology + variant analysis
- Bridge between classical concepts + modern clinical research

## Why Patients Care

For patients, the existence of this resource matters because:
- Treatment recommendations cite specific classical sources
- Patients can verify the classical basis of prescribed protocols
- Reduces "Ayurveda hallucination" — practitioners can't make up classical justifications
- Supports Kerala's authenticity positioning vs commercialised Ayurveda

## Limitations

- Not all classical Kerala texts are yet digitised
- Some require Sanskrit + Malayalam reading ability
- Access requires registration
- Mobile experience is still developing

## Related Resources

For accessible Ayurveda knowledge, additional resources include:
- **National Institute of Ayurveda (Jaipur)** digital library
- **NAMASTE portal** — standardised terminologies
- **CCRAS publications** — modern Ayurveda research
- **MoHFW AYUSH portal** — government-curated content

The Ayurvedagranthasamuccaya is specifically distinctive for its **Kerala focus** — preserving the regional tradition that pan-Indian portals don't always emphasise.

## Future Direction

Plans for the library include:
- AI-assisted Sanskrit-Malayalam-English translation
- Integration with Ayurveda Knowledge Graphs
- Mobile app for clinical reference
- Public-access tiers for educational use

**Reference:** Narayanan V.R. (2022). Ayurvedagranthasamuccaya — APTA's Digital Library Initiative. _Journal of Research in Ayurvedic Sciences._` + DISC_EN,
  },
  {
    id: 'a3-27', slug: 'namaste-portal-ayush-standardised-data', categoryId: 'cat-general', legacyCategory: 'guide',
    title: 'NAMASTE Portal — India\'s Standardized Ayurveda Health Data',
    seoTitle: 'NAMASTE Portal — India AYUSH Standardised Terminology Guide',
    seoDescription: 'NAMASTE portal — India\'s standardised AYUSH health terminology. What it provides for practitioners + patients. Thrigulla & Narayanam.',
    content: `The NAMASTE portal is India's national initiative to standardise AYUSH (Ayurveda + Unani + Siddha + Sowa-Rigpa + Homoeopathy) clinical terminologies. Thrigulla SR & Narayanam S. (2023, _JAIM_) describe its purpose and use.

## What NAMASTE Stands For

**N**ational
**A**YUSH
**M**orbidity
**A**nd
**S**tandardised
**T**erminologies
**E**lectronic portal

## What It Does

NAMASTE addresses a long-standing gap in Indian healthcare informatics: **AYUSH systems lacked standardised terminology mappable to ICD-11**.

Without standardisation:
- Two Vaidyas using slightly different terms for the same condition couldn't share data
- AYUSH integration with modern hospital EMRs was impossible
- Government health data couldn't track AYUSH disease burden
- Clinical research couldn't aggregate cases across institutions

NAMASTE provides:
- **Standardised AYUSH disease codes**
- **Mapping to ICD-11 codes**
- **Standard formulation names + composition**
- **Standard treatment procedure codes**
- **Multi-language equivalents** (English, Sanskrit, regional)

## How It's Used

**For practitioners:**
- Diagnose using standard terminology
- Document treatments in a way other systems recognise
- Share case data for research
- Bill insurance correctly

**For hospitals:**
- Integrate AYUSH departments with main EMR
- Track patient flow across Ayurveda + modern care
- Coordinate referrals with standardised language

**For researchers:**
- Aggregate clinical cases across institutions
- Conduct large multi-centre studies
- Quality-control case definitions

**For patients (indirectly):**
- Receive coordinated care across AYUSH + modern medicine
- See treatment documentation that travels between specialists
- Have insurance recognise AYUSH services

## Practical Implications

**Insurance:**
NAMASTE codes enable:
- Star Health, Niva Bupa, others to offer AYUSH-inclusive policies
- Insurance claims for Panchakarma procedures
- AYUSH wellness benefits in employer insurance

**Integration:**
AYUSH-modern integration becomes practical:
- Modern hospital with AYUSH OPD using one EMR
- Patient summary travelling between Ayurveda Vaidya + cardiologist
- Coordinated treatment planning

**Research:**
- CCRAS + AYUSH-funded research now uses NAMASTE for case definitions
- Multi-centre Ayurveda RCTs possible with consistent terminology
- Government health surveys can capture AYUSH disease burden

## Limitations

- Coverage is still expanding — not all Ayurveda conditions are codified yet
- Adoption varies by state (Kerala adoption higher than national average)
- Practitioner training needed for code-based documentation
- Some Vaidyas resist abstraction of clinical insight into codes

## Current Status

As of 2024:
- ~5,000 AYUSH terms standardised
- ~80% of common Ayurveda conditions mapped to ICD-11
- ~2,000 classical formulations catalogued
- Active expansion through CCRAS + NIA + state partnerships

## Future Direction

Expansion plans include:
- **Procedure-specific codes** for Panchakarma + Kerala therapies
- **Outcome reporting standards** (functional improvement, symptom relief)
- **Doctor + facility quality indicators**
- **Patient-reported outcome measures** in Ayurveda
- **AI clinical decision support** built on standardised data

## What This Means for Authenticity

NAMASTE matters for Ayurveda's **medical credibility**:
- Reduces "Ayurveda exceptionalism" argument that Ayurveda can't be standardised
- Enables Ayurveda to participate in modern healthcare systems
- Provides a basis for evidence accumulation
- Protects against fraud — codes can't be fabricated like loose terminology

For Kerala specifically, this is meaningful because Kerala Ayurveda has the deepest classical tradition + the most-established clinical practice. NAMASTE codes for Kerala therapies (Pizhichil, Sirodhara, Karkidaka Chikitsa) are being formalised — preserving regional distinctiveness within national standardisation.

## How to Access

The NAMASTE portal is government-maintained and available through:
- **CCRAS** (Central Council for Research in Ayurvedic Sciences)
- **MoHFW AYUSH** portal
- **NIA Jaipur** terminology resources

Practitioners + researchers can access full code lists; patients can verify whether their treatments use standard terminology by asking their Vaidya.

**Reference:** Thrigulla SR, Narayanam S. (2023). NAMASTE Portal and Standardised AYUSH Terminologies. _Journal of Ayurveda and Integrative Medicine._` + DISC_EN,
  },
  {
    id: 'a3-28', slug: 'how-to-verify-ayurveda-doctor-credentials', categoryId: 'cat-general', legacyCategory: 'guide',
    title: 'How to Verify an Ayurveda Doctor\'s Credentials in Kerala',
    seoTitle: 'Verify Ayurveda Doctor Credentials — KSMC, BAMS, NCISM Guide',
    seoDescription: 'How to verify Kerala Ayurveda doctor credentials — KSMC registration, BAMS/MD, NCISM. Red flags for quackery. Free verification guide.',
    content: `Verifying an Ayurveda doctor's credentials before consultation is essential. Quackery in Ayurveda is real, and the consequences of taking advice from an unqualified practitioner can be severe. This guide walks through the verification process.

## The Minimum Qualification: BAMS

**Bachelor of Ayurvedic Medicine and Surgery (BAMS)** is a 5.5-year degree (including 1-year internship). It is the minimum legitimate qualification to practise Ayurveda in India.

To be legitimate, BAMS must be from a **CCIM/NCISM-recognised college** affiliated to a recognised university. In Kerala, this means colleges affiliated to **KUHS (Kerala University of Health Sciences)** + NCISM recognition.

## The Advanced Qualification: MD-Ayurveda

**Doctor of Medicine in Ayurveda (MD-Ayurveda)** is a 3-year specialty after BAMS. Specialisations include:
- Kayachikitsa (internal medicine)
- Panchakarma
- Prasuti Tantra + Stree Roga (gynaecology)
- Kaumarbhritya (paediatrics)
- Manasika (mental health)
- Shalya (surgery)
- Shalakya (eye + ENT)
- Dravyaguna (pharmacology)
- Roga Nidana (pathology)

For complex conditions, an MD-specialty practitioner is preferable.

## Step 1: Check KSMC Registration

The **Kerala State Medical Council** (Indian Systems of Medicine register) maintains the official list of registered Ayurveda practitioners.

To verify:
1. Visit the Kerala State Medical Council ISM website
2. Search by doctor name OR registration number
3. Confirm registration status: ACTIVE / SUSPENDED / DECEASED
4. Confirm degree + university
5. Note any disciplinary actions

A KSMC registration number is **mandatory** for practice in Kerala. No KSMC number = not legal.

## Step 2: Check NCISM Recognition

For doctors trained outside Kerala, check **NCISM (National Commission for Indian System of Medicine)** for college recognition. Some "Ayurveda degrees" from non-recognised institutions are not valid for practice.

## Step 3: Verify Specialty Training

For MD claims, ask:
- Which university awarded MD?
- What year?
- Which specialty thesis?

This information should be cross-checkable through the university's records.

## Step 4: Check AyurConnect's Verification

AyurConnect's verified directory at /doctors cross-checks:
- KSMC registration
- Educational credentials
- Practice location
- Specialty + experience
- Reviewed credentials with badge system

Practitioners with the "Verified" badge on AyurConnect have passed this cross-check.

## Red Flags for Quackery

🚩 **No verifiable credentials** — refuses to share registration number

🚩 **Sells products at consultation** — financial conflict of interest

🚩 **Promises cures** — particularly for cancer, diabetes, AIDS, paralysis. Legitimate Ayurveda doesn't promise cures; promises evidence-based improvement.

🚩 **Refuses to coordinate with modern doctors** — legitimate Vaidyas welcome integration

🚩 **No physical clinic / no proper records** — accountability matters

🚩 **Charges exorbitant + opaque fees** — verified Vaidyas have transparent pricing

🚩 **Treats every patient with the same protocol** — Ayurveda is fundamentally personalised; one-size-fits-all is not Ayurveda

🚩 **No diet/lifestyle counselling** — Ayurveda without Pathya is incomplete

🚩 **Discourages your prescribed modern medications** — dangerous; coordinate, don't replace

🚩 **Spiritual claims as primary therapy** — adjunct fine, but primary therapy without medicine is not Ayurveda

## How to Find a Verified Practitioner

1. **AyurConnect directory** — /doctors with verification badges, specialty filters, language filter
2. **AMAI** (Ayurveda Medical Association of India) member directory — most established Vaidyas are members
3. **NABH-accredited Ayurveda hospitals** — institutional verification of their physicians
4. **Kerala Government Ayurveda OPDs** — Trivandrum, Ernakulam Government Ayurveda Hospital

## What a Verified Practitioner Should Provide

- **Initial consultation 30-60 minutes** for Ashtavidha Pariksha
- **Written prescription** with clear medicine names + dose + duration
- **Diet + lifestyle plan**
- **Follow-up schedule** (typically 2 weeks then monthly)
- **Coordination with modern specialists** for complex cases
- **Clear pricing** for procedures + medicines
- **Outcome documentation** (symptom diary, BP, blood sugar where relevant)

For International Patients

If you're booking from UAE, UK, USA, etc.:
1. Verify doctor's KSMC + Indian credentials
2. Confirm the centre has international patient services
3. Get a written treatment plan in English before travel
4. Confirm Kerala-Tourism classification of the centre
5. Cross-check on AyurConnect's verified directory

The investment of 30 minutes verifying credentials before consultation can save weeks of suboptimal or harmful treatment.

🔗 **Browse verified doctors:** https://ayurconnect.com/doctors` + DISC_EN,
  },
  {
    id: 'a3-29', slug: 'ayurveda-medical-colleges-kerala-complete-guide', categoryId: 'cat-general', legacyCategory: 'guide',
    title: 'Ayurveda Medical Colleges in Kerala — A Complete Guide',
    seoTitle: 'Ayurveda Colleges Kerala — Complete Guide (BAMS Admission + Fees)',
    seoDescription: 'Kerala BAMS colleges complete guide — 3 government + 15 private, KUHS affiliation, admission, fees, career paths after BAMS.',
    content: `Kerala has the highest concentration of Ayurveda medical colleges in India relative to population. For BAMS aspirants, choosing the right college matters significantly. Here is the complete current picture.

## Government Ayurveda Colleges (3)

The three Government Ayurveda Colleges are the most prestigious, with the lowest fees and strongest faculty.

**1. Government Ayurveda College, Thiruvananthapuram**
- Established 1889 — Asia's oldest Ayurveda college
- Located: Poojappura, Thiruvananthapuram
- 50 BAMS seats annually
- MD specialisations: all major branches
- KUHS affiliated; NCISM recognised
- Attached: Government Ayurveda Hospital with extensive OPD

**2. Government Ayurveda College, Tripunithura (Ernakulam district)**
- Established 1916
- 50 BAMS seats annually
- Strong MD-Panchakarma specialty
- KUHS affiliated; NCISM recognised
- Attached hospital + research facilities

**3. Government Ayurveda College, Kannur**
- Established 1958
- 60 BAMS seats annually
- KUHS affiliated; NCISM recognised
- Strong residential programme for international students

Government college fees: ₹15,000–25,000 annually. Admission through KEAM + AYUSH counselling. Cutoffs typically ~95% in 12th grade.

## Private Ayurveda Colleges (15+)

Major private colleges with NCISM recognition + KUHS affiliation:

**Pankajakasthuri Ayurveda Medical College** (Trivandrum) — 60 seats
**Vaidyaratnam Ayurveda College** (Thaikkattussery, Thrissur) — 60 seats — strong Panchakarma focus
**Amrita School of Ayurveda** (Amritapuri, Kollam) — 100 seats
**KVM Ayurveda Medical College** (Cherthala) — 60 seats
**Ahalia Ayurveda Medical College** (Palakkad) — 100 seats
**Sreedhareeyam Ayurveda Medical College** (Kothamangalam) — 60 seats — eye specialty integration
**Bharathiya Vaidya Samajam Ayurveda College** (Kannur) — 60 seats
**Kerala Ayurveda Paramparyam Medical College** — 60 seats
**Santhigiri Ayurveda Medical College** — 60 seats
**Vaidyaratnam P.S. Varier Ayurveda College** (Kottakkal, Malappuram) — Arya Vaidya Sala-affiliated
**Pushpagiri Ayurveda Medical College** — 60 seats
**ASR Ayurveda Medical College** — 60 seats
**Ayurveda Medical College Mookambika** — 60 seats
**Chennara Ayurveda College** — 60 seats
**Kannur Medical College Ayurveda Department** — 60 seats

Private college fees: ₹1,50,000–4,50,000 annually. Admission via KEAM + NEET-AYUSH counselling.

## Admission Process

**Eligibility:**
- 12th grade with 50% in Physics, Chemistry, Biology
- Age 17+ as of 31 Dec of admission year
- KEAM (Kerala Engineering, Agriculture, and Medical) qualified
- NEET-AYUSH (or NEET-UG) qualified

**Process:**
1. Register for KEAM + NEET-AYUSH
2. Take exams (typically May)
3. Results published (June-July)
4. AYUSH counselling rounds (July-September)
5. Document verification at chosen college
6. Class commencement (typically September)

## BAMS Curriculum

**5.5 years** total (4.5 years coursework + 1 year compulsory rotatory internship):

**Year 1**: Padartha Vijnana (philosophy), Sanskrit, Ashtanga Sangraha
**Year 2**: Dravya Guna (pharmacology), Rasashastra (mineral medicine), Charaka Samhita
**Year 3**: Roga Nidana (pathology), Vikriti Vijnana, Agada Tantra (toxicology)
**Year 4**: Kaya Chikitsa (internal medicine), Shalya (surgery), Shalakya, Prasuti, Kaumarbhritya, Panchakarma
**Internship Year**: Hospital rotation across all major departments

## Career Paths After BAMS

**1. Government practice** — Assistant Surgeon (Ayurveda) through Kerala PSC. Salary ₹35,000-60,000/month initially; secure long-term career

**2. Private clinical practice** — solo, group, or hospital-employed. Income varies widely (₹20,000 to ₹3,00,000+/month)

**3. MD-Ayurveda + academia** — PG specialty + teaching career

**4. Hospital practice** — NABH-accredited Ayurveda hospitals (Arya Vaidya Sala, Vaidyaratnam, Sanjeevanam)

**5. Pharmaceutical industry** — R&D, formulation, quality control at companies like Kottakkal, Vaidyaratnam, Oushadhi, AVN Coimbatore

**6. International practice** — UAE (DHA), Saudi Arabia (SCFHS), UK (Ayurveda Medical Council), US (consultancy); strong demand

**7. Research** — CCRAS, NIA, university research programs

**8. AYUSH government roles** — administration, public health

**9. Wellness industry** — luxury Ayurveda resorts, corporate wellness, retreat centres

**10. Doctor Ambassador / digital practice** — AyurConnect's verified online consultation platform offers a low-overhead route to building practice (see /doctors/ambassador)

## Choosing the Right College

Factors to weigh:
- **Government vs private** (cost vs convenience)
- **Specialisation strength** (research interests)
- **Location preference**
- **Attached hospital infrastructure**
- **Faculty reputation**
- **Internship hospital tier**
- **Career placement support**

For international students:
- KEAM + NEET-AYUSH required
- NRI quota in private colleges (~15% of seats)
- Language: English instruction primary; basic Malayalam helpful for patient interaction
- Some colleges offer residential international programmes

🔗 **Browse Kerala colleges + alumni:** https://ayurconnect.com/colleges` + DISC_EN,
  },
  {
    id: 'a3-30', slug: 'aryavaidyan-journal-kerala-ayurveda-bridge', categoryId: 'cat-general', legacyCategory: 'guide',
    title: 'Aryavaidyan — The Journal That Bridges Kerala\'s Ayurveda Past and Present',
    seoTitle: 'Aryavaidyan Journal — Kerala Ayurveda Publication Guide',
    seoDescription: 'Aryavaidyan journal — Kottakkal AVS\'s scholarly publication. History, role in Kerala Ayurveda research, notable articles, how to access.',
    content: `Aryavaidyan is the quarterly journal published by **Arya Vaidya Sala, Kottakkal** — among the most consequential scholarly publications in Kerala Ayurveda. For practitioners + researchers + serious patients, this journal is essential reading.

## History + Mission

Founded in **1987**, Aryavaidyan emerged from the editorial leadership of Arya Vaidya Sala — the century-old charitable Ayurveda institution founded by Vaidyaratnam P.S. Varier in 1902.

The journal's stated mission:
- Bridge classical Kerala Ayurveda + modern scientific research
- Document clinical case studies from Kerala practice
- Translate + interpret classical texts for contemporary readers
- Provide a Kerala-tradition voice in pan-Indian Ayurveda discourse
- Support post-graduate Ayurveda education

## Why It Matters

Most Ayurveda journals are either:
- **Purely classical** — exegesis without modern context
- **Purely scientific** — modern research without classical depth
- **Pan-Indian focus** — Kerala specificity diluted

Aryavaidyan threads the needle: rigorous + Kerala-tradition-grounded + clinically practical.

## Editorial Standards

The journal applies:
- Peer review for original research articles
- Editorial review for classical translations + interpretations
- Citation standards (modern + classical references)
- Both Sanskrit-Malayalam-English content
- Maintained scholarly standards over 35+ years

## Notable Content Types

**Case studies:**
- Documented patient outcomes from Kottakkal + affiliated centres
- Multi-month or multi-year follow-up cases
- Unusual presentations + their classical understanding
- Treatment failures + lessons learned (rare — most journals don't publish negative results)

**Classical text translations:**
- Sahasrayogam chapters with commentary
- Yogamrutam excerpts
- Rare manuscript first-translations
- Cross-references between classical sources

**Clinical reviews:**
- "What we know about Pizhichil" — systematic review
- Panchakarma in specific conditions
- Herb-specific reviews (Ashwagandha, Brahmi, Guduchi)
- Treatment protocol comparisons

**Heritage articles:**
- Ashtavaidya tradition profiles
- Historical figures in Kerala Ayurveda
- Family lineage documentation
- Kalari-Vaidya connections

**Pharmacy + manufacturing:**
- Classical preparation methods
- Modern GMP integration
- Quality testing protocols
- Adulterant identification

**Research methodology:**
- How to design Ayurveda clinical trials respecting both modern + classical
- Outcome measure standardisation
- Ethical issues in Ayurveda research

## Subscription + Access

Subscription model:
- Annual subscription available
- Institutional subscriptions for hospitals + colleges
- Individual practitioner subscriptions
- Limited free article access
- Back-issue archive available

Access channels:
- Direct from Arya Vaidya Sala, Kottakkal
- Through subscribing universities + libraries
- Through Kerala University of Health Sciences (KUHS) library
- Some content via APTA Digital Library

## Historical Significance

Some of Kerala Ayurveda's most important scholarly debates have unfolded in Aryavaidyan's pages:
- Authenticity standards for "Kerala Panchakarma" centres
- Classical text variants + textual criticism
- Modern science + classical reconciliation
- AYUSH integration + standardisation
- Heritage preservation strategies

Many senior Kerala Vaidyas trace their published academic record through Aryavaidyan articles spanning decades.

## What You Find in a Typical Issue

A quarterly issue includes:
- 2-3 original research articles
- 1 classical translation/commentary
- 2-3 case reports
- 1 review article
- 1 historical / heritage piece
- Book reviews
- Letters to editor
- Pharmaceutical / industry update

## For Patients

Why patients should care:
- Treatment recommendations citing Aryavaidyan articles = research-supported
- The journal's editorial standards reduce "Ayurveda exceptionalism" claims
- Long-term outcomes documented in print = transparency
- Heritage articles support Kerala authenticity positioning

## For International Practitioners + Researchers

For UK, US, EU, Gulf-based Ayurveda practitioners:
- Aryavaidyan is one of the few Kerala-tradition Ayurveda journals available internationally
- Essential reading for understanding Kerala-tradition treatment differences
- Citation-worthy for clinical research
- Bridge to senior Kerala practitioner contacts

## Relationship with AyurConnect

AyurConnect's editorial content draws on Aryavaidyan's documented Kerala-tradition clinical practice — for patient education, for treatment guidance, for verification of doctor specialty claims.

The journal's commitment to **Kerala-tradition + modern science integration** mirrors AyurConnect's positioning: "Authentic Kerala Ayurveda, rigorously verified."

## How to Engage

- **Subscribe** through Arya Vaidya Sala, Kottakkal for full access
- **Read free preview articles** when published
- **Cite Aryavaidyan articles** when discussing Ayurveda with skeptical modern doctors
- **Follow specific authors** whose contributions you find rigorous
- **Engage with letters to the editor** if you're a practitioner with case experience

The Aryavaidyan journal represents Kerala Ayurveda's commitment to scholarly continuity — bridging the 100+ year heritage of Arya Vaidya Sala with contemporary clinical practice + research.

🔗 **Subscribe + learn more:** Contact Arya Vaidya Sala, Kottakkal directly.` + DISC_EN,
  },
]

export async function seedArticlesV3Part3(prisma: PrismaClient): Promise<{ count: number }> {
  for (const a of BATCH) {
    const { id, slug, title, content, categoryId, legacyCategory, seoTitle, seoDescription } = a
    const readTimeMinutes = Math.max(1, Math.round(content.split(/\s+/).length / 220))
    await prisma.knowledgeArticle.upsert({
      where:  { id },
      update: { slug, title, content, language: 'en', categoryId, seoTitle, seoDescription, source: 'editorial', readTimeMinutes, status: 'published', category: legacyCategory },
      create: { id, slug, title, content, language: 'en', categoryId, seoTitle, seoDescription, source: 'editorial', readTimeMinutes, status: 'published', category: legacyCategory },
    })
  }
  return { count: BATCH.length }
}
