# Content plan: profession audiences

**Date:** 28 September 2026
**Source data:** `lib/blog.ts` runtime inventory, `lib/data.ts` specialisation
index (171 MBA labels), Supabase `accreditations` table joined via
`scripts/lib/supabase-uni-map.mjs`, GSC export 28 days to 2026-09-12
(`audit-data-sep15/`).

---

## 1. The inventory, counted properly

| | value |
|---|---:|
| Entries in `BLOG_POSTS` before this batch | 209 |
| Published | 192 |
| Redirected | 14 |
| Draft | 3 |
| **After this batch** | **217 (200 published)** |

Counted by importing `BLOG_POSTS` with tsx. A line grep on `slug:` returns 199
and is wrong; see `project_blog_inventory_saturated` for the last time that
number was reported incorrectly.

The 196 figure held in memory was correct on 15 September. It missed the twelve
posts of 17 September and one redirect added since.

## 2. What was already covered

Rishi named bankers, IT professionals and business analysts. The first two were
already done in the 17 September batch:

| audience | existing posts |
|---|---|
| Bank employees | `online-mba-bank-employees-promotion-2026`, `online-mba-bfsi-india-2026`, `mba-vs-jaiib-caiib-bank-officers-2026`, `online-mba-banking-insurance-vs-finance-vs-bfsi-2026` |
| IT professionals | `online-mba-it-professionals-india-2026`, `mba-tech-lead-to-engineering-manager-india-2026`, `online-mba-information-technology-management-india-2026`, `online-mba-vs-ms-vs-executive-pgp-software-engineers-2026` |
| Government employees | `online-mba-government-employees-india-2026`, `govt-jobs-after-mba-india-2026` |
| Generic working professional | `online-mba-for-working-professionals-india`, `online-mba-for-freshers-india-2026`, `best-online-mba-for-women-india-2026`, `online-mba-after-career-break-2026` |

**Business analysts were not covered as an audience.** Two adjacent posts exist,
`mba-data-science-vs-business-analytics-2026` (label comparison) and
`online-mba-business-data-analytics-india-2026` (programme intent), but neither
is written to the person holding the job. Same gap for six other professions.

## 3. Demand check, and its limits

The freshest GSC export runs 28 days to 2026-09-12. Profession-audience queries
other than the government-jobs cluster are essentially invisible in it:

| query | impressions | clicks | position |
|---|---:|---:|---:|
| `bits pilani mba for working professionals` | 289 | **0** | 9.49 |
| `govt jobs for mba graduates` | 126 | 0 | 7.72 |
| business analyst / sales / teacher / doctor / CA audience queries | **none in the export** | 0 | n/a |

Two caveats that matter more than the table. The Queries export caps at 1,000
rows, so low-volume queries are invisible rather than absent. And the export is
16 days old, which `project_blog_inventory_saturated` records as long enough for
demand to move by an order of magnitude. This batch is a **net-new bet on
career-intent format**, not a rescue of measured demand, and must be judged that
way.

## 4. Written in this batch (8 posts, published 28 September 2026)

| slug | angle | the finding that justified it |
|---|---|---|
| `online-mba-business-analysts-india-2026` | The MBA changes who owns the decision, not how well you analyse | The title covers four unrelated jobs in India; 26 universities carry Business Analytics |
| `online-mba-sales-professionals-india-2026` | You cannot buy an MBA in sales, so buy Marketing on its elective list | Only 4 of 171 labels name sales, all paired with marketing, against 62 for Marketing |
| `online-mba-medical-representatives-pharma-2026` | The degree buys a door out of the field, not a rung inside it | 6 universities carry Pharmaceutical Management; JSS ranks 4th in NIRF **Pharmacy**, not Management |
| `online-mba-hr-executives-india-2026` | Closest thing to a licence, and the label is still worthless | HR Management is carried by 77 universities, the most of any label |
| `online-mba-civil-site-engineers-project-management-2026` | Certification for planning, degree for commercial | 7 Project Management labels, none with a NIRF Management placement |
| `online-mba-nurses-healthcare-professionals-india-2026` | Eligibility first: a BSc Nursing is a bachelor's degree | 9 inconsistent hospital-management label variants; DPU-COL and JSS rank in clinical categories only |
| `online-mba-chartered-accountants-india-2026` | Buy it for the subjects you are least interested in | Finance is 74 universities and all revision for a CA; ACCA-mapped labels are the only non-redundant ones |
| `online-mba-product-managers-india-2026` | Argues against itself: a weak instrument for entering product | Exactly 1 label is Product Management, and its NAAC cycle has lapsed |

## 5. Considered and rejected

- **Teachers and school educators.** No education-management label exists in the
  specialisation index, so there was nothing honest to offer. Revisit only if a
  university adds one.
- **Defence and ex-servicemen.** Real audience, but the resettlement question is
  governed by policy documents we hold no source for, and the post would have
  been generic.
- **Insurance agents.** Only one Insurance Management label exists (Amity). Too
  thin to carry a post of its own; covered inside the BFSI post from September.

## 6. Constraints applied to every post

1. **Zero rupee figures.** `scripts/check-blog-fees.mjs` rejects any currency
   figure in a new slug, and there is no approved source for Indian salary data.
   Gate reports 2433 unverified, unchanged from baseline.
2. **Accreditation claims cross-checked against Supabase** via
   `scripts/lib/supabase-uni-map.mjs`. Chandigarh University's NAAC A+ cycle
   expired 2026-09-09, so the three posts naming it say the cycle has lapsed.
   BITS Pilani WILP, SGT, SRM Sikkim and D.Y. Patil Navi Mumbai have no verified
   record and the tables say so rather than omitting the column.
3. **NIRF ranks always with their category.** Eleven Management ranks verified
   and used; everything else states "no NIRF Management placement on record".
4. **No outbound link outside the four approved sources.**
5. **8 internal links per post, no duplicate target**, every target resolved
   against `BLOG_POSTS`, `UNIVERSITIES` and `GUIDES` before commit.

## 7. The measurement problem, stated plainly

The 17 September plan gates its backlog on a GSC read around 15 October:
if the banking and AI clusters show nothing after four weeks, abandon rather
than expand. That gate has not been reached, and
`online-mba-product-managers-india-2026` is backlog item 3 from that list.

Rishi asked for this batch directly, which settles whether it ships. It does not
settle the measurement question. Eight more posts landing 11 days after the
first twelve makes the October signal harder to read.

**Mitigation:** these eight target professions that do not overlap the banking,
tech or AI clusters, so they can be pulled as a separate cohort. When reading
GSC in late October, segment three ways:

- 17 September cohort (12 posts, banking / IT / AI)
- 28 September cohort (8 posts, other professions)
- everything else

If both cohorts are unseen after four weeks, the conclusion is about the format
and the audience, not about any individual post, and the profession-audience
strategy should stop rather than continue.

## 8. Backlog, still gated

The eight-item backlog in `content-plan-banking-tech-ai-2026-09-17.md` remains
gated on the October read. Item 3 (`online-mba-product-manager`) is now written,
so seven remain. Do not work through them before the read.

## 9. Open for Rishi

- **The quick-facts wiring.** `app/blog/[slug]/page.tsx` renders
  `BLOG_QUICK_FACTS[slug]` from `lib/blog-quick-facts.ts`, not the `quickFacts`
  field on the post object. The eight new posts were added to that file. **The
  twelve posts from 17 September still carry dead `quickFacts` data and show no
  sidebar facts.** Either wire those twelve, or change the template to fall back
  to `post.quickFacts`, which would light up all twenty at once.
- **Hero images.** These eight ship without one, as did the twelve before them.
  `scripts/add-pexels-images-to-blogs.js` is the existing tool.
- **`iibf.org.in` as an approved source** is still unanswered from the September
  plan. The same question now applies to professional bodies named in the CA and
  project management posts, which cannot be linked under the current list.
