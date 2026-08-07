# Fee data-model proposal — 2026-08-07

Design only. No implementation. Written after the audit found that most "fee
mismatches" are not drift but a data-model mismatch: `lib/data.ts` records one fee
per (university, programme), but the real fee is a small set of legitimate values
that vary along four dimensions.

## The four dimensions (confirmed with the site owner)

1. **Payment mode.** One-time payment vs semester-wise vs annual instalment vs EMI.
   Amity Online BBA: `₹1,75,120` one-time, `₹1,89,050` annual × 3, `₹1,99,000`
   semester-wise total. All three correct.
2. **Discount state.** List price vs early-bird / merit / promotional discount.
   Chandigarh Online MBA: `₹2,20,000` list, `₹1.65L–₹1.80L` after 20% early-bird.
   Both correct. NIU Online MBA: `₹1,17,100` standard, `₹88,500` early-bird.
3. **Specialisation-level variation.** Same programme, different fee for specific
   specialisations. Amity Online MBA: `₹2.07L`/`₹2.25L` for the general track,
   `₹4.49L` for Construction Management.
4. **Campus.** Legally distinct institutions sharing a brand. DY Patil Pune
   (`₹1,89,400`) vs DY Patil Navi Mumbai (`₹1,75,000`). Already handled at the
   *entry* level in `lib/data.ts` (see `dy-patil-representation-2026-08-07.md`);
   the extractor conflates them at the *alias* level, which is a scan-side fix,
   not a schema one.

`pd.fees: string` cannot represent any of these without either fabricating a range
(what `₹0.2L – ₹1.5L` on LPU BBA is — a range that spans no real fee) or picking
one number and calling the others wrong (what the current mismatches show).

## Proposed shape

Keep the existing `pd.fees` string as a display cache and add a structured field:

```ts
type FeePaymentMode = 'one-time' | 'semester' | 'annual' | 'emi'
type FeeDiscountState = 'list' | 'early-bird' | 'merit' | 'promotional'

interface FeeVariant {
  amount: number              // total programme cost in rupees, always
  mode: FeePaymentMode        // required — how the student pays this amount
  discount?: FeeDiscountState // undefined means 'list'
  spec?: string               // present iff this fee is spec-specific
  campus?: string             // present iff a single university id has multi-campus fees
  emi?: { months: number; monthly: number }  // computed cache for the EMI mode
  note?: string               // free text, e.g. 'includes exam + registration'
  source?: string             // 'official-portal' | 'brochure' | 'counsellor' | audit slug
  verifiedAt?: string         // ISO date of last portal check
}

interface ProgramDetail {
  // existing fields unchanged
  fees: string                          // display cache, kept for back-compat
  feeVariants?: FeeVariant[]            // NEW: authoritative source when present
  // ...rest unchanged
}
```

Rules for the `feeVariants` array:

- The array is the source of truth when present. `pd.fees` is a *rendering
  fallback* only, used when `feeVariants` is absent.
- `mode` is required so every variant is intelligible on its own — a bare
  `₹1,75,120` is meaningless without knowing it is the one-time-payment tier.
- The array is sorted by `amount` ascending. Callers that want a canonical
  single value pick `variants[0]` (cheapest legitimate way to enrol).
- No variant is a range. Every variant is a scalar amount. Ranges are
  synthesised at display time by asking `getFeeVariants().reduce(min/max)`.

## How the existing call sites change

### `getDisplayFee(u, program)` — no signature change

Today it returns `{ ok, mode, compact, range, min, max, rule }`. That contract
stays the same. Behaviour changes as follows:

- If `pd.feeVariants` is present, `min` = cheapest list-price variant,
  `max` = most-expensive list-price variant. Discount tiers and spec-specific
  variants are excluded from the compact/range strings so titles do not become
  misleadingly cheap; the discount is surfaced by the body block, not the title.
- If `pd.feeVariants` is absent, existing 4-rule hierarchy runs unchanged.
- The `rule` field gains a fifth possible value: `'variants'` when the display
  came from `feeVariants`.
- Suppression (rules `4a` / `4b`) never fires when a `feeVariants` array is
  present — variants are, by construction, self-consistent.

### New sibling `getFeeVariants(u, program): FeeVariant[]`

Returns the full variant list. Callers that need to show a payment-plan table
(FeeBreakdown), a discount callout, or a spec-specific fee lookup use this.

### `components/FeeBreakdown.tsx`

Today: reads `getDisplayFee(u, program)`, renders `.range` and `.compact`.
After: additionally calls `getFeeVariants()`. If more than one variant exists,
renders a small table (mode × amount, with the discount tier flagged). Falls
back to today's rendering when the list is empty or absent.

### `components/SchemaBlock.tsx` — `AggregateOffer`

Today: emits `lowPrice = u.feeMin`, `highPrice = u.feeMax`, `offerCount = '2'`.
After: when `feeVariants` is present, `lowPrice` = min list-price variant,
`highPrice` = max list-price variant across all specs, `offerCount` = number of
distinct list-price variants. Each variant with a `spec` becomes its own
`Offer` node inside the `AggregateOffer.offers` array so structured data reflects
the specialisation-level split. Non-list-price tiers (early-bird, EMI) are not
emitted as `Offer` nodes to avoid Google flagging price discrepancies against
the landing page.

### `lib/seo-title.ts` / `clampTitle` — no change required

`clampTitle` consumes `getDisplayFee().compact`. Because that field now excludes
discount and spec tiers, titles keep the same shape they have today: one range
or a "From ₹X" for the base list price. No title regressions.

### `scripts/check-fee-mismatches.mjs` / `check:fees` — extend

The 4-rule hierarchy still runs for entries without `feeVariants`. Add a new
validator that runs on entries *with* `feeVariants`:

- **V1** — every variant has `amount > 0` and a valid `mode`.
- **V2** — the sorted array has no two identical `(mode, discount, spec, campus)`
  tuples (no dupes).
- **V3** — for any variant with `discount = 'early-bird' | 'merit' | 'promotional'`,
  a corresponding `list` variant with the same `(mode, spec, campus)` must exist,
  so we never advertise a discount without knowing what it's a discount off.
- **V4** — `feeMin` and `feeMax` on the university record are within ±10% of
  the min/max list-price variant, to catch data drift between the two.
- **V5** — every `spec` value is one of the entries in `pd.specs`.

`totalSuppressed` continues to include only rows that fall through the 4-rule
hierarchy (i.e. no `feeVariants` present AND no reconcilable `pd.fees`). Rows
with `feeVariants` never suppress.

## What the extractor does with this

The blog-fee scanner's `classify()` currently compares one blog value against
one `getDisplayFee(u, prog).min/max` bound. Under the new model:

```
acceptable = union of all list-price + discount-tier + spec-specific amounts
             from getFeeVariants(u, prog), each wrapped in ±2% tolerance
MATCH      if blog value is within any tolerance window
MISMATCH   only if it falls outside every window
```

This is the change requested in the amendment: a MISMATCH is only reported when
the blog figure matches *none* of the known correct values for that (uni, prog).
Same three-line change in the scanner regardless of how many variants exist.

## Migration path for the 128 universities

Phase 1 — no schema change yet. Add the optional `feeVariants` field to the
`ProgramDetail` interface. All 128 entries continue to work as-is because the
field is optional. Zero behaviour change.

Phase 2 — populate incrementally, worst-first. Order by:

1. Rule 4a suppressions with placeholder ranges (LPU, JAIN, Sharda, Symbiosis
   BBA, Chandigarh BBA — 80 rows). These are the ones where `pd.fees` is a
   fabricated range spanning unrelated programme tiers; each becomes a small
   `feeVariants` array of the real numbers.
2. Rule 4b suppressions where the drift is really list-vs-discount (Chandigarh
   MBA, Symbiosis MBA, Amity BBA — subset of the 47).
3. Confirmed cross-blog agreement pairs from
   `blog-fee-distinct-pairs-2026-08-07.md` (35 pairs after the extractor fix
   lands and its precision is trustable).

Phase 3 — populate the remainder as blog rewrites need them. Any (uni, prog)
that gets referenced by a blog with a fee figure gets its `feeVariants` before
the blog is edited.

The `pd.fees` string is never removed. It stays as the display fallback for
entries where `feeVariants` is still absent.

## How many of the 127 suppressed rows resolve under the new model, without new
## fee research?

Breakdown of the 127:

- **Rule 4a — 80 rows**. Placeholder ranges (`₹0.2L – ₹1.5L`, `₹14K – ₹56K` etc.)
  that span more than 3x. These do not need new research; the correct data
  already exists in `programFees` overrides, `feeMin/feeMax`, or in one of the
  blog posts that quotes a specific fee. Converting them to `feeVariants` is
  purely a data-shape edit. **All 80 resolve.**
- **Rule 4b — 47 rows**. `pd.fees` and reference diverge by >25%. From the
  audit these fall in two buckets:
  - Legitimate multi-tier fees (list vs discount, or spec-specific): both
    numbers become variants and the suppression clears. Estimated **~30 rows**
    based on the top of the cross-blog agreement list (Chandigarh MBA, Amity
    BBA, DPU Pune MBA, NIU MBA, etc.).
  - Genuine data errors where neither number is right (Galgotias MBA:
    `₹76.2K` in data, `₹88,500` in blogs, actual `₹80,200` per the site owner).
    These need fresh research and are not resolved by the schema change alone.
    Estimated **~17 rows** — most visible in pairs where the blog dominant
    value is also far from data.ts and no cross-blog agreement exists.

**Total resolvable without new research: 80 + ~30 = ~110 of 127 (~87%).**

The remaining ~17 are genuine data-quality bugs and are already surfaced by
the audit. They need portal verification, not schema work.

## What this proposal does NOT do

- Does not change how the ratchet (`check-blog-fees.mjs`) works. It still counts
  per-slug unverified figures; the count drops naturally once MATCH acceptance
  widens.
- Does not touch `programFees` — the campus-level override map stays exactly as
  it is. `feeVariants` sits inside each `ProgramDetail`, one level down.
- Does not backfill anything. It is a schema, a validator, and a display
  contract. Population is a separate sprint.

## Open questions the design deliberately leaves open

1. Should `campus` also become a top-level split (two `id`s) whenever multiple
   fees exist for one brand? DY Patil is already split that way; a schema
   change here just decides whether the extractor is expected to disambiguate,
   or whether `campus` on a variant is a valid shape. Recommendation: keep
   campus splits at the entry level (existing pattern), reserve `campus` on
   `FeeVariant` for the rare case of a single legal entity offering the same
   programme at multiple locations for different fees.
2. Do we want a separate `pd.feeAsOf` ISO date at the ProgramDetail level as
   well, so a whole programme's fees can be marked stale in one place? Not
   included above because per-variant `verifiedAt` covers it, but worth a
   discussion if the ops team prefers a coarser signal.
3. Should structured-data emission de-emphasise EMI variants entirely? Current
   proposal excludes them from AggregateOffer.offers. Confirm before build.
