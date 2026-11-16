# Spec page fee audit, 14 Nov 2026

Audit only; no page content changed. Scope: 219 indexed specialisation pages with their own page-content JSON (audits/spec-page-inventory-2026-11-14.csv: JSON present, index, in sitemap; fact-swept files excluded). Robots and sitemap membership re-checked against the 14 Nov build before the run: 219/219 index, follow and in valid-urls.json. Every figure is in audits/spec-fee-audit-2026-11-14.csv. Produced by scripts/audit-spec-fees.mjs, which reuses the blog fee scanner's extractor and accepted intervals.

## Totals by class

| Class | Figures | Share |
|---|---:|---:|
| MATCH | 2441 | 56.5% |
| MISMATCH | 371 | 8.6% |
| SUPPRESSED | 0 | 0.0% |
| UNRESOLVED | 1506 | 34.9% |
| **All fee figures** | **4318** | |

219 of 219 pages carry at least one typed fee figure. 88 salary-type figures (LPA, CTC, salary, package) are not fees and are left out.

## Totals by section

| Section | MATCH | MISMATCH | SUPPRESSED | UNRESOLVED | All |
|---|---:|---:|---:|---:|---:|
| fees | 682 | 74 | 0 | 717 | 1473 |
| comparisons | 618 | 101 | 0 | 187 | 906 |
| faqs | 393 | 51 | 0 | 305 | 749 |
| other | 748 | 145 | 0 | 297 | 1190 |

By kind of figure:

| Kind | MATCH | MISMATCH | SUPPRESSED | UNRESOLVED |
|---|---:|---:|---:|---:|
| total | 1501 | 340 | 0 | 2 |
| per-semester | 233 | 31 | 0 | 0 |
| line-item | 54 | 0 | 0 | 101 |
| component | 653 | 0 | 0 | 1403 |

Of the 371 MISMATCH figures, 240 are the page's own university and 131 are a competitor named in the same sentence (mostly comparisons).

## What drives MISMATCH

36 distinct (university, figure) pairs make up the 371 MISMATCH figures; the top 15 below account for 349. Each is one fee to confirm on the university's portal: either the page text or lib/data.ts is out of date. 67 MISMATCH figures sit in a sentence that calls the figure all-in, inclusive or effective, i.e. tuition plus exam and registration fees against a data figure that is tuition only.

| University | Typed figure | Data shows | Figures | Pages | All-in wording |
|---|---|---|---:|---:|---:|
| bharati-vidyapeeth-university | Rs 1,60,000 | ₹1.78L | 62 | 14 | 0 |
| noida-international-university | Rs 97,600 | ₹88,500 | 62 | 21 | 21 |
| sharda-university | Rs 1,54,500 | ₹1.4L | 54 | 18 | 24 |
| alliance-university | Rs 1,75,000 | ₹1.6L | 42 | 14 | 10 |
| jaypee-university | Rs 1,82,000 | ₹1.75L | 38 | 18 | 9 |
| bits-pilani-work-integrated | Rs 2,98,400 | ₹3.12L | 32 | 9 | 0 |
| dr-mgr-educational-research-institute | Rs 1,36,000 - Rs 1,41,000 | ₹1.41L | 18 | 3 | 0 |
| bits-pilani-work-integrated | Rs 70,100 | ₹3.12L | 13 | 9 | 0 |
| shoolini-university | Rs 30,000 | ₹1.3L-₹1.58L | 11 | 9 | 0 |
| arka-jain-university | Rs 25,000 | ₹1.08L | 4 | 2 | 0 |
| dr-mgr-educational-research-institute | Rs 34,000 - Rs 40,000 | ₹1.41L | 3 | 3 | 0 |
| nmims | Rs 1.6L-1.95L | ₹1.96L-₹2.2L | 3 | 3 | 0 |
| ignou | Rs 99,600 | ₹66,000 | 3 | 3 | 1 |
| arka-jain-university | Rs 1,00,000 | ₹1.08L | 2 | 2 | 0 |
| manipal-university-jaipur | Rs 1,60,000-1,99,000 | ₹1.56L-₹1.84L | 2 | 2 | 0 |

## How far to trust the classes

Hand-checked random samples: 39 of 40 MISMATCH rows from the final run are a real disagreement between the typed figure and lib/data.ts (the miss is a competitor fee checked against the page's own university); 12 of 12 MATCH rows and 15 of 15 UNRESOLVED rows from the run before the last two rule tweaks were correct, the UNRESOLVED ones being parts of a fee (EMI, exam, registration, add-ons, budget talk) with no data field to check them against. Earlier drafts ran at 40% to 80% MISMATCH precision; the fixes are the kindOf and attribute rules in the script (line items, per-semester multipliers, line labels, differences, pay-after-placement splits, salary wording, short university names). Shoolini's "Rs 30,000" rows are its pay-after-placement instalments x 4; they stay MISMATCH because 4 x 30,000 is not a data figure, but they are the least certain pair in the table. By design a component (discount, EMI, exam fee, difference) is never MISMATCH: it is MATCH when it equals a data figure and UNRESOLVED otherwise. SUPPRESSED is 0 because no figure is attributed to a university whose getDisplayFee is ok:false; the 9 that were came from "DY Patil" on Pune DPU pages resolving to the Navi Mumbai university.

## FeeBreakdown already rendered

Of the non-MATCH figures in a fees section, 87 sit on pages whose fees section is replaced by FeeBreakdown, so readers never see them; they still sit in the JSON.

58 of 219 pages render FeeBreakdown from data (getFeePlans has a plan), so their typed fees section is not shown; their typed figures elsewhere still are. The other 161 render the JSON fees body. Non-MATCH figures on pages with FeeBreakdown: 373.

## The 20 pages with the most MISMATCH figures

| # | Page | MISMATCH | own / competitor | Other non-MATCH | MATCH | Clicks (3 mo) | Words |
|---:|---|---:|---|---:|---:|---:|---:|
| 1 | dr-mgr-educational-research-institute-online/mba/healthcare-management | 11 | 7 / 4 | 6 | 2 | 3 | 1615 |
| 2 | sharda-university-online/mba/data-science-and-analytics | 11 | 7 / 4 | 11 | 12 | 0 | 1558 |
| 3 | sharda-university-online/mba/healthcare-and-hospital-administration | 10 | 6 / 4 | 13 | 11 | 2 | 1544 |
| 4 | bharati-vidyapeeth-university-online/mba/business-analytics | 10 | 6 / 4 | 2 | 9 | 1 | 1272 |
| 5 | sharda-university-online/mba/finance | 10 | 6 / 4 | 14 | 12 | 0 | 1524 |
| 6 | sharda-university-online/mba/marketing | 10 | 6 / 4 | 14 | 13 | 0 | 1577 |
| 7 | bharati-vidyapeeth-university-online/mba/agribusiness | 9 | 4 / 5 | 2 | 6 | 1 | 1280 |
| 8 | bharati-vidyapeeth-university-online/mba/international-business | 9 | 5 / 4 | 6 | 7 | 0 | 1322 |
| 9 | bharati-vidyapeeth-university-online/mba/marketing | 9 | 7 / 2 | 6 | 8 | 0 | 1280 |
| 10 | bits-pilani-work-integrated-online/mba/business-analytics | 9 | 6 / 3 | 11 | 7 | 0 | 1871 |
| 11 | dr-mgr-educational-research-institute-online/mba/information-systems | 9 | 7 / 2 | 7 | 4 | 0 | 1542 |
| 12 | sharda-university-online/mba/strategic-human-resource-management | 9 | 7 / 2 | 10 | 6 | 0 | 1619 |
| 13 | bharati-vidyapeeth-university-online/mba/finance | 8 | 6 / 2 | 3 | 8 | 0 | 1315 |
| 14 | bharati-vidyapeeth-university-online/mba/retail | 8 | 4 / 4 | 2 | 1 | 0 | 1277 |
| 15 | bits-pilani-work-integrated-online/mba/hospital-health-systems-management | 7 | 5 / 2 | 9 | 3 | 8 | 1750 |
| 16 | bits-pilani-work-integrated-online/mba/ai-for-business | 7 | 5 / 2 | 8 | 4 | 3 | 1738 |
| 17 | bits-pilani-work-integrated-online/mba/quality-management | 7 | 5 / 2 | 12 | 2 | 0 | 1769 |
| 18 | dr-mgr-educational-research-institute-online/mba/finance | 7 | 7 / 0 | 7 | 7 | 0 | 1494 |
| 19 | jaypee-university-online/mba/finance | 7 | 7 / 0 | 35 | 14 | 0 | 1666 |
| 20 | noida-international-university-online/mba/agri-business | 7 | 6 / 1 | 10 | 8 | 0 | 1514 |

## MISMATCH on pages that earned clicks

141 of 371 MISMATCH figures sit on 38 pages with at least one Search Console click in the inventory's 3-month window (81 clicks between those pages). 70 of the 219 pages earned any click.

## If every non-MATCH figure sentence were removed

Method: word count is every string in the page-content JSON sections (hero, prose, FAQs, syllabus names and descriptions; ** markup stripped). Each sentence holding a MISMATCH, SUPPRESSED or UNRESOLVED figure is removed once. The 495-word floor is the one quoted for the smallest 3.1 page; this count gives 488 for that page, the closest of four counting methods tried (without the hero: 463; without the syllabus: 462; without both: 437). The floor is applied as 495, so the test is slightly stricter than the 3.1 page itself.

- Pages that would lose any text: 212 of 219.
- Words removed: 20363 of 353737 (5.8%) across the 219 pages.
- Shrink per affected page: median 5.0%, largest 16.7%.
- Pages below 495 words today: 0. After removal: 0.

Sentence removal is an estimate: a FAQ whose answer loses its only sentence would go whole, and a comparison block that loses its fee line may need a rewrite rather than a cut.

| Shrink | Pages |
|---|---:|
| 0% to 5% | 106 |
| 5% to 10% | 69 |
| 10% to 20% | 37 |
| 20% to 30% | 0 |
| 30% to 100% | 0 |
