import { NextResponse } from 'next/server'
import { API_INTERNAL } from '../../../../lib/server-fetch'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  try {
    const r = await fetch(`${API_INTERNAL}/ai/resume-score`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error('upstream')
    return NextResponse.json(await r.json())
  } catch {
    return NextResponse.json(fallbackScore(body.resume ?? ''))
  }
}

// Heuristic fallback when API key/server unavailable.
function fallbackScore(resume: string) {
  const text = resume.toLowerCase()
  const length = text.length
  const hasEducation = /bams|md|ms|phd|college|university|degree/.test(text)
  const hasExperience = /experience|worked|consultant|practice|years/.test(text)
  const hasSkills = /panchakarma|kayachikitsa|skill|specialty|specialization/.test(text)
  const hasContact = /@|phone|mobile|whatsapp/.test(text)
  const hasLicense = /ccim|ksmc|dha|moh|qchp|licen/.test(text)

  const sections = [
    { name: 'Professional Summary', score: length > 800 ? 70 : 50, feedback: length > 800 ? 'Adequate length. Strengthen with 2-3 sentences capturing your unique value.' : 'Add a 3-line professional summary at the top.' },
    { name: 'Education',            score: hasEducation ? 80 : 40, feedback: hasEducation ? 'Education present. Include college, year, grade if relevant.' : 'Add your BAMS / MD / MS qualifications, college, year.' },
    { name: 'Experience',           score: hasExperience ? 75 : 45, feedback: hasExperience ? 'Quantify achievements (number of patients, conditions treated, outcomes).' : 'Add clinical experience with employers, dates, key responsibilities.' },
    { name: 'Skills',               score: hasSkills ? 70 : 50, feedback: hasSkills ? 'Add specific Ayurvedic procedures + modalities you practice.' : 'List specialisations, languages, key Ayurvedic skills.' },
    { name: 'Certifications',       score: hasLicense ? 80 : 50, feedback: hasLicense ? 'Active licenses noted. Add CME credits earned.' : 'Add CCIM/KSMC registration number, international licenses if any.' },
    { name: 'Formatting',           score: 65, feedback: 'Use clear section headings, bullet points, consistent dates.' },
  ]
  const overall = Math.round(sections.reduce((a, s) => a + s.score, 0) / sections.length)
  return {
    overallScore: overall,
    sections,
    strengths: [
      hasEducation ? 'Education credentials present' : 'Resume has structure',
      hasLicense ? 'License/registration information visible' : 'Content is readable',
      hasExperience ? 'Clinical experience documented' : 'Contact info included',
    ].filter(Boolean),
    improvements: [
      length < 1500 ? 'Resume is short — expand experience section with outcomes' : 'Tighten content to 1-2 pages',
      !hasContact ? 'Add professional email + WhatsApp / phone' : 'Add a LinkedIn or AyurConnect profile link',
      !hasLicense ? 'Add CCIM/KSMC registration number prominently' : 'Add date of last license renewal',
      !hasSkills ? 'List specific Ayurvedic procedures: Pizhichil, Sirodhara, Vasti, etc.' : 'Quantify experience: number of patients, years per role',
    ].slice(0, 5),
    missingKeywords: [],
    atsCompatibility: hasEducation && hasExperience ? 75 : 55,
  }
}
