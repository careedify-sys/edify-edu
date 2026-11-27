# QA pre-merge: B3 batch 20 (coupon EMI, CU plan names/PwC, salary gate, salary figures)

**Date:** 2026-11-27 · **Checker:** qa-checker (outsider review; did not do the work)
**Branch:** fix/b3-batch-20 at b7c902c (79b2953 parts A-C, b7c902c part D) · **Base:** 674fb42
**Method:** clean detached worktrees for base, branch and a gates tree; a full `next build` of base and branch; prerendered HTML compared page by page across 2,335 pages. Pre-commit was run on a staged 674fb42..b7c902c tree. The salary gate was tested by injection.

## VERDICT: FAIL

There are three findings, F1 to F3. F1 is the blocker: on four posts the batch deletes a salary range from the prose, but the same range stays in a table on the same page. The new prose now says the university publishes no range, so each page contradicts itself. Everything else passes: the build, every gate, the diff scope, CU, coupons apart from F2, damage, and heads.

| Test | Result |
|---|---|
| 1. Part A coupons | PASS with F2 |
| 2. Part B CU | PASS |
| 3. Part C salary gate | PASS (advisory A1) |
| 4. Part D salaries | **FAIL** (F1, F3) |
| 5. Damage and gates | PASS |

---

## Findings

### F1 (blocker). Deleted ranges survive in tables on the same pages, and the new prose contradicts them

These are visible text in the built HTML at b7c902c.

| Post | New prose (this batch) | Still on the same page |
|---|---|---|
| /blog/amity-vs-manipal-online-mba-2026 | "Neither publishes an online-MBA salary range" (body and FAQ) | Comparison table row "Avg Salary Range ₹5L – ₹12L p.a. / ₹4L – ₹15L p.a." (lib/blog.ts:43862). These are the sheet's A7/A8 CONFLICT figures. |
| /blog/jain-vs-amity-online-mba-2026 | "JAIN Online does not publish online-MBA salary outcomes"; "Neither university publishes a median" | Table row "Avg Salary Range ₹5L - ₹18L p.a. / ₹5L - ₹12L p.a." (lib/blog.ts:44132). These are the A11/A12 CONFLICT figures. |
| /blog/nmims-vs-symbiosis-online-mba-2026 | "NMIMS does not publish online-MBA salary outcomes" | Table row "Avg Salary Range ₹5L - ₹10L p.a. / Not published" (lib/blog.ts:44410). This is the A14 figure. |
| /blog/online-mba-pune-university-2026 | "Symbiosis, NMIMS and JAIN do not publish online-MBA salary outcomes" | Table "Pune online MBA Year 1 CTC by sector 2026" has a "NMIMS Online MBA" column: "Rs 7-12 LPA", "Rs 8-15 LPA", and so on. |
| /blog/mba-vs-pgdm-online-india-2026 (partly disclosed) | "NMIMS does not publish online-MBA salary outcomes" | The "Year 1 CTC (online)" table still shows "NMIMS Online (Mumbai) … Rs 7-15 LPA". The FIX-LOG discloses that table as a STOP-CASE. The intro line "Online MBA from NMIMS plus JAIN plus Amity is widely accepted at Rs 6-15 LPA lateral" is not covered by that disclosure. |

- **Why it blocks:** the batch adds a sourced negative ("does not publish") next to the very unsourced or conflicting figure it was meant to delete. A reader, or an AI answer engine, now gets both on one page.
- **Gate counts:** the salary gate already counts these table figures (amity-vs-manipal shows no net change), so deleting them only lowers counts.
- **Fix:**
  - Delete the three "Avg Salary Range" rows, or set them to the same wording as the prose.
  - Drop the NMIMS column from the Pune sector table.
  - Decide on the mba-vs-pgdm intro line.
- **Re-run check-blog-fees after the edit.** The STOP-CASE shows that removing salary cells can expose fee figures.

### F2. IGNOU coupon page: the rewritten template sentence prints "The N/A coupon is applied at enrollment."

- **What renders:** /coupons/ignou-online-mba-discount-coupon-2026, section "EMI and Coupon Discount Compatibility at IGNOU": "The N/A coupon is applied at enrollment. Whether an EMI plan applies to the reduced balance is set by the university…"
- **Why it is wrong:** the CTA on the same page says IGNOU "runs no coupon".
- **Base:** the old sentence was "The N/A coupon discount works with EMI payment plans at IGNOU". The defect predates this batch, but this batch rewrote the exact sentence and kept it.
- **Fix:** gate the EMI section, or at least that sentence, on `page.couponCode !== 'N/A'`, as the template already does at lines 210/218/253/285.

### F3. UPES: the new "does not publish" sentence contradicts the batch's own source sheet

- **Where:** upes-online-mba-review-2026, in both the FAQ (also in FAQPage JSON-LD) and the body: "UPES does not publish online-MBA salary outcomes".
- **What the sheet says:** S7/A18 says UPES Online *does* publish a salary outcome, an "Average Salary Hike" percentage "(As per Alumni survey)". It has no rupee figure.
- **Fix:** "UPES publishes no rupee salary figure for the online MBA, only an alumni-survey hike percentage", or "publishes no rupee salary figure". The same pattern is borderline for Amity in best-online-mba-colleges-india-2026 (see A4).

---

## Test 1. Part A, coupons: PASS with F2

**Facts sheet check.** I checked every changed string in lib/coupon-pages.ts against audits/verify/batch20-facts-2026-11-27.md.

| University | Result | Sheet rows |
|---|---|---|
| Amity | Matches: 24-month no-cost EMI from Rs 8,906/month; sequencing removed | 1a, 1b, 1c |
| NMIMS | Matches: annual / semester-wise / full-fee, "Finance options available", disclaims any lender. No 3/6/9/12 tenure, no "lending partners", no total. | 2a, 2b |
| SMU | Matches: zero-cost EMI only on the annual fee | 4d |
| Symbiosis | Matches: four semester instalments, not monthly | 4g, 4h |
| MAHE | Matches: no-cost EMI, Coursera a separate benefit | 4e |
| Galgotias | Matches: no published instalment plan | 4l |
| MUJ, LPU, CU, JAIN, Amrita | Sourced EMI kept; "applied first" / "on the reduced fee" gone | 4a, 4b, 4c, 4f, 4k, 4n |
| DPU (line 453) | Unchanged, as stated | |

**IGNOU.**
- totalFee, finalFee, the discounts row, emiCompatible and both peer cells use per-semester wording. No total is printed.
- CouponPageCTA prints: "IGNOU lists its online MBA at Rs 16,000 per semester (Rs 18,000 for the 3rd) plus registration and development fees and runs no coupon…". This reads correctly and matches the sheet: Rs.16,000 for semesters 1, 2 and 4, and Rs.18,000 for semester 3.
- The peer cells on the Amity and Galgotias coupon pages render as "IGNOU | No coupon". The template regex strips the "(Rs …)" parenthesis, so no figure shows.
- **Visible "66,000" on any coupon page:** 0 on the branch, 1 on base (the IGNOU page).
- `totalFeeNum: 66000` remains in the page source. See A3.

**Template.** The old sentence ("works with EMI payment plans … split into monthly EMI instalments") appears on 0 of 24 pages.
- The new sentence prints on all 24 pages.
- The "no-cost EMI window" variant prints only on MUJ, which is the hasSourcedNoCostEmi path.
- IGNOU prints "The N/A coupon" (F2).

**Claim: "emiCompatible, stackExample and discounts never render".**
- **Visible DOM: true.** None of the three is referenced in app/ or components/. The emiCompatible text appears visibly only on NMIMS, Symbiosis and Galgotias, and only because their FAQ answers repeat the same opening words.
- **Page source: not true.** All three fields, and totalFeeNum, are serialized into every coupon page's HTML: 24 of 24 pages for both emiCompatible and stackExample. The reason is that CouponPageCTA is a client component that receives the whole `page` object. See A3.

**JSON-LD.** The coupon FAQPage answers match the new FAQ text. No stale "reduces the total fee first" or "3 to 12 month" answer appears in LD on any of the 24 pages.

## Test 2. Part B, CU: PASS

**Plan names.** "MBA plan" and "Triple Industry Certified MBA plan" match sheet item 3, map 3a.
- 0 "Tier 1/Tier 2" plan labels remain in the 27 JSONs.
- The 2 remaining "Tier 1" hits are "Tier-1 brand"/"Tier 1 brand universities (IIM, ISB)", and the 4 "top-tier" hits are generic.

**Scholarship wording.** Every "applies a 25%/20%" and flat "25% early-bird" is now "up to 25%/20%". In the 26 built spec pages: "up to 25%" ×94 and "up to 20%" ×110, against 0 on base.

**PwC wording** matches CU: "two MBA subjects are taught by PwC India experts, and PwC India-branded certificates are awarded on completion", plus CU's no-employment-guarantee line. Each quote is 15 words or fewer.

**Removed terms, branch vs base.** Counts are from the built HTML of the 26 spec pages, visible text plus payload.

| Term | Base | Branch |
|---|---|---|
| unmatched | 72 | 0 |
| identical curriculum | 38 | 0 |
| co-created | 78 | 0 |
| co-teaching | 71 | 0 |
| full MBA modules | 78 | 0 |
| sector practices (PwC Financial Services / Consumer Markets / Health Industries) | 18 / 20 / 11 | 0 / 0 / 0 |
| partner with PwC | 6 | 0 |
| subject list does not change | 52 | 0 |
| Big 4 | 53 | 4 |

The 4 remaining "Big 4" hits are 2 strings in the finance JSON, rendered twice: an industries list ("Big 4 audit and advisory") and a chooseIf line ("Big 4 advisory roles in North India"). Neither is tied to PwC or the plan. They were left alone and are acceptable.

**FAQ JSON-LD.** On all 26 spec pages, every JSON FAQ appears exactly (question and answer) in FAQPage LD: 0 missing.

**Fees unchanged.** I compared the multiset of numbers in each JSON, base against branch. Only punctuation shifted (for example "Rs 1,75,125" became "Rs 1,75,125,"), and the "1"/"2"/"4" digits of the removed "Tier 1/2" and "Big 4" went with them.
- No fee was added or removed.
- All 27 files parse.

**Hub honestVerdict.** The edit is correct, but the field is not rendered by any component, so it is dead text. The hub HTML is byte-identical between base and branch.

## Test 3. Part C, salary gate: PASS (advisory A1)

**Wiring.** .husky/pre-commit runs `check-blog-salaries.mjs --self-test` and then the gate, each with `|| exit 1`, right after check-blog-fees.
- The full hook run printed "self-test OK (7 cases)" and "OK (2353 salary figures, baseline 2353)".

**Baseline equals the real count.** I recounted independently twice: once with the gate's extractor, and once on raw content/FAQ/head text with tags stripped.
- Tip: 2,353 across 111 posts. Base: 2,388 across 112 posts.
- data/blog-salary-baseline.json `total` = 2353 = the sum of perSlug, with 0 per-slug mismatches against the tip.
- The base-to-tip drops are all in edited posts, for example pune 20→11, mumbai 8→2, upes 4→0, ops 25→20.

**Injection.** I injected one variant per post into 24 existing posts, plus one brand-new slug (`qa-probe-brand-new-slug-2026`), then ran the gate. It exited 1. Tree restored, then verified identical to b7c902c.

| Variant | Result |
|---|---|
| Rs 9-15 LPA, ₹12 LPA, ₹ 12 LPA, Rs. 12 LPA, 12LPA, ₹12 L.P.A. | Caught |
| ₹12 lakh per annum, 12 lakhs per annum, INR 12 lakh per annum | Caught |
| ₹12 lakh p.a., ₹12 lakh a year, ₹12 lakh per year, 12 lakh annually | Caught |
| `12 <strong>LPA</strong>`, `12&nbsp;LPA` | Caught |
| New slug with "Rs 7 LPA" | Caught ("not in baseline, must be 0") |
| ₹12 lakh/annum, ₹12 lakh yearly, ₹12 lakh CTC, "CTC of ₹12 lakh", ₹12,00,000 per annum, ₹12L per year, ₹1.2 Cr per annum, 12 lacs per annum, "twelve lakh per annum" | **Not caught** (A1) |

The two variants the brief names, "lakh per annum" and ₹-prefixed LPA, are caught in every form I tried.

## Test 4. Part D, salaries: FAIL (F1, F3)

**Sample.** I read all 47 blog hunks: 44 content segments plus updatedAt lines, against the 20a sheet.

**Deleted as required:**
- A1-A6 Pune and Mumbai ladders, plus the SPPU/Welingkar/IDOL rungs.
- A7-A15 "as reported" ranges.
- A17-A19, A28, A29.
- B3 on-campus inference.
- B4, B6, X7.
- D1, D3-D15 aggregator figures and caveats. Remaining Kraftshala and Glassdoor mentions are a product name and generic research tips, not data citations.

**Kept with exact scope labels:**
- Amity "Rs 18 LPA (no year given)", 4 places.
- DY Patil "5.5 to 20 LPA across all its online programmes (no year given)".
- Online Manipal "about 5.5 LPA, group-wide across those universities (no year given)", with "MUJ publishes no MUJ-only figure".
- LPU "LPU states packages of up to ₹49.4 LPA for its MBA class of 2025. It does not say the figure covers the online programme". There is no on-campus inference.

**Other checks:**
- **JAIN target:** no JAIN ₹8-25 figure appears in any added line, and no JAIN-attributed 8-25 range exists at the tip.
- **Orphan "Symbiosis's floor is ₹1L higher":** gone (0 at tip).
- **Sentences:** they read cleanly apart from the minor issues in A4. No em dash or banned filler word was added: 1,235 added word-lines scanned.
- **updatedAt:** all 19 changed posts carry 2026-11-27. The 19th post is the lpu-vs-chandigarh plan-label fix. check-blog-updated-at agrees.
- **Frozen posts:** none of the 8 FREEZE_SLUGS posts changed. That includes the 5 the sheet marks FROZEN: Amity, BITS, JAIN, IGNOU and CU reviews.
- **Head fields:** 0 changes to title, seoTitle, h1Title or metaDescription on any post.
- **Fails:** F1 (same-page table leftovers) and F3 (UPES wording).

## Test 5. Damage and gates: PASS

**Builds.** Both exit 0, with 2,367/2,367 static pages and the same 2,335 HTML pages.
- First Load JS shared is 87.6 kB on both.
- Route sizes differ only by ±1 B.

**Page comparison:**
- Visible text changed on 70 pages: 19 blog, 1 /online-mca mirror, 24 coupons, 26 CU specs.
- JSON-LD changed on 45 pages; 0 LD parse failures.
- Meta, title, OG, twitter, canonical and robots: changed on 0 pages. No template-derived head changes.

**Damage checks:**
- 0 pages with new unmirrored FAQ answers.
- 0 pages with undefined/NaN.
- 0 new tag imbalances across all 2,335 pages.

**Pre-commit** on the staged 674fb42..b7c902c tree: "all checks passed", and the tree was identical to b7c902c afterwards (no baseline rewrites).

| Gate | Result |
|---|---|
| check-fee-baseline | 205 unchanged |
| check-blog-fees | 1948 unchanged |
| check-em-dash-baseline | 227 |
| check-blog-salaries | 2353 |
| verify-fees, protected-pages (8 frozen posts), naac-consistency (0), page-content-json/facts, sitemap-lastmod, coupon-claims (24 pages) | OK |

**Blog-fees auto-drop 1950 → 1948 is genuine.** With base's baseline restored, check-blog-fees at the tip itself lowered it: mba-digital-marketing-career-2026 7→6 (the deleted "Rs 4,500 crore" Kraftshala market size) and jain-vs-amity-online-mba-2026 8→7. The file it wrote equals the committed one byte for byte.

**Diff scope.** 38 files, all belonging to the item:
- .husky/pre-commit
- app/coupons/[slug]/page.tsx (one sentence)
- lib/coupon-pages.ts
- lib/blog.ts
- 26 CU spec JSONs and the CU hub JSON
- the salary gate script and its baseline
- data/blog-fee-baseline.json
- data/sitemap-lastmod.json (hr-management and it-management bumped; the other 24 were already 2026-11-27)
- the two verify sheets
- FIX-LOG

No app/admin, app/api/cms or app/blog/write file is touched. Line endings match base on every pre-existing file. The new files are CRLF, like their siblings.

**Sources.** Every new fact traces to a row in batch20-facts or batch20a-salary-facts, both committed on the branch. F3 is the exception: its wording overstates its row.

---

## Advisories (not blocking)

**A1. Salary gate coverage.**
- **Not counted:** "lakh/annum", "lakh yearly", "lakh CTC", "CTC of ₹X lakh", full-rupee "₹12,00,000 per annum", "L per year", "Cr per annum", "lacs".
- **Already in the corpus:** "Rs 40 to 70 lakh CTC" exists in lib/blog.ts, so a writer could add uncounted salary figures in that style.
- **False positive:** `p\.?\s?a\.?` has no word boundary, so "₹12 lakh package" (and so "lakh paid", "lakh payable") counts as a salary figure. A legitimate fee sentence could trip the gate with a misleading message.
- **Comment mismatch:** the script header says "122 posts", while the hook comment and the real base count say 112.

**A2. CU spec pages still carry flat-percentage and "co-taught" wording from lib/data.ts.**
- FeeBreakdown and the fee rows print "MBA plan after 25% Early Bird" / "after 20% Early Bird" (156 occurrences each across the 26 pages) beside the JSON's "up to 25%/20%".
- The payload tagline reads "India's ONLY online MBA with Triple Industry Certification — PwC India (2 subjects co-taught …)", which is the tracked tagline issue.
- Both are outside this item's files and belong in a lib/data.ts follow-up.

**A3. "Never render" holds only for the visible DOM.**
- All 24 coupon pages ship emiCompatible, stackExample, discounts and totalFeeNum in their HTML source, through the CouponPageCTA client prop.
- That includes IGNOU `totalFeeNum: 66000` and Amity's unsourced stackExample "Rs 35,000-50,000 … effective fee Rs 1,75,000-1,90,000".
- **Fix:** pass CouponPageCTA only the fields it reads, or delete totalFeeNum.
- **Separately:** 76 built pages (blogs) still print IGNOU "₹66,000" visibly. That is out of this item's scope, but it is the same own-sum figure the FIX-LOG calls out.

**A4. Wording:**
- **best-online-mba-colleges-india-2026 FAQ:** "Amity does not publish online-MBA salary outcomes". This is defensible, since Amity's Rs 18 LPA covers all programmes, but it is inconsistent with four other posts that print Amity's Rs 18 LPA. "publishes no online-MBA salary range" would match them.
- **mba-vs-bba-which-is-better-2026:** a sentence now starts with lowercase "edifyedu.in counsellor interviews (2025 to 2026) give the following pattern". That also attributes the whole salary table to counsellor interviews alone.
- **mat-exam-2026-eligibility-pattern-dates:** the prose figure (A28) is gone, but the MAT colleges table still lists SRM/JAIN/Amity "Rs 6-10 LPA" as "Year 1 CTC". This is consistent with the NIRF campus medians but unlabelled.
- **"DY Patil Online: DY Patil Online states…" / "Amity Online: Amity Online states…":** these labels repeat the university name.

**A5. Parked metaDescription.** mba-marketing-career-salary-jobs-2026 keeps "Rs 12.2 LPA median, 20% digital premium", and the body no longer supports it. This is disclosed and parked until 5 Dec.

## Housekeeping

- Worktrees q20base, q20br and q20gates were removed after this report, node_modules junctions first.
- No servers were started; ports 3951/3952 were not needed.
- No site file was edited, committed or pushed.
