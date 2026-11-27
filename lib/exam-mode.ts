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

/** For a page that covers universities with no exam-mode record: states no mode. */
export const EXAM_MODE_NEUTRAL_LINE = 'Check the exam format with our counsellor before you enrol.'

/**
 * Confirmed 'Online' universities whose own page says exams are taken from home
 * or from anywhere (audits/exam-mode-verified-2026-11-16.md, "From home or
 * anywhere (11)"). The other confirmed 'Online' universities state online
 * proctoring but not the location, so "from home" is not said for them.
 */
export const CONFIRMED_FROM_HOME: ReadonlySet<string> = new Set([
  'amity-university-online',
  'amrita-vishwa-vidyapeetham-online',
  'bharati-vidyapeeth-university-online',
  'dr-dy-patil-vidyapeeth-online',
  'lovely-professional-university-online',
  'mangalayatan-university-online',
  'manipal-academy-higher-education-online',
  'manipal-university-jaipur-online',
  'sikkim-manipal-university-online',
  'parul-university-online',
  'uttaranchal-university-online',
])

/**
 * B7 follow-up (2026-11-28). One exam sentence for a page that lists several
 * universities (the /programs/mba/{spec} FAQ). It may only claim what holds for
 * every university listed: "from home" when all are in CONFIRMED_FROM_HOME,
 * "online" when all are confirmed 'Online'. Otherwise it names the confirmed
 * Exam Centre universities and sends the reader to the counsellor for the rest.
 */
export function examSentenceForUniversities(unis: ReadonlyArray<{ id: string; name: string }>): string {
  if (!unis.length) return EXAM_MODE_NEUTRAL_LINE
  const modes = unis.map(u => CONFIRMED_EXAM_MODE[u.id])
  if (unis.every(u => CONFIRMED_FROM_HOME.has(u.id) && CONFIRMED_EXAM_MODE[u.id] === 'Online')) {
    return 'Exams are online and proctored, and can be taken from home.'
  }
  if (modes.every(m => m === 'Online')) return unis.length === 1 ? 'Exams are online.' : 'Exams are online at every university listed here.'
  const centres = unis.filter(u => CONFIRMED_EXAM_MODE[u.id] === 'Exam Centre').map(u => u.name).sort()
  const parts: string[] = []
  if (centres.length) {
    const list = centres.length === 1 ? centres[0] : `${centres.slice(0, -1).join(', ')} and ${centres[centres.length - 1]}`
    parts.push(`${list} ${centres.length === 1 ? 'holds' : 'hold'} end-semester exams in person at designated exam centres.`)
  }
  const unconfirmed = unis.filter(u => CONFIRMED_EXAM_MODE[u.id] === undefined)
  // B7 round 2 (QA F1): no claim that formats differ. Nothing on record shows
  // it, and it is false on its face on a hub that lists one university.
  if (unconfirmed.length) {
    if (unis.length >= 2) parts.push('Each university sets its own exam format.')
    parts.push(unconfirmed.some(u => UNVERIFIED_EXAM_MODE.has(u.id)) ? EXAM_MODE_COUNSELLOR_LINE : EXAM_MODE_NEUTRAL_LINE)
  }
  return parts.join(' ')
}

/** True only when the record's examMode equals the confirmed value for that university. */
export const isExamModeConfirmed = (u: Pick<University, 'id' | 'examMode'>) =>
  CONFIRMED_EXAM_MODE[u.id] !== undefined && CONFIRMED_EXAM_MODE[u.id] === u.examMode

/**
 * B7b (2026-11-28). What a per-university template may say about exams.
 * - 'centre': examMode 'Exam Centre' (VIT, BITS; both confirmed). EXAM_CENTRE_LINE.
 * - 'fromHome': confirmed 'Online' and in CONFIRMED_FROM_HOME. The only tier that
 *   may say "from home", "no exam centre visit" or "no campus visits".
 * - 'online': confirmed 'Online', location not stated. EXAM_ONLINE_LINE, with no
 *   from-home, webcam or campus-visit claim.
 * - 'unverified': UNVERIFIED_EXAM_MODE (B7). EXAM_MODE_COUNSELLOR_LINE.
 * - 'unrecorded': everyone else. The record carries the importer default
 *   examMode 'Online', which nobody has checked. EXAM_MODE_NEUTRAL_LINE.
 * examMode in lib/data.ts is never changed by this; rendering decides here.
 */
export type ExamTier = 'centre' | 'fromHome' | 'online' | 'unverified' | 'unrecorded'

export function examTier(u: Pick<University, 'id' | 'examMode'>): ExamTier {
  if (isExamCentre(u)) return 'centre'
  if (UNVERIFIED_EXAM_MODE.has(u.id)) return 'unverified'
  if (isExamModeConfirmed(u)) return CONFIRMED_FROM_HOME.has(u.id) ? 'fromHome' : 'online'
  return 'unrecorded'
}

/** No confirmed exam mode: the template states none. */
export const isExamModeUnknown = (u: Pick<University, 'id' | 'examMode'>) => {
  const t = examTier(u)
  return t === 'unverified' || t === 'unrecorded'
}

/** The line a template prints in place of an exam mode it does not know. */
export const examUnknownLine = (u: Pick<University, 'id'>) =>
  UNVERIFIED_EXAM_MODE.has(u.id) ? EXAM_MODE_COUNSELLOR_LINE : EXAM_MODE_NEUTRAL_LINE

export const isExamFromHome = (u: Pick<University, 'id' | 'examMode'>) => examTier(u) === 'fromHome'

export const EXAM_ONLINE_LINE = 'Exams are online.'
