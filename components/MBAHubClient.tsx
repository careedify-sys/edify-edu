'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GraduationCap, Layers, Wallet, BadgeCheck } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim } from '@/lib/data-slim'
import { PREFERRED_UNI_IDS } from '@/lib/data-slim'
import { CANONICAL_SPECS } from '@/lib/specMapping'
import UniversityCard from '@/components/UniversityCard'
import SpecCard from '@/components/SpecCard'

const TRAFFIC_ORDER = [
  'amity-university-online', 'nmims-online', 'manipal-university-jaipur-online',
  'symbiosis-university-online', 'lovely-professional-university-online',
  'jain-university-online', 'upes-online', 'chandigarh-university-online',
  'sikkim-manipal-university-online', 'shoolini-university-online',
  'amrita-vishwa-vidyapeetham-online', 'ignou-online',
  'dr-dy-patil-vidyapeeth-online', 'manipal-academy-higher-education-online',
  'jaypee-university-online', 'galgotias-university-online',
  'uttaranchal-university-online', 'noida-international-university-online',
  'sharda-university-online', 'vignan-university-online',
  'alliance-university-online', 'kurukshetra-university-online',
]

export default function MBAHubClient() {
  const mbaUnis = useMemo(() => {
    return UNIS_SLIM
      .filter(u => PREFERRED_UNI_IDS.includes(u.id) && u.programs.includes('MBA'))
      .sort((a, b) => {
        const ai = TRAFFIC_ORDER.indexOf(a.id)
        const bi = TRAFFIC_ORDER.indexOf(b.id)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
      })
  }, [])

  const feeFloor = Math.min(...mbaUnis.map(u => u.feeMin).filter(f => f > 0))
  const feeCeiling = Math.max(...mbaUnis.map(u => u.feeMax).filter(f => f > 0))

  // Compute uni counts per spec using real mbaSpecs data
  const specWithCounts = useMemo(() => {
    return CANONICAL_SPECS.map(spec => {
      const matchingUnis = mbaUnis.filter(u => {
        const uniSpecs = u.mbaSpecs
        if (!uniSpecs || uniSpecs.length === 0) return false
        return uniSpecs.some(s => {
          const sn = s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
          return spec.variants.some(v => {
            const vn = v.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
            if (sn === vn) return true
            // Check if spec starts with variant or variant starts with spec
            if (sn.startsWith(vn + ' ') || sn.startsWith(vn + 's')) return true
            if (vn.startsWith(sn + ' ') || vn.startsWith(sn + 's')) return true
            return false
          })
        })
      })
      const fees = matchingUnis.map(u => u.feeMin).filter(f => f > 0)
      const feeMin = fees.length > 0 ? Math.min(...fees) : 0
      return { spec, uniCount: matchingUnis.length, feeFloor: feeMin }
    }).filter(s => s.uniCount > 0).sort((a, b) => b.uniCount - a.uniCount)
  }, [mbaUnis])

  return (
    <>
      {/* Compact Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Online MBA in India - Compare {mbaUnis.length}+ UGC-Approved Universities
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            Independent comparison. No paid rankings. No referral commissions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <GraduationCap size={14} className="text-amber-400" /> {mbaUnis.length}+ Universities
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <Layers size={14} className="text-amber-400" /> 150+ Specialisations
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <Wallet size={14} className="text-amber-400" /> {formatFeeSlim(feeFloor)} - {formatFeeSlim(feeCeiling)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <BadgeCheck size={14} className="text-amber-400" /> NIRF 2025 Verified
            </span>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="#universities" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors no-underline">
              Browse Universities →
            </a>
            <a href="#specialisations" className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors no-underline">
              Browse Specialisations →
            </a>
          </div>
        </div>
      </section>

      {/* Two Decision Cards */}
      <section className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-4">
          <a href="#universities" className="group block rounded-xl border border-slate-200 bg-white p-6 no-underline transition-all hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5">
            <GraduationCap size={32} className="text-amber-500 mb-3" />
            <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>Pick Your University First</h2>
            <p className="text-sm text-slate-500">Compare {mbaUnis.length} UGC-approved online MBAs by NIRF rank, fees, and specialisations.</p>
          </a>
          <a href="#specialisations" className="group block rounded-xl border border-slate-200 bg-white p-6 no-underline transition-all hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5">
            <Layers size={32} className="text-amber-500 mb-3" />
            <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1533' }}>Pick Your Specialisation First</h2>
            <p className="text-sm text-slate-500">See all universities offering MBA in Finance, HR, Marketing, Analytics and more.</p>
          </a>
        </div>
      </section>

      {/* Universities Grid */}
      <section id="universities" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>All Online MBA Universities</h2>
        <p className="text-sm text-slate-500 mb-6">Sorted by popularity. {mbaUnis.length} universities.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mbaUnis.map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram="MBA" />
          ))}
        </div>
      </section>

      {/* Specialisations Grid */}
      <section id="specialisations" className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>Browse by Specialisation</h2>
        <p className="text-sm text-slate-500 mb-6">Dedicated comparison pages for each MBA specialisation.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specWithCounts.map(({ spec, uniCount, feeFloor: sf }) => (
            <SpecCard key={spec.slug} spec={spec} uniCount={uniCount} feeFloor={sf} />
          ))}
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Quick Answers</h2>
        <div className="space-y-4">
          {[
            { q: 'Is online MBA valid for jobs and government recognition?', a: 'Yes. UGC-DEB approved online MBA degrees are legally equivalent to campus degrees under UGC 2020 regulations. Valid for UPSC, IBPS, PSU recruitment, and private-sector employment.' },
            { q: 'What is the difference between online MBA and distance MBA?', a: 'Online MBA uses a digital LMS with live sessions, recorded lectures, and online exams. Distance MBA uses printed study material with minimal digital interaction. UGC-DEB 2020 regulations brought online degrees at par with campus degrees.' },
            { q: 'How much does online MBA cost in India?', a: 'Fees range from Rs 66,000 (IGNOU) to Rs 3,70,000 (Symbiosis SSODL). Most programmes fall between Rs 90,000 and Rs 2,25,000. Zero-cost EMI is available at many universities.' },
            { q: 'Do online MBAs offer placement support?', a: 'Most online MBA programmes have limited active placement support compared to campus programmes. Working professionals typically leverage internal promotions. Self-directed job search through LinkedIn and professional networks is more effective.' },
            { q: 'Which specialisation should I pick?', a: 'Match to your career goal. Finance for banking/investment roles. Marketing for FMCG/digital. HR for people management. Business Analytics for data-driven roles. Healthcare for hospital management. Compare Sem 3-4 subjects across universities.' },
          ].map((faq, i) => (
            <details key={i} className="rounded-xl border border-slate-200 bg-white">
              <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0B1533' }}>{faq.q}</summary>
              <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">See detailed FAQs on each university's page →</p>
      </section>

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Compare Up to 3 Online MBAs Side by Side</h2>
          <p className="text-slate-300 text-sm mb-5">Fees, specialisations, NIRF rankings, scholarships - all in one view.</p>
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
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0B1533' }}>Ready to compare online MBAs?</h2>
        <p className="text-slate-500 text-sm mb-4 max-w-lg mx-auto">Free 20-minute call with an EdifyEdu counsellor. No pressure, no paid recommendations.</p>
        <Link href="/contact" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling →
        </Link>
      </section>
    </>
  )
}
