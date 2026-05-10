import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing your use of AyurConnect.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl prose-content">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-kerala-700">Terms of Service</h1>
        <p className="text-sm text-muted mt-2">Last updated: 10 May 2026</p>
      </header>

      <Section title="1. Acceptance">
        <p>By accessing ayurconnect.com (the &ldquo;Platform&rdquo;), you agree to these Terms. If you do not agree, please do not use the Platform.</p>
      </Section>

      <Section title="2. The service">
        <p>AyurConnect is a directory and information platform for Ayurveda. We connect users with CCIM-verified Ayurvedic practitioners, AYUSH-certified hospitals, and surface classical herb &amp; treatment information.</p>
        <p>We are <strong>not a medical provider</strong>. Doctors and hospitals listed on the Platform are independent professionals; their advice and treatment are between them and the patient.</p>
      </Section>

      <Section title="3. Eligibility">
        <p>You must be at least 18 years old to register an account. Children may use the platform only under a parent/guardian account.</p>
        <p>Doctors registering must hold a valid CCIM/NCISM/Travancore-Cochin Medical Council registration. Falsifying credentials is grounds for permanent ban and will be reported to the relevant council.</p>
      </Section>

      <Section title="4. Your account">
        <ul>
          <li>You are responsible for keeping your password secure. Notify us immediately if you suspect unauthorized access.</li>
          <li>One person, one account. Doctors and hospitals may operate one professional account each, separate from any patient account.</li>
          <li>You agree to provide accurate information. Reviews, profile content, and forum posts must reflect genuine experience.</li>
        </ul>
      </Section>

      <Section title="5. Acceptable content &amp; conduct">
        <p>You agree not to post or transmit content that:</p>
        <ul>
          <li>Is false, misleading, or constitutes medical fraud (e.g. miracle-cure claims, encouragement to abandon prescribed treatment).</li>
          <li>Harasses, threatens, or attacks any individual or community.</li>
          <li>Is sexually explicit, hateful, or discriminatory.</li>
          <li>Promotes products or services without disclosed affiliation.</li>
          <li>Infringes any copyright, trademark, or other intellectual-property right.</li>
        </ul>
        <p>Submissions are scanned by automated AI moderation. Content that fails moderation is blocked at submission. Repeated violations may result in account suspension.</p>
      </Section>

      <Section title="6. Reviews">
        <p>You may leave one review per doctor and one per hospital, based on your real experience. We reserve the right to remove reviews that violate Section 5, are manifestly fake, or are subject to a defamation complaint we deem credible.</p>
      </Section>

      <Section title="7. Bookings &amp; payments">
        <p>When you book an appointment, you enter into an agreement directly with the doctor or hospital. Fees, refund policy, and cancellation terms are set by the practitioner. AyurConnect facilitates the booking and payment but is not a party to the consultation contract.</p>
        <p>Payments are processed by Razorpay. Refunds, if any, are issued by the practitioner; we may help mediate but cannot guarantee a refund.</p>
      </Section>

      <Section title="8. AI features &amp; medical disclaimer">
        <p>AyurBot, semantic herb search, the symptom triage tool, and AI weekly journal summaries are <strong>educational tools</strong>. They are not a diagnosis, not a prescription, and not a substitute for consulting a qualified Vaidya or allopathic physician.</p>
        <p>If you experience a medical emergency, contact local emergency services immediately. AI tools cannot evaluate emergencies and may delay critical care.</p>
      </Section>

      <Section title="9. Doctor / hospital obligations">
        <ul>
          <li>Maintain accurate qualifications, fees, and availability.</li>
          <li>Honor confirmed bookings or cancel with reasonable notice.</li>
          <li>Respect patient privacy under DPDP and the Indian Medical Council&apos;s ethics code.</li>
          <li>Do not advertise prescription drugs, fixed prices for specific cures, or schemes prohibited under the AYUSH advertising guidelines.</li>
        </ul>
      </Section>

      <Section title="10. Intellectual property">
        <p>The AyurConnect name, logo, brand assets, and original content (curated articles, herb monographs, treatment guides) are owned by AyurConnect. User-generated content (reviews, forum posts, journal entries) remains your property; you grant us a non-exclusive, worldwide license to display it on the Platform.</p>
      </Section>

      <Section title="11. Limitation of liability">
        <p>To the fullest extent permitted by law, AyurConnect, its operators, and partners are not liable for any indirect, consequential, or punitive damages arising from use of the Platform — including, but not limited to, the actions of any independent doctor or hospital. Our total liability for any direct claim is limited to the fees you have paid AyurConnect in the 12 months preceding the claim.</p>
      </Section>

      <Section title="12. Termination">
        <p>You may delete your account at any time from the dashboard or by emailing <a href="mailto:hello@ayurconnect.com" className="text-kerala-700 hover:underline">hello@ayurconnect.com</a>.</p>
        <p>We may suspend or terminate accounts that violate these Terms, including doctors who fail re-verification or who receive a sustained pattern of credible complaints.</p>
      </Section>

      <Section title="13. Changes">
        <p>We may update these Terms. Material changes will be highlighted on the home page for 14 days. Continued use after the effective date constitutes acceptance.</p>
      </Section>

      <Section title="14. Governing law">
        <p>These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Ernakulam, Kerala.</p>
      </Section>

      <Section title="15. Contact">
        <p>Questions about these Terms: <a href="mailto:hello@ayurconnect.com" className="text-kerala-700 hover:underline">hello@ayurconnect.com</a></p>
      </Section>

      <style>{`
        .prose-content h2 { font-family: var(--font-cormorant), serif; color: #155228; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .prose-content h3 { font-weight: 600; color: #1f2937; font-size: 1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .prose-content p { color: #374151; line-height: 1.7; margin-bottom: 0.875rem; font-size: 0.95rem; }
        .prose-content ul { color: #374151; line-height: 1.7; margin-bottom: 0.875rem; padding-left: 1.5rem; list-style: disc; font-size: 0.95rem; }
        .prose-content li { margin-bottom: 0.4rem; }
      `}</style>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2">
      <h2>{title}</h2>
      {children}
    </section>
  )
}
