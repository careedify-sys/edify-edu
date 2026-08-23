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

---

## 5. Still open

### 5a. Sitemap ships ~1,400 redirecting URLs (not fixed, deliberately)

Vercel runs only `prebuild`, which skips normalize. So production's sitemap is the un-normalized ~3,189-entry version, carrying roughly 1,400 non-canonical spec URLs that 301. Shows in GSC as "Page with redirect".

The obvious fix is adding normalize to `prebuild`. **Do not do this blind.** `scripts/build-programme-allowlist.js:16` documents a tsx-hook loader race under Vercel's Node-24 prebuild that broke an earlier branch, and normalize is a `.mts` requiring tsx. Test on a branch with a real deploy.

### 5b. 35 hubs are noindex while still earning traffic

35 hubs, 36,310 impressions, 88 clicks. They fail `shouldIndexProgrammeHub` (needs page-content JSON **or** a verified fee, they have neither). Mostly BCA/BBA/B.Com. Biggest: `pp-savani/bca` 4,506 impressions, `integral/bca` 3,164, `gls/bba` 3,111, `sppu/bba` 2,157.

Fixing the fee data flips them to indexable. Ties into the parked 125-row placeholder-fee cluster.

> An earlier figure of "87 hubs / 77,376 impressions" was computed from a stale `valid-urls.json` and is **wrong**. 35 / 36,310 is correct.

### 5c. Blog vs hub cannibalisation (analysed, not actioned)

55 hub/programme combos have a competing review blog. The blog wins position, the hub gets buried, sometimes badly: `chandigarh/mba` 40.05, `jamia-hamdard/mba` 36.95, `shoolini/mba` 27.40.

**The hub is the better page** and should be the one to win: `UniProgramBody` renders ~24 sections (FeeBreakdown, EMIPlans, Placements, TopHirers, ComparisonTable, RedFlags, SampleCertificate, CouponCard, StickyLeadCard, Course/Offer schema) against roughly 1,300 words and 7 H2s in a typical review blog.

Recommended approach, in risk order:
1. **Do not redirect anything.** An earlier draft of this plan suggested 301-ing hubs into blogs. That was wrong and would discard the better page.
2. Differentiate intent: hub owns `{uni} mba fees`, blog owns `{uni} mba review` / `is it worth it`.
3. Repoint the **33 fee-intent anchors that currently point at review blogs** (found in `lib/blog.ts`, e.g. `"Galgotias online MBA fees" -> /blog/galgotias-online-mba-review`) to the hub instead.
4. Leave pairs that already sit close alone (`vignan/mba` hub 7.24 vs blog 6.74, `jamia-hamdard/ma` hub 6.67 vs blog 7.45). They are not being harmed.

Also noted while scanning: two anchors render duplicated tokens, `"MUJMUJ MBA Review 2026..."` and `"SMUSMU MBA Review..."`. Separate cosmetic bug in the link builder.

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

## 7. Files touched (commit `563926f`)

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
