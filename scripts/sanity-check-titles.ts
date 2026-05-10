// Phase 1.D-F gate — print 12 sample title+description pairs.
// Run with: npx tsx scripts/sanity-check-titles.ts
import { UNIVERSITIES, getUniversityById } from '../lib/data'
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
  getApprovalSignal,
  getDisplayFee,
  getShortName,
  formatINR,
} from '../lib/seo-title-builder'

const YEAR = 2026
// Catalogue size, rounded down to nearest 5 (CHANGE 3).
const CATALOGUE_COUNT = Math.floor(UNIVERSITIES.length / 5) * 5

function row(idx: number, label: string, id: string, program: string) {
  const uni = getUniversityById(id)
  console.log(`\n──── ${idx}. ${label} ────`)
  if (!uni) {
    console.log(`  <not in UNIVERSITIES — skipping>`)
    return
  }
  const t = buildUniTitle(uni, program, YEAR)
  const d = buildUniDescription(uni, program, YEAR, CATALOGUE_COUNT)
  const sig = getApprovalSignal(uni, program)
  const tFlag = t.length > 60 ? ' ⚠ over 60' : ''
  const dFlag = d.length > 155 ? ' ⚠ over 155' : ''
  const intFlag = sig.integrityFlag ? ' ⚠ DATA INTEGRITY: Deemed uni offering tech program without AICTE in approvals' : ''
  console.log(`  uniType: ${(uni as any).uniType ?? '<unset>'}  short: "${getShortName(uni)}"  feeMin: ${uni.feeMin}  approvalLabel: "${sig.label}"${intFlag}`)
  console.log(`  TITLE (${t.length} chars${tFlag})`)
  console.log(`    ${t}`)
  console.log(`  DESC  (${d.length} chars${dFlag})`)
  console.log(`    ${d}`)
}

console.log('================ 12-SAMPLE GATE (Phase 1.D-F) ================')
console.log(`year=${YEAR}  catalogueAnchor=${CATALOGUE_COUNT}+  totalUnis=${UNIVERSITIES.length}`)

console.log('\n──────── 8 MANAGEMENT samples ────────')
row(1, 'Amity MBA',           'amity-university-online',                'MBA')
row(2, 'NMIMS MBA',           'nmims-online',                           'MBA')
row(3, 'LPU MBA',             'lovely-professional-university-online',  'MBA')
row(4, 'IGNOU MBA',           'ignou-online',                           'MBA')
row(5, 'Sikkim Manipal MBA',  'sikkim-manipal-university-online',       'MBA')
row(6, 'MAHE MBA',            'manipal-academy-higher-education-online','MBA')

console.log(`\n──── 7. Verify page sample (Amity MBA) ────`)
const vT = buildVerifyTitle('Amity', 'MBA', YEAR)
const vD = buildVerifyDescription('Amity', YEAR)
console.log(`  TITLE (${vT.length} chars${vT.length > 60 ? ' ⚠' : ''})`)
console.log(`    ${vT}`)
console.log(`  DESC  (${vD.length} chars${vD.length > 155 ? ' ⚠' : ''})`)
console.log(`    ${vD}`)

console.log(`\n──── 8. Compare pair sample (Amity vs NMIMS, MBA) ────`)
const cpT = buildComparePairTitle('Amity', 'NMIMS', 'MBA', YEAR)
const cpD = buildComparePairDescription('Amity', 'NMIMS', 'MBA', YEAR)
console.log(`  TITLE (${cpT.length} chars${cpT.length > 60 ? ' ⚠' : ''})`)
console.log(`    ${cpT}`)
console.log(`  DESC  (${cpD.length} chars${cpD.length > 155 ? ' ⚠' : ''})`)
console.log(`    ${cpD}`)

console.log('\n──────── 4 TECH (MCA) samples ────────')
row(9,  'Amity MCA  (private — expect: UGC-DEB only, no AICTE claim)',           'amity-university-online',                'MCA')
row(10, 'NMIMS MCA  (deemed — expect: AICTE + UGC-DEB)',                          'nmims-online',                           'MCA')
row(11, 'IGNOU MCA  (open — expect: UGC-DEB + AICTE)',                            'ignou-online',                           'MCA')
row(12, 'MAHE MCA   (deemed — expect: AICTE + UGC-DEB; verify AICTE in approvals)','manipal-academy-higher-education-online','MCA')

// ── Sprint 2 samples: programFees flow-through verification ───────────────
console.log('\n──────── 6 SPRINT 2 BCA/MCA samples (programFees flow-through) ────────')
function sprintRow(idx: number, label: string, id: string, program: string, expected: string) {
  const uni = getUniversityById(id)
  console.log(`\n──── ${idx}. ${label} (expect ${expected}) ────`)
  if (!uni) {
    console.log(`  <not in UNIVERSITIES — skipping>`)
    return
  }
  const programKey = program.toLowerCase() as keyof NonNullable<typeof uni.programFees>
  const programFee = uni.programFees?.[programKey]?.fee
  const resolvedFee = getDisplayFee(uni, program)
  const source = programFee ? `programFees.${programKey}` : 'feeMin (fallback)'
  const t = buildUniTitle(uni, program, YEAR)
  const d = buildUniDescription(uni, program, YEAR, CATALOGUE_COUNT)
  console.log(`  feeSource: ${source}  resolvedFee: ${resolvedFee} → ${formatINR(resolvedFee)}`)
  console.log(`  TITLE (${t.length} chars): ${t}`)
  console.log(`  DESC  (${d.length} chars): ${d}`)
}

sprintRow(13, 'Amity BCA',     'amity-university-online',                 'BCA', '₹1.75L from programFees.bca')
sprintRow(14, 'Amity MCA',     'amity-university-online',                 'MCA', '₹1.99L from programFees.mca')
sprintRow(15, 'MAHE MCA  ★',   'manipal-academy-higher-education-online', 'MCA', '₹2.2L  (was ₹2.92L from feeMin) — KEY FIX')
sprintRow(16, 'IGNOU BCA',     'ignou-online',                            'BCA', '₹49.8K from programFees.bca')
sprintRow(17, 'Galgotias BCA', 'galgotias-university-online',             'BCA', '₹69K  (tuition only — not ₹83.2K total)')
sprintRow(18, 'Galgotias MCA', 'galgotias-university-online',             'MCA', '₹74K  (tuition only — not ₹84.2K total)')

console.log('\n──────── EXTRAS · compare-list + best-MBA hub (CHANGE 2) ────────')
const clT = buildCompareListTitle('MBA', YEAR)
console.log(`Compare list TITLE (${clT.length} chars${clT.length > 60 ? ' ⚠' : ''}): ${clT}`)
const bhT = buildBestHubTitle(YEAR)
const bhD = buildBestHubDescription(YEAR)
console.log(`Best-MBA TITLE     (${bhT.length} chars${bhT.length > 60 ? ' ⚠' : ''}): ${bhT}`)
console.log(`Best-MBA DESC      (${bhD.length} chars${bhD.length > 155 ? ' ⚠' : ''}): ${bhD}`)

console.log('\n================ END ================')
