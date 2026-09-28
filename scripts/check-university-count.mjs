#!/usr/bin/env node
// scripts/check-university-count.mjs
//
// The site claimed "125+ UGC-DEB approved universities" in 17 files, including
// the sitewide meta description, the homepage FAQ schema and public/llms.txt,
// while lib/data.ts held 143. Nobody noticed because a hardcoded number does
// not break anything when the database grows past it; it just quietly
// understates the product to every reader, human and model alike.
//
// This gate makes the next addition to UNIVERSITIES fail the commit until the
// claims are updated with it.
//
// Scope: app/, components/ and lib/site-config.ts. lib/blog.ts is deliberately
// excluded. Post bodies carry dated statements ("as of April 2026, based on a
// database of 125+ universities") that were true when written; rewriting an
// archive to match today's number would be falsifying the record, not fixing it.
//
// Run: node scripts/check-university-count.mjs
// Wired into: .husky/pre-commit

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { UNIVERSITIES } = await import('../lib/data.ts')
const ACTUAL = UNIVERSITIES.length

const ROOTS = [join(ROOT, 'app'), join(ROOT, 'components')]
const EXTRA = [join(ROOT, 'lib', 'site-config.ts'), join(ROOT, 'public', 'llms.txt')]
const SKIP_DIRS = new Set(['node_modules', '.next', 'admin', 'api'])

// A count claim is a number immediately before a coverage word. Years are
// excluded: "2026 UGC-DEB approved" is a date, not a count.
const CLAIM = /\b(\d{2,4})\s*\+?\s+(UGC[- ]?DEB|UGC|Best Online Universities|universities|Universities)\b/g

// Four things look like a coverage claim and are not one. Each of these was a
// false positive on the first run of this gate.
function isNotACoverageClaim(line, match, index) {
  const before = line.slice(0, index).toLowerCase()
  const after = line.slice(index + match.length).toLowerCase()
  // "NIRF top-50 universities", "the top 15 universities by NIRF" — a ranking
  // band, not how many we cover.
  if (/\btop[- ]$/.test(before)) return true
  // "63 of 128 universities" — a proportion.
  if (/\bof\s+$/.test(before)) return true
  // A code comment describing past behaviour, not copy anyone reads.
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return true
  // "10 UGC DEB approved online MBA programs" — counting programmes.
  if (/^\s*(deb\s+)?approved\s+online\s+\w+\s+programs?/.test(after)) return true
  return false
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (/\.(tsx?|jsx?|txt|json)$/.test(name)) out.push(p)
  }
  return out
}

const files = [...ROOTS.flatMap(d => walk(d)), ...EXTRA]
const bad = []

for (const f of files) {
  const text = readFileSync(f, 'utf8')
  const lines = text.split(/\r?\n/)
  lines.forEach((line, i) => {
    for (const m of line.matchAll(CLAIM)) {
      const n = Number(m[1])
      if (n >= 1900 && n <= 2100) continue          // a year
      if (isNotACoverageClaim(line, m[0], m.index)) continue
      if (n !== ACTUAL) {
        bad.push({ file: relative(ROOT, f), line: i + 1, claimed: n, text: line.trim().slice(0, 110) })
      }
    }
  })
}

if (bad.length) {
  console.error(`check-university-count: ${bad.length} stale coverage claim(s). lib/data.ts holds ${ACTUAL} universities.`)
  for (const b of bad) console.error(`  ${b.file}:${b.line}  claims ${b.claimed}\n      ${b.text}`)
  console.error(`\n  Update them to ${ACTUAL}, then regenerate llms.txt: node scripts/build-llms-txt.mjs`)
  process.exit(1)
}

console.log(`check-university-count: OK (${ACTUAL} universities, every coverage claim agrees).`)
