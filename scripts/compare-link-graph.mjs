// scripts/compare-link-graph.mjs
// Diffs two runs of audit-internal-link-graph.mjs so a linking change can be
// reported as movement rather than as a fresh snapshot.
//
// Usage: node scripts/compare-link-graph.mjs <before.json> <after.json>

import { readFileSync } from 'fs'

const load = (p) => {
  const rows = JSON.parse(readFileSync(p, 'utf8'))
  return new Map(rows.map(r => [r.url, r]))
}
const before = load(process.argv[2])
const after = load(process.argv[3])

const types = [...new Set([...after.values()].map(r => r.type))]
const stat = (m, t) => {
  const rows = [...m.values()].filter(r => r.type === t)
  if (!rows.length) return null
  return {
    n: rows.length,
    zero: rows.filter(r => r.n === 0).length,
    one: rows.filter(r => r.n === 1).length,
    avg: rows.reduce((a, r) => a + r.n, 0) / rows.length,
  }
}

const pad = (s, w) => String(s).padStart(w)
const delta = (b, a) => {
  const d = a - b
  return d === 0 ? '  ·' : (d > 0 ? `+${d}` : `${d}`)
}

console.log('\nINTERNAL LINK GRAPH — before vs after\n')
console.log('page type              pages    0 links        1 link         avg inbound')
console.log('─'.repeat(78))

const order = types
  .map(t => ({ t, b: stat(before, t), a: stat(after, t) }))
  .filter(x => x.a)
  .sort((x, y) => y.a.n - x.a.n)

let tb = { zero: 0, one: 0, sum: 0, n: 0 }
let ta = { zero: 0, one: 0, sum: 0, n: 0 }

for (const { t, b, a } of order) {
  const bz = b ? b.zero : 0, bo = b ? b.one : 0, bav = b ? b.avg : 0
  console.log(
    t.padEnd(22) +
    pad(a.n, 5) +
    pad(bz, 7) + ' → ' + pad(a.zero, 4) + pad(delta(bz, a.zero), 6) +
    pad(bo, 6) + ' → ' + pad(a.one, 4) + pad(delta(bo, a.one), 6) +
    pad(bav.toFixed(1), 8) + ' → ' + pad(a.avg.toFixed(1), 5)
  )
  if (b) { tb.zero += bz; tb.one += bo; tb.sum += b.avg * b.n; tb.n += b.n }
  ta.zero += a.zero; ta.one += a.one; ta.sum += a.avg * a.n; ta.n += a.n
}

console.log('─'.repeat(78))
console.log(
  'TOTAL'.padEnd(22) + pad(ta.n, 5) +
  pad(tb.zero, 7) + ' → ' + pad(ta.zero, 4) + pad(delta(tb.zero, ta.zero), 6) +
  pad(tb.one, 6) + ' → ' + pad(ta.one, 4) + pad(delta(tb.one, ta.one), 6) +
  pad((tb.sum / tb.n).toFixed(1), 8) + ' → ' + pad((ta.sum / ta.n).toFixed(1), 5)
)

const starvedBefore = tb.zero + tb.one
const starvedAfter = ta.zero + ta.one
console.log(
  `\nPages with 0 or 1 inbound contextual link: ${starvedBefore} → ${starvedAfter} ` +
  `(${delta(starvedBefore, starvedAfter)}, ${((1 - starvedAfter / starvedBefore) * 100).toFixed(0)}% fewer)`
)

// Biggest individual movers, and anything that went backwards.
const moved = []
for (const [url, a] of after) {
  const b = before.get(url)
  if (!b) continue
  if (a.n !== b.n) moved.push({ url, from: b.n, to: a.n, d: a.n - b.n, type: a.type })
}
const worse = moved.filter(m => m.d < 0)
console.log(`\nPages that gained links : ${moved.filter(m => m.d > 0).length}`)
console.log(`Pages that lost links   : ${worse.length}`)
for (const m of worse.slice(0, 15)) console.log(`   ${m.from} → ${m.to}  ${m.url}`)
if (worse.length > 15) console.log(`   ...and ${worse.length - 15} more`)

const newPages = [...after.keys()].filter(u => !before.has(u)).length
const gonePages = [...before.keys()].filter(u => !after.has(u)).length
if (newPages || gonePages) console.log(`\nSitemap changed: +${newPages} new page(s), -${gonePages} removed`)
