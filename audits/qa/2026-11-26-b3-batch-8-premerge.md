# QA: B3 batch 8 pre-merge (fix/b3-batch-8 at 6042324)

Checked 2026-11-26 by an outside QA pass. No site edits, commits or pushes.

## Setup

- **Branch build:** engineer worktree `.claude/worktrees/agent-a01edebc53ee492c4/.next`. BUILD_ID was written 2026-11-26 11:38:00, after the 6042324 commit at 11:35:17 +0530, so the build is fresh. The untracked `.b8tmp/` folder is not in the commit and was not staged.
- **Base build:** eddebe3 (site code = 51b60d1), built clean in scratch worktree `qab8base`: exit 0, 2360/2360 static pages. Neither worktree has a .env.local, so the two builds are like for like.
- **Prerendered pages:** compared over all 2,335 HTML pages each (visible text after `</head>`, JSON-LD, and title/description/og/twitter/canonical/robots).
- **On-demand routes:** `next start` on both builds (base :3101, branch :3102). I fetched `/programs/mba` from each, because it is the only changed route that is not prerendered.
- **Salary calculator:** its fee line sits inside a client-side `{!hasMBA && ...}` block, so it is absent from server HTML on both builds. I verified it from source.
- **Detectors:** every one listed below fired on base before I trusted its zero on the branch.
- **Facts:** checked with getExactFee via tsx on the branch tree.
  - 121 MBA universities, 56 with a published fee and 65 without.
  - Lowest published: CSJMU 50,000 to 1,20,000, DDU 52,500, Andhra 62,200, IGNOU 66,000.
  - Highest published: Symbiosis 3,15,000 to 3,70,000.

## Results

| Test | Result |
|---|---|
| 1. MBAHubClient | PASS (1 advisory) |
| 2. Homepage | PASS |
| 3. Meta | PASS |
| 4. Calculators, comparison tool, spec FAQs | PASS |
| 5. Coupons | PASS |
| 6. /compare FAQ and vs-distance guide | PASS |
| 7. Kept list | **FAIL** (F1: /programs/mba hero chip) |
| 8. Damage and regression | PASS |

**Overall: FAIL.** One fix, F1. It is a one-line JSX change.

---

### 1. MBAHubClient: PASS

From the live /programs/mba fetch, base vs branch:
- "Lowest fee at Rs 66,000": 2 to 0.
- "ROI Math Example", "Average mid-career fee", "Breakeven": 2 to 0 each.

The salary table's `</div>` (mb-6) now runs straight into the "Honest disclaimer" paragraph. Nothing on the page refers to the deleted box ("example above", "ROI math"), and the layout is intact.

The IGNOU card now reads "Central government university. NAAC A++. Strongest government job eligibility." The first two claims are true on lib/data.ts: naac 'A++', approvals ["UGC DEB","NAAC A++","AICTE","Central University"].

- **A1 (advisory).** "Strongest government job eligibility" is an unsourced superlative. Every UGC-DEB online degree carries the same government-job eligibility (the site says so on the homepage), so "strongest" has nothing behind it. Suggest changing it to "Accepted for government jobs, like every UGC-DEB degree." or deleting it. Not a FAIL: the engineer listed it for Rishi, and it makes no fee claim.

On /programs/mba the title, description, og, twitter, canonical and robots are unchanged, and the JSON-LD is identical and parses. The 23 "undefined" hits are in script payloads, the same on base, and 0 are in visible text.

### 2. Homepage: PASS

- "Online MBAs run ₹60,000 to ₹3,00,000": 1 to 0 (visible).
- "Budget ₹1.5L–₹4L": 1 to 0 visible and 1 to 0 FAQPage LD.
- FAQPage still has 5 entries, none empty.
- The "worth it" answer reads "Yes, especially from NIRF top-50 universities. Most professionals see a 30-50% salary jump within 2 years of completing an online MBA. Pick NAAC A+ or A++ universities with placement support for best ROI." The 30-50% is an unsourced pay claim that predates the batch and is listed by the engineer as out of scope.
- FAQ parity is unchanged from base. Two homepage FAQs have no visible mirror on both builds; that predates the batch.

### 3. Meta: PASS

Every meta change on the site falls into one of five groups, each exactly as listed:

| Count | Field | Before | After |
|---|---|---|---|
| 136 pages | description | "...ranked by NIRF &amp; NAAC: verified fees ₹35K-5L. Zero paid rankings. Check eligibility free at EdifyEdu." | "...ranked by NIRF &amp; NAAC. Zero paid rankings. Check eligibility free at EdifyEdu." |
| 138 pages | og:description | same text as description | same change |
| 152 pages | twitter:description | "...: verified fees ₹35K-5L. Zero paid rankings. Check eligibility free." | "... Zero paid rankings. Check eligibility free." |
| /universities | og:description | "...fees from ₹40K. January 2027 batch open." | "...fees. January 2027 batch open." |
| /universities | twitter:description | "...fees from ₹40K." | "...fees." |

- Where the inherited meta changed: index, verify/* (375 field changes), admin/*, /blog/write, /methodology, /privacy-policy, /terms, /programs, /coupons, /_not-found, and twitter:description only on /blog/page/2 to 12.
- **No blog post's meta changed.**
- title, og:title, twitter:title, canonical and robots changed on 0 pages.
- **/compare:** the layout description change does not render. The page sets its own description ("Online MBA &amp; MCA programmes from 125+ UGC-DEB universities side by side..."), which is unchanged.
- **/programs/mba:** the MBA fallback description does not render (the live fetch shows the same meta on both builds).

### 4. Calculators, university-comparison, spec FAQs: PASS

- "₹40,000 to ₹4,00,000" went from 2 pages / 3 hits to 0.
  - EMI calculator: "Online MBA fees vary by university and specialisation." and "...from all major banks. Many students finance their education through EMI options."
  - University comparison: "Online MBA fees vary by university. Higher fees don't always mean better quality."
- The EMI FAQPage collateral answer ("Rs 1-4 lakh", LD 1 to 0) now ends cleanly after "...co-applicant guarantee."
- The salary calculator "start from just ₹40,000" is deleted in source. The `<p>` keeps the 30-50% sentence, which is out of scope.
- The HR, Supply Chain and Healthcare spec FAQs lost "Fees range from ..." in both visible text and LD (5 pages / 3 LD to 0 on these pages). Each answer now ends on the university list sentence.
- The 2 "Fees range from ₹" hits left are blog bodies (best-online-bca-colleges, online-mba-tamil-nadu), outside this batch.

### 5. Coupons: PASS

- **IGNOU:**
  - The FAQ "one of the lowest online MBA fees" is gone (1 to 0 visible and LD). It now reads "No. IGNOU is a central government university. No coupon code is needed or applicable."
  - stackExample "lowest-priced" is at 0. The field does not render on base either, but the source is fixed.
- **Template line:**
  - "most budget-friendly option" went from 24 pages to 0.
  - "You prefer a central government university (explore IGNOU)" appears on 23 coupon pages.
  - On the IGNOU coupon page the list now starts at "You need campus-style placement drives", so it no longer links to itself.
- **Galgotias coupon:** "JAIN (from Rs 1,75,000)" is now "JAIN". The CU (from 1,75,125) and Amity (from 2,07,000) rows match getExactFee minimums.
- **Galgotias MBA override intro:** now "...total fees are ₹80,200 for the two-year programme. The programme is UGC-DEB approved and NAAC A+ accredited...". "one of the more affordable options" is at 0.
- **A2.** The IGNOU coupon still asks "Why is IGNOU MBA so cheap?". That is relative wording, not a ranking. Advisory only.

### 6. /compare FAQ and vs-distance guide: PASS

- **/compare:**
  - The "best MBA" answer lost both ranges and now reads "NMIMS and Symbiosis are premium options with strong brand value." That clause was already on the page.
  - The cost answer now reads "Fees vary by university and specialisation, so compare total programme fees side by side in the tool above. Fees are indicative, so confirm the current figure with our counsellor. Many universities accept semester-wise payment or offer EMI plans. Use the EMI calculator..." This makes no new figure or ranking. "Many universities ... EMI" is weaker than the "Almost all universities" sentence it replaces.
  - "Kurukshetra, VTU" and "₹4,000–₹8,000" are at 0.
  - These FAQs are not in /compare's JSON-LD on either build.
- **Guide:**
  - The comparison table went from 8 rows at 3 cells to 7 rows at 3 cells. Header and rows match, and the second table is unchanged at 8 rows at 3 cells.
  - "₹1L–₹3L total", "Cheapest credential" and the IGNOU "₹31,500" sentence are at 0 on the guide.
  - The new cell "Meets eligibility when the university is UGC-approved" restates the page's own validity rule; it is not a new fact.
  - The "₹31,500" hits left are Integral University in its own review and on blog page 4. They belong to another university and are outside this batch.

### 7. Kept list: FAIL (F1)

**F1. The /programs/mba hero chip has no scope.** The rendered hero row on both builds reads:

> 121 Universities · 150+ Specialisations · ₹50,000 to ₹3,70,000 · NIRF 2025 Verified

The chip value comes from `fees.range`, which covers only the 54 indexable MBA hubs with a published fee. Printed beside "121 Universities" with no qualifier, it reads as the fee floor and ceiling for all 121. 65 of those have no published fee, which is the exact reason this batch gives for removing every other typed cross-university range. The FAQ and MbaHubAnswers scope the same numbers ("across the 54 online MBA programmes we index"), and the chip does not.

**Exact fix:** components/MBAHubClient.tsx:141 (6042324):
```tsx
<Wallet size={14} className="text-amber-400" /> {rangeText ?? 'Contact our counsellor for current fee details'}
```
becomes
```tsx
<Wallet size={14} className="text-amber-400" /> {rangeText && fees.range ? `${rangeText} across ${fees.range.count} MBAs we index` : 'Contact our counsellor for current fee details'}
```
Alternatively, drop the chip. Re-verify by fetching /programs/mba from `next start` and checking that the chip reads "₹50,000 to ₹3,70,000 across 54 MBAs we index".

The rest of the kept list holds on getExactFee:
- **MbaHubAnswers:**
  - "Total programme fees run from ₹50,000 to ₹3,70,000 at list price across the 54 online MBA programmes we index" is true.
  - "The lowest list prices among the online MBAs we index" lists CSJMU ₹50,000–₹1,20,000, DDU ₹52,500 and Andhra ₹62,200. This is true: they are the three lowest published fees, and all three are indexable.
  - The /programs/mba fee FAQ uses the same scoped text and is true.
- **Online DBA "lowest fee":** app/online-dba/dba-fees/page.tsx:51 is computed from data and scoped "In our data, ... lowest confirmed fee". Acceptable.
- **Pair "more affordable" claims:**
  - MUJ 1,56,400 to 1,84,000 < Amity 2,07,000 to 2,25,000: true.
  - MUJ < NMIMS 1,96,000 to 2,20,000: true.
  - Galgotias BBA 77,200 < Sharda BBA 1,35,000: true.
  - Amity "lower fee" than Symbiosis 3,15,000 to 3,70,000: true.
  - Manipal trio SMU 1,20,000 < MUJ < MAHE 2,92,000: true.
- **Per-university figures:**
  - "IGNOU at Rs 66,000 over Amity at Rs 2.07L" and the MBASpecHubClient IGNOU Rs 66,000 match getExactFee.
  - The coupon rows CU from 1,75,125 and Amity from 2,07,000 match. MUJ 1,84,000 / 1,56,400 match its list and labelled discount.

### 8. Damage and regression: PASS

- **Page list:** identical, 2,335 each.
- **JSON-LD:** 0 parse failures on any branch page, and on the live /programs/mba.
- **Visible text** changed on 33 pages, all in scope:
  - /compare;
  - 24 coupon pages;
  - the vs-distance guide;
  - the homepage;
  - 3 spec FAQ pages;
  - the EMI calculator and the comparison tool;
  - the Galgotias MBA hub.
- **JSON-LD** changed on 6 pages: the IGNOU coupon, the homepage, 3 spec pages and the EMI calculator.
- **Changed pages:** no new empty li, heading, td, p, a or list; no tag-balance change; no table that became inconsistent.
- **FAQPage:** 176 entries, 0 empty, and parity the same as base. The 3 entries not mirrored (2 on the homepage, 1 on the EMI calculator) are the same 3 on base.
- **"undefined" and "NaN":** 0 visible. The "₹ " (rupee then space) hits are 67 on 3 pages, the same on both builds (EMI calculator "₹ 292 K" cards); nothing new.
- **Diff eddebe3..6042324 read in full** (18 files): every change deletes a figure or superlative or swaps it for neutral wording. The only new wording is:
  - the /compare cost answer;
  - "Online MBA fees vary by university (and specialisation)";
  - "Many students finance";
  - the guide cell "Meets eligibility when the university is UGC-approved";
  - the coupon line "You prefer a central government university".

  None adds a figure or ranking.
- **Line endings:** CRLF is preserved on every changed file. CRLF counts equal line counts before and after, and numstat shows no whole-file diffs. HomePageClient has one non-CRLF line on both sides.
- **Unchanged:** .husky/, scripts/ and package.json. The em-dash, fee and blog-fee baselines are unchanged (229 / 205 / 1956).
- **`.husky/pre-commit`** on a fresh worktree at eddebe3 with 6042324 staged (18 files): "pre-commit: all checks passed", exit 0. The hook rewrote nothing (working tree vs 6042324 is 0 lines).

## Advisories

- **A1.** IGNOU "Strongest government job eligibility" (MBAHubClient TOP_10_PICKS) is unsourced.
- **A2.** IGNOU coupon "Why is IGNOU MBA so cheap?".
- **A3.** These are already listed by the engineer for later batches:
  - unsourced pay claims (homepage 30-50%, MBAHubClient salary table, spec salary FAQs, salary-calculator 30-50%);
  - IGNOU "Rs 14,000-16,000 per semester";
  - SMU "effective fee Rs 84,000";
  - "Rs 160K - Rs 160K" totals;
  - UPES "#45 NIRF" with no category.
- **A4.** The EMI calculator side card's university fee chips ("MAHEO ₹ 292 K - ₹ 292 K", "BPWIL ₹ 312 K - ₹ 312 K") show a single fee as a range and use opaque codes. This predates the batch and is cosmetic.

## Verdict

**FAIL. Fix F1** (components/MBAHubClient.tsx:141: scope the hero range chip, or drop it). Everything else passes.

Re-verify with the live /programs/mba fetch and `.husky/pre-commit` on the fix commit. Post-deploy checks (x-vercel-cache/age, scripts/check-live.mjs, acceptance) apply only after merge.
