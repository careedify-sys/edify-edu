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
  isTechProgram,
  getApprovalSignal,
  getDisplayFee,
  getShortName,
  type UniLike,
} from './seo-title-builder'

// ── formatINR ────────────────────────────────────────────────────────────────
assert.equal(formatINR(207000), '₹2.07L')
assert.equal(formatINR(196000), '₹1.96L')
assert.equal(formatINR(161600), '₹1.62L')
assert.equal(formatINR(120000), '₹1.2L')
assert.equal(formatINR(66000), '₹66K')
assert.equal(formatINR(0), null)
console.log('PASS · formatINR L / null cases')

// ── Sprint 2 P3 rounding for sub-₹1L values ────────────────────────────────
assert.equal(formatINR(49800), '₹49.8K', '₹49,800 → 1-decimal precision')
assert.equal(formatINR(49750), '₹49.8K', '₹49,750 → rounded to .8')
assert.equal(formatINR(50000), '₹50K',   '₹50,000 → no trailing .0')
assert.equal(formatINR(50800), '₹50.8K', '₹50,800 → 1-decimal')
assert.equal(formatINR(66000), '₹66K',   '₹66,000 → integer (no decimal)')
assert.equal(formatINR(83200), '₹83.2K', '₹83,200 → 1-decimal')
assert.equal(formatINR(74000), '₹74K',   '₹74,000 → integer')
console.log('PASS · formatINR P3 rounding (sub-₹1L 1-decimal precision)')

// ── isTechProgram ───────────────────────────────────────────────────────────
assert.equal(isTechProgram('MBA'), false)
assert.equal(isTechProgram('BBA'), false)
assert.equal(isTechProgram('MCA'), true)
assert.equal(isTechProgram('BCA'), true)
assert.equal(isTechProgram('mca'), true)
console.log('PASS · isTechProgram')

// ── Test fixtures ───────────────────────────────────────────────────────────
const amity: UniLike = {
  id: 'amity-university-online', uniType: 'private',
  name: 'Amity University Online', abbr: 'AUO',
  naac: 'A+', nirf: 22, nirfMgt: 49,
  feeMin: 207000, feeMax: 225000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A+', 'AICTE', 'WES Recognised'],
} as any

const nmims: UniLike = {
  id: 'nmims-online', uniType: 'deemed',
  name: 'NMIMS Online', abbr: 'NMIMS',
  naac: 'A++', nirf: 52, nirfMgt: 24,
  feeMin: 196000, feeMax: 220000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A++', 'AICTE'],
} as any

const lpu: UniLike = {
  id: 'lovely-professional-university-online', uniType: 'private',
  name: 'Lovely Professional University Online', abbr: 'LPUO',
  naac: 'A++', nirf: 31, nirfMgt: 44,
  feeMin: 161600, feeMax: 200000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A++', 'AICTE'],
} as any

const ignou: UniLike = {
  id: 'ignou-online', uniType: 'open',
  name: 'IGNOU Online', abbr: 'IGNOU',
  naac: 'A++', nirf: 999,
  feeMin: 66000, feeMax: 66000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A++', 'AICTE', 'Central University'],
} as any

const mahe: UniLike = {
  id: 'manipal-academy-higher-education-online', uniType: 'deemed',
  name: 'MAHE Online', abbr: 'MAHEO',
  naac: 'A++', nirf: 3, nirfMgt: 39,
  feeMin: 292000, feeMax: 292000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A++', 'NIRF #3', 'AICTE'],
} as any

const sikkim: UniLike = {
  id: 'sikkim-manipal-university-online', uniType: 'state-private',
  name: 'Sikkim Manipal University Online', abbr: 'SMUOM',
  naac: 'A+', nirf: 999,
  feeMin: 120000, feeMax: 120000,
  ugc: true, approvals: ['UGC DEB', 'NAAC A+'],
} as any

// ── getDisplayFee uses feeMin (CHANGE 1) ────────────────────────────────────
assert.equal(getDisplayFee(amity), 207000, 'Amity uses feeMin (entry tier)')
assert.equal(getDisplayFee(lpu), 161600, 'LPU uses feeMin (verified)')
console.log('PASS · getDisplayFee uses feeMin')

// ── Phase 2.C: getDisplayFee with programFees ──────────────────────────────
const amityWithFees: UniLike = {
  ...amity,
  programFees: { bca: { fee: 175000 }, mca: { fee: 199000 } },
} as any

// (a) program-specific fee returned when both exist
assert.equal(getDisplayFee(amityWithFees, 'MCA'), 199000, 'programFees.mca takes precedence')
assert.equal(getDisplayFee(amityWithFees, 'BCA'), 175000, 'programFees.bca takes precedence')
assert.equal(getDisplayFee(amityWithFees, 'mca'), 199000, 'lookup is case-insensitive (lower)')

// (b) program key absent in programFees → falls back to feeMin
assert.equal(getDisplayFee(amityWithFees, 'MBA'), 207000, 'no programFees.mba key → feeMin fallback')

// (c) no program arg at all → falls back to feeMin (backward compat)
assert.equal(getDisplayFee(amityWithFees), 207000, 'no program arg → feeMin (backward compatible)')

// (d) uni has no programFees object at all → falls back to feeMin
const amityNoFees: UniLike = { ...amity, programFees: undefined } as any
assert.equal(getDisplayFee(amityNoFees, 'MCA'), 207000, 'no programFees object → feeMin')

console.log('PASS · getDisplayFee Phase 2.C: programFees lookup + 4-tier fallback')

// ── pickBetterNirf ──────────────────────────────────────────────────────────
assert.equal(pickBetterNirf(amity, 'MBA'), 22)
assert.equal(pickBetterNirf(nmims, 'MBA'), 24)
assert.equal(pickBetterNirf(nmims, 'MCA'), 52, 'tech program ignores nirfMgt')
console.log('PASS · pickBetterNirf')

// ── getApprovalSignal ──────────────────────────────────────────────────────
assert.deepEqual(getApprovalSignal(amity, 'MCA'), { label: 'UGC-DEB', integrityFlag: false }, 'Amity (private) MCA: UGC-DEB only')
assert.deepEqual(getApprovalSignal(nmims, 'MCA'), { label: 'AICTE + UGC-DEB', integrityFlag: false }, 'NMIMS (deemed) MCA: AICTE + UGC-DEB')
assert.deepEqual(getApprovalSignal(ignou, 'MCA'), { label: 'UGC-DEB + AICTE', integrityFlag: false }, 'IGNOU (open) MCA: UGC-DEB + AICTE')
assert.deepEqual(getApprovalSignal(mahe, 'MCA'), { label: 'AICTE + UGC-DEB', integrityFlag: false }, 'MAHE (deemed) MCA: AICTE + UGC-DEB')
assert.deepEqual(getApprovalSignal(amity, 'MBA'), { label: 'UGC-DEB', integrityFlag: false }, 'mgmt: no AICTE branching')
console.log('PASS · getApprovalSignal — uniType + program-type branching')

// Integrity flag test — Deemed uni offering MCA without AICTE in approvals.
const deemedNoAicte: UniLike = { ...amity, uniType: 'deemed', approvals: ['UGC DEB', 'NAAC A+'] } as any
assert.deepEqual(getApprovalSignal(deemedNoAicte, 'MCA'), { label: 'UGC-DEB', integrityFlag: true }, 'Deemed-without-AICTE flag')
console.log('PASS · integrity flag fires for Deemed missing AICTE')

// ── Management titles (CHANGE 1, 3) ────────────────────────────────────────
const tAmity = buildUniTitle(amity, 'MBA', 2026)
console.log('  →', JSON.stringify(tAmity), `(${tAmity.length} chars)`)
assert.equal(tAmity, 'Amity Online MBA 2026: Fees, Eligibility, Admission')

const dAmity = buildUniDescription(amity, 'MBA', 2026, 130)
console.log('  →', JSON.stringify(dAmity), `(${dAmity.length} chars)`)
assert.ok(dAmity.includes('Fees ₹2.07L'), 'CHANGE 1: feeMin (₹2.07L) not feeMax (₹2.25L)')
assert.ok(dAmity.includes('Compare 130+ UGC-DEB universities'), 'CHANGE 3: catalogue count text')
assert.ok(dAmity.length <= 155)
console.log('PASS · Amity MBA description uses feeMin and catalogue text')

const dLpu = buildUniDescription(lpu, 'MBA', 2026, 130)
console.log('  →', JSON.stringify(dLpu), `(${dLpu.length} chars)`)
assert.ok(dLpu.includes('Fees ₹1.62L'), 'LPU description shows ₹1.62L (verified)')

// ── Tech program titles (uniType branching) ───────────────────────────────
const tAmityMca = buildUniTitle(amity, 'MCA', 2026)
console.log('  →', JSON.stringify(tAmityMca), `(${tAmityMca.length} chars)`)
assert.ok(!tAmityMca.includes('AICTE'), 'Amity MCA must NOT include AICTE (private)')
assert.ok(tAmityMca.includes('UGC-DEB'))
assert.ok(tAmityMca.length <= 60)

const tNmimsMca = buildUniTitle(nmims, 'MCA', 2026)
console.log('  →', JSON.stringify(tNmimsMca), `(${tNmimsMca.length} chars)`)
assert.ok(tNmimsMca.includes('AICTE + UGC-DEB'), 'NMIMS MCA: AICTE + UGC-DEB (deemed)')
assert.ok(tNmimsMca.length <= 60)

const tIgnouMca = buildUniTitle(ignou, 'MCA', 2026)
console.log('  →', JSON.stringify(tIgnouMca), `(${tIgnouMca.length} chars)`)
assert.ok(tIgnouMca.includes('UGC-DEB + AICTE'), 'IGNOU MCA: UGC-DEB + AICTE (open)')
assert.ok(tIgnouMca.length <= 60)

const tMaheMca = buildUniTitle(mahe, 'MCA', 2026)
console.log('  →', JSON.stringify(tMaheMca), `(${tMaheMca.length} chars)`)
assert.ok(tMaheMca.includes('AICTE + UGC-DEB'), 'MAHE MCA: AICTE + UGC-DEB (deemed)')

// ── Tech program descriptions ─────────────────────────────────────────────
const dAmityMca = buildUniDescription(amity, 'MCA', 2026, 130)
console.log('  →', JSON.stringify(dAmityMca), `(${dAmityMca.length} chars)`)
assert.ok(!dAmityMca.includes('AICTE'), 'Amity MCA description: no AICTE claim')
assert.ok(dAmityMca.length <= 155)

const dNmimsMca = buildUniDescription(nmims, 'MCA', 2026, 130)
console.log('  →', JSON.stringify(dNmimsMca), `(${dNmimsMca.length} chars)`)
assert.ok(dNmimsMca.includes('AICTE + UGC-DEB approved Deemed University'))
assert.ok(dNmimsMca.length <= 155)

const dIgnouMca = buildUniDescription(ignou, 'MCA', 2026, 130)
console.log('  →', JSON.stringify(dIgnouMca), `(${dIgnouMca.length} chars)`)
assert.ok(dIgnouMca.includes('UGC-DEB + AICTE approved'))
assert.ok(dIgnouMca.length <= 155)

// ── CHANGE 2: overflow tweaks ──────────────────────────────────────────────
const clT = buildCompareListTitle('MBA', 2026)
console.log('  →', JSON.stringify(clT), `(${clT.length} chars)`)
assert.equal(clT, 'Compare Online MBA 2026: Fees, Rankings & Reviews')
assert.ok(clT.length <= 60, `compare list ≤60: ${clT.length}`)

const bhT = buildBestHubTitle(2026)
console.log('  →', JSON.stringify(bhT), `(${bhT.length} chars)`)
assert.equal(bhT, 'Online MBA Colleges in India 2026: Fees, Rankings & Admission')
assert.ok(bhT.length <= 65, `best-MBA ≤65 (60+1 for 'Online'): ${bhT.length}`)

console.log('\nAll seo-title-builder tests passed.')
