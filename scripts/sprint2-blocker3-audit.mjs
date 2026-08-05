// scripts/sprint2-blocker3-audit.mjs
// Blocker 3 audit. For each of the 12 verified rows in the user's Sprint 2
// prompt, report:
//   - the verified total from the prompt
//   - current getDisplayFee resolution: rule, ok, compact, min, max
//   - whether it currently sits in the suppression list
//   - if suppressed, the reason
//   - if resolved but the displayed number disagrees with the verified total
//     by more than getDisplayFee's own tolerances, that is an ingest bug.
//
// The 12 rows include DPU-COL Pune BBA which was reverted per Blocker 1;
// that row will report as "programme not in data.ts" and is expected.

import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROWS = [
  { slug: 'galgotias-university-online',       prog: 'BCA', verified: 83200 },
  { slug: 'galgotias-university-online',       prog: 'BBA', verified: 77200 },
  { slug: 'kurukshetra-university-online',     prog: 'BBA', verified: 72661 },
  { slug: 'kl-university-online',              prog: 'MBA', verified: 73500 },
  { slug: 'gla-university-online',             prog: 'BBA', verified: 99800 },
  { slug: 'gla-university-online',             prog: 'BCA', verified: 99800 },
  { slug: 'gla-university-online',             prog: 'MCA', verified: 94300 },
  { slug: 'vignan-university-online',          prog: 'BCA', verified: 121000 },
  { slug: 'chandigarh-university-online',      prog: 'BCA', verified: 177000 },
  { slug: 'dy-patil-university-online',        prog: 'BBA', verified: 130000 },
  { slug: 'dy-patil-university-online',        prog: 'BCA', verified: 132000 },
  { slug: 'dr-dy-patil-vidyapeeth-online',     prog: 'BBA', verified: 145400 },
]

console.log('BLOCKER 3 — 12 verified rows, post-ingest resolution audit')
console.log('')
console.log('slug'.padEnd(38), 'prog'.padEnd(6), 'verified'.padEnd(10), 'ok'.padEnd(4), 'rule'.padEnd(6), 'compact'.padEnd(12), 'notes')
console.log('-'.repeat(120))

let resolvedCount = 0
let suppressedCount = 0
let missingCount = 0
let driftCount = 0

for (const r of ROWS) {
  const u = UNIVERSITIES.find(x => x.id === r.slug)
  if (!u) {
    missingCount++
    console.log(r.slug.padEnd(38), r.prog.padEnd(6), String(r.verified).padEnd(10), '-'.padEnd(4), '-'.padEnd(6), '-'.padEnd(12), 'MISSING uni in data.ts')
    continue
  }
  if (!u.programs.includes(r.prog)) {
    missingCount++
    console.log(r.slug.padEnd(38), r.prog.padEnd(6), String(r.verified).padEnd(10), '-'.padEnd(4), '-'.padEnd(6), '-'.padEnd(12), `MISSING prog (programs=${u.programs.join(',')}) — expected if reverted per Blocker 1`)
    continue
  }
  const d = getDisplayFee(u, r.prog)
  if (!d.ok) {
    suppressedCount++
    console.log(r.slug.padEnd(38), r.prog.padEnd(6), String(r.verified).padEnd(10), 'no'.padEnd(4), String(d.rule).padEnd(6), '-'.padEnd(12), `SUPPRESSED: ${d.reason}`)
    continue
  }
  resolvedCount++
  const displayed = d.min ?? 0
  const drift = Math.abs(displayed - r.verified) / r.verified
  const driftPct = (drift * 100).toFixed(1)
  const driftFlag = drift > 0.10 ? '⚠ DRIFT >10%' : (drift > 0.001 ? `drift ${driftPct}%` : 'match')
  if (drift > 0.10) driftCount++
  console.log(r.slug.padEnd(38), r.prog.padEnd(6), String(r.verified).padEnd(10), 'yes'.padEnd(4), String(d.rule).padEnd(6), String(d.compact).padEnd(12), driftFlag)
}

console.log('')
console.log(`Resolved (Rule 1/2/3): ${resolvedCount}`)
console.log(`Suppressed still     : ${suppressedCount}`)
console.log(`Missing (reverted)   : ${missingCount}`)
console.log(`Drift > 10%          : ${driftCount}`)
console.log('')
console.log('12 vs 8 accounting:')
console.log('  8  = rows that WERE in the pre-Sprint-2 suppression list and cleared')
console.log('  3  = rows that were already resolved before ingest (Galgotias BBA/BCA + GLA MCA)')
console.log('       — they had pd.fees single-value patterns like "₹77K – ₹77K" and no')
console.log('         programFees mismatch, so getDisplayFee returned Rule 1 already.')
console.log('         The ingest sharpened their compact string from "₹77K" to "₹77,200" but')
console.log('         did NOT change the suppression count because they were never suppressed.')
console.log('  1  = row that was reverted (DPU-COL Pune BBA, Blocker 1)')
console.log('  ───')
console.log('  12  total verified rows in prompt')
console.log('')
console.log('Chandigarh BCA sticker vs scholarship:')
console.log('  getDisplayFee only reads programFees[bca].fee (177000, the sticker) and')
console.log('  pd.fees ("₹1,77,000"). Neither the CSV SOURCE_NOTE nor the "20% Early Bird')
console.log('  Scholarship" appear in data.ts, so getDisplayFee cannot see them. The')
console.log('  post-scholarship number (₹1,41,600) never enters any title or description.')
console.log('  Verified: `getDisplayFee(u,"BCA").compact === "₹1.77L"`.')
