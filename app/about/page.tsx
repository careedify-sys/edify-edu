import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Award, Users, Phone, Mail, CheckCircle, XCircle, Database, BarChart2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Edify — India\'s Independent Online Education Guide',
  description: 'edifyedu.in is India\'s independent guide to UGC DEB approved online degrees. No paid rankings. No university affiliations. We help students compare 125+ universities honestly.',
  keywords: 'about edify, independent education guide india, ugc deb approved universities, honest online degree comparison, best online mba colleges in india, online mba india, nirf ranked online universities, naac a++ online university, online mba for working professionals, top 10 mba colleges in india',
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

const teamSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rishi Kumar',
    jobTitle: 'Founder & Lead Researcher',
    worksFor: { '@type': 'Organization', name: 'edifyedu.in', url: 'https://edifyedu.in' },
    url: 'https://edifyedu.in/about#team',
    description: 'Education researcher and data analyst focused on India\'s online higher education sector. Tracks UGC DEB approvals, NIRF rankings, and fee structures across 125+ universities. 7+ years advising students on degree choices.',
    knowsAbout: ['UGC DEB approved universities', 'Online MBA India 2026', 'NIRF rankings', 'NAAC accreditation', 'Online degree validity India'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Komal Srivastava',
    jobTitle: 'Senior Education Counsellor',
    worksFor: { '@type': 'Organization', name: 'edifyedu.in', url: 'https://edifyedu.in' },
    url: 'https://edifyedu.in/about#team',
    description: '7+ years in higher education counselling. Specialises in reviewing online MBA programs, AI-integrated curricula, and helping working professionals choose programs aligned with their career goals.',
    knowsAbout: ['Online MBA program review', 'Higher education counselling India', 'UGC DEB approved programs', 'MBA specializations India'],
  },
]

const aboutFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Edify affiliated with any university?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Edify is fully independent. We are not affiliated with, commissioned by, or paid by any university. All rankings and comparisons are based solely on official NIRF and NAAC data.' },
    },
    {
      '@type': 'Question',
      name: 'Where does Edify get its university data from?',
      acceptedAnswer: { '@type': 'Answer', text: 'All university data is sourced from official government sources: NIRF rankings (Ministry of Education), NAAC grades (naac.gov.in), UGC DEB approved list (ugc.ac.in), and official university websites for fee structures.' },
    },
    {
      '@type': 'Question',
      name: 'Does Edify take money from universities for placement or ranking?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Edify maintains a strict zero-paid-ranking policy. Universities cannot pay to be ranked higher, featured prominently, or recommended. All placements are purely based on NIRF rank and NAAC grade.' },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the fee data on Edify?',
      acceptedAnswer: { '@type': 'Answer', text: 'Fee data is sourced from official university websites and is the most accurate publicly available information at time of publishing. Fees can change each academic year. Students must verify current fees directly on the official university website before enrolling. Last updated: March 2026.' },
    },
  ],
}

export default function AboutPage() {
  return (
    <>
    {teamSchema.map((s, i) => (
      <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
    ))}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }} />
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

        {/* Trust & Independence */}
        <div className="card p-8 mb-8 border-l-4 border-amber">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Trust &amp; Independence</h2>
          </div>
          <p className="text-ink-2 leading-relaxed mb-4">
            This website is an independent, free, informational resource for students researching online MBA and other degrees in India. <strong className="text-navy">We do not earn referral fees, commissions, or payments from any university.</strong> No university pays to appear on this site, rank higher, or be featured anywhere.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sage" /> What This Website Is</h3>
              <ul className="space-y-1.5 text-sm text-ink-2">
                {[
                  'A discovery platform for UGC-DEB approved online universities',
                  'A comparison resource by NIRF rank, NAAC grade, fees and programs',
                  'An independent educational information resource',
                  'Neutral and impartial with no commercial bias',
                  'Government-data-backed with transparent sourcing',
                  'India-specific online higher education focus',
                  'Student-first approach',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> What This Website Is NOT</h3>
              <ul className="space-y-1.5 text-sm text-ink-2">
                {[
                  'Not an enrollment portal',
                  'Not affiliated with any university',
                  'Not earning money from student enrollments',
                  'Not the final authority on fees — always verify on the official university website',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Rankings Policy */}
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-navy" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Rankings Policy</h2>
          </div>
          <p className="text-ink-2 leading-relaxed mb-3">
            All rankings on this site are based <strong className="text-navy">exclusively on NIRF rankings</strong> published by the Ministry of Education, India (nirfindia.org) and <strong className="text-navy">NAAC grades</strong> published by the National Assessment and Accreditation Council (naac.gov.in).
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {['Zero paid rankings', 'Zero sponsored placements', 'Zero commission-based ordering'].map(p => (
              <span key={p} className="px-3 py-1.5 rounded-full bg-sage/10 text-sage text-xs font-bold border border-sage/20">{p}</span>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Data Sources</h2>
          </div>
          <p className="text-sm text-ink-2 mb-4">All university data on this site — fees, programs, specialisations — is sourced from:</p>
          <ul className="space-y-2 text-ink-2">
            {[
              'Official university websites — fee structures and program details',
              'NIRF rankings — Ministry of Education, India (nirfindia.org)',
              'NAAC grades — National Assessment and Accreditation Council (naac.gov.in)',
              'UGC Distance Education Bureau approved university list (ugc.ac.in)',
              'AICTE approvals — for technical programs',
            ].map(src => (
              <li key={src} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                <span className="text-sm">{src}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 rounded-xl bg-amber/5 border border-amber/20">
            <p className="text-xs text-ink-2 leading-relaxed">
              <strong className="text-amber-text">Fee Data Note:</strong> Fee data shown on this site is sourced from official university fee structures and is the most accurate publicly available information at time of publishing. Fees can change each academic year. <strong>Students must verify current fees directly on the official university website before enrolling.</strong> Last updated: March 2026.
            </p>
          </div>
        </div>

        {/* University Verification */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-4">University Verification</h2>
          <p className="text-ink-2 leading-relaxed">
            Every university listed on this site is verified against the <strong className="text-navy">official UGC-DEB approved institutions list</strong>. No unrecognised, fake, or unapproved universities are listed.
          </p>
        </div>

        {/* Research Team */}
        <div id="team" className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-navy mb-2">Research Team</h2>
          <p className="text-sm text-ink-2 mb-6">Every university review, ranking, and comparison on Edify is authored or verified by one of our two in-house education specialists.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                initials: 'RK',
                name: 'Rishi Kumar',
                title: 'Founder & Lead Researcher',
                desc: 'Education researcher and data analyst focused on India\'s online higher education sector. Tracks UGC DEB approvals, NIRF rankings, and fee structures across 125+ universities.',
                tags: ['UGC DEB', 'NIRF Rankings', 'Fee Structures', '7+ Years'],
              },
              {
                initials: 'KS',
                name: 'Komal Srivastava',
                title: 'Senior Education Counsellor',
                desc: '7+ years in higher education counselling. Specialises in reviewing online MBA programs, AI-integrated curricula, and helping working professionals choose programs aligned with their career goals.',
                tags: ['Online MBA', 'Career Counselling', 'UGC DEB', '7+ Years'],
              },
            ].map(member => (
              <div key={member.name} className="flex gap-4 p-5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base shrink-0"
                  style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#0B1D35' }}>
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-navy text-base mb-0.5">{member.name}</div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#c9922a' }}>{member.title}</div>
                  <p className="text-sm text-ink-2 leading-relaxed mb-3">{member.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(200,129,26,0.1)', color: '#c9922a', border: '1px solid rgba(200,129,26,0.2)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </>
  )
}
