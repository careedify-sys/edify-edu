'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GraduationCap, Layers, Wallet, BadgeCheck } from 'lucide-react'
import { UNIS_SLIM, PREFERRED_UNI_IDS } from '@/lib/data-slim'
import UniversityCard from '@/components/UniversityCard'
import { formatRank, preferForProgram } from '@/lib/highlight'

const PROGRAM_INFO: Record<string, { title: string; level: string; duration: string; description: string }> = {
  MBA: {
    title: 'Online MBA in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Business Administration. UGC-DEB approved online MBA is legally equivalent to campus MBA under 2020 regulations. Valid for government jobs, PSU recruitment, and private-sector employment.',
  },
  MCA: {
    title: 'Online MCA Courses in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Computer Applications. Designed for IT professionals and graduates seeking advanced computing skills. Covers software engineering, AI/ML, data science, and cybersecurity.',
  },
  BBA: {
    title: 'Online BBA Courses in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Business Administration. Foundation management degree for students after 12th. Covers marketing, finance, HR, and operations fundamentals.',
  },
  BCA: {
    title: 'Online BCA Courses in India',
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
    description: 'Master of Arts. A 2-year postgraduate degree you can join with a bachelor\'s degree. The subjects UGC-DEB universities offer online most often are Sociology, English, Political Science, Economics, History and Public Administration. It counts the same as a campus MA under UGC rules, which matters for government exams and teaching eligibility.',
  },
  BA: {
    title: 'Online BA in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Arts. A 3-year undergraduate degree you can join after Class 12. The subjects UGC-DEB universities offer online most often are Political Science, English, History, Sociology and Economics. It counts the same as a campus BA under UGC rules, so it supports a later MA, government exams and teaching qualifications.',
  },
  MSc: {
    title: 'Online MSc in India',
    level: 'Postgraduate',
    duration: '2 Years',
    description: 'Master of Science. UGC allows a science degree online only where practical work is limited to programming and coding, so lab-based subjects cannot run online. Online MSc programmes are in subjects such as Mathematics and Data Science.',
  },
  BSc: {
    title: 'Online BSc in India',
    level: 'Undergraduate',
    duration: '3 Years',
    description: 'Bachelor of Science. UGC allows a science degree online only where practical work is limited to programming and coding (UGC ODL and Online Regulations 2020, Regulation 4), so lab subjects such as Physics, Chemistry and Microbiology cannot run online. The online BSc programmes listed here are in Data Science, Economics and Social Sciences.',
  },
}

interface Props {
  program: string
  // Per-university fee for THIS programme, from getDisplayFee on the server.
  // null = suppressed or unknown. UNIS_SLIM feeMin/feeMax are MBA-led and must
  // not be shown on a non-MBA hub.
  programFees: Record<string, string | null>
}

// No hub-wide "from X to Y" fee: the floor of a cross-university range is a
// derived superlative, and floors like IGNOU's BA Rs 9,600 or a 3x-wide range
// are exactly where those go wrong (memory: feedback_never_derive_fees).
export default function ProgramHubClient({ program, programFees }: Props) {
  const info = PROGRAM_INFO[program] || { title: `Online ${program} in India`, level: 'Degree', duration: '2-3 Years', description: `UGC-DEB approved online ${program} programmes.` }

  const unis = useMemo(() => {
    const prefer = preferForProgram(program)
    return UNIS_SLIM
      .filter(u => u.programs.includes(program))
      .sort((a, b) => {
        // Preferred unis first, then by the right NIRF category for this program
        // (Management rank on MBA/management surfaces, University elsewhere).
        // Unranked (999) sorts last via formatRank's sortKey of 9999.
        const aPref = PREFERRED_UNI_IDS.includes(a.id) ? -1000 : 0
        const bPref = PREFERRED_UNI_IDS.includes(b.id) ? -1000 : 0
        return (aPref + formatRank(a, prefer).sortKey) - (bPref + formatRank(b, prefer).sortKey)
      })
  }, [program])

  const feeKnown = Object.values(programFees).filter(Boolean).length

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            {info.title} - Compare {unis.length} UGC-Approved Universities
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            Independent comparison. No paid rankings. No referral commissions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <GraduationCap size={14} className="text-amber-400" /> {unis.length} Universities
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <Layers size={14} className="text-amber-400" /> {info.level} · {info.duration}
            </span>
            {feeKnown > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <Wallet size={14} className="text-amber-400" /> {feeKnown} {program} fees listed
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
            <UniversityCard key={u.id} u={u as any} highlightProgram={program} programFee={programFees[u.id] ?? null} />
          ))}
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Quick Answers</h2>
        <div className="space-y-4">
          {[
            { q: `Is online ${program} valid for jobs?`, a: `Yes, when the university is UGC-DEB entitled for online ${program} in your admission session. Regulation 22 of the UGC ODL and Online Regulations 2020 treats these degrees as equivalent to campus degrees. Check the entitlement on deb.ugc.ac.in before you pay.` },
            { q: `How much does online ${program} cost?`, a: feeKnown > 0 ? `It depends on the university. Each card below shows the total ${program} fee where we can confirm it, which is ${feeKnown} of ${unis.length} universities. Fees are indicative, so confirm the current figure on the official portal.` : `We cannot yet confirm a ${program} fee for these universities. Check each university's official portal or ask our counsellor.` },
            { q: `How long is online ${program}?`, a: `Standard duration is ${info.duration}. Universities set a maximum period to finish, which is longer than the standard duration.` },
            { q: `What is the eligibility for online ${program}?`, a: `${info.level === 'Postgraduate' ? 'A bachelor\'s degree from a recognised university. Many universities ask for 50% marks, so check the programme page.' : 'Class 12 (10+2) or equivalent from a recognised board, including open schooling. Some universities set a minimum percentage, so check the programme page.'}` },
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
