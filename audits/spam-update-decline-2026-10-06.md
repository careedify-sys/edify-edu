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

---

## Update 3: the seasonality hypothesis, tested

Rishi: "in October admission closed of July batch, very few students enquire in
November and December, and October traffic generally declines, so that could be
the possible reason?"

**The business read is correct.** Published UGC-DEB cycle: July intake applies
roughly Apr/May to 30 Jun, extended to ~Sep-end; January intake runs roughly
Oct to Apr. So October is the handover between cycles and a genuine enquiry lull
there is entirely plausible.

**It still does not fit the chart, and 29 Sep settles it on its own.**

| date | impressions | clicks | CTR | pos |
|---|---|---|---|---|
| Mon 28 Sep | 33,078 | 249 | 0.75% | 6.5 |
| **Tue 29 Sep** | **34,168** | **163** | **0.48%** | 7.0 |
| Wed 30 Sep | 29,795 | 120 | 0.40% | 7.5 |

29 Sep had **the most impressions of the entire 28-day window**, and clicks fell
35% with CTR halved on the same day. More students searched, more of them saw
the site, far fewer clicked. **No fall in demand produces that.** Fewer searchers
means fewer impressions, not a halved CTR on a day impressions rose.

Three supporting checks:

1. **Seasonality cannot move CTR or position.** 24-28 Sep vs 29 Sep-3 Oct: CTR
   -37.3%, position +1.02 worse. Demand changes how many people search, not
   where you rank or what share of viewers click.
2. **Arithmetic caps it.** Every admissions-driven page (universities, hubs,
   compare, verify, coupons) is 12.6% of clicks. Total collapse of enquiry
   demand = max -12.6% sitewide. Observed -46.0%.
3. **The calculator is not an admissions asset.** It converts a grade to a
   percentage; demand tracks results and form-filling, not a July deadline. The
   arithmetic already pins the loss inside `/tools/`.

**What a real demand taper looked like on this site**, 20-31 Jul vs 1-15 Aug:
impressions -11.2%, clicks -19.1%, **CTR only -8.9%**. Impressions and clicks
eased together. The last week moved CTR four times as far on a third of the
impression change. Different mechanism.

**The honest limit.** This site cannot be checked against its own seasonality:
the 6-month window opens 4 Apr at 255 impressions/day, so there is no comparable
October. **To close the question, export Last 16 months** (full GSC retention).
If the site was still too small last October, the supply-side fingerprint has to
carry it.

**Where the read is right, and the consequence.** Few enquiries Oct-Dec is real
and the cycle supports it. That makes this the quietest revenue window of the
year, which is the right time to fix the education side's ranking problem rather
than the wrong time to look at it. January intake applications run to April, so
work shipped now is indexed and ranking when that demand arrives. Pairs with the
Update 2 finding that the education side's next lever is rankings and coverage,
not CTR.

---

# Update 3, 2026-10-07: the calculator is indexed, and the mechanism is the AI Overview

Data: GSC Web export **Last 7 days, 2026-09-28 to 2026-10-04**, pulled 7 Oct. One
day is new against Update 2, which ended 3 Oct. Coverage checked first:
`Pages.csv` holds 185,444 impressions against a `Devices.csv` total of 184,308,
so page shares are safe. `Queries.csv` holds 83,672 = **45.4%**, so query rows
prove presence and never absence.

## 4 October is the first up day

| | 3 Oct | 4 Oct | change |
|---|---|---|---|
| Clicks | 83 | **95** | +14.5% |
| Impressions | 19,894 | **22,247** | +11.8% |
| Position | 8.2 | **7.8** | 0.4 better |

Impressions, clicks and position all moved the right way together for the first
time since 28 Sep. Weak on its own: 4 Oct is a Sunday and Sundays usually come
in under the Saturday before them, so the direction matters more than the size.
It is still the lowest Sunday in the six-month series (95 against 213, 131, 191,
150 for the four before it).

## The deindex question is settled: the page is indexed

Update 2 left one owner-only test open, because four `site:` probes could not
surface the cluster while the impression arithmetic said it could not be at
zero. **The export answers it without needing URL Inspection.**

`/tools/cgpa-calculator`, 28 Sep to 4 Oct: **103,497 impressions, 538 clicks,
average position 6.81.** Its 6 Sep to 3 Oct figure was average position
**6.81** — identical to two decimal places. A removed page does not hold 14,785
impressions a day at an unchanged rank.

So the `site:` miss was a container check and the arithmetic was the content
check, and the arithmetic won. Same trap as the one recorded in
`feedback_verify_content_not_container`. **Consolidation is advisable, not
urgent.** Re-check serving confirmed it too, 7 Oct: the parent and a value page
both 200 in under a second, `index, follow`, correct self-canonical, 157 KB of
HTML, no `X-Robots-Tag`.

## It is not a deep demotion either

Per-row positions, 6 Sep-3 Oct against 28 Sep-4 Oct:

| query | impr/day | clicks/day | CTR | position |
|---|---|---|---|---|
| cgpa to percentage | 3,599 -> 3,060 | 37.2 -> 26.6 | 1.03% -> 0.87% | 5.47 -> **5.97** |
| cgpa | 803 -> 670 | 30.8 -> 21.7 | 3.84% -> 3.24% | 2.50 -> **2.45** |
| cgpa to percentage calculator | 528 -> 408 | 3.7 -> 4.0 | 0.70% -> 0.98% | 6.59 -> **4.97** |
| percentage to cgpa | 461 -> 269 | 4.8 -> 1.1 | 1.05% -> 0.42% | 6.17 -> **7.27** |

Half a place on the head term, and one of the four improved. The 26 value pages
move by under 0.5 in both directions. **Nothing here is a ranking collapse.**

## What actually fell, and it is not one cluster

Site daily averages: 6-28 Sep ran 199 clicks and 34,502 impressions at 0.576%
CTR and position 7.47. 1-4 Oct ran **94 clicks and 21,817 impressions at 0.429%
CTR and position 7.99.**

Clicks fell in **every** segment, per day, 28d window against 7d window:

| segment | impr/day | clicks/day | CTR |
|---|---|---|---|
| cgpa (27 pages) | 22,539 -> 17,950 (-20%) | 125.5 -> 86.4 (**-31%**) | 0.56% -> 0.48% |
| blog (189) | 6,909 -> 5,200 (-25%) | 30.2 -> 22.7 (**-25%**) | 0.44% -> 0.44% |
| universities (654) | 1,784 -> 1,702 (-5%) | 15.0 -> 11.0 (**-26%**) | 0.84% -> 0.65% |
| tools-other (2) | 856 -> 824 (-4%) | 3.6 -> 2.7 (-24%) | 0.42% -> 0.33% |
| verify (70) | 376 -> 411 (+9%) | 5.1 -> 4.6 (-10%) | 1.36% -> 1.11% |

Two different shapes. The blog lost a quarter of its impressions at **exactly
flat CTR**, so it lost coverage. The university pages held impressions and lost
CTR. Neither is what a penalty aimed at one scaled-content template does.

Breadth check, education pages with at least 140 impressions in the 28-day
window so the 7-day export floor of 6 cannot truncate them: of **248** pages,
**182 lost more than 10% of impressions, 32 gained, 34 flat, median -26%.**
Broad and shallow, not concentrated.

**Do not read the eight `/blog/is-{uni}-fake-or-legit-2026` rows at -100% as a
regression.** They 308 to `/verify/{uni}`, confirmed live on 7 Oct, from the
consolidation shipped 2026-09-14. The 28-day window opens 6 Sep and so holds
eight pre-redirect days. That consolidation worked and is not in question.

## The mechanism, observed on the live SERP

CTR halving while position holds has one ordinary explanation: **GSC position
counts rank among the organic results. It does not count pixels.** A result can
sit at rank 1 and still be far below the fold.

Checked on two head queries from two different clusters, 7 Oct, `gl=in`:

- **`cgpa to percentage`** (Edify at GSC position 5.97, 0.87% CTR): an AI
  Overview occupies the top of the SERP. The first organic result begins at
  **pixel 613**. No Google calculator widget, which matches the Update 2 check.
- **`bcom full form`** (Edify at GSC position **1.22**, **1.91%** CTR): an AI
  Overview prints the complete answer, "The full form of B.Com is Bachelor of
  Commerce", plus degree type, duration, core subjects and eligibility. It
  cites BYJU'S, avsas.ac.in and Karpagam. **It does not cite Edify.** First
  organic result at **pixel 613**.

The second one carries the argument on its own. At position 1.22 nothing
except SERP furniture can explain 1.91%. This is also the only reading that
fits the fact seasonality could not touch: on **29 Sep the site took its
highest impressions of the 28-day window, 34,168, while clicks fell 35% and CTR
halved.** More people saw Edify and far fewer clicked, because the answer had
moved above it. And it fits the -43.2% fall in AI-feature impressions: the
overviews kept showing, Edify stopped being cited inside them.

**Limits, stated plainly.** Two queries, one desktop render, unpersonalized,
from outside India, where **89% of this site's impressions are mobile** and an
overview covers proportionally more of the screen. And this observes 7 Oct, not
29 Sep, so it explains the **level** of CTR rather than proving the **timing**
of the change. The dating would need a SERP archive this project does not keep.

## What this changes

1. **Nothing is broken and nothing needs appealing.** Manual actions and
   security were already clear, serving is clean, the cluster is indexed at an
   unchanged rank.
2. **The hold to ~15 Oct stands,** and now rests on evidence rather than
   caution: positions held, so there is no ranking damage to repair by
   restructuring.
3. **Rewriting the 26 value pages will not recover these clicks.** The clicks
   were taken by an answer printed above the results, not lost to a competitor.
   Consolidation is still right for the duplication recorded in Update 1, which
   is a separate argument and keeps its own timetable.
4. **The queries to fund are the ones an overview cannot finish.** `/verify`
   held CTR at 1.11% and gained impressions while everything else fell, and
   Update 2 found it over-indexes AI citations at 2.6x its ranking share.
   A formula restates in one line. "Is this degree valid, and what is this
   university's current UGC-DEB and NAAC standing" does not.
