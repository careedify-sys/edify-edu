// Phase 0 — verify NIRF/NAAC/fee/short-name/UGC fields for the title builder.
// Run with: npx tsx scripts/verify-title-data.ts
import { UNIVERSITIES } from '../lib/data'
import { TITLE_NAME } from '../lib/seo-title'

const total = UNIVERSITIES.length
const missing = {
  shortName: [] as string[],
  naac: [] as string[],
  nirf: [] as string[],
  feeMin: [] as string[],
  ugcDebFlag: [] as string[],
}

let nirfTop100 = 0
let nirfMgtTop100 = 0
let anyNirfTop100 = 0

for (const u of UNIVERSITIES) {
  if (!TITLE_NAME[u.id]) missing.shortName.push(u.id)
  if (!u.naac || !u.naac.trim()) missing.naac.push(u.id)
  const hasUniNirf = !!u.nirf && u.nirf > 0 && u.nirf < 900
  const hasMgtNirf = !!u.nirfMgt && u.nirfMgt > 0 && u.nirfMgt < 900
  if (!hasUniNirf && !hasMgtNirf) missing.nirf.push(u.id)
  if (hasUniNirf && (u.nirf as number) <= 100) nirfTop100 += 1
  if (hasMgtNirf && (u.nirfMgt as number) <= 100) nirfMgtTop100 += 1
  if ((hasUniNirf && (u.nirf as number) <= 100) || (hasMgtNirf && (u.nirfMgt as number) <= 100)) anyNirfTop100 += 1
  if (!u.feeMin || u.feeMin <= 0) missing.feeMin.push(u.id)
  const approvals = (u.approvals || []).map(a => a.toUpperCase())
  const ugcDeb = u.ugc === true || approvals.some(a => a.includes('UGC') && (a.includes('DEB') || a === 'UGC'))
  if (!ugcDeb) missing.ugcDebFlag.push(u.id)
}

console.log(`Total universities: ${total}\n`)
console.log(`shortName (TITLE_NAME map):     ${total - missing.shortName.length}/${total} present`)
console.log(`naac:                           ${total - missing.naac.length}/${total} present`)
console.log(`nirf (in-range integer 1-899):  ${total - missing.nirf.length}/${total} present`)
console.log(`feeMin (>0):                    ${total - missing.feeMin.length}/${total} present`)
console.log(`UGC-DEB (flag or approvals):    ${total - missing.ugcDebFlag.length}/${total} present`)
console.log()
console.log(`NIRF eligibility for title (rank ≤100):`)
console.log(`  University NIRF ≤100:         ${nirfTop100}/${total}`)
console.log(`  Management NIRF ≤100:         ${nirfMgtTop100}/${total}`)
console.log(`  Either ≤100 (used in title):  ${anyNirfTop100}/${total}`)
console.log()

function dump(label: string, arr: string[]) {
  if (arr.length === 0) return
  console.log(`--- Missing ${label} (${arr.length}) ---`)
  for (const id of arr.slice(0, 30)) console.log(`  ${id}`)
  if (arr.length > 30) console.log(`  ... +${arr.length - 30} more`)
  console.log()
}
dump('shortName', missing.shortName)
dump('naac', missing.naac)
dump('nirf', missing.nirf)
dump('feeMin', missing.feeMin)
dump('UGC-DEB', missing.ugcDebFlag)
