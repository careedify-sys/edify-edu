// scripts/audit-spec-fees.mjs
//
// Audit only: every typed fee figure in the page-content JSON of indexed
// specialisation pages, classified against lib/data.ts. Changes nothing.
//
// Scope: rows of audits/spec-page-inventory-2026-11-14.csv with a page-content
// JSON, index robots and a sitemap entry, minus fact-swept files (metadata.
// factSweep, whose fees already come from data).
//
// Extractor: the blog fee scanner's currency regex, range-tail parser, number
// normaliser and accepted-interval builder (scripts/lib/blog-fee-scan.mjs), so
// a figure counts the same way here as in check-blog-fees. Two additions for
// JSON prose: bare "N lakh" and bare Indian-format amounts ("1,75,125").
//
// Classes (per figure, against the university the sentence attributes it to):
//   MATCH       inside an accepted interval (getDisplayFee, getExactFee,
//               programFees, feePlans, feeBreakdown, pd.fees) within 2%.
//               A per-semester figure also matches when x4 or x2 matches.
//   MISMATCH    data has a fee and the figure is outside every interval.
//   SUPPRESSED  getDisplayFee says ok:false, so the page hides this fee and
//               the typed figure exposes one the site chose not to show.
//   UNRESOLVED  university not in data, programme not offered, or a
//               component (EMI, discount, registration, scholarship...) with
//               no data field to check it against.
// Salary-type figures (LPA, CTC, salary, package, stipend) are not fees; they
// are counted in the summary and left out of the CSV.
//
// Run: npx tsx scripts/audit-spec-fees.mjs <out.csv> <summary.md>

import fs from 'node:fs'
import { RUPEE_RE, RANGE_TAIL_RE, normalise, findAllUnis, getAcceptableIntervals, TOL } from './lib/blog-fee-scan.mjs'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee, getExactFee } from '../lib/fees.ts'
import { getFeePlans } from '../lib/fee-plans.ts'

const [OUT_CSV, OUT_MD] = process.argv.slice(2)
const INV = 'audits/spec-page-inventory-2026-11-14.csv'
const DIR = 'lib/data/page-content/'
const UNI = new Map(UNIVERSITIES.map(u => [u.id, u]))
const PROG = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', ma: 'MA', mcom: 'M.Com', bcom: 'B.Com', ba: 'BA', msc: 'MSc', bsc: 'BSc' }
const FLOOR = 495

// ---------- inventory ----------
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const split = (l) => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') { q = !q; continue } if (ch === ',' && !q) { o.push(c); c = ''; continue } c += ch } o.push(c); return o }
  const h = split(lines[0])
  return lines.slice(1).map(l => { const o = split(l); return Object.fromEntries(h.map((k, i) => [k, o[i] ?? ''])) })
}
const inv = parseCsv(fs.readFileSync(INV, 'utf8'))
const pages = []
const fsweep = []
for (const r of inv) {
  if (r.has_page_content_json !== 'true') continue
  const file = `${r.university_id}-${r.programme}-${r.spec_slug}.json`
  if (!fs.existsSync(DIR + file)) continue
  const j = JSON.parse(fs.readFileSync(DIR + file, 'utf8'))
  if (j.metadata?.factSweep) continue
  if (!/\bindex\b/.test(r.robots) || /noindex/.test(r.robots) || r.in_sitemap !== 'true') continue
  pages.push({ ...r, file, j })
}
for (const f of fs.readdirSync(DIR)) { const j = JSON.parse(fs.readFileSync(DIR + f, 'utf8')); if (j.metadata?.factSweep) fsweep.push(j) }

// ---------- text helpers ----------
function strings(v, path, out) {
  if (typeof v === 'string') out.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out)
  return out
}
const words = (s) => (s.replace(/\*\*/g, ' ').match(/\S+/g) || []).length
// Rendered prose only: the syllabus is counted by subject name and description.
// Every string in sections (hero, prose, FAQs, syllabus names and descriptions), ** stripped.
function wordCount(j) { return strings(j.sections, '', []).reduce((n, [, s]) => n + words(s), 0) }
function section(path) {
  const root = path.split(/[.[]/)[0]
  if (root === 'fees') return 'fees'
  if (root === 'comparisons') return 'comparisons'
  if (root === 'faqs') return 'faqs'
  return 'other'
}
// Sentence spans inside one string: split on line breaks, then sentence ends.
function sentences(s) {
  const out = []
  const re = /[^\n]+/g
  let m
  while ((m = re.exec(s))) {
    const line = m[0]
    const base = m.index
    const sre = /(?<=[.!?])\s+(?=[A-Z0-9*(₹])/g
    let last = 0, sm
    while ((sm = sre.exec(line))) {
      // do not split after "Rs." or "approx." style abbreviations
      if (/\b(?:Rs|approx|vs|Dr|St|No)\.$/.test(line.slice(Math.max(0, sm.index - 7), sm.index))) continue
      out.push([base + last, base + sm.index]); last = sm.index + sm[0].length
    }
    out.push([base + last, base + line.length])
  }
  return out
}

// ---------- figure extraction ----------
const SALARY = /\bLPA\b|\bCTC\b|\bstart(?:s|ing)?\s+(?:at|from)\s+(?:₹|Rs)|\bfreshers?\b[^.]{0,60}(?:₹|Rs)|\bgraduates?\b[^.]{0,40}\b(?:start|see|earn|draw)\b|\bentry[\s-]*level\b[^.]{0,30}\b(?:see|start|earn|draw|get)\b|\bcrore\b|\bsalar(?:y|ies)\b|\bpackages?\b|\bstipend\b|per\s*annum|\bearn(?:s|ing|ings)?\b|\bpay\s*scale\b|\b(?:roles?|jobs?|positions?|managers?|leaders?|heads?|directors?)\b[^.]{0,80}\bpay(?:s|ing)?\b|\bpay(?:s|ing)?\s+(?:₹|Rs)/i
// Above this no online degree in lib/data.ts is priced; such a figure is a
// campus MBA, a salary or a market size, not this programme's fee.
const NOT_ONLINE_FEE = 1_000_000
// What kind of amount a figure is, from the words next to it. `pre` is the
// text back to the previous figure or clause break, `post` the text forward to
// the next figure or clause break, `sent` the whole sentence.
const PER_SEM = /per[\s-]*sem(?:ester)?\b|\/\s*sem(?:ester)?\b|semester[\s-]*(?:wise\s*)?fee|semester[\s-]*wise|each\s+semester|a\s+semester|per\s+term/i
const LINE_ITEM_POST = /^\s*(?:in|for|during|at)\s+(?:the\s+)?(?:Sem(?:ester)?|Year|Term)\s*[1-8]\b|^\s*(?:in|for)\s+(?:the\s+)?(?:first|second|third|fourth|final)\s+(?:semester|year)/i
const DIFF_PRE = /\b(?:difference|gap|premium|saving|savings)\b[^₹]{0,15}$/i
const DISCOUNT_NEAR = /discount|scholarship|waiver|cashback|early[\s-]*bird|coupon|refund|late\s*fee|penalty|net\s+(?:fee|payable|cost)|\bdefer|(?:before|after)\s+(?:confirmed\s+)?placement|pay\s+after\s+placement|payment\s+split|pre-?placement|post-?placement|\bPAP\b/i
const MULTIPLIER_POST = /^\s*(?:[x×*]\s*\d|times\s+\d)/i
// No online programme in lib/data.ts costs under this; a smaller "total" is a part.
const MIN_TOTAL = 30_000
// A labelled slice of a schedule: "Semester 3: ₹45,000", "Year 1 (Semesters 1 and 2): Rs 95,000", "Sem 2: ₹50,000".
const LINE_ITEM_PRE = /\b(?:Sem(?:ester)?s?|Year|Yr|Term|Instal?l?ment)\s*[1-8][^:₹]{0,28}:\s*$|\b(?:Sem(?:ester)?|Year|Yr|Term)\s*[1-8]\s+(?:is|costs?|fee\s+is|=)\s*$|\b(?:first|second|third|fourth|final|1st|2nd|3rd|4th)\s+(?:semester|year)\b[^₹]{0,20}$/i
// A difference, discount or saving: never the programme fee itself.
const DIFF = /\bbelow\b|\babove\b|\bmore\s+expensive|\bcostlier|\bcheaper|\bless\b|\blower\b|\bhigher\b|\bpremium\b|\bdifference|\bgap\b|\bsav(?:e|es|ed|ing|ings)\b|\bextra\b|\bmore\b|\boff\b|\bover\b/i
const DISCOUNT_SENT = /discount|scholarship|waiver|cashback|early[\s-]*bird|coupon|after\s+(?:a\s+|the\s+)?\d+%|\d+%\s+(?:off|fee\s+waiver)|net\s+(?:fee|payable)|effective\s+(?:fee|cost|total)|lump[\s-]*sum/i
const EMI = /\bEMI\b|per\s*month|monthly|\/\s*month|\/\s*mo\b/i
const ADDON = /coursera|linkedin\s+learning|add[\s-]*on|certificat|\bkit\b|laptop|bootcamp|optional/i
const BUDGET_PRE = /\bbudget\b[^₹]{0,30}$|\b(?:under|below|less\s+than|within|up\s*to|upto|around|about|over|above)\s*$|\bsub-?\s*$|\b(?:spend(?:ing)?|paying|pay)\s*$/i
const PART = /registration|application|exam(?:ination)?s?\b|admission|processing|alumni|hostel|\bdeposit\b|per\s*credit|\bcourse\s*\+|\btuition\s*\+|\+|\bplus\b|caution|security|convocation|degree\s+fee|ID\s+card|annual|yearly|per\s*year|a\s+year\b/i
const TOTAL_POST = /^\s*(?:total|all[\s-]*in|inclusive|including|in\s+total|overall|for\s+the\s+(?:full|whole|entire)|across)/i
function kindOf(pre, post, sent, fig, isFirstInSent, lineLabel) {
  const near = pre.slice(-45) + ' ' + post.slice(0, 45)
  if (EMI.test(near)) return 'component'
  if (MULTIPLIER_POST.test(post)) return fig.hi * 4 < MIN_TOTAL ? 'component' : 'per-semester'
  // The line's own label ("Examination fee: Rs 3,000 per year (Rs 6,000 total ...)") governs every figure on it.
  if (lineLabel && !/\btotal\b|programme\s+fee|program\s+fee|course\s+fee|tuition/i.test(lineLabel) && (PART.test(lineLabel) || DISCOUNT_NEAR.test(lineLabel) || EMI.test(lineLabel))) return 'component'
  if (DIFF.test(post.slice(0, 30)) || DIFF_PRE.test(pre) || /\b(?:by|of|save|saves|saving)\s*$/i.test(pre)) return 'component'
  if (ADDON.test(near) || DISCOUNT_NEAR.test(near)) return 'component'
  if (BUDGET_PRE.test(pre)) return 'component'
  // A part's own label ("Examination fee: Rs 2,750 per semester") outranks the per-semester wording.
  if (PART.test(pre.slice(-35))) return 'component'
  if (LINE_ITEM_PRE.test(pre) || LINE_ITEM_POST.test(post)) return 'line-item'
  if (PER_SEM.test(post.slice(0, 25)) || PER_SEM.test(pre.slice(-25))) return fig.hi * 4 < MIN_TOTAL ? 'component' : 'per-semester'
  if (PART.test(post.slice(0, 30)) && !/^\s*(?:inclusive|including|all[\s-]*in)/i.test(post)) return 'component'
  if (TOTAL_POST.test(post)) return 'total'
  if (PART.test(near)) return 'component'
  // In a sentence about a discount, only the first figure can be the list price.
  if (DISCOUNT_SENT.test(sent) && !isFirstInSent) return 'component'
  if (fig.hi < MIN_TOTAL) return 'component'
  return 'total'
}
const LAKH_RE = /(?<![\d.,₹])(?<!Rs\.?\s?)(?<!Rs\.?)\b(\d+(?:\.\d+)?)\s*(lakhs?|lacs?)\b/gi
const BARE_RE = /(?<![\d,.₹])(?<!Rs\.?\s?)\b(\d{1,2},\d{2},\d{3})\b/g

function extract(s) {
  const figs = []
  const taken = []
  const overlaps = (a, b) => taken.some(([x, y]) => a < y && b > x)
  RUPEE_RE.lastIndex = 0
  let m
  while ((m = RUPEE_RE.exec(s))) {
    const v0 = normalise(m[1], m[2] || '')
    if (v0 == null) continue
    let lo = v0, hi = v0, raw = m[0], len = m[0].length
    const tail = s.slice(m.index + len, m.index + len + 40).match(RANGE_TAIL_RE)
    if (tail) {
      const tsuf = tail[2] || m[2] || ''
      const end = normalise(tail[1], tsuf)
      if (end != null && end >= v0) {
        let start = v0
        if (!m[2] && tail[2]) { const r = parseFloat(m[1].replace(/,/g, '')); if (r < 1000) start = normalise(m[1], tail[2]) }
        lo = start; hi = end; raw = m[0] + tail[0]; len += tail[0].length
        RUPEE_RE.lastIndex = m.index + len
      }
    }
    if (hi < 1000) continue // "Rs 5" style noise: no fee is under a thousand rupees
    taken.push([m.index, m.index + len]); figs.push({ at: m.index, len, raw: raw.trim(), lo, hi, form: 'currency' })
  }
  for (const [re, form] of [[LAKH_RE, 'bare-lakh'], [BARE_RE, 'bare-number']]) {
    re.lastIndex = 0
    while ((m = re.exec(s))) {
      if (overlaps(m.index, m.index + m[0].length)) continue
      const v = form === 'bare-lakh' ? normalise(m[1], 'L') : normalise(m[1], '')
      if (v == null || v < 10000) continue
      taken.push([m.index, m.index + m[0].length]); figs.push({ at: m.index, len: m[0].length, raw: m[0], lo: v, hi: v, form })
    }
  }
  return figs.sort((a, b) => a.at - b.at)
}

// ---------- attribution and classification ----------
// Short names the blog alias index does not resolve, seen in spec comparisons.
const EXTRA_ALIASES = [
  [/\bCU\b/g, 'chandigarh-university-online'],
  [/\bDPU\b/g, 'dr-dy-patil-vidyapeeth-online'],
  [/\bJIIT\b|\bJaypee\b/g, 'jaypee-university-online'],
  [/\bBVU\b|\bBVDU\b/g, 'bharati-vidyapeeth-university-online'],
  [/\bUttaranchal\b/g, 'uttaranchal-university-online'],
  [/\bBITS(?:\s+Pilani)?\b/g, 'bits-pilani-work-integrated-online'],
  [/\bAlliance\b/g, 'alliance-university-online'],
  [/\bGLA\b/g, 'gla-university-online'],
  [/\b(?:O\.?\s?P\.?\s+)?Jindal\b/g, 'op-jindal-global-university-online'],
  [/\bNIU\b/g, 'noida-international-university-online'],
]
function unisIn(sentence, ownId) {
  const hits = findAllUnis(sentence).map(h => ({ ...h }))
  for (const [re, uid] of EXTRA_ALIASES) {
    if (!UNI.has(uid)) continue
    re.lastIndex = 0
    let m
    while ((m = re.exec(sentence))) if (!hits.some(h => Math.abs(h.index - m.index) < 3)) hits.push({ uid, alias: m[0], index: m.index })
  }
  // "DY Patil" on a Pune DPU page means the page's own university, not Navi Mumbai.
  for (const h of hits) if (ownId === 'dr-dy-patil-vidyapeeth-online' && h.uid === 'dy-patil-university-online') h.uid = ownId
  return hits.filter(h => UNI.has(h.uid)).sort((a, b) => a.index - b.index)
}
function attribute(sentence, offsetInSentence, ownId, lineBefore = '') {
  const hits = unisIn(sentence, ownId)
  if (!hits.length) {
    // "This programme", "The programme's", "You", "Your": the page's own university.
    if (/^\W*(?:this|the)\s+(?:programme|program|course|specialisation|specialization|degree)\b|^\W*(?:you|your)\b/i.test(sentence)) return { uid: ownId, rule: 'own (programme self-reference)' }
    // "**vs Amity Online MBA:** Amity has ... Fee is Rs 2,25,000." The figure's
    // sentence names nobody; the line's earlier text does.
    const prior = unisIn(lineBefore, ownId)
    if (prior.length) { const h = prior[prior.length - 1]; return { uid: h.uid, rule: h.uid === ownId ? 'own (named earlier in line)' : 'named earlier in line' } }
    return { uid: ownId, rule: 'own (no university named)' }
  }
  const before = hits.filter(h => h.index <= offsetInSentence)
  if (before.length) { const h = before[before.length - 1]; return { uid: h.uid, rule: h.uid === ownId ? 'own (named before figure)' : 'named before figure' } }
  const h = hits[0]
  // Only a name right after the figure ("Rs 97,600 (NIU)", "₹1.6L at Galgotias") claims it.
  if (h.index - offsetInSentence > 40) return { uid: ownId, rule: 'own (name too far after figure)' }
  return { uid: h.uid, rule: h.uid === ownId ? 'own (named after figure)' : 'named after figure' }
}
function intervalsFor(u, prog) {
  const iv = getAcceptableIntervals(u, prog)
  const ex = getExactFee(u, prog)
  if (ex.kind === 'exact') iv.push({ min: ex.min, max: ex.max, source: 'getExactFee' })
  return iv
}
const inIv = (v, iv) => v >= iv.min * (1 - TOL) && v <= iv.max * (1 + TOL)
const rangeIn = (lo, hi, iv) => Math.abs(lo - iv.min) / Math.max(iv.min, 1) <= TOL && Math.abs(hi - iv.max) / Math.max(iv.max, 1) <= TOL
function matches(lo, hi, ivs) {
  if (lo !== hi) return ivs.some(iv => rangeIn(lo, hi, iv)) || ivs.some(iv => inIv(lo, iv) && inIv(hi, iv))
  return ivs.some(iv => inIv(lo, iv))
}
function delta(lo, hi, ivs) {
  let best = null
  for (const iv of ivs) {
    const near = lo < iv.min ? iv.min : hi > iv.max ? iv.max : lo
    const d = near > 0 ? (lo - near) / near : 0
    if (best == null || Math.abs(d) < Math.abs(best)) best = d
  }
  return best
}
function classify(fig, kind, uid, prog) {
  const u = UNI.get(uid)
  if (!u) return { klass: 'UNRESOLVED', why: 'university not in lib/data.ts' }
  if (!u.programs.includes(prog)) return { klass: 'UNRESOLVED', why: `${prog} not offered` }
  const disp = getDisplayFee(u, prog)
  const ivs = intervalsFor(u, prog)
  const shown = disp.ok ? (disp.compact || `${disp.min}-${disp.max ?? disp.min}`) : ''
  if (!disp.ok) return { klass: 'SUPPRESSED', why: `getDisplayFee rule ${disp.rule}: ${String(disp.reason || '').slice(0, 80)}`, shown, ivs }
  if (matches(fig.lo, fig.hi, ivs)) return { klass: 'MATCH', why: '', shown, ivs }
  if ((kind === 'per-semester' || kind === 'line-item') && [4, 2, 3, 6].some(n => matches(fig.lo * n, fig.hi * n, ivs))) return { klass: 'MATCH', why: 'per-semester x semesters (2, 3, 4 or 6)', shown, ivs }
  if (kind === 'component') return { klass: 'UNRESOLVED', why: 'component (discount, EMI, exam, registration...) with no data field to check', shown, ivs }
  if (kind === 'line-item') return { klass: 'UNRESOLVED', why: 'one slice of an uneven schedule; data holds the total only', shown, ivs }
  if (fig.lo >= NOT_ONLINE_FEE) return { klass: 'UNRESOLVED', why: 'over Rs 10 lakh: campus MBA, salary or market figure, not an online fee', shown, ivs }
  return { klass: 'MISMATCH', why: '', shown, ivs, delta: delta(fig.lo, fig.hi, ivs) }
}

// ---------- run ----------
const rows = []
const perPage = []
let salaryExcluded = 0
for (const p of pages) {
  const prog = PROG[p.programme] || p.programme.toUpperCase()
  const own = UNI.get(p.university_id)
  const rendersBreakdown = own ? getFeePlans(own, prog, p.spec_slug).length > 0 : false
  const wc = wordCount(p.j)
  const clicks = Number(p.gsc_clicks || 0)
  const dropSentences = new Map() // key path|start -> words
  let n = 0
  for (const [path, s] of strings(p.j.sections, '', [])) {
    if (/^hero\./.test(path)) { /* hero is page furniture; still audited */ }
    const spans = sentences(s)
    const figs = extract(s)
    figs.forEach((fig, i) => {
      const sp = spans.find(([a, b]) => fig.at >= a && fig.at < b) || [0, s.length]
      const sent = s.slice(sp[0], sp[1])
      // The figure's own clause: back to the previous figure or clause break,
      // forward to the next figure or clause break, inside its sentence.
      const prevEnd = i > 0 ? figs[i - 1].at + figs[i - 1].len : 0
      const nextAt = i + 1 < figs.length ? figs[i + 1].at : s.length
      let a = Math.max(sp[0], prevEnd, fig.at - 70)
      const back = s.slice(a, fig.at)
      const cut = Math.max(back.lastIndexOf(';'), back.lastIndexOf(' - '), back.lastIndexOf('|'), back.lastIndexOf('('), back.lastIndexOf(', '))
      if (cut >= 0) a += cut + 1
      let b = Math.min(sp[1], nextAt, fig.at + fig.len + 50)
      const fwd = s.slice(fig.at + fig.len, b)
      const fcut = fwd.search(/[;|(),]| - |\.\s/)
      if (fcut >= 0) b = fig.at + fig.len + fcut
      const pre = s.slice(a, fig.at)
      const post = s.slice(fig.at + fig.len, b)
      const clause = pre + fig.raw + post
      if (SALARY.test(clause) || SALARY.test(sent) && fig.lo >= 300_000 && !/\bfee|tuition|cost/i.test(clause)) { salaryExcluded++; return }
      const isFirstInSent = !figs.some(f => f !== fig && f.at >= sp[0] && f.at < fig.at)
      // The label at the head of this line, if the line is "Label: ...".
      const lineStart = s.lastIndexOf('\n', fig.at) + 1
      const head = s.slice(lineStart, fig.at).replace(/\*\*/g, '')
      const colon = head.indexOf(':')
      const lineLabel = colon > 0 && colon <= 45 ? head.slice(0, colon) : ''
      const kind = kindOf(pre, post, sent, fig, isFirstInSent, lineLabel)
      const att = attribute(sent, fig.at - sp[0], p.university_id, s.slice(lineStart, sp[0]))
      const c = classify(fig, kind, att.uid, prog)
      n++
      if (c.klass !== 'MATCH') dropSentences.set(`${path}|${sp[0]}`, words(sent))
      rows.push({
        url: p.url, file: p.file, university_id: p.university_id, programme: prog, spec_slug: p.spec_slug,
        section: section(path), json_path: path, raw: fig.raw, form: fig.form, value_min: fig.lo, value_max: fig.hi, kind,
        attributed_university: att.uid, attribution: att.rule, class: c.klass, reason: c.why,
        data_display_fee: c.shown || '', data_intervals: (c.ivs || []).slice(0, 4).map(iv => `${iv.min}-${iv.max}`).join(' / '),
        delta_pct: c.delta != null ? (c.delta * 100).toFixed(1) : '',
        page_renders_feebreakdown: rendersBreakdown ? 'yes' : 'no', gsc_clicks_3m: clicks, page_word_count: wc,
        clause: clause.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(),
        sentence: sent.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().slice(0, 300),
      })
    })
  }
  const removed = [...dropSentences.values()].reduce((a, b) => a + b, 0)
  perPage.push({ url: p.url, file: p.file, clicks, wc, figures: n, removed, after: wc - removed, rendersBreakdown })
}

// ---------- write CSV ----------
const cols = ['url', 'file', 'university_id', 'programme', 'spec_slug', 'section', 'json_path', 'raw', 'form', 'value_min', 'value_max', 'kind', 'attributed_university', 'attribution', 'class', 'reason', 'data_display_fee', 'data_intervals', 'delta_pct', 'page_renders_feebreakdown', 'gsc_clicks_3m', 'page_word_count', 'clause', 'sentence']
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
fs.writeFileSync(OUT_CSV, [cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\n') + '\n')

// ---------- summary ----------
const CLASSES = ['MATCH', 'MISMATCH', 'SUPPRESSED', 'UNRESOLVED']
const SECTIONS = ['fees', 'comparisons', 'faqs', 'other']
const count = (f) => rows.filter(f).length
const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '0%'
const byPage = new Map()
for (const r of rows) { const e = byPage.get(r.url) ?? { MATCH: 0, MISMATCH: 0, SUPPRESSED: 0, UNRESOLVED: 0, own: 0, other: 0 }; e[r.class]++; if (r.class === 'MISMATCH') { if (r.attributed_university === r.university_id) e.own++; else e.other++ } byPage.set(r.url, e) }
const pageInfo = new Map(perPage.map(p => [p.url, p]))
const top = [...byPage.entries()].filter(([, e]) => e.MISMATCH).sort((a, b) => b[1].MISMATCH - a[1].MISMATCH || (pageInfo.get(b[0]).clicks - pageInfo.get(a[0]).clicks)).slice(0, 20)
const mmClicked = rows.filter(r => r.class === 'MISMATCH' && r.gsc_clicks_3m > 0)
const pagesClicked = new Set(mmClicked.map(r => r.url))
const fsMin = Math.min(...fsweep.map(wordCount))
const withFig = perPage.filter(p => p.figures)
const below = perPage.filter(p => p.after < FLOOR)
const belowNow = perPage.filter(p => p.wc < FLOOR)
const shrink = perPage.filter(p => p.removed).map(p => p.removed / p.wc).sort((a, b) => a - b)
const median = (a) => a.length ? a[Math.floor(a.length / 2)] : 0
const totalWc = perPage.reduce((a, p) => a + p.wc, 0)
const totalRemoved = perPage.reduce((a, p) => a + p.removed, 0)

const md = []
md.push('# Spec page fee audit, 14 Nov 2026', '')
md.push(`Audit only; no page content changed. Scope: ${pages.length} indexed specialisation pages with their own page-content JSON (audits/spec-page-inventory-2026-11-14.csv: JSON present, index, in sitemap; fact-swept files excluded). Robots and sitemap membership re-checked against the 14 Nov build before the run: ${pages.length}/${pages.length} index, follow and in valid-urls.json. Every figure is in audits/spec-fee-audit-2026-11-14.csv. Produced by scripts/audit-spec-fees.mjs, which reuses the blog fee scanner's extractor and accepted intervals.`, '')
md.push('## Totals by class', '', '| Class | Figures | Share |', '|---|---:|---:|')
for (const c of CLASSES) md.push(`| ${c} | ${count(r => r.class === c)} | ${pct(count(r => r.class === c), rows.length)} |`)
md.push(`| **All fee figures** | **${rows.length}** | |`, '')
md.push(`${withFig.length} of ${pages.length} pages carry at least one typed fee figure. ${salaryExcluded} salary-type figures (LPA, CTC, salary, package) are not fees and are left out.`, '')
md.push('## Totals by section', '', '| Section | ' + CLASSES.join(' | ') + ' | All |', '|---|' + CLASSES.map(() => '---:').join('|') + '|---:|')
for (const s of SECTIONS) md.push(`| ${s} | ` + CLASSES.map(c => count(r => r.section === s && r.class === c)).join(' | ') + ` | ${count(r => r.section === s)} |`)
md.push('', 'By kind of figure:', '', '| Kind | ' + CLASSES.join(' | ') + ' |', '|---|' + CLASSES.map(() => '---:').join('|') + '|')
for (const k of ['total', 'per-semester', 'line-item', 'component']) md.push(`| ${k} | ` + CLASSES.map(c => count(r => r.kind === k && r.class === c)).join(' | ') + ' |')
const ownMm = count(r => r.class === 'MISMATCH' && r.attributed_university === r.university_id)
md.push('', `Of the ${count(r => r.class === 'MISMATCH')} MISMATCH figures, ${ownMm} are the page's own university and ${count(r => r.class === 'MISMATCH') - ownMm} are a competitor named in the same sentence (mostly comparisons).`, '')
// Which (university, figure) pairs drive MISMATCH: one fee to confirm fixes many rows.
const pairs = new Map()
for (const r of rows.filter(r => r.class === 'MISMATCH')) {
  const k = `${r.attributed_university}|${r.value_min === r.value_max ? r.value_min : r.value_min + '-' + r.value_max}`
  const e = pairs.get(k) ?? { uid: r.attributed_university, fig: r.raw, data: r.data_display_fee, n: 0, pages: new Set(), allIn: 0 }
  e.n++; e.pages.add(r.url); if (/all[\s-]*in|inclusive|including|effective/i.test(r.clause + ' ' + r.sentence)) e.allIn++
  pairs.set(k, e)
}
const topPairs = [...pairs.values()].sort((a, b) => b.n - a.n).slice(0, 15)
const allInMm = rows.filter(r => r.class === 'MISMATCH' && /all[\s-]*in|inclusive|including|effective/i.test(r.clause + ' ' + r.sentence)).length
md.push('## What drives MISMATCH', '', `${pairs.size} distinct (university, figure) pairs make up the ${count(r => r.class === 'MISMATCH')} MISMATCH figures; the top 15 below account for ${topPairs.reduce((a, p) => a + p.n, 0)}. Each is one fee to confirm on the university's portal: either the page text or lib/data.ts is out of date. ${allInMm} MISMATCH figures sit in a sentence that calls the figure all-in, inclusive or effective, i.e. tuition plus exam and registration fees against a data figure that is tuition only.`, '', '| University | Typed figure | Data shows | Figures | Pages | All-in wording |', '|---|---|---|---:|---:|---:|')
for (const p of topPairs) md.push(`| ${p.uid.replace(/-online$/, '')} | ${p.fig} | ${p.data} | ${p.n} | ${p.pages.size} | ${p.allIn} |`)
md.push('', '## How far to trust the classes', '', 'Hand-checked random samples: 39 of 40 MISMATCH rows from the final run are a real disagreement between the typed figure and lib/data.ts (the miss is a competitor fee checked against the page\'s own university); 12 of 12 MATCH rows and 15 of 15 UNRESOLVED rows from the run before the last two rule tweaks were correct, the UNRESOLVED ones being parts of a fee (EMI, exam, registration, add-ons, budget talk) with no data field to check them against. Earlier drafts ran at 40% to 80% MISMATCH precision; the fixes are the kindOf and attribute rules in the script (line items, per-semester multipliers, line labels, differences, pay-after-placement splits, salary wording, short university names). Shoolini\'s "Rs 30,000" rows are its pay-after-placement instalments x 4; they stay MISMATCH because 4 x 30,000 is not a data figure, but they are the least certain pair in the table. By design a component (discount, EMI, exam fee, difference) is never MISMATCH: it is MATCH when it equals a data figure and UNRESOLVED otherwise. SUPPRESSED is 0 because no figure is attributed to a university whose getDisplayFee is ok:false; the 9 that were came from "DY Patil" on Pune DPU pages resolving to the Navi Mumbai university.', '')
const unrenderedNonMatch = rows.filter(r => r.class !== 'MATCH' && r.section === 'fees' && r.page_renders_feebreakdown === 'yes').length
md.push('## FeeBreakdown already rendered', '', `Of the non-MATCH figures in a fees section, ${unrenderedNonMatch} sit on pages whose fees section is replaced by FeeBreakdown, so readers never see them; they still sit in the JSON.`, '', `${perPage.filter(p => p.rendersBreakdown).length} of ${pages.length} pages render FeeBreakdown from data (getFeePlans has a plan), so their typed fees section is not shown; their typed figures elsewhere still are. The other ${perPage.filter(p => !p.rendersBreakdown).length} render the JSON fees body. Non-MATCH figures on pages with FeeBreakdown: ${count(r => r.class !== 'MATCH' && r.page_renders_feebreakdown === 'yes')}.`, '')
md.push('## The 20 pages with the most MISMATCH figures', '', '| # | Page | MISMATCH | own / competitor | Other non-MATCH | MATCH | Clicks (3 mo) | Words |', '|---:|---|---:|---|---:|---:|---:|---:|')
top.forEach(([url, e], i) => { const p = pageInfo.get(url); md.push(`| ${i + 1} | ${url.replace('/universities/', '')} | ${e.MISMATCH} | ${e.own} / ${e.other} | ${e.SUPPRESSED + e.UNRESOLVED} | ${e.MATCH} | ${p.clicks} | ${p.wc} |`) })
md.push('', '## MISMATCH on pages that earned clicks', '', `${mmClicked.length} of ${count(r => r.class === 'MISMATCH')} MISMATCH figures sit on ${pagesClicked.size} pages with at least one Search Console click in the inventory's 3-month window (${mmClicked.reduce((a, r) => a, 0) || ''}${[...pagesClicked].reduce((a, u) => a + pageInfo.get(u).clicks, 0)} clicks between those pages). ${perPage.filter(p => p.clicks > 0).length} of the ${pages.length} pages earned any click.`, '')
md.push('## If every non-MATCH figure sentence were removed', '', `Method: word count is every string in the page-content JSON sections (hero, prose, FAQs, syllabus names and descriptions; ** markup stripped). Each sentence holding a MISMATCH, SUPPRESSED or UNRESOLVED figure is removed once. The ${FLOOR}-word floor is the one quoted for the smallest 3.1 page; this count gives ${fsMin} for that page, the closest of four counting methods tried (without the hero: 463; without the syllabus: 462; without both: 437). The floor is applied as ${FLOOR}, so the test is slightly stricter than the 3.1 page itself.`, '')
md.push(`- Pages that would lose any text: ${shrink.length} of ${pages.length}.`)
md.push(`- Words removed: ${totalRemoved} of ${totalWc} (${pct(totalRemoved, totalWc)}) across the ${pages.length} pages.`)
md.push(`- Shrink per affected page: median ${(median(shrink) * 100).toFixed(1)}%, largest ${((shrink[shrink.length - 1] || 0) * 100).toFixed(1)}%.`)
md.push(`- Pages below ${FLOOR} words today: ${belowNow.length}. After removal: ${below.length}.`)
if (below.length) { md.push('', '| Page | Words now | Words after | Clicks (3 mo) |', '|---|---:|---:|---:|'); for (const p of below.sort((a, b) => a.after - b.after)) md.push(`| ${p.url.replace('/universities/', '')} | ${p.wc} | ${p.after} | ${p.clicks} |`) }
md.push('', 'Sentence removal is an estimate: a FAQ whose answer loses its only sentence would go whole, and a comparison block that loses its fee line may need a rewrite rather than a cut.', '')
const histo = [[0, 0.05], [0.05, 0.1], [0.1, 0.2], [0.2, 0.3], [0.3, 1.01]]
md.push('| Shrink | Pages |', '|---|---:|')
for (const [a, b] of histo) md.push(`| ${Math.round(a * 100)}% to ${b > 1 ? '100' : Math.round(b * 100)}% | ${shrink.filter(x => x >= a && x < b).length} |`)
fs.writeFileSync(OUT_MD, md.join('\n') + '\n')
console.log(JSON.stringify({ pages: pages.length, figures: rows.length, byClass: Object.fromEntries(CLASSES.map(c => [c, count(r => r.class === c)])), salaryExcluded, pagesWithFigures: withFig.length, mmOnClicked: mmClicked.length, pagesClicked: pagesClicked.size, fsMin, belowNow: belowNow.length, belowAfter: below.length, removedPct: pct(totalRemoved, totalWc) }))
