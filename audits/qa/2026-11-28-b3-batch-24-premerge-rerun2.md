# QA: B3 batch 24, round 3 (pre-merge rerun 2)

- Commit: b34594c on fix/b3-batch-24 (parent 84e09b0, base 24663a8)
- Checked: 2026-11-28, by qa-checker in its own worktrees (b24base = 24663a8, b24br = b34594c, b24g = 24663a8 with b34594c staged). The engineer's repo was not touched.

## Verdict: FAIL (one mechanical gate finding; content PASS)

Round 3's content is correct. Every R1, R2 and advisory item is gone, the replacement text reads correctly and invents nothing, and the built output is clean.

The batch fails on one gate. Run over the whole batch delta (24663a8 to b34594c), the full pre-commit stops at check-blog-updated-at on 5 posts. Both real landing merges hit the same 5. Both merges also conflict on audit files, so each ends in a manual `git commit`, which runs this hook. Neither merge can be committed today without `--no-verify`, and that would weaken the gate.

## Findings

**F1. check-blog-updated-at fails at merge time on 5 posts (blocking, mechanical).**

The hook in b24g printed:

```
check-blog-updated-at: 5 post(s) changed content without changing updatedAt:
  mba-hr-career-salary-scope-2026 (updatedAt still 2026-11-27)
  mba-marketing-career-salary-jobs-2026 (updatedAt still 2026-11-27)
  mba-for-commerce-students-india-2026 (updatedAt still 2026-11-27)
  mba-operations-management-career-2026 (updatedAt still 2026-11-27)
  best-online-mba-colleges-india-2026 (updatedAt still 2026-11-27)
```

- Round 1 and round 2 edited these 5 posts on 27 Nov. Batch 23 (24663a8) had already dated them 2026-11-27, so the value never changed and the hook's same-day exemption only works on 27 Nov IST.
- Round 3 on its own passes: 84e09b0 to b34594c changes 12 posts, 0 stale, and all 12 carry the new 2026-11-28.
- I reproduced the hook's logic in scratchpad/qa24q/ua.mts and ran it on the real merge trees from `git merge-tree --write-tree`:
  - fix/b3-batch-23r3 + b34594c (tree 6baedb9): 28 posts changed, **5 stale**, the same 5 as above.
  - origin/main + b34594c (tree c1febfb): 67 changed, 15 stale. Main does not contain batch 23, so this count includes batch 23 posts.
- Fix: set `updatedAt: '2026-11-28'` on those 5 posts, with no other edit. That is truthful, because their content first ships today.
- Heads-up outside this item: the batch 23 merge has the same problem. origin/main + fix/b3-batch-23r3 (tree 3d973be) gives 49 changed and **20 stale**, all dated 2026-11-27. Batch 23 will need the same bump before it lands.

## Check 1. R1 and R2 removed (PASS)

I counted each phrase in the batch posts at base 24663a8 and again at the tip. Every one is 0 at the tip:

- FMS "Rs 2.32 lakh"
- "highest ROI MBA in India"
- "typically double salaries" (ias)
- "improves outcomes 30 to 50 percent" (mba-after-bsc)
- "recover the full investment" and "Rs 50 LPA-plus within 3 years" (bba payback)
- "Rs 7 to 9 lakh approximately" (JBIMS)
- "low fee high ROI"

The mba-fees byline in the built page now reads: "Online MBA fees come from current edifyedu.in university profiles. Campus MBA figures are indicative, and most campus fees are not tracked." The old "Fee data sourced from official IIM, ISB, IIT, FMS Delhi admissions pages" claim appears in no batch post. It survives only in posts outside this batch (1-year-mba-india-executive-mba-2026, online-mba-fee-comparison-india-2026, is-distance-mba-worth-it-india-2026).

The government-colleges FAQ reads correctly in the visible page and the FAQPage JSON-LD. Both say "FMS Delhi (University of Delhi), JBIMS Mumbai (Mumbai University), IIT DMS (IIT Delhi MBA) and state university MBAs (Mumbai, Pune, Anna): not tracked (campus programme)", followed by the kept IIM range. The fee-range FAQ reads "Tier-1 private (XLRI, MDI): up to Rs 25 lakh" in both places.

## Check 2. Advisories and wider sweep (PASS)

Each of these is 0 at the tip:

- iim payback
- "Net difference often" (Rs 35 to 55 lakh), plus the opportunity-cost sentence
- career-after-bcom "8-12% per year"
- best-computer "compound salary 20 to 40"
- digital-marketing "25 to 40 percent of revenue"
- btech "can be below 30%"
- amity-mca "Several students report"
- lpu "Students report that"
- bba "advising hundreds of students"
- chennai "largest engineering alumni"

The mba-fees "8 to 15 percent" and "4 to 8 percent" savings figures now appear only in the 3 posts outside the batch named above.

I read all 35 word-diff hunks in 84e09b0..b34594c. Each one is a deletion or a neutral rewording, for example "your salary growth will be slow." and "Some employers sponsor part or all of the fee". None adds a new number, source or claim, so no new audits/verify/ row is needed.

## Check 3. ratio and src2 sweeps over all 29 posts, and the deliberate keeps

Outputs: scratchpad/qa24q/ratio.out and scratchpad/qa24q/src2.out.

These keeps are acceptable:

- eligibility percentages
- DA/HRA
- loan and EMI interest ranges, and the late fee
- percentiles
- qualitative "ROI" wording without a number
- LPA salaries, which the salary ratchet already counts
- mba-marketing "The 20 percent digital premium is real but may compress", held for Q71

The src2 residuals are all benign. These advisories do not block:

- A1. career-after-bcom pass rates are unsourced statistics: CA Foundation about 30%, Intermediate about 12%, Final under 8%, CFA L1 40%, and MBA "75-90% (varies by university)". These belong in the next sweep or a Q.
- A2. best-online-mba "AACSB ... fewer than 6 percent" is an unsourced statistic.
- A3. In mba-marketing, the body says "The 20 percent digital premium is real but may compress". The same post's FAQ says no official source publishes a digital premium. The post contradicts itself, and has since batch 20 (b7c902c). Keeping it for Q71 is acceptable, but Q71 should record the contradiction as well as the figure.

## Check 4. Built output (PASS, apart from F1's dates)

I built both trees with `next build`; both exited 0.

- Pages: 2335 in each, same list.
- Meta changes: **0** (title, description, og, twitter, canonical, robots) on every page.
- JSON-LD: 0 parse failures. LD changed on 26 pages: the FAQ text edits, plus dateModified on the 12 re-dated posts.
- Visible text changed on 29 pages: 28 blog posts plus /online-mca/amity-online-mca-fees-review. This is the same set as round 2.
- undefined/NaN: 0. Pages with more unmirrored FAQ answers: 0. New tag imbalances: 0 across all 2335 pages.
- Table count drops on 12 pages come from the table deletions in rounds 1 and 2, which were reviewed then.
- The one "LD answer not visible" flag (arts-stream-jobs-career-options-salary-india) exists on the base build too, unchanged. It is a pre-existing escaped `<a>` tag inside that FAQ answer, which renders as literal markup. It is not caused by this batch.
- Round 3 changes no title, seoTitle, description or excerpt line. updatedAt is now 2026-11-28 on all 12 posts round 3 edited.

## Check 5. Gates (FAIL on F1 only)

I ran the full `.husky/pre-commit` in b24g with b34594c staged on 24663a8. It stopped at check-blog-updated-at (F1). I then ran every gate after it separately, and they all printed OK, ending with "pre-commit: all checks passed" and EXIT 0. Log: scratchpad/b24qrest.log.

| Gate | Result |
|---|---|
| check-fee-baseline | 205, unchanged |
| check-em-dash-baseline | 227, unchanged |
| check-blog-fees | 1861, unchanged from the lowered baseline (1868 to 1861 this round, 1889 to 1861 across the batch) |
| check-blog-salaries | 1550 to 1549 (lowered), ext 47 = 47 |
| every other gate before and after | OK |

- No allowlist file is in the diff. The batch touches only audits/FIX-LOG.md, data/blog-fee-baseline.json, data/blog-salary-baseline.json, data/blog-salary-ext-baseline.json, lib/blog.ts and lib/content.ts. Round 3 touches only FIX-LOG, blog-fee-baseline.json and lib/blog.ts.
- No CRLF in any of the 3 round 3 files.

**Fee-row reclassification check (the batch 23 F3 lesson).** I diffed the scanner's rows at the base and the tip as multisets (scratchpad/qa24q/feecmp.out). Of the 28-figure drop:

- 32 figures were deleted from the text and 5 new unverified rows appeared;
- **1** row was reclassified to NON_FEE: mba-fees "IIM ... charge Rs 20 to 30 lakh". It went from UNRESOLVED to NON_FEE because deleting the State-university line moved the IGNOU "per semester" phrase into its context window;
- 0 rows were reclassified to MATCH.

So the ratchet sits 1 lower than the deletions alone justify (stricter, not weaker). The cost is that the kept IIM campus range no longer counts as unverified. This is advisory A4. It was a side effect of the R1 fix, not an attempt to game the gate. No action is needed beyond noting it.

## Check 6. Merge check (not merged)

- **Into origin/main (f0c1fda):** conflicts in audits/FIX-LOG.md and audits/QUESTIONS-FOR-RISHI.md only. lib/data.ts merges automatically. Main does not contain 24663a8, so batch 23 has not landed. The merge commit then hits F1 (15 stale posts, including batch 23's).
- **Into fix/b3-batch-23r3 (2a8e9df, which contains 24663a8):** conflict in audits/FIX-LOG.md only. lib/blog.ts merges automatically. The merge commit then hits F1 (5 stale posts).
- For reference, origin/main + fix/b3-batch-23r3 conflicts in FIX-LOG.md and QUESTIONS-FOR-RISHI.md only, and needs the same date bump on 20 posts.
- None of these merges has a code or content conflict.

## To pass

Set `updatedAt: '2026-11-28'` on the 5 posts listed in F1, change nothing else, and re-run check-blog-updated-at against the batch 23r3 merge tree. Everything else in this batch is ready to merge.
