// scripts/check-data-slim-drift.mts
//
// lib/data-slim.ts (UNIS_SLIM) is a hand-maintained mirror of the university
// records in lib/data.ts, which CODEBASE_MAP invariant 1 names as the master.
// It has no generator. Nothing kept the two in step, and on 2026-10-02 the
// mirror disagreed with the master on 32 of 143 records, with one university
// missing from it altogether.
//
// Why that is not cosmetic: the client programme hubs filter their university
// list on slim.programs, so both drift directions shipped user-facing errors.
//   - Missing entry  -> the university is invisible on its own hub. The MCA hub
//                       was short 8; SPPU and IIIT Bangalore were absent from
//                       the MBA hub entirely.
//   - Extra entry    -> the site advertises a programme the university does not
//                       offer. SASTRA was listed on /programs/mca while the
//                       master has it offering MBA only; Chitkara appeared on
//                       the B.Com and BCA hubs.
// IIIT Bangalore managed both at once: tagged MCA when it offers MBA.
//
// Accreditation and fee fields are mirrored too, and those carry claims. A
// stale naac or nirf here renders a different grade on a card than the
// university page states, which is the "site disagreeing with itself" problem
// check-university-count.mjs was written for.
//
// SCOPE. This checks the fields where mirroring is the contract, not every
// field the two files share. Measured 2026-10-02, five shared fields are
// curated in the mirror rather than copied, and enforcing them would be a
// regression rather than a fix:
//
//   city       120 differ. The master holds raw address fragments ("Block 32",
//              "Sector 7", "Waghodia"); the mirror holds the display city
//              ("Phagwara", "Navi Mumbai", "Vadodara"). The mirror is better.
//   approvals  136 differ. The mirror is abbreviated or absent. Its strings
//              also predate the "NIRF rank must state its category" rule
//              ("NIRF #62" against the master's "NIRF #62 (University)"), so
//              this one wants a cleanup of its own, not a sync.
//   qsRank      36 differ, every one of them present in the mirror and absent
//              from the master. The mirror is the only source.
//   logo        40 differ. There is a separate slim-logo pipeline.
//   color       19 differ. Presentational only.
//
// `highlight` is not checked either: lib/highlight.ts derives it from the live
// fields precisely so it cannot drift. That is the better pattern, and if
// data-slim ever gains a generator this file should be deleted rather than
// extended.
//
// Run:   npx tsx scripts/check-data-slim-drift.mts
// Fix:   edit lib/data-slim.ts to match lib/data.ts (the master, never the
//        other way round), then re-run.
// Wired into: .husky/pre-commit

import { UNIS_SLIM } from '../lib/data-slim'
import { UNIVERSITIES } from '../lib/data'

type Row = Record<string, unknown>

// Fields the mirror must reproduce from the master.
// `programs` first: it is the one that decides hub membership.
const MIRRORED = [
  'programs',     // decides which hub lists the university
  'name',         // rendered on every card and search result
  'abbr',
  'naac',         // accreditation claim, must not differ from the uni page
  'nirf',
  'nirfMgt',
  'nirfEng',
  'feeMin',       // fee claim, and the hub's fee filter reads it
  'feeMax',
  'emiFrom',
  'region',       // the region filter reads it
  'psuEligible',
] as const

// A field the master does not define is not drift: the mirror is allowed to
// carry nothing where the master carries nothing. Only a master value that the
// mirror fails to reproduce counts.
const ORDER_INSENSITIVE = new Set(['programs'])

function describe(v: unknown): string {
  if (v === undefined) return '(absent)'
  if (Array.isArray(v)) return '[' + v.map(String).join(', ') + ']'
  return JSON.stringify(v)
}

function equal(field: string, a: unknown, b: unknown): boolean {
  if (a === undefined && b === undefined) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    if (ORDER_INSENSITIVE.has(field)) {
      const sa = [...a].map(String).sort()
      const sb = [...b].map(String).sort()
      return sa.every((x, i) => x === sb[i])
    }
    return a.every((x, i) => x === b[i])
  }
  return a === b
}

const slimById = new Map(UNIS_SLIM.map(u => [u.id, u as unknown as Row]))
const fullById = new Map(UNIVERSITIES.map(u => [u.id, u as unknown as Row]))

const missingFromSlim = UNIVERSITIES.filter(u => !slimById.has(u.id)).map(u => u.id)
const extraInSlim = UNIS_SLIM.filter(u => !fullById.has(u.id)).map(u => u.id)

interface FieldDrift { id: string; field: string; master: unknown; mirror: unknown }
const drifts: FieldDrift[] = []

for (const full of UNIVERSITIES) {
  const slim = slimById.get(full.id)
  if (!slim) continue
  const master = full as unknown as Row
  for (const field of MIRRORED) {
    // Nothing in the master is nothing to mirror.
    if (master[field] === undefined) continue
    if (!equal(field, master[field], slim[field])) {
      drifts.push({ id: full.id, field, master: master[field], mirror: slim[field] })
    }
  }
}

const programsDrift = drifts.filter(d => d.field === 'programs')
const otherDrift = drifts.filter(d => d.field !== 'programs')

console.log(
  `check-data-slim-drift: lib/data.ts ${UNIVERSITIES.length} universities, ` +
  `UNIS_SLIM ${UNIS_SLIM.length}, ${MIRRORED.length} mirrored fields each.`,
)

const failed = missingFromSlim.length || extraInSlim.length || drifts.length
if (!failed) {
  console.log('check-data-slim-drift: OK, the mirror matches the master.')
  process.exit(0)
}

console.error('\ncheck-data-slim-drift: FAIL.')

if (missingFromSlim.length) {
  console.error(`\n  ${missingFromSlim.length} university(s) in lib/data.ts but NOT in UNIS_SLIM.`)
  console.error('  These are invisible on every client list and hub they belong to:')
  for (const id of missingFromSlim) console.error(`    ${id}`)
}
if (extraInSlim.length) {
  console.error(`\n  ${extraInSlim.length} university(s) in UNIS_SLIM but NOT in lib/data.ts.`)
  console.error('  These render on client lists with no record behind them:')
  for (const id of extraInSlim) console.error(`    ${id}`)
}
if (programsDrift.length) {
  console.error(`\n  ${programsDrift.length} record(s) whose programs array disagrees.`)
  console.error('  programs decides hub membership, so each one hides a university from a')
  console.error('  hub it belongs to, or advertises a programme it does not offer:')
  for (const d of programsDrift) {
    const m = (d.master as string[]) || []
    const s = (d.mirror as string[]) || []
    const missing = m.filter(p => !s.includes(p))
    const extra = s.filter(p => !m.includes(p))
    console.error(`\n    ${d.id}`)
    console.error(`      lib/data.ts : ${describe(d.master)}`)
    console.error(`      UNIS_SLIM   : ${describe(d.mirror)}`)
    if (missing.length) console.error(`      hidden from hubs: ${missing.join(', ')}`)
    if (extra.length) console.error(`      falsely listed on hubs: ${extra.join(', ')}`)
  }
}
if (otherDrift.length) {
  console.error(`\n  ${otherDrift.length} other mirrored field(s) disagree:`)
  for (const d of otherDrift) {
    console.error(`    ${d.id}  ${d.field}`)
    console.error(`      lib/data.ts : ${describe(d.master)}`)
    console.error(`      UNIS_SLIM   : ${describe(d.mirror)}`)
  }
}

console.error('\nlib/data.ts is the master (CODEBASE_MAP invariant 1). Edit lib/data-slim.ts')
console.error('to match it, never the reverse.')
process.exit(1)
