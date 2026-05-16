import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "How AyurConnect handles your personal information, medical data, and cookies.",
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl prose-content">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-kerala-700">Privacy Policy</h1>
        <p className="text-sm text-muted mt-2">Last updated: 10 May 2026</p>
      </header>

      <Section title="1. Who we are">
        <p>AyurConnect (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the platform&rdquo;) operates ayurconnect.com — a directory of verified Ayurvedic doctors, AYUSH-certified hospitals, classical herb information, and AI-assisted health tools. This policy explains what personal information we collect, why, and your rights as a user.</p>
        <p>The platform is operated from Kerala, India and complies with the Digital Personal Data Protection Act, 2023 (DPDP). Where applicable to international users, we honor GDPR principles.</p>
      </Section>

      <Section title="2. What we collect">
        <h3>2.1 Account information</h3>
        <p>When you register: name, email address, optional phone, role (patient / doctor / hospital), prakriti (Ayurvedic body type — only if you choose to enter it). Authentication uses Better Auth; passwords are hashed and never stored in plain text.</p>

        <h3>2.2 Doctor &amp; hospital profile data</h3>
        <p>If you sign up as a doctor or hospital, the public profile fields (name, qualification, district, photo, services) are visible to anyone visiting your profile page. Your TCMC/AYUSH registration number is used only for admin verification and is not displayed publicly unless you place it in the bio.</p>

        <h3>2.3 Health data</h3>
        <p>Reviews, forum posts, journal entries, AyurBot conversations, symptom triage queries, appointments, and any prescription you upload constitute health-related data. We treat this with the higher protection requirements of DPDP-classified sensitive data.</p>

        <h3>2.4 Technical &amp; analytics data</h3>
        <p>If you accept non-essential cookies, we collect: pages viewed, search terms, AyurBot/triage usage events, doctor-profile views, IP-derived city, browser/device. This is aggregated for product analytics only; we do not sell or share any individual-level analytics data.</p>

        <h3>2.5 What we don&apos;t collect</h3>
        <ul>
          <li>Card numbers — payments are processed by Razorpay; we only see transaction IDs and status.</li>
          <li>Voice / video recordings — Daily.co video consultations are not recorded by AyurConnect.</li>
          <li>Precise location — only the district/city you provide on your profile.</li>
        </ul>
      </Section>

      <Section title="3. How we use your data">
        <ul>
          <li><strong>Provide the service</strong>: show doctors near you, deliver appointment notifications, run AyurBot replies.</li>
          <li><strong>Verification</strong>: cross-check doctor TCMC numbers and hospital AYUSH certifications before a profile goes live.</li>
          <li><strong>Communication</strong>: send appointment confirmations and reminders via email (Resend), WhatsApp/SMS (Twilio).</li>
          <li><strong>AI features</strong>: search queries, symptom descriptions, journal entries, and forum content may be sent to Google Gemini, Groq, or Anthropic — whichever provider is active — to generate responses. Providers are configured to not retain content for training.</li>
          <li><strong>Improve the platform</strong>: aggregated, anonymized analytics on which features are used.</li>
          <li><strong>Legal compliance</strong>: respond to lawful requests under DPDP / Indian law.</li>
        </ul>
      </Section>

      <Section title="4. Sharing">
        <ul>
          <li><strong>Doctors you book with</strong> see your name, contact, chief complaint, and any health journal entries you choose to share — not your full account history.</li>
          <li><strong>Service providers</strong> we rely on: Razorpay (payments), Resend (email), Twilio (SMS / WhatsApp), Daily.co (video), MinIO/S3 (file storage), Cloudflare (CDN), Meilisearch (search), our database host. Each is bound by their own privacy commitments.</li>
          <li><strong>AI providers</strong>: Google AI (Gemini), Groq, Anthropic — when you use AyurBot, semantic search, AI summaries, or triage. We do not send your name or email to these providers, only the relevant content.</li>
          <li><strong>Aggregated, non-identifying statistics</strong> may be shared publicly (e.g. &ldquo;500 doctors verified across 14 districts&rdquo;).</li>
          <li>We do <strong>not</strong> sell personal data. We do <strong>not</strong> share data with insurers or employers.</li>
        </ul>
      </Section>

      <Section title="5. Cookies">
        <p>Two categories:</p>
        <ul>
          <li><strong>Essential</strong> — login session token, language preference, cookie consent record. These cannot be disabled if you want to use the site.</li>
          <li><strong>Analytics (optional)</strong> — page views and feature usage. Off by default; only enabled if you click &ldquo;Accept all&rdquo; on the cookie banner.</li>
        </ul>
        <p>You can revoke consent at any time by clearing the <code>ayur_cookie_consent_v1</code> entry in your browser&apos;s local storage. The banner will reappear and you can choose &ldquo;Essential only&rdquo;.</p>
      </Section>

      <Section title="6. Retention">
        <ul>
          <li><strong>Account &amp; profile data</strong>: kept until you delete your account.</li>
          <li><strong>Health journal entries</strong>: retained until you delete them individually or close your account.</li>
          <li><strong>AyurBot conversation logs</strong>: not stored on our server (each request is independent and stateless).</li>
          <li><strong>Analytics events</strong>: aggregated indefinitely; raw events purged after 13 months.</li>
          <li><strong>Audit logs</strong> for verification actions: 3 years (regulatory).</li>
        </ul>
      </Section>

      <Section title="7. Your rights (DPDP / GDPR)">
        <p>You can:</p>
        <ul>
          <li><strong>Access</strong> a copy of your personal data — email <a href="mailto:privacy@ayurconnect.com" className="text-kerala-700 hover:underline">privacy@ayurconnect.com</a>.</li>
          <li><strong>Correct</strong> inaccuracies via your dashboard or by emailing us.</li>
          <li><strong>Delete</strong> your account and all associated journal entries, reviews, posts. Contact us; we&apos;ll process within 30 days.</li>
          <li><strong>Withdraw consent</strong> for analytics cookies at any time.</li>
          <li><strong>Lodge a complaint</strong> with the Data Protection Board of India.</li>
        </ul>
      </Section>

      <Section title="8. Medical disclaimer">
        <p>AyurConnect helps you find practitioners and surfaces classical Ayurvedic information. Nothing on the platform — including AyurBot replies, AI symptom triage, herb information, or forum content — is medical advice. Always consult a qualified Vaidya before starting any treatment, and seek allopathic emergency care for any acute condition.</p>
      </Section>

      <Section title="9. Changes">
        <p>We may update this policy. Material changes will be announced on the home page for at least 14 days before they take effect. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision.</p>
      </Section>

      <Section title="10. Contact">
        <p>Privacy questions or rights requests: <a href="mailto:privacy@ayurconnect.com" className="text-kerala-700 hover:underline">privacy@ayurconnect.com</a></p>
        <p>General support: <a href="mailto:hello@ayurconnect.com" className="text-kerala-700 hover:underline">hello@ayurconnect.com</a></p>
      </Section>

      <style>{`
        .prose-content h2 { font-family: var(--font-cormorant), serif; color: #155228; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .prose-content h3 { font-weight: 600; color: #1f2937; font-size: 1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .prose-content p { color: #374151; line-height: 1.7; margin-bottom: 0.875rem; font-size: 0.95rem; }
        .prose-content ul { color: #374151; line-height: 1.7; margin-bottom: 0.875rem; padding-left: 1.5rem; list-style: disc; font-size: 0.95rem; }
        .prose-content li { margin-bottom: 0.4rem; }
        .prose-content code { background: #f3f4f6; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.85em; }
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
