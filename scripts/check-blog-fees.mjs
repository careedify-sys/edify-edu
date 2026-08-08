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
import { scanAllPosts, perSlugUnverifiedCounts } from './lib/blog-fee-scan.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'data', 'blog-fee-baseline.json')
const ALLOWLIST_PATH = join(ROOT, 'data', 'blog-fee-allowlist.json')

const rows = scanAllPosts()
const current = perSlugUnverifiedCounts(rows)
const currentTotal = Object.values(current).reduce((a, b) => a + b, 0)

// Allowlist — owner-verified figures with no lib/data.ts counterpart.
// Consumed only by the NEW-post rule below; existing posts ignore it.
const allowlistData = existsSync(ALLOWLIST_PATH)
  ? JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'))
  : { entries: [] }
const allowSet = new Set(
  (allowlistData.entries || []).map(e => `${e.slug}::${e.figure}`),
)
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
