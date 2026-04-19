/**
 * scripts/build-valid-urls.js
 * Reads data/EdifyEdu_Unified_Programs_v3.xlsx (Programs sheet) and emits:
 *   lib/data/valid-urls.json    — flat array of path strings for sitemap
 *   lib/data/programs-manifest.json — full row data for spec name lookups
 *
 * Run: node scripts/build-valid-urls.js
 * Or via: npm run build:urls
 */

const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const EXCEL_PATH = path.join(ROOT, 'data', 'EdifyEdu_Unified_Programs_v3.xlsx')
const OUT_DIR = path.join(ROOT, 'lib', 'data')
const OUT_URLS = path.join(OUT_DIR, 'valid-urls.json')
const OUT_MANIFEST = path.join(OUT_DIR, 'programs-manifest.json')

// Normalize column headers: "University Slug" → "university_slug"
function normalizeKey(k) {
  return String(k).toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

// Valid programs accepted by the site
const VALID_PROGRAMS = new Set(['mba', 'bba', 'bca', 'mca', 'bcom', 'mcom', 'ba', 'ma', 'msc', 'bsc'])

// Static pages always in sitemap
const STATIC_URLS = [
  '/',
  '/universities',
  '/programs',
  '/compare',
  '/about',
  '/contact',
  '/coupons',
  '/privacy-policy',
  '/blog',
  '/guides',
]

// ── Read Excel ────────────────────────────────────────────────────────────────
if (!fs.existsSync(EXCEL_PATH)) {
  console.error('ERROR: Excel file not found at', EXCEL_PATH)
  process.exit(1)
}

const wb = XLSX.readFile(EXCEL_PATH)

// Find the Programs sheet (case-insensitive)
const sheetName = wb.SheetNames.find(n => n.toLowerCase() === 'programs') || wb.SheetNames[0]
if (!sheetName) {
  console.error('ERROR: No sheets found in workbook.')
  process.exit(1)
}

console.log(`Reading sheet: "${sheetName}" from ${path.basename(EXCEL_PATH)}`)

const ws = wb.Sheets[sheetName]
const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' })

console.log(`Found ${rawRows.length} rows`)

if (rawRows.length === 0) {
  console.error('ERROR: Sheet is empty.')
  process.exit(1)
}

// Show discovered columns
const firstRaw = rawRows[0]
const normalizedHeaders = Object.keys(firstRaw).map(k => `"${k}" → "${normalizeKey(k)}"`)
console.log('Columns:', normalizedHeaders.join(', '))

// Normalize all rows
const rows = rawRows.map(r => {
  const out = {}
  for (const [k, v] of Object.entries(r)) {
    out[normalizeKey(k)] = String(v ?? '').trim()
  }
  return out
})

// Detect column names (try common variants)
function findCol(sampleRow, ...candidates) {
  for (const c of candidates) {
    if (c in sampleRow) return c
  }
  return null
}

const sample = rows[0] || {}
const uniCol    = findCol(sample, 'university_slug', 'slug', 'uni_slug', 'university_id', 'university')
const progCol   = findCol(sample, 'program', 'program_slug', 'degree', 'prog', 'course')
const specCol   = findCol(sample, 'spec_slug', 'specialization_slug', 'specialisation_slug', 'spec', 'specialization_id')
const nameCol   = findCol(sample, 'spec_name', 'spec_display_name', 'specialization_name', 'specialisation_name', 'spec_display', 'specialization', 'specialisation')

if (!uniCol || !progCol) {
  console.error('\nERROR: Cannot locate required columns.')
  console.error('Available columns:', Object.keys(sample).join(', '))
  console.error('Expected: university_slug, program, [spec_slug], [spec_name]')
  process.exit(1)
}

console.log(`\nUsing columns:`)
console.log(`  university_slug → "${uniCol}"`)
console.log(`  program         → "${progCol}"`)
console.log(`  spec_slug       → "${specCol || '(not found)'}"`)
console.log(`  spec_name       → "${nameCol || '(not found)'}"`)

// ── Build URL sets ────────────────────────────────────────────────────────────
const uniSlugs      = new Set()
const uniProgPairs  = new Set()
const uniSpecTriples = new Set()
const programs      = new Set()
const programSpecs  = new Set()
const manifest      = []

let skipped = 0
let processed = 0

for (const row of rows) {
  const uniSlug = row[uniCol]
  const rawProg = row[progCol]
  const program = rawProg.toLowerCase().trim()
  const specSlug = specCol ? (row[specCol] || '').toLowerCase().trim() : ''
  const specName = nameCol ? (row[nameCol] || '').trim() : ''

  if (!uniSlug || !program) { skipped++; continue }
  if (!VALID_PROGRAMS.has(program)) { skipped++; continue }

  processed++
  uniSlugs.add(uniSlug)
  uniProgPairs.add(`${uniSlug}/${program}`)
  programs.add(program)

  manifest.push({
    university_slug: uniSlug,
    program,
    spec_slug: specSlug,
    spec_name: specName,
  })

  if (specSlug) {
    uniSpecTriples.add(`${uniSlug}/${program}/${specSlug}`)
    programSpecs.add(`${program}/${specSlug}`)
  }
}

console.log(`\nProcessed: ${processed} rows, Skipped: ${skipped}`)

// ── Assemble URL list ─────────────────────────────────────────────────────────
const urls = [
  ...STATIC_URLS,
  ...[...uniSlugs].sort().map(s  => `/universities/${s}`),
  ...[...uniProgPairs].sort().map(s  => `/universities/${s}`),
  ...[...uniSpecTriples].sort().map(s => `/universities/${s}`),
  ...[...programs].sort().map(p  => `/programs/${p}`),
  ...[...programSpecs].sort().map(s  => `/programs/${s}`),
]

// Remove duplicates (shouldn't exist but guard anyway)
const uniqueUrls = [...new Set(urls)]

// ── Log breakdown ─────────────────────────────────────────────────────────────
console.log('\nURL breakdown:')
console.log(`  Static pages:                      ${STATIC_URLS.length}`)
console.log(`  /universities/{slug}:               ${uniSlugs.size}`)
console.log(`  /universities/{slug}/{program}:     ${uniProgPairs.size}`)
console.log(`  /universities/{slug}/{prog}/{spec}: ${uniSpecTriples.size}`)
console.log(`  /programs/{program}:                ${programs.size}`)
console.log(`  /programs/{program}/{spec}:         ${programSpecs.size}`)
console.log(`  ─────────────────────────────────────────────`)
console.log(`  TOTAL unique URLs:                 ${uniqueUrls.length}`)

// ── Write outputs ─────────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT_URLS, JSON.stringify(uniqueUrls, null, 2))
fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2))

console.log(`\nWrote: ${OUT_URLS}`)
console.log(`Wrote: ${OUT_MANIFEST}`)
console.log('\nDone.')
