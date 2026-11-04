// lib/answers/hub-answers.ts
//
// Which answer-first sections <QuickAnswers> renders on an MBA hub (AI-citation
// sprint, 2026-11-04). A hub gets them only when:
//   - the university has no online MBA review blog (REVIEW_BLOG_FOR), because
//     the blog owns these questions and the same section never runs on both;
//   - it is not frozen (Shoolini), and the hub is indexable
//     (shouldIndexProgrammeHub, which includes the mode-verified gate);
//   - it is in the current rollout (HUB_ROLLOUT), and
//   - at least MIN_BACKED of its Q-sections are backed by data.
//
// Q4 and Q9 are owned by the university's fake-or-legit post where one exists:
// the hub links it instead of repeating them.
//
// CONFLICT RULE. The hub already renders page-content JSON, and that JSON was
// hand-written: on 4 Nov 2026 the D.Y. Patil Navi Mumbai hub said "NAAC A" and
// "Rs 41,000 to Rs 1,69,000" while lib/data.ts holds A++ and Rs 1,75,000.
// hubConflicts() reads every JSON sentence about this university (sentences
// that name another university are skipped) and reports each fact type it
// states differently. That fact type is then left out of the new sections, so
// QuickAnswers never contradicts the page it sits on. The JSON is not changed.

import type { University } from '../data'
import { UNIVERSITIES } from '../data'
import { getPageContent } from '../data/page-content'
import { shouldIndexProgrammeHub } from '../seo/should-index'
import { getExactFee } from '../fees'
import { buildSections, displayName, searchedSpecFaqs, type AnswerSection, type QId } from './university-answers'
import { REVIEW_BLOG_FOR, LEGIT_BLOG_FOR, FROZEN_UNIVERSITIES } from './targets'

/** Batch A: hub-only universities named in the sprint brief. */
export const HUB_BATCH_A: readonly string[] = [
  'op-jindal-global-university-online',
  'vit-university-online',
  'dy-patil-university-online',
  'sharda-university-online',
  'chitkara-university-online',
  'gla-university-online',
]

/** 'A' renders batch A only; 'D' renders every hub that passes the gates. */
export const HUB_ROLLOUT: 'A' | 'D' = 'A'

export const MIN_BACKED = 5

// Questions the hub template FAQ already asks (UniProgramBody templateFaqs).
// Their QuickAnswers FAQ items are not appended, so FAQPage asks each once.
const TEMPLATE_FAQ_Q: ReadonlySet<QId> = new Set<QId>(['Q1', 'Q4', 'Q5', 'Q6', 'Q7', 'Q9'])

export type ConflictKind = 'fee' | 'specCount' | 'naac' | 'nirf' | 'eligibility' | 'placements'
export interface HubConflict { kind: ConflictKind; snippet: string }

export interface HubAnswers {
  sections: AnswerSection[]
  /** FAQ items to append to the hub's existing FAQ list and FAQPage schema. */
  faqs: { q: string; a: string }[]
  legit: { href: string; title: string } | null
  backed: number
  conflicts: HubConflict[]
}

// ── conflict scan ──────────────────────────────────────────────────────────

const STOP = new Set(['university', 'universities', 'online', 'institute', 'technology', 'science', 'sciences', 'management', 'global', 'deemed', 'higher', 'education', 'academy', 'college', 'open', 'national', 'studies', 'research', 'school', 'business', 'india', 'indian', 'state', 'central', 'centre', 'center', 'distance', 'learning', 'vidyapeeth', 'vishwavidyalaya', 'the', 'and', 'for', 'mba', 'new', 'dr.'])
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w))

// Abbreviations a university goes by, so its own sentences are not read as a peer's.
const ABBR: Record<string, string[]> = {
  'lovely-professional-university-online': ['lpu'], 'manipal-university-jaipur-online': ['muj', 'manipal'], 'manipal-academy-higher-education-online': ['mahe', 'manipal'],
  'sikkim-manipal-university-online': ['smu', 'manipal'], 'symbiosis-university-online': ['ssodl', 'symbiosis'], 'srm-institute-science-technology-online': ['srmist'],
  'upes-online': ['upes'], 'jain-university-online': ['jain'], 'bits-pilani-work-integrated-online': ['bits', 'wilp'], 'ignou-online': ['ignou'],
  'dr-dy-patil-vidyapeeth-online': ['dpu', 'vidyapeeth'], 'dy-patil-university-online': ['dypu'], 'nmims-online': ['nmims'], 'amity-university-online': ['amity'],
}

let PEER_CACHE: Map<string, string[]> | null = null
function peerTokens(u: University): string[] {
  PEER_CACHE ??= new Map()
  const hit = PEER_CACHE.get(u.id)
  if (hit) return hit
  const own = new Set([...words(u.name), ...words(displayName(u)), ...words(u.city ?? ''), ...words(u.state ?? ''), ...words(u.shortName ?? ''), ...(ABBR[u.id] ?? [])])
  const out = new Set<string>()
  for (const p of UNIVERSITIES) {
    if (p.id === u.id) continue
    for (const w of [...words(p.name), ...words(p.shortName ?? '')]) if (!own.has(w)) out.add(w)
  }
  for (const w of ['nmims', 'symbiosis', 'amity', 'manipal', 'vidyapeeth', 'iift', 'iim', 'lpu', 'muj', 'mahe', 'smu', 'ssodl', 'scdl', 'srmist', 'upes', 'jain', 'bits', 'wilp', 'ignou', 'dypu', 'dpu']) if (!own.has(w) && !ABBR[u.id]?.includes(w)) out.add(w)
  const arr = Array.from(out)
  PEER_CACHE.set(u.id, arr)
  return arr
}

function jsonStrings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach(x => jsonStrings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach(x => jsonStrings(x, out))
  return out
}

function rupees(num: string, unit?: string): number {
  const n = parseFloat(num.replace(/,/g, ''))
  if (!unit) return n
  return /^l/i.test(unit) ? n * 100000 : /^k/i.test(unit) ? n * 1000 : n
}

export function hubConflicts(u: University): HubConflict[] {
  const pc = getPageContent(u.id, 'MBA')
  if (!pc) return []
  const out = textConflicts(u, jsonStrings(pc))
  if (pc.sections?.placements?.body || pc.sections?.topHirers?.body) out.push({ kind: 'placements', snippet: 'page-content JSON carries placements/topHirers copy' })
  return out
}

/**
 * Fact types that existing hand-written text states differently from data for
 * university u. Sentences naming another university are skipped, so a pair
 * page's "Amity holds NAAC A+" is checked against Amity only.
 */
export function textConflicts(u: University, strings: string[]): HubConflict[] {
  const peers = peerTokens(u)
  const sentences = strings.flatMap(s => s.split(/\n+|(?<=[a-z0-9)%])[.;]\s+/))
  const own = sentences.filter(s => { const w = new Set(words(s)); return !peers.some(t => w.has(t)) })
  const out: HubConflict[] = []
  const add = (kind: ConflictKind, s: string) => { if (!out.some(c => c.kind === kind)) out.push({ kind, snippet: s.trim().slice(0, 160) }) }

  const specs = u.programDetails.MBA?.specs.length ?? 0
  const fee = getExactFee(u, 'MBA')
  const amounts: number[] = fee.kind === 'none' ? [] : fee.kind === 'labelled'
    ? [fee.breakdown.list, ...(fee.breakdown.net ? [fee.breakdown.net.min, fee.breakdown.net.max] : []), ...(fee.breakdown.modes ?? []).map(m => m.amount)]
    : [fee.min, fee.max]
  const ranks = [u.nirf, (u as { nirfMgt?: number }).nirfMgt].filter((n): n is number => typeof n === 'number' && n > 0 && n < 999)
  const elig = (u.eligibility ?? '').match(/(\d{2})\s*%/)?.[1]

  for (const s of own) {
    for (const m of Array.from(s.matchAll(/NAAC\s+(?:grade\s+)?(A\+\+|A\+|A|B\+\+|B\+|B)(?![+\w])/g))) if (m[1] !== u.naac) add('naac', s)
    for (const m of Array.from(s.matchAll(/\b(\d{1,2})\+?\s+(?:MBA\s+)?speciali[sz]ations\b/gi))) if (Number(m[1]) !== specs) add('specCount', s)
    for (const m of Array.from(s.matchAll(/NIRF[^#.]{0,40}#\s?(\d{1,3})/g))) if (!ranks.includes(Number(m[1]))) add('nirf', s)
    if (ranks.length && /\b(?:no|not|without)\b[^.]{0,60}\bNIRF\b|\bNIRF\b[^.]{0,30}\bnot (?:ranked|listed)/i.test(s)) add('nirf', s)
    for (const m of Array.from(s.matchAll(/(?:Rs\.?|₹)\s?(\d[\d,]*(?:\.\d+)?)\s?(L|lakh|K)?\b/gi))) {
      // "below Rs 1.5L", "under Rs 2L": a budget threshold, not a fee claim.
      if (/\b(?:below|under|above|over|less than|more than|up to|within)\s*$/i.test(s.slice(0, m.index))) continue
      const v = rupees(m[1], m[2])
      // A per-semester or per-year figure agrees when it multiplies up to a held fee.
      const agrees = amounts.some(a => [1, 2, 3, 4, 6].some(k => Math.abs(a - v * k) <= Math.max(1000, a * 0.01)))
      if (v >= 20000 && !agrees) add('fee', s)
    }
    if (elig) for (const m of Array.from(s.matchAll(/\b(\d{2})\s*%\s*(?:aggregate|marks|in graduation)/gi))) if (m[1] !== elig) add('eligibility', s)
  }
  return out
}

// "is op jindal online mba 1 year" (autocomplete, 4 Nov 2026). Answered from
// programDetails.MBA.duration only, and only where that duration is 1 year.
function durationFaq(u: University, n: string): { q: string; a: string }[] {
  const d = u.programDetails.MBA?.duration ?? ''
  if (!/^1 Year/i.test(d)) return []
  return [{
    q: `Is ${n} online MBA 1 year?`,
    a: `Yes. edifyedu.in records the ${n} online MBA as a ${d.replace(/^1 Year/i, '1 year').replace('Months', 'months')} programme. Most online MBAs in India run for 2 years, so confirm the duration printed on your offer letter with our counsellor before you apply.`,
  }]
}

// ── selection ──────────────────────────────────────────────────────────────

export function isHubCandidate(u: University): boolean {
  if (!u.programs.includes('MBA') || !u.programDetails.MBA) return false
  if (REVIEW_BLOG_FOR[u.id] || FROZEN_UNIVERSITIES.has(u.id)) return false
  return shouldIndexProgrammeHub(u, 'MBA').shouldIndex
}

export function getHubAnswers(u: University, rollout: 'A' | 'D' = HUB_ROLLOUT): HubAnswers | null {
  if (!isHubCandidate(u)) return null
  if (rollout === 'A' && !HUB_BATCH_A.includes(u.id)) return null

  const conflicts = hubConflicts(u)
  const c = new Set(conflicts.map(x => x.kind))
  const legitSlug = LEGIT_BLOG_FOR[u.id] ?? null
  const drop = new Set<QId>()
  if (legitSlug) { drop.add('Q4'); drop.add('Q9') }
  if (c.has('fee')) drop.add('Q1')
  if (getExactFee(u, 'MBA').kind === 'none') drop.add('Q1') // the template FAQ already says so; a section adds nothing
  if (c.has('specCount')) drop.add('Q5')
  if (c.has('eligibility')) drop.add('Q6')
  if (c.has('placements')) drop.add('Q3')
  if (c.has('naac') || c.has('nirf')) drop.add('Q9')

  const want = (['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9'] as QId[]).filter(q => !drop.has(q))
  const omit = (['fee', 'specCount', 'naac', 'nirf'] as const).filter(k => c.has(k))
  const sections = buildSections(u, want, { omit })
  const backed = sections.filter(s => s.q !== 'X' && s.backed).length
  if (backed < MIN_BACKED) return null

  const n = displayName(u)
  const faqs = [
    ...sections.filter(s => s.faq && s.q !== 'X' && !TEMPLATE_FAQ_Q.has(s.q)).map(s => s.faq!),
    ...(c.has('specCount') ? [] : searchedSpecFaqs(u, n)),
    ...durationFaq(u, n),
  ]
  return {
    sections,
    faqs,
    legit: legitSlug ? { href: `/blog/${legitSlug}`, title: `Is ${n} online fake or legit?` } : null,
    backed,
    conflicts,
  }
}
