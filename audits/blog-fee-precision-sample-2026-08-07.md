# MISMATCH precision sample — v2 extractor — 2026-08-07

Random stratified sample of MISMATCH rows from `audits/blog-fee-crossref-2026-08-07.csv`
after the structural rewrite. High-confidence only (parenthetical, table-first-cell,
table-column-header). Seed: primary=4242, competitor=8181. Reproducible via
`npx tsx scripts/sample-blog-fee-mismatches.mjs`.

v1 sample preserved at `audits/blog-fee-precision-sample-2026-08-07-v1.md` for
before/after comparison.

## Corpus counts (v1 → v2)

| Class | v1 | v2 |
|---|---:|---:|
| MATCH | 1,189 | 1,050 |
| MISMATCH | 3,396 | **758** |
| SUPPRESSED | 774 | 6 |
| ORPHAN | 78 | 67 |
| UNRESOLVED | 1,346 | 1,831 |
| NON_FEE | 4,195 | 6,171 |

MISMATCH is down 78%. SUPPRESSED collapsed to 6 because multi-value acceptance now
lets `pd.fees`, `programFees.<prog>`, and `getDisplayFee` all vote — one of them
usually covers the blog figure. UNRESOLVED rose because the extractor now refuses to
guess where v1 would have picked the nearest preceding uni.

## Headline result

**MISMATCH precision: 27 / 34 = 79%** on high-confidence rows (14 primary + 20
competitor available at this seed; only 14 primary/high remain in the corpus so
the sample is 34 rather than 40).

That is one row short of the 80% target. The seven remaining false positives break
down as:

- **Multi-uni prose sentences** (2 rows, C5 and C9). "Uttaranchal University
  (UU Doon) at ₹94,000 one-time to Symbiosis SSODL at ₹3,70,000 standard" — the
  ₹3.70L is attributed to Uttaranchal because parenthetical hunting doesn't require
  the target figure to actually sit *inside* the matched parenthetical. Fix: the
  parenthetical rule should only fire when the figure is enclosed by the same
  `(…)` as the uni name; today it fires as long as an open-paren exists before
  the figure at all.
- **Bucket-range boundaries** (1 row, C5). "Rs 1.5L to Rs 2.5L: CU (…), Amity
  (₹2,07,000)" — the extractor pulls ₹2.5L as a scalar and attributes it via
  proximity. That value is a bucket upper bound, not any uni's fee. Fix: when a
  paragraph opens `Rs X to Rs Y:` and then enumerates uni-parenthetical numbers,
  the bucket bounds themselves should be NON_FEE.
- **Executive-MBA offline row misread as Online MBA** (1 row, C11). "Rs 4 to 10
  lakh" quoted for NMIMS in a `top-executive-mba-programs` post. Right uni,
  wrong programme (Executive/offline, not the Online MBA in data.ts). The schema
  proposal in `audits/fee-model-proposal-2026-08-07.md` handles this once the
  `mode` and `discount` fields land on `FeeVariant[]`.
- **Extractor artifact — range-tail decimal-vs-thousand ambiguity** (1 row, C19).
  "Rs 35,000 to 1.2 lakh" briefly parsed as ₹3.5B in v2's first pass; a
  same-pass fix landed that only re-scales the start-number by the tail suffix
  when the raw start is < 1000 (i.e. a decimal like 1.66). The sample was taken
  before that final rerun; the CSV that ships with this commit already resolves
  the row.
- **Genuinely ambiguous bare cells** (2 rows, C6 and C18). `<td>Rs 1.65 lakh</td>`
  in a Symbiosis column of a finance-MBA post — Symbiosis MBA is ₹3.15-3.70L in
  data.ts, so 1.65L is either an old Symbiosis SCDL fee or a mis-attributed row.
  No structural signal to tell.

If the multi-uni parenthetical bug and the bucket-boundary rule are fixed and the
extractor is re-run, the projected precision is ~30/34 ≈ 88%. That is one small
extractor pass from the 80% bar. Reporting honestly rather than proceeding, per the
instruction. Two ancillary fixes landed at the tail of this pass (Navi-Mumbai
alias conflation, range-tail suffix scoping) and are in the shipped code — they'd
be reflected in the next sample if re-drawn from the fresh CSV.

## Counts per cause

| Cause | Primary | Competitor | Total | Share |
|---|---:|---:|---:|---:|
| CORRECT_ATTRIBUTION | 14 | 13 | **27** | **79%** |
| WRONG_UNIVERSITY | 0 | 3 | 3 | 9% |
| WRONG_PROGRAMME | 0 | 1 | 1 | 3% |
| UNIT_MISMATCH | 0 | 0 | 0 | 0% |
| NOT_A_FEE | 0 | 1 | 1 | 3% |
| AMBIGUOUS | 0 | 2 | 2 | 6% |
| **Total** | **14** | **20** | **34** | 100% |

Primary MISMATCH precision is 14/14 = 100%. All surviving primary/high-confidence
MISMATCHes are legitimate value-drift signals (Amity BBA one-time tier, JAIN spec
range ₹1.96L–₹2.98L, MAHE BBA Honors 4-year, MUJ MBA early-bird lower-bound drift,
Shoolini upper tier, DPU Navi Mumbai small discount, Amrita 6-sem total). The
extractor's remaining failures are concentrated in cross-uni comparison prose,
which is almost entirely competitor-quoted.

## Row-by-row classifications

Full row detail — HTML block, inferred uni/programme, data.ts value, delta — lives
inside the auto-generated body of this file (before this rewrite). The judgement
per row:

### PRIMARY-SUBJECT ROWS (14 sampled)

| # | slug | figure | classification |
|---|---|---|---|
| P1 | muj-online-mba-review-2026 | Rs 1.66-1.80 lakh | CORRECT_ATTRIBUTION (early-bird vs list tier) |
| P2 | distance-mba-colleges-mumbai-2026 | Rs 15,000-30,000 | CORRECT_ATTRIBUTION (state-uni IDOL MBA) |
| P3 | jain-vs-amity-online-mba-2026 | ₹2,20,000 | CORRECT_ATTRIBUTION (JAIN spec-specific tier) |
| P4 | amity-online-bba-fees-2026 | ₹1,75,120 | CORRECT_ATTRIBUTION (one-time; owner confirmed) |
| P5 | amrita-online-bba-review-2026 | ₹1,41,000 | CORRECT_ATTRIBUTION (6-sem total) |
| P6 | jain-online-mba-review-2026 | ₹1,96,000–₹2,98,000 | CORRECT_ATTRIBUTION (spec range) |
| P7 | jain-vs-amity-online-mba-2026 | ₹2,98,000 | CORRECT_ATTRIBUTION (spec upper) |
| P8 | jain-online-mba-review-2026 | ₹1,96,000 to ₹2,98,000 | CORRECT_ATTRIBUTION (prose spec range) |
| P9 | shoolini-online-mba-review | Rs 1.30-1.50 lakh | CORRECT_ATTRIBUTION (higher tier) |
| P10 | amity-online-bba-fees-2026 | ₹1,75,120 | CORRECT_ATTRIBUTION (one-time) |
| P11 | amity-online-bba-review-2026 | ₹1,75,120 | CORRECT_ATTRIBUTION (one-time) |
| P12 | mahe-online-bba-review-2026 | ₹2,40,000 | CORRECT_ATTRIBUTION (BBA Honors 4-year) |
| P13 | dy-patil-online-mba-review | Rs 1,70,000 | CORRECT_ATTRIBUTION (small discount tier) |
| P14 | amity-online-bba-review-2026 | ₹1,75,120 | CORRECT_ATTRIBUTION (one-time) |

### COMPETITOR-QUOTED ROWS (20 sampled)

| # | slug | figure | classification |
|---|---|---|---|
| C1 | online-bba-programs-india-2026 | ₹1,65,000 Symbiosis BBA | CORRECT_ATTRIBUTION (parenthetical; owner confirmed) |
| C2 | correspondence-mba-meaning-2026 | Rs 1.60L to 1.96L JAIN MBA | CORRECT_ATTRIBUTION |
| C3 | mba-after-bca-is-it-good-career-2026 | Rs 1.60L to 1.96L JAIN MBA | CORRECT_ATTRIBUTION |
| C4 | 1-year-mba-india-executive-mba-2026 | Rs 1.60L to 1.96L JAIN MBA | CORRECT_ATTRIBUTION |
| C5 | top-correspondence-mba-colleges-india-2026 | Rs 2.5L "Amity" MBA | **WRONG_UNIVERSITY** (bucket boundary) |
| C6 | mba-finance-career-salary-scope-2026 | Rs 1.65 lakh Symbiosis MBA | **AMBIGUOUS** |
| C7 | galgotias-online-mba-review | Rs. 1,10,000 SMU MBA | CORRECT_ATTRIBUTION (dual-spec discount) |
| C8 | online-mba-maharashtra-2026 | ₹41K to ₹1.69L "Univ of Mumbai" MBA | **WRONG_UNIVERSITY** (Navi Mumbai conflation; fix landed) |
| C9 | online-mba-supply-chain-management-india-2026 | ₹3,70,000 "Uttaranchal" MBA | **WRONG_UNIVERSITY** (multi-uni parenthetical) |
| C10 | online-executive-mba-india-2026 | Rs 1.65L to 2.20L Chandigarh MBA | CORRECT_ATTRIBUTION (classifier missed feeMin/feeMax interval) |
| C11 | top-executive-mba-programs-india-2026 | Rs 4 to 10 lakh NMIMS MBA | **WRONG_PROGRAMME** (offline Executive tier) |
| C12 | online-mba-for-freshers-india-2026 | Rs 31,500 IGNOU MBA | CORRECT_ATTRIBUTION (older tier) |
| C13 | online-mba-hospitality-management-india-2026 | ₹1,76,500 NMIMS MBA | CORRECT_ATTRIBUTION (sticker tier) |
| C14 | online-mca-course-india | Rs.90,600 Guru Nanak Dev MCA | CORRECT_ATTRIBUTION (parenthetical) |
| C15 | online-mba-real-estate-management-india-2026 | ₹1,99,000 Amity MBA | CORRECT_ATTRIBUTION (real tier) |
| C16 | online-mba-for-freshers-india-2026 | Rs 31,500 IGNOU MBA | CORRECT_ATTRIBUTION (same as C12) |
| C17 | mba-digital-marketing-career-2026 | Rs 1.60 to 1.96 L JAIN MBA | CORRECT_ATTRIBUTION |
| C18 | career-after-bcom-jobs-salary-courses-2026 | ₹1L Chandigarh MBA | **AMBIGUOUS** (course-cost bucket cell) |
| C19 | mba-course-duration-india-2026 | Rs 35,000 to 1.2 lakh IGNOU MBA | **NOT_A_FEE** (range-tail parse artifact; fix landed) |
| C20 | chandigarh-university-online-mba-review | Rs 1.50 lakh JAIN MBA | CORRECT_ATTRIBUTION (spec/discount tier) |
