// scripts/check-hub-fee-text.mts
//
// A programme hub (/universities/{id}/{programme}) shows one fee at the top:
// formatExactFee(getExactFee(u, program)), or "Contact our counsellor" when
// getExactFee is 'none'. Its page-content JSON then typed other fees in the
// TL;DR and FAQs: 25 visible figures on 2026-11-14 (audits/hub-fee-contradictions-
// 2026-11-14.csv), placeholder ranges beside an exact top fee, and fees typed
// on hubs whose top hides the fee because it is not verified. A wider sweep in
// batch 3.4 found 40 more: "EMI starts from Rs 2,500 per month" on 9 hubs whose
// emiFrom is not 2,500, invented "instalments of approximately Rs X each",
// "under Rs 1.5 lakh" beside a Rs 2,00,000 list price.
//
// Rule: every rupee figure in a field the hub renders from the JSON (tldr,
// faqs items with question/answer keys, redFlags.flags unless hidden, ugcDeb.body
// and abcId.body) must equal one of that hub's getExactFee
// values: exact min/max, or the labelled list, net min/max, mode amounts and
// published per-semester figures. A range passes only when both ends do. A hub
// whose top shows the counsellor line may type no figure of its own. A figure
// in a sentence that names another university passes when it equals that
// university's own getExactFee values for the same programme (comparison FAQs).
// Salary sentences (SALARY below) are not fees and are skipped.
// Exceptions: data/hub-fee-text-allowlist.json, {file, contains, reason}.
//
// Run: npx tsx scripts/check-hub-fee-text.mts            (blocks on any hit)
//      npx tsx scripts/check-hub-fee-text.mts --list     (prints every hit)
//      npx tsx scripts/check-hub-fee-text.mts --self-test
// The self-test replays every visible figure in the 2026-11-14 audit CSV
// against the hub's current getExactFee and fails unless each one is caught.
import fs from 'node:fs'
import { UNIVERSITIES } from '../lib/data.ts'
import { getExactFee, type ExactFee } from '../lib/fees.ts'
import { extract, sentences } from './lib/hub-fee-rules.mjs'
import { findAllUnis } from './lib/blog-fee-scan.mjs'

// Narrower than the audit's SALARY rule, which also skips "starts from Rs" and
// so let "EMI starts from Rs 2,500 per month" through on 9 hubs.
const SALARY = /\bLPA\b|\bCTC\b|\bcrore\b|\bsalar(?:y|ies)\b|\bpackages?\b|\bstipend\b|per\s*annum|\bearn(?:s|ing|ings)?\b/i

const DIR = 'lib/data/page-content/'
const SLUG: Record<string, string> = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', ma: 'MA', mcom: 'M.Com', bcom: 'B.Com', ba: 'BA', msc: 'MSc', bsc: 'BSc' }
const UNI = new Map(UNIVERSITIES.map(u => [u.id, u]))
const ALLOW: { file: string; contains: string; reason: string }[] = JSON.parse(fs.readFileSync('data/hub-fee-text-allowlist.json', 'utf8'))

export function allowedValues(e: ExactFee): number[] {
  if (e.kind === 'none') return []
  if (e.kind === 'exact') return [e.min, e.max]
  const b = e.breakdown as any
  const v: number[] = [b.list]
  if (b.net) v.push(b.net.min, b.net.max)
  for (const m of b.modes ?? []) v.push(m.amount)
  if (b.perSemester) { v.push(b.perSemester.list); if (b.perSemester.net) v.push(b.perSemester.net) }
  return v.filter(x => typeof x === 'number')
}

function otherUnisAllowed(s: string, ownId: string | null, program: string | null): number[] {
  if (!ownId || !program) return []
  const out: number[] = []
  for (const h of findAllUnis(s) as { uid: string }[]) {
    const o = UNI.get(h.uid)
    if (!o || o.id === ownId || !o.programs.includes(program as any)) continue
    out.push(...allowedValues(getExactFee(o, program as any)))
  }
  return out
}

type Hit = { file: string; field: string; raw: string; sentence: string; allowed: number[] }
export function scanText(file: string, field: string, text: string, allowed: number[], ownId: string | null = null, program: string | null = null, useAllowlist = true): Hit[] {
  const hits: Hit[] = []
  for (const [a, b] of sentences(text) as [number, number][]) {
    const s = text.slice(a, b)
    if (SALARY.test(s)) continue
    const figs = extract(s)
    if (!figs.length) continue
    const others = otherUnisAllowed(s, ownId, program)
    for (const f of figs) {
      if (allowed.includes(f.lo) && allowed.includes(f.hi)) continue
      if (others.includes(f.lo) && others.includes(f.hi)) continue
      if (useAllowlist && ALLOW.some(x => x.file === file && s.includes(x.contains))) continue
      hits.push({ file, field, raw: f.raw, sentence: s.trim(), allowed })
    }
  }
  return hits
}

export function hubFiles() {
  const out: { file: string; u: (typeof UNIVERSITIES)[number]; program: string }[] = []
  for (const u of UNIVERSITIES) for (const [slug, program] of Object.entries(SLUG)) {
    const file = `${u.id}-${slug}.json`
    if (u.programs.includes(program as any) && fs.existsSync(DIR + file)) out.push({ file, u, program })
  }
  return out
}

export function scanHub(file: string, j: any, allowed: number[], ownId: string, program: string): Hit[] {
  const s = j.sections ?? {}
  const hits: Hit[] = []
  if (typeof s.tldr === 'string') hits.push(...scanText(file, 'tldr', s.tldr, allowed, ownId, program))
  // Also rendered: the generated red flags (unless hidden) and the UGC-DEB and
  // ABC ID bodies. The batch 3.4 live check found fee ranges in red flags after
  // the TL;DR and FAQs had been fixed.
  if (!s.redFlags?.hidden) (s.redFlags?.flags ?? []).forEach((f: any, i: number) => {
    for (const k of ['sentence1', 'sentence2']) if (typeof f?.[k] === 'string') hits.push(...scanText(file, `redFlags.flags[${i}].${k}`, f[k], allowed, ownId, program))
  })
  for (const k of ['ugcDeb', 'abcId']) if (typeof s[k]?.body === 'string') hits.push(...scanText(file, `${k}.body`, s[k].body, allowed, ownId, program))
  ;(s.faqs ?? []).forEach((f: any, i: number) => {
    if (typeof f?.question !== 'string' || typeof f?.answer !== 'string') return
    hits.push(...scanText(file, `faqs[${i}].question`, f.question, allowed, ownId, program))
    hits.push(...scanText(file, `faqs[${i}].answer`, f.answer, allowed, ownId, program))
  })
  return hits
}

function run(): Hit[] {
  const hits: Hit[] = []
  for (const { file, u, program } of hubFiles()) {
    const j = JSON.parse(fs.readFileSync(DIR + file, 'utf8'))
    hits.push(...scanHub(file, j, allowedValues(getExactFee(u, program as any)), u.id, program))
  }
  return hits
}

function csvRows(file: string): Record<string, string>[] {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/)
  const parse = (l: string) => {
    const o: string[] = []; let c = '', q = false
    for (let i = 0; i < l.length; i++) {
      const ch = l[i]
      if (q) { if (ch === '"') { if (l[i + 1] === '"') { c += '"'; i++ } else q = false } else c += ch }
      else if (ch === '"') q = true
      else if (ch === ',') { o.push(c); c = '' }
      else c += ch
    }
    o.push(c); return o
  }
  const h = parse(lines[0])
  return lines.slice(1).map(l => { const r = parse(l); return Object.fromEntries(h.map((k, i) => [k, r[i]])) })
}

const arg = process.argv[2]
if (arg === '--self-test') {
  let fail = 0
  // 1. Shapes that shipped. Each must be caught.
  const bad: [string, number[]][] = [
    ['Fee approximately Rs 14,000 to Rs 62,200 (indicative).', [62200]],
    ['Rs 50,000 fixed fee (indicative).', []],
    ['Without the grant, fees are approximately Rs.1,82,800.', [200000, 146240, 161600]],
    ['Total fee is Rs.88.5K to Rs.1.18L for the full 2-year programme.', []],
    ['Alliance University: Rs 37K-1.5L fee.', []],
    ['approx Rs.45,000-60,000 total, NAAC A++.', [66000]],
    ['Fee approximately Rs 1,10,000 total, or Rs 27,500 a semester.', []],
    ['The fee is 1.5 lakh in total.', []],
    ['EMI starts from Rs 2,500 per month.', [130000]],
  ]
  const good: [string, number[]][] = [
    ['The total fee is Rs 3,12,400.', [312400]],
    ['Rs 1,78,000 total (Rs 1,68,000 if paid in full upfront).', [178000, 168000]],
    ['MBA graduates earn Rs 6 to 9 LPA.', []],
    ['Talk to our counsellor for the current fee.', []],
    ['Reported average salary range is Rs.6L to Rs.10L per annum.', []],
  ]
  for (const [t, a] of bad) if (!scanText('self-test', 'x', t, a).length) { console.log('MISSED:', t); fail++ }
  for (const [t, a] of good) if (scanText('self-test', 'x', t, a).length) { console.log('FALSE HIT:', t); fail++ }
  // 2. Comparison rule: another university's own fee passes, a wrong one does not.
  const own = 'dayananda-sagar-university-online'
  if (scanText('self-test', 'x', 'Galgotias University Online: NAAC A+, Rs 80,200, 7 specialisations.', [130000], own, 'MBA').length) { console.log('FALSE HIT: Galgotias own fee in a comparison'); fail++ }
  if (!scanText('self-test', 'x', 'Amity University Online: NAAC A+, Rs 1.15L-2.25L, 12 specialisations.', [130000], own, 'MBA').length) { console.log('MISSED: wrong Amity fee in a comparison'); fail++ }
  // 3. Every visible figure in the 2026-11-14 audit, replayed against today's top fee,
  //    allowlist off (Shoolini's sentence is allowlisted, not exempt from detection).
  const rows = csvRows('audits/hub-fee-contradictions-2026-11-14.csv')
    .filter(r => r.rendered_on_hub === 'yes' && (r.class === 'CONTRADICTS' || r.class === 'TOP_HIDDEN'))
  let caught = 0
  for (const r of rows) {
    const u = UNI.get(r.university_id)!
    const program = SLUG[r.programme.toLowerCase().replace(/\./g, '')] ?? r.programme
    const hits = scanText(r.file, r.json_path, r.sentence, allowedValues(getExactFee(u, program as any)), u.id, program, false)
    if (hits.some(h => h.raw.replace(/\s+/g, ' ') === r.raw.replace(/\s+/g, ' '))) caught++
    else { console.log(`MISSED audit row: ${r.file} ${r.json_path} ${r.raw}`); fail++ }
  }
  console.log(`check-hub-fee-text self-test: ${bad.length + good.length + 2 - (fail - (rows.length - caught))}/${bad.length + good.length + 2} cases, ${caught}/${rows.length} audit figures caught`)
  if (rows.length !== 25) { console.log(`expected 25 visible audit figures, CSV has ${rows.length}`); fail++ }
  process.exit(fail ? 1 : 0)
}
const hits = run()
if (arg === '--json') { console.log(JSON.stringify(hits)); process.exit(0) }
if (arg === '--list' || hits.length) {
  for (const h of hits) console.log(`${h.file} ${h.field}: ${h.raw}  [allowed: ${h.allowed.join(', ') || 'none, counsellor line'}]\n    ${h.sentence.slice(0, 200)}`)
}
console.log(`check-hub-fee-text: ${hits.length} figure(s) in rendered hub fields that differ from the top fee`)
if (hits.length && arg !== '--list') {
  console.log('Fix: type the hub\'s own getExactFee figure, or "talk to our counsellor for the current fee" where the top hides it. Exception: data/hub-fee-text-allowlist.json.')
  process.exit(1)
}
