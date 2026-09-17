// scripts/check-page-content-json.mjs
//
// Every file in lib/data/page-content/ must be valid JSON.
//
// Why this gate exists: getSpecPageContent() in lib/data/page-content.ts wraps
// JSON.parse in a bare `try { ... } catch { return null }`. A null return is
// indistinguishable from "no content file exists", so an unparseable file makes
// UniSpecBody.tsx silently render the generic thin fallback while the file sits
// on disk looking complete. On 2026-09-17 that had happened to 35 files (all 26
// Chandigarh and 9 Symbiosis MBA spec pages), each with a literal CR/LF pair
// unescaped inside a string value. They were indexed thin pages that every
// existsSync-based coverage audit had been counting as rich.
//
// The failure mode is silence, so the only reliable defence is parsing every
// file before it can be committed.
//
// Run: node scripts/check-page-content-json.mjs
// Wired into: .husky/pre-commit

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'lib', 'data', 'page-content')

if (!existsSync(DIR)) {
  console.error('check-page-content-json: lib/data/page-content/ not found')
  process.exit(1)
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json'))
const bad = []
let empty = 0

for (const f of files) {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(join(DIR, f), 'utf8'))
  } catch (e) {
    bad.push([f, e.message])
    continue
  }
  // A file that parses to nothing useful is the same defect wearing a different hat:
  // the page renders the fallback and the audit still counts the file.
  if (!parsed || typeof parsed !== 'object' || !parsed.sections || Object.keys(parsed.sections).length === 0) {
    bad.push([f, 'parses but has no sections'])
    empty++
  }
}

if (bad.length) {
  console.error(`check-page-content-json: FAIL. ${bad.length} of ${files.length} file(s) are unusable:`)
  for (const [f, msg] of bad) console.error(`  ${f}\n      ${msg}`)
  console.error('')
  console.error('  These files exist on disk but getSpecPageContent() returns null for them,')
  console.error('  so the spec pages render the thin generic fallback while looking complete.')
  console.error('  Usual cause: a literal newline or control character inside a JSON string value.')
  process.exit(1)
}

console.log(`check-page-content-json: OK (${files.length} files parse and carry sections).`)
