// scripts/check-syllabus-manifest-brackets.mjs
//
// Every subject name in lib/data/syllabus-manifest.json must have balanced
// brackets.
//
// Why this gate exists: the manifest was built by splitting syllabus lines on
// commas, including commas inside brackets. On 2026-11-14 twelve semesters
// (Chandigarh MCA, MAHE MCA, MAHE MBA) held names like "DevOps -1 (GIT",
// "Jenkins", "Docker)". The spec pages, the MCA subjects post and its
// shared-subjects table all read the manifest, so one bad split shows up as
// three broken subjects on every page that uses it, and inflates the counts.
// Fix a failure by joining the run back into one name with ", ", from the
// piece that opens the bracket to the piece that closes it.
//
// Run: node scripts/check-syllabus-manifest-brackets.mjs [--self-test]
// Wired into: .husky/pre-commit

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PAIRS = { '(': ')', '[': ']', '{': '}' }
const CLOSE = new Set(Object.values(PAIRS))

export function balanced(s) {
  const stack = []
  for (const c of s) {
    if (PAIRS[c]) stack.push(PAIRS[c])
    else if (CLOSE.has(c) && stack.pop() !== c) return false
  }
  return stack.length === 0
}

function scan(M) {
  const bad = []
  let n = 0
  for (const [uni, progs] of Object.entries(M)) for (const [prog, keys] of Object.entries(progs || {})) for (const [key, entry] of Object.entries(keys || {})) {
    for (const sem of entry?.semesters ?? []) for (const subject of sem.subjects ?? []) {
      n++
      if (!balanced(subject)) bad.push(`${uni} ${prog} ${key} sem ${sem.sem}: "${subject}"`)
    }
  }
  return { n, bad }
}

if (process.argv.includes('--self-test')) {
  const { bad } = scan({ u: { mca: { k: { semesters: [{ sem: 3, subjects: ['DevOps -1 (GIT', 'Jenkins', 'Docker)', 'Ok (fine)'] }] } } } })
  if (bad.length !== 2) { console.error('check-syllabus-manifest-brackets: self-test FAILED, expected 2 findings, got ' + bad.length); process.exit(1) }
  console.log('check-syllabus-manifest-brackets: self-test OK (2 of 2 injected splits caught)')
  process.exit(0)
}

const M = JSON.parse(readFileSync(join(ROOT, 'lib', 'data', 'syllabus-manifest.json'), 'utf8'))
const { n, bad } = scan(M)
if (bad.length) {
  console.error(`check-syllabus-manifest-brackets: FAIL. ${bad.length} of ${n} subject name(s) have unbalanced brackets:`)
  for (const b of bad) console.error('  ' + b)
  console.error('\n  Join each run of fragments back into one name with ", " (opening piece to closing piece).')
  process.exit(1)
}
console.log(`check-syllabus-manifest-brackets: OK (${n} subject names, all brackets balanced).`)
