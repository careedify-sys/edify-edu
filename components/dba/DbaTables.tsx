// Fee formatting, comparison tables and metadata shared by the /online-dba pages.
// Everything reads PublicDbaProgramme, so held-back fees render as the
// counsellor line and never as a number.

import Link from 'next/link'
import type { Metadata } from 'next'
import {
  type PublicDbaProgramme,
  formatInr,
  dbaDisplayName,
  lowestFee,
  refundsBeforeStart,
  DBA_COUNSELLOR_FEE_LINE,
} from '@/data/dba-programmes'
import { clampTitle, clampDescription } from '@/lib/seo-title'
import { TableWrap, Th, Td, DBA_BASE } from './DbaShared'
import type { FinderItem } from './DbaFinder'

export const COUNSELLOR_FEE = 'Talk to our counsellor for the current fee'

export function feeSummary(p: PublicDbaProgramme): string {
  if (!p.feeConfirmed) return COUNSELLOR_FEE
  if (p.singleFee != null) return `${formatInr(p.singleFee)} (single fee)`
  return `${formatInr(p.feeWithoutImmersion!)} without immersion, ${formatInr(p.feeWithImmersion!)} with immersion`
}

export function lowestFeeText(p: PublicDbaProgramme): string {
  const f = lowestFee(p)
  return f == null ? COUNSELLOR_FEE : formatInr(f)
}

export function bookingText(p: PublicDbaProgramme): string {
  return p.feeConfirmed ? formatInr(p.bookingAmount) : 'Talk to our counsellor'
}

/** One-line refund summary for tables. The full text sits on each programme page. */
export function refundSummary(p: PublicDbaProgramme): string {
  if (/cohort commencement/.test(p.refundPolicyText)) return 'Refund before cohort start'
  if (/programme start/.test(p.refundPolicyText)) return 'Refund before programme start'
  if (/^No refund/.test(p.refundPolicyText)) return 'No refund policy'
  if (/USD 300/.test(p.refundPolicyText)) return 'USD 300 application fee non-refundable; refunds per provider schedule'
  return p.refundPolicyText
}

export function toFinderItem(p: PublicDbaProgramme): FinderItem {
  return {
    slug: p.slug,
    name: dbaDisplayName(p),
    feeWithImmersion: p.feeWithImmersion,
    feeWithoutImmersion: p.feeWithoutImmersion,
    singleFee: p.singleFee,
    eligibilityText: p.eligibilityText,
    refundPolicyText: p.refundPolicyText,
    refundBeforeStart: refundsBeforeStart(p),
    specialisationCount: p.specialisationCount,
    totalCreditsText: p.totalCreditsText,
  }
}

/** Confirmed fees only, lowest and highest across all fee variants. */
export function confirmedFeeRange(list: PublicDbaProgramme[]): { min: number; minBy: string; max: number; maxBy: string } {
  const rows: { fee: number; by: string }[] = []
  for (const p of list) {
    for (const f of [p.feeWithImmersion, p.feeWithoutImmersion, p.singleFee]) {
      if (f != null) rows.push({ fee: f, by: p.provider })
    }
  }
  rows.sort((a, b) => a.fee - b.fee)
  return { min: rows[0].fee, minBy: rows[0].by, max: rows[rows.length - 1].fee, maxBy: rows[rows.length - 1].by }
}

export function FeeIndicativeNote() {
  return (
    <p className="text-xs mt-2" style={{ color: '#64748b' }}>
      Fees are indicative, taken from provider information collected in November 2026, and change by batch.{' '}
      {DBA_COUNSELLOR_FEE_LINE}.
    </p>
  )
}

/** Pillar table: all six programmes. */
export function DbaComparisonTable({ programmes }: { programmes: PublicDbaProgramme[] }) {
  return (
    <>
      <TableWrap>
        <thead>
          <tr>
            <Th>Programme</Th><Th>Duration</Th><Th>Fee</Th><Th>Booking amount</Th>
            <Th>Credits</Th><Th>Specialisations</Th><Th>Refund</Th>
          </tr>
        </thead>
        <tbody>
          {programmes.map(p => (
            <tr key={p.slug}>
              <Td>
                <Link href={`/online-dba/${p.slug}`} className="font-semibold hover:underline" style={{ color: '#0f172a' }}>
                  {dbaDisplayName(p)}
                </Link>
              </Td>
              <Td>{p.durationYears} years</Td>
              <Td>{feeSummary(p)}</Td>
              <Td>{bookingText(p)}</Td>
              <Td>{p.totalCreditsText ?? 'Talk to our counsellor'}</Td>
              <Td>{p.specialisationCount ?? 'Not stated'}</Td>
              <Td>{refundSummary(p)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <FeeIndicativeNote />
    </>
  )
}

/** Programme page: the other five. */
export function DbaMiniCompare({ programmes, currentSlug }: { programmes: PublicDbaProgramme[]; currentSlug: string }) {
  const others = programmes.filter(p => p.slug !== currentSlug)
  return (
    <TableWrap>
      <thead>
        <tr><Th>Programme</Th><Th>Lowest fee</Th><Th>Credits</Th><Th>Refund</Th></tr>
      </thead>
      <tbody>
        {others.map(p => (
          <tr key={p.slug}>
            <Td>
              <Link href={`/online-dba/${p.slug}`} className="font-semibold hover:underline" style={{ color: '#0f172a' }}>
                {dbaDisplayName(p)}
              </Link>
            </Td>
            <Td>{lowestFeeText(p)}</Td>
            <Td>{p.totalCreditsText ?? 'Talk to our counsellor'}</Td>
            <Td>{refundSummary(p)}</Td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

/** index,follow, self-canonical, "| edifyedu.in" through clampTitle. */
export function dbaMetadata(opts: { title: string; description: string; path: string; titleMax?: number }): Metadata {
  const title = clampTitle(`${opts.title} | edifyedu.in`, opts.titleMax ?? 60)
  const description = clampDescription(opts.description)
  const url = `${DBA_BASE}${opts.path}`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: 'website', siteName: 'edifyedu.in' },
    twitter: { card: 'summary_large_image', title, description },
  }
}
