// scripts/check-fee-mismatches.mjs
// Sprint 1 FIX 2b. Prints every uni x program where pd.fees disagrees
// with feeMin/feeMax (within ±10% or ±₹5,000). Exits with a count of
// mismatches so CI can gate on `[ "$(npm run -s check:fees | tail -1)" = "0" ]`.
//
// Run: npm run check:fees

import { UNIVERSITIES } from '../lib/data.ts'
import { findAllFeeMismatches } from '../lib/fees.ts'

const mismatches = findAllFeeMismatches(UNIVERSITIES)

if (mismatches.length === 0) {
  console.log('OK: no pd.fees vs feeMin/feeMax mismatches across all universities.')
  process.exit(0)
}

console.log(`MISMATCH REPORT: ${mismatches.length} programme(s) with pd.fees disagreeing with feeMin/feeMax\n`)
console.log('universityId'.padEnd(45), 'prog'.padEnd(6), 'pd.fees'.padEnd(20), 'feeMin'.padEnd(9), 'feeMax'.padEnd(9), 'parsed(min-max)')
console.log('-'.repeat(120))
for (const m of mismatches) {
  console.log(
    m.universityId.padEnd(45),
    String(m.program).padEnd(6),
    String(m.pdFees).padEnd(20),
    String(m.feeMin).padEnd(9),
    String(m.feeMax).padEnd(9),
    `${m.parsedMin}-${m.parsedMax}`,
  )
}
console.log('')
console.log(`Total mismatches: ${mismatches.length}`)
process.exit(mismatches.length)
