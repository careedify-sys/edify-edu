// /online-dba/dba-vs-phd: targets "dba vs phd".
//
// PhD facts are limited to what the repo already publishes from the UGC PhD
// Regulations, 2022 (see /blog/online-phd-in-india): minimum 3 and maximum 6
// years, Regulation 13(3) on online and distance mode, part-time with an
// employer NOC. No Indian PhD fee is stated anywhere in the repo, so the cost
// row routes to the counsellor.

import Link from 'next/link'
import { getPublicDbaProgrammes, formatInr } from '@/data/dba-programmes'
import DbaValidityVerdict from '@/components/dba/DbaValidityVerdict'
import DbaEnquiryForm from '@/components/dba/DbaEnquiryForm'
import { DbaBreadcrumbs, DbaCompactCta, DbaFaq, DbaPage, DbaSectionLinks, H2, P, TableWrap, Th, Td, type Faq } from '@/components/dba/DbaShared'
import { confirmedFeeRange, dbaMetadata } from '@/components/dba/DbaTables'

export const metadata = dbaMetadata({
  title: 'DBA vs PhD in India: Which Is Recognised?',
  description:
    'Not automatically valid in India: a DBA is not a PhD. Recognition, duration, teaching eligibility and cost of a DBA vs PhD in India, side by side.',
  path: '/online-dba/dba-vs-phd',
})

export default function DbaVsPhdPage() {
  const programmes = getPublicDbaProgrammes()
  const range = confirmedFeeRange(programmes)

  const rows: [string, string, string][] = [
    ['Purpose', 'Applied research on a management problem, for working professionals', 'Original research that adds to an academic field'],
    ['Recognition in India', 'Not automatic. Usable only if UGC grants an equivalence certificate under the 2025 Equivalence Regulations', 'Recognised when awarded under the UGC PhD Regulations, 2022'],
    ['Typical duration', '3 years for all six online DBAs we list', 'At least 3 years including coursework, at most 6 years'],
    ['Who awards it', 'The foreign provider, for example a university abroad', 'An Indian higher education institution, under the 2022 regulations'],
    ['Teaching eligibility in India', 'Cannot be used anywhere a UGC-recognised PhD is required', 'Meets any requirement for a UGC-recognised PhD'],
    ['Mode', 'Online, with live sessions and recordings', 'Full-time or part-time. Not permitted online or by distance (Regulation 13(3))'],
    ['Research focus', 'A business or management problem', 'A research question set with a supervisor'],
    ['Cost', `${formatInr(range.min)} to ${formatInr(range.max)} across the online DBAs with confirmed fees`, 'Talk to our counsellor'],
  ]

  const faqs: Faq[] = [
    {
      q: 'Is a DBA equal to a PhD in India?',
      a: 'No. A DBA is not a PhD, and it cannot be used anywhere a UGC-recognised PhD is required. A foreign DBA is usable in India only if UGC grants an equivalence certificate under the 2025 Equivalence Regulations.',
    },
    {
      q: 'Can I do a PhD online in India?',
      a: 'No. Regulation 13(3) of the UGC PhD Regulations, 2022 bars PhD programmes through distance or online mode. Working professionals can take the part-time route instead, which needs a No Objection Certificate from the employer.',
    },
    {
      q: 'Can I teach at an Indian university with a DBA?',
      a: 'Not where the post asks for a PhD. A DBA cannot be used anywhere a UGC-recognised PhD is required. If teaching in India is your goal, choose a PhD.',
    },
    {
      q: 'Which takes longer, a DBA or a PhD?',
      a: 'The six online DBAs we list run for 3 years. A PhD in India takes at least 3 years including coursework and at most 6 years under the UGC PhD Regulations, 2022.',
    },
    {
      q: 'Is an online DBA from a foreign university valid in India?',
      a: 'Not automatically. Programmes from unrecognised institutions, unaccredited programmes, or franchise arrangements are not eligible for UGC equivalence. On 28 October 2022, UGC and AICTE publicly warned that online doctoral programmes offered by edtech companies with foreign institutions are not recognised.',
    },
  ]

  return (
    <DbaPage>
      <DbaBreadcrumbs crumbs={[{ name: 'Online DBA', path: '/online-dba' }, { name: 'DBA vs PhD', path: '/online-dba/dba-vs-phd' }]} />

      <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4" style={{ color: '#0f172a' }}>
        DBA vs PhD in India: Which Is Recognised and Which to Choose
      </h1>
      <P>
        A DBA and a PhD are both doctorates, but India treats them very differently. Start with the
        validity position, then compare them row by row.
      </P>

      <DbaValidityVerdict />
      <DbaCompactCta />

      <H2 id="side-by-side">DBA vs PhD side by side</H2>
      <TableWrap>
        <thead><tr><Th> </Th><Th>DBA (online, foreign)</Th><Th>PhD (India)</Th></tr></thead>
        <tbody>
          {rows.map(([label, dba, phd]) => (
            <tr key={label}><Td><strong>{label}</strong></Td><Td>{dba}</Td><Td>{phd}</Td></tr>
          ))}
        </tbody>
      </TableWrap>
      <p className="text-xs mt-2" style={{ color: '#64748b' }}>
        DBA fees are indicative and change by batch. See all six on the{' '}
        <Link href="/online-dba/dba-fees" className="underline" style={{ color: '#64748b' }}>DBA fees page</Link>.
      </p>

      <H2 id="choose-phd">Choose a PhD if</H2>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        <li>You want to teach at an Indian university.</li>
        <li>Any employer, regulator or institution you deal with requires a UGC-recognised PhD.</li>
        <li>You can attend in person, full-time or part-time, since a PhD in India cannot be done online.</li>
      </ul>

      <H2 id="choose-dba">Choose a DBA if</H2>
      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" style={{ color: '#334155' }}>
        <li>Your goal does not depend on a UGC-recognised PhD.</li>
        <li>You need to study online around a job, with live sessions and recordings.</li>
        <li>You have checked, in writing, that the programme is not delivered through a franchise or partner arrangement.</li>
      </ul>
      <P>
        Compare the six online programmes on the{' '}
        <Link href="/online-dba" className="font-semibold underline" style={{ color: '#f97316' }}>Online DBA page</Link>.
      </P>

      <DbaFaq faqs={faqs} />
      <DbaSectionLinks current="/online-dba/dba-vs-phd" />
      <DbaEnquiryForm source="dba-vs-phd" id="dba-enquiry" />
    </DbaPage>
  )
}
