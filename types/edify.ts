// types/edify.ts — Shared type definitions
// Separating types from implementation keeps lib/data.ts importable in RSC
// without pulling in the full 420KB data payload

export type Region = 'North' | 'South' | 'East' | 'West' | 'Central'

export type Program =
  | 'MBA' | 'MCA' | 'BBA' | 'BCA'
  | 'B.Com' | 'M.Com' | 'BA' | 'MA'
  | 'MSc' | 'BSc' | 'MBA (WX)'

export type ExamMode = 'Online' | 'Proctored Online' | 'Hybrid'

export interface ProgramDetail {
  specs: string[]
  fees: string
  duration: string
  roles: string[]
  avgSalary: string
  topCompanies: string[]
  internshipType: string
  careerOutcome: string
  edifySkills?: string[]
  edifyProjects?: string[]
  edifyInternships?: string[]
}

export interface University {
  id: string
  name: string
  abbr: string
  city: string
  state: string
  region: Region
  nirf: number
  nirfm?: number
  nirfCategory?: string
  naac: string
  ugc: boolean
  approvals: string[]
  examMode: ExamMode
  govtRecognised: boolean
  psuEligible: boolean
  feeMin: number
  feeMax: number
  emiFrom: number
  eligibility: string
  eligibilityPct: number
  highlight: string
  tagline: string
  description: string
  forWho?: string[]
  notFor?: string[]
  programs: Program[]
  programDetails: Partial<Record<Program, ProgramDetail>>
  color: string
}

export interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: number
  content: string
  faqs: { q: string; a: string }[]
  relatedUniversities: string[]
  targetKeyword: string
  status: 'published' | 'draft'
}
