#!/usr/bin/env node
// scripts/check-em-dash.js
// Pre-commit house style check: no em dashes in staged content changes.
// House rule: never use em dashes in any content. Existing legacy occurrences
// are not flagged; only ADDED lines in the staged diff are checked.
//
// Run standalone: node scripts/check-em-dash.js

const { execSync } = require('child_process')

const TEXT_EXT = /\.(tsx?|jsx?|md|mdx|json|html|css|txt|sql|yml|yaml)$/i
// Paths where legacy em dashes are grandfathered or content is machine-written
const SKIP = /^(node_modules|\.next|audits|audit-output|audit-data|reports|content\/blogs|lib\/blog\.ts)/

let files = []
try {
  files = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .split('\n').filter(Boolean)
} catch {
  process.exit(0)
}

let bad = 0
for (const f of files) {
  if (!TEXT_EXT.test(f) || SKIP.test(f)) continue
  let diff = ''
  try {
    diff = execSync(`git diff --cached -U0 -- "${f}"`, { encoding: 'utf8' })
  } catch { continue }
  const lines = diff.split('\n')
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++') && line.includes('\u2014')) {
      bad++
      console.error(`em dash in staged change: ${f}: ${line.slice(1, 120).trim()}`)
    }
  }
}

if (bad > 0) {
  console.error(`\ncheck-em-dash: ${bad} added line(s) contain an em dash. Replace with a period, comma, or and/but/or.`)
  process.exit(1)
}
console.log('check-em-dash: OK')
