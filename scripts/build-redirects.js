/**
 * scripts/build-redirects.js
 * Reads audit-report.csv + lib/data/valid-urls.json and builds 301 redirect rules.
 *
 * Strategy (in order):
 *  1. Auto-fix known slug normalisations (b-com→bcom, m-com→mcom, program prefix removal)
 *  2. Auto-fix common old-slug truncation typos
 *  3. Check if corrected path is a valid URL
 *  4. Levenshtein distance ≤ 2 against valid paths (handles minor typos)
 *  5. Fall back to parent path (drop last segment) if parent is valid
 *  6. Unmatched → written to scripts/unmapped-broken-urls.md
 *
 * Output:
 *   lib/data/redirects.json            — Next.js redirect rules array
 *   scripts/unmapped-broken-urls.md    — URLs that could not be mapped
 *
 * Run: node scripts/build-redirects.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const AUDIT_CSV  = path.join(ROOT, 'audit-report.csv')
const VALID_JSON = path.join(ROOT, 'lib', 'data', 'valid-urls.json')
const OUT_REDIR  = path.join(ROOT, 'lib', 'data', 'redirects.json')
const OUT_UNMAPPED = path.join(__dirname, 'unmapped-broken-urls.md')

// ── Load valid URLs ───────────────────────────────────────────────────────────
if (!fs.existsSync(VALID_JSON)) {
  console.error('ERROR: valid-urls.json not found. Run: npm run build:urls')
  process.exit(1)
}
const validUrlsList = JSON.parse(fs.readFileSync(VALID_JSON, 'utf8'))
const validSet = new Set(validUrlsList)

// ── Parse CSV (simple quoted-field parser) ────────────────────────────────────
if (!fs.existsSync(AUDIT_CSV)) {
  console.error('ERROR: audit-report.csv not found at project root.')
  process.exit(1)
}

function parseCsvLine(line) {
  const vals = []
  let inQ = false, cur = ''
  for (const c of line) {
    if (c === '"') { inQ = !inQ }
    else if (c === ',' && !inQ) { vals.push(cur); cur = '' }
    else cur += c
  }
  vals.push(cur)
  return vals
}

const csvLines = fs.readFileSync(AUDIT_CSV, 'utf8').split('\n').filter(Boolean)
const headers = parseCsvLine(csvLines[0])
const rows = csvLines.slice(1).map(line => {
  const vals = parseCsvLine(line)
  const obj = {}
  headers.forEach((h, i) => { obj[h] = vals[i] || '' })
  return obj
})

// Filter broken: non-200 OR title says not found
const brokenRows = rows.filter(r =>
  r.status !== '200' || r.TITLE_SAYS_NOT_FOUND === 'TRUE'
)
console.log(`Total rows audited: ${rows.length}`)
console.log(`Broken rows: ${brokenRows.length}`)

// ── Slug normalisations ───────────────────────────────────────────────────────

// Program slug canonicalisation (hyphenated → canonical)
const PROG_NORM = {
  'b-com':   'bcom',
  'm-com':   'mcom',
  'b-sc':    'bsc',
  'm-sc':    'msc',
  'b-a':     'ba',
  'm-a':     'ma',
  'b-b-a':   'bba',
  'b-c-a':   'bca',
  'm-b-a':   'mba',
  'm-c-a':   'mca',
  // Online-prefixed variants
  'online-mba':  'mba',
  'online-mca':  'mca',
  'online-bba':  'bba',
  'online-bca':  'bca',
  'online-bcom': 'bcom',
  'online-mcom': 'mcom',
  'online-ba':   'ba',
  'online-ma':   'ma',
  'online-bsc':  'bsc',
  'online-msc':  'msc',
}

// University slug truncation typos (old slugs → new slugs)
// Applied as substring replacements on the university slug segment
const UNI_TYPOS = [
  ['universi-of',         'university-of'],
  ['universi',            'university'],
  ['vishwavidyala',       'vishwavidyalaya'],
  ['vishwavi',            'vishwavidyalaya'],
  ['vidhyapit',           'vidyapith'],
  ['vidyapit',            'vidyapith'],
  ['institut-of',         'institute-of'],
  ['institut',            'institute'],
  ['technolo',            'technology'],
  ['internat-',           'international-'],
  ['internat',            'international'],
  ['managemen',           'management'],
  ['educatio-',           'education-'],
  ['educatio',            'education'],
  ['foundati-',           'foundation-'],
  ['foundati',            'foundation'],
  ['science-and-technolo', 'science-and-technology'],
]

function fixUniSlug(slug) {
  let s = slug
  for (const [from, to] of UNI_TYPOS) {
    if (s.includes(from)) {
      s = s.split(from).join(to)
    }
  }
  return s
}

// Levenshtein distance (bounded at maxDist+1 for performance)
function levenshtein(a, b, maxDist = 2) {
  if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1]
        ? dp[j - 1]
        : 1 + Math.min(dp[j - 1], dp[j], prev)
      dp[j - 1] = prev
      prev = val
    }
    dp[b.length] = prev
  }
  return dp[b.length]
}

// Find closest valid URL path for a given (broken) path
// Only search within same path depth and prefix for performance
function findClosest(brokenPath, validPaths) {
  const depth = brokenPath.split('/').length
  const candidates = validPaths.filter(p => p.split('/').length === depth)

  let bestPath = null
  let bestDist = 3 // threshold: must be ≤ 2

  // Compare only the slug segments (not full path) for speed
  const brokenSegs = brokenPath.split('/')
  const prefix = brokenSegs.slice(0, -1).join('/') // all but last segment

  // Prioritise same-prefix candidates
  const samePrefixCandidates = candidates.filter(p => p.startsWith(prefix + '/'))
  const search = samePrefixCandidates.length > 0 ? samePrefixCandidates : candidates

  for (const p of search) {
    const dist = levenshtein(brokenPath, p, 2)
    if (dist < bestDist) {
      bestDist = dist
      bestPath = p
    }
  }
  return bestPath
}

// ── Build redirects ───────────────────────────────────────────────────────────
const redirects = []
const unmapped = []
const seen = new Set() // avoid duplicate source paths

let countNorm = 0, countTypo = 0, countLev = 0, countParent = 0, countUnmapped = 0

for (const row of brokenRows) {
  const fullUrl = row.url
  const brokenPath = fullUrl.replace('https://edifyedu.in', '')

  // Skip if already handled
  if (seen.has(brokenPath)) continue
  seen.add(brokenPath)

  // Skip if it's somehow already valid (shouldn't happen but guard)
  if (validSet.has(brokenPath)) continue

  const segments = brokenPath.split('/')  // ['', 'universities', '{slug}', '{prog}', ...]

  let candidatePath = brokenPath

  // ── Step 1: Normalise program slug in segment 3 (uni paths) or 2 (prog paths) ──
  let normalised = false
  if (segments[1] === 'universities' && segments.length >= 4) {
    const progSeg = segments[3]
    if (PROG_NORM[progSeg]) {
      segments[3] = PROG_NORM[progSeg]
      candidatePath = segments.join('/')
      normalised = true
    }
  }
  if (segments[1] === 'programs' && segments.length >= 3) {
    const progSeg = segments[2]
    if (PROG_NORM[progSeg]) {
      segments[2] = PROG_NORM[progSeg]
      candidatePath = segments.join('/')
      normalised = true
    }
  }

  if (normalised && validSet.has(candidatePath)) {
    redirects.push({ source: brokenPath, destination: candidatePath, permanent: true })
    countNorm++
    continue
  }

  // ── Step 2: Fix university slug typos ────────────────────────────────────
  if (segments[1] === 'universities' && segments.length >= 3) {
    const fixed = fixUniSlug(segments[2])
    if (fixed !== segments[2]) {
      const fixedSegs = [...segments]
      fixedSegs[2] = fixed
      const fixedPath = fixedSegs.join('/')
      if (validSet.has(fixedPath)) {
        redirects.push({ source: brokenPath, destination: fixedPath, permanent: true })
        countTypo++
        continue
      }
    }
  }

  // ── Step 3: Levenshtein ≤ 2 against valid paths ────────────────────────
  const closest = findClosest(candidatePath, validUrlsList)
  if (closest && levenshtein(candidatePath, closest, 2) <= 2) {
    redirects.push({ source: brokenPath, destination: closest, permanent: true })
    countLev++
    continue
  }

  // ── Step 4: Fall back to parent path (drop last segment) ──────────────
  const parentSegs = candidatePath.split('/').slice(0, -1)
  const parentPath = parentSegs.join('/') || '/'
  if (parentPath !== '/' && validSet.has(parentPath)) {
    redirects.push({ source: brokenPath, destination: parentPath, permanent: true })
    countParent++
    continue
  }

  // ── Unmapped ──────────────────────────────────────────────────────────
  unmapped.push({ path: brokenPath, status: row.status, title: row.title })
  countUnmapped++
}

// ── Write redirects.json ──────────────────────────────────────────────────────
fs.writeFileSync(OUT_REDIR, JSON.stringify({ redirects }, null, 2))
console.log(`\nRedirect summary:`)
console.log(`  Slug normalisation (b-com→bcom etc.): ${countNorm}`)
console.log(`  Uni slug typo fixes:                  ${countTypo}`)
console.log(`  Levenshtein ≤ 2 matches:              ${countLev}`)
console.log(`  Parent-path fallbacks:                ${countParent}`)
console.log(`  Unmapped (no match):                  ${countUnmapped}`)
console.log(`  ─────────────────────────────────────────────`)
console.log(`  TOTAL redirects:                      ${redirects.length}`)
console.log(`\nWrote: ${OUT_REDIR}`)

// ── Write unmapped report ─────────────────────────────────────────────────────
const unmappedMd = [
  '# Unmapped Broken URLs',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Total unmapped: ${unmapped.length}`,
  '',
  '| Path | Status | Title |',
  '|---|---|---|',
  ...unmapped.map(u => `| \`${u.path}\` | ${u.status} | ${u.title.slice(0, 60)} |`),
].join('\n')

fs.writeFileSync(OUT_UNMAPPED, unmappedMd)
console.log(`Wrote: ${OUT_UNMAPPED}`)
console.log('\nDone.')
