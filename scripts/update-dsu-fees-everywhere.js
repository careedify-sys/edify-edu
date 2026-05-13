// Sweep DSU fee references across blog.ts, page-content JSONs, and content.ts.
// All DSU programmes (MBA, MCA, BBA, BCA, B.Com) are now Rs 1,30,000.
// Skip "Rs 1,20,000 to Rs 1,30,000" historical revision phrasing in the DSU
// review blog body (intentional callout).

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

const TARGETS = [
  'lib/blog.ts',
  'lib/content.ts',
]
// Include all page-content JSONs
const pcDir = path.join(ROOT, 'lib/data/page-content')
for (const f of fs.readdirSync(pcDir)) {
  if (f.endsWith('.json')) TARGETS.push('lib/data/page-content/' + f)
}

// Replacements that only fire when adjacent to DSU/Dayananda context. We
// implement this as a per-line scan that requires DSU/Dayananda within
// ~250 chars before/after the fee token. Otherwise we'd corrupt unrelated
// mentions of ₹1,20,000 referring to peer universities.

const FEE_TOKENS = [
  // [from, to]
  ['Rs 1,20,000', 'Rs 1,30,000'],
  ['Rs. 1,20,000', 'Rs. 1,30,000'],
  ['₹1,20,000', '₹1,30,000'],
  ['Rs 1.2L', 'Rs 1.3L'],
  ['Rs. 1.2L', 'Rs. 1.3L'],
  ['₹1.2L', '₹1.3L'],
  ['Rs 1.2 lakh', 'Rs 1.3 lakh'],
  ['Rs. 1.2 lakh', 'Rs. 1.3 lakh'],
  ['₹1.2 lakh', '₹1.3 lakh'],
  ['120K', '130K'],
  // BCA/BBA range stripped to single fee
  ['₹0.2L – ₹1.2L', '₹1.3L'],
  ['₹0.2L–₹1.2L', '₹1.3L'],
  // Old B.Com range
  ['₹105K – ₹105K', '₹1.3L'],
  ['₹105K–₹105K', '₹1.3L'],
]

// Phrases that contain "1,20,000" but MUST NOT be modified.
const PROTECT_PHRASES = [
  'fee revised from Rs. 1,20,000 to Rs. 1,30,000',
  'fee revised from Rs 1,20,000 to Rs 1,30,000',
]

function isProtected(haystack, idx) {
  for (const p of PROTECT_PHRASES) {
    const i = haystack.indexOf(p, Math.max(0, idx - p.length))
    if (i >= 0 && i <= idx && i + p.length >= idx) return true
  }
  return false
}

let totalChanges = 0
const fileReport = []

for (const rel of TARGETS) {
  const fp = path.join(ROOT, rel)
  if (!fs.existsSync(fp)) continue
  let src = fs.readFileSync(fp, 'utf8')
  if (!/dayananda|DSU/i.test(src)) continue

  let fileChanges = 0
  for (const [from, to] of FEE_TOKENS) {
    let out = ''
    let i = 0
    while (i < src.length) {
      const j = src.indexOf(from, i)
      if (j < 0) { out += src.slice(i); break }
      // Context window: 250 chars before and after the token
      const ctxStart = Math.max(0, j - 250)
      const ctxEnd = Math.min(src.length, j + from.length + 250)
      const ctx = src.slice(ctxStart, ctxEnd)
      const dsuNearby = /dayananda|DSU/i.test(ctx)
      const protectedHit = isProtected(src, j)
      if (dsuNearby && !protectedHit) {
        out += src.slice(i, j) + to
        fileChanges++
      } else {
        out += src.slice(i, j + from.length)
      }
      i = j + from.length
    }
    src = out
  }

  if (fileChanges > 0) {
    fs.writeFileSync(fp, src)
    fileReport.push(`  ${rel} → ${fileChanges} hits`)
    totalChanges += fileChanges
  }
}

console.log('DSU fee sweep complete.')
console.log(fileReport.join('\n'))
console.log(`Total replacements: ${totalChanges}`)
