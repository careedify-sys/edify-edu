# Spec-page inventory, 2026-11-14

Read-only. Nothing in robots, the sitemap or valid-urls.json was changed. The PROPOSED list below is for Rishi to decide on; nothing on it has been noindexed.

## Method

- Rows: every specialisation URL (`/universities/{id}/{programme}/{spec}`) in lib/data/valid-urls.json, 1904 in all. One row each in audits/spec-page-inventory-2026-11-14.csv.
- Pages were fetched from a local `next start` of the branch build (commit a2f3806), because many spec routes render on demand and are not in `.next/server/app`. Every one returned 200.
- has_page_content_json: `lib/data/page-content/{id}-{programme}-{spec}.json` exists under the key the page itself loads (getSpecPageContent with the resolved slug; mcom and bcom map to m.com and b.com).
- university_has_first_hand_file: `lib/data/first-hand/{id}.ts` exists (Amity, NMIMS and MUJ today).
- max_sibling_overlap_pct: main content (`<main>`, with nav, header, footer, aside, scripts, styles, forms, SVG and iframes removed), lowercased, digits and ₹ removed, other punctuation dropped, split into 8-word shingles. The figure is the highest share of this page's shingles that also appear in one sibling: another spec page of the same university and programme. Empty means the page has no sibling.
- in_sitemap: the URL appears in the built /sitemap.xml. robots: the page's meta robots.
- GSC: **not joined.** audits/gsc/ holds no 3-month Pages export. It has two comparison exports, Sep-Oct 2026 vs May-Aug and Oct vs Sep, so the CSV's gsc_clicks, gsc_impressions and gsc_position columns are empty. The noindex proposal below therefore has no traffic filter. A Sep-Oct (2-month) cross-check is given separately and does not change the list.
- Caveat: the shared template is most of every spec page, so overlap is high across the board; a lower figure means more page-specific text. Main content runs from 2,513 to 4,298 words.

## Spec pages: page-content JSON by overlap band

| has_page_content_json | <40 | 40-59 | 60-79 | 80+ | no sibling | Total |
|---|---:|---:|---:|---:|---:|---:|
| true | 130 | 87 | 0 | 0 | 2 | 219 |
| false | 11 | 0 | 40 | 1443 | 191 | 1685 |

By programme: mba 690 (219 with JSON), bba 256 (0 with JSON), mca 218 (0 with JSON), ma 179 (0 with JSON), bca 141 (0 with JSON), bcom 137 (0 with JSON), mcom 133 (0 with JSON), ba 125 (0 with JSON), msc 22 (0 with JSON), bsc 3 (0 with JSON). Spec JSON exists for MBA only.

Robots: all 1904 are `index, follow`. In sitemap: 1901 of 1904. Not in the sitemap: `/universities/parul-university-online/mba/digital-marketing-sales`, `/universities/parul-university-online/mba/entrepreneurship-innovation-management`, `/universities/parul-university-online/mba/information-technology-it`.

## Programme hubs (three-segment /universities URLs): same counts

Siblings for a hub are the other programme hubs of the same university. has_page_content_json is `lib/data/page-content/{id}-{programme}.json`.

| has_page_content_json | <40 | 40-59 | 60-79 | 80+ | no sibling | Total |
|---|---:|---:|---:|---:|---:|---:|
| true | 11 | 49 | 37 | 14 | 15 | 126 |
| false | 7 | 40 | 247 | 46 | 21 | 361 |

All 487 hubs returned 200; robots: index, follow 416, noindex, follow 71.

## PROPOSED noindex list (not applied)

Rule: no page-content JSON AND max_sibling_overlap_pct >= 60. The GSC condition (zero clicks and under 100 impressions) could not be applied, see Method. **1483 spec pages** match.

By programme: mba 439, bba 223, mca 187, ma 174, ba 119, bca 113, mcom 109, bcom 108, msc 9, bsc 2.

Universities affected: 110. Top ten by count: mody-university-online 41, ignou-online 36, dayalbagh-educational-institute-online 35, dayananda-sagar-university-online 34, parul-university-online 33, madurai-kamaraj-university-online 33, gla-university-online 31, lovely-professional-university-online 31, bharati-vidyapeeth-university-online 31, banasthali-vidyapith-online 31.

The full list is every CSV row with has_page_content_json=false and max_sibling_overlap_pct >= 60. The 30 highest-overlap rows:

| URL | Overlap % | Closest sibling |
|---|---:|---|
| /universities/bs-abdur-rahman-university-online/mba/operations | 93.9 | supply-chain-management |
| /universities/dr-dy-patil-vidyapeeth-online/mba/operations | 93.9 | supply-chain-management |
| /universities/manipal-academy-higher-education-online/mba/operations | 93.9 | supply-chain-management |
| /universities/parul-university-online/mba/operations | 93.5 | supply-chain-management |
| /universities/upes-online/bba/operations-management | 93.4 | logistics-supply-chain-management |
| /universities/university-of-madras-online/mba/operations | 93.3 | supply-chain-management |
| /universities/parul-university-online/mba/finance | 93.2 | banking-financial-services |
| /universities/university-of-mysore-online/mba/operations | 93.2 | supply-chain-management |
| /universities/vivekananda-global-university-online/mba/general-management | 93.2 | retail |
| /universities/vivekananda-global-university-online/mba/retail | 93.2 | general-management |
| /universities/mangalayatan-university-online/mba/operations | 93.1 | supply-chain-management |
| /universities/gla-university-online/mba/general-management | 93 | retail |
| /universities/gla-university-online/mba/retail | 93 | general-management |
| /universities/lovely-professional-university-online/bba/entrepreneurship | 93 | family-business |
| /universities/bharati-vidyapeeth-university-online/mca/cloud-computing | 92.8 | information-systems |
| /universities/bharati-vidyapeeth-university-online/mca/information-systems | 92.8 | cloud-computing |
| /universities/dr-dy-patil-vidyapeeth-online/mba/supply-chain-management | 92.7 | operations |
| /universities/ignou-online/mca/it-management | 92.7 | software-development |
| /universities/ignou-online/mca/software-development | 92.7 | it-management |
| /universities/mats-university-online/bba/general-management | 92.7 | retail-management |
| /universities/mats-university-online/bba/retail-management | 92.7 | general-management |
| /universities/bs-abdur-rahman-university-online/mba/supply-chain-management | 92.6 | operations |
| /universities/jain-university-online/mca/cloud-computing | 92.6 | full-stack-development |
| /universities/manipal-academy-higher-education-online/mba/supply-chain-management | 92.6 | operations |
| /universities/manipal-academy-higher-education-online/mca/cloud-computing | 92.6 | full-stack-development |
| /universities/vit-university-online/mca/cloud-computing | 92.4 | full-stack-development |
| /universities/vit-university-online/mca/data-science | 92.4 | big-data-analytics |
| /universities/vit-university-online/mca/software-engineering | 92.4 | cloud-computing |
| /universities/shobhit-university-online/mca/cloud-computing | 92.3 | full-stack-development |
| /universities/lovely-professional-university-online/bba/family-business | 92.2 | entrepreneurship |

## The 20 highest-impression rows the GSC filter would exclude

Not computable as specified: there is no 3-month export. As a stand-in, these are proposed rows that the filter would exclude on **Sep-Oct 2026 (2 months)** figures from audits/gsc/perf-sepoct-vs-mayaug.csv (clicks > 0 or impressions >= 100). That file is a Pages export capped by Search Console, so a page missing from it is not proof of zero.

244 proposed rows would be excluded on these figures.

| URL | Clicks Sep-Oct | Impressions Sep-Oct | Position | Overlap % |
|---|---:|---:|---:|---:|
| /universities/ignou-online/ma/sanskrit-language-indian-knowledge-traditions | 6 | 2615 | 9.98 | 84.9 |
| /universities/jawaharlal-nehru-university-online/ma/psychology | 6 | 1240 | 7.07 | 88.5 |
| /universities/jawaharlal-nehru-university-online/ma/political-science | 2 | 824 | 9.16 | 87.1 |
| /universities/jawaharlal-nehru-university-online/ma/public-administration | 10 | 653 | 5.97 | 87.1 |
| /universities/university-of-madras-online/mba/supply-chain-management | 7 | 570 | 5.6 | 92 |
| /universities/mody-university-online/ma/sociology | 0 | 434 | 83.2 | 89.2 |
| /universities/university-of-mumbai-online/ma/economics | 3 | 390 | 16.46 | 88.5 |
| /universities/maharshi-dayanand-university-online/ma/psychology | 2 | 377 | 8.23 | 88.5 |
| /universities/maharshi-dayanand-university-online/ma/political-science | 4 | 348 | 7.95 | 87.1 |
| /universities/jamia-millia-islamia-online/mba/hr-management | 9 | 340 | 7.43 | 84.2 |
| /universities/andhra-university-online/mba/hr-management | 1 | 324 | 8.92 | 83.1 |
| /universities/mahatma-jyotiba-phule-rohilkhand-university-online/ba/political-science | 1 | 302 | 7.73 | 87.8 |
| /universities/savitribai-phule-pune-university-online/bba/finance | 3 | 301 | 10.35 | 86.5 |
| /universities/mahatma-jyotiba-phule-rohilkhand-university-online/ma/political-science | 5 | 260 | 5.3 | 87.8 |
| /universities/university-of-mumbai-online/ma/sociology | 2 | 257 | 26.4 | 88.5 |
| /universities/jawaharlal-nehru-university-online/ma/history | 1 | 255 | 8.63 | 88.5 |
| /universities/sage-university-online/mba/data-science | 2 | 252 | 6.93 | 83.6 |
| /universities/jamia-hamdard-online/bca/ai-ml | 1 | 238 | 17.56 | 81 |
| /universities/maharshi-dayanand-university-online/ma/english | 1 | 216 | 10.19 | 88.5 |
| /universities/guru-gobind-singh-indraprastha-university-online/ma/psychology | 3 | 215 | 7.55 | 89.2 |

## Update, 14 Nov: 3-month Search Console join

Rishi supplied a 3-month Pages export (11 Aug to 10 Nov 2026, web). The CSV's gsc_clicks, gsc_impressions and gsc_position columns are now filled for the 388 spec URLs that appear in it. The export stops at 999 rows, so a blank means "not in the export", which is a floor, not proof of zero.

- Near-copies (no JSON, overlap >= 60): 1,483. With at least one click: 284 (564 clicks). With zero clicks: 1,199. None of the 1,199 has 100 or more impressions, so the plan's GSC filter (zero clicks and under 100 impressions) excludes exactly the 284 with clicks.
- The plan's middle path splits the 1,199 into 767 to noindex and 432 to keep and improve "at universities you recommend". That list is not recorded in the repo. lib/data.ts uniType is unset for 1,060 of the 1,199, so "state and open universities" cannot reproduce it either.
- Draft in audits/spec-middle-path-draft-2026-11-14.csv uses the 29 universities with a review blog (UNIVERSITY_PROGRAM_LINKS) as the keep list: **793 noindex, 406 keep and improve, 284 keep (have clicks).** Using the 24 coupon universities instead gives 784 / 415. Rishi to confirm the keep list before anything is noindexed.

## Other findings (not acted on)

- **71 programme hubs are in the sitemap but serve `noindex, follow`**, across 23 universities (Banasthali, Dayalbagh, Madurai Kamaraj and Mody have 5 or 6 each). Confirmed on the live site for /universities/banasthali-vidyapith-online/mba. check-sitemap-noindex-drift passes, so the noindex comes from a gate it does not model (the mode-unverified university gate is the likely source; not yet traced). The spec pages under these hubs are all `index, follow`.
- **86 page-content JSON files are never loaded.** Their key does not match any sitemap spec slug, for example `nmims-online-mba-financial-management.json` while the live URL is /mba/finance, and five Amity MBA spec files. Those spec pages fall back to the template and sit in the proposed list. Renaming the files to the live slugs would take them off it without new writing; each one needs checking against the page it would feed.
- Three Parul MBA spec URLs are in valid-urls.json but not in the built sitemap (listed above).

## Decision needed from Rishi

1. Supply a 3-month Pages export (Performance > Pages, last 3 months) into audits/gsc/ so the traffic filter can run, or accept the Sep-Oct stand-in above.
2. Then approve, trim or reject the proposed list. Applying it means noindex plus removal from valid-urls.json together (the never-both gate blocks one without the other).
