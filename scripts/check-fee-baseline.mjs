// scripts/check-fee-baseline.mjs
// Sprint 2 Phase A2 gate. Runs `npm run check:fees` (which prints the current
// suppression counts from lib/fees.ts), compares the total suppressed count
// to data/fee-mismatch-baseline.json, and:
//   - blocks the commit (exit 1) if the count INCREASED
//   - updates the baseline in place if the count DECREASED, then allows
//   - allows silently if unchanged
//
// The baseline JSON is intentionally tracked in git so every commit records
// the fee-quality trend and CI can fail on a rising count in a PR.
//
// This exists so we can commit while ~137 rows are still open without the
// hook being useless. New drift is what we actually care about blocking.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(ROOT, 'data', 'fee-mismatch-baseline.json')

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) {
    console.error('check-fee-baseline: baseline file missing at data/fee-mismatch-baseline.json')
    console.error('check-fee-baseline: run `npm run check:fees` and commit the current count as the baseline.')
    process.exit(1)
  }
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
}

function runCheck() {
  const res = spawnSync('npx', ['tsx', 'scripts/check-fee-mismatches.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
  })
  return { stdout: res.stdout || '', stderr: res.stderr || '', code: res.status ?? 0 }
}

function parseCounts(stdout) {
  const line = stdout.split('\n').find(l => l.includes('TOTAL SUPPRESSED'))
  if (!line) return null
  const m = line.match(/:\s*(\d+)/)
  if (!m) return null
  const total = Number(m[1])
  const rule4a = Number((stdout.match(/Rule 4a[^:]*:\s*(\d+)/) || [])[1] || 0)
  const rule4b = Number((stdout.match(/Rule 4b[^:]*:\s*(\d+)/) || [])[1] || 0)
  return { total, rule4a, rule4b }
}

const baseline = readBaseline()
const check = runCheck()
const current = parseCounts(check.stdout)

if (!current) {
  console.error('check-fee-baseline: could not parse current mismatch count. Output was:')
  console.error(check.stdout)
  process.exit(1)
}

const prevTotal = Number(baseline.totalSuppressed)

if (current.total > prevTotal) {
  console.error(`check-fee-baseline: FAIL. Mismatch count rose from ${prevTotal} -> ${current.total}.`)
  console.error(`check-fee-baseline: fix the new drift, or run \`npm run check:fees\` to see the row-level list.`)
  process.exit(1)
}

if (current.total < prevTotal) {
  const updated = {
    ...baseline,
    totalSuppressed: current.total,
    rule4a: current.rule4a,
    rule4b: current.rule4b,
    updatedAt: new Date().toISOString().slice(0, 10),
    note: baseline.note,
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8')
  // Stage the updated baseline so it lands in this commit.
  spawnSync('git', ['add', 'data/fee-mismatch-baseline.json'], { cwd: ROOT })
  console.log(`check-fee-baseline: mismatch count DROPPED ${prevTotal} -> ${current.total}. Baseline updated and staged.`)
  process.exit(0)
}

console.log(`check-fee-baseline: OK (${current.total} suppressed, unchanged from baseline).`)
process.exit(0)
