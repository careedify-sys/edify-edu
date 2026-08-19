# Galgotias MBA fees — cannibalisation & fee-drift diagnostic

**Date:** 2026-08-19
**Scope:** Query `galgotias university mba fees` (8,411 impr · 5 clicks · 0.06% CTR · pos 9.12).
**Bench:** site-average CTR at position 9–11 is 0.38%. Galgotias MBA runs at ~⅙ that.
**Method:** read-only — no code, data, or content changed. All facts sourced from live tree (`lib/data.ts`, `lib/fees.ts`, `lib/mba-seo-overrides.ts`, `app/universities/[id]/mba/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/blog.ts`, `lib/data/page-content/galgotias-university-online-mba.json`).

Two candidate URLs, both `robots: index, follow`, both self-canonical:

| URL | File |
|---|---|
| `/universities/galgotias-university-online/mba` | [app/universities/[id]/mba/page.tsx](app/universities/%5Bid%5D/mba/page.tsx) |
| `/blog/galgotias-online-mba-review` | [lib/blog.ts:24518](lib/blog.ts:24518) → [app/blog/[slug]/page.tsx](app/blog/%5Bslug%5D/page.tsx) |

---

## 1. Which URL actually ranks

Both pages are alive, both are `index,follow`, and each carries its own self-canonical with **no cross-canonical between them**:

- Hub canonical: `https://edifyedu.in/universities/galgotias-university-online/mba` — set in `app/universities/[id]/mba/page.tsx:58` and again at `:107` in the generic branch.
- Blog canonical: `https://edifyedu.in/blog/galgotias-online-mba-review` — set in `app/blog/[slug]/page.tsx:126`.

That is the textbook cannibalisation setup. Two indexable URLs on the same topic, neither pointing at the other. Google is forced to pick, and for `... mba fees` it is picking (and mis-ranking) whichever page it currently prefers rather than the one we would engineer to win.

The blog is almost certainly the URL taking the hit at position 9.12. Signals:

- Blog total volume is ~4× the fee-query volume (35,762 impr vs 8,411), so the blog is already an established impression pool across a bunch of Galgotias queries — the fee query is a subset.
- Blog `targetKeyword` in the CMS record is **exactly** `galgotias university mba fees` (`lib/blog.ts:24527`) and tags include the same phrase (`:24524`). The hub carries the phrase inside a keywords bag (`app/.../mba/page.tsx:94`) but the blog is more directly optimised for it.
- Blog `seoTitle` compresses the fee to **"Rs 76K"** (`lib/blog.ts:24521`), while the hub title contains the explicit **"From ₹76,200"** number. A page whose title contains the exact fee number normally wins CTR at parity; the fact that the ranking page is losing 6× CTR to the site benchmark is the tell — the winner is the blog, whose title leads with "Review" and buries the fee. The `From ₹76,200` money-page is not the one Google is showing at pos 9.

Bottom line for §1: **rendered strings prove the two pages are competing for the same slot; the blog is the more likely current occupant, and it is the wrong choice for a `... fees` query.**

---

## 2. Rendered title and meta description, and whether a fee number survived Sprint 1

### Hub — `/universities/galgotias-university-online/mba`

`generateMetadata()` in `app/universities/[id]/mba/page.tsx:29-131` runs `getDisplayFee(u, 'MBA')` at `:44`, gets `ok: true` (Rule 2 fires, see §3), so keeps the `MBA_SEO_OVERRIDES['galgotias-university-online']` block at `:46-69`. The override strings are inserted **verbatim, un-clamped**. Rendered:

- **`<title>`**
  ```
  Galgotias Online MBA Fees 2026: From ₹76,200 | edifyedu.in
  ```
  (58 chars — fits SERP cap. Fee number present.)

- **`<meta name="description">`**
  ```
  Galgotias University online MBA fees from ₹76,200 (₹3,175/mo EMI). NAAC A+, UGC-DEB approved. Zero-commission, verified fee data. Compare vs Sharda, LPU, Chandigarh before you enrol.
  ```
  (183 chars. Note: the override bypasses `clampDescription()`, so this ships longer than the 175-char hard ceiling — Google will truncate the tail past ~155–160 chars on desktop, so the "Compare vs Sharda, LPU, Chandigarh before you enrol." tail is not what searchers see. Snippet fee number `₹76,200` is safe inside the visible zone.)

Fee number **DID** survive Sprint 1 on the hub. `getDisplayFee` did not suppress; the counsellor-CTA fallback did not fire.

### Blog — `/blog/galgotias-online-mba-review`

Fields from `lib/blog.ts:24521-24522`, rendered by `app/blog/[slug]/page.tsx:96-98` (`title: { absolute: post.seoTitle || post.title }`, `description: post.metaDescription`, no clamping). Rendered:

- **`<title>`**
  ```
  Galgotias Online MBA Review 2026: Cheapest NAAC A+ at Rs 76K
  ```
  (60 chars. Fee is "Rs 76K" — no rupee glyph, no full number.)

- **`<meta name="description">`**
  ```
  Galgotias Online MBA total fee ₹76,200 but the exam fee and one cost most sites skip changes the maths. Full breakdown, honest verdict, zero commission.
  ```
  (151 chars. Fee number present.)

The **blog title** carries `Rs 76K` — a fee token, but not the explicit `₹76,200` number that matches the query intent literally. That plus the "Review" framing is the single biggest CTR leak: for `[uni] mba fees` searchers, "Review" reads like editorial, not the answer page.

---

## 3. Which `getDisplayFee` rule fires for Galgotias MBA, and why

Inputs from `lib/data.ts:1244-1274`:

| Field | Value | Source |
|---|---|---|
| `programFees.mba` | **undefined** (only `bba`, `bca`, `mca` set) | `lib/data.ts:1246` |
| `feeMin` | `76200` | `lib/data.ts:1261` |
| `feeMax` | `86400` | `lib/data.ts:1262` |
| `programDetails.MBA.fees` | `"₹76.2K"` (single value) | `lib/data.ts:1274` |

Trace through `getDisplayFee(u, 'MBA')` in `lib/fees.ts:135-233`:

1. `parseFeeStr('₹76.2K')` → `{ min: 76200, max: 76200 }` (single).
2. Rule 4a width check: `max/min = 1.0`, not > 3× → skip.
3. `getReference()`: no `programFees.mba`; program is MBA; not the 60000/200000 placeholder → returns `{ min: 76200, max: 86400, label: 'feeMin/feeMax 76200-86400' }`.
4. `minDiffPct = |76200-76200|/76200 = 0`; `maxDiffPct = |76200-86400|/86400 = 11.8%`.
5. **Rule 1** (both within 10%): `maxDiffPct = 11.8%` > 10% → **fails**.
6. **Rule 2** (pd.fees single, ref is a range, single within 25% of ref lower): `parsed.min === parsed.max` ✓, `ref.min !== ref.max` ✓, `singleDiffPct = 0` ≤ 25% ✓ → **fires**.

Result: `{ ok: true, mode: 'from', rule: 2, compact: 'From ₹76K', range: 'from ₹76,200', min: 76200, max: 76200 }`.

Because `fee.ok === true`, the override at `app/universities/[id]/mba/page.tsx:44-46` is **kept** (hard-coded string `From ₹76,200` from `lib/mba-seo-overrides.ts:47-52`). If Rule 2 had failed, the override would have been dropped and the fee-led generic title path at `:82-91` would still have run because `fee.ok` gates both — so the counsellor-CTA fallback would only fire on suppression. It did not fire.

`shouldIndexProgrammeHub(u, 'MBA')` at `lib/seo/should-index.ts:32-43` → `hasContentJson: true` (JSON at `lib/data/page-content/galgotias-university-online-mba.json` exists) AND `feeOk: true` → **indexable**.

### Fee-truth reconciliation (all three, current state as of 2026-08-19)

| Source | Rendered value | State |
|---|---|---|
| **Real fee (per task brief)** | Rs 80,200 | truth |
| **`lib/data.ts:1261-1274`** | `feeMin=76200`, `feeMax=86400`, `pd.fees="₹76.2K"` → renders as `From ₹76,200` / Offer.price=76,200 | **wrong** (short by Rs 4,000) |
| **`lib/blog.ts:24518-24583` (Galgotias review blog)** | `Rs. 76,200` throughout: hero card, breakdown table `Total Program Cost Rs. 76,200`, FAQ answer, cross-links | **wrong** (short by Rs 4,000) |

The `Rs 88,500` figure the task brief mentions is not present anywhere in `lib/blog.ts` in the Galgotias review — `grep -n "88,500"` only matches unrelated **NIU** (Noida International University) MBA rows at `lib/blog.ts:880, 23482, 25114, 25217, 25218`. The Galgotias review blog appears to have been previously corrected down to 76,200 (matching `lib/data.ts`) but never brought up to the real 80,200. So **both `lib/data.ts` and the blog currently agree on the WRONG number — 76,200 — and neither reflects the real 80,200.** They drift together, which is worse than drifting apart, because there is no internal inconsistency signal to catch it.

---

## 4. Structured data emitted by each page

### Hub — `EducationalOccupationalProgram` + `BreadcrumbList`

From `app/universities/[id]/mba/page.tsx:133-189`. Fee bits routed through `lib/seo/program-schema.ts` (single canonical source, no bypass to raw `u.feeMin/u.feeMax`).

`getProgramSchemaOffer(u, 'MBA')` returns `min === max === 76200` → single-price Offer (not AggregateOffer).

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "name": "Galgotias University Online Online MBA",
  "description": "UGC-DEB approved Online MBA from Galgotias University Online. NAAC A+ accredited. 7+ specialisations, fees From ₹76K.",
  "url": "https://edifyedu.in/universities/galgotias-university-online/mba",
  "provider": {
    "@type": "CollegeOrUniversity",
    "name": "Galgotias University Online",
    "sameAs": "https://edifyedu.in/universities/galgotias-university-online"
  },
  "educationalProgramMode": "Online",
  "timeToComplete": "P2Y",
  "offers": {
    "@type": "Offer",
    "price": "76200",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  }
}
```
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://edifyedu.in" },
    { "@type": "ListItem", "position": 2, "name": "Universities", "item": "https://edifyedu.in/universities" },
    { "@type": "ListItem", "position": 3, "name": "Galgotias University Online", "item": "https://edifyedu.in/universities/galgotias-university-online" },
    { "@type": "ListItem", "position": 4, "name": "Online MBA", "item": "https://edifyedu.in/universities/galgotias-university-online/mba" }
  ]
}
```

Note also the description-string double-word bug: `provider.name` is `Galgotias University Online` and the template hard-codes `Online MBA`, so the schema `name` reads **"Galgotias University Online Online MBA"** and the `description` fragment reads "from Galgotias University Online." That is not what is causing the CTR problem but it is visible in every schema payload the hub ships.

### Blog — `Article` + `WebPage` + `BreadcrumbList` + `FAQPage`

From `app/blog/[slug]/page.tsx:181-267`. Four blocks emitted. **No `Offer` / price schema at all.** The `about.@type` is `Course`, not `EducationalOccupationalProgram`.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Galgotias University Online MBA Fees 2026: ₹76,200 Review and Honest Rating",
  "description": "Galgotias Online MBA total fee ₹76,200 but the exam fee and one cost most sites skip changes the maths. Full breakdown, honest verdict, zero commission.",
  "datePublished": "2026-04-12",
  "dateModified": "2026-04-12",
  "image": { "@type": "ImageObject", "url": "https://images.pexels.com/photos/16562728/pexels-photo-16562728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "width": 1200, "height": 630 },
  "author": {
    "@type": "Person",
    "name": "Rishi Kumar",
    "url": "https://edifyedu.in/about#team",
    "jobTitle": "Founder & Lead Researcher",
    "description": "Education researcher and data analyst focused on India's online higher education sector. 7+ years advising students on degree choices."
  },
  "publisher": {
    "@type": "Organization",
    "name": "edifyedu.in",
    "url": "https://edifyedu.in",
    "logo": { "@type": "ImageObject", "url": "https://edifyedu.in/logos/edify_logo_192.png", "width": 192, "height": 192 }
  },
  "keywords": "galgotias university mba fees, Galgotias University Online MBA, Galgotias University Distance Education, Galgotias MBA Fees 2026, cheapest online mba india, galgotias online mba fees, online mba greater noida",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://edifyedu.in/blog/galgotias-online-mba-review" },
  "about": {
    "@type": "Course",
    "name": "Galgotias University Online Online MBA",
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": "Galgotias University Online",
      "sameAs": "https://edifyedu.in/universities/galgotias-university-online"
    }
  },
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".blog-body h2", ".blog-body p:first-of-type"] }
}
```
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "url": "https://edifyedu.in/blog/galgotias-online-mba-review",
  "name": "Galgotias University Online MBA Fees 2026: ₹76,200 Review and Honest Rating",
  "description": "Galgotias Online MBA total fee ₹76,200 but the exam fee and one cost most sites skip changes the maths. Full breakdown, honest verdict, zero commission.",
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".blog-body h2"] }
}
```
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://edifyedu.in" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://edifyedu.in/blog" },
    { "@type": "ListItem", "position": 3, "name": "Galgotias University Online MBA Fees 2026: ₹76,200 Review and Honest Rating", "item": "https://edifyedu.in/blog/galgotias-online-mba-review" }
  ]
}
```
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is the total fee for Galgotias Online MBA?", "acceptedAnswer": { "@type": "Answer", "text": "The total fee is Rs. 76,200, broken down as: course fee Rs. 66,000 (Rs. 16,500 per semester x4), exam fee Rs. 8,000 (Rs. 4,000/year), registration fee Rs. 1,200, and alumni fee Rs. 1,000. Verify current fees at galgotiasonline.edu.in." } },
    { "@type": "Question", "name": "Is Galgotias Online MBA UGC approved?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Galgotias University holds NAAC A+ accreditation, UGC-DEB approval for online programs, and is AICTE approved. The university is in NIRF Band 101-125 (Management, 2025). Verify at nirfindia.org." } },
    { "@type": "Question", "name": "What specializations does Galgotias Online MBA offer?", "acceptedAnswer": { "@type": "Answer", "text": "7 specializations: Finance Management, HR Management, Marketing Management, Operations Management, Business Analytics, Healthcare Management, and International Business Management." } },
    { "@type": "Question", "name": "Is Galgotias Online MBA the cheapest accredited option?", "acceptedAnswer": { "@type": "Answer", "text": "At Rs. 76,200 total, Galgotias is the cheapest NAAC A+ online MBA in India. The only cheaper options typically lack NAAC accreditation or UGC-DEB approval." } },
    { "@type": "Question", "name": "Who should apply for Galgotias Online MBA?", "acceptedAnswer": { "@type": "Answer", "text": "Best suited for working professionals in NCR, UP, and North India who need the formal MBA credential without spending Rs. 2+ lakhs. Particularly good for the Business Analytics track which covers Python, AI for Business, and data tools.” } }
  ]
}
```

Structured-data asymmetry that matters:

- The blog wins the **FAQ**-rich-result surface (Google eligibility for `People Also Ask`-style enrichment). Q1 literally answers "What is the total fee for Galgotias Online MBA?" — a near-exact match for the query.
- The hub wins the **Offer/price** rich signal (money-page schema).
- Both carry a `provider` pointing at the same `/universities/galgotias-university-online` entity, i.e. Google is being told two different pages are "about the same offering." That is the schema-level equivalent of the cannibalisation we see in the metadata.

---

## 5. Do they compete, and which one to keep

Yes. They compete for `galgotias university mba fees` and every close variant (`galgotias online mba fees`, `galgotias mba fee structure`, `galgotias distance mba fees`). Both are `index,follow`, both self-canonical, both carry the fee number in body copy, both hit the university's `provider` entity in schema. The blog holds the FAQ answering the exact query verbatim; the hub holds the Offer schema and the transactional lead form. Google is picking between them and, at pos 9.12 with 0.06% CTR, is picking wrong from a business-outcome perspective.

**Keep the hub.** Reasoning, not recommendation:

1. **Money-page fit.** A `... fees` query is transactional, not informational. The searcher wants a price and a way to enrol. The hub is the page with the lead form, the EMI block, the fee breakdown component (`FeeBreakdown.tsx`), and the `Offer` schema. Redirecting the ranking here converts; redirecting it to the blog does not.
2. **Fee-integrity chain.** The hub reads fees through `getDisplayFee()` from `lib/data.ts`. When we fix the `76200 → 80200` drift in `lib/data.ts:1261, 1274`, the hub self-heals — title, on-page fee block, and `Offer.price` all update in one commit. The blog carries the fee as **17 hand-typed instances** across the review body (hero card, breakdown table, FAQ answer, cross-linked tables) that would drift again the next time the fee changes. This is exactly the failure mode we just observed: the blog and `lib/data.ts` agree on 76,200 and both are stale. `feedback_cms_sync_guard.md` calls this out explicitly — the blog should not be the source of a fee number the hub already owns.
3. **Schema fit.** `EducationalOccupationalProgram` + `Offer` is what Google reads to power "programs & fees"-style knowledge cards. The blog emits `Article` + `FAQPage` + a `Course` sub-entity but no price schema. Investing in the blog moves the wrong meter.
4. **URL semantics.** `/universities/{u}/mba` is the permanent, canonical destination for "Galgotias online MBA" as an entity. Blog slugs are dated review artefacts. When the 2027 fee season lands and someone writes `galgotias-online-mba-2027-review`, the old blog goes stale by design; the hub does not.

The blog is not worthless — it does 35,762 total impressions across a broader keyword set (`cheapest NAAC A+`, `Rs 76K`, `NCR budget MBA`, `Business Analytics track`) that the hub does not target. The competition is only on the fee-shaped subset. A future fix (out of scope for this diagnostic) would either canonicalise the blog to the hub for the fee sub-query or re-scope the blog's title/H1/meta off the fee axis and onto the "cheapest NAAC A+ MBA" axis. Both routes end at "hub owns fees, blog owns the editorial angle." Not covered further per the read-only brief.

---

## Appendix — CTR-leak summary (for the follow-up sprint, not this diagnostic)

Ordered by likely CTR impact once the ranking URL is picked and fixed. Not applied. Not implemented.

1. Wrong number. Real fee is Rs 80,200; the site publishes Rs 76,200 in both `lib/data.ts` and the blog. Whichever page ranks, its `From ₹76,200` snippet will still be off by ~5% against what the SERP competition (which will be quoting the real number) says. Fee-inaccurate snippets get skipped even when they rank.
2. Cannibalisation itself — the two URLs split the click stream and cross-poison relevance signals.
3. Blog title framing (`Review 2026: Cheapest NAAC A+ at Rs 76K`) reads as editorial for a transactional query.
4. Description overrun on the hub (183 chars vs 175 hard ceiling in `clampDescription`) — bypassed because the override is inserted un-clamped. Visible tail ("Compare vs Sharda, LPU, Chandigarh before you enrol.") is cut in-SERP.
5. Schema double-word: `Galgotias University Online Online MBA` in both `EducationalOccupationalProgram.name` and the `Course.name` inside the blog `Article.about`.

End of report. No changes made.
