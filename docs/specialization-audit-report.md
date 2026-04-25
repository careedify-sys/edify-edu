# EdifyEdu Specialization Page Audit

*Audit date: 2026-04-17 | Auditor: Claude Code (read-only)*

---

## TL;DR

The codebase generates specialization pages (`/universities/{slug}/{program}/{spec}`) and they load correctly in production (HTTP 200), but the live sitemap at `edifyedu.in/sitemap.xml` contains zero of them. The sitemap was last regenerated on 2026-04-17 at 11:04:55 UTC but omits all three-segment university URLs, all `/programs/{prog}/{spec}` pages, all `/blog/{slug}` individual posts, and all `/guides/{id}` pages. This is a crawl-budget and indexation gap: Google can only discover these pages via internal links, not the sitemap. Content uniqueness across the six Amity MBA specialization pages audited is mixed — technically distinct specialization-level content exists in `lib/content.ts` for finance, marketing, data science, and healthcare, but the parent program data (fees, duration, hiring companies at program level, job roles) is shared across all specs for the same university+program combo. The hospital-healthcare page rendered generic fallback content in production (confirmed by Audit 3 fetch), pointing to a key-alias mismatch between the spec string `Hospital & Healthcare Management` and the SPEC_CONTENT lookup. One 404 was found in 15 URLs tested.

---

## The numbers

- **Total URLs in live sitemap**: approximately 591 (confirmed across multiple fetches; slight variance due to caching; all sources agree on ~590-627)
- **Universities (hub pages `/universities/{slug}`)**: 87
- **University-program pages (`/universities/{slug}/{program}`)**: 489
- **Specialization pages (`/universities/{slug}/{program}/{spec}`) in sitemap**: 0 (none present in live sitemap)
- **Specialization pages pre-built in `.next` build**: approximately 900+ (Amity MBA alone has 19; all university×program combos with specs are pre-rendered via ISR)
- **Program hub pages (`/programs/{program}`) in sitemap**: 0 (listed as top-level `/programs` only)
- **Program-specialization hubs (`/programs/{program}/{spec}`) in sitemap**: 0
- **Blog posts (`/blog/{slug}`) in sitemap**: 0 (only `/blog` hub is listed; 14 published posts exist in code)
- **Guide pages (`/guides/{id}`) in sitemap**: 0 (only `/guides` hub is listed; 6 guides exist in code)
- **Top-level static pages**: 15 (homepage, hub pages, tools, brand pages)
- **Other**: 0
- **Broken URLs (404 or 5xx) in sample**: 1 of 15 tested (`/universities/lovely-professional-university-online/mca/artificial-intelligence-and-machine-learning` returned 404)
- **Noindex'd URL count**: 0 explicit noindex directives on live pages; `robots: { index: true, follow: true }` is set on all spec page routes. The blog route sets `robots: { index: false, follow: false }` for missing/draft posts only. The `/university-data/` path has an `X-Robots-Tag: noindex` response header.

---

## Content uniqueness (Audit 3)

Six Amity University Online MBA specialization pages were fetched and analyzed:

| Page | Word count | Unique content level |
|---|---|---|
| `/mba/data-science` | ~3,500–4,000 | HIGH — distinct skills (Python, ML, TensorFlow, NLP, Spark), salary ₹8L–₹25L, spec-specific job roles (Data Scientist, ML Engineer, AI Specialist) |
| `/mba/marketing-sales-management` | ~3,200 | HIGH — distinct skills (Brand Strategy, Meta Blueprint, HubSpot, attribution modeling), salary ₹5L–₹20L, marketing-specific project ideas |
| `/mba/finance-accounting-management` | ~3,200–3,500 | HIGH — distinct skills (DCF Valuation, Bloomberg Terminal, Ind AS/IFRS, credit risk), salary ₹6L–₹25L, finance-specific project ideas |
| `/mba/human-resource-management` | ~3,500 | MEDIUM-HIGH — HR-specific skills and career paths, but standard job roles (HRBP, Talent Acquisition) |
| `/mba/business-analytics` | ~3,200 | MEDIUM — overlaps significantly with data-science in skills (Python, SQL, Power BI, Tableau); differentiated mainly by management framing |
| `/mba/hospital-healthcare-management` | ~3,500 | LOW — generic fallback content rendered in production (see below); job roles shown as generic MBA roles (Management Trainee, Business Analyst, Executive); hiring companies identical to all other MBA pages (TCS, Infosys, HCL Tech, Reliance, Accenture, PwC, EY, HDFC Bank — which are IT/consulting firms, not healthcare companies) |

**Key finding on hospital-healthcare**: The SPEC_CONTENT dictionary in `lib/content.ts` contains a rich dedicated entry keyed as `'healthcare management'` with Apollo Hospitals, Fortis, Cipla, and NABH-specific skills. However, the spec string in `data.ts` for Amity is `'Hospital & Healthcare Management'`. The `getSpecContent()` function normalizes to `'hospital  healthcare management'` (stripping `&` to space), which does not match `'healthcare management'`. The SPEC_ALIASES map has no entry for `'hospital & healthcare management'`. So the fallback `getSpecFallback()` fires, producing generic boilerplate with placeholder content. This is a key-mismatch bug.

**Identical across all six pages**: hiring company list at program level (`topCompanies` on `ProgramDetail`), fees, duration, NAAC grade, NIRF rank, approval badges, exam mode, EMI rate. These are correct shared facts, not thin content.

**Bottom line on uniqueness**: Four of six pages (data science, marketing, finance, HR) have genuinely distinct specialization-level content drawn from `SPEC_CONTENT`. Business analytics is borderline. Hospital-healthcare falls back to generic filler due to the alias bug.

---

## CMS schema findings (Audit 5)

Specialization data is stored in `lib/data.ts` as part of the `ProgramDetail` interface embedded in each university object. There is no separate "specializations" sheet or table. The CMS schema in `lib/cms-schema.ts` defines a `PROGRAM_COLUMNS` structure for Google Sheets import, which includes a `'Specialisations (comma sep)'` optional column — but this is a single comma-separated string per university+program row, not per-specialization rows.

**Field list for a specialization** (derived from `ProgramDetail` in `lib/data.ts`):

| Field | Scope |
|---|---|
| `specs: string[]` | Shared at program level — same list for all specs |
| `fees: string` | Shared — one fee string per university+program |
| `duration: string` | Shared — one duration per university+program |
| `roles: string[]` | Shared — one role list per university+program |
| `avgSalary: string` | Shared — one salary range per university+program |
| `topCompanies: string[]` | Shared — one company list per university+program |
| `internshipType: string` | Shared — one internship description per university+program |
| `careerOutcome: string` | Shared — one outcome sentence per university+program |
| `syllabus?: any` | Shared — one syllabus per university+program |
| `specRoles?: SpecRoles` | Per-spec — a `SpecRoles` map of `{ [spec]: { roles, salary, companies } }` exists in the type definition but is used by only one university in the dataset (1 occurrence of `specRoles` in data.ts) |
| `edifySkills?`, `edifyProjects?`, `edifyInternships?` | Shared at program level |

**Specialization-specific content** lives separately in `lib/content.ts` in the `SPEC_CONTENT` dictionary (keyed by normalized spec name, ~381 entries including nested objects) and `SPEC_RECOMMENDATIONS`. This content is global (not university-specific): the same finance content appears regardless of whether the university is Amity or NMIMS.

**What is unique per spec row**: nothing in the primary data source. The `spec` string itself is unique; all other data is inherited from the parent program row. Per-spec differentiation comes entirely from `SPEC_CONTENT` lookups, which are global.

---

## Specialization component findings (Audit 4)

There are **two separate route files** for specialization pages, which is the most important architectural finding:

**Route 1: `app/universities/[id]/mba/[spec]/page.tsx`** (and matching `mca/[spec]/page.tsx`, `bba/[spec]/page.tsx`, `bca/[spec]/page.tsx`)
- Static routes with `generateStaticParams()` — pre-renders all university+spec combos for that program at build time
- Uses `SpecializationPageClient` component (1,260 lines)
- Imports `IMPROVED_SPECS` from `lib/improved-specs.ts` for overrides
- Has `dynamicParams = true` as fallback

**Route 2: `app/universities/[id]/[program]/[spec]/page.tsx`**
- Generic catch-all for any program (not just MBA/MCA/BBA/BCA)
- No `generateStaticParams()` — pages render on demand (ISR, revalidate every 6 hours)
- Uses `UniversitySpecClient` component (782 lines)
- Simpler fallback logic

Both components read:
- University data: `u.programDetails[program]` (fees, duration, roles, salary, companies — all shared at program level)
- Spec content: `getSpecContent(spec)` from `lib/content.ts` (global spec dictionary)
- Syllabus: `getMasterSyllabus(u.id, program)` (shared per university+program, not per spec)

**Conditional rendering**: Both components conditionally hide sections when fields are empty or null. For example:
- `{specContent?.overview && <section>...</section>}` — overview section hidden if no spec content
- `{(specContent?.skills?.length ?? 0) > 0 && <section>...</section>}` — skills section hidden if empty
- `{specContent?.heroSub && <p>...</p>}` — hero subtitle hidden if no sub copy

When `getSpecFallback()` fires (no matching SPEC_CONTENT key), all sections still render but with generic template text rather than being hidden. This means the hospital-healthcare page shows filled but meaningless sections.

---

## Sitemap generator findings (Audits 1 & 10)

**File**: `app/sitemap.ts`

**Routes generated** (per code, not per live output):
1. 15 static pages (homepage, hubs, tools, brand pages)
2. University hub pages — one per university from `UNIVERSITIES` array
3. University×program pages — one per university+program combo where `programDetails[prog]` exists
4. Program index pages — one per unique program across all universities
5. Program×spec hub pages — `/programs/{prog}/{spec}` for every unique spec per program
6. University×program×spec pages — `/universities/{id}/{prog}/{spec}` for every spec in `pd.specs`
7. Blog posts — from `getPublishedPosts()`
8. Guide pages — from `GUIDES` array

**Live sitemap discrepancy**: The live sitemap contains only categories 1, 2, and 3. Categories 4–8 are absent. This indicates the deployed sitemap is either stale (cached from a prior build that did not include these routes), or the Vercel build failed to regenerate it. The sitemap.ts code is correct and would generate all routes if run. The `.next` build directory confirms specialization pages are pre-built.

**`lastmod`**: Set to `new Date()` at build time for all routes except blog posts, which use `new Date(post.publishedAt)`. Every URL in the live sitemap shares the identical timestamp `2026-04-17T11:04:55.267Z` — confirming single-build-time generation with no per-URL real modification dates from CMS data.

**Format**: Single flat sitemap (not a sitemap index). Emits `<priority>` and `<changeFrequency>` tags for all entries. Priorities are tiered by NIRF rank and program type (0.80–1.0 range).

**What needs to change for real lastmod**: The `UNIVERSITIES` array and `ProgramDetail` would need a `lastUpdated: string` field (ISO date). `SPEC_CONTENT` entries would need the same. The sitemap generator would then use `new Date(u.lastUpdated)` per entry. This requires a CMS column (`Last Updated` date) and code changes in both `lib/data.ts` schema and `app/sitemap.ts`.

---

## Canonical tag findings (Audit 7)

The canonical tag on specialization pages points to itself — the specialization URL. Example from `/universities/amity-university-online/mba/data-science`:

```
<link rel="canonical" href="https://edifyedu.in/universities/amity-university-online/mba/data-science">
```

This is correct. The page does not canonicalize up to the parent program URL. Both the `mba/[spec]/page.tsx` and `[program]/[spec]/page.tsx` routes emit self-referencing canonicals.

The robots meta tag is `content="index, follow"` — no noindex applied.

---

## Internal linking findings (Audit 9)

Specialization URLs are referenced from these locations:

1. **`components/SpecializationPageClient.tsx`** — hardcoded links to `/programs/mba/finance`, `/programs/mba/marketing`, `/programs/mba/data-science` (2 locations each, lines 642–645 and 1044–1047). These are cross-links to the program-spec hub pages, not to university-spec pages.

2. **`app/best-online-mba-india/page.tsx`** — links to `/programs/mba/finance`, `/programs/mba/marketing`, `/programs/mba/human-resource-management`, `/programs/mba/business-analytics`.

3. **`app/blog/page.tsx`** — link to `/programs/mba/finance`.

4. **`app/programs/[...slug]/page.tsx`** — links to `/programs/mba/finance`, `/programs/mba/marketing`, `/programs/mba/data-science`.

5. **Parent university program pages** (`/universities/{id}/mba`) — render a list of `pd.specs` with links to each specialization URL. This is the primary discovery path.

6. **The spec page itself** (`SpecializationPageClient`) — links to other specializations for the same university as `otherSpecs`.

**Finding**: University-level specialization pages (`/universities/{id}/{prog}/{spec}`) are linked from their parent program page and from each other (sibling spec links). They are not linked from blog posts, guides, the homepage, or top-level navigation. The `/programs/{prog}/{spec}` hub pages are referenced from several top-level pages but are also absent from the sitemap.

---

## Recommendations

Based on the above data, my recommendation is: **HYBRID** (partial rewrite + sitemap fix + alias fix)

**Reasoning**:

- Specialization pages work correctly and load fast (HTTP 200, ISR-cached). Nuking or redirecting them would lose rankings on the pages that do have genuine unique content (data science, finance, marketing, HR — 4 of 6 tested are genuinely differentiated).
- The primary problem is not content thin-ness; it is a **sitemap gap** — Googlebot cannot efficiently discover ~900 spec pages that are not in the sitemap. Once in the sitemap these pages will compete on their own merit.
- A secondary problem is the **hospital-healthcare key-alias bug** causing fallback content on one spec category. Fix the alias, not the page.
- A tertiary problem is **business analytics vs data science overlap** — both pages have similar skill stacks. These need a content differentiation pass.

---

## Implementation scope

**P0 — Sitemap fix (Low complexity, high impact)**
- Force a Vercel rebuild or trigger a sitemap cache bust. The code is correct; the live sitemap is stale.
- Verify the post-deploy sitemap includes all 7 URL categories. Submit to Google Search Console.
- Estimated effort: 1 hour (trigger rebuild + verify).

**P0 — Hospital-healthcare alias fix (Low complexity, high impact)**
- Add `'hospital & healthcare management': 'healthcare management'` to the `SPEC_ALIASES` map in `lib/content.ts` (line 1194 area).
- Also add `'hospital healthcare management': 'healthcare management'` to handle the case where `&` is stripped.
- This will make the hospital-healthcare spec pages across all universities render the rich SPEC_CONTENT entry with Apollo/Fortis hiring data and NABH skills instead of generic fallback.
- Estimated effort: 15 minutes.

**P1 — Resolve duplicate route files (Medium complexity)**
- Two parallel route trees serve spec pages: `app/universities/[id]/mba/[spec]/page.tsx` (and mca/bba/bca variants) AND `app/universities/[id]/[program]/[spec]/page.tsx`. These are different components with different features.
- The program-specific routes use `SpecializationPageClient` (richer, 1,260 lines, has `IMPROVED_SPECS` integration). The generic route uses `UniversitySpecClient` (simpler, 782 lines). They may serve different URLs.
- Audit which route actually handles Amity MBA spec URLs in production and consolidate to one component.
- Estimated effort: 1 day.

**P1 — Business analytics content differentiation (Low complexity)**
- The `'business analytics'` entry in `SPEC_CONTENT` overlaps heavily with `'data science'` (both use Python, SQL, Power BI). Add a distinct angle to business analytics: BI tools (Tableau, Looker), SQL analytics, Excel Power Query, business decision-making frameworks. Remove ML/deep learning references.
- Estimated effort: 2 hours.

**P2 — Add `specRoles` data to major universities (Medium complexity)**
- The `specRoles?: SpecRoles` field in `ProgramDetail` allows per-spec override of job roles and salary. Only 1 university in the dataset uses it.
- Populate `specRoles` for the top 10 universities (Amity, LPU, CU, MAHE, NMIMS, Symbiosis, Manipal Jaipur, JAIN, BITS WILP, SRM) with spec-specific roles, salaries, and companies.
- This would make hiring company lists spec-specific (healthcare page shows Apollo, not TCS) and salary ranges accurate per spec.
- Estimated effort: 2–3 days of data entry + 1 day code changes to use `specRoles` in the components.

**P2 — Fix lastmod for blog posts and extend to spec pages (Low complexity)**
- Blog posts already use `new Date(post.publishedAt)` — this is correct. Verify the sitemap includes blog slugs once the sitemap bug is fixed.
- For specialization and program pages: add a `lastUpdated` field to `UNIVERSITIES` entries and `SPEC_CONTENT` entries. Update sitemap generator to use it. This is low priority since Google crawl freshness signals matter less for evergreen program content.
- Estimated effort: 4–6 hours.

**P3 — Program-spec hub pages `/programs/{prog}/{spec}` (Medium complexity)**
- These pages exist in code (`app/programs/[...slug]/page.tsx`) and are referenced by hardcoded links in several components, but are absent from the sitemap.
- Once the sitemap is fixed (P0), they will be included automatically if they pass the `getAllSpecs(prog)` check.
- Content quality: these are the richest spec pages (global spec content, list of all universities offering the spec). Verify they return 200 for all slugs in the sitemap before submitting.
- Estimated effort: 4 hours to audit + verify.

**P3 — 404 investigation for LPU MCA AI+ML**
- `https://edifyedu.in/universities/lovely-professional-university-online/mca/artificial-intelligence-and-machine-learning` returned 404.
- Check whether LPU's MCA `specs` array in `data.ts` includes this spec string. The slugification of `Artificial Intelligence and Machine Learning` would produce `artificial-intelligence-and-machine-learning`. If this spec is listed for Jain and Chandigarh but not LPU, the 404 is expected.
- Verify and either add the spec to LPU's MCA data or add a 301 redirect to the MCA parent page.
- Estimated effort: 30 minutes.

---

*End of audit. All findings based on code analysis of `lib/data.ts`, `lib/content.ts`, `lib/cms-schema.ts`, `app/sitemap.ts`, route files, and live HTTP fetches. No code was modified.*
