// Gated fee text for UniversityCard on listing pages (/universities, homepage).
//
// The cards used to print the raw UNIS_SLIM feeMin/feeMax range. That range is
// MBA-led and ungated, so 69 universities whose profile says "Contact our
// counsellor" still showed a placeholder price on their card (B3 batch 5).
// This computes, on the server, the same string the profile prints:
// formatExactFeeShort(getExactFee(u, programme)). A programme with no gated
// fee is left out, and the card falls back to the counsellor line.
import { UNIVERSITIES } from './data'
import type { Program } from './data'
import { getExactFee, formatExactFeeShort, type ExactFee } from './fees'
import { getResolvableProgrammes } from './seo/safe-internal-links'

// text is what the card prints; min/max are the same gated rupees, used only to
// sort and filter /universities so the controls never order by a hidden placeholder.
export type CardFee = { text: string; min: number; max: number }
export type CardFees = Record<string, Partial<Record<Program, CardFee>>>

function bounds(e: ExactFee): { min: number; max: number } | null {
  if (e.kind === 'exact') return { min: e.min, max: e.max }
  if (e.kind === 'labelled') {
    const a = e.breakdown.modes?.length ? e.breakdown.modes.map(m => m.amount) : [e.breakdown.list]
    return { min: Math.min(...a), max: Math.max(...a) }
  }
  return null
}

export function buildCardFees(ids?: readonly string[]): CardFees {
  const want = ids ? new Set(ids) : null
  const out: CardFees = {}
  for (const u of UNIVERSITIES) {
    if (want && !want.has(u.id)) continue
    const row: Partial<Record<Program, CardFee>> = {}
    // Only programmes the profile itself lists (B3 batch 5 round 2): Mumbai and
    // Madurai Kamaraj carry MBA in u.programs but their MBA hub is not resolvable,
    // so the profile prints no MBA row and the card must not either.
    for (const p of getResolvableProgrammes(u)) {
      const e = getExactFee(u, p)
      const text = formatExactFeeShort(e)
      const b = bounds(e)
      if (text && b) row[p] = { text, ...b }
    }
    out[u.id] = row
  }
  return out
}
