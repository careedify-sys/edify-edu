# SEO Diagnostic — 2026-08-07

Audit-only. No code changes. Evidence is `file:line` from the working tree at
commit `3a6377e` (branch `feat/thin-page-gating`).

---

## Issue 1 — Soft 404s

### Claim
`/universities/amitty-onlinex/mba`, `/universities/amity-online/mba-in-quantum-astrology`,
`/universities/lpu-online/mba` return HTTP 200 with a "Not Found" / "Program Not Found"
title.

### What the code actually does
Every route handler for `/universities/[id]`, `/universities/[id]/[program]`,
`/universities/[id]/[program]/[spec]` and the four fixed-program variants
(`mba`, `mca`, `bba`, `bca`, plus their `[spec]` children) calls Next's
`notFound()` when the slug misses. `notFound()` throws `NEXT_NOT_FOUND`, which
the framework catches, renders [app/not-found.tsx](app/not-found.tsx) and sets
HTTP 404.

Route-by-route `notFound()` sites:

| Route file | notFound() line(s) |
|---|---|
| [app/universities/[id]/page.tsx:179](app/universities/[id]/page.tsx#L179) | slug miss |
| [app/universities/[id]/mba/page.tsx:184,188](app/universities/[id]/mba/page.tsx#L184) | uni miss / missing MBA in `programs` |
| [app/universities/[id]/mca/page.tsx:125,127](app/universities/[id]/mca/page.tsx#L125) | same pair |
| [app/universities/[id]/bba/page.tsx:123,125](app/universities/[id]/bba/page.tsx#L123) | same pair |
| [app/universities/[id]/bca/page.tsx:123,125](app/universities/[id]/bca/page.tsx#L123) | same pair |
| [app/universities/[id]/[program]/page.tsx:184–187](app/universities/[id]/[program]/page.tsx#L184) | uni, program, program-not-offered |
| [app/universities/[id]/mba/[spec]/page.tsx:61,66](app/universities/[id]/mba/[spec]/page.tsx#L61) | uni miss / spec miss |
| [app/universities/[id]/mca/[spec]/page.tsx:56,61](app/universities/[id]/mca/[spec]/page.tsx#L56) | same |
| [app/universities/[id]/bba/[spec]/page.tsx:47,52](app/universities/[id]/bba/[spec]/page.tsx#L47) | same |
| [app/universities/[id]/bca/[spec]/page.tsx:47,52](app/universities/[id]/bca/[spec]/page.tsx#L47) | same |
| [app/universities/[id]/[program]/[spec]/page.tsx:65,85](app/universities/[id]/[program]/[spec]/page.tsx#L65) | uni, spec |

The custom 404 page [app/not-found.tsx](app/not-found.tsx) renders
"Page not found" with "Error 404" copy — not "Not Found" / "Program Not Found".

### Where the "Not Found" title comes from
Every `generateMetadata()` on those same pages returns metadata as a fallback
before the page function runs. For a slug miss those metadata objects contain:

- [app/universities/[id]/mba/page.tsx:23](app/universities/[id]/mba/page.tsx#L23) →
  `{ title: 'Not Found', robots: { index: false, follow: false } }`
- [app/universities/[id]/[program]/page.tsx:50](app/universities/[id]/[program]/page.tsx#L50) →
  `{ title: 'Program Not Found', robots: { index: false, follow: false } }`
- All `[spec]` variants — `{ title: 'Not Found', ... }`.

That is where the observed `<title>Not Found</title>` and
`<title>Program Not Found</title>` originate.

### The 200 vs 404 mismatch
Code intent is 404. The live 200 status you observed cannot come from the code
paths above — those either 404 (page function calls `notFound()`) or 308
(middleware redirects, see Issue 2).

The most plausible runtime cause is Vercel ISR / edge cache holding a stale
successful response. Both `/universities/[id]/mba` and
`/universities/[id]/[program]` set `export const revalidate = false`
([mba/page.tsx:210](app/universities/[id]/mba/page.tsx#L210),
[[program]/page.tsx:206](app/universities/[id]/[program]/page.tsx#L206)),
which means "cache indefinitely". Combined with `dynamicParams = true`
([[program]/page.tsx:209](app/universities/[id]/[program]/page.tsx#L209)),
any URL that ever rendered a 200 in a past build is kept as a 200 forever
until the cache is invalidated. If a prior build had a broader
`getUniversityById`, a laxer PM map, or different `programs` arrays, the 200
was cached then and is still being served now with the current, "leaner" body.

Nothing in the source today renders a "Not Found" body inside a 200 response
on purpose. This is a cache-purge / revalidate issue, not a code-path bug.

### Scale
Any `/universities/{unknown-slug}` and `/universities/{uni}/{unknown-program}`
URL that ever rendered successfully in the past is a candidate. Impossible to
count precisely without the Vercel cache manifest, but the pattern applies to
five templates × 131 universities × ISR history.

---

## Issue 2 — Duplicate slug aliasing

### Claim
`/universities/amity-online/mba` and `/universities/amity-university-online/mba`
both return HTTP 200 with identical 310,706-byte bodies. Canonical points to
`amity-university-online`.

### What the code actually does
`getUniversityById` is a strict `===` match:
[lib/data.ts:136](lib/data.ts#L136)
```
export function getUniversityById(id: string) { return UNIVERSITIES.find(u => u.id === id) }
```

`amity-online` is **not** a university id in `UNIVERSITIES[]`. The only place
the literal string `amity-online` appears in `lib/data.ts` is the logo
filename (line 267 — `/logos/university_logos/amity-online-university-logo_2.svg`).

There is **no** alias map that maps `amity-online → amity-university-online`
returning a 200. Two things do exist:

1. **[middleware.ts:22–176](middleware.ts#L22)** — `OLD_SLUG_REDIRECTS` explicit
   map, 308 redirects. Includes `'amity': 'amity-university-online'`,
   `'lpu': 'lovely-professional-university-online'`, `'manipal-jaipur': ...`,
   etc. **No entry** for `'amity-online'` or `'lpu-online'`.
2. **[middleware.ts:204–254](middleware.ts#L204)** — `fuzzyResolveSlug()`
   token-overlap resolver. For an unknown slug it strips stop-tokens
   (including `online`, `university`, `universi`) and picks the closest
   canonical by matched-token count. For `amity-online` the surviving token
   is `['amity']` → best match `amity-university-online` → **308** at
   [middleware.ts:422](middleware.ts#L422).

So the code path for `amity-online` is: middleware 308 → `amity-university-online/mba`.
There is no code that emits a 200 with an aliased body.

### The 200-with-identical-body mismatch
Same root cause as Issue 1: the mba route runs with `revalidate = false`
([app/universities/[id]/mba/page.tsx:210](app/universities/[id]/mba/page.tsx#L210)).
If, at any point in the past, `amity-online` was in `generateStaticParams` or
was an accepted id, its rendered HTML got frozen in Vercel's ISR cache and is
still being served. Middleware fires per request in Vercel, so a stored 200
implies the middleware is not seeing that request today — the CDN layer is
answering before middleware runs (SSG-cached HTML at the edge). The two URLs
would return identical bytes because both `id` values render the same
template with the same lookup result once the template was baked.

There is no in-code 301/308 → 200 layer today; the aliasing behaviour is a
cache artifact, not a code feature.

### Duplicate slugs & internal links
- **Canonical registry**: [lib/canonical-slugs.json](lib/canonical-slugs.json)
  is the single list; `amity-online` and `lpu-online` are **not** in it.
- **Universities with more than one working slug**: zero, per `UNIVERSITIES[]`.
  Every entry has one `id`. Every "extra" slug that resolves today does so
  via ISR cache, not data.
- **301 redirect layer**: none in code. Middleware issues 308 (permanent
  redirect, treated by Google like 301). `next.config.js` `redirects()` block
  is 100% 308s (via `permanent: true`).
- **Internal-link audit**: `grep -rn '/universities/amity-online[^-]'`
  across `.ts`, `.tsx`, `.js`, `.json` → **0 hits**. No component links to
  the non-canonical variant.

### Scale
- 0 non-canonical slugs in `UNIVERSITIES[]`.
- 0 non-canonical `/universities/{alias}` links in the codebase.
- Unknown non-canonical URLs surviving in Vercel's ISR cache — this is the
  actual measurable population; needs a Vercel cache dump or a live sweep
  against a fresh deployment to size.

---

## Issue 3 — Review schema source

### Claim
Every hub emits JSON-LD with `aggregateRating` and a `review[]` array
containing authors like "Mohit A.", "Nisha B.", etc.

### What the code actually does

**Emitters** (only two components in the codebase touch `aggregateRating`):

1. [components/SchemaBlock.tsx:94–110](components/SchemaBlock.tsx#L94) —
   nests `aggregateRating` and `review[]` **inside the `Course` JSON-LD**.
   `avgRating` computed from the `reviews` prop
   ([SchemaBlock.tsx:46–48](components/SchemaBlock.tsx#L46)). This is what
   ships to Google.
2. [components/ReviewsBlock.tsx:32](components/ReviewsBlock.tsx#L32) —
   comment only. Standalone AggregateRating schema was intentionally removed
   ("Google requires itemReviewed"). ReviewsBlock renders the reviews to the
   DOM but does not emit schema itself.

**Feeder — hub pages** (`/universities/{u}/{program}` templates):
[components/UniProgramBody.tsx:148–151](components/UniProgramBody.tsx#L148)
```
// Use content JSON reviews for schema when available — falls back to UNIVERSITY_REVIEWS
const schemaReviews = s.reviews?.items?.length
  ? s.reviews.items.map(r => ({ ... }))
  : (UNIVERSITY_REVIEWS[u.id] || []).slice(0, 5).map(r => ({ name: r.name, city: r.city, rating: r.rating, body: r.review }))
```

**Feeder — spec pages** (`/universities/{u}/{program}/{spec}` templates):
[components/UniSpecBody.tsx:338–346](components/UniSpecBody.tsx#L338)
```
const schemaReviews = specJson?.sections.reviews?.items?.length
  ? specJson.sections.reviews.items.map(r => ({ name, city, year, rating, body }))
  : undefined
```

### Sources of truth (neither is user data)

1. **[lib/data/page-content/*.json](lib/data/page-content)** — 348 files
   total, **313 carry a `reviews.items` array**, **154 use the
   "First-Name Last-Initial" pattern** ("Mohit A.", "Nisha B.", "Tarun C.",
   "Pooja D.", "Harish E."). Confirmed hits in
   [amity-university-online-mba.json](lib/data/page-content/amity-university-online-mba.json),
   [galgotias-university-online-mba.json](lib/data/page-content/galgotias-university-online-mba.json),
   [shoolini-university-online-mba-tourism-management.json](lib/data/page-content/shoolini-university-online-mba-tourism-management.json)
   (and 151 others).
2. **[lib/reviews-data.ts](lib/reviews-data.ts)** — `UNIVERSITY_REVIEWS` and
   `GENERIC_REVIEWS`. Uses full first + last name with city and month/year
   (e.g., "Rahul Sharma, Delhi, July 2023"). Serves as the fallback on hub
   pages and as the direct feed for the on-page `ReviewsBlock`.

### Is any of this real user data?
**No.** Both sources are hand-authored static content. Confirmed by:

- **No review-collection API route**: `app/api/` contains
  `admin-auth`, `admin-verify-otp`, `cms`, `cron`, `enquiry`, `events`,
  `helpdesk`, `leads`, `pexels`, `publish-to-github`, `revalidate`,
  `universities`, `verify`. None mentions reviews.
- **No Supabase reviews table**: `grep -rln 'review' lib/supabase/` → 0
  results. `lib/supabase/{client,server,service}.ts` do not query or write
  reviews.
- **No client-side form** posts to a review endpoint.

### Scale
- 2 components emit schema mentioning reviews:
  [SchemaBlock.tsx](components/SchemaBlock.tsx) (Course schema — the one Google reads),
  [ReviewsBlock.tsx](components/ReviewsBlock.tsx) (DOM only, no schema).
- 2 feeder components pass `reviews` into `SchemaBlock`:
  [UniProgramBody.tsx](components/UniProgramBody.tsx) (hubs),
  [UniSpecBody.tsx](components/UniSpecBody.tsx) (spec pages).
- 313 spec/hub JSON files carry review arrays.
- All reviews are static author-written content, not submitted by real
  students.

---

## Issue 4 — Hub/blog cannibalization

### Claim
GSC shows blog ranking above hub for the same intent (Chandigarh MBA:
blog at 9.91 with 10,137 impressions; hub at 39.43 with 1,200). Amity and
LPU hubs don't rank while their blogs do.

### What actually indexes today

Every target hub is in the sitemap ([lib/data/valid-urls.json](lib/data/valid-urls.json))
and each hub template unconditionally sets `robots.follow: true` and computes
`robots.index` via `shouldIndexProgrammeHub()`
([lib/seo/should-index.ts:32](lib/seo/should-index.ts#L32)). A hub indexes
when it has either a page-content JSON or a resolvable fee. All nine target
hubs below have `feeOk === true`, so all nine emit `index: true`.

Every blog post sets `robots.index: true, follow: true` unconditionally
([app/blog/[slug]/page.tsx:100–104](app/blog/[slug]/page.tsx#L100))
and its own self-canonical
([app/blog/[slug]/page.tsx:126](app/blog/[slug]/page.tsx#L126)).

### The overlap set

Sitemap membership confirmed by presence in `lib/data/valid-urls.json`.
Blog membership confirmed by [lib/blog.ts](lib/blog.ts). Word counts are
approximations from the single-file blog dataset.

**Amity (`amity-university-online`)**
| URL | Title | Meta (first 100c) | Canonical | Robots | Sitemap |
|---|---|---|---|---|---|
| `/universities/amity-university-online/mba` | Amity University Online MBA Fees 2026: ₹2.07L–₹2.25L, NAAC A+ [Review] \| edifyedu.in | Amity Univ… ₹2.07L–₹2.25L fees, 19+ specialisations, NAAC A+, NIRF #22. UGC-DEB approved. | self | index,follow | ✅ |
| `/blog/amity-online-mba-review-2026` | Amity University Online MBA Fees 2026: ₹2.07L Review and Honest Assessment | Amity Online MBA honest review: ₹2.07L to ₹4.49L fees, 14 specialisations, placement reality… | self | index,follow | ✅ |
| `/blog/amity-online-mba-hr-worth-it` | Is Amity Online MBA HR Worth It? Honest Verdict 2026 | Amity University online MBA HR review 2026, fees, HR+Finance dual specialisation… | self | index,follow | ✅ |
| `/blog/jain-vs-amity-online-mba-2026` | JAIN vs Amity Online MBA 2026: Does A++ Beat A+ for Your Career? | JAIN (NAAC A++) vs Amity (NAAC A+) online MBA compared: fees ₹1.96L vs ₹2.25L… | self | index,follow | ✅ |
| `/blog/amity-vs-manipal-online-mba-2026` | Amity vs Manipal Online MBA 2026: Fees, NAAC, Placements Compared | Amity vs Manipal University Jaipur online MBA compared: fees ₹2.07L vs ₹1.53L… | self | index,follow | ✅ |
| `/coupons/amity-online-mba-discount-coupon-2026` | Amity Online MBA coupon page | (see lib/coupon-pages.ts:42) | self | index,follow | ✅ |
| `/verify/amity-university-online` | verify page | — | self | index,follow | ✅ |
| `/compare` and `/compare/[pair]` | site-wide compare | — | self | index,follow | ✅ |

**Manipal (three universities, one blog covering all three)**
- `/universities/manipal-academy-higher-education-online/mba` (hub, MAHE)
- `/universities/manipal-university-jaipur-online/mba` (hub, MUJ)
- `/universities/sikkim-manipal-university-online/mba` (hub, SMU)
- `/blog/online-manipal-mba-review-2026` — "Online Manipal MBA Review 2026:
  MAHE vs MUJ vs SMU Compared" — one indexable blog fights three hubs for
  every `manipal online mba` query.
- `/blog/amity-vs-manipal-online-mba-2026` — targets MUJ specifically.
- `/coupons/manipal-jaipur-online-mba-discount-coupon-2026`
- `/verify/manipal-university-jaipur-online`, `/verify/sikkim-manipal-university-online`, etc.

**LPU (`lovely-professional-university-online`)**
- `/universities/lovely-professional-university-online/mba` (hub)
- `/blog/online-mba-lpu-review-2026` — "LPU Online MBA Fees 2026: Lovely
  Professional University Review and Honest Take"
- `/blog/online-mca-amity-vs-lpu-2026`
- `/blog/lpu-vs-chandigarh-university-online-mba-2026`
- `/coupons/lpu-online-mba-discount-coupon-2026`
- `/verify/lovely-professional-university-online`

**Chandigarh (`chandigarh-university-online`)**
- `/universities/chandigarh-university-online/mba` (hub)
- `/blog/chandigarh-university-online-mba-review` — "Chandigarh University
  Online MBA Fees 2026: ₹1.65L Review and Honest Verdict"
- `/blog/lpu-vs-chandigarh-university-online-mba-2026`
- `/coupons/chandigarh-university-online-mba-discount-coupon-2026`

**Jain (`jain-university-online`) + Arka Jain (`arka-jain-university-online`)**
- `/universities/jain-university-online/mba` (hub)
- `/universities/arka-jain-university-online/mba` (hub — different institution)
- `/blog/jain-vs-amity-online-mba-2026`
- `/blog/arka-jain-online-mba-review` — "ARKA JAIN Online MBA Review 2026"
- `/coupons/jain-online-mba-discount-coupon-2026`

**Galgotias (`galgotias-university-online`)**
- `/universities/galgotias-university-online/mba` (hub — has page-content JSON,
  so it also indexes even without a review blog)
- No matching blog post found; overlap is with the /compare and /fees pages only.

### The compare + fees + verify overlap
Every uni also fights itself via:
- [/compare](app/compare/page.tsx) and `/compare/[pair]` — indexed hub page
  bidding for "vs" queries.
- [/fees](app/fees/page.tsx) — single indexed listing page with every uni's
  MBA fee.
- [/verify/{slug}](app/verify/[slug]/page.tsx) — 10 verify pages, indexed,
  brand-name queries.

### Scale
- 9 university/programme hubs (all `index,follow`).
- 13 target-relevant blog posts (all `index,follow`, all self-canonical, all
  in the sitemap).
- 6 coupon pages targeting the same brand+programme keywords.
- 4 verify pages on the same brands.
- No `rel=canonical` linking blog → hub (or vice versa) anywhere in the
  targeted set.

That is the raw overlap. No recommendation attached, per instruction.

---

## Issue 5 — Fee contradiction

### Claim
Amity MBA hub title says ₹2.07L–₹2.25L; Course schema `lowPrice 207000` /
`highPrice 225000`. Blog `/blog/amity-online-mba-review-2026` says
₹2.07L to ₹4.49L.

### Trace: hub side
[lib/data.ts](lib/data.ts) — Amity entry (starts line 264):
```
id: 'amity-university-online',
feeMin: 207000,
feeMax: 225000,
programDetails: { MBA: { fees: '₹2.07L–₹2.25L', ... } }
```

Hub metadata: [app/universities/[id]/mba/page.tsx:64](app/universities/[id]/mba/page.tsx#L64)
```
const fee = getDisplayFee(u, 'MBA')          // → '₹2.07L–₹2.25L'
const title = clampTitleFeeLed(`... ${fee.compact} ...`)
```

Course schema: [components/SchemaBlock.tsx:66–79](components/SchemaBlock.tsx#L66)
```
offers: u.feeMin ? (u.feeMax && u.feeMax !== u.feeMin ? {
  '@type': 'AggregateOffer',
  lowPrice:  String(u.feeMin),   // → '207000'
  highPrice: String(u.feeMax),   // → '225000'
  ...
```

Both title and schema read the same source. Consistent.

### Trace: blog side
[lib/blog.ts:18955](lib/blog.ts#L18955) (metaDescription):
```
'Amity Online MBA honest review: ₹2.07L to ₹4.49L fees, 14 specialisations, ...'
```
[lib/blog.ts:18979](lib/blog.ts#L18979) (body):
```
'... The online MBA covered in this review costs ₹2.07L to ₹4.49L depending on specialization. ...'
```

The `₹4.49L` figure is a **hardcoded string literal** in `lib/blog.ts`. It is
not derived from any data source. `grep -n 'getDisplayFee|from .@/lib/fees.|from .@/lib/data.'`
inside [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx) and
[lib/blog.ts](lib/blog.ts) → **0 hits**. The blog pipeline never imports the
fee data.

### `npm run check:fees` result
Run 2026-08-07, script [scripts/check-fee-mismatches.mjs](scripts/check-fee-mismatches.mjs)
via `npm run check:fees`. Summary output:
```
FEE RESOLUTION SUMMARY (across all universities x programmes):
  Rule 1  (range agreement / trusted pd.fees) : 352
  Rule 2  (single value "From ₹X")            : 1
  Rule 3  (narrower range inside reference)   : 2
  Rule 4a (width sanity > 3x, SUPPRESSED)     : 80
  Rule 4b (>25% divergence, SUPPRESSED)       : 47
  no data (no pd.fees + no reference)         : 0
  TOTAL SUPPRESSED                            : 127
```

**127 programme rows** still show a mismatch between `pd.fees` (the human
string) and `feeMin`/`feeMax` (the numeric range) large enough that the fee
resolver refuses to render either and falls back to "verified by our
counsellor". Target-university rows visible in the suppressed list:

- `jain-university-online` BBA, MA
- `lovely-professional-university-online` BBA, BCA, BA, M.Com, MSc, MA
- `manipal-university-jaipur-online` B.Com, M.Com, MSc, MA
- `galgotias-university-online` M.Com, MA
- `sikkim-manipal-university-online` B.Com, BA, M.Com, MA
- `manipal-academy-higher-education-online` B.Com, MSc
- `chandigarh-university-online` BBA, MSc, MA

Note: **Amity MBA itself is not in the suppressed list** — its hub-side fee
is clean. The contradiction reported is blog-vs-hub, not hub-internal.

### The class of bug: blog posts hardcoding fee prose

Scan of `lib/blog.ts` for ₹-figures inside content bodies (regex
`₹\s*[0-9][0-9,]*(?:\.\d+)?\s*(?:L|Lakh|Lakhs|K)?`):

- **83 blog posts** contain hardcoded ₹-figures in prose.
- **4,501** total ₹-figure occurrences in blog HTML strings.

Top-25 offenders by count (`hits — slug`):

```
1170  ma-full-form-course-details-eligibility-fees-2026
 143  career-after-bcom-jobs-salary-courses-2026
 142  mba-hr-management-online-india-2026
 131  career-after-mba-jobs-salary-scope-2026
 130  online-bba-fees-india-2026
 128  amity-online-bba-fees-2026
 125  amity-online-mba-review-2026          ← the reported case
 119  online-bba-programs-india-2026
 118  online-mba-tamil-nadu-2026
 114  career-after-12th-science-courses-jobs-2026
 103  online-mba-business-data-analytics-india-2026
  93  best-online-bba-colleges-india-2026
  79  online-mba-supply-chain-management-india-2026
  77  online-mba-uttar-pradesh-2026
  69  online-mba-karnataka-2026
  69  nmims-vs-symbiosis-online-mba-2026
  65  online-mba-hospital-healthcare-management-india-2026
  65  amity-vs-manipal-online-mba-2026
  64  jain-vs-amity-online-mba-2026
  64  best-online-bca-colleges-india-2026
  62  jain-online-mba-review-2026
  59  online-mba-lpu-review-2026
  57  amity-online-bba-review-2026
  55  online-mba-entrepreneurship-india-2026
  54  best-online-mba-colleges-india-2026
```

Every one of these posts can silently drift from `lib/data.ts` on the next
fee refresh without any check firing — the fee-check script only reads the
`UNIVERSITIES[]` structure, not blog prose.

### Scale
- 1 direct blog↔hub contradiction reported (Amity MBA: `₹4.49L` in blog
  meta+prose has no counterpart in `lib/data.ts`).
- 127 hub-side programme rows currently suppressed for `pd.fees` vs
  `feeMin/Max` mismatch.
- 83 blog posts hardcoding ₹-figures with no import from
  `lib/data.ts` or `lib/fees.ts`. This is the class of bug: every fee in
  prose is a manual snapshot with no verification path.

---

_Report generated 2026-08-07 by audit-only pass. No code, config or content
was modified. No commits made. Branch remains `feat/thin-page-gating`._
