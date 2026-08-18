// lib/seo/program-schema.ts
// Sprint 3 Fix 1. Single canonical source for the fee bits of a programme
// hub page's JSON-LD schema (EducationalOccupationalProgram). Every hub
// template (bba, bca, mba, mca, [program]) routes through here so the
// schema fee matches the visible page fee exactly, and no bypass paths
// remain to the raw u.feeMin / u.feeMax values.
//
// Rules:
//   1. Read fees through getDisplayFee(u, program). If fee.ok === false,
//      return null from both helpers. Callers must then omit the offers
//      block AND the "fees ..." fragment from the schema description.
//      No fee in the schema is correct; a wrong fee is not.
//   2. Never fall back to u.feeMin / u.feeMax. Those are MBA-anchored on
//      most universities and would publish the wrong programme's price
//      on BBA / BCA / MCA / [program] pages.
//   3. Emit a single-price Offer when getDisplayFee resolves to a single
//      value, an AggregateOffer when it resolves to a range.

import type { University, Program } from '../data'
import { getDisplayFee } from '../fees'

export interface SchemaOffer {
  '@type': 'Offer' | 'AggregateOffer'
  price?: string
  lowPrice?: string
  highPrice?: string
  priceCurrency: 'INR'
  availability: 'https://schema.org/InStock'
}

export function getProgramSchemaOffer(
  u: University,
  program: Program,
): SchemaOffer | null {
  const fee = getDisplayFee(u, program)
  if (!fee.ok || fee.min == null) return null
  const min = fee.min
  const max = fee.max ?? min
  if (min === max) {
    return {
      '@type': 'Offer',
      price: String(min),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    }
  }
  return {
    '@type': 'AggregateOffer',
    lowPrice: String(min),
    highPrice: String(max),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  }
}

// Returns a schema-description fragment for the fee (with leading ", fees ")
// or an empty string when the fee is suppressed. Caller can concatenate
// directly into the description template.
export function getProgramSchemaFeeFragment(
  u: University,
  program: Program,
): string {
  const fee = getDisplayFee(u, program)
  if (!fee.ok || !fee.compact) return ''
  return `, fees ${fee.compact}`
}
