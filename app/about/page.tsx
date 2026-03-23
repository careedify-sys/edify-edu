import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Award, Users, Phone, Mail, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Edify — India\'s Independent Online Education Guide',
  description: 'Edify is India\'s independent guide to UGC DEB approved online degrees. No paid rankings. No university affiliations. We help students compare 125+ universities honestly.',
  keywords: 'about edify, independent education guide india, ugc deb approved universities, honest online degree comparison',
  alternates: { canonical: 'https://edifyedu.in/about' },
  openGraph: {
    title: 'About Edify — India\'s Independent Online Education Guide',
    description: 'No paid rankings. No university affiliations. We help students compare 125+ UGC DEB approved online universities honestly.',
    url: 'https://edifyedu.in/about',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'About Edify' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Edify — India\'s Independent Online Education Guide',
    description: 'No paid rankings. No university affiliations. Honest comparison of 125+ UGC DEB approved online universities.',
  },
}

export default function AboutPage() {
  return (
    <div className="bg-surface-1 min-h-screen">
      {/* Hero */}
      <div className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(200,129,26,0.2)', color: '#e0a93a', border: '1px solid rgba(200,129,26,0.3)' }}>
            <Shield className="w-3 h-3" /> Independent · Unbiased · Free
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            About Edify
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            India&apos;s first independent research portal for UGC DEB approved online degrees.
            Zero paid university placements. Zero commissions.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Mission */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-4">Our Mission</h2>
          <p className="text-ink-2 leading-relaxed mb-4">
            Thousands of students in India search for online degrees every month — but most information they find is either paid content disguised as reviews, or outdated university brochures. Students end up spending ₹1–3 lakhs on degrees without understanding what they&apos;re paying for.
          </p>
          <p className="text-ink-2 leading-relaxed">
            Edify was built to fix that. We independently research every UGC DEB approved university using public NAAC, NIRF, and UGC data — then present it clearly, so you can compare universities on facts, not marketing.
          </p>
        </div>

        {/* What makes us different */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6">What Makes Edify Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'Zero Paid Rankings', desc: 'No university pays to appear higher in our rankings. Our order is based purely on NIRF, NAAC, and student outcomes data.' },
              { icon: Award, title: 'Official Data Only', desc: 'Every fee, ranking, and accreditation shown is sourced from UGC, NAAC, NIRF, or direct university disclosures.' },
              { icon: Users, title: 'Expert Guidance', desc: 'Our advisors help you shortlist universities based on your goals, budget, and eligibility — at zero cost.' },
              { icon: CheckCircle, title: 'UGC DEB Verified', desc: 'We only list universities that are approved by UGC DEB for online education — protecting you from degree mills.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <div className="font-bold text-navy mb-1">{item.title}</div>
                  <div className="text-sm text-ink-2 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '125+', label: 'Universities Covered' },
            { value: '10+', label: 'Programs Listed' },
            { value: '100%', label: 'UGC DEB Verified' },
            { value: '₹0', label: 'Cost to You' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <div className="text-3xl font-extrabold text-amber mb-1">{s.value}</div>
              <div className="text-xs text-ink-3 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Data Sources */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-4">Our Data Sources</h2>
          <ul className="space-y-2 text-ink-2">
            {[
              'UGC DEB (Distance Education Bureau) — approved university list',
              'NAAC (National Assessment and Accreditation Council) — accreditation grades',
              'NIRF (National Institutional Ranking Framework) — annual rankings',
              'University official websites — fee structures and program details',
              'AICTE approvals — for technical programs',
            ].map(src => (
              <li key={src} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                <span className="text-sm">{src}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-3 mt-4">
            * Always verify current fees and admission details directly with the university before enrolling.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, #0B1D35, #1a3a5c)' }}>
          <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
          <p className="text-white/60 mb-6">Have a question, correction, or partnership inquiry?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:7061285806"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Phone className="w-4 h-4" /> 70612 85806
            </a>
            <a href="mailto:hello@edifyedu.in"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'rgba(200,129,26,0.3)', border: '1px solid rgba(200,129,26,0.4)' }}>
              <Mail className="w-4 h-4" /> hello@edifyedu.in
            </a>
          </div>
          <div className="mt-6">
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)' }}>
              Contact Us →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
