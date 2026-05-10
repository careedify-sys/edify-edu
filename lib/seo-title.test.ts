// Run with: npx tsx lib/seo-title.test.ts
import assert from 'node:assert/strict'
import { clampTitle } from './seo-title'

const longTitle =
  'Amity University Online MBA Fees & Syllabus 2026 Plan Compare Options | EdifyEdu'
assert.ok(longTitle.length >= 80, `fixture should be ≥80 chars, got ${longTitle.length}`)

const out = clampTitle(longTitle)
assert.ok(
  out.endsWith(' | EdifyEdu'),
  `expected output to end with " | EdifyEdu", got: ${JSON.stringify(out)}`,
)
assert.ok(
  out.length <= 60,
  `expected output length ≤ 60, got ${out.length}: ${JSON.stringify(out)}`,
)
console.log('PASS · long title preserves brand suffix:', JSON.stringify(out), `(${out.length} chars)`)

const shortTitle = 'Short Page Title | EdifyEdu'
assert.equal(clampTitle(shortTitle), shortTitle, 'short title should be returned as-is')
console.log('PASS · short title returned as-is')

const noBrandTitle =
  'A very long title without any brand separator at all that absolutely needs clamping for SERP'
const noBrandOut = clampTitle(noBrandTitle)
assert.ok(
  noBrandOut.length <= 60,
  `no-brand: expected length ≤ 60, got ${noBrandOut.length}`,
)
console.log('PASS · no-brand title clamped to ≤60:', JSON.stringify(noBrandOut), `(${noBrandOut.length} chars)`)

// Body has a single space at position 1 then a 60-char unbreakable token.
// The word-boundary trim leaves only "X" (1 char), well below minBodyLen (48),
// so clampTitle must drop the brand and emit a console warning.
const unbreakable = 'X ' + 'Y'.repeat(60) + ' | EdifyEdu'
const originalWarn = console.warn
let warnCount = 0
let lastWarn = ''
console.warn = (msg: any) => {
  warnCount += 1
  lastWarn = String(msg)
}
try {
  const fbOut = clampTitle(unbreakable, 60, 'test-slug')
  assert.ok(fbOut.length <= 60, `fallback: expected length ≤ 60, got ${fbOut.length}`)
  assert.ok(warnCount >= 1, 'expected console.warn to be called when brand was dropped')
  assert.ok(lastWarn.includes('test-slug'), `expected warning to mention slug, got: ${lastWarn}`)
} finally {
  console.warn = originalWarn
}
console.log('PASS · fallback path drops brand and logs warning with slug')

console.log('\nAll clampTitle tests passed.')
