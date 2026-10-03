// scripts/check-duplicate-tagline.mts
//
// Blocks a university-specific claim in lib/data.ts being carried by more than
// one university. A shared claim is wrong for at least one of them, and it is
// wrong in the voice of a site whose whole position is that its numbers can be
// trusted.
//
// What shipped: gla-university-online carried amity-university-online's tagline
// word for word, "ONLY QS-ranked online MBA in India offering 19
// specialisations". GLA holds no qsRank at all and lists 16 MBA
// specialisations, so every claim in that sentence was false for it. It was
// found by accident while scanning for truncated strings, not by any check.
//
// THE DISTINCTION THIS GATE HAS TO MAKE. Some taglines are shared on purpose:
// the site falls back to a generic line when a university has no editorial copy
// yet, and 54 records share one of those. Those are not claims about a
// university, they are a restatement of fields already on the record, so they
// are allowed by pattern below. Everything else that repeats is a copy.
//
// SCOPE: `tagline` and `description`, the two fields that carry a university's
// own positioning. `careerOutcome` is deliberately excluded. Measured
// 2026-10-03, every one of its 10 shared values is a statement about a degree
// type rather than an institution: "BA is valid for most government jobs and
// civil services" across 9 records, "UGC-DEB entitled M.Com, valid for commerce
// and finance roles and for NET eligibility" across 3. Those are true of all of
// them. The specific form of that field is built as "UGC DEB approved MBA from
// {name}, recognised for corporate hiring", which contains the university name
// and therefore cannot collide, so including the field would add noise and no
// signal.
//
// Values are compared ACROSS universities only.
//
// Run:    npx tsx scripts/check-duplicate-tagline.mts
// Detail: npx tsx scripts/check-duplicate-tagline.mts --verbose
// Wired into: .husky/pre-commit

import { readFileSync, existsSync } from 'node:fs'

const DATA_PATH = 'lib/data.ts'
const ALLOWLIST_PATH = 'data/duplicate-tagline-allowlist.json'
const VERBOSE = process.argv.includes('--verbose')

const CHECKED_KEYS = ['tagline', 'description'] as const

// Generic fallbacks the site generates from fields already on the record.
// These carry no university-specific claim, so sharing them is not a defect.
const GENERIC: RegExp[] = [
  // "NAAC A++ accredited · UGC DEB approved online programs"
  /^NAAC [A-Z+]{1,3} accredited · UGC DEB approved online programs$/,
  // "Tamil Nadu university with online programs"
  /^[A-Za-z][A-Za-z .]* university with online programs$/i,
  // "UGC DEB approved online programs" on its own
  /^UGC DEB approved online programs$/,
]

const isGeneric = (v: string) => GENERIC.some(re => re.test(v))

function strField(blk: string, key: string): string | null {
  const a = blk.match(new RegExp("^\\s*" + key + ":\\s*'((?:[^'\\\\]|\\\\.)*)'", 'm'))
  if (a) return a[1]
  const b = blk.match(new RegExp('^\\s*' + key + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', 'm'))
  return b ? b[1] : null
}

function allOf(blk: string, key: string): string[] {
  const out: string[] = []
  const re = new RegExp(key + ":\\s*('(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\")", 'g')
  let x: RegExpExecArray | null
  while ((x = re.exec(blk))) out.push(x[1].slice(1, -1))
  return out
}

const src = readFileSync(DATA_PATH, 'utf8')
const idRe = /^ {4}id: '([a-z0-9-]+)',/gm
const marks: { id: string; at: number }[] = []
let m: RegExpExecArray | null
while ((m = idRe.exec(src))) marks.push({ id: m[1], at: m.index })

// value -> field -> set of university ids
const index = new Map<string, Map<string, Set<string>>>()
for (let i = 0; i < marks.length; i++) {
  const blk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length)
  for (const key of CHECKED_KEYS) {
    const values = [strField(blk, key)].filter(Boolean) as string[]
    for (const v of new Set(values)) {
      if (!v || v.length < 20) continue
      if (isGeneric(v)) continue
      if (!index.has(v)) index.set(v, new Map())
      const byField = index.get(v)!
      if (!byField.has(key)) byField.set(key, new Set())
      byField.get(key)!.add(marks[i].id)
    }
  }
}

interface Dup { key: string; value: string; ids: string[] }
const dups: Dup[] = []
for (const [value, byField] of index) {
  for (const [key, ids] of byField) {
    if (ids.size > 1) dups.push({ key, value, ids: [...ids].sort() })
  }
}
dups.sort((a, b) => b.ids.length - a.ids.length)

interface AllowEntry { key: string; value: string; ids: string[]; reason: string }
const allowlist: AllowEntry[] = existsSync(ALLOWLIST_PATH)
  ? (JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).entries || [])
  : []
const allowKey = (e: { key: string; value: string; ids: string[] }) =>
  `${e.key}::${[...e.ids].sort().join(',')}::${e.value}`
const allowed = new Set(allowlist.map(allowKey))

const blocking = dups.filter(d => !allowed.has(allowKey(d)))
const matched = dups.filter(d => allowed.has(allowKey(d)))
const stale = allowlist.filter(a => !dups.some(d => allowKey(d) === allowKey(a)))

const genericCount = marks.filter((_, i) => {
  const blk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length)
  const t = strField(blk, 'tagline')
  return t ? isGeneric(t) : false
}).length

console.log(
  `check-duplicate-tagline: ${marks.length} records, ${CHECKED_KEYS.length} fields, ` +
  `${genericCount} on a generic fallback (allowed by pattern), ` +
  `${dups.length} shared claim(s), ${matched.length} allowlisted.`,
)

if (VERBOSE && matched.length) {
  console.log('\nallowlisted:')
  for (const d of matched) {
    const reason = allowlist.find(a => allowKey(a) === allowKey(d))?.reason || ''
    console.log(`  .${d.key} shared by ${d.ids.join(', ')}`)
    console.log(`    "${d.value.slice(0, 120)}"`)
    if (reason) console.log(`    reason: ${reason}`)
  }
}

if (stale.length) {
  console.log(`\nNOTE: ${stale.length} allowlist entry(s) no longer match. Remove them from ${ALLOWLIST_PATH}:`)
  for (const a of stale) console.log(`  .${a.key} ${a.ids.join(', ')}`)
}

if (!blocking.length) {
  console.log('check-duplicate-tagline: OK, no university-specific claim is shared.')
  process.exit(0)
}

console.error('\ncheck-duplicate-tagline: FAIL.')
for (const d of blocking) {
  console.error(`\n  .${d.key} shared by ${d.ids.length} universities: ${d.ids.join(', ')}`)
  console.error(`    "${d.value.slice(0, 170)}"`)
}
console.error(`\n${blocking.length} shared claim(s). A claim true of one university is not`)
console.error('true of another. Work out which record it belongs to and give the others their')
console.error('own line, or the generic fallback for their NAAC grade. If a genuinely shared')
console.error(`line is correct for all of them, record it in ${ALLOWLIST_PATH} with a reason.`)
process.exit(1)
