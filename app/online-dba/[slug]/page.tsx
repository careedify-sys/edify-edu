// /online-dba/{slug}: one page per programme in data/dba-programmes.ts.
//
// Reads only getPublicDbaProgramme(), so while feeConfirmed is false the fee
// and booking amount never reach the body, title, meta or schema, and while
// locationConfirmed is false the location never does either.
//
// "SSBM Geneva" / "ESGCI Paris" are what searchers type. Neither appears here
// until the location field confirms Geneva / Paris; today it confirms neither.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  DBA_PROGRAMMES,
  getPublicDbaProgrammes,
  getPublicDbaProgramme,
  type PublicDbaProgramme,
  formatInr,
  dbaDisplayName,
  lowestFee,
  immersionCost,
  refundsBeforeStart,
  DBA_COUNSELLOR_FEE_LINE,
} from '@/data/dba-programmes'
import DbaValidityVerdict from '@/components/dba/DbaValidityVerdict'
import DbaEnquiryForm from '@/components/dba/DbaEnquiryForm'
import AccreditationBlock from '@/components/dba/AccreditationBlock'
import FranchiseQuestion from '@/components/dba/FranchiseQuestion'
import { DbaBreadcrumbs, DbaCompactCta, DbaFaq, DbaPage, DbaSectionLinks, H2, P, TableWrap, Td, JsonLd, DBA_BASE, type Faq } from '@/components/dba/DbaShared'
import { COUNSELLOR_FEE, DbaMiniCompare, FeeIndicativeNote, dbaMetadata, feeSummary } from '@/components/dba/DbaTables'

export const dynamicParams = false

export function generateStaticParams() {
  return DBA_PROGRAMMES.map(p => ({ slug: p.slug }))
}

type Props = { params: { slug: string } }

/** "{Provider} DBA Fees {amount} and India Validity", falling back to a colon form clampTitle can shorten. */
function programmeTitle(p: PublicDbaProgramme): { title: string; max: number } {
  const name = dbaDisplayName(p)
  const fee = lowestFee(p)
  const full = fee != null
    ? `${name} Fees ${formatInr(fee)} and India Validity`
    : `${name} Fees, Eligibility and India Validity`
  if (`${full} | edifyedu.in`.length <= 60) return { title: full, max: 60 }
  return {
    title: fee != null
      ? `${name} Fees ${formatInr(fee)}: India Validity`
      : `${name}: Fees, Eligibility, India Validity`,
    max: 60,
  }
}

function programmeDescription(p: PublicDbaProgramme): string {
  const name = dbaDisplayName(p)
  if (!p.feeConfirmed) {
    return `Not automatically valid in India. ${name}: eligibility, credits, refund and deferral terms. Talk to our counsellor for the current fee.`
  }
  const feeText = p.singleFee != null
    ? formatInr(p.singleFee)
    : `${formatInr(p.feeWithoutImmersion!)} to ${formatInr(p.feeWithImmersion!)}`
  return `Not automatically valid in India. ${name} fees ${feeText}, eligibility, refund and deferral terms, and the franchise check.`
}

export function generateMetadata({ params }: Props): Metadata {
  const p = getPublicDbaProgramme(params.slug)
  if (!p) return {}
  const { title, max } = programmeTitle(p)
  return dbaMetadata({ title, description: programmeDescription(p), path: `/online-dba/${p.slug}`, titleMax: max })
}

function yes(b: boolean) { return b ? 'Yes' : 'No' }

export default function DbaProgrammePage({ params }: Props) {
  const p = getPublicDbaProgramme(params.slug)
  if (!p) notFound()
  const all = getPublicDbaProgrammes()
  const name = dbaDisplayName(p)
  const fee = lowestFee(p)
  const immersion = immersionCost(p)
  const refundOk = refundsBeforeStart(p)
  const path = `/online-dba/${p.slug}`

  const glance: [string, string][] = [
    ['Provider', p.provider],
    ['Programme', p.programmeName],
    ...(p.location ? [['Location', p.location] as [string, string]] : []),
    ['Duration', `${p.durationYears} years`],
    ['Fee', feeSummary(p)],
    ...(p.feeConfirmed ? [['Booking amount', formatInr(p.bookingAmount)] as [string, string]] : []),
    ...(p.totalCreditsText ? [['Total credits', p.totalCreditsText] as [string, string]] : []),
    ...(p.specialisationCount != null ? [['Specialisations', String(p.specialisationCount)] as [string, string]] : []),
    ...(p.extraCertificate ? [['Additional certificate', p.extraCertificate] as [string, string]] : []),
    ['Live sessions', yes(p.liveSessions)],
    ['Recordings', yes(p.recordings)],
    ['Attendance required', p.attendanceRequired],
    ['Campus immersion', p.immersion],
    ['Alumni status', yes(p.alumniStatus)],
    ['Degree format', p.degreeFormat],
    ...(p.reExamText ? [['Re-exam', p.reExamText] as [string, string]] : []),
  ]

  const suits: string[] = [
    `Your profile meets its stated eligibility: ${p.eligibilityText}.`,
    fee != null
      ? (immersion != null
          ? `You can budget ${formatInr(p.feeWithoutImmersion!)} without immersion, or ${formatInr(p.feeWithImmersion!)} with it.`
          : `You can budget the single fee of ${formatInr(p.singleFee!)}.`)
      : 'You are happy to confirm the current fee with our counsellor before committing.',
    ...(refundOk ? [`You want the option of a refund until the start date: ${p.refundPolicyText.toLowerCase()}.`] : []),
    ...(p.specialisationCount != null ? [`You want a choice of specialisation. It lists ${p.specialisationCount}.`] : []),
    'Your goal does not depend on a UGC-recognised PhD.',
  ]
  const skip: string[] = [
    'You need a UGC-recognised PhD for any purpose, including teaching at an Indian university.',
    `Your qualification or experience falls short of: ${p.eligibilityText}.`,
    ...(!refundOk
      ? [/^No refund/.test(p.refundPolicyText)
          ? 'You might need your money back. The provider states no refund policy.'
          : `You want a simple refund route. The terms read: ${p.refundPolicyText}.`]
      : []),
    'You cannot commit to 75% attendance in live sessions for 3 years.',
  ]

  const faqs: Faq[] = [
    {
      q: `What is the fee for the ${name}?`,
      a: p.feeConfirmed
        ? `${feeSummary(p)}, with a booking amount of ${formatInr(p.bookingAmount)}. Fees are indicative and change by batch. ${DBA_COUNSELLOR_FEE_LINE}.`
        : `We have not confirmed the current fee. ${DBA_COUNSELLOR_FEE_LINE}.`,
    },
    { q: `What is the eligibility for the ${name}?`, a: `${p.eligibilityText}.` },
    { q: `How long is the ${name}?`, a: `${p.durationYears} years, with live sessions, recordings and a ${p.attendanceRequired} attendance requirement.` },
    {
      q: `Is the ${name} valid in India?`,
      a: `Not automatically. It is not a PhD, and it is usable in India only if UGC grants an equivalence certificate under the 2025 Equivalence Regulations. Programmes from unrecognised institutions, unaccredited programmes, or franchise arrangements are not eligible. Ask in writing whether ${p.provider} delivers it through a franchise or partner arrangement.`,
    },
    { q: `What is the refund policy for the ${name}?`, a: `${p.refundPolicyText}. ${p.deferralText}` },
    {
      q: `Does the ${name} include campus immersion?`,
      a: immersion != null
        ? `Campus immersion is available. It adds ${formatInr(immersion)} to the fee: ${formatInr(p.feeWithoutImmersion!)} without it, ${formatInr(p.feeWithImmersion!)} with it.`
        : p.feeConfirmed
          ? `Campus immersion is available. The provider quotes a single fee of ${formatInr(p.singleFee!)} with no immersion split; ask our counsellor what it covers.`
          : 'Campus immersion is available. Talk to our counsellor for the current fee with and without immersion.',
    },
  ]

  return (
    <DbaPage>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name,
          description: `${p.durationYears}-year online ${p.programmeName} from ${p.provider}. Eligibility: ${p.eligibilityText}.`,
          url: `${DBA_BASE}${path}`,
          provider: { '@type': 'Organization', name: p.provider },
          // Google's Course info result requires offers and hasCourseInstance.
          // Price only from the public (feeConfirmed) fields; held-back fees
          // ship as a priceless Paid offer so no unconfirmed figure leaks.
          offers: p.feeConfirmed && p.singleFee == null
            ? {
                '@type': 'AggregateOffer',
                category: 'Paid',
                lowPrice: String(p.feeWithoutImmersion),
                highPrice: String(p.feeWithImmersion),
                priceCurrency: 'INR',
              }
            : {
                '@type': 'Offer',
                category: 'Paid',
                ...(p.feeConfirmed && p.singleFee != null ? { price: String(p.singleFee) } : {}),
                priceCurrency: 'INR',
              },
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'Online',
            courseWorkload: `P${p.durationYears}Y`,
          },
        }}
      />
      <DbaBreadcrumbs crumbs={[{ name: 'Online DBA', path: '/online-dba' }, { name, path }]} />

      <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4" style={{ color: '#0f172a' }}>
        {p.provider} {p.programmeName}: Fees, Eligibility and India Validity
      </h1>
      <P>
        The {name} is a {p.durationYears}-year online doctorate
        {p.location ? ` from a provider based in ${p.location}` : ''}. Below are its fees, eligibility,
        credits, refund and deferral terms, and what it means for you in India.
      </P>

      <DbaValidityVerdict />
      <DbaCompactCta />

      <H2 id="at-a-glance">{name} at a glance</H2>
      <TableWrap>
        <tbody>
          {glance.map(([k, v]) => (
            <tr key={k}><Td><strong>{k}</strong></Td><Td>{v}</Td></tr>
          ))}
        </tbody>
      </TableWrap>

      <H2 id="fees">{name} fees</H2>
      {p.feeConfirmed ? (
        <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
          {p.singleFee != null ? (
            <li>Total fee: {formatInr(p.singleFee)} (single fee, no immersion split)</li>
          ) : (
            <>
              <li>Without immersion: {formatInr(p.feeWithoutImmersion!)}</li>
              <li>With immersion: {formatInr(p.feeWithImmersion!)}</li>
            </>
          )}
          <li>Booking amount: {formatInr(p.bookingAmount)}</li>
        </ul>
      ) : (
        <P>{COUNSELLOR_FEE}. We have not confirmed it, so we do not publish a figure.</P>
      )}
      <P><strong>Deferral:</strong> {p.deferralText}</P>
      <P><strong>Refund policy:</strong> {p.refundPolicyText}.</P>
      {p.feeConfirmed && <FeeIndicativeNote />}

      <H2 id="eligibility">Eligibility and structure</H2>
      <P><strong>Eligibility:</strong> {p.eligibilityText}.</P>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        {p.totalCreditsText && <li>Total credits: {p.totalCreditsText}</li>}
        {p.specialisationCount != null && <li>Specialisations: {p.specialisationCount}</li>}
        <li>Live sessions: {yes(p.liveSessions)}</li>
        <li>Recordings: {yes(p.recordings)}</li>
        <li>Attendance required: {p.attendanceRequired}</li>
        <li>{p.immersion}</li>
      </ul>

      <AccreditationBlock programme={p} />
      <FranchiseQuestion provider={p.provider} />

      <H2 id="who-it-suits">Who it suits</H2>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        {suits.map(s => <li key={s}>{s}</li>)}
      </ul>
      <H2 id="who-should-skip">Who should skip it</H2>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        {skip.map(s => <li key={s}>{s}</li>)}
      </ul>

      <H2 id="compare">Compare with the other five online DBAs</H2>
      <DbaMiniCompare programmes={all} currentSlug={p.slug} />

      <DbaFaq faqs={faqs} />
      <DbaSectionLinks current={path} />
      <DbaEnquiryForm source={`dba-${p.slug}`} university={p.provider} id="dba-enquiry" />
    </DbaPage>
  )
}
