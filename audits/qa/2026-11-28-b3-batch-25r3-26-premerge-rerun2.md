# QA: B3 batch 25r3+26, round 3 pre-merge rerun

- **Date run:** 2026-11-28
- **Branch:** fix/b3-batch-26 at 0f1b3d0. Its parent is c9184f7.
- **Checker:** qa-checker, as an outsider.
- **Prior report:** audits/qa/2026-11-28-b3-batch-25r3-26-premerge-rerun.md, from the other QA agent. I read it first.
- **Worktrees** (both mine; I did not touch the author clone b3-batch-19):
  - q26m0: origin/main 911d45c.
  - q26m1: 911d45c with 0f1b3d0 merged and resolved.

## Verdict: PASS

F1, F3, F5 and F6 are fixed in the rendered output. The F2 decision is logged. Every gate passes on the resolved merge into current main.

What remains in the posts:
- the two frozen metaDescriptions (deferred to batch 27);
- the batch 27 items the prior report already deferred.

## Findings

### 1. Rendered body of the 3 Amity-touched posts, plus the Amrita BBA review: PASS

I scanned the merged build's HTML with a script. It covers the visible body, the JSON-LD and the head metas, and it skips digit-prefixed matches such as 10%, 50% and 22,500.

| Post | Hits on 911d45c | Hits on the merge | What the remaining hits are |
|---|---:|---:|---|
| amity-online-bba-fees-2026 | 103 | 6 | All 6 are the frozen metaDescription string "₹7,877/mo 0% EMI", echoed once in the visible summary and twice in the Article JSON-LD |
| amity-online-bba-review-2026 | 74 | 6 | All 6 are its frozen metaDescription "0% EMI ₹7,877 monthly", echoed the same way |
| best-online-bba-colleges-india-2026 | 14 | 1 | "Zero-Cost EMI at ₹4,375" for Amrita. The Amrita portal prints "Zero Cost EMI" at Rs. 4375 (BBA fee sheet row 15), so it is backed |
| amrita-online-bba-review-2026 | 0 | 0 | |

Terms scanned: 0%, no-cost, zero-cost, interest-free, 7,877, 8,292, 63,020, 66,333, 1,89,050, 13,930, ₹1,100, ₹2,500 and "× 6 =".

**On metaDescription.** The metaDescription field is not in title-freeze FREEZE_FIELDS for these two posts, but the brief defers it to batch 27. It now plainly contradicts the body, which says interest is unverified. Batch 27 should take it first.

**Prior findings:**
- **F1:** the "24-Month No-Cost EMI" label and the four 0% sentences are gone.
- **F3:** both sibling bodies are clean.
- **F5:** "₹33,200 × 6 = ₹1,99,000" now reads "₹33,200 per semester (Amity lists the effective fee as ₹1,99,000)" in all 3 places.
- **F6:** ₹1,100 and ₹2,500 are replaced by "Confirm the application and registration fees with our counsellor".

**Replacement text adds no figure.** Rupee figures in lines added since c9184f7 are a subset of the figures removed. The one count increase is ₹1,99,000 (+2), a restatement of Amity's published effective fee.

**Removed:**
- ₹7,877 ×12
- ₹1,89,050 ×13
- ₹63,020 ×6
- ₹1,100 ×8
- ₹2,500 ×7
- ₹8,292 ×2
- ₹13,930 ×2
- ₹66,333 ×1
- ₹23,880: 8 down to 6. It stays deferred as F4.

**Amrita BBA review (N2 from my BBA rerun): PASS.** The engineer's detector (assert141.cjs) gives 0 flags for amrita-online-bba-review-2026 on the merged build, and my source scan finds no "total" sentence about ₹1,41,000 without "tuition". The detector's remaining flags are the known out-of-scope items:
- the amity-online-bba-review table row;
- online-mba-karnataka;
- compare/symbiosis-vs-nmims-bba;
- the NMIMS hub and specs, which carry NMIMS's own ₹1,41,000.

### 2. F2, BVP: logged

The FIX-LOG round 3 entry records: "F2. BVP ₹1,78,000 ... Kept, by coordinator decision: ₹1,78,000 per Rishi's 28 Oct confirmation". It also notes the BVP page's ₹1,76,000 plus ₹1,000 plus ₹1,000. The entry exists, and nothing else is required.

### 3. Batch-wide checks on the resolved merge into origin/main 911d45c: PASS

**Merge.**
- `git merge --no-commit --no-ff 0f1b3d0` on 911d45c conflicts in audits/FIX-LOG.md and data/blog-fee-baseline.json. QUESTIONS merges automatically.
- FIX-LOG is resolved by keeping both sides, main's block first. The result has 236 entries: main 229, plus branch 233 minus merge base 226. 0 markers remain.

**Full husky pre-commit on the staged merge: exit 0, "all checks passed".**

| Gate | Result |
|---|---|
| verify-fees | 0 new |
| em-dash | 225, unchanged |
| fee | 205, unchanged |
| check-fee-provenance | OK |
| check-blog-fees | "unverified count DROPPED (1777 -> 1771). Baseline updated and staged." |
| salary | 1549 |
| salary ext | 47 |
| protected pages | 8 paths and 8 frozen posts OK |
| check-blog-updated-at | "ok (75 post(s) with content changes, all dated)" |
| check-coupon-claims | OK |

**Final blog-fee baseline: 1771.**

**Build head-tag diff, 911d45c vs the merge.**
- Both builds exit 0, with the same 2,335 pages.
- `<title>`, meta description and canonical: 0 changes on all 2,335 pages.
- 29 pages differ in head tags, and every difference is `article:modified_time` (58 tag lines, old and new). It moves to 2026-11-28 because updatedAt changed. That is expected.

**JSON-LD.** 17,933 blocks, 0 parse errors, 0 undefined or NaN. Tag balance: 0 changes.

**Posts.**
- The frozen 8 posts and data-science-salary-india-2026-scope-jobs are unchanged against 911d45c. I compared every field of each post object.
- 75 posts changed against main, and every one carries updatedAt 2026-11-28.
- 0 changes to title, seoTitle, h1Title, metaDescription, description, slug, status or publishedAt.
- No posts were added or removed.

### 4. Baseline procedure (repeat this in the merge)

1. On main: `git merge --no-ff fix/b3-batch-26`. It stops with conflicts in audits/FIX-LOG.md and data/blog-fee-baseline.json.
2. From the repo root, run `node C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa26/resolve-baseline.cjs`. It does two things:
   - **FIX-LOG.** It keeps both sides, main's block first, with one blank line between. Marker lines are matched with any trailing CR removed. A plain line compare missed them in this CRLF worktree, and the script then failed with "unterminated conflict block" instead of writing a bad file. It fails on nested or unterminated markers.
   - **Baseline.** It writes `data/blog-fee-baseline.json` as the per-slug MINIMUM of `:2` (main, 1848) and `:3` (branch, 1783), over the union of slugs. That gives 1777. Neither side had a slug the other lacked.
3. `git add audits/FIX-LOG.md data/blog-fee-baseline.json`. Copy `audit-data/` into a worktree if you run the hook there, because check-gsc-404s needs it.
4. Run the hook, `sh .husky/pre-commit`, or let `git commit` run it. check-blog-fees lowers 1777 to the real 1771 and stages the file. Do not hand-edit numbers.
5. Commit.

Why the minimum: it can only pass if every slug's real count is at or below both sides. That proves the merge hides no increase. Taking one side's file wholesale also passes here, but it proves less.

### 5. Merge with the moving main

The merge base and conflicts above are against 911d45c, which is current origin/main. If main moves again before you merge, rerun step 2. The script reads the live conflict stages and does not use these numbers.

## Notes (do not block)

- **N1.** The frozen metaDescriptions of amity-online-bba-fees-2026 and amity-online-bba-review-2026 still say "₹7,877 ... 0% EMI", and that text also renders in the page summary and the Article JSON-LD. They are deferred to batch 27, as briefed, and should be its first item.
- **N2.** ₹23,880 (our subtraction, prior F4) remains 6 times in amity-online-bba-fees-2026. It is deferred to batch 27.
- **N3.** Round 3 changed the Amrita EMI in best-online-bba-colleges Step 5 from "zero-cost EMI ₹4,375/mo" to "EMI ₹4,375/mo". The sheet backs "Zero Cost EMI" for Amrita, so the removal was not needed, but it is harmless. The same post's Amrita line "Zero-Cost EMI at ₹4,375" stays, and it is backed.

## Cleanup

- I removed the junctions with `cmd //c rmdir node_modules` from inside each worktree.
- I removed the worktrees with `git worktree remove --force` and then ran `git worktree prune`.
- The scratch merge was never committed.
