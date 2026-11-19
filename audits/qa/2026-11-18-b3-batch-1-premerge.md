# QA pre-merge: B3 batch 1 (fix/b3-batch-1 @ 0703326, base 1021c26 = origin/main, live)

Checked 2026-11-18 by qa-checker. Worktree: `.claude/worktrees/agent-a1d5d379a0da08837`.

**Before** is a fresh production build of 1021c26: `git archive` into the scratchpad, `npm run build`, then `next start -p 3126`. **After** is a fresh build of 0703326 in the worktree, run with `next start -p 3125`. Both builds exited 0 with 2,360 static pages and 1,786 `universities/**` HTML files. Nothing else was building in either directory. Both servers were stopped afterwards (PIDs 19892 and 42272). The prebuild LF churn on 12 generated files was restored with `git checkout`, and `git status` in the worktree is clean.

## Overall: FAIL

The data edits that were made are faithful to the sheets. Each one I sampled matches a FIX or REMOVE row, and the hub fee tables match the sheets exactly.

The batch fails for four reasons:

1. **JAIN.**
   - The three removed AI tracks still render as tiles on the JAIN hub, which also says "16 Specialisations".
   - The three JAIN AI spec pages changed their `<title>`, H1 and meta. The brief requires them to be unchanged.
2. **Incomplete sweep, rendered.** The FIX-LOG says the blogs were swept. The same claims the batch removes still render on live-indexable pages:
   - DSU "NAAC A++, the highest grade" on 5 DSU spec pages and 4 blog posts;
   - DSU "EMI Rs 5,000 to 6,000" in the DSU review the batch edited;
   - SSODL "NIRF Management 11" in 6 posts;
   - Symbiosis "₹6L to ₹10L" salary and "WES recognised" in nmims-vs-symbiosis, which the batch edited;
   - DPU "EMI ~Rs 7,890" in mba-fees-india-complete-guide, which the batch edited;
   - JAIN "20-plus" or "18" specialisations in 7 posts;
   - the removed JAIN AI tracks in 5 peer pages and 1 compare FAQ.
3. **An invented EMI offer.** The profiles of DSU and Galgotias now print "No-cost EMI, 12 to 24 month plans via partner banks". Neither university publishes any EMI.
4. **A FIX-LOG claim is wrong.** It says the derived ₹1.19L gap "is reworded without a number". Only one instance was reworded. Eight more remain in the same post (see A2).

| # | Check | Result |
|---|---|---|
| 1 | Fidelity of changed facts | PASS for the edits made (19 sampled). FAIL on the JAIN AI pages (F1) and the EMI fallback (F3) |
| 2 | Sweep completeness | **FAIL** (F2a to F2h) |
| 3 | Built output, before/after counts, A8/A9/D4 intact | PASS (counts below). A9 0, BITS DEB 0, D4 totals unchanged |
| 4 | 3 removed URLs | PASS: real 308s, exact 3-URL diff. **FAIL:** the JAIN `ai-*` pages are not unchanged (F1) |
| 5 | Gates | PASS |
| 6 | Titles | **FAIL** on 3 JAIN AI spec pages (F1). All other titles and H1s are byte-identical; only 4 unfrozen meta descriptions changed |
| 7 | Rendering of 6 profiles and 6 hubs | PASS: 200, one H1, JSON-LD parses, no undefined/NaN/₹0, fee tables match the sheets. Exception: the JAIN tile grid (F1) |
| 8 | House rules | PASS: 0 em dashes added (1 removed), 0 official-site links or hostnames in visible copy |

---

## 1. Fidelity (PASS for the edits made)

**Sample: 19 changed sentences or values, each checked against its sheet row**

- **Symbiosis**
  - rankingBadge reads "NIRF #24 (University 2025)". Row "Profile hero badge", FIX.
  - The hub pill reads "NIRF (Eng 2025) #46". Row "NIRF Engineering", FIX.
  - The FAQ reads "NIRF #24 University 2025." Row "NIRF FAQ answer".
  - Assessment reads 30/70, Grade Point 4, CGPA 4.00. Row "Assessment weighting".
  - The certificate "states that the programme was delivered in Online mode". Row "Degree certificate wording".
  - The Semester 1 list is the July 2026 batch, Annexure A, 10 courses ending with Enterprise Risk Management. Row "Syllabus".
  - WES is out of approvals, the SVG badge, alt text and the IB FAQ. Row "WES recognition", REMOVE.
- **BITS**
  - Eligibility is 60% with 1 or 2 years of work experience, employed when applying. Row "Eligibility".
  - The fee table shows 3,12,400 / 93,100 / 73,100 / 1,500 / 18,500, with no exam fee. Rows "Fee components" and "Exam fee".
  - Classes read "7 to 8 hours a week", 32 hours of live instruction per course, exams in person. Row "Learning model".
  - The EMI reads "0% interest ... publishes no monthly figure". Row "EMI".
- **Galgotias**
  - feeMax is 80,200 and the lines read 35,000/yr, 4,000/yr, 1,200 and 1,000, never summed. Rows "feeMax" and "Fee components".
  - Eligibility reads "Graduation pass", and the hub shows "Grad (pass)". Row "Eligibility".
- **JAIN**
  - The 16-elective list is exact, and Supply Chain moved to the Rs 1,75,000 tier. Rows "Specialisations" and "Programme fee range".
  - The EMI is Rs 6,917 as published, with registration Rs 2,500 and exam Rs 3,000/yr as extras. Rows "EMI" and "Fee components".
- **DSU**
  - The JSON NAAC is A+, red flag 1 is deleted, and "private university established by a Karnataka State Act" is used. Rows "NAAC grade in content" and "University type".
  - The fee table shows 1,30,000 / 32,875 / 32,375 / 65,250 / 64,750 / 30,500 / 1,875 / 500, with the Rs 1,000 application fee outside the total. Rows "Fee components" and "Application fee".
- **DPU**
  - City is Pune; semesters are 50,000/50,000/45,000/44,400; the scholarship is Rs 10,000; 10 to 12 hours a week; the certificate does not record the mode. All are matching rows.
- **Blog (online-mba-bfsi):** DSU "Financial Management ... markets, M&A, portfolio, derivatives and international finance". Row "Specialisations, record".

**Open questions (Q8, Q8b, Q9 to Q23)**

- No intake line, NAAC validity, Symbiosis Rs 1,000 label, spec addition, edX variant or DPU salary was touched.
- JAIN feeMin and feeMax are unchanged (Q13).
- `psuEligible` on BITS is unchanged (Q8b).

**Arithmetic**

- No new sum, no marketed percentage, and no new EMI figure appears in the diff.
- The new comparative wording carries no number: "JAIN's published EMI is the lower of the two", "the fee difference", "the lower fee matters more".

**Minor fidelity notes (advisory)**

- The `lib/data.ts` comment and FIX-LOG say the JAIN AI pages are "Q25/Q32 territory". Q25 is about Amity and Q32 is about Adichunchanagiri. No question covers the three JAIN pages, so file one.
- `galgotias-university-online-mba.json` `specializationsOverview` now says "Business Analytics & IT". That contradicts FIX-LOG ("Not applied") and Q33 ("old spec name stays"). It is latent: 0 rendered hits. Revert it to "Business Analytics", or note it in Q33.

## 2. Sweep completeness (FAIL)

**Method**

- I ran `git grep -F -o` on 1021c26 and on 0703326 over `lib`, `components`, `app` and `data/fees-hub-data.json`, so every search is proven on base first.
- I also counted plain substrings across all 2,335 built HTML files, base build against branch build, in visible text with scripts and tags stripped.
- "Rendered" below means the string is in the branch build's visible text.

**Cleared:**

| Figure | Base | Branch | Remaining |
|---|---|---|---|
| 13,017 | 10 | 0 | none |
| 13,000-15,000 | 2 | 0 | none |
| 3,342 | 21 | 0 | none |
| 13,125 | 16 | 0 | none |
| 4,958 | 2 | 0 | none |
| 7,892 | 19 | 0 | none |
| 12,781 | 1 | 0 | none rendered; 15 latent copies in `syllabus-manifest.json` `fees` fields, which nothing renders |
| 86,400 (Galgotias) | n/a | 0 | none in content |
| ₹80K – ₹86K | 4 | 0 | none |
| NIRF #11 (Management) | 1 | 0 | none |
| Sant Tukaram Nagar | 6 | 1 | the remaining hit is a correct full NAAC address in is-dy-patil-online-fake-or-legit |
| ₹6,667 (JAIN) | n/a | 0 | none for JAIN; the remaining hits belong to VIT, Mysore and others |

**Not cleared (each item is rendered unless marked):**

- **F2a. DSU still "NAAC A++".**
  - 5 spec JSONs:
    - `lib/data/page-content/dayananda-sagar-university-online-mba-{artificial-intelligence,business-analytics,financial-management-fintech-focus,it-systems-management,supply-chain-management}.json`, at lines 11, 13, 27, 30, 33 and 59 in the AI file.
    - Examples: "DSU holds NAAC A++ accreditation, the highest grade NAAC awards", "The degree carries NAAC A++ accreditation, the highest NAAC grade" (line 33, the same paragraph where the batch deleted the WES sentence), and "You want the highest NAAC grade (A++)" (line 59).
    - Rendered on the AI page 16 times.
    - Fix: change every DSU "A++" to "A+" and delete "the highest (NAAC) grade" and "higher accreditation grade" in those 5 files.
  - Blog:
    - `lib/blog.ts:28018` and `:28043` (vignan-online-mba-review)
    - `:30356` (dy-patil-online-mba-review)
    - `:36523` (online-mba-business-data-analytics-india-2026: "DSU at ₹1,30,000 (NAAC A++)")
    - `:36597` (online-mba-entrepreneurship-india-2026: "NAAC A++ accreditation makes this the most affordable A++ rated" and "need an A++ rated brand: DSU Online")
    - `:36266` (mba-hr-management-online-india-2026: "All are NAAC A or A++ rated", where DSU is in the group)
    - Fix: A++ becomes A+ for DSU. Reword the A++ superlatives with no new claim.
- **F2b. DSU EMI and per-semester figures.**
  - In dsu-online-mba-review (the batch edited 14 hunks in this post):
    - `lib/blog.ts:28096`, `:28122`, `:28178` and `:28187` say "EMI option ... Rs 5,000 to Rs 6,000 per month".
    - `:28121` and `:28443` say "Per Semester Rs. 30,000".
    - `:28104` says "Seven specializations", and `:28379` says "seven tracks". DSU lists 8.
    - `:28317` and `:28385` say the syllabus is "not easily available" or "Thin". The sheet says the full curriculum is published; that is red flag 2, REMOVE.
  - In online-mba-entrepreneurship-india-2026, `lib/blog.ts:36597` says "₹30,000 per semester", "EMI options range from ₹5,000 to ₹6,000".
  - In the 4 DSU spec JSONs listed in F2a, line 30 says "Zero-cost EMI starting Rs 5,000-6,000/month" and "(Rs 32,500 per semester)". These are latent, because the spec pages now render the fee plan. Line 62 says "You prefer zero-cost EMI directly through the university", and that is rendered.
  - Fix:
    - "DSU publishes no EMI figure"
    - "Semester 1 Rs 32,875, Semesters 2 to 4 Rs 32,375 each" (sheet row "Fee components")
    - "eight electives"
    - delete the syllabus-unavailable claims.
- **F2c. SSODL "NIRF Management 11".**
  - Posts:
    - `lib/blog.ts:8611` (mba-fees-india-complete-guide-2026, which this batch edited)
    - `:16917` (online-mba-government-employees-india-2026)
    - `:17894` (distance-mba-chennai-2026)
    - `:18188` (distance-mba-hyderabad-2026)
    - `:18454` and `:18459` (online-mba-ahmedabad-gujarat-2026)
    - `:43858` (nirf-ranking-explained-online-mba-2026, table row "Symbiosis SSODL | #24 | **#11** | Management (the lower number here)")
  - Fix: replace with "NIRF University #24 (Symbiosis International)". In the `:43858` row, set the Management cell to "None in own name (#11 is SIBM Pune)" and the last cell to "University".
- **F2d. Symbiosis salary and WES in nmims-vs-symbiosis (edited by this batch).**
  - `lib/blog.ts:44569` and `:44798` say "Symbiosis ₹6L to ₹10L".
  - `:44726` says "Symbiosis SSODL reported salary range: ₹6L to ₹10L per annum".
  - `:44603` is the table row "Avg Salary Range ... ₹6L - ₹10L p.a.".
  - `:44601` is the table row "WES Recognised | Yes | Yes".
  - `:44615` says "Both are ... WES recognised".
  - Fix: delete the Symbiosis salary statements and cells (sheet row "Placement, salary, hirers", REMOVE). Remove the WES row and clause (row "WES recognition", REMOVE).
  - Lower priority:
    - `online-mba-with-placement-india-2026` (`lib/blog.ts:37384` and `:37445`) says "Symbiosis SSODL ... Rs 6-10 LPA". `:37449` says BITS "Rs 6-10 LPA". Same REMOVE rows.
    - `best-online-mba-colleges-india-2026:36800` says Symbiosis "₹6-12 LPA".
- **F2e. DPU derived EMI.**
  - `lib/blog.ts:8527` (mba-fees-india-complete-guide-2026, edited) says "EMI: ~Rs 7,890/month".
  - The same line says "Per semester: Rs 47,350", which is Edify's 1,89,400 / 4. DPU publishes 50,000/50,000/45,000/44,400.
  - `:8550` shows a DPU row of "11 to 14 percent" interest. DPU says "No Cost EMI".
  - Fix: "No Cost EMI, no published monthly figure" and "Semesters Rs 50,000 / 50,000 / 45,000 / 44,400". Delete the 11 to 14% row text for DPU.
  - Also present: `:22815` (online-mba-fee-comparison-india-2026). It 308s to mba-fees-india, so it is not rendered; fix it in the same pass.
  - Advisory: the same derived "₹47,350" sits in `:30202`, `:30234` and `:30398` (dy-patil-online-mba-review), `:36266`, `:36523`, `:36737` and `:38381`.
- **F2f. JAIN specialisation count.**
  - "20-plus" appears at:
    - `lib/blog.ts:10489` (online-mba-without-entrance-exam-india-2026)
    - `:14371` (distance-mba-bangalore-2026)
    - `:21339` and `:21450` (top-correspondence-mba-colleges-india-2026, edited by this batch)
    - `:21611` (online-mba-vs-distance-mba-difference-2026)
    - `:22410` (icfai-online-mba-fees-2026)
    - `:22613` (icfai-distance-mba-2026)
  - `:38194` (jain-online-mba-review-2026, comparison table) says "18 (highest in India)". The body is editable; only the title, H1 and meta are frozen.
  - `lib/coupon-pages.ts:339` says "19 specializations".
  - `lib/data/page-content/jain-university-online-mba-marketing.json:9` says "17+ specialisations".
  - `:22783` (redirected post) says "20+ specialisations".
  - Fix: "16" everywhere and drop "(highest in India)".
- **F2g. Removed JAIN AI tracks cited by peers.**
  - `app/compare/[pair]/pairs.ts:233` (compare/jain-vs-lpu FAQ): "JAIN offers AI for Finance, AI for Marketing, AI for HR, and AI for International Finance".
  - `lib/data/page-content/dayananda-sagar-university-online-mba-artificial-intelligence.json:27` and `:50`. This file was edited in this batch.
  - `lib/data/page-content/amrita-vishwa-vidyapeetham-online-mba-artificial-intelligence.json:78` and `:117`.
  - `lib/data/page-content/jain-university-online-mba-ai-for-finance.json:119`.
  - `jain-university-online-mba-human-resource-and-business-analytics.json:116`.
  - `jain-university-online-mba-international-finance-acca.json:117`.
  - All of the above are rendered. `upes-online-mba-human-resource-management.json:109` is latent.
  - Fix: name only AI for Finance and Data Science and AI.
- **F2h. FIX-LOG accuracy.**
  - FIX-LOG says the derived ₹1.19L gap "is reworded without a number". Only one instance, `:44663`, was reworded.
  - "₹1.19L", "₹1.19 lakh" and "Gap: ₹1,19,000 ... 61% more" remain at `lib/blog.ts:44565`, `:44568`, `:44574`, `:44581`, `:44641`, `:44675`, `:44763` and `:44795`.
  - `:44565` and `:44786` also say "₹78,750 per semester", which is Edify's 3,15,000 / 4. SSODL publishes 80,000/80,000/72,500/72,500.
  - These are not new numbers. Correct the FIX-LOG sentence, and either reword them or record them as known.

## 3. Built output (PASS)

**Before/after counts across the 6 profiles and 6 MBA hubs (visible text, base build → branch build)**

| String | Before | After |
|---|---|---|
| 13,017 | 7 | 0 |
| 3,342 | 9 | 0 |
| 6,667 (JAIN) | 8 | 0 |
| 6,917 | 0 | 7 |
| 13,125 | 5 | 0 |
| 7,892 | 7 | 0 |
| 5,000/month (DSU) | 2 | 0 |
| WES on Symbiosis and DSU pages | 10 | 0 |
| WES on BITS, Galgotias and JAIN | 8 | 8 (out of scope) |
| NIRF #11 (Management) | 1 | 0 |
| NIRF #24 (University 2025) | 0 | 1 |
| (Eng 2025) # | 0 | 2 |
| (Eng) # | 2 | 0 |
| Grad (pass) | 0 | 1 |
| Grad + 60% | 0 | 1 |
| Sant Tukaram Nagar | 3 | 0 |
| 30–40% (DSU, DPU, Symbiosis hubs) | 3 | 0 |
| Healthcare on the DSU hub | 2 | 0 |
| per annum | 24 | 3 (DPU only, Q22) |
| Top Hiring | 6 | 0 |
| Alumni report salaries | 5 | 1 (DPU, Q22) |
| Starting at | 6 | 1 (JAIN, Rs 6,917) |
| 19 specialisations (JAIN hub) | 1 | 0 |
| 16 specialisations (JAIN hub) | 0 | 2 |
| Fees checked on | 4 | 14 |
| UGC-DEB register (session 2026-27) | 1 | 6 |

**Site-wide visible text**

- "AI For Marketing" (new title-casing) goes from 0 to 18 hits on JAIN pages (see F1).
- "the highest NAAC grade" goes from 19 to 14 hits; the remaining DSU hits are in F2a.

**A8/A9 detector over all 1,786 university pages (same needles as the A8/A9 rerun)**

- The 12 A9 needles show 0 raw and 0 visible, on both base and branch.
- The BITS DEB needles show 0. "UGC DEB Approved" appears 22 times raw and 0 visible on both builds (footer and schema, as accounted for before).

**D4 totals on the hubs (branch = base)**

| Hub | Figure | Count |
|---|---|---|
| NIU | ₹1,18,000 | 32 |
| Alliance | ₹1,74,000 | 39 |
| Alliance | ₹8,700 | 4 |
| Sharda | ₹1,50,000 | 45 |
| JIIT | ₹1,75,000 | 25 |
| JIIT | ₹5,850 | 9 |

**Pages outside the six whose text changed (67)**

- **Expected, data-driven:**
  - the edited blog posts
  - 13 compare pages (EMI and spec counts)
  - /fees
  - /universities and the home page
  - /tools/university-comparison
  - healthcare-management spec directory ("₹80K")
- **26 CGPA template pages:**
  - "105 → 104 universities that publish a minimum"
  - "103 → 101 ask for 50%"
  - "16 → 17 publish none"
  - This follows BITS moving to 60% and Galgotias to no percentage. It is correct, but it touches the CGPA cluster. Note it for the GSC read.

## 4. The 3 removed URLs (PASS for the URLs, FAIL for "JAIN ai-* unchanged")

**Status of the three /programs/mba URLs**

| URL | Base build | Live | Branch |
|---|---|---|---|
| /programs/mba/ai-for-marketing | 200 | 200 (`?cb=b3qa1`) | `HTTP/1.1 308 Permanent Redirect`, `Location: /programs/mba` |
| /programs/mba/ai-for-human-resources | 200 | 200 (`?cb=b3qa1`) | `HTTP/1.1 308 Permanent Redirect`, `Location: /programs/mba` |
| /programs/mba/ai-for-international-finance | 200 | 200 (`?cb=b3qa1`) | `HTTP/1.1 308 Permanent Redirect`, `Location: /programs/mba` |

- The branch responses are real redirects, not a meta-refresh 200.
- **Sitemap:** the branch sitemap and the live sitemap are identical (2,301 URLs, `diff` empty). None of the 3 URLs is in either. They were never in the sitemap, so the claim that they "leave the sitemap" is moot.
- **valid-urls.json:** parsed set difference shows exactly 3 removed, 0 added (2,153 → 2,150).
- **url-canonical-map.json:** a flattened key diff shows exactly 3 changes: `p.mba|ai-for-{marketing,human-resources,international-finance}` from slug to "". The `u` map entries for `jain-university-online|mba|ai-*` are unchanged.
- **F1. The JAIN AI pages are not unchanged.**
  - The three `/universities/jain-university-online/mba/ai-*` pages still return 200 and stay in the sitemap.
  - **Title change.** Base "JAIN University MBA AI for Marketing 2026 | EdifyEdu" becomes "JAIN University MBA AI **For** Marketing 2026 | EdifyEdu". The same change hits ai-for-human-resources and ai-for-international-finance (Intl), in the title, H1 and meta description.
  - **Cause.** Once the spec leaves `lib/data.ts`, `resolveSpec` falls to branch 3, `titleCaseSlug()` in `lib/data/programs.ts:322-336`, because the manifest row has an empty `spec_name`.
  - **Body changes.**
    - The "Fees and Payment" prose is replaced by the JAIN-wide fee plan table.
    - The "Compare AI for Marketing MBA at other universities" link is gone.
  - **Hub contradiction.** The JAIN hub still renders 19 spec tiles, including "AI For Marketing", "AI For Human Resources" and "AI For International Finance". It links to all three (19 unique `/mba/` hrefs, the same as base), while its header says "16 Specialisations". So the FIX row "remove the 3 AI tracks" is not achieved on the rendered hub.
  - The same "AI For ..." tiles appear as related links on 9 other JAIN spec pages.
  - **Fix, choose one:**
    - **(a)** Add a name override consulted before `titleCaseSlug` in `lib/data/programs.ts` (around `:322`) for the three `jain-university-online|mba|ai-*` triples, so the title, H1 and meta are byte-identical to base. Also filter those three slugs out of the JAIN hub tile grid and the related-spec links, without touching their URLs.
    - **(b)** Revert the three-line removal in `lib/data.ts` (around `:431`) and in `lib/data-slim.ts:33`. Regenerate valid-urls and url-canonical-map. Hold the cross-university redirect until Rishi answers a new JAIN question about the three pages.
  - Either way, add that question to QUESTIONS-FOR-RISHI. Q25 and Q32 are not about JAIN.

## 5. Gates (PASS)

- `bash .husky/pre-commit` in the worktree, after restoring the build churn, exited 0 and ended with "pre-commit: all checks passed". The tree was unchanged afterwards.
- The commit touches no file under `scripts/` or `.husky/`, and no allowlist.
- The only baseline file changed is `data/blog-fee-baseline.json`: `totalUnverified` 2026 → 2025, and `dsu-online-mba-review` 7 → 6. Both went down.
- **check-nirf-category:** the new template is `` `(${engCategoryLabel}) #${nirfEng}` `` in `components/ApprovalBadges.tsx`.
  - It passes through CATEGORY_BEFORE2 because the variable name contains "Category".
  - The value is always `Eng` or `Eng ${nirfEngYear}`, so the rendered pill names the category: "NIRF (Eng 2025) #11" on all 10 BITS hub and spec pages, and "NIRF (Eng 2025) #46" on the Symbiosis hub.
  - It is not a regex-only pass. PASS.

## 6. Titles (FAIL on 3 pages)

**Pages compared:** `<title>`, H1, meta description, canonical and robots, base build against branch build, on 59 pages:

- the 6 profiles
- the 6 MBA hubs
- 2 spec pages per university, plus JAIN digital-marketing and the 4 JAIN ai-* pages
- /programs/mba and /fees
- all 20 edited posts
- 6 sweep-target posts

**Changes in title or H1:** only the 3 JAIN ai-* pages (F1).

**Meta description changed on 4 pages (all allowed):**

| Page | Change |
|---|---|
| dsu-online-mba-review | A++ → A+ |
| jain-vs-amity-online-mba-2026 | dropped "19 specialisations each" |
| nmims-vs-symbiosis-online-mba-2026 | "#11" → "University #24" |
| Galgotias MBA hub | dropped "(₹3,342/mo EMI)" |

- None of those 4 is frozen.
- The frozen posts are symbiosis-online-mba-review-2026, jain-online-mba-review-2026 and bits-pilani-online-mba-review-2026 (`FREEZE_SLUGS` in `scripts/check-protected-pages.mjs`, to 2026-12-05). All three are unchanged in title, H1 and meta. jain-online-mba-review still says "19 electives" in its meta, as FIX-LOG states.

## 7. Rendering of the 6 profiles and 6 MBA hubs (PASS, except F1 tiles and F3)

**Basic checks:** all 12 pages return 200, have exactly one `<h1>` and have 8 to 11 JSON-LD blocks with 0 parse errors. Each has 0 "undefined", 0 "NaN" and 0 bare "₹0".

**Hub fee tables, as rendered, match the sheets line for line:**

| Hub | Rendered lines |
|---|---|
| BITS | ₹3,12,400; Sem 1 ₹93,100; Sems 2-4 ₹73,100; Application ₹1,500; Admission ₹18,500; "no separate exam fee"; "EMI ... 0% interest ... no monthly figure" |
| Galgotias | ₹80,200; Tuition/yr ₹35,000; Exam/yr ₹4,000; Registration ₹1,200; Alumni ₹1,000 |
| JAIN | ₹1,60,000 / 1,75,000 / 1,96,000 / 2,98,000; EMI ₹6,917; extras Registration ₹2,500 one-time and Examination ₹3,000 a year |
| DSU | ₹1,30,000 / 32,875 / 32,375 / 65,250 / 64,750 / 30,500 / 1,875 / 500; Application ₹1,000 outside the total |
| DPU | ₹1,89,400 / 50,000 / 50,000 / 45,000 / 44,400; ₹10,000 scholarship condition; "No Cost EMI ... no monthly figure" |
| Symbiosis | unchanged (Q16) |

**F3. Invented EMI offer**

- `components/UniversityPageClient.tsx:734` falls back to "No-cost EMI, 12 to 24 month plans via partner banks" when `emiFrom` is 0.
- This batch set `emiFrom: 0` for BITS, Galgotias, Symbiosis, DSU and DPU. All five profiles now print it.
- For DSU and Galgotias it asserts an EMI scheme the sheets say is not published. For BITS, Symbiosis and DPU, the "12 to 24 months" and "partner banks" parts are unsourced.
- Fix: at `:734`, render nothing when `u.emiFrom` is 0, or render the feePlans EMI note. The same line also exists in `components/GatedContent.tsx:19`.

**Advisories (pre-existing template behaviour, not introduced by this batch)**

- **Degenerate fee range.** The gated profile card prints "Total Fee ₹80K – ₹80K" for Galgotias. Base printed "₹80K – ₹86K". BITS, DSU and DPU already printed "₹3.1L – ₹3.1L" style ranges on base.
- **Eligibility on other programmes.** `u.eligibility` is university-level. Galgotias BBA, BCA and MCA pages now print "Graduation pass from a recognised university (no minimum percentage published)", against "Graduation with 50% marks" on base. Both are wrong for BBA and BCA. This is visible on 14 non-MBA Galgotias pages.
- **Derived sum.** The BITS review FAQ (`lib/blog.ts:37642`, edited) keeps "(₹2,92,400)", which is Edify's 73,100 × 4. Advisory only: the arithmetic is consistent with the published lines, but it is a sum made here.

## 8. House rules (PASS)

- **Em dashes:** added lines contain 0; one was removed (the Galgotias rankingBadge).
- **Official sites:** 0 visible occurrences of dsuonline.com, dypatilonline.com, galgotiasonline, onlinejain.com, ssodl.edu.in or bits-pilani-wilp on the 12 profile and hub pages, and 0 `href` to them. The added hostnames sit only in code comments, `officialUrl` and `feePlans.source`, none of which render.

## Required before merge

1. **F1.** Restore the JAIN ai-* titles, H1s and meta descriptions to base, and stop the hub grid from listing the 3 removed tracks under a "16 Specialisations" header. Use option (a) or (b) from section 4. File a JAIN-specific question.
2. **F2a to F2g.** Apply the listed line fixes:
   - DSU A+ in 5 spec JSONs and 6 posts
   - DSU EMI, semester and "seven" in dsu-online-mba-review and online-mba-entrepreneurship
   - SSODL "Management 11" in 7 places
   - Symbiosis salary and WES in nmims-vs-symbiosis
   - DPU EMI and semester at `lib/blog.ts:8527` and `:8550`
   - JAIN 16 in 9 places
   - peer AI-track references in 7 files
   - Then rerun this sweep. Each listed string should hit 0 in visible text.
3. **F3.** `components/UniversityPageClient.tsx:734`: no EMI line when `emiFrom` is 0.
4. **F2h.** Correct the FIX-LOG sentence on the ₹1.19L gap. Also correct the "Q25/Q32" reference for the JAIN AI pages, and the Galgotias "Business Analytics & IT" JSON text versus Q33.

Scratch artefacts (builds, HTML snapshots and helper scripts) are in the session scratchpad, not in the repo. The base copy's `node_modules` is a junction to the worktree's `node_modules`, so do not `rm -rf` that folder.
