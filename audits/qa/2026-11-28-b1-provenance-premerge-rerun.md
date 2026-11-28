# QA: B1 provenance round 2, pre-merge rerun

- **Date run:** 2026-11-28
- **Branch:** fix/b1-provenance
  - 59fdf3a: merge of origin/main 0a8999e into fb461de
  - 8c8e20c: round 2
- **Checker:** qa-checker, as an outsider.
- **Worktrees:** b2base (59fdf3a) and b2tip (8c8e20c), both mine. I did not touch the engineer's worktree.

## Verdict: PASS

Round 1's F1 and F2 are fixed. Advisories 4 and 7 are fixed. One residual gate weakness is listed under A1. It is not a blocker.

## Findings

### 1. F1 (DEB line MBA-only): PASS

The built HTML of 8c8e20c shows the DEB line on 107 pages:
- 7 profiles, which now read "Online MBA: UGC-DEB entitled, Online mode, 2026-27 session. Register checked 18 Nov 2026";
- 100 MBA hub and MBA spec pages.

It appears 0 times under bba, bca, mca, ba, bcom, mcom, ma, msc and bsc. Compared with 59fdf3a:
- the unnamed line is gone from 99 pages;
- the 7 profile lines gained the "Online MBA: " prefix.

How the code does it:
- `debSessionLine(u, program, named)` returns null unless the program is 'MBA'.
- The profile call is also guarded by `u.programs.includes('MBA')`.

### 2. F2 (gap ratchet): PASS for the attacks QA set

The self-test now catches 11 of 11. It covers the three new cases: new gap added, gap cites a missing Q row, and gap with no Q number.

I reproduced the attacks in my worktree, then restored the files:

| Attack | Gate result | Exit |
|---|---|---|
| Round-1 Q999: drop BITS fee, add `bits... 'Q999: no such question'` to KNOWN_GAPS | FAILED: "not in ALLOWED_GAP_IDS" and "cites Q999, which is not a row" | 1 |
| Swap a dated fee for a gap using a real Q (Q81) | FAILED: "not in ALLOWED_GAP_IDS" | 1 |
| Off-authority JAIN alsoSourceUrls (a competitor domain) | FAILED: "alsoSourceUrls entry must be https on nirfindia.org" | 1 |

The gate reads Q numbers from the rows of audits/QUESTIONS-FOR-RISHI.md. If there are no rows it fails rather than passing.

### 3. Advisory 7 (one fee date on Amity and Symbiosis): PASS

**Amity standard plan.** The 18 Nov sheet's "Standard-track fee lines" row is MATCH and lists:
- one-time 2,07,000 (list 2,25,000)
- annual 1,06,880
- semester 56,300
- EMI 8,906

It also quotes the published effective totals: 2,13,750 annual, 2,25,000 semester, and the EMI total. All of these equal the record.

**Amity premium plan.** The 18 Nov sheet read:
- one-time 3,02,680
- annual 1,56,280, effective 3,12,560
- semester 82,300, effective 3,29,000
- EMI 13,023 (13,022 on one page), effective 3,12,560

The record holds the published totals (3,29,000 and 3,12,560), as fixed in batch 2.

**Symbiosis.** The sheet's "Total fee" row is MATCH for 3,70,000 and 3,15,000. Its fee-date row says "Both totals re-read today, unchanged".
- The Rs 1,000 extras row was also read on 18 Nov. SSODL labels it "Application Fee", and Q16 (open) covers only that label. The amount stands.

**What renders.**
- Both profiles and both MBA hubs now show only 18 Nov for the fee: "Fees checked on 18 November 2026" and "Fee checked 18 Nov 2026 on the university portal".
- The 13 Nov dates left on those pages are for other facts: Rishi's review date, the "What Amity says" placement claims, the QAA/WSCUC accreditation lines, and SCDL's PGDBA fee. None of them is the MBA fee.
- The 13 Nov entries in each plan's `source` text are kept as history.

### 4. Advisory 4 (JAIN NIRF source): PASS

- JAIN's nirf entry gains `alsoSourceUrls: ['https://www.nirfindia.org/Rankings/2025/ManagementRanking.html']`. The sheet cites that page for Management #73.
- The gate checks each entry against the fact's authority. For a fee, that is the officialUrl host. The injection in finding 2 shows the check works.

### 5. Brand rename: PASS

- No added line in this branch contains "Edify" in any case. I checked the branch diff for components, lib and scripts, and the two new visible strings.
- The round-2 lines add no em dashes.
- origin/main's .husky/pre-commit has no brand gate. The only match for "brand" is "brand-new post" in the blog fee comment. No check script came with 615c7d2.

### 6. Full husky pre-commit: PASS, exit 0

I ran it from the branch's .husky, with 8c8e20c staged on its parent 59fdf3a, and it ended "all checks passed".

| Gate | Result |
|---|---|
| fee | 205 |
| em-dash | 227 |
| blog-fees | 1861, unchanged against this base |
| salary | 1549, equal to its baseline |
| salary ext | 47, equal to its baseline |
| verify-fees | 0 new |
| check-fee-provenance | self-test 11/11; OK |
| check-official-urls | 30 confirmed |

### 7. Build diff 59fdf3a to 8c8e20c: PASS

- Both builds exit 0, with the same 2,335 pages.
- 292 files changed, 257 of them visibly. The only visible changes are the DEB-line scoping and the 13 to 18 Nov fee-date swap.
  - The Amity MBA review caption carries the fee date on 154 Amity pages.
  - The Symbiosis caption carries it on 24 pages.
- Heads, titles and metas: 0 changed.
- JSON-LD: 0 changed, 0 parse errors, 0 undefined/NaN.
- Tag balance: 0 changes.

### 8. Merge into origin/main: clean

- origin/main is now 7c867dd, one commit past 5b67ad9.
- `git merge-tree --write-tree origin/main 8c8e20c` exits 0 with no conflicts. That includes UniHero.tsx, UniversityPageClient.tsx and lib/data.ts.
- In the merged tree, UniHero calls `debSessionLine(u, program)` and UniversityPageClient calls `debSessionLine(u, 'MBA', true)`.
- Since 0a8999e, main changed only 4 lines in UniversityPageClient.tsx and 6 in lib/data.ts, and the merge combines them cleanly.
- It is not a fast-forward, because main has 4 commits the branch lacks.
- I did not merge.

## A1. Residual advisory: ALLOWED_GAP_IDS is frozen by comment only

Adding the id to ALLOWED_GAP_IDS as well as KNOWN_GAPS, citing a real Q (Q81), passes. The gate printed "OK (7 fees dated, 3 known gaps ...)", exit 0. So a dated fee can still become a gap with a two-line edit to the gate file, though the edit now has to go against a "never add one" comment, so a reviewer would see it.

I rated this advisory because round 1 offered "a const that may only lose entries" as one acceptable fix. Suggested follow-up: compare ALLOWED_GAP_IDS with `git show HEAD:scripts/check-fee-provenance.mts`, and fail on any id that HEAD does not have.

## Cleanup

- I removed the junctions with `cmd //c rmdir node_modules` from inside each worktree.
- I removed the worktrees and pruned.
- Main checkout node_modules: 417 entries, .bin 93.
