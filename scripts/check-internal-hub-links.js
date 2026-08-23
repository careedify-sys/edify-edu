// scripts/check-internal-hub-links.js
// Scans every prerendered HTML file in .next/server/app and fails if any page
// links to a /universities/{uni}/{prog} hub that middleware.ts would 404.
//
// WHY: on 2026-08-23 a scan found 45 hard-404 links across 33 university
// overview pages. The cause was rendering links straight from u.programs while
// middleware 404s any hub absent from lib/data/programme-allowlist-{prog}.json.
// Nothing in the build catches that, because a broken <a> is valid HTML and the
// target only fails at the edge.
//
// Run after `next build`:  node scripts/check-internal-hub-links.js
// Exit code 1 on any broken link, so it can gate a deploy.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const APP = path.join(ROOT, '.next', 'server', 'app')

const GATED = ['ma', 'bcom', 'mcom', 'mba', 'bba', 'bca', 'mca']
const allow = {}
for (const slug of GATED) {
  allow[slug] = new Set(
    JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', `programme-allowlist-${slug}.json`), 'utf8')),
  )
}

if (!fs.existsSync(APP)) {
  console.error('No .next/server/app. Run `npm run build` first.')
  process.exit(1)
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const files = walk(APP)
const HUB = /href="(\/universities\/([^/"]+)\/([a-z]+))"/g

let broken = 0
let checked = 0
const offenders = new Map()

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8')
  let m
  while ((m = HUB.exec(html))) {
    const [, href, uni, prog] = m
    if (!GATED.includes(prog)) continue
    checked++
    if (!allow[prog].has(uni)) {
      broken++
      const page = path.relative(APP, f)
      if (!offenders.has(page)) offenders.set(page, new Set())
      offenders.get(page).add(href)
    }
  }
}

console.log(`pages scanned      : ${files.length}`)
console.log(`gated hub links    : ${checked}`)
console.log(`broken (would 404) : ${broken}`)

if (broken > 0) {
  console.error('\nBroken hub links found:')
  for (const [page, hrefs] of offenders) {
    console.error(`  ${page}`)
    for (const h of hrefs) console.error(`      -> ${h}`)
  }
  process.exit(1)
}

console.log('\nPASS: no prerendered page links to a hub that middleware would 404.')
