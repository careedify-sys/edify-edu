# EdifyEdu 90-day plan, 2026-09-13

Written against measured state, not against the stage the business was at last
year. Every number below is read from the live CRM, the 2026-09-13 GSC
diagnosis, or the repo itself. Sources named per section.

---

## 0. The finding that reorders everything

**Measured on the live Supabase CRM, 2026-09-13:**

| | count |
|---|---:|
| Leads in the CRM | 303 |
| From website forms | 89 |
| Imported from elsewhere | 214 |
| **Still at stage `Fresh`** | **285 (94%)** |
| Leads with even one logged call | **18** |
| Call activity rows, all time | **22** |
| Stage `Enrolled` | **1** |

Twenty-two calls have been logged against three hundred and three leads.

The site is not the constraint. Traffic is not the constraint. Lead capture is
not the constraint. **The constraint is that captured leads are not worked.**

This matters more than any SEO decision on the list, because every SEO gain
multiplies into the same place. The projection in
`audits/gsc-ranking-lead-strategy-2026-08-23.html` sizes the consolidation
programme at +403 leads over six months. Four hundred more rows at stage `Fresh`
is worth approximately nothing. The same effort spent on the 285 already sitting
there costs no traffic, no rankings and no content.

**Read the `1 Enrolled` carefully.** It means the CRM records one. If students
have enrolled through WhatsApp or phone without the stage being moved, the
number is wrong and the CRM is not the record. Either way the conclusion holds:
there is no reliable enrolment number for this business today, so no decision
below can currently be justified on revenue.

---

## 1. What the website actually is now

Counted from the repo and the crawl, not estimated.

| | |
|---|---:|
| Live pages in sitemap | 2,907 |
| Universities in `lib/data.ts` | 131 |
| Programme hubs | 457 |
| Specialisation pages | 1,919 |
| Blog posts | 195 |
| Clicks per day, organic, zero ad spend | ~170 and rising |

Growth over the 43-day stitched GSC series: **clicks per day +10.9%**, last 7
days against first 7 **+15.6%**. The strongest two days in the series are the
last two.

This is not a company that needs to be told to start doing SEO. It is doing SEO
at a scale most of its competitors are not, and it is working.

---

## 2. Four things to stop planning, with the reason

### Stop: "build hundreds of high-intent landing pages"

There are 2,907. The 2026-09-13 GSC diagnosis measured the entire
striking-distance inventory, every query at position 4-12 with 150+ impressions,
calculator excluded: **69 queries, 28,525 impressions, 36 clicks.**

| cluster | impressions | clicks | why it earns nothing |
|---|---:|---:|---|
| Bare `{uni} mba fees` | ~8,000 | 3 | campus intent, not the online market |
| `how many iims in india` family | 4,312 | 4 | count answered inline by Google |
| Full-form queries | ~2,000 | 1 | definitional, answered inline |
| `naac grade` | 685 | 0 | definitional, answered inline |

Positions on the IIM cluster are improving and clicks stay at zero. That is the
signature of a query answered above the fold. More pages of the same shape feed
the same dead end.

### Stop: "build a CRM funnel"

It exists. `supabase/migrations/20260731000000_crm_leads.sql`, seven stages,
`Fresh` to `Enrolled`, with a call and note timeline, running at `/leads`. It is
used at a rate of 22 calls per 303 leads.

The missing piece is not the CRM. It is a reason to open it every morning.

### Stop: treating the CGPA calculator as traffic

It is **51% of all site impressions** and has produced **zero leads** in six
months. Leave it live, it costs nothing and holds topical authority. Never
report on a number it controls. GSC regex filter: exclude `cgpa|gpa|percentage`.

### Stop: reading the unfiltered GSC dashboard

Unfiltered, the site looks up 5.8%. That is the calculator moving. Use
`Chart.csv` for trend and the Pages and Queries exports only for per-row facts.
Both Pages exports cap at exactly 1,000 rows, so differencing two of them
measures the cap. This method error has already produced one wrong headline.

---

## 3. The B2B retainer idea has a conflict that has to be settled first

Selling universities a student-acquisition retainer is the highest-ceiling idea
on the table. It also points a gun at the only thing that makes this site
different from the fourteen competitors on the never-link list.

The positioning is stated in `CLAUDE.md` as "no paid rankings, no referral
commissions". It is stated to every lead, in writing, in the confirmation email
that `/api/enquiry` sends today:

> edifyedu.in takes zero commission from universities, so there is nothing in it
> for us either way.

The day EdifyEdu takes a growth retainer from a university it ranks, that
sentence is false, and it was already sent to every prior lead. That is a trust
problem first and an advertising-standards problem second.

It is not unsolvable, but it needs a decision made on purpose, not drifted into:

1. **Separate the entity.** The comparison site stays commission-free. The
   growth agency is a different company with a different name and no editorial
   input. Costs the cross-sell, keeps the moat.
2. **Disclose per page.** Take the money, and mark every page for a client
   university with a visible commercial-relationship notice. Honest, and it
   weakens the pitch on exactly the pages the client is paying for.
3. **Do not take university money at all.** Revenue comes from the student side
   and from products EdifyEdu owns.

The UGC public notice on EdTech franchise arrangements is a separate constraint
and points the same way: EdifyEdu must never present itself as offering a
university's degree.

**This is the founder's call, not an engineering one. Make it before any pitch
goes out, because a pitch is hard to unsend.**

---

## 4. The plan

### Phase 0, this week. Work the queue.

Not a code task. 285 leads sit at `Fresh`, 89 of them people who filled a form
on the site and were told in writing they would hear from us within 24 hours.

Target: every one contacted, every attempt logged, stage moved. Even a "Not
interested" is worth more than `Fresh`, because it is information.

What comes out of it is the only thing that can size everything else: the real
`Lead > Contacted > Interested > Registered > Enrolled` rates, and which
universities and programmes actually convert.

### Phase 1, weeks 1-4. Close the loop.

- **Done 2026-09-13:** lead attribution fixed. Four capture widgets were
  overwriting the page path with a widget name, so 43 of 89 website leads (48%)
  cannot be traced to a page. Fixed forward, not backfillable. See `FIX-LOG.md`.
- **Build: a funnel and call-queue view in `/leads`.** Stage funnel, leads never
  contacted, leads by source page, by university, by programme. The number that
  has to be visible every morning is "never contacted".
- **Build: revenue attribution.** Once stages are real, join `Enrolled` back to
  source page. That answers the one question the whole SEO programme exists to
  answer and currently cannot: which page earns a student.

### Phase 2, weeks 3-8. Feed what converts, by measured CTR.

The page types are not equal, and the gap is large:

| cluster | pages | clicks | CTR |
|---|---:|---:|---:|
| coupons | 9 | 46 | **3.00%** |
| verify | 61 | 186 | **1.76%** |
| universities | 650 | 593 | 0.80% |
| blog | 180 | 1,127 | 0.46% |

- **Coupons convert best and there are only 12 pages.** Google has already moved
  from ranking the index to ranking individual coupon pages, and
  `manipal-jaipur` went from position 7.2 to 4.9 and 10 clicks to 24. Expand the
  cluster. No invented scholarship data.
- **Verify pages were the best-converting starved cluster.** 356 inbound links
  shipped 2026-09-13. Measure before adding more.
- **`/fees` sits at position 21** with a 130-university dataset behind it. It is
  the one fee asset with real headroom that needs no invented data.
- **Do not ship the blog title rewrite.** The cannibalisation theory does not
  survive the data: two of three test cases were already review-titled and their
  hubs stayed buried anyway. Jain's hub has 26 inbound links at position 53.

### Phase 3, weeks 6-12. Decide the revenue model.

Section 3 above. Then build to it, not before.

---

## 5. What not to spend on

Ads. Not on principle, on arithmetic. Paid traffic lands in the same queue where
94% of leads currently sit untouched. Buy traffic once a lead that arrives gets
called, and once you can name the enrolment rate it converts at.

---

## 6. The one number to run the company on

Not traffic. Not leads. **Leads contacted within 24 hours.**

It is currently near zero, it is free to fix, and every other number on this
page is downstream of it.
