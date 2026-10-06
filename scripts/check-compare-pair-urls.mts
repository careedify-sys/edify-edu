// scripts/check-compare-pair-urls.mts
//
// Keeps the /compare/[pair] sitemap entries in scripts/lib/static-urls.js in
// exact sync with PAIR_SLUGS in app/compare/[pair]/pairs.ts.
//
// Why this gate exists. On 2026-10-06 every /compare/[pair] page was prerendered
// and linked from /compare, and not one of them was in the sitemap: the live
// sitemap carried a single /compare URL, the hub. Google had found them by
// crawling, and they were the best-converting pages on the site at 1.4% to 2.8%
// CTR against a 0.55% site average.
//
// They are hand-listed in static-urls.js because that file is CommonJS and the
// pair list is TypeScript, and because static-urls.js is the one place both
// build-valid-urls.js and backfill-manifest-from-data.js read. Putting them
// anywhere later in the prebuild chain repeats the /methodology bug, where a
// second writer silently dropped a page from every build for five days. Hand
// lists drift, so this gate makes the drift fail the commit instead.
//
// Run: npx tsx scripts/check-compare-pair-urls.mts

import { createRequire } from 'node:module'
import { PAIR_SLUGS } from '../app/compare/[pair]/pairs'

const require = createRequire(import.meta.url)
const { STATIC_URLS } = require('./lib/static-urls') as { STATIC_URLS: string[] }

const PREFIX = '/compare/'

const expected = [...PAIR_SLUGS].map(s => PREFIX + s).sort()
const listed = STATIC_URLS.filter(u => u.startsWith(PREFIX)).sort()

// A gate that can pass by finding nothing is not a gate. If the parse or the
// import ever yields an empty set, fail loudly rather than report success.
if (expected.length === 0) {
  console.error('check-compare-pair-urls: PAIR_SLUGS is empty. Refusing to pass.')
  process.exit(1)
}

const missing = expected.filter(u => !listed.includes(u))
const extra = listed.filter(u => !expected.includes(u))
const dupes = listed.filter((u, i) => listed.indexOf(u) !== i)

if (missing.length || extra.length || dupes.length) {
  console.error('check-compare-pair-urls: FAILED')
  if (missing.length) {
    console.error(`\n  In pairs.ts but NOT in static-urls.js (${missing.length}).`)
    console.error('  These pages build and render but reach no sitemap:')
    for (const u of missing) console.error(`    ${u}`)
  }
  if (extra.length) {
    console.error(`\n  In static-urls.js but NOT in pairs.ts (${extra.length}).`)
    console.error('  These would be submitted to Google and return 404:')
    for (const u of extra) console.error(`    ${u}`)
  }
  if (dupes.length) {
    console.error(`\n  Duplicated in static-urls.js (${dupes.length}):`)
    for (const u of [...new Set(dupes)]) console.error(`    ${u}`)
  }
  console.error('\n  Fix: edit the /compare block in scripts/lib/static-urls.js to match pairs.ts.')
  process.exit(1)
}

console.log(`check-compare-pair-urls: OK (${expected.length} comparison pages, pairs.ts and static-urls.js agree).`)
