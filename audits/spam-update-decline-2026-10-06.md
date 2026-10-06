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

---

## Update, same day: manual action cleared, and the live SERP cannot find the cluster

**Rishi checked GSC: Manual actions "No issues detected", Security issues "No
issues detected".** Confirms the hit is algorithmic. Nothing to appeal, no
reconsideration request exists for a spam update.

**Not self-inflicted either.** `/tools/cgpa-calculator` serves 200, no
`X-Robots-Tag`, `<meta name="robots" content="index, follow">`, a correct
self-canonical, and all 27 CGPA URLs are in the live sitemap. Worth checking
explicitly because of the `valid-urls.json` precedent in
[[project_valid_urls_static_list]], where a duplicated list silently deleted a
page from every build for five days. Not that.

**Not a rendering problem.** The parent ships 8,111 chars of server-rendered
visible text, a value page 6,262. Googlebot does not need to run
`CgpaCalculatorClient.tsx` to read either.

### Four index checks, 2026-10-06, three days past the last data point

| check | result |
|---|---|
| `site:edifyedu.in/tools/cgpa-calculator` | "did not match any documents" |
| `site:edifyedu.in "cgpa calculator"` | 7 results, all footer mentions, never the tool |
| `"edifyedu" cgpa to percentage` | same, footer mentions only |
| `cgpa to percentage` page 1 | edifyedu.in absent |

`site:edifyedu.in` itself returns plenty, so the domain is fine. A `site:` query
with an exact phrase that sits in the title AND the URL should rank that page
first. It does not appear at all.

**But do not report a deindex from this alone.** The export through 3 Oct has
the cluster still delivering roughly 9,700 impressions/day: the Oct 3 total is
19,894 and non-`/tools/` at its baseline share is only ~10,214/day, so `/tools/`
cannot be at zero. Both readings hold if removal was still in flight when the
data ends (29,795 -> 24,348 -> 20,778 -> 19,894 is still falling steeply).

**Decisive test, owner-only: GSC URL Inspection on the parent URL.** Indexed =
deep demotion. Not indexed = the cluster is gone and consolidation moves from
advisable to urgent. Inspect two value pages too, to see if the children went
first.

### Two things the SERP rules out

- **No Google inline CGPA converter widget** on that query, so the cluster is
  not structurally dead the way a SERP feature would kill it.
- **The category was not cleared.** onlineresult.in, studenttools.in,
  raddiwalla.com and cgpafullform.com still rank, and they are the same thin-tool
  profile. This looks site-specific, not query-class-wide.

### The duplication, now measured rather than asserted

Strip markup from `7-5-cgpa-percentage` and `8-25-cgpa-percentage` and diff the
visible text:

- 6,261 chars on the page
- **4,115 verbatim identical** to the sibling
- 1,006 unique = **16.1%**, and every one of them is a number substituted into a
  shared sentence

"Is 7.5 CGPA good for online MBA admission?" and "Is 8.25 CGPA good for online
MBA admission?" are one template run 26 times. **83.9% byte-identical** is the
number to quote when justifying the consolidation.

### A second problem in the same template

Every value page asserts the percentage "clears every UGC-DEB approved online MBA
in India including NMIMS, Symbiosis, MAHE, Amity, LPU and 120+ others" and that
the reader "also qualifies for merit-based scholarships and fee waivers at most
premium universities". Unverified blanket eligibility and scholarship claims,
templated across 26 URLs. Same class as the 126 employer lists and 1,022 fake
reviews in [[project_page_content_json_broken]]. Nothing gates this copy.

---

## Update 2: the six-month export, which changes the framing

Rishi supplied the Last-6-months Web export (4 Apr to 3 Oct 2026, 183 days).
Site-wide, not the filtered one, but it answers more than the filter would have.

### Yes, the decline is real and it is the only one of its kind

A rolling scan of every 5-day window against its prior 21 days, across all 183
days, finds **exactly one** breach of -20% impressions / -30% clicks: the five
days ending 3 Oct (-24.7% / -44.5%). August's dip never reached it.

**Not a weekday or holiday artefact.** Over the last 8 weeks Saturday averages
29,222 impressions and 157 clicks. 3 Oct (Sat) is **19,894 / 83**, the lowest
Saturday in the whole series and 32% under the Saturday norm. Gandhi Jayanti
(2 Oct, national holiday) explains part of that one day, Friday avg 31,557 vs
20,778 actual, but nothing about 30 Sep, 1 Oct or 3 Oct.

### The break is 29 Sep, not 24 Sep

| phase | impr/d | clicks/d | pos | AI impr/d | vs prev |
|---|---|---|---|---|---|
| A. 1-13 Sep, peak | 36,325 | 193 | 8.03 | 7,524 | - |
| B. 14-23 Sep, pre-update | 35,072 | 181 | 7.40 | 7,736 | impr -3.5% |
| C. 24-28 Sep, update days 1-5 | 29,934 | **208** | **6.72** | 8,515 | clicks **+15.2%** |
| D. 29 Sep-3 Oct | 25,797 | 112 | 7.74 | 5,135 | clicks **-46.0%** |

**Phase C was a good period.** Fewer impressions, better position, more clicks.
The first five days of the spam update improved the site commercially. Whatever
landed on 29 Sep took clicks -46% and AI citations -39.7% *together* and pushed
position back out to 7.74.

That simultaneity is the strongest support for the attribution. The CGPA cluster
is 68% of impressions, 70% of clicks and 63% of AI citations, so a demotion there
moves all three in proportion on the same day. One cause, three symptoms, no
second explanation needed.

### Where today sits

| month | impr/day | clicks/day |
|---|---|---|
| Jun | 23,595 | 81 |
| Jul | 33,991 | 151 |
| Aug | 33,326 | 130 |
| Sep | 34,553 | 188 |
| **Oct (3 days)** | **21,673** | **93** |

3 Oct is the lowest impression day since **8 June** and the lowest click day
since **13 June**. About three and a half months of growth handed back. The site
is still roughly 4x its April size, so this is a giveback, not a collapse.

### The finding that matters more than the drop

Split the six months at the 28-day boundary, clicks per day:

| segment | prior 155 days | last 28 days | change |
|---|---|---|---|
| CGPA and tools | 28.3 | 129.0 | **+355%** |
| Blog | 26.4 | 30.2 | +15% |
| **Education** (unis, verify, compare, hubs, coupons) | **24.7** | **24.4** | **-1%** |

**The part of the site that sells online degrees earned ~25 clicks/day in April
and earns ~25 clicks/day now.** The entire six-month growth curve was the
calculator, and so is the entire fall. Cross-check: tools were 45.9% of clicks
over 6 months and 70.3% over 28 days, so the concentration was still increasing
right up to the break.

**But the CTR work did land.** Education impressions fell 3,488 to 2,788/day
(-20%) while clicks held flat, so CTR went **0.71% -> 0.88%, +24%**. The title
and snippet programme succeeded and was cancelled out by losing impressions.
**So the next lever on the education side is rankings and coverage, not CTR.**
That is a different job from the one that has been running since August, and it
supersedes the emphasis in `audits/review-blog-ctr-audit-2026-08-19.md`.

### Note for whoever builds the next chart

Emitting dates as bare `0404` in a JS array is a legacy octal literal (260) in
sloppy mode, while `0924` falls back to decimal because 9 is not an octal digit.
Month labels and event markers then disagree silently and the chart still
renders. Quote the key. Caught here by asserting the rendered SVG contained all
seven month labels, not by looking at it.
