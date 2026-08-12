// scripts/build-blog-fee-triage.mjs
// Reads audits/blog-fee-crossref-<date>.csv and produces the triage report
// for the 13 target-university blogs. Also produces the ma-full-form analysis
// and the reverse-backfill candidates list.
//
// Amendment: report blog last-updated, blog vs data direction (HIGHER/LOWER),
// and any pd.fees timestamp comments for that uni+programme. Sorted by
// publishedAt desc.
//
// Run: npx tsx scripts/build-blog-fee-triage.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BLOG_POSTS } from '../lib/blog.ts'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee, findAllFeeMismatches } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'audits')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const TODAY = '2026-08-07'
const CSV_PATH = join(OUT_DIR, `blog-fee-crossref-${TODAY}.csv`)
const TRIAGE_PATH = join(OUT_DIR, `blog-fee-triage-${TODAY}.md`)
const BACKFILL_PATH = join(OUT_DIR, `fee-backfill-candidates-${TODAY}.md`)

const TARGET_UNIS = new Set([
  'amity-university-online',
  'manipal-academy-of-higher-education-online',
  'manipal-university-jaipur-online',
  'sikkim-manipal-university-online',
  'lovely-professional-university-online',
  'chandigarh-university-online',
  'jain-university-online',
  'galgotias-university-online',
])

// first-wins to match runtime getPostBySlug's .find() resolution. new Map()
// silently kept the LAST duplicate, so this script analysed content the site
// did not serve for the 12 slugs duplicated by commit a78ec2e. After
// fix/dedupe-blog-slugs the corpus has no duplicates, but keep the first-wins
// build so any future regression stays aligned with runtime.
const POST_BY_SLUG = new Map()
for (const p of BLOG_POSTS) if (!POST_BY_SLUG.has(p.slug)) POST_BY_SLUG.set(p.slug, p)
const UNI_BY_ID = new Map(UNIVERSITIES.map(u => [u.id, u]))

// -- CSV read --------------------------------------------------------------

function parseCsv(text) {
  const rows = []
  let i = 0
  const cur = []
  let field = ''
  let inQuote = false
  while (i < text.length) {
    const c = text[i]
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQuote = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { inQuote = true; i++; continue }
    if (c === ',') { cur.push(field); field = ''; i++; continue }
    if (c === '\n') { cur.push(field); rows.push([...cur]); cur.length = 0; field = ''; i++; continue }
    if (c === '\r') { i++; continue }
    field += c; i++
  }
  if (field.length || cur.length) { cur.push(field); rows.push([...cur]) }
  return rows
}

const raw = parseCsv(readFileSync(CSV_PATH, 'utf8'))
const header = raw[0]
const idx = {}
for (let i = 0; i < header.length; i++) idx[header[i]] = i
const records = raw.slice(1).filter(r => r.length >= header.length).map(r => {
  const o = {}
  for (const [k, i] of Object.entries(idx)) o[k] = r[i]
  return o
})

// -- Read raw lib/data.ts for per-row fee-updated comments ----------------

const DATA_TS = readFileSync(join(ROOT, 'lib', 'data.ts'), 'utf8')

// For a given uni.id, find the block and look for a Sprint 2 / verified /
// updated timestamp comment. Returns the first ISO date found, or null.
function findFeeTimestamp(uid) {
  const idxUni = DATA_TS.indexOf(`id: '${uid}'`)
  if (idxUni < 0) return null
  // Slice ~6000 chars downstream, enough to cover a full uni block.
  const slab = DATA_TS.slice(idxUni, idxUni + 8000)
  const m = slab.match(/(?:verified|updated|Sprint\s*\d+[^\n]*|fee[^\n]*updated)[^\n]*?(\d{4}-\d{2}-\d{2})/i)
  return m ? m[1] : null
}

// -- Triage rows -----------------------------------------------------------

const triageRows = records
  .filter(r => TARGET_UNIS.has(r.universityId))
  .filter(r => ['MISMATCH', 'SUPPRESSED', 'ORPHAN'].includes(r.class))

// Enrich with publishedAt (already in CSV), direction, and pd.fees ts.
const enriched = triageRows.map(r => {
  const post = POST_BY_SLUG.get(r.slug)
  const blogValue = Number(r.value_rupees)
  const u = UNI_BY_ID.get(r.universityId)
  const pd = u?.programDetails?.[r.programme]
  const pdFees = pd?.fees ?? ''
  const disp = u ? getDisplayFee(u, r.programme) : null
  let direction = ''
  if (r.class === 'MISMATCH' && disp?.ok) {
    const dMin = disp.min || 0
    const dMax = disp.max || dMin
    if (blogValue > dMax) direction = 'HIGHER'
    else if (blogValue < dMin) direction = 'LOWER'
    else direction = 'WITHIN'
  }
  const feeTs = u ? findFeeTimestamp(u.id) : null
  return {
    ...r,
    publishedAt: post?.publishedAt || r.publishedAt || '',
    blogValue,
    pdFees,
    dispCompact: disp?.compact || '',
    dispOk: disp?.ok ? 'ok' : 'suppressed',
    direction,
    feeTs: feeTs || '',
  }
})

// Sort by publishedAt desc.
enriched.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))

// Split into primary vs competitor.
const primary = enriched.filter(r => r.primary_or_competitor === 'primary')
const competitor = enriched.filter(r => r.primary_or_competitor === 'competitor')

// Count breakdown.
function countByClass(list) {
  const c = { MISMATCH: 0, SUPPRESSED: 0, ORPHAN: 0 }
  for (const r of list) c[r.class] = (c[r.class] || 0) + 1
  return c
}

const md = []
md.push(`# Blog fee triage — target universities — ${TODAY}`)
md.push('')
md.push(`Source: audits/blog-fee-crossref-${TODAY}.csv`)
md.push('')
md.push(`Target universities: Amity, MAHE, MUJ, SMU, LPU, Chandigarh, JAIN, Galgotias.`)
md.push(`Direction of truth: **not assumed**. Blog figure and lib/data.ts figure are both reported. User states blog figures are current; lib/data.ts may be stale. Verify per-row against official portal before editing either side.`)
md.push('')
md.push('lib/data.ts does not carry per-programme fee-updated timestamps or a fee_history object. The nearest signal is the free-text comment on programFees rows (e.g. `// Sprint 2 verified 2026-08-04`). The `feeTs` column below is the first ISO date found in that university\'s block, not necessarily for this exact programme.')
md.push('')
md.push(`## Counts`)
md.push('')
md.push(`- Primary-subject rows: ${primary.length} (${JSON.stringify(countByClass(primary))})`)
md.push(`- Competitor-quoted rows: ${competitor.length} (${JSON.stringify(countByClass(competitor))})`)
md.push('')

function rowLine(r) {
  const ctx = (r.context || '').slice(0, 160).replace(/\|/g, '\\|')
  return `| ${r.publishedAt} | ${r.slug} | ${r.universityId} | ${r.programme} | ${r.class} | ${r.raw} | ₹${r.blogValue.toLocaleString('en-IN')} | ${r.pdFees || '—'} | ${r.dispCompact || '—'} | ${r.delta_vs_nearest_bound || ''} | ${r.direction || ''} | ${r.feeTs || '—'} | ${ctx} |`
}

const tableHeader = [
  '| publishedAt | slug | universityId | programme | class | raw | blog value | pd.fees | getDisplayFee | delta | direction | feeTs | context |',
  '|---|---|---|---|---|---|---:|---|---|---:|---|---|---|',
]

md.push('## Primary-subject rows (blog is about this university)')
md.push('')
md.push(...tableHeader)
for (const r of primary) md.push(rowLine(r))
md.push('')
md.push('## Competitor-quoted rows (blog is NOT about this university — higher stakes to quote wrong)')
md.push('')
md.push(...tableHeader)
for (const r of competitor) md.push(rowLine(r))
md.push('')

// -- ma-full-form analysis ------------------------------------------------

const MA_SLUG = 'ma-full-form-course-details-eligibility-fees-2026'
const maRecords = records.filter(r => r.slug === MA_SLUG)
const maPost = POST_BY_SLUG.get(MA_SLUG)

md.push('## ma-full-form-course-details-eligibility-fees-2026')
md.push('')
if (!maPost) {
  md.push('Post not found in BLOG_POSTS.')
} else {
  md.push(`- Published: ${maPost.publishedAt}`)
  md.push(`- Category: ${maPost.category}`)
  md.push(`- Title: ${maPost.title}`)
  md.push(`- Meta: ${maPost.metaDescription}`)
  md.push(`- Length (chars): ${(maPost.content || '').length}`)
  md.push(`- ₹ figures extracted: ${maRecords.length}`)
  md.push('')
  const maCounts = {}
  for (const r of maRecords) maCounts[r.class] = (maCounts[r.class] || 0) + 1
  md.push('Class breakdown:')
  md.push('')
  md.push('| Class | Count |')
  md.push('|---|---:|')
  for (const [k, v] of Object.entries(maCounts).sort((a, b) => b[1] - a[1])) md.push(`| ${k} | ${v} |`)
  md.push('')
  // What is it? Sniff for tables, university lists.
  const html = maPost.content || ''
  const h2Count = (html.match(/<h2\b/g) || []).length
  const h3Count = (html.match(/<h3\b/g) || []).length
  const tableCount = (html.match(/<table\b/gi) || []).length
  const trCount = (html.match(/<tr\b/gi) || []).length
  const uniMentions = new Set()
  for (const u of UNIVERSITIES) {
    if (html.includes(u.name.replace(/\s+Online$/i, ''))) uniMentions.add(u.id)
  }
  md.push(`Structure: ${h2Count} H2s, ${h3Count} H3s, ${tableCount} tables, ${trCount} rows. Distinct universities referenced by name: ${uniMentions.size}.`)
  md.push('')
  md.push('Recommendation basis: with 1,000+ ₹ figures and cross-university MA fee data at this scale, this page is functionally a competitor-style university-fee-list article, not a canonical Edify hub. The fee resolvability rate (MATCH share) below tells you how much of the content is already backed by lib/data.ts.')
  const resolved = (maCounts.MATCH || 0) + (maCounts.MISMATCH || 0) + (maCounts.SUPPRESSED || 0) + (maCounts.ORPHAN || 0)
  const matchPct = resolved > 0 ? Math.round(100 * (maCounts.MATCH || 0) / resolved) : 0
  md.push(`Resolvable to a specific uni+programme: ${resolved} / ${maRecords.length}. Of resolvable, MATCH share: ${matchPct}%.`)
}
md.push('')

// -- Note on non-target slugs ---------------------------------------------

md.push('## Note')
md.push('')
md.push('This report covers only the 13 target-university blogs (Amity, MAHE, MUJ, SMU, LPU, Chandigarh, JAIN, Galgotias) as directed. See the CSV for the full 82-post extraction, including UNRESOLVED and NON_FEE rows that were excluded here.')
md.push('')

writeFileSync(TRIAGE_PATH, md.join('\n'), 'utf8')

// -- Backfill candidates (Task E) -----------------------------------------

// Every current suppressed uni+programme; find blog figures that resolve to it.
const suppressed = findAllFeeMismatches(UNIVERSITIES)
const suppressedKey = new Map()
for (const s of suppressed) suppressedKey.set(`${s.universityId}::${s.program}`, s)

const backfillHits = []
for (const r of records) {
  if (r.class !== 'SUPPRESSED') continue
  const key = `${r.universityId}::${r.programme}`
  const s = suppressedKey.get(key)
  if (!s) continue
  const post = POST_BY_SLUG.get(r.slug)
  backfillHits.push({
    universityId: r.universityId,
    universityName: s.universityName,
    programme: r.programme,
    blogSlug: r.slug,
    blogPublishedAt: post?.publishedAt || '',
    blogRaw: r.raw,
    blogValue: Number(r.value_rupees),
    pdFees: s.pdFees,
    feeMin: s.feeMin,
    feeMax: s.feeMax,
    rule: s.rule,
    context: (r.context || '').slice(0, 200),
  })
}

// Group by uni+prog with most-recent blog first.
backfillHits.sort((a, b) => (b.blogPublishedAt || '').localeCompare(a.blogPublishedAt || ''))

const bm = []
bm.push(`# Reverse-backfill candidates — ${TODAY}`)
bm.push('')
bm.push('For every currently fee-suppressed programme (rule 4a/4b) where at least one blog post states a specific ₹ figure. These are candidates to REPAIR lib/data.ts (assuming the blog figure holds up against the official portal). No edits made — listing only.')
bm.push('')
bm.push(`Total hits: ${backfillHits.length}, covering ${new Set(backfillHits.map(h => `${h.universityId}::${h.programme}`)).size} suppressed programme rows.`)
bm.push('')
bm.push('| blog publishedAt | universityId | programme | rule | blog raw | blog value | current pd.fees | feeMin | feeMax | blog slug | context |')
bm.push('|---|---|---|---|---|---:|---|---:|---:|---|---|')
for (const h of backfillHits) {
  bm.push(`| ${h.blogPublishedAt} | ${h.universityId} | ${h.programme} | ${h.rule} | ${h.blogRaw} | ₹${h.blogValue.toLocaleString('en-IN')} | ${h.pdFees || '—'} | ${h.feeMin} | ${h.feeMax} | ${h.blogSlug} | ${h.context.replace(/\|/g, '\\|')} |`)
}
bm.push('')
writeFileSync(BACKFILL_PATH, bm.join('\n'), 'utf8')

console.log(`Triage rows: ${enriched.length} (${primary.length} primary, ${competitor.length} competitor)`)
console.log(`ma-full-form figures: ${maRecords.length}`)
console.log(`Backfill hits: ${backfillHits.length}`)
console.log(`Wrote ${TRIAGE_PATH}`)
console.log(`Wrote ${BACKFILL_PATH}`)
