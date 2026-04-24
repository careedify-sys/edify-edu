'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GraduationCap, Layers, Wallet, BadgeCheck } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim, PREFERRED_UNI_IDS } from '@/lib/data-slim'
import UniversityCard from '@/components/UniversityCard'

const PROGRAM_INFO: Record<string, { title: string; level: string; duration: string; description: string }> = {
  MBA: {
    title: 'Online MBA in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Business Administration. UGC-DEB approved online MBA is legally equivalent to campus MBA under 2020 regulations. Valid for government jobs, PSU recruitment, and private-sector employment.',
  },
  MCA: {
    title: 'Online MCA in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Computer Applications. Designed for IT professionals and graduates seeking advanced computing skills. Covers software engineering, AI/ML, data science, and cybersecurity.',
  },
  BBA: {
    title: 'Online BBA in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Business Administration. Foundation management degree for students after 12th. Covers marketing, finance, HR, and operations fundamentals.',
  },
  BCA: {
    title: 'Online BCA in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Computer Applications. Entry-level IT degree covering programming, databases, web development, and computer networks. Gateway to MCA or direct IT employment.',
  },
  'B.Com': {
    title: 'Online B.Com in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Commerce. Covers accounting, taxation, business law, economics, and financial management. Foundation for CA, CMA, MBA, or direct employment in commerce roles.',
  },
  'M.Com': {
    title: 'Online M.Com in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Commerce. Advanced study in accounting, finance, taxation, and business management. Suitable for B.Com graduates targeting senior commerce and finance roles.',
  },
  MA: {
    title: 'Online MA in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Arts. Available in subjects like Economics, English, Hindi, Political Science, Public Administration, and Psychology. Suitable for government exam preparation and teaching careers.',
  },
  BA: {
    title: 'Online BA in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Arts. Foundation degree in humanities and social sciences. Covers subjects like English, Hindi, Economics, Political Science, Sociology, and Psychology.',
  },
  MSc: {
    title: 'Online MSc in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Science. Advanced study in data science, mathematics, computer science, and related fields. Growing demand in AI/ML and analytics roles.',
  },
  BSc: {
    title: 'Online BSc in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Science. Available in subjects like Mathematics, Computer Science, IT, and Data Science. Foundation for MSc or direct employment in technical roles.',
  },
}

interface Props {
  program: string
}

export default function ProgramHubClient({ program }: Props) {
  const info = PROGRAM_INFO[program] || { title: `Online ${program} in India`, level: 'Degree', duration: '2-3 Years', description: `UGC-DEB approved online ${program} programmes.` }

  const unis = useMemo(() => {
    return UNIS_SLIM
      .filter(u => u.programs.includes(program))
      .sort((a, b) => {
        // Preferred unis first, then by NIRF
        const aPref = PREFERRED_UNI_IDS.includes(a.id) ? -1000 : 0
        const bPref = PREFERRED_UNI_IDS.includes(b.id) ? -1000 : 0
        const aNirf = a.nirf > 0 && a.nirf < 200 ? a.nirf : 500
        const bNirf = b.nirf > 0 && b.nirf < 200 ? b.nirf : 500
        return (aPref + aNirf) - (bPref + bNirf)
      })
  }, [program])

  const feeFloor = Math.min(...unis.map(u => u.feeMin).filter(f => f > 0))
  const feeCeiling = Math.max(...unis.map(u => u.feeMax).filter(f => f > 0))

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            {info.title} - Compare {unis.length}+ UGC-Approved Universities
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            Independent comparison. No paid rankings. No referral commissions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <GraduationCap size={14} className="text-amber-400" /> {unis.length}+ Universities
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <Layers size={14} className="text-amber-400" /> {info.level} · {info.duration}
            </span>
            {feeFloor > 0 && feeCeiling > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <Wallet size={14} className="text-amber-400" /> {formatFeeSlim(feeFloor)} - {formatFeeSlim(feeCeiling)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <BadgeCheck size={14} className="text-amber-400" /> UGC-DEB Approved
            </span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#0B1533' }}>What is Online {program}?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{info.description}</p>
      </section>

      {/* University Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>All Online {program} Universities</h2>
        <p className="text-sm text-slate-500 mb-6">{unis.length} universities offering online {program}. Sorted by NIRF rank.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unis.map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram={program} />
          ))}
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Quick Answers</h2>
        <div className="space-y-4">
          {[
            { q: `Is online ${program} valid for jobs?`, a: `Yes. UGC-DEB approved online ${program} degrees are legally equivalent to campus degrees under UGC 2020 regulations. Valid for government jobs, PSU recruitment, and private-sector employment.` },
            { q: `How much does online ${program} cost?`, a: `Fees range from ${formatFeeSlim(feeFloor)} to ${formatFeeSlim(feeCeiling)} across ${unis.length} universities. Most programmes offer zero-cost EMI or semester-wise payment options.` },
            { q: `How long is online ${program}?`, a: `Standard duration is ${info.duration}. Most universities allow flexible completion within the maximum permitted timeframe.` },
            { q: `What is the eligibility for online ${program}?`, a: `${info.level === 'Postgraduate' ? 'Graduation with 50% marks from a UGC-recognised university. Some universities accept lower marks with work experience.' : '10+2 or equivalent from a recognised board with minimum 50% marks (relaxed for reserved categories at some universities).'}` },
          ].map((faq, i) => (
            <details key={i} className="rounded-xl border border-slate-200 bg-white">
              <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0B1533' }}>{faq.q}</summary>
              <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Compare Online {program} Universities</h2>
          <p className="text-slate-300 text-sm mb-5">Side-by-side fees, NIRF rankings, and specialisations.</p>
          <Link href="/compare" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
            Open Comparison Tool →
          </Link>
        </div>
      </section>

      {/* Trust + CTA */}
      <section className="bg-slate-50 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
          <span>✓ Independent - No referral commissions</span>
          <span>✓ Verified - NIRF 2025 + UGC-DEB data</span>
          <span>✓ Transparent - Real reviews, honest red flags</span>
        </div>
      </section>
      <section className="py-10 px-4 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0B1533' }}>Need help choosing?</h2>
        <p className="text-slate-500 text-sm mb-4 max-w-lg mx-auto">Free 20-minute call with an EdifyEdu counsellor. No pressure, no paid recommendations.</p>
        <Link href="/contact" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling →
        </Link>
      </section>
    </>
  )
}
