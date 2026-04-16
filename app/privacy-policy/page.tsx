import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy — Edify | edifyedu.in' },
  description: 'Privacy Policy for EdifyEdu.in — how we collect, use and protect your personal data. Compliant with India\'s DPDP Act 2023.',
  alternates: { canonical: 'https://edifyedu.in/privacy-policy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 2026'

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-8">
          <Link href="/" className="hover:text-navy">Home</Link>
          <span>/</span>
          <span className="text-navy font-semibold">Privacy Policy</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 prose prose-sm max-w-none">
          <h1 className="font-display text-3xl font-bold text-navy mb-2">Privacy Policy</h1>
          <p className="text-xs text-ink-3 mb-8">Last updated: {lastUpdated}</p>

          <p className="text-ink-2 leading-relaxed">
            Edify ("we", "our", or "us") operates <strong>edifyedu.in</strong> — an independent platform for comparing UGC DEB approved online universities in India. This Privacy Policy explains what personal data we collect, how we use it, and your rights under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
          </p>
          <p className="text-ink-2 leading-relaxed">
            By using edifyedu.in, you consent to the practices described below.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">1. Data We Collect</h2>
          <h3 className="font-semibold text-navy mt-4 mb-2">a) Information you provide voluntarily</h3>
          <ul className="text-ink-2 space-y-1">
            <li><strong>Name and phone number</strong> — when you submit an enquiry form or lead capture form to request counselling or university information.</li>
            <li><strong>Email address</strong> — if provided optionally on contact or enquiry forms.</li>
          </ul>

          <h3 className="font-semibold text-navy mt-4 mb-2">b) Information collected automatically</h3>
          <ul className="text-ink-2 space-y-1">
            <li><strong>Usage data</strong> — pages visited, time on site, browser type, device type, IP address (anonymised).</li>
            <li><strong>Analytics</strong> — collected via Google Analytics 4 (GA4) for understanding traffic patterns. No personally identifiable data is shared with Google beyond anonymised identifiers.</li>
            <li><strong>Cookies</strong> — session cookies for site functionality; analytics cookies via GA4. We do not use advertising cookies.</li>
          </ul>

          <h2 className="font-bold text-navy mt-8 mb-3">2. How We Use Your Data</h2>
          <ul className="text-ink-2 space-y-1">
            <li>To respond to your enquiries and provide university counselling information.</li>
            <li>To contact you via WhatsApp or phone if you have submitted a lead form requesting guidance.</li>
            <li>To improve website content, UX, and search relevance (using aggregated analytics).</li>
            <li>We do <strong>not</strong> sell your personal data to any third party.</li>
            <li>We do <strong>not</strong> share your data with universities without your explicit consent.</li>
          </ul>

          <h2 className="font-bold text-navy mt-8 mb-3">3. Data Retention</h2>
          <p className="text-ink-2">
            Enquiry data (name, phone) is retained for up to <strong>12 months</strong> for follow-up purposes and then deleted. Analytics data is retained per Google Analytics' default retention policy (14 months).
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">4. Your Rights (DPDP Act 2023)</h2>
          <p className="text-ink-2 mb-2">Under India's Digital Personal Data Protection Act 2023, you have the right to:</p>
          <ul className="text-ink-2 space-y-1">
            <li><strong>Access</strong> — request a summary of personal data we hold about you.</li>
            <li><strong>Correction</strong> — request correction of inaccurate data.</li>
            <li><strong>Erasure</strong> — request deletion of your personal data.</li>
            <li><strong>Grievance redressal</strong> — raise a complaint with our Data Protection Officer.</li>
          </ul>
          <p className="text-ink-2 mt-3">
            To exercise any of these rights, email us at <a href="mailto:hello@edifyedu.in" className="text-amber font-semibold">hello@edifyedu.in</a> with subject "Privacy Request". We will respond within 30 days.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">5. Third-Party Services</h2>
          <ul className="text-ink-2 space-y-1">
            <li><strong>Google Analytics 4</strong> — for traffic analysis. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber">Google Privacy Policy</a>.</li>
            <li><strong>Google Ads</strong> — we may run Google Ads. Conversion data is collected anonymously.</li>
            <li><strong>WhatsApp Business</strong> — if you initiate a WhatsApp chat, WhatsApp's privacy policy applies.</li>
          </ul>

          <h2 className="font-bold text-navy mt-8 mb-3">6. Cookies</h2>
          <p className="text-ink-2">
            We use essential cookies (required for the site to function) and analytics cookies (GA4). You can disable analytics cookies in your browser settings. Disabling essential cookies may affect site functionality.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">7. Children's Privacy</h2>
          <p className="text-ink-2">
            Edify is not directed to children under 18. We do not knowingly collect data from minors. If you believe we have collected data from a minor, contact us immediately at hello@edifyedu.in.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">8. Security</h2>
          <p className="text-ink-2">
            We use HTTPS (TLS encryption) for all data transmission. Enquiry data is stored in secured systems with access controls. No system is 100% secure; we cannot guarantee absolute security but take reasonable precautions.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">9. Changes to This Policy</h2>
          <p className="text-ink-2">
            We may update this policy periodically. Material changes will be announced on the site. The "Last updated" date at the top reflects the most recent version.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">10. Contact</h2>
          <p className="text-ink-2">
            <strong>Data Protection Officer / Grievance Officer</strong><br />
            Edify Education<br />
            Email: <a href="mailto:hello@edifyedu.in" className="text-amber font-semibold">hello@edifyedu.in</a><br />
            Phone: +91 70612 85806
          </p>
        </div>
      </div>
    </div>
  )
}
