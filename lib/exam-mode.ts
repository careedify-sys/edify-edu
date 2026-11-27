import type { University } from '@/lib/data'

// examMode 'Exam Centre': end-semester exams are sat in person at the
// university's designated centres. The generic templates said "from home, no
// exam centre visit" for every university, which was false for BITS WILP
// (batch 3.4, 2026-11-16). Every template that mentions travel or campus
// visits must branch on this.
export const isExamCentre = (u: Pick<University, 'examMode'>) => u.examMode === 'Exam Centre'

export const EXAM_CENTRE_LINE = 'End-semester exams are taken in person at designated exam centres.'

/**
 * Exam modes confirmed from the university's own pages, with the value they
 * confirm. Source: audits/exam-mode-verified-2026-11-16.csv (22 rows marked
 * "'Online' confirmed", plus VIT's change to 'Exam Centre'), and
 * audits/verify/bits-pilani-work-integrated-online-2026-11-18.md for BITS.
 * Every other record carries the importer default 'Online', which nobody has
 * checked, so a stated "Exams: Online" fact for it would be a guess.
 * Unverified, ambiguous or not-yet-checked universities are absent on purpose.
 * Added for A9 QA (2026-11-18); examMode data itself is unchanged.
 */
export const CONFIRMED_EXAM_MODE: Readonly<Record<string, University['examMode']>> = {
  'amity-university-online': 'Online',
  'amrita-vishwa-vidyapeetham-online': 'Online',
  'bharati-vidyapeeth-university-online': 'Online',
  'chandigarh-university-online': 'Online',
  'christ-university-online': 'Online',
  'dr-dy-patil-vidyapeeth-online': 'Online',
  'galgotias-university-online': 'Online',
  'gla-university-online': 'Online',
  'jain-university-online': 'Online',
  'kl-university-online': 'Online',
  'kurukshetra-university-online': 'Online',
  'lovely-professional-university-online': 'Online',
  'manav-rachna-online': 'Online',
  'mangalayatan-university-online': 'Online',
  'manipal-academy-higher-education-online': 'Online',
  'manipal-university-jaipur-online': 'Online',
  'parul-university-online': 'Online',
  'sikkim-manipal-university-online': 'Online',
  'symbiosis-university-online': 'Online',
  'upes-online': 'Online',
  'uttaranchal-university-online': 'Online',
  'vivekananda-global-university-online': 'Online',
  'vit-university-online': 'Exam Centre',
  'bits-pilani-work-integrated-online': 'Exam Centre',
  // B7 (2026-11-28): the 16 Nov audit had DSU "not stated". The 18 Nov sheet
  // audits/verify/dayananda-sagar-university-online-2026-11-18.md (row M6,
  // MATCH) reads "Online Examination" on https://dsuonline.com/online-mba/ and a
  // "Remote Proctored Online Examination" document on its mandatory disclosures.
  'dayananda-sagar-university-online': 'Online',
}

/**
 * B7 (2026-11-28). Serviced universities whose exam mode the university's own
 * pages do not state, or state in conflicting ways
 * (audits/exam-mode-verified-2026-11-16.md, "Not stated or conflicting"), plus
 * Shoolini, whose methodology PDF describes both online-proctored and
 * campus-invigilated exams (ambiguous; Q29 open). Their record keeps the
 * importer default examMode 'Online', but no template may print an exam mode,
 * "from home", "proctored" or "no campus visit" line for them. They get
 * EXAM_MODE_COUNSELLOR_LINE instead. Remove an id only when a fact-checker
 * sheet with a source URL and date confirms its mode, and add it to
 * CONFIRMED_EXAM_MODE at the same time.
 */
export const UNVERIFIED_EXAM_MODE: ReadonlySet<string> = new Set([
  'dy-patil-university-online',
  'graphic-era-university-online',
  'nmims-online',
  'sharda-university-online',
  'mody-university-online',
  'sathyabama-university-online',
  'shoolini-university-online',
])

export const isExamModeUnverified = (u: Pick<University, 'id'>) => UNVERIFIED_EXAM_MODE.has(u.id)

export const EXAM_MODE_COUNSELLOR_LINE = 'Talk to our counsellor for how and where exams are held.'

/** True only when the record's examMode equals the confirmed value for that university. */
export const isExamModeConfirmed = (u: Pick<University, 'id' | 'examMode'>) =>
  CONFIRMED_EXAM_MODE[u.id] !== undefined && CONFIRMED_EXAM_MODE[u.id] === u.examMode
