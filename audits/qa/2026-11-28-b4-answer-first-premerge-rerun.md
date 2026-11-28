# QA pre-merge rerun: B4 answer-first block, round 2 (fix/b4-answer-first)

**Date:** 2026-11-28 · **Checker:** qa-checker (outsider)
**Tip:** e13e063 = fix 42bc13f + merge of origin/main de4d075
**Previous report:** audits/qa/2026-11-28-b4-answer-first-premerge.md (FAIL on F1 to F4)

## Verdict: PASS (one non-blocking follow-up: the mobile bottom-nav overlap)

## Method

- A first attempt was interrupted part-way through. Its half-made worktrees were removed: junctions first with `cmd //c rmdir`, then `git worktree remove`.
- Fresh scratchpad worktrees at e13e063 (branch) and de4d075 (origin/main, the base). node_modules was junctioned in, the junctions were removed with `cmd //c rmdir`, then both worktrees were removed. The main node_modules is intact (417).
- The full husky pre-commit had completed on e13e063 in the first attempt ("all checks passed"). Those numbers are used below; it is the same commit.
- Ran `next build` on both trees.
- Ran `next start` on 4957 (branch) and 4958 (base) after confirming both ports were free and nothing answered.
- Ran headless Chrome over the DevTools protocol on 9334 (port checked free) with device emulation at 375x812 and 1366x768.
- All servers and Chrome were stopped afterwards.

## Numbered findings

1. **F1, BITS eligibility: PASS.** I compared the string in lib/answer-first.ts against the "Official source says" cell of row M3 in audits/verify/bits-pilani-work-integrated-online-2026-11-18.md: `===` true. It is verbatim, including "Integrated First Degree" and "3-year degree holders need Maths or Statistics at school level or above". The rendered cell matches (assert row 2).

2. **F2/F3, DSU and ACU: PASS.**
   - Both are removed from `ANSWER_FIRST_IDS`, `ELIGIBILITY` and `EXAM_MODE_CHECKED`.
   - The block is absent on /universities/dayananda-sagar-university-online/mba and /universities/adichunchanagiri-university-online/mba (both 200).
   - The other 8 hubs render it.
   - This also settles the round-1 DSU exam-row ruling: no DSU cell is shown.

3. **F4, JAIN: PASS.**
   - The row reads label "Programme fee", value "₹1,60,000–₹2,98,000 plus registration and exam fees", then "Checked 18 Nov 2026 by edifyedu.in".
   - Nothing is summed; the value is provenance.fee plus a fixed suffix.
   - The suffix applies only to JAIN, through `FEE_LABEL`.

4. **Assert script: PASS, and it proves it can fail.**
   - `node b4-assert.mjs 4957`: ALL OK, exit 0. It checks label, value and checked line in full on 8 hubs, plus position, links, em dashes, and absence on DSU, ACU, the LPU MBA hub and the Amity BBA hub.
   - `--inject` (BITS "/Integrated First Degree" removed): FAIL, row 2 value mismatch, exit 1.
   - My own injection: qa-b4-assert-jain.mjs, a scratchpad copy with one added line that rewrites JAIN's ">Programme fee<" to ">Total fee<". Run with `--qa-jain`: FAIL, "row 1 label: got Total fee want Programme fee", exit 1.

5. **Mobile overlap: non-blocking, recorded as a follow-up.**
   - Emulated 375x812, all 8 hubs. The fixed bottom nav starts at 754px.
   - Every block's top sits at 444 to 558px, and every first answer row ends at 517 to 631px. Both are clear of the nav and above the fold.
   - The last line sits under the nav on 5 hubs, not the 3 the engineer named:

     | Hub | Block bottom (px) | Overlap past the nav (px) |
     |---|---|---|
     | BITS | 788 | 34 |
     | JAIN | 782 | 28 |
     | Symbiosis | 794 | 40 |
     | DPU | 796 | 42 |
     | Uttaranchal | 765 | 11 |

   - Galgotias, Amity and Shoolini are clear.
   - At desktop (1366x768) every block ends by 578px, against a nav top of 710px. Nothing is covered.
   - Follow-up: the layout needs either bottom padding on the hero equal to the nav height, or a shorter block on mobile.

6. **Position and order: PASS.** On all 8 hubs, at both sizes, the H1 precedes `#answer-first`, which precedes the first H2. Mobile document width is 375, so nothing overflows sideways.

7. **Scope: PASS.** Across all 2,150 valid URLs, `#answer-first` appears on exactly the 8 MBA hubs: Amity, BITS, DPU, Galgotias, JAIN, Shoolini, Symbiosis and Uttaranchal. The base build has 0.
   - "Checked ... by edifyedu.in" appears 3 times on 7 hubs and 2 times on Shoolini, whose exam cell is the counsellor line with no date.
   - Inside the block there is no `<a>`, no em dash and no "Edify" or "EdifyEdu".

8. **Build diff: PASS.** Both builds exit 0. Over 2,150 URLs, branch against base: 0 changes in status, title, meta description, robots or JSON-LD block count. 0 JSON-LD parse failures, 0 undefined or NaN.

9. **Gates: PASS.**
   - Full pre-commit: "all checks passed".
   - check-fee-baseline: 205, unchanged. check-em-dash-baseline: 225, unchanged.
   - check-fee-provenance: OK (8 fees dated; 2 known gaps, DSU Q80 and ACU Q81).
   - The diff against origin/main is 3 files (components/UniHero.tsx, lib/answer-first.ts, audits/FIX-LOG.md), with no baseline or allowlist file.

10. **Merge check: PASS.** origin/main de4d075 is an ancestor of e13e063, so the merge is a fast-forward. `git merge-tree --write-tree origin/main e13e063` exits 0. Not merged.

## Cosmetic (not blocking)

- lib/answer-first.ts: the Shoolini `ELIGIBILITY` entry ends `},}` on one line, and the header comment has one over-long line. Both are harmless; tidy them next time the file is touched.

## Follow-ups

- Mobile bottom-nav overlap on 5 hubs (finding 5). This needs a layout change.
- DSU and ACU rejoin the block once Q80 and Q81 are answered. B4 covers 8 of the top 10 until then.
