# SEO / Internal Links Session — 2026-08-23

**Read this before touching internal links, programme hubs, `valid-urls.json`, or the middleware allowlists.**

Source data: Google Search Console export, 23 Feb to 20 Aug 2026 (web, all countries, 1,000 pages + 1,000 queries), cross-referenced against 346 CRM lead rows and `lib/data.ts`.

Shipped commit: `563926f` on `main`.

---

## 1. Site baseline (use these to compare future GSC exports)

| Metric | Value |
|---|---|
| Impressions (6 mo) | 2,744,741 |
| Clicks | 10,490 |
| Site CTR | 0.38% |
| Avg position | 6.9 to 8.8 |
| CRM leads in period | 346 |

**The 0.38% is misleading.** The CGPA calculator cluster is 51% of all impressions (1,403,518) at 0.25% CTR and produced **zero leads**. Google answers `X cgpa in percentage` with its own inline widget, so the ranking never converts to a click.

Strip the calculator out and the real site is:

| Metric | Value |
|---|---|
| Impressions | 1,341,223 |
| Clicks | 7,033 |
| CTR | 0.52% |
| Click to lead | 4.9% |

**Always report GSC with a regex filter excluding `cgpa|gpa|percentage`.** Otherwise calculator noise masks real movement.

---

## 2. What was broken, and what we fixed

### Defect 1: 45 links to hard 404s (FIXED)

`app/universities/[id]` rendered its "All Programs" list directly from `u.programs`:

```tsx
{u.programs.map(prog => <Link href={`/universities/${u.id}/${progSlug(prog)}`}>)}
```

But `middleware.ts:484` returns a hard **404** for any `/universities/{uni}/{prog}` whose university is absent from `lib/data/programme-allowlist-{prog}.json`.

Result: **45 broken links across 33 university overview pages.** By programme: MA 25, MCA 9, BBA 3, BCA 3, MBA 2, B.Com 2, M.Com 1.

This is what "many pages not found" referred to.

**Fix:** the overview page now renders from `getResolvableProgrammes()`, which consults the same allowlists middleware uses. Computed on the server in `app/universities/[id]/page.tsx` and passed as the `linkableProgrammes` prop, so the client bundle does not ship the allowlist JSON.

The programme **tab strip** (`UniversityPageClient.tsx:181`) still uses `u.programs` on purpose. It calls `setActiveProgram`, it does not navigate, so it was never a 404 risk.

### Defect 2: 229 of 242 programme hubs had zero inbound internal links (FIXED)

Nothing on the site linked to them, so Googlebot reached them via sitemap only.

Supporting evidence, the within-pair test across all 55 university+programme combos that have both a review blog and a hub: the page with more internal links is the better-ranking page in **51 of 55 cases (93%)**. The blog has more links in 53/55 and outranks the hub in 53/55.

Do **not** cite the cross-sectional version of this (avg position bucketed by link count). It inverts, because the only hubs that ever received links are the big brands facing the hardest competition. The within-pair test controls for that and is the one to trust.

**Fix:** `components/UniProgramBody.tsx` now renders `<SiblingProgrammes>`, cross-linking each hub to the other programme hubs at the same university. All five hub routes (`mba`, `mca`, `bba`, `bca`, generic `[program]`) share `UniProgramBody`, so one change covers every hub.

Result: **672 new internal links across 60 universities.**

---

## 3. The rule that keeps this safe

`lib/seo/safe-internal-links.ts` exposes two predicates. They answer different questions and are **not** interchangeable:

| Helper | Means | Use for |
|---|---|---|
| `isLinkable(path)` | in `valid-urls.json`: resolves **and** is indexable | SEO link building. Linking a noindex page buys nothing. |
| `hubResolves(uniId, program)` | in the middleware allowlist: returns 200, indexable or not | Navigation. A working noindex page is still worth a link; a 404 is not. |

**Never decide linkability from `u.programs`.** `u.programs` is the *input* to those gates, not the output. Using it directly is what produced both the phantom-hub defects and Defect 1 above.

`scripts/check-internal-hub-links.js` enforces this. Run after any build; it scans prerendered HTML and exits non-zero on any link middleware would 404.

```bash
npm run build && node scripts/check-internal-hub-links.js
```

Current state: 2,219 pages scanned, 3,801 gated hub links, **0 broken**.

---

## 4. Regenerating valid-urls.json — the four-step trap

**No npm script does all four steps.** Run them in this order:

```bash
node scripts/build-valid-urls.js
node scripts/build-programme-allowlist.js
node scripts/prune-noindex-hub-urls.js
npx tsx scripts/normalize-valid-urls.mts
```

- `npm run prebuild` omits **normalize** → leaves redirect sources in the sitemap → pre-commit `check-sitemap-vs-404` rejects it.
- `npm run build:urls` omits **prune-noindex** → leaves 77 noindex hub URLs in the sitemap → pre-commit `check-sitemap-noindex-drift` rejects it.

Correct output is ~1,780 entries. A plain `npm run build` leaves it at ~3,189. Never hand-edit the file.

**This four-step chain is for committing, not for production.** It exists to satisfy the pre-commit gates. Vercel runs `prebuild` only, so the deployed sitemap is the ~3,189-entry version, and per 5a below that is the **correct** production behaviour. Do not "fix" the pipeline to match the committed file.

---

## 5. Still open

### 5a. Sitemap normalize — FALSE ALARM, verified against production, do nothing

An earlier draft of this file claimed production's sitemap carried ~1,400
non-canonical spec URLs that 301, and recommended adding
`normalize-valid-urls.mts` to `prebuild`. **That was wrong. Do not do it.**

Checked against the live site on 2026-08-23:

- Live `https://edifyedu.in/sitemap.xml` serves **2,756 URLs**. The normalized
  committed file would produce **1,663**.
- Sampled the ~1,400 URLs present live but absent from the normalized file.
  Every one returned **HTTP 200**, `<meta name="robots" content="index, follow">`,
  and a self-referencing canonical. They are legitimate indexable pages.

So `normalize-valid-urls.mts` is **over-pruning**: it drops roughly 1,000 valid
pages because `resolveSpec` returns null for slugs that nonetheless render. The
current production behaviour is the correct one. Adding normalize to `prebuild`
would delete about 1,000 real pages from the sitemap.

Related check while testing: a fabricated spec slug
(`/universities/.../mba/underwater-basket-weaving`) returns 200, but with
`noindex, nofollow` and a canonical back to the university page. That is a soft
404, so there is no unbounded indexable URL space. GSC may report it under
"Soft 404". Acceptable, not urgent.

**Consequence for the repo:** the committed `valid-urls.json` (normalized, ~1,780)
is *more conservative* than what production generates. `prebuild` overwrites it on
every deploy, so this only affects local dev, where `isLinkable()` returns false
for some hubs that are live. That is fail-safe, never fail-open, so it is fine.

### 5b. 33 hubs are noindex because their fees are placeholders (BLOCKED on research)

35 hubs, 36,310 impressions, 88 clicks are noindex in production. Root cause is
now precisely identified, and it is not a code defect. `getDisplayFee()` is
correctly rejecting placeholder fee ranges:

| Hub | pd.fees | Rule | Why |
|---|---|---|---|
| `pp-savani/bca` | `₹0.2L – ₹1.5L` | 4a | spans 7.5x |
| `integral/bca` | `₹0.1L – ₹0.6L` | 4a | spans 6.0x |
| `gls/bba`, `sppu/bba` | `₹60K – ₹200K` | 4a | spans 3.3x |
| `lpu/bca` | `₹0.2L – ₹1.2L` | 4a | spans 6.0x |
| `ignou/bca` | `₹21,600` | 4b | diverges from `programFees.bca` 49,800 by >25% |

Rule 4a suppresses any range wider than `SUSPICIOUS_RANGE_RATIO`. These are
placeholders, not real fees, so the gate is doing its job. 33 of the 35 have
neither a page-content JSON nor a usable fee.

**This cannot be fixed from inside the codebase.** It needs real fees from
official university portals. Per `CLAUDE.md`, never invent a fee.

Worklist with current values, gate rule, and blank columns for verified figures:
`audits/noindex-hub-fee-worklist-2026-08-23.csv` (35 rows, ranked by impressions).

This is the same blocker as the parked 125-row placeholder-fee cluster.

> An earlier figure of "87 hubs / 77,376 impressions" came from a stale
> `valid-urls.json` and is **wrong**. 35 / 36,310 is correct.

### 5c. Blog vs hub cannibalisation (PARTLY DONE 2026-08-23, commit `34bbbfa`)

**Done:** 22 of 40 review blogs had no entry in `UNIVERSITY_PROGRAM_LINKS`, so
`getUniversityFromBlog()` returned null, `BlogRelatedLinks` never rendered, and
those blogs passed nothing back to their hub. Only 2 of 40 (MUJ, Amity) have a
full CTA bundle, so for the rest that map is the only blog-to-hub link there is.
Nine were added after validating each target against `valid-urls.json`. Verified:
gated hub links 3,801 to 3,810, zero broken.

Five were deliberately left out: `imt-ghaziabad` and `xlri` have no university in
`lib/data.ts`; `lpu/bba`, `nmims/bba` and `chandigarh/bba` resolve but are
noindex (see 5b). Add those once their fee data lands.

**Not done, and mostly should not be:** repointing existing fee anchors. Of 73
fee-matching anchors, 43 belong on blogs (multi-university roundups such as
"Online BBA fees comparison across 11 universities"). Of the remaining 30, most
say "review and fees" or are blog-card titles, where the anchor promises a
review and repointing would break that promise. Only a handful are pure fee
anchors worth moving, and the value is marginal now that the mapping is fixed.

> An earlier note here claimed a duplicated-token anchor bug
> (`"MUJMUJ MBA Review 2026"`). **That was wrong.** The markup is
> `<div class="il-uni">MUJ</div><div class="il-title">MUJ MBA Review 2026</div>`,
> a badge above a title. It renders correctly; only naive tag-stripping
> concatenates it. No fix needed.

### 5c-bis. Blog cards link to truncated university slugs (minor)

Some blog cards link to `/universities/manipal-university-jaipur` and
`/universities/amrita-vishwa-vidyapeetham`, without the `-online` suffix. These
are in neither `valid-urls.json` nor `OLD_SLUG_REDIRECTS`, but
`middleware.ts:427` `fuzzyResolveSlug()` catches them, so they redirect rather
than 404. Costs a hop, not a page. Worth cleaning up eventually.

Note `scripts/check-internal-hub-links.js` does **not** catch these: it only
inspects two-segment `/universities/{uni}/{prog}` paths, not one-segment
university URLs. Extend it if this class matters.

The underlying cannibalisation picture, for reference: 55 hub/programme combos
have a competing review blog. The blog wins position, the hub gets buried,
sometimes badly (`chandigarh/mba` 40.05, `jamia-hamdard/mba` 36.95,
`shoolini/mba` 27.40).

**The hub is the better page** and should be the one to win. `UniProgramBody`
renders ~24 sections (FeeBreakdown, EMIPlans, Placements, TopHirers,
ComparisonTable, RedFlags, SampleCertificate, CouponCard, StickyLeadCard,
Course/Offer schema) against roughly 1,300 words and 7 H2s in a typical review
blog.

Remaining approach, in risk order:
1. **Do not redirect anything.** An earlier draft suggested 301-ing hubs into
   blogs. That was wrong and would discard the better page.
2. Differentiate intent: hub owns `{uni} mba fees`, blog owns
   `{uni} mba review` / `is it worth it`.
3. Leave pairs that already sit close alone (`vignan/mba` hub 7.24 vs blog 6.74,
   `jamia-hamdard/ma` hub 6.67 vs blog 7.45). They are not being harmed.

### 5b-bis. Parul fee corrections (DONE 2026-08-23, commit `5c4cce7`)

Found while researching the Parul MBA review. Two stored fees were wrong on
live pages, both confirmed by the founder and corrected:

| Programme | Was | Now | Why it was wrong |
|---|---|---|---|
| MCA | `₹30K` | `₹1,20,000` | `₹30,000` is the per-semester figure, not the 2-year total. Page understated cost 4x. |
| BA | `₹60K – ₹70K` | `₹1,10,000` | Placeholder range understating the 3-year total. |
| MBA | `₹1,50,000` | unchanged | Already matched the portal exactly. |

**Neither was gated before.** Both old values parsed cleanly under fee rule 1,
so the pages were indexable and simply displaying wrong numbers. These were
accuracy fixes, not indexability fixes. Do not expect an index change from them.

Portal lists ₹18,500 per semester for BA, which computes to ₹1,11,000 over six
semesters against the founder's ₹1,10,000. The ₹1,000 gap is noted inline in
`lib/data.ts` for a later check.

Still placeholders at Parul, left alone pending confirmation:

| Programme | Stored | Gate | Portal implies |
|---|---|---|---|
| BBA | `₹18K – ₹70K` | 4a, spans 3.9x | ₹1,11,000 |
| BCA | `₹0.1L – ₹0.9L` | 4a, spans 9.0x | ₹1,11,000 |
| M.Com | `₹15K – ₹60K` | 4a, spans 4.0x | ₹60,000 |
| MA | none | 4b | ₹60,000 |

Also unresolved: **B.Com has a live page pulling 1,177 impressions but appears
in neither the official portal nor the Supabase programme list.** Worth checking
whether the programme actually exists.

### 5e. Bangalore University advertises two MA subjects it does not offer (OPEN, needs a decision)

Found 2026-08-23 while researching the Bangalore University review. **Blocked
the blog rather than writing on top of it.**

`lib/data.ts` lists 7 MA specialisations for `bangalore-university-online`:
English, Political Science, Sociology, **Psychology**, Economics, History,
**Public Administration**.

Three independent sources agree the real list is different:

| Source | MA subjects |
|---|---|
| Supabase `programmes` | Economics, English, Hindi, History, Kannada, Political Science, Sociology |
| Official CDOE portal `ddebubonline.in` | Economics, English, History, Sociology, Political Science, Hindi, Kannada |
| Web search of CDOE prospectus | same seven |

So **Psychology and Public Administration are not offered**, and **Hindi and
Kannada are missing from the site**.

This matters because those two are the best-performing Bangalore pages:

| URL | Impr. | Clicks | CTR | Pos |
|---|---|---|---|---|
| `/bangalore-university-online/ma/psychology` | 673 | 28 | **4.16%** | 6.52 |
| `/bangalore-university-online/ma/public-administration` | 193 | 7 | **3.63%** | 5.92 |

Bangalore University sent **11 CRM leads, all MA**. Some may have come from
these two pages, meaning people enquired about a course they cannot enrol in.

Two related problems in the same entry:

- **B.Com and M.Com specialisations look fabricated too.** The site lists
  Finance, Accounting, Taxation, E-Commerce, Banking & Insurance for B.Com and
  a similar set for M.Com. The portal offers both only as "(General)" with no
  specialisations. `/mcom/taxation` ranks at 5.71% CTR and `/mcom/finance` at
  3.51%, so the same pattern applies.
- **M.Sc (Mathematics) is missing.** Both Supabase and the portal list it;
  `lib/data.ts` has only B.Com, MA and M.Com.

Do not simply delete the pages. They rank and convert, so the options are to
redirect them to the MA hub, replace them with the real subjects (Hindi,
Kannada), or verify with the university whether these run under a different
name. That is a founder decision, not a code fix.

**Worth checking whether this pattern repeats at other universities.** The spec
lists in `lib/data.ts` have not been reconciled against Supabase or the portals
anywhere, and a spec page for a non-existent course is a trust problem as well
as a refund-request problem.

### 5d. Content gap, ranked by proven CRM demand

Universities sending leads with **no review blog**. All 128 universities already exist in `lib/data.ts`, so this is a content gap, not a coverage gap. Only 40 have review blogs.

| University | Leads | Impressions | Best pos |
|---|---|---|---|
| Parul | 13 | 8,821 | 7.44 |
| Bharati Vidyapeeth | 11 | 3,665 | 4.94 |
| Bangalore University | 11 | 3,155 | 4.14 |
| DDU Gorakhpur | 10 | 10,227 | 4.77 |
| Amrita (MBA; BBA exists) | 9 | 2,159 | 8.64 |
| SPPU | 8 | 8,451 | 7.63 |
| Mody | 7 | 9 | 6.44 |

Mody is the standout: 7 leads from 9 impressions means real demand against an empty SERP.

**Progress: 1 of 7 written.**

| University | Leads | Status |
|---|---|---|
| Parul | 13 | **Draft written** 2026-08-23, commit `3add85a`. `content/blogs/parul-online-mba-review/`. QA 20/20. Held at `status: draft` pending a human re-check of the ₹1,50,000 fee on the live portal. |
| Bharati Vidyapeeth | 11 | Not started |
| Bangalore University | 11 | Not started |
| DDU Gorakhpur | 10 | Not started |
| Amrita (MBA) | 9 | Not started |
| SPPU | 8 | Not started |
| Mody | 7 | Not started |

**To publish Parul:** add the post object to `lib/blog.ts` with
`status: 'published'`, and add a `parul-university-online` entry to
`UNIVERSITY_PROGRAM_LINKS` in `lib/internal-links.ts` so `BlogRelatedLinks`
renders and the blog feeds authority back to the hub (see 5c).

**Reusable method, proven on Parul.** The strongest angle came from research,
not invention. Competitors published four different fee totals (₹99,000,
₹1,00,000, ₹90,000, ₹80,000) and none matched the portal's ₹1,50,000; at least
one asserted AICTE approval that no official source supports; several cited
"NIRF ranked" beside MBA content when Parul's only verified NIRF entry is
Pharmacy #41 with no Management rank at all. Run the same three checks on every
remaining university: portal fee vs circulating fees, claimed approvals vs
Supabase, and NIRF claims vs actual category.

Programme mix from CRM: MBA 125, BBA 36, MA 35, MCA 26, BCA 26, B.Com 20, BA 19, BSc 7. **BBA + BCA + MA together are 28% of leads** and have almost no review content, while their hubs already rank 8 to 10.

---

## 6. Calibration on expected gains

Realistic: **+100 to +150 leads per six months** from consolidation work, not the +403 quoted in the first draft of the artifact. That figure assumed position 3 across all 17 clusters, which is not reachable where the universities' own domains outrank us on brand queries.

Confidence split:
- **High** — hubs buried at 27 to 40 are suppressed rather than beaten; they should recover into the teens.
- **Medium** — pairs at 7 to 11 consolidating to one page at 5 to 7.
- **Low** — position 3 on brand fee queries.

Rankings wobble for two to four weeks after link-graph changes. **Judge at week six, not week two.**

---

## 7. Files touched

### Commit `34bbbfa` — blog to hub mapping

| File | Change |
|---|---|
| `lib/internal-links.ts` | +9 validated blog to hub mappings; skip reasons recorded inline |

### Commit `563926f` — 404 fix and sibling mesh

| File | Change |
|---|---|
| `lib/seo/safe-internal-links.ts` | new. `isLinkable`, `hubResolves`, `getSiblingProgrammes`, `getResolvableProgrammes` |
| `components/SiblingProgrammes.tsx` | new. Renders the sibling hub block |
| `scripts/check-internal-hub-links.js` | new. Post-build broken-link gate |
| `components/UniProgramBody.tsx` | renders `<SiblingProgrammes>` |
| `components/UniversityPageClient.tsx` | links from `linkableProgrammes` prop, not `u.programs` |
| `app/universities/[id]/page.tsx` | computes `getResolvableProgrammes()` server-side |
| `lib/data/valid-urls.json` | regenerated (was stale: 1,779 vs 1,780 correct) |

Verification: `tsc --noEmit` 0 errors, production build clean, 11/11 pre-commit gates passed, 0 broken links across 2,219 pages.
