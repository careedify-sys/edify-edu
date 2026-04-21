// UniSpecBody.tsx — full template for uni×program×spec pages
// When a spec-specific page-content JSON exists, renders the 12-section spec layout.
// Falls back to the generic getSpecContent registry for all other unis/specs.
import React from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle } from 'lucide-react'

import type { University, ProgramDetail } from '@/lib/data'
import { getUniversitiesByProgram } from '@/lib/data'
import { getShortUniversityName } from '@/lib/format'
import { getSpecContent, getSpecFallback } from '@/lib/content'
import { getSyllabus } from '@/lib/syllabus'
import { COUPONS } from '@/lib/coupons'
import type { Program } from '@/lib/data'
import { getSpecPageContent } from '@/lib/data/page-content'
import type { SpecPageContent } from '@/lib/data/page-content-schema'

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

// ── Inline bold renderer: converts **text** → <strong> at render time ─────────

function renderBoldInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function renderParagraphsWithBold(text: string) {
  if (!text) return null
  return text.split(/\n\n+/).map((para, pi) => {
    const lines = para.split('\n')
    const hasBullets = lines.some(l => l.trimStart().startsWith('- '))

    if (!hasBullets) {
      const nodes: React.ReactNode[] = []
      lines.forEach((line, li) => {
        nodes.push(...renderBoldInline(line))
        if (li < lines.length - 1) nodes.push(<br key={`br-${pi}-${li}`} />)
      })
      return <p key={pi} className="mb-2 last:mb-0">{nodes}</p>
    }

    // Para contains bullet lines — use div wrapper so <ul> is valid
    const segments: React.ReactNode[] = []
    const bulletBuffer: string[] = []
    const headerBuffer: React.ReactNode[] = []

    const flushHeader = (idx: number) => {
      if (headerBuffer.length > 0) {
        segments.push(<span key={`hdr-${pi}-${idx}`}>{[...headerBuffer]}</span>)
        headerBuffer.length = 0
      }
    }
    const flushBullets = (idx: number) => {
      if (bulletBuffer.length > 0) {
        segments.push(
          <ul key={`ul-${pi}-${idx}`} className="list-disc pl-5 my-1 space-y-0.5">
            {bulletBuffer.map((item, i) => (
              <li key={i} className="text-sm">{renderBoldInline(item)}</li>
            ))}
          </ul>
        )
        bulletBuffer.length = 0
      }
    }

    lines.forEach((line, li) => {
      if (line.trimStart().startsWith('- ')) {
        flushHeader(li)
        bulletBuffer.push(line.trimStart().slice(2))
      } else {
        flushBullets(li)
        headerBuffer.push(...renderBoldInline(line))
        const nextIsBullet = lines[li + 1]?.trimStart().startsWith('- ')
        if (li < lines.length - 1 && !nextIsBullet) {
          headerBuffer.push(<br key={`br-${pi}-${li}`} />)
        }
      }
    })
    flushHeader(lines.length)
    flushBullets(lines.length)

    return <div key={pi} className="mb-2 last:mb-0">{segments}</div>
  })
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  u: University
  program: Program
  programSlug: string
  spec: string
  specSlug: string
  pd: ProgramDetail
}

// ── Spec JSON section renderers ──────────────────────────────────────────────

function SpecSyllabusSection({
  syllabus,
  spec,
  uniId,
  uniName,
  program,
}: {
  syllabus: NonNullable<SpecPageContent['sections']['syllabus']>
  spec: string
  uniId: string
  uniName: string
  program: Program
}) {
  if (!syllabus.hasData) {
    return (
      <>
        {syllabus.emptyFallback && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
              Syllabus — {spec}
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {syllabus.emptyFallback}
            </div>
            {syllabus.note && (
              <p className="text-xs text-slate-400 mt-3 italic">{syllabus.note}</p>
            )}
          </section>
        )}
        <RequestSyllabusCard uniId={uniId} uniName={uniName} program={program} />
      </>
    )
  }

  const hasSem12 = (syllabus.sem1Subjects?.length ?? 0) > 0 || (syllabus.sem2Subjects?.length ?? 0) > 0
  const semLabel = (sem: number) => `Semester ${sem}`
  const semGroups = [
    { label: semLabel(1), subjects: syllabus.sem1Subjects },
    { label: semLabel(2), subjects: syllabus.sem2Subjects },
    { label: semLabel(3), subjects: syllabus.sem3Subjects },
    { label: semLabel(4), subjects: syllabus.sem4Subjects },
  ].filter(g => g.subjects && g.subjects.length > 0)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>
        {hasSem12 ? `Full Programme Syllabus — ${spec}` : `Semester 3 and 4 — ${spec} Subjects`}
      </h2>

      {semGroups.map((group, gi) => (
        <div key={gi} className="mb-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">{group.label}</h3>
          <div className="space-y-2">
            {group.subjects!.map((s, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 font-semibold text-slate-800 w-5">{i + 1}.</span>
                <div>
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  {s.description && (
                    <span className="text-slate-500"> — {s.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {syllabus.note && (
        <p className="text-xs text-slate-400 mt-4 italic border-t border-slate-100 pt-3">
          {syllabus.note}
        </p>
      )}
    </section>
  )
}

function SpecReviewsSection({
  reviews,
  spec,
}: {
  reviews: NonNullable<SpecPageContent['sections']['reviews']>
  spec: string
}) {
  if (!reviews.items?.length) return null
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-2" style={{ color: '#0B1533' }}>
        Student Reviews — {spec}
      </h2>
      {reviews.intro && (
        <p className="text-sm text-slate-500 mb-4">{reviews.intro}</p>
      )}
      <div className="space-y-4">
        {reviews.items.map((r, i) => (
          <div key={i} className="border border-slate-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-800">{r.name}</span>
              <span className="text-xs text-slate-500">{r.city} · {r.year}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j} style={{ color: j < r.rating ? '#F4A024' : '#CBD5E1', fontSize: 14 }}>★</span>
              ))}
            </div>
            <p className="text-sm text-slate-700">{r.body || r.liked}</p>
            {r.liked && r.body && (
              <p className="text-xs text-green-700 mt-1">Liked: {r.liked}</p>
            )}
            {r.disliked && (
              <p className="text-xs text-red-600 mt-1">Disliked: {r.disliked}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function SpecChooseSection({
  data,
  spec,
}: {
  data: NonNullable<SpecPageContent['sections']['chooseAlternatives']>
  spec: string
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-4" style={{ color: '#0B1533' }}>
        Choose {spec} If... / Consider Alternatives If...
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {data.chooseIf && data.chooseIf.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-green-700 mb-3">Choose This If</h3>
            <ul className="space-y-2">
              {data.chooseIf.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.consider && data.consider.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-red-700 mb-3">Consider Alternatives If</h3>
            <ul className="space-y-2">
              {data.consider.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 mt-0.5 shrink-0 text-base leading-none">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function UniSpecBody({ u, program, programSlug, spec, specSlug, pd }: Props) {
  const cleanName  = getShortUniversityName(u.name)
  const syllabus   = getSyllabus(u.id, program, specSlug)
  const peers      = getUniversitiesByProgram(program).filter(x => x.id !== u.id).slice(0, 3)
  const coupon     = COUPONS.find(c => c.universityId === u.id && (c.program === program || c.program === 'All')) || null
  const specContent = getSpecContent(spec) || getSpecFallback(spec, program)

  // Spec-specific JSON content (Batch 9+) — takes priority over generic specContent
  const specJson = getSpecPageContent(u.id, program.toLowerCase(), specSlug)

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

  // Use spec JSON FAQs for schema when available
  const schemaFaqs = specJson?.sections.faqs?.length
    ? specJson.sections.faqs.map(f => ({ q: f.question, a: f.answer }))
    : faqs

  // Use spec JSON reviews for schema when available
  const schemaReviews = specJson?.sections.reviews?.items?.length
    ? specJson.sections.reviews.items.map(r => ({
        name: r.name,
        city: r.city,
        year: r.year,
        rating: r.rating,
        body: r.body || r.liked || '',
      }))
    : undefined

  // Curriculum deep dive section (generic path only)
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
      <SchemaBlock u={u} pd={pd} program={program} programSlug={programSlug} spec={spec} specSlug={specSlug} coupon={coupon} faqs={schemaFaqs} reviews={schemaReviews} />
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

              {specJson ? (
                // ── Spec JSON path: 12-section focused layout ──────────────
                <>
                  {/* TL;DR */}
                  {specJson.sections.tldr && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wide mr-2">TL;DR</span>
                      <span className="text-sm text-slate-700">{specJson.sections.tldr}</span>
                    </div>
                  )}

                  {/* Approvals */}
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

                  {/* §3 About this specialisation */}
                  {specJson.sections.about?.body && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                        About This Specialisation
                      </h2>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.about.body)}
                      </div>
                    </section>
                  )}

                  {/* §4 Syllabus */}
                  {specJson.sections.syllabus && (
                    <SpecSyllabusSection
                      syllabus={specJson.sections.syllabus}
                      spec={spec}
                      uniId={u.id}
                      uniName={cleanName}
                      program={program}
                    />
                  )}

                  {/* §5 Who Hires */}
                  {specJson.sections.whoHires?.body && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                        Who Hires {spec} MBAs
                      </h2>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.whoHires.body)}
                      </div>
                    </section>
                  )}

                  {/* §6 Skills */}
                  {specJson.sections.skills?.body && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                        Skills You Develop
                      </h2>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.skills.body)}
                      </div>
                    </section>
                  )}

                  {/* §7 Comparisons */}
                  {specJson.sections.comparisons?.body && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                        How {cleanName} Compares for {spec}
                      </h2>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.comparisons.body)}
                      </div>
                    </section>
                  )}

                  {/* §8 Fees */}
                  {specJson.sections.fees?.body && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                      <h2 className="text-lg font-bold mb-3" style={{ color: '#0B1533' }}>
                        Fees and Payment
                      </h2>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.fees.body)}
                      </div>
                    </section>
                  )}

                  {/* §9 Certificate — image first, supporting text below */}
                  <SampleCertificate universityId={u.id} program={program} universityName={cleanName} />
                  {specJson.sections.certificate?.body && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
                      <div className="text-xs text-slate-500 leading-relaxed">
                        {renderParagraphsWithBold(specJson.sections.certificate.body)}
                      </div>
                    </div>
                  )}

                  <InlineCTA
                    text="Not sure if this fits your budget? Our counsellor compares EMI plans across universities for free."
                    linkText="Talk to counsellor"
                    href="/contact"
                    variant="primary"
                  />

                  {/* §10 Reviews */}
                  {specJson.sections.reviews && (
                    <SpecReviewsSection
                      reviews={specJson.sections.reviews}
                      spec={spec}
                    />
                  )}

                  <InlineCTA
                    text={`Compare ${spec} MBA at other universities.`}
                    linkText={`Compare MBA universities`}
                    href={`/programs/mba`}
                    variant="compare"
                  />

                  {/* §11 FAQs */}
                  <FAQBlock faqs={schemaFaqs} />

                  {/* §12 Choose / Alternatives */}
                  {specJson.sections.chooseAlternatives && (
                    <SpecChooseSection
                      data={specJson.sections.chooseAlternatives}
                      spec={spec}
                    />
                  )}

                  <LastUpdatedStamp program={program} universityId={u.id} />

                  <div className="pt-2 flex gap-4 flex-wrap text-sm font-semibold">
                    <Link href={`/universities/${u.id}/${programSlug}`} className="no-underline" style={{ color: '#F4A024' }}>
                      ← All Amity MBA Specialisations
                    </Link>
                    <Link href={`/universities/${u.id}`} className="no-underline text-slate-500 hover:text-slate-700">
                      All Amity Programs
                    </Link>
                  </div>
                </>
              ) : (
                // ── Generic path: existing template (all other unis/specs) ──
                <>
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

                  {syllabus && (['sem1','sem2','sem3','sem4','sem56','coreSpec','research','capstone'] as const).some(k => !!(syllabus as any)[k]) ? (
                    <SectionSyllabus syllabus={syllabus} program={program} universityName={cleanName} />
                  ) : (
                    <RequestSyllabusCard uniId={u.id} uniName={cleanName} program={program} />
                  )}

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
                </>
              )}

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
