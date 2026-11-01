// /online-dba: pillar for "doctor of business administration" and the DBA
// head terms. "DBA full form" is an H2 and an FAQ here, not its own page: the
// site's full-form blog cluster earns impressions at about 0.1% CTR with no
// lead value (GSC, Aug 2026).
//
// Every fact on this page comes from data/dba-programmes.ts or the verdict
// text. The two PhD duration figures come from the UGC PhD Regulations, 2022,
// as already published in /blog/online-phd-in-india.

import Link from 'next/link'
import {
  getPublicDbaProgrammes,
  formatInr,
  dbaDisplayName,
  immersionCost,
  refundsBeforeStart,
  DBA_COUNSELLOR_FEE_LINE,
} from '@/data/dba-programmes'
import DbaValidityVerdict from '@/components/dba/DbaValidityVerdict'
import DbaEnquiryForm from '@/components/dba/DbaEnquiryForm'
import DbaFinder from '@/components/dba/DbaFinder'
import { DbaBreadcrumbs, DbaFaq, DbaPage, DbaSectionLinks, H2, H3, P, TableWrap, Th, Td, type Faq } from '@/components/dba/DbaShared'
import { DbaComparisonTable, confirmedFeeRange, dbaMetadata, toFinderItem } from '@/components/dba/DbaTables'

export const metadata = dbaMetadata({
  title: 'Doctor of Business Administration (DBA) in India: Validity and Fees',
  description:
    'Not automatically valid in India. Doctor of Business Administration explained: full form, fees, eligibility and refund terms of 6 online DBAs, and DBA vs PhD.',
  path: '/online-dba',
  titleMax: 65,
})

export default function OnlineDbaPillar() {
  const programmes = getPublicDbaProgrammes()
  const range = confirmedFeeRange(programmes)
  const unconfirmed = programmes.filter(p => !p.feeConfirmed).map(p => p.provider)
  const masterRoute = programmes.filter(p => /master's/i.test(p.eligibilityText)).map(p => p.provider)
  const bachelorOnly = programmes.filter(p => !/master's/i.test(p.eligibilityText))
  const noRefundBeforeStart = programmes.filter(p => !refundsBeforeStart(p)).map(p => p.provider)
  const immersionSplits = programmes
    .map(p => ({ p, cost: immersionCost(p) }))
    .filter((x): x is { p: typeof x.p; cost: number } => x.cost != null)
  const ggu = programmes.find(p => p.slug === 'golden-gate-university-dba')!
  const ssbm = programmes.find(p => p.slug === 'ssbm-executive-dba')!
  const credits = programmes.filter(p => p.totalCreditsText)

  const immersionSentence = immersionSplits
    .map(x => `${formatInr(x.cost)} (${x.p.provider})`)
    .join(' and ')

  const faqs: Faq[] = [
    {
      q: 'What is the full form of DBA?',
      a: 'DBA stands for Doctor of Business Administration, also written Doctorate in Business Administration. It is a professional doctorate in management. The same letters also stand for Diploma in Business Administration, a 1-year course after 10+2, and, outside education, for database administrator.',
    },
    {
      q: 'Is an online DBA valid in India?',
      a: 'Not automatically. It is usable in India only if UGC grants an equivalence certificate under the UGC (Recognition and Grant of Equivalence to Qualifications Obtained from Foreign Educational Institutions) Regulations, 2025, notified 4 April 2025. Programmes from unrecognised institutions, unaccredited programmes, or franchise arrangements are not eligible. On 28 October 2022, UGC and AICTE publicly warned that online doctoral programmes offered by edtech companies with foreign institutions are not recognised.',
    },
    {
      q: 'What is the difference between a DBA and a PhD?',
      a: 'A DBA is not a PhD, and it cannot be used anywhere a UGC-recognised PhD is required. A PhD in India runs at least three years including coursework and at most six years under the UGC PhD Regulations, 2022. All six online DBAs we list run for 3 years.',
    },
    {
      q: 'Can I become a professor with a DBA?',
      a: 'Not on the strength of a DBA alone in India. A DBA cannot be used anywhere a UGC-recognised PhD is required, so a faculty post that asks for a PhD will not accept it in its place. If teaching at an Indian university is the goal, a PhD is the route.',
    },
    {
      q: 'What are DBA course fees in India?',
      a: `Across the online DBAs with confirmed fees, total fees run from ${formatInr(range.min)} (${range.minBy}) to ${formatInr(range.max)} (${range.maxBy}). We have not confirmed fees for ${unconfirmed.join(' and ')}. Fees are indicative and change by batch. ${DBA_COUNSELLOR_FEE_LINE}.`,
    },
    {
      q: 'What is the eligibility for a DBA?',
      a: `It depends on the programme. ${ggu.provider} asks for: ${ggu.eligibilityText}. ${ssbm.provider} asks for: ${ssbm.eligibilityText}. The full criteria for all six are in the finder on this page.`,
    },
    {
      q: 'How long is a DBA course?',
      a: 'All six online DBAs we list run for 3 years.',
    },
    {
      q: 'What is campus immersion in a DBA?',
      a: `A campus immersion is an on-campus component offered alongside the online programme. All six programmes we list offer one. Where a provider prices it separately, it adds ${immersionSentence} to the fee.`,
    },
  ]

  return (
    <DbaPage>
      <DbaBreadcrumbs crumbs={[{ name: 'Online DBA', path: '/online-dba' }]} />

      <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4" style={{ color: '#0f172a' }}>
        Doctor of Business Administration (DBA): Validity, Fees and Programmes
      </h1>
      <P>
        A Doctor of Business Administration, also called a Doctorate in Business Administration, is a
        professional doctorate in management for working professionals. This page sets out whether it
        counts in India, then compares the six online DBAs we track on fees, eligibility, credits,
        refund and deferral terms.
      </P>

      <DbaValidityVerdict />

      <H2 id="dba-full-form">DBA full form</H2>
      <P>
        DBA stands for Doctor of Business Administration, sometimes written Doctor or Doctorate of
        Business Administration. It is a professional doctorate: a research degree built around
        management practice.
      </P>
      <P>
        The same three letters mean two other things. Diploma in Business Administration is a 1-year
        course after 10+2, a completely different qualification. If that is the course you meant, talk to
        our counsellor. Outside education, DBA also means database administrator, an IT job role.
      </P>

      <H2 id="what-is-a-dba">What a DBA is, and who it suits</H2>
      <P>
        A DBA asks you to study a management problem in depth and write it up as a dissertation. The six
        online DBAs on this page all run for 3 years with live sessions, recordings and a 75% attendance
        requirement, so they are built to sit alongside a job.
      </P>
      <H3>Who a DBA suits</H3>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        <li>Working professionals who want a doctorate-level research project without leaving their job.</li>
        <li>People whose goal does not depend on a UGC-recognised PhD, such as a role outside Indian academia.</li>
        <li>People who can commit to 75% attendance in live sessions for 3 years.</li>
      </ul>
      <H3>Who should skip it</H3>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        <li>Anyone who wants to teach at an Indian university. A DBA cannot stand in for a PhD there.</li>
        <li>Anyone who needs a UGC PhD for any purpose. A DBA cannot be used anywhere one is required.</li>
        <li>
          Anyone who cannot risk the booking amount. {noRefundBeforeStart.join(' and ')} do not state a
          refund up to the start date.
        </li>
      </ul>

      <H3>Executive DBA and executive doctorate</H3>
      <P>
        Executive DBA and executive doctorate are names providers give to a DBA aimed at experienced
        professionals. The name does not change the validity position above. {ssbm.provider} calls its
        programme an {ssbm.programmeName}, and its eligibility reads: {ssbm.eligibilityText}.
      </P>

      <H3>DBA after MBA</H3>
      <P>
        An MBA is a master&apos;s degree. {masterRoute.join(', ')} name a master&apos;s degree in their
        eligibility. {bachelorOnly.map(p => p.provider).join(' and ')} set their routes at bachelor&apos;s
        level or a 2-year PGDM: {bachelorOnly[0].eligibilityText}. Some routes also ask for work
        experience, so read each programme&apos;s exact wording in the finder below.
      </P>

      <H2 id="dba-course-details">DBA course details</H2>
      <TableWrap>
        <tbody>
          <tr><Td><strong>Duration</strong></Td><Td>3 years for all six programmes</Td></tr>
          <tr>
            <Td><strong>Credits</strong></Td>
            <Td>{credits.map(p => `${p.provider}: ${p.totalCreditsText}`).join('; ')}</Td>
          </tr>
          <tr><Td><strong>Live sessions</strong></Td><Td>Yes, with recordings, in all six</Td></tr>
          <tr><Td><strong>Attendance</strong></Td><Td>75% required</Td></tr>
          <tr><Td><strong>Campus immersion</strong></Td><Td>Available in all six</Td></tr>
          <tr>
            <Td><strong>Dissertation</strong></Td>
            <Td>{ggu.provider} counts 32 dissertation credits of its 56. Talk to our counsellor for how the others assess it.</Td>
          </tr>
          <tr><Td><strong>Degree</strong></Td><Td>Soft copy and physical degree</Td></tr>
          <tr><Td><strong>Deferral</strong></Td><Td>{ggu.deferralText}</Td></tr>
        </tbody>
      </TableWrap>

      <H2 id="compare-online-dba">All six online DBA programmes compared</H2>
      <DbaComparisonTable programmes={programmes} />
      <P>
        See every fee side by side, including what immersion adds, on the{' '}
        <Link href="/online-dba/dba-fees" className="font-semibold underline" style={{ color: '#f97316' }}>
          DBA course fees page
        </Link>.
      </P>

      <H2 id="dba-finder">DBA Finder: shortlist by budget and terms</H2>
      <P>
        Pick a budget and the terms that matter to you. Eligibility is not filtered, because each provider
        words it differently. Read it on each card.
      </P>
      <DbaFinder items={programmes.map(toFinderItem)} />

      <H2 id="dba-vs-phd">DBA vs PhD at a glance</H2>
      <TableWrap>
        <thead><tr><Th> </Th><Th>DBA (online, foreign)</Th><Th>PhD (India)</Th></tr></thead>
        <tbody>
          <tr><Td><strong>Valid in India</strong></Td><Td>Only with a UGC equivalence certificate</Td><Td>Yes, under the UGC PhD Regulations, 2022</Td></tr>
          <tr><Td><strong>Duration</strong></Td><Td>3 years (all six listed)</Td><Td>At least 3 years including coursework, at most 6</Td></tr>
          <tr><Td><strong>Online mode</strong></Td><Td>Yes</Td><Td>Not permitted online or by distance</Td></tr>
          <tr><Td><strong>Teaching in India</strong></Td><Td>Cannot replace a required PhD</Td><Td>Meets any requirement for a UGC-recognised PhD</Td></tr>
          <tr><Td><strong>Research focus</strong></Td><Td>Applied, on a management problem</Td><Td>Original research for an academic field</Td></tr>
        </tbody>
      </TableWrap>
      <P>
        Read the full comparison on{' '}
        <Link href="/online-dba/dba-vs-phd" className="font-semibold underline" style={{ color: '#f97316' }}>
          DBA vs PhD in India
        </Link>.
      </P>

      <DbaFaq faqs={faqs} />

      <H2 id="programme-pages">Programme pages</H2>
      <ul className="grid sm:grid-cols-2 gap-2 mb-4">
        {programmes.map(p => (
          <li key={p.slug}>
            <Link href={`/online-dba/${p.slug}`} className="text-[15px] font-semibold hover:underline" style={{ color: '#0f172a' }}>
              {dbaDisplayName(p)}: fees, eligibility and India validity
            </Link>
          </li>
        ))}
      </ul>
      <DbaSectionLinks current="/online-dba" />

      <DbaEnquiryForm source="dba-pillar" id="dba-enquiry" />
    </DbaPage>
  )
}
