# QA rerun: D4 MBA fees (NIU, Alliance, Sharda, JIIT) after the fixes and main merge

**Branch:** `fix/d4-fees-niu-alliance` @ ea9ca19. That is a merge of bce995e (the D4 QA fixes) with 35ffee3 (origin/main, A8/A9, live).
**Checked:** 2026-11-18 · **Checker:** qa-checker · **First run:** `audits/qa/2026-11-18-d4-fees-premerge.md` (ccf74ce)

## Verdict: FAIL (narrow)

F1 to F6 are all fixed, and every fix was checked against ccf74ce first. The merge is clean. A8/A9 output is intact, the gates pass and no baseline went up.

Two small residuals keep this at FAIL:

- **R1.** The F1 fix moved NIU to Rs 1,18,000 on three Vignan pages. The untouched next sentence still says "Both are sub-Rs 1 lakh options", which is now false.
- **R2.** Two "lowest" fee superlatives about NIU remain in NIU's own hub JSON and in the NIU review. My first run missed these. They were present on ccf74ce, and they are false at Rs 1,18,000 (Galgotias is Rs 80,200).

Both fixes are text-only and take about 5 lines. After them, only a spot check is needed, not a full rerun.

| # | Check | Result |
|---|---|---|
| 1 | Fresh build | PASS (exit 0; line-ending-only churn in `lib/data/valid-urls.json` discarded) |
| 2 | F1 to F6 fixed, each search proven on ccf74ce | PASS for all six; **R1 is a side effect of the F1 fix** |
| 3 | EMIPlans on the 9 hubs that lose the grid | PASS |
| 4 | `lib/fee-plans.ts`: EMI row Total left blank | PASS |
| 5 | A8/A9 output intact after the merge | PASS |
| 6 | `lib/data.ts` / `data-slim` merged correctly (BITS plus the four fee universities) | PASS |
| 7 | Gates pass, no baseline raised | PASS |
| 8 | Titles (same ruling as the first run) | PASS |
| 9 | Rendering: D4 pages, spec pages, posts, /fees | PASS |
| - | Residual stale claims | **FAIL (R1, R2)** |

---

## 1. Build
- No other `next build` or `next start` was running. `npm run build` exited 0.
- The build left `lib/data/valid-urls.json` modified, but only in line endings: `git diff --ignore-cr-at-eol --quiet` returned clean. I restored it with `git checkout`.
- The tree now has only the coordinator's own uncommitted audit files (OPERATING-PLAN, QUESTIONS-FOR-RISHI, ranking-plan-tracker).

## 2. F1 to F6
I extracted ccf74ce with `git archive` and ran the same script (`fchecks.sh`, plain grep with literal patterns) on both trees.

| Signature | ccf74ce | ea9ca19 |
|---|---:|---:|
| F1: raw `97,600` / `88,500` in lib/data/page-content | 31 | **0** |
| F1: NIU-named sentence carrying an old NIU figure (sentence scanner from the first run) | 25 | **0** |
| F1: NIU-derived gaps ("NIU is Rs X more/cheaper", "Rs 38,400 to Rs 43,400", "sub-Rs 1 lakh option", "nearly half the fee") | 15 | 7: none about NIU (Galgotias, Vignan or JAIN "nearly half the fee"), apart from the 3 R1 sentences |
| F2: "Rs 55,000 more than DSU", "DSU is Rs 55,000", "Rs 64,500 less", "At Rs 1,75,000, it costs" | 5 | **0** |
| F2: Uttaranchal "nearly 2x" about JIIT | 2 (digital-marketing, hr-management) | **0**; the 6 remaining "nearly 2x" hits are all about DPU (Rs 1,89,400), unchanged and not D4 |
| F3: JIIT `43,500–44,500` in lib/blog.ts | 2 | **0**; both cells now read "Not published" |
| F4: "NIU both offer 25% Early Bird" | 1 | **0**; now "Chandigarh offers an Early Bird scholarship." |
| F5: `hasPublishedPlan` guard in components/EMIPlans.tsx | 0 | 2 |
| F6: emiStr for Alliance / JIIT | ₹9K/mo, ₹6K/mo | **₹8,700/mo, ₹5,850/mo** (the remaining ₹9K/₹6K strings belong to other universities, lines 35, 78 and 917) |

**Rendered checks:**
- The Vignan BA, Kurukshetra IT, Bharati Vidyapeeth agribusiness, DSU AI and Vignan HRM spec pages show 0 × "97,600" and 0 × "Rs 55,000 / Rs 64,500 / Rs 7,600 more / Rs 4,400 cheaper".
- /fees shows "₹8,700/mo" and "₹5,850/mo" in both the table and the cards.
- In the 13 touched posts, plus the two F3/F4 posts, there are 0 hits for 88,500, 97,600, 1,82,000, 1,54,500, 1,17,100, 5,833, 7,292, 43,500–44,500 or "NIU both offer". Every post returns 200 with one H1.
- The two F3/F4 posts keep `updatedAt` 2026-11-18.

**Wording check.** The bce995e word-diff of the page-content changes adds no number. Each change is one of three kinds:
- a 97,600 to 1,18,000 swap
- a gap deleted
- a sentence reworded to "costs more", "a lower fee" or "another option"

It adds 0 em dashes and no new URLs. The URL hits on "+" lines are unchanged lines inside rewritten long blog lines, and the removed and added sets are identical.

## 3. EMIPlans on the 9 hubs with a published plan
Two helpers listed the hubs where `programmeEmiFrom > 0` and `getFeePlans(u,'MBA')` is non-empty. I ran them from audits/qa/ and deleted them afterwards. There are exactly 9: Amity, MUJ, SMU, Symbiosis, NMIMS, MAHE, Bharati Vidyapeeth, Alliance and JIIT. 114 other hubs keep the grid.

| Hub | Live (35ffee3) grid | ea9ca19 grid | "Starting at" line | Card |
|---|---|---|---|---|
| amity/mba | yes | **no** | ₹8,906 | heading, Starting-at sentence and calculator link |
| manipal-university-jaipur/mba | yes | **no** | ₹6,517 | same |
| sikkim-manipal/mba | yes | **no** | ₹5,000 | same |
| symbiosis/mba | yes | **no** | ₹13,125 | same |
| nmims/mba | yes | **no** | ₹8,167 | same |
| mahe/mba | yes | **no** | ₹12,167 | same |
| bharati-vidyapeeth/mba | yes | **no** | ₹5,375 | same |
| alliance/mba | yes (₹7,250 / 24 months) | **no** | ₹8,700 | same |
| jaypee/mba | yes (₹7,292) | **no** | ₹5,850 | same |

- No card is empty: each keeps its "EMI Plans" heading, the "Starting at ₹X/month ..." sentence and the "Calculate your exact EMI →" link.
- All 9 return 200 with one H1, and all JSON-LD parses (10 or 11 blocks).
- **Control:** the JAIN MBA hub (no plan, emiFrom 6,667) still renders "Short tenure ₹26,667 · Popular ₹13,333 · Low monthly ₹6,667". The guard is therefore scoped to published-plan hubs.
- The 7 non-D4 hub titles are identical to live.

## 4. EMI row Total cell
In `lib/fee-plans.ts:86`, the Total cell is `r.total != null ? rupees(r.total) : r.instalment ? '' : 'Not published'`. The rendered HTML (style attributes stripped) shows:
- Alliance: `<td>No-cost EMI (per month, 20 months)</td><td>₹8,700</td><td></td>`
- JIIT: `<td>EMI (per month)</td><td>₹5,850</td><td></td>`

Rows with no instalment and no total still print "Not published".

## 5. A8/A9 after the merge
I used a substring detector (String.split, no built regex) over all 1,786 `.next/server/app/universities/**/*.html`. It uses the same needles as `2026-11-18-a8-a9-premerge-rerun.md`, whose base proof came from the f2f80c5 build.
- **Positive control:** I injected "25% fee waiver", "Scholarship Alert", "Your UGC-DEB ID" and an `Exams` label into a copy of the BITS hub. The detector reported 1 for each, and the Exams count went to 1/1.
- **A9 strings, raw and visible:** 0 for all 12. The needles are "20,000 - ", "25% fee waiver", "Alumni referral", "100% Online", "(Regular)", "hours/week", "provides placement assistance through", "Included in total (usually)", "common across all specialisations", "Core Subjects in", "Scholarship Alert" and "Fee Discounts Available".
- **BITS DEB claims:** 0 raw and 0 visible for "UGC-DEB entitled", "appears on the UGC-DEB", "QS World", "Goa university", `alt="UGC DEB"`, "Yes: UGC DEB" and "Your UGC-DEB ID". The raw "UGC DEB Approved" hits (22, two per BITS file) are the site-wide ItemList schema name "UGC DEB Approved Online Universities in India 2026"; that is site chrome, as before.
- **BITS hub DEB mentions:** I read every visible DEB mention by hand. Besides site chrome (header, footer, lead-form bullets, compare footnote, nav link), the only BITS statements are:
  - "Runs under UGC approval as an Institution of Eminence; not on the UGC-DEB programme register"
  - the A8 basis card ("does not appear on the UGC-DEB programme register", "lists no BITS Pilani rows from 2020-21 to 2026-27, checked 18 November 2026")
- **BITS MBA hub:** "Syllabus: Semester-wise" appears 0 times, and the "Request Official Syllabus" card is present.
- **Exams row:** shown on 585 of 610 pages for the 24 `CONFIRMED_EXAM_MODE` universities and on 0 of 1,176 for the rest. This is identical to the A8/A9 rerun.
- **Titles:** BITS profile, hub and all 9 spec pages, plus the Amity, NMIMS, MUJ and IGNOU profiles and the IGNOU hub. 16 of 16 match live 35ffee3 (`x-vercel-cache: HIT`, age 22 s).

## 6. Merge correctness
- Files changed on both sides since f2f80c5: FIX-LOG.md, data/sitemap-lastmod.json, lib/data.ts, lib/data-slim.ts and two BITS spec JSONs (digital-transformation, quality-management).
- **lib/data.ts and lib/data-slim.ts:** the content lines of `diff(35ffee3, ea9ca19)` are byte-identical to `diff(f2f80c5, ccf74ce)`, so the D4 side landed exactly. The lines of `diff(ccf74ce, ea9ca19)` are byte-identical to `diff(f2f80c5, 35ffee3)`, so the A8 BITS side landed exactly. Neither side lost or changed a line.
- **The two BITS JSONs:** both side diffs are identical on the same test. Quality-management keeps the A8 edits and carries the D4 Alliance Rs 1,74,000.
- **data/sitemap-lastmod.json:** parses. For all 428 URLs the merged date equals the later of bce995e and 35ffee3 (0 mismatches).
- **FIX-LOG:** both sides kept, per the coordinator.

## 7. Gates
- `bash .husky/pre-commit` exited 0: 46 steps, "all checks passed", and the tree was unchanged afterwards. Results:
  - verify-fees: 0 new mismatches.
  - check-blog-fees: 2026, unchanged.
  - check-hub-fee-text: 0.
  - em-dash-baseline: 234, unchanged.
  - fee-baseline: 205, unchanged.
  - protected-pages: OK.
- check-blog-updated-at skipped because nothing is staged. I checked by hand that both F3/F4 posts carry updatedAt 2026-11-18.
- Baselines since f2f80c5:
  - blog-fee-baseline went down only (2040 to 2026, unchanged since ccf74ce).
  - city-state noCity went from 43 to 42.
  - em-dash dropped the SectionCoreSubjects entry, and UniProgramBody went from 5 to 4.
  - fee-verification-allowlist lost Sharda's entry and gained none.
- No file under `.husky/` or `scripts/` changed.

## 8. Titles
The 8 D4 profiles and hubs, and the 22 own spec pages, render the same titles as the first run (spec titles diffed: identical).
- The Alliance and Sharda hubs and the NIU, Alliance and Sharda profiles carry the fee. The lead accepted this.
- The NIU and JIIT hubs and all JIIT pages are unchanged.
- No review-post title changed.
- bce995e and the merge add no title change.

## 9. Rendering
- All 8 D4 profiles and hubs return 200 with one H1, and all JSON-LD parses (8 or 10 blocks). There is no "undefined", NaN or ₹0, and no stale figure.
- The plan tables match the sheets: NIU 1,18,000 / 59,000 × 2 / 29,500 × 4 + 1,100; Alliance 1,74,000 / 43,500 × 4 / EMI 8,700 (20 months) + 1,000; Sharda 1,50,000 / 75,000 × 2 / 37,500 × 4 + 500 one-time and 3,500 a year; JIIT 1,75,000 + EMI 5,850.
- NIU and Sharda show no EMI figure.
- All 22 own spec pages return 200 with one H1, JSON-LD parses, and there are no stale figures or bad tokens.

---

## Failures and exact fixes

### R1. "Both are sub-Rs 1 lakh options" is now false (NIU is Rs 1,18,000)
The sentence sits in the "vs NIU" paragraph, right after "NIU costs more.":
- `lib/data/page-content/vignan-university-online-mba-business-analytics.json:78`: "... Vignan at Rs 90,000 is cheaper with NAAC A+ and NIRF University #70. Both are sub-Rs 1 lakh options with dedicated analytics tracks."
- `lib/data/page-content/vignan-university-online-mba-healthcare-management.json:78`: "NIU costs more. Both are sub-Rs 1 lakh options with dedicated healthcare tracks."
- `lib/data/page-content/vignan-university-online-mba-it-management.json:74`: "NIU costs more. Both are sub-Rs 1 lakh options."

**Fix:** remove the "sub-Rs 1 lakh" claim and keep the rest:
- "Both offer dedicated analytics tracks."
- "Both offer dedicated healthcare tracks."
- Delete "Both are sub-Rs 1 lakh options." in the IT file.

### R2. NIU "lowest fee" superlatives (missed in my first run; present on ccf74ce)
- `lib/data/page-content/noida-international-university-online-mba.json:75`: "Choose NIU Online MBA if: your primary goal is a UGC-DEB approved degree at the lowest available fee; ..."
  **Fix:** "...a UGC-DEB approved degree at a budget fee; ..."
- `lib/blog.ts:29662` (noida-international-university-online-mba-review): "NIU offers the most detailed healthcare MBA at the lowest price in the market."
  **Fix:** "NIU offers one of the most detailed healthcare MBA syllabi among budget programmes."
  - This removes the fee superlative. The sentence carries no rupee figure, so check-blog-fees is unaffected.
  - updatedAt is already 2026-11-18.

**Re-test after R1/R2:**
- `grep -c "Both are sub-Rs 1 lakh options"` over lib/data/page-content returns 0.
- `grep -c "lowest available fee"` on the NIU hub JSON returns 0.
- `grep -c "lowest price in the market"` in lib/blog.ts returns 0, or check that any remaining hit is not about NIU.
- Run `node scripts/check-page-content-json.mjs`, `node scripts/check-page-content-facts.mjs` and `npx tsx scripts/check-blog-fees.mjs`.
- No rebuild is needed for the verdict. Render the three Vignan spec pages and the NIU hub once.

## Advisories (not blocking)
- **Collateral change on 7 non-D4 hubs:** Amity, MUJ, SMU, Symbiosis, NMIMS, MAHE and Bharati Vidyapeeth now show only "Starting at ₹X/month" without the 6/12/24 grid. That is a reduction of Edify-computed figures, and their titles are unchanged. Some of those "Starting at" values may themselves be fee/24 arithmetic, for example NMIMS 8,167 = 1,96,000 / 24; that predates this branch.
- `components/UniversityPageClient.tsx:309` and `:827` print an "Exam Mode: Online" stat for every university, including unconfirmed ones such as Alliance and JIIT. The A9 confirmed-only rule covers the QuickFacts Exams row, not this stat. It is on main (35ffee3) and not part of D4.
- The profile discount block still says "No-cost EMI, 12 to 24 months, from ₹8,700/month" for Alliance, which publishes 20 months, and "from ₹5,850" for JIIT, whose tenure is unstated. The same block still shows "Total Fee ₹1.7L – ₹1.7L" and "₹1.8L – ₹1.8L". These are template issues from the first run, still open.
- The "nearly 2x the cost" lines about DPU in 6 Uttaranchal spec JSONs (1,89,400 / 99,600 = 1.9) are unchanged and not D4.
