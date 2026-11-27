// scripts/check-blog-salaries.mjs
//
// Per-slug ratchet on salary figures in blog posts. Counts every LPA /
// "lakh per annum" figure (single or range) a post prints, and blocks any
// commit that raises a post's count. Counts may only go down.
//
// WHY. check-blog-fees exempts salary sentences (NON_FEE_PATTERNS skips LPA,
// CTC, package and per-annum text), so nothing gated salary claims at all. The
// B3 batch 20 scope (2026-11-27) found 2,388 LPA figures across 122 posts, and
// the ones checked so far ("reported salary ranges" for Amity, MUJ, JAIN and
// NMIMS) had no official source. Until each is sourced or removed, the count
// must not grow. Same pattern as check-blog-fees.
//
// What is counted, per slug (first BLOG_POSTS entry for the slug, the one the
// blog page renders): post.content and post.faqs as visible text (shared
// definition in scripts/lib/blog-content-text.mjs), plus title, seoTitle,
// h1Title and metaDescription.
//
// Baseline: data/blog-salary-baseline.json.
//   - A slug whose count RISES fails the commit.
//   - A slug whose count DROPS lowers the baseline (written and staged).
//   - A slug missing from the baseline must count 0.
//   - A missing baseline fails. Seed it once with --seed; the hook never seeds.
//
// Run: npx tsx scripts/check-blog-salaries.mjs [--self-test] [--seed]
// Wired into: .husky/pre-commit

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'data', 'blog-salary-baseline.json')

// A number or range followed by LPA, L.P.A, "lakh(s) per annum / p.a. / a
// year / per year / annually", "L per annum / L p.a." or "crore per annum /
// package / CTC". A range ("Rs 6-12 LPA", "6 to 12 LPA") counts once.
export const SALARY_FIGURE = new RegExp(
  String.raw`(?:₹|Rs\.?\s*|INR\s*)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*(?:₹|Rs\.?\s*)?\d+(?:\.\d+)?)?\s*(?:\+\s*)?(?:LPA\b|L\.P\.A|lakhs?\s+(?:per\s+annum|p\.?\s?a\.?|a\s+year|per\s+year|annually)|L\s+(?:per\s+annum|p\.?a\.?)|crore\s+(?:per\s+annum|package|CTC))`,
  'gi',
)

export function countSalaryFigures(text) {
  return (String(text ?? '').match(SALARY_FIGURE) || []).length
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
  ]
  let bad = 0
  for (const [s, want] of cases) {
    const got = countSalaryFigures(s)
    if (got !== want) { bad++; console.error(`  self-test: expected ${want}, got ${got}: "${s}"`) }
  }
  if (bad) { console.error(`check-blog-salaries: self-test FAILED (${bad}).`); process.exit(1) }
  console.log(`check-blog-salaries: self-test OK (${cases.length} cases).`)
}

async function currentCounts() {
  const { BLOG_POSTS } = await import('../lib/blog.ts')
  const { htmlText, contentText, firstBySlug } = await import('./lib/blog-content-text.mjs')
  const { bySlug } = firstBySlug(BLOG_POSTS)
  const out = {}
  for (const [slug, post] of bySlug) {
    const head = [post.title, post.seoTitle, post.h1Title, post.metaDescription].map(htmlText).join(' || ')
    out[slug] = countSalaryFigures(contentText(post)) + countSalaryFigures(head)
  }
  return out
}

const args = new Set(process.argv.slice(2))
if (args.has('--self-test')) { selfTest(); process.exit(0) }

const current = await currentCounts()
const total = o => Object.values(o).reduce((a, b) => a + b, 0)

if (args.has('--seed')) {
  if (existsSync(BASELINE_PATH)) {
    console.error('check-blog-salaries: baseline already exists; --seed only creates it. Counts may only go down.')
    process.exit(1)
  }
  const perSlug = Object.fromEntries(Object.entries(current).filter(([, n]) => n > 0).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(BASELINE_PATH, JSON.stringify({
    updatedAt: new Date().toISOString().slice(0, 10),
    note: 'Per-slug count of LPA / lakh-per-annum salary figures in lib/blog.ts (content, FAQs, title, seoTitle, h1Title, metaDescription). Ratchet: a count may only go down; a slug not listed must be 0. See scripts/check-blog-salaries.mjs.',
    total: total(perSlug),
    perSlug,
  }, null, 2) + '\n', 'utf8')
  console.log(`check-blog-salaries: seeded ${total(perSlug)} figures across ${Object.keys(perSlug).length} posts.`)
  process.exit(0)
}

if (!existsSync(BASELINE_PATH)) {
  console.error('check-blog-salaries: FAIL. data/blog-salary-baseline.json is missing. It is committed; restore it from git rather than reseeding.')
  process.exit(1)
}
const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
const base = baseline.perSlug || {}

const failures = []
const drops = []
for (const slug of new Set([...Object.keys(base), ...Object.keys(current)])) {
  const b = base[slug] ?? 0
  const c = current[slug] ?? 0
  if (c > b) failures.push(`  ${slug}: ${b} -> ${c} (+${c - b})${slug in base ? '' : ' (not in baseline, must be 0)'}`)
  else if (c < b) drops.push(slug)
}
if (failures.length) {
  console.error('check-blog-salaries: FAIL. Salary figures (LPA / lakh per annum) rose:')
  for (const f of failures) console.error(f)
  console.error('\nA salary figure needs an official source before it goes in a post. Remove it, or swap it for one you are removing in the same post. Never raise data/blog-salary-baseline.json.')
  process.exit(1)
}
if (drops.length) {
  const perSlug = {}
  for (const [slug, b] of Object.entries(base)) { const c = Math.min(b, current[slug] ?? 0); if (c > 0) perSlug[slug] = c }
  writeFileSync(BASELINE_PATH, JSON.stringify({ ...baseline, updatedAt: new Date().toISOString().slice(0, 10), total: total(perSlug), perSlug }, null, 2) + '\n', 'utf8')
  spawnSync('git', ['add', 'data/blog-salary-baseline.json'], { cwd: ROOT })
  console.log(`check-blog-salaries: OK. Baseline lowered for ${drops.length} post(s); total ${total(base)} -> ${total(perSlug)}.`)
} else {
  console.log(`check-blog-salaries: OK (${total(current)} salary figures, baseline ${baseline.total}).`)
}
