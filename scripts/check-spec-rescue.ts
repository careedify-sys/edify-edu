/**
 * scripts/check-spec-rescue.ts
 *
 * Pre-commit gate. Two guarantees:
 *
 *   1. Every /universities/{uni}/{mba|bba|bca|mca}/{spec} URL in the sitemap
 *      (valid-urls.json) resolves to a non-null display name. If any URL fails
 *      here, the page would 404 for real users. Fix the manifest or drop the
 *      URL from the sitemap before committing.
 *
 *   2. A representative set of nonsense slugs still returns null after the
 *      commit. This blocks any change that re-widens the rescue and reopens
 *      the fabricated-URL surface enumerated in
 *      audits/fabricated-spec-urls-2026-08-17.csv.
 *
 * Run: npx tsx scripts/check-spec-rescue.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveSpecName } from '../lib/data/programs'
import { getUniversityById } from '../lib/data'

const ROOT = process.cwd()
const URLS = join(ROOT, 'lib', 'data', 'valid-urls.json')

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }

const NONSENSE = [
  { uni: 'amity-university-online',              program: 'mba', slug: 'completely-fake-spec' },
  { uni: 'amity-university-online',              program: 'mca', slug: 'xyz-not-real' },
  { uni: 'amrita-vishwa-vidyapeetham-online',    program: 'bba', slug: 'nonexistent-thing' },
  { uni: 'chandigarh-university-online',         program: 'bca', slug: 'imaginary-spec-123' },
  { uni: 'bharati-vidyapeeth-university-online', program: 'mba', slug: 'foobar-mystery' },
]

const validUrls: string[] = JSON.parse(readFileSync(URLS, 'utf8'))

// 1. Sitemap URLs must all resolve
const specRe = /^\/universities\/([^/]+)\/(mba|bba|bca|mca)\/([^/]+)$/
let sitemapChecked = 0
let sitemapFail: string[] = []
for (const path of validUrls) {
  const m = path.match(specRe)
  if (!m) continue
  sitemapChecked++
  const [_all, uni, prog, slug] = m
  const label = PROG_LABEL[prog]
  const u = getUniversityById(uni)
  if (!u) { sitemapFail.push(`${path}  (unknown university)`); continue }
  const pd = (u.programDetails as Record<string, unknown>)[label]
  if (!pd) continue // page redirects to /universities/{uni}, not a resolve failure
  const name = resolveSpecName(uni, label, prog, slug)
  if (!name) sitemapFail.push(`${path}  (resolveSpecName returned null)`)
}

// 2. Nonsense slugs must return null
let nonsenseFail: string[] = []
for (const n of NONSENSE) {
  const name = resolveSpecName(n.uni, PROG_LABEL[n.program], n.program, n.slug)
  if (name !== null) nonsenseFail.push(`/universities/${n.uni}/${n.program}/${n.slug} => "${name}"`)
}

if (sitemapFail.length === 0 && nonsenseFail.length === 0) {
  console.log(`check-spec-rescue: OK (${sitemapChecked} sitemap URLs resolve, ${NONSENSE.length} nonsense slugs return null)`)
  process.exit(0)
}

if (sitemapFail.length) {
  console.error(`check-spec-rescue: ${sitemapFail.length} sitemap URL(s) resolve to null`)
  for (const u of sitemapFail.slice(0, 20)) console.error(`  ${u}`)
  console.error('Fix: add the row to programs-manifest.json or drop the URL from the sitemap.')
}
if (nonsenseFail.length) {
  console.error(`check-spec-rescue: ${nonsenseFail.length} nonsense slug(s) resolved to a name (rescue widened)`)
  for (const u of nonsenseFail) console.error(`  ${u}`)
  console.error('Fix: keep resolveSpecName rescue gated on an exact manifest row.')
}
process.exit(1)
