// UniSpecBody.tsx — full 21-section template for uni×program×spec pages
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { University, ProgramDetail } from '@/lib/data'
import { getUniversitiesByProgram } from '@/lib/data'
import { getShortUniversityName } from '@/lib/format'
import { getMasterSyllabus, getUniversitySyllabus, getSpecContent, getSpecFallback } from '@/lib/content'
import { COUPONS } from '@/lib/coupons'
import type { Program } from '@/lib/data'

import SchemaBlock        from './SchemaBlock'
import UniHero            from './UniHero'
import ApprovalBadges     from './ApprovalBadges'
import SectionAbout       from './SectionAbout'
import SectionWhoCanApply from './SectionWhoCanApply'
import SectionClasses     from './SectionClasses'
import SectionExams       from './SectionExams'
import SectionSyllabus    from './SectionSyllabus'
import FeeBreakdown       from './FeeBreakdown'
import EMIPlans           from './EMIPlans'
import InlineCTA          from './InlineCTA'
import SampleCertificate  from './SampleCertificate'
import AdmissionSteps     from './AdmissionSteps'
import SectionPlacements  from './SectionPlacements'
import BeyondAdmissionSection from './BeyondAdmissionSection'
import TopHirers          from './TopHirers'
import ReviewsBlock       from './ReviewsBlock'
import RedFlagsBlock      from './RedFlagsBlock'
import ComparisonTable    from './ComparisonTable'
import HonestVerdict      from './HonestVerdict'
import FAQBlock           from './FAQBlock'
import LastUpdatedStamp   from './LastUpdatedStamp'
import StickyLeadCard     from './StickyLeadCard'
import CouponCard         from './CouponCard'
import QuickFactsCard     from './QuickFactsCard'
import WhatsAppFloat      from './WhatsAppFloat'
import AssuredMarquee    from './AssuredMarquee'
import RequestSyllabusCard from './RequestSyllabusCard'
import { CheckCircle } from 'lucide-react'

interface Props {
  u: University
  program: Program
  programSlug: string
  spec: string
  specSlug: string
  pd: ProgramDetail
}

export default function UniSpecBody({ u, program, programSlug, spec, specSlug, pd }: Props) {
  const cleanName  = getShortUniversityName(u.name)
  const syllabus   = getMasterSyllabus(u.id, program) || getUniversitySyllabus(u.id, program)
  const peers      = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 3)
  const coupon     = COUPONS.find(c => c.universityId === u.id && (c.program === program || c.program === 'All')) || null
  const specContent = getSpecContent(spec) || getSpecFallback(spec, program)

  const faqs: { q: string; a: string }[] = [
    { q: `Is ${cleanName} Online ${program} in ${spec} valid for jobs?`, a: `Yes. ${cleanName} is UGC DEB approved and NAAC ${u.naac} accredited. The degree is identical to an on-campus degree.` },
    { q: `What is the fee for ${program} ${spec} at ${cleanName}?`, a: `Total fee is ${pd.fees || `₹${Math.round(u.feeMin / 1000)}K+`}. EMI from ₹${u.emiFrom.toLocaleString()}/month.` },
    { q: `Can I work while doing ${program} in ${spec} from ${cleanName}?`, a: `Yes. Live sessions on weekends, recordings available 24/7. ${u.examMode} assessments. No campus visits required.` },
    { q: `What career opportunities does ${spec} specialisation offer?`, a: specContent?.careerBeginner?.length ? `${specContent.careerBeginner[0]?.title} and other roles. ${specContent.salaryRange || ''}` : `Graduates typically enter ${spec}-related roles with salary ranges of ${pd.avgSalary || '₹4L–₹12L'} depending on experience.` },
    { q: `What syllabus is covered in ${spec} specialisation?`, a: specContent?.skills?.length ? `Key areas include: ${specContent.skills.slice(0, 5).join(', ')}.` : `The specialisation covers core ${spec} subjects along with project work and industry case studies.` },
    { q: `Is ${cleanName} NAAC accredited?`, a: `Yes. ${cleanName} is NAAC ${u.naac} accredited${u.nirf > 0 && u.nirf < 500 ? ` with a NIRF rank of #${u.nirf}` : ''}.` },
    { q: `What is the exam mode for ${cleanName} ${program}?`, a: `${u.examMode} assessments.` },
    { q: `How long is the ${program} ${spec} program at ${cleanName}?`, a: `${pd.duration || '2 years'}.` },
  ]

  // Curriculum deep dive section (replaces SpecializationGrid for spec pages)
  const CurriculumDive = () => {
    if (!specContent) return null
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>Curriculum Deep Dive — {spec}</h2>
        {specContent.overview && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{specContent.overview}</p>
        )}
        {specContent.skills?.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Skills You&apos;ll Build</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {specContent.skills.slice(0, 10).map(s => (
                <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
        {specContent.whyChoose?.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Why {spec}?</h3>
            <ul className="space-y-1.5 mb-4">
              {specContent.whyChoose.slice(0, 4).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </>
        )}
        {specContent.careerBeginner?.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Career Path</h3>
            <div className="grid sm:grid-cols-3 gap-2">
              {[
                { label: '0–3 Yrs', items: specContent.careerBeginner?.slice(0, 2) },
                { label: '3–7 Yrs', items: specContent.careerMid?.slice(0, 2) },
                { label: '7+ Yrs',  items: specContent.careerSenior?.slice(0, 2) },
              ].map(col => col.items?.length ? (
                <div key={col.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-2">{col.label}</div>
                  {col.items.map(c => (
                    <div key={c.title} className="text-xs text-slate-700 font-semibold mb-0.5">{c.title}</div>
                  ))}
                </div>
              ) : null)}
            </div>
          </>
        )}
        {specContent.salaryRange && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm">
            <span className="font-bold text-green-800">Salary: </span>
            <span className="text-green-700">{specContent.salaryRange}</span>
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <SchemaBlock u={u} pd={pd} program={program} programSlug={programSlug} spec={spec} specSlug={specSlug} coupon={coupon} faqs={faqs} />
      <AssuredMarquee />

      <div className="page-shell">
        <div style={{ height: 3, background: u.color }} />

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
              <Link href="/" className="hover:text-amber-600 no-underline">Home</Link>
              <ChevronRight size={11} />
              <Link href="/universities" className="hover:text-amber-600 no-underline">Universities</Link>
              <ChevronRight size={11} />
              <Link href={`/universities/${u.id}`} className="hover:text-amber-600 no-underline">{cleanName}</Link>
              <ChevronRight size={11} />
              <Link href={`/universities/${u.id}/${programSlug}`} className="hover:text-amber-600 no-underline">Online {program}</Link>
              <ChevronRight size={11} />
              <span className="font-semibold" style={{ color: '#F4A024' }}>{spec}</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <UniHero u={u} program={program} pd={pd} cleanName={cleanName} spec={spec} />

        {/* 2-column body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── MAIN COLUMN ── */}
            <main className="flex-1 min-w-0 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <ApprovalBadges
                  approvals={u.approvals}
                  naac={u.naac}
                  nirf={u.nirf}
                  nirfMgt={u.nirfMgt}
                  nirfEng={u.nirfEng}
                  highlight={u.highlight}
                  layout="row"
                />
              </div>
              <SectionAbout u={u} program={program} pd={pd} cleanName={cleanName} spec={spec} />
              <SectionWhoCanApply u={u} program={program} />
              <SectionClasses u={u} program={program} />
              <SectionExams u={u} program={program} />

              {/* §8 — Curriculum Deep Dive (replaces SpecializationGrid) */}
              <CurriculumDive />

              <SectionSyllabus syllabus={syllabus} program={program} universityName={cleanName} />

              {/* Syllabus request card — only when no syllabus data is available */}
              {!syllabus || !['sem1','sem2','sem3','sem4','sem56','coreSpec','research','capstone'].some(k => !!(syllabus as any)[k]) ? (
                <RequestSyllabusCard uniId={u.id} uniName={cleanName} program={program} />
              ) : null}

              <FeeBreakdown u={u} pd={pd} program={program} />

              <InlineCTA
                text="Not sure if this fits your budget? Our counsellor compares EMI plans across universities for free."
                linkText="Talk to counsellor"
                href="/contact"
                variant="primary"
              />

              <EMIPlans u={u} pd={pd} />
              <SampleCertificate universityId={u.id} program={program} universityName={cleanName} />
              <AdmissionSteps />
              <SectionPlacements pd={pd} cleanName={cleanName} program={program} />
              <BeyondAdmissionSection cleanName={cleanName} />
              <TopHirers pd={pd} program={program} cleanName={cleanName} />
              <ReviewsBlock universityId={u.id} program={program} />
              <RedFlagsBlock u={u} program={program} cleanName={cleanName} />

              <InlineCTA
                text={`Not the right fit? Compare 15+ other Online ${program} universities.`}
                linkText={`Compare ${program} universities`}
                href={`/programs/${programSlug}`}
                variant="compare"
              />

              {peers.length > 0 && (
                <ComparisonTable current={u} peers={peers} program={program} programSlug={programSlug} />
              )}

              <HonestVerdict u={u} program={program} cleanName={cleanName} />

              <InlineCTA
                text="Still have questions? Ask our counsellor — free call, no commission."
                linkText="Ask a counsellor"
                href="/contact"
                variant="primary"
              />

              <FAQBlock faqs={faqs} />
              <LastUpdatedStamp program={program} universityId={u.id} />

              <div className="pt-2 flex gap-4 flex-wrap text-sm font-semibold">
                <Link href={`/universities/${u.id}/${programSlug}`} className="no-underline" style={{ color: '#F4A024' }}>
                  ← All {cleanName} {program} Specialisations
                </Link>
                <Link href={`/universities/${u.id}`} className="no-underline text-slate-500 hover:text-slate-700">
                  All {cleanName} Programs
                </Link>
              </div>
            </main>

            {/* ── STICKY SIDEBAR ── */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="sticky top-4 space-y-4">
                <StickyLeadCard universityName={u.name} universityId={u.id} defaultProgram={program} />
                <CouponCard coupon={coupon} universityId={u.id} program={program} universityName={cleanName} />
                <QuickFactsCard u={u} pd={pd} program={program} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <WhatsAppFloat />
    </>
  )
}
