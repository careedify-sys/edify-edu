// lib/seo/should-index.ts
// Sprint 3 thin-page gate. Programme hub pages (five templates:
// /universities/[id]/{mba,bba,bca,mca}/page.tsx plus the generic
// /universities/[id]/[program]/page.tsx) emit robots.index based on this
// helper. Spec pages are NOT gated here. Their policy is declared in
// app/sitemap.ts and remains index,follow across the board pending the
// 18 August GSC read.
//
// Rule: a programme hub page indexes ONLY when at least ONE of these is true:
//   1. A page-content JSON exists for that university + programme
//      (lib/data/page-content/{uni}-{prog}.json)
//   2. getDisplayFee(uni, program).ok === true. The fee resolver returned
//      a Rule 1 / 2 / 3 pass and a real fee will render on the page
//
// A page with neither is genuinely thin (no editorial content, no verified
// fee) and gets noindex, follow. `follow` is deliberate: link equity keeps
// flowing to whatever pages the thin page still references. Never nofollow.
//
// Do not add these paths to robots.txt Disallow. Googlebot has to crawl
// the page to see the noindex tag.

import type { University, Program } from '../data'
import { getPageContent } from '../data/page-content'
import { getDisplayFee } from '../fees'
import { shouldIndexUniversity } from './mode-unverified'

// The university-level gate lives in ./mode-unverified so client components can
// import it without dragging in the fee resolver and the page-content loader.
export { MODE_UNVERIFIED_UNIS, shouldIndexUniversity } from './mode-unverified'

export interface IndexDecision {
  shouldIndex: boolean
  hasContentJson: boolean
  feeOk: boolean
}

export function shouldIndexProgrammeHub(
  u: University,
  program: Program,
): IndexDecision {
  const hasContentJson = getPageContent(u.id, program) !== null
  const feeOk = getDisplayFee(u, program).ok
  // The hasContentJson || feeOk rule below is unchanged and must stay an OR.
  // shouldIndexUniversity is a separate outer gate on a different axis: it asks
  // whether the university's delivery mode is verified at all.
  return {
    shouldIndex: shouldIndexUniversity(u.id) && (hasContentJson || feeOk),
    hasContentJson,
    feeOk,
  }
}

// Task 5 (2026-08-19, revised). The family's avg pos 27.2 is dragged down by
// deep MBA spec pages ranking 25-66; the programme hubs themselves rank 8-18
// and convert. Keep every hub that lands a click, plus the two spec pages that
// actually rank. Noindex the 14 low-rank MBA specs. /programs root stays out.
// Sitemap and per-page robots meta both read this allowlist so the two signals
// cannot drift apart.
export const PROGRAMS_INDEX_ALLOWLIST: readonly string[] = [
  '/programs/mba',                        // 23 clicks, pos 7.51
  '/programs/bca',                        // 18 clicks, pos 10.74
  '/programs/ma',                         // 13 clicks, 1.40% CTR, pos 8.74
  '/programs/bba',                        // 12 clicks, pos 17.89
  '/programs/mca',                        // 10 clicks, pos 17.76
  '/programs/mba/healthcare-management',  //  8 clicks, pos 6.46
  '/programs/bba/aviation',               //  5 clicks, 4.46% CTR, pos 7.83
  '/programs/mcom',                       //  4 clicks, pos 12.30
  '/programs/msc',                        //  2 clicks, 2.06% CTR, pos 11.05
  '/programs/bcom',                       //  2 clicks, pos 10.45
  '/programs/bsc',                        //  1 click,  pos 8.39
]

export function shouldIndexProgramsPath(pathname: string): boolean {
  return PROGRAMS_INDEX_ALLOWLIST.includes(pathname)
}
