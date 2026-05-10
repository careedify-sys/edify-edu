// Phase 1 gate — print title + description side-by-side for 8 samples.
// Run with: npx tsx scripts/sanity-check-titles.ts
import { getUniversityById, getUniversitiesByProgram } from '../lib/data'
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
  getShortName,
} from '../lib/seo-title-builder'

const YEAR = 2026
const PROGRAM = 'MBA'
const COMPARE_COUNT = Math.max(0, getUniversitiesByProgram(PROGRAM).length - 1)
const COMPARE_ANCHOR = Math.floor(COMPARE_COUNT / 5) * 5 // round down to nearest 5

function row(idx: number, label: string, id: string) {
  const uni = getUniversityById(id)
  console.log(`\n──── ${idx}. ${label} ────`)
  if (!uni) {
    console.log(`  <not in UNIVERSITIES — skipping>`)
    return
  }
  const t = buildUniTitle(uni, PROGRAM, YEAR)
  const d = buildUniDescription(uni, PROGRAM, YEAR, COMPARE_ANCHOR)
  const tFlag = t.length > 60 ? ' ⚠ over 60' : ''
  const dFlag = d.length > 155 ? ' ⚠ over 155' : ''
  console.log(`  feeMin: ${uni.feeMin}  feeMax: ${uni.feeMax}  short: "${getShortName(uni)}"`)
  console.log(`  TITLE (${t.length} chars${tFlag})`)
  console.log(`    ${t}`)
  console.log(`  DESC  (${d.length} chars${dFlag})`)
  console.log(`    ${d}`)
}

console.log('================ 8-SAMPLE GATE (Phase 1.5) ================')
console.log(`year=${YEAR}  program=${PROGRAM}  compareAnchor=${COMPARE_ANCHOR}+`)

row(1, 'Amity MBA',           'amity-university-online')
row(2, 'NMIMS MBA',           'nmims-online')
row(3, 'LPU MBA',             'lovely-professional-university-online')
row(4, 'IGNOU MBA',           'ignou-online')
row(5, 'Sikkim Manipal MBA',  'sikkim-manipal-university-online')
row(6, 'MAHE MBA',            'manipal-academy-higher-education-online')

console.log(`\n──── 7. Verify page sample (Amity MBA) ────`)
const vT = buildVerifyTitle('Amity', 'MBA', YEAR)
const vD = buildVerifyDescription('Amity', YEAR)
const vTFlag = vT.length > 60 ? ' ⚠ over 60' : ''
const vDFlag = vD.length > 155 ? ' ⚠ over 155' : ''
console.log(`  TITLE (${vT.length} chars${vTFlag})`)
console.log(`    ${vT}`)
console.log(`  DESC  (${vD.length} chars${vDFlag})`)
console.log(`    ${vD}`)

console.log(`\n──── 8. Compare pair sample (Amity vs NMIMS, MBA) ────`)
const cpT = buildComparePairTitle('Amity', 'NMIMS', 'MBA', YEAR)
const cpD = buildComparePairDescription('Amity', 'NMIMS', 'MBA', YEAR)
const cpTFlag = cpT.length > 60 ? ' ⚠ over 60' : ''
const cpDFlag = cpD.length > 155 ? ' ⚠ over 155' : ''
console.log(`  TITLE (${cpT.length} chars${cpTFlag})`)
console.log(`    ${cpT}`)
console.log(`  DESC  (${cpD.length} chars${cpDFlag})`)
console.log(`    ${cpD}`)

console.log('\n──── EXTRA · Compare list page (no params) ────')
const clT = buildCompareListTitle('MBA', YEAR)
console.log(`  TITLE (${clT.length} chars${clT.length > 60 ? ' ⚠ over 60' : ''})`)
console.log(`    ${clT}`)

console.log('\n──── EXTRA · Best-MBA hub ────')
const bhT = buildBestHubTitle(YEAR)
const bhD = buildBestHubDescription(YEAR)
console.log(`  TITLE (${bhT.length} chars${bhT.length > 60 ? ' ⚠ over 60' : ''})`)
console.log(`    ${bhT}`)
console.log(`  DESC  (${bhD.length} chars${bhD.length > 155 ? ' ⚠ over 155' : ''})`)
console.log(`    ${bhD}`)

console.log('\n================ END ================')
