// scripts/prune-noindex-hub-urls.js
// Sprint 3 Task 1 sitemap sync. Keeps lib/data/valid-urls.json aligned with
// two independent hub-level invariants so a URL never lands in the sitemap
// AND (a) emits robots noindex, or (b) would get a hard 404 at the edge.
//
// Invariant (a), never-both-noindex (original scope):
//   For every hub URL in valid-urls.json, shouldIndexProgrammeHub must be
//   true. Predicate: hasContentJson(uni, prog) OR feeOk(uni, prog).
//
// Invariant (b), never-both-404-or-redirect (Task 3 slice 3c + slice 4):
//   For every HUB or SPEC URL in valid-urls.json whose programme slug is in
//   the middleware allowlist scope (ma/bcom/mcom/mba/bba/bca/mca), the uni
//   slug must be in the corresponding lib/data/programme-allowlist-*.json.
//   The allowlists are the resolver's decision materialised (see
//   lib/seo/resolve-programme.ts and scripts/build-programme-allowlist.js),
//   so this collapses THREE distinct defect classes into one membership
//   check:
//     class-A  program in u.programs but no programDetails[program]
//     class-B  has programDetails but feeOk() false (mostly covered by (a))
//     class-C  program absent from u.programs entirely (Excel-only rows,
//              e.g. /universities/christ-university-online/mba (Christ
//              never had an entry for MBA in data.ts)
//   The Excel is the only route through which class-C URLs enter, and it
//   does not know about data.ts.
//
//   Slice 3c (2026-08-18): 5 HUB URLs pruned. Middleware 404s them at edge.
//   Slice 4  (2026-08-19): 92 SPEC URLs beneath allowlist-out hubs pruned.
//                          91 of 92 already 404 via the spec route
//                          (resolveProgramme short-circuits on
//                          program-not-in-uni). The 1 exception
//                          (christ-university-online/mba/business-analytics)
//                          307s via next.config.js. Both fates are invalid
//                          sitemap contents. GSC intersection cleared:
//                          zero clicks, zero impressions on the 91.
//                          business-analytics earned 1 click / 162 imps
//                          but was already 307ing, so out-of-sitemap loses
//                          nothing new and stops the "Page with redirect"
//                          drift.
//
// Modes:
//   default : prune valid-urls.json in place, write it back
//   --check : assert no drift on EITHER invariant; exit 1 if any hub URL in
//             valid-urls.json would emit noindex OR would 404 at the edge.
//             Does not write.
//
// Prebuild chain order: build-programme-allowlist MUST run before this
// script so the *-allowlist.json files exist. See package.json prebuild.
// The --check flag is what pre-commit calls.
//
// Runs against every hub URL of the shape /universities/{u}/{p}. Spec URLs
// (/universities/{u}/{p}/{s}) are OUT OF SCOPE for this task; the middleware
// only 404s hubs and specs get their own resolution path.
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

// Build the set of noindex hub URLs from the parsed state. (Invariant a)
const noindexHubUrls = new Set()
for (const u of universities) {
  for (const program of u.programs) {
    if (!shouldIndexHub(u, program)) {
      noindexHubUrls.add(`/universities/${u.id}/${progSlug(program)}`)
    }
  }
}

// Load programme allowlists, the middleware-404 truth. (Invariant b) Empty
// map if any allowlist is missing; the prebuild chain (package.json) runs
// build-programme-allowlist.js before this script, so missing files here mean
// the chain is broken and we should not silently pass.
// Keep in sync with the middleware.ts PROGRAMME_HUB_ALLOWLISTS list and with
// scripts/build-programme-allowlist.js SCOPE_PROGRAMS.
const ALLOWLIST_PROGRAMMES = ['ma', 'bcom', 'mcom', 'mba', 'bba', 'bca', 'mca']
const programmeAllowlists = new Map()
for (const prog of ALLOWLIST_PROGRAMMES) {
  const p = path.join(ROOT, 'lib', 'data', `programme-allowlist-${prog}.json`)
  if (!fs.existsSync(p)) {
    console.error(`FAIL: ${path.relative(ROOT, p)} missing. Run: node scripts/build-programme-allowlist.js`)
    process.exit(1)
  }
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'))
  programmeAllowlists.set(prog, new Set(arr))
}

// Build the set of allowlist-out URLs: any HUB or SPEC whose (uni, prog) is
// missing from the corresponding programme allowlist. Slice 4 widened this
// to 4-segment because 91/92 specs beneath allowlist-out hubs already 404 at
// the spec route (resolveProgramme short-circuits on program-not-in-uni) and
// the 1 that 307s (christ-university-online/mba/business-analytics via
// next.config.js) produces "Page with redirect" in GSC. Both fates are
// invalid sitemap contents; strip them at source.
function is404OrRedirectByAllowlist(url) {
  const m = url.match(/^\/universities\/([^/]+)\/([^/]+)(?:\/[^/]+)?\/?$/)
  if (!m) return false
  const [, slug, prog] = m
  const allow = programmeAllowlists.get(prog)
  if (!allow) return false // out-of-scope programme (ba/msc/bsc): no allowlist governs it
  return !allow.has(slug)
}

const urls = JSON.parse(fs.readFileSync(VALID_URLS, 'utf8'))
const before = urls.length
const removedNoindex = urls.filter(u => noindexHubUrls.has(u))
const removed404 = urls.filter(u => !noindexHubUrls.has(u) && is404OrRedirectByAllowlist(u))
const removed = [...removedNoindex, ...removed404]
const removedSet = new Set(removed)
const kept = urls.filter(u => !removedSet.has(u))

// Break down the 4xx/307 removals by shape for the report.
const removedHubs = removed404.filter(u => u.match(/^\/universities\/[^/]+\/[^/]+\/?$/))
const removedSpecs = removed404.filter(u => u.match(/^\/universities\/[^/]+\/[^/]+\/[^/]+\/?$/))

if (CHECK_ONLY) {
  if (removedNoindex.length > 0) {
    console.error(`FAIL: ${removedNoindex.length} URL(s) are in valid-urls.json AND would emit robots noindex:`)
    for (const u of removedNoindex) console.error(`  - ${u}`)
    console.error('')
    console.error('The sitemap must not declare a URL that emits noindex on the page.')
  }
  if (removed404.length > 0) {
    if (removedNoindex.length > 0) console.error('')
    console.error(`FAIL: ${removed404.length} URL(s) are in valid-urls.json AND allowlist-out (${removedHubs.length} hub(s), ${removedSpecs.length} spec(s)):`)
    for (const u of removed404) console.error(`  - ${u}`)
    console.error('')
    console.error('Hubs: middleware returns HTTP 404 at the edge.')
    console.error('Specs: 91 of 92 return 404 via the spec route resolver; 1 (Christ MBA')
    console.error('       business-analytics) returns 307 via next.config.js. Both fates')
    console.error('       are invalid sitemap contents.')
    console.error('Class-A/B/C: uni is not in the corresponding programme-allowlist-*.json.')
  }
  if (removedNoindex.length + removed404.length > 0) {
    console.error('')
    console.error('Fix: run `node scripts/build-valid-urls.js && node scripts/build-programme-allowlist.js && node scripts/prune-noindex-hub-urls.js`')
    console.error('     or let the prebuild chain do it on the next `npm run build`.')
    process.exit(1)
  }
  console.log(`OK. valid-urls.json (${before} URLs) contains no URL that would noindex, 404, or 307 via the programme allowlist.`)
  process.exit(0)
}

fs.writeFileSync(VALID_URLS, JSON.stringify(kept, null, 2) + '\n', 'utf8')
console.log(`Pruned ${removed.length} URL(s) from valid-urls.json (${before} -> ${kept.length}).`)
console.log(`  noindex hubs (invariant a): ${removedNoindex.length}`)
console.log(`  allowlist-out hubs (invariant b, class-A/B/C): ${removedHubs.length}`)
console.log(`  allowlist-out specs (invariant b, slice 4): ${removedSpecs.length}`)
if (removed.length && removed.length <= 25) {
  for (const u of removed) console.log(`  - ${u}`)
} else if (removed.length > 25) {
  console.log(`  (list truncated; run --check to see all)`)
}
