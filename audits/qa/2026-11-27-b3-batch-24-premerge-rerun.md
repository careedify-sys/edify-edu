# QA pre-merge rerun: B3 batch 24 round 2 (fix/b3-batch-24 @ 84e09b0, parent 5432876, base 24663a8)

Date: 2026-11-27. Checker: qa-checker (outsider; did not do the work).

## Method

- **Builds:** fresh worktrees b24base (24663a8) and b24br (84e09b0). `next build` EXIT 0 on both; 2,335 pages each.
- **Gates:** worktree b24g at 24663a8 with 84e09b0 staged, running the real `.husky/pre-commit`.
- **Sweeps:** the round 1 structure, source-claim, ratio, pointer and anchor sweeps (scratchpad qa24/*.mts), re-run over all 29 posts from base to tip.
- **Fee scan:** fee-scan row diff (scanAllPosts multiset).
- **Rendered output:** whole-site built-HTML diff.
- **Diff:** I read the full 5432876..84e09b0 word diff (59 hunks).

## Verdict: FAIL

Every round 1 finding is fixed as listed, and every gate and regression check passes. Two small items remain:

- **R1:** one mba-fees FAQ still contradicts the body.
- **R2:** three multiplier or payback lines remain in posts this batch owns. They were all present at 24663a8. My round 1 sweep did not catch them; my round 2 sweep, with wider patterns, did.

Both are text-only fixes.

---

## Blocking

### R1. mba-fees: an FAQ contradicts the body on campus fees, and keeps "highest ROI"

- The body now says, for FMS Delhi, "Fee: not tracked (campus programme)" (twice). It says the same for Mumbai and Anna University campus MBAs, and every campus row in the category table reads "Not tracked".
- The visible FAQ, and the FAQPage JSON-LD on the built page, still say:
  - "What is the MBA fee in government colleges in 2026?": "FMS Delhi (University of Delhi): Rs 2.32 lakh for 2-year MBA - the highest ROI MBA in India. JBIMS Mumbai … Rs 7 to 9 lakh … IIT DMS … Rs 8 to 11 lakh … State university MBA (Mumbai, Pune, Anna): Rs 50K to Rs 2 lakh range."
  - "What is the realistic MBA fee range …": "(FMS Rs 2.32 lakh is the lowest)" and "State government MBA: Rs 50K to Rs 2 lakh".
- The meta promises only "IIM Rs 27L, ISB Rs 45L, private Rs 8-25L, online Rs 31K-2.25L". FMS, JBIMS, IIT DMS and state-university figures are not meta-protected, so the reason given for keeping FAQ figures does not cover them.
- "the highest ROI MBA in India" is the same claim this round removed from the FMS H2 ("The Highest-ROI MBA in India" became "A Government Campus MBA").
- **Fix:**
  - In the government-colleges FAQ, make FMS, JBIMS, IIT DMS and state universities read "not tracked (campus programme)", keeping the IIM range that the meta needs.
  - Drop "the highest ROI MBA in India".
  - Drop the "(FMS Rs 2.32 lakh is the lowest)" and "State government MBA" clauses from the fee-range FAQ.

### R2. Multiplier or payback lines left in posts this batch owns (all present at 24663a8)

| Post | Line | Class |
|---|---|---|
| ias-officer-salary-india-2026-pay-scale-perks (item 2 multiplier post) | "Based on the pattern of previous pay commissions (which typically double salaries), speculative estimates suggest …" | The same kind of multiplier as the "(which typically increase basic pay by 2x to 2.5x)" this batch deleted elsewhere in the same post |
| mba-after-bsc-is-it-good-2026 (item 2 multiplier post), FAQ | "Work experience 2-3 years between BSc and MBA improves outcomes 30 to 50 percent" | A percent ratio, the same class as the "30 to 40 percent lower" lines removed from this post |
| bba-full-form-course-details-eligibility-fees-2026 (chunk post), "Scenario-wise ROI Breakdown" | Scenario 1: "You recover the full investment within 2-3 years." | Derived payback, the same class as the breakevens removed in round 2 |

**Fix:** delete the parenthetical, the percent clause and the payback sentence. Each sentence reads correctly without them.

## Round 1 findings: all fixed

- **F1, source claims.** "FT 2024 reports", "HackerOne plus Bugcrowd report …", "Stream-by-stream salary ranges shown are medians" and the "UPSC 2024-25 topper analysis" line are each at 0 in the edited posts. The one remaining "topper analysis" hit is in commerce-jobs-list, which is not in this batch.
  - The cyber rewrite reads correctly: "Bug bounty earnings are uneven, and a small group of top hunters takes most of the payouts." The relabelled bullet "Large payouts go to a small group:" no longer points at a deleted figure.
  - Extra deletions in the same class, all at 0:
    - mba-marketing "per recent cohort data" and its "10 to 15 hours per week" claim (the sentence now reads cleanly);
    - the chennai "Calculating ROI for Chennai MBA Aspirants" section (it included an Amity MBA "Rs 1,99,000", which is the MCA fee).
- **F2, ratios and ROI.** These are all at 0:
  - "lag CS and Mathematics";
  - "The B.Sc + Online MBA ROI Math";
  - "Net 5-year gain" and "ROI breakeven" in bsc-career;
  - the three IIM breakevens, ISB, FMS, "fee-to-placement ratio", "just to break even" and the four payback worked lines in mba-fees;
  - "LLM ROI Analysis" and ", breakeven 4 to 6 years" in llm.

  The 4 remaining "ROI breakeven" hits on the site are in 1-year-mba, distance-mba-bangalore and mba-scope (×2), none of them in this batch.
- **mba-fees payback FAQ (item 2).** It now reads: "Work it out from your own numbers. Payback period in months = total real MBA cost divided by the post-MBA monthly salary increase. No single figure fits every programme or every learner."
  - It reads correctly, and it matches the body formula paragraph that was kept.
  - The built FAQPage JSON-LD carries the identical text.
  - JSON-LD parses on every page, and no FAQ answer became unmirrored.
- **F3, data-science.** Its post block in lib/blog.ts is byte-identical to 24663a8: an md5 over its 226 source lines matches, and the parsed post object is identical. Its salary-baseline line is 62. It is not in the rendered change list.
- **F3, llm.**
  - The figure is base content. At 24663a8 the deleted ROI bullet read "Premium NLU LLM (Rs 3 lakh fee plus Rs 6 lakh opportunity cost): Total real cost Rs 9 lakh. Year-1 post-LLM CTC Rs 12-20 LPA at top law firms. Breakeven 12-18 months."
  - The restored bullet, "Top law firm associate after a premium NLU LLM: year-1 CTC Rs 12-20 LPA.", is new wording around that base figure and condition. No new number was added.
  - The figure itself is unsourced. That is Rishi's meta decision (Q71); this is a statement of facts only.
- **F4.** The bsc-career H2 is now "B.Sc Career Outcomes Depend on the Stream", which matches its two sentences.
- **A1 to A3.**
  - "edifyedu.in Cohort Data", "snapshot from edifyedu.in counsellor interviews" (in mba-digital-marketing), "per NIRF 2024 placement data", "NASSCOM Tech Hiring Report" and "50-55 percent women" are each at 0 in the edited posts.
  - The 2 remaining "counsellor interviews" hits are in mba-international-business and distance-mba-hyderabad, which are not in this batch.
  - The mba-or-mca demand bullets still read cleanly with only their sector lists.
- **A2, mba-fees prose against the table.**
  - The prose campus fees are gone: IIM Old and New ranges, the ISB tuition, living and total bullets (now "Fees: Not tracked (campus programme)"), the FMS fees, the Mumbai and Anna fees, the tier-2 "Rs 8 to 15 lakh", "above Rs 8 lakh", "Rs 15 lakh campus MBA" and the waiver clause.
  - The intro "Rs 45 lakh-plus (ISB plus living costs)" stays, and the meta backs it.
  - What remains is the FAQ contradiction in R1.

## Item 6: meta against body

- **bsc-career** ("stream-by-stream salary curve (CS, Biotech, Nursing, Stats)").
  - At 24663a8 the literal "salary curve" appeared only in the H2 that F4 renamed. The stream INR table went in batch 24, and the FAQ still gives stream-wise starting figures.
  - **Advice:** keep the F4 rename. Do not restore the old H2 over two sentences, and do not add a sentence that re-creates a stream salary curve, because either would bring back the unsourced figures this chunk removed.
  - List bsc-career with data-science in Q71, so the meta can be softened when Rishi decides. A sentence such as "Outcomes and pay differ sharply by stream; see the FAQ for starting points" would answer the snippet without adding a figure, if a body anchor is wanted now.
- **The four pre-existing mismatches are unchanged by this batch:**
  - The metaDescription is byte-identical at base and tip for mba-marketing, mba-or-mca, arts-stream and ias, and for bsc-career and llm.
  - None of the meta figures appears in the body at base or tip: "12.2" and "20%"; "6-25 LPA" and "4-30 LPA"; "4.5L", "8-25" and "3-15"; "38%".
  - There are partial textual near-matches ("20 percent" ×1, "8 to 25" ×2), and their counts are also identical at base and tip.

## Gates and regression

### Pre-commit

On a staged 24663a8..84e09b0 tree (6 files): "all checks passed", EXIT 0.

| Gate | Result |
|---|---|
| fee baseline | 205 |
| em-dash | 227 |
| blog-fees | 1868 |
| salary self-test | 23 cases |
| salary main | 1550 |
| salary ext | 47 |
| check-blog-updated-at | 28 posts |
| protected-pages | 8 paths, 8 frozen posts OK |
| check-nirf-category | OK |

### Blog-fees, all from deletions

- Unverified raw rows from 24663a8 to tip: 2122 → 2101.
  - 25 deleted;
  - **0 reclassified as NON_FEE, 0 as MATCH**;
  - 4 gained: the 3 correct MCA cells, plus mba-fees "Rs 10K to 25K" convocation fees, which lost an exemption and is now counted.
- Net −21, which equals 1889 → 1868.
- Round 2 alone: mba-fees 54→47, chennai 11→9, llm 19→18 (−10).
- **No new exemptions.**

### Salary baseline

- 1902 → 1550: 19 slugs drop, by −352 in total.
- data-science is unchanged at 62.
- Round 2 lowered bsc-career to 55, llm to 15 and mba-fees to 9. The other 16 chunk slugs match the batch 24 values.

### Rendered output

- Same 2,335-page list.
- 29 pages changed visibly: 28 blog pages plus the online-mca mirror of the Amity MCA review. data-science is not among them.
- **0 title or meta changes.**
- JSON-LD parses on every page (0 failures).
- 0 undefined or NaN.
- 0 new tag imbalances across 2,335 pages.
- CRLF uniform in every changed file.
- 0 em dashes in added lines.

### The full 5432876..84e09b0 diff

All 59 hunks were read. Every edit is the deletion or rewording listed in FIX-LOG round 2, or the data-science restoration. No new figure appears except the restored llm base figure.

## Advisories (not blocking)

- **A1. Unsourced generalisations remaining in batch posts** (not ratios of two salaries):
  - iim "Rs 30 lakh investment makes sense only if you can reach Rs 50 LPA-plus within 3 years" (a payback threshold);
  - mba-fees FAQ "Net difference often Rs 35 to 55 lakh in your favour" (a derived sum);
  - career-after-bcom "salary growth … typically 8-12% per year";
  - best-computer "Soft skills compound salary 20 to 40 percent";
  - mba-digital-marketing "25 to 40 percent of revenue" and "35 to 50 percent of acquisition budget".

  Worth adding to R2 if the engineer is in the file anyway.
- **A2.** The mba-fees byline says "Fee data sourced from official IIM, ISB, IIT, FMS Delhi admissions pages 2026-27", but the body now reports those fees as "Not tracked". Consider rewording it to describe what the post now carries.

## Re-run checklist

- **R1:** the government-colleges and fee-range FAQs no longer give FMS, JBIMS, IIT DMS or state campus figures or "highest ROI", visible and in JSON-LD.
- **R2:** ias "(which typically double salaries)", the mba-after-bsc FAQ "30 to 50 percent" and the bba "recover the full investment within 2-3 years" are gone.
- **Gates no higher than:** fee 205, blog-fees 1868 (from deletions only), em-dash 227, salary 1550, ext 47.
- data-science still byte-identical to 24663a8.
