// scripts/check-spec-allowlist.ts
// Pre-commit invariant for lib/data/spec-allowlist.json, the allowlist
// middleware section 2f uses to 404 unknown specialisations at the edge.
//
// Two independent checks, because the file being too NARROW would 404 a real
// page: a worse outcome than the soft 404 it exists to fix.
//
//   1. Freshness. Rebuild from the resolver and diff against the committed
//      file. Catches a lib/data.ts or programs-manifest.json edit that was
//      committed without regenerating.
//   2. Sitemap coverage. Every /universities/{uni}/{prog}/{spec} URL in
//      valid-urls.json must be allowed. This does not share the generator's
//      candidate enumeration, so it catches an enumeration bug that check 1
//      would agree with by construction.
//
// Fix: npx tsx scripts/build-spec-allowlist.mts, then stage the diff.

import { readFileSync } from 'fs'
import { buildSpecAllowlist, PROGRAMME_LABELS, type SpecAllowlist } from './spec-allowlist-source'

const FILE = 'lib/data/spec-allowlist.json'
let hardFail = false

let committed: SpecAllowlist
try {
  committed = JSON.parse(readFileSync(FILE, 'utf8'))
} catch {
  console.error(`FAIL: ${FILE} is missing or unreadable. Run: npx tsx scripts/build-spec-allowlist.mts`)
  process.exit(1)
}

// ── 1. Freshness ────────────────────────────────────────────────────────────
const { payload: fresh } = buildSpecAllowlist()
const toSet = (a: SpecAllowlist) => {
  const out = new Set<string>()
  for (const [key, idxs] of Object.entries(a.m)) for (const i of idxs) out.add(`${key}|${a.s[i]}`)
  return out
}
const committedSet = toSet(committed)
const freshSet = toSet(fresh)

const stale: string[] = []
const extra: string[] = []
for (const t of freshSet) if (!committedSet.has(t)) stale.push(t)
for (const t of committedSet) if (!freshSet.has(t)) extra.push(t)

if (stale.length || extra.length) {
  console.error(`FAIL: ${FILE} is stale against resolveSpec().`)
  if (stale.length) {
    console.error(`  resolver accepts, file omits (${stale.length}). Edge would 404 pages that render:`)
    for (const t of stale.slice(0, 15)) console.error(`    - ${t}`)
    if (stale.length > 15) console.error(`    ...and ${stale.length - 15} more`)
  }
  if (extra.length) {
    console.error(`  file allows, resolver rejects (${extra.length}). Edge would let a soft 404 through:`)
    for (const t of extra.slice(0, 15)) console.error(`    - ${t}`)
    if (extra.length > 15) console.error(`    ...and ${extra.length - 15} more`)
  }
  console.error('')
  console.error('Fix: npx tsx scripts/build-spec-allowlist.mts and stage the diff.')
  hardFail = true
} else {
  console.log(`OK. ${FILE} (${committedSet.size} triples, ${committed.s.length} slugs) agrees with resolveSpec.`)
}

// ── 2. Sitemap coverage ─────────────────────────────────────────────────────
const validUrls: string[] = JSON.parse(readFileSync('lib/data/valid-urls.json', 'utf8'))
const specUrls = validUrls.filter(u => /^\/universities\/[^/]+\/[^/]+\/[^/]+$/.test(u))
const uncovered: string[] = []

for (const url of specUrls) {
  const [, , uniId, progSlug, specSlug] = url.split('/')
  if (!PROGRAMME_LABELS[progSlug]) continue
  const idxs = committed.m[`${uniId}|${progSlug}`]
  const ok = idxs ? idxs.some(i => committed.s[i] === specSlug) : false
  if (!ok) uncovered.push(url)
}

if (uncovered.length) {
  console.error(`FAIL: ${uncovered.length} of ${specUrls.length} sitemap spec URLs are NOT in the allowlist.`)
  console.error('      Middleware section 2f would 404 URLs this site publishes in its own sitemap.')
  for (const u of uncovered.slice(0, 15)) console.error(`    - ${u}`)
  if (uncovered.length > 15) console.error(`    ...and ${uncovered.length - 15} more`)
  hardFail = true
} else {
  console.log(`OK. all ${specUrls.length} sitemap spec URLs are allowed by ${FILE}.`)
}

if (hardFail) process.exit(1)
