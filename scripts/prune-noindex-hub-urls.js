// scripts/prune-noindex-hub-urls.js
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
// always followed by an automatic re-prune. The --check flag is what
// pre-commit calls.
//
// Runs against every hub URL of the shape /universities/{u}/{p}. Spec URLs
// (/universities/{u}/{p}/{s}) are OUT OF SCOPE for this task, their policy
// stays as-is until the 18 August GSC read (see audits/spec-page-index-
// audit-2026-08-05.md).
//
// Plain CommonJS to match verify-fees.js and backfill-manifest-from-data.js.
// Reads lib/data.ts as text and regex-parses only the fields shouldIndex
// needs; re-implements the boolean of shouldIndexProgrammeHub in JS.
// The .ts import version was preempted by Node 24's native type-strip on
// Vercel, which failed with "does not provide an export named 'UNIVERSITIES'"
// because tsx's ESM hook did not take priority over the built-in loader.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const VALID_URLS = path.join(ROOT, 'lib', 'data', 'valid-urls.json')
const DATA_TS = path.join(ROOT, 'lib', 'data.ts')
const PAGE_CONTENT_DIR = path.join(ROOT, 'lib', 'data', 'page-content')
const CHECK_ONLY = process.argv.includes('--check')

function progSlug(program) {
  return String(program).toLowerCase().replace('.', '')
}

// Resolve JS escape sequences inside a string literal captured verbatim
// from the .ts source. lib/data.ts uses ₹ for ₹ in most rows because
// the file was normalised out of an ASCII-only pipeline; the .ts import
// path decodes them at parse time, so the text-parse path here must do the
// same or fees that MATCH via tsx will parse as null via node.
function decodeStringLiteral(s) {
  if (!s) return s
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

// Mirrors lib/fees.ts parseFeeStr, accepts K/L suffixes, comma grouping,
// dash-separated ranges. Returns { min, max } in whole rupees or null.
function parseFeeStr(s) {
  if (!s) return null
  const cleaned = String(s).replace(/₹|Rs\.?|\s|,|\+/gi, '')
  const parts = cleaned.split(/[\u2013\u2014-]/) // en-dash, em-dash, hyphen
  if (parts.length === 0 || parts.length > 2) return null
  const parseOne = (p) => {
    const m = p.match(/^([\d.]+)([KL]?)$/i)
    if (!m) return null
    const n = parseFloat(m[1])
    if (isNaN(n)) return null
    const suf = m[2].toUpperCase()
    if (suf === 'K') return Math.round(n * 1000)
    if (suf === 'L') return Math.round(n * 100000)
    return Math.round(n)
  }
  const min = parseOne(parts[0])
  const max = parts.length === 2 ? parseOne(parts[1]) : min
  if (min == null || max == null) return null
  return { min, max }
}

// Mirrors lib/fees.ts constants. Keep in sync if fees.ts moves them.
const TOLERANCE_ABS = 5000
const TOLERANCE_PCT = 0.10
const DIVERGENCE_PCT = 0.25
const SUSPICIOUS_RANGE_RATIO = 3
function tol(n) { return Math.max(TOLERANCE_ABS, n * TOLERANCE_PCT) }

// Mirrors lib/fees.ts getReference, per-programme override wins, MBA falls
// back to feeMin/feeMax when they are not the 60000-200000 placeholder.
function getReference(u, program) {
  const pf = u.programFees && u.programFees[program.toLowerCase()]
  if (pf && typeof pf.fee === 'number' && pf.fee > 0) {
    return { min: pf.fee, max: pf.fee }
  }
  if (program === 'MBA') {
    const isPlaceholder = u.feeMin === 60000 && (u.feeMax || u.feeMin) === 200000
    if (!isPlaceholder && u.feeMin) {
      return { min: u.feeMin, max: u.feeMax || u.feeMin }
    }
  }
  return null
}

// Boolean-only port of lib/fees.ts getDisplayFee: returns true iff the
// resolver would emit a Rule 1/2/3 pass (any ok path) rather than the
// 4a/4b suppression. shouldIndexProgrammeHub only reads .ok.
function feeOk(u, program) {
  const pd = u.programDetails && u.programDetails[program]
  const parsed = pd && pd.fees ? parseFeeStr(pd.fees) : null
  // Rule 4a: width sanity, pd.fees range spans > 3x → suppress.
  if (parsed && parsed.min > 0 && parsed.max / parsed.min > SUSPICIOUS_RANGE_RATIO) {
    return false
  }
  const ref = getReference(u, program)
  if (!parsed) {
    if (ref) return true                    // Rule 1 fallback
    if (pd && pd.fees) return true          // pass-through unparseable authored
    return false                             // Rule 4b: no data
  }
  if (!ref) return true                      // no reference, trust pd.fees
  const minDiffPct = Math.abs(parsed.min - ref.min) / Math.max(ref.min, 1)
  const maxDiffPct = Math.abs(parsed.max - ref.max) / Math.max(ref.max, 1)
  // Rule 1: within 10% tolerance
  if (minDiffPct <= TOLERANCE_PCT && maxDiffPct <= TOLERANCE_PCT) return true
  // Rule 2: parsed single vs ref range, single within 25% of ref lower
  if (parsed.min === parsed.max && ref.min !== ref.max) {
    const singleDiffPct = Math.abs(parsed.min - ref.min) / Math.max(ref.min, 1)
    if (singleDiffPct <= DIVERGENCE_PCT) return true
  }
  // Rule 3: parsed range narrower and inside ref range
  const parsedIsRange = parsed.min !== parsed.max
  const insideRefLower = parsed.min >= ref.min - tol(ref.min)
  const insideRefUpper = parsed.max <= ref.max + tol(ref.max)
  const narrowerThanRef = parsed.min > ref.min || parsed.max < ref.max
  if (parsedIsRange && insideRefLower && insideRefUpper && narrowerThanRef) return true
  // Rule 4b: >25% divergence and no 1/2/3 fit → suppress
  if (minDiffPct > DIVERGENCE_PCT || maxDiffPct > DIVERGENCE_PCT) return false
  // 10-25% drift with no rule 2/3 fit, trust pd.fees, ok
  return true
}

// Mirrors lib/data/page-content.ts getPageContent, file existence check.
function hasContentJson(uniId, program) {
  const key = `${uniId}-${program.toLowerCase()}`
  return fs.existsSync(path.join(PAGE_CONTENT_DIR, `${key}.json`))
}

function shouldIndexHub(u, program) {
  return hasContentJson(u.id, program) || feeOk(u, program)
}

// Parse lib/data.ts as text: extract per-university { id, programs,
// feeMin, feeMax, programFees, programDetails.fees }. Same regex-parse
// pattern as scripts/backfill-manifest-from-data.js and verify-fees.js.
const src = fs.readFileSync(DATA_TS, 'utf8')
// Truncate at the end of the UNIVERSITIES export so trailing PROGRAM_META
// (which uses the same 'MBA': {…} shape) does not spill into the parser
// and overwrite a real programDetails entry with an empty one.
const universitiesEnd = src.indexOf('\nexport ', src.indexOf('export const UNIVERSITIES'))
const universitiesSrc = universitiesEnd > 0 ? src.slice(0, universitiesEnd) : src
const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const idHits = []
let m
while ((m = idRe.exec(universitiesSrc))) idHits.push({ id: m[1], idx: m.index })

const universities = []
for (let i = 0; i < idHits.length; i++) {
  const start = idHits[i].idx
  const end = i < idHits.length - 1 ? idHits[i + 1].idx : universitiesSrc.length
  const body = universitiesSrc.slice(start, end)
  const id = idHits[i].id

  // programs: ['MBA', 'BBA', ...]
  const progsMatch = body.match(/programs:\s*\[([^\]]*)\]/)
  const programs = progsMatch
    ? [...progsMatch[1].matchAll(/'([^']+)'/g)].map(x => x[1])
    : []

  // feeMin / feeMax (numbers)
  const feeMinMatch = body.match(/feeMin:\s*(\d+)/)
  const feeMaxMatch = body.match(/feeMax:\s*(\d+)/)
  const feeMin = feeMinMatch ? Number(feeMinMatch[1]) : undefined
  const feeMax = feeMaxMatch ? Number(feeMaxMatch[1]) : undefined

  // programFees: { bba: { fee: 130000 }, bca: { fee: 132000 } }
  // Brace-walk to grab the full body so nested { fee: ... } entries survive.
  const programFees = {}
  const pfIdx = body.search(/programFees:\s*\{/)
  if (pfIdx >= 0) {
    const openIdx = body.indexOf('{', pfIdx)
    let d = 1, pj = openIdx + 1, pfEnd = -1
    for (; pj < body.length; pj++) {
      const ch = body[pj]
      if (ch === '{') d++
      else if (ch === '}') { d--; if (d === 0) { pfEnd = pj; break } }
    }
    if (pfEnd > 0) {
      const pfBody = body.slice(openIdx + 1, pfEnd)
      const pfEntryRe = /(\w+):\s*\{\s*fee:\s*(\d+)/g
      let pm
      while ((pm = pfEntryRe.exec(pfBody))) {
        programFees[pm[1]] = { fee: Number(pm[2]) }
      }
    }
  }

  // programDetails: parse each 'PROGRAM': { ... fees: '...' ... } block
  const programDetails = {}
  const pdRe = /'(MBA|MCA|BBA|BCA|B\.Com|MSc|BSc|MA|BA|M\.Com)':\s*\{/g
  let pm
  while ((pm = pdRe.exec(body))) {
    const prog = pm[1]
    // Walk to matching close-brace, tracking nesting so specs arrays don't
    // trip the parser.
    let depth = 1
    let j = pm.index + pm[0].length
    let blockEnd = -1
    for (; j < body.length; j++) {
      const ch = body[j]
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { blockEnd = j; break } }
    }
    if (blockEnd < 0) continue
    if (programDetails[prog]) continue // first-hit-wins guard
    const pdBlock = body.slice(pm.index + pm[0].length, blockEnd)
    // Grab the fees: '...' string on this programme block (single or double quoted).
    const feesMatch = pdBlock.match(/fees:\s*(['"])([^'"]+)\1/)
    programDetails[prog] = { fees: feesMatch ? decodeStringLiteral(feesMatch[2]) : undefined }
  }

  universities.push({ id, programs, feeMin, feeMax, programFees, programDetails })
}

// Build the set of noindex hub URLs from the parsed state.
const noindexHubUrls = new Set()
for (const u of universities) {
  for (const program of u.programs) {
    if (!shouldIndexHub(u, program)) {
      noindexHubUrls.add(`/universities/${u.id}/${progSlug(program)}`)
    }
  }
}

const urls = JSON.parse(fs.readFileSync(VALID_URLS, 'utf8'))
const before = urls.length
const kept = urls.filter(u => !noindexHubUrls.has(u))
const removed = urls.filter(u => noindexHubUrls.has(u))

if (CHECK_ONLY) {
  if (removed.length > 0) {
    console.error(`FAIL: ${removed.length} URL(s) are in valid-urls.json AND would emit robots noindex:`)
    for (const u of removed) console.error(`  - ${u}`)
    console.error('')
    console.error('The sitemap must not declare a URL that emits noindex on the page.')
    console.error('Fix: run `node scripts/build-valid-urls.js && node scripts/prune-noindex-hub-urls.js`')
    console.error('     or let the prebuild chain do it on the next `npm run build`.')
    process.exit(1)
  }
  console.log(`OK. valid-urls.json (${before} URLs) contains no hub URL that would emit noindex.`)
  process.exit(0)
}

fs.writeFileSync(VALID_URLS, JSON.stringify(kept, null, 2) + '\n', 'utf8')
console.log(`Pruned ${removed.length} noindex hub URL(s) from valid-urls.json (${before} -> ${kept.length}).`)
if (removed.length && removed.length <= 25) {
  for (const u of removed) console.log(`  - ${u}`)
} else if (removed.length > 25) {
  console.log(`  (list truncated; run --check to see all)`)
}
