import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Shield, BarChart2, BookOpen, IndianRupee } from 'lucide-react'
import EnquiryModal from '@/components/EnquiryModalDynamic'
import BestMBAClient from './BestMBAClient'

export const metadata: Metadata = {
  title: 'Best Online MBA in India 2026 — Top 10 Ranked by NIRF & NAAC',
  description: 'Compare the best online MBA programs in India for 2026. Ranked by NIRF, NAAC grade, fees (₹60K–₹3.15L), and employer acceptance. UGC DEB approved only. Updated April 2026.',
  keywords: 'best online mba in india 2026, top online mba colleges india, ugc approved online mba, best online mba universities india, nirf ranked online mba, naac a++ online mba india, online mba for working professionals india, best online mba colleges in india 2026',
  alternates: { canonical: 'https://edifyedu.in/best-online-mba-india' },
  openGraph: {
    title: 'Best Online MBA in India 2026 — Top 10 Ranked by NIRF & NAAC',
    description: 'Compare the best online MBA programs in India. Ranked by NIRF + NAAC. UGC DEB approved only. Fees from ₹60,000. Updated April 2026.',
    url: 'https://edifyedu.in/best-online-mba-india',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Best Online MBA in India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Online MBA in India 2026 — Top 10 Ranked by NIRF & NAAC',
    description: 'Compare 10 best online MBA programs in India ranked by NIRF, NAAC, fees. UGC DEB approved only.',
  },
}

// ── Structured Data ───────────────────────────────────────────────────────────

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
    { '@type': 'ListItem', position: 2, name: 'Best Online MBA in India 2026', item: 'https://edifyedu.in/best-online-mba-india' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which is the best online MBA in India in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Based on NIRF ranking and NAAC grade, the top online MBA universities in India in 2026 are: MAHE Manipal (NIRF #3, NAAC A++), Amrita Vishwa Vidyapeetham (NIRF #8, NAAC A++), SRM Institute (NIRF #11, NAAC A++), Chandigarh University (NIRF #19, NAAC A+), Amity University (NIRF #22, NAAC A+), Symbiosis SSODL (NIRF #24, NAAC A++), and NMIMS (NIRF #52, NAAC A++). All are UGC DEB approved and valid for government jobs and corporate hiring.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is an online MBA from India valid for government jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, provided the university is UGC DEB approved. Online MBAs from UGC DEB approved universities are treated equivalent to regular on-campus MBAs under UGC guidelines and are accepted for UPSC, SSC, state PSC, banking and railway exams where an MBA is a listed qualification.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum fee for an online MBA in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The minimum fee for a UGC DEB approved online MBA in India starts at around ₹60,000 total for programs from government universities like IGNOU, Anna University, and Andhra University. Private university programs range from ₹1.2L to ₹3.15L depending on the institution and specialization.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which online MBA has the best placement support in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NMIMS, Amity, MAHE Manipal, and Symbiosis SSODL are known for having structured placement assistance for online MBA students. However, no online MBA program in India offers guaranteed placements the way full-time campus programs do. Career outcomes depend primarily on your prior work experience and the effort you put into networking.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between online MBA and distance MBA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online MBA is delivered through a live Learning Management System (LMS) with scheduled online classes, proctored online exams, and UGC DEB approval. Distance MBA is primarily correspondence-based, with printed study material sent by post and physical exam centres. Both are valid degrees if the university is UGC DEB approved, but online MBAs typically have better learning infrastructure and employer perception.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I do an online MBA while working full time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Online MBA programs are specifically designed for working professionals. Live classes are usually held on weekends (Saturday/Sunday) and all lectures are recorded for on-demand access. Exams are proctored online from home. Most students manage 8–12 hours per week of study time alongside full-time work.',
      },
    },
  ],
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Best Online MBA in India 2026 — Top 10 Ranked by NIRF & NAAC',
  description: 'Compare the best online MBA programs in India for 2026, ranked by NIRF, NAAC grade, fees, and employer acceptance.',
  datePublished: '2026-04-16',
  dateModified: '2026-04-16',
  image: { '@type': 'ImageObject', url: 'https://edifyedu.in/og.webp', width: 1200, height: 630 },
  author: {
    '@type': 'Person',
    name: 'Rishi Kumar',
    url: 'https://edifyedu.in/about#team',
    jobTitle: 'Founder & Lead Researcher',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Edify',
    url: 'https://edifyedu.in',
    logo: { '@type': 'ImageObject', url: 'https://edifyedu.in/logos/edify_logo_192.png', width: 192, height: 192 },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://edifyedu.in/best-online-mba-india' },
}

// ── Top 10 University Data ────────────────────────────────────────────────────

export const TOP_10 = [
  {
    rank: 1,
    id: 'manipal-academy-higher-education-online',
    name: 'MAHE Manipal Online',
    nirf: 3,
    naac: 'A++',
    fee: '₹68K–₹2.75L',
    emi: '₹2,500/mo',
    bestFor: 'Brand + Ranking',
    specs: ['Finance', 'Marketing', 'Business Analytics', 'Data Science', 'HR'],
    badge: 'QS #32 Asia',
    badgeColor: '#6B21A8',
    badgeBg: '#F3E8FF',
  },
  {
    rank: 2,
    id: 'amrita-vishwa-vidyapeetham-online',
    name: 'Amrita Vishwa Vidyapeetham Online',
    nirf: 8,
    naac: 'A++',
    fee: '₹1.7L',
    emi: '₹2,000/mo',
    bestFor: 'Technical MBA',
    specs: ['Business Analytics', 'Finance', 'Marketing', 'HR', 'Operations'],
    badge: 'NIRF #8',
    badgeColor: '#1a5f9a',
    badgeBg: '#e8f4fd',
  },
  {
    rank: 3,
    id: 'srm-institute-science-technology-online',
    name: 'SRM Institute of Science & Technology Online',
    nirf: 11,
    naac: 'A++',
    fee: '₹60K–₹1.89L',
    emi: '₹1,500/mo',
    bestFor: 'Value + Brand',
    specs: ['Finance', 'Marketing', 'HR', 'Data Science', 'Operations'],
    badge: 'NIRF #11',
    badgeColor: '#1a5f9a',
    badgeBg: '#e8f4fd',
  },
  {
    rank: 4,
    id: 'chandigarh-university-online',
    name: 'Chandigarh University Online',
    nirf: 19,
    naac: 'A+',
    fee: '₹1.65L',
    emi: '₹2,000/mo',
    bestFor: 'Working Professionals',
    specs: ['Finance', 'Marketing', 'HR', 'Business Analytics', 'International Business'],
    badge: 'NIRF #19',
    badgeColor: '#1a5f9a',
    badgeBg: '#e8f4fd',
  },
  {
    rank: 5,
    id: 'amity-university-online',
    name: 'Amity University Online',
    nirf: 22,
    naac: 'A+',
    fee: '₹1.99L',
    emi: '₹2,200/mo',
    bestFor: 'Brand Recognition',
    specs: ['Finance', 'Marketing', 'HR', 'International Business', 'Data Science'],
    badge: 'WES Recognised',
    badgeColor: '#6B21A8',
    badgeBg: '#F3E8FF',
  },
  {
    rank: 6,
    id: 'symbiosis-university-online',
    name: 'Symbiosis SSODL Online',
    nirf: 24,
    naac: 'A++',
    fee: '₹3.15L',
    emi: '₹3,500/mo',
    bestFor: 'Premium Brand',
    specs: ['Marketing', 'Finance', 'HR', 'Operations', 'Business Analytics', 'International Business'],
    badge: 'NAAC A++',
    badgeColor: '#16a34a',
    badgeBg: '#f0fff4',
  },
  {
    rank: 7,
    id: 'lovely-professional-university-online',
    name: 'Lovely Professional University Online',
    nirf: 31,
    naac: 'A++',
    fee: '₹1.46L',
    emi: '₹1,800/mo',
    bestFor: 'Affordable A++',
    specs: ['Finance', 'Marketing', 'HR', 'Digital Marketing', 'Business Analytics'],
    badge: 'NAAC A++',
    badgeColor: '#16a34a',
    badgeBg: '#f0fff4',
  },
  {
    rank: 8,
    id: 'nmims-online',
    name: 'NMIMS Online',
    nirf: 52,
    naac: 'A++',
    fee: '₹2.2L',
    emi: '₹2,500/mo',
    bestFor: 'Management Depth',
    specs: ['Marketing Management', 'Finance', 'HR', 'Operations & Data Sciences'],
    badge: 'NIRF Mgmt #24',
    badgeColor: '#1a5f9a',
    badgeBg: '#e8f4fd',
  },
  {
    rank: 9,
    id: 'manipal-university-jaipur-online',
    name: 'Manipal University Jaipur Online',
    nirf: 58,
    naac: 'A+',
    fee: '₹1.6L',
    emi: '₹1,800/mo',
    bestFor: 'Manipal Brand, Lower Cost',
    specs: ['Finance', 'Marketing', 'HR', 'Digital Marketing', 'Business Analytics'],
    badge: 'NIRF #58',
    badgeColor: '#1a5f9a',
    badgeBg: '#e8f4fd',
  },
  {
    rank: 10,
    id: 'jain-university-online',
    name: 'JAIN (Deemed-to-be University) Online',
    nirf: 62,
    naac: 'A++',
    fee: '₹2.2L',
    emi: '₹2,500/mo',
    bestFor: 'South India Brand',
    specs: ['Finance', 'Marketing', 'HR', 'Data Analytics', 'International Business'],
    badge: 'NAAC A++',
    badgeColor: '#16a34a',
    badgeBg: '#f0fff4',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BestOnlineMBAPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="min-h-screen" style={{ background: '#F7F8FA' }}>

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-amber no-underline font-medium">Home</Link>
            <span>›</span>
            <span className="text-navy font-semibold">Best Online MBA in India 2026</span>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="bg-navy text-white py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'rgba(200,129,26,0.2)', color: '#e0a93a', border: '1px solid rgba(200,129,26,0.3)' }}>
              <Shield className="w-3 h-3" /> Updated April 2026 · Zero Paid Rankings
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Best Online MBA in India 2026
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-6">
              10 UGC DEB approved online MBA programs ranked by NIRF and NAAC — not by who paid us.
              Fees from ₹60,000. All valid for government jobs and corporate hiring.
            </p>

            {/* Quick nav pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Top 10 Rankings', href: '#rankings' },
                { label: 'By Budget', href: '#by-budget' },
                { label: 'By Use Case', href: '#by-usecase' },
                { label: 'Specializations', href: '#specializations' },
                { label: 'FAQs', href: '#faq' },
              ].map(pill => (
                <a key={pill.href} href={pill.href}
                  className="px-3 py-1.5 rounded-full text-xs font-bold no-underline"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {pill.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Last updated + methodology strip ───────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> Ranked by NIRF (Ministry of Education)</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> NAAC grade verified (naac.gov.in)</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> UGC DEB approved only</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> Fees from official university websites</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber" /> Zero paid placements</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

          {/* ── Quick verdict box ─────────────────────────────────────────── */}
          <div className="card p-6 mb-8 border-l-4 border-amber">
            <h2 className="text-lg font-bold text-navy mb-3">Quick Verdict — Best Online MBA by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Best overall (ranking + brand)', value: 'MAHE Manipal Online — NIRF #3, NAAC A++' },
                { label: 'Best under ₹1.5L', value: 'SRM Online — NIRF #11, NAAC A++ from ₹60K' },
                { label: 'Best premium brand', value: 'Symbiosis SSODL — NIRF #24, NAAC A++' },
                { label: 'Best for government jobs', value: 'IGNOU / Andhra University — cheapest UGC DEB approved' },
                { label: 'Best management depth', value: 'NMIMS Online — NIRF Mgmt #24, NAAC A++' },
                { label: 'Best for working professionals', value: 'Chandigarh University or LPU — flexible + A++' },
              ].map(item => (
                <div key={item.label} className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-navy">{item.label}</div>
                    <div className="text-xs text-ink-2">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top 10 Rankings Table ─────────────────────────────────────── */}
          <section id="rankings" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-navy mb-2">Top 10 Online MBA Universities in India 2026</h2>
            <p className="text-sm text-ink-2 mb-6">Ranked by NIRF (Ministry of Education, India). All universities are UGC DEB approved and NAAC accredited. Fees shown are total program cost from official university websites.</p>

            <div className="space-y-4">
              {TOP_10.map((u) => (
                <div key={u.id} className="card overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                    {/* Rank */}
                    <div className="flex items-center gap-4 sm:w-8 shrink-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                        style={{ background: u.rank <= 3 ? 'linear-gradient(135deg,#c9922a,#e0a93a)' : 'var(--surface-2)', color: u.rank <= 3 ? '#fff' : 'var(--ink-2)' }}>
                        {u.rank}
                      </div>
                    </div>

                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link href={`/universities/${u.id}/mba`} className="font-bold text-navy hover:text-amber transition-colors no-underline text-base">
                          {u.name}
                        </Link>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: u.badgeBg, color: u.badgeColor, border: `1px solid ${u.badgeColor}30` }}>
                          {u.badge}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-ink-2 mb-2">
                        <span className="font-semibold" style={{ color: '#1a5f9a' }}>NIRF #{u.nirf}</span>
                        <span className="font-semibold" style={{ color: '#16a34a' }}>NAAC {u.naac}</span>
                        <span>Best for: <strong className="text-ink-1">{u.bestFor}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {u.specs.slice(0, 4).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                            style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}>
                            {s}
                          </span>
                        ))}
                        {u.specs.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'var(--surface-2)', color: 'var(--ink-3)', border: '1px solid var(--border)' }}>
                            +{u.specs.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fee + CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-ink-3">Total fees</div>
                        <div className="font-bold text-navy text-sm">{u.fee}</div>
                        <div className="text-[10px] text-amber font-semibold">EMI {u.emi}</div>
                      </div>
                      <Link href={`/universities/${u.id}/mba`}
                        className="px-4 py-2 rounded-lg text-xs font-bold btn-primary whitespace-nowrap no-underline">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl text-xs text-ink-2 leading-relaxed" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <strong className="text-navy">Ranking methodology:</strong> Universities are ordered by their overall NIRF rank published by the Ministry of Education, India (nirfindia.org). NAAC grade sourced from naac.gov.in. Fees are from official university websites as of March 2026 and may change. <strong>No university paid to appear or rank higher on this list.</strong>
            </div>
          </section>

          {/* ── Comparison Table ──────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy mb-4">Side-by-Side Comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--navy)', color: '#fff' }}>
                    <th className="text-left px-4 py-3 font-bold text-xs">University</th>
                    <th className="px-4 py-3 font-bold text-xs text-center">NIRF</th>
                    <th className="px-4 py-3 font-bold text-xs text-center">NAAC</th>
                    <th className="px-4 py-3 font-bold text-xs text-center">Total Fee</th>
                    <th className="px-4 py-3 font-bold text-xs text-center">Govt Jobs</th>
                    <th className="px-4 py-3 font-bold text-xs hidden md:table-cell">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_10.map((u, i) => (
                    <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : ''} style={{ background: i % 2 !== 0 ? 'var(--surface-2)' : '' }}>
                      <td className="px-4 py-3 font-medium text-navy text-xs">
                        <Link href={`/universities/${u.id}/mba`} className="hover:text-amber no-underline">{u.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#1a5f9a' }}>#{u.nirf}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#16a34a' }}>{u.naac}</td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-navy">{u.fee}</td>
                      <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-sage mx-auto" /></td>
                      <td className="px-4 py-3 text-xs text-ink-2 hidden md:table-cell">{u.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-3 mt-2">All universities above are UGC DEB approved and valid for government job applications.</p>
          </section>

          {/* ── By Budget ─────────────────────────────────────────────────── */}
          <section id="by-budget" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-4">Best Online MBA by Budget</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  range: 'Under ₹1 Lakh',
                  color: '#16a34a',
                  bg: '#f0fff4',
                  border: '#bbf7d0',
                  picks: [
                    { name: 'SRM Online', fee: '₹60K', note: 'NIRF #11, NAAC A++', id: 'srm-institute-science-technology-online' },
                    { name: 'Andhra University Online', fee: '₹60K', note: 'NIRF #23, NAAC A++', id: 'andhra-university-online' },
                    { name: 'Anna University Online', fee: '₹60K', note: 'NIRF #20, NAAC A++', id: 'anna-university-online' },
                  ],
                  note: 'Government and government-funded universities. Best value for NAAC A++ credential.',
                },
                {
                  range: '₹1L – ₹2L',
                  color: '#1a5f9a',
                  bg: '#eff6ff',
                  border: '#bfdbfe',
                  picks: [
                    { name: 'Chandigarh University Online', fee: '₹1.65L', note: 'NIRF #19, NAAC A+', id: 'chandigarh-university-online' },
                    { name: 'LPU Online', fee: '₹1.46L', note: 'NIRF #31, NAAC A++', id: 'lovely-professional-university-online' },
                    { name: 'MUJ Online', fee: '₹1.6L', note: 'NIRF #58, NAAC A+', id: 'manipal-university-jaipur-online' },
                  ],
                  note: 'Best mix of brand value and affordability. Strong employer recognition.',
                },
                {
                  range: '₹2L – ₹3.5L',
                  color: '#7c3aed',
                  bg: '#f5f3ff',
                  border: '#ddd6fe',
                  picks: [
                    { name: 'MAHE Manipal Online', fee: '₹2.75L', note: 'NIRF #3, NAAC A++, QS #32', id: 'manipal-academy-higher-education-online' },
                    { name: 'NMIMS Online', fee: '₹2.2L', note: 'NIRF #52, NAAC A++', id: 'nmims-online' },
                    { name: 'Symbiosis SSODL', fee: '₹3.15L', note: 'NIRF #24, NAAC A++', id: 'symbiosis-university-online' },
                  ],
                  note: 'Premium programs with strongest brand recognition for corporate hiring.',
                },
              ].map(tier => (
                <div key={tier.range} className="card p-5" style={{ borderTop: `3px solid ${tier.color}` }}>
                  <div className="text-sm font-bold mb-3" style={{ color: tier.color }}>{tier.range}</div>
                  <div className="space-y-2 mb-3">
                    {tier.picks.map(p => (
                      <div key={p.id} className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/universities/${p.id}/mba`} className="text-xs font-bold text-navy hover:text-amber no-underline block">{p.name}</Link>
                          <div className="text-[10px] text-ink-3">{p.note}</div>
                        </div>
                        <span className="text-xs font-bold shrink-0" style={{ color: tier.color }}>{p.fee}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-2 leading-relaxed border-t border-border pt-2">{tier.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── By Use Case ───────────────────────────────────────────────── */}
          <section id="by-usecase" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-4">Best Online MBA by Use Case</h2>
            <div className="space-y-4">
              {[
                {
                  useCase: 'Government Job / PSU Eligibility',
                  icon: '🏛️',
                  desc: 'Any UGC DEB approved online MBA qualifies. Choose based on budget. Even IGNOU\'s ₹58,000 MBA is fully valid for UPSC, SSC, banking, and railway exams.',
                  picks: ['Andhra University Online (NIRF #23, cheapest A++)', 'SRM Online (NIRF #11, ₹60K)', 'IGNOU (₹58K, government-run)'],
                  link: '/guides/online-mba-for-government-jobs',
                  linkLabel: 'Read: Online MBA & Govt Jobs Guide',
                },
                {
                  useCase: 'Working Professionals (No Time for Classes)',
                  icon: '💼',
                  desc: 'Prioritise universities with recorded lectures, flexible schedules, and online proctored exams. Weekend-only live sessions are standard across all top online MBAs.',
                  picks: ['LPU Online (NIRF #31, flexible, ₹1.46L)', 'Chandigarh University (NIRF #19, strong LMS)', 'Amity Online (NIRF #22, industry exposure)'],
                  link: '/blog/is-online-mba-worth-it-2026',
                  linkLabel: 'Read: Is Online MBA Worth It in 2026?',
                },
                {
                  useCase: 'Corporate Hiring / Brand-Conscious Employers',
                  icon: '🏢',
                  desc: 'For employers who care about the university name, stick to MAHE Manipal, NMIMS, Symbiosis, or Amity. These carry the strongest brand recall in HR circles.',
                  picks: ['MAHE Manipal (NIRF #3, QS #32 Asia)', 'NMIMS (NIRF Mgmt #24)', 'Symbiosis SSODL (NIRF #24)'],
                  link: '/compare',
                  linkLabel: 'Compare these universities →',
                },
                {
                  useCase: 'International Recognition / Going Abroad',
                  icon: '🌍',
                  desc: 'For immigration or foreign employer recognition, choose WES Canada-recognised or QS-ranked programs. Only a handful of Indian online MBAs meet this bar.',
                  picks: ['Amity Online (WES Recognised)', 'MAHE Manipal Online (QS #32, WES Recognised)', 'NMIMS Online (WES Recognised)'],
                  link: '/universities/manipal-academy-higher-education-online',
                  linkLabel: 'View MAHE Manipal details →',
                },
              ].map(item => (
                <div key={item.useCase} className="card p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-navy text-base">{item.useCase}</h3>
                      <p className="text-sm text-ink-2 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3 pl-2">
                    {item.picks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-ink-1">
                        <CheckCircle className="w-3.5 h-3.5 text-sage shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link href={item.link} className="text-xs font-bold text-amber hover:underline flex items-center gap-1 no-underline">
                    {item.linkLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ── Specializations ───────────────────────────────────────────── */}
          <section id="specializations" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-2">Best MBA Specialization for Your Career</h2>
            <p className="text-sm text-ink-2 mb-5">All specializations below are available in online MBA programs from UGC DEB approved universities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { spec: 'Finance', career: 'Banking, CFO roles, Investment, Fintech', salary: '₹5L–₹20L', link: '/programs/mba/finance' },
                { spec: 'Marketing', career: 'Brand management, Digital marketing, Sales', salary: '₹4L–₹15L', link: '/programs/mba/marketing' },
                { spec: 'Human Resource Management', career: 'HR Business Partner, L&D, Talent Acquisition', salary: '₹4L–₹12L', link: '/programs/mba/human-resource-management' },
                { spec: 'Business Analytics', career: 'Data Analyst, Business Intelligence, Consulting', salary: '₹6L–₹20L', link: '/programs/mba/business-analytics' },
                { spec: 'Operations Management', career: 'Supply Chain, Logistics, Process Management', salary: '₹5L–₹18L', link: '/programs/mba/operations-management' },
                { spec: 'International Business', career: 'Export-Import, Global Strategy, Trade Finance', salary: '₹5L–₹16L', link: '/programs/mba/international-business' },
              ].map(item => (
                <Link key={item.spec} href={item.link}
                  className="card p-4 hover:border-amber transition-colors no-underline block">
                  <div className="font-bold text-navy text-sm mb-0.5">{item.spec}</div>
                  <div className="text-xs text-ink-2 mb-1">{item.career}</div>
                  <div className="text-xs font-semibold text-amber">{item.salary} avg package</div>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link href="/blog/best-mba-specialization-india-2026" className="text-xs font-bold text-amber hover:underline flex items-center gap-1">
                Read: Best MBA Specialization in India 2026 — Full Salary Comparison <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* ── How to Choose ─────────────────────────────────────────────── */}
          <section className="card p-7 mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-amber" />
              </div>
              <h2 className="text-xl font-bold text-navy">How to Choose the Right Online MBA</h2>
            </div>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Verify UGC DEB approval first', desc: 'Check the official UGC DEB approved list at ugc.ac.in. Do not enrol in any online MBA from a university not on this list — the degree will not be recognised.' },
                { step: '2', title: 'Match NIRF rank to your career goal', desc: 'If you are targeting PSU, govt jobs, or education — any UGC DEB approved university works. For corporate hiring at competitive companies, stick to NIRF top 50.' },
                { step: '3', title: 'Check NAAC grade (A++ > A+ > A)', desc: 'NAAC A++ signals highest quality accreditation. For most online MBA programs, aim for at least NAAC A or A+.' },
                { step: '4', title: 'Set a realistic budget with EMI', desc: 'Total fees range from ₹60K to ₹3.15L. All top universities offer semester-wise payment or EMI from ₹1,500/month. Factor in total cost, not just semester 1.' },
                { step: '5', title: 'Choose specialization based on your career, not trend', desc: 'Finance and Analytics have the highest salary ceiling but need prior aptitude. HR and Marketing are broader. Pick based on your current work or target role.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: 'linear-gradient(135deg,#c9922a,#e0a93a)', color: '#fff' }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{item.title}</div>
                    <div className="text-sm text-ink-2 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <Link href="/blog/how-to-choose-online-mba-university-india-2026" className="text-sm font-bold text-amber hover:underline flex items-center gap-1">
                Read the full 2026 guide: How to Choose the Right Online MBA University in India <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* ── Related Content ───────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy mb-4">Related Guides &amp; Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: BookOpen,
                  title: 'Is Online MBA Worth It in 2026?',
                  desc: 'Honest ROI breakdown — salary data, employer perception, who should and shouldn\'t do it.',
                  href: '/blog/is-online-mba-worth-it-2026',
                  tag: 'Blog',
                },
                {
                  icon: BookOpen,
                  title: 'Best Affordable Online MBA India 2026',
                  desc: 'Programs under ₹1 lakh compared honestly — IGNOU, government universities, and budget private options.',
                  href: '/blog/affordable-online-mba-india-2026',
                  tag: 'Blog',
                },
                {
                  icon: BookOpen,
                  title: 'Online MBA vs Distance MBA',
                  desc: 'Key differences in delivery, recognition, learning experience, and career outcomes.',
                  href: '/guides/online-mba-vs-distance-mba',
                  tag: 'Guide',
                },
                {
                  icon: BookOpen,
                  title: 'Online MBA for Government Jobs',
                  desc: 'Which online MBAs are valid for UPSC, SSC, banking, PSU exams — and which are not.',
                  href: '/guides/online-mba-for-government-jobs',
                  tag: 'Guide',
                },
                {
                  icon: BookOpen,
                  title: 'Best MBA Specialization 2026',
                  desc: 'Finance vs Marketing vs Analytics vs HR — salary data and career paths compared.',
                  href: '/blog/best-mba-specialization-india-2026',
                  tag: 'Blog',
                },
                {
                  icon: IndianRupee,
                  title: 'EMI Calculator',
                  desc: 'Calculate your exact monthly EMI for any online MBA fee.',
                  href: '/tools/emi-calculator',
                  tag: 'Tool',
                },
              ].map(item => (
                <Link key={item.href} href={item.href} className="card p-5 hover:border-amber transition-colors no-underline block">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber mb-2">{item.tag}</div>
                  <div className="font-bold text-navy text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-ink-2 leading-relaxed">{item.desc}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section id="faq" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqSchema.mainEntity.map((faq) => (
                <details key={faq.name} className="card p-5 group">
                  <summary className="font-bold text-navy text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                    {faq.name}
                    <span className="text-amber text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-ink-2 mt-3 leading-relaxed">{faq.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <BestMBAClient />

        </div>
      </div>
    </>
  )
}
