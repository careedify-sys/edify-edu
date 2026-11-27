// lib/answer-first.ts
//
// B4 (2026-11-28). The answer-first block at the top of an MBA hub: total fee,
// eligibility and exam mode, each with the date it was checked. Scope: the ten
// Phase B queue universities (audits/queue-ranking-2026-11-16.md, "Recommended
// top 10"). Every value comes from a dated source; a row without one prints the
// counsellor line, never a default.
// - Fee: University.provenance.fee (B1, lib/data.ts UNIVERSITY_PROVENANCE).
// - Eligibility: the M3 row of the university's 18 Nov verify sheet, held here
//   because lib/data.ts eligibility strings are older and some are templated.
// - Exam mode: lib/exam-mode.ts examTier, dated by the sheet's M6 row.
// Types only from lib/data, so this is safe in client components. No source
// URL is printed (official sites stay out of visible copy).

import type { University } from './data'
import { formatCheckedDate } from './provenance'
import { examTier, examUnknownLine } from './exam-mode'

export const ANSWER_FIRST_IDS: readonly string[] = [
  'bits-pilani-work-integrated-online',
  'galgotias-university-online',
  'jain-university-online',
  'dayananda-sagar-university-online',
  'symbiosis-university-online',
  'dr-dy-patil-vidyapeeth-online',
  'amity-university-online',
  'uttaranchal-university-online',
  'shoolini-university-online',
  'adichunchanagiri-university-online',
]

interface DatedFact { value: string; checkedOn: string; sheet: string }

const sheet = (id: string) => `audits/verify/${id}-2026-11-18.md`
const D = '2026-11-18'

/**
 * Online MBA eligibility as each sheet's M3 row records it from the portal.
 * DSU is left out on purpose: its sheet reads dsuonline.com, which B2 holds
 * unverified as DSU's official site (Q80), and B1 gave DSU no provenance.
 */
const ELIGIBILITY: Record<string, DatedFact> = {
  'bits-pilani-work-integrated-online': { value: 'B.E./B.Tech./M.Sc., or a 3-year degree in Maths, Statistics, Science, Economics, Commerce or Business Management, with at least 60% aggregate; 1 year of work experience (2 years with a 3-year degree), and employed when applying', checkedOn: D, sheet: sheet('bits-pilani-work-integrated-online') },
  'galgotias-university-online': { value: 'Graduation pass; no minimum percentage published', checkedOn: D, sheet: sheet('galgotias-university-online') },
  'jain-university-online': { value: '3-year bachelor\'s degree from a UGC-recognised university with at least 50% aggregate (5% relaxation for SC/ST); final-semester students may apply', checkedOn: D, sheet: sheet('jain-university-online') },
  'symbiosis-university-online': { value: 'Graduation with at least 50% or an equivalent grade (45% for SC/ST)', checkedOn: D, sheet: sheet('symbiosis-university-online') },
  'dr-dy-patil-vidyapeeth-online': { value: 'Bachelor\'s degree in any discipline with at least 50% aggregate (45% for reserved categories); no work experience required', checkedOn: D, sheet: sheet('dr-dy-patil-vidyapeeth-online') },
  'amity-university-online': { value: 'Graduation in any discipline with at least 40% marks; below 40%, an admission test is required', checkedOn: D, sheet: sheet('amity-university-online') },
  'uttaranchal-university-online': { value: 'Bachelor\'s degree of at least 3 years with 50% marks (45% for reserved categories)', checkedOn: D, sheet: sheet('uttaranchal-university-online') },
  'shoolini-university-online': { value: 'Bachelor\'s degree of at least 3 years with 50% marks (45% reserved category, 60% international students)', checkedOn: D, sheet: sheet('shoolini-university-online') },
  'adichunchanagiri-university-online': { value: 'Bachelor\'s degree of at least 3 years with 50% marks or equivalent CGPA (45% for SC/ST); final-year students may apply', checkedOn: D, sheet: sheet('adichunchanagiri-university-online') },
}

/** The M6 (exam mode) check date, for the universities whose tier states a mode. */
const EXAM_MODE_CHECKED: Record<string, DatedFact> = Object.fromEntries(
  ['bits-pilani-work-integrated-online', 'galgotias-university-online', 'jain-university-online',
    'dayananda-sagar-university-online', 'symbiosis-university-online', 'dr-dy-patil-vidyapeeth-online',
    'amity-university-online', 'uttaranchal-university-online']
    .map(id => [id, { value: 'M6', checkedOn: D, sheet: sheet(id) }]),
)

export const ASK_COUNSELLOR = 'Ask our counsellor'

export interface AnswerFirstRow { label: string; value: string; checked: string | null }

const checked = (iso: string | undefined) => {
  const d = formatCheckedDate(iso)
  return d ? `Checked ${d}` : null
}

/** null when the page is out of scope (not an MBA hub of a queue university). */
export function answerFirstRows(u: Pick<University, 'id' | 'examMode' | 'provenance'>, program: string): AnswerFirstRow[] | null {
  if (program !== 'MBA' || !ANSWER_FIRST_IDS.includes(u.id)) return null
  const fee = u.provenance?.fee
  const elig = ELIGIBILITY[u.id]
  const tier = examTier(u)
  const examDate = EXAM_MODE_CHECKED[u.id]
  const examValue =
    tier === 'centre' ? 'In person at designated exam centres'
    : tier === 'fromHome' ? 'Online proctored, taken from home'
    : tier === 'online' ? 'Online'
    : examUnknownLine(u)
  const examKnown = tier === 'centre' || tier === 'fromHome' || tier === 'online'
  return [
    { label: 'Total fee', value: fee?.value ?? ASK_COUNSELLOR, checked: fee ? checked(fee.checkedOn) : null },
    { label: 'Eligibility', value: elig?.value ?? ASK_COUNSELLOR, checked: elig ? checked(elig.checkedOn) : null },
    { label: 'Exam mode', value: examValue, checked: examKnown && examDate ? checked(examDate.checkedOn) : null },
  ]
}
