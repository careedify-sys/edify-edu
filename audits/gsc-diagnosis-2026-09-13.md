# GSC diagnosis — 28d to 2026-09-10 vs 28d to 2026-08-26

Source: two Search Console "Performance on Search" exports (Web, last 28 days).

**Caveat on the comparison.** The two windows overlap by ~13 days (14–26 Aug is in
both). Deltas are therefore *conservative* — real movement is larger than the
numbers below. Direction and rank-order are reliable; magnitude is not.

---

## 0. HEADLINE CORRECTED: the site is growing. The earlier claim was a windowing artifact.

**Read this before the section below it.** The original headline said the real
site lost 12% of clicks. That came from summing the two Pages exports, and the
method does not survive scrutiny.

**Both exports cap at exactly 1,000 rows.** When site totals move, which pages
make the cut changes. Aug had 73 verify pages in the top 1,000 and Sep had 61.
Those 12 did not lose their traffic, they fell below the cap. Summing a truncated
list and differencing it measures the cap as much as the site.

The daily series has no such problem. Both exports carry `Chart.csv`, and
stitched together they give 43 unbroken days. The two 28-day windows overlap by
13 days, so the clean comparison is the two non-overlapping halves:

| period | days | impressions | clicks | CTR | avg pos |
|---|---:|---:|---:|---:|---:|
| Jul 30 to Aug 13 | 15 | 513,924 | 2,042 | 0.40% | 8.1 |
| Aug 14 to Aug 26 (shared) | 13 | 433,051 | 1,686 | 0.39% | 9.1 |
| **Aug 27 to Sep 10** | 15 | **533,715** | **2,264** | **0.42%** | 8.7 |

**Per day, late versus early: clicks +10.9%, impressions +3.9%.**

Last 7 days against first 7 days: **147 clicks/day to 170, up 15.6%**, with CTR
improving 0.42% to 0.47%. The strongest two days in the whole 43-day series are
the last two, 9 and 10 September, at 190 and 227 clicks. Nothing in this work
shipped before 13 September, so none of that is ours.

**What this means for the sections below.** The per-page and per-query findings
are still sound, because those read individual rows rather than differencing
truncated sums. Issue 2 was a real defect and is fixed. But treat every
aggregate built by summing a Pages export as unreliable, including the
"excluding calculator, clicks down 11.8%" figure. There is no page dimension in
`Chart.csv`, so whether non-calculator traffic specifically fell cannot be
settled from these two exports at all.

**Method rule going forward: use `Chart.csv` for trend, and the Pages and
Queries exports only for per-row facts. Never difference two capped exports.**

---

## 0a. The original headline, superseded by the correction above

| metric | Aug window | Sep window | change |
|---|---:|---:|---:|
| **All traffic** — clicks | 3,739 | 3,957 | **+5.8%** |
| **All traffic** — impressions | 938,246 | 964,446 | +2.8% |
| **Excl. calculator** — clicks | 2,373 | 2,092 | **−11.8%** |
| **Excl. calculator** — impressions | 431,073 | 361,717 | **−16.1%** |
| **Excl. calculator** — avg position | 10.64 | 11.94 | **−1.30 places** |

Reported as-is the site looks up 5.8%. Filter out `cgpa|gpa|percentage` as
`audits/seo-internal-links-session-2026-08-23.md` §1 instructs, and the real site
lost **12% of clicks and 16% of impressions**, and slipped 1.3 positions.

Anyone reading the unfiltered dashboard will conclude the opposite of the truth.

---

## Issue 1 — Fee queries: ~9,000 impressions, 3 clicks

The single largest missed opportunity. Every one of these sits at position 8–10,
which should convert at 1–2%, and converts at ~0.04%.

| query | impressions | clicks | position |
|---|---:|---:|---:|
| bits pilani mba fees | 2,607 | 1 | 9.4 |
| galgotias university mba fees | 2,559 | 1 | 9.7 |
| jain university mba fees | 1,071 | 1 | 8.5 |
| uttaranchal university mba fees | 642 | 0 | 10.0 |
| jamia hamdard mba fees | 572 | 0 | 9.7 |
| galgotia mba fees / mba fees in galgotias / galgotia university mba fees | 1,308 | 0 | 8.2–9.5 |

### Cause 1a: the blog ranks, the commercial hub is buried

| university | page that ranks | position | the hub | hub position |
|---|---|---:|---|---:|
| BITS Pilani | `/blog/bits-pilani-online-mba-review-2026` | **7.8** | `/universities/bits-pilani-work-integrated-online/mba` | **25.2** |
| Jamia Hamdard | `/blog/jamia-hamdard-mba-2026` | **8.0** | `/universities/jamia-hamdard-online/mba` | **38.2** |
| Jain | — | — | `/universities/jain-university-online/mba` | **53.0** |
| Uttaranchal | — | — | `/universities/uttaranchal-university-online/mba` | **31.3** |

This is the blog-vs-hub cannibalisation identified in the August audit §5c. It
was only partly addressed (the `UNIVERSITY_PROGRAM_LINKS` gap). The ranking
problem itself is untouched, and the hub is the page with the fee table, the EMI
block and the lead form.

### Cause 1b: the two pages carry near-identical titles AND contradictory data

```
blog : BITS Pilani Online MBA (WILP) Fees 2026: ₹2.97L, NIRF #16 Review
hub  : BITS Pilani WILP Online MBA Fees 2026: ₹2.98L | edifyedu.in
```

Two index,follow pages, the same query, the same shape of title. Google must
pick one, and it picks the blog.

Worse, they disagree on fact: **₹2.97L vs ₹2.98L**, and **NIRF #16 Overall vs
NIRF #7 with no category at all**. The missing category violates the standing
rule that a NIRF rank must always state its category. Two pages on an
independence-positioned site quoting different fees for the same programme is a
trust problem before it is an SEO problem.

### Cause 1c: the SERP is owned by aggregators

Live check on "galgotias university online MBA fees 2026" returned eight
results: seven are commercial aggregators (four of them on the never-link list),
EdifyEdu sixth. Their titles all promise a full attribute set — "Fees,
Eligibility, Admission & Review", "Fees, Placement & Ranking", "Fees & ROI:
Semester-Wise Fee Structure". One runs a dedicated fee-structure URL per
university.

**Gap:** they have a page built for the fee query. We have a review that
mentions fees. Recorded as gap analysis only — never linked, never cited.

---

## Issue 1 REVISED (2026-09-13, after query-level analysis) — most of it is not winnable

The framing above ("~9,000 impressions, 3 clicks, fix the cannibalisation") was
wrong on sizing and wrong on cause. Corrected here rather than deleted, so the
reasoning is auditable.

### Correction 1: 80% of fee impressions are campus intent, not our market

| fee query set | queries | impressions | clicks | CTR | avg pos |
|---|---:|---:|---:|---:|---:|
| All fee queries | 82 | 16,385 | 53 | 0.32% | 9.05 |
| Qualified "online" / "distance" | 32 | **3,340** | 23 | **0.69%** | 8.49 |
| Bare, no online qualifier | 50 | **13,045** | 30 | **0.23%** | 9.20 |

`bits pilani mba fees` (2,607) and `galgotias university mba fees` (2,559) carry
no online qualifier. Both universities run large on-campus MBAs, and that is what
those searchers want. EdifyEdu is an online-education comparison site, so it
ranks ~9 and converts at 0.04% because the intent is not ours to serve.

The genuinely addressable set is the qualified subset: **3,340 impressions, 23
clicks, position 8.5** — real, but a fraction of what was claimed.

### Correction 2: the title-cannibalisation theory is contradicted by our own data

The theory was that blog and hub carry near-identical fee-led titles, so Google
picks one and the hub stays buried. BITS does show that collision. But:

| university | blog `seoTitle` | already differentiated? | hub position |
|---|---|---|---:|
| Galgotias | "Galgotias Online MBA Review 2026: Cheapest NAAC A+ at Rs 80K" | **yes, review-led** | not ranking |
| Jamia Hamdard | "Jamia Hamdard Online MBA Review 2026: Honest Verdict" | **yes, review-led** | 38.2 |
| BITS Pilani | "BITS Pilani Online MBA (WILP) Fees 2026: ₹2.97L, NIRF #16 Review" | no, fee-led | 25.2 |

Two of the three are **already** review-titled, and their hubs are buried anyway.
Differentiating titles therefore does not predict hub recovery. Link count does
not explain it either: Jain's hub carries **26 inbound internal links and sits at
position 53**, while BITS's carries 11 and sits at 25.

Google is preferring the long-form editorial page over a templated hub, which is
a reasonable judgement. Rewriting 40 blog titles to fight it would be an
unevidenced change against a ranking page that currently earns clicks.

**Decision: do not ship the title rewrite.** Not enough evidence, real downside.

### Correction 3: the striking-distance inventory is mostly zero-click query types

All queries at position 4-12 with 150+ impressions, calculator excluded:
**69 queries, 28,525 impressions, 36 clicks.**

What they are:

| cluster | impressions | clicks | why it earns nothing |
|---|---:|---:|---|
| Bare `{uni} mba fees` | ~8,000 | 3 | campus intent, not our market |
| `how many iims in india` family | 4,312 | 4 | count question Google answers inline |
| Full-form queries (`phd full form`, `ma full form`, `b com full form salary`) | ~2,000 | 1 | definitional, answered inline |
| `naac grade` | 685 | 0 | definitional, answered inline |

Positions on the IIM cluster are *improving* (-0.2 to -0.8) and clicks stay at
zero. That is the signature of a query answered above the fold, not of a page
that needs better on-page work.

**This is the real finding.** The site's near-miss inventory is dominated by
queries that do not produce clicks at any position short of the answer box. That
is why 28,525 impressions yield 36 clicks, and no amount of title or linking work
changes it.

### The one under-exploited asset

`/fees` is indexable, well titled ("Compare 125+ UGC-DEB Approved Programs"),
backed by a 130-university dataset, and sits at **position 21 with 453
impressions and 4 clicks**. Competitors rank fee-structure pages of exactly this
shape. This is the only fee-side asset with genuine headroom that does not
require inventing data or fighting Google's page preference.

---

## Issue 2 — `/programs/*`: 13,533 impressions, 25 clicks, all noindexed

0.18% CTR across 32 pages, ranking at positions 40–75.

| page | impressions | clicks | position | robots |
|---|---:|---:|---:|---|
| `/programs/mba/finance` | 1,650 | 0 | **73.0** | noindex |
| `/programs/mba/human-resource-management` | 1,211 | 1 | 40.1 | noindex |
| `/programs/mba/business-analytics` | 951 | 0 | 69.6 | noindex |
| `/programs/mba/operations-management` | 847 | 1 | 59.7 | noindex |
| `/programs/mba/specializations/business-analytics` | 725 | 0 | 69.5 | noindex |
| `/programs/mba/marketing` | 687 | 0 | 55.4 | noindex |

Every one is `noindex, follow` with a **self-referencing canonical** — a dead
end that accumulates decaying impressions and passes nothing on.

**And there are two competing route families for the same intent:**

| | impressions | position | | impressions | position |
|---|---:|---:|---|---:|---:|
| `/programs/mba/business-analytics` | 951 | 69.6 | `/programs/mba/specializations/business-analytics` | 725 | 69.5 |
| `/programs/mba/supply-chain-management` | 114 | 75.5 | `/programs/mba/specializations/supply-chain-management` | 568 | 70.4 |
| `/programs/mba/healthcare-management` | 147 | 24.8 | `/programs/mba/specializations/healthcare-management` | 477 | 57.6 |
| `/programs/mba/fintech` | 59 | 45.6 | `/programs/mba/specializations/fintech` | 182 | 58.4 |

`app/programs/mba/specializations/[spec]/page.tsx` and
`app/programs/[...slug]/page.tsx` both serve the same topic at different URLs.
Four confirmed pairs are live in GSC, splitting signal between two noindexed
dead ends.

`/programs/mba/specializations/healthcare-management` fell **17.7 places** in two
weeks, the worst single decline on the site.

---

## Issue 3 — IIM cluster declining, and the answer-intent queries convert nothing

`/blog/iim-ranking-india-2026-all-iims-list` is the site's biggest non-calculator
page and is shrinking: **198 → 154 clicks (−44)**, 22,223 → 18,391 impressions,
while its *position improved* 7.8 → 7.5.

Position up, clicks down means the SERP changed around us, not that we fell.

| query | impressions | clicks | position |
|---|---:|---:|---:|
| total iim in india | 660 | 0 | 9.3 |
| total iims in india | 435 | 0 | 8.9 |
| how many iims in india | 341 | 0 | 7.8 |

1,436 impressions, zero clicks, all at position 8–9. These are count questions
Google answers in the SERP. Ranking 8th for a question already answered above the
fold earns nothing.

---

## Issue 4 CORRECTED — the coupon and homepage "drops" are not drops

Checked at cluster level rather than page level. Both findings below were wrong.

### Coupons: the cluster grew

| | pages | impressions | clicks |
|---|---:|---:|---:|
| Aug window | 9 | 1,848 | 44 |
| Sep window | 9 | 1,532 | **46** |

`/coupons` the index page did fall, 24 clicks to 10, position 12.4 to 19.1. But
every click it lost went to a coupon landing page and then some:

| page | impressions | clicks | position |
|---|---:|---:|---:|
| `/coupons/manipal-jaipur-online-mba-discount-coupon-2026` | 183 → 326 | **10 → 24** | 7.2 → **4.9** |
| `/coupons/mahe-online-mba-discount-coupon-2026` | 155 → 226 | 2 → 4 | 6.4 → 6.5 |
| `/coupons/lpu-online-mba-discount-coupon-2026` | 50 → 61 | 1 → 3 | 7.5 → 7.0 |
| `/coupons/amrita-online-mba-discount-coupon-2026` | 50 → 28 | 2 → 1 | 14.3 → **9.8** |

Google moved from ranking a generic index to ranking the specific coupon page for
each university. That is the correct outcome, better for the reader, and better
for conversion, since the landing page carries the offer and the form. **Do not
"fix" this.**

### Homepage: brand queries are at position 1

| query | impressions | clicks | position |
|---|---:|---:|---:|
| `edifyedu` | 11 | 8 | **1.0** |
| `edifyedu.in` | 7 | 3 | 1.4 |
| `edify` | 365 | 0 | 4.9 |

Real brand queries rank first and convert. The 365-impression `edify` query is a
generic English word shared with schools, software and the verb, so zero clicks
at position 4.9 is the expected result, not a defect. The homepage's average
position moved because of the non-brand long tail it sits in, not because brand
search weakened.

**Lesson for future reads: check the cluster before calling a single page's
decline a problem.** Both of these look like losses at page level and are not.

---

## Issue 4 as originally written (superseded by the correction above)

| page | pos Aug | pos Sep | Δ |
|---|---:|---:|---:|
| `/coupons` | 12.4 | **19.1** | +6.6 |
| `/` (homepage) | 14.5 | **19.2** | +4.7 |
| `/universities/jain-university-online/mca` | 17.8 | 30.7 | +12.9 |
| `/universities/symbiosis-university-online/mba` | 18.7 | 29.8 | +11.1 |
| `/universities/savitribai-phule-pune-university-online/bba` | 7.9 | 16.3 | +8.4 |

`/coupons` lost 14 of 24 clicks. The homepage at position 19 is weak for a brand
whose name query (`edifyedu`) sits at 1.0.

---

## Issue 5 — Not a defect: pages "disappearing"

25 pages with ≥100 impressions vanished between exports. **This is mostly a
reporting artifact** — both exports cap at exactly 1,000 pages, so anything that
slips below the cut looks deleted. The live sweep on 2026-09-13 confirmed all
2,907 sitemap URLs return 200. Treat as decline, not breakage.

---

## What is NOT the problem

- **Not indexing or crawling.** Every sitemap URL returns 200, no redirect
  chains, sitemap is canonical-clean.
- **Not internal links.** Fixed the same day: pages with 0–1 inbound contextual
  link went 1,516 → 327. Too recent to have affected these numbers either way.
- **Not the recent data/redirect work.** Those shipped 2026-09-13, after the
  window closes on 09-10.
