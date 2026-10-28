// lib/seo/program-schema.ts
// Sprint 3 Fix 1. Single canonical source for the fee bits of a programme
// hub page's JSON-LD schema (EducationalOccupationalProgram). Every hub
// template (bba, bca, mba, mca, [program]) routes through here so the
// schema fee matches the visible page fee exactly, and no bypass paths
// remain to the raw u.feeMin / u.feeMax values.
//
// Rules:
//   1. Read fees through getExactFee(u, program), which gates on getDisplayFee.
//      When it returns none, return null from both helpers. Callers must then omit the offers
//      block AND the "fees ..." fragment from the schema description.
//      No fee in the schema is correct; a wrong fee is not.
//   2. Never fall back to u.feeMin / u.feeMax. Those are MBA-anchored on
//      most universities and would publish the wrong programme's price
//      on BBA / BCA / MCA / [program] pages.
//   3. Emit a single-price Offer for one exact price, an AggregateOffer when
//      there is a range or a labelled breakdown.

import type { University, Program } from '../data'
import { getExactFee, formatExactFee } from '../fees'

// 2026-10-27: prices come from getExactFee, not getDisplayFee's min/max, which
// are parsed from abbreviated pd.fees strings. LPU's schema said 161000 while
// the portal says 161600. A list-vs-discount or payment-mode fee becomes an
// AggregateOffer spanning the real payable prices, with the labelled text as
// its description, so no bare discounted net is published as "the" price.

export interface SchemaOffer {
  '@type': 'Offer' | 'AggregateOffer'
  price?: string
  lowPrice?: string
  highPrice?: string
  description?: string
  priceCurrency: 'INR'
  availability: 'https://schema.org/InStock'
}

export function getProgramSchemaOffer(
  u: University,
  program: Program,
): SchemaOffer | null {
  const e = getExactFee(u, program)
  if (e.kind === 'none') return null
  let min: number, max: number
  if (e.kind === 'exact') { min = e.min; max = e.max }
  else {
    const b = e.breakdown
    const prices = b.modes?.length ? b.modes.map(m => m.amount) : [b.list, ...(b.net ? [b.net.min, b.net.max] : [])]
    min = Math.min(...prices); max = Math.max(...prices)
  }
  if (min === max) {
    return { '@type': 'Offer', price: String(min), priceCurrency: 'INR', availability: 'https://schema.org/InStock' }
  }
  return {
    '@type': 'AggregateOffer',
    lowPrice: String(min),
    highPrice: String(max),
    ...(e.kind === 'labelled' ? { description: formatExactFee(e)! } : {}),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  }
}

// Schema-description fragment for the fee (with leading ", fees "), or '' when
// the fee is suppressed. Exact rupees, discounts labelled.
export function getProgramSchemaFeeFragment(
  u: University,
  program: Program,
): string {
  const text = formatExactFee(getExactFee(u, program))
  return text ? `, fees ${text}` : ''
}
