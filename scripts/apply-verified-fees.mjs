// scripts/apply-verified-fees.mjs
// Sprint 2 fee-backfill ingest / validator.
//
// Reads data/fee-backfill-worklist.csv, pulls every row whose VERIFIED_TOTAL_FEE
// column is populated with a positive integer, and asserts that lib/data.ts now
// resolves that same uni x programme via getDisplayFee() to a Rule 1/2/3 pass
// (i.e. no longer suppressed) and that the resolved value agrees with the
// verified total within the tolerance the rule engine already uses.
//
// This is a validator, not a code writer: the actual data.ts edits are done
// in the source and committed alongside the CSV. Running this script confirms
// the ingest landed correctly and flags any drift.
//
// Rows with INTENTIONALLY BLANK or REMOVED in SOURCE_NOTE are skipped.
//
// Exit code: number of rows that failed validation. 0 means clean.
//
// Run: node scripts/apply-verified-fees.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSV  = join(ROOT, 'data', 'fee-backfill-worklist.csv')

function parseCsv(txt) {
  // Minimal parser: handles quoted values with commas and escaped quotes.
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i]
    if (q) {
      if (c === '"' && txt[i+1] === '"') { cell += '"'; i++ }
      else if (c === '"') q = false
      else cell += c
    } else {
      if (c === '"') q = true
      else if (c === ',') { row.push(cell); cell = '' }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
      else if (c === '\r') { /* skip */ }
      else cell += c
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(v => v.length))
}

const rows = parseCsv(readFileSync(CSV, 'utf8'))
const header = rows.shift()
const col = k => header.indexOf(k)

const results = { validated: 0, drift: 0, skipped: 0, missing: 0 }
const failures = []

for (const r of rows) {
  const slug = r[col('university_slug')]
  const prog = r[col('program')]
  const verifiedTotalRaw = r[col('VERIFIED_TOTAL_FEE')].trim()
  const note = r[col('SOURCE_NOTE')] || ''

  if (!verifiedTotalRaw) {
    if (/INTENTIONALLY BLANK|REMOVED/i.test(note)) results.skipped++
    continue
  }
  const verifiedTotal = parseInt(verifiedTotalRaw, 10)
  if (!verifiedTotal) continue

  const u = UNIVERSITIES.find(x => x.id === slug)
  if (!u) {
    results.missing++
    failures.push(`MISSING: ${slug}|${prog} — university not in data.ts`)
    continue
  }
  if (!u.programs.includes(prog)) {
    results.missing++
    failures.push(`MISSING: ${slug}|${prog} — programme not in university.programs (${u.programs.join(',')})`)
    continue
  }

  const disp = getDisplayFee(u, prog)
  if (!disp.ok) {
    results.drift++
    failures.push(`SUPPRESSED: ${slug}|${prog} verified=${verifiedTotal} rule=${disp.rule} reason=${disp.reason}`)
    continue
  }

  // For rules 1 and 3 (range display) check the min or the single value matches
  // within 10%. For rule 2 (From ₹X) the single value must match within 10%.
  const displayed = disp.min ?? 0
  const drift = Math.abs(displayed - verifiedTotal) / verifiedTotal
  if (drift > 0.10) {
    results.drift++
    failures.push(`DRIFT: ${slug}|${prog} verified=${verifiedTotal} displayed=${displayed} (${(drift*100).toFixed(1)}%) rule=${disp.rule}`)
    continue
  }
  results.validated++
}

console.log('VERIFIED FEE INGEST VALIDATION')
console.log('  validated (Rule 1/2/3 within 10%) :', results.validated)
console.log('  skipped   (intentionally blank)   :', results.skipped)
console.log('  drift     (still off after ingest):', results.drift)
console.log('  missing   (uni/prog not in data)  :', results.missing)
if (failures.length) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  -', f)
}
process.exit(failures.length)
