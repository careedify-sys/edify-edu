# Phase B queue ranking (decision D3), 16 Nov 2026

Analyst: seo-analyst. Purpose: confirm or reorder the proposed daily-routine queue in `audits/OPERATING-PLAN.md` Section 5 (NMIMS, Amity, MUJ, SMU, Symbiosis, LPU, Chandigarh, JAIN, Amrita, UPES) against Search Console impressions.

## Inputs

| File | Export | Window used here | Rows | Site total in file (window used) |
|---|---|---|---:|---|
| `audits/gsc/perf-oct-vs-sep.csv` | Pages, Search, Web, compare mode | 1-31 Oct 2026 (31 days), "A" columns | 1,241 | 731,101 impressions, 3,487 clicks |
| `audits/gsc/perf-sepoct-vs-mayaug.csv` | Pages, Search, Web, compare mode | 1 Sep-31 Oct 2026 (61 days), "A" columns | 1,359 | 1,774,695 impressions, 9,127 clicks |

The "B" periods of both files (1-30 Sep, 18 May-31 Aug) are not used. The two files are never subtracted from each other. Oct and Sep-Oct figures sit side by side only as ranks, never as a difference.

Other GSC files found and not used for numbers:

- `audit-data/gsc-3m-2026-11-10/Pages.csv` ("Last 3 months", Chart.csv runs 11 Aug-10 Nov 2026, 999 rows). Not used: it is a single-period export capped at 999 rows, and zero-click pages drop out of it. Example: `/universities/nmims-online/mba` has 244 Oct impressions in the compare export and is absent from this one.
- `audit-data/Pages.csv` and `audit-data/Queries.csv` (dated 21 Jul 2026). Stale for this decision.
- No Queries export for Sep-Nov exists in the repo, so no query-level split (brand vs fee vs spec) is possible here.

## Method

- Every URL is normalised (host, query string, trailing slash removed) and bucketed by university id:
  - (a) profile: `/universities/{id}`
  - (b) MBA hub: `/universities/{id}/mba`
  - (c) spec pages: `/universities/{id}/{prog}/{spec}`, all programmes
  - other programme hubs `/universities/{id}/{prog}` (prog not mba) are counted in the total only
  - (d) total university pages = (a) + (b) + (c) + other hubs
- Review blogs: `/blog/{slug}` where the slug contains "review" and no "-vs-", mapped to one id by the slug's short name (nmims, amity, muj, smu, jain, dsu, uu-doon, sppu, and so on). Each mapping used in the recommendation was checked against the `/universities/` link inside the post in `lib/blog.ts`. One correction came out of that check: `dy-patil-online-mba-review` is about D.Y. Patil Vidyapeeth Pune, so it maps to `dr-dy-patil-vidyapeeth-online`, not `dy-patil-university-online`. Five review slugs are left unmapped because they name no single id in scope: `online-manipal-mba-review-2026` (covers three Manipal-group ids), `xlri-online-mba-review-2026`, `imt-ghaziabad-online-mba-review-2026`, `noida-international-university-online-mba-review`, `jaypee-jiit-online-mba-review`.
- MBA hub position: impression-weighted, sum(position x impressions) / sum(impressions). The hub is one URL, so this equals the position GSC reports for that URL in the window.
- Cap rule: both exports are row-capped (lowest row has 1 impression, so the cap is a row count, not an impression floor). A page absent from a file counts as 0. A "0 / 0" profile for Amity, NMIMS, LPU and IGNOU means the profile URL is absent from the export, not proven to have zero impressions.
- Every number below is impressions / clicks for the stated window, out of the site total in the Inputs table.

## Table 1. Top 20 by MBA hub + profile impressions, 1-31 Oct 2026

Denominator: 731,101 site impressions, 3,487 site clicks, 1-31 Oct 2026. Sort key = (a) + (b) impressions; ties broken by total university pages. "Review blogs" covers all programmes (MBA, BBA, MCA reviews).

| # | University id | Profile I / C | MBA hub I / C | MBA hub pos | Spec pages I / C (n) | Total uni pages I / C | Review blogs I / C |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | ganpat-university-online | 191 / 0 | 233 / 0 | 19.74 | 33 / 0 (2) | 557 / 0 | 0 / 0 |
| 2 | amity-university-online | 0 / 0 | 350 / 0 | 62.69 | 85 / 1 (3) | 595 / 1 | 1,775 / 4 |
| 3 | adichunchanagiri-university-online | 116 / 1 | 234 / 3 | 5.22 | 79 / 1 (3) | 429 / 5 | 412 / 4 |
| 4 | chandigarh-university-online | 30 / 0 | 303 / 0 | 49.69 | 242 / 2 (6) | 847 / 2 | 424 / 0 |
| 5 | central-university-tamil-nadu-online | 7 / 0 | 245 / 5 | 7.13 | 30 / 0 (1) | 344 / 6 | 0 / 0 |
| 6 | nmims-online | 0 / 0 | 244 / 0 | 49.33 | 52 / 0 (2) | 337 / 0 | 465 / 1 |
| 7 | dayananda-sagar-university-online | 55 / 0 | 175 / 1 | 13.34 | 162 / 3 (10) | 537 / 4 | 1,512 / 13 |
| 8 | jamia-hamdard-online | 69 / 0 | 155 / 0 | 55.42 | 355 / 1 (10) | 757 / 1 | 0 / 0 |
| 9 | bits-pilani-work-integrated-online | 79 / 0 | 144 / 3 | 17.59 | 814 / 4 (8) | 1,037 / 7 | 7,711 / 38 |
| 10 | symbiosis-university-online | 47 / 0 | 174 / 0 | 61.37 | 579 / 2 (11) | 865 / 3 | 1,758 / 8 |
| 11 | andhra-university-online | 35 / 0 | 166 / 0 | 12.72 | 91 / 1 (2) | 292 / 1 | 0 / 0 |
| 12 | jain-university-online | 25 / 0 | 159 / 0 | 56.91 | 646 / 5 (17) | 874 / 5 | 2,011 / 3 |
| 13 | guru-nanak-dev-university-online | 36 / 0 | 145 / 1 | 13.71 | 2 / 0 (1) | 183 / 1 | 0 / 0 |
| 14 | charusat-university-online | 55 / 1 | 115 / 0 | 11.18 | 26 / 1 (2) | 392 / 2 | 0 / 0 |
| 15 | sastra-university-online | 75 / 0 | 83 / 0 | 10.08 | 16 / 0 (2) | 174 / 0 | 0 / 0 |
| 16 | christ-university-online | 151 / 1 | 0 / 0 | - | 30 / 0 (1) | 300 / 2 | 0 / 0 |
| 17 | galgotias-university-online | 70 / 0 | 78 / 0 | 16.14 | 155 / 0 (6) | 1,069 / 5 | 3,649 / 5 |
| 18 | lovely-professional-university-online | 0 / 0 | 148 / 0 | 61.47 | 198 / 0 (5) | 1,031 / 0 | 448 / 2 |
| 19 | dr-mgr-educational-research-institute-online | 27 / 0 | 121 / 0 | 9.95 | 35 / 1 (2) | 183 / 1 | 0 / 0 |
| 20 | ignou-online | 0 / 0 | 147 / 0 | 57.59 | 1,381 / 10 (13) | 1,689 / 10 | 360 / 1 |

## Table 2. Same 20 ids, 1 Sep-31 Oct 2026

Denominator: 1,774,695 site impressions, 9,127 site clicks, 1 Sep-31 Oct 2026 (61 days). Same order as Table 1 so rows line up; this is not a re-sort. Do not subtract Table 1 from Table 2: the windows overlap and the files are different exports.

| # | University id | Profile I / C | MBA hub I / C | MBA hub pos | Spec pages I / C (n) | Total uni pages I / C | Review blogs I / C |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | ganpat-university-online | 381 / 0 | 494 / 0 | 18.56 | 102 / 2 (2) | 1,216 / 2 | 0 / 0 |
| 2 | amity-university-online | 0 / 0 | 542 / 0 | 60.41 | 298 / 3 (5) | 1,260 / 3 | 4,580 / 11 |
| 3 | adichunchanagiri-university-online | 294 / 2 | 879 / 15 | 5.54 | 291 / 4 (5) | 1,464 / 21 | 838 / 10 |
| 4 | chandigarh-university-online | 0 / 0 | 777 / 0 | 42.71 | 488 / 4 (10) | 1,985 / 6 | 1,083 / 2 |
| 5 | central-university-tamil-nadu-online | 193 / 2 | 312 / 8 | 6.80 | 260 / 1 (1) | 870 / 12 | 0 / 0 |
| 6 | nmims-online | 0 / 0 | 460 / 0 | 43.71 | 243 / 0 (4) | 817 / 0 | 1,245 / 3 |
| 7 | dayananda-sagar-university-online | 116 / 1 | 429 / 4 | 11.84 | 669 / 8 (13) | 1,552 / 16 | 3,839 / 22 |
| 8 | jamia-hamdard-online | 130 / 0 | 346 / 1 | 43.83 | 874 / 11 (14) | 2,013 / 16 | 0 / 0 |
| 9 | bits-pilani-work-integrated-online | 191 / 1 | 466 / 6 | 13.35 | 1,495 / 7 (10) | 2,152 / 14 | 19,298 / 74 |
| 10 | symbiosis-university-online | 0 / 0 | 420 / 1 | 49.51 | 1,374 / 8 (11) | 1,966 / 10 | 4,281 / 23 |
| 11 | andhra-university-online | 128 / 2 | 768 / 6 | 9.13 | 409 / 3 (4) | 1,305 / 11 | 0 / 0 |
| 12 | jain-university-online | 0 / 0 | 317 / 0 | 50.79 | 1,427 / 8 (15) | 1,917 / 8 | 6,935 / 7 |
| 13 | guru-nanak-dev-university-online | 0 / 0 | 293 / 1 | 11.76 | 7 / 1 (1) | 354 / 2 | 0 / 0 |
| 14 | charusat-university-online | 103 / 1 | 223 / 0 | 9.78 | 141 / 1 (3) | 906 / 5 | 0 / 0 |
| 15 | sastra-university-online | 183 / 0 | 277 / 0 | 9.63 | 7 / 1 (1) | 467 / 1 | 0 / 0 |
| 16 | christ-university-online | 423 / 2 | 0 / 0 | - | 61 / 0 (1) | 728 / 4 | 0 / 0 |
| 17 | galgotias-university-online | 110 / 0 | 266 / 1 | 10.05 | 586 / 0 (6) | 2,953 / 9 | 12,797 / 20 |
| 18 | lovely-professional-university-online | 0 / 0 | 369 / 0 | 56.83 | 223 / 0 (1) | 1,993 / 0 | 1,242 / 5 |
| 19 | dr-mgr-educational-research-institute-online | 86 / 0 | 209 / 0 | 10.11 | 200 / 2 (2) | 495 / 2 | 0 / 0 |
| 20 | ignou-online | 0 / 0 | 266 / 0 | 44.74 | 3,572 / 16 (18) | 4,257 / 18 | 1,480 / 3 |

## What Table 1 shows

- Hub + profile impressions are small everywhere: the leader, Ganpat, has 424 in October out of 731,101 site impressions (0.06%). Gaps between ranks 2 and 20 are a few hundred impressions a month.
- The big-brand MBA hubs sit deep. Amity 62.69, Symbiosis 61.37, LPU 61.47, IGNOU 57.59, JAIN 56.91, Chandigarh 49.69, NMIMS 49.33 (Oct, impression-weighted). Their hub impressions come from page 5 to page 7 and earn 0 clicks in October. Ranking the queue by this column rewards deep, zero-click visibility.
- The pages that rank near page 1 on the MBA hub are mid-size universities: Adichunchanagiri 5.22, Central University of Tamil Nadu 7.13, DMGR 9.95, SASTRA 10.08, Charusat 11.18, Andhra 12.72, DSU 13.34.
- Brand demand lands on the review blogs, not the hubs. In October the mapped review blogs for BITS (7,711), Galgotias (3,649), JAIN (2,011), Symbiosis (1,758), Amity (1,775) and DSU (1,512) each exceed that university's hub + profile by 4x to 50x.

So Table 1 answers the question as set, but it is a weak demand signal on its own. The recommendation uses a wider measure.

## Table 3. MBA cluster demand, the basis for the recommendation

MBA cluster = profile + MBA hub + MBA spec pages + MBA review blogs (slug contains "mba"). These are the pages that print the MBA record the daily routine checks. Windows and denominators as in Tables 1 and 2. "Fee checked" is `feeVerifiedOn` in `lib/data.ts` at HEAD 9e1dde4 (same value in the working tree).

| Oct rank | University id | Oct cluster I / C | of which review blog I | MBA hub I @ pos (Oct) | Sep-Oct cluster I / C | Sep-Oct rank | Fee checked |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | bits-pilani-work-integrated-online | 8,748 / 45 | 7,711 | 144 @ 17.6 | 21,450 / 88 | 1 | none |
| 2 | galgotias-university-online | 3,934 / 5 | 3,649 | 78 @ 16.1 | 13,759 / 21 | 2 | 2026-08-07 |
| 3 | jain-university-online | 2,743 / 6 | 2,011 | 159 @ 56.9 | 8,397 / 12 | 3 | 2026-10-30 |
| 4 | symbiosis-university-online | 1,866 / 8 | 1,205 | 174 @ 61.4 | 4,535 / 20 | 6 | 2026-11-13 |
| 5 | dayananda-sagar-university-online | 1,857 / 16 | 1,512 | 175 @ 13.3 | 4,878 / 31 | 4 | none |
| 6 | dr-dy-patil-vidyapeeth-online | 1,784 / 1 | 1,578 | 74 @ 69.5 | 4,641 / 17 | 5 | none |
| 7 | amity-university-online | 1,343 / 4 | 919 | 350 @ 62.7 | 3,350 / 7 | 8 | 2026-11-13 |
| 8 | uttaranchal-university-online | 1,172 / 7 | 1,000 | 54 @ 37.7 | 4,289 / 21 | 7 | 2026-10-26 |
| 9 | savitribai-phule-pune-university-online | 1,122 / 11 | 746 | absent from both exports | 1,965 / 19 | 14 | none |
| 10 | shoolini-university-online | 1,084 / 9 | 681 | 68 @ 43.3 | 2,518 / 20 | 9 | none |
| 11 | manipal-university-jaipur-online | 878 / 1 | 256 | 81 @ 24.4 | 1,733 / 5 | 17 | 2026-11-13 |
| 12 | adichunchanagiri-university-online | 841 / 9 | 412 | 234 @ 5.2 | 2,302 / 31 | 10 | none |
| 13 | bharati-vidyapeeth-university-online | 815 / 1 | 563 | 27 @ 27.1 | 1,912 / 14 | 15 | 2026-11-13 |
| 14 | chandigarh-university-online | 738 / 2 | 346 | 303 @ 49.7 | 1,808 / 5 | 16 | none |
| 17 | sikkim-manipal-university-online | 639 / 3 | 392 | 69 @ 23.8 | 2,179 / 14 | 11 | 2026-10-06 |
| 19 | upes-online | 585 / 1 | 468 | 25 @ 52.3 | 1,268 / 4 | 19 | 2026-10-30 |
| 20 | amrita-vishwa-vidyapeetham-online | 560 / 6 | 362 | 24 @ 40.8 | 1,082 / 9 | 23 | none |
| 21 | nmims-online | 507 / 0 | 211 | 244 @ 49.3 | 1,166 / 0 | 22 | 2026-11-13 |
| 24 | lovely-professional-university-online | 427 / 2 | 186 | 148 @ 61.5 | 1,038 / 2 | 24 | 2026-10-30 |

Rows 15, 16, 18, 22 and 23 (Arka Jain, IGNOU, DDU Gorakhpur, Vignan, Ganpat) are omitted; none is in the proposed list or the recommendation.

## Recommended top 10 for the daily routine

Rule: rank by October MBA cluster impressions; keep a university only if it is also top 10 in the Sep-Oct window; where two are within 5% on impressions, more clicks goes first.

| Order | University id | Oct cluster I / C | Sep-Oct cluster I / C | In proposed list |
|---:|---|---:|---:|---|
| 1 | bits-pilani-work-integrated-online | 8,748 / 45 | 21,450 / 88 | no |
| 2 | galgotias-university-online | 3,934 / 5 | 13,759 / 21 | no |
| 3 | jain-university-online | 2,743 / 6 | 8,397 / 12 | yes (8th) |
| 4 | dayananda-sagar-university-online | 1,857 / 16 | 4,878 / 31 | no |
| 5 | symbiosis-university-online | 1,866 / 8 | 4,535 / 20 | yes (5th) |
| 6 | dr-dy-patil-vidyapeeth-online | 1,784 / 1 | 4,641 / 17 | no |
| 7 | amity-university-online | 1,343 / 4 | 3,350 / 7 | yes (2nd) |
| 8 | uttaranchal-university-online | 1,172 / 7 | 4,289 / 21 | no |
| 9 | shoolini-university-online | 1,084 / 9 | 2,518 / 20 | no |
| 10 | adichunchanagiri-university-online | 841 / 9 | 2,302 / 31 | no |

Notes on the order:

- DSU goes above Symbiosis: 1,857 vs 1,866 impressions is within 5%, and DSU has 16 clicks to Symbiosis's 8.
- SPPU is 9th on October alone but 14th on Sep-Oct, and its MBA hub is absent from both exports, so a record fix has no MBA hub page to lift. Adichunchanagiri replaces it: 10th on Sep-Oct, and its MBA hub ranks at 5.2 (Oct) and 5.5 (Sep-Oct) and it has the most MBA hub clicks of any university in Sep-Oct (15; next is Central University of Tamil Nadu with 8). In October it has 3, second to Central University of Tamil Nadu's 5.
- BITS is 88% review blog in October (7,711 of 8,748). Commit d55afb9 (16 Nov) already changed BITS exam mode. The fee, eligibility and syllabus items are still open, as `feeVerifiedOn` is empty.
- Symbiosis and Amity had fees checked on 13 Nov. They stay because the routine also covers session, eligibility, exam mode and syllabus. If the 13 Nov pass already covered those, drop both and promote SPPU (1,122 / 11) and MUJ (878 / 1).
- Galgotias carries the oldest fee check of the ten (7 Aug 2026).

## Where this differs from the proposed list, and why

| Proposed | Proposed position | Oct cluster rank | Sep-Oct cluster rank | Decision | Reason |
|---|---:|---:|---:|---|---|
| NMIMS | 1 | 21 | 22 | out | 507 Oct impressions and 0 clicks in both windows; hub at 49.3; fee checked 13 Nov |
| Amity | 2 | 7 | 8 | kept, 7th | demand mostly on the review blog (919 of 1,343); hub at 62.7 |
| Manipal University Jaipur | 3 | 11 | 17 | out | 878 / 1 Oct; fee checked 13 Nov; first reserve |
| Sikkim Manipal | 4 | 17 | 11 | out | 639 / 3 Oct; fee checked 6 Oct |
| Symbiosis | 5 | 4 | 6 | kept, 5th | |
| LPU | 6 | 24 | 24 | out | 427 / 2 Oct; hub at 61.5; MBA spec pages near zero |
| Chandigarh | 7 | 14 | 16 | out | 4th on hub + profile (333) but hub at 49.7 with 0 clicks |
| JAIN | 8 | 3 | 3 | kept, moved to 3rd | |
| Amrita | 9 | 20 | 23 | out | 560 / 6 Oct |
| UPES | 10 | 19 | 19 | out | 585 / 1 Oct; hub at 52.3 |

The proposed list rests on "the first five already have review posts and owner links". In these exports, the review posts for BITS, Galgotias, DSU, DY Patil Vidyapeeth and Uttaranchal each earned more October impressions than the NMIMS, MUJ and SMU MBA review posts.

## Limits

- No Queries export for Sep-Nov is in the repo, so this cannot split brand, fee and spec intent. The 7-day Pages and Queries export requested for the Monday scorecard would allow that.
- Profile and hub zeros for big brands may be export-cap absences, not true zeros.
- Blog mapping is by slug; a review post can rank for queries about a different university. Five review slugs are unmapped (listed in Method).
- Positions are as reported by GSC for the whole window. The hub and spec ranking drop (`audits/hub-spec-ranking-drop-2026-11-05.md`) means October positions are worse than September for most hubs.

Scripts (scratch, not committed): rank.mjs, mba.mjs, table.mjs in the session scratchpad. Inputs are read only.
