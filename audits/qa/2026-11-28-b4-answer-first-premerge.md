# QA pre-merge: B4 answer-first block (fix/b4-answer-first)

**Date:** 2026-11-28 · **Checker:** qa-checker (outsider, did not do the work)
**Target:** 9ddbfdb, from origin/main 8502836
**Acceptance (OPERATING-PLAN B4):** above the fold on the top 10 hubs; total fee, eligibility and exam mode, each with its date

## Verdict: FAIL (4 content defects; the mechanics all pass)

The block itself works:
- It renders only on the 10 MBA hubs.
- It sits after the H1 and before the first H2.
- It is above the fold at both 375px and 1366px.
- It has no links, no em dashes and no brand slips.
- Titles and meta are unchanged, and the gates and merges are clean.

The failures are in the cells:
1. One eligibility value drops two conditions.
2. Two hubs contradict themselves on the same screen.
3. The DSU exam row breaks the block's own sourcing rule.
4. One fee is labelled "Total" when its sheet says it is not the total.

The engineer's assert script reports ALL OK. It cannot see any of these four defects, because it checks only for fragments of each expected value.

## Method

- Scratchpad worktrees at 9ddbfdb and 8502836. node_modules was junctioned in, the junctions were removed with `cmd //c rmdir`, then both worktrees were removed. The main node_modules is intact (417).
- Ran the full husky pre-commit on 9ddbfdb.
- Ran `next build` on both trees.
- Ran `next start` on 4947 (branch) and 4948 (base) after confirming both ports were free and nothing answered. Both are stopped.
- Ran the engineer's scratchpad/b4-assert.mjs.
- Layout: headless Chrome over the DevTools protocol with device emulation, 375x812 (mobile) and 1366x768 (desktop), on all 10 hubs. I measured the bounding box of `#answer-first`, the document scrollWidth and the DOM order of H1, block and first H2, and saved a screenshot per hub and width in the scratchpad. A plain `--window-size=375` screenshot clips the page, because headless Chrome enforces a minimum window width. That is a tool artifact; the emulated run shows no overflow.
- Fetched all 2,150 valid-urls on both builds.
- Checked each of the 30 cells against `u.provenance.fee`, `formatExactFee`, `examTier` and rows M3, M5 and M6 of each audits/verify/{id}-2026-11-18.md.

## Numbered findings

**F1 (FAIL). BITS eligibility drops two conditions from sheet row M3.**
- Sheet M3: "B.E./B.Tech./M.Sc./Integrated First Degree, or a 3-year UG degree in Maths, Statistics, Science, Economics, Commerce or Business Management; minimum 60% aggregate; work experience 1 year (B.E./B.Tech./M.Sc.) or 2 years (3-year degree); must be employed when applying; 3-year degree holders need Maths or Statistics at school level or above".
- The block leaves out "Integrated First Degree" (an accepted route) and the Maths or Statistics requirement for 3-year degree holders.
- The brief says no condition may be dropped. Put both back.

**F2 (FAIL). DSU and ACU contradict themselves above the fold.**
- On the DSU hub, the block says "Total fee: Ask our counsellor" and "Eligibility: Ask our counsellor". The stat grid about 250px lower on the same screen says "TOTAL FEES ₹1,30,000", "ELIGIBILITY Grad + 50%" and "Fees checked on 18 November 2026" (screenshot cdp-dayananda-sagar-university-online-mba-m.png).
- On the ACU hub, the block says "Total fee: Ask our counsellor" and the stat grid says "TOTAL FEES ₹1,40,000".
- An answer-first block that tells the reader to ask, directly above the figure, reads as broken.
- Fix with one of these:
  - (a) Leave DSU and ACU out of `ANSWER_FIRST_IDS` until Q80 and Q81 are answered. The block then covers 8 hubs and B4 is partly blocked on those two questions.
  - (b) Print the same values the hub already prints, with no "Checked" line.
- I recommend (a): it makes no undated claim and no contradiction.

**F3 (FAIL). Ruling on the DSU exam row.**
- The engineer leaves out DSU's fee and eligibility because their source, dsuonline.com, is not confirmed as DSU's official site (Q80, B2 UNVERIFIED).
- The exam row "Online, Checked 18 Nov 2026 by edifyedu.in" comes from the same sheet and the same site (M6: dsuonline.com/online-mba/ and /mandatory-disclosures).
- Under the block's own rule, that dated claim is not allowed. The three DSU cells must be treated alike.
- Ruling: under fix F2(a), DSU leaves the block and the question is moot. Under F2(b), the exam row must also drop its "Checked" line.
- The DSU 'Online' entry in `CONFIRMED_EXAM_MODE` elsewhere on the site already carries the Q80 dependency in FIX-LOG (B7 round 2). This block must not present it as a dated, checked fact while Q80 is open.

**F4 (FAIL). The JAIN fee is labelled "Total fee", which contradicts its sheet.**
- The JAIN sheet row M5 "Fee components" says registration (Rs 2,500 one-time) and the examination fee (Rs 3,000 a year) "sit outside the programme fee". Its fix note says to label the figure "programme fee".
- The block prints "Total fee ₹1,60,000–₹2,98,000 / Checked 18 Nov 2026 by edifyedu.in", a dated claim the sheet contradicts.
- Fix: label JAIN's row "Programme fee", or add "plus registration and exam fees". The stat grid's "Total Fees" is pre-existing and out of B4 scope; I flag it as an advisory.

**F5 (PASS). The other 26 cells match their sources.**

| University | Fee (provenance.fee = formatExactFee = sheet M5) | Eligibility vs M3 | Exam (tier, M6) |
|---|---|---|---|
| BITS | ₹3,12,400 MATCH | F1 | centre: "In person at designated exam centres" MATCH |
| Galgotias | ₹80,200 MATCH | "Graduation pass; no minimum percentage published" MATCH | online: "Online" MATCH |
| JAIN | ₹1,60,000–₹2,98,000 (F4 label) | MATCH (50%, 5% SC/ST, final semester) | online: "Online" MATCH |
| DSU | counsellor (F2) | counsellor (F2) | F3 |
| Symbiosis | ₹3,15,000–₹3,70,000 MATCH | MATCH (50%, 45% SC/ST) | online: "Online" MATCH (source states no proctoring, so none is claimed) |
| DPU Pune | ₹1,89,400 MATCH | MATCH (50%, 45%, no work experience) | fromHome: "Online proctored, taken from home" MATCH ("online proctored", "complete remotely") |
| Amity | ₹2,07,000–₹2,25,000 MATCH | MATCH (40%, admission test below 40%) | fromHome MATCH ("100% remote and digitally proctored") |
| Uttaranchal | ₹1,48,000 before; ₹99,600–₹1,03,600 after MATCH | MATCH; see the advisory below | fromHome MATCH ("from anywhere") |
| Shoolini | ₹1,30,000–₹1,58,000 MATCH | MATCH (50%, 45%, 60% international) | unverified: counsellor line, no date. Correct; M6 UNCLEAR, Q29 |
| ACU | counsellor (F2) | MATCH (50% or CGPA, 45% SC/ST, final year) | unrecorded: neutral line, no date. Correct; M6 UNCLEAR |

- Every date is "Checked 18 Nov 2026", which equals the sheet's Checked column (2026-11-18) and provenance.fee.checkedOn. No date is invented.
- The counsellor and neutral cells carry no date and make no claim: DSU fee and eligibility, ACU fee, Shoolini exam and ACU exam.

**F6 (PASS). Position and above the fold.**
- DOM order is H1, then `#answer-first`, then the first H2 on all 10 hubs.
- Measured block tops:
  - Mobile 375x812: 423 to 558px.
  - Desktop 1366x768: 372 to 397px.
  - Both are well below the viewport heights of 812px and 768px.
- The whole block is inside the viewport at both sizes, and the document width equals the viewport width (375), so there is no horizontal overflow.
- Advisory: on mobile the DPU and Symbiosis blocks end at 796px and 794px. Their last line sits under the fixed bottom navigation bar (about 55px tall). The block's top and its first two rows are clear.

**F7 (PASS). Scope across all 2,150 URLs.**
- `#answer-first` appears on exactly the 10 `/universities/{id}/mba` hubs.
- It is absent from every spec page, every non-MBA hub, the other 133 universities and the base build.
- Every sourced value is followed by "Checked 18 Nov 2026 by edifyedu.in": 3 lines each on 7 hubs, 2 on Shoolini and 1 on each of DSU and ACU.
- Inside the block there is no `<a>`, no em dash and no "Edify" or "EdifyEdu".

**F8 (PASS). Build diff.** Across all 2,150 URLs, branch against base: 0 changes in status, title, meta description, robots or JSON-LD block count. 0 JSON-LD parse failures, 0 undefined or NaN. Titles and seoTitle are unchanged, as is the FAQPage, which was deliberately not extended.

**F9 (PASS). Gates.**
- The full pre-commit passes: "all checks passed".
- check-fee-baseline: 205, unchanged. check-em-dash-baseline: 225, unchanged.
- check-fee-provenance: self-test OK (11 injected defects caught). Real run OK: 8 fees dated, 2 known gaps (DSU Q80, ACU Q81).
- No baseline or allowlist file is in the diff, which covers 3 files: components/UniHero.tsx, lib/answer-first.ts and FIX-LOG.

**F10 (PASS). Merge check (not merged).**
- Against origin/main 09a30c1: `git merge-tree` exits 0, with no conflicts.
- Against fix/bba-fees-mahe-amrita d0fcd1d: one conflict, in audits/FIX-LOG.md only (keep both entries). lib/data.ts auto-merges, and UniHero.tsx is untouched by that branch.

## Advisory (not blocking)

- The Uttaranchal eligibility leaves out the M3 note that working professionals with 2 years' experience should contact admissions. It is guidance rather than a condition, but the cell has room for it.
- Galgotias's sheet lists registration, exam and alumni lines inside the ₹80,200 total. Shoolini's ₹500 application fee is separate. Neither changes the label.

## To pass on rerun

Fix F1 to F4. Then rerun b4-assert.mjs with stricter expectations: the full BITS M3 conditions, and the DSU and ACU treatment chosen for F2. Re-measure the layout of any hub whose block grows.
