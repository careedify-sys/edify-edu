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

// Task 5 (2026-08-19). GSC audit of /programs/*: 25 pages, 45,336 impressions,
// 125 clicks, avg position 27.2. Only two paths carry their weight:
//   /programs/mba                          (23 clicks, pos 7.51)
//   /programs/mba/healthcare-management    (11,412 impressions, pos 6.46)
// Everything else under /programs noindexes. Sitemap and per-page robots meta
// both read this same allowlist so the two signals cannot drift apart.
export const PROGRAMS_INDEX_ALLOWLIST: readonly string[] = [
  '/programs/mba',
  '/programs/mba/healthcare-management',
]

export function shouldIndexProgramsPath(pathname: string): boolean {
  return PROGRAMS_INDEX_ALLOWLIST.includes(pathname)
}
