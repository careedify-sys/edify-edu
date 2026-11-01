// /online-dba/dba-fees: targets "dba course fees" and "dba fees".
// Every figure is read or computed from data/dba-programmes.ts. Rows whose fee
// is not confirmed show the counsellor line and sort last.

import Link from 'next/link'
import {
  getPublicDbaProgrammes,
  formatInr,
  dbaDisplayName,
  lowestFee,
  immersionCost,
} from '@/data/dba-programmes'
import DbaValidityVerdict from '@/components/dba/DbaValidityVerdict'
import DbaEnquiryForm from '@/components/dba/DbaEnquiryForm'
import { DbaBreadcrumbs, DbaCompactCta, DbaFaq, DbaPage, DbaSectionLinks, H2, P, TableWrap, Th, Td, type Faq } from '@/components/dba/DbaShared'
import { COUNSELLOR_FEE, FeeIndicativeNote, bookingText, confirmedFeeRange, dbaMetadata, refundSummary } from '@/components/dba/DbaTables'

export const metadata = dbaMetadata({
  title: 'DBA Course Fees in India: 6 Online DBAs Compared',
  description:
    'Not automatically valid in India. DBA course fees for 6 online DBAs, with and without immersion, booking amounts, refund terms and the 5% deferral charge.',
  path: '/online-dba/dba-fees',
  titleMax: 65,
})

const dash = (n: number | null) => (n == null ? 'No split' : formatInr(n))

export default function DbaFeesPage() {
  const all = getPublicDbaProgrammes()
  const sorted = [...all].sort((a, b) => {
    const fa = lowestFee(a), fb = lowestFee(b)
    if (fa == null && fb == null) return 0
    if (fa == null) return 1
    if (fb == null) return -1
    return fa - fb
  })
  const range = confirmedFeeRange(all)
  const lowest = sorted[0]
  const splits = all.map(p => ({ p, cost: immersionCost(p) })).filter(x => x.cost != null)
  const singles = all.filter(p => p.singleFee != null)
  const unconfirmed = all.filter(p => !p.feeConfirmed)
  const confirmed = all.filter(p => p.feeConfirmed)
  const bookingAmounts = Array.from(new Set(confirmed.map(p => p.bookingAmount))).sort((a, b) => a - b)

  const faqs: Faq[] = [
    {
      q: 'What is the DBA course fee in India?',
      a: `For the online DBAs with confirmed fees, total fees run from ${formatInr(range.min)} (${range.minBy}) to ${formatInr(range.max)} (${range.maxBy}). Fees are indicative and change by batch. Talk to our counsellor for the current fee and any available scholarship.`,
    },
    {
      q: 'Which online DBA has the lowest fee?',
      a: `In our data, ${dbaDisplayName(lowest)} has the lowest confirmed fee at ${formatInr(lowestFee(lowest)!)}. Its refund policy reads: ${lowest.refundPolicyText}. Compare refund terms before you choose on price alone.`,
    },
    {
      q: 'How much is the booking amount for a DBA?',
      a: `Among programmes with confirmed fees, the booking amount is ${bookingAmounts.map(formatInr).join(' or ')}. What happens to it if you change your mind depends on each programme's refund policy, listed in the table on this page.`,
    },
    {
      q: 'Does campus immersion cost extra?',
      a: `Where a provider prices it separately, yes: ${splits.map(x => `${formatInr(x.cost!)} for ${x.p.provider}`).join(' and ')}. ${singles.map(p => p.provider).join(' and ')} quote a single fee with no immersion split.`,
    },
    {
      q: 'Is there a charge to defer a DBA?',
      a: 'All six allow deferral. If the batch has already started, a 5% additional programme fee is charged and the learner moves to the next batch.',
    },
  ]

  return (
    <DbaPage>
      <DbaBreadcrumbs crumbs={[{ name: 'Online DBA', path: '/online-dba' }, { name: 'DBA fees', path: '/online-dba/dba-fees' }]} />

      <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4" style={{ color: '#0f172a' }}>
        DBA Course Fees in India: All 6 Online DBAs Compared
      </h1>
      <P>
        These are the total fees for the six online DBAs we track, lowest first. Read the validity position
        before the price: a cheaper DBA is no bargain if it will not count for your goal.
      </P>

      <DbaValidityVerdict />
      <DbaCompactCta />

      <H2 id="fee-table">DBA fees, lowest to highest</H2>
      <TableWrap>
        <thead>
          <tr>
            <Th>Programme</Th><Th>Without immersion</Th><Th>With immersion</Th><Th>Single fee</Th>
            <Th>Booking amount</Th><Th>Refund</Th><Th>Deferral after batch start</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.slug}>
              <Td>
                <Link href={`/online-dba/${p.slug}`} className="font-semibold hover:underline" style={{ color: '#0f172a' }}>
                  {dbaDisplayName(p)}
                </Link>
              </Td>
              {p.feeConfirmed ? (
                <>
                  <Td>{p.singleFee != null ? 'No split' : dash(p.feeWithoutImmersion)}</Td>
                  <Td>{p.singleFee != null ? 'No split' : dash(p.feeWithImmersion)}</Td>
                  <Td>{p.singleFee != null ? formatInr(p.singleFee) : 'Not applicable'}</Td>
                </>
              ) : (
                <>
                  <Td>{COUNSELLOR_FEE}</Td><Td>{COUNSELLOR_FEE}</Td><Td>{COUNSELLOR_FEE}</Td>
                </>
              )}
              <Td>{bookingText(p)}</Td>
              <Td>{refundSummary(p)}</Td>
              <Td>5% additional programme fee</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <FeeIndicativeNote />

      <H2 id="immersion-cost">What immersion adds to the cost</H2>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        {splits.map(({ p, cost }) => (
          <li key={p.slug}>
            {dbaDisplayName(p)}: {formatInr(cost!)} more with immersion ({formatInr(p.feeWithoutImmersion!)} to{' '}
            {formatInr(p.feeWithImmersion!)}).
          </li>
        ))}
        {singles.map(p => (
          <li key={p.slug}>{dbaDisplayName(p)}: a single fee of {formatInr(p.singleFee!)}, with no immersion split.</li>
        ))}
        {unconfirmed.map(p => (
          <li key={p.slug}>{dbaDisplayName(p)}: talk to our counsellor for the current fee, with and without immersion.</li>
        ))}
      </ul>

      <H2 id="booking-amount">What the booking amount commits you to</H2>
      <P>The booking amount is paid before the programme starts. Whether you can get it back depends on the refund policy.</P>
      <TableWrap>
        <thead><tr><Th>Programme</Th><Th>Booking amount</Th><Th>Refund policy</Th></tr></thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.slug}>
              <Td>{dbaDisplayName(p)}</Td>
              <Td>{bookingText(p)}</Td>
              <Td>{p.refundPolicyText}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <P>
        Where the policy allows a refund before the start date, ask in writing whether it covers the booking
        amount in full. Where there is no refund policy, treat the booking amount as money you will not get back.
      </P>

      <DbaFaq faqs={faqs} />
      <DbaSectionLinks current="/online-dba/dba-fees" />
      <DbaEnquiryForm source="dba-fees" id="dba-enquiry" />
    </DbaPage>
  )
}
