# QA pre-merge: B3 batch 22 (salary chunk 20c)

- Branch: fix/b3-batch-22 at 3bc34bc
- Base: 33bae44 (batch 21 round 2)
- Checked by: qa-checker, 2026-11-27
- Method: scratch worktrees for base, tip and staged-tip; full `npm run build` of base and tip; staged pre-commit run; source and built-HTML scripts

## Verdict: FAIL (one item, F1, and it is cheap to fix)

Every gate passes and the numbers reproduce exactly. The tables are clean and the fee cells are correct.

The failure is F1. Three removed tables leave behind an H2 whose only content is the neutral line. That breaks the brief's "no heading may be orphaned" rule. Fix F1 (and ideally C1) and the batch can go.

## 1. Scope: PASS

- Exactly 20 posts changed in BLOG_POSTS. Only `content` and `updatedAt` changed. There are no changes to faqs, title, seoTitle, h1Title or metaDescription.
- The 20 slugs match the scope file `.b8tmp/batch21-20c-chunk.md` one for one.
- No changed post is in FREEZE_SLUGS or `data/protected-ai-pages.csv`. check-protected-pages reports "OK. 8 protected paths and 8 frozen posts checked."
- None of the 20 has a salary figure in its title, seoTitle, h1Title or metaDescription.
- Diff stat: 4 files only.
  - audits/FIX-LOG.md (+19)
  - data/blog-fee-baseline.json
  - data/blog-salary-baseline.json
  - lib/blog.ts (292+/407-)

## 2. Tables: PASS for structure, FAIL on orphaned headings (F1)

Every changed table was read from tip source and in the built HTML.

### Structure

- 26 tables changed in place:
  - 23 dropped their salary column;
  - 2 dropped rows (commerce-12th exam vs degree, freshers vs experienced);
  - 1 is the arts career-goal table, which keeps the IAS cell and has 7 "Varies by employer" cells.
- Every changed table has a uniform column count per row. Examples: MAHE [2x7], PCM/PCB [4x10], PGDM [3x11], B.Tech [2x11].
- Table counts dropped by 11 across the posts. That is 10 removals plus 1 conversion: the Bengaluru target-role table became a 7-item `<ul>`. This matches FIX-LOG.

### Tag balance

- Tag balance (div, table, tr, td, th, ul, li, p, h2, h3, caption, strong, a) is equal in 19 posts.
- online-mba-for-working-professionals-india has div 19/20 in source and 74/75 in the built `<article>`. This is identical at base, so it is pre-existing. Advisory A5.

### Captions and stale references

- Captions describe what each table now shows. Examples: "MAHE Online MBA specialisations and target sectors 2026", "B.Tech branches and top recruiters India 2026 (tier-1 college)".
- There are no "table below", "this table", "this matrix" or "following table" references. The count of the word "below" is identical before and after in every post, and every remaining instance is unrelated, such as percentile or tier wording.

### F1 (FAIL): headings left with only the neutral line

In these three sections the removed table was the whole section. Each now reads H2, then the neutral line, then the next H2:

- online-mba-for-working-professionals-india: "Working Professional Online MBA ROI Calculation 2026" (body 341 to 103 chars)
- distance-mba-bangalore-2026: "Bengaluru Specific Salary Uplift Data Across Industries" (562 to 103)
- distance-mba-meaning-what-is-it-2026: "Distance MBA Salary Outcomes by University Tier 2026" (494 to 103)

Each heading promises a calculation or data that no longer exists. Fix: delete the heading together with its line, or fold the line into the neighbouring section.

### C1 (condition): headings that name something now gone

These sections still have real prose, but the heading names a removed object or no longer matches the body:

- mba-scope-india-2026: "The Brand x Specialisation Matrix Most Blogs Skip". The matrix is gone.
- online-mba-salary-india-2026: "Salary By Specialization". The specialisation table is gone, and the body is now a photo, the neutral line and city prose.
- courses-after-12th-science-complete-list-2026: "Top Engineering Branches Salary Map India 2026 (PCM)". The table now has no salary column.
- commerce-jobs-list-salary-india-2026: "Chartered Accountant: The Real 10-Year Curve". The curve table is gone.
- online-mba-for-freshers-india-2026: "The Realistic ROI Math". No maths is left.
- cmat-exam-2026-guide-eligibility-pattern: "CMAT Career Outcomes by College Tier 2026". The tier table is gone.

Renaming an H2 is not a title or meta change and would not trip any gate.

## 3. Prose: PASS, with advisories

### Neutral line

The neutral line appears at most once per post. It is in 8 posts:

- working-professionals
- cmat
- online-mba-salary
- distance-mba-bangalore
- freshers
- mba-scope
- distance-meaning
- mba-full-form

In the built HTML it appears 16 times across those 8 pages, which is 8 visible plus 8 in the RSC payload. There are no pre-existing duplicates.

### commerce-jobs rewrites

- The ICAI sentence was "The 2025 ICAI member survey shows the following pay distribution". It is now "Pay depends heavily on where a CA works and for how long." This claims nothing.
- The NIRF sentence was "The 2025 NIRF placement reports show this clearly." It is now "NIRF publishes a median graduate salary for each ranked institute, so compare those figures for the institutes on your list." This is consistent with the NIRF median-salary rows in audits/verify/batch20a-salary-facts-2026-11-27.md.
- The fee clause now reads "its fees plus 2 years of foregone income make it a far larger investment". It carries no figures. The built page has 0 instances of "Rs 25 to 30 lakh".

### Sampled segments

I sampled more than 30 changed segments from the full 851-line lib/blog.ts diff, which I read in full. They include every added prose line, every caption, the role list and the trimmed sentences. All read cleanly. The only cosmetic issue is extra blank lines left after the removed tables in commerce-jobs, which do not render.

### Unsourced multipliers

All three are pre-existing: they appear in both the removed and the added line of the same hunk, so they count as advisory A1, not as a fabrication FAIL.

- commerce-jobs: "can be 5x at year 1 and 8x by year 5".
- freshers: "the upfront capital required is 15x to 25x higher". The Rs 55-100 LPA parenthetical was trimmed.
- mba-scope: "brand is a 2-3x multiplier. Specialisation is a 1.3-1.5x multiplier". The batch trimmed "of this matrix", so the claim now has no basis on the page at all. Its pairing with the C1 heading makes this the most exposed of the three.

## 4. Exposed fees: PASS

- 44 new placeholder cells, all counted:
  - "Not tracked (campus programme)": arts NLUs 8, PGDM institutes 10, computer courses 6, science PCM+PCB 18.
  - "Contact our counsellor": Online BCA and Coursera, 2.
  - The 6 placeholders already in mba-vs-pgdm at base were left alone.
- **Non-MATCH proof.** I mapped each of the 44 cells back to its base value by row label and header (NLSIU "Rs 14 to 18 lakh", IIM A "Rs 25-28 lakh", MBBS (Private) "Rs 50 lakh to 2 Cr-plus" and so on). I injected those values into a scratch copy of the staged tip and ran check-blog-fees. It FAILS by exactly 44: arts +8, pgdm +10, computer +8, science +18. So all 44 are unverified, and none is a MATCH. None names a lib/data.ts university record.
- **Fee baseline.** blog-fees went 1948 to 1945. Per slug, mba-after-engineering went 6 to 5 and commerce-jobs 5 to 3. Both drops come from removed salary figures written as "Rs X L" and "Rs 1.5 Cr", which the fee scanner had been counting.
- `data/blog-fee-allowlist.json` is unchanged (0-line diff).

## 5. What stays: PASS, advisory A2

- The banking-exam table in career-after-12th-commerce (SBI PO, IBPS PO, IBPS Clerk, RBI B, SEBI A, NABARD A) is byte-identical to base.
- The arts IAS cell "₹56K/month (IAS)" and the prose "Rs 56,100 per month" are kept.
- Neither has a source row in audits/verify/; I searched for IBPS, SBI PO, NABARD, RBI Grade, 7th CPC, pay matrix and 56,100.
- The IAS figure matches the 7th CPC Level 10 pay as the site states it elsewhere.
- The banking table's "Year 10 salary" column and "20 to 30 percent higher" are projections, not regulator pay scales.
- Class 20e advisory: source both from ugc.gov.in-equivalent government notifications (IBPS/RBI/SEBI/NABARD/DoPT) or treat the Year 10 column as a role table in a later chunk.

## 6. Salary baseline: PASS

check-blog-salaries run from the branch:

| Tree | Result |
|---|---|
| base (33bae44) | "OK (2336 salary figures, baseline 2336)" |
| tip (3bc34bc) | "OK (1916 salary figures, baseline 1916)", self-test OK (7 cases) |

My independent recount used the regex extracted from the branch's script and self-tested. It gives a drop of exactly 420.

Per-post counts match the committed baseline in 19 of 20:

| Post | Base | Tip |
|---|---|---|
| online-mba-for-working-professionals-india | 20 | 11 |
| mahe-online-mba-review-2026 | 17 | 5 |
| career-after-12th-arts | 35 | 20 |
| best-mba-specialization | 44 | 20 |
| career-after-12th-commerce | 58 | 32 |
| mat-exam | 14 | 4 |
| cmat-exam | 23 | 4 |
| mba-entrance-exams | 8 | 0 (key removed) |
| mba-vs-pgdm | 18 | 8 |
| online-mba-salary | 86 | 46 |
| online-mba-pune | 6 | 1 |
| mba-after-engineering | 39 | 21 |
| distance-mba-bangalore | 60 | 19 |
| online-mba-for-freshers | 28 | 3 |
| distance-mba-meaning | 16 | 4 |
| best-computer-courses | 32 | 16 |
| courses-after-12th-science | 53 | 14 |
| commerce-jobs-list | 69 | 36 |
| mba-full-form | 42 | 29 |

For mba-scope I count 68 to 23 and the baseline says 69 to 24. The drop is the same (45), so the difference is in my FAQ-escaping, not in the branch.

All 20 posts carry updatedAt 2026-11-27, and check-blog-updated-at says "ok (20 post(s) with content changes, all dated)".

## 7. Damage and gates: PASS

- **Build.** Base and tip both exit 0.
- **Page list.** 2335 HTML pages in both, identical list.
- **Normalised HTML diff.** 36 pages differ: the 20 posts, /blog, /blog/page/2-12, /blog/write, and 3 MBA hubs (amity, manipal-jaipur, nmims). The 16 non-post pages differ only in chunk ids and hashes ("8182" to "3225", page-chunk split points). Their byte length is identical and their visible text and head are unchanged.
- **Head of the 20 posts.**
  - title, description, canonical, robots, og:title and og:description are unchanged.
  - article:modified_time moves to 2026-11-27 on 15 posts; the other 5 were already dated 27 Nov.
- **JSON-LD.**
  - Every block on all 20 pages parses.
  - There are 0 `undefined`/`NaN`.
  - The only changed field is `dateModified`.
- **CRLF.** Each of the 4 files has 0 CR at both commits, so it is LF-only throughout.
- **Pre-commit.** I applied `git diff --binary 33bae44 3bc34bc` with `--index` to a clean 33bae44 tree, which staged exactly 4 files, then ran `sh .husky/pre-commit`. The result was "all checks passed", with:
  - check-fee-baseline 205
  - check-blog-fees 1945
  - check-em-dash-baseline 227
  - check-blog-salaries 1916
  - protected pages OK
  - string-truncation "no new truncated strings"
- **NOTE.** check-nirf-category prints a NOTE about the MAHE meta (TAPMI Management #39). The meta is unchanged in this batch, so it is not caused by it.
- **lib/blog.ts.** I read every hunk. Nothing outside the 20 posts' content and updatedAt changed.

## Advisories (not blocking)

- **A1. Pre-existing unsourced multipliers.** "5x/8x" (commerce-jobs), "15x to 25x" (freshers), "2-3x / 1.3-1.5x" (mba-scope). The mba-scope one is now orphaned from its removed matrix.
- **A2. Class 20e government pay figures (section 5).** The banking-exam table and the IAS figures have no audits/verify source row.
- **A3. commerce-jobs byline still claims sources.**
  - The byline reads: "Salary ranges sourced from Indian Staffing Federation 2026 report, NIRF 2024 placement disclosures, IBPS and RBI 2025 notifications, and ICAI member survey 2025". The intro also promises "sourced salary data".
  - The batch removed the very sentences because the tables did not match those sources, so the byline is now less supported than before.
  - Also pre-existing and unsourced: "ICAI 2024 pass rate data ... median of 4.5 years" and "About 60 percent ... drop out".
- **A4. Salary-gate blind spot.**
  - mba-full-form keeps a "Salary by Specialization" table. Its unit is only in the header ("Entry Level (LPA)", "Mid-Career (LPA)"), and its cells are bare numbers ("5 - 8", "12 - 25").
  - SALARY_FIGURE needs the unit in the same string, so these 10 figures were never counted in 2336/1916 and never entered any chunk's scope.
  - The new neutral line sits directly above this table, which reads oddly.
  - Recommend extending the detector to header-unit tables. Inject this table as a known positive first.
- **A5. Pre-existing unclosed div** in online-mba-for-working-professionals-india (19/20 in source, identical at base).
- **A6. Pre-existing city medians.** online-mba-salary keeps "Rs 12 LPA median in Mumbai versus Rs 8 LPA in Hyderabad". It is prose, so it belongs to another chunk.

## Cleanup

- Removed the scratch worktrees b22base, b22tip and b22stage: junctions first, then `git worktree remove --force` and `git worktree prune`.
- Main node_modules is intact (417 entries).
- Ports 3941 and 3942 are free; no server was started.
- No site edits, commits or pushes. The only write is this file.
