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
import { getExactFee, formatExactFeeShort } from './fees'

export type CardFees = Record<string, Partial<Record<Program, string>>>

export function buildCardFees(ids?: readonly string[]): CardFees {
  const want = ids ? new Set(ids) : null
  const out: CardFees = {}
  for (const u of UNIVERSITIES) {
    if (want && !want.has(u.id)) continue
    const row: Partial<Record<Program, string>> = {}
    for (const p of u.programs) {
      const f = formatExactFeeShort(getExactFee(u, p))
      if (f) row[p] = f
    }
    out[u.id] = row
  }
  return out
}
