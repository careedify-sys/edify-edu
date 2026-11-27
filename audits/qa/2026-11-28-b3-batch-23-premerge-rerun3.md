# QA: B3 batch 23 round 4, pre-merge rerun 3

- Date run: 2026-11-28
- Commit checked: 67ab914 on fix/b3-batch-23r3. It is a merge of f0c1fda into 2a8e9df.
- Checked against origin/main 4ae8365 (fetched today). This already contains 9f15601 (Q79) and the Q80 commit.
- Checker: qa-checker, acting as an outsider. I used my own worktrees r4base (f0c1fda), r4tip (67ab914) and r4merge (4ae8365 plus 67ab914). I did not touch b23r3.

## Verdict: PASS for the content, the gates and the build

The merge into origin/main is not conflict-free. One docs-only conflict needs resolving at merge time (see M1).

## What round 4 changed

I isolated round 4 from the merge noise by diffing the automatic merge tree of 2a8e9df and f0c1fda (25c8ff1) against 67ab914. Only these 3 files differ:

- lib/blog.ts has 24 changed lines:
  - 20 are `updatedAt` changes from 2026-11-27 to 2026-11-28.
  - 2 are MAHE sentence rewrites.
  - 1 is an mba-scope FAQ deletion.
  - 1 is an mba-scope "Growth" clause deletion.
- The other two files are the FIX-LOG and QUESTIONS conflict resolutions.

No figure, source or claim was added. Every content change is a deletion or a relabel.

## Findings

1. **F1 (updatedAt): PASS.**
   - All 20 posts now carry 2026-11-28.
   - I ran the full husky pre-commit on the resolved merge staged on 4ae8365. check-blog-updated-at reported "ok (49 post(s) with content changes, all dated)".
   - The whole hook ended "pre-commit: all checks passed", exit 0.
   - The first run stopped at check-gsc-404s, because audit-data/ is gitignored and was missing from the worktree. I copied it in and reran. That gate then passed: "690 ranking URLs, none would 404".
2. **F2 (MAHE): PASS.**
   - The built page has 0 hits for "India overall" (base: 6) and 0 for "14th across" (base: 2).
   - "rank 3 in the NIRF 2025 University category" appears 4 times. The pill reads "University category, 2025".
   - This matches lib/data.ts, which says "NIRF #3 University 2025".
3. **mba-scope: PASS.**
   - These phrases are gone from the built page: "NAAC A or A+ university most readily", "Campus MBA is still preferred", "from a small base", "YoY" (base: 24) and "Ranked by Demand".
   - The FAQ answer still reads correctly.
4. **Merge resolution on the branch: PASS.**
   - 67ab914 has no conflict markers in any tracked file. I ran git grep for `<<<<<<<` / `>>>>>>>`, and for `=======` in md, ts, tsx and json files.
   - QUESTIONS rows Q69 to Q78 are in order and each has 6 cells. Q70 has 4 escaped pipes and Q71 has 2. The cell counter's self-test passes.
   - FIX-LOG has 215 entries. That is f0c1fda's 211 plus 4 batch-23 entries, so none was lost.
5. **Built output: PASS.**
   - Both builds exit 0 and have the same 2,335 pages.
   - From f0c1fda to 67ab914, 131 HTML files changed. These are rounds 1 to 4 of batch 23 together, since main has none of them yet.
   - 0 titles changed.
   - Blog heads changed only in article:modified_time.
   - Three compare descriptions changed: amity-vs-chandigarh, chandigarh-vs-lpu and manipal-jaipur-vs-chandigarh. These are the round-1 CU Early Bird plan labels from pairs.ts, not round 4.
   - JSON-LD: 0 parse errors, 0 undefined or NaN values, and tag balance is unchanged.
   - dateModified is 2026-11-28 on the edited posts.
6. **Gates: PASS.** No allowlists were added.
   - fee: 205
   - em-dash: 227
   - blog-fees: 1889
   - salary: 1902
   - salary ext: 65
   - verify-fees: 0 new mismatches, 5 already allowlisted
   - protected pages: 8/8
   - nirf-category: OK
7. **IGNOU cross-check.** distance-mba-kolkata prints "No total published: ₹16,000 per semester (₹18,000 for the 3rd)". The only ₹66,000 on that page is the global navbar fee map in the RSC payload, which is not visible and not in the meta. This is the same global case Q70 covers.
8. **Advisory, already there and out of scope.** check-nirf-category prints a NOTE that the frozen MAHE review title/meta uses "Management #39", and that rank belongs to TAPMI. The title freeze runs to 5 Dec, so this is for Rishi or for after the freeze.
9. **Line endings.** The FIX-LOG staged in the scratch merge has 0 CR characters.

## M1. Merge into origin/main 4ae8365: not a fast-forward, one docs-only conflict

- origin/main is 4 commits ahead of the branch: 9f15601, b89de4e, d6715dc and 4ae8365.
- In `git merge --no-ff 67ab914`, everything merges automatically, including the code in b89de4e and d6715dc and QUESTIONS Q79 and Q80, except **audits/FIX-LOG.md**.
- The conflict is at the top of the file. Main's "2026-11-28 · A6: 28 Nov guard check" entry and the branch's four batch-23 entries are both inserted after "# Fix log".
- **Resolution:** keep both. Put the A6 entry first, then the batch-23 round 4, 3, 2 and 1 entries.
- Resolved that way, the file has 216 entries: 212 from main plus 4 from the branch.
- QUESTIONS rows Q69 to Q80 are then in order, and all have 6 cells.
- With that resolution, the full pre-commit passes (exit 0).
- I did not merge or commit. The scratch worktrees are removed.
