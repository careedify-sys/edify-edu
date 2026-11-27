# QA pre-merge rerun 2: B3 batch 22 round 3

- Commit: 21d475a on fix/b3-batch-22 (parent 7efc2cc, base 33bae44).
- Checked by: qa-checker, 2026-11-27.
- Method:
  - Scratch worktrees at 33bae44 and 21d475a, each with a full `npm run build` (both exit 0).
  - The 33bae44..21d475a patch staged on a clean tree, then the real pre-commit run on it.
  - A whole-site built-HTML diff.
  - My own source-claim sweep, run at base and tip.
  - I read the full 7efc2cc..21d475a diff (lib/blog.ts, salary baseline, FIX-LOG).

## Verdict: PASS, with one decision for the main session (D1)

- Every requested check passes.
- The body copy of the 20 posts no longer credits any source for a salary figure.
- No body line points at removed salary content.
- D1 is not a body defect. Three posts' seoTitle or metaDescription still promise content that batch 22 removed, and fixing that needs a title or meta change, which this batch is barred from making. See D1.

## F2: PASS

- **courses-after-12th-science:** the callout now reads "Verify before applying: Actual outcomes depend on college tier, internship plus project portfolio, and skill stacking."
- **mba-after-engineering:** the callout now reads "Verify before applying: Actual outcomes depend on undergraduate college tier, MBA programme rank, internship plus capstone quality, and active job-search effort."
- **best-computer-courses:** the callout now reads "Verify before paying: Talk to our counsellor for your intake's fee. Actual outcomes depend on ...". The table above it has a Fees column, so the fee half fits.

## Source-claim sweep: PASS, 0 salary-source claims in body

- **Method.**
  - I split every field of the 20 posts (content, faqs, title, seoTitle, h1Title, metaDescription) into sentences.
  - I matched each sentence against: NIRF, NASSCOM, AICTE, LinkedIn, Naukri, survey, placement reports/data/disclosures, hiring data, medians from, ISF/Staffing Federation, ICAI, sourced, according to, data shows, "shows the following", table below, matrix, salary map, career services data, Glassdoor, AmbitionBox, Payscale, Job Speak.
- **Hit counts.**
  - Base 33bae44: 181 hits.
  - Tip 21d475a: 153 hits.
  - No hit at tip is new text. The hits that appear "new" in a diff are table cells merged into the same sentence.
- **I read all 153 tip hits. None credits a source for a salary figure. They fall into these groups:**
  - NIRF ranks with a category.
  - AICTE regulatory facts.
  - "Use LinkedIn or Naukri to apply" advice.
  - MAHE's own learner survey (satisfaction, not salary).
  - The disclaimer "Salary figures are indicative ranges, not survey results".
  - Method pointers: "NIRF publishes a median graduate salary for each ranked institute", "NIRF placement reports apply mostly to campus PGP cohorts", "Use Glassdoor, Naukri, AmbitionBox".
  - Sourced bylines in distance-mba-meaning (UGC-DEB, NAAC) and mba-vs-pgdm (UGC, AICTE).
- **Removed at tip, confirmed absent:**
  - the working-professionals byline (placement reports, Naukri Job Speak, alumni data);
  - the mba-scope byline (NIRF, NASSCOM, LinkedIn, Naukri), its FAQ medians "Rs 16.5 LPA / Rs 6.5 LPA", "NIRF data showing 35 percent", and "with sourced 2026 hiring data";
  - online-mba-salary "based on placement data plus Naukri analytics";
  - distance-mba-meaning "from university career services data and LinkedIn salary reports".
- **Lines pointing to removed content in the body: 0.**
  - "matrix" survives only in mba-after-engineering ("Best-Fit Matrix", whose branch-to-spec table still exists) and in freshers ("specialisation-by-stream matrix", whose background-to-spec table still exists).
  - "salary map" survives only in head fields (see D1).

## Advisories from round 2: all closed

**career-after-12th-commerce**
- The FAQ's "10 to 15 percent", "4.5 to 5 years" and "About 60 percent" are gone.
- The CA, CS and CMA pass-rate list is deleted.
- The Honest Gaps "ICAI 2025 ... 12 percent" and "8 to 18 percent" are gone.
- "Salary ranges shown are medians from 2024-25 data" now reads "Salary ranges are indicative, and individual pay varies widely."
- The post has 0 ICAI mentions.

**commerce-jobs**
- The H2s are now "MBA Finance: Why the Brand Matters" and "How Your City Changes the Picture".

**mba-scope and working-professionals bylines**
- Both are now name and date only.

**Headings renamed in this round, each checked against its section**

| Post | New H2 | Section now holds |
|---|---|---|
| mahe | "Specialisations and Recruiters" | spec and recruiter table |
| mba-entrance | "Exam to College Tier Map" | exam to tier table |
| online-mba-salary | "Hiring Sectors by City" | city to sectors table |
| online-mba-salary | "Role Trajectory" | year-to-role table |
| pune | "Sector-Wise Employer Map" | sector and employer table |
| bangalore | "Realistic Role Moves" | pre/post role table |
| best-computer | "Duration and Fees" | Course / Duration / Fees |
| best-mba-spec | "Ranked by Demand" | Specialisation / Demand table |

For best-mba-spec "Ranked by Demand", see A3 below.

## Regression and gates: PASS

**Pages and head**
- The page list is the same 2335 pages at base and at tip.
- The normalised diff shows 36 pages: the 20 posts plus 16 pages that differ only in chunk names. That set is visible on 20 pages.
- Every head change on the 20 posts is `article:modified_time` (30 tags). No title or description changed on any page.

**JSON-LD and tags**
- JSON-LD parses on all 2335 tip pages, with 0 undefined and 0 NaN.
- Tag balance did not change on any page. The pre-existing working-professionals div 74/75 is unchanged.

**Line endings and dates**
- No CR at either end of the 3 changed files.
- updatedAt is already 2026-11-27 on every edited post, and check-blog-updated-at reports 20 posts, all dated.

**Staged pre-commit**
- Staged 33bae44..21d475a (exactly 4 files): "all checks passed", exit 0.

| Gate | Result |
|---|---|
| fee | 205 |
| blog-fees | 1945 |
| em-dash | 227 |
| salary | 1913 (mba-scope 24 → 22, the 2 FAQ medians) |
| protected-pages | 8/8 |
| string-truncation | no new |
| check-nirf-category | OK |
| check-hub-fee-text | 0 |

- No new number appears in any added line (every number in a + line also appears in a − line). There are no em dashes and no banned words.

## D1 (decision for the main session): head fields still promise removed content

These fields are unchanged by design ("No title, seoTitle, h1Title or metaDescription changed"), but batch 22 removed what they describe:

| Post | Field | Text | What was removed |
|---|---|---|---|
| mba-scope-india-2026 | seoTitle | "MBA Scope India 2026: Sector Hiring Data and Brand x Spec Salary Map" | The matrix (round 1) |
| mba-scope-india-2026 | meta | "... brand x specialisation salary matrix ..." | The matrix (round 1) |
| commerce-jobs-list-salary-india-2026 | seoTitle | "Commerce Jobs and Salary India 2026: 10-Year Career Curve" | The CA curve and MBA Finance tier tables |
| online-mba-for-freshers-india-2026 | seoTitle | "Real ROI vs Work-Ex Wait" | The ROI table |
| online-mba-for-freshers-india-2026 | meta | "ROI math vs waiting" | The ROI table |

- None of these posts is frozen or protected.
- The mba-scope one is the clearest: a searcher is promised a salary matrix that is not on the page.
- This needs a ruling on whether batch 22 may edit these seoTitle and meta fields. Otherwise, log it as accepted and queue it. It is not a QA fail of the body copy.

## Advisories (not blocking)

**A1. Unapproved sources for non-salary hiring statistics**

These are pre-existing and outside the salary scope; the engineer disclosed the mba-scope ones.

- **mba-scope:** cites NASSCOM, the LinkedIn India Hiring Index and a "Naukri.com 2025 HR survey of 1,200 hiring managers" for:
  - 18 percent YoY;
  - 28 vs 3 percent;
  - 78 percent acceptance;
  - 40 percent YoY.
- **courses-after-12th-science:** "One thing worth knowing: MBA after engineering in India work in roles that do not require engineering skills, according to NASSCOM reports."
  - The sentence is broken: a statistic or subject looks to have been replaced by link text.
  - It cites an unapproved source.

**A2. NIRF ranks without a category in tables**

The online-mba-salary university CTC table prints "NMIMS Global Online (NIRF 24)" and "JAIN Online (NIRF 73)". Similar bare "NIRF 24" cells appear in mba-after-engineering and best-mba-specialization. These are pre-existing; they belong to batch 23's NIRF work.

**A3. best-mba-specialization heading does not match its table**

- "Ranked by Demand" sits over a Very High / High / Moderate table.
- The table is not sorted by demand.
- The ratings are unsourced.

Wording only.

## Cleanup

- Worktrees removed after their junctions.
- Main node_modules: 417 entries.
- Ports 3941 and 3942 free.
- No site edits, commits or pushes.
