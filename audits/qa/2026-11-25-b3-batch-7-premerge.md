# QA: B3 batch 7 pre-merge (fix/b3-batch-7 at f251881)

Checked 2026-11-25 by an outside QA pass. No site edits, commits or pushes.

## Setup

- **Branch build:** engineer worktree `.claude/worktrees/agent-aa34374ceae7db9fe/.next`.
  - BUILD_ID was written 2026-11-25 17:03:29, after the f251881 commit at 16:59:02 +0530, so the build is fresh.
  - Build log: `BUILD EXIT 0`.
  - 2,335 HTML pages.
- **Base build:** the 6fc160b build in `.claude/worktrees/agent-a82595c19911dce4e/.next` (BUILD_ID 16:31:48, 2,335 pages). Its worktree HEAD is now ed620ce. I confirmed that `git diff 6fc160b ed620ce` touches only `audits/OPERATING-PLAN.md` and `audits/ranking-plan-tracker.md`, so the site code is identical.
- **Diff ed620ce..f251881:** 58 files.
  - app/compare/[pair]/pairs.ts
  - app/fees/page.tsx
  - lib/blog.ts
  - lib/content.ts
  - lib/coupon-pages.ts
  - lib/data.ts
  - lib/guides.ts
  - 48 lib/data/page-content JSON files
  - data/blog-fee-baseline.json
  - data/sitemap-lastmod.json
  - audits/FIX-LOG.md
- **Method:** whole-site comparison of visible text (after `</head>`, scripts and styles stripped), JSON-LD and meta between the two builds.
  - Each detector is a plain substring, and each one fired on base before I trusted a zero.
  - I also compared every changed BLOG_POSTS record via tsx import (base = ed620ce worktree, branch = staged f251881 worktree).
  - I read the page-content JSON diff field by field.

## Results

| Test | Result |
|---|---|
| 1. MUJ Coursera | **FAIL** (F2: 5 orphaned MUJ "global certification" claims) |
| 2. /fees chips | PASS |
| 3. lib/guides.ts pay claims | PASS (2 advisories) |
| 4. SMU stale MBA fee | **FAIL** (F1: 1,10,000 still on 4 published posts) |
| 5. "Rs 60,000 Cr" | PASS |
| 6. galgotiasonline.edu.in | PASS |
| 7. Damage | PASS |
| 8. Regression and gates | PASS |

**Overall: FAIL.** Fix F1 and F2, then re-run tests 1 and 4 plus `.husky/pre-commit`. Both fixes are deletions, so no new figures are needed.

---

### 1. MUJ Coursera: FAIL (F2)

Rendered counts, base vs branch, as pages/hits:

| Needle | Base visible | Base LD | Branch visible | Branch LD |
|---|---|---|---|---|
| "70% off" | 10p | 8p | 0 | 0 |
| "13,999" | 1p | 10p | 0 | 0 |
| "bundles free Coursera" | 1 | 1 | 0 | 0 |
| "Exclusive to MUJ" | 1 | – | 0 | – |
| "platform perks" | 1 | 2 | 0 | 0 |
| "Which includes Coursera" | 1 | 1 | 0 | 0 |
| "brand and perks" | 2 | 1 | 0 | 0 |
| "MUJ wins on brand, perks" | 1 | – | 0 | – |
| "Coursera-integrated" | 1 | – | 0 | – |

- "Coursera Plus" fell from 53 to 19 pages visible and from 23 to 9 pages in LD.
- I scanned every rendered page for "Coursera" within 200 characters of MUJ/Manipal University Jaipur that does not say optional or paid. No claim that MUJ includes, bundles or gives free Coursera remains. The 20 hits that are left are:
  - the new FAQ questions;
  - the "Is Coursera included...?" questions on the MUJ hub, which are answered No;
  - MAHE pages that mention MUJ, which are on the kept list;
  - top-free-online-mba-courses-2026 "Best paired with ... Coursera marketing", which is a column of free courses to pair with the degree, not a claim about MUJ.
- The new text renders and matches lib/data.ts:1639 MUJ `addOns` ("Optional, not included in the programme fee", Rs 3,999 for one year):
  - "optional paid add-on": 0 to 12 pages visible, 0 to 11 in LD.
  - "Is Coursera access included in the MUJ MBA fee?": 10 MUJ spec pages, visible and FAQPage LD.
  - The coupon FAQ "Does the MUJ fee include Coursera access? No. ..." renders in both visible text and LD.
  - The MUJ review sem-card "Optional paid add-on" renders.
  - The /compare "What add-on learning does each offer?" and "spec variety vs the Manipal group brand" lines render.
- **FAQ parity:** 307 FAQPage entries on the changed pages, both base and branch. None is empty, and every LD question and answer is mirrored in the page payload. This holds both before and after the change.
- No figures were orphaned by the "Rs 13,999" / "70% off" / "Coursera Plus" removals: each TLDR, FAQ answer and fees paragraph now ends on a full sentence.

**F2. Five MUJ "global certification" sentences were orphaned.** Each one only made sense because of the Coursera clause in front of it, which this batch deleted (or, in the LPU files, which this batch removed from the same paragraph). Each now reads as an unsourced claim that the MUJ programme itself carries global certifications. Three of them render in the branch build. The two LPU IT/SCM pages are not prerendered and render on demand.

| File:line (f251881) | Text now on the page |
|---|---|
| lib/data/page-content/jain-university-online-mba-business-intelligence-and-analytics.json:78 | "MUJ Business Analytics adds global certification recognition." |
| lib/data/page-content/jain-university-online-mba-marketing.json:78 | "MUJ Marketing adds global Google and Meta certification pathways." |
| lib/data/page-content/lovely-professional-university-online-mba-logistics-supply-chain-management.json:74 | "MUJ Supply Chain includes global certification content." |
| lib/data/page-content/lovely-professional-university-online-mba-digital-marketing.json:74 | "Both are comparable options; MUJ offers more global certification weight while LPU is more affordable with zero-cost EMI." |
| lib/data/page-content/lovely-professional-university-online-mba-information-technology.json:70 | "Both are comparable options; MUJ adds global certification weight while LPU is more affordable." |

The two LPU sentences have a second problem: "LPU is more affordable" is false on lib/data.ts at both ends of the range. LPU is 1,61,600 to 2,00,000 and MUJ is 1,56,400 to 1,84,000. This is the same class as the batch 6 R2 fee-comparison findings.

**Exact fix (deletions only):**
- jain BI json:78: delete the sentence "MUJ Business Analytics adds global certification recognition. " so the paragraph runs "...Rs 1,56,400-1,84,000. JAIN BI and Analytics includes...".
- jain marketing json:78: delete "MUJ Marketing adds global Google and Meta certification pathways. ".
- LPU logistics json:74: delete "MUJ Supply Chain includes global certification content. ".
- LPU digital-marketing json:74: replace "Both are comparable options; MUJ offers more global certification weight while LPU is more affordable with zero-cost EMI." with "Both are comparable options." The LPU zero-cost EMI fact appears elsewhere on the page and is not lost.
- LPU information-technology json:70: replace "Both are comparable options; MUJ adds global certification weight while LPU is more affordable." with "Both are comparable options."
- Bump the 5 URLs in data/sitemap-lastmod.json to 2026-11-25 if check-sitemap-lastmod asks for it.

Advisories (do not block):
- **A1.** These are kept by design and listed for Rishi:
  - MAHE "Coursera Plus bundled free" (MAHE spec pages and FAQ LD "Coursera Plus gives free access").
  - SRM Sikkim "Coursera certifications bundled" (online-mba-northeast-india-2026).
  - Amity "Coursera plus IBM".
  - lib/content.ts MUJ MCA "Coursera Certifications (₹3,999)", which agrees with the add-on price.
- **A2.** This one is not on the engineer's kept list: LPU "includes Coursera Plus" / "Coursera Plus bundle (which includes Google and Meta certifications)". It renders on 3 DPU spec pages (business-analytics, finance, hospital-administration) and 3 Uttaranchal spec pages (digital-marketing, hr-management, international-business). lib/data.ts holds no LPU Coursera record. Queue it with the MAHE/SRM question for Rishi.
- **A3.** Four /compare FAQ questions still read "Does MUJ include Coursera Plus...?" / "Do both include Coursera Plus?" (amity-vs-manipal-jaipur, lpu-vs-manipal-jaipur, manipal-jaipur-vs-chandigarh-mca, manipal-jaipur-vs-manipal-mahe). Each answer says it is an optional add-on, so this is a wording cleanup only.
- **A4.** MUJ hub JSON hero/about/classes/fees/admission/comparisons/honestVerdict and the MUJ spec `fees.body` edits do not show in the prerendered hub HTML, which is byte-identical in visible text. Those fields are not rendered by the current templates. The edits are harmless and make the data correct for when they are rendered.

### 2. /fees: PASS

- Chip row on base: "₹60K lowest fee · ₹3.70L highest fee · 54 NAAC A++ universities · Free counselling".
- Chip row on branch: "54 NAAC A++ universities · Free counselling →". The flex container is intact.
- "highest fee" went from 1 to 0 visible.
- "lowest fee" went from 2 to 1 visible. The one left is the FAQ question "How do I find the lowest fee", which is process advice with no figure.
- The remaining "₹60K" (132 hits) and "₹3.70L" (2 hits) are table row values, not chips.
- "undefined" and "NaN": 0 in visible text on /fees and site-wide.

### 3. lib/guides.ts: PASS

- On /guides/salary-after-mba-india and /guides/career-after-mba-india, visible text has 0 of each of these: LPA, crore, "per month", "highest salary", "highest-growth", "salary premium", "Rs 50,000", "1.5 lakh", "Rs 80,000", "placement disclosures", "NIRF data".
- JSON-LD has "LPA" 2 times, only on the salary guide. That is the NewsArticle description, which equals the frozen metaDescription and is allowed.
- **Tables:** the salary table is 7 rows at 2 cells each (header Specialisation/Notes). The jobs table is 11 rows at 2 cells each (Job Title/Growth Path). Header and row cell counts match.
- **H3:** "Can an online MBA fresher earn a strong starting salary?" renders and its answer reads correctly.
- The new desc "...and where to read published placement data" renders on /guides.html and on the salary guide page. The old "Honest numbers drawn from university placement disclosures" is in 0 branch files and 0 lines of f251881 source.
- **A5.** "This is not typical for all online MBA graduates without technical backgrounds." now follows "...have the stronger case in analytics, FinTech, and e-commerce roles." "This" used to refer to the deleted Rs 8-12 LPA offers. Suggest "That case is weaker for online MBA graduates without technical backgrounds."
- **A6.** "The IIMs publish the most detailed MBA placement reports." is a new superlative with no source. Suggest "The IIMs publish annual placement reports." Also, "The gap narrows significantly after 3-5 years" is kept from before the batch and is unsourced.

### 4. SMU stale MBA fee: FAIL (F1)

- data.ts tagline: the "₹1.1L for UGC-entitled" figure was in 25 base files, mostly RSC payloads, and is in 0 branch files.
- The new tagline "LOWEST FEES among all 3 Manipal MBA programs; ONLY Manipal MBA with Mandatory Dual" sits only in the RSC payload of the 12 SMU pages. It is not in visible text.
- **LOWEST is true on lib/data.ts:** SMU feePlans.mba 1,20,000 < MUJ 1,56,400 to 1,84,000 < MAHE 2,92,000.
- **"ONLY Manipal MBA with Mandatory Dual":** lib/data.ts does not contradict it. The MUJ tagline says "super or dual specialisation" (optional), and the MAHE record has no dual claim. It is still unsourced. Advisory A7.
- **Deleted table rows** (correspondence-MBA plus the UU, Galgotias, Arka Jain, NIU and Shoolini reviews): every table in the 16 changed posts keeps consistent row cell counts, the table count is unchanged, and tag balance is unchanged.
- **The batch missed SMU MBA at 1,10,000 in 4 published posts.** This is the rendered branch build, filtered to SMU/Sikkim Manipal within 60 characters and excluding MCA:

| Post (rendered) | Source f251881 | Text |
|---|---|---|
| blog/online-manipal-mba-review-2026 (visible and FAQPage LD) | lib/blog.ts:6618 | "SMU (Rs 1.10L) is most affordable with dual specialisation built in" |
| blog/uu-doon-online-mba-review (visible) | lib/blog.ts:28821 | Also-read strip "SMU MBA, Rs. 1,10,000, dual spec" |
| blog/galgotias-online-mba-review (visible) | lib/blog.ts:29097 | Also-read strip "SMU MBA, Rs. 1,10,000" |
| blog/mba-hr-management-online-india-2026 (visible ×5 and FAQPage LD) | lib/blog.ts:36116 (FAQ) and :36159 (body, 4 places) | "SMU (₹1,10,000)" in two shortlists, the brand-to-fee bullet and the affordable-tier line, plus table row "SMU Sikkim Manipal / Human Resources / ₹1,10,000 / ₹27,500" |

**Exact fix.** Delete the tokens only and add no new figure, matching the batch's own method:
- :6618: "SMU (Rs 1.10L) is most affordable" becomes "SMU is the lowest-fee of the three". That is true on lib/data.ts.
- :28821: "SMU MBA</a>, Rs. 1,10,000, dual spec" becomes "SMU MBA</a>, dual spec".
- :29097: "SMU MBA</a>, Rs. 1,10,000" becomes "SMU MBA</a>".
- :36116 and :36159:
  - Remove ", SMU (₹1,10,000)" from both shortlists and from "SMU at ₹1,10,000, ".
  - Change "or SMU (₹1,10,000)" to "or SMU".
  - Delete the whole `<tr><td>SMU Sikkim Manipal</td><td>Human Resources</td>...₹27,500...</tr>` row.
- Bump updatedAt to 2026-11-25 on mba-hr-management-online-india-2026. The other three are already 2026-11-25.
- Lower data/blog-fee-baseline.json if check-blog-fees reports a drop.

These are correctly left alone: the MCA mentions (amity-online-mca-fees-review, best-computer-courses-after-12th MCA table, online-mca-india-2026, compare/manipal-jaipur-vs-sikkim-manipal-mca), where SMU MCA is 1,10,000 in programFees. Also lib/data/syllabus-manifest.json "₹1.10L", which is not rendered.

### 5. "Rs 60,000 Cr": PASS

- "60,000 Cr" and "85,000 Cr" went from base 1 page (2 visible hits, 1 LD) to 0.
- "Digital ad spend" went from 2 visible hits to 0.
- The FAQ answer now ends "...Fintech (Paytm, PhonePe, CRED). Strong demand pipeline.", which reads correctly.
- The 4 "Dentsu" pages left name it only as an agency employer.
- **A8.** The same FAQ answer still has "growing 18 to 25 percent YoY per LinkedIn India Hiring Index" and "50K-plus marketing jobs". Both are unsourced market stats for a later batch.

### 6. galgotiasonline.edu.in: PASS

- Visible text went from 4 pages / 9 hits to 1 page / 1 hit. The hit left is the coupon template line `{page.officialUrl}` on /coupons/galgotias-online-mba-discount-coupon-2026. It is site-wide, advisory A9, and listed for Rishi.
- In LD, 2 pages remain, both schema `sameAs` from lib/data.ts officialUrl.
- The galgotias review shows no new empty `<a>`, empty `<p>` or dangling text. The disclaimer now reads "Please confirm UGC-DEB approval status on the UGC portal before applying." The callout and summary lines end on full sentences.

### 7. Damage: PASS

- **16 changed BLOG_POSTS** (15 published, 1 draft: online-mba-fee-comparison-india-2026):
  - Tag balance is unchanged for 24 tag types.
  - No table became inconsistent and the table counts are unchanged.
  - No new empty li, heading, td, p, strong or list, and no double periods, ",." or dangling "and/or/the" endings.
  - Every FAQ is non-empty and FAQ counts are unchanged.
- **The 54 changed rendered pages:** the only flag was "add-on</" on the MUJ review sem-card, which is a false positive.
- **FAQPage:** 307 entries before and after, 0 empty, 0 not mirrored in the page payload.
- **JSON-LD:** 0 parse failures across all 2,335 branch pages.
- **The 44 edited page-content JSON files that carry chooseAlternatives:** every chooseIf/consider list still has at least 2 items, and every FAQ has a question and an answer.
- The dangling references are F2 and A5 above.

### 8. Regression and gates: PASS

- Page list is identical, 2,335 pages each.
- **Meta:** 0 changes across title, description, og:title, og:description, canonical and robots. The title extractor matched all 2,335 pages.
- **Visible text** changed on 54 pages, all in scope:
  - 15 blog posts
  - 2 compare pages
  - 1 coupon page
  - /fees
  - /guides
  - 2 guide pages
  - 32 university spec pages
- **JSON-LD** changed on 25 pages, a subset of the same pages.
- **Changed posts:** all 16 carry updatedAt 2026-11-25. Only body fields (content, faqs) and updatedAt changed. There were no title, seoTitle, metaDescription, tags or targetKeyword changes.
- **Diff read in full** (pairs.ts, fees/page.tsx, data.ts, content.ts, guides.ts, coupon-pages.ts, all blog.ts hunks, and all 48 JSON files field by field):
  - No new fee, rank, grade or salary figure.
  - Re-ordered consider items reuse figures already on the page (Amity Rs 2.25L, JIIT ₹1,75,000).
  - New wording beyond deletion is limited to: the add-on sentence (sourced to lib/data.ts `addOns`), "Government MBA roles follow pay commission scales", and the IIM "most detailed" line (A6).
- **Gates not weakened:**
  - No scripts/ or .husky/ file changed.
  - data/blog-fee-baseline.json only went down (1977 to 1963, every per-slug change a decrease).
  - The em-dash and fee baselines are unchanged.
  - The sitemap-lastmod change is date bumps only.
- **JSON:** all changed JSON parses (check-page-content-json: 431 files OK).
- **`.husky/pre-commit`** on a fresh worktree at ed620ce with f251881 staged (58 files): "pre-commit: all checks passed", exit 0, and the working tree vs f251881 diff is 0 lines, so the hook rewrote nothing. Log: scratchpad/qa7/precommit.log.

## Verdict

**FAIL. Not clear to merge.**
- **F1:** SMU MBA Rs 1,10,000 is still on 4 published posts, at lib/blog.ts:6618, :28821, :29097, :36116 and :36159.
- **F2:** 5 MUJ "global certification" sentences were orphaned by the Coursera deletions, two of them also carrying a false "LPU is more affordable". They are in the jain BI/marketing JSON at line 78, LPU logistics at line 74, LPU digital-marketing at line 74 and LPU IT at line 70.

Both fixes are deletions. Re-verify with:
- the rendered SMU-adjacent scan (0 non-MCA hits);
- the 5 orphan strings (0);
- `.husky/pre-commit`.

Post-deploy checks (x-vercel-cache/age, scripts/check-live.mjs, acceptance) apply only after merge.

---

## Round 2 (e041035), checked 2026-11-26

### Setup

- **Branch build:** engineer worktree `.next`. BUILD_ID was written 2026-11-26 10:37:26, after the e041035 commit at 10:34:27 +0530, so the build is fresh.
- **Base:** the same 6fc160b build. 2,335 pages each and the page list is identical.
- **Diff f251881..e041035:** 31 files, read in full.
  - pairs.ts: 4 FAQ questions.
  - lib/blog.ts: 5 posts.
  - lib/guides.ts: 2 lines.
  - 23 page-content JSON files.
  - blog-fee-baseline and sitemap-lastmod.
  - FIX-LOG.
- **Build-date artefacts.** Base was built 25 Nov and the branch 26 Nov, so some page differences come from the build date, not the code. After I normalised weekday, date and countdown text, they disappear. There are three kinds:
  - Coupon weekday pricing and validThrough on 23 coupon pages and /coupons.
  - dateModified on /fees and /methodology.
  - The /methodology "Not verified" count, which went from 38 to 40 (and "2 universities" to 4). data/naac-verified.json has Shiv Nadar (A) and Devi Ahilya (A+) with `validTill: 2026-11-26`, and app/methodology/page.tsx:45 drops a grade once validTill is before today. **This will appear on main at the next build whether or not this branch merges.** Rishi needs to know two NAAC grades lapsed today. It is not a branch defect.
- After normalising, real changes are on 69 pages: 16 blog, 5 compare, 1 coupon, /fees, /guides, 2 guides and 41 university pages.
- Meta (title, description, og:title, og:description, canonical, robots) changed on 0 pages. JSON-LD parse failures: 0.

### Round 1 FAILs

**F1, SMU MBA 1,10,000: PASS.**
- Rendered SMU-adjacent hits, excluding MCA and SRM Sikkim, went from 42 on base to 11 on the branch. All 11 are MCA:
  - amity-online-mca-fees-review (blog and /online-mca copies, MCA table and MCA sentence);
  - best-computer-courses-after-12th (inside "Online MCA Programmes After BCA");
  - online-mca-india-2026;
  - compare/manipal-jaipur-vs-sikkim-manipal-mca.
- The 1,10,000 on online-mba-hospital-healthcare-management-india-2026 belongs to SRM University Sikkim: tier floor, table row and shortlist. SMU shows as ₹1,20,000 on that page.
- These all went to 0: "SMU (Rs 1.10L)", "SMU MBA, Rs. 1,10,000" (both also-read strips), "SMU (₹1,10,000)" (3 hits plus LD) and "SMU at ₹1,10,000".
- "SMU is the lowest-fee of the three" renders once visible and once in FAQPage LD. It is true on lib/data.ts: SMU 1,20,000 < MUJ 1,56,400 to 1,84,000 < MAHE 2,92,000.
- "Best brand-to-fee ratio: NMIMS (₹1,96,000), MUJ (₹1,56,400), or SMU" reads correctly.
- mba-hr-management tables are well-formed after the row deletion: consistent cell counts, same table count, tag balance unchanged.

**F2, five orphaned MUJ lines: PASS.**
- All five strings are at 0, and so is "LPU is more affordable".
- "Both are comparable options." renders on the prerendered LPU digital-marketing page. The LPU IT page renders on demand, and its source reads the same.

### New in round 2

**LPU Coursera sweep: FAIL (R2-F1).**
- The 20 edited JSON files read correctly. The kept LPU fee, EMI, NIRF #31 and placement clauses are unchanged; only the Coursera token was removed.
  - One small rewording: DPU finance went from "includes Coursera Plus and placement." to "includes placement support.". That is acceptable.
- Six LPU Coursera claims remain. One renders in the build and the rest render on demand.

| File:line (e041035) | Text |
|---|---|
| lib/data/page-content/uttaranchal-university-online-mba-digital-marketing.json:107 (renders) | "If you need bundled platform certifications (Google, Meta, HubSpot), LPU at Rs 1.61L with Coursera Plus is a stronger package for digital marketing." |
| lib/data/page-content/uttaranchal-university-online-mba-financial-management.json:109 | "...CU (Rs 1.75L, PwC modules) or LPU (Rs 1.61L, Coursera Plus) offer more structured add-ons." |
| lib/data/page-content/uttaranchal-university-online-mba-information-technology.json:108 | "If you want bundled tech certifications or Coursera Plus, LPU at Rs 1.61L (NIRF University #31) is a stronger package." |
| lib/data/page-content/galgotias-university-online-mba-marketing-management.json:93 (FAQ) | "...Galgotias at Rs 80,200 is roughly half the cost but lacks EMI, Coursera, and placement support." |
| lib/data/page-content/galgotias-university-online-mba-operations-management.json:70 (comparisons) | same clause "...but lacks EMI, Coursera, and placement support." |
| lib/data/page-content/galgotias-university-online-mba-operations-management.json:93 (FAQ) | same clause |

In the Galgotias rows the LPU clause before it no longer mentions Coursera, so "lacks ... Coursera" now implies LPU has it.

**Exact fix:**
- UU DM:107: delete the item. consider keeps the Amity and CU items.
- UU financial-management:109: change it to "If you want industry co-teaching, CU (Rs 1.75L, PwC modules) offers more structured add-ons."
- UU IT:108: delete the item. consider keeps the JIIT and Amity/CU items.
- Galgotias marketing:93 and operations:70 and :93: change "lacks EMI, Coursera, and placement support" to "lacks EMI and placement support".

**R2-F2: orphan consider item (FAIL, minor).**
- lib/data/page-content/noida-international-university-online-mba-marketing-management.json, `chooseAlternatives.consider` is now the single item "NIU has no bundled certifications." It names no alternative.
- Fix: use the sibling NIU IT wording, "If industry certifications are a priority, CU offers PwC certifications. NIU has no bundled certifications." CU's PwC certifications are already stated on-site, in pairs.ts manipal-jaipur-vs-chandigarh.
- The UU DM FAQ "UU is Rs 99,600 with NAAC A+ but no bundled certifications" still reads as a fact about UU. Advisory only.

**/compare questions: PASS.**
- All 4 now read "Is Coursera access included in the MUJ fee?", with 4 visible and 4 in LD.
- "Does MUJ include Coursera Plus" and "Do both include Coursera Plus" are at 0.
- FAQPage: 389 entries on the changed pages, 0 empty. Apart from /coupons, every entry is mirrored in the page payload. /coupons has 8 entries not mirrored, identically on base, so that predates this batch (A10).

**Salary guide: PASS.**
- "most detailed MBA placement" and "This is not typical for all online MBA" are at 0.
- The new line "IIM placement figures are for full-time, two-year campus programs and change every year, so read each school's current report rather than a figure quoted secondhand." reads correctly as the answer to its H3, in both visible text and LD.
- Both guides: 0 LPA and 0 crore in visible text. All tables are 2 cells per row.

**mba-marketing FAQ stats: PASS.**
- The FAQ now opens "Yes. Driver sectors: ...". In that FAQ, "18 to 25 percent" and "50K-plus" are at 0, in both visible text and LD.
- **A11.** The same post's body still has "Median Rs 12.2 LPA, digital roles 20 percent above traditional, D2C and SaaS hiring growing 18 to 25 percent YoY" in its one-line frame. These are the same unsourced stats, outside the FAQ. Queue them for the next batch.

### Round 1 tests re-run on e041035

| Test | Result |
|---|---|
| 1. MUJ Coursera | PASS. No MUJ include/bundle/free claim anywhere; "Coursera Plus" fell from 53 to 10 pages visible and 23 to 4 in LD. What is left is MAHE and SRM Sikkim, kept by design, plus R2-F1. |
| 2. /fees | PASS. Unchanged from round 1. |
| 3. Guides | PASS |
| 4. SMU | PASS |
| 5. "60,000 Cr" | PASS. 0 hits. |
| 6. galgotiasonline.edu.in | PASS. Only the coupon template (visible) and schema sameAs (LD) remain. |
| 7. Damage | PASS. 17 changed posts show no tag-balance, table, empty-element or FAQ change, apart from the known "add-on</" false positive. In the edited JSON, every FAQ has an answer. The two NIU files have 1-item chooseIf/consider lists, but chooseIf was 1 item before this batch (see R2-F2 for consider). |
| 8. Regression | See the gates line below. |

Regression detail:
- Titles and meta unchanged on every page.
- updatedAt is 2026-11-26 on the 5 round-2 posts: online-manipal-mba-review-2026, mba-marketing-career-salary-jobs-2026, uu-doon-online-mba-review, galgotias-online-mba-review and mba-hr-management-online-india-2026. Only body fields changed on them.
- blog-fee-baseline went down only (1963 to 1956: online-manipal 8 to 7, uu-doon 4 to 3, mba-hr 46 to 41). The em-dash and fee baselines are unchanged.
- scripts/, .husky/ and package.json are unchanged.

**Gates.** The hook was run on two different staged diffs:
- **(a) ed620ce..e041035 staged in qab7gates, as requested: exit 1** on `check-blog-updated-at`. It lists 8 posts that changed content in round 1 and carry updatedAt 2026-11-25:
  - top-correspondence-mba-colleges-india-2026
  - online-mba-fee-comparison-india-2026 (draft)
  - smu-online-mba-review
  - noida-international-university-online-mba-review
  - shoolini-online-mba-review
  - online-mba-business-data-analytics-india-2026
  - best-online-mba-colleges-india-2026
  - online-mba-karnataka-2026

  In the same run, the sitemap-lastmod step rewrote 33 data/sitemap-lastmod.json entries from 2026-11-25 to 2026-11-26.

  Both failures come from staging a diff made on 25 Nov as one commit on 26 Nov. These posts did change on 25 Nov and say so, and f251881 passed this gate when it was committed on 25 Nov (round 1, exit 0). I do not count this as a defect in the branch. If the merge has to be hook-clean on a single staged diff, the only fix is to bump those 8 dates to 26 Nov. That would state a later change date than the real one, so I recommend not doing it.
- **(b) f251881..e041035, the actual round-2 commit, staged in a fresh worktree:** "pre-commit: all checks passed", exit 0. The hook rewrote nothing (working tree vs e041035 is 0 lines). check-blog-fees: 1956, unchanged from the new baseline. Log: scratchpad/qa7/precommit3.log. **Gates PASS on the commit as made.**

### Round 2 verdict

**FAIL. Fix R2-F1 (six LPU Coursera lines) and R2-F2 (NIU consider item).** Both are deletions or rewordings that use only facts already on the site, and no rebuild-level risk beyond those 6 pages is expected.

F1 and F2 from round 1 are closed. Everything else passes.

Re-verify with:
- `git grep -n -i coursera -- lib/data/page-content | grep -E "LPU|Lovely|lacks EMI, Coursera"` returning 0 lines;
- the NIU consider item;
- `.husky/pre-commit` on the round-3 commit diff.

---

## Round 3 (69b6de0), checked 2026-11-26

### Setup

- **Build:** engineer worktree `.next`. BUILD_ID was written 2026-11-26 10:53:33, after the 69b6de0 commit at 10:50:16 +0530, so the build is fresh. 2,335 pages.
- **Comparison:** I compared against my cached render of the e041035 build (built 10:37:26, also on 26 Nov). Both builds are from the same day, so the coupon weekday and date artefacts from round 2 do not apply. Meta is compared against the 6fc160b base.
- **Diff e041035..69b6de0:** 8 files. Site files account for 6 insertions and 8 deletions:
  - lib/blog.ts, 1 line;
  - Galgotias marketing-management 1 and operations-management 2;
  - NIU marketing-management 1;
  - UU digital-marketing 1 deletion, financial-management 1, information-technology 1 deletion.

  The rest is the FIX-LOG entry (+6). The CR repair left only line-level hunks, with no whole-file churn. All 6 JSON files parse.

### (1) LPU Coursera: PASS

- **Source:** in `git grep -i coursera` over lib/, app/ and components/ at 69b6de0, no line pairs LPU or Lovely with a Coursera claim. Seven lines contain both words, and in each the Coursera mention is about something else:
  - an IIT Roorkee Coursera EMBA;
  - "financial modelling on Coursera" and free courses on Coursera/edX (blog);
  - MAHE Coursera dual certification in 4 Amity JSONs, kept by design.
- **"lacks EMI, Coursera,":** 0 in source. The Galgotias marketing FAQ, operations FAQ and operations comparison now read "...is roughly half the cost/price but lacks EMI and placement support." These three pages render on demand, so I checked the source.
- **Rendered pages:** I checked every page for "Coursera" within 150 characters of LPU/Lovely, excluding MAHE/Manipal/optional contexts. 0 hits. "with Coursera Plus is a stronger package" went from 1 to 0.
- **UU consider lists** still have at least 2 items and read correctly:
  - Digital marketing has 2 (Amity brand, CU co-teaching), confirmed in the rendered page.
  - Financial management has 3. The edited item reads "If you want industry co-teaching, CU (Rs 1.75L, PwC modules) offers more structured add-ons."
  - Information technology has 2 (JIIT AI core, Amity/CU brand).

### (2) NIU marketing consider item: PASS

The item now reads "If industry certifications are a priority, CU offers PwC certifications. NIU has no bundled certifications." That matches the NIU IT sibling word for word. The page renders on demand, so I checked the source.

### (3) mba-marketing callout: PASS

- The callout renders as "One-line frame for MBA Marketing 2026: FMCG remains the gold standard for brand career. Pick specialisation based on target sector, not generic prestige."
- "Median Rs 12.2 LPA", "20 percent above traditional" and "18 to 25 percent" each went from 1 to 0.
- The blog.ts diff is this one line only. updatedAt is already 2026-11-26.

### (4) Site-wide render: PASS

- Page list is identical.
- **Visible text** changed on 2 pages only: blog/mba-marketing-career-salary-jobs-2026 and universities/uttaranchal-university-online/mba/digital-marketing. These are the only prerendered pages among the changed sources; the other 5 JSON pages render on demand.
- JSON-LD changed on 0 pages and failed to parse on 0 pages.
- Title, description, og:title, og:description, canonical and robots changed on 0 pages against base.

### (5) Pre-commit: PASS

- `.husky/pre-commit` ran in qab7gates2, moved to e041035 with 69b6de0 staged (8 files): "pre-commit: all checks passed", exit 0.
- The hook rewrote nothing: the working tree vs 69b6de0 diff is 0 lines.
- check-blog-updated-at: ok (1 post, dated). check-sitemap-lastmod: ok. check-blog-fees: 1956, unchanged from baseline.
- Log: scratchpad/qa7/precommit4.log.

### Round 3 verdict

**PASS. fix/b3-batch-7 at 69b6de0 is clear to merge.**

- R2-F1 and R2-F2 are closed, and round 1 F1/F2 stay closed.
- Gates pass on each round commit as made: f251881 on 25 Nov, and f251881..e041035 and e041035..69b6de0 on 26 Nov.
- The single ed620ce..e041035 staged run fails only on the build-date effect described in round 2. That is not a branch defect.
- No meta changes, and no new figure or claim without a source on site.

Still to do after deploy:
- Wait for a fresh prerender, checking x-vercel-cache and age, because ?cb= may not get past the Vercel cache.
- Run scripts/check-live.mjs.
- Acceptance test on live URLs: /fees has no "lowest fee" chip; /guides/salary-after-mba-india has 0 LPA in its body; the MUJ spec FAQ answers No on Coursera; 0 SMU MBA 1,10,000 on the 4 fixed posts; 0 "Coursera Plus" next to LPU on the UU digital-marketing page; and one on-demand page fetched live (/universities/galgotias-university-online/mba/operations-management) shows "lacks EMI and placement support".

Still open from round 2, not a branch issue: Shiv Nadar (A) and Devi Ahilya (A+) NAAC validity lapsed on 2026-11-26 (data/naac-verified.json), so /methodology now counts 40 "Not verified". Rishi should be told.
