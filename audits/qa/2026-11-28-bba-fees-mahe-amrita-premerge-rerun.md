# QA: MAHE and Amrita BBA fees round 2, pre-merge rerun

- **Date run:** 2026-11-28
- **Tip:** dbd7886 on fix/bba-fees-mahe-amrita. It adds three commits on top of d0fcd1d:
  - d11f395: round 2 fixes
  - 8bb7370: merge of main 09a30c1
  - dbd7886: hero tile wording
- **Checker:** qa-checker, as an outsider.
- **Worktrees:** qf2base (main 09a30c1, which the branch merged), qf2tip (dbd7886) and qf2b26 (scratch merge). All are mine. I did not touch the engineer's worktree.

## Verdict: PASS

Round 1's F1 and F2 are fixed in every place they appeared. There are no blockers. The notes at the end are out of scope or pre-existing.

## Findings

### 1. Amrita ₹1,41,000: PASS

Every place on the hub and the 4 spec pages keeps the tuition label, names the extras as "charged separately", and never says "total fee":

| Place | Text after round 2 |
|---|---|
| Hub FAQ (visible and FAQPage JSON-LD) | "The fee is ₹1,41,000 (total tuition, Indian students) across 3 Years. Registration fee and examination fee are charged separately." |
| Spec FAQs (4 pages) | The same, without the duration. The question no longer says "total". |
| FeeBreakdown | "Programme fee: ₹1,41,000 total tuition, Indian students". It is followed by "₹700 one-time, charged separately" and "₹2,750 per semester, charged separately". |
| Hero tile | "Programme fee / ₹1,41,000 / total tuition, Indian students" |
| Offer schema (2 per hub, 1 per spec) | `price 141000` with description "₹1,41,000 total tuition, Indian students; registration fee and examination fee charged separately". The coupon line comes after it. |
| Course description | "fees ₹1,41,000 total tuition, Indian students; ..." |

Nothing is summed. The extras are named by label only.

**Detector.** I ran the engineer's detector (scratchpad/assert141.cjs) on the full tip build: 2,335 files and 179 occurrences.
- Amrita pages: 0 flags.
- Amrita Offers: 6, of which 0 are bad.
- The 21 flags elsewhere are all out of scope (see the notes).

**Own injection.** I copied the built Amrita hub into a scratch root (qaf2/inj1, made with qaf2/inject.cjs) and made two changes:
- I reverted the FAQ to "Total programme fee is ₹1,41,000 across 3 Years", which changed 3 occurrences.
- I replaced the Offer label with "all-in", which changed 2 occurrences.

The detector reported flagged 2 (one in the JSON-LD, one in the visible text) and badOffers 2. It catches both defects.

### 2. MAHE: PASS

The text matches the sheet:

| Sheet | Site |
|---|---|
| Row 1: ₹1,80,000, 6 semesters, "Inclusive of all taxes" | "₹1,80,000 (BBA, 6 semesters, inclusive of all taxes)" |
| Row 4: ₹2,40,000, Honours, 8 semesters, 4 years | "₹2,40,000 (BBA Honours, 8 semesters)". It makes no tax claim, and the sheet records none for this route. |
| Row 6: ₹30,000 a semester | Per Semester ₹30,000 |
| Row 8: application fee ₹1,500, on top | FeeBreakdown: "₹1,500 one-time, non-refundable, charged separately". FAQ: "Application fee is charged separately." |

- The FAQ is now separate clauses: "The fee is ₹1,80,000 (...). It is ₹2,40,000 (...)." That fixes the round-1 splice.
- The new duration is "3 Years (BBA, 6 semesters) / 4 Years (BBA Honours, 8 semesters)". The sheet backs it with rows 1-4 and row 10 ("Six Semesters"), plus row 4's "8 semesters, 4 years". It renders in the eyebrow and the facts. The old wording, which put "Hons" on the 3-year route, is gone.
- Every MAHE BBA page now has `timeRequired` P3Y. No MAHE page has P34Y.

### 3. Wider effect: PASS

I spot-checked 8 universities by comparing getExactFee, formatLabelledFee and feeAnswerSentences on the tip against each feeBreakdown:

| University | Programme | Label check |
|---|---|---|
| LPU | BBA | "₹1,50,000 list, or ₹1,22,400 with the 20% Student Grant, semester-wise (₹20,400 × 6)" matches `list` and `net` |
| GGSIPU | BBA | "₹90,000 (₹15,000 × 6 semesters, plus ₹400 one-time charges)" matches `listLabel` |
| Marwadi | BBA | "₹79,000 (one-time). It is ₹90,000 (semester-wise ...)" matches `modes` |
| CU | MBA | The four plan clauses match `modes` |
| Amity | BBA | "₹1,75,120 (one-time). It is ₹1,99,000 (semester-wise total)" |
| JSS | BBA | "₹90,000 (tuition, ₹30,000 × 3 years, examination fees extra)" |
| UU | MBA | "₹1,48,000 before scholarship, or ₹99,600–₹1,03,600 after scholarship" |
| MATS | BBA/BCA/MBA | Course-fee labels |

- No figure changed. Every label matches its record. No labelled fee is called a total; the FAQ question drops "total" for labelled fees. The tile reads "Programme fee" on 173 pages, where it used to say "Total Fees".
- **Readability nit:** LPU BCA and MCA, Marwadi and PP Savani show nested parentheses, for example "₹1,22,400 (semester-wise (₹20,400 × 6 semesters))". It is accurate. This is not a blocker.
- **Schema durations:** I diffed every `timeRequired` and `courseWorkload` across the build. 214 pages changed, and every change fixes a value that had been mangled. P24Y and P244Y became P2Y, P36Y, P34Y and P35Y became P3Y, and P112Y became P1Y. OP Jindal's duration is "1 Year (12 Months)" and MMU's is "3 Yrs (max 5)".
- 0 regressions. The tip has only P1Y, P2Y, P3Y and P4Y in those fields.

### 4. Head tags and JSON-LD: PASS

- I compared `<title>`, every `<meta>` and the canonical byte for byte against main 09a30c1: 2,335 pages and 69,336 tags, with 0 pages differing.
- JSON-LD: 17,933 blocks, 0 parse errors, 0 undefined or NaN.
- Both builds exit 0, with the same page list.

### 5. Gates: PASS, exit 0

I ran the full husky pre-commit with the branch staged on 09a30c1. It ended "all checks passed".

| Gate | Result |
|---|---|
| fee | 205 |
| em-dash | 225 |
| blog-fees | 1848, unchanged |
| salary | 1549 |
| salary ext | 47 |
| verify-fees | 0 new |
| hub-fee-text | 0 |
| check-coupon-claims | OK |
| check-fee-provenance | 11/11 self-test, OK |

Round 2 makes no baseline or allowlist edits; d0fcd1d to dbd7886 is identical for data/. The branch's only baseline change against main is round 1's automatic lowering of blog-fees from 1861 to 1848.

### 6. Merges (not merged)

- **Into origin/main de4d075:** `git merge-tree` reports no conflicts.
- **With fix/b3-batch-26 c9184f7:**
  - Only audits/FIX-LOG.md and data/blog-fee-baseline.json conflict, as expected.
  - On my scratch merge the real blog-fee total is 1772 (amrita 9, best 31, mahe 5, nmims 17, symbiosis 8).
  - Every slug is at or below both baselines: batch 26 is 1784 and this branch is 1848.
  - So keep either side's file and let the hook lower it. Don't hand-edit the numbers.

### 7. Brand: PASS

- No added line in components, lib or app contains "Edify" or "EdifyEdu".
- The visible text of the MAHE and Amrita BBA hubs has 0 hits in both builds. The other hits are URLs and handles inside scripts.

## Notes (do not block)

- **N1. Same duration bug in other page templates.** The P34Y-style bug is still in the `timeToComplete` field built by app/universities/[id]/{bca,mba,mca,[program]}/page.tsx. Those files still strip every non-digit; this branch fixed only bba/page.tsx and SchemaBlock.
  - The tip still has 20 such values: P24Y ×10, P36Y ×5, P244Y ×2, and one each of P34Y (maharishi-markandeshwar BCA), P35Y and P112Y.
  - These were already there, with fewer of them after this branch. MAHE is not among them.
  - It is a one-line fix in each of 4 files, for a follow-up.
- **N2. Blog copy, out of scope.** amrita-online-bba-review-2026 still says "Total programme fee ₹1,41,000 across 6 semesters" in 5 places, including its FAQ JSON-LD. This one was not in the known list. The known items are the amity-online-bba-review table row and online-mba-karnataka "Total fee: ₹1,41,000".
- **N3. NMIMS.** The NMIMS hub and spec pages and compare/symbiosis-vs-nmims-bba flag on NMIMS's own ₹1,41,000. That is out of scope.

## Cleanup

- I removed the junctions with `cmd //c rmdir node_modules` from inside each of my worktrees, then removed the worktrees and pruned.
- The qaf2/inj1 copy is scratch only.
