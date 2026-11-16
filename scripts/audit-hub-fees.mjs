// scripts/audit-hub-fees.mjs
//
// Audit only: on every indexed programme hub (/universities/{id}/{programme}),
// compare each fee the hub's page-content JSON types about its own university
// with the fee the hub's top section shows. Changes nothing.
//
// Top section: UniProgramBody prints formatExactFee(getExactFee(u, program)),
// or FEE_COUNSELLOR_LINE when getExactFee is 'none'. The intervals it shows:
//   exact     [min, max]
//   labelled  the list price, the net range, and each mode amount
// Scope: hubs in lib/data/valid-urls.json (the sitemap) whose robots resolve to
// index (shouldIndexProgrammeHub), with a page-content JSON at
// lib/data/page-content/{id}-{program lowercased}.json (getPageContent's key).
//
// Classes, per figure the sentence attributes to the hub's own university:
//   AGREES       inside a top interval within 2% (per-semester figures also
//                when x2, x3, x4 or x6 lands inside)
//   CONTRADICTS  the top shows a fee and this total or per-semester figure
//                is outside it
//   TOP_HIDDEN   the top shows "Contact our counsellor" and the text still
//                types a fee for this university (any kind, EMI included)
//   PART         a component (EMI, exam, registration, discount, gap) or a
//                schedule slice while the top shows a fee: not comparable
// Figures attributed to another university are counted, not listed.
//
// Rendered: the hub prints only tldr, ugcDeb.body, abcId.body, redFlags.flags
// (unless hidden, or a first-hand MBA hub replaces them) and faqs items that
// carry question and answer keys. Other sections (about, fees, comparisons...)
// sit in the JSON but never reach the page; they are listed with rendered=no.
//
// Extraction, kind and attribution reuse audit-spec-fees.mjs's rules through
// scripts/lib/hub-fee-rules.mjs so a figure counts the same way on both audits.
//
// Clicks: the GSC "Last 3 months" Pages export, 11 Aug to 10 Nov 2026, the same
// one behind audits/spec-page-inventory-2026-11-14.csv. It lives in the
// gitignored audit-data/ folder; pass another path as the third argument. The
// export caps at 999 rows, so a hub missing from it is counted as 0 clicks.
//
// Run: npx tsx scripts/audit-hub-fees.mjs <out.csv> <summary.md> [Pages.csv]

import fs from 'node:fs'
import { UNIVERSITIES } from '../lib/data.ts'
import { getExactFee, formatExactFee, FEE_COUNSELLOR_LINE } from '../lib/fees.ts'
import { shouldIndexProgrammeHub } from '../lib/seo/should-index.ts'
import { resolveFirstHand } from '../lib/first-hand.ts'
import { extract, kindOf, attribute, sentences, clauseFor, SALARY, TOL } from './lib/hub-fee-rules.mjs'

const [OUT_CSV, OUT_MD, PAGES = 'audit-data/gsc-3m-2026-11-10/Pages.csv'] = process.argv.slice(2)
const DIR = 'lib/data/page-content/'
const UNI = new Map(UNIVERSITIES.map(u => [u.id, u]))
const SLUG = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', ma: 'MA', mcom: 'M.Com', bcom: 'B.Com', ba: 'BA', msc: 'MSc', bsc: 'BSc' }

// ---------- clicks ----------
function clickMap(file, col) {
  const m = new Map()
  if (!fs.existsSync(file)) return m
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(1)) {
    const c = l.split(',')
    if (c[0]) m.set(c[0].replace('https://edifyedu.in', ''), Number(c[col] || 0))
  }
  return m
}
const CLICKS = clickMap(PAGES, 1)
if (!CLICKS.size) throw new Error(`no GSC Pages export at ${PAGES}`)

// ---------- hubs ----------
const urls = JSON.parse(fs.readFileSync('lib/data/valid-urls.json', 'utf8')).filter(x => /^\/universities\/[^/]+\/[^/]+$/.test(x))
const hubs = []
const skipped = { noProgramme: 0, noindex: 0, noJson: 0 }
for (const url of urls) {
  const [, , id, slug] = url.split('/')
  const u = UNI.get(id)
  const program = SLUG[slug]
  if (!u || !program || !u.programs.includes(program)) { skipped.noProgramme++; continue }
  if (!shouldIndexProgrammeHub(u, program).shouldIndex) { skipped.noindex++; continue }
  const file = `${id}-${program.toLowerCase()}.json`
  if (!fs.existsSync(DIR + file)) { skipped.noJson++; continue }
  hubs.push({ url, u, program, file, j: JSON.parse(fs.readFileSync(DIR + file, 'utf8')) })
}

// ---------- top section ----------
function topOf(u, program) {
  const e = getExactFee(u, program)
  const shown = formatExactFee(e)
  if (!shown) return { shown: FEE_COUNSELLOR_LINE, hidden: true, ivs: [] }
  const ivs = []
  if (e.kind === 'exact') ivs.push({ min: e.min, max: e.max })
  else {
    const b = e.breakdown
    if (b.list) ivs.push({ min: b.list, max: b.list })
    if (b.net) ivs.push({ min: b.net.min, max: b.net.max })
    for (const m of b.modes || []) ivs.push({ min: m.amount, max: m.amount })
  }
  return { shown, hidden: false, ivs }
}
const inIv = (v, iv) => v >= iv.min * (1 - TOL) && v <= iv.max * (1 + TOL)
const matches = (lo, hi, ivs) => ivs.some(iv => inIv(lo, iv) && inIv(hi, iv))

// ---------- rendered sections ----------
function renderedPaths(j, fh) {
  const s = j.sections || {}
  const out = new Set(['tldr', 'ugcDeb.body', 'abcId.body'])
  if (!fh && !s.redFlags?.hidden) (s.redFlags?.flags || []).forEach((_, i) => { out.add(`redFlags.flags[${i}].flag`); out.add(`redFlags.flags[${i}].detail`); out.add(`redFlags.flags[${i}].title`) })
  ;(s.faqs || []).forEach((f, i) => { if (f && f.question && f.answer) { out.add(`faqs[${i}].question`); out.add(`faqs[${i}].answer`) } })
  return out
}
function strings(v, path, out) {
  if (typeof v === 'string') out.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out)
  return out
}
const sectionOf = (path) => path.split(/[.[]/)[0]

// ---------- run ----------
const rows = []
const counts = { AGREES: 0, CONTRADICTS: 0, TOP_HIDDEN: 0, PART: 0, other: 0, salary: 0 }
const perHub = []
for (const h of hubs) {
  const top = topOf(h.u, h.program)
  const fh = h.program === 'MBA' ? resolveFirstHand(h.u) : undefined
  const rendered = renderedPaths(h.j, fh)
  const hub = { url: h.url, top: top.shown, hidden: top.hidden, contradicts: 0, hiddenTyped: 0, renderedBad: 0, clicks: CLICKS.get(h.url) ?? 0 }
  for (const [path, s] of strings(h.j.sections, '', [])) {
    const spans = sentences(s)
    const figs = extract(s)
    figs.forEach((fig, i) => {
      const c = clauseFor(s, figs, i, spans)
      if (SALARY.test(c.clause) || SALARY.test(c.sent) && fig.lo >= 300_000 && !/\bfee|tuition|cost/i.test(c.clause)) { counts.salary++; return }
      let kind = kindOf(c.pre, c.post, c.sent, fig, c.isFirstInSent, c.lineLabel)
      // Hub overrides, from hand-checking the first run's 39 CONTRADICTS rows:
      // "four semester instalments of approximately Rs 32,500 each", "Semester: Rs 30,000"
      // and "Standard semester fee (with grant applied): Rs 40,400" are per-semester amounts;
      // "a Rs 55,000 concession" is a discount.
      if (kind === 'total' && (/instal?l?ments?\s+of\s+(?:approximately\s+|about\s+|around\s+|roughly\s+)?$/i.test(c.pre) || /^\s*each\b/i.test(c.post) || /\bSemester:\s*$/i.test(c.pre) || /semester/i.test(c.lineLabel))) kind = 'per-semester'
      if (/concession/i.test(c.pre.slice(-40) + ' ' + c.post.slice(0, 40))) kind = 'component'
      const att = attribute(c.sent, fig.at - c.sp[0], h.u.id, c.lineBefore)
      // A pipe-table row ("Total Fees | Rs 45,000 | Rs 1,96,000 | Rs 1,84,000") compares
      // universities column by column; only the first value column is the hub's own.
      const cells = c.sent.split('|')
      if (cells.length >= 3 && figs.findIndex(f => f.at >= c.sp[0]) !== i) { counts.other++; return }
      // A comparison line labelled with another university ("SRM IST Online: ... Rs 1.89L")
      // that the alias index does not resolve.
      const ownWord = h.u.name.split(/\s+/)[0].toLowerCase()
      if (/\bOnline\b/.test(c.lineLabel) && !c.lineLabel.toLowerCase().includes(ownWord) && !(h.u.abbr && c.lineLabel.includes(h.u.abbr))) { counts.other++; return }
      if (att.uid !== h.u.id) { counts.other++; return }
      let klass
      if (top.hidden) klass = 'TOP_HIDDEN'
      else if (matches(fig.lo, fig.hi, top.ivs)) klass = 'AGREES'
      else if ((kind === 'per-semester' || kind === 'line-item') && [2, 3, 4, 6].some(n => matches(fig.lo * n, fig.hi * n, top.ivs))) klass = 'AGREES'
      else if (kind === 'total' || kind === 'per-semester') klass = 'CONTRADICTS'
      else klass = 'PART'
      counts[klass]++
      const isRendered = rendered.has(path)
      if (klass === 'CONTRADICTS') { hub.contradicts++; if (isRendered) hub.renderedBad++ }
      if (klass === 'TOP_HIDDEN') { hub.hiddenTyped++; if (isRendered) hub.renderedBad++ }
      if (klass === 'CONTRADICTS' || klass === 'TOP_HIDDEN') rows.push({
        url: h.url, file: h.file, university_id: h.u.id, programme: h.program,
        top_shows: top.shown, top_hides_fee: top.hidden ? 'yes' : 'no',
        section: sectionOf(path), json_path: path, rendered_on_hub: isRendered ? 'yes' : 'no',
        raw: fig.raw, value_min: fig.lo, value_max: fig.hi, kind, attribution: att.rule, class: klass,
        gsc_clicks_3m: hub.clicks,
        sentence: c.sent.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().slice(0, 300),
      })
    })
  }
  perHub.push(hub)
}

// ---------- CSV ----------
const cols = ['url', 'file', 'university_id', 'programme', 'top_shows', 'top_hides_fee', 'section', 'json_path', 'rendered_on_hub', 'raw', 'value_min', 'value_max', 'kind', 'attribution', 'class', 'gsc_clicks_3m', 'sentence']
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
rows.sort((a, b) => b.gsc_clicks_3m - a.gsc_clicks_3m || a.url.localeCompare(b.url))
fs.writeFileSync(OUT_CSV, [cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\n') + '\n')

// ---------- summary ----------
const by = (arr, f) => arr.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {})
const contra = rows.filter(r => r.class === 'CONTRADICTS')
const hidden = rows.filter(r => r.class === 'TOP_HIDDEN')
const hubsContra = perHub.filter(h => h.contradicts)
const hubsHidden = perHub.filter(h => h.hidden)
const hubsHiddenTyped = perHub.filter(h => h.hiddenTyped)
const tbl = (head, rs) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rs.map(r => `| ${r.join(' | ')} |`)].join('\n')
const secTable = (rs) => { const s = by(rs, r => r.section), rr = by(rs.filter(r => r.rendered_on_hub === 'yes'), r => r.section); return tbl(['Section', 'Figures', 'Rendered on hub'], Object.entries(s).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v, rr[k] || 0])) }
const hubTable = (hs, f) => tbl(['Hub', 'Top shows', 'Figures', 'Rendered', 'Clicks 3m'], hs.sort((a, b) => b.clicks - a.clicks || f(b) - f(a)).map(h => [h.url, h.top.replace(/\|/g, '/'), f(h), h.renderedBad, h.clicks]))
const md = `# Hub fee contradictions, 14 Nov 2026 (audit only)

Script: \`npx tsx scripts/audit-hub-fees.mjs audits/hub-fee-contradictions-2026-11-14.csv audits/hub-fee-contradictions-summary-2026-11-14.md\`. Nothing on the site changed.

Each hub's own-university fee figures in its page-content JSON, compared with what the top section prints (\`formatExactFee(getExactFee(u, program))\`, or "${FEE_COUNSELLOR_LINE}" when that is null). Method and class definitions are in the script header.

## Scope

- Hubs in the sitemap: ${urls.length}. Indexed with a page-content JSON: **${hubs.length}**. Left out: ${skipped.noindex} noindexed, ${skipped.noJson} without a JSON, ${skipped.noProgramme} unresolvable.
- Hubs whose top shows the counsellor line: ${hubsHidden.length}. Hubs whose top shows a fee: ${hubs.length - hubsHidden.length}.

## Counts

| Class | Figures |
|---|---:|
| AGREES | ${counts.AGREES} |
| CONTRADICTS | ${counts.CONTRADICTS} |
| TOP_HIDDEN | ${counts.TOP_HIDDEN} |
| PART (component or slice, top shows a fee) | ${counts.PART} |
| Attributed to another university (not compared) | ${counts.other} |
| Salary figures (excluded) | ${counts.salary} |

- **${contra.length} contradicting figures on ${hubsContra.length} hubs**; ${contra.filter(r => r.rendered_on_hub === 'yes').length} of them sit in sections the hub renders (on ${new Set(contra.filter(r => r.rendered_on_hub === 'yes').map(r => r.url)).size} hubs).
- **${hubsHiddenTyped.length} hubs hide the fee at the top but type one in the text** (${hidden.length} figures; ${hidden.filter(r => r.rendered_on_hub === 'yes').length} rendered, on ${new Set(hidden.filter(r => r.rendered_on_hub === 'yes').map(r => r.url)).size} hubs).
- Hubs with any contradiction or hidden-fee figure that earned clicks (11 Aug to 10 Nov): ${perHub.filter(h => (h.contradicts || h.hiddenTyped) && h.clicks > 0).length} (${perHub.filter(h => (h.contradicts || h.hiddenTyped)).reduce((a, h) => a + h.clicks, 0)} clicks).

## CONTRADICTS by section

${secTable(contra)}

## TOP_HIDDEN by section

${secTable(hidden)}

## Hubs with contradictions

${hubTable(hubsContra, h => h.contradicts)}

## Hubs that hide the fee but type one

${hubTable(hubsHiddenTyped, h => h.hiddenTyped)}

## Notes

- Rendered sections only: tldr, ugcDeb, abcId, redFlags.flags and FAQ items with question/answer keys. JSON files written with \`q\`/\`a\` FAQ keys or \`redFlags.items\` never show those parts on the hub: ${hubs.filter(h => (h.j.sections?.faqs || []).some(f => f && !f.question && f.q)).length} of the ${hubs.length} hub JSONs use \`q\`/\`a\` FAQ keys and ${hubs.filter(h => h.j.sections?.redFlags?.items && !h.j.sections?.redFlags?.flags).length} use \`redFlags.items\`.
- Clicks: GSC Pages export, last 3 months (11 Aug to 10 Nov 2026), capped at 999 rows; a hub not in it counts as 0.
- Kind and attribution are heuristic: the 14 Nov spec audit's rules plus four hub overrides (script comments). The first run gave 39 CONTRADICTS; all 39 were read by hand, the 17 false ones (instalment amounts, pipe-table competitor columns, a concession, an unresolved competitor label) led to the overrides, and the 22 left were all read as genuine.
`
fs.writeFileSync(OUT_MD, md)
console.log(`hubs ${hubs.length}; AGREES ${counts.AGREES} CONTRADICTS ${counts.CONTRADICTS} on ${hubsContra.length} hubs; TOP_HIDDEN ${counts.TOP_HIDDEN} on ${hubsHiddenTyped.length} hubs (${hubsHidden.length} hide); PART ${counts.PART}; other ${counts.other}`)
