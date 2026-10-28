// scripts/report-fee-display.mts
// Before/after for every fee string the fee-display-unify branch changed, one
// row per (university, programme). "Before" recomputes each surface's old
// logic from functions that are still unchanged (getDisplayFee, compactFee,
// formatFeeSlim); "after" is getExactFee. Writes a CSV and prints a summary.
//
// Run: npx tsx scripts/report-fee-display.mts audits/fee-display-unify-2026-10-28.csv
import fs from 'fs'
import { UNIVERSITIES, type Program, type University } from '../lib/data'
import { getDisplayFee, getExactFee, formatExactFee, formatExactFeeShort, formatPublishedSemesterFee } from '../lib/fees'
import { compactFee } from '../lib/seo-title'
import { UNIS_SLIM, formatFeeSlim } from '../lib/data-slim'
import { formatINR } from '../lib/format'

const out = process.argv[2] || 'fee-display.csv'
const CTA = 'Contact our counsellor for current fee details'

// Verified per Rishi (2026-10-28): LPU MBA and CU MBA (Aug), Symbiosis BBA,
// Galgotias BBA, Amity BBA, and every MUJ and Uttaranchal programme (late Oct).
const VERIFIED = (id: string, p: string) =>
  (id === 'lovely-professional-university-online' && p === 'MBA') ||
  (id === 'chandigarh-university-online' && p === 'MBA') ||
  (id === 'symbiosis-university-online' && p === 'BBA') ||
  (id === 'galgotias-university-online' && p === 'BBA') ||
  (id === 'amity-university-online' && p === 'BBA') ||
  id === 'manipal-university-jaipur-online' || id === 'uttaranchal-university-online'

const src = fs.readFileSync('lib/data.ts', 'utf8').split('\n')
const blockOf = (id: string) => {
  const s = src.findIndex(l => l.includes(`id: '${id}'`))
  let e = src.findIndex((l, i) => i > s && /^\s{4}id: '/.test(l)); if (e < 0) e = src.length
  return [s, e] as const
}
const lineIn = (id: string, re: RegExp, after?: RegExp) => {
  const [s, e] = blockOf(id); let from = s
  if (after) { const a = src.findIndex((l, i) => i >= s && i < e && after.test(l)); if (a < 0) return null; from = a }
  const i = src.findIndex((l, k) => k >= from && k < e && re.test(l)); return i < 0 ? null : i + 1
}
const source = (u: University, p: Program) => {
  const e = getExactFee(u, p)
  const key = p.toLowerCase().replace(/\./g, '')
  if (e.kind === 'labelled') return `feeBreakdown.${key} L${lineIn(u.id, /feeBreakdown:/)}`
  if (e.kind === 'none') { const d = getDisplayFee(u, p); return d.ok ? 'none: no exact field agrees with getDisplayFee, or drift pair' : `none: getDisplayFee rule ${d.rule}` }
  const pf = (u.programFees as Record<string, unknown> | undefined)?.[key]
  if (pf) return `programFees.${key} L${lineIn(u.id, /programFees:/)}`
  const pd = u.programDetails[p]?.fees
  if (pd && !/\d\s*[KL]/i.test(pd)) return `programDetails.${p}.fees L${lineIn(u.id, /^\s*fees:/, new RegExp(`^\\s*['"]?${p.replace('.', '\\.')}['"]?: \\{`))}`
  return `feeMin/feeMax L${lineIn(u.id, /^\s*feeMin:/)}`
}
const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
const slim = new Map(UNIS_SLIM.map(s => [s.id, s]))

const header = ['university', 'programme', 'status', 'source', 'before_title_token', 'after_title_token', 'before_hero', 'after_hero', 'before_feebox_total', 'after_feebox_total', 'before_feebox_per_sem', 'after_feebox_per_sem', 'before_spec_title_token', 'after_spec_title_token', 'before_card', 'after_card', 'before_schema', 'after_schema']
const rows: string[] = [header.join(',')]
let changed = 0, verifiedChanged = 0
const counts: Record<string, number> = {}
for (const u of UNIVERSITIES) {
  for (const p of u.programs as Program[]) {
    const d = getDisplayFee(u, p)
    const e = getExactFee(u, p)
    const pd = u.programDetails[p]
    const sem = ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(p) ? 4 : 6
    const b = {
      title: d.ok ? d.compact ?? '' : '(no fee)',
      hero: d.ok ? (d.compact || pd?.fees || formatINR(u.feeMin)) : 'On request',
      box: d.ok ? (d.range || d.compact || '') : '(counsellor block)',
      perSem: d.ok ? `${d.mode === 'from' ? 'from ' : ''}${formatINR(Math.round((d.min ?? u.feeMin) / sem))}` : '',
      spec: compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`),
      card: p === 'MBA' && slim.get(u.id) ? `${formatFeeSlim(slim.get(u.id)!.feeMin)} – ${formatFeeSlim(slim.get(u.id)!.feeMax)}` : (d.ok ? d.compact ?? '' : 'Ask counsellor'),
      schema: d.ok && d.min != null ? (d.min === (d.max ?? d.min) ? String(d.min) : `${d.min}-${d.max}`) : '',
    }
    const bounds = e.kind === 'labelled'
      ? (() => { const x = e.breakdown; const ps = x.modes?.length ? x.modes.map(m => m.amount) : [x.list, ...(x.net ? [x.net.min, x.net.max] : [])]; return [Math.min(...ps), Math.max(...ps)] })()
      : e.kind === 'exact' ? [e.min, e.max] : null
    const a = {
      title: formatExactFeeShort(e) ?? '(no fee)',
      hero: formatExactFeeShort(e) ?? CTA,
      box: formatExactFee(e) ?? '(counsellor block)',
      perSem: formatPublishedSemesterFee(e) ?? '',
      spec: formatExactFeeShort(e) ?? 'UGC-DEB Approved',
      card: formatExactFee(e) ?? CTA,
      schema: bounds ? (bounds[0] === bounds[1] ? String(bounds[0]) : `${bounds[0]}-${bounds[1]}`) : '',
    }
    const diff = (Object.keys(a) as (keyof typeof a)[]).filter(k => a[k] !== b[k])
    if (!diff.length) continue
    changed++
    const status = VERIFIED(u.id, p) ? 'VERIFIED' : 'UNVERIFIED'
    if (status === 'VERIFIED') verifiedChanged++
    for (const k of diff) counts[k] = (counts[k] || 0) + 1
    rows.push([u.id, p, status, source(u, p), b.title, a.title, b.hero, a.hero, b.box, a.box, b.perSem, a.perSem, b.spec, a.spec, b.card, a.card, b.schema, a.schema].map(csv).join(','))
  }
}
fs.writeFileSync(out, rows.join('\n') + '\n')
console.log(JSON.stringify({ changedRows: changed, verifiedRows: verifiedChanged, changedBySurface: counts }))
