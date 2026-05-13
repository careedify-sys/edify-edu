// One-shot script: update Dayananda Sagar University Online MBA fees
// from Rs 1,20,000 (Rs 30,000/sem) to Rs 1,30,000 (Rs 32,500/sem avg)
// across the main MBA JSON and 8 specialisation JSONs.
//
// User reference (DSU portal): 1st sem Rs 32,875, 2nd-4th sem Rs 32,375.
// Total = 32,875 + 3*32,375 = 1,30,000. Casual references use Rs 32,500/sem.
//
// Per `feedback_manifest_writes.md` memory: use Node fs.writeFileSync, not Python.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const FILES = [
  'lib/data/page-content/dayananda-sagar-university-online-mba.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-artificial-intelligence.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-business-analytics.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-entrepreneurship-management.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-financial-management-fintech-focus.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-human-resource-management.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-it-systems-management.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-marketing-management.json',
  'lib/data/page-content/dayananda-sagar-university-online-mba-supply-chain-management.json',
]

// Replacement pairs. Order matters — apply more-specific patterns before broad ones.
const REPLACEMENTS = [
  // Total-fee strings
  [/Rs\s*1,20,000/g, 'Rs 1,30,000'],
  [/Rs\.\s*1,20,000/g, 'Rs. 1,30,000'],
  [/₹1,20,000/g, '₹1,30,000'],
  [/Rs\s*1\.2L\b/g, 'Rs 1.3L'],
  [/Rs\.\s*1\.2L\b/g, 'Rs. 1.3L'],
  [/₹1\.2L\b/g, '₹1.3L'],
  [/Rs\s*1\.2 lakh/g, 'Rs 1.3 lakh'],
  [/Rs\.\s*1\.2 lakh/g, 'Rs. 1.3 lakh'],
  [/₹1\.2 lakh/g, '₹1.3 lakh'],
  // Plain "1.2 lakh" in mid-sentence (no Rs/₹ prefix already covered above)
  [/\b1\.2 lakh\b/g, '1.3 lakh'],
  // Per-semester strings (Rs 30,000 → Rs 32,500). Only with sem/each context to avoid
  // matching unrelated 30,000 figures (e.g. company employee counts).
  [/Rs\s*30,000 per semester/g, 'Rs 32,500 per semester'],
  [/Rs\.\s*30,000 per semester/g, 'Rs. 32,500 per semester'],
  [/₹30,000 per semester/g, '₹32,500 per semester'],
  [/Rs\s*30,000\/sem/g, 'Rs 32,500/sem'],
  [/Rs\.\s*30,000\/sem/g, 'Rs. 32,500/sem'],
  [/₹30,000\/sem/g, '₹32,500/sem'],
  [/of approximately Rs\s*30,000 each/g, 'of approximately Rs 32,500 each'],
  [/of approximately Rs\.\s*30,000 each/g, 'of approximately Rs. 32,500 each'],
  [/four semester instalments of Rs\s*30,000 each/g, 'four semester instalments of Rs 32,500 each'],
  [/four semester instalments of Rs\.\s*30,000 each/g, 'four semester instalments of Rs. 32,500 each'],
  // Numeric occurrences inside JSON value strings (e.g. totalFee numeric)
  [/"120000"/g, '"130000"'],
]

let totalChanges = 0
const report = []

for (const rel of FILES) {
  const fp = path.join(ROOT, rel)
  if (!fs.existsSync(fp)) {
    report.push(`SKIP (not found): ${rel}`)
    continue
  }
  const before = fs.readFileSync(fp, 'utf8')
  let after = before
  let fileChanges = 0
  for (const [re, sub] of REPLACEMENTS) {
    const matches = after.match(re)
    if (matches) {
      after = after.replace(re, sub)
      fileChanges += matches.length
    }
  }
  if (after !== before) {
    fs.writeFileSync(fp, after)
    totalChanges += fileChanges
    report.push(`UPDATED (${fileChanges} hits): ${rel}`)
  } else {
    report.push(`No changes: ${rel}`)
  }
}

console.log(report.join('\n'))
console.log(`\nTotal replacements: ${totalChanges}`)
