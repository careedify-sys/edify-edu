// scripts/audit-blog-fees.mjs
// Extract every ₹-figure from lib/blog.ts post prose, infer the university +
// programme it refers to (from surrounding text and the blog slug/title), and
// cross-reference against getDisplayFee() / lib/data.ts.
//
// Output CSV: audits/blog-fee-crossref-<date>.csv
//
// Classification:
//   MATCH      — within 2% of the data.ts min/max
//   MISMATCH   — resolvable but > 2% off
//   SUPPRESSED — data.ts value is currently fee-suppressed (rule 4a/4b)
//   ORPHAN     — no counterpart in data.ts for this uni+programme
//   UNRESOLVED — could not infer uni or programme
//   NON_FEE    — figure lives near LPA/salary/EMI/per-month/CTC/stipend/etc.
//
// Run: npx tsx scripts/audit-blog-fees.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BLOG_POSTS } from '../lib/blog.ts'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'audits')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const TODAY = '2026-08-07'
const CSV_PATH = join(OUT_DIR, `blog-fee-crossref-${TODAY}.csv`)
const SUMMARY_PATH = join(OUT_DIR, `blog-fee-summary-${TODAY}.md`)

// -- Uni alias index -------------------------------------------------------

const UNI_BY_ID = new Map()
for (const u of UNIVERSITIES) UNI_BY_ID.set(u.id, u)

// Build an alias -> universityId map. Each alias is a lowercase string;
// longest aliases first so "manipal university jaipur" wins over "manipal".
const aliasEntries = []
function addAlias(alias, uid) {
  if (!alias) return
  aliasEntries.push({ alias: alias.toLowerCase(), uid })
}

for (const u of UNIVERSITIES) {
  // Full name minus " Online" suffix and any parentheticals.
  const base = u.name
    .replace(/\s+Online$/i, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  addAlias(u.name, u.id)
  addAlias(base, u.id)
  addAlias(base.replace(/^University of\s+/i, ''), u.id)
  if (u.abbr) addAlias(u.abbr, u.id)
  if (u.shortName) addAlias(u.shortName, u.id)
  // Also add abbr forms found inside parentheses in the full name
  const parens = [...u.name.matchAll(/\(([^)]+)\)/g)].map(m => m[1])
  for (const p of parens) addAlias(p, u.id)
  // slug -> humanised
  addAlias(u.id.replace(/-online$/, '').replace(/-/g, ' '), u.id)
}

// Hand-curated boosts for common blog references.
const MANUAL = {
  'amity': 'amity-university-online',
  'amity university': 'amity-university-online',
  'lpu': 'lovely-professional-university-online',
  'lovely professional': 'lovely-professional-university-online',
  'jain': 'jain-university-online',
  'jain university': 'jain-university-online',
  'muj': 'manipal-university-jaipur-online',
  'manipal jaipur': 'manipal-university-jaipur-online',
  'mahe': 'manipal-academy-of-higher-education-online',
  'manipal academy': 'manipal-academy-of-higher-education-online',
  'smu': 'sikkim-manipal-university-online',
  'sikkim manipal': 'sikkim-manipal-university-online',
  'galgotias': 'galgotias-university-online',
  'chandigarh university': 'chandigarh-university-online',
  'chandigarh': 'chandigarh-university-online',
  'upes': 'upes-online',
  'nmims': 'nmims-online',
  'symbiosis': 'symbiosis-university-online',
  'ssodl': 'symbiosis-university-online',
  'dy patil': 'dy-patil-university-online',
  'd.y. patil': 'dy-patil-university-online',
  'parul': 'parul-university-online',
  'shoolini': 'shoolini-university-online',
  'sharda': 'sharda-university-online',
  'chitkara': 'chitkara-university-online',
  'yenepoya': 'yenepoya-university-online',
  'dayananda sagar': 'dayananda-sagar-university-online',
  'dsu': 'dayananda-sagar-university-online',
  'amrita': 'amrita-vishwa-vidyapeetham-online',
  'mangalayatan': 'mangalayatan-university-online',
  'vignan': 'vignan-university-online',
}
for (const [alias, uid] of Object.entries(MANUAL)) {
  if (UNI_BY_ID.has(uid)) addAlias(alias, uid)
}

// Dedupe + sort longest-first.
const seen = new Set()
const ALIASES = aliasEntries
  .filter(({ alias }) => {
    const k = alias
    if (seen.has(k)) return false
    seen.add(k)
    return alias.length >= 3
  })
  .sort((a, b) => b.alias.length - a.alias.length)

// -- Programme detection ---------------------------------------------------

// Order matters: more specific first ("M.Com" before "MA", etc.).
const PROG_PATTERNS = [
  { prog: 'MBA (WX)', re: /\bMBA\s*\(?WX\)?\b/i },
  { prog: 'MBA', re: /\bMBA\b|\bmaster of business admin/i },
  { prog: 'MCA', re: /\bMCA\b|\bmaster of computer appl/i },
  { prog: 'MSc', re: /\bMSc\b|\bM\.Sc\.?\b|\bmaster of science\b/i },
  { prog: 'MA', re: /\bMA\b|\bM\.A\.?\b|\bmaster of arts\b/i },
  { prog: 'M.Com', re: /\bM\.?Com\b|\bmaster of commerce\b/i },
  { prog: 'BBA', re: /\bBBA\b|\bbachelor of business admin/i },
  { prog: 'BCA', re: /\bBCA\b|\bbachelor of computer appl/i },
  { prog: 'BSc', re: /\bBSc\b|\bB\.Sc\.?\b|\bbachelor of science\b/i },
  { prog: 'BA', re: /\bBA\b|\bB\.A\.?\b|\bbachelor of arts\b/i },
  { prog: 'B.Com', re: /\bB\.?Com\b|\bbachelor of commerce\b/i },
]

function detectProgramme(text) {
  for (const { prog, re } of PROG_PATTERNS) {
    if (re.test(text)) return prog
  }
  return null
}

function detectUniversity(text) {
  const lower = text.toLowerCase()
  for (const { alias, uid } of ALIASES) {
    // word boundary check
    const idx = lower.indexOf(alias)
    if (idx === -1) continue
    const before = idx === 0 ? ' ' : lower[idx - 1]
    const after = idx + alias.length >= lower.length ? ' ' : lower[idx + alias.length]
    if (/[a-z0-9]/.test(before) || /[a-z0-9]/.test(after)) continue
    return uid
  }
  return null
}

// -- Fee normalisation -----------------------------------------------------

// Matches ₹ / Rs. / INR figures like: ₹2.07L / ₹1,65,000 / ₹77,200 / ₹66K /
// ₹2.5 Lakh(s) / Rs. 1,50,000 / INR 2.5 Lakh. Captures the raw match and
// optional suffix. Currency notation varies across posts (ma-full-form uses
// "INR" exclusively) so the ratchet has to see all three or it drifts silently.
const RUPEE_RE = /(?:₹|Rs\.?\s*|INR\s+)([\d]+(?:[.,]\d+)*)(\s*(?:L(?:akhs?|acs?)?|K|Cr(?:ore)?s?))?/gi

function normaliseRupees(numStr, suffix) {
  // Strip commas.
  const clean = numStr.replace(/,/g, '')
  const n = parseFloat(clean)
  if (!isFinite(n)) return null
  const suf = (suffix || '').trim().toLowerCase()
  if (/^cr/.test(suf)) return Math.round(n * 10_000_000)
  if (/^l/.test(suf)) return Math.round(n * 100_000)
  if (/^k/.test(suf)) return Math.round(n * 1_000)
  // No suffix: interpret ₹2.07 as lakhs? No — task examples show ₹77,200 (no
  // suffix) and ₹1,65,000 stay as rupees. But bare ₹2.07 with no comma likely
  // means ₹2.07 as a stray char, treat as-is (already rounded).
  return Math.round(n)
}

// -- Non-fee context detection --------------------------------------------

const NON_FEE_RE = /\b(LPA|salary|salaries|package|packages|CTC|stipend|per\s*month|monthly|\/\s*month|\/\s*mo|per\s*annum|p\.?a\.?|EMI|instal(l?)ment|per\s*year|payout|payouts|earn|earning|compensation|starting\s+salary)\b/i

function isNonFee(context) {
  return NON_FEE_RE.test(context)
}

// -- Classification --------------------------------------------------------

const TOL = 0.02

function classify({ blogValue, universityId, programme }) {
  if (!universityId || !programme) return { klass: 'UNRESOLVED' }
  const u = UNI_BY_ID.get(universityId)
  if (!u) return { klass: 'UNRESOLVED' }
  if (!u.programs.includes(programme)) return { klass: 'ORPHAN', dataMin: null, dataMax: null, delta: null, rule: null }
  const disp = getDisplayFee(u, programme)
  if (!disp.ok) {
    return { klass: 'SUPPRESSED', dataMin: null, dataMax: null, delta: null, rule: disp.rule || null }
  }
  const dMin = disp.min ?? 0
  const dMax = disp.max ?? dMin
  const withinLow = blogValue >= dMin * (1 - TOL)
  const withinHigh = blogValue <= dMax * (1 + TOL)
  if (withinLow && withinHigh) {
    return { klass: 'MATCH', dataMin: dMin, dataMax: dMax, delta: 0, rule: disp.rule || null }
  }
  // Compute delta vs nearest bound.
  const nearest = blogValue < dMin ? dMin : dMax
  const delta = nearest > 0 ? (blogValue - nearest) / nearest : null
  return { klass: 'MISMATCH', dataMin: dMin, dataMax: dMax, delta, rule: disp.rule || null }
}

// -- Extraction loop -------------------------------------------------------

const rows = []

function csvEscape(v) {
  if (v == null) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

for (const post of BLOG_POSTS) {
  if (post.status !== 'published') continue
  const html = post.content || ''
  // Also scan title/faqs for figures? Task says prose; blog body is the risk
  // surface. Include FAQs too — they render in-body.
  const faqBlob = (post.faqs || []).map(f => `${f.q}\n${f.a}`).join('\n')
  const combined = `${html}\n${faqBlob}`

  const matches = [...combined.matchAll(RUPEE_RE)]
  for (const m of matches) {
    const raw = m[0]
    const numStr = m[1]
    const suf = m[2] || ''
    const value = normaliseRupees(numStr, suf)
    if (value == null) continue

    const start = Math.max(0, m.index - 120)
    const end = Math.min(combined.length, m.index + raw.length + 120)
    const context = combined.slice(start, end).replace(/\s+/g, ' ').trim()

    // Non-fee first — bail before wasting inference.
    // Look at a tighter ±40 char window for stipend/LPA phrasing since a
    // whole 240-char slab often has stray "per month" further away.
    const tightStart = Math.max(0, m.index - 60)
    const tightEnd = Math.min(combined.length, m.index + raw.length + 60)
    const tightCtx = combined.slice(tightStart, tightEnd)
    if (isNonFee(tightCtx)) {
      rows.push({
        slug: post.slug,
        publishedAt: post.publishedAt,
        raw,
        value,
        klass: 'NON_FEE',
        universityId: '',
        programme: '',
        dataMin: '',
        dataMax: '',
        delta: '',
        rule: '',
        primary: '',
        context,
      })
      continue
    }

    // Uni inference: prefer nearest preceding mention in ~500 char window.
    const uniWindowStart = Math.max(0, m.index - 500)
    const uniWindow = combined.slice(uniWindowStart, m.index + raw.length)
    let uid = detectUniversity(uniWindow)
    // Fall back to the blog slug/title.
    if (!uid) uid = detectUniversity(`${post.slug.replace(/-/g, ' ')} ${post.title}`)

    // Programme inference: ~200 char window then blog title/slug fallback.
    const progWinStart = Math.max(0, m.index - 200)
    const progWin = combined.slice(progWinStart, m.index + raw.length + 200)
    let prog = detectProgramme(progWin)
    if (!prog) prog = detectProgramme(`${post.slug.replace(/-/g, ' ')} ${post.title}`)

    const cls = classify({ blogValue: value, universityId: uid, programme: prog })

    // Primary vs competitor: uni token appears in blog slug.
    const primarySlugText = post.slug.replace(/-/g, ' ')
    const primary = uid ? detectUniversity(primarySlugText) === uid : false

    rows.push({
      slug: post.slug,
      publishedAt: post.publishedAt,
      raw,
      value,
      klass: cls.klass,
      universityId: uid || '',
      programme: prog || '',
      dataMin: cls.dataMin ?? '',
      dataMax: cls.dataMax ?? '',
      delta: cls.delta == null ? '' : (cls.delta * 100).toFixed(1) + '%',
      rule: cls.rule ?? '',
      primary: uid ? (primary ? 'primary' : 'competitor') : '',
      context,
    })
  }
}

// -- Write CSV -------------------------------------------------------------

const header = ['slug', 'publishedAt', 'raw', 'value_rupees', 'class', 'universityId', 'programme', 'dataMin', 'dataMax', 'delta_vs_nearest_bound', 'suppress_rule', 'primary_or_competitor', 'context']
const lines = [header.join(',')]
for (const r of rows) {
  lines.push([r.slug, r.publishedAt, r.raw, r.value, r.klass, r.universityId, r.programme, r.dataMin, r.dataMax, r.delta, r.rule, r.primary, r.context].map(csvEscape).join(','))
}
writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8')

// -- Summary counts --------------------------------------------------------

const byClass = {}
const bySlug = {}
for (const r of rows) {
  byClass[r.klass] = (byClass[r.klass] || 0) + 1
  bySlug[r.slug] = bySlug[r.slug] || { total: 0, MATCH: 0, MISMATCH: 0, SUPPRESSED: 0, ORPHAN: 0, UNRESOLVED: 0, NON_FEE: 0 }
  bySlug[r.slug].total++
  bySlug[r.slug][r.klass]++
}

const slugRows = Object.entries(bySlug)
  .sort((a, b) => b[1].total - a[1].total)

const md = []
md.push(`# Blog fee crossref summary — ${TODAY}`)
md.push('')
md.push(`Total ₹ figures extracted: **${rows.length}**`)
md.push('')
md.push('## By classification')
md.push('')
md.push('| Class | Count |')
md.push('|---|---:|')
for (const cls of ['MATCH', 'MISMATCH', 'SUPPRESSED', 'ORPHAN', 'UNRESOLVED', 'NON_FEE']) {
  md.push(`| ${cls} | ${byClass[cls] || 0} |`)
}
md.push('')
md.push('## Top 30 slugs by figure count')
md.push('')
md.push('| slug | total | MATCH | MISMATCH | SUPPRESSED | ORPHAN | UNRESOLVED | NON_FEE |')
md.push('|---|---:|---:|---:|---:|---:|---:|---:|')
for (const [slug, c] of slugRows.slice(0, 30)) {
  md.push(`| ${slug} | ${c.total} | ${c.MATCH} | ${c.MISMATCH} | ${c.SUPPRESSED} | ${c.ORPHAN} | ${c.UNRESOLVED} | ${c.NON_FEE} |`)
}
md.push('')
md.push(`CSV: audits/blog-fee-crossref-${TODAY}.csv`)
md.push('')
writeFileSync(SUMMARY_PATH, md.join('\n'), 'utf8')

console.log(`Extracted ${rows.length} figures across ${Object.keys(bySlug).length} posts.`)
for (const cls of ['MATCH', 'MISMATCH', 'SUPPRESSED', 'ORPHAN', 'UNRESOLVED', 'NON_FEE']) {
  console.log(`  ${cls.padEnd(12)}: ${byClass[cls] || 0}`)
}
console.log(`Wrote ${CSV_PATH}`)
console.log(`Wrote ${SUMMARY_PATH}`)
