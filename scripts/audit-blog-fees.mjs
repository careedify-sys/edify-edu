// scripts/audit-blog-fees.mjs
// Extract every ₹/Rs/INR figure from lib/blog.ts post prose, infer the
// university + programme via structure-aware attribution, and cross-reference
// against getDisplayFee() / lib/data.ts. Writes a CSV + summary.
//
// v2 uses scripts/lib/blog-fee-scan.mjs — see that file's header for the
// attribution rules and the multi-value classifier.
//
// Run: npx tsx scripts/audit-blog-fees.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { scanAllPosts } from './lib/blog-fee-scan.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'audits')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const TODAY = '2026-08-07'
const CSV_PATH = join(OUT_DIR, `blog-fee-crossref-${TODAY}.csv`)
const SUMMARY_PATH = join(OUT_DIR, `blog-fee-summary-${TODAY}.md`)

const rows = scanAllPosts()

function csvEscape(v) {
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const header = [
  'slug', 'publishedAt', 'raw', 'value_rupees', 'value_min', 'value_max',
  'class', 'universityId', 'programme', 'confidence', 'attribution_rule',
  'dataMin', 'dataMax', 'delta_vs_nearest_bound', 'display_compact',
  'primary_or_competitor', 'context',
]
const lines = [header.join(',')]
for (const r of rows) {
  lines.push([
    r.slug, r.publishedAt, r.raw, r.value, r.valueMin, r.valueMax,
    r.klass, r.universityId, r.programme, r.confidence, r.attribRule,
    r.dataMin ?? '', r.dataMax ?? '',
    r.delta == null ? '' : (r.delta * 100).toFixed(1) + '%',
    r.displayCompact,
    r.primary,
    r.context,
  ].map(csvEscape).join(','))
}
writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8')

const byClass = {}
const byConfidence = {}
const bySlug = {}
for (const r of rows) {
  byClass[r.klass] = (byClass[r.klass] || 0) + 1
  const ck = `${r.klass}/${r.confidence || '-'}`
  byConfidence[ck] = (byConfidence[ck] || 0) + 1
  bySlug[r.slug] = bySlug[r.slug] || { total: 0, MATCH: 0, MISMATCH: 0, SUPPRESSED: 0, ORPHAN: 0, UNRESOLVED: 0, NON_FEE: 0 }
  bySlug[r.slug].total++
  bySlug[r.slug][r.klass]++
}

const md = []
md.push(`# Blog fee crossref summary — ${TODAY}`)
md.push('')
md.push(`Extractor v2 (structural attribution + range parsing + expanded NON_FEE).`)
md.push('')
md.push(`Total figures: **${rows.length}**`)
md.push('')
md.push('## By classification')
md.push('')
md.push('| Class | Count |')
md.push('|---|---:|')
for (const cls of ['MATCH', 'MISMATCH', 'SUPPRESSED', 'ORPHAN', 'UNRESOLVED', 'NON_FEE']) {
  md.push(`| ${cls} | ${byClass[cls] || 0} |`)
}
md.push('')
md.push('## By class × confidence')
md.push('')
md.push('| Class / Confidence | Count |')
md.push('|---|---:|')
for (const k of Object.keys(byConfidence).sort()) md.push(`| ${k} | ${byConfidence[k]} |`)
md.push('')
md.push('## Top 30 slugs by figure count')
md.push('')
md.push('| slug | total | MATCH | MISMATCH | SUPPRESSED | ORPHAN | UNRESOLVED | NON_FEE |')
md.push('|---|---:|---:|---:|---:|---:|---:|---:|')
for (const [slug, c] of Object.entries(bySlug).sort((a, b) => b[1].total - a[1].total).slice(0, 30)) {
  md.push(`| ${slug} | ${c.total} | ${c.MATCH} | ${c.MISMATCH} | ${c.SUPPRESSED} | ${c.ORPHAN} | ${c.UNRESOLVED} | ${c.NON_FEE} |`)
}
md.push('')
md.push(`CSV: audits/blog-fee-crossref-${TODAY}.csv`)
md.push('')
writeFileSync(SUMMARY_PATH, md.join('\n'), 'utf8')

console.log(`Extracted ${rows.length} figures.`)
for (const cls of ['MATCH', 'MISMATCH', 'SUPPRESSED', 'ORPHAN', 'UNRESOLVED', 'NON_FEE']) {
  console.log(`  ${cls.padEnd(12)}: ${byClass[cls] || 0}`)
}
console.log(`Wrote ${CSV_PATH}`)
console.log(`Wrote ${SUMMARY_PATH}`)
