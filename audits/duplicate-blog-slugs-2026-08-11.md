# Duplicate blog slugs in `lib/blog.ts` — 2026-08-11 audit

## Summary

`lib/blog.ts` `BLOG_POSTS` contains **12 duplicated slugs**. Each duplicate has two entries: an older **JSON-stringified** entry (added 2026-05-05 in commit `cd76c30`) and a later **template-literal** entry (added 2026-05-26 in commit `a78ec2e`). All 24 entries carry `status: "published"`, so both flow through `getPublishedPosts()` / `getPublishedListings()` and hit the sitemap and the `/blog` index card list twice. `getPostBySlug()` uses `.find()`, so the earlier (JSON-stringified) entry wins for `/blog/{slug}` detail rendering and the later entry has never rendered.

Runtime confirmation via `getPublishedPosts()`:

```
total published entries: 184
distinct slugs:          172
duplicated slugs:         12
```

## The 12 duplicated slugs

Word counts are approximate (whitespace-split after HTML strip). Similarity is `difflib.SequenceMatcher` over the first 6,000 stripped characters of each content body.

| # | Slug | Winner (line) | Losing entry (line) | Winner words | Loser words | 6k-char similarity | Title differs? | Meta differs? |
|---|---|---|---|---:|---:|---:|:-:|:-:|
| 1 | `amity-online-bba-fees-2026` | 31815 (json-string) | 33458 (template-lit) | 2270 | 2253 | 0.94 | no | no |
| 2 | `amity-online-bba-review-2026` | 31893 (json-string) | 33688 (template-lit) | 2500 | 2505 | 0.93 | no | no |
| 3 | `mba-hr-management-online-india-2026` | 31975 (json-string) | 34576 (template-lit) | 2963 | 2960 | **0.72** | no | **yes** |
| 4 | `mba-pharmaceutical-management-online-india-2026` | 32047 (json-string) | 34790 (template-lit) | 2162 | 2146 | **0.55** | no | no |
| 5 | `online-bba-degree-india-validity-2026` | 32119 (json-string) | 34958 (template-lit) | 2757 | 2694 | **0.73** | no | no |
| 6 | `online-bba-programs-india-2026` | 32187 (json-string) | 35217 (template-lit) | 3161 | 3135 | **0.52** | **yes** | **yes** |
| 7 | `online-mba-aviation-management-india-2026` | 32259 (json-string) | 35455 (template-lit) | 2382 | 2361 | 0.95 | **yes** | no |
| 8 | `online-mba-business-data-analytics-india-2026` | 32327 (json-string) | 35636 (template-lit) | 2907 | 2912 | 0.93 | no | **yes** |
| 9 | `online-mba-entrepreneurship-india-2026` | 32399 (json-string) | 35857 (template-lit) | 2415 | 2396 | **0.57** | no | **yes** |
| 10 | `online-mba-event-management-india-2026` | 32471 (json-string) | 36046 (template-lit) | 2280 | 2255 | 0.90 | no | no |
| 11 | `online-mba-supply-chain-management-india-2026` | 32535 (json-string) | 36435 (template-lit) | 2494 | 2521 | 0.95 | no | no |
| 12 | `upes-online-mba-review-2026` | 32607 (json-string) | 36626 (template-lit) | 2432 | 2403 | 0.90 | no | **yes** |

Winner column is the entry `.find()` returns first (lower line number → earlier position in `BLOG_POSTS` array → wins).

## Rewrites that never shipped

Four entries — half of a substantive rewrite — sit orphaned in the losing template-literal position. Materially different (< 0.75 similarity or an outright title change):

- **`online-bba-programs-india-2026`** (**loser at L35217, 3,135 words, similarity 0.52**). Title diverges: `"Online BBA Programs 2026: 10+ Specialisations Compared"` (json winner) vs `"Best Online BBA Programs India 2026: Tier 1 vs Tier 2"` (template loser). Meta also differs. This is the same duplicate the DPU/DYPatil listing-post fixes had to patch twice on 2026-08-11 — see FIX 2 commit `48473e2` in `feat/dy-patil-fee-corrections`.
- **`mba-pharmaceutical-management-online-india-2026`** (loser at L34790, 2,146 words, similarity 0.55). Same title/meta but ~45% of first-6k-char content changed — likely a significant body rewrite that hasn't rendered.
- **`online-mba-entrepreneurship-india-2026`** (loser at L35857, 2,396 words, similarity 0.57). Meta differs plus large content divergence.
- **`mba-hr-management-online-india-2026`** (loser at L34576, 2,960 words, similarity 0.72). Meta differs. Substantial body edits invisible to readers.
- **`online-bba-degree-india-validity-2026`** (loser at L34958, 2,694 words, similarity 0.73). ~27% first-6k-char divergence.

Three entries carry title or meta changes without deep body divergence (nominal-similarity rewrites where the copy chief updated title/meta but the body stayed close):

- **`online-mba-aviation-management-india-2026`**: title changed from `"…: Fees & Universities"` to `"…: Fees & Scope"` (loser) — never rendered.
- **`online-mba-business-data-analytics-india-2026`**: meta rewritten (loser) — never rendered.
- **`upes-online-mba-review-2026`**: meta rewritten (loser) — never rendered.

The remaining four (`amity-online-bba-fees-2026`, `amity-online-bba-review-2026`, `online-mba-event-management-india-2026`, `online-mba-supply-chain-management-india-2026`) are near-identical (≥ 0.90 similarity, same title, same meta). Those are cosmetic drift only.

## How the duplicates arose

Two commits, three weeks apart:

- **`cd76c30`** — 2026-05-05 21:11 IST — `careedify-sys` — **"feat: publish 18 new blogs (university reviews + MBA specialisations + BBA guides)"**. Added 18 posts in the JSON-stringified `"slug": "..."` format. This is where the winners came from. Commit body enumerates the 18 slugs.
- **`a78ec2e`** — 2026-05-26 23:20 IST — `careedify-sys` — **"feat(links): inject 3 remaining internal links into blog content"**. Commit message claims to add 3 internal links; actual diff to `lib/blog.ts` inserts **18 template-literal `slug: '...'` blocks** (~512 lines added). Twelve of those 18 collide with slugs already present from `cd76c30` — hence the 12 duplicates. The other 6 slugs added by `a78ec2e` (`bits-pilani-online-mba-review-2026`, `imt-ghaziabad-online-mba-review-2026`, `jain-online-mba-review-2026`, `online-bba-in-india-2026`, `online-mba-hospital-healthcare-management-india-2026`, `xlri-online-mba-review-2026`) don't collide because the JSON-stringified originals of those had different slugs or weren't in `cd76c30`.

`a78ec2e`'s message understates what the commit did. Whoever ran it appears to have regenerated the whole batch of 18 posts from an external tool that emitted the template-literal shape, appended the output to the file rather than diff-merging it in place, and titled the commit after the small side-change (three internal-link injections) that motivated running the pipeline.

## Double-count blast radius

| Consumer | Path | Iteration mode | Double-counts? |
|---|---|---|:-:|
| **`/sitemap.xml`** | `app/sitemap.ts:181` → `getPublishedPosts()` → `.filter(status==='published').sort(...)` → map to `/blog/{slug}` URL | filter + map | **Yes.** 12 duplicate URL entries emitted. |
| **`/blog` index page** | `app/blog/page.tsx:127` → `getPublishedListings()` → `.filter(status==='published').sort(...)` → map to `BlogListing` | filter + map | **Yes.** Duplicate cards render for the 12 slugs. |
| **`/blog/{slug}` detail** | `app/blog/[slug]/page.tsx` → `getPostBySlug(slug)` → `.find()` | find | No. First entry wins (json-string). Losing entry never rendered. |
| **`BLOG_CATEGORIES`** | `lib/blog.ts:45864` → `Array.from(new Set(BLOG_POSTS.map(p => p.category).filter(Boolean)))` | map + Set-dedupe | No. Set collapses duplicate category strings. |
| **Blog fee scanner** | `scripts/lib/blog-fee-scan.mjs` → `for (const post of BLOG_POSTS)` | iterate all entries | **Yes.** Every rupee figure in the 12 dup posts appears twice in `audits/blog-fee-crossref-*.csv` and doubles the per-slug loose count in `data/blog-fee-baseline.json`. This is why the 2026-08-11 DPU fee-correction commit reported "165 → 151" for `online-bba-programs-india-2026`: 14 fee figures × 2 entries = 28 unverified figures that dropped when both entries were patched. |
| **`lib/data/valid-urls.json`** | `scripts/build-valid-urls.js` — reads Excel only | n/a | No. Excel-driven; no `BLOG_POSTS` reference in the build script. |
| **`scripts/build-blog-fee-triage.mjs`** | Line 39: `new Map(BLOG_POSTS.map(p => [p.slug, p]))` | Map by slug | No, but silently keeps the LATER entry (Map insertion overwrites). This means the triage report reads from the template-literal entry, while runtime reads from the JSON-string entry — silently divergent views of the same slug. |
| **`scripts/sample-blog-fee-mismatches.mjs`** | Line 22: same `new Map(BLOG_POSTS.map(p => [p.slug, p]))` | Map by slug | No, same silent-divergence caveat. |

## Recommended follow-up (out of scope for this audit)

1. **Merge losing entries into winners** where the losing entry carries a real rewrite (rows 3–9 above). For row 6 in particular, the DPU BBA fee corrections landed on both entries in `48473e2` but the substantive title/meta divergence still means half a rewrite is orphaned.
2. **Delete winner-identical losing entries** (rows 1, 2, 10, 11, 12 — ≥ 0.90 similarity with no title/meta divergence).
3. **Add a duplicate-slug gate** to pre-commit — a five-line check that fails the commit if `BLOG_POSTS.map(p => p.slug).length !== new Set(...).size`. Would have caught `a78ec2e` at author time.
4. **Fix the two triage scripts** to warn on duplicate slugs when building their `Map`.
5. **Regenerate sitemap** after deduplication so the 12 duplicate URLs are removed from `sitemap.xml` before the next Search Console read.

## Provenance of this report

- Enumeration: regex scan for `"slug": "..."` (JSON-stringified) and `^  slug: '...'` (template-literal at 4-space indent) across `lib/blog.ts`.
- Word counts and similarity: HTML tags stripped, backslash-escaped JSON unescaped, `difflib.SequenceMatcher` on first 6,000 stripped chars.
- Runtime double-count confirmation: `npx tsx -e "import { getPublishedPosts } from './lib/blog.ts'; ..."` on main at HEAD.
- Git history: `git log --all -S '<slug>'` for slug additions; `git show <sha>` for commit body and diff.
