// scripts/sample-blog-fee-mismatches.mjs
// Emit a stratified random sample (20 primary + 20 competitor) of MISMATCH
// rows from the crossref CSV, each with the full surrounding HTML block
// pulled directly from lib/blog.ts (so I can judge the extractor's precision
// row by row). Deterministic — same seed every run.
//
// Output: audits/blog-fee-precision-sample-<date>.md (skeleton; classifications
// filled in by hand in the report after reading).

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BLOG_POSTS } from '../lib/blog.ts'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TODAY = '2026-08-07'
const CSV_PATH = join(ROOT, 'audits', `blog-fee-crossref-${TODAY}.csv`)
const OUT_PATH = join(ROOT, 'audits', `blog-fee-precision-sample-${TODAY}.md`)

const POST_BY_SLUG = new Map(BLOG_POSTS.map(p => [p.slug, p]))
const UNI_BY_ID = new Map(UNIVERSITIES.map(u => [u.id, u]))

function parseCsv(text) {
  const rows = []
  let i = 0, field = '', cur = [], inQ = false
  while (i < text.length) {
    const c = text[i]
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQ = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { inQ = true; i++; continue }
    if (c === ',') { cur.push(field); field = ''; i++; continue }
    if (c === '\n') { cur.push(field); rows.push([...cur]); cur = []; field = ''; i++; continue }
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

// v2: sample only high-confidence rows so we measure precision of the
// tightened attribution rules, not the fallbacks. Low-confidence rows are
// UNRESOLVED-adjacent and expected to be noisier.
const mismatches = records.filter(r => r.class === 'MISMATCH' && r.confidence === 'high')
const primary = mismatches.filter(r => r.primary_or_competitor === 'primary')
const competitor = mismatches.filter(r => r.primary_or_competitor === 'competitor')

// LCG-based deterministic PRNG
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = a
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}
function sampleN(arr, n, seed) {
  const r = mulberry32(seed)
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

const primSample = sampleN(primary, 20, 4242)
const compSample = sampleN(competitor, 20, 8181)

// Find the smallest enclosing HTML block for a rupee-figure occurrence.
// We look for the raw string in the post content (Nth occurrence match) and
// walk out to the nearest <p>, <li>, <td>, <h2>, <h3>, or <blockquote> tag.
function findBlock(html, raw, nth) {
  const positions = []
  let i = 0
  while (true) {
    const p = html.indexOf(raw, i)
    if (p < 0) break
    positions.push(p)
    i = p + 1
  }
  const pos = positions[Math.min(nth, positions.length - 1)] ?? -1
  if (pos < 0) return null
  const OPEN = /<(p|li|td|th|h2|h3|h4|blockquote|div)\b[^>]*>/gi
  const CLOSE = /<\/(p|li|td|th|h2|h3|h4|blockquote|div)>/gi
  // Find closest opening tag before pos.
  let openIdx = -1, openLen = 0
  OPEN.lastIndex = 0
  let m
  while ((m = OPEN.exec(html))) {
    if (m.index > pos) break
    openIdx = m.index
    openLen = m[0].length
  }
  // Find closest closing tag after pos.
  CLOSE.lastIndex = pos
  const close = CLOSE.exec(html)
  const closeIdx = close ? close.index + close[0].length : Math.min(html.length, pos + 400)
  if (openIdx < 0) {
    return html.slice(Math.max(0, pos - 200), Math.min(html.length, pos + 400))
  }
  return html.slice(openIdx, closeIdx)
}

// Track per-slug per-raw occurrence counters so repeated identical figures
// each get their own block.
const occCounter = new Map()

function nextOcc(slug, raw) {
  const k = `${slug}::${raw}`
  const n = occCounter.get(k) || 0
  occCounter.set(k, n + 1)
  return n
}

function renderRow(r, tag) {
  const post = POST_BY_SLUG.get(r.slug)
  const u = UNI_BY_ID.get(r.universityId)
  const disp = u ? getDisplayFee(u, r.programme) : null
  const html = post?.content || ''
  const n = nextOcc(r.slug, r.raw)
  const block = findBlock(html, r.raw, n) || '(block not found)'
  const dispStr = disp ? (disp.ok ? `${disp.compact} (rule ${disp.rule})` : `SUPPRESSED (rule ${disp.rule}: ${disp.reason})`) : '—'
  const lines = []
  lines.push(`### ${tag} · ${r.slug}`)
  lines.push('')
  lines.push(`- publishedAt: ${r.publishedAt}`)
  lines.push(`- raw figure: **${r.raw}** (normalised: ₹${Number(r.value_rupees).toLocaleString('en-IN')})`)
  lines.push(`- inferred uni: **${r.universityId}**`)
  lines.push(`- inferred programme: **${r.programme}**`)
  lines.push(`- data.ts pd.fees: \`${u?.programDetails?.[r.programme]?.fees ?? '—'}\``)
  lines.push(`- data.ts feeMin/feeMax: ${u?.feeMin ?? '—'} / ${u?.feeMax ?? '—'}`)
  lines.push(`- getDisplayFee: ${dispStr}`)
  lines.push(`- delta vs nearest bound: ${r.delta_vs_nearest_bound}`)
  lines.push('')
  lines.push('```html')
  lines.push(block.slice(0, 2500))
  lines.push('```')
  lines.push('')
  lines.push('**Classification:** _to be filled by hand_')
  lines.push('')
  return lines.join('\n')
}

const md = []
md.push(`# MISMATCH precision sample — ${TODAY}`)
md.push('')
md.push(`Random stratified sample of 40 MISMATCH rows from audits/blog-fee-crossref-${TODAY}.csv.`)
md.push('Seed: primary=4242, competitor=8181. Sample is reproducible.')
md.push('')
md.push(`Total MISMATCH rows in corpus: ${mismatches.length}`)
md.push(`  primary: ${primary.length}, competitor: ${competitor.length}`)
md.push('')
md.push(`Sample size: 20 primary + 20 competitor = 40`)
md.push('')
md.push('## Rows')
md.push('')
md.push('### PRIMARY-SUBJECT ROWS')
md.push('')
primSample.forEach((r, i) => md.push(renderRow(r, `P${i + 1}`)))
md.push('### COMPETITOR-QUOTED ROWS')
md.push('')
compSample.forEach((r, i) => md.push(renderRow(r, `C${i + 1}`)))

writeFileSync(OUT_PATH, md.join('\n'), 'utf8')
console.log(`Wrote ${OUT_PATH}`)
console.log(`  primary sample: ${primSample.length}, competitor sample: ${compSample.length}`)
