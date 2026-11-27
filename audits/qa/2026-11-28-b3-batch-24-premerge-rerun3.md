# QA: B3 batch 24, round 4 (pre-merge rerun 3)

- Commit: 341f986 on fix/b3-batch-24 (parent b34594c, batch base 24663a8)
- Checked: 2026-11-28 by qa-checker, in its own worktrees. The engineer's repo was not touched.

## Verdict: PASS

Round 4 fixes rerun 2's F1. Every gate passes on the full batch range and on the real landing merge.

## 1. The diff holds only the two expected changes (PASS)

`git diff b34594c 341f986` touches 2 files, with 7 insertions and 7 deletions:

- lib/blog.ts: 5 lines, each `updatedAt: '2026-11-27'` changed to `'2026-11-28'`. The 5 posts are:
  - mba-hr-career-salary-scope-2026
  - mba-marketing-career-salary-jobs-2026
  - mba-for-commerce-students-india-2026
  - mba-operations-management-career-2026
  - best-online-mba-colleges-india-2026

  These are the 5 from rerun 2's F1. No other line changed.
- data/blog-salary-baseline.json: `total` 1550 to 1549, and `iim-online-mba-india-2026` 8 to 7.
- Rendered content: my copy of the hook's contentText comparison finds **0** posts changed between b34594c and 341f986. This is a date-only change, so no rebuild was needed.
- No CRLF in either file.

## 2. Full husky pre-commit (PASS)

I ran `sh .husky/pre-commit` on two staged trees. Both ended with "pre-commit: all checks passed" and EXIT 0.

- **(a) The batch range.** HEAD is 24663a8, with 341f986 staged.
- **(b) The real landing merge.** HEAD is fix/b3-batch-23r3 (67ab914), with the `git merge-tree` result of 67ab914 + 341f986 (tree d6729c9) staged. The one conflicted audit file, FIX-LOG.md, was left at the HEAD version.

Gate results, identical in both runs:

| Gate | Result |
|---|---|
| check-blog-updated-at | ok (28 posts with content changes, all dated) |
| check-fee-baseline | 205, unchanged |
| check-em-dash-baseline | 227, unchanged |
| check-blog-fees | 1861, unchanged |
| check-blog-salaries | 1549 figures, baseline 1549; ext 47 = 47 |

My hook simulation (scratchpad/qa24q/ua.mts) agrees with the hook. It finds 0 stale posts both from 24663a8 to 341f986 and from 67ab914 to its merge with 341f986.

**Merging straight into origin/main (4ae8365), skipping batch 23.** Here 12 posts come out stale. They are all batch 23 posts that main does not have yet, for example mahe-online-mba-review-2026 and amity-vs-manipal-online-mba-2026. None is a batch 24 post. origin/main to 67ab914 gives 0 stale, because batch 23 round 4 dated its 20 posts. So in the agreed order (batch 23 first) this does not block. If batch 24 ever lands before batch 23, those 12 posts would trip the hook.

## 3. The salary baseline went down (PASS)

- Batch total: 1902 at 24663a8, 1549 at 341f986. No per-post count rose anywhere in the batch.
- This round: iim-online-mba-india-2026 went from 8 to 7. That matches round 3 deleting "Rs 50 LPA-plus within 3 years" from that post: LPA tokens in the iim post go 84e09b0 = 8, b34594c = 7, 341f986 = 7.
- It is the same lowering the gate printed in my rerun 2 run ("Baseline lowered for 1 post(s); total 1550 -> 1549").

## 4. Merge check (PASS, not merged)

| Merge | Conflicts | Auto-merged |
|---|---|---|
| fix/b3-batch-23r3 (67ab914) + 341f986 | audits/FIX-LOG.md only | lib/blog.ts |
| origin/main (4ae8365) + 341f986 | audits/FIX-LOG.md and audits/QUESTIONS-FOR-RISHI.md only | lib/data.ts |

Neither merge has a code or content conflict.

## Carried advisories (not blocking, from rerun 2)

- A1: the career-after-bcom pass rates are unsourced.
- A2: the AACSB "fewer than 6 percent" figure is unsourced.
- A3: the mba-marketing digital premium contradicts its own FAQ. This goes to Q71.
- A4: the IIM Rs 20 to 30 lakh row in mba-fees was reclassified to NON_FEE because of nearby text.

## Cleanup

- I removed my worktrees r4a and r4m: junctions with `cmd //c rmdir` first, then `git worktree remove`.
- The main node_modules is intact.
- I did not touch r4merge or r4tip in the scratchpad, which belong to another agent.
