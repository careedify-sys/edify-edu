/**
 * scripts/verify-rescue-narrowing.ts
 *
 * Verifies the STEP 3 rescue-narrowing change in lib/data/programs.ts:
 *
 *   1. All 238 URLs in audits/fabricated-spec-urls-2026-08-17.csv still
 *      resolve to a non-null display name (page renders 200).
 *   2. The five nonsense slugs below resolve to null (page 404s).
 *   3. Sitemap URL count in valid-urls.json is unchanged versus the baseline
 *      recorded in this file (rescue changes do not touch valid-urls.json,
 *      but we assert it to prove the pipeline is intact).
 *   4. STEP 7 acronym map: hr-management -> "HR Management", it -> "IT",
 *      esg -> "ESG", etc.
 *
 * Run: npx tsx scripts/verify-rescue-narrowing.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveSpecName } from '../lib/data/programs'

const ROOT = process.cwd()
const CSV = join(ROOT, 'audits', 'fabricated-spec-urls-2026-08-17.csv')
const URLS = join(ROOT, 'lib', 'data', 'valid-urls.json')

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }

// Five slugs that pass the alphanumeric shape check but have no manifest row.
// These MUST return null after the fix.
const NONSENSE = [
  { uni: 'amity-university-online',              program: 'mba', slug: 'completely-fake-spec' },
  { uni: 'amity-university-online',              program: 'mca', slug: 'xyz-not-real' },
  { uni: 'amrita-vishwa-vidyapeetham-online',    program: 'bba', slug: 'nonexistent-thing' },
  { uni: 'chandigarh-university-online',         program: 'bca', slug: 'imaginary-spec-123' },
  { uni: 'bharati-vidyapeeth-university-online', program: 'mba', slug: 'foobar-mystery' },
]

// Baseline captured on 2026-08-17 pre-fix (array length from valid-urls.json).
// Rescue change does not touch sitemap generation, so this must stay identical.
const SITEMAP_BASELINE = 2004

interface Row { url: string; uni: string; programme: string; slug: string; name: string }

function parseCsv(text: string): Row[] {
  const lines = text.trim().split('\n').slice(1) // drop header
  return lines.map(line => {
    const cells = line.match(/"([^"]|"")*"/g)!.map(c => c.slice(1, -1).replace(/""/g, '"'))
    return { url: cells[0], uni: cells[1], programme: cells[2], slug: cells[3], name: cells[4] }
  })
}

function main() {
  const rows = parseCsv(readFileSync(CSV, 'utf8'))
  const validUrls: string[] = JSON.parse(readFileSync(URLS, 'utf8'))

  let renderPass = 0, renderFail: string[] = []
  for (const r of rows) {
    const prog = r.programme.toLowerCase()
    const label = PROG_LABEL[prog]
    const name = resolveSpecName(r.uni, label, prog, r.slug)
    if (name) renderPass++
    else renderFail.push(r.url)
  }

  let nfPass = 0, nfFail: string[] = []
  for (const n of NONSENSE) {
    const label = PROG_LABEL[n.program]
    const name = resolveSpecName(n.uni, label, n.program, n.slug)
    if (name === null) nfPass++
    else nfFail.push(`/universities/${n.uni}/${n.program}/${n.slug} => "${name}"`)
  }

  const acronymChecks: Array<[string, string, string, string, string]> = [
    ['amity-university-online',              'MBA', 'mba', 'hr-management', 'HR Management'],
    ['amrita-vishwa-vidyapeetham-online',    'MBA', 'mba', 'esg',           'ESG'],
    ['bharati-vidyapeeth-university-online', 'BBA', 'bba', 'it',            'IT'],
    ['chandigarh-university-online',         'MBA', 'mba', 'it-management', 'IT Management'],
    ['chandigarh-university-online',         'MCA', 'mca', 'artificial-intelligence-machine-learning', 'Artificial Intelligence Machine Learning'],
  ]
  let acPass = 0, acFail: string[] = []
  for (const [uni, label, prog, slug, expected] of acronymChecks) {
    const got = resolveSpecName(uni, label, prog, slug)
    if (got === expected) acPass++
    else acFail.push(`${uni}/${prog}/${slug} expected "${expected}" got "${got}"`)
  }

  const sitemapPass = validUrls.length === SITEMAP_BASELINE

  console.log(`238-URL render check:   ${renderPass}/${rows.length}${renderFail.length ? ' FAIL' : ' OK'}`)
  for (const u of renderFail.slice(0, 10)) console.log(`  FAIL: ${u}`)
  console.log(`5-nonsense 404 check:   ${nfPass}/${NONSENSE.length}${nfFail.length ? ' FAIL' : ' OK'}`)
  for (const u of nfFail) console.log(`  FAIL: ${u}`)
  console.log(`Acronym casing check:   ${acPass}/${acronymChecks.length}${acFail.length ? ' FAIL' : ' OK'}`)
  for (const u of acFail) console.log(`  FAIL: ${u}`)
  console.log(`Sitemap URL count:      ${validUrls.length} vs baseline ${SITEMAP_BASELINE} ${sitemapPass ? 'OK' : 'FAIL'}`)

  const allPass = renderFail.length === 0 && nfFail.length === 0 && acFail.length === 0 && sitemapPass
  process.exit(allPass ? 0 : 1)
}

main()
