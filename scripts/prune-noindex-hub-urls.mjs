// scripts/prune-noindex-hub-urls.mjs
// Sprint 3 Task 1 sitemap sync. Keeps lib/data/valid-urls.json aligned with
// the shouldIndexProgrammeHub() decision so a URL is never listed in the
// sitemap AND emitting noindex at the same time. Never-both is the invariant:
//   - Published: in valid-urls.json AND robots.index === true
//   - Not published: NOT in valid-urls.json AND robots.index === false
//
// Modes:
//   default : prune valid-urls.json in place, write it back
//   --check : assert no drift; exit 1 if any hub URL in valid-urls.json would
//             emit noindex. Does not write.
//
// This script runs in the prebuild chain so a fresh Excel regeneration is
// always followed by an automatic re-prune. The --check flag is what CI /
// pre-commit hooks would call.
//
// Runs against every hub URL of the shape /universities/{u}/{p}. Spec URLs
// (/universities/{u}/{p}/{s}) are OUT OF SCOPE for this task — their policy
// stays as-is until the 18 August GSC read (see audits/spec-page-index-
// audit-2026-08-05.md).

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { shouldIndexProgrammeHub } from '../lib/seo/should-index.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const VALID_URLS = join(ROOT, 'lib', 'data', 'valid-urls.json')
const CHECK_ONLY = process.argv.includes('--check')

function progSlug(program) {
  return String(program).toLowerCase().replace('.', '')
}

// Build the set of noindex hub URLs from data.ts state.
const noindexHubUrls = new Set()
for (const u of UNIVERSITIES) {
  for (const program of u.programs) {
    if (!shouldIndexProgrammeHub(u, program).shouldIndex) {
      noindexHubUrls.add(`/universities/${u.id}/${progSlug(program)}`)
    }
  }
}

const urls = JSON.parse(readFileSync(VALID_URLS, 'utf8'))
const before = urls.length
const kept = urls.filter(u => !noindexHubUrls.has(u))
const removed = urls.filter(u => noindexHubUrls.has(u))

if (CHECK_ONLY) {
  if (removed.length > 0) {
    console.error(`FAIL: ${removed.length} URL(s) are in valid-urls.json AND would emit robots noindex:`)
    for (const u of removed) console.error(`  - ${u}`)
    console.error('')
    console.error('The sitemap must not declare a URL that emits noindex on the page.')
    console.error('Fix: run `node scripts/build-valid-urls.js && npx tsx scripts/prune-noindex-hub-urls.mjs`')
    console.error('     or let the prebuild chain do it on the next `npm run build`.')
    process.exit(1)
  }
  console.log(`OK. valid-urls.json (${before} URLs) contains no hub URL that would emit noindex.`)
  process.exit(0)
}

writeFileSync(VALID_URLS, JSON.stringify(kept, null, 2) + '\n', 'utf8')
console.log(`Pruned ${removed.length} noindex hub URL(s) from valid-urls.json (${before} -> ${kept.length}).`)
if (removed.length && removed.length <= 25) {
  for (const u of removed) console.log(`  - ${u}`)
} else if (removed.length > 25) {
  console.log(`  (list truncated; run --check to see all)`)
}
