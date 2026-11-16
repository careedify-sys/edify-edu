# Hub fee contradictions, 14 Nov 2026 (audit only)

Script: `npx tsx scripts/audit-hub-fees.mjs audits/hub-fee-contradictions-2026-11-14.csv audits/hub-fee-contradictions-summary-2026-11-14.md`. Nothing on the site changed.

Each hub's own-university fee figures in its page-content JSON, compared with what the top section prints (`formatExactFee(getExactFee(u, program))`, or "Contact our counsellor for current fee details" when that is null). Method and class definitions are in the script header.

## Scope

- Hubs in the sitemap: 416. Indexed with a page-content JSON: **126**. Left out: 0 noindexed, 290 without a JSON, 0 unresolvable.
- Hubs whose top shows the counsellor line: 97. Hubs whose top shows a fee: 29.

## Counts

| Class | Figures |
|---|---:|
| AGREES | 209 |
| CONTRADICTS | 22 |
| TOP_HIDDEN | 106 |
| PART (component or slice, top shows a fee) | 84 |
| Attributed to another university (not compared) | 141 |
| Salary figures (excluded) | 66 |

- **22 contradicting figures on 6 hubs**; 7 of them sit in sections the hub renders (on 5 hubs).
- **14 hubs hide the fee at the top but type one in the text** (106 figures; 18 rendered, on 12 hubs).
- Hubs with any contradiction or hidden-fee figure that earned clicks (11 Aug to 10 Nov): 11 (35 clicks).

## CONTRADICTS by section

| Section | Figures | Rendered on hub |
|---|---|---|
| fees | 7 | 0 |
| faqs | 5 | 3 |
| tldr | 4 | 4 |
| comparisons | 3 | 0 |
| hero | 2 | 0 |
| about | 1 | 0 |

## TOP_HIDDEN by section

| Section | Figures | Rendered on hub |
|---|---|---|
| faqs | 22 | 5 |
| fees | 16 | 0 |
| tldr | 13 | 13 |
| comparisons | 12 | 0 |
| hero | 11 | 0 |
| emi | 11 | 0 |
| honestVerdict | 10 | 0 |
| redFlags | 7 | 0 |
| about | 3 | 0 |
| admission | 1 | 0 |

## Hubs with contradictions

| Hub | Top shows | Figures | Rendered | Clicks 3m |
|---|---|---|---|---|
| /universities/andhra-university-online/mba | ₹62,200 | 6 | 1 | 11 |
| /universities/sastra-university-online/mba | ₹1,80,000 | 5 | 2 | 2 |
| /universities/shoolini-university-online/mba | ₹1,30,000–₹1,58,000 | 2 | 1 | 2 |
| /universities/ignou-online/mba | ₹66,000 | 6 | 2 | 1 |
| /universities/lovely-professional-university-online/mba | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | 2 | 1 | 0 |
| /universities/amity-university-online/mba | ₹2,07,000–₹2,25,000 | 1 | 0 | 0 |

## Hubs that hide the fee but type one

| Hub | Top shows | Figures | Rendered | Clicks 3m |
|---|---|---|---|---|
| /universities/aligarh-muslim-university-online/mba | Contact our counsellor for current fee details | 8 | 1 | 8 |
| /universities/jamia-millia-islamia-online/mba | Contact our counsellor for current fee details | 10 | 2 | 3 |
| /universities/jamia-hamdard-online/mba | Contact our counsellor for current fee details | 9 | 1 | 2 |
| /universities/assam-don-bosco-university-online/mba | Contact our counsellor for current fee details | 7 | 2 | 2 |
| /universities/mahatma-gandhi-university-online/mba | Contact our counsellor for current fee details | 6 | 0 | 2 |
| /universities/alliance-university-online/mba | Contact our counsellor for current fee details | 7 | 3 | 1 |
| /universities/dr-mgr-educational-research-institute-online/mba | Contact our counsellor for current fee details | 7 | 1 | 1 |
| /universities/srm-university-sikkim-online/mba | Contact our counsellor for current fee details | 13 | 2 | 0 |
| /universities/shiv-nadar-university-online/mba | Contact our counsellor for current fee details | 9 | 1 | 0 |
| /universities/university-of-madras-online/mba | Contact our counsellor for current fee details | 8 | 1 | 0 |
| /universities/anna-university-online/mba | Contact our counsellor for current fee details | 7 | 1 | 0 |
| /universities/devi-ahilya-vishwavidyalaya-online/mba | Contact our counsellor for current fee details | 7 | 1 | 0 |
| /universities/noida-international-university-online/mba | Contact our counsellor for current fee details | 6 | 2 | 0 |
| /universities/sharda-university-online/mba | Contact our counsellor for current fee details | 2 | 0 | 0 |

## Notes

- Rendered sections only: tldr, ugcDeb, abcId, redFlags.flags and FAQ items with question/answer keys. JSON files written with `q`/`a` FAQ keys or `redFlags.items` never show those parts on the hub: 10 of the 126 hub JSONs use `q`/`a` FAQ keys and 10 use `redFlags.items`.
- Clicks: GSC Pages export, last 3 months (11 Aug to 10 Nov 2026), capped at 999 rows; a hub not in it counts as 0.
- Kind and attribution are heuristic: the 14 Nov spec audit's rules plus four hub overrides (script comments). The first run gave 39 CONTRADICTS; all 39 were read by hand, the 17 false ones (instalment amounts, pipe-table competitor columns, a concession, an unresolved competitor label) led to the overrides, and the 22 left were all read as genuine.
