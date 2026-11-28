# QA: MAHE and Amrita online BBA fee correction, pre-merge

- **Date run:** 2026-11-28
- **Commit:** d0fcd1d on fix/bba-fees-mahe-amrita. Parent: cf0c964, which is on main.
- **Checker:** qa-checker, as an outsider.
- **Worktrees:** fbase (cf0c964), ftip (d0fcd1d), and scratch merges fb25/fb25o. All are mine. I did not touch the engineer's worktree.

## Verdict: FAIL

The data is right, the head freeze holds and the gates pass. Two rendered fee sentences fail item 2, "values shown with their labels".

## Blockers

### F1. Amrita's tuition-only ₹1,41,000 is printed as a total fee

The sheet says ₹1,41,000 is "Total Tuition Fee". It is "tuition only", and "No all-in figure is printed". Registration (₹700) and the exam fee (₹2,750 a semester) are charged on top.

The hero keeps the label: "₹1,41,000 / total tuition, Indian students". Four other places drop it:

| Place | What it prints |
|---|---|
| BBA hub FAQ, visible and in FAQPage JSON-LD | "Total programme fee is ₹1,41,000 across 3 Years." |
| The 4 BBA spec-page FAQs, visible and in JSON-LD | "Total fee is ₹1,41,000." |
| FeeBreakdown | Heads the figure "Total Program Fee ₹1,41,000", although its own rows below list the two extras as "charged separately" |
| Course Offer JSON-LD on the hub and 4 spec pages | `price: 141000`, with no tuition qualifier |

A reader is told a total the university does not publish.

**Fix:** carry `listLabel` into the FAQ and FeeBreakdown, for example "Tuition is ₹1,41,000 (Indian students); registration and exam fees are charged separately." Also add a description to the Offer.

### F2. MAHE's FAQ sentence is garbled and contradicts the sheet on duration

The BBA hub FAQ, in both the visible text and the JSON-LD, reads:

> "Total programme fee is ₹1,80,000 BBA, 6 semesters, inclusive of all taxes; ₹2,40,000 BBA (Honours), 8 semesters across 3 Years (Hons) / 4 Years (Hons with Research)."

There are two problems:
- The labelled fee string is spliced into a template, so the sentence does not read.
- The unchanged `pd.duration` labels the 3-year route "Hons". The sheet's own reading is 6 semesters for the BBA and 8 semesters for the BBA (Honours).

The spec-page FAQ ("Total fee is ₹1,80,000 BBA, 6 semesters, ...") and the hub Course JSON-LD description ("4+ specialisations, fees ₹1,80,000 BBA, 6 semesters, ...") have the same splice.

**Fix:**
- Render the two routes as their own clauses: "₹1,80,000 for the 6-semester BBA (inclusive of all taxes) or ₹2,40,000 for the 8-semester BBA (Honours)".
- Correct `programDetails.BBA.duration` to the portal's wording, or leave it out of this sentence.

## Checks that pass

1. **Data vs sheet: PASS.**
   - MAHE: `list 180000`, modes 180000 ("6 semesters, inclusive of all taxes") and 240000 ("BBA (Honours), 8 semesters"), `perSemester 30000`. The application fee is ₹1,500, one-time and non-refundable, and is kept as an extra.
   - ₹1,71,000 is deliberately left out.
   - Amrita: `list 141000`, labelled "total tuition, Indian students", with `perSemester 23500`. The extras are registration ₹700 one-time and exam ₹2,750 per semester. The foreign-national ₹1,68,000 is not used.
   - `programDetails.BBA.fees` is now '₹1,80,000 – ₹2,40,000' for MAHE and '₹1,41,000' for Amrita.
   - Nothing is summed. Every figure is a sheet row: MAHE rows 1, 2, 4, 6, 7 and 8; Amrita rows 12, 13, 17 and 18.
2. **Live spot-check, official portals only, no bypass: PASS.**
   - Amrita, read with WebFetch on onlineamrita.com/program/bachelor-of-business-administration/:
     - "Rs. 1,41,000" Total Tuition Fee
     - "Rs. 23,500" Semester Fee
     - "Registration fee - Rs. 700"
     - "Examination Fee - Rs.2750 Per Semester"
     - Foreign nationals "Rs. 1,68,000"
   - MAHE, read with agent-reach on onlinemanipal.com/online-bba-honors-mahe:
     - "Course Fee INR 1,80,000"
     - "BBA (Honours):INR 2,40,000"
     - "INR 30,000 per semester"
     - "~~ INR 1,80,000 ~~ INR 1,71,000"
     - "non-refundable application fee of INR 1500"
   - Both match the sheet.
3. **getExactFee: PASS. FeeBreakdown extras: PASS.**
   - getExactFee(u,'BBA') was `none` for both at cf0c964. It is now `labelled` for both.
   - formatExactFee prints MAHE's two labelled routes and Amrita's "₹1,41,000" with the detail "total tuition, Indian students".
   - MBA results are unchanged.
   - FeeBreakdown prints "₹700 one-time, charged separately", "₹2,750 per semester, charged separately" and "₹1,500 one-time, non-refundable, charged separately".
   - MAHE's "EMI available through lending partners" and "Study Material / Included (digital)" are gone from all 7 MAHE pages that had them. Count: 7 before, 0 after.
4. **Title freeze: PASS. Sound, not a hack.**
   - On all 7 BBA hub and spec pages, the `<title>`, all 26 `<meta>` tags and the canonical are byte-identical between cf0c964 and d0fcd1d. The `.meta` files are identical too.
   - Across the whole build: 0 heads changed and 0 titles or descriptions changed.
   - Why it is sound: it is a named, documented set of 2 ids, read in exactly the 2 BBA `generateMetadata` functions. Removing an id unfreezes the page. It enforces Rishi's no-title-change rule while the body shows the right fee. Main now carries Q82 for this decision.
   - Advisory: nothing removes the ids automatically once Q82 is answered.
   - Advisory: the freeze covers head tags only. JSON-LD Course descriptions in the body now include the fee (see F2).
5. **check-blog-fees: PASS. The lowered count hides nothing.**
   - Across all 7,224 blog fee rows, 13 changed class, all of them MISMATCH to MATCH. Nothing moved to MISMATCH or UNRESOLVED.
   - The 13 rows are the blogs' own ₹1,41,000 (Amrita) and ₹2,40,000 / ₹1,80,000-2,40,000 (MAHE). Those blogs were already right and the data was wrong.

   | Slug | Figures that became MATCH |
   |---|---|
   | amrita-online-bba-review-2026 | 4 × ₹1,41,000 |
   | mahe-online-bba-review-2026 | 3 × ₹2,40,000, 1 × ₹1,41,000, 1 × ₹1,80,000-2,40,000 |
   | best-online-bba-colleges-india-2026 | 1 × ₹2,40,000 |
   | nmims-online-bba-review-2026 | 1 × ₹1,41,000 |
   | symbiosis-online-bba-review-2026 | 1 × ₹2,40,000, 1 × ₹1,41,000 |

   - **The old ₹1,65,000 figures.** Every ₹1,65,000 left in the BBA posts is attributed to Symbiosis SSODL's BBA, or is NON_FEE or UNRESOLVED in a Symbiosis context. None is an Amrita BBA figure. Amrita's ₹1,65,000 in the BCA posts is the BCA fee and stays MATCH.
   - **Does the gate fail on mismatches?** No. The gate does not fail on MISMATCH as such. It is a per-slug count ratchet in which MISMATCH, SUPPRESSED, ORPHAN and UNRESOLVED all count as unverified. So a MATCH-to-MISMATCH move would not lower the count, and none happened.
   - **Advisory:** the Amrita and MAHE blog tables call ₹1,41,000 "Total Fee". That is the same label problem as F1, in grandfathered copy.
6. **Full husky pre-commit: PASS, exit 0.** I ran it with d0fcd1d staged on cf0c964:
   - em-dash 225, unchanged from main's current baseline
   - fee 205
   - blog-fees 1848, unchanged
   - salary 1549 and ext 47, both equal to baseline
   - verify-fees: 0 new
   - hub-fee-text: 0, self-test 16/16
   - coupon-claims: OK
   - result: "all checks passed"
7. **Build diff cf0c964 to d0fcd1d: PASS.**
   - Both builds exit 0, with the same 2,335 pages.
   - Every page changed in the hidden RSC fee map. 63 pages changed visibly:
     - the two universities' pages;
     - peer comparison cells and "Fee not published" cards on 8 other universities and /programs;
     - the auto-sorted fee table in online-bba-fees-india-2026, where Amrita and MAHE now show their new figures.
   - JSON-LD changed on 9 pages. Parse errors: 0. undefined/NaN: 0. Tag balance changes: 0.
   - **Advisory:** Amrita's BBA Offer nodes now carry the coupon description "AMR2026-5K, up to Rs 5,000 off". The coupon gate passes. The coupon was already attached to Amrita and appears now only because a BBA price exists.

## Merge checks (not merged)

**Into origin/main.** Main is now 09a30c1, one commit past 8502836; it adds Q82.
- `git merge-tree` reports a conflict in **audits/FIX-LOG.md** only.
- lib/data.ts merges automatically. Main changed it by 98 lines since cf0c964.
- components/FeeBreakdown.tsx is untouched on main, so it merges cleanly.

**With fix/b3-batch-25 (ce2b3b5).**
- **data/blog-fee-baseline.json** conflicts, and so does FIX-LOG. The branch's total is 1791, not 1792.
- I merged d0fcd1d into batch 25 in scratch. The real counts on the merged tree are total 1779: amrita 14, best 31, mahe 5, nmims 17, symbiosis 8.
- Every merged per-slug count is at or below both sides' baselines. Those are batch 25: 17 / 32 / 10 / 18 / 10 (1791), and this branch: 15 / 31 / 6 / 17 / 10 (1848).
- So keeping either side's file and running the hook works: it auto-lowers to 1779. Do not hand-edit the numbers.
