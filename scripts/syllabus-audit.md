# Syllabus Data Audit — EdifyEdu (v2, fixed delimiters)
_Generated: 2026-04-20_

## TL;DR — What actually renders on the site

| Component | Data source | Coverage |
|---|---|---|
| UniSpecBody (spec pages) | `MASTER_SYLLABUS` in content.ts | MBA: 57 unis, MCA: 60 unis |
| UniProgramBody (program pages) | `pd.syllabus` in data.ts | Only 7 combos |
| Both | xlsx (raw, not yet synced to code) | 30 FULL, 90 PARTIAL, 23 EMPTY |

## XLSX Audit Summary (is_general=TRUE rows)

| Status | Count | % | Meaning |
|---|---|---|---|
| FULL | 30 | 21% | All 4 sems ≥ min subjects |
| PARTIAL | 90 | 63% | Some sems present but thin |
| EMPTY | 23 | 16% | No sem data at all |
| **TOTAL** | **143** | 100% | |

## XLSX — Breakdown by Program

| Program | FULL | PARTIAL | EMPTY | Total | Min subj/sem |
|---|---|---|---|---|---|
| MBA | 3 | 5 | 3 | 11 | 4 |
| MCA | 10 | 22 | 3 | 35 | 4 |
| BBA | 3 | 25 | 5 | 33 | 5 |
| BCA | 2 | 12 | 4 | 18 | 5 |
| BCOM | 7 | 18 | 4 | 29 | 3 |
| MA | 2 | 0 | 0 | 2 | 3 |
| MCOM | 2 | 5 | 3 | 10 | 3 |
| BA | 1 | 1 | 1 | 3 | 3 |
| MSC | 0 | 2 | 0 | 2 | 3 |

## Priority MBA Universities

| University | Slug | xlsx status | Subj per sem (1/2/3/4) | MASTER_SYLLABUS |
|---|---|---|---|---|
| Amity | amity-university-online | FULL | 5/5/8/5 | ✓ YES |
| IGNOU | ignou-online | NOT IN XLSX | - | ✗ no |
| Manipal Jaipur | manipal-university-jaipur-online | PARTIAL | 6/6/1/2 | ✓ YES |
| LPU | lovely-professional-university-online | NOT IN XLSX | - | ✓ YES |
| NMIMS | nmims-online | NOT IN XLSX | - | ✓ YES |
| Jain | jain-university-online | FULL | 5/5/6/6 | ✓ YES |
| Sathyabama | sathyabama-university-online | NOT IN XLSX | - | ✗ no |
| VTU | vtu-online | NOT IN XLSX | - | ✗ no |
| DY Patil | dr-dy-patil-vidyapeeth-online | NOT IN XLSX | - | ✓ YES |
| Chandigarh | chandigarh-university-online | FULL | 6/5/8/5 | ✓ YES |
| Amrita | amrita-vishwa-vidyapeetham-online | EMPTY | 0/0/0/0 | ✓ YES |
| Shoolini | shoolini-university-online | NOT IN XLSX | - | ✓ YES |
| SMU | sikkim-manipal-university-online | PARTIAL | 6/6/1/3 | ✓ YES |
| UPES | upes-online | NOT IN XLSX | - | ✓ YES |
| Vignan | vignan-university-online | NOT IN XLSX | - | ✓ YES |
| DSU | dayananda-sagar-university-online | NOT IN XLSX | - | ✓ YES |
| Galgotias | galgotias-university-online | NOT IN XLSX | - | ✓ YES |
| NIU | noida-international-university-online | NOT IN XLSX | - | ✓ YES |
| JIIT | jaypee-university-online | NOT IN XLSX | - | ✓ YES |
| ARKA JAIN | arka-jain-university-online | NOT IN XLSX | - | ✓ YES |

## FULL rows (xlsx) — ready to sync

| Slug | Program | Subj per sem (1/2/3/4) |
|---|---|---|
| amity-university-online | MBA | 5/5/8/5 |
| amity-university-online | MCA | 5/4/5/6 |
| amrita-vishwa-vidyapeetham-online | MCA | 5/6/7/9 |
| bharathidasan-university-online | BBA | 6/5/5/5 |
| chandigarh-university-online | MBA | 6/5/8/5 |
| christ-university-online | MCA | 5/6/6/7 |
| dr-dy-patil-vidyapeeth-online | MCA | 6/6/6/4 |
| galgotias-university-online | BCA | 5/6/6/5 |
| gla-university-online | MCA | 10/10/13/10 |
| jain-university-online | MBA | 5/5/6/6 |
| jaipur-national-university-online | MCA | 11/10/18/7 |
| jaypee-university-online | BBA | 5/5/5/5 |
| kiit-university-online | BCOM | 6/6/6/6 |
| kl-university-online | BCA | 6/6/8/7 |
| kurukshetra-university-online | BCOM | 4/5/4/4 |
| kurukshetra-university-online | MCA | 9/12/7/5 |
| madurai-kamaraj-university-online | BCOM | 4/4/3/3 |
| manav-rachna-online | MCA | 11/8/5/4 |
| mangalayatan-university-online | MCA | 7/7/7/7 |
| manipal-academy-higher-education-online | BCOM | 6/6/6/6 |
| manipal-university-jaipur-online | BCOM | 5/5/4/4 |
| manipal-university-jaipur-online | MA | 5/5/5/3 |
| manipal-university-jaipur-online | MCOM | 4/4/4/3 |
| sikkim-manipal-university-online | BA | 5/5/4/4 |
| sikkim-manipal-university-online | BCOM | 5/4/4/4 |
| sikkim-manipal-university-online | MA | 4/4/5/3 |
| sikkim-manipal-university-online | MCOM | 4/4/4/3 |
| vels-university-online | BBA | 5/5/5/5 |
| vtu-online | MCA | 6/6/9/10 |
| ignou-online | BCOM | 5/5/5/4 |

## PARTIAL rows — what is missing

| Slug | Program | Missing | Subj per sem |
|---|---|---|---|
| alagappa-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3) | 2/2/3/3 |
| aligarh-muslim-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3), Sem3 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/2/2/2 |
| aligarh-muslim-university-online | MCOM | Sem1 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/3/3/2 |
| amet-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/3/2/2 |
| amet-university-online | BCOM | Sem3 only 2 subj (<3) | 3/3/2/3 |
| andhra-university-online | MCA | Sem1 only 1 subj (<4), Sem2 only 1 subj (<4), Sem3 only 1 subj (<4), Sem4 only 1 subj (<4) | 1/1/1/1 |
| anna-university-online | MBA | Sem1 only 2 subj (<4), Sem2 only 2 subj (<4), Sem3 only 2 subj (<4), Sem4 only 2 subj (<4) | 2/2/2/2 |
| anna-university-online | MCA | Sem1 only 1 subj (<4), Sem2 only 2 subj (<4), Sem3 only 2 subj (<4), Sem4 only 2 subj (<4) | 1/2/2/2 |
| bharathiar-university-online | BBA | Sem1 only 3 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 3/3/2/3 |
| bs-abdur-rahman-university-online | MCA | Sem4 only 1 subj (<4) | 9/9/9/1 |
| central-university-himachal-pradesh-online | MBA | Sem1 only 1 subj (<4), Sem2 only 3 subj (<4), Sem3 only 2 subj (<4), Sem4 only 2 subj (<4) | 1/3/2/2 |
| centurion-university-online | MCA | Sem4 only 2 subj (<4) | 6/7/4/2 |
| chandigarh-university-online | BBA | Sem2 missing, Sem3 missing, Sem4 missing | 8/0/0/0 |
| chandigarh-university-online | BCA | Sem2 missing, Sem3 missing, Sem4 missing | 5/0/0/0 |
| charusat-university-online | BCA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| charusat-university-online | MCA | Sem1 only 2 subj (<4), Sem2 only 2 subj (<4), Sem3 only 3 subj (<4), Sem4 only 1 subj (<4) | 2/2/3/1 |
| chhatrapati-shahu-ji-maharaj-university-online | BBA | Sem1 only 1 subj (<5), Sem2 missing, Sem3 missing, Sem4 missing | 1/0/0/0 |
| chhatrapati-shahu-ji-maharaj-university-online | BCA | Sem1 only 1 subj (<5), Sem2 missing, Sem3 missing, Sem4 missing | 1/0/0/0 |
| chhatrapati-shahu-ji-maharaj-university-online | BCOM | Sem1 only 1 subj (<3), Sem2 missing, Sem3 missing, Sem4 missing | 1/0/0/0 |
| chhatrapati-shahu-ji-maharaj-university-online | MCA | Sem1 only 1 subj (<4), Sem2 only 1 subj (<4), Sem3 only 1 subj (<4), Sem4 only 1 subj (<4) | 1/1/1/1 |
| chhatrapati-shahu-ji-maharaj-university-online | MCOM | Sem1 only 1 subj (<3), Sem2 missing, Sem3 missing, Sem4 missing | 1/0/0/0 |
| christ-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| christ-university-online | BCOM | Sem1 only 2 subj (<3), Sem3 only 2 subj (<3) | 2/3/2/3 |
| datta-meghe-university-online | MCA | Sem3 only 1 subj (<4), Sem4 only 1 subj (<4) | 9/8/1/1 |
| desh-bhagat-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/2/2/3 |
| desh-bhagat-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3), Sem3 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/2/2/2 |
| dr-babasaheb-ambedkar-open-university-online | BCA | Sem1 only 1 subj (<5), Sem2 only 2 subj (<5), Sem3 only 1 subj (<5), Sem4 only 1 subj (<5) | 1/2/1/1 |
| dr-babasaheb-ambedkar-open-university-online | BCOM | Sem1 only 2 subj (<3) | 2/3/3/3 |
| dr-babasaheb-ambedkar-open-university-online | MCA | Sem1 missing, Sem2 missing, Sem3 missing, Sem4 only 1 subj (<4) | 0/0/0/1 |
| dy-patil-university-online | BBA | Sem3 only 4 subj (<5), Sem4 only 4 subj (<5) | 6/6/4/4 |
| galgotias-university-online | MCA | Sem4 only 1 subj (<4) | 7/8/6/1 |
| ganpat-university-online | MCA | Sem1 missing, Sem2 missing, Sem3 missing, Sem4 only 1 subj (<4) | 0/0/0/1 |
| gls-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3), Sem3 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/2/2/2 |
| guru-ghasidas-vishwavidyalaya-online | MCA | Sem1 missing, Sem2 missing, Sem3 missing, Sem4 only 1 subj (<4) | 0/0/0/1 |
| guru-nanak-dev-university-online | MBA | Sem1 only 1 subj (<4), Sem2 only 1 subj (<4), Sem3 only 1 subj (<4), Sem4 only 1 subj (<4) | 1/1/1/1 |
| guru-nanak-dev-university-online | MCA | Sem4 only 1 subj (<4) | 6/6/6/1 |
| hindustan-institute-technology-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| hindustan-institute-technology-online | BCA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/2/2/3 |
| hindustan-institute-technology-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3) | 2/2/3/3 |
| integral-university-online | BCA | Sem1 only 2 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/3/2/3 |
| integral-university-online | BCOM | Sem1 only 2 subj (<3) | 2/3/3/3 |
| jamia-hamdard-online | MCA | Sem1 missing, Sem2 missing, Sem3 missing, Sem4 only 1 subj (<4) | 0/0/0/1 |
| karnataka-state-open-university-online | BBA | Sem1 only 3 subj (<5), Sem2 only 3 subj (<5), Sem3 only 3 subj (<5), Sem4 only 4 subj (<5) | 3/3/3/4 |
| karnataka-state-open-university-online | BCOM | Sem2 only 2 subj (<3) | 3/2/3/4 |
| karunya-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/2/3/2 |
| kurukshetra-university-online | BBA | Sem1 only 4 subj (<5), Sem2 only 4 subj (<5), Sem3 only 4 subj (<5), Sem4 only 3 subj (<5) | 4/4/4/3 |
| lovely-professional-university-online | BA | Sem3 missing, Sem4 missing | 8/4/0/0 |
| madurai-kamaraj-university-online | BBA | Sem2 only 4 subj (<5), Sem3 only 4 subj (<5), Sem4 only 3 subj (<5) | 5/4/4/3 |
| maharishi-markandeshwar-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/3/2/3 |
| maharishi-markandeshwar-university-online | BCA | Sem1 only 1 subj (<5), Sem2 only 2 subj (<5), Sem3 only 1 subj (<5), Sem4 only 1 subj (<5) | 1/2/1/1 |
| maharishi-markandeshwar-university-online | MCA | Sem1 missing, Sem2 missing, Sem3 missing, Sem4 only 1 subj (<4) | 0/0/0/1 |
| manav-rachna-online | BBA | Sem1 only 2 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/3/2/3 |
| manav-rachna-online | MCOM | Sem1 only 1 subj (<3), Sem2 only 2 subj (<3), Sem3 only 2 subj (<3), Sem4 only 2 subj (<3) | 1/2/2/2 |
| manipal-academy-higher-education-online | BBA | Sem4 only 4 subj (<5) | 5/6/5/4 |
| manipal-academy-higher-education-online | MSC | Sem4 only 2 subj (<3) | 5/4/4/2 |
| manipal-university-jaipur-online | BBA | Sem4 only 4 subj (<5) | 5/5/5/4 |
| manipal-university-jaipur-online | BCA | Sem3 only 4 subj (<5), Sem4 only 4 subj (<5) | 5/5/4/4 |
| manipal-university-jaipur-online | MBA | Sem3 only 1 subj (<4), Sem4 only 2 subj (<4) | 6/6/1/2 |
| manipal-university-jaipur-online | MCA | Sem4 only 2 subj (<4) | 5/5/4/2 |
| manipal-university-jaipur-online | MSC | Sem4 only 2 subj (<3) | 4/4/4/2 |
| manonmaniam-sundaranar-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| manonmaniam-sundaranar-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3) | 2/2/3/3 |
| marwadi-university-online | MCA | Sem4 only 1 subj (<4) | 5/6/7/1 |
| mats-university-online | BCOM | Sem1 only 1 subj (<3), Sem2 only 1 subj (<3), Sem3 only 1 subj (<3), Sem4 only 1 subj (<3) | 1/1/1/1 |
| noida-international-university-online | BBA | Sem4 only 4 subj (<5) | 6/6/5/4 |
| northcap-university-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/2/3/2 |
| parul-university-online | MCOM | Sem1 only 1 subj (<3), Sem2 only 1 subj (<3), Sem3 only 1 subj (<3), Sem4 only 1 subj (<3) | 1/1/1/1 |
| sathyabama-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 3 subj (<5), Sem4 only 3 subj (<5) | 2/2/3/3 |
| savitribai-phule-pune-university-online | MCA | Sem4 only 3 subj (<4) | 6/7/6/3 |
| sgt-university-online | BCOM | Sem1 only 1 subj (<3), Sem2 only 2 subj (<3) | 1/2/3/3 |
| sharda-university-online | BBA | Sem1 only 3 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 3/2/2/2 |
| sharda-university-online | BCA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 3 subj (<5), Sem4 only 3 subj (<5) | 2/2/3/3 |
| shobhit-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| shobhit-university-online | BCA | Sem1 only 2 subj (<5), Sem2 only 3 subj (<5), Sem3 only 2 subj (<5), Sem4 only 3 subj (<5) | 2/3/2/3 |
| shobhit-university-online | MCA | Sem1 only 1 subj (<4), Sem2 only 2 subj (<4), Sem3 only 3 subj (<4), Sem4 only 1 subj (<4) | 1/2/3/1 |
| sikkim-manipal-university-online | MBA | Sem3 only 1 subj (<4), Sem4 only 3 subj (<4) | 6/6/1/3 |
| sikkim-manipal-university-online | MCA | Sem4 only 1 subj (<4) | 5/4/4/1 |
| srm-university-online | MCA | Sem4 only 1 subj (<4) | 9/7/10/1 |
| symbiosis-university-online | BBA | Sem2 missing, Sem3 missing, Sem4 missing | 10/0/0/0 |
| symbiosis-university-online | BCA | Sem2 missing, Sem3 missing, Sem4 missing | 12/0/0/0 |
| university-of-lucknow-online | BBA | Sem1 only 1 subj (<5), Sem2 only 1 subj (<5), Sem3 only 1 subj (<5), Sem4 only 1 subj (<5) | 1/1/1/1 |
| university-of-lucknow-online | BCOM | Sem1 only 2 subj (<3), Sem2 only 1 subj (<3), Sem3 only 1 subj (<3), Sem4 only 1 subj (<3) | 2/1/1/1 |
| university-of-mysore-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 3 subj (<5), Sem4 only 2 subj (<5) | 2/2/3/2 |
| university-of-mysore-online | BCA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 3 subj (<5), Sem4 only 3 subj (<5) | 2/2/3/3 |
| university-of-mysore-online | BCOM | Sem1 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/3/3/2 |
| university-of-mysore-online | MCA | Sem4 only 2 subj (<4) | 6/6/5/2 |
| university-of-mysore-online | MCOM | Sem1 only 2 subj (<3), Sem3 only 2 subj (<3), Sem4 only 2 subj (<3) | 2/3/2/2 |
| uttaranchal-university-online | MCA | Sem4 only 1 subj (<4) | 5/5/5/1 |
| vivekananda-global-university-online | BBA | Sem1 only 2 subj (<5), Sem2 only 2 subj (<5), Sem3 only 2 subj (<5), Sem4 only 2 subj (<5) | 2/2/2/2 |
| yenepoya-online | BBA | Sem1 only 1 subj (<5), Sem2 only 1 subj (<5), Sem3 only 1 subj (<5), Sem4 only 1 subj (<5) | 1/1/1/1 |

## EMPTY rows

| Slug | Program |
|---|---|
| amity-university-online | BA |
| amity-university-online | BBA |
| amity-university-online | BCA |
| amity-university-online | BCOM |
| amrita-vishwa-vidyapeetham-online | BBA |
| amrita-vishwa-vidyapeetham-online | BCA |
| amrita-vishwa-vidyapeetham-online | BCOM |
| amrita-vishwa-vidyapeetham-online | MBA |
| amrita-vishwa-vidyapeetham-online | MCOM |
| dayananda-sagar-university-online | BCA |
| gla-university-online | BBA |
| gla-university-online | BCA |
| gla-university-online | BCOM |
| gla-university-online | MBA |
| graphic-era-university-online | MCA |
| gujarat-university-online | BCOM |
| gujarat-university-online | MCOM |
| guru-kashi-university-online | MCA |
| mats-university-online | MCA |
| pp-savani-university-online | BBA |
| pp-savani-university-online | MBA |
| pp-savani-university-online | MCOM |
| sikkim-manipal-university-online | BBA |

