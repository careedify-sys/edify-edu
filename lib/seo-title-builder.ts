// lib/seo-title-builder.ts
// Title builders match the competitor-convergent listy-keyword pattern.
// Differentiation lives in meta descriptions, not titles.
// No brand suffix in titles. (Blog posts keep authored seoTitle absolute.)
//
// Title patterns:
//   University (mgmt — MBA / BBA):
//     ${shortName} Online ${program} ${year}: Fees, Eligibility, Admission
//   University (tech — MCA / BCA):
//     Private/state:  ${shortName} Online ${program} ${year}: UGC-DEB, Fees & Specializations
//     Deemed:         ${shortName} Online ${program} ${year}: AICTE + UGC-DEB, Fees & Syllabus
//     Open:           ${shortName} Online ${program} ${year}: UGC-DEB + AICTE, Fees & Specializations
//   Verify:           Is ${shortName} Online ${program} UGC-DEB Approved? ${year}
//   Compare pair:     ${shortA} vs ${shortB} Online ${program} ${year}: Fees, Reviews & Comparison
//   Compare list:     Compare Online ${program} ${year}: Fees, Rankings & Reviews
//   Best-MBA hub:     Online MBA Colleges in India ${year}: Fees, Rankings & Admission
//
// Descriptions (≤155 chars) carry the "Independent / no commissions / no paid
// rankings" trust phrases no competitor can claim truthfully.
//
// AICTE rule (Supreme Court + AICTE notifications):
//   - Private (Amity, LPU, MUJ, etc.): no AICTE for online MCA/MBA → don't claim
//   - Deemed (NMIMS, MAHE, etc.):      AICTE required for online tech → surface
//   - Open (IGNOU, etc.):              both UGC-DEB and AICTE → surface both

import type { University } from './data'
import { TITLE_NAME, getTitleName } from './seo-title'

export type UniType = 'private' | 'deemed' | 'state-private' | 'central' | 'state-public' | 'open'

export type UniLike = Pick<University, 'id' | 'name' | 'abbr' | 'naac' | 'nirf' | 'nirfMgt' | 'feeMin' | 'feeMax' | 'ugc' | 'approvals' | 'programFees'> & {
  uniType?: UniType
}

const TECH_PROGRAMS = new Set(['MCA', 'BCA', 'BTECH', 'MTECH', 'B.TECH', 'M.TECH'])

export function isTechProgram(program: string): boolean {
  return TECH_PROGRAMS.has(program.toUpperCase())
}

export function validNirf(n: number | null | undefined): n is number {
  return typeof n === 'number' && n >= 1 && n <= 100
}

export function formatINR(n: number | null | undefined): string | null {
  if (!n || n <= 0) return null
  if (n < 100000) {
    // P3 rule: 1 decimal for sub-₹1L when rounding leaves a remainder.
    // ₹49,800 → ₹49.8K; ₹50,000 → ₹50K (no trailing .0).
    const tenths = Math.round(n / 100) / 10
    return tenths % 1 === 0 ? `₹${tenths}K` : `₹${tenths.toFixed(1)}K`
  }
  if (n < 1000000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')}L`
  return `₹${Math.round(n / 100000) / 10}Cr`
}

// Display the entry-tier fee. Matches "starting from" SERP intent and avoids
// the trust collapse of quoting a higher-than-actual fee on landing.
//
// Lookup order (Sprint 2):
//   1. uni.programFees[program.toLowerCase()].fee  — program-specific override
//   2. uni.feeMin                                  — university-level entry fee
//   3. uni.feeMax                                  — last-resort fallback
// `program` is optional for backward compatibility; absence skips step 1.
export function getDisplayFee(uni: UniLike, program?: string): number | undefined {
  if (program && uni.programFees) {
    const key = program.toLowerCase() as keyof NonNullable<UniLike['programFees']>
    const programFee = uni.programFees[key]?.fee
    if (programFee && programFee > 0) return programFee
  }
  if (uni.feeMin && uni.feeMin > 0) return uni.feeMin
  if (uni.feeMax && uni.feeMax > 0) return uni.feeMax
  return undefined
}

export function pickBetterNirf(uni: UniLike, program: string): number | null {
  if (isTechProgram(program)) {
    return validNirf(uni.nirf) ? uni.nirf : null
  }
  const a = validNirf(uni.nirf) ? uni.nirf : null
  const b = validNirf(uni.nirfMgt) ? uni.nirfMgt : null
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return Math.min(a, b)
}

export function getShortName(uni: UniLike): string {
  const raw = TITLE_NAME[uni.id] ?? getTitleName(uni.id, uni.name, uni.abbr)
  return raw.replace(/\s+online\s*$/i, '').trim()
}

// ── Approval branching for tech programs ───────────────────────────────────
export type ApprovalSignal = {
  label: 'UGC-DEB' | 'AICTE + UGC-DEB' | 'UGC-DEB + AICTE'
  /** Set when the uni's classification implies AICTE but it's missing from approvals. */
  integrityFlag: boolean
}

export function getApprovalSignal(uni: UniLike, program: string): ApprovalSignal {
  const tech = isTechProgram(program)
  const hasAicte = (uni.approvals || []).includes('AICTE')

  // Open uni (e.g. IGNOU) — surface both when both are held.
  if (uni.uniType === 'open' && hasAicte) {
    return { label: 'UGC-DEB + AICTE', integrityFlag: false }
  }

  // Deemed uni offering an online tech program — AICTE is the legal anchor.
  if (tech && uni.uniType === 'deemed') {
    if (hasAicte) return { label: 'AICTE + UGC-DEB', integrityFlag: false }
    // Deemed offering online tech with no AICTE in approvals — legal flag.
    return { label: 'UGC-DEB', integrityFlag: true }
  }

  // Private / state-private / state-public / central / unclassified — UGC-DEB only.
  return { label: 'UGC-DEB', integrityFlag: false }
}

// Drop an end keyword if needed; never returns over-budget output.
function fitTitle(base: string, tail: string[], max: number): string {
  const kept = [...tail]
  let title = `${base}: ${kept.join(', ')}`
  while (title.length > max && kept.length > 1) {
    kept.splice(kept.length - 2, 1) // drop second-to-last first, keep the last keyword
    title = `${base}: ${kept.join(', ')}`
  }
  if (title.length > max && kept.length === 1) {
    title = `${base}: ${kept[0]}`
    if (title.length > max) return base
  }
  return title
}

// ── University degree pages ────────────────────────────────────────────────
export function buildUniTitle(uni: UniLike, program: string, year: number, max = 60): string {
  const base = `${getShortName(uni)} Online ${program} ${year}`
  if (isTechProgram(program)) {
    const { label } = getApprovalSignal(uni, program)
    // Deemed uses "& Syllabus", others use "& Specializations" per spec.
    const richTail = uni.uniType === 'deemed' ? 'Fees & Syllabus' : 'Fees & Specializations'
    const richTitle = `${base}: ${label}, ${richTail}`
    if (richTitle.length <= max) return richTitle
    // Slim fallback keeps "Fees" keyword, drops the "&" tail.
    const slimTitle = `${base}: ${label}, Fees`
    return slimTitle.length <= max ? slimTitle : base
  }
  return fitTitle(base, ['Fees', 'Eligibility', 'Admission'], max)
}

export function buildUniDescription(
  uni: UniLike,
  program: string,
  year: number,
  compareCount: number,
  max = 155,
): string {
  if (isTechProgram(program)) return buildTechDescription(uni, program, year, compareCount, max)

  const shortName = getShortName(uni)
  const parts: string[] = []
  if (uni.naac) parts.push(`NAAC ${uni.naac}`)
  const nirf = pickBetterNirf(uni, program)
  if (nirf != null) parts.push(`NIRF #${nirf}`)
  const fee = formatINR(getDisplayFee(uni, program))
  if (fee) parts.push(`Fees ${fee}`)
  const dataPart = parts.length > 0 ? `${parts.join(', ')}. ` : ''
  const desc = `${shortName} ${program} ${year}: ${dataPart}UGC-DEB approved. Independent verification, no commissions. Compare ${compareCount}+ UGC-DEB universities.`
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}

// Tech-program description, branched by uniType.
function buildTechDescription(
  uni: UniLike,
  program: string,
  year: number,
  compareCount: number,
  max: number,
): string {
  const shortName = getShortName(uni)
  const naac = uni.naac ? `NAAC ${uni.naac}` : ''
  const fee = formatINR(getDisplayFee(uni, program))
  const feeStr = fee ? `fees ${fee}` : ''
  const dataParts = [naac, feeStr].filter(Boolean).join(', ')

  let desc: string
  if (uni.uniType === 'deemed') {
    desc = `${shortName} ${program} ${year}: AICTE + UGC-DEB approved Deemed University. ${dataParts}. AI/ML, Cyber, Cloud specs. Independent reviews.`
  } else if (uni.uniType === 'open') {
    desc = `${shortName} ${program} ${year}: UGC-DEB + AICTE approved, ${dataParts}. AI, ML, Cyber, Cloud specializations. Independent comparison, no commissions.`
  } else {
    // private / state-private / state-public / central / unclassified
    desc = `${shortName} ${program} ${year}: ${dataParts}, UGC-DEB approved. AI/ML, Cybersecurity, Cloud specializations. Independent reviews, no commissions.`
  }
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}

// ── Verify pages ───────────────────────────────────────────────────────────
export function buildVerifyTitle(shortName: string, program: string, year: number): string {
  return `Is ${shortName} Online ${program} UGC-DEB Approved? ${year}`
}

export function buildVerifyDescription(shortName: string, year: number, max = 155): string {
  const desc = `Verify ${shortName} UGC-DEB approval, NAAC grade & NIRF rank from official UGC portal. Independent, no commissions. ${year}.`
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}

// ── Compare pair pages ─────────────────────────────────────────────────────
export function buildComparePairTitle(shortA: string, shortB: string, program: string, year: number, max = 60): string {
  const base = `${shortA} vs ${shortB} Online ${program} ${year}`
  return fitTitle(base, ['Fees', 'Reviews & Comparison'], max)
}

export function buildComparePairDescription(shortA: string, shortB: string, program: string, year: number, max = 155): string {
  const desc = `Compare ${shortA} vs ${shortB} ${program}: fees, NIRF rank, NAAC grade & placements. Independent comparison, no paid rankings. ${year}.`
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}

// ── Compare list page (CHANGE 2: drop "Universities" to fit 60 chars) ─────
export function buildCompareListTitle(program: string, year: number): string {
  return `Compare Online ${program} ${year}: Fees, Rankings & Reviews`
}

// ── Best-MBA hub (CHANGE 2: drop "Top" to fit 60 chars) ───────────────────
export function buildBestHubTitle(year: number): string {
  return `Online MBA Colleges in India ${year}: Fees, Rankings & Admission`
}

export function buildBestHubDescription(year: number, max = 155): string {
  const desc = `Top online MBA colleges ${year} ranked by NIRF, NAAC & fees. Independent rankings, no paid placements. UGC-DEB approved universities only.`
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}
