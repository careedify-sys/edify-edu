// scripts/lib/blog-fee-scan.mjs
// Shared extractor for blog fee figures. Used by:
//   - scripts/audit-blog-fees.mjs        (CSV + summary)
//   - scripts/build-blog-fee-triage.mjs  (via that CSV)
//   - scripts/check-blog-fees.mjs        (per-slug ratchet)
//   - scripts/collapse-blog-fee-pairs.mjs
//   - scripts/sample-blog-fee-mismatches.mjs
//
// v2 (2026-08-07): structural attribution, range-as-unit parsing, expanded
// NON_FEE, multi-value acceptance. Previous v1 hit 10% MISMATCH precision
// because it treated the HTML as a flat string, split ranges into bare
// endpoints, and had a Rs.? pattern with no word boundary. See
// audits/blog-fee-precision-sample-2026-08-07.md for the failure taxonomy.

import { BLOG_POSTS } from '../../lib/blog.ts'
import { UNIVERSITIES } from '../../lib/data.ts'
import { getDisplayFee, parseFeeStr } from '../../lib/fees.ts'

const UNI_BY_ID = new Map(UNIVERSITIES.map(u => [u.id, u]))

// -- Alias index ----------------------------------------------------------

// Institution-type words. A bracketed fragment made only of these is a type,
// not a name, and must never become an alias.
const TYPE_WORDS = new Set(['deemed', 'to', 'be', 'the', 'of', 'a', 'an',
  'open', 'autonomous', 'private', 'state', 'central', 'university',
  'universities', 'institute', 'institution', 'college', 'deemedtobe'])

const aliasEntries = []
function addAlias(alias, uid) {
  if (!alias) return
  aliasEntries.push({ alias: alias.toLowerCase(), uid })
}
for (const u of UNIVERSITIES) {
  const base = u.name
    .replace(/\s+Online$/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  addAlias(u.name, u.id)
  addAlias(base, u.id)
  addAlias(base.replace(/^University of\s+/i, ''), u.id)
  if (u.abbr) addAlias(u.abbr, u.id)
  if (u.shortName) addAlias(u.shortName, u.id)
  // Parentheticals are usually a real abbreviation worth aliasing (UPES, MAHE,
  // KSOU). But some names carry only an institution TYPE in brackets, e.g.
  // "(Deemed to be University)", "(Open)", "(Autonomous)". Aliasing those makes
  // one generic phrase resolve to several universities at once, so every
  // sentence containing it degrades to multi-uni-sentence and the figure goes
  // UNRESOLVED. "Deemed to be University" alone was aliased to four different
  // universities. Skip a parenthetical when nothing distinctive survives after
  // institution-type words are removed.
  for (const p of [...u.name.matchAll(/\(([^)]+)\)/g)].map(m => m[1])) {
    const distinctive = p
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter(w => w && !TYPE_WORDS.has(w))
      .join('')
    if (!distinctive) continue
    addAlias(p, u.id)
  }
  addAlias(u.id.replace(/-online$/, '').replace(/-/g, ' '), u.id)
}
const MANUAL = {
  'amity': 'amity-university-online',
  'amity university': 'amity-university-online',
  'lpu': 'lovely-professional-university-online',
  'lovely professional': 'lovely-professional-university-online',
  // "JAIN" alone matches JAIN Bangalore, but ARKA JAIN is a separate
  // university. Refuse to attribute when "arka" precedes JAIN — see
  // rejectIfArka() in findAllUnis().
  'jain': 'jain-university-online',
  'jain university': 'jain-university-online',
  'arka jain': null, // sentinel: match consumes the token but attributes nowhere
  'muj': 'manipal-university-jaipur-online',
  'manipal jaipur': 'manipal-university-jaipur-online',
  'mahe': 'manipal-academy-of-higher-education-online',
  'manipal academy': 'manipal-academy-of-higher-education-online',
  'smu': 'sikkim-manipal-university-online',
  'sikkim manipal': 'sikkim-manipal-university-online',
  'galgotias': 'galgotias-university-online',
  'chandigarh university': 'chandigarh-university-online',
  'chandigarh': 'chandigarh-university-online',
  'upes': 'upes-online',
  'nmims': 'nmims-online',
  'symbiosis': 'symbiosis-university-online',
  'ssodl': 'symbiosis-university-online',
  // DY Patil: separate the two campuses. Bare "dy patil" keeps mapping to
  // Navi Mumbai (heavier historical usage) but see also confidence downgrade
  // in attribute(): a bare mention with no campus qualifier stays LOW.
  'dy patil': 'dy-patil-university-online',
  'd.y. patil': 'dy-patil-university-online',
  'dy patil navi mumbai': 'dy-patil-university-online',
  'dpu navi mumbai': 'dy-patil-university-online',
  'dpu-col': 'dr-dy-patil-vidyapeeth-online',
  'dpu col': 'dr-dy-patil-vidyapeeth-online',
  'dpu pune': 'dr-dy-patil-vidyapeeth-online',
  'dy patil pune': 'dr-dy-patil-vidyapeeth-online',
  'dpu vidyapeeth': 'dr-dy-patil-vidyapeeth-online',
  'd.y. patil vidyapeeth': 'dr-dy-patil-vidyapeeth-online',
  'dr d.y. patil': 'dr-dy-patil-vidyapeeth-online',
  'dr dy patil': 'dr-dy-patil-vidyapeeth-online',
  'parul': 'parul-university-online',
  'shoolini': 'shoolini-university-online',
  'sharda': 'sharda-university-online',
  'chitkara': 'chitkara-university-online',
  'yenepoya': 'yenepoya-university-online',
  'dayananda sagar': 'dayananda-sagar-university-online',
  'dsu': 'dayananda-sagar-university-online',
  'amrita': 'amrita-vishwa-vidyapeetham-online',
  'mangalayatan': 'mangalayatan-university-online',
  'vignan': 'vignan-university-online',
}
for (const [alias, uid] of Object.entries(MANUAL)) {
  if (uid === null) { addAlias(alias, '__REJECT__'); continue }
  if (UNI_BY_ID.has(uid)) addAlias(alias, uid)
}
const seenA = new Set()
const ALIASES = aliasEntries
  .filter(({ alias }) => { if (seenA.has(alias)) return false; seenA.add(alias); return alias.length >= 3 })
  .sort((a, b) => b.alias.length - a.alias.length)

// -- Programme patterns ---------------------------------------------------

const PROG_PATTERNS = [
  { prog: 'MBA (WX)', re: /\bMBA\s*\(?WX\)?\b/i },
  { prog: 'MBA', re: /\bMBA\b|\bmaster of business admin/i },
  { prog: 'MCA', re: /\bMCA\b|\bmaster of computer appl/i },
  { prog: 'MSc', re: /\bMSc\b|\bM\.Sc\.?\b|\bmaster of science\b/i },
  { prog: 'MA', re: /\bMA\b|\bM\.A\.?\b|\bmaster of arts\b/i },
  { prog: 'M.Com', re: /\bM\.?Com\b|\bmaster of commerce\b/i },
  { prog: 'BBA', re: /\bBBA\b|\bbachelor of business admin/i },
  { prog: 'BCA', re: /\bBCA\b|\bbachelor of computer appl/i },
  { prog: 'BSc', re: /\bBSc\b|\bB\.Sc\.?\b|\bbachelor of science\b/i },
  { prog: 'BA', re: /\bBA\b|\bB\.A\.?\b|\bbachelor of arts\b/i },
  { prog: 'B.Com', re: /\bB\.?Com\b|\bbachelor of commerce\b/i },
]

function detectProgramme(text) {
  for (const { prog, re } of PROG_PATTERNS) if (re.test(text)) return prog
  return null
}

// Return every distinct university id found in text, longest-alias-first.
// Returns array of {uid, alias, index} so callers can decide on the closest.
function findAllUnis(text) {
  const lower = text.toLowerCase()
  const hits = []
  const claimed = new Array(lower.length).fill(false)
  for (const { alias, uid } of ALIASES) {
    let from = 0
    while (true) {
      const idx = lower.indexOf(alias, from)
      if (idx < 0) break
      const before = idx === 0 ? ' ' : lower[idx - 1]
      const after = idx + alias.length >= lower.length ? ' ' : lower[idx + alias.length]
      const ok = !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)
      // Reject "mumbai" when preceded by "navi " — that phrase is part of the
      // DY Patil Navi Mumbai brand and must not resolve to University of Mumbai.
      if (ok && alias === 'mumbai') {
        const preZone = lower.slice(Math.max(0, idx - 6), idx).trimEnd()
        if (/\bnavi$/.test(preZone)) { from = idx + alias.length; continue }
      }
      if (ok && !claimed[idx]) {
        for (let i = idx; i < idx + alias.length; i++) claimed[i] = true
        hits.push({ uid, alias, index: idx })
      }
      from = idx + alias.length
    }
  }
  // Drop __REJECT__ sentinels (e.g. ARKA JAIN) so they consume the token but
  // never attribute anywhere. Without this, plain "jain" alias would still fire.
  return hits.filter(h => h.uid !== '__REJECT__').sort((a, b) => a.index - b.index)
}

function firstUniInText(text) {
  const hits = findAllUnis(text)
  return hits[0]?.uid || null
}

// -- Currency regex with word boundary ------------------------------------

// v2: leading (?<=^|[\s>(]|[^A-Za-z]) via lookbehind so "Rs" only matches
// after a non-letter. Kills the "Hono*rs* 4" style false positives from v1.
// Node 18+ supports lookbehind.
const CURR = String.raw`(?:₹|(?<![A-Za-z])Rs\.?\s*|(?<![A-Za-z])INR\s+)`
const NUM = String.raw`([\d]+(?:[.,]\d+)*)`
// v3 fix (2026-08-10): trailing (?![A-Za-z]) so the suffix letters L/K/Cr
// only match at a word boundary. Prior /gi + optional suffix meant "Rs
// 2,20,000 list" parsed as Rs 2,20,000L = Rs 22B; "Rs 5 lecture" as Rs
// 5L = 500K; etc. The negative lookahead sits inside the optional group,
// so no-suffix numbers still match cleanly.
const SUF = String.raw`(\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?)(?![A-Za-z]))?`
const RUPEE_RE = new RegExp(CURR + NUM + SUF, 'gi')

// Range continuation: - / – / — / "to" between two numbers, optionally
// with a repeated currency mark ("₹35K to ₹1.4L") so both halves of a
// dual-symbol range collapse to one range record.
const RANGE_TAIL_RE = new RegExp(
  String.raw`^\s*(?:-|–|—|to|and|\bto\b)\s*(?:₹|Rs\.?\s*|INR\s+)?` + NUM + SUF,
  'i',
)

// -- NON_FEE expansion ----------------------------------------------------

// v2 fix: individual patterns instead of one big \b-wrapped alternation.
// The old wrapper broke every pattern that started with a non-word char
// (/sem, /month) because \b requires a word/nonword boundary and " /sem"
// has none. Each pattern below controls its own boundaries.
const NON_FEE_PATTERNS = [
  // Salary / compensation
  /\bLPA\b/i, /\bCTC\b/i, /\bsalar(?:y|ies)\b/i, /\bpackage(?:s)?\b/i,
  /\bstipend\b/i, /\bcompensation\b/i, /\bearn(?:ing|ings)?\b/i,
  /\bpayout(?:s)?\b/i, /\bp\.?a\.?\b/i, /\bstarting\s+salary\b/i,
  // Time-based unit tags
  /per\s*month/i, /monthly/i, /\/\s*month/i, /\/\s*mo\b/i,
  /per\s*annum/i, /per\s*year/i, /\bp\.?y\.?\b/i,
  /per\s*sem(?:ester)?/i, /\/\s*sem/i, /per-semester/i, /per\s*sem\b/i,
  // Payment structure
  /\bEMI\b/i, /instal?lment/i, /instalment\b/i, /₹?\d[\d,]*\s*\/\s*(?:sem|month|year|mo|instal)/i,
  // Discount / gap / savings phrasing
  /\bgap\b\s*:?/i, /\bsave(?:s|d)?\b/i, /\bsaving(?:s)?\b/i,
  /\bdiscount(?:ed)?\b/i, /\boff\b\s*[,.)]/i, /\bcashback\b/i,
  /\bscholarship\b/i, /\bwaiver\b/i, /\brefund\b/i, /\bpenalty\b/i,
  /\blate\s*fee\b/i, /\bcheaper\b/i, /\blower\b/i,
  // Non-tuition fees
  /application\s*fee/i, /registration\s*fee/i, /exam\s*fee/i,
  /admission\s*fee/i, /processing\s*fee/i, /\breg\.?\s*(?:and|\+|&)?\s*(?:exam|fee)?/i,
  /reg\s*(?:and|\+|&)?\s*exam/i, /registration\s*(?:and|\+|&)\s*exam/i,
  /exam\s*(?:and|\+|&)\s*(?:reg|admission)/i, /exam\s*charge/i,
  /reg\s*charge/i, /\balumni\s*fee\b/i, /\blibrary\s*fee\b/i,
  // Non-fee residence costs
  /\bhostel\b/i, /\baccommodation\b/i, /\bmess\b/i,
  // Multipliers (indicate a per-x total, not the fee itself)
  /\bx\s*\d/i, /×\s*\d/i, /\d\s*(?:sem|semester)s\b/i,
  // Fee-note phrasing that indicates a component, not a total
  /excludes?\s+₹|excludes?\s+Rs/i, /excluding\s+₹|excluding\s+Rs/i,
  /\+\s*₹\d|\+\s*Rs\.?\s*\d/i,
]

function isNonFee(context) {
  for (const re of NON_FEE_PATTERNS) if (re.test(context)) return true
  return false
}

// A table row's first cell often labels the whole row ("Add-on Charges",
// "Per-Semester Fee", "Registration Fee", "Effective Total after Discount").
// Values in that row are components, not totals. Check this in addition to
// the tight-window context so a bare <td>₹8,500</td> still gets caught.
const ROW_HEADER_NON_FEE = /add[- ]?on|per\s*sem|per-sem|semester\s+fee|registration|application|admission|exam\s+fee|reg\s+fee|processing|discount|savings|scholarship|waiver|hostel|accommodation|mess|library|alumni|EMI|monthly|annual\s+install|per\s+month|per\s+year|per\s+annum|per\s+installment|LPA|salary|package|stipend|net\s+of|inclusive\s+of|exclusive\s+of|effective|discounted/i

function isRowHeaderNonFee(firstCellText) {
  if (!firstCellText) return false
  return ROW_HEADER_NON_FEE.test(firstCellText)
}

// -- Normalise numbers ----------------------------------------------------

function normalise(numStr, suffix) {
  const n = parseFloat(numStr.replace(/,/g, ''))
  if (!isFinite(n)) return null
  const suf = (suffix || '').trim().toLowerCase()
  if (/^cr/.test(suf)) return Math.round(n * 10_000_000)
  if (/^l/.test(suf)) return Math.round(n * 100_000)
  if (/^k/.test(suf)) return Math.round(n * 1_000)
  return Math.round(n)
}

// -- Sentence and table splitters -----------------------------------------

// Strip HTML tags for sentence-window analysis while preserving character
// positions via a mapping so we can still map back to the original block.
function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ')
}

// Return true if the '.' at dotIdx is part of a single-letter initial
// ("D.Y.", "U.S.", "B.R.", "C.V.") or a common English honorific abbreviation
// ("Dr.", "Mr.", "Ms.", "Mrs.", "St.", "Sr.", "Jr.", "Fr.", "Rev.", "Prof.").
// Sentence-splitter must not treat these dots as sentence terminators, or
// prose like "D.Y. Patil Vidyapeeth" gets chopped in half and later fee
// figures lose their preceding university-alias context.
const ABBRS = ['Prof', 'Mrs', 'Rev', 'Dr', 'Mr', 'Ms', 'St', 'Sr', 'Jr', 'Fr']
function isInitialLikeDot(text, dotIdx) {
  if (dotIdx < 1) return false
  const prev = text[dotIdx - 1]
  // Single-letter initial: [A-Z] preceded by start, whitespace, or another '.'.
  // Handles the second dot of "D.Y." because prev2 is the first dot.
  if (/[A-Z]/.test(prev)) {
    if (dotIdx === 1) return true
    const prev2 = text[dotIdx - 2]
    if (/[\s.]/.test(prev2)) return true
  }
  // Honorifics ordered longest-first so "Prof" wins over the "of" that would
  // otherwise never match anyway.
  for (const abbr of ABBRS) {
    if (dotIdx >= abbr.length && text.slice(dotIdx - abbr.length, dotIdx) === abbr) {
      const startIdx = dotIdx - abbr.length
      if (startIdx === 0 || /\s/.test(text[startIdx - 1])) return true
    }
  }
  return false
}

// Like `before.lastIndexOf(marker)` but skips positions where the leading
// char is a '.' that isInitialLikeDot flags as part of an abbreviation.
function lastBoundaryIndex(before, marker) {
  const skipDots = marker[0] === '.'
  let searchFrom = before.length
  while (true) {
    const idx = before.lastIndexOf(marker, searchFrom - 1)
    if (idx < 0) return -1
    if (!skipDots || !isInitialLikeDot(before, idx)) return idx
    searchFrom = idx
  }
}

function sentenceAround(text, pos) {
  const before = text.slice(0, pos)
  const after = text.slice(pos)
  const startCandidates = [
    lastBoundaryIndex(before, '. '),
    lastBoundaryIndex(before, '! '),
    lastBoundaryIndex(before, '? '),
    lastBoundaryIndex(before, '.\n'),
    lastBoundaryIndex(before, '!\n'),
    lastBoundaryIndex(before, '?\n'),
    lastBoundaryIndex(before, '. <'),
    -1,
  ]
  const start = Math.max(...startCandidates) + 1
  const endMatch = after.match(/[.!?](?:\s|<|$)/)
  const end = pos + (endMatch ? endMatch.index + 1 : after.length)
  return text.slice(start, end).trim()
}

// Index of tables in the raw content. For each table we record its char range
// and, per row, per cell char ranges + text so we can map any position back
// to its (table, row, cell, columnHeader) tuple.
function indexTables(html) {
  const tables = []
  const tableRe = /<table\b[^>]*>[\s\S]*?<\/table>/gi
  let tm
  while ((tm = tableRe.exec(html))) {
    const tStart = tm.index
    const tEnd = tStart + tm[0].length
    const tHtml = tm[0]
    const rows = []
    const rowRe = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi
    let rm
    while ((rm = rowRe.exec(tHtml))) {
      const rStart = tStart + rm.index
      const rEnd = rStart + rm[0].length
      const rHtml = rm[0]
      const cells = []
      const cellRe = /<t([dh])\b[^>]*>([\s\S]*?)<\/t\1>/gi
      let cm
      while ((cm = cellRe.exec(rHtml))) {
        const cStart = rStart + cm.index
        const cEnd = cStart + cm[0].length
        const text = stripTags(cm[2]).trim()
        const isHeader = cm[1].toLowerCase() === 'h'
        cells.push({ start: cStart, end: cEnd, text, isHeader })
      }
      rows.push({ start: rStart, end: rEnd, cells, firstText: cells[0]?.text || '' })
    }
    // Header row is either the first row with all-<th> cells, or if none,
    // just the first row treated as labels.
    let headerCells = null
    for (const r of rows) {
      if (r.cells.length && r.cells.every(c => c.isHeader)) { headerCells = r.cells; break }
    }
    if (!headerCells && rows[0]) headerCells = rows[0].cells
    tables.push({ start: tStart, end: tEnd, rows, headerCells: headerCells || [] })
  }
  return tables
}

function findRow(tables, pos) {
  for (const t of tables) {
    if (pos < t.start || pos >= t.end) continue
    for (const r of t.rows) {
      if (pos >= r.start && pos < r.end) {
        // Find cell + its column index.
        let cellIdx = -1
        for (let i = 0; i < r.cells.length; i++) {
          const c = r.cells[i]
          if (pos >= c.start && pos < c.end) { cellIdx = i; break }
        }
        const columnHeader = cellIdx >= 0 && t.headerCells[cellIdx] ? t.headerCells[cellIdx].text : ''
        return { table: t, row: r, cellIdx, columnHeader }
      }
    }
    return { table: t, row: null, cellIdx: -1, columnHeader: '' }
  }
  return null
}

// -- Parenthetical rule ---------------------------------------------------

// Matches "Uni (₹X)" or "Uni (Rs 1.5L)". Fires when a rupee figure is inside
// a parenthetical block whose immediately-preceding token is a university
// name. Highest confidence.
function tryParenthetical(html, pos, rawLen) {
  // Find opening paren before pos, closing paren after pos+rawLen.
  const before = html.slice(0, pos)
  const openIdx = before.lastIndexOf('(')
  if (openIdx < 0) return null
  // Containment: the figure must be INSIDE this parenthetical. If any ')'
  // appears between openIdx and pos, the paren we found closed before the
  // figure and the figure sits in free prose after it — reject. Without
  // this, "Uttaranchal (UU Doon) at ₹3,70,000" mis-attributes ₹3,70,000
  // to Uttaranchal via the already-closed (UU Doon) paren.
  if (before.slice(openIdx + 1).includes(')')) return null
  const closeIdx = html.indexOf(')', pos + rawLen)
  if (closeIdx < 0) return null
  // Sanity: parenthetical shouldn't span more than 200 chars.
  if (closeIdx - openIdx > 220) return null
  // Text immediately before "(" — walk back until whitespace/tag boundary.
  const uniZone = stripTags(html.slice(Math.max(0, openIdx - 80), openIdx)).trim()
  const hits = findAllUnis(uniZone)
  if (hits.length === 0) return null
  const last = hits[hits.length - 1]
  // Must actually be adjacent — allow up to 3 chars between end-of-alias and "(".
  if (uniZone.length - (last.index + last.alias.length) > 3) return null
  return { uid: last.uid, confidence: 'high', rule: 'parenthetical' }
}

// Bucket-header: a range like "Rs X to Rs Y:" that opens a paragraph of
// enumerated universities. X and Y are bucket bounds, not any single uni's
// fee. Detected when a ':' immediately follows the consumed range (forward
// case), or when the figure is the tail endpoint of a "Rs X to <figure>:"
// header that the range-parser did not fold into one record (backward case).
const BUCKET_TAIL_BACK_RE = new RegExp(
  String.raw`(?:₹|Rs\.?|INR)\s*[\d.,]+\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?)?\s*(?:-|–|—|to|and)\s*(?:(?:₹|Rs\.?|INR)\s*)?$`,
  'i',
)
function isBucketRange(combined, matchStart, consumedLen) {
  const after = combined.slice(matchStart + consumedLen, matchStart + consumedLen + 8)
  if (/^\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?)?\s*:/.test(after)) return true
  const before = combined.slice(Math.max(0, matchStart - 60), matchStart)
  if (BUCKET_TAIL_BACK_RE.test(before)) {
    const afterLong = combined.slice(matchStart + consumedLen, matchStart + consumedLen + 20)
    if (/^\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?)?\s*:/.test(afterLong)) return true
  }
  return false
}

// -- Attribution ----------------------------------------------------------

function attribute(post, html, tables, pos, rawLen) {
  // 1. Parenthetical (highest priority)
  const paren = tryParenthetical(html, pos, rawLen)
  if (paren) return paren

  // 2. Table cell
  const cell = findRow(tables, pos)
  if (cell && cell.row) {
    const rowHits = findAllUnis(cell.row.firstText)
    if (rowHits.length === 1) {
      return { uid: rowHits[0].uid, confidence: 'high', rule: 'table-first-cell' }
    }
    // Table's header row may name a university (uni-as-column layout).
    // Check the column header text of THIS cell first (most specific).
    if (cell.columnHeader) {
      const colHits = findAllUnis(cell.columnHeader)
      if (colHits.length === 1) {
        return { uid: colHits[0].uid, confidence: 'high', rule: 'table-column-header' }
      }
    }
    // Fall back to the full concatenated header row.
    const allHeaderText = (cell.table.headerCells || []).map(h => h.text).join(' | ')
    const headerHits = findAllUnis(allHeaderText)
    if (headerHits.length === 1) {
      return { uid: headerHits[0].uid, confidence: 'medium', rule: 'table-header' }
    }
    // Inside a table but row doesn't clearly own a uni — do NOT fall back to
    // nearest preceding. That was the whole failure mode.
    return { uid: null, confidence: 'low', rule: 'table-ambiguous' }
  }

  // 3. Same-sentence in prose
  const stripped = stripTags(html)
  // Map pos in html to pos in stripped. Cheap approximation: walk html,
  // build stripped, keep an offset map. For performance keep it O(n) once.
  // We accept small imprecision (tag length) — sentence bounds are coarse.
  let strippedPos = 0
  let htmlIdx = 0, inTag = false
  while (htmlIdx < pos && htmlIdx < html.length) {
    const c = html[htmlIdx]
    if (c === '<') inTag = true
    else if (c === '>') { inTag = false; strippedPos++ } // '>' becomes space
    else if (!inTag) strippedPos++
    htmlIdx++
  }
  const sentence = sentenceAround(stripped, strippedPos)
  const senteHits = findAllUnis(sentence)
  const uniqueUids = [...new Set(senteHits.map(h => h.uid))]
  if (uniqueUids.length === 1) {
    return { uid: uniqueUids[0], confidence: 'medium', rule: 'same-sentence-single-uni' }
  }
  if (uniqueUids.length > 1) {
    return { uid: null, confidence: 'low', rule: 'multi-uni-sentence' }
  }

  // 4. Slug/title single-uni fallback (only if no other uni is anywhere near).
  const slugText = `${post.slug.replace(/-/g, ' ')} ${post.title}`
  const slugHits = findAllUnis(slugText)
  const slugUids = [...new Set(slugHits.map(h => h.uid))]
  if (slugUids.length === 1) {
    return { uid: slugUids[0], confidence: 'low', rule: 'blog-slug-fallback' }
  }
  return { uid: null, confidence: 'low', rule: 'unresolved' }
}

// -- Acceptable values (multi-value ready) --------------------------------

// Returns an array of intervals [{min, max}] that a blog figure is allowed
// to match. Today this is basically what getDisplayFee gives us plus any
// per-programme override; the shape is set up so a future feeVariants array
// can be plugged in without changing the classifier.
function getAcceptableIntervals(u, program) {
  const intervals = []
  const pd = u.programDetails?.[program]
  const disp = getDisplayFee(u, program)
  if (disp.ok && disp.min != null) {
    intervals.push({ min: disp.min, max: disp.max ?? disp.min, source: `getDisplayFee-rule${disp.rule}` })
  }
  // Also always allow a parsed pd.fees range (may be wider than getDisplayFee
  // when it suppressed for width). This gives multi-tier fees a chance.
  const parsed = pd?.fees ? parseFeeStr(pd.fees) : null
  if (parsed && (!intervals.length || parsed.min !== intervals[0].min || parsed.max !== intervals[0].max)) {
    intervals.push({ min: parsed.min, max: parsed.max, source: 'pd.fees-parsed' })
  }
  // Per-programme fee override (programFees.mba etc.).
  const pf = u.programFees?.[program.toLowerCase()]
  if (pf?.fee) {
    intervals.push({ min: pf.fee, max: pf.fee, source: 'programFees' })
  }
  // Placeholder for feeVariants (schema not yet implemented — see
  // audits/fee-model-proposal-2026-08-07.md). When added, each variant
  // becomes an interval with tolerance ±2%.
  const variants = pd?.feeVariants
  if (Array.isArray(variants)) {
    for (const v of variants) {
      if (typeof v.amount === 'number') intervals.push({ min: v.amount, max: v.amount, source: `variant:${v.mode}:${v.discount ?? 'list'}` })
    }
  }
  return intervals
}

const TOL = 0.02

function withinInterval(value, interval) {
  return value >= interval.min * (1 - TOL) && value <= interval.max * (1 + TOL)
}

// -- Classifier -----------------------------------------------------------

function classify({ blogValue, blogMin, blogMax, universityId, programme }) {
  if (!universityId || !programme) return { klass: 'UNRESOLVED' }
  const u = UNI_BY_ID.get(universityId)
  if (!u) return { klass: 'UNRESOLVED' }
  if (!u.programs.includes(programme)) return { klass: 'ORPHAN', accepted: [], displayCompact: '' }
  const intervals = getAcceptableIntervals(u, programme)
  const disp = getDisplayFee(u, programme)
  if (intervals.length === 0) {
    return { klass: 'SUPPRESSED', accepted: [], displayCompact: '', rule: disp.rule || null }
  }
  // Blog range: MATCH iff both endpoints within 2% of the SAME interval.
  if (blogMin != null && blogMax != null && blogMin !== blogMax) {
    for (const iv of intervals) {
      const loOk = Math.abs(blogMin - iv.min) / Math.max(iv.min, 1) <= TOL
      const hiOk = Math.abs(blogMax - iv.max) / Math.max(iv.max, 1) <= TOL
      if (loOk && hiOk) return { klass: 'MATCH', accepted: intervals, displayCompact: disp.compact || '' }
    }
    return { klass: 'MISMATCH', accepted: intervals, displayCompact: disp.compact || '', delta: computeDelta(blogMin, blogMax, intervals) }
  }
  // Blog scalar: MATCH iff inside any interval ±2%.
  const v = blogValue
  for (const iv of intervals) if (withinInterval(v, iv)) return { klass: 'MATCH', accepted: intervals, displayCompact: disp.compact || '' }
  return { klass: 'MISMATCH', accepted: intervals, displayCompact: disp.compact || '', delta: computeDelta(v, v, intervals) }
}

function computeDelta(lo, hi, intervals) {
  let best = Infinity
  let signed = 0
  for (const iv of intervals) {
    const nearest = lo < iv.min ? iv.min : (hi > iv.max ? iv.max : lo)
    const d = nearest > 0 ? (lo - nearest) / nearest : 0
    if (Math.abs(d) < Math.abs(best)) { best = Math.abs(d); signed = d }
  }
  return signed
}

// -- Main scan ------------------------------------------------------------

export function scanAllPosts() {
  const rows = []
  for (const post of BLOG_POSTS) {
    if (post.status !== 'published') continue
    const html = post.content || ''
    const faqBlob = (post.faqs || []).map(f => `${f.q}\n${f.a}`).join('\n')
    const combined = html + '\n' + faqBlob
    const tables = indexTables(combined)

    RUPEE_RE.lastIndex = 0
    let m
    while ((m = RUPEE_RE.exec(combined))) {
      const numStr = m[1]
      const suf = m[2] || ''
      const startVal = normalise(numStr, suf)
      if (startVal == null) continue
      const matchStart = m.index
      const matchLen = m[0].length

      // Look for a range continuation immediately after the match.
      const tail = combined.slice(matchStart + matchLen, matchStart + matchLen + 40)
      const tailMatch = tail.match(RANGE_TAIL_RE)
      let value = startVal
      let vMin = startVal, vMax = startVal
      let rawFull = m[0]
      let consumedLen = matchLen
      if (tailMatch) {
        // If the SECOND number's suffix is present but the FIRST wasn't, use
        // the second's suffix for both (extractor's chief v1 bug).
        const tailNum = tailMatch[1]
        const tailSuf = tailMatch[2] || suf
        const endVal = normalise(tailNum, tailSuf)
        if (endVal != null && endVal >= startVal) {
          // Retroactively apply the tail's suffix to the start ONLY when the
          // start had no suffix AND the raw start number is small enough that
          // adopting the suffix keeps it in the same order of magnitude as
          // the tail. "Rs 35,000 to 1.2 lakh" must NOT re-scale 35,000 by lakh
          // (→ 3.5B); the start is already a full number.
          let startWithTailSuf = startVal
          if (!suf && tailSuf) {
            const startAsRaw = parseFloat(numStr.replace(/,/g, ''))
            // If the raw start number is < 1000, it's a decimal like "1.66"
            // and the lakh suffix belongs. Otherwise (35,000 etc.) leave it.
            if (isFinite(startAsRaw) && startAsRaw < 1000) {
              startWithTailSuf = normalise(numStr, tailSuf)
            }
          }
          vMin = startWithTailSuf
          vMax = endVal
          value = vMin
          rawFull = m[0] + tailMatch[0]
          consumedLen = matchLen + tailMatch[0].length
          // Advance the regex past the consumed range so the tail number is
          // not re-picked-up as its own figure.
          RUPEE_RE.lastIndex = matchStart + consumedLen
        }
      }

      const start = Math.max(0, matchStart - 120)
      const end = Math.min(combined.length, matchStart + consumedLen + 120)
      const context = combined.slice(start, end).replace(/\s+/g, ' ').trim()

      const tightStart = Math.max(0, matchStart - 80)
      const tightEnd = Math.min(combined.length, matchStart + consumedLen + 80)
      const tightCtx = combined.slice(tightStart, tightEnd)
      // Three NON_FEE gates: tight-context regex, row-first-cell label
      // (e.g. "Add-on Charges"), and column-header label of the specific
      // cell the figure sits in (e.g. header "Per-Sem" over the ₹49,000
      // column of a JAIN-row). The column header is the tightest catch for
      // comparison tables that put components in dedicated columns.
      const cellForNonFee = findRow(tables, matchStart)
      const rowLabel = cellForNonFee?.row?.firstText || ''
      const colHeader = cellForNonFee?.columnHeader || ''
      if (isNonFee(tightCtx) || isRowHeaderNonFee(rowLabel) || isRowHeaderNonFee(colHeader) || isBucketRange(combined, matchStart, consumedLen)) {
        rows.push({
          slug: post.slug, publishedAt: post.publishedAt, raw: rawFull,
          value, valueMin: vMin, valueMax: vMax,
          klass: 'NON_FEE', universityId: '', programme: '', confidence: '',
          rule: '', primary: '', context,
        })
        continue
      }

      const attr = attribute(post, combined, tables, matchStart, consumedLen)
      let prog = detectProgramme(combined.slice(Math.max(0, matchStart - 200), matchStart + consumedLen + 200))
      if (!prog) prog = detectProgramme(`${post.slug.replace(/-/g, ' ')} ${post.title}`)

      const cls = classify({
        blogValue: value,
        blogMin: vMin, blogMax: vMax,
        universityId: attr.uid,
        programme: prog,
      })

      const primary = attr.uid ? firstUniInText(post.slug.replace(/-/g, ' ')) === attr.uid : false

      rows.push({
        slug: post.slug,
        publishedAt: post.publishedAt,
        raw: rawFull,
        value,
        valueMin: vMin,
        valueMax: vMax,
        klass: cls.klass,
        universityId: attr.uid || '',
        programme: prog || '',
        confidence: attr.confidence,
        attribRule: attr.rule,
        dataMin: cls.accepted && cls.accepted[0]?.min || null,
        dataMax: cls.accepted && cls.accepted[0]?.max || null,
        delta: cls.delta,
        displayCompact: cls.displayCompact || '',
        primary: attr.uid ? (primary ? 'primary' : 'competitor') : '',
        context,
      })
    }
  }
  return rows
}

// Per-slug count of NON-verified fee figures. Verified = MATCH or
// allowlisted. NON_FEE is excluded. UNRESOLVED, MISMATCH, SUPPRESSED,
// ORPHAN count only when the figure is not in the allowlist.
//
// allowSet is a Set of `${slug}::${value}` keys built from
// data/blog-fee-allowlist.json. Pass an empty Set (or omit) to fall back
// to the pre-2026-08-10 behaviour where the allowlist did not affect the
// existing-post loose-count ratchet.
export function perSlugUnverifiedCounts(rows, allowSet = new Set()) {
  const counts = {}
  for (const r of rows) {
    if (r.klass === 'NON_FEE') continue
    if (r.klass === 'MATCH') continue
    const vs = [r.value, r.valueMin, r.valueMax]
    let allowed = false
    for (const v of vs) if (v != null && allowSet.has(`${r.slug}::${v}`)) { allowed = true; break }
    if (allowed) continue
    counts[r.slug] = (counts[r.slug] || 0) + 1
  }
  return counts
}
