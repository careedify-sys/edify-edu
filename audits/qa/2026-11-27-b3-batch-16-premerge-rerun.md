# QA re-test: B3 batch 16 round 2 (fix/b3-batch-16 at a764bab, on c9924b2, base ab8f561)

Checked 2026-11-27 by qa-checker. I did not do this work. No site edits, commits or pushes.

**VERDICT: PASS.** F1, F2 and F3 from audits/qa/2026-11-27-b3-batch-16-premerge.md are fixed. No regression found.

## Method

- **Fresh `next build`** of each commit in separate scratch worktrees:
  - base ab8f561: EXIT 0
  - a764bab: EXIT 0
  - Compared all 2,335 prerendered pages.
- **Head fields:** compared base against a764bab. To compare against c9924b2, I used the per-page head values I recorded from my own c9924b2 build in round 1. Pages absent from that record had c9924b2 head equal to base.
- **JSON:** diffed c9924b2..a764bab sentence by sentence (83 changed strings in 62 files).
- **Peer figures:** re-ran my own vs-block scan over all 431 page-content files.
- **getExactFee:** recomputed with `npx tsx` against lib/data.ts and lib/fees.ts.
- **Pre-commit:** ran `.husky/pre-commit` on a third worktree. Its index equals the a764bab tree; the working tree was unchanged after the run.

## Test 1: F1 peer quotes (PASS)

**The 6 misses now render with getExactFee and its label.** I checked the visible text in the a764bab build:

- **amity mba/information-technology-management**, vs LPU: "Fee is lower (Rs 2,00,000 list, Rs 1,46,240 to Rs 1,61,600 by payment plan)."
  - "lower" is true for the whole range: LPU's maximum of ₹2,00,000 is below Amity's minimum of ₹2,07,000 (₹2,07,000–₹2,25,000).
  - The MAHE line in the same block, "Fees are significantly higher (Rs 2,92,000)", matches MAHE getExactFee (₹2,92,000) and also holds.
- **chandigarh mba/marketing:**
  - vs LPU: "Fee is Rs 2,00,000 list, Rs 1,46,240 to Rs 1,61,600 by payment plan."
  - vs MUJ: "Fee is Rs 1,84,000 list, Rs 1,56,400 after 15% discount."
- **chandigarh mba/finance** and **chandigarh mba/banking-and-insurance**, vs NMIMS: "Fee is Rs 1,96,000 to Rs 2,20,000." The old "Fee is higher at" in banking-and-insurance became plain "Fee is".
- **sikkim-manipal mba/finance**, vs MUJ: "Fee is Rs 1,84,000 list, Rs 1,56,400 after 15% discount."

**Old figures in rendered text.** Across all university pages, the visible count is 0 for each of: "around Rs 1,20,000", "Rs 2,05,000-2,10,000", "Rs 1,60,000-1,99,000", "Fee is approximately Rs 1,75,000" and "Rs 2.5-3 lakh".

**My vs-block scan.** It covered every `**vs X:**` block for the 13 in-scope peers in all 431 files.

- No peer figure differs from getExactFee.
- The only non-matching hits are own-university figures:
  - JAIN quoting itself at "Rs 1,75,000-1,96,000" in 4 of its own vs-Amity blocks.
  - Uttaranchal's own "under Rs 1 lakh".
- This agrees with the engineer's claim that only 3 own-figure residuals are left. The engineer's three (BITS, CU, SRM Sikkim) are own figures in the host's own JSON, which my scan skips by design.

## Test 2: F2 comparatives (PASS)

**The 3 round-1 sentences are gone from the visible text:**

- BITS: "JAIN is NAAC A++ at nearly half the BITS Pilani WILP fee" now reads "JAIN is NAAC A++."
- Chitkara finance: "... offer comparable or better accreditation." The "at lower prices" clause is gone.
- Chitkara international finance: "... offers a direct ACCA pathway." The "at a lower fee" clause is gone.

**Round 2 edits.** I read all 83 changed strings (108 sentence edits), well above the 30 required. Every price comparative was deleted, never recomputed. The only new numbers in round 2 are getExactFee figures plus the "15%" label. Examples:

- "MUJ is NAAC A+ at slightly higher fees" became "MUJ is NAAC A+."
- "Sharda is significantly more expensive with NAAC A+" became "Sharda has NAAC A+ ...".
- "LPU is NAAC A++ at a lower fee" became "LPU is NAAC A++." (7 CU files)
- "Amity's higher fee tier" became "Amity Rs 2,07,000 to Rs 2,25,000".
- Amrita's "the premium is justified" became "relevant for candidates ...".
- DPU's "is the premium option" became "is the alternative". This reads a little flatly but is correct.
- Chitkara finance about: "premium programmes like Amity (Rs 2,07,000 to Rs 2,25,000)". MUJ was dropped there. Chitkara at ₹2,00,000 does sit between Sharda (₹1,50,000) and Amity (₹2,07,000 and up), so the sentence holds.
- BITS finance vs NMIMS: "At Rs 1,96,000 to Rs 2,20,000, it is cheaper." True for the whole range against ₹3,12,400.

The text still reads. Deleted bullets and sentences leave no empty bullets or dangling clauses, including the removed MGU honestVerdict line and the removed Chitkara HRM sentence.

**IGNOU.** "IGNOU at ₹66,000 costs less than one-fifth of SSODL's fee." became "IGNOU is ₹66,000." "less than one-fifth" now appears in 0 JSON files.

**CU "under Rs 1.2 lakh" consider items.**

- The 5 that named LPU "at a lower fee" were removed: digital-marketing, finance, international-business, marketing, banking-and-insurance. Each array went from 3 items to 2, and the other items are unchanged. The diff only looks like a rewrite because the array indices shifted.
- 12 unnamed variants remain on other CU specialisation pages ("a lower-fee NAAC A++ alternative"). Those hold: IGNOU at ₹66,000 and Andhra at ₹62,200 are both NAAC A++.

**"Strictly ordered" spot-check.** I sampled 16 rows of the 324 STRICT rows in .b8tmp/cmprel16-after.tsv and checked each against my own getExactFee full ranges. All 16 hold in the stated direction for the whole range:

| Comparison | Fees (₹) | Holds? |
|---|---|---|
| Alliance vs Amity | 1,74,000 < 2,07,000–2,25,000 | yes |
| Amity vs LPU | 1,46,240–2,00,000 < 2,07,000 | yes |
| Bharati vs Kurukshetra | 1,02,000 < 1,68,000–1,78,000 | yes |
| Bharati vs DPU | 1,89,400 > 1,78,000 | yes |
| BITS vs JAIN | 2,98,000 < 3,12,400 | yes |
| BITS vs DPU | 1,89,400 < 3,12,400 | yes |
| DSU vs Vignan | 90,000 < 1,30,000 | yes |
| Galgotias vs CU | 80,200 < 1,75,125–2,38,000 | yes |
| Integral vs BV | 1,68,000+ > 1,10,000 | yes |
| LPU vs Symbiosis | 2,00,000 < 3,15,000 | yes |
| NMIMS vs DPU | 1,89,400 < 1,96,000 | yes |
| NIU vs LPU | 1,18,000 < 1,46,240 | yes |
| SMU vs NMIMS | 1,20,000 < 1,96,000 | yes |
| Symbiosis vs Amity | 3,15,000 > 2,25,000 | yes |
| Vignan vs Sharda | 90,000 < 1,50,000 | yes |
| Vignan vs Galgotias | 80,200 < 90,000 | yes |

The 7 OVERLAP rows and 4 NONE rows make no price claim: they concern NIRF rank, NAAC grade, the CU "premium tier" name, or location.

## Test 3: F3 og:image and twitter:image (PASS)

**Restored on all spec pages.** In a764bab, bba/[spec] has og:image and twitter:image = https://edifyedu.in/og.png on 256 of 256 pages, and bca/[spec] on 142 of 142. That is the same URL these pages carried at base, inherited from the layout.

**New on hubs and MCA specs.** These had none at base and now carry the same layout /og.png:

| Pages | Count |
|---|---|
| bba hubs | 77 |
| bca hubs | 54 |
| mca hubs | 58 |
| mca/[spec] | 218 |

They also gain og:image:width 1200 and height 630.

Left as at base: 14 MCA hubs with their own static routes (10 with og.webp, 4 noindex with none) and the CU MBA page.

**No other head field changed against c9924b2.** The only fields that differ are og:image, og:image:width/height and twitter:image on the routes above. og:title, og:description, twitter:title, twitter:description, twitter:card, robots and canonical are all identical to c9924b2.

**Titles and descriptions:**

- `<title>` changes against base: 0.
- Meta description changes against base: only the same 15 404 shells as round 1.

## Test 4: regression (PASS)

- **"total fees ("** appears on 3 pages: andhra/mca, integral/mca and vignan/bba. All are noindex 404 shells, the same 3 as round 1.
- **Page list:** identical, 2,335 pages in each build.
- **Visible changes:** 102 pages against base.
- **JSON-LD:** 0 parse failures, and 0 pages with more unmirrored FAQ answers than base.
- **undefined/NaN:** 0 pages.
- **Tags:** 0 unbalanced tag kinds on the 102 changed pages.
- **CRLF:** 156 files changed ab8f561..a764bab. 0 have CR lines at either commit, and 0 trailing-newline changes.
- **JSON:** 0 round-trip mismatches across the 62 round-2 files. 431 files parse.
- **Structural changes:** 10, all CU consider arrays shortened by one LPU-named item.
- **Pre-commit** on the staged ab8f561..a764bab tree: EXIT 0 ("all checks passed").
  - check-fee-baseline: 205, unchanged.
  - check-blog-fees: 1950, unchanged.
  - check-protected-pages: OK (8 paths, 8 frozen posts).
  - verify-fees: 0 new mismatches.
  - check-data-slim-drift: OK.
  - typecheck:scripts: OK.
- **Typecheck:** the app type check passes as part of `next build`.
- **App diff c9924b2..a764bab:** adds `images` only, in all 6 child routes.

## Advisories (carried or new, not blocking)

- **A1.** The 3 404 shells above still print the MBA fee.
- **A2.** JAIN's own pages quote JAIN at "Rs 1,75,000-1,96,000" (getExactFee ₹1,60,000–₹2,98,000). Uttaranchal's own "under Rs 1 lakh" holds only for the one-time ₹99,600, not the ₹1,03,600 semester-wise net.
- **A3.** MUJ still appears as "~Rs 1,84,000" with no "list" label in Chitkara finance and international finance. The number matches the list fee.
- **A4.** The MGU hub honestVerdict has garbled NAAC grade text that predates this batch: "NAAC A++ (not A+/A++)" and "holds NAAC A++, the grade below A+".
- **A5.** The Christ MBA JSON, the unrendered hub orphans and the UPES WES verify row are carried from round 1.

## Cleanup

- Evidence is in C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa16/: pairsR2.txt, meta16r2.mjs, precommit2.log, dmg2.out and vsblock.mts.
- Worktrees q16base, q16r2 and q16gates have been removed. Their node_modules junctions were unlinked first.
- No servers were started.
