// Run with: npx tsx lib/seo-title-builder.test.ts
import assert from 'node:assert/strict'
import {
  buildUniTitle,
  buildUniDescription,
  buildVerifyTitle,
  buildVerifyDescription,
  buildComparePairTitle,
  buildComparePairDescription,
  buildCompareListTitle,
  buildBestHubTitle,
  buildBestHubDescription,
  formatINR,
  validNirf,
  pickBetterNirf,
  getShortName,
  type UniLike,
} from './seo-title-builder'

// ── formatINR ────────────────────────────────────────────────────────────────
assert.equal(formatINR(225000), '₹2.25L')
assert.equal(formatINR(207000), '₹2.07L')
assert.equal(formatINR(200000), '₹2L')
assert.equal(formatINR(150000), '₹1.5L')
assert.equal(formatINR(66000), '₹66K')
assert.equal(formatINR(0), null)
assert.equal(formatINR(null), null)
assert.equal(formatINR(undefined), null)
console.log('PASS · formatINR')

// ── validNirf / pickBetterNirf ──────────────────────────────────────────────
assert.equal(validNirf(22), true)
assert.equal(validNirf(101), false)
assert.equal(validNirf(999), false)
console.log('PASS · validNirf')

// ── Test fixtures ───────────────────────────────────────────────────────────
const amity: UniLike = {
  id: 'amity-university-online',
  name: 'Amity University Online',
  abbr: 'AUO',
  naac: 'A+', nirf: 22, nirfMgt: 49,
  feeMin: 207000, feeMax: 225000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A+', 'AICTE'],
} as any

const nmims: UniLike = {
  id: 'nmims-online', name: 'NMIMS Online', abbr: 'NMIMS',
  naac: 'A++', nirf: 52, nirfMgt: 24,
  feeMin: 196000, feeMax: 220000,
  ugc: true, approvals: ['UGC DEB'],
} as any

const lpu: UniLike = {
  id: 'lovely-professional-university-online',
  name: 'Lovely Professional University Online', abbr: 'LPUO',
  naac: 'A++', nirf: 31, nirfMgt: 44,
  feeMin: 161600, feeMax: 200000,
  ugc: true, approvals: ['UGC DEB'],
} as any

const ignou: UniLike = {
  id: 'ignou-online', name: 'IGNOU Online', abbr: 'IGNOU',
  naac: 'A++', nirf: 999,
  feeMin: 66000, feeMax: 66000,
  ugc: true, approvals: ['UGC DEB'],
} as any

const sikkim: UniLike = {
  id: 'sikkim-manipal-university-online',
  name: 'Sikkim Manipal University Online', abbr: 'SMUOM',
  naac: 'A+', nirf: 999,
  feeMin: 120000, feeMax: 120000,
  ugc: true, approvals: ['UGC DEB'],
} as any

// ── pickBetterNirf ──────────────────────────────────────────────────────────
assert.equal(pickBetterNirf(amity, 'MBA'), 22)
assert.equal(pickBetterNirf(nmims, 'MBA'), 24)
assert.equal(pickBetterNirf(lpu, 'MBA'), 31)
assert.equal(pickBetterNirf(ignou, 'MBA'), null)
assert.equal(pickBetterNirf(nmims, 'MCA'), 52, 'MCA ignores nirfMgt')
console.log('PASS · pickBetterNirf')

// ── buildUniTitle (listy-keyword) ───────────────────────────────────────────
const tAmity = buildUniTitle(amity, 'MBA', 2026)
console.log('  →', JSON.stringify(tAmity), `(${tAmity.length} chars)`)
assert.equal(tAmity, 'Amity Online MBA 2026: Fees, Eligibility, Admission')
assert.ok(tAmity.length <= 60)

const tNmims = buildUniTitle(nmims, 'MBA', 2026)
console.log('  →', JSON.stringify(tNmims), `(${tNmims.length} chars)`)
assert.equal(tNmims, 'NMIMS Online MBA 2026: Fees, Eligibility, Admission')

const tSikkim = buildUniTitle(sikkim, 'MBA', 2026)
console.log('  →', JSON.stringify(tSikkim), `(${tSikkim.length} chars)`)
assert.ok(tSikkim.length <= 60)
console.log('PASS · buildUniTitle listy-keyword pattern')

// ── buildUniDescription (carries differentiation) ───────────────────────────
const dAmity = buildUniDescription(amity, 'MBA', 2026, 60)
console.log('  →', JSON.stringify(dAmity), `(${dAmity.length} chars)`)
assert.ok(dAmity.includes('NAAC A+'))
assert.ok(dAmity.includes('NIRF #22'))
assert.ok(dAmity.includes('Fees ₹2.25L'), 'should use feeMax (225000) not feeMin (207000)')
assert.ok(dAmity.includes('Independent verification, no commissions'))
assert.ok(dAmity.length <= 155, `desc must be ≤155, got ${dAmity.length}`)
console.log('PASS · Amity description uses feeMax (₹2.25L) and trust phrases')

const dIgnou = buildUniDescription(ignou, 'MBA', 2026, 60)
console.log('  →', JSON.stringify(dIgnou), `(${dIgnou.length} chars)`)
assert.ok(dIgnou.includes('Fees ₹66K'), 'IGNOU after fix should show ₹66K')
assert.ok(!dIgnou.includes('NIRF'), 'IGNOU has no NIRF')
console.log('PASS · IGNOU description shows corrected ₹66K total fee')

const dLpu = buildUniDescription(lpu, 'MBA', 2026, 60)
console.log('  →', JSON.stringify(dLpu), `(${dLpu.length} chars)`)
assert.ok(dLpu.includes('Fees ₹2L'), 'LPU description uses feeMax (200000)')

// ── verify / compare / list / hub builders ──────────────────────────────────
const vT = buildVerifyTitle('Amity', 'MBA', 2026)
console.log('  →', JSON.stringify(vT), `(${vT.length} chars)`)
assert.equal(vT, 'Is Amity Online MBA UGC-DEB Approved? 2026')

const vD = buildVerifyDescription('Amity', 2026)
console.log('  →', JSON.stringify(vD), `(${vD.length} chars)`)
assert.ok(vD.length <= 155)
assert.ok(!vD.includes('—'), 'no em dash')

const cpT = buildComparePairTitle('Amity', 'NMIMS', 'MBA', 2026)
console.log('  →', JSON.stringify(cpT), `(${cpT.length} chars)`)
assert.ok(cpT.length <= 60)
assert.equal(cpT, 'Amity vs NMIMS Online MBA 2026: Fees, Reviews & Comparison')

const cpD = buildComparePairDescription('Amity', 'NMIMS', 'MBA', 2026)
console.log('  →', JSON.stringify(cpD), `(${cpD.length} chars)`)
assert.ok(cpD.length <= 155)

const clT = buildCompareListTitle('MBA', 2026)
console.log('  →', JSON.stringify(clT), `(${clT.length} chars)`)
// User's literal compare-list pattern lands at 62 chars; ≤65 acceptable
// pending user confirmation. Flagged in the 8-sample gate.
assert.ok(clT.length <= 65, `compare list title length: ${clT.length}`)

const bhT = buildBestHubTitle(2026)
console.log('  →', JSON.stringify(bhT), `(${bhT.length} chars)`)
// User's literal best-MBA hub pattern lands at 65 chars; flagged for review.
assert.ok(bhT.length <= 70, `best-MBA hub title length: ${bhT.length}`)

const bhD = buildBestHubDescription(2026)
console.log('  →', JSON.stringify(bhD), `(${bhD.length} chars)`)
assert.ok(bhD.length <= 155)
assert.ok(!bhD.includes('—'), 'em dash replaced with comma')

console.log('\nAll seo-title-builder tests passed.')
