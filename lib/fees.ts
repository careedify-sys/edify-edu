// lib/fees.ts
// Sprint 1 FIX 2. Single canonical fee source for BOTH the title/meta
// generator AND on-page fee blocks (FeeBreakdown, hero, etc.).
//
// Rule: no component reads pd.fees or feeMin/feeMax directly for display.
// Everything goes through getDisplayFee(uni, program).
//
// The helper returns { ok: false } when pd.fees for the requested program
// diverges materially from feeMin/feeMax on the same University object.
// Callers must interpret ok=false as "suppress the fee everywhere; show
// counsellor CTA instead" (Kurukshetra BBA is the current known case).

import type { University, Program, ProgramDetail } from './data'

export interface FeeDisplay {
  ok: boolean
  compact?: string   // for titles: "₹76K-₹86K" or "₹1.2L"
  range?: string     // for on-page copy: "₹76,200 to ₹86,400"
  min?: number
  max?: number
  reason?: string    // populated on ok=false with the specific mismatch
}

export interface FeeMismatch {
  universityId: string
  universityName: string
  program: Program
  pdFees: string
  feeMin: number
  feeMax: number
  parsedMin: number
  parsedMax: number
  reason: string
}

const TOLERANCE_ABS = 5000    // ₹5,000 absolute tolerance for rounding
const TOLERANCE_PCT = 0.10    // 10% relative tolerance

// Parse a pd.fees string like "₹76.2K", "₹1.18L - ₹1.3L", "₹66,000" into
// {min, max} in rupees. Returns null if the string cannot be parsed.
export function parseFeeStr(s: string): { min: number; max: number } | null {
  if (!s) return null
  // Normalise: drop ₹, whitespace, commas, trailing +.
  const cleaned = s.replace(/₹|Rs\.?|\s|,|\+/gi, '')
  // Split on en/em/hyphen dash.
  const parts = cleaned.split(/[–—-]/)
  if (parts.length === 0 || parts.length > 2) return null
  const parseOne = (p: string): number | null => {
    const m = p.match(/^([\d.]+)([KL]?)$/i)
    if (!m) return null
    const n = parseFloat(m[1])
    if (isNaN(n)) return null
    const suf = m[2].toUpperCase()
    if (suf === 'K') return Math.round(n * 1000)
    if (suf === 'L') return Math.round(n * 100000)
    return Math.round(n)
  }
  const min = parseOne(parts[0])
  const max = parts.length === 2 ? parseOne(parts[1]) : min
  if (min == null || max == null) return null
  return { min, max }
}

function tol(n: number): number {
  return Math.max(TOLERANCE_ABS, n * TOLERANCE_PCT)
}

// True if pd.fees for `program` on `u` agrees with the program's canonical
// numeric source within tolerance. The canonical source is:
//   - u.programFees[program].fee when present (per-program authoritative)
//   - u.feeMin / u.feeMax otherwise (uni-wide, MBA-anchored on most rows)
//
// Because feeMin/feeMax is MBA-anchored on almost every University row,
// cross-checking non-MBA pd.fees against feeMin/feeMax produces a flood
// of false positives (BBA/BCA legitimately cost less than MBA). We only
// enforce consistency in two scenarios:
//   1. program === 'MBA' — pd.fees vs feeMin/feeMax must agree
//   2. programFees[program].fee present — pd.fees must agree with that
//
// Everything else returns ok:true and defers to pd.fees as authoritative.
const SUSPICIOUS_RANGE_RATIO = 3.0

export function checkFeeConsistency(u: University, program: Program):
  { ok: true } | { ok: false; reason: string; parsedMin: number; parsedMax: number }
{
  const pd = u.programDetails[program] as ProgramDetail | undefined
  if (!pd?.fees) return { ok: true }
  const parsed = parseFeeStr(pd.fees)
  if (!parsed) return { ok: true }

  // Width sanity check catches ranges like "₹60K - ₹200K" where the
  // authored max is more than 3x the authored min. Real online-degree
  // fee ranges rarely span >3x within one programme; wider ranges are
  // usually stale or wrong data (e.g. Kurukshetra BBA case). Flag so
  // the display suppresses the number rather than shipping the range.
  if (parsed.min > 0 && parsed.max / parsed.min > SUSPICIOUS_RANGE_RATIO) {
    return {
      ok: false,
      reason: `pd.fees "${pd.fees}" spans ${(parsed.max / parsed.min).toFixed(1)}x (>${SUSPICIOUS_RANGE_RATIO}x), suspicious`,
      parsedMin: parsed.min,
      parsedMax: parsed.max,
    }
  }

  const pf = (u as unknown as { programFees?: Record<string, { fee?: number }> }).programFees
  const perProgram = pf?.[program.toLowerCase()]?.fee

  // A large group of state/central-university rows in data.ts carries the
  // default placeholder feeMin=60000 / feeMax=200000 for MBA. That is not
  // a per-programme figure and should not be cross-checked against
  // pd.fees. Detect and skip.
  const isPlaceholderMBAFee = u.feeMin === 60000 && (u.feeMax || u.feeMin) === 200000

  let refMin: number
  let refMax: number
  let refLabel: string
  if (typeof perProgram === 'number' && perProgram > 0) {
    refMin = perProgram
    refMax = perProgram
    refLabel = `programFees.${program.toLowerCase()} ${perProgram}`
  } else if (program === 'MBA' && !isPlaceholderMBAFee) {
    refMin = u.feeMin
    refMax = u.feeMax || u.feeMin
    refLabel = `feeMin/feeMax ${refMin}-${refMax}`
  } else {
    return { ok: true }
  }

  const minDiff = Math.abs(parsed.min - refMin)
  const maxDiff = Math.abs(parsed.max - refMax)
  if (minDiff > tol(refMin) || maxDiff > tol(refMax)) {
    return {
      ok: false,
      reason: `pd.fees "${pd.fees}" (${parsed.min}-${parsed.max}) vs ${refLabel}`,
      parsedMin: parsed.min,
      parsedMax: parsed.max,
    }
  }
  return { ok: true }
}

function fmtIndianShort(n: number): string {
  if (n >= 100000) {
    const l = n / 100000
    const rounded = Math.round(l * 100) / 100
    // Trim trailing zeros: 1.20 -> 1.2, 3.00 -> 3
    return `₹${String(rounded).replace(/\.?0+$/, '')}L`
  }
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtIndianFull(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

function makeCompactRange(min: number, max: number): string {
  return min === max ? fmtIndianShort(min) : `${fmtIndianShort(min)}-${fmtIndianShort(max)}`
}

function makeFullRange(min: number, max: number): string {
  return min === max ? fmtIndianFull(min) : `${fmtIndianFull(min)} to ${fmtIndianFull(max)}`
}

// The one canonical fee source. All display code must call this.
//
// Resolution order:
//   1. If checkFeeConsistency fails, ok:false (caller must suppress display).
//   2. u.programFees[program].fee (per-program authoritative).
//   3. For MBA: u.feeMin / u.feeMax (uni-wide, MBA-anchored).
//   4. For other programs: parse pd.fees (per-program authoritative fallback).
//   5. Nothing usable: ok:false.
export function getDisplayFee(u: University, program: Program): FeeDisplay {
  const check = checkFeeConsistency(u, program)
  if (!check.ok) return { ok: false, reason: check.reason }

  const pf = (u as unknown as { programFees?: Record<string, { fee?: number }> }).programFees
  const perProgram = pf?.[program.toLowerCase()]?.fee
  if (typeof perProgram === 'number' && perProgram > 0) {
    return {
      ok: true,
      compact: fmtIndianShort(perProgram),
      range: fmtIndianFull(perProgram),
      min: perProgram,
      max: perProgram,
    }
  }

  if (program === 'MBA') {
    const isPlaceholderMBAFee = u.feeMin === 60000 && (u.feeMax || u.feeMin) === 200000
    if (!isPlaceholderMBAFee) {
      const min = u.feeMin
      const max = u.feeMax || u.feeMin
      return {
        ok: true,
        compact: makeCompactRange(min, max),
        range: makeFullRange(min, max),
        min,
        max,
      }
    }
    // Placeholder MBA feeMin/feeMax: fall through to pd.fees parse below.
  }

  const pd = u.programDetails[program]
  const parsed = pd?.fees ? parseFeeStr(pd.fees) : null
  if (parsed) {
    return {
      ok: true,
      compact: makeCompactRange(parsed.min, parsed.max),
      range: makeFullRange(parsed.min, parsed.max),
      min: parsed.min,
      max: parsed.max,
    }
  }
  return { ok: false, reason: 'no per-program fee source available' }
}

// Return every uni x program where pd.fees disagrees with feeMin/feeMax.
export function findAllFeeMismatches(universities: University[]): FeeMismatch[] {
  const mismatches: FeeMismatch[] = []
  for (const u of universities) {
    for (const program of u.programs) {
      const pd = u.programDetails[program]
      if (!pd?.fees) continue
      const check = checkFeeConsistency(u, program)
      if (check.ok) continue
      const parsed = parseFeeStr(pd.fees)
      mismatches.push({
        universityId: u.id,
        universityName: u.name,
        program,
        pdFees: pd.fees,
        feeMin: u.feeMin,
        feeMax: u.feeMax || u.feeMin,
        parsedMin: parsed?.min ?? 0,
        parsedMax: parsed?.max ?? 0,
        reason: check.reason,
      })
    }
  }
  return mismatches
}
