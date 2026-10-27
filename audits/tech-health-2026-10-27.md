# Tech health: Semrush site audit of 27 Oct 2026

Branch `seo/tech-health`, cut from origin/main at 7f81570. Not pushed.

**Method.** Semrush reported counts, not URLs, so both sides were measured with
`scripts/audit-link-targets.mjs`, which crawls from `/` plus the sitemap and resolves every internal link target
with redirects not followed. "Before" is production (edifyedu.in, 27 Oct). "After" is a local `next build` +
`next start` of this branch. Both crawls reached the same 3,217 HTML pages.

One caveat on the local numbers: the local build reads the committed, normalised `valid-urls.json`. Vercel's
prebuild regenerates a larger one, so `isLinkable()` says yes to more hubs in production than locally. Production
will link slightly more hubs than the local crawl shows. It cannot link more dead or redirecting URLs, because
`hubResolves` and `resolveSpecHref` read the same allowlists middleware does.

## Counts

| Item | Production before | Local after |
|---|---|---|
| Course schema issues, 10 sample pages | 14 | 0 |
| Pages linking `/cdn-cgi/l/email-protection` (404) | 3,217 | 0 (see item 4) |
| Dead internal links, excluding the email one | 199 on 72 pages | 0 |
| Links into a 301/308 | 857 on 221 pages | 0 |
| Indexable pages with at most one linking page | 226 | 196 |
| of which blog posts | 29 | 0 |
| of which hubs | 0 | 0 |
| Pages deeper than 3 clicks or unreached | 20 | 50 |

Semrush's 179 dead-link pages sit between the 72 real-link pages and the 3,217 email pages. Its crawl counted the
Cloudflare email link on some pages only. Its 726 redirect links match the 857 here once you allow for crawl coverage.

## 1. Course schema

`components/SchemaBlock.tsx` emitted `courseMode` on the Course and again on its CourseInstance. Only the second is
valid. That one property is the 2,421 errors (every hub and spec page with a Course node).

Other Course builders were also invalid and are fixed:

- `components/UniversityPageClient.tsx` (overview page): `lowPrice`/`highPrice` on a plain `Offer`, fed from
  `u.feeMin`/`u.feeMax` (MBA-led, so a BBA-first university published its MBA price). Now gets
  `getProgramSchemaOffer` + getDisplayFee compact fee from the server, per programme. `educationalLevel` was
  hardcoded Postgraduate.
- `app/compare/[pair]/page.tsx`: no `hasCourseInstance`, no `offers.category`, price from `getProgramFee`
  (raw `u.feeMin` for MBA). Now `getProgramSchemaOffer`, a CourseInstance, and the mode-unverified gate.
- `app/programs/[...slug]/page.tsx`: `courseWorkload: 'PT2Y'` (not ISO 8601), price from the raw MBA-led
  `u.feeMin` minimum, and a "Fees from ₹XK" floor in the description. Now an AggregateOffer over getDisplayFee
  values only, no fee in the description, `P2Y`/`P3Y` by level.
- `app/coupons/[slug]/page.tsx`: `PT2Y` to `P2Y`.

Validated on hubs `/universities/yenepoya-university-online/mba`, `/amity-university-online/bba`,
`/nmims-online/mca` and spec pages `/nmims-online/mba/hr-management`, `/amity-university-online/bca/data-science`,
`/manipal-university-jaipur-online/mba/finance`, `/upes-online/mba/marketing`, plus one overview, compare, programs
and coupon page. Every property checked against schema.org Course / CourseInstance / Offer / AggregateOffer,
CourseInstance required to carry courseMode and courseWorkload, durations checked as ISO 8601.

Yenepoya MBA, before (production):

```json
{"@type":"Course","name":"Yenepoya (Deemed to be University) Online MBA",
 "educationalLevel":"Postgraduate","courseMode":"Online","timeRequired":"P2Y",
 "offers":{"@type":"Offer","price":"120000","priceCurrency":"INR","category":"Online Education", "...":"..."},
 "hasCourseInstance":{"@type":"CourseInstance","courseMode":"Online","startDate":"2026-07-01","courseWorkload":"P2Y"}}
```

After: identical except the top-level `"courseMode":"Online"` is gone, and (decision 6) the CourseInstance no
longer carries the hardcoded `"startDate":"2026-07-01"`. Fee unchanged at ₹1,20,000.

## 2. Dead links

| Source | Before | Fix |
|---|---|---|
| /verify pages to hubs, specs, overview | 90 | Supabase slug mapped to lib/data id through `verify-slug-overrides.json`; hubs gated on `hubResolves` + `isLinkable` |
| /programs/{prog}/{spec} cards and lists to spec pages | 63 | `resolveSpecHref`, each university's own spec slug first |
| /programs/{prog} comparison table to hubs | 41 | `hubResolves` + `isLinkable`; name stays, unlinked |
| Blog bodies to deleted posts | 5 | Repointed to live posts (list below) |

`lib/seo/safe-internal-links.ts` gains `getUniversityForVerifySlug` and `resolveSpecHref`, and the BA, MSc and
BSc allowlists middleware has carried since 29 Aug. `scripts/check-internal-hub-links.js` passes: 2,294
prerendered pages, 5,671 gated hub links, 0 broken.

## 3. Links into redirects

| Class | Before | Fix |
|---|---|---|
| Spec chips and cards with alias slugs (`human-resource-management` 308 to `hr-management`) | 338 | `resolveSpecHref` reads the middleware alias table |
| Verify programme rows to `/universities/{x}/programmes/{uuid}` (308) | 338 | Rows link the university overview, or render unlinked |
| Verify links using Supabase slugs (`/universities/vellore-institute-of-technology-online/...`) | ~170 | Site id via the overrides file |
| Blog-body old slugs and legacy paths | 9 | Rewritten to the final URL |
| Hub spec grid, two rescue-rule aliases | 2 | `UniProgramBody` passes `resolveSpec` output through `resolveSpecHref` |

## 4. Email

Production HTML carries `/cdn-cgi/l/email-protection#...` in place of the footer mailto on every page. That is
Cloudflare Email Address Obfuscation. `components/EmailOff.tsx` wraps all six rendered mailto links (footer, about,
contact, methodology, privacy, terms) in `<!--email_off-->` / `<!--email_on-->`, which Cloudflare skips. The address
stays as plain `mailto:hello@edifyedu.in` whether obfuscation is on or off. Not verifiable locally, since localhost
is not behind Cloudflare. Check one production page after deploy.

## 6. Low text-to-HTML (Yenepoya MBA hub, 264 KB, 5.2% visible text)

| # | Contributor | Size | Share |
|---|---|---|---|
| 1 | RSC flight payload (`self.__next_f.push`, 13 scripts) | 135.5 KB | 51.3% |
| 2 | Inline `<svg>` (95 elements, lucide icons) | 34.0 KB | 12.9% |
| 3 | `class` attributes (Tailwind) | 32.5 KB | 12.3% |
| 4 | `style` attributes (233) | 14.3 KB | 5.4% |
| 5 | Visible text | 13.7 KB | 5.2% |
| 6 | JSON-LD in HTML (10 blocks) | 12.3 KB | 4.7% |
| 7 | `<head>` (meta, preloads, fonts) | 10.4 KB | 3.9% |
| 8 | Other script tags | 4.2 KB | 1.6% |
| 9 | `<style>` blocks | 3.3 KB | 1.2% |
| 10 | href attributes (71 links) | 2.2 KB | 0.8% |

Inside the flight payload: 80.5 KB is the server component tree for the page (the HTML again as RSC rows, 449
classNames). 21.6 KB is the router/layout row. 5.8 KB is a 143-university ItemList from
`app/universities/layout.tsx`, emitted on every university, hub and spec page, and it also appears in the HTML.
5.4 KB is the page's JSON-LD again. The university object passed to a client component is only 3.9 KB.

Proposals, none applied:

1. Move the 143-item ItemList out of `app/universities/layout.tsx` into `app/universities/page.tsx` only. About
   11 KB off each of ~2,400 pages. It describes the index, not a hub.
2. Render JSON-LD from a server component that is not inside a client boundary, so it is not serialised into the
   flight payload too. About 5 KB.
3. Keep more of the hub as server components. The 80 KB tree row is the biggest lever. Every client component
   boundary serialises its props and children. Converting presentational sections that never need state would
   shrink it. Needs a per-section pass.
4. Swap the 9 repeated chevrons and 12 check icons for one SVG `<symbol>` and `<use>`. About 6 KB.
5. Move repeated inline `style` objects (233) to classes. About 8 KB.

## Decisions (Rishi, 27 Oct 2026)

1. **Spec pages under noindex hubs at 4 clicks: accepted.** No change. /programs tables and /verify no longer link
   noindex hubs, so their spec pages went from depth 3 to 4 (deep pages 20 to 50).
2. **Verify profile links.** `dy-patil-navi-mumbai-online` now links `/universities/dy-patil-university-online`.
   Per the 7 Aug audit that record is Navi Mumbai; `dr-dy-patil-vidyapeeth-online` is Pune and is not linked to it.
   Added to `lib/data/verify-slug-overrides.json` under `_manual_entries` with that provenance, since it was not a
   name match. The mapping also works the other way, so DY Patil's own site pages now link its verify page.
   `amity-university-rajasthan-online` stays unlinked (different institution). BS Abdur Rahman and Shobhit stay
   unlinked (NEEDS_RISHI below).
3. **Scholarships sentence** in `affordable-online-mba-india-2026` now links /coupons. Sentence kept.
4. **Blog wording changes: accepted.** The MAHE and MUJ review cards say "MAHE vs MUJ" and link
   /compare/manipal-jaipur-vs-manipal-mahe. The BBA full-form post links the verification post.
5. **Visible fees now go through getDisplayFee** in the compare pair table
   (Total Fees and Per Semester rows, the verdict sentence and the meta description share the same value). A
   suppressed fee shows "Contact our counsellor for current fee details", the existing counsellor line from
   MBASpecHubClient. Every changed value is in the tables below. The /programs "Min Fee" stat was changed too, but
   it turned out to be dead code that renders on no page (see the note under its table).
   One more visible bypass found while checking: the MBA spec hub FAQ fee range (`specFeeMin`/`specFeeMax` in
   app/programs/[...slug]/page.tsx) parses `pd.fees` directly and falls back to the raw `feeMin`. Not changed here.
6. **Course `startDate` removed** from SchemaBlock and /programs, with no replacement date. The same 12 sample pages
   re-validate with 0 issues and no `startDate`.
7. **143-university layout ItemList: not done on this branch**, as instructed.

Still open from the first pass: spec links are gated on "resolves", not "indexable" (your held spec-page decision),
and blog `about: Course` (nested, no offers or instance) may still be flagged by Google as an incomplete Course.

## NEEDS_RISHI

- **BS Abdur Rahman.** `/verify/bs-abdur-rahman-institute-of-science-and-technology-online` could map to
  `/universities/bs-abdur-rahman-university-online`, but the names do not match exactly. The profile link stays
  hidden until you confirm they are the same institution.
- **Shobhit.** `/verify/shobhit-institute-of-engineering-technology-online` could map to
  `/universities/shobhit-university-online`. Same situation: hidden until confirmed.
- **New "Min Fee" floors on /programs are real getDisplayFee values, but each is still the single cheapest
  university.** MA and BA now show ₹18K and ₹10K, both set by IGNOU. MBA shows ₹20K, set by Madras. Worth a
  portal check before the next GSC read. IGNOU's MBA floor was a range floor once before.

## Fee values changed (before → after)

Before is the code on origin/main. After is this branch.

### Compare pair table (Total Fees row)

| Pair | University | Before | After |
|---|---|---|---|
| amity-vs-lpu | lovely-professional-university-online | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 |
| lpu-vs-manipal-jaipur | lovely-professional-university-online | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 |
| chandigarh-vs-lpu | chandigarh-university-online | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 |
| chandigarh-vs-lpu | lovely-professional-university-online | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 |
| amity-vs-chandigarh | chandigarh-university-online | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 |
| manipal-jaipur-vs-chandigarh | chandigarh-university-online | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 |
| jain-vs-lpu | lovely-professional-university-online | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 |
| symbiosis-vs-nmims-bba | symbiosis-university-online | (row hidden) | ₹1,65,000 |
| symbiosis-vs-nmims-bba | nmims-online | (row hidden) | ₹1,41,000 |
| amity-vs-lpu-mca | lovely-professional-university-online | ₹1,29,600 | ₹1,08,000 |
| lpu-vs-chandigarh-mca | lovely-professional-university-online | ₹1,29,600 | ₹1,08,000 |
| amity-vs-jain-mca | jain-university-online | ₹1,30,000 - ₹1,60,000 | From ₹1,30,000 |
| amity-vs-lpu-bba | amity-university-online | (row hidden) | ₹1,99,000 |
| amity-vs-lpu-bba | lovely-professional-university-online | (row hidden) | Contact our counsellor for current fee details |
| sharda-vs-galgotias-bba | sharda-university-online | (row hidden) | ₹1,35,000 |
| sharda-vs-galgotias-bba | galgotias-university-online | (row hidden) | ₹77,200 |
| ignou-vs-lpu | lovely-professional-university-online | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 |

17 of 52 cells changed

### Compare pair table (Per Semester row, MBA pairs only)

| Pair | University | Before | After |
|---|---|---|---|
| chandigarh-vs-lpu | chandigarh-university-online | ₹55,000/sem | ₹45,000/sem |
| amity-vs-chandigarh | chandigarh-university-online | ₹55,000/sem | ₹45,000/sem |
| manipal-jaipur-vs-chandigarh | chandigarh-university-online | ₹55,000/sem | ₹45,000/sem |

3 of 32 cells changed

### /programs/{prog} Min Fee stat (unreachable: no visible change)

Correction to the first pass: this stat sits in the final fallback branch of app/programs/[...slug]/page.tsx, which no
URL reaches. Every /programs URL is served by the MBA hub, the generic hub, or one of the two spec branches first.
Neither production nor the local build renders "Min Fee" on /programs/mba, /ma, /bsc, /mba/finance or
/bba/marketing. The code now uses getDisplayFee anyway. The table shows what the block would print if reached.


| Programme | Before | After | Lowest getDisplayFee university | Unis with feeMin 0 |
|---|---|---|---|---|
| MBA | ₹0 | ₹20K | university-of-madras-online | 15 |
| MCA | ₹0 | ₹50K | yenepoya-university-online | 9 |
| BBA | ₹0 | ₹15K | sathyabama-university-online | 9 |
| BCA | ₹0 | ₹12K | gujarat-university-online | 6 |
| B.Com | ₹0 | ₹12K | gujarat-university-online | 6 |
| M.Com | ₹0 | ₹12K | aligarh-muslim-university-online | 8 |
| MA | ₹0 | ₹18K | ignou-online | 7 |
| BA | ₹0 | ₹10K | ignou-online | 2 |
| MSc | ₹0 | ₹18K | gujarat-university-online | 1 |
| BSc | ₹60K | ₹1.5L | symbiosis-university-online | 0 |

## 5. Weakly linked and deep pages

Production crawl, indexable pages with at most one linking page. "fixed" means the local crawl now finds two or
more. Hubs: none were weak. Blogs: added to the related-links block by relevance. Spec pages: listed only, as asked.

### hub (0 before, 0 after)

None.

### blog (29 before, 0 after)

- /blog/online-diploma-courses-india (linked from: /blog) · fixed
- /blog/online-msw-india (linked from: /blog) · fixed
- /blog/ugc-two-degrees-simultaneously-rules (linked from: /blog) · fixed
- /blog/online-bachelors-ug-courses-india (linked from: /blog) · fixed
- /blog/srm-online-mba-2026 (linked from: /blog) · fixed
- /blog/online-mba-doctors-mbbs-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-teachers-educators-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-hospitality-hotel-professionals-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-agribusiness-professionals-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-insurance-professionals-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-business-analysts-india-2026 (linked from: /blog) · fixed
- /blog/online-mba-product-managers-india-2026 (linked from: /blog) · fixed
- /blog/integral-university-online-review (linked from: /blog) · fixed
- /blog/online-mba-ai-eligibility-maths-coding-2026 (linked from: /blog) · fixed
- /blog/adichunchanagiri-university-online-mba-review (linked from: /blog) · fixed
- /blog/online-bba-fees-india-2026-compared (linked from: /blog) · fixed
- /blog/online-bcom-fees-india-2026-compared (linked from: /blog) · fixed
- /blog/online-mca-fees-india-2026-compared (linked from: /blog) · fixed
- /blog/sppu-online-mba-review (linked from: /blog) · fixed
- /blog/online-bca-fees-india-2026-compared (linked from: /blog) · fixed
- /blog/lpu-vs-chandigarh-university-online-mba-2026 (linked from: /blog) · fixed
- /blog/online-mba-classes-workload-exams-2026 (linked from: /blog) · fixed
- /blog/best-online-bca-colleges-india-2026 (linked from: /blog) · fixed
- /blog/online-mca-amity-vs-lpu-2026 (linked from: /blog) · fixed
- /blog/ias-officer-salary-india-2026-pay-scale-perks (linked from: /blog) · fixed
- /blog/toughest-exams-india-world-2026 (linked from: /blog) · fixed
- /blog/gd-topics-for-mba-2026-with-answers (linked from: /blog) · fixed
- /blog/is-mba-post-graduation-india-2026 (linked from: /blog) · fixed
- /blog/mba-course-duration-india-2026 (linked from: /blog) · fixed

### verify (8 before, 8 after)

- /verify/academy-of-maritime-education-and-training-online (linked from: /verify)
- /verify/amity-online (linked from: /verify)
- /verify/bs-abdur-rahman-institute-of-science-and-technology-online (linked from: /verify)
- /verify/central-sanskrit-university-online (linked from: /verify)
- /verify/dy-patil-navi-mumbai-online (linked from: /verify)
- /verify/shobhit-institute-of-engineering-technology-online (linked from: /verify)
- /verify/shri-ramasamy-memorial-university-online (linked from: /verify)
- /verify/amity-university-rajasthan-online (linked from: nothing)

### spec (161 before, 160 after)

- /universities/chandigarh-university-online/bba/business-analytics (linked from: /universities/chandigarh-university-online/bba)
- /universities/chandigarh-university-online/bca/general-management (linked from: /universities/chandigarh-university-online/bca)
- /universities/symbiosis-university-online/ma/mass-communication (linked from: /universities/symbiosis-university-online/ma)
- /universities/symbiosis-university-online/bba/general-management (linked from: /universities/symbiosis-university-online/bba)
- /universities/symbiosis-university-online/bca/general-management (linked from: /universities/symbiosis-university-online/bca)
- /universities/lovely-professional-university-online/mcom/commerce-finance (linked from: /universities/lovely-professional-university-online/mcom)
- /universities/graphic-era-university-online/mca/general (linked from: /universities/graphic-era-university-online/mca)
- /universities/jamia-hamdard-online/mca/general (linked from: /universities/jamia-hamdard-online/mca)
- /universities/datta-meghe-university-online/mca/general (linked from: /universities/datta-meghe-university-online/mca)
- /universities/savitribai-phule-pune-university-online/mca/general (linked from: /universities/savitribai-phule-pune-university-online/mca)
- /universities/dr-babasaheb-ambedkar-open-university-online/mca/general (linked from: /universities/dr-babasaheb-ambedkar-open-university-online/mca)
- /universities/university-of-mysore-online/mca/general (linked from: /universities/university-of-mysore-online/mca)
- /universities/maharishi-markandeshwar-university-online/mca/general (linked from: /universities/maharishi-markandeshwar-university-online/mca)
- /universities/kurukshetra-university-online/mca/general (linked from: /universities/kurukshetra-university-online/mca)
- /universities/centurion-university-online/mca/general (linked from: /universities/centurion-university-online/mca)
- /universities/charusat-university-online/mca/general (linked from: /universities/charusat-university-online/mca)
- /universities/galgotias-university-online/mca/general (linked from: /universities/galgotias-university-online/mca)
- /universities/mats-university-online/mca/general (linked from: /universities/mats-university-online/mca)
- /universities/uttaranchal-university-online/mca/general (linked from: /universities/uttaranchal-university-online/mca)
- /universities/sikkim-manipal-university-online/mca/general (linked from: /universities/sikkim-manipal-university-online/mca)
- /universities/mangalayatan-university-online/mca/general (linked from: /universities/mangalayatan-university-online/mca)
- /universities/ganpat-university-online/mca/general (linked from: /universities/ganpat-university-online/mca)
- /universities/mohan-babu-university-online/mca/general (linked from: /universities/mohan-babu-university-online/mca)
- /universities/chhatrapati-shahu-ji-maharaj-university-online/mca/general (linked from: /universities/chhatrapati-shahu-ji-maharaj-university-online/mca)
- /universities/dr-br-ambedkar-university-online/mca/general (linked from: /universities/dr-br-ambedkar-university-online/mca)
- /universities/bs-abdur-rahman-university-online/mca/general (linked from: /universities/bs-abdur-rahman-university-online/mca)
- /universities/choudhary-charan-singh-university-online/mca/general (linked from: /universities/choudhary-charan-singh-university-online/mca)
- /universities/ajeenkya-dy-patil-university-online/mca/general (linked from: /universities/ajeenkya-dy-patil-university-online/mca)
- /universities/silver-oak-university-online/mca/general (linked from: /universities/silver-oak-university-online/mca)
- /universities/srinivas-university-online/mca/general (linked from: /universities/srinivas-university-online/mca)
- /universities/st-aloysius-university-online/mca/general (linked from: /universities/st-aloysius-university-online/mca)
- /universities/sri-venkateswara-university-online/mca/general (linked from: /universities/sri-venkateswara-university-online/mca)
- /universities/swami-rama-himalayan-university-online/mca/general (linked from: /universities/swami-rama-himalayan-university-online/mca)
- /universities/manipal-university-jaipur-online/bca/general-management (linked from: /universities/manipal-university-jaipur-online/bca)
- /universities/vignan-university-online/bca/data-science (linked from: /universities/vignan-university-online/bca)
- /universities/gujarat-university-online/bca/computer-applications (linked from: /universities/gujarat-university-online/bca)
- /universities/savitribai-phule-pune-university-online/bca/general (linked from: /universities/savitribai-phule-pune-university-online/bca)
- /universities/university-of-mysore-online/bca/general-management (linked from: /universities/university-of-mysore-online/bca)
- /universities/maharishi-markandeshwar-university-online/bca/general-management (linked from: /universities/maharishi-markandeshwar-university-online/bca)
- /universities/dr-babasaheb-ambedkar-open-university-online/bca/general-management (linked from: /universities/dr-babasaheb-ambedkar-open-university-online/bca)
- /universities/sharda-university-online/bca/general-management (linked from: /universities/sharda-university-online/bca)
- /universities/guru-ghasidas-vishwavidyalaya-online/bca/computer-science-and-it (linked from: /universities/guru-ghasidas-vishwavidyalaya-online/bca)
- /universities/charusat-university-online/bca/general-management (linked from: /universities/charusat-university-online/bca)
- /universities/parul-university-online/bca/general (linked from: /universities/parul-university-online/bca)
- /universities/dayananda-sagar-university-online/bca/general-management (linked from: /universities/dayananda-sagar-university-online/bca)
- /universities/karnataka-state-open-university-online/bca/computer-applications (linked from: /universities/karnataka-state-open-university-online/bca)
- /universities/mangalayatan-university-online/bca/general (linked from: /universities/mangalayatan-university-online/bca)
- /universities/marwadi-university-online/bca/computer-applications (linked from: /universities/marwadi-university-online/bca)
- /universities/integral-university-online/bca/general-management (linked from: /universities/integral-university-online/bca)
- /universities/pp-savani-university-online/bca/computer-applications (linked from: /universities/pp-savani-university-online/bca)
- /universities/assam-don-bosco-university-online/bca/computer-science-and-information-technology (linked from: /universities/assam-don-bosco-university-online/bca)
- /universities/uttaranchal-university-online/bca/general (linked from: /universities/uttaranchal-university-online/bca)
- /universities/dr-br-ambedkar-university-online/bca/general (linked from: /universities/dr-br-ambedkar-university-online/bca)
- /universities/ajeenkya-dy-patil-university-online/bca/general (linked from: /universities/ajeenkya-dy-patil-university-online/bca)
- /universities/mohan-babu-university-online/bca/general (linked from: /universities/mohan-babu-university-online/bca)
- /universities/ignou-online/bca/computing-information-technology-foundation (linked from: /universities/ignou-online/bca)
- /universities/shobhit-university-online/bca/general-management (linked from: /universities/shobhit-university-online/bca)
- /universities/silver-oak-university-online/bca/general (linked from: /universities/silver-oak-university-online/bca)
- /universities/srinivas-university-online/bca/general (linked from: /universities/srinivas-university-online/bca)
- /universities/swami-rama-himalayan-university-online/bca/general (linked from: /universities/swami-rama-himalayan-university-online/bca)
- /universities/university-of-calicut-online/mba/hr-management (linked from: /universities/university-of-calicut-online/mba) · fixed
- /universities/christ-university-online/bba/general-management (linked from: /universities/christ-university-online/bba)
- /universities/manipal-academy-higher-education-online/bba/general-management (linked from: /universities/manipal-academy-higher-education-online/bba)
- /universities/manipal-university-jaipur-online/bba/general-management (linked from: /universities/manipal-university-jaipur-online/bba)
- /universities/university-of-lucknow-online/bba/general-management (linked from: /universities/university-of-lucknow-online/bba)
- /universities/jss-university-online/bba/hospital-and-health-system-management (linked from: /universities/jss-university-online/bba)
- /universities/bharathidasan-university-online/bba/general-multi-disciplinary (linked from: /universities/bharathidasan-university-online/bba)
- /universities/sathyabama-university-online/bba/general-management (linked from: /universities/sathyabama-university-online/bba)
- /universities/university-of-mysore-online/bba/general-management (linked from: /universities/university-of-mysore-online/bba)
- /universities/kurukshetra-university-online/bba/general-management (linked from: /universities/kurukshetra-university-online/bba)
- /universities/sharda-university-online/bba/general-management (linked from: /universities/sharda-university-online/bba)
- /universities/desh-bhagat-university-online/bba/general-management (linked from: /universities/desh-bhagat-university-online/bba)
- /universities/jaypee-university-online/bba/general-management (linked from: /universities/jaypee-university-online/bba)
- /universities/manonmaniam-sundaranar-university-online/bba/general-management (linked from: /universities/manonmaniam-sundaranar-university-online/bba)
- /universities/sikkim-manipal-university-online/bba/general-management (linked from: /universities/sikkim-manipal-university-online/bba)
- /universities/noida-international-university-online/bba/general-management (linked from: /universities/noida-international-university-online/bba)
- /universities/pp-savani-university-online/bba/general-management (linked from: /universities/pp-savani-university-online/bba)
- /universities/vtu-online/bba/digital-marketing (linked from: /universities/vtu-online/bba)
- /universities/amet-university-online/bba/general-management (linked from: /universities/amet-university-online/bba)
- /universities/ajeenkya-dy-patil-university-online/bba/general (linked from: /universities/ajeenkya-dy-patil-university-online/bba)
- /universities/atlas-skilltech-university-online/bba/general (linked from: /universities/atlas-skilltech-university-online/bba)
- /universities/bennett-university-online/bba/general (linked from: /universities/bennett-university-online/bba)
- /universities/choudhary-charan-singh-university-online/bba/general (linked from: /universities/choudhary-charan-singh-university-online/bba)
- /universities/mohan-babu-university-online/bba/general (linked from: /universities/mohan-babu-university-online/bba)
- /universities/dr-br-ambedkar-university-online/bba/general (linked from: /universities/dr-br-ambedkar-university-online/bba)
- /universities/sandip-university-online/bba/general (linked from: /universities/sandip-university-online/bba)
- /universities/shobhit-university-online/bba/general-management (linked from: /universities/shobhit-university-online/bba)
- /universities/silver-oak-university-online/bba/general (linked from: /universities/silver-oak-university-online/bba)
- /universities/swami-rama-himalayan-university-online/bba/general (linked from: /universities/swami-rama-himalayan-university-online/bba)
- /universities/lovely-professional-university-online/ba/humanities-social-sciences (linked from: /universities/lovely-professional-university-online/ba)
- /universities/vels-university-online/bba/general-management (linked from: /universities/vels-university-online/bba)
- /universities/bharathidasan-university-online/ba/english (linked from: /universities/bharathidasan-university-online/ba)
- /universities/gujarat-university-online/ba/english (linked from: /universities/gujarat-university-online/ba)
- /universities/srinivas-university-online/bba/general (linked from: /universities/srinivas-university-online/bba)
- /universities/sharda-university-online/ba/political-science (linked from: /universities/sharda-university-online/ba)
- /universities/manonmaniam-sundaranar-university-online/ba/english-literature (linked from: /universities/manonmaniam-sundaranar-university-online/ba)
- /universities/sikkim-manipal-university-online/ba/general-management (linked from: /universities/sikkim-manipal-university-online/ba)
- /universities/manipal-academy-higher-education-online/bcom/general-management (linked from: /universities/manipal-academy-higher-education-online/bcom)
- /universities/christ-university-online/bcom/general-management (linked from: /universities/christ-university-online/bcom)
- /universities/university-of-lucknow-online/bcom/general-commerce (linked from: /universities/university-of-lucknow-online/bcom)
- /universities/manipal-university-jaipur-online/bcom/general-management (linked from: /universities/manipal-university-jaipur-online/bcom)
- /universities/university-of-mysore-online/bcom/general-management (linked from: /universities/university-of-mysore-online/bcom)
- /universities/guru-ghasidas-vishwavidyalaya-online/bcom/commerce (linked from: /universities/guru-ghasidas-vishwavidyalaya-online/bcom)
- /universities/dr-babasaheb-ambedkar-open-university-online/bcom/general-management (linked from: /universities/dr-babasaheb-ambedkar-open-university-online/bcom)
- /universities/karunya-university-online/bcom/general-management (linked from: /universities/karunya-university-online/bcom)
- /universities/manav-rachna-online/bcom/general-acca-integrated (linked from: /universities/manav-rachna-online/bcom)
- /universities/kurukshetra-university-online/bcom/general-commerce (linked from: /universities/kurukshetra-university-online/bcom)
- /universities/desh-bhagat-university-online/bcom/general-management (linked from: /universities/desh-bhagat-university-online/bcom)
- /universities/marwadi-university-online/bcom/commerce (linked from: /universities/marwadi-university-online/bcom)
- /universities/karnataka-state-open-university-online/bcom/general-management (linked from: /universities/karnataka-state-open-university-online/bcom)
- /universities/integral-university-online/bcom/general-management (linked from: /universities/integral-university-online/bcom)
- /universities/sikkim-manipal-university-online/bcom/general-management (linked from: /universities/sikkim-manipal-university-online/bcom)
- /universities/yenepoya-university-online/bcom/accounting-and-finance (linked from: /universities/yenepoya-university-online/bcom)
- /universities/manonmaniam-sundaranar-university-online/bcom/general-commerce (linked from: /universities/manonmaniam-sundaranar-university-online/bcom)
- /universities/aligarh-muslim-university-online/bcom/general-commerce (linked from: /universities/aligarh-muslim-university-online/bcom)
- /universities/northcap-university-online/bcom/general-management (linked from: /universities/northcap-university-online/bcom)
- /universities/amet-university-online/bcom/general-management (linked from: /universities/amet-university-online/bcom)
- /universities/mohan-babu-university-online/bcom/general (linked from: /universities/mohan-babu-university-online/bcom)
- /universities/sgt-university-online/bcom/applied-finance (linked from: /universities/sgt-university-online/bcom)
- /universities/srinivas-university-online/bcom/general (linked from: /universities/srinivas-university-online/bcom)
- /universities/dr-br-ambedkar-university-online/bcom/general (linked from: /universities/dr-br-ambedkar-university-online/bcom)
- /universities/swami-rama-himalayan-university-online/bcom/general (linked from: /universities/swami-rama-himalayan-university-online/bcom)
- /universities/ignou-online/bcom/general-commerce (linked from: /universities/ignou-online/bcom)
- /universities/dr-br-ambedkar-university-online/ma/sociology (linked from: /universities/dr-br-ambedkar-university-online/ma)
- /universities/silver-oak-university-online/ma/english-literature (linked from: /universities/silver-oak-university-online/ma)
- /universities/manipal-university-jaipur-online/mcom/general-management (linked from: /universities/manipal-university-jaipur-online/mcom)
- /universities/dr-br-ambedkar-open-university-online/ma/telugu (linked from: /universities/dr-br-ambedkar-open-university-online/ma)
- /universities/aligarh-muslim-university-online/mcom/general-commerce (linked from: /universities/aligarh-muslim-university-online/mcom)
- /universities/university-of-lucknow-online/mcom/commerce (linked from: /universities/university-of-lucknow-online/mcom)
- /universities/university-of-mysore-online/mcom/general-management (linked from: /universities/university-of-mysore-online/mcom)
- /universities/gujarat-university-online/mcom/general-management (linked from: /universities/gujarat-university-online/mcom)
- /universities/manav-rachna-online/mcom/general-management (linked from: /universities/manav-rachna-online/mcom)
- /universities/guru-nanak-dev-university-online/mcom/commerce (linked from: /universities/guru-nanak-dev-university-online/mcom)
- /universities/guru-ghasidas-vishwavidyalaya-online/mcom/commerce (linked from: /universities/guru-ghasidas-vishwavidyalaya-online/mcom)
- /universities/parul-university-online/mcom/general (linked from: /universities/parul-university-online/mcom)
- /universities/integral-university-online/mcom/accounting-finance (linked from: /universities/integral-university-online/mcom)
- /universities/mangalayatan-university-online/mcom/general (linked from: /universities/mangalayatan-university-online/mcom)
- /universities/manonmaniam-sundaranar-university-online/mcom/accounting-and-finance (linked from: /universities/manonmaniam-sundaranar-university-online/mcom)
- /universities/pp-savani-university-online/mcom/general-management (linked from: /universities/pp-savani-university-online/mcom)
- /universities/kurukshetra-university-online/mcom/general-commerce (linked from: /universities/kurukshetra-university-online/mcom)
- /universities/sikkim-manipal-university-online/mcom/general-management (linked from: /universities/sikkim-manipal-university-online/mcom)
- /universities/central-university-tamil-nadu-online/mcom/general (linked from: /universities/central-university-tamil-nadu-online/mcom)
- /universities/choudhary-charan-singh-university-online/mcom/general (linked from: /universities/choudhary-charan-singh-university-online/mcom)
- /universities/dr-br-ambedkar-university-online/mcom/general (linked from: /universities/dr-br-ambedkar-university-online/mcom)
- /universities/pt-sundarlal-sharma-open-university-online/mcom/general (linked from: /universities/pt-sundarlal-sharma-open-university-online/mcom)
- /universities/silver-oak-university-online/mcom/general (linked from: /universities/silver-oak-university-online/mcom)
- /universities/sri-venkateswara-university-online/mcom/financial-management (linked from: /universities/sri-venkateswara-university-online/mcom)
- /universities/university-of-calicut-online/mcom/finance (linked from: /universities/university-of-calicut-online/mcom)
- /universities/st-aloysius-university-online/mcom/general (linked from: /universities/st-aloysius-university-online/mcom)
- /universities/integral-university-online/msc/mathematics (linked from: /universities/integral-university-online/msc)
- /universities/manipal-university-jaipur-online/msc/mathematics (linked from: /universities/manipal-university-jaipur-online/msc)
- /universities/vit-university-online/msc/data-science (linked from: /universities/vit-university-online/msc)
- /universities/gujarat-university-online/msc/mathematics (linked from: /universities/gujarat-university-online/msc)
- /universities/mangalayatan-university-online/msc/pure-mathematics (linked from: /universities/mangalayatan-university-online/msc)
- /universities/maharishi-markandeshwar-university-online/msc/mathematics (linked from: /universities/maharishi-markandeshwar-university-online/msc)
- /universities/vivekananda-global-university-online/msc/mathematics (linked from: /universities/vivekananda-global-university-online/msc)
- /universities/deen-dayal-upadhyay-gorakhpur-university-online/msc/mathematics (linked from: /universities/deen-dayal-upadhyay-gorakhpur-university-online/msc)
- /universities/pt-sundarlal-sharma-open-university-online/msc/mathematics (linked from: /universities/pt-sundarlal-sharma-open-university-online/msc)
- /universities/chandigarh-university-online/msc/data-science (linked from: /universities/chandigarh-university-online/msc)
- /universities/pp-savani-university-online/msc/data-science (linked from: /universities/pp-savani-university-online/msc)
- /universities/marwadi-university-online/msc/business-analytics (linked from: /universities/marwadi-university-online/msc)

### cgpa (26 before, 26 after)

- /tools/cgpa-calculator/6-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/5-2-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-32-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-2-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-5-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-25-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-3-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-45-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-8-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-44-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-75-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-5-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-55-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/6-87-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/7-9-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-17-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-75-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-25-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/9-4-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-5-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/8-2-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/9-8-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/9-5-cgpa-percentage (linked from: /tools/cgpa-calculator)
- /tools/cgpa-calculator/9-cgpa-percentage (linked from: /tools/cgpa-calculator)

### programs (1 before, 1 after)

- /programs/bba/aviation (linked from: nothing)

### other (1 before, 1 after)

- /tools/university-comparison (linked from: /blog/bca-full-form-course-details-eligibility-fees-2026)

### Deeper than 3 clicks (production: 20, local after: 50)

- /tools/salary-calculator (other, depth 4; production depth <=3)
- /programs/mba/hr-management (programs, depth 4; production depth <=3)
- /programs/mba/hospitality-management (programs, depth 4; production depth <=3)
- /universities/pt-sundarlal-sharma-open-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/karnataka-state-open-university-online/bcom/general-management (spec, depth 4; production depth <=3)
- /universities/mangalayatan-university-online/msc/pure-mathematics (spec, depth 4; production depth 4)
- /universities/marwadi-university-online/bcom/commerce (spec, depth 4; production depth <=3)
- /universities/marwadi-university-online/bba/marketing (spec, depth 4; production depth <=3)
- /universities/deen-dayal-upadhyay-gorakhpur-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/marwadi-university-online/bba/human-resource-management (spec, depth 4; production depth <=3)
- /universities/marwadi-university-online/bba/finance (spec, depth 4; production depth <=3)
- /universities/pp-savani-university-online/bba/general-management (spec, depth 4; production depth <=3)
- /universities/marwadi-university-online/msc/business-analytics (spec, depth 4; production depth 5)
- /universities/pp-savani-university-online/mcom/general-management (spec, depth 4; production depth <=3)
- /universities/pp-savani-university-online/msc/data-science (spec, depth 4; production depth 5)
- /universities/gujarat-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/maharishi-markandeshwar-university-online/bcom/banking-finance (spec, depth 4; production depth <=3)
- /universities/maharishi-markandeshwar-university-online/bcom/accounting-and-finance (spec, depth 4; production depth <=3)
- /universities/vivekananda-global-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/maharishi-markandeshwar-university-online/bcom/marke (spec, depth 4; production depth <=3)
- /universities/maharishi-markandeshwar-university-online/bcom/banking-and-finance (spec, depth 4; production depth <=3)
- /universities/maharishi-markandeshwar-university-online/bcom/marketing (spec, depth 4; production depth <=3)
- /universities/jss-university-online/bba/hospital-and-health-system-management (spec, depth 4; production depth <=3)
- /universities/karunya-university-online/bcom/general-management (spec, depth 4; production depth <=3)
- /universities/maharishi-markandeshwar-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/christ-university-online/bcom/general-management (spec, depth 4; production depth <=3)
- /universities/assam-don-bosco-university-online/bca/computer-science-and-information-technology (spec, depth 4; production depth <=3)
- /universities/desh-bhagat-university-online/bcom/general-management (spec, depth 4; production depth <=3)
- /review/sri-ramachandra-university-online (other, depth 4; production depth 4)
- /universities/vels-university-online/bba/general-management (spec, depth 4; production depth <=3)
- /universities/galgotias-university-online/mcom/accountancy (spec, depth 4; production depth <=3)
- /universities/noida-international-university-online/bba/general-management (spec, depth 4; production depth <=3)
- /universities/galgotias-university-online/mcom/finance (spec, depth 4; production depth <=3)
- /universities/integral-university-online/msc/mathematics (spec, depth 4; production depth 4)
- /universities/vit-university-online/msc/data-science (spec, depth 4; production depth 4)
- /universities/alliance-university-online/bcom/accounting-and-taxation (spec, depth 4; production depth <=3)
- /universities/alliance-university-online/bcom/finance (spec, depth 4; production depth <=3)
- /universities/alliance-university-online/bba/finance (spec, depth 4; production depth <=3)
- /universities/alliance-university-online/bba/marketing (spec, depth 4; production depth <=3)
- /universities/alliance-university-online/bba/human-resource-management (spec, depth 4; production depth <=3)
- /universities/upes-online/bca/new-age-technology (spec, depth 4; production depth <=3)
- /universities/upes-online/bca/cloud-computing-cyber-security (spec, depth 4; production depth <=3)
- /universities/upes-online/bca/data-analytics (spec, depth 4; production depth <=3)
- /universities/jaypee-university-online/bba/general-management (spec, depth 4; production depth <=3)
- /universities/chitkara-university-online/bba/fintech-ai (spec, depth 4; production depth <=3)
- /universities/chitkara-university-online/bba/digital-sciences-business-management (spec, depth 4; production depth <=3)
- /universities/chitkara-university-online/bba/logistics-supply-chain-management (spec, depth 4; production depth <=3)
- /universities/chitkara-university-online/bba/data-science-ai (spec, depth 4; production depth <=3)
- /verify/amity-university-rajasthan-online (verify, depth unreached from /; production depth <=3)
- /programs/bba/aviation (programs, depth unreached from /; production depth <=3)
