# Verify: batch 20a, university-attributed salary figures in blog posts

**Checked:** 2026-11-27 · **Checker:** fact-checker · **Repo:** `lib/blog.ts` read at `fix/b3-batch-19` (e857e46) with `git show`. Line numbers are from that blob. This file is the only write. No site edit, no commit. `audits/QUESTIONS-FOR-RISHI.md` is untouched; draft lines are at the end.

**Scope:** groups (a), (b) and (c) of `batch20-salary-scope.md` §3, the "reported range" lines in §2, and the aggregator segments (class C). Some extra rows in the same tables or lists are marked "(A2 extra)".

**Verdicts:**
- SOURCED: the official source prints the same figure.
- CONFLICT: the official source prints a different figure. Both are shown.
- UNVERIFIABLE: no official source states it.
- In house terms, SOURCED = MATCH and CONFLICT = FIX. UNVERIFIABLE = UNCLEAR, but under the batch-20 plan an unsourced university figure is deleted, so each one is FIX (delete) unless Rishi says otherwise.

**Scope flag (MISMATCH):** set when the post presents an online-programme figure, the university publishes no online salary figure, and the only official salary data is campus data (NIRF or a campus placement report). It is also set where a campus figure sits under an "online" label.

**Fees and figures:** copied as printed. Nothing is summed. Percentage claims, such as hike percentages, are described but not repeated.

**Site URL:** every post renders at `https://edifyedu.in/blog/{slug}`.

**Fetch method:**
- WebFetch first.
- Where WebFetch got 403 or 404 (onlinemanipal.com, nirfindia.org), the page was read with `agent-reach read`, a plain Jina reader. No stealth mode and no bot-check bypass was used.
- nirfindia.org also returns 403 to plain curl. The NIRF data PDFs were read only through agent-reach.
- The Amity ABS PDF prints its statistics as images. It was downloaded and rendered locally with PyMuPDF, and the figures were read off pages 2 and 3.
- Web searches were restricted to official domains. No aggregator page was opened.

## Sources

| ID | Source | URL | Fetched | What it says (quote of 15 words or fewer) | Scope |
|---|---|---|---|---|---|
| S1 | Online Manipal placements page | https://www.onlinemanipal.com/placements | 2026-11-27 | "Average Salary Package 6 LPA*" … "*depending on candidates' work experience & industry"; "2,500+ Offers Received" | Online; all Online Manipal universities together; no year |
| S2 | Online Manipal MBA placement blog | https://www.onlinemanipal.com/blogs/online-manipal-mba-placement-record | 2026-11-27 | "average salary package for MBA graduates is approximately INR 5.5 LPA"; "highest salary package offered to MBA graduates is INR 13.36 LPA" | Online MBA; group-wide; no year or cohort |
| S3 | Amity Online placement-assistance blog (updated 12 Aug 2026) | https://amityonline.com/blog/job-placement-assistance-for-online-students | 2026-11-27 | "highest package touching a whopping Rs 18 Lakh Per Annum!" | Online, all programmes, cumulative ("so far"); no year; no range or median |
| S4 | Amity Online MBA programme page | https://amityonline.com/master-of-business-administration-online | 2026-11-27 | No salary figure in the page text | n/a |
| S5 | JAIN Online MBA page | https://onlinejain.com/online-mba | 2026-11-27 | "₹8-25 LPA", labelled "Target salary range" | Online MBA; a target, not a reported outcome; no year |
| S6 | NMIMS Online (CDOE) MBA hub, career services and Finance pages; `/placements` is a 404 | https://online.nmims.edu/programs/hub/mba-online · https://online.nmims.edu/career-services · https://online.nmims.edu/programs/mba-financial-management | 2026-11-27 | No salary figure on any of the three | n/a |
| S7 | UPES Online MBA page | https://upesonline.ac.in/online-mba | 2026-11-27 | Only a percentage "Average Salary Hike", "(As per Alumni survey)". No rupee figure. | Online; percentage only |
| S8 | UPES MBA admissions page | https://www.upes.ac.in/admissions/mba | 2026-11-27 | "Highest Package*" 30LPA; "Top 10% Average CTC*" 14LPA; qualifier names 2023-24 | UPES MBA (mode not stated; campus admissions page); 2023-24 |
| S9 | Amity Business School (Noida) final placement report, class of 2022-2024 | https://amity.edu/abs/pdf/Placement-Report-2024-batch.pdf | 2026-11-27 | p.2: "INR 26.30 LPA Highest CTC"; "INR 6.50 LPA Median CTC"; "INR 7.35 LPA Average CTC". p.3: "FINANCE Highest – INR 26.30 LPA" | Campus MBA, ABS Noida (Amity University Uttar Pradesh); class of 2022-24, session 2023-24 |
| S10 | LPU press release, 17 Sep 2025 | https://happenings.lpu.in/lpu-achieves-unprecedented-mba-placement-success-with-rs49-lakhs-plus-highest-package-and-29-percent-growth/ | 2026-11-27 | "a staggering highest package of ₹49.46 Lakhs" "for the Class of 2025" | LPU MBA (Mittal School of Business); mode not stated; no online mention |
| S11 | LPU MBA pages | https://lpu.in/landing-pages/mba/ · https://www.lpu.in/schools/business/ | 2026-11-27 | "secured packages of up to ₹49.4 lakh" | Same 2025-batch offer, rounded by LPU itself |
| S12 | NIRF 2025, Management, SVKM's NMIMS [IR-M-N-10] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Management/IR-M-N-10.pdf | 2026-11-27 | PG 2-year median salary of placed graduates: 2023-24 "2000000(Twenty Lakhs only)"; 2022-23 "2135000"; 2021-22 "1920000" | Campus PG 2-year; institution-level submission (no campus split printed); graduating years 2021-22 to 2023-24 |
| S13 | NIRF 2025, Overall, SVKM's NMIMS [IR-O-N-10] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Overall/IR-O-N-10.pdf | 2026-11-27 | UG 3-year median: 2023-24 "550000(FIVE LAKHS FIFTY THOUSAND ONLY)"; 2022-23 "660000"; 2021-22 "550000" | All UG 3-year programmes university-wide (not BBA only); campus |
| S14 | NIRF 2025, Overall, Symbiosis International [IR-O-U-0329] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Overall/IR-O-U-0329.pdf | 2026-11-27 | UG 3-year median: 2023-24 "460000(Four Lakh Sixty Thousand)"; 2022-23 "391000"; 2021-22 "765000". PG 2-year median 2023-24 "1268000" | University-wide UG 3-year and PG 2-year (all institutes, not MBA or BBA only); campus |
| S15 | NIRF 2024, Management, Jamia Hamdard [IR-M-U-0107] | https://www.nirfindia.org/nirfpdfcdn/2024/pdf/Management/IR-M-U-0107.pdf | 2026-11-27 | PG 2-year median, graduating 2022-23: "552000(Five Lakh fifty two thousand)" | Campus PG 2-year; graduating year 2022-23 |
| S16 | NIRF 2025, Management, Amity University [IR-M-U-0497] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Management/IR-M-U-0497.pdf | 2026-11-27 | PG 2-year median: 2023-24 "600000(Six Lakh)"; 2022-23 "600000"; 2021-22 "550000" | Campus PG 2-year |
| S17 | NIRF 2025, Management, Jain University, Bangalore [IR-M-U-0223] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Management/IR-M-U-0223.pdf | 2026-11-27 | PG 2-year median 2023-24 "850000(Eight Lakhs Fifty thousand only)" | Campus PG 2-year |
| S18 | NIRF 2025, Management, S.R.M. Institute of Science and Technology [IR-M-U-0473] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Management/IR-M-U-0473.pdf | 2026-11-27 | PG 2-year median 2023-24 "865000(EIGHT LAKHS SIXTY FIVE THOUSAND)" | Campus PG 2-year |
| S19 | NIRF 2025, Management, LPU [IR-M-U-0379] | https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Management/IR-M-U-0379.pdf | 2026-11-27 | PG 2-year median 2023-24 "677000(Six Lakh Seventy Seven Thousand)" | Campus PG 2-year |
| S20 | DY Patil Online (DPU-COL) placement page | https://www.dypatilonline.com/placement.aspx | 2026-11-27 | "salary packages ranging from 5.5 to 20 LPA" | Online, all programmes; no year |
| S21 | Chandigarh University Online MBA page | https://www.onlinecu.in/online-mba.php | 2026-11-27 | "Supports salary growth ranging from ₹5 LPA- ₹12 LPA" | Online MBA; a marketing growth claim; no year |
| S22 | IGNOU RC Delhi-3 notice, dated 12 Feb 2024, for a drive on 23 Feb 2024 | http://rcdelhi3.ignou.ac.in/news/detail/1/Campus_Placement_Cell_in_association_with_Regional_Centres_of_Delhi_NCR_is_organizing_a_placement_drive_on_February_23_2024_Friday_at_the_Convention_Centre_IGNOU_Campus-994 | 2026-11-27 | The notice exists. Its "Click here for details" link now opens an unrelated LSC list dated 8 Jan 2026. No package is stated. | IGNOU drive, 2024 |
| S23 | Official-domain searches for Symbiosis SSODL/SCDL and BITS WILP salary data | ssodl.edu.in, symbiosisonline.edu.in, scdl.net, siu.edu.in; bits-pilani.ac.in, bits-pilani-wilp.ac.in | 2026-11-27 | No online-programme salary figure found on these domains | n/a |

## A. Online-programme outcome figures (group a, plus the "reported range" lines)

| # | Post · line | Site now (exact text, trimmed) | Official source says | Source | Verdict | Scope flag |
|---|---|---|---|---|---|---|
| A1 | online-mba-pune-university-2026 · L12749 | "Symbiosis SCDL PGDBA graduates: Rs 5-9 LPA Year 1. Rs 12-22 LPA Year 5." | No SSODL/SCDL salary figure found. The only official Symbiosis salary data is NIRF university-wide campus PG 2-year, median Rs 12,68,000 (2023-24). | S23, S14 | UNVERIFIABLE | MISMATCH (online, only campus data exists) |
| A2 | online-mba-pune-university-2026 · L12750 | "NMIMS Online MBA graduates in Pune: Rs 7-13 LPA Year 1 lateral. Rs 16-26 LPA Year 5." | NMIMS CDOE publishes no salary figure. NIRF campus PG median is Rs 20,00,000 (2023-24). | S6, S12 | UNVERIFIABLE | MISMATCH |
| A3 | online-mba-pune-university-2026 · L12751 | "Amity Online MBA graduates in Pune: Rs 5-10 LPA Year 1. Rs 12-22 LPA Year 5." | Amity Online prints only an all-time highest of Rs 18 LPA, with no city, year or range. NIRF campus median is Rs 6,00,000 (2023-24). | S3, S16 | UNVERIFIABLE | MISMATCH (no online range; campus median only) |
| A4 | online-mba-pune-university-2026 · L12752 | "JAIN Online MBA graduates in Pune: Rs 5-10 LPA Year 1 … Rs 12-22 LPA Year 5." | JAIN Online prints only a "Target salary range" of ₹8-25 LPA, which is not an outcome. NIRF campus median is Rs 8,50,000 (2023-24). | S5, S17 | UNVERIFIABLE | MISMATCH |
| A5 | distance-mba-colleges-mumbai-2026 · L19695 | "NMIMS Online graduates in Mumbai: Rs 8 to 18 LPA at year 1 lateral. Rs 18 to 28 LPA at year 5." | NMIMS CDOE: none. NIRF campus median is Rs 20,00,000 (2023-24), which falls inside the site's "year 5" band. That suggests campus leakage. | S6, S12 | UNVERIFIABLE | MISMATCH |
| A6 | distance-mba-colleges-mumbai-2026 · L19698 | "Amity plus DY Patil Online graduates: Rs 5 to 10 LPA at year 1 lateral. Rs 12 to 22 LPA at year 5." | DY Patil Online: "salary packages ranging from 5.5 to 20 LPA" (all online programmes, no year). Amity Online: highest Rs 18 LPA only. | S20, S3 | CONFLICT (site Rs 5-10 / 12-22 LPA vs DPU-COL 5.5 to 20 LPA and Amity highest Rs 18 LPA) | none (online sources exist) |
| A7 | amity-vs-manipal-online-mba-2026 · L43976 | "Amity's salary range: ₹5L to ₹12L per annum (as reported by the university for online MBA alumni)." | Amity Online reports no range. Its only figure is the highest package, Rs 18 Lakh Per Annum. | S3, S4 | CONFLICT (site ₹5L-₹12L "reported" vs Amity's highest Rs 18 LPA; no range published) | none |
| A8 | amity-vs-manipal-online-mba-2026 · L43978 | "MUJ's salary range: ₹4L to ₹15L per annum (as reported by the university for online MBA alumni)." | Online Manipal: 6 LPA average across all its universities. MBA graduates average about INR 5.5 LPA, highest INR 13.36 LPA. Nothing is MUJ-only, and there is no range. | S1, S2 | CONFLICT (site ₹4L-₹15L; the published MBA highest is INR 13.36 LPA, below the site's ₹15L top) | none |
| A9 | amity-vs-manipal-online-mba-2026 · L44046 (content) | "Amity reports ₹5L to ₹12L salary range and MUJ reports ₹4L to ₹15L." | As A7 and A8 | S3, S1, S2 | CONFLICT | none |
| A10 | amity-vs-manipal-online-mba-2026 · L43828 (FAQ) | "Amity reports a salary range of ₹5L to ₹12L and MUJ reports ₹4L to ₹15L." | As A7 and A8 | S3, S1, S2 | CONFLICT | none |
| A11 | jain-vs-amity-online-mba-2026 · L44263 | "JAIN's reported salary range: ₹5L to ₹18L per annum." | JAIN Online prints "₹8-25 LPA" as a "Target salary range". That is not a reported outcome. | S5 | CONFLICT (site ₹5L-₹18L "reported" vs portal target ₹8-25 LPA) | none |
| A12 | jain-vs-amity-online-mba-2026 · L44265 | "Amity's reported salary range: ₹5L to ₹12L per annum." | As A7 | S3 | CONFLICT | none |
| A13 | jain-vs-amity-online-mba-2026 · L44267 | "JAIN's upper band is higher per official data … median outcome for both is likely in the ₹6-10L range" | Neither online arm publishes a median. The "per official data" attribution has no source. | S3, S5 | UNVERIFIABLE (the false "per official data" attribution should go) | MISMATCH (only campus NIRF medians exist: Amity Rs 6,00,000, JAIN Rs 8,50,000) |
| A14 | nmims-vs-symbiosis-online-mba-2026 · L44530 | "NMIMS reported salary range: ₹5L to ₹10L per annum (online MBA alumni)." | NMIMS CDOE publishes no salary figure. | S6, S12 | UNVERIFIABLE | MISMATCH |
| A15 | nmims-vs-symbiosis-online-mba-2026 · L44533 | "The ranges are nearly identical. Symbiosis's floor is ₹1L higher per data" | No Symbiosis online figure was found. **This sentence is also orphaned:** no Symbiosis range appears on the page (L44531-44532 is blank), so it compares against a deleted line. | S23 | UNVERIFIABLE | MISMATCH |
| A16 | amity-online-mba-review-2026 · L23913 (FROZEN) | "Mid-career switchers … can expect ₹5-10 LPA. Freshers should plan for ₹3-6 LPA." | Amity Online: highest Rs 18 LPA only. Campus: ABS median INR 6.50 LPA (class of 2022-24); NIRF median Rs 6,00,000 (2023-24). | S3, S9, S16 | UNVERIFIABLE | MISMATCH |
| A17 | best-online-mba-colleges-india-2026 · L36634 (FAQ) | "Realistic expectation for most graduates is ₹4-8 LPA at first placement." (Amity context) | Amity Online publishes no first-placement range. | S3, S4 | UNVERIFIABLE | MISMATCH |
| A18 | upes-online-mba-review-2026 · L36606 (FAQ) | "existing energy professionals see ₹3-8 LPA salary increments … senior trajectories reach ₹15-30 LPA" | UPES Online prints only a percentage hike from an alumni survey, with no rupee figure. The UPES MBA admissions page prints "Highest Package*" 30LPA (2023-24, mode not stated). | S7, S8 | UNVERIFIABLE | MISMATCH. The ₹30 LPA top equals the UPES headline MBA highest package, a likely campus leak. |
| A19 | upes-online-mba-review-2026 · L36611 (content) | "raises of ₹3-8 LPA … senior energy roles can reach ₹15-30 LPA" | As A18 | S7, S8 | UNVERIFIABLE | MISMATCH |
| A20 | bits-pilani-online-mba-review-2026 · L37480 (FAQ, FROZEN) | "typically see ₹3-7 LPA salary increments … can reach ₹20-40 LPA range" | No BITS WILP salary figure was found on official domains. | S23 | UNVERIFIABLE | MISMATCH (BITS publishes only campus placement statistics) |
| A21 | bits-pilani-online-mba-review-2026 · L37609 (FROZEN) | "typically see ₹3-7 LPA salary increments … can reach ₹20-40 LPA range" | As A20 | S23 | UNVERIFIABLE | MISMATCH |
| A22 | jain-online-mba-review-2026 · L37932 (FAQ, FROZEN) | "Existing professionals using the MBA for promotions typically see ₹3-7 LPA salary increments." | JAIN Online prints only a target range of ₹8-25 LPA. | S5 | UNVERIFIABLE | none (an online figure exists but says something else) |
| A23 | jain-online-mba-review-2026 · L38044 (FROZEN) | "typically see ₹3-7 LPA salary increments" | As A22 | S5 | UNVERIFIABLE | none |
| A24 | ignou-online-mba-review-2026 · L6488 (FROZEN) | "An on-campus recruitment event was held in 2024 … roles at Rs 2 to 3.4 LPA." | A 23 Feb 2024 IGNOU drive notice exists, but its details link now opens an unrelated file. No package is stated. | S22 | UNVERIFIABLE (the event is real; the Rs 2-3.4 LPA figure is not sourced) | none |
| A25 | ignou-online-mba-review-2026 · L6531 (FROZEN) | "Internal corporate promotion: Rs 6-12 LPA upgrade typical" | No IGNOU source | n/a | UNVERIFIABLE | none |
| A26 | chandigarh-university-online-mba-review · L30644 (FROZEN) | "For 2026 working professionals at Rs 5-12 LPA seeking career upgrade" | This describes the reader, not a CU outcome. CU's page uses the same digits for a different claim: "salary growth ranging from ₹5 LPA- ₹12 LPA". | S21 | UNVERIFIABLE as a CU claim. No edit needed if it stays an audience line; do not cite S21 for it. | none |
| A27 | chandigarh-university-online-mba-review · L30561-30567 (FROZEN, 7-row spec salary table) | e.g. "Data Science and AI Rs 7-13 LPA Rs 16-28 LPA" | CU Online prints role averages (e.g. "Financial Analyst ₹5 LPA") and the ₹5-12 LPA growth line, not spec-level outcomes. | S21 | UNVERIFIABLE | none |
| A28 | mat-exam-2026-eligibility-pattern-dates · L10777 | "Mid-tier MAT colleges. Rs 6-10 LPA placement at SRM, JAIN, Amity." | No range is published. NIRF 2025 campus PG 2-year medians for 2023-24: SRM Rs 8,65,000; JAIN Rs 8,50,000; Amity Rs 6,00,000. All three fall inside the site's range. | S18, S17, S16 | UNVERIFIABLE as a range (consistent with the NIRF medians; replaceable by them with year and "campus" label) | none (campus context) |
| A29 | mba-scope-india-2026 · L16397 (FAQ) | "Tier-1 private (IIFT, SP Jain, NMIMS): Rs 12 to 18 LPA." | NMIMS NIRF campus PG median: Rs 20,00,000 (2023-24), Rs 21,35,000 (2022-23), Rs 19,20,000 (2021-22). All three are above the site's top. IIFT and SP Jain were not checked (not in lib/data.ts scope). | S12 | CONFLICT for NMIMS (site Rs 12-18 LPA vs NIRF median Rs 20,00,000, 2023-24) | none |

### A2 extras in the same table (mba-vs-pgdm-online-india-2026, header "Year 1 CTC (online)")

| # | Line | Site now | Official source says | Source | Verdict | Scope flag |
|---|---|---|---|---|---|---|
| X1 | L11647 | "NMIMS Online (Mumbai) … Rs 7-15 LPA" | NMIMS CDOE: none | S6 | UNVERIFIABLE | MISMATCH |
| X2 | L11649 | "JAIN Online (Bengaluru) … Rs 5-10 LPA" | Target ₹8-25 LPA only | S5 | UNVERIFIABLE | none |
| X3 | L11650 | "Amity University Online … Rs 5-10 LPA" | Highest Rs 18 LPA only | S3 | UNVERIFIABLE | none |
| X4 | L11651 | "Manipal University Jaipur Online … Rs 5-10 LPA" | Group-wide 6 LPA average; MBA ~5.5 LPA average and 13.36 LPA highest | S1, S2 | UNVERIFIABLE (no MUJ figure, no range) | none |
| X5 | L11652 | "Symbiosis SCDL (Pune) … Rs 5-9 LPA" | None found | S23 | UNVERIFIABLE | MISMATCH |
| X6 | L11653 | "Symbiosis Pune Campus (Full-Time MBA) … Rs 16-22 LPA" under the "(online)" column | NIRF university-wide PG 2-year median is Rs 12,68,000 (2023-24). Not an MBA-only figure. | S14 | UNVERIFIABLE | MISMATCH (campus figure under an online header) |
| X7 | L11663 | "NMIMS Online MBA: Rs 7-15 LPA lateral entry." | None | S6 | UNVERIFIABLE | MISMATCH |

## B. Campus figures attributed to a university

| # | Post · line | Site now | Official source says | Source | Verdict | Scope |
|---|---|---|---|---|---|---|
| B1 | amity-online-mba-review-2026 · L23824 (FROZEN) | "MBA Highest Package (Amity Business School Noida campus, class of 2022-24) ₹26.30 LPA · Finance domain; not representative" | "INR 26.30 LPA Highest CTC". Finance: "Highest – INR 26.30 LPA". The same report gives median INR 6.50 LPA and average INR 7.35 LPA. | S9 | SOURCED. The page has no URL; add S9. | Campus MBA, ABS Noida, class of 2022-24. Correctly labelled campus. |
| B2 | amity-online-mba-review-2026 · L23828 (FROZEN) | "The ₹26.30 LPA highest CTC (Amity Business School Noida campus MBA, class of 2022-24)" | As B1 | S9 | SOURCED | Campus |
| B3 | online-mba-lpu-review-2026 · L12312 | "highest package ₹49.4 LPA in 2025. That figure relates to the full-time on-campus cohort" | The press release says "₹49.46 Lakhs" for the "Class of 2025". LPU's own MBA pages round it to "₹49.4 lakh". NIRF campus median: Rs 6,77,000 (2023-24). | S10, S11, S19 | SOURCED (matches LPU's own MBA page; the press release prints ₹49.46 Lakhs). LPU does not say "on-campus"; that is the site's inference. No URL on the page; add S11. | Campus MBA, class of 2025 |
| B4 | mba-vs-pgdm-online-india-2026 · L11569 | "Top placement CTC · NMIMS Mumbai Rs 18-30 LPA" | NIRF median Rs 20,00,000 (2023-24). No range or top CTC is published in NIRF. | S12 | UNVERIFIABLE (the range is not published; the median falls inside it) | Campus |
| B5 | mba-vs-pgdm-online-india-2026 · L11648 | "NMIMS Mumbai Campus (Full-Time MBA) … Rs 18-28 LPA", in the column headed "Year 1 CTC (online)" | As B4 | S12 | UNVERIFIABLE | MISMATCH: a campus figure under an "online" header |
| B6 | mba-vs-pgdm-online-india-2026 · L11662 | "NMIMS Mumbai Campus MBA: Rs 18-28 LPA fresher placement." | As B4 | S12 | UNVERIFIABLE (replaceable by the NIRF median with year) | Campus |
| B7 | bba-full-form-course-details-eligibility-fees-2026 · L32647 | "campus placements at these colleges often start at INR 6-8 LPA for freshers" (NMIMS or Symbiosis BBA) | NIRF 2025 UG 3-year medians for 2023-24: NMIMS Rs 5,50,000; Symbiosis International Rs 4,60,000. Both are university-wide UG 3-year, not BBA only. | S13, S14 | CONFLICT (site INR 6-8 LPA vs NIRF UG medians Rs 5,50,000 and Rs 4,60,000) | Campus UG; NIRF does not split out BBA |
| B8 | jamia-hamdard-mba-2026 · L23030 | "Campus placement, median Rs 5.52 LPA per NIRF 2024 data" | NIRF 2024 Management, PG 2-year, graduating 2022-23: "552000(Five Lakh fifty two thousand)" | S15 | SOURCED | Campus PG 2-year, graduating 2022-23 (NIRF 2024 cycle). Labelled campus. |
| B9 | jamia-hamdard-mba-2026 · L23159 | "Treat the Rs 5.52 LPA NIRF median as a campus-MBA benchmark, not an online MBA expected outcome." | As B8 | S15 | SOURCED | Campus. Explicitly not applied to online. |

## C. Online figures already attributed to a portal

| # | Post · line | Site now | Official source says | Source | Verdict | Scope |
|---|---|---|---|---|---|---|
| C1 | mahe-online-mba-review-2026 · L6851 | "a 6 LPA average across all its universities … Treat it as a group-wide marketing figure" | "Average Salary Package 6 LPA*", depending on work experience and industry | S1 | SOURCED | Online; group-wide; no year. Note that S2 gives an MBA-only average of about INR 5.5 LPA. |
| C2 | muj-online-mba-review-2026 · L7127 | "2,500+ offers and a 6 LPA average package. Both figures cover all its universities" | "2,500+ Offers Received"; "6 LPA*" | S1 | SOURCED | as C1 |
| C3 | online-manipal-mba-review-2026 · L6636 | "2,500+ offers and a 6 LPA average package across all its universities" | as C2 | S1 | SOURCED | as C1 |

## D. Aggregator-sourced figures (class C)

None of these sources is approved under CLAUDE.md. By rule they were not opened, so each figure is UNVERIFIABLE. No blacklisted competitor appears in any of them. Glassdoor is named alongside the others and is also an aggregator.

| # | Post · line | Site now (trimmed) | Named source | Verdict |
|---|---|---|---|---|
| D1 | mba-marketing-career-salary-jobs-2026 · L14077 (FAQ) | "Median MBA Marketing salary … approximately Rs 12.2 LPA per Kraftshala and 6figr data." | Kraftshala, 6figr | UNVERIFIABLE |
| D2 | mba-marketing-career-salary-jobs-2026 · L14060 (metaDescription, frozen) | "Rs 12.2 LPA median, 20% digital premium" | (inherits D1, D3) | UNVERIFIABLE. Meta frozen until 5 Dec; park with D1. |
| D3 | mba-marketing-career-salary-jobs-2026 · L14083 (FAQ) | a percentage "digital premium" "per Kraftshala 2026 data", plus Rs bands | Kraftshala | UNVERIFIABLE |
| D4 | mba-operations-management-career-2026 · L17185 | Amazon "Rs 13 to 20 LPA … Rs 28 to 53 LPA … per Levels.fyi 2026" | Levels.fyi | UNVERIFIABLE |
| D5 | mba-operations-management-career-2026 · L17187 | Flipkart "Rs 12.7 LPA (… per 6figr 2026) … Rs 4.5 to 14 LPA … Rs 18 to 28 LPA (PayScale 2025-26)" | 6figr, PayScale | UNVERIFIABLE |
| D6 | mba-operations-management-career-2026 · L17193 | caveat: ranges are "from public sources (PayScale, 6figr, Levels.fyi, Glassdoor)" | 4 aggregators | UNVERIFIABLE (it sources every range on the page) |
| D7 | mba-international-business-career-2026 · L17421 | "around Rs 24 LPA across experience bands (6figr 2026)" | 6figr | UNVERIFIABLE |
| D8 | mba-international-business-career-2026 · L17339 (FAQ) | "around Rs 24 LPA across experience bands (6figr 2026)" | 6figr | UNVERIFIABLE |
| D9 | mba-international-business-career-2026 · L17433 | caveat naming 6figr, Glassdoor, PayScale, Levels.fyi | 4 aggregators | UNVERIFIABLE |
| D10 | mba-digital-marketing-career-2026 · L17690 | caveat: ranges "from Kraftshala, Glassdoor, Levels.fyi and edifyedu.in counsellor interviews" | 3 aggregators | UNVERIFIABLE |
| D11 | mba-digital-marketing-career-2026 · L17594 (FAQ), L17603 | industry growth percentage and market size "(Kraftshala 2026)" | Kraftshala | UNVERIFIABLE (not a salary figure, but an aggregator citation) |
| D12 | distance-mba-hyderabad-2026 · L18290 | caveat naming PayScale, Glassdoor, 6figr, Levels.fyi | 4 aggregators | UNVERIFIABLE |
| D13 | mba-vs-bba-which-is-better-2026 · L16681 | "Indian data from PayScale, Glassdoor, 6figr and edifyedu.in counsellor interviews" | 3 aggregators | UNVERIFIABLE |
| D14 | online-mca-course-india · L27390 (FAQ) | "Payscale puts the average MCA salary in India at around Rs.10 LPA (2026)." | PayScale | UNVERIFIABLE |
| D15 | online-mca-course-india · L27428, L27476 | chart "based on Payscale and Glassdoor India data (2026)"; sources line "Payscale India (2026), Glassdoor India (2026)" | PayScale, Glassdoor | UNVERIFIABLE |

## Summary

- **SOURCED: 8.**
  - B1, B2 (Amity ABS Noida ₹26.30 LPA, campus, class of 2022-24).
  - B3 (LPU ₹49.4 lakh, campus, class of 2025).
  - B8, B9 (Jamia Hamdard Rs 5.52 LPA NIRF 2024).
  - C1-C3 (Online Manipal 6 LPA, group-wide).
- **CONFLICT: 9.**
  - A6-A12: all of the "as reported by the university" ranges, plus Amity and DY Patil.
    - None of the four universities publishes the range attributed to it.
    - Amity prints only an Rs 18 LPA highest.
    - Online Manipal prints a 6 LPA average, an MBA average of about 5.5 LPA and an MBA highest of 13.36 LPA.
    - JAIN prints a *target* of ₹8-25 LPA.
    - DPU-COL prints 5.5 to 20 LPA.
  - A29: NMIMS Rs 12-18 LPA vs NIRF median Rs 20,00,000.
  - B7: NMIMS or Symbiosis BBA INR 6-8 LPA vs NIRF UG medians Rs 5,50,000 and Rs 4,60,000.
- **UNVERIFIABLE:**
  - 31 rows across sections A, A2 extras and B: A1-A5, A13-A28, X1-X7, B4-B6.
  - 15 aggregator rows (D1-D15).
- **MISMATCH flags (online figure, only campus data exists, or a campus figure under an online label): 19.**
  - Section A: A1-A5, A13-A21.
  - A2 extras: X1, X5, X6, X7.
  - Section B: B5.
- **Not one online-programme salary range in scope is published by its university.**
  - The only online figures that exist are Online Manipal's group-wide average and MBA figures, Amity's single highest-package figure, JAIN's target range, DPU-COL's all-programme range and CU's growth line.
  - None of them supports a "Year 1 / Year 5" ladder or a per-city figure.
- **Orphan sentence:** nmims-vs-symbiosis L44533 compares against a Symbiosis range that no longer appears on the page.
- **Usable replacements, campus-labelled, with year:**
  - NIRF medians: NMIMS Rs 20,00,000; Amity Rs 6,00,000; JAIN Rs 8,50,000; SRM Rs 8,65,000; LPU Rs 6,77,000. All for graduating year 2023-24, from NIRF 2025.
  - Jamia Hamdard Rs 5,52,000, graduating year 2022-23, from NIRF 2024.
  - ABS Noida median INR 6.50 LPA, class of 2022-24.

## Draft lines for audits/QUESTIONS-FOR-RISHI.md (not written there; caller restricted writes to this file)

UNVERIFIABLE maps to UNCLEAR in house terms. Under the batch-20 plan these figures are deleted unless Rishi objects. One line per row:

- A1 online-mba-pune-university-2026 L12749 shows "Symbiosis SCDL PGDBA graduates: Rs 5-9 LPA Year 1. Rs 12-22 LPA Year 5"; no Symbiosis source. https://edifyedu.in/blog/online-mba-pune-university-2026
- A2 same post L12750 shows "NMIMS Online MBA graduates in Pune: Rs 7-13 LPA … Rs 16-26 LPA"; NMIMS CDOE publishes none. https://edifyedu.in/blog/online-mba-pune-university-2026
- A3 same post L12751 shows Amity Online Pune "Rs 5-10 LPA … Rs 12-22 LPA"; Amity prints only a highest Rs 18 LPA. https://edifyedu.in/blog/online-mba-pune-university-2026
- A4 same post L12752 shows JAIN Online Pune "Rs 5-10 LPA … Rs 12-22 LPA"; JAIN prints only a target ₹8-25 LPA. https://edifyedu.in/blog/online-mba-pune-university-2026
- A5 distance-mba-colleges-mumbai-2026 L19695 shows NMIMS Online Mumbai "Rs 8 to 18 LPA … Rs 18 to 28 LPA"; no source. https://edifyedu.in/blog/distance-mba-colleges-mumbai-2026
- A13 jain-vs-amity-online-mba-2026 L44267 shows "per official data … median … ₹6-10L"; no official median exists. https://edifyedu.in/blog/jain-vs-amity-online-mba-2026
- A14 nmims-vs-symbiosis-online-mba-2026 L44530 shows "NMIMS reported salary range: ₹5L to ₹10L"; NMIMS publishes none. https://edifyedu.in/blog/nmims-vs-symbiosis-online-mba-2026
- A15 same post L44533 shows "Symbiosis's floor is ₹1L higher per data"; no source, and no Symbiosis range is on the page. https://edifyedu.in/blog/nmims-vs-symbiosis-online-mba-2026
- A16 amity-online-mba-review-2026 L23913 (frozen) shows "₹5-10 LPA … ₹3-6 LPA" for Amity online graduates; no source. https://edifyedu.in/blog/amity-online-mba-review-2026
- A17 best-online-mba-colleges-india-2026 L36634 FAQ shows Amity "₹4-8 LPA at first placement"; no source. https://edifyedu.in/blog/best-online-mba-colleges-india-2026
- A18/A19 upes-online-mba-review-2026 L36606 and L36611 show "₹3-8 LPA … ₹15-30 LPA"; UPES Online prints no rupee figure. https://edifyedu.in/blog/upes-online-mba-review-2026
- A20/A21 bits-pilani-online-mba-review-2026 L37480 and L37609 (frozen) show "₹3-7 LPA … ₹20-40 LPA"; no BITS WILP source. https://edifyedu.in/blog/bits-pilani-online-mba-review-2026
- A22/A23 jain-online-mba-review-2026 L37932 and L38044 (frozen) show "₹3-7 LPA salary increments"; no source. https://edifyedu.in/blog/jain-online-mba-review-2026
- A24 ignou-online-mba-review-2026 L6488 (frozen) shows a 2024 event "at Rs 2 to 3.4 LPA"; the IGNOU notice states no package. https://edifyedu.in/blog/ignou-online-mba-review-2026
- A25 same post L6531 (frozen) shows "Rs 6-12 LPA upgrade typical"; no source. https://edifyedu.in/blog/ignou-online-mba-review-2026
- A26/A27 chandigarh-university-online-mba-review L30644 audience line "Rs 5-12 LPA" and the L30561-30567 spec salary table (frozen); CU publishes no spec outcomes. https://edifyedu.in/blog/chandigarh-university-online-mba-review
- A28 mat-exam-2026-eligibility-pattern-dates L10777 shows "Rs 6-10 LPA placement at SRM, JAIN, Amity"; no range is published, though the NIRF medians fit it. https://edifyedu.in/blog/mat-exam-2026-eligibility-pattern-dates
- X1-X7 and B4-B6 mba-vs-pgdm-online-india-2026 L11569, L11647-11653 and L11662-11663 show per-university CTC ranges under "Year 1 CTC (online)", including campus rows; none is published. https://edifyedu.in/blog/mba-vs-pgdm-online-india-2026
- D1-D15: aggregator-sourced figures (Kraftshala, 6figr, PayScale, Levels.fyi, Glassdoor) in mba-marketing-career-salary-jobs-2026 (incl. frozen meta), mba-operations-management-career-2026, mba-international-business-career-2026, mba-digital-marketing-career-2026, distance-mba-hyderabad-2026, mba-vs-bba-which-is-better-2026 and online-mca-course-india. Not an approved source.
