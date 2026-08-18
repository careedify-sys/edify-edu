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
  return {
    shouldIndex: hasContentJson || feeOk,
    hasContentJson,
    feeOk,
  }
}
