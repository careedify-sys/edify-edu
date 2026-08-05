// scripts/print-sprint2-titles.mjs
// Sprint 2 verification: renders the title + description for each of the 12
// backfilled uni/programme pages plus the 4 intentionally-suppressed pages,
// then prints the SHA-256 of the newline-joined title set (same format as
// Sprint 1) so Rishi can lock the corpus.
//
// Run: npx tsx scripts/print-sprint2-titles.mjs

import { createHash } from 'node:crypto'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '../lib/seo-title.ts'

const YEAR = new Date().getFullYear()

// 11 backfilled pages that survived the Blocker 1 revert. DPU-COL Pune BBA
// (originally the 12th) was reverted because 7/8 of its content fields were
// unsourced; only the fee itself was verified. It now lives in the CSV as
// DEFERRED, so no title exists for it to render.
const BACKFILLED = [
  ['galgotias-university-online',       'BBA'],
  ['galgotias-university-online',       'BCA'],
  ['kurukshetra-university-online',     'BBA'],
  ['kl-university-online',              'MBA'],
  ['gla-university-online',             'BBA'],
  ['gla-university-online',             'BCA'],
  ['gla-university-online',             'MCA'],
  ['vignan-university-online',          'BCA'],
  ['chandigarh-university-online',      'BCA'],
  ['dy-patil-university-online',        'BBA'],
  ['dy-patil-university-online',        'BCA'],
]

const SUPPRESSED_INTENT = [
  ['gls-university-online',             'BBA'],
  ['gls-university-online',             'BCA'],
  ['gls-university-online',             'B.Com'],
  ['ignou-online',                      'MCA'],
]

// Sprint 1 MBA overrides (literal titles set in lib/mba-seo-overrides.ts).
// Printed here as a regression tripwire: the overrides bypass clampTitle so
// they cannot change from anything we did in Sprint 2, but printing them keeps
// the receipts in one place.
const SPRINT1_MBA_OVERRIDE_SLUGS = [
  'amity-university-online',
  'lovely-professional-university-online',
  'nmims-online',
  'galgotias-university-online',
  'jain-university-online',
  'chandigarh-university-online',
  'dy-patil-university-online',
  'ignou-online',
  'manipal-academy-higher-education-online',
  'sikkim-manipal-university-online',
  'symbiosis-university-online',
]

function titleFor(u, program, fee) {
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  return fee.ok
    ? clampTitleFeeLed(
        `${titleName} Online ${program} Fees ${YEAR}: ${fee.compact}, NAAC ${u.naac} [Review] | edifyedu.in`,
        `${shortName} Online ${program} Fees ${YEAR}: ${fee.compact}, NAAC ${u.naac} [Review] | edifyedu.in`,
        fee.compact ?? null,
      )
    : clampTitle(`${titleName} Online ${program} ${YEAR}: NAAC ${u.naac} [Review] | edifyedu.in`)
}

function descFor(u, program, fee, specCount, nirfStr) {
  return fee.ok
    ? clampDescription(`${titleName(u)} Online ${program} ${YEAR}: ${fee.compact} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved.`)
    : clampDescription(`${titleName(u)} Online ${program} ${YEAR}: ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved.`)
}
function titleName(u) { return getTitleName(u.id, u.name, u.abbr) }

function render(rows, label) {
  console.log('')
  console.log(`## ${label}`)
  console.log('')
  const titles = []
  for (const [slug, program] of rows) {
    const u = UNIVERSITIES.find(x => x.id === slug)
    if (!u) { console.log(`  MISSING: ${slug}`); continue }
    if (!u.programs.includes(program)) { console.log(`  MISSING prog: ${slug}|${program}`); continue }
    const fee = getDisplayFee(u, program)
    const pd = u.programDetails[program]
    const specCount = pd?.specs?.length || 4
    const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
    const t = titleFor(u, program, fee)
    const d = descFor(u, program, fee, specCount, nirfStr)
    titles.push(t)
    console.log(`### ${slug} | ${program}`)
    console.log(`  fee.ok: ${fee.ok}  rule: ${fee.rule ?? '-'}  compact: ${fee.compact ?? '-'}`)
    console.log(`  title (${t.length}c): ${t}`)
    console.log(`  desc  (${d.length}c): ${d}`)
    console.log('')
  }
  return titles
}

console.log('# Sprint 2 title + description dump')
console.log(`# Generated: 2026-08-05  YEAR=${YEAR}`)

const t1 = render(BACKFILLED,        '11 backfilled pages (verified fees applied — DPU-COL BBA reverted per Blocker 1)')
const t2 = render(SUPPRESSED_INTENT, '4 intentionally-suppressed pages (counsellor CTA shown)')

const all = [...t1, ...t2]
const sha = createHash('sha256').update(all.join('\n')).digest('hex')

console.log('---')
console.log(`Title-set SHA-256 (${all.length} titles, newline-joined):`)
console.log(`  ${sha}`)
console.log(`Title count: ${all.length}`)

// ── Sprint 1 regression tripwire ─────────────────────────────────────────
console.log('')
console.log('## Sprint 1 MBA override titles (literal — should be unchanged from main)')
console.log('')
const { MBA_SEO_OVERRIDES } = await import('../lib/mba-seo-overrides.ts')
for (const slug of SPRINT1_MBA_OVERRIDE_SLUGS) {
  const ov = MBA_SEO_OVERRIDES[slug]
  if (!ov) { console.log(`  MISSING override: ${slug}`); continue }
  console.log(`### ${slug} | MBA (literal override)`)
  console.log(`  title (${ov.title.length}c): ${ov.title}`)
  console.log('')
}
const sprint1Sha = createHash('sha256').update(
  SPRINT1_MBA_OVERRIDE_SLUGS
    .map(s => MBA_SEO_OVERRIDES[s]?.title || '')
    .join('\n')
).digest('hex')
console.log('---')
console.log(`Sprint 1 override SHA-256 (${SPRINT1_MBA_OVERRIDE_SLUGS.length} literal titles):`)
console.log(`  ${sprint1Sha}`)
