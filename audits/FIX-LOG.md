# Fix log

Running record of every fix: what changed, **why**, how it was verified, and what
guards it. Newest first. One entry per commit that changes behaviour or data.

Rule for new entries: never write only what changed. The *why* is the part that
is expensive to reconstruct later, and it is what stops the next person undoing
the fix by accident.

---

## 2026-09-13 · link the verify pages from programme hubs

**What.** A `getVerifyPage()`-gated verify link in the approvals block of
`UniProgramBody`, so every resolvable programme hub links its university's
verification page. **356 new links across 105 verify pages, +3.4 inbound each.**

**Why.** Verify pages are the best opportunity on the site by the numbers, and
the audit had them parked as a "candidate":

| cluster | pages | clicks | CTR | avg inbound links |
|---|---:|---:|---:|---:|
| coupons | 9 | 46 | 3.00% | healthy |
| **verify** | 61 | 186 | **1.76%** | **1.0** |
| universities | 650 | 593 | 0.80% | 28.9 |
| blog | 180 | 1,127 | 0.46% | 8.2 |

The second-best-converting page type on the site, ranking at position 4 to 6, was
also the most link-starved: 124 pages averaging one inbound contextual link, 17
with none, and the only source was the university overview page.

The approvals block is the honest place for the link rather than a footer or a
sidebar, because that is exactly where the page makes its UGC-DEB and NAAC
claims. Anchor text names both.

**Sized deliberately.** Hubs only, not the 1,919 spec pages. 356 links spread
over 105 targets is proportionate; putting it on every spec page would have been
roughly 1,900 links into a utility cluster and would pull equity off the
commercial pages. Measure this first.

**Gated.** `getVerifyPage()` returns null for the 19 universities Supabase has no
record for, and those hubs render nothing. Never fall back to `/verify/{u.id}`,
which 404s for roughly half the catalogue because the verify route keys off
Supabase slugs rather than `lib/data.ts` ids.

**Verified.** 45 hubs sampled: 27 carry a link, 16 correctly omit it, and every
emitted verify URL returns 200. Two 500s in the sample were the known dev-server
concurrency flake and return 200 on serial retry.

---

## 2026-09-13 · 11 new coupon pages

**What.** `COUPON_PAGES` 12 to 23, `COUPONS` 26 to 32. New pages for Shoolini,
DSU, UPES, Parul, Bharati Vidyapeeth, DY Patil Navi Mumbai, Kurukshetra, Manav
Rachna, Mangalayatan, VGU and GLA.

**Why.** Rishi asked for them. The coupon cluster is the site's best-converting
inventory: it grew 44 clicks to 46 in the last GSC window while the index page
fell, and the Manipal Jaipur page moved position 7.2 to 4.9.

**How the fabrication risk was removed.** The blocker raised earlier was
`CouponPageData.discounts[]`, which on existing pages lists real university
schemes such as a 15% upfront discount and a 20% defence waiver. Those cannot be
verified from inside the repo. Checking the template resolved it: **`discounts[]`
is never rendered**, and neither are `totalFee`, `finalFee`, `stackExample`,
`emiCompatible` or `couponDiscount`. So the new entries carry only the edifyedu
coupon in `discounts[]`, assert no university scheme anywhere, and each page
tells the reader to confirm scholarships on the official portal. The existing
disclosure block already separates the two.

Every factual field reads from `lib/data.ts`: name, NAAC, NIRF and the MBA fee
string already published on that university's hub. No figure was hand-written.
NIRF labels always state their category, and the 999 unranked sentinel renders
as "Not ranked in NIRF 2025" rather than as a rank.

All 11 official domains were checked to resolve before being written into
`officialUrl` and the Course schema's `sameAs`.

**Two defects fixed on the way.**
- `BVP2026-5K` pointed at `bharati-vidyapeeth-online`, a universityId that does
  not exist in `lib/data.ts`, so the coupon never matched its university.
  Corrected to `bharati-vidyapeeth-university-online`.
- `blogSlug` was required and rendered as an unconditional `<Link>`. Five of the
  eleven universities have no review blog, so the field is now optional and the
  card renders only when a slug exists. No `/blog/undefined` is emitted.

**Still open.** `AMR2026-5K` points at `amrita-university-online`, which also
does not exist; the live Amrita page uses `amrita-vishwa-vidyapeetham-online`.
Left alone because it may be a deliberate duplicate rather than a typo.

**Verified.** All 11 pages return 200 with Offer, FAQPage, HowTo and Course
schema, no "Online Online", no orphan universityId, no duplicate slug, every
`blogSlug` resolving to a real post. All 24 coupon URLs appear in the sitemap.

---

## 2026-09-13 · coupon pages: "Online Online" on all 12, in copy and in schema

**What.** Adopted the existing `formatUniversityDisplayName()` helper at the five
places the coupon template composes a university name with " Online MBA".

**Why.** Every `universityName` in `COUPON_PAGES` already ends in "Online", and
the template appended " Online MBA ...", so **all 12 pages** rendered
"Amity University Online Online MBA Discount Coupon 2026". It was in the H1, the
Offer schema `name`, the Course schema `name`, the HowTo description and the
comparison table, so it reached both the page and the rich result.

These are the best-converting pages on the site. The coupon cluster grew 44
clicks to 46 in the last GSC window while the index page fell, and the Manipal
Jaipur page went from position 7.2 to 4.9 with 10 clicks to 24. A visible
grammar defect on the commercial pages that are actually ranking is worth more
than most on-page work elsewhere.

`lib/format.ts` has carried `formatUniversityDisplayName()` for this exact
artefact since `SchemaBlock` and the blog template hit it. The coupon template
never adopted it.

**Asked for but NOT done: new coupon pages.** 13 universities hold a coupon in
`COUPONS[]` with no landing page, and 10 of those have usable fee and NAAC data.
The blocker is `CouponPageData.discounts[]`, which carries real university
scholarship schemes: "15% upfront discount", "Defence scholarship 20% fee
waiver", "Divyaang scholarship up to 100%", "Merit scholarship 5-15%". Those are
per-university facts that would have to be invented for UPES, Sharda, Galgotias,
Shoolini, DSU, Uttaranchal, VIT, KLU, Graphic Era and Parul. That is the
fabrication class this site cannot ship. The pages are worth building once
someone confirms each scholarship scheme against the university portal.

**Raised and closed.** `lib/coupon-pages.ts` opens with a comment saying premium
maps to Rs 7,500 while `lib/coupons.ts` sets all three tiers to
`{max: 5000, base: 4000}`, and two codes read `MAHE2026-7500` and
`SYMB2026-7500`. Flagged to Rishi on 2026-09-13; he confirmed it is not an issue.
**Do not raise this again or "fix" the tier comment.**

**Verified.** All 12 pages return 200 with zero "Online Online" anywhere in the
HTML, and all eight JSON-LD blocks still parse, with Offer and Course carrying
the corrected name.

---

## 2026-09-13 · built out `/fees`, the one fee asset with headroom

**What.** Added five H2 sections, a six-question FAQ with FAQPage schema, a
WebPage schema carrying dateModified, nine contextual internal links, and
replaced the hardcoded hero figures with values derived from the dataset.

**Why.** The corrected GSC diagnosis found the fee-query opportunity is far
smaller than first claimed and mostly campus intent, and that the
blog-versus-hub title theory is contradicted by our own data. `/fees` was the
one fee-side asset left with real headroom: indexable, well titled, backed by a
143-row dataset, and sitting at **position 21 on 453 impressions**.

It was also structurally thin in a way that explains position 21. A 517KB page
carrying **one H1 and zero H2s**, a client-rendered table, and a footnote. There
was nothing on it for a fee query to match except the table itself.

**Fee figures: derived, then reverted the same day. I was wrong.** I replaced the
hero literals with values computed from `feesData`, which made the page claim a
lowest fee of ₹9,600. Rishi corrected it: IGNOU's fee is ₹60K and that is the
lowest. He is right. IGNOU's row is `₹9,600 – ₹66,000`, a 6.9x span across seven
programmes, so ₹9,600 is the floor of a range, not a total fee anyone pays.

**63 of the 125 priced rows exceed the `SUSPICIOUS_RANGE_RATIO` of 3.0** that
`lib/fees.ts` already applies to reject exactly this shape. The dataset cannot
support a "lowest fee" claim at all. That is the parked placeholder-fee cluster,
and it needs portal research, not a cleverer reduce.

Reverted: both chips are literals again, the derived "eight lowest fees" table
was removed, and the FAQ that named a lowest figure was replaced with a process
answer. The reasoning is recorded in a comment at the top of the file so the
next person does not re-derive them. Only counts are computed now: NAAC grades
and programme coverage count rows, not money.

**Also fixed.** `buildSchemas()` had always constructed a `webpage` object and
then never rendered it, so the page shipped without WebPage schema entirely.

**Constraint honoured, after the correction above.** The only fee figures on the
page are the two original literals. No new fee claim was introduced anywhere,
including in the six FAQ answers.

**Verified.** All JSON-LD blocks parse; FAQPage carries 6 questions, WebPage
carries `dateModified`, canonical is self-referencing and correct, page is
`index, follow`. Four H2s render, and the page carries no ₹9,600 claim. All nine internal link targets confirmed
live and indexable on production first. House style checked: no em dashes, no
filler words from the banned list.

**Detail.** `audits/gsc-diagnosis-2026-09-13.md`

---

## 2026-09-13 · `/programs/mba/specializations/*` consolidation

**What.** 301'd the whole deprecated route to `/programs/mba/{spec}`, repointed
17 internal links, marked the route file superseded. No figure or ranking changed.

**Why.** Two GSC exports (28d to 08-26 vs 28d to 09-10) showed the real site
down **11.8% on clicks and 16.1% on impressions** once the calculator cluster is
filtered out, against an unfiltered reading of +5.8%. Inside that, `/programs/*`
carried **13,533 impressions for 25 clicks**, every page noindex with a
self-referencing canonical, sitting at positions 40-75.

Task 5 (2026-08-19) had already decided `/programs/mba/{spec}` was the canonical
specialisation landing and noindexed this route, but never finished the job: the
route stayed live, kept a SELF canonical, and held 17 inbound internal links from
blogs and guides. Four specialisations had both URLs live and competing:
business-analytics at 951 impr / pos 69.6 against 725 impr / pos 69.5.

The case that matters is healthcare-management. It is the only spec on
`PROGRAMS_INDEX_ALLOWLIST`, so the only one permitted to rank, and it fell from
**pos 9.0 to 24.8** while its noindexed twin collected 477 impressions. Index
permission sat on one URL and link equity on the other.

**Deliberately not done.** Rishi asked that no fee or ranking figure be touched,
so the blog-vs-hub data contradiction found in the same diagnosis (BITS Pilani
quoted at ₹2.97L / NIRF #16 Overall on the blog and ₹2.98L / NIRF #7 with no
category on the hub) is recorded and left alone. It remains open.

**Verified.** All 7 deprecated URLs 301 to a target that returns 200 with no
chain; the bare path and any unknown sub-path fall through to `/programs/mba`;
all 17 repointed links resolve directly rather than through a hop; zero
references to the dead route remain in `lib/`.

**Detail.** `audits/gsc-diagnosis-2026-09-13.md`

---

## 2026-09-13 · internal link starvation on specialisation pages

**What.** Canonicalised the specialisation links on programme hubs, added
manifest-only specs to that grid, and gave every specialisation page a
sibling-specialisation block. ~9,600 new internal links.

**Why.** A crawl of all 2,907 live pages found **1,516 of 2,875 (53%) had 0 or 1
inbound contextual link**, concentrated almost entirely in specialisation pages:
1,919 of them averaging 1.1 links, with 404 orphans and 953 on a single link.
One link is a single point of failure — reword that one source and the page goes
orphan — and it confers almost no topical signal. The site's own within-pair
test (55 university+programme pairs with both a blog and a hub) shows the
better-linked page is the better-ranking page in 51 of 55 cases.

**Three causes, two fixed in code.**
- 186 pages: the hub linked an alias that 308s (`human-resource-management` ->
  `hr-management`), so the canonical page got zero direct links. 189 such links.
- 143 pages: specs present only in `programs-manifest.json` were never listed,
  because the grid renders `pd.specs` from `data.ts`.
- 75 pages: linked only from a `noindex` hub. **Not fixed** — root cause is the
  placeholder-fee cluster and it needs real fees from official portals.

**Verified.** 60 hubs sampled, all 190 spec links return 200 directly, no
redirect hops. 40 spec pages sampled, average 5.0 sibling links each, every one
200. Rendered block checked in the accessibility tree: semantic `nav`,
descriptive anchor text, hub link in the footer of the block.

**Guard.** Links are gated on `isLinkable()` and canonicalised through
`resolveSpec`, so neither a broken nor a noindex target can be emitted.
`scripts/check-internal-hub-links.js` still covers hub links after a build.

**Measured after deploy (re-crawl of production).** Spec pages: 404 orphans → 24,
953 single-link → 144, average inbound 1.1 → 6.0. Sitewide pages with 0 or 1
inbound contextual link: **1,516 → 327, down 78%**. 1,729 pages gained links,
**0 lost any**. The 168 that remain are structural: 160 are the only
specialisation in their group, so no sibling exists to link.

**Detail.** `audits/topical-authority-2026-09-13.md`, raw graph in
`audits/internal-link-graph.md`.

---

## 2026-09-13 · `e4a2643` — specialisation names split, truncated and placeheld at import

**What.** Repaired 13 `specs` arrays in `lib/data.ts`; retired 51 URLs with
per-university 301s; added a repair step to `scripts/build-valid-urls.js`.

**Why.** A parenthesised list had been comma-split across the array. SPPU's BCA
read `['General (C', 'C++', 'Java', … 'Software Testing)']`, written as
`General (C, C++, Java, … Software Testing)`. Split, it published **nine
specialisation pages** and told readers SPPU offers a BCA specialisation in Dot
Net and in Web. It does not — those are subjects inside one General programme.
For a site whose whole positioning is "independent, no paid rankings, verified
data", publishing specialisations a university does not offer is the worst class
of error we can ship. Two related defects: four names truncated mid-string
(`"Computer Applications (4 specialisations available"`), and placeholder text
published as a specialisation, including one cell of five names that became the
slug `finance-marketing-human-resources-operations-strategy-contact-university-for-specialisation-structure`.

**Key finding.** `data/EdifyEdu_Unified_Programs_v3.xlsx` carries the *same*
corruption in two other shapes (`General – Java` rows, and comma fragments that
kept their leading space: `" Accounting"`, `" IoT"`). It is downstream of the
same splitter, **not an independent source**. Do not "restore from Excel"
assuming it is cleaner. The repair therefore lives in `build-valid-urls.js`, not
the workbook, so it survives the next refresh and reads in a diff.

**Verified.** All 51 retired URLs 301 to the surviving specialisation; all 15
destinations render 200; titles now read "SPPU BCA General". Four retired URLs
had Search Console history (`/sppu/bca/general-c`, 386 impressions) which is why
these are 301s and not 404s.

**Guard.** `scripts/check-spec-names.ts` on pre-commit — fails on unbalanced
parentheses, placeholder text, multi-name cells. Tested both directions.

**Detail.** `audits/malformed-spec-names-2026-09-13.md`

---

## 2026-09-13 · `a178bd0` — 330 spec URLs that 404 on a naming difference

**What.** 169 new entries in `lib/data/spec-slug-rescue-rules.json`, turning 330
404s into 308s.

**Why.** Reported from the field: `/universities/manipal-university-jaipur-online/mba/data-science`
404'd. Manipal names that specialisation "Analytics and Data Science" and
Chandigarh names theirs "Data Science and Artificial Intelligence", so the
generic slug a reader or a crawler guesses matched nothing. Middleware section 2f
was right to 404 a slug no university serves; what was missing was the mapping
from the guessed name to the one the university actually uses.

**Scope finding.** An audit of the whole class found 240 such URLs across ten
programmes (`mca/machine-learning` at 17 universities, `bba/supply-chain`,
`ma/mass-communication`). It also found **zero broken internal spec links** in
blogs, guides, coupon pages or page-content JSON, and all sitemap spec URLs
healthy — so this class only ever arrived from outside (GSC, typed URLs,
external links). No link-generation code needed changing.

**Deliberately not fixed.** Nine mappings narrow the meaning rather than rename
it (BCA *is* Computer Applications, so `/bca/computer-applications` must not land
on one specialisation of it). Sending a reader to a different course than the URL
asked for is worse than a 404.

**Verified.** All 330 return 308 to a page that renders 200; 0 of the sitemap
spec URLs changed status.

**Guard.** `scripts/check-spec-redirect-health.ts` on pre-commit. The existing
`check-spec-allowlist` proves the file agrees with `resolveSpec`, which a bad
rescue rule can satisfy while still creating a loop, a chain, or a redirect onto
a page section 2d 404s. All three occurred while writing this change and the new
check is what caught them.

**Detail.** `audits/spec-slug-404-audit.md`

---

## The soft-404 thread these two continue

The four fixes below are why the machinery this session used exists at all. Read
top-down; each one caused the next.

### `2e24d1d` (2026-08-29) — real 404s for soft-404 classes under /universities

**Why.** The spec and programme routes called `notFound()`, yet still served the
not-found UI inside an HTTP **200**. Cause: those routes sit under a
`loading.tsx`, so Next flushes the streaming shell with a 200 before the page
component ever runs, and `notFound()` can then only swap the UI, never the
status. Google treats a 200 that says "not found" as a soft 404 and distrusts
the whole directory. Fixed by deciding status at the **edge** in `middleware.ts`
(sections 2d/2e/2f), before Next routes the request.

### `eaca4eb` (2026-08-30) — protect ranking URLs, kill meta-refresh redirects

**Why.** `2e24d1d` was correct for junk URLs but started hard-404ing **13 URLs
that were ranking**, several on page 1, carrying 1,576 impressions between them.
They had been soft 404s, so no content was lost, but a hard 404 tells Google to
drop the URL and discard the signal it earned. Each got a 301 to its programme
hub. `scripts/check-gsc-404s.mts` made this a rule rather than a one-off: widen
an allowlist again and any ranking URL it would kill fails the commit.

### `b03fb6f` (2026-08-30) — retire 19 sitewide MBA slug wildcards

**Why.** Slug rules like "`marketing-management` means `marketing`" were
`next.config.js` wildcards firing for all 144 universities — **including the ones
whose real specialisation IS the verbose slug**. That redirected 11 live pages
away, 8 of them into a 404. Moved into `spec-slug-rescue-rules.json`, where the
allowlist builder applies each rule per university and only when that university
cannot serve the source slug and can serve the destination. This is the mechanism
`a178bd0` above extends.

### `db89288` (2026-08-31) — delist REVA University

**Why.** REVA's online-mode claims could not be verified against UGC-DEB. Rather
than keep unverifiable accreditation claims live, all 14 URLs were made real
404s. Consistent with the site's positioning: absence of proof is not proof.

---

## Site size, for reference (2026-09-13)

| | count |
|---|---|
| **Real pages** (sitemap, all 200) | **2,838** |
| Redirect aliases (308, deliberately not in sitemap) | 3,783 |
| Retired URLs (301, `next.config.js`) | 85 |
| Distinct URLs served | 6,622 |

The alias count exceeds the page count because one page can be reached by many
spellings. Only the 2,838 are indexable; 0 aliases appear in the sitemap, an
invariant `check-url-canonical-map` enforces on every commit.
