# QA pre-merge: B3 batch 23 (fix/b3-batch-23 @ 0ab2db3, base 7efc2cc)

Date: 2026-11-27. Checker: qa-checker (outsider; did not do the work).
Method:
- Fresh worktrees: b23base at 7efc2cc and b23br at 0ab2db3. Both ran `next build`, EXIT 0, 2,335 pages each.
- A third worktree, b23g, at 7efc2cc with 0ab2db3 staged, for the real pre-commit hook.
- Built-HTML diff of every page.
- Salary-gate injections in b23g, restored with `git checkout 0ab2db3 -- .` and confirmed by an empty `git diff`.
- NIRF figures checked against nirfindia.org 2025 (read through agent-reach).

## Verdict: FAIL

The edits themselves are clean and every gate passes. Two things block the merge:

- **F1.** The batch leaves two high-intent pages contradicting themselves in their FAQPage schema.
- **F2.** The Q29 question Rishi is asked to decide is misnumbered and understates what still prints ₹66,000.

F3 is a required FIX-LOG correction: about half of the blog-fees baseline drop is figures that went untracked, not figures that were deleted.

All three fixes are small.

---

## Blocking

### F1. Self-contradiction on the IGNOU MBA hub and on /compare/ignou-vs-lpu (FAQ JSON-LD inconsistent)

**/compare/ignou-vs-lpu**

- The pairs.ts edit to "What is the fee difference?" is dead code.
- app/compare/[pair]/page.tsx lines 117-120 replace any fee-question answer that holds a Rs figure with `feeAnswer`, which is built from getExactFee.
- So the rendered FAQ, both visible and in FAQPage JSON-LD, still reads "IGNOU: ₹66,000. LPU: ₹2,00,000 list; …". That is byte-identical to the base.
- The FAQ directly above it now says "IGNOU … charging Rs 16,000 per semester (Rs 18,000 for the 3rd) plus registration and development fees".
- One FAQPage block therefore carries both forms.
- The same page also still renders all of these:
  - the intro "IGNOU costs ₹66,000";
  - the table "Total Fees ₹66,000" and "Fee tiers ₹66,000";
  - the meta description.

**/universities/ignou-online/mba**

- The page-content FAQ, in JSON-LD, now says "IGNOU publishes the MBA fee per semester, not as a programme total". The tldr says "fees charged per semester".
- The same page still renders all of these from templates:
  - "Total Fees ₹66,000" in the hero;
  - "IGNOU online MBA total fee is ₹66,000 for the full two-year programme" in the overview, from mba-seo-overrides;
  - "₹66,000" on all 5 spec cards;
  - "Total Program Fee ₹66,000" on the fee card;
  - "MBA fees ₹66,000" in the peer table;
  - Course JSON-LD "fees ₹66,000";
  - the meta description "total fee ₹66,000".
- The page now states that no total exists and prints a total eight times.
- At base it was consistently ₹66,000: an own-sum, but not self-contradicting.

**Fix**, either of:

- (a) Drop the "not as a programme total" and "No total published" assertions on pages where a template still prints ₹66,000 (the hub FAQ answer). Keep the per-semester figures, which are consistent with the sum. Revert or annotate the dead pairs.ts FAQ2 edit.
- (b) Hold the IGNOU-hub and ignou-vs-lpu parts until Q29 is answered.

The blog posts, the spec JSON and the other edits do not need to change.

### F2. Q29 is misnumbered and its scope is wrong

- **Numbering.** "Q29" already exists in audits/QUESTIONS-FOR-RISHI.md ("Phase B Shoolini", line 41, present at both 7efc2cc and 0ab2db3). The last number on the branch is Q69, so this row should be **Q70**. The FIX-LOG references (item 1, "Left as is … Q29") need the same rename.
- **Scope, accurate part.** The 6 titles are correct: the IGNOU profile and 5 spec pages, each with title, og:title and twitter:title plus 3 descriptions, giving 6 head hits per page. So are the 2 /compare descriptions (ignou-vs-lpu, ignou-vs-amity, desc and og each). The frozen review and the mba-seo-overrides hub description and intro are correctly listed as separate. The hub title carries no ₹66,000; only its description does.
- **Scope, inaccurate part.** The row tells Rishi that ₹66,000 "stays in the navbar, the 6 titles and their metas". The built branch HTML shows getExactFee and lib/data.ts printing ₹66,000 for IGNOU visibly on 42 pages and in JSON-LD on 8. Main surfaces still showing ₹66,000:
  - **IGNOU profile:** "Total Fees ₹66,000", plus FAQ JSON-LD "The total fee … is ₹66,000 for the complete program" and "The MBA fee is ₹66,000", and Course JSON-LD.
  - **IGNOU MBA hub and 5 spec pages:**
    - "Total Fees ₹66,000" in the hero;
    - "Total Program Fee ₹66,000" on the fee card;
    - "MBA fees ₹66,000" in the peer table;
    - spec FAQ JSON-LD "Total fee is ₹66,000" on finance, marketing and operations.
  - **/compare/ignou-vs-lpu and /compare/ignou-vs-amity (body):** intro, table, fee tiers and the generated fee FAQ, visible and JSON-LD.
  - **/fees (2), /universities (1):** "MBA total fees ₹66,000".
  - **"Universities offering MBA" cards on other profiles:** andhra, dy-patil, srm-sikkim, ganpat, vignan and madras, as "Fees: ₹66,000".
  - **Peer MBA hub and spec comparison tables:** andhra-university-online/mba (and its 3 spec pages), srm-university-sikkim-online/mba (and its 7 spec pages), and university-of-madras-online (7 pages).
  - **Frozen posts and their related-post cards:** ignou-online-mba-review-2026 (12 visible, 8 JSON-LD), amity review (2), MUJ fake-or-legit (1), and the review title in related cards (mahe review, blog/page/11).
- **Rewrite needed.** The row must say that the SUMMED_TOTAL_PAIRS change also moves these visible and JSON-LD surfaces, not only titles. Otherwise Rishi decides on half the picture.
- I did not re-run the reverted SUMMED_TOTAL_PAIRS draft, so I cannot say which of these it moves. The engineer's measurement covered heads only.

## Required documentation fix (before merge)

### F3. The blog-fees drop 1945→1889 is not all genuine

I diffed every scan row, base against tip (scanAllPosts, multiset by slug and raw). Unverified raw rows went from 2184 to 2122 (−62):

| Reason | Rows |
|---|---|
| Deleted from the text | 30 |
| Became MATCH | 1 |
| **Reclassified NON_FEE** | **31** |

- The 31 were not checked. They became exempt because the new "per semester" wording now sits within 80 characters (NON_FEE_PATTERNS).
- About 28 of the 31 are other universities' figures that stay on the page, unverified and now untracked. Examples:
  - SMU ₹1.25 lakh and ₹1,20,000;
  - Symbiosis ₹3.15 lakh;
  - NMIMS ₹2.20 lakh;
  - LPU ₹1,30,600 ×3;
  - Amity ₹2,25,000 ×6;
  - Galgotias Rs 80,200;
  - Annamalai, Madras and Calicut ranges;
  - Rs 45 lakh ×2;
  - IGNOU BA Rs 9,600 ×2, B.Com Rs 14,400, BCA Rs 50,800.
- Per-post drops visible in data/blog-fee-baseline.json include:
  - fintech 10→5;
  - hospitality 10→3;
  - logistics 13→6;
  - real-estate 9→5;
  - chennai 17→11.
- None of the 119 new figure rows at the tip is an unverified figure exempted by a discount word. They are the added IGNOU per-semester figures, NON_FEE by "per semester".
- Lowering a baseline is not a weakening, and no gate was edited. But FIX-LOG item 1 says only "per-semester wording is NON_FEE", which reads as if the 56 were removed.
- **Required:** state the split (about 30 deleted, 1 MATCH, about 25-31 untracked by proximity) and add these figures to the batch24 NON_FEE scope (.b8tmp/batch24-discount-gap.md). They are the same class of gap as the discount-word gap in item 6.

## Passed

**Gates.** The real `.husky/pre-commit` ran on a staged 7efc2cc..0ab2db3 tree (36 files), with "all checks passed", EXIT 0. The worktree was clean afterwards apart from staged files.

| Gate | Result |
|---|---|
| verify-fees | 0 new mismatches |
| fee baseline | 205 |
| em-dash | 227 |
| blog-fees | 1889 |
| check-blog-salaries | self-test 23 cases; main 1904; ext 65 |
| check-blog-updated-at | 45 posts, all dated |
| protected-pages | 8 paths and 8 frozen posts OK |
| check-nirf-category | OK |
| check-hub-fee-text | 0 |
| page-content-json | 431 parse |
| page-content-facts | OK |

Every other gate printed OK.

**Diff scope.** 36 files, all in the item list: pairs.ts, lib/blog.ts, lib/data.ts (2 CU labels), coupon-pages, internal-links, specFaqs, quick-facts, 22 page-content JSONs, the salary script and baselines, sitemap-lastmod (vignan finance, whose JSON changed), FIX-LOG and QUESTIONS. Nothing in app/admin, app/api/cms or app/blog/write.

**Rendered output (whole-site built-HTML diff).**

- Same 2,335-page list. Visible changes on 98 pages: blog 42, compare 4, programs 6, universities 46. JSON-LD changes on 68.
- **No title changed** on any page.
- Meta changes only on /compare/chandigarh-vs-lpu, amity-vs-chandigarh and manipal-jaipur-vs-chandigarh, description and og:description each. Each change only inserts "up to" before "25% Early Bird", and the amounts are identical. The change is sourced in audits/verify/batch20-facts-2026-11-27.md row 3c (CU "Upto 25% / Upto 20%"). No CU spec or profile head changed.
- JSON-LD parses on every page (0 failures).
- 0 undefined or NaN.
- 0 new tag imbalances across 2,335 pages.
- No new unmirrored FAQ answers. The 181 "LD answer not visible" flags are the pre-existing accordion pattern; the count of affected pages is unchanged.
- CRLF: every changed file is uniformly CRLF at both commits, including the new ext baseline (15/15).

**IGNOU edits (item 1).**

- I read all 80-odd IGNOU hunks in lib/blog.ts word by word (far more than 40). I also read every page-content JSON hunk, the pairs, specFaqs and quick-facts hunks.
- The per-semester wording matches sheet D6 everywhere: Rs 16,000 for semesters 1, 2 and 4, Rs 18,000 for the 3rd, and "plus registration and development fees".
- **No derived total was introduced**; the only new totals are other universities' ("₹2.20 lakh in total at NMIMS").
- These derived comparisons are gone:
  - "68% cheaper";
  - "roughly 3x";
  - "more than 3x apart";
  - "one-fourth of NMIMS";
  - "lowest UGC-DEB cost";
  - the Chennai break-even line;
  - "one-third of LPU / Amity".
- The rewritten sentences read cleanly. Checked examples:
  - "IGNOU charges ₹16,000 per semester; Amity lists up to ₹2,25,000."
  - "fees up to ₹2,25,000";
  - "Lowest fees: IGNOU … or Galgotias".
- No orphan "X cheaper than IGNOU's" remains; I searched for it explicitly.
- Deletions leave no double spaces and no "IGNOUis" joins.
- The hub tldr ("fees charged per semester") and the FAQ deletion in ignou-online-admission-guide read cleanly. The hub FAQ contradiction is F1.

**NIRF (item 2), checked against nirfindia.org 2025 and lib/data.ts.** Supabase was not queried because there were no credentials in this sandbox; the official NIRF pages were used instead.

| Change | Check |
|---|---|
| JAIN University 73 → Management 73 (6 MBA rows, including dy-patil "NIRF Uni 73") and → University 62 (2 UG/BCA tables) | JAIN is University 62 and Management 73. Correct. |
| VIT University 11 → 14 (x2, distance-mba-chennai) | VIT is University 14. Correct. |
| Sri Ramachandra "Management 46" deleted | Not in the Management top 100 (University 60). Correct to delete. |
| GTU "Management 97" deleted | Not in the Management top 100. Correct to delete. |
| MAHE "Management category rank 39" → "University category rank 3" (6 profession posts) | MAHE is University 3; Management 39 is TAPMI. Correct. The hr-executives prose right after the table ("Several institutions with excellent university-category positions have no Management placement") now reads consistently. |
| BITS "#16 Overall 2025" → "#7 University 2025" (2 posts) | Correct: BITS is University 7. |

**Salary gate (item 4).**

- Code read in full. The `(?![A-Za-z])` whole-token rule for p.a. is applied in both counters. The ext counter runs on text with the SALARY_FIGURE matches blanked, so nothing is counted twice. countHeaderUnitCells counts bare cells only under LPA, salary or CTC headers.
- The self-test has 23 cases (10 + 10 + 3).
- **Independent injections** into online-mba-salary-india-2026, one at a time:

| Injected | Gate |
|---|---|
| main: "Rs 8 LPA" | FAIL, main 44→45 |
| ext: "lakh CTC" | FAIL, ext 0→1 |
| ext: "CTC of Rs 9 lakh" | FAIL, ext 0→1 |
| ext: "lakh/annum" | FAIL, ext 0→1 |
| ext: "lakh yearly" | FAIL, ext 0→1 |
| ext: "lacs p.a." | FAIL, ext 0→1 |
| ext: "21 L per year" | FAIL, ext 0→1 |
| ext: "Rs 6,00,000 per annum" | FAIL, ext 0→1 |
| ext: bare cell under an LPA header | FAIL, ext 0→1 |
| ext: bare cell under a "Median Salary" header | FAIL, ext 0→1 |
| "lakh p.a" (no final dot) | FAIL (still caught) |
| "lakh pan India" | PASS (correct) |
| "lakh/year" | PASS (the documented exclusion) |

- **1915→1904 is genuine, not reseeded.**
  - The base script on base content gives 1915.
  - The tip script on base content gives 1906: only online-mba-salary rose, 44→46, which is the 2 medians.
  - Listing what the old regex matched and the new one does not, on tip content, gives exactly 9: 6 fee lines with "2.25L Pa(n-India)" or "lakh Pa(n-India)", 2 NMIMS "1.96L pa(id)", and career-after-mba "₹25 lakh pa(ckage)".
  - The ext baseline is a newly created file, seeded once.
- **Dropping "lakh/year" is reasonable.** It does match fee lines. It is inconsistent, though: the main counter's "lakhs per year" and the ext counter's "L per year" already catch fees (the LPU "₹4.5L per year" residue is disclosed), and a ratchet false positive can only block, never pass. Advisory A5.

**online-mba-salary (item 5).** "Rs 12 LPA median in Mumbai versus Rs 8 LPA in Hyderabad" is gone. The sentence now reads "can pay differently in Mumbai and Hyderabad at the same experience level". The diff and the built page agree.

**FIX-LOG (item 6).**

- The discount-gap entry is accurate to my batch 21 rerun evidence: 496 exempt figures and the Rs 9,99,000 injection. The batch24 scope summary is internally consistent: 458 figures move, giving +258 across 73 posts.
- The batch 21 line correction to 2336 is present.
- Inaccuracies are listed under F3 and A1.

## Advisories (not blocking)

- **A1. BITS FIX-LOG reason is wrong.** "No Overall rank is held anywhere approved" is false: nirfindia.org 2025 lists BITS Pilani at Overall #16 (and University #7). The replacement text is still correct. In the "Left" bullet, bits-pilani-online-mba-review-2026 "NIRF #16 Overall" is accurate, not a defect; reword it so a later batch does not "fix" it.
- **A2. NIRF year.** The changed JAIN, VIT and MAHE cells carry no year (BITS says 2025). check-nirf-category does not require one. Suggest adding "2025" in a later pass.
- **A3. Dead JSON edits.**
  - ignou-online-mba-financial-management.json, -marketing-management.json and -operations-management.json are not rendered by /universities/ignou-online/mba/finance, marketing or operations. Only services-management.json matches its route, so the edits in those 3 files have no visible effect, and those pages show template text instead.
  - financial-management.json still says "SMU at ₹1,20,000 total is nearly double IGNOU's cost", although FIX-LOG says the "nearly double" claims were deleted.
- **A4. Leftovers and juxtapositions.**
  - is-distance-mba-worth-it still labels the IGNOU row "Budget-constrained credential seeker (under Rs 1 lakh)". The other "under Rs 1 lakh" labels were removed for implying the sum.
  - Mixed-unit ranges: "Rs 16,000 per semester (IGNOU) up to Rs 1.61L" (mba-fees guide) and "₹16,000 per semester (IGNOU) to ₹2,25,000 total". The units are explicit, so they are acceptable but awkward.
  - specFaqs sets "IGNOU (Rs 16,000 per semester)" beside "Galgotias (Rs 80,200)", a total.
- **A5. Salary-gate coverage.**
  - career-after-mba "₹25 lakh package" is a salary figure. It is now counted by neither counter, because "lakh package" is excluded by design. Only "lacs package" is in the ext counter.
  - "lakh/year" is now a known bypass for salaries.
  - Consider adding "lakh package" to the ext counter, accepting a few fee false positives as the brief accepted for "L per year".
- **A6. Pre-existing errors in a string this batch edited.** The IGNOU hub comparisons table gives NMIMS "NAAC A+" and "Management #15", but lib/data.ts has A++ and nirfMgt 24, and blog copy elsewhere says #24. The same table gives MUJ "Overall #58". Out of item scope; queue for the next NIRF/NAAC batch. The mahe-online-mba-review-2026 meta "NIRF Management rank 39" (frozen) is already disclosed.

## Re-run checklist

- **F1:** the IGNOU MBA hub FAQ JSON-LD and /compare/ignou-vs-lpu FAQ JSON-LD no longer contain both "per semester / no total" and "₹66,000", or the parts are held.
- **F2:** the row is renumbered Q70, with FIX-LOG references updated, and its scope lists the visible and JSON-LD surfaces above.
- **F3:** the FIX-LOG states the 30 / 1 / 31 split, and the untracked figures go into the batch24 scope.
- Gates unchanged or lower: fee 205, blog-fees ≤1889, em-dash 227, salary 1904, ext 65.
