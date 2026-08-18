// lib/seo/resolve-programme.ts
// Single source of truth for "does this (uni, programme) hub URL resolve?".
// Both generateMetadata and the page component of a hub route must branch on
// the same result, so metadata and body can never disagree.
//
// Task 3 slice 1 (MA-first): wired into app/universities/[id]/[program]/ only.
// The programme-specialised routes (mba/bba/bca/mca) keep their existing logic
// until their own slices land.
//
// Middleware allowlist scripts (scripts/build-programme-allowlist.js,
// scripts/check-programme-allowlist-resolver.ts) treat this function as the
// oracle. A pre-commit gate blocks any commit where the generated allowlist
// disagrees with this resolver on any (uni, programme) combination in scope.

import { getUniversityById, type Program, type ProgramDetail, type University } from '@/lib/data'

export type ResolveNotFoundReason =
  | 'unknown-uni'
  | 'unknown-program'
  | 'program-not-in-uni'
  | 'no-programme-details'

export type ResolveResult =
  | { kind: 'resolved'; university: University; program: Program; pd: ProgramDetail }
  | { kind: 'not-found'; reason: ResolveNotFoundReason }

// Slug → Program-enum label. Keep in sync with the PM constant historically
// duplicated across hub routes; this is the canonical source now.
export const PROGRAMME_SLUG_TO_LABEL: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA',
  'ba': 'BA', 'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA',
  'msc': 'MSc', 'bsc': 'BSc', 'mba-wx': 'MBA (WX)',
}

export function programmeSlug(program: Program): string {
  return program.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-').replace(/[()]/g, '')
}

export function resolveProgramme(uniId: string, programSlug: string): ResolveResult {
  const university = getUniversityById(uniId)
  if (!university) return { kind: 'not-found', reason: 'unknown-uni' }
  const program = PROGRAMME_SLUG_TO_LABEL[programSlug?.toLowerCase()]
  if (!program) return { kind: 'not-found', reason: 'unknown-program' }
  if (!university.programs.includes(program)) return { kind: 'not-found', reason: 'program-not-in-uni' }
  const pd = university.programDetails[program]
  if (!pd) return { kind: 'not-found', reason: 'no-programme-details' }
  return { kind: 'resolved', university, program, pd }
}
