// scripts/fix-content-nirf-naac-aicte.js
//
// Unified bulk-fix for NIRF / NAAC / AICTE claims across:
//   - lib/data/page-content/*.json (348 spec page content files)
//   - lib/blog.ts (already partially fixed earlier in the session)
//   - lib/content.ts
//
// Each spec-page JSON has a uniSlug field → look up truth from lib/data.ts and
// nirf_2025_map.json, then apply targeted fixes for that university only.
//
// Run: node scripts/fix-content-nirf-naac-aicte.js [--dry]
// Pass --dry to preview without writing.

const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')
const ROOT = path.join(__dirname, '..')
const DATA_TS = path.join(ROOT, 'lib', 'data.ts')
const NIRF_JSON = path.join(ROOT, 'nirf_2025_map.json')
const PAGE_CONTENT_DIR = path.join(ROOT, 'lib', 'data', 'page-content')

const dataSrc = fs.readFileSync(DATA_TS, 'utf8')
const nirfRaw = JSON.parse(fs.readFileSync(NIRF_JSON, 'utf8'))

// ── Read XLSX as authoritative NIRF 2025 source ────────────────────────
// The Excel file is the original NIRF 2025 publication snapshot. Use it as
// truth, not lib/data.ts (which has known stale entries) and not the
// nirf_2025_map.json (built earlier, but XLSX has slight conflicts).
const XLSX = require('xlsx')
const NIRF_XLSX = path.join(ROOT, 'NIRF_2025_Rankings_v2.xlsx')
const xlsxBook = XLSX.readFile(NIRF_XLSX)
const xlsxSheet = XLSX.utils.sheet_to_json(xlsxBook.Sheets[xlsxBook.SheetNames[0]])
// Each row: __EMPTY = name, __EMPTY_1 = uni rank, __EMPTY_2 = mgt rank
const NIRF_AUTHORITATIVE = {}  // lowercase name (subset) → {uni, mgt}
for (const row of xlsxSheet) {
  const name = row.__EMPTY
  if (!name || typeof name !== 'string') continue
  const uniRaw = row.__EMPTY_1
  const mgtRaw = row.__EMPTY_2
  const parse = (v) => {
    if (v === 'NR' || v === '' || v === undefined) return 0
    const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
    return isNaN(n) || n === 0 ? 0 : n
  }
  NIRF_AUTHORITATIVE[name.toLowerCase().trim()] = { uni: parse(uniRaw), mgt: parse(mgtRaw) }
}

// ── Build NIRF lookup keyed by official name → {uni, mgt} ────────────────
const NIRF_BY_OFFICIAL = {}
for (const [name, ranks] of Object.entries(nirfRaw)) {
  NIRF_BY_OFFICIAL[name.toLowerCase()] = ranks
}

// ── Build truth table from lib/data.ts ──────────────────────────────────
// Each university block has nirf, nirfMgt, naac, approvals fields. We pluck
// them by finding the next id: 'slug' anchor and reading forward 60 lines.
const TRUTH = {}  // slug → { name, abbr, naac, aicte, ugcDeb, nirfUni, nirfMgt }

const idRe = /id:\s*'([a-z0-9-]+)'/g
let m
while ((m = idRe.exec(dataSrc)) !== null) {
  const id = m[1]
  // Read forward 3000 chars to capture this university's fields
  const blk = dataSrc.slice(m.index, m.index + 3000)
  // Stop at the next id: 'xxx' to avoid bleed-over
  const nextIdAt = blk.search(/(?<=\n).{0,20}id:\s*'/)
  const myBlk = nextIdAt > 0 ? blk.slice(0, nextIdAt) : blk

  const nameM = myBlk.match(/name:\s*'([^']+)'/)
  const abbrM = myBlk.match(/abbr:\s*'([^']+)'/)
  const naacM = myBlk.match(/naac:\s*'([^']+)'/)
  const approvalsM = myBlk.match(/approvals:\s*\[([^\]]*)\]/)
  const approvals = approvalsM ? approvalsM[1] : ''
  const aicte = /AICTE/i.test(approvals)
  const ugcDeb = /UGC[-\s]?DEB/i.test(approvals) || /UGC\s+DEB/i.test(approvals)

  // Match XLSX → uni-slug. Uses slug tokens (e.g. ['jain'] for jain-university-online)
  // The slug is the most stable identifier across files.
  let nirfUni = 0, nirfMgt = 0
  const slugTokens = id
    .replace(/-online$|-deemed-to-be|-university|-institute|-of-/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !['online','university','institute','academy','deemed','school','college','technology','science','research'].includes(t))
  if (slugTokens.length === 0) {
    // fallback to abbr match
    if (abbrM) slugTokens.push(abbrM[1].toLowerCase())
  }
  for (const [xlsxName, ranks] of Object.entries(NIRF_AUTHORITATIVE)) {
    if (slugTokens.length && slugTokens.every(t => xlsxName.includes(t))) {
      nirfUni = ranks.uni; nirfMgt = ranks.mgt; break
    }
  }

  TRUTH[id] = {
    name: nameM ? nameM[1] : id,
    abbr: abbrM ? abbrM[1] : id,
    naac: naacM ? naacM[1] : null,
    aicte,
    ugcDeb,
    nirfUni,
    nirfMgt,
  }
}

console.log(`Truth table built for ${Object.keys(TRUTH).length} universities`)

// ── Sanity-check a few ──
for (const slug of ['manipal-academy-higher-education-online', 'nmims-online', 'jain-university-online', 'amity-university-online', 'alliance-university-online']) {
  console.log(`  ${slug}:`, TRUTH[slug])
}

// ── Fix function for a single content blob ──────────────────────────────
function fixContent(content, truth, slug) {
  let out = content
  const changes = []

  // 1) NIRF #N (no category) — add category. Skip if already has Mgmt/Univ
  // We only patch if the unattached "NIRF #N" appears within a paragraph that
  // names the university, to avoid over-broad rewrites.
  // But for spec-content JSON files where every line is about that uni,
  // we apply directly.

  const expectedUni = truth.nirfUni
  const expectedMgt = truth.nirfMgt

  // Helper: only-fix-if-sentence-is-about-primary-uni-and-no-peer-named.
  // Used to scope NIRF and NAAC replacements to claims clearly about the
  // file's main university — not to comparison sentences citing peers.
  const aliasTokens = [
    truth.abbr.toLowerCase(),
    truth.name.toLowerCase().split(/[\s(]/).filter(t => t.length >= 4)[0] || '',
  ].filter(Boolean)
  const KNOWN_ALIASES_LOWER = [
    'amity', 'nmims', 'symbiosis', 'mahe', 'manipal academy', 'manipal university', 'jain', 'lpu',
    'lovely professional', 'chandigarh university', 'upes', 'bits', 'shoolini', 'galgotias',
    'chitkara', 'amrita', 'parul', 'mangalayatan', 'alliance', 'graphic era', 'jamia hamdard',
    'kalinga', 'sastra', 'srm', 'vit ', 'dy patil', 'kiit',
  ]
  const isAboutOwnUni = (offset) => {
    const before = out.lastIndexOf('.', offset - 1)
    const after = out.indexOf('.', offset)
    const sentStart = before === -1 ? Math.max(0, offset - 200) : before + 1
    const sentEnd = after === -1 ? Math.min(out.length, offset + 200) : after
    const sentence = out.slice(sentStart, sentEnd).toLowerCase()
    const hasOwnAlias = aliasTokens.some(a => a && sentence.includes(a))
    const otherAliases = KNOWN_ALIASES_LOWER.filter(a => !aliasTokens.some(own => own.includes(a) || a.includes(own)))
    const hasPeer = otherAliases.some(a => sentence.includes(a))
    return hasOwnAlias && !hasPeer
  }

  // 1a) "NIRF #X" → label appropriately if X matches truth AND sentence is about own uni
  const bareNirf = /NIRF\s+#\s*(\d{1,3})\b(?!\s*(?:in\s+)?(?:Management|Mgmt|Mgt|University|Universities|Overall))/g
  out = out.replace(bareNirf, (match, n, offset) => {
    if (!isAboutOwnUni(offset)) return match
    const num = parseInt(n, 10)
    if (num === expectedUni && expectedUni > 0) {
      changes.push(`[NIRF cat] NIRF #${num} → NIRF #${num} University 2025`)
      return `NIRF #${num} University 2025`
    }
    if (num === expectedMgt && expectedMgt > 0) {
      changes.push(`[NIRF cat] NIRF #${num} → NIRF #${num} Management 2025`)
      return `NIRF #${num} Management 2025`
    }
    return match
  })

  // 1b) "#X" inside a "NIRF" sentence — same logic
  // (Avoid changing prices/years already adjacent.)

  // 2) NIRF University WRONG: claimed "#X University" but truth says #Y.
  // Only fix when truth is positive and differs (avoid injecting "not ranked"
  // for universities that may legitimately appear in NIRF Pharmacy/Medical/
  // Innovation lists not captured in our 3-column XLSX export).
  const uniClaim = /#\s*(\d{1,3})\s+University(?:\s+\d{4})?/g
  out = out.replace(uniClaim, (match, n, offset) => {
    if (!isAboutOwnUni(offset)) return match
    const num = parseInt(n, 10)
    if (expectedUni > 0 && num !== expectedUni) {
      changes.push(`[NIRF Uni wrong] #${num} University → #${expectedUni} University 2025`)
      return `#${expectedUni} University 2025`
    }
    return match
  })

  // 3) NIRF Management WRONG: claimed "#X Mgmt" but truth says #Y.
  const mgtClaim = /#\s*(\d{1,3})\s+(?:Management|Mgmt|Mgt)(?:\s+\d{4})?/g
  out = out.replace(mgtClaim, (match, n, offset) => {
    if (!isAboutOwnUni(offset)) return match
    const num = parseInt(n, 10)
    if (expectedMgt > 0 && num !== expectedMgt) {
      changes.push(`[NIRF Mgmt wrong] #${num} Mgmt → #${expectedMgt} Management 2025`)
      return `#${expectedMgt} Management 2025`
    }
    return match
  })

  // 4) NAAC grade — only fix when the NAAC claim sits in a sentence that
  // names the file's primary university (or its abbr). Comparison sentences
  // mentioning peer universities' NAAC grades must NOT be touched.
  if (truth.naac) {
    const aliasTokens = [
      truth.abbr.toLowerCase(),
      truth.name.toLowerCase().split(/[\s(]/).filter(t => t.length >= 4)[0] || '',
    ].filter(Boolean)
    // Find each "NAAC X" claim and only fix it if the enclosing sentence
    // (delimited by . ! ? or newline) contains an alias token AND no other
    // university name patterns (Symbiosis, NMIMS, MAHE, JAIN, etc.)
    const KNOWN_ALIASES_LOWER = [
      'amity', 'nmims', 'symbiosis', 'mahe', 'manipal academy', 'manipal university', 'jain', 'lpu',
      'lovely professional', 'chandigarh university', 'upes', 'bits', 'shoolini', 'galgotias',
      'chitkara', 'amrita', 'parul', 'mangalayatan', 'alliance', 'graphic era', 'jamia hamdard',
      'kalinga', 'sastra', 'srm', 'vit ', 'dy patil', 'kiit',
    ]
    const naacClaim = /NAAC\s+([A-D]\+{0,2}|Not\s+Accredited)/g
    out = out.replace(naacClaim, (match, grade, offset) => {
      if (grade === truth.naac) return match
      // Find the enclosing sentence
      const before = out.lastIndexOf('.', offset - 1)
      const after = out.indexOf('.', offset)
      const sentStart = before === -1 ? Math.max(0, offset - 200) : before + 1
      const sentEnd = after === -1 ? Math.min(out.length, offset + 200) : after
      const sentence = out.slice(sentStart, sentEnd).toLowerCase()
      // Must mention this uni's alias
      const hasOwnAlias = aliasTokens.some(a => sentence.includes(a))
      // Must NOT mention any other known uni
      const otherAliases = KNOWN_ALIASES_LOWER.filter(a => !aliasTokens.includes(a))
      const hasPeer = otherAliases.some(a => sentence.includes(a))
      if (!hasOwnAlias || hasPeer) return match
      changes.push(`[NAAC wrong] NAAC ${grade} → NAAC ${truth.naac}`)
      return `NAAC ${truth.naac}`
    })
  }

  // 5) AICTE — only flag if a non-AICTE uni claims AICTE approval
  // (We don't auto-remove AICTE claims for unis that have it.)
  if (!truth.aicte) {
    // Don't auto-remove — too risky. Just record for manual review.
    if (/AICTE\s+approved/i.test(out)) {
      changes.push(`[AICTE flag] file claims AICTE approval but truth says no AICTE — manual review needed`)
    }
  }

  return { out, changes }
}

// ── Process each spec-content JSON ──────────────────────────────────────
const files = fs.readdirSync(PAGE_CONTENT_DIR).filter(f => f.endsWith('.json'))
let totalChanges = 0
let filesChanged = 0
const aicteFlags = []

for (const file of files) {
  const fullPath = path.join(PAGE_CONTENT_DIR, file)
  const raw = fs.readFileSync(fullPath, 'utf8')
  let parsed
  try { parsed = JSON.parse(raw) } catch { continue }

  const slug = parsed.uniSlug
  if (!slug || !TRUTH[slug]) continue

  const { out, changes } = fixContent(raw, TRUTH[slug], slug)

  for (const c of changes) {
    if (c.startsWith('[AICTE flag]')) {
      aicteFlags.push(`  ${file}: ${c}`)
    }
  }

  if (out !== raw) {
    if (!DRY) fs.writeFileSync(fullPath, out, 'utf8')
    filesChanged++
    totalChanges += changes.filter(c => !c.startsWith('[AICTE flag]')).length
    if (changes.length <= 5) {
      console.log(`✓ ${file}`)
      changes.forEach(c => console.log(`    ${c}`))
    } else {
      console.log(`✓ ${file}  (${changes.length} changes)`)
    }
  }
}

console.log(`\n${DRY ? '[DRY]' : ''} Files changed: ${filesChanged}, total replacements: ${totalChanges}`)

if (aicteFlags.length) {
  console.log(`\n=== AICTE flags (manual review) ===`)
  aicteFlags.slice(0, 30).forEach(f => console.log(f))
  if (aicteFlags.length > 30) console.log(`...and ${aicteFlags.length - 30} more`)
}
