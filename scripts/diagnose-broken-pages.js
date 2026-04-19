// scripts/diagnose-broken-pages.js
// Read audit-report.csv, categorise TITLE_SAYS_NOT_FOUND and non-200 pages
// Output: scripts/broken-pages-report.md
// Usage: node scripts/diagnose-broken-pages.js

'use strict'

const fs = require('fs')
const path = require('path')

const CSV_PATH = path.join(__dirname, '..', 'audit-report.csv')
const OUT_PATH = path.join(__dirname, 'broken-pages-report.md')

// ── Minimal CSV parser (handles quoted fields) ────────────────────────────────
function parseCsv(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = parseLine(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseLine(line)
    const row = {}
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim() })
    return row
  })
}

function parseLine(line) {
  const result = []
  let inQuote = false
  let cur = ''
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = {
  CAT_A: 'University-level page shows "Not Found" — university ID may be invalid or deleted',
  CAT_B: 'Program-level page shows "Not Found" — program not offered by university',
  CAT_C: 'Spec-level page shows "Not Found" — spec slug has no match in university data',
  CAT_D: 'Blog page shows "Not Found" — blog post may have been removed or slug changed',
  CAT_E: 'HTTP non-200 — server returned an error or redirect',
  CAT_F: 'Other — title contains "Not Found" but URL pattern is unrecognised',
}

function categorise(row) {
  const url = row.url || ''
  const status = parseInt(row.status || '200', 10)
  const titleNotFound = row.TITLE_SAYS_NOT_FOUND === 'TRUE'

  if (status !== 200) return 'CAT_E'
  if (!titleNotFound) return null

  const u = new URL(url)
  const parts = u.pathname.replace(/^\//, '').split('/')

  // /blog/{slug}
  if (parts[0] === 'blog') return 'CAT_D'

  // /universities/{id}/{program}/{spec}  → 4 parts
  if (parts[0] === 'universities' && parts.length >= 4) return 'CAT_C'

  // /universities/{id}/{program}  → 3 parts
  if (parts[0] === 'universities' && parts.length === 3) return 'CAT_B'

  // /universities/{id}  → 2 parts
  if (parts[0] === 'universities' && parts.length === 2) return 'CAT_A'

  return 'CAT_F'
}

// ── Main ──────────────────────────────────────────────────────────────────────
if (!fs.existsSync(CSV_PATH)) {
  console.error('audit-report.csv not found. Run: npm run audit first.')
  process.exit(1)
}

const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'))
const broken = rows.filter(r => r.TITLE_SAYS_NOT_FOUND === 'TRUE' || (parseInt(r.status || '200', 10) !== 200))

const buckets = { CAT_A: [], CAT_B: [], CAT_C: [], CAT_D: [], CAT_E: [], CAT_F: [] }
for (const row of broken) {
  const cat = categorise(row)
  if (cat) buckets[cat].push(row)
}

// ── Build report ──────────────────────────────────────────────────────────────
const lines = []
lines.push('# Broken Pages Diagnostic Report')
lines.push('')
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`)
lines.push(`Total broken pages: ${broken.length}`)
lines.push('')
lines.push('## Summary')
lines.push('')
lines.push('| Category | Count | Description |')
lines.push('|---|---|---|')
for (const [cat, desc] of Object.entries(CATEGORIES)) {
  lines.push(`| ${cat} | ${buckets[cat].length} | ${desc} |`)
}
lines.push('')

for (const [cat, desc] of Object.entries(CATEGORIES)) {
  const items = buckets[cat]
  if (items.length === 0) continue
  lines.push(`## ${cat}: ${desc}`)
  lines.push(`Count: ${items.length}`)
  lines.push('')

  if (cat === 'CAT_E') {
    // Show status + URL
    lines.push('| Status | URL |')
    lines.push('|---|---|')
    for (const r of items.slice(0, 100)) {
      lines.push(`| ${r.status} | ${r.url} |`)
    }
    if (items.length > 100) lines.push(`| ... | (${items.length - 100} more) |`)
  } else {
    lines.push('| URL | Title |')
    lines.push('|---|---|')
    for (const r of items.slice(0, 100)) {
      const title = (r.title || '').replace(/\|/g, '\\|')
      lines.push(`| ${r.url} | ${title} |`)
    }
    if (items.length > 100) lines.push(`| ... | (${items.length - 100} more) |`)
  }
  lines.push('')

  // Category-specific recommendations
  if (cat === 'CAT_A') {
    lines.push('**Recommended action:** Check if these university IDs exist in `lib/data.ts`. If the university was removed, add 301 redirects in `next.config.js` to the `/universities` listing page.')
  } else if (cat === 'CAT_B') {
    lines.push('**Recommended action:** These program routes returned a page that says "Not Found". Check that the program is listed in `u.programs` for each university. If the program was removed, redirect to the university landing page `/universities/{id}`.')
  } else if (cat === 'CAT_C') {
    lines.push('**Recommended action:** These spec slugs do not match any entry in `u.programDetails[program].specs`. Options: (1) add the spec to the data, (2) fix the slug via a redirect, (3) return a proper 404 rather than a rendered "not found" page.')
  } else if (cat === 'CAT_D') {
    lines.push('**Recommended action:** These blog slugs were removed or renamed. Check if a redirect is needed in `lib/blog-redirects.ts` (or equivalent). If the post no longer exists, ensure a proper 404 is returned.')
  } else if (cat === 'CAT_E') {
    lines.push('**Recommended action:** Investigate each non-200 response. 404s may need redirects; 5xx errors indicate server-side rendering failures and should be fixed immediately.')
  } else if (cat === 'CAT_F') {
    lines.push('**Recommended action:** Manually inspect each URL to determine the correct fix.')
  }
  lines.push('')
}

fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8')
console.log(`Written: ${OUT_PATH}`)
console.log(`Total broken: ${broken.length}`)
for (const [cat, items] of Object.entries(buckets)) {
  if (items.length > 0) console.log(`  ${cat}: ${items.length}`)
}
