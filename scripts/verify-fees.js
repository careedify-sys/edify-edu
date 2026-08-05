#!/usr/bin/env node
// scripts/verify-fees.js
// Pre-commit fee consistency check. Verifies that feeMin/feeMax in lib/data.ts
// match data/fees-hub-data.json for every university id present in both.
// Exits 1 on any mismatch so drifted fee data never lands in a commit.
//
// Run standalone: node scripts/verify-fees.js

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_TS = fs.readFileSync(path.join(ROOT, 'lib', 'data.ts'), 'utf8')
const HUB = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'fees-hub-data.json'), 'utf8'))

// Known pre-existing drift, pending manual verification against official
// portals. See data/fee-verification-allowlist.json. New drift still fails.
let ALLOW = new Set()
try {
  const allowlist = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data', 'fee-verification-allowlist.json'), 'utf8'),
  )
  ALLOW = new Set((allowlist.allow || []).map(e => e.id))
} catch { /* no allowlist present */ }

// Parse id + feeMin + feeMax blocks out of lib/data.ts
const entries = new Map()
const blockRe = /id:\s*'([a-z0-9-]+)'[\s\S]*?feeMin:\s*(\d+)[\s\S]*?feeMax:\s*(\d+)/g
let m
while ((m = blockRe.exec(DATA_TS)) !== null) {
  if (!entries.has(m[1])) {
    entries.set(m[1], { feeMin: Number(m[2]), feeMax: Number(m[3]) })
  }
}

if (entries.size === 0) {
  console.error('verify-fees: could not parse any fee entries from lib/data.ts')
  process.exit(1)
}

let mismatches = 0
let allowed = 0
for (const hub of HUB) {
  const src = entries.get(hub.id)
  if (!src) continue
  if (src.feeMin !== hub.feeMin || src.feeMax !== hub.feeMax) {
    if (ALLOW.has(hub.id)) {
      allowed++
      console.warn(`verify-fees allowlisted drift (verify manually): ${hub.id}`)
      continue
    }
    mismatches++
    console.error(
      `verify-fees MISMATCH ${hub.id}: lib/data.ts ${src.feeMin}-${src.feeMax} vs fees-hub-data.json ${hub.feeMin}-${hub.feeMax}`,
    )
  }
}

if (mismatches > 0) {
  console.error(`\nverify-fees: ${mismatches} mismatch(es). Update both lib/data.ts and data/fees-hub-data.json together.`)
  process.exit(1)
}

console.log(`verify-fees: OK (${entries.size} universities in lib/data.ts, ${HUB.length} in fees hub, 0 new mismatches, ${allowed} allowlisted pending verification)`)
