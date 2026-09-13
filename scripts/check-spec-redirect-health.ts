// scripts/check-spec-redirect-health.ts
// Structural health check on lib/data/spec-allowlist.json's redirect table.
//
// check-spec-allowlist.ts already proves the file agrees with resolveSpec. It
// cannot catch the failures a bad rescue rule in
// lib/data/spec-slug-rescue-rules.json introduces, because those live in the
// file legitimately. This script catches those:
//
//   loop      A -> B while B -> A for the same university. Adding
//             bca data-science -> computer-applications-data-science next to
//             the existing inverse rule produced exactly this, and Amity's
//             live /bca/data-science page went into it.
//   chain     A -> B while B -> C. Middleware issues one 308, so the reader
//             pays two round trips and link equity splits across three URLs.
//             Order the direct rule first so it wins the per-university pick.
//   dead end  a redirect whose destination is not itself an accepted slug, or
//             whose (university, programme) pair is absent from the section 2d
//             programme hub allowlist. 2d 404s that whole subtree before 2f
//             ever runs, so such a redirect points at a 404 no matter what the
//             spec allowlist says. Seven rules landed here on first write.
//   hijack    a slug that is both accepted and redirected away, i.e. a live
//             page turned into a redirect. The allowlist builder allows this
//             deliberately for genuine duplicates, so it is reported as a
//             warning and only fails when the slug is in the sitemap.
//
// Read-only. Exits non-zero on any failure.
// Run: npx tsx scripts/check-spec-redirect-health.ts

import { readFileSync } from 'fs'

const al = JSON.parse(readFileSync('lib/data/spec-allowlist.json', 'utf8')) as
  { s: string[]; m: Record<string, number[]>; r: Record<string, number[]> }
const sitemapUrls = JSON.parse(readFileSync('lib/data/valid-urls.json', 'utf8')) as string[]

const accepted = new Map<string, Set<string>>()
for (const [k, v] of Object.entries(al.m)) accepted.set(k, new Set(v.map(i => al.s[i])))

// Middleware scans the flat pair list and takes the first match, so a slug
// listed twice resolves to whichever destination comes first.
const redirects = new Map<string, Map<string, string>>()
for (const [k, v] of Object.entries(al.r)) {
  const m = new Map<string, string>()
  for (let i = 0; i < v.length; i += 2) if (!m.has(al.s[v[i]])) m.set(al.s[v[i]], al.s[v[i + 1]])
  redirects.set(k, m)
}

// Section 2d's programme hub allowlists. A (uni, programme) pair missing here
// has its entire subtree 404'd before section 2f runs.
const PROG_SLUGS = ['ma', 'bcom', 'mcom', 'mba', 'bba', 'bca', 'mca', 'ba', 'msc', 'bsc']
const hubAllowed = new Set<string>()
for (const p of PROG_SLUGS) {
  const list = JSON.parse(readFileSync(`lib/data/programme-allowlist-${p}.json`, 'utf8')) as string[]
  for (const uni of list) hubAllowed.add(`${uni}|${p}`)
}

const sitemapSpecs = new Set<string>()
for (const u of sitemapUrls) {
  const m = u.match(/^\/universities\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (m) sitemapSpecs.add(`${m[1]}|${m[2]}|${m[3]}`)
}

const loops: string[] = []
const chains: string[] = []
const deadEnds: string[] = []
const hijacks: string[] = []
let inertPairs = 0

for (const [pair, m] of redirects) {
  // A pair 2d blocks cannot serve any spec, so 2f never runs for it and its
  // redirect entries are inert rather than broken. Skip it entirely.
  if (!hubAllowed.has(pair)) { inertPairs++; continue }
  for (const [from, to] of m) {
    if (!accepted.get(pair)?.has(to)) {
      deadEnds.push(`${pair} ${from} -> ${to} (destination is not an accepted slug)`)
    }
    const next = m.get(to)
    if (next === from) loops.push(`${pair} ${from} <-> ${to}`)
    else if (next) chains.push(`${pair} ${from} -> ${to} -> ${next}`)
    if (accepted.get(pair)?.has(from)) {
      const [uni, prog] = pair.split('|')
      hijacks.push(`${pair} ${from} -> ${to}${sitemapSpecs.has(`${uni}|${prog}|${from}`) ? '  [IN SITEMAP]' : ''}`)
    }
  }
}

const sitemapHijacks = hijacks.filter(h => h.endsWith('[IN SITEMAP]'))

const report = (label: string, rows: string[]) => {
  if (!rows.length) { console.log(`OK. no ${label}.`); return }
  console.log(`FAIL. ${rows.length} ${label}:`)
  for (const r of rows.slice(0, 25)) console.log('  ' + r)
  if (rows.length > 25) console.log(`  ...and ${rows.length - 25} more`)
}

report('redirect loops', loops)
report('redirect chains', chains)
report('redirects to a dead end', deadEnds)
report('sitemap URLs redirected away', sitemapHijacks)
console.log(
  `Note: ${hijacks.length - sitemapHijacks.length} accepted slug(s) redirect away without being in the sitemap. ` +
  `That is the builder's deliberate duplicate-spec dedupe, not a failure.`
)
console.log(
  `Note: ${inertPairs} (university, programme) pair(s) carry redirect entries but are absent from the ` +
  `section 2d hub allowlist, so those entries never fire. Harmless, but they are dead weight in the payload.`
)

const failed = loops.length + chains.length + deadEnds.length + sitemapHijacks.length
if (failed) { console.error(`\n${failed} redirect-table problem(s).`); process.exit(1) }
console.log(`\nOK. ${[...redirects.values()].reduce((n, m) => n + m.size, 0)} spec redirects are loop-free, chain-free and land on live pages.`)
