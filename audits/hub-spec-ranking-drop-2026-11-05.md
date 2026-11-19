# Hub and spec ranking drop: tagged GSC read, 2026-11-05

Diagnostic only. Numbers, no conclusions. Nothing in the codebase was changed for this file.

## Inputs

| File | Source export | Periods | Rows |
|---|---|---|---:|
| `audits/gsc/perf-sepoct-vs-mayaug.csv` | Pages.csv, Performance on Search, Web | A = 1 Sep-31 Oct 2026 (61 days), B = 18 May-31 Aug 2026 (106 days) | 1,358 |
| `audits/gsc/perf-oct-vs-sep.csv` | Pages.csv, Performance on Search, Web | A = 1-31 Oct 2026 (31 days), B = 1-30 Sep 2026 (30 days) | 1,240 |

Site totals in the files: long export 2,948,433 impressions (B) and 1,774,695 (A); short export 1,045,808 (Sep) and 731,101 (Oct).

## Method

- Page set: every URL in either file matching `/universities/<id>/<programme>` (hub) or `/universities/<id>/<programme>/<spec>` (spec), plus every `/blog/<slug>` whose post in `lib/blog.ts` has "review" in the slug or category (control, 58 posts; all 58 appear in at least one file).
- Tags are computed today by calling the code itself through `tsx`, not by reimplementing it:
  - **JSON**: hub = `getPageContent(id, program) !== null`; spec = `getSpecPageContent(id, program, slug)` using the slug `resolveSpec` returns.
  - **Body chars**: total length of every string inside the JSON's `sections` object (metadata excluded).
  - **Fee**: `getDisplayFee(u, program)`, `ok` and `rule`. For spec pages this is the parent programme's result.
  - **Robots**: hubs = `shouldIndexProgrammeHub(u, program).shouldIndex`. Spec routes do not call that function; their robots meta is `shouldIndexUniversity(u.id)`, which is what the spec tables report.
  - **Sitemap**: membership in the output of `app/sitemap.ts` default export (3,037 URLs), run against the working tree.
  - **Status**: "404 today" = `resolveSpec` returns null; "redirects today" = `resolveSpec` returns a different slug; "uni-not-found" / "no-programDetails" = route returns 404 / Not Found.
- Position per group = sum(position x impressions) / sum(impressions) for that period. Pages with 0 impressions in a period add no weight.
- Impressions/day = group impressions / days in period. Δ = period A minus period B. Positive Δ pos = numerically higher (lower ranking).
- Page counts are pages with at least one impression in either period of that comparison. A page absent from a file counts as 0 impressions in both of that file's periods.

## Caveats on the inputs

- Working tree on `feat/protect-ai-pages` carries uncommitted edits to `lib/data/valid-urls.json` and `lib/data/programs-manifest.json`. Five tagged hubs are sitemap Y in the working tree and not in `valid-urls.json` at HEAD: `marwadi-university-online/bcom`, `lovely-professional-university-online/bba`, `lovely-professional-university-online/ba`, `chandigarh-university-online/msc`, `jaypee-university-online/bba`.
- Tags describe the code today. They do not say what a page's state was during either period.
- GSC Pages exports are capped; pages below the cap in a period are missing and count as 0.

## Programme hubs `/universities/<id>/<programme>`

### All, by status today

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ALL hubs in either export | 317 | 11.00 | 15.87 | +4.87 | 2166.6 | 778.3 | -1388.3 | -64.1% | 287 | 13.49 | 19.85 | +6.36 | 1003.4 | 553.5 | -449.8 | -44.8% |
| renders today | 311 | 11.06 | 15.87 | +4.80 | 2093.2 | 778.3 | -1314.9 | -62.8% | 286 | 13.49 | 19.87 | +6.38 | 1003.4 | 552.6 | -450.7 | -44.9% |
| uni-not-found | 3 | 8.78 | - | - | 12.5 | 0.0 | -12.5 | -100.0% | 1 | - | 6.36 | - | 0.0 | 0.9 | +0.9 | - |
| no-programDetails | 3 | 9.29 | - | - | 60.8 | 0.0 | -60.8 | -100.0% | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - |

Remaining hub tables cover the "renders today" rows only.

### Page-content JSON

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N | 238 | 10.33 | 12.76 | +2.43 | 1666.5 | 563.7 | -1102.8 | -66.2% | 213 | 11.26 | 15.36 | +4.10 | 745.2 | 376.7 | -368.5 | -49.5% |
| JSON Y | 73 | 13.91 | 24.01 | +10.10 | 426.8 | 214.6 | -212.2 | -49.7% | 73 | 19.92 | 29.51 | +9.59 | 258.1 | 175.9 | -82.2 | -31.8% |

### Editorial body length (chars of text in the JSON `sections` object)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N | 238 | 10.33 | 12.76 | +2.43 | 1666.5 | 563.7 | -1102.8 | -66.2% | 213 | 11.26 | 15.36 | +4.10 | 745.2 | 376.7 | -368.5 | -49.5% |
| JSON Y, body <5k chars | 33 | 9.37 | 10.04 | +0.67 | 99.9 | 59.3 | -40.6 | -40.6% | 35 | 7.90 | 12.60 | +4.71 | 70.0 | 55.1 | -14.9 | -21.3% |
| JSON Y, body >=15k | 37 | 15.50 | 30.20 | +14.70 | 300.5 | 145.4 | -155.1 | -51.6% | 35 | 25.20 | 37.91 | +12.71 | 173.8 | 115.4 | -58.5 | -33.6% |
| JSON Y, body 10k-15k | 3 | 13.01 | 16.85 | +3.84 | 26.3 | 9.9 | -16.5 | -62.6% | 3 | 14.54 | 22.66 | +8.12 | 14.3 | 5.5 | -8.8 | -61.5% |

### getDisplayFee today

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fee shown | 230 | 11.30 | 16.91 | +5.61 | 1750.2 | 634.1 | -1116.1 | -63.8% | 210 | 14.41 | 21.02 | +6.61 | 814.6 | 452.1 | -362.5 | -44.5% |
| fee suppressed | 81 | 9.86 | 11.28 | +1.42 | 343.0 | 144.2 | -198.8 | -58.0% | 76 | 9.52 | 14.68 | +5.16 | 188.8 | 100.5 | -88.3 | -46.8% |
| shown (rule 1) | 228 | 11.29 | 16.80 | +5.52 | 1735.1 | 631.7 | -1103.4 | -63.6% | 209 | 14.27 | 21.00 | +6.73 | 811.4 | 451.6 | -359.8 | -44.3% |
| suppressed (rule 4d) | 46 | 10.14 | 12.25 | +2.11 | 234.3 | 82.2 | -152.1 | -64.9% | 39 | 10.61 | 17.34 | +6.72 | 115.6 | 43.4 | -72.2 | -62.4% |
| suppressed (rule 4c) | 28 | 9.23 | 10.09 | +0.85 | 28.0 | 43.6 | +15.6 | 55.7% | 32 | 7.58 | 12.66 | +5.08 | 48.3 | 47.3 | -1.0 | -2.1% |
| suppressed (rule 4a) | 7 | 9.26 | 9.78 | +0.52 | 80.7 | 18.4 | -62.3 | -77.2% | 5 | 8.20 | 12.65 | +4.44 | 24.8 | 9.8 | -15.1 | -60.6% |
| shown (rule 2) | 1 | 13.17 | 49.11 | +35.94 | 9.6 | 1.8 | -7.8 | -81.1% | 1 | 50.03 | 43.20 | -6.83 | 3.2 | 0.5 | -2.7 | -84.9% |
| shown (rule 3) | 1 | 12.23 | 29.17 | +16.94 | 5.5 | 0.6 | -4.9 | -89.3% | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - |

### Robots (shouldIndexProgrammeHub) x sitemap

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| robots index, sitemap Y | 267 | 11.26 | 16.50 | +5.24 | 1867.8 | 703.3 | -1164.5 | -62.3% | 249 | 14.00 | 20.41 | +6.42 | 896.1 | 515.6 | -380.5 | -42.5% |
| robots noindex, sitemap Y | 44 | 9.42 | 9.89 | +0.48 | 225.4 | 74.9 | -150.5 | -66.8% | 37 | 9.25 | 12.30 | +3.05 | 107.3 | 37.1 | -70.2 | -65.5% |

### Cross-tab: JSON x fee x robots

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N / fee shown / index | 194 | 10.48 | 13.20 | +2.73 | 1441.0 | 488.7 | -952.3 | -66.1% | 176 | 11.60 | 15.70 | +4.10 | 637.9 | 339.6 | -298.3 | -46.8% |
| JSON N / fee suppressed / noindex | 44 | 9.42 | 9.89 | +0.48 | 225.4 | 74.9 | -150.5 | -66.8% | 37 | 9.25 | 12.30 | +3.05 | 107.3 | 37.1 | -70.2 | -65.5% |
| JSON Y / fee suppressed / index | 37 | 10.70 | 12.78 | +2.08 | 117.6 | 69.3 | -48.3 | -41.1% | 39 | 9.88 | 16.07 | +6.19 | 81.5 | 63.5 | -18.0 | -22.1% |
| JSON Y / fee shown / index | 36 | 15.13 | 29.36 | +14.24 | 309.2 | 145.3 | -163.8 | -53.0% | 34 | 24.55 | 37.09 | +12.54 | 176.7 | 112.5 | -64.2 | -36.3% |

### By programme

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MBA | 92 | 12.56 | 20.95 | +8.40 | 612.6 | 285.6 | -327.0 | -53.4% | 89 | 17.25 | 26.90 | +9.65 | 359.9 | 211.5 | -148.4 | -41.2% |
| BBA | 48 | 10.22 | 13.97 | +3.75 | 390.6 | 113.1 | -277.5 | -71.0% | 44 | 12.07 | 16.78 | +4.72 | 145.9 | 83.9 | -61.9 | -42.5% |
| MCA | 42 | 12.44 | 16.27 | +3.83 | 230.6 | 86.7 | -143.9 | -62.4% | 42 | 14.77 | 18.24 | +3.47 | 108.6 | 69.5 | -39.1 | -36.0% |
| BCA | 44 | 10.03 | 12.60 | +2.57 | 483.0 | 142.1 | -340.9 | -70.6% | 38 | 11.35 | 15.27 | +3.92 | 189.2 | 89.6 | -99.5 | -52.6% |
| B.Com | 35 | 9.58 | 10.32 | +0.74 | 206.8 | 64.5 | -142.3 | -68.8% | 33 | 9.60 | 11.65 | +2.05 | 85.7 | 44.0 | -41.7 | -48.6% |
| M.Com | 22 | 9.61 | 10.58 | +0.97 | 105.6 | 39.3 | -66.3 | -62.8% | 19 | 9.50 | 11.60 | +2.10 | 46.5 | 28.5 | -18.0 | -38.7% |
| MA | 11 | 10.57 | 12.37 | +1.79 | 34.2 | 21.0 | -13.2 | -38.6% | 11 | 8.90 | 18.22 | +9.31 | 31.1 | 14.1 | -16.9 | -54.5% |
| BA | 11 | 14.02 | 9.80 | -4.22 | 20.9 | 17.7 | -3.2 | -15.4% | 7 | 7.43 | 16.39 | +8.96 | 26.2 | 6.3 | -19.9 | -76.0% |
| MSc | 5 | 12.48 | 8.27 | -4.21 | 7.3 | 7.8 | +0.4 | 6.1% | 2 | 7.76 | 8.42 | +0.66 | 10.2 | 4.7 | -5.5 | -54.1% |
| BSc | 1 | 9.51 | 5.96 | -3.55 | 1.4 | 0.4 | -1.1 | -73.9% | 1 | 5.12 | 6.40 | +1.28 | 0.3 | 0.5 | +0.2 | 81.5% |

## Spec pages `/universities/<id>/<programme>/<spec>`

### All, by status today

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ALL specs in either export | 561 | 10.61 | 15.37 | +4.75 | 1422.1 | 746.8 | -675.3 | -47.5% | 482 | 13.40 | 20.03 | +6.63 | 915.9 | 625.8 | -290.1 | -31.7% |
| renders today | 487 | 10.66 | 15.04 | +4.38 | 1287.1 | 726.1 | -561.0 | -43.6% | 456 | 13.16 | 19.59 | +6.43 | 896.5 | 611.7 | -284.7 | -31.8% |
| 404 today (spec unresolved) | 45 | 9.15 | 9.05 | -0.10 | 75.8 | 8.3 | -67.6 | -89.1% | 15 | 11.80 | 12.76 | +0.95 | 8.9 | 2.6 | -6.3 | -70.4% |
| redirects today (alias) | 20 | 10.43 | 34.21 | +23.78 | 42.3 | 8.0 | -34.3 | -81.0% | 4 | 24.07 | 44.33 | +20.26 | 4.8 | 8.3 | +3.5 | 73.2% |
| uni-not-found | 7 | 51.41 | 46.96 | -4.44 | 2.1 | 4.4 | +2.3 | 107.0% | 7 | 45.96 | 48.72 | +2.76 | 5.7 | 3.1 | -2.6 | -45.1% |
| no-programDetails | 2 | 8.69 | - | - | 14.7 | 0.0 | -14.7 | -100.0% | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - |

Remaining spec tables cover the "renders today" rows only.

### Page-content JSON

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N | 395 | 9.98 | 13.58 | +3.60 | 924.2 | 564.6 | -359.6 | -38.9% | 368 | 11.80 | 18.42 | +6.62 | 697.2 | 476.5 | -220.7 | -31.7% |
| JSON Y | 92 | 12.39 | 20.13 | +7.74 | 363.0 | 161.6 | -201.4 | -55.5% | 88 | 17.90 | 23.68 | +5.79 | 199.3 | 135.3 | -64.0 | -32.1% |

### Editorial body length (chars of text in the JSON `sections` object)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N | 395 | 9.98 | 13.58 | +3.60 | 924.2 | 564.6 | -359.6 | -38.9% | 368 | 11.80 | 18.42 | +6.62 | 697.2 | 476.5 | -220.7 | -31.7% |
| JSON Y, body >=15k | 1 | 9.76 | 9.62 | -0.14 | 2.7 | 2.6 | -0.1 | -3.2% | 1 | 9.52 | 9.76 | +0.24 | 3.1 | 2.2 | -1.0 | -31.0% |
| JSON Y, body 10k-15k | 72 | 12.34 | 19.87 | +7.54 | 320.0 | 136.5 | -183.6 | -57.4% | 72 | 17.49 | 22.96 | +5.47 | 167.1 | 117.7 | -49.5 | -29.6% |
| JSON Y, body 5k-10k | 19 | 12.98 | 22.92 | +9.94 | 40.2 | 22.4 | -17.7 | -44.2% | 15 | 21.15 | 31.13 | +9.98 | 29.0 | 15.5 | -13.5 | -46.7% |

### getDisplayFee today (parent programme fee)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fee shown | 315 | 10.91 | 15.59 | +4.69 | 864.1 | 453.8 | -410.3 | -47.5% | 292 | 13.73 | 20.78 | +7.05 | 583.0 | 359.4 | -223.6 | -38.4% |
| fee suppressed | 172 | 10.16 | 14.11 | +3.96 | 423.0 | 272.4 | -150.7 | -35.6% | 164 | 12.09 | 17.88 | +5.80 | 313.5 | 252.4 | -61.1 | -19.5% |
| shown (rule 1) | 311 | 10.91 | 15.55 | +4.64 | 859.3 | 452.9 | -406.4 | -47.3% | 291 | 13.59 | 20.79 | +7.19 | 580.3 | 359.1 | -221.3 | -38.1% |
| suppressed (rule 4d) | 138 | 10.22 | 14.31 | +4.09 | 385.3 | 235.0 | -150.3 | -39.0% | 125 | 12.50 | 17.05 | +4.55 | 253.0 | 219.7 | -33.3 | -13.2% |
| suppressed (rule 4c) | 21 | 10.20 | 13.88 | +3.67 | 10.9 | 25.6 | +14.7 | 134.9% | 31 | 10.16 | 25.40 | +15.24 | 48.7 | 26.7 | -22.0 | -45.2% |
| suppressed (rule 4a) | 13 | 9.21 | 10.65 | +1.45 | 26.8 | 11.8 | -15.0 | -56.0% | 8 | 11.23 | 14.96 | +3.74 | 11.8 | 6.0 | -5.8 | -49.2% |
| shown (rule 3) | 4 | 10.17 | 38.06 | +27.89 | 4.8 | 0.9 | -3.9 | -82.1% | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - |
| shown (rule 2) | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - | 1 | 44.19 | 17.44 | -26.75 | 2.6 | 0.3 | -2.3 | -89.0% |

### Robots (spec route: shouldIndexUniversity) x sitemap

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| robots index, sitemap Y | 487 | 10.66 | 15.04 | +4.38 | 1287.1 | 726.1 | -561.0 | -43.6% | 455 | 13.15 | 19.55 | +6.40 | 895.8 | 610.9 | -284.9 | -31.8% |
| robots index, sitemap N | 0 | - | - | - | 0.0 | 0.0 | +0.0 | - | 1 | 18.40 | 42.81 | +24.41 | 0.7 | 0.9 | +0.2 | 30.6% |

### Cross-tab: JSON x fee x robots

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| JSON N / fee shown / index | 226 | 9.88 | 13.11 | +3.23 | 505.7 | 294.7 | -211.0 | -41.7% | 206 | 11.58 | 19.06 | +7.48 | 386.3 | 225.9 | -160.4 | -41.5% |
| JSON N / fee suppressed / index | 169 | 10.10 | 14.09 | +4.00 | 418.4 | 269.9 | -148.5 | -35.5% | 162 | 12.08 | 17.85 | +5.77 | 310.9 | 250.5 | -60.3 | -19.4% |
| JSON Y / fee shown / index | 89 | 12.35 | 20.19 | +7.84 | 358.3 | 159.1 | -199.3 | -55.6% | 86 | 17.96 | 23.69 | +5.74 | 196.6 | 133.5 | -63.2 | -32.1% |
| JSON Y / fee suppressed / index | 3 | 15.39 | 16.03 | +0.64 | 4.6 | 2.5 | -2.1 | -46.3% | 2 | 13.27 | 22.96 | +9.70 | 2.6 | 1.8 | -0.8 | -30.2% |

### By programme

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| MBA | 212 | 11.34 | 16.44 | +5.10 | 593.7 | 321.5 | -272.2 | -45.9% | 208 | 14.21 | 21.82 | +7.61 | 407.1 | 271.0 | -136.1 | -33.4% |
| MA | 86 | 10.17 | 13.16 | +2.98 | 347.2 | 222.1 | -125.1 | -36.0% | 82 | 11.49 | 15.06 | +3.57 | 260.8 | 187.3 | -73.5 | -28.2% |
| BA | 48 | 8.32 | 15.01 | +6.69 | 90.1 | 46.4 | -43.7 | -48.5% | 39 | 11.14 | 21.79 | +10.65 | 41.9 | 44.1 | +2.2 | 5.2% |
| BBA | 41 | 8.75 | 9.29 | +0.54 | 72.6 | 36.1 | -36.5 | -50.3% | 30 | 9.31 | 12.44 | +3.12 | 45.2 | 21.2 | -24.0 | -53.1% |
| MCA | 35 | 11.47 | 16.99 | +5.52 | 82.2 | 32.3 | -50.0 | -60.8% | 36 | 13.57 | 30.36 | +16.79 | 52.2 | 29.2 | -23.0 | -44.1% |
| M.Com | 25 | 12.58 | 15.84 | +3.26 | 18.3 | 15.5 | -2.8 | -15.4% | 20 | 17.34 | 13.22 | -4.13 | 18.5 | 13.9 | -4.6 | -24.8% |
| BCA | 15 | 9.87 | 12.38 | +2.51 | 36.4 | 21.1 | -15.3 | -41.9% | 15 | 13.40 | 16.80 | +3.40 | 29.7 | 16.8 | -12.9 | -43.5% |
| B.Com | 15 | 8.47 | 23.61 | +15.14 | 24.9 | 11.7 | -13.2 | -53.0% | 14 | 21.70 | 27.37 | +5.67 | 15.3 | 10.3 | -5.0 | -32.5% |
| MSc | 8 | 17.16 | 19.45 | +2.29 | 14.7 | 15.4 | +0.7 | 4.6% | 10 | 15.39 | 22.72 | +7.33 | 20.7 | 14.9 | -5.8 | -28.0% |
| BSc | 2 | 10.83 | 12.32 | +1.49 | 7.0 | 4.1 | -2.9 | -41.8% | 2 | 9.35 | 17.02 | +7.67 | 5.1 | 3.1 | -2.0 | -38.9% |

## Control group: review blogs in lib/blog.ts

### Review blogs (slug or category contains "review")

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ALL review blogs | 57 | 7.71 | 7.86 | +0.15 | 3152.0 | 1742.1 | -1409.9 | -44.7% | 58 | 7.80 | 8.03 | +0.23 | 2263.3 | 1240.0 | -1023.3 | -45.2% |
| status published, sitemap Y | 57 | 7.71 | 7.86 | +0.15 | 3152.0 | 1742.1 | -1409.9 | -44.7% | 58 | 7.80 | 8.03 | +0.23 | 2263.3 | 1240.0 | -1023.3 | -45.2% |

## 20 hubs with the largest position loss

| # | URL | Pos May-Aug | Pos Sep-Oct | Δ | Impr/day May-Aug | Impr/day Sep-Oct | Pos Sep | Pos Oct | Impr Sep | Impr Oct | JSON | Body chars | Fee | Robots | Sitemap | Status |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|---|---|---|
| 1 | /universities/amity-university-online/bba | 18.40 | 63.52 | +45.12 | 11.5 | 1.4 | 62.18 | 65.97 | 55 | 30 | N | 0 | shown (rule 1) | index | Y | renders today |
| 2 | /universities/symbiosis-university-online/mba | 12.28 | 49.51 | +37.23 | 18.0 | 6.9 | 41.12 | 61.37 | 246 | 174 | Y | 21798 | shown (rule 1) | index | Y | renders today |
| 3 | /universities/amity-university-online/mba | 24.38 | 60.41 | +36.03 | 6.9 | 8.9 | 56.24 | 62.69 | 192 | 350 | Y | 17876 | shown (rule 1) | index | Y | renders today |
| 4 | /universities/jain-university-online/mca | 13.17 | 49.11 | +35.94 | 9.6 | 1.8 | 50.03 | 43.20 | 96 | 15 | N | 0 | shown (rule 2) | index | Y | renders today |
| 5 | /universities/ignou-online/mba | 11.85 | 44.74 | +32.89 | 5.9 | 4.4 | 28.86 | 57.59 | 119 | 147 | Y | 18424 | shown (rule 1) | index | Y | renders today |
| 6 | /universities/nmims-online/bba | 12.98 | 45.07 | +32.09 | 7.6 | 1.1 | 36.82 | 50.71 | 28 | 41 | N | 0 | shown (rule 1) | index | Y | renders today |
| 7 | /universities/amity-university-online/bca | 15.80 | 44.14 | +28.34 | 11.7 | 2.5 | 39.97 | 51.42 | 96 | 55 | N | 0 | shown (rule 1) | index | Y | renders today |
| 8 | /universities/jain-university-online/mba | 25.24 | 50.79 | +25.55 | 9.9 | 5.2 | 44.65 | 56.91 | 158 | 159 | Y | 19742 | shown (rule 1) | index | Y | renders today |
| 9 | /universities/university-of-madras-online/mba | 20.63 | 45.30 | +24.67 | 4.5 | 1.9 | 42.91 | 50.13 | 79 | 39 | Y | 17433 | shown (rule 1) | index | Y | renders today |
| 10 | /universities/nmims-online/mba | 19.08 | 43.71 | +24.63 | 7.7 | 7.5 | 37.36 | 49.33 | 216 | 244 | Y | 18389 | shown (rule 1) | index | Y | renders today |
| 11 | /universities/ignou-online/mcom | 13.72 | 34.96 | +21.24 | 7.7 | 2.0 | 30.19 | 40.98 | 67 | 53 | N | 0 | shown (rule 1) | index | Y | renders today |
| 12 | /universities/amrita-vishwa-vidyapeetham-online/mba | 16.93 | 37.38 | +20.45 | 6.5 | 1.2 | 35.73 | 40.75 | 49 | 24 | Y | 14877 | shown (rule 1) | index | Y | renders today |
| 13 | /universities/christ-university-online/bba | 10.78 | 31.01 | +20.23 | 2.8 | 2.6 | 24.49 | 36.96 | 75 | 82 | N | 0 | shown (rule 1) | index | Y | renders today |
| 14 | /universities/vit-university-online/mba | 12.61 | 32.77 | +20.16 | 8.4 | 2.8 | 32.61 | 33.23 | 124 | 44 | Y | 16001 | shown (rule 1) | index | Y | renders today |
| 15 | /universities/lovely-professional-university-online/mba | 37.81 | 56.83 | +19.02 | 6.1 | 6.0 | 53.73 | 61.47 | 221 | 148 | Y | 18159 | shown (rule 1) | index | Y | renders today |
| 16 | /universities/dr-dy-patil-vidyapeeth-online/mca | 19.67 | 37.89 | +18.22 | 2.6 | 1.8 | 33.83 | 45.57 | 70 | 37 | N | 0 | shown (rule 1) | index | Y | renders today |
| 17 | /universities/university-of-kerala-online/mba | 18.95 | 36.57 | +17.62 | 2.3 | 0.9 | 26.74 | 54.16 | 34 | 19 | N | 0 | suppressed (rule 4d) | noindex | Y | renders today |
| 18 | /universities/amity-university-online/mca | 38.27 | 55.87 | +17.60 | 0.8 | 1.7 | 53.10 | 59.93 | 63 | 43 | N | 0 | shown (rule 1) | index | Y | renders today |
| 19 | /universities/chitkara-university-online/mba | 12.20 | 29.51 | +17.31 | 11.3 | 1.3 | 26.19 | 34.33 | 48 | 33 | Y | 18105 | shown (rule 1) | index | Y | renders today |
| 20 | /universities/dy-patil-university-online/mba | 12.77 | 29.69 | +16.92 | 8.2 | 3.5 | 26.01 | 34.64 | 124 | 92 | Y | 18439 | shown (rule 1) | index | Y | renders today |

Filter: at least 50 impressions in both 18 May-31 Aug and Sep-Oct. Ranked by position change, Sep-Oct minus May-Aug (positive = lower ranking).

## 20 spec pages with the largest position loss

| # | URL | Pos May-Aug | Pos Sep-Oct | Δ | Impr/day May-Aug | Impr/day Sep-Oct | Pos Sep | Pos Oct | Impr Sep | Impr Oct | JSON | Body chars | Fee | Robots | Sitemap | Status |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|---|---|---|
| 1 | /universities/maharshi-dayanand-university-online/ba/economics | 8.50 | 69.18 | +60.68 | 2.0 | 3.4 | 50.95 | 76.79 | 61 | 146 | N | 0 | suppressed (rule 4d) | index | Y | renders today |
| 2 | /universities/symbiosis-university-online/mba/logistics-and-supply-chain-management | 7.76 | 46.79 | +39.03 | 5.1 | 4.0 | 39.18 | 57.12 | 141 | 104 | Y | 13158 | shown (rule 1) | index | Y | renders today |
| 3 | /universities/hindustan-institute-technology-online/mca/cyber-security-cloud-computing | 17.54 | 56.47 | +38.93 | 0.8 | 2.2 | 15.22 | 72.36 | 37 | 96 | N | 0 | suppressed (rule 4c) | index | Y | renders today |
| 4 | /universities/bangalore-university-online/ma/political-science | 8.15 | 45.80 | +37.65 | 2.8 | 1.6 | 13.98 | 79.70 | 49 | 46 | N | 0 | suppressed (rule 4d) | index | Y | renders today |
| 5 | /universities/symbiosis-university-online/mba/operations | 7.51 | 39.75 | +32.24 | 1.6 | 1.0 | 43.65 | 34.41 | 37 | 27 | Y | 12716 | shown (rule 1) | index | Y | renders today |
| 6 | /universities/university-of-mumbai-online/ma/english | 12.73 | 44.96 | +32.23 | 4.5 | 1.7 | 35.63 | 50.85 | 41 | 65 | N | 0 | suppressed (rule 4d) | index | Y | renders today |
| 7 | /universities/bharati-vidyapeeth-university-online/mba/agribusiness | 12.20 | 44.24 | +32.04 | 3.3 | 1.1 | 47.26 | 5.00 | 65 | 5 | Y | 9225 | shown (rule 1) | index | Y | renders today |
| 8 | /universities/jain-university-online/mcom/international-finance-accounting-acca | 17.48 | 45.27 | +27.79 | 2.4 | 2.5 | 49.13 | 25.00 | 126 | 24 | N | 0 | shown (rule 1) | index | Y | renders today |
| 9 | /universities/bits-pilani-work-integrated-online/mba/finance | 14.52 | 38.92 | +24.40 | 4.7 | 1.1 | 34.91 | 43.06 | 33 | 32 | Y | 12298 | shown (rule 1) | index | Y | renders today |
| 10 | /universities/amity-university-online/mba/insurance-management | 27.09 | 50.04 | +22.95 | 1.1 | 1.8 | 46.51 | 57.00 | 71 | 36 | Y | 9412 | shown (rule 1) | index | Y | renders today |
| 11 | /universities/upes-online/mba/oil-and-gas-management | 23.00 | 44.90 | +21.90 | 3.3 | 2.2 | 36.53 | 57.46 | 81 | 54 | Y | 12785 | shown (rule 1) | index | Y | renders today |
| 12 | /universities/bharath-university-online/ba/journalism-mass-communication | 34.16 | 55.67 | +21.51 | 1.7 | 2.5 | 25.91 | 60.63 | 22 | 132 | N | 0 | suppressed (rule 4d) | index | Y | renders today |
| 13 | /universities/university-of-madras-online/mba/operations | 7.16 | 27.46 | +20.30 | 1.5 | 1.7 | 6.00 | 37.16 | 33 | 73 | N | 0 | shown (rule 1) | index | Y | renders today |
| 14 | /universities/manipal-university-jaipur-online/mba/finance | 9.57 | 29.38 | +19.81 | 4.0 | 1.0 | 26.57 | 39.54 | 47 | 13 | Y | 12479 | shown (rule 1) | index | Y | renders today |
| 15 | /universities/bits-pilani-work-integrated-online/mba/fintech | 13.99 | 33.42 | +19.43 | 4.3 | 0.9 | - | - | 0 | 0 | Y | 13104 | shown (rule 1) | index | Y | renders today |
| 16 | /universities/bharati-vidyapeeth-university-online/mba/sports | 7.28 | 24.30 | +17.02 | 3.4 | 3.7 | 18.98 | 31.41 | 130 | 97 | Y | 10385 | shown (rule 1) | index | Y | renders today |
| 17 | /universities/bangalore-university-online/ma/sociology | 8.15 | 24.89 | +16.74 | 2.1 | 1.0 | 7.21 | 44.93 | 34 | 30 | N | 0 | suppressed (rule 4d) | index | Y | renders today |
| 18 | /universities/ignou-online/ma/distance-education | 25.26 | 41.96 | +16.70 | 3.0 | 1.6 | 32.10 | 49.49 | 42 | 55 | N | 0 | shown (rule 1) | index | Y | renders today |
| 19 | /universities/dr-dy-patil-vidyapeeth-online/mba/hospital-administration-healthcare-management | 11.15 | 27.45 | +16.30 | 4.0 | 2.8 | 23.72 | 36.62 | 123 | 50 | Y | 12016 | shown (rule 1) | index | Y | renders today |
| 20 | /universities/iiit-bangalore-online/mba/general-management | 11.80 | 27.03 | +15.23 | 1.1 | 1.2 | 24.97 | 28.73 | 33 | 40 | N | 0 | suppressed (rule 4d) | index | Y | renders today |

Filter: at least 50 impressions in both 18 May-31 Aug and Sep-Oct. Ranked by position change, Sep-Oct minus May-Aug (positive = lower ranking).


---

# Follow-up run, 2026-11-05 (second pass)

Same inputs, same tagging script (extended to record each page's JSON path), same column definitions as above. Tags are still computed from the working tree.

## 1. Page-content JSON history (JSON Y pages that render today)

Change measure per commit: sections text (every string under `sections`, joined) compared with the previous parseable version by a character-weighted word LCS; change = 1 - 2 x matched chars / (old chars + new chars). History via `git log --follow`.

Detector check: synthetic inputs score 0 (identical), 0.5 (half the words replaced) and 1 (all replaced).

| Count | Value |
|---|---:|
| JSON Y pages that render today | 185 (80 hubs, 105 specs) |
| Distinct JSON files | 185 |
| Pages with a commit changing sections text by >20% | 0 |
| Largest single-commit change on any of these files | 19.9% |
| Files with a largest change of 15-20% | 11 |
| Commits where the JSON did not parse | 11 |

Because no commit crossed 20%, "created or last rewritten" equals the creation date for every page.

### JSON Y hubs by month the JSON was created or last rewritten (>20%)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| before 1 Aug | 40 | 15.30 | 29.35 | +14.06 | 326.8 | 155.3 | -171.6 | -52.5% | 38 | 24.39 | 37.21 | +12.82 | 188.2 | 120.9 | -67.3 | -35.8% |
| Aug | 33 | 9.37 | 10.04 | +0.67 | 99.9 | 59.3 | -40.6 | -40.6% | 35 | 7.90 | 12.60 | +4.71 | 70.0 | 55.1 | -14.9 | -21.3% |

### Supplementary: JSON Y hubs by month of the last commit touching the JSON (any size)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Aug | 13 | 9.39 | 9.17 | -0.21 | 98.8 | 25.4 | -73.4 | -74.3% | 8 | 8.09 | 10.39 | +2.31 | 32.1 | 14.0 | -18.1 | -56.4% |
| Oct | 20 | 7.87 | 10.69 | +2.82 | 1.1 | 33.9 | +32.8 | 2945.4% | 27 | 7.74 | 13.36 | +5.62 | 37.9 | 41.1 | +3.2 | 8.4% |
| Nov | 40 | 15.30 | 29.35 | +14.06 | 326.8 | 155.3 | -171.6 | -52.5% | 38 | 24.39 | 37.21 | +12.82 | 188.2 | 120.9 | -67.3 | -35.8% |

### Supplementary: JSON Y spec pages by month the JSON was created or last rewritten (>20%)

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| before 1 Aug | 92 | 12.39 | 20.13 | +7.74 | 363.0 | 161.6 | -201.4 | -55.5% | 88 | 17.90 | 23.68 | +5.79 | 199.3 | 135.3 | -64.0 | -32.1% |

### Per-page JSON history

| Kind | URL | Created | Created hash | Commits | Rewrites >20% (date, hash, %) | Largest change (%, date, hash) | Last commit (date, hash) |
|---|---|---|---|---:|---|---|---|
| hub | /universities/amity-university-online/mba | 2026-04-20 | aeb8c88 | 13 | none | 4.4%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/amrita-vishwa-vidyapeetham-online/mba | 2026-04-20 | 144d45b | 13 | none | 9.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/chandigarh-university-online/mba | 2026-04-20 | 144d45b | 14 | none | 8.9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/dr-dy-patil-vidyapeeth-online/mba | 2026-04-20 | aeb8c88 | 10 | none | 4.1%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/dr-mgr-educational-research-institute-online/mba | 2026-04-20 | 04c64c1 | 6 | none | 8.7%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/galgotias-university-online/mba | 2026-04-20 | 144d45b | 13 | none | 8.9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/ignou-online/mba | 2026-04-20 | aeb8c88 | 8 | none | 5%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/jain-university-online/mba | 2026-04-20 | aeb8c88 | 10 | none | 5.7%, 2026-08-13, 1a28caf | 2026-11-05, c9b0c94 |
| hub | /universities/jaypee-university-online/mba | 2026-04-20 | 04c64c1 | 9 | none | 9.1%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/kurukshetra-university-online/mba | 2026-04-20 | 04c64c1 | 8 | none | 9.2%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/lovely-professional-university-online/mba | 2026-04-20 | aeb8c88 | 8 | none | 5.2%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/manipal-academy-higher-education-online/mba | 2026-04-20 | 144d45b | 13 | none | 9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/manipal-university-jaipur-online/mba | 2026-04-20 | aeb8c88 | 10 | none | 5.4%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/nmims-online/mba | 2026-04-20 | aeb8c88 | 13 | none | 4.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/shoolini-university-online/mba | 2026-04-20 | 144d45b | 16 | none | 8.2%, 2026-09-17, 9490291 | 2026-11-05, bd113d6 |
| hub | /universities/sikkim-manipal-university-online/mba | 2026-04-20 | 144d45b | 12 | none | 8.9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/symbiosis-university-online/mba | 2026-04-20 | aeb8c88 | 11 | none | 4.6%, 2026-08-13, 1a28caf | 2026-11-05, c9b0c94 |
| hub | /universities/upes-online/mba | 2026-04-20 | aeb8c88 | 14 | none | 4.7%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/uttaranchal-university-online/mba | 2026-04-20 | 04c64c1 | 7 | none | 9.9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/vignan-university-online/mba | 2026-04-20 | 04c64c1 | 8 | none | 8.8%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/aligarh-muslim-university-online/mba | 2026-04-21 | 5a79a7f | 7 | none | 6.1%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/alliance-university-online/mba | 2026-04-21 | 8c212ee | 10 | none | 7.4%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/andhra-university-online/mba | 2026-04-21 | f07222f | 4 | none | 6%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/arka-jain-university-online/mba | 2026-04-21 | 8c212ee | 9 | none | 7%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/assam-don-bosco-university-online/mba | 2026-04-21 | bcd942a | 5 | none | 8.1%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/bharati-vidyapeeth-university-online/mba | 2026-04-21 | 8c212ee | 9 | none | 7.8%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/bits-pilani-work-integrated-online/mba | 2026-04-21 | 5a79a7f | 6 | none | 6.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/chitkara-university-online/mba | 2026-04-21 | 8c212ee | 8 | none | 9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/dayananda-sagar-university-online/mba | 2026-04-21 | 8c212ee | 11 | none | 8.7%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/devi-ahilya-vishwavidyalaya-online/mba | 2026-04-21 | f07222f | 5 | none | 6.2%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/dy-patil-university-online/mba | 2026-04-21 | 8c212ee | 6 | none | 8.8%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/jamia-hamdard-online/mba | 2026-04-21 | 5a79a7f | 5 | none | 6.2%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/jamia-millia-islamia-online/mba | 2026-04-21 | bcd942a | 4 | none | 9.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/mahatma-gandhi-university-online/mba | 2026-04-21 | f07222f | 5 | none | 6.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/sastra-university-online/mba | 2026-04-21 | bcd942a | 7 | none | 9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/shiv-nadar-university-online/mba | 2026-04-21 | 5a79a7f | 4 | none | 6%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/srm-institute-science-technology-online/mba | 2026-04-21 | bcd942a | 5 | none | 9%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/srm-university-sikkim-online/mba | 2026-04-21 | f07222f | 5 | none | 6.9%, 2026-09-14, 864ea99 | 2026-11-05, c9b0c94 |
| hub | /universities/university-of-madras-online/mba | 2026-04-21 | 5a79a7f | 4 | none | 5.8%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/vit-university-online/mba | 2026-04-21 | bcd942a | 5 | none | 8.3%, 2026-09-17, 9490291 | 2026-11-05, c9b0c94 |
| hub | /universities/assam-don-bosco-university-online/bba | 2026-08-24 | 1aa88f4 | 1 | none | - | 2026-08-24, 1aa88f4 |
| hub | /universities/gls-university-online/bba | 2026-08-24 | 1aa88f4 | 1 | none | - | 2026-08-24, 1aa88f4 |
| hub | /universities/gls-university-online/bca | 2026-08-24 | 1aa88f4 | 1 | none | - | 2026-08-24, 1aa88f4 |
| hub | /universities/gls-university-online/bcom | 2026-08-24 | 1aa88f4 | 1 | none | - | 2026-08-24, 1aa88f4 |
| hub | /universities/iift-online/mba | 2026-08-24 | 1aa88f4 | 1 | none | - | 2026-08-24, 1aa88f4 |
| hub | /universities/assam-don-bosco-university-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/bs-abdur-rahman-university-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/centurion-university-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/graphic-era-university-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/hindustan-institute-technology-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/mats-university-online/mca | 2026-08-26 | a994fd7 | 2 | none | 4.9%, 2026-10-26, 8f346c1 | 2026-10-26, 8f346c1 |
| hub | /universities/university-of-mysore-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/upes-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/vtu-online/mca | 2026-08-26 | a994fd7 | 1 | none | - | 2026-08-26, a994fd7 |
| hub | /universities/ajeenkya-dy-patil-university-online/bca | 2026-08-29 | 39f4090 | 2 | none | 8.3%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/bennett-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 9.3%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/bml-munjal-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/central-university-tamil-nadu-online/ma | 2026-08-29 | 39f4090 | 2 | none | 9.3%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/central-university-tamil-nadu-online/mba | 2026-08-29 | 39f4090 | 2 | none | 9%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/central-university-tamil-nadu-online/mcom | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-open-university-online/ma | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-university-online/bba | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-university-online/bca | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-university-online/ma | 2026-08-29 | 39f4090 | 2 | none | 9.4%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/dr-br-ambedkar-university-online/mca | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/pt-sundarlal-sharma-open-university-online/ba | 2026-08-29 | 39f4090 | 2 | none | 8.9%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/pt-sundarlal-sharma-open-university-online/ma | 2026-08-29 | 39f4090 | 2 | none | 8.7%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/pt-sundarlal-sharma-open-university-online/msc | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/sandip-university-online/bba | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/saveetha-university-online/bcom | 2026-08-29 | 39f4090 | 2 | none | 8.6%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/silver-oak-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/sri-venkateswara-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/sri-venkateswara-university-online/mca | 2026-08-29 | 39f4090 | 2 | none | 9.1%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/sri-venkateswara-university-online/mcom | 2026-08-29 | 39f4090 | 2 | none | 9.2%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/srinivas-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/st-aloysius-university-online/mba | 2026-08-29 | 39f4090 | 2 | none | 8.9%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/st-aloysius-university-online/mca | 2026-08-29 | 39f4090 | 2 | none | 8.2%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/swami-rama-himalayan-university-online/bca | 2026-08-29 | 39f4090 | 2 | none | 8.5%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| hub | /universities/university-of-calicut-online/mba | 2026-08-29 | 39f4090 | 2 | none | 9.3%, 2026-10-29, 5989f85 | 2026-10-29, 5989f85 |
| spec | /universities/amity-university-online/mba/hospitality-management | 2026-04-21 | 60103b0 | 7 | none | 13.6%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/amity-university-online/mba/insurance-management | 2026-04-21 | 60103b0 | 7 | none | 13.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/lovely-professional-university-online/mba/healthcare-management | 2026-04-21 | 68d0eba | 6 | none | 9.7%, 2026-09-17, 9490291 | 2026-10-30, 775469e |
| spec | /universities/manipal-university-jaipur-online/mba/analytics-and-data-science | 2026-04-21 | 89590ca | 5 | none | 11.1%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-university-jaipur-online/mba/bfsi-banking-financial-services-and-insurance | 2026-04-21 | 89590ca | 6 | none | 11.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-university-jaipur-online/mba/finance | 2026-04-21 | 89590ca | 5 | none | 10.9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-university-jaipur-online/mba/information-system-management | 2026-04-21 | 89590ca | 5 | none | 11.2%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-university-jaipur-online/mba/international-business | 2026-04-21 | 89590ca | 5 | none | 11.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/nmims-online/mba/operations-and-data-sciences-management | 2026-04-21 | 1ac026a | 7 | none | 13.6%, 2026-04-21, 52d826c | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/business-analytics | 2026-04-21 | 3269739 | 10 | none | 17.7%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/finance | 2026-04-21 | 3269739 | 10 | none | 16.4%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/hospital-and-health-care-management | 2026-04-21 | 3269739 | 9 | none | 17.5%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/international-business | 2026-04-21 | 3269739 | 10 | none | 16%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/logistics-and-supply-chain-management | 2026-04-21 | 3269739 | 10 | none | 16.6%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/marketing | 2026-04-21 | 3269739 | 10 | none | 18.5%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/symbiosis-university-online/mba/operations | 2026-04-21 | 3269739 | 10 | none | 16%, 2026-09-17, 6dcb0ac | 2026-10-29, 5989f85 |
| spec | /universities/amrita-vishwa-vidyapeetham-online/mba/artificial-intelligence | 2026-04-22 | 4e8409d | 6 | none | 11%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/amrita-vishwa-vidyapeetham-online/mba/business-analytics | 2026-04-22 | 4e8409d | 6 | none | 11.6%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/amrita-vishwa-vidyapeetham-online/mba/finance | 2026-04-22 | 4e8409d | 6 | none | 11.8%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chandigarh-university-online/mba/airlines-and-airport-management | 2026-04-22 | e1cafce | 10 | none | 19.4%, 2026-09-17, 75841a0 | 2026-11-04, 9eea6da |
| spec | /universities/chandigarh-university-online/mba/digital-marketing | 2026-04-22 | e1cafce | 9 | none | 19.2%, 2026-09-17, 75841a0 | 2026-11-04, 9eea6da |
| spec | /universities/chandigarh-university-online/mba/fintech | 2026-04-22 | e1cafce | 10 | none | 19.1%, 2026-09-17, 75841a0 | 2026-11-04, 9eea6da |
| spec | /universities/chandigarh-university-online/mba/hospital-management | 2026-04-22 | e1cafce | 10 | none | 19.9%, 2026-09-17, 75841a0 | 2026-11-04, 9eea6da |
| spec | /universities/dr-dy-patil-vidyapeeth-online/mba/artificial-intelligence-machine-learning | 2026-04-22 | 3fc3cb4 | 5 | none | 10.5%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/dr-dy-patil-vidyapeeth-online/mba/hospital-administration-healthcare-management | 2026-04-22 | 3fc3cb4 | 5 | none | 10.2%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/dr-dy-patil-vidyapeeth-online/mba/project-management | 2026-04-22 | 3fc3cb4 | 5 | none | 10%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/ignou-online/mba/services-management | 2026-04-22 | 40c19b9 | 4 | none | 9.2%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/ai-for-finance | 2026-04-22 | 27dcafe | 6 | none | 8.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/ai-for-international-finance | 2026-04-22 | 27dcafe | 6 | none | 8.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/data-science-and-artificial-intelligence | 2026-04-22 | 27dcafe | 6 | none | 9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/digital-marketing-and-e-commerce | 2026-04-22 | 27dcafe | 6 | none | 8.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/finance | 2026-04-22 | 27dcafe | 7 | none | 8.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/finance-business-analytics | 2026-04-22 | 27dcafe | 6 | none | 8.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/finance-marketing | 2026-04-22 | 27dcafe | 6 | none | 8.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/general-management | 2026-04-22 | 27dcafe | 9 | none | 8.5%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/jain-university-online/mba/human-resource-management-finance | 2026-04-22 | 27dcafe | 6 | none | 8.9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/international-finance-acca | 2026-04-22 | 27dcafe | 6 | none | 8.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/jain-university-online/mba/marketing-human-resource-management | 2026-04-22 | 27dcafe | 6 | none | 8.9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-academy-higher-education-online/mba/finance | 2026-04-22 | d76ce43 | 5 | none | 11.1%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-academy-higher-education-online/mba/healthcare-management | 2026-04-22 | 08d46ce | 6 | none | 10.9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/manipal-academy-higher-education-online/mba/pharmaceutical-management | 2026-04-22 | 08d46ce | 5 | none | 11%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/agri-business-management | 2026-04-22 | 689d3fc | 6 | none | 11.6%, 2026-04-22, 8b0b511 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/direct-selling-management | 2026-04-22 | 689d3fc | 5 | none | 10.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/finance | 2026-04-22 | 689d3fc | 7 | none | 12.6%, 2026-04-22, 8b0b511 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/food-technology-management | 2026-04-22 | 689d3fc | 6 | none | 11.4%, 2026-04-22, 8b0b511 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/real-estate-management | 2026-04-22 | 689d3fc | 6 | none | 11.5%, 2026-04-22, 8b0b511 | 2026-10-29, 5989f85 |
| spec | /universities/shoolini-university-online/mba/tourism-management | 2026-04-22 | 689d3fc | 8 | none | 11.9%, 2026-04-22, 8b0b511 | 2026-11-04, 9eea6da |
| spec | /universities/sikkim-manipal-university-online/mba/healthcare | 2026-04-22 | f85ec28 | 5 | none | 11.3%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/sikkim-manipal-university-online/mba/human-resources | 2026-04-22 | f85ec28 | 4 | none | 11.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/sikkim-manipal-university-online/mba/operations-supply-chain-management | 2026-04-22 | f85ec28 | 4 | none | 11.6%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/upes-online/mba/business-analytics | 2026-04-22 | 86c487c | 4 | none | 9.9%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/upes-online/mba/infrastructure-management | 2026-04-22 | 86c487c | 3 | none | 9.3%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/upes-online/mba/oil-and-gas-management | 2026-04-22 | 86c487c | 3 | none | 9.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/alliance-university-online/mba/business-analytics-ai | 2026-04-23 | 01e6336 | 8 | none | 8.5%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/alliance-university-online/mba/marketing | 2026-04-23 | 01e6336 | 8 | none | 8.6%, 2026-09-17, 9490291 | 2026-10-30, 775469e |
| spec | /universities/amet-university-online/mba/shipping-logistics | 2026-04-23 | c3b94ec | 3 | none | 11.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/arka-jain-university-online/mba/finance | 2026-04-23 | ae89abb | 6 | none | 9.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/assam-don-bosco-university-online/mba/project-management | 2026-04-23 | 3d63e5f | 5 | none | 11.2%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/assam-don-bosco-university-online/mba/supply-chain-management | 2026-04-23 | 3d63e5f | 5 | none | 10.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/agribusiness | 2026-04-23 | 21edadd | 6 | none | 11%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/business-analytics | 2026-04-23 | 21edadd | 7 | none | 10.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/event-management | 2026-04-23 | 21edadd | 4 | none | 10.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/hospitality | 2026-04-23 | 21edadd | 5 | none | 10.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/infrastructure | 2026-04-23 | 21edadd | 6 | none | 11.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bharati-vidyapeeth-university-online/mba/sports | 2026-04-23 | 21edadd | 6 | none | 11.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bits-pilani-work-integrated-online/mba/ai-for-business | 2026-04-23 | 0a021ff | 8 | none | 10.6%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/business-analytics | 2026-04-23 | 0a021ff | 6 | none | 9%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/digital-transformation | 2026-04-23 | 0a021ff | 8 | none | 8.5%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/finance | 2026-04-23 | 0a021ff | 8 | none | 10.7%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/fintech | 2026-04-23 | 0a021ff | 7 | none | 10.2%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/hospital-health-systems-management | 2026-04-23 | 0a021ff | 7 | none | 10.1%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/manufacturing-management | 2026-04-23 | 0a021ff | 7 | none | 9.1%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/bits-pilani-work-integrated-online/mba/strategy-consulting | 2026-04-23 | 0a021ff | 7 | none | 10.4%, 2026-09-17, 9490291 | 2026-11-04, c174b1e |
| spec | /universities/chitkara-university-online/mba/cyber-security | 2026-04-23 | cf0dd54 | 6 | none | 12.1%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chitkara-university-online/mba/data-science-artificial-intelligence | 2026-04-23 | cf0dd54 | 6 | none | 11.7%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chitkara-university-online/mba/finance | 2026-04-23 | cf0dd54 | 7 | none | 12.9%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chitkara-university-online/mba/global-accounting | 2026-04-23 | cf0dd54 | 6 | none | 11.9%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chitkara-university-online/mba/international-finance-accounting | 2026-04-23 | cf0dd54 | 7 | none | 11.3%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/chitkara-university-online/mba/pharmaceutical-management | 2026-04-23 | cf0dd54 | 5 | none | 11.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/dayananda-sagar-university-online/mba/artificial-intelligence | 2026-04-23 | 5e24483 | 5 | none | 11.1%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/dayananda-sagar-university-online/mba/business-analytics | 2026-04-23 | 5e24483 | 6 | none | 11.7%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/dayananda-sagar-university-online/mba/financial-management-fintech-focus | 2026-04-23 | 5e24483 | 6 | none | 11.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/dayananda-sagar-university-online/mba/it-systems-management | 2026-04-23 | 5e24483 | 5 | none | 11.6%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/dr-mgr-educational-research-institute-online/mba/healthcare-management | 2026-04-23 | c832a55 | 3 | none | 10.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/galgotias-university-online/mba/business-analytics | 2026-04-23 | 3d08380 | 7 | none | 10.7%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/galgotias-university-online/mba/finance | 2026-04-23 | 3d08380 | 6 | none | 8.9%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/galgotias-university-online/mba/healthcare-management | 2026-04-23 | 3d08380 | 8 | none | 9%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/galgotias-university-online/mba/hr-management | 2026-04-23 | 3d08380 | 6 | none | 8.8%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/icfai-university-online/mba/finance | 2026-04-23 | 4bfcd32 | 4 | none | 12%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/iift-online/mba/international-business | 2026-04-23 | 4e76ffe | 5 | none | 11%, 2026-09-17, 9490291 | 2026-10-30, 775469e |
| spec | /universities/integral-university-online/mba/finance | 2026-04-23 | 8a9c442 | 8 | none | 10.3%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/kurukshetra-university-online/mba/marketing | 2026-04-23 | e0494be | 6 | none | 9.3%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/noida-international-university-online/mba/hospital-health-care-management | 2026-04-23 | 3f794f1 | 6 | none | 7.8%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/op-jindal-global-university-online/mba/ai-for-business | 2026-04-23 | 046fb5e | 5 | none | 10.3%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/op-jindal-global-university-online/mba/finance | 2026-04-23 | 046fb5e | 5 | none | 9.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/op-jindal-global-university-online/mba/strategy-and-leadership | 2026-04-23 | 046fb5e | 5 | none | 10.5%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/op-jindal-global-university-online/mba/supply-chain-operations-management | 2026-04-23 | 046fb5e | 5 | none | 10.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/sharda-university-online/mba/healthcare-and-hospital-administration | 2026-04-23 | d1f0412 | 9 | none | 10.1%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/uttaranchal-university-online/mba/digital-marketing | 2026-04-23 | dc81b50 | 7 | none | 10%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/uttaranchal-university-online/mba/hr-management | 2026-04-23 | dc81b50 | 7 | none | 9.6%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/uttaranchal-university-online/mba/international-business | 2026-04-23 | dc81b50 | 7 | none | 9.7%, 2026-09-17, 9490291 | 2026-11-04, 9eea6da |
| spec | /universities/vignan-university-online/mba/business-analytics | 2026-04-23 | a620212 | 6 | none | 11%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/vignan-university-online/mba/healthcare-management | 2026-04-23 | a620212 | 5 | none | 11.4%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/vignan-university-online/mba/it-management | 2026-04-23 | a620212 | 5 | none | 11.3%, 2026-09-17, 9490291 | 2026-10-29, 5989f85 |
| spec | /universities/bit-mesra-online/mba/finance | 2026-07-28 | 923c3f9 | 1 | none | - | 2026-07-28, 923c3f9 |

## 2. Review blog for the same university and programme x JSON

Match rule: a published post (`getPublishedPosts`) whose slug is a key of `BLOG_TO_UNIVERSITY` with that `universityId`, and whose slug contains the programme as a hyphen-delimited token (B.Com accepts `bcom` or `b-com`, likewise M.Com, MSc, BSc).

| Count | Value |
|---|---:|
| BLOG_TO_UNIVERSITY entries | 48 |
| of which published | 48 |
| published entries whose slug names no programme token | 14 |
| published entries whose slug programme differs from the mapped `program` | 0 |
| hubs (render today) with a matching blog | 30 |
| spec pages (render today) with a matching blog | 113 |

Published mapped slugs with no programme token: `is-amity-university-online-fake-or-legit-2026` (mapped amity-university-online/mba), `is-nmims-online-fake-or-legit-2026` (mapped nmims-online/mba), `is-dy-patil-online-fake-or-legit-2026` (mapped dr-dy-patil-vidyapeeth-online/mba), `is-lpu-online-fake-or-legit-2026` (mapped lovely-professional-university-online/mba), `is-manipal-university-jaipur-fake-or-legit-2026` (mapped manipal-university-jaipur-online/mba), `is-ignou-fake-or-legit-2026` (mapped ignou-online/mba), `is-jamia-hamdard-online-fake-or-legit-2026` (mapped jamia-hamdard-online/mba), `is-integral-university-online-fake-or-legit-2026` (mapped integral-university-online/mba), `is-chandigarh-university-online-fake-or-legit-2026` (mapped chandigarh-university-online/mba), `is-galgotias-university-online-fake-or-legit-2026` (mapped galgotias-university-online/mba), `is-ddu-gorakhpur-online-fake-or-legit-2026` (mapped deen-dayal-upadhyay-gorakhpur-university-online/mba), `is-mangalayatan-university-online-fake-or-legit-2026` (mapped mangalayatan-university-online/mba), `is-sharda-university-online-fake-or-legit-2026` (mapped sharda-university-online/mba), `is-parul-university-online-fake-or-legit-2026` (mapped parul-university-online/mba).

### Hubs (render today): review blog x JSON

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| review blog Y | 30 | 17.41 | 34.95 | +17.54 | 249.5 | 122.3 | -127.2 | -51.0% | 30 | 29.09 | 42.97 | +13.88 | 143.8 | 101.5 | -42.3 | -29.4% |
| review blog N | 281 | 10.20 | 12.31 | +2.10 | 1843.7 | 656.0 | -1187.7 | -64.4% | 256 | 10.88 | 14.67 | +3.79 | 859.6 | 451.1 | -408.4 | -47.5% |
| review blog Y / JSON Y | 22 | 18.86 | 36.71 | +17.85 | 183.9 | 101.6 | -82.3 | -44.8% | 22 | 30.70 | 44.73 | +14.03 | 118.1 | 85.6 | -32.5 | -27.5% |
| review blog Y / JSON N | 8 | 13.33 | 26.34 | +13.00 | 65.6 | 20.7 | -44.9 | -68.4% | 8 | 21.73 | 33.53 | +11.80 | 25.7 | 15.9 | -9.8 | -38.0% |
| review blog N / JSON Y | 51 | 10.16 | 12.61 | +2.45 | 242.9 | 113.0 | -129.8 | -53.5% | 51 | 10.83 | 15.10 | +4.26 | 140.0 | 90.4 | -49.7 | -35.5% |
| review blog N / JSON N | 230 | 10.21 | 12.25 | +2.04 | 1600.8 | 542.9 | -1057.9 | -66.1% | 205 | 10.89 | 14.56 | +3.68 | 719.5 | 360.8 | -358.8 | -49.9% |

### Spec pages (render today): review blog x JSON

| Group | Pages (long) | Pos 18 May-31 Aug | Pos Sep-Oct 2026 | Δ pos | Impr/day 18 May-31 Aug | Impr/day Sep-Oct 2026 | Δ impr/day | Δ % | Pages (short) | Pos Sep | Pos Oct | Δ pos | Impr/day Sep | Impr/day Oct | Δ impr/day | Δ % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| review blog Y | 100 | 12.59 | 19.99 | +7.39 | 375.6 | 171.6 | -204.0 | -54.3% | 97 | 17.96 | 23.44 | +5.48 | 211.1 | 144.3 | -66.8 | -31.6% |
| review blog N | 387 | 9.86 | 13.51 | +3.64 | 911.5 | 554.6 | -357.0 | -39.2% | 359 | 11.68 | 18.40 | +6.72 | 685.3 | 467.4 | -217.9 | -31.8% |
| review blog Y / JSON Y | 72 | 12.80 | 20.73 | +7.93 | 299.9 | 141.1 | -158.8 | -52.9% | 70 | 18.48 | 23.64 | +5.16 | 171.5 | 117.5 | -54.0 | -31.5% |
| review blog Y / JSON N | 28 | 11.79 | 16.54 | +4.75 | 75.7 | 30.4 | -45.2 | -59.8% | 27 | 15.71 | 22.57 | +6.86 | 39.7 | 26.9 | -12.8 | -32.3% |
| review blog N / JSON Y | 20 | 10.46 | 15.99 | +5.53 | 63.0 | 20.4 | -42.6 | -67.6% | 18 | 14.31 | 24.01 | +9.70 | 27.8 | 17.8 | -10.0 | -35.8% |
| review blog N / JSON N | 367 | 9.82 | 13.41 | +3.59 | 848.5 | 534.1 | -314.4 | -37.0% | 341 | 11.57 | 18.18 | +6.61 | 657.5 | 449.6 | -208.0 | -31.6% |

### Hubs with a matching review blog

| Hub | JSON | Blog slug(s) |
|---|---|---|
| /universities/amity-university-online/mba | Y | amity-online-mba-review-2026, amity-online-mba-hr-worth-it |
| /universities/amity-university-online/mca | N | amity-online-mca-fees-review |
| /universities/amrita-vishwa-vidyapeetham-online/mba | Y | amrita-online-mba-review |
| /universities/arka-jain-university-online/mba | Y | arka-jain-online-mba-review |
| /universities/bharati-vidyapeeth-university-online/mba | Y | bharati-vidyapeeth-online-mba-review |
| /universities/bits-pilani-work-integrated-online/mba | Y | bits-pilani-online-mba-review-2026 |
| /universities/chandigarh-university-online/bba | N | chandigarh-online-bba-review-2026 |
| /universities/chandigarh-university-online/mba | Y | chandigarh-university-online-mba-review |
| /universities/dayananda-sagar-university-online/mba | Y | dsu-online-mba-review |
| /universities/deen-dayal-upadhyay-gorakhpur-university-online/mba | N | ddu-gorakhpur-online-mba-review |
| /universities/dr-dy-patil-vidyapeeth-online/mba | Y | dy-patil-online-mba-review |
| /universities/galgotias-university-online/mba | Y | galgotias-online-mba-review |
| /universities/ignou-online/mba | Y | ignou-online-mba-review-2026 |
| /universities/jain-university-online/mba | Y | jain-online-mba-review-2026 |
| /universities/jamia-hamdard-online/mba | Y | jamia-hamdard-mba-2026 |
| /universities/jaypee-university-online/mba | Y | jaypee-jiit-online-mba-review |
| /universities/lovely-professional-university-online/mba | Y | online-mba-lpu-review-2026 |
| /universities/manipal-academy-higher-education-online/bba | N | mahe-online-bba-review-2026 |
| /universities/manipal-academy-higher-education-online/mba | Y | online-manipal-mba-review-2026, mahe-online-mba-review-2026 |
| /universities/manipal-university-jaipur-online/bba | N | muj-online-bba-review-2026 |
| /universities/manipal-university-jaipur-online/mba | Y | muj-online-mba-review-2026 |
| /universities/nmims-online/bba | N | nmims-online-bba-review-2026 |
| /universities/nmims-online/mba | Y | nmims-online-mba-review-2026 |
| /universities/parul-university-online/mba | N | parul-online-mba-review |
| /universities/shoolini-university-online/mba | Y | shoolini-online-mba-review |
| /universities/sikkim-manipal-university-online/mba | Y | smu-online-mba-review |
| /universities/symbiosis-university-online/bba | N | symbiosis-online-bba-review-2026 |
| /universities/symbiosis-university-online/mba | Y | symbiosis-online-mba-review-2026 |
| /universities/uttaranchal-university-online/mba | Y | uu-doon-online-mba-review |
| /universities/vignan-university-online/mba | Y | vignan-online-mba-review |

## 3. The 20 hub losers with impressions Oct minus Sep

Same 20 rows and order as the hub loser table above.

| # | URL | Δ pos (Sep-Oct vs May-Aug) | Impr Sep | Impr Oct | Impr Oct minus Sep | JSON | Review blog |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | /universities/amity-university-online/bba | +45.12 | 55 | 30 | -25 | N | N |
| 2 | /universities/symbiosis-university-online/mba | +37.23 | 246 | 174 | -72 | Y | Y |
| 3 | /universities/amity-university-online/mba | +36.03 | 192 | 350 | +158 | Y | Y |
| 4 | /universities/jain-university-online/mca | +35.94 | 96 | 15 | -81 | N | N |
| 5 | /universities/ignou-online/mba | +32.89 | 119 | 147 | +28 | Y | Y |
| 6 | /universities/nmims-online/bba | +32.09 | 28 | 41 | +13 | N | Y |
| 7 | /universities/amity-university-online/bca | +28.34 | 96 | 55 | -41 | N | N |
| 8 | /universities/jain-university-online/mba | +25.55 | 158 | 159 | +1 | Y | Y |
| 9 | /universities/university-of-madras-online/mba | +24.67 | 79 | 39 | -40 | Y | N |
| 10 | /universities/nmims-online/mba | +24.63 | 216 | 244 | +28 | Y | Y |
| 11 | /universities/ignou-online/mcom | +21.24 | 67 | 53 | -14 | N | N |
| 12 | /universities/amrita-vishwa-vidyapeetham-online/mba | +20.45 | 49 | 24 | -25 | Y | Y |
| 13 | /universities/christ-university-online/bba | +20.23 | 75 | 82 | +7 | N | N |
| 14 | /universities/vit-university-online/mba | +20.16 | 124 | 44 | -80 | Y | N |
| 15 | /universities/lovely-professional-university-online/mba | +19.02 | 221 | 148 | -73 | Y | Y |
| 16 | /universities/dr-dy-patil-vidyapeeth-online/mca | +18.22 | 70 | 37 | -33 | N | N |
| 17 | /universities/university-of-kerala-online/mba | +17.62 | 34 | 19 | -15 | N | N |
| 18 | /universities/amity-university-online/mca | +17.60 | 63 | 43 | -20 | N | Y |
| 19 | /universities/chitkara-university-online/mba | +17.31 | 48 | 33 | -15 | Y | N |
| 20 | /universities/dy-patil-university-online/mba | +16.92 | 124 | 92 | -32 | Y | N |

Sum of Oct minus Sep across the 20: -331.

## 4. Uncommitted changes to lib/data/valid-urls.json and lib/data/programs-manifest.json (feat/protect-ai-pages)

Both files are modified in the working tree and not staged. File mtimes: `programs-manifest.json` 2026-11-05 12:23:26.775, `valid-urls.json` 12:23:27.047 (+0530). Last commits touching them: `ce05d63` (4 Nov, valid-urls) and `ac21ae9` (27 Oct, manifest).

**Writer:** the `prebuild` chain in package.json (runs on `npm run build`). Replaying its seven steps on a `git archive HEAD` copy (31e5a03) in a scratch directory reproduced both working-tree files byte-for-byte. Per step:

| Step | Script | valid-urls.json | programs-manifest.json |
|---:|---|---|---|
| 1 | build-verify-slugs.js | unchanged | unchanged |
| 2 | update-canonical-slugs.js | unchanged | unchanged |
| 3 | build-valid-urls.js | rewritten (+2,004 / -2,872 URLs vs step 2) | rewritten, 2,333 rows to 1,172 |
| 4 | backfill-manifest-from-data.js | rewritten (+1,455 / -7) | 1,166 rows added, 2,338 total |
| 5 | build-programme-allowlist.js | unchanged | unchanged |
| 6 | prune-noindex-hub-urls.js | -131 | unchanged |
| 7 | apply-url-canonical-map.js | +72 / -500 | unchanged |

**Net change in valid-urls.json vs HEAD:** 21 URLs added, 0 removed, plus 5 existing URLs moved position.

| URL | Added by step |
|---|---|
| /universities/alliance-university-online/bba | 3 build-valid-urls.js |
| /universities/alliance-university-online/bcom | 3 |
| /universities/chandigarh-university-online/msc | 3 |
| /universities/desh-bhagat-university-online/bcom | 3 |
| /universities/desh-bhagat-university-online/mba | 3 |
| /universities/jain-university-online/bba | 3 |
| /universities/jaypee-university-online/bba | 3 |
| /universities/jss-university-online/bba | 3 |
| /universities/lovely-professional-university-online/ba | 3 |
| /universities/lovely-professional-university-online/bba | 3 |
| /universities/lovely-professional-university-online/mcom | 3 |
| /universities/lovely-professional-university-online/msc | 3 |
| /universities/marwadi-university-online/bba | 3 |
| /universities/marwadi-university-online/bcom | 3 |
| /universities/marwadi-university-online/msc | 3 |
| /universities/noida-international-university-online/bba | 3 |
| /universities/pp-savani-university-online/mcom | 3 |
| /universities/pp-savani-university-online/msc | 3 |
| /universities/upes-online/bca | 3 |
| /programs/msc/biostatistics | 4 backfill-manifest-from-data.js |
| /programs/msc/financial-economics | 4 |

Moved, not added or removed: `/universities/manipal-university-jaipur-online/msc/mathematics` and `/universities/manipal-academy-higher-education-online/msc/{biostatistics,business-analytics,data-science,financial-economics}`.

**Net change in programs-manifest.json vs HEAD:** 5 rows added by step 4 (backfill-manifest-from-data.js), 0 removed:

| university_slug | program | spec_slug |
|---|---|---|
| manipal-university-jaipur-online | msc | mathematics |
| manipal-academy-higher-education-online | msc | biostatistics |
| manipal-academy-higher-education-online | msc | financial-economics |
| manipal-academy-higher-education-online | msc | data-science |
| manipal-academy-higher-education-online | msc | business-analytics |

Neither file was staged by this run.
