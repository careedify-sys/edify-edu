# MISMATCH precision sample — 2026-08-07

Random stratified sample of 40 MISMATCH rows from `audits/blog-fee-crossref-2026-08-07.csv`.
Seed: primary=4242, competitor=8181. Reproducible via `npx tsx scripts/sample-blog-fee-mismatches.mjs`.

Total MISMATCH rows in corpus: 3,396 (871 primary, 2,525 competitor).
Sample size: 20 primary + 20 competitor = 40.

## Headline result

**MISMATCH precision (fraction that are genuine value drift): 4 / 40 = 10%.**

The other 90% are false positives from the extractor / inferencer, dominated by:

- **Nearest-preceding-uni inference is wrong** whenever a paragraph or table
  lists many universities' fees in sequence. The extractor attributes each ₹
  to the most recent uni-name mention, which is almost always the wrong uni
  in comparison-heavy prose. This alone accounts for **12 of 40** rows.
- **Extractor false positives on non-fee ₹**: gap amounts ("Gap: ₹54,000"),
  savings ("Save up to Rs 16,000"), application fees, registration fees, exam
  fees, per-semester payment tiers, one-time-payment tiers. **16 of 40** rows.
- **Split-range parse errors**: "Rs 1.66-1.80 lakh" and "Rs 25-40K" extract the
  first number without its suffix ("1.66" → ₹2, "25" → ₹25), producing
  MISMATCHes against ranges that are actually correct. **6 of 40** rows.
- **Regex false positive**: "Honors 4-year" matches `Rs 4` because the regex
  allows `Rs\.?\s*` before a digit and "no**Rs 4**" satisfies it. 1 of 40 rows
  (see P19). A `\b` before `Rs` in the pattern would fix this.
- **NON_FEE filter didn't fire** on at least one obvious salary ("Rs 40 to
  80 LPA") — that's C14. The tight-window check reads the right slice, so the
  pattern needs a look at why LPA didn't match; it should have. (Not part of
  the precision judgement — just flags a regex bug.)

## Counts per cause

| Cause | Primary | Competitor | Total | Share |
|---|---:|---:|---:|---:|
| CORRECT_ATTRIBUTION | 2 | 2 | 4 | 10% |
| WRONG_UNIVERSITY | 3 | 9 | 12 | 30% |
| WRONG_PROGRAMME | 0 | 0 | 0 | 0% |
| UNIT_MISMATCH | 2 | 1 | 3 | 7.5% |
| NOT_A_FEE | 11 | 5 | 16 | 40% |
| AMBIGUOUS | 2 | 3 | 5 | 12.5% |
| **Total** | **20** | **20** | **40** | 100% |

## What this means for the triage list

The current triage report's 1,868 rows across the 8 target universities is
dominated by extractor artifacts, not genuine fee drift. Acting on it row by
row would waste time on nine false positives for every real one. The rows do
still contain the real fee drift somewhere inside — the precision is 10%, not
0% — but the triage list as it stands is unusable as a direct action queue.

**Recommendations before acting on it:**

1. Tighten the extractor so a bare `<td>₹X</td>` in a table is only attributed
   to the university named in that table's row header, not the nearest
   preceding uni mention in the paragraph before the table. This requires
   walking the table structure, not treating the HTML as a flat string.
2. Add a `\b` boundary before `Rs` in `RUPEE_RE` to kill the "Honors 4" style
   false positives.
3. Fix the NON_FEE regex so `LPA` matches reliably; add explicit patterns for
   "gap:", "save", "saves", "discount", "application fee", "registration
   fee", "exam fee", "one-time" / "per semester" / "per year" tags.
4. When a range like "Rs 1.66-1.80 lakh" appears, extend the regex to carry a
   trailing suffix across the range so the first number normalises correctly.
5. Re-run and re-triage. The 3,396 MISMATCHes will almost certainly collapse
   to a much smaller list of real fee drift.

The distinct-pair collapse (`audits/blog-fee-distinct-pairs-2026-08-07.md`)
is a better signal for now: pairs where 2+ blogs independently state the
same value are still meaningful even under this noisy extractor.

---

## Row-by-row classifications

### PRIMARY-SUBJECT ROWS

### P1 · amity-vs-manipal-online-mba-2026

- publishedAt: 2026-07-22
- raw figure: **₹54,000** (normalised: ₹54,000)
- inferred uni: **amity-university-online**
- inferred programme: **MBA**
- data.ts pd.fees: `₹2.07L–₹2.25L`
- data.ts getDisplayFee: ₹2.07L-₹2.25L (rule 1)

```html
<p><strong>Gap: ₹54,000.</strong> MUJ is cheaper by about ₹54,000 when both are paid in full upfront. This is the fairest apples-to-apples comparison.</p>
```

**Classification: NOT_A_FEE.** The ₹54,000 is a price *gap* between MUJ and Amity, not a programme fee.

### P2 · distance-mba-kerala-programs-2026

- raw figure: **Rs 25** (normalised: ₹25)
- inferred uni: **university-of-kerala-online** · programme: **MBA**
- getDisplayFee: ₹90K-₹2L (rule 1)

```html
<div class="callout-key">... University of Calicut SDE MBA Rs 25-40K (Kerala-specific) ...</div>
```

**Classification: NOT_A_FEE.** Extractor split the range "Rs 25-40K" and captured "Rs 25" as ₹25 rupees. Also wrong uni (Calicut, not Kerala) — but the extracted numeric isn't a real fee value.

### P3 · jain-vs-amity-online-mba-2026

- raw figure: **₹29,000 l** (normalised: ₹2.9 billion — bogus)

```html
<p><strong>Effective gap: about ₹20,500.</strong> JAIN's sticker fee is ₹29,000 lower ...</p>
```

**Classification: NOT_A_FEE.** Fee gap in a comparison, plus catastrophic parse ("₹29,000 l" — the " l" is the first letter of "lower", not a lakh suffix). Two extractor failures at once.

### P4 · noida-international-university-online-mba-review

- raw figure: **Rs. 2,000** (normalised: ₹2,000)

```html
<div style="font-size:17px;font-weight:700;color:#0f172a">Rs. 2,000/semester</div>
```

**Classification: NOT_A_FEE.** This is the per-semester exam fee. The `/semester` tag is right there but the NON_FEE tight-window check didn't catch it because the block is short and the `/mo` / `/month` patterns don't cover `/semester`.

### P5 · jain-online-mba-review-2026

- raw figure: **₹2,20,000** (normalised: ₹2,20,000) · inferred: JAIN MBA
- getDisplayFee: ₹1.75L-₹1.96L

```html
<td>₹2,20,000</td>
```

**Classification: AMBIGUOUS.** Bare `<td>` — the extractor can't see the table header. In a JAIN review the row could be JAIN's premium tier or another uni in a comparison table. Cannot judge from context alone.

### P6 · muj-online-mba-review-2026

- raw figure: **Rs 1.66** (normalised: ₹2 — extractor lost the lakh suffix)

```html
<div class="callout-key">... MUJ Online MBA 2026: Rs 1.66-1.80 lakh, NAAC A plus ...</div>
```

**Classification: NOT_A_FEE.** Underlying content ("Rs 1.66-1.80 lakh") IS the correct MUJ MBA fee. Extractor split the range and dropped the "lakh" suffix on the first number, yielding a nonsensical ₹2. False positive.

### P7 · amity-online-bba-fees-2026

- raw figure: **₹63,020** (normalised: ₹63,020)

```html
<p>... <strong>Annual Payment ₹63,020/year × 3 years (effective ₹1,89,050)</strong> ...</p>
```

**Classification: NOT_A_FEE.** Annual instalment (₹63,020/year × 3 = ₹1.89L total). Component of the payment plan, not the programme fee.

### P8 · amity-vs-manipal-online-mba-2026

- raw figure: **₹1,53,000** (normalised: ₹1,53,000) · inferred: Amity MBA

```html
<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb">₹1,53,000</td>
```

**Classification: WRONG_UNIVERSITY.** ₹1,53,000 is the exact lower bound of MUJ MBA in data.ts (₹1.53L-₹1.80L). This is MUJ's cell in the comparison table, mis-attributed to Amity because Amity was named earlier in the surrounding prose.

### P9 · amity-online-bba-fees-2026

- raw figure: **₹1,75,120** (normalised: ₹1,75,120)

```html
<p>... <strong>One-Time Payment ₹1,75,120 (cheapest, saves ₹23,880)</strong> ... <strong>Semester-wise ₹33,200/sem × 6 semesters (₹1,99,000 total)</strong> ...</p>
```

**Classification: UNIT_MISMATCH.** ₹1.75L is the one-time-payment tier; ₹1.99L is the sem-wise total. Both are legitimate variants of the same programme fee. data.ts records only one tier — this is a real drift signal but of pricing structure, not of the fee itself being wrong.

### P10 · amity-online-mba-review-2026

- raw figure: **₹1,20,000** (normalised: ₹1,20,000) · inferred: Amity MBA

```html
<td style="padding:10px 14px;border-bottom:1px solid #e5e7eb">~₹1,20,000–₹1,51,800</td>
```

**Classification: AMBIGUOUS.** Bare `<td>`. On its own an Amity MBA never quotes ₹1.20-1.51L. Likely a competitor row in a comparison table, but header unknown.

### P11 · amity-online-bba-fees-2026

- raw figure: **₹2,500** (normalised: ₹2,500)

```html
<p>... Additional one-time fees: ₹1,100 application fee + ₹2,500 registration fee ...</p>
```

**Classification: NOT_A_FEE.** Registration fee.

### P12 · smu-online-mba-review

- raw figure: **Rs 16,000** (normalised: ₹16,000)

```html
<p style="...">Save up to Rs 16,000 on SMU Online MBA.</p>
```

**Classification: NOT_A_FEE.** Discount / savings amount, not a fee.

### P13 · muj-online-bba-review-2026

- raw figure: **₹500** (normalised: ₹500)

```html
<li><strong>Application fee:</strong> ₹500 one-time non-refundable</li>
```

**Classification: NOT_A_FEE.** Application fee.

### P14 · noida-international-university-online-mba-review

- raw figure: **Rs. 1,17,100** (normalised: ₹1,17,100)

```html
<p style="..."><strong>Fee note:</strong> Rs. 88,500 is the early-bird discounted price (25% off). The standard total is approximately Rs. 1,17,100. ...</p>
```

**Classification: CORRECT_ATTRIBUTION.** NIU MBA has two published tiers — early-bird ₹88.5K (in data.ts) and standard ₹1,17,100 (in blog). Both real. This is a real drift signal: data.ts records only one tier.

### P15 · amity-online-bba-fees-2026

- raw figure: **₹1,40,096** (normalised: ₹1,40,096)

```html
<td>₹1,31,340-₹1,40,096</td>
```

**Classification: UNIT_MISMATCH.** ~₹1.31-1.40L is roughly 2/3 of the ₹1.99L sem-wise total for Amity BBA — looks like a partial-programme or scholarship-tier figure. Same fee, different unit slice.

### P16 · distance-mba-kerala-programs-2026

- raw figure: **Rs 66,000** (normalised: ₹66,000) · inferred: Univ of Kerala MBA

```html
<td>Rs 66,000</td>
```

**Classification: WRONG_UNIVERSITY.** ₹66K is IGNOU MBAOL (explicitly named earlier in the same post as "IGNOU MBAOL Rs 66K"). Bare `<td>` mis-attributed to Kerala because Kerala was mentioned closer in prose.

### P17 · jain-online-mba-review-2026

- raw figure: **₹97,000** (normalised: ₹97,000)

```html
<td>₹74,500 (or ₹97,000 some sources)</td>
```

**Classification: CORRECT_ATTRIBUTION.** The post explicitly flags a source discrepancy for a JAIN-related fee. Real drift signal, acknowledged in-copy.

### P18 · smu-online-mba-review

- raw figure: **rs 3** (normalised: ₹3)

```html
<p style="...">... requires all students to choose a primary and a secondary specialization. In semesters 3 and 4, you study core subjects ...</p>
```

**Classification: NOT_A_FEE.** Regex false positive — matched "rs 3" from something like "hou**rs** ... **3**" or "cou**rs**e ... **3**" boundary. Not a fee amount at all.

### P19 · mahe-online-bba-review-2026

- raw figure: **rs 4** (normalised: ₹4)

```html
<li><strong>Total fee:</strong> ₹1,80,000 standard / ₹2,40,000 BBA Honors 4-year</li>
```

**Classification: NOT_A_FEE.** Regex matched "**rs 4**" inside "Hono**rs 4**-year". A leading `\b` on `Rs` in the pattern would fix this class of false positive entirely.

### P20 · mahe-online-mba-review-2026

- raw figure: **₹1,80,000** (normalised: ₹1,80,000) · inferred: MAHE MBA

```html
<p>... Whether the Rs 2,92,000 fee is worth it compared to MUJ at ₹1,80,000 depends entirely ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹1,80,000 is explicitly labelled "MUJ at ₹1,80,000" one clause earlier. Nearest-preceding-uni inference picked MAHE from the previous sentence.

---

### COMPETITOR-QUOTED ROWS

### C1 · mba-hr-management-online-india-2026

- raw figure: **₹1,08,500** · inferred: Kurukshetra MBA

```html
<p>... <strong>Kurukshetra</strong> (₹1,02,000), <strong>ARKA JAIN</strong> (₹1,08,500), ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹1,08,500 is ARKA JAIN's value; Kurukshetra is the last-preceding uni token.

### C2 · online-mba-tamil-nadu-2026

- raw figure: **₹90K** · inferred: Univ of Madras MBA

```html
<p>... <a href="/universities/sathyabama-university-online">Sathyabama Online</a> (NAAC A++, NIRF #53, ₹45K to ₹90K) ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹90K is Sathyabama's upper bound.

### C3 · mba-hr-management-online-india-2026

- raw figure: **~₹78,750** · inferred: Chitkara MBA

```html
<td>~₹78,750</td>
```

**Classification: AMBIGUOUS.** Bare `<td>`. Chitkara MBA is ₹2L in data.ts — ₹78,750 doesn't match any Chitkara tier. Likely a different uni row; header unknown.

### C4 · mba-fees-india-complete-guide-2026

- raw figure: **Rs 18L** · inferred: Galgotias MBA

```html
<td>Rs 10L to Rs 18L</td>
```

**Classification: NOT_A_FEE.** ₹10-18L is offline top-tier MBA fee range (IIMs, ISB, XLRI), not any online programme. Wrong context entirely for Galgotias online MBA at ₹76K.

### C5 · mba-hr-management-online-india-2026

- raw figure: **₹1,96,000** · inferred: Symbiosis MBA

```html
<p>... <strong>NMIMS and JAIN</strong> (₹1,96,000), <strong>Amity</strong> (₹1,99,000), ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹1.96L is NMIMS/JAIN's value; Symbiosis appears elsewhere in the same paragraph.

### C6 · online-mba-supply-chain-management-india-2026

- raw figure: **₹1,96,000** · inferred: Uttaranchal MBA

```html
<p>... mid-range cluster (LPU, Chandigarh, MUJ, UPES, DPU Pune, JAIN) sits between ₹1,46,240 and ₹1,96,000 ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹1.96L is the top of a cluster of six universities named — none of them Uttaranchal.

### C7 · mahe-online-mba-review-2026

- raw figure: **Rs 2,92,000** · inferred: MUJ MBA

```html
<p>... Whether the Rs 2,92,000 fee is worth it compared to MUJ at ₹1,80,000 ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹2.92L belongs to MAHE (subject of the sentence); MUJ is the *comparison* mention closer to the ₹1,80,000 further down the sentence.

### C8 · career-after-12th-arts-courses-jobs-2026

- raw figure: **Rs 22K** · inferred: IGNOU BA

```html
<td>Rs 22K to 60K (cheapest)</td>
```

**Classification: UNIT_MISMATCH.** IGNOU BA is ₹9,600 in data.ts (total). ₹22K may be per-year for a 3-year BA (₹22K × 3 = ₹66K, matches data.ts feeMin/feeMax). Same programme, different unit slice.

### C9 · mba-international-business-career-2026

- raw figure: **Rs 1.53** (normalised: ₹2)

```html
<td>Rs 1.53 to 1.80 L</td>
```

**Classification: NOT_A_FEE.** Range-split extractor artifact: "1.53" without the trailing "L". Underlying content is a fee range but the extracted number isn't.

### C10 · distance-mba-meaning-what-is-it-2026

- raw figure: **₹1,89,400** · inferred: Chandigarh MBA
- getDisplayFee: ₹1.65L-₹1.8L (only 5.2% above upper bound)

```html
<td>₹1,89,400</td>
```

**Classification: CORRECT_ATTRIBUTION.** Marginal (5% drift). Plausibly the "standard sem-wise" tier vs data.ts's discounted tier; a real value difference worth checking against the official Chandigarh portal.

### C11 · mba-hr-career-salary-scope-2026

- raw figure: **Rs 1.10** (normalised: ₹1)

```html
<td>Rs 1.10 to 1.65 lakh</td>
```

**Classification: NOT_A_FEE.** Range-split artifact (lost the "lakh" suffix).

### C12 · best-online-mba-colleges-india-2026

- raw figure: **₹2.25L** · inferred: Symbiosis MBA

```html
<td>₹2.07L to ₹2.25L</td>
```

**Classification: WRONG_UNIVERSITY.** ₹2.07L-₹2.25L is Amity MBA's *exact* fee range. Wrong-uni attribution.

### C13 · du-online-mba-delhi-university-2026

- raw figure: **Rs 20,000** · inferred: NMIMS MBA

```html
<p>Delhi University School of Open Learning (SOL) offers ... at approximately Rs 20,000 to 25,000 total for two years ...</p>
```

**Classification: WRONG_UNIVERSITY.** ₹20K-25K is DU SOL, explicitly named at the start of the sentence.

### C14 · commerce-jobs-list-salary-india-2026

- raw figure: **Rs 40** · inferred: NMIMS MBA

```html
<td>Rs 40 to 80 LPA (Director, VP Finance)</td>
```

**Classification: NOT_A_FEE.** Salary figure ("Rs 40 to 80 LPA"). Should have been flagged NON_FEE but the tight-window LPA check didn't trigger — a separate regex bug worth chasing.

### C15 · online-mba-business-data-analytics-india-2026

- raw figure: **₹2,92,000** · inferred: Amity MBA

```html
<td>₹2,92,000</td>
```

**Classification: WRONG_UNIVERSITY.** ₹2.92L is MAHE MBA's fee; bare `<td>` mis-attributed to Amity via nearest-preceding mention.

### C16 · top-correspondence-mba-colleges-india-2026

- raw figure: **Rs 1,18,000** · inferred: Galgotias MBA

```html
<td>Rs 1,18,000</td>
```

**Classification: AMBIGUOUS.** Galgotias online MBA is ₹76.2K. ₹1.18L in a correspondence-MBA table row could be any of several universities' correspondence tier; header unknown.

### C17 · top-correspondence-mba-colleges-india-2026

- raw figure: **Rs 1,96,000** · inferred: DY Patil MBA

```html
<td>Rs 1,96,000 to Rs 2,20,000</td>
```

**Classification: CORRECT_ATTRIBUTION.** DY Patil MBA is ₹1,75,000 in data.ts; blog states ₹1.96-2.20L. Plausible recent hike or newer tier — real drift signal to check.

### C18 · ma-distance-learning-india-2026

- raw figure: **Rs 300** · inferred: IGNOU MA

```html
<li><strong>Pay application fee:</strong> Rs 300 to Rs 500 typically.</li>
```

**Classification: NOT_A_FEE.** Application fee, not tuition.

### C19 · online-mba-tamil-nadu-2026

- raw figure: **₹1.5L** · inferred: Univ of Madras MBA

```html
<td style="padding:8px;text-align:right">₹1.5L</td>
```

**Classification: AMBIGUOUS.** ₹1.5L is nowhere near University of Madras MBA (₹20-40K in data.ts, also ₹20-40K in blog per C2 context). Likely a different uni's row in a Tamil-Nadu comparison table; header unknown.

### C20 · online-mba-supply-chain-management-india-2026

- raw figure: **₹24,500** · inferred: Symbiosis MBA

```html
<li><strong>Cheapest UGC-DEB approved option:</strong> UU Doon at ₹94,000 one-time / ₹24,500 per semester</li>
```

**Classification: WRONG_UNIVERSITY.** ₹24,500 per semester is Uttaranchal University (UU Doon), explicitly named right before it. Also a per-semester value (UNIT_MISMATCH secondarily) — but primary cause is wrong-uni attribution.
