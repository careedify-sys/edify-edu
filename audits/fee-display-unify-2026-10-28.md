# Fee display unify (seo/fee-display-unify, 28 Oct 2026)

Branch cut from main at 385361b (the seo/tech-health merge). Not merged.

**Rule now enforced site-wide on the surfaces below:** every fee comes from `getExactFee` (lib/fees.ts).
- `getDisplayFee` still decides whether a fee may be shown at all.
- The rupees come only from an exact numeric field: `feeBreakdown`, `programFees`, a `pd.fees` written in full rupees,
  or (MBA) `feeMin`/`feeMax`. The value must agree with `getDisplayFee`.
- A list-vs-discount fee is always labelled; payment modes are labelled as modes.
- Where a short token is needed (titles, tiles, badges), it is the list or before-scholarship price, never a bare net.
- Suppressed means "Contact our counsellor for current fee details".

Full before/after for every changed string: **audits/fee-display-unify-2026-10-28.csv** (537 university-programme
rows; one column pair per surface; source field and lib/data.ts line; VERIFIED/UNVERIFIED). Regenerate with
`npx tsx scripts/report-fee-display.mts audits/fee-display-unify-2026-10-28.csv`.

## Needs Rishi's decision first

1. **179 programme fees, all on indexable hubs, now show the counsellor line instead of a number.** Each one's only
   figure is an abbreviated `pd.fees` string ("₹1.3L", "₹1.99L", "₹135K – ₹135K"). There's no exact numeric field to
   take rupees from, and your rule forbids reading them from the string. By programme: MBA 39, MCA 28, BBA 28,
   BCA 23, M.Com 19, B.Com 18, BA 11, MSc 9, BSc 2, MA 2. On those hubs the title loses its fee token, the hero shows
   the counsellor line, and the spec titles read "UGC-DEB Approved". Indexing is unchanged (`shouldIndexProgrammeHub`
   still uses `getDisplayFee`). The options:
   - keep this;
   - treat a `pd.fees` written to the rupee in K form ("₹135K" = ₹1,35,000) as exact;
   - backfill `programFees` from the portals.

   Full list at the end.
2. **Titles and short tokens now show the list price, which raises the headline figure for discounted
   universities.** LPU's title goes from "₹1.61L-₹2L" to "₹2,00,000", Chandigarh's to "₹2,20,000", and Uttaranchal's
   from "From ₹99.6K" to "₹1,48,000". That is your rule 3 ("show the list price only"), but these are fee-query
   titles; see memory/project_fee_query_gap. Watch CTR on these hubs.
3. **About 2,000 specialisation-page titles change.** They printed `compactFee(pd.fees)` with no `getDisplayFee` gate
   (e.g. LPU BBA specs said "₹0.2L-₹1.5L", a suppressed placeholder). They now print the exact short token or
   "UGC-DEB Approved". `clampTitle` rules are unchanged.

## What changed, by item

**a. University cards (/programs/mba, MBA spec hubs, /programs/{prog}).**
- The cards printed `formatFeeSlim(u.feeMin)–formatFeeSlim(u.feeMax)`, raw slim fields: LPU "₹1.6L – ₹2.0L",
  Uttaranchal "₹100K – ₹1.5L". They now take full `getExactFee` text from the server, e.g. LPU "₹2,00,000 list;
  ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise)". A suppressed fee shows the counsellor line;
  before, the card said "Ask counsellor".
- /programs/{prog} cards and the ProgrammeComparisonTable used `getDisplayFee.compact`; they now print exact text.

**b. Hub hero, specialisation cards, fee box, hub and spec FAQs.**
- **UniHero** prints the short token large with the label small underneath (e.g. "₹2,00,000" / "list;
  ₹1,46,240–₹1,61,600 by payment plan"), so a long label does not wrap into a column.
- **SpecializationGrid, FeeBreakdown and the hub FAQ** print `formatExactFee`. FeeBreakdown's "Per Semester
  (approx.)" row divided the total by 4 or 6. It now shows only a published per-semester figure (MUJ and
  Uttaranchal), or no row.
- **The spec-page FAQ** printed raw `pd.fees` or "₹{feeMin/1000}K+"; it now prints exact text.
- **The overview page** printed the MBA-led `feeMin`–`feeMax` range in the FAQ, stat tile, programme tab, sibling
  list and "Fees from" for whichever programme tab was open. All five now use the server-resolved exact strings.

**c. Uttaranchal feeBreakdown.** Built only from the 26 Oct chart already in the record (lib/data.ts L4056-L4060,
breakdown L4069-L4075). MBA renders "₹1,48,000 before scholarship; ₹99,600–₹1,03,600 after 30% scholarship (one-time
or semester-wise)", per semester "₹25,900 after 30% scholarship". MCA, BBA, BCA and BA follow the same pattern. A new
`listLabel` field lets "before scholarship" replace "list".

**d. pairs.ts compare FAQs.**
- The 22 fee-question answers are now generated from the same `getExactFee` values as the table, so they cannot
  drift again. A suppressed side quotes no number.
- Six hand edits where other answers or verdicts disagreed with the table:

  | Pair | Fix |
  |---|---|
  | Symbiosis vs NMIMS BBA | Now quotes NMIMS BBA ₹1,41,000, as the table does |
  | Amity vs LPU BBA | Both Amity payment modes |
  | Sharda vs Galgotias BBA | Galgotias ₹77,200 (was ₹77,000), in the FAQ and the verdict |
  | IGNOU vs LPU | LPU labelled |
  | Amity vs LPU, MUJ vs NMIMS | Removed derived "save Rs X-Y" verdicts. The MUJ one was built from the superseded ₹1,80,000/₹1,53,000 fees |

- Spelled out "Rs 3.15L" and "Rs 1.08L".

**e.** Removed "One-time payment discounts can save Rs 10,000-20,000." from the MBASpecHubClient tip box. Nothing
replaced it.

**f. /programs/mba fee range.** The FAQ answer is now generated: "Total programme fees range from ₹50,000 to
₹3,70,000 at list price across the 49 online MBA programmes we index. Fees are indicative, so confirm the current
figure on each university's official portal." It names no university.
- It uses list-price bounds over hubs that resolve and are indexable.
- The same range now drives the hero, which was raw slim `feeMin`/`feeMax`.
- The specialisation cards' "from ₹X" floors now come from `getExactFee` list-price floors, not raw slim `feeMin`.
- The hardcoded top-pick badges ("Rs 1.61L") now show the exact short token.
- I also dropped the FAQ's two unsourced sentences ("most popular programmes fall between Rs 1,50,000 and Rs
  2,25,000", "one-time payment discounts of Rs 10,000-20,000 are common"). They are the same claims you had removed
  from the spec hubs.

**g. Titles and schema.**
- The hub titles and descriptions (5 templates), the overview title, the 5 spec-page templates and the 11 MBA
  override titles now carry exact rupees. Override titles are 49-57 characters.
- Override descriptions with abbreviated fees (LPU, NMIMS, CU, DY Patil, MAHE) are now exact. The LPU and CU intros,
  which said "₹1,61,000 to ₹2,00,000" and "₹1,65,000 to ₹1,80,000", now carry the verified labelled figures.
- `lib/seo/program-schema.ts` now builds offers from `getExactFee`. Every hub, overview, compare and Course node uses
  it (SchemaBlock now does too). LPU's schema is an AggregateOffer, 146240–200000, with the labelled text as its
  description. Before, it was 161000–200000. A suppressed fee keeps an Offer with category only.

## Verified rows (18), before → after

Source lines are lib/data.ts on this branch.

| University | Prog | Source | Title token | Hero | Fee box total | Per semester | Spec title token | Card | Schema |
|---|---|---|---|---|---|---|---|---|---|
| amity-university | BBA | feeBreakdown.bba L398 | ₹1.99L → ₹1,75,120–₹1,99,000 | ₹1.99L → ₹1,75,120–₹1,99,000 | ₹1,99,000 → ₹1,75,120 one-time; ₹1,99,000 semester-wise total | ₹33,167 → (none) | ₹1.99L → ₹1,75,120–₹1,99,000 | ₹1.99L → ₹1,75,120 one-time; ₹1,99,000 semester-wise total | 199000 → 175120-199000 |
| lovely-professional-university | MBA | feeBreakdown.mba L514 | ₹1.61L-₹2L → ₹2,00,000 | ₹1.61L-₹2L → ₹2,00,000 | ₹1,61,000 to ₹2,00,000 → ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | ₹40,250 → (none) | ₹1.61L-₹2.00L → ₹2,00,000 | ₹1.6L – ₹2.0L → ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise) | 161000-200000 → 146240-200000 |
| manipal-university-jaipur | MBA | feeBreakdown.mba L1372 | ₹1.56L-₹1.84L → ₹1,84,000 | ₹1.56L-₹1.84L → ₹1,84,000 | ₹1,56,400 to ₹1,84,000 → ₹1,84,000 list; ₹1,56,400 after 15% discount | ₹39,100 → ₹46,000 list; ₹39,100 after 15% discount | ₹1,56,400-₹1,84,000 → ₹1,84,000 | ₹1.6L – ₹1.8L → ₹1,84,000 list; ₹1,56,400 after 15% discount | 156400-184000 |
| manipal-university-jaipur | MCA | feeBreakdown.mca L1372 | ₹1.48L-₹1.64L → ₹1,64,000 | ₹1.48L-₹1.64L → ₹1,64,000 | ₹1,47,600 to ₹1,64,000 → ₹1,64,000 list; ₹1,47,600 after 10% discount | ₹36,900 → ₹41,000 list; ₹36,900 after 10% discount | ₹1,47,600-₹1,64,000 → ₹1,64,000 | ₹1.48L-₹1.64L → ₹1,64,000 list; ₹1,47,600 after 10% discount | 147600-164000 |
| manipal-university-jaipur | BBA | programFees.bba L1370 | ₹1.44L → ₹1,44,000 | ₹1.44L → ₹1,44,000 | ₹1,44,000 | ₹24,000 → (none) | ₹1.44L → ₹1,44,000 | ₹1.44L → ₹1,44,000 | 144000 |
| manipal-university-jaipur | BCA | programFees.bca L1370 | ₹1.44L → ₹1,44,000 | ₹1.44L → ₹1,44,000 | ₹1,44,000 | ₹24,000 → (none) | ₹1.44L → ₹1,44,000 | ₹1.44L → ₹1,44,000 | 144000 |
| manipal-university-jaipur | B.Com | programDetails.B.Com.fees L1459 | ₹1.05L → ₹1,05,000 | ₹1.05L → ₹1,05,000 | ₹1,05,000 | ₹17,500 → (none) | ₹1,05,000 | ₹1.05L → ₹1,05,000 | 105000 |
| manipal-university-jaipur | M.Com | none: no exact field agrees with getDisplayFee, or drift pair | ₹1.08L → (no fee) | ₹1.08L → Contact our counsellor for current fee details | ₹1,08,000 → (counsellor block) | ₹27,000 → (none) | ₹1.08L → UGC-DEB Approved | ₹1.08L → Contact our counsellor for current fee details | 108000 → (none) |
| manipal-university-jaipur | MSc | none: no exact field agrees with getDisplayFee, or drift pair | ₹84,000 → (no fee) | ₹84,000 → Contact our counsellor for current fee details | ₹84,000 → (counsellor block) | ₹21,000 → (none) | ₹84K → UGC-DEB Approved | ₹84,000 → Contact our counsellor for current fee details | 84000 → (none) |
| manipal-university-jaipur | MA | none: getDisplayFee rule 4b | (no fee) | On request → Contact our counsellor for current fee details | (counsellor block) |  | ₹156K+ → UGC-DEB Approved | Ask counsellor → Contact our counsellor for current fee details |  |
| galgotias-university | BBA | programFees.bba L1503 | ₹77,200 | ₹77,200 | ₹77,200 | ₹12,867 → (none) | ₹77,200 | ₹77,200 | 77200 |
| symbiosis-university | BBA | programDetails.BBA.fees L1748 | ₹1.65L → ₹1,65,000 | ₹1.65L → ₹1,65,000 | ₹1,65,000 | ₹27,500 → (none) | ₹1,65,000 | ₹1.65L → ₹1,65,000 | 165000 |
| chandigarh-university | MBA | feeBreakdown.mba L2435 | ₹1.65L-₹1.8L → ₹2,20,000 | ₹1.65L-₹1.8L → ₹2,20,000 | ₹1,65,000 to ₹1,80,000 → ₹2,20,000 list; ₹1,65,000–₹1,80,400 after early-bird | ₹41,250 → (none) | ₹1.65L-₹1.80L → ₹2,20,000 | ₹1.6L – ₹2.2L → ₹2,20,000 list; ₹1,65,000–₹1,80,400 after early-bird | 165000-180000 → 165000-220000 |
| uttaranchal-university | MBA | feeBreakdown.mba L4069 | ₹99.6K-₹1.48L → ₹1,48,000 | ₹99.6K-₹1.48L → ₹1,48,000 | ₹99,600 to ₹1,48,000 → ₹1,48,000 before scholarship; ₹99,600–₹1,03,600 after 30% scholarship (one-time or semester-wise) | ₹24,900 → ₹25,900 after 30% scholarship | ₹99,600-₹1,48,000 → ₹1,48,000 | ₹100K – ₹1.5L → ₹1,48,000 before scholarship; ₹99,600–₹1,03,600 after 30% scholarship (one-time or semester-wise) | 99600-148000 |
| uttaranchal-university | MCA | feeBreakdown.mca L4069 | ₹1.02L-₹1.2L → ₹1,20,000 | ₹1.02L-₹1.2L → ₹1,20,000 | ₹1,02,000 to ₹1,20,000 → ₹1,20,000 before scholarship; ₹98,000–₹1,02,000 after 15% scholarship (one-time or semester-wise) | ₹25,500 → ₹25,500 after 15% scholarship | ₹1,02,000-₹1,20,000 → ₹1,20,000 | ₹1.02L-₹1.2L → ₹1,20,000 before scholarship; ₹98,000–₹1,02,000 after 15% scholarship (one-time or semester-wise) | 102000-120000 → 98000-120000 |
| uttaranchal-university | BBA | feeBreakdown.bba L4069 | ₹1.08L-₹1.2L → ₹1,20,000 | ₹1.08L-₹1.2L → ₹1,20,000 | ₹1,08,000 to ₹1,20,000 → ₹1,20,000 before scholarship; ₹1,02,000–₹1,08,000 after 10% scholarship (one-time or semester-wise) | ₹18,000 → ₹18,000 after 10% scholarship | ₹1,08,000-₹1,20,000 → ₹1,20,000 | ₹1.08L-₹1.2L → ₹1,20,000 before scholarship; ₹1,02,000–₹1,08,000 after 10% scholarship (one-time or semester-wise) | 108000-120000 → 102000-120000 |
| uttaranchal-university | BCA | feeBreakdown.bca L4069 | ₹1.08L-₹1.2L → ₹1,20,000 | ₹1.08L-₹1.2L → ₹1,20,000 | ₹1,08,000 to ₹1,20,000 → ₹1,20,000 before scholarship; ₹1,02,000–₹1,08,000 after 10% scholarship (one-time or semester-wise) | ₹18,000 → ₹18,000 after 10% scholarship | ₹1,08,000-₹1,20,000 → ₹1,20,000 | ₹1.08L-₹1.2L → ₹1,20,000 before scholarship; ₹1,02,000–₹1,08,000 after 10% scholarship (one-time or semester-wise) | 108000-120000 → 102000-120000 |
| uttaranchal-university | BA | feeBreakdown.ba L4069 | ₹68K-₹75K → ₹75,000 | ₹68K-₹75K → ₹75,000 | ₹67,500 to ₹75,000 → ₹75,000 before scholarship; ₹61,500–₹67,500 after 10% scholarship (one-time or semester-wise) | ₹11,250 → ₹11,250 after 10% scholarship | ₹67,500-₹75,000 → ₹75,000 | ₹68K-₹75K → ₹75,000 before scholarship; ₹61,500–₹67,500 after 10% scholarship (one-time or semester-wise) | 67500-75000 → 61500-75000 |

The other 519 changed rows are UNVERIFIED. They are in the CSV with the same columns.

## Static text changed (not in the CSV)

| File | What | Before | After | Status |
|---|---|---|---|---|
| lib/mba-seo-overrides.ts | LPU title | ₹1.61L-₹2L | ₹2,00,000 | VERIFIED |
| | LPU description | ₹1.61L to ₹2L total | ₹2,00,000 list; ₹1,46,240 to ₹1,61,600 by payment plan | VERIFIED |
| | LPU intro | costs ₹1,61,000 to ₹2,00,000 | lists at ₹2,00,000; ₹1,61,600 semester-wise, ₹1,46,240 lump sum | VERIFIED |
| | CU title | ₹1.65L-₹1.8L | ₹2,20,000 | VERIFIED |
| | CU description | ₹1,65,000 to ₹1,80,000 … 25% Early Bird Scholarship available | ₹2,20,000 list; ₹1,65,000 to ₹1,80,400 after early-bird | VERIFIED |
| | CU intro | costs ₹1,65,000 to ₹1,80,000 | lists at ₹2,20,000; early-bird ₹1,80,400 Standard, ₹1,65,000 HBP and Business Analytics | VERIFIED |
| | MUJ title | ₹1.56L-₹1.84L | ₹1,84,000 | VERIFIED |
| | Uttaranchal title | From ₹99.6K | ₹1,48,000 | VERIFIED |
| | Amity title | ₹2.07L-₹2.25L | ₹2,07,000–₹2,25,000 | UNVERIFIED |
| | NMIMS title, description | ₹1.96L-₹2.2L | ₹1,96,000–₹2,20,000 | UNVERIFIED |
| | JAIN title | ₹1.6L-₹2.98L | ₹1,60,000–₹2,98,000 | UNVERIFIED |
| | DY Patil title, description | ₹1.75L | ₹1,75,000 | UNVERIFIED |
| | MAHE title, description | ₹2.92L | ₹2,92,000 | UNVERIFIED |
| | SMU title | ₹1.2L | ₹1,20,000 | UNVERIFIED |
| | Symbiosis title | ₹3.15L-₹3.7L | ₹3,15,000–₹3,70,000 | UNVERIFIED |
| components/MBAHubClient.tsx | FAQ range | Rs 66,000 (IGNOU) to Rs 3,70,000 (Symbiosis SSODL) | ₹50,000 to ₹3,70,000 at list price, 49 programmes (generated) | UNVERIFIED (floor is Chhatrapati Shahu Ji Maharaj, pd.fees "₹50K – ₹120K", no portal check) |
| app/compare/[pair]/pairs.ts | 22 fee FAQs | hand-written | generated from the table | as the table |
| | Galgotias BBA | Rs 77,000 | Rs 77,200 | VERIFIED |
| | Amity BBA | Rs 1,99,000 | Rs 1,75,120 one-time or Rs 1,99,000 semester-wise | VERIFIED |
| | LPU (ignou-vs-lpu) | Rs 1,61,600 to Rs 2,00,000 | Rs 2,00,000 (Rs 1,46,240 to Rs 1,61,600 by payment plan) | VERIFIED |
| | NMIMS BBA | confirm with a counsellor | Rs 1,41,000 | UNVERIFIED |
| | amity-vs-lpu verdict | save Rs 25,000-45,000 | LPU Rs 2,00,000 vs Amity Rs 2,07,000 to Rs 2,25,000 | VERIFIED (LPU side) |
| | muj-vs-nmims verdict | save Rs 16K-67K | MUJ Rs 1,84,000 (Rs 1,56,400 after 15%) vs NMIMS Rs 1,96,000 to Rs 2,20,000 | VERIFIED (MUJ side) |

## Checks

- `next build`: passes, 2,323 pages. Pre-commit: see the commit.
- **Schema**, same 12 pages as before: 0 issues. The validator now allows `description` on AggregateOffer, which is
  valid on any schema.org Thing.
- **Link crawl** (local `next start`, 3,221 pages): 0 dead internal links, 0 links into redirects.
  `check-internal-hub-links`: PASS.
- **Rendered spot checks:** LPU hub title, hero, fee box and schema; Uttaranchal hub and per-semester figure;
  /programs/mba FAQ, hero range, cards and badges; MBA spec-hub cards; ignou-vs-lpu and amity-vs-lpu-bba FAQs; LPU
  overview title.

## Still abbreviated or raw (not in items a-g)

A scan of all 2,621 prerendered pages for "₹X.XL" / "₹XK" in visible text, after this branch:

| Surface | Pages | Source |
|---|---|---|
| Overview pages: peer-university fees and the EMI widget | 141 | UniversityPageClient L706 (`formatFee(ou.feeMin)+`) and EMIPlans `feeMin`/`feeMax`; both read other universities' slim data in a client component |
| Homepage and /universities cards | 2 | AnimatedUniGrid and app/universities/page.tsx. These are client pages with no server parent to compute exact fees, so they still print `formatFeeSlim(feeMin)–formatFeeSlim(feeMax)` |
| /fees | 1 | FeesTableClient over data/fees-hub-data.json |
| /best-online-mba-india | 1 | lib/best-mba-ranking.ts (`getDisplayFee.compact`) |
| /programs/mba/specializations/{spec} | 7 | app/programs/mba/specializations/[spec]/page.tsx "Fee Range" |
| Spec pages with page-content JSON | about 500 | Fee text written into lib/data/page-content/*.json |
| Blog posts | 106 | Post bodies; the blog fee gate covers new posts only |
| Compare index, guides, coupons, tools, online-mca | 6 | Hand-written copy |

The page-content JSON and blog text are content edits, not template fixes, and need a decision on how far to go.

## The 179 fees that now show the counsellor line

| University | Prog | Was showing | Why no exact value |
|---|---|---|---|
| jain-university-online | BCA | ₹1.35L | none: no exact field agrees with getDisplayFee, or drift pair |
| jain-university-online | M.Com | ₹1.3L-₹2.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| amity-university-online | MCA | ₹1.99L | none: no exact field agrees with getDisplayFee, or drift pair |
| amity-university-online | B.Com | ₹1.15L | none: no exact field agrees with getDisplayFee, or drift pair |
| lovely-professional-university-online | MCA | ₹1.08L | none: no exact field agrees with getDisplayFee, or drift pair |
| dayananda-sagar-university-online | MCA | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| dayananda-sagar-university-online | BCA | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| dayananda-sagar-university-online | B.Com | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| dayananda-sagar-university-online | BBA | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| upes-online | BBA | ₹1.69L | none: no exact field agrees with getDisplayFee, or drift pair |
| parul-university-online | B.Com | ₹60K-₹70K | none: no exact field agrees with getDisplayFee, or drift pair |
| amrita-vishwa-vidyapeetham-online | MCA | ₹1.4L | none: no exact field agrees with getDisplayFee, or drift pair |
| amrita-vishwa-vidyapeetham-online | B.Com | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| amrita-vishwa-vidyapeetham-online | BBA | ₹1.65L | none: no exact field agrees with getDisplayFee, or drift pair |
| amrita-vishwa-vidyapeetham-online | BCA | ₹1.65L | none: no exact field agrees with getDisplayFee, or drift pair |
| amrita-vishwa-vidyapeetham-online | M.Com | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| mangalayatan-university-online | MCA | ₹67,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| mangalayatan-university-online | BCA | ₹70K-₹1.03L | none: no exact field agrees with getDisplayFee, or drift pair |
| mangalayatan-university-online | M.Com | ₹67,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| mangalayatan-university-online | MSc | ₹55,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| mangalayatan-university-online | BA | ₹31K-₹55K | none: no exact field agrees with getDisplayFee, or drift pair |
| shoolini-university-online | MCA | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| shoolini-university-online | BCA | ₹90K-₹1.1L | none: no exact field agrees with getDisplayFee, or drift pair |
| shoolini-university-online | B.Com | ₹90K-₹1.1L | none: no exact field agrees with getDisplayFee, or drift pair |
| shoolini-university-online | MSc | ₹1.3L-₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| manipal-university-jaipur-online | M.Com | ₹1.08L | none: no exact field agrees with getDisplayFee, or drift pair |
| manipal-university-jaipur-online | MSc | ₹84,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| galgotias-university-online | MCA | ₹84,200 | none: no exact field agrees with getDisplayFee, or drift pair |
| sikkim-manipal-university-online | BBA | ₹90,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| sikkim-manipal-university-online | BA | ₹75,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| sikkim-manipal-university-online | M.Com | ₹75,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| symbiosis-university-online | MSc | ₹1.4L-₹1.54L | none: no exact field agrees with getDisplayFee, or drift pair |
| symbiosis-university-online | BSc | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| symbiosis-university-online | MA | ₹1L | none: no exact field agrees with getDisplayFee, or drift pair |
| yenepoya-university-online | MBA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| yenepoya-university-online | MCA | ₹50,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| yenepoya-university-online | B.Com | ₹75,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| yenepoya-university-online | BBA | ₹90K-₹1.05L | none: no exact field agrees with getDisplayFee, or drift pair |
| yenepoya-university-online | BCA | ₹1.05L-₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| sharda-university-online | MBA | ₹1.4L | none: no exact field agrees with getDisplayFee, or drift pair |
| sharda-university-online | BCA | ₹1.35L | none: no exact field agrees with getDisplayFee, or drift pair |
| sharda-university-online | M.Com | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| sharda-university-online | BA | ₹54,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manonmaniam-sundaranar-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manonmaniam-sundaranar-university-online | BA | ₹45,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manonmaniam-sundaranar-university-online | B.Com | ₹45,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manonmaniam-sundaranar-university-online | BBA | ₹45,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manonmaniam-sundaranar-university-online | M.Com | ₹40,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manipal-academy-higher-education-online | BBA | ₹1.68L-₹2.24L | none: no exact field agrees with getDisplayFee, or drift pair |
| manipal-academy-higher-education-online | MSc | ₹1.6L-₹2.8L | none: no exact field agrees with getDisplayFee, or drift pair |
| kl-university-online | MCA | ₹65,500 | none: no exact field agrees with getDisplayFee, or drift pair |
| kl-university-online | BBA | ₹79,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| kl-university-online | BCA | ₹79,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| vtu-online | MBA | ₹1.41L | none: no exact field agrees with getDisplayFee, or drift pair |
| vtu-online | BBA | ₹77,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| vtu-online | BCA | ₹1.01L | none: no exact field agrees with getDisplayFee, or drift pair |
| integral-university-online | B.Com | ₹36,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| integral-university-online | BA | ₹36,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| integral-university-online | M.Com | ₹30,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| integral-university-online | MSc | ₹30,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | MBA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | MCA | ₹1.1L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | M.Com | ₹1L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | BA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | B.Com | ₹1.2L-₹2.4L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | BBA | ₹1.8L | none: no exact field agrees with getDisplayFee, or drift pair |
| manav-rachna-online | BCA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| karnataka-state-open-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| karnataka-state-open-university-online | BA | ₹10K-₹30K | none: no exact field agrees with getDisplayFee, or drift pair |
| karnataka-state-open-university-online | BBA | ₹39,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| karnataka-state-open-university-online | BCA | ₹52,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| karnataka-state-open-university-online | M.Com | ₹40,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| bharathidasan-university-online | BBA | ₹90K-₹1.21L | none: no exact field agrees with getDisplayFee, or drift pair |
| bharathidasan-university-online | BA | ₹45,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| hindustan-institute-technology-online | MBA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-ghasidas-vishwavidyalaya-online | MBA | ₹1.47L | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-ghasidas-vishwavidyalaya-online | MCA | ₹1.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-ghasidas-vishwavidyalaya-online | B.Com | ₹81,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-ghasidas-vishwavidyalaya-online | M.Com | ₹1.47L | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-ghasidas-vishwavidyalaya-online | BCA | ₹1.47L | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-babasaheb-ambedkar-open-university-online | MBA | ₹30,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-babasaheb-ambedkar-open-university-online | MCA | ₹50,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-babasaheb-ambedkar-open-university-online | BCA | ₹45,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-babasaheb-ambedkar-open-university-online | B.Com | ₹16,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-babasaheb-ambedkar-open-university-online | M.Com | ₹22,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| marwadi-university-online | MCA | ₹89,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-mysore-online | MBA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-mysore-online | BBA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-mysore-online | BCA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-mysore-online | B.Com | ₹84,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-mysore-online | M.Com | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| aligarh-muslim-university-online | MBA | ₹28K-₹40K | none: no exact field agrees with getDisplayFee, or drift pair |
| aligarh-muslim-university-online | BA | ₹28,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| aligarh-muslim-university-online | B.Com | ₹28,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| aligarh-muslim-university-online | M.Com | ₹12K-₹24K | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-university-online | B.Com | ₹12,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-university-online | BA | ₹15,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-university-online | M.Com | ₹18,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-university-online | BCA | ₹12K-₹36K | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-university-online | MSc | ₹18K-₹36K | none: no exact field agrees with getDisplayFee, or drift pair |
| charusat-university-online | MBA | ₹75K-₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| charusat-university-online | MCA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| charusat-university-online | BCA | ₹50K-₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| charusat-university-online | BBA | ₹50K-₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| maharishi-markandeshwar-university-online | MBA | ₹1.4L | none: no exact field agrees with getDisplayFee, or drift pair |
| maharishi-markandeshwar-university-online | MCA | ₹1L | none: no exact field agrees with getDisplayFee, or drift pair |
| maharishi-markandeshwar-university-online | BCA | ₹1.08L | none: no exact field agrees with getDisplayFee, or drift pair |
| maharishi-markandeshwar-university-online | BBA | ₹1.08L | none: no exact field agrees with getDisplayFee, or drift pair |
| maharishi-markandeshwar-university-online | MSc | ₹70,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| mizoram-university-online | MBA | ₹54K-₹56K | none: no exact field agrees with getDisplayFee, or drift pair |
| vivekananda-global-university-online | MBA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| vivekananda-global-university-online | BBA | ₹1.32L | none: no exact field agrees with getDisplayFee, or drift pair |
| vivekananda-global-university-online | BCA | ₹1.32L | none: no exact field agrees with getDisplayFee, or drift pair |
| vivekananda-global-university-online | BA | ₹72,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| vivekananda-global-university-online | MSc | ₹72,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-mgr-educational-research-institute-online | MBA | ₹1.41L | none: no exact field agrees with getDisplayFee, or drift pair |
| andhra-university-online | MA | ₹30,000 total | none: no exact field agrees with getDisplayFee, or drift pair |
| central-university-himachal-pradesh-online | MBA | ₹38,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| vit-university-online | MCA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| kurukshetra-university-online | MCA | ₹76,600 | none: no exact field agrees with getDisplayFee, or drift pair |
| dr-dy-patil-vidyapeeth-online | MCA | ₹1.9L | none: no exact field agrees with getDisplayFee, or drift pair |
| jamia-millia-islamia-online | MBA | ₹50,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| christ-university-online | MCA | ₹2.3L | none: no exact field agrees with getDisplayFee, or drift pair |
| christ-university-online | BBA | ₹1.75L | none: no exact field agrees with getDisplayFee, or drift pair |
| shobhit-university-online | MBA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| shobhit-university-online | MCA | ₹70,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| shobhit-university-online | BBA | ₹90,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| shobhit-university-online | BCA | ₹90,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-lucknow-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-lucknow-online | BBA | ₹60,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-lucknow-online | B.Com | ₹30,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-lucknow-online | M.Com | ₹28,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| jss-university-online | MBA | ₹1L-₹2L | none: no exact field agrees with getDisplayFee, or drift pair |
| alliance-university-online | MBA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| desh-bhagat-university-online | MCA | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| ganpat-university-online | MBA | ₹97,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| ganpat-university-online | MCA | ₹97,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| ganpat-university-online | BBA | ₹90,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| amet-university-online | MBA | ₹2L | none: no exact field agrees with getDisplayFee, or drift pair |
| amet-university-online | BBA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| amet-university-online | B.Com | ₹1.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-nanak-dev-university-online | MBA | ₹27K-₹55K | none: no exact field agrees with getDisplayFee, or drift pair |
| guru-nanak-dev-university-online | M.Com | ₹17K-₹34K | none: no exact field agrees with getDisplayFee, or drift pair |
| savitribai-phule-pune-university-online | MCA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-university-sikkim-online | MBA | ₹1.1L-₹1.17L | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-university-sikkim-online | BBA | ₹1.17L total (₹19,500/sem) | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-university-sikkim-online | BCA | ₹1.17L total (₹19,500/sem) | none: no exact field agrees with getDisplayFee, or drift pair |
| sathyabama-university-online | MBA | ₹45K-₹90K | none: no exact field agrees with getDisplayFee, or drift pair |
| sathyabama-university-online | BBA | ₹15K-₹45K | none: no exact field agrees with getDisplayFee, or drift pair |
| anna-university-online | MBA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| northcap-university-online | BBA | ₹72,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| northcap-university-online | B.Com | ₹48,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| noida-international-university-online | MBA | ₹88,500 | none: no exact field agrees with getDisplayFee, or drift pair |
| gujarat-technological-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| datta-meghe-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| datta-meghe-university-online | MCA | ₹70,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| centurion-university-online | MBA | ₹1.4L | none: no exact field agrees with getDisplayFee, or drift pair |
| jaipur-national-university-online | BBA | ₹1.04L | none: no exact field agrees with getDisplayFee, or drift pair |
| bs-abdur-rahman-university-online | MBA | ₹1.6L | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-institute-science-technology-online | MCA | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-institute-science-technology-online | M.Com | ₹60K total (₹15,000/sem) | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-institute-science-technology-online | BBA | ₹1.29L total (₹21,500/sem) | none: no exact field agrees with getDisplayFee, or drift pair |
| srm-institute-science-technology-online | BCA | ₹1.50L total (₹25,000/sem) | none: no exact field agrees with getDisplayFee, or drift pair |
| university-of-madras-online | MBA | ₹20K-₹40K | none: no exact field agrees with getDisplayFee, or drift pair |
| bharathiar-university-online | BBA | ₹43,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| sri-ramachandra-university-online | BSc | ₹1.5L | none: no exact field agrees with getDisplayFee, or drift pair |
| shiv-nadar-university-online | MBA | ₹5L | none: no exact field agrees with getDisplayFee, or drift pair |
| gla-university-online | MBA | ₹1.76L-₹2.2L | none: no exact field agrees with getDisplayFee, or drift pair |
| jagannath-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| subharti-university-online | MBA | ₹80,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| jamia-hamdard-online | MCA | ₹87,500 | none: no exact field agrees with getDisplayFee, or drift pair |
| chhatrapati-shahu-ji-maharaj-university-online | B.Com | ₹27K-₹66K | none: no exact field agrees with getDisplayFee, or drift pair |
| chhatrapati-shahu-ji-maharaj-university-online | BBA | ₹30K-₹72K | none: no exact field agrees with getDisplayFee, or drift pair |
| chhatrapati-shahu-ji-maharaj-university-online | BCA | ₹30K-₹72K | none: no exact field agrees with getDisplayFee, or drift pair |
| chhatrapati-shahu-ji-maharaj-university-online | M.Com | ₹35K-₹84K | none: no exact field agrees with getDisplayFee, or drift pair |
| assam-down-town-university-online | MCA | ₹90,000 | none: no exact field agrees with getDisplayFee, or drift pair |
| ignou-online | MCA | ₹50,800 | none: no exact field agrees with getDisplayFee, or drift pair |
| ignou-online | BCA | ₹49,800 | none: no exact field agrees with getDisplayFee, or drift pair |
| choudhary-charan-singh-university-online | MBA | ₹54K-₹66K | none: no exact field agrees with getDisplayFee, or drift pair |
