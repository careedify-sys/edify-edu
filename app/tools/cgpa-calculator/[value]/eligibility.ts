// app/tools/cgpa-calculator/[value]/eligibility.ts
//
// The real online MBA eligibility picture, computed from lib/data.ts at build
// time. These 26 pages are statically rendered, so this runs once per build and
// nothing reaches the client.
//
// Why this file exists. The 26 CGPA value pages used to assert a four-band
// eligibility ladder: below 50% not eligible, 50-60% "Galgotias, Sharda, LPU",
// 60-70% "NMIMS, Symbiosis, MAHE", 70%+ "all top-tier programmes plus merit
// scholarships". The 70%+ band also told every reader they "qualify for
// merit-based scholarships and fee waivers at most premium universities".
//
// None of that is in the data. Of the universities on this site that run an
// online MBA and publish a minimum, all but one state 50%, and the exception
// states 40%. There is no 60% band and no 70% band. The site holds no
// scholarship-threshold data at all, so the fee-waiver promise had nothing
// behind it. On a site whose whole proposition is checked figures, templated
// across 26 URLs, that is the claim most worth removing.
//
// Everything below is derived, so it tracks lib/data.ts instead of drifting
// from it.

import { UNIVERSITIES } from '@/lib/data'

type Uni = { programs?: string[]; eligibilityPct?: number }

const unis = UNIVERSITIES as unknown as Uni[]

const mbaUnis = unis.filter(u => (u.programs ?? []).some(p => p.toUpperCase() === 'MBA'))

const withMin = mbaUnis.filter(
  (u): u is Uni & { eligibilityPct: number } =>
    typeof u.eligibilityPct === 'number' && u.eligibilityPct > 0,
)

/** Universities on this site running an online MBA. */
export const MBA_TOTAL = mbaUnis.length

/** Of those, how many publish a minimum graduation percentage here. */
export const MBA_WITH_MIN = withMin.length

/** Of those, how many publish no minimum here, so nothing can be claimed for them. */
export const MBA_WITHOUT_MIN = MBA_TOTAL - MBA_WITH_MIN

/** The lowest minimum any of them states. */
export const LOWEST_MIN = withMin.length ? Math.min(...withMin.map(u => u.eligibilityPct)) : 0

/** The minimum the largest number of them state. */
export const COMMON_MIN = (() => {
  const tally = new Map<number, number>()
  for (const u of withMin) tally.set(u.eligibilityPct, (tally.get(u.eligibilityPct) ?? 0) + 1)
  let best = 0
  let bestN = -1
  // forEach, not for..of: the project target does not enable downlevelIteration.
  tally.forEach((n, pct) => { if (n > bestN) { best = pct; bestN = n } })
  return best
})()

/** How many of them state exactly COMMON_MIN. */
export const COMMON_MIN_COUNT = withMin.filter(u => u.eligibilityPct === COMMON_MIN).length

/** How many state a minimum the given percentage meets. */
export function meetsMinimumCount(percentage: number): number {
  return withMin.filter(u => percentage >= u.eligibilityPct).length
}

// A derived figure that silently becomes zero is worse than a hard-coded one,
// because the copy still reads as a sentence. Fail the build instead.
if (MBA_TOTAL === 0 || MBA_WITH_MIN === 0 || COMMON_MIN === 0) {
  throw new Error(
    `cgpa eligibility: derived nothing from lib/data.ts ` +
      `(MBA_TOTAL=${MBA_TOTAL}, MBA_WITH_MIN=${MBA_WITH_MIN}, COMMON_MIN=${COMMON_MIN}). ` +
      `The CGPA value pages would render eligibility copy built on zeroes.`,
  )
}

/** The CGPA that corresponds to COMMON_MIN under the UGC formula (pct / 9.5). */
export const COMMON_MIN_CGPA = (COMMON_MIN / 9.5).toFixed(2)

/**
 * The "Is X% a good score" paragraph. Replaces the hand-written TIER_COPY,
 * which told readers that NMIMS, Symbiosis and MAHE require 60%, that
 * scholarship slabs start at 70%, and that a 70% score earns fee waivers and
 * entrance-test exemptions. None of that is in lib/data.ts.
 */
export function eligibilityParagraph(percentage: number): string {
  const met = meetsMinimumCount(percentage)
  if (met === 0) {
    return `This score sits below every graduation minimum published on this site. Of the ${MBA_WITH_MIN} online MBA universities here that state one, ${COMMON_MIN_COUNT} ask for ${COMMON_MIN}% and the lowest asks for ${LOWEST_MIN}%. Some programmes relax the bar for reserved categories and some accept a bridge course, so check the criterion on the university admission page before you rule yourself out.`
  }
  if (met < MBA_WITH_MIN) {
    return `This score clears the lowest graduation minimum published on this site, which is ${LOWEST_MIN}%, but it falls short of the ${COMMON_MIN}% that ${COMMON_MIN_COUNT} of those ${MBA_WITH_MIN} universities ask for. It currently meets the stated minimum at ${met} of them. Check the criterion on the university admission page, and ask whether a reserved-category relaxation or a bridge course applies to you.`
  }
  return `This score meets the graduation minimum at all ${MBA_WITH_MIN} online MBA universities on this site that publish one, because ${COMMON_MIN_COUNT} of them ask for ${COMMON_MIN}%. Above that floor your marks are rarely what decides admission. A further ${MBA_WITHOUT_MIN} run an online MBA without publishing a minimum here, so confirm the criterion on their own admission page.`
}

/** Short version of the same, for the FAQ block and its FAQPage schema. */
export function eligibilityFaqAnswer(label: string, percentage: number): string {
  const met = meetsMinimumCount(percentage)
  if (met === 0) {
    return `Not at the universities listed here. ${label} CGPA works out to ${percentage}%, and the lowest graduation minimum published on this site is ${LOWEST_MIN}%. Ask the university whether a bridge course or a reserved-category relaxation applies before you rule it out.`
  }
  if (met < MBA_WITH_MIN) {
    return `At some of them. ${label} CGPA works out to ${percentage}%, which meets the stated minimum at ${met} of the ${MBA_WITH_MIN} online MBA universities here that publish one. Confirm the criterion on the university admission page before you apply.`
  }
  return `Yes. ${label} CGPA works out to ${percentage}%, which meets the stated minimum at all ${MBA_WITH_MIN} online MBA universities on this site that publish one. ${COMMON_MIN_COUNT} of them ask for ${COMMON_MIN}% in graduation. Confirm the criterion on the university admission page, because ${MBA_WITHOUT_MIN} more run an online MBA without publishing a minimum here.`
}
