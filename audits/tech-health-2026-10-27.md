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
   MBASpecHubClient. **Superseded by round 3 below:** the values this produced were rounded and unlabelled. The /programs "Min Fee" stat was changed too, but
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
- **LPU MCA: two unverified figures.** `programFees.mca` says ₹1,29,600 (comment: read from
  lpuonline.com/master-of-computer-application). `programDetails.MCA.fees` says "₹1.08L". Neither is verified, so
  the compare table shows the counsellor line. Same treatment for galgotias/mca, ignou/bca and ignou/mca. Add the
  portal figure to `feeBreakdown` and remove the pair from `DRIFT_PAIRS` in lib/fees.ts to restore a number.
- **Amity MCA: three conflicting figures, counsellor line kept.** Current data says ₹1,99,000 (`programFees.mca`) and
  "₹1.99L" (`pd.fees`). The Aug 2026 audit recorded `pd.fees` as ₹1.7L, and a blog figure of ₹42,500, likely per
  semester (× 4 = ₹1,70,000). That is ₹1,70,000 against ₹1,99,000; needs a portal check.
- **LPU MBA tiers carry an expiry.** The source widget stamped both the lump-sum and semester-wise figures (₹1,46,240
  and ₹1,61,600) "valid until 14 Aug 2026". The values stay in `feeBreakdown` as instructed. Recheck the portal.
- **Unverified numbers still in the compare table:** NMIMS BBA ₹1,41,000, Sharda BBA ₹1,35,000, Jain MCA from
  ₹1,30,000. Each is exact rupees from a numeric field, but none has a verified record.
- **Five MBA ranges with no label**, unchanged from origin/main: NMIMS ₹1,96,000–₹2,20,000, Symbiosis
  ₹3,15,000–₹3,70,000, Amity ₹2,07,000–₹2,25,000, Amrita ₹1,76,000–₹2,60,000, Jain ₹1,60,000–₹2,98,000. If any is
  list vs discount rather than tiers, it breaks your rule 3 and needs a `feeBreakdown` entry.
- **Uttaranchal ranges are list vs scholarship, unlabelled.** Every Uttaranchal range runs from the lowest payable
  figure to the before-scholarship figure (MBA ₹99,600–₹1,48,000). It prints unlabelled in the MBA spec-hub table and
  the hub's fee box. The values are verified; the label is missing. A `feeBreakdown` from the L4054-L4058 chart would
  fix it. Not done this round because it wasn't asked.
- **Hub hero and specialisation cards print the compact form.** They show "₹99.6K-₹1.48L" even where exact rupees
  are stored, because UniHero and UniProgramBody's specialisation grid use getDisplayFee's `compact`. FeeBreakdown
  on the same page prints the exact range. This is hub-wide display, not titles or schema; say if it should move to
  exact rupees.
- **UniversityCard prints raw slim fees, abbreviated.** On /programs/mba and the MBA spec hubs, the card shows
  `formatFeeSlim(u.feeMin) – formatFeeSlim(u.feeMax)` from lib/data-slim.ts. It never goes through getDisplayFee or
  getExactFee. LPU's card reads "₹1.6L – ₹2.0L", unlabelled, and Uttaranchal's reads "₹100K – ₹1.5L", rounding
  ₹99,600 up. Same fix as the tables: pass a getExactFee string as `programFee`. Not done this round.
- **Uttaranchal is missing from every MBA spec hub**, because its lib/data-slim.ts record has no `mbaSpecs`.
- **Spec-hub fee floors are single unverified records.** ₹52,500 is DDU Gorakhpur. ₹67,000 is Mangalayatan, which
  carries a verify advisory. ₹75,000 is Madurai Kamaraj (feeMin only, no pd.fees). ₹80,200 is Galgotias. The live
  ₹28K floor they replace was worse, a regex fragment.
- **Hand-written compare FAQ answers repeat unlabelled ranges** (app/compare/[pair]/pairs.ts). "LPU costs Rs
  1,61,600 to Rs 2,00,000" appears at L146, L160, L174, L216 and L394, and "CU costs Rs 1,65,000 to Rs 2,20,000" at
  L174, L188 and L202. The table on the same pages now labels list vs discount, so the answers disagree with it. L146
  and L188 also give "saves Rs X-Y" figures derived from those ranges. Needs a copy rewrite, not done here.
- **The same claim survives outside the FAQ.** The spec-hub tip box (components/MBASpecHubClient.tsx L236) says
  "One-time payment discounts can save Rs 10,000-20,000." The /programs/mba FAQ (components/MBAHubClient.tsx L51) has a
  hardcoded "Rs 66,000 (IGNOU) to Rs 3,70,000" range. Neither was in scope.
- **Titles and Course schema still use getDisplayFee's abbreviated values.** The LPU MBA hub's schema offer is
  161000–200000, and its title shows "₹1.61L-₹2L". Held for a later branch, as instructed.

## Compare and spec-hub fees: exact rupees (round 3, 27 Oct 2026)

Rishi stopped the merge: c83b505 put wrong numbers in the compare table. c83b505 is 71cf953 after the rebase onto
origin/main; this report keeps the original SHA.

**Why ₹1,61,600 became ₹1,61,000.** getDisplayFee takes its min/max from parsing `programDetails.{prog}.fees`, and that
string is often abbreviated. LPU's is "₹1.61L–₹2.00L", which parses to 1,61,000. The exact 1,61,600 was only ever in
`feeMin`. c83b505 printed getDisplayFee's min/max in a fee table, so every abbreviated `pd.fees` became a
rounded table value. Chandigarh's "₹1.65L–₹1.80L" is the same case. ₹1,80,000 is not a CU figure (the early-bird
Standard fee is ₹1,80,400), and both values are post-discount nets shown with no label. The ₹45,000 per semester was
that ₹1,80,000 divided by four. CU publishes no per-semester MBA figure.

**Rules now enforced** by `getExactFee` / `formatExactFee` in lib/fees.ts, used by the compare table and the MBA
spec hubs:

1. getDisplayFee still decides whether a fee may be shown. The rupees come from an exact numeric field only:
   `feeBreakdown`, `programFees`, a `pd.fees` written in full rupees, or (MBA) `feeMin`/`feeMax`. The value must
   agree with getDisplayFee within 1% or ₹1,000. A number is never read back out of a "₹X.XXL" string.
2. A list-vs-discount fee is always labelled against the list price, from the new `feeBreakdown` field in
   lib/data.ts. Entries:
   - LPU MBA and Chandigarh MBA: your verified Aug 2026 values.
   - MUJ MBA and MCA: the portal figures already recorded in lib/data.ts, read 2026-10-26.
3. A per-semester row appears only where the university publishes the figure (`feeBreakdown.perSemester`), which is
   MUJ only. It is never a total divided by semesters. The other side of that row stays blank.
4. Known drift pairs show the counsellor line: amity/mca, lpu/mca, galgotias/mca, ignou/bca, ignou/mca.
5. Anything else that cannot be shown exactly shows "Contact our counsellor for current fee details".

### The 20 values changed in c83b505, re-checked

Line numbers are lib/data.ts on this branch after the rebase onto origin/main (3a13145). Status key:

- **OK**: matches a verified value (your 27 Oct message, the backfill worklist, or the round-4 verifications:
  Amity BBA 7 Aug, Galgotias BBA 4 Aug), or no number is shown.
- **WRONG**: contradicts a verified value.
- **UNVERIFIED**: no verified record exists for that university and programme.

| Pair | University | Field | origin/main | c83b505 | c83b505 came from (lib/data.ts) | c83b505 status | Now | Now comes from | Now status |
|---|---|---|---|---|---|---|---|---|---|
| amity-vs-lpu | lovely-professional-university-online | Total Fees | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 | programDetails.MBA.fees "₹1.61L–₹2.00L" @ L555 via getDisplayFee | WRONG | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | feeBreakdown.mba @ L512 | OK |
| lpu-vs-manipal-jaipur | lovely-professional-university-online | Total Fees | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 | programDetails.MBA.fees "₹1.61L–₹2.00L" @ L555 via getDisplayFee | WRONG | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | feeBreakdown.mba @ L512 | OK |
| chandigarh-vs-lpu | chandigarh-university-online | Total Fees | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 | programDetails.MBA.fees "₹1.65L–₹1.80L" @ L2489 via getDisplayFee | WRONG | ₹2,20,000 list; ₹1,65,000–₹1,80,400 after early-bird | feeBreakdown.mba @ L2433 | OK |
| chandigarh-vs-lpu | chandigarh-university-online | Per Semester | ₹55,000/sem | ₹45,000/sem | pd.fees max ÷ 4 (derived) | WRONG | (blank: not published) | none | OK (nothing shown) |
| chandigarh-vs-lpu | lovely-professional-university-online | Total Fees | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 | programDetails.MBA.fees "₹1.61L–₹2.00L" @ L555 via getDisplayFee | WRONG | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | feeBreakdown.mba @ L512 | OK |
| amity-vs-chandigarh | chandigarh-university-online | Total Fees | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 | programDetails.MBA.fees "₹1.65L–₹1.80L" @ L2489 via getDisplayFee | WRONG | ₹2,20,000 list; ₹1,65,000–₹1,80,400 after early-bird | feeBreakdown.mba @ L2433 | OK |
| amity-vs-chandigarh | chandigarh-university-online | Per Semester | ₹55,000/sem | ₹45,000/sem | pd.fees max ÷ 4 (derived) | WRONG | (blank: not published) | none | OK (nothing shown) |
| manipal-jaipur-vs-chandigarh | chandigarh-university-online | Total Fees | ₹1,65,000 - ₹2,20,000 | ₹1,65,000 - ₹1,80,000 | programDetails.MBA.fees "₹1.65L–₹1.80L" @ L2489 via getDisplayFee | WRONG | ₹2,20,000 list; ₹1,65,000–₹1,80,400 after early-bird | feeBreakdown.mba @ L2433 | OK |
| manipal-jaipur-vs-chandigarh | chandigarh-university-online | Per Semester | ₹55,000/sem | ₹45,000/sem | pd.fees max ÷ 4 (derived) | WRONG | (blank: not published) | none | OK (nothing shown) |
| jain-vs-lpu | lovely-professional-university-online | Total Fees | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 | programDetails.MBA.fees "₹1.61L–₹2.00L" @ L555 via getDisplayFee | WRONG | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | feeBreakdown.mba @ L512 | OK |
| symbiosis-vs-nmims-bba | symbiosis-university-online | Total Fees | (row hidden) | ₹1,65,000 | programDetails.BBA.fees "₹1,65,000" @ L1746 via getDisplayFee | OK | ₹1,65,000 | programDetails.BBA.fees @ L1746 | OK |
| symbiosis-vs-nmims-bba | nmims-online | Total Fees | (row hidden) | ₹1,41,000 | programDetails.BBA.fees "₹1,41,000" @ L2230 via getDisplayFee | UNVERIFIED | ₹1,41,000 | programDetails.BBA.fees @ L2230 | UNVERIFIED |
| amity-vs-lpu-mca | lovely-professional-university-online | Total Fees | ₹1,29,600 | ₹1,08,000 | programDetails.MCA.fees "₹1.08L" @ L564 via getDisplayFee | UNVERIFIED | Contact our counsellor for current fee details | none (counsellor line) | OK (no number shown) |
| lpu-vs-chandigarh-mca | lovely-professional-university-online | Total Fees | ₹1,29,600 | ₹1,08,000 | programDetails.MCA.fees "₹1.08L" @ L564 via getDisplayFee | UNVERIFIED | Contact our counsellor for current fee details | none (counsellor line) | OK (no number shown) |
| amity-vs-jain-mca | jain-university-online | Total Fees | ₹1,30,000 - ₹1,60,000 | From ₹1,30,000 | programDetails.MCA.fees "₹1.3L" @ L341 via getDisplayFee | UNVERIFIED | From ₹1,30,000 | programFees.mca @ L275 | UNVERIFIED |
| amity-vs-lpu-bba | amity-university-online | Total Fees | (row hidden) | ₹1,99,000 | programDetails.BBA.fees "₹1.99L" @ L469 via getDisplayFee | OK | ₹1,75,120 one-time; ₹1,99,000 semester-wise total | feeBreakdown.bba @ L396 | OK |
| amity-vs-lpu-bba | lovely-professional-university-online | Total Fees | (row hidden) | Contact our counsellor for current fee details | getDisplayFee suppressed | OK (no number shown) | Contact our counsellor for current fee details | none (counsellor line) | OK (no number shown) |
| sharda-vs-galgotias-bba | sharda-university-online | Total Fees | (row hidden) | ₹1,35,000 | programDetails.BBA.fees "₹1,35,000" @ L1997 via getDisplayFee | UNVERIFIED | ₹1,35,000 | programDetails.BBA.fees @ L1997 | UNVERIFIED |
| sharda-vs-galgotias-bba | galgotias-university-online | Total Fees | (row hidden) | ₹77,200 | programDetails.BBA.fees "₹77,200" @ L1551 via getDisplayFee | OK | ₹77,200 | programFees.bba @ L1501 | OK |
| ignou-vs-lpu | lovely-professional-university-online | Total Fees | ₹1,61,600 - ₹2,00,000 | ₹1,61,000 - ₹2,00,000 | programDetails.MBA.fees "₹1.61L–₹2.00L" @ L555 via getDisplayFee | WRONG | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | feeBreakdown.mba @ L512 | OK |

Summary (updated in round 4): of the 20 c83b505 values, 11 were WRONG (LPU MBA ×5, Chandigarh MBA total ×3,
Chandigarh per semester ×3). 4 were OK: Symbiosis BBA, Galgotias BBA, Amity BBA (₹1,99,000 is its semester-wise
total) and LPU BBA as a counsellor line. 5 were UNVERIFIED. Now every WRONG value is replaced by a verified,
labelled value or by nothing, and Amity BBA shows both payment modes. LPU MCA shows the counsellor line. Three cells
stay UNVERIFIED numbers: NMIMS BBA ₹1,41,000, Jain MCA from ₹1,30,000, Sharda BBA ₹1,35,000.

### Other compare cells that changed in this round

| Cells | c83b505 | Now | Source |
|---|---|---|---|
| MUJ MBA (5 pairs) | ₹1,56,400 - ₹1,84,000 | ₹1,84,000 list; ₹1,56,400 after 15% discount | feeBreakdown.mba, from the portal note in lib/data.ts (read 2026-10-26) |
| MUJ MBA per semester (5 pairs) | ₹46,000/sem (₹1,84,000 ÷ 4) | ₹46,000 list; ₹39,100 after 15% discount | feeBreakdown.mba.perSemester, published by MUJ |
| MUJ MCA (3 pairs) | ₹1,47,600 - ₹1,64,000 | ₹1,64,000 list; ₹1,47,600 after 10% discount | feeBreakdown.mca |
| MUJ MCA per semester (3 pairs) | (no row) | ₹41,000 list; ₹36,900 after 10% discount | feeBreakdown.mca.perSemester |
| Amity MCA (3 pairs) | ₹1,99,000 | Contact our counsellor for current fee details | amity/mca is on the drift list |
| Per semester, every non-MUJ MBA cell | total ÷ 4 | row blank, or no row when neither side publishes | rule 3 |

The verdict sentence and meta description now quote a labelled fee as "₹X at list price", and include fees only when
both sides have one.

### MBA spec-hub fee range (item 6)

The range on /programs/mba/{spec} (intro, fee box, FAQ answer and FAQPage JSON-LD) came from a regex over `pd.fees`.
It took the first `programFees.mba.fee` number even when that was a discounted net, and fell back to the raw MBA-led
`feeMin`. It now comes from getExactFee bounds. A labelled fee counts at its list price, so a discounted net is never
the floor of a range. All figures print in full rupees, and the per-university table prints `formatExactFee`. Live
vs this build:

| Spec hub | Live intro range | Now intro range | Live FAQ | Now FAQ |
|---|---|---|---|---|
| /programs/mba/healthcare-management | ₹28K to ₹3.7L | ₹80,200 to ₹3,70,000 | ₹28K to ₹3.7L | ₹80,200 to ₹3,70,000 |
| /programs/mba/finance | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 |
| /programs/mba/marketing | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 |
| /programs/mba/human-resource-management | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 |
| /programs/mba/business-analytics | ₹28K to ₹3.7L | ₹67,000 to ₹3,70,000 | ₹28K to ₹3.7L | ₹67,000 to ₹3,70,000 |
| /programs/mba/data-science | ₹47K to ₹3.0L | ₹52,500 to ₹2,98,000 | ₹47K to ₹3.0L | ₹52,500 to ₹2,98,000 |
| /programs/mba/operations-management | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹28K to ₹3.7L | ₹52,500 to ₹3,70,000 |
| /programs/mba/international-business | ₹53K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹53K to ₹3.7L | ₹52,500 to ₹3,70,000 |
| /programs/mba/digital-marketing | ₹53K to ₹3.0L | ₹52,500 to ₹2,98,000 | ₹53K to ₹3.0L | ₹52,500 to ₹2,98,000 |
| /programs/mba/information-technology | ₹45K to ₹2.3L | ₹75,000 to ₹2,25,000 | ₹45K to ₹2.3L | ₹75,000 to ₹2,25,000 |
| /programs/mba/project-management | ₹1.5L to ₹1.9L | ₹1,50,000 to ₹1,89,400 | ₹1.5L to ₹1.9L | ₹1,50,000 to ₹1,89,400 |
| /programs/mba/artificial-intelligence | ₹47K to ₹3.7L | ₹52,500 to ₹3,70,000 | ₹47K to ₹3.7L | ₹52,500 to ₹3,70,000 |

### /programs/{prog} Min Fee stat (unreachable)

This sits in a fallback branch that no URL reaches; neither production nor the build renders it. It now reads
getDisplayFee, but no visible value changed. The table from round 2 is dropped as moot.

## Round 4: review of 34fbd77 (27 Oct 2026)

### MUJ: kept, figures add up

The breakdown comes from Rishi's own entry in lib/data.ts. The Aug 2026 figure (₹1,53,000, 10% merit) is
superseded. Source lines:

```
L1356:     feeVerifiedOn: '2026-10-26',
L1357:     // January 2027 fee chart, owner supplied 2026-10-26. It replaces the
L1358:     // 2026-10-07 panel (MBA Rs 1,80,000 list, Rs 1,53,000 after 15 percent).
L1359:     // Full fee, semester fee and EMI; Rs 500 application fee is additional.
L1360:     //   MBA   1,84,000  sem 46,000  EMI 7,667; 15% discount 1,56,400 / 39,100 / 6,517
L1361:     //   MCA   1,64,000  sem 41,000  EMI 6,833; 10% discount 1,47,600 / 36,900 / 6,150
```

| Programme | Figure | Check | Result |
|---|---|---|---|
| MBA (L1360, duration "2 Years (4 Semesters)" L1416) | list 1,84,000, sem 46,000 | 46,000 × 4 = 1,84,000 | adds up |
| MBA | 15% net 1,56,400, sem 39,100 | 39,100 × 4 = 1,56,400; 1,84,000 × 0.85 = 1,56,400 | adds up |
| MCA (L1361, duration "2 Yrs" L1425) | list 1,64,000, sem 41,000 | 41,000 × 4 = 1,64,000 | adds up |
| MCA | 10% net 1,47,600, sem 36,900 | 36,900 × 4 = 1,47,600; 1,64,000 × 0.90 = 1,47,600 | adds up |

The 15% figures and the ₹46,000 semester belong to the MBA. MCA is 10% and ₹41,000. Nothing failed, so no
programme was held. The `feeBreakdown` source now reads "Rishi, Jan 2027 fee chart, entered 2026-10-26".

### Uttaranchal: fee fields

All stored in full rupees, none abbreviated:

```
L4051:     feeVerifiedOn: '2026-10-26',
L4052:     // January 2027 fee chart, owner supplied 2026-10-26. Before scholarship /
L4053:     // after scholarship / semester / annual / one-time (full payment):
L4054:     //   MBA 1,48,000 / 1,03,600 / 25,900 / 49,800 / 99,600   (30% scholarship)
L4055:     //   MCA 1,20,000 / 1,02,000 / 25,500 / 49,000 / 98,000   (15%)
L4056:     //   BBA 1,20,000 / 1,08,000 / 18,000 / 34,000 / 1,02,000 (10%)
L4057:     //   BCA 1,20,000 / 1,08,000 / 18,000 / 34,000 / 1,02,000 (10%)
L4058:     //   BA    75,000 /   67,500 / 11,250 / 20,500 /   61,500 (10%)
L4063:     programFees: { mba: { fee: 99600, feeMax: 148000 }, mca: { fee: 102000, feeMax: 120000 }, bba: { fee: 108000, feeMax: 120000 }, bca: { fee: 108000, feeMax: 120000 } },
L4077:     feeMin: 99600,
L4078:     feeMax: 148000,
L4092:         fees: '₹99,600–₹1,48,000',      (MBA)
L4102:         fees: '₹1,02,000–₹1,20,000',    (MCA)
L4116:         fees: '₹1,08,000–₹1,20,000',    (BBA)
L4129:         fees: '₹1,08,000–₹1,20,000',    (BCA)
L4141:         fees: '₹67,500–₹75,000',        (BA)
```

Semester × semesters = after-scholarship total in every row: MBA 25,900 × 4 = 1,03,600; MCA 25,500 × 4 = 1,02,000;
BBA/BCA 18,000 × 6 = 1,08,000; BA 11,250 × 6 = 67,500.

Where they render:

| Surface | Form | Example (MBA) |
|---|---|---|
| Hub fee box (FeeBreakdown, `range`) | exact | ₹99,600 to ₹1,48,000 |
| Hub hero (UniHero) and specialisation cards (`compact`) | **abbreviated** | ₹99.6K-₹1.48L |
| MBA spec hubs (/programs/mba/{spec}) | **not listed at all**: UU has no `mbaSpecs` in lib/data-slim.ts | n/a |
| /programs/mba card grid (UniversityCard) | **abbreviated and rounded**, from raw slim feeMin/feeMax | ₹100K – ₹1.5L |
| Compare pairs | not in any pair | n/a |

Where getExactFee runs, the output is exact (it would print ₹99,600–₹1,48,000). Uttaranchal just never reaches those
surfaces.

No stored value is abbreviated. The abbreviation happens at render time, in the `compact` surfaces and in
UniversityCard. All of them are in NEEDS_RISHI.

### Fee verification status (round 4)

| Fee | Status | Source |
|---|---|---|
| MUJ MBA, MCA | VERIFIED | Rishi, portal update, late Oct 2026 (Jan 2027 chart, entered 2026-10-26) |
| Uttaranchal MBA, MCA, BBA, BCA, BA | VERIFIED | Rishi, portal update, late Oct 2026 (Jan 2027 chart, entered 2026-10-26) |
| LPU MBA | VERIFIED (recheck: stamped valid until 14 Aug 2026) | Rishi, portal, Aug 2026 |
| Chandigarh MBA | VERIFIED | Rishi, portal, Aug 2026 |
| Amity BBA ₹1,75,120 one-time; ₹1,99,000 semester-wise | VERIFIED | Rishi, portal, 2026-08-07. Now a `feeBreakdown` with payment-mode labels |
| Galgotias BBA ₹77,200 | VERIFIED | Official portal, 2026-08-04: yearly tuition ₹21,000, exam, registration ₹1,200, alumni ₹1,000 |
| Symbiosis BBA ₹1,65,000 | VERIFIED | Backfill worklist, 2026-08-21 |

### Spec-hub FAQ

Removed "Most programmes fall between Rs 1,50,000 and Rs 2,50,000." and "One-time payment discounts of Rs
10,000-20,000 are common." from lib/specFaqs.ts, with nothing put in their place. The answer now holds only the exact
range (or the counsellor line) and the existing EMI sentence.

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
