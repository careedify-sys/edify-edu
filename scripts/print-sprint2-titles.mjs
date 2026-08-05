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
import { getTitleName, clampTitle, clampDescription } from '../lib/seo-title.ts'

const YEAR = new Date().getFullYear()

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
  ['dr-dy-patil-vidyapeeth-online',     'BBA'],
]

const SUPPRESSED_INTENT = [
  ['gls-university-online',             'BBA'],
  ['gls-university-online',             'BCA'],
  ['gls-university-online',             'B.Com'],
  ['ignou-online',                      'MCA'],
]

function titleFor(u, program, fee) {
  const titleName = getTitleName(u.id, u.name, u.abbr)
  return fee.ok
    ? clampTitle(`${titleName} Online ${program} Fees ${YEAR}: ${fee.compact}, NAAC ${u.naac} [Review] | edifyedu.in`)
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

const t1 = render(BACKFILLED,        '12 backfilled pages (verified fees applied)')
const t2 = render(SUPPRESSED_INTENT, '4 intentionally-suppressed pages (counsellor CTA shown)')

const all = [...t1, ...t2]
const sha = createHash('sha256').update(all.join('\n')).digest('hex')

console.log('---')
console.log(`Title-set SHA-256 (16 titles, newline-joined):`)
console.log(`  ${sha}`)
console.log(`Title count: ${all.length}`)
