// UniProgramBody.tsx — full 21-section template for uni×program pages (MBA, BBA, BCA, MCA)
// Server component; embeds client sub-components where needed.
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import type { University, ProgramDetail } from '@/lib/data'
import { getUniversitiesByProgram, formatSpecList } from '@/lib/data'
import { getShortUniversityName } from '@/lib/format'
import { COUPONS } from '@/lib/coupons'
import type { Program } from '@/lib/data'
import { getPageContent } from '@/lib/data/page-content'
import { getDisplayFee } from '@/lib/fees'
import type { PageContent } from '@/lib/data/page-content-schema'

import SchemaBlock       from './SchemaBlock'
import StickySectionNav  from './StickySectionNav'
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
import RedFlagsBlock     from './RedFlagsBlock'
import ComparisonTable   from './ComparisonTable'
import HonestVerdict     from './HonestVerdict'
import FAQBlock          from './FAQBlock'
import LastUpdatedStamp  from './LastUpdatedStamp'
import StickyLeadCard    from './StickyLeadCard'
import CouponCard        from './CouponCard'
import QuickFactsCard    from './QuickFactsCard'
import AssuredMarquee   from './AssuredMarquee'
import RequestSyllabusCard from './RequestSyllabusCard'
import { hasSyllabusData } from '@/lib/syllabus'
import { getProgramLinks } from '@/lib/internal-links'
import ProgramBlogLinks from './ProgramBlogLinks'
import SiblingProgrammes from './SiblingProgrammes'
import { getSiblingProgrammes, getUniversityOverviewLink } from '@/lib/seo/safe-internal-links'

interface Props {
  u: University
  program: Program
  programSlug: string
  pd: ProgramDetail
  customH1?: string
  customIntro?: string
}

// ── Inline generated-content components ─────────────────────────────────────

function GeneratedRedFlagsBlock({ redFlags }: { redFlags: NonNullable<PageContent['sections']['redFlags']> }) {
  return (
    <section className="rounded-xl border border-red-100 bg-white p-6">
      <h2 className="text-lg font-bold mb-2 text-red-700">
        {redFlags.heading || 'Red Flags to Know Before You Enrol'}
      </h2>
      {redFlags.intro && <p className="text-sm text-slate-500 mb-4">{redFlags.intro}</p>}
      <div className="space-y-3">
        {redFlags.flags?.map((f, i) => (
          <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
            <span className="text-xs font-black text-red-500 uppercase tracking-wide">Red Flag {i + 1}</span>
            <p className="text-sm text-slate-700 mt-1">{f.sentence1} {f.sentence2}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function UniProgramBody({ u, program, programSlug, pd, customH1, customIntro }: Props) {
  const cleanName  = getShortUniversityName(u.name)

  // GSC striking-distance fee pages (July 2026): fee table renders right after
  // the About section for these MBA pages, matching "fees"-intent queries.
  // Value is an optional H2 override for the fee block.
  const FEE_PROMINENT_MBA_UNIS: Record<string, string | undefined> = {
    'galgotias-university-online': undefined,
    'shoolini-university-online': undefined,
    'symbiosis-university-online': 'Symbiosis Online MBA Fees 2026 (SSODL)',
  }
  const feeProminent = program === 'MBA' && u.id in FEE_PROMINENT_MBA_UNIS
  const specs      = pd.specs || []
  const peers      = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 3)
  const coupon     = COUPONS.find(c => c.universityId === u.id && (c.program === program || c.program === 'All')) || null

  const content = getPageContent(u.id, program.toLowerCase())
  const s = content?.sections
  const programBlogLinks = getProgramLinks(u.id, program.toLowerCase())

  // Internal-link mesh (2026-08-23). Both helpers gate on valid-urls.json, so
  // they only ever return hubs that resolve AND are indexable. See
  // lib/seo/safe-internal-links.ts for why u.programs is not used directly.
  const siblingProgrammes = getSiblingProgrammes(u, program)
  const overviewHref      = getUniversityOverviewLink(u)

  // Sprint 1 Task 2 (revised): fact-scrubbed FAQ set. Every factual claim below
  // is BACKED by a lib/data.ts field (feeMin/feeMax, emiFrom, naac, nirf, ugc,
  // psuEligible, examMode, eligibility, pd.duration, specs). University-specific
  // free-text claims that were previously present (class schedule, attendance
  // policy, placement mechanics, lender names, "identical to on-campus") have
  // been removed. Fee question is now FIRST and pulls live from feeMin/feeMax
  // so the FAQ never lags a data.ts fee update.
  //
  // NIRF sentinel guard: skip the NIRF line entirely when u.nirf is 999 or
  // otherwise out of the ranked band.
  const feeStr = u.feeMax && u.feeMax !== u.feeMin
    ? `₹${u.feeMin.toLocaleString('en-IN')} to ₹${u.feeMax.toLocaleString('en-IN')}`
    : `₹${u.feeMin.toLocaleString('en-IN')}`
  const nirfSuffix = u.nirf > 0 && u.nirf < 500 ? ` and a NIRF rank of #${u.nirf}` : ''

  const faqs: { q: string; a: string }[] = [
    { q: `What is the total fee for ${program} at ${cleanName}?`,
      a: `Total programme fee is ${feeStr} across ${pd.duration || '2 years'}. EMI starts from ₹${u.emiFrom.toLocaleString()}/month.` },
    { q: `Is the ${program} degree from ${cleanName} valid?`,
      a: `Yes. ${cleanName} is UGC-DEB approved. UGC-DEB approved online degrees are recognised as equivalent to on-campus degrees for higher education and government recruitment.` },
    ...(specs.length ? [{ q: `What specialisations does ${cleanName} offer in ${program}?`,
      a: `${specs.length} specialisations: ${formatSpecList(specs)}.` }] : []),
    { q: `Is ${cleanName} NAAC accredited?`,
      a: `Yes. ${cleanName} holds NAAC ${u.naac} accreditation${nirfSuffix}.` },
    { q: `What is the eligibility for ${program} at ${cleanName}?`,
      a: u.eligibility || `Any Bachelor's degree with minimum 50% aggregate marks. Final year students may apply.` },
    { q: `What exam mode does ${cleanName} use?`,
      a: `${u.examMode} examinations.` },
    { q: `How long does the ${program} program take at ${cleanName}?`,
      a: `${pd.duration || '2 years'}.` },
    { q: `Can I study ${program} at ${cleanName} while working full-time?`,
      a: `Our counsellor can confirm the current class schedule and attendance policy for this programme.` },
    { q: `What placement support does ${cleanName} provide?`,
      a: `Our counsellor can confirm the current placement support offered by ${cleanName} for this programme.` },
    { q: `What is the EMI for ${cleanName} ${program}?`,
      a: `EMI starts from ₹${u.emiFrom.toLocaleString()}/month. Our counsellor can confirm the current EMI tenure options and lender panel.` },
  ]

  // Use content JSON FAQs for schema when available — keeps visible content and structured data in sync
  const schemaFaqs = s?.faqs?.length
    ? s.faqs.map(f => ({ q: f.question, a: f.answer }))
    : faqs

  return (
    <>
      <SchemaBlock u={u} pd={pd} program={program} programSlug={programSlug} coupon={coupon} faqs={schemaFaqs} />
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
        <UniHero u={u} program={program} pd={pd} cleanName={cleanName} customH1={customH1} />

        {/* Sticky section navigation */}
        <StickySectionNav items={[
          { id: 'about', label: 'About' },
          { id: 'specialisations', label: 'Specialisations' },
          { id: 'fees', label: 'Fees' },
          { id: 'admission', label: 'Admission' },
          { id: 'placement', label: 'Placement' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'faqs', label: 'FAQs' },
        ]} />

        {/* TL;DR block (generated content only) */}
        {s?.tldr && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wide mr-2">TL;DR</span>
              <span className="text-sm text-slate-700">{s.tldr}</span>
            </div>
          </div>
        )}

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

              {/* §3B UGC-DEB (generated content only) */}
              {s?.ugcDeb?.body && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                    {s.ugcDeb.heading || `${cleanName} Online ${program}: UGC-DEB Approval Status`}
                  </h2>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{s.ugcDeb.body}</div>
                </section>
              )}

              {/* §4 About */}
              <div id="about">
                <SectionAbout u={u} program={program} pd={pd} cleanName={cleanName} customIntro={customIntro} />
              </div>

              {/* §4B Fees first for fee-intent search pages */}
              {feeProminent && (
                <div id="fees">
                  <FeeBreakdown u={u} pd={pd} program={program} cleanName={cleanName} headingOverride={FEE_PROMINENT_MBA_UNIS[u.id]} />
                </div>
              )}

              {/* §5 Who Can Apply */}
              <SectionWhoCanApply u={u} program={program} cleanName={cleanName} />

              {/* §6 Class Schedule */}
              <SectionClasses u={u} program={program} cleanName={cleanName} />

              {/* §7 Exams */}
              <SectionExams u={u} program={program} cleanName={cleanName} />

              {/* §8 Specializations */}
              {specs.length > 0 && (
                <div id="specialisations">
                <SpecializationGrid
                  specs={specs}
                  universityId={u.id}
                  programSlug={programSlug}
                  program={program}
                  fees={getDisplayFee(u, program).ok ? (getDisplayFee(u, program).compact || pd.fees) : 'On request'}
                  duration={pd.duration}
                  cleanName={cleanName}
                />
                </div>
              )}

              {/* §9 Core Subjects */}
              <SectionCoreSubjects program={program} cleanName={cleanName} />

              {/* §9b Syllabus request — only when no manifest data is available */}
              {!hasSyllabusData(u.id, program) ? (
                <RequestSyllabusCard uniId={u.id} uniName={cleanName} program={program} />
              ) : null}

              {/* §10 Fees (skipped when already shown above) */}
              {!feeProminent && (
                <div id="fees">
                  <FeeBreakdown u={u} pd={pd} program={program} cleanName={cleanName} />
                </div>
              )}

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
              <div id="admission">
                <AdmissionSteps />
              </div>

              {/* §13B ABC ID (generated content only) */}
              {s?.abcId?.body && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                    {s.abcId.heading || 'Academic Bank of Credits (ABC ID)'}
                  </h2>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{s.abcId.body}</div>
                </section>
              )}

              {/* §14 Placements */}
              <div id="placement">
                <SectionPlacements pd={pd} cleanName={cleanName} program={program} />
              </div>

              {/* §14b Beyond Admission */}
              <BeyondAdmissionSection cleanName={cleanName} />

              {/* §15 Top Hirers */}
              <TopHirers pd={pd} program={program} cleanName={cleanName} />

              {/* §16 Reviews. CTA only until first-party rows exist. */}
              <div id="reviews">
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-bold mb-2" style={{ color: '#0B1533' }}>Studied here?</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Share your experience and help the next student decide.
                  </p>
                  <Link
                    href={`/review/${u.id}`}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline"
                    style={{ background: '#0B1533' }}
                  >
                    Write a review
                  </Link>
                </section>
              </div>

              {/* §17 Red Flags */}
              {s?.redFlags?.flags?.length ? (
                <GeneratedRedFlagsBlock redFlags={s.redFlags} />
              ) : (
                <RedFlagsBlock u={u} program={program} cleanName={cleanName} />
              )}

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
              <div id="faqs">
                <FAQBlock faqs={s?.faqs?.length ? s.faqs.map(f => ({ q: f.question, a: f.answer })) : faqs} title={`${cleanName} Online ${program} FAQs`} />
              </div>

              {/* §21 Last Updated */}
              <LastUpdatedStamp program={program} universityId={u.id} />

              {/* Blog review links — pulls editorial authority into programme page */}
              {programBlogLinks && (
                <ProgramBlogLinks links={programBlogLinks} program={program.toLowerCase()} />
              )}

              {/* Sibling programme hubs. Closes the orphan-hub gap found in the
                  2026-08-23 GSC read: 229/242 hubs had zero inbound links. */}
              <SiblingProgrammes
                links={siblingProgrammes}
                cleanName={cleanName}
                overviewHref={overviewHref}
              />

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

    </>
  )
}
