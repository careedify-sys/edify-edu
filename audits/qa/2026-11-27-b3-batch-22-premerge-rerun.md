# QA pre-merge rerun: B3 batch 22 round 2

- Commit 7efc2cc on fix/b3-batch-22 (parent 3bc34bc), checked against base 33bae44. Batches 19-21 are live on main as 4bcdbdf. origin/main e125aee has no lib/blog.ts or blog-baseline changes since 33bae44, and `git merge-tree origin/main 7efc2cc` is clean.
- Checked by qa-checker on 2026-11-27.
- Method:
  - scratch worktrees at 33bae44 and 7efc2cc, both with full `npm run build`;
  - the 33bae44..7efc2cc patch staged on a clean tree, then pre-commit run on it;
  - source checks and built-HTML checks;
  - I read the whole 3bc34bc..7efc2cc lib/blog.ts diff (247 lines).

## Verdict: FAIL on one new item, F2. The round 1 fixes all pass.

F1, C1, A1, A3 and A4 are fixed cleanly, and every regression check passes.

F2 is three stale "Salary ranges indicative based on ..." callouts. Each sits under a table whose salary column batch 22 removed. They break the same rule as round 1 (no sentence may refer to removed table content), and they credit a source for figures that are no longer on the page.

This is a QA miss on my side: the callouts were already present at 3bc34bc, and round 1 did not catch them. Each fix is one sentence.

## 1. F1: PASS

The three H2s are deleted, each together with its neutral line:
- working-professionals: "Working Professional Online MBA ROI Calculation 2026"
- distance-mba-bangalore: "Bengaluru Specific Salary Uplift Data Across Industries"
- distance-mba-meaning: "Distance MBA Salary Outcomes by University Tier 2026"

The text before each deletion now runs straight into the next real H2. No old heading text appears anywhere in the built /blog pages (0 hits each).

I scanned every section in the 20 posts for a body that is empty or holds only the neutral line. Four sections are flagged. All four are identical at base and are not empty in practice:
- three are an H2 directly followed by H3 subsections;
- the fourth is MAHE's pre-existing empty "Sources Used" list, a known advisory.

## 2. C1: PASS

All six renames describe what is left in the section:

| Post | New H2 | What the section now holds |
|---|---|---|
| mba-scope | "Brand or Specialisation: Which Matters More" | prose comparison |
| online-mba-salary | "Why Pay Differs by City and Employer" | the city and company-type paragraph |
| science | "Top Engineering Branches and Recruiters India 2026 (PCM)" | the branch and recruiter table |
| commerce-jobs | "Chartered Accountant: The Path and the Trade-offs" | the path, the dropout point and practice vs corporate |
| freshers | "Fresher MBA vs Wait for Tier-1: The Cost Trade-off" | the capital trade-off paragraph |
| cmat | "Making CMAT Count for Your Career 2026" | prep and certification advice |

Anchors:
- Heading ids and the TOC are both generated at render from the heading text (`addHeadingIds` and `extractHeadings` in app/blog/[slug]/page.tsx), so they cannot drift apart.
- None of the 20 built pages has an `href="#..."` without a matching id. The only fragment link on each page is `#main-content`.
- The old ids are present on 0 pages.
- I grepped lib/, app/, components/, data/ and public/ for `slug#`. No match.
- The two mid-CTA anchors in lib/university-blog-cta.ts point at the MUJ and Amity headings, which are unaffected.

## 3. A1: PASS

These multipliers are deleted:
- mba-scope: "2-3x / 1.3-1.5x" (body), plus the FAQ lines "2.5-3x the starting CTC" and "2-4x ... the gap halves";
- freshers: "15x to 25x";
- commerce-jobs: "5x/8x", "4x more accessible" and the four-row 1.4x/1.5x city list;
- mba-after-engineering: "2x to 3x gap";
- career-after-12th-commerce FAQ: "adds 2x to 3x".

The detector is proven. The same `Nx` scan finds 1, 1, 1, 4 and 10 multipliers in these 5 posts at base, and 0 in each at tip.

Each replacement sentence reads cleanly. Examples:
- "brand usually moves pay more than specialisation does";
- "earn more than online MBA freshers in year 1, and the gap narrows over time";
- "far higher";
- "can be wide at year 1, and it often grows with experience".

No new statistic was added. Every number in a + line also appears in a − line, and no + line contains an em dash or a banned word.

FAQ JSON-LD: the FAQs changed in 3 posts (career-after-12th-commerce, mba-scope, commerce-jobs).
- In all 3, every built FAQPage `acceptedAnswer.text` equals the `faqs` source: 7/7, 7/7 and 6/6.
- Every question and answer also appears in the visible text.

## 4. A3: PASS

commerce-jobs at tip has 0 occurrences of "Staffing Federation", "ISF", "ICAI", "sourced", "NIRF 2024", "IBPS and RBI 2025", "survey" and "according to". At base the post had 4 "Staffing Federation" and 4 "ICAI" mentions.

- The byline now reads only "Last updated 14 May 2026 by Rishi Kumar, Senior Education Researcher and Founder, edifyedu.in."
- The intro drops "with sourced salary data".
- The ISF FAQ sentence ("Rs 3.6 LPA") is removed. This is the one salary figure behind 1916 → 1915.
- The ISF city list is replaced by a sentence with no figures.
- The "ISF median" bullet is reworded.
- The ICAI "4.5 years" and "60 percent" lines are reworded without figures.

The remaining NIRF sentence ("NIRF publishes a median graduate salary for each ranked institute ...") is a method pointer, not a sourcing claim, and it is consistent with batch20a.

## 5. A4: PASS

In mba-full-form the H3 "Salary by Specialization" and its table (10 bare figures) are removed.

The H2 "MBA Salary in India 2026" still has its intro, the neutral line and the "Your salary after MBA depends on three things" paragraph, followed by the H3 "Salary Growth by Specialization". So no heading is orphaned. Table count is 6 at base and 4 at tip, which is round 1's tier table plus this one.

## F2 (FAIL): three stale salary-source callouts

Each callout directly follows a table whose salary column batch 22 removed. My check walked back from each callout to the nearest `</table>` (about 80 characters away) and looked for salary words in that table.

| Post | Callout text | Table now has |
|---|---|---|
| courses-after-12th-science-complete-list-2026 | "Verify before applying: Salary ranges indicative based on NIRF 2024-25 placement reports plus NASSCOM hiring data." | B.Tech Branch / Top Recruiters |
| best-computer-courses-after-12th-india-2026 | "Verify before paying: Salary ranges indicative based on NASSCOM 2026 hiring data plus AICTE outcome surveys." | Course / Duration / Fees |
| mba-after-engineering-india-2026 | "Verify before applying: Salary outcomes indicative based on tier-1 MBA placements." | Branch / Best MBA Spec / Top Recruiters |

Two things are wrong with each callout:
- It describes salary ranges that are no longer on the page.
- It credits NIRF, NASSCOM, AICTE or "tier-1 placements" for them, which is the same class of claim A3 removed.

Fixes:
- For science and mba-after-engineering, delete the callout or change it to a recruiter or verification line with no source claim.
- For best-computer, keep only the fee half, for example "Verify before paying: confirm current fees with the university admission office."

Two similar lines are not affected:
- online-mba-salary has "Salary ranges indicative based on placement data plus Naukri analytics", but it sits under the university CTC table, which still carries salaries. That line belongs to another chunk (advisory).
- career-after-12th-commerce has "Salary ranges shown are medians from 2024-25 data." This is a pre-existing, unsourced claim in another section (advisory).

## 6. Regression: PASS

Scope and timestamps:
- Same 20 posts changed versus 33bae44, and only in content, updatedAt and faqs (faqs in the 3 posts above). No title, seoTitle, h1Title or metaDescription changed.
- All 20 have updatedAt 2026-11-27.
- check-blog-updated-at: "ok (20 post(s) with content changes, all dated)".

Round 1 checks:
- Round 1 passes still hold: 26 tables changed in place, each with a uniform column count, and the captions are unchanged.
- The 44 fee placeholder cells are untouched by this round.
- data/blog-fee-allowlist.json is unchanged.
- The neutral line now appears once in each of 5 posts (cmat, online-mba-salary, freshers, mba-scope, mba-full-form) and 0 times in the 3 F1 posts.

Gates at the tip:

| Gate | Result |
|---|---|
| check-blog-salaries | 1915, baseline 1915 |
| commerce-jobs per-slug salary | 36 → 35 |
| check-blog-fees | 1945 |
| check-fee-baseline | 205 |
| check-em-dash-baseline | 227 |

Build and pages:
- Both builds exit 0. The page list is the same 2335 pages at base, at tip and in round 1.
- The normalised HTML diff gives 37 pages: 21 /blog/{slug} pages and 16 others.
  - The 21 slug pages are the 20 posts plus /blog/write. That page sits under app/blog/ and is left untouched per CLAUDE.md.
  - The 16 others are /blog, /blog/page/2-12, /programs and 3 MBA hubs.
  - For the 16 others, head and visible text are identical. They differ only in chunk ids and hashes.

The 20 built posts:
- In the head, only article:modified_time changed.
- JSON-LD parses everywhere, with 0 undefined or NaN.
- The only changed JSON-LD fields are dateModified and the FAQ answer text for the 3 rewritten FAQs.

Tags and line endings:
- Tag balance is fine in 19 posts. Working-professionals is div 74/75 at both base and tip, so that pre-existing gap is unchanged.
- CRLF: 0 CR in all 4 changed files at 7efc2cc.

Staged pre-commit:
- I applied `git diff --binary 33bae44 7efc2cc` with `--index` to a clean 33bae44 tree. It staged exactly 4 files.
- `sh .husky/pre-commit` printed "all checks passed" and exited 0.
- Notable results: blog-fees 1945, salary 1915 (self-test OK), fee 205, em-dash 227, "8 protected paths and 8 frozen posts checked", and "no new truncated strings".

## Advisories (not blocking, carried or new)

- **Left for batch 23 by the engineer:** A2 (government pay figures without a verify row) and A6 (the online-mba-salary Mumbai/Hyderabad medians).
- **New, in another post:** the career-after-12th-commerce FAQ still has "ICAI Final pass rate is roughly 10 to 15 percent", "Median time to qualify is 4.5 to 5 years" and "About 60 percent ... drop out". These are the same ICAI figures that A3 removed from commerce-jobs, and the body also has "The ICAI 2025 Final pass rate was approximately 12 percent".
- **New:** the H2s "MBA Finance: The Brand Multiplier" and "The City Multiplier Nobody Models" in commerce-jobs keep the word "Multiplier" now that no multiplier figure is left. This is wording only.
- **Pre-existing:** mba-scope's byline still credits "NIRF 2024 placement reports across 70 management institutes, NASSCOM Q1 2026 sector tracker, LinkedIn India Hiring Index April 2026, and Naukri.com Job Speak January 2026". working-professionals credits "placement reports, Naukri.com Job Speak Q1 2026, plus 5 years of edifyedu.in counsellor ... alumni data". Both are A3-class claims for later chunks.

## Cleanup

- I removed the scratch worktrees r22base, r22tip and r22stage: junctions first, then `git worktree remove --force` and `git worktree prune`.
- Main node_modules is intact with 417 entries.
- Ports 3941 and 3942 are free; no server was started.
- No site edits, commits or pushes. This file is my only write.
