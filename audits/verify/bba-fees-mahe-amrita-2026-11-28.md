# BBA fee verify: MAHE online and Amrita online, 2026-11-28

Scope: the exact official online BBA fee for two records with no exact `getExactFee` value (lib/fees.ts).

- `manipal-academy-higher-education-online` (lib/data.ts line 2498, BBA block at line 2559)
- `amrita-vishwa-vidyapeetham-online` (lib/data.ts line 1147, BBA block at line 1196)

Sources: official portals only. No aggregators were used. A web search returned only aggregator pages for Amrita, and none of them was opened or used.

## How each page was read

| University | URL | Tool | Result |
|---|---|---|---|
| MAHE | https://www.onlinemanipal.com/online-bba-honors-mahe | WebFetch | HTTP 403 (blocked) |
| MAHE | https://www.onlinemanipal.com/online-bba-honors-mahe | agent-reach read | OK, full text |
| MAHE | https://www.onlinemanipal.com/online-bba-mahe | agent-reach read | OK, full text (admissions landing page) |
| MAHE | https://www.onlinemanipal.com/online-bba-degree-mahe | agent-reach read | OK. The page shows only a catalogue card, "INR 1,80,000 Online BBA", which links to the Honours page |
| Amrita | https://onlineamrita.com/program/bachelor-of-business-administration/ | WebFetch, then agent-reach read | OK, both reads agree |
| Amrita | https://www.amrita.edu/ahead/bba/ | curl -I | 301 to the onlineamrita.com BBA page above. This confirms onlineamrita.com is the university's own online portal |

The unicrawl and Obscura tools were not needed, because agent-reach returned the full fee sections. No stealth or bot-check bypass was used.

## Fees as printed

| # | University | Programme | Label (as printed) | Amount as printed | URL | Date | Quote (15 words or fewer) | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | MAHE | BBA (6 semesters) | "Full Fee Payment", "Inclusive of all taxes" | INR 1,80,000 | https://www.onlinemanipal.com/online-bba-mahe | 2026-11-28 | "Full Fee Payment ### INR 1,80,000 Inclusive of all taxes" | FOUND |
| 2 | MAHE | BBA (6 semesters) | "Course Fee" (header box) | INR 1,80,000 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "Semester Fee INR 30,000 Course Fee INR 1,80,000" | FOUND |
| 3 | MAHE | BBA (6 semesters), paid in full up front | "Full Fee Payment" (discounted, 1,80,000 struck through) | INR 1,71,000 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "Full Fee Payment ### ~~ INR 1,80,000 ~~ INR 1,71,000" | FOUND |
| 4 | MAHE | BBA (Honours), 8 semesters, 4 years | "BBA Honours full course fee (Eight semesters)" | INR 2,40,000 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "BBA Honours full course fee (Eight semesters) ### INR 2,40,000" | FOUND |
| 5 | MAHE | BBA / BBA (Honours) | "Annual Fee Payment", "No discount" | INR 60,000 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "Annual Fee Payment ### INR 60,000 No discount" | FOUND |
| 6 | MAHE | BBA / BBA (Honours) | "Semester Fee Payment", "No discount" | INR 30,000 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "Semester Fee Payment ### INR 30,000 No discount" | FOUND |
| 7 | MAHE | BBA | "EACH SEMESTER", "*Inclusive of all taxes" | INR 30,000 | https://www.onlinemanipal.com/online-bba-mahe | 2026-11-28 | "EACH SEMESTER ### INR 30,000* *Inclusive of all taxes" | FOUND |
| 8 | MAHE | BBA / BBA (Honours) | Application fee, paid on top at admission | INR 1500 | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "An additional non-refundable application fee of INR 1500" | FOUND |
| 9 | MAHE | BBA / BBA (Honours) | "No-cost EMI Starting" | INR 5,000/Month | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | "No-cost EMI Starting ### INR 5,000/Month" | FOUND |
| 10 | MAHE | BBA, international students | "Full course fee(Six Semesters)" | USD 2,250 (each semester USD 375) | https://www.onlinemanipal.com/online-bba-mahe | 2026-11-28 | "Full course fee(Six Semesters) USD 2,250" | FOUND |
| 11 | MAHE | BBA | One all-in figure that includes the application fee | none printed | https://www.onlinemanipal.com/online-bba-honors-mahe | 2026-11-28 | n/a | NOT PUBLISHED |
| 12 | Amrita | BBA (6 semesters), Indian students | "Total Tuition Fee" (header: "3-Year Tuition Fee") | Rs. 1,41,000 | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "Rs. 1,41,000 Total Tuition Fee" | FOUND |
| 13 | Amrita | BBA, Indian students | "Semester Fee" | Rs. 23,500 | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "Rs. 23,500 Semester Fee" | FOUND |
| 14 | Amrita | BBA, Indian students | "1–Year Fee" (discounted annual payment) | Rs. 44,650 | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "Rs. 44,650 1–Year Fee" | FOUND |
| 15 | Amrita | BBA, Indian students | "Zero Cost EMI" | Rs. 4375 per month | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "Rs. 4375 per month* Zero Cost EMI" | FOUND |
| 16 | Amrita | BBA, foreign nationals | "Total Tuition Fee" | Rs. 1,68,000 (semester Rs. 28,000, 1-year Rs. 53,200) | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "For Foreign Nationals ... Rs. 1,68,000 Total Tuition Fee" | FOUND |
| 17 | Amrita | BBA | Registration fee, one-time, on top of tuition | Rs. 700 | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "* Registration fee - Rs. 700" | FOUND |
| 18 | Amrita | BBA | Examination fee, on top of tuition | Rs.2750 Per Semester | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | "* Examination Fee - Rs.2750 Per Semester" | FOUND |
| 19 | Amrita | BBA | One all-in total that includes registration and exam fees | none printed | https://onlineamrita.com/program/bachelor-of-business-administration/ | 2026-11-28 | The "BBA Course fees" FAQ points to the brochure and gives no figure | NOT PUBLISHED |

### Notes on the readings

- **MAHE, row 3.** The discounted price sits under the heading "Online BBA (Honours) Course Fee" and strikes through 1,80,000, which is the six-semester figure. The page does not print a matching discounted price for the eight-semester Honours route. The landing page (`online-bba-mahe`) shows no discounted price at all. The figure is recorded with its label only. Do not apply it to the 2,40,000 route.
- **MAHE, extra charges.** The Honours page FAQ says revaluation, resit and duplicate-certificate charges "are not included in the program fee". Those are pay-as-needed charges, not part of the programme price.
- **MAHE, scholarship.** The landing page also carries a scholarship banner for women and corporate employees, and the portal advertises a "Manipal Scholarship Scheme". Only rupee amounts are recorded here. No percentage should be published.
- **Amrita.** The university labels Rs. 1,41,000 as "Total Tuition Fee". It is tuition only. Registration (Rs. 700) and examination (Rs.2750 per semester) are listed separately as extra charges. No all-in figure is printed, and none was computed here.
- **Amrita, image alt text.** In the Indian-students block, the icon alt texts carry the foreign-national figures ("Rs. 28,000", "Rs. 53,200", "Rs. 1,68,000"). The visible headings show the Indian figures recorded above. Read the visible text, not the alt text.

## lib/data.ts now vs the portal

| Record | Field | lib/data.ts value now | Portal (2026-11-28) | Agrees? |
|---|---|---|---|---|
| manipal-academy-higher-education-online | `programDetails.BBA.fees` (line 2561) | `'₹168K – ₹224K'` | INR 1,80,000 (6 sem) / INR 2,40,000 (Honours, 8 sem) | NO. Both ends are wrong |
| manipal-academy-higher-education-online | `programFees.bba` / `feeBreakdown.bba` | absent (programFees has `mca` only, feePlans has `mba` only) | n/a | n/a |
| amrita-vishwa-vidyapeetham-online | `programDetails.BBA.fees` (line 1198) | `'₹165K – ₹165K'` | Rs. 1,41,000 Total Tuition Fee (Indian students) | NO |
| amrita-vishwa-vidyapeetham-online | `programFees.bba` / `feeBreakdown.bba` | absent | n/a | n/a |

The per-semester figures in audits/verify/per-semester-fees-2026-11-27.md (MAHE INR 30,000, Amrita Rs. 23,500) still match the portals today.

## What a site engineer would set (not done here)

`feePlans` is typed MBA-only (`Partial<Record<'mba', FeePlan[]>>`), so it cannot hold BBA. Use `feeBreakdown.bba`. `getExactFee` returns it before any `getDisplayFee` agreement check. Also correct `programDetails.BBA.fees`, because other templates read that string.

- **MAHE.** Set `feeBreakdown.bba` with `list: 180000` and `listLabel` "6 semesters, inclusive of all taxes". Use `modes` for the published payment options:
  - 180000, "BBA, 6 semesters"
  - 171000, "BBA, 6 semesters, paid in full up front"
  - 240000, "BBA (Honours), 8 semesters"

  Add `perSemester: { list: 30000 }` and source `onlinemanipal.com/online-bba-honors-mahe, read 2026-11-28`. The INR 1,500 application fee is an add-on. Never fold it into a total. Set `programDetails.BBA.fees` to something like `'₹1,80,000 – ₹2,40,000'`. A `programFees.bba` of `{ fee: 180000, feeMax: 240000 }` would also work for the plain range, but it would lose the labels.
- **Amrita.** Set `feeBreakdown.bba` with `list: 141000`, `listLabel` "total tuition fee, Indian students", `perSemester: { list: 23500 }` and source `onlineamrita.com/program/bachelor-of-business-administration, read 2026-11-28`. Label the figure as tuition, and state that registration (Rs. 700) and examination (Rs. 2,750 per semester) are charged on top. Do not compute an all-in sum. Set `programDetails.BBA.fees` to `'₹1,41,000'`. The foreign-national Rs. 1,68,000 should not go in the main field.
- After the edit, sweep the blogs and spec JSONs for the old strings in all three notation forms (₹1,65,000 / ₹1.65L / ₹165K and ₹1,68,000 / ₹1.68L / ₹168K; ₹2,24,000 / ₹2.24L / ₹224K). Also sweep any derived EMI or gap figures built from them.
