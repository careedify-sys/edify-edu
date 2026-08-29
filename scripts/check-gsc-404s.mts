// scripts/check-gsc-404s.mts
// Blocks any commit that would make a URL with real Search Console history
// return 404 without a redirect standing in front of it.
//
// Why this gate exists: 2e24d1d closed a large soft-404 class by 404ing unknown
// programmes and specialisations at the edge. Correct for junk URLs, but 13 of
// the URLs it started 404ing were ranking, several on page 1, carrying 1,576
// impressions between them. They had been soft 404s, so no content was lost,
// but a hard 404 tells Google to drop the URL and discards the signal it had
// earned. Each got a 301 to its programme hub in next.config.js instead. This
// gate makes that a rule rather than a one-off cleanup: widen an allowlist
// again and any ranking URL it would kill fails the commit until you decide
// where it should redirect.
//
// Data source: audit-data/Pages.csv, the Search Console "Top pages" export.
// It is a snapshot, so this gate is a floor and not a guarantee. It cannot see
// URLs outside the top 1,000.
//
// Run: npx tsx scripts/check-gsc-404s.mts

import fs from 'fs'
import path from 'path'
import { UNIVERSITIES } from '../lib/data'

const ROOT = process.cwd()
const PROGRAMMES = ['ma', 'bcom', 'mcom', 'mba', 'bba', 'bca', 'mca', 'ba', 'msc', 'bsc']

const allow: Record<string, string[]> = {}
for (const p of PROGRAMMES) {
  allow[p] = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', `programme-allowlist-${p}.json`), 'utf8'))
}
const specAllow = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'lib', 'data', 'spec-allowlist.json'), 'utf8')
) as { s: string[]; m: Record<string, number[]> }

// Mirrors middleware sections 2d, 2e and 2f. Kept deliberately small: if the
// middleware grows another rule, add it here too or this gate goes blind.
const EXEMPT_SEGMENTS = new Set<string>([
  ...PROGRAMMES, 'programmes', 'mba-wx',
  ...PROGRAMMES.map(p => `online-${p}`),
])
const UNI_IDS = new Set(UNIVERSITIES.map(u => u.id))

function wouldEdge404(pathname: string): boolean {
  const seg = pathname.split('/')
  if (seg[1] !== 'universities' || seg.length < 4) return false
  const [, , uniId, progSlug] = seg
  // Unknown university id: middleware sections 2b and 2c repair truncated and
  // mis-spelled slugs with a 308 before any allowlist is consulted, so these
  // are not allowlist casualties and modelling them here would mean
  // duplicating that fuzzy resolver. Out of scope by design.
  if (!UNI_IDS.has(uniId)) return false
  if (!EXEMPT_SEGMENTS.has(progSlug.toLowerCase())) return true            // 2e
  if (allow[progSlug] && !allow[progSlug].includes(uniId)) return true     // 2d
  if (seg.length === 5 && allow[progSlug]) {                               // 2f
    const idxs = specAllow.m[`${uniId}|${progSlug}`]
    const wanted = seg[4].toLowerCase()
    if (!idxs || !idxs.some(i => specAllow.s[i] === wanted)) return true
  }
  return false
}

// Redirect matching uses the same path-to-regexp Next itself compiles the
// config with, so a wildcard source like /universities/:id/online-mba/:path*
// is recognised rather than skipped. Conditional redirects (a `has` or
// `missing` clause, e.g. the www host rule whose source is /:path*) are
// ignored: they do not fire on the apex host these URLs are crawled on, and
// treating them as unconditional would match every path and blind the gate.
async function redirectMatchers(): Promise<((p: string) => boolean)[]> {
  const ptr: any = await import('next/dist/compiled/path-to-regexp' as any)
  const pathToRegexp = ptr.pathToRegexp ?? ptr.default?.pathToRegexp ?? ptr.default
  const sources: string[] = []

  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', 'redirects.json'), 'utf8'))
    for (const r of (Array.isArray(raw) ? raw : raw.redirects || [])) {
      if (r?.has || r?.missing) continue
      if (r?.source) sources.push(String(r.source))
    }
  } catch { /* next.config is the authority below */ }

  const cfg: any = await import('../next.config.js' as any)
  const nc = cfg?.default ?? cfg
  for (const r of await nc.redirects()) {
    if (r?.has || r?.missing) continue
    if (r?.source) sources.push(String(r.source))
  }

  const matchers: ((p: string) => boolean)[] = []
  for (const src of sources) {
    try {
      const re = pathToRegexp(src)
      matchers.push((p: string) => re.test(p))
    } catch {
      matchers.push((p: string) => p === src)
    }
  }
  return matchers
}

;(async () => {
  const csv = fs.readFileSync(path.join(ROOT, 'audit-data', 'Pages.csv'), 'utf8')
  const rows = csv.split(/\r?\n/).slice(1).filter(Boolean)
  const matchers = await redirectMatchers()

  const casualties: { path: string; clicks: number; impr: number; pos: number }[] = []
  let scanned = 0

  for (const line of rows) {
    const m = line.match(/^(.*),(\d+),(\d+),([\d.]+%),([\d.]+)$/)
    if (!m) continue
    const pathname = m[1].replace(/^https?:\/\/(www\.)?edifyedu\.in/, '') || '/'
    if (!pathname.startsWith('/universities/')) continue
    scanned++
    if (!wouldEdge404(pathname)) continue
    if (matchers.some(m => m(pathname))) continue
    casualties.push({ path: pathname, clicks: +m[2], impr: +m[3], pos: +m[5] })
  }

  if (casualties.length === 0) {
    console.log(`OK. ${scanned} ranking /universities/ URLs checked, none would 404 without a redirect.`)
    return
  }

  casualties.sort((a, b) => b.impr - a.impr)
  const clicks = casualties.reduce((a, b) => a + b.clicks, 0)
  const impr = casualties.reduce((a, b) => a + b.impr, 0)
  console.error(`FAIL: ${casualties.length} URL(s) with Search Console history would return 404.`)
  console.error(`      ${clicks} clicks and ${impr} impressions would be discarded.`)
  for (const c of casualties.slice(0, 25)) {
    console.error(`    clicks=${c.clicks} impr=${c.impr} pos=${c.pos}  ${c.path}`)
  }
  if (casualties.length > 25) console.error(`    ...and ${casualties.length - 25} more`)
  console.error('')
  console.error('Fix: add a 301 to the nearest live page in next.config.js redirects(),')
  console.error('     under the "Soft-404 rescue" block. The programme hub is usually right.')
  process.exit(1)
})()
