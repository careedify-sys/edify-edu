// lib/best-mba-ranking.ts
//
// The ranking behind /best-online-mba-india, derived at build time.
//
// Why this file exists. The page used to carry a hardcoded TOP_10 array that
// had drifted badly from lib/data.ts. It ordered universities by their NIRF
// *University* rank while the page promised a management ranking, printed
// badges like "NIRF #8" with no category at all, and quoted fees that rule 4d
// has since suppressed as shared placeholders ("from Rs 60K" was the floor of
// a range nine universities claimed). A reader could not tell which table a
// number came from, and neither could a language model quoting the page.
//
// So nothing here is hand-written. Ranks come from lib/data.ts, NAAC grades
// are gated against the Supabase snapshot in data/naac-verified.json using the
// same policy as scripts/build-llms-txt.mjs (print a grade only if Supabase
// confirms it and the accreditation cycle has not lapsed), and every fee goes
// through getDisplayFee so a suppressed fee stays suppressed here too.
//
// The inclusion rule is the point of the page: a university appears only if it
// holds a placement in NIRF's Management category. That is 23 of the 121
// universities offering an online MBA. The other 98 are not worse, they are
// unranked in that category, and the page has to say so rather than quietly
// filling ten slots.

import { UNIVERSITIES, type University } from './data'
import { getDisplayFee } from './fees'
import naacSnapshot from '../data/naac-verified.json'

// lib/data.ts uses 999 in nirf and nirfMgt to mean "not ranked", not "ranked
// 999th". Treating it as a number put unranked universities in the table.
export const NO_RANK = 999

export const RANKING_AS_OF = '2026-09-29'

const NAAC_GRADES: Record<string, { grade: string; validTill: string | null }> =
  (naacSnapshot as { grades: Record<string, { grade: string; validTill: string | null }> }).grades

export type NaacStatus = 'confirmed' | 'lapsed' | 'unverified'

export interface NaacClaim {
  /** Printable grade, or null when the page must not print one. */
  grade: string | null
  status: NaacStatus
  validTill: string | null
  /** Shown to the reader in place of a grade. */
  note: string
}

export interface RankedMba {
  /** Position in this list, not a NIRF number. */
  position: number
  id: string
  name: string
  /** Display label: the full name with the trailing "Online" removed. */
  displayName: string
  /** Abbreviation from data.ts. Several are internal codes, so it is only a hint. */
  abbr: string | null
  city: string | null
  /** NIRF Management category rank. Always present in this list. */
  nirfManagement: number
  /** NIRF University category rank, or null when NIRF does not rank it there. */
  nirfUniversity: number | null
  naac: NaacClaim
  /** Fee string from getDisplayFee, or null when it is suppressed. */
  fee: string | null
  /** Numeric bounds behind that string. Null whenever fee is null. */
  feeMin: number | null
  feeMax: number | null
  feeSuppressedRule: string | null
  href: string
}

// The city field in lib/data.ts is not clean. Amrita and Jamia Millia Islamia
// both carry "Online", Chandigarh University carries "NH-95" and LPU carries
// "Block 32", which are address fragments rather than cities. Printing those
// under a university name looks like a bug to a reader and is worthless to a
// model, so anything containing a digit or naming a delivery mode is dropped.
function plausibleCity(city: string | undefined | null): string | null {
  if (!city) return null
  const c = city.trim()
  if (!c || /\d/.test(c)) return null
  if (/^(online|distance|n\/?a|na|none|-)$/i.test(c)) return null
  return c
}

function naacClaim(u: University): NaacClaim {
  const snap = NAAC_GRADES[u.id]
  if (!snap) {
    return {
      grade: null,
      status: 'unverified',
      validTill: null,
      note: 'Not in our verified set',
    }
  }
  if (snap.validTill && snap.validTill < RANKING_AS_OF) {
    return {
      grade: null,
      status: 'lapsed',
      validTill: snap.validTill,
      note: `Cycle expired ${snap.validTill}`,
    }
  }
  return {
    grade: snap.grade,
    status: 'confirmed',
    validTill: snap.validTill,
    note: snap.validTill ? `Valid to ${snap.validTill}` : 'Valid, no end date published',
  }
}

function toRanked(u: University, position: number): RankedMba {
  const fee = getDisplayFee(u, 'MBA')
  return {
    position,
    id: u.id,
    name: u.name,
    displayName: u.name.replace(/\s+Online$/i, '').trim(),
    abbr: u.abbr || null,
    city: plausibleCity(u.city),
    nirfManagement: u.nirfMgt as number,
    nirfUniversity: u.nirf != null && u.nirf < NO_RANK ? u.nirf : null,
    naac: naacClaim(u),
    fee: fee.ok ? fee.compact ?? null : null,
    feeMin: fee.ok ? fee.min ?? null : null,
    feeMax: fee.ok ? fee.max ?? null : null,
    feeSuppressedRule: fee.ok ? null : String(fee.rule ?? ''),
    href: `/universities/${u.id}`,
  }
}

/** Every university in lib/data.ts that offers an online MBA. */
export const MBA_UNIVERSITIES: University[] = UNIVERSITIES.filter(u =>
  (u.programs || []).includes('MBA'),
)

/** Those holding a NIRF Management placement, best rank first. */
export const BEST_MBA_RANKING: RankedMba[] = MBA_UNIVERSITIES
  .filter(u => u.nirfMgt != null && (u.nirfMgt as number) < NO_RANK)
  .sort((a, b) => (a.nirfMgt as number) - (b.nirfMgt as number))
  .map((u, i) => toRanked(u, i + 1))

export const RANKING_COUNTS = {
  /** 121 at time of writing. */
  mbaUniversities: MBA_UNIVERSITIES.length,
  /** 23. */
  ranked: BEST_MBA_RANKING.length,
  /** 98. Unranked in the Management category, not excluded on quality. */
  unranked: MBA_UNIVERSITIES.length - BEST_MBA_RANKING.length,
  naacConfirmed: BEST_MBA_RANKING.filter(r => r.naac.status === 'confirmed').length,
  feesPublished: BEST_MBA_RANKING.filter(r => r.fee !== null).length,
}
