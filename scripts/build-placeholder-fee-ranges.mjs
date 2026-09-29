#!/usr/bin/env node
// scripts/build-placeholder-fee-ranges.mjs
//
// Finds fee RANGES that more than one university claims identically, and
// writes them to data/placeholder-fee-ranges.json for lib/fees.ts rule 4d.
//
// Why a range shared across universities is not a fee. A range is two numbers.
// Two institutions independently publishing the same minimum AND the same
// maximum is not plausible, and the data says it is not what happened:
// **nine universities carry the byte-identical string "₹48K – ₹117K"** for MA,
// seven carry "₹52K – ₹125K" for M.Com, and five carry "₹75K – ₹180K" for MBA.
// That is one placeholder copied down a column.
//
// Why the existing guards missed it. SUSPICIOUS_RANGE_RATIO rejects a range
// wider than 3x its own floor. 117000/48000 is 2.4x, so it passed, and the
// fee reached the page as that university's price. The ratio test measures
// width. It cannot see duplication, which is what actually gives a placeholder
// away. See feedback_placeholder_fee_fingerprint.
//
// Single values are deliberately NOT collected. Thirteen universities printing
// "₹1.2L" is weak evidence: a round number is a plausible thing for many
// institutions to charge. Suppressing those would discard real data to remove
// a coincidence. Ranges are the fingerprint; single values are not.
//
// Run:   node scripts/build-placeholder-fee-ranges.mjs
//        node scripts/build-placeholder-fee-ranges.mjs --check   (pre-commit)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { parseFeeStr } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data', 'placeholder-fee-ranges.json')
const CHECK = process.argv.includes('--check')

// Two is enough. The asymmetry of harm decides it: suppressing a real fee
// costs a "Not published" cell and a link to the university's portal, while
// printing a placeholder invites someone to plan money around a number nobody
// charges. A genuine two-way collision loses very little; a fabricated one
// reaching the comparison table costs the reader.
const MIN_UNIVERSITIES = 2

const PROGRAMS = ['MBA', 'MCA', 'BBA', 'BCA', 'M.Com', 'MA', 'B.Com', 'MSc', 'BSc', 'BA']

// Collect every authored programme-level fee that parses to a RANGE.
const byRange = new Map()
for (const u of UNIVERSITIES) {
  for (const prog of PROGRAMS) {
    const raw = u.programDetails?.[prog]?.fees
    if (!raw) continue
    const parsed = parseFeeStr(String(raw))
    if (!parsed || !parsed.min || !parsed.max) continue
    if (parsed.min === parsed.max) continue          // single value, not a range
    const key = `${parsed.min}-${parsed.max}`
    if (!byRange.has(key)) byRange.set(key, { min: parsed.min, max: parsed.max, unis: new Set(), progs: new Set() })
    const e = byRange.get(key)
    e.unis.add(u.id)
    e.progs.add(prog)
  }
}

const ranges = [...byRange.values()]
  .filter(e => e.unis.size >= MIN_UNIVERSITIES)
  .map(e => ({
    min: e.min,
    max: e.max,
    universities: [...e.unis].sort(),
    programmes: [...e.progs].sort(),
  }))
  .sort((a, b) => b.universities.length - a.universities.length || a.min - b.min)

const rows = ranges.reduce((n, r) => n + r.universities.length, 0)
const body = JSON.stringify({
  note: 'Fee ranges claimed identically by two or more universities. A range is two numbers; identical independent authorship is not plausible, so these are treated as bulk-authored placeholders and suppressed by lib/fees.ts rule 4d. Regenerate with scripts/build-placeholder-fee-ranges.mjs. Single values are deliberately excluded, see that script for why.',
  generatedAt: new Date().toISOString().slice(0, 10),
  minUniversities: MIN_UNIVERSITIES,
  rangeCount: ranges.length,
  affectedRows: rows,
  ranges,
}, null, 2) + '\n'

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : ''
  const strip = s => s.replace(/"generatedAt": "[^"]*",?\n/, '')
  if (strip(current.trim()) !== strip(body.trim())) {
    console.error('check-placeholder-fee-ranges: data/placeholder-fee-ranges.json is stale.')
    console.error('  Regenerate: node scripts/build-placeholder-fee-ranges.mjs')
    process.exit(1)
  }
  console.log(`check-placeholder-fee-ranges: OK (${ranges.length} shared ranges covering ${rows} programme rows).`)
  process.exit(0)
}

writeFileSync(OUT, body, 'utf8')
console.log(`build-placeholder-fee-ranges: ${ranges.length} shared ranges covering ${rows} programme rows.`)
for (const r of ranges.slice(0, 8)) {
  console.log(`  ${String(r.universities.length).padStart(2)} unis  ${r.min}-${r.max}  [${r.programmes.join(', ')}]`)
}
