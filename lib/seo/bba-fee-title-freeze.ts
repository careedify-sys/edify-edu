// lib/seo/bba-fee-title-freeze.ts
//
// Title and meta freeze (2026-11-28). MAHE's and Amrita's online BBA fees were
// corrected from their portals that day (audits/verify/bba-fees-mahe-amrita-2026-11-28.md).
// Before it, getExactFee returned none for both, so the live BBA hub and BBA
// specialisation titles and descriptions carry no fee. The BBA templates are
// fee-led whenever a fee exists, so the fix alone would rewrite 7 pages' titles
// and metas. A title change needs Rishi's sign-off; until it is given these ids
// keep the fee-less head while the page body shows the fee. Remove an id to let
// its head become fee-led.
export const BBA_HEAD_FROZEN_FEELESS: ReadonlySet<string> = new Set([
  'manipal-academy-higher-education-online',
  'amrita-vishwa-vidyapeetham-online',
])
