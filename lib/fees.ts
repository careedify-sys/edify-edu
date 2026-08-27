// lib/fees.ts
// Single canonical fee source for both hub metadata and on-page fee blocks.
// No component reads pd.fees or feeMin/feeMax directly; everything goes
// through getDisplayFee(uni, program).
//
// Correction sprint (post FIX 2): getDisplayFee now resolves via a 4-rule
// hierarchy that prefers a narrower BACKED number over blanket suppression.
// A missing fee is worse for CTR than a slightly wider or "from ₹X" fee,
// so we only suppress when the data really cannot back any number.
//
//   Rule 1 (`range`)  : pd.fees and reference agree within 10% tolerance.
//                       Display pd.fees range as-is.
//   Rule 2 (`from`)   : pd.fees is single value, reference is a wider range,
//                       single value is within 25% of ref lower bound.
//                       Display "From ₹X" using the pd.fees value. Never
//                       print the unbacked upper bound.
//   Rule 3 (`narrower`): pd.fees is a narrower range that sits inside the
//                       reference range (within tolerance on both bounds).
//                       Display pd.fees range. Never print the wider ref max.
//   Rule 4 (suppress) : Fires only when
//                       4a. pd.fees range spans more than 3x (placeholder),
//                       4b. pd.fees and reference diverge by more than 25%
//                           with no way to tell which is right (single vs
//                           single mismatch, or both ranges with big drift).
//                       Caller shows counsellor CTA, no number.

import type { University, Program, ProgramDetail } from './data'

export type FeeMode = 'range' | 'from' | 'narrower'

export interface FeeDisplay {
  ok: boolean
  mode?: FeeMode
  compact?: string      // for titles: "₹76K-₹86K" / "From ₹76,200" / "₹1.2L"
  range?: string        // for body copy: "₹76,200 to ₹86,400" / "from ₹76,200"
  min?: number
  max?: number
  rule?: 1 | 2 | 3 | '4a' | '4b' | '4c'
  reason?: string
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
  rule: '4a' | '4b' | '4c'
  reason: string
}

const TOLERANCE_ABS = 5000
const TOLERANCE_PCT = 0.10
const DIVERGENCE_PCT = 0.25
const SUSPICIOUS_RANGE_RATIO = 3.0

// Rule 4c floor. No UGC-DEB programme in our data costs less than this for a
// full degree (the cheapest verified is a state-university B.Com at ₹12,000),
// so anything under it is an authoring placeholder such as "₹0K" or "₹1K"
// rather than a real fee. Suppressing sends the page to the counsellor CTA
// instead of publishing "₹0" as the price.
const MIN_CREDIBLE_FEE = 5000

// Parse "₹76.2K", "₹1.18L - ₹1.3L", "₹66,000" into {min, max}. Returns null
// when the input is not a recognisable fee string.
export function parseFeeStr(s: string): { min: number; max: number } | null {
  if (!s) return null
  const cleaned = s.replace(/₹|Rs\.?|\s|,|\+/gi, '')
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

function fmtIndianShort(n: number): string {
  if (n >= 100000) {
    const l = n / 100000
    const rounded = Math.round(l * 100) / 100
    return `₹${String(rounded).replace(/\.?0+$/, '')}L`
  }
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtIndianFull(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

function makeCompactRange(min: number, max: number): string {
  // Single-value fees keep precision: full comma format for sub-lakh (e.g.
  // "₹83,200"), L-suffix for lakhs and above (e.g. "₹1.77L"). Range fees
  // stay in the shorter K/L notation on both sides so ranges never overflow.
  if (min === max) {
    return min >= 100000 ? fmtIndianShort(min) : fmtIndianFull(min)
  }
  return `${fmtIndianShort(min)}-${fmtIndianShort(max)}`
}

function makeFullRange(min: number, max: number): string {
  return min === max ? fmtIndianFull(min) : `${fmtIndianFull(min)} to ${fmtIndianFull(max)}`
}

interface Ref { min: number; max: number; label: string }

function getReference(u: University, program: Program): Ref | null {
  const pf = (u as unknown as { programFees?: Record<string, { fee?: number }> }).programFees
  const perProgram = pf?.[program.toLowerCase()]?.fee
  if (typeof perProgram === 'number' && perProgram > 0) {
    return { min: perProgram, max: perProgram, label: `programFees.${program.toLowerCase()} ${perProgram}` }
  }
  // No fee on record yet. Never synthesise a reference from a zero.
  if (!u.feeMin || u.feeMin <= 0) return null
  if (program === 'MBA') {
    // Skip the MBA placeholder feeMin=60000 / feeMax=200000 which appears on
    // dozens of state/central-university rows; that isn't per-programme data.
    const isPlaceholder = u.feeMin === 60000 && (u.feeMax || u.feeMin) === 200000
    if (!isPlaceholder) {
      return { min: u.feeMin, max: u.feeMax || u.feeMin, label: `feeMin/feeMax ${u.feeMin}-${u.feeMax || u.feeMin}` }
    }
  }
  return null
}

// The one canonical fee source. See file header for rule hierarchy.
export function getDisplayFee(u: University, program: Program): FeeDisplay {
  const pd = u.programDetails[program] as ProgramDetail | undefined
  const parsed = pd?.fees ? parseFeeStr(pd.fees) : null

  // Rule 4c: plausibility. Catches authoring placeholders that would otherwise
  // reach the page as a real price: "₹TBD" (no digits, previously passed
  // through verbatim) and "₹0K" / "₹1K" (parse cleanly to an absurd number).
  if (pd?.fees) {
    if (!/\d/.test(pd.fees)) {
      return { ok: false, rule: '4c', reason: `pd.fees "${pd.fees}" contains no number, authoring placeholder` }
    }
    if (parsed && parsed.min < MIN_CREDIBLE_FEE) {
      return { ok: false, rule: '4c', reason: `pd.fees "${pd.fees}" is below the credible floor of ₹${MIN_CREDIBLE_FEE}` }
    }
  }

  // Rule 4a: width sanity — pd.fees range spans > 3x → suppress.
  if (parsed && parsed.min > 0 && parsed.max / parsed.min > SUSPICIOUS_RANGE_RATIO) {
    return {
      ok: false,
      rule: '4a',
      reason: `pd.fees "${pd?.fees}" spans ${(parsed.max / parsed.min).toFixed(1)}x, placeholder or stale range`,
    }
  }

  const ref = getReference(u, program)

  // No parseable pd.fees.
  if (!parsed) {
    if (ref) {
      return {
        ok: true, mode: 'range', rule: 1,
        compact: makeCompactRange(ref.min, ref.max),
        range: makeFullRange(ref.min, ref.max),
        min: ref.min, max: ref.max,
      }
    }
    if (pd?.fees) {
      // Pass through unparseable but presumably-authored copy.
      return { ok: true, mode: 'range', rule: 1, compact: pd.fees, range: pd.fees }
    }
    return { ok: false, rule: '4b', reason: 'no pd.fees, no reference source' }
  }

  // pd.fees parsed but no reference — trust pd.fees.
  if (!ref) {
    return {
      ok: true, mode: 'range', rule: 1,
      compact: makeCompactRange(parsed.min, parsed.max),
      range: makeFullRange(parsed.min, parsed.max),
      min: parsed.min, max: parsed.max,
    }
  }

  const minDiffPct = Math.abs(parsed.min - ref.min) / Math.max(ref.min, 1)
  const maxDiffPct = Math.abs(parsed.max - ref.max) / Math.max(ref.max, 1)

  // Rule 1: agreement within 10% tolerance → display pd.fees range.
  if (minDiffPct <= TOLERANCE_PCT && maxDiffPct <= TOLERANCE_PCT) {
    return {
      ok: true, mode: 'range', rule: 1,
      compact: makeCompactRange(parsed.min, parsed.max),
      range: makeFullRange(parsed.min, parsed.max),
      min: parsed.min, max: parsed.max,
    }
  }

  // Rule 2: pd.fees single + ref range + single within 25% of ref lower.
  if (parsed.min === parsed.max && ref.min !== ref.max) {
    const singleDiffPct = Math.abs(parsed.min - ref.min) / Math.max(ref.min, 1)
    if (singleDiffPct <= DIVERGENCE_PCT) {
      return {
        ok: true, mode: 'from', rule: 2,
        compact: `From ${fmtIndianShort(parsed.min)}`,
        range: `from ${fmtIndianFull(parsed.min)}`,
        min: parsed.min, max: parsed.min,
      }
    }
  }

  // Rule 3: pd.fees is a narrower range that sits inside the reference range.
  const parsedIsRange = parsed.min !== parsed.max
  const insideRefLower = parsed.min >= ref.min - tol(ref.min)
  const insideRefUpper = parsed.max <= ref.max + tol(ref.max)
  const narrowerThanRef = parsed.min > ref.min || parsed.max < ref.max
  if (parsedIsRange && insideRefLower && insideRefUpper && narrowerThanRef) {
    return {
      ok: true, mode: 'narrower', rule: 3,
      compact: makeCompactRange(parsed.min, parsed.max),
      range: makeFullRange(parsed.min, parsed.max),
      min: parsed.min, max: parsed.max,
    }
  }

  // Rule 4b: bigger than 25% divergence with no rule 1/2/3 fit → suppress.
  if (minDiffPct > DIVERGENCE_PCT || maxDiffPct > DIVERGENCE_PCT) {
    return {
      ok: false, rule: '4b',
      reason: `pd.fees "${pd?.fees}" (${parsed.min}-${parsed.max}) diverges from ${ref.label} by >25%`,
    }
  }

  // 10-25% drift with no rule 2/3 fit — per-programme pd.fees is more
  // reliable than uni-wide reference, so trust it.
  return {
    ok: true, mode: 'range', rule: 1,
    compact: makeCompactRange(parsed.min, parsed.max),
    range: makeFullRange(parsed.min, parsed.max),
    min: parsed.min, max: parsed.max,
  }
}

// Return every uni x program where getDisplayFee fell through to suppression
// (rules 4a or 4b), including rows without any pd.fees value. Matches the
// tallyFeeRules totals used by the pre-commit baseline check.
export function findAllFeeMismatches(universities: University[]): FeeMismatch[] {
  const mismatches: FeeMismatch[] = []
  for (const u of universities) {
    for (const program of u.programs) {
      const display = getDisplayFee(u, program)
      if (display.ok) continue
      const pd = u.programDetails[program]
      const parsed = pd?.fees ? parseFeeStr(pd.fees) : null
      mismatches.push({
        universityId: u.id,
        universityName: u.name,
        program,
        pdFees: pd?.fees ?? '',
        feeMin: u.feeMin,
        feeMax: u.feeMax || u.feeMin,
        parsedMin: parsed?.min ?? 0,
        parsedMax: parsed?.max ?? 0,
        rule: (display.rule as '4a' | '4b' | '4c'),
        reason: display.reason ?? '',
      })
    }
  }
  return mismatches
}

// Bucket counts across the whole dataset (for the sprint verification report).
export function tallyFeeRules(universities: University[]) {
  const buckets = { rule1: 0, rule2: 0, rule3: 0, rule4a: 0, rule4b: 0, noData: 0 }
  for (const u of universities) {
    for (const program of u.programs) {
      const display = getDisplayFee(u, program)
      if (!display.ok) {
        if (display.rule === '4a') buckets.rule4a++
        else if (display.rule === '4b') buckets.rule4b++
        else buckets.noData++
      } else {
        if (display.rule === 1) buckets.rule1++
        else if (display.rule === 2) buckets.rule2++
        else if (display.rule === 3) buckets.rule3++
      }
    }
  }
  return buckets
}
