// The one university-coverage number the site prints, as a floor ("125+").
//
// Rishi, 2026-11-06: one number everywhere, written as 125+, so copy does not
// need editing every time a university is added or removed. The exact record
// count (UNIVERSITIES.length) is still what the gate checks the floor against:
// if lib/data.ts ever drops below CLAIM_FLOOR, the claim becomes false and
// check-university-count fails until this constant is lowered.
//
// Used by scripts/check-university-count.mjs and scripts/build-llms-txt.mjs.
export const CLAIM_FLOOR = 125
export const CLAIM_TEXT = `${CLAIM_FLOOR}+`
