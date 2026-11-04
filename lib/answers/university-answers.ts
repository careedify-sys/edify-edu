// lib/answers/university-answers.ts
//
// Answer-first sections for the questions searchers actually type about an
// online MBA (Google autocomplete sweep, gl=in, 4 Nov 2026). One builder feeds
// three surfaces so they cannot disagree:
//   - appendices to existing review blogs (scripts/build-ai-citation-appendix.mts
//     writes them into lib/blog.ts between ai-answers markers),
//   - <QuickAnswers> on MBA hubs with no review blog,
//   - the answer sections on /compare/[pair].
//
// Every fact comes from lib/data.ts, lib/fees.ts (getExactFee, which resolves
// through getDisplayFee) or a row in data/answer-provenance.json. Nothing here
// is hand-typed about a university except the provenance-backed placement
// lines in PLACEMENT_FACTS, each of which names its row id.
//
// Format (same everywhere): H2 = the question with the university's name; a
// 40-60 word standalone lead that names the university; a table or 3-5
// bullets; a plain "not recorded / not published" line where we lack data.

import type { University } from '../data'
import { specName, getUniversityById } from '../data'
import { getExactFee, formatExactFee, formatExactFeeShort, formatPublishedSemesterFee, type ExactFee } from '../fees'
import syllabusManifest from '../data/syllabus-manifest.json'
import { formatNirfBadge } from '../data-slim'
import naacVerified from '../../data/naac-verified.json'
import { provenance } from './provenance'

export type QId = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7' | 'Q8' | 'Q9' | 'Q10' | 'X'

export interface AnswerSection {
  key: string            // stable id, also the HTML anchor
  q: QId
  heading: string
  lead: string           // 40-60 words, standalone
  bullets?: string[]     // plain text; links via [label](href)
  table?: { head: string[]; rows: string[][] }
  notPublished?: string  // full sentence, rendered as its own line
  footnote?: string      // e.g. "Fee data last checked: 2026-10-26"
  faq?: { q: string; a: string }
  sources: string[]      // per-fact source refs for the report
  backed: boolean        // counts toward the QuickAnswers 5-question minimum
}

const TODAY = '2026-11-04'

// Display names for headings. Searchers type the brand, so the heading uses
// it; the legal name is u.name. Unlisted ids fall back to u.name minus the
// trailing " Online".
const DISPLAY: Record<string, string> = {
  'amity-university-online': 'Amity University',
  'manipal-university-jaipur-online': 'Manipal University Jaipur',
  'manipal-academy-higher-education-online': 'MAHE Manipal',
  'sikkim-manipal-university-online': 'Sikkim Manipal University',
  'chandigarh-university-online': 'Chandigarh University',
  'symbiosis-university-online': 'Symbiosis (SSODL)',
  'nmims-online': 'NMIMS',
  'lovely-professional-university-online': 'LPU',
  'uttaranchal-university-online': 'Uttaranchal University',
  'vignan-university-online': 'Vignan University',
  'bits-pilani-work-integrated-online': 'BITS Pilani WILP',
  'op-jindal-global-university-online': 'O.P. Jindal Global University',
  'vit-university-online': 'VIT',
  'srm-institute-science-technology-online': 'SRM Institute of Science and Technology',
  'jain-university-online': 'JAIN University',
  'dr-dy-patil-vidyapeeth-online': 'Dr. D.Y. Patil Vidyapeeth Pune',
  'dy-patil-university-online': 'D.Y. Patil University Navi Mumbai',
  'galgotias-university-online': 'Galgotias University',
  'amrita-vishwa-vidyapeetham-online': 'Amrita Vishwa Vidyapeetham',
  'parul-university-online': 'Parul University',
  'bharati-vidyapeeth-university-online': 'Bharati Vidyapeeth',
  'upes-online': 'UPES',
  'sharda-university-online': 'Sharda University',
  'chitkara-university-online': 'Chitkara University',
  'jamia-hamdard-online': 'Jamia Hamdard',
  'gla-university-online': 'GLA University',
  'shoolini-university-online': 'Shoolini University',
  'ignou-online': 'IGNOU',
  'kurukshetra-university-online': 'Kurukshetra University',
  'bennett-university-online': 'Bennett University',
}
export function displayName(u: University): string {
  return DISPLAY[u.id] ?? u.name.replace(/\s+Online$/, '').replace(/\s*\([^)]*\)\s*$/, '').trim()
}

// ── helpers ────────────────────────────────────────────────────────────────

const RANKED = (n?: number | null) => typeof n === 'number' && n > 0 && n < 999
export function nirfMgtPhrase(u: University): string | null {
  // formatNirfBadge keeps the category next to the number (check-nirf-category).
  return RANKED(u.nirfMgt) ? `${formatNirfBadge({ nirfMgt: u.nirfMgt }, { style: 'long' })} (2025)` : null
}
export function nirfUnivPhrase(u: University): string | null {
  return RANKED(u.nirf) ? `${formatNirfBadge({ nirf: u.nirf }, { style: 'long', prefer: 'university' })} (2025)` : null
}
/** Table cell: Management first for an MBA, never a sentinel. */
export function nirfCell(u: University): string {
  if (RANKED(u.nirfMgt)) return `#${u.nirfMgt} Management (parent institution)`
  if (RANKED(u.nirf)) return `No Management rank; #${u.nirf} University (parent institution)`
  return 'No NIRF ranking'
}

const NAAC_V = (naacVerified as { grades: Record<string, { grade: string; validTill: string | null }> }).grades
export function naacCycleNote(u: University): string | null {
  const v = NAAC_V[u.id]
  if (v?.validTill && v.validTill < TODAY) return `The NAAC cycle on record ran to ${v.validTill}; confirm the current status at naac.gov.in.`
  return null
}
export function naacCell(u: University): string {
  if (!u.naac) return 'No grade on record'
  const v = NAAC_V[u.id]
  return v?.validTill && v.validTill < TODAY ? `${u.naac} (cycle on record ended ${v.validTill})` : u.naac
}

export function feeLastChecked(u: University): string | null {
  const src = u.feeBreakdown?.mba?.source
  const m = src?.match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : null
}

const words = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim().split(/\s+/).filter(Boolean).length
export function leadWordCount(s: AnswerSection): number { return words(s.lead) }
/** Core sentences, then optional ones while the lead stays within 60 words. */
export function fitLead(core: string[], optional: string[] = [], max = 60): string {
  let out = core.join(' ')
  for (const o of optional) if (words(out + ' ' + o) <= max) out += ' ' + o
  return out
}

function specList(u: University): string[] {
  return (u.programDetails.MBA?.specs ?? []).map(specName)
}
function hasSpec(u: University, re: RegExp): string | null {
  return specList(u).find(s => re.test(s)) ?? null
}

const mbaFee = (u: University): ExactFee => getExactFee(u, 'MBA')

// ── placement facts, provenance only ───────────────────────────────────────

export type PlacementStatus = 'outcomes-unlabelled' | 'partners-only' | 'support-only' | 'none-found' | 'not-checked'
interface PlacementFact {
  status: PlacementStatus
  cell: string           // compare-table cell
  lead: (n: string) => string
  bullets: string[]
  notPublished: string
  prov: string[]
}
export const PLACEMENT_FACTS: Record<string, PlacementFact> = {
  'amity-university-online': {
    status: 'partners-only',
    cell: 'Assistance and 450+ hiring partners stated; no rate or package',
    lead: n => `${n} states that its online MBA comes with placement assistance and lists 450+ hiring partners on its programme page. That page gives no placement rate and no average or highest package for online MBA graduates, so read the offer as career support, not a placement outcome.`,
    bullets: ['Placement assistance: stated by the university', 'Hiring partners: 450+, as listed by the university', 'Placement rate: not on the programme page', 'Average or highest package: not on the programme page'],
    notPublished: 'Not published by the university on its MBA page: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['amity-placement-assistance', 'amity-hiring-partners'],
  },
  'lovely-professional-university-online': {
    status: 'support-only',
    cell: 'Placement support team described; no partner count, rate or package',
    lead: n => `${n} describes a dedicated placement support team for its online students. Its placement page shows a recruiters section but states no hiring-partner count, no placement rate and no salary figure, so the online MBA comes with support rather than a published outcome.`,
    bullets: ['Placement support: described by the university', 'Hiring-partner count: not stated', 'Placement rate: not stated', 'Package figures: not stated'],
    notPublished: 'Not published by the university on its placement page: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['lpu-placement-support'],
  },
  'symbiosis-university-online': {
    status: 'none-found',
    cell: 'No placement statement found on the home or MBA page',
    lead: n => `${n} makes no placement claim for its online MBA on the pages edifyedu.in checked. Neither the SSODL home page nor its MBA page mentions placement assistance, hiring partners or salary figures, so do not assume placement support is part of the fee. Ask for it in writing.`,
    bullets: ['Placement assistance: not mentioned on the home or MBA page', 'Hiring partners: not mentioned', 'Salary figures: not mentioned'],
    notPublished: 'Not published by the university on the pages checked: any placement service, placed-student count or salary figure for online MBA graduates.',
    prov: ['ssodl-no-placement-statement'],
  },
  'jain-university-online': {
    status: 'outcomes-unlabelled',
    cell: 'University-wide figures published (2000+ corporates, 15,454+ jobs facilitated); not labelled for the MBA',
    lead: n => `${n} Online publishes university-wide career figures: 2000+ hiring corporates, 15,454+ jobs facilitated, a 65% average salary hike and a 78% career success rate. None of these is labelled as an online MBA outcome, and the site does not define how they are measured.`,
    bullets: ['Hiring corporates: 2000+, as stated by the university', 'Jobs facilitated: 15,454+, not defined on the page', 'Average salary hike: 65%, not defined on the page', 'Career success rate: 78%, not defined on the page'],
    notPublished: 'Not published by the university: an online MBA placed-student count, placement rate or median salary for online MBA graduates.',
    prov: ['jain-hiring-corporates', 'jain-outcome-figures'],
  },
  'uttaranchal-university-online': {
    status: 'support-only',
    cell: 'Placement assistance with CV workshops and mock interviews; no figures',
    lead: n => `${n} lists placement assistance for its online MBA, including CV workshops and mock interviews. Its online site states no hiring-partner count, placement rate or package figure for online learners, so treat placement as preparation support rather than a published outcome.`,
    bullets: ['Placement assistance: stated by the university', 'CV workshops and mock interviews: stated', 'Hiring-partner count: not stated', 'Placement rate and package: not stated'],
    notPublished: 'Not published by the university on its online site: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['uu-placement-assistance'],
  },
  'galgotias-university-online': {
    status: 'partners-only',
    cell: 'Career workshops and 500+ hiring partners stated; no rate or package',
    lead: n => `${n} Online offers career and placement assistance through workshops on resumes, interviews and networking, and lists 500+ hiring partners. It states no placement rate and no package figure for online MBA graduates, so the support is preparation and access, not a placement guarantee.`,
    bullets: ['Career and placement assistance: stated by the university', 'Workshops on resumes, interviews and networking: stated', 'Hiring partners: 500+, as listed by the university', 'Placement rate and package: not stated'],
    notPublished: 'Not published by the university: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['galgotias-hiring-partners', 'galgotias-career-workshops'],
  },
  'bharati-vidyapeeth-university-online': {
    status: 'support-only',
    cell: 'States it gives no placement, only assistance (mock tests, virtual drives)',
    lead: n => `${n} says plainly that its online centre does not give placement, it provides assistance. That assistance covers career counselling, placement training, online mock tests and virtual placement drives, which cost nothing extra to join. No hiring-partner count, placement rate or package is published.`,
    bullets: ['Placement: "CDOE does not give any placement", per the university', 'Assistance: counselling, training, mock tests, virtual drives', 'Virtual drives: free to join, per the university', 'Placement rate and package: not stated'],
    notPublished: 'Not published by the university: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['bv-no-placement', 'bv-placement-services'],
  },
  'upes-online': {
    status: 'support-only',
    cell: 'Names alumni employers; no partner count, rate or package',
    lead: n => `${n} Online names Amazon, KPMG and Mahindra as companies where alumni of its online MBA, BBA and other programmes work, and links a career assistance page. It publishes no hiring-partner count, placement rate or package figure for online MBA graduates on its home page.`,
    bullets: ['Alumni employers named by the university: Amazon, KPMG, Mahindra', 'Career assistance: linked, not described on the home page', 'Hiring-partner count: not stated', 'Placement rate and package: not stated'],
    notPublished: 'Not published by the university on its home page: placed-student count, placement rate, median or average salary for online MBA graduates.',
    prov: ['upes-alumni-employers'],
  },
  'sharda-university-online': {
    status: 'outcomes-unlabelled',
    cell: 'Outcome figures published for UG and PG cohorts, not labelled online MBA; recruiter count stated three ways',
    lead: n => `${n} Online describes end-to-end placement support and publishes outcome figures, but labels them by UG and PG cohort rather than as online MBA results. Its home page also gives three different recruiter counts: 300+, 450+ and 600+. Ask which figures describe online MBA graduates.`,
    bullets: ['Placement support: described as end-to-end by the university', 'Recruiter counts on one page: 300+, 450+ and 600+', 'Outcome figures: labelled UG cohort and PG cohort, not online MBA', 'Online MBA placement rate: not stated'],
    notPublished: 'Not published by the university: an online MBA placed-student count, placement rate or median salary for online MBA graduates.',
    prov: ['sharda-placement-support', 'sharda-recruiter-counts', 'sharda-cohort-labels'],
  },
}
export function placementCell(u: University): string {
  return PLACEMENT_FACTS[u.id]?.cell ?? 'Not checked by edifyedu.in'
}

// ── question builders ──────────────────────────────────────────────────────

export interface BuildOpts {
  /** Fact types the host page already states differently: leave them out (CONFLICT RULE). */
  omit?: ReadonlyArray<'fee' | 'specCount' | 'naac' | 'nirf'>
  /** Legit post that owns Q4/Q9 for this university. */
  legitSlug?: string | null
}

function q1(u: University, n: string): AnswerSection {
  const fee = mbaFee(u)
  const pd = u.programDetails.MBA!
  const dur = (pd.duration || '2 Years').toLowerCase()
  const checked = feeLastChecked(u)
  if (fee.kind === 'none') {
    return {
      key: 'fee', q: 'Q1', heading: `What is the total fee of ${n} online MBA?`,
      lead: `edifyedu.in does not print a total fee for the ${n} online MBA right now, because the fee figures we hold for it do not agree closely enough to publish. Talk to our counsellor for the current fee in writing before you apply. We never estimate a number we cannot back.`,
      notPublished: 'Not recorded on edifyedu.in: a fee for this programme that passes our fee checks.',
      faq: { q: `What is the total fee of ${n} online MBA?`, a: `edifyedu.in does not publish a fee for the ${n} online MBA because the figures we hold do not agree. Talk to our counsellor for the current fee in writing.` },
      sources: ['lib/fees.ts getExactFee=none'], backed: false,
    }
  }
  const total = formatExactFee(fee)!
  const rows: string[][] = []
  if (fee.kind === 'labelled') {
    const b = fee.breakdown
    if (b.modes?.length) for (const m of b.modes) rows.push([`${n} online MBA, ${m.label}`, formatExactFee({ kind: 'exact', min: m.amount, max: m.amount, from: false })!])
    else {
      rows.push([`${n} online MBA, ${b.listLabel ?? 'list price'}`, formatExactFee({ kind: 'exact', min: b.list, max: b.list, from: false })!])
      if (b.net) rows.push([`${n} online MBA, ${b.net.label}`, formatExactFee({ kind: 'exact', min: b.net.min, max: b.net.max, from: false })!])
    }
    const sem = formatPublishedSemesterFee(fee)
    if (sem) rows.push([`${n} online MBA, per semester (published)`, sem])
  } else {
    rows.push([`${n} online MBA, total programme fee`, total])
  }
  const lead = fee.kind === 'labelled'
    ? `The ${n} online MBA has more than one published price: ${total}. The table sets out each tier with its label, so you can see which figure applies to you. Fees are indicative and change by intake, so confirm the current fee with our counsellor before you pay anything.`
    : `The ${n} online MBA costs ${total} in total for the ${dur} programme, on the fee data edifyedu.in holds for it. Fees are indicative and change by intake, so confirm the current figure, and any registration or exam charge, with our counsellor before you pay.`
  return {
    key: 'fee', q: 'Q1', heading: `What is the total fee of ${n} online MBA?`,
    lead,
    table: { head: ['Fee item', 'Amount'], rows },
    notPublished: 'Not recorded on edifyedu.in: registration, examination or alumni charges outside the programme fee.',
    footnote: checked ? `Fee data last checked: ${checked}` : undefined,
    faq: { q: `What is the total fee of ${n} online MBA?`, a: `${n} online MBA: ${total}. Fees are indicative, so confirm the current figure with our counsellor before you pay.` },
    sources: [`lib/fees.ts getExactFee kind=${fee.kind}`], backed: true,
  }
}

function q2(u: University, n: string, opts: BuildOpts): AnswerSection {
  const specs = specList(u)
  const k = specs.length
  const fee = mbaFee(u)
  const om = new Set(opts.omit ?? [])
  const feeShort = !om.has('fee') && fee.kind !== 'none' ? formatExactFeeShort(fee) : null
  const mgt = om.has('nirf') ? null : nirfMgtPhrase(u), univ = om.has('nirf') ? null : nirfUnivPhrase(u)
  const pros: string[] = [], cons: string[] = []
  const pf = PLACEMENT_FACTS[u.id]
  if (u.ugc) pros.push('For: UGC-DEB entitled for online delivery, so the degree carries the same standing as a campus MBA under UGC Regulation 22.')
  const cyc = naacCycleNote(u)
  if (!om.has('naac')) {
    if (u.naac === 'A++') pros.push('For: NAAC A++, the highest grade NAAC awards.')
    else if (u.naac === 'A+') pros.push('For: NAAC A+ accreditation.')
    else if (u.naac) cons.push(`Against: NAAC ${u.naac}, below the A+ and A++ grades.`)
    else cons.push('Against: no NAAC grade on record with edifyedu.in.')
    if (cyc) cons.push(`Against: ${cyc.charAt(0).toLowerCase() + cyc.slice(1)}`)
  }
  if (!om.has('nirf')) {
    if (mgt) pros.push(`For: the parent institution is ranked ${mgt}.`)
    else if (univ) cons.push(`Against: no NIRF Management rank. The parent institution is ranked ${univ}, which does not assess its business school.`)
    else cons.push('Against: no NIRF ranking for the parent institution.')
  }
  if (!om.has('specCount')) {
    if (k >= 10) pros.push(`For: ${k} specialisations, a wide choice.`)
    else if (k <= 6) cons.push(`Against: ${k} specialisations, a narrow choice.`)
  }
  if (fee.kind === 'none' && !om.has('fee')) cons.push('Against: no fee edifyedu.in can publish, so get the full fee in writing first.')
  cons.push(pf ? `Against: ${pf.cell.charAt(0).toLowerCase() + pf.cell.slice(1)}.` : 'Against: no placement outcome for online graduates verified by edifyedu.in.')
  const naacBit = om.has('naac') ? '' : u.naac ? ` with NAAC ${u.naac} accreditation` : ' with no NAAC grade on record'
  const offer = om.has('specCount')
    ? (feeShort ? `Its published fee is ${feeShort}.` : `Its specialisations are listed on its programme page.`)
    : `It offers ${k} specialisations${feeShort ? ` for ${feeShort}` : ''}.`
  const placementBit = pf ? 'Its placement offer is support, not a published outcome for online graduates' : 'edifyedu.in has verified no placement outcome for online graduates'
  const lead = fitLead([`The ${n} online MBA is worth it if you need a UGC-DEB entitled degree${naacBit}${mgt ? ` from a parent institution ranked ${mgt}` : ''}.`, offer, `${placementBit}, so judge it on cost, approvals and fit.`], ['The points below come from data edifyedu.in holds.', 'None of them comes from a student review.'])
  return {
    key: 'worth-it', q: 'Q2', heading: `Is ${n} online MBA worth it?`,
    lead, bullets: [...pros, ...cons],
    notPublished: 'Not used here: student reviews. edifyedu.in does not quote unverified reviews, and none of the points above comes from one.',
    faq: { q: `Is ${n} online MBA worth it?`, a: lead },
    sources: ['lib/data.ts ugc, naac, nirf, nirfMgt, programDetails.MBA.specs', feeShort ? 'lib/fees.ts formatExactFeeShort' : '', 'provenance ugc-reg22-equivalence', ...(pf?.prov ?? [])].filter(Boolean),
    backed: true,
  }
}

function q3(u: University, n: string): AnswerSection | null {
  const pf = PLACEMENT_FACTS[u.id]
  if (!pf) return null
  return {
    key: 'placements', q: 'Q3', heading: `Does ${n} online MBA provide placements? What is the average package?`,
    lead: pf.lead(n), bullets: pf.bullets, notPublished: pf.notPublished,
    faq: { q: `Does ${n} online MBA provide placements?`, a: pf.lead(n) },
    sources: pf.prov.map(p => `provenance ${p}`), backed: true,
  }
}

function q4(u: University, n: string): AnswerSection | null {
  if (!u.ugc) return null
  provenance('ugc-reg22-equivalence')
  const lead = `Yes. The ${n} online MBA is a valid degree in India when you join a session for which UGC-DEB has entitled the university, and edifyedu.in records it as entitled. Regulation 22 of the UGC ODL and Online Programmes Regulations, 2020 says such degrees "shall be treated as equivalent" to campus degrees.`
  return {
    key: 'degree-valid', q: 'Q4', heading: `Is the ${n} online MBA degree valid, and does it say "online"?`,
    lead,
    bullets: [
      'UGC-DEB entitlement: recorded on edifyedu.in',
      'Equivalence: UGC Regulation 22, read at [deb.ugc.ac.in](https://deb.ugc.ac.in/FAQ)',
      'Check your programme and intake year on the [UGC-DEB register](https://deb.ugc.ac.in) before you pay',
    ],
    notPublished: `Not verified by edifyedu.in: whether the ${n} degree certificate states the online mode. Ask the university for a sample in writing, or talk to our counsellor.`,
    faq: { q: `Is ${n} online MBA degree valid?`, a: lead },
    sources: ['lib/data.ts ugc', 'provenance ugc-reg22-equivalence'], backed: true,
  }
}

function q5(u: University, n: string): AnswerSection | null {
  const specs = specList(u)
  if (!specs.length) return null
  const k = specs.length
  const lead = k === 1
    ? `${n} offers one specialisation in its online MBA on the programme list edifyedu.in holds: ${specs[0]}. If you want a different track, compare other universities before you apply, and confirm with our counsellor that this track is open for your intake.`
    : `${n} offers ${k} specialisations in its online MBA on the programme list edifyedu.in holds, from ${specs[0]} to ${specs[k - 1]}. The full list is below. Confirm with our counsellor that your chosen specialisation is open for your intake before you pay any fee.`
  return {
    key: 'specialisations', q: 'Q5', heading: `What specialisations does ${n} online MBA offer?`,
    lead, bullets: specs,
    notPublished: 'Not recorded on edifyedu.in: whether a dual specialisation is offered, or a separate fee for any track.',
    faq: { q: `What specialisations does ${n} online MBA offer?`, a: `${k} on the list edifyedu.in holds: ${specs.join(', ')}.` },
    sources: [`lib/data.ts programDetails.MBA.specs (${k})`], backed: true,
  }
}

function q6(u: University, n: string): AnswerSection | null {
  if (!u.eligibility) return null
  const elig = u.eligibility.replace(/\.$/, '')
  const lead = fitLead([`The ${n} online MBA asks for the following, as recorded on edifyedu.in: ${elig.charAt(0).toLowerCase() + elig.slice(1)}. edifyedu.in has no entrance test or work-experience requirement on record for this programme, so confirm both with our counsellor before you apply.`],
    ['Our counsellor can also tell you which documents to keep ready.'])
  const bullets = [`Qualifying degree: ${elig}`]
  if (u.eligibilityPct > 0) bullets.push(`Minimum marks on record: ${u.eligibilityPct}%`)
  bullets.push('Entrance test: none on record with edifyedu.in', 'Work experience: none on record with edifyedu.in')
  return {
    key: 'eligibility', q: 'Q6', heading: `What is the eligibility for ${n} online MBA?`,
    lead, bullets,
    notPublished: 'Not recorded on edifyedu.in: reserved-category relaxation, and whether final-year students get provisional admission.',
    faq: { q: `What is the eligibility for ${n} online MBA?`, a: `${elig}, as recorded on edifyedu.in. No entrance test or work-experience requirement is on record; confirm with our counsellor.` },
    sources: ['lib/data.ts eligibility, eligibilityPct'], backed: true,
  }
}

function q7(u: University, n: string): AnswerSection | null {
  if (!u.examMode) return null
  const gal = u.id === 'galgotias-university-online'
  const mode = u.examMode === 'Online' ? 'taken online' : u.examMode === 'Exam Centre' ? 'held at exam centres' : u.examMode === 'Hybrid' ? 'held in a hybrid format' : 'assignment-based'
  const lead = `edifyedu.in records ${n} online MBA examinations as ${mode}${gal ? ', and the university lists online examinations under assessment and evaluation' : ''}. The university sets the exam schedule and proctoring rules each term, so ask our counsellor for the current exam pattern, including how assignments and term-end exams are weighted, before you enrol.`
  return {
    key: 'exams', q: 'Q7', heading: `How are ${n} online MBA exams conducted?`,
    lead,
    bullets: [`Exam mode on record: ${u.examMode}`, 'Proctoring method: not recorded', 'Assignment and term-end weighting: not recorded'],
    notPublished: 'Not recorded on edifyedu.in: the proctoring method, the split between assignments and term-end exams, and the passing mark.',
    faq: { q: `How are ${n} online MBA exams conducted?`, a: `edifyedu.in records them as ${mode}. Ask our counsellor for the current proctoring rules and weighting.` },
    sources: [`lib/data.ts examMode=${u.examMode}`, ...(gal ? ['provenance galgotias-online-exams'] : [])], backed: true,
  }
}

function q8(u: University, n: string): AnswerSection | null {
  // Manifest _core only. getSyllabus() falls back to the legacy MASTER_SYLLABUS
  // in lib/content.ts, which is not university-specific enough to cite.
  const syl = (syllabusManifest as unknown as Record<string, Record<string, Record<string, { semesters?: { sem: number; subjects: string[] }[] }>>>)[u.id]?.mba?._core
  const sems = syl?.semesters?.filter(s => s.subjects?.length) ?? []
  if (!sems.length) return null
  const held = new Set(sems.map(s => s.sem))
  const rows = sems.map(s => [`Semester ${s.sem}`, s.subjects.join(', ')])
  const missing = [1, 2, 3, 4].filter(s => !held.has(s))
  for (const s of missing) rows.push([`Semester ${s}`, 'Not published on edifyedu.in (varies by specialisation)'])
  rows.sort((a, b) => a[0].localeCompare(b[0]))
  const counts = sems.map(s => `${s.subjects.length} in semester ${s.sem}`).join(' and ')
  const lead = `edifyedu.in holds the core syllabus for ${sems.length === 1 ? 'one semester' : `${sems.length} semesters`} of the ${n} online MBA: ${counts}, listed below. ${missing.length ? `Semesters ${missing.join(' and ')} depend on the specialisation you pick, and we do not hold those papers for every track.` : ''} Confirm the current syllabus with our counsellor before you enrol.`
  return {
    key: 'syllabus', q: 'Q8', heading: `What is the ${n} online MBA syllabus?`,
    lead: lead.replace(/\s+/g, ' '),
    table: { head: ['Semester', 'Core subjects held by edifyedu.in'], rows },
    notPublished: missing.length ? `Not published on edifyedu.in: the semester ${missing.join(' and ')} papers for each specialisation.` : undefined,
    faq: { q: `What is the ${n} online MBA syllabus?`, a: `Core papers held by edifyedu.in: ${sems.map(s => `semester ${s.sem}: ${s.subjects.join(', ')}`).join('; ')}.` },
    sources: ['lib/data/syllabus-manifest.json (_core) via lib/syllabus.ts getSyllabus'], backed: true,
  }
}

function q9(u: University, n: string, extra?: { wes?: boolean }): AnswerSection {
  const mgt = nirfMgtPhrase(u), univ = nirfUnivPhrase(u)
  const nirfS = mgt ? `The parent institution is ranked ${mgt}.` : univ ? `The parent institution is ranked ${univ} and holds no Management rank.` : 'It holds no NIRF ranking.'
  const lead = `Yes. edifyedu.in records ${n} as UGC-DEB entitled to offer online programmes${u.naac ? `, and the university holds NAAC ${u.naac} accreditation` : ''}. ${nirfS} Check each claim yourself on the official registers linked below before you pay, because entitlement is granted per programme and per session.`
  const cyc = naacCycleNote(u)
  return {
    key: 'approvals', q: 'Q9', heading: `Is ${n} online MBA UGC approved?`,
    lead,
    bullets: [
      `UGC-DEB: entitled, on record with edifyedu.in (check at [deb.ugc.ac.in](https://deb.ugc.ac.in))`,
      `NAAC: ${naacCell(u)} (check at [naac.gov.in](https://naac.gov.in))`,
      `NIRF 2025: ${nirfCell(u)} (check at [nirfindia.org](https://www.nirfindia.org))`,
      extra?.wes ? 'WES: the university states its degrees are recognised by WES Canada and USA' : 'AICTE and WES: edifyedu.in has not verified this; talk to our counsellor',
    ],
    notPublished: cyc ?? undefined,
    faq: { q: `Is ${n} online MBA UGC approved?`, a: lead },
    sources: ['lib/data.ts ugc, naac, nirf, nirfMgt', 'data/naac-verified.json validTill', ...(extra?.wes ? ['provenance amity-wes'] : [])],
    backed: true,
  }
}

// ── university-specific extras ─────────────────────────────────────────────

const MANIPAL = ['manipal-university-jaipur-online', 'manipal-academy-higher-education-online', 'sikkim-manipal-university-online']
const DYPATIL = ['dr-dy-patil-vidyapeeth-online', 'dy-patil-university-online']

export function manipalDisambiguation(): AnswerSection {
  const us = MANIPAL.map(id => getUniversityById(id)!).filter(Boolean)
  return {
    key: 'which-manipal', q: 'X', heading: 'Which Manipal is it? MUJ, MAHE and Sikkim Manipal online MBA',
    lead: 'Three separate universities sell an online MBA under the Manipal name: Manipal University Jaipur (MUJ), Manipal Academy of Higher Education (MAHE) and Sikkim Manipal University. Each holds its own UGC-DEB entitlement, NAAC grade and NIRF position, and the name on your degree is that university, so check which one you are applying to.',
    table: {
      head: ['University', 'Location', 'NAAC', 'NIRF 2025', 'MBA specialisations'],
      rows: us.map(u => [u.name.replace(/\s+Online$/, ''), [u.city, u.state].filter(x => x && x !== 'Online').join(', ') || 'Not recorded', naacCell(u), nirfCell(u), String(u.programDetails.MBA?.specs.length ?? 0)]),
    },
    sources: MANIPAL.map(id => `lib/data.ts ${id} name, city, state, naac, nirf, nirfMgt, specs`),
    backed: true,
  }
}

export function dyPatilDisambiguation(withFee = true, withRegisters = true): AnswerSection {
  const us = DYPATIL.map(id => getUniversityById(id)!).filter(Boolean)
  return {
    key: 'which-dy-patil', q: 'X', heading: 'Which D.Y. Patil? Pune and Navi Mumbai online MBA',
    lead: 'Two different universities run an online MBA under the D.Y. Patil name: Dr. D.Y. Patil Vidyapeeth in Pune and D.Y. Patil University in Navi Mumbai. They hold separate UGC-DEB entitlements, NAAC grades and NIRF positions, so check the city and the legal name on the admission page before you pay.',
    table: {
      head: ['University', 'City', ...(withRegisters ? ['NAAC', 'NIRF 2025'] : []), 'MBA specialisations', ...(withFee ? ['Total fee'] : [])],
      rows: us.map(u => [u.name.replace(/\s+Online$/, ''), u.id === 'dr-dy-patil-vidyapeeth-online' ? 'Pune' : 'Navi Mumbai', ...(withRegisters ? [naacCell(u), nirfCell(u)] : []), String(u.programDetails.MBA?.specs.length ?? 0), ...(withFee ? [formatExactFee(mbaFee(u)) ?? 'Talk to our counsellor'] : [])]),
    },
    sources: DYPATIL.map(id => `lib/data.ts ${id} name, naac, nirf, specs; lib/fees.ts getExactFee`),
    backed: true,
  }
}

/** Autocomplete-worded FAQ items about specialisations people search for. */
const SEARCHED_SPECS: Record<string, { label: string; re: RegExp }[]> = {
  'amrita-vishwa-vidyapeetham-online': [{ label: 'ACCA', re: /acca/i }, { label: 'ESG', re: /\besg\b|sustainab/i }],
  'upes-online': [{ label: 'oil and gas', re: /oil|gas/i }, { label: 'power management', re: /power/i }],
  'chitkara-university-online': [{ label: 'pharmaceutical management', re: /pharma/i }],
  'jamia-hamdard-online': [{ label: 'pharmaceutical management', re: /pharma/i }],
  'sharda-university-online': [{ label: 'hospital management', re: /hospital|health/i }],
  'kurukshetra-university-online': [{ label: 'business analytics', re: /analytic/i }],
  'nmims-online': [{ label: 'business analytics', re: /analytic|data/i }],
  'symbiosis-university-online': [{ label: 'healthcare management', re: /health|hospital/i }, { label: 'business analytics', re: /analytic/i }],
  'op-jindal-global-university-online': [{ label: 'business analytics', re: /analytic/i }],
  'manipal-university-jaipur-online': [{ label: 'healthcare management', re: /health|hospital/i }],
  'chandigarh-university-online': [{ label: 'finance', re: /financ/i }],
}
export function searchedSpecFaqs(u: University, n: string): { q: string; a: string }[] {
  return (SEARCHED_SPECS[u.id] ?? []).map(({ label, re }) => {
    const hit = hasSpec(u, re)
    return {
      q: `Does ${n} online MBA offer ${label}?`,
      a: hit
        ? `Yes. ${n} lists "${hit}" among its online MBA specialisations on the programme list edifyedu.in holds. edifyedu.in does not hold a separate fee for this track, so talk to our counsellor for it.`
        : `Not on the programme list edifyedu.in holds for the ${n} online MBA, which has ${specList(u).length} specialisations. Talk to our counsellor to confirm before you rule it out.`,
    }
  })
}

// ── assembly ───────────────────────────────────────────────────────────────

export const ALL_Q: QId[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9']

export function buildSections(u: University, want: QId[], opts: BuildOpts = {}): AnswerSection[] {
  const n = displayName(u)
  const out: AnswerSection[] = []
  if (MANIPAL.includes(u.id)) out.push(manipalDisambiguation())
  if (DYPATIL.includes(u.id)) out.push(dyPatilDisambiguation(!(opts.omit ?? []).includes('fee'), !(opts.omit ?? []).some(o => o === 'naac' || o === 'nirf')))
  for (const q of want) {
    const s =
      q === 'Q1' ? q1(u, n) :
      q === 'Q2' ? q2(u, n, opts) :
      q === 'Q3' ? q3(u, n) :
      q === 'Q4' ? q4(u, n) :
      q === 'Q5' ? q5(u, n) :
      q === 'Q6' ? q6(u, n) :
      q === 'Q7' ? q7(u, n) :
      q === 'Q8' ? q8(u, n) :
      q === 'Q9' ? q9(u, n, { wes: u.id === 'amity-university-online' }) : null
    if (s) out.push(s)
  }
  return out
}
