# EdifyEdu Codebase Map
**Read this first before touching any file.**
Stack: Next.js 14 App Router · TypeScript · Tailwind · Vercel

> **CMS is not in use. Do not touch anything in `app/admin/`, `app/api/cms/`, `app/api/generate-blog/`, `app/api/publish-to-github/`, or `app/blog/write/`. Ignore them completely.**

---

## 1. URL → File Map (every live route)

| Live URL | File |
|---|---|
| `/` | `app/page.tsx` |
| `/universities` | `app/universities/page.tsx` |
| `/universities/[id]` | `app/universities/[id]/page.tsx` |
| `/universities/[id]/mba` | `app/universities/[id]/mba/page.tsx` |
| `/universities/[id]/mca` | `app/universities/[id]/mca/page.tsx` |
| `/universities/[id]/bba` | `app/universities/[id]/bba/page.tsx` |
| `/universities/[id]/bca` | `app/universities/[id]/bca/page.tsx` |
| `/universities/[id]/[prog]` | `app/universities/[id]/[program]/page.tsx` ← BA, B.Com, M.Com, MA, MSc, BSc |
| `/universities/[id]/mba/[spec]` | `app/universities/[id]/mba/[spec]/page.tsx` |
| `/universities/[id]/mca/[spec]` | `app/universities/[id]/mca/[spec]/page.tsx` |
| `/universities/[id]/bba/[spec]` | `app/universities/[id]/bba/[spec]/page.tsx` |
| `/universities/[id]/bca/[spec]` | `app/universities/[id]/bca/[spec]/page.tsx` |
| `/universities/[id]/[prog]/[spec]` | `app/universities/[id]/[program]/[spec]/page.tsx` ← all other programs |
| `/programs` | `app/programs/page.tsx` |
| `/programs/mba` | `app/programs/[...slug]/page.tsx` (slug[0]='mba', no slug[1]) |
| `/programs/mba/finance` | `app/programs/[...slug]/page.tsx` (slug[0]='mba', slug[1]='finance') |
| `/blog` | `app/blog/page.tsx` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` |
| `/compare` | `app/compare/page.tsx` |
| `/compare/[pair]` | `app/compare/[pair]/page.tsx` |
| `/fees` | `app/fees/page.tsx` |
| `/coupons` | `app/coupons/page.tsx` |
| `/coupons/[slug]` | `app/coupons/[slug]/page.tsx` |
| `/guides` | `app/guides/page.tsx` |
| `/guides/[id]` | `app/guides/[id]/page.tsx` |
| `/tools` | `app/tools/page.tsx` |
| `/tools/emi-calculator` | `app/tools/emi-calculator/page.tsx` |
| `/tools/cgpa-calculator` | `app/tools/cgpa-calculator/page.tsx` |
| `/tools/cgpa-calculator/[value]` | `app/tools/cgpa-calculator/[value]/page.tsx` |
| `/tools/percentage-to-gpa` | `app/tools/percentage-to-gpa/page.tsx` |
| `/best-online-mba-india` | `app/best-online-mba-india/page.tsx` |
| `/verify` | `app/verify/page.tsx` |
| `/verify/[slug]` | `app/verify/[slug]/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/privacy-policy` | `app/privacy-policy/page.tsx` |

---

## 2. The University Data Pipeline

```
lib/data.ts          ← UNIVERSITIES[] array — the master database. 131 universities.
  ↓
lib/data-slim.ts     ← UNIS_SLIM[] lightweight version for client components
lib/data-client.ts   ← PROGRAM_META, client-safe constants
lib/data-server.ts   ← server-only helpers
lib/data/programs.ts ← getProgramSpecParams(), resolveSpecName() — generates static params for spec pages
lib/data/valid-urls.json ← sitemap registry (~3,366 URLs, filtered at build time by app/sitemap.ts)
```

**To add/edit a university:** edit `lib/data.ts` → find the university in `UNIVERSITIES[]`.

**To add/edit fees:** also update `data/fees-hub-data.json` (used by `/fees` page separately).

**Key functions in `lib/data.ts`:**
- `getUniversityById(id)` — look up any university by slug
- `getUniversitiesByProgram(program)` — all unis offering MBA, MCA, etc.
- `getAllSpecs(program)` — all specializations for a program
- `specSlug(s)` / `specName(s)` — convert SpecValue ↔ slug/display name

---

## 3. Rich Spec Page Content (the 304 pages)

```
lib/data/page-content/
  {uni-id}-{program}-{spec-slug}.json   ← 348 files, all currently MBA
  e.g. amity-university-online-mba-finance-and-accounting-management.json
```

**Schema:** `lib/data/page-content-schema.ts`
**Reader:** `lib/data/page-content.ts` → `getSpecPageContent(uniSlug, program, specSlug)`

- File exists → page renders rich 12-section layout + `robots: index`
- File missing → page renders generic fallback + `robots: noindex, follow`

**This check runs in every spec page's `generateMetadata()`. Never remove it.**

---

## 4. Page Components (what renders on each page)

### University pages
| Component | Used by | What it does |
|---|---|---|
| `UniSpecBody` | all `[id]/*/[spec]/page.tsx` | Full spec page — rich layout if JSON exists, generic fallback if not |
| `UniProgramBody` | `[id]/[program]/page.tsx` | Program listing for one university |
| `UniHero` | `UniSpecBody` | Top hero section with name, fees, NAAC badge |
| `SchemaBlock` | `UniSpecBody` | JSON-LD structured data injection |
| `FeeBreakdown` | `UniSpecBody` | Per-semester fee table |
| `SectionSyllabus` | `UniSpecBody` | Semester-wise syllabus |
| `ReviewsBlock` | `UniSpecBody` | Student reviews (from spec JSON) |
| `ComparisonTable` | `UniSpecBody` | Side-by-side competitor comparison |
| `HonestVerdict` | `UniSpecBody` | "Should you enrol?" honest editorial |
| `RedFlagsBlock` | `UniSpecBody` | Warnings/red flags |
| `FAQBlock` | `UniSpecBody` | FAQ accordion with schema |

### Program hub pages
| Component | Used by | What it does |
|---|---|---|
| `MBAHubClient` | `/programs/mba` | Full MBA hub with tabs, filters, uni list |
| `MBASpecHubClient` | `/programs/mba/[spec]` | MBA specialization hub |
| `ProgramHubClient` | `/programs/mca`, `/programs/bba` etc. | Generic program hub for non-MBA |
| `ProgramPageClient` | program pages | Filterable university list within a program |

### Lead capture / CTA
| Component | Purpose |
|---|---|
| `EnquiryModal` / `EnquiryModalDynamic` | Pop-up lead form → Formspree `mojpvgwz` |
| `StickyLeadCard` | Right-sidebar lead card on spec pages |
| `FloatingCTA` | Fixed bottom CTA button |
| `InlineCTA` | Mid-page CTA block |
| `BlogCTACard` / `BlogLeadForm` | Blog-specific lead CTAs |
| `LeadCapture` | Generic inline form |

### Nav / Shell
| Component | Purpose |
|---|---|
| `Navbar` | Top nav. Desktop + mobile. Links: Universities, Compare, Fees, Guides, Verify |
| `Footer` | Site footer |
| `BottomNav` | Mobile sticky bottom nav |
| `WhatsAppFloat` | WhatsApp floating button |

---

## 5. Content & Data Libraries

| File | What's in it |
|---|---|
| `lib/content.ts` | `getSpecContent(key)` — generic spec descriptions for thin pages and program hubs |
| `lib/blog.ts` | `getPublishedPosts()` — reads blog posts from the file system |
| `lib/guides.ts` | `GUIDES[]` — 9 evergreen guides |
| `lib/coupons.ts` | `COUPONS[]` — discount coupon data + helpers |
| `lib/coupon-pages.ts` | `COUPON_PAGE_SLUGS`, `COUPON_PAGES[]` — 14 coupon landing pages |
| `lib/syllabus.ts` | `getSyllabus()` — per-uni per-program semester data |
| `lib/specMapping.ts` | `getCanonicalSpec()` — maps alias spec slugs to canonical |
| `lib/specFaqs.ts` | `getSpecFAQs()` — FAQ content for spec hub pages |
| `lib/seo-title.ts` | `clampTitle()`, `clampDescription()`, `getTitleName()`, `compactFee()` — all title/meta builders |
| `lib/format.ts` | `getShortUniversityName()` and other display formatters |
| `lib/mba-data.ts` | MBA-specific editorial data |
| `lib/reviews-data.ts` | Student review snippets |
| `lib/redirects.json` | Slug redirect map loaded by middleware |
| `lib/site-config.ts` | Site-wide constants (BASE_URL, etc.) |

---

## 6. SEO & Sitemap

| File | Purpose |
|---|---|
| `app/sitemap.ts` | Generates sitemap.xml. Reads `valid-urls.json`, filters thin pages, adds blog/tools/coupons. |
| `lib/data/valid-urls.json` | Registry of ~3,366 URLs. Source of truth for uni/program/spec URLs. |
| `app/robots.ts` | robots.txt generation |
| `middleware.ts` | Handles slug redirects (reads `lib/redirects.json`) |

**Sitemap filtering rules (in `app/sitemap.ts`):**
- `/programs/[prog]/[spec]` → always excluded (598 thin hub pages, noindexed)
- `/universities/[id]/[prog]/[spec]` without a spec JSON → excluded (1,819 thin pages, noindexed)
- Everything else → included

**Priority tiers:**
- `1.0` homepage
- `0.92` /universities, /programs, /compare
- `0.90` /programs/[prog] hubs, /best-online-mba-india
- `0.85` blog posts, coupon pages, /fees
- `0.80` uni hubs, /tools
- `0.75` uni/prog pages
- `0.70` uni/prog/spec WITH JSON, guides, CGPA value pages

---

## 7. API Routes (active ones)

| Route | Purpose |
|---|---|
| `POST /api/leads` | Save lead to Supabase + Formspree |
| `POST /api/enquiry` | Enquiry form handler |
| `POST /api/events` | Analytics events (page views, CTA clicks) |
| `GET /api/universities` | JSON list of universities |
| `POST /api/revalidate` | ISR revalidation trigger |
| `GET /api/verify/log` | University verification log |

---

## 8. Data Files

| File | Purpose |
|---|---|
| `data/fees-hub-data.json` | 130-university fee dataset for `/fees` page |
| `data/university_descriptions.json` | Long-form university descriptions |
| `data/naac-official-2025.tsv` | NAAC grade reference |
| `lib/data/programs-manifest.json` | Spec params for static generation (Node scripts only — never hand-edit) |
| `lib/data/syllabus-manifest.json` | Syllabus data manifest |
| `lib/data/logos-manifest.json` | University logo paths |

---

## 9. Where to Go to Fix Common Things

| Task | Where to look |
|---|---|
| Fix a university's name, fees, NAAC, NIRF | `lib/data.ts` → find in `UNIVERSITIES[]` |
| Add a new university | `lib/data.ts` → add to `UNIVERSITIES[]`, then `data/fees-hub-data.json` |
| Fix a spec page title or meta | `app/universities/[id]/mba/[spec]/page.tsx` → `generateMetadata()` |
| Add/edit rich spec page content | `lib/data/page-content/{uni-id}-{prog}-{spec}.json` |
| Fix noindex on a spec page | Check `lib/data/page-content/` — if JSON missing, page is always noindexed |
| Add a blog CTA | `lib/university-blog-cta.ts` or `components/blog-cta/` |
| Edit navbar links | `components/Navbar.tsx` (desktop ~line 355, mobile ~line 493) |
| Add/change a redirect | `lib/redirects.json` or `middleware.ts` |
| Fix the sitemap | `app/sitemap.ts` |
| Edit fee comparison page | `app/fees/page.tsx` + `components/FeesTableClient.tsx` + `data/fees-hub-data.json` |
| Edit coupon pages | `lib/coupon-pages.ts` (data) + `app/coupons/[slug]/page.tsx` (template) |
| Edit a guide | `lib/guides.ts` (data) + `app/guides/[id]/page.tsx` (template) |
| Fix the compare tool | `app/compare/page.tsx` + `components/CompareClient.tsx` |
| Fix the EMI calculator | `app/tools/emi-calculator/page.tsx` |
| Edit CGPA calculator values | `app/tools/cgpa-calculator/[value]/data.ts` |
| Fix lead form endpoint | Search `mojpvgwz` → `components/EnquiryModal.tsx` |

---

## 10. Key Invariants (must always be true)

1. **`lib/data.ts` is the master university database.** Never write university data anywhere else.

2. **Spec pages check JSON before indexing.** `getSpecPageContent()` in each `generateMetadata()` controls `robots`. Adding a new spec JSON file auto-indexes the page on next deploy.

3. **`valid-urls.json` is the sitemap source.** Regenerate with `npm run build:urls` when adding universities or programs. Do not hand-edit it.

4. **`programs-manifest.json` is written by Node scripts only.** Never Python, never hand-edit.

5. **Lead form endpoint is `https://formspree.io/f/mojpvgwz`.** Do not change without updating all references.

6. **NIRF ranks must state category** on MBA pages. `nirf` = University rank, `nirfMgt` = Management rank.

7. **Supabase is source of truth for NAAC/NIRF/AICTE/AACSB values.** Cross-check `lib/supabase/server.ts` before committing those values.

8. **Never use em dashes (—) in any content.**

9. **Thin spec pages (no JSON) are noindexed.** Do not remove the `getSpecPageContent` check from any spec page `generateMetadata()`.

10. **Do not touch the CMS.** `app/admin/`, `app/api/cms/`, `app/blog/write/` are not in use.
