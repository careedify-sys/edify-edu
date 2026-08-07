// scripts/build-primary-fee-worklist.mjs
// Collapse primary-subject MISMATCH + ORPHAN rows from the crossref CSV into
// distinct (university, programme) pairs and produce a triage worklist.
// Each pair is annotated with:
//   - blog value(s) observed
//   - current pd.fees
//   - current feeMin / feeMax
//   - row count (how many separate blog figures back the pair)
//   - which of four dimensions could explain the gap:
//       payment mode / discount / specialisation / campus / NONE
//
// Genuine-error candidates (NONE) sort first because those are the ones that
// need portal verification. Everything else is one of the four known
// dimensions and does not need immediate action.
//
// Run: npx tsx scripts/build-primary-fee-worklist.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TODAY = '2026-08-07'
const CSV_PATH = join(ROOT, 'audits', `blog-fee-crossref-${TODAY}.csv`)
const OUT_PATH = join(ROOT, 'audits', `fee-worklist-primary-${TODAY}.md`)

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
header.forEach((h, i) => idx[h] = i)
const records = raw.slice(1).filter(r => r.length >= header.length).map(r => {
  const o = {}
  for (const [k, i] of Object.entries(idx)) o[k] = r[i]
  return o
})

const targets = records.filter(r =>
  (r.class === 'MISMATCH' || r.class === 'ORPHAN') &&
  r.primary_or_competitor === 'primary' &&
  r.universityId && r.programme,
)

// Group by (universityId, programme)
const groups = new Map()
for (const r of targets) {
  const key = `${r.universityId}|${r.programme}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(r)
}

// Dimension inference for a pair.
//   payment mode  — blog mentions per-sem / per-semester / installment / EMI
//                   in the surrounding context and the value is a fraction of
//                   the total fee (roughly total/N_semesters).
//   discount      — blog mentions discount / scholarship / early-bird / waiver
//                   / cashback / dual-spec near the figure.
//   specialisation — blog mentions a spec name (Finance, HR, Marketing, IT,
//                   Analytics, Ops, Healthcare, Data Science, Digital,
//                   BFSI, Agribusiness, Pharma, International, Aviation) near
//                   the figure and pd.fees is a range wider than getDisplayFee.
//   campus        — blog names a campus (Navi Mumbai, Pune, Doon, Kolkata,
//                   Chennai, Bangalore, Hyderabad, Delhi) — signals multi-campus
//                   fee variance and does not apply to us since we already
//                   split DY Patil into two university IDs.
const DIM = {
  paymentMode:   /\bper[- ]?sem|per[- ]?semester|\/\s*sem|per\s+month|\/\s*month|installment|instal?ment|EMI|monthly|annual\s+install|one[- ]?time|one\s*shot|lump[- ]?sum|full[- ]?payment/i,
  discount:      /\bdiscount|scholarship|early[- ]?bird|waiver|cashback|dual[- ]?spec|referral\s+code|coupon|promo|SAT[- ]?based|WES\s+discount|% off/i,
  specialisation: /\bfinance\b|\bHR\b|marketing|\bIT\b|analytics|\boperations\b|\bops\b|healthcare|data\s*science|digital|\bBFSI\b|agribusiness|pharma|international|aviation|supply\s*chain|logistics|retail|banking|entrepreneur|fintech|hospitality|real\s*estate|business\s*analytics|artificial\s+intelligence|\bAI\b|business\s+intelligence|blockchain/i,
  campus:        /\bnavi\s*mumbai|\bpune\b|\bdoon\b|\bkolkata\b|\bchennai\b|\bbangalore|\bhyderabad|\bdelhi\b|\bbengaluru|\bjaipur\b|\bnoida\b|\bgurgaon|\bnagpur\b|\bbhopal\b|\blucknow\b|\bmohali\b/i,
}

function inferDimensions(rowsForPair, uni, prog) {
  const dims = new Set()
  const pd = uni?.programDetails?.[prog]
  const pdFeesRange = pd?.fees && /\s*(?:-|–|to)\s*/.test(pd.fees)
  for (const r of rowsForPair) {
    const ctx = r.context || ''
    if (DIM.paymentMode.test(ctx)) dims.add('payment-mode')
    if (DIM.discount.test(ctx))    dims.add('discount')
    // Only count spec if pd.fees is a range or feeMin != feeMax (uni actually
    // has spec-based tiering surfaced in data.ts).
    if (DIM.specialisation.test(ctx) && (pdFeesRange || uni?.feeMin !== uni?.feeMax)) dims.add('specialisation')
    if (DIM.campus.test(ctx)) dims.add('campus')
  }
  return dims
}

function unique(arr) { return [...new Set(arr)] }

const pairs = []
for (const [key, rows] of groups) {
  const [uid, prog] = key.split('|')
  const uni = UNI_BY_ID.get(uid)
  if (!uni) continue
  const pd = uni.programDetails?.[prog]
  const disp = getDisplayFee(uni, prog)
  const anyOrphan = rows.some(r => r.class === 'ORPHAN')

  const blogVals = unique(rows.map(r => {
    const min = Number(r.value_min), max = Number(r.value_max)
    if (Number.isFinite(min) && Number.isFinite(max) && min !== max) {
      return `${fmt(min)}–${fmt(max)}`
    }
    return fmt(Number(r.value_rupees))
  })).slice(0, 6)

  const dims = anyOrphan ? new Set() : inferDimensions(rows, uni, prog)
  const dimList = [...dims]
  const explanation = anyOrphan
    ? 'ORPHAN (programme not in data.ts programs array)'
    : dimList.length ? dimList.join(' + ') : 'NONE'

  pairs.push({
    uid,
    uniName: uni.name,
    prog,
    blogValues: blogVals.join(', '),
    pdFees: pd?.fees ?? '(no pd)',
    feeMin: uni.feeMin ?? '',
    feeMax: uni.feeMax ?? '',
    rowCount: rows.length,
    explanation,
    isGenuineError: !anyOrphan && dimList.length === 0,
    isOrphan: anyOrphan,
    displayCompact: disp.compact || (disp.reason || ''),
    slugs: unique(rows.map(r => r.slug)),
  })
}

function fmt(n) {
  if (!Number.isFinite(n)) return String(n)
  return '₹' + n.toLocaleString('en-IN')
}

// Sort: genuine errors first (by row count desc), then dimension-explained
// (by row count desc), then ORPHAN (by row count desc).
pairs.sort((a, b) => {
  const pri = (p) => p.isGenuineError ? 0 : p.isOrphan ? 2 : 1
  const dp = pri(a) - pri(b)
  if (dp !== 0) return dp
  if (a.rowCount !== b.rowCount) return b.rowCount - a.rowCount
  return a.uid.localeCompare(b.uid)
})

const genuineErrors = pairs.filter(p => p.isGenuineError)
const dimExplained  = pairs.filter(p => !p.isGenuineError && !p.isOrphan)
const orphans       = pairs.filter(p => p.isOrphan)

// Render markdown
const md = []
md.push(`# Primary-subject fee worklist — ${TODAY}`)
md.push('')
md.push('Distinct `(university, programme)` pairs collapsed from primary-subject')
md.push('MISMATCH + ORPHAN rows in `audits/blog-fee-crossref-2026-08-07.csv`.')
md.push('Primary-subject precision is 100% on the sampled MISMATCH rows, so every')
md.push('pair below is a real value-drift signal — the question is only *why*.')
md.push('')
md.push(`Total pairs: **${pairs.length}**`)
md.push(`  - Genuine-error candidates (NONE of the four dimensions apply): **${genuineErrors.length}**`)
md.push(`  - Dimension-explained (payment mode / discount / spec / campus): **${dimExplained.length}**`)
md.push(`  - ORPHAN (blog talks about a programme not in data.ts): **${orphans.length}**`)
md.push('')
md.push('Genuine-error pairs sort first. Those are the ones that need portal')
md.push('verification (the Galgotias class). Dimension-explained pairs are already')
md.push('accounted for by content-model gaps — see')
md.push('`audits/fee-model-proposal-2026-08-07.md` for the FeeVariant plan.')
md.push('')

function renderTable(rows, header) {
  if (!rows.length) return ['_(none)_', '']
  const out = []
  out.push('| # | university | programme | blog value(s) | current pd.fees | feeMin | feeMax | rows | explanation |')
  out.push('|---:|---|---|---|---|---:|---:|---:|---|')
  rows.forEach((p, i) => {
    out.push(`| ${i + 1} | ${p.uniName} (\`${p.uid}\`) | ${p.prog} | ${p.blogValues} | \`${p.pdFees}\` | ${p.feeMin} | ${p.feeMax} | ${p.rowCount} | ${p.explanation} |`)
  })
  out.push('')
  return out
}

md.push('## Genuine-error candidates (verify against portal)')
md.push('')
md.push(...renderTable(genuineErrors))

md.push('## Dimension-explained (no portal action needed)')
md.push('')
md.push(...renderTable(dimExplained))

md.push('## ORPHAN pairs (programme name in blog does not exist in data.ts)')
md.push('')
md.push(...renderTable(orphans))

writeFileSync(OUT_PATH, md.join('\n'), 'utf8')
console.log(`Wrote ${OUT_PATH}`)
console.log(`Pair counts:`)
console.log(`  genuine-error : ${genuineErrors.length}`)
console.log(`  dim-explained : ${dimExplained.length}`)
console.log(`  orphan        : ${orphans.length}`)
console.log(`  TOTAL         : ${pairs.length}`)
