// scripts/check-first-hand.mjs
//
// Gate for Rishi's first-hand copy in lib/data/first-hand/. Two rules:
//   1. No rupee figures. A typed amount goes stale silently; amounts are
//      {{tokens}} filled from lib/data.ts by lib/first-hand.ts. Blocks ₹, Rs,
//      Rs. and INR followed by a digit, in either order ("INR 1,100", "1,100 INR").
//   2. No em dashes (house style).
// Also re-checks lib/data/ugc-deb-extract.json against the workbook, so the
// approvals table cannot drift from UGC_DEB_Online_Programmes_AY2025-26.xlsx.
//
// Self-test: the patterns must catch the planted samples below, or the gate
// reports itself broken instead of passing everything (a validator that
// counted zero shipped once; see audits/FIX-LOG.md).
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'lib', 'data', 'first-hand')

const RUPEE = /(₹|\bRs\.?|\bINR)\s*\d|\d[\d,]*\s*(INR|Rs\.?)(?![a-z])/
const EM_DASH = /—/

const mustCatch = ['Pay ₹1,100 now', 'Rs 1,100', 'Rs.1100', 'INR 1100', '1,100 INR', 'a — b']
const mustPass = ['more than 2,50,000 learners', 'Pay {{registration}}', '450+ hiring partners', 'Mrs Rao', 'INRA']
const broken = [
  ...mustCatch.filter(t => !RUPEE.test(t) && !EM_DASH.test(t)).map(t => `missed: ${t}`),
  ...mustPass.filter(t => RUPEE.test(t) || EM_DASH.test(t)).map(t => `false hit: ${t}`),
]
if (broken.length) {
  console.error('check-first-hand: self-test failed, the patterns are broken:\n  ' + broken.join('\n  '))
  process.exit(1)
}

const problems = []
const files = readdirSync(dir).filter(f => /\.(ts|tsx|json)$/.test(f))
for (const f of files) {
  readFileSync(join(dir, f), 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (RUPEE.test(line)) problems.push(`${f}:${i + 1} rupee figure: ${line.trim().slice(0, 120)}`)
    if (EM_DASH.test(line)) problems.push(`${f}:${i + 1} em dash: ${line.trim().slice(0, 120)}`)
  })
}
if (problems.length) {
  console.error('check-first-hand: lib/data/first-hand/ must hold no rupee figures (use a {{token}}) and no em dashes:\n  ' + problems.join('\n  '))
  process.exit(1)
}

try {
  execFileSync(process.execPath, [join(root, 'scripts', 'build-ugc-deb-extract.mjs'), '--check'], { stdio: 'pipe' })
} catch (e) {
  console.error(String(e.stderr || e.message).trim())
  process.exit(1)
}
console.log(`check-first-hand: OK (${files.length} file(s), no rupee figures or em dashes; UGC-DEB extract current)`)
