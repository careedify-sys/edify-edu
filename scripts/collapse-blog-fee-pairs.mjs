// scripts/collapse-blog-fee-pairs.mjs
// Group MISMATCH + SUPPRESSED + ORPHAN rows into distinct (uni, programme)
// pairs. For each pair report: pair, row count, distinct blog values (with
// row-count per value), current pd.fees, feeMin/feeMax, and whether the blog
// values agree with each other. Flag pairs where >=2 blogs state the same
// value that data.ts disagrees with — cross-post agreement is the strongest
// signal that data.ts is the stale side.
//
// Output: audits/blog-fee-distinct-pairs-<date>.md

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TODAY = '2026-08-07'
const CSV_PATH = join(ROOT, 'audits', `blog-fee-crossref-${TODAY}.csv`)
const OUT_PATH = join(ROOT, 'audits', `blog-fee-distinct-pairs-${TODAY}.md`)

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

const targetClasses = new Set(['MISMATCH', 'SUPPRESSED', 'ORPHAN'])
const rows = records.filter(r => targetClasses.has(r.class) && r.universityId && r.programme)

// Group by pair.
const pairs = new Map()
for (const r of rows) {
  const key = `${r.universityId}::${r.programme}`
  if (!pairs.has(key)) pairs.set(key, {
    universityId: r.universityId,
    programme: r.programme,
    rows: [],
    slugs: new Set(),
    classes: {},
  })
  const p = pairs.get(key)
  p.rows.push(r)
  p.slugs.add(r.slug)
  p.classes[r.class] = (p.classes[r.class] || 0) + 1
}

// Aggregate distinct values per pair.
function bucketise(rows) {
  const map = new Map()
  for (const r of rows) {
    const v = Number(r.value_rupees)
    const bucket = map.get(v) || { value: v, rowCount: 0, slugs: new Set() }
    bucket.rowCount++
    bucket.slugs.add(r.slug)
    map.set(v, bucket)
  }
  return [...map.values()].sort((a, b) => b.rowCount - a.rowCount)
}

const pairRows = []
for (const p of pairs.values()) {
  const u = UNI_BY_ID.get(p.universityId)
  const pd = u?.programDetails?.[p.programme]
  const disp = u ? getDisplayFee(u, p.programme) : null
  const values = bucketise(p.rows)
  const distinctValues = values.length
  const dominant = values[0]
  const dominantSlugAgreement = dominant.slugs.size // distinct slugs stating the top value
  // Signal: does at least one blog value match data.ts within 2%?
  const dispOk = disp?.ok
  const dMin = dispOk ? (disp.min || 0) : null
  const dMax = dispOk ? (disp.max || dMin) : null
  const anyMatch = dispOk ? values.some(v => v.value >= dMin * 0.98 && v.value <= dMax * 1.02) : false

  // Flag when 2+ distinct blogs agree on a value that data.ts disagrees with.
  const flag = dominantSlugAgreement >= 2 && !anyMatch
  pairRows.push({
    key: `${p.universityId}::${p.programme}`,
    universityId: p.universityId,
    programme: p.programme,
    rowCount: p.rows.length,
    slugCount: p.slugs.size,
    classes: p.classes,
    values,
    distinctValues,
    dominant,
    dominantSlugAgreement,
    pdFees: pd?.fees ?? '',
    feeMin: u?.feeMin ?? '',
    feeMax: u?.feeMax ?? '',
    disp,
    anyMatch,
    flag,
  })
}

pairRows.sort((a, b) => b.rowCount - a.rowCount)

const flagged = pairRows.filter(p => p.flag)

const md = []
md.push(`# Distinct (university, programme) pairs — MISMATCH + SUPPRESSED + ORPHAN — ${TODAY}`)
md.push('')
md.push(`Source: audits/blog-fee-crossref-${TODAY}.csv`)
md.push('')
md.push(`Total distinct pairs: **${pairRows.length}**`)
md.push(`Total contributing rows: ${rows.length}`)
md.push(`Pairs where 2+ distinct blogs agree on a value that data.ts disagrees with: **${flagged.length}**`)
md.push('')
md.push('When multiple blogs independently state the same rupee value for a (uni, programme) pair and data.ts disagrees, that is the strongest signal that data.ts is the stale side. Those pairs are flagged with a leading star (⭐) below.')
md.push('')
md.push('## Cross-blog agreement flags (top of list)')
md.push('')
md.push('| pair | row count | distinct slugs | dominant blog value | distinct slugs stating it | current pd.fees | getDisplayFee | classes |')
md.push('|---|---:|---:|---|---:|---|---|---|')
for (const p of flagged) {
  const dispStr = p.disp?.ok ? p.disp.compact : `SUPPRESSED (${p.disp?.rule ?? ''})`
  const cls = Object.entries(p.classes).map(([k, v]) => `${k}:${v}`).join(' ')
  md.push(`| ${p.key} | ${p.rowCount} | ${p.slugCount} | ₹${p.dominant.value.toLocaleString('en-IN')} | ${p.dominantSlugAgreement} | ${p.pdFees || '—'} | ${dispStr} | ${cls} |`)
}
md.push('')
md.push('## All pairs (sorted by row count desc)')
md.push('')
md.push('| flag | pair | rows | slugs | distinct blog values (rowCount) | current pd.fees | getDisplayFee | classes |')
md.push('|---|---|---:|---:|---|---|---|---|')
for (const p of pairRows) {
  const dispStr = p.disp?.ok ? p.disp.compact : `SUPPRESSED (${p.disp?.rule ?? ''})`
  const cls = Object.entries(p.classes).map(([k, v]) => `${k}:${v}`).join(' ')
  const vs = p.values.slice(0, 6).map(v => `₹${v.value.toLocaleString('en-IN')} (${v.rowCount})`).join('; ') + (p.values.length > 6 ? `; +${p.values.length - 6} more` : '')
  md.push(`| ${p.flag ? '⭐' : ''} | ${p.key} | ${p.rowCount} | ${p.slugCount} | ${vs} | ${p.pdFees || '—'} | ${dispStr} | ${cls} |`)
}
md.push('')

writeFileSync(OUT_PATH, md.join('\n'), 'utf8')
console.log(`Total distinct pairs: ${pairRows.length}`)
console.log(`Flagged (cross-blog agreement, data.ts disagrees): ${flagged.length}`)
console.log(`Wrote ${OUT_PATH}`)
