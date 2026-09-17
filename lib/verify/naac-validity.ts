// lib/verify/naac-validity.ts
//
// NAAC accreditation runs in cycles with an expiry date. Supabase stores
// valid_till; lib/data.ts stores only the letter grade, with no date, so the
// site presents every grade as current indefinitely.
//
// On 2026-09-17 two cycles had already lapsed while the site still showed the
// grade as an unqualified positive: Chandigarh University A+ (ended 2026-09-09)
// and Dayalbagh Educational Institute A+ (ended 2026-08-09). The verify pages
// were rendering "valid till 2026" for both, which is literally true and reads
// as reassuring.
//
// An expired cycle does NOT mean the grade is gone. Reassessment is frequently
// pending and institutions usually retain the grade in practice. It means we
// cannot assert it as current, which is the same treatment IGNOU's A++ already
// gets in the blog copy. Say what the record shows and where to confirm.
//
// Audit with: npx tsx scripts/audit-naac-validity.mjs

export type NaacCycle = {
  /** Human-readable cycle description for the card's secondary line. */
  desc: string
  /** True when valid_till is in the past. */
  expired: boolean
  /** True when valid_till is within the next 6 months. */
  expiringSoon: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Describe a NAAC cycle for display, flagging a lapsed or nearly-lapsed one.
 *
 * @param validTill ISO date string from Supabase accreditations.valid_till
 * @param cycle     Supabase accreditations.cycle, if known
 * @param now       Injectable for tests
 */
export function naacCycle(
  validTill: string | null | undefined,
  cycle?: string | null,
  now: Date = new Date(),
): NaacCycle {
  const cyclePart = cycle ? `Cycle ${cycle}` : ''

  if (!validTill) {
    return {
      desc: cyclePart || 'Accredited by NAAC',
      expired: false,
      expiringSoon: false,
    }
  }

  const till = new Date(validTill)
  if (Number.isNaN(till.getTime())) {
    return { desc: cyclePart || 'Accredited by NAAC', expired: false, expiringSoon: false }
  }

  const expired = till < now
  const expiringSoon = !expired && till.getTime() - now.getTime() < 180 * 864e5
  const stamp = `${MONTHS[till.getUTCMonth()]} ${till.getUTCFullYear()}`

  // When the cycle has lapsed, lead with that rather than burying it after the
  // cycle number. The reader is on a verification page precisely to find this.
  const tail = expired
    ? `cycle ended ${stamp}, reassessment due`
    : expiringSoon
      ? `valid till ${stamp}, due for reassessment`
      : `valid till ${till.getUTCFullYear()}`

  return {
    desc: [cyclePart, tail].filter(Boolean).join(' · '),
    expired,
    expiringSoon,
  }
}
