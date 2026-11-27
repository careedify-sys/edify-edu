// scripts/check-blog-salaries.mjs
//
// Per-slug ratchet on salary figures in blog posts. Counts every LPA /
// "lakh per annum" figure (single or range) a post prints, and blocks any
// commit that raises a post's count. Counts may only go down.
//
// WHY. check-blog-fees exempts salary sentences (NON_FEE_PATTERNS skips LPA,
// CTC, package and per-annum text), so nothing gated salary claims at all. The
// B3 batch 20 scope (2026-11-27) found 2,388 LPA figures across 112 posts, and
// the ones checked so far ("reported salary ranges" for Amity, MUJ, JAIN and
// NMIMS) had no official source. Until each is sourced or removed, the count
// must not grow. Same pattern as check-blog-fees.
//
// What is counted, per slug (first BLOG_POSTS entry for the slug, the one the
// blog page renders): post.content and post.faqs as visible text (shared
// definition in scripts/lib/blog-content-text.mjs), plus title, seoTitle,
// h1Title and metaDescription.
//
// Two counters, each with its own baseline and the same ratchet rules:
//   SALARY_FIGURE      -> data/blog-salary-baseline.json (the original counter)
//   SALARY_FIGURE_EXT  -> data/blog-salary-ext-baseline.json (B3 batch 23)
// The second counter covers notations the first missed: "lakh CTC", "CTC of
// Rs X lakh", "lakh/annum", "lakh yearly", "lacs" in a salary phrase, "L per
// year" and full-rupee "per annum" figures. It runs on the text with every
// SALARY_FIGURE match blanked out, so no figure is counted by both. It has its
// own baseline so the original one was not reseeded.
//   - A slug whose count RISES fails the commit.
//   - A slug whose count DROPS lowers that baseline (written and staged).
//   - A slug missing from a baseline must count 0.
//   - A missing baseline fails. Seed each once (--seed, --seed-ext); the hook
//     never seeds.
//
// "p.a." / "pa" match only as a whole token (B3 batch 23): "lakh package" and
// "lakh payable" used to count as "lakh pa".
//
// Run: npx tsx scripts/check-blog-salaries.mjs [--self-test] [--seed] [--seed-ext]
// Wired into: .husky/pre-commit

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'data', 'blog-salary-baseline.json')
const EXT_BASELINE_PATH = join(ROOT, 'data', 'blog-salary-ext-baseline.json')

// A number or range followed by LPA, L.P.A, "lakh(s) per annum / p.a. / a
// year / per year / annually", "L per annum / L p.a." or "crore per annum /
// package / CTC". A range ("Rs 6-12 LPA", "6 to 12 LPA") counts once.
// "p.a." must end at a word boundary, so "lakh package" does not count.
export const SALARY_FIGURE = new RegExp(
  String.raw`(?:₹|Rs\.?\s*|INR\s*)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*(?:₹|Rs\.?\s*)?\d+(?:\.\d+)?)?\s*(?:\+\s*)?(?:LPA\b|L\.P\.A|lakhs?\s+(?:per\s+annum|p\.?\s?a\.?(?![A-Za-z])|a\s+year|per\s+year|annually)|L\s+(?:per\s+annum|p\.?a\.?(?![A-Za-z]))|crore\s+(?:per\s+annum|package|CTC))`,
  'gi',
)

const NUM = String.raw`(?:₹|Rs\.?\s*|INR\s*)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*(?:₹|Rs\.?\s*)?\d+(?:\.\d+)?)?\s*(?:\+\s*)?`
const FULL = String.raw`(?:₹|Rs\.?\s*|INR\s*)\d{1,3}(?:,\d{2,3})+(?:\s*(?:-|–|to)\s*(?:₹|Rs\.?\s*)?\d{1,3}(?:,\d{2,3})+)?\s*`
const PA = String.raw`(?:per\s+annum|p\.?\s?a\.?(?![A-Za-z])|a\s+year|per\s+year|annually|yearly)`
// The extra notations, one alternative each. "CTC of" comes first so
// "CTC of Rs 12 lakh CTC" counts once.
export const SALARY_FIGURE_EXT = new RegExp([
  String.raw`CTC\s+of\s+(?:about\s+|around\s+|up\s+to\s+)?${NUM}(?:lakhs?|lacs?|L\b)`, // CTC of Rs 12 lakh
  String.raw`${NUM}(?:lakhs?|lacs?)\s+CTC\b`,                                             // 12 lakh CTC
  String.raw`${NUM}(?:lakhs?|lacs?)\s*\/\s*annum\b`,                                      // 12 lakh/annum ("lakh/year" is fee wording too)
  String.raw`${NUM}lakhs?\s+yearly\b`,                                                    // 12 lakh yearly
  String.raw`${NUM}lacs?\s*(?:${PA}|package\b)`,                                          // 12 lacs p.a., 12 lacs package
  String.raw`${NUM}L\s+(?:per\s+year|a\s+year|annually|yearly)\b`,                        // 12 L per year
  String.raw`${FULL}(?:per\s+annum|p\.?\s?a\.?(?![A-Za-z])|\/\s*annum\b)`,                // Rs 6,00,000 per annum
].join('|'), 'gi')

export function countSalaryFigures(text) {
  return (String(text ?? '').match(SALARY_FIGURE) || []).length
}

export function countSalaryFiguresExt(text) {
  return (String(text ?? '').replace(SALARY_FIGURE, ' § ').match(SALARY_FIGURE_EXT) || []).length
}

// Bare figures in a table column whose header names the unit ("Entry Level
// (LPA)", "Median Salary", "CTC"): "5 - 8", "12", "Rs 3.5 to 6". The unit is
// only in the header, so neither regex above sees them (QA batch 22, A4).
// A cell that carries its own unit is left to the regexes, so it is not
// counted twice.
const SALARY_HEADER = /\bLPA\b|salar(?:y|ies)|\bCTC\b/i
const BARE_CELL = /^(?:₹|Rs\.?\s*|INR\s*)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*(?:₹|Rs\.?\s*)?\d+(?:\.\d+)?)?\s*\+?$/i
const cellText = c => c.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
export function countHeaderUnitCells(html) {
  let n = 0
  for (const t of String(html ?? '').match(/<table[\s\S]*?<\/table>/gi) || []) {
    const rows = (t.match(/<tr[\s\S]*?<\/tr>/gi) || []).map(r => (r.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) || []).map(cellText))
    const h = (t.match(/<tr[\s\S]*?<\/tr>/gi) || []).findIndex(r => /<th\b/i.test(r))
    if (h < 0) continue
    const cols = rows[h].map((x, i) => (SALARY_HEADER.test(x) ? i : -1)).filter(i => i >= 0)
    if (!cols.length) continue
    for (const r of rows.slice(h + 1)) for (const i of cols) if (r[i] != null && BARE_CELL.test(r[i])) n++
  }
  return n
}

function selfTest() {
  const cases = [
    ['Average package Rs 6 LPA at the online batch.', 1],
    ['Roles pay Rs 6-12 LPA, rising to 14 to 25 LPA.', 2],
    ['A median of ₹8.5 lakh per annum and 10 lakhs a year.', 2],
    ['Senior roles reach 1.2 crore per annum.', 1],
    ['The fee is Rs 1,75,125 after an Early Bird Scholarship.', 0],
    ['EMI from Rs 8,906/month over 24 months.', 0],
    ['Programme fee Rs 2.07 lakh in total.', 0],
    ['A ₹12 lakh package after the MBA.', 0],
    ['Rs 2.5 lakh payable in two parts.', 0],
    ['Rs 8 lakh pa at entry level.', 1],
  ]
  const extCases = [
    ['Analysts start at Rs 9 lakh CTC.', 1],
    ['Offers came with a CTC of ₹14 lakh.', 1],
    ['Pay is Rs 7 lakh/annum.', 1],
    ['Seniors earn 18 lakh yearly.', 1],
    ['Freshers get 4 lacs p.a. in Pune.', 1],
    ['Leads reach 22 L per year.', 1],
    ['The role pays Rs 6,00,000 per annum.', 1],
    ['A CTC of Rs 12 LPA counts once, in the first counter.', 0],
    ['Tuition is Rs 1,75,000 per year.', 0],
    ['Programme fee Rs 2.07 lakh in total.', 0],
  ]
  const tableCases = [
    ['<table><thead><tr><th>Specialization</th><th>Entry Level (LPA)</th><th>Mid-Career (LPA)</th></tr></thead><tbody><tr><td>Finance</td><td>5 - 8</td><td>12 - 25</td></tr><tr><td>HR</td><td>3.5 - 6</td><td>8 - 15</td></tr></tbody></table>', 4],
    ['<table><tr><th>Role</th><th>Median Salary</th></tr><tr><td>Analyst</td><td>Rs 6 LPA</td></tr><tr><td>Lead</td><td>Varies by employer</td></tr></table>', 0],
    ['<table><tr><th>University</th><th>Total Fees</th></tr><tr><td>X</td><td>1,75,000</td></tr></table>', 0],
  ]
  let bad = 0
  for (const [s, want] of cases) { const got = countSalaryFigures(s); if (got !== want) { bad++; console.error(`  self-test: expected ${want}, got ${got}: "${s}"`) } }
  for (const [s, want] of extCases) { const got = countSalaryFiguresExt(s); if (got !== want) { bad++; console.error(`  self-test (ext): expected ${want}, got ${got}: "${s}"`) } }
  for (const [s, want] of tableCases) { const got = countHeaderUnitCells(s); if (got !== want) { bad++; console.error(`  self-test (table): expected ${want}, got ${got}: "${s.slice(0, 80)}..."`) } }
  if (bad) { console.error(`check-blog-salaries: self-test FAILED (${bad}).`); process.exit(1) }
  console.log(`check-blog-salaries: self-test OK (${cases.length + extCases.length + tableCases.length} cases).`)
}

async function currentCounts() {
  const { BLOG_POSTS } = await import('../lib/blog.ts')
  const { htmlText, contentText, firstBySlug } = await import('./lib/blog-content-text.mjs')
  const { bySlug } = firstBySlug(BLOG_POSTS)
  const main = {}, ext = {}
  for (const [slug, post] of bySlug) {
    const head = [post.title, post.seoTitle, post.h1Title, post.metaDescription].map(htmlText).join(' || ')
    const body = contentText(post)
    main[slug] = countSalaryFigures(body) + countSalaryFigures(head)
    ext[slug] = countSalaryFiguresExt(body) + countSalaryFiguresExt(head) + countHeaderUnitCells(post.content)
  }
  return { main, ext }
}

const total = o => Object.values(o).reduce((a, b) => a + b, 0)
const rel = p => p.slice(ROOT.length + 1).replace(/\\/g, '/')

function seed(path, counts, note) {
  if (existsSync(path)) {
    console.error(`check-blog-salaries: ${rel(path)} already exists; seeding only creates it. Counts may only go down.`)
    process.exit(1)
  }
  const perSlug = Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(path, JSON.stringify({ updatedAt: new Date().toISOString().slice(0, 10), note, total: total(perSlug), perSlug }, null, 2) + '\n', 'utf8')
  console.log(`check-blog-salaries: seeded ${rel(path)} with ${total(perSlug)} figures across ${Object.keys(perSlug).length} posts.`)
}

// One ratchet per baseline. Returns false on a rise.
function ratchet(label, path, current) {
  if (!existsSync(path)) {
    console.error(`check-blog-salaries: FAIL. ${rel(path)} is missing. It is committed; restore it from git rather than reseeding.`)
    return false
  }
  const baseline = JSON.parse(readFileSync(path, 'utf8'))
  const base = baseline.perSlug || {}
  const failures = [], drops = []
  for (const slug of new Set([...Object.keys(base), ...Object.keys(current)])) {
    const b = base[slug] ?? 0, c = current[slug] ?? 0
    if (c > b) failures.push(`  ${slug}: ${b} -> ${c} (+${c - b})${slug in base ? '' : ' (not in baseline, must be 0)'}`)
    else if (c < b) drops.push(slug)
  }
  if (failures.length) {
    console.error(`check-blog-salaries: FAIL. ${label} rose:`)
    for (const f of failures) console.error(f)
    console.error(`\nA salary figure needs an official source before it goes in a post. Remove it, or swap it for one you are removing in the same post. Never raise ${rel(path)}.`)
    return false
  }
  if (drops.length) {
    const perSlug = {}
    for (const [slug, b] of Object.entries(base)) { const c = Math.min(b, current[slug] ?? 0); if (c > 0) perSlug[slug] = c }
    writeFileSync(path, JSON.stringify({ ...baseline, updatedAt: new Date().toISOString().slice(0, 10), total: total(perSlug), perSlug }, null, 2) + '\n', 'utf8')
    spawnSync('git', ['add', rel(path)], { cwd: ROOT })
    console.log(`check-blog-salaries: OK (${label}). Baseline lowered for ${drops.length} post(s); total ${total(base)} -> ${total(perSlug)}.`)
  } else {
    console.log(`check-blog-salaries: OK (${label}: ${total(current)} figures, baseline ${baseline.total}).`)
  }
  return true
}

const args = new Set(process.argv.slice(2))
if (args.has('--self-test')) { selfTest(); process.exit(0) }

const { main, ext } = await currentCounts()

if (args.has('--seed') || args.has('--seed-ext')) {
  if (args.has('--seed')) seed(BASELINE_PATH, main, 'Per-slug count of LPA / lakh-per-annum salary figures in lib/blog.ts (content, FAQs, title, seoTitle, h1Title, metaDescription). Ratchet: a count may only go down; a slug not listed must be 0. See scripts/check-blog-salaries.mjs.')
  if (args.has('--seed-ext')) seed(EXT_BASELINE_PATH, ext, 'Per-slug count of the extra salary notations (lakh CTC, CTC of Rs X lakh, lakh/annum, lakh yearly, lacs, L per year, full-rupee per annum) and of bare figures in LPA/salary/CTC table columns, in lib/blog.ts. Separate from blog-salary-baseline.json, seeded once in B3 batch 23. Ratchet: a count may only go down. See scripts/check-blog-salaries.mjs.')
  process.exit(0)
}

const okMain = ratchet('salary figures (LPA / lakh per annum)', BASELINE_PATH, main)
const okExt = ratchet('extra salary notations and header-unit table cells', EXT_BASELINE_PATH, ext)
if (!okMain || !okExt) process.exit(1)
