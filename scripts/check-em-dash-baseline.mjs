// scripts/check-em-dash-baseline.mjs
// Sprint 3 Fix 2b. Per-file em-dash baseline that mirrors the fee-mismatch
// baseline mechanic exactly. Scans the full content of every .tsx file under
// app/ and components/, including template literals and JSX text, counts the
// em dashes, and:
//   - blocks the commit (exit 1) if any file's count ROSE above its baseline
//     entry, or if a file NOT in the baseline contains any em dash
//   - updates the baseline in place (and stages it) if any file's count
//     DROPPED, or if a baselined file is now gone
//   - passes silently if every file matches its baseline exactly
//
// Files not in the baseline are allowed zero em dashes (strict-from-birth).
// The count can only ratchet DOWN over time; the hook never lets it climb.
//
// The check is a superset of check-em-dash.js (which is diff-based and
// stays in place as a fast fail on newly-added lines).

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'data', 'em-dash-baseline.json')
const SCAN_ROOTS = ['app', 'components']
const EM_DASH = /—/g

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name)
    const st = statSync(abs)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.')) continue
      walk(abs, out)
    } else if (/\.tsx$/.test(name)) {
      out.push(abs)
    }
  }
  return out
}

function scanCurrent() {
  const counts = {}
  for (const r of SCAN_ROOTS) {
    const abs = join(ROOT, r)
    if (!existsSync(abs)) continue
    for (const file of walk(abs, [])) {
      const rel = relative(ROOT, file).replace(/\\/g, '/')
      const src = readFileSync(file, 'utf8')
      const matches = src.match(EM_DASH)
      if (matches && matches.length > 0) counts[rel] = matches.length
    }
  }
  return counts
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    console.error('check-em-dash-baseline: baseline file missing at data/em-dash-baseline.json')
    console.error('check-em-dash-baseline: seed it by running:')
    console.error('  node scripts/check-em-dash-baseline.mjs --seed')
    process.exit(1)
  }
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
}

function writeBaseline(files) {
  const sorted = Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => a.localeCompare(b))
  )
  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    note: 'Per-file em-dash baseline for app/**/*.tsx and components/**/*.tsx. Mirrors data/fee-mismatch-baseline.json: check-em-dash-baseline.mjs blocks any commit that raises a file above its allowed count. Files not listed are allowed zero. Count can only ratchet DOWN. See audits/em-dash-cleanup-components-2026-08-05.md for the planned cleanup.',
    files: sorted,
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8')
}

const SEED_MODE = process.argv.includes('--seed')

if (SEED_MODE) {
  const current = scanCurrent()
  writeBaseline(current)
  const total = Object.values(current).reduce((a, b) => a + b, 0)
  console.log(`check-em-dash-baseline: SEEDED baseline. ${Object.keys(current).length} file(s), ${total} em dash(es) total.`)
  process.exit(0)
}

const baseline = readBaseline()
const baselineFiles = baseline.files || {}
const current = scanCurrent()

const violations = []
const drops = []
for (const [path, count] of Object.entries(current)) {
  const allowed = baselineFiles[path] ?? 0
  if (count > allowed) {
    violations.push(`  ${path}: ${count} em dash(es), baseline allows ${allowed}`)
  } else if (count < allowed) {
    drops.push(`  ${path}: ${count} <- ${allowed}`)
  }
}
for (const path of Object.keys(baselineFiles)) {
  if (!(path in current)) {
    drops.push(`  ${path}: removed`)
  }
}

if (violations.length > 0) {
  console.error(`check-em-dash-baseline: FAIL. ${violations.length} file(s) exceed the em-dash baseline:`)
  for (const v of violations) console.error(v)
  console.error('')
  console.error('Replace with a period, comma, and/but/or, or a middle dot. New drift is not allowed.')
  console.error('If you cleaned other em dashes in the same commit, run:')
  console.error('  node scripts/check-em-dash-baseline.mjs --seed  (only if you know what you are doing)')
  process.exit(1)
}

if (drops.length > 0) {
  writeBaseline(current)
  spawnSync('git', ['add', 'data/em-dash-baseline.json'], { cwd: ROOT })
  console.log(`check-em-dash-baseline: em-dash count DROPPED in ${drops.length} file(s). Baseline updated and staged.`)
  for (const d of drops.slice(0, 20)) console.log(d)
  if (drops.length > 20) console.log(`  ... and ${drops.length - 20} more`)
  process.exit(0)
}

const total = Object.values(current).reduce((a, b) => a + b, 0)
console.log(`check-em-dash-baseline: OK (${Object.keys(current).length} file(s), ${total} em dash total, unchanged from baseline).`)
process.exit(0)
