// scripts/check-blog-fees.mjs
// Per-slug ratchet on "unverified" blog fee figures. Framed as: no NEW
// unverified fee figures. Existing counts are the baseline, so nothing
// currently in the repo is blocked.
//
// Unverified = every ₹/Rs/INR figure in a blog post that is NOT NON_FEE and
// NOT MATCH against getDisplayFee(uni, program). MISMATCH, SUPPRESSED,
// ORPHAN, and UNRESOLVED all count. Rationale: the two sources are in the
// middle of reconciliation, so we can't call either authoritative — we only
// commit to not letting the divergence grow.
//
// Baseline: data/blog-fee-baseline.json.
//   - Any slug whose count RISES fails the commit.
//   - Any slug whose count DROPS updates the baseline (auto-staged).
//   - Any NEW slug not in the baseline must have count 0.
//
// Run: node scripts/check-blog-fees.mjs
// Wired into: .husky/pre-commit

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { scanAllPosts, scanPost, perSlugUnverifiedCounts, EXEMPTION_HOLD_UNTIL, EXEMPTION_HOLD_SLUGS } from './lib/blog-fee-scan.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Time-boxed hold on the v4 discount-word narrowing (B3 batch 25). The listed
// posts keep the pre-v4 exemption only until EXEMPTION_HOLD_UNTIL. After that
// date the gate fails while any post is still listed: fix its figures, then
// remove it from EXEMPTION_HOLD_SLUGS in scripts/lib/blog-fee-scan.mjs. The
// date is never moved forward to make this pass.
{
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (today > EXEMPTION_HOLD_UNTIL && EXEMPTION_HOLD_SLUGS.length > 0) {
    console.error(`check-blog-fees: FAIL. The discount-word exemption hold expired on ${EXEMPTION_HOLD_UNTIL} and ${EXEMPTION_HOLD_SLUGS.length} post(s) are still listed:`)
    for (const s of EXEMPTION_HOLD_SLUGS) console.error(`  ${s}`)
    console.error('Fix their newly exposed figures and remove them from EXEMPTION_HOLD_SLUGS in scripts/lib/blog-fee-scan.mjs.')
    process.exit(1)
  }
  // Round 2 (QA F7): the hold is tied to the title freeze. Its date must equal
  // FREEZE_UNTIL in check-protected-pages.mjs and never pass 2026-12-05, and
  // every held slug must be a frozen slug. check-protected-pages runs its gate
  // on import, so its constants are read from the file text.
  const pp = readFileSync(join(ROOT, 'scripts', 'check-protected-pages.mjs'), 'utf8')
  const fu = pp.match(/const FREEZE_UNTIL = '(\d{4}-\d{2}-\d{2})'/)
  const fsBlock = pp.match(/const FREEZE_SLUGS = \[([\s\S]*?)\]/)
  const holdErr = []
  if (!fu || !fsBlock) holdErr.push('could not read FREEZE_UNTIL / FREEZE_SLUGS from scripts/check-protected-pages.mjs')
  else {
    const freezeSlugs = new Set([...fsBlock[1].matchAll(/'([^']+)'/g)].map(m => m[1]))
    if (freezeSlugs.size === 0) holdErr.push('FREEZE_SLUGS parsed as empty')
    if (EXEMPTION_HOLD_UNTIL !== fu[1]) holdErr.push(`EXEMPTION_HOLD_UNTIL ${EXEMPTION_HOLD_UNTIL} differs from FREEZE_UNTIL ${fu[1]}`)
    for (const s of EXEMPTION_HOLD_SLUGS) if (!freezeSlugs.has(s)) holdErr.push(`held slug ${s} is not in FREEZE_SLUGS`)
    // Round 3 (QA R5): both lists must be exactly the 8 posts frozen on
    // 6 Nov, so adding a slug to both files at once also fails.
    const FROZEN_8 = [
      'is-manipal-university-jaipur-fake-or-legit-2026',
      'chandigarh-university-online-mba-review',
      'amity-online-mba-review-2026',
      'smu-online-mba-review',
      'ignou-online-mba-review-2026',
      'symbiosis-online-mba-review-2026',
      'jain-online-mba-review-2026',
      'bits-pilani-online-mba-review-2026',
    ]
    const same = (list) => list.length === FROZEN_8.length && FROZEN_8.every(s => list.includes(s))
    if (!same([...freezeSlugs])) holdErr.push('FREEZE_SLUGS is not exactly the 8 frozen posts')
    if (!same(EXEMPTION_HOLD_SLUGS) || new Set(EXEMPTION_HOLD_SLUGS).size !== EXEMPTION_HOLD_SLUGS.length) holdErr.push('EXEMPTION_HOLD_SLUGS is not exactly the 8 frozen posts')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(EXEMPTION_HOLD_UNTIL) || EXEMPTION_HOLD_UNTIL > '2026-12-05') holdErr.push(`EXEMPTION_HOLD_UNTIL ${EXEMPTION_HOLD_UNTIL} is after 2026-12-05`)
  if (holdErr.length) {
    for (const e of holdErr) console.error(`check-blog-fees: FAIL. ${e}`)
    process.exit(1)
  }
}

// Self-test: the narrowed rule must catch a fee that only sits near a
// discount word, and must still exempt a figure that is the discount amount.
// A detector that cannot fail is not a gate (FIX-LOG, feedback 2026-09).
{
  const CASES = [
    ['MUJ online MBA costs Rs 9,99,000 after the 15% discount.', false],
    ['Pay upfront and save Rs 27,600 on the MUJ online MBA.', true],
    // Round 3 (QA R1): "off" with no punctuation after it never exempted a
    // figure under the old rule, so it must be checked now too.
    ['Amity gives Rs 10,000 off the online MBA.', false],
    ['The NMIMS online MBA costs Rs 9,99,000 off-campus.', false],
    ['The NMIMS online MBA costs Rs 9,99,000 off the bat.', false],
    ['Amity online MBA: Rs 10,000 off, for early applicants.', true],
    // Round 2 (QA F1): words outside the 10 discount words never exempt a
    // figure, and a word in another table cell never exempts it either.
    ['NMIMS online MBA has a fee difference of Rs 1,17,000 over the MUJ online MBA.', false],
    ['NMIMS online MBA is Rs 1,89,000 higher than the MUJ online MBA.', false],
    ['NMIMS online MBA is Rs 64,000 more expensive than the MUJ online MBA.', false],
    ['MUJ online BBA costs Rs 36,000 less than the NMIMS online BBA.', false],
    ['NMIMS online MBA: Rs 9,99,000 concession-free for all.', false],
    ['NMIMS online MBA</p><table><tr><td>Total</td><td>Rs 9,99,000</td><td>Higher rate</td></tr></table><p>', false],
    ['NMIMS online MBA</p><table><tr><td>Total</td><td>Rs 9,99,000</td><td>Discount</td></tr></table><p>', false],
    ['NMIMS offers a Rs 20,000 scholarship on the online MBA.', true],
    ['LPU online MBA is Rs 40,000 cheaper than Amity online MBA.', true],
    ['The gap of Rs 50,000 matters for the online MBA.', true],
  ]
  const bad = []
  for (const [text, wantNonFee] of CASES) {
    const r = scanPost({ slug: '__selftest__', status: 'published', title: 'self-test', content: `<p>${text}</p>` })[0]
    const isNonFeeRow = r?.klass === 'NON_FEE'
    if (!r || isNonFeeRow !== wantNonFee) bad.push(`${text} -> ${r ? r.klass : 'no figure'}`)
  }
  // v4 feePlans list interval: a plan whose rows lack a total must still
  // accept its own list fee, and must not widen to accept an unrelated figure.
  const KLASS_CASES = [
    ['Shoolini University online MBA list fee is Rs 2,00,000.', 'MATCH'],
    ['Shoolini University online MBA list fee is Rs 2,45,000.', 'MISMATCH'],
    // v5 (B3 batch 26) per-semester table, data/per-semester-fees.json: a
    // printed per-semester figure is MATCH, a different one for a university
    // with rows is MISMATCH, and a university with no row stays NON_FEE.
    ['LPU online MBA costs Rs 40,400 per semester.', 'MATCH'],
    ['LPU online MBA costs Rs 50,000 per semester.', 'MISMATCH'],
    ['NMIMS online MBA</p><table><tr><th>University</th><th>Per Semester</th></tr><tr><td>NMIMS</td><td>Rs 49,000</td></tr></table><p>', 'MISMATCH'],
    ['Galgotias online MBA costs Rs 20,050 per semester.', 'NON_FEE'],
    // A per-semester exam fee is not a semester fee and stays NON_FEE.
    ['LPU online MBA exam fee is Rs 2,000 per semester.', 'NON_FEE'],
  ]
  for (const [text, want] of KLASS_CASES) {
    const r = scanPost({ slug: '__selftest__', status: 'published', title: 'self-test', content: `<p>${text}</p>` })[0]
    if (!r || r.klass !== want) bad.push(`${text} -> ${r ? r.klass : 'no figure'} (want ${want})`)
  }
  if (bad.length) {
    console.error('check-blog-fees: FAIL (self-test). The discount-word rule did not behave as specified:')
    for (const b of bad) console.error(`  ${b}`)
    process.exit(1)
  }
}
const BASELINE_PATH = join(ROOT, 'data', 'blog-fee-baseline.json')
const ALLOWLIST_PATH = join(ROOT, 'data', 'blog-fee-allowlist.json')

// Allowlist — owner-verified figures with no lib/data.ts counterpart.
// Consumed by both the NEW-post rule and the EXISTING-post loose count.
// Allowlisted figures are treated as verified, so they don't inflate the
// per-slug ratchet just because the content phrasing repeats them.
const allowlistData = existsSync(ALLOWLIST_PATH)
  ? JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'))
  : { entries: [] }
const allowSet = new Set(
  (allowlistData.entries || []).map(e => `${e.slug}::${e.figure}`),
)

const rows = scanAllPosts()
const current = perSlugUnverifiedCounts(rows, allowSet)
const currentTotal = Object.values(current).reduce((a, b) => a + b, 0)
function isAllowlisted(slug, r) {
  for (const v of [r.value, r.valueMin, r.valueMax]) {
    if (v != null && allowSet.has(`${slug}::${v}`)) return true
  }
  return false
}
// Strict count for NEW slugs: everything not MATCH, minus allowlisted.
// NON_FEE and UNRESOLVED no longer clear the gate for new posts.
function strictNewSlugRows(slug) {
  return rows.filter(r => r.slug === slug && r.klass !== 'MATCH' && !isAllowlisted(slug, r))
}

if (!existsSync(BASELINE_PATH)) {
  const seed = {
    updatedAt: new Date().toISOString().slice(0, 10),
    note: 'Per-slug count of unverified blog fee figures (MISMATCH+SUPPRESSED+ORPHAN+UNRESOLVED). Ratchet blocks any per-slug increase and any figure in a new post. See scripts/check-blog-fees.mjs.',
    totalUnverified: currentTotal,
    perSlug: current,
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf8')
  console.log(`check-blog-fees: seeded baseline at data/blog-fee-baseline.json (${currentTotal} unverified across ${Object.keys(current).length} slugs).`)
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
const baseSlugs = baseline.perSlug || {}

const failures = []
const drops = []
const newSlugPassed = []
const grandfathered = []

// publishedAt per slug (from the scanner rows). Only posts newer than the
// baseline updatedAt trigger the strict NEW-post rule. Older slugs missing
// from the baseline are grandfathered in with their current loose count so
// changes to the ratchet don't retroactively fail posts that predate it.
const publishedAtBySlug = {}
for (const r of rows) if (!(r.slug in publishedAtBySlug)) publishedAtBySlug[r.slug] = r.publishedAt || ''
const baselineDate = baseline.updatedAt || '1970-01-01'

// All slugs that appear in the scan, in baseline, or in current counts.
const allSlugs = new Set([
  ...Object.keys(baseSlugs),
  ...Object.keys(current),
  ...rows.map(r => r.slug),
])
for (const slug of allSlugs) {
  const inBaseline = slug in baseSlugs
  const b = baseSlugs[slug] ?? 0
  const publishedAt = publishedAtBySlug[slug] || ''
  const isPostBaseline = publishedAt && publishedAt > baselineDate
  if (!inBaseline && isPostBaseline) {
    // NEW post rule: only MATCH or allowlisted figures pass. NON_FEE and
    // UNRESOLVED no longer clear the gate. This is stricter than the loose
    // count used for existing posts.
    const strict = strictNewSlugRows(slug)
    if (strict.length > 0) failures.push({ slug, isNew: true, strict })
    else newSlugPassed.push(slug)
  } else if (!inBaseline) {
    // Predates the ratchet upgrade — grandfather in with current loose count.
    grandfathered.push(slug)
  } else {
    // EXISTING post rule (unchanged): loose count from perSlugUnverifiedCounts.
    // NON_FEE remains excluded so the 162-post corpus is unaffected.
    const c = current[slug] ?? 0
    if (c > b) failures.push({ slug, isNew: false, before: b, after: c, delta: c - b })
    else if (c < b) drops.push({ slug, before: b, after: c })
  }
}

if (failures.length > 0) {
  console.error('check-blog-fees: FAIL.')
  for (const f of failures) {
    if (f.isNew) {
      console.error(`  ${f.slug}: NEW post has ${f.strict.length} figure(s) that are neither MATCH nor allowlisted.`)
      console.error(`    NEW-post rule: every ₹/Rs/INR figure must either resolve to MATCH via getDisplayFee(lib/data.ts) or be listed in data/blog-fee-allowlist.json.`)
      for (const r of f.strict) {
        console.error(`    - "${r.raw}" (${r.value}) classified as ${r.klass}${r.universityId ? ` / ${r.universityId}` : ''}${r.programme ? ` / ${r.programme}` : ''}`)
      }
    } else {
      console.error(`  ${f.slug}: ${f.before} -> ${f.after} (+${f.delta}) — existing-post loose count regressed`)
    }
  }
  console.error('\nEither remove the figures, verify them against lib/data.ts (getDisplayFee) so they resolve as MATCH, or add them to data/blog-fee-allowlist.json with source + verified_date.')
  console.error('Run `npx tsx scripts/audit-blog-fees.mjs` to see the full extraction and inspect the CSV.')
  process.exit(1)
}

// On any success, ensure baseline includes every scanned slug so a passed
// NEW post promotes to existing on the next run (stops re-triggering the
// strict rule for subsequent edits to the same file), and so grandfathered
// slugs are recorded permanently.
const baselineChanged = drops.length > 0 || newSlugPassed.length > 0 || grandfathered.length > 0
if (baselineChanged) {
  const updatedPerSlug = { ...baseSlugs }
  for (const s of Object.keys(baseSlugs)) updatedPerSlug[s] = current[s] ?? 0
  for (const s of newSlugPassed) if (!(s in updatedPerSlug)) updatedPerSlug[s] = current[s] ?? 0
  for (const s of grandfathered) if (!(s in updatedPerSlug)) updatedPerSlug[s] = current[s] ?? 0
  const updatedTotal = Object.values(updatedPerSlug).reduce((a, b) => a + b, 0)
  const updated = {
    ...baseline,
    updatedAt: new Date().toISOString().slice(0, 10),
    totalUnverified: updatedTotal,
    perSlug: updatedPerSlug,
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8')
  spawnSync('git', ['add', 'data/blog-fee-baseline.json'], { cwd: ROOT })
  if (drops.length > 0) {
    console.log(`check-blog-fees: unverified count DROPPED (${baseline.totalUnverified} -> ${updatedTotal}). Baseline updated and staged.`)
    for (const d of drops) console.log(`  ${d.slug}: ${d.before} -> ${d.after}`)
  }
  if (newSlugPassed.length > 0) {
    console.log(`check-blog-fees: seeded ${newSlugPassed.length} new slug(s) into baseline:`)
    for (const s of newSlugPassed) console.log(`  ${s}: baselined at ${current[s] ?? 0}`)
  }
  if (grandfathered.length > 0) {
    console.log(`check-blog-fees: grandfathered ${grandfathered.length} pre-ratchet slug(s) at their current loose count:`)
    for (const s of grandfathered) console.log(`  ${s} (publishedAt ${publishedAtBySlug[s]} <= baseline ${baselineDate}): ${current[s] ?? 0}`)
  }
  process.exit(0)
}

console.log(`check-blog-fees: OK (${currentTotal} unverified, unchanged from baseline).`)
process.exit(0)
