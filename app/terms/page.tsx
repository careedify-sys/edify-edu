import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Use — Edify | edifyedu.in' },
  description: 'Terms of Use for EdifyEdu.in — the rules governing your use of India\'s independent online university comparison platform.',
  alternates: { canonical: 'https://edifyedu.in/terms' },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  const lastUpdated = 'June 2026'

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-8">
          <Link href="/" className="hover:text-navy">Home</Link>
          <span>/</span>
          <span className="text-navy font-semibold">Terms of Use</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 prose prose-sm max-w-none">
          <h1 className="font-display text-3xl font-bold text-navy mb-2">Terms of Use</h1>
          <p className="text-xs text-ink-3 mb-8">Last updated: {lastUpdated}</p>

          <p className="text-ink-2 leading-relaxed">
            These Terms of Use govern your access to and use of <strong>edifyedu.in</strong>, operated by Edify Education ("we", "our", or "us"). By visiting or using this website, you agree to these terms. If you do not agree, please stop using the site.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">1. About EdifyEdu</h2>
          <p className="text-ink-2">
            EdifyEdu.in is an independent online education comparison platform. We publish fee data, accreditation information, and programme details sourced from official portals (UGC-DEB, NAAC, NIRF, and university websites) to help students make informed decisions. We do not receive commissions, referral fees, or payments from any university to rank them higher.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">2. Informational Purpose Only</h2>
          <p className="text-ink-2">
            All content on edifyedu.in is for general informational purposes only. It does not constitute academic, financial, or legal advice. Fee figures are indicative and may change. Always verify current fees and programme details directly on the official university portal before making any admission decision.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">3. Accuracy of Information</h2>
          <p className="text-ink-2">
            We make reasonable efforts to keep data accurate and up to date. However, we do not guarantee that all information is complete, current, or error-free. Accreditation statuses, NIRF ranks, and fee structures change periodically. We are not liable for decisions made based on outdated information on this site.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">4. No Endorsement</h2>
          <p className="text-ink-2">
            Listing a university on edifyedu.in does not constitute an endorsement, recommendation, or guarantee of quality. Tier classifications and comparison scores are editorial opinions based on publicly available data, not paid placements.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">5. User Conduct</h2>
          <p className="text-ink-2 mb-2">When using this site, you agree not to:</p>
          <ul className="text-ink-2 space-y-1">
            <li>Scrape, copy, or republish site content without written permission.</li>
            <li>Submit false or misleading information in enquiry forms.</li>
            <li>Attempt to disrupt, hack, or interfere with the website's systems.</li>
            <li>Use the site for any unlawful purpose under Indian law.</li>
          </ul>

          <h2 className="font-bold text-navy mt-8 mb-3">6. Enquiry Forms and Lead Submission</h2>
          <p className="text-ink-2">
            By submitting an enquiry form, you consent to being contacted by our team via phone or WhatsApp for education guidance. We do not share your contact details with universities without your explicit consent. See our <Link href="/privacy-policy" className="text-amber font-semibold">Privacy Policy</Link> for full details on data handling.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">7. Intellectual Property</h2>
          <p className="text-ink-2">
            All original content on edifyedu.in — including blog articles, comparison tables, guides, and tools — is the property of Edify Education and protected under Indian copyright law. You may share links to our pages but may not reproduce content in full without written permission.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">8. Third-Party Links</h2>
          <p className="text-ink-2">
            We link to official university portals and regulatory bodies (UGC, NAAC, NIRF) for verification. We are not responsible for the content, accuracy, or availability of third-party websites. Linking does not imply endorsement.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">9. Limitation of Liability</h2>
          <p className="text-ink-2">
            To the maximum extent permitted by law, Edify Education is not liable for any direct, indirect, incidental, or consequential loss arising from your use of this website or reliance on information published here. This includes admission decisions, financial commitments, or career outcomes.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-ink-2">
            This website is provided "as is" without warranties of any kind, express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of viruses or harmful components.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">11. Governing Law</h2>
          <p className="text-ink-2">
            These terms are governed by the laws of India. Any disputes arising from use of this website shall be subject to the jurisdiction of courts in India.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">12. Changes to These Terms</h2>
          <p className="text-ink-2">
            We may update these terms at any time. The "Last updated" date above reflects the most recent version. Continued use of the site after changes constitutes acceptance of the revised terms.
          </p>

          <h2 className="font-bold text-navy mt-8 mb-3">13. Contact</h2>
          <p className="text-ink-2">
            For any questions about these terms, contact us at:<br />
            <strong>Edify Education</strong><br />
            Email: <a href="mailto:hello@edifyedu.in" className="text-amber font-semibold">hello@edifyedu.in</a><br />
            Phone: +91 70612 85806<br />
            Website: <Link href="/contact" className="text-amber font-semibold">edifyedu.in/contact</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
