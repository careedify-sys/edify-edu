# QA: B3 batch 25r3+26 pre-merge rerun (fix/b3-batch-26 at c9184f7)

Date: 2026-11-28. Checker: qa-checker (outsider). Branch tip c9184f7, on 490e504. Merge base with origin/main is 09a30c1. origin/main is de4d075.

## Verdict: FAIL

The rerun fixes N1, N3 and N4, and every gate passes at the expected counts. Two of the three look-hard items still block:

- The Amity BBA fees body still claims 0% or no-cost EMI in 5 places.
- The BVP cell ₹1,78,000 is a sum.

Two sibling posts edited in this batch also still print the Amity BBA EMI and annual figures that c9184f7 now calls unverified.

## Method

- Ran a sentence-level diff of 490e504 to c9184f7. It is one commit touching lib/blog.ts, data/blog-fee-baseline.json and audits/FIX-LOG.md.
- Swept every rupee figure in added text against the removed text.
- Compared post blocks of 09a30c1 and c9184f7 for: the frozen 8 posts plus data-science, updatedAt, title, seoTitle, h1Title, metaDescription and description.
- Made a worktree at de4d075, ran `git merge --no-commit c9184f7`, then ran `.husky/pre-commit` on the staged merge.
- Made a worktree at c9184f7 and merged d0fcd1d, and then the current branch tip dbd7886. I resolved the baseline conflict with the per-slug minimum and ran check-blog-fees.
- Cleanup: removed junctions with `cmd /c rmdir`, then ran `git worktree remove --force`. The shared node_modules still has 417 entries. The author clone is untouched (HEAD c9184f7).

## Engineer's claims

| Claim | Result |
|---|---|
| N1: Amrita ₹1,41,000 relabelled "total tuition for Indian students" | PASS. Applied in 5 places plus the peer row. Source: per-semester-fees-2026-11-27 section A row 29 ("Total Tuition Fee Rs. 1,41,000", Indian students, registration Rs. 700, examination Rs. 2,750 per semester), so "registration and exam fees on top" is sourced. |
| N1: ordering claims and the derived ₹39,000 and ₹24,000 deleted | PASS. "Peer Tier 1 Premium programmes list higher fees", "lower fee", "accessible fee", "structurally lower fee" and both "Saves ₹39,000" items are gone. There are 0 hits for ₹39,000 in the post. |
| N1: peer table header "Listed Fee" | PASS |
| N2: all Amity annual and EMI figures and the Higher/Highest cells removed (amity-online-bba-fees-2026) | PASS in the body for the figures: 0 hits for ₹63,020, ₹1,89,050, ₹8,292, ₹13,930 and ₹9,950. One ₹7,877 remains, in the metaDescription (deferred). The Higher/Highest cells are gone. FAIL on the 0% EMI claim wording, see F1. |
| N3: four LPU ₹27,600 removed | PASS. 0 hits for ₹27,600 and ₹4,600. The "Total saving" table row was deleted cleanly as a whole row. |
| N4: Symbiosis "application fee" in 7 places; summed ₹1,66,000 removed | PASS. All 7 places are correct and there are 0 hits for ₹1,66,000. The label matches the per-semester sheet row 26 ("Application Fee 1,000"). The Amrita peer line also uses the new label. |
| Gates: blog-fees 1784, fee 205, em-dash 225 | PASS. See the gates section. |

## Findings

### F1. HIGH (blocking). The Amity BBA fees body still claims 0% or no-cost EMI

Post: amity-online-bba-fees-2026. c9184f7 rewrote the EMI FAQ to say "The monthly amount, the total and any interest are not in our verified data". The same page still states, outside the metaDescription:

1. Body fee table row label: "24-Month No-Cost EMI". c9184f7 edited this row's cells but kept the label.
2. Body: "Eligibility for 0% EMI typically requires a credit score above 700 and active employment or proof of income".
3. Body: "International applicants may not be eligible for the 0% EMI option; they typically need to pay either lump sum or yearly instalments".
4. FAQ (international students): "The 0% EMI option is generally not available for international applicants".
5. FAQ (semester-wise): "...the Annual payment, or the 24-month 0% EMI". This answer was edited in c9184f7.

No verify row backs no-cost or 0% EMI for the Amity BBA. batch20-facts row 1a covers only the MBA fee card ("24 Months No-Cost EMI", "0% Interest"). The page now contradicts itself: one FAQ says interest is unverified, while the table and three other sentences say it is zero.

Fix:
- Change the table label to "24-Month EMI".
- Drop "0%" from items 2 to 5, or delete those sentences.

The metaDescription ("₹7,877/mo 0% EMI") stays deferred to batch 27 under the title/meta freeze. It now contradicts the body, so batch 27 should treat it as a priority.

### F2. HIGH (blocking under the brief's rule). The BVP ₹1,78,000 in mba-hr-management-online-india-2026 is a sum

Where the cell came from:
- The engineer's own FIX-LOG entry says: "matches lib/data.ts (Standard ₹1,76,000 + ₹2,000, total 178000)".
- lib/data.ts feePlans mba row: `mode: "Standard (₹1,76,000 + ₹2,000)", total: 178000`. The extras line reads "Registration and admission (included in the totals above)" 2000.

What BVP actually prints:
- per-semester-fees-2026-11-27 section A row 43: "Total ₹1,76,000. Registration ₹1,000 and admission ₹1,000, both non-refundable." The same sheet (line 108, queue Q74) says "the page text gives only ₹1,76,000 total".
- No verify sheet shows BVP printing ₹1,78,000.
- batch18-facts row 4s covers only the BVP domain, not the fee.

So ₹1,78,000 = ₹1,76,000 + ₹1,000 + ₹1,000. That is our addition of fee parts.

Context the coordinator must weigh: FIX-LOG 2026-10-28 records "Bharati Vidyapeeth MBA, confirmed by Rishi 28 Oct: ₹1,78,000 total is current (₹1,76,000 tuition and exam plus ₹1,000 registration and ₹1,000 admission)". The figure is also the lib/data.ts feeBreakdown list ("total") and appears in the BVP review title and across the site. So it is a Rishi-ratified sum, not a figure BVP publishes.

- Under the never-add-parts rule as briefed, the cell fails. The fix the brief names is to print "₹1,76,000 (tuition and exam fees)" in the cell. The two prose mentions "Bharati Vidyapeeth (₹1,78,000)", added in round 2, then need the same treatment.
- If the coordinator treats the 28 Oct confirmation as a final Rishi decision (CLAUDE.md rule 3), F2 drops to INFO.
- Either way, do not make the change only in this post. The cell would then disagree with the BVP review title and lib/data.ts. If the rule wins, the site-wide figure needs an entry in QUESTIONS-FOR-RISHI.

### F3. MEDIUM (blocking). Two sibling posts edited in this batch still print the Amity BBA figures c9184f7 calls unverified

Both posts were edited in 09a30c1..c9184f7 and carry updatedAt 2026-11-28. They still print ₹7,877, ₹63,020, ₹1,89,050, ₹8,292 and "0% / no-cost / zero-cost EMI" as fact.

amity-online-bba-review-2026 (₹7,877 appears 10 times, unchanged from base):
- FAQ: "24-month 0% EMI at ₹7,877/month (effective ₹1,89,050), Annual Payment at ₹63,020/year × 3 years (effective ₹1,89,050)".
- FAQ: "Is the 0% EMI on Amity Online BBA really interest-free? Yes. ... ₹7,877 per month totals ₹1,89,050 ... ₹8,292".
- Body: "₹1,89,050 (24-month 0% EMI at ₹7,877/month), ₹1,89,050 (annual at ₹63,020/yr)".
- The metaDescription also says "0% EMI ₹7,877 monthly" (frozen field).

best-online-bba-colleges-india-2026 (₹7,877 appears 3 times):
- "24-month no-cost EMI at ₹7,877 per month".
- "₹1,89,050 effective annual payment (₹63,020 per y...".
- "Tier 2 Amity 24-month zero-cost EMI ₹7,877/mo".

These figures are also internally inconsistent: 63,020 × 3 = 1,89,060 and 7,877 × 24 = 1,89,048. After this merge the site would call these amounts unverified on one page and print them as fact on two others in the same batch. Apply the N2 treatment to both bodies. The metaDescriptions go to batch 27.

### F4. MEDIUM (deferred, already logged). ₹23,880 remains 4 times in amity-online-bba-fees-2026

The per-semester sheet (section B, line 92) calls it "₹1,99,000 minus ₹1,75,120, our subtraction". It appears in:
- "(cheapest, saves ₹23,880)"
- "(saves ₹23,880 vs sem-wise)"
- "Sticker ₹1,99,000, reduced ₹23,880 with self-pay benefit"
- FAQ "self-pay benefit (₹23,880 reduction) ... the Annual payment, or the 24-month 0% EMI"

That FAQ also implies Annual and EMI cost ₹1,75,120, which contradicts "Confirm the Annual and EMI totals". It is deferred to batch 27 per the coordinator. The 0% wording inside it is covered by F1.

### F5. LOW (pre-existing). "₹33,200/sem × 6 = ₹1,99,000" prints false arithmetic

6 × 33,200 = 1,99,200. Amity prints ₹33,200 per semester and "Effective fee of Rs. 1,99,000" separately (sheet row 15), so our "× 6 =" asserts a sum that does not hold. It appears in the body table, the FAQ and the comparison row. Suggest "₹33,200 per semester; Amity lists the effective fee as ₹1,99,000". Batch 27.

### F6. LOW (pre-existing). Amity BBA Application ₹1,100 and Registration ₹2,500 have no source

Sheet row 15 says "The page lists no registration fee." Batch 27.

### F7. LOW. The Symbiosis BBA "A one-time ₹1,000 application fee is extra" may read as the only extra

Sheet row 26 also shows "Registration Fees" ₹5,000 in its own column. It is unclear whether that sits inside ₹1,65,000. No new figure was introduced. Log a verify question; it does not block.

### F8. INFO (pre-existing). The Amrita BBA "NIRF top tier rank (top 10 university category typically)" is hedged and gives no category rank

Out of scope for this batch.

## Sweep for new derived figures

Every rupee figure in added lines also appears in the removed lines or elsewhere in the old post. The only count increases are:
- ₹1,99,000 (+2): restated in "costs less than Semester-wise at ₹1,99,000". Published.
- ₹1,78,000 (+1): the BVP cell (F2).
- ₹1,41,000 and ₹1,65,000: relabelled restatements.

The counsellor replacement text adds no figure. Apart from F2, no peer cell keeps a summed number. The Symbiosis ₹1,66,000 sum and the Amity × 3 and × 24 products are gone from amity-online-bba-fees-2026. They survive in the F3 siblings.

## Gates (husky on de4d075 + c9184f7 staged, exit 0, "all checks passed")

- verify-fees: 0 new mismatches.
- check-em-dash-baseline: 225, unchanged.
- check-fee-baseline: 205, unchanged.
- check-fee-provenance: self-test OK; 2 known gaps.
- check-blog-fees: 1784, unchanged from baseline (1785 to 1784 in-branch, amrita-online-bba-review-2026 13 to 12).
- check-blog-salaries: 1549 and 47.
- Protected pages: 8 paths and 8 frozen posts OK.
- check-blog-updated-at: OK.
- typecheck:scripts: OK.
- No allowlist entry was added and no baseline was raised.

## Frozen posts, updatedAt, title and meta

- The frozen 8 posts and data-science-salary-india-2026-scope-jobs are byte-identical between 09a30c1 and c9184f7.
- The 5 posts edited in c9184f7 are amity-online-bba-fees-2026, mba-hr-management-online-india-2026, amrita-online-bba-review-2026, lpu-online-bba-review-2026 and symbiosis-online-bba-review-2026. All carry updatedAt 2026-11-28.
- title, seoTitle, h1Title, metaDescription and description are unchanged in all 5, against both 09a30c1 and 490e504. Em dashes: 0 in all 5.
- Build HTML diff: not run this round. The source diff touches no head field (checked field by field above), and the verdict is already FAIL. Run it on the next round.

## Merge checks

- With origin/main de4d075: clean auto-merge (QUESTIONS-FOR-RISHI auto-merged). Husky passes on the staged merge as above. The non-audit files changed are data/blog-fee-baseline.json, data/per-semester-fees.json, lib/blog.ts, scripts/check-blog-fees.mjs and scripts/lib/blog-fee-scan.mjs.
- With fix/bba-fees-mahe-amrita at d0fcd1d:
  - Conflicts in audits/FIX-LOG.md (resolve by keeping both) and data/blog-fee-baseline.json.
  - Per-slug minimum resolution gives 1778. check-blog-fees then drops it to 1772 (amrita-online-bba-review-2026 12 to 9, mahe-online-bba-review-2026 6 to 5, symbiosis-online-bba-review-2026 10 to 8). Exit 0.
- The branch tip has moved to dbd7886 (d11f395, 8bb7370, dbd7886 since d0fcd1d). The same two conflicts occur and the same resolution gives the same result: 1778 to 1772, exit 0. Do not take either side's baseline wholesale: d0fcd1d's file totals 1848.

## Required before PASS

1. F1: remove the no-cost and 0% EMI wording from the amity-online-bba-fees-2026 body and FAQs (table label plus 4 sentences).
2. F2: the coordinator decides between the never-add-parts rule and Rishi's 28 Oct confirmation.
   - If the rule wins, the cell and both prose mentions read "₹1,76,000 (tuition and exam fees)", and the site-wide ₹1,78,000 goes to QUESTIONS-FOR-RISHI.
   - If the confirmation wins, record that decision in FIX-LOG.
3. F3: apply the N2 treatment to the amity-online-bba-review-2026 and best-online-bba-colleges-india-2026 bodies.
4. Rerun husky and the build diff.
