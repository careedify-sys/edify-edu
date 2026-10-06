# The 29 September decline: diagnosis

Audit date 2026-10-06. Data: GSC Web export 2026-09-06 to 2026-10-03, and the
Generative AI features export 2026-05-18 to 2026-10-03. Published report:
https://claude.ai/artifact/4H7kSE4ALLkVeS1PP3x7xq

## What happened

| | Sep 6-26 baseline | Sep 30 - Oct 3 | change |
|---|---|---|---|
| Impressions/day | 34,858 | 23,704 | **-32.0%** |
| Clicks/day | 196 | 100 | **-49.1%** |
| Avg position | 7.51 | 7.92 | 0.42 worse |
| AI-feature impressions/day | 7,973 | 4,531 | **-43.2%** |

Clicks fell faster than impressions while average position got worse. That is
ranking loss on terms that were already earning, not a demand dip.

## Attribution, and why it is arithmetic rather than a guess

GSC gives one sitewide daily series and one 28-day page table. It will not break
the trend down by folder. It does not need to:

- everything outside `/tools/` is 29.3% of impressions and 29.7% of clicks
- so the largest possible sitewide fall from those pages, **even if every one of
  them went to zero**, is -29.3% / -29.7%
- observed: -32.0% / -49.1%
- therefore `/tools/` fell. No other arrangement of the numbers works.

Use this method instead of differencing two Pages exports. Both tables return
exactly 1,000 rows (the export cap). The page rows happen to sum to the device
totals so the tail is negligible, but the **query** rows cover only 43.0% of
impressions and cannot prove a cluster is dead. See
`feedback_gsc_queries_cap`, `feedback_gsc_method`.

## Most likely cause

Google's **September 2026 spam update** began 2026-09-24 09:15 PDT, global, all
languages, stated rollout up to two weeks. It enforces scaled content abuse,
site reputation abuse and expired domain abuse. Edify's slide begins on day five
and steepens, which is the normal lagged shape.

Circumstantial, not confirmed. Google names no affected site. But nothing else
is in the window, and the content profile fits the named policy exactly.

### Ruled out

- **Not a deploy.** The font fixes (`3b21ca8`, `f535482`), the city/state
  cleanup and the `/methodology` sitemap fix all landed 2-3 Oct, after four days
  of decline.
- **Not serving.** Homepage, calculator, a CGPA value page, `robots.txt` and
  `sitemap.xml` all 200 in under a second on 2026-10-06.
- **Not crawl.** `robots.txt` allows Googlebot everywhere that matters, plus
  GPTBot/ClaudeBot/PerplexityBot/CCBot.
- **Not a www split.** The three `www.` rows are legacy brand impressions; `www`
  308s to the apex correctly. Do not chase this.
- **Not geography.** India is 97.5% of impressions, shape unchanged.
- **Not a core update.** Google has confirmed no October 2026 core update.

## The exposed asset

`app/tools/cgpa-calculator/[value]/page.tsx` is a 368-line template. The only
per-page variation across its 26 URLs is four numbers (`label`, `percentage`,
`mumbaiPct`, `tier`) from `[value]/data.ts`. There is no unique prose on any of
them.

| | impressions | clicks | CTR | position |
|---|---|---|---|---|
| `/tools/cgpa-calculator` (parent) | 518,122 | 3,174 | 0.61% | 6.81 |
| the 26 value pages | 112,912 | 338 | 0.30% | 4.17 mean |

They rank **better** than the parent and convert at half its rate. Position 3-5
with a 0.13-0.17% CTR means Google prints the answer and keeps the visit.

Five earn enough to keep if given real standalone content: `8-5` (45 clicks),
`7-75` (26), `7-5` (24), `7-45` (21), `8-25` (20) = 136 of the 338.

Second scaled-content surface: of the 638 `/universities/` URLs that got
impressions, **331 got zero clicks** and 287 got one or two. 618 of 638 earn two
clicks a month or fewer. 295 got under 50 impressions; 98 sit past position 20.

## The structural finding

| | share |
|---|---|
| Site clicks from `/tools/` | 70.3% |
| Site clicks from the 756 lead-relevant pages | 12.6% (649 clicks, 23/day) |

Before the drop the business ran on 23 clicks/day. After the drop it still does.
Most of what fell was traffic that converts a number and leaves.

## What the Generative AI report actually says

989,266 AI-feature impressions over six months. The export has **no clicks
column** at all (impressions only, every table).

| segment | AI share | normal ranking share | ratio |
|---|---|---|---|
| `/tools/cgpa-calculator` | 62.8% | 68.1% | 0.92 |
| `/blog` | 22.4% | 20.9% | 1.07 |
| `/universities` | 7.3% | 5.4% | 1.35 |
| `/verify` | 2.6% | 1.0% | **2.60** |
| `/compare`, `/best-`, `/methodology` | 1.0% | 0.6% | **1.67** |

- Citation share tracks ranking share. Google is not selecting Edify for its
  independence or its method; it cites whatever already ranks. There is no AEO
  advantage in these numbers to defend. Consistent with
  `project_ai_citation_work`.
- Down **62% from the July peak**: 11,986/day across 20-24 Jul, 4,531/day now.
- AI features were 29.6% of all impressions on 28 Sep and 16.8% on 3 Oct.
  Google pulled the citations back faster than the rankings.
- `/verify` and `/compare` over-index at 2.6x and 1.67x. Those carry a judgement
  a model cannot restate from a formula. That is the only part of the AI
  footprint worth building on.

## Correction to a standing assumption

`project_fee_query_gap` treats the zero-click fee cluster as recoverable
opportunity. Partly phantom:

| query | impressions | position | clicks | page that ranks |
|---|---|---|---|---|
| bits pilani mba fees | 2,735 | 9.25 | 0 | `/blog/bits-pilani-online-mba-review-2026` (WILP) |
| galgotias university mba fees | 1,246 | 10.33 | 0 | `/blog/galgotias-online-mba-review` (online) |
| jain university mba fees | 614 | 10.83 | 0 | `/blog/jain-online-mba-review-2026` (online) |

The titles are good (`Is It Worth Rs 3.12L?` carries the number). The searcher
wants the **on-campus** fee and the page is about the online or WILP programme.
No title rewrite fixes an intent mismatch. The fix is an on-campus vs online fee
block per review, both flagged indicative with a portal verification line.

## Next action

1. Check GSC Security and Manual Actions. Algorithmic needs no reconsideration,
   a manual action changes everything below.
2. Export Pages and Queries **filtered to `/tools/` and separately to
   everything else**, last 7 days vs previous 7. That gives the daily segment
   split this export cannot.
3. Hold structural changes until ~2026-10-15. Spam update volatility settles
   2-4 weeks after a rollout completes, and the rollout started 24 Sep with a
   two-week window. Re-probe before acting: see `feedback_reprobe_worklists`.
