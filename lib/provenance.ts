// lib/provenance.ts
//
// Display lines for University.provenance (B1, 2026-11-28). The data lives in
// lib/data.ts (UNIVERSITY_PROVENANCE) and reaches pages on the University
// record, so this file imports types only and is safe in client components.
//
// Two lines render: the fee's checked date beside the fee, and the UGC-DEB
// session beside the approval. sourceUrl is never printed here: official
// university sites stay out of visible copy (D6). The gate that keeps the data
// honest is scripts/check-fee-provenance.mts.

import type { University } from './data'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-11-18' -> '18 Nov 2026'. null for anything that is not a date. */
export function formatCheckedDate(iso: string | undefined | null): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const month = MONTHS[Number(m[2]) - 1]
  if (!month) return null
  return `${Number(m[3])} ${month} ${m[1]}`
}

/**
 * "Fee checked 18 Nov 2026 on the university portal", for the MBA fee only:
 * provenance.fee records the MBA figure getExactFee returns, so another
 * programme's fee must never carry this date.
 */
export function feeCheckedLine(u: Pick<University, 'provenance'>, program: string): string | null {
  if (program !== 'MBA') return null
  const d = formatCheckedDate(u.provenance?.fee?.checkedOn)
  return d ? `Fee checked ${d} on the university portal` : null
}

/** "UGC-DEB entitled, Online mode, 2026-27 session. Register checked 18 Nov 2026" */
export function debSessionLine(u: Pick<University, 'provenance'>): string | null {
  const deb = u.provenance?.deb
  const d = formatCheckedDate(deb?.checkedOn)
  if (!deb || !d || !deb.session) return null
  return `UGC-DEB entitled, ${deb.value} mode, ${deb.session} session. Register checked ${d}`
}
