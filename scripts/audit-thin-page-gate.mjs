// scripts/audit-thin-page-gate.mjs
// Sprint 3 Task 1 pre-commit audit. Walks every university x programme pair
// that produces a hub page and reports whether shouldIndexProgrammeHub would
// flip it to noindex, cross-referenced with valid-urls.json / sitemap and
// the Sprint 2 phantom sweep.
//
// Run: npx tsx scripts/audit-thin-page-gate.mjs

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PAGE_CONTENT_DIR = join(ROOT, 'lib', 'data', 'page-content')
const VALID_URLS_PATH  = join(ROOT, 'lib', 'data', 'valid-urls.json')
const PHANTOM_PATH     = join(ROOT, 'audits', 'phantom-programme-sweep-2026-08-05.md')

const contentFiles = new Set(
  readdirSync(PAGE_CONTENT_DIR).map(f => f.replace(/\.json$/, ''))
)

const validUrls = new Set(JSON.parse(readFileSync(VALID_URLS_PATH, 'utf8')))

const phantomSet = new Set()
if (existsSync(PHANTOM_PATH)) {
  const md = readFileSync(PHANTOM_PATH, 'utf8')
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^\|\s*([a-z0-9-]+)\s*\|\s*([A-Za-z.]+)\s*\|/)
    if (m && m[1] !== 'university_slug') {
      phantomSet.add(`${m[1]}|${m[2]}`)
    }
  }
}

function progSlug(program) {
  return String(program).toLowerCase().replace('.', '')
}

// Sprint 1: 11 MBA overrides. Sprint 2: 11 backfilled hub pages.
const SPRINT1 = [
  ['amity-university-online', 'MBA'],
  ['lovely-professional-university-online', 'MBA'],
  ['nmims-online', 'MBA'],
  ['galgotias-university-online', 'MBA'],
  ['jain-university-online', 'MBA'],
  ['chandigarh-university-online', 'MBA'],
  ['dy-patil-university-online', 'MBA'],
  ['ignou-online', 'MBA'],
  ['manipal-academy-higher-education-online', 'MBA'],
  ['sikkim-manipal-university-online', 'MBA'],
  ['symbiosis-university-online', 'MBA'],
]
const SPRINT2 = [
  ['galgotias-university-online', 'BBA'],
  ['galgotias-university-online', 'BCA'],
  ['kurukshetra-university-online', 'BBA'],
  ['kl-university-online', 'MBA'],
  ['gla-university-online', 'BBA'],
  ['gla-university-online', 'BCA'],
  ['gla-university-online', 'MCA'],
  ['vignan-university-online', 'BCA'],
  ['chandigarh-university-online', 'BCA'],
  ['dy-patil-university-online', 'BBA'],
  ['dy-patil-university-online', 'BCA'],
]

// Emulate shouldIndexProgrammeHub without importing the TS file (script also
// runs pre-build, before app tsconfig paths are wired).
function decide(u, program) {
  const pSlug = progSlug(program)
  const hasContentJson = contentFiles.has(`${u.id}-${pSlug}`)
  const feeOk = getDisplayFee(u, program).ok
  return { shouldIndex: hasContentJson || feeOk, hasContentJson, feeOk }
}

const flips = []
const byProg = {}
const sitemapFlips = []

for (const u of UNIVERSITIES) {
  for (const program of u.programs) {
    const d = decide(u, program)
    if (d.shouldIndex) continue
    const pSlug = progSlug(program)
    const url = `/universities/${u.id}/${pSlug}`
    const inSitemap = validUrls.has(url)
    flips.push({
      slug: u.id,
      program,
      url,
      hasJson: d.hasContentJson ? 'y' : 'n',
      feeOk: d.feeOk ? 'y' : 'n',
      inSitemap: inSitemap ? 'y' : 'n',
      phantom: phantomSet.has(`${u.id}|${program}`),
    })
    byProg[program] = (byProg[program] || 0) + 1
    if (inSitemap) sitemapFlips.push(url)
  }
}

// ── (a) Full flip list ──────────────────────────────────────────────────────
console.log('# Sprint 3 Task 1 — thin-page-gate pre-commit audit')
console.log('')
console.log('## (a) URLs that flip from index to noindex')
console.log('')
console.log('Columns: [J] has page-content JSON · [F] getDisplayFee ok · [S] currently in valid-urls.json/sitemap')
console.log('')
console.log('URL'.padEnd(78), 'J', 'F', 'S')
console.log('-'.repeat(88))
for (const f of flips) {
  console.log(f.url.padEnd(78), f.hasJson, f.feeOk, f.inSitemap)
}

console.log('')
console.log(`TOTAL flipping to noindex: ${flips.length}`)
console.log('')

// ── (b) By programme type ───────────────────────────────────────────────────
console.log('## (b) Breakdown by programme type')
console.log('')
for (const [p, n] of Object.entries(byProg).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(p).padEnd(8)} ${n}`)
}
console.log('')

// ── (c) Overlap with phantom sweep ──────────────────────────────────────────
const covered = flips.filter(f => f.phantom).map(f => `${f.slug}|${f.program}`)
const notCovered = [...phantomSet].filter(k => !flips.find(f => `${f.slug}|${f.program}` === k))
console.log('## (c) Overlap with audits/phantom-programme-sweep-2026-08-05.md')
console.log('')
console.log(`Phantom sweep entries covered by this gate: ${covered.length} of ${phantomSet.size}`)
console.log(`Phantom sweep entries NOT covered by this gate: ${notCovered.length}`)
if (notCovered.length) {
  console.log('  (These phantoms have a fee.ok=true OR a page-content JSON, so they stay indexed.)')
  for (const k of notCovered) console.log(`    - ${k}`)
}
console.log('')

// ── (d) Sitemap collision STOP condition ────────────────────────────────────
console.log('## (d) STOP-CONDITION check: does any URL currently in valid-urls.json flip?')
console.log('')
if (sitemapFlips.length === 0) {
  console.log('  OK. No page currently in valid-urls.json / sitemap would be deindexed.')
  console.log('  Every flip is a page the Excel workbook does not carry, so we lose nothing')
  console.log('  we deliberately publish.')
} else {
  console.log(`  STOP. ${sitemapFlips.length} URL(s) currently in the sitemap would flip to noindex:`)
  for (const u of sitemapFlips) console.log(`    - ${u}`)
}
console.log('')

// ── (e) Sprint 1 + Sprint 2 URLs — confirm unchanged ────────────────────────
console.log('## (e) Sprint 1 override + Sprint 2 backfill URLs — expected robots')
console.log('')
console.log('### Sprint 1 (11 MBA overrides)')
for (const [slug, program] of SPRINT1) {
  const u = UNIVERSITIES.find(x => x.id === slug)
  if (!u) { console.log(`  MISSING ${slug}|${program}`); continue }
  const d = decide(u, program)
  console.log(`  ${(slug + '|' + program).padEnd(50)} → index=${d.shouldIndex ? 'true ' : 'false'} follow=true  (json=${d.hasContentJson ? 'y' : 'n'} feeOk=${d.feeOk ? 'y' : 'n'})`)
}
console.log('')
console.log('### Sprint 2 (11 backfilled hub pages)')
for (const [slug, program] of SPRINT2) {
  const u = UNIVERSITIES.find(x => x.id === slug)
  if (!u) { console.log(`  MISSING ${slug}|${program}`); continue }
  const d = decide(u, program)
  console.log(`  ${(slug + '|' + program).padEnd(50)} → index=${d.shouldIndex ? 'true ' : 'false'} follow=true  (json=${d.hasContentJson ? 'y' : 'n'} feeOk=${d.feeOk ? 'y' : 'n'})`)
}
