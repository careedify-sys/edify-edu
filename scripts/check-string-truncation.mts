// scripts/check-string-truncation.mts
//
// Blocks a string literal in lib/data.ts that was cut off mid-sentence by an
// importer. These render verbatim on university pages: in the description
// block, in the per-programme career line, and in the hero tagline.
//
// Why this is a gate and not a one-off cleanup. 89 of them shipped and sat
// live. The first sweep on 2026-10-01 keyed on unbalanced parentheses, so it
// only found a cut that happened to land inside a bracket, declared the job
// done, and left everything cut in open prose in place:
//
//   description    "...from Sathyabama Institute of Science and Technolog."
//   careerOutcome  "UGC DEB approved MBA from Koneru Lakshmaiah Education
//                   Foundat", then a dash, then "recognised for corporate hiring."
//   name           "B.S. Abdur Rahman Crescent Institute of Science and Online"
//
// The last one matters most: a truncated `name` propagates, because the
// description template is rebuilt from it. Repairing a description without
// first repairing the name just reproduces the cut.
//
// THE RULES, and what each one is for:
//
//   R1 dangling connective. The value, or a sentence inside it, ends on a word
//      that cannot end a sentence: and, of, the, for, to, from, in, on ...
//      Catches "...Institute of Science and." and "...+ Group and".
//
//   R2 cut name word. A token before a terminator is a strict prefix of a
//      longer word in the same record's `name`. Catches "Technolog." against
//      "Technology", and "Foundat" against "Foundation". The terminator may be
//      a full stop, a dash, a comma at the end, or the end of the string: an
//      earlier version only looked before a full stop and missed every one of
//      the 75 careerOutcome cuts, which sit before a dash.
//
//   R3 stub ending. The value ends, with no closing punctuation, on a token of
//      one or two letters. Catches "...Business Analytics & A".
//
//   R4 unbalanced bracket. An opening bracket with no closing one means the cut
//      landed inside a parenthetical. Catches "UGC DEB approved MBA from SGT
//      University (Centre for Distance", then a dash, then "recognised for
//      corporate hiring." R1 cannot see it, because "Distance" is a complete
//      word; R2 cannot, because the record's name holds no "Distance..."; R3
//      cannot, because the value does not end there. This was the FIRST sweep's
//      only rule, dropped when this gate was written, and dropping it left 86
//      strings uncaught. Keep all four: each catches a cut the others cannot.
//
// A token preceded by a dot is skipped throughout. Without that, every value
// ending "...at deb.ugc.ac.in." trips R1, because the final ".in." reads as a
// sentence ending on the word "in". That false positive flagged three complete
// descriptions before it was handled.
//
// Known-and-accepted cases live in data/string-truncation-allowlist.json with a
// reason each. Use it only for text that is genuinely truncated but editorial,
// where the missing half cannot be reconstructed, only invented.
//
// That file stores every non-ASCII character as a \uXXXX escape, because four of
// the recorded taglines contain an em dash and check-em-dash rejects the literal
// character on a staged line. JSON.parse restores them, so matching is byte-exact
// either way. Do not tidy the escapes back into literal characters.
//
// Run:    npx tsx scripts/check-string-truncation.mts
// Detail: npx tsx scripts/check-string-truncation.mts --verbose
// Wired into: .husky/pre-commit

import { readFileSync, existsSync } from 'node:fs'

const DATA_PATH = 'lib/data.ts'
const ALLOWLIST_PATH = 'data/string-truncation-allowlist.json'
const VERBOSE = process.argv.includes('--verbose')

// Fields whose text renders to a reader. Keys not listed here are ignored, so a
// slug, a class name or an id cannot trip the rules.
const CHECKED_KEYS = new Set([
  'name',
  'description',
  'tagline',
  'careerOutcome',
  'eligibility',
  'highlightExtra',
  'rankingBadge',
])

const DANGLING = new Set([
  'and', 'of', 'the', 'a', 'an', 'for', 'with', 'to', 'from',
  'at', 'in', 'on', 'or', 'by', 'as', 'its', 'their',
])

// token, with the character before it, followed by a terminator
const TERMINATED = /(.?)\b([A-Za-z]+)\s*(?=\.(?:\s|$)|\s*—|\s*–|,\s*$|$)/g
// final token of the whole value when nothing closes it
const STUB_END = /(^|[\s&+/-])([A-Za-z]{1,2})$/

interface Finding { id: string; key: string; value: string; rule: string; detail: string }

function strField(blk: string, key: string): string | null {
  const a = blk.match(new RegExp("^\\s*" + key + ":\\s*'((?:[^'\\\\]|\\\\.)*)'", 'm'))
  if (a) return a[1]
  const b = blk.match(new RegExp('^\\s*' + key + ':\\s*"((?:[^"\\\\]|\\\\.)*)"', 'm'))
  return b ? b[1] : null
}

function allStrings(blk: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = []
  const re = /(\w+)\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g
  let x: RegExpExecArray | null
  while ((x = re.exec(blk))) {
    if (!CHECKED_KEYS.has(x[1])) continue
    out.push({ key: x[1], value: x[2].slice(1, -1) })
  }
  return out
}

function inspect(value: string, nameWords: string[]): { rule: string; detail: string } | null {
  if (value.length < 20) return null

  for (const m of value.matchAll(TERMINATED)) {
    if (m[1] === '.') continue                       // dotted token: deb.ugc.ac.in
    const w = m[2]
    if (DANGLING.has(w.toLowerCase())) return { rule: 'R1', detail: `ends on "${w}"` }
    if (
      w.length >= 4 &&
      nameWords.some(nw => nw.length > w.length && nw.toLowerCase().startsWith(w.toLowerCase()))
    ) {
      return { rule: 'R2', detail: `"${w}" is a cut form of a word in this record's name` }
    }
  }

  if (!/[.!?)"'\]]$/.test(value)) {
    const s = value.match(STUB_END)
    if (s) return { rule: 'R3', detail: `ends on the stub "${s[2]}"` }
  }

  const open = (value.match(/\(/g) || []).length
  const close = (value.match(/\)/g) || []).length
  if (open !== close) {
    return {
      rule: 'R4',
      detail: open > close
        ? `${open - close} unclosed "(", so the cut landed inside a parenthetical`
        : `${close - open} stray ")"`,
    }
  }
  return null
}

// ---------------------------------------------------------------- scan

const src = readFileSync(DATA_PATH, 'utf8')
const idRe = /^ {4}id: '([a-z0-9-]+)',/gm
const marks: { id: string; at: number }[] = []
let m: RegExpExecArray | null
while ((m = idRe.exec(src))) marks.push({ id: m[1], at: m.index })

const findings: Finding[] = []
for (let i = 0; i < marks.length; i++) {
  const blk = src.slice(marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length)
  const name = strField(blk, 'name') || ''
  const nameWords = name.split(/[^A-Za-z]+/).filter(w => w.length > 3)
  const seen = new Set<string>()
  for (const s of allStrings(blk)) {
    const fingerprint = s.key + '::' + s.value
    if (seen.has(fingerprint)) continue
    seen.add(fingerprint)
    const hit = inspect(s.value, nameWords)
    if (hit) findings.push({ id: marks[i].id, key: s.key, value: s.value, ...hit })
  }
}

// ---------------------------------------------------------------- allowlist

interface AllowEntry { id: string; key: string; value: string; reason: string }
const allowlist: AllowEntry[] = existsSync(ALLOWLIST_PATH)
  ? (JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).entries || [])
  : []
const allowKey = (e: { id: string; key: string; value: string }) => `${e.id}::${e.key}::${e.value}`
const allowed = new Set(allowlist.map(allowKey))

const blocking = findings.filter(f => !allowed.has(allowKey(f)))
const matchedAllow = findings.filter(f => allowed.has(allowKey(f)))
const staleAllow = allowlist.filter(a => !findings.some(f => allowKey(f) === allowKey(a)))

console.log(
  `check-string-truncation: ${marks.length} records, ` +
  `${CHECKED_KEYS.size} checked field names, ${findings.length} truncation(s) found, ` +
  `${matchedAllow.length} allowlisted.`,
)

if (VERBOSE && matchedAllow.length) {
  console.log('\nallowlisted (known, editorial, needs a human):')
  for (const f of matchedAllow) {
    const reason = allowlist.find(a => allowKey(a) === allowKey(f))?.reason || ''
    console.log(`  ${f.id} .${f.key}  [${f.rule}] ${f.detail}`)
    console.log(`    "${f.value.slice(0, 120)}"`)
    if (reason) console.log(`    reason: ${reason}`)
  }
}

// A stale allowlist entry means the text was fixed. Report it so the entry gets
// removed, but never fail the build for text that is now correct.
if (staleAllow.length) {
  console.log(`\nNOTE: ${staleAllow.length} allowlist entry(s) no longer match anything in ${DATA_PATH}.`)
  console.log('Those strings were fixed. Remove the entries from ' + ALLOWLIST_PATH + ':')
  for (const a of staleAllow) console.log(`  ${a.id} .${a.key}`)
}

if (!blocking.length) {
  console.log('check-string-truncation: OK, no new truncated strings.')
  process.exit(0)
}

console.error('\ncheck-string-truncation: FAIL.')
for (const f of blocking) {
  console.error(`\n  ${f.id}  .${f.key}  [${f.rule}] ${f.detail}`)
  console.error(`    "${f.value.slice(0, 160)}"`)
}
console.error(`\n${blocking.length} truncated string(s). These render verbatim on the university page.`)
console.error('Rebuild the text from the record (a description is built from its `name`, so fix')
console.error('the name first). If the text is editorial and the missing half cannot be')
console.error(`reconstructed, add it to ${ALLOWLIST_PATH} with a reason and raise it with Rishi.`)
process.exit(1)
