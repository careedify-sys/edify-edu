'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GraduationCap, Layers, Wallet, BadgeCheck, ChevronRight, TrendingUp, Shield, BookOpen } from 'lucide-react'
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

const TOP_10_PICKS = [
  { id: 'manipal-academy-higher-education-online', bestFor: 'NIRF #3 Management. Strongest brand prestige among all online MBA providers in India. Ideal for South India careers.', fee: '2.92L' },
  { id: 'amity-university-online', bestFor: 'International careers. Only Indian online MBA with both WASC (USA) and QAA (UK) accreditation. WES recognized for Canada/US immigration.', fee: '2.07L' },
  { id: 'nmims-online', bestFor: 'BFSI careers. AACSB member. Strongest recruiter recall in banking, financial services, and insurance sector.', fee: '1.96L' },
  { id: 'jain-university-online', bestFor: 'NAAC A++ at mid-range fee. 19 specializations with ACCA integration. Strong in Bangalore tech ecosystem.', fee: '1.96L' },
  { id: 'symbiosis-university-online', bestFor: 'HR and marketing brand prestige. NAAC A++, NIRF #32 Management. Premium positioning among MNC recruiters.', fee: '3.15L' },
  { id: 'chandigarh-university-online', bestFor: 'Bundled certifications. Harvard Business Publishing, PwC, and PMI certifications included at no extra cost.', fee: '1.65L' },
  { id: 'lovely-professional-university-online', bestFor: 'Tech-driven LMS with NAAC A++ at affordable fee. Strong North India alumni network.', fee: '1.61L' },
  { id: 'manipal-university-jaipur-online', bestFor: 'Manipal brand at lower price. 13 specializations. Mandatory dual-spec option available.', fee: '1.53L' },
  { id: 'amrita-vishwa-vidyapeetham-online', bestFor: 'NIRF #8 University. Grant Thornton co-branded Analytics/FinTech/ESG tracks. NAAC A++.', fee: '2.60L' },
  { id: 'ignou-online', bestFor: 'Lowest fee at Rs 66,000. Central government university. NAAC A++. Strongest government job eligibility.', fee: '0.66L' },
]

const SALARY_DATA = [
  { spec: 'Finance', range: '6-15 LPA', growth: 'High' },
  { spec: 'Business Analytics', range: '7-14 LPA', growth: 'High' },
  { spec: 'IT / Tech-MBA', range: '8-18 LPA', growth: 'High' },
  { spec: 'Marketing', range: '6-12 LPA', growth: 'Medium' },
  { spec: 'Operations', range: '6-12 LPA', growth: 'Medium' },
  { spec: 'HR Management', range: '5-10 LPA', growth: 'Stable' },
  { spec: 'Healthcare Mgmt', range: '6-11 LPA', growth: 'Growing' },
]

const FAQS = [
  { q: 'Is online MBA valid for jobs and government recognition?', a: 'Yes. UGC-DEB approved online MBA degrees are legally equivalent to campus degrees under UGC 2020 regulations. The degree certificate does not mention "online" or "distance" mode. Valid for UPSC, IBPS, SBI PO, PSU recruitment, and all private-sector employment. Some government notifications may specifically require "regular mode" degrees, so verify each job posting individually.' },
  { q: 'What is the difference between online MBA and distance MBA?', a: 'Online MBA uses a digital LMS with live weekend sessions, recorded lectures, AI-proctored online exams, and interactive discussion forums. Distance MBA uses printed study material with minimal digital interaction. UGC-DEB 2020 regulations brought online degrees at par with campus degrees in terms of legal validity and employer acceptance.' },
  { q: 'How much does online MBA cost in India in 2026?', a: 'Total programme fees range from Rs 66,000 (IGNOU) to Rs 3,70,000 (Symbiosis SSODL). Most popular programmes fall between Rs 1,50,000 and Rs 2,25,000. Zero-cost EMI is available at many universities. One-time payment discounts of Rs 10,000-20,000 are common.' },
  { q: 'Do online MBAs offer placement support?', a: 'Most online MBA programmes provide career services portals, job boards, and resume review. Active campus-style placement drives are rare for online students. Working professionals typically leverage the degree for internal promotions or self-directed job search through LinkedIn. Mid-career professionals benefit most from online MBA placement support.' },
  { q: 'Which MBA specialisation should I pick?', a: 'Match to your career goal. Finance for banking and investment roles. Marketing for FMCG and digital companies. HR for people management. Business Analytics for data-driven consulting and strategy roles. Healthcare Management for hospital administration. Compare Semester 3-4 subjects across universities before choosing.' },
  { q: 'What is the difference between AICTE approval and UGC-DEB approval for online MBA?', a: 'UGC-DEB (Distance Education Bureau) approves universities to offer online programmes. AICTE approves technical and management programmes at deemed universities. For an online MBA, you need both: UGC-DEB entitlement for the university plus AICTE recognition for the MBA programme (at deemed universities). State universities do not need AICTE approval.' },
  { q: 'Can I do an online MBA without work experience?', a: 'Yes. Most online MBA programmes accept fresh graduates with a bachelor degree and 40-50% aggregate marks. No work experience is required for standard online MBA admission. Executive MBA tracks typically require 2-5 years of professional experience. No entrance exam (CAT/MAT/XAT) is required at most universities.' },
  { q: 'How long is an online MBA programme in India?', a: 'Standard duration is 2 years (4 semesters). Some universities allow completion in up to 4-5 years for working professionals. IGNOU allows up to 4 years. Most students complete within the standard 2-year window while working full-time.' },
  { q: 'Are scholarships available for online MBA programmes?', a: 'Yes. Merit-based scholarships (5-25% fee waiver) are available at Amity, JAIN, Chandigarh, LPU, and several other universities. Defence personnel, divyaang candidates, and alumni often receive additional concessions. Some universities offer early-bird discounts for first-week enrollment.' },
  { q: 'Is online MBA accepted for PhD admission in India?', a: 'Yes. UGC-DEB approved online MBA degrees are recognized for PhD admissions at any UGC-approved university. You will need to clear NET/JRF or the university entrance exam. WES-evaluated online MBAs are also accepted for doctoral programmes at international universities.' },
  { q: 'What documents are required for online MBA admission?', a: 'Standard requirements: 10th and 12th mark sheets, graduation degree and mark sheets, passport-size photograph, government ID proof (Aadhaar or Passport), and sometimes a statement of purpose. International students may need passport copy and equivalence certificate.' },
  { q: 'Can I switch specialisation during my online MBA?', a: 'Most universities allow specialisation changes before Semester 3 begins, since specialisation subjects start from Semester 3. After Semester 3, switching is difficult. Check with your university admissions office for their specific policy. Some universities charge an administrative fee for late changes.' },
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Best Online MBA in India 2026 -- {mbaUnis.length} UGC-Approved Universities Compared
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            Independent comparison by EdifyEdu. No paid rankings. No referral commissions. NIRF 2025 data verified.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <GraduationCap size={14} className="text-amber-400" /> {mbaUnis.length} Universities
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
            <a href="#top-10" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors no-underline">
              Top 10 Quick Picks
            </a>
            <a href="#universities" className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors no-underline">
              Browse All Universities
            </a>
            <a href="#specialisations" className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors no-underline">
              Browse Specialisations
            </a>
          </div>
        </div>
      </section>

      {/* Editorial Intro */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>How We Ranked the Best Online MBA Programmes in India 2026</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          EdifyEdu is independent. We earn zero commissions from any university listed here. Every fee, NIRF rank, and accreditation you see has been verified against official UGC-DEB, NAAC, and university portals. Our ranking methodology prioritises data you can verify yourself, not marketing claims.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Under UGC 2024 regulations, universities offering online MBA programmes must hold UGC-DEB entitlement, AICTE recognition (for deemed universities), and either NAAC accreditation of 3.01 CGPA or higher, or a top-100 NIRF ranking in at least 2 of the last 3 assessment cycles. Universities must also develop at least 60% of self-learning materials in-house.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          <strong>How we rank:</strong> NIRF Management category rank (2025) carries the highest weight, followed by NAAC grade, fee transparency, specialisation breadth, and student-reported placement outcomes. We exclude universities with fabricated placement statistics, unverified NIRF claims, or suspended UGC-DEB status.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Note:</strong> All fees shown are total programme fees (not per-semester) and are indicative. NIRF ranks are from the Management category 2025 unless stated otherwise. Verify current fees and UGC-DEB approval at <a href="https://deb.ugc.ac.in" target="_blank" rel="nofollow" className="text-amber-700 underline">deb.ugc.ac.in</a> and the university portal before applying.
        </div>
      </section>

      {/* Top 10 Quick Picks */}
      <section id="top-10" className="max-w-5xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#0B1533' }}>Top 10 Online MBAs in India 2026 -- Quick Picks</h2>
        <p className="text-sm text-slate-500 mb-6">Curated by NIRF Management rank, NAAC grade, fee value, and student outcomes. Each pick has a clear differentiator.</p>
        <div className="space-y-3">
          {TOP_10_PICKS.map((pick, i) => {
            const uni = UNIS_SLIM.find(u => u.id === pick.id)
            if (!uni) return null
            return (
              <Link key={pick.id} href={`/universities/${pick.id}/mba`} className="group block rounded-xl border border-slate-200 bg-white p-4 no-underline hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-base" style={{ color: '#0B1533' }}>{uni.name.replace(/\s+Online$/i, '')}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">Rs {pick.fee}</span>
                      {uni.naac && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">NAAC {uni.naac}</span>}
                      {uni.nirf > 0 && uni.nirf < 200 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">NIRF #{uni.nirf}</span>}
                    </div>
                    <p className="text-sm text-slate-600">{pick.bestFor}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 mt-1 flex-shrink-0 group-hover:text-amber-500 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Two Decision Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
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
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>All {mbaUnis.length} Online MBA Universities</h2>
        <p className="text-sm text-slate-500 mb-6">Sorted by popularity. Click any card for full fees, syllabus, and specialisation details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mbaUnis.map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram="MBA" />
          ))}
        </div>
      </section>

      {/* Specialisations Grid */}
      <section id="specialisations" className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>Browse by Specialisation</h2>
        <p className="text-sm text-slate-500 mb-6">Dedicated comparison pages for each MBA specialisation with syllabus, career scope, and salary data.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specWithCounts.map(({ spec, uniCount, feeFloor: sf }) => (
            <SpecCard key={spec.slug} spec={spec} uniCount={uniCount} feeFloor={sf} />
          ))}
        </div>
      </section>

      {/* Salary & ROI Section */}
      <section id="salary" className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>
          <TrendingUp size={22} className="inline-block mr-2 text-amber-500" />
          Online MBA Salary in India 2026 -- What Can You Expect?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Salary after an online MBA depends on three factors: your prior work experience, the specialisation you choose, and how actively you pursue new opportunities. The degree itself does not guarantee a salary jump. Here are realistic numbers based on industry surveys and our student feedback.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Freshers (0-1 yr)</p>
            <p className="text-2xl font-extrabold" style={{ color: '#0B1533' }}>Rs 3-6 LPA</p>
            <p className="text-xs text-slate-500 mt-1">Entry-level management trainee, business analyst, or executive roles</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Mid-Career (2-5 yr)</p>
            <p className="text-2xl font-extrabold" style={{ color: '#0B1533' }}>Rs 6-12 LPA</p>
            <p className="text-xs text-slate-600 mt-1">Career switch or promotion to manager, team lead, or senior analyst</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Senior (5+ yr)</p>
            <p className="text-2xl font-extrabold" style={{ color: '#0B1533' }}>Rs 10-25 LPA</p>
            <p className="text-xs text-slate-500 mt-1">Director, VP, or senior management roles leveraging MBA credential</p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Salary by Specialisation</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Specialisation</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Salary Range</th><th className="px-4 py-2.5 text-left font-semibold text-slate-700">Demand</th></tr></thead>
            <tbody>
              {SALARY_DATA.map((s, i) => (
                <tr key={s.spec} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-2 text-slate-700 font-medium">{s.spec}</td>
                  <td className="px-4 py-2 text-slate-600">Rs {s.range}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.growth === 'High' ? 'bg-green-100 text-green-800' : s.growth === 'Growing' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                      {s.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 mb-4">
          <h4 className="font-bold text-green-900 mb-2">ROI Math Example</h4>
          <ul className="text-sm text-green-800 space-y-1 list-none pl-0">
            <li>Average mid-career fee: Rs 2,00,000</li>
            <li>Pre-MBA salary: Rs 6 LPA</li>
            <li>Post-MBA salary: Rs 8 LPA (33% increase)</li>
            <li>Breakeven on fees: 12-18 months</li>
            <li>5-year net ROI: Rs 8-12 lakh gain</li>
          </ul>
          <p className="text-xs text-green-700 mt-2">This ROI only applies if you actively pursue career growth post-MBA. Passive degree-holders see minimal returns.</p>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Honest disclaimer:</strong> Online MBA placement assistance varies by university. Most salary growth comes from internal promotions or self-directed job search via LinkedIn and professional networks, not university placement cells. Universities that claim "100% placement" for online programmes should be treated with scepticism.
        </p>
      </section>

      {/* How to Choose Framework */}
      <section id="how-to-choose" className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>
          <BookOpen size={22} className="inline-block mr-2 text-amber-500" />
          How to Pick the Right Online MBA in India 2026
        </h2>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-base mb-2" style={{ color: '#0B1533' }}>Step 1: Decide Your Priority</h3>
            <ul className="text-sm text-slate-600 space-y-1.5 list-none pl-0">
              <li><strong>Career switch?</strong> Pick brand recognition: <Link href="/universities/nmims-online/mba" className="text-blue-600 underline">NMIMS</Link>, <Link href="/universities/symbiosis-university-online/mba" className="text-blue-600 underline">Symbiosis</Link>, or <Link href="/universities/manipal-academy-higher-education-online/mba" className="text-blue-600 underline">MAHE</Link></li>
              <li><strong>Promotion at current job?</strong> Pick affordability + UGC validity: <Link href="/universities/ignou-online/mba" className="text-blue-600 underline">IGNOU</Link> or <Link href="/universities/galgotias-university-online/mba" className="text-blue-600 underline">Galgotias</Link></li>
              <li><strong>International career?</strong> Pick global accreditation: <Link href="/universities/amity-university-online/mba" className="text-blue-600 underline">Amity</Link> (WASC+QAA) or <Link href="/universities/jain-university-online/mba" className="text-blue-600 underline">JAIN</Link> (ACCA)</li>
              <li><strong>Specialisation depth?</strong> Pick 15+ specs: Amity (19), JAIN (19), Chandigarh (26+)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-base mb-2" style={{ color: '#0B1533' }}>Step 2: Verify UGC-DEB Approval</h3>
            <p className="text-sm text-slate-600">Check <a href="https://deb.ugc.ac.in" target="_blank" rel="nofollow" className="text-blue-600 underline">deb.ugc.ac.in</a> for current approval status. Avoid universities suspended in the last 3 years. Confirm AICTE approval for deemed universities. Every university on this page is verified UGC-DEB approved as of April 2026.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-base mb-2" style={{ color: '#0B1533' }}>Step 3: Check Fee Structure Carefully</h3>
            <p className="text-sm text-slate-600">Compare total programme fee, not per-semester cost. Watch for hidden charges: registration fee, exam fee, application fee, alumni membership. Check if one-time payment offers a discount. Verify EMI terms directly with the university. <Link href="/blog/online-mba-fee-comparison-india-2026" className="text-blue-600 underline">See our full fee comparison</Link>.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-base mb-2" style={{ color: '#0B1533' }}>Step 4: Audit Placement Claims</h3>
            <p className="text-sm text-slate-600">Distinguish between university-published placement data and independently verified outcomes. Online MBA placement data is often conflated with campus placement statistics. Look for median salary (not highest package). Ask for online-specific placement reports. <Link href="/blog/is-online-mba-worth-it-2026" className="text-blue-600 underline">Is online MBA actually worth it?</Link></p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-base mb-2" style={{ color: '#0B1533' }}>Step 5: Validate Global Recognition (If Relevant)</h3>
            <p className="text-sm text-slate-600">For Canada/USA immigration: check WES recognition. For international accounting: check ACCA integration. For global MBA validity: look for AACSB, AMBA, or EQUIS accreditation. Most Indian online MBAs are recognized domestically but vary in international acceptance.</p>
          </div>
        </div>
      </section>

      {/* Why EdifyEdu */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>
          <Shield size={22} className="inline-block mr-2 text-amber-500" />
          Why Trust EdifyEdu for Online MBA Comparison?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Most online MBA comparison platforms earn referral commissions from the universities they recommend. This creates conflicts of interest that affect which universities they highlight, how they describe placement support, whether they share negative student feedback, and how they build their "top 10" rankings.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          EdifyEdu earns zero referral commissions. Our revenue comes from independent counselling fees only, paid by students, not universities. This means we can recommend <Link href="/universities/ignou-online/mba" className="text-blue-600 underline">IGNOU at Rs 66,000</Link> over Amity at Rs 2.07L when budget matters. We can share paraphrased Reddit and Quora negative feedback. We can tell you when an online MBA is the wrong choice for your career goal. We compare universities outside our platform when relevant.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every fee, NIRF rank, NAAC grade, and accreditation on this page is verified against official sources. If a number changes, we update it. If a university loses accreditation, we flag it. Independence is not a marketing claim for us. It is our business model.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Frequently Asked Questions About Online MBA in India</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
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
          <h2 className="text-2xl font-bold text-white mb-2">Compare Up to 3 Online MBAs Side by Side</h2>
          <p className="text-slate-300 text-sm mb-5">Fees, specialisations, NIRF rankings, scholarships -- all in one view. No login required.</p>
          <Link href="/compare" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
            Open Comparison Tool
          </Link>
        </div>
      </section>

      {/* Trust + CTA */}
      <section className="bg-slate-50 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
          <span>Independent -- No referral commissions</span>
          <span>Verified -- NIRF 2025 + UGC-DEB data</span>
          <span>Transparent -- Real reviews, honest red flags</span>
        </div>
      </section>
      <section className="py-10 px-4 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0B1533' }}>Not Sure Which Online MBA Is Right for You?</h2>
        <p className="text-slate-500 text-sm mb-4 max-w-lg mx-auto">Free 20-minute call with an EdifyEdu counsellor. We help match your career goal to the right programme. No pressure, no paid recommendations.</p>
        <Link href="/contact" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling
        </Link>
      </section>
    </>
  )
}
