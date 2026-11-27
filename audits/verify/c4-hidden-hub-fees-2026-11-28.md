# C4: hidden hub fees, top 12 by impressions (2026-11-28)

This is a read-only audit. No site file was edited and nothing was committed.
Every figure below was read on 2026-11-28 from the university's own domain, apart from row 6, whose source is UNCLEAR.
No aggregator was used as evidence. Search results that pointed to aggregators were used only to find official URLs.
Figures are copied exactly as printed. No total was computed from parts.

## 1. How the list was built

- **Gate.** `shouldIndexProgrammeHub` (lib/seo/should-index.ts) indexes a hub when it has a page-content JSON or when `getDisplayFee(u, program).ok` is true.
- **Re-probe.** The 30 Oct worklist (audits/hidden-hub-fees-2026-10-30.csv, 96 rows) was not trusted. Every `u.programs` entry in lib/data.ts was run through the current gate with `npx tsx`.
- **Result today.** 118 hubs are noindexed: 71 fail rule 4d (shared placeholder range), 38 fail rule 4b (no pd.fees) and 9 fail rule 4a (range wider than 3x). None is held by the mode-unverified gate.
- **Ranking.** The hubs were ranked by impressions in audit-data/Pages.csv (GSC, last 3 months to 10 Nov). Only 35 of the 118 appear in that export. The top 12 are below.

## 2. Results

| # | Hub URL | Impr. | University | Programme | Printed fee (exact) | Label | Source URL | Date | Quote (max 15 words) | Verdict | Current data.ts value |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | /universities/jamia-hamdard-online/bca | 1130 | Jamia Hamdard | BCA (online, code 401, six semesters) | ₹16,500 | Per semester, Indian. The footnote says it includes the one-time Rs. 500 admission fee and the Rs. 2000 exam fee. **No total published.** Foreign fee: USD 500 (older list only) | https://www.jamiahamdard.ac.in/uploads/files/Prospectus_FINAL_Version_1st_September_2026_(Digital).pdf (p.21, "Details of Online Programmes"). Linked from https://www.jamiahamdard.ac.in/CDOE/CDOE.htm | 2026-11-28 | "Per Semester fees# ... ₹16,500" / "Rs. 500/- admission fee (one time) and Rs. 2000/- Exam fee included" | FOUND (per semester only) | pd.fees "₹45K – ₹108K" (4d); feeMin 75000 / feeMax 180000 |
| 2 | /universities/mahatma-jyotiba-phule-rohilkhand-university-online/ma | 784 | MJP Rohilkhand University | MA (English, Hindi, History, Education, Economics), Online (OL) | 10000 | "Total Annual Fee" (per year), Indian. Columns: Registration 150, Programme 8000, Exam 2000, Degree Fee 1000. **No programme total published.** | https://mjpru.ac.in/CODEPFeeStructure.aspx | 2026-11-28 | "M.A (English) Online (OL) 150 8000 2000 10000 1000 60" | FOUND (per year only) | pd.fees "₹48K – ₹117K" (4d); feeMin 75000 / feeMax 180000 |
| 3 | /universities/jamia-hamdard-online/bba | 674 | Jamia Hamdard | BBA (online, code 403, six semesters) | ₹14,500 | Per semester, Indian. Same footnote as row 1 (admission and exam fee included). **No total published.** | Same prospectus as row 1, p.21 | 2026-11-28 | "Bachelor of Business Administration (BBA) 403 Six ... ₹14,500" | FOUND (per semester only) | pd.fees "₹45K – ₹108K" (4d) |
| 4 | /universities/university-of-kerala-online/bcom | 578 | University of Kerala | B.Com (online) | none | n/a | https://www.keralauniversity.ac.in/ugc-approved-odl-program lists BCom among "UGC approved ONLINE programmes from the academic year 2024-2025". The CDOE fee sheet (https://sde.keralauniversity.ac.in/sdeadmission/resources/pdf/SDEFeeStructure2025.pdf) and the prospectus (http://www.ideku.net/resources/Prospectus2025-26.pdf) price ODL programmes only. | 2026-11-28 | "UGC approved ONLINE programmes from the academic year 2024-2025. 1. BBA 2. BCom" | NOT PUBLISHED | pd.fees "₹49K – ₹110K" (4d); feeMin 90000 / feeMax 200000 |
| 5 | /universities/dayalbagh-educational-institute-online/bba | 552 | Dayalbagh Educational Institute | B.B.A. (online) | 2825 | "Total Fee (Rs.)" for the first semester and for each other semester. Indian. **No programme total published.** | https://adms.dei.ac.in/files/admission%202026-27/DEI%20Prospectus_2026-27.pdf (printed p.104, "Fee for Online Under-Graduate And Post-Graduate Programs (per semester)") | 2026-11-28 | "Fee for Online Under-Graduate And Post-Graduate Programs (per semester)" ... "B.B.A. / M.Com./ M.A. Theology 2825 2825" | FOUND (per semester only) | pd.fees "₹45K – ₹108K" (4d); feeMin 75000 / feeMax 180000 |
| 6 | /universities/bangalore-university-online/mcom | 449 | Bangalore University | M.Com (General), online | ₹ 21,800/- (Sem I & II) and ₹ 18,900/- (Sem III & IV) | "Per Year Fee", Indian. Foreign: "Indian Fee+440 USD" and "Indian Fee+550 USD". **No total published.** | https://ddebubonline.in/master-of-commerce-general.html. **Source status UNCLEAR:** not on an .ac.in domain, no link to it found from the university's own site (https://bangaloreuniversity.karnataka.gov.in/; bangaloreuniversity.ac.in no longer resolves), and its student app is Digivarsity's. | 2026-11-28 | "Per Year Fee ₹ 21,800/-" | NOT PUBLISHED on a confirmed official domain (UNCLEAR, see Q-C4-1) | pd.fees "₹42K – ₹105K" (4d); feeMin 60000 / feeMax 150000 |
| 7 | /universities/jamia-hamdard-online/bcom | 437 | Jamia Hamdard | B.Com | none | n/a | The prospectus (row 1, p.21) lists only BCA, BBA and BAIS as online UG programmes for 2026-27. The CDOE 2026 sheet (https://www.jamiahamdard.ac.in/uploads/files/Details_of_ODL_and_Online_Programmes_of_CDOE,_JH_2026.pdf) also has no B.Com. An older undated list (https://jamiahamdard.ac.in/CDOE/pdf/List%20of%20ODL%20and%20OL%20Programmes.pdf) had "B.COM (H)" online at 9,500. | 2026-11-28 | "Under Graduate Programme ... (BCA) ... (BBA) ... Bachelor of Arts in Islamic Studies (BAIS)" | NOT PUBLISHED (and possibly not offered online in 2026-27) | pd.fees "₹41K – ₹99K" (4d) |
| 8 | /universities/madurai-kamaraj-university-online/bcom | 395 | Madurai Kamaraj University | B.Com (online) | none | n/a | The only MKU fee pages found are distance (ODL) pages, e.g. https://mkuniversity.ac.in/dde/pg_fee_2026.php. https://mkuniversity.ac.in/dde/ug_fee_2026.php returns 404, and mkuniversity.ac.in fails TLS to curl and WebFetch (read via agent-reach). No online-mode fee page was found. | 2026-11-28 | "Fee (Per year - From 26AY Onwards) Rs." (PG ODL page header) | NOT PUBLISHED | pd.fees "₹41K – ₹99K" (4d); feeMin 75000 / feeMax 180000 |
| 9 | /universities/jamia-hamdard-online/ma | 393 | Jamia Hamdard | MA: Islamic Studies (MAIS, 663) and Political Science (MAPS, 665), online, four semesters | MAIS ₹8,500; MAPS ₹7,000 | Per semester, Indian. Same footnote as row 1. **No total published.** Two MAs at two different fees. | Same prospectus as row 1, p.21 | 2026-11-28 | "Master of Arts in Islamic Studies (MAIS) 663 Four ... ₹8,500" | FOUND (per semester only, two programmes) | pd.fees "₹48K – ₹117K" (4d) |
| 10 | /universities/shivaji-university-online/mba | 380 | Shivaji University, Kolhapur | Online M.B.A. | 124640 (Actual Fee, Part I & II); 62320 (Part I) | **University's own total.** "Total of 1 to 10", Actual Fee, Part I & II. Indian. The same table prints concession columns: 53320 (Part I, 15%) and 100640 (Part I & II, 20%). Exam fee is extra. Eligibility fee is extra: 300 (Maharashtra board or SUK), 500 (others), 1000 (NRI or foreign). | https://online.unishivaji.ac.in/uploads/data/2026/Fee%20Structure%202026-27.pdf (scanned image), linked from https://online.unishivaji.ac.in/fee-structure | 2026-11-28 | "Online Courses Fresh Students Fee Structure for the Year 2026-27" ... "Total of 1 to 10 62320 124640" | FOUND (total published) | pd.fees "₹90K – ₹200K" (4d); feeMin 90000 / feeMax 200000 |
| 11 | /universities/guru-jambheshwar-university-online/bcom | 339 | Guru Jambheshwar University of Science & Technology | B.Com (General), ONLINE MODE | 7500/- | "Grand Total" per instalment, for each of the 1st to 6th instalments (Tuition 6000/-, Exam 1400/-, Registration/Continuation 100/-). Indian. **No programme total published.** | https://ddegjust.ac.in/Portal/Upload/Fee_Structure_page-0002_30July2026_17-23-54-47.pdf (p.3, "Under Graduate Programmes (ONLINE MODE)"), linked from https://www.ddegjust.ac.in/Page/Index_Admission/Online%20Mode%20Admission/982 | 2026-11-28 | "BACHELOR OF COMMERCE (General) 1st 6000/- 1400/- 100/- 7500/-" | FOUND (per instalment only) | pd.fees "₹33K – ₹82K" (4d); feeMin 60000 / feeMax 150000 |
| 12 | /universities/mahatma-jyotiba-phule-rohilkhand-university-online/ba | 335 | MJP Rohilkhand University | B.A. (combination of 3 subjects), Online (OL) | 8000 | "Total Annual Fee" (per year), Indian. Columns: Registration 150, Programme 6000, Exam 2000, Degree Fee 1000. **No programme total published.** | https://mjpru.ac.in/CODEPFeeStructure.aspx | 2026-11-28 | "B.A.(Combination of 3 Subject ...) Online (OL) 150 6000 2000 8000" | FOUND (per year only) | pd.fees "₹37K – ₹90K" (4d); feeMin 75000 / feeMax 180000 |

**Counts:** FOUND 8 (rows 1, 2, 3, 5, 9, 10, 11, 12). Only 1 of them, Shivaji MBA, has a university-published total; the other 7 are per semester, per year or per instalment only. NOT PUBLISHED 4 (rows 4, 6, 7, 8), and row 6 is also UNCLEAR on its source. BLOCKED 0. No site refused access outright, but MKU's TLS failure meant it could only be read through agent-reach.

**What these figures show:** every placeholder range in data.ts is far above what the universities publish. For example, data.ts holds "₹45K – ₹108K" for Jamia Hamdard BCA, and the prospectus prints ₹16,500 a semester. Data.ts holds "₹41K – ₹99K" for GJUST B.Com, and the online fee sheet prints 7500/- an instalment. Treat these as notes on scale, not as totals.

## 3. Caveats the engineer must read

1. **Jamia Hamdard labels conflict.** The Sept 2026 prospectus heads the column "Per Semester fees#". The earlier CDOE 2026 sheet heads the same ₹16,500 / ₹14,500 "Total Fee with Registration". The undated older list shows that ₹16,500 was 14,000 programme fee plus 2,000 exam fee plus a one-time 500. The prospectus is the newest document, so its label is used above. The MAIS fee rose from ₹7,500 (CDOE 2026 sheet) to ₹8,500 (prospectus).
2. **MJPRU's page contradicts itself.** The table has an "Exam Fee" column of 2000, but note 1 says "Examination fee is additional and is informed time to time." The heading reads "Distance P.G. Programs", yet every row says "Online (OL)".
3. **Shivaji's 2026-27 online table lists only the MBA and the M.Sc. (Maths).** The Shivaji M.Com hub (324 impressions, next in the queue) appears only in the 2025-26 PDF title. Check the mode and the year before using it.
4. **Kerala, Jamia Hamdard B.Com and MKU are mode or publication gaps, not fee gaps.** Jamia Hamdard's 2026-27 online list has no B.Com at all.

## 4. What a site engineer would set

Rule reminder: `feeBreakdown` requires `list`, a total. Seven of the eight FOUND rows have no published total, and a total must never be built by multiplying a per-semester figure. They cannot be unlocked through the fee gate as the code stands.

**A. Unlock now (published total exists):**

- `shivaji-university-online`, MBA:
  - `programDetails.MBA.fees`: `'₹1,24,640'`. This is the university's "Actual Fee" total for Part I & II.
  - `feeBreakdown.mba`: `{ list: 124640, listLabel: 'Actual fee, Part I & II (2026-27)', source: 'https://online.unishivaji.ac.in/uploads/data/2026/Fee%20Structure%202026-27.pdf' }`. Add `net` for 100640 only once Q-C4-2 says who the 20% concession applies to.
  - `officialUrl`: `'https://online.unishivaji.ac.in'`. `feeVerifiedOn`: `'2026-11-28'`.
  - Show an indicative-fee line: exam fee and eligibility fee (Rs 300 / 500 / 1,000) are charged separately.
  - Leave `feeMin`/`feeMax` alone unless the university-level range is also re-sourced (it is the shared 90000/200000 placeholder).
  - Then regenerate `data/placeholder-fee-ranges.json` with `npx tsx` and run the leak check. "₹90K – ₹200K" is still held by Kerala MBA and Banasthali MBA. Per the ratchet note, those two must stay suppressed after Shivaji leaves the shared group.

**B. Record now, publish after a decision (Q-C4-3).** Store these as sourced figures only. Do not put them in `pd.fees`, because `parseFeeStr` would print them as a total, and DEI's 2825 is below `MIN_CREDIBLE_FEE` (5000) anyway.

| University id | Programme | Figure to store | Label | Source |
|---|---|---|---|---|
| jamia-hamdard-online | BCA | 16500 | per semester, incl. one-time ₹500 admission and ₹2,000 exam fee | prospectus p.21 |
| jamia-hamdard-online | BBA | 14500 | per semester, same note | prospectus p.21 |
| jamia-hamdard-online | MA | MAIS 8500; MAPS 7000 | per semester, same note | prospectus p.21 |
| mahatma-jyotiba-phule-rohilkhand-university-online | MA | 10000 | Total Annual Fee (per year); degree fee 1000 extra | mjpru.ac.in/CODEPFeeStructure.aspx |
| mahatma-jyotiba-phule-rohilkhand-university-online | BA | 8000 | Total Annual Fee (per year); degree fee 1000 extra | mjpru.ac.in/CODEPFeeStructure.aspx |
| dayalbagh-educational-institute-online | BBA | 2825 | per semester (first and other) | DEI Prospectus 2026-27 p.104 |
| guru-jambheshwar-university-online | B.Com | 7500 | Grand Total per instalment, 6 instalments | ddegjust.ac.in online fee PDF p.3 |

The `officialUrl` values these rows support, all confirmed as the university's own:

| University id | officialUrl |
|---|---|
| jamia-hamdard-online | `https://www.jamiahamdard.ac.in` |
| mahatma-jyotiba-phule-rohilkhand-university-online | `https://mjpru.ac.in` |
| dayalbagh-educational-institute-online | `https://www.dei.ac.in` |
| guru-jambheshwar-university-online | `https://www.ddegjust.ac.in` |
| shivaji-university-online | `https://online.unishivaji.ac.in` |

**C. Leave hidden:**

- university-of-kerala-online/bcom: no online fee published.
- jamia-hamdard-online/bcom: no online B.Com in 2026-27. This is a mode doubt; route it to the mode-unverified review.
- madurai-kamaraj-university-online/bcom: only ODL fees published.
- bangalore-university-online/mcom: source UNCLEAR, Q-C4-1.

The other route, a real page-content JSON per hidden hub (memory note: a hidden hub with no fee can be indexed by real content JSON, never by a fake fee), is still open for every hub in section C.

## 5. UNCLEAR rows and open questions (Q-C4-1 to Q-C4-3)

These belong in audits/QUESTIONS-FOR-RISHI.md. They have not been copied there yet, because this task was limited to writing this one file.

- **Q-C4-1. Bangalore University online M.Com** (https://edifyedu.in/universities/bangalore-university-online/mcom, hidden; data.ts placeholder "₹42K – ₹105K").
  - The only fee found is "Per Year Fee ₹ 21,800/-" (Sem I and II) and ₹ 18,900/- (Sem III and IV), at https://ddebubonline.in/master-of-commerce-general.html.
  - That domain is not .ac.in, nothing on the university's own site links to it, and its student app is Digivarsity's.
  - Question: is ddebubonline.in the university's official online portal?
- **Q-C4-2. Shivaji University online MBA** (https://edifyedu.in/universities/shivaji-university-online/mba, hidden; data.ts placeholder "₹90K – ₹200K").
  - The 2026-27 PDF prints Actual Fee 124640 for Part I and II, next to a "20%" concession column of 100640.
  - Question: does every student get that concession, or only the categories named on https://online.unishivaji.ac.in/fee-structure?
  - Until this is answered, publish only 124640.
- **Q-C4-3. Per-semester-only hubs.** Seven hubs have official fees, but only per semester, per year or per instalment (section 4B). Examples:
  - Jamia Hamdard BCA ₹16,500 per semester (https://edifyedu.in/universities/jamia-hamdard-online/bca)
  - GJUST B.Com 7500/- per instalment (https://edifyedu.in/universities/guru-jambheshwar-university-online/bcom)

  Question: may these hubs show the labelled per-period figure, which needs a small code change because `feeBreakdown.list` is a total? Or should they wait for a university-published total?
