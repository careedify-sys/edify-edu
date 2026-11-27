# QA pre-merge: B3 batch 24 (fix/b3-batch-24 @ 5432876, base 24663a8)

Date: 2026-11-27. Checker: qa-checker (outsider; did not do the work).

## Method

- **Builds:** fresh worktrees b24base (24663a8) and b24br (5432876). `next build` EXIT 0 on both; 2,335 pages each.
- **Gates:** worktree b24g at 24663a8 with 5432876 staged, running the real `.husky/pre-commit`.
- **Rendered output:** whole-site built-HTML diff.
- **Fee scan:** fee-scan row diff, base against tip (scanAllPosts, multiset by slug, raw figure and class).
- **Post checks:** structure, source-claim, ratio, pointer and anchor sweeps over all 29 edited posts, comparing base and tip.
- **Fee values:** getExactFee queried on the branch.

## Verdict: FAIL

Gates, scope, the MCA table, the KL fixes and the multiplier posts are clean. The salary chunk does not yet meet the batch 22/23 lessons the brief lists:

- source claims remain in chunk posts (F1);
- derived ROI and ratio figures remain (F2);
- one chunk post carries a salary meta that now advertises removed content (F3);
- one heading no longer describes its section (F4).

All four are text-only fixes in lib/blog.ts.

---

## Blocking

### F1. Salary-source claims left in chunk posts

- **mba-fees-india-complete-guide-2026:** "Median placement Rs 32 to 38 LPA (FT 2024 reports)" in the FMS paragraph. FT is not an approved source.
- **cyber-security-salary-india-2026-career-guide:** "Top Indian bug bounty hunters on HackerOne plus Bugcrowd report Rs 40 lakh to 2 crore annual earnings". This is the same class as the DSCI attribution the batch removed from the same post.
- **bsc-career-options-scope-salary-india-2026, Honest Gaps:**
  - "Stream-by-stream salary ranges shown are medians". This claims a median basis and points at the INR stream table, which this batch removed.
  - The same post also keeps "The UPSC 2024-25 topper analysis shows roughly 16 percent of successful candidates had a Science background". It is unsourced, though not a salary claim.

**Fix:** delete each claim or its attribution. In bsc-career, drop the "ranges shown are medians" sentence.

### F2. Unsourced ratios and derived ROI left in chunk posts

The batch removed the mba-fees "3-Year ROI Calculator" (Net ROI 500 percent) and the worked-example ROI table as derived ratios. It also removed the identical "30 to 40 percent lower" phrasing from mba-after-bsc and arts-stream. The same class survives here:

- **bsc-career:**
  - "career outcomes lag CS and Mathematics by 30 to 40 percent";
  - "The B.Sc + Online MBA ROI Math … Rs 25 to 40 lakh additional earnings over a 5-year horizon. ROI breakeven: Typically 10 to 18 months";
  - "A Rs 30K AWS certification adds Rs 2 to 4 LPA. The ROI math always favours certification spend."
- **mba-fees**, in the renamed "IIM Fees: Worth the Investment?" section and its neighbours:
  - "ROI breakeven within 2 to 4 years";
  - "Breakeven 3 to 5 years" and "4 to 6 years";
  - ISB "ROI breakeven: 3 to 5 years";
  - FMS "ROI breakeven within 9 to 14 months" and "Strongest fee-to-placement ratio";
  - "you are looking at 4 to 6 years just to break even".
- **llm-course-duration-fees-scope-india-2026:** the "LLM ROI Analysis 2026" block ("Breakeven 12-18 months", "18-24 months", "2-4 years", "breakeven 4 to 6 years").

FIX-LOG parks only the mba-fees "Payback Period Calculator" for a fee batch. These lines are the same derived-payback class and sit in posts this chunk owns.

**Fix:** delete them, or reword them without the ratio, as was done elsewhere in the batch.

### F3. A chunk post carries a salary meta, and the meta now describes removed content

The brief requires that no chunk post carry a salary meta.

- **data-science-salary-india-2026-scope-jobs.** Its metaDescription reads "25-40% GenAI/LLM premium, 2-3x product company gap, city multiplier", and its seoTitle is "… The GenAI Premium".
  - The batch removed "The Indian City Multiplier" section and every multiplier and percent premium in the body (29 ratio hits at base, 0 at tip).
  - So the snippet now promises figures the page no longer has.
  - FIX-LOG lists the meta as "out of bounds", but that is the reason the post should not be in this chunk.
- **llm.** Its meta "corporate law Rs 12L+ start" is a salary figure. The body still supports it, so this one is not a mismatch, but it breaks the same scope rule.

**Fix:** take data-science out of the chunk (revert its hunks and the matching baseline lines, so the ratchet stays consistent). Or hold it until the meta can change. Say in FIX-LOG what is decided for llm.

### F4. A heading no longer describes its section

- bsc-career's H2 "The 6 B.Sc Streams and Their Realistic Salary Curves" now holds only an image and two sentences ("B.Sc career outcomes vary sharply by stream. Salaries vary by employer …"). There are no streams and no curves.
- **Fix:** rename it, or merge the two sentences into the next section.
- Weaker cases, not blocking:
  - "BBA Salary in India 2026" now holds no salary figure; the role table sits under the h3 "Common Entry Roles".
  - "B.Tech Salary in India 2026" and "BSc Salary in India 2026" keep qualitative salary prose, so they still fit.

## Passed

### Gates

The real pre-commit passed on a staged 24663a8..5432876 tree (6 files): "all checks passed", EXIT 0.

| Gate | Result |
|---|---|
| fee baseline | 205 |
| em-dash | 227 |
| blog-fees | 1878 |
| check-blog-salaries, self-test | 23 cases |
| check-blog-salaries, main | 1530 |
| check-blog-salaries, ext | 47 |
| check-blog-updated-at | 29 posts, all dated |
| protected-pages | OK |
| check-nirf-category | OK, only the known frozen MAHE-meta NOTE |

### Blog-fees drop is genuine (the batch 23 F3 lesson)

- Unverified raw rows went from 2122 to 2111.
- 14 unverified rows were deleted from the text:
  - 6 old cells in the best-computer MCA table (5 MBA ranges plus IGNOU "Rs 36,000");
  - 5 bsc-full INR fee ranges;
  - KL "Rs 0.66 L";
  - 2 "Rs 25-plus lakh" lines.
- **0 rows were reclassified to NON_FEE, and 0 to MATCH.**
- 3 rows were gained: Amity ₹1,99,000, JAIN ₹1,30,000 and CU ₹1,55,000 in the MCA table. They are UNRESOLVED only because the scanner cannot resolve them. Each equals getExactFee for MCA.
- Net change is −11, which is exactly 1889 → 1878.
- The 438 NON_FEE rows that disappeared are LPA salary figures and the exposed campus or category fee cells. One MATCH row moved: SMU "Rs 1.10 lakh" became "₹1,10,000", still MATCH.

### Salary baseline

- 1902 → 1530: exactly the 20 chunk slugs change, by −372 in total, matching the FIX-LOG per-post list.
- Ext 65 → 47: bba drops by 18 to 0; online-mba-lpu-review keeps the LPU-fee residue of 1.

### Scope

- 6 files: lib/blog.ts, lib/content.ts, 3 baselines and FIX-LOG. Nothing in app/admin, app/api/cms or app/blog/write.
- No edited post is in FREEZE_SLUGS (the 8 frozen reviews), and check-protected-pages passes.
- The 20 posts match the FIX-LOG list.
- 29 posts are edited in total: the 20 chunk posts, the 7 multiplier posts, best-computer-courses and why-online-mba-fees-differ.

### Rendered output

- Same 2,335-page list.
- 30 pages changed visibly: 29 blog pages plus the online-mca mirror of the Amity MCA review.
- **0 title or meta changes on any page.** The mba-fees H2 rename did not touch the title, seoTitle, h1Title or meta.
- JSON-LD parses on every page.
- 0 undefined or NaN.
- 0 new tag imbalances.
- No new unmirrored FAQ answers. The one arts-stream LD flag predates this batch.
- CRLF is uniform in every file at both commits.
- 0 em dashes in added lines.

### Structure (chunk lessons that hold)

- 0 table rows with inconsistent column counts, at base or tip.
- No remaining bare-number salary table: the ext count is 1, which is a fee.
- No broken in-page anchors.
- No orphaned headings. The three heading-to-heading cases in cyber and llm hold SVG images, and predate this batch.
- The two new "The table below" pointers in career-after-mca point at tables that still exist.
- Renamed headings describe their content in every other case checked. Examples:
  - "Analyst or Scientist: Where the Gap Opens";
  - "Cyber Security Roles 2026";
  - "LLM Specialisations and Top Employers 2026";
  - "BSc Streams That Pair Best With an MBA 2026".

### Exposed fees

- **BITS "Rs 3.12L"** (best-online-mba, scenario table).
  - At base it was NON_FEE, exempt because LPA sat nearby.
  - With no university attributed to the row (it names NMIMS as the alternative), the scanner does not class it MATCH. The engineer reports it as UNRESOLVED.
  - The value is BITS's ₹3,12,400 rounded, and "₹3.12L" elsewhere in the same post is MATCH. Deleting it loses a correct figure but harms nothing.
- **"Rs 26 to 30 Lakh"** (mba-fees H2). It was NON_FEE at base. IIM fees are not in lib/data.ts, so it can never be MATCH. The title and meta are unchanged.

### mba-fees ROI calculator removal

- "The 3-Year ROI Calculator" and "Online MBA: The Math That Works …" (the worked-example table) are gone with their paragraphs.
- No anchor, TOC entry or "calculator" reference is left dangling. The intro's "payback math" is still served by the Payback Period Calculator section.

### Multipliers (item 2)

- All 7 posts have 0 "Nx" or percent-premium hits at the tip; the base had 1 to 17 per post.
- The rewritten sentences read cleanly. Examples:
  - "can add substantially to the cash component";
  - "at a much higher cost";
  - "tends to trail science and engineering graduates";
  - "Salary caveat: Numbers are indicative."
- The arts-stream table lost a column cleanly: the caption was renamed and every row is consistent.

### best-computer-courses MCA table (item 3)

- Every cell equals the formatExactFee(getExactFee(u, 'MCA')) value on the branch, with its label:

| University | Cell |
|---|---|
| MUJ | ₹1,64,000 list; ₹1,47,600 after 10% discount |
| Amity | ₹1,99,000 |
| JAIN | From ₹1,30,000 (from: true) |
| CU | ₹1,55,000 |
| LPU | ₹1,17,440 one-time; ₹1,30,000 semester-wise (₹32,500 × 4 semesters) |
| SMU | ₹1,10,000 |
| IGNOU | Contact our counsellor (getExactFee kind none) |

- The table is captioned "Top online MCA programmes May 2026".
- No MBA range is left in it (the old "Rs 1.60-2.98 lakh" and "Rs 1.56 to 1.84 lakh" are deleted).

### Non-IGNOU 66,000 (item 4)

- **KL:** mba-digital-marketing now shows "₹73,500" under a "Total fee" header in an MBA table. That equals getExactFee KL MBA (exact, 73,500). The NIRF "#26 (Univ)" cell matches data nirf 26.
- **why-online-mba-fees-differ:** "short by Rs 66,000" was a derived sum. The post's own figures give 3,70,000 + registration + application − 3,15,000, and no source states 66,000. Deleting it, together with the "entire fee of some other accredited online MBAs" comparison, is correct. The replacement sentence reads cleanly.
- **lib/content.ts KL MCA:** it now points to the counsellor, which is correct (getExactFee KL MCA is none). But nothing renders programOverview (no reader outside lib/content.ts, and no built page carries the old or new text), so this edit has no visible effect.

## Advisories (not blocking)

- **A1. Source claims in multiplier posts, outside the chunk but edited in this batch:**
  - mba-after-bsc H2 "BSc Plus MBA Salary Compounding Year-by-Year (edifyedu.in Cohort Data)";
  - mba-digital-marketing "Every salary range above is a 2025 to 2026 snapshot from edifyedu.in counsellor interviews". The batch removed the equivalent "counsellor alumni interactions" from arts-stream, and removed "(real numbers, named sources)" from this same post's H2;
  - mba-or-mca "78 percent … per NIRF 2024 placement data" and "7.7 percent annual growth per NASSCOM Tech Hiring Report".

  Queue these for those posts' salary chunk, or fix them in the round 2 pass.
- **A2. mba-fees, table against prose.** The category table now reads "Not tracked (campus programme)" or "Contact our counsellor" in all but one row. The prose below still quotes IIM, ISB and tier-2 tuition ("Fees Rs 20 to 24 lakh", "Rs 8 to 15 lakh tuition"), which reads as a contradiction. The meta still says "IIM Rs 27L, ISB Rs 45L" (meta is out of bounds).
- **A3.** mba-hr "Approximately 50-55 percent women in MBA HR cohorts vs 25-30 percent in MBA Finance" is an unsourced statistic, not a salary claim.
- **A4.** The cyber SVGs (blog10_cyber_roles_salary.svg and the experience charts) still carry salary numbers the text gate cannot see. FIX-LOG already discloses this.
- **A5.** The 3 correct MCA cells (Amity, JAIN, CU) now count as UNRESOLVED in blog-fees, because the scanner does not resolve the MCA programme for them. This is a scanner gap, not a content error.

## Re-run checklist

- **F1:** FT, HackerOne/Bugcrowd and "ranges shown are medians" are gone. Decide on the UPSC 16 percent line.
- **F2:** no breakeven, ROI-multiple or "N to M percent lower or lag" figure remains in bsc-career, mba-fees or llm.
- **F3:** data-science is out of the chunk or held; the llm decision is logged.
- **F4:** the bsc-career heading is renamed or merged.
- **Gates no higher than:** fee 205, blog-fees 1878, em-dash 227, salary 1530, ext 47.
- **Repeat the fee-row diff:** any drop must be deletions, not new NON_FEE exemptions.
