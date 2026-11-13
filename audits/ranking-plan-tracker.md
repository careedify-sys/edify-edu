# Ranking and scaling plan: batch tracker

Source plan: "edifyedu.in ranking and scaling plan, with check log" (Rishi, 14 Nov 2026) and the keyword-gap workbook "edifyedu.in vs CollegeVidya, keyword gap (Semrush, 12 Nov 2026)". This file is the working copy: every batch, its status, and every check date. Update the Status and Result columns as work lands. Work happens on `feat/branded-sprint-1` and is pushed as a branch; merging to main is Rishi's call.

## Batch 1: no-regret fixes (started 14 Nov)

| # | Item | Plan reference | Status | Result |
|---|---|---|---|---|
| 1.1 | Blog owner links: link words already in each post, no date bump | Log 14 Nov "Blog owner links" | Done (7a4ed72) | 149 links in 79 posts, rendered text unchanged. Plus 49 template pages (a2f3806). Body inbound, reviews / hubs: NMIMS 13->62 / 4->29, Amity 26->66 / 4->23, MUJ 16->45 / 0->19, SMU 10->20 / 0->7, Symbiosis 10->39 / 4->18. MUJ review still has no body link to its hub (no qualifying sentence) |
| 1.2 | Fix the 71 programme hubs that are in the sitemap but serve noindex | Log 14 Nov | Done (adb2848) | Cause: the JS never-both check lacked fee rule 4d. Ported; 71 dropped from valid-urls.json (2,839 URLs) |
| 1.3 | Rename the 86 unused page-content files to the live spec slugs, after checking each | Log 14 Nov | Checked, not renamed (3311957) | 59 map to a live page, but 55 carry stale NAAC/NIRF and 4 typed fees or unsourced claims; 26 duplicates; 1 hub-level. Worklist: audits/orphan-spec-json-2026-11-14.csv. Fixing the facts is batch 3.1 |
| 1.4 | Join the 3-month Search Console Pages export into the spec inventory; draft the 767 / 432 split | Log 14 Nov "middle path" | Done (3311957) | 1,199 zero-click / 284 with clicks confirmed. Draft keep list (29 universities with a review blog): 793 noindex / 406 keep and improve. The plan's 432 list is not in the repo: Rishi to confirm. audits/spec-middle-path-draft-2026-11-14.csv |
| 1.5 | Write "Is NMIMS online MBA worth it" from the first-hand file and lib/data.ts only | Log 13 Nov, Approved | Done (caff545) | /blog/is-nmims-online-mba-worth-it-2026, built and checked: fees and admission from data, in sitemap, index,follow |

## Batch 2: needs Rishi's yes before it runs

| # | Item | Waiting on |
|---|---|---|
| 2.1 | Noindex the zero-click near-copy spec pages and remove them from valid-urls.json together | Done on the branch, 14 Nov. Keep list (Rishi): every universityId in lib/coupons.ts (29) plus Mody and Sathyabama = 31. 686 noindexed (lib/data/spec-noindex-urls.json), 513 to improve (audits/spec-improve-worklist-2026-11-14.csv). Live once 2.2 merges |
| 2.2 | Merge `feat/branded-sprint-1` to main (one deploy) | Rishi |
| 2.3 | Programme-basics posts: course guide, fees, admission process, salary for MBA, BBA, BCA, MCA (16) | "Approve going deep" box |
| 2.4 | /programs/mba answers fees, cheapest, one-year, best, with a fee table from lib/data.ts | Same |

## Batch 3: next, no approval needed

| # | Item | Status |
|---|---|---|
| 3.1 | Fix facts in the 59 orphan spec JSON files against lib/data.ts, then rename them to the live slugs | Pending |
| 3.2 | Hub link from the MUJ review: needs a sentence in the post, so it waits for the next real MUJ review update | Pending |

## Rishi-only (Claude cannot do these)

- Request indexing in Search Console for the pages changed on 13 Nov and the new worth-it post.
- Record first-hand notes for SMU, Symbiosis and Parul before their worth-it posts.
- Ask enrolled students for a short verified review.
- Brand work: LinkedIn article per university, YouTube, Quora and Reddit answers as Rishi, HARO.
- Top up Semrush API units if Claude should pull Position Tracking directly.

## Check calendar (reminders are set for each date at 10:00 IST)

| Date | Check | Data to pull | Rule | Result |
|---|---|---|---|---|
| 21 Nov 2026 | Did Google re-read the changed pages? | URL Inspection on the 8 changed pages plus the NMIMS worth-it post: last crawl, indexed | Pass: crawled after 13 Nov and indexed, wait. Fail: request again and check which pages link to them | Not checked |
| 28 Nov 2026 | Did the noindex take hold, did anything else fall? | Search Console Pages (Excluded by noindex) and a 4-week Performance export | Pass: noindexed count rising toward 767 and clicks outside /tools near 350 a week. Fail: those clicks more than 15% lower two weeks running, stop further noindex and find the pages that lost clicks | Not checked |
| 5 Dec 2026 | Title freeze on the eight review posts ends | Search Console Queries for the eight reviews, 28 days | Change a review title only if its target query sits at 8 to 20 with CTR under 1% | Not checked |
| 7 Dec 2026 | Brand searches, monthly | Queries containing "edify", last 28 days | Baseline about 13 a month. Track the trend | Not checked |
| 12 Dec 2026 | Owner pages: is Google ranking the right page? NMIMS worth-it post | Semrush Organic Positions for edifyedu.in by university name, Search Console Queries and Pages | Pass: review ranks for "[university] online mba fees" better than baseline, repeat owner links for the next 10 universities; worth-it post at 20 or better, write Amity and MUJ. Fail: bring the data before any merge, redirect or more posts | Not checked |
| 26 Dec 2026 | Specialisation batch 1 (the 513 kept pages) | audits/spec-improve-worklist-2026-11-14.csv and Search Console Pages | Universities not improved by now get noindexed; improved pages kept if they gained impressions | Not checked |
| 9 Jan 2027 | Full re-test against the baseline | Same Semrush exports (edifyedu.in, CollegeVidya, CollegeSathi) and Search Console 3 months | Scale the page types that moved; stop the ones that did not | Not checked |

## Baseline (from the plan, for every check)

Search Console 11 Aug to 10 Nov: 12,855 clicks, 2,663,474 impressions; tools 8,202, blog 2,555, spec pages 804, verify 453, hubs 400, university pages 51; brand clicks 39. Semrush 12 Nov: 23,158 visits, 765 from university and online-programme searches. "nmims online mba fees": hub #43 and #60, review not in top 100. "amity online mba fees": hub #54. "symbiosis online mba": hub #47. "manipal university jaipur mba fees": university page #65. "sikkim manipal university online mba fees": SMU review #3. Referring domains 57.

## Batch log

- 14 Nov: tracker created; reminders set for all seven check dates.
- 14 Nov: Batch 1 done on feat/branded-sprint-1 (a2f3806, 7a4ed72, adb2848, 3311957, caff545); build passes; branch pushed, not merged.
- 14 Nov: 2.1 applied on the branch: 686 spec pages noindex, out of valid-urls.json (2,153 URLs) and the sitemap; 513 on the improve worklist. Verified on a local build: 686/686 noindex, 513/513 index.
