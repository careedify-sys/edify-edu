# QA pre-merge: B3 batch 25 round 3 plus batch 26 (fix/b3-batch-26)

Date: 2026-11-28
Range: 10ffd3c..490e504 in scratchpad/b3-batch-19. Commits: ba5e73b (main 7c867dd merged), ce2b3b5 (25 round 3), 91d4d5d (26), 604b2a0, 22a7c14 (26 part B), 490e504 (main 09a30c1 merged).
Against origin/main 09a30c1, the batch touches 7 files: FIX-LOG, QUESTIONS-FOR-RISHI, blog-fee-baseline.json, per-semester-fees.json, lib/blog.ts, check-blog-fees.mjs and blog-fee-scan.mjs.

Method: I used separate worktrees, all with node_modules junctioned and audit-data copied in. I did not edit the author's clone.

| Worktree | Commit | Purpose |
|---|---|---|
| q3 | 490e504 | scanner runs and build |
| q3base | 09a30c1 | build base for the diff |
| q3m | 09a30c1, with `merge --no-commit --no-ff 490e504` | husky pre-commit run |
| q3d | 490e504, with `merge --no-commit d0fcd1d` | trial merge with fix/bba-fees-mahe-amrita |

I removed every junction with `cmd /c rmdir` before removing the worktrees.

## Verdict: FAIL

The scanner work passes completely:

- The R1 "off" exemption is closed. Against the old scanner there are 0 new exemptions, both on the injected inputs and across the whole corpus.
- The per-semester table equals the verify sheet row for row.
- The claimed 146 NON_FEE to MATCH moves reproduce exactly.

Two content findings block the merge:

- **N1.** Amrita BBA ₹1,41,000 is published as the "Total fee" and "Total programme fee". The sheet calls it Total Tuition Fee, with registration and exam fees charged on top.
- **N2.** The new "Highest" and "Higher" cells in amity-online-bba-fees-2026 rest on totals that are in neither lib/data.ts nor any verify sheet.

## Gates and build

- **Husky pre-commit** (q3m, batch staged over 09a30c1): all checks passed, exit 0.
  - Fee 205, em-dash 225 (48 files), blog-fees 1785, salary 1549, ext 47.
  - check-blog-updated-at: 75 posts, all dated. check-coupon-claims: OK. check-fee-provenance: OK.
- **Allowlist:** data/blog-fee-allowlist.json is byte-identical to 09a30c1. No entries were added.
- **Baseline:** perSlug sums to 1785, which equals totalUnverified. No slug rose against main's baseline (1861), and no slug was added or dropped.
- **Scope of edits:** 75 posts differ from main (17 in this range). Every one carries updatedAt 2026-11-28, and only content and faqs changed. The 8 frozen posts and data-science-salary-india-2026-scope-jobs are untouched.
- **Build:**
  - `npm run build` exits 0 at both 490e504 and 09a30c1.
  - Across 267 blog pages, title, meta description, canonical, og:title, og:description, h1 and robots are unchanged.
  - JSON-LD parses, with the same block count. Visible undefined, NaN and null did not rise. Em dashes did not rise. Tag balance is unchanged.
  - The only metadata change is dateModified, on 29 pages.
  - The new text shows in the built pages: amity-bba-fees "Highest", mahe-mba "Verified coupon for the MAHE Online MBA", nmims-vs-symbiosis "₹55,000", and Amrita ₹1,41,000.
- **Redirected post:** online-bba-fees-india-2026-compared is status `redirected`. It is not built and not scanned, so its Amrita edit never renders.

## Batch 25: rerun findings

### R1, the "off" exemption. Fixed

Every input below ran through four scanners: 341f986 (old), 10ffd3c (round 2), ce2b3b5 (round 3) and 490e504 (head). Classes are shown as old / r2 / r3 / head.

| Input | Old | R2 | R3 | Head |
|---|---|---|---|---|
| Wrong fee near save, scholarship, discount, cheaper or waiver | NON_FEE | MISMATCH | MISMATCH | MISMATCH |
| difference of, higher, more expensive, less, costlier | UNRESOLVED | UNRESOLVED | UNRESOLVED | UNRESOLVED |
| rebate of, reduced by, concession, next cell "Higher rate" | MISMATCH | MISMATCH | MISMATCH | MISMATCH |
| Next cell "Discount", previous cell "Save" | NON_FEE | MISMATCH | MISMATCH | MISMATCH |
| "Rs X off the online MBA" | MISMATCH | **NON_FEE** | MISMATCH | MISMATCH |
| "Rs 9,99,000 off-campus" | MISMATCH | **NON_FEE** | MISMATCH | MISMATCH |
| "Rs 9,99,000 off the bat" | MISMATCH | **NON_FEE** | MISMATCH | MISMATCH |
| "up to Rs 5,000 off NMIMS" | MISMATCH | **NON_FEE** | MISMATCH | MISMATCH |
| "Rs X off," / save Rs X / Rs X scholarship / gap of Rs X (discount amounts) | NON_FEE | NON_FEE | NON_FEE | NON_FEE |
| LPU Rs 50,000 per semester | NON_FEE | NON_FEE | NON_FEE | MISMATCH |
| LPU Rs 40,400 per semester | NON_FEE | NON_FEE | NON_FEE | MATCH |
| Galgotias per semester (no row) | NON_FEE | NON_FEE | NON_FEE | NON_FEE |

- **Injected inputs:** 0 inputs the old scanner checked are exempt at head.
- **Corpus, old scanner vs head scanner on the head tree:** 0 figures move into NON_FEE. The moves are NON_FEE to MATCH 381, UNRESOLVED to MATCH 38, NON_FEE to MISMATCH 14, UNRESOLVED to MISMATCH 7, NON_FEE to UNRESOLVED 5, UNRESOLVED to ORPHAN 1 and MISMATCH to MATCH 1.

### R2 and the rest of round 3

| Item | Status | Evidence |
|---|---|---|
| R2 | Fixed | Both comparisons are deleted: symbiosis-bba "MAHE costs more than Symbiosis" and amrita-bba "sits alongside MAHE ... and Symbiosis". |
| R3 | Fixed | lib/blog.ts has 0 "Edify" strings, the same as main. The batch merges into 09a30c1 with no conflicts. |
| Low: MUJ labels | Fixed | "Rs 1.84 lakh list, Rs 1.56 lakh after 15%" matches the lib/data.ts labels. |
| Low: Manipal sentence | Fixed | "MAHE charges more than MUJ and SMU" is backed by getExactFee: 2,92,000 vs 1,84,000 vs 1,20,000. |
| Low: FROZEN_8 | Fixed | I injected two faults. A slug added to both lists fails with "FREEZE_SLUGS ... / EXEMPTION_HOLD_SLUGS is not exactly the 8 frozen posts". A duplicated held slug fails too. The clean run is OK at 1785. |
| MAHE coupon callout | OK, not a fabrication | The callout now reads "Verified coupon for the MAHE Online MBA. The maximum amount unlocks every Tuesday and Saturday (IST)." Every part of it matches the site's own coupon data: lib/coupons.ts (MAHE2026-5K, Tue/Sat IST max window in getTodaysBonus) and lib/coupon-pages.ts (mahe page: "verified discount coupon", "Up to Rs 5,000 on Tue/Sat IST"). check-coupon-claims passes. The Rs 5,000 figure is gone from the blog. |

## Batch 26

### data/per-semester-fees.json. OK

- It has 41 rows. 40 are exactly section E array 1 of audits/verify/per-semester-fees-2026-11-27.md, matched on id, programme, amount, sourceUrl and checkedOn. No row is missing and none is extra.
- The 41st row is Shoolini Offer 1 at ₹33,575, the array 2 row 39. That figure is official: section A row 39 says "Shoolini publishes ₹32,500 and ₹33,575", and shoolini-university-online-2026-11-18.md row "Fee lines" agrees.
- Every amount equals its section A official figure. I checked rows 1, 2, 4, 6-12, 15-24, 26-29, 31 and 34-40.
- No array 2 conflict figure was taken. Rejected examples: LPU 50,000 and 25,000, NMIMS 49,000, Symbiosis BBA 35,000, and Sharda BBA 22,500 (row 25, CONFLICT).

### Scanner perSemClassify. OK

- **146 moves reproduced.** On the final content, the head scanner against the ce2b3b5 scanner gives exactly 146 NON_FEE to MATCH and nothing else. Totals: 1785 under both, because MATCH and NON_FEE both count as verified.
- **No wrong-row matches.** Only figures that are already NON_FEE can enter perSemClassify, so no figure moved from UNRESOLVED or MISMATCH to MATCH.
- **Attribution.** I checked all 146 against their context:
  - 74 by table first cell, 47 by same-sentence single university, 6 parenthetical and 6 by table or column header. All are correct.
  - 13 by blog-slug fallback. Every one sits in that university's own review or fake-or-legit post (IGNOU, LPU, DSU, UU, Shoolini, Amity, NMIMS, MUJ).
- **Ranges** match only when both ends are rows. Examples: CU ₹43,781 to ₹47,600, DSU ₹32,375 to ₹32,875, DPU ₹44,400 to ₹50,000, Shoolini ₹32,500 to ₹33,575.
- **Self-test:** passes. "Semester-wise" totals stay MISMATCH on the injected case, so they are still checked as totals.

### Section C and the exposed figures. OK

- UU Doon is now attributed as Uttaranchal University.
- ARKA JAIN is relinked, ₹25,000 (row 36) and ₹1,08,500.
- DPU Pune is relabelled, ₹44,400 to ₹50,000 (row 31).
- IGNOU ₹10,300/yr now points to the counsellor.
- LPU's ₹50,000 and ₹25,000 per-semester figures are deleted. The sheet's rows 3 and 5 say LPU never labels them as per semester.
- DSU becomes ₹32,375 to ₹32,875 (row 35).
- The derived figures are deleted: Symbiosis BBA ₹35,000 and ₹1,66,000, NMIMS ₹49,000 per semester, Navi Mumbai ₹42,500 and ₹43,750, and the unsourced exam-fee range.
- The lpu-bba FAQ deletions are fixed (the "saving ₹27,600 total" FAQ copy and the ₹4,600 per semester).

## Findings

### N1. HIGH (blocking). Amrita BBA ₹1,41,000 is labelled as the total fee

Section A row 29 and d0fcd1d's verify sheet record ₹1,41,000 as "Total Tuition Fee" for Indian students. Registration of Rs 700 (one-time) and an examination fee of Rs 2,750 per semester are charged on top. The batch 26 part B FIX-LOG also calls it "the Amrita BBA total".

amrita-online-bba-review-2026 publishes it as:

- the quick-facts row "Total fee: ₹1,41,000 across 6 semesters"
- the fee table row "Total programme fee | ₹1,41,000"
- "The Amrita Online BBA programme fee is ₹1,41,000"

The same table lists the registration and exam fees as "Confirm with counsellor", so the page contradicts itself.

**Fix.** Relabel it as tuition ("₹1,41,000 total tuition for Indian students; registration and exam fees are charged separately"). Never add the fees in. Correct the FIX-LOG wording too.

**Comparison claims affected.** "Peer Tier 1 Premium programmes list higher fees (MAHE ₹1,80,000, Symbiosis ₹1,65,000)" and "Amrita differentiates through a lower fee" compare Amrita's tuition with MAHE's figure, which d0fcd1d records as inclusive of all taxes. They are not like-for-like. The same post also lists NMIMS at ₹1,41,000, an equal figure, so "a lower fee" is not true against every peer the post names. Keep the reasons (NIRF, IoE, corridor) and drop the ordering, or state the tuition basis explicitly.

**How the fee gate classifies these figures:**
- On this branch: 3 Amrita ₹1,41,000 figures in amrita-online-bba-review are MISMATCH, 1 is UNRESOLVED and 7 are NON_FEE. All are counted in the 1785 baseline.
- After a trial merge with d0fcd1d: the same 3 become MATCH. The ₹1,41,000 figures in mahe-bba, nmims-bba and symbiosis-bba that the scanner attributes to Amrita also become MATCH. The gate passes at 1773 (see the merge check).
- So the gate will call the figure verified once the data lands. That makes the "Total fee" label the only thing left that is wrong.

### N2. MEDIUM (blocking). "Highest" and "Higher" in amity-online-bba-fees-2026 have no backing

The "Difference vs One-Time" column now reads:

| Plan | Total | Cell |
|---|---|---|
| One-time | ₹1,75,120 | Cheapest (baseline) |
| Annual (₹63,020/yr × 3) | ₹1,89,050 | Higher |
| 24-month EMI (₹7,877/mo × 24) | ₹1,89,050 | Higher |
| Semester-wise | ₹1,99,000 | Highest |

lib/data.ts holds only two Amity BBA modes: ₹1,75,120 one-time and ₹1,99,000 semester-wise. ₹1,89,050, ₹63,020 and ₹7,877 appear in no lib/data.ts record and no verify sheet. The gate reads all three as NON_FEE.

So the ordering, and the "Highest" superlative, rests on unbacked totals. The row arithmetic does not reproduce either: 63,020 × 3 = 1,89,060, and 7,877 × 24 = 1,89,048.

**Fix.** Delete the Annual and EMI rows' totals and multipliers (or point them to the counsellor), and drop "Higher" and "Highest". "Semester-wise costs more than one-time" is backed: ₹1,99,000 > ₹1,75,120.

### N3. MEDIUM (deferred, not blocking). Derived figures left in posts this batch edited

- amity-online-bba-fees-2026 prose still carries ₹23,880 and ₹13,930. Two of the ₹23,880 figures are MISMATCH. The FIX-LOG defers them to batch 27.
- lpu-online-bba-review-2026 still has ₹27,600 in 4 places: "(saving ₹27,600 across the programme)", "Net fee with 20% grant: ₹1,22,400 (saving ₹27,600)", "(saving ₹27,600)", and the table row "Total saving ₹27,600 (20% off)". It is our own subtraction (1,50,000 − 1,22,400), and 20% of ₹1,50,000 would be ₹30,000.
- nmims-online-bba-review-2026: "₹1,80,000 total across 6 semesters (₹30,000 per semester)". The ₹30,000 is NMIMS's BBA-with-Business-Analytics row (MATCH), but ₹1,80,000 is that row × 6, and the gate marks it MISMATCH. The FIX-LOG defers this to batch 27.

### N4. LOW

- **symbiosis-bba:** "A one-time non-refundable ₹1,000 registration fee is extra." The sheet's excludes list names a ₹1,000 application fee and a ₹5,000 registration fee. The ₹1,000 is the application fee.
- **mba-hr:** the prose has Bharati Vidyapeeth at ₹1,78,000, but the HR table row still says ₹1,76,000. lib/data.ts has 1,78,000 = 1,76,000 + 2,000 registration.
- **supply-chain:** "lowest semester fee ... UU ₹25,900 or SMU ₹30,000" is a pre-existing superlative. Only the attribution was edited here.

## Merge check

- **Into origin/main 09a30c1:** clean. The batch's merge base is main itself, and `merge --no-ff --no-commit` raises no conflicts. The full hook passes (see above).
- **With fix/bba-fees-mahe-amrita (d0fcd1d, not yet on main):** conflicts in audits/FIX-LOG.md (both prepend entries; keep both) and data/blog-fee-baseline.json. lib/data.ts auto-merges.
  - The baseline conflict is the totalUnverified line (1785 vs 1848) and five BBA slugs.
  - Resolution I tested: take the per-slug minimum of the two sides (total 1779). check-blog-fees then passes and lowers the baseline itself to 1773: amrita-bba 13 to 10, mahe-bba 6 to 5, symbiosis-bba 10 to 8.
  - Do not take either side's total by hand.

## Required before merge

1. N1: relabel Amrita ₹1,41,000 as tuition with fees on top, drop the tuition-vs-inclusive ordering, and correct the FIX-LOG wording.
2. N2: remove the unbacked Annual and EMI totals and the "Higher" and "Highest" cells.

N3 and N4 can ride to batch 27, as the FIX-LOG already plans for part of N3.
