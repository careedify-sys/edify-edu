// lib/seo-title-builder.ts
// Title builders match the competitor-convergent listy-keyword pattern.
// Differentiation lives in meta descriptions, not titles.
// No brand suffix in titles. (Blog posts keep authored seoTitle absolute.)
//
// Patterns:
//   University:       ${shortName} Online ${program} ${year}: Fees, Eligibility, Admission
//   Verify:           Is ${shortName} Online ${program} UGC-DEB Approved? ${year}
//   Compare pair:     ${shortA} vs ${shortB} Online ${program} ${year}: Fees, Reviews & Comparison
//   Compare list:     Compare Online MBA Universities ${year}: Fees, Rankings & Reviews
//   Best-MBA hub:     Top Online MBA Colleges in India ${year}: Fees, Rankings & Admission
//
// Descriptions (≤155 chars) carry the differentiation: NAAC / NIRF / Fees data
// plus "Independent" / "no commissions" / "no paid rankings" trust phrases.

import type { University } from './data'
import { TITLE_NAME, getTitleName } from './seo-title'

export function validNirf(n: number | null | undefined): n is number {
  return typeof n === 'number' && n >= 1 && n <= 100
}

export function formatINR(n: number | null | undefined): string | null {
  if (!n || n <= 0) return null
  if (n < 100000) return `₹${Math.round(n / 1000)}K`
  if (n < 1000000) return `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')}L`
  return `₹${Math.round(n / 100000) / 10}Cr`
}

export type UniLike = Pick<University, 'id' | 'name' | 'abbr' | 'naac' | 'nirf' | 'nirfMgt' | 'feeMin' | 'feeMax' | 'ugc' | 'approvals'>

const IT_PROGRAMS = new Set(['MCA', 'BCA'])

export function pickBetterNirf(uni: UniLike, program: string): number | null {
  if (IT_PROGRAMS.has(program.toUpperCase())) {
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

// Drop an end keyword if needed; never returns over-budget output. Order of
// dropping: "Eligibility" (least search-anchor value) → "Admission" → return base.
function fitTitle(base: string, tail: string[], max: number): string {
  let kept = [...tail]
  let title = `${base}: ${kept.join(', ')}`
  while (title.length > max && kept.length > 1) {
    kept.splice(kept.length - 2, 1) // drop second-to-last first ("Eligibility"), keep last ("Admission")
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
  return fitTitle(base, ['Fees', 'Eligibility', 'Admission'], max)
}

export function buildUniDescription(
  uni: UniLike,
  program: string,
  year: number,
  compareCount: number,
  max = 155,
): string {
  const shortName = getShortName(uni)
  const parts: string[] = []
  if (uni.naac) parts.push(`NAAC ${uni.naac}`)
  const nirf = pickBetterNirf(uni, program)
  if (nirf != null) parts.push(`NIRF #${nirf}`)
  // Display the upper end of the fee range (matches premium specialisations).
  // feeMax falls back to feeMin only when feeMax is 0 / missing.
  const feeValue = uni.feeMax && uni.feeMax > 0 ? uni.feeMax : uni.feeMin
  const fee = formatINR(feeValue)
  if (fee) parts.push(`Fees ${fee}`)
  const dataPart = parts.length > 0 ? `${parts.join(', ')}. ` : ''
  const desc = `${shortName} ${program} ${year}: ${dataPart}UGC-DEB approved. Independent verification, no commissions. Compare with ${compareCount}+ unis.`
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

// ── Compare list page ─────────────────────────────────────────────────────
export function buildCompareListTitle(program: string, year: number): string {
  return `Compare Online ${program} Universities ${year}: Fees, Rankings & Reviews`
}

// ── Best-MBA hub ──────────────────────────────────────────────────────────
export function buildBestHubTitle(year: number): string {
  return `Top Online MBA Colleges in India ${year}: Fees, Rankings & Admission`
}

export function buildBestHubDescription(year: number, max = 155): string {
  // Em dash replaced with comma per house style.
  const desc = `Top online MBA colleges ${year} ranked by NIRF, NAAC & fees. Independent rankings, no paid placements. UGC-DEB approved universities only.`
  if (desc.length <= max) return desc
  return desc.substring(0, max).replace(/\s+\S*$/, '').trim()
}
