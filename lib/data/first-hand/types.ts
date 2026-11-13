// lib/data/first-hand/types.ts
//
// Rishi's first-hand content for one university: what students tell him,
// what the university says, and his verdict. One file per university in this
// folder; getFirstHand() in ./index.ts returns undefined for every other
// university, and their pages render exactly as before.
//
// Rules for these files (enforced by scripts/check-first-hand.mjs):
//   - no rupee figures (no ₹, Rs or INR followed by a number). Amounts are
//     tokens, filled from lib/data.ts by lib/first-hand.ts:
//       {{registration}}        University.admissionPayments.registration
//       {{initial}}             University.admissionPayments.initial
//       {{admissionProcessing}} the default MBA feePlan's "Admission processing" extra
//       {{semester1Balance}}    default MBA feePlan semester instalment minus {{initial}}
//   - no em dashes
//   - copy is Rishi's, verbatim. Do not add claims, numbers or adjectives.
//   - internal links are written [text](/path). No links to university sites.

/** One row of the approvals table (Body | What X holds | Source and date). */
export type FirstHandApproval =
  // Built from lib/data/ugc-deb-extract.json (UGC-DEB online programme list).
  | { kind: 'ugc-deb'; holds?: string }
  // Built from University.naac, plus the UGC file's CGPA and date when it has them.
  | { kind: 'naac' }
  // Built from University.nirf / nirfMgt and the UGC file's NIRF columns.
  // Fails the build when the two disagree.
  | { kind: 'nirf'; body: string }
  // Text row, wording given by Rishi. link only for deb/naac/nirf or an internal path.
  | { kind: 'text'; body: string; holds: string; source?: string; link?: string }

export interface FirstHandFaq {
  q: string
  a: string
}

export interface FirstHandUniversity {
  universityId: string
  author: string
  /** YYYY-MM-DD */
  reviewedOn: string
  /** "Amity Online", used in the byline: "...conversations with students about {subject}." */
  subject: string
  /** "Amity", for headings such as "Who Amity's online MBA is for". */
  shortName: string
  /** Whose NIRF rank and accreditation these are, e.g. "Amity University Uttar Pradesh, Noida". */
  parentName: string
  whatItIs: string
  approvalsIntro: string
  approvals: FirstHandApproval[]
  /** Section "How X Online classes work". Optional. */
  batches?: string
  exams: string
  studentToolsIntro?: string
  studentTools: { name: string; text: string }[]
  worksWell: { name: string; text: string }[]
  /** Heading of the second list. Defaults to "What students complain about". */
  complaintsHeading?: string
  complaints: { name: string; text: string }[]
  whoShouldChoose: string[]
  whoShouldNot: string[]
  admissionSteps: string[]
  documents: string[]
  documentsNote?: string
  specialisationAdvice: string
  placements: {
    universitySays: string
    /** YYYY-MM-DD */
    universitySaysCheckedOn: string
    iHaveSeen: string
    /** Answer to the university page's generated placement FAQ. */
    universityPageFaq: string
  }
  /** Short box, heading "About the 2023 UGC debarment" and similar. Optional. */
  noticeBox?: { heading: string; text: string }
  redFlags: { title: string; text: string }[]
  verdict: {
    oneLine: string
    detail: string
    worthItIf: string[]
    notWorthItIf: string[]
  }
  counsellorsWontTell: string
  /** Line at the end of the MBA hub's first-hand block linking the review post. */
  reviewLine?: string
  faqsUniversityPage: FirstHandFaq[]
  /** Added first on the MBA hub. Edits to existing hub FAQs live in the page-content JSON. */
  faqsMbaHub: FirstHandFaq[]
}
