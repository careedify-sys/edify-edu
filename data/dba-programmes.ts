// data/dba-programmes.ts
//
// Single source of truth for the /online-dba section (9 pages). Every value
// below comes from Rishi's DBA sheet (Nov 2026). Do not add a value that is not
// in that sheet.
//
// Held-back fields. Where feeConfirmed or locationConfirmed is false, the raw
// value stays here for the counsellor team but must never reach a page, a
// title, a meta description, schema or a client bundle. Pages read programmes
// through getPublicDbaProgrammes(), which nulls those fields, so a template
// cannot leak them by accident.
//
// Never published from the sheet: Highlights (marketing copy; Birchwood's is a
// verbatim copy of EIMT's), Weblink, Strategic Partner, CV Subsidy, NIRF,
// Graded Component, CAP, Admission Process, Support. WES appears in the sheet's
// accreditation column for GGU and Birchwood: it is a credential evaluation
// service, not an accreditor, so it is left out of providerStatedAccreditations.

export interface DbaProgramme {
  slug: string
  provider: string
  programmeName: string
  location: string | null
  locationConfirmed: boolean
  durationYears: number
  feeWithImmersion: number | null
  feeWithoutImmersion: number | null
  /** One fee with no immersion split (EIMT, Birchwood). */
  singleFee: number | null
  feeConfirmed: boolean
  bookingAmount: number
  eligibilityText: string
  totalCreditsText: string | null
  specialisationCount: number | null
  immersion: string
  liveSessions: boolean
  recordings: boolean
  attendanceRequired: string
  alumniStatus: boolean
  degreeFormat: string
  extraCertificate: string | null
  refundPolicyText: string
  deferralText: string
  reExamText: string | null
  providerStatedAccreditations: string[]
  accreditationsVerified: boolean
  /** Set when accreditationsVerified flips to true, e.g. '2027-01-15'. */
  accreditationsVerifiedOn: string | null
}

const COMMON = {
  durationYears: 3,
  immersion: 'Campus immersion available',
  liveSessions: true,
  recordings: true,
  attendanceRequired: '75%',
  alumniStatus: true,
  degreeFormat: 'Soft copy and physical degree',
  deferralText:
    'Deferral allowed. If the batch has already started, a 5% additional programme fee is charged and the learner moves to the next batch.',
  accreditationsVerified: false,
  accreditationsVerifiedOn: null,
} as const

const GGU_REFUND = 'Refund available any time before the cohort commencement date'

export const DBA_PROGRAMMES: DbaProgramme[] = [
  {
    ...COMMON,
    slug: 'golden-gate-university-dba',
    provider: 'Golden Gate University',
    programmeName: 'DBA',
    location: 'San Francisco, USA',
    locationConfirmed: true,
    feeWithImmersion: 1215000,
    feeWithoutImmersion: 1065000,
    singleFee: null,
    feeConfirmed: true,
    bookingAmount: 44999,
    eligibilityText: "Bachelor's with 55% marks, or 5+ years of experience, or 2-year PGDM",
    totalCreditsText: '56 (12 foundation + 12 concentration + 32 dissertation)',
    specialisationCount: null,
    extraCertificate: null,
    refundPolicyText: GGU_REFUND,
    reExamText:
      'One reattempt for the qualifying exam; resubmission allowed for assessments not cleared on first attempt',
    providerStatedAccreditations: ['AACSB', 'WASC'],
  },
  {
    ...COMMON,
    slug: 'rushford-business-school-dba',
    provider: 'Rushford Business School',
    programmeName: 'DBA',
    // Sheet says "Florida, Switzerland", which contradicts itself. Held back.
    location: null,
    locationConfirmed: false,
    feeWithImmersion: 650000,
    feeWithoutImmersion: 450000,
    singleFee: null,
    feeConfirmed: false,
    bookingAmount: 25000,
    eligibilityText: "Bachelor's with 55% marks, or 5+ years of experience, or 2-year PGDM",
    totalCreditsText: '180 ECTS',
    specialisationCount: 9,
    extraCertificate: 'NSDC certificate',
    // Sheet: "Same as GGU".
    refundPolicyText: GGU_REFUND,
    reExamText: null,
    providerStatedAccreditations: ['AACSB', 'EDUQUA', 'ACBSP'],
  },
  {
    ...COMMON,
    slug: 'ssbm-executive-dba',
    provider: 'SSBM',
    programmeName: 'Executive DBA',
    location: 'Switzerland',
    locationConfirmed: true,
    feeWithImmersion: 1050000,
    feeWithoutImmersion: 750000,
    singleFee: null,
    feeConfirmed: false,
    bookingAmount: 25000,
    eligibilityText: "Bachelor's degree with 5 years of experience, or a master's degree",
    totalCreditsText: null,
    specialisationCount: 19,
    extraCertificate: 'NSDC certificate',
    refundPolicyText: 'Refund available any time before the programme start date',
    reExamText: null,
    providerStatedAccreditations: ['ACBSP', 'CHEA', 'BAC'],
  },
  {
    ...COMMON,
    slug: 'esgci-dba',
    provider: 'ESGCI',
    programmeName: 'DBA',
    location: null,
    locationConfirmed: false,
    feeWithImmersion: 814000,
    feeWithoutImmersion: 650000,
    singleFee: null,
    feeConfirmed: true,
    bookingAmount: 25000,
    eligibilityText:
      "Master's degree, or bachelor's with 3+ years of experience; diploma considered with 8+ years of experience",
    totalCreditsText: '180 ECTS',
    specialisationCount: null,
    extraCertificate: 'ESGCI certificate',
    refundPolicyText: GGU_REFUND,
    reExamText: null,
    providerStatedAccreditations: ['ACBSP', 'FMHE', 'QUALIPI'],
  },
  {
    ...COMMON,
    slug: 'eimt-dba',
    provider: 'EIMT',
    programmeName: 'DBA',
    location: 'Switzerland',
    locationConfirmed: true,
    feeWithImmersion: null,
    feeWithoutImmersion: null,
    singleFee: 650000,
    feeConfirmed: true,
    bookingAmount: 25000,
    eligibilityText: "Master's degree with relevant experience",
    totalCreditsText: '180 ECTS',
    specialisationCount: null,
    extraCertificate: null,
    refundPolicyText:
      "One-time non-refundable application fee of USD 300; cancellation only in writing; refunds per the provider's refund schedule",
    reExamText: null,
    providerStatedAccreditations: ['ACBSP', 'EAI', 'EURASHE', 'OTHM'],
  },
  {
    ...COMMON,
    slug: 'birchwood-university-dba',
    provider: 'Birchwood University',
    programmeName: 'DBA',
    location: 'Florida, USA',
    locationConfirmed: true,
    feeWithImmersion: null,
    feeWithoutImmersion: null,
    singleFee: 600000,
    feeConfirmed: true,
    bookingAmount: 25000,
    eligibilityText: "Master's degree, or bachelor's degree with experience",
    totalCreditsText: '60 ECTS',
    specialisationCount: null,
    extraCertificate: null,
    refundPolicyText: 'No refund policy',
    reExamText: null,
    providerStatedAccreditations: ['QAHE', 'CIE (Commission for Independent Education)', 'CECU', 'FAPSC'],
  },
]

/** The programme with held-back fields removed. The only shape pages may render. */
export type PublicDbaProgramme = DbaProgramme

export function toPublic(p: DbaProgramme): PublicDbaProgramme {
  return {
    ...p,
    location: p.locationConfirmed ? p.location : null,
    feeWithImmersion: p.feeConfirmed ? p.feeWithImmersion : null,
    feeWithoutImmersion: p.feeConfirmed ? p.feeWithoutImmersion : null,
    singleFee: p.feeConfirmed ? p.singleFee : null,
    // The booking amount is a payment too. Held back with the fee so an
    // unconfirmed programme's page carries no rupee figure of its own.
    bookingAmount: p.feeConfirmed ? p.bookingAmount : 0,
  }
}

export function getPublicDbaProgrammes(): PublicDbaProgramme[] {
  return DBA_PROGRAMMES.map(toPublic)
}

export function getPublicDbaProgramme(slug: string): PublicDbaProgramme | null {
  const p = DBA_PROGRAMMES.find(x => x.slug === slug)
  return p ? toPublic(p) : null
}

/** Lowest published fee, or null when held back. */
export function lowestFee(p: PublicDbaProgramme): number | null {
  const fees = [p.feeWithoutImmersion, p.singleFee, p.feeWithImmersion].filter((f): f is number => f != null)
  return fees.length ? Math.min(...fees) : null
}

/** Cost of adding immersion, from the with-minus-without split. Null when there is no split. */
export function immersionCost(p: PublicDbaProgramme): number | null {
  return p.feeWithImmersion != null && p.feeWithoutImmersion != null
    ? p.feeWithImmersion - p.feeWithoutImmersion
    : null
}

/** True when refundPolicyText allows a refund up to the start of the programme or cohort. */
export function refundsBeforeStart(p: DbaProgramme): boolean {
  return /^Refund available any time before the (cohort commencement|programme start) date$/.test(p.refundPolicyText)
}

export function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

/** Display name: "SSBM Executive DBA", "Golden Gate University DBA". */
export function dbaDisplayName(p: DbaProgramme): string {
  return `${p.provider} ${p.programmeName}`
}

export const DBA_COUNSELLOR_FEE_LINE = 'Talk to our counsellor for the current fee and any available scholarship'
