# Fix log

Running record of every fix: what changed, **why**, how it was verified, and what
guards it. Newest first. One entry per commit that changes behaviour or data.

Rule for new entries: never write only what changed. The *why* is the part that
is expensive to reconstruct later, and it is what stops the next person undoing
the fix by accident.

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

**Data defect found and fixed.** The hero chips were literals, and one was
wrong: "₹60K lowest fee" is the *sixth*-lowest figure in the dataset, which has
held IGNOU at ₹9,600 since the open-university rows landed. "₹3.70L highest" was
correct. Both now read from `feesData`, so neither can drift again. Flagged to
Rishi rather than changed silently, since the standing instruction is to leave
figures alone; this one contradicted its own source.

**Also fixed.** `buildSchemas()` had always constructed a `webpage` object and
then never rendered it, so the page shipped without WebPage schema entirely.

**Constraint honoured.** No fee, NAAC or NIRF figure was hand-written. Every
number in the new copy, including all six FAQ answers, is computed from
`data/fees-hub-data.json`, so the FAQ cannot fall out of step with the table.

**Verified.** All seven JSON-LD blocks parse; FAQPage carries 6 questions,
WebPage carries `dateModified`, canonical is self-referencing and correct, page
is `index, follow`. Five H2s render. All nine internal link targets confirmed
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
