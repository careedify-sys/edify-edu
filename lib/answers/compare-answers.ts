// lib/answers/compare-answers.ts
//
// Answer-first sections for /compare/[pair] (AI-citation sprint, 2026-11-04):
// a verdict, a side-by-side table of the points edifyedu.in can source, a
// syllabus comparison (mandatory on every pair) and autocomplete-worded FAQ
// items appended after the pair's existing FAQs.
//
// CONFLICT RULE. The 11 hand-written pairs carry claims in their FAQs and
// verdicts. pairConflicts() runs the same sentence scanner the hubs use
// (textConflicts) over that text for each university and leaves out any fact
// type stated differently. Any NIRF mention at all in the existing text drops
// NIRF from the new sections: pairs.ts states NMIMS "NIRF #17 Management"
// where lib/data.ts holds #24, and the new copy must not add a third figure.

import type { University } from '../data'
import { getExactFee, formatExactFee, type ExactFee } from '../fees'
import {
  displayName, nirfMgtPhrase, nirfUnivPhrase, nirfCell, naacCell, placementCell, feeLastChecked,
  coreSemesters, fitLead, manipalDisambiguation, dyPatilDisambiguation, PLACEMENT_FACTS, type AnswerSection,
} from './university-answers'
import { textConflicts, type HubConflict } from './hub-answers'

const MANIPAL = new Set(['manipal-university-jaipur-online', 'manipal-academy-higher-education-online', 'sikkim-manipal-university-online'])
const DYPATIL = new Set(['dr-dy-patil-vidyapeeth-online', 'dy-patil-university-online'])

export interface PairInput {
  slug: string
  uA: University
  uB: University
  faqs: ReadonlyArray<{ q: string; a: string }>
  verdictA: ReadonlyArray<string>
  verdictB: ReadonlyArray<string>
  /** true for pairs whose verdicts were derived from data (pair-verdict.ts). */
  derived: boolean
}

export interface PairAnswers {
  sections: AnswerSection[]
  faqs: { q: string; a: string }[]
  omitted: { uni: string; conflict: HubConflict }[]
}

type Fact = 'fee' | 'specCount' | 'naac' | 'nirf'

function pairOmit(p: PairInput): { omit: Set<Fact>; omitted: PairAnswers['omitted'] } {
  const omit = new Set<Fact>(), omitted: PairAnswers['omitted'] = []
  if (p.derived) return { omit, omitted }
  // Fee FAQs whose answer quotes rupees are replaced by page.tsx with the
  // getExactFee answer, so their text never renders and is not scanned.
  const shown = p.faqs.filter(f => !(/fee|cost|cheap|expens|price|afford/i.test(f.q) && /(Rs|₹)\s?[\d,.]+/.test(f.a)))
  const text = [...shown.flatMap(f => [f.q, f.a]), ...p.verdictA, ...p.verdictB]
  for (const u of [p.uA, p.uB]) {
    for (const c of textConflicts(u, text)) {
      if (c.kind === 'fee' || c.kind === 'specCount' || c.kind === 'naac' || c.kind === 'nirf') { omit.add(c.kind); omitted.push({ uni: u.id, conflict: c }) }
    }
  }
  const nirfLine = text.find(t => /\bNIRF\b/.test(t))
  if (nirfLine && !omit.has('nirf')) { omit.add('nirf'); omitted.push({ uni: 'both', conflict: { kind: 'nirf', snippet: nirfLine.slice(0, 160) } }) }
  return { omit, omitted }
}

function feeTiers(f: ExactFee): string {
  if (f.kind === 'none') return 'Talk to our counsellor'
  if (f.kind === 'labelled') {
    const b = f.breakdown
    if (b.modes?.length) return b.modes.map(m => `${m.label}: ${formatExactFee({ kind: 'exact', min: m.amount, max: m.amount, from: false })}`).join('; ')
  }
  return formatExactFee(f) ?? 'Talk to our counsellor'
}
function paymentModes(f: ExactFee): string {
  if (f.kind !== 'labelled') return 'Not published on edifyedu.in'
  const labels = [f.breakdown.listLabel, f.breakdown.net?.label, ...(f.breakdown.modes ?? []).map(m => m.label)].filter((x): x is string => !!x)
  const pay = labels.filter(l => /lump|semester|annual|one-time|one time|instal|yearly|full payment/i.test(l))
  return pay.length ? pay.join('; ') : 'Not published on edifyedu.in'
}

function regLine(u: University, n: string, omit: Set<Fact>): string {
  const parts: string[] = []
  if (!omit.has('naac')) parts.push(u.naac ? `NAAC ${u.naac}` : 'no NAAC grade on record')
  if (!omit.has('nirf')) {
    const m = nirfMgtPhrase(u), v = nirfUnivPhrase(u)
    parts.push(m ? `parent institution ranked ${m}` : v ? `parent institution ranked ${v}, no Management rank` : 'no NIRF ranking')
  }
  if (!omit.has('specCount')) parts.push(`${u.programDetails.MBA?.specs.length ?? 0} specialisations`)
  return parts.length ? `${n}: ${parts.join(', ')}.` : ''
}

function words(s: string): number { return s.trim().split(/\s+/).filter(Boolean).length }

export function buildPairAnswers(p: PairInput): PairAnswers {
  const { uA, uB } = p
  const nA = displayName(uA), nB = displayName(uB)
  const { omit, omitted } = pairOmit(p)
  const fA = getExactFee(uA, 'MBA'), fB = getExactFee(uB, 'MBA')
  const sections: AnswerSection[] = []

  // Disambiguation first: "Manipal" and "D.Y. Patil" each name more than one university.
  if (MANIPAL.has(uA.id) || MANIPAL.has(uB.id)) sections.push(manipalDisambiguation())
  if (DYPATIL.has(uA.id) || DYPATIL.has(uB.id)) {
    const s = dyPatilDisambiguation(!omit.has('fee'), !(omit.has('naac') || omit.has('nirf')))
    sections.push(s)
  }

  // 1. Verdict
  const verdictLead = fitLead(
    [`Neither the ${nA} nor the ${nB} online MBA wins on every count.`, regLine(uA, nA, omit), regLine(uB, nB, omit)].filter(Boolean),
    ['Choose on the fee you can pay, the specialisation you need and the approvals below.', 'Both are UGC-DEB entitled on the record edifyedu.in holds.', 'Nothing here comes from a paid ranking.', 'Check each claim on the official registers.'],
  )
  sections.push({
    key: 'which-is-better', q: 'X', heading: `${nA} vs ${nB} online MBA: which is better?`,
    lead: verdictLead,
    bullets: [`Pick ${nA} if: ${p.verdictA[0] ?? 'its specialisation list fits you better'}`, `Pick ${nB} if: ${p.verdictB[0] ?? 'its specialisation list fits you better'}`],
    sources: ['lib/data.ts naac, nirf, nirfMgt, programDetails.MBA.specs', p.derived ? 'lib/answers/pair-verdict.ts (data comparisons)' : 'app/compare/[pair]/pairs.ts verdicts (existing)'],
    backed: true,
  })

  // 2. Side-by-side table
  const rows: string[][] = []
  if (!omit.has('fee')) {
    rows.push(['Fee tiers', feeTiers(fA), feeTiers(fB)])
    rows.push(['Payment modes', paymentModes(fA), paymentModes(fB)])
  }
  rows.push(['UGC-DEB', uA.ugc ? 'Entitled (on record)' : 'Not on record', uB.ugc ? 'Entitled (on record)' : 'Not on record'])
  if (!omit.has('naac')) rows.push(['NAAC', naacCell(uA), naacCell(uB)])
  if (!omit.has('nirf')) rows.push(['NIRF 2025', nirfCell(uA), nirfCell(uB)])
  if (!omit.has('specCount')) rows.push(['MBA specialisations', String(uA.programDetails.MBA?.specs.length ?? 0), String(uB.programDetails.MBA?.specs.length ?? 0)])
  rows.push(['Exam mode', uA.examMode || 'Not recorded', uB.examMode || 'Not recorded'])
  rows.push(['Placement transparency', placementCell(uA), placementCell(uB)])
  const cA = feeLastChecked(uA), cB = feeLastChecked(uB)
  if (!omit.has('fee') && (cA || cB)) rows.push(['Fee data last checked', cA ?? 'Not recorded', cB ?? 'Not recorded'])
  const factList = [omit.has('fee') ? null : 'fees and payment modes', 'UGC-DEB', omit.has('naac') ? null : 'NAAC', omit.has('nirf') ? null : 'NIRF with its category', 'exam mode', 'placement disclosure'].filter((x): x is string => !!x)
  const facts = factList.slice(0, -1).join(', ') + ' and ' + factList[factList.length - 1]
  sections.push({
    key: 'side-by-side', q: 'X', heading: `${nA} vs ${nB} online MBA: fees, approvals and exams side by side`,
    lead: fitLead([`The table compares the ${nA} and ${nB} online MBA on ${facts}, the points edifyedu.in holds a source for.`, 'A "Not published" cell means we hold no figure, not that the university lacks one.'], ['Fees are indicative, so confirm them with our counsellor before you pay.', 'Check approvals on the official registers.', 'Nothing here is a paid ranking.']),
    table: { head: ['', nA, nB], rows },
    notPublished: (PLACEMENT_FACTS[uA.id]?.status === 'outcomes-unlabelled' || PLACEMENT_FACTS[uB.id]?.status === 'outcomes-unlabelled')
      ? 'Not published by either university for its online MBA specifically: a placement rate or median salary for online MBA graduates.'
      : 'Not published by either university, on the record edifyedu.in holds: a placement rate or median salary for online MBA graduates.',
    sources: ['lib/fees.ts getExactFee', 'lib/data.ts ugc, naac, nirf, nirfMgt, specs, examMode, feeBreakdown.mba.source', 'data/naac-verified.json', 'lib/answers/university-answers.ts PLACEMENT_FACTS (provenance rows)'],
    backed: true,
  })

  // 3. Syllabus (mandatory)
  const sA = coreSemesters(uA), sB = coreSemesters(uB)
  const semNums = Array.from(new Set([1, 2, 3, 4, ...sA.map(s => s.sem), ...sB.map(s => s.sem)])).sort((a, b) => a - b)
  const cell = (ss: typeof sA, n: number) => ss.find(s => s.sem === n)?.subjects.join(', ') ?? 'Not published on edifyedu.in'
  const heldA = sA.map(s => s.sem), heldB = sB.map(s => s.sem)
  const semText = (h: number[]) => h.length === 1 ? `semester ${h[0]}` : `semesters ${h.slice(0, -1).join(', ')} and ${h[h.length - 1]}`
  const sylLead = sA.length && sB.length
    ? `edifyedu.in holds the core ${semText(heldA)} papers for the ${nA} online MBA and the core ${semText(heldB)} papers for the ${nB} online MBA, set side by side below. Later papers depend on the specialisation you choose, so confirm the full syllabus with our counsellor before you enrol.`
    : sA.length || sB.length
      ? `edifyedu.in holds the core ${semText(sA.length ? heldA : heldB)} papers for the ${sA.length ? nA : nB} online MBA, listed below, and no semester syllabus for the ${sA.length ? nB : nA} online MBA. Ask our counsellor for the ${sA.length ? nB : nA} syllabus in writing before you compare the two on subjects.`
      : `edifyedu.in does not hold a semester syllabus for either the ${nA} or the ${nB} online MBA, so we cannot compare their subjects here. Ask our counsellor for both syllabi in writing, and compare the core papers and the specialisation papers before you choose between them.`
  sections.push({
    key: 'syllabus-compared', q: 'Q8', heading: `${nA} vs ${nB} online MBA syllabus compared`,
    lead: sylLead,
    table: sA.length || sB.length ? { head: ['Semester', nA, nB], rows: semNums.map(n => [`Semester ${n}`, cell(sA, n), cell(sB, n)]) } : undefined,
    notPublished: 'Not published on edifyedu.in: the specialisation papers for every track at either university.',
    sources: ['lib/data/syllabus-manifest.json (_core)'],
    backed: sA.length > 0 || sB.length > 0,
  })

  // 4. FAQ items (autocomplete wording), skipping topics the pair already asks.
  const asked = p.faqs.map(f => f.q.toLowerCase())
  const has = (re: RegExp) => asked.some(q => re.test(q))
  const faqs: { q: string; a: string }[] = []
  if (!has(/\bbetter\b/) || p.derived) faqs.push({ q: `${nA} vs ${nB} online MBA: which is better?`, a: verdictLead })
  if (!omit.has('fee') && fA.kind !== 'none' && fB.kind !== 'none' && (!has(/fee|cost|cheap|price/) || p.derived)) {
    faqs.push({ q: `Which is cheaper, ${nA} or ${nB} online MBA?`, a: `${nA}: ${formatExactFee(fA)}. ${nB}: ${formatExactFee(fB)}. Fees are indicative and change by intake, so confirm the current figure with our counsellor before you pay.` })
  }
  if (!omit.has('specCount') && (!has(/speciali/) || p.derived)) {
    faqs.push({ q: `Which has more specialisations, ${nA} or ${nB} online MBA?`, a: `On the programme lists edifyedu.in holds, the ${nA} online MBA has ${uA.programDetails.MBA?.specs.length ?? 0} specialisations and the ${nB} online MBA has ${uB.programDetails.MBA?.specs.length ?? 0}. Check that the one you need is on the current list before you apply.` })
  }
  faqs.push({ q: `Do ${nA} and ${nB} online MBA have the same syllabus?`, a: sylLead })
  if (!has(/exam/)) faqs.push({ q: `How are ${nA} and ${nB} online MBA exams conducted?`, a: `edifyedu.in records ${nA} exams as ${uA.examMode || 'not recorded'} and ${nB} exams as ${uB.examMode || 'not recorded'}. Neither proctoring method is recorded, so ask our counsellor for the current exam pattern at both.` })
  if (!has(/placement|career|recruit/)) faqs.push({ q: `Which gives better placements, ${nA} or ${nB} online MBA?`, a: `edifyedu.in cannot rank them on placements, because neither publishes a placement rate or median salary for online MBA graduates on the record we hold. ${nA}: ${placementCell(uA)}. ${nB}: ${placementCell(uB)}.` })

  return { sections, faqs, omitted }
}

/** Lead-length and house-style check, run by scripts/check-pair-answers.mts. */
export function pairAnswerProblems(a: PairAnswers): string[] {
  const out: string[] = []
  for (const s of a.sections) {
    const w = words(s.lead)
    if (w < 40 || w > 60) out.push(`${s.key}: lead is ${w} words`)
  }
  const all = JSON.stringify(a.sections) + JSON.stringify(a.faqs)
  if (all.includes(String.fromCharCode(0x2014))) out.push('em dash')
  if (/EdifyEdu/.test(all)) out.push('"EdifyEdu" brand string')
  if (/\b(delve|comprehensive|testament|pivotal|landscape|navigate|robust|holistic|seamless|synergy|unlock|showcase|journey|realm)\b/i.test(all)) out.push('banned word')
  return out
}
