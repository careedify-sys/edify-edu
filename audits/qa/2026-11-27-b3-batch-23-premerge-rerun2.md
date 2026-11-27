# QA: B3 batch 23 round 3, pre-merge rerun 2

- Date run: 2026-11-28
- Commit: 2a8e9df on fix/b3-batch-23r3 (parent 24663a8)
- Checker: qa-checker (outsider). I used my own worktrees r3base, r3tip, r3stage and r3merge, and did not touch the engineer's b23r3.

## Verdict: FAIL

The content claims hold on the built output. The branch cannot merge today because a gate fails, and one edited post still carries a NIRF rank with the wrong category.

## Findings

### F1 (blocker). check-blog-updated-at fails today

- **On 24663a8 with the 2a8e9df patch staged,** every earlier gate passes:
  - verify-fees: 0 new, 5 allowlisted
  - em-dash: 227
  - fee: 205
  - blog-fees: 1889
  - salary: 1902
  - ext: 65
  - protected: 8/8
  - truncation: OK
  - hub-fee-text: 0

  Then check-blog-updated-at exits 1: "12 post(s) changed content without changing updatedAt (updatedAt still 2026-11-27)".
- **Why:** the gate accepts updatedAt only if it equals today's date. The commit was made 2026-11-27 23:51 IST, so it passed then. On 28 Nov it fails.
- **On the scratch merge into origin/main (f0c1fda),** the same gate fails for 20 posts. These are all of batch 23's rounds, because main has none of them yet:
  - working-professionals, mahe review, mba-fees guide, career-after-12th-arts, best-mba-specialization, online-mba-salary, pune, mba-after-engineering, mba-data-science, freshers, mba-scope, distance-mba-meaning, chennai, correspondence-mba, fee-comparison, computer-courses, 12th-science, best-online-mba-colleges, amity-vs-manipal, nmims-vs-symbiosis.
- **Fix:** set updatedAt "2026-11-28" (the merge day) on those 20 posts, then rerun the hooks. Do not use --no-verify.

### F2. MAHE review body still mislabels the NIRF category

- The pill is fixed: "NIRF #3 / University category, 2025".
- The body of mahe-online-mba-review-2026 still says:
  - "NIRF ranked it third in India overall."
  - "NIRF ranked it 3rd in India overall in 2024 and 14th across all institutions."
- Rank 3 is the University category. "Overall" is a different NIRF category, and the second sentence contradicts itself. The base build has this text too (4 hits in base, 3 in tip), but it breaks the NIRF-category rule in a post this round edited.
- **Fix:** reword both sentences to "3rd in the NIRF University category" with the year. Keep 14th only if it is labelled Overall and sourced.

### Claims verified on the built output (r3tip .next HTML + RSC)

1. **F1 (IGNOU).**
   - "₹16,000 per semester (₹18,000 for the 3rd)" appears on fintech, hospitality, logistics and real-estate.
   - "No total published" now appears on 0 pages.
   - f1scan: 49 pages print 66,000 and 15 of them have JSON-LD. 0 of those 49 also make a no-total claim. PASS.
2. **F2 (Q70).** The row has 6 cells, with 4 pipes escaped. The scope reads 49 pages, 15 with JSON-LD, plus the 5 blog metas, which matches my scan. PASS.
3. **Q71.** The row has 6 cells and lists the 6 stale heads. PASS.
4. **science.** "do not require engineering skills" renders, and the sentence reads correctly. It is unsourced but has no figure. PASS.
5. **mba-scope.**
   - "according to NASSCOM", "YoY" and "Ranked by Demand" give 0 hits.
   - The H2 "Sector-by-Sector Hiring Direction in 2026" renders.
   - The Naukri and LinkedIn stats are gone. The only LinkedIn hits left are the share and footer links.
   - PASS. Advisory: the FAQ line about A/A+ employer acceptance is a qualitative leftover of the deleted survey. "Growth: very new, from a small base." reads awkwardly.
6. **NIRF.**
   - "NIRF 2025 Management 73" (JAIN) renders on 5 posts.
   - "NIRF 2025 Management 24" (NMIMS) renders on 3 posts.
   - PASS, apart from F2.
7. **best-mba-specialization.** The H2 "MBA Specialisations and Demand Levels 2026" renders. PASS.
8. **No fabricated replacement text.**
   - Source hits fell from 34 to 27 and percentage hits from 64 to 50, with no new figures.
9. **Build-wide checks.**
   - Both builds exit 0 and produce the same 2,335 pages.
   - 29 HTML files changed, 12 of them visibly (the 12 posts).
   - Heads changed: 0. Title or meta changed: 0.
   - Source diff: no title, seoTitle or description edits.
   - JSON-LD: 0 parse errors. undefined or NaN: 0. Tag balance changes: 0.
10. **CRLF.** lib/blog.ts, FIX-LOG and QUESTIONS have 0 CR at both commits. PASS.

### Leftovers in the 12 posts (pre-existing, advisory, not new)

- mba-after-engineering: "Real data from hiring platforms ..." with a 60-80% salary increase, "40 to 80 percent" and the FAQ "40-80% more".
- online-mba-salary:
  - unsourced percentages: 20-40%, 25-40%, 30-50%, 25-35%, and the 25/40/15% ROI split
  - "Use Glassdoor, Naukri, AmbitionBox" (advice only)
- mba-scope: "8 to 10 percent" and "8 to 12 percent annually".
- mahe: "25-40 percent upgrade".
- working-professionals: "20-40 percent salary upgrade".
- fintech: the Fintech Foundation, NASSCOM and RBI line is a pointer with no figure.

### Merge into origin/main (f0c1fda): not clean

- Text conflicts appear in audits/FIX-LOG.md and audits/QUESTIONS-FOR-RISHI.md. Code merges on its own.
- The right fix is to keep both sides, with Q70 and Q71 placed before Q72. Git's markers show main's Q72-Q78 block first, so keeping both blocks in that order would put Q70 and Q71 after Q78.
- After resolving, the order is Q69, Q70, Q71, Q72 ... Q78, and all rows have 6 cells.
- FIX-LOG keeps all 3 batch-23 entries plus the logos entry. 0 conflict markers remain.
- Merge pre-commit: every gate passes except check-blog-updated-at (F1).
- I did not merge or commit. The scratch worktrees are removed.
