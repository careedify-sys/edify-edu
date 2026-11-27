# QA pre-merge: B3 batch 25 (scanner v4, discount-word narrowing)

Date: 2026-11-28
Branch: fix/b3-batch-25. Range reviewed: 341f986..c04d4e4 (0df6c37 work, c04d4e4 baseline header).
Method: separate worktrees at c04d4e4 and 341f986, with node_modules junctioned and audit-data copied in. I did not edit the author's clone.

## Verdict: FAIL

The content edits are mostly accurate, and every gate passes. Two findings block the merge:

- **F1.** The v4 scanner is not a pure narrowing. It adds new exemptions that the old scanner did not have, and I proved that with injected defects.
- **F2.** One post was reworded only so that its figures hit an exemption keyword. That is a reclassification trick.

## What passed

| Check | Result |
|---|---|
| Files touched | 5 files: audits/FIX-LOG.md, data/blog-fee-baseline.json, lib/blog.ts, scripts/check-blog-fees.mjs, scripts/lib/blog-fee-scan.mjs. No allowlist change. |
| Posts changed | 64 posts, all with updatedAt 2026-11-28. Fields changed: content, faqs and updatedAt only. No title, seoTitle, h1Title, metaDescription, slug, status or publishedAt change. |
| Frozen posts | None of the 8 frozen posts changed, and data-science-salary-india-2026-scope-jobs did not change. The hold list equals FREEZE_SLUGS exactly. |
| Full husky pre-commit | Run over the staged batch diff (soft reset to 341f986): every check passed. Fee 205, em-dash 227, blog-fees 1800, salary 1549, ext 47. |
| Baseline | No per-slug value went up. The perSlug sum is 1800, which equals totalUnverified. |
| Counts reproduced | Base tree: old scanner 1861, new scanner 2017. Head tree: old scanner 1843, new scanner 1800. These match the FIX-LOG. |
| Move table | NON_FEE to MATCH 236, UNRESOLVED to MATCH 38, NON_FEE to MISMATCH 15, NON_FEE to UNRESOLVED 5, MISMATCH to NON_FEE 3, UNRESOLVED to NON_FEE 8. The FIX-LOG also leaves out 3 moves: UNRESOLVED to MISMATCH 7, UNRESOLVED to ORPHAN 1 and MISMATCH to MATCH 1. |
| Hold expiry | Clock faked to 2026-12-05 12:00: OK. Clock faked to 2026-12-06 00:30: exit 1, listing all 8 posts. |
| Self-test | 6 discount cases and 2 feePlans cases are present and pass. The Shoolini list fee of Rs 2,00,000 is MATCH and Rs 2,45,000 is MISMATCH. |
| npm run build | Exit 0 at both c04d4e4 and 341f986. |
| Built HTML and RSC (267 blog pages) | title, meta description, canonical, og:title, og:description, h1 and robots are unchanged on every page. Every JSON-LD block parses, and the block count is unchanged. Visible undefined, NaN and null did not rise. Em dashes did not rise. Tag balance is unchanged. The only metadata change is dateModified on 58 pages, set to 2026-11-28. |
| Rendered output | The change shows in the built pages. Example: online-mba-fintech HTML now has "Chandigarh University (₹1,75,125 after up to 25% Early Bird)", and amity-online-bba-fees now has "Sharda (₹1,35,000)". |

## Injected-defect proof (old scanner vs new scanner)

Each test post was pushed into BLOG_POSTS and scanned by both the 341f986 scanner and the c04d4e4 scanner.

| Injected text | Old | New |
|---|---|---|
| NMIMS online MBA costs Rs 9,50,000, so you save time. | NON_FEE | MISMATCH |
| The Sharda online MBA fee is Rs 2,95,000 after the scholarship. | NON_FEE | MISMATCH |
| MUJ online MBA costs Rs 9,99,000 after the 15% discount. | NON_FEE | MISMATCH |
| NMIMS online MBA has a fee difference of Rs 1,17,000 over the MUJ online MBA. | UNRESOLVED | **NON_FEE** |
| NMIMS online MBA is Rs 1,89,000 higher than the MUJ online MBA. | UNRESOLVED | **NON_FEE** |
| NMIMS online MBA is Rs 64,000 more expensive than the MUJ online MBA. | UNRESOLVED | **NON_FEE** |
| MUJ online BBA costs Rs 36,000 less than the NMIMS online BBA. | UNRESOLVED | **NON_FEE** |
| Table cell `<td>Total</td><td>Rs 9,99,000</td><td>Higher rate</td>` | MISMATCH | **NON_FEE** |
| NMIMS online MBA: Rs 9,99,000 concession-free for all. | MISMATCH | **NON_FEE** |

The first 3 rows show the narrowing works as claimed. The last 6 rows show a new blind spot.

## Findings

### F1. HIGH (blocking). Scanner v4 widens the exemption for gap phrasings and across table cells

AMOUNT_BEFORE_RE and AMOUNT_AFTER_RE exempt words that were never in the old NON_FEE list:

- difference of/is
- higher, less, more expensive, costlier
- concession, rebate
- reduced by, reduction of, knocks off, takes off

AMOUNT_AFTER_RE runs on tag-stripped text, so a word in the next table cell also exempts a figure.

Effect on the live corpus: 11 figures move into NON_FEE (8 from UNRESOLVED, 3 from MISMATCH) and drop out of the 1800 count. Several of them are exactly the derived gaps this batch says it deletes:

- online-manipal-mba-review-2026: "fee difference of Rs 1.17 lakh over MUJ and Rs 1.82 lakh over SMU"
- dy-patil-online-mba-review: "Rs 1.89 lakh higher than JAIN (Rs 1.50 lakh) plus MUJ". This is also garbled.
- amity-online-bba-review-2026: "₹31,120 less". This post was edited by this batch.
- muj-online-bba-review-2026: "₹36,000 less than MAHE". This post was edited by this batch, and MAHE BBA has no getExactFee value.
- online-bba-programs-india-2026: "a difference of ₹23,880". This post was edited by this batch.
- du-online-mba-delhi-university-2026: a programme total, "Rs 20,000-25,000", is exempted because the next cell reads "Higher rate".

**Fix.** A figure may count as a discount amount only when the old rule would also have exempted it. The rule is: isDiscountAmount(...) AND one of the 10 DISCOUNT_SOURCES matches tightCtx. Also refuse an AFTER match when a `</td>` or `</th>` lies between the figure and the word. Then add the 6 bold rows above as self-test cases.

Expect these slugs to rise above their new baseline. Delete the derived gaps rather than restoring the baseline:

- online-manipal-mba-review-2026
- du-online-mba-delhi-university-2026
- dy-patil-online-mba-review
- amity-online-bba-review-2026
- online-bba-programs-india-2026
- muj-online-bba-review-2026
- mahe-online-mba-review-2026
- integral-university-online-review
- why-online-mba-fees-differ-india-2026
- is-dy-patil-online-fake-or-legit-2026 (2 figures)

### F2. HIGH (blocking). bharati-vidyapeeth-online-mba-review was reworded to hit an exemption keyword

The batch changes "Backlog exams cost Rs 400 per subject" to "The backlog exam fee is Rs 400 per subject", and changes the list item the same way. No fact changes. The new wording makes the `exam\s*fee` proximity pattern fire.

Under the same v4 scanner, the post goes from 12 unverified to 9:

- ₹400 twice moves from MISMATCH to NON_FEE. The backlog fee has no row in lib/data.ts.
- The debunked listing-site figure Rs 1,60,000 moves from MISMATCH to NON_FEE.
- The correct Rs 1,68,000 moves from MATCH to NON_FEE.

Without the reword, the slug would be 12 against a baseline of 10, and the gate would fail. This is the only post where NON_FEE rose under a fixed scanner, so the trick is isolated.

**Fix.** Revert the two wording changes and handle the figures on their merits. Rs 1,68,000 is real: it is in feePlans as the one-time payment. The ₹400 needs a source or the counsellor line.

### F3. MEDIUM. Wrong or contradictory fees left in posts this batch edited

- **mba-pharmaceutical-management-online-india-2026.** The batch edited the H3 and the next sentence but kept "Shoolini's standard fee is ₹1,50,000". lib/data.ts feePlans gives a list fee of Rs 2,00,000, and the batch's own new FAQ in the same post says "₹2,00,000 list fee". The ₹1,50,000 counts as MATCH only because it falls inside Shoolini's 1,30,000-1,58,000 span. online-mba-business-data-analytics-india-2026 has the same "standard ₹1,50,000 fee" in an FAQ.
- **mba-hr-management-online-india-2026.** The batch changed one BVP figure to ₹1,78,000, but "BVP (₹1,60,000)" is still in the post twice (UNRESOLVED).
- **fintech, hospitality and real-estate posts.** The prose now says CU ₹1,75,125, but each post's comparison table still shows "Chandigarh University ₹1,16,250 net" plus a derived "₹29,063 net" per semester. online-mba-logistics-management-india-2026 has the same row.
- **jain-vs-amity-online-mba-2026 (edited).** The batch kept "standard specialisations ... JAIN (₹1.96L)". lib/data.ts has JAIN's Finance, Marketing, HR and General tracks at ₹1,60,000; ₹1,96,000 is the Analytics, AI and Digital Marketing tier. The ₹1.96L is also in the metaDescription, so it is for Rishi; do not edit it here. The post also still shows:
  - ₹8,500, which adds registration and exam fees together
  - "Effective Total" ₹2,04,500 and ₹1,83,500, which add fee parts together. Both count as MATCH only because they fall inside JAIN's range.
  - "Effective gap: about ₹20,500" and "₹29,000 lower"

### F4. MEDIUM. Derived figures still published in edited posts, despite the FIX-LOG saying they were deleted

- **lpu-online-bba-review-2026:** "the LPU 20 percent grant saves ₹27,600". That is 1,50,000 minus 1,22,400.
- **muj-online-bba-review-2026:** "LPU at net ₹1,22,400 saves ₹21,600 versus MUJ".
- **symbiosis-online-bba-review-2026:** "MAHE at ₹1,80,000 commands ₹15,000 premium over Symbiosis". The FIX-LOG says "commands Rs X premium" was removed.
- **online-mba-aviation-management-india-2026:** "Per-semester fee is ₹43,781 across 4 semesters".
- **mba-hr-management-online-india-2026:** a ₹43,781 table column. The FIX-LOG says the CU per-semester splits were deleted, but only the is-chandigarh-university-online-fake-or-legit-2026 copy went.

### F5. MEDIUM. Replacement sentences keep comparisons that lib/data.ts does not support

MAHE BBA and Amrita BBA have no getExactFee value. Amrita BBA's display fee is ₹1,65,000, the same as Symbiosis BBA. The new sentences still say Amrita costs less than Symbiosis:

- amrita-online-bba-review-2026: "Amrita Online BBA costs less than MAHE Online BBA and Symbiosis SSODL (₹1,65,000)". It also says "below MAHE and Symbiosis".
- symbiosis-online-bba-review-2026: "Amrita also costs less than Symbiosis".

The numbers were removed, but the unbacked claim survives and the gate can no longer see it. Separately, the pharma H3 "Shoolini University Online: lowest fee after scholarship" is a new fee superlative.

### F6. LOW. MATCH is judged against getDisplayFee spans, not getExactFee

I checked the 236 NON_FEE to MATCH moves against getExactFee, labelled modes and feePlans:

- 213 are an exact published value.
- 6 fall only inside a span. These are the Shoolini ₹1,50,000 twice and the JAIN sums ₹2,04,500 and ₹1,83,500 (all wrong, see F3), plus CU 2.34L/2.38L and LPU BCA 1.22L.
- 17 are not exact-backed. These include 8 figures for universities with no getExactFee at all (SRM Sikkim ₹1,10,000 three times, DBAOU, Amrita MCA, Hindustan, MSU, MGR), plus Integral ₹76,800, which is a derived 12,800 x 6 total that matches 75,300 only within tolerance.

These are not reclassification tricks, but a MATCH is not proof that a fee is right.

### F7. LOW. The hold can be extended without anything failing

The hold works: it equals FREEZE_SLUGS, and it fails from 6 Dec. But no check stops someone from moving EXEMPTION_HOLD_UNTIL forward or adding a slug.

**Fix.** Add an assertion that EXEMPTION_HOLD_UNTIL equals FREEZE_UNTIL from check-protected-pages, that EXEMPTION_HOLD_SLUGS is a subset of FREEZE_SLUGS, and that the date is no later than 2026-12-05.

### F8. LOW. FIX-LOG accuracy

- It names b34594c as the base; the real base is 341f986 (round 4).
- Its move table leaves out 9 moves (see "What passed").
- 1-year-mba-india-executive-mba-2026 still carries "IIM Executive programmes (Rs 25 lakh-plus)", an unbacked campus figure, next to a deletion.

## Fee sample checked against lib/data.ts getExactFee (30 figures)

All of these are correct:

| University | Figures |
|---|---|
| MUJ | MBA list Rs 1,84,000 and Rs 1.84L; net ₹1,56,400; BBA ₹1,44,000 |
| SMU | MBA Rs 1,20,000 |
| SRMIST | MBA ₹1,50,000 to ₹1,89,000 |
| Amrita | MBA ₹1,76,000 to ₹2,60,000 |
| Symbiosis | MBA Rs 3.15 lakh and ₹3,15,000 (feePlans row, ₹55,000 concession); MBA ₹3,70,000; BBA ₹1,65,000 |
| Uttaranchal | MBA Rs 1,03,600 and Rs 99,600 |
| Galgotias | MBA Rs 80,200 |
| Shoolini | MBA list Rs 2,00,000; ₹1,30,000; ₹1,58,000; Rs 23,700 (feePlans rows) |
| Sharda | BBA ₹1,35,000; MBA ₹1,50,000 |
| Chandigarh | BBA ₹1,31,250; MBA ₹1,75,125, ₹2,33,500, ₹1,90,400, Rs 2,38,000 |
| NMIMS | BBA ₹1,41,000; MBA one-time ₹1,96,000 |
| JAIN | BBA ₹1,35,000 |
| Amity | BBA one-time ₹1,75,120 |
| Bharati Vidyapeeth | MBA ₹1,78,000 |
| Alliance | MBA ₹1,74,000 |
| UPES | MBA ₹1,75,000 to ₹2,20,000 |
| Chitkara | MBA ₹2,00,000 |
| MAHE | MBA ₹2,92,000 |
| DPU | MBA ₹1,89,400 |
| BITS | MBA ₹3.12 lakh (3,12,400 rounded) |
| LPU | BBA ₹1,50,000 list and ₹1,22,400 net |
| NIU | MBA ₹1,18,000 |
| DSU | MBA ₹1,30,000 |

The wrong figures are listed under F3 and F4. None of the figures the batch changed itself was wrong. The wrong ones are figures left beside the edits.

## Merge forecast (not merged)

fix/b3-batch-23r3 (67ab914) is already on origin/main (7a10026), and batch 24 is merged too (0746967). The merge base of c04d4e4 with origin/main is 341f986.

`git merge-tree` against origin/main and against 67ab914 gives the same result:

- **Conflict in audits/FIX-LOG.md only.** Both branches add entries at the top. Keep both.
- **lib/blog.ts auto-merges cleanly.**

I made a trial merge onto origin/main in a throwaway worktree, kept both FIX-LOG entries, and ran these gates on the result: check-blog-fees (1800, unchanged), check-blog-updated-at (64 posts, all dated), check-protected-pages, check-em-dash, check-blog-salaries (1549 / 47) and check-duplicate-slugs. All passed. The batch did not change data/blog-fee-baseline.json on main's side, so the ratchet has no conflict.

## Required before re-QA

1. F1: restrict the discount-amount labels to the old 10 words and stop cross-cell AFTER matches. Add the 6 injected cases to the self-test. Delete the derived gaps that this exposes, and do not raise the baseline.
2. F2: revert the BVP wording change.
3. F3 and F4: fix the contradictions and leftover derived figures in the posts this batch edited:
   - pharma and analytics (Shoolini ₹1,50,000)
   - mba-hr (BVP ₹1,60,000)
   - the fintech, hospitality and real-estate tables (CU ₹1,16,250 and ₹29,063)
   - lpu-bba (₹27,600)
   - muj-bba (₹21,600)
   - symbiosis-bba (₹15,000 premium)
   - aviation (₹43,781)
4. F5: drop the Amrita-cheaper-than-Symbiosis claims and the "lowest fee" H3.
