// lib/answers/pair-verdict.ts
//
// "Pick X if you..." lines for comparison pairs added in the AI-citation sprint
// (2026-11-04). Every line is a comparison of two lib/data.ts or lib/fees.ts
// values, so nothing here is hand-written about a university. Imported by
// app/compare/[pair]/pairs.ts for the new entries only; the existing pairs keep
// their hand-written verdicts.

import { getUniversityById, type University } from '../data'
import { getExactFee, formatExactFee, type ExactFee } from '../fees'
import { displayName, nirfMgtPhrase, PLACEMENT_FACTS } from './university-answers'

const NAAC_ORDER = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C']
const naacRank = (g?: string | null) => (g && NAAC_ORDER.includes(g) ? NAAC_ORDER.indexOf(g) : 99)
const RANKED = (n?: number | null): n is number => typeof n === 'number' && n > 0 && n < 999

/** Lowest rupee figure the fee holds: the floor a reader would compare. */
export function feeFloor(f: ExactFee): number | null {
  if (f.kind === 'none') return null
  if (f.kind === 'labelled') return Math.min(f.breakdown.list, ...(f.breakdown.net ? [f.breakdown.net.min] : []), ...(f.breakdown.modes ?? []).map(m => m.amount))
  return f.min
}

function sideLines(me: University, other: University): string[] {
  const out: string[] = []
  const on = displayName(other)
  if (naacRank(me.naac) < naacRank(other.naac)) out.push(`You want NAAC ${me.naac} on your degree (${on} holds ${other.naac || 'no grade on record'})`)
  const mm = RANKED(me.nirfMgt) ? me.nirfMgt : null, om = RANKED(other.nirfMgt) ? other.nirfMgt : null
  if (mm && (!om || mm < om)) out.push(`You want a parent institution ranked ${nirfMgtPhrase(me)}${om ? ` (${on}: #${om})` : `, a Management rank ${on} does not hold`}`)
  const ks = me.programDetails.MBA?.specs.length ?? 0, ko = other.programDetails.MBA?.specs.length ?? 0
  if (ks > ko) out.push(`You want more specialisations to choose from: ${ks} against ${ko}`)
  const fm = getExactFee(me, 'MBA'), fo = getExactFee(other, 'MBA')
  const a = feeFloor(fm), b = feeFloor(fo)
  if (a !== null && b !== null && a < b) out.push(`You want the lower fee on record: ${formatExactFee(fm)} against ${formatExactFee(fo)}`)
  if (PLACEMENT_FACTS[me.id] && !PLACEMENT_FACTS[other.id]) out.push('You want a university that publishes a placement-support statement (support, not a placement outcome)')
  if (!out.length) out.push(`The specialisation you need is on its list and not on ${on}'s (compare both lists before you apply)`)
  return out
}

export function derivedVerdict(idA: string, idB: string): { verdictA: string[]; verdictB: string[] } {
  const a = getUniversityById(idA), b = getUniversityById(idB)
  if (!a || !b) throw new Error(`pair-verdict: unknown university ${!a ? idA : idB}`)
  return { verdictA: sideLines(a, b), verdictB: sideLines(b, a) }
}
