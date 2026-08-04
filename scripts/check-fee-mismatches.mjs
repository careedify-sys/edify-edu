// scripts/check-fee-mismatches.mjs
// Prints per-rule resolution counts across all uni x program combinations,
// then the row-level list of every programme that still falls through to
// suppression (rules 4a or 4b). Exits with the total suppressed count so
// CI can gate.
//
// Run: npm run check:fees

import { UNIVERSITIES } from '../lib/data.ts'
import { findAllFeeMismatches, tallyFeeRules } from '../lib/fees.ts'

const buckets = tallyFeeRules(UNIVERSITIES)

console.log('FEE RESOLUTION SUMMARY (across all universities x programmes):')
console.log(`  Rule 1  (range agreement / trusted pd.fees) : ${buckets.rule1}`)
console.log(`  Rule 2  (single value "From ₹X")            : ${buckets.rule2}`)
console.log(`  Rule 3  (narrower range inside reference)   : ${buckets.rule3}`)
console.log(`  Rule 4a (width sanity > 3x, SUPPRESSED)     : ${buckets.rule4a}`)
console.log(`  Rule 4b (>25% divergence, SUPPRESSED)       : ${buckets.rule4b}`)
console.log(`  no data (no pd.fees + no reference)         : ${buckets.noData}`)
const suppressed = buckets.rule4a + buckets.rule4b + buckets.noData
console.log(`  TOTAL SUPPRESSED                            : ${suppressed}`)

const mismatches = findAllFeeMismatches(UNIVERSITIES)
if (mismatches.length > 0) {
  console.log('\nRow-level suppressed list:\n')
  console.log('rule'.padEnd(5), 'universityId'.padEnd(45), 'prog'.padEnd(6), 'pd.fees'.padEnd(22), 'feeMin'.padEnd(9), 'feeMax'.padEnd(9))
  console.log('-'.repeat(120))
  for (const m of mismatches) {
    console.log(
      String(m.rule).padEnd(5),
      m.universityId.padEnd(45),
      String(m.program).padEnd(6),
      String(m.pdFees).padEnd(22),
      String(m.feeMin).padEnd(9),
      String(m.feeMax).padEnd(9),
    )
  }
}
process.exit(suppressed)
