# Ticket: Blog drift scanner v3 — context-word filters + entity disambiguation

**Status:** Open (deferred improvement)
**Created:** 2026-07-26
**Category:** Tooling — audit scanner

## Problem

The fee-drift scanner (v2, at
`scratchpad/audit-blog-fees-v2.js`) produced 1001 raw findings across 127
blog posts. Manual triage revealed roughly 60-70% is noise from patterns
the scanner does not distinguish from real drift:

**Class 1 — computed deltas** (not fees, blog is doing arithmetic):
- `"gap of ₹20,500"`, `"MUJ saves ₹27,000"`, `"₹54,000 saved"`

**Class 2 — discounts/scholarships** (not fees, blog is describing an offer):
- `"₹55K experience scholarship"`, `"Amity waiver Rs 25K to Rs 35K"`

**Class 3 — fee components** (not the total, blog is breaking down):
- `"Registration: Rs 1,200"`, `"Exam fee: Rs 4,000/year"`, `"Application
  fee: ₹2,500"`

**Class 4 — per-semester/yearly amounts** (correctly cited alongside a
total in the blog, but scanner flags the smaller number):
- `"Total: Rs 76,200 | Yearly fee: Rs 33,000"` — 33K flagged wrongly

**Class 5 — entity alias collisions** (biggest false-positive category):
- `"DY Patil"` alias matches both `dy-patil-university-online` (Navi
  Mumbai, ₹1.75L) and `dr-dy-patil-vidyapeeth-online` (Pune, ₹1.89L).
  When a blog explicitly names "Dr. D.Y. Patil Vidyapeeth, Pune", the
  scanner still flags against the Navi Mumbai truth.
- `"BITS"` alias previously matched both `bits-pilani-online` (before
  rename to `bit-mesra-online`) and `bits-pilani-work-integrated-online`
  (BITS Pilani WILP). Fixed by rename in commit 923c3f9 for BITS/BIT
  specifically, but the class of bug remains for any two-institution
  naming (Manipal MAHE vs MUJ vs SMU; SRM Institute vs SRM Sikkim, etc).

## Fix

### Class 1-4: context-word filters

Before flagging a fee as drift, check for these context words in a
30-char window around the amount and suppress:

```js
const NOISE_WORDS = [
  'gap', 'saved', 'saves', 'saving', 'difference',
  'scholarship', 'waiver', 'discount', 'off', 'concession',
  'registration', 'exam fee', 'application fee', 'admission fee',
  'per semester', 'per sem', 'yearly', 'annual', '/sem', '/year',
  'per month', '/mo', 'emi',
]
```

If any word appears in the immediate window, do not flag. The blog is
almost certainly describing a component/delta/offer rather than a total.

### Class 5: alias disambiguation

Instead of matching the shortest alias that hits, use a two-stage lookup:

1. Try to match the LONGEST alias first in the paragraph (already
   partially done via sort-longest-first in v2, but paragraph text can
   still fragment the match).
2. Explicitly enumerate every two-institution collision pair:
   - `DY Patil` → must see qualifier (Pune|Vidyapeeth|Navi Mumbai|DPU|
     Ambedkar) before assigning to either specific entity, otherwise
     skip the paragraph as ambiguous.
   - `SRM` → same treatment (SRM Institute Chennai vs SRM Sikkim).
   - `Manipal` → same (MAHE vs MUJ vs SMU vs online-Manipal-brand).
   - Any future pair added to `MANUAL_ALIASES` should be checked for
     collision and require a qualifier if collisions exist.

### Class-agnostic: require paragraph-level uniqueness of the flagged amount

If a paragraph mentions three fee amounts and only one is claimed to
belong to the flagged university, and the other two match its truth, do
not flag the third — the paragraph is comparing multiple universities'
fees and the odd one out is likely someone else's.

## Expected impact

Applying context-word filters + entity-disambiguation should cut findings
by an estimated 60-70%. The remaining 300-400 findings would be much
higher signal-to-noise ratio.

## Cross-refs

- Chat thread 2026-07-26: full audit report with signal/noise breakdown
- `scratchpad/audit-blog-fees-v2.js`: current scanner (v2)
- Related work: `scripts/sync-from-supabase.js` (data.ts sync);
  `docs/tickets/nirf-band-support.md` (Supabase schema extension for
  NIRF bands)
