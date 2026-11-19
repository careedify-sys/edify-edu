# QA: D4 MBA fees (NIU, Alliance, Sharda, JIIT), pre-merge

**Branch:** `fix/d4-fees-niu-alliance` · **Commit:** ccf74ce on base f2f80c5 (= origin/main) · **Checked:** 2026-11-18 · **Checker:** qa-checker (outsider review; no code changed, nothing committed)

## Overall: FAIL

The core record is right. lib/data.ts, data-slim, fees-hub-data, the four hubs and profiles, the 22 own spec pages and the 13 posts all carry the published figures. Build and all 46 gates pass, and titles are within the lead's ruling.

The merge still fails on four counts:

- The peer sweep missed NIU completely. 25 typed "Rs 97,600" claims for NIU remain on 11 peer spec pages, and they render.
- Several derived gaps from old figures survive, including an Alliance "Rs 1,75,000" in a paragraph headed "(Rs 1,74,000)".
- Two touched posts still print an unpublished JIIT semester split.
- One touched post still says NIU offers a 25% early-bird scholarship.

There is also a rendering problem. The Alliance and JIIT MBA hubs print Edify-computed EMI tenures beside the published EMI: Alliance shows Rs 7,250 a month, which is below the published Rs 8,700 minimum, and JIIT shows the stale Rs 7,292.

| # | Check | Result |
|---|---|---|
| 1 | Fidelity | FAIL (F2, F4, F5, F6) |
| 2 | Stale figures gone | FAIL (F1, F2, F3) |
| 3 | Gates | PASS |
| 4 | Titles | PASS |
| 5 | Rendering | FAIL (F5); the rest PASS |
| 6 | House rules | PASS |
| - | Scope (diff touches only the item's files) | PASS |
| - | Build | PASS |

---

## Evidence by check

### Build and scope: PASS
- `npm run build` exit 0. No dev server or build ran in this checkout; a gate run in worktree `agent-aa54b23eef72b2b08` was left alone. Warnings were lint-only (`<img>`, exhaustive-deps).
- The build left `lib/data/valid-urls.json` modified in the working tree with a line-ending-only change (`git diff` shows no content lines). Discard it before merging.
- Diff: 81 files: lib/data.ts, lib/data-slim.ts, data/fees-hub-data.json, data/fee-verification-allowlist.json, data/blog-fee-baseline.json, data/sitemap-lastmod.json (gate-generated), 71 page-content JSONs, lib/blog.ts, the jaypee/sharda verify sheets and FIX-LOG. Nothing outside the item.

### 1. Fidelity: FAIL

**Record figures vs sheets/answers (PASS):**

| Uni | Field | Branch value | Source | OK |
|---|---|---|---|---|
| NIU | feeMin/feeMax, programFees.mba, feePlans total | 1,18,000 | sheet: "MBA Total Fees INR 118000" | yes |
| NIU | semester / annual | 29,500 x 4 / 59,000 x 2 | sheet | yes |
| NIU | application extra | 1,100 one-time, separate | sheet | yes |
| NIU | emiFrom | 0 | sheet: no EMI published | yes |
| Alliance | total | 1,74,000 | sheet: "Full Course Fee INR 1,74,000" | yes |
| Alliance | semester | 43,500 | sheet | yes |
| Alliance | registration | 1,000 extra | sheet | yes |
| Alliance | EMI | 8,700, 20 months | sheet: no-cost EMI from 8,700 for 20 months | yes |
| Sharda | total / annual / semester | 1,50,000 / 75,000 / 37,500 | Q3 answer + sheet | yes |
| Sharda | registration / exam | 500 one-time / 3,500 a year, not added | Q3 answer | yes |
| Sharda | emiFrom | 0 | sheet: no monthly figure | yes |
| JIIT | total | 1,75,000, includes exams and admission | Q4/Q5 answers | yes |
| JIIT | EMI | 5,850, tenure not stated | brochure p.31 per sheet | yes |

- No figure was summed by us: plan-row totals equal the published totals (43,500 x 4 = 1,74,000 and so on), and Sharda's extras are never added in.
- No marketed percentage was added. No EMI was invented in the data.
- The Sharda "NAAC A++" to "A+" change in 2 posts matches `data/naac-verified.json` (A+, to 2030-01-17). This corrects the record toward the existing source, so it adds no new fact.

**Peer JSON sample (PASS for what was changed).** All 95 changed fragments in the 43 peer files were extracted. Every replaced figure follows the target university's name. 12 samples:
1. assam-don-bosco ... finance: "**vs Sharda Online MBA Finance (Rs ~~1,54,500~~ 1,50,000"
2. bharati-vidyapeeth ... business-analytics: "close to Alliance (Rs ~~1,75,000~~ 1,74,000"
3. bharati-vidyapeeth ... finance: "Sharda Finance (Rs ~~1,54,500~~ 1,50,000)"
4. bit-mesra ... business-analytics: "JIIT Online MBA in IT and Business Analytics (Rs ~~1,82,000~~ 1,75,000"
5. bits-pilani ... quality-management: "Alliance at Rs ~~1,75,000~~ 1,74,000"
6. chitkara ... finance: "Sharda Finance (Rs 1,50,000) is ~~Rs 45,500~~ cheaper"
7. dr-mgr ... information-systems: "JIIT is ~~Rs 41,000 to Rs 46,000~~ more expensive"
8. galgotias ... business-analytics: "JIIT at ~~₹1,82,000~~ ₹1,75,000"
9. integral ... finance: "Sharda University (Rs ~~1,54,500~~ 1,50,000"
10. kurukshetra ... it-management: "JIIT Online MBA IT and Business Analytics (Rs ~~1,82,000~~ 1,75,000)"
11. uttaranchal ... financial-management: "At ~~nearly 2x the cost~~ a higher fee"
12. vignan-university-online-mba.json: "Sharda ... Rs ~~1,40,000~~ 1,50,000 ... justifies the ~~Rs 50,000 premium~~ higher fee"

No reworded gap sentence contains a new derived number.

**Fidelity failures:** F2 (surviving derived gaps), F4 (NIU 25% early bird), F5 (template EMI tenures), F6 (rounded EMI strings). See below.

### 2. Stale figures gone: FAIL
- **Control (the search finds the old values on base f2f80c5).**
  - The sentence-level scanner (target university named, plus its old figure in all three notations) gave **408 hits on base** and **33 on head**. On head, 25 are NIU 97,600 (F1) and 8 are false positives: BVP Rs 1,60,000 and UPES/JIIT Rs 1,75,000 in shared lists.
  - The rendered-page scanner on live (cached base, `x-vercel-cache: HIT`) found 3,688 / 6,667 / 1.6L / 5,833 / 1.4L / 7,292 on the 8 pages. Locally on head it found none, apart from 7,292 on the JIIT hub (F5).
- **Clean on head:**
  - ₹1,82,000 / 1.82L, ₹1,40,000 / 1.4L / 1.40 lakh, ₹1,54,500, ₹88,500 / 88.5K and ₹5,833 for these four universities: 0 hits across the hubs, profiles and all 22 own spec pages (rendered), and 0 in the 13 posts (source and rendered).
  - The Rs 2,500 template EMI is gone from all four hubs.
  - In lib/data.ts the old values survive only inside comments.
- **Not clean:** F1, F2, F3.

### 3. Gates: PASS
- `bash .husky/pre-commit` exit 0, 46 steps, "all checks passed". Results:
  - verify-fees: 0 new mismatches, 5 allowlisted.
  - check-blog-fees: 2026, unchanged from baseline.
  - check-hub-fee-text: self-test 16/16, 0 differing figures.
  - check-page-content-json: 431 parse.
  - check-protected-pages: 8 frozen posts OK.
- No gate script, `.husky/` file or allowlist was changed apart from removing the Sharda entry from `data/fee-verification-allowlist.json`. No entry was added.
- `data/blog-fee-baseline.json` went down only:

  | Slug | Before | After |
  |---|---|---|
  | noida-international-university-online-mba-review | 14 | 11 |
  | jaypee-jiit-online-mba-review | 17 | 10 |
  | online-mba-business-data-analytics-india-2026 | 45 | 43 |
  | jain-online-mba-review-2026 | 14 | 12 |

  The total fell from 2040 to 2026, a drop of 14, which equals the sum of the four per-slug drops. No slug went up.

### 4. Titles: PASS
Before = live (cached base). After = local `next start` on ccf74ce.

| Page | Before | After | Verdict |
|---|---|---|---|
| NIU profile | Noida International Online 2026: Courses, NAAC A+ | Noida International Online 2026: Courses, MBA ₹1,18,000 | accepted (lead ruling) |
| NIU MBA hub | NIU Online MBA: Specialisations, Eligibility and Admission | unchanged | required unchanged: OK |
| Alliance profile | Alliance University Online 2026: Courses, NAAC A+ | Alliance University Online 2026: Courses, MBA ₹1,74,000 | accepted |
| Alliance MBA hub | Alliance University Online MBA 2026 \| edifyedu.in | Alliance Online MBA Fees 2026: ₹1,74,000 \| edifyedu.in | accepted |
| Sharda profile | Sharda University Online 2026: Courses, NAAC A+ | Sharda University Online 2026: Courses, MBA ₹1,50,000 | accepted |
| Sharda MBA hub | Sharda University Online MBA 2026 \| edifyedu.in | Sharda Online MBA Fees 2026: ₹1,50,000 \| edifyedu.in | accepted |
| JIIT profile | Jaypee University Online 2026: Courses, MBA ₹1,75,000 | unchanged | OK |
| JIIT MBA hub | Jaypee Online MBA: Specialisations and Admission | unchanged | OK |
| JIIT spec pages (4) | | all unchanged | OK |
| Review posts (lib/blog.ts) | | no title or H1 changed (NIU review metaDescription changed; it is not a frozen post) | OK |

For information, outside the ruling's wording but not a fail under this brief, five spec titles gained a fee suffix. FIX-LOG documents this:
- Alliance finance and marketing: "...2026: ₹1,74,000"
- NIU finance: "...2026: ₹1,18,000"
- Sharda finance and marketing: "...2026: ₹1,50,000"

### 5. Rendering: FAIL (F5 only)
`npx next start -p 3124` (PID 2288, stopped by PID afterwards; port free).

| URL | Status | H1 | JSON-LD | Plan table vs sheet | undefined/NaN/₹0 | EMI |
|---|---|---|---|---|---|---|
| /universities/noida-international-university-online | 200 | 1 | 8/8 parse | 1,18,000; 59,000 x 2; 29,500 x 4; application 1,100; exams included | none | none shown (discount-block template text only) |
| .../noida-international-university-online/mba | 200 | 1 | 10/10 | same | none | none |
| /universities/alliance-university-online | 200 | 1 | 8/8 | 1,74,000; 43,500 x 4; EMI 8,700 (20 months); registration 1,000 | none | 8,700 |
| .../alliance-university-online/mba | 200 | 1 | 10/10 | same | none | **8,700 plus derived 29,000 / 14,500 / 7,250 (F5)** |
| /universities/sharda-university-online | 200 | 1 | 8/8 | 1,50,000; 75,000 x 2; 37,500 x 4; registration 500 one-time; exam 3,500 a year, "not in the total" | none | none |
| .../sharda-university-online/mba | 200 | 1 | 10/10 | same | none | none ("EMI options are confirmed once the university publishes...") |
| /universities/jaypee-university-online | 200 | 1 | 8/8 | 1,75,000; EMI 5,850; note: exams and admission included | none | 5,850 |
| .../jaypee-university-online/mba | 200 | 1 | 10/10 | same | none | **5,850 plus derived 29,167 / 14,583 / 7,292 (F5)** |

- All 22 own spec pages returned 200, with 1 H1, JSON-LD parsing, no stale figures and no bad tokens. EMIPlans does not render on the spec pages.
- All 13 touched posts (plus /blog checks) returned 200, with 1 H1, no "undefined" or NaN, and no stale figures.
- /fees returns 200 and shows NIU and Sharda "Not published", Alliance ₹1.74L "₹9K/mo" and JIIT ₹1.75L "₹6K/mo" (F6).

### 6. House rules: PASS
- Em dashes: 0 added and 0 removed in the lib/ and data/ diff.
- No new link to an official university site:
  - Counts of `href` to niuonline/allianceonline/shardaonline/jiitonline in lib/blog.ts are unchanged from base to head (NIU 2/2, others 0/0).
  - The 2 NIU hrefs sit on lines this commit touched, but they predate it.
  - No URL was added to page-content.

---

## Failures and exact fixes

### F1. NIU's old Rs 97,600 survives in 11 peer spec JSONs (25 places, all rendered)
Confirmed rendered on /universities/vignan-university-online/mba/business-analytics, /kurukshetra-university-online/mba/it-management and /bharati-vidyapeeth-university-online/mba/agribusiness. The commit swept Sharda, JIIT and Alliance peers but no NIU peers.

Files (lib/data/page-content/) and lines:
- bharati-vidyapeeth-university-online-mba-agribusiness.json: 13, 27, 46, 65
- bharati-vidyapeeth-university-online-mba-international-business.json: 27, 54, 64
- bharati-vidyapeeth-university-online-mba-retail.json: 27, 50, 64
- bits-pilani-work-integrated-online-mba-hospital-health-systems-management.json: 58, 96
- dr-mgr-educational-research-institute-online-mba-healthcare-management.json: 90, 128
- integral-university-online-mba-international-business.json: 27, 64
- integral-university-online-mba-retail-management.json: 27, 64
- kurukshetra-university-online-mba-it-management.json: 98
- vignan-university-online-mba-business-analytics.json: 78, 117
- vignan-university-online-mba-healthcare-management.json: 78, 116
- vignan-university-online-mba-it-management.json: 74, 112

**Fix:**
1. Replace every NIU `Rs 97,600` with `Rs 1,18,000`, matching only where NIU or Noida International University is the nearest preceding university name.
2. In the same sentences, drop or reword the claims derived from 97,600 without adding a number:
   - dr-mgr ... healthcare line 90: "NIU is Rs 38,400 to Rs 43,400 cheaper." becomes "NIU is cheaper."
   - kurukshetra line 98: "NIU at Rs 97,600 is Rs 4,400 cheaper." becomes "NIU costs more." (Kurukshetra is Rs 1,02,000.)
   - vignan business-analytics 78, healthcare 78 and it-management 74: "NIU is Rs 7,600 more." becomes "NIU costs more."
   - "sub-Rs 1 lakh option" (vignan healthcare 116, it-management 112), "under Rs 1 lakh" (bits-pilani 58) and "at nearly half the fee" (bharati agribusiness 65): delete the phrase.
   - "the budget option" / "a known budget option": keep or soften.
3. Re-run `node scripts/check-page-content-json.mjs` and `check-page-content-facts`.

### F2. Derived gaps from old figures still present
- `lib/data/page-content/dayananda-sagar-university-online-mba-artificial-intelligence.json:27`: under the header "(Rs 1,74,000)", the text still reads "At Rs 1,75,000, it costs Rs 55,000 more than DSU." That is the old Alliance fee plus a derived gap. **Fix:** replace that sentence with "It costs more than DSU."
- `lib/data/page-content/dayananda-sagar-university-online-mba-business-analytics.json:27`: "DSU is Rs 55,000 cheaper with a higher NAAC grade (A++ vs A+)." **Fix:** "DSU is cheaper with a higher NAAC grade (A++ vs A+)."
- `lib/data/page-content/vignan-university-online-mba-human-resource-management.json:74` and `lib/data/page-content/vignan-university-online-mba-healthcare-management.json:78`: "Vignan delivers similar accreditation at Rs 64,500 less." (1,54,500 - 90,000). **Fix:** "Vignan delivers similar accreditation at a lower fee."

### F3. JIIT unpublished semester split still in two touched posts
- `lib/blog.ts:36266` (mba-hr-management-online-india-2026), table row `<td>JIIT Online</td><td>Human Resource</td><td>₹1,75,000</td><td>₹43,500–44,500</td>`
- `lib/blog.ts:36523` (online-mba-business-data-analytics-india-2026), row `<td><strong>JIIT Online</strong></td>...<td><strong>₹1,75,000</strong></td><td>₹43,500-44,500</td>`

The sheet says JIIT publishes no per-semester rupee figure. The 44,500 is the 43,000 + 1,500 exam split that the JIIT review just removed, and it contradicts Q4 (exams are inside the total).

**Fix:** set that cell to `Not published` in both rows. If the per-slug count moves, check-blog-fees will ratchet the baseline down. Do not reword the neighbouring fee sentences (the fee gate is phrasing-sensitive).

### F4. NIU "25% Early Bird" claim in a touched post
`lib/blog.ts:36255` (mba-hr-management-online-india-2026, FAQ): "Chandigarh and NIU both offer 25% Early Bird scholarships."

This is a marketed percentage for NIU with no source. It contradicts the NIU review's new copy, "MBA page publishes no rupee scholarship". FIX-LOG lists it under "Left open", but it is a stale NIU fee claim inside the D4 sweep scope.

**Fix:** "Chandigarh offers a 25% Early Bird scholarship."

### F5. Edify-computed EMI tenures render beside the published EMI (Alliance and JIIT MBA hubs)
`components/EMIPlans.tsx:18-27` divides `u.feeMin` by 6, 12 and 24.
- **Alliance hub** shows "Starting at ₹8,700/month", then "Low monthly ₹7,250/month · 24 months". That is a figure below the university's published minimum, and the 24-month tenure is not published (it is 20 months). This contradiction is new in this commit: before it, the 24-month card equalled emiFrom.
- **JIIT hub** shows "₹7,292/month · 24 months". That is exactly the Edify 1,75,000 / 24 figure the commit says it removed (FIX-LOG: "the old 7,292 was 1,75,000 / 24, our own arithmetic").

**Fix:** in `components/EMIPlans.tsx`, skip the derived grid when the programme has a published plan table. After line 16, add:
```tsx
const hasPublishedPlan = !!u.feePlans?.[program.toLowerCase() as keyof typeof u.feePlans]?.length
```
Then wrap the `<div className="grid grid-cols-3 ...">` block, and the "EMI figures are indicative" line under it, in `{!hasPublishedPlan && (...)}`. The "Starting at" sentence stays.

Re-run `check-hub-fee-text`, then render-check /universities/alliance-university-online/mba and /universities/jaypee-university-online/mba for the absence of 7,250 and 7,292. If the coordinator prefers not to touch a shared template inside D4, the alternative is a JIIT-and-Alliance guard in the same file. Either way, these two hubs must not render 7,250 or 7,292.

### F6. Rounded EMI strings in the fees hub do not equal the published figures
- `data/fees-hub-data.json:1258` (alliance-university-online): `"emiStr": "₹9K/mo"`. Published: Rs 8,700.
- `data/fees-hub-data.json:1353` (jaypee-university-online): `"emiStr": "₹6K/mo"`. Published: Rs 5,850.

Both render on /fees. **Fix:** `"₹8,700/mo"` and `"₹5,850/mo"`. The file already has the exact-figure precedent `"₹6,187/mo"` at line 2196.

---

## Advisories (not blocking, pre-existing or outside D4)
- `components/UniversityPageClient.tsx:717-718` is a discount block shown on all four profiles and site-wide. It says "up to 25% fee waiver", "No-cost EMI, 12 to 24 months, from ₹8,700/month" (Alliance publishes 20 months) and "early-bird discounts available". It is a template and was live on base too. Raise it as its own item.
- The profile discount cards print "Total Fee ₹1.7L – ₹1.7L" (Alliance, 1,74,000) and "₹1.8L – ₹1.8L" (JIIT). These are rounding and a degenerate range.
- In the plan table, the EMI rows print "Not published" in the Total column (Alliance, JIIT). It reads as if the EMI itself were unpublished; a dash or blank would be clearer.
- /fees mobile cards read "EMI from Not published" (NIU, Sharda). The same pattern already exists on 18 other rows.
- `uttaranchal-university-online-mba-digital-marketing.json:70` and `...-hr-management.json:70` still say "nearly 2x the cost" about JIIT. Four sibling files were reworded to "a higher fee". Ratio 1.76, not new.
- The NIU and Alliance verify sheets have no "Resolution (2026-11-18)" section recording what was applied; Sharda and JIIT do.
- Restore the line-ending-only change to `lib/data/valid-urls.json` left by the build.

## Re-test after fixes
1. `npm run build`, then `bash .husky/pre-commit`.
2. Re-run the stale scan: 0 NIU `97,600`/`88,500` in lib/data/page-content; 0 `43,500.44,500` for JIIT in lib/blog.ts; 0 "NIU ... Early Bird".
3. Render the Alliance and JIIT MBA hubs and confirm no 7,250 or 7,292.
4. Render /fees and confirm ₹8,700/mo and ₹5,850/mo.
5. Spot-render the three peer spec URLs named in F1.
