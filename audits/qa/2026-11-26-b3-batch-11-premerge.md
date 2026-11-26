# QA: B3 batch 11 pre-merge (fix/b3-batch-11 at f6b90ca + 9d150ad)

- **Date:** 2026-11-26
- **Checker:** qa-checker (outsider; did not do the work)
- **Branch:** fix/b3-batch-11, two commits (f6b90ca, 9d150ad) on origin/main 41bb96f
- **Source checked against:** audits/verify/highest-package-2026-11-26.md (on the branch)
- **Untracked `.b8tmp/`:** ignored and not staged.

## Overall verdict: FAIL

Three findings block the merge: F1 in test 1, and F2 and F3 in test 2. All three are small edits to lib/blog.ts. There is also a FIX-LOG correction (N1, test 3). Tests 3 to 7 pass.

| Test | Result |
|---|---|
| 1. Highest-package (28 verify rows) | **FAIL (F1)**. All 28 rows were handled correctly. One remaining "16 LPA" hit is an unsourced university average and median claim. |
| 2. Amity "450+ hiring partners" | **FAIL (F2, F3)** |
| 3. Placement table | PASS, plus FIX-LOG correction N1 |
| 4. NMIMS and Amity average-package deletions | PASS |
| 5. IGNOU emiFrom 0 | PASS |
| 6. JAIN and LPU coupon records | PASS |
| 7. Blog gates and damage | PASS |

## Method

**Builds**
- Branch build: BUILD_ID 16:15:24, after the 9d150ad commit (16:12:24). It is fresh.
- Base build: 41bb96f, built clean in a scratch worktree. Exit 0, 2360/2360 pages.

**Comparison**
- All 2,335 prerendered pages were compared: visible text, JSON-LD and meta.
- /programs/mba was fetched from `next start`: base on port 3131, branch on 3132. I did not touch 3918. I stopped only my own two PIDs (24956 and 37520).
- Visible text changed on 19 pages: the 9 blog posts, 2 IGNOU compare pages, /fees, /universities, and 6 IGNOU profile and hub pages.
- JSON-LD changed on 13 pages. Meta changed on 0.

**Facts**
- I compared BLOG_POSTS between the two commits through tsx.
- Fees came from getExactFee and the formatExactFee helpers.
- I fetched the Amity Online MBA portal (amityonline.com/master-of-business-administration-online) to check the scope of the "450+" figure.
- Every detector found its target on base before a 0 on the branch was trusted.

## Test 1: Highest-package. FAIL (F1)

### All 28 verify rows: the action matches the verdict

| Row(s) | Verdict | What happened | Visible count, base to branch |
|---|---|---|---|
| 1, IGNOU "Rs 15 LPA across all disciplines" | NOT FOUND | Deleted. The drive-roles sentence before it is intact. | 1 to 0 |
| 2, LPU ₹49.4 LPA | CAMPUS-ONLY | Kept: "highest package ₹49.4 LPA in 2025. That figure relates to the full-time on-campus cohort, not the online program." | "10.23" 1 to 0 |
| 3, LPU ₹11.6 LPA | NOT FOUND | Deleted | 1 to 0 |
| 4, Amity ₹26.30 table row | CAMPUS-ONLY | Label now reads "MBA Highest Package (Amity Business School Noida campus, class of 2022-24)" | "class of 2022-24" 0 to 2 |
| 5, Amity ₹26.30 sentence | CAMPUS-ONLY | Now reads "highest CTC (Amity Business School Noida campus MBA, class of 2022-24)" | (counted with row 4) |
| 6-8, Amity BBA ₹16 LPA, "own published data", ₹12-16 LPA | NOT FOUND | Deleted from the FAQ, the intro and the body | "own published data" 2 to 0 |
| 9-11, NMIMS ₹16-20 and Amity ₹16 | NOT FOUND | Deleted (best-online-mba FAQ and body) | "16-20 LPA" 3 to 0 |
| 12-14, 23-24, Amity ₹16 | NOT FOUND | Deleted (placement post FAQ, TL;DR, Amity section) | see total below |
| 15-22, Highest Reported cells | NOT FOUND | The whole column was deleted (see test 3) | "Highest Reported" 1 to 0 |
| 25, "Highest packages Rs 30-50 / Rs 14-20 LPA" row | NOT FOUND | Row deleted | "Rs 14-20 LPA" 1 to 0 |
| 26, JAIN ₹42 LPA | CAMPUS-ONLY | Deleted. The answer now reads "...Career switchers see modest early-stage jumps. Realistic working-professional outcomes depend more on...". | JAIN "42 LPA" 1 visible and 1 LD to 0 |
| 27-28, XLRI ₹75 LPA and ₹29-31 LPA | MISMATCH | Deleted, as the verify sheet allowed ("or delete"). The FAQ now says the reports "cover the residential 2-year PGDM". | "75 LPA" and "29-31 LPA" 0 |

- Overall, "₹16 LPA" went from 4 visible hits (2 LD) to 1, and "Rs 16 LPA" from 7 (2 LD) to 1.

### Hits left on purpose

| Hit | Location | Judgement |
|---|---|---|
| "Rs 16 LPA" | distance-mba-chennai-2026, cost-of-living example | Generic, not a claim about any university. OK. |
| "₹16 LPA" | imt-ghaziabad-online-mba-review-2026 | **F1, see below.** |
| "Rs 15 LPA" (7 hits) | ROI and career-profile examples, e.g. "Pre-MBA Rs 15 LPA tech lead", "Working at Rs 15 LPA" | Generic. OK. |
| "42 LPA" (11 hits) | Generic salary or tier tables, and an "Assume" ROI scenario | Not university highest or average claims. Two programme-specific ones are listed under A1. OK. |
| "14-20 LPA" (1 hit) | online-mba-logistics-management, "a typical route... reaches ₹14-20 LPA" | Generic career path. OK. |

### F1: IMT average and median package, unsourced

**Location:** lib/blog.ts, `imt-ghaziabad-online-mba-review-2026`.

**The claims**
- Line 37884 (body): "The programme reports an average package of around ₹17.35 LPA and median around ₹16 LPA for the 2021-23 batch (per published data), but these figures should be read with caveats."
- Line 37744 (FAQ, also in FAQPage LD): "Reported average packages are around ₹17.35 LPA, but these figures likely reflect..."
- Line 37888: "The IMT Ghaziabad campus PGDM (different programme) has stronger placement data with average packages ₹16+ LPA and top recruiters like McKinsey, Bain, BCG, Deloitte."

**Why it fails**
- These are university-specific average and median package claims.
- They are attributed to "published data" for the CDL (online) programme.
- No audits/verify row exists for them; there is no IMT file in audits/verify.
- This is the same defect as XLRI rows 27-28: a residential figure read as an online one.
- The engineer calls it "another university's median, not highest-package claims", but the test covers average claims too.

**Fix** (all in lib/blog.ts)
- **Line 37884:** delete the sentence "The programme reports an average package ... should be read with caveats." The next paragraph ("Most CDL students are working professionals...") still reads correctly after the deletion. In it, also change "The reported salary figures likely reflect" to "Salary outcomes likely reflect".
- **Line 37744 (FAQ):** delete "Reported average packages are around ₹17.35 LPA, but these figures likely reflect a mix of post-promotion salaries and lateral-move outcomes for working professionals rather than fresh placements." Keep "Realistic outcome: ...".
- **Line 37888:** change "has stronger placement data with average packages ₹16+ LPA and top recruiters like McKinsey, Bain, BCG, Deloitte" to "runs on-campus placements". The recruiter list is also unsourced.
- **Updates:** bump that post's updatedAt and re-run check-blog-fees.
- **Alternative:** add an audits/verify row quoting IMT's official report, scoped to the right programme and batch.

## Test 2: Amity "450+ hiring partners". FAIL (F2, F3)

**Source**
- The amityonline.com Online MBA page shows "450+ Hiring Partners" in its header stats.
- The page does not say whether the figure is programme-specific, university-wide or campus-inclusive.
- Beside it, the page lists "1,00,000+ Job opportunities created".
- The verify sheet (row 6) records the same figure on the BBA page.

**The 7 replacements**

| # | Location | Context | Result |
|---|---|---|---|
| 1 | amity-online-bba-review FAQ | "Amity Online runs a placement cell for online students and lists 450+ hiring partners. Its BBA page gives no placement package figure..." | OK |
| 2 | amity-online-bba-review body | "Internships through Amity's network of 450+ hiring partners" | OK, with advisory A2 |
| 3 | best-online-mba-colleges FAQ | "Amity Online lists 450+ hiring partners." | OK |
| 4 | online-mba-with-placement FAQ | "Amity Online lists 450+ hiring partners and delivers consistent placement assistance." | OK |
| 5 | online-mba-with-placement TL;DR | "Amity Online (450+ hiring partners)" | OK |
| 6 | online-mba-with-placement Amity section | "Amity Online lists 450+ hiring partners and offers many specialisations." | OK |
| 7 | amity-online-mba-review, line 23933 | see F2 | **F2** |

**MCA post:** in online-mca-amity-vs-lpu-2026 the "500+" was deleted, and the sentence now ends "...for online students." OK.

### F2: the online portal figure is described as campus-inclusive

**Location:** lib/blog.ts:23933, amity-online-mba-review-2026.

**Current text:** "The placement numbers you see on their website (450+ hiring partners, 1,00,000+ job offers lifetime) are university-wide figures that include campus programmes."

**Why it fails**
- The 450+ comes from the Online MBA page, which does not say the figure is university-wide or that it includes campus programmes.
- So the replacement now sits inside a campus-inclusive claim that the source does not make.
- The portal's own label for the other figure is "Job opportunities created", not "job offers lifetime".

**Fix:** replace the sentence with: "The placement numbers on Amity Online's MBA page (450+ hiring partners, 1,00,000+ job opportunities created) do not say which programmes or years they cover." Keep "They are not independently audited."

### F3: an Amity "500+" was missed in a post this batch edited

**Location:** lib/blog.ts:37265, online-mba-with-placement-india-2026, FAQ "Which online MBA universities have actual campus placement drives?".

**Current text:** "Amity Online runs structured placement drives through its 500+ industry partner network."

**Why it fails**
- It renders visibly and in the FAQPage LD.
- It contradicts "450+" in the same post's TL;DR, Amity section and another FAQ.
- The FIX-LOG says Amity "500+" went from 8 to 0. In fact 10 "500+" remain in lib/blog.ts, and this one is Amity's.

**Fix:** change "its 500+ industry partner network" to "its 450+ hiring partners".

### Note for the next batch (not this one's 9 posts)

- amity-online-mca-fees-review FAQ still says "500+ claimed hiring partners..." for Amity MCA. This is the MCA programme, which the engineer chose not to check in the other MCA post.
- The online-mba-with-placement quote "500+ industry partners" (line 37469) is a generic illustration. OK.

## Test 3: Placement table. PASS, plus FIX-LOG correction N1

**The tier is defined, not a package ranking**
- The post defines Tier 1-4 directly above the table, under H3s, by support type: active drives, recruiter network, career services only, minimal.
- Every table tier matches those lists:
  - NMIMS, Symbiosis, Amity and CU are Tier 1.
  - MUJ, BITS and MAHE are Tier 2.
  - JAIN appears in both the Tier 2 and Tier 3 lists, hence "Tier 2-3".
  - LPU and UPES are Tier 3.

**The table is well-formed**
- Header has 3 th.
- 10 rows, each with 3 td.
- Tags are balanced on the page.
- tr went from 28 to 27 because the campus-vs-online "Highest packages" row was deleted.

**H3 fees match getExactFee**

| H3 | getExactFee |
|---|---|
| NMIMS "Rs 2.20 lakh" | top of ₹1,96,000–₹2,20,000 |
| Symbiosis "Rs 3.15 lakh net" | floor of ₹3,15,000–₹3,70,000 |
| Amity "Rs 2.07 lakh" | floor of ₹2,07,000–₹2,25,000 |
| CU "Rs 1.75 lakh net" | ₹1,75,125 mode |
| MUJ "Rs 1.56-1.84 lakh" | ₹1,56,400 net / ₹1,84,000 list |

- check-blog-fees passes: 1956 unverified, unchanged from baseline. The slug is at baseline 2.

**N1 (FIX-LOG correction)**
- The log says "Every fee still appears in its H3 below". Only 5 of the 10 universities have an H3.
- BITS 3.12, MAHE 2.92, JAIN, LPU 1.46 and UPES 1.75 now appear nowhere in the post: each went from 1 hit to 0.
- That loses information but invents nothing, so it does not fail the test. The FIX-LOG line should be corrected.
- The old JAIN "1.96-2.98" cell was wrong anyway.

**Callout and XLRI rewrite**
- The callout now reads "Placement data is self-reported by universities. Ask for an online MBA outcome figure in writing, and speak to recent alumni on LinkedIn before treating placement claims as guaranteed outcomes." It is clean.
- "Figures above" is gone from this post. The one remaining hit is in best-online-mba-colleges and is a different, fee-related line.
- XLRI body: "...so their salary gains reflect post-MBA career progression..." reads well. The FAQ answer is clean.

**Keep the table or delete it?**
- Keeping it does not mislead: the tiers are defined in the post itself and carry no package figures.
- See A3 for the Rank column.

## Test 4: NMIMS and Amity average-package deletions. PASS

- Placement FAQ: "...depending on prior experience and university brand. Working professionals with 2-5 years..." The space and the sentence are intact.
- Amity section: "...heavily distributed across the larger student base. International placement support is stronger..." Intact.
- best-online-mba (body and FAQ): the NMIMS sentences end cleanly. "Operations.</p>" closes the paragraph.
- Tags are balanced on all 9 posts. The LPU post's 130/131 div count is the same on base and was already there.

## Test 5: IGNOU emiFrom 0. PASS

**"₹400/mo" in the build**

| Where | Base | Branch |
|---|---|---|
| Raw prerendered HTML | 27 | 0 |
| .rsc | 10 | 0 |
| Visible text | 14 (10 pages) | 0 |
| LD | 3 | 0 |

- "₹400/month" in raw HTML went from 17 to 0.
- The 8 remaining "₹400" hits are unrelated: a Bharati Vidyapeeth ₹400 backlog fee and a GGSIPU BBA ₹400 one-time charge.
- /programs/mba from `next start` had no ₹400 on base either, and is identical on the branch (visible text and LD).

**/fees and compare pages**
- /fees IGNOU row: "₹10K – ₹66K Not published" (base "₹400/mo"), and on mobile "EMI from Not published".
- compare/ignou-vs-amity and compare/ignou-vs-lpu: "EMI from On request".
- /universities card: the EMI line is gone. IGNOU profile and MBA hub: "EMI from" and "EMI starts from ₹400/month" are gone, and the EMIPlans section is hidden. No heading is left orphaned.

**0 is the existing no-EMI convention**
- 27 fees-hub rows now carry emiFrom 0, all with emiStr "Not published".
- Every reader guards `> 0`: CompareClient, the compare pair page, UniversityCard, UniversityPageClient, FeeBreakdown, EMIPlans and display-guards.
- The one unguarded printer, EdifyRecommends.tsx:96, is imported nowhere.
- first-hand.ts holds no IGNOU record.
- "₹0/mo", "₹0/month" and "EMI ₹0" count 0 in raw HTML and .rsc.

## Test 6: JAIN and LPU coupon records. PASS

- **JAIN:** totalFee "₹1,60,000–₹2,98,000" equals formatExactFee(getExactFee); totalFeeNum is 160000.
- **LPU:** totalFee "₹2,00,000 list" equals formatExactFeeShort plus the default "list" label; the breakdown is list 200000 and net 146240-161600.
- Both finalFee values read "<fee> less up to Rs 5,000".
- The stackExamples now carry no derived figure.
- `couponCode: 'N/A'` appears only on ignou-online-mba-discount-coupon-2026 (lib/coupon-pages.ts:407). CouponPageCTA:24 is the only reader of totalFee; finalFee and stackExample have no visible reader.
- No coupon page's visible text or LD changed. check-coupon-claims passes.

## Test 7: Blog gates and damage. PASS

**Posts and fields**
- I compared BLOG_POSTS on both commits: 271 posts each.
- Exactly 9 posts changed, and each had its updatedAt bumped to 2026-11-26. No other post changed.
- title, seoTitle, metaDescription, h1Title, status and slug are unchanged on every post.
- Meta changed on 0 pages.

**Gates**
- `.husky/pre-commit` on a staged copy of 41bb96f..9d150ad: exit 0, "all checks passed". This includes:
  - check-protected-pages: "8 protected paths and 8 frozen posts".
  - check-blog-fees: "1956 unverified, unchanged from baseline".
  - check-coupon-claims.
- `git status` was identical before and after, so the hook changed no files.

**Damage**
- Same 2,335 pages on both builds.
- JSON-LD: 0 parse failures (including /programs/mba).
- "undefined" and "NaN" count 0.
- Tags are balanced on all 19 changed pages, apart from the LPU div count that was already there.
- FAQ parity: 154 entries on both builds. The 9 unmirrored entries on the IGNOU profile are identical on base.

**Diff review**
- I read the whole diff. New text adds only the scoped Amity label, "450+ hiring partners", "Not published" and "On request" for the EMI, and the coupon fees that match getExactFee.
- No new rank or superlative.

**Line endings**
- All 6 changed files are stored LF in git on both commits; working copies get CRLF only through `core.autocrlf=true`.
- No line-ending change. `--ignore-cr-at-eol` gives the same stat (+213/-54).

## Advisories (not blocking)

**A1. Programme-specific salary ranges left over**
- mba-international-online-global-programs-2026 "Career Outcomes by Programme Tier" gives unsourced per-programme salary ranges, e.g. "Warwick Distance Learning MBA: Rs 28 to 42 LPA".
- mba-fees-india-complete-guide-2026 has an "IIM A PGPX ... Year 3 CTC Rs 42 LPA" ROI scenario, framed as "Assume".
- Not average or highest claims by wording, so this batch did not fail them. Next batch.

**A2. Internships through hiring partners**
- The BBA body line "Internships through Amity's network of 450+ hiring partners" uses a hiring-partner count as an internship network.
- Suggest: "Internship and placement support (Amity lists 450+ hiring partners)".

**A3. Rank column**
- The table's Rank column (1-10) orders universities within the same tier (e.g. NMIMS 1 to CU 4, all Tier 1) with no stated basis.
- Consider dropping the Rank column, or retitling the heading "...Grouped by Tier".
- The tier text above the table also carries unsourced percentages: "30-50 percent of students participating in drives receive offers", "about 40-60 percent".

**A4. Other unsourced average claims still in edited posts**
- LPU review: "For the online cohort specifically, average salary packages range between ₹4–7 LPA".
- Amity MBA review: "MBA Average Package (2024) ₹7.35 LPA, 202 recruiters" and "Median ₹6.50 LPA". These may be in the same ABS report; verify and scope them like the ₹26.30.
- The engineer listed these.

**A5. NMIMS "strongest" claim**
- best-online-mba FAQ: "NMIMS Online reports the strongest placement support among UGC-DEB online MBA programmes."
- With the figures gone, nothing supports "reports the strongest". This was there before the batch.

## Cleanup

- I stopped both of my servers (ports 3131 and 3132).
- I removed scratch worktrees qab11base and qab11gates, each junction first (rmdir), then `git worktree prune`.
- 0 scratch worktrees remain registered. The main node_modules is intact.
- Scripts and logs: C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa11/
- No site edits, commits or pushes.
