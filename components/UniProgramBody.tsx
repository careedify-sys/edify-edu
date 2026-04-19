// UniProgramBody.tsx — full 21-section template for uni×program pages (MBA, BBA, BCA, MCA)
// Server component; embeds client sub-components where needed.
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { University, ProgramDetail } from '@/lib/data'
import { getUniversitiesByProgram } from '@/lib/data'
import { getShortUniversityName } from '@/lib/format'
import { UNIVERSITY_REVIEWS } from '@/lib/reviews-data'
import { COUPONS } from '@/lib/coupons'
import type { Program } from '@/lib/data'

import SchemaBlock       from './SchemaBlock'
import UniHero           from './UniHero'
import ApprovalBadges    from './ApprovalBadges'
import SectionAbout      from './SectionAbout'
import SectionWhoCanApply from './SectionWhoCanApply'
import SectionClasses    from './SectionClasses'
import SectionExams      from './SectionExams'
import SpecializationGrid from './SpecializationGrid'
import SectionCoreSubjects from './SectionCoreSubjects'
import FeeBreakdown      from './FeeBreakdown'
import EMIPlans          from './EMIPlans'
import InlineCTA         from './InlineCTA'
import SampleCertificate from './SampleCertificate'
import AdmissionSteps    from './AdmissionSteps'
import SectionPlacements from './SectionPlacements'
import BeyondAdmissionSection from './BeyondAdmissionSection'
import TopHirers         from './TopHirers'
import ReviewsBlock      from './ReviewsBlock'
import RedFlagsBlock     from './RedFlagsBlock'
import ComparisonTable   from './ComparisonTable'
import HonestVerdict     from './HonestVerdict'
import FAQBlock          from './FAQBlock'
import LastUpdatedStamp  from './LastUpdatedStamp'
import StickyLeadCard    from './StickyLeadCard'
import CouponCard        from './CouponCard'
import QuickFactsCard    from './QuickFactsCard'
import WhatsAppFloat     from './WhatsAppFloat'
import AssuredMarquee   from './AssuredMarquee'
import RequestSyllabusCard from './RequestSyllabusCard'

interface Props {
  u: University
  program: Program
  programSlug: string
  pd: ProgramDetail
}

export default function UniProgramBody({ u, program, programSlug, pd }: Props) {
  const cleanName  = getShortUniversityName(u.name)
  const specs      = pd.specs || []
  const peers      = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 3)
  const coupon     = COUPONS.find(c => c.universityId === u.id && (c.program === program || c.program === 'All')) || null

  const faqs: { q: string; a: string }[] = [
    { q: `Is the ${program} degree from ${cleanName} valid for jobs?`, a: `Yes. ${cleanName} is UGC DEB approved. The degree is identical to an on-campus ${program} and valid for private sector jobs, government portals where UGC DEB degrees are accepted${u.psuEligible ? ', and PSU recruitment' : ''}.` },
    { q: `What is the total fee for ${program} at ${cleanName}?`, a: `Total fee is ${pd.fees || `₹${Math.round(u.feeMin / 1000)}K+`}. EMI starts from ₹${u.emiFrom.toLocaleString()}/month. Semester-wise payment available.` },
    ...(specs.length ? [{ q: `What specialisations does ${cleanName} offer in ${program}?`, a: `${specs.length} specialisations: ${specs.join(', ')}.` }] : []),
    { q: `Can I study while working full-time?`, a: `Yes. Live sessions are on weekends with recorded lectures available 24/7. ${u.examMode} assessments. No mandatory daily attendance.` },
    { q: `What placement support does ${cleanName} provide?`, a: `Placement assistance including career workshops, resume building, mock interviews, and a job portal. Alumni network access is provided.` },
    { q: `Is ${cleanName} NAAC accredited?`, a: `Yes. ${cleanName} holds NAAC ${u.naac} accreditation${u.nirf > 0 && u.nirf < 500 ? ` and a NIRF rank of #${u.nirf}` : ''}.` },
    { q: `What is the eligibility for ${program} at ${cleanName}?`, a: u.eligibility || `Any Bachelor's degree with minimum 50% aggregate marks. Final year students may apply.` },
    { q: `What exam mode does ${cleanName} use?`, a: `${u.examMode} examinations. No mandatory campus visits required for most semesters.` },
    { q: `How long does the ${program} program take at ${cleanName}?`, a: `${pd.duration || '2 years'}. Classes are online with flexible scheduling.` },
    { q: `What is the EMI for ${cleanName} ${program}?`, a: `EMI starts from ₹${u.emiFrom.toLocaleString()}/month. Multiple tenure options (6, 12, 24 months) available via EdifyEdu-partnered NBFCs: Fibe, GrayQuest, Techfino, and Avanse.` },
  ]

  return (
    <>
      <SchemaBlock u={u} pd={pd} program={program} programSlug={programSlug} coupon={coupon} faqs={faqs} />
      <AssuredMarquee />

      <div className="page-shell">
        {/* Top colour bar */}
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
              <span className="font-semibold" style={{ color: '#F4A024' }}>Online {program}</span>
            </div>
          </div>
        </nav>

        {/* Hero — full width */}
        <UniHero u={u} program={program} pd={pd} cleanName={cleanName} />

        {/* 2-column body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── MAIN COLUMN ── */}
            <main className="flex-1 min-w-0 space-y-6">

              {/* §3 Approvals */}
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

              {/* §4 About */}
              <SectionAbout u={u} program={program} pd={pd} cleanName={cleanName} />

              {/* §5 Who Can Apply */}
              <SectionWhoCanApply u={u} program={program} />

              {/* §6 Class Schedule */}
              <SectionClasses u={u} program={program} />

              {/* §7 Exams */}
              <SectionExams u={u} program={program} />

              {/* §8 Specializations */}
              {specs.length > 0 && (
                <SpecializationGrid
                  specs={specs}
                  universityId={u.id}
                  programSlug={programSlug}
                  program={program}
                  fees={pd.fees}
                  duration={pd.duration}
                />
              )}

              {/* §9 Core Subjects */}
              <SectionCoreSubjects program={program} cleanName={cleanName} />

              {/* §9b Syllabus request — only when no syllabus data is available */}
              {!pd.syllabus || !['sem1','sem2','sem3','sem4','sem56','coreSpec','research','capstone'].some(k => !!(pd.syllabus as any)?.[k]) ? (
                <RequestSyllabusCard uniId={u.id} uniName={cleanName} program={program} />
              ) : null}

              {/* §10 Fees */}
              <FeeBreakdown u={u} pd={pd} program={program} />

              {/* Inline CTA after fees */}
              <InlineCTA
                text="Not sure if this fits your budget? Our counsellor compares EMI plans across universities for free."
                linkText="Talk to counsellor"
                href="/contact"
                variant="primary"
              />

              {/* §11 EMI */}
              <EMIPlans u={u} pd={pd} />

              {/* §12 Certificate */}
              <SampleCertificate
                universityId={u.id}
                program={program}
                universityName={cleanName}
              />

              {/* §13 Admission */}
              <AdmissionSteps />

              {/* §14 Placements */}
              <SectionPlacements pd={pd} cleanName={cleanName} program={program} />

              {/* §14b Beyond Admission */}
              <BeyondAdmissionSection cleanName={cleanName} />

              {/* §15 Top Hirers */}
              <TopHirers pd={pd} program={program} cleanName={cleanName} />

              {/* §16 Reviews */}
              <ReviewsBlock universityId={u.id} program={program} />

              {/* §17 Red Flags */}
              <RedFlagsBlock u={u} program={program} cleanName={cleanName} />

              {/* Inline CTA after Red Flags */}
              <InlineCTA
                text={`Not the right fit? Compare 15+ other Online ${program} universities.`}
                linkText={`Compare ${program} universities`}
                href={`/programs/${programSlug}`}
                variant="compare"
              />

              {/* §18 Comparison */}
              {peers.length > 0 && (
                <ComparisonTable
                  current={u}
                  peers={peers}
                  program={program}
                  programSlug={programSlug}
                />
              )}

              {/* §19 Honest Verdict */}
              <HonestVerdict u={u} program={program} cleanName={cleanName} />

              {/* CTA before FAQ */}
              <InlineCTA
                text="Still have questions? Ask our counsellor — free call, no commission."
                linkText="Ask a counsellor"
                href="/contact"
                variant="primary"
              />

              {/* §20 FAQs */}
              <FAQBlock faqs={faqs} />

              {/* §21 Last Updated */}
              <LastUpdatedStamp program={program} universityId={u.id} />

              {/* Back link */}
              <div className="pt-2">
                <Link href={`/universities/${u.id}`} className="text-sm font-semibold no-underline" style={{ color: '#F4A024' }}>
                  ← All {cleanName} Programs
                </Link>
              </div>
            </main>

            {/* ── STICKY SIDEBAR ── */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="sticky top-4 space-y-4">
                <StickyLeadCard
                  universityName={u.name}
                  universityId={u.id}
                  defaultProgram={program}
                />
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
