// Exhaustive audit: find every DSU-context reference to any old fee variant.
const fs = require('fs')
const path = require('path')

function walk(dir, results = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'blog-extract', 'crousel_unpacked', 'audits'].includes(item.name)) continue
    const full = path.join(dir, item.name)
    if (item.isDirectory()) walk(full, results)
    else if (/\.(ts|tsx|js|json|md|csv)$/.test(item.name)) results.push(full)
  }
  return results
}

const oldFees = /(1[,.]?20[,.]?000|1[,.]?2L|1\.2 lakh|105K|0\.2L)/g
const files = walk('.')
const hits = []
for (const f of files) {
  try {
    const c = fs.readFileSync(f, 'utf8')
    if (!/dayananda|DSU/i.test(c)) continue
    let m
    while ((m = oldFees.exec(c)) !== null) {
      const ctx = c.slice(Math.max(0, m.index - 150), m.index + m[0].length + 150)
      if (/dayananda|DSU/i.test(ctx) && !/revised from Rs.{0,5}1,20,000/i.test(ctx)) {
        const rel = f.split(path.sep).join('/')
        hits.push(rel + ' :: ' + ctx.replace(/\s+/g, ' ').slice(0, 220))
      }
    }
  } catch (e) {}
}

if (hits.length === 0) {
  console.log('CLEAN: no DSU-context stale fees anywhere in repo.')
} else {
  console.log('REMAINING DSU stale-fee references:')
  for (const h of hits.slice(0, 40)) console.log('  - ' + h)
  console.log('\nTotal:', hits.length)
}
