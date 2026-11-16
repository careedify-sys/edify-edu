# SEO + AEO + GEO Audit, Phase 1 (read-only)

**Date:** 16 Nov 2026 · **Brief:** EdifyEdu_SEO_AEO_GEO_Audit_Brief_for_Claude_Code.pdf · **Branch inspected:** `feat/batch-3-4` (code) and production `https://edifyedu.in` (live)
**Mode:** read-only. No project file changed except this report. Nothing deployed, committed or pushed.

---

## 1. Executive summary

The technical foundation is in good shape. On a stratified live sample of 361 of 2,301 sitemap URLs, every URL returned 200, carried a self-referencing canonical, had exactly one H1, emitted `index, follow`, and parsed as valid JSON-LD. No duplicate titles or descriptions appeared in the sample. Search and AI crawlers all get 200.

The risk sits in **what the pages say**, not whether they can be crawled.

**Five most important risks**

| # | Risk | Severity |
|---|---|---|
| 1 | Every university profile (143 indexed URLs) publishes a JSON-LD `Review` **authored by NAAC** with a rating Edify computed. On 19 profiles with no NAAC grade, it says rating `3.0` and "accredited by NAAC with Grade ." | **Critical** |
| 2 | The same schema gives each university **Edify's own phone number** and Edify's URL as the university's `url`. | **High** |
| 3 | 945 of 1,215 indexed spec pages (78%) render the generic fallback template. Different universities' fallback pages share 49-78% of their text. All 740 non-MBA spec pages are fallback. | **High** |
| 4 | Provenance is not stored per fact. `feeVerifiedOn` exists on 26 of ~150 records and is **never rendered**. No source URL, DEB session or verifier field exists in `lib/data.ts`. | **High** |
| 5 | GEO is unmeasured. `llms.txt` claims "All data is independently verified", which the data layer cannot back (risk 4). No repeatable AI prompt panel exists. | **Medium** |

---

## 2. Architecture map (confirmed from repo)

- **Framework:** Next.js `14.2.35`, App Router, TypeScript, Tailwind. Hosted on Vercel behind Cloudflare (`server: cloudflare`, `x-vercel-cache`, `cf-cache-status`).
- **Data:** the brief assumes a Google Sheets-backed CMS. **Not true for production content.** Data lives in `lib/data.ts` (UNIVERSITIES array), `lib/data/page-content/*.json` (431 rich spec files), `lib/blog.ts` (file-system posts), with Supabase as the accreditation source of truth. The CMS routes (`app/admin/`, `app/api/cms/`, `app/blog/write/`) are out of use per `CLAUDE.md`.
- **Rendering:** static generation for university, hub, spec, blog, compare and verify routes. HTML cached up to 4h at Cloudflare (`Cache-Control: public, max-age=14400`).
- **Robots:** `app/robots.ts`. **Sitemap:** `app/sitemap.ts`, single file, 2,301 URLs, filtered against noindex gates (`shouldIndexProgrammeHub`, `shouldIndexUniversity`, `PROGRAMS_INDEX_ALLOWLIST`, mode-unverified set).
- **Redirects:** `next.config.js` (static rules + `lib/data/redirects.json`) and `middleware.ts` (616 lines: old-slug map, programme and spec allowlists, admin guard).
- **Metadata:** per-route `generateMetadata()`, title/description builders in `lib/seo-title.ts`.

**Sitemap inventory by template (live, 16 Nov)**

| Template | URL pattern | Count |
|---|---|---|
| Spec page | `/universities/{u}/{p}/{s}` | 1,215 |
| Programme hub | `/universities/{u}/{p}` | 416 |
| Blog post | `/blog/{slug}` | 266 (+ index) |
| University profile | `/universities/{u}` | 143 |
| Verify | `/verify/{slug}` | 124 (+ index) |
| Compare pair | `/compare/{pair}` | 41 (+ index) |
| Tools | `/tools/*` | 30 |
| Coupons | `/coupons/*` | 25 |
| Programme category | `/programs/*` | 13 |
| DBA, guides, static | various | 28 |
| **Total** | | **2,301** |

---

## 3. Technical SEO findings

Method: `crawl.mjs` fetched up to 45 URLs per template (361 total) at 4 concurrent requests with a 150 ms delay, `redirect: manual`, and parsed status, `x-robots-tag`, robots meta, canonical, H1, JSON-LD and body text.

| Check | Result (n=361) |
|---|---|
| HTTP 200 | 361 / 361 |
| noindex on a sitemap URL | 0 |
| Canonical not self-referencing | 0 |
| H1 count not equal to 1 | 0 |
| Meta-refresh (route `redirect()` soft-404) | 0 |
| JSON-LD parse errors | 0 |
| Duplicate titles / descriptions in sample | 0 / 0 |
| `<img>` without `alt` | 0 |

| ID | Sev | Finding | Evidence | Fix | Effort |
|---|---|---|---|---|---|
| T1 | Low | `/admin-login` returns 200 with `index, follow`. | `curl -A Googlebot https://edifyedu.in/admin-login` | Add `robots: { index: false }` to its metadata. | XS |
| T2 | Low | Googlebot's robots group omits `/blog/write`, `/dashboard/`, `/university-data/`. Googlebot obeys only its own group, so those disallows do not apply to it. The routes redirect to login or 308 today, so impact is nil. | `app/robots.ts:13-15` | Use one `BLOCKED` list for every group. | XS |
| T3 | Low | 404 pages emit two robots metas (`noindex` and `index, follow`) and a canonical to the homepage. The status is a real 404, so Google ignores both. | `/blog/does-not-exist-xyz` | Drop the inherited robots/canonical in `app/not-found.tsx`. | XS |
| T4 | Low | `lastmod` is on 694 of 2,301 URLs (30%). This is deliberate (`app/sitemap.ts:60-72`: no lastmod beats a wrong one). | sitemap.xml | Keep. Extend `data/sitemap-lastmod.json` to blog/verify/compare only from real edit dates. | S |
| T5 | Low | CSP `connect-src` still allows `api.anthropic.com`, `api.github.com`, `api.web3forms.com`. Every lead now goes through `/api/enquiry` (`lib/submitEnquiry.ts:17`). These are leftovers of the retired CMS and an old form provider. | live response header; `next.config.js:845` | Remove the unused origins. | XS |
| T6 | Info | Security headers present: HSTS preload, `nosniff`, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy. Trailing slash 308s to the slashless URL. Uppercase slug 404s. `/compare?a=&b=` canonicalises to `/compare` and is robots-blocked. | probes above | None. | |

**Not measured:** Core Web Vitals field data (no CrUX/PSI access in this session), full-site crawl, mobile rendering screenshots.

---

## 4. Content quality, duplication and data integrity

### C1. Fallback spec pages are near-duplicates (High)

- **Evidence:** a spec URL gets the rich layout only if `lib/data/page-content/{u}-{p}-{s}.json` exists. Of 1,215 sitemap spec URLs, 270 have a file (all MBA). 945 do not: 205 MBA and every BBA (156), MCA (181), BCA (106), MA (81), B.Com (67), BA (65), M.Com (59), MSc (22), BSc (3).
- **Measured similarity** (5-word shingle Jaccard on body text, `sim.mjs`):
  - six BBA fallback pages from six universities: **0.49 to 0.78** pairwise
  - two MBA fallback pages (Adichunchanagiri, GLA): **0.58**
  - a rich-JSON page (Chandigarh MBA DS+AI) against any of them: **0.14 to 0.15**, which bounds the shared site chrome
- **Impact:** matches the brief's "only names swapped" risk and Google's scaled-content policy. It also matches the September spam-update exposure already logged.
- **Fix options (decision for Rishi):** (a) noindex fallback spec pages until a JSON exists, as hubs already do via `shouldIndexProgrammeHub`; (b) keep indexed and write JSONs for the highest-impression ones first; (c) consolidate fallback specs into the programme hub. Choose with GSC Pages.csv impressions per URL, not by template.
- **Acceptance:** no indexable spec URL shares more than 0.40 Jaccard with a spec page from another university.

### C2. Provenance is not modelled (High)

- `lib/data.ts` has no `sourceUrl`, `debSession`, `verifiedBy` or per-field `asOf`. `feeVerifiedOn` exists on 26 records and nothing outside `lib/data.ts` reads it.
- Pages do show dates: an "as of / last updated" string appeared on 45/45 sampled hubs, spec pages, blogs and verify pages, but on **0/45 university profiles**. Those dates are template or build dates, not the date a fee or DEB status was checked.
- A DEB link (`deb.ugc.ac.in`) appeared on 45/45 hubs and 45/45 profiles but only 2/45 spec pages.
- **Fix:** add `{ value, sourceUrl, checkedOn, session }` for fee, DEB entitlement, NAAC and NIRF. Render "Fee checked on {date} at {portal}" beside each fee and "UGC-DEB entitlement, session {X}" beside each approval. Make the existing pre-commit fee gate also fail on a missing `checkedOn`.

### C3. Brand claims ahead of evidence (Medium)

- `public/llms.txt`: "All data is independently verified." With 26 of ~150 records carrying a fee check date, that cannot be shown. Reword to what is true: "Fees are checked against university portals; each page shows the check date."
- University schema description says "is a UGC DEB approved university" for every record, without session or programme scope. The brief's recognition pattern asks for entitlement by programme and session.

---

## 5. Structured data audit

**Inventory (sample):** every page carries site-level `Organization`, `WebSite`, `Person`. Profiles add `CollegeOrUniversity` + `BreadcrumbList` + `FAQPage` + `Course`. Hubs add `EducationalOccupationalProgram`. Spec pages add `Course`/`CourseInstance` + `FAQPage`. Blogs add `Article` with `datePublished`/`dateModified`. Tools and coupons add `HowTo`. `VideoObject` appears only where a YouTube iframe is on the page (checked `/compare/nmims-vs-symbiosis`).

### S1. Fabricated NAAC review on every university profile (Critical)

- **File:** `app/universities/[id]/page.tsx:134-182` (`NAAC_SCORE_MAP`, `naacRatingValue`, `UniversitySchema`).
- **What it does:** emits `review: { author: NAAC, reviewRating: { ratingValue } }`. No record has `naacScore` (0 of ~150), so every value is Edify's band midpoint (A++ becomes `3.88`) presented as NAAC's own rating. With a blank grade the map misses and the code falls back to `'3.0'`.
- **Live proof:** `https://edifyedu.in/universities/university-of-calicut-online` renders `"ratingValue":"3.0"` and `"reviewBody":"University of Calicut Online has been accredited by NAAC with Grade ."`. **19 indexed profiles** have a blank grade: Choudhary Charan Singh, Pt. Sundarlal Sharma Open, Calicut, Dr BR Ambedkar, Mohan Babu, Sri Venkateswara, Swami Rama Himalayan, Central University of Tamil Nadu and 11 more.
- **Why Critical:** it attributes a statement to a regulator that the regulator never made, and invents a score. This is the brief's "fabricated approval data" example. It also breaks Google's review-snippet policy, since NAAC accreditation is not a review.
- **Fix:** delete the `review` block. If NAAC must appear in schema, use `hasCredential` (`EducationalOccupationalCredential`, `recognizedBy: NAAC`) and only when a grade exists.
- **Acceptance:** `curl` of all 143 profiles finds no `"@type":"Review"` and no `ratingValue`.

### S2. University entity carries Edify's phone and URL (High)

- **Same file, lines 152-155:** `url` is the edifyedu.in page and `telephone` is `+91-7061285806` on the `CollegeOrUniversity` node. Live on NMIMS and Calicut.
- **Impact:** Google, Bing and AI systems can merge Edify's contact details into the university entity. That breaks entity clarity, one of the brief's GEO levers.
- **Fix:** remove `telephone`. Set `url` (or `sameAs`) to the university's official portal. Keep the edifyedu.in page as the `WebPage` whose `about` is the university.

### S3. FAQPage and HowTo everywhere (Low)

`FAQPage` appears on 45/45 sampled profiles, hubs, spec pages and blogs. Google has limited FAQ rich results to authoritative government and health sites since 2023, and dropped HowTo rich results. Neither is harmful when the questions are visible. Remove FAQ blocks only where they are filler (brief 3.4), not for schema reasons. `Course` on coupon pages describes an offer page as a course and should go.

---

## 6. AEO: question-to-page map

| Intent | Example query | Canonical page today | Direct answer present? | Gap |
|---|---|---|---|---|
| Validity | "is X online MBA valid" | `/verify/{slug}` (124) | Yes, a verdict line, with advisory override | Show DEB session and date checked in the verdict sentence |
| Fees | "X online mba fees" | `/universities/{u}/mba` hub | Fee shown; review blogs outrank hubs (2,216 impr/wk at pos 9.68) | Hub needs a 1-2 sentence total-payable answer above the fold, with check date |
| Eligibility | "online MBA eligibility" | `/programs/mba` + hub FAQ | Partial | One answer-first block per programme hub |
| Syllabus | "X mba syllabus" | spec pages (rich only) | Rich JSON only | 945 fallback pages carry no sourced syllabus |
| Comparison | "X vs Y online mba" | `/compare/{pair}` (41) | Table + verdict | Add "who each suits" line and session date |
| Recognition | "is UGC-DEB approval permanent" | `/methodology`, blogs | Yes | |
| Careers | "online MBA salary" | blogs | Mixed | Separate advertised from verified (brief 3.2) |

**Cannibalisation already known:** the fee-query gap (review blog vs fee hub) and the hub/blog title collision. Resolve by intent, as logged in memory, rather than adding pages.

---

## 7. GEO readiness and measurement plan

**Crawler policy (documented, unchanged):** `app/robots.ts` allows `*`, Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, CCBot and FacebookBot. Live tests with GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and bingbot user agents all returned 200, so Cloudflare does not block them. Training crawlers (GPTBot, CCBot) and search/retrieval agents (OAI-SearchBot, PerplexityBot) are treated the same. That is a business choice. Allowing both today is consistent with the citation goal. Note: `Google-Extended`, `Applebot-Extended`, `OAI-SearchBot`, `Claude-SearchBot` are not named, so they fall back to `*` (allowed).

**`llms.txt`:** present and current, but it is not a Google requirement and proves nothing (brief 4.3). Fix the claim in C3.

**Readiness:** discoverable yes. Entity clarity is weakened by S2. Source quality is weakened by C2. Freshness exists on templates, not on facts.

**Prompt panel (proposed, not run):**
- 60 prompts: 10 brand ("is edifyedu reliable"), 15 validity ("is {uni} online MBA UGC approved 2026"), 15 fees, 8 comparison, 6 eligibility, 6 career.
- Engines: ChatGPT (search on), Perplexity, Gemini, Copilot, Google AI Mode. Location India, logged out where possible.
- 3 runs per prompt per engine, monthly. Log date, product, exact wording, web-search flag, edifyedu.in mentioned / linked / primary source / absent, cited URL, competitor domains, and **factual fidelity** against the current page.
- Store as `audits/geo-panel/YYYY-MM.csv`. Report citation rate with its denominator. Also track Bing Webmaster Tools AI Performance.

---

## 8. Conversion and analytics

- One submission path (`lib/submitEnquiry.ts` to `/api/enquiry`) with channel, landing page and UTM on every lead (live since 12 Nov).
- `form_start` and `generate_lead` events fire from EnquiryModal, BlogSidebarWidgets, UniversityEndCta and DbaEnquiryForm.
- **Gap:** outcomes live in Sheets and never meet page attribution, so lead-to-enrolment by landing page cannot be computed. This is a process fix, not a code fix.
- **Not checked this session:** form behaviour on a phone viewport and the privacy-notice wording beside each form.

---

## 9. 30/60/90-day roadmap

| Window | Work | Effort | Depends on |
|---|---|---|---|
| **0-30** | S1: delete the NAAC `Review` block | XS | none |
| | S2: remove telephone, point `url`/`sameAs` at the official portal | S | official URL per uni (most exist in data) |
| | C3: reword `llms.txt` and the "UGC DEB approved university" description | XS | |
| | T1, T2, T3, T5 cleanups in one batch push | S | |
| | Decide the C1 policy (noindex / write / consolidate) from GSC Pages.csv | S | Rishi |
| **30-60** | C2: add provenance fields, render the fee check date, extend the fee gate | M | schema change in `lib/data.ts` |
| | C1: apply the chosen policy; write JSONs for the top 50 fallback specs by impressions | L | C1 decision |
| | AEO answer-first block on programme hubs (fees + eligibility) | M | C2 for dates |
| | Run GEO panel baseline #1 | S | |
| **60-90** | Extend rich JSON to MCA and BBA spec clusters | L | |
| | GEO panel #2; compare citation rate and fidelity | S | |
| | CWV field data by template from CrUX/PSI | S | |

---

## 10. Files likely to change (not changed)

- `app/universities/[id]/page.tsx` (S1, S2, C3 description)
- `app/robots.ts` (T2)
- `app/admin-login/page.tsx` or its layout (T1)
- `app/not-found.tsx` (T3)
- `next.config.js` CSP block near line 845 (T5)
- `public/llms.txt` (C3)
- `lib/data.ts`, `components/UniSpecBody.tsx`, `components/FeeBreakdown.tsx` (C2)
- `lib/seo/should-index.ts`, `app/sitemap.ts`, spec `generateMetadata()` (C1 if noindex is chosen)

## 11. Regression tests to add

- `scripts/check-schema-claims.mjs` (pre-commit): fail if any built HTML under `.next/server/app/universities` contains `"@type":"Review"` whose author is NAAC, or a `telephone` on a `CollegeOrUniversity` node. Per the detector rule, inject a known defect first and confirm it fails.
- `scripts/check-sitemap-integrity.mjs <sample>`: rerun `crawl.mjs` logic against production after each deploy (status 200, self-canonical, no noindex, one H1). Use `?cb=` to bypass the Cloudflare cache.
- `scripts/check-template-similarity.mjs`: shingle-Jaccard over N random indexable spec pages; fail above 0.40 across universities.
- Fee gate: also require `checkedOn` once C2 lands.

## 12. Limitations

- Live crawl was a stratified sample (361 of 2,301, at most 45 per template), not the full site.
- No Search Console, Bing Webmaster Tools, CrUX or PageSpeed data was pulled this session. Indexation counts, clicks and CWV are **not** reported here. The untracked `audits/gsc/` folder was not analysed.
- No AI prompt panel was run. Nothing here claims AI visibility or citation.
- Near-duplicate measurement used 9 pages. It shows the pattern clearly but is not a census.
- Code was read on branch `feat/batch-3-4`. Production may differ from this branch.
- Mobile layout and form UX were not rendered.

Scripts and raw output from this run: `crawl.mjs`, `sim.mjs`, `live/crawl.json`, `live/sitemap.xml` in the session scratchpad (temporary).
