// lib/seo/deb-basis.ts
//
// Universities that are NOT on the UGC-DEB programme register but run their
// online or work-integrated programmes under a different UGC basis.
//
// Every template on /universities/* asserts "UGC DEB approved" for every
// record. That is true for the register-listed universities and false for
// these. Templates ask isOnDebRegister(u.id) before printing a DEB claim, and
// print the basis below instead.
//
// bits-pilani-work-integrated-online (2026-11-18, backlog A8): the full DEB
// register at deb.ugc.ac.in/Home/HEI_Prog_List (14,037 rows) has zero BITS
// Pilani rows in any year 2020-21 to 2026-27, in any mode. WILP's own UGC page
// cites Institution of Eminence status and the UGC's 548th meeting
// (09.09.2020) approving continued WILP offering. Source sheet:
// audits/verify/bits-pilani-work-integrated-online-2026-11-18.md
//
// To add a university here you need the register check AND the stated basis
// from a verify sheet. Absence from the register alone is not a basis.
//
// No imports: client components (UniHero, ApprovalBadges) read this too.

export interface DebBasis {
  /** Badge title, replaces "UGC DEB". */
  badge: string
  /** Badge subtitle, replaces "Govt Approved". */
  badgeSub: string
  /** Short phrase that replaces "UGC DEB approved" mid-sentence. */
  short: string
  /** Full statement of the basis, for About / FAQ / approval blocks. */
  sentence: string
  /** One closing sentence for meta descriptions and schema prose. */
  metaSentence: string
  checkedOn: string
}

export const NOT_ON_DEB_REGISTER: Readonly<Record<string, DebBasis>> = {
  'bits-pilani-work-integrated-online': {
    badge: 'UGC approval',
    badgeSub: 'Institution of Eminence',
    short: 'run under UGC approval as an Institution of Eminence',
    sentence:
      'BITS Pilani does not appear on the UGC-DEB programme register. It runs its Work Integrated Learning Programmes under UGC approval: the UGC, at its 548th meeting on 9 September 2020, approved the continued offering of WILP, and BITS Pilani holds Institution of Eminence status.',
    metaSentence: 'Runs under UGC approval as an Institution of Eminence.',
    checkedOn: '2026-11-18',
  },
}

/** False for a university whose online programmes rest on a non-DEB UGC basis. */
export function isOnDebRegister(uniId?: string): boolean {
  return !uniId || !Object.prototype.hasOwnProperty.call(NOT_ON_DEB_REGISTER, uniId)
}

/** The recorded non-DEB basis, or null for a register-listed university. */
export function debBasis(uniId?: string): DebBasis | null {
  return uniId && !isOnDebRegister(uniId) ? NOT_ON_DEB_REGISTER[uniId] : null
}

/**
 * "UGC-DEB approved." for a register-listed university, or the basis phrase
 * as a sentence for one that is not. For meta descriptions and schema prose.
 */
export function debApprovedSentence(uniId: string | undefined, form: 'UGC-DEB approved.' | 'UGC DEB approved.' = 'UGC-DEB approved.'): string {
  const b = debBasis(uniId)
  return b ? b.metaSentence : form
}
