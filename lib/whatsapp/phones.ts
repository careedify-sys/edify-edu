// Indian mobile numbers from pasted text, CSV and Excel cells.
//
// Rules (Rishi, 27 Nov 2026): phone is the only required field; normalise to
// +91XXXXXXXXXX; flag ambiguous or corrupted values instead of guessing. A
// valid format says nothing about whether the number has WhatsApp.
//
// Runs in the browser (file preview) and on the server (the authoritative
// check before anything is stored), so it has no imports.

export type InvalidReason = 'letters' | 'too_short' | 'too_long' | 'not_mobile' | 'not_indian' | 'decimal'
export type AmbiguousReason = 'scientific_notation' | 'several_numbers' | 'spaced_digits' | 'repeated_digits'

export type PhoneVerdict =
  | { kind: 'valid'; e164: string; raw: string }
  | { kind: 'invalid'; raw: string; reason: InvalidReason }
  | { kind: 'ambiguous'; raw: string; reason: AmbiguousReason }

export const REASON_TEXT: Record<InvalidReason | AmbiguousReason, string> = {
  letters: 'Contains letters',
  too_short: 'Too few digits',
  too_long: 'Too many digits',
  not_mobile: 'Not an Indian mobile number (must start with 6, 7, 8 or 9)',
  not_indian: 'Not an Indian (+91) number',
  decimal: 'Has a decimal part',
  scientific_notation: 'Excel shortened this number (for example 9.19877E+11), so digits are missing. Fix the column format in Excel and export again',
  several_numbers: 'More than one number in one cell',
  spaced_digits: 'Digits split by spaces in a way that could be one number or two',
  repeated_digits: 'Same digit repeated, looks like a placeholder',
}

const MOBILE = /^[6-9]\d{9}$/

// Expand Excel scientific notation only when every digit is present. Excel
// shows 6 significant digits by default (9.19877E+11), which loses the rest.
function expandScientific(s: string): string | null {
  const m = /^([+-]?)(\d+)(?:\.(\d+))?[eE]\+?(\d+)$/.exec(s)
  if (!m || m[1] === '-') return null
  const intPart = m[2], frac = m[3] ?? '', exp = Number(m[4])
  if (exp > 20) return null
  const mantissa = (intPart + frac).replace(/^0+/, '')
  const totalDigits = intPart.replace(/^0+/, '').length + exp
  const significant = mantissa.replace(/0+$/, '')
  // Every digit up to the last non-zero must be shown; trailing zeros are
  // exact only if the mantissa itself carries enough digits.
  if (frac.length > exp) return null
  if (mantissa.length < totalDigits && significant.length === mantissa.length) return null
  return (intPart + frac).padEnd(intPart.length + exp, '0').replace(/^0+(?=\d)/, '')
}

export function normaliseIndianMobile(input: string): PhoneVerdict {
  const raw = String(input ?? '')
  let s = raw.replace(/[  -​ ⁠﻿]/g, ' ').trim()
  s = s.replace(/^['"]+|['"]+$/g, '').trim() // Excel text marker and quotes

  if (/^[+-]?\d+(?:\.\d+)?[eE][+-]?\d+$/.test(s)) {
    const expanded = expandScientific(s)
    if (expanded === null) return { kind: 'ambiguous', raw, reason: 'scientific_notation' }
    s = expanded
  }
  if (/[\/|&]|\bor\b/i.test(s)) {
    const parts = s.split(/[\/|&]|\bor\b/i).map(p => p.trim()).filter(Boolean)
    if (parts.length > 1 && parts.filter(p => normaliseIndianMobile(p).kind === 'valid').length > 1) {
      return { kind: 'ambiguous', raw, reason: 'several_numbers' }
    }
  }
  if (/[a-z]/i.test(s)) return { kind: 'invalid', raw, reason: 'letters' }
  // Excel numeric cell written as text: 9876543210.0
  const dec = /^(\+?\d+)\.(\d+)$/.exec(s)
  if (dec) {
    if (/^0+$/.test(dec[2])) s = dec[1]
    // 98765.43210 is a number written with a dot; 9876543210.5 is a decimal.
    else if (dec[1].replace(/\D/g, '').length >= 10) return { kind: 'invalid', raw, reason: 'decimal' }
  }
  const plus = s.startsWith('+')
  let d = s.replace(/[^\d]/g, '')
  if (d.length === 0) return { kind: 'invalid', raw, reason: 'too_short' }

  if (plus) {
    if (!d.startsWith('91')) return { kind: 'invalid', raw, reason: 'not_indian' }
    d = d.slice(2)
  } else if (d.length === 14 && d.startsWith('0091')) {
    d = d.slice(4)
  } else if (d.length === 12 && d.startsWith('91')) {
    d = d.slice(2)
  } else if (d.length === 11 && d.startsWith('0')) {
    d = d.slice(1)
  }
  if (d.length < 10) return { kind: 'invalid', raw, reason: 'too_short' }
  if (d.length > 10) return { kind: 'invalid', raw, reason: 'too_long' }
  if (!MOBILE.test(d)) return { kind: 'invalid', raw, reason: 'not_mobile' }
  if (/^(\d)\1{9}$/.test(d)) return { kind: 'ambiguous', raw, reason: 'repeated_digits' }
  return { kind: 'valid', e164: '+91' + d, raw }
}

// ── Pasted text ──────────────────────────────────────────────────────────────
// Separators: new lines, commas, tabs, semicolons, pipes (cells copied from
// Excel arrive as tabs and new lines). Spaces separate numbers only when
// every space-separated piece is a whole number on its own; "98765 43210" is
// one number, "9876543210 9123456789" is two, "98765 43210 91234" is flagged.
export type Token = { raw: string; spaced?: true }

export function splitPasted(text: string): Token[] {
  const out: Token[] = []
  for (const piece of String(text ?? '').replace(/\r\n?/g, '\n').split(/[\n,;\t|]+/)) {
    const p = piece.trim()
    if (!p) continue
    if (!/\s/.test(p)) { out.push({ raw: p }); continue }
    const compact = p.replace(/\s+/g, '')
    if (/^\+?\d{10,14}$/.test(compact) && normaliseIndianMobile(compact).kind === 'valid') {
      // One number written with spaces, unless the pieces are each whole numbers.
      const words = p.split(/\s+/)
      if (words.length > 1 && words.every(w => normaliseIndianMobile(w).kind === 'valid')) {
        for (const w of words) out.push({ raw: w })
      } else {
        out.push({ raw: p })
      }
      continue
    }
    const words = p.split(/\s+/)
    if (words.every(w => normaliseIndianMobile(w).kind === 'valid' || !/\d/.test(w))) {
      for (const w of words) out.push({ raw: w })
    } else {
      out.push({ raw: p, spaced: true })
    }
  }
  return out
}

// ── Summary of one import (before the database is asked) ─────────────────────
export type ImportSummary = {
  total: number          // values that contain at least one digit
  ignored: number        // values with no digits (headings, labels)
  valid: number          // unique valid numbers
  duplicates: number     // repeats of a valid number inside this import
  invalid: Array<{ raw: string; reason: InvalidReason }>
  ambiguous: Array<{ raw: string; reason: AmbiguousReason }>
  numbers: string[]      // unique +91 numbers, in first-seen order
}

export const MAX_IMPORT_VALUES = 20_000

export function summarise(values: Array<string | Token>): ImportSummary {
  const sum: ImportSummary = { total: 0, ignored: 0, valid: 0, duplicates: 0, invalid: [], ambiguous: [], numbers: [] }
  const seen = new Set<string>()
  for (const v of values) {
    const tok: Token = typeof v === 'string' ? { raw: v } : v
    if (!/\d/.test(tok.raw)) { if (tok.raw.trim()) sum.ignored++; continue }
    sum.total++
    if (tok.spaced) { sum.ambiguous.push({ raw: tok.raw, reason: 'spaced_digits' }); continue }
    const r = normaliseIndianMobile(tok.raw)
    if (r.kind === 'invalid') sum.invalid.push({ raw: r.raw, reason: r.reason })
    else if (r.kind === 'ambiguous') sum.ambiguous.push({ raw: r.raw, reason: r.reason })
    else if (seen.has(r.e164)) sum.duplicates++
    else { seen.add(r.e164); sum.numbers.push(r.e164) }
  }
  sum.valid = sum.numbers.length
  return sum
}

// ── Picking the phone column in a sheet ──────────────────────────────────────
const HEADER_WORDS = /phone|mobile|mob\b|contact|number|whats\s*app|cell|tel/i

export type ColumnGuess = { column: number | null; hasHeader: boolean; scores: number[] }

export function detectPhoneColumn(rows: string[][], sample = 200): ColumnGuess {
  const width = Math.min(50, rows.reduce((m, r) => Math.max(m, r.length), 0))
  if (width === 0) return { column: null, hasHeader: false, scores: [] }
  const first = rows[0] ?? []
  const hasHeader = first.some(c => HEADER_WORDS.test(c ?? '') && !/\d{6,}/.test(c ?? ''))
    || first.every(c => !/\d/.test(c ?? ''))
  const body = rows.slice(hasHeader ? 1 : 0, (hasHeader ? 1 : 0) + sample)
  const scores: number[] = []
  for (let c = 0; c < width; c++) {
    let filled = 0, good = 0
    for (const r of body) {
      const v = (r[c] ?? '').trim()
      if (!v) continue
      filled++
      const k = normaliseIndianMobile(v).kind
      if (k === 'valid' || k === 'ambiguous') good++
    }
    scores.push(filled ? good / filled : 0)
  }
  let best: number | null = null
  for (let c = 0; c < width; c++) if (scores[c] >= 0.5 && (best === null || scores[c] > scores[best])) best = c
  // A heading that names the phone column wins a tie.
  if (hasHeader) {
    const named = first.findIndex((h, i) => HEADER_WORDS.test(h ?? '') && scores[i] >= 0.5)
    if (named >= 0 && best !== null && scores[named] === scores[best]) best = named
  }
  return { column: best, hasHeader, scores }
}

// ── CSV export, safe for Excel ───────────────────────────────────────────────
// A cell starting with = + - @ (or tab / CR) is a formula when Excel opens the
// file. Prefixing an apostrophe makes it text. Phone numbers start with "+",
// so they are guarded too and still read correctly.
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
