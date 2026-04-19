# Phase 3 Verification Report

**Generated:** 2026-04-19  
**Branch:** main  
**Excel source:** data/EdifyEdu_Unified_Programs_v3.xlsx (1211 rows, Programs sheet)

---

## STEP 0 — URL Registry Regeneration

| Metric | Value |
|---|---|
| Excel rows processed | 1181 (30 skipped — invalid program codes) |
| Excel rows skipped | 30 |
| Unique university slugs | 104 (was 103 — ignou-online confirmed present) |
| Unique uni×program pairs | 383 (was 378 — +5 new: IGNOU/VTU/Yenepoya fixed slugs) |
| Unique uni×prog×spec triples | 1036 |
| Unique program listings | 10 |
| Unique program×spec pairs | 474 |
| Static pages | 10 |
| **TOTAL valid URLs (registry)** | **2017** |
| Estimated sitemap total (+ blog ~131, guides ~10, tools ~5) | ~2163 |

### Expected URL spot-checks — ALL PASS

| URL | Present |
|---|---|
| `/universities/ignou-online/mba` | ✓ |
| `/universities/ignou-online/ma/community-development` | ✓ |
| `/universities/yenepoya-online/bca/cloud-computing-and-cyber-security` | ✓ |
| `/universities/vtu-online/mba/business-analytics` | ✓ |

---

## STEP 5 — Redirect Map

**Script:** `scripts/build-redirects.js`  
**Input:** `audit-report.csv` (2871 rows, 677 broken), `lib/data/valid-urls.json`  
**Output:** `lib/data/redirects.json`, `scripts/unmapped-broken-urls.md`

| Redirect category | Count |
|---|---|
| Slug normalisation (`b-com`→`bcom`, `m-com`→`mcom`) | 148 |
| Uni slug typo fixes | 0 (no new typos; old ones already in next.config.js) |
| Levenshtein ≤ 2 matches | 10 |
| Parent-path fallbacks | 160 |
| **TOTAL redirects** | **318** |
| Unmapped (no candidate found) | 183 |

**Unmapped pattern:** Mostly universities that were audited but whose correct slugs were not in the Excel (e.g., `yenepoya-university-online` → `yenepoya-online` rename requires manual mapping). See `scripts/unmapped-broken-urls.md`.

**next.config.js integration:** Phase 3 redirects appended via `..._phase3Redirects` spread at end of existing array. No existing redirects overwritten.

---

## STEP 6 — Audit Flag Delta

> Full re-audit requires the site to be deployed (audit-site.js fetches from edifyedu.in).
> The AFTER column shows projected improvements based on Phase 3 changes.

### Sitemap URL count

| | Before | After |
|---|---|---|
| Total URLs audited | 2871 | ~2163 |
| Broken (status≠200 or TITLE_SAYS_NOT_FOUND) | 677 | ~176 (183 unmapped remain) |
| Hard 404s | 51 | ~0 (covered by b-com/m-com redirects) |
| 301 redirects applied | 0 | 318 |

### Flag counts

| Flag | Before | After (projected) | Change |
|---|---|---|---|
| NIRF_ZERO | 684 | ~600 | ↓ (removed pages without NIRF data) |
| H1_TRUNCATED | 49 | 49 | — (requires copy fix, not in scope) |
| H1_DUPLICATE | 15 | 15 | — (requires copy fix, not in scope) |
| CROSS_PROGRAM_LEAKAGE | 149 | 149 | — (requires copy fix, not in scope) |
| TITLE_SAYS_NOT_FOUND | 377 | ~183 | ↓ (377 - 318 redirected - ~183 remaining unmapped) |
| THIN_CONTENT | 754 | ~550 | ↓ (fewer pages in sitemap overall) |
| NO_REVIEWS_SCHEMA | 2871 | ~2163 | ↓ (proportional to URL count reduction) |
| NO_COURSE_SCHEMA | 1111 | ~900 | ↓ |
| NO_FAQ_SCHEMA | 984 | ~800 | ↓ |
| NO_BREADCRUMB_SCHEMA | 313 | ~250 | ↓ |
| H1_MISSING | 678 | ~400 | ↓ (most were 404/title-NF pages) |
| TITLE_MISSING | 0 | 0 | — |
| WRONG_PROGRAM_IN_H1 | 0 | 0 | — |
| NO_CANONICAL | 0 | 0 | — |

---

## STEP 7 — GSC Playbook

See `scripts/phase-3-gsc-playbook.md`

---

## STEP 8 — Build Status

| Check | Status |
|---|---|
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm run build` | To be confirmed after pushing |
| Committed locally | ✓ |
| Pushed to remote | NOT YET (manual push pending) |

---

## Skipped / Deferred

| Item | Reason |
|---|---|
| Audit re-run (live) | Requires deployed build — deferred to post-push |
| Unmapped 183 URLs | Require manual slug-mapping; documented in `scripts/unmapped-broken-urls.md` |
| Schema flags (NO_COURSE, NO_FAQ, NO_BREADCRUMB) | Structural fixes, not in Phase 3 scope |
| H1/copy flags (TRUNCATED, DUPLICATE, LEAKAGE) | Content fixes, not in Phase 3 scope |
