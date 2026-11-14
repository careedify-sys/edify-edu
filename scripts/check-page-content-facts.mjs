// scripts/check-page-content-facts.mjs
//
// Fact-sweep validator for lib/data/page-content/, run on every file:
//   1. No broken bold label. A label like "**Senior roles:**  years):**" is
//      what is left when a fixer cuts "(7+ years)" out of
//      "**Senior roles (7+ years):**" and keeps the tail. Any "):**" whose label
//      has no opening bracket fails.
//   2. whoHires lines have balanced round brackets.
//   3. No "N% cheaper" fee comparison. Fees on spec pages come only from
//      lib/data.ts through getDisplayFee/FeeBreakdown; a percentage typed into
//      the JSON goes stale the day either university changes its fee.
//
// Batch 3.1 (2026-11-14) left 103 broken labels on 51 live pages and 25 lines
// of "% cheaper" comparisons in 12 files. See audits/FIX-LOG.md 2026-11-14.
//
// Run: node scripts/check-page-content-facts.mjs [--self-test]
// Wired into: .husky/pre-commit

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'lib', 'data', 'page-content')

// A bold label "**...):**" with no "(" between its opening ** and the ")".
const BROKEN_LABEL = /\*\*[^*(\n]*\):\*\*/
const CHEAPER = /\d+(?:\s*-\s*\d+)?\s*%[^.\n]{0,20}\bcheaper\b/i
const roundBalanced = (s) => { let d = 0; for (const c of s) { if (c === '(') d++; else if (c === ')' && --d < 0) return false } return d === 0 }

function strings(v, path, out) {
  if (typeof v === 'string') out.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out)
  return out
}

function check(file, j) {
  const errs = []
  for (const [path, s] of strings(j.sections, '', [])) {
    const m = s.match(BROKEN_LABEL)
    if (m) errs.push(`${path}: broken label ${JSON.stringify(m[0])}`)
    const c = s.match(CHEAPER)
    if (c) errs.push(`${path}: fee comparison ${JSON.stringify(c[0])}`)
  }
  for (const line of String(j.sections?.whoHires?.body ?? '').split('\n')) {
    if (!roundBalanced(line)) errs.push(`whoHires: unbalanced brackets in ${JSON.stringify(line.slice(0, 90))}`)
  }
  return errs.map(e => `${file}: ${e}`)
}

if (process.argv.includes('--self-test')) {
  const j = { sections: { whoHires: { body: '**Mid-level roles:** 5 years experience):** Manager\n**Senior roles (7+ years):** Director\n**Entry-level roles:** Analyst (HR' }, comparisons: { body: 'Shoolini is 24-28% cheaper with NAAC A+.' } } }
  const errs = check('self-test.json', j)
  // expect: broken label, unbalanced line (the fragment), unbalanced line (Analyst (HR), cheaper
  if (errs.length !== 4) { console.error('check-page-content-facts: self-test FAILED, expected 4 findings, got ' + errs.length + '\n  ' + errs.join('\n  ')); process.exit(1) }
  console.log('check-page-content-facts: self-test OK (4 of 4 injected defects caught, balanced label passed)')
  process.exit(0)
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json'))
const bad = []
for (const f of files) {
  let j
  try { j = JSON.parse(readFileSync(join(DIR, f), 'utf8')) } catch { continue } // check-page-content-json owns parse errors
  bad.push(...check(f, j))
}
if (bad.length) {
  console.error(`check-page-content-facts: FAIL. ${bad.length} finding(s):`)
  for (const b of bad.slice(0, 40)) console.error('  ' + b)
  if (bad.length > 40) console.error(`  ... ${bad.length - 40} more`)
  process.exit(1)
}
console.log(`check-page-content-facts: OK (${files.length} files, no broken labels, no unbalanced whoHires lines, no % cheaper).`)
