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

const rows = scanAllPosts()
const current = perSlugUnverifiedCounts(rows)
const currentTotal = Object.values(current).reduce((a, b) => a + b, 0)

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

const allSlugs = new Set([...Object.keys(baseSlugs), ...Object.keys(current)])
for (const slug of allSlugs) {
  const b = baseSlugs[slug] ?? 0
  const c = current[slug] ?? 0
  if (c > b) failures.push({ slug, before: b, after: c, delta: c - b })
  else if (c < b) drops.push({ slug, before: b, after: c })
}

if (failures.length > 0) {
  console.error('check-blog-fees: FAIL. Unverified blog fee figures rose:')
  for (const f of failures) {
    const label = f.before === 0 ? '(NEW slug, must stay 0)' : ''
    console.error(`  ${f.slug}: ${f.before} -> ${f.after} (+${f.delta}) ${label}`)
  }
  console.error('\nEither remove the new ₹/Rs/INR figures, or verify them against lib/data.ts (getDisplayFee) so they resolve as MATCH.')
  console.error('Run `npx tsx scripts/audit-blog-fees.mjs` to see the full extraction and inspect the CSV.')
  process.exit(1)
}

if (drops.length > 0) {
  const updated = {
    ...baseline,
    updatedAt: new Date().toISOString().slice(0, 10),
    totalUnverified: currentTotal,
    perSlug: current,
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8')
  spawnSync('git', ['add', 'data/blog-fee-baseline.json'], { cwd: ROOT })
  console.log(`check-blog-fees: unverified count DROPPED (${baseline.totalUnverified} -> ${currentTotal}). Baseline updated and staged.`)
  for (const d of drops) console.log(`  ${d.slug}: ${d.before} -> ${d.after}`)
  process.exit(0)
}

console.log(`check-blog-fees: OK (${currentTotal} unverified, unchanged from baseline).`)
process.exit(0)
