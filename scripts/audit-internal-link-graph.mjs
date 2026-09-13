// scripts/audit-internal-link-graph.mjs
// Builds the inbound internal-link graph from the live site and reports which
// pages are starved of contextual links.
//
// Why crawl production rather than read the source: most internal links are
// rendered, not written. SpecializationGrid, SiblingProgrammes, peer-university
// blocks and BlogRelatedLinks all emit links from data at request time, so a
// static scan of lib/ and components/ cannot see them. The rendered HTML is the
// only place the real graph exists.
//
// Boilerplate is excluded. Navbar, Footer and BottomNav links appear on every
// page, so counting them would give /compare ~2,900 inbound links and drown the
// signal. Any target appearing on more than BOILERPLATE_RATIO of pages is
// treated as chrome and reported separately.
//
// Evidence this matters: audits/seo-internal-links-session-2026-08-23.md section
// 2, defect 2. Across 55 university+programme pairs that have both a review blog
// and a hub, the page with more internal links is the better-ranking page in 51
// of 55. Use that within-pair test, not the cross-sectional one, which inverts.
//
// Read-only. Run: node scripts/audit-internal-link-graph.mjs [--host URL]

import { readFileSync, writeFileSync } from 'fs'

const hostArg = process.argv.indexOf('--host')
const HOST = hostArg > -1 ? process.argv[hostArg + 1] : 'https://edifyedu.in'
const CONCURRENCY = 12
const BOILERPLATE_RATIO = 0.5

const norm = (href) => {
  if (!href) return null
  let h = href.trim()
  if (h.startsWith(HOST)) h = h.slice(HOST.length)
  if (/^https?:\/\//i.test(h)) return null          // external
  if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return null
  h = h.split('#')[0].split('?')[0]
  if (!h.startsWith('/')) return null
  if (h.length > 1 && h.endsWith('/')) h = h.slice(0, -1)
  return h || '/'
}

// Page-type buckets, most specific first.
const bucket = (u) => {
  if (/^\/universities\/[^/]+\/[^/]+\/[^/]+$/.test(u)) return 'uni spec page'
  if (/^\/universities\/[^/]+\/[^/]+$/.test(u)) return 'uni programme hub'
  if (/^\/universities\/[^/]+$/.test(u)) return 'university page'
  if (/^\/blog\/./.test(u)) return 'blog post'
  if (/^\/programs\/[^/]+\/[^/]+$/.test(u)) return 'programme spec hub'
  if (/^\/programs\/[^/]+$/.test(u)) return 'programme hub'
  if (/^\/guides\/./.test(u)) return 'guide'
  if (/^\/coupons\/./.test(u)) return 'coupon page'
  if (/^\/compare\/./.test(u)) return 'compare pair'
  if (/^\/tools\/cgpa-calculator\/./.test(u)) return 'cgpa value page'
  if (/^\/verify\/./.test(u)) return 'verify page'
  return 'other'
}

const sitemapXml = await (await fetch(`${HOST}/sitemap.xml`)).text()
const pages = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => norm(m[1])).filter(Boolean)
const pageSet = new Set(pages)
console.log(`Crawling ${pages.length} pages from ${HOST}/sitemap.xml\n`)

const outbound = new Map()   // source -> Set(target)
const inboundAll = new Map() // target -> Set(source)
const failed = []

async function fetchPage(u) {
  for (let a = 0; a < 3; a++) {
    try {
      const c = new AbortController()
      const t = setTimeout(() => c.abort(), 30000)
      const r = await fetch(HOST + u, { signal: c.signal, headers: { 'cache-control': 'no-cache' } })
      clearTimeout(t)
      if (r.status >= 500 && a < 2) continue
      if (r.status !== 200) return null
      return await r.text()
    } catch { if (a === 2) return null }
  }
  return null
}

let i = 0, done = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (i < pages.length) {
    const src = pages[i++]
    const html = await fetchPage(src)
    if (html === null) { failed.push(src); continue }
    const targets = new Set()
    for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
      const t = norm(m[1])
      if (t && t !== src) targets.add(t)
    }
    outbound.set(src, targets)
    for (const t of targets) {
      if (!inboundAll.has(t)) inboundAll.set(t, new Set())
      inboundAll.get(t).add(src)
    }
    if (++done % 250 === 0) console.log(`  ${done}/${pages.length}`)
  }
}))

// Boilerplate = a target linked from more than half of all crawled pages.
const crawled = outbound.size
const boilerplate = new Set()
for (const [t, srcs] of inboundAll) {
  if (srcs.size / crawled > BOILERPLATE_RATIO) boilerplate.add(t)
}

const contextual = new Map() // target -> count, boilerplate sources removed
for (const p of pages) contextual.set(p, 0)
for (const [t, srcs] of inboundAll) {
  if (!pageSet.has(t)) continue
  contextual.set(t, srcs.size)
}
// A link that is itself chrome still counts as chrome for the TARGET, so drop
// targets that are chrome from the starvation analysis rather than their sources.

const rows = [...contextual.entries()]
  .filter(([t]) => !boilerplate.has(t))
  .map(([t, n]) => ({ url: t, n, type: bucket(t) }))

const byType = new Map()
for (const r of rows) {
  if (!byType.has(r.type)) byType.set(r.type, { total: 0, sum: 0, zero: 0, one: 0, two: 0 })
  const b = byType.get(r.type)
  b.total++; b.sum += r.n
  if (r.n === 0) b.zero++
  else if (r.n === 1) b.one++
  else if (r.n === 2) b.two++
}

const out = []
out.push('# Internal link graph — inbound contextual links', '')
out.push(`Crawled ${crawled} of ${pages.length} sitemap pages on ${new Date().toISOString().slice(0, 10)}.`)
out.push(`${boilerplate.size} targets excluded as site chrome (linked from >${BOILERPLATE_RATIO * 100}% of pages).`)
if (failed.length) out.push(`${failed.length} pages failed to fetch.`)
out.push('')
out.push('## Starvation by page type', '')
out.push('| page type | pages | 0 links | 1 link | 2 links | avg |')
out.push('|---|---:|---:|---:|---:|---:|')
const sorted = [...byType.entries()].sort((a, b) => (b[1].zero + b[1].one) - (a[1].zero + a[1].one))
for (const [type, b] of sorted) {
  out.push(`| ${type} | ${b.total} | ${b.zero} | ${b.one} | ${b.two} | ${(b.sum / b.total).toFixed(1)} |`)
}
const starved = rows.filter(r => r.n <= 1)
out.push('')
out.push(`**${starved.length} of ${rows.length} pages have 0 or 1 inbound contextual link.**`, '')

out.push('## Orphans (0 inbound contextual links)', '')
const orphans = rows.filter(r => r.n === 0).sort((a, b) => a.url.localeCompare(b.url))
out.push(`${orphans.length} pages. Reachable only from the sitemap.`, '')
for (const r of orphans.slice(0, 150)) out.push(`- \`${r.url}\` *(${r.type})*`)
if (orphans.length > 150) out.push(`- …and ${orphans.length - 150} more`)

out.push('', '## Near-orphans (exactly 1 inbound contextual link)', '')
const ones = rows.filter(r => r.n === 1).sort((a, b) => a.url.localeCompare(b.url))
out.push(`${ones.length} pages. A single link is a single point of failure: if that`)
out.push('one source page is denoised, pruned or reworded, the target goes orphan.', '')
for (const r of ones.slice(0, 150)) {
  const src = [...(inboundAll.get(r.url) || [])][0]
  out.push(`- \`${r.url}\` *(${r.type})* ← only from \`${src}\``)
}
if (ones.length > 150) out.push(`- …and ${ones.length - 150} more`)

writeFileSync('audits/internal-link-graph.md', out.join('\n') + '\n')
writeFileSync('audits/internal-link-graph.json', JSON.stringify(
  rows.sort((a, b) => a.n - b.n).map(r => ({ ...r, from: [...(inboundAll.get(r.url) || [])] })), null, 2))

console.log('\n' + out.slice(out.indexOf('## Starvation by page type')).slice(0, 18).join('\n'))
console.log(`\nWrote audits/internal-link-graph.md and .json`)
