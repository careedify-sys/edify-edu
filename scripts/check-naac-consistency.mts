// scripts/check-naac-consistency.mts
//
// Blocks a university string that names a NAAC grade other than the record's
// own `naac` field.
//
// Why. On 2026-11-13, 25 university descriptions said "NAAC X accredited"
// where X disagreed with the `naac` field, and both rendered on the same page:
// the Bharati Vidyapeeth page printed "NAAC A+ accredited" beside an A++
// badge. A page that contradicts itself is the page an AI answer skips. The
// description text was typed by an importer and never re-derived when the
// grade field was corrected.
//
// Scope: every reader-facing string of a lib/data.ts record (description,
// tagline, careerOutcome, eligibility, forWho, notFor, approvals,
// rankingBadge) and the approvals of the matching lib/data-slim.ts record.
// A record with no grade must not claim one.
//
// Run: npx tsx scripts/check-naac-consistency.mts
// Wired into: .husky/pre-commit

import { UNIVERSITIES } from '../lib/data'
import { UNIS_SLIM } from '../lib/data-slim'

const GRADE = /NAAC\s+(A\+\+|A\+|A|B\+\+|B\+|B|C)(?![+\w])/g

type Hit = { id: string; field: string; said: string; naac: string; text: string }
const hits: Hit[] = []

function scan(id: string, naac: string, field: string, text: string | undefined) {
  if (!text) return
  for (const m of text.matchAll(GRADE)) {
    if (m[1] !== naac) hits.push({ id, field, said: m[1], naac: naac || '(none)', text })
  }
}

for (const u of UNIVERSITIES) {
  const naac = String(u.naac || '')
  scan(u.id, naac, 'description', u.description)
  scan(u.id, naac, 'tagline', u.tagline)
  scan(u.id, naac, 'eligibility', u.eligibility)
  scan(u.id, naac, 'rankingBadge', u.rankingBadge)
  for (const s of u.approvals || []) scan(u.id, naac, 'approvals', s)
  for (const s of u.forWho || []) scan(u.id, naac, 'forWho', s)
  for (const s of u.notFor || []) scan(u.id, naac, 'notFor', s)
  for (const [p, d] of Object.entries(u.programDetails)) scan(u.id, naac, `programDetails.${p}.careerOutcome`, d?.careerOutcome)
}

const byId = new Map(UNIVERSITIES.map(u => [u.id, u]))
for (const s of UNIS_SLIM) {
  const u = byId.get(s.id)
  if (!u) continue
  for (const a of (s as { approvals?: string[] }).approvals || []) scan(s.id, String(u.naac || ''), 'data-slim approvals', a)
}

console.log(`check-naac-consistency: ${UNIVERSITIES.length} records, ${hits.length} mismatch(es).`)
if (!hits.length) process.exit(0)
for (const h of hits) {
  console.error(`  ${h.id}  .${h.field}  says NAAC ${h.said}, naac field is ${h.naac}`)
  console.error(`    "${h.text.slice(0, 140)}"`)
}
console.error('\nThe naac field is the grade. Fix the string to match it, or fix the field if the')
console.error('field is wrong (check naac.gov.in and the Supabase record first).')
process.exit(1)
