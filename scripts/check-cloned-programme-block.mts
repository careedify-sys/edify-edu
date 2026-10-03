// scripts/check-cloned-programme-block.mts
//
// Blocks one university's programme data being a copy of another's.
//
// What shipped: gls-university-online and sgt-university-online carry the same
// eight MBA specialisations, the same recruiter list, the same role lists across
// four programmes, and the same tagline. GLS is in Ahmedabad and SGT is in
// Gurugram. One record was cloned from the other. The same thing had already
// happened between amity-university-online and gla-university-online, where GLA
// carried Amity's specialisation lists for BBA, BCA and B.Com as well as its
// tagline. Only the tagline half of that was visible to
// check-duplicate-tagline, so the programme data went uncaught.
//
// WHY COUNTING MATCHES IS NOT ENOUGH. Measured 2026-10-03: 55 universities
// share one MCA recruiter list, 18 share one MA specialisation list. Those are
// seed defaults, not clones. Raw overlap puts lovely-professional + symbiosis
// at four shared values, but their specialisations and fees differ and all four
// matches are generic recruiter names, job titles and a salary band. They are
// not a clone.
//
// So fields are weighted by how much they say about a specific university:
//
//   STRONG  specs, syllabus, edifySkills, edifyProjects, edifyInternships
//           What this university actually teaches and offers. Two institutions
//           independently writing the same list of five or more is not credible.
//
//   WEAK    topCompanies, roles, avgSalary, fees, duration, internshipType
//           Recruiter names, job titles and salary bands repeat legitimately
//           across the sector and are seeded from templates here.
//
// A pair FAILS on two or more shared STRONG values. Weak-only overlap is
// reported as a note and never blocks, so the Chitkara/GLS/SGT recruiter-list
// cluster stays visible without being asserted as a clone.
//
// A value held by TEMPLATE_MIN or more universities is a template by
// definition and is skipped entirely before any pairing.
//
// Run:    npx tsx scripts/check-cloned-programme-block.mts
// Detail: npx tsx scripts/check-cloned-programme-block.mts --verbose
// Wired into: .husky/pre-commit

import { readFileSync, existsSync } from 'node:fs'
import { UNIVERSITIES } from '../lib/data'

const ALLOWLIST_PATH = 'data/cloned-programme-allowlist.json'
const VERBOSE = process.argv.includes('--verbose')

const TEMPLATE_MIN = 5    // held by this many universities => a template, skip
const MIN_LIST_LEN = 3    // a shorter list carries too little signal
const STRONG_TO_FAIL = 2  // shared strong values needed to call it a clone

const STRONG = ['specs', 'syllabus', 'edifySkills', 'edifyProjects', 'edifyInternships']
const WEAK = ['topCompanies', 'roles', 'avgSalary', 'fees', 'duration', 'internshipType']

function norm(v: unknown): string {
  if (v == null) return ''
  if (Array.isArray(v)) {
    return v.map(x => (typeof x === 'string' ? x : (x as any)?.name ?? JSON.stringify(x))).join('|')
  }
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function lengthOf(v: unknown): number {
  if (Array.isArray(v)) return v.length
  if (v && typeof v === 'object') return Object.keys(v).length
  return 1
}

// (programme, field, value) -> universities holding it
const groups = new Map<string, Set<string>>()
for (const u of UNIVERSITIES as any[]) {
  for (const [prog, pd] of Object.entries(u.programDetails || {})) {
    for (const field of [...STRONG, ...WEAK]) {
      const raw = (pd as any)[field]
      if (raw == null) continue
      if (lengthOf(raw) < MIN_LIST_LEN) continue
      const s = norm(raw)
      if (!s || s.length < 25) continue
      const key = `${prog}\u0000${field}\u0000${s}`
      if (!groups.has(key)) groups.set(key, new Set())
      groups.get(key)!.add(u.id)
    }
  }
}

interface PairInfo { strong: string[]; weak: string[] }
const pairs = new Map<string, PairInfo>()
let templatesSkipped = 0

for (const [key, ids] of groups) {
  if (ids.size < 2) continue
  if (ids.size >= TEMPLATE_MIN) { templatesSkipped++; continue }
  const [prog, field] = key.split('\u0000')
  const isStrong = STRONG.includes(field)
  const list = [...ids].sort()
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const pk = `${list[i]}+${list[j]}`
      if (!pairs.has(pk)) pairs.set(pk, { strong: [], weak: [] })
      pairs.get(pk)![isStrong ? 'strong' : 'weak'].push(`${prog}.${field}`)
    }
  }
}

interface Clone { a: string; b: string; strong: string[]; weak: string[] }
const clones: Clone[] = []
const notes: Clone[] = []
for (const [pk, info] of pairs) {
  const [a, b] = pk.split('+')
  const row = { a, b, strong: info.strong, weak: info.weak }
  if (info.strong.length >= STRONG_TO_FAIL) clones.push(row)
  else if (info.strong.length + info.weak.length >= 4) notes.push(row)
}
clones.sort((x, y) => y.strong.length - x.strong.length)
notes.sort((x, y) => (y.strong.length + y.weak.length) - (x.strong.length + x.weak.length))

interface AllowEntry { pair: string[]; reason: string }
const allowlist: AllowEntry[] = existsSync(ALLOWLIST_PATH)
  ? (JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).entries || [])
  : []
const allowKey = (p: string[]) => [...p].sort().join('+')
const allowed = new Set(allowlist.map(e => allowKey(e.pair)))

const blocking = clones.filter(c => !allowed.has(allowKey([c.a, c.b])))
const matched = clones.filter(c => allowed.has(allowKey([c.a, c.b])))
const stale = allowlist.filter(e => !clones.some(c => allowKey([c.a, c.b]) === allowKey(e.pair)))

console.log(
  `check-cloned-programme-block: ${(UNIVERSITIES as any[]).length} records, ` +
  `${groups.size} programme values, ${templatesSkipped} templates skipped, ` +
  `${clones.length} cloned pair(s), ${matched.length} allowlisted.`,
)

if (notes.length) {
  console.log(`\nNOTE: ${notes.length} pair(s) overlap on generic fields only (recruiter lists, job`)
  console.log('titles, salary bands). Not treated as clones, listed so they stay visible:')
  for (const n of notes) {
    console.log(`  ${n.a} + ${n.b}  (${n.weak.length} weak, ${n.strong.length} strong)`)
    if (VERBOSE) console.log(`    ${[...n.strong, ...n.weak].join(', ')}`)
  }
}

if (VERBOSE && matched.length) {
  console.log('\nallowlisted:')
  for (const c of matched) {
    const reason = allowlist.find(e => allowKey(e.pair) === allowKey([c.a, c.b]))?.reason || ''
    console.log(`  ${c.a} + ${c.b}`)
    console.log(`    strong: ${c.strong.join(', ')}`)
    if (reason) console.log(`    reason: ${reason}`)
  }
}

if (stale.length) {
  console.log(`\nNOTE: ${stale.length} allowlist entry(s) no longer match. Remove them from ${ALLOWLIST_PATH}:`)
  for (const e of stale) console.log(`  ${e.pair.join(' + ')}`)
}

if (!blocking.length) {
  console.log('check-cloned-programme-block: OK, no programme block is shared between universities.')
  process.exit(0)
}

console.error('\ncheck-cloned-programme-block: FAIL.')
for (const c of blocking) {
  console.error(`\n  ${c.a}`)
  console.error(`  ${c.b}`)
  console.error(`    share ${c.strong.length} editorial value(s): ${c.strong.join(', ')}`)
  if (c.weak.length) console.error(`    and ${c.weak.length} generic value(s): ${c.weak.join(', ')}`)
}
console.error(`\n${blocking.length} cloned pair(s). Two universities do not independently publish the`)
console.error('same specialisation lists. Rebuild the copied record from that university\'s own')
console.error(`portal. Do not edit one into the other: pick wrong and a real university carries a`)
console.error(`false prospectus. If the overlap is genuinely correct, record it in ${ALLOWLIST_PATH}.`)
process.exit(1)
