# GSC performance diagnosis, 27 September 2026

Source: six GSC "Performance on Search" exports (23 Aug, 29 Aug, 13 Sep, 14 Sep, 17 Sep, 27 Sep).
Daily series merged from all Chart.csv files, 23 Feb to 24 Sep 2026 (214 days).
Full write-up: https://claude.ai/code/artifact/2b9c308c-4e76-4f07-bbdb-95cec55618e3

## Headline

There is no sitewide drop. The drop is visible only in the 7-day view.

| Comparison | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| 28d (28 Aug - 24 Sep) vs prior 28 | 3,693 -> 4,962 (+34%) | 939,063 -> 987,806 (+5%) | 0.393% -> 0.502% (+28%) | 8.64 -> 8.01 |
| 14d (11 - 24 Sep) vs prior 14 | 2,159 -> 2,803 (+30%) | 501,524 -> 486,282 (-3%) | 0.430% -> 0.576% (+34%) | 8.60 -> 7.40 |
| 7d (18 - 24 Sep) vs prior 7 | 1,585 -> 1,218 (-23%) | 245,288 -> 240,994 (-2%) | 0.646% -> 0.505% (-22%) | 7.61 -> 7.19 |

## Why the 7-day drop

1. 11 Sep was a one-day anomaly: 379 clicks at 1.08% CTR on *lower* impressions than 10 Sep.
   The head term `cgpa` hit position ~2.2 that day. Removing it, 12-17 Sep averaged 201 clicks/day
   against 174/day for 18-24 Sep. The real softening is 13%, not 23%.
2. That 13% is query mix. Position improved (7.61 -> 7.19), impressions flat. The low-CTR long tail
   (`cgpa to percentage`, 97,473 imp at 0.81%) grew faster than the head (`cgpa`, 24,767 imp at 3.61%).

## The real finding: CGPA is masking an education decline

`/tools/cgpa-calculator` alone gained 1,820 clicks (922 -> 2,742). The whole site gained 1,228.
Everything else therefore lost ~590 clicks net.

Matched-URL basis (URLs present in both Pages.csv exports, Jul30-Aug26 vs Aug28-Sep24):

| Segment | URLs | Clicks | Impressions | CTR |
|---|---|---|---|---|
| CGPA tools | 29 | 1,368 -> 3,185 (+133%) | 507,299 -> 684,262 (+35%) | 0.270% -> 0.465% (+73%) |
| Blog posts | 159 | 1,237 -> 912 (-26%) | 276,289 -> 209,605 (-24%) | 0.448% -> 0.435% (-3%) |
| University hubs | 399 | 486 -> 301 (-38%) | 85,138 -> 46,201 (-46%) | 0.571% -> 0.652% (+14%) |
| Verify pages | 53 | 163 -> 131 (-20%) | 14,729 -> 8,395 (-43%) | 1.107% -> 1.560% (+41%) |

CGPA/percentage queries are now 91.4% of captured impressions, up from 79.4% in late August.
(Previously recorded as 51% in project_gsc_cannibalisation - that figure is stale.)

## Demand, not ranking

- Position held flat while impressions fell 24-43% on every education segment.
- University hubs: 195 URLs improved position, 203 worsened. Even split. The weighted average
  (12.99 -> 15.28) is dragged by a few zero-click deep pages collapsing (Jain MCA 17.8 -> 47.6).
- Exactly ONE URL above 500 impressions vanished between windows
  (/universities/chitkara-university-online/bca, 665 imp / 1 click). The Aug soft-404 and canonical
  work cost nothing.
- Clearest cases rank better and still lost reach: is-manipal-university-jaipur-fake-or-legit-2026
  improved 6.24 -> 5.62 and lost 46% of impressions.

### Genuine ranking losses worth fixing

| Page | Position | Clicks |
|---|---|---|
| /coupons | 12.42 -> 20.25 | 24 -> 6 |
| / (homepage) | 14.49 -> 19.39 | 26 -> 12 |
| /blog/affordable-online-mba-india-2026 | 8.48 -> 13.12 | 11 -> 0 |
| /blog/phd-full-form-doctorate-meaning-india | 8.30 -> 10.27 | 22 -> 7 |
| /blog/chandigarh-university-online-mba-review | 9.22 -> 10.28 | imp 3,090 -> 604 |

## Did the 15-16 Sep title rescue work? Yes, modestly

Retitled set vs untouched control, same two windows (pre = 09-17 export Aug18-Sep14, 100% pre-change;
post = 09-27 export Aug28-Sep24, only 10 of 28 days post-change):

| Set | Posts | Clicks | Impressions | CTR |
|---|---|---|---|---|
| Retitled | 32 | 314 -> 310 (-1.3%) | 112,451 -> 106,203 (-5.6%) | 0.279% -> 0.292% (+4.5%) |
| Control | 160 | 783 -> 676 (-13.7%) | 129,975 -> 111,197 (-14.4%) | 0.602% -> 0.608% (+0.9%) |

Retitled posts held flat while the control fell 14%. 12-point relative outperformance.

Two confounds, both stated rather than corrected for:
- Only 10 of 28 post-window days are after the change. The effect is diluted ~64%.
- The retitled set was SELECTED for low CTR (0.279% vs control 0.602%), so part of the gain is
  regression to the mean.

Gained: is-ignou-fake-or-legit-2026 (0 -> 0.87%), shoolini-online-mba-review (0.44 -> 1.01%),
is-mangalayatan-university-online-fake-or-legit-2026 (0.57 -> 0.85%).
Went backwards: galgotias-online-mba-review (0.23 -> 0.13%, clicks 29 -> 13),
jain-online-mba-review-2026 (0.12 -> 0.08%), amity-online-mca-fees-review (0.34 -> 0.17%).

## Other September changes

- Verify consolidation (14-15 Sep): CTR +41%. /verify/manipal-university-online 1 -> 8 clicks.
- Coupon cluster (13-14 Sep): CTR +47%. manipal-jaipur coupon 10 -> 26 clicks, pos 7.20 -> 3.92.
  But the /coupons hub itself collapsed (see ranking losses above).
- Soft-404 / canonical / sitemap (29-30 Aug): desktop position 12.69 -> 10.80, desktop CTR
  0.35% -> 0.46%.
- 12 new posts (17 Sep), 7 days of data: Mangalayatan 13 clicks, DDU Gorakhpur 6, NMIMS 6.

## Method caveats

- Queries.csv captures only ~34% of site clicks (Google anonymises rare queries) and caps at
  1,000 rows. CGPA now occupies 68% of those rows, crowding education queries out of the export
  itself. Pages.csv captures 93-99% of clicks and is the only reliable segment view. Every segment
  figure above is from Pages.csv, matched-URL basis where stated.
- The 28-day windows overlap, so "before" and "after" share days.
- Exports end 24 Sep.

## Next

1. Split the GSC view by /tools/ vs everything else. A sitewide number now measures CGPA seasonality.
2. Expect the topline to fall when results season decays. It will not be a disaster.
3. Do not build more calculator pages. Same trap as the coupon cluster.
4. Fix the five ranking losses, /coupons and the homepage first.
5. Pull a clean 28-day window around 15 Oct (first window entirely post-retitle) before touching the
   other 80 titles.
6. The education problem is impressions, not CTR. CTR is already improving everywhere.
