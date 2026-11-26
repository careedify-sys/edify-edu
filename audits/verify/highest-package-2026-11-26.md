# Highest-package claims: verification against official sources (2026-11-26)

Scope: origin/main (fetched 2026-11-26). Searched `lib/`, `components/`, `app/`, `data/`, `content/` for
`highest package|highest ctc|highest salary|highest placement|top package|highest reported|highest offer`
plus `LPA ... highest` in either order. Read-only audit. No site file was edited.

Sources used: official university portals only (amity.edu, amityonline.com, lpu.in, lpuonline.com, online.nmims.edu,
onlinemanipal.com, onlinecu.in, upesonline.ac.in, onlinejain.com, set.jainuniversity.ac.in, ignou.ac.in, xlri.ac.in).
Search-engine summaries that pointed at aggregators were not used as evidence; every quote below was read on the official URL.
Fetched date for every row: 2026-11-26.

All hits sit in `lib/blog.ts` (blog post bodies and FAQ arrays). Nothing in `lib/data.ts`, `components/`, `app/` or
`data/*.json` prints a university-specific highest-package figure. Page URL = `https://edifyedu.in/blog/{slug}`.

Verdict key: MATCH, CAMPUS-ONLY (official figure exists but for campus students), MISMATCH (official figure differs),
NOT FOUND (no official source states it).

## Findings

| # | file:line | Page | Uni | Site text (exact figure) | Scope on site | Verdict | Official quote (15 words max) | Official URL | Fetched | Action |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | lib/blog.ts:6488 | /blog/ignou-online-mba-review-2026 | IGNOU | "The highest package in that drive was Rs 15 LPA across all disciplines." (2024 on-campus drive) | University-wide drive (not MBA-specific) | NOT FOUND | CPC drive reports give participants and selections only, no salary figures. No 2023-24 or 2024-25 report published (both URLs return empty PDFs). | https://www.ignou.ac.in/viewFile/cpc/profile/2022-2023.pdf | 2026-11-26 | Delete figure |
| 2 | lib/blog.ts:12315 | /blog/online-mba-lpu-review-2026 | LPU | "highest package ₹49.4 LPA in 2025 ... Those figures relate to the full-time on-campus cohort" | Campus, labelled as campus | CAMPUS-ONLY | "LPU MBA graduates have secured packages of up to ₹49.4 lakh." (2025 batch student) | https://www.lpu.in/landing-pages/mba | 2026-11-26 | Keep (already scoped as campus). Note: same sentence calls "₹10.23 LPA top 25%" a campus MBA number, but lpu.in/placements gives it university-wide: "₹ 10.23 Lakh average salary of top 25% placed students". Re-word that half as all-programme. |
| 3 | lib/blog.ts:12319 | /blog/online-mba-lpu-review-2026 | LPU | "The highest package reported for online MBA graduates is ₹11.6 LPA." | Online MBA | NOT FOUND | Placement page lists four MBA learners only, top entry "Upto 10 LPA ... Company: MyGate". No highest-package statistic. | https://www.lpuonline.com/placement | 2026-11-26 | Delete |
| 4 | lib/blog.ts:23844 | /blog/amity-online-mba-review-2026 (section "Amity University Noida MBA Fees and Placement") | Amity | Table row "MBA Highest Package (2024) ₹26.30 LPA, Finance domain" | Noida campus MBA (section heading) | CAMPUS-ONLY | "INR 26.30 LPA Highest CTC" and "FINANCE Highest - INR 26.30 LPA" (Class of 2022-2024, Amity Business School) | https://amity.edu/abs/pdf/Placement-Report-2024-batch.pdf | 2026-11-26 | Keep, but label the row "Amity Business School Noida campus, class of 2022-24" so it cannot be read as online |
| 5 | lib/blog.ts:23849 | /blog/amity-online-mba-review-2026 | Amity | "The ₹26.30 LPA highest package gets quoted everywhere" | Implied campus (same section) but sentence does not say campus | CAMPUS-ONLY | Same report: "INR 26.30 LPA Highest CTC" | https://amity.edu/abs/pdf/Placement-Report-2024-batch.pdf | 2026-11-26 | Scope as campus in the sentence ("Noida campus MBA highest CTC") |
| 6 | lib/blog.ts:36080 | /blog/amity-online-bba-review-2026 (FAQ) | Amity Online | "By Amity's own published data, the highest package for online BBA graduates has reached ₹16 LPA" | Online BBA | NOT FOUND | BBA page states only "450+ Top hiring partners" and "100% Placement assistance". No package figure. The old amityonline.com/job-placements page now returns HTTP 410 Gone. | https://amityonline.com/bachelor-of-business-administration-online | 2026-11-26 | Delete (also delete the "own published data" attribution) |
| 7 | lib/blog.ts:36089 | /blog/amity-online-bba-review-2026 (body) | Amity Online | "According to Amity Online's published placement data, the highest package for online BBA graduates has reached ₹16 LPA." | Online BBA | NOT FOUND | As row 6; career-services page also has no package figure. | https://amityonline.com/career-services | 2026-11-26 | Delete |
| 8 | lib/blog.ts:36089 | /blog/amity-online-bba-review-2026 (body) | Amity Online | "Top packages of ₹12-16 LPA are competitive" | Online BBA | NOT FOUND | As row 6 | https://amityonline.com/bachelor-of-business-administration-online | 2026-11-26 | Delete |
| 9 | lib/blog.ts:36679 | /blog/best-online-mba-colleges-india-2026 (FAQ) | NMIMS Online | "highest packages reaching ₹16-20 LPA at top recruiters" | Online MBA | NOT FOUND | Career-services, MBA hub and Financial Management pages state no package figures. | https://online.nmims.edu/career-services ; https://online.nmims.edu/programs/hub/mba-online | 2026-11-26 | Delete |
| 10 | lib/blog.ts:36679 | /blog/best-online-mba-colleges-india-2026 (FAQ) | Amity Online | "Amity Online ... with highest packages reaching ₹16 LPA" | Online MBA | NOT FOUND | MBA page states only "450+ Top hiring partners", "100% Placement assistance". | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 11 | lib/blog.ts:36797 | /blog/best-online-mba-colleges-india-2026 | NMIMS Online | "highest packages reaching ₹16-20 LPA at top recruiters" | Online MBA | NOT FOUND | As row 9 | https://online.nmims.edu/career-services | 2026-11-26 | Delete |
| 12 | lib/blog.ts:37261 | /blog/online-mba-with-placement-india-2026 (FAQ) | Amity Online | "highest packages reaching Rs 16 LPA" | Online MBA | NOT FOUND | As row 10 | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 13 | lib/blog.ts:37263 | /blog/online-mba-with-placement-india-2026 (FAQ) | Amity Online | "Amity Online graduates average Rs 4-8 LPA with highest packages reaching Rs 16 LPA" | Online MBA | NOT FOUND | As row 10 | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 14 | lib/blog.ts:37279 | /blog/online-mba-with-placement-india-2026 | Amity Online | "Amity Online (500+ companies, Rs 16 LPA highest)" | Online MBA | NOT FOUND | As row 10 (portal also says 450+, not 500+) | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 15 | lib/blog.ts:37323 | /blog/online-mba-with-placement-india-2026 (table "Highest Reported") | NMIMS Online | "Rs 16-20 LPA" | Online MBA | NOT FOUND | As row 9 | https://online.nmims.edu/career-services | 2026-11-26 | Delete cell (use "Not published") |
| 16 | lib/blog.ts:37325 | same table | Amity Online | "Rs 16 LPA" | Online MBA | NOT FOUND | As row 10 | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete cell (use "Not published") |
| 17 | lib/blog.ts:37326 | same table | Chandigarh University Online | "Rs 12-15 LPA" | Online MBA | NOT FOUND | Page gives job-market ranges only, e.g. "salary packages ... range from ₹8 lakhs per annum (entry-level)". No highest package. | https://www.onlinecu.in/online-mba.php | 2026-11-26 | Delete cell (use "Not published") |
| 18 | lib/blog.ts:37327 | same table | MUJ (Online Manipal) | "Rs 10-12 LPA" | Online MBA | NOT FOUND | MUJ MBA page has no figure; Online Manipal placements page gives only "Average Salary Package 6 LPA*", not by university, no highest. | https://www.onlinemanipal.com/online-mba-manipal-university-jaipur ; https://www.onlinemanipal.com/placements | 2026-11-26 | Delete cell (use "Not published") |
| 19 | lib/blog.ts:37329 | same table | MAHE (Online Manipal) | "Rs 12-15 LPA" | Online MBA | NOT FOUND | MAHE MBA page describes placement assistance only, no package figures. | https://www.onlinemanipal.com/online-mba-degree-working-professionals-mahe | 2026-11-26 | Delete cell (use "Not published") |
| 20 | lib/blog.ts:37330 | same table | JAIN Online | "Rs 10 LPA" | Online MBA | NOT FOUND | MBA page shows "₹8-25 LPA Target salary range" (a target, not an outcome); no highest package. | https://onlinejain.com/online-mba | 2026-11-26 | Delete cell (use "Not published") |
| 21 | lib/blog.ts:37331 | same table | LPU Online | "Rs 10 LPA" | Online MBA | NOT FOUND | Only an individual learner card, "Upto 10 LPA ... Company: MyGate"; not a highest-package statistic. | https://www.lpuonline.com/placement | 2026-11-26 | Delete cell (use "Not published") |
| 22 | lib/blog.ts:37332 | same table | UPES Online | "Rs 10 LPA" | Online MBA | NOT FOUND | Page states "45% Average Salary Hike*(As per Alumni survey)", "800+ Recruiters"; no package figure. | https://upesonline.ac.in/online-mba | 2026-11-26 | Delete cell (use "Not published") |
| 23 | lib/blog.ts:37362 | /blog/online-mba-with-placement-india-2026 | Amity Online | "Highest reported packages reach Rs 16 LPA at top recruiters including Google, Amazon..." | Online MBA | NOT FOUND | As row 10 | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 24 | lib/blog.ts:37364 | /blog/online-mba-with-placement-india-2026 | Amity Online | "the Rs 16 LPA highest packages going to the top 1 percent" | Online MBA | NOT FOUND | As row 10 | https://amityonline.com/master-of-business-administration-online | 2026-11-26 | Delete |
| 25 | lib/blog.ts:37402 | /blog/online-mba-with-placement-india-2026 (campus vs online table) | None (generic) | "Highest packages: Rs 30-50 LPA at top campuses / Rs 14-20 LPA at top online programmes" | Both | NOT FOUND | No university states either range; the online range appears derived from rows 15-22. | n/a | 2026-11-26 | Delete row |
| 26 | lib/blog.ts:37981 | /blog/jain-online-mba-review-2026 (FAQ "salary after JAIN Online MBA") | JAIN | "JAIN claims average packages around ₹6-8 LPA and highest reported package of ₹42 LPA" | Implied online MBA | CAMPUS-ONLY | Campus placement table row: "FET B.Tech 2024 ... 42 LPA" (campus B.Tech, not MBA, not online) | https://set.jainuniversity.ac.in/placements/index.php | 2026-11-26 | Delete (a campus B.Tech figure in an online-MBA FAQ; scoping it would still mislead) |
| 27 | lib/blog.ts:38411 | /blog/xlri-online-mba-review-2026 (FAQ) | XLRI | "main campus PGDM placement reports show average packages around ₹29-31 LPA and highest around ₹75 LPA" | Campus, labelled as campus | MISMATCH | Current official report (Final Placements 2026): "highest domestic offer of INR 59 lakhs per annum"; average "INR 31.40 lakhs". ₹75 LPA is not on xlri.ac.in today. | https://xlri.ac.in/corporate-relations-and-placement/placement-reports | 2026-11-26 | Update to the official 2026 figures with the batch year, or delete |
| 28 | lib/blog.ts:38531 | /blog/xlri-online-mba-review-2026 (body) | XLRI | "The institute reports average package outcomes around ₹29-31 LPA and highest packages around ₹75 LPA for online graduates" | Online (wrong) | MISMATCH | Same report covers the residential PGDM (BM/HRM) batch, not online learners: "highest domestic offer of INR 59 lakhs per annum". | https://xlri.ac.in/corporate-relations-and-placement/placement-reports | 2026-11-26 | Delete (campus figure attributed to online graduates, and the number is out of date) |

## Summary

28 university or derived highest-package statements on 7 published blog posts. All are in `lib/blog.ts`.

| Verdict | Count | Rows |
|---|---|---|
| MATCH | 0 | none |
| CAMPUS-ONLY | 4 | 2, 4, 5, 26 |
| MISMATCH | 2 | 27, 28 |
| NOT FOUND | 22 | 1, 3, 6-25 |

Recommended actions:
- Keep, already scoped as campus: row 2 (LPU ₹49.4 LPA). Re-word the "₹10.23 LPA top 25%" half as university-wide.
- Keep, add explicit campus scope: rows 4 and 5 (Amity Business School Noida ₹26.30 LPA, class of 2022-24).
- Update or delete: row 27 (XLRI, replace with official 2026 figures and batch year, or remove).
- Delete: rows 1, 3, 6-26, 28 (22 NOT FOUND + JAIN B.Tech figure + XLRI online attribution).

Concentration: 11 of the 22 NOT FOUND rows are one recycled claim, "Amity Online highest ₹16 LPA". It appears on 3 posts (amity-online-bba-review-2026, best-online-mba-colleges-india-2026, online-mba-with-placement-india-2026). The table in online-mba-with-placement-india-2026 (rows 15-22) has no official source for any of its 8 "Highest Reported" cells. The same table's "Avg Package" column was not in scope here, but it likely has the same problem.

## Excluded (not university-reported figures)
- `components/MBAHubClient.tsx:310`, `lib/blog.ts:8323, 16425, 37264, 37336, 37344, 37468, 37489`: advice about highest-package figures with no number tied to a university.
- `lib/answers/university-answers.ts:153-154`: already says "no average or highest package" on the programme page.
- `data/answer-provenance.json:182` (Sharda "Highest offer · PG cohort"): provenance note only, no figure printed on the site.
- `content/blogs/*-full-form-*` and `lib/blog.ts:34425` "Top Packages" tier table: generic tier ranges (IITs, NITs and so on), no single university.
- `app/programs/[...slug]/page.tsx:262-265`: keyword lists, not visible claims.
- `data/EdifyEdu_Unified_Programs_v3.xlsx`: a binary match, not read by pages for this field. Not inspected.
