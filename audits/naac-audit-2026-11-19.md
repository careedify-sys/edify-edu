# NAAC grade audit, all 143 universities (19 Nov 2026)

Read-only audit. No site file was changed. Site values are from origin/main 1ed2ea6: `lib/data.ts` (`naac`), `lib/data-slim.ts`, `data/naac-verified.json` (grade and validTill) and `data/fees-hub-data.json`. Line numbers refer to that commit.

## Sources

- **NAAC valid-accreditation list "as on 14-08-2025"**, Universities sheet, 497 data rows. It is still the only list linked from the NAAC accreditation-status page (https://naac.gov.in/index.php/en/2-uncategorised/32-accreditation-status). File: https://www.naac.gov.in/images/docs/ACCREDITATION_STATUS/Institutions_accredited_by_NAAC_having_valid_accreditation-as_on_14082025_1.xlsx. I probed month-end file names from Sep 2025 to Oct 2026 and all returned 404.
- **Row numbers.** "rN" is the Excel row in the Universities sheet (header = row 1), so Sl No = N - 1. The Vignan sheet used the same convention: Vignan r16, SRM IST r367.
- **NAAC Standing Committee result PDFs, 220th to 265th meetings.** All 314 linked files (Cycle 1 to 4, CGPA and grade change, health, legal and teacher education, no-change). The 265th meeting (12-12-2025) is the last one on https://www.naac.gov.in/index.php/en/19-quick-links/62-accreditationresults. I searched by AISHE code and by name. **None of the 124 graded universities has a newer cycle after the 14-08-2025 list.** Two hits matter for ungraded or near-name records: Sandip University, Nashik (SC 260, 26-09-2025, A, 3.11) and Shobhit University, Gangoh (SC 261, A, 3.02).
- **NAAC's own validity notice.** The notice "closure of extension of validity period of accreditation", linked from the NAAC home page, returns 404. So NAAC publishes no end date for any university.
- **University sites.** I checked these only for NOT LISTED records: amity.edu, kluniversity.in (home and accr.aspx), unipune.ac.in, mdu.ac.in and bharathuniv.ac.in. bdu.ac.in failed on a certificate error. Only MDU states a grade ("'A+' Grade University Accredited by NAAC") and it gives no cycle or date.
- No aggregator was used. Supabase was not queried. Its values come from the committed snapshot `reports/journalist-data-report-2026.csv` (855aa95, May 2026, "sourced 100% from Supabase").

## Summary

| Class | Count |
|---|---|
| MATCH (grade matches the NAAC row; no unsourced validTill) | 24 |
| UNVERIFIED VALIDITY (grade matches; naac-verified.json carries a validTill that NAAC does not print) | 68 |
| POSSIBLY LAPSED (grade matches; declared before 19-11-2021; no newer cycle found) | 18 |
| WRONG INSTITUTION (site or snapshot values belong to another institution's row) | 4 |
| WRONG GRADE | 1 |
| NOT LISTED (site states a grade; no row in the valid list) | 9 |
| NO GRADE STATED (site shows no NAAC grade; NAAC row given for reference) | 19 |
| **Total** | **143** |

The classes are exclusive. Each record takes the first class that applies, in this order: WRONG INSTITUTION, WRONG GRADE, NOT LISTED, POSSIBLY LAPSED, UNVERIFIED VALIDITY, MATCH.

- **Unsourced validTill.** Across all classes, 87 records carry a validTill in naac-verified.json, and NAAC prints none of them. Each one is the declaration date plus 7 years, computed by `scripts/sync-naac-from-official.js`. Three of them were computed from another institution's declaration date.
- **Lapse dates.** 19 graded records were declared more than five years ago: the 18 in POSSIBLY LAPSED plus Vignan, which is counted under WRONG INSTITUTION. JAIN reaches five years on 06-12-2026.
- **Mirrors.** lib/data.ts, data-slim and fees-hub-data agree on every graded record. The only gap is that assam-down-town-university-online has no fees-hub-data record. So every site-side error is in lib/data.ts and was copied faithfully. The snapshot is the only file that disagrees, for Vignan in the same wrong direction as the site, and for Jaypee in the opposite direction.

## Findings that need action

### WRONG INSTITUTION (4)

- **vignan-university-online.** The site everywhere and the snapshot say A++, validTill 2031-06-16. That is SRM Institute of Science and Technology, r367 (A++, cycle 4, CGPA 3.58, declared 16-06-2024; 16-06-2024 + 7 years = 2031-06-16). Vignan's own row is r16: **A+, cycle 2, CGPA 3.49, declared 26-10-2021**. It is also five years old (see Q37).
- **srm-institute-science-technology-online.** The site's A++ is correct (r367). The snapshot validTill 2029-08-16 is Karunya's declaration date, r380 (16-08-2022), plus 7 years. Supabase's SRM row holds Karunya's values (A++, 3.53, cycle 2).
- **jaypee-university-online.** The site's A is correct for JIIT Noida, r472 (A, cycle 2, 3.10, 24-01-2023). The snapshot's A+, validTill 2031-04-25, is Jaypee University of Information Technology, Waknaghat, r119 (A+, cycle 3, 3.40, 25-04-2024). `components/ProgrammeComparisonTable.tsx` prints the snapshot grade, so the comparison table shows A+ for JIIT today.
- **iiit-bangalore-online.** The record's name, city, description and DEB state are IIIT Hyderabad (r407: A++, cycle 3, 3.51, 19-05-2023); see FIX-LOG line 1812. On 13 Nov (2aabe17) the grade was changed from A++ to A+ with the comment "CGPA 3.37, valid to 20 Dec 2026". Those are IIIT Bangalore's values (r185: A+, cycle 2, 3.37, 21-12-2021), and NAAC prints no "valid to" date. The grade and the institution do not belong together. This is Q44.

### WRONG GRADE (1)

- **sharda-university-online.** The site says A+. NAAC r467 prints **grade A** with **CGPA 3.27**, and 3.27 falls in the A+ band (3.26 to 3.50). It is the only one of the 497 rows whose grade and CGPA disagree. On 10 May, 65a054c changed `data/naac-official-2025.tsv` to A+ and cited NAAC's "previous-assessment view", which I could not open. The list as published says A. This is Q45. No change until it is answered.

### NOT LISTED (9)

The site states a grade, but the 14-08-2025 list and SC 220-265 have no row for the institution.

- **amity-university-online (A+).** The list has no row for Amity University Uttar Pradesh. The only Amity rows are Haryana r131 (A), Madhya Pradesh r263 (B++) and Rajasthan r345 (A+). The snapshot's A+, validTill 2027-12-31, comes from a hand-entered Supabase row ("A+", score "Cycle 3") that the NAAC sync never matched. This is Q43.
- **kl-university-online (A++).** There is no Koneru Lakshmaiah Education Foundation row.
- **bharathidasan-university-online (A+).** There is no row.
- **savitribai-phule-pune-university-online (A++).** There is no university row. SPPU appears only as the affiliating university of colleges.
- **srm-university-sikkim-online (A+).** There is no row. The SRM rows are SRM IST r367 and SRM University Haryana r135, and neither is this institution.
- **alvas-college-online (A+).** There is no row in either sheet. Alva's Institute of Engineering and Technology (Colleges sheet, A+) is a different institution.
- **op-jindal-global-university-online (A).** There is no row. r55 is O.P. Jindal University, Raigarh, Chhattisgarh (A), a different institution.
- **bharath-university-online (A+).** There is no row.
- **maharshi-dayanand-university-online (A+).** There is no row. mdu.ac.in says "'A+' Grade University Accredited by NAAC" with no cycle or date.

### POSSIBLY LAPSED (18)

These records were declared before 19-11-2021, and no newer cycle appears in the list or in SC 220-265. All were still on the 14-08-2025 list, including the four declared in 2019, so NAAC was treating them as valid then. For the six marked with *, the snapshot validTill is already past or passes this month.

- upes-online: 01-03-2021
- amrita-vishwa-vidyapeetham-online: 17-08-2021
- manipal-university-jaipur-online: 14-02-2020
- chitkara-university-online: 07-09-2021
- chandigarh-university-online*: 09-09-2019. Its snapshot validTill passed on 2026-09-09, so the site already prints "cycle on record ended".
- university-of-mysore-online: 20-09-2021
- vit-university-online: 31-08-2021
- amet-university-online: 13-09-2021
- bs-abdur-rahman-university-online: 08-02-2021
- sri-ramachandra-university-online: 25-01-2021
- shiv-nadar-university-online*: 26-11-2019. validTill is 2026-11-26.
- devi-ahilya-vishwavidyalaya-online*: 26-11-2019. validTill is 2026-11-26.
- madurai-kamaraj-university-online: 16-03-2021
- university-of-mumbai-online: 31-08-2021
- shivaji-university-online: 31-03-2021
- banasthali-vidyapith-online*: 11-03-2020. validTill is 2027-03-11.
- dayalbagh-educational-institute-online*: 09-08-2019. Its snapshot validTill passed on 2026-08-09.
- ignou-online: 08-01-2021

### Multi-campus checks (all resolved to the right row)

- **Amity.** The online record is Noida (Uttar Pradesh): NOT LISTED. Haryana, MP and Rajasthan are separate rows.
- **Manipal.** MUJ is r328 (A+, cycle 1). MAHE is r169 (A++, cycle 3). SMU is r353 (A+, cycle 1). All three match the site.
- **DY Patil.**
  - dr-dy-patil-vidyapeeth-online is DPU Pune, r229 (A++, cycle 3, 08-02-2022).
  - dy-patil-university-online is the Navi Mumbai deemed university, r230 (A++, cycle 3, 09-11-2022).
  - Kolhapur is r231.
  - ajeenkya-dy-patil-university-online is r249 (A, cycle 1). The site shows no grade for it.
- **Jain vs ARKA JAIN.** JAIN (Deemed) is r204 (A++). ARKA JAIN is r153 (A). Both match.
- **SRM.** IST is r367. Sikkim has no row. Haryana r135 is not on the site.
- **Symbiosis.** SSODL sits under Symbiosis International (Deemed University), r228 (A++, cycle 3, 20-12-2022). This matches.
- **Bharati Vidyapeeth.** The Pune deemed university is r226 (A++, cycle 4, 08-11-2024). This matches.
- **Birla.** BITS Pilani is r315 (A++, cycle 4) and BIT Mesra is r149 (A, cycle 2). Both match.
- **Shobhit.** The record is Shobhit Institute of Engineering and Technology, Meerut, r475 (A). Shobhit University, Gangoh, is a different institution.
- **Ambedkar.** Telangana BRAOU is r410 and Gujarat BAOU is r93; they are distinct. The site grades BAOU only (A++, matches).

## Cause of the Vignan to SRM mismatch

**The id map is not the cause.** `scripts/lib/supabase-uni-map.mjs` maps `vignan-university-online` to `vignans-foundation-for-science-technology-and-research-online`, and that is Vignan's correct Supabase row. The wrong values were written into that Supabase row earlier, by `scripts/sync-naac-from-official.js` (run 10 May; its notes say "Synced from official NAAC IIQA list 2026-05-10"). The 4 Nov pass and the 28 Sep `--refresh-naac` snapshot then copied them faithfully.

How the sync went wrong:

1. **It matches on names, not on AISHE code.** For each Supabase university it scores every row of `data/naac-official-2025.tsv` with `matchScore()`. The score counts shared tokens of 4 or more letters, minus 0.6 for each NAAC-name token that is missing. It drops a stopword list (university, institute, research, ...). That list does not include "science", "sciences" or "technology".
2. **The TSV is a 143-row hand-picked subset of the 497-row list.** Vignan was not in it, nor were Amity UP, KL, SPPU or about 15 others. The script still accepts any score of 1 or more. So an institution missing from the subset gets its nearest-sounding neighbour instead of "unmatched".
3. **Vignan.** "Vignan's Foundation for Science, Technology and Research" plus its slug leaves the tokens {vignan, vignans, foundation, science, technology}. "SRM INSTITUTE OF SCIENCE AND TECHNOLOGY" leaves {science, technology}, because "srm" is under 4 letters. Score 2, with no penalty. So Vignan received SRM's A++ / 3.58 / cycle 4 / 16-06-2024.
4. **SRM.** "S.R.M. Institute of **Sciences** and Technology" gives {sciences, technology}. SRM's own row has "science", so it scores 1 - 0.6 = 0.4. "KARUNYA INSTITUTE OF TECHNOLOGY AND **SCIENCES**" scores 2 - 0.6 = 1.4 and wins. So SRM received Karunya's values (A++, 3.53, cycle 2, 16-08-2022).
5. **JIIT.** "Jaypee Institute of Information Technology" scores 3 against both JUIT (TSV row 118) and JIIT (row 471). Ties keep the first row (strict `>`), so JIIT received JUIT's A+ / 3.40 / cycle 3.
6. **valid_till.** The script writes valid_till as the declaration date plus 7 years. NAAC prints no such date. So every validTill in naac-verified.json is derived, and three of them were derived from the wrong institution.
7. **Reproduced.** I re-implemented `matchScore()` and ran it on the committed TSV and the Supabase names in the May export. It reproduces the Supabase values for all 105 matched rows exactly, including these three mis-pairs. No other row is mis-paired. The TSV itself agrees with the xlsx on all 143 rows except Sharda (A to A+, edited on purpose).

### Other suspect mappings

- **The sync's own `SUPA_TO_SITE_SLUG` (in sync-naac-from-official.js) has three wrong pairs:**
  - `amity-university-rajasthan-online` maps to `amity-university-online` (Noida).
  - `birla-institute-of-technology-online` (BIT Mesra) maps to `bits-pilani-online`, which is not a lib/data.ts id.
  - `international-institute-of-information-technology-online` (a Telangana row) maps to `iiit-bangalore-online`.

  These only add matching tokens and did not change any outcome this time, but they encode the wrong institution.
- **`ABSENT` in supabase-uni-map.mjs is stale for three ids** that the May export shows are present in Supabase:
  - `sgt-university-online` (shree-guru-gobind-singh-tricentenary-university-online)
  - `sastra-university-online` (shanmugha-arts-science-technology-research-academy-online)
  - `vels-university-online` (vels-institute-of-science-technology-advanced-studies-vistas-online)

  The effect is missing snapshot entries, not wrong ones.
- **About 15 ids resolve to nothing because they have no OVERRIDES entry.** Examples: dy-patil-university-online (Supabase `dy-patil-navi-mumbai-online`), kalinga-institute-industrial-technology-online, guru-gobind-singh-indraprastha-university-online, iift-online, chhatrapati-shahu-ji-maharaj-university-online and datta-meghe-university-online. They have no snapshot entry, which is harmless.
- **`amity-university-online` resolves by identical slug** to a Supabase row the NAAC sync never touched, so its A+ and 2027-12-31 have no NAAC source.
- **`ignou-online` points to a slug** that is not in the May export.

## Fix list

The values are exact. Line numbers are at origin/main 1ed2ea6. "Approvals" means the `'NAAC X'` badge in the same record. `scripts/check-naac-consistency.mts` requires the tagline and description strings to follow the `naac` field.

| id | lib/data.ts | data-slim.ts | fees-hub-data.json | naac-verified.json | Status |
|---|---|---|---|---|---|
| vignan-university-online | `naac: 'A+'` (:2354), approvals `'NAAC A+'` (:2356), A++ to A+ in tagline/description (:2365, :2366) | `naac:'A+'` and approvals (:54) | `"naac": "A+"` (:419) | `{"grade":"A+","validTill":null}` (:69) | Do now (Q36 already resolved). The blog and JSON copies are listed in the Vignan verify sheet. |
| srm-institute-science-technology-online | no change (A++) | no change | no change | `{"grade":"A++","validTill":null}` (:265) | Do now |
| jaypee-university-online | no change (A); replace the ":5943 recheck on naac.gov.in" comment with "NAAC list 14-08-2025 r472" | no change | no change | `{"grade":"A","validTill":null}` (:225) | Do now (fixes the comparison table) |
| iiit-bangalore-online | If the record is IIIT Hyderabad: `naac: 'A++'` (:8469), approvals `'NAAC A++'` (:8471), description "NAAC A++ accredited" (:8481), and drop the "valid to 20 Dec 2026" comment. If it is IIIT Bangalore: keep A+, and name, city and state must change instead. | same as lib/data.ts (:145) | same (:2151) | no entry; leave it | Q44 |
| sharda-university-online | hold (A+) | hold | hold | hold | Q45 |
| amity-university-online | remove grade: `naac: ''` (:568), drop `'NAAC A+'` (:570), drop the grade from :581 | `naac: ''` and approvals (:34) | `"naac": ""` (:28) | delete the entry (:9) | Q43 |
| kl-university-online | remove grade (:2705, :2707, :2717, :2718) | (:58) | (:500) | none | Q42 |
| bharathidasan-university-online | remove grade (:3261, :3263, :3272, :3273) | (:63) | (:612) | none | Q42 |
| savitribai-phule-pune-university-online | remove grade (:5992, :5994, :6004, :6017) | (:101) | (:1364) | none | Q42 |
| srm-university-sikkim-online | remove grade (:6064, :6066, :6075, :6076, and the NAAC strings at :6098, :6120, :6141, :6156) | (:102) | (:1382) | none | Q42 |
| alvas-college-online | remove grade (:6565, :6567, :6576, :6577) | (:111) | (:1544) | none | Q42 |
| op-jindal-global-university-online | remove grade (:7861, :7864, :7873) | (:159) | (:2435) | none | Q42 |
| bharath-university-online | remove grade (:8627, :8629, :8639) | (:148) | (:2206) | none | Q42 |
| maharshi-dayanand-university-online | remove grade (:8964, :8966, :8976, :9013) | (:152) | (:2289) | none | Q42 |
| 18 POSSIBLY LAPSED ids (+ Vignan) | no grade change | no change | no change | see Q46 | Q47 |
| 87 snapshot entries with a validTill | no change | no change | no change | `"validTill": null` for all 87, or keep as an internal lapse estimate that is never printed as a date | Q46 |

**Upstream (no site file).**

- Supabase: Vignan should be A+ / 3.49 / cycle 2. SRM should be A++ / 3.58 / cycle 4. JIIT should be A / 3.10 / cycle 2.
- `sync-naac-from-official.js`: match on AISHE code, load the full 497-row xlsx instead of the subset TSV, and stop deriving valid_till.

Supabase writes are outside this audit (Q48).

## Proposed questions for Rishi (from Q42)

| # | Item | Question | What's pre-filled | What stays as-is until answered |
|---|---|---|---|---|
| Q42 | NAAC audit: 8 NOT LISTED | NAAC's valid-accreditation list (as on 14-08-2025) and Standing Committee results 220-265 have no row for KL University (we show A++), Bharathidasan (A+), SPPU (A++), SRM Sikkim (A+), Alva's College (A+), O.P. Jindal Global (A), Bharath Institute (A+) or MDU Rohtak (A+). MDU's own homepage says A+ but gives no date. Remove the grade ("No grade on record") until a certificate or a NAAC row is found? | Fix list in audits/naac-audit-2026-11-19.md (exact lines per file). Example: https://edifyedu.in/universities/kl-university-online shows NAAC A++ | grades shown as today |
| Q43 | NAAC audit: Amity | The NAAC list has no row for Amity University Uttar Pradesh (Noida). It has Amity Haryana A, Madhya Pradesh B++ and Rajasthan A+ only. Our A+ and "valid to 2027-12-31" come from a hand-entered Supabase row with no NAAC source, and amity.edu names no grade. Remove the grade, or do you hold an Amity Noida NAAC certificate we can cite? | Site shows NAAC A+ (https://edifyedu.in/universities/amity-university-online). NAAC xlsx Universities rows 131, 263 and 345 | A+ stays |
| Q44 | NAAC audit: IIIT record | iiit-bangalore-online describes IIIT Hyderabad (name, city, DEB state Telangana), and NAAC lists IIIT Hyderabad at A++ (cycle 3, 3.51, 19-05-2023). On 13 Nov its grade was set to A+ "CGPA 3.37, valid to 20 Dec 2026". Those are IIIT Bangalore's figures (A+, cycle 2, 3.37, 21-12-2021), and NAAC prints no end date. Which institute is this record: Hyderabad (set A++) or Bangalore (keep A+ and fix name and city)? | Site shows NAAC A+ (https://edifyedu.in/universities/iiit-bangalore-online). NAAC xlsx rows 407 and 185. FIX-LOG line 1812 | A+ stays |
| Q45 | NAAC audit: Sharda | NAAC's list prints Sharda as grade A with CGPA 3.27 (cycle 2, 17-01-2023). By NAAC's own bands 3.27 is A+. On 10 May we switched to A+ citing NAAC's previous-assessment view. Keep A+ (CGPA band), or show A as the list prints it? | Site shows NAAC A+ (https://edifyedu.in/universities/sharda-university-online). NAAC xlsx row 467 | A+ stays |
| Q46 | NAAC audit: validity dates | NAAC prints no end date for any university. All 87 validTill values in data/naac-verified.json are the declaration date + 7 years (our script), and 3 were computed from the wrong university. The site prints them as "cycle on record ended" (Chandigarh, Dayalbagh now; Devi Ahilya and Shiv Nadar from 26 Nov). One answer for Q8, Q10, Q15, Q18 and Q20: set every validTill to null and show the declaration date only, or keep the +7-year date as an internal flag that is never printed? | Fix list in audits/naac-audit-2026-11-19.md | dates and "cycle on record ended" notes stay |
| Q47 | NAAC audit: 19 five-year-old cycles | 19 graded universities were declared more than five years ago with no newer NAAC cycle found up to the 265th Standing Committee (12-12-2025): Vignan, UPES, Amrita, MUJ, Chitkara, Chandigarh, Mysore, VIT, AMET, Crescent, Sri Ramachandra, Shiv Nadar, DAVV, Madurai Kamaraj, Mumbai, Shivaji, Banasthali, Dayalbagh and IGNOU. JAIN joins on 6 Dec. All were on NAAC's 14-08-2025 valid list. One rule for all, as for Q37: grade with the declaration year, or a warning callout? | List in audits/naac-audit-2026-11-19.md (POSSIBLY LAPSED) | grades shown without validity or warning |
| Q48 | NAAC audit: Supabase rows | Supabase holds wrong NAAC values for 3 universities: Vignan has SRM's, SRM has Karunya's, JIIT has JUIT's. A rerun of `--refresh-naac` would bring them back. Can you correct those 3 rows (or allow a Supabase write), and is the sync script to be switched to AISHE-code matching before it runs again? | Correct values: Vignan A+ 3.49 c2; SRM A++ 3.58 c4; JIIT A 3.10 c2 (NAAC xlsx rows 16, 367 and 472) | snapshot fixed by hand; Supabase unchanged |

## All 143 records

Key: rN is the Excel row in the Universities sheet of the 14-08-2025 xlsx (Sl No = N - 1). The cycle is cN. "same" means data-slim and fees-hub-data equal the lib/data.ts grade.

| # | id | Site grade: lib/data.ts (line) | data-slim / fees-hub | naac-verified.json grade / validTill | NAAC row: Excel row (Sl No), AISHE, name | NAAC grade / cycle / CGPA / declared | Class | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | jain-university-online | A++ (403) | same | A++ / null | r204 (Sl 203), U-0223, JAIN(Deemed-to- be University) | A++ / c2 / 3.71 / 06-12-2021 | MATCH | JAIN (Deemed-to-be University) r204, not ARKA JAIN r153. Grade matches; no validTill claimed. Cycle 2 reaches five years on 06-12-2026 (Q12). |
| 2 | amity-university-online | A+ (568) | same | A+ / 2027-12-31 | none | n/a | NOT LISTED | Amity University Uttar Pradesh (Noida) has no row. Only Amity Haryana r131 (A), Madhya Pradesh r263 (B++), Rajasthan r345 (A+). Snapshot A+/2027-12-31 comes from a hand-entered Supabase row the NAAC sync could not match. amity.edu homepage names no NAAC grade. |
| 3 | lovely-professional-university-online | A++ (695) | same | A++ / 2030-08-12 | r301 (Sl 300), U-0379, LOVELY PROFESSIONAL UNIVERSITY | A++ / c1 / 3.68 / 12-08-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 4 | dayananda-sagar-university-online | A+ (839) | same | A+ / null | r191 (Sl 190), U-0856, DAYANANDA SAGAR UNIVERSITY | A+ / c1 / 3.31 / 21-03-2024 | MATCH | Grade matches; no validTill claimed. |
| 5 | dy-patil-university-online | A++ (926) | same | no entry | r230 (Sl 229), U-0321, D. Y. Patil Deemed to be University | A++ / c3 / 3.59 / 09-11-2022 | MATCH | D. Y. Patil Deemed to be University, Nerul, Navi Mumbai r230 (not DPU Pune r229, not Kolhapur r231). Grade matches; no snapshot entry. |
| 6 | upes-online | A (995) | same | A / 2028-03-01 | r483 (Sl 482), U-0564, UNIVERSITY OF PETROLEUM AND ENERGY STUDIES | A / c2 / 3.02 / 01-03-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 7 | parul-university-online | A++ (1082) | same | A++ / 2030-02-20 | r98 (Sl 97), U-0763, PARUL UNIVERSITY | A++ / c1 / 3.55 / 20-02-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 8 | amrita-vishwa-vidyapeetham-online | A++ (1221) | same | A++ / 2028-08-17 | r372 (Sl 371), U-0436, AMRITA VISHWA VIDYAPEETHAM | A++ / c3 / 3.7 / 17-08-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 9 | mangalayatan-university-online | A+ (1314) | same | A+ / 2030-03-30 | r451 (Sl 450), U-0528, MANGALAYATAN UNIVERSITY | A+ / c1 / 3.34 / 30-03-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 10 | shoolini-university-online | A+ (1418) | same | A+ / 2031-11-21 | r125 (Sl 124), U-0190, SHOOLINI UNIVERSITY OF BIOTECHNOLOGY AND MANAGEMENT SCIENCES | A+ / c2 / 3.3 / 21-11-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 11 | manipal-university-jaipur-online | A+ (1615) | same | A+ / 2027-02-14 | r328 (Sl 327), U-0749, MANIPAL UNIVERSITY JAIPUR | A+ / c1 / 3.28 / 14-02-2020 | POSSIBLY LAPSED | MUJ r328 (MAHE is r169, SMU r353). Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 12 | galgotias-university-online | A+ (1758) | same | A+ / 2029-08-16 | r450 (Sl 449), U-0643, GALGOTIAS UNIVERSITY | A+ / c1 / 3.37 / 16-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 13 | sikkim-manipal-university-online | A+ (1853) | same | A+ / 2029-08-23 | r353 (Sl 352), U-0431, SIKKIM MANIPAL UNIVERSITY | A+ / c1 / 3.28 / 23-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 14 | symbiosis-university-online | A++ (1981) | same | A++ / 2029-12-20 | r228 (Sl 227), U-0329, SYMBIOSIS INTERNATIONAL (DEEMED UNIVERSITY) | A++ / c3 / 3.56 / 20-12-2022 | UNVERIFIED VALIDITY | Symbiosis International (Deemed University) r228; SSODL is part of it. Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 15 | chitkara-university-online | A+ (2101) | same | A+ / 2028-09-07 | r305 (Sl 304), U-0373, CHITKARA UNIVERSITY | A+ / c1 / 3.26 / 07-09-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 16 | yenepoya-university-online | A+ (2150) | same | A+ / 2029-08-10 | r195 (Sl 194), U-0250, Yenepoya (Deemed to be University) | A+ / c2 / 3.47 / 10-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 17 | sharda-university-online | A+ (2258) | same | A+ / 2030-01-17 | r467 (Sl 466), U-0541, SHARDA UNIVERSITY | A / c2 / 3.27 / 17-01-2023 | WRONG GRADE | NAAC row prints grade A with CGPA 3.27, which is the A+ band (3.26-3.50). Only row in the 498 whose grade and CGPA disagree. data/naac-official-2025.tsv was hand-edited to A+ on 10 May (65a054c) citing the NAAC portal. Site A+ may be right; the list says A. Hold for Rishi. |
| 18 | vignan-university-online | A++ (2354) | same | A++ / 2031-06-16 | r16 (Sl 15), U-0043, VIGNAN'S FOUNDATION FOR SCIENCE TECHNOLOGY AND RESEARCH | A+ / c2 / 3.49 / 26-10-2021 | WRONG INSTITUTION | Site and snapshot carry SRM IST r367 (A++, c4, 3.58, 16-06-2024; validTill 2031-06-16 = that date + 7y). Vignan r16 is A+ c2 3.49. Also declared >5y ago (Q37). |
| 19 | manonmaniam-sundaranar-university-online | A+ (2415) | same | A+ / 2032-06-20 | r365 (Sl 364), U-0464, MANONMANIAM SUNDARANAR UNIVERSITY | A+ / c4 / 3.46 / 20-06-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 20 | nmims-online | A++ (2537) | same | A++ / 2032-06-28 | r232 (Sl 231), U-0319, SVKM'S NARSEE MONJEE INSTITUTE OF MANAGEMENT STUDIES | A++ / c4 / 3.67 / 28-06-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 21 | manipal-academy-higher-education-online | A++ (2613) | same | A++ / 2029-05-31 | r169 (Sl 168), U-0234, MANIPAL ACADEMY OF HIGHER EDUCATION (DEEMED-TO-BE-UNIVERSITY U/S 3 OF THE UGC ACT) | A++ / c3 / 3.65 / 31-05-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 22 | kl-university-online | A++ (2705) | same | no entry | none | n/a | NOT LISTED | No Koneru Lakshmaiah row in the list or in SC 220-265. kluniversity.in home and accreditations pages name no NAAC grade. |
| 23 | chandigarh-university-online | A+ (2796) | same | A+ / 2026-09-09 | r303 (Sl 302), U-0747, CHANDIGARH UNIVERSITY | A+ / c1 / 3.28 / 09-09-2019 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. Snapshot validTill already past, so the site prints "cycle on record ended" (naacCell). |
| 24 | vtu-online | B+ (2906) | same | B+ / 2029-03-29 | r181 (Sl 180), U-0249, VISVESVARAYA TECHNOLOGICAL UNIVERSITY | B+ / c1 / 2.73 / 29-03-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 25 | integral-university-online | A+ (2979) | same | A+ / 2030-05-19 | r461 (Sl 460), U-0519, INTEGRAL UNIVERSITY | A+ / c2 / 3.4 / 19-05-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 26 | manav-rachna-online | A++ (3069) | same | A++ / 2030-02-20 | r144 (Sl 143), U-0169, Manav Rachna International Institute of Research and Studies | A++ / c2 / 3.53 / 20-02-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 27 | karnataka-state-open-university-online | A+ (3170) | same | A+ / 2030-05-19 | r186 (Sl 185), U-0228, KARNATAKA STATE OPEN UNIVERSITY | A+ / c1 / 3.31 / 19-05-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 28 | bharathidasan-university-online | A+ (3261) | same | no entry | none | n/a | NOT LISTED | No Bharathidasan University row in the list or SC 220-265. bdu.ac.in could not be read (certificate error). |
| 29 | hindustan-institute-technology-online | A+ (3321) | same | A+ / 2030-10-06 | r394 (Sl 393), U-0454, HINDUSTAN INSTITUTE OF TECHNOLOGY AND SCIENCE | A+ / c2 / 3.48 / 06-10-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 30 | guru-ghasidas-vishwavidyalaya-online | A++ (3373) | same | A++ / 2031-04-25 | r51 (Sl 50), U-0085, GURU GHASIDAS VISHWAVIDYALAYA, BILASPUR | A++ / c2 / 3.62 / 25-04-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 31 | dr-babasaheb-ambedkar-open-university-online | A++ (3456) | same | A++ / 2029-07-26 | r93 (Sl 92), U-0131, DR. BABASAHEB AMBEDKAR OPEN UNIVERSITY | A++ / c1 / 3.55 / 26-07-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 32 | marwadi-university-online | A+ (3549) | same | A+ / 2030-11-09 | r99 (Sl 98), U-0825, MARWADI UNIVERSITY | A+ / c1 / 3.31 / 09-11-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 33 | pp-savani-university-online | A+ (3653) | same | A+ / null | r107 (Sl 106), U-0873, P. P. SAVANI UNIVERSITY | A+ / c1 / 3.38 / 20-03-2025 | MATCH | Grade matches; no validTill claimed. |
| 34 | university-of-mysore-online | A (3734) | same | A / 2028-09-20 | r162 (Sl 161), U-0235, UNIVERSITY OF MYSORE | A / c4 / 3.01 / 20-09-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 35 | aligarh-muslim-university-online | A+ (3829) | same | A+ / 2029-05-10 | r462 (Sl 461), U-0496, ALIGARH MUSLIM UNIVERSITY | A+ / c2 / 3.35 / 10-05-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 36 | gujarat-university-online | A+ (3898) | same | A+ / 2032-02-06 | r86 (Sl 85), U-0136, GUJARAT UNIVERSITY | A+ / c3 / 3.3 / 06-02-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 37 | charusat-university-online | A+ (3977) | same | A+ / 2029-07-12 | r101 (Sl 100), U-0128, CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY | A+ / c2 / 3.26 / 12-07-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 38 | gls-university-online | A+ (4050) | same | A+ / null | r108 (Sl 107), U-0775, GLS UNIVERSITY | A+ / c1 / 3.44 / 30-01-2025 | MATCH | Grade matches; no validTill claimed. |
| 39 | maharishi-markandeshwar-university-online | A++ (4129) | same | A++ / 2028-12-21 | r142 (Sl 141), U-0168, MAHARISHI MARKANDESHWAR (DEEMED TO BE UNIVERSITY), MULLANA-AMBALA | A++ / c2 / 3.53 / 21-12-2021 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 40 | mizoram-university-online | A+ (4222) | same | A+ / 2032-06-28 | r273 (Sl 272), U-0345, MIZORAM UNIVERSITY | A+ / c3 / 3.3 / 28-06-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 41 | vivekananda-global-university-online | A+ (4263) | same | A+ / 2029-08-16 | r338 (Sl 337), U-0748, VIVEKANANDA GLOBAL UNIVERSITY JAIPUR | A+ / c1 / 3.29 / 16-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 42 | dr-mgr-educational-research-institute-online | A+ (4355) | same | no entry | r369 (Sl 368), U-0461, DR. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE | A+ / c3 / 3.48 / 02-08-2022 | MATCH | Grade matches; no snapshot entry. |
| 43 | uttaranchal-university-online | A+ (4456) | same | A+ / 2029-01-11 | r423 (Sl 422), U-0750, UTTARANCHAL UNIVERSITY | A+ / c1 / 3.3 / 11-01-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 44 | andhra-university-online | A++ (4546) | same | A++ / 2030-11-09 | r3 (Sl 2), U-0006, ANDHRA UNIVERSITY | A++ / c4 / 3.74 / 09-11-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 45 | sgt-university-online | A+ (4599) | same | no entry | r130 (Sl 129), U-0702, SHREE GURU GOBIND SINGH TRICENTENARY UNIVERSITY | A+ / c1 / 3.33 / 12-10-2023 | MATCH | Grade matches; no snapshot entry. |
| 46 | central-university-himachal-pradesh-online | A+ (4677) | same | no entry | r126 (Sl 125), U-0178, Central University of Himachal Pradesh | A+ / c2 / 3.42 / 19-07-2023 | MATCH | Grade matches; no snapshot entry. |
| 47 | mahatma-gandhi-university-online | A++ (4716) | same | A++ / 2031-03-14 | r208 (Sl 207), U-0262, MAHATMA GANDHI UNIVERSITY | A++ / c4 / 3.61 / 14-03-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 48 | vit-university-online | A++ (4758) | same | A++ / 2028-08-31 | r364 (Sl 363), U-0490, VELLORE INSTITUTE OF TECHNOLOGY | A++ / c4 / 3.66 / 31-08-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 49 | karunya-university-online | A++ (4821) | same | A++ / 2029-08-16 | r380 (Sl 379), U-0460, KARUNYA INSTITUTE OF TECHNOLOGY AND SCIENCES | A++ / c2 / 3.53 / 16-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 50 | kurukshetra-university-online | A++ (4872) | same | A++ / 2030-09-22 | r127 (Sl 126), U-0164, KURUKSHETRA UNIVERSITY | A++ / c4 / 3.56 / 22-09-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 51 | sastra-university-online | A++ (4957) | same | no entry | r361 (Sl 360), U-0476, SHANMUGHA ARTS, SCIENCE, TECHNOLOGY AND RESEARCH ACADEMY (SASTRA) DEEMED-TO-BE-UNIVERSITY | A++ / c4 / 3.76 / 08-03-2022 | MATCH | Grade matches; no snapshot entry. |
| 52 | dr-dy-patil-vidyapeeth-online | A++ (5026) | same | A++ / 2029-02-08 | r229 (Sl 228), U-0301, DR. D. Y. PATIL VIDYAPEETH, PUNE | A++ / c3 / 3.64 / 08-02-2022 | UNVERIFIED VALIDITY | DPU Pune r229 (not Navi Mumbai r230). Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 53 | jamia-millia-islamia-online | A++ (5082) | same | A++ / 2028-12-14 | r67 (Sl 66), U-0108, JAMIA MILLIA ISLAMIA | A++ / c2 / 3.61 / 14-12-2021 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 54 | christ-university-online | A+ (5124) | same | A+ / 2029-10-26 | r199 (Sl 198), U-0217, CHRIST (Deemed to be University) | A+ / c2 / 3.42 / 26-10-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 55 | shobhit-university-online | A (5189) | same | no entry | r475 (Sl 474), U-0542, SHOBHIT INSTITUTE OF ENGINEERING AND TECHNOLOGY | A / c2 / 3.12 / 20-12-2022 | MATCH | Record is Shobhit Institute of Engineering and Technology, Meerut r475 (A). Shobhit University, Gangoh r482 is B++ in the list and SC 261 gave it A (3.02): a different institution. Grade matches; no snapshot entry. |
| 56 | bharati-vidyapeeth-university-online | A++ (5282) | same | A++ / 2031-11-08 | r226 (Sl 225), U-0292, BHARATI VIDYAPEETH (DEEMED TO BE UNIVERSITY), PUNE | A++ / c4 / 3.6 / 08-11-2024 | UNVERIFIED VALIDITY | Bharati Vidyapeeth (Deemed), Pune r226. Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 57 | assam-don-bosco-university-online | A (5368) | same | A / 2028-11-30 | r31 (Sl 30), U-0049, ASSAM DON BOSCO UNIVERSITY | A / c2 / 3.08 / 30-11-2021 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 58 | university-of-lucknow-online | A++ (5441) | same | A++ / 2029-07-26 | r430 (Sl 429), U-0524, UNIVERSITY OF LUCKNOW | A++ / c3 / 3.55 / 26-07-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 59 | jss-university-online | A++ (5517) | same | A++ / null | r184 (Sl 183), U-0222, JSS ACADEMY OF HIGHER EDUCATION & RESEARCH | A++ / c3 / 3.61 / 18-10-2024 | MATCH | Grade matches; no validTill claimed. |
| 60 | alliance-university-online | A+ (5596) | same | A+ / 2031-11-08 | r177 (Sl 176), U-0213, ALLIANCE UNIVERSITY | A+ / c1 / 3.26 / 08-11-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 61 | desh-bhagat-university-online | A+ (5662) | same | A+ / 2031-05-16 | r297 (Sl 296), U-0684, DESH BHAGAT UNIVERSITY | A+ / c1 / 3.27 / 16-05-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 62 | ganpat-university-online | A (5734) | same | A / 2031-02-07 | r83 (Sl 82), U-0132, GANPAT UNIVERSITY | A / c1 / 3.11 / 07-02-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 63 | amet-university-online | A (5797) | same | no entry | r388 (Sl 387), U-0434, ACADEMY OF MARITIME EDUCATION AND TRAINING (AMET) DEEMED TO BE UNIVERSITY | A / c2 / 3.13 / 13-09-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 64 | guru-nanak-dev-university-online | A++ (5858) | same | A++ / 2029-12-20 | r294 (Sl 293), U-0376, GURU NANAK DEV UNIVERSITY | A++ / c4 / 3.85 / 20-12-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 65 | jaypee-university-online | A (5943) | same | A+ / 2031-04-25 | r472 (Sl 471), U-0522, JAYPEE INSTITUTE OF INFORMATION TECHNOLOGY | A / c2 / 3.1 / 24-01-2023 | WRONG INSTITUTION | lib/data.ts A is right for JIIT Noida r472. Snapshot A+/2031-04-25 is Jaypee University of Information Technology, Waknaghat r119 (A+, c3, 3.40, 25-04-2024). ProgrammeComparisonTable prints the snapshot grade, so it shows A+ for JIIT. |
| 66 | savitribai-phule-pune-university-online | A++ (5992) | same | no entry | none | n/a | NOT LISTED | No SPPU university row (SPPU appears only as an affiliating university of colleges). unipune.ac.in homepage names no grade. |
| 67 | srm-university-sikkim-online | A+ (6064) | same | no entry | none | n/a | NOT LISTED | No SRM University Sikkim row. SRM rows are SRM IST r367 and SRM University Haryana r135 only; neither is this institution. |
| 68 | sathyabama-university-online | A++ (6167) | same | A++ / 2030-05-19 | r368 (Sl 367), U-0474, SATHYABAMA INSTITUTE OF SCIENCE AND TECHNOLOGY | A++ / c3 / 3.73 / 19-05-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 69 | anna-university-online | A++ (6218) | same | A++ / 2030-08-21 | r359 (Sl 358), U-0439, ANNA UNIVERSITY | A++ / c3 / 3.54 / 21-08-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 70 | vels-university-online | A++ (6257) | same | no entry | r387 (Sl 386), U-0491, VELS INSTITUTE OF SCIENCE, TECHNOLOGY AND ADVANCED STUDIES(VISTAS) | A++ / c2 / 3.52 / 30-10-2024 | MATCH | Grade matches; no snapshot entry. |
| 71 | northcap-university-online | A (6306) | same | A / 2029-08-02 | r146 (Sl 145), U-0163, THE NORTHCAP UNIVERSITY | A / c2 / 3.02 / 02-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 72 | noida-international-university-online | A+ (6378) | same | A+ / 2031-03-14 | r442 (Sl 441), U-0533, NOIDA INTERNATIONAL UNIVERSITY | A+ / c1 / 3.44 / 14-03-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 73 | iift-online | A+ (6442) | same | no entry | r60 (Sl 59), U-0102, INDIAN INSTITUTE OF FOREIGN TRADE | A+ / c3 / 3.27 / 15-12-2023 | MATCH | Grade matches; no snapshot entry. |
| 74 | gujarat-technological-university-online | A+ (6483) | same | A+ / 2030-02-14 | r97 (Sl 96), U-0135, GUJARAT TECHNOLOGICAL UNIVERSITY | A+ / c1 / 3.26 / 14-02-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 75 | bit-mesra-online | A (6525) | same | A / 2029-11-22 | r149 (Sl 148), U-0202, BIRLA INSTITUTE OF TECHNOLOGY | A / c2 / 3.17 / 22-11-2022 | UNVERIFIED VALIDITY | BIT Mesra r149 (not BITS Pilani r315). Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 76 | alvas-college-online | A+ (6565) | same | no entry | none | n/a | NOT LISTED | No Alva's College row in Universities or Colleges sheets. Alva's Institute of Engineering and Technology (Colleges sheet, A+, VTU-affiliated) is a different institution. |
| 77 | datta-meghe-university-online | A++ (6604) | same | no entry | r227 (Sl 226), U-0295, DATTA MEGHE INSTITUTE OF HIGHER EDUCATION AND RESEARCH (DEEMED TO BE UNIVERSITY) | A++ / c4 / 3.78 / 19-07-2023 | MATCH | Grade matches; no snapshot entry. |
| 78 | centurion-university-online | A+ (6658) | same | A+ / 2030-08-12 | r283 (Sl 282), U-0353, CENTURION UNIVERSITY OF TECHNOLOGY AND MANAGEMENT | A+ / c2 / 3.37 / 12-08-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 79 | guru-kashi-university-online | A++ (6709) | same | A++ / 2030-05-19 | r308 (Sl 307), U-0653, GURU KASHI UNIVERSITY | A++ / c1 / 3.57 / 19-05-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 80 | jaipur-national-university-online | A+ (6751) | same | A+ / 2031-04-25 | r340 (Sl 339), U-0401, JAIPUR NATIONAL UNIVERSITY | A+ / c2 / 3.3 / 25-04-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 81 | bs-abdur-rahman-university-online | A+ (6805) | same | no entry | r381 (Sl 380), U-0445, B. S. ABDUR RAHMAN CRESCENT INSTITUTE OF SCIENCE AND TECHNOLOGY | A+ / c2 / 3.33 / 08-02-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 82 | srm-institute-science-technology-online | A++ (6861) | same | A++ / 2029-08-16 | r367 (Sl 366), U-0473, SRM INSTITUTE OF SCIENCE AND TECHNOLOGY | A++ / c4 / 3.58 / 16-06-2024 | WRONG INSTITUTION | Grade A++ is right (r367), but snapshot validTill 2029-08-16 = Karunya r380 declaration 16-08-2022 + 7y. Supabase SRM row holds Karunya values (3.53, c2). |
| 83 | university-of-madras-online | A++ (6986) | same | A++ / 2030-08-21 | r358 (Sl 357), U-0462, UNIVERSITY OF MADRAS | A++ / c4 / 3.59 / 21-08-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 84 | kalasalingam-university-online | A++ (7026) | same | A++ / 2031-02-14 | r375 (Sl 374), U-0458, KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION | A++ / c3 / 3.51 / 14-02-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 85 | alagappa-university-online | A++ (7066) | same | A++ / 2032-02-13 | r366 (Sl 365), U-0435, ALAGAPPA UNIVERSITY | A++ / c4 / 3.59 / 13-02-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 86 | bharathiar-university-online | A++ (7104) | same | A++ / 2030-03-30 | r363 (Sl 362), U-0447, BHARATHIAR UNIVERSITY | A++ / c4 / 3.63 / 30-03-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 87 | sri-ramachandra-university-online | A++ (7142) | same | no entry | r373 (Sl 372), U-0478, SRI RAMACHANDRA INSTITUTE OF HIGHER EDUCATION AND RESEARCH (DEEMED TO BE UNIVERSITY U/S 3 OF THE UGC ACT 1956) | A++ / c3 / 3.53 / 25-01-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 88 | icfai-university-online | A++ (7183) | same | A++ / 2029-09-13 | r406 (Sl 405), U-0012, THE ICFAI FOUNDATION FOR HIGHER EDUCATION (DEEMED-TO-BE-UNIVERSITY) | A++ / c3 / 3.59 / 13-09-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 89 | shiv-nadar-university-online | A (7221) | same | A / 2026-11-26 | r444 (Sl 443), U-0642, SHIV NADAR UNIVERSITY | A / c1 / 3.06 / 26-11-2019 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. Snapshot validTill 2026-11-26 passes in 7 days; the grade then drops out of llms.txt and the comparison table. |
| 90 | gla-university-online | A+ (7263) | same | A+ / null | r477 (Sl 476), U-0513, GLA UNIVERSITY, MATHURA | A+ / c2 / 3.46 / 24-01-2023 | MATCH | Grade matches; no validTill claimed. |
| 91 | jagannath-university-online | A (7343) | same | A / null | r341 (Sl 340), U-0398, JAGAN NATH UNIVERSITY | A / c2 / 3.01 / 28-06-2022 | MATCH | Grade matches; no validTill claimed. |
| 92 | teerthanker-mahaveer-university-online | A (7382) | same | A / 2029-06-21 | r458 (Sl 457), U-0544, TEERTHANKER MAHAVEER UNIVERSITY | A / c2 / 3.15 / 21-06-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 93 | subharti-university-online | A (7420) | same | A / 2029-08-10 | r466 (Sl 465), U-0543, SWAMI VIVEKANAND SUBHARTI UNIVERSITY | A / c2 / 3.22 / 10-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 94 | arka-jain-university-online | A (7458) | same | A / 2031-02-22 | r153 (Sl 152), U-0920, ARKA JAIN UNIVERSITY | A / c1 / 3.15 / 22-02-2024 | UNVERIFIED VALIDITY | ARKA JAIN r153, not JAIN r204. Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 95 | jawaharlal-nehru-university-online | A++ (7499) | same | A++ / 2031-09-05 | r75 (Sl 74), U-0109, JAWAHARLAL NEHRU UNIVERSITY | A++ / c3 / 3.62 / 05-09-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 96 | jamia-hamdard-online | A+ (7541) | same | A+ / 2030-12-15 | r58 (Sl 57), U-0107, JAMIA HAMDARD (HAMDARD UNIVERSITY) | A+ / c4 / 3.41 / 15-12-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 97 | kalinga-institute-industrial-technology-online | A++ (7635) | same | no entry | r279 (Sl 278), U-0356, KALINGA INSTITUTE OF INDUSTRIAL TECHNOLOGY  DEEMED TO BE UNIVERSITY | A++ / c3 / 3.52 / 02-08-2022 | MATCH | Grade matches; no snapshot entry. |
| 98 | university-of-kerala-online | A++ (7705) | same | A++ / 2029-06-21 | r207 (Sl 206), U-0260, UNIVERSITY OF KERALA | A++ / c3 / 3.67 / 21-06-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 99 | bits-pilani-work-integrated-online | A++ (7802) | same | no entry | r315 (Sl 314), U-0391, BIRLA INSTITUTE OF TECHNOLOGY AND SCIENCE | A++ / c4 / 3.68 / 29-11-2024 | MATCH | Birla Institute of Technology and Science, Pilani r315 (not BIT Mesra r149). Grade matches; no snapshot entry. |
| 100 | op-jindal-global-university-online | A (7861) | same | no entry | none | n/a | NOT LISTED | O.P. Jindal Global University, Sonipat has no row. r55 is O.P. JINDAL UNIVERSITY, Raigarh, Chhattisgarh (A, c1, 3.14): a different institution. |
| 101 | graphic-era-university-online | A+ (7905) | same | A+ / 2029-08-23 | r427 (Sl 426), U-0555, GRAPHIC ERA DEEMED TO BE UNIVERSITY | A+ / c2 / 3.29 / 23-08-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 102 | devi-ahilya-vishwavidyalaya-online | A+ (7987) | same | A+ / 2026-11-26 | r254 (Sl 253), U-0270, DEVI AHILYA VISHWAVIDYALAYA | A+ / c4 / 3.3 / 26-11-2019 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. Snapshot validTill 2026-11-26 passes in 7 days; the grade then drops out of llms.txt and the comparison table. |
| 103 | madurai-kamaraj-university-online | A++ (8036) | same | A++ / 2028-03-16 | r356 (Sl 355), U-0463, MADURAI KAMARAJ UNIVERSITY | A++ / c4 / 3.54 / 16-03-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 104 | university-of-mumbai-online | A++ (8116) | same | A++ / 2028-08-31 | r217 (Sl 216), U-0318, UNIVERSITY OF MUMBAI | A++ / c3 / 3.65 / 31-08-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 105 | university-of-jammu-online | A++ (8156) | same | A++ / 2031-12-20 | r158 (Sl 157), U-0195, UNIVERSITY OF JAMMU | A++ / c4 / 3.72 / 20-12-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 106 | shivaji-university-online | A++ (8206) | same | A++ / 2028-03-31 | r223 (Sl 222), U-0325, SHIVAJI UNIVERSITY | A++ / c4 / 3.52 / 31-03-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 107 | banasthali-vidyapith-online | A++ (8255) | same | A++ / 2027-03-11 | r319 (Sl 318), U-0389, BANASTHALI VIDYAPITH | A++ / c3 / 3.63 / 11-03-2020 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 108 | guru-gobind-singh-indraprastha-university-online | A++ (8348) | same | no entry | r61 (Sl 60), U-0099, GURU GOBIND SINGH INDRAPRASTHA UNIVERSITY | A++ / c3 / 3.56 / 14-02-2023 | MATCH | Grade matches; no snapshot entry. |
| 109 | bangalore-university-online | A++ (8408) | same | A++ / 2030-06-10 | r166 (Sl 165), U-0215, BANGALORE UNIVERSITY | A++ / c4 / 3.75 / 10-06-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 110 | iiit-bangalore-online | A+ (8469) | same | no entry | r407 (Sl 406), U-0014, INTERNATIONAL INSTITUTE OF INFORMATION TECHNOLOGY, Hyderabad (matches the record name and city); r185 (Sl 184), U-0221, same name, Bangalore (matches the grade) | r407: A++ / c3 / 3.51 / 19-05-2023. r185: A+ / c2 / 3.37 / 21-12-2021 | WRONG INSTITUTION | Record name, city and description say IIIT Hyderabad (r407: A++, c3, 3.51, 19-05-2023). The naac A+ and its comment "CGPA 3.37, valid to 20 Dec 2026" (set 13 Nov, 2aabe17) are IIIT Bangalore r185 (A+, c2, 3.37, 21-12-2021). Grade and name belong to different institutes. |
| 111 | dayalbagh-educational-institute-online | A+ (8509) | same | A+ / 2026-08-09 | r439 (Sl 438), U-0507, DAYALBAGH EDUCATIONAL INSTITUTE | A+ / c3 / 3.4 / 09-08-2019 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. Snapshot validTill already past, so the site prints "cycle on record ended" (naacCell). |
| 112 | adichunchanagiri-university-online | A+ (8587) | same | A+ / 2031-08-23 | r201 (Sl 200), U-0971, ADICHUNCHANAGIRI UNIVERSITY | A+ / c1 / 3.39 / 23-08-2024 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 113 | bharath-university-online | A+ (8627) | same | no entry | none | n/a | NOT LISTED | No Bharath Institute of Higher Education and Research row in the list or SC 220-265. bharathuniv.ac.in lists NAAC as an accreditation without a grade. |
| 114 | chhatrapati-shahu-ji-maharaj-university-online | A++ (8687) | same | no entry | r440 (Sl 439), U-0505, CHHATRAPATI SHAHU JI MAHARAJ UNIVERSITY | A++ / c3 / 3.57 / 25-11-2023 | MATCH | Grade matches; no snapshot entry. |
| 115 | deen-dayal-upadhyay-gorakhpur-university-online | A++ (8788) | same | A++ / 2030-01-17 | r437 (Sl 436), U-0508, DEEN DAYAL UPADHYAYA GORAKHPUR UNIVERSITY, GORAKHPUR | A++ / c2 / 3.78 / 17-01-2023 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 116 | guru-jambheshwar-university-online | A+ (8895) | same | A+ / 2029-10-18 | r128 (Sl 127), U-0162, GURU JAMBHESHWAR UNIVERSITY OF SCIENCE AND TECHNOLOGY | A+ / c4 / 3.38 / 18-10-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 117 | maharshi-dayanand-university-online | A+ (8964) | same | no entry | none | n/a | NOT LISTED | No MDU Rohtak row in the list or SC 220-265. mdu.ac.in homepage says "'A+' Grade University Accredited by NAAC" with no cycle or date. |
| 118 | mahatma-jyotiba-phule-rohilkhand-university-online | A++ (9024) | same | A++ / null | r436 (Sl 435), U-0525, MAHATMA JYOTIBA PHULE ROHILKHAND UNIVERSITY,BAREILLY | A++ / c3 / 3.6 / 24-06-2023 | MATCH | Grade matches; no validTill claimed. |
| 119 | mats-university-online | A+ (9097) | same | A+ / null | r46 (Sl 45), U-0091, MATS UNIVERSITY | A+ / c2 / 3.3 / 30-01-2025 | MATCH | Grade matches; no validTill claimed. |
| 120 | meenakshi-academy-higher-education-online | A+ (9180) | same | no entry | r385 (Sl 384), U-0465, MEENAKSHI ACADEMY OF HIGHER EDUCATION AND RESEARCH | A+ / c2 / 3.5 / 23-11-2023 | MATCH | Grade matches; no snapshot entry. |
| 121 | mody-university-online | A+ (9240) | same | A+ / 2029-06-14 | r327 (Sl 326), U-0412, MODY UNIVERSITY OF SCIENCE AND TECHNOLOGY | A+ / c1 / 3.43 / 14-06-2022 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 122 | sage-university-online | A+ (9342) | same | A+ / null | r264 (Sl 263), U-0916, SAGE UNIVERSITY, INDORE | A+ / c1 / 3.41 / 19-12-2023 | MATCH | Grade matches; no validTill claimed. |
| 123 | assam-down-town-university-online | A+ (9424) | A+ / no record | A+ / 2032-05-09 | r27 (Sl 26), U-0683, ASSAM DOWN TOWN UNIVERSITY | A+ / c2 / 3.34 / 09-05-2025 | UNVERIFIED VALIDITY | Grade matches. validTill = declaration + 7 years (scripts/sync-naac-from-official.js); NAAC prints no end date. |
| 124 | ignou-online | A++ (9473) | same | no entry | r64 (Sl 63), U-0104, INDIRA GANDHI NATIONAL OPEN UNIVERSITY | A++ / c1 / 3.56 / 08-01-2021 | POSSIBLY LAPSED | Declared more than 5 years before 19-11-2026; no newer cycle in the list or SC 220-265 (last SC: 265th, 12-12-2025). Was still on the 14-08-2025 valid list. |
| 125 | choudhary-charan-singh-university-online | (none) (9572) | same | no entry | r431 (Sl 430), U-0506, Chaudhary Charan Singh University | A++ / c3 / 3.66 / 10-03-2023 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 126 | pt-sundarlal-sharma-open-university-online | (none) (9663) | same | no entry | r49 (Sl 48), U-0094, PANDIT SUNDARLAL SHARMA (OPEN) UNIVERSITY CHHATTISGARH | A+ / c1 / 3.28 / 21-04-2023 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 127 | university-of-calicut-online | (none) (9742) | same | no entry | r206 (Sl 205), U-0251, UNIVERSITY OF CALICUT | A+ / c4 / 3.45 / 21-09-2022 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 128 | dr-br-ambedkar-university-online | (none) (9811) | same | no entry | r438 (Sl 437), U-509, DR. BHIM RAO AMBEDKAR UNIVERSITY | A+ / c3 / 3.33 / 08-11-2024 | NO GRADE STATED | Record state Uttar Pradesh: Dr. Bhimrao Ambedkar University, Agra r438. |
| 129 | mohan-babu-university-online | (none) (9910) | same | no entry | none | n/a | NO GRADE STATED | Not in list. |
| 130 | sri-venkateswara-university-online | (none) (9989) | same | no entry | r4 (Sl 3), U-0037, SRI VENKATESWARA UNIVERSITY | A+ / c4 / 3.31 / 14-03-2023 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 131 | swami-rama-himalayan-university-online | (none) (10058) | same | no entry | r428 (Sl 427), U-0737, SWAMI RAMA HIMALAYAN UNIVERSITY | A+ / c1 / 3.27 / 18-10-2024 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 132 | central-university-tamil-nadu-online | (none) (10137) | same | no entry | r393 (Sl 392), U-0449, CENTRAL UNIVERSITY OF TAMIL NADU | A+ / c2 / 3.44 / 23-05-2024 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 133 | ajeenkya-dy-patil-university-online | (none) (10196) | same | no entry | r249 (Sl 248), U-0885, AJEENKYA D Y PATIL UNIVERSITY | A / c1 / 3.01 / 14-08-2025 | NO GRADE STATED | r249 (A, c1, 3.01, 14-08-2025). Not DPU Pune or Navi Mumbai. |
| 134 | dr-br-ambedkar-open-university-online | (none) (10265) | same | no entry | r410 (Sl 409), U-0007, DR. B R AMBEDKAR OPEN UNIVERSITY | A / c1 / 3.12 / 02-08-2023 | NO GRADE STATED | Telangana BRAOU r410. Not the Gujarat BAOU (r93). |
| 135 | silver-oak-university-online | (none) (10324) | same | no entry | r109 (Sl 108), U-1078, SILVER OAK UNIVERSITY | A / c1 / 3.18 / 06-06-2025 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 136 | srinivas-university-online | (none) (10413) | same | no entry | r187 (Sl 186), U-0935, SRINIVAS UNIVERSITY | A / c1 / 3.05 / 21-09-2024 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 137 | st-aloysius-university-online | (none) (10492) | same | no entry | none | n/a | NO GRADE STATED | No university row. St Aloysius College (Autonomous), Mangaluru is A++ c4 in the Colleges sheet (row 1826): the pre-university college, not the deemed university. |
| 138 | bennett-university-online | (none) (10551) | same | no entry | r469 (Sl 468), U-0890, BENNETT UNIVERSITY | A+ / c1 / 3.48 / 23-01-2025 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 139 | sandip-university-online | (none) (10600) | same | no entry | none | n/a | NO GRADE STATED | Not in the 14-08-2025 list. SC 260 (26-09-2025) Cycle 1: U-0877 SANDIP UNIVERSITY, NASHIK, 3.11, A. r44 is Sandip University, Sijoul, Bihar (B++), a different institution. |
| 140 | atlas-skilltech-university-online | (none) (10649) | same | no entry | r250 (Sl 249), U-1145, ATLAS SKILLTECH UNIVERSITY | A / c1 / 3.04 / 08-08-2025 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 141 | sri-siddhartha-academy-online | (none) (10698) | same | no entry | r194 (Sl 193), U-0242, SRI SIDDHARTHA ACADEMY OF HIGHER EDUCATION | A+ / c2 / 3.4 / 12-08-2023 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 142 | saveetha-university-online | (none) (10737) | same | no entry | r391 (Sl 390), U-0475, SAVEETHA INSTITUTE OF MEDICAL AND TECHNICAL SCIENCES | A++ / c2 / 3.66 / 28-06-2022 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
| 143 | bml-munjal-university-online | (none) (10776) | same | no entry | r138 (Sl 137), U-0735, BML MUNJAL UNIVERSITY | A / c1 / 3.2 / 21-03-2024 | NO GRADE STATED | Site states no grade; NAAC row given for reference only. |
