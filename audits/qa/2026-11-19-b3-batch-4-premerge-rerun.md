# QA pre-merge re-run: fix/b3-batch-4 at 7279c5b (round 2 on 5182f3f), base b9e18b2, 2026-11-19

**Overall verdict: FAIL, on one new item. Do not merge until it is fixed.**

All 11 original tests now pass, including T6, T7 and T9, which failed in round 1. All round-2 checks pass except one:
- `/programs` replaced "From ₹0" with "From ₹28K" on 6 programme cards.
- ₹28,200 is Choudhary Charan Singh University's (CCSU) feeMin. CCSU's own profile suppresses that figure ("Contact our counsellor for current fee details").
- So a suppressed placeholder fee now prints as the cheapest price for MBA, MCA, BBA, BA, MA and M.Com.

This is a one-line fix (see F1 below). Everything else is clean.

## Method

- **Build.** The branch worktree `qab4branch` was moved to 7279c5b with a clean checkout and rebuilt. `npm run build` exited 0. BUILD_ID is 12:11:29, after the commit. The base build (b9e18b2) and the round-1 extract (5182f3f, "R1") were reused.
- **Gates.** A separate throwaway worktree at 7279c5b was soft-reset to b9e18b2, which staged the full 26-file diff, and `sh .husky/pre-commit` was run on it. Every gate passed ("all checks passed", 46 gate lines). HEAD was restored afterwards, and the gates left no modified files.
- **Detectors.** I re-ran every round-1 detector (detect.js, detect2.js, t9b logic) plus a new detect3.js for the round-2 items. All are plain-substring scripts in `C:\Users\91706\AppData\Local\Temp\claude\4989ee246e828ad6\b8b6c658-5c86-4f0f-8a0d-9476c306dede\scratchpad\qab4\`.
  - Every detect3 detector was first run on base, R1 or both, and found the defect there. The before counts are in the table.
- **Text diffs.** I diffed visible text R1 vs R2 for all 2,335 pages (tokdiff-r1r2.txt). I read the code and content diff 5182f3f..7279c5b in full, as a word diff.

## Results

| # | Test | Base / R1 | R2 (7279c5b) | Verdict |
|---|---|---|---|---|
| 1 | Uni spec pages: no salary (visible text, raw HTML and FAQ JSON-LD) | Base: 1,037 with "Salary: ", 1,014 with "per annum", 982 with the FAQ answer "and other roles. ₹", 296 with "(experience-dependent)" | All 0 | **PASS** |
| 1c | `/programs/mba/specializations/*` (out of scope) | 7 with "Salary range:", 7 with "per annum" | 7 and 7 | Count only |
| 2 | Gated fee strip matches the profile | Base: placeholder range on 59, strip differs from hero tile on 103, strip missing on 18 | 0, 0 and 0. Fallback text on 88. | **PASS** |
| 2b | EMI only on the MBA tab and never beside the counsellor line (strip, top tile, hint, Quick Facts row) | Base: strip, tile, hint and rows each on 33 non-MBA tabs; tile beside the counsellor line on 70. R1: strip beside the counsellor line on 41. | Every count 0. EMI remains only on the 42 MBA tabs that show an MBA fee. | **PASS** |
| 3 | "Fees: ₹0+" | 18 | 0. The 3 remaining "₹0 " hits are site copy: "₹0 Cost to You", "₹0 Paid Rankings" and the EMI calculator's "₹0 Interest". | **PASS** |
| 3b | `/universities` "₹0"; `/programs` "From ₹0" | 18 and 9 | 0 and 0 | **PASS**, but see F1 |
| 4 | Vignan FeeBreakdown | 9 and 9 | 0 and 0. Non-Vignan pages unchanged at 521 and 521. | **PASS** |
| 5 | Vignan MCA/BCA: no hirers, no salary | Company lists and "Salary:" lines on 6 pages | No company names and no salary figures. Only the generic word "salary" remains (advisory A2 of round 1). | **PASS** |
| 6 | No Shoolini exclusivity phrases (Shoolini pages, blogs, compare) | Base: "the only" 5, "uniquely" 6, "unique to Shoolini" 1, "the only affordable" 1, "No other accredited online MBA" 1, "incl. unique" 1, "unavailable at (any) other" 1+1 | All 0. A broad scan of the review for only, unique, unavailable, no other, exclusive and first is clean (details below). | **PASS** |
| 7 | 0 "QS" in the 5 Amity BBA/MCA posts; MCA table cell; no new claim | Base: visible QS 4, 8, 2, 1 and 2 | Visible "QS" 0 in all 5 posts, and raw "QS " 0 (details below). | **PASS** |
| 8 | Derived gaps | Base: 69,400 ×4; 69,000 to Rs 81,560 ×2; Rs 6,500; 34,000 to Rs 39,000 ×2 | All 0, in visible text and raw HTML | **PASS** |
| 8b | Dr MGR "Rs 16,000 to Rs 21,000" | Base: 1 page visible, 1 raw | 0 and 0 | **PASS** |
| 8c | Shoolini "MCA Direct Selling Guidelines" (FAQ) | Base raw 1; R1 visible 1 | 0 raw, 0 visible | **PASS** |
| 9 | Hero eligibility tile | R1: 37 PG heroes showing "10+2" | PG heroes showing 10+2: 0. UG heroes showing Grad: 0. Tiles with no record: 0. Records with no tile: 0. | **PASS** |
| 10 | No generic Core Subjects block on Uttaranchal/ACU | 0. Injection test fires. | 0 | **PASS** |
| 11 | Vignan review | Stale lines present on base | All 0. Title and meta unchanged. | **PASS** |

**T6 detail.**
- The broad scan of `/blog/shoolini-online-mba-review` (visible text and raw payload) is clean.
- The only remaining hits are not exclusivity claims:
  - "payable only after you get a placement"
  - "ranked in the University category only"
  - the FAQ question "What makes Shoolini Online MBA unique?"
- "uniquely" still appears once on a Shoolini page, in generic BBA HR copy ("HR: uniquely stable across economic cycles"). It is not a claim about Shoolini.
- The 2 remaining "the only" hits near "Shoolini" in blog text are about Alliance (business-data-analytics) and IGNOU/Galgotias (top-correspondence), not Shoolini.

**T7 detail.**
- MCA table row reads "International Accreditations | WASC (USA), QAA (UK), WES | Not listed".
- Every reworded sentence only deletes the QS token. "WASC", "QAA" and "WES" were already in the same base sentences. "Not listed" is a neutral placeholder, not a claim.
- Fee sentences keep their figures (₹1,75,120 etc.), and check-blog-fees passes.

**T9 detail.**
- Recorded values still show:
  - Amity MBA: "Grad + 40%" with its note (20 pages)
  - Galgotias MBA: "Grad (pass)" (8 pages)
  - "Grad + 50%": 729 pages, every one backed by a 50% record
- R1 to R2, exactly 37 tiles changed, all from "10+2" to "Graduation", across the same 14 universities (13 MBA and the Sri Siddhartha MCA).
- Each of those records names graduation (or "Bachelor degree"), so "Graduation" is a value the record holds.
- **IGNOU MBA** reads "Graduation". Its record is "Varies by program (10+2 for UG, Graduation for PG)". Base showed the default "Grad + 50%" and R1 showed "10+2". This is a removal: "Graduation" is in the record, and the 50% was never in it.
- The mixed-level percentage guard took no percentage off any tile. No tile that showed "N%" in R1 lost it in R2; the only R1-to-R2 tile changes are the 37 above.

## Global

| Check | Result |
|---|---|
| Build | Exit 0 |
| Page count | 2,335 = 2,335, none missing |
| Titles and meta | 0 changed across all pages (base vs R2 and R1 vs R2) |
| Em dashes | 0 in added lines of 5182f3f..7279c5b |
| JSON | All 4 round-2 JSONs parse |
| `.husky`, `scripts/` | Untouched |
| blog-fee-baseline | Unchanged in round 2 (total 2021, down from 2023 on base) |
| "undefined", "NaN", "[object Object]", "₹ ", "₹+", "null+" | 0 pages |
| Pages changed R1 to R2 | 6 blogs (the 5 QS posts and the Shoolini review), `/programs`, `/universities`, 74 profiles (EMI), 14 hubs and 25 spec pages (eligibility tile, Dr MGR finance, Shoolini direct selling). No other route changed. |

## FAIL

### F1. `/programs` prints a suppressed placeholder fee as "From ₹28K" (new figure)

`app/programs/page.tsx:29-31` now takes the lowest non-zero `feeMin` from UNIS_SLIM for each programme. It prints that as "From ₹X" at line 69.

Rendered values:
- "From ₹28K" on 6 cards (MBA, MCA, BBA, BA, MA, M.Com). This is CCSU's feeMin of 28,200, and CCSU's profile shows "Contact our counsellor for current fee details" because the fee is suppressed.
- "From ₹31K" on MSc and B.Com. This is DDU Gorakhpur's 30,500, a range floor; its profile shows ₹56,500.
- "From ₹40K" on BCA (Parul feeMin).

These are not programme fees: `feeMin` is the university-level MBA-led floor. They are not gated by getDisplayFee/getExactFee, and they form a derived "cheapest" superlative, which this project does not allow. On base and R1 the line said "From ₹0", so every one of these figures is new.

Fix, either of:
- (a) Drop the "From" figure. Replace lines 29-31 and 69 with `<span />` (keep the "N universities" text).
- (b) Compute the floor only from fees that `getExactFee(u, prog)` publishes for that programme. That needs the full University record, not UNIS_SLIM. Omit the line when no university passes.

Then re-check that `/programs` has no "From ₹" figure that a profile suppresses.

## Advisories (not blocking)

- **A1. Same class as F1, pre-existing.** `/universities` cards with feeMin above 0 still print the raw `feeMin – feeMax` range (`components/UniversityCard.tsx:188-193`). That includes universities whose profiles suppress the fee. Round 2 fixed only the feeMin = 0 case.
- **A2.** The Shoolini review FAQ answer at `lib/blog.ts:29826` still says "QS ranked Shoolini #1 Private University in India (2025)". This is Q30, still open; the text was there on base.
- **A3.** The Shoolini direct-selling spec "Technical skills" block still says "SEBI Collective Investment Scheme regulations, MCA direct selling guidelines 2021…". This was visible on base and is not new. Removing the FAQ surfaced an existing answer ("Fundamentals of Direct Selling in Sem 2 common core…"), which was already in base raw HTML and matches the base about-text.
- **A4.** In the Dr MGR HRM comparison, "Galgotias is Rs 49,600 to Rs 54,600 cheaper" remains: a derived gap, pre-existing, not in the named list. The HRM and marketing comparison bodies render on no page in either build, so they are latent.

## Live check

Not applicable. This is pre-merge.

## Round 3: 24fada7 (targeted re-check of F1)

**Round 3 verdict: PASS. Overall merge verdict for fix/b3-batch-4 at 24fada7: PASS. OK to merge.**

### Method

- **Build checked.** The engineer's worktree (agent-a0f9ffeb35a239595) is at 24fada7 with a clean working tree. Its `.next/BUILD_ID` is 12:20:50, after the 12:17:46 commit, so this time the build matches the commit.
- **Extraction.** I extracted the visible text of all 2,335 pages with the same extract.js used in rounds 1 and 2 (output r3.json).
- **Detectors.** I compared against base and round 2 (r2.json) using r3check.js, a plain-substring script in the scratchpad `qab4` folder. Every detector fires on base and on round 2 (9 "From ₹" and 27 per-university "₹x+" rows on both). So the round-3 zeros are real, not a blind detector.

### Results

| # | Check | Base | R2 | R3 (24fada7) | Verdict |
|---|---|---|---|---|---|
| 1a | `/programs` raw `From <!-- -->₹` | 9 | 9 | 0 | **PASS** |
| 1b | `/programs` per-university "₹x+" rows | 27 | 27 | 0 (no ₹ at all on the page) | **PASS** |
| 1c | Card layout | 9 cards | 9 cards | Same structure as R2: 9 bordered footer rows, 9 "+N more universities", 30 rank badges, 27 row spans, 17 `/programs/` links, "N universities" counts unchanged. The footer keeps its flex layout via an empty `<span />`. | **PASS** |
| 1d | "undefined" / "NaN" on `/programs` | 0 / 0 | 0 / 0 | 0 / 0 | **PASS** |
| 1e | programDetails fees still render where present | n/a | n/a | No UNIS_SLIM record carries `programDetails` (`lib/data-slim.ts` has 0 `programDetails:` entries; the field exists only in the type at line 26). So this branch rendered nothing on base or R2 either, and its expression `u.programDetails?.[prog]?.fees` is unchanged. Nothing was lost. | **PASS** (nothing to render) |
| 2 | Diff 7279c5b..24fada7 | | | Only `app/programs/page.tsx` (the removed "From" figure, the removed `feeMin+` fallback, and the now-unused `formatFee` import) plus `audits/FIX-LOG.md`. 0 em dashes in added lines. No new figure or claim. | **PASS** |
| 3 | Whole-site visible-text diff, R2 vs R3 | | | Only `/programs` changed. 2,335 = 2,335 pages, 0 missing. 0 title changes and 0 meta changes. | **PASS** |
| 4 | `.husky/pre-commit` on a staged copy of b9e18b2..24fada7 (26 files) | | | Exit 0, "all checks passed", 46 gate lines. HEAD restored afterwards, and the gates left no modified files. | **PASS** |

### Merge verdict

Every test from rounds 1-3 now passes on 24fada7:
- T1-T11
- EMI only on the MBA tab and only beside a shown fee
- "₹0" removed from `/universities` and `/programs`
- the Dr MGR and Shoolini removals
- the `/programs` fee floor removed

The build passes, all gates pass, and the diff stays within the batch's files. **Merge is cleared from QA.** The round-2 advisories A1-A4 stay open as separate follow-ups and do not block this merge:
- A1: `/universities` cards still print raw `feeMin – feeMax` ranges for universities whose profiles suppress the fee.
- A2: the Shoolini "QS ranked #1" FAQ line (Q30).
- A3: the Shoolini direct-selling skills block still names "SEBI CIS / MCA direct selling guidelines 2021".
- A4: the latent Dr MGR HRM "Rs 49,600 to Rs 54,600 cheaper" gap.

After deploy, run the live check per the playbook: wait for a fresh prerender, check `x-vercel-cache` and `age` on `/programs`, then run `scripts/check-live.mjs`. On the live `/programs`, confirm 0 "From ₹" and 0 "₹x+" rows.
