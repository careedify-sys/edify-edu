# QA pre-merge rerun: B3 batch 25 round 2

Date: 2026-11-28
Commit: 10ffd3c on fix/b3-batch-25. Its parent is 3efb19b, which merges origin/main 0746967 over c04d4e4.
Round 1 report: audits/qa/2026-11-28-b3-batch-25-premerge.md

Method: I used separate worktrees, all with node_modules junctioned and audit-data copied in. I did not edit the author's clone.

| Worktree | Commit | Purpose |
|---|---|---|
| r2 | 10ffd3c | scanner runs and build |
| r2base | 0a8999e | build base for the diff |
| r2merge | 0a8999e, with `merge --no-commit 10ffd3c` | husky pre-commit run |
| r2main | current origin/main 5b67ad9 | merge check |
| r2f | 10ffd3c | fault injection |

I removed every junction with `cmd /c rmdir` before removing the worktrees.

## Verdict: FAIL

One blocking finding remains (R1). The round 2 scanner still has one exemption the old scanner never had: the word "off" after a figure.

I proved it on the same inputs with both scanners. "The NMIMS online MBA costs Rs 9,99,000 off-campus" is MISMATCH under 341f986 and NON_FEE under 10ffd3c. Everything else from round 1 is fixed or acceptable.

## Gates and build

- **Husky pre-commit** (r2merge, batch staged over 0a8999e): all checks passed, exit 0.
  - Fee 205, em-dash 227, blog-fees 1792, salary 1549, ext 47.
  - check-blog-updated-at: 70 posts, all dated.
- **Allowlist:** data/blog-fee-allowlist.json is byte-identical to 0a8999e, so no allowlist entry was added. It has 156 pre-existing entries.
- **Baseline:** perSlug sums to 1792, which equals totalUnverified. No slug rose against main's baseline, and no slug was added or dropped. Main is at 1861.
  - updatedAt went from 2026-11-28 to 2026-11-27. The gate stamps the UTC date. This only widens the new-post strict rule, so it is not a weakening.
- **Counts on the 10ffd3c tree:** old scanner 1828, new scanner 1792.
- **Build:**
  - `npm run build` exits 0 at both 10ffd3c and 0a8999e.
  - Across 267 blog pages (HTML and RSC), title, meta description, canonical, og:title, og:description, h1 and robots are unchanged.
  - JSON-LD parses, with the same block count. Visible undefined, NaN and null did not rise. Em dashes did not rise. Tag balance is unchanged.
  - The only metadata change is dateModified, on 60 pages.
- **Rendered output:** the change shows in the built pages. Examples: fintech now has "₹1,75,125 net (after up to 25% Early Bird)", pharma has "Shoolini prints ₹32,500 per semester", BVP has "ask our counsellor for the current amount", and dy-patil has "costs more than MUJ".

## F1, scanner: injected-defect matrix

Every case below ran through three scanners on the same inputs: 341f986 (old), c04d4e4 (round 1) and 10ffd3c (round 2).

| Case | Old | R1 | R2 |
|---|---|---|---|
| wrong fee near "save" | NON_FEE | MISMATCH | MISMATCH |
| wrong fee near "scholarship" | NON_FEE | MISMATCH | MISMATCH |
| wrong fee near "discount" | NON_FEE | MISMATCH | MISMATCH |
| wrong fee near "cheaper" | NON_FEE | MISMATCH | MISMATCH |
| wrong fee near "waiver" | NON_FEE | MISMATCH | MISMATCH |
| gap via "difference of" | UNRESOLVED | NON_FEE | UNRESOLVED |
| gap via "higher" | UNRESOLVED | NON_FEE | UNRESOLVED |
| gap via "more expensive" | UNRESOLVED | NON_FEE | UNRESOLVED |
| gap via "less" | UNRESOLVED | NON_FEE | UNRESOLVED |
| gap via "costlier" | UNRESOLVED | NON_FEE | UNRESOLVED |
| "rebate of" | MISMATCH | NON_FEE | MISMATCH |
| "reduced by" | MISMATCH | NON_FEE | MISMATCH |
| wrong total, next cell "Higher rate" | MISMATCH | NON_FEE | MISMATCH |
| wrong total, next cell "Discount" | NON_FEE | NON_FEE | MISMATCH |
| wrong total, previous cell "Save" | NON_FEE | NON_FEE | MISMATCH |
| wrong fee, then "concession" | MISMATCH | NON_FEE | MISMATCH |
| "save Rs X" (discount amount) | NON_FEE | NON_FEE | NON_FEE |
| "Rs X scholarship" (discount amount) | NON_FEE | NON_FEE | NON_FEE |
| "gap of Rs X" (discount amount) | NON_FEE | NON_FEE | NON_FEE |
| **"Rs X off the online MBA"** | **MISMATCH** | NON_FEE | **NON_FEE** |
| **"Rs 9,99,000 off-campus"** | **MISMATCH** | NON_FEE | **NON_FEE** |
| **"Rs 9,99,000 off the bat"** | **MISMATCH** | NON_FEE | **NON_FEE** |
| "Rs 9,99,000 lower-division" / "gap year" | NON_FEE | NON_FEE | NON_FEE |

- **Old blind spots:** all closed. Every wrong fee next to a discount word is now checked.
- **Round 1 widening:** closed for difference, higher, less, more expensive, costlier, concession, rebate, reduced by, and words in another table cell. The cell-edge cut also closes two cases the old scanner itself missed (rows 14 and 15).
- **New exemption still present: "off".** See R1.
- **The self-test catches regressions.** I tested two faults:
  - I put "higher" and "less" back into AMOUNT_AFTER_RE. The gate fails its self-test on both cases.
  - I removed the cell-edge cut. The gate fails on the "Discount" next-cell case.

**Corpus effect: one figure.** Under round 2, exactly one live figure moves into NON_FEE compared with the old scanner. It is mahe-online-mba-review-2026, "up to Rs 5,000 off MAHE Online MBA" (a coupon amount), which was MISMATCH. I called that figure benign in round 1. That was wrong against the "no new exemption" bar, and it is the same mechanism as R1.

## F1, the exposed figures

| Post | Replacement | Verdict |
|---|---|---|
| online-manipal-mba-review-2026 | "the higher fee than MUJ and SMU" | OK. MAHE ₹2,92,000 > MUJ ₹1,84,000 (list) > SMU ₹1,20,000, all from getExactFee. The wording is a little awkward. |
| du-online-mba-delhi-university-2026 | total cell goes to "Contact our counsellor" | OK |
| dy-patil-online-mba-review | "DPU (Rs 1.89 lakh) costs more than MUJ (Rs 1.56-1.84 lakh)" | Holds. DPU getExactFee is 1,89,400 (total). MUJ is labelled: 1,84,000 list and 1,56,400 net after 15%. 1,89,400 is above both. The MUJ range carries no list/net label (pre-existing text, see R4). |
| amity-online-bba-fees-2026 | "Sharda (₹1,35,000) ... and so does JAIN (₹1,35,000)" | OK. Sharda BBA getExactFee is exact 1,35,000. The Sharda verify sheet (2026-11-16) covers only the MBA, so lib/data.ts is the source. JAIN BBA is 1,35,000 to 1,50,000. Amity BBA is ₹1,75,120 one-time or ₹1,99,000 semester-wise, so "less than Amity" holds. |
| amity-online-bba-review-2026 | "for a lower fee" | OK. MUJ ₹1,44,000 < Amity ₹1,75,120. |
| online-bba-programs-india-2026 | "NMIMS lists ₹1,41,000." | OK. NMIMS BBA getExactFee is exact 1,41,000. The ₹23,880 gap is deleted. |
| muj-online-bba-review-2026 | LPU (₹1,22,400) costs less than MUJ; Amity (₹1,75,120 one-time) costs more than MUJ; MUJ at ₹1,44,000 | OK. All three are labelled getExactFee values, and the ₹36,000, ₹21,600 and ₹31,120 gaps are gone. |
| why-online-mba-fees-differ-india-2026 | "after a concession" | OK |

## Round 1 findings

| # | Status | Evidence |
|---|---|---|
| F1 scanner | **Partly fixed. R1 remains.** | See the matrix above. |
| F2 BVP | Fixed | The "Backlog exams" wording is back. Both ₹400 mentions now point to the counsellor. "Rs 1,60,000" became "a lower figure". Rs 1,68,000 stays, and it is in feePlans as the one-time payment. |
| F3 Shoolini | Fixed | The figures match audits/verify/shoolini-university-online-2026-11-18.md row "Fee lines (M5)": regular ₹2,00,000, ₹1,58,000 with PAP, ₹1,30,000 without, ₹33,575 and ₹32,500 per semester, and the ₹500 application fee. They also match lib/data.ts feePlans. I cannot see Rishi's chat message; the sheet and the data agree with it. |
| F3 BVP ₹1,78,000 | Fixed | Both ₹1,60,000 mentions in mba-hr are now ₹1,78,000, the getExactFee total. |
| F3 CU tables | Fixed | Fintech, hospitality, logistics and real-estate now show ₹1,75,125 net and ₹43,781. ₹43,781 is audits/verify/per-semester-fees-2026-11-27.md section A row 11 (SOURCED). The ₹29,063 figure is gone; it was listed in section B as our own division. |
| F3 jain-vs-amity | Acceptable, with a Rishi item | ₹8,500, ₹2,04,500, ₹1,83,500, ₹20,500 and ₹29,000 are all deleted. Registration and exam charges are in JAIN's feePlans extras, so "narrow the difference" is backed. ₹1.96L stays because the metaDescription quotes it, and Q71 item 7 now records that. The body still has "₹1,96,000 (₹49,000/sem)" for standard tracks (R4). |
| F4 | Fixed | lpu-bba ₹27,600 (both mentions), muj-bba ₹21,600 and symbiosis-bba ₹15,000 are gone. ₹43,781 in aviation and mba-hr is now sourced (section A row 11), so it is acceptable. |
| F5 | **Mostly fixed. R2 remains.** | The Amrita comparisons and the pharma "lowest fee" H3 are gone. A new unbacked comparison appeared in their place (R2). |
| F6 | Fixed | Integral's "x 6 =" products, the Difference column and "₹1,500/₹500 lower" are gone. The table now has 4 columns of portal figures in every row. One sentence still states the arithmetic as prose: "the stated total sits a little below the semester fee times the number of semesters". It is true by the portal figures and has no number, so it is acceptable. |
| F7 | Fixed | I injected four faults. FREEZE_UNTIL set to 2026-12-04: FAIL ("differs"). Both dates set to 2026-12-12: FAIL ("is after 2026-12-05"). An extra held slug: FAIL ("not in FREEZE_SLUGS"). Clean run: OK at 1792. One gap remains: a slug added to both lists at once still passes (R5). |
| F8 | Fixed, with one false sentence | The base is now 341f986, the 3 missing moves are listed, and the 1-year-mba "Rs 25 lakh-plus" figure is deleted. The round 2 entry says a figure is exempt "only when the old rule would also exempt it". That is false for "off" (R1). |

## Sweep of the 22 posts edited in round 2

I compared every added sentence in all 22 posts with 3efb19b. All 22 have updatedAt 2026-11-28, and only content and faqs changed. There are no new rupee figures except labelled getExactFee or verify-sheet values, and no new superlatives. Two new comparisons have no backing (R2). The rest are cosmetic (R4).

## Merge check

- **Into 0a8999e** (the main named in the brief): clean. `git merge-tree` reports no conflicts.
- **Into current origin/main 5b67ad9:** conflict in lib/blog.ts, 10 hunks. Main moved ahead with the brand rename (615c7d2 and 5b67ad9).
  - In every hunk, main's only change against the base is " EdifyEdu" becoming " edifyedu.in", on post lines that this batch also edited.
  - Resolution: take the batch side, then rename EdifyEdu to edifyedu.in on those lines. After that, lib/blog.ts has 0 EdifyEdu, the same as main.
  - I tested that resolution in a throwaway worktree. check-blog-fees (1792), check-blog-updated-at (70 posts dated), check-em-dash, check-protected-pages, check-blog-salaries (1549/47) and check-duplicate-slugs all pass.
  - Main also changed data/blog-fee-allowlist.json (brand text in the source fields). The batch does not touch that file, so it merges cleanly.

## Findings

### R1. HIGH (blocking). "off" after a figure is a new exemption

AMOUNT_AFTER_RE accepts `off\b`. The old rule was `\boff\b\s*[,.)]`, which needs punctuation right after "off". So round 2 exempts figures the old rule checked:

- "Rs 9,99,000 off-campus" (wrong fee, now NON_FEE)
- "Rs 9,99,000 off the bat" (wrong fee, now NON_FEE)
- "Rs 10,000 off the online MBA"
- in the live corpus, MAHE "up to Rs 5,000 off MAHE Online MBA", which moved from MISMATCH to NON_FEE

"off-campus" is common wording on a site that compares online and campus fees. The self-test case 'Amity gives Rs 10,000 off the online MBA.' → exempt locks this exemption in.

**Fix.** Exempt a figure only when isDiscountAmount(...) is true AND one of the 10 DISCOUNT_SOURCES regexes matches tightCtx (the AND I proposed in round 1). An alternative is to make the AFTER "off" match the old `off\b\s*[,.)]`.

Then:

- Change the Amity self-test expectation, and add "Rs 9,99,000 off-campus" as a must-check case.
- mahe-online-mba-review-2026 will go from 7 to 8. Handle the Rs 5,000 coupon figure on its merits: a coupon data source or the counsellor line. Do not raise the baseline or add an allowlist entry.
- Correct the FIX-LOG sentence.

### R2. MEDIUM. Two new comparisons have no backing in lib/data.ts

- **symbiosis-online-bba-review-2026: "MAHE costs more than Symbiosis".** MAHE BBA has no getExactFee value, and the FIX-LOG says so in F4. The ordering only holds against MAHE's placeholder display range (₹1,68,000 to ₹2,24,000).
- **amrita-online-bba-review-2026: "Its fee tier sits alongside MAHE Online BBA and Symbiosis SSODL".** Amrita BBA has no exact fee. This is softer, but it is still a fee claim.

Drop the fee ordering, or keep the NIRF/IoE reason without "costs more".

### R3. MEDIUM (merge mechanics). lib/blog.ts conflicts with current origin/main

There are 10 hunks, all from the brand rename. Resolve them as described in the merge check: batch side, then EdifyEdu to edifyedu.in. Rerun check-blog-fees after the resolution. On my resolution it stays at 1792.

### R4. LOW (no action required for merge)

- dy-patil: "MUJ (Rs 1.56-1.84 lakh)" has no list/net label. The comparison still holds.
- online-manipal: "so is the higher fee than MUJ and SMU" reads awkwardly.
- mba-hr: the "practical shortlist" list is no longer in ascending order (Bharati Vidyapeeth ₹1,78,000 now sits before Alliance ₹1,74,000). The stray "SMU ," is pre-existing.
- jain-vs-amity: "₹1,96,000 (₹49,000/sem)" for standard tracks stays until Q71 item 7 is answered. The per-semester figure is in scope for batch 27.
- lpu-bba: "making LPU the lowest net fee tier among Tier 2 Mid-Premium" is pre-existing. It holds against CU ₹1,31,250, MUJ ₹1,44,000 and Amity ₹1,75,120.

### R5. LOW. The hold can still grow by editing two files

A slug added to both FREEZE_SLUGS and EXEMPTION_HOLD_SLUGS passes the hold check. The hard 2026-12-05 cap still applies, and the change is visible in two files of the diff. A fixed count (`EXEMPTION_HOLD_SLUGS.length <= 8`) or a hash of the list would close it. This is optional.

## Required before merge

1. R1: close the "off" exemption. Fix the MAHE coupon figure without raising the baseline, update the self-test, and correct the FIX-LOG sentence.
2. R2: remove the two unbacked fee comparisons.
3. R3: when merging into current main, resolve the 10 brand-rename hunks as described, then rerun the hook.
