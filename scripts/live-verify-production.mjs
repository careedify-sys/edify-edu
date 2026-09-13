// scripts/live-verify-production.mjs
// Full health sweep of edifyedu.in against what the repo says should be there.
//
// Four checks, each reported separately so a failure names its own cause:
//   1. sitemap      every URL in valid-urls.json must return 200. A redirect
//                   here means the sitemap advertises a non-canonical URL; a
//                   404 means it advertises a page that does not exist.
//   2. rescued      every spec slug the edge redirect table rescues must 308,
//                   and its destination must render.
//   3. retired      every URL retired by a next.config.js entry must 301 to a
//                   page that renders, never 404.
//   4. core         the hand-written pages, which no generated list covers.
//
// Read-only. Exits non-zero if any check fails.
// Run: node scripts/live-verify-production.mjs [--host https://edifyedu.in]

import { readFileSync } from 'fs'

const hostArg = process.argv.indexOf('--host')
const HOST = hostArg > -1 ? process.argv[hostArg + 1] : 'https://edifyedu.in'
const CONCURRENCY = 12
const bust = Date.now()

const PROGS = ['ma', 'bcom', 'mcom', 'mba', 'bba', 'bca', 'mca', 'ba', 'msc', 'bsc']
const hubAllowed = new Set()
for (const p of PROGS) {
  for (const u of JSON.parse(readFileSync(`lib/data/programme-allowlist-${p}.json`, 'utf8'))) hubAllowed.add(`${u}|${p}`)
}

async function head(path, redirect = 'manual') {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const c = new AbortController()
      const t = setTimeout(() => c.abort(), 25000)
      const r = await fetch(`${HOST}${path}?_v=${bust}`, {
        redirect, signal: c.signal, headers: { 'cache-control': 'no-cache' },
      })
      clearTimeout(t)
      // A 5xx on a cold ISR render is worth one retry before believing it.
      if (r.status >= 500 && attempt < 2) continue
      return { status: r.status, loc: (r.headers.get('location') || '').replace(HOST, '').split('?')[0] }
    } catch (e) {
      if (attempt === 2) return { status: 0, loc: '', error: String(e).slice(0, 80) }
    }
  }
  return { status: 0, loc: '' }
}

async function pool(items, fn) {
  let i = 0
  let done = 0
  const total = items.length
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < total) {
      const n = i++
      await fn(items[n])
      if (++done % 250 === 0) process.stdout.write(`    ${done}/${total}\n`)
    }
  }))
}

const failures = {}
const record = (check, line) => (failures[check] ||= []).push(line)

// ── 1. Sitemap ───────────────────────────────────────────────────────────────
const sitemap = JSON.parse(readFileSync('lib/data/valid-urls.json', 'utf8'))
console.log(`1. sitemap URLs (${sitemap.length}) — expect 200`)
await pool(sitemap, async (u) => {
  const r = await head(u)
  if (r.status !== 200) record('sitemap', `${r.status}${r.loc ? ' -> ' + r.loc : ''}  ${u}`)
})

// ── 2. Rescued spec slugs ────────────────────────────────────────────────────
const al = JSON.parse(readFileSync('lib/data/spec-allowlist.json', 'utf8'))
const rescued = []
for (const [pair, flat] of Object.entries(al.r)) {
  if (!hubAllowed.has(pair)) continue // section 2d 404s the whole subtree
  const [uni, prog] = pair.split('|')
  const seen = new Set()
  for (let i = 0; i < flat.length; i += 2) {
    const from = al.s[flat[i]]
    if (seen.has(from)) continue
    seen.add(from)
    rescued.push({ url: `/universities/${uni}/${prog}/${from}`, want: `/universities/${uni}/${prog}/${al.s[flat[i + 1]]}` })
  }
}
console.log(`2. rescued spec slugs (${rescued.length}) — expect 308/301, never 404`)
const rescuedDests = new Set()
await pool(rescued, async (c) => {
  const r = await head(c.url)
  if (r.status !== 308 && r.status !== 301) { record('rescued', `${r.status}  ${c.url}  (expected a redirect)`); return }
  rescuedDests.add(r.loc)
})

// ── 3. Retired URLs (next.config.js spec-level entries) ───────────────────────
const cfg = readFileSync('next.config.js', 'utf8')
const retired = []
for (const m of cfg.matchAll(/\{\s*source:\s*'(\/universities\/[^']+)',\s*destination:\s*'([^']+)',\s*permanent:\s*true\s*\}/g)) {
  if (m[1].includes(':') || m[1].split('/').length !== 5) continue // skip wildcards and hub-level rules
  retired.push({ url: m[1], want: m[2] })
}
console.log(`3. retired spec URLs (${retired.length}) — expect 301 to the stated destination`)
await pool(retired, async (c) => {
  const r = await head(c.url)
  if (r.status !== 301 && r.status !== 308) record('retired', `${r.status}  ${c.url}  (expected 301 -> ${c.want})`)
  else if (r.loc !== c.want) record('retired', `301 ${c.url} -> ${r.loc}  (expected ${c.want})`)
})

// ── 4. Redirect destinations must render ─────────────────────────────────────
const dests = [...new Set([...rescuedDests, ...retired.map(r => r.want)])].filter(Boolean)
console.log(`4. redirect destinations (${dests.length}) — expect 200`)
await pool(dests, async (d) => {
  const r = await head(d, 'follow')
  if (r.status !== 200) record('destinations', `${r.status}  ${d}`)
})

// ── 5. Core pages ────────────────────────────────────────────────────────────
const core = ['/', '/universities', '/programs', '/compare', '/fees', '/blog', '/guides',
  '/tools', '/coupons', '/verify', '/contact', '/about', '/privacy-policy',
  '/best-online-mba-india', '/sitemap.xml', '/robots.txt',
  '/tools/emi-calculator', '/tools/cgpa-calculator', '/tools/percentage-to-gpa']
console.log(`5. core pages (${core.length}) — expect 200`)
await pool(core, async (u) => {
  const r = await head(u, 'follow')
  if (r.status !== 200) record('core', `${r.status}  ${u}`)
})

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(62)}\nRESULT for ${HOST}\n${'='.repeat(62)}`)
const order = ['sitemap', 'rescued', 'retired', 'destinations', 'core']
const counts = { sitemap: sitemap.length, rescued: rescued.length, retired: retired.length, destinations: dests.length, core: core.length }
let bad = 0
for (const k of order) {
  const f = failures[k] || []
  bad += f.length
  console.log(`${f.length ? 'FAIL' : ' OK '}  ${k.padEnd(13)} ${String(counts[k]).padStart(5)} checked, ${f.length} failing`)
  for (const line of f.slice(0, 20)) console.log(`         ${line}`)
  if (f.length > 20) console.log(`         ...and ${f.length - 20} more`)
}
console.log('='.repeat(62))
if (bad) { console.error(`${bad} failing URL(s).`); process.exit(1) }
console.log('All checks passed. No broken URLs on the live site.')
