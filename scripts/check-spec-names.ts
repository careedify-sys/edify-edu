// scripts/check-spec-names.ts
// Fails on any specialisation name in lib/data.ts that is malformed rather than
// merely long. Three shapes, all of which shipped before 2026-09-13:
//
//   unbalanced parenthesis   a parenthesised list split on its internal commas,
//                            e.g. specs: ['General (C', 'C++', ... 'Software
//                            Testing)']. That published nine specialisation
//                            pages for one General programme and claimed SPPU
//                            offers a BCA specialisation in Dot Net.
//   placeholder text         "(contact university for specialisations)" is a
//                            note to the reader, not a specialisation name.
//   multi-name cell          several names in one string, which becomes one
//                            absurd slug rather than several pages.
//
// A name can be long and still be fine, so length alone is not a failure. The
// workbook side of the same defect is repaired in scripts/build-valid-urls.js.
// Full write-up: audits/malformed-spec-names-2026-09-13.md
//
// Read-only. Exits non-zero on any finding.
// Run: npx tsx scripts/check-spec-names.ts

import { UNIVERSITIES, specSlug as toSlug } from '../lib/data'

const LABELS = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'BA', 'MA', 'MSc', 'BSc']
const PLACEHOLDER = /\b(?:contact|check with)\b[^)]*\buniversit/i
const TRUNCATED_TAIL = /\((?:[^)]*)$/ // an opening paren never closed

interface Finding { uni: string; prog: string; name: string; slug: string; why: string }
const findings: Finding[] = []

for (const u of UNIVERSITIES) {
  for (const label of LABELS) {
    const pd = (u.programDetails as Record<string, { specs?: unknown[] } | undefined>)[label]
    if (!pd?.specs) continue
    for (const s of pd.specs) {
      const name = (typeof s === 'string' ? s : (s as { name?: string })?.name ?? '').trim()
      if (!name) continue
      const why: string[] = []
      const open = (name.match(/\(/g) || []).length
      const close = (name.match(/\)/g) || []).length
      if (open !== close) {
        why.push(TRUNCATED_TAIL.test(name)
          ? 'unbalanced parenthesis (a split list, or a name truncated at import)'
          : 'unbalanced parenthesis (a fragment of a split list)')
      }
      if (PLACEHOLDER.test(name)) why.push('placeholder text, not a specialisation name')
      if (name.includes('|')) why.push('several names in one entry')
      if (why.length) findings.push({ uni: u.id, prog: label, name, slug: toSlug(s as never), why: why.join('; ') })
    }
  }
}

if (findings.length) {
  console.error(`FAIL. ${findings.length} malformed specialisation name(s) in lib/data.ts:\n`)
  for (const f of findings) {
    console.error(`  ${f.uni} [${f.prog}]`)
    console.error(`    name: ${JSON.stringify(f.name)}`)
    console.error(`    slug: ${f.slug}`)
    console.error(`    why : ${f.why}\n`)
  }
  console.error('A parenthesised list must stay in one string. See')
  console.error('audits/malformed-spec-names-2026-09-13.md for the repair pattern.')
  process.exit(1)
}

const total = UNIVERSITIES.reduce((n, u) =>
  n + LABELS.reduce((m, l) =>
    m + (((u.programDetails as Record<string, { specs?: unknown[] } | undefined>)[l]?.specs ?? []).length), 0), 0)
console.log(`OK. ${total} specialisation names across ${UNIVERSITIES.length} universities are well formed.`)
