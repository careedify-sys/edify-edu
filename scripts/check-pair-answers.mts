// scripts/check-pair-answers.mts
//
// Builds the answer-first sections for every MBA comparison pair and fails on
// a lead outside 40-60 words, an em dash, the "EdifyEdu" brand string or a
// banned word. Prints what each hand-written pair had to leave out under the
// conflict rule. Run: npx tsx scripts/check-pair-answers.mts [--verbose]
import { PAIRS, PAIR_SLUGS } from '../app/compare/[pair]/pairs'
import { getUniversityById } from '../lib/data'
import { buildPairAnswers, pairAnswerProblems } from '../lib/answers/compare-answers'
import { FROZEN_UNIVERSITIES } from '../lib/answers/targets'

const verbose = process.argv.includes('--verbose')
let bad = 0, n = 0
for (const slug of PAIR_SLUGS) {
  const c = PAIRS[slug]
  if (c.program !== 'MBA') continue
  if (FROZEN_UNIVERSITIES.has(c.uniA) || FROZEN_UNIVERSITIES.has(c.uniB)) continue
  const uA = getUniversityById(c.uniA)!, uB = getUniversityById(c.uniB)!
  const a = buildPairAnswers({ slug, uA, uB, faqs: c.faqs, verdictA: c.verdictA, verdictB: c.verdictB, derived: !!c.derived })
  n++
  const probs = pairAnswerProblems(a)
  if (probs.length) { bad++; console.log(`FAIL ${slug}: ${probs.join('; ')}`) }
  console.log(`${c.derived ? 'new ' : 'old '} ${slug}: ${a.sections.map(s => s.key).join(', ')}; +${a.faqs.length} FAQ${a.omitted.length ? '; omitted ' + Array.from(new Set(a.omitted.map(o => o.conflict.kind))).join('/') : ''}`)
  if (verbose) for (const o of a.omitted) console.log(`     ${o.uni} ${o.conflict.kind}: ${o.conflict.snippet}`)
}
if (bad) { console.error(`check-pair-answers: FAILED (${bad} of ${n} pairs)`); process.exit(1) }
console.log(`check-pair-answers: OK (${n} MBA pairs)`)
