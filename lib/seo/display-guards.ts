// lib/seo/display-guards.ts
//
// A university record can legitimately carry NO NAAC grade and NO fee.
// Before the August 2026 UGC batch every one of the 124 records had both, so
// dozens of title, description, JSON-LD and FAQ builders interpolated
// `NAAC ${u.naac}` and `₹${u.emiFrom}` directly. With an empty grade or a zero
// fee those render as "NAAC ." and "₹0K", which is worse than saying nothing:
// it publishes a fee of zero and an accreditation of blank.
//
// Guarding each call site individually was tried and missed sites twice, once
// on the programme hubs and once on a length fallback. These helpers exist so
// there is ONE place that decides what an absent grade or fee looks like, and
// every builder routes through them.
//
// Rule: absent means the clause disappears, never that it renders empty.

/** " NAAC A++" for appending mid-sentence, or "" when no grade is on record. */
export function naacSuffix(naac?: string): string {
  return naac ? ` NAAC ${naac}` : ''
}

/** "NAAC A++" standalone, or a truthful fallback when no grade is on record. */
export function naacPhrase(naac?: string, fallback = 'UGC-DEB entitled'): string {
  return naac ? `NAAC ${naac}` : fallback
}

/** " NAAC A++ accredited." for JSON-LD prose, or "" when no grade is on record. */
export function naacAccredited(naac?: string): string {
  return naac ? ` NAAC ${naac} accredited.` : ''
}

/** ", NAAC A++" for comma-joined description segments, or "" when absent. */
export function naacSegment(naac?: string): string {
  return naac ? `, NAAC ${naac}` : ''
}

/** True when a real fee is on record. feeMin 0 means "not published yet". */
export function hasRealFee(u: { feeMin?: number }): boolean {
  return typeof u.feeMin === 'number' && u.feeMin > 0
}

/** "₹5,000/month", or null when no EMI can be derived from a real fee. */
export function emiPhrase(emiFrom?: number): string | null {
  return emiFrom && emiFrom > 0 ? `₹${emiFrom.toLocaleString()}/month` : null
}

/**
 * u.emiFrom is the MBA EMI: it was entered against the MBA fee, and EMI is not
 * stored per programme. LPU BCA and MCA hubs printed the MBA's ₹6,708, and
 * MUJ BBA ₹6,517 against a ₹4,000 chart. Returns 0 for any other programme so
 * the guards below fall back to the no-figure line.
 */
export function programmeEmiFrom(u: { emiFrom?: number }, program: string): number {
  return program === 'MBA' ? (u.emiFrom ?? 0) : 0
}

/** Said instead of an EMI figure when only the MBA one is on record. */
export const NO_PROGRAMME_EMI = 'EdifyEdu does not list a verified EMI figure for this programme yet.'

/**
 * A whole "EMI starts from X." sentence, or the counsellor line when there is
 * no fee to base an EMI on. Never emits "EMI starts from ₹0/month".
 */
export function emiSentence(
  emiFrom?: number,
  fallback = 'EMI options are confirmed once the university publishes the current intake fee.',
): string {
  const emi = emiPhrase(emiFrom)
  return emi ? `EMI starts from ${emi}.` : fallback
}

/**
 * The fee half of a "Total programme fee is X across Y." sentence.
 * Returns the counsellor line when no fee is on record.
 */
export function feeSentence(feeStr: string | null | undefined, duration: string, hasFee: boolean): string {
  return hasFee && feeStr
    ? `Total programme fee is ${feeStr} across ${duration}.`
    : 'The fee for the current intake is not published on this page yet, so request it in writing before you apply.'
}
