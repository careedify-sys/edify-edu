'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, TrendingUp, BookOpen, Shield } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim, PREFERRED_UNI_IDS } from '@/lib/data-slim'
import { getCanonicalSpec, type CanonicalSpec } from '@/lib/specMapping'
import UniversityCard from '@/components/UniversityCard'

interface Props {
  specSlug: string
  specName: string
}

// Generate spec-specific FAQs dynamically
function getSpecFAQs(specName: string, uniCount: number, feeFloor: string, feeCeiling: string) {
  return [
    { q: `Is online MBA in ${specName} valid for jobs in India?`, a: `Yes. An online MBA in ${specName} from any UGC-DEB approved university is legally equivalent to a campus MBA under UGC 2020 regulations. The degree certificate does not mention "online" mode. Valid for UPSC, banking exams, PSU recruitment, and all private-sector employment. Verify your university's approval status at deb.ugc.ac.in.` },
    { q: `How much does online MBA in ${specName} cost?`, a: `Fees range from ${feeFloor} to ${feeCeiling} across ${uniCount} UGC-approved universities. Most programmes fall between Rs 1,50,000 and Rs 2,50,000. One-time payment discounts of Rs 10,000-20,000 are common. Zero-cost EMI options are available at many universities.` },
    { q: `What jobs can I get after online MBA in ${specName}?`, a: `Career options depend on your prior experience and the industry you target. Entry-level roles include management trainees, analysts, and executives. Mid-career professionals can move into manager, team lead, and senior specialist positions. The MBA credential is most valuable when combined with domain experience and active networking.` },
    { q: `What is the salary after online MBA in ${specName}?`, a: `Freshers can expect Rs 3-6 LPA. Mid-career professionals (2-5 years experience) typically earn Rs 6-12 LPA after the MBA. Senior professionals (5+ years) can reach Rs 10-25 LPA. Salary growth depends on your university brand, work experience, and how actively you pursue new opportunities.` },
    { q: `Which university is best for online MBA in ${specName}?`, a: `The best university depends on your priorities. For brand prestige, consider MAHE (NIRF #3) or Symbiosis (NAAC A++). For international credentials, Amity (WASC+QAA) is strong. For affordability, IGNOU (Rs 66K) or Galgotias (Rs 76K) offer UGC-valid options. Compare all ${uniCount} universities on this page.` },
    { q: `Can I do online MBA in ${specName} while working full-time?`, a: `Yes. All online MBA programmes listed here are designed for working professionals. Live sessions are scheduled on weekends. Recorded lectures are available 24/7. Exams are online and AI-proctored from home. Most students complete the 2-year programme alongside full-time employment.` },
    { q: `When does ${specName} specialisation start in the MBA programme?`, a: `Most universities follow a common structure: Year 1 (Semesters 1-2) covers core MBA subjects like Accounting, Economics, Marketing, and Statistics. Specialisation in ${specName} begins from Semester 3. You choose your specialisation at the end of Year 1 or during admission depending on the university.` },
    { q: `Is online MBA in ${specName} accepted for PhD admission?`, a: `Yes. UGC-DEB approved online MBA degrees are recognized for PhD admissions at any UGC-approved university in India. You will need to clear NET/JRF or the university entrance exam. The specialisation in ${specName} can also support research in that domain area.` },
  ]
}

export default function MBASpecHubClient({ specSlug, specName }: Props) {
  const canonical = getCanonicalSpec(specSlug)

  const mbaUnis = useMemo(() => {
    const canonical = getCanonicalSpec(specSlug)
    const variants = canonical?.variants || [specSlug]
    return UNIS_SLIM
      .filter(u => {
        if (!u.programs.includes('MBA')) return false
        const uniSpecs = (u as any).mbaSpecs as string[] | undefined
        if (!uniSpecs || uniSpecs.length === 0) return false
        return uniSpecs.some(s => {
          const sn = s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
          return variants.some(v => {
            const vn = v.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
            if (sn === vn) return true
            if (sn.startsWith(vn + ' ') || sn.startsWith(vn + 's')) return true
            if (vn.startsWith(sn + ' ') || vn.startsWith(sn + 's')) return true
            return false
          })
        })
      })
      .sort((a, b) => {
        const an = a.nirf > 0 && a.nirf < 200 ? a.nirf : 999
        const bn = b.nirf > 0 && b.nirf < 200 ? b.nirf : 999
        return an - bn
      })
  }, [specSlug])

  const feeFloor = Math.min(...mbaUnis.map(u => u.feeMin).filter(f => f > 0))
  const feeCeiling = Math.max(...mbaUnis.map(u => u.feeMax).filter(f => f > 0))
  const uniCount = mbaUnis.length
  const feeFloorStr = formatFeeSlim(feeFloor)
  const feeCeilingStr = formatFeeSlim(feeCeiling)
  const faqs = getSpecFAQs(specName, uniCount, feeFloorStr, feeCeilingStr)

  return (
    <>
      {/* Spec Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <nav className="text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white no-underline">Home</Link>
            {' > '}
            <Link href="/programs/mba" className="hover:text-white no-underline">Online MBA</Link>
            {' > '}
            <span className="text-amber-400">{specName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
            Best Online MBA in {specName} 2026 -- {uniCount} Universities Compared
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-6">
            UGC-approved programmes from {feeFloorStr} to {feeCeilingStr}. NIRF 2025 verified. Independent comparison.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              {uniCount} Universities
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              {feeFloorStr} - {feeCeilingStr}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
              <BadgeCheck size={14} className="text-amber-400" /> NIRF 2025 Verified
            </span>
          </div>
        </div>
      </section>

      {/* TL;DR Card */}
      {canonical && (
        <section className="max-w-3xl mx-auto px-4 -mt-6 relative z-10 mb-8">
          <div className="rounded-xl bg-slate-800 text-white p-5">
            <div className="space-y-2 text-sm">
              <p>Best for: <strong>{canonical.careerTag}</strong></p>
              <p>Watch out: {canonical.watchOut}</p>
              <p>Fee range: <strong>{feeFloorStr} - {feeCeilingStr}</strong></p>
            </div>
          </div>
        </section>
      )}

      {/* About this Specialisation */}
      {canonical && (
        <section className="max-w-3xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#0B1533' }}>What is Online MBA in {specName}?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{canonical.domainDescription}</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            An online MBA in {specName} from a UGC-DEB approved university is legally equivalent to a campus MBA. The specialisation typically begins from Semester 3 after completing core MBA foundation courses in Year 1 (Accounting for Managers, Managerial Economics, Marketing Management, Statistics, Financial Management, HR Management, and Business Research Methods).
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Currently, {uniCount} UGC-approved universities offer this specialisation with fees ranging from {feeFloorStr} to {feeCeilingStr}. All programmes listed below have been verified against official UGC-DEB and university portals. EdifyEdu earns zero referral commissions from any university.
          </p>
        </section>
      )}

      {/* Career Graph */}
      {canonical && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>
            <TrendingUp size={20} className="inline-block mr-2 text-amber-500" />
            Career Roles After MBA in {specName}
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Entry-Level Roles (0-2 yr)</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.entry.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
              <p className="text-xs text-slate-400 mt-2">Salary: Rs 3-6 LPA</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Mid to Senior Roles (3-8 yr)</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.mid.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
              <p className="text-xs text-slate-400 mt-2">Salary: Rs 8-18 LPA</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-2 text-amber-600">Industries Hiring</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                {canonical.typicalRoles.industries.map((r, i) => <li key={i}>- {r}</li>)}
              </ul>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Salary growth after an online MBA in {specName} depends on your prior experience, target industry, and active career management. Most online MBA graduates advance through internal promotions or self-directed job search rather than university placement cells. LinkedIn networking and domain-specific certifications amplify the MBA credential significantly.
          </p>
        </section>
      )}

      {/* How to Choose Section */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#0B1533' }}>
          <BookOpen size={20} className="inline-block mr-2 text-amber-500" />
          How to Choose the Right University for MBA in {specName}
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0B1533' }}>1. Check NIRF Management Rank</h3>
            <p className="text-sm text-slate-600">NIRF Management category rank (not University rank) is the most relevant metric for MBA programmes. Universities with Management rank under #50 have stronger employer recognition.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0B1533' }}>2. Compare Total Programme Fees</h3>
            <p className="text-sm text-slate-600">Always compare total fees, not per-semester. Check for hidden charges: registration, exam, application, and alumni fees. One-time payment discounts can save Rs 10,000-20,000.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0B1533' }}>3. Verify {specName} Syllabus Depth</h3>
            <p className="text-sm text-slate-600">Compare Semester 3-4 subjects across universities. Some offer 4-5 specialisation subjects while others offer 8-10. Deeper curriculum means more practical skills for your career.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-sm mb-1" style={{ color: '#0B1533' }}>4. Check International Accreditation</h3>
            <p className="text-sm text-slate-600">If you plan to work abroad or need WES credential evaluation, check for WASC, QAA, AACSB, or ACCA accreditation. Not all universities have these. <Link href="/blog/is-online-degree-valid-india-2026" className="text-blue-600 underline">Full validity guide</Link></p>
          </div>
        </div>
      </section>

      {/* Universities Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0B1533' }}>
          {uniCount} Universities Offering Online MBA in {specName}
        </h2>
        <p className="text-sm text-slate-500 mb-6">Sorted by NIRF 2025 rank. Click any university for detailed fees, syllabus, and programme information.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mbaUnis.map(u => (
            <UniversityCard key={u.id} u={u as any} highlightProgram="MBA" specSlug={specSlug} />
          ))}
        </div>
      </section>

      {/* Why EdifyEdu */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-bold text-base mb-2 flex items-center gap-2" style={{ color: '#0B1533' }}>
            <Shield size={18} className="text-amber-500" /> Why Trust This Comparison?
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            EdifyEdu earns zero referral commissions from any university. Every fee, NIRF rank, and accreditation is verified against official UGC-DEB, NAAC, and university portals. We can recommend a Rs 66,000 IGNOU MBA over a Rs 3 lakh programme when it genuinely fits your career goal. Independence is our business model, not a marketing claim.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0B1533' }}>Frequently Asked Questions -- Online MBA in {specName}</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-xl border border-slate-200 bg-white">
              <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0B1533' }}>{faq.q}</summary>
              <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Specialisations */}
      {canonical && canonical.relatedSpecs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-8">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Also Consider</h3>
          <div className="flex flex-wrap gap-2">
            {canonical.relatedSpecs.map(rs => {
              const related = getCanonicalSpec(rs)
              if (!related) return null
              return (
                <Link
                  key={rs}
                  href={`/programs/mba/${rs}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors"
                >
                  {related.canonicalName}
                </Link>
              )
            })}
            <Link
              href="/programs/mba"
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors"
            >
              All Specialisations
            </Link>
          </div>
        </section>
      )}

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Compare Online MBA in {specName} Side by Side</h2>
          <p className="text-slate-300 text-sm mb-4">Fees, NIRF rankings, syllabus, and scholarships in one view.</p>
          <Link href="/compare" className="inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
            Open Comparison Tool
          </Link>
        </div>
      </section>

      {/* Counsellor CTA */}
      <section className="py-10 px-4 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0B1533' }}>Not Sure Which University Fits Your {specName} Career Goal?</h2>
        <p className="text-slate-500 text-sm mb-4 max-w-lg mx-auto">Free 20-minute counselling call. We help match your career goal to the right programme. No pressure, no paid recommendations.</p>
        <Link href="/contact" className="inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors no-underline">
          Book Free Counselling
        </Link>
      </section>
    </>
  )
}
