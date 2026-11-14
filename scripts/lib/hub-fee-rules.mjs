// scripts/lib/hub-fee-rules.mjs
//
// Fee-figure rules shared by the page-content fee audits: extraction (blog fee
// scanner regexes plus bare "N lakh" and bare Indian-format amounts), the kind
// of amount a figure is (total, per-semester, line-item, component), and which
// university a sentence attributes it to. Copied unchanged from
// scripts/audit-spec-fees.mjs (batch 3.2, 14 Nov 2026) so the hub audit counts
// a figure the same way the spec audit did.

import { RUPEE_RE, RANGE_TAIL_RE, normalise, findAllUnis, TOL } from './blog-fee-scan.mjs'
import { UNIVERSITIES } from '../../lib/data.ts'

const UNI = new Map(UNIVERSITIES.map(u => [u.id, u]))

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

// The figure's clause: back to the previous figure or clause break, forward to
// the next figure or clause break, inside its sentence; plus the line label
// ("Label: ...") and the line's text before the sentence.
function clauseFor(s, figs, i, spans) {
  const fig = figs[i]
  const sp = spans.find(([a, b]) => fig.at >= a && fig.at < b) || [0, s.length]
  const sent = s.slice(sp[0], sp[1])
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
  const isFirstInSent = !figs.some(f => f !== fig && f.at >= sp[0] && f.at < fig.at)
  const lineStart = s.lastIndexOf('\n', fig.at) + 1
  const head = s.slice(lineStart, fig.at).replace(/\*\*/g, '')
  const colon = head.indexOf(':')
  const lineLabel = colon > 0 && colon <= 45 ? head.slice(0, colon) : ''
  return { sp, sent, pre, post, clause: pre + fig.raw + post, isFirstInSent, lineLabel, lineBefore: s.slice(lineStart, sp[0]) }
}

export { extract, kindOf, attribute, sentences, clauseFor, SALARY, TOL }
