# Competitor MISMATCH re-sample — v2b extractor — 2026-08-07

After landing the two prose-attribution fixes flagged in the v2 sample writeup:

1. **`tryParenthetical` containment.** The parenthetical rule now requires the
   figure to be *inside* the matched `(...)` — if any `)` appears between the
   candidate `(` and the figure, the paren is closed and the rule bails. Kills
   the "Uttaranchal (UU Doon) at ₹3,70,000" style of false attribution.
2. **Bucket-range boundaries.** A range figure immediately followed by `:`
   (allowing an optional trailing unit suffix like `L`, `K`, `Cr`) is
   reclassified `NON_FEE`. Same for a scalar figure that is the tail of a
   `Rs X to <figure>:` header the range parser failed to fold. Catches
   `Rs 1.5L to Rs 2.5L: CU (...), Amity (...)` style bucket-list openers.

## Corpus counts (v2 → v2b)

| Class | v2 | v2b |
|---|---:|---:|
| MATCH | 1,050 | 1,032 |
| MISMATCH | 758 | **739** |
| SUPPRESSED | 6 | 6 |
| ORPHAN | 67 | 65 |
| UNRESOLVED | 1,831 | 1,856 |
| NON_FEE | 6,171 | 6,185 |

MISMATCH −19, NON_FEE +14, UNRESOLVED +25. The containment tightening moves
some previously-attributed rows into UNRESOLVED because the parenthetical is
no longer trusted when the figure isn't enclosed; the bucket-boundary rule
converts a small number of MISMATCH scalars into NON_FEE.

## Competitor precision — 20-row re-sample, seed 8181

Sampled from the fresh v2b CSV. Population of competitor-quoted high-confidence
MISMATCHes: 356 (unchanged in shape from v2, but the specific rows shift a
little because MISMATCH is smaller).

| # | slug | figure | classification |
|---|---|---|---|
| C1  | 1-year-mba-india-executive-mba-2026 | BITS WILP MBA Rs 3.5-5L | CORRECT_ATTRIBUTION (WIP tier vs data 2.98L) |
| C2  | top-correspondence-mba-colleges-india-2026 | IGNOU MBA Rs 31,500 | CORRECT_ATTRIBUTION (older tier) |
| C3  | online-mba-business-data-analytics-india-2026 | Amrita BA ₹1,70,000 | CORRECT_ATTRIBUTION (spec-quote, −3.4%) |
| C4  | top-correspondence-mba-colleges-india-2026 | DY Patil Navi Mumbai Rs 1,70,000 | CORRECT_ATTRIBUTION (small discount, −2.9%) |
| C5  | shoolini-online-mba-review | Amity Pharma Rs 1.99L | CORRECT_ATTRIBUTION (spec tier) |
| C6  | du-online-mba-delhi-university-2026 | MUJ table Rs 1.66-1.80L | CORRECT_ATTRIBUTION (range endpoints outside 2%; delta 0) |
| C7  | affordable-online-mba-india-2026 | LPU ₹1.46-1.80L | CORRECT_ATTRIBUTION (early-bird tier, −9.3%) |
| C8  | online-bba-programs-india-2026 | Sharda ₹1,20,000 in HR row | **WRONG_PROGRAMME** (BBA table but detector picked BA from adjacent "NMIMS BA track") |
| C9  | mba-hr-management-online-india-2026 | MUJ ~₹1,48,750 | CORRECT_ATTRIBUTION (approx quote) |
| C10 | online-mba-for-freshers-india-2026 | IGNOU Rs 31,500 | CORRECT_ATTRIBUTION (older tier) |
| C11 | mba-international-online-global-programs-2026 | Amity Rs 1.99L | CORRECT_ATTRIBUTION (early-bird) |
| C12 | online-executive-mba-india-2026 | CU Rs 1.65-2.20L | CORRECT_ATTRIBUTION (spec upper tier) |
| C13 | galgotias-online-mba-review | SMU Rs. 1,10,000 | CORRECT_ATTRIBUTION (dual-spec tier) |
| C14 | muj-online-mba-review-2026 | Amity Rs 1.99L | CORRECT_ATTRIBUTION (early-bird) |
| C15 | chandigarh-university-online-mba-review | NMIMS Rs 2.10-2.40L | CORRECT_ATTRIBUTION (sticker tier) |
| C16 | mba-scope-india-2026 | DY Patil Rs 0.60-2.00L | CORRECT_ATTRIBUTION (comparative range) |
| C17 | icfai-online-mba-fees-2026 | CU Rs 1.65-2.20L | CORRECT_ATTRIBUTION (spec upper) |
| C18 | how-to-choose-online-mba-university-india-2026 | Amity ₹2-2.5L | CORRECT_ATTRIBUTION (approx range) |
| C19 | mba-digital-marketing-career-2026 | CU Rs 1.65-2.20L | CORRECT_ATTRIBUTION (spec upper) |
| C20 | top-free-online-mba-courses-2026 | CU Rs 1.65L-2.20L | CORRECT_ATTRIBUTION (spec upper) |

**Competitor MISMATCH precision: 19 / 20 = 95%.** Up from 65% at v2. The one
surviving false positive is a programme-detection error (BA vs BBA in a BBA
spec-table), not the parenthetical or bucket-range failure modes the two
fixes targeted. That failure mode is different in kind — the extractor picked
the wrong programme because a competitor cell adjacent to the row mentions
"NMIMS BA track" and the 200-char programme-detection window swept it up.

## Combined precision

- Primary MISMATCH precision (v2 sample, unchanged): **14 / 14 = 100%**
- Competitor MISMATCH precision (v2b sample): **19 / 20 = 95%**
- Combined: **33 / 34 = 97%**

Comfortably above the 80% bar and above the 88% projection. Primary-subject
worklist can now proceed — see `audits/fee-worklist-primary-2026-08-07.md`.
